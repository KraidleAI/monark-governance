// MONARK Dojo: the declared shares and the derived cycles of the two writers of the shared accounts (the collector of PR-2-2 and the
// history collector of PR-2b-3). Each passes its declared share to the guard (RunLimits.cycleShare) for the operators its course
// requests, and derives its cycle id from the account's anchor instant (cycleOf), never an id posed by hand. The collector runs over the
// simulated chain of PR-2-2 (helpers/collect-chain.ts, imported first: no socket, no name resolution); here the history collector is only
// run to refusals made before any lock and any call (its courses over its own simulated chain are in dojo-history-collect.test.ts:
// dojo_history_passes_its_declared_shares, dojo_history_derives_its_cycles_from_the_anchors, dojo_history_shares_only_the_operators_it_requests).
// Clocks, anchors, shares, seeds and days are SYNTHETIC test inputs; the expected cycle ids are recoded here, never read from the collectors.
import { CYCLE, ENV, HELIUS_HOST, MINT, POOL, PYTH, QUOTE_VAULT, ROWS, roots, sim, stateOf } from "./helpers/collect-chain.ts";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { BudgetExceededError, openGuardedClient } from "@monark/rpc-guard";
import { runCollect } from "../src/collect.ts";
import { DOJO_METHOD_CAPS } from "../src/dojo-methods.ts";
import { DOJO_HISTORY_ENV, runHistoryCollect } from "../src/history-collect.ts";
import { ANCHOR_DAY, anchorBody, betaOf, dateOf, instantsOf, seedChain } from "./helpers/dojo-fixture.ts";

const H = 40, LABEL = "dojo-share-seed", SECRET = createHash("sha256").update(LABEL).digest("hex"), SEED = seedChain(LABEL, H); // SYNTHETIC secret
const ANCHOR = { ...anchorBody(SEED(0), H, ANCHOR_DAY), pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH };
const D1 = ANCHOR_DAY + 1, T = (d: number): number => d * 86_400, INST = instantsOf(D1, SEED(1), betaOf(D1)); // 2026-10-02, recoded instants
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
type Env = Readonly<Record<string, string | undefined>>;
type F = ReturnType<typeof stateOf>;
const clock = (s: number): void => { sim.nowMs = s * 1000; };
const args = (f: F, mode: string[]): string[] => ["--state", f.state, "--mint-file", f.mint, "--max-calls", "24", "--max-credits", "40", "--seed-file", f.seed,
  "--anchor-file", f.anchor, ...mode];
const collect = (f: F, env: Env, ...mode: string[]): Promise<void> => runCollect(args(f, mode), { env, nowMs: () => sim.nowMs, sleep: () => Promise.resolve() });
const codeOf = async (p: Promise<unknown>): Promise<string> => { try { await p; return "none"; } catch (e) { return (e as { code?: string }).code ?? (e as Error).constructor.name; } };
const detailOf = async (p: Promise<unknown>): Promise<string> => { try { await p; return "none"; } catch (e) { return (e as Error).message; } };
/** The outcomes of an operator's ledger on a cycle, a refusal with its reason; [] when absent. */
const outcomes = (state: string, cycle: string, op: string): string[] => { const p = join(state, "ledger", cycle, `${op}.jsonl`);
  return existsSync(p) ? readFileSync(p, "utf8").trim().split("\n").map((l) => { const e = JSON.parse(l) as { outcome: string; reason?: string };
    return e.outcome === "refused" ? `refused:${String(e.reason)}` : e.outcome; }) : []; };
function fresh(): F {
  Object.assign(sim, { reqs: [], rows: ROWS, mint: MINT, beta: null, override: null });
  return stateOf(ANCHOR, SECRET);
}
/** Plans day D1 under env (both relays give betaOf(D1)) and deposits an empty Eve. */
async function planned(f: F, env: Env): Promise<void> {
  sim.beta = betaOf(D1);
  clock(T(D1) + 60);
  assert.equal(await codeOf(collect(f, env, "--plan")), "none", "the plan of the day");
  writeFileSync(join(f.state, "bundles", dateOf(D1), "eve.json"), `${canonical({ addresses: [], accounts: [] })}\n`);
  sim.reqs = [];
}
const reading = (f: F, i: number): string => join(f.state, "bundles", dateOf(D1), "readings", `${String(i)}.json`);

// The history collector: a provisional phase A of day 2026-09-11 on a new state (the pinned mint file beside it), run here to its
// refusals before any lock only (no history world is installed in this file).
const HISTORY_ENV = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, CHAINSTACK_SOLANA_URL: "https://chainstack.dojo.invalid",
  ...Object.fromEntries(Object.values(DOJO_HISTORY_ENV).flatMap(([anchor, floor]) => [[anchor, "2026-08-11T12:00:00Z"], [floor, "1"]])),
  HELIUS_CYCLE_SHARE: "8000000", CHAINSTACK_CYCLE_SHARE: "16000000" };
function historyState(): string {
  const root = mkdtempSync(join(tmpdir(), "dojo-share-")), state = join(root, "state");
  roots.push(root);
  mkdirSync(join(state, "ledger"), { recursive: true });
  copyFileSync(new URL("../../../out/mint.txt", import.meta.url), join(root, "mint.txt"));
  return state;
}
const history = (state: string, env: Env, nowMs: number): ReturnType<typeof runHistoryCollect> => runHistoryCollect(["--phase", "A", "--state", state,
  "--mint-file", join(state, "..", "mint.txt"), "--cut", "1", "--max-calls", "5000", "--max-credits", "400", "--max-ru", "4000",
  "--deadline", new Date(nowMs + 3_600_000).toISOString().replace(".000Z", "Z"), "--provisional-day", "2026-09-11"], { env, nowMs: () => nowMs, sleep: () => Promise.resolve() });
const AT = Date.UTC(2026, 8, 11, 11); // 2026-09-11T11:00Z: J = 2

// killer: apps/dojo/src/collect.ts:219 CONST ", cycleShare: { helius: c.share }" -> ""
test("dojo_collectors_pass_their_declared_share", async () => {
  // The collector: a share of 1 credit refuses the reading's first paid call (cycle_share, ledgered before the transport, no request);
  // the same reading under the share of the fixture (the code cap) is read. The share binds the course's helius cycle.
  const f = fresh(), tight = { ...ENV, HELIUS_CYCLE_SHARE: "1" };
  await planned(f, tight);
  clock((INST[0] ?? 0) + 5);
  await assert.rejects(collect(f, tight, "--reading", "1"), (e: unknown) => e instanceof BudgetExceededError && /cycle_share/.test(e.message), "refused at its share");
  assert.deepEqual([sim.reqs.length, outcomes(f.state, CYCLE, "helius").at(-2), existsSync(reading(f, 1))], [0, "refused:cycle_share", false],
    "no request, the refusal ledgered (then the unlock), nothing written");
  assert.equal(await codeOf(collect(f, ENV, "--reading", "1")), "none", "the share of the fixture reads it");
  assert.ok(existsSync(reading(f, 1)) && sim.reqs.some((r) => r.op === "helius"), "read through helius");
});

// killer: apps/dojo/src/collect.ts:98 SDL "if (!/^[1-9][0-9]{0,8}$/.test(share)" -> ""
test("dojo_collect_refuses_a_missing_share_env", async () => {
  // A missing or malformed share refuses with the existing code cycle_missing, detail "share", before any lock and any call (no new code).
  const f = fresh();
  clock(T(D1) + 60);
  for (const share of [undefined, "", "0", "-1", "1.5", "8000001", "1e3"]) {
    const env = { ...ENV, HELIUS_CYCLE_SHARE: share };
    assert.deepEqual([await codeOf(collect(f, env, "--tick")), await detailOf(collect(f, env, "--tick"))], ["cycle_missing", "dojo/collect: cycle_missing: share"],
      `share ${String(share)} refused`);
  }
  assert.deepEqual([sim.reqs.length, readdirSync(join(f.state, "ledger"))], [0, []], "no call, no lock, no ledger line");
  // The history collector names the operator whose share is missing, with the same code.
  const s = historyState();
  for (const [key, want] of [["HELIUS_CYCLE_SHARE", "helius share"], ["CHAINSTACK_CYCLE_SHARE", "chainstack share"]] as const) {
    for (const v of [undefined, "0", "16000001"]) {
      const e = await history(s, { ...HISTORY_ENV, [key]: v }, AT).then(() => null, (x: unknown) => x as { code?: string; message?: string });
      assert.deepEqual([e?.code, e?.message], ["cycle_missing", `dojo/history-collect: cycle_missing: ${want}`], `${key}=${String(v)}`);
    }
  }
  assert.deepEqual(readdirSync(join(s, "ledger")), [], "no lock and no ledger line");
});

// killer: apps/dojo/src/collect.ts:217 CONST "cycleOf(c.deps.nowMs(), c.cycleAnchor, CHAIN_OPERATORS[0])" -> "c.cycleAnchor"
test("dojo_collectors_derive_their_cycle_from_the_anchor", async () => {
  // The collector: an anchor one civil month before an instant X between the first two readings of D1 puts a cycle boundary at X; the
  // two readings, one each side, go to two cycles, each named from the anchor's wall-clock date.
  const [t1 = 0, t2 = 0] = INST, X = new Date(Math.floor((t1 + t2) / 2) * 1000), f = fresh();
  const anchor = new Date(Date.UTC(X.getUTCFullYear(), X.getUTCMonth() - 1, X.getUTCDate(), X.getUTCHours(), X.getUTCMinutes(), X.getUTCSeconds())).toISOString();
  const env = { ...ENV, HELIUS_CYCLE_ANCHOR_UTC: anchor }, before = `helius-${anchor.slice(0, 10)}`, at = `helius-${X.toISOString().slice(0, 10)}`;
  assert.deepEqual([before, at], ["helius-2026-09-02", "helius-2026-10-02"], "recoded: X lies on D1, 2026-10-02");
  await planned(f, env);
  clock(t1 + 5);
  assert.equal(await codeOf(collect(f, env, "--reading", "1")), "none", "reading 1, before the boundary");
  clock(t2 + 5);
  assert.equal(await codeOf(collect(f, env, "--reading", "2")), "none", "reading 2, after it");
  assert.deepEqual(readdirSync(join(f.state, "ledger")).filter((d) => d.startsWith("helius-")).sort(), [before, at], "two cycles, derived");
  for (const c of [before, at]) assert.ok(outcomes(f.state, c, "helius").includes("attempted"), `${c} holds a reading`);
  // An anchor that does not derive a cycle at the clock (malformed, or after the clock) is refused by name, with the existing code.
  const BAD = ["2026-08-11", "2026-08-11T24:00:00Z", ""]; // no time, an hour out of range, empty; then an anchor after each clock
  for (const x of [...BAD, "2026-10-03T00:00:00Z"]) {
    assert.equal(await detailOf(collect(f, { ...ENV, HELIUS_CYCLE_ANCHOR_UTC: x }, "--tick")), "dojo/collect: cycle_missing: anchor", `collect ${x}`);
  }
  for (const x of [...BAD, "2026-09-11T11:00:01Z"]) {
    assert.equal(await detailOf(history(historyState(), { ...HISTORY_ENV, CHAINSTACK_CYCLE_ANCHOR_UTC: x }, AT)), "dojo/history-collect: cycle_missing: chainstack anchor",
      `history ${x}`);
  }
});

// killer: apps/dojo/src/collect.ts:219 CONST "cycleShare: { helius: c.share }" -> "cycleShare: { helius: c.share, chainstack: c.share }"
test("dojo_collect_shares_only_the_operators_it_requests", async () => {
  // A reading requests helius and solana-foundation only. With two shares in the environment (helius and chainstack), the course passes:
  // the collector builds cycleShare from the operators its course requests.
  const f = fresh(), two = { ...ENV, CHAINSTACK_CYCLE_SHARE: "50000" };
  await planned(f, two);
  clock((INST[0] ?? 0) + 5);
  assert.equal(await codeOf(collect(f, two, "--reading", "1")), "none", "a helius course with two shares in the environment passes");
  assert.ok(existsSync(reading(f, 1)), "read");
  // The same course with the chainstack share forwarded is refused by name by the guard, before any lock and any call.
  sim.reqs = [];
  const limits = { maxCalls: 24, runCaps: { helius: 40 }, methodCaps: { ...DOJO_METHOD_CAPS }, cycleFloor: { helius: 0 }, cycleShare: { helius: 8_000_000, chainstack: 50_000 } };
  assert.throws(() => openGuardedClient(two, limits, join(f.state, "ledger"), { helius: CYCLE, "solana-foundation": CYCLE }, { boundBody: true }),
    (e: unknown) => e instanceof BudgetExceededError && e.message === "rpc-guard: cycle share for 'chainstack' names no paid operator of this course, fail-closed",
    "refused by name");
  assert.deepEqual([sim.reqs.length, existsSync(join(f.state, "ledger", CYCLE, "helius.lock"))], [0, false], "no call, no lock left");
});
