// MONARK Bell: the corporate-action window (BELL-JUSTESSE-1, part 1, lot 1a-i; G0 DJ-1, DJ-2, DJ-3, DJ-10; plan P1 r2 §4, 17 tests).
// Data: test 1 encodes the 107 cases of the hand table written by another instance than the author of the rule
// (fixtures/corporate-actions/predicate-table.json, derived field for field from the table, its sha256 in the file's header; the four
// cases the table leaves open are ruled by the G0 line dated 2026-10-22 04:4x UTC). The issuer nodes are verbatim nodes of the M-4
// captures (fixtures/corporate-actions/issuer-nodes.json, dollar fields masked as captured); the SPYx and NVDAx trajectories are the
// committed fixtures of the -b3a course. Every step of C built here from the issuer's own multipliers is declared constructed (no HONx,
// NFLXx, KLACx, PALLx or PPLTx trajectory is in the repository); fills and closes are synthetic. Namespace imports: the module absent,
// the file does not load (red-proof's new-module); a symbol absent reads undefined and fails an assertion.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as CA from "../src/corporate-actions.ts";
import * as S from "../src/sessions.ts";
import { f64BitsHexLE, multiplierAtMs, type MultiplierEvent } from "../src/rebase-trajectory.ts";

const fixture = (name: string): unknown => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const et = (y: number, mo: number, d: number, h: number, mi: number, s = 0, ms = 0): number => S.etWallClockToUtcMs(y, mo, d, h, mi, s) + ms;
const sec = (iso: string): number => Math.floor(Date.parse(iso) / 1000);
const NODES = (fixture("corporate-actions/issuer-nodes.json") as { nodes: Record<string, CA.IssuerNode[]> }).nodes;
const nodes = (file: string, keep: (n: CA.IssuerNode) => boolean = () => true): CA.IssuerNode[] => (NODES[file] ?? []).filter(keep);
const trajectoryOf = (name: string): MultiplierEvent[] => (fixture(`series/rebase/${name}`) as { events: MultiplierEvent[] }).events;
/** A CONSTRUCTED trajectory: Initialize at the first old multiplier, then one update per step [old, new, effective second], each sent an
 *  hour before it takes effect (the issuer's own multipliers when the step stands for a real event). */
function built(steps: readonly (readonly [string, string, number])[]): MultiplierEvent[] {
  const first = steps[0];
  if (first === undefined) return [];
  const ev = (kind: "initialize" | "update", m: string, eff: number, block: number, slot: number): MultiplierEvent =>
    ({ kind, multiplier: m, multiplierBitsHex: f64BitsHexLE(Number(m)), effectiveTimestampSec: eff, blockTimeSec: block, slot, instructionIndex: 0, signature: `built-${String(slot)}` });
  return [ev("initialize", first[0], 0, first[2] - 86_400, 1), ...steps.map(([, n, eff], i) => ev("update", n, eff, eff - 3600, i + 2))];
}
const signals = (o: Partial<CA.Signals> & { symbol: string }): CA.Signals =>
  ({ issuer: "xStocks", nowSec: sec("2026-10-22T05:00:00Z"), splits: [], dividends: [], issuerNodes: [], trajectory: [], adrLines: [], ...o });
/** The gap and volume outcomes of the group of each fill, under judgeFills. */
function outcomes(s: CA.Signals, fills: readonly number[]): { gap: (t: number) => string | undefined; volume: (t: number) => string | undefined; provenance: CA.CaProvenance } {
  assert.equal(typeof CA.judgeFills, "function", "corporate-actions.ts exports judgeFills");
  const r = CA.judgeFills(s, fills);
  return { gap: (t) => r.verdicts[CA.groupKey(CA.groupOf(t))]?.gap, volume: (t) => r.verdicts[CA.groupKey(CA.groupOf(t))]?.volume, provenance: r.provenance };
}
const NONE: CA.CaProvenance = { d_candidates: [], corporate_action_disagreements: [], issuer_time_without_step: [], multiplier_bits_mismatch: [] };
const A = "corporate_action_in_window", M = "cash_dividend", P = "publish";

interface TableEvent { id: string; D: string | null; T_sec: number; D_candidates?: string[] }
interface TableFill { t_ms: number; tGeT: boolean; faux: boolean }
interface TableCase { id: string; event: string; t_ms: number; session: string; regime: string | null; anchorDateET: string; refCloseDateET: string;
  tGeT: boolean | null; refGeD: boolean | null; faux: boolean | null; otherFills: TableFill[]; groupHasFaux?: boolean; containsT_key?: boolean; containsT_hull?: boolean;
  tGeT_RS?: boolean; tGeT_SO?: boolean; candidatesRS?: Record<string, { refGeD: boolean; faux: boolean }>; containsT_RS?: boolean; containsT_SO?: boolean;
  openAbstentionSO?: boolean | null; abstained: boolean | null; status: string }
const TABLE = fixture("corporate-actions/predicate-table.json") as { source: { table_json_sha256: string }; events: TableEvent[]; cases: TableCase[] };
/** G0, line dated 2026-10-22 04:4x UTC: the envelope of a group in two pieces (N07, P02, L01) and the group that contains 00:00 ET of
 *  the first candidate D (J02): all four abstain. The table itself is not edited. */
const RULED: Readonly<Record<string, boolean>> = { N07: true, P02: true, L01: true, J02: true };

// killer: apps/bell/src/corporate-actions.ts:72 ROR ">=" -> ">"
test("bell_ca_window_predicate_is_unit_xor", () => {
  assert.equal(TABLE.source.table_json_sha256, "beeb52693dc5968d9c22b8c3162b0f00acedb9ee773c6fafbfd8fcbc2ed40a9e", "the fixture is derived from the table read by MONARK");
  assert.equal(TABLE.cases.length, 107);
  assert.deepEqual(TABLE.cases.filter((c) => c.abstained === null).map((c) => c.id).sort(), Object.keys(RULED).sort(), "the table leaves exactly the four ruled cases open");
  const ev = new Map(TABLE.events.map((e) => [e.id, e]));
  let encoded = 0;
  // killer: apps/bell/src/corporate-actions.ts:68 ROR "utcMs < e.toMs" -> "utcMs <= e.toMs"
  for (const c of TABLE.cases) {
    const g = CA.groupOf(c.t_ms), fills = [c.t_ms, ...c.otherFills.map((f) => f.t_ms)], want = c.abstained ?? RULED[c.id];
    assert.deepEqual([g.session, g.regime, g.anchor], [c.session, c.regime, c.anchorDateET], `${c.id}: group`);
    assert.equal(S.refCloseDateOf(g.session, g.anchor), c.refCloseDateET, `${c.id}: reference close`);
    if (c.event === "HON2") {
      const rs = ev.get("HON2-RS"), so = ev.get("HON2-SO");
      assert.ok(rs !== undefined && so !== undefined && rs.D_candidates !== undefined);
      assert.deepEqual(CA.dCandidates(rs.T_sec), rs.D_candidates, `${c.id}: candidates of HON2`);
      assert.deepEqual([CA.tokenIsNew(c.t_ms, rs.T_sec), CA.tokenIsNew(c.t_ms, so.T_sec)], [c.tGeT_RS, c.tGeT_SO], `${c.id}: t >= T`);
      for (const [d, v] of Object.entries(c.candidatesRS ?? {})) assert.deepEqual([CA.refIsNew(g, d), CA.fillIsWrong(c.t_ms, g, rs.T_sec, d)], [v.refGeD, v.faux], `${c.id}: candidate ${d}`);
      assert.deepEqual([CA.groupContains(g, rs.T_sec * 1000), CA.groupContains(g, so.T_sec * 1000)], [c.containsT_RS, c.containsT_SO], `${c.id}: contains T`);
      const wRs: CA.Window = { kind: "event", ds: rs.D_candidates, tSec: rs.T_sec, issuerSec: [], mark: false }, wSo: CA.Window = { kind: "open", fromMs: CA.openStartMs(so.T_sec) };
      assert.equal(CA.judgeGroup(g, fills, [wSo]).gap === A, c.openAbstentionSO ?? RULED[c.id], `${c.id}: open abstention of the SpinOff`);
      assert.equal(CA.judgeGroup(g, fills, [wRs, wSo]).gap === A, want, `${c.id}: abstained`);
    } else {
      const e = ev.get(c.event);
      assert.ok(e !== undefined && e.D !== null);
      assert.deepEqual([CA.tokenIsNew(c.t_ms, e.T_sec), CA.refIsNew(g, e.D), CA.fillIsWrong(c.t_ms, g, e.T_sec, e.D)], [c.tGeT, c.refGeD, c.faux], `${c.id}: t >= T, ref >= D, wrong`);
      for (const f of c.otherFills) {
        assert.equal(CA.groupKey(CA.groupOf(f.t_ms)), CA.groupKey(g), `${c.id}: the second fill is in the same group`);
        assert.deepEqual([CA.tokenIsNew(f.t_ms, e.T_sec), CA.fillIsWrong(f.t_ms, g, e.T_sec, e.D)], [f.tGeT, f.faux], `${c.id}: second fill`);
      }
      assert.equal(fills.some((t) => CA.fillIsWrong(t, g, e.T_sec, e.D as string)), c.groupHasFaux, `${c.id}: a wrong fill in the group`);
      assert.equal(CA.groupContains(g, e.T_sec * 1000), c.containsT_hull, `${c.id}: the envelope contains T`);
      assert.equal(CA.groupKey(CA.groupOf(e.T_sec * 1000)) === CA.groupKey(g), c.containsT_key, `${c.id}: T classified in the group`);
      assert.equal(CA.judgeGroup(g, fills, [{ kind: "event", ds: [e.D], tSec: e.T_sec, issuerSec: [], mark: false }]).gap === A, want, `${c.id}: abstained`);
    }
    encoded += 1;
  }
  assert.equal(encoded, 107, "every case of the table is encoded");
});

const NFLX = { symbol: "NFLXx", splits: [{ execution_date: "2025-11-17", split_from: 1, split_to: 10 }], issuerNodes: nodes("NFLXx-history.json") };
const T_NFLX = sec("2025-11-16T23:55:00Z");

// killer: apps/bell/src/corporate-actions.ts:74 CONST "refCloseDateOf(g.session, g.anchor)" -> "g.anchor"
test("bell_ca_nflx_t_before_s", () => {
  // NFLXx 10 for 1: T Sunday 2025-11-16 18:55 ET (winter time) (F-6, the issuer's node), D Monday 2025-11-17 (AF-1); C built from the node's multipliers.
  const fills = [et(2025, 11, 14, 10, 0), et(2025, 11, 15, 12, 0), et(2025, 11, 16, 20, 0), et(2025, 11, 17, 5, 0), et(2025, 11, 17, 10, 0), et(2025, 11, 17, 17, 0), et(2025, 11, 18, 10, 0)];
  const o = outcomes(signals({ ...NFLX, trajectory: built([["1", "10", T_NFLX]]) }), fills);
  assert.deepEqual(fills.map(o.gap), [P, A, A, A, A, P, P], "the weekend after T, the pre and regular of D abstain; the after of D and the next day publish");
  assert.deepEqual(o.provenance, NONE, "M, E and C agree: no line");
});

// killer: apps/bell/src/corporate-actions.ts:51 CONST "first(r)), etMs(day, first(r + 1))" -> "first(1)), etMs(day, first(4))"
test("bell_ca_klac_t_in_day", () => {
  // KLACx 10 for 1, T 2026-06-12 13:30 UTC = 09:30 EDT, the first minute of the regular session of D (F-6, AF-1).
  const n = nodes("KLACx-history.json")[0];
  assert.ok(n !== undefined && n.multiplierOld !== null && n.multiplierNew !== null);
  const fills = [et(2026, 6, 11, 10, 0), et(2026, 6, 12, 8, 0), et(2026, 6, 12, 9, 29, 59), et(2026, 6, 12, 9, 30), et(2026, 6, 12, 10, 0), et(2026, 6, 12, 17, 0), et(2026, 6, 15, 10, 0)];
  const o = outcomes(signals({ symbol: "KLACx", splits: [{ execution_date: "2026-06-12", split_from: 1, split_to: 10 }], issuerNodes: [n],
    trajectory: built([[n.multiplierOld, n.multiplierNew, sec("2026-06-12T13:30:00Z")]]) }), fills);
  assert.deepEqual(fills.map(o.gap), [P, P, P, A, A, P, P], "the pre of D publishes, the regular of D abstains, the after of D publishes");
});

// killer: apps/bell/src/sessions.ts:156 CONST "session === \"regular\"" -> "session === \"regular\" || session === \"after\""
test("bell_ca_t_after_close_of_d", () => {
  // CONSTRUCTED on the issuer's stated rule (F-3, 00:30 UTC the day after the ex-date): summer 20:30 EDT (the night of D), winter 19:30 ET
  // (the after session of D). M gives D, C a 2-for-1 step; no E.
  const summerFills = [et(2026, 6, 17, 10, 0), et(2026, 6, 17, 17, 0), et(2026, 6, 17, 21, 0), et(2026, 6, 18, 5, 0)];
  const summer = outcomes(signals({ symbol: "CAx", splits: [{ execution_date: "2026-06-17", split_from: 1, split_to: 2 }], trajectory: built([["1", "2", sec("2026-06-18T00:30:00Z")]]) }), summerFills);
  assert.deepEqual(summerFills.map(summer.gap), [P, A, A, P], "summer: the after of D and the night until T abstain");
  const winterFills = [et(2025, 12, 11, 10, 0), et(2025, 12, 11, 18, 0), et(2025, 12, 11, 21, 0), et(2025, 12, 12, 5, 0)];
  const winter = outcomes(signals({ symbol: "CWx", splits: [{ execution_date: "2025-12-11", split_from: 1, split_to: 2 }], trajectory: built([["1", "2", sec("2025-12-12T00:30:00Z")]]) }), winterFills);
  assert.deepEqual(winterFills.map(winter.gap), [P, A, P, P], "winter: the after of D (which contains T) abstains, the night after T publishes");
});

// killer: apps/bell/src/corporate-actions.ts:101 CONST "ym === dm || " -> ""
test("bell_ca_volume_from_t_to_end_of_next_month", () => {
  // NFLXx: the volume entry abstains from T to the end of the month after D's month (ADV month = the month before the session's day).
  const fills = [et(2025, 11, 14, 10, 0), et(2025, 11, 16, 20, 0), et(2025, 11, 25, 10, 0), et(2025, 12, 31, 10, 0), et(2026, 1, 2, 10, 0)];
  const o = outcomes(signals({ ...NFLX, trajectory: built([["1", "10", T_NFLX]]) }), fills);
  assert.deepEqual(fills.map(o.volume), [P, A, A, A, P], "October ADV before T publishes; after T, November ADV (contains D) abstains; January publishes");
  const silentFills = [et(2025, 11, 14, 10, 0), et(2025, 12, 10, 10, 0), et(2026, 1, 5, 10, 0)];
  const silent = outcomes(signals({ ...NFLX, trajectory: [] }), silentFills);
  assert.deepEqual(silentFills.map(silent.volume), [P, A, A], "no step on the chain: the token stays old against new ADV bars");
});

// killer: apps/bell/src/corporate-actions.ts:116 CONST "w.mark ? MARK : ABSTAIN" -> "ABSTAIN"
test("bell_ca_dividend_marks_without_abstaining", () => {
  // SPYx 604ecc95 (M-4), T 2025-10-31 23:55 UTC, k = 1.00099942056, paired at equal bits and to the second with the committed SPYx
  // trajectory; no M dividend reader yet (PXJ-9): D = the candidates around T.
  const fills = [et(2025, 10, 29, 10, 0), et(2025, 10, 31, 10, 0), et(2025, 10, 31, 17, 0), et(2025, 11, 4, 10, 0)];
  const o = outcomes(signals({ symbol: "SPYx", issuerNodes: nodes("SPYx-history.json"), trajectory: trajectoryOf("rebase-SPYx.json") }), fills);
  assert.deepEqual(fills.map(o.gap), [P, M, M, P], "the groups the rule would abstain carry the mark");
  assert.deepEqual(fills.map(o.volume), [P, P, M, M], "the volume entries of the group that contains T_E and of November (October ADV contains D) carry the mark");
  assert.ok(o.provenance.d_candidates.includes("SPYx:2025-10-31:2025-10-30,2025-10-31,2025-11-03"));
  assert.deepEqual([o.provenance.corporate_action_disagreements, o.provenance.issuer_time_without_step, o.provenance.multiplier_bits_mismatch], [[], [], []]);
});

// killer: apps/bell/src/corporate-actions.ts:245 CONST "[d, ...candidates(tRef)]" -> "[d]"
test("bell_ca_disagreement_takes_union_and_records", () => {
  // HONx 2025-10-30 (real): M 1061/1000 against 1.011018246 at the issuer (13e01fd9, M-4); C built from the issuer's multipliers.
  const n = nodes("HONx-history.json", (x) => x.eventId.startsWith("13e01fd9"))[0];
  assert.ok(n !== undefined && n.multiplierOld !== null && n.multiplierNew !== null);
  const s = signals({ symbol: "HONx", splits: [{ execution_date: "2025-10-30", split_from: 1000, split_to: 1061 }], issuerNodes: [n],
    trajectory: built([[n.multiplierOld, n.multiplierNew, sec("2025-10-30T23:55:00Z")]]) });
  const fills = [et(2025, 10, 29, 11, 0), et(2025, 10, 30, 11, 0), et(2025, 10, 30, 17, 0), et(2025, 10, 30, 20, 30), et(2025, 10, 31, 5, 0), et(2025, 10, 31, 17, 0)];
  const o = outcomes(s, fills);
  assert.deepEqual(fills.map(o.gap), [P, A, A, A, A, P], "the union of the windows: M's D and the candidates around T");
  assert.deepEqual(o.provenance.corporate_action_disagreements, ["HONx:2025-10-30:k"]);
  assert.deepEqual(CA.reconcile(s).windows, [{ kind: "event", ds: ["2025-10-29", "2025-10-30", "2025-10-31"], tSec: sec("2025-10-30T23:55:00Z"), issuerSec: [sec("2025-10-30T23:55:00Z")], mark: false }]);
});

// killer: apps/bell/src/corporate-actions.ts:261 SDL "for (const p of steps)" -> ""
test("bell_ca_unexplained_step_abstains", () => {
  // The committed SPYx trajectory, its 2026-01-30 dividend (c577c497) withheld from E on purpose: a step no M or E explains.
  const fill = et(2026, 1, 30, 17, 0);
  const all = outcomes(signals({ symbol: "SPYx", issuerNodes: nodes("SPYx-history.json"), trajectory: trajectoryOf("rebase-SPYx.json") }), [fill]);
  assert.equal(all.gap(fill), M, "explained by E, the step marks");
  const o = outcomes(signals({ symbol: "SPYx", issuerNodes: nodes("SPYx-history.json", (x) => !x.eventId.startsWith("c577c497")), trajectory: trajectoryOf("rebase-SPYx.json") }), [fill]);
  assert.equal(o.gap(fill), A, "unexplained, the step abstains");
  assert.ok(o.provenance.d_candidates.includes("SPYx:2026-01-30:2026-01-29,2026-01-30,2026-02-02"), "its candidates are written");
});

// killer: apps/bell/src/corporate-actions.ts:171 CONST "new Set<string>([])" -> "new Set<string>([\"Cancelled\"])"
test("bell_ca_cancelled_issuer_event_never_lifts", () => {
  // CONSTRUCTED: a 3-for-1 announced for 2026-03-10 09:30 EDT, then cancelled (no time, unchanged multipliers); no M, no step.
  const base = { eventId: "c0nstruct-0001", caType: "ForwardSplit" };
  const issuerNodes: CA.IssuerNode[] = [{ ...base, version: 1, effectiveTimeUtc: "2026-03-10T13:30:00.000Z", multiplierOld: "1", multiplierNew: "3", status: "Initial" },
    { ...base, version: 2, effectiveTimeUtc: null, multiplierOld: "1", multiplierNew: "1", status: "Cancelled" }];
  const fills = [et(2026, 3, 6, 10, 0), et(2026, 3, 9, 17, 0), et(2026, 3, 10, 10, 0), et(2026, 3, 20, 10, 0)];
  for (const nowSec of [sec("2026-04-01T00:00:00Z"), sec("2026-10-22T00:00:00Z")]) {
    const o = outcomes(signals({ symbol: "CXx", nowSec, issuerNodes }), fills);
    assert.deepEqual(fills.map(o.gap), [P, A, A, A], "the cancelled event keeps its window, course after course");
  }
});

// killer: apps/bell/src/corporate-actions.ts:226 CONST "Infinity" -> "(topSec ?? Infinity)"
test("bell_ca_silent_chain_new_market", () => {
  // NFLXx: M gives D, E a past T_E, the chain shows no step: the token is still old; every reference close >= D abstains.
  const fills = [et(2025, 11, 14, 10, 0), et(2025, 11, 15, 12, 0), et(2025, 11, 17, 5, 0), et(2025, 11, 17, 17, 0), et(2025, 11, 18, 10, 0)];
  const o = outcomes(signals({ ...NFLX, nowSec: sec("2025-11-20T00:00:00Z"), trajectory: [] }), fills);
  assert.deepEqual(fills.map(o.gap), [P, A, P, A, A], "the weekend that contains T_E abstains by anticipation; old token against old close publishes; reference >= D abstains");
  assert.deepEqual(o.provenance.issuer_time_without_step, ["NFLXx:2025-11-14:4efcfed6-2e00-45f3-9e87-f1b5e0367400"]);
});

// killer: apps/bell/src/corporate-actions.ts:72 CONST "Math.floor" -> "Math.ceil"
test("bell_ca_t_compared_in_floored_seconds", () => {
  // KLACx T = 09:30:00 EDT; C built from the issuer's multipliers. The rule and multiplierAtMs class the fills of the second of T alike.
  const n = nodes("KLACx-history.json")[0];
  assert.ok(n !== undefined && n.multiplierOld !== null && n.multiplierNew !== null);
  const T = sec("2026-06-12T13:30:00Z"), traj = built([[n.multiplierOld, n.multiplierNew, T]]);
  const oldBits = f64BitsHexLE(Number(n.multiplierOld)), newBits = f64BitsHexLE(Number(n.multiplierNew));
  assert.deepEqual([T * 1000 - 1, T * 1000, T * 1000 + 999].map((t) => CA.tokenIsNew(t, T)), [false, true, true]);
  assert.deepEqual([T * 1000 - 1, T * 1000, T * 1000 + 999].map((t) => multiplierAtMs(traj, t)?.bitsHex), [oldBits, newBits, newBits]);
  const o = outcomes(signals({ symbol: "KLACx", splits: [{ execution_date: "2026-06-12", split_from: 1, split_to: 10 }], issuerNodes: [n], trajectory: traj }), [T * 1000 - 1, T * 1000 + 999]);
  assert.deepEqual([o.gap(T * 1000 - 1), o.gap(T * 1000 + 999)], [P, A], "999 ms before T: the pre of D publishes");
});

// killer: apps/bell/src/corporate-actions.ts:80 CONST "classifySession(tSec * 1000).sessionDateET" -> "new Date(tSec * 1000).toISOString().slice(0, 10)"
test("bell_ca_d_candidates_span_weekend", () => {
  // PALLx 5 for 1 and PPLTx 10 for 1 (real): T Saturday 2026-05-16 22:30 EDT, D unknown here; candidates Thursday, Friday, Monday.
  assert.equal(typeof S.prevTradingDay, "function", "sessions.ts exports prevTradingDay");
  const T = sec("2026-05-17T02:30:00Z");
  assert.deepEqual(CA.dCandidates(T), ["2026-05-14", "2026-05-15", "2026-05-18"]);
  const fills = [et(2026, 5, 14, 10, 0), et(2026, 5, 15, 10, 0), et(2026, 5, 18, 10, 0), et(2026, 5, 18, 17, 0)];
  for (const [symbol, file, k] of [["PALLx", "PALLx-history.json", "5"], ["PPLTx", "PPLTx-history.json", "10"]] as const) {
    const o = outcomes(signals({ symbol, issuerNodes: nodes(file), trajectory: built([["1", k, T]]) }), fills);
    assert.deepEqual(fills.map(o.gap), [P, A, A, P], `${symbol}: a group abstains when one candidate triggers`);
    assert.deepEqual(o.provenance.d_candidates, [`${symbol}:2026-05-15:2026-05-14,2026-05-15,2026-05-18`]);
  }
});

// killer: apps/bell/src/corporate-actions.ts:187 CONST "vs.flatMap" -> "[top].flatMap"
test("bell_ca_issuer_versions_union_and_bits_fallback", () => {
  // NVDAx a31ad19b (M-4): v1 Scheduled and v2 Initial at 2026-04-01 23:55 UTC (never executed), v3 Cancelled, v4 Initial at 04-02 11:20
  // UTC, paired at equal bits with the committed NVDAx trajectory.
  const all = [...nodes("NVDAx-upcoming.json"), ...nodes("NVDAx-history.json")], traj = trajectoryOf("rebase-NVDAx.json"), v4 = sec("2026-04-02T11:20:00Z");
  const s = signals({ symbol: "NVDAx", issuerNodes: all, trajectory: traj }), r = CA.reconcile(s);
  assert.deepEqual(r.windows.filter((w) => w.kind === "event" && w.issuerSec.length > 0),
    [{ kind: "event", ds: ["2026-04-01", "2026-04-02", "2026-04-06"], tSec: v4, issuerSec: [sec("2026-04-01T23:55:00Z"), v4], mark: true }], "the union of the instants of every version");
  // killer: apps/bell/src/corporate-actions.ts:216 CONST "p.newBits === f64BitsHexLE(newN)" -> "false"
  assert.deepEqual([r.provenance.multiplier_bits_mismatch, r.provenance.issuer_time_without_step], [[], []], "v4 pairs at equal bits");
  // CONSTRUCTED: the step's bits moved by one unit in the last place (every event that carries them): paired within 1e-9, written.
  const moved = traj.map((e) => (e.multiplierBitsHex === "b24d39196c00f03f" ? { ...e, multiplierBitsHex: "b34d39196c00f03f" } : e));
  assert.deepEqual(CA.reconcile({ ...s, trajectory: moved }).provenance.multiplier_bits_mismatch, ["NVDAx:2026-04-02:a31ad19b-492b-4144-bedd-7b8716fa12c1"]);
  // v2 alone (1.7e-7 from the step, beyond 1e-9): no pairing; its time passed without a step.
  const v2 = CA.reconcile({ ...s, issuerNodes: all.filter((n) => n.version <= 2) });
  assert.deepEqual([v2.provenance.multiplier_bits_mismatch, v2.provenance.issuer_time_without_step], [[], ["NVDAx:2026-04-01:a31ad19b-492b-4144-bedd-7b8716fa12c1"]]);
});

// killer: apps/bell/src/corporate-actions.ts:238 CONST "Math.abs(step.k - 1) < DIVIDEND_MARK_BOUND" -> "true"
test("bell_ca_dividend_mark_bound_half_percent", () => {
  // CONSTRUCTED dividends on 2026-03-13 23:55 UTC (19:55 EDT, the after session): |k - 1| = 0.004 marked, 0.006 abstained, and 0.004
  // behind an overwritten pending update unmarked.
  assert.equal(CA.DIVIDEND_MARK_BOUND, 0.005);
  const T = sec("2026-03-13T23:55:00Z"), fill = et(2026, 3, 13, 17, 0);
  const div = (n: string): CA.IssuerNode[] => [{ eventId: "d1v-0001", version: 1, caType: "CashDividend", effectiveTimeUtc: "2026-03-13T23:55:00.000Z", multiplierOld: "1", multiplierNew: n, status: "Initial" }];
  assert.equal(outcomes(signals({ symbol: "DVx", issuerNodes: div("1.004"), trajectory: built([["1", "1.004", T]]) }), [fill]).gap(fill), M);
  assert.equal(outcomes(signals({ symbol: "DVx", issuerNodes: div("1.006"), trajectory: built([["1", "1.006", T]]) }), [fill]).gap(fill), A);
  const pending = built([["1", "1.002", T + 30 * 86_400], ["1.002", "1.004", T]]).map((e) => (e.slot === 2 ? { ...e, blockTimeSec: T - 7200 } : e));
  assert.equal(outcomes(signals({ symbol: "DVx", issuerNodes: div("1.004"), trajectory: pending }), [fill]).gap(fill), A, "an overwritten pending update: no mark");
});

const HON_SO = nodes("HONx-history.json", (x) => x.eventId.startsWith("ca3da1bc")).concat(nodes("HONx-upcoming.json", (x) => x.eventId.startsWith("ca3da1bc")));
const T_RS = sec("2026-06-29T15:30:00Z"), T_SO = sec("2026-06-29T23:55:00Z");
const HON_C = built([["1.024094713306789", "0.5120473566533945", T_RS], ["0.5120473566533945", "0.9990655067370947", T_SO]]);
const HON_C_SO = built([["0.5120473566533945", "0.9990655067370947", T_SO]]);

// killer: apps/bell/src/corporate-actions.ts:249 CONST "?? null" -> "?? (step === undefined ? null : dateOf(step.tSec))"
test("bell_ca_unitless_types_never_auto_lift", () => {
  // HONx SpinOff ca3da1bc (real, k = 1.951119352, no D at Massive), its step built from the issuer's multipliers: the step never lifts.
  const fills = [et(2026, 6, 25, 10, 0), et(2026, 6, 30, 10, 0), et(2026, 6, 30, 17, 0), et(2026, 7, 15, 10, 0)];
  for (const nowSec of [sec("2026-07-01T00:00:00Z"), sec("2026-10-22T00:00:00Z")]) {
    const o = outcomes(signals({ symbol: "HONx", nowSec, issuerNodes: HON_SO, trajectory: HON_C_SO }), fills);
    assert.deepEqual(fills.map(o.gap), [P, A, A, A], "k != 1 without D: the open abstention holds, course after course, step paired");
  }
  const adr: CA.AdrLine = { eventId: "ca3da1bc-04d2-4c6a-a23e-51f7c58ee06d", dated: "2026-10-22 06:00 UTC (constructed)", dReadET: "2026-06-30" };
  assert.deepEqual(fills.map(outcomes(signals({ symbol: "HONx", issuerNodes: HON_SO, trajectory: HON_C_SO, adrLines: [adr] }), fills).gap), [P, A, P, P], "a dated ADR line that reads D: DJ-1");
  // CONSTRUCTED NameChange at k = 1 (equal bits), 2026-02-10 08:30 ET: open from the group that holds 00:00 ET of Monday 02-09 (the night
  // anchored on Friday 02-06), lifted by a dated ADR line alone.
  const nc: CA.IssuerNode[] = [{ eventId: "n4me-0001", version: 1, caType: "NameChange", effectiveTimeUtc: "2026-02-10T13:30:00.000Z", multiplierOld: "1.25", multiplierNew: "1.25", status: "Initial" }];
  const ncFills = [et(2026, 2, 6, 10, 0), et(2026, 2, 6, 17, 0), et(2026, 2, 7, 12, 0), et(2026, 2, 9, 5, 0), et(2026, 3, 2, 10, 0)];
  for (const nowSec of [sec("2026-02-11T00:00:00Z"), sec("2026-10-22T00:00:00Z")]) assert.deepEqual(ncFills.map(outcomes(signals({ symbol: "NCx", nowSec, issuerNodes: nc }), ncFills).gap), [P, P, A, A, A]);
  assert.deepEqual(ncFills.map(outcomes(signals({ symbol: "NCx", issuerNodes: nc, adrLines: [{ eventId: "n4me-0001", dated: "2026-10-22 06:00 UTC (constructed)", dReadET: null }] }), ncFills).gap), [P, P, P, P, P]);
});

// killer: apps/bell/src/corporate-actions.ts:209 CONST "of events)" -> "of events.slice(0, 1))"
test("bell_ca_honx_union_of_two_windows", () => {
  // HONx 2026-06-29 (real, M-4): ReverseSplit 2 for 1 at 15:30 UTC, then SpinOff at 23:55 UTC; no D at Massive; C built from the
  // issuer's multipliers. The expected verdicts are those of the hand table (J01 to J07, J02 ruled).
  const issuerNodes = [...nodes("HONx-history.json"), ...nodes("HONx-upcoming.json")].filter((n) => !n.eventId.startsWith("13e01fd9"));
  const cases = TABLE.cases.filter((c) => c.event === "HON2");
  assert.equal(cases.length, 7);
  const o = outcomes(signals({ symbol: "HONx", issuerNodes, trajectory: HON_C }), cases.map((c) => c.t_ms));
  assert.deepEqual(cases.map((c) => o.gap(c.t_ms) === A), cases.map((c) => c.abstained ?? RULED[c.id]), "the union of the two windows");
  assert.deepEqual(o.provenance, { ...NONE, d_candidates: ["HONx:2026-06-29:2026-06-26,2026-06-29,2026-06-30"] });
});

// killer: apps/bell/src/corporate-actions.ts:200 CONST "!issuerReadOf(s.issuer)" -> "false"
test("bell_ca_unread_issuer_abstains_without_lift", () => {
  // TSLAon (Ondo, not read); M CONSTRUCTED: a 3-for-1 split of TSLA executed Monday 2026-08-24 and a dividend ex 2026-09-14.
  assert.deepEqual([CA.issuerOf("TSLAon"), CA.issuerOf("TSLAx"), CA.issuerOf("NFLXx")], ["Ondo", "xStocks", null]);
  assert.deepEqual(CA.ISSUER_MECHANISMS.map((r) => r.issuer).sort(), ["Backpack", "Binance", "Coinbase", "Ondo", "Robinhood", "xStocks"]);
  assert.deepEqual(CA.ISSUER_MECHANISMS.filter((r) => r.read).map((r) => r.issuer), ["xStocks"], "xStocks alone is read");
  assert.ok(CA.ISSUER_MECHANISMS.every((r) => !r.read || (r.datedLine !== null && /^2026-10-22 /.test(r.datedLine))), "a read row carries its dated line");
  // killer: apps/bell/src/corporate-actions.ts:141 CONST "r.read && r.datedLine !== null && r.datedLine.trim() !== \"\"" -> "r.read"
  assert.deepEqual([CA.issuerReadOf("Ondo"), CA.issuerReadOf("xStocks"), CA.issuerReadOf(null), CA.issuerReadOf("Ondo", [{ issuer: "Ondo", read: true, datedLine: null }])], [false, true, false, false]);
  const fills = [et(2026, 8, 20, 10, 0), et(2026, 8, 21, 10, 0), et(2026, 8, 22, 12, 0), et(2026, 10, 1, 10, 0)];
  for (const nowSec of [sec("2026-08-25T00:00:00Z"), sec("2026-10-22T00:00:00Z")]) {
    const o = outcomes(signals({ symbol: "TSLAon", issuer: CA.issuerOf("TSLAon"), nowSec, splits: [{ execution_date: "2026-08-24", split_from: 1, split_to: 3 }], dividends: [{ ex_dividend_date: "2026-09-14" }] }), fills);
    assert.deepEqual([fills.map(o.gap), fills.map(o.volume)], [[P, A, A, A], [P, A, A, A]], "every group anchored on or after prevTradingDay(D) abstains, gap and volume");
  }
});

// ---- Fold of the first review (REVUE-1a-i, M-1 and M-2; tests 18 to 21 of the lot, written by the reviewer, renamed here) -------------
// M-1: the ex date of a dividend is the one of M that falls among dCandidates(T); without one, the candidates (DJ-3). All M records below
// are CONSTRUCTED; the SPYx nodes and trajectory are the real fixtures.
const SPY = { symbol: "SPYx", issuerNodes: nodes("SPYx-history.json"), trajectory: trajectoryOf("rebase-SPYx.json") };
/** A CONSTRUCTED dividend activated at 00:00 EDT of its ex date, Monday 2026-03-16 (04:00 UTC): T falls in the night anchored on Friday 03-13. */
function exDayDividend(n: string): CA.Signals {
  const T = sec("2026-03-16T04:00:00Z");
  return signals({ symbol: "DVx", nowSec: T + 30 * 86_400, dividends: [{ ex_dividend_date: "2025-12-15" }, { ex_dividend_date: "2026-03-16" }],
    issuerNodes: [{ eventId: "d1v-ex-0001", version: 1, caType: "CashDividend", effectiveTimeUtc: "2026-03-16T04:00:00.000Z", multiplierOld: "1", multiplierNew: n, status: "Initial" }],
    trajectory: built([["1", n, T]]) });
}

// killer: apps/bell/src/corporate-actions.ts:237 CONST "dCandidates(tRef).includes(d)" -> "true"
test("bell_ca_dividend_ex_absent_at_m_never_takes_an_older_one", () => {
  // Test 18. M knows one SPY ex date, 2025-12-15 (the dividend executed 2026-01-30); the dividends executed 2026-05-01 and 2026-06-18
  // have no record at M. The regular of 2026-03-02 lies after the first step and before the others: no dividend acts on it.
  const fill = et(2026, 3, 2, 10, 0);
  assert.equal(outcomes(signals({ ...SPY, dividends: [] }), [fill]).gap(fill), P, "without M: candidates around T, the session publishes");
  assert.equal(outcomes(signals({ ...SPY, dividends: [{ ex_dividend_date: "2025-12-15" }] }), [fill]).gap(fill), P, "an older ex date is never the D of a later dividend");
});

// killer: apps/bell/src/corporate-actions.ts:237 CONST "dCandidates(tRef).includes(d)" -> "d <= date"
test("bell_ca_dividend_ex_on_the_day_after_the_anchor_of_t", () => {
  // Test 19. M carries the ex date 2026-03-16 and an older one; T is anchored on the Friday before.
  const s = exDayDividend("1.002");
  assert.deepEqual([et(2026, 2, 2, 10, 0), et(2026, 3, 16, 10, 0)].map(outcomes(s, [et(2026, 2, 2, 10, 0), et(2026, 3, 16, 10, 0)]).gap), [P, M],
    "February publishes; the regular of the ex date (old reference, new token) carries the mark");
});

// killer: apps/bell/src/corporate-actions.ts:237 CONST "dCandidates(tRef).includes(d)" -> "d <= date"
test("bell_ca_dividend_ex_beyond_half_percent_never_publishes_the_ex_day", () => {
  // Test 20. The same dividend at k = 1.01, beyond DJ-3's 0.005: the regular of the ex date mixes units and abstains, with M and without.
  const s = exDayDividend("1.01"), fill = et(2026, 3, 16, 10, 0);
  assert.equal(outcomes(s, [fill]).gap(fill), A, "old reference close, new token, beyond the mark bound: abstain");
  assert.equal(outcomes({ ...s, dividends: [] }, [fill]).gap(fill), A, "without M (candidates), the same session abstains");
});

// killer: apps/bell/src/corporate-actions.ts:251 CONST "Math.min(openStartMs(tRef), openStartMs(topSec ?? tRef))" -> "openStartMs(topSec ?? tRef)"
test("bell_ca_open_abstention_starts_from_the_candidates_of_t_c", () => {
  // Test 21 (M-2). HONx SpinOff ca3da1bc (real E, T_E 2026-06-29 23:55 UTC, k != 1, no D); C CONSTRUCTED from the issuer's multipliers but
  // five days earlier, 2026-06-24 23:55 UTC (a disagreement on T). The open abstention starts from the earlier of the two starts.
  const fill = et(2026, 6, 25, 10, 0);
  const o = outcomes(signals({ symbol: "HONx", issuerNodes: HON_SO, trajectory: built([["0.5120473566533945", "0.9990655067370947", sec("2026-06-24T23:55:00Z")]]) }), [fill]);
  assert.deepEqual(o.provenance.corporate_action_disagreements, ["HONx:2026-06-24:T"], "the disagreement on T is written");
  assert.equal(o.gap(fill), A, "new token after T_C, k != 1 without D: abstain");
});
