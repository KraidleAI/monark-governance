// scripts/sync-ukemi-served.mjs — write apps/site/data/ukemi-served.json from the harness's SERVED OpenAPI document
// (model: scripts/sync-bell-served.mjs). Node 24, built-ins + the harness gate module only. SOURCE-REPO tool (not
// exported); run by the orchestrator BEFORE a storefront build, and again after any harness deploy that can change
// the liquidation-eligible-coverage class:  node scripts/sync-ukemi-served.mjs
//
// What it does, and nothing else: ONE GET of https://api.monarkgate.tech/openapi.json (https only, a redirect is
// refused, 200 only, body bounded, 30 s timeout), then FAIL-CLOSED checks before any write:
//   - the body is JSON and paths./gate.post.description is a string;
//   - EXACTLY ONE of the two clauses the repository's gate module can serve for the class is a substring of that
//     description: the empty-registry clause (no calibration committed) or the committed clause (upper bound). The two
//     are composed from the gate module's own constants, so a deploy whose text differs from this tree reds here;
//   - the kept clause is ASCII (the site is English and ASCII for this text).
// It also records whether the served /cascade description carries the cascade class's uncalibrated sentence.
// It writes ONLY: the host and path, the read time, the served class id, the registry state it derived, the served
// clause, that cascade flag, and the sha256 of the body as read. No other served text is copied (the description
// carries other classes and non-ASCII symbols the site does not render). Output: LF, two-space JSON; it then sets
// the file's CRLF->LF sha256 under its own key in apps/site/data/manifest.sha256.json (no other byte changes).
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  TASK_LIQ_ELIGIBLE,
  LIQ_EMPTY_REGISTRY_SENTENCE,
  LIQ_REQUIREMENTS_SENTENCE,
  LIQ_CONDITIONAL_SENTENCE,
  LIQ_UPPER_BOUND_SENTENCE,
  LIQ_H3_SENTENCE,
  CASCADE_UNCALIBRATED_SENTENCE,
} from "../apps/harness/src/tools/gate.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const API_HOST = "https://api.monarkgate.tech";
export const OPENAPI_PATH = "/openapi.json";
export const OUT_REL = "apps/site/data/ukemi-served.json";
export const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const MAX_BYTES = 1024 * 1024;

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

async function main() {
  let res;
  try {
    res = await fetch(`${API_HOST}${OPENAPI_PATH}`, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  } catch (e) {
    fail(`GET ${OPENAPI_PATH} failed (${e instanceof Error ? e.message : String(e)})`);
  }
  if (res.status !== 200) fail(`GET ${OPENAPI_PATH} answered ${String(res.status)} (200 only, no redirect followed)`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) fail(`GET ${OPENAPI_PATH} body size ${String(buf.length)} out of bounds`);
  const readAt = new Date().toISOString();
  let facts;
  try {
    facts = servedFacts(buf.toString("utf8"));
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  const out = {
    $comment:
      "Committed, hashed facts about the SERVED liquidation-eligible-coverage class of the MONARK gate, rendered by /ukemi/course through apps/site/lib/ukemi-served-load.ts after a sha256 check against apps/site/data/manifest.sha256.json. Written by the source repository's served-state sync tool (not in the public export) from ONE GET of the harness OpenAPI document at read_at: registry_state is empty when the served /gate description carries the empty-registry clause and committed when it carries the upper-bound clause (exactly one must match, composed from the gate module's own sentences); liq_clause is that served clause verbatim; cascade_uncalibrated_sentence_served records whether the served /cascade description carries the cascade class's uncalibrated sentence; body_sha256 is the sha256 of the OpenAPI body as read.",
    schema: "monark-site-ukemi-served-v1",
    host: API_HOST,
    path: OPENAPI_PATH,
    read_at: readAt,
    served_class: TASK_LIQ_ELIGIBLE,
    registry_state: facts.registry_state,
    liq_clause: facts.liq_clause,
    cascade_uncalibrated_sentence_served: facts.cascade_uncalibrated_sentence_served,
    body_sha256: sha256(buf),
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
  console.log(`sync-ukemi-served OK — ${OUT_REL} written (registry_state ${facts.registry_state}, read ${readAt}); manifest entry set to ${fileSha}`);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
