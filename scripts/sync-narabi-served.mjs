// scripts/sync-narabi-served.mjs — write apps/site/data/narabi-served.json: the facts /narabi states that are NOT in the
// two files the Narabi sentinel publishes (lot NARABI-SERVED-1; model: scripts/sync-bell-served.mjs). Node 24, built-ins
// + scripts/probe-narabi.mjs + the site manifest writer of scripts/sync-ukemi-served.mjs. SOURCE-REPO tool (not exported);
// run by the orchestrator BEFORE a storefront build:
//   node scripts/sync-narabi-served.mjs            write the file (only when a fact changed) and set its manifest entry
//   node scripts/sync-narabi-served.mjs --check    write nothing; exit 1 if the committed file no longer says what the
//                                                  sources say now (read_at aside)
//
// Sources, each read then checked FAIL-CLOSED before any write:
//   - the gate's served identity for the Narabi class: ONE GET of https://api.monarkgate.tech/openapi.json (https only,
//     a redirect is refused, 200 only, body bounded). Its sha256 must equal the value the committed deployment
//     conformity record holds for the served document (docs/deploy-CA-harness.json, check "openapi"), and its gate
//     description must name EXACTLY ONE committed Narabi class with its key:
//     "For '<class>' (Narabi: …) the gate holds a committed … (key <predictor_id>)";
//   - the sentinel's publication schedule: every OnCalendar slot and the RandomizedDelaySec of deploy/monark-sentinel.timer;
//   - the external probe: DEADLINE_UTC of scripts/probe-narabi.mjs and every OnCalendar shot of deploy/monark-probe.timer
//     (the first shot must be the deadline itself).
// It writes ONLY those values, the read instant and the served document's sha256. Output: LF, two-space JSON; it sets
// the CRLF->LF sha256 in apps/site/data/manifest.sha256.json (canonical form, before either write). The site reads the file through
// apps/site/lib/narabi-served-load.ts (manifest check, closed shape, fail-closed); test/narabi-live.test.ts binds every
// value again to its producer (the systemd units, the probe, the harness calibration and the served description).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DEADLINE_UTC } from "./probe-narabi.mjs";
import { setManifestEntry, MANIFEST_REL } from "./sync-ukemi-served.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const API_HOST = "https://api.monarkgate.tech";
export const OPENAPI_PATH = "/openapi.json";
export const OUT_REL = "apps/site/data/narabi-served.json";
const CA_REL = "docs/deploy-CA-harness.json";
const SENTINEL_TIMER_REL = "deploy/monark-sentinel.timer";
const PROBE_TIMER_REL = "deploy/monark-probe.timer";
const MAX_BYTES = 1024 * 1024; // the served document is ~20 kB
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const fail = (why) => {
  console.error(`sync-narabi-served: FAIL-CLOSED — ${why}; nothing written.`);
  process.exit(1);
};

/** Every `OnCalendar=*-*-* HH:MM:00 UTC` line of a unit, in order (the units spell one daily UTC slot per line). */
export function onCalendarSlots(unitText) {
  return [...unitText.matchAll(/^OnCalendar=\*-\*-\* (\d{2}:\d{2}):00 UTC\s*$/gm)].map((m) => m[1] ?? "");
}

/** The Narabi class and its key, read from a served gate description; null unless there is exactly one. The record
 *  names them as the description does (class_id, key). */
export function narabiGateIdentity(description) {
  const hits = [...description.matchAll(/For '([a-z0-9-]+)' \(Narabi[^)]*\) the gate holds a committed [^(]*\(key ([^)\s]+)\)/g)];
  if (hits.length !== 1) return null;
  const [, class_id, key] = hits[0];
  return class_id && key ? { class_id, key } : null;
}

async function getOpenApi() {
  const res = await fetch(`${API_HOST}${OPENAPI_PATH}`, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) fail(`GET ${OPENAPI_PATH} answered ${String(res.status)} (200 only, no redirect followed)`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) fail(`GET ${OPENAPI_PATH} body size ${String(buf.length)} out of bounds`);
  return buf;
}

/** The facts the sources say now (everything but read_at). */
async function readFacts() {
  const body = await getOpenApi();
  const ca = JSON.parse(readFileSync(join(ROOT, CA_REL), "utf8"));
  const pinned = (ca.checks ?? []).find((c) => c.name === "openapi")?.sha256;
  if (typeof pinned !== "string" || !/^[0-9a-f]{64}$/.test(pinned)) fail(`${CA_REL} carries no openapi sha256`);
  const servedSha = sha256(body);
  if (servedSha !== pinned) fail(`the served ${OPENAPI_PATH} (sha256 ${servedSha}) is not the document the deployment record pins (${pinned})`);
  const doc = JSON.parse(body.toString("utf8"));
  const descriptions = [];
  const walk = (v) => {
    if (typeof v === "string") descriptions.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v !== null && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(doc);
  const ids = descriptions.map(narabiGateIdentity).filter((x) => x !== null);
  const distinct = new Set(ids.map((x) => `${x.class_id} ${x.key}`));
  if (distinct.size !== 1) fail(`the served document names ${String(distinct.size)} committed Narabi class/key pairs (exactly one expected)`);
  const gate = { ...ids[0], openapi_sha256: servedSha };

  const sentinelUnit = readFileSync(join(ROOT, SENTINEL_TIMER_REL), "utf8");
  const slots = onCalendarSlots(sentinelUnit);
  if (slots.length === 0) fail(`${SENTINEL_TIMER_REL} carries no OnCalendar slot`);
  const delay = /^RandomizedDelaySec=(\d+)\s*$/m.exec(sentinelUnit)?.[1];
  if (delay === undefined || Number(delay) <= 0) fail(`${SENTINEL_TIMER_REL} carries no positive RandomizedDelaySec`);
  const shots = onCalendarSlots(readFileSync(join(ROOT, PROBE_TIMER_REL), "utf8"));
  if (shots.length === 0 || shots[0] !== DEADLINE_UTC) fail(`the first shot of ${PROBE_TIMER_REL} is not the probe deadline ${DEADLINE_UTC}`);
  return {
    gate,
    sentinel_timer: { on_calendar_utc: slots, randomized_delay_s: Number(delay) },
    probe: { deadline_utc: DEADLINE_UTC, shots_utc: shots },
  };
}

const COMMENT =
  "Committed, hashed facts that /narabi states and the two published Narabi files do not carry, rendered through apps/site/lib/narabi-served-load.ts (by /narabi, and by the Narabi freshness line of / and /fleet) after a sha256 check against apps/site/data/manifest.sha256.json. Written by the source repository's sync tool (not part of this export). gate = the class id and key of the one committed Narabi class, read from the gate description of the served https://api.monarkgate.tech/openapi.json, whose sha256 (openapi_sha256) equals the value the deployment conformity record holds for it. sentinel_timer = the daily UTC publication slots and the random delay of the sentinel's systemd timer. probe = the freshness deadline of the external probe and its daily UTC shots. No market value, no data-source name.";

async function main() {
  const check = process.argv.includes("--check");
  const facts = await readFacts();
  const outAbs = join(ROOT, OUT_REL);
  const old = existsSync(outAbs) ? JSON.parse(readFileSync(outAbs, "utf8")) : null;
  const same =
    old !== null &&
    JSON.stringify({ gate: old.gate, sentinel_timer: old.sentinel_timer, probe: old.probe }) === JSON.stringify(facts);
  if (check) {
    if (!same) {
      console.error(`sync-narabi-served --check: ${OUT_REL} no longer says what the sources say now; re-run without --check.`);
      process.exit(1);
    }
    console.log(`sync-narabi-served --check OK — ${OUT_REL} equals the sources (served openapi sha256 ${facts.gate.openapi_sha256}).`);
    return;
  }
  if (same) {
    console.log(`sync-narabi-served: unchanged — ${OUT_REL} already says what the sources say; nothing written.`);
    return;
  }
  let sha;
  try { sha = writeNarabiServed(ROOT, facts, new Date().toISOString()); } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
  console.log(`sync-narabi-served OK — ${OUT_REL} written; manifest entry set to ${sha} (CRLF->LF)`);
}

/** Write the record of `facts` under `root` and set its manifest entry, the manifest text computed first (throws, writing nothing). */
export function writeNarabiServed(root, facts, readAt) {
  const text = JSON.stringify({ $comment: COMMENT, schema: "monark-site-narabi-served-v1", read_at: readAt, ...facts }, null, 2) + "\n";
  const sha = sha256(Buffer.from(text.replace(/\r\n/g, "\n"), "utf8"));
  const manifest = setManifestEntry(readFileSync(join(root, MANIFEST_REL), "utf8"), OUT_REL, sha);
  writeFileSync(join(root, OUT_REL), text);
  writeFileSync(join(root, MANIFEST_REL), manifest);
  return sha;
}

// Run-guard (mirrors the repo's scripts): the CLI runs only when invoked directly, never on import.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
