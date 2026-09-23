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
  const stateBuf = await get("/state.json");
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
  // The served state must be the one the signed head line names (sha256 binding), and the FIRST run of the first
  // publication is copied as it is served: window, per-session fills / on-chain VWAP / base volume / abstention,
  // non-zero residual counts. Strings stay strings (vwap, volumeBase); no value is recomputed or rounded here.
  if (sha256(stateBuf) !== first.state_sha256) fail("the served /state.json is not the state the signed head line names");
  const state = JSON.parse(stateBuf.toString("utf8"));
  if (state.schema !== "bell-public-state-v1" || !Array.isArray(state.runs) || state.runs.length < 1) fail("state.json is not a bell-public-state-v1 with at least one run");
  const run = state.runs[0];
  const rec = (first.runs ?? []).find((x) => x.bell_sha === run.bell_sha)?.records?.[0];
  if (rec === undefined) fail("the first timeline line carries no record for the first run of state.json");
  const gaps = run.digest?.gaps;
  if (!Array.isArray(gaps) || gaps.length < 1) fail("the first run has no session rows");
  const sessions = gaps.map((g) => {
    for (const k of ["session", "symbol", "n", "vwap", "volumeBase"]) if (g[k] === undefined || g[k] === null) fail(`session row without ${k}`);
    if (!Number.isInteger(g.n) || g.n < 0) fail("session n is not a non-negative integer");
    if (typeof g.vwap !== "string" || typeof g.volumeBase !== "string") fail("vwap / volumeBase must be served as decimal strings");
    return { symbol: g.symbol, session: g.session, regime: g.regime ?? null, n: g.n, vwap: g.vwap, volumeBase: g.volumeBase, abstain: g.abstain ?? null };
  });
  const residuals = Object.fromEntries(Object.entries(run.digest?.residuals ?? {}).filter(([, v]) => typeof v === "number" && v > 0));
  const first_run = {
    bell_sha: run.bell_sha, symbol: rec.symbol, chain: rec.chain,
    window: { from_utc_ms: run.window.from_utc_ms, to_utc_ms: run.window.to_utc_ms },
    fills: rec.n_fills, sessions_count: rec.sessions, quorum_coverage: String(rec.quorum_coverage),
    sessions, residuals,
  };
  const out = {
    $comment:
      "Committed, hashed facts about the SERVED Bell host, rendered by /bell and /bell/method through apps/site/lib/bell-served-load.ts after a sha256 check against apps/site/data/manifest.sha256.json (lot BELL-SERVED-1; decision 155). Written by scripts/sync-bell-served.mjs (source-repo tool) from three GETs: /timeline.jsonl, /bell/pubkey.json and /state.json (bound to the head line by sha256), after checking that the served key set equals the committed keyring and that the first line is a signed, genesis-chained publication at seq 1 under that keyring. first_record = that first line's seq, published_at, line_hash (sha256 of its canonical bytes) and key_id; bodies_sha256 = the sha256 of the two bodies as read at read_at (the timeline body grows with each publication; the first line does not change). first_run = the first run of the served state as served (window, per-session fills, on-chain VWAP and base volume as decimal strings, abstention, non-zero residual counts): on-chain facts, no closing price, no gap.",
    schema: "monark-site-bell-served-v2",
    host: BELL_HOST,
    read_at: readAt,
    first_record: { seq: first.seq, published_at: first.published_at, line_hash: lineHash(first), key_id: first.key_id },
    first_run,
    bodies_sha256: { "/timeline.jsonl": sha256(timeline), "/bell/pubkey.json": sha256(pubkey), "/state.json": sha256(stateBuf) },
  };
  const text = JSON.stringify(out, null, 2) + "\n";
  writeFileSync(join(ROOT, OUT_REL), text);
  console.log(`sync-bell-served OK — ${OUT_REL} written (first record seq ${String(first.seq)}); manifest sha256 (CRLF->LF): ${sha256(Buffer.from(text.replace(/\r\n/g, "\n"), "utf8"))}`);
}

await main();
