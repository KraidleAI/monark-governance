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
import type { RpcPool } from "./rpc.ts";
import { windowBounds, midnightOf } from "./windows.ts";
import { attest } from "./flow.ts";
import type { WindowFacts } from "./flow.ts";
import { initState, step, stateSummary } from "./timeline.ts";
import type { SentinelState, TimelineLine } from "./timeline.ts";

const DEPLOY_BLOCK = 18_571_358;                 // USDe deploy — a safe lower bound for the block search
const DEFAULT_DIR = "/var/lib/monark-sentinel";
const nextDay = (day: string): string => new Date(new Date(day + "T00:00:00Z").getTime() + 86_400_000).toISOString().slice(0, 10);

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
}

/**
 * Process the due days against `rpc`, folding the engine forward from `state0`. Pure of filesystem: the CLI
 * `main` handles persistence. A C1/quorum failure stops the run (fail-closed) and leaves the rest as lag.
 */
export async function runDue(state0: SentinelState, rpc: RpcPool, dueList: string[], hi: number, prov: Provenance): Promise<RunReport> {
  let state = state0;
  const lines: TimelineLine[] = [];
  let lo = DEPLOY_BLOCK; // safe lower bound; tightened to the previous window's to_block+1 as we advance
  let stopped: string | null = null;
  const processedDays: string[] = [];
  for (const day of dueList) {
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
  }
  return { processedDays, lag: dueList.length - processedDays.length, stopped, lines, state };
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

async function main(): Promise<void> {
  const { dryRun, day, dir } = parseArgs(process.argv.slice(2));
  const srcDir = dirname(fileURLToPath(import.meta.url));
  const prov: Provenance = { endpoints: PUBLIC_ENDPOINTS, node_version: process.version, sentinel_sha: sentinelSha(srcDir) };
  const rpc = makeRpcPool();
  const { state } = loadState(dir, prov);
  const startDay = resolveStartDay(process.env.MONARK_SENTINEL_J0, day, state.prevDay, new Date().toISOString().slice(0, 10));
  // Never-skip under the CLI: a non-dry `--day` must be the natural next day (else a silent backlog write).
  if (day !== null && !dryRun && state.prevDay !== null && nextDay(state.prevDay) !== day) throw new Error(`--day ${day} without --dry-run must be the next day (${nextDay(state.prevDay)}); plain run catches up, --dry-run inspects.`);
  const fin = await rpc.finalized();
  const due = dueDays(state.prevDay, fin.ts, startDay, day);
  const report = await runDue(state, rpc, due, fin.block, prov);
  const summary = stateSummary(report.state);
  // O-a: report the effective start day and where J0 came from. On a non-empty state the run RESUMES
  // (prevDay+1), so the printed start is that, never the unused `j0 ?? today`.
  const j0Source = j0SourceOf(process.env.MONARK_SENTINEL_J0, day, state.prevDay);
  const effectiveStartDay = state.prevDay !== null ? nextDay(state.prevDay) : startDay;
  console.log(JSON.stringify({ startDay: effectiveStartDay, j0Source, processedDays: report.processedDays, lag: report.lag, stopped: report.stopped, finalized: fin.block, T: report.state.tracker.t, dryRun }, null, 2));
  if (dryRun) { console.log("--dry-run: nothing written."); return; }
  if (report.lines.length === 0) { console.log("nothing due (up to date, or waiting for finality)."); return; }
  mkdirSync(dir, { recursive: true });
  const pub = join(dir, "public");
  mkdirSync(pub, { recursive: true });
  const tl = join(dir, "timeline.jsonl");
  appendFileSync(tl, report.lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  writeFileSync(join(dir, "state.json"), JSON.stringify(summary, null, 2) + "\n");
  copyFileSync(tl, join(pub, "timeline.jsonl"));
  copyFileSync(join(dir, "state.json"), join(pub, "state.json"));
  console.log(`wrote ${String(report.lines.length)} line(s); T=${String(report.state.tracker.t)}.`);
}

// Run-guard (mirrors the repo's scripts): the CLI runs only when invoked directly, never on import (tests).
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((e: unknown) => { console.error("sentinel FATAL", e); process.exitCode = 1; });
}
