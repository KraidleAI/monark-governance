// apps/site/lib/dojo-served.ts -- the figures /dojo renders, by state, composed from the committed, hashed record
// the page loads (lib/dojo-served-load.ts). PURE (no I/O, type-only imports, no alias and no value import): the page renders these
// strings by property access and the render assertion derives its closed list of figures from the same function. States:
//   E0: no record (no served snapshot): no page and no link; EA: the head is abstained: its day, and the unit under a version in force;
//   E1: the head is counted with no version in force: day, readings made and scheduled, slots, lines, root, the two totals in token-days;
//   E2: counted under a version in force: E1 plus the unit in token-days, the count of holders and the dust threshold in tokens,
//       each shifted by the mint's decimals, never a price.
// FAIL-CLOSED: a record whose state and figures disagree throws, so the build reds rather than render a partial state.
import type { DojoServedData } from "./dojo-served-load.ts";

interface DojoCountedFigures { day: string; reads_done: string; k_reads: string; slot_min: string; slot_max: string; lines_count: string; root: string; score_total: string; validated_total: string }
export type DojoPageFigures =
  | { state: "E0" }
  | { state: "EA"; day: string; threshold_unit_token_days?: string }
  | ({ state: "E1" } & DojoCountedFigures)
  | ({ state: "E2"; threshold_unit_token_days: string; holders_count: string; dust_threshold_tokens: string } & DojoCountedFigures);

function fail(why: string): never {
  throw new Error(`dojo figures: ${why} (fail-closed)`);
}
/** An unsigned integer string shifted right by `decimals` places, exactly (string arithmetic; same result as shiftDecimal of
 *  lib/bell-served-load.ts, which a lib module cannot import by value; pinned equal by test/dojo-served.test.ts). */
export function shiftUnits(raw: string, decimals: number): string {
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(decimals) || decimals < 0) return fail("an unsigned integer string and a non-negative integer are required");
  const padded = raw.padStart(decimals + 1, "0"), cut = padded.length - decimals, whole = padded.slice(0, cut).replace(/^0+(?=\d)/, "");
  return decimals === 0 ? whole : `${whole}.${padded.slice(cut)}`;
}

/** The figures of the committed record by state; E0 exactly when there is no record. */
export function dojoPageFiguresOf(data: DojoServedData | null): DojoPageFigures {
  if (data === null) return { state: "E0" };
  const h = data.head;
  if (h.status === "abstained") return h.threshold_unit === null ? { state: "EA", day: h.day } : { state: "EA", day: h.day, threshold_unit_token_days: shiftUnits(h.threshold_unit, h.decimals) };
  if (h.slot_min === null || h.slot_max === null) return fail("a counted head carries no slots");
  const counted: DojoCountedFigures = { day: h.day, reads_done: String(h.reads_done), k_reads: String(h.k_reads), slot_min: String(h.slot_min), slot_max: String(h.slot_max),
    lines_count: String(h.lines_count), root: h.root, score_total: shiftUnits(h.score_total, h.decimals), validated_total: shiftUnits(h.validated_total, h.decimals) };
  if (h.price_version === null) return { state: "E1", ...counted };
  if (h.threshold_unit === null || h.dust_threshold === null || h.holders_count === null) return fail("a version in force carries no unit, dust threshold or holders");
  return { state: "E2", ...counted, threshold_unit_token_days: shiftUnits(h.threshold_unit, h.decimals), holders_count: String(h.holders_count),
    dust_threshold_tokens: shiftUnits(h.dust_threshold, h.decimals) };
}
