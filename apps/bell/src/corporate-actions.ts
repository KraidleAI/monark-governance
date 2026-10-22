// MONARK Bell: the corporate-action window (BELL-JUSTESSE-1, part 1, lot 1a-i; G0 DJ-1, DJ-2, DJ-3, DJ-10). Pure functions: no
// network, no file read, no clock (the caller passes nowSec). Lot 1a-ii wires them into collect(); lot 1b feeds them the signals.
//
// DJ-1, the rule. For an event (D the execution day at Massive, T the activation second of the token's multiplier), a fill at t of
// the session group s is wrong iff [floor(t/1000) >= T] != [refCloseDateOf(s) >= D]: the token's unit and its reference close's unit
// differ. A group (session|regime|anchor, collect.ts l.139-146) with a wrong fill, or whose envelope contains T, abstains whole. The
// envelope is [start of the group's first piece, end of its last) at classifySession's minute bounds: a night group in two pieces
// (late evening of the anchor, early morning of the next trading day) contains the weekend or holiday between them (G0, line dated
// 2026-10-22 04:4x UTC). Volume: the group abstains when its ADV month contains D, or when [t >= T] differs, for a fill, from [ADV
// month at or after the month of D].
// DJ-2, the signals. M (Massive splits): D and k = split_to/split_from. E (the issuer's API): T_E, multipliers, type, versions. C (the
// replayed trajectory): T_C and its ratio. T = T_C of a paired step; without a step, T = +Infinity (the token is still in the old
// unit). E adds the anticipation of the group that contains T_E (every version) and issuer_time_without_step. D unknown: candidates
// {prevTradingDay(dT), dT, nextTradingDay(dT)}, dT the anchor of the group that contains T. A disagreement on k or on T abstains on
// the union of the windows and writes one line. Pairing C with E on the bits of the new multiplier, else relative 1e-9 with a line
// multiplier_bits_mismatch, never on the hour; M with an event on the date (D among the candidates of its T).
// DJ-3, the types. A CashDividend paired with a step is marked cash_dividend iff |k - 1| < 0.005 and no pending update was
// overwritten (rebase-trajectory.ts l.136-145), else it abstains. ForwardSplit, ReverseSplit, StockDividend: DJ-1. Every other type
// (G0, line dated 04:1x UTC: the type never decides the unit alone): k != 1 (E or a paired step) follows DJ-1 when a D is read (M, or
// a dated ADR line that reads D), else keeps the open abstention, lifted only by a dated ADR line that reads D, never by the step
// alone; k = 1 at equal bits keeps the open abstention, lifted by a dated ADR line. The open abstention starts at the group that
// contains min(00:00 ET of the first candidate D, T_E) (line dated 04:4x UTC) and covers every group whose envelope ends after the
// start of that group. Neither Corrected nor Cancelled lifts a window.
// DJ-10, the issuers: a closed table of six, xStocks alone read; any symbol of another issuer abstains every group anchored on or
// after prevTradingDay(D) of any known action of its underlying (M splits and dividends, E events of the xStocks twin), gap and
// volume, never lifted automatically.
import { FULL_CLOSURES, PRE_OPEN, classifySession, etWallClockToUtcMs, nextTradingDay, prevTradingDay, refCloseDateOf, type SessionLabel } from "./sessions.ts";
import { advPeriodOf } from "./volume.ts";
import { f64BitsHexLE, f64FromBitsHexLE, overwrittenPending, type MultiplierEvent } from "./rebase-trajectory.ts";
import { XSTOCKS } from "./pools.ts";

/** One session group of collect.ts: the key session|regime|anchor. */
export interface SessionGroup { readonly session: SessionLabel; readonly regime: string | null; readonly anchor: string }
export function groupOf(utcMs: number): SessionGroup {
  const c = classifySession(utcMs);
  return { session: c.session, regime: c.regime, anchor: c.sessionDateET };
}
export const groupKey = (g: SessionGroup): string => `${g.session}|${g.regime ?? "null"}|${g.anchor}`;

const addDays = (iso: string, n: number): string => new Date(Date.parse(`${iso}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const etMs = (iso: string, minute: number): number =>
  etWallClockToUtcMs(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), Number(iso.slice(8, 10)), Math.floor(minute / 60), minute % 60, 0);
const RANK: Readonly<Partial<Record<SessionLabel, number>>> = { pre: 1, regular: 2, after: 3 };

/** [start, end) of the pre, regular or after session of a trading day at classifySession's own minute bounds, found by bisection
 *  on the rank of each minute of the day (0 early night, 1 pre, 2 regular, 3 after, 4 late night): no session bound restated. */
function intradayBounds(day: string, session: SessionLabel): [number, number] {
  const rankAt = (m: number): number => { const c = classifySession(etMs(day, m)); return RANK[c.session] ?? (c.sessionDateET === day ? 4 : 0); };
  const first = (r: number): number => { let lo = 0, hi = 1440; while (lo < hi) { const mid = (lo + hi) >> 1; if (rankAt(mid) >= r) hi = mid; else lo = mid + 1; } return lo; };
  const r = RANK[session] ?? 4;
  return [etMs(day, first(r)), etMs(day, first(r + 1))];
}

/** The envelope of a group. An off-hours group anchored on A lives in the gap [after-close of A, 04:00 ET of nextTradingDay(A)): the
 *  night group spans the whole gap; a weekend or holiday group spans its whole ET days inside the gap. */
export function groupEnvelope(g: SessionGroup): { readonly fromMs: number; readonly toMs: number } {
  if (RANK[g.session] !== undefined) { const [fromMs, toMs] = intradayBounds(g.anchor, g.session); return { fromMs, toMs }; }
  const next = nextTradingDay(g.anchor);
  if (g.session === "overnight-weekday") return { fromMs: intradayBounds(g.anchor, "after")[1], toMs: etMs(next, PRE_OPEN) };
  const days: string[] = [];
  for (let d = addDays(g.anchor, 1); d < next; d = addDays(d, 1)) if ((FULL_CLOSURES.has(d) ? "holiday" : "weekend") === g.session) days.push(d);
  const firstDay = days[0], lastDay = days[days.length - 1];
  return firstDay === undefined || lastDay === undefined ? { fromMs: 0, toMs: 0 } : { fromMs: etMs(firstDay, 0), toMs: etMs(addDays(lastDay, 1), 0) };
}
/** "The group contains the instant": the instant lies in [start, end) of the envelope. */
export function groupContains(g: SessionGroup, utcMs: number): boolean {
  const e = groupEnvelope(g);
  return e.fromMs <= utcMs && utcMs < e.toMs;
}

/** [t >= T] in floored seconds, as multiplierAtMs (rebase-trajectory.ts l.123-125); T = +Infinity while no step is paired. */
export const tokenIsNew = (tMs: number, tSec: number): boolean => Math.floor(tMs / 1000) >= tSec;
/** [refCloseDateOf(s) >= D]: the reference close of the group is already in the new unit. */
export const refIsNew = (g: SessionGroup, d: string): boolean => refCloseDateOf(g.session, g.anchor) >= d;
/** DJ-1: a fill is wrong iff the token's unit and its reference close's unit differ. */
export const fillIsWrong = (tMs: number, g: SessionGroup, tSec: number, d: string): boolean => tokenIsNew(tMs, tSec) !== refIsNew(g, d);

/** DJ-2: the candidate execution days of an unknown D, around the anchor of the group that contains T. */
export function dCandidates(tSec: number): [string, string, string] {
  const dT = classifySession(tSec * 1000).sessionDateET;
  return [prevTradingDay(dT), dT, nextTradingDay(dT)];
}
/** DJ-3: the instant the open abstention starts from, min(00:00 ET of the first candidate D, T_E). */
export const openStartMs = (tSec: number): number => Math.min(etMs(dCandidates(tSec)[0], 0), tSec * 1000);

/** A window of one event. `event`: DJ-1 for each D of ds under T, plus the groups that contain an issuer time; mark = the dividend
 *  mark replaces the abstention. `open`: every group from the one that contains fromMs. `unread`: every group anchored on or after. */
export type Window =
  | { readonly kind: "event"; readonly ds: readonly string[]; readonly tSec: number; readonly issuerSec: readonly number[]; readonly mark: boolean }
  | { readonly kind: "open"; readonly fromMs: number }
  | { readonly kind: "unread"; readonly fromAnchor: string };
type EventWindow = Extract<Window, { kind: "event" }>;

export function gapTriggered(g: SessionGroup, fillsMs: readonly number[], w: EventWindow): boolean {
  const instants = [...(Number.isFinite(w.tSec) ? [w.tSec] : []), ...w.issuerSec];
  return w.ds.some((d) => fillsMs.some((t) => fillIsWrong(t, g, w.tSec, d))) || instants.some((s) => groupContains(g, s * 1000));
}
export function volumeTriggered(g: SessionGroup, fillsMs: readonly number[], w: EventWindow): boolean {
  const p = advPeriodOf(g.anchor), ym = `${String(p.year)}-${String(p.month).padStart(2, "0")}`;
  if (w.issuerSec.some((s) => groupContains(g, s * 1000))) return true;
  return w.ds.some((d) => { const dm = d.slice(0, 7); return ym === dm || fillsMs.some((t) => tokenIsNew(t, w.tSec) !== ym >= dm); });
}

export const ABSTAIN = "corporate_action_in_window";
export const MARK = "cash_dividend";
export type Outcome = "publish" | typeof MARK | typeof ABSTAIN;
export interface GroupVerdict { readonly gap: Outcome; readonly volume: Outcome }
const worst = (a: Outcome, b: Outcome): Outcome => (a === ABSTAIN || b === ABSTAIN ? ABSTAIN : a === MARK || b === MARK ? MARK : "publish");

/** The verdict of one group under every window: the abstention beats the mark, the mark beats the publication. */
export function judgeGroup(g: SessionGroup, fillsMs: readonly number[], windows: readonly Window[]): GroupVerdict {
  let gap: Outcome = "publish", volume: Outcome = "publish";
  for (const w of windows) {
    if (w.kind === "unread") { if (g.anchor >= w.fromAnchor) gap = volume = ABSTAIN; continue; }
    if (w.kind === "open") { if (groupEnvelope(g).toMs > groupEnvelope(groupOf(w.fromMs)).fromMs) gap = volume = ABSTAIN; continue; }
    const hit: Outcome = w.mark ? MARK : ABSTAIN;
    if (gapTriggered(g, fillsMs, w)) gap = worst(gap, hit);
    if (volumeTriggered(g, fillsMs, w)) volume = worst(volume, hit);
  }
  return { gap, volume };
}

// ---- DJ-10: the closed table of the six issuers --------------------------------------------------------------------------------
export type Issuer = "xStocks" | "Robinhood" | "Binance" | "Coinbase" | "Ondo" | "Backpack";
export interface IssuerMechanism { readonly issuer: Issuer; readonly read: boolean; readonly datedLine: string | null }
/** One row per issuer of the launch (the founder chose all six on 2026-10-22); a row is read only with its dated line. */
export const ISSUER_MECHANISMS: readonly IssuerMechanism[] = Object.freeze([
  Object.freeze({ issuer: "xStocks", read: true, datedLine: "2026-10-22 01:0x UTC, read in place by MONARK (docs.xstocks.fi, dividends and stock splits, F-3): a Token-2022 scaled UI multiplier moved by the ratio at an activation instant, published on chain before the event (signal C) and announced by the public corporate-actions API (signal E)" }),
  Object.freeze({ issuer: "Robinhood", read: false, datedLine: null }),
  Object.freeze({ issuer: "Binance", read: false, datedLine: null }),
  Object.freeze({ issuer: "Coinbase", read: false, datedLine: null }),
  Object.freeze({ issuer: "Ondo", read: false, datedLine: null }),
  Object.freeze({ issuer: "Backpack", read: false, datedLine: null }),
] as IssuerMechanism[]);
/** The issuer of a symbol (plan P1 C1-10): an xStocks pool token, TSLAon for Ondo, any other symbol unknown (hence not read). */
export function issuerOf(symbol: string): Issuer | null {
  if (XSTOCKS.some((t) => t.symbol === symbol)) return "xStocks";
  return symbol === "TSLAon" ? "Ondo" : null;
}
export const issuerReadOf = (issuer: Issuer | null, table: readonly IssuerMechanism[] = ISSUER_MECHANISMS): boolean =>
  table.some((r) => r.issuer === issuer && r.read && r.datedLine !== null && r.datedLine.trim() !== "");

// ---- DJ-2 and DJ-3: from the three signals to the windows ------------------------------------------------------------------------
/** M, one record of Massive /stocks/v1/splits (F-1), and one of /stocks/v1/dividends (M-5). */
export interface MassiveSplit { readonly execution_date: string; readonly split_from: number; readonly split_to: number }
export interface MassiveDividend { readonly ex_dividend_date: string }
/** E, one node (one version of one event) of the issuer's history or upcoming list (F-4). */
export interface IssuerNode { readonly eventId: string; readonly version: number; readonly caType: string; readonly effectiveTimeUtc: string | null;
  readonly multiplierOld: string | null; readonly multiplierNew: string | null; readonly status: string }
/** A dated ADR line on one event: it lifts an open abstention; dReadET, when it reads D, turns it into DJ-1. */
export interface AdrLine { readonly eventId: string; readonly dated: string; readonly dReadET: string | null }
export interface Signals { readonly symbol: string; readonly issuer: Issuer | null; readonly nowSec: number; readonly splits: readonly MassiveSplit[];
  readonly dividends: readonly MassiveDividend[]; readonly issuerNodes: readonly IssuerNode[]; readonly trajectory: readonly MultiplierEvent[]; readonly adrLines: readonly AdrLine[] }
export interface CaProvenance { readonly d_candidates: string[]; readonly corporate_action_disagreements: string[]; readonly issuer_time_without_step: string[]; readonly multiplier_bits_mismatch: string[] }

/** A step of C: an update whose effective time is > 0 and whose bits differ from the new multiplier before it (M-3). */
export interface Step { readonly tSec: number; readonly oldBits: string; readonly newBits: string; readonly k: number }
export function stepsOf(trajectory: readonly MultiplierEvent[]): Step[] {
  const out: Step[] = [];
  let cur: string | null = null;
  for (const e of [...trajectory].sort((a, b) => a.slot - b.slot || a.instructionIndex - b.instructionIndex)) {
    const eff = Math.max(e.effectiveTimestampSec, 0);
    if (e.kind === "update" && cur !== null && eff > 0 && e.multiplierBitsHex !== cur)
      out.push({ tSec: eff, oldBits: cur, newBits: e.multiplierBitsHex, k: f64FromBitsHexLE(e.multiplierBitsHex) / f64FromBitsHexLE(cur) });
    cur = e.multiplierBitsHex;
  }
  return out;
}

/** The statuses that lift a window: none (G0 DJ-2, correction 4). */
const STATUSES_THAT_LIFT: ReadonlySet<string> = new Set<string>([]);
const UNIT_TYPES: ReadonlySet<string> = new Set(["ForwardSplit", "ReverseSplit", "StockDividend"]);
export const DIVIDEND_MARK_BOUND = 0.005;
export const BITS_FALLBACK_REL = 1e-9;
const rel = (a: number, b: number): number => Math.abs(a - b) / Math.abs(b);
const secOf = (iso: string): number => Math.floor(Date.parse(iso) / 1000);
const dateOf = (tSec: number): string => classifySession(tSec * 1000).sessionDateET;

/** One event of E: its maximal version (the values), and the instants of all its versions (the union of the windows). */
export interface IssuerEvent { readonly eventId: string; readonly top: IssuerNode; readonly timesSec: readonly number[] }
export function issuerEvents(nodes: readonly IssuerNode[]): IssuerEvent[] {
  const by = new Map<string, IssuerNode[]>();
  for (const n of nodes) by.set(n.eventId, [...(by.get(n.eventId) ?? []), n]);
  const out: IssuerEvent[] = [];
  for (const [eventId, vs] of by) {
    const top = vs.reduce((m, v) => (v.version > m.version ? v : m));
    const timesSec = [...new Set(vs.flatMap((v) => (v.effectiveTimeUtc === null ? [] : [secOf(v.effectiveTimeUtc)])))].sort((a, b) => a - b);
    out.push({ eventId, top, timesSec });
  }
  return out.sort((a, b) => (a.timesSec[0] ?? Infinity) - (b.timesSec[0] ?? Infinity) || a.eventId.localeCompare(b.eventId));
}

/** The windows of one symbol under its three signals, and the provenance lines of DJ-2 (sorted, without duplicates). */
export function reconcile(s: Signals): { readonly windows: Window[]; readonly provenance: CaProvenance } {
  const lines: Record<keyof CaProvenance, Set<string>> = { d_candidates: new Set(), corporate_action_disagreements: new Set(), issuer_time_without_step: new Set(), multiplier_bits_mismatch: new Set() };
  const windows: Window[] = [], events = issuerEvents(s.issuerNodes);
  const done = (): { windows: Window[]; provenance: CaProvenance } => ({ windows,
    provenance: { d_candidates: [...lines.d_candidates].sort(), corporate_action_disagreements: [...lines.corporate_action_disagreements].sort(),
      issuer_time_without_step: [...lines.issuer_time_without_step].sort(), multiplier_bits_mismatch: [...lines.multiplier_bits_mismatch].sort() } });
  if (!issuerReadOf(s.issuer)) {
    for (const m of s.splits) windows.push({ kind: "unread", fromAnchor: prevTradingDay(m.execution_date) });
    for (const v of s.dividends) windows.push({ kind: "unread", fromAnchor: prevTradingDay(v.ex_dividend_date) });
    for (const e of events) { const t0 = e.timesSec[0]; if (t0 !== undefined) windows.push({ kind: "unread", fromAnchor: prevTradingDay(dCandidates(t0)[0]) }); }
    return done();
  }
  const steps = stepsOf(s.trajectory), usedSteps = new Set<Step>(), usedSplits = new Set<MassiveSplit>(), pending = overwrittenPending(s.trajectory);
  const candidates = (tSec: number): string[] => { const c = dCandidates(tSec); lines.d_candidates.add(`${s.symbol}:${c[1]}:${c.join(",")}`); return c; };
  const kOfSplit = (m: MassiveSplit): number => m.split_to / m.split_from;
  for (const e of events) {
    const { top } = e;
    if (STATUSES_THAT_LIFT.has(top.status)) continue;
    const oldN = top.multiplierOld === null ? null : Number(top.multiplierOld), newN = top.multiplierNew === null ? null : Number(top.multiplierNew);
    const changesBits = oldN !== null && newN !== null && f64BitsHexLE(oldN) !== f64BitsHexLE(newN);
    let step: Step | undefined;
    if (top.status !== "Cancelled" && changesBits && newN !== null) {
      step = steps.find((p) => !usedSteps.has(p) && p.newBits === f64BitsHexLE(newN));
      if (step === undefined) {
        step = steps.find((p) => !usedSteps.has(p) && rel(f64FromBitsHexLE(p.newBits), newN) <= BITS_FALLBACK_REL);
        if (step !== undefined) lines.multiplier_bits_mismatch.add(`${s.symbol}:${dateOf(step.tSec)}:${e.eventId}`);
      }
      if (step !== undefined) usedSteps.add(step);
    }
    const topSec = top.effectiveTimeUtc === null ? undefined : secOf(top.effectiveTimeUtc);
    const tRef = step?.tSec ?? topSec ?? e.timesSec[e.timesSec.length - 1];
    if (tRef === undefined) continue; // no instant in any version and no step: the event cannot be placed (item BELL-CA-UNDATED-EVENT-1)
    const tSec = step === undefined ? Infinity : step.tSec;
    const kE = changesBits && oldN !== null && newN !== null ? newN / oldN : null, k = step?.k ?? kE;
    const date = dateOf(tRef);
    if (step === undefined && topSec !== undefined && topSec <= s.nowSec) lines.issuer_time_without_step.add(`${s.symbol}:${date}:${e.eventId}`);
    if (step !== undefined && topSec !== undefined && topSec !== step.tSec) lines.corporate_action_disagreements.add(`${s.symbol}:${date}:T`);
    if (step !== undefined && kE !== null && rel(kE, step.k) > BITS_FALLBACK_REL) lines.corporate_action_disagreements.add(`${s.symbol}:${date}:k`);
    const twin = (ds: readonly string[], mark: boolean): void => {
      windows.push({ kind: "event", ds, tSec, issuerSec: e.timesSec, mark });
      if (step !== undefined && topSec !== undefined && topSec !== step.tSec) windows.push({ kind: "event", ds, tSec: topSec, issuerSec: e.timesSec, mark });
    };
    if (top.caType === "CashDividend") {
      const ex = s.dividends.map((v) => v.ex_dividend_date).filter((d) => dCandidates(tRef).includes(d)).sort().at(-1);
      twin(ex === undefined ? candidates(tRef) : [ex], step !== undefined && Math.abs(step.k - 1) < DIVIDEND_MARK_BOUND && pending === 0);
      continue;
    }
    const m = s.splits.find((x) => !usedSplits.has(x) && dCandidates(tRef).includes(x.execution_date));
    if (m !== undefined) usedSplits.add(m);
    const kDisagrees = m !== undefined && k !== null && rel(kOfSplit(m), k) > BITS_FALLBACK_REL;
    if (kDisagrees) lines.corporate_action_disagreements.add(`${s.symbol}:${m.execution_date}:k`);
    const withD = (d: string): string[] => (kDisagrees ? [...new Set([d, ...candidates(tRef)])].sort() : [d]);
    if (UNIT_TYPES.has(top.caType)) { twin(m === undefined ? candidates(tRef) : withD(m.execution_date), false); continue; }
    const adr = s.adrLines.find((a) => a.eventId === e.eventId && a.dated.trim() !== "");
    if (changesBits) {
      const d = m?.execution_date ?? adr?.dReadET ?? null;
      if (d !== null) twin(withD(d), false);
      else { candidates(tRef); windows.push({ kind: "open", fromMs: Math.min(openStartMs(tRef), openStartMs(topSec ?? tRef)) }); }
    } else if (adr === undefined) { candidates(tRef); windows.push({ kind: "open", fromMs: Math.min(openStartMs(tRef), openStartMs(topSec ?? tRef)) }); }
  }
  for (const m of s.splits) {
    if (usedSplits.has(m)) continue;
    const st = steps.find((p) => !usedSteps.has(p) && dCandidates(p.tSec).includes(m.execution_date));
    if (st !== undefined) usedSteps.add(st);
    if (st !== undefined && rel(kOfSplit(m), st.k) > BITS_FALLBACK_REL) lines.corporate_action_disagreements.add(`${s.symbol}:${m.execution_date}:k`);
    windows.push({ kind: "event", ds: [m.execution_date], tSec: st?.tSec ?? Infinity, issuerSec: [], mark: false });
  }
  for (const p of steps) if (!usedSteps.has(p)) windows.push({ kind: "event", ds: candidates(p.tSec), tSec: p.tSec, issuerSec: [], mark: false });
  return done();
}

/** The verdict of every session group of a symbol's fills (grouped as collect.ts groups them), and the provenance lines. */
export function judgeFills(s: Signals, fillsMs: readonly number[]): { readonly verdicts: Readonly<Record<string, GroupVerdict>>; readonly provenance: CaProvenance } {
  const { windows, provenance } = reconcile(s);
  const groups = new Map<string, { g: SessionGroup; fills: number[] }>();
  for (const t of fillsMs) { const g = groupOf(t), key = groupKey(g), cur = groups.get(key) ?? { g, fills: [] }; cur.fills.push(t); groups.set(key, cur); }
  const verdicts: Record<string, GroupVerdict> = {};
  for (const [key, { g, fills }] of groups) verdicts[key] = judgeGroup(g, fills, windows);
  return { verdicts, provenance };
}
