// MONARK Bell -- the shell of the collection tick (apps/bell/src/tick.ts): closed argv, seed, idempotence, orphan removal, quarantine,
// attempt budget keyed on the unit, abandon, environment and clock refusals, output hygiene, import closure; and the unit name grammar
// and the manifest of bell-validate.mjs. The runs the injected runUnit writes are REAL runMain outputs (helpers/bell-served.ts) cleaned of
// their two abstentions as in checks.test.ts, then re-windowed on the unit, re-symboled per mint, re-sealed and re-chained: each passes
// checkRun and validateBundle as a production run would. Only the clock, the clock probe and runUnit are injected. No network.
// The wiring of the tick to the real runMain (lot 2b-ii): runUnit absent, the REAL runMain over the REAL guard, only globalThis.fetch stubbed
// on .invalid hosts; the cycle derived per operator, the straddle refusal, the share, the floor, the narrowed environment, the guard errors
// rendered by name, the manifest removed when the rename throws, and the SIGTERM release in a child process (POSIX only).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BudgetExceededError } from "@monark/rpc-guard";
import { ATTEMPT_BUDGET, BELL_COLLECT_ENV_KEYS, BELL_RUN_CAPS, BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
import * as deploy from "../../../scripts/bell-deploy.mjs";
import { parseArgs, runMain } from "../src/collect.ts";
import type { DatabentoGet, PolygonGet } from "../src/close.ts";
import * as tickMod from "../src/tick.ts";
import type { Produce, RunUnitRequest } from "../src/tick.ts";
import { KEY_SHAPES, UNIT_NAME, manifestOf, readManifest } from "../scripts/bell-validate.mjs";
import { lineHash, sha256Hex } from "../scripts/bell-chain.mjs";
import { bellSha } from "../src/digest.ts";
import { dueInstant, unitOf } from "../src/plan.ts";
import { etWallClockToUtcMs } from "../src/sessions.ts";
import { TICK_REFUSALS, TickRefusal, tickMain, type RunUnit, type TickDeps, type TickRefusalCode } from "../src/tick.ts";
import { REPO, readJson, runMainInto, tmp, type Obj } from "./helpers/bell-served.ts";

const TICK = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "tick.ts");
const base = tmp("bell-tick-"), good = join(base, "good");
mkdirSync(join(base, "w"));
await runMainInto(good, join(base, "w"));

type Window = { from_utc_ms: number; to_utc_ms: number };
interface Run { state: Obj; journal: Obj; provenance: Obj; timeline: Obj[] }
const D = "2026-10-02", U = unitOf(D), DUE = dueInstant(U, UNIT_DUE_MARGIN_MIN), HOUR = 3_600_000; // a Friday: its unit ends Monday 04:00 ET
const readRun = (dir: string): Run => ({ state: readJson(join(dir, "state.json")), journal: readJson(join(dir, "journal.json")), provenance: readJson(join(dir, "provenance.json")),
  timeline: readFileSync(join(dir, "timeline.jsonl"), "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj) });
const residual = (r: Run, k: string, v: number): void => { (r.state.residuals as Obj)[k] = v; ((r.state.digest as Obj).residuals as Obj)[k] = v; };
const gapOf = (r: Run): Obj => ((r.state.digest as Obj).gaps as Obj[])[0] ?? {};
/** The clean run for `mint` on `window`, mutated by `mutate`, then re-sealed (state and provenance) and re-chained. */
function writeRun(dir: string, mint: string, window: Window, mutate: (r: Run) => void): void {
  const r = JSON.parse(JSON.stringify(readRun(good)).replaceAll('"TSLAx"', JSON.stringify(mint))) as Run, dg = r.state.digest as Obj;
  dg.gaps = (dg.gaps as Obj[]).filter((g) => g.abstain !== "no_close_ref");
  dg.volume = (dg.volume as Obj[]).filter((v) => v.session_date_et !== "2026-08-14");
  residual(r, "no_close_ref", 0); residual(r, "no_adv", 0);
  r.state.window = window;
  mutate(r);
  r.state.bell_sha = bellSha(dg as Parameters<typeof bellSha>[0]); r.provenance.bellSha = r.state.bell_sha;
  r.timeline.forEach((l, i) => { l.prev_line_hash = i === 0 ? "0".repeat(64) : lineHash(r.timeline[i - 1]); });
  mkdirSync(dir, { recursive: true });
  for (const k of ["state", "journal", "provenance"] as const) writeFileSync(join(dir, `${k}.json`), JSON.stringify(r[k], null, 2));
  writeFileSync(join(dir, "timeline.jsonl"), r.timeline.map((l) => JSON.stringify(l) + "\n").join(""));
}
const att = (k: string): Obj => ({ outcome: "attempted", by_op_method: { [k]: 1 }, credits_derived: 1 });
const LEDGER = { helius: [att("helius|getSignaturesForAddress"), { outcome: "unlocked" }], chainstack: [att("chainstack|getTransaction"), { outcome: "unlocked" }] };
const writes = (mutate: (r: Run, mint: string) => void = () => undefined): RunUnit => (req) => {
  writeRun(req.outDir, req.mint, req.window, (r) => { mutate(r, req.mint); });
  return Promise.resolve({ ledger: LEDGER });
};
const refusing = (code: TickRefusalCode, detail = "refused by the guard"): RunUnit => () => Promise.reject(new TickRefusal(code, detail));
/** A stop of the guard as client.ts throws it: its message and its refusal code. */
const guardStop = (reason: string): BudgetExceededError => Object.assign(new BudgetExceededError(`rpc-guard: ${reason} (fail-closed)`), { reason });
// Credential-shaped values built at run time (never a literal of this file): a Helius-shaped key, a key-in-path endpoint, a db- key.
const HKEY = ["0".repeat(8), "1".repeat(4), "2".repeat(4), "3".repeat(4), "4".repeat(12)].join("-");
const HALTS = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "halts-tsla-synth.csv");
const ENV: Record<string, string> = { BELL_SOLANA_RPC: `https://rpc.test.invalid/?api-key=${HKEY}`, HELIUS_API_KEY: HKEY,
  CHAINSTACK_SOLANA_URL: `https://solana-mainnet.core.${"chain"}stack.com/${"a".repeat(32)}`, DATABENTO_API_KEY: `db${"-"}${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32),
  HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z", CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T04:00:00+02:00", HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000",
  BELL_HALTS_CSV: HALTS };

interface Host { root: string; state: string; handoff: string; calls: Array<{ mint: string; window: Window; maxPages: number }>; out: string[]; err: string[]; nows: number; probes: number }
function host(): Host {
  const root = tmp("bell-tick-host-");
  for (const d of ["collect", "handoff", "status", "ledger"]) mkdirSync(join(root, d));
  return { root, state: join(root, "collect"), handoff: join(root, "handoff"), calls: [], out: [], err: [], nows: 0, probes: 0 };
}
const tickArgv = (h: Host): string[] => ["--tick", "--state", h.state, "--handoff", h.handoff, "--status", join(h.root, "status"), "--ledger-dir", join(h.root, "ledger")];
const abandonArgv = (h: Host, d = D): string[] => ["--abandon", d, "--reason", "close_ref_missing", "--state", h.state, "--handoff", h.handoff];
// The rebase trajectory of a seeded state (lot 2c): a reference posed as the act poses it, the same events as the current trajectory, produced at
// DUE; the injected production writes it again. The tick is told the reference's sha256 (the pinned one belongs to a file outside the repo).
const TRAJ = JSON.stringify(Object.fromEntries(BELL_UNIVERSE.map((m) => [m, { scanComplete: true, scanMethod: "authority", events: [{ kind: "initialize", multiplier: "1",
  multiplierBitsHex: "000000000000f03f", effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: `i-${m}` }] }])));
const REF_SHA = sha256Hex(TRAJ);
function trajectoryInto(state: string, producedAt = DUE): void {
  const d = join(state, "state", "trajectory");
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, "reference.json"), TRAJ); writeFileSync(join(d, "rebase-trajectory.json"), TRAJ);
  writeFileSync(join(d, "produced.json"), JSON.stringify({ produced_at_ms: producedAt, sha256: REF_SHA }));
}
const produceFixture: Produce = (req) => { mkdirSync(req.outDir, { recursive: true }); writeFileSync(join(req.outDir, "rebase-trajectory.json"), TRAJ); return Promise.resolve(); };
const NO_COST = (): Promise<number> => Promise.resolve(0);
const TRAJ_FILE = join(base, "traj.json");
writeFileSync(TRAJ_FILE, TRAJ);
interface Opts { now?: number; probe?: boolean | "default"; runUnit?: RunUnit; env?: Record<string, string>; costGet?: () => Promise<number>; produce?: Produce; ref?: string }
function run(h: Host, argv: string[], o: Opts = {}): Promise<number> {
  const probe = o.probe ?? true, inner = o.runUnit ?? writes();
  const deps: TickDeps = { env: o.env ?? ENV, now: () => { h.nows++; return o.now ?? DUE; },
    runUnit: (req) => { h.calls.push({ mint: req.mint, window: req.window, maxPages: req.maxPages }); return inner(req); },
    produce: o.produce ?? produceFixture, costGet: o.costGet ?? NO_COST, refTrajSha256: o.ref ?? REF_SHA,
    out: (s) => { h.out.push(s); }, err: (s) => { h.err.push(s); }, ...(probe === "default" ? {} : { clockSynced: () => { h.probes++; return probe; } }) };
  return tickMain(argv, deps);
}
async function seeded(d = D): Promise<Host> {
  const h = host();
  assert.equal(await run(h, ["--seed", d, "--state", h.state]), 0, "seeded");
  trajectoryInto(h.state);
  return h;
}
const progressOf = (h: Host): Obj => readJson(join(h.state, "state", "progress.json"));
const attemptsPath = (h: Host): string => join(h.state, "state", "attempts.json");
const lastErr = (h: Host): string => h.err.at(-1) ?? "";

// killer: apps/bell/src/tick.ts:107 CONST "!form.includes(k) || " -> ""
test("bell_tick_refuses_unknown_argv", async () => {
  const h = host(), t = tickArgv(h);
  const bad = [[], ["--tick"], ["--tock", ...t.slice(1)], [...t, "--extra"], [...t, "--state", h.state], t.slice(0, -1), t.map((x) => (x === "--status" ? "--Status" : x)),
    ["--seed", "2026-10-03", "--state", h.state], ["--seed", D, "--state", h.state, "--handoff", h.handoff], ["--seed", "2027-01-04", "--state", h.state],
    ["--abandon", D, "--reason", "Not A Code", "--state", h.state, "--handoff", h.handoff], ["--abandon", D, "--state", h.state, "--handoff", h.handoff]];
  for (const argv of bad) assert.equal(await run(h, argv), 64, `usage: ${argv.join(" ")}`);
  assert.deepEqual([h.nows, h.probes, h.calls.length, readdirSync(h.state), h.out], [0, 0, 0, [], []], "64 before any clock read, probe, call or write");
  assert.ok(h.err.length === bad.length && h.err.every((l) => l.startsWith("bell/tick: refused usage: ")), h.err.join("\n"));
  const cli = spawnSync(process.execPath, [TICK, "--tick", "--bogus"], { encoding: "utf8", env: {} });
  assert.deepEqual([cli.status, cli.stdout, cli.stderr.startsWith("bell/tick: refused usage: ")], [64, "", true], `the command line exits 64: ${cli.stderr}`);
});

// killer: apps/bell/src/tick.ts:364 CONST "existsSync(p)" -> "false"
test("bell_tick_seed_refuses_when_progress_exists", async () => {
  const h = host(), p = join(h.state, "state", "progress.json");
  assert.equal(await run(h, ["--seed", D, "--state", h.state]), 0);
  const before = readFileSync(p, "utf8");
  assert.deepEqual(JSON.parse(before), { seed: D, last_unit: null, bundle: null, manifest_sha256: null });
  assert.equal(await run(h, ["--seed", "2026-10-05", "--state", h.state]), 1);
  assert.equal(lastErr(h), "bell/tick: refused seed_exists: state/progress.json exists");
  assert.deepEqual([readFileSync(p, "utf8"), h.nows], [before, 0], "never overwritten; the seed reads no clock");
});

// killer: apps/bell/src/tick.ts:314 CONST "existsSync(bundle) && existsSync(manifestPath)" -> "false"
test("bell_tick_is_idempotent", async () => {
  const h = await seeded(), name = `unit-${D}`;
  assert.equal(await run(h, tickArgv(h)), 0);
  const m = readFileSync(join(h.handoff, `${name}.manifest`), "utf8"), p = progressOf(h);
  assert.deepEqual(p, { seed: D, last_unit: D, bundle: name, manifest_sha256: sha256Hex(m) }, "the progress names the bundle and its manifest");
  assert.deepEqual(readManifest(m)?.map((e) => e.path), BELL_UNIVERSE.flatMap((x) => ["journal.json", "provenance.json", "state.json", "timeline.jsonl"].map((f) => `${x}/${f}`)).sort());
  assert.equal(await run(h, tickArgv(h)), 0, "replayed at the same instant");
  assert.match(h.out.at(-1) ?? "", /^bell\/tick: nothing_due unit-2026-10-05 due_at=/);
  writeFileSync(join(h.state, "state", "progress.json"), JSON.stringify({ seed: D, last_unit: null, bundle: null, manifest_sha256: null })); // a stop between the rename and the progress
  assert.equal(await run(h, tickArgv(h)), 0);
  assert.equal(h.out.at(-1), `bell/tick: already_deposited ${name}`);
  assert.deepEqual([h.calls.length, progressOf(h), readdirSync(h.handoff).sort()], [BELL_UNIVERSE.length, p, [name, `${name}.manifest`]], "no call, the same progress");
});

// killer: apps/bell/src/tick.ts:356 CONST "renameSync(tmp, bundle);" -> "advance(o.state, progress, u.d, name, manifest); renameSync(tmp, bundle);"
test("bell_tick_progress_moves_only_after_the_bundle_rename", async () => {
  // A directory unit-<D> already in the handoff, NOT empty and without its manifest: the tick runs, then the rename of .tmp-unit-<D> onto it
  // fails (win32: EPERM on any existing directory; POSIX rename(2): ENOTEMPTY or EEXIST on a non-empty one, an empty one would be replaced).
  const h = await seeded(), name = `unit-${D}`, bundle = join(h.handoff, name);
  mkdirSync(bundle); writeFileSync(join(bundle, "stray.json"), "{}");
  assert.equal(await run(h, tickArgv(h)), 1);
  assert.deepEqual([lastErr(h), h.calls.length], ["bell/tick: failed: Error", BELL_UNIVERSE.length], "every run made, then the rename throws");
  assert.deepEqual(progressOf(h), { seed: D, last_unit: null, bundle: null, manifest_sha256: null }, "the progress is untouched: it moves only after the rename");
  assert.deepEqual(readdirSync(bundle), ["stray.json"], "no bundle deposited");
  assert.deepEqual(readdirSync(join(h.handoff, `.tmp-${name}`)).sort(), [...BELL_UNIVERSE].sort(), "the runs stay in the temporary directory");
});

// killer: apps/bell/src/tick.ts:313 CONST "e.startsWith(\".tmp-unit-\")" -> "false"
test("bell_tick_removes_an_orphan_tmp", async () => {
  const h = await seeded(), orphan = join(h.handoff, `.tmp-unit-${D}`), older = join(h.handoff, ".tmp-unit-2026-10-01");
  mkdirSync(join(orphan, "TSLAx"), { recursive: true }); writeFileSync(join(orphan, "TSLAx", "state.json"), "{}"); writeFileSync(join(orphan, "stray.json"), "{}");
  mkdirSync(older);
  assert.equal(await run(h, tickArgv(h)), 0, lastErr(h));
  assert.deepEqual(readdirSync(h.handoff).sort(), [`unit-${D}`, `unit-${D}.manifest`], "both orphans are gone");
  assert.deepEqual(readdirSync(join(h.handoff, `unit-${D}`)).sort(), [...BELL_UNIVERSE].sort(), "nothing of the orphan entered the bundle");
});

// killer: apps/bell/src/tick.ts:346 CONST "first !== undefined" -> "false"
test("bell_tick_quarantines_refused_bundle_and_next_tick_proceeds", async () => {
  const h = await seeded(), q = join(h.state, "quarantine", D);
  assert.equal(await run(h, tickArgv(h), { runUnit: writes((r, mint) => { if (mint === "AAPLx") residual(r, "no_adv", 1); }) }), 1);
  assert.equal(lastErr(h), "bell/tick: refused check_failed:C04: AAPLx adv_month_not_covered");
  const stray: RunUnit = (req) => writes()(req).then((res) => { writeFileSync(join(req.outDir, "extra.json"), "{}"); return res; });
  assert.equal(await run(h, tickArgv(h), { now: DUE + HOUR, runUnit: stray }), 1);
  assert.match(lastErr(h), /^bell\/tick: refused prevalidation_refused:schema_mismatch: /);
  assert.deepEqual([readdirSync(q).sort(), readFileSync(join(q, "reason"), "utf8")], [["a1", "a2", "reason"], "a1 check_failed:C04\na2 prevalidation_refused:schema_mismatch\n"]);
  assert.deepEqual([readdirSync(join(q, "a1")).sort(), readdirSync(h.handoff), progressOf(h).last_unit], [[...BELL_UNIVERSE].sort(), [], null], "kept in quarantine, never deposited");
  assert.equal(await run(h, tickArgv(h), { now: DUE + 2 * HOUR }), 0, "the next tick proceeds");
  assert.deepEqual([progressOf(h).last_unit, readJson(attemptsPath(h))], [D, { [D]: 3 }]);
});

// killer: apps/bell/src/tick.ts:394 CONST "? 64 : 1" -> "? 64 : 0"
test("bell_tick_exits_nonzero_on_every_named_refusal", async () => {
  const seen = new Map<string, number>();
  const note = async (h: Host, p: Promise<number>): Promise<void> => {
    const code = await p, m = /^bell\/tick: refused ([a-z_]+)(?::[A-Za-z0-9_]+)?: /.exec(lastErr(h));
    assert.ok(m, `a named refusal: ${lastErr(h)}`); seen.set(m[1] ?? "", code);
  };
  let h = host(); await note(h, run(h, ["--tick"]));
  h = host(); await note(h, run(h, tickArgv(h)));
  h = await seeded(); await note(h, run(h, ["--seed", D, "--state", h.state]));
  h = await seeded(); await note(h, run(h, tickArgv(h), { env: { ...ENV, HELIUS_CYCLE_SHARE: "0" } }));
  const partial: Record<string, string> = { ...ENV }; delete partial.CHAINSTACK_CYCLE_SHARE;
  h = await seeded(); await note(h, run(h, tickArgv(h), { env: partial }));
  h = await seeded("2026-12-31"); await note(h, run(h, tickArgv(h), { now: Date.UTC(2027, 0, 10) }));
  h = await seeded(); await note(h, run(h, tickArgv(h), { probe: "default" }));
  h = await seeded(); await note(h, run(h, abandonArgv(h)));
  h = await seeded(); await note(h, run(h, tickArgv(h), { env: { ...ENV, HELIUS_CYCLE_ANCHOR_UTC: "2030-01-01T00:00:00Z" } }));
  h = await seeded(); await note(h, run(h, tickArgv(h), { env: { ...ENV, HELIUS_CYCLE_ANCHOR_UTC: "2026-09-05T09:30:00Z" } }));
  for (const r of ["cycle_share", "run_calls"]) { h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: () => Promise.reject(guardStop(r)) })); }
  const content: Array<(r: Run) => void> = [(r) => { residual(r, "no_quorum", 1); }, (r) => { const g = gapOf(r); delete g.gT; delete g.earliest_publish_utc; g.abstain = "no_close_ref"; },
    (r) => { residual(r, "cash_cross_mismatch", 1); },
    (r) => { const g = gapOf(r); delete g.gT; delete g.earliest_publish_utc; g.abstain = "no_adv"; (((r.state.digest as Obj).volume as Obj[])[0] ?? {}).session_date_et = "2027-01-05"; }];
  for (const mutate of content) { h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: writes((r) => { mutate(r); }) })); }
  h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: (req) => writes()(req).then((res) => { writeFileSync(join(req.outDir, "x.json"), "{}"); return res; }) }));
  h = await seeded();
  for (let i = 0; i < 8; i++) await run(h, tickArgv(h), { now: DUE + i * HOUR, runUnit: refusing("budget_stop") });
  await note(h, run(h, tickArgv(h), { now: DUE + 8 * HOUR }));
  // Lot 2c: the cost cap, the reference, an empty production, a leg off, a plain Error of the guard, each by the tick itself.
  h = await seeded(); await note(h, run(h, tickArgv(h), { costGet: () => Promise.resolve(2) }));
  h = await seeded(); await note(h, run(h, tickArgv(h), { ref: "0".repeat(64) }));
  h = await seeded(); await note(h, run(h, tickArgv(h), { now: DUE + 13 * HOUR, produce: () => Promise.resolve() }));
  h = await seeded(); writeFileSync(join(h.state, "state", "legs.json"), '{"massive":"off"}'); await note(h, run(h, tickArgv(h)));
  h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: () => Promise.reject(new Error("rpc-guard: no operators requested (cycles is empty, fail-closed)")) }));
  const viaSeam = TICK_REFUSALS.filter((c) => !seen.has(c));
  for (const c of viaSeam) { h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: refusing(c) })); }
  assert.ok(viaSeam.length <= 5,`refusals of later lots only reach the tick through the seam: ${viaSeam.join(" ")}`);
  assert.deepEqual([...seen.keys()].sort(), [...TICK_REFUSALS].sort(), "every name of the closed list is seen");
  assert.deepEqual([...seen].filter(([c, x]) => x !== (c === "usage" ? 64 : 1)), [], "usage exits 64, every other refusal 1, never 0");
});

// killer: apps/bell/src/tick.ts:311 CONST "plan.kind === \"nothing_due\"" -> "false"
test("bell_tick_unit_is_due_only_after_end_and_gates", async () => {
  const h = await seeded(), saturday16 = etWallClockToUtcMs(2026, 10, 3, 16, 0, 0);
  for (const now of [saturday16, DUE - 1]) assert.equal(await run(h, tickArgv(h), { now }), 0);
  assert.deepEqual([h.calls.length, existsSync(attemptsPath(h))], [0, false], "the gate of Saturday 16:00 ET is open, the unit ends Monday 04:00 ET: no call, no attempt");
  assert.deepEqual(h.out.slice(1), Array(2).fill("bell/tick: nothing_due unit-2026-10-02 due_at=2026-10-05T08:30:00.000Z"), "Monday 08:30Z: 04:30 ET in daylight time");
  assert.equal(await run(h, tickArgv(h), { now: DUE }), 0);
  const window = { from_utc_ms: U.startMs, to_utc_ms: U.endMs - 1000 };
  assert.deepEqual(h.calls, BELL_UNIVERSE.map((mint) => ({ mint, window, maxPages: BELL_RUN_CAPS.maxPages })), "one run per mint on the unit's window");
});

// killer: apps/bell/src/tick.ts:316 CONST "key = u.d" -> "key = String(now)"
test("bell_tick_attempt_budget_is_keyed_on_unit_start", async () => {
  const h = await seeded();
  for (const now of [DUE, DUE + 12 * HOUR + 15 * 60_000, DUE + 25 * HOUR]) assert.equal(await run(h, tickArgv(h), { now, runUnit: refusing("close_ref_pending") }), 1);
  assert.deepEqual(readJson(attemptsPath(h)), { [D]: 3 }, "three slots, one unit, one counter");
});

// killer: scripts/bell-deploy.mjs:17 CONST "ATTEMPT_BUDGET = 8" -> "ATTEMPT_BUDGET = 9"
test("bell_tick_stalls_by_name_after_budget", async () => {
  const h = await seeded();
  for (let i = 0; i < 8; i++) assert.equal(await run(h, tickArgv(h), { now: DUE + i * HOUR, runUnit: refusing("budget_stop") }), 1);
  assert.equal(h.calls.length, 8, "the 8th attempt is tried");
  assert.equal(await run(h, tickArgv(h), { now: DUE + 8 * HOUR }), 1);
  assert.deepEqual([h.calls.length, lastErr(h)], [8, `bell/tick: refused stalled_unit: unit-${D} after ${String(ATTEMPT_BUDGET)} attempts; abandon it by act`], "the 9th is not");
});

// killer: apps/bell/src/tick.ts:121 CONST "[!-~]{8,}" -> "[!-~]*"
test("bell_tick_refuses_missing_or_malformed_billing_env", async () => {
  const h = await seeded(), cases: Array<[string, string | undefined, string]> = [];
  for (const k of BELL_COLLECT_ENV_KEYS) cases.push([k, undefined, "env_missing"], [k, "", "env_malformed"]);
  cases.push(["HELIUS_CYCLE_SHARE", "0", "env_malformed"], ["CHAINSTACK_CYCLE_SHARE", "1.5", "env_malformed"], ["HELIUS_CYCLE_ANCHOR_UTC", "2026-09-19", "env_malformed"],
    ["CHAINSTACK_CYCLE_ANCHOR_UTC", "2026-09-19T00:00:00", "env_malformed"], ["BELL_SOLANA_RPC", "ftp-not-https", "env_malformed"], ["POLYGON_API_KEY", "two words", "env_malformed"]);
  for (const [k, v, code] of cases) {
    const env: Record<string, string> = { ...ENV };
    if (v === undefined) delete env[k]; else env[k] = v;
    assert.equal(await run(h, tickArgv(h), { env }), 1, k);
    assert.equal(lastErr(h), `bell/tick: refused ${code}: ${k}`, "the key is named, never its value");
  }
  assert.deepEqual([h.calls.length, h.probes, h.nows], [0, 0, 0], "refused before the probe and the clock");
  assert.equal(await run(h, tickArgv(h)), 0, "the complete environment passes");
});

// killer: apps/bell/src/tick.ts:306 CONST "!(deps.clockSynced ?? UNSYNCED)()" -> "false"
test("bell_tick_refuses_clock_unsynced", async () => {
  const h = await seeded();
  assert.equal(await run(h, tickArgv(h), { probe: "default" }), 1, "the default probe answers unsynced");
  assert.equal(await run(h, tickArgv(h), { probe: false }), 1);
  assert.deepEqual(h.err, Array(2).fill("bell/tick: refused clock_unsynced: the host clock is not synchronized"));
  assert.deepEqual([h.calls.length, h.nows, existsSync(attemptsPath(h)), readdirSync(h.handoff)], [0, 0, false, []], "read before the clock, any attempt, write or call");
  assert.equal(await run(h, tickArgv(h), { probe: true }), 0);
  assert.deepEqual([h.probes, h.nows], [2, 1], "one probe and one clock read per tick");
});

// killer: apps/bell/src/tick.ts:388 CONST "KEY_SHAPES.some((re) => re.test(s)) || " -> ""
test("bell_tick_never_prints_urls_or_keys", async () => {
  const h = await seeded(), secrets = [ENV.BELL_SOLANA_RPC, HKEY, ENV.CHAINSTACK_SOLANA_URL, ENV.DATABENTO_API_KEY, ENV.POLYGON_API_KEY].map(String);
  const leaks: RunUnit[] = [refusing("budget_stop", `HTTP 429 from ${secrets[0] ?? ""}`), refusing("lock_held", `held for ${HKEY}`),
    () => Promise.reject(new Error(`fetch failed: ${secrets[2] ?? ""}`)), () => Promise.reject(new TypeError(`bad key ${secrets[3] ?? ""}`)), refusing("leg_off", "see https://status.test.invalid/incident")];
  for (const [i, runUnit] of leaks.entries()) assert.equal(await run(h, tickArgv(h), { now: DUE + i * HOUR, runUnit }), 1);
  assert.deepEqual(h.err, ["bell/tick: refused budget_stop: (detail withheld)", "bell/tick: refused lock_held: (detail withheld)", "bell/tick: failed: Error", "bell/tick: failed: TypeError",
    "bell/tick: refused leg_off: (detail withheld)"]);
  assert.equal(await run(h, tickArgv(h), { now: DUE + 5 * HOUR }), 0);
  await run(h, tickArgv(h), { now: DUE + 5 * HOUR, env: { ...ENV, POLYGON_API_KEY: "" } });
  const lines = [...h.out, ...h.err];
  assert.deepEqual(secrets.map((s) => KEY_SHAPES.some((re) => re.test(s))), [true, false, true, true, false], "the fixture: three credential shapes, two bare keys");
  for (const l of lines) assert.ok(!KEY_SHAPES.some((re) => re.test(l)) && secrets.every((s) => !l.includes(s)), `no url, no key: ${l}`);
});

// killer: apps/bell/src/tick.ts:373 CONST " || (readAttempts(o.state)[o.d] ?? 0) < ATTEMPT_BUDGET" -> ""
test("bell_tick_abandon_writes_tombstone_and_advances_once", async () => {
  const h = await seeded(), t = `unit-${D}.abandoned`, jl = join(h.state, "state", "abandoned.jsonl");
  for (let i = 0; i < 7; i++) await run(h, tickArgv(h), { now: DUE + i * HOUR, runUnit: refusing("close_ref_missing") });
  assert.equal(await run(h, abandonArgv(h)), 1, "seven attempts: the unit is not stalled");
  assert.equal(lastErr(h), `bell/tick: refused abandon_refused: unit-${D} is not the stalled unit`);
  await run(h, tickArgv(h), { now: DUE + 7 * HOUR, runUnit: refusing("close_ref_missing") });
  assert.equal(await run(h, abandonArgv(h, "2026-10-05")), 1, "only the stalled unit");
  assert.equal(await run(h, abandonArgv(h)), 0, lastErr(h));
  const body = readFileSync(join(h.handoff, t), "utf8"), man = readFileSync(join(h.handoff, `${t}.manifest`), "utf8");
  assert.deepEqual([JSON.parse(body), readManifest(man)], [{ unit: D, reason: "close_ref_missing" }, [{ sha256: sha256Hex(body), path: t }]], "the tombstone and its manifest");
  assert.deepEqual(progressOf(h), { seed: D, last_unit: D, bundle: t, manifest_sha256: sha256Hex(man) });
  assert.equal(await run(h, abandonArgv(h)), 1, "advanced once");
  assert.equal(readFileSync(jl, "utf8"), `${JSON.stringify({ unit: D, reason: "close_ref_missing" })}\n`, "one reason line");
  assert.equal(await run(h, tickArgv(h), { now: DUE + 9 * HOUR }), 0);
  assert.match(h.out.at(-1) ?? "", /^bell\/tick: nothing_due unit-2026-10-05 /, "the tick goes on with the next unit");
});

/** The code of a source text, line by line (CLOSURE-COMMENT-FILTER-1): a line comment, a block comment and the lines inside it are dropped,
 *  the code after a closing star-slash is kept; a line that starts with "*" outside a block comment is code (a continued expression). */
function codeLines(text: string): string[] {
  let inBlock = false;
  const out: string[] = [];
  for (const line of text.split("\n")) {
    let rest = line;
    for (;;) {
      if (inBlock) { const e = rest.indexOf("*/"); if (e < 0) { rest = ""; break; } inBlock = false; rest = rest.slice(e + 2); }
      const t = rest.trimStart();
      if (t.startsWith("//")) { rest = ""; break; }
      if (!t.startsWith("/*")) break;
      inBlock = true; rest = t.slice(2);
    }
    if (rest.trim() !== "") out.push(rest);
  }
  return out;
}
/** The import closure of `entry` under `root`: relative imports AND @monark package imports, resolved through the package.json of each
 *  directory of <root>/packages (its exports), with the problems of each file: an import of the publisher or of child_process, a read of the signing credential or of process.env. */
function importClosure(root: string, entry: string): { rel: string[]; problems: string[] } {
  const pkgs = new Map<string, { dir: string; exports: Record<string, string> }>();
  for (const d of readdirSync(join(root, "packages"))) {
    const p = join(root, "packages", d, "package.json");
    if (!existsSync(p)) continue;
    const j = JSON.parse(readFileSync(p, "utf8")) as { name: string; exports: Record<string, string> };
    pkgs.set(j.name, { dir: join(root, "packages", d), exports: j.exports });
  }
  const resolveSpec = (from: string, s: string): string => {
    if (s.startsWith(".")) return join(dirname(from), s);
    const m = /^(@monark\/[^/]+)(\/.+)?$/.exec(s), p = pkgs.get(m?.[1] ?? ""), t = p?.exports[m?.[2] === undefined ? "." : `.${m[2]}`];
    assert.ok(p !== undefined && t !== undefined, `the package import ${s} resolves in packages/`);
    return join(p.dir, t);
  };
  const seen = new Set<string>(), todo = [entry], problems: string[] = [];
  for (let f = todo.pop(); f !== undefined; f = todo.pop()) {
    if (seen.has(f)) continue;
    seen.add(f);
    const text = readFileSync(f, "utf8"), r = relative(root, f).split(sep).join("/");
    for (const m of text.matchAll(/^\s*(?:import|export)\s[^;]*?from\s+"((?:\.{1,2}\/|@monark\/)[^"]+)"/gm)) todo.push(resolveSpec(f, m[1] ?? ""));
    const specs = [...text.matchAll(/(?:\bfrom\s+|\bimport\s*\(?\s*|\brequire\s*\(\s*)["'`]([^"'`]+)["'`]/g)].map((m) => m[1] ?? "");
    for (const s of specs) if (s.endsWith("bell-publish.mjs") || /^(?:node:)?child_process$/.test(s)) problems.push(`${r} imports ${s}`);
    if (text.includes("CREDENTIALS_" + "DIRECTORY")) problems.push(`${r} reads the signing credential`);
    // A comment reads nothing; the one read a file may hold is its command-line entry, run only when that file is launched: tick.ts,
    // and collect.ts, whose runMain the tick calls (lot 2b-ii).
    const env = codeLines(text).filter((l) => /\bprocess\s*(?:\.\s*env\b|\[\s*["'`]env["'`])/.test(l));
    const entryLine = (l: string): boolean => (r === "apps/bell/src/tick.ts" && l.includes("tickMain(process.argv.slice(2), { env: process.env,"))
      || (r === "apps/bell/src/collect.ts" && l.includes("await runMain(process.argv.slice(2), { databentoGet, polygonGet, env: process.env,"));
    if (env.length > (env.length === 1 && env.every(entryLine) ? 1 : 0)) problems.push(`${r} reads process.env`);
  }
  return { rel: [...seen].map((f) => relative(root, f).split(sep).join("/")).sort(), problems };
}

// killer: apps/bell/src/tick.ts:31 CONST "bell-validate.mjs" -> "bell-publish.mjs"
test("bell_tick_closure_excludes_the_publisher", () => {
  // The closure follows relative imports AND @monark/* package imports, resolved through <root>/packages/*/package.json (its exports).
  const { rel, problems } = importClosure(REPO, TICK);
  for (const f of ["apps/bell/scripts/bell-validate.mjs", "apps/bell/src/checks.ts", "apps/bell/src/plan.ts", "scripts/bell-deploy.mjs", "packages/rpc-guard/src/index.ts",
    "packages/rpc-guard/src/transport.ts", "apps/bell/src/collect.ts", "packages/rpc-guard/src/cycle.ts", "apps/bell/src/trajectory-check.ts"]) assert.ok(rel.includes(f), `the closure holds ${f}`);
  assert.deepEqual(rel.filter((f) => f.endsWith("bell-publish.mjs")), [], "the tick never loads the publisher");
  assert.deepEqual(problems, [], "no file of the closure, packages included, imports the publisher or child_process, reads the signing credential or the environment");
  assert.equal(readFileSync(TICK, "utf8").split("process.env").length, 2, "process.env once, at the command-line entry of tick.ts");
  // The guard on a synthetic tree: a package reached only through @monark/*, then one relative step, is walked and named.
  const t = tmp("bell-closure-"), w = (p: string, s: string): void => { mkdirSync(dirname(join(t, p)), { recursive: true }); writeFileSync(join(t, p), s); };
  w("packages/p/package.json", JSON.stringify({ name: "@monark/p", exports: { ".": "./src/index.ts" } }));
  w("packages/p/src/index.ts", 'export { x } from "./a.ts";\n');
  w("packages/p/src/a.ts", 'import { spawn } from "node:child_process";\nimport "../../../bell-publish.mjs";\nexport const x = process.env.HOME ?? process.env["CREDENTIALS_' + 'DIRECTORY"];\n');
  w("app/e.ts", 'import { x } from "@monark/p";\nexport const y = x;\n');
  assert.deepEqual(importClosure(t, join(t, "app", "e.ts")), { rel: ["app/e.ts", "packages/p/src/a.ts", "packages/p/src/index.ts"],
    problems: ["packages/p/src/a.ts imports node:child_process", "packages/p/src/a.ts imports ../../../bell-publish.mjs", "packages/p/src/a.ts reads the signing credential",
      "packages/p/src/a.ts reads process.env"] }, "the package is followed and every forbidden form is named");
});

// killer: apps/bell/src/tick.ts:86 CONST "export const UNSYNCED = (): boolean => false;" -> "export const UNSYNCED = (): boolean => false && 1\n  * Number(process.env.HOME) > 0;"
test("bell_tick_closure_reads_a_code_line_that_starts_with_a_star", () => {
  const t = tmp("bell-closure-star-"), w = (p: string, s: string): void => { mkdirSync(dirname(join(t, p)), { recursive: true }); writeFileSync(join(t, p), s); };
  w("packages/.keep", "");
  w("app/e.ts", ["/**", " * process.env.HOME is named in a comment block", " */", "/* process.env.A */ export const a = 1;", "// process.env.B",
    "export const b = 2", "  * Number(process.env.HOME);", ""].join("\n"));
  assert.deepEqual(codeLines(readFileSync(join(t, "app", "e.ts"), "utf8")).map((l) => l.trim()), ["export const a = 1;", "export const b = 2", "* Number(process.env.HOME);"],
    "the comment block, the inline block and the line comment are dropped; the continued expression is code");
  assert.deepEqual(importClosure(t, join(t, "app", "e.ts")).problems, ["app/e.ts reads process.env"], "a code line that starts with * is never hidden");
  const { rel, problems } = importClosure(REPO, TICK);
  assert.deepEqual([rel.includes("apps/bell/src/trajectory-check.ts"), problems], [true, []], "the tick's closure, its trajectory check included, reads no environment but at its entry");
});

// killer: apps/bell/scripts/bell-validate.mjs:150 CONST "r[1-9]" -> "r[0-9]"
test("bell_unit_name_grammar_and_manifest_roundtrip", () => {
  const ok = ["unit-2026-10-02", "unit-2026-10-02-r1", "unit-2026-10-02-r9", "unit-2026-10-02-r10", "unit-2026-10-02-r99"];
  const no = ["unit-2026-10-02-r0", "unit-2026-10-02-r01", "unit-2026-10-02-r100", "unit-2026-1-02", ".tmp-unit-2026-10-02", "unit-2026-10-02.manifest", "unit-2026-10-02.abandoned", "unit-2026-10-02-r", "Unit-2026-10-02"];
  assert.deepEqual([ok.map((n) => UNIT_NAME.test(n)), no.map((n) => UNIT_NAME.test(n))], [ok.map(() => true), no.map(() => false)]);
  const dir = tmp("bell-manifest-"), files: Record<string, string> = { "b/x.json": "1", "B.json": "2", "a.b": "3", "a/c": "4", "a/b/d": "5" };
  for (const [p, text] of Object.entries(files)) { mkdirSync(join(dir, ...p.split("/").slice(0, -1)), { recursive: true }); writeFileSync(join(dir, ...p.split("/")), text); }
  const m = manifestOf(dir);
  assert.deepEqual(readManifest(m), ["B.json", "a.b", "a/b/d", "a/c", "b/x.json"].map((p) => ({ sha256: sha256Hex(files[p] ?? ""), path: p })), "byte order, relative paths, read back equal");
  assert.equal(m.split("\n")[0], `${sha256Hex("2")}  B.json`, "two spaces between the digest and the path");
  const lines = m.split("\n");
  // the "." and ".." forms keep the byte order (b/ sorts last), so only the segment rule refuses them; the seventh form repeats the last line
  const malformed = [m.slice(0, -1), [lines[1], lines[0], ...lines.slice(2)].join("\n"), m.replace("b/x.json", "b/../x.json"), m.replace("b/x.json", "b/./x.json"),
    m.replace(/^[0-9a-f]/, "A"), m.replace("  B.json", " B.json"), `${m}${lines.at(-2) ?? ""}\n`, ""];
  assert.deepEqual(malformed.map((x) => readManifest(x)), malformed.map(() => null), "any other form is refused");
});

// ---- Lot 2b-ii: the tick wired to the real runMain under the guard ----
const HELIUS_HOST = "helius.example.invalid", CS_HOST = "cs-sol.example.invalid";
const RPC_ENV: Record<string, string> = { ...ENV, BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, CHAINSTACK_SOLANA_URL: `https://${CS_HOST}/${"c".repeat(32)}` };
const CYCLES = { helius: "helius-2026-09-19", chainstack: "chainstack-2026-09-19" };
/** globalThis.fetch answers every JSON-RPC call with an empty enumeration and no mint: a run spends a few paid calls; each host is noted. */
async function withRpc<T>(body: (hosts: string[]) => Promise<T>): Promise<T> {
  const real = globalThis.fetch, hosts: string[] = [];
  globalThis.fetch = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    hosts.push(new URL(String(input)).hostname);
    const m = (JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method?: string }).method;
    const result = m === "getSignaturesForAddress" ? [] : m === "getAccountInfo" ? { context: { slot: 1 }, value: null } : null;
    return Promise.resolve(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } }));
  }) as typeof globalThis.fetch;
  try { return await body(hosts); } finally { globalThis.fetch = real; }
}
/** The tick as the command line runs it: no runUnit (the real runMain), a synced probe, the clock and the output captured. */
const runReal = (h: Host, o: { now?: number; env?: Record<string, string> } = {}): Promise<number> =>
  tickMain(tickArgv(h), { env: o.env ?? RPC_ENV, now: () => o.now ?? DUE, clockSynced: () => true, costGet: NO_COST, refTrajSha256: REF_SHA, out: (s) => { h.out.push(s); }, err: (s) => { h.err.push(s); } });
const capture = (seen: RunUnitRequest[]): RunUnit => (req) => { seen.push(req); return Promise.reject(new TickRefusal("leg_off", "captured")); };
const reqOf = (over: Partial<RunUnitRequest> = {}): RunUnitRequest => ({ mint: "TSLAx", window: { from_utc_ms: U.startMs, to_utc_ms: U.endMs - 1000 }, maxPages: BELL_RUN_CAPS.maxPages,
  outDir: "out", ledgerDir: "ledger", env: ENV, cycles: CYCLES, nowMs: DUE, onLocks: () => undefined, trajectory: TRAJ_FILE, ...over });
const flagOf = (argv: readonly string[], k: string): string | undefined => argv[argv.indexOf(k) + 1];
const ledgerLines = (p: string): Obj[] => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj) : []);

// killer: apps/bell/src/tick.ts:141 CONST "nowMs + TICK_TIMEOUT_START_SEC * 1000 >= " -> "nowMs >= "
test("bell_tick_derives_cycle_per_operator_and_refuses_straddle", async () => {
  assert.equal(typeof deploy.TICK_TIMEOUT_START_SEC, "number", "the declared bound of a tick's run time (TimeoutStartSec)");
  const T = deploy.TICK_TIMEOUT_START_SEC * 1000, HB = Date.UTC(2026, 9, 19), CB = Date.UTC(2026, 9, 19, 2); // the next starts: 00:00Z and 04:00+02:00
  const later = { ...ENV, HELIUS_CYCLE_ANCHOR_UTC: "2026-09-25T00:00:00Z" }, east = { ...ENV, CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T01:00:00+02:00" };
  const cases: Array<[number, Record<string, string>, Record<string, string> | string]> = [
    [HB - T - 1, ENV, CYCLES], [HB - T, ENV, "helius"],
    [CB - T - 1, later, { helius: "helius-2026-09-25", chainstack: "chainstack-2026-09-19" }], [CB - T, later, "chainstack"],
    [CB, later, { helius: "helius-2026-09-25", chainstack: "chainstack-2026-10-19" }],
    [DUE, east, { helius: "helius-2026-09-19", chainstack: "chainstack-2026-09-19" }]];
  for (const [now, env, want] of cases) {
    const h = await seeded(), seen: RunUnitRequest[] = [];
    assert.equal(await run(h, tickArgv(h), { now, env, runUnit: capture(seen) }), 1);
    if (typeof want === "string") {
      assert.match(lastErr(h), new RegExp(`^bell/tick: refused cycle_boundary_straddle: ${want}: `), `${new Date(now).toISOString()}: the tick may outlive the ${want} cycle`);
      assert.deepEqual([seen.length, existsSync(attemptsPath(h))], [0, false], "refused before any attempt or run");
    } else assert.deepEqual(seen.map((r) => r.cycles), BELL_UNIVERSE.slice(0, 1).map(() => want), `${new Date(now).toISOString()}: one cycle per operator, in its own offset`);
  }
  const hu = await seeded();
  assert.equal(await run(hu, tickArgv(hu), { env: { ...ENV, CHAINSTACK_CYCLE_ANCHOR_UTC: "2030-01-01T00:00:00+02:00" } }), 1);
  assert.deepEqual([lastErr(hu), existsSync(attemptsPath(hu))], ["bell/tick: refused cycle_unknown: chainstack: cycle: the instant precedes the anchor", false], "no cycle before the anchor");
});

// killer: apps/bell/src/tick.ts:155 CONST "\"--shares\", kv(sharesOf(req.env, operators)), \"--floor\", kv(pick(BELL_FLOORS, operators))" -> "\"--floor\", kv(sharesOf(req.env, operators))"
test("bell_tick_stops_cleanly_at_its_declared_share", async () => {
  const h = await seeded(), led = (op: "helius" | "chainstack"): string => join(h.root, "ledger", CYCLES[op], `${op}.jsonl`);
  const [code, heliusCalls] = await withRpc(async (hosts) => [await runReal(h, { env: { ...RPC_ENV, HELIUS_CYCLE_SHARE: "1" } }), hosts.filter((x) => x === HELIUS_HOST).length]);
  assert.deepEqual([code, lastErr(h)], [1, "bell/tick: refused share_exhausted: rpc-guard: cycle_share (fail-closed)"], h.err.join("\n"));
  const lines = ledgerLines(led("helius")), att = lines.filter((l) => l.outcome === "attempted");
  assert.deepEqual([att.length, heliusCalls, att.reduce((n, l) => n + Number(l.credits_derived), 0)], [1, 1, 1], "one helius call of 1 credit, its whole share; no call beyond it");
  assert.deepEqual(lines.filter((l) => l.outcome !== "attempted").map((l) => [l.outcome, l.reason ?? null]), [["refused", "cycle_share"], ["unlocked", "bell/collect: course end (finally, N unlock)"]]);
  assert.deepEqual(["helius", "chainstack"].map((op) => existsSync(join(h.root, "ledger", CYCLES[op as "helius"], `${op}.lock`))), [false, false], "locks released on the stop");
  assert.ok(existsSync(led("chainstack")), "chainstack writes its own derived cycle");
  assert.deepEqual([progressOf(h).last_unit, readJson(attemptsPath(h)), readdirSync(h.handoff).filter((e) => !e.startsWith(".tmp-"))], [null, { [D]: 1 }, []], "an attempt, nothing deposited");
});

// killer: scripts/bell-deploy.mjs:24 CONST "Object.freeze({ helius: 0, chainstack: 0 })" -> "Object.freeze({ helius: 100000, chainstack: 50000 })"
test("bell_tick_passes_floor_zero_and_its_share", () => {
  assert.equal(typeof tickMod.unitArgv, "function", "the tick builds runMain's argv");
  assert.deepEqual([deploy.BELL_FLOORS, Object.isFrozen(deploy.BELL_FLOORS)], [{ helius: 0, chainstack: 0 }, true], "A-6: the floor of Bell's host is zero, its share is its only bound");
  const argv = tickMod.unitArgv(reqOf()), at = (k: string): string | undefined => flagOf(argv, k);
  assert.deepEqual(["--floor", "--shares", "--cycles", "--operators", "--pools", "--from-utc", "--to-utc", "--max-pages", "--out", "--ledger-dir"].map(at),
    ["helius=0,chainstack=0", "helius=100000,chainstack=50000", "helius=helius-2026-09-19,chainstack=chainstack-2026-09-19", "helius,chainstack", "TSLAx",
      String(U.startMs), String(U.endMs - 1000), String(BELL_RUN_CAPS.maxPages), "out", "ledger"]);
  assert.deepEqual(["--max-calls", "--max-credits", "--max-ru", "--method-caps"].map(at), [String(BELL_RUN_CAPS.maxCalls), String(BELL_RUN_CAPS.maxCredits), String(BELL_RUN_CAPS.maxRu),
    "getSignaturesForAddress=20000,getTransaction=150000,getAccountInfo=20,getTransactionsForAddress=1"]);
  assert.deepEqual(argv.filter((a) => a.startsWith("--")).length, new Set(argv.filter((a) => a.startsWith("--"))).size, "each flag once");
  assert.deepEqual(["--cycle", "--eth"].map((k) => argv.includes(k)), [false, false], "the per-operator form only, no ETH leg");
  const p = parseArgs(argv, ["TSLAx", "AAPLx"], DUE);
  assert.deepEqual([p.floors, p.shares, p.opCycles, p.operators], [{ helius: 0, chainstack: 0 }, { helius: 100000, chainstack: 50000 }, CYCLES, ["helius", "chainstack"]], "runMain's parser reads them back");
});

// killer: apps/bell/src/tick.ts:148 CONST "operators.map((op) => [op, Number(env[keyOf(op, \"SHARE\")])])" -> "BELL_OPERATORS.map((op) => [op, Number(env[keyOf(op, \"SHARE\")])])"
test("bell_tick_builds_cycle_share_from_requested_operators_only", async () => {
  assert.equal(typeof tickMod.unitArgv, "function");
  const h = host(), out = join(h.root, "out-helius"), ledgerDir = join(h.root, "ledger");
  const argv = tickMod.unitArgv(reqOf({ outDir: out, ledgerDir, env: RPC_ENV }), ["helius"]);
  assert.deepEqual(["--operators", "--shares", "--cycles", "--floor"].map((k) => flagOf(argv, k)), ["helius", "helius=100000", "helius=helius-2026-09-19", "helius=0"], "both shares in the environment, one forwarded");
  const deps = { databentoGet: (() => Promise.resolve([])) as DatabentoGet, polygonGet: (() => Promise.resolve({ results: [] })) as PolygonGet, env: RPC_ENV, nowMs: DUE };
  const settle = (a: string[]): Promise<unknown> => withRpc(async () => { try { await runMain(a, deps); return undefined; } catch (e) { return e; } });
  assert.equal(await settle(argv), undefined, "a helius-only run with its own share passes the guard");
  const forwarded = argv.map((a, i) => (argv[i - 1] === "--shares" ? `${a},chainstack=50000` : a));
  const e = await settle(forwarded);
  assert.ok(e instanceof BudgetExceededError && /cycle share for 'chainstack' names no paid operator of this course/.test(e.message), `a forwarded chainstack share is refused by name: ${String(e)}`);
  assert.equal(existsSync(join(ledgerDir, "helius-2026-09-19", "helius.lock")), false, "refused before any lock");
});

// killer: apps/bell/src/tick.ts:213 CONST "? \"share_exhausted\" : \"budget_stop\"" -> "? \"budget_stop\" : \"share_exhausted\""
test("bell_tick_renders_guard_errors_by_name", async () => {
  const cases: Array<[Error, string]> = [[guardStop("cycle_share"), "bell/tick: refused share_exhausted: rpc-guard: cycle_share (fail-closed)"],
    [guardStop("run_calls"), "bell/tick: refused budget_stop: rpc-guard: run_calls (fail-closed)"],
    [new BudgetExceededError("rpc-guard: cycle_share (fail-closed)"), "bell/tick: refused budget_stop: rpc-guard: cycle_share (fail-closed)"], // the text alone names nothing
    [new BudgetExceededError("rpc-guard: cycle share for 'chainstack' names no paid operator of this course, fail-closed"),
      "bell/tick: refused budget_stop: rpc-guard: cycle share for 'chainstack' names no paid operator of this course, fail-closed"],
    [new RangeError("not a guard error"), "bell/tick: failed: RangeError"]];
  for (const [e, line] of cases) {
    const h = await seeded();
    assert.equal(await run(h, tickArgv(h), { runUnit: () => Promise.reject(e) }), 1);
    assert.equal(lastErr(h), line);
  }
  const h = await seeded(), held = join(h.root, "ledger", CYCLES.helius);
  mkdirSync(held); writeFileSync(join(held, "helius.lock"), "{}");
  assert.equal(await withRpc(() => runReal(h)), 1);
  assert.match(lastErr(h), /^bell\/tick: refused lock_held: rpc-guard: operator 'helius' is already locked for this cycle/, "a real LockHeldError of the guard");
  assert.deepEqual([existsSync(join(held, "helius.lock")), existsSync(join(h.root, "ledger", CYCLES.chainstack, "chainstack.lock"))], [true, false], "the held lock is another's; ours is rolled back");
});

// killer: apps/bell/src/tick.ts:332 CONST "env: narrowed" -> "env: deps.env"
test("bell_tick_hands_rununit_only_the_collect_env_keys", async () => {
  const h = await seeded(), seen: RunUnitRequest[] = [];
  const env = { ...ENV, CHAINSTACK_ETH_URL: "https://eth.test.invalid/x", HOME: "/home/bell", GITHUB_TOKEN: "t".repeat(24) };
  assert.equal(await run(h, tickArgv(h), { env, runUnit: capture(seen) }), 1);
  assert.deepEqual(seen.map((r) => Object.keys(r.env).sort()), [[...BELL_COLLECT_ENV_KEYS].sort()], "the closed key list only (RUNUNIT-ENV-NARROW-1)");
  assert.deepEqual(seen[0]?.env, Object.fromEntries(BELL_COLLECT_ENV_KEYS.map((k) => [k, ENV[k]])), "with their values");
  assert.equal(seen[0]?.env.BELL_HALTS_CSV, HALTS, "the halts file is one of them (BELL-TICK-HALTS-ENV-1)");
});

// killer: apps/bell/src/tick.ts:356 CONST "rmSync(manifestPath, { force: true }); " -> ""
test("bell_tick_second_tick_after_a_failed_rename_never_answers_already_deposited", async () => {
  const h = await seeded(), name = `unit-${D}`, bundle = join(h.handoff, name);
  mkdirSync(bundle); writeFileSync(join(bundle, "stray.json"), "{}");
  assert.equal(await run(h, tickArgv(h)), 1);
  assert.deepEqual([lastErr(h), existsSync(`${bundle}.manifest`)], ["bell/tick: failed: Error", false], "the rename threw: the manifest goes with it");
  assert.equal(await run(h, tickArgv(h), { now: DUE + HOUR }), 1, "the next tick refuses or deposits again");
  assert.deepEqual([h.out.filter((l) => l.includes("already_deposited")), lastErr(h), progressOf(h).last_unit], [[], "bell/tick: failed: Error", null],
    "never already_deposited on a directory that no manifest describes (TICK-MANIFEST-BEFORE-RENAME-1)");
});

const CHILD = [`import { tickMain } from ${JSON.stringify(pathToFileURL(TICK).href)};`, "const c = JSON.parse(process.env.BELL_TICK_CHILD ?? '{}');",
  "let told = false;", "globalThis.fetch = () => { if (!told) { told = true; process.stderr.write('rpc-held' + String.fromCharCode(10)); } return new Promise(() => {}); };",
  "setInterval(() => {}, 60000);", "process.exitCode = await tickMain(c.argv, { env: c.env, now: () => c.now, clockSynced: () => true, costGet: () => Promise.resolve(0), refTrajSha256: c.ref });",
  "process.exit();"].join("\n");
// killer: apps/bell/src/tick.ts:336 SDL "process.on(\"SIGTERM\", onTerm);" -> ""
test("bell_tick_releases_locks_on_sigterm", { skip: process.platform === "win32" ? "win32 delivers no SIGTERM to a handler: not concluded here, run under Linux in g3-verification" : false }, async () => {
  const h = await seeded(), ledger = join(h.root, "ledger");
  const child = spawn(process.execPath, ["--input-type=module", "-e", CHILD], { env: { BELL_TICK_CHILD: JSON.stringify({ argv: tickArgv(h), env: RPC_ENV, now: DUE, ref: REF_SHA }) }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  const exited = new Promise<[number | null, string | null]>((res) => { child.on("exit", (code, sig) => { res([code, sig]); }); });
  await new Promise<void>((res, rej) => {
    const t = setTimeout(() => { child.kill("SIGKILL"); rej(new Error(`no RPC call within 60 s: ${stderr}`)); }, 60_000);
    child.stderr.on("data", (b: Buffer) => { stderr += String(b); if (stderr.includes("rpc-held")) { clearTimeout(t); res(); } });
  });
  const lockOf = (op: "helius" | "chainstack"): string => join(ledger, CYCLES[op], `${op}.lock`);
  assert.deepEqual([existsSync(lockOf("helius")), existsSync(lockOf("chainstack"))], [true, true], "both locks held while the call hangs");
  child.kill("SIGTERM");
  const [code, sig] = await exited;
  assert.deepEqual([code, sig], [1, null], `the handler exits 1, the signal never kills: ${stderr}`);
  assert.match(stderr, /^bell\/tick: refused sigterm: /m);
  for (const op of ["helius", "chainstack"] as const) {
    assert.equal(existsSync(lockOf(op)), false, `${op}.lock released`);
    assert.deepEqual(ledgerLines(join(ledger, CYCLES[op], `${op}.jsonl`)).filter((l) => l.outcome === "unlocked").map((l) => l.reason), ["bell/tick: sigterm"], `${op}: one unlocked line, the handler's`);
  }
});

// killer: apps/bell/src/tick.ts:349 CONST "process.off(\"SIGTERM\", onTerm);" -> ""
test("bell_tick_sigterm_handler_is_set_for_the_runs_only", async () => {
  const base = process.listenerCount("SIGTERM"), during: number[] = [], handed: string[] = [];
  for (const inner of [writes(), refusing("budget_stop")]) {
    const h = await seeded();
    await run(h, tickArgv(h), { runUnit: (req) => { during.push(process.listenerCount("SIGTERM")); handed.push(typeof req.onLocks); return inner(req); } });
    assert.equal(process.listenerCount("SIGTERM"), base, "removed when the tick ends, deposited or refused: no handler outlives its tick");
  }
  assert.deepEqual([during, handed], [[base + 1, base + 1, base + 1], ["function", "function", "function"]], "set before each run (before any lock), each run handed its re-arm callback");
});

// killer: apps/bell/src/tick.ts:168 CONST "onLocks: req.onLocks" -> "onLocks: undefined"
test("bell_tick_run_main_unit_hands_its_release_and_reads_each_cycle_ledger", async () => {
  assert.equal(typeof tickMod.runMainUnit, "function", "the production run of the tick");
  const h = host(), ledgerDir = join(h.root, "ledger"), handed: boolean[][] = [];
  const lock = (op: "helius" | "chainstack"): string => join(ledgerDir, CYCLES[op], `${op}.lock`);
  const res = await withRpc(() => tickMod.runMainUnit(reqOf({ outDir: join(h.root, "out", "TSLAx"), ledgerDir, env: RPC_ENV,
    onLocks: () => { handed.push([existsSync(lock("helius")), existsSync(lock("chainstack"))]); } })));
  assert.deepEqual(handed, [[true, true]], "the release is handed once, both locks held");
  for (const op of ["helius", "chainstack"] as const) {
    const lines = (res.ledger[op] ?? []) as Obj[];
    assert.deepEqual([lines.length > 0, lines.every((l) => l.cycle_id === CYCLES[op]), lines.at(-1)?.outcome, existsSync(lock(op))], [true, true, "unlocked", false],
      `${op}: the lines of its own derived cycle, read after the release`);
  }
  assert.ok(existsSync(join(h.root, "out", "TSLAx", "state.json")), "runMain wrote the run under --out");
});
