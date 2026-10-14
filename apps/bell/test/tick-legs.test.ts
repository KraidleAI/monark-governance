// MONARK Bell -- the stages lot 2c adds to the collection tick (apps/bell/src/tick.ts): the rebase trajectory reused while it is young or
// produced again under its own caps, checked against the reference an act poses; the free cash cost query before any paid call; the leg
// switch that removes a leg's keys and refuses a stage that needs it; each stage's credits from its cycle ledger; and the three items of the
// 2b-ii review that touch the tick: the halts file never absent, every guard error by its name, the SIGTERM line that says the truth. The
// production, the cost query and the runs are seams the test records; two tests drive the real runMain and the real guard over a fetch stub
// on .invalid hosts. No network. Every new export is read through the module namespaces, so the base tree fails by assertion, not by load.
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BELL_SOLANA_METHODS, BudgetExceededError } from "@monark/rpc-guard";
import * as deploy from "../../../scripts/bell-deploy.mjs";
import { sha256Hex } from "../scripts/bell-chain.mjs";
import { parseArgs } from "../src/collect.ts";
import { dueInstant, unitOf } from "../src/plan.ts";
import * as tickMod from "../src/tick.ts";
import { TickRefusal, tickMain, type ProduceRequest, type RunUnit, type RunUnitRequest, type TickDeps } from "../src/tick.ts";

type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url));
const LAUNCHER = readFileSync(join(HERE, "..", "ops", "launch-q6.sh"), "utf8");
const launcher = (re: RegExp): string => { const m = re.exec(LAUNCHER); assert.ok(m?.[1] !== undefined, `launch-q6.sh carries ${String(re)}`); return m[1]; };
const tmp = (p: string): string => mkdtempSync(join(tmpdir(), p));
const D = "2026-10-02", U = unitOf(D), DUE = dueInstant(U, deploy.UNIT_DUE_MARGIN_MIN), HOUR = 3_600_000, MIN = 60_000;
const UNIVERSE = [...deploy.BELL_UNIVERSE];
const HKEY = ["0".repeat(8), "1".repeat(4), "2".repeat(4), "3".repeat(4), "4".repeat(12)].join("-");
const HELIUS_HOST = "helius.example.invalid", CS_HOST = "cs-sol.example.invalid";
const ENV: Record<string, string> = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, HELIUS_API_KEY: HKEY, CHAINSTACK_SOLANA_URL: `https://${CS_HOST}/${"c".repeat(32)}`,
  DATABENTO_API_KEY: `db${"-"}${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32), HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z",
  CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T04:00:00+02:00", HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000", BELL_HALTS_CSV: join(HERE, "fixtures", "halts-tsla-synth.csv") };
const CYCLES = { helius: "helius-2026-09-19", chainstack: "chainstack-2026-09-19" };

/** A trajectory file of the universe: per mint, an initialize event then `extra` updates (a reference holds extra = 0). */
const ev = (m: string, i: number): Obj => ({ kind: i === 0 ? "initialize" : "update", multiplier: i === 0 ? "1" : `1.00${String(i)}`, multiplierBitsHex: `${String(i)}`.padStart(16, "0"),
  effectiveTimestampSec: 1_700_000_000 + i, blockTimeSec: 1_700_000_000 + i, slot: 100 + i, instructionIndex: 0, signature: `${m}-${String(i)}` });
const trajOf = (extra = 0, edit: (m: string, e: Obj[]) => void = () => undefined): string => JSON.stringify(Object.fromEntries(UNIVERSE.map((m) => {
  const events = Array.from({ length: extra + 1 }, (_, i) => ev(m, i));
  edit(m, events);
  return [m, { scanComplete: true, scanMethod: "authority", events }];
})));
const REF = trajOf(), REF_SHA = sha256Hex(REF);

interface Host { root: string; state: string; handoff: string; ledger: string; calls: string[]; produced: ProduceRequest[]; runs: RunUnitRequest[]; costs: string[][]; out: string[]; err: string[] }
const trajDir = (h: Host): string => join(h.state, "state", "trajectory");
function placeTrajectory(h: Host, producedAt: number, current = REF): void {
  mkdirSync(trajDir(h), { recursive: true });
  writeFileSync(join(trajDir(h), "reference.json"), REF);
  writeFileSync(join(trajDir(h), "rebase-trajectory.json"), current);
  writeFileSync(join(trajDir(h), "produced.json"), JSON.stringify({ produced_at_ms: producedAt, sha256: sha256Hex(current) }));
}
async function seeded(producedAt = DUE): Promise<Host> {
  const root = tmp("bell-legs-");
  for (const d of ["collect", "handoff", "status", "ledger"]) mkdirSync(join(root, d));
  const h: Host = { root, state: join(root, "collect"), handoff: join(root, "handoff"), ledger: join(root, "ledger"), calls: [], produced: [], runs: [], costs: [], out: [], err: [] };
  assert.equal(await tickMain(["--seed", D, "--state", h.state], { env: ENV, now: () => DUE }), 0);
  placeTrajectory(h, producedAt);
  return h;
}
const tickArgv = (h: Host): string[] => ["--tick", "--state", h.state, "--handoff", h.handoff, "--status", join(h.root, "status"), "--ledger-dir", h.ledger];
/** A production that writes `text` as runMain --rebase-produce would. */
const writes = (text: string) => (req: ProduceRequest): Promise<void> => { mkdirSync(req.outDir, { recursive: true }); writeFileSync(join(req.outDir, "rebase-trajectory.json"), text); return Promise.resolve(); };
/** A run stopped by a named refusal: the stages before it are what the test reads. */
const stop: RunUnit = () => Promise.reject(new TickRefusal("close_ref_pending", "stopped by the test"));
interface Opts { now?: number; env?: Record<string, string>; produce?: (req: ProduceRequest) => Promise<void>; runUnit?: RunUnit; cost?: (p: string, k: string) => Promise<number>; ref?: null; real?: boolean }
/** The tick with its seams recorded; `ref: null` leaves the reference's sha256 to its default, the pinned one. */
function run(h: Host, o: Opts = {}): Promise<number> {
  const deps: TickDeps = { env: o.env ?? ENV, now: () => o.now ?? DUE, clockSynced: () => true, ...(o.ref === null ? {} : { refTrajSha256: REF_SHA }),
    costGet: (p, k) => { h.calls.push("cost"); h.costs.push([p, k]); return (o.cost ?? ((): Promise<number> => Promise.resolve(0.5)))(p, k); },
    produce: (req) => { h.calls.push("produce"); h.produced.push(req); return (o.produce ?? writes(REF))(req); },
    ...(o.real === true ? {} : { runUnit: (req: RunUnitRequest) => { h.calls.push(`run ${req.mint}`); h.runs.push(req); return (o.runUnit ?? stop)(req); } }),
    out: (s) => { h.out.push(s); }, err: (s) => { h.err.push(s); } };
  return tickMain(tickArgv(h), deps);
}
const lastErr = (h: Host): string => h.err.at(-1) ?? "";
const readJson = (p: string): Obj => JSON.parse(readFileSync(p, "utf8")) as Obj;
/** globalThis.fetch answers every JSON-RPC call with a null result (an empty enumeration, an unreadable state): each host is noted. */
async function withRpc<T>(body: (hosts: string[]) => Promise<T>): Promise<T> {
  const real = globalThis.fetch, hosts: string[] = [];
  globalThis.fetch = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    hosts.push(new URL(String(input)).hostname);
    const m = (JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method?: string }).method;
    return Promise.resolve(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: m === "getSignaturesForAddress" ? [] : null }), { status: 200, headers: { "content-type": "application/json" } }));
  }) as typeof globalThis.fetch;
  try { return await body(hosts); } finally { globalThis.fetch = real; }
}

// killer: scripts/bell-deploy.mjs:29 CONST "TRAJ_MAX_AGE_H = 12" -> "TRAJ_MAX_AGE_H = 24"
test("bell_tick_produces_trajectory_when_stale_and_reuses_when_fresh", async () => {
  assert.equal(deploy.TRAJ_MAX_AGE_H, Number(launcher(/^TRAJ_MAX_AGE_H=(\d+)$/m)), "the launcher's maximum age, in hours");
  const fresh = await seeded(DUE - 11 * HOUR - 59 * MIN), meta = join(trajDir(fresh), "produced.json"), cur = join(trajDir(fresh), "rebase-trajectory.json");
  assert.equal(await run(fresh), 1);
  assert.deepEqual([fresh.calls, fresh.runs[0]?.trajectory, readJson(meta).produced_at_ms], [["cost", "run TSLAx"], cur, DUE - 11 * HOUR - 59 * MIN], "11 h 59 old: reused as is");
  const stale = await seeded(DUE - 12 * HOUR - MIN), grown = trajOf(2);
  assert.equal(await run(stale, { produce: writes(grown) }), 1);
  assert.deepEqual([stale.calls, stale.produced.map((r) => r.outDir), stale.runs[0]?.trajectory], [["cost", "produce", "run TSLAx"], [join(trajDir(stale), "produce")],
    join(trajDir(stale), "rebase-trajectory.json")], "12 h 01 old: produced again, once, then passed to the run");
  assert.deepEqual([readFileSync(join(trajDir(stale), "rebase-trajectory.json"), "utf8"), readJson(join(trajDir(stale), "produced.json"))], [grown, { produced_at_ms: DUE, sha256: sha256Hex(grown) }],
    "the new trajectory replaces the current one, with the tick's instant and its sha256");
  assert.equal(await run(stale, { now: DUE + HOUR }), 1);
  assert.deepEqual(stale.calls.slice(3), ["cost", "run TSLAx"], "an hour later it is reused");
  const incomplete = await seeded(DUE - 13 * HOUR);
  assert.equal(await run(incomplete, { produce: writes(JSON.stringify({ TSLAx: { scanComplete: false, scanMethod: "authority", events: [] } })) }), 1);
  assert.deepEqual([lastErr(incomplete), incomplete.runs.length, readJson(join(trajDir(incomplete), "produced.json")).produced_at_ms],
    ["bell/tick: refused trajectory_stale: entry TSLAx absent or incomplete", 0, DUE - 13 * HOUR], "an incomplete production replaces nothing and runs nothing");
  const edge = await seeded(DUE - 12 * HOUR), touched = await seeded(), future = await seeded(DUE + HOUR);
  writeFileSync(join(trajDir(touched), "rebase-trajectory.json"), trajOf(1));
  for (const h of [edge, touched, future]) assert.equal(await run(h), 1);
  assert.deepEqual([edge.calls, touched.calls, future.calls], [["cost", "run TSLAx"], ["cost", "produce", "run TSLAx"], ["cost", "produce", "run TSLAx"]],
    "12 h old: reused (the launcher's -le); bytes that are not the produced ones, or a production after now: produced again");
  assert.equal(await run(stale, { now: DUE + 13 * HOUR, produce: () => Promise.resolve() }), 1);
  assert.equal(lastErr(stale), "bell/tick: refused trajectory_stale: the production wrote no trajectory", "the previous production's file is never read again");
  // The real production: its argv passes runMain's parser and the real guard, and it writes the trajectory file under its own caps.
  const req: ProduceRequest = { outDir: join(incomplete.root, "produce"), ledgerDir: incomplete.ledger, env: ENV, cycles: CYCLES, nowMs: DUE, onLocks: () => undefined };
  const p = parseArgs(tickMod.produceArgv(req), UNIVERSE, DUE);
  assert.deepEqual([p.rebaseProduce, p.authority, p.wanted, p.maxCalls, p.maxPages, p.operators, p.floors], [true, deploy.BELL_AUTHORITY, UNIVERSE, 2000, 2000, ["helius", "chainstack"],
    { helius: 0, chainstack: 0 }], "the production's own caps and the shared authority");
  assert.ok(BELL_SOLANA_METHODS.every((m) => (p.methodCaps[m] ?? 0) > 0), "every method the guard checks at its opening is capped");
  const hosts = await withRpc(async (seen) => { await tickMod.runMainProduce(req); return seen; });
  const file = readJson(join(req.outDir, "rebase-trajectory.json"));
  assert.deepEqual([Object.keys(file).sort(), hosts.includes(HELIUS_HOST)], [[...UNIVERSE].sort(), true], "written for the universe, the authority enumerated on helius");
  const att = readFileSync(join(incomplete.ledger, CYCLES.helius, "helius.jsonl"), "utf8").split("\n").filter((l) => l.includes('"attempted"') && l.includes("getTransactionsForAddress"));
  assert.ok(att.length >= 1, "the enumeration went through the guard's ledger");
});

// killer: apps/bell/src/trajectory-check.ts:25 CONST "eventKey(te[i]) !== eventKey(re[i])" -> "false"
test("bell_tick_refuses_trajectory_mismatch_with_reference_prefix", async () => {
  assert.equal(deploy.REF_TRAJ_SHA256, launcher(/^REF_TRAJ_SHA256=([0-9a-f]{64})$/m), "the launcher's reference sha256, whole");
  const pinned = await seeded();
  assert.equal(await run(pinned, { ref: null }), 1);
  assert.deepEqual([lastErr(pinned), pinned.calls], ["bell/tick: refused trajectory_mismatch: the sha256 of state/trajectory/reference.json is not the pinned one", ["cost"]],
    "the pinned sha256 by default: a reference of other bytes is refused before any production or run");
  const absent = await seeded();
  rmSync(join(trajDir(absent), "reference.json"));
  assert.equal(await run(absent), 1);
  assert.equal(lastErr(absent), "bell/tick: refused trajectory_mismatch: state/trajectory/reference.json is absent: an act poses it");
  const changed = await seeded();
  placeTrajectory(changed, DUE, trajOf(1, (m, e) => { if (m === "AAPLx" && e[0] !== undefined) e[0].slot = 99; }));
  assert.equal(await run(changed), 1);
  assert.deepEqual([lastErr(changed), changed.runs.length], ["bell/tick: refused trajectory_mismatch: AAPLx: event 0 differs from the reference", 0], "one field of one event");
  const grown = await seeded();
  placeTrajectory(grown, DUE, trajOf(3));
  assert.equal(await run(grown), 1);
  assert.deepEqual(grown.calls, ["cost", "run TSLAx"], "new events after the reference's pass");
  const { checkTrajectory, EVENT_KEY_FIELDS } = await import("../src/trajectory-check.ts");
  assert.deepEqual([...EVENT_KEY_FIELDS], ["kind", "multiplier", "multiplierBitsHex", "effectiveTimestampSec", "blockTimeSec", "slot", "instructionIndex", "signature"]);
  for (const f of EVENT_KEY_FIELDS) {
    const v = checkTrajectory(JSON.parse(trajOf(1, (_, e) => { if (e[0] !== undefined) e[0][f] = "x"; })), JSON.parse(REF), UNIVERSE);
    assert.deepEqual(v, { ok: false, code: "trajectory_mismatch", detail: "TSLAx: event 0 differs from the reference" }, `a changed ${f}`);
  }
  const ref = JSON.parse(REF) as Record<string, Obj>, short = JSON.parse(REF) as Record<string, Obj>;
  (short.AAPLx as Obj).events = [];
  assert.deepEqual([checkTrajectory(short, ref, UNIVERSE), checkTrajectory(ref, { TSLAx: ref.TSLAx }, UNIVERSE), checkTrajectory({ ...ref, TSLAx: { ...ref.TSLAx, scanMethod: "hybrid" } }, ref, UNIVERSE),
    checkTrajectory(JSON.parse(trajOf(2)), ref, UNIVERSE)], [{ ok: false, code: "trajectory_mismatch", detail: "AAPLx: fewer events than the reference" },
    { ok: false, code: "trajectory_mismatch", detail: "the reference holds no AAPLx" }, { ok: false, code: "trajectory_stale", detail: "entry TSLAx absent or incomplete" },
    { ok: true, lines: ["traj_TSLAx_events=3 ref=1 new=2", "traj_AAPLx_events=3 ref=1 new=2"] }]);
});

// killer: apps/bell/src/tick.ts:323 SDL "await cashPreflight(window, narrowed, deps.costGet ?? databentoCost);" -> ""
test("bell_tick_cash_cost_preflight_caps_the_leg", async () => {
  const cap = deploy.CASH_COST_CAP_USD;
  assert.equal(cap, Number(launcher(/^COST_CAP_USD=(\d+)\b/m)), "the launcher's cost cap per course, in USD");
  const at = await seeded(DUE - 13 * HOUR);
  assert.equal(await run(at, { cost: () => Promise.resolve(cap) }), 1);
  assert.deepEqual(at.calls, ["cost", "produce", "run TSLAx"], "the free query first, then the paid production and runs; a cost at the cap passes");
  assert.deepEqual(at.costs, [["/v0/metadata.get_cost?dataset=EQUS.SUMMARY&schema=ohlcv-1d&stype_in=raw_symbol&symbols=TSLA%2CAAPL&start=2026-10-01&end=2026-10-03", ENV.DATABENTO_API_KEY]],
    "every reference-close day of the unit's window, the universe's underlyings, the key as the user");
  const refusals: string[] = [];
  for (const cost of [(): Promise<number> => Promise.resolve(cap + 0.01), (): Promise<number> => Promise.reject(new Error(`HTTP 500 ${ENV.DATABENTO_API_KEY ?? ""}`)), (): Promise<number> => Promise.resolve(Number.NaN)]) {
    const h = await seeded(DUE - 13 * HOUR);
    assert.equal(await run(h, { cost }), 1);
    assert.deepEqual(h.calls, ["cost"], "refused before any paid call");
    refusals.push(lastErr(h));
  }
  assert.deepEqual(refusals, [`bell/tick: refused cash_cost_cap: cost_usd=${String(cap + 0.01)} above the cap of ${String(cap)}`, "bell/tick: refused cash_cost_cap: the cost query failed: Error",
    "bell/tick: refused cash_cost_cap: the cost query returned no number"]);
  // The default query: close.ts's Databento GET; a metadata.get_cost body is one JSON number, anything else is no number.
  const real = globalThis.fetch, seen: string[] = [], costs: number[] = [];
  try {
    for (const body of ["0.42", '{"cost":0.42}']) {
      globalThis.fetch = ((input: string | URL, init?: RequestInit): Promise<Response> => { seen.push(`${new URL(String(input)).host} ${String(new Headers(init?.headers).get("authorization")?.split(" ")[0])}`);
        return Promise.resolve(new Response(body, { status: 200 })); }) as typeof globalThis.fetch;
      costs.push(await tickMod.databentoCost("/v0/metadata.get_cost?x=1", "k"));
    }
  } finally { globalThis.fetch = real; }
  assert.deepEqual([costs, seen], [[0.42, Number.NaN], ["hist.databento.com Basic", "hist.databento.com Basic"]]);
});

// killer: apps/bell/src/tick.ts:321 CONST ".filter((k) => !cut.has(k))" -> ""
test("bell_tick_leg_off_unsets_its_key_and_refuses_when_needed", async () => {
  const legs = (h: Host, j: unknown): void => { writeFileSync(join(h.state, "state", "legs.json"), JSON.stringify(j)); };
  const massive = await seeded(DUE - 13 * HOUR);
  legs(massive, { massive: "off", helius: "on" });
  assert.equal(await run(massive), 1);
  assert.deepEqual([massive.calls, lastErr(massive)], [["cost", "produce"], "bell/tick: refused leg_off: massive is off and the collect stage needs it"]);
  assert.deepEqual(Object.keys(massive.produced[0]?.env ?? {}).sort(), deploy.BELL_COLLECT_ENV_KEYS.filter((k) => k !== "POLYGON_API_KEY").sort(),
    "the production runs without the key of the leg switched off, every other key kept");
  const cases: Array<[unknown, string[], string]> = [[{ helius: "off" }, ["cost"], "leg_off: helius is off and the produce stage needs it"],
    [{ databento: "off" }, [], "leg_off: databento is off and the preflight stage needs it"],
    [{ cash: "off" }, [], 'leg_off: state/legs.json is malformed: {"<leg>": "off" | "on"}, legs helius, chainstack, databento, massive'],
    [{ massive: false }, [], 'leg_off: state/legs.json is malformed: {"<leg>": "off" | "on"}, legs helius, chainstack, databento, massive']];
  for (const [j, calls, line] of cases) {
    const h = await seeded(DUE - 13 * HOUR);
    legs(h, j);
    assert.equal(await run(h), 1);
    assert.deepEqual([h.calls, lastErr(h)], [calls, `bell/tick: refused ${line}`], JSON.stringify(j));
  }
  const on = await seeded();
  legs(on, { helius: "on", chainstack: "on", databento: "on", massive: "on" });
  assert.equal(await run(on), 1);
  assert.deepEqual([on.calls, Object.keys(on.runs[0]?.env ?? {}).sort()], [["cost", "run TSLAx"], [...deploy.BELL_COLLECT_ENV_KEYS].sort()], "every leg on: every key reaches the run");
});

// killer: apps/bell/src/tick.ts:228 CONST "const before = sums();" -> "const before = BELL_OPERATORS.map((op) => BELL_FLOORS[op as keyof typeof BELL_FLOORS]);"
test("bell_tick_records_stage_credits_from_the_ledger_delta", async () => {
  const h = await seeded(DUE - 13 * HOUR), led = (op: "helius" | "chainstack"): string => join(h.ledger, CYCLES[op], `${op}.jsonl`);
  const spend = (op: "helius" | "chainstack", lines: Array<[string, number]>): void => {
    mkdirSync(dirname(led(op)), { recursive: true });
    appendFileSync(led(op), lines.map(([outcome, credits_derived]) => `${JSON.stringify({ outcome, credits_derived })}\n`).join(""));
  };
  spend("helius", [["attempted", 100], ["unlocked", 0]]); // a prior run of the cycle: never this tick's
  const produce = (req: ProduceRequest): Promise<void> => { spend("helius", [["attempted", 100], ["settled", -70], ["refused", 0], ["unlocked", 0]]); spend("chainstack", [["attempted", 2], ["attempted", 2]]); return writes(REF)(req); };
  const runUnit: RunUnit = (req) => { spend("helius", [["attempted", 10]]); spend("chainstack", [["attempted", 2]]); return stop(req); };
  assert.equal(await run(h, { produce, runUnit }), 1);
  assert.ok(existsSync(join(h.state, "state", "cost.jsonl")), "state/cost.jsonl written");
  const lines = readFileSync(join(h.state, "state", "cost.jsonl"), "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj);
  assert.deepEqual(lines, [{ unit: D, attempt: 1, stage: "produce", op: "helius", cycle: CYCLES.helius, credits: 30 }, { unit: D, attempt: 1, stage: "produce", op: "chainstack", cycle: CYCLES.chainstack, credits: 4 },
    { unit: D, attempt: 1, stage: "collect", op: "helius", cycle: CYCLES.helius, credits: 10 }, { unit: D, attempt: 1, stage: "collect", op: "chainstack", cycle: CYCLES.chainstack, credits: 2 }],
  "per stage and operator, the attempted and settled credits of the stage only, recorded when the stage stops");
});

// killer: scripts/bell-deploy.mjs:7 CONST ", \"BELL_HALTS_CSV\"]" -> "]"
test("bell_tick_refuses_an_absent_halts_file_by_name", async () => {
  const h = await seeded(), env: Record<string, string> = { ...ENV };
  delete env.BELL_HALTS_CSV;
  assert.equal(await run(h, { env }), 1);
  assert.deepEqual([lastErr(h), h.calls], ["bell/tick: refused env_missing: BELL_HALTS_CSV", []], "an absent halts file never reads as no halt");
  assert.equal(await run(h, { env: { ...ENV, BELL_HALTS_CSV: "" } }), 1);
  assert.equal(lastErr(h), "bell/tick: refused env_malformed: BELL_HALTS_CSV");
  assert.equal(await run(h), 1);
  assert.equal(h.runs[0]?.env.BELL_HALTS_CSV, ENV.BELL_HALTS_CSV, "the run reads the file the act names");
});

// killer: apps/bell/src/tick.ts:215 SDL "  if (e instanceof Error && e.constructor === Error && e.message.startsWith(\"rpc-guard: \")) return new TickRefusal(\"budget_guard\", e.message);" -> ""
test("bell_tick_names_every_guard_error_of_the_closed_list", async () => {
  const h = await seeded(), stopOf = (e: Error): RunUnit => () => Promise.reject(e);
  const cases: Array<[Error, string]> = [[Object.assign(new BudgetExceededError("rpc-guard: another text"), { reason: "cycle_share" }), "share_exhausted: rpc-guard: another text"],
    [new BudgetExceededError("rpc-guard: cycle_share (fail-closed)"), "budget_stop: rpc-guard: cycle_share (fail-closed)"],
    [new Error("rpc-guard: requested operator 'helius' is not resolved from env (fail-closed)"), "budget_guard: rpc-guard: requested operator 'helius' is not resolved from env (fail-closed)"],
    [new Error("bell/collect: not the guard"), "failed: Error"], [new (class TransportLike extends Error {})("rpc-guard: a typed fault"), "failed: Error"]];
  for (const [i, [e, line]] of cases.entries()) {
    assert.equal(await run(h, { now: DUE + i * HOUR, runUnit: stopOf(e) }), 1);
    assert.match(lastErr(h), new RegExp(`^bell/tick: (?:refused )?${line.replace(/[()]/g, "\\$&")}$`), "the share by its refusal code, never its text; a plain Error of the guard by budget_guard");
  }
  // The real guard: a ledger without its head sidecar is refused at the opening by a plain Error, named budget_guard.
  const r = await seeded();
  mkdirSync(join(r.ledger, CYCLES.helius), { recursive: true });
  writeFileSync(join(r.ledger, CYCLES.helius, "helius.jsonl"), "{}\n");
  assert.equal(await withRpc(() => run(r, { real: true })), 1);
  assert.match(lastErr(r), /^bell\/tick: refused budget_guard: rpc-guard: ledger 'helius\.jsonl' present but head sidecar absent/, r.err.join("\n"));
  assert.equal(existsSync(join(r.ledger, CYCLES.chainstack, "chainstack.lock")), false, "nothing left held");
});

// killer: apps/bell/src/tick.ts:237 SDL "  try { release(\"bell/tick: sigterm\"); } catch { return \"bell/tick: refused sigterm: stopped, the release of the run's locks threw: unlock them by act\"; }" -> ""
test("bell_tick_sigterm_line_says_released_only_when_the_release_held", async () => {
  const freed: string[] = [];
  assert.equal(typeof tickMod.sigtermLine, "function", "the handler's line, a function of the release");
  assert.deepEqual([tickMod.sigtermLine((r) => { freed.push(r); }), tickMod.sigtermLine(() => { throw new Error("unlock failed"); }), tickMod.sigtermLine(undefined)],
    ["bell/tick: refused sigterm: stopped, the run's locks released", "bell/tick: refused sigterm: stopped, the release of the run's locks threw: unlock them by act",
      "bell/tick: refused sigterm: stopped, no lock held"]);
  assert.deepEqual(freed, ["bell/tick: sigterm"], "the release is called once, with the tick's reason");
  // Through the handler: a run holds locks whose release throws, the signal comes (emitted in process: no OS signal), the line says so.
  const h = await seeded(), exits: unknown[] = [], exit = process.exit.bind(process);
  process.exit = ((c?: number) => { exits.push(c); }) as typeof process.exit;
  try {
    assert.equal(await run(h, { runUnit: (req) => {
      assert.equal(process.listenerCount("SIGTERM"), 1, "the tick's handler alone: the emitted signal reaches nothing else");
      req.onLocks(() => { throw new Error("unlock failed"); });
      process.emit("SIGTERM", "SIGTERM");
      return stop(req);
    } }), 1);
  } finally { process.exit = exit; }
  assert.deepEqual([exits, h.err[0]], [[1], "bell/tick: refused sigterm: stopped, the release of the run's locks threw: unlock them by act"]);
});
