// scripts/sync-bell-served.mjs — write apps/site/data/bell-served.json from the files the Bell host SERVES (lot
// BELL-SERVED-1). Node 24, built-ins + apps/bell/scripts/bell-chain.mjs only. SOURCE-REPO tool (not exported, like
// scripts/sync-bell-anchors.mjs); run by the orchestrator BEFORE a storefront build:  node scripts/sync-bell-served.mjs
//
// What it does, and nothing else: two GETs on the Bell host (https only, a redirect is refused, 200 only, body bounded)
// — /timeline.jsonl and /bell/pubkey.json — then FAIL-CLOSED checks before any write:
//   - the served key set is byte-identical to the committed keyring apps/bell/keys/bell-keyring.json (the trust root,
//     ADR-T1b-backend D9 C-9; the served key is only a cross-checked channel);
//   - the FIRST timeline line is schema bell-timeline-v1, seq 1, kind publication, chained from GENESIS, and its
//     Ed25519 signature checks under a committed keyring key whose key_id it names (bell-chain.mjs verifyLine).
// It writes ONLY: the host, the read time, the first line's seq, published_at, line_hash (sha256 of its canonical
// bytes, ADR-T1b-backend D6) and key_id, and the sha256 of the two bodies as read. Nothing else of the line is copied
// (its runs carry counts and a coverage ratio, which the site does not render), and no market value is read at all.
// Output: LF, two-space JSON; it prints the CRLF->LF sha256 to set in apps/site/data/manifest.sha256.json.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { GENESIS, lineHash, verifyLine, publicKeyOfJwk, keyIdOf } from "../apps/bell/scripts/bell-chain.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BELL_HOST = "https://bell.monarkgate.tech";
export const OUT_REL = "apps/site/data/bell-served.json";
const KEYRING_REL = "apps/bell/keys/bell-keyring.json";
const MAX_BYTES = 1024 * 1024; // the publisher's MAX_LINE_BYTES (bell-verify VERIFY_BOUNDS); the first line and the key set fit well under it
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const fail = (why) => { console.error(`sync-bell-served: FAIL-CLOSED — ${why}; nothing written.`); process.exit(1); };

async function get(path) {
  const res = await fetch(`${BELL_HOST}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) fail(`GET ${path} answered ${String(res.status)} (200 only, no redirect followed)`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) fail(`GET ${path} body size ${String(buf.length)} out of bounds`);
  return buf;
}

async function main() {
  const timeline = await get("/timeline.jsonl");
  const pubkey = await get("/bell/pubkey.json");
  const readAt = new Date().toISOString();
  const committed = readFileSync(join(ROOT, KEYRING_REL));
  if (!pubkey.equals(committed)) fail("the served /bell/pubkey.json is not byte-identical to the committed keyring");
  const keyring = JSON.parse(committed.toString("utf8"));
  const first = JSON.parse(timeline.toString("utf8").split("\n")[0] ?? "");
  if (first.schema !== "bell-timeline-v1" || first.seq !== 1 || first.kind !== "publication") fail("the first timeline line is not a bell-timeline-v1 publication at seq 1");
  if (first.prev_line_hash !== GENESIS) fail("the first timeline line is not chained from GENESIS");
  if (typeof first.published_at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(first.published_at)) fail("published_at is not an ISO UTC instant");
  const key = (keyring.keys ?? []).find((k) => k.key_id === first.key_id);
  if (key === undefined) fail("the first line names a key_id absent from the committed keyring");
  const pk = publicKeyOfJwk(key.jwk);
  if (keyIdOf(pk) !== first.key_id) fail("the committed key does not hash to the key_id it is filed under");
  if (!verifyLine(first, pk)) fail("the first line's Ed25519 signature does not check under the committed key");
  const out = {
    $comment:
      "Committed, hashed facts about the SERVED Bell host, rendered by /bell and /bell/method through apps/site/lib/bell-served-load.ts after a sha256 check against apps/site/data/manifest.sha256.json (lot BELL-SERVED-1; decision 155). Written by scripts/sync-bell-served.mjs (source-repo tool) from two GETs: /timeline.jsonl and /bell/pubkey.json, after checking that the served key set equals the committed keyring and that the first line is a signed, genesis-chained publication at seq 1 under that keyring. first_record = that first line's seq, published_at, line_hash (sha256 of its canonical bytes) and key_id; bodies_sha256 = the sha256 of the two bodies as read at read_at (the timeline body grows with each publication; the first line does not change). No other field of the line is copied and no market value is read.",
    schema: "monark-site-bell-served-v1",
    host: BELL_HOST,
    read_at: readAt,
    first_record: { seq: first.seq, published_at: first.published_at, line_hash: lineHash(first), key_id: first.key_id },
    bodies_sha256: { "/timeline.jsonl": sha256(timeline), "/bell/pubkey.json": sha256(pubkey) },
  };
  const text = JSON.stringify(out, null, 2) + "\n";
  writeFileSync(join(ROOT, OUT_REL), text);
  console.log(`sync-bell-served OK — ${OUT_REL} written (first record seq ${String(first.seq)}); manifest sha256 (CRLF->LF): ${sha256(Buffer.from(text.replace(/\r\n/g, "\n"), "utf8"))}`);
}

await main();
