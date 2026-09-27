// MONARK Dojo -- PR-2b-2 (ADR-DOJO-PR-2B D-14 l.516, section 4 l.573-582): pure reconstruction of the retroactive history and its
// bundle. Inputs: the admitted bodies and the reads without quorum of PR-2b-1 (history-read.ts, read through its exports only) and the
// reading records of the first day read, loaded by PR-2's reader (readRecord, TU-1h l.536, C-29). Per-account states slot by slot
// (D-3 phase D l.267-283), windows without quorum (D-6 l.340-343), day values and the rule inside a slot (D-7 l.346-356), supply per
// day and the enumeration check (D-8 (i), (ii) l.365-366), lines, root and the bundle of D-12 (l.441-474) with the eve of the first day
// read (ADR-DOJO-PR-2 D-7, Q-2 line). No network, no clock, no I/O; no operator is named. Consumers: the collector (PR-2b-3, PR-2b-4)
// and the publisher (PR-3a, publish/ only). Every stop of this module is named in DOJO_HISTORY_STOPS or DOJO_HISTORY_BUILD_STOPS; a
// malformed record text passes PR-2's refusal through (record_malformed, raised by readRecord), a partial reason too (C-G2-4).
import { createHash } from "node:crypto";
import { assertNoCloseLike, canonical } from "../../bell/scripts/bell-chain.mjs";
import { base58Decode, ownerClass, rootOf } from "../scripts/dojo-core.mjs";
import { readRecord } from "./bundle.ts";
import { byteOrder, type Enumeration, type Eve } from "./reading.ts";
import { DOJO_HISTORY_STOPS, DojoHistoryStop, chainAccounts, checkDays, type Body, type HistoryStop, type NoQuorum } from "./history-read.ts";

/** The stop of D-11 l.425 that the enumeration check (ii) raises and that DOJO_HISTORY_STOPS (history-read.ts, frozen) does not list;
 *  disjoint from the 45 verifier codes (mere D-10); to fold into DOJO_HISTORY_STOPS (journal question). */
export const DOJO_HISTORY_BUILD_STOPS = Object.freeze(["enumeration_mismatch"] as const);
export class DojoHistoryBuildStop extends Error {
  readonly code: (typeof DOJO_HISTORY_BUILD_STOPS)[number];
  readonly detail: string;
  constructor(detail: string) { super(`dojo/history: enumeration_mismatch: ${detail}`); this.code = "enumeration_mismatch"; this.detail = detail; }
}
/** Reasons of a partial bundle (evidence/status.json, D-12 l.453, D-11 l.418-432): the collector stops, the guard refusals
 *  (section 1.4 l.138), evidence_corrupt and PR-2's record_malformed (firstRead, C-G2-4). The stop on duration (C-27, Q-6): G1 of PR-2b-3. */
export const DOJO_HISTORY_PARTIAL_REASONS = Object.freeze([...DOJO_HISTORY_STOPS, ...DOJO_HISTORY_BUILD_STOPS, "run_calls", "run_credits",
  "method_cap_unlisted", "method_cap", "cycle_cap", "evidence_corrupt", "record_malformed"]);
export const DOJO_HISTORY_FIRST_DAY = "2026-09-10"; // D-3 l.229: DAY1 = 1 788 998 400 / 86 400 = 20 706 (mere D-18, decision 227)
export const DOJO_HISTORY_SCHEMA = "dojo-history-bundle-v1"; // D-12 l.467
const stop = (code: HistoryStop, detail: string): never => { throw new DojoHistoryStop(code, detail); };
const mismatch = (detail: string): never => { throw new DojoHistoryBuildStop(detail); };

const DAY = 86400, DAY1 = Date.parse(`${DOJO_HISTORY_FIRST_DAY}T00:00:00.000Z`) / 1000 / DAY;
const dayNo = (t: number): number => Math.floor(t / DAY) - DAY1 + 1; // day number of a block time or a day start, day 1 = DAY1
const dayName = (n: number): string => new Date((DAY1 + n - 1) * DAY * 1000).toISOString().slice(0, 10);
const nat = (x: unknown): x is number => typeof x === "number" && Number.isSafeInteger(x) && x >= 0;
const hex64 = (x: unknown): boolean => typeof x === "string" && /^[0-9a-f]{64}$/.test(x);
const isSig = (x: unknown): boolean => typeof x === "string" && /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(x);
const isAddr = (x: unknown): boolean => { try { return typeof x === "string" && x.length <= 44 && base58Decode(x).length === 32; } catch { return false; } };
const sha = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

/** The first day read (TU-1h): its day and the two accepted enumeration responses of its first reading that carries two, by slot. */
export interface FirstRead { readonly day: string; readonly enumerations: readonly Enumeration[] }
/** The K reading records i = 1..K of one day, each text read by readRecord (closed keys, canonical bytes), never built by hand. */
export function firstRead(records: readonly string[]): FirstRead {
  const recs = records.map((t) => readRecord(t)), day = recs[0]?.day;
  if (day === undefined || recs.some((r, j) => r.day !== day || r.i !== j + 1)) return stop("read_malformed", "records of the first day read");
  const two = recs.find((r) => r.enumerations.length === 2); // (ii) needs both responses of one reading (D-3 l.227-228)
  return two === undefined ? mismatch("no reading of the first day read carries two enumerations")
    : { day, enumerations: [...two.enumerations].sort((p, q) => p.context_slot - q.context_slot) };
}

export interface HistoryBuildInput { readonly txs: readonly Body[]; readonly noQuorum: readonly NoQuorum[]; readonly records: readonly string[] }
export interface HistoryBuild {
  readonly history_first_day: string; readonly history_last_day: string; readonly first_read_day: string; readonly window_slot_max: number;
  readonly enumeration_slots: readonly number[]; readonly lines: readonly string[]; readonly bytes: string; readonly sha256: string; readonly root: string;
  readonly eve: Eve; readonly transactions_admitted: number; readonly transactions_without_quorum: number; readonly token_accounts: number;
  readonly addresses: number; readonly missing_address_days: number;
}
type St = { readonly amount: bigint; readonly owner: string | null };
const ZERO: St = { amount: 0n, owner: null };
interface Win { readonly account: string; readonly lo: number; readonly close: number; readonly d0: number; readonly d1: number; readonly owners: Set<string>; readonly atClose: Set<string> }

/** One side of an account in a body; the owner fallback of chainAccounts (D-5 l.329): the entry, then the initializeAccount* of the
 *  body (post side), then the previous owner, else owner_unknown. An absent entry is 0 (a closed account, mere C-1). */
function side(t: Body, a: string, s: "pre" | "post", prev: St): St {
  const e = t.mint.find((x) => x.account === a && x.side === s);
  if (e === undefined || e.amount === "0") return { amount: 0n, owner: e?.owner ?? null };
  const init = t.ins.find((i) => i.type.startsWith("initializeAccount") && i.info.account === a)?.info.owner;
  const owner = e.owner ?? (s === "post" && typeof init === "string" ? init : prev.owner);
  return owner === null ? stop("owner_unknown", `${a} in ${t.signature}`) : { amount: BigInt(e.amount), owner };
}
const vx = (s: St): string => (s.amount === 0n ? "0" : `${s.amount} ${s.owner ?? ""}`);
/** End of the one order that chains an account through an unordered slot (chainAccounts checked that it exists and is unique). */
function endOf(start: St, edges: readonly (readonly [St, St])[]): St {
  const deg = new Map<string, number>(), at = new Map<string, St>([[vx(start), start]]);
  for (const [p, q] of edges) { deg.set(vx(p), (deg.get(vx(p)) ?? 0) - 1); deg.set(vx(q), (deg.get(vx(q)) ?? 0) + 1); at.set(vx(q), q); }
  const end = [...deg].find(([, v]) => v === 1)?.[0] ?? vx(start); // a circuit ends where it starts
  return at.get(end) ?? start;
}
const moves = (t: Body): bigint => t.supply.reduce((s, m) => s + (m.type.startsWith("mintTo") ? BigInt(m.amount) : -BigInt(m.amount)), 0n);

/** Reconstruction (D-3 phase D) and checks (i), (ii) of the admitted transactions of slot <= S_CUT, then the lines of days 1..D_LAST. */
export function buildHistory(x: HistoryBuildInput): HistoryBuild {
  const fr = firstRead(x.records), E = fr.enumerations, sCut = Math.max(...E.map((e) => e.context_slot));
  const last = dayNo(Date.parse(`${fr.day}T00:00:00.000Z`) / 1000) - 1; // D_LAST = first_read_day - 1 (D-3 l.230)
  if (!(last >= 1)) stop("read_malformed", "first read day");
  const T = x.txs.filter((t) => t.slot <= sCut);
  const nqDays = x.noQuorum.flatMap((n) => (n.slots.length === n.blockTimes.length || new Set(n.slots).size === 1
    ? n.blockTimes.map((blockTime, i) => ({ slot: n.slots[n.slots.length === n.blockTimes.length ? i : 0] ?? 0, blockTime })) : []));
  checkDays([...T, ...nqDays]); // (v), bodies without quorum included (dated line D-8); a pairing left open: journal question
  if (T.some((t) => t.err !== null || dayNo(t.blockTime ?? 0) < 1 || dayNo(t.blockTime ?? 0) > last + 1)) stop("read_malformed", "admitted transactions");
  const chained = chainAccounts(T, x.noQuorum); // (iii), fail-closed, before any state is kept
  const bySlot = new Map<number, Body[]>(), slotsOf = new Map<string, Set<number>>();
  for (const t of T) {
    const g = bySlot.get(t.slot);
    if (g) g.push(t); else bySlot.set(t.slot, [t]);
    for (const e of t.mint) slotsOf.set(e.account, (slotsOf.get(e.account) ?? new Set<number>()).add(t.slot));
  }
  const dayOfSlot = (s: number): number => dayNo(bySlot.get(s)?.[0]?.blockTime ?? 0);
  // D-6 l.340-343: for each account a read without quorum at slots [lo, hi], the window runs from the day of that read to the day of
  // the first admitted transaction on a at a slot > hi, inclusive; it must close before every enumeration slot E_e >= lo.
  const wins: Win[] = [];
  for (const n of x.noQuorum) {
    if (n.blockTimes.length === 0 || n.slots.length === 0) stop("no_quorum_unbounded", `${n.signature}: no day read`);
    const lo = Math.min(...n.slots), hi = Math.max(...n.slots), d0 = dayNo(Math.min(...n.blockTimes));
    for (const a of new Set(n.touched.map((t) => t.account))) {
      const close = [...(slotsOf.get(a) ?? [])].sort((p, q) => p - q).find((s) => s > hi);
      if (close === undefined || E.some((e) => lo <= e.context_slot && e.context_slot < close)) stop("no_quorum_unbounded", `${a}: window of ${n.signature} open at an enumeration`);
      const d1 = dayOfSlot(close as number);
      if (!(d0 >= 1 && d0 <= d1)) stop("day_not_monotone", `${n.signature}: window days`);
      wins.push({ account: a, lo, close: close as number, d0, d1, atClose: new Set<string>(), owners: new Set(n.touched.flatMap((t) => (t.account === a && t.owner !== null ? [t.owner] : []))) });
    }
  }
  const winsOf = new Map<string, Win[]>();
  for (const w of wins) winsOf.set(w.account, [...(winsOf.get(w.account) ?? []), w]);
  const entering = [...wins].sort((p, q) => p.lo - q.lo);

  const state = new Map<string, St>(), bal = new Map<string, bigint>(), mins = new Map<string, bigint>(), moved = new Set<string>();
  const series = new Map<string, bigint[]>();
  let total = 0n, supply = 0n;
  const put = (a: string, s: St): void => {
    const p = state.get(a) ?? ZERO;
    for (const [o, v] of [[p.owner, -p.amount], [s.owner, s.amount]] as const) {
      if (o === null || v === 0n) continue;
      if (!mins.has(o)) mins.set(o, bal.get(o) ?? 0n); // the balance at the start of the day (D-7 l.348)
      bal.set(o, (bal.get(o) ?? 0n) + v);
      moved.add(o);
    }
    total += s.amount - p.amount;
    state.set(a, s);
  };
  const cand = (o: string, v: bigint): void => { const m = mins.get(o); mins.set(o, m === undefined || v < m ? v : m); };
  // D-3 l.290, D-6 l.342 (dated line C-G2-1): an owner in the slots [lo, hi], or the pre side of the transaction that closes the window
  // (the first on a at the closing slot; every one when the slot is unordered), may own a at any instant of the window: null over it;
  // any other owner at the closing slot owns a from the close on: null on its day d1 only (over-nulling would hide a sale, D-7 l.356).
  const mark = (a: string, s: number, first: boolean, pre: St, post: St): void => {
    for (const w of winsOf.get(a) ?? []) if (w.lo <= s && s <= w.close) {
      for (const [q, all] of [[pre, s < w.close || first], [post, s < w.close]] as const) if (q.owner !== null) (all ? w.owners : w.atClose).add(q.owner);
    }
  };
  const endDay = (d: number): void => {
    for (const [o, b] of bal) { let s = series.get(o); if (s === undefined) { s = Array.from({ length: d - 1 }, () => 0n); series.set(o, s); } s.push(mins.get(o) ?? b); }
    mins.clear();
    const open = wins.some((w) => w.d0 <= d && d < w.d1); // an account in a window at the end of day d (D-8 (i) l.365)
    if (open && d === last) stop("supply_mismatch", `${dayName(d)}: the last history day is not evaluable`);
    if (!open && total !== supply) stop("supply_mismatch", `${dayName(d)}: balances ${total}, supply ${supply}`);
  };
  const check = (e: Enumeration): void => { // (ii) l.366: every account known here or in e, at E_e; absent = 0 (mere C-1)
    const rows = new Map(e.accounts.map((r) => [r[0], r] as const));
    for (const a of new Set([...state.keys(), ...rows.keys()])) {
      const r = rows.get(a), s = state.get(a);
      if (s === undefined) mismatch(`${a} at slot ${e.context_slot}: unknown to the reconstruction`);
      else if (BigInt(r?.[2] ?? "0") !== s.amount || (r !== undefined && r[1] !== s.owner)) mismatch(`${a} at slot ${e.context_slot}`);
    }
  };

  let day = 1, k = 0, j = 0;
  for (const s of [...bySlot.keys()].sort((p, q) => p - q)) {
    const g = bySlot.get(s) ?? [], d = dayOfSlot(s);
    while (k < E.length && (E[k]?.context_slot ?? 0) < s) check(E[k++] as Enumeration);
    for (; day < d; day++) if (day <= last) endDay(day);
    for (; j < entering.length && (entering[j]?.lo ?? 0) <= s; j++) { const w = entering[j] as Win, o = state.get(w.account)?.owner; if (o) w.owners.add(o); } // last admitted owner
    if (g.every((t) => t.rank !== null)) { // ordered slot: exact balances after each transaction, in rank order (D-7 l.349)
      const seen = new Set<string>();
      for (const t of [...g].sort((p, q) => (p.rank ?? 0) - (q.rank ?? 0))) {
        for (const a of new Set(t.mint.map((e) => e.account))) {
          const pre = side(t, a, "pre", state.get(a) ?? ZERO), post = side(t, a, "post", pre);
          put(a, pre); put(a, post); mark(a, s, !seen.has(a), pre, post); seen.add(a); // put(pre) is a no-op unless a window reveals the state
        }
        supply += moves(t);
        for (const o of moved) cand(o, bal.get(o) ?? 0n);
        moved.clear();
      }
    } else { // unordered slot: for EVERY address touched, L_s = B(before s) + sum_t min(delta(t), 0) and B(after s) (D-7 l.350-352)
      const low = new Map<string, bigint>(), edges = new Map<string, [St, St][]>();
      for (const t of g) {
        const delta = new Map<string, bigint>();
        for (const a of new Set(t.mint.map((e) => e.account))) {
          const pre = side(t, a, "pre", state.get(a) ?? ZERO), post = side(t, a, "post", pre);
          for (const [q, v] of [[pre, -pre.amount], [post, post.amount]] as const) if (q.owner !== null) delta.set(q.owner, (delta.get(q.owner) ?? 0n) + v);
          edges.set(a, [...(edges.get(a) ?? []), [pre, post]]);
          mark(a, s, true, pre, post);
        }
        for (const [o, v] of delta) low.set(o, (low.get(o) ?? bal.get(o) ?? 0n) + (v < 0n ? v : 0n));
        supply += moves(t);
      }
      for (const [a, e] of edges) put(a, endOf(state.get(a) ?? ZERO, e));
      for (const [o, l] of low) { if (l < 0n) stop("bound_exceeded", `slot ${s}: lower bound below 0 for ${o}`); cand(o, l); } // journal question
      for (const o of new Set([...moved, ...low.keys()])) cand(o, bal.get(o) ?? 0n);
      moved.clear();
    }
  }
  while (k < E.length) check(E[k++] as Enumeration);
  for (; day <= last; day++) endDay(day);
  for (const [a, c] of chained) { // self-consistency with the chaining of PR-2b-1
    const s = state.get(a) ?? ZERO;
    if (String(s.amount) !== c.amount || (s.amount !== 0n && s.owner !== c.owner)) stop("chain_break", `${a}: reconstruction differs from the chaining`);
  }

  // D-6: every owner of a window (last admitted owner, owners named by a body, owners of the account in the window) is null over it.
  const nulls = new Map<string, Set<number>>();
  for (const w of wins) for (const o of w.owners) for (let d = w.d0; d <= Math.min(w.d1, last); d++) nulls.set(o, (nulls.get(o) ?? new Set<number>()).add(d));
  for (const w of wins) for (const o of w.atClose) if (w.d1 <= last) nulls.set(o, (nulls.get(o) ?? new Set<number>()).add(w.d1)); // C-G2-1
  const cls = new Map<string, string>();
  const klass = (o: string): string => { try { return cls.get(o) ?? cls.set(o, ownerClass(o)).get(o) as string; } catch { return stop("read_malformed", `owner ${o}`); } };
  const rows: { d: number; o: string; v: bigint | null }[] = [];
  for (const o of new Set([...series.keys(), ...nulls.keys()])) { // D-12 l.463: line iff null, > 0, or the last defined value before is > 0
    let prev = 0n;
    for (let d = 1; d <= last; d++) {
      const v = nulls.get(o)?.has(d) ? null : (series.get(o)?.[d - 1] ?? 0n);
      if (v === null || v > 0n || prev > 0n) rows.push({ d, o, v });
      if (v !== null) prev = v;
    }
  }
  rows.sort((p, q) => p.d - q.d || byteOrder(p.o, q.o));
  const lines = rows.map((r) => canonical({ address: r.o, class: klass(r.o), day: dayName(r.d), day_value: r.v === null ? null : String(r.v) }));
  const bytes = lines.map((l) => `${l}\n`).join("");
  return { history_first_day: DOJO_HISTORY_FIRST_DAY, history_last_day: dayName(last), first_read_day: fr.day, window_slot_max: sCut,
    enumeration_slots: E.map((e) => e.context_slot), lines, bytes, sha256: sha(bytes), root: rootOf(lines),
    eve: { addresses: rows.filter((r) => r.d === last).map((r) => r.o), accounts: [] }, transactions_admitted: T.length,
    transactions_without_quorum: x.noQuorum.length, token_accounts: state.size, addresses: new Set(rows.map((r) => r.o)).size,
    missing_address_days: rows.filter((r) => r.v === null).length };
}

export interface BundleInput {
  readonly status: "complete" | "partial"; readonly stop_reason: string | null; readonly build: HistoryBuild | null; readonly mint: string;
  readonly program: string; readonly decimals: number; readonly sig0: string; readonly sig0_slot: number; readonly transactions_failed_excluded: number;
  readonly collector_sha256: string; readonly evidence_sha256sums_sha256: string;
}
export interface HistoryBundle { readonly status: { readonly status: "complete" | "partial"; readonly stop_reason: string | null }; readonly publish: Readonly<Record<string, string>> | null }
/** D-12: publish/ only at status complete (history/<sha256>.jsonl, manifest.json with closed keys, eve.json of the first day read,
 *  SHA256SUMS last); partial => no publish/, whatever the caller holds. Every manifest input has a closed form (base58 of 32 bytes,
 *  signature, hex64, natural): no operator label, URL or key form can reach publish/ (D-12 l.473). */
export function historyBundle(x: BundleInput): HistoryBundle {
  if (x.status === "partial") {
    if (!(DOJO_HISTORY_PARTIAL_REASONS as readonly unknown[]).includes(x.stop_reason)) stop("read_malformed", "partial stop reason");
    return { status: { status: "partial", stop_reason: x.stop_reason }, publish: null };
  }
  const b = x.build;
  if (x.status !== "complete" || x.stop_reason !== null || b === null || !isAddr(x.mint) || !isAddr(x.program) || !isSig(x.sig0)
    || ![x.decimals, x.sig0_slot, x.transactions_failed_excluded].every(nat) || !hex64(x.collector_sha256) || !hex64(x.evidence_sha256sums_sha256)) {
    return stop("read_malformed", "bundle input");
  }
  const manifest = { schema: DOJO_HISTORY_SCHEMA, status: "complete", mint: x.mint, program: x.program, decimals: x.decimals,
    history_first_day: b.history_first_day, history_last_day: b.history_last_day, sig0: x.sig0, sig0_slot: x.sig0_slot,
    window_slot_max: b.window_slot_max, first_read_day: b.first_read_day, enumeration_slots: b.enumeration_slots, history_sha256: b.sha256,
    history_lines_count: b.lines.length, history_root: b.root, transactions_admitted: b.transactions_admitted,
    transactions_failed_excluded: x.transactions_failed_excluded, transactions_without_quorum: b.transactions_without_quorum,
    token_accounts: b.token_accounts, addresses: b.addresses, missing_address_days: b.missing_address_days, supply_check: "pass",
    enumeration_check: "pass", chain_check: "pass", collector_sha256: x.collector_sha256, evidence_sha256sums_sha256: x.evidence_sha256sums_sha256 };
  assertNoCloseLike(manifest); // R-i
  const files: Record<string, string> = { [`history/${b.sha256}.jsonl`]: b.bytes, "manifest.json": `${canonical(manifest)}\n`, "eve.json": `${canonical(b.eve)}\n` };
  const sums = Object.keys(files).sort(byteOrder).map((p) => `${sha(files[p] ?? "")}  ${p}\n`).join("");
  return { status: { status: "complete", stop_reason: null }, publish: { ...files, SHA256SUMS: sums } };
}
