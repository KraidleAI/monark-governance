// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// The daily idempotent runner (ADR-M012 D1/D5): reads `finalized` head, processes every COMPLETE UTC day
// from the resume point to the latest finalized-complete day, IN ORDER — a day whose close midnight is not
// yet finalized is LAG, never a skipped step (test `sentinel_gap_is_lag_not_skip`). A C1 or quorum failure
// stops the run fail-closed (the window is not written) and is reported as lag. `--dry-run` writes nothing;
// `--day D` runs a single day diagnostically; the state dir is env `MONARK_SENTINEL_DIR` / `--state <dir>`
// (default /var/lib/monark-sentinel), with public copies under `public/` for Caddy to serve at /narabi/.
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { makeRpcPool, PUBLIC_ENDPOINTS, QuorumDisagreementError } from "./rpc.ts";
import type { RpcPool, RpcCall } from "./rpc.ts";
import { keylessCall, KEYLESS_TIMEOUT_MS } from "./keyless-transport.ts";
import { openGuardedClient, runCli, BudgetExceededError } from "@monark/rpc-guard";
import type { RunLimits, BudgetedClient, OperatorLabel } from "@monark/rpc-guard";
import { windowBounds, midnightOf } from "./windows.ts";
import { attest } from "./flow.ts";
import type { WindowFacts } from "./flow.ts";
import { initState, step, stateSummary } from "./timeline.ts";
import type { SentinelState, TimelineLine } from "./timeline.ts";

const DEPLOY_BLOCK = 18_571_358;                 // USDe deploy — a safe lower bound for the block search
const DEFAULT_DIR = "/var/lib/monark-sentinel";
const nextDay = (day: string): string => new Date(new Date(day + "T00:00:00Z").getTime() + 86_400_000).toISOString().slice(0, 10);

// Per-run TIME budget for the bounded catch-up (ADR-NARABI-OPS-1c). Checked BETWEEN due days so a multi-day
// backlog is far less likely — a REDUCED residual on a HEALTHY pool, not a full fix (RUNBOOK section 6: "Mode A
// REDUCED, not lifted"; C-G2-3) — to be killed at the same point every slot: the first due day is always
// attempted, later days stop once the budget is spent, the produced lines are written, and the next timer slot
// resumes at prevDay+1. The margin below the unit TimeoutStartSec (deploy/monark-sentinel.service) is pinned by
// the test sentinel_budget_below_unit_timeout: BUDGET_MAX_S + MARGIN_MIN_S <= TimeoutStartSec.
export const BUDGET_DEFAULT_S = 180;
export const BUDGET_MAX_S = 180;
export const BUDGET_MIN_S = 30;
export const MARGIN_MIN_S = 120;

/**
 * The catch-up budget in milliseconds from MONARK_SENTINEL_BUDGET_S. Absent => the 180 s default (the
 * production unit does not set the key). Present => a plain integer in [BUDGET_MIN_S, BUDGET_MAX_S] with NO
 * leading zero (C-G2-1: "0180" is REFUSED — a leading zero is a mis-set, not a padded 180), else THROW at
 * start-up (fail-closed): a mis-set budget must stop the run loudly, never silently starve the daily
 * publication. No clock env is read here or anywhere (sentinel_no_clock_env_is_read).
 */
export function budgetMsFromEnv(env: NodeJS.ProcessEnv): number {
  const raw = env.MONARK_SENTINEL_BUDGET_S;
  if (raw === undefined) return BUDGET_DEFAULT_S * 1000;
  if (!/^[1-9]\d*$/.test(raw)) throw new Error(`MONARK_SENTINEL_BUDGET_S must be an integer ${String(BUDGET_MIN_S)}..${String(BUDGET_MAX_S)} seconds with no leading zero (got ${JSON.stringify(raw)}).`);
  const s = Number(raw);
  if (s < BUDGET_MIN_S || s > BUDGET_MAX_S) throw new Error(`MONARK_SENTINEL_BUDGET_S out of range ${String(BUDGET_MIN_S)}..${String(BUDGET_MAX_S)} (got ${String(s)}).`);
  return s * 1000;
}

interface Provenance { readonly endpoints: readonly string[]; readonly node_version: string; readonly sentinel_sha: string; }

/**
 * Contiguous COMPLETE finalized days from the resume point, in order (never skipping). A day D is complete
 * iff its close midnight (D+1) is at/before `finalizedTs`. `untilDay` caps the range (the `--day` case).
 */
export function dueDays(afterDay: string | null, finalizedTs: number, startDay: string, untilDay: string | null): string[] {
  const out: string[] = [];
  let d = afterDay === null ? startDay : nextDay(afterDay);
  for (;;) {
    if (untilDay !== null && d > untilDay) break;
    if (midnightOf(d) + 86_400 > finalizedTs) break; // D+1 midnight not finalized => LAG, stop
    out.push(d);
    d = nextDay(d);
  }
  return out;
}

/** Read the window's facts from the pool (window slice + quorum flow + quorum supplies). */
export async function fetchWindow(rpc: RpcPool, day: string, lo: number, hi: number): Promise<WindowFacts> {
  const { fromBlock, toBlock } = await windowBounds(day, lo, hi, (b) => rpc.blockTs(b));
  const { burns, mints } = await rpc.windowFlow(fromBlock, toBlock);
  const supplyClose = await rpc.supplyAt(toBlock);
  const supplyOpen = await rpc.supplyAt(fromBlock - 1);
  return { day, fromBlock, toBlock, burns, mints, supplyClose, supplyOpen };
}

/** WindowFacts reconstructed from a published line (for idempotent resume — s_open is the C1-verified open). */
function factsFromLine(l: TimelineLine): WindowFacts {
  return { day: l.day, fromBlock: l.from_block, toBlock: l.to_block, burns: BigInt(l.burns), mints: BigInt(l.mints), supplyClose: BigInt(l.supply_close), supplyOpen: BigInt(l.s_open) };
}

export interface RunReport {
  processedDays: string[];
  lag: number;
  stopped: string | null;
  lines: TimelineLine[];
  state: SentinelState;
  elapsedMs: number;
  maxDayMs: number;
}

/** Injected clock + budget for the bounded catch-up (ADR-NARABI-OPS-1c). `now` returns milliseconds. */
export interface CatchupBudget {
  now: () => number;
  budgetMs: number;
}

/**
 * Process the due days against `rpc`, folding the engine forward from `state0`. Pure of filesystem: the CLI
 * `main` handles persistence. A C1/quorum failure stops the run (fail-closed) and leaves the rest as lag.
 *
 * When `opts` is given (ADR-NARABI-OPS-1c), a per-run TIME budget is checked BETWEEN due days: the FIRST due
 * day is ALWAYS attempted; before any LATER day, if `now() - t0` STRICTLY exceeds `budgetMs`, the run stops
 * with `stopped = "catchup_budget"` and the lines produced so far are returned (the caller writes them; the
 * next timer slot resumes at prevDay+1, so a multi-day backlog progresses instead of being killed at the same
 * point every slot — a REDUCED residual on a HEALTHY pool, NOT a full fix: a persistently slow/degraded pool can
 * still lag, RUNBOOK section 6 "Mode A REDUCED, not lifted"; C-G2-3). The clock is INJECTED, so there is no
 * `Date.now`/`performance.now` in this function;
 * `elapsedMs`/`maxDayMs` are measured off the same clock, the latter over each ATTEMPTED day (including one
 * that stops on a fault), so a slow day shows up in the end JSON (the ADR pre-registered criterion of NO).
 */
export async function runDue(state0: SentinelState, rpc: RpcPool, dueList: string[], hi: number, prov: Provenance, opts?: CatchupBudget): Promise<RunReport> {
  let state = state0;
  const lines: TimelineLine[] = [];
  let lo = DEPLOY_BLOCK; // safe lower bound; tightened to the previous window's to_block+1 as we advance
  let stopped: string | null = null;
  const processedDays: string[] = [];
  const t0 = opts !== undefined ? opts.now() : 0;
  let maxDayMs = 0;
  let first = true;
  for (const day of dueList) {
    if (opts !== undefined && !first && opts.now() - t0 > opts.budgetMs) { stopped = "catchup_budget"; break; }
    first = false;
    const dayStart = opts !== undefined ? opts.now() : 0;
    try {
      let facts: WindowFacts;
      try {
        facts = await fetchWindow(rpc, day, lo, hi);
      } catch (e) {
        stopped = e instanceof QuorumDisagreementError ? `quorum_disagreement:${day}` : `fetch_error:${day}:${(e as Error).message}`;
        break;
      }
      // ADR-M012 D1, literal: process a window only if to_block <= finalized (belt for the ts-based gate).
      if (facts.toBlock > hi) { stopped = `unfinalized_to_block:${day}`; break; }
      const r = attest(facts);
      if (r.status === "c1_fail") { stopped = `c1_fail:${day}`; break; }
      const out = step(state, facts, r, prov);
      state = out.state;
      lines.push(out.line);
      processedDays.push(day);
      lo = facts.toBlock + 1;
    } finally {
      if (opts !== undefined) { const dt = opts.now() - dayStart; if (dt > maxDayMs) maxDayMs = dt; }
    }
  }
  const elapsedMs = opts !== undefined ? opts.now() - t0 : 0;
  return { processedDays, lag: dueList.length - processedDays.length, stopped, lines, state, elapsedMs, maxDayMs };
}

/** sha256 over the sorted bytes of the sentinel sources (no .git on the VPS; a stable build witness). */
function sentinelSha(srcDir: string): string {
  const files = readdirSync(srcDir).filter((f) => f.endsWith(".ts")).sort();
  const h = createHash("sha256");
  for (const f of files) h.update(readFileSync(join(srcDir, f)));
  return h.digest("hex");
}

function loadState(dir: string, prov: Provenance): { state: SentinelState; lineCount: number } {
  const tl = join(dir, "timeline.jsonl");
  let state = initState();
  let lineCount = 0;
  if (existsSync(tl)) {
    for (const raw of readFileSync(tl, "utf8").split("\n")) {
      if (!raw.trim()) continue;
      const l = JSON.parse(raw) as TimelineLine;
      const facts = factsFromLine(l);
      const r = attest(facts);
      if (r.status === "c1_fail") throw new Error(`loadState: stored line ${l.day} fails C1 — timeline corrupt`);
      state = step(state, facts, r, prov).state;
      lineCount++;
    }
  }
  return { state, lineCount };
}

function parseArgs(argv: readonly string[]): { dryRun: boolean; day: string | null; dir: string } {
  let dryRun = false, day: string | null = null, dir = process.env.MONARK_SENTINEL_DIR ?? DEFAULT_DIR;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--day") { day = argv[i + 1] ?? null; i++; }
    else if (a === "--state") { dir = argv[i + 1] ?? dir; i++; }
  }
  return { dryRun, day, dir };
}

/**
 * The start day for a FRESH state (fail-closed, ADR-M012 D5): the first run needs MONARK_SENTINEL_J0 (or an
 * explicit `--day`). Without it the job would chase "today" — whose window is never finalized yet — and
 * publish an empty due list FOREVER, a silent no-op. On a non-empty state J0 is unused (dueDays resumes from
 * prevDay+1). Per the D5 ruling, J0 = the first PUBLISHED window (non_evaluable); the first tracker step is J0+1.
 */
export function resolveStartDay(j0: string | undefined, day: string | null, prevDay: string | null, today: string): string {
  if (j0 === undefined && prevDay === null && day === null) {
    throw new Error("MONARK_SENTINEL_J0 must be set before the first run (ADR-M012 D5).");
  }
  return j0 ?? day ?? today;
}

/**
 * Where the run's start day came from, for the summary (O-a). A non-empty state RESUMES (dueDays marches
 * from prevDay+1, so env/`--day` J0 is unused) => "state"; a fresh state uses `MONARK_SENTINEL_J0` => "env"
 * or an explicit `--day` => "day". Mirrors exactly what `dueDays` consumes; a fresh state with neither has
 * already thrown in `resolveStartDay`.
 */
export function j0SourceOf(j0: string | undefined, day: string | null, prevDay: string | null): "env" | "day" | "state" {
  if (prevDay !== null) return "state";
  return j0 !== undefined ? "env" : "day";
}

// ── NARABI-OPS-1d: the guarded Chainstack leg (route alpha; migration of the residual-118 paid leg) ──────────
/** The pool sentinel + guard operator LABEL for the single paid leg. `providerOf("chainstack")` collapses to the
 *  bare label (not a URL parse), a DISTINCT provider from every public endpoint, so the quorum still needs two
 *  providers (rpc.ts item m). The dispatcher routes THIS label to the guarded client; a public URL to keylessCall. */
export const CHAINSTACK_LABEL = "chainstack";

/** Run caps for the paid leg (decision 121 option 1: floor/caps are NON-secret, posed here as pinned constants).
 *  MEASURED (G1, test sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock): ONE degraded-pool
 *  day with chainstack forced into every quorum attempts 19 eth_getBlockByNumber + 1 eth_getLogs + 2 eth_call = 22
 *  (44 RU); a 7-day budgeted catch-up worst case ~= 154 attempts / ~308 RU. The G0 M-7 borne haute (~322 attempts /
 *  ~644 RU, all-on-chainstack) is the stress bound. These caps sit well above BOTH and FAR below the 16 M RU cycle
 *  cap (the real per-account protection, held by the dashboard floor + overage disabled, decision 121). A cap
 *  touched mid-run makes the guard REFUSE (BudgetExceededError) => makeRpcPool benches the leg => the day finishes
 *  on the keyless quorum (D-caps, test chainstack_refusal_degrades_to_keyless_quorum_not_stopped_day). */
export const CHAINSTACK_MAX_CALLS = 2_000;
export const CHAINSTACK_RUN_CAP_RU = 20_000;
export const CHAINSTACK_METHOD_CAPS: Readonly<Record<string, number>> = { eth_getBlockByNumber: 2_000, eth_getLogs: 2_000, eth_call: 2_000 };

/** The closed set surfaced as `chainstack_guard` in the end JSON (D-degrade): a degraded/keyless run is
 *  diagnosable without ever printing a URL. `ok` = the leg opened and is in the pool. */
export type ChainstackGuardStatus = "ok" | "unconfigured" | "lock_held" | "ledger_error" | "config_error";

/** Map an openGuardedClient throw to the closed set (never a message). assertLimits raises BudgetExceededError
 *  (bad caps/floor) => config_error; the paid key absent => unconfigured; a held cycle lock => lock_held; a
 *  missing/corrupt ledger (C-8/C-V-8) => ledger_error; anything else => config_error (fail-safe, still degrades). */
export function classifyGuardOpenError(e: unknown): ChainstackGuardStatus {
  if (e instanceof BudgetExceededError) return "config_error";
  const msg = e instanceof Error ? e.message : String(e);
  if (/not resolved from env/.test(msg)) return "unconfigured";
  if (/already locked/.test(msg)) return "lock_held";
  if (/does not pre-exist|head sidecar|cycle ledger|tail truncation/.test(msg)) return "ledger_error";
  return "config_error";
}

/** The cycle floor in RU (non-secret, decision 121: the floor is the dashboard total = the sum over networks, set
 *  at the monthly rollover). Absent => 0 (Narabi's own spend is tiny — M-7; the account cap is held by the Ukemi
 *  dashboard reads + overage disabled). A malformed value throws INSIDE openChainstackLeg's try, so it degrades. */
function chainstackFloorFromEnv(env: NodeJS.ProcessEnv): number {
  const raw = env.CHAINSTACK_CYCLE_FLOOR;
  if (raw === undefined) return 0;
  if (!/^\d+$/.test(raw)) throw new Error(`CHAINSTACK_CYCLE_FLOOR must be a non-negative integer of RU (got ${JSON.stringify(raw)}).`);
  return Number(raw);
}

/** The pool's injected `call` (route alpha): the paid label is metered + ledgered (write-ahead line BEFORE the
 *  transport) through the guarded client, ONE attempt, retry owned by the pool (C-4); every public URL takes the
 *  keyless fetch. A guarded REFUSAL or transport fault THROWS => makeRpcPool benches the leg like any endpoint. */
export function makeDispatchCall(client: BudgetedClient | undefined): RpcCall {
  return (url, method, params) => {
    if (url === CHAINSTACK_LABEL) {
      if (client === undefined) return Promise.reject(new Error("rpc-guard: chainstack leg not open (fail-closed)"));
      return client.call(CHAINSTACK_LABEL as OperatorLabel, method, params);
    }
    return keylessCall(url, method, params);
  };
}

/** The open + release of the guarded Chainstack leg for one run. D-degrade (BLOCKING invariant): this NEVER
 *  throws — a failure yields status != "ok" + no client, so main() falls back to the 7 keyless endpoints and the
 *  publication is never FATALed (ADR-NARABI-OPS-1 D3). The leg is requested by LABEL; the endpoint key is read by
 *  @monark/rpc-guard's transport, never here. `release` is the D-lock (i) unlock (finally + SIGTERM), idempotent,
 *  best-effort (a failed unlock leaves the lock => next run reads lock_held => keyless, never a FATAL). */
interface ChainstackLeg { readonly status: ChainstackGuardStatus; readonly client?: BudgetedClient; readonly origin?: string; release(): void; }
export function openChainstackLeg(stateDir: string): ChainstackLeg {
  const cycleId = process.env.CHAINSTACK_CYCLE_ID;
  const origin = process.env.CHAINSTACK_ETH_ORIGIN;
  // Both the cycle id AND the published origin (a non-secret scheme+host, never the key-bearing URL) are required
  // to SERVE the leg: the origin is what the Bell probe reads to decide chainstack_present, so publishing the leg
  // without it would be a provenance gap. Either absent => unconfigured (served output identical to a no-key run).
  if (cycleId === undefined || cycleId.length === 0 || origin === undefined || origin.length === 0) return { status: "unconfigured", release: () => {} };
  const ledgerDir = join(stateDir, "ledger"); // parent MUST pre-exist (C-8, RUNBOOK install -d); never auto-created
  let client: BudgetedClient;
  let floor = 0;
  try {
    floor = chainstackFloorFromEnv(process.env);
    const limits: RunLimits = { maxCalls: CHAINSTACK_MAX_CALLS, runCaps: { chainstack: CHAINSTACK_RUN_CAP_RU }, methodCaps: CHAINSTACK_METHOD_CAPS, cycleFloor: { chainstack: floor } };
    // network "ethereum-mainnet" (decision 121: the network is a ledger ATTRIBUTE, one operator per account);
    // timeoutMs = the keyless 20 s (M-10) so no endpoint changes its deadline; process.env is PASSED (never read
    // by an X access here) so the transport resolves the key internally (fetch_only_inside_client stays green).
    client = openGuardedClient(process.env, limits, ledgerDir, { chainstack: cycleId }, { timeoutMs: KEYLESS_TIMEOUT_MS, network: "ethereum-mainnet" });
  } catch (e) {
    return { status: classifyGuardOpenError(e), release: () => {} };
  }
  let released = false;
  const release = (): void => {
    if (released) return;
    released = true;
    // The ONLY public release path (runUnlock/releaseLock are internal): the served `unlock` subcommand appends a
    // chained `unlocked` line and unlinks the lock so the next slot re-acquires. readSnapshot is unused by unlock.
    try { runCli(["unlock", "--cycle", cycleId, "--op", CHAINSTACK_LABEL, "--reason", "sentinel-daily-end"], { ledgerDir, floor, readSnapshot: () => { throw new Error("rpc-guard: unlock needs no snapshot"); } }); } catch { /* best-effort release */ }
  };
  return { status: "ok", client, origin, release };
}

async function main(): Promise<void> {
  const { dryRun, day, dir } = parseArgs(process.argv.slice(2));
  const budgetMs = budgetMsFromEnv(process.env); // fail-closed at start-up: a mis-set budget throws before any network.
  const srcDir = dirname(fileURLToPath(import.meta.url));
  // NARABI-OPS-1d: open the ONE paid leg (Chainstack) through @monark/rpc-guard (ledgered + capped); the 7
  // public endpoints stay keyless. D-degrade: openChainstackLeg NEVER throws — a failure yields status != "ok"
  // and a keyless-only pool (ADR-NARABI-OPS-1 D3). D-lock (i): the cycle lock is released in `finally` AND on
  // SIGTERM (a TimeoutStartSec kill); on win32 process.kill is a hard kill with no handler, so the SIGTERM path
  // is Linux-only (the RUNBOOK unlock covers a SIGKILL, C-7).
  const leg = openChainstackLeg(dir);
  const onSigterm = (): void => { leg.release(); process.exit(1); };
  if (leg.status === "ok") process.on("SIGTERM", onSigterm);
  try {
    const hasChain = leg.status === "ok";
    const endpoints = hasChain ? [...PUBLIC_ENDPOINTS, CHAINSTACK_LABEL] : [...PUBLIC_ENDPOINTS];
    // C-6 (provenance): the Chainstack ORIGIN (non-secret scheme+host) is published ONLY when the guarded leg
    // actually opened; a degraded run publishes the 7 public endpoints and no origin (chainstack_present:false).
    const published = hasChain ? [...PUBLIC_ENDPOINTS, leg.origin!] : [...PUBLIC_ENDPOINTS];
    const prov: Provenance = { endpoints: published, node_version: process.version, sentinel_sha: sentinelSha(srcDir) };
    const rpc = makeRpcPool({ endpoints, call: makeDispatchCall(leg.client) });
    const { state } = loadState(dir, prov);
    const startDay = resolveStartDay(process.env.MONARK_SENTINEL_J0, day, state.prevDay, new Date().toISOString().slice(0, 10));
    // Never-skip under the CLI: a non-dry `--day` must be the natural next day (else a silent backlog write).
    if (day !== null && !dryRun && state.prevDay !== null && nextDay(state.prevDay) !== day) throw new Error(`--day ${day} without --dry-run must be the next day (${nextDay(state.prevDay)}); plain run catches up, --dry-run inspects.`);
    const fin = await rpc.finalized();
    const due = dueDays(state.prevDay, fin.ts, startDay, day);
    const report = await runDue(state, rpc, due, fin.block, prov, { now: () => performance.now(), budgetMs });
    const summary = stateSummary(report.state);
    // L-1 (ADR-NARABI-OPS-1): exit NON-ZERO exactly when a stop PREVENTED catch-up — `report.stopped !== null`
    // (a fetch / quorum / c1 / unfinalized failure), so a oneshot exit-0 no longer masks a stalled day (the
    // 2026-09-20 incident). `stopped === null` means up to date OR waiting for finality (`due` empty or fully
    // processed) => exit 0. `runDue` sets `stopped` only with `lag >= 1`, so the plan's `lag > 0` is implied;
    // the timer's next slot retries (the unit is a oneshot — systemd `Restart=` is deliberately not used).
    const exitCode = report.stopped !== null ? 1 : 0;
    // O-a: report the effective start day and where J0 came from. On a non-empty state the run RESUMES
    // (prevDay+1), so the printed start is that, never the unused `j0 ?? today`. `chainstack` is now derived from
    // the guarded leg (the paid leg is IN the pool), NOT an env key read (C-4); `chainstack_guard` (closed set,
    // D-degrade) makes a silent key-less/degraded run diagnosable in the end JSON.
    const j0Source = j0SourceOf(process.env.MONARK_SENTINEL_J0, day, state.prevDay);
    const effectiveStartDay = state.prevDay !== null ? nextDay(state.prevDay) : startDay;
    console.log(JSON.stringify({ startDay: effectiveStartDay, j0Source, processedDays: report.processedDays, lag: report.lag, stopped: report.stopped, finalized: fin.block, T: report.state.tracker.t, chainstack: hasChain, chainstack_guard: leg.status, exit_code: exitCode, dryRun, elapsed_ms: Math.round(report.elapsedMs), max_day_ms: Math.round(report.maxDayMs) }, null, 2));
    if (dryRun) { console.log("--dry-run: nothing written."); process.exitCode = exitCode; return; }
    if (report.lines.length > 0) {
      mkdirSync(dir, { recursive: true });
      const pub = join(dir, "public");
      mkdirSync(pub, { recursive: true });
      const tl = join(dir, "timeline.jsonl");
      // Lines processed BEFORE a stop ARE written (partial catch-up); the non-zero exit is set AFTER (C-6 case b).
      appendFileSync(tl, report.lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
      writeFileSync(join(dir, "state.json"), JSON.stringify(summary, null, 2) + "\n");
      copyFileSync(tl, join(pub, "timeline.jsonl"));
      copyFileSync(join(dir, "state.json"), join(pub, "state.json"));
      console.log(`wrote ${String(report.lines.length)} line(s); T=${String(report.state.tracker.t)}.`);
    } else {
      console.log(report.stopped !== null ? `nothing written: run stopped (${report.stopped}).` : "nothing due (up to date, or waiting for finality).");
    }
    process.exitCode = exitCode;
  } finally {
    leg.release();
    if (leg.status === "ok") process.removeListener("SIGTERM", onSigterm);
  }
}

// Run-guard (mirrors the repo's scripts): the CLI runs only when invoked directly, never on import (tests).
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((e: unknown) => { console.error("sentinel FATAL", e); process.exitCode = 1; });
}
