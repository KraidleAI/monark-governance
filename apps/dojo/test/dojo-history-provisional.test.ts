// MONARK Dojo -- FAST-START (G1 journal docs/G1-lot-fast-start.md, 2026-10-01): the provisional mode of the history collector.
// --provisional-day P, exclusive of --first-read, runs the same course for a day P read nowhere, never ahead of the clock: D_LAST = P - 1,
// S_CUT = --cut (a finalized slot given by the operator), both pinned in the first journal line; phase C writes provisional/eve.json alone
// (provisionalEve of history-build.ts), never publish/, so the publisher's --history (dojo-publish.mjs, readHistory) cannot read such a
// state. Over the simulated chain of PR-2b-3 (helpers/history-chain.ts, imported first: no socket, no name resolution) and the REAL guard
// on a temporary ledger, the clock injected. The expected Eve is recoded HERE from the chain's truth balances (the oracle of
// test/dojo-history-e2e.test.ts, declared duplicate), never read from the collector. This file holds no backslash (byte guard).
import { HOSTS, MINT, firstReadDay, rowsAt, sim, world, type Tx } from "./helpers/history-chain.ts";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { DOJO_PUBLISH_REFUSALS, publishAnchor, publishHistory } from "../scripts/dojo-publish.mjs";
import { initSeed } from "../scripts/dojo-seed.mjs";
import { DOJO_VERIFY_REFUSALS } from "../scripts/dojo-verify.mjs";
import { READ_RULE } from "../src/dojo-methods.ts";
import { DOJO_HISTORY_BUILD_STOPS } from "../src/history-build.ts";
import { DOJO_HISTORY_COLLECT_REFUSALS, DOJO_HISTORY_ENV, main, runHistoryCollect, type RunDeps } from "../src/history-collect.ts";
import { readEve } from "../src/layout.ts";

const LF = String.fromCharCode(10), BS = String.fromCharCode(92), DAY = 86_400, D1 = 20_706; // day 1 = 2026-09-10, in days since 1970-01-01
const ENV = { BELL_SOLANA_RPC: `https://${HOSTS.a}`, CHAINSTACK_SOLANA_URL: `https://${HOSTS.b}`,
  ...Object.fromEntries(Object.values(DOJO_HISTORY_ENV).flatMap(([id, floor]) => [[id, "cyc"], [floor, "1"]])) };
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", QUOTE_VAULT = "6KLxyVpYwMGyQJHsvWqFpRk1crEQ79sG3Wi3C1SkZbTW"; // ADR-DOJO-PR-2 D-4
const PYTH = "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"; // the SOL/USD account (ADR-DOJO-PR-2 D-3)
const roots: string[] = [];
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
const dateOf = (d: number): string => new Date(d * DAY * 1000).toISOString().slice(0, 10);
const dayOf = (t: Tx): number => Math.floor(Number(t.entry.blockTime) / DAY);
const text = (p: string): string | null => (existsSync(p) ? readFileSync(p, "utf8") : null);
/** Every file under a directory, relative, with forward slashes, sorted (directories left out). */
const files = (d: string): string[] => readdirSync(d, { recursive: true, encoding: "utf8" }).filter((p) => !statSync(join(d, p)).isDirectory())
  .map((p) => p.split(BS).join("/")).sort();

type F = { root: string; state: string; mint: string; cut: number };
/** A world of the simulated chain and a new state outside any repository, the pinned mint file beside it; --cut = the last slot. */
function fresh(txs: Tx[]): F {
  Object.assign(sim, { txs, reqs: [], tick: 0, drop: { a: new Set(), b: new Set() }, pageDrop: new Set(), diverge: new Set(), override: null });
  const root = mkdtempSync(join(tmpdir(), "dojo-provisional-"));
  const f = { root, state: join(root, "state"), mint: join(root, "mint.txt"), cut: (txs.at(-1) as Tx).slot };
  roots.push(root);
  mkdirSync(join(f.state, "ledger"), { recursive: true });
  copyFileSync(new URL("../../../out/mint.txt", import.meta.url), f.mint);
  return f;
}
/** The provisional argv of A-11 (i); `over` replaces a flag, or removes it (null). */
const argv = (f: F, phase: string, day: string, over: Record<string, string | null> = {}): string[] => Object.entries({ "--phase": phase,
  "--state": f.state, "--mint-file": f.mint, "--cut": String(f.cut), "--max-calls": "5000", "--max-credits": "400", "--max-ru": "4000",
  "--deadline": new Date(sim.nowMs + 3_600_000).toISOString().replace(".000Z", "Z"), "--provisional-day": day, ...over })
  .flatMap(([k, v]) => (v === null ? [] : [k, v]));
const deps = (): RunDeps => ({ env: ENV, nowMs: () => sim.nowMs, sleep: () => Promise.resolve() });
/** A refusal's code, "none" when the course runs: a refusal never escapes a test as a non-assertion failure (red-proof, F2P). */
const codeOf = (a: string[]): Promise<string> => runHistoryCollect(a, deps()).then(() => "none", (e: unknown) => String((e as { code?: unknown }).code));
/** A course's stop reason (null: ended without stop), or "refused <code>". */
const stopOf = (a: string[]): Promise<string | null> => runHistoryCollect(a, deps())
  .then((s) => s.stop_reason, (e: unknown) => `refused ${String((e as { code?: unknown }).code)}`);
/** The Eve of a day P from the chain's truth balances alone (D-7; the existence rule of D-12; the oracle of dojo-history-e2e.test.ts):
 *  the addresses with a line on D_LAST = P - 1, whose minimum of that day (its start and after each transaction) is positive, or whose
 *  last value before it was; byte order; no account (the Eve of a first day read carries addresses only, ADR-DOJO-PR-2 D-7). */
function oracleEve(txs: readonly Tx[], last: number): { accounts: string[]; addresses: string[] } {
  const own = (t: Tx): Map<string, bigint> => { // the balance of each owner after t: the sum of its accounts
    const m = new Map<string, bigint>(); for (const [, [o, v]] of t.truth) m.set(o, (m.get(o) ?? 0n) + v); return m;
  };
  const prev = new Map<string, bigint>();
  let bal = new Map<string, bigint>(), k = 0, out: string[] = [];
  for (let d = D1; d <= last; d++) {
    const start = bal, low = new Map<string, bigint>(), take = (o: string, v: bigint): void => { if (!low.has(o) || v < (low.get(o) ?? v)) low.set(o, v); };
    for (const [o, v] of start) take(o, v);
    for (; k < txs.length && dayOf(txs[k] as Tx) === d; k++) {
      bal = own(txs[k] as Tx);
      for (const [o, v] of bal) { take(o, start.get(o) ?? 0n); take(o, v); }
      for (const o of low.keys()) take(o, bal.get(o) ?? 0n);
    }
    out = [...low].filter(([o, v]) => v > 0n || (prev.get(o) ?? 0n) > 0n).map(([o]) => o);
    for (const [o, v] of low) prev.set(o, v);
  }
  return { accounts: [], addresses: out.sort((x, y) => Buffer.compare(Buffer.from(x), Buffer.from(y))) };
}
/** A publisher's state anchored by its REAL --anchor under an ephemeral key (the request of apps/dojo/test/dojo-publish.test.ts, declared
 *  duplicate: dojo-seed.mjs for seed_anchor and horizon, K = 4, W = 60, u = 1..5, O_1, one dollar of dust): what --history needs first. */
function anchored(root: string): { s: string; key: KeyObject } {
  const s = join(root, "publisher"), key = generateKeyPairSync("ed25519").privateKey, seed = initSeed(join(root, "seed"), 365);
  type Accounts = { wsol: { a: { value: { data: { parsed: { info: { owner: string } } } } } } };
  const pool = (JSON.parse(readFileSync(new URL("./fixtures/collect/accounts.json", import.meta.url), "utf8")) as Accounts).wsol.a.value.data.parsed.info.owner;
  mkdirSync(s);
  publishAnchor({ stateDir: s, key, clock: () => Date.UTC(2026, 8, 11, 12), request: { ...seed, mint: MINT, program: T22, k_reads: 4, validation_days: 60,
    tier_units: ["1", "2", "3", "4", "5"], objective_unit_microusd_days: "60000000000", tier_windows: [60, 60, 60, 60, 180], price_window_days: 7, pool,
    pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH, dust_threshold_microusd: "1000000", read_rule: { ...READ_RULE } } });
  return { s, key };
}

// killer: apps/dojo/src/history-collect.ts:160 CONST "P > deps.nowMs()" -> "P > deps.nowMs() + 86400000"
test("dojo_history_provisional_refusals_write_nothing", async () => { // Review Focus: a future or malformed day, a --cut absent or not whole
  const f = fresh(world(60, 3)), P = "2026-09-12", first = firstReadDay(join(f.root, "first"), D1 + 2, f.cut, rowsAt(f.cut));
  sim.nowMs = Date.UTC(2026, 8, 12, 12); // today, at the injected clock: 2026-09-12
  const cases: [string[], string][] = [[argv(f, "A", "2026-09-31"), "usage"], [argv(f, "A", "2026-9-12"), "usage"], [argv(f, "A", `${P}T00:00:00Z`), "usage"],
    [argv(f, "A", "2026-09-10"), "usage"], // its D_LAST would precede day 1 (2026-09-10)
    [argv(f, "A", "2026-09-13"), "provisional_day_future"], // tomorrow at the injected clock
    [argv(f, "A", P, { "--cut": null }), "usage"], [argv(f, "A", P, { "--cut": "12.5" }), "usage"], [argv(f, "A", P, { "--cut": "0x10" }), "usage"],
    [argv(f, "A", P, { "--first-read": first }), "usage"], [argv(f, "A", P, { "--provisional-day": null }), "usage"]]; // both, or neither
  for (const [a, want] of cases) assert.equal(await codeOf(a), want, a.join(" "));
  assert.deepEqual([await main(argv(f, "A", "2026-09-13"), deps()), await main(argv(f, "A", "2026-09-31"), deps())], [1, 64], "exit 1 when named, 64 on usage");
  assert.deepEqual([sim.reqs.length, files(f.state)], [0, []], "refused before any lock: no call, no evidence, no ledger line");
  assert.ok((DOJO_HISTORY_COLLECT_REFUSALS as readonly string[]).includes("provisional_day_future"), "a refusal of the closed list");
  assert.deepEqual([await stopOf(argv(f, "A", P)), sim.reqs.length > 0], [null, true], "the clock's own day is accepted: P = J, as A-11 (i) runs it");
});

// killer: apps/dojo/src/history-collect.ts:449 CONST "provisional" -> "publish"
test("dojo_history_provisional_course_writes_the_eve_alone", async () => { // Review Focus: never publish/ nor a manifest --history would read
  const txs = world(24, 2, 7, { gap: 40_000, mintless: [24], close: [10] }), pd = dayOf(txs.at(-1) as Tx), P = dateOf(pd); // P = J: its morning
  const f = fresh(txs), want = oracleEve(txs, pd - 1), first = firstReadDay(join(f.root, "first"), pd, f.cut, rowsAt(f.cut));
  sim.nowMs = (pd * DAY + 3600) * 1000; // one hour into P: P is today, its transactions up to --cut are read, its lines are never built
  const normal = argv(f, "B", P, { "--provisional-day": null, "--first-read": first });
  assert.deepEqual([await main(argv(f, "A", P), deps()), await stopOf(normal), await main(argv(f, "B", P), deps()), await main(argv(f, "C", P), deps())],
    [0, "refused inputs_mismatch", 0, 0], "phases A, B and C by the CLI, exit 0; a course of --first-read never resumes a provisional state");
  const eve = text(join(f.state, "provisional", "eve.json")), status = text(join(f.state, "evidence", "status.json"));
  assert.deepEqual([eve, status], [`${canonical(want)}${LF}`, `${canonical({ status: "provisional", stop_reason: null })}${LF}`],
    "the oracle's Eve, then the status");
  assert.ok(want.addresses.length > 0 && txs.some((t) => t.mintless === true && dayOf(t) <= pd), "not vacuous: holders on D_LAST, a body of phase C");
  assert.deepEqual(readEve(eve ?? ""), want, "the bytes readEve accepts: those the collector reads at bundles/<J+1>/eve.json (A-11 (i))");
  const all = files(f.state), outside = all.filter((p) => !p.startsWith("evidence/") && !p.startsWith("ledger/"));
  assert.deepEqual(outside, ["provisional/eve.json"], "the Eve alone beside the evidence and the guard's ledger");
  const engaging = (p: string): boolean => /(^|[/])(publish|history|manifest[.]json)([/]|$)/.test(p)
    || (p.endsWith("SHA256SUMS") && !p.startsWith("evidence/runs/"));
  assert.deepEqual(all.filter(engaging), [], "no publish/, no history file, no manifest, no SHA256SUMS outside the runs of the evidence");
  const j0 = JSON.parse(text(join(f.state, "evidence", "journal.jsonl"))?.split(LF)[0] ?? "{}") as { inputs?: Record<string, unknown> };
  assert.deepEqual([j0.inputs?.provisional_day, j0.inputs?.d_last, j0.inputs?.cut, Object.keys(j0.inputs ?? {}).includes("first_read_sha256")],
    [P, dateOf(pd - 1), f.cut, false], "the first journal line pins P, D_LAST and --cut: the course replays");
  assert.deepEqual([await stopOf(argv(f, "A", P)), await stopOf(argv(f, "C", P)), text(join(f.state, "provisional", "eve.json"))],
    ["refused phase_order", "refused phase_order", eve], "a provisional state done is never run again, its Eve kept");
  const { s, key } = anchored(f.root), timeline = text(join(s, "timeline.jsonl")); // the REAL --history on that state: refused, nothing written
  const why = await publishHistory({ historyDir: f.state, inboxDir: join(f.root, "inbox"), stateDir: s, key, clock: () => sim.nowMs })
    .then(() => "published", (e: unknown) => String((e as { message?: unknown }).message));
  assert.deepEqual([why, text(join(s, "timeline.jsonl")) === timeline, timeline !== null],
    ["dojo/publish: history_bundle_malformed: publish/SHA256SUMS is missing", true, true], "--history cannot read a provisional state");
});

// killer: apps/dojo/src/history-build.ts:97 CONST "held && build.eve" -> "false && build.eve"
test("dojo_history_provisional_eve_is_never_empty_on_a_held_chain", async () => { // Review Focus: an empty Eve while the chain has holders
  const stops = [...DOJO_VERIFY_REFUSALS, ...DOJO_PUBLISH_REFUSALS];
  assert.ok((DOJO_HISTORY_BUILD_STOPS as readonly string[]).includes("eve_empty") && !stops.includes("eve_empty"), "a stop of its own, no verifier's code");
  const txs = world(60, 3), held = [...(txs.at(-1) as Tx).truth.values()].filter(([, v]) => v > 0n).length;
  assert.deepEqual([txs.every((t) => dayOf(t) === D1), held > 0, oracleEve(txs, D1).addresses], [true, true, []],
    "day 1 holds every transfer: holders at its end, no line on it");
  const f = fresh(txs), P = "2026-09-11"; // D_LAST = day 1, the day of the mint's creation: every owner starts it at 0
  sim.nowMs = Date.UTC(2026, 8, 11, 12);
  assert.deepEqual([await stopOf(argv(f, "A", P)), await stopOf(argv(f, "B", P)), await stopOf(argv(f, "C", P))], [null, null, "eve_empty"]);
  assert.deepEqual([text(join(f.state, "evidence", "status.json")), existsSync(join(f.state, "provisional")), existsSync(join(f.state, "publish"))],
    [`${canonical({ status: "partial", stop_reason: "eve_empty" })}${LF}`, false, false], "partial, no Eve, no publish/");
  const g = fresh(txs), Q = "2026-09-12", want = oracleEve(txs, D1 + 1); // D_LAST = day 2, held all day: an Eve, the same chain
  sim.nowMs = Date.UTC(2026, 8, 12, 12);
  const course = [await stopOf(argv(g, "A", Q)), await stopOf(argv(g, "B", Q)), await stopOf(argv(g, "C", Q))];
  assert.deepEqual([course, text(join(g.state, "provisional", "eve.json"))], [[null, null, null], `${canonical(want)}${LF}`], "it refuses an empty Eve only");
  assert.ok(want.addresses.length > 0, "not vacuous: an Eve with addresses");
});
