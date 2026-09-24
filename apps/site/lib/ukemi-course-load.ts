// apps/site/lib/ukemi-course-load.ts — the Ukemi U-4b calibration course, read fail-closed from the committed, hashed copy
// of the course's hypothesis report (apps/site/data/ukemi-course.json, a copy of the course output hyp-report-weth-2025-09-22.json,
// body_digest-bound, produced by scripts/census/u4b/u4b-hyp.mjs at step 6d of the course, 2026-09-23). The page renders the
// facts of the report as reported: pre-registered verdicts (OUI / NON / UNDER_CALIB), counts and fractions. Never a probability
// of being right: a verdict is a test outcome at a stated level, nothing more. Decision 161 (2026-09-23): shown on /ukemi.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
export const UKEMI_COURSE_REL = "apps/site/data/ukemi-course.json";

export interface UkemiStratum { stratum: number; n: number; verdict: string; served: boolean; covered: number | null; trials: number | null; level: string | null }
export interface UkemiCourse {
  event_id: string;
  tool_sha256: string;
  body_digest: string;
  strata: UkemiStratum[];
  pooled: { n: number; covered: number; trials: number; verdict: string; level: string };
  h4: { threshold: string; class_a: { n: number; multi_call: number; verdict: string }; all: { n: number; multi_call: number; verdict: string } };
  h6: { verdict: string; max_lag_bound: number; n_updates: number };
  h5: { population: number; k: number; meets: boolean };
  clause_359: { condition_satisfied: boolean; no_non_on_served: boolean; unresolved: number };
}

const HEX64 = /^[0-9a-f]{64}$/;
const VERDICT = /^(OUI|NON|UNDER_CALIB)$/;
function int(v: unknown, where: string): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0) throw new Error(`ukemi course: ${where} must be a non-negative integer`);
  return v;
}
function verdict(v: unknown, where: string): string {
  if (typeof v !== "string" || !VERDICT.test(v)) throw new Error(`ukemi course: ${where} is not a pre-registered verdict`);
  return v;
}
function rec(v: unknown, where: string): Record<string, unknown> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) throw new Error(`ukemi course: ${where} must be an object`);
  return v as Record<string, unknown>;
}

export function loadUkemiCourse(rootDir: string): UkemiCourse {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") throw new Error("ukemi course: site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[UKEMI_COURSE_REL];
  if (typeof expected !== "string") throw new Error(`ukemi course: ${UKEMI_COURSE_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, UKEMI_COURSE_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) throw new Error(`ukemi course: sha256 mismatch for ${UKEMI_COURSE_REL} (manifest ${expected}, actual ${actual})`);
  const file = rec(JSON.parse(raw), "file");
  if ("$comment" in file && typeof file.$comment !== "string") throw new Error("ukemi course: $comment must be a string");
  if (file.schema !== "ukemi-u4b-hyp/1" || file.kind !== "report") throw new Error("ukemi course: not a ukemi-u4b-hyp/1 report");
  const body = rec(file.body, "body");
  const tool = rec(rec(file.provenance, "provenance").tool, "provenance.tool");
  if (typeof file.body_digest !== "string" || !HEX64.test(file.body_digest)) throw new Error("ukemi course: body_digest malformed");
  if (typeof tool.sha256_lf !== "string" || !HEX64.test(tool.sha256_lf)) throw new Error("ukemi course: tool sha malformed");
  const h3 = rec(body.h3, "h3");
  if (!Array.isArray(h3.strata) || h3.strata.length < 1) throw new Error("ukemi course: h3.strata missing");
  const strata = h3.strata.map((s, i) => {
    const o = rec(s, `h3.strata[${String(i)}]`), fresh = rec(o.fresh, "fresh"), e2 = rec(o.e2, "e2");
    const served = o.served === true;
    return {
      stratum: int(o.strate, "strate"), n: int(fresh.n, "fresh.n"), verdict: verdict(o.verdict, "h3 outcome"), served,
      covered: served ? int(e2.k_covered, "e2.k_covered") : null, trials: served ? int(e2.n, "e2.n") : null,
      level: served && typeof o.level === "string" ? o.level : null,
    };
  });
  const p = rec(h3.pooled, "h3.pooled"), pf = rec(p.fresh, "pooled.fresh"), pe = rec(p.e2, "pooled.e2");
  const h4 = rec(body.h4, "h4"), h4a = rec(h4.class_a_liquidated, "h4.class_a"), h4b = rec(h4.all_liquidated, "h4.all");
  const h6 = rec(body.h6, "h6"), h6s = rec(h6.series, "h6.series");
  const h5 = rec(body.h5, "h5");
  const c = rec(body.clause_359, "clause_359");
  if (typeof h4.threshold !== "string" || typeof p.level !== "string") throw new Error("ukemi course: levels must be strings");
  return {
    event_id: String(body.event_id),
    tool_sha256: tool.sha256_lf,
    body_digest: file.body_digest,
    strata,
    pooled: { n: int(pf.n, "pooled.n"), covered: int(pe.k_covered, "pooled.covered"), trials: int(pe.n, "pooled.trials"), verdict: verdict(p.verdict, "pooled outcome"), level: p.level },
    h4: {
      threshold: h4.threshold,
      class_a: { n: int(h4a.n, "h4.a.n"), multi_call: int(h4a.multi_call, "h4.a.multi"), verdict: verdict(h4a.verdict, "h4 class-a outcome") },
      all: { n: int(h4b.n, "h4.all.n"), multi_call: int(h4b.multi_call, "h4.all.multi"), verdict: verdict(h4b.verdict, "h4 all outcome") },
    },
    h6: { verdict: verdict(h6.verdict, "h6 outcome"), max_lag_bound: int(h6.max_lag_bound, "h6.bound"), n_updates: int(h6s.n_updates, "h6.n_updates") },
    h5: { population: int(h5.population_mono_weth, "h5.population"), k: int(h5.k_h5, "h5.k"), meets: h5.meets_k_h5 === true },
    clause_359: { condition_satisfied: c.condition_satisfied === true, no_non_on_served: c.h3_no_NON_on_served_strata === true, unresolved: int(c.labels_no_quorum_unresolved, "clause.unresolved") },
  };
}
