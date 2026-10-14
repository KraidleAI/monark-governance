// MONARK @monark/rpc-guard, the billing cycle of an operator, DERIVED at each run from the account's anchor instant, never posed
// by hand. Convention: the anchor is an ISO instant WITH its UTC offset ("2026-09-19T14:30:00-04:00", or "...Z"); a cycle starts
// at the anchor and at the same wall-clock day and time of each following civil month, read in that fixed offset, the day clamped
// to the month's last day (an anchor on the 31st starts the February cycle on the 28th or 29th and the March one on the 31st again:
// the clamp never accumulates). The identifier is "<op>-<YYYY-MM-DD>", the wall-clock date of the cycle's start in that offset.
// An anchor without an offset, a malformed one (offset minutes above 59), an instant before the anchor, a malformed label: refused by name.
// Pure: no clock, no I/O, no environment, no endpoint.
const ANCHOR = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/;
const OP = /^[a-z][a-z0-9-]*$/;
interface Anchor { readonly y: number; readonly m: number; readonly d: number; readonly h: number; readonly mi: number; readonly s: number; readonly ms: number; readonly offsetMin: number }

const daysIn = (y: number, m: number): number => new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); // m: 0..11

function parseAnchor(anchorIso: string): Anchor {
  const g = ANCHOR.exec(anchorIso);
  if (g === null) throw new RangeError("cycle: anchor is not an ISO instant with its UTC offset");
  const n = (i: number): number => Number(g[i] ?? "0");
  const y = n(1), mo = n(2), d = n(3), h = n(4), mi = n(5), s = n(6), ms = Number((g[7] ?? "").padEnd(3, "0"));
  const z = g[8] ?? "Z", offM = z === "Z" ? 0 : Number(z.slice(4, 6)), offsetMin = z === "Z" ? 0 : (z.startsWith("-") ? -1 : 1) * (Number(z.slice(1, 3)) * 60 + offM);
  if (offM > 59 || y < 1970 || mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo - 1) || h > 23 || mi > 59 || s > 59 || Math.abs(offsetMin) > 14 * 60) {
    throw new RangeError("cycle: anchor out of range");
  }
  return { y, m: mo - 1, d, h, mi, s, ms, offsetMin };
}

/** The UTC instant cycle k starts (k = 0: the anchor). */
function startOf(a: Anchor, k: number): number {
  const total = a.m + k, y = a.y + Math.floor(total / 12), m = ((total % 12) + 12) % 12;
  const d = Math.min(a.d, daysIn(y, m));
  return Date.UTC(y, m, d, a.h, a.mi, a.s, a.ms) - a.offsetMin * 60_000;
}

/** The index of the cycle that holds nowMs (start <= nowMs < next start). */
function indexOf(nowMs: number, a: Anchor): number {
  if (!Number.isFinite(nowMs)) throw new RangeError("cycle: the instant is not a finite number of milliseconds");
  if (nowMs < startOf(a, 0)) throw new RangeError("cycle: the instant precedes the anchor");
  const wall = new Date(nowMs + a.offsetMin * 60_000);
  let k = Math.max(0, (wall.getUTCFullYear() - a.y) * 12 + wall.getUTCMonth() - a.m);
  while (k > 0 && startOf(a, k) > nowMs) k--;
  while (startOf(a, k + 1) <= nowMs) k++;
  return k;
}

/** The identifier "<op>-<YYYY-MM-DD>" of the cycle in force at nowMs for the anchor anchorIso. */
export function cycleOf(nowMs: number, anchorIso: string, op: string): string {
  if (!OP.test(op)) throw new RangeError("cycle: operator label malformed");
  const a = parseAnchor(anchorIso);
  const start = new Date(startOf(a, indexOf(nowMs, a)) + a.offsetMin * 60_000);
  return `${op}-${start.toISOString().slice(0, 10)}`;
}

/** The UTC instant the next cycle starts after the one in force at nowMs (a run that would cross it straddles two cycles). */
export function nextCycleBoundary(nowMs: number, anchorIso: string): number {
  const a = parseAnchor(anchorIso);
  return startOf(a, indexOf(nowMs, a) + 1);
}
