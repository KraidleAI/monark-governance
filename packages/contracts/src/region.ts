import type { PredictionRegion } from "./types.ts";

/**
 * Containment predicate, per region variant (ADR-M001 C6).
 * The set|interval union must NOT leak into the decision layer: a `set` region
 * contains string labels; an `interval` region contains a number in [lo, hi].
 * A null intent is never contained. This is what lets UKEMI (interval) plug in.
 */
export function intentInRegion(
  intent: string | number | null,
  region: PredictionRegion,
): boolean {
  if (intent === null) return false;
  if (region.kind === "set") {
    return typeof intent === "string" && region.labels.includes(intent);
  }
  return typeof intent === "number" && region.lo <= intent && intent <= region.hi;
}
