// scripts/sync-narabi-capture.mjs — write apps/site/data/narabi-capture.json, the committed capture of the two files the
// Narabi sentinel SERVES, which /narabi renders first (lot NARABI-SERVED-1; model: scripts/sync-bell-served.mjs). Node
// 24, built-ins + the repository's own sentinel and tracker code. SOURCE-REPO tool (not exported); run by the
// orchestrator BEFORE a storefront build and before an upload:
//   node scripts/sync-narabi-capture.mjs            re-capture (only when the served files changed); print the manifest sha256
//   node scripts/sync-narabi-capture.mjs --check    write nothing; exit 1 unless the committed capture is still a faithful
//                                                   prefix of what is served now (see checkCommitted)
//
// Two GETs on https://monarkgate.tech/narabi/ (https only, a redirect is refused, 200 only, body bounded), then FAIL-CLOSED
// checks before any write (servedChecks):
//   - every line's line_hash recomputes with the sentinel's own lineHashOf (apps/sentinel/src/timeline.ts), the first
//     line is chained from GENESIS and every prev_line_hash names the previous line;
//   - state.json agrees with the last line and with the tracker's own code: digest = digest_T, tracker.t = T,
//     tracker.q = q_after, replay_q = trackerReplay(q1, params, s column), trackerDigest(q1, params, s column) = digest,
//     projected_bound_leq_target_T = projectedBoundT(DELTA_TARGET);
//   - the timeline served at the previous capture is a BYTE PREFIX of the one served now (append-only since then).
// It writes ONLY apps/site/data/narabi-capture.json: state.json as served; the timeline as served EXCEPT each line's
// endpoint URL list, replaced by its count (the URLs name data providers and have no place in the storefront; they are
// outside the line hash, so the chain still recomputes); the sha256 and length of the timeline AS SERVED; the previous
// capture's day, sha256 and length. Output: LF, two-space JSON; it prints the CRLF->LF sha256 for the site manifest.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BASE = "https://monarkgate.tech/narabi/";
export const OUT_REL = "apps/site/data/narabi-capture.json";
const MAX_BYTES = 8 * 1024 * 1024; // the probe's MAX_MAX_BYTES
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const fail = (why) => {
  console.error(`sync-narabi-capture: FAIL-CLOSED — ${why}; nothing written.`);
  process.exit(1);
};

/** A served line with its endpoint URL list replaced by its count, SAME key order; JSON of the stored line. */
export function projectServedLine(l) {
  return JSON.stringify(Object.fromEntries(Object.entries(l).map(([k, v]) => (k === "endpoints" ? ["endpoints_count", Array.isArray(v) ? v.length : null] : [k, v]))));
}

/** The stored timeline: every served line projected, one per line, LF-terminated. */
export function projectTimeline(servedText) {
  const lines = servedText.split("\n").filter((l) => l.trim().length > 0);
  return lines.map((l) => projectServedLine(JSON.parse(l))).join("\n") + (lines.length > 0 ? "\n" : "");
}

async function get(name) {
  const res = await fetch(BASE + name, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) fail(`GET ${name} answered ${String(res.status)} (200 only, no redirect followed)`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) fail(`GET ${name} body size ${String(buf.length)} out of bounds`);
  return buf.toString("utf8");
}

/** Every check the served pair must pass before it may be captured. Returns the parsed lines and state. */
async function servedChecks(stateJson, servedTimeline) {
  const { lineHashOf, projectedBoundT, DELTA_TARGET } = await import(pathToFileURL(join(ROOT, "apps/sentinel/src/timeline.ts")).href);
  const { trackerReplay, trackerDigest } = await import(pathToFileURL(join(ROOT, "packages/hikae/src/index.ts")).href);
  const lines = servedTimeline.split("\n").filter((l) => l.trim().length > 0).map((l) => JSON.parse(l));
  if (lines.length === 0) fail("the served timeline is empty");
  let prev = "GENESIS";
  for (const l of lines) {
    if (l.prev_line_hash !== prev) fail(`chain link broken at ${String(l.day)}`);
    if (lineHashOf(l) !== l.line_hash) fail(`line_hash does not recompute at ${String(l.day)}`);
    prev = l.line_hash;
  }
  const state = JSON.parse(stateJson);
  const last = lines[lines.length - 1];
  const scores = lines.filter((l) => l.s !== null && l.s !== undefined).map((l) => l.s);
  const tr = state.tracker ?? {};
  if (state.digest !== last.digest_T) fail("state.json digest is not the last line's digest_T");
  if (tr.t !== last.T || tr.t !== scores.length) fail("state.json tracker.t is not the last line's T (nor the number of stepped lines)");
  if (tr.q !== last.q_after) fail("state.json tracker.q is not the last line's q_after");
  if (trackerReplay(tr.q1, tr.params, scores).q !== state.replay_q) fail("state.json replay_q is not trackerReplay(q1, params, s column)");
  if (trackerDigest(tr.q1, tr.params, scores) !== state.digest) fail("state.json digest is not trackerDigest(q1, params, s column)");
  if (state.projected_bound_leq_target_T !== projectedBoundT(DELTA_TARGET)) fail("state.json projected_bound_leq_target_T is not projectedBoundT(DELTA_TARGET)");
  return { lines, state };
}

/** --check: the committed capture is still a faithful prefix of what is served now. */
function checkCommitted(old, stateJson, servedTimeline) {
  const problems = [];
  const servedLines = servedTimeline.split("\n").filter((l) => l.trim().length > 0);
  const storedLines = old.timeline_jsonl.split("\n").filter((l) => l.trim().length > 0);
  const reprojected = servedLines.slice(0, storedLines.length).map((l) => projectServedLine(JSON.parse(l))).join("\n") + "\n";
  if (storedLines.length > servedLines.length || reprojected !== old.timeline_jsonl) {
    problems.push("the stored timeline is not, byte for byte, the projection of the first lines served now");
  }
  if (servedTimeline.length < old.served.timeline_chars || sha256(servedTimeline.slice(0, old.served.timeline_chars)) !== old.served.timeline_sha256) {
    problems.push("the served timeline does not start with the bytes the capture recorded as served (served.timeline_sha256 / timeline_chars)");
  }
  const servedT = JSON.parse(stateJson)?.tracker?.t;
  const storedT = JSON.parse(old.state_json)?.tracker?.t;
  if (servedT === storedT && stateJson !== old.state_json) problems.push("state.json served now differs from the stored one at the same T");
  return problems;
}

export const COMMENT =
  "Committed capture of the two files the Narabi sentinel publishes at https://monarkgate.tech/narabi/, rendered first by /narabi (declared as the committed capture) through apps/site/lib/narabi-capture-load.ts (its last window and tracker step also by the Narabi freshness line of / and /fleet, declared as the capture) after a sha256 check against apps/site/data/manifest.sha256.json. Written by the source repository's sync tool (not part of this export) from two GETs, after checking every line hash with the sentinel's own code, the chain from GENESIS, state.json against the last line and the tracker's own code (digest, T, q, replay, tracker digest, projected horizon), and that the timeline served at the previous capture is a byte prefix of the one served now. state_json is kept as served. timeline_jsonl is kept as served EXCEPT each line's endpoint URL list, replaced by its count (endpoints_count); the list sits outside the line hash, so the chain still recomputes. served = the sha256 and length of the timeline exactly as served at capture: anyone can check that the file served today starts with those bytes.";

async function main() {
  const check = process.argv.includes("--check");
  const outAbs = join(ROOT, OUT_REL);
  if (!existsSync(outAbs)) fail(`${OUT_REL} is absent: a capture extends the committed one (append-only chain of captures)`);
  const old = JSON.parse(readFileSync(outAbs, "utf8"));
  const stateJson = await get("state.json");
  const servedTimeline = await get("timeline.jsonl");
  const { lines, state } = await servedChecks(stateJson, servedTimeline);
  if (check) {
    const problems = checkCommitted(old, stateJson, servedTimeline);
    if (problems.length > 0) {
      console.error(`sync-narabi-capture --check FAILED — ${problems.join("; ")}.`);
      process.exit(1);
    }
    console.log(`sync-narabi-capture --check OK — the capture of ${old.captured_at} (T=${String(JSON.parse(old.state_json).tracker.t)}) is a faithful prefix of what is served now (T=${String(state.tracker.t)}, ${String(lines.length)} lines; served timeline sha256 ${sha256(servedTimeline)}).`);
    return;
  }
  const prevServed = old.served;
  if (servedTimeline.length < prevServed.timeline_chars || sha256(servedTimeline.slice(0, prevServed.timeline_chars)) !== prevServed.timeline_sha256) {
    fail(`the timeline served at the capture of ${String(old.captured_at)} is not a byte prefix of the one served now`);
  }
  if (sha256(servedTimeline) === prevServed.timeline_sha256 && stateJson === old.state_json) {
    console.log(`sync-narabi-capture: unchanged — the served files equal the capture of ${String(old.captured_at)}; nothing written.`);
    return;
  }
  const projected = projectTimeline(servedTimeline);
  if (projected.includes("://")) fail("a URL survived the projection");
  const out = {
    $comment: COMMENT,
    schema: "monark-site-narabi-capture-v1",
    source: BASE,
    captured_at: new Date().toISOString().slice(0, 10),
    state_json: stateJson,
    state_sha256: sha256(stateJson),
    timeline_jsonl: projected,
    timeline_sha256: sha256(projected),
    served: { timeline_sha256: sha256(servedTimeline), timeline_chars: servedTimeline.length },
    previous_capture: { captured_at: old.captured_at, served_timeline_sha256: prevServed.timeline_sha256, served_timeline_chars: prevServed.timeline_chars },
  };
  const text = JSON.stringify(out, null, 2) + "\n";
  writeFileSync(outAbs, text);
  console.log(`sync-narabi-capture OK — ${OUT_REL} written (T=${String(state.tracker.t)}, ${String(lines.length)} lines); manifest sha256 (CRLF->LF): ${sha256(text.replace(/\r\n/g, "\n"))}`);
}

// Run-guard (mirrors the repo's scripts): the CLI runs only when invoked directly, never on import.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
