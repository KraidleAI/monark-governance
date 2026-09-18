// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// Oracle for the Narabi sentinel (PLAN-m012 §3). All offline: RPC and the block->timestamp reader are
// injected stubs, fixtures are the sha-pinned committed series + a one-off boundary-timestamp fixture
// (blocks <= 2025-10-15, ADR-M012 D6). Fixtures are typed at the JSON boundary so the test-debt ratchet
// (lint-ratchet.json, 69) sees no `any`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { splitQuantile, trackerReplay, trackerDigest, trackerStepSize, mulberry32 } from "@monark/hikae";
import type { Miscover } from "@monark/hikae";
import { USDE_STABLE_RUN_CALIB } from "@monark/harness/calibration";
import { daysUTC, firstBlockAtOrAfter, windowBounds, midnightOf } from "../src/windows.ts";
import { makeRpcPool, QuorumDisagreementError, TRANSFER_TOPIC, providerOf, PUBLIC_ENDPOINTS } from "../src/rpc.ts";
import type { RpcCall, RpcPool } from "../src/rpc.ts";
import { attest } from "../src/flow.ts";
import type { WindowFacts } from "../src/flow.ts";
import { initState, step, stateSummary, committedQ1, boundThm1, projectedBoundT, lineHashOf, TRACKER_PARAMS } from "../src/timeline.ts";
import type { SentinelState, TimelineLine } from "../src/timeline.ts";
import { dueDays, runDue, resolveStartDay, j0SourceOf } from "../src/run.ts";
import { buildInstrument, pageCusumMax, foldSeries, foldSeriesWithDays, assertOutPathAllowed, EDET_PREREGISTRATION_COMMIT, EDET_ANCHOR_LINE_HASH } from "../src/instrument.ts";
import { EDET, DISQUALIFIED_P0, logBaseIncrement, makeGrid, gridFor, firstCrossing, runEDetector, bridgeMonoLambda } from "../src/edetector.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const PROV = { endpoints: ["stub://a", "stub://b"], node_version: "test", sentinel_sha: "0".repeat(64) };
const B = 1 / 24;

interface SeriesWindow {
  day: string; regime: string; fromBlock: number; toBlock: number;
  burns: string; mints: string; supplyClose: string; supplyOpen: string;
  c1_ok: boolean; v_t_per_hr: number | null; error?: string;
}
interface Series { deploy_block: number; genesis_day: string; windows: SeriesWindow[]; }
interface BoundaryWindow { day: string; fromBlock: number; tsFrom: number; tsPrev: number; }
interface Boundaries { ceiling_block: number; windows: BoundaryWindow[]; }

const series = JSON.parse(readFileSync(join(ROOT, "fixtures", "usde-calib-series.json"), "utf8")) as Series;
const boundaries = JSON.parse(readFileSync(join(HERE, "fixtures", "usde-boundary-blocks.json"), "utf8")) as Boundaries;

function factsOf(w: SeriesWindow): WindowFacts {
  return { day: w.day, fromBlock: w.fromBlock, toBlock: w.toBlock, burns: BigInt(w.burns), mints: BigInt(w.mints), supplyClose: BigInt(w.supplyClose), supplyOpen: BigInt(w.supplyOpen) };
}
function stepOne(state: SentinelState, w: WindowFacts): { line: TimelineLine; state: SentinelState } {
  const r = attest(w);
  if (r.status === "c1_fail") throw new Error(`unexpected c1_fail ${w.day}`);
  return step(state, w, r, PROV);
}
function replayWindows(ws: readonly SeriesWindow[]): { lines: TimelineLine[]; state: SentinelState } {
  let state = initState();
  const lines: TimelineLine[] = [];
  for (const w of ws) {
    if (w.error) continue;
    const out = stepOne(state, factsOf(w));
    state = out.state; lines.push(out.line);
  }
  return { lines, state };
}

/** A monotone, piecewise-constant block->ts oracle from the sparse boundary fixture: the REAL binary
 *  search lands on each boundary offline (ADR-M012 C-5). ts(b) = ts of the largest boundary point <= b. */
function makeOracle(): (b: number) => number {
  const pts: Array<[number, number]> = [];
  for (const w of boundaries.windows) { pts.push([w.fromBlock - 1, w.tsPrev]); pts.push([w.fromBlock, w.tsFrom]); }
  pts.sort((a, z) => a[0] - z[0]);
  return (block: number): number => {
    const first = pts[0];
    if (first === undefined) throw new Error("empty boundary oracle");
    if (block < first[0]) return first[1];
    let lo = 0, hi = pts.length - 1, ans = first[1];
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const pm = pts[mid];
      if (pm === undefined) break;
      if (pm[0] <= block) { ans = pm[1]; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  };
}

/** A stub pool serving the fixture windows: block ts via the boundary oracle, flow/supply keyed by block. */
function fixtureRpc(finalizedBlock: number, finalizedTs: number): RpcPool {
  const oracle = makeOracle();
  const byFrom = new Map(series.windows.map((w) => [w.fromBlock, w]));
  const supply = new Map<number, bigint>();
  for (const w of series.windows) { supply.set(w.toBlock, BigInt(w.supplyClose)); supply.set(w.fromBlock - 1, BigInt(w.supplyOpen)); }
  return {
    finalized: () => Promise.resolve({ block: finalizedBlock, ts: finalizedTs }),
    blockTs: (b) => Promise.resolve(oracle(b)),
    windowFlow: (from) => {
      const w = byFrom.get(from);
      if (!w) throw new Error(`no fixture window at ${String(from)}`);
      return Promise.resolve({ burns: BigInt(w.burns), mints: BigInt(w.mints) });
    },
    supplyAt: (b) => {
      const s = supply.get(b);
      if (s === undefined) throw new Error(`no fixture supply at ${String(b)}`);
      return Promise.resolve(s);
    },
  };
}

function threeConsecutiveActive(): [SeriesWindow, SeriesWindow, SeriesWindow] {
  for (let i = 0; i + 2 < series.windows.length; i++) {
    const a = series.windows[i], b = series.windows[i + 1], c = series.windows[i + 2];
    if (a && b && c && a.v_t_per_hr !== null && b.v_t_per_hr !== null && c.v_t_per_hr !== null) return [a, b, c];
  }
  throw new Error("no 3 consecutive active fixture days");
}

// ── 1 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_windows_identical_to_pull", async () => {
  const oracle = makeOracle();
  const days = daysUTC(series.genesis_day, "2025-10-16");
  assert.equal(days.length, series.windows.length, "day count matches the pull's two ranges");
  const hi = boundaries.ceiling_block + 1;
  for (let k = 0; k < days.length; k++) {
    const day = days[k]![2];
    const w = series.windows[k]!;
    const fromBlock = await firstBlockAtOrAfter(midnightOf(day), series.deploy_block, hi, oracle);
    assert.equal(fromBlock, w.fromBlock, `fromBlock ${day}`);
  }
  for (let k = 0; k < days.length - 1; k++) {
    const bounds = await windowBounds(days[k]![2], series.deploy_block, hi, oracle);
    assert.equal(bounds.fromBlock, series.windows[k]!.fromBlock, `bounds.fromBlock ${days[k]![2]}`);
    assert.equal(bounds.toBlock, series.windows[k]!.toBlock, `bounds.toBlock ${days[k]![2]}`);
    assert.equal(bounds.toBlock + 1, series.windows[k + 1]!.fromBlock, `0 gap/overlap at ${String(k)}`);
  }
  // The last window's toBlock is the D6 ceiling; the boundary block beyond it (> 2025-10-15) is un-queryable.
  assert.equal(series.windows[days.length - 1]!.toBlock, boundaries.ceiling_block);
  // The 3 C-6 reference windows explicitly (deliverable 2 — pull <-> module identity).
  for (const day of ["2025-10-11", "2025-03-01", "2025-02-21"]) {
    const w = series.windows.find((x) => x.day === day)!;
    const fromBlock = await firstBlockAtOrAfter(midnightOf(day), series.deploy_block, hi, oracle);
    assert.equal(fromBlock, w.fromBlock, `C-6 ${day} fromBlock`);
  }
});

// ── 2 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_c1_fail_closed", () => {
  const base = series.windows.find((w) => w.v_t_per_hr !== null)!;
  const broken = factsOf(base);
  const tampered: WindowFacts = { ...broken, supplyOpen: broken.supplyOpen + 1n }; // identity S_open = close+burns-mints now violated
  const r = attest(tampered);
  assert.equal(r.status, "c1_fail", "a broken C1 identity is fail-closed (out of timeline)");
  assert.equal(attest(broken).status !== "c1_fail", true, "the untampered window passes C1");
});

// ── 3 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_no_peek_labelDelay1", () => {
  const base = replayWindows(series.windows).lines;
  const jIdx = series.windows.findIndex((w, i) => i > 400 && w.v_t_per_hr !== null);
  assert.ok(jIdx > 0);
  const w = series.windows[jIdx]!;
  const newBurns = BigInt(w.burns) + 10n ** 24n;
  const newOpen = BigInt(w.supplyClose) + newBurns - BigInt(w.mints); // keep C1 while changing v
  const mutated = series.windows.map((x, i) => i === jIdx ? { ...x, burns: newBurns.toString(), supplyOpen: newOpen.toString() } : x);
  const after = replayWindows(mutated).lines;
  for (let i = 0; i < jIdx; i++) {
    assert.equal(after[i]!.line_hash, base[i]!.line_hash, `line ${String(i)} unchanged by a FUTURE outcome`);
    assert.equal(after[i]!.q_after, base[i]!.q_after);
  }
  assert.notEqual(after[jIdx]!.v, base[jIdx]!.v, "the mutated future window itself did change");
});

// ── 4 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_two_timelines_never_merged", () => {
  const { lines } = replayWindows(series.windows);
  assert.ok(lines.some((l) => l.E_tracker !== null && l.E_tracker !== l.E_static), "E_tracker (moving q) and E_static (committed q̂) diverge");
  const src = readFileSync(join(HERE, "..", "src", "timeline.ts"), "utf8");
  assert.ok(!/\breason\b/.test(src) && !/"covered"/.test(src), "E is never derived from a gate reason/verdict (M2)");
});

// ── 5 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_regime_is_metadata", () => {
  const { lines, state } = replayWindows(series.windows);
  assert.equal(state.calmMiss.length, 616, "rolling uses only calm pairs");
  assert.ok(state.eStatic.length > state.calmMiss.length, "the tracker steps on non-calm pairs too (regime is not a filter)");
  assert.ok(lines.some((l) => l.regime.stress && l.E_tracker !== null), "a stressed pair still steps the tracker");
  // Regime never enters the recursion: replaying only the scores reproduces q exactly.
  assert.equal(trackerReplay(state.tracker.q1, state.tracker.params, state.scores).q, state.tracker.q);
});

// ── 6 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_replay_equals_state", () => {
  const { lines, state } = replayWindows(series.windows);
  const summary = stateSummary(state);
  assert.equal(trackerReplay(state.tracker.q1, state.tracker.params, state.scores).q, summary.tracker.q);
  assert.equal(summary.replay_q, summary.tracker.q);
  assert.equal(summary.digest, trackerDigest(state.tracker.q1, state.tracker.params, state.scores));
  assert.equal(lines[lines.length - 1]!.digest_T, summary.digest, "the last line's digest_T equals state.json.digest byte-for-byte");
});

// ── 7 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_hash_chain", () => {
  const { lines } = replayWindows(series.windows);
  const i = lines.findIndex((l, k) => l.pair_status !== "non_evaluable" && lines[k + 1] !== undefined);
  assert.ok(i >= 0);
  const orig = lines[i]!;
  const tampered: TimelineLine = { ...orig, burns: (BigInt(orig.burns) + 1n).toString() }; // fact changed, s unchanged
  assert.notEqual(lineHashOf(tampered), orig.line_hash, "tampering a FACT breaks the recomputed hash");
  assert.equal(lines[i + 1]!.prev_line_hash, orig.line_hash, "the next line pins the untampered hash (chain detects it)");
});

// ── 8 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_gap_is_lag_not_skip", async () => {
  const [d0, d1, d2] = threeConsecutiveActive();
  const hi = boundaries.ceiling_block + 1;
  // dueDays is contiguous and never skips; a day whose close is not yet finalized is omitted (LAG).
  const finAll = midnightOf(d2.day) + 86_400; // covers d0,d1,d2 close
  assert.deepEqual(dueDays(null, finAll, d0.day, d2.day), [d0.day, d1.day, d2.day]);
  const finTwo = midnightOf(d2.day); // covers d0,d1 close only (d2 close = midnight(d3) not finalized)
  assert.deepEqual(dueDays(null, finTwo, d0.day, d2.day), [d0.day, d1.day], "d2 not finalized => lag, not skipped");
  // Run the two due days, then resume for d2 IN ORDER; T advances only on real steps.
  const rpc = fixtureRpc(hi, finAll);
  const run1 = await runDue(initState(), rpc, [d0.day, d1.day], hi, PROV);
  assert.deepEqual(run1.processedDays, [d0.day, d1.day]);
  assert.equal(run1.state.tracker.t, 1, "d0 has no predecessor (T stays 0); the d0->d1 pair is the first step");
  const run2 = await runDue(run1.state, rpc, dueDays(d1.day, finAll, d0.day, d2.day), hi, PROV);
  assert.deepEqual(run2.processedDays, [d2.day], "the previously-missing day is picked up next, in order");
  assert.equal(run2.state.tracker.t, 2);
  // A real day-GAP is lag, never a step: the across-gap pair (d0 -> d2, 2 days apart) is non_evaluable (M3).
  let g = initState();
  g = stepOne(g, factsOf(d0)).state; // no predecessor -> non_evaluable
  const gap = stepOne(g, factsOf(d2)); // d0 and d2 are 2 days apart -> not consecutive -> no step
  assert.equal(gap.line.pair_status, "non_evaluable", "a day-gap is not paired (lag, not a skipped step)");
  assert.equal(gap.state.tracker.t, 0, "T is unchanged across a gap");
});

// ── C1 ───────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_fails_closed_without_J0", () => {
  // First run, no J0, empty state, no --day: fail-closed throw (never a silent [] that publishes nothing forever).
  assert.throws(() => resolveStartDay(undefined, null, null, "2026-09-18"), /MONARK_SENTINEL_J0 must be set/);
  // With J0 set to a past finalized day, the start resolves and the due list is non-empty (the job publishes).
  const start = resolveStartDay("2026-09-16", null, null, "2026-09-18");
  const due = dueDays(null, midnightOf("2026-09-18"), start, null);
  assert.ok(due.length > 0, "a set J0 in the finalized past yields a non-empty due list");
  // O-a: the J0 source is env on a fresh state with MONARK_SENTINEL_J0, day for an explicit --day, and
  // state once resuming (prevDay set, env/day unused — dueDays marches from prevDay+1).
  assert.equal(j0SourceOf("2026-09-16", null, null), "env");
  assert.equal(j0SourceOf(undefined, "2026-09-17", null), "day");
  assert.equal(j0SourceOf("2026-09-16", null, "2026-09-17"), "state");
});

// ── 9 ────────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_clip_flag", () => {
  const S = 10n ** 25n;
  const w1: WindowFacts = { day: "2030-01-01", fromBlock: 100, toBlock: 200, burns: 0n, mints: 0n, supplyClose: S, supplyOpen: S };
  const w2: WindowFacts = { day: "2030-01-02", fromBlock: 201, toBlock: 300, burns: 2n * S, mints: 2n * S, supplyClose: S, supplyOpen: S }; // burns/S_open = 2 => v = 2/24 > B
  let state = initState();
  state = stepOne(state, w1).state; // v1 = 0, non_evaluable pair (no predecessor)
  const out = stepOne(state, w2);
  assert.ok(out.line.s_raw !== null && out.line.s_raw > B, "s_raw exceeds B");
  assert.equal(out.line.s, B, "s is clipped to B");
  assert.equal(out.line.pair_status, "clipped");
  assert.equal(out.line.E_static, out.line.s > committedQ1() ? 1 : 0, "E is computed on the clipped score");
});

// ── 10 ───────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_drift_criterion_in_sample_zero", () => {
  const { lines, state } = replayWindows(series.windows);
  const rollings = lines.map((l) => l.rolling90_calm_miss).filter((x): x is number => x !== null);
  const max = Math.max(...rollings);
  assert.ok(Math.abs(max - 27 / 90) <= 1e-9, `max rolling90_calm_miss = ${String(max)} (expected 0.30 = 27/90)`);
  assert.ok(!lines.some((l) => l.drift_flag), "0 drift triggers at 0.40 in-sample");
  assert.equal(state.calmMiss.length, 616, "over the 616 mechanical calm pairs");
});

// ── 11 ───────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_bound_thm1_daily", () => {
  assert.ok(boundThm1(1) > 1, "at T=1 the bound exceeds 1");
  assert.ok(boundThm1(1789) <= 0.1, "at T=1789 (ε=0.1) the bound reaches δ_target");
  assert.ok(boundThm1(1788) > 0.1);
  assert.equal(projectedBoundT(0.1), 1789);
  const eta1 = trackerStepSize(0, TRACKER_PARAMS), etaT = trackerStepSize(1788, TRACKER_PARAMS);
  assert.equal(boundThm1(1789), (TRACKER_PARAMS.B + eta1) / (1789 * etaT), "bound uses trackerStepSize, not a reimplementation");
});

// ── 12 ───────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_imports_bidirectional", () => {
  const collect = (dir: string): string[] => {
    const out: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".ts")) out.push(p);
      }
    };
    walk(dir); return out;
  };
  // Match IMPORT specifiers only (the SENTINEL header line names apps/harness/src/tools in prose).
  const importsFrom = (text: string, re: RegExp): boolean => text.split("\n").some((ln) => /^\s*(import|export)\b/.test(ln) && re.test(ln));
  for (const f of collect(join(ROOT, "apps", "harness"))) {
    assert.ok(!importsFrom(readFileSync(f, "utf8"), /sentinel/), `harness must not import the sentinel: ${f}`);
  }
  for (const f of collect(join(ROOT, "apps", "sentinel", "src"))) {
    assert.ok(!importsFrom(readFileSync(f, "utf8"), /harness\/src\/tools/), `sentinel must not import a harness tool: ${f}`);
  }
  // R-1 (G2 M012-c): the ONLY @monark/harness specifier anywhere under apps/sentinel/** is exactly the C3
  // export @monark/harness/calibration. A bare `@monark/harness` (the server entry, which pulls the tools
  // registry) or any other subpath reddens — it would re-open the R-3 / K-8 hole the subpath export closed.
  const harnessSpecifiers: string[] = [];
  for (const f of [...collect(join(ROOT, "apps", "sentinel", "src")), ...collect(join(ROOT, "apps", "sentinel", "test"))]) {
    for (const ln of readFileSync(f, "utf8").split("\n")) {
      if (!/^\s*(import|export)\b/.test(ln)) continue;
      const m = /["'](@monark\/harness[^"']*)["']/.exec(ln);
      if (m && m[1]) harnessSpecifiers.push(m[1]);
    }
  }
  assert.ok(harnessSpecifiers.length >= 1, "the sentinel must import @monark/harness/calibration (positive control)");
  for (const s of harnessSpecifiers) {
    assert.equal(s, "@monark/harness/calibration", `the only @monark/harness specifier allowed under apps/sentinel/** is @monark/harness/calibration (saw '${s}')`);
  }
  assert.ok(/windows\.(ts|mjs)/.test(readFileSync(join(ROOT, "scripts", "usde-full-pull.mjs"), "utf8")), "the pull imports the shared window module (deliverable 2)");
});

// ── 12b ──────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_waits_for_finality", async () => {
  const D = "2026-09-10";
  const beforeClose = midnightOf(D) + 3600;   // 01:00 of D — D's close (D+1 midnight) NOT finalized
  const afterClose = midnightOf(D) + 90_000;  // past D+1 midnight — what `latest` would report (mutant M4)
  const call: RpcCall = (_url, method, params) => {
    if (method === "eth_getBlockByNumber") {
      const tag = params[0];
      if (tag === "finalized") return Promise.resolve({ number: "0x1", timestamp: "0x" + beforeClose.toString(16) });
      if (tag === "latest") return Promise.resolve({ number: "0x2", timestamp: "0x" + afterClose.toString(16) });
    }
    throw new Error(`unexpected ${method}`);
  };
  const rpc = makeRpcPool({ call, endpoints: ["a", "b"] });
  const fin = await rpc.finalized();
  assert.ok(fin.ts < midnightOf(D) + 86_400, "finalized head is before D's close");
  assert.deepEqual(dueDays(null, fin.ts, D, D), [], "D is not processed until its close is finalized (M4: latest would process it)");
});

// ── 12c ──────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_quorum_disagreement_fails_closed", async () => {
  const supplyCall: RpcCall = (url, method) => {
    if (method === "eth_call") return Promise.resolve(url === "a" ? "0x64" : "0x65"); // 100 vs 101 — disagree
    throw new Error("unexpected");
  };
  await assert.rejects(() => makeRpcPool({ call: supplyCall, endpoints: ["a", "b"] }).supplyAt(123), QuorumDisagreementError);
  const burnLog = (v: number): unknown => ({ topics: [TRANSFER_TOPIC, "0x" + "1".repeat(64), "0x" + "0".repeat(64)], data: "0x" + v.toString(16) });
  const flowCall: RpcCall = (url, method) => {
    if (method === "eth_getLogs") return Promise.resolve([burnLog(url === "a" ? 100 : 200)]); // burns disagree
    throw new Error("unexpected");
  };
  await assert.rejects(() => makeRpcPool({ call: flowCall, endpoints: ["a", "b"] }).windowFlow(1, 2), QuorumDisagreementError);
});

// ── 12d ──────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_q1_equals_splitQuantile_of_committed_calib", () => {
  const r = splitQuantile(USDE_STABLE_RUN_CALIB, 0.1, 50);
  assert.ok("qhat" in r);
  assert.equal(committedQ1(), r.qhat, "q1 is the split quantile of the committed calibration, not a pasted literal");
  assert.equal(committedQ1(), 0.00013119228083333334, "the recomputed value (matches the pre-registered 1.3119e-4)");
});

// ── 12e ──────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_state_T_zero_before_J0", () => {
  const s = initState();
  assert.equal(s.tracker.t, 0, "T = 0 before J0 (no pre-filled state)");
  assert.equal(s.scores.length, 0);
  assert.equal(stateSummary(s).tracker.t, 0);
});

// ── instrument ───────────────────────────────────────────────────────────────────────────────────────
test("sentinel_instrument_separate_digest", () => {
  const { state } = replayWindows(series.windows);
  const calmPairDays = foldSeriesWithDays(series.windows).calmPairDays;
  const inst = buildInstrument(state, { perms: 1000, seed: 20260917, calmPairDays });
  // Re-pin (ADR-M014 D4): the CUSUM + permutation section is now LABELLED pre-J0 (retrospective, withdrawn
  // from sequential reading). The keys `cusum`/`cusum_all_evaluable` are KEPT (this test pins them); only the
  // label wording changes, and every measured value below is unchanged.
  assert.equal(inst.cusum.label, "pre-J0 CUSUM (retrospective permutation diagnostic, withdrawn from sequential reading; ADR-M014 D4): E_static over calm pairs");
  assert.equal(inst.cusum_all_evaluable.label, "pre-J0 CUSUM (retrospective permutation diagnostic; ADR-M014 D4): E_static over all evaluable pairs");

  // The instrument is NEVER carried into the live state: state.json (stateSummary) has NO `instrument`
  // key, its shape is exactly the four D4 fields, and run.ts never imports the instrument module.
  const summary = stateSummary(state);
  assert.ok(!("instrument" in summary), "state.json carries no instrument section");
  assert.deepEqual(
    Object.keys(summary).sort(),
    ["digest", "projected_bound_leq_target_T", "replay_q", "tracker"],
    "state.json shape is unchanged by the instrument",
  );
  const runSrc = readFileSync(join(HERE, "..", "src", "run.ts"), "utf8");
  const runReadsInstrument = runSrc.split("\n").some((ln) => /^\s*(import|export)\b/.test(ln) && /instrument/i.test(ln));
  assert.ok(!runReadsInstrument, "run.ts must never import the instrument section (never carried into the live path)");

  // Each instrument replay carries its OWN digest, distinct from the live state digest FOR THE SAME
  // scores — the difference is the parameters (c = q̂, ε = 0.01), not the data.
  assert.equal(inst.live_state_digest, summary.digest, "the instrument's baseline IS the real live state digest");
  // The CLI fold path (foldSeries, used by `node instrument.ts --out`) reproduces the same state as the
  // timeline replay — locks the entry point, not just the pure function.
  assert.equal(stateSummary(foldSeries(series.windows)).digest, summary.digest, "foldSeries reproduces the timeline-replay state");
  assert.equal(inst.scores_n, state.scores.length, "replays run on the full evaluable-pair stream, not a calm subset");
  const [cReplay, epsReplay] = inst.replays;
  assert.ok(cReplay && epsReplay, "two replays are published (c = q̂ and ε = 0.01)");
  assert.equal(cReplay.params.c, committedQ1(), "replay (a) sets c = q̂ (recomputed, not pasted)");
  assert.equal(epsReplay.params.eps, 0.01, "replay (b) sets ε = 0.01");
  for (const r of inst.replays) {
    assert.notEqual(r.digest, inst.live_state_digest, `instrument replay '${r.label}' digest differs from the live state digest`);
    assert.equal(r.digest, trackerDigest(state.tracker.q1, r.params, state.scores), `replay '${r.label}' digest recomputes from (q1, its params, scores)`);
  }
  assert.notEqual(cReplay.digest, epsReplay.digest, "the two replays have distinct digests");
  // ε = 0.01 tightens the bound ~4x sooner (ADR-M012 D6 cross-check: 453 vs 1789 at ε = 0.1).
  assert.equal(inst.eps01_projected_bound_leq_target_T, 453);

  // CUSUM of Page on E_static (calm pairs) + permutation control (ADR-M012 D6 / advisor-defi §0): the
  // measured max statistic is ~9.54 and the permutation p-value is <= 1/(N+1) (0 exceedances here).
  assert.equal(inst.cusum.n, 616, "primary CUSUM is over the 616 mechanical calm pairs");
  assert.equal(inst.cusum.misses, 63);
  assert.equal(inst.cusum.p0, 0.125);
  assert.equal(inst.cusum.p1, 0.25);
  assert.ok(Math.abs(inst.cusum.statistic - 9.5446) < 0.01, `calm CUSUM max = ${String(inst.cusum.statistic)} (measured ~9.54)`);
  assert.equal(inst.cusum.permutation.perms, 1000);
  // R-2 (G2): exceed is 0 (stronger than p <= 0.01) — no permutation reaches the observed statistic — and
  // the p-value keeps the <= 1/(N+1) form.
  assert.equal(inst.cusum.permutation.exceed, 0, "no permutation reaches the observed statistic");
  assert.ok(inst.cusum.permutation.p_value <= 1 / (inst.cusum.permutation.perms + 1), `permutation p-value = ${String(inst.cusum.permutation.p_value)} (<= 1/(N+1))`);
  // Pure recompute: pageCusumMax on the same sequence reproduces the reported statistic.
  assert.equal(pageCusumMax(state.calmMiss, 0.125, 0.25), inst.cusum.statistic);
  // The secondary CUSUM (all 694 evaluable pairs) is declared and larger — the drift is not calm-specific.
  assert.equal(inst.cusum_all_evaluable.n, 694);
  assert.ok(inst.cusum_all_evaluable.statistic > inst.cusum.statistic);
});

// ── 12f ──────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_quorum_survives_one_dead_endpoint", async () => {
  // The measured VPS defect (go 3, 2026-09-18): pool index 1 (eth.llamarpc.com) returns HTTP 525 on every
  // probe while the others answer 200. With the fallback quorum, all three reads succeed on the two OTHER
  // endpoints and the dead one is benched. THREE endpoints so `rr` wraps back onto the dead slot each read:
  // absent a cooldown the dead endpoint would be re-hit on all 3 reads; benched, it is hit exactly once.
  const eps = ["e0", "e1", "e2"];
  const DEAD = eps[1]!;
  const seen: string[] = [];
  const burnLog = { topics: [TRANSFER_TOPIC, "0x" + "1".repeat(64), "0x" + "0".repeat(64)], data: "0x64" }; // burn of 100
  const call: RpcCall = (url, method) => {
    seen.push(url);
    if (url === DEAD) return Promise.reject(new Error(`HTTP 525 ${url}`));
    if (method === "eth_getBlockByNumber") return Promise.resolve({ number: "0x2710", timestamp: "0x66000000" });
    if (method === "eth_call") return Promise.resolve("0x64");
    if (method === "eth_getLogs") return Promise.resolve([burnLog]);
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  const rpc = makeRpcPool({ call, endpoints: eps });
  assert.equal((await rpc.finalized()).block, 0x2710, "finalized quorum returns despite the dead endpoint");
  assert.equal(await rpc.supplyAt(0x2710), 100n, "supplyAt quorum returns from the two live endpoints");
  assert.deepEqual(await rpc.windowFlow(1, 2), { burns: 100n, mints: 0n }, "windowFlow quorum returns from the two live endpoints");
  assert.equal(seen.filter((u) => u === DEAD).length, 1, "the dead endpoint is benched after its first failure (hit 1x, not 3x)");
});

// ── 12g ──────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_quorum_needs_two_live", async () => {
  // Only ONE of the two endpoints answers (the other is a 525 host): a quorum of 2 is unreachable, so every
  // value read fails closed with the quorum error — the window is thrown, nothing is written.
  const mk = (): RpcPool => makeRpcPool({ endpoints: ["a", "b"], call: (url, method) => {
    if (url === "b") return Promise.reject(new Error("HTTP 525 b"));
    if (method === "eth_getBlockByNumber") return Promise.resolve({ number: "0x1", timestamp: "0x1" });
    if (method === "eth_call") return Promise.resolve("0x64");
    if (method === "eth_getLogs") return Promise.resolve([]);
    return Promise.reject(new Error(`unexpected ${method}`));
  } });
  await assert.rejects(() => mk().finalized(), /quorum needs >= 2 live endpoints/);
  await assert.rejects(() => mk().supplyAt(1), /quorum needs >= 2 live endpoints/);
  await assert.rejects(() => mk().windowFlow(1, 2), /quorum needs >= 2 live endpoints/);
});

// ── ADR-M012 item (m) ─────────────────────────────────────────────────────────────────────────────────
test("sentinel_quorum_needs_two_providers", async () => {
  // Two aliases of ONE provider (publicnode) plus one distinct provider: the quorum must pair the first alias
  // with the distinct provider, never the two aliases. With aliases only, it fails closed.
  const P1 = "https://ethereum-rpc.publicnode.com", P1b = "https://ethereum.publicnode.com", P2 = "https://eth.drpc.org";
  assert.equal(providerOf(P1), providerOf(P1b));
  assert.notEqual(providerOf(P1), providerOf(P2));
  // The committed pool must hold at least two distinct providers (else no quorum is ever reachable).
  assert.ok(new Set(PUBLIC_ENDPOINTS.map(providerOf)).size >= 2);
  const seen: string[] = [];
  const call = (url: string, method: string): Promise<unknown> => {
    seen.push(url);
    if (method === "eth_getBlockByNumber") return Promise.resolve({ number: "0x1", timestamp: "0x1" });
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  const ok = makeRpcPool({ endpoints: [P1, P1b, P2], call });
  assert.equal((await ok.finalized()).block, 1);
  assert.deepEqual(seen, [P1, P2], "the alias P1b is skipped; the quorum is P1 + P2");
  const aliases = makeRpcPool({ endpoints: [P1, P1b], call });
  await assert.rejects(() => aliases.finalized(), /quorum needs >= 2 live endpoints from 2 providers/);
});

// ── 12h ──────────────────────────────────────────────────────────────────────────────────────────────
test("sentinel_quorum_parse_error_benches_not_masks", async () => {
  // A malformed payload is a parse error, so quorumTwo BENCHES that endpoint and falls through — it must never
  // mask a real disagreement (a) nor FATAL an otherwise-healthy quorum (b). A serves garbage; B=100, C=101 disagree.
  const mk = (): { rpc: RpcPool; seen: string[] } => {
    const seen: string[] = [];
    const call: RpcCall = (url, method) => {
      seen.push(url);
      if (url === "A") return Promise.resolve(method === "eth_getBlockByNumber" ? null : "not-hex"); // malformed block / non-hex
      const hex = url === "B" ? "0x64" : "0x65"; // 100 vs 101
      return Promise.resolve(method === "eth_getBlockByNumber" ? { number: hex, timestamp: "0x1" } : hex);
    };
    return { rpc: makeRpcPool({ call, endpoints: ["A", "B", "C"] }), seen };
  };
  // (a) A's malformed eth_call is benched; the quorum reaches B and C, whose 100 != 101 fails closed (no silent value).
  const a = mk();
  await assert.rejects(() => a.rpc.supplyAt(1), QuorumDisagreementError);
  assert.equal((await a.rpc.finalized()).block, 0x64, "A stays benched after the parse error: the next read skips it => min(B,C)=100");
  assert.equal(a.seen.filter((u) => u === "A").length, 1, "A was probed once then benched, not re-hit (cooldown, not masked)");
  // (b) A's malformed block is benched (never FATAL); finalized returns the min of the two healthy endpoints.
  assert.equal((await mk().rpc.finalized()).block, 0x64, "finalized succeeds with min(100,101) despite A's malformed block");
});

// ══ M014 — pre-registered e-detector (ADR-M014) ═════════════════════════════════════════════════════════
// The calm-pair miss sequence and each pair's closing-window day, folded through the REAL `step` (the days
// align 1:1 with state.calmMiss; timeline.ts is off-limits and carries no days, so the alignment is
// reconstructed here from the real engine, never re-derived).
function edetFixture(): { calmMiss: readonly Miscover[]; calmPairDays: readonly string[] } {
  const { state, calmPairDays } = foldSeriesWithDays(series.windows);
  return { calmMiss: state.calmMiss, calmPairDays };
}

// ── M014-1: bridge identity — single-lambda e-CUSUM max == Page CUSUM max (9.5446) ──────────────────────
test("sentinel_edetector_bridge_equals_page_cusum", () => {
  const { calmMiss } = edetFixture();
  const bridge = bridgeMonoLambda(calmMiss, 0.125, 0.25).max_logM_cu;
  const page = pageCusumMax(calmMiss, 0.125, 0.25);
  assert.ok(Math.abs(bridge - page) < 1e-9, `bridge max_logM_cu ${String(bridge)} == pageCusumMax ${String(page)}`);
  assert.ok(Math.abs(bridge - 9.5446) < 1e-3, `identity value ~9.5446 (got ${String(bridge)})`);
  // At lambda* the base increment IS the Bernoulli LR (SRR p. 25); a NON-centred B would give ~2.81 and break this.
});

// ── M014-2: constants EDET == ADR-M014 D1 table (read + regex, never pasted) ────────────────────────────
test("sentinel_edetector_constants_match_adr", (t) => {
  // The ADR is governance: it lives only in the source repo (never the public export, where docs/adr is
  // blacklisted). This provenance check therefore runs in the source repo — where the mission oracle runs;
  // in the export it SKIPS (visible in the summary), never a silent pass.
  const adrPath = join(ROOT, "docs", "adr", "ADR-M014-edetector-preregistration.md");
  if (!existsSync(adrPath)) { t.skip("governance ADR absent from the public export"); return; }
  const adr = readFileSync(adrPath, "utf8");
  const num = (s: string): number => Number(s.replace(",", "."));
  const p0m = /`p0`\s*\|\s*\*\*([\d,]+)\*\*/.exec(adr);
  const qm = /`q_L`,\s*`q_U`\s*\|\s*\*\*([\d,]+)\s*;\s*([\d,]+)\*\*/.exec(adr);
  const km = /uniforme K\s*=\s*(\d+)/.exec(adr);
  const dm = /(\d{4}-\d{2}-\d{2})\*\* ; n/.exec(adr);
  const am = /`alpha_arl`\s*\|\s*\*\*10([⁰-⁹¹²³⁻]+)\*\*/.exec(adr);
  assert.ok(p0m && qm && km && dm && am, "the D1 table rows are present in ADR-M014");
  const SUP: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
  const exponent = [...am[1]!].map((c) => SUP[c] ?? "?").join("");
  assert.equal(EDET.p0, num(p0m[1]!), "p0 = ADR D1");
  assert.equal(EDET.qL, num(qm[1]!), "qL = ADR D1");
  assert.equal(EDET.qU, num(qm[2]!), "qU = ADR D1");
  assert.equal(EDET.alphaArl, Number("1e" + exponent), "alphaArl = 10^exponent from ADR D1");
  assert.equal(EDET.K, Number(km[1]!), "K = ADR D1");
  assert.equal(EDET.startAfterDay, dm[1]!, "startAfterDay = ADR D1");
});

// ── M014-3: design check — recomputed from the fixture, never pasted (C-2) ──────────────────────────────
test("sentinel_edetector_design_check", () => {
  const { calmMiss, calmPairDays } = edetFixture();
  assert.equal(calmMiss.length, 616);
  assert.equal(calmPairDays.length, calmMiss.length, "days align 1:1 with calm misses");
  // p0 = 0.30 (bound-carrying class): max log e-SR ~4.383, no crossing of log(1/alpha_arl).
  const grid30 = gridFor(EDET.p0);
  const d30 = runEDetector(calmMiss, EDET.p0, grid30);
  assert.ok(Math.abs(d30.max_logM_sr - 4.383) < 0.01, `p0=0.30 max_logM_sr = ${String(d30.max_logM_sr)} (~4.383)`);
  assert.equal(d30.crossed_sr, null, "p0=0.30 never crosses in-sample (design check, no bound)");
  assert.ok(d30.max_logM_sr < d30.threshold, "max e-SR is below log(1/alpha_arl)");
  // C-b (G2): pin every PUBLISHED scalar. Recompute the e-CUSUM mixture max in the LINEAR domain as an
  // independent oracle (max ~25, no overflow), match it to the log-domain value, and pin crossed_cu === null.
  // The mutant "e-CUSUM mixture collapsed to one component" (mix_cu = cu[j]) reddens here (K=1 is unaffected).
  const cuLin = new Array<number>(grid30.lambdas.length).fill(0);
  let maxLin = 0;
  for (const x of calmMiss) {
    let mix = 0;
    for (let j = 0; j < grid30.lambdas.length; j++) {
      const L = Math.exp(logBaseIncrement(x, grid30.lambdas[j]!, EDET.p0));
      cuLin[j] = L * Math.max(cuLin[j]!, 1);
      mix += grid30.weights[j]! * cuLin[j]!;
    }
    if (mix > maxLin) maxLin = mix;
  }
  assert.ok(maxLin < 1e6, `linear e-CUSUM mixture max ${String(maxLin)} does not overflow`);
  assert.ok(Math.abs(Math.log(maxLin) - d30.max_logM_cu) < 1e-9, "log-domain max_logM_cu matches the linear recompute");
  assert.ok(Math.abs(d30.max_logM_cu - 3.2276310958993952) < 1e-9, `p0=0.30 max_logM_cu = ${String(d30.max_logM_cu)} (pinned 3.2276310958993952)`);
  assert.equal(d30.crossed_cu, null, "p0=0.30 e-CUSUM mixture never crosses in-sample");
  // p0 = 0.125 (disqualified class): first crossing at calm-pair index 279, closing day 2024-10-11.
  const d125 = runEDetector(calmMiss, DISQUALIFIED_P0, gridFor(DISQUALIFIED_P0));
  const idx = d125.crossed_sr;
  assert.equal(idx, 279, `first crossing index (recomputed) = ${String(idx)}`);
  assert.ok(idx !== null);
  assert.equal(calmPairDays[idx], "2024-10-11", "closing-window day of the crossing pair");
});

// ── M014-4a: exact validity — E_{p0}[L^(lambda)] = 1 for the 12 grid lambda (1e-12) ─────────────────────
test("sentinel_edetector_baseline_is_unit_mean", () => {
  const grid = gridFor(EDET.p0);
  let maxdev = 0;
  for (const lam of grid.lambdas) {
    const EL = (1 - EDET.p0) * Math.exp(logBaseIncrement(0, lam, EDET.p0)) + EDET.p0 * Math.exp(logBaseIncrement(1, lam, EDET.p0));
    maxdev = Math.max(maxdev, Math.abs(EL - 1));
  }
  assert.ok(maxdev < 1e-12, `max |E_p0[L] - 1| = ${String(maxdev)} (centred cumulant => unit mean)`);
});

// ── M014-4b: Monte-Carlo ARL bound — crossing frequency <= H*alpha_arl + 3 sigma (Ville, [abs]) ─────────
test("sentinel_edetector_montecarlo_arl_bound", () => {
  const grid = gridFor(EDET.p0);
  const N = 2000;
  for (const p of [0.10, 0.30]) {
    for (const H of [100, 300]) {
      const rnd = mulberry32(0x9e3779b9 ^ (Math.round(p * 100) << 8) ^ H);
      let crossed = 0;
      for (let s = 0; s < N; s++) {
        const seq: Miscover[] = [];
        for (let n = 0; n < H; n++) seq.push(rnd() < p ? 1 : 0);
        if (runEDetector(seq, EDET.p0, grid).crossed_sr !== null) crossed++;
      }
      const freq = crossed / N;
      const sigma = Math.sqrt(Math.max(freq * (1 - freq), 1 / N) / N);
      const bound = H * EDET.alphaArl + 3 * sigma;
      assert.ok(freq <= bound, `p=${String(p)} H=${String(H)}: crossing freq ${String(freq)} <= H*alpha_arl+3sigma ${String(bound)}`);
    }
  }
});

// ── M014-4c: e-SR is a SUM of e-processes (E[M_SR,H] <= H), not a supermartingale bounded by 1 ────────────
// C-a (G2, error_origin = plan): at p = p0 = 0.30, E[L]=1 exactly so E[M_SR,H] = H is a BOUNDARY equality, and
// the mixture is heavy-tailed (a single giant sim can push the RAW sample mean to ~50*H) — a hard "mean <= H"
// flips on the seed (G2 measured 3/31). Fix (worker + advisor 2026-09-18): WINSORIZE each terminal at a
// declared M_CAP = 1000*H (= exp(threshold)*H, tied to the class); min(M, M_CAP) is bounded so its sample mean
// concentrates and E[min(M,M_CAP)] <= E[M] = H. Then (c1) validity: mean_w <= H*(1 + margin), margin =
// 3*sd_w/(sqrt(N)*H) (a 3-sigma CI half-width); the margin has the closed-form ceiling 3*M_CAP/(2*sqrt(N)*H)
// (since sd_w <= M_CAP/2), asserted so the bound can never be vacuous. (c2) witness: mean_w > 1 — THIS is what
// discriminates from a supermartingale (bounded by 1); c1 is the linear-growth ceiling. Seed sweep (>= 30
// bases, two families, session scratchpad sweep4c*.mjs, re-run at checkpoint-2): 0 flips of c1/c2/cap; the
// 49.88*H raw giant winsorizes to 1.211*H. Under ~10 s.
test("sentinel_edetector_sr_sum_not_supermartingale", () => {
  const grid = gridFor(EDET.p0);
  const p = 0.30, N = 2000;
  for (const H of [100, 300]) {
    const M_CAP = 1000 * H;
    const rnd = mulberry32(12345 + H);
    const w: number[] = [];
    for (let s = 0; s < N; s++) {
      const seq: Miscover[] = [];
      for (let n = 0; n < H; n++) seq.push(rnd() < p ? 1 : 0);
      const logM = runEDetector(seq, p, grid).logM_sr;
      w.push(Math.min(Math.exp(logM[logM.length - 1]!), M_CAP)); // winsorize at the declared cap
    }
    const mean = w.reduce((a, b) => a + b, 0) / N;
    const sd = Math.sqrt(w.reduce((a, b) => a + (b - mean) ** 2, 0) / (N - 1));
    const margin = (3 * sd) / (Math.sqrt(N) * H);
    const ceiling = (3 * M_CAP) / (2 * Math.sqrt(N) * H); // analytic ceiling: sd_w <= M_CAP/2
    assert.ok(margin <= ceiling, `H=${String(H)}: margin ${String(margin)} within the declared cap ${String(ceiling)} (non-vacuous)`);
    assert.ok(mean <= H * (1 + margin), `p=0.30 H=${String(H)}: winsorized mean ${String(mean)} <= H*(1+margin) (E[M_SR,H] <= H)`);
    assert.ok(mean > 1, `p=0.30 H=${String(H)}: winsorized mean ${String(mean)} > 1 (grows past 1: not a supermartingale)`);
  }
});

// ── M014-5: grid — K=12, strictly increasing geometric lambda > 0, weights sum to 1 ─────────────────────
test("sentinel_edetector_grid_shape", () => {
  const grid = gridFor(EDET.p0);
  assert.equal(grid.lambdas.length, 12, "K = 12 lambda");
  assert.equal(EDET.K, 12);
  assert.ok(grid.lambdas.every((l) => l > 0), "all lambda > 0");
  const ratios: number[] = [];
  for (let i = 1; i < grid.lambdas.length; i++) {
    assert.ok(grid.lambdas[i]! > grid.lambdas[i - 1]!, "strictly increasing");
    ratios.push(grid.lambdas[i]! / grid.lambdas[i - 1]!);
  }
  assert.ok(Math.max(...ratios) - Math.min(...ratios) < 1e-12, "geometric: constant ratio");
  const wsum = grid.weights.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(wsum - 1) < 1e-12, `weights sum to 1 (got ${String(wsum)})`);
  assert.equal(grid.weights.length, grid.lambdas.length);
});

// ── M014-6: mutant guards — firstCrossing is `>=` (Thm 2.4), makeGrid rejects lambda <= 0 ───────────────
test("sentinel_edetector_mutant_guards", () => {
  // `>=` vs `>`: a value landing EXACTLY on the threshold must cross (mutant `>` returns the later index).
  const T = 5;
  assert.equal(firstCrossing([1, T, 9], T), 1, "firstCrossing uses >= (a value == threshold crosses)");
  assert.equal(firstCrossing([1, 2, 3], T), null, "no crossing below threshold");
  // lambda <= 0 guard: a non-positive tilt is not a valid post-change direction (mutant drops the throw).
  assert.throws(() => makeGrid(0, 1, 12), /lambda must be > 0/);
  assert.throws(() => makeGrid(-0.1, 1, 12), /lambda must be > 0/);
  assert.throws(() => makeGrid(0.5, 0.5, 12), /hi > lo/);
});

// ── M014-7: isolation — run.ts imports neither instrument nor edetector; edetector.ts is pure; no shell ──
test("sentinel_edetector_isolation", () => {
  const importLines = (text: string): string[] => text.split("\n").filter((ln) => /^\s*(import|export)\b/.test(ln));
  const runSrc = readFileSync(join(HERE, "..", "src", "run.ts"), "utf8");
  assert.ok(!importLines(runSrc).some((ln) => /instrument|edetector/i.test(ln)), "run.ts imports neither instrument nor edetector");
  // edetector.ts is pure: no engine import, no node: builtin.
  const edetSrc = readFileSync(join(HERE, "..", "src", "edetector.ts"), "utf8");
  for (const ln of importLines(edetSrc)) {
    assert.ok(!/\.\/(timeline|flow|run|rpc|windows)/.test(ln), `edetector.ts must not import the engine: ${ln}`);
    assert.ok(!/["']node:/.test(ln), `edetector.ts must not import a node: builtin: ${ln}`);
  }
  // No subprocess anywhere in this oracle (C-4): the frozen-tree diff is checked out of band, never here.
  // Tokens are assembled at runtime so this file does not match itself.
  const testSrc = readFileSync(join(HERE, "sentinel.test.ts"), "utf8");
  const cpTok = ["child", "process"].join("_"), execTok = ["exec", "Sync"].join(""), spawnTok = ["spawn", "Sync"].join("");
  assert.ok(!testSrc.includes(cpTok) && !testSrc.includes(execTok) && !testSrc.includes(spawnTok), `the oracle spawns no subprocess (no ${cpTok} shell-out)`);
});

// ── M014-8: --out guard refuses a public/ path (extracted, tested without writing) ──────────────────────
test("sentinel_edetector_out_guard", () => {
  for (const bad of ["/var/lib/monark-sentinel/public/instrument.json", "./public/x.json", "public/x.json"]) {
    assert.throws(() => assertOutPathAllowed(bad), /public/, `refuses ${bad}`);
  }
  for (const ok of ["/var/lib/monark-sentinel/instrument.json", "publicfoo/x.json", "/tmp/instrument.json"]) {
    assert.doesNotThrow(() => assertOutPathAllowed(ok), `allows ${ok}`);
  }
});

// ── M014-9: golden J0 — step(initState(), published J0 facts) reproduces the anchor line_hash ───────────
// J0 facts read once from https://monarkgate.tech/narabi/timeline.jsonl on 2026-09-18 (the single published
// line; s_open is the C1 witness supply_close + burns - mints, confirmed against the published s_open). The
// line_hash EXCLUDES provenance (timeline.ts hashedFields) and the instant derives from the day (flow.ts:59),
// so any PROV reproduces the anchor. This pins the engine against the pre-registration commit.
test("sentinel_edetector_golden_j0_anchor", () => {
  const j0: WindowFacts = {
    day: "2026-09-17",
    fromBlock: 25993482,
    toBlock: 26000650,
    burns: 7248378739600000000000000n,
    mints: 17695946655200000000000000n,
    supplyClose: 4740020686554655133523503861n,
    supplyOpen: 4740020686554655133523503861n + 7248378739600000000000000n - 17695946655200000000000000n,
  };
  assert.equal(j0.supplyOpen, 4729573118639055133523503861n, "s_open = C1 witness (matches the published line)");
  const out = stepOne(initState(), j0);
  assert.equal(out.line.pair_status, "non_evaluable", "J0 is the genesis line (no predecessor)");
  assert.equal(out.line.T, 0, "T = 0 at the anchor");
  assert.equal(out.line.prev_line_hash, "GENESIS");
  assert.equal(out.line.line_hash, EDET_ANCHOR_LINE_HASH, "reproduces the published anchor line_hash");
  assert.equal(EDET_ANCHOR_LINE_HASH, "09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82");
  assert.equal(EDET_PREREGISTRATION_COMMIT, "9d67302", "the M014-a pre-registration commit");
});

// ── M014-10: the PUBLISHED section inst.edetector — every scalar pinned, recomputed (C-iii, G2 checkpoint-2) ─
// Tests 3/9 work at the function level; this pins the JSON surface buildInstrument emits. Every value is
// RECOMPUTED here via runEDetector/gridFor (never pasted), so a wiring slip in buildEDetector reddens.
test("sentinel_edetector_published_section", () => {
  const { state, calmPairDays } = foldSeriesWithDays(series.windows);
  const inst = buildInstrument(state, { perms: 1000, seed: 20260917, calmPairDays });
  const e = inst.edetector;
  // Constants === EDET (single source of truth), never pasted into the section.
  assert.equal(e.p0, EDET.p0, "section p0 = EDET.p0");
  assert.equal(e.q_l, EDET.qL, "section q_l = EDET.qL");
  assert.equal(e.q_u, EDET.qU, "section q_u = EDET.qU");
  assert.equal(e.alpha_arl, EDET.alphaArl, "section alpha_arl = EDET.alphaArl");
  assert.equal(e.k, EDET.K, "section k = EDET.K");
  assert.equal(e.start_after_day, EDET.startAfterDay, "section start_after_day = EDET.startAfterDay");
  assert.equal(e.threshold_log, Math.log(1 / EDET.alphaArl), "threshold_log = log(1/alpha_arl)");
  // Pre-registration anchor (full literals).
  assert.equal(e.preregistered_at, "2026-09-18");
  assert.equal(e.preregistration_commit, "9d67302");
  assert.equal(e.anchor_line_hash, "09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82");
  // design_check (p0 = 0.30): recomputed via runEDetector, matched to the section field-for-field.
  const run = runEDetector(state.calmMiss, EDET.p0, gridFor(EDET.p0));
  assert.equal(e.design_check.p0, EDET.p0, "design_check.p0 = 0.30 (not the disqualified 0.125)");
  assert.equal(e.design_check.n, run.n, "design_check.n = recomputed n");
  assert.equal(e.design_check.max_logM_sr, run.max_logM_sr, "design_check.max_logM_sr = recomputed");
  assert.equal(e.design_check.max_logM_cu, run.max_logM_cu, "design_check.max_logM_cu = recomputed");
  assert.equal(e.design_check.crossed, run.crossed_sr, "design_check.crossed = the SR crossing (crossed_sr)");
  assert.equal(e.design_check.crossed, null, "no crossing at p0 = 0.30");
  // disqualified_class (p0 = 0.125): recomputed; the day is calmPairDays at the crossing index.
  const run125 = runEDetector(state.calmMiss, DISQUALIFIED_P0, gridFor(DISQUALIFIED_P0));
  assert.equal(e.disqualified_class.p0, DISQUALIFIED_P0, "disqualified_class.p0 = 0.125");
  assert.equal(e.disqualified_class.first_crossing_index, run125.crossed_sr, "first_crossing_index = recomputed crossing");
  const idx = run125.crossed_sr;
  assert.ok(idx !== null, "0.125 crosses in-sample");
  assert.equal(e.disqualified_class.first_crossing_day, calmPairDays[idx], "first_crossing_day = calmPairDays[index]");
});
