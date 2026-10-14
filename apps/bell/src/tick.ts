// MONARK Bell, the collection tick. Called at any instant, it plans the trading-day unit due (planUnit), has the injected runUnit produce
// one run per mint of the universe on the unit's window, checks each run (checkRun, with the same window and the same page cap the run
// used), pre-validates the bundle (validateBundle, the publisher's own rule), then deposits it atomically into the handoff directory
// (sibling manifest first, then the rename, then state/progress.json), or moves it to quarantine/<D>/ with its reason. At most one unit
// per tick; attempts are counted per unit start day D, whatever the slot or the cause; past the budget the unit exits stalled_unit until
// an act abandons it. The argv forms are closed:
//   --tick --state <dir> --handoff <dir> --status <dir> --ledger-dir <dir>
//   --seed <D> --state <dir>
//   --abandon <D> --reason <code> --state <dir> --handoff <dir>
// <state> is the private directory of the collection: state/progress.json, state/attempts.json, state/abandoned.jsonl, quarantine/<D>/.
// Exit 0: deposited, nothing due, already deposited, seeded, abandoned; 1: a named refusal of TICK_REFUSALS; 64: usage, before any
// read, probe, clock or write. The environment is checked for presence and shape only; no printed line names a URL or a key (every
// detail passes KEY_SHAPES and the credential values of the environment). The clock probe (deps.clockSynced, unsynced by default:
// fail-closed) is read before the clock, which is read once per tick, and before any attempt, write or run.
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, rmSync, writeSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ATTEMPT_BUDGET, BELL_COLLECT_ENV_KEYS, BELL_RUN_CAPS, BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
import { BOUNDS, BellPublishError, KEY_SHAPES } from "../scripts/bell-validate.mjs";
import { manifestOf, validateBundle } from "../scripts/bell-validate.mjs";
import { sha256Hex } from "../scripts/bell-chain.mjs";
import { ADV_SIP_ETH_RULING, checkRun, type CheckRefusal, type RunFiles } from "./checks.ts";
import { dueInstant, planUnit } from "./plan.ts";
import { CALENDAR_RANGE, isTradingDay, nextTradingDay, SIP_ETH_STATUS } from "./sessions.ts";

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
  readonly env: Readonly<Record<string, string | undefined>>;
}
/** What one run hands back: the lines of each operator's cycle ledger, read once the run has released it (C13 reads this run's segment). */
export interface RunUnitResult { readonly ledger: Readonly<Record<string, readonly unknown[]>> }
export type RunUnit = (req: RunUnitRequest) => Promise<RunUnitResult>;
export interface TickDeps {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly now: () => number;
  readonly runUnit: RunUnit;
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
  [/_SHARE$/, /^[1-9]\d{0,14}$/], [/_(?:URL|RPC)$/, /^https:\/\/[!-~]+$/], [/./, /^[!-~]{8,}$/]];
function checkEnv(env: TickDeps["env"]): void {
  for (const k of BELL_COLLECT_ENV_KEYS) {
    const v = env[k];
    if (v === undefined) refuse("env_missing", k);
    const shape = SHAPES.find(([name]) => name.test(k))?.[1];
    if (shape === undefined || !shape.test(v) || (k.endsWith("_ANCHOR_UTC") && !Number.isFinite(Date.parse(v)))) refuse("env_malformed", k);
  }
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
  const attempts = readAttempts(o.state), key = u.d, n = (attempts[key] ?? 0) + 1;
  if (n > ATTEMPT_BUDGET) refuse("stalled_unit", `${name} after ${String(ATTEMPT_BUDGET)} attempts; abandon it by act`);
  writeAtomic(join(o.state, "state", "attempts.json"), `${JSON.stringify({ ...attempts, [key]: n })}\n`);
  const tmp = join(o.handoff, `.tmp-${name}`), window = { from_utc_ms: u.startMs, to_utc_ms: u.endMs - 1000 }, maxPages = BELL_RUN_CAPS.maxPages;
  mkdirSync(tmp);
  for (const mint of BELL_UNIVERSE) {
    const dir = join(tmp, mint), { ledger } = await deps.runUnit({ mint, window, maxPages, outDir: dir, ledgerDir: o.ledgerDir, env: deps.env });
    const first = checkRun({ run: readRun(dir), window, ledger: { lines: ledger, maxPages }, nowMs: now, sipStatus: SIP_ETH_STATUS, advRuling: ADV_SIP_ETH_RULING }).refusals[0];
    if (first !== undefined) quarantine(o.state, u.d, n, tmp, refusalOf(mint, first));
  }
  try { validateBundle(tmp, BOUNDS, now); } catch (e) {
    if (e instanceof BellPublishError) quarantine(o.state, u.d, n, tmp, new TickRefusal("prevalidation_refused", e.detail, e.code));
    throw e;
  }
  const manifest = manifestOf(tmp);
  writeAtomic(manifestPath, manifest);
  renameSync(tmp, bundle);
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

/** Not wired in this module: the production run (runMain once per mint, under the guard) is injected by the lot that wires it. */
const notWired: RunUnit = () => Promise.reject(new Error("the collection run is not wired"));
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await tickMain(process.argv.slice(2), { env: process.env, now: () => Date.now(), runUnit: notWired });
}
