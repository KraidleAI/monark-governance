// MONARK Bell, the check of a rebase trajectory against the pinned reference: a pure port of JS_TRAJ of apps/bell/ops/launch-q6.sh. For each
// mint, the trajectory's entry is complete (scanComplete true, scanMethod "authority", an events array), and its events start with the
// reference's, compared on the eight-field event key. A missing or incomplete entry is trajectory_stale (no usable trajectory: produce
// again); a reference without the mint, fewer events than it, or one event that differs is trajectory_mismatch. No I/O, no clock.

/** The eight fields of the event key, in the order of JS_TRAJ's K. */
export const EVENT_KEY_FIELDS = Object.freeze(["kind", "multiplier", "multiplierBitsHex", "effectiveTimestampSec", "blockTimeSec", "slot", "instructionIndex",
  "signature"] as const);
type O = Record<string, unknown>;
const obj = (x: unknown): O => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as O) : {});
/** The key of one event: its eight fields joined by "|", an absent field read as an empty string (Array.prototype.join, as K does). */
export const eventKey = (e: unknown): string => EVENT_KEY_FIELDS.map((k) => obj(e)[k]).join("|");

export type TrajectoryVerdict = { readonly ok: true; readonly lines: readonly string[] }
  | { readonly ok: false; readonly code: "trajectory_stale" | "trajectory_mismatch"; readonly detail: string };
/** The verdict on `trajectory` (the parsed produced file) against `reference` (the parsed reference file), for each of `mints` in order. */
export function checkTrajectory(trajectory: unknown, reference: unknown, mints: readonly string[]): TrajectoryVerdict {
  const lines: string[] = [];
  for (const m of mints) {
    const t = obj(obj(trajectory)[m]), r = obj(obj(reference)[m]);
    if (t.scanComplete !== true || t.scanMethod !== "authority" || !Array.isArray(t.events)) return { ok: false, code: "trajectory_stale", detail: `entry ${m} absent or incomplete` };
    if (!Array.isArray(r.events)) return { ok: false, code: "trajectory_mismatch", detail: `the reference holds no ${m}` };
    const te: readonly unknown[] = t.events, re: readonly unknown[] = r.events;
    if (te.length < re.length) return { ok: false, code: "trajectory_mismatch", detail: `${m}: fewer events than the reference` };
    for (let i = 0; i < re.length; i++) if (eventKey(te[i]) !== eventKey(re[i])) return { ok: false, code: "trajectory_mismatch", detail: `${m}: event ${String(i)} differs from the reference` };
    lines.push(`traj_${m}_events=${String(te.length)} ref=${String(re.length)} new=${String(te.length - re.length)}`);
  }
  return { ok: true, lines };
}
