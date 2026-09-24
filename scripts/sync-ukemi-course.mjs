// scripts/sync-ukemi-course.mjs — write apps/site/data/ukemi-course.json from the Ukemi course hypothesis report
// (schema ukemi-u4b-hyp/1, kind report, produced by scripts/census/u4b/u4b-hyp.mjs). Node 24, built-ins + the frozen
// course modules only. SOURCE-REPO tool (not exported, like scripts/sync-bell-served.mjs); run by the orchestrator
// after the course's report step, BEFORE a storefront build:
//   node scripts/sync-ukemi-course.mjs --report <path to hyp-report-<event>.json>
//
// It replaces the hand copy of the report. FAIL-CLOSED checks before any write:
//   - schema ukemi-u4b-hyp/1, kind report; body.event_id === provenance.event_id;
//   - body_digest === sha256(canon(body)), recomputed with the course tool's OWN canon (u4b-hyp.mjs);
//   - provenance.tool.sha256_lf === the CRLF->LF sha256 of scripts/census/u4b/u4b-hyp.mjs in THIS tree (the report
//     was produced by the tool this repository carries);
//   - every provenance.inputs.<name>.sha256_lf is 64 lowercase hex.
// What it writes, and nothing else:
//   - body and body_digest BYTE-FOR-BYTE as reported (the digest covers body only; body.summary stays in the file,
//     it is never rendered);
//   - provenance reduced to the tool digest, the node version, the event id and the input digests, WITHOUT any path
//     (the paths name files that are not in the public export);
//   - a `display` block OUTSIDE body: the amounts the course page renders, as exact decimal strings (base-currency
//     integers with 8 decimals, split by BigInt: no float, no rounding) with their unit, and the a-priori stratum cuts
//     read from the frozen scorer (STRATA_CUTS of scripts/census/u4b/u4b-scores.mjs). Never an account address.
// Then it sets the file's CRLF->LF sha256 under its own key in apps/site/data/manifest.sha256.json (no other key and
// no other byte of the manifest changes; the rewrite is refused if a JSON round-trip would alter the manifest).
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { canon } from "./census/u4b/u4b-hyp.mjs";
import { STRATA_CUTS } from "./census/u4b/u4b-scores.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_REL = "apps/site/data/ukemi-course.json";
export const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const TOOL_REL = "scripts/census/u4b/u4b-hyp.mjs";
const HEX64 = /^[0-9a-f]{64}$/;
const INT = /^(0|[1-9][0-9]*)$/;
/** The unit of every amount of the report: the lending venue's oracle base currency, an integer with 8 decimals. */
export const AMOUNT_UNIT = "in the lending venue's oracle base currency (8 decimals)";
export const AMOUNT_DECIMALS = 8;
const INPUT_NAMES = ["prereg", "scores", "u3_inputs", "u3_realized", "oracle_path", "e2_comparison"];

const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const lf = (s) => s.replace(/\r\n/g, "\n");
function fail(why) {
  console.error(`sync-ukemi-course: FAIL-CLOSED — ${why}; nothing written.`);
  process.exit(1);
}

/** Exact decimal string of a non-negative base-currency integer with `AMOUNT_DECIMALS` decimals ("126184298996" ->
 *  "1261.84298996"). BigInt only: the integer part and the zero-padded remainder, no float and no rounding. */
export function decimal8(intString) {
  const s = typeof intString === "bigint" ? intString.toString() : intString;
  if (typeof s !== "string" || !INT.test(s)) throw new Error(`decimal8: not a non-negative integer string: ${String(s)}`);
  const v = BigInt(s);
  const unit = 10n ** BigInt(AMOUNT_DECIMALS);
  return `${(v / unit).toString()}.${(v % unit).toString().padStart(AMOUNT_DECIMALS, "0")}`;
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

/** Build the site file (pure: the report object in, the site object out). Throws on any check. */
export function buildSiteCourse(report, toolSha256Lf) {
  if (report === null || typeof report !== "object") throw new Error("the report is not a JSON object");
  if (report.schema !== "ukemi-u4b-hyp/1" || report.kind !== "report") throw new Error("not a ukemi-u4b-hyp/1 report");
  const { body, provenance } = report;
  if (body === null || typeof body !== "object") throw new Error("body missing");
  if (typeof report.body_digest !== "string" || !HEX64.test(report.body_digest)) throw new Error("body_digest malformed");
  const recomputed = sha256(canon(body));
  if (recomputed !== report.body_digest) throw new Error(`body_digest ${report.body_digest} != sha256(canon(body)) ${recomputed}`);
  if (provenance?.tool?.sha256_lf !== toolSha256Lf) throw new Error(`the report's tool digest is not the digest of ${TOOL_REL} in this tree (${toolSha256Lf})`);
  if (typeof body.event_id !== "string" || body.event_id !== provenance.event_id) throw new Error("body.event_id and provenance.event_id differ");
  const inputs = {};
  for (const name of INPUT_NAMES) {
    const d = provenance.inputs?.[name]?.sha256_lf;
    if (typeof d !== "string" || !HEX64.test(d)) throw new Error(`provenance.inputs.${name}.sha256_lf is missing or malformed`);
    inputs[name] = { sha256_lf: d };
  }
  const h3 = body.h3, h4 = body.h4, h6 = body.h6, q0 = body.q0_rule_failures;
  if (!Array.isArray(h3?.strata) || h3.strata.length !== STRATA_CUTS.length + 1) throw new Error("h3.strata must list one row per a-priori stratum");
  const display = {
    unit: AMOUNT_UNIT,
    decimals: AMOUNT_DECIMALS,
    strata_cuts: STRATA_CUTS.map((c) => decimal8(c)),
    strata_qhat: h3.strata.map((s) => (s.fresh?.qhat === null ? null : decimal8(s.fresh?.qhat))),
    pooled_qhat: decimal8(h3.pooled?.fresh?.qhat),
    liquidated_class_a: {
      sum_y: decimal8(h4?.pooled?.sum_y),
      sum_after_first: decimal8(h4?.pooled?.sum_after_first),
      sum_deficit_apart: decimal8(h4?.pooled?.sum_deficit_apart),
    },
    anchor_price: decimal8(h6?.anchor?.price),
    min_served: h6?.min_served === null ? null : decimal8(h6?.min_served),
    min_events: h6?.min_events === null ? null : decimal8(h6?.min_events),
    zero_rule_missed_amounts: (Array.isArray(q0?.without_crossing) ? q0.without_crossing : []).map((m) => decimal8(m.y)),
  };
  return {
    $comment:
      "Site copy of the Ukemi course hypothesis report (schema ukemi-u4b-hyp/1), written by the source repository's course sync tool (not in the public export) after checking that body_digest is the sha256 of the canonical JSON of body (keys sorted, no whitespace) and that the report names the course tool the source repository carries. body and body_digest are copied byte-for-byte; body.summary is never rendered. provenance keeps the digests only (tool, pre-registration and inputs, none of which is in the public export). display carries the amounts the page renders as exact decimal strings (base-currency integers, 8 decimals) with their unit, and the a-priori stratum cuts of the frozen scorer. Rendered by /ukemi/course through apps/site/lib/ukemi-course-load.ts after a sha256 check against the site manifest.",
    schema: report.schema,
    kind: report.kind,
    provenance: {
      tool: { sha256_lf: provenance.tool.sha256_lf },
      node: provenance.node,
      event_id: provenance.event_id,
      inputs,
    },
    body,
    body_digest: report.body_digest,
    display,
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

function main() {
  const reportPath = arg(process.argv.slice(2), "--report");
  if (reportPath === undefined) fail("usage: node scripts/sync-ukemi-course.mjs --report <path to hyp-report-<event>.json>");
  let report;
  try {
    report = JSON.parse(readFileSync(reportPath, "utf8"));
  } catch (e) {
    fail(`cannot read the report (${e instanceof Error ? e.message : String(e)})`);
  }
  const toolSha = sha256(lf(readFileSync(join(ROOT, TOOL_REL), "utf8")));
  let site;
  try {
    site = buildSiteCourse(report, toolSha);
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  const text = JSON.stringify(site, null, 2) + "\n";
  const fileSha = sha256(lf(text));
  let manifest;
  try {
    manifest = setManifestEntry(readFileSync(join(ROOT, MANIFEST_REL), "utf8"), OUT_REL, fileSha);
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  writeFileSync(join(ROOT, OUT_REL), text);
  writeFileSync(join(ROOT, MANIFEST_REL), manifest);
  console.log(`sync-ukemi-course OK — ${OUT_REL} written (episode ${site.body.event_id}, body_digest ${site.body_digest}); manifest entry set to ${fileSha}`);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
