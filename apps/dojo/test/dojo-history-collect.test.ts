// MONARK Dojo -- PR-2b-3 oracles (ADR-DOJO-PR-2B section 4, PR-2b-3): the history collector CLI over the REAL openGuardedClient on a
// temporary ledger (outside the repo), fetch replaced by the simulated chain (helpers/history-chain.ts, imported first: no socket, no
// name resolution), the clock and the sleeps injected. Expected forms, counts and credits are recoded here from the world of the chain
// and from the D-2 table, never read from the collector. The world after SIG0 is SYNTHETIC; SIG0 and the mint tails are the fixtures.
// The corrections of the G2 (C-G2-1 to C-G2-11) add six tests after the four of section 4. The guard's ledger writes are reached through
// its declared test seam DURABLE_FS (ledger.ts:28-34), resolved from the package entry: the very instance the guard writes through.
import { HOSTS, MINT, key, sim, world, type Req, type Tx } from "./helpers/history-chain.ts";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import fs, { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { runCli, type Snapshot } from "@monark/rpc-guard";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { readingRecord, recordBytes } from "../src/bundle.ts";
import { admit, type Body } from "../src/history-read.ts";
import { DOJO_HISTORY_BOUNDS, DOJO_HISTORY_COLLECT_REASONS, DOJO_HISTORY_ENV, DOJO_HISTORY_METHODS, DOJO_HISTORY_OPS, closeHistory, composeChecks, main, runHistoryCollect,
  type RunDeps } from "../src/history-collect.ts";

const [OA, OB] = DOJO_HISTORY_OPS, T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", NOW = Date.UTC(2026, 8, 12, 12), END = Date.UTC(2026, 8, 12, 13); // J = 3 (D-10)
const ENV = { BELL_SOLANA_RPC: `https://${HOSTS.a}`, CHAINSTACK_SOLANA_URL: `https://${HOSTS.b}`,
  ...Object.fromEntries(Object.values(DOJO_HISTORY_ENV).flatMap(([id, floor]) => [[id, "cyc"], [floor, "1"]])) };
const TX = { encoding: "jsonParsed", maxSupportedTransactionVersion: 1, commitment: "finalized" }; // D-2, recoded
const roots: string[] = [];
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
type F = { root: string; state: string; mint: string; cut: string };
function fresh(n = 60, every = 3): F {
  Object.assign(sim, { txs: world(n, every), reqs: [], nowMs: NOW, tick: 0, drop: { a: new Set(), b: new Set() }, pageDrop: new Set(), diverge: new Set(), override: null });
  const root = mkdtempSync(join(tmpdir(), "dojo-history-")), f = { root, state: join(root, "state"), mint: join(root, "mint.txt"), cut: String(sim.txs.at(-1)?.slot) };
  roots.push(root);
  mkdirSync(join(f.state, "ledger"), { recursive: true });
  copyFileSync(new URL("../../../out/mint.txt", import.meta.url), f.mint);
  return f;
}
const argv = (f: F, phase: string, over: Record<string, string> = {}): string[] => Object.entries({ "--phase": phase, "--state": f.state, "--mint-file": f.mint, "--cut": f.cut,
  "--max-calls": "5000", "--max-credits": "400", "--max-ru": "4000", "--deadline": "2026-09-12T13:00:00Z", ...over }).flat();
const deps = (o: Partial<RunDeps> = {}): RunDeps => ({ env: ENV, nowMs: () => sim.nowMs, sleep: () => Promise.resolve(), ...o });
const run = async (f: F, phase: string, over?: Record<string, string>, o?: Partial<RunDeps>): Promise<string | null> => (await runHistoryCollect(argv(f, phase, over), deps(o))).stop_reason;
const codeOf = async (p: Promise<unknown>): Promise<string> => { try { await p; return "none"; } catch (e) { return (e as { code?: string }).code ?? (e as Error).constructor.name; } };
const json = (p: string): Record<string, unknown> => JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
const lastRun = (f: F, file: string): Record<string, unknown> => { const d = join(f.state, "evidence", "runs"), r = readdirSync(d).sort().at(-1) ?? ""; return json(join(d, r, file)); };
const gets = (op: "a" | "b", reqs: Req[] = sim.reqs): string[] => reqs.filter((r) => r.op === op && r.method === "getTransaction").map((r) => String(r.params[0]));
const ok = (t: Tx): boolean => !t.failed;
const byPos = (p: Tx, q: Tx): number => p.slot - q.slot || p.rank - q.rank;
const locks = (f: F): string[] => readdirSync(join(f.state, "ledger", "cyc")).filter((n) => n.endsWith(".lock"));
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

interface Seam { writeSync: (fd: number, d: string | Uint8Array) => void; renameSync: (from: string, to: string) => void }
const DFS = ((await import(new URL("./ledger.ts", import.meta.resolve("@monark/rpc-guard")).href)) as { DURABLE_FS: Seam }).DURABLE_FS, { writeSync: W, renameSync: RN } = DFS;
const seam = async <T>(over: Partial<Seam>, body: () => Promise<T>): Promise<T> => { Object.assign(DFS, over); try { return await body(); } finally { Object.assign(DFS, { writeSync: W, renameSync: RN }); } };

test("dojo_history_calls_have_the_closed_forms", async () => {
  const f = fresh(1060, 10), newest = sim.txs.at(-1) as Tx; // 1 061 index entries: two pages of getSignaturesForAddress per operator; eleven pages of 100 bodies
  sim.pageDrop.add(newest.sig); // a body of R absent from the last page: one complement at the first operator (M-Y20)
  assert.deepEqual([await run(f, "A"), await run(f, "B")], [null, null], "phases A and B end without stop on the default chain");
  const desc = [...sim.txs].sort((p, q) => byPos(q, p)), oldest = [...sim.txs].sort(byPos), seen = { a: 0, b: 0, page: 0 };
  for (const r of sim.reqs) {
    assert.ok(DOJO_HISTORY_METHODS.includes(r.method), `method in the closed list: ${r.method}`);
    if (r.method === "getSignaturesForAddress") {
      const i = seen[r.op]++, before = i === 0 ? {} : { before: desc[1000 * i - 1]?.sig };
      assert.deepEqual(r.params, [MINT, { limit: 1000, ...before, commitment: "finalized" }], "gSFA closed form, before = last signature of the page");
    } else if (r.method === "getTransactionsForAddress") {
      const i = seen.page++, t = oldest[100 * i - 1], token = i === 0 || t === undefined ? {} : { paginationToken: `${String(t.slot)}:${String(t.rank)}` };
      assert.equal(r.op, "a", "getTransactionsForAddress at the first operator only");
      assert.deepEqual(r.params, [MINT, { transactionDetails: "full", sortOrder: "asc", limit: 100, ...TX, ...token }], "gTFA closed form: full, asc, limit 100, V = 1, finalized");
    } else assert.deepEqual(r.params, [r.params[0], TX], "getTransaction closed form");
  }
  assert.deepEqual([seen.a, seen.b, seen.page], [2, 2, 11], "pages of A per operator and of B");
  assert.deepEqual(gets("a"), [newest.sig], "the one body of R absent from the pages is completed at a, in the closed form");
  assert.deepEqual(gets("b").sort(), sim.txs.filter(ok).map((t) => t.sig).sort(), "the second operator reads exactly R (F never)");
  assert.deepEqual(readdirSync(join(f.state, "ledger", "cyc")).filter((n) => n.endsWith(".jsonl")).sort(), [`${OB}.jsonl`, `${OA}.jsonl`].sort(), "no third operator opened");
  assert.deepEqual(Object.keys((lastRun(f, "run.json").spent as { byOperator: object }).byOperator).sort(), [OA, OB].sort());
  assert.deepEqual(lastRun(f, "checks.json").composed, ["supply", "instructions", "creation", "day_pairing", "bounds"], "the composed checks, recorded once passed (C-G2-11)");
});

test("dojo_history_x10_guard_refuses_before_any_lock", async () => {
  const f = fresh(), ok = argv(f, "A"), repo = fileURLToPath(new URL("../../../", import.meta.url)), other = join(f.root, "other"), link = join(f.root, "link");
  writeFileSync(join(f.root, "other.txt"), `${key("other mint")}\n`); // a well-formed address, not the pinned file (TU-3)
  mkdirSync(join(other, ".git"), { recursive: true }); mkdirSync(join(other, "sub", "state"), { recursive: true }); symlinkSync(join(other, "sub"), link, "junction");
  mkdirSync(join(f.root, "wt")); writeFileSync(join(f.root, "wt", ".git"), "gitdir: elsewhere\n"); // a git tree, a junction into it, the .git file of a worktree
  const swap = (flag: string, v: string): string[] => ok.map((x, j) => (ok[j - 1] === flag ? v : x));
  const cases: [string[], Record<string, string | undefined>, string][] = [[[...ok, "--x", "1"], ENV, "usage"], [[...ok, "--phase", "A"], ENV, "usage"], [ok.slice(2), ENV, "usage"],
    [swap("--phase", "C"), ENV, "usage"], [swap("--deadline", "2026-09-12T13:00:00"), ENV, "usage"], [swap("--max-ru", "0"), ENV, "usage"], [swap("--state", repo), ENV, "state_inside_repo"],
    [swap("--state", join(repo, "..g2x", "state")), ENV, "state_inside_repo"], [swap("--state", join(other, "state")), ENV, "state_inside_repo"], // `..g2x` is a name, inside the repo
    [swap("--state", join(f.root, "wt", "state")), ENV, "state_inside_repo"], [swap("--state", join(link, "state")), ENV, "state_inside_repo"], // its real path is inside the git tree
    [swap("--state", "state"), ENV, "state_path_malformed"], [swap("--state", `${f.root}${sep}x${sep}..${sep}state`), ENV, "state_path_malformed"],
    [swap("--mint-file", join(f.root, "none")), ENV, "mint_mismatch"], [swap("--mint-file", join(f.root, "other.txt")), ENV, "mint_mismatch"], [ok, { ...ENV, [DOJO_HISTORY_ENV[OB][1]]: "0" }, "cycle_missing"],
    [swap("--max-credits", "800000"), ENV, "budget_guard"], [swap("--max-ru", "16000000"), ENV, "budget_guard"]]; // 1 + 10 x 800 000 > 8 000 000; 1 + 16 000 000 > 16 000 000
  for (const [a, env, want] of cases) assert.equal(await codeOf(runHistoryCollect(a, deps({ env }))), want, a.join(" "));
  assert.deepEqual([sim.reqs.length, readdirSync(join(f.state, "ledger")), existsSync(join(repo, "..g2x"))], [0, [], false], "refused before any lock: no cycle directory, no .lock, no ledger line");
  assert.equal(await codeOf(runHistoryCollect(argv(f, "B"), deps())), "phase_order", "B before A: refused before the lock");
  mkdirSync(join(f.state, "ledger", "cyc"));
  writeFileSync(join(f.state, "ledger", "cyc", `${OB}.lock`), "{}");
  assert.equal(await codeOf(runHistoryCollect(ok, deps())), "lock_held", "a held lock: no call (TY-12)");
  assert.deepEqual([sim.reqs.length, readdirSync(join(f.state, "ledger", "cyc"))], [0, [`${OB}.lock`]], "rollback: no other lock, no line");
  rmSync(join(f.state, "ledger", "cyc", `${OB}.lock`));
  assert.equal(await run(f, "A", { "--max-credits": "799999", "--max-ru": "15999999" }), null, "at the bound: 1 + 7 999 990 <= 8 000 000, 1 + 15 999 999 <= 16 000 000");
  assert.equal(await codeOf(run(f, "A", { "--cut": String(Number(f.cut) + 1) })), "inputs_mismatch", "a resume keeps the fixed inputs (D-11 step 2)");
  const dots = join(f.root, "..x", "state"); mkdirSync(join(dots, "ledger"), { recursive: true });
  assert.equal(await run({ ...f, state: dots }, "A"), null, "`..x` is a name, not a parent segment: accepted outside any repository (C-G2-4)");
});

test("dojo_history_budget_stops_fail_closed", async () => {
  const f = fresh(1060, 10), R = sim.txs.filter(ok).length, evid = join(f.state, "evidence");
  assert.equal(await run(f, "A"), null);
  sim.reqs = [];
  const k = sim.txs.slice(0, 100).filter(ok).length + 1; // the stop falls inside the batch of the second page (every tenth transaction succeeds)
  assert.equal(await run(f, "B", { "--max-ru": String(2 * k) }), "run_credits", "2 RU per getTransaction: the next one is refused (D-11)");
  assert.deepEqual([gets("b").length, sim.reqs.at(-1)?.method, sim.reqs.at(-1)?.op], [k, "getTransaction", "b"], "no call after the BudgetExceededError");
  assert.deepEqual(json(join(evid, "status.json")), { status: "partial", stop_reason: "run_credits" });
  assert.equal(existsSync(join(f.state, "publish")), false, "no publish/ on a stop");
  const cyc = join(f.state, "ledger", "cyc"), unlocked = lastRun(f, "run.json").unlocked as Record<string, string>;
  for (const op of DOJO_HISTORY_OPS) {
    const lines = readFileSync(join(cyc, `${op}.jsonl`), "utf8").trim().split("\n").map((l) => JSON.parse(l) as { outcome: string; entry_sha256: string });
    assert.equal(existsSync(join(cyc, `${op}.lock`)), false, `${op} unlocked in finally`);
    assert.equal(unlocked[op], lines.filter((l) => l.outcome === "unlocked").at(-1)?.entry_sha256, `sha256 of the ${op} unlocked line consigned (D-11)`);
  }
  // Served reconcile of the courses (TU-rg). On this fresh ledger the current window (since the last `reconciled` line) is exactly the
  // two courses; the --course-end form is item RECONCILE-WINDOW-1 (not delivered: journal Q-1). Dashboard snapshots simulated from the chain.
  const page = sim.reqs.filter((r) => r.method === "getTransactionsForAddress").length, pre = 2 * 2; // phase A: two pages per operator
  const snaps: Record<string, Snapshot> = { h0: { cycle: "cyc", byMethod: {} }, h1: { cycle: "cyc", byMethod: { getSignaturesForAddress: 2, getTransactionsForAddress: 10 * page } },
    h2: { cycle: "cyc", byMethod: { getSignaturesForAddress: 2, getTransactionsForAddress: 10 * page + 1 } }, c0: { cycle: "cyc", total_ru: 0 }, c1: { cycle: "cyc", total_ru: pre + 2 * k },
    c2: { cycle: "cyc", total_ru: pre + 2 * k + 1 } };
  const rec = (dir: string, op: string, after: string): string => { const r = runCli(["reconcile", "--before", `${after[0] ?? ""}0`, "--after", after, "--cycle", "cyc", "--op", op,
    ...(op === OB ? ["--mode", "aggregate"] : [])], { ledgerDir: dir, floor: 1, readSnapshot: (p) => snaps[p] as Snapshot }); return `${r.verdict ?? ""} ${r.reason ?? ""}`.trim(); };
  cpSync(join(f.state, "ledger"), join(f.root, "copy"), { recursive: true });
  assert.deepEqual([rec(join(f.root, "copy"), OA, "h2"), rec(join(f.root, "copy"), OB, "c2")], ["NO-GO hard:getTransactionsForAddress", "NO-GO hard:total"], "a snapshot one unit above");
  assert.deepEqual([rec(join(f.state, "ledger"), OA, "h1"), rec(join(f.state, "ledger"), OB, "c1")], ["GO", "GO"], "snapshots equal to the counted course");
  // Resume (D-11): the closed units are served from the evidence; only the others are called.
  const closed = gets("b");
  sim.reqs = [];
  assert.equal(await run(f, "B"), null, "the resumed phase B completes");
  assert.deepEqual([gets("b").length, gets("b").filter((s) => closed.includes(s))], [R - k, []], "no closed body read again");
  const [stamp] = readdirSync(join(evid, "raw", "B", OB)), rawFile = join(evid, "raw", "B", OB, stamp ?? "");
  const ledgerOf = (): string => readFileSync(join(cyc, `${OA}.jsonl`), "utf8"), before = ledgerOf();
  writeFileSync(rawFile, readFileSync(rawFile).subarray(1));
  assert.deepEqual([await run(f, "B"), ledgerOf() === before, lastRun(f, "run.json").stop_detail], ["evidence_corrupt", true, `raw/B/${OB}/${stamp ?? ""}`], "an altered raw response stops before any lock (D-11 step 1)");
  // Duration (C-27): one minute per request, the course ends at NOW + 5 min: two requests in A, three in B, then course_timeout.
  const g = fresh();
  Object.assign(sim, { tick: 60_000 });
  assert.deepEqual([await run(g, "A", { "--deadline": "2026-09-12T12:05:00Z" }), sim.reqs.length], [null, 2]);
  assert.deepEqual([await run(g, "B", { "--deadline": "2026-09-12T12:05:00Z" }), sim.reqs.length], ["course_timeout", 5], "no call past --deadline");
  assert.ok(["course_timeout", "transport_fault", "cursor_stalled", "unlock_unconfirmed", "secret_in_response"].every((r) => DOJO_HISTORY_COLLECT_REASONS.includes(r)));
  // Transport (D-3 phase B, withRetry of quorum.ts): a page answering HTTP 500 is tried four times, each a guarded call, then transport_fault.
  const t5 = fresh();
  assert.equal(await run(t5, "A"), null);
  Object.assign(sim, { reqs: [], override: (r: Req) => (r.method === "getTransactionsForAddress" ? new Response("busy", { status: 500 }) : undefined) });
  assert.deepEqual([await run(t5, "B"), sim.reqs.length], ["transport_fault", 4]);
  // Composition (DOJO-HISTORY-CHECKS-COMPOSITION-1): each check stops phase B fail-closed, partial, no publish/.
  const probes: [string, (w: Tx[]) => void][] = [
    ["supply_mismatch", (w) => { ((w.filter(ok)[1]?.body.transaction as { message: { instructions: unknown[] } }).message.instructions).push({ programId: T22, parsed: { type: "mintTo", info: { mint: MINT, account: key("x"), amount: "5" } } }); }],
    ["instruction_not_allowed", (w) => { (((w.filter(ok)[2]?.body.transaction as { message: { instructions: { parsed: { type: string } }[] } }).message.instructions[0] as { parsed: { type: string } }).parsed.type = "approve"); }],
    ["creation_mismatch", (w) => { const s = structuredClone(w[0]?.body) as { meta: { innerInstructions: { instructions: { parsed?: { type: string; info: { decimals?: number } } }[] }[] } };
      for (const g2 of s.meta.innerInstructions) for (const i of g2.instructions) if (i.parsed?.type === "initializeMint2") i.parsed.info.decimals = 9;
      (w[0] as Tx).body = s; }],
    ["bound_exceeded", (w) => { sim.diverge.add(w.filter(ok)[3]?.sig ?? ""); }], // noQuorum 1 > 0
    ["bound_exceeded", (w) => { delete (w.filter(ok)[5] as Tx).body.transactionIndex; }], // an unordered slot: 1 > 0
    ["bound_exceeded", (w) => { const m = w.find((t) => t.failed)?.body.meta as { postTokenBalances: { uiTokenAmount: { amount: string } }[] }; (m.postTokenBalances[0] as { uiTokenAmount: { amount: string } }).uiTokenAmount.amount = "1"; }], // a failed page body with pre != post: 1 > 0
    ["day_not_monotone", (w) => { const t = w.filter(ok)[4] as Tx; sim.override = (r) => (r.op === "b" && r.params[0] === t.sig ? { ...structuredClone(t.body), slot: t.slot + 1, blockTime: null } : undefined); }]];
  for (const [want, inject] of probes) {
    const h = fresh();
    inject(sim.txs);
    assert.deepEqual([await run(h, "A"), await run(h, "B")], [null, want], `composed check: ${want}`);
    assert.deepEqual([json(join(h.state, "evidence", "status.json")).stop_reason, existsSync(join(h.state, "publish")), lastRun(h, "checks.json").composed], [want, false, null]);
  }
  // The close of PR-2b-4 composes the same checks before historyBundle: SIG0 (fixtures), the first day read written by PR-2's writer.
  const fx = (n: string): unknown => JSON.parse(Buffer.from(JSON.parse(readFileSync(new URL(`./fixtures/history/${n}`, import.meta.url), "utf8")) as string, "hex").toString("utf8"));
  const x = admit(sim.txs[0]?.sig ?? "", fx("sig0.a.json"), fx("sig0.b.json"), MINT), txs = x.kind === "admitted" ? [x.tx] : ([] as Body[]), s0 = sim.txs[0] as Tx;
  const acct = ((((s0.body.meta as { postTokenBalances: { owner: string; uiTokenAmount: { amount: string } }[] }).postTokenBalances[0]))), pk = (s0.body.transaction as { message: { accountKeys: { pubkey: string }[] } }).message.accountKeys[3]?.pubkey;
  const gpa = { context: { slot: s0.slot + 5 }, value: [{ pubkey: pk, account: { data: { program: "spl-token-2022", parsed: { type: "account", info: { mint: MINT, owner: acct?.owner, state: "initialized", tokenAmount: { amount: acct?.uiTokenAmount.amount, decimals: 6 } } } } } }] };
  const records = [recordBytes(readingRecord({ day: "2026-09-11", i: 1, instant: Date.UTC(2026, 8, 11, 1) / 1000, read_at: "2026-09-11T01:00:05.000Z", enumeration: { a: gpa, b: gpa }, mint: null,
    pool: { a: null, b: null }, wsol: { a: null, b: null }, pyth: { a: null, b: null }, eve: { addresses: [], accounts: [] }, anchor: { mint: MINT, pool: key("pool"), pool_quote_vault: key("vault"), sol_usd_max_age_s: 165 } }))];
  const input = { ia: fx("mint-tail.a.json") as unknown[], ib: fx("mint-tail.b.json") as unknown[], txs, noQuorum: [], records, counts: { read: 1, contested: 0, noQuorum: 0, unordered: 0, failedMoving: 0 } };
  const b = { mint: MINT, program: T22, decimals: 6, sig0: s0.sig, sig0_slot: s0.slot, transactions_failed_excluded: 0, collector_sha256: "0".repeat(64), evidence_sha256sums_sha256: "1".repeat(64) };
  assert.equal(closeHistory(input, b).status.status, "complete", "all checks pass: complete");
  assert.equal(await codeOf(Promise.resolve().then(() => closeHistory({ ...input, counts: { ...input.counts, noQuorum: 1 } }, b))), "bound_exceeded", "a check fails: no bundle");
  const ratio = (read: number, contested: number): string => { try { composeChecks({ ...input, counts: { ...input.counts, read, contested } }, MINT); return "pass"; } catch (e) { return String((e as { code?: unknown }).code); } };
  assert.deepEqual([ratio(667, 1), ratio(666, 1), ratio(2000, 3), ratio(1999, 3)], ["pass", "bound_exceeded", "pass", "bound_exceeded"], "X / |R| <= 3 / 2 000 at the call site (P-C11)");
});

test("dojo_history_gtfa_matches_the_helius_index", async () => {
  const f = fresh(), good = sim.txs.filter(ok).slice(1), bad = sim.txs.filter((t) => t.failed), [s1, s2] = [good[4]?.sig ?? "", good[7]?.sig ?? ""];
  sim.pageDrop.add(s1); // of R, absent from the pages: completed by getTransaction at a
  for (const op of ["a", "b"] as const) sim.drop[op].add(s2); // in the pages, absent from both indexes: contested (X + 1), read at both
  sim.pageDrop.add(bad[0]?.sig ?? ""); // of F, absent from the pages: never requested; the other failures are in the pages, never requested
  assert.deepEqual(DOJO_HISTORY_BOUNDS, { contested: [3, 2000], noQuorum: 0, unordered: 0, failedMoving: 0 }, "bounds of the dated line Q-2 (G2 of PR-2b-1)");
  assert.deepEqual([await run(f, "A"), await run(f, "B")], [null, "bound_exceeded"], "X = 1 of |R| = 21 exceeds 3 / 2 000 (D-8 (vii))");
  assert.deepEqual(gets("a"), [s1], "the one body of R absent from the pages is completed at a");
  assert.deepEqual(gets("b").sort(), sim.txs.filter(ok).map((t) => t.sig).sort(), "b reads R, the contested page signature included");
  assert.deepEqual([...gets("a"), ...gets("b")].filter((s) => bad.some((t) => t.sig === s)), [], "no body of F is requested");
  const checks = lastRun(f, "checks.json") as { counts: Record<string, number>; gtfa: Record<string, number>; failed_excluded: number };
  assert.deepEqual([checks.gtfa, checks.counts.contested, checks.counts.read, checks.failed_excluded], [{ missing: 1, extra: 1, failedBodies: bad.length - 1 }, 1, good.length + 1, bad.length]);
  const g = fresh();
  sim.drop.b.add(sim.txs[0]?.sig ?? ""); // SIG0 absent from the second index: its oldest entry is not SIG0 (D-3 phase A, D-8 (iv))
  assert.deepEqual([await run(g, "A"), sim.reqs.length], ["creation_mismatch", 2], "phase A stops at the short page of b");
});

// ---- corrections of the G2 (C-G2-1 to C-G2-11) --------------------------------------------------------------------------------------
test("dojo_history_a_cursor_that_does_not_advance_stops", async () => { // C-G2-1 (X-1 of the G2): a named stop instead of a loop, locks served
  const tick = { nowMs: (): number => (sim.nowMs += 1000) }, soon = { "--deadline": "2026-09-12T12:01:00Z" }; // a clock read per unit: a served loop ends in 60 reads
  const f = fresh(1060, 10), top = [...sim.txs].sort((p, q) => byPos(q, p)).slice(0, 1000);
  sim.override = (r) => (r.op === "a" && r.method === "getSignaturesForAddress" ? top.map((t) => structuredClone(t.entry)) : undefined); // `before` ignored
  assert.deepEqual([await run(f, "A", soon, tick), sim.reqs.length, json(join(f.state, "evidence", "status.json")).stop_reason, locks(f), lastRun(f, "run.json").stop_detail],
    ["cursor_stalled", 2, "cursor_stalled", [], `A ${OA}`]);
  assert.deepEqual([await run(f, "A", soon, tick), sim.reqs.length], ["cursor_stalled", 2], "the resume serves both closed pages, then stops again without a call");
  const c = fresh(2100, 10), p1 = [...sim.txs].sort((p, q) => byPos(q, p)).slice(0, 1000), end2 = [...sim.txs].sort((p, q) => byPos(q, p))[1999]?.sig; // a cycle of two cursors
  sim.override = (r) => (r.op === "a" && (r.params[1] as { before?: string }).before === end2 ? p1.map((t) => structuredClone(t.entry)) : undefined);
  assert.deepEqual([await run(c, "A", soon, tick), sim.reqs.length], ["cursor_stalled", 3], "the third page leads back to the first cursor");
  const g = fresh(300, 10), a100 = [...sim.txs].sort(byPos)[99] as Tx, t1 = `${String(a100.slot)}:${String(a100.rank)}`; assert.equal(await run(g, "A"), null);
  let cycle = false;
  const tokens = (r: Req): unknown => { const o = r.params[1] as { paginationToken?: string }; if (r.method !== "getTransactionsForAddress" || o.paginationToken === undefined || (cycle && o.paginationToken === t1)) return undefined;
    const [s = 0, k = 0] = o.paginationToken.split(":").map(Number), next = [...sim.txs].sort(byPos).filter((t) => t.slot * 1e4 + t.rank > s * 1e4 + k).slice(0, 100);
    return { data: next.map((t) => structuredClone(t.body)), paginationToken: cycle ? t1 : o.paginationToken }; }; // the token received, echoed; or the first one
  Object.assign(sim, { reqs: [], override: tokens });
  assert.deepEqual([await run(g, "B", soon, tick), sim.reqs.filter((r) => r.method === "getTransactionsForAddress").length, sim.reqs.at(-1)?.method, lastRun(g, "run.json").stop_detail],
    ["cursor_stalled", 2, "getTransactionsForAddress", "B getTransactionsForAddress"], "the repeated token stops before any body of its page is read");
  const g2 = fresh(300, 10); assert.equal(await run(g2, "A"), null); cycle = true; Object.assign(sim, { reqs: [], override: tokens });
  assert.deepEqual([await run(g2, "B", soon, tick), sim.reqs.filter((r) => r.method === "getTransactionsForAddress").length], ["cursor_stalled", 3], "the third page leads back to the first token");
  const h = fresh(); assert.equal(await run(h, "A"), null);
  Object.assign(sim, { reqs: [], nowMs: END });
  assert.deepEqual([await run(h, "A"), sim.reqs.length], ["course_timeout", 0], "every unit is closed, yet none is served at --deadline");
});

test("dojo_history_deadline_bounds_every_retry", async () => { // C-G2-3 (P-9 of the G2) and Q-2 (--deadline)
  const busy = (r: Req): Response | undefined => (r.method === "getTransactionsForAddress" ? new Response("busy", { status: 500 }) : undefined), at: number[] = [];
  const f = fresh(); sim.nowMs = END;
  assert.deepEqual([await run(f, "A"), sim.reqs.length], ["course_timeout", 0], "no call at the deadline");
  const g = fresh(); sim.nowMs = END - 1;
  assert.deepEqual([await run(g, "A"), sim.reqs.length], [null, 2], "one millisecond before it, the course runs");
  let sleeps = 0; const h = fresh(); assert.equal(await run(h, "A"), null);
  Object.assign(sim, { reqs: [], tick: 60_000, nowMs: END - 60_000, override: busy }); // the first try leaves before the deadline, its answer comes at it
  assert.deepEqual([await run(h, "B", {}, { sleep: () => { sleeps += 1; return Promise.resolve(); } }), sim.reqs.length, sleeps], ["course_timeout", 1, 0], "onRetry reads the clock: no backoff, no retry");
  const k = fresh(); assert.equal(await run(k, "A"), null);
  Object.assign(sim, { reqs: [], tick: 0, nowMs: END - 500, override: (r: Req) => { at.push(sim.nowMs - END); return busy(r); } });
  assert.deepEqual([await run(k, "B", {}, { sleep: (ms) => { sim.nowMs += ms; return Promise.resolve(); } }), at], ["course_timeout", [-500, -100]], "the sleep reads the clock after the backoff");
});

test("dojo_history_unlock_is_confirmed_or_the_course_stops", async () => { // C-G2-2 and Q-12 (P-2 (a), (b), (c) of the G2)
  const unlockOf = (d: unknown, op: string): boolean => typeof d === "string" && d.includes('"outcome":"unlocked"') && d.includes(`"${op}|unlock"`);
  const shaOf = (f: F, op: string): unknown => (JSON.parse(readFileSync(join(f.state, "ledger", "cyc", `${op}.jsonl`), "utf8").trim().split("\n").filter((l) => unlockOf(l, op)).at(-1) ?? "{}") as { entry_sha256?: unknown }).entry_sha256;
  const fa = fresh(); // (a) a line appended after the unlocked line of the first operator
  const sa = await seam({ writeSync: (fd, d) => { W(fd, d); if (unlockOf(d, OA)) W(fd, `${JSON.stringify({ outcome: "attempted" })}\n`); } }, () => runHistoryCollect(argv(fa, "A"), deps()));
  assert.deepEqual([sa.stop_reason, sa.unlocked, json(join(fa.state, "evidence", "status.json")), lastRun(fa, "run.json").stop_reason, lastRun(fa, "run.json").unlock_stop, locks(fa)],
    ["unlock_unconfirmed", { [OA]: "unconfirmed", [OB]: shaOf(fa, OB) }, { status: "partial", stop_reason: "unlock_unconfirmed" }, null, "unlock_unconfirmed", []], "(a) through the seam");
  let armed = false; // (b) the head rename of the unlocked append skipped: the head lags one entry (ledger.ts:66-70); (c) that rename throws
  const lag = (fail: boolean): Partial<Seam> => ({ writeSync: (fd, d) => { W(fd, d); if (unlockOf(d, OA)) armed = true; },
    renameSync: (from, to) => { if (armed && to.endsWith(`${OA}.head`)) { armed = false; if (fail) throw Object.assign(new Error("EIO: test"), { code: "EIO" }); return; } RN(from, to); } });
  const fb = fresh(), codeB = await seam(lag(false), () => main(argv(fb, "A"), deps()));
  assert.deepEqual([codeB, lastRun(fb, "run.json").unlocked, locks(fb)], [1, { [OA]: "unconfirmed", [OB]: shaOf(fb, OB) }, []], "(b) exit 1, never 0 (Q-12)");
  const fc = fresh(); sim.drop.b.add(sim.txs[0]?.sig ?? ""); // a real stop first: SIG0 absent from the second index
  const codeC = await seam(lag(true), () => main(argv(fc, "A"), deps())), rc = lastRun(fc, "run.json");
  assert.deepEqual([codeC, rc.stop_reason, rc.unlock_stop, rc.unlocked, locks(fc), json(join(fc.state, "evidence", "status.json")).stop_reason],
    [1, "creation_mismatch", "unlock_unconfirmed", { [OA]: "unconfirmed", [OB]: shaOf(fc, OB) }, [`${OA}.lock`], "unlock_unconfirmed"], "(c) the second operator is still unlocked; the first reason is kept");
  const fd = fresh(), jl = join(fd.state, "evidence", "journal.jsonl"); // (d) a fault after the lock that no reason names: the journal made a directory mid-course
  sim.override = () => { rmSync(jl); mkdirSync(jl); sim.override = null; return undefined; };
  assert.deepEqual([await seam(lag(true), () => codeOf(runHistoryCollect(argv(fd, "A"), deps()))) === "none", json(join(fd.state, "evidence", "status.json")).stop_reason, lastRun(fd, "run.json").unlock_stop],
    [false, "unlock_unconfirmed", "unlock_unconfirmed"], "(d) status and run written, then the fault is thrown");
});

test("dojo_history_a_secret_in_a_response_stops_the_course_unwritten", async () => { // C-G2-7 (P-1 of the G2, its case 4 and case 1); Q-11
  const K1 = "k1-0123456789abcdef", K2 = "Pp4SECRET@path6Hh1Jj0Ll5Zz", K3 = "q3-secret-value", K4 = "b4-secret-value", K5 = "u5-secret-user", K6 = "w6-secret-pass";
  const e1 = { ...ENV, HELIUS_API_KEY: K1, CHAINSTACK_SOLANA_URL: `https://${HOSTS.b}/${K2}?q=${K3}`, BELL_SOLANA_RPC: `https://${HOSTS.a}/?id=${K4}` }; // the guard's key variables
  const e2 = { ...ENV, CHAINSTACK_SOLANA_URL: `https://${HOSTS.b}/short9key` }, e3 = { ...ENV, CHAINSTACK_SOLANA_URL: `https://${K5}:${K6}@${HOSTS.b}` }; // a short key; userinfo
  const files = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(d, e.name)) : [join(d, e.name)]));
  const leaks = (f: F, extra: string): string[] => files(f.state).filter((p) => { const b = readFileSync(p), t = (p.endsWith(".gz") ? gunzipSync(b) : b).toString("utf8").toLowerCase();
    return [K1, K2, K3, K4, K5, K6, encodeURIComponent(K2), extra].some((k) => t.includes(k.toLowerCase())); });
  const plants: [string, Record<string, string>][] = [[K1.toUpperCase(), e1], [encodeURIComponent(K2), e1], [Buffer.from(K1).toString("hex"), e1], [Buffer.from(K2).toString("base64"), e1],
    [K3, e1], [K4, e1], [e2.CHAINSTACK_SOLANA_URL, e2], [K5, e3], [K6, e3], ["see api-key=zz", ENV], [`https://x.invalid/${"0a1b".repeat(8)}`, ENV]]; // then the two declared shapes
  for (const [plant, env] of plants) {
    const f = fresh(), t = sim.txs.filter(ok)[2] as Tx; assert.equal(await run(f, "A", {}, { env }), null, `phase A: ${plant}`);
    sim.override = (r) => (r.op === "b" && r.params[0] === t.sig ? { ...structuredClone(t.body), meta: { ...(structuredClone(t.body.meta) as object), logMessages: [`debug ${plant}`] } } : undefined);
    assert.deepEqual([await run(f, "B", {}, { env }), leaks(f, plant), lastRun(f, "run.json").stop_detail], ["secret_in_response", [], `B|${OB}|getTransaction|${t.sig}`], plant);
  }
  const g = fresh(); sim.override = (r) => (r.method === "getSignaturesForAddress" ? new Response(`upstream ${K1} ${K2}`, { status: 500 }) : undefined);
  assert.deepEqual([await run(g, "A", {}, { env: e1 }), leaks(g, K1)], ["transport_fault", []], "an error body carrying both keys: nothing written");
});

test("dojo_history_disk_rpc_error_and_faulted_body_paths", async () => { // Q-9 (P-3, P-4, P-5 of the G2) and C-G2-10 (X-5)
  const J = Math.floor(NOW / 1000 / 86400) - 20706 + 1, need = 2 * Math.ceil((2 * 6467 * J * 36341) / 5.17), orig = fs.statfsSync; // D-10 l.414, recoded
  const free = (bytes?: number): void => { Object.assign(fs, { statfsSync: bytes === undefined ? orig : (p: fs.PathLike): fs.StatsFs => ({ ...orig(p), bsize: 1, bavail: bytes }) }); syncBuiltinESMExports(); };
  const f = fresh(), s = sim.txs.filter(ok).map((t) => t.sig);
  try {
    free(need - 1);
    assert.deepEqual([await codeOf(run(f, "A")), sim.reqs.length, readdirSync(join(f.state, "ledger")), existsSync(join(f.state, "evidence"))], ["disk_space", 0, [], false], "one byte short");
    free(need); assert.equal(await run(f, "A"), null, "at the exact bound the course runs");
  } finally { free(); }
  const rpc = (): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -32602, message: "Invalid params" } }), { status: 200 });
  sim.reqs = []; sim.override = (r) => (r.op === "b" && r.params[0] === s[5] ? rpc() : undefined);
  assert.deepEqual([await run(f, "B"), sim.reqs.filter((r) => r.params[0] === s[5]).length, sim.reqs.at(-1)?.params[0]], ["transport_fault", 1, s[5]], "an RpcError at b: one try, then stop");
  const g = fresh(); assert.equal(await run(g, "A"), null);
  sim.reqs = []; sim.override = (r) => (r.op !== "b" ? undefined : r.params[0] === s[3] ? new Response("busy", { status: 500 }) : r.params[0] === s[4] ? new Response('{"jsonrpc":"2.0","id":1}') : undefined);
  assert.deepEqual([await run(g, "B"), gets("b").filter((x) => x === s[3]).length, (lastRun(g, "checks.json").counts as { noQuorum: number }).noQuorum], ["bound_exceeded", 4, 2], "four tries");
  const lines = readFileSync(join(g.state, "evidence", "journal.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as { unit: string; outcome: string; raw: string | null });
  assert.deepEqual([s[3], s[4]].map((u) => lines.filter((l) => l.unit === u).map((l) => [l.outcome, l.raw === null])), [[["fault", true]], [["null", false]]], "a fault has no raw; an absent result is `null`");
  sim.reqs = []; sim.override = null;
  assert.deepEqual([await run(g, "B"), sim.reqs.map((r) => String(r.params[0]))], ["bound_exceeded", [s[3]]], "the resume calls the faulted body alone");
});

test("dojo_history_pages_order_inputs_and_raw_files_as_declared", async () => { // C-G2-11 (P-11, P-12, P-13 of the G2) and C-G2-8 (b) (X-4)
  const f = fresh(300, 2), cut = sim.txs[150]?.slot ?? 0, asc = [...sim.txs].sort(byPos), want: string[] = [], over = { "--cut": String(cut) };
  for (let i = 0; i < 200; i += 100) want.push(...asc.slice(i, i + 100).filter((t) => ok(t) && t.slot <= cut).sort((p, q) => p.slot - q.slot || (p.sig < q.sig ? -1 : 1)).map((t) => t.sig));
  assert.deepEqual([await run(f, "A", over), await run(f, "B", over)], [null, null]);
  assert.deepEqual([sim.reqs.filter((r) => r.method === "getTransactionsForAddress").length, gets("b")], [2, want], "the second page ends past S_CUT (D-3 l.247); (slot, signature) order at b");
  assert.notDeepEqual(want, asc.filter((t) => ok(t) && t.slot <= cut).map((t) => t.sig), "not vacuous: the order of the ranks differs");
  const p = join(f.state, "evidence", "journal.jsonl"), [l0 = "", ...rest] = readFileSync(p, "utf8").split("\n"), j0 = JSON.parse(l0) as { inputs: { collector_sha256: string } };
  const src = (n: string): string => sha256(readFileSync(new URL(`../src/${n}`, import.meta.url), "utf8"));
  assert.equal(j0.inputs.collector_sha256, sha256(["history-collect.ts", "history-read.ts", "history-build.ts"].map(src).join("")), "the first line pins the sources (D-11 l.426)");
  writeFileSync(p, [canonical({ ...j0, inputs: { ...j0.inputs, collector_sha256: "0".repeat(64) } }), ...rest].join("\n"));
  assert.equal(await codeOf(run(f, "A", over)), "inputs_mismatch");
  const ref = fresh(); assert.equal(await run(ref, "A"), null);
  const rel = (JSON.parse(readFileSync(join(ref.state, "evidence", "journal.jsonl"), "utf8").split("\n")[1] ?? "{}") as { raw: string }).raw, bytes = readFileSync(join(ref.state, "evidence", rel));
  const jr = join(ref.state, "evidence", "journal.jsonl"), [i0 = "", i1 = "", i2 = ""] = readFileSync(jr, "utf8").split("\n"), stops = async (): Promise<unknown[]> => [await run(ref, "A"), lastRun(ref, "run.json").stop_detail];
  writeFileSync(jr, `${i0}\n${i1}\n${i2}\n{"seq":3,"prev_sha`); assert.deepEqual(await stops(), ["evidence_corrupt", "journal.jsonl:3"], "a torn tail (DOJO-HISTORY-JOURNAL-TAIL-1)");
  writeFileSync(jr, `${i0}\n${i2}\n${i1}\n`); assert.deepEqual(await stops(), ["evidence_corrupt", "journal.jsonl:1"], "lines out of their chain");
  const g = fresh(); mkdirSync(join(g.state, "evidence", rel, ".."), { recursive: true }); writeFileSync(join(g.state, "evidence", rel), bytes.subarray(0, Math.floor(bytes.length / 2)));
  assert.deepEqual([await run(g, "A"), lastRun(g, "run.json").stop_detail], ["evidence_corrupt", rel], "a torn raw file under its name is never cited (C-G2-8 (b))");
});
