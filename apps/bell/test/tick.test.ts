// MONARK Bell -- the shell of the collection tick (apps/bell/src/tick.ts): closed argv, seed, idempotence, orphan removal, quarantine,
// attempt budget keyed on the unit, abandon, environment and clock refusals, output hygiene, import closure; and the unit name grammar
// and the manifest of bell-validate.mjs. The runs the injected runUnit writes are REAL runMain outputs (helpers/bell-served.ts) cleaned of
// their two abstentions as in checks.test.ts, then re-windowed on the unit, re-symboled per mint, re-sealed and re-chained: each passes
// checkRun and validateBundle as a production run would. Only the clock, the clock probe and runUnit are injected. No network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { ATTEMPT_BUDGET, BELL_COLLECT_ENV_KEYS, BELL_RUN_CAPS, BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
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
// Credential-shaped values built at run time (never a literal of this file): a Helius-shaped key, a key-in-path endpoint, a db- key.
const HKEY = ["0".repeat(8), "1".repeat(4), "2".repeat(4), "3".repeat(4), "4".repeat(12)].join("-");
const ENV: Record<string, string> = { BELL_SOLANA_RPC: `https://rpc.test.invalid/?api-key=${HKEY}`, HELIUS_API_KEY: HKEY,
  CHAINSTACK_SOLANA_URL: `https://solana-mainnet.core.${"chain"}stack.com/${"a".repeat(32)}`, DATABENTO_API_KEY: `db${"-"}${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32),
  HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z", CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T04:00:00+02:00", HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000" };

interface Host { root: string; state: string; handoff: string; calls: Array<{ mint: string; window: Window; maxPages: number }>; out: string[]; err: string[]; nows: number; probes: number }
function host(): Host {
  const root = tmp("bell-tick-host-");
  for (const d of ["collect", "handoff", "status", "ledger"]) mkdirSync(join(root, d));
  return { root, state: join(root, "collect"), handoff: join(root, "handoff"), calls: [], out: [], err: [], nows: 0, probes: 0 };
}
const tickArgv = (h: Host): string[] => ["--tick", "--state", h.state, "--handoff", h.handoff, "--status", join(h.root, "status"), "--ledger-dir", join(h.root, "ledger")];
const abandonArgv = (h: Host, d = D): string[] => ["--abandon", d, "--reason", "close_ref_missing", "--state", h.state, "--handoff", h.handoff];
interface Opts { now?: number; probe?: boolean | "default"; runUnit?: RunUnit; env?: Record<string, string> }
function run(h: Host, argv: string[], o: Opts = {}): Promise<number> {
  const probe = o.probe ?? true, inner = o.runUnit ?? writes();
  const deps: TickDeps = { env: o.env ?? ENV, now: () => { h.nows++; return o.now ?? DUE; },
    runUnit: (req) => { h.calls.push({ mint: req.mint, window: req.window, maxPages: req.maxPages }); return inner(req); },
    out: (s) => { h.out.push(s); }, err: (s) => { h.err.push(s); }, ...(probe === "default" ? {} : { clockSynced: () => { h.probes++; return probe; } }) };
  return tickMain(argv, deps);
}
async function seeded(d = D): Promise<Host> {
  const h = host();
  assert.equal(await run(h, ["--seed", d, "--state", h.state]), 0, "seeded");
  return h;
}
const progressOf = (h: Host): Obj => readJson(join(h.state, "state", "progress.json"));
const attemptsPath = (h: Host): string => join(h.state, "state", "attempts.json");
const lastErr = (h: Host): string => h.err.at(-1) ?? "";

// killer: apps/bell/src/tick.ts:79 CONST "!form.includes(k) || " -> ""
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

// killer: apps/bell/src/tick.ts:177 CONST "existsSync(p)" -> "false"
test("bell_tick_seed_refuses_when_progress_exists", async () => {
  const h = host(), p = join(h.state, "state", "progress.json");
  assert.equal(await run(h, ["--seed", D, "--state", h.state]), 0);
  const before = readFileSync(p, "utf8");
  assert.deepEqual(JSON.parse(before), { seed: D, last_unit: null, bundle: null, manifest_sha256: null });
  assert.equal(await run(h, ["--seed", "2026-10-05", "--state", h.state]), 1);
  assert.equal(lastErr(h), "bell/tick: refused seed_exists: state/progress.json exists");
  assert.deepEqual([readFileSync(p, "utf8"), h.nows], [before, 0], "never overwritten; the seed reads no clock");
});

// killer: apps/bell/src/tick.ts:152 CONST "existsSync(bundle) && existsSync(manifestPath)" -> "false"
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

// killer: apps/bell/src/tick.ts:169 CONST "renameSync(tmp, bundle);" -> "advance(o.state, progress, u.d, name, manifest); renameSync(tmp, bundle);"
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

// killer: apps/bell/src/tick.ts:151 CONST "e.startsWith(\".tmp-unit-\")" -> "false"
test("bell_tick_removes_an_orphan_tmp", async () => {
  const h = await seeded(), orphan = join(h.handoff, `.tmp-unit-${D}`), older = join(h.handoff, ".tmp-unit-2026-10-01");
  mkdirSync(join(orphan, "TSLAx"), { recursive: true }); writeFileSync(join(orphan, "TSLAx", "state.json"), "{}"); writeFileSync(join(orphan, "stray.json"), "{}");
  mkdirSync(older);
  assert.equal(await run(h, tickArgv(h)), 0, lastErr(h));
  assert.deepEqual(readdirSync(h.handoff).sort(), [`unit-${D}`, `unit-${D}.manifest`], "both orphans are gone");
  assert.deepEqual(readdirSync(join(h.handoff, `unit-${D}`)).sort(), [...BELL_UNIVERSE].sort(), "nothing of the orphan entered the bundle");
});

// killer: apps/bell/src/tick.ts:161 CONST "first !== undefined" -> "false"
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

// killer: apps/bell/src/tick.ts:207 CONST "? 64 : 1" -> "? 64 : 0"
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
  const content: Array<(r: Run) => void> = [(r) => { residual(r, "no_quorum", 1); }, (r) => { const g = gapOf(r); delete g.gT; delete g.earliest_publish_utc; g.abstain = "no_close_ref"; },
    (r) => { residual(r, "cash_cross_mismatch", 1); },
    (r) => { const g = gapOf(r); delete g.gT; delete g.earliest_publish_utc; g.abstain = "no_adv"; (((r.state.digest as Obj).volume as Obj[])[0] ?? {}).session_date_et = "2027-01-05"; }];
  for (const mutate of content) { h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: writes((r) => { mutate(r); }) })); }
  h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: (req) => writes()(req).then((res) => { writeFileSync(join(req.outDir, "x.json"), "{}"); return res; }) }));
  h = await seeded();
  for (let i = 0; i < 8; i++) await run(h, tickArgv(h), { now: DUE + i * HOUR, runUnit: refusing("budget_stop") });
  await note(h, run(h, tickArgv(h), { now: DUE + 8 * HOUR }));
  const viaSeam = TICK_REFUSALS.filter((c) => !seen.has(c));
  for (const c of viaSeam) { h = await seeded(); await note(h, run(h, tickArgv(h), { runUnit: refusing(c) })); }
  assert.ok(viaSeam.length <= 14, `refusals of later lots only reach the tick through the seam: ${viaSeam.join(" ")}`);
  assert.deepEqual([...seen.keys()].sort(), [...TICK_REFUSALS].sort(), "every name of the closed list is seen");
  assert.deepEqual([...seen].filter(([c, x]) => x !== (c === "usage" ? 64 : 1)), [], "usage exits 64, every other refusal 1, never 0");
});

// killer: apps/bell/src/tick.ts:149 CONST "plan.kind === \"nothing_due\"" -> "false"
test("bell_tick_unit_is_due_only_after_end_and_gates", async () => {
  const h = await seeded(), saturday16 = etWallClockToUtcMs(2026, 10, 3, 16, 0, 0);
  for (const now of [saturday16, DUE - 1]) assert.equal(await run(h, tickArgv(h), { now }), 0);
  assert.deepEqual([h.calls.length, existsSync(attemptsPath(h))], [0, false], "the gate of Saturday 16:00 ET is open, the unit ends Monday 04:00 ET: no call, no attempt");
  assert.deepEqual(h.out.slice(1), Array(2).fill("bell/tick: nothing_due unit-2026-10-02 due_at=2026-10-05T08:30:00.000Z"), "Monday 08:30Z: 04:30 ET in daylight time");
  assert.equal(await run(h, tickArgv(h), { now: DUE }), 0);
  const window = { from_utc_ms: U.startMs, to_utc_ms: U.endMs - 1000 };
  assert.deepEqual(h.calls, BELL_UNIVERSE.map((mint) => ({ mint, window, maxPages: BELL_RUN_CAPS.maxPages })), "one run per mint on the unit's window");
});

// killer: apps/bell/src/tick.ts:153 CONST "key = u.d" -> "key = String(now)"
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

// killer: apps/bell/src/tick.ts:93 CONST "[!-~]{8,}" -> "[!-~]*"
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

// killer: apps/bell/src/tick.ts:144 CONST "!(deps.clockSynced ?? UNSYNCED)()" -> "false"
test("bell_tick_refuses_clock_unsynced", async () => {
  const h = await seeded();
  assert.equal(await run(h, tickArgv(h), { probe: "default" }), 1, "the default probe answers unsynced");
  assert.equal(await run(h, tickArgv(h), { probe: false }), 1);
  assert.deepEqual(h.err, Array(2).fill("bell/tick: refused clock_unsynced: the host clock is not synchronized"));
  assert.deepEqual([h.calls.length, h.nows, existsSync(attemptsPath(h)), readdirSync(h.handoff)], [0, 0, false, []], "read before the clock, any attempt, write or call");
  assert.equal(await run(h, tickArgv(h), { probe: true }), 0);
  assert.deepEqual([h.probes, h.nows], [2, 1], "one probe and one clock read per tick");
});

// killer: apps/bell/src/tick.ts:201 CONST "KEY_SHAPES.some((re) => re.test(s)) || " -> ""
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

// killer: apps/bell/src/tick.ts:186 CONST " || (readAttempts(o.state)[o.d] ?? 0) < ATTEMPT_BUDGET" -> ""
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

// killer: apps/bell/src/tick.ts:19 CONST "bell-validate.mjs" -> "bell-publish.mjs"
test("bell_tick_closure_excludes_the_publisher", () => {
  // The closure follows relative imports AND @monark/* package imports, resolved through <root>/packages/*/package.json (its exports).
  const closure = (root: string, entry: string): { rel: string[]; problems: string[] } => {
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
      const env = text.split("\n").filter((l) => /\bprocess\s*(?:\.\s*env\b|\[\s*["'`]env["'`])/.test(l));
      const entryLine = (l: string): boolean => r === "apps/bell/src/tick.ts" && l.includes("tickMain(process.argv.slice(2), { env: process.env,");
      if (env.length > (env.length === 1 && env.every(entryLine) ? 1 : 0)) problems.push(`${r} reads process.env`);
    }
    return { rel: [...seen].map((f) => relative(root, f).split(sep).join("/")).sort(), problems };
  };
  const { rel, problems } = closure(REPO, TICK);
  for (const f of ["apps/bell/scripts/bell-validate.mjs", "apps/bell/src/checks.ts", "apps/bell/src/plan.ts", "scripts/bell-deploy.mjs", "packages/rpc-guard/src/index.ts",
    "packages/rpc-guard/src/transport.ts"]) assert.ok(rel.includes(f), `the closure holds ${f}`);
  assert.deepEqual(rel.filter((f) => f.endsWith("bell-publish.mjs")), [], "the tick never loads the publisher");
  assert.deepEqual(problems, [], "no file of the closure, packages included, imports the publisher or child_process, reads the signing credential or the environment");
  assert.equal(readFileSync(TICK, "utf8").split("process.env").length, 2, "process.env once, at the command-line entry of tick.ts");
  // The guard on a synthetic tree: a package reached only through @monark/*, then one relative step, is walked and named.
  const t = tmp("bell-closure-"), w = (p: string, s: string): void => { mkdirSync(dirname(join(t, p)), { recursive: true }); writeFileSync(join(t, p), s); };
  w("packages/p/package.json", JSON.stringify({ name: "@monark/p", exports: { ".": "./src/index.ts" } }));
  w("packages/p/src/index.ts", 'export { x } from "./a.ts";\n');
  w("packages/p/src/a.ts", 'import { spawn } from "node:child_process";\nimport "../../../bell-publish.mjs";\nexport const x = process.env.HOME ?? process.env["CREDENTIALS_' + 'DIRECTORY"];\n');
  w("app/e.ts", 'import { x } from "@monark/p";\nexport const y = x;\n');
  assert.deepEqual(closure(t, join(t, "app", "e.ts")), { rel: ["app/e.ts", "packages/p/src/a.ts", "packages/p/src/index.ts"],
    problems: ["packages/p/src/a.ts imports node:child_process", "packages/p/src/a.ts imports ../../../bell-publish.mjs", "packages/p/src/a.ts reads the signing credential",
      "packages/p/src/a.ts reads process.env"] }, "the package is followed and every forbidden form is named");
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
