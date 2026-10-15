// MONARK Bell -- the collection tick reads the handoff's state (lot 3b-i of part 3, PLAN-P3 C3-7 and C3-8, G0 DC-3 and DC-4): the
// publisher's refusals (refused.jsonl) make the tick collect the unit again as unit-<D>-r<n>, within the budget of <D> and before the next
// unit; past the budget it refuses publisher_refused:<code>; the backlog of units deposited after the start mark and not yet published
// refuses handoff_backlog above 8, disarmed until published.jsonl holds a line; the purge removes, seven days after the fact that allows
// it, only what the five rules of DC-4 allow, nothing before the mark. Every case goes through tickMain, the command line's own entry; the
// deposits of the recollection test are the tick's own (runs re-sealed from a REAL runMain output, as in tick.test.ts), the other bundles are
// declared fixtures (a directory and its manifest by manifestOf). Injected: the clock, the clock probe, runUnit, the production, the cost
// query, the reference's sha256. No network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ATTEMPT_BUDGET, BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN } from "../../../scripts/bell-deploy.mjs";
import { lineHash, sha256Hex } from "../scripts/bell-chain.mjs";
import { manifestOf } from "../scripts/bell-validate.mjs";
import { bellSha } from "../src/digest.ts";
import { dueInstant, unitOf } from "../src/plan.ts";
import { nextTradingDay } from "../src/sessions.ts";
import { TickRefusal, tickMain, type Produce, type RunUnit, type TickDeps } from "../src/tick.ts";
import { readJson, runMainInto, tmp, type Obj } from "./helpers/bell-served.ts";

const base = tmp("bell-handoff-"), good = join(base, "good");
mkdirSync(join(base, "w"));
await runMainInto(good, join(base, "w"));

type Window = { from_utc_ms: number; to_utc_ms: number };
interface Run { state: Obj; journal: Obj; provenance: Obj; timeline: Obj[] }
const HOUR = 3_600_000, DAY = 24 * HOUR, WEEK = 7 * DAY;
const due = (d: string): number => dueInstant(unitOf(d), UNIT_DUE_MARGIN_MIN);
const iso = (ms: number): string => new Date(ms).toISOString();
/** The trading days from `d` on, `n` of them. */
const days = (d: string, n: number): string[] => Array.from({ length: n }, (_, i) => i).reduce<string[]>((a) => [...a, a.length === 0 ? d : nextTradingDay(a.at(-1) ?? d)], []);
const readRun = (dir: string): Run => ({ state: readJson(join(dir, "state.json")), journal: readJson(join(dir, "journal.json")), provenance: readJson(join(dir, "provenance.json")),
  timeline: readFileSync(join(dir, "timeline.jsonl"), "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Obj) });
const residual = (r: Run, k: string, v: number): void => { (r.state.residuals as Obj)[k] = v; ((r.state.digest as Obj).residuals as Obj)[k] = v; };
/** The clean run of tick.test.ts for `mint` on `window`: the real runMain output cleaned of its two abstentions, re-sealed and re-chained. */
function writeRun(dir: string, mint: string, window: Window): void {
  const r = JSON.parse(JSON.stringify(readRun(good)).replaceAll('"TSLAx"', JSON.stringify(mint))) as Run, dg = r.state.digest as Obj;
  dg.gaps = (dg.gaps as Obj[]).filter((g) => g.abstain !== "no_close_ref");
  dg.volume = (dg.volume as Obj[]).filter((v) => v.session_date_et !== "2026-08-14");
  residual(r, "no_close_ref", 0); residual(r, "no_adv", 0);
  r.state.window = window;
  r.state.bell_sha = bellSha(dg as Parameters<typeof bellSha>[0]); r.provenance.bellSha = r.state.bell_sha;
  r.timeline.forEach((l, i) => { l.prev_line_hash = i === 0 ? "0".repeat(64) : lineHash(r.timeline[i - 1]); });
  mkdirSync(dir, { recursive: true });
  for (const k of ["state", "journal", "provenance"] as const) writeFileSync(join(dir, `${k}.json`), JSON.stringify(r[k], null, 2));
  writeFileSync(join(dir, "timeline.jsonl"), r.timeline.map((l) => JSON.stringify(l) + "\n").join(""));
}
const LEDGER = { helius: [{ outcome: "attempted", by_op_method: { "helius|getSignaturesForAddress": 1 }, credits_derived: 1 }, { outcome: "unlocked" }],
  chainstack: [{ outcome: "attempted", by_op_method: { "chainstack|getTransaction": 1 }, credits_derived: 1 }, { outcome: "unlocked" }] };
const writes: RunUnit = (req) => { writeRun(req.outDir, req.mint, req.window); return Promise.resolve({ ledger: LEDGER }); };
const refusing: RunUnit = () => Promise.reject(new TickRefusal("close_ref_missing", "refused by the test"));

const HKEY = ["0".repeat(8), "1".repeat(4), "2".repeat(4), "3".repeat(4), "4".repeat(12)].join("-");
const ENV: Record<string, string> = { BELL_SOLANA_RPC: "https://rpc.test.invalid", HELIUS_API_KEY: HKEY, CHAINSTACK_SOLANA_URL: `https://cs.test.invalid/${"a".repeat(32)}`,
  DATABENTO_API_KEY: `db${"-"}${"b".repeat(29)}`, POLYGON_API_KEY: "p".repeat(32), HELIUS_CYCLE_ANCHOR_UTC: "2026-09-19T00:00:00Z",
  CHAINSTACK_CYCLE_ANCHOR_UTC: "2026-09-19T04:00:00+02:00", HELIUS_CYCLE_SHARE: "100000", CHAINSTACK_CYCLE_SHARE: "50000",
  BELL_HALTS_CSV: join(import.meta.dirname, "fixtures", "halts-tsla-synth.csv") };
const TRAJ = JSON.stringify(Object.fromEntries(BELL_UNIVERSE.map((m) => [m, { scanComplete: true, scanMethod: "authority", events: [{ kind: "initialize", multiplier: "1",
  multiplierBitsHex: "000000000000f03f", effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: `i-${m}` }] }])));
const produce: Produce = (req) => { mkdirSync(req.outDir, { recursive: true }); writeFileSync(join(req.outDir, "rebase-trajectory.json"), TRAJ); return Promise.resolve(); };

interface Host { root: string; state: string; handoff: string; status: string; calls: Window[]; out: string[]; err: string[] }
async function seeded(d: string): Promise<Host> {
  const root = tmp("bell-handoff-host-");
  for (const x of ["collect", "handoff", "status", "ledger"]) mkdirSync(join(root, x));
  const h: Host = { root, state: join(root, "collect"), handoff: join(root, "handoff"), status: join(root, "status"), calls: [], out: [], err: [] };
  assert.equal(await tickMain(["--seed", d, "--state", h.state], { env: ENV, now: () => 0 }), 0);
  const t = join(h.state, "state", "trajectory");
  mkdirSync(t);
  writeFileSync(join(t, "reference.json"), TRAJ); writeFileSync(join(t, "rebase-trajectory.json"), TRAJ);
  writeFileSync(join(t, "produced.json"), JSON.stringify({ produced_at_ms: 0, sha256: sha256Hex(TRAJ) }));
  return h;
}
function run(h: Host, now: number, runUnit: RunUnit = writes): Promise<number> {
  const deps: TickDeps = { env: ENV, now: () => now, clockSynced: () => true, produce, costGet: () => Promise.resolve(0), refTrajSha256: sha256Hex(TRAJ),
    runUnit: (req) => { h.calls.push(req.window); return runUnit(req); }, out: (s) => { h.out.push(s); }, err: (s) => { h.err.push(s); } };
  return tickMain(["--tick", "--state", h.state, "--handoff", h.handoff, "--status", h.status, "--ledger-dir", join(h.root, "ledger")], deps);
}
const lastErr = (h: Host): string => h.err.at(-1) ?? "";
const lastOut = (h: Host): string => h.out.at(-1) ?? "";
const windowOf = (d: string): Window => { const u = unitOf(d); return { from_utc_ms: u.startMs, to_utc_ms: u.endMs - 1000 }; };
const progressOf = (h: Host): Obj => readJson(join(h.state, "state", "progress.json"));
const attemptsOf = (h: Host): Obj => readJson(join(h.state, "state", "attempts.json"));
/** The handoff's state as the publisher writes it (the forms of MISSION-3b-i, C3-8). */
const mark = (h: Host, from: string, at: number): void => { writeFileSync(join(h.status, "start"), `${JSON.stringify({ from_unit: from, posted_at: iso(at) })}\n`); };
const shaOf = (h: Host, name: string): string => sha256Hex(readFileSync(join(h.handoff, `${name}.manifest`), "utf8"));
const published = (h: Host, name: string, at: number, seq = 1): void => {
  appendFileSync(join(h.status, "published.jsonl"), `${JSON.stringify({ bundle: name, manifest_sha256: shaOf(h, name), seq, published_at: iso(at) })}\n`);
};
const refused = (h: Host, name: string, code: string, at: number): void => {
  appendFileSync(join(h.status, "refused.jsonl"), `${JSON.stringify({ bundle: name, manifest_sha256: shaOf(h, name), code, refused_at: iso(at) })}\n`);
};
/** A declared fixture bundle: one file under <mint>/, then its sibling manifest, as the tick deposits it. */
function bundle(h: Host, name: string): void {
  mkdirSync(join(h.handoff, name, "TSLAx"), { recursive: true });
  writeFileSync(join(h.handoff, name, "TSLAx", "state.json"), JSON.stringify({ name }));
  writeFileSync(join(h.handoff, `${name}.manifest`), manifestOf(join(h.handoff, name)));
}
/** The progress of a tick whose last deposit is `last` (the units before it are fixtures of the test). */
const progressAt = (h: Host, seed: string, last: string): void => {
  writeFileSync(join(h.state, "state", "progress.json"), `${JSON.stringify({ seed, last_unit: last, bundle: `unit-${last}`, manifest_sha256: "0".repeat(64) })}\n`);
};
const abandoned = (h: Host, d: string, at: number): void => {
  appendFileSync(join(h.state, "state", "abandoned.jsonl"), `${JSON.stringify({ unit: d, reason: "close_ref_missing", abandoned_at: iso(at) })}\n`);
};
const listing = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir).sort() : []);

// killer: apps/bell/src/tick.ts:388 CONST "if (re === null) " -> ""
test("bell_tick_recollects_a_unit_the_publisher_refused", async () => {
  const [D, D2, D3, D4] = days("2026-10-02", 4) as [string, string, string, string], h = await seeded(D);
  mark(h, D, due(D) - HOUR);
  assert.deepEqual([await run(h, due(D)), await run(h, due(D2))], [0, 0], h.err.join("\n"));
  const p2 = progressOf(h);
  assert.equal(p2.last_unit, D2, "two units deposited, the progress past D");
  refused(h, `unit-${D}`, "bell_sha_mismatch", due(D2) + HOUR);
  h.calls.length = 0;
  assert.equal(await run(h, due(D3)), 0, lastErr(h));
  assert.match(lastOut(h), new RegExp(`^bell/tick: deposited unit-${D}-r1 manifest_sha256=[0-9a-f]{64}$`), "the refused unit is collected again, before the next unit D3, due too");
  assert.deepEqual(h.calls, BELL_UNIVERSE.map(() => windowOf(D)), "on the window of D");
  assert.deepEqual([attemptsOf(h), progressOf(h)], [{ [D]: 2, [D2]: 1 }, p2], "within the budget of D; the progress never moves back");
  assert.ok(existsSync(join(h.handoff, `unit-${D}-r1`)) && existsSync(join(h.handoff, `unit-${D}-r1.manifest`)), "the revision is deposited with its manifest");
  assert.equal(await run(h, due(D3) + HOUR), 0, lastErr(h));
  assert.match(lastOut(h), new RegExp(`^bell/tick: deposited unit-${D3} `), "a revision not refused: the next unit follows");
  refused(h, `unit-${D}-r1`, "window_overlaps_published", due(D3) + 2 * HOUR);
  assert.equal(await run(h, due(D3) + 3 * HOUR), 0, lastErr(h));
  assert.match(lastOut(h), new RegExp(`^bell/tick: deposited unit-${D}-r2 `), "the last revision refused: r2");
  published(h, `unit-${D}-r2`, due(D3) + 4 * HOUR);
  refused(h, `unit-${D2}`, "bell_sha_mismatch", due(D3) + 4 * HOUR); // a refusal of a unit published since is never collected again
  published(h, `unit-${D2}`, due(D3) + 5 * HOUR, 2);
  assert.equal(await run(h, due(D3) + 6 * HOUR), 0, lastErr(h));
  assert.match(lastOut(h), new RegExp(`^bell/tick: nothing_due unit-${D4} `));
  assert.deepEqual([attemptsOf(h), progressOf(h).last_unit], [{ [D]: 3, [D2]: 1, [D3]: 1 }, D3]);
});

// killer: apps/bell/src/tick.ts:347 CONST " && re !== null" -> " && false"
test("bell_tick_refuses_publisher_refused_when_the_unit_budget_is_spent", async () => {
  const [D, D2] = days("2026-10-02", 2) as [string, string], h = await seeded(D);
  mark(h, D, due(D) - HOUR);
  assert.equal(await run(h, due(D)), 0, lastErr(h));
  refused(h, `unit-${D}`, "window_overlaps_published", due(D) + HOUR);
  for (let i = 2; i <= ATTEMPT_BUDGET; i++) assert.equal(await run(h, due(D2) + i * HOUR, refusing), 1, `attempt ${String(i)} of the recollection`);
  assert.deepEqual([h.calls.length, h.calls.at(-1), attemptsOf(h)], [BELL_UNIVERSE.length + ATTEMPT_BUDGET - 1, windowOf(D), { [D]: ATTEMPT_BUDGET }]);
  assert.equal(await run(h, due(D2) + 12 * HOUR), 1);
  assert.equal(lastErr(h), `bell/tick: refused publisher_refused:window_overlaps_published: unit-${D}-r1 would collect unit-${D} again, its budget of ${String(ATTEMPT_BUDGET)} attempts spent`);
  assert.deepEqual([h.calls.length, attemptsOf(h), progressOf(h).last_unit], [BELL_UNIVERSE.length + ATTEMPT_BUDGET - 1, { [D]: ATTEMPT_BUDGET }, D], "no call, no attempt, the next unit D2 not collected");
});

// killer: apps/bell/src/handoff-status.ts:116 CONST "d < s.from_unit" -> "d >= s.from_unit"
test("bell_tick_prunes_only_what_the_rules_allow", async () => {
  // P before the mark; M3 the mark, abandoned; M published; M2 refused, its r1 published 1 ms short of seven days; M4 after the mark, never
  // published (the killer case: an old bundle the rules never allow to remove).
  const [P, M3, M, M2, M4] = days("2026-09-14", 5) as [string, string, string, string, string], h = await seeded(P), T = due(M4) + HOUR;
  for (const n of [`unit-${P}`, `unit-${P}-r1`, `unit-${M3}`, `unit-${M}`, `unit-${M2}`, `unit-${M2}-r1`, `unit-${M4}`]) bundle(h, n);
  writeFileSync(join(h.handoff, `unit-${M3}.abandoned`), `${JSON.stringify({ unit: M3, reason: "close_ref_missing" })}\n`);
  writeFileSync(join(h.handoff, `unit-${M3}.abandoned.manifest`), "0".repeat(64) + `  unit-${M3}.abandoned\n`);
  for (const d of [P, M3, M, M2, M4]) { mkdirSync(join(h.state, "quarantine", d, "a1"), { recursive: true }); writeFileSync(join(h.state, "quarantine", d, "reason"), "a1 check_failed:C04\n"); }
  progressAt(h, P, M4);
  refused(h, `unit-${M3}`, "bell_sha_mismatch", T - WEEK - 2 * DAY);
  abandoned(h, M3, T - WEEK - DAY);
  published(h, `unit-${M}`, T - WEEK);
  refused(h, `unit-${M2}`, "bell_sha_mismatch", T - WEEK);
  published(h, `unit-${M2}-r1`, T - WEEK + 1, 2);
  const handoff0 = listing(h.handoff), quarantine0 = listing(join(h.state, "quarantine"));
  const kept = (dir: string): string => listing(dir).map((f) => `${f}=${statSync(join(dir, f)).isFile() ? sha256Hex(readFileSync(join(dir, f))) : "dir"}`).join(",");
  const status0 = kept(h.status);
  assert.equal(await run(h, T), 0, lastErr(h));
  assert.deepEqual([listing(h.handoff), listing(join(h.state, "quarantine"))], [handoff0, quarantine0], "no start mark: nothing is removed, though every rule would allow it at T");
  mark(h, M3, T - WEEK - 3 * DAY);
  const state0 = kept(join(h.state, "state")), status1 = kept(h.status);
  assert.equal(await run(h, T), 0, lastErr(h));
  assert.match(lastOut(h), new RegExp(`^bell/tick: nothing_due unit-${nextTradingDay(M4)} `), "the purge prints nothing of its own");
  assert.deepEqual(listing(h.handoff), [`unit-${M2}`, `unit-${M2}-r1`, `unit-${M2}-r1.manifest`, `unit-${M2}.manifest`, `unit-${M4}`, `unit-${M4}.manifest`],
    "removed: before the mark (P, P-r1), published (M, at exactly seven days), refused of an abandoned D (M3), the tombstone before a published unit; kept: M2 and its r1 (1 ms short), M4 (never)");
  assert.deepEqual(listing(join(h.state, "quarantine")), [M2, M4], "quarantine/<D>/ under the condition of its D");
  assert.deepEqual([kept(join(h.state, "state")), kept(h.status), status1 === status0], [state0, status1, false], "never state/, never the handoff's state");
  assert.equal(await run(h, T + 1), 0, lastErr(h));
  assert.deepEqual(listing(h.handoff), [`unit-${M4}`, `unit-${M4}.manifest`], "one ms later M2 and its revision go, the manifests with them; M4 stays");
  assert.deepEqual(listing(join(h.state, "quarantine")), [M4]);
});

// killer: apps/bell/src/handoff-status.ts:84 CONST " && !gone.has(d)" -> ""
test("bell_tick_backlog_counts_units_after_the_mark", async () => {
  const [B0, B1, ...after] = days("2026-08-27", 12) as [string, string, ...string[]], from = after[0] ?? "", last = after.at(-1) ?? "", h = await seeded(B0);
  for (const d of [B0, B1, ...after]) bundle(h, `unit-${d}`);
  bundle(h, `unit-${last}-r1`); // a revision of a counted unit counts once
  mkdirSync(join(h.handoff, `unit-${nextTradingDay(last)}`)); // a directory without its manifest is not deposited
  mark(h, from, due(B1));
  published(h, `unit-${from}`, due(from));
  progressAt(h, B0, last);
  assert.equal(after.length - 1, 9, "nine units after the mark, deposited and not published; two before it");
  assert.equal(await run(h, due(last) + HOUR), 1);
  assert.equal(lastErr(h), `bell/tick: refused handoff_backlog: 9 units from unit-${from} on await publication, above 8`);
  assert.deepEqual([h.calls.length, existsSync(join(h.state, "state", "attempts.json"))], [0, false], "refused without collecting");
  abandoned(h, after[3] ?? "", due(last));
  assert.equal(await run(h, due(last) + HOUR), 0, lastErr(h));
  assert.match(lastOut(h), new RegExp(`^bell/tick: nothing_due unit-${nextTradingDay(last)} `), "an abandoned unit is not counted: eight, not above 8");
});

// killer: apps/bell/src/handoff-status.ts:102 CONST " || v.published.length === 0" -> ""
test("bell_tick_backlog_is_disarmed_before_the_first_publication", async () => {
  const after = days("2026-09-01", 10), from = after[0] ?? "", last = after.at(-1) ?? "", h = await seeded(from);
  for (const d of after) bundle(h, `unit-${d}`);
  mark(h, from, due(from) - DAY);
  progressAt(h, from, last);
  writeFileSync(join(h.status, "published.jsonl"), "");
  assert.equal(await run(h, due(last) + HOUR), 0, lastErr(h));
  assert.match(lastOut(h), new RegExp(`^bell/tick: nothing_due `), "ten units after the mark, none published: the backlog is disarmed");
  published(h, `unit-${from}`, due(last));
  assert.equal(await run(h, due(last) + HOUR), 1, "armed by the first publication");
  assert.equal(lastErr(h), `bell/tick: refused handoff_backlog: 9 units from unit-${from} on await publication, above 8`);
});

// killer: apps/bell/src/handoff-status.ts:57 CONST " && isIso(o.published_at)" -> ""
test("bell_tick_refuses_an_unreadable_handoff_state", async () => {
  const [D] = days("2026-10-02", 1) as [string], h = await seeded(D), T = due(D) - HOUR;
  const P = (f: string): string => (f === "abandoned.jsonl" ? join(h.state, "state", f) : join(h.status, f));
  const line = { start: { from_unit: D, posted_at: iso(T) }, "published.jsonl": { bundle: `unit-${D}`, manifest_sha256: "a".repeat(64), seq: 1, published_at: iso(T) },
    "refused.jsonl": { bundle: `unit-${D}`, manifest_sha256: "a".repeat(64), code: "bell_sha_mismatch", refused_at: iso(T) },
    "abandoned.jsonl": { unit: D, reason: "close_ref_missing", abandoned_at: iso(T) } } as const;
  for (const [f, ok] of Object.entries(line)) writeFileSync(P(f), `${JSON.stringify(ok)}\n`);
  assert.equal(await run(h, T), 0, lastErr(h));
  const bad: Array<[string, string]> = [["start", "{\"from_unit\":\"2026-10-02\"}\n"], ["published.jsonl", `${JSON.stringify({ ...line["published.jsonl"], published_at: undefined })}\n`],
    ["published.jsonl", `${JSON.stringify(line["published.jsonl"])}\n{"bundle":"unit-2026-10-0`], ["refused.jsonl", `${JSON.stringify({ ...line["refused.jsonl"], code: "Not A Code" })}\n`],
    ["refused.jsonl", `${JSON.stringify({ ...line["refused.jsonl"], bundle: "unit-2026-10-02.abandoned" })}\n`], ["abandoned.jsonl", "not json\n"]];
  for (const [f, text] of bad) {
    writeFileSync(P(f), text);
    assert.equal(await run(h, T), 1, f);
    assert.equal(lastErr(h), `bell/tick: refused state_missing: ${f} is malformed`, "the file is named, never its content");
    writeFileSync(P(f), `${JSON.stringify(line[f as keyof typeof line])}\n`);
  }
  rmSync(h.status, { recursive: true });
  assert.equal(await run(h, T), 1);
  assert.equal(lastErr(h), "bell/tick: refused state_missing: the status directory is missing");
  assert.equal(h.calls.length, 0, "refused before any call");
});

// killer: apps/bell/src/tick.ts:408 CONST "(parse(l) as { unit?: unknown } | null)?.unit === o.d" -> "l === o.d"
test("bell_tick_abandon_records_its_instant_once", async () => {
  const [D] = days("2026-10-02", 1) as [string], h = await seeded(D), jl = join(h.state, "state", "abandoned.jsonl"), p = join(h.state, "state", "progress.json");
  for (let i = 0; i < ATTEMPT_BUDGET; i++) assert.equal(await run(h, due(D) + i * HOUR, refusing), 1);
  const before = readFileSync(p, "utf8"), at = due(D) + 9 * HOUR, argv = ["--abandon", D, "--reason", "close_ref_missing", "--state", h.state, "--handoff", h.handoff];
  const act = (now: number): Promise<number> => tickMain(argv, { env: ENV, now: () => now, out: (s) => { h.out.push(s); }, err: (s) => { h.err.push(s); } });
  assert.equal(await act(at), 0, lastErr(h));
  const line = `${JSON.stringify({ unit: D, reason: "close_ref_missing", abandoned_at: iso(at) })}\n`;
  assert.equal(readFileSync(jl, "utf8"), line, "the reason line carries the act's instant, by the injected clock");
  writeFileSync(p, before); // a stop between the reason line and the progress: the act runs again
  assert.equal(await act(at + HOUR), 0, lastErr(h));
  assert.equal(readFileSync(jl, "utf8"), line, "one line per unit: the second act keeps the first instant");
});
