// MONARK Bell, the collection tick. Called at any instant, it plans the trading-day unit due (planUnit), derives each operator's billing
// cycle from its anchor (cycleOf; a tick that may outlive a cycle is refused), reads the leg switch of state/legs.json (a leg switched off
// loses its keys in every stage, and a stage that needs it is refused leg_off), bounds the cash leg's cost by the free Databento cost query
// before any paid call (cash_cost_cap), reuses the rebase trajectory of state/trajectory/ while it is at most TRAJ_MAX_AGE_H old or has it
// produced again (runMain --rebase-produce under its own caps), checks it against the reference an act poses (sha256 pinned, events a prefix),
// then has runUnit produce one run per mint of the universe on the unit's window with that trajectory (by default the real runMain under
// the guard: --cycles, the declared shares, a zero floor; an injected seam in the tests). Each stage's credits, per operator, read from its
// cycle ledger before and after the stage, go to state/cost.jsonl.
// It checks each run (checkRun, with the same window and the same page cap the run used), pre-validates the bundle (validateBundle, the
// publisher's own rule), then deposits it atomically into the handoff directory (sibling manifest first, removed if the rename throws,
// then the rename, then state/progress.json), or moves it to quarantine/<D>/ with its reason. The guard's errors are rendered under their
// names of the closed list; a SIGTERM handler, set before any lock, releases the current run's locks, says whether the release held, and
// exits 1. At most one unit
// per tick; attempts are counted per unit start day D, whatever the slot or the cause; past the budget the unit exits stalled_unit until
// an act abandons it. The argv forms are closed:
//   --tick --state <dir> --handoff <dir> --status <dir> --ledger-dir <dir>
//   --seed <D> --state <dir>
//   --abandon <D> --reason <code> --state <dir> --handoff <dir>
// <state> is the private directory of the collection: state/progress.json, state/attempts.json, state/abandoned.jsonl, state/cost.jsonl,
// state/legs.json, state/trajectory/, quarantine/<D>/.
// Exit 0: deposited, nothing due, already deposited, seeded, abandoned; 1: a named refusal of TICK_REFUSALS; 64: usage, before any
// read, probe, clock or write. The environment is checked for presence and shape only; no printed line names a URL or a key (every
// detail passes KEY_SHAPES and the credential values of the environment). The clock probe (deps.clockSynced, unsynced by default:
// fail-closed) is read before the clock, which is read once per tick, and before any attempt, write or run.
import { appendFileSync, closeSync, existsSync, fsyncSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, rmSync, writeSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { BudgetExceededError, cycleOf, nextCycleBoundary } from "@monark/rpc-guard";
import { ATTEMPT_BUDGET, BELL_AUTHORITY, BELL_COLLECT_ENV_KEYS, BELL_FLOORS, BELL_METHOD_CAPS, BELL_OPERATORS, BELL_PRODUCE_CAPS, BELL_PRODUCE_METHOD_CAPS, BELL_RUN_CAPS,
  BELL_UNIVERSE, CASH_COST_CAP_USD, REF_TRAJ_SHA256, TICK_TIMEOUT_START_SEC, TRAJ_MAX_AGE_H, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
import { BOUNDS, BellPublishError, KEY_SHAPES } from "../scripts/bell-validate.mjs";
import { manifestOf, validateBundle } from "../scripts/bell-validate.mjs";
import { sha256Hex } from "../scripts/bell-chain.mjs";
import { ADV_SIP_ETH_RULING, checkRun, type CheckRefusal, type RunFiles } from "./checks.ts";
import { databentoCostPath, databentoGet, polygonGet, readCashKeys } from "./close.ts";
import { runMain } from "./collect.ts";
import { POOLS } from "./pools.ts";
import { dueInstant, planUnit } from "./plan.ts";
import { CALENDAR_RANGE, classifySession, isTradingDay, nextTradingDay, refCloseDateOf, SIP_ETH_STATUS } from "./sessions.ts";
import { checkTrajectory } from "./trajectory-check.ts";

/** The closed list of the tick's named refusals. check_failed, prevalidation_refused and publisher_refused carry a suffix (check_failed:C04). */
export const TICK_REFUSALS = Object.freeze(["usage", "state_missing", "seed_exists", "env_missing", "env_malformed", "calendar_exhausted", "cycle_unknown",
  "cycle_boundary_straddle", "budget_guard", "lock_held", "budget_stop", "share_exhausted", "trajectory_stale", "trajectory_mismatch", "close_ref_pending",
  "close_ref_missing", "stop_cash_cross_mismatch", "cash_cost_cap", "leg_off", "check_failed", "adv_regime_unruled", "prevalidation_refused",
  "publisher_refused", "stalled_unit", "abandon_refused", "handoff_backlog", "clock_unsynced", "sigterm"] as const);
export type TickRefusalCode = (typeof TICK_REFUSALS)[number];
export class TickRefusal extends Error {
  readonly code: TickRefusalCode;
  readonly label: string;
  readonly detail: string;
  constructor(code: TickRefusalCode, detail: string, suffix?: string) {
    super(`bell/tick: ${code}`);
    this.name = "TickRefusal"; this.code = code; this.label = suffix === undefined ? code : `${code}:${suffix}`; this.detail = detail;
  }
}
export interface UnitWindow { readonly from_utc_ms: number; readonly to_utc_ms: number }
export interface RunUnitRequest {
  readonly mint: string; readonly window: UnitWindow; readonly maxPages: number; readonly outDir: string; readonly ledgerDir: string;
  readonly env: Readonly<Record<string, string | undefined>>; // the keys of BELL_COLLECT_ENV_KEYS only
  readonly cycles: Readonly<Record<string, string>>; // the cycle of each operator at the tick's instant
  readonly nowMs: number; // the tick's one clock read
  readonly onLocks: (release: (reason: string) => void) => void; // A-4: re-armed at each run, read by the SIGTERM handler
  readonly trajectory: string; // the checked rebase trajectory of state/trajectory/, passed as --rebase-trajectory
}
/** What one run hands back: the lines of each operator's cycle ledger, read once the run has released it (C13 reads this run's segment). */
export interface RunUnitResult { readonly ledger: Readonly<Record<string, readonly unknown[]>> }
export type RunUnit = (req: RunUnitRequest) => Promise<RunUnitResult>;
/** The trajectory production: runMain --rebase-produce writes rebase-trajectory.json under outDir. */
export type ProduceRequest = Omit<RunUnitRequest, "mint" | "window" | "maxPages" | "trajectory">;
export type Produce = (req: ProduceRequest) => Promise<void>;
/** The cash leg's cost query: the cost in USD of a Databento request (path and query of metadata.get_cost), the key sent as the Basic user. */
export type CostGet = (pathAndQuery: string, apiKey: string) => Promise<number>;
export interface TickDeps {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly now: () => number;
  readonly runUnit?: RunUnit; // absent: runMainUnit, the real runMain under the guard
  readonly produce?: Produce; // absent: runMainProduce, the real runMain --rebase-produce under the guard
  readonly costGet?: CostGet; // absent: databentoCost, the free cost query through close.ts
  readonly refTrajSha256?: string; // absent: REF_TRAJ_SHA256; the command line never sets it, a test poses its own reference
  readonly clockSynced?: () => boolean;
  readonly out?: (line: string) => void;
  readonly err?: (line: string) => void;
}
/** The default clock probe: unsynced. The host probe is injected by the lot that activates the tick. */
export const UNSYNCED = (): boolean => false;

function refuse(code: TickRefusalCode, detail: string, suffix?: string): never { throw new TickRefusal(code, detail, suffix); }
const DATE = /^\d{4}-\d{2}-\d{2}$/, REASON = /^[a-z][a-z0-9_]{0,63}$/, CREDENTIAL = /_(?:KEY|URL|RPC)$/;
const parse = (text: string): unknown => { try { return JSON.parse(text) as unknown; } catch { return null; } };
/** Synced temporary file, then rename (the atomic write of the Dojo layout, copied here, not imported). */
export function writeAtomic(path: string, text: string): void {
  const tmp = `${path}.tmp`, fd = openSync(tmp, "w", 0o640);
  try { writeSync(fd, text); fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(tmp, path);
}

type Opts = { mode: "tick"; state: string; handoff: string; status: string; ledgerDir: string }
  | { mode: "seed"; d: string; state: string } | { mode: "abandon"; d: string; reason: string; state: string; handoff: string };
const FORMS = { "--tick": ["--state", "--handoff", "--status", "--ledger-dir"], "--seed": ["--state"], "--abandon": ["--reason", "--state", "--handoff"] } as const;
function parseArgv(argv: readonly string[]): Opts {
  const [mode, ...rest] = argv;
  if (mode !== "--tick" && mode !== "--seed" && mode !== "--abandon") return refuse("usage", "the first argument is --tick, --seed or --abandon");
  const form: readonly string[] = FORMS[mode], v: Record<string, string> = {}, d = mode === "--tick" ? "" : rest.shift() ?? "";
  for (let i = 0; i < rest.length; i += 2) {
    const k = rest[i] ?? "", x = rest[i + 1];
    if (!form.includes(k) || k in v || x === undefined || x === "" || x.startsWith("-")) return refuse("usage", `unexpected ${k.startsWith("-") ? k : "argument"} for ${mode}`);
    v[k] = x;
  }
  const at = (k: string): string => v[k] ?? refuse("usage", `${mode} takes ${form.join(" ")}`);
  if (mode === "--tick") return { mode: "tick", state: at("--state"), handoff: at("--handoff"), status: at("--status"), ledgerDir: at("--ledger-dir") };
  if (!DATE.test(d) || d < CALENDAR_RANGE.fromISO || d > CALENDAR_RANGE.toISO || !isTradingDay(d)) return refuse("usage", "D is a trading day of the committed calendar, YYYY-MM-DD");
  if (mode === "--seed") return { mode: "seed", d, state: at("--state") };
  const reason = at("--reason");
  if (!REASON.test(reason)) return refuse("usage", "the reason is a lowercase code");
  return { mode: "abandon", d, reason, state: at("--state"), handoff: at("--handoff") };
}

/** Presence and shape of each key of BELL_COLLECT_ENV_KEYS; the refusal names the key, never its value. */
const SHAPES: ReadonlyArray<readonly [RegExp, RegExp]> = [[/_ANCHOR_UTC$/, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/],
  [/_SHARE$/, /^[1-9]\d{0,14}$/], [/_(?:URL|RPC)$/, /^https:\/\/[!-~]+$/], [/_CSV$/, /^[^\0\r\n]+$/], [/./, /^[!-~]{8,}$/]];
function checkEnv(env: TickDeps["env"]): void {
  for (const k of BELL_COLLECT_ENV_KEYS) {
    const v = env[k];
    if (v === undefined) refuse("env_missing", k);
    const shape = SHAPES.find(([name]) => name.test(k))?.[1];
    if (shape === undefined || !shape.test(v) || (k.endsWith("_ANCHOR_UTC") && !Number.isFinite(Date.parse(v)))) refuse("env_malformed", k);
  }
}

const keyOf = (op: string, k: "ANCHOR_UTC" | "SHARE"): string => `${op.toUpperCase()}_CYCLE_${k}`;
const kv = (o: Readonly<Record<string, string | number>>): string => Object.entries(o).map(([k, v]) => `${k}=${String(v)}`).join(",");
/** The cycle of each operator at nowMs, derived from its anchor (DC-5). No cycle at that instant (an anchor after it): cycle_unknown. A tick
 *  that may still run when an operator's next cycle starts (nowMs plus the bound of a run, TimeoutStartSec): cycle_boundary_straddle. */
export function cyclesOf(env: TickDeps["env"], nowMs: number, operators: readonly string[] = BELL_OPERATORS): Record<string, string> {
  const out: Record<string, string> = {};
  for (const op of operators) {
    const anchor = env[keyOf(op, "ANCHOR_UTC")] ?? "";
    try { out[op] = cycleOf(nowMs, anchor, op); } catch (e) { return refuse("cycle_unknown", `${op}: ${e instanceof RangeError ? e.message : "no cycle"}`); }
    const next = nextCycleBoundary(nowMs, anchor);
    if (nowMs + TICK_TIMEOUT_START_SEC * 1000 >= next) refuse("cycle_boundary_straddle", `${op}: the tick may outlive its cycle, the next starts ${new Date(next).toISOString()}`);
  }
  return out;
}
const pick = <T,>(o: Readonly<Record<string, T>>, operators: readonly string[]): Record<string, T> => Object.fromEntries(operators.map((op) => [op, o[op] as T]));
/** The share of each requested operator, from its <OP>_CYCLE_SHARE (the 2e ruling: from the operators the run requests only). */
const sharesOf = (env: TickDeps["env"], operators: readonly string[]): Record<string, number> =>
  Object.fromEntries(operators.map((op) => [op, Number(env[keyOf(op, "SHARE")])]));
/** runMain's argv for one run of the unit: its mint and window, the run and method caps, the operators, each one's cycle (--cycles), its
 *  declared share (--shares) and the zero floor of Bell's host (A-6), the ledger root, and --out under .tmp-unit-<D>/<mint>/. */
export function unitArgv(req: RunUnitRequest, operators: readonly string[] = BELL_OPERATORS): string[] {
  return ["--pools", req.mint, "--from-utc", String(req.window.from_utc_ms), "--to-utc", String(req.window.to_utc_ms), "--max-pages", String(req.maxPages),
    "--max-calls", String(BELL_RUN_CAPS.maxCalls), "--max-credits", String(BELL_RUN_CAPS.maxCredits), "--max-ru", String(BELL_RUN_CAPS.maxRu),
    "--method-caps", kv(BELL_METHOD_CAPS), "--operators", operators.join(","), "--ledger-dir", req.ledgerDir, "--cycles", kv(pick(req.cycles, operators)),
    "--shares", kv(sharesOf(req.env, operators)), "--floor", kv(pick(BELL_FLOORS, operators)),
    "--rebase-trajectory", req.trajectory, "--out", req.outDir];
}
/** runMain's argv for the trajectory production: --rebase-produce on the shared authority for the universe's mints, under its own run and
 *  method caps, with the cycles, the shares and the zero floor of a unit run. */
export function produceArgv(req: ProduceRequest, operators: readonly string[] = BELL_OPERATORS): string[] {
  return ["--rebase-produce", "--authority", BELL_AUTHORITY, "--pools", BELL_UNIVERSE.join(","), "--max-pages", String(BELL_PRODUCE_CAPS.maxPages),
    "--max-calls", String(BELL_PRODUCE_CAPS.maxCalls), "--max-credits", String(BELL_PRODUCE_CAPS.maxCredits), "--max-ru", String(BELL_PRODUCE_CAPS.maxRu),
    "--method-caps", kv(BELL_PRODUCE_METHOD_CAPS), "--operators", operators.join(","), "--ledger-dir", req.ledgerDir, "--cycles", kv(pick(req.cycles, operators)),
    "--shares", kv(sharesOf(req.env, operators)), "--floor", kv(pick(BELL_FLOORS, operators)), "--out", req.outDir];
}
/** The production run: the real runMain under the guard, then each operator's cycle ledger, read once the run has released it. */
export const runMainUnit: RunUnit = async (req) => {
  await runMain(unitArgv(req), { databentoGet, polygonGet, env: req.env, nowMs: req.nowMs, onLocks: req.onLocks });
  const ledger: Record<string, unknown[]> = {};
  for (const op of BELL_OPERATORS) ledger[op] = ledgerLines(join(req.ledgerDir, req.cycles[op] ?? "", `${op}.jsonl`));
  return { ledger };
};
/** The trajectory production of the command line: the real runMain --rebase-produce under the guard. */
export const runMainProduce: Produce = (req) => runMain(produceArgv(req), { databentoGet, polygonGet, env: req.env, nowMs: req.nowMs, onLocks: req.onLocks });
/** The default cost query: the Databento GET of close.ts, the one module allowed a paid read; a metadata.get_cost body is one JSON number. */
export const databentoCost: CostGet = async (path, key) => { const v: readonly unknown[] = await databentoGet(path, key); return v.length === 1 && typeof v[0] === "number" ? v[0] : NaN; };
/** The cost query of a unit (JS_COST of launch-q6.sh): every reference-close day its window reaches, minute by minute, for the universe's underlyings. */
export function cashCostPath(w: UnitWindow): string {
  const days = new Set<string>();
  for (let ms = w.from_utc_ms; ms <= w.to_utc_ms; ms += 60_000) { const c = classifySession(ms); days.add(refCloseDateOf(c.session, c.sessionDateET)); }
  const d = [...days].sort(), end = new Date(Date.parse(`${d.at(-1) ?? ""}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  return databentoCostPath([...new Set(BELL_UNIVERSE.map((m) => POOLS.find((p) => p.baseSymbol === m && p.chain === "solana")?.underlying ?? m))], d[0] ?? "", end);
}
/** The cash cost pre-flight, before any paid call: a failed query, no number, or a cost above CASH_COST_CAP_USD is refused cash_cost_cap. */
async function cashPreflight(w: UnitWindow, env: TickDeps["env"], get: CostGet): Promise<void> {
  let cost: number;
  try { cost = await get(cashCostPath(w), readCashKeys(env).databentoKey); } catch (e) { return refuse("cash_cost_cap", `the cost query failed: ${e instanceof Error ? e.name : "a non-error value"}`); }
  if (!Number.isFinite(cost)) refuse("cash_cost_cap", "the cost query returned no number");
  if (cost > CASH_COST_CAP_USD) refuse("cash_cost_cap", `cost_usd=${String(cost)} above the cap of ${String(CASH_COST_CAP_USD)}`);
}
/** The legs an act switches off in state/legs.json ({"<leg>": "off" | "on"}), each with the keys it removes from every stage's environment. */
export const LEGS = Object.freeze({ helius: ["BELL_SOLANA_RPC", "HELIUS_API_KEY"], chainstack: ["CHAINSTACK_SOLANA_URL"], databento: ["DATABENTO_API_KEY"], massive: ["POLYGON_API_KEY"] });
type Leg = keyof typeof LEGS;
type Stage = "preflight" | "produce" | "collect";
/** The legs a stage needs: the cost query reads Databento; the production enumerates and re-reads on the two Solana operators; a run needs
 *  every leg (C04 the ADV bars, C05 the quorum, C14 the close and its cross). */
const NEEDS: Readonly<Record<Stage, readonly Leg[]>> = { preflight: ["databento"], produce: ["helius", "chainstack"], collect: ["helius", "chainstack", "databento", "massive"] };
function legsOff(state: string): ReadonlySet<Leg> {
  const p = join(state, "state", "legs.json"), j = existsSync(p) ? parse(readFileSync(p, "utf8")) : {};
  const e = j !== null && typeof j === "object" && !Array.isArray(j) ? Object.entries(j) : null;
  if (e === null || e.some(([k, v]) => !Object.hasOwn(LEGS, k) || (v !== "off" && v !== "on"))) refuse("leg_off", `state/legs.json is malformed: {"<leg>": "off" | "on"}, legs ${Object.keys(LEGS).join(", ")}`);
  return new Set(e.filter(([, v]) => v === "off").map(([k]) => k as Leg));
}
function needs(stage: Stage, off: ReadonlySet<Leg>): void {
  const leg = NEEDS[stage].find((l) => off.has(l));
  if (leg !== undefined) refuse("leg_off", `${leg} is off and the ${stage} stage needs it`);
}
/** A guard error under its name of the closed list (ruling on deviation 7 of lot 2b-i): the share refusal (the guard's refusal code
 *  cycle_share) is share_exhausted, any other budget stop budget_stop, a held lock lock_held, a plain Error of the guard (an operator it
 *  refuses or cannot resolve, a ledger it cannot trust) budget_guard. LockHeldError is not exported by @monark/rpc-guard and sets no name:
 *  it is read by its class name. Any other error is left as is (failed: <name>). */
function guardNamed(e: unknown): unknown {
  if (e instanceof BudgetExceededError) return new TickRefusal((e as { reason?: unknown }).reason === "cycle_share" ? "share_exhausted" : "budget_stop", e.message);
  if (e instanceof Error && e.constructor.name === "LockHeldError") return new TickRefusal("lock_held", e.message);
  if (e instanceof Error && e.constructor === Error && e.message.startsWith("rpc-guard: ")) return new TickRefusal("budget_guard", e.message);
  return e;
}
const ledgerLines = (p: string): unknown[] => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter((l) => l.trim() !== "").map((l) => parse(l)) : []);
/** An operator's own credits in its cycle ledger: the attempted and settled lines (the guard's own sum), the floor never applied. */
function ownCredits(p: string): number {
  return ledgerLines(p).reduce<number>((a, l) => { const x = l as { outcome?: unknown; credits_derived?: unknown } | null;
    return a + ((x?.outcome === "attempted" || x?.outcome === "settled") && typeof x.credits_derived === "number" ? x.credits_derived : 0); }, 0);
}
/** One stage under the ledger difference: each operator's own credits before and after it go to state/cost.jsonl, one line per operator,
 *  whatever the stage's outcome (its spend is spent). */
async function staged<T>(state: string, ledgerDir: string, cycles: Readonly<Record<string, string>>, d: string, n: number, stage: Stage, body: () => Promise<T>): Promise<T> {
  const sums = (): number[] => BELL_OPERATORS.map((op) => ownCredits(join(ledgerDir, cycles[op] ?? "", `${op}.jsonl`)));
  const before = sums();
  try { return await body(); } finally {
    const after = sums();
    appendFileSync(join(state, "state", "cost.jsonl"), BELL_OPERATORS.map((op, i) => `${JSON.stringify({ unit: d, attempt: n, stage, op, cycle: cycles[op], credits: (after[i] ?? 0) - (before[i] ?? 0) })}\n`).join(""));
  }
}
/** The SIGTERM handler's line: the locks are said released only when their release did not throw. */
export function sigtermLine(release: ((reason: string) => void) | undefined): string {
  if (release === undefined) return "bell/tick: refused sigterm: stopped, no lock held";
  try { release("bell/tick: sigterm"); } catch { return "bell/tick: refused sigterm: stopped, the release of the run's locks threw: unlock them by act"; }
  return "bell/tick: refused sigterm: stopped, the run's locks released";
}

interface Progress { readonly seed: string; readonly last_unit: string | null }
function readProgress(state: string): Progress {
  const p = join(state, "state", "progress.json");
  if (!existsSync(p)) refuse("state_missing", "state/progress.json is missing: seed it by act");
  const j = parse(readFileSync(p, "utf8")) as { seed?: unknown; last_unit?: unknown } | null;
  if (j === null || typeof j.seed !== "string" || !DATE.test(j.seed) || !(j.last_unit === null || (typeof j.last_unit === "string" && DATE.test(j.last_unit)))) {
    return refuse("state_missing", "state/progress.json is malformed");
  }
  return { seed: j.seed, last_unit: j.last_unit };
}
function readAttempts(state: string): Record<string, number> {
  const p = join(state, "state", "attempts.json"), j = existsSync(p) ? parse(readFileSync(p, "utf8")) : {};
  return j !== null && typeof j === "object" && !Array.isArray(j) ? (j as Record<string, number>) : refuse("state_missing", "state/attempts.json is malformed");
}
/** progress.json, written atomically AFTER the bundle (or the tombstone) is in place. */
function advance(state: string, p: Progress, d: string, bundle: string, manifest: string): void {
  writeAtomic(join(state, "state", "progress.json"), `${JSON.stringify({ seed: p.seed, last_unit: d, bundle, manifest_sha256: sha256Hex(manifest) })}\n`);
}
/** The four files of a run as runMain writes them; an absent or unreadable file reads null (checkRun then refuses it by name). */
function readRun(dir: string): RunFiles {
  const text = (f: string): string => { try { return readFileSync(join(dir, f), "utf8"); } catch { return ""; } };
  return { state: parse(text("state.json")), journal: parse(text("journal.json")), provenance: parse(text("provenance.json")),
    timeline: text("timeline.jsonl").split("\n").filter((l) => l.trim() !== "").map((l) => parse(l)) };
}
const NAMED: ReadonlySet<string> = new Set(["close_ref_missing", "stop_cash_cross_mismatch", "adv_regime_unruled"]);
/** The first refusal of checkRun, in its control order: its own name when the closed list holds it, else check_failed:<control>. */
function refusalOf(mint: string, r: CheckRefusal): TickRefusal {
  return NAMED.has(r.code) ? new TickRefusal(r.code as TickRefusalCode, `${mint} ${r.code}`) : new TickRefusal("check_failed", `${mint} ${r.code}`, r.control);
}
function quarantine(state: string, d: string, n: number, tmp: string, why: TickRefusal): never {
  const q = join(state, "quarantine", d), reason = join(q, "reason");
  mkdirSync(q, { recursive: true });
  renameSync(tmp, join(q, `a${String(n)}`));
  writeAtomic(reason, `${existsSync(reason) ? readFileSync(reason, "utf8") : ""}a${String(n)} ${why.label}\n`);
  throw why;
}

/** The trajectory stage (T-i3). state/trajectory/ holds reference.json (posed by act; its sha256 must be `refSha`), rebase-trajectory.json
 *  and produced.json ({produced_at_ms, sha256}, the tick's clock at the production). The current trajectory is reused while its bytes match
 *  produced.json and it is at most TRAJ_MAX_AGE_H old, else `produce` writes a new one under produce/; either is checked against the
 *  reference (checkTrajectory) and only a produced trajectory that passes replaces the current one. Returns the path runMain reads. */
async function trajectoryOf(state: string, now: number, refSha: string, produce: (outDir: string) => Promise<void>): Promise<string> {
  const dir = join(state, "state", "trajectory"), cur = join(dir, "rebase-trajectory.json"), meta = join(dir, "produced.json"), out = join(dir, "produce");
  const read = (p: string): Buffer | null => (existsSync(p) ? readFileSync(p) : null);
  const ref = read(join(dir, "reference.json")) ?? refuse("trajectory_mismatch", "state/trajectory/reference.json is absent: an act poses it");
  if (sha256Hex(ref) !== refSha) refuse("trajectory_mismatch", "the sha256 of state/trajectory/reference.json is not the pinned one");
  const m = parse(read(meta)?.toString("utf8") ?? "") as { produced_at_ms?: unknown; sha256?: unknown } | null, held = read(cur);
  const age = typeof m?.produced_at_ms === "number" ? now - m.produced_at_ms : NaN;
  const fresh = held !== null && m?.sha256 === sha256Hex(held) && age >= 0 && age <= TRAJ_MAX_AGE_H * 3_600_000;
  const produced = async (): Promise<Buffer> => {
    rmSync(out, { recursive: true, force: true });
    await produce(out);
    return read(join(out, "rebase-trajectory.json")) ?? refuse("trajectory_stale", "the production wrote no trajectory");
  };
  const text = (fresh ? held : await produced()).toString("utf8");
  const v = checkTrajectory(parse(text), parse(ref.toString("utf8")), BELL_UNIVERSE);
  if (!v.ok) refuse(v.code, v.detail);
  if (!fresh) { writeAtomic(cur, text); writeAtomic(meta, `${JSON.stringify({ produced_at_ms: now, sha256: sha256Hex(text) })}\n`); }
  return cur;
}

async function tick(o: Extract<Opts, { mode: "tick" }>, deps: TickDeps): Promise<string> {
  const progress = readProgress(o.state);
  if (!existsSync(o.handoff)) refuse("state_missing", "the handoff directory is missing");
  checkEnv(deps.env);
  if (!(deps.clockSynced ?? UNSYNCED)()) refuse("clock_unsynced", "the host clock is not synchronized");
  const now = deps.now(), plan = planUnit(now, { seedET: progress.seed, lastDepositedET: progress.last_unit }, UNIT_DUE_MARGIN_MIN);
  if (plan.kind === "calendar_exhausted") return refuse("calendar_exhausted", `unit-${plan.d} needs a day the committed calendar does not hold`);
  const u = plan.kind === "units" ? plan.units[0] : plan.unit;
  if (u === undefined) throw new RangeError("tick: the planner returned no unit");
  if (plan.kind === "nothing_due") return `nothing_due unit-${u.d} due_at=${new Date(dueInstant(u, UNIT_DUE_MARGIN_MIN)).toISOString()}`;
  const name = `unit-${u.d}`, bundle = join(o.handoff, name), manifestPath = `${bundle}.manifest`;
  for (const e of readdirSync(o.handoff)) if (e.startsWith(".tmp-unit-")) rmSync(join(o.handoff, e), { recursive: true, force: true });
  if (existsSync(bundle) && existsSync(manifestPath)) { advance(o.state, progress, u.d, name, readFileSync(manifestPath, "utf8")); return `already_deposited ${name}`; }
  const cycles = cyclesOf(deps.env, now);
  const attempts = readAttempts(o.state), key = u.d, n = (attempts[key] ?? 0) + 1;
  if (n > ATTEMPT_BUDGET) refuse("stalled_unit", `${name} after ${String(ATTEMPT_BUDGET)} attempts; abandon it by act`);
  writeAtomic(join(o.state, "state", "attempts.json"), `${JSON.stringify({ ...attempts, [key]: n })}\n`);
  const tmp = join(o.handoff, `.tmp-${name}`), window = { from_utc_ms: u.startMs, to_utc_ms: u.endMs - 1000 }, maxPages = BELL_RUN_CAPS.maxPages;
  const off = legsOff(o.state), cut = new Set<string>([...off].flatMap((l) => LEGS[l]));
  const runUnit = deps.runUnit ?? runMainUnit, narrowed = Object.fromEntries(BELL_COLLECT_ENV_KEYS.filter((k) => !cut.has(k)).map((k) => [k, deps.env[k]]));
  needs("preflight", off);
  await cashPreflight(window, narrowed, deps.costGet ?? databentoCost);
  mkdirSync(tmp);
  // A-4: the handler is set before any lock (runMain takes them) and releases the locks of the run in course, re-armed at each run.
  let current: ((reason: string) => void) | undefined;
  const onTerm = (): void => {
    const release = current;
    current = undefined;
    try { (deps.err ?? ((s: string): void => { process.stderr.write(`${s}\n`); }))(sigtermLine(release)); } finally { process.exit(1); }
  };
  const base = { ledgerDir: o.ledgerDir, env: narrowed, cycles, nowMs: now, onLocks: (r: (reason: string) => void): void => { current = r; } };
  const stage = <T,>(s: Stage, body: () => Promise<T>): Promise<T> => staged(o.state, o.ledgerDir, cycles, u.d, n, s, async () => {
    try { return await body(); } catch (e) { throw guardNamed(e); } finally { current = undefined; }
  });
  process.on("SIGTERM", onTerm);
  try {
    const trajectory = await trajectoryOf(o.state, now, deps.refTrajSha256 ?? REF_TRAJ_SHA256, (out) => { needs("produce", off); return stage("produce", () => (deps.produce ?? runMainProduce)({ ...base, outDir: out })); });
    needs("collect", off);
    await stage("collect", async () => {
      for (const mint of BELL_UNIVERSE) {
        const dir = join(tmp, mint);
        const { ledger } = await runUnit({ mint, window, maxPages, outDir: dir, trajectory, ...base });
        current = undefined;
        const first = checkRun({ run: readRun(dir), window, ledger: { lines: ledger, maxPages }, nowMs: now, sipStatus: SIP_ETH_STATUS, advRuling: ADV_SIP_ETH_RULING }).refusals[0];
        if (first !== undefined) quarantine(o.state, u.d, n, tmp, refusalOf(mint, first));
      }
    });
  } finally { process.off("SIGTERM", onTerm); }
  try { validateBundle(tmp, BOUNDS, now); } catch (e) {
    if (e instanceof BellPublishError) quarantine(o.state, u.d, n, tmp, new TickRefusal("prevalidation_refused", e.detail, e.code));
    throw e;
  }
  const manifest = manifestOf(tmp);
  writeAtomic(manifestPath, manifest);
  try { renameSync(tmp, bundle); } catch (e) { rmSync(manifestPath, { force: true }); throw e; } // a manifest never outlives a failed rename
  advance(o.state, progress, u.d, name, manifest);
  return `deposited ${name} manifest_sha256=${sha256Hex(manifest)}`;
}

function seed(o: Extract<Opts, { mode: "seed" }>): string {
  const dir = join(o.state, "state"), p = join(dir, "progress.json");
  mkdirSync(dir, { recursive: true });
  if (existsSync(p)) refuse("seed_exists", "state/progress.json exists");
  writeAtomic(p, `${JSON.stringify({ seed: o.d, last_unit: null, bundle: null, manifest_sha256: null })}\n`);
  return `seeded ${o.d}`;
}

/** The abandon act: only the stalled unit (the next one, its budget spent). The reason line, the tombstone's manifest, the tombstone
 *  unit-<D>.abandoned, then the progress, once. */
function abandon(o: Extract<Opts, { mode: "abandon" }>): string {
  const progress = readProgress(o.state), next = progress.last_unit === null ? progress.seed : nextTradingDay(progress.last_unit);
  if (o.d !== next || (readAttempts(o.state)[o.d] ?? 0) < ATTEMPT_BUDGET) refuse("abandon_refused", `unit-${o.d} is not the stalled unit`);
  if (!existsSync(o.handoff)) refuse("state_missing", "the handoff directory is missing");
  const name = `unit-${o.d}.abandoned`, body = `${JSON.stringify({ unit: o.d, reason: o.reason })}\n`, jl = join(o.state, "state", "abandoned.jsonl");
  const prior = existsSync(jl) ? readFileSync(jl, "utf8") : "", manifest = `${sha256Hex(body)}  ${name}\n`;
  if (!prior.split("\n").includes(body.slice(0, -1))) writeAtomic(jl, prior + body);
  writeAtomic(join(o.handoff, `${name}.manifest`), manifest);
  writeAtomic(join(o.handoff, name), body);
  advance(o.state, progress, o.d, name, manifest);
  return `abandoned unit-${o.d} reason=${o.reason}`;
}

/** The entry point of the three forms: the exit code, every line through `out` (stdout) or `err` (stderr). */
export async function tickMain(argv: readonly string[], deps: TickDeps): Promise<number> {
  const out = deps.out ?? ((s: string): void => { process.stdout.write(`${s}\n`); }), err = deps.err ?? ((s: string): void => { process.stderr.write(`${s}\n`); });
  const creds = BELL_COLLECT_ENV_KEYS.filter((k) => CREDENTIAL.test(k)).map((k) => deps.env[k] ?? "").filter((x) => x.length >= 8);
  const safe = (s: string): string => (KEY_SHAPES.some((re) => re.test(s)) || creds.some((c) => s.includes(c)) ? "(detail withheld)" : s);
  try {
    const o = parseArgv(argv);
    out(`bell/tick: ${safe(o.mode === "tick" ? await tick(o, deps) : o.mode === "seed" ? seed(o) : abandon(o))}`);
    return 0;
  } catch (e) {
    if (e instanceof TickRefusal) { err(`bell/tick: refused ${safe(e.label)}: ${safe(e.detail)}`); return e.code === "usage" ? 64 : 1; }
    err(`bell/tick: failed: ${e instanceof Error ? safe(e.name) : "a non-error value"}`);
    return 1;
  }
}

/** The command line: the real runMain under the guard (runMainUnit). The clock probe stays the default, unsynced (item CLOCK-PROBE-HOST-1). */
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await tickMain(process.argv.slice(2), { env: process.env, now: () => Date.now() });
}
