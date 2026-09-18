// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// Oracle for the Narabi sentinel (PLAN-m012 §3). All offline: RPC and the block->timestamp reader are
// injected stubs, fixtures are the sha-pinned committed series + a one-off boundary-timestamp fixture
// (blocks <= 2025-10-15, ADR-M012 D6). Fixtures are typed at the JSON boundary so the test-debt ratchet
// (lint-ratchet.json, 69) sees no `any`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { splitQuantile, trackerReplay, trackerDigest, trackerStepSize } from "@monark/hikae";
import { USDE_STABLE_RUN_CALIB } from "@monark/harness/calibration";
import { daysUTC, firstBlockAtOrAfter, windowBounds, midnightOf } from "../src/windows.ts";
import { makeRpcPool, QuorumDisagreementError, TRANSFER_TOPIC } from "../src/rpc.ts";
import type { RpcCall, RpcPool } from "../src/rpc.ts";
import { attest } from "../src/flow.ts";
import type { WindowFacts } from "../src/flow.ts";
import { initState, step, stateSummary, committedQ1, boundThm1, projectedBoundT, lineHashOf, TRACKER_PARAMS } from "../src/timeline.ts";
import type { SentinelState, TimelineLine } from "../src/timeline.ts";
import { dueDays, runDue, resolveStartDay, j0SourceOf } from "../src/run.ts";
import { buildInstrument, pageCusumMax, foldSeries } from "../src/instrument.ts";

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
  const inst = buildInstrument(state, { perms: 1000, seed: 20260917 });

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
