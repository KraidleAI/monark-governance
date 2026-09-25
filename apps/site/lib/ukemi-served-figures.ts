// apps/site/lib/ukemi-served-figures.ts — the figures /ukemi renders for the committed stratum, read from the two
// committed, hashed files the page loads: the served state of the class (lib/ukemi-served-load.ts, its dated served
// verdict) and the course report (lib/ukemi-course-load.ts, the bound margin as the report prints it).
// PURE (no I/O, type-only imports, no alias and no value import): the page renders these strings by property access.
// FAIL-CLOSED: an empty registry has no figure (null); a committed registry must carry its served verdict, the stratum
// of that verdict must be in the report and meet its floor, and the two files must agree on the calibration points and
// on the bound margin of that stratum; otherwise this throws, so the build reds rather than render a figure the files
// do not agree on, or a page without its figures. No string literal of this module carries a digit.
import type { UkemiCourse } from "./ukemi-course-load.ts";
import type { UkemiServed } from "./ukemi-served-load.ts";

/** The figures of the committed stratum, each the exact string the page renders. */
export interface UkemiServedFigures {
  /** The served count of calibration points of the stratum (liq_verdict.calibration_points). */
  points: string;
  /** The bound margin as the report prints it for the stratum (display.strata_qhat of that stratum). */
  boundMargin: string;
  /** The served calibration digest of the stratum (liq_verdict.calibration_digest). */
  digest: string;
  /** The day the served verdict was read (the ISO date of read_at). */
  readDate: string;
}

function fail(msg: string): never {
  throw new Error(`ukemi served figures: ${msg} (fail-closed)`);
}

/** The figures of the committed stratum; null exactly while the served registry is empty. */
export function servedFiguresOf(served: UkemiServed, course: UkemiCourse): UkemiServedFigures | null {
  if (served.registry_state === "empty") return null;
  const v = served.liq_verdict;
  if (v === null) fail("a committed served state carries no served verdict");
  const x = course.strata.find((s) => s.stratum === v.stratum);
  if (x === undefined) fail(`the served stratum ${String(v.stratum)} is absent from the course report`);
  if (!x.meets_floor || x.bound_margin === null) fail(`the served stratum ${String(v.stratum)} does not meet its floor in the course report`);
  if (v.calibration_points !== x.n) fail("the served calibration points are not the report's count for the stratum");
  if (v.bound_margin_base === null || v.bound_margin_base !== x.bound_margin_base) fail("the served bound margin is not the report's for the stratum");
  return { points: String(v.calibration_points), boundMargin: x.bound_margin, digest: v.calibration_digest, readDate: served.read_at.slice(0, 10) };
}
