// MONARK Bell, the handoff's state as the collection tick reads it (lot 3b-i, PLAN-P3 C3-7 and C3-8, G0 DC-3 and DC-4). Pure: no clock,
// no file, no environment. The readers take the TEXT of a file (null: the file is absent, an empty list) and check its form: start
// {"from_unit","posted_at"}, published.jsonl {"bundle","manifest_sha256","seq","published_at"}, refused.jsonl {"bundle","manifest_sha256",
// "code","refused_at"}, written by the publisher, and the tick's own state/abandoned.jsonl {"unit","reason","abandoned_at"} (a line of
// part 2 has no abandoned_at). The keys named are required with their shape; other keys are tolerated. A line that does not read names its
// file (the tick refuses state_missing). Three decisions follow: recollectOf (the unit the publisher refused, to collect again as
// unit-<D>-r<n+1>), backlogOf (the units deposited after the start mark and not yet published, null until the first publication) and
// prunable (what the five rules of DC-4 allow to remove, each PRUNE_AFTER_MS after the fact that allows it, nothing before the mark).
import { UNIT_NAME } from "../scripts/bell-validate.mjs";

/** The backlog threshold BACKLOG_MAX (8) and the purge delay PRUNE_AFTER_MS (seven days) of DC-4 and PLAN-P3 C3-2 are deployment constants of
 *  scripts/bell-deploy.mjs (DC-4 keeps caps and margins there; item BELL-STATUS-CONSTANTS-DEPLOY-1), imported, and re-exported for the tick. */
import { BACKLOG_MAX, PRUNE_AFTER_MS } from "../../../scripts/bell-deploy.mjs";
export { BACKLOG_MAX, PRUNE_AFTER_MS };

export interface StartMark { readonly from_unit: string; readonly posted_at: string }
export interface PublishedLine { readonly bundle: string; readonly manifest_sha256: string; readonly seq: number; readonly published_at: string }
export interface RefusedLine { readonly bundle: string; readonly manifest_sha256: string; readonly code: string; readonly refused_at: string }
export interface AbandonedLine { readonly unit: string; readonly reason: string; readonly abandoned_at: string | null }
/** A bundle of the handoff directory with its sibling manifest: its name, the sha256 of the manifest's text, and whether its directory is there. */
export interface Deposit { readonly name: string; readonly manifest_sha256: string; readonly dir: boolean }
/** What the tick reads: the handoff's state, its own abandon lines, the bundles and tombstones of the handoff, the days of quarantine/. */
export interface HandoffView {
  readonly start: StartMark | null;
  readonly published: readonly PublishedLine[];
  readonly refused: readonly RefusedLine[];
  readonly abandoned: readonly AbandonedLine[];
  readonly deposits: readonly Deposit[];
  readonly tombstones: readonly string[]; // the <D> of each unit-<D>.abandoned
  readonly quarantined: readonly string[]; // the <D> of each quarantine/<D>/
}
export type StatusTexts = { readonly start: string | null; readonly published: string | null; readonly refused: string | null; readonly abandoned: string | null };
export type StatusRead = { readonly ok: true; readonly start: StartMark | null; readonly published: PublishedLine[]; readonly refused: RefusedLine[]; readonly abandoned: AbandonedLine[] }
  | { readonly ok: false; readonly file: string };
/** One entry the purge removes: a name of the handoff directory (with its sibling manifest) or a <D> of quarantine/. */
export interface Prunable { readonly where: "handoff" | "quarantine"; readonly name: string }

const DATE = /^\d{4}-\d{2}-\d{2}$/, SHA = /^[0-9a-f]{64}$/, CODE = /^[a-z][a-z0-9_]{0,63}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const isIso = (x: unknown): x is string => typeof x === "string" && ISO.test(x) && Number.isFinite(Date.parse(x));
const isStr = (re: RegExp) => (x: unknown): x is string => typeof x === "string" && re.test(x);
const parse = (text: string): unknown => { try { return JSON.parse(text) as unknown; } catch { return null; } };
const objectOf = (x: unknown): Record<string, unknown> | null => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : null);
/** The <D> of a bundle name (unit-<D>[-r<n>]) or of a tombstone (unit-<D>.abandoned). */
export const dayOf = (name: string): string => name.slice(5, 15);
/** The revision of a bundle name: n of unit-<D>-r<n>, 0 for unit-<D>. */
export const revisionOf = (name: string): number => Number(/-r(\d+)$/.exec(name)?.[1] ?? "0");

/** The lines of a JSON-lines text, each checked by `line`; null when one does not read (a final LF is the only empty line allowed). */
function linesOf<T>(text: string | null, line: (o: Record<string, unknown>) => T | null): T[] | null {
  if (text === null || text === "") return [];
  const rows = (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n"), out: T[] = [];
  for (const r of rows) { const o = objectOf(parse(r)), v = o === null ? null : line(o); if (v === null) return null; out.push(v); }
  return out;
}
const publishedLine = (o: Record<string, unknown>): PublishedLine | null =>
  (isStr(UNIT_NAME)(o.bundle) && isStr(SHA)(o.manifest_sha256) && Number.isSafeInteger(o.seq) && (o.seq as number) >= 0 && isIso(o.published_at)
    ? { bundle: o.bundle, manifest_sha256: o.manifest_sha256, seq: o.seq as number, published_at: o.published_at } : null);
const refusedLine = (o: Record<string, unknown>): RefusedLine | null =>
  (isStr(UNIT_NAME)(o.bundle) && isStr(SHA)(o.manifest_sha256) && isStr(CODE)(o.code) && isIso(o.refused_at)
    ? { bundle: o.bundle, manifest_sha256: o.manifest_sha256, code: o.code, refused_at: o.refused_at } : null);
const abandonedLine = (o: Record<string, unknown>): AbandonedLine | null =>
  (isStr(DATE)(o.unit) && isStr(CODE)(o.reason) && (o.abandoned_at === undefined || isIso(o.abandoned_at))
    ? { unit: o.unit, reason: o.reason, abandoned_at: o.abandoned_at ?? null } : null);

/** The four texts read and checked; the first that does not read is named by its file. */
export function readStatus(t: StatusTexts): StatusRead {
  const s = t.start === null ? null : objectOf(parse(t.start));
  if (t.start !== null && (s === null || !isStr(DATE)(s.from_unit) || !isIso(s.posted_at))) return { ok: false, file: "start" };
  const published = linesOf(t.published, publishedLine);
  if (published === null) return { ok: false, file: "published.jsonl" };
  const refused = linesOf(t.refused, refusedLine);
  if (refused === null) return { ok: false, file: "refused.jsonl" };
  const abandoned = linesOf(t.abandoned, abandonedLine);
  if (abandoned === null) return { ok: false, file: "abandoned.jsonl" };
  return { ok: true, start: s === null ? null : { from_unit: s.from_unit as string, posted_at: s.posted_at as string }, published, refused, abandoned };
}

const publishedDays = (v: HandoffView): Set<string> => new Set(v.published.map((p) => dayOf(p.bundle)));
const abandonedDays = (v: HandoffView): Set<string> => new Set([...v.abandoned.map((a) => a.unit), ...v.tombstones]);
/** The <D> at or after the mark of the bundles in place (directory and manifest), neither published nor abandoned, in order. */
function pendingDays(v: HandoffView, from: string): string[] {
  const pub = publishedDays(v), gone = abandonedDays(v);
  return [...new Set(v.deposits.filter((x) => x.dir).map((x) => dayOf(x.name)))].filter((d) => d >= from && !pub.has(d) && !gone.has(d)).sort();
}

/** C3-7: the first <D> at or after the mark whose last revision in place is refused (name and manifest sha256), neither published nor
 *  abandoned: { d, next: "unit-<D>-r<n+1>", code } with the code of that refusal; else null. No mark: null. */
export function recollectOf(v: HandoffView): { readonly d: string; readonly next: string; readonly code: string } | null {
  if (v.start === null) return null;
  for (const d of pendingDays(v, v.start.from_unit)) {
    const last = v.deposits.filter((x) => x.dir && dayOf(x.name) === d).reduce((a, x) => (revisionOf(x.name) > revisionOf(a.name) ? x : a));
    const r = v.refused.findLast((x) => x.bundle === last.name && x.manifest_sha256 === last.manifest_sha256);
    if (r !== undefined) return { d, next: `unit-${d}-r${String(revisionOf(last.name) + 1)}`, code: r.code };
  }
  return null;
}

/** DC-4: the number of units at or after the mark deposited and neither published nor abandoned; null (disarmed) while published.jsonl
 *  holds no line, or without a mark. */
export function backlogOf(v: HandoffView): number | null {
  return v.start === null || v.published.length === 0 ? null : pendingDays(v, v.start.from_unit).length;
}

const earliest = (xs: ReadonlyArray<string | null | undefined>): number => Math.min(...xs.map((x) => (x === null || x === undefined ? Infinity : Date.parse(x))));
/** DC-4, the purge: the entries the five rules allow to remove, each PRUNE_AFTER_MS after the instant that allows it; nothing before the mark.
 *  (1) a bundle published (name and manifest sha256): its published_at; (2) a bundle whose <D> is before the mark: the mark's posted_at;
 *  (3) a refused bundle (name and manifest sha256) whose <D> has a revision published, or is abandoned: the first published_at of that <D>,
 *  or its abandoned_at; (4) a tombstone whose <D> is before the last unit published: the first published_at of a later <D>; (5) quarantine/<D>/
 *  under the condition of its <D>: the first published_at of <D>, the posted_at if <D> is before the mark, its abandoned_at. */
export function prunable(v: HandoffView, nowMs: number): Prunable[] {
  const s = v.start;
  if (s === null) return [];
  const pubAt = (d: string): number => earliest(v.published.filter((p) => dayOf(p.bundle) === d).map((p) => p.published_at));
  const abandonedAt = (d: string): number => earliest(v.abandoned.filter((a) => a.unit === d).map((a) => a.abandoned_at));
  const markAt = (d: string): number => (d < s.from_unit ? Date.parse(s.posted_at) : Infinity);
  const ripe = (at: number): boolean => nowMs - at >= PRUNE_AFTER_MS;
  const out: Prunable[] = [];
  for (const x of v.deposits) {
    const d = dayOf(x.name), same = (y: { bundle: string; manifest_sha256: string }): boolean => y.bundle === x.name && y.manifest_sha256 === x.manifest_sha256;
    const own = earliest(v.published.filter(same).map((p) => p.published_at));
    const settled = v.refused.some(same) ? Math.min(pubAt(d), abandonedAt(d)) : Infinity;
    if (ripe(Math.min(own, markAt(d), settled))) out.push({ where: "handoff", name: x.name });
  }
  for (const d of v.tombstones) {
    if (ripe(earliest(v.published.filter((p) => dayOf(p.bundle) > d).map((p) => p.published_at)))) out.push({ where: "handoff", name: `unit-${d}.abandoned` });
  }
  for (const d of v.quarantined) if (ripe(Math.min(pubAt(d), markAt(d), abandonedAt(d)))) out.push({ where: "quarantine", name: d });
  return out;
}
