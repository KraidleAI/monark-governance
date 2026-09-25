// scripts/sync-ukemi-served.mjs — write apps/site/data/ukemi-served.json from what the harness SERVES for the
// liquidation-eligible-coverage class (model: scripts/sync-bell-served.mjs). Node 24, built-ins + the harness gate,
// strata and calibration modules + the deploy check's liq body (scripts/verify-harness.mjs, imported: its CLI does not
// run on import). SOURCE-REPO tool (not exported); run by the orchestrator BEFORE a storefront build, and again after any
// harness deploy that can change the class (switch window of U-4b-2b, step 5, AFTER the new deploy check is written):
//   node scripts/sync-ukemi-served.mjs
//
// What it does, and nothing else: ONE GET of https://api.monarkgate.tech/openapi.json and ONE POST of
// https://api.monarkgate.tech/gate with the deploy check's own liq body (scripts/verify-harness.mjs GATE_LIQ_BODY, the
// SAME object, imported, never copied: a yhat of the committed stratum; COURSE-SERVED-FACTS-1, ADR-U4b-2b D5 and
// checkpoint-1 C-5 option (a)); and one local read of the deploy check record docs/deploy-CA-harness.json (on disk).
// Each: https only, a redirect is refused, 200 only, body bounded, 30 s timeout. Then FAIL-CLOSED checks before any write:
//   - the OpenAPI body is JSON and paths./gate.post.description is a string;
//   - EXACTLY ONE of the two clauses the repository's gate module can serve for the class is a substring of that
//     description: the empty-registry clause (no calibration committed) or the committed clause (upper bound). The two
//     are composed from the gate module's own constants, so a deploy whose text differs from this tree reds here;
//   - the kept clause is ASCII (the site is English and ASCII for this text);
//   - the /gate answer carries a verdict that AGREES with that state and with THIS tree's registry: empty => under_calib,
//     n_calib 0, qhat null; committed => covered, with n_calib, calib_digest and qhat equal to the repository's committed
//     stratum (its size, its C5 digest, its split-conformal quantile at the served alpha / nMin). A deploy of another
//     tree, or a foreign digest, reds here;
//   - the /gate answer hashes to the sha256 the deploy check record recorded for its gate_liq_call control, and that
//     control is green (ADR-U4b-2b D5 point 1: the served verdict rides on the body the deploy check attested, as
//     scripts/sync-harness-served.mjs binds each body it reads). An answer that moved since the check, or a check red on
//     that control, reds here: re-run scripts/verify-harness.mjs --out docs/deploy-CA-harness.json first.
// It writes ONLY: the host and paths, the read time, the served class id, the registry state it derived, the served
// clause, the cascade flag, the sha256 of the OpenAPI body as read, and the served verdict facts under the site's own
// key names (the probe's stratum, the verdict reason, served_alpha, calibration_points = n_calib, bound_margin_base =
// q-hat as an exact integer string or null, calibration_digest = calib_digest, the smallest calibration count for which
// the conformal rank at that alpha is interior (the pre-registered H-2bis threshold, computed here from the served
// alpha), and the sha256 of the /gate body as read, which is the deploy check's gate_liq_call sha256). No other served
// text is copied. Output: LF, two-space
// JSON; it then sets the file's CRLF->LF sha256 under its own key in apps/site/data/manifest.sha256.json.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { splitQuantile } from "@monark/hikae";
import {
  TASK_LIQ_ELIGIBLE,
  LIQ_ALPHA,
  LIQ_NMIN,
  LIQ_EMPTY_REGISTRY_SENTENCE,
  LIQ_REQUIREMENTS_SENTENCE,
  LIQ_CONDITIONAL_SENTENCE,
  LIQ_UPPER_BOUND_SENTENCE,
  LIQ_H3_SENTENCE,
  CASCADE_UNCALIBRATED_SENTENCE,
} from "../apps/harness/src/tools/gate.ts";
import { strateOf } from "../apps/harness/src/ukemi-strata.ts";
import { lookupCommittedCalibration, UKEMI_LIQ_PREDICTOR_BASE } from "../apps/harness/src/calibration.ts";
import { GATE_LIQ_BODY } from "./verify-harness.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const API_HOST = "https://api.monarkgate.tech";
export const OPENAPI_PATH = "/openapi.json";
export const GATE_PATH = "/gate";
export const OUT_REL = "apps/site/data/ukemi-served.json";
export const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
export const SCHEMA = "monark-site-ukemi-served-v2";
/** The deploy check record the served verdict is bound to (its gate_liq_call record), read on disk. */
const CA_REL = "docs/deploy-CA-harness.json";
const MAX_BYTES = 1024 * 1024;

/** The deploy check's own liq request body: the SAME object as scripts/verify-harness.mjs GATE_LIQ_BODY (imported above,
 *  never copied; ADR-U4b-2b D5 point 1, G2 of U-4b-2b M-1), re-exported for the root test. */
export { GATE_LIQ_BODY };

/** The two clauses the gate module serves for the class, keyed by the registry state they express. */
export const LIQ_CLAUSES = Object.freeze({
  empty: `${LIQ_EMPTY_REGISTRY_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`,
  committed: `the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}`,
});

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const lf = (s) => s.replace(/\r\n/g, "\n");
function fail(why) {
  console.error(`sync-ukemi-served: FAIL-CLOSED — ${why}; nothing written.`);
  process.exit(1);
}

/** Derive the served facts from the OpenAPI body (pure). Throws on any check. */
export function servedFacts(openapiText) {
  const doc = JSON.parse(openapiText);
  const gateDesc = doc?.paths?.["/gate"]?.post?.description;
  if (typeof gateDesc !== "string") throw new Error("paths./gate.post.description is not a string");
  const hits = Object.entries(LIQ_CLAUSES).filter(([, clause]) => gateDesc.includes(clause));
  if (hits.length !== 1) throw new Error(`expected exactly one served clause for '${TASK_LIQ_ELIGIBLE}', found ${String(hits.length)}`);
  const [registryState, clause] = hits[0];
  if (!/^[\x20-\x7e]+$/.test(clause)) throw new Error("the served clause is not printable ASCII");
  if (!gateDesc.includes(`For '${TASK_LIQ_ELIGIBLE}' (`)) throw new Error(`the served description does not name the class '${TASK_LIQ_ELIGIBLE}'`);
  const cascadeDesc = doc?.paths?.["/cascade"]?.post?.description;
  return {
    registry_state: registryState,
    liq_clause: clause,
    cascade_uncalibrated_sentence_served: typeof cascadeDesc === "string" && cascadeDesc.includes(CASCADE_UNCALIBRATED_SENTENCE),
  };
}

/** Smallest calibration count n whose conformal rank ceil((n+1)(1-alpha)) is BELOW n (an interior q-hat), alpha = 1/k
 *  exactly (199 at alpha 0.01: the pre-registered H-2bis threshold). Throws on an alpha that is not 1/k. */
export function interiorRankMinN(alpha) {
  const k = Math.round(1 / alpha);
  if (!(k >= 2) || Math.abs(1 / k - alpha) > 1e-15) throw new Error(`alpha ${String(alpha)} is not 1/k`);
  for (let n = 1; ; n++) if (Math.ceil(((n + 1) * (k - 1)) / k) < n) return n;
}

/**
 * Derive the served verdict facts from the /gate answer (pure), checked against the registry STATE read from the served
 * description, against THIS tree's registry, and against the deploy check record (`caText`, the JSON text of
 * docs/deploy-CA-harness.json as written by the CA: its gate_liq_call record must be green and carry the sha256 of this
 * very answer). Throws on any disagreement (fail-closed).
 */
export function servedVerdictFacts(gateText, registryState, caText) {
  const j = JSON.parse(gateText);
  const v = j?.structuredContent?.verdict;
  if (v === null || typeof v !== "object") throw new Error("the /gate answer carries no structuredContent.verdict");
  const stratum = strateOf(GATE_LIQ_BODY.prediction.yhat);
  if (v.reason !== "covered" && v.reason !== "under_calib") throw new Error(`unexpected verdict reason ${String(v.reason)}`);
  if (!Number.isSafeInteger(v.n_calib) || v.n_calib < 0) throw new Error("verdict n_calib is not a non-negative integer");
  if (v.alpha !== LIQ_ALPHA) throw new Error(`the served alpha ${String(v.alpha)} is not the class alpha`);
  if (typeof v.calib_digest !== "string" || !/^[0-9a-f]{64}$/.test(v.calib_digest)) throw new Error("verdict calib_digest is not 64 lowercase hex");
  if (v.qhat !== null && !(Number.isSafeInteger(v.qhat) && v.qhat > 0)) throw new Error("verdict qhat is neither null nor a positive safe integer");
  const qhat = v.qhat === null ? null : String(v.qhat);
  if (registryState === "empty") {
    if (v.reason !== "under_calib" || v.n_calib !== 0 || qhat !== null) throw new Error("an empty served registry must answer under_calib with n_calib 0 and qhat null");
  } else if (registryState === "committed") {
    const committed = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(stratum)}`);
    if (committed === undefined) throw new Error(`this tree's registry does not commit stratum s${String(stratum)} of the probe`);
    const q = splitQuantile(committed.scores, LIQ_ALPHA, LIQ_NMIN);
    const same = v.reason === "covered" && v.n_calib === committed.scores.length && v.calib_digest === committed.digestPinned && "qhat" in q && qhat === String(q.qhat);
    if (!same) throw new Error("the served verdict is not this tree's committed stratum (reason, n_calib, calib_digest and qhat must all agree)");
  } else {
    throw new Error(`unknown registry state ${String(registryState)}`);
  }
  // ADR-U4b-2b D5 point 1 (G2 of U-4b-2b, M-1): the answer the verdict is read from is the answer the deploy check
  // attested for its gate_liq_call control (same request body, one object; same served bytes), and that control is
  // green. Checked last, so every disagreement above keeps its own message.
  const bodySha = sha256(gateText);
  const ca = JSON.parse(caText);
  const liqCheck = Array.isArray(ca?.checks) ? ca.checks.find((c) => c !== null && typeof c === "object" && c.name === "gate_liq_call") : undefined;
  if (liqCheck === undefined || liqCheck.ok !== true || liqCheck.sha256 !== bodySha) {
    throw new Error("the /gate answer is not the one the deploy check recorded, green, for gate_liq_call in docs/deploy-CA-harness.json (re-run scripts/verify-harness.mjs --out docs/deploy-CA-harness.json first)");
  }
  // The record's keys are the site's own words (never a frozen contract field name spelled in apps/site): served_alpha,
  // calibration_points (the verdict's n_calib), bound_margin_base (its q-hat, exact integer string), calibration_digest.
  return {
    path: GATE_PATH, stratum, verdict_reason: v.reason, served_alpha: v.alpha, calibration_points: v.n_calib, bound_margin_base: qhat,
    calibration_digest: v.calib_digest, interior_rank_min_n: interiorRankMinN(v.alpha), body_sha256: bodySha,
  };
}

/** Set `rel` -> `sha` in the manifest text, refusing if the JSON round-trip would change any other byte. */
export function setManifestEntry(manifestText, rel, sha) {
  const m = JSON.parse(manifestText);
  if (JSON.stringify(m, null, 2) + "\n" !== lf(manifestText)) throw new Error("the manifest is not in its canonical two-space form; refusing to rewrite it");
  if (m.algorithm !== "sha256" || m.files === null || typeof m.files !== "object") throw new Error("the manifest has no sha256 files map");
  if (rel in m.files) {
    m.files[rel] = sha;
  } else {
    // A new key goes right after the last Ukemi entry (kept next to its sibling), else at the end.
    const entries = Object.entries(m.files);
    let at = entries.length;
    entries.forEach(([k], i) => { if (k.startsWith("apps/site/data/ukemi-")) at = i + 1; });
    entries.splice(at, 0, [rel, sha]);
    m.files = Object.fromEntries(entries);
  }
  return JSON.stringify(m, null, 2) + "\n";
}

/** The $comment of the written file (the site loader requires it to be a string; kept here, one source). */
export const COMMENT =
  "Committed, hashed facts about the SERVED liquidation-eligible-coverage class of the MONARK gate, rendered by /ukemi/course through apps/site/lib/ukemi-served-load.ts after a sha256 check against apps/site/data/manifest.sha256.json. Written by the source repository's served-state sync tool (not in the public export) from ONE GET of the harness OpenAPI document and ONE POST of the harness /gate endpoint (the deploy check's liquidation-eligible-coverage body) at read_at: registry_state is empty when the served /gate description carries the empty-registry clause and committed when it carries the upper-bound clause (exactly one must match, composed from the gate module's own sentences); liq_clause is that served clause verbatim; cascade_uncalibrated_sentence_served records whether the served /cascade description carries the cascade class's uncalibrated sentence; body_sha256 is the sha256 of the OpenAPI body as read; liq_verdict holds the served verdict of that /gate call (the probe's stratum, the verdict reason, the served alpha, the calibration points, the bound margin as an exact base-currency integer string or null, the calibration digest, the smallest calibration count for which the conformal rank at that alpha is interior, and the sha256 of the /gate body as read, which is the sha256 the deploy check recorded for that call), checked against the registry state, the source repository's committed calibration and the deploy check record before writing.";

async function readBody(url, init) {
  let res;
  try {
    res = await fetch(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(30_000) });
  } catch (e) {
    fail(`${init?.method ?? "GET"} ${url} failed (${e instanceof Error ? e.message : String(e)})`);
  }
  if (res.status !== 200) fail(`${init?.method ?? "GET"} ${url} answered ${String(res.status)} (200 only, no redirect followed)`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) fail(`${url} body size ${String(buf.length)} out of bounds`);
  return buf;
}

async function main() {
  const openapi = await readBody(`${API_HOST}${OPENAPI_PATH}`, { method: "GET" });
  const readAt = new Date().toISOString();
  const gate = await readBody(`${API_HOST}${GATE_PATH}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(GATE_LIQ_BODY) });
  let facts, verdict;
  try {
    facts = servedFacts(openapi.toString("utf8"));
    verdict = servedVerdictFacts(gate.toString("utf8"), facts.registry_state, readFileSync(join(ROOT, CA_REL), "utf8"));
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  const out = {
    $comment: COMMENT,
    schema: SCHEMA,
    host: API_HOST,
    path: OPENAPI_PATH,
    read_at: readAt,
    served_class: TASK_LIQ_ELIGIBLE,
    registry_state: facts.registry_state,
    liq_clause: facts.liq_clause,
    cascade_uncalibrated_sentence_served: facts.cascade_uncalibrated_sentence_served,
    body_sha256: sha256(openapi),
    liq_verdict: verdict,
  };
  const text = JSON.stringify(out, null, 2) + "\n";
  const fileSha = sha256(Buffer.from(lf(text), "utf8"));
  let manifest;
  try {
    manifest = setManifestEntry(readFileSync(join(ROOT, MANIFEST_REL), "utf8"), OUT_REL, fileSha);
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  writeFileSync(join(ROOT, OUT_REL), text);
  writeFileSync(join(ROOT, MANIFEST_REL), manifest);
  console.log(`sync-ukemi-served OK — ${OUT_REL} written (registry_state ${facts.registry_state}, verdict ${verdict.verdict_reason}, read ${readAt}); manifest entry set to ${fileSha}`);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
