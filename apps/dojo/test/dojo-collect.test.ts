// MONARK Dojo -- PR-2-2 oracle (ADR-DOJO-PR-2 section 4, PR-2-2, and the oracle of --tick, dated line C-V-2): the collector CLI over
// the REAL openGuardedClient on a temporary ledger, fetch replaced by the simulated chain (helpers/collect-chain.ts: no socket, no
// name resolution), the clock and the sleeps injected. Expected values are recoded here (instants by the fixture's own formula,
// composed reads from the truth rows, prices from the fixture bytes), never read from the collector. Days, betas, seeds, rows and
// amounts are SYNTHETIC test inputs; the response forms are the verbatim fixtures of fixtures/collect/.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire, syncBuiltinESMExports } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { ENV, MINT, POOL, PYTH, QUOTE_VAULT, ROWS, relays, roots, sim, stampOf, stateOf, type Req, type Row } from "./helpers/collect-chain.ts";
import { assertMethodCapsCover, BudgetExceededError } from "@monark/rpc-guard";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { operatorOf } from "../../bell/src/operators.ts";
import { dayValue, lotsOf, provisionalOf, scoreOf, validatedOf } from "../scripts/dojo-core.mjs";
import { DOJO_VERIFY_REFUSALS, dirSource, verifyDojoServed } from "../scripts/dojo-verify.mjs";
import { DOJO_BUNDLE_REFUSALS, readRecord } from "../src/bundle.ts";
import { DOJO_COLLECT_REFUSALS, runCollect } from "../src/collect.ts";
import { DOJO_METHOD_CAPS, DOJO_SOLANA_METHODS, READ_RULE as PINNED } from "../src/dojo-methods.ts";
import { DOJO_LAYOUT_REFUSALS, readDayLayout, readEve } from "../src/layout.ts";
import { ADDR, ANCHOR_DAY, DAY1, READ_RULE, anchorBody, at, betaOf, dateOf, dojoKeyringOf, historyBody, instantsOf, newKey, removeTrees, render, seedChain,
  writeTree, type Line } from "./helpers/dojo-fixture.ts";

const H = 40, LABEL = "dojo-collect-seed", SECRET = createHash("sha256").update(LABEL).digest("hex"), SEED = seedChain(LABEL, H); // SYNTHETIC secret
const ANCHOR = { ...anchorBody(SEED(0), H, ANCHOR_DAY), pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH };
const D1 = ANCHOR_DAY + 1, D2 = ANCHOR_DAY + 2, T = (d: number): number => d * 86_400;
const INST = (d: number): number[] => instantsOf(d, SEED(d - ANCHOR_DAY), betaOf(d)); // the fixture's recoded formula (D-5 l.153)
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const byBytes = (x: string, y: string): number => Buffer.compare(Buffer.from(x), Buffer.from(y));
const sleeps: number[] = [];
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
const deps = { env: ENV, nowMs: (): number => sim.nowMs, sleep: (ms: number): Promise<void> => { sleeps.push(ms); return Promise.resolve(); }, relays };
type F = ReturnType<typeof stateOf>;
const args = (f: F, mode: string[], budget = ["--max-calls", "24", "--max-credits", "40"]): string[] =>
  ["--state", f.state, "--mint-file", f.mint, ...budget, "--seed-file", f.seed, "--anchor-file", f.anchor, ...mode];
const run = (f: F, ...mode: string[]): Promise<void> => runCollect(args(f, mode), deps);
const codeOf = async (p: Promise<unknown>): Promise<string> => { try { await p; return "none"; } catch (e) { return (e as { code?: string }).code ?? (e as Error).constructor.name; } };
const clock = (s: number): void => { sim.nowMs = s * 1000; };
const dirOf = (f: F, d: number, ...p: string[]): string => join(f.state, "bundles", dateOf(d), ...p);
const eveText = (addresses: string[] = [], accounts: [string, string][] = []): string => `${canonical({ addresses, accounts })}\n`;
function fresh(anchor: unknown = ANCHOR, mint = MINT): F {
  Object.assign(sim, { reqs: [], rows: ROWS, mint: MINT, beta: null, override: null });
  sleeps.length = 0;
  return stateOf(anchor, SECRET, mint);
}
/** Plans day d (both relays give betaOf(d)) and deposits its Eve. */
async function planned(f: F, d: number, eve = eveText()): Promise<void> {
  sim.beta = betaOf(d);
  clock(T(d) + 60);
  await run(f, "--plan");
  writeFileSync(dirOf(f, d, "eve.json"), eve);
  sim.reqs = [];
}
type Fn = (...a: unknown[]) => unknown;
const fsc = createRequire(import.meta.url)("node:fs") as Record<string, Fn>;
/** Runs body with fs functions wrapped, the named imports of the modules re-bound (syncBuiltinESMExports), then restores them. */
async function spy(wrap: Record<string, (orig: Fn, ...a: unknown[]) => unknown>, body: () => Promise<unknown>): Promise<void> {
  const saved = Object.keys(wrap).map((k) => [k, fsc[k] as Fn, wrap[k] as (orig: Fn, ...a: unknown[]) => unknown] as const);
  for (const [k, o, w] of saved) fsc[k] = (...a: unknown[]) => w(o, ...a);
  syncBuiltinESMExports();
  try { await body(); } finally { for (const [k, o] of saved) fsc[k] = o; syncBuiltinESMExports(); }
}
const [H1, , , , S165, TARGET] = ROWS.map((r) => r[0]); // provenance.json "reduction": two holders, pool base, lock vault, 165-byte holder, target
const bump = (rows: Row[], acc: string, side: 2 | 3): Row[] => rows.map((r) => (r[0] === acc ? Object.assign([...r] as Row, { [side]: String(BigInt(r[side] ?? "0") + 1n) }) : r));

test("dojo_tick_refuses_unknown_argv", async () => {
  const f = fresh(), ok = args(f, ["--tick"]);
  const cases: string[][] = [[], ["--tick", "--plan", ...ok.slice(0, -1)], [...ok, "--verbose"], [...ok, "--state", f.state], ok.slice(2), [...ok.slice(0, -1), "--reading", "0"],
    [...ok.slice(0, -1), "--reading"], [...ok.slice(0, -1), "--close-day", "2026-13-01"], [...ok.slice(0, -1), "--close-day", "2026-02-30"], ok.map((x, j) => (ok[j - 1] === "--max-calls" ? "0" : x)),
    ok.map((x) => (x === "24" ? "24x" : x)), ok.map((x) => (x === "--state" ? "--state=" : x)), [...ok.slice(0, -1), "--reading", "--tick"],
    [...ok.slice(0, -1), "--reading", "5"]]; // i > k_reads of the anchor (4): usage before any lock (Q-G2-3)
  for (const c of cases) assert.equal(await codeOf(runCollect(c, deps)), "usage", `refused as usage: ${c.filter((x) => x.startsWith("--") || x.length < 12).join(" ")}`);
  assert.deepEqual(sim.reqs, [], "no call");
  assert.equal(existsSync(join(f.state, "ledger", "cyc")), false, "no lock and no ledger line (refused before openGuardedClient)");
});

test("dojo_collect_budget_stops_fail_closed", async () => {
  const f = fresh();
  assert.equal(await codeOf(runCollect(args(f, ["--tick"], ["--max-calls", "24", "--max-credits", "800001"]), deps)), "budget_guard", "floor 0 + 10 x 800 001 > 8 000 000 (D-6 l.173)");
  assert.equal(await codeOf(runCollect(args(f, ["--tick"]), { ...deps, env: { ...ENV, HELIUS_CYCLE_FLOOR: "7999601" } })), "budget_guard", "7 999 601 + 400 > 8 000 000");
  for (const env of [{ ...ENV, HELIUS_CYCLE_ID: undefined }, { ...ENV, HELIUS_CYCLE_FLOOR: "-1" }]) assert.equal(await codeOf(runCollect(args(f, ["--tick"]), { ...deps, env })), "cycle_missing");
  assert.doesNotThrow(() => { assertMethodCapsCover(DOJO_METHOD_CAPS, DOJO_SOLANA_METHODS); });
  assert.deepEqual([...DOJO_SOLANA_METHODS].sort(), ["getAccountInfo", "getProgramAccounts"], "mere D-5 l.205");
  assert.ok((DOJO_METHOD_CAPS.getProgramAccounts ?? 99) * 10 + (DOJO_METHOD_CAPS.getAccountInfo ?? 99) <= 40, "method caps within --max-credits 40 (D-6 l.173)");
  assert.deepEqual(sim.reqs, [], "the refusals above ran before any call");
  await planned(f, D1);
  const [t] = INST(D1) as [number];
  clock(t + 5);
  for (const [budget, spent] of [[["--max-calls", "3", "--max-credits", "40"], 3], [["--max-calls", "24", "--max-credits", "10"], 2]] as const) {
    sim.reqs = [];
    await assert.rejects(runCollect(args(f, ["--reading", "1"], [...budget]), deps), BudgetExceededError, `stopped by ${budget.join(" ")}`);
    assert.equal(sim.reqs.length, spent, "no call past the cap");
    assert.equal(existsSync(dirOf(f, D1, "readings", "1.json")), false, "nothing written on a budget stop");
    for (const op of ["helius", "solana-foundation"]) assert.equal(existsSync(join(f.state, "ledger", "cyc", `${op}.lock`)), false, `${op} unlocked in finally`);
  }
  assert.match(readFileSync(join(f.state, "ledger", "cyc", "helius.jsonl"), "utf8"), /"outcome":"refused"/, "the stop is ledgered");
  await spy({ appendFileSync: (o, p, ...a) => { if (String(p).endsWith("runs.jsonl")) throw new Error("dojo-collect test: disk full"); return o(p, ...a); } },
    async () => { assert.equal(await codeOf(run(f, "--reading", "1")), "Error"); });
  assert.deepEqual(["helius.lock", "solana-foundation.lock"].map((l) => existsSync(join(f.state, "ledger", "cyc", l))).concat(existsSync(dirOf(f, D1, "readings", "1.json"))),
    [false, false, false], "a failed evidence append: no lock left (unlocked first), no reading");
  // Paths of the state and the secret, the seed and the anchor: refused before any lock (C-G2-6; G-15, G-16, G-17, G-18, G-22, G-25, G-26; Q-G2-2).
  const g = fresh(), dir = dirname(g.seed), repo = fileURLToPath(new URL("../../../", import.meta.url)), cred = { ...ENV, CREDENTIALS_DIRECTORY: dir };
  writeFileSync(join(dir, "dojo-seed"), `${SECRET}\n`);
  writeFileSync(join(dir, "other-seed"), `${sha("another SYNTHETIC secret")}\n`);
  writeFileSync(join(dir, "rule.json"), JSON.stringify({ ...ANCHOR, read_rule: { ...READ_RULE, read_offset_s: 901 } }));
  writeFileSync(join(dir, "k256.json"), JSON.stringify({ ...ANCHOR, k_reads: 256 }));
  const swap = (from: string, to: string): string[] => args(g, ["--tick"]).map((x) => (x === from ? to : x));
  clock(T(ANCHOR_DAY) + 60); // an accepted run does nothing on the anchor's day
  for (const [argv, env, want] of [[swap(g.seed, join(repo, "out", "dojo-seed")), ENV, "outside_repo"], [swap(g.state, join(repo, "out")), ENV, "outside_repo"],
    [args(g, ["--tick"]), cred, "credentials_path"], [swap(g.seed, join(dir, "dojo-seed")), cred, "none"], [swap(g.seed, join(dir, "other-seed")), ENV, "seed_mismatch"],
    [swap(g.anchor, join(dir, "rule.json")), ENV, "anchor_malformed"], [swap(g.anchor, join(dir, "k256.json")), ENV, "anchor_malformed"]] as const) {
    assert.equal(await codeOf(runCollect(argv, { ...deps, env })), want, argv.join(" "));
  }
  rmSync(join(g.state, "ledger"), { recursive: true });
  assert.deepEqual([await codeOf(run(g, "--tick")), sim.reqs.length], ["state_missing", 0], "the ledger of the state must exist");
});

test("dojo_collect_calls_have_the_closed_forms", async () => {
  const f = fresh();
  sim.beta = betaOf(D1);
  clock(T(D1) + 60);
  await run(f, "--plan");
  const round = Math.ceil((T(D1) - READ_RULE.beacon_genesis_time) / READ_RULE.beacon_period) + 1;
  assert.deepEqual(sim.reqs, ["relay-1", "relay-2"].map((op) => ({ op, method: "GET", params: [`/${READ_RULE.beacon_chain_hash}/public/${String(round)}`] })), "one v1 GET per relay");
  writeFileSync(dirOf(f, D1, "eve.json"), eveText());
  const inst = INST(D1), fin = (encoding: string) => ({ commitment: "finalized", encoding });
  const gpa = ["TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", { commitment: "finalized", encoding: "jsonParsed", withContext: true, filters: [{ memcmp: { offset: 0, bytes: MINT } }] }];
  const pieces = (mint: boolean): [string, unknown[]][] => [["getProgramAccounts", gpa], ...(mint ? [["getAccountInfo", [MINT, fin("jsonParsed")]] as [string, unknown[]]] : []),
    ["getAccountInfo", [POOL, fin("base64")]], ["getAccountInfo", [QUOTE_VAULT, fin("jsonParsed")]], ["getAccountInfo", [PYTH, fin("base64")]]];
  for (const i of [1, 2]) {
    sim.reqs = [];
    clock((inst[i - 1] as number) + 1);
    await run(f, "--reading", String(i));
    const want = pieces(i === 1).flatMap(([method, params]) => ["helius", "solana-foundation"].map((op) => ({ op, method, params })));
    assert.equal(canonical(sim.reqs), canonical(want), `reading ${String(i)}: closed forms, finalized, never dataSize, dataSlice nor tokenAccountState (M-Q3, M-Q11); mint once a day`);
  }
  const [two, n] = [readFileSync(dirOf(f, D1, "readings", "2.json"), "utf8"), sim.reqs.length];
  await run(f, "--reading", "2");
  assert.deepEqual([sim.reqs.length, readFileSync(dirOf(f, D1, "readings", "2.json"), "utf8")], [n, two], "a direct --reading never reads a written reading again (G-12)");
});

test("dojo_mint_is_the_pinned_ca", async () => {
  assert.equal(readFileSync(new URL("../../../out/mint.txt", import.meta.url), "utf8"), `${MINT}\n`, "out/mint.txt = the pinned CA (token_ca_pinned) = the fixture's mint");
  const f = fresh(ANCHOR, "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE");
  assert.equal(await codeOf(run(f, "--tick")), "mint_mismatch", "--mint-file must equal the anchor's mint");
  const X = ADDR.D, g = fresh({ ...ANCHOR, mint: X }, X); // SYNTHETIC mint: the collector must take it from the files, never a literal (M-Q6)
  await planned(g, D1);
  clock((INST(D1)[0] as number) + 1);
  await run(g, "--reading", "1");
  const filters = sim.reqs.filter((r) => r.method === "getProgramAccounts").map((r) => canonical((r.params[1] as { filters: unknown }).filters));
  assert.deepEqual(filters, [canonical([{ memcmp: { offset: 0, bytes: X } }]), canonical([{ memcmp: { offset: 0, bytes: X } }])]);
  assert.deepEqual(sim.reqs.filter((r) => r.params[0] === X).length, 2, "the mint account read is the file's mint");
});

test("dojo_collect_never_publishes_one_operator", async () => {
  const f = fresh();
  await planned(f, D1);
  const inst = INST(D1);
  clock((inst[0] as number) + 1);
  await run(f, "--reading", "1");
  for (let j = 0; j < sim.reqs.length; j += 2) {
    const [a, b] = [sim.reqs[j], sim.reqs[j + 1]];
    assert.equal(canonical(a?.params), canonical(b?.params), "a pair is one call sent to two operators");
    assert.deepEqual([a?.op, b?.op], ["helius", "solana-foundation"]);
  }
  assert.notEqual(operatorOf("helius"), operatorOf("solana-foundation"), "two distinct operators (operatorOf, C-9)");
  sim.reqs = [];
  sim.override = (r) => (r.op === "solana-foundation" ? new Response("forbidden", { status: 403 }) : undefined); // the public host refuses (TY-1)
  clock((inst[1] as number) + 1);
  await run(f, "--reading", "2");
  assert.deepEqual(sim.reqs.map((r) => r.op), ["helius", "solana-foundation", "helius", "solana-foundation", "helius", "solana-foundation", "helius", "solana-foundation"], "no fallback: helius asked once per piece (M-Q18)");
  const r = readRecord(readFileSync(dirOf(f, D1, "readings", "2.json"), "utf8"));
  assert.deepEqual([r.read.accounts_concordant, r.read.accounts_no_quorum, r.read.pool_price, r.read.usd_per_sol, r.enumerations.length], [0, 6, null, null, 1], "one operator: every account without quorum, no price (D-6)");
  assert.deepEqual(r.faults, { enumeration: 1, mint: 0, pool: 1, wsol: 1, pyth: 1 });
});

test("dojo_collect_beacon_is_all_day_or_nothing", async () => {
  const beta = betaOf(D1), other = betaOf(D2), round = Math.ceil((T(D1) - READ_RULE.beacon_genesis_time) / READ_RULE.beacon_period) + 1;
  const lie = (body: (r: number) => unknown, op = "relay-2") => (q: { op: string }): Response | undefined =>
    (q.op === op ? new Response(JSON.stringify(body(round)), { status: 200, headers: { "content-type": "application/json" } }) : undefined);
  const rnd = (s: string): string => sha(Buffer.from(s, "hex"));
  const f = fresh();
  sim.beta = beta;
  for (const over of [lie((r) => ({ round: r, randomness: rnd(other), signature: other })), lie((r) => ({ round: r, randomness: rnd(other), signature: beta })),
    lie((r) => ({ round: r + 1, randomness: rnd(beta), signature: beta })), lie(() => ({ error: 1 })), (q: { op: string }) => (q.op === "relay-1" ? new Response("x", { status: 404 }) : undefined),
    ...["c0", "00"].map((x) => { const bad = x + beta.slice(2), b = (r: number) => ({ round: r, randomness: rnd(bad), signature: bad }); return (q: { op: string }) => lie(b)(q) ?? lie(b, "relay-1")(q); })]) {
    sim.override = over;
    clock(T(D1) + 30);
    await run(f, "--plan");
    assert.equal(existsSync(dirOf(f, D1, "evidence", "plan.json")), false, "a lying, wrong or missing relay: no plan (M-B4)");
  }
  sim.override = null;
  sim.reqs = [];
  clock(T(D1) + 30);
  assert.equal(await codeOf(runCollect(args(f, ["--plan"]), { ...deps, relays: relays.slice(0, 1) })), "relay_missing", "two relays or no plan (item DRAND-RELAY-GET-1)");
  assert.deepEqual(sim.reqs, []);
  clock(T(D1) + 900);
  await run(f, "--plan");
  assert.deepEqual(sim.reqs, [], "from T_d + 900 s: no call at all (M-B3, M-B5)");
  const plan = JSON.parse(readFileSync(dirOf(f, D1, "evidence", "plan.json"), "utf8")) as unknown;
  assert.deepEqual(plan, { beacon: null, day: dateOf(D1), instants: [], reason: "beacon_unavailable" }, "a null plan marks the day");
  writeFileSync(dirOf(f, D1, "eve.json"), eveText());
  clock(T(D2) - 1);
  assert.equal(await codeOf(run(f, "--close-day", dateOf(D1))), "day_not_ended", "a day without beacon ends at T_{d+1}");
  clock(T(D2));
  await run(f, "--close-day", dateOf(D1));
  const { bundle, records } = readDayLayout(dirOf(f, D1));
  assert.deepEqual([bundle.status, bundle.reason, bundle.beacon, bundle.reads.length, records.length], ["abstained", "beacon_unavailable", null, 0, 0]);
  assert.equal(readFileSync(dirOf(f, D1, "publish", "SHA256SUMS"), "utf8").split("\n").length - 1, 2, "eve.json and publish/day.json only");
  const h = fresh();
  clock(T(D1) + 900);
  await run(h, "--tick");
  assert.deepEqual([(JSON.parse(readFileSync(dirOf(h, D1, "evidence", "plan.json"), "utf8")) as { beacon: unknown }).beacon, sim.reqs.length], [null, 0], "first pass at T_d + 900 s: null plan, no call");
  const g = fresh();
  await planned(g, D1);
  assert.deepEqual((JSON.parse(readFileSync(dirOf(g, D1, "evidence", "plan.json"), "utf8")) as { instants: number[] }).instants, INST(D1), "instants recoded (D-5 l.153)");
});

test("dojo_collect_refuses_the_anchor_day", async () => {
  const f = fresh();
  sim.beta = betaOf(ANCHOR_DAY);
  clock(T(ANCHOR_DAY) + 60);
  assert.equal(await codeOf(run(f, "--plan")), "anchor_day_not_read");
  assert.equal(await codeOf(run(f, "--close-day", dateOf(ANCHOR_DAY))), "anchor_day_not_read");
  assert.equal(await codeOf(run(f, "--close-day", dateOf(ANCHOR_DAY - 3))), "anchor_day_not_read");
  await run(f, "--tick");
  assert.deepEqual(sim.reqs, [], "the tick plans nothing on the anchor's day (D-8)");
  assert.equal(existsSync(join(f.state, "bundles")), false);
  const ti = T(ANCHOR_DAY) + 13 * 3600; // a plan of the anchor's day left by the previous anchor (rotation at noon): never read
  mkdirSync(dirOf(f, ANCHOR_DAY, "evidence"), { recursive: true });
  writeFileSync(dirOf(f, ANCHOR_DAY, "evidence", "plan.json"), `${canonical({ beacon: { round: 1, signature: betaOf(ANCHOR_DAY) }, day: dateOf(ANCHOR_DAY), instants: [ti, ti, ti, ti], reason: null })}\n`);
  writeFileSync(dirOf(f, ANCHOR_DAY, "eve.json"), eveText());
  clock(ti + 10);
  assert.deepEqual([await codeOf(run(f, "--reading", "1")), await codeOf(run(f, "--tick")), sim.reqs.length], ["anchor_day_not_read", "none", 0]);
});

test("dojo_collect_reads_only_inside_the_window", async () => {
  const f = fresh();
  await planned(f, D1);
  const inst = INST(D1), t = inst[0] as number;
  for (const s of [t - 1, t + 601]) { clock(s); assert.equal(await codeOf(run(f, "--reading", "1")), "outside_window", `at t + ${String(s - t)} s`); }
  assert.deepEqual(sim.reqs, []);
  sim.override = (r) => { if (r.op === "solana-foundation" && r.params[0] === PYTH) sim.nowMs = (t + 601) * 1000; return undefined; }; // a slow course
  clock(t + 30);
  assert.equal(await codeOf(run(f, "--reading", "1")), "outside_window", "read_at past the window: nothing written (M-Q19)");
  assert.equal(existsSync(dirOf(f, D1, "readings", "1.json")), false);
  sim.override = null;
  mkdirSync(join(f.state, "ledger", "cyc"), { recursive: true });
  writeFileSync(join(f.state, "ledger", "cyc", "helius.lock"), "{}"); // another course holds helius (TY-4)
  sim.reqs = [];
  clock(t + 30);
  assert.equal(await codeOf(run(f, "--reading", "1")), "lock_held");
  assert.deepEqual([sim.reqs.length, existsSync(join(f.state, "ledger", "cyc", "solana-foundation.lock")), existsSync(dirOf(f, D1, "readings", "1.json"))], [0, false, false], "no reading, no lock left");
  sim.beta = betaOf(D2);
  clock(T(D2) + 60);
  await run(f, "--plan");
  assert.equal(existsSync(dirOf(f, D2, "evidence", "plan.json")), true, "the plan of d+1 takes no chain lock: disjoint from a reading's locks (C-V-4; relays injected, item DRAND-RELAY-GET-1)");
  rmSync(join(f.state, "ledger", "cyc", "helius.lock"));
  clock(Math.max(...inst) + 599);
  assert.equal(await codeOf(run(f, "--close-day", dateOf(D1))), "day_not_ended", "before max_i t_i + 600 (M-Q21)");
  const g = fresh(); // across midnight: the reading of yesterday's last instant (SYNTHETIC plan)
  mkdirSync(dirOf(g, D1, "evidence"), { recursive: true });
  writeFileSync(dirOf(g, D1, "evidence", "plan.json"), `${canonical({ beacon: { round: 1, signature: betaOf(D1) }, day: dateOf(D1), instants: [T(D2) - 100, T(D2) - 100, T(D2) - 100, T(D2) - 100], reason: null })}\n`);
  writeFileSync(dirOf(g, D1, "eve.json"), eveText());
  clock(T(D2) + 400);
  await run(g, "--reading", "3");
  assert.equal(readRecord(readFileSync(dirOf(g, D1, "readings", "3.json"), "utf8")).day, dateOf(D1), "the window crosses midnight");
});

test("dojo_collect_retries_are_bounded_and_honour_retry_after", async () => {
  const f = fresh();
  await planned(f, D1);
  const res = (status: number, h: Record<string, string> = {}): Response => new Response("busy", { status, headers: h });
  sim.override = (r) => (r.op === "solana-foundation" && r.method === "getProgramAccounts" ? res(429, { "retry-after": "7" })
    : r.op === "helius" && r.params[0] === POOL ? res(503) : r.op === "helius" && r.params[0] === PYTH ? res(403) : undefined);
  clock((INST(D1)[0] as number) + 1);
  await run(f, "--reading", "1");
  const n = (op: string, pred: (p: unknown[], m: string) => boolean): number => sim.reqs.filter((r) => r.op === op && pred(r.params, r.method)).length;
  assert.deepEqual([n("solana-foundation", (_, m) => m === "getProgramAccounts"), n("helius", (p) => p[0] === POOL), n("helius", (p) => p[0] === PYTH)], [2, 2, 1], "two tries, a 403 never retried");
  assert.deepEqual([sleeps.filter((s) => s === 7000).length, sleeps.filter((s) => s === 400).length], [1, 1], "Retry-After honoured (7 s), else 400 ms (M-Q17)");
  const r = readRecord(readFileSync(dirOf(f, D1, "readings", "1.json"), "utf8"));
  assert.deepEqual([r.faults.enumeration, r.faults.pool, r.faults.pyth], [1, 1, 1], "a fault after the tries is a fault, never a value");
  const hg = (): Req[] => sim.reqs.filter((q) => q.op === "helius" && q.method === "getProgramAccounts");
  sim.reqs = [];
  sim.override = (q) => (q.op === "helius" && q.method === "getProgramAccounts" && hg().length === 1 ? res(429, { "retry-after": "5" }) : undefined);
  clock((INST(D1)[1] as number) + 1);
  await runCollect(args(f, ["--reading", "2"]), { ...deps, sleep: (ms: number) => new Promise<void>((ok) => { setTimeout(() => { sim.nowMs += ms; ok(); }, 0); }) });
  assert.ok(hg().length === 2 && (stampOf.get(hg()[1] as Req) ?? 0) - (stampOf.get(hg()[0] as Req) ?? 0) >= 5000, "the second try waits the Retry-After (M-Q17)");
  const sf = sim.reqs.filter((q) => q.op === "solana-foundation").map((q) => stampOf.get(q) ?? 0);
  assert.ok(sf.length > 1 && sf.every((x, j) => j === 0 || x - (sf[j - 1] as number) >= 1000), "one call a second to the public host (D-2 l.130, G-20)");
});

test("dojo_tick_is_idempotent", async () => {
  const f = fresh();
  sim.beta = betaOf(D1);
  clock(T(D1) + 120);
  await run(f, "--tick");
  const plan = readFileSync(dirOf(f, D1, "evidence", "plan.json"), "utf8");
  assert.equal(sim.reqs.length, 2);
  writeFileSync(dirOf(f, D1, "eve.json"), eveText());
  sim.reqs = [];
  await run(f, "--tick");
  assert.deepEqual([sim.reqs.length, readFileSync(dirOf(f, D1, "evidence", "plan.json"), "utf8")], [0, plan], "same minute: no call, the plan kept (M-T1)");
  clock((INST(D1)[0] as number) + 60);
  await run(f, "--tick");
  const first = sim.reqs.length, rec = readFileSync(dirOf(f, D1, "readings", "1.json"), "utf8");
  await run(f, "--tick");
  assert.deepEqual([first, sim.reqs.length, readFileSync(dirOf(f, D1, "readings", "1.json"), "utf8")], [10, 10, rec], "a written reading is never read again (M-T2)");
});

test("dojo_tick_before_0015_fetches_beacon_once", async () => {
  const f = fresh();
  sim.beta = betaOf(D1);
  for (const s of [0, 300, 600]) { clock(T(D1) + s); await run(f, "--tick"); }
  assert.deepEqual(sim.reqs.map((r) => r.op), ["relay-1", "relay-2"], "passes of 00:00, 00:05 and 00:10: one GET per relay for the whole day");
  const g = fresh();
  for (const s of [0, 300, 600]) { clock(T(D1) + s); await run(g, "--tick"); }
  assert.equal(sim.reqs.length, 3 * 2, "no beta: each pass asks both relays once (a 404 is not retried), no plan");
  const before = sim.reqs.length;
  sim.beta = betaOf(D1);
  clock(T(D1) + 900);
  await run(g, "--tick");
  writeFileSync(dirOf(g, D1, "eve.json"), eveText());
  for (const s of INST(D1)) { clock(s + 1); await run(g, "--tick"); }
  assert.equal(sim.reqs.length, before, "from 00:15 without beta: no GET, no reading, no instant");
  assert.equal((JSON.parse(readFileSync(dirOf(g, D1, "evidence", "plan.json"), "utf8")) as { beacon: unknown }).beacon, null);
  clock(T(D2));
  await run(g, "--tick");
  assert.equal(readDayLayout(dirOf(g, D1)).bundle.reason, "beacon_unavailable");
});

test("dojo_tick_at_instant_launches_one_reading", async () => {
  let n = 0, beta = betaOf(D1); // SYNTHETIC betas: the first whose two instants fall within 600 s of each other
  const near = (b: string): number => { const t = instantsOf(D1, SEED(1), b); return t.findIndex((x, j) => j > 0 && x - (t[j - 1] as number) <= 600); };
  while (near(beta) < 0) { const b = Buffer.from(sha(`dojo-collect-beta-${String(++n)}`) + sha(`+${String(n)}`), "hex").subarray(0, 48); b[0] = ((b[0] ?? 0) & 0x3f) | 0x80; beta = b.toString("hex"); }
  const f = fresh(), j = near(beta), inst = instantsOf(D1, SEED(1), beta);
  sim.beta = beta;
  clock(T(D1) + 60);
  await run(f, "--tick");
  writeFileSync(dirOf(f, D1, "eve.json"), eveText());
  sim.reqs = [];
  clock(inst[j] as number);
  await run(f, "--tick");
  const got = [1, 2, 3, 4].filter((i) => existsSync(dirOf(f, D1, "readings", `${String(i)}.json`)));
  assert.deepEqual(got, [j, j + 1], "two instants due at one pass: two sequential readings of distinct indices");
  assert.equal(sim.reqs.length, 10 + 8, "the mint is read once");
  for (const i of got) assert.equal(readRecord(readFileSync(dirOf(f, D1, "readings", `${String(i)}.json`), "utf8")).read.instant, new Date((inst[i - 1] as number) * 1000).toISOString());
  sim.reqs = [];
  await run(f, "--tick");
  assert.equal(sim.reqs.length, 0, "no relaunch");
});

test("dojo_tick_after_day_end_closes_once", async () => {
  const f = fresh();
  await planned(f, D1);
  const end = Math.max(...INST(D1)) + 600, sums = dirOf(f, D1, "publish", "SHA256SUMS");
  clock(end - 1);
  await run(f, "--tick");
  assert.equal(existsSync(sums), false, "no close before the end of the reading day (M-T3)");
  clock(end);
  const trace: string[] = [], rel = (p: unknown): string => relative(join(f.state, "bundles"), String(p)).split(sep).join("/");
  await spy({ chmodSync: (o, p, m) => { trace.push(`chmod ${rel(p)}`); return o(p, m); }, renameSync: (o, x, y) => { trace.push(`rename ${rel(y)}`); return o(x, y); } }, () => run(f, "--tick"));
  const [a, b] = [dateOf(D1), dateOf(D2)], want = [`rename ${a}/readings/1.json`, `chmod ${a}/readings`, `rename ${a}/readings/SHA256SUMS`, `rename ${a}/publish/day.json`,
    `rename ${a}/publish/SHA256SUMS`, `rename ${b}/eve.json`];
  assert.deepEqual(trace.filter((x) => want.includes(x)), want, "write order of D-7: missed readings, rights of readings/, readings/SHA256SUMS, day.json, SHA256SUMS, then the next Eve (G-8)");
  const text = readFileSync(sums, "utf8"), next = readFileSync(dirOf(f, D2, "eve.json"), "utf8");
  clock(end + 300);
  await run(f, "--tick");
  assert.deepEqual([readFileSync(sums, "utf8"), readFileSync(dirOf(f, D2, "eve.json"), "utf8")], [text, next], "closed once");
  assert.deepEqual(readDayLayout(dirOf(f, D1)).records.map((r) => r.read.read_at === null), [true, true, true, false], "three missed readings; the last read at end - 1");
  assert.deepEqual(readEve(next).accounts, ROWS.map((r) => [r[0], r[1]]).sort((x, y) => byBytes(x.join(" "), y.join(" "))), "Eve of d + 1: the accepted (account, owner) of the day");
  if (process.platform !== "win32") assert.deepEqual(["evidence", "readings"].map((d) => statSync(dirOf(f, D1, d)).mode & 0o777), [0o700, 0o750], "rights (D-7)");
});

test("dojo_tick_fills_the_days_it_missed", async () => {
  const f = fresh(), eve = eveText([ADDR.D]);
  await planned(f, D1, eve);
  clock(Math.max(...INST(D1)) + 600);
  await run(f, "--tick");
  const carried = readFileSync(dirOf(f, D2, "eve.json"), "utf8");
  rmSync(dirOf(f, D2), { recursive: true }); // a crash after publish/SHA256SUMS of D1, then the collector stopped four days (Q-7)
  sim.beta = betaOf(D1 + 5);
  clock(T(D1 + 5) + 60);
  await run(f, "--tick");
  for (const d of [D2, D2 + 1, D2 + 2, D2 + 3]) assert.deepEqual([readDayLayout(dirOf(f, d)).bundle.reason, readFileSync(dirOf(f, d, "eve.json"), "utf8")], ["beacon_unavailable", carried], "one pass: every missed day closed, the last Eve carried");
  assert.equal(readFileSync(dirOf(f, D1 + 5, "eve.json"), "utf8"), carried, "the Eve of today is there before its first reading");
});

test("dojo_tick_stops_on_a_missing_first_eve_after_the_plan", async () => {
  const f = fresh();
  clock(T(D1) + 900);
  await run(f, "--tick"); // the first day read: a null plan (no beta by 00:15), its Eve never deposited (act A-11)
  sim.beta = betaOf(D2);
  clock(T(D2) + 60);
  assert.equal(await codeOf(run(f, "--tick")), "eve_missing", "a named stop at the close of the first day read (Q-G2-5)");
  assert.deepEqual([sim.reqs.length, existsSync(dirOf(f, D2, "evidence", "plan.json")), existsSync(dirOf(f, D1, "publish"))], [2, true, false], "the plan of the next day is still made");
  writeFileSync(dirOf(f, D1, "eve.json"), eveText([ADDR.D])); // the act done late: the chain resumes at the next pass
  await run(f, "--tick");
  assert.deepEqual([readDayLayout(dirOf(f, D1)).bundle.reason, readFileSync(dirOf(f, D2, "eve.json"), "utf8")], ["beacon_unavailable", eveText([ADDR.D])]);
});

// ---- the integration oracle: two days, a closed account, a disagreement, a purchase during the day, a missed reading ----
const NEW: Row = [ADDR.A, ADDR.B, "5000000", "5000000"]; // SYNTHETIC purchase: a new account of a new address
const DAYS: (Row[] | null)[][] = [
  [ROWS, bump(ROWS, H1 as string, 3), [...ROWS, NEW], null],
  [0, 1, 2, 3].map((k) => [...(k === 0 ? ROWS : ROWS.filter((r) => r[0] !== S165)), NEW].map((r) => (r[0] === TARGET ? bump([r], TARGET, 3)[0] as Row : r))),
];
/** Expected composed reads from the truth rows (C-1, C-9): the sum of an address's accounts when each concords, null when one does
 *  not, "0" without account, null for a missed reading. */
function oracle(readings: (Row[] | null)[], eve: { addresses: string[]; accounts: [string, string][] }): { address: string; reads: (string | null)[] }[] {
  const all = new Set([...eve.addresses, ...eve.accounts.map((x) => x[1]), ...readings.flatMap((rs) => (rs ?? []).map((r) => r[1]))]);
  return [...all].sort(byBytes).map((address) => ({ address, reads: readings.map((rs) => {
    if (rs === null) return null;
    const mine = rs.filter((r) => r[1] === address);
    return mine.some((r) => r[2] !== r[3]) ? null : String(mine.reduce((s, r) => s + BigInt(r[2] ?? "0"), 0n));
  }) }));
}
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));
const red = (n: bigint, d: bigint): [string, string] => [String(n / gcd(n, d)), String(d / gcd(n, d))];

test("dojo_collect_to_verify_end_to_end", async () => {
  const f = fresh(), eve1 = { addresses: [ADDR.D], accounts: [] as [string, string][] }; // first day: the history's addresses only (Q-2)
  const pyth = Buffer.from((JSON.parse(readFileSync(new URL("./fixtures/collect/accounts.json", import.meta.url), "utf8")) as { pyth: { a: { value: { data: [string] } } } }).pyth.a.value.data[0], "base64");
  let price = 0n;
  for (let k = 80; k >= 73; k--) price = (price << 8n) | BigInt(pyth[k] as number);
  for (const [n, d] of [D1, D2].entries()) {
    sim.beta = betaOf(d);
    clock(T(d) + 60);
    await run(f, "--tick");
    if (n === 0) writeFileSync(dirOf(f, d, "eve.json"), eveText(eve1.addresses));
    for (const [k, t] of INST(d).entries()) {
      const rows = DAYS[n]?.[k];
      if (rows === null || rows === undefined) continue;
      sim.rows = rows;
      clock(t + 20);
      await run(f, "--tick");
    }
  }
  clock(Math.max(...INST(D2)) + 600);
  await run(f, "--tick");
  const layouts = [D1, D2].map((d) => readDayLayout(dirOf(f, d)));
  const eve2 = readEve(readFileSync(dirOf(f, D2, "eve.json"), "utf8"));
  assert.deepEqual(eve2.addresses, layouts[0]?.bundle.addresses?.map((a) => a.address), "Eve of d + 1 = the addresses of bundle d (Q-2)");
  for (const [n, d] of [D1, D2].entries()) {
    const L = layouts[n], dir = dirOf(f, d), shaOf = (p: string): string => sha(readFileSync(join(dir, ...p.split("/"))));
    const b = L?.bundle, recs = ["readings/1.json", "readings/2.json", "readings/3.json", "readings/4.json"];
    assert.deepEqual([b?.status, b?.reason, b?.mint_check, b?.beacon?.signature], ["counted", null, "ok", betaOf(d)]);
    assert.deepEqual(b?.addresses?.map((a) => ({ address: a.address, reads: a.reads })), oracle(DAYS[n] as (Row[] | null)[], n === 0 ? eve1 : eve2 as never), `composed reads of day ${String(n + 1)}`);
    assert.deepEqual(b?.accounts_no_quorum_persistent, n === 0 ? [] : [{ account: TARGET }], "persistent disagreements (D-7, CF-1)");
    assert.deepEqual(b?.pool_price_daily, red(161_206_676_086n, 117_283_623_429_277n), "r_S = 161 206 676 086 (ADR section 1.3 l.56) over the pool base amount");
    assert.deepEqual(b?.usd_per_sol_daily, red(price, 10n ** 8n), "Pyth price x 10^-8 (exponent -8, section 1.3 l.57)");
    assert.equal(readFileSync(join(dir, "publish", "SHA256SUMS"), "utf8"), ["eve.json", "publish/day.json", ...recs].map((p) => `${shaOf(p)}  ${p}\n`).join(""), "publish/SHA256SUMS: set, order, format");
    assert.equal(readFileSync(join(dir, "readings", "SHA256SUMS"), "utf8"), ["eve.json", ...recs].map((p) => `${shaOf(p)}  ${p}\n`).join(""));
    assert.deepEqual([b?.records_sha256, b?.eve_sha256], [recs.map(shaOf), shaOf("eve.json")], "the listed sha256 are those of the bundle");
    for (const p of ["eve.json", "publish/day.json", ...recs]) assert.doesNotMatch(readFileSync(join(dir, ...p.split("/")), "utf8"), /helius|solana-foundation|drand|cloudflare/i, `${p}: no operator label`);
  }
  assert.equal(layouts[0]?.records[3]?.read.read_at, null, "reading 4 of day 1 missed, written by the close");
  const missed = JSON.parse(readFileSync(dirOf(f, D1, "readings", "4.json"), "utf8")) as Record<string, Record<string, unknown> | unknown[]>;
  for (const edit of [{ read: { ...missed.read, slot_min: 1 } }, { enumerations: [{ accounts: [], context_slot: 1 }] }, { pool: { quote_amount: "1", quote_slots: [], slots: [], virtual_quote_reserves: "0" } }]) {
    assert.equal(await codeOf(Promise.resolve().then(() => readRecord(`${canonical({ ...missed, ...edit })}
`))), "record_malformed", "DOJO-READER-MISSED-FORM-1: a missed reading carries empty forms only");
  }
  for (const [edit, want] of [[(d: string) => writeFileSync(join(d, "publish", "extra.json"), "{}"), "layout_stray_file"], [(d: string) => rmSync(join(d, "readings", "2.json")), "layout_malformed"],
    [(d: string) => writeFileSync(join(d, "readings", "1.json"), readFileSync(join(d, "readings", "1.json"), "utf8").replace("dojo-reading-v1", "dojo-reading-v2")), "layout_sha_mismatch"],
    [(d: string) => writeFileSync(join(d, "publish", "day.json"), " "), "layout_sha_mismatch"], [(d: string) => writeFileSync(join(d, "readings", "9.json"), "{}"), "layout_stray_file"]] as const) {
    const copy = `${dirOf(f, D1)}-copy`;
    rmSync(copy, { recursive: true, force: true });
    cpSync(dirOf(f, D1), copy, { recursive: true });
    edit(copy);
    assert.equal(await codeOf(Promise.resolve().then(() => readDayLayout(copy))), want);
  }
  // Step 4: the fixture's ephemeral key signs an anchor and the two snapshots in the editor's place (PR-3a absent); lines from the bundles.
  const key = newKey(), series = new Map<string, (string | null)[]>();
  const linesOf = (d: number, addrs: readonly { address: string; class: string; reads: readonly (string | null)[] }[]): Line[] => addrs.flatMap((a) => {
    const s = series.get(a.address) ?? [], was = a.class === "holder" ? lotsOf(s) : [];
    while (s.length < d - DAY1) s.push(null);
    const m = dayValue(a.reads.map((r) => [r]));
    s.push(m);
    series.set(a.address, s);
    if (!a.reads.some((r) => r !== null && r !== "0") && was.length === 0) return [];
    const held = a.class === "holder" ? { lots: lotsOf(s), score: scoreOf(s), validated: validatedOf(s, 30), provisional: provisionalOf(s, 30) } : { lots: [], score: "0", validated: "0", provisional: "0" };
    return [{ address: a.address, class: a.class, reads: a.reads, day_value: m, ...held, units: null, tier: null, holder_counted: null }];
  });
  const snap = (d: number, n: number): Line => { const b = layouts[n]?.bundle; return { kind: "snapshot", published_at: at(d + 1, 1), day: b?.day, seed: b?.seed, beacon: b?.beacon, reads: b?.reads,
    mint: b?.mint, decimals: b?.decimals, price_version: null, lines_sha256: "", lines_count: 0, root: "", score_total: "0", validated_total: "0", holders_count: null, status: b?.status }; };
  const steps = [{ key, body: ANCHOR }, { key, body: historyBody(ANCHOR_DAY) }, { key, body: snap(D1, 0) }, { key, body: snap(D2, 1) }];
  const files = new Map<number, object[]>([[1, []], [2, linesOf(D1, layouts[0]?.bundle.addresses ?? [])], [3, linesOf(D2, layouts[1]?.bundle.addresses ?? [])]]);
  const verify = (edit?: (s: { body: Line }[]) => void) => verifyDojoServed({ source: dirSource(writeTree(render(steps, files, edit))), keyring: dojoKeyringOf([[key, 1]]) });
  const ok = await verify();
  assert.deepEqual([ok.ok, ok.ok && ok.status, ok.ok && ok.snapshots], [true, "consistent_with_supplied_keyring", 2], JSON.stringify(ok));
  const reads = (s: { body: Line }[]): { instant: string }[] => s[3]?.body.reads as { instant: string }[];
  const moved = await verify((s) => { const rs = structuredClone(reads(s)), r = rs[0]; if (r && s[3]) { r.instant = new Date(Date.parse(r.instant) + 1000).toISOString(); s[3].body.reads = rs; } });
  const beta = await verify((s) => { if (s[3]) s[3].body.beacon = { ...(s[3].body.beacon as object), signature: betaOf(D1) }; });
  assert.deepEqual([moved.ok, moved.reason, beta.ok, beta.reason], [false, "read_instant_mismatch", false, "read_instant_mismatch"], "altered instant, altered beta: refused");
  removeTrees();
  for (const d of [D1, D2]) readFileSync(dirOf(f, d, "evidence", "runs.jsonl"), "utf8").split("\n").slice(0, -1).reduce<string | null>((prev, l) => {
    const o = JSON.parse(l) as { prev: unknown; calls: (string | null)[][] }, gz = (h: string): string => gunzipSync(readFileSync(dirOf(f, d, "evidence", "parsed", `${h}.json.gz`))).toString("utf8");
    const bodies = o.calls.flatMap((x) => (typeof x[2] === "string" ? [[x[2], gz(x[2])] as const] : []));
    assert.deepEqual([o.prev, bodies.map(([, b]) => [sha(b), canonical(JSON.parse(b))])], [prev === null ? null : sha(`${prev}\n`), bodies.map(([h, b]) => [h, b])],
      "runs.jsonl chained (D-7, Q-6); evidence/parsed/<sha256>.json.gz holds the canonical parsed result (Q-G2-4)");
    return l;
  }, null);
  const all = [...DOJO_COLLECT_REFUSALS, ...DOJO_LAYOUT_REFUSALS, ...DOJO_BUNDLE_REFUSALS];
  assert.deepEqual(all.filter((c) => DOJO_VERIFY_REFUSALS.includes(c)), [], "the collector's refusals are outside the verifier's 45 codes");
  assert.equal(canonical(PINNED), canonical(READ_RULE), "pinned read_rule = the fixture's = /info of two relays (FAITS drand, trunk l.26)");
});
