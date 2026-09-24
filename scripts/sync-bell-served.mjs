// scripts/sync-bell-served.mjs — write apps/site/data/bell-served.json from the files the Bell host SERVES (lot
// BELL-SERVED-1, v3: every run of the LATEST publication). Node 24, built-ins + the publisher's own modules only. SOURCE-REPO
// tool (not exported, like scripts/sync-bell-anchors.mjs); run by the orchestrator BEFORE a storefront build, AFTER the deploy
// check of the same bodies is committed (docs/deploy-CA-bell.json):  node scripts/sync-bell-served.mjs
//
// What it reads, and nothing else: GETs on the Bell host (https only, a redirect is refused, 200 only, body bounded) of
// /timeline.jsonl, /bell/pubkey.json, /state.json, /provenance.json, then /states/<sha256>.json of the latest publication
// line and of the first line (the immutable copies those lines name); the committed keyring apps/bell/keys/bell-keyring.json
// (the trust root); the committed deploy check docs/deploy-CA-bell.json; `git log -1 -- apps/bell/src` (the collector
// revision the method page restates); the publisher's closed list of served objects (apps/bell/scripts/bell-publish.mjs
// WHITELIST). Every check and the projection itself are buildBellServed() in apps/site/lib/bell-served-load.ts (pure, run
// by the root test on a two-line fixture): the whole timeline is walked under the committed keyring (chain, signatures,
// key schedule), the current state and provenance are bound to the LATEST publication line by sha256, the first record's
// state is read at its immutable address, the deploy check must have been captured on these same bodies. It copies no
// consolidated-volume ratio value, no provider label, no proof-of-reserves method or note, and no key. FAIL-CLOSED: any
// check that does not hold exits 1 and writes nothing.
// Output: LF, two-space JSON; it prints the CRLF->LF sha256 to set in apps/site/data/manifest.sha256.json (and to re-pin in
// test/bell-served.test.ts).
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { walkTimeline, trustOf, lineHash } from "../apps/bell/scripts/bell-chain.mjs";
import { WHITELIST } from "../apps/bell/scripts/bell-publish.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BELL_HOST = "https://bell.monarkgate.tech";
export const OUT_REL = "apps/site/data/bell-served.json";
const KEYRING_REL = "apps/bell/keys/bell-keyring.json";
const DEPLOY_CHECK_REL = "docs/deploy-CA-bell.json";
const COLLECTOR_SRC = "apps/bell/src";
const MAX_BYTES = 64 * 1024 * 1024; // the publisher's MAX_PUBLIC_STATE_BYTES (bell-publish.mjs BOUNDS); a line is bounded at 1 MiB
const HEX64 = /^[0-9a-f]{64}$/;
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const fail = (why) => { console.error(`sync-bell-served: FAIL-CLOSED — ${why}; nothing written.`); process.exit(1); };

async function get(path) {
  const res = await fetch(`${BELL_HOST}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) fail(`GET ${path} answered ${String(res.status)} (200 only, no redirect followed)`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) fail(`GET ${path} body size ${String(buf.length)} out of bounds`);
  return buf;
}

/** The state sha256 the first line and the last publication line name (unverified here: buildBellServed re-walks the chain and
 *  binds every byte it is given to the verified lines, so a wrong address only fails closed). */
function immutableAddresses(timeline) {
  const lines = timeline.toString("utf8").split("\n").filter((l) => l.length > 0).map((l) => { try { return JSON.parse(l); } catch { return fail("a timeline line is not JSON"); } });
  const pubs = lines.filter((l) => l && l.kind === "publication");
  const first = lines[0], head = pubs[pubs.length - 1];
  if (first === undefined || head === undefined || !HEX64.test(String(first.state_sha256)) || !HEX64.test(String(head.state_sha256))) fail("the timeline names no publication state");
  return { first: first.state_sha256, head: head.state_sha256 };
}

async function main() {
  const { buildBellServed } = await import(pathToFileURL(join(ROOT, "apps", "site", "lib", "bell-served-load.ts")).href);
  const timeline = await get("/timeline.jsonl");
  const pubkey = await get("/bell/pubkey.json");
  const state = await get("/state.json");
  const provenance = await get("/provenance.json");
  const at = immutableAddresses(timeline);
  const headStateImmutable = await get(`/states/${at.head}.json`);
  const firstStateImmutable = at.first === at.head ? headStateImmutable : await get(`/states/${at.first}.json`);
  const readAt = new Date().toISOString();
  const [commit, committed] = execFileSync("git", ["log", "-1", "--format=%H%n%cI", "--", COLLECTOR_SRC], { cwd: ROOT, encoding: "utf8" }).trim().split("\n");
  if (!/^[0-9a-f]{40}$/.test(commit ?? "") || committed === undefined || Number.isNaN(Date.parse(committed))) fail(`no commit found for ${COLLECTOR_SRC}`);
  let out;
  try {
    out = buildBellServed({
      readAt, timeline, pubkey, state, provenance, headStateImmutable, firstStateImmutable,
      committedKeyring: readFileSync(join(ROOT, KEYRING_REL)),
      deployCheck: JSON.parse(readFileSync(join(ROOT, DEPLOY_CHECK_REL), "utf8")),
      collectorRevision: { commit, committed_at: new Date(committed).toISOString() },
      whitelist: WHITELIST,
    }, { walkTimeline, trustOf, lineHash });
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  const text = JSON.stringify(out, null, 2) + "\n";
  writeFileSync(join(ROOT, OUT_REL), text);
  console.log(`sync-bell-served OK — ${OUT_REL} written (head seq ${String(out.head.seq)}, ${String(out.head.runs.length)} run(s), first record seq ${String(out.first_record.seq)}); manifest sha256 (CRLF->LF): ${sha256(Buffer.from(text.replace(/\r\n/g, "\n"), "utf8"))}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
