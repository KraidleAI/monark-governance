// apps/site/lib/dojo-served.ts -- the figures /dojo renders, by state, composed from the committed, hashed record
// the page loads (lib/dojo-served-load.ts). PURE (no I/O, type-only imports, no alias and no value import): the page renders these
// strings by property access and the render assertion derives its closed list of figures from the same function. States:
//   E0: no record (no served snapshot): no page and no link; EA: the head is abstained: its day, and the unit under a version in force;
//   E1: the head is counted with no version in force: day, readings made and scheduled, slots, lines, root, the two totals in token-days;
//   E2: counted under a version in force: E1 plus the unit in token-days, the count of holders and the dust threshold in tokens,
//       each shifted by the mint's decimals, never a price, and the Migration window of the anchor in force, in days (the tier sentence).
// FAIL-CLOSED: a record whose state and figures disagree throws, so the build reds rather than render a partial state.
// THE REREAD (components/dojo/dojo-live.tsx wires Web Crypto and a same-origin GET in; the root tests wire node:crypto and served
// trees): one view for the first paint and after the reread, its sentences chosen by dojoBodyOf and filled by sentenceParts (the one
// path of a figure). The reread head is shown only when Ed25519 answers the committed anchor's known answer, the reread of
// lib/dojo-live.ts holds and the loader's rules of a head hold (restated here: that loader reads files); else the committed figures
// and the sentence of the outcome, never its reason.
import type { DojoServedData, DojoServedHead } from "./dojo-served-load.ts";
import type { DojoLiveOutcome, VerifyEd25519 } from "./dojo-live.ts";
import type { DOJO_TABLE, DOJO_TEXT } from "./dojo-copy.ts";

interface DojoCountedFigures { day: string; reads_done: string; k_reads: string; slot_min: string; slot_max: string; lines_count: string; root: string; score_total: string; validated_total: string }
export type DojoPageFigures =
  | { state: "E0" }
  | { state: "EA"; day: string; validation_days: string; threshold_unit_token_days?: string }
  | ({ state: "E1"; validation_days: string } & DojoCountedFigures)
  | ({ state: "E2"; validation_days: string } & DojoVersionedFigures & DojoCountedFigures);
/** The figures of a state that renders: every state but E0. */
export type DojoShownFigures = Exclude<DojoPageFigures, { state: "E0" }>;

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

/** The figures of the committed record by state, with its anchor's validation window in days (E2: and its Migration window); E0 iff no record. */
export function dojoPageFiguresOf(data: DojoServedData | null): DojoPageFigures {
  if (data === null) return { state: "E0" };
  const h = data.head, validation_days = windowOf(data);
  if (h.status === "abstained") return { state: "EA", day: h.day, validation_days, ...unitOf(h) };
  if (h.slot_min === null || h.slot_max === null) return fail("a counted head carries no slots");
  const counted: DojoCountedFigures = { day: h.day, reads_done: String(h.reads_done), k_reads: String(h.k_reads), slot_min: String(h.slot_min), slot_max: String(h.slot_max),
    lines_count: String(h.lines_count), root: h.root, score_total: shiftUnits(h.score_total, h.decimals), validated_total: shiftUnits(h.validated_total, h.decimals) };
  if (h.price_version === null) return { state: "E1", validation_days, ...counted };
  if (h.threshold_unit === null || h.dust_threshold === null || h.holders_count === null) return fail("a version in force carries no unit, dust threshold or holders");
  return { state: "E2", ...counted, threshold_unit_token_days: shiftUnits(h.threshold_unit, h.decimals), holders_count: String(h.holders_count),
    dust_threshold_tokens: shiftUnits(h.dust_threshold, h.decimals), validation_days, migration_days: migrationOf(data) };
}

/** The figures of a record that renders (a record is never E0: the page is no page without one). */
const shownOf = (d: DojoServedData): DojoShownFigures => {
  const f = dojoPageFiguresOf(d);
  return f.state === "E0" ? fail("a record without figures") : f;
};

/** A part of a sentence of the closed list: its fixed text, or the figure one {name} names, read by property access. */
export type DojoPart = string | { name: string; value: string };
/** The parts of one sentence for the figures of one head: the one path of a figure (components/dojo/dojo-figures.tsx renders
 *  them). A {name} the state does not carry throws, so the build reds and the reread keeps the committed figures (fail-closed). */
export function sentenceParts(text: string, figures: DojoShownFigures): DojoPart[] {
  const values = new Map<string, string>(Object.entries(figures));
  return text.split(/([{][a-z_]+[}])/).map((part) => {
    const name = /^[{]([a-z_]+)[}]$/.exec(part)?.[1];
    if (name === undefined) return part;
    const value = name === "state" ? undefined : values.get(name);
    if (value === undefined) return fail(`the sentence names ${name}, a figure this state does not carry`);
    return { name, value };
  });
}

/** The keys of the closed list whose sentences carry figures, in the page's order: the head's sentence, the totals (never on an
 *  abstained day), the holders (E2), the unit or the absence of a version, the tier (E2). A version is in force in E2, and on an
 *  abstained day that carries the unit. One order for the first paint and after the reread. */
export type DojoBodyKey = "counted" | "abstained" | "totals" | "holder" | "holders" | "tiers" | "noVersion" | "tier";
export function dojoBodyOf(f: DojoShownFigures): DojoBodyKey[] {
  const e2 = f.state === "E2", versioned = e2 || (f.state === "EA" && f.threshold_unit_token_days !== undefined);
  const holders: DojoBodyKey[] = e2 ? [f.holders_count === "1" ? "holder" : "holders"] : [];
  return [f.state === "EA" ? "abstained" : "counted", ...(f.state === "EA" ? [] : ["totals" as const]), ...holders,
    versioned ? "tiers" : "noVersion", ...(e2 ? ["tier" as const] : [])];
}

/** The loader's rules of a head (lib/dojo-served-load.ts, loadDojoServed: same order, same words), restated for a head reread in
 *  the browser, which that loader never reads: the rule a head breaks, or null. Pinned to the loader's own refusals by test. */
export function dojoHeadRefusal(h: DojoServedHead): string | null {
  const versioned = [h.holders_count, h.threshold_unit, h.dust_threshold].map((x) => x !== null);
  const clause = "head: holders_count, threshold_unit and dust_threshold exist exactly with a price_version";
  if (versioned.some((x) => x !== (h.price_version !== null))) return clause;
  if ((h.slot_min === null) !== (h.slot_max === null) || (h.slot_min === null) !== (h.reads_done === 0)) return "head: slots exactly with a reading";
  if (h.slot_min !== null && h.slot_max !== null && h.slot_min > h.slot_max) return "head: slot_min exceeds slot_max";
  if ((h.status === "counted" && h.reads_done === 0) || h.reads_done > h.k_reads) return "head: reads_done is at least 1 when counted, at most k_reads";
  if (BigInt(h.validated_total) > BigInt(h.score_total) || (h.holders_count ?? 0) > h.lines_count) return "head: totals disagree";
  return null;
}

// -- The reread (components/dojo/dojo-live.tsx wires Web Crypto and a same-origin GET in; the root tests wire node:crypto and trees) --
/** The same-origin prefix of the published files (the site's proxy to the Dojo host, deploy/Caddyfile.monark-dojo-site.snippet), and
 *  the init of every GET of the reread: never a cached, redirected or credentialed read. */
export const DOJO_LIVE_PREFIX = "/dojo-served/";
export const DOJO_LIVE_FETCH_INIT = Object.freeze({ cache: "no-store", redirect: "error", credentials: "omit" } as const);
export type DojoText = { readonly [K in keyof typeof DOJO_TEXT]: string };
/** The figures of one head and the sentence of their source; once the reread has an outcome, that head, and its lines if it is reread. */
export interface DojoLiveView { figures: DojoShownFigures; note: string; head?: DojoServedHead; rows?: readonly string[] | null }
export interface DojoLiveViewDeps {
  /** The browser's Ed25519 (Web Crypto: the committed JWK imported, then verify); it rejects where the browser has none. */
  verifyEd25519: VerifyEd25519;
  /** signingBytes and signatureOf of lib/dojo-live.ts: the committed anchor line's signed bytes and signature, the known answer. */
  signingBytes: (line: Readonly<Record<string, unknown>>) => Uint8Array;
  signatureOf: (sig: unknown) => Uint8Array | null;
  /** rereadDojoHead of lib/dojo-live.ts over the same-origin GET, under the same Ed25519 check and the reader's tool's bounds. */
  reread: () => Promise<DojoLiveOutcome>;
  text: DojoText;
}
/** Ed25519 is usable here iff the committed anchor's signature checks under its committed key AND the same bytes with one byte
 *  changed do not: a known answer, never the success of an import alone. */
export async function dojoEd25519Usable(committed: DojoServedData, deps: Pick<DojoLiveViewDeps, "verifyEd25519" | "signingBytes" | "signatureOf">):
  Promise<boolean> {
  try {
    const a = committed.timeline.anchor, key = committed.keyring.keys.find((k) => k.key_id === a.key_id), sig = deps.signatureOf(a.sig);
    if (key === undefined || sig === null) return false;
    const signed = deps.signingBytes(a), bent = signed.map((b, i) => (i === 0 ? b ^ 1 : b));
    if (!(await deps.verifyEd25519(key.public_key.x, signed, sig))) return false;
    return !(await deps.verifyEd25519(key.public_key.x, bent, sig));
  } catch {
    return false;
  }
}
/** The first paint (the build): the committed figures, and the sentence that says what a browser that can then does. */
export const dojoFirstViewOf = (committed: DojoServedData, text: DojoText): DojoLiveView => ({ figures: shownOf(committed), note: text.rereadFirst });
/** The view after the reread. Without a usable Ed25519: the committed figures, and no GET at all (TXT-14b-r). A key line among the
 *  new lines: the committed figures (TXT-14d), whatever the walker would say of that line (declared: the figures are the committed
 *  ones either way). Any other refusal, a reread head that breaks the loader's rules of a head, or a sentence that cannot be filled:
 *  the committed figures (TXT-14c). The reread head's figures and its anchor's (TXT-14a) only when every check holds; never the reason of a refusal. */
export async function dojoLiveViewOf(committed: DojoServedData, deps: DojoLiveViewDeps): Promise<DojoLiveView> {
  const T = deps.text, first = dojoFirstViewOf(committed, T), keep = (note: string): DojoLiveView => ({ ...first, note, head: committed.head, rows: null });
  try {
    if (!(await dojoEd25519Usable(committed, deps))) return keep(T.rereadNoCheck);
    const o = await deps.reread();
    if (o.kind === "key_change") return keep(T.rereadKeyChange);
    if (o.kind === "fallback") return keep(T.rereadFallback);
    if (dojoHeadRefusal(o.head) !== null) return keep(T.rereadFallback);
    const figures = shownOf({ ...committed, head: o.head, timeline: { ...committed.timeline, anchor: o.anchor } });
    for (const k of dojoBodyOf(figures)) sentenceParts(T[k], figures);
    return { figures, note: T.rereadDone, head: o.head, rows: o.rows };
  } catch {
    return keep(T.rereadFallback);
  }
}

// -- The table of the lines (components/dojo/dojo-table.tsx wires the same GET and SHA-256 in; the root tests wire served trees) --
/** The words of the table (DOJO_TABLE of lib/dojo-copy.ts), injected as the sentences are. */
export type DojoTableWords = { readonly [K in keyof typeof DOJO_TABLE]: string };
/** One line of the head's lines file: the line AS SERVED, its address, its hold score (a decimal), whether the table lists it (a line whose
 *  day value is under the dust threshold of a version in force is bound and searched, never listed) and its cells, in the columns' order. */
export interface DojoTableRow { line: string; address: string; score: string; listed: boolean; cells: string[] }
/** wait: no table yet (the build, or a file still read): the sentence of a table to come; none: the head shown is abstained; refused: no
 *  line is listed, and a sentence says so; rows: every line, bound and searched in the order of the signed file (strict byte order of
 *  addresses), and the lines listed shown by hold score, highest first, equal hold scores by address; versioned: a version is in force. */
export type DojoTable = { kind: "wait" | "none" | "refused" }
  | { kind: "rows"; versioned: boolean; columns: string[]; bound: DojoTableRow[]; shown: DojoTableRow[] };
export interface DojoTableDeps {
  /** boundedSource of lib/dojo-live.ts over the same-origin GET: one read of a published file, under the reader's tool's limits. */
  read: (rel: string) => Promise<Uint8Array>;
  /** bindDojoLines of lib/dojo-live.ts: the lines of a lines file bound to the head that names it, or its refusal. */
  bind: (bytes: Uint8Array, head: DojoServedHead) => Promise<readonly string[] | string>;
  words: DojoTableWords;
  tiers: readonly string[];
}
/** The table before its lines are bound: nothing under an abstained head, else the sentence of a table to come (the build renders it). */
export const dojoTableFirstOf = (view: DojoLiveView): DojoTable => ({ kind: view.figures.state === "EA" ? "none" : "wait" });
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/, DECIMAL = /^(0|[1-9][0-9]*)$/;
const decimal = (x: unknown): x is string => typeof x === "string" && DECIMAL.test(x);
/** Hold score first (decimals compared by length, then by digits), then address (base58 is ASCII: its code units are its bytes). */
const byScore = (x: DojoTableRow, y: DojoTableRow): number =>
  y.score.length - x.score.length || (x.score === y.score ? (x.address < y.address ? -1 : 1) : x.score < y.score ? 1 : -1);
/** The table of the head the view shows, once the reread has an outcome and never before (one read of a file): the reread's lines when
 *  that head is the reread one (no second GET), else one GET of the committed head's lines file, bound to its signed values. Every line
 *  in form (an address of the base58 alphabet, in strict byte order; a class; three decimals and a day value, a decimal or null; a unit
 *  count and a tier index from zero to five under a version, both null without one; holder_counted a boolean under a version, never true
 *  for a program line, null without one), or no line; each cell a declared function of one field of its line. Listed: every line without a
 *  version; under one, all but the lines whose day value is under its dust threshold (one without a day value stays), each bound and searched. */
export async function dojoTableOf(view: DojoLiveView, deps: DojoTableDeps): Promise<DojoTable> {
  const h = view.head, W = deps.words;
  if (h === undefined || view.figures.state === "EA") return dojoTableFirstOf(view);
  try {
    const rows = view.rows ?? (await deps.bind(await deps.read(`lines/${h.lines_sha256}.jsonl`), h));
    if (typeof rows === "string") return { kind: "refused" };
    const versioned = h.price_version !== null, shift = (x: string): string => shiftUnits(x, h.decimals), dust = dustOf(h);
    const bound = rows.map((line): DojoTableRow => {
      const o = JSON.parse(line) as Record<string, unknown>, a = o.address, c = o.class, t = o.tier, u = o.units, hc = o.holder_counted;
      const tiered = versioned ? decimal(u) && Number.isSafeInteger(t) && (t as number) >= 0 && (t as number) <= 5 : u === null && t === null;
      if (typeof a !== "string" || !BASE58.test(a) || (c !== "holder" && c !== "program") || !tiered) return fail("a line out of form");
      const [s, v, p, m] = [o.score, o.validated, o.provisional, o.day_value];
      if (!decimal(s) || !decimal(v) || !decimal(p) || (m !== null && !decimal(m))) return fail("a line out of form");
      if (versioned ? typeof hc !== "boolean" || (c === "program" && hc) : hc !== null) return fail("a line out of form");
      const tier = versioned ? [u as string, t === 0 ? W.none : (deps.tiers[(t as number) - 1] ?? fail("a tier out of the list"))] : [];
      return { line, address: a, score: s, listed: dust === null || m === null || BigInt(m) >= dust, cells: [a, W[c], shift(s), shift(v), shift(p), ...tier] };
    });
    if (bound.some((r, i) => i > 0 && (bound[i - 1] as DojoTableRow).address >= r.address)) return { kind: "refused" };
    const columns = [W.address, W.class, W.holdScore, W.validated, W.provisional, ...(versioned ? [W.units, W.tier] : [])];
    return { kind: "rows", versioned, columns, bound, shown: bound.filter((r) => r.listed).sort(byScore) };
  } catch {
    return { kind: "refused" };
  }
}

/** The identity of the head a view shows, which the table of its lines is keyed by (components/dojo/dojo-live.tsx): when the head shown
 *  changes, the table starts over from its first state for that head, never a sentence or a line of the head shown before; empty before
 *  the reread has an outcome. */
export const dojoTableKeyOf = (view: DojoLiveView): string => view.head?.line_hash ?? "";

// -- Declared last, so that no line above them moves (the killers of the tests name lines of this file) --
/** The validation window of the record's anchor in days, which the method sentence names (never a literal of the closed list): the
 *  loader's integer of at least one, else fail-closed. */
function windowOf(data: DojoServedData): string {
  const w = data.timeline.anchor.validation_days;
  return typeof w === "number" && Number.isSafeInteger(w) && w >= 1 ? String(w) : fail("the anchor carries no validation window");
}
/** The unit of an abstained head in token-days, under a version in force; nothing without one. */
function unitOf(h: DojoServedHead): { threshold_unit_token_days?: string } {
  return h.threshold_unit === null ? {} : { threshold_unit_token_days: shiftUnits(h.threshold_unit, h.decimals) };
}
/** The dust threshold of the version in force at the head, in base units, to which the table compares the day value of a line (the version
 *  line's, as the loader and the reread carry it): null without a version; a version without a decimal threshold is fail-closed (no line). */
function dustOf(h: DojoServedHead): bigint | null {
  return h.price_version === null ? null : decimal(h.dust_threshold) ? BigInt(h.dust_threshold) : fail("a version without its dust threshold");
}
/** The Migration window of the record's anchor in days, tier_windows[4], which the tier sentence names (never a literal of the closed list,
 *  DOJO-COPY-DURATIONS-DERIVED-1): the loader's integer of at least one, else fail-closed. */
function migrationOf(data: DojoServedData): string {
  const w = data.timeline.anchor.tier_windows, m: unknown = Array.isArray(w) ? w[4] : undefined;
  return typeof m === "number" && Number.isSafeInteger(m) && m >= 1 ? String(m) : fail("the anchor carries no Migration window");
}
/** The figures E2 adds to E1: the unit in token-days, the count of holders, the dust threshold in tokens, the Migration window in days. */
interface DojoVersionedFigures { threshold_unit_token_days: string; holders_count: string; dust_threshold_tokens: string; migration_days: string }

// -- DOJO-PAGE-FOLD-1, declared last for the same reason: the page shows the figures of the day and folds its explanations --
/** The keys of dojoBodyOf after the head's sentence, split as the page shows them: at the opening, the figures of the day (the totals,
 *  the holders); in the fold "How it is counted", below the table, the tier sentences (the unit under a version in force, or its absence,
 *  then the tier of an address). Each part keeps the order of dojoBodyOf; the head's sentence is never folded. */
export function dojoFoldOf(keys: readonly DojoBodyKey[]): [open: DojoBodyKey[], counted: DojoBodyKey[]] {
  const folded = (k: DojoBodyKey): boolean => k === "tiers" || k === "noVersion" || k === "tier";
  return [keys.filter((k) => !folded(k)), keys.filter(folded)];
}
