// RPC-GUARD-RECONCILE-1b TARIFF (ADR-RPC-GUARD-RECONCILE-1 D-2, D-5 tests (7)-(11), pipe TU-gt): a gTfA call carries TWO numbers,
// the worst case RESERVED by `meter` on the write-ahead `attempted` line, then a `settled` line with the SIGNED delta to the
// credits billed on the RENDERED count. Oracle = the credits page read on site (docs/dojo/FAITS-cp1d-lectures-2026-09-26.md
// L-2 [lu]: "Full transactions cost 10 credits per 100 returned; signatures-only responses cost 10 credits flat", table
// 1-100 -> 10, 250 -> 30, 1,000 -> 100, "Failed API responses Free"; L-1: `limit` default 1000, 1-1000), never the code.
// Offline: globalThis.fetch is a stub behind the REAL openGuardedClient; a socket or a name resolution throws (traps).
import { test } from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns";
import net from "node:net";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { openGuardedClient, heliusCredits, runCli, verifyCycleLedger, BudgetExceededError, TransportError, type BudgetedClient, type CycleLedgerEntry, type RunLimits, type Snapshot } from "@monark/rpc-guard";
import { openOperatorLedger } from "../src/ledger.ts";
import { HELIUS, FAKE_HELIUS_ENV, tmp } from "./harness.ts";

net.Socket.prototype.connect = function trap(): never { throw new Error("gtfa-tariff: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("gtfa-tariff: a name was resolved"); }) as never;

const GTFA = "getTransactionsForAddress";
const LIMITS: RunLimits = { maxCalls: 50, runCaps: { helius: 1_000_000 }, methodCaps: { [GTFA]: 50, getTransaction: 50 }, cycleFloor: { helius: 0 } };
const page = (limit: unknown): unknown[] => ["MINT", { transactionDetails: "full", sortOrder: "asc", limit }];
const SIGS: unknown[] = ["MINT", { transactionDetails: "signatures", limit: 1000 }];
const res = (body: unknown, status = 200) => (): Promise<Response> => Promise.resolve(new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
const rendered = (n: number): (() => Promise<Response>) => res({ jsonrpc: "2.0", id: 1, result: { data: Array.from({ length: n }, (_, i) => ({ i })), paginationToken: null } });
const ledger = (dir: string, cycle: string): CycleLedgerEntry[] => readFileSync(join(dir, cycle, "helius.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry);
type Spent = ReturnType<BudgetedClient["spent"]>;
/** One course on the REAL openGuardedClient: fetch answers from `answers` in order (a missing answer rejects), then the
 *  served `unlock` releases the lock. Returns the number of fetches. */
async function course(dir: string, cycle: string, answers: ReadonlyArray<() => Promise<Response>>, body: (c: BudgetedClient) => Promise<void>, limits: RunLimits = LIMITS): Promise<number> {
  const real = globalThis.fetch;
  let n = 0;
  globalThis.fetch = () => { const a = answers[n++]; return a ? a() : Promise.reject(new Error("gtfa-tariff: unexpected fetch")); };
  try { await body(openGuardedClient(FAKE_HELIUS_ENV, limits, dir, { helius: cycle })); } finally { globalThis.fetch = real; }
  runCli(["unlock", "--cycle", cycle, "--op", "helius", "--reason", "gtfa-tariff course end"], { ledgerDir: dir, floor: 0, readSnapshot: () => { throw new Error("unused"); } });
  return n;
}

test("rpc_guard_gtfa_reserves_the_worst_case_before_the_call", async () => {
  // (a) the reservation (L-2 table; L-1: an absent, out-of-range, non-integer or non-number limit reads 1000): `signatures`
  //     is flat 10; an absent or unknown transactionDetails is priced `full` (an over-count only). Other methods unchanged.
  const table: Array<[readonly unknown[] | undefined, number]> = [[undefined, 100], [page(1), 10], [page(100), 10], [page(101), 20],
    [page(250), 30], [page(1000), 100], [page(0), 100], [page(5000), 100], [page("x"), 100], [page(150.5), 100],
    [["MINT", { limit: 250 }], 30], [["MINT", { transactionDetails: "accounts", limit: 250 }], 30], [SIGS, 10]];
  for (const [params, want] of table) assert.equal(heliusCredits(GTFA, params), want, `gTfA ${JSON.stringify(params)}`);
  assert.equal(heliusCredits("getTransaction", page(1000)), 1, "a non-paginated method is unchanged");
  assert.equal(heliusCredits("getProgramAccounts", page(1)), 10);
  // (b) the caps bite on the RESERVATION, BEFORE any fetch: a run cap of 99 refuses a limit-1000 page (100) that would have
  //     rendered 5 bodies (billed 10); a floor of 7_999_950 under the fixed 8 M cycle cap refuses it too, and admits limit 500.
  const { dir, cleanup } = tmp();
  try {
    assert.equal(await course(dir, "r7", [], async (c) => {
      await assert.rejects(c.call(HELIUS, GTFA, page(1000)), (e: unknown) => e instanceof BudgetExceededError && e.message.includes("run_credits"));
    }, { ...LIMITS, runCaps: { helius: 99 } }), 0, "0 fetch: refused on the reservation");
    assert.equal(await course(dir, "y7", [rendered(5)], async (c) => {
      await assert.rejects(c.call(HELIUS, GTFA, page(1000)), (e: unknown) => e instanceof BudgetExceededError && e.message.includes("cycle_cap"));
      await c.call(HELIUS, GTFA, page(500)); // 7_999_950 + 50 = 8_000_000, the inclusive cap
    }, { ...LIMITS, cycleFloor: { helius: 7_999_950 } }), 1, "the limit-1000 page refused, the limit-500 page sent");
    // (c) the write-ahead line carries the reservation: on disk at fetch time, `attempted` with 100 for a limit-1000 page.
    let atFetch: CycleLedgerEntry | undefined;
    const five = rendered(5);
    await course(dir, "c7", [() => { atFetch = ledger(dir, "c7").at(-1); return five(); }], async (c) => { await c.call(HELIUS, GTFA, page(1000)); });
    assert.deepEqual([atFetch?.outcome, atFetch?.credits_derived], ["attempted", 100]);
  } finally { cleanup(); }
});

test("rpc_guard_gtfa_settles_on_the_rendered_count", async () => {
  // A limit-1000 page reserves 100 and settles on its n rendered bodies, 10 x max(1, ceil(n/100)), NEVER capped at the
  // reservation (TY-7): n = 0, 1, 100, 101, 1000, 1500 => billed 10, 10, 10, 20, 100 (= reserved: NO line), 150. A
  // `signatures` page stays flat 10 whatever it renders (no line).
  const { dir, cleanup } = tmp();
  try {
    const ns = [0, 1, 100, 101, 1000, 1500];
    let spent: Spent | undefined;
    await course(dir, "s8", [...ns.map(rendered), rendered(250)], async (c) => {
      for (let i = 0; i < ns.length; i++) await c.call(HELIUS, GTFA, page(1000));
      await c.call(HELIUS, GTFA, SIGS);
      spent = c.spent();
    });
    const es = ledger(dir, "s8");
    verifyCycleLedger(es);
    assert.deepEqual(es.map((e) => [e.outcome, e.credits_derived]), [["attempted", 100], ["settled", -90], ["attempted", 100], ["settled", -90],
      ["attempted", 100], ["settled", -90], ["attempted", 100], ["settled", -80], ["attempted", 100], ["attempted", 100], ["settled", 50],
      ["attempted", 10], ["unlocked", 0]]);
    const settled = es.filter((e) => e.outcome === "settled"), counts = [0, 1, 100, 101, 1500];
    for (const [k, s] of settled.entries()) {
      const a = es[es.indexOf(s) - 1]!;
      assert.deepEqual(Object.keys(s), ["prev_entry_sha256", "cycle_id", "tariff_version", "by_op_method", "outcome", "credits_derived", "reason", "entry_sha256"]);
      assert.deepEqual(s.by_op_method, { [`helius|${GTFA}`]: 0 }, "a correction, never a request");
      assert.equal(s.reason, `settles:${a.entry_sha256};rendered:${String(counts[k])}`, "a settled line names ITS attempted line");
      assert.equal(s.tariff_version, "helius-2026-09-26");
    }
    assert.deepEqual(spent, { attempts: 7, byOperator: { helius: 310 } }, "spent() is net: 10+10+10+20+100+150+10");
    assert.equal(openOperatorLedger(join(dir, "s8"), "helius", 0).priorAtOpen(), 310, "the prior at reopen is net (gross: 610)");
  } finally { cleanup(); }
});

test("rpc_guard_gtfa_failure_settlement", async () => {
  // Q-O1 (a): a RECEIVED failed response (HTTP 429, HTTP 500, a JSON-RPC error) is free (L-2 "Failed API responses Free"):
  // settled to 0, the error still thrown. A network fault, a timeout, a non-JSON body and a blocked redirect keep their reservation
  // (outcome unknown). A failed `signatures` page settles to 0 as well; another method (getTransaction) is unchanged.
  const { dir, cleanup } = tmp();
  try {
    const cases: Array<[string, () => Promise<Response>]> = [["HttpError", res("rate limited", 429)], ["HttpError", res("server error", 500)],
      ["RpcError", res({ jsonrpc: "2.0", id: 1, error: { code: -32602, message: "invalid params" } })], ["TypeError", () => Promise.reject(new TypeError("fetch failed"))],
      ["NonJsonBody", res("<html>502 Bad Gateway</html>")], ["RedirectBlocked", () => Promise.resolve(new Response(null, { status: 302 }))],
      ["AbortError", () => Promise.reject(new DOMException("This operation was aborted", "AbortError"))], ["NetworkError", () => Promise.reject(Object.create(null) as Error)]];
    let spent: Spent | undefined;
    await course(dir, "f9", [...cases.map(([, a]) => a), res("server error", 500), res("rate limited", 429)], async (c) => {
      for (const [name] of cases) await assert.rejects(c.call(HELIUS, GTFA, page(1000)), (e: unknown) => e instanceof TransportError && e.name === name);
      await assert.rejects(c.call(HELIUS, "getTransaction", ["SIG"]), (e: unknown) => e instanceof TransportError && e.name === "HttpError");
      await assert.rejects(c.call(HELIUS, GTFA, SIGS), (e: unknown) => e instanceof TransportError && e.name === "HttpError");
      spent = c.spent();
    });
    const es = ledger(dir, "f9");
    verifyCycleLedger(es);
    assert.deepEqual(es.map((e) => [e.outcome, e.credits_derived, e.reason?.replace(/^settles:[0-9a-f]{64};/, "")]), [
      ["attempted", 100, undefined], ["settled", -100, "failed:HttpError"], ["attempted", 100, undefined], ["settled", -100, "failed:HttpError"],
      ["attempted", 100, undefined], ["settled", -100, "failed:RpcError"], ["attempted", 100, undefined], ["attempted", 100, undefined],
      ["attempted", 100, undefined], ["attempted", 100, undefined], ["attempted", 100, undefined], ["attempted", 1, undefined], ["attempted", 10, undefined], ["settled", -10, "failed:HttpError"],
      ["unlocked", 0, "gtfa-tariff course end"]]);
    assert.deepEqual(spent, { attempts: 10, byOperator: { helius: 501 } }, "5 reservations kept (500) + getTransaction (1); received failures are free");
  } finally { cleanup(); }
});

test("reconcile_counts_settled_lines", async () => {
  // A course of PARTIAL pages (limit 1000 rendering 250, 40, 1000: reserved 300, billed 30 + 10 + 100 = 140), then the served
  // `runCli reconcile`: the window sums attempted + settled = 140, the dashboard at the true tariff. Every reconcile appends
  // its `reconciled` boundary, so each verdict gets its own course. Witness: the same course whose results carry no `data`
  // array writes no settled line (300 reserved) => NO-GO soft at the true 140.
  const { dir, cleanup } = tmp();
  try {
    const partial = [rendered(250), rendered(40), rendered(1000)], bare = [0, 1, 2].map(() => res({ jsonrpc: "2.0", id: 1, result: { paginationToken: "t" } }));
    const three = async (c: BudgetedClient): Promise<void> => { for (let i = 0; i < 3; i++) await c.call(HELIUS, GTFA, page(1000)); };
    const file = (name: string, s: Snapshot): string => { const f = join(dir, `${name}.json`); writeFileSync(f, JSON.stringify(s)); return f; };
    const reconcile = (before: Snapshot, after: Snapshot, mode: string[] = []): ReturnType<typeof runCli> => runCli(["reconcile", "--before", file("b", before), "--after", file("a", after), "--cycle", "r10", "--op", "helius", ...mode],
      { ledgerDir: dir, floor: 0, readSnapshot: (p) => JSON.parse(readFileSync(p, "utf8")) as Snapshot });
    const pm = (v: number): Snapshot => ({ cycle: "r10", byMethod: { [GTFA]: v } }), tot = (v: number): Snapshot => ({ cycle: "r10", total_ru: v });
    await course(dir, "r10", partial, three);
    assert.deepEqual(reconcile(pm(0), pm(140)), { exitCode: 0, verdict: "GO" }, "per-method: GO at the true tariff");
    await course(dir, "r10", partial, three);
    assert.deepEqual(reconcile(pm(140), pm(281)), { exitCode: 1, verdict: "NO-GO", reason: `hard:${GTFA}` }, "per-method: +1 => NO-GO hard");
    await course(dir, "r10", partial, three);
    assert.deepEqual(reconcile(tot(281), tot(421), ["--mode", "aggregate"]), { exitCode: 0, verdict: "GO" }, "aggregate: GO at the true tariff");
    await course(dir, "r10", partial, three);
    assert.deepEqual(reconcile(tot(421), tot(562), ["--mode", "aggregate"]), { exitCode: 1, verdict: "NO-GO", reason: "hard:total" }, "aggregate: +1 => NO-GO hard");
    await course(dir, "r10", bare, three);
    assert.deepEqual(reconcile(pm(562), pm(702)), { exitCode: 1, verdict: "NO-GO", reason: "soft" }, "witness without settled lines: NO-GO soft");
    // I-2 (the merge of 1a and 1b): the COURSE window (--course-end) sums the settled lines too: GO at 140, NO-GO hard at +1.
    const courseEnd = async (): Promise<string> => { await course(dir, "r10", partial, three); return ledger(dir, "r10").at(-1)!.entry_sha256; };
    const e1 = await courseEnd();
    assert.deepEqual([reconcile(pm(702), pm(842), ["--course-end", e1]).verdict, ledger(dir, "r10").at(-1)!.outcome], ["GO", "course_reconciled"], "course mode: GO at the true tariff");
    const e2 = await courseEnd();
    assert.equal(reconcile(pm(842), pm(983), ["--course-end", e2]).reason, `hard:${GTFA}`, "course mode: +1 => NO-GO hard");
    verifyCycleLedger(ledger(dir, "r10"));
  } finally { cleanup(); }
});

test("rpc_guard_gtfa_settled_lines_are_not_attempts", async () => {
  // TY-12 (the merge with DRAND-1a): a `settled` line is a correction, never a request: by_op_method count 0, and it moves no
  // attempt counter (spent().attempts, run_calls at maxCalls, method_cap). ADR D-5 (11): at the second of the two merges this
  // test also asserts priorAttemptsAtOpen() == the attempted lines (DRAND-1a's counter; item formed in the G1 journal).
  const { dir, cleanup } = tmp();
  try {
    let attempts = -1;
    await course(dir, "a11", [rendered(5), rendered(5)], async (c) => {
      await c.call(HELIUS, GTFA, page(1000));
      await c.call(HELIUS, GTFA, page(1000)); // after a settled line: still admitted by maxCalls 2 and the method cap 2
      await assert.rejects(c.call(HELIUS, GTFA, page(1000)), (e: unknown) => e instanceof BudgetExceededError && e.message.includes("run_calls"));
      attempts = c.spent().attempts;
    }, { ...LIMITS, maxCalls: 2, methodCaps: { [GTFA]: 2 } });
    assert.equal(attempts, 2);
    assert.equal(openOperatorLedger(join(dir, "a11"), "helius", 0).priorAttemptsAtOpen(), 2, "TY-12: DRAND-1a's attempt prior ignores settled lines");
    assert.deepEqual(ledger(dir, "a11").map((e) => [e.outcome, Object.values(e.by_op_method)[0]]), [["attempted", 1], ["settled", 0], ["attempted", 1], ["settled", 0], ["refused", 1], ["unlocked", 1]]);
  } finally { cleanup(); }
});
