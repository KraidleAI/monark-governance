// GARDE-HELIUS-2b-ii (seam 2b-ii-b) - the recorder GUARDED end-to-end. Every oracle drives the REAL runRecorder over
// the REAL openGuardedClient with ONLY globalThis.fetch stubbed (C-5): no fake client, no fake transport. Pins: the
// recorder spends only through the guard (every paid fetch preceded by its on-disk ledger line - write-ahead, checked
// INSIDE the fetch spy); the six run inputs are required; a budget refusal is ledgered and NOT retried; --resume hits
// cost 0 RU; R caller retries => R+1 ledger lines; caller retry is scoped (transient transport only); record -> unlock
// -> reconcile composes (verdict + exit); the finally releases the N locks even on a budget stop; --operators is an
// explicit include list. Named mutants (replayed here): "makeBudgetedCall restored" (a local counter writes no ledger
// line => write-ahead reds), "args made optional", "retry swallows the refusal", "retry under the tick", "finally
// without keyless".
// GARDE-FSYNC-1 pli-1 (ruling I-10): this file proves the recorder MECHANICS through the real guard (~13 000 ledger
// appends); durability is proven with the REAL fsync by packages/rpc-guard/test/{durable,repair-tail}.test.ts. The
// platter flush is a counting no-op in THIS process only (test-only support packages/rpc-guard/test/no-fsync.ts).
import { flushesSkipped } from "../../../packages/rpc-guard/test/no-fsync.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runRecorder, retryWaitMs, enumerateAndCountAtRisk, type RecorderDeps } from "../src/ukemi/record.ts";
import { reduceConcordance } from "../src/ukemi/concordance.ts";
import { QuorumDisagreementError } from "../src/rpc.ts";
import { SEL } from "../src/ukemi/abi.ts";
import { ORACLE, CLUSTER_WETH } from "../src/ukemi/clusters.ts";
import { runCli, openGuardedClient, verifyCycleLedger, type RunLimits, type OperatorLabel, type CycleLedgerEntry } from "@monark/rpc-guard";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const CS_HOST = "cs-node.example.invalid";
const ENV = { CHAINSTACK_ETH_URL: `https://${CS_HOST}/FAKEKEY-9z9z9z9z` };
const DEPS: RecorderDeps = { env: ENV, now: () => 1_700_000_000_000 };
const METHOD_CAPS = "eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000";
const KEYLESS = "drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co";
const PIN_BOOK_DIGEST = "034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921";
interface Fixture { block: number; block_hash: string; block_ts: number; finalized_block: number; enumeration_logs: unknown[]; calls: Record<string, string>; }
const FX = JSON.parse(readFileSync(join(HERE, "fixtures", "ukemi", "weth-book.fixture.json"), "utf8")) as Fixture;

function tmpLedger(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "u2bii-rec-")); // OUTSIDE the repo; ensureCycleDir needs the parent to pre-exist
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
function argv(dir: string, cycle: string, operators: string, extra: string[] = [], maxRu = "1000000"): string[] {
  // Ruling 2026-09-22 (CHANTIERS.md:677): these are GENERIC recorder uses (mechanics: budget/ledger/retry/book/concordance),
  // NOT a U-4b pre-registered course => --no-prereg-binding, so the suite survives once docs/PLAN-u4b-prereg.md is committed
  // (C-4, committed ALONE per decision 128 — no test edit can ride with it). No-op today (default prereg file absent), keeps
  // preregBound=false after C-4 (measured by a transient prereg-present simulation at the pli).
  return ["--ledger-dir", dir, "--cycle", cycle, "--floor", "0", "--max-ru", maxRu, "--max-calls", "500000", "--method-caps", METHOD_CAPS, "--operators", operators, "--min-interval-ms", "0", "--backoff-ms", "0", "--no-prereg-binding", ...extra];
}
async function withFetch(stub: (input: string | URL, init?: RequestInit) => Promise<Response>, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch;
  globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = real; }
}
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
const parseReq = (init?: RequestInit): { method: string; params: unknown[] } => JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
/** Serve the recorded fixture bytes over JSON-RPC (every provider concords => the book reproduces the pin). */
function fxServe(req: { method: string; params: unknown[] }): Response {
  if (req.method === "eth_getBlockByNumber") return jrpc({ hash: FX.block_hash, number: "0x" + FX.block.toString(16), timestamp: "0x" + FX.block_ts.toString(16) });
  if (req.method === "eth_getLogs") return jrpc(FX.enumeration_logs);
  const p = (req.params as ReadonlyArray<{ to: string; data: string }>)[0]!;
  const v = FX.calls[`${p.to.toLowerCase()}|${p.data.toLowerCase()}`];
  return v === undefined ? new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -32000, message: "fixture miss" } }), { status: 200, headers: { "content-type": "application/json" } }) : jrpc(v);
}
const attemptedLines = (path: string): number => (existsSync(path) ? readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"attempted"')).length : 0);
const hasOutcome = (path: string, outcome: string): boolean => existsSync(path) && readFileSync(path, "utf8").includes(`"outcome":"${outcome}"`);

// #6 e2e + #9 PIN + #12 (finally releases keyless AND chainstack locks): a full book through the guard reproduces the
// pinned book_digest, then the finally auto-unlocks ALL N requested operators (keyless included), then reconcile GOes.
test("ukemi_record_then_unlock_then_reconcile_end_to_end", async () => {
  const { dir, cleanup } = tmpLedger();
  const out = join(tmpdir(), `u2bii-book-${String(process.pid)}-${String(Date.now())}.json`);
  try {
    await withFetch((_i, init) => Promise.resolve(fxServe(parseReq(init))), async () => {
      const code = await runRecorder(argv(dir, "cyc", `${KEYLESS},chainstack`, ["--cluster", "weth", "--block", String(FX.block), "--out", out]), DEPS);
      assert.equal(code, 0, "the guarded full-book run succeeds");
    });
    const book = JSON.parse(readFileSync(out, "utf8")) as { provenance: { book_digest: string; params: { prereg_binding: string } } };
    assert.equal(book.provenance.book_digest, PIN_BOOK_DIGEST, "the book reproduces the pinned digest THROUGH the guarded transport (fetch stubbed only)");
    // Q-A ruling 2026-09-22: the provenance RECORDS prereg_binding — "none" here (default --prereg-file
    // docs/PLAN-u4b-prereg.md is absent in the repo, so no binding is in effect). Kills the "prereg_binding not recorded" mutant.
    assert.equal(book.provenance.params.prereg_binding, "none", "provenance.params records prereg_binding (\"none\" when no bound prereg file exists)");
    // C-R-b2(a): chainstack is APPENDED LAST, so with 5 keyless concording it is NEVER drawn - 0 attempted line in its
    // ledger (a paid course spends 0 RU when the keyless quorum forms). The "chainstack drawn first" mutant reorders
    // the pool => chainstack is drawn on every read => attempted > 0 => this reds.
    assert.equal(attemptedLines(join(dir, "cyc", "chainstack.jsonl")), 0, "chainstack (appended LAST) is never drawn while the 5 keyless concord (mutant 'chainstack drawn first' reds)");
    // The finally released ALL SIX requested operators (5 keyless + chainstack): no lock files, an `unlocked` line each.
    for (const op of ["drpc.org", "mevblocker.io", "nodies.app", "pocket.network", "tenderly.co", "chainstack"]) {
      assert.ok(!existsSync(join(dir, "cyc", `${op}.lock`)), `${op}.lock released in the finally (N unlock, keyless included)`);
      assert.ok(hasOutcome(join(dir, "cyc", `${op}.jsonl`), "unlocked"), `${op}.jsonl carries the chained unlocked line`);
    }
    // record -> unlock -> reconcile: the SERVED reconcile consumes the ledger and returns a verdict + exit code.
    const before = join(tmpdir(), `snap-b-${String(process.pid)}.json`); const after = join(tmpdir(), `snap-a-${String(process.pid)}.json`);
    writeFileSync(before, JSON.stringify({ cycle: "cyc", total_ru: 0 })); writeFileSync(after, JSON.stringify({ cycle: "cyc", total_ru: 0 }));
    const r = runCli(["reconcile", "--cycle", "cyc", "--op", "chainstack", "--mode", "aggregate-calibration", "--before", before, "--after", after], { ledgerDir: dir, floor: 0, readSnapshot: (p) => JSON.parse(readFileSync(p, "utf8")) as { cycle: string } });
    assert.equal(r.exitCode, 0, "reconcile (aggregate-calibration) GOes: delta 0 <= ledger_run, exit 0");
    assert.equal(r.verdict, "GO");
    rmSync(before, { force: true }); rmSync(after, { force: true });
  } finally { rmSync(out, { force: true }); cleanup(); }
});

// GARDE-HELIUS-1b0-E (ruling C-5, ripple carried by 1b-iii): the finally unlocks EACH requested operator under ITS OWN
// cycle `cycles[op]` (record.ts, the SOLE line changed outside byte-identity), never the single `cycle` scalar. TODAY
// the recorder builds `cycles` from ONE --cycle, so cycles[op] === cycle for every op and the change is behaviorally a
// NO-OP: this test proves NO REGRESSION (each op's unlocked line lands in <ledgerDir>/<cycle>/<op>.jsonl, the per-op
// path, no .lock left) but is DECLARATIVE for the ripple — the mutant `cycles[String(op)] -> cycle` yields the identical
// value while every operator shares one cycle. KILLABILITY is an item formed (owner: orchestrator; trigger = 1b0-E's own
// trigger: a recorder course locking >= 2 operators on DISTINCT cycle-ids, which needs per-operator cycles at the CLI —
// outside this sub-lot's "byte-identical outside the finally" scope).
test("ukemi_record_finally_unlocks_each_operator_under_its_own_cycle", async () => {
  const { dir, cleanup } = tmpLedger();
  const out = join(tmpdir(), `u1biii-unlock-${String(process.pid)}-${String(Date.now())}.json`);
  const cycle = "cyc-1b0e";
  const ops = ["mevblocker.io", "tenderly.co", "chainstack"];
  try {
    await withFetch((_i, init) => Promise.resolve(fxServe(parseReq(init))), async () => {
      assert.equal(await runRecorder(argv(dir, cycle, ops.join(","), ["--cluster", "weth", "--block", String(FX.block), "--out", out]), DEPS), 0, "the guarded run succeeds");
    });
    for (const op of ops) {
      // the unlocked line is chained into <ledgerDir>/<cycle>/<op>.jsonl — the per-op cycle path (cycles[op]); an unlock
      // under a wrong cycle would leave this op's .lock held and write no unlocked line under <cycle>/<op>.jsonl.
      assert.ok(!existsSync(join(dir, cycle, `${op}.lock`)), `${op}.lock released under its own cycle path (finally, cycles[op])`);
      assert.ok(hasOutcome(join(dir, cycle, `${op}.jsonl`), "unlocked"), `${op}.jsonl (<cycle>/<op>) carries the chained unlocked line`);
    }
  } finally { rmSync(out, { force: true }); cleanup(); }
});

// #1 write-ahead: EVERY paid (chainstack) fetch is preceded by its ledger line ON DISK (checked INSIDE the fetch spy).
// The "makeBudgetedCall restored" mutant (a local in-memory counter, no ledger line) reds the in-spy assertion.
test("ukemi_record_spends_only_through_guard", async () => {
  const { dir, cleanup } = tmpLedger();
  const csLedger = join(dir, "cyc", "chainstack.jsonl");
  let csFetches = 0;
  let writeAheadOk = true; // set false if a paid fetch fires with fewer attempted ledger lines than paid fetches so far
  const spy = (input: string | URL): Promise<Response> => {
    // Read chainstack.jsonl SYNCHRONOUSLY at the moment the paid fetch fires: the write-ahead line must already be on
    // disk. A flag (not an in-spy assert, which the transport try/catch would swallow) is checked after the run.
    if (String(input).includes(CS_HOST)) { csFetches += 1; if (attemptedLines(csLedger) < csFetches) writeAheadOk = false; }
    return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); // a valid block for finalized
  };
  try {
    await withFetch(spy, async () => {
      // mevblocker + chainstack => finalized draws BOTH (quorum needs 2); --block huge => look-ahead throw AFTER finalized
      // (chainstack already fetched + its write-ahead line already observed). The point is the paid draw + its ledger line.
      await assert.rejects(() => runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "999999999"]), DEPS), /look-ahead forbidden/);
    });
    assert.ok(csFetches >= 1, "chainstack was actually drawn (paid leg exercised)");
    assert.ok(writeAheadOk, "every paid fetch was preceded by its write-ahead ledger line ON DISK (mutant: no ledger line => this reds)");
    assert.ok(attemptedLines(csLedger) >= csFetches, "the chainstack ledger carries >= 1 attempted line per paid fetch");
  } finally { cleanup(); }
});

// #2 + C-1: the SIX run inputs are required, --operators is required and validated (unknown label fail-closed).
test("ukemi_record_requires_the_six_run_inputs_and_validates_operators", async () => {
  const { dir, cleanup } = tmpLedger();
  try {
    const full = argv(dir, "cyc", "drpc.org,mevblocker.io");
    const drop = (flag: string): string[] => { const i = full.indexOf(flag); return [...full.slice(0, i), ...full.slice(i + 2)]; };
    for (const [flag, re] of [["--ledger-dir", /--ledger-dir is required/], ["--cycle", /--cycle is required/], ["--floor", /--floor is required/], ["--max-ru", /--max-ru is required/], ["--method-caps", /--method-caps is required/], ["--max-calls", /--max-calls is required/]] as const) {
      await assert.rejects(() => runRecorder(drop(flag), DEPS), re, `missing ${flag} fails closed`);
    }
    await assert.rejects(() => runRecorder(argv(dir, "cyc", ""), DEPS), /--operators <label,\.\.\.> is required/, "empty --operators fails closed");
    await assert.rejects(() => runRecorder(argv(dir, "cyc", "drpc.org,helius"), DEPS), /unknown operator 'helius'/, "an operator unknown to the ETH pools fails closed");
  } finally { cleanup(); }
});

// #3: a budget refusal is LEDGERED (refused line) and NOT retried (0 paid fetch), the run stops (exit 2).
test("ukemi_record_budget_refusal_is_not_retried", async () => {
  const { dir, cleanup } = tmpLedger();
  const csLedger = join(dir, "cyc", "chainstack.jsonl");
  let csFetches = 0;
  const stub = (input: string | URL): Promise<Response> => { if (String(input).includes(CS_HOST)) csFetches += 1; return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); };
  try {
    await withFetch(stub, async () => {
      // --max-ru 1 => chainstack's first (finalized) eth_getBlockByNumber (2 RU) is refused BEFORE the transport.
      const code = await runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1"], "1"), DEPS);
      assert.equal(code, 2, "a budget stop returns exit 2 (never a truncated book as complete)");
    });
    assert.ok(hasOutcome(csLedger, "refused"), "the refusal is LEDGERED (a chained refused line)");
    assert.equal(csFetches, 0, "the refused call never reached the transport (0 paid fetch) - and was NOT retried");
  } finally { cleanup(); }
});

// #5 R+1 ledger lines + #13 caller-retry SCOPE: a transient 503 is retried (retries+1 client.calls => retries+1 ledger
// lines); an RpcError / HTTP 400 is NOT retried (exactly one). A NonJsonBody@200 is now RETRIED (UKEMI-RETRY-1) - its
// scope is pinned by ukemi_record_nonjsonbody_* below (the old "html not retried" arm asserted the exact contract this
// lot inverts, so it moved to those stronger tests). "retry swallows the refusal" is covered by #3.
test("ukemi_budget_counts_http_attempts_and_caller_retry_is_scoped", async () => {
  const csResp = (kind: "503" | "rpc" | "400"): Response =>
    kind === "503" ? new Response("busy", { status: 503 })
      : kind === "400" ? new Response("bad", { status: 400 })
        : new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted" } }), { status: 200, headers: { "content-type": "application/json" } });
  const csFetchesFor = async (kind: "503" | "rpc" | "400", retries: number): Promise<{ csFetches: number; attempted: number }> => {
    const { dir, cleanup } = tmpLedger();
    const csLedger = join(dir, "cyc", "chainstack.jsonl");
    let csFetches = 0;
    const stub = (input: string | URL): Promise<Response> => { const url = String(input); if (url.includes(CS_HOST)) { csFetches += 1; return Promise.resolve(csResp(kind)); } return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); };
    try { await withFetch(stub, async () => { await assert.rejects(() => runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1", "--retries", String(retries)]), DEPS)); }); return { csFetches, attempted: attemptedLines(csLedger) }; }
    finally { cleanup(); }
  };
  const t503 = await csFetchesFor("503", 2);
  assert.equal(t503.csFetches, 3, "a transient 503 is retried at the caller: retries=2 => 3 paid fetches");
  assert.equal(t503.attempted, 3, "R+1 write-ahead ledger lines (each retry re-enters client.call - the budget counts every HTTP attempt)");
  for (const kind of ["rpc", "400"] as const) {
    const r = await csFetchesFor(kind, 5);
    assert.equal(r.csFetches, 1, `a ${kind} response is NOT retried (exactly one paid fetch) even with retries=5`);
    assert.equal(r.attempted, 1, `${kind}: exactly one ledger line (no caller retry)`);
  }
});

// #4 --resume: a HIT costs no budget (no client.call => 0 RU => 0 attempted line => 0 fetch) on the second run.
test("ukemi_record_resume_hits_cost_zero_ru", async () => {
  const { dir, cleanup } = tmpLedger();
  const resume = join(tmpdir(), `u2bii-resume-${String(process.pid)}-${String(Date.now())}.jsonl`);
  const out = join(tmpdir(), `u2bii-fil-${String(process.pid)}-${String(Date.now())}.json`);
  let fetches = 0;
  const stub: typeof globalThis.fetch = (_i, init) => { fetches += 1; return Promise.resolve(fxServe(parseReq(init))); };
  try {
    await withFetch(stub, async () => {
      await runRecorder(argv(dir, "cyc", KEYLESS, ["--cluster", "weth", "--block", String(FX.block), "--filter-only", "--resume", resume, "--out", out]), DEPS);
      const first = fetches; assert.ok(first > 0, "the first run makes network calls (cache cold)");
      fetches = 0;
      const { dir: dir2, cleanup: c2 } = tmpLedger();
      try {
        await runRecorder(argv(dir2, "cyc", KEYLESS, ["--cluster", "weth", "--block", String(FX.block), "--filter-only", "--resume", resume, "--out", out]), DEPS);
        assert.equal(fetches, 0, "the second run is ALL resume hits => 0 fetch => 0 budget spend (a hit never reaches client.call)");
      } finally { c2(); }
    });
  } finally { rmSync(resume, { force: true }); rmSync(out, { force: true }); cleanup(); }
});

// #12 the finally releases the N locks EVEN on a budget stop (keyless included). "finally without keyless" mutant reds.
test("ukemi_record_finally_releases_all_locks_even_on_budget_stop", async () => {
  const { dir, cleanup } = tmpLedger();
  const stub = (input: string | URL): Promise<Response> => { if (String(input).includes(CS_HOST)) return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); };
  try {
    await withFetch(stub, async () => {
      const code = await runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1"], "1"), DEPS); // --max-ru 1 => budget stop
      assert.equal(code, 2, "budget stop");
    });
    for (const op of ["mevblocker.io", "chainstack"]) assert.ok(!existsSync(join(dir, "cyc", `${op}.lock`)), `${op}.lock released in the finally even on a budget stop (keyless included)`);
  } finally { cleanup(); }
});

// -- GARDE-HELIUS-2b-ii-c pli (test-only). Every oracle below drives the REAL runRecorder over the REAL guard, ONLY
// globalThis.fetch stubbed (no fake client/transport). Restores C-R-b1 (the rpc_errors journal was untested), C-R-b2
// (the paid e2e reconciled an EMPTY ledger; the concordance chain lost its integration test), C-R-b3 (distinct guard /
// 429 retry / operatorOf on labels) and the C-G-5 lock-recovery characterisation. Secret discipline (A-7): the run
// under test never sees a real key (the shell keys are stripped by the oracle wrapper); the stubbed paid URL carries a
// FAKE secret in every form so the closed-hint (paid) and redacted-body (keyless) journal paths are proven leak-free.

// The paid stub secret in every form the transport must never echo: raw/case/hex/base64/base64url/%-encoded/partial,
// plus userinfo + query. NEEDLES also carries the host and the userinfo user, exactly like the validator probe P1a.
const LKEY = "FAKEKEY-9z9z9z9zQQ77", LUKEY = "UserInfoSecret-44xx", LQKEY = "QueryKey-abc123XYZ";
const CS_URL_FULL = `https://u5er:${LUKEY}@${CS_HOST}/${LKEY}?api-key=${LQKEY}`;
const LEAK_DEPS: RecorderDeps = { env: { CHAINSTACK_ETH_URL: CS_URL_FULL }, now: () => 1_700_000_000_000 };
const keyForms = (k: string): string[] => [k, k.toLowerCase(), k.toUpperCase(), Buffer.from(k).toString("hex"), Buffer.from(k).toString("base64"), Buffer.from(k).toString("base64url"), encodeURIComponent(k), k.slice(0, 8), k.slice(-8)];
const NEEDLES = [...keyForms(LKEY), ...keyForms(LUKEY), ...keyForms(LQKEY), CS_HOST, "u5er"];
const KEY_BODY = `unauthorized ${CS_URL_FULL} key=${LKEY} hex=${Buffer.from(LKEY).toString("hex")} b64=${Buffer.from(LKEY).toString("base64")} pct=${encodeURIComponent(LKEY)} user=${LUKEY} q=${LQKEY} spaced=${LKEY.split("").join(" ")}`;
const cycleFilesText = (dir: string): string => { const c = join(dir, "cyc"); return existsSync(c) ? readdirSync(c).map((f) => readFileSync(join(c, f), "utf8")).join("\n") : ""; };
const leaks = (hay: string): string[] => NEEDLES.filter((n) => hay.includes(n));
// Capture the recorder's own stdout/stderr for the leak check (CP2 C-R-b1: 0 key char in --out, the ledgers, AND
// stdout/stderr) WHILE tee-ing every byte back to the real streams. node:test's reporter flushes TAP lazily onto
// process.stdout; a SWALLOWING redirect eats a deferred flush of a sibling test's result (measured: 5 of 14 tests then
// go uncounted). The tee forwards all output so the reporter stays intact; the buffer only has my fake-key NEEDLES
// checked (any other test's output is inert). Restoring to the captured prior write keeps the chain intact.
type Wr = { write: unknown };
async function captured(fn: () => Promise<void>): Promise<string> {
  let buf = ""; const so = process.stdout.write.bind(process.stdout), se = process.stderr.write.bind(process.stderr);
  const tee = (orig: typeof so) => (s: string | Uint8Array, ...a: unknown[]): boolean => { buf += String(s); return (orig as unknown as (...x: unknown[]) => boolean)(s, ...a); };
  (process.stdout as unknown as Wr).write = tee(so);
  (process.stderr as unknown as Wr).write = tee(se);
  try { await fn(); } finally { (process.stdout as unknown as Wr).write = so; (process.stderr as unknown as Wr).write = se; }
  return buf;
}
const jrpcErr = (code: number, message: string, data?: string): Response =>
  new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code, message, ...(data !== undefined ? { data } : {}) } }), { status: 200, headers: { "content-type": "application/json" } });
const rpcErrorsOf = (out: string): Array<{ provider: string; method: string; http?: number; code?: number; message: string; data?: string }> =>
  (JSON.parse(readFileSync(out, "utf8")) as { provenance: { rpc_errors: Array<{ provider: string; method: string; http?: number; code?: number; message: string; data?: string }> } }).provenance.rpc_errors;

// #9 / C-5(iii) IMPOSED: a paid HTTP 400 ("query returned more than 10000 results") on eth_getLogs is journaled by
// e.name as http:400 (NEVER code:400) and getLogsVia splits the range (both operators split identically => concordant),
// so the run COMPLETES and the journal is on disk. The paid 400 body carries the fake key in every form => the paid
// journal message is the CLOSED HINT only (no key). Mutants "http replaced by code" and "rpcErrors.push neutered" red.
test("ukemi_record_journal_maps_paid_http_400_to_http_not_code", async () => {
  const { dir, cleanup } = tmpLedger();
  const out = join(tmpdir(), `u2c-j400-${String(process.pid)}-${String(Date.now())}.json`);
  const logsInRange = (from: number, to: number): unknown[] => (FX.enumeration_logs as Array<{ blockNumber: string }>).filter((l) => { const b = parseInt(l.blockNumber, 16); return b >= from && b <= to; });
  let cs400 = 0;
  const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input); const req = parseReq(init);
    if (req.method === "eth_getLogs") {
      const p = (req.params as ReadonlyArray<{ fromBlock: string; toBlock: string }>)[0]!;
      const from = parseInt(p.fromBlock, 16), to = parseInt(p.toBlock, 16);
      if (to - from + 1 > 2000) { // both operators 400 on a wide span => both split; only the PAID body carries the key
        if (url.includes(CS_HOST)) { cs400 += 1; return Promise.resolve(new Response(`{"error":"query returned more than 10000 results ${KEY_BODY}"}`, { status: 400 })); }
        return Promise.resolve(new Response(`{"error":"query returned more than 10000 results"}`, { status: 400 }));
      }
      return Promise.resolve(jrpc(logsInRange(from, to)));
    }
    return Promise.resolve(fxServe(req));
  }) as typeof globalThis.fetch;
  let io = "";
  try {
    io = await captured(async () => {
      await withFetch(stub, async () => {
        const code = await runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", String(FX.block), "--from-block", String(FX.block - 3000), "--filter-only", "--out", out]), LEAK_DEPS);
        assert.equal(code, 0, "the paid 400 split lets the run COMPLETE (getLogsVia split), so the journal reaches --out");
      });
    });
    assert.ok(cs400 >= 1, "chainstack actually returned a paid 400 (paid leg exercised)");
    const j = rpcErrorsOf(out);
    const csEntry = j.find((e) => e.provider === "chainstack" && e.method === "eth_getLogs");
    assert.ok(csEntry !== undefined, "the paid 400 WAS journaled (mutant rpcErrors.push neutered => this reds)");
    assert.equal(csEntry.http, 400, "a paid HTTP 400 maps to http:400 (C-5 iii)");
    assert.equal(csEntry.code, undefined, "http NEVER code (mutant http->code => code:400 => this reds)");
    assert.deepEqual(leaks(cycleFilesText(dir) + readFileSync(out, "utf8") + io), [], "0 key char on disk (out, ledgers) or stdout/stderr - the paid journal message is the closed hint only");
  } finally { rmSync(out, { force: true }); cleanup(); }
});

// C-R-b1 (i)+(ii): a paid transient 5xx maps to http (retried at the caller, then serves the fixture => ONE http entry,
// no code); a KEYLESS JSON-RPC error (drpc -32601) maps by e.name to code (NO http) - the drpc bench lets mevblocker+
// pocket form the quorum, the PIN reproduces. Mutants "http->code" and "e.name RpcError branch -> message" red here.
test("ukemi_record_journal_maps_paid_5xx_to_http_and_keyless_rpc_to_code", async () => {
  // (i) paid 503 once (key-bearing body), then fixture: http:503, no code, PIN reproduced, 0 key char.
  { const { dir, cleanup } = tmpLedger(); const out = join(tmpdir(), `u2c-j5xx-${String(process.pid)}-${String(Date.now())}.json`);
    let cs = 0;
    const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => { if (String(input).includes(CS_HOST)) { cs += 1; if (cs === 1) return Promise.resolve(new Response(KEY_BODY, { status: 503 })); } return Promise.resolve(fxServe(parseReq(init))); }) as typeof globalThis.fetch;
    let io = "";
    try {
      io = await captured(async () => { await withFetch(stub, async () => { assert.equal(await runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", String(FX.block), "--out", out, "--retries", "2"]), LEAK_DEPS), 0, "the 503 is retried then serves the fixture => the run completes"); }); });
      const book = JSON.parse(readFileSync(out, "utf8")) as { provenance: { book_digest: string } };
      assert.equal(book.provenance.book_digest, PIN_BOOK_DIGEST, "the book reproduces the PIN with the paid leg drawn");
      const j = rpcErrorsOf(out); const cse = j.find((e) => e.provider === "chainstack");
      assert.equal(j.length, 1, "exactly ONE journal entry - the single paid 503, retried then served (CP2 C-R-b1: 1 entry)");
      assert.ok(cse !== undefined && cse.http === 503 && cse.code === undefined, "paid 503 => http:503, never code (mutant http->code reds)");
      assert.deepEqual(leaks(cycleFilesText(dir) + readFileSync(out, "utf8") + io), [], "0 key char on disk (out, ledgers) or stdout/stderr (paid closed hint only)");
    } finally { rmSync(out, { force: true }); cleanup(); } }
  // (ii) keyless drpc -32601 => code:-32601, no http; benched => mevblocker+pocket quorum => PIN reproduced.
  { const { dir, cleanup } = tmpLedger(); const out = join(tmpdir(), `u2c-jkl-${String(process.pid)}-${String(Date.now())}.json`);
    const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => { if (String(input).includes("drpc")) return Promise.resolve(jrpcErr(-32601, "method not found")); return Promise.resolve(fxServe(parseReq(init))); }) as typeof globalThis.fetch;
    try {
      await withFetch(stub, async () => { assert.equal(await runRecorder(argv(dir, "cyc", "drpc.org,mevblocker.io,nodies.app,pocket.network", ["--cluster", "weth", "--block", String(FX.block), "--out", out]), LEAK_DEPS), 0); });
      const j = rpcErrorsOf(out); const de = j.find((e) => e.provider === "drpc.org");
      assert.ok(de !== undefined, "the keyless JSON-RPC error WAS journaled");
      assert.equal(de.code, -32601, "a keyless RpcError maps by e.name to code:-32601 (mutant e.name->message => no code => this reds)");
      assert.equal(de.http, undefined, "an RpcError carries code, never http");
    } finally { rmSync(out, { force: true }); cleanup(); } }
});

// C-R-b1 / mission point 1 (paid RpcError) + C-R-b7 CLOSED (decision 128 Q-C): a paid RpcError code 3 (message+data
// carry the key) forces the draw with a broken keyless. MEASURED (probe, R-21): the quorum cannot survive a benched
// paid leg with only one keyless left => the run FAILS at finalized => the BOOK --out is NEVER written. Before decision
// 128 the on-disk journal (rpc_errors/tally) was then LOST — the C-R-b7 gap. NOW <out>.diag.json is written on EVERY
// failure path: this test proves the paid-RpcError journal entry is DURABLE, complete, and still 0 key char (the diag
// is a NEW failed-course surface the closed-hint discipline must cover). +diag assertions (D-4).
test("ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface", async () => {
  const { dir, cleanup } = tmpLedger(); const out = join(tmpdir(), `u2c-jfail-${String(process.pid)}-${String(Date.now())}.json`);
  const diag = out + ".diag.json";
  let cs = 0; let thrown = ""; let io = "";
  const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const s = String(input);
    if (s.includes("drpc")) return Promise.reject(new TypeError("network down")); // broken keyless => forces the paid draw
    if (s.includes(CS_HOST)) { cs += 1; if (cs === 1) return Promise.resolve(jrpcErr(3, `execution reverted ${KEY_BODY}`, "0x" + Buffer.from(LKEY).toString("hex"))); }
    return Promise.resolve(fxServe(parseReq(init)));
  }) as typeof globalThis.fetch;
  try {
    io = await captured(async () => { await withFetch(stub, async () => { try { await runRecorder(argv(dir, "cyc", "drpc.org,mevblocker.io,chainstack", ["--cluster", "weth", "--block", String(FX.block), "--from-block", String(FX.block - 3000), "--filter-only", "--out", out, "--retries", "1"]), LEAK_DEPS); } catch (e) { thrown = e instanceof Error ? `${e.name}: ${e.message} ${JSON.stringify(e)}` : String(e); } }); });
    assert.ok(cs >= 1, "the paid leg was actually drawn (a keyless was broken to force it)");
    assert.ok(thrown.length > 0, "the run FAILED (a benched paid leg with one keyless left cannot reach quorum) - so the BOOK --out was never written");
    assert.equal(existsSync(out), false, "the BOOK --out is NOT written on a failed run (never a truncated book as complete)");
    // C-R-b7 CLOSED: the durable diagnostic journal <out>.diag.json IS written on the failed paid-RpcError course, and
    // it CAPTURES the paid RpcError that was previously lost (mutant "diag not written" => this reds).
    assert.equal(existsSync(diag), true, "<out>.diag.json is written on the failed paid-RpcError course (decision 128 Q-C closes C-R-b7)");
    const d = JSON.parse(readFileSync(diag, "utf8")) as { error: { name: string; message: string }; rpc_errors: Array<{ provider: string; method: string; code?: number }>; calls_total: number; by_operator_method: { by_operator: Record<string, number>; by_method: Record<string, number> }; errors_by_operator: Record<string, number>; ukemi_sha: string };
    for (const k of ["ts", "error", "calls_total", "by_operator_method", "rpc_errors", "errors_by_operator", "n_at_risk_seen", "prereg_sha", "labeler_sha", "ukemi_sha"]) assert.ok(k in (d as unknown as Record<string, unknown>), `diag has key ${k} (complete)`);
    assert.ok(d.rpc_errors.some((e) => e.provider === "chainstack"), "the diag CAPTURES the paid chainstack RpcError (the exact journal C-R-b7 used to lose)");
    assert.deepEqual(leaks(thrown + io + cycleFilesText(dir) + readFileSync(diag, "utf8")), [], "0 key char in the thrown message, stderr, ANY ledger file, OR the diag journal (closed-hint discipline covers the new failed-course surface)");
    for (const f of readdirSync(join(dir, "cyc"))) assert.ok(!f.endsWith(".lock"), `lock released by the finally on a thrown run: ${f}`);
  } finally { rmSync(out, { force: true }); rmSync(diag, { force: true }); cleanup(); }
});

// C-R-b7 (decision 128 Q-C): a BUDGET stop ALSO persists <out>.diag.json (complete, 0 key char), not only stderr; the
// budget still returns 2 (never a truncated book as complete). Mutant "diag not written" reds the existsSync(diag).
test("ukemi_record_budget_stop_writes_durable_diag_journal", async () => {
  const { dir, cleanup } = tmpLedger();
  const out = join(tmpdir(), `u4b0-bud-${String(process.pid)}-${String(Date.now())}.json`);
  const diag = out + ".diag.json";
  const stub = (input: string | URL): Promise<Response> => { void input; return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); };
  try {
    let code = -1;
    await withFetch(stub, async () => { code = await runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1", "--out", out], "1"), LEAK_DEPS); }); // --max-ru 1 => budget stop at finalized
    assert.equal(code, 2, "a budget stop still returns exit 2");
    assert.equal(existsSync(out), false, "the BOOK --out is NOT written on a budget stop");
    assert.equal(existsSync(diag), true, "<out>.diag.json IS written on a budget stop (mutant 'diag not written' => this reds)");
    const d = JSON.parse(readFileSync(diag, "utf8")) as Record<string, unknown> & { error: { name: string } };
    for (const k of ["ts", "error", "calls_total", "by_operator_method", "rpc_errors", "errors_by_operator", "n_at_risk_seen", "prereg_sha", "labeler_sha", "ukemi_sha"]) assert.ok(k in d, `diag has key ${k} (complete)`);
    assert.equal(d.error.name, "BudgetExceededError", "the diag names the budget error (the failure path is identified)");
    assert.deepEqual(leaks(readFileSync(diag, "utf8") + cycleFilesText(dir)), [], "0 key char in the diag journal or the ledgers on a budget stop");
  } finally { rmSync(out, { force: true }); rmSync(diag, { force: true }); cleanup(); }
});

// C-R-b2(b) / C-G-1: the concordance chain SERVED end-to-end (successor of the removed ukemi_record_concordance_chain):
// args(--concordance-out) -> runRecorder -> onQuorum -> tallyConcordance -> flushConcordance (finally) -> jsonl ->
// reduceConcordance. drpc benches on -32601 so POCKET enters the pair; getPriceOracle CONCORDS, getReservesList
// DISCORDS (abstains) - the hook records BOTH before the throw, and the finally flushes despite the throw. No URL in
// the file. Mutants "onQuorum unwired" (empty file => [] => length!=1), "flush removed from finally" (no file =>
// readFileSync throws) and "flush neutered" (empty write) all red.
test("ukemi_record_concordance_chain", async () => {
  const { dir, cleanup } = tmpLedger();
  const B = FX.block;
  const ORACLE_WORD = "0x" + "0".repeat(24) + ORACLE.slice(2).toLowerCase(); // a 32-byte word decoding to ORACLE
  const out = join(tmpdir(), `u2c-conc-${String(process.pid)}-${String(Date.now())}.jsonl`);
  const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input); const req = parseReq(init);
    if (url.includes("drpc")) return Promise.resolve(jrpcErr(-32601, "method not found")); // benched (not a revert) => pocket enters the pair
    if (req.method === "eth_getBlockByNumber") return Promise.resolve(jrpc({ hash: "0x" + "11".repeat(32), number: "0x" + B.toString(16), timestamp: "0x66000000" }));
    if (req.method === "eth_call") {
      const data = (req.params as ReadonlyArray<{ data: string }>)[0]!.data.toLowerCase();
      if (data === SEL.getPriceOracle) return Promise.resolve(jrpc(ORACLE_WORD)); // concordant across mevblocker + pocket
      if (data === SEL.getReservesList) return Promise.resolve(jrpc(url.includes("mevblocker") ? "0x1234" : "0x5678")); // DISCORDANT => abstains
    }
    return Promise.resolve(jrpc("0x1"));
  }) as typeof globalThis.fetch;
  try {
    await withFetch(stub, async () => {
      await assert.rejects(() => runRecorder(argv(dir, "cyc", "drpc.org,mevblocker.io,nodies.app,pocket.network", ["--cluster", "weth", "--block", String(B), "--filter-only", "--retries", "0", "--concordance-out", out]), LEAK_DEPS), QuorumDisagreementError, "the discordant getReservesList abstains the run - the hook recorded it first");
    });
    const raw = readFileSync(out, "utf8"); // mutant "flush removed from finally" / "flush neutered" => no/empty file => this line or the reducer reds
    assert.ok(!/https?:\/\//.test(raw) && !raw.toLowerCase().includes("http"), "the concordance file carries NO URL (operators only, C-1)");
    assert.ok(!raw.includes("nodies"), "the nodies gateway is collapsed to 'pocket' in the pair (C-2), never named");
    const tally = reduceConcordance(raw);
    assert.equal(tally.length, 1, "exactly one operator PAIR observed (mutant onQuorum unwired => empty file => [] => this reds)");
    assert.deepEqual({ pair: tally[0]!.pair, concordant: tally[0]!.concordant, discordant: tally[0]!.discordant, rate: tally[0]!.rate }, { pair: "mevblocker.io|pocket", concordant: 1, discordant: 1, rate: 0.5 }, "getPriceOracle concorded + getReservesList discorded, both recorded before the abstention throw");
    for (const op of ["mevblocker.io", "pocket.network", "drpc.org", "nodies.app"]) assert.ok(!existsSync(join(dir, "cyc", `${op}.lock`)), `${op}.lock released in the finally despite the disagreement throw`);
  } finally { rmSync(out, { force: true }); cleanup(); }
});

// C-R-b3 / C-G-2: the recorder-side distinct() guard counts by OPERATOR - {nodies.app, pocket.network} = ONE operator
// 'pocket', so requesting only those two fails closed BEFORE any read. A providerOf-based guard would count 2 domains,
// pass, and reach finalized with a different message => this reds (the "distinct < 2 -> < 0/1" mutant reds here).
test("ukemi_record_distinct_guard_by_operator", async () => {
  const { dir, cleanup } = tmpLedger();
  try {
    await assert.rejects(
      () => runRecorder(argv(dir, "cyc", "nodies.app,pocket.network", ["--cluster", "weth", "--block", "1"]), LEAK_DEPS),
      /eth_call quorum-2 needs >= 2 distinct operators/,
      "{nodies.app, pocket.network} collapse to one operator 'pocket' => the guard fails closed before any network read",
    );
  } finally { cleanup(); }
});

// C-R-b3 / C-6(iii): a transient 429 is retried at the caller (retries+1 paid fetches) - distinct from the 400/rpc
// cases (NOT retried). The "429 no longer retried" mutant (drop the 429 clause) makes the first 429 fatal => 1 fetch =>
// this reds. The backoff cap is pinned by wide bounds: retries=2, backoff-ms 100000, cap 5 => elapsed < 1s (an
// uncapped 100000ms*2^attempt backoff would blow the test timeout).
test("ukemi_record_caller_retries_429_with_capped_backoff", async () => {
  const { dir, cleanup } = tmpLedger(); const csLedger = join(dir, "cyc", "chainstack.jsonl");
  let cs = 0;
  const stub = ((input: string | URL): Promise<Response> => { if (String(input).includes(CS_HOST)) { cs += 1; return Promise.resolve(new Response("rate limited", { status: 429 })); } return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); }) as typeof globalThis.fetch;
  const t0 = Date.now();
  try {
    await withFetch(stub, async () => {
      await assert.rejects(() => runRecorder(["--ledger-dir", dir, "--cycle", "cyc", "--floor", "0", "--max-ru", "1000000", "--max-calls", "500000", "--method-caps", METHOD_CAPS, "--operators", "mevblocker.io,chainstack", "--min-interval-ms", "0", "--backoff-ms", "100000", "--backoff-cap-ms", "5", "--retries", "2", "--no-prereg-binding", "--cluster", "weth", "--block", "1"], LEAK_DEPS));
    });
    assert.equal(cs, 3, "a transient 429 is retried at the caller: retries=2 => 3 paid fetches (mutant '429 not retried' => 1 => reds)");
    assert.equal(attemptedLines(csLedger), 3, "R+1 write-ahead ledger lines (the budget counts each 429 attempt)");
    assert.ok(Date.now() - t0 < 4000, "backoff is capped (5ms cap): 3 attempts complete fast (uncapped 100000ms backoff would time out)");
  } finally { cleanup(); }
});

// C-R-b3 (sect9 addition): operatorOf collapses the two Pocket gateways on the LABELS the migrated recorder passes (bare
// labels, never URLs) - the plan's test 14 asserted this on URLs, not labels. Pins the distinctness key directly.
test("ukemi_record_operatorof_collapses_pocket_on_bare_labels", async () => {
  const { operatorOf } = await import("../src/ukemi/rpc2.ts");
  assert.equal(operatorOf("nodies.app"), "pocket", "the bare keyless label nodies.app collapses to operator 'pocket'");
  assert.equal(operatorOf("pocket.network"), "pocket", "the bare keyless label pocket.network collapses to operator 'pocket'");
  assert.equal(operatorOf("nodies.app"), operatorOf("pocket.network"), "both Pocket gateways are ONE operator on labels (recorder distinctness key)");
  assert.equal(operatorOf("mevblocker.io"), "mevblocker.io", "a non-Pocket label is its own operator");
});

// C-R-b2(a): the paid e2e reconciles a NON-EMPTY paid ledger with a DISCRIMINATING vector (the shipped e2e reconciled
// before=after={total_ru:0}, satisfied by ANY ledger). mevblocker.io+chainstack => chainstack is drawn on EVERY read =>
// a non-empty chainstack ledger whose attempted RU == provenance.spent_by_operator.chainstack. reconcile aggregate-
// calibration GOes at delta == ledger_run and is a `hard:total` NO-GO at ledger_run + 1. Two fresh runs so each
// reconcile sees the FULL window (a reconciled line resets it), and both verdicts are a real discrimination, not D-2.
test("ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go", async () => {
  const build = async (): Promise<{ dir: string; cleanup: () => void; ledgerRun: number }> => {
    const { dir, cleanup } = tmpLedger();
    const out = join(tmpdir(), `u2c-p4-${String(process.pid)}-${String(Date.now())}-${String(Math.random()).slice(2)}.json`);
    try {
      await withFetch((_i, init) => Promise.resolve(fxServe(parseReq(init))), async () => {
        assert.equal(await runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", String(FX.block), "--out", out]), LEAK_DEPS), 0, "the guarded run with the paid leg DRAWN succeeds");
      });
      const art = JSON.parse(readFileSync(out, "utf8")) as { provenance: { spent_by_operator: Record<string, number> } };
      const csLines = readFileSync(join(dir, "cyc", "chainstack.jsonl"), "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"attempted"')).map((l) => JSON.parse(l) as { credits_derived: number });
      const ledgerRun = csLines.reduce((a, l) => a + l.credits_derived, 0);
      assert.ok(csLines.length > 0 && ledgerRun > 0, "the paid leg was drawn on every read => a NON-EMPTY paid ledger (an empty ledger => this reds)");
      assert.equal(ledgerRun, art.provenance.spent_by_operator.chainstack, "sum attempted credits_derived == provenance.spent_by_operator.chainstack (the ledger IS the spend)");
      return { dir, cleanup, ledgerRun };
    } finally { rmSync(out, { force: true }); }
  };
  const snap = (ru: number): string => { const p = join(tmpdir(), `u2c-snap-${String(process.pid)}-${String(Date.now())}-${String(Math.random()).slice(2)}.json`); writeFileSync(p, JSON.stringify({ cycle: "cyc", total_ru: ru })); return p; };
  const reconcile = (dir: string, after: number): { exitCode: number; verdict?: string; reason?: string } =>
    runCli(["reconcile", "--cycle", "cyc", "--op", "chainstack", "--mode", "aggregate-calibration", "--before", snap(0), "--after", snap(after)], { ledgerDir: dir, floor: 0, readSnapshot: (p) => JSON.parse(readFileSync(p, "utf8")) as { cycle: string } });
  const g = await build(); const n = await build();
  try {
    const go = reconcile(g.dir, g.ledgerRun); // delta == ledger_run => GO
    const nogo = reconcile(n.dir, n.ledgerRun + 1); // delta == ledger_run + 1 => hard:total NO-GO
    assert.equal(go.verdict, "GO"); assert.equal(go.exitCode, 0, "delta == ledger_run => GO (aggregate-calibration)");
    assert.notEqual(nogo.exitCode, 0, "delta == ledger_run + 1 => NO-GO (billed RU above the conservative ledger)");
    assert.equal(nogo.reason, "hard:total", "the NO-GO reason is the hard TOTAL bound (aggregate)");
    for (const dir of [g.dir, n.dir]) assert.deepEqual(readdirSync(join(dir, "cyc")).filter((f) => f.endsWith(".lock")), [], "no lock left after reconcile");
  } finally { g.cleanup(); n.cleanup(); }
});

// C-G-5 / E-1 (RECOVERY, INVERTED from the 2b-ii-c KNOWN_DEFECT characterisation by GARDE-HELIUS-1b-0 - cross-lot
// coupling DECLARED). The runbook promises N `unlock` recover the locks after a crash; the 2b-ii-c test pinned that a
// crash in the append -> write-head window of ledger.ts left the head sidecar ONE entry behind, so `openOperatorLedger`
// fail-closed (head != recomputed, C-V-8) and `runCli unlock` THREW before removing the `.lock` => the lock was NOT
// recoverable by `unlock` alone. 1b-0 hardens openOperatorLedger with an explicit crash-in-window RECOVERY (head one
// entry behind == the durable ledger's penultimate head => heal + continue; a tail truncation, head AHEAD, still
// fail-closes). This test REPRODUCES the same crash state (append E2, rewind the head sidecar to its post-E1 value) and
// now asserts the FLIP: `runCli unlock` recovers, appends the chained `unlocked` line, and removes the lock. The flip
// IS the trigger's acceptance signal. Mutant "recovery removed" (ledger.ts head-behind fail-closes) reds this test.
test("ukemi_record_crash_between_append_and_head_is_recovered_by_unlock", async () => {
  const { dir, cleanup } = tmpLedger();
  const cycleDir = join(dir, "cyc");
  const csHead = join(cycleDir, "chainstack.head");
  const csLedger = join(cycleDir, "chainstack.jsonl");
  const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1_000_000 }, methodCaps: { eth_getBlockByNumber: 100 }, cycleFloor: { chainstack: 0 } };
  const stub = ((): Promise<Response> => Promise.resolve(jrpc({ hash: "0x" + "11".repeat(32), number: "0x1", timestamp: "0x1" }))) as typeof globalThis.fetch;
  const real = globalThis.fetch; globalThis.fetch = stub;
  try {
    // Acquire the chainstack lock + open the ledger, then append TWO chained entries via real client.call (each a
    // write-ahead line + head-sidecar rewrite). The lock stays held (no finally here - we SIMULATE a crash).
    const client = openGuardedClient(LEAK_DEPS.env, limits, dir, { chainstack: "cyc" });
    await client.call("chainstack" as OperatorLabel, "eth_getBlockByNumber", ["finalized", false]); // E1: head := sha(E1)
    const headAfterE1 = readFileSync(csHead, "utf8"); // snapshot the post-E1 head sidecar
    await client.call("chainstack" as OperatorLabel, "eth_getBlockByNumber", ["finalized", false]); // E2: head := sha(E2)
    assert.notEqual(readFileSync(csHead, "utf8"), headAfterE1, "the 2nd append advanced the head sidecar");
    // CRASH-IN-WINDOW: the process died AFTER appending E2 but BEFORE rewriting the head => head is one entry behind.
    writeFileSync(csHead, headAfterE1);
    assert.ok(existsSync(join(cycleDir, "chainstack.lock")), "the chainstack lock is held (the crash left it)");
    // 1b-0 FIX: `runCli unlock` RECOVERS the crash-in-window (openOperatorLedger heals the one-behind head instead of
    // fail-closing), appends the chained `unlocked` line, and REMOVES the lock => the runbook's N-unlock recovers it.
    const r = runCli(["unlock", "--cycle", "cyc", "--op", "chainstack", "--reason", "resume after crash"], { ledgerDir: dir, floor: 0, readSnapshot: () => { throw new Error("unused by unlock"); } });
    assert.equal(r.exitCode, 0, "runCli unlock RECOVERS the crash-in-window and returns exit 0 (mutant 'recovery removed' reds here)");
    assert.ok(!existsSync(join(cycleDir, "chainstack.lock")), "the lock is RELEASED by unlock => recoverable after a crash, never a permanent block (E-1)");
    const lines = readFileSync(csLedger, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "");
    assert.ok(lines.some((l) => l.includes('"outcome":"unlocked"')), "the unlock appended its chained `unlocked` line (E1, E2, then unlocked)");
    const parsed = lines.map((l) => JSON.parse(l) as CycleLedgerEntry);
    assert.doesNotThrow(() => verifyCycleLedger(parsed), "the chain re-derives end to end after the recovery (no entry lost)");
    assert.equal(readFileSync(csHead, "utf8").trim(), parsed[parsed.length - 1]!.entry_sha256, "the head sidecar is HEALED to the true post-unlock head");
  } finally { globalThis.fetch = real; cleanup(); }
});

// UKEMI-RETRY-1 / A-8 (served path, real guard, ONLY globalThis.fetch stubbed) - the symmetric calque of BELL-RETRY-1
// for the recorder (R-BR2). A NonJsonBody@200 (a gateway HTML page returned on an HTTP 200) is now RETRIED in place:
// the FIRST chainstack fetch (finalized) returns a representative 502-gateway HTML page at HTTP 200 => the transport
// raises NonJsonBody@200 => the caller retries (bounded) => the 2nd fetch serves the fixture => the finalized quorum
// forms and the full book COMPLETES, reproducing the PIN. The retried fault is METERED in rpc_errors as "non-json 200"
// (message-only; no http/code, a NonJsonBody is a 2xx) and the retry is COUNTED (calls_by_operator.chainstack >= 2, R+1 tally).
// Mutant "clause retired" here makes the leg bench and, with only 2 operators, the quorum STARVES => the run rejects: a
// TEST famine at 2 operators, NOT the course STOP. The lot's real COURSE value (avoiding a PAID draw on a correlated
// keyless blip, 5 keyless + chainstack) is measured by ukemi_record_nonjsonbody_course_topology_... below (checkpoint-2 C-2).
test("ukemi_record_nonjsonbody_200_gateway_html_is_retried_and_metered", async () => {
  const { dir, cleanup } = tmpLedger();
  const out = join(tmpdir(), `u-retry-nj200-${String(process.pid)}-${String(Date.now())}.json`);
  let cs = 0;
  const GATEWAY_HTML = "<!DOCTYPE html><html><head><title>502 Bad Gateway</title></head><body><h1>502 Bad Gateway</h1><p>The proxy server received an invalid response from an upstream server.</p></body></html>";
  const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    if (String(input).includes(CS_HOST)) { cs += 1; if (cs === 1) return Promise.resolve(new Response(GATEWAY_HTML, { status: 200, headers: { "content-type": "text/html" } })); }
    return Promise.resolve(fxServe(parseReq(init)));
  }) as typeof globalThis.fetch;
  try {
    await withFetch(stub, async () => {
      assert.equal(await runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", String(FX.block), "--out", out, "--retries", "2"]), DEPS), 0, "the NonJsonBody@200 is retried, then the fixture serves => the guarded full-book run COMPLETES");
    });
    const book = JSON.parse(readFileSync(out, "utf8")) as { provenance: { book_digest: string; calls_by_operator: Record<string, number> } };
    assert.equal(book.provenance.book_digest, PIN_BOOK_DIGEST, "the book reproduces the PIN through the guarded transport after the in-place retry (mutant 'clause retired' => run rejects => never reaches here)");
    assert.ok(cs >= 2, "the finalized chainstack read was fetched >= 2 times (the NonJsonBody@200 retry actually happened)");
    assert.ok((book.provenance.calls_by_operator.chainstack ?? 0) >= 2, "R+1 tally: calls_by_operator.chainstack counts the extra retry attempt (>= 2; the retry is metered per operator, C-1)");
    const j = rpcErrorsOf(out);
    assert.equal(j.length, 1, "exactly ONE journal entry - the single NonJsonBody@200, retried then served (metered in rpc_errors)");
    const e0 = j[0]!;
    assert.equal(e0.provider, "chainstack", "the retried fault is attributed to the chainstack leg");
    assert.equal(e0.method, "eth_getBlockByNumber", "the fault is on the finalized read (the first draw)");
    assert.equal(e0.message, "non-json 200", "the diag label is 'non-json <code>' (UKEMI-RETRY-1), never the old bare 'NonJsonBody'");
    assert.equal(e0.http, undefined, "no http field (RpcErrorRecord: http only for a non-2xx response; a NonJsonBody is a 2xx)");
    assert.equal(e0.code, undefined, "no code field (code is for a JSON-RPC RpcError, not a NonJsonBody)");
  } finally { rmSync(out, { force: true }); rmSync(out + ".diag.json", { force: true }); cleanup(); }
});

// UKEMI-RETRY-1 matrix (served path, real guard) - the caller-retry PREDICATE boundary. A NonJsonBody@200 is TRANSIENT
// (retried to exhaustion => retries+1 fetches when it never recovers); a NonJsonBody at a 2xx!=200 (201, and 204 whose
// empty body also fails JSON.parse) and an HttpError at a 4xx!=429 (400, 404) are FATAL (not retried => exactly ONE
// fetch). Persistent on the chainstack leg, which quorum2 then benches => NoQuorumError (mevblocker alone) => the run
// rejects; the DISCRIMINATOR is the fetch count. Kills: clause retired / 200 removed (200 -> 1); 2xx!=200 admitted
// (201/204 -> retries+1); 4xx admitted (400/404 -> retries+1). 201/204 are transport-reachable, so R-BR1's analog is
// PINNED for the recorder here (stronger than BELL-RETRY-1, whose 2xx!=200 boundary survived as V4).
test("ukemi_record_nonjsonbody_transient_matrix", async () => {
  const RETRIES = 3;
  const resp = (kind: "200" | "201" | "204" | "400" | "404"): Response =>
    kind === "200" ? new Response("<html>gateway</html>", { status: 200 })
      : kind === "201" ? new Response("<html>created</html>", { status: 201 })
        : kind === "204" ? new Response(null, { status: 204 })
          : kind === "404" ? new Response("nope", { status: 404 })
            : new Response("bad", { status: 400 });
  const csFetchesFor = async (kind: "200" | "201" | "204" | "400" | "404"): Promise<{ csFetches: number; attempted: number }> => {
    const { dir, cleanup } = tmpLedger();
    const csLedger = join(dir, "cyc", "chainstack.jsonl");
    let csFetches = 0;
    const stub = (input: string | URL): Promise<Response> => { if (String(input).includes(CS_HOST)) { csFetches += 1; return Promise.resolve(resp(kind)); } return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); };
    try { await withFetch(stub, async () => { await assert.rejects(() => runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1", "--retries", String(RETRIES)]), DEPS)); }); return { csFetches, attempted: attemptedLines(csLedger) }; }
    finally { cleanup(); }
  };
  const t200 = await csFetchesFor("200");
  assert.equal(t200.csFetches, RETRIES + 1, "NonJsonBody@200 is TRANSIENT: retried to exhaustion => retries+1 paid fetches (mutant 'clause retired'/'200 removed' => 1 => reds)");
  assert.equal(t200.attempted, RETRIES + 1, "200: retries+1 write-ahead ledger lines (each retry re-enters client.call - metered like the other transients)");
  for (const kind of ["201", "204", "400", "404"] as const) {
    const r = await csFetchesFor(kind);
    assert.equal(r.csFetches, 1, `${kind} is FATAL (NonJsonBody 2xx!=200 / HttpError 4xx!=429): NOT retried => exactly 1 paid fetch even with retries=${String(RETRIES)} (mutant '2xx!=200 admitted'/'4xx admitted' => retries+1 => reds)`);
    assert.equal(r.attempted, 1, `${kind}: exactly one ledger line (no caller retry)`);
  }
});

// UKEMI-RETRY-1 (bound + metering) - a PERSISTENT NonJsonBody@200 is retried a BOUNDED number of times (retries=2 =>
// exactly 3 fetches, 3 write-ahead ledger lines), then the leg is benched (quorum2) => NoQuorumError => the run stops
// fail-closed. The DURABLE diag journal <out>.diag.json records THREE "non-json 200" entries (each retried attempt is
// metered in rpc_errors, like the other transients) AND the R+1 tally is pinned (calls_total = 4, by_operator.chainstack
// = 3). Kills: retry unbounded (bound+100 => 102 fetches), 'non compte' (fault not journaled => 0 entries), libelle
// (message != "non-json 200"), V4 (tally.total not incremented on retries => calls_total 2 != 4). backoff-ms 0 => no sleep.
test("ukemi_record_nonjsonbody_200_exhausts_bounded_and_journals", async () => {
  const { dir, cleanup } = tmpLedger();
  const csLedger = join(dir, "cyc", "chainstack.jsonl");
  const out = join(tmpdir(), `u-retry-nj200x-${String(process.pid)}-${String(Date.now())}.json`);
  const diag = out + ".diag.json";
  let cs = 0;
  const stub = (input: string | URL): Promise<Response> => { if (String(input).includes(CS_HOST)) { cs += 1; return Promise.resolve(new Response("<html>502 gateway</html>", { status: 200 })); } return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); };
  try {
    await withFetch(stub, async () => {
      await assert.rejects(() => runRecorder(argv(dir, "cyc", "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1", "--out", out, "--retries", "2"]), DEPS), /quorum needs 2 providers/, "a persistent NonJsonBody@200 exhausts the bounded retry, then the leg benches => NoQuorumError (fail-closed)");
    });
    assert.equal(cs, 3, "retries=2 => exactly 3 chainstack fetches (BOUNDED; mutant 'retry unbounded' bound+100 => 102 => reds)");
    assert.equal(attemptedLines(csLedger), 3, "3 write-ahead ledger lines (each retry re-enters client.call - the retry IS metered)");
    assert.equal(existsSync(diag), true, "the durable diagnostic journal is written on the failed course (C-R-b7)");
    const d = JSON.parse(readFileSync(diag, "utf8")) as { rpc_errors: Array<{ provider: string; method: string; message: string; http?: number; code?: number }>; calls_total: number; by_operator_method: { by_operator: Record<string, number>; by_method: Record<string, number> } };
    const nj = d.rpc_errors.filter((e) => e.provider === "chainstack" && e.method === "eth_getBlockByNumber");
    assert.equal(nj.length, 3, "THREE 'non-json 200' entries - each retried attempt is journaled (mutant 'non compte' => 0 => reds)");
    assert.ok(nj.every((e) => e.message === "non-json 200"), "every entry is labelled 'non-json 200' (mutant libelle => reds)");
    assert.ok(nj.every((e) => e.http === undefined && e.code === undefined), "message-only label (no http/code; a NonJsonBody is a 2xx)");
    // C-1 (checkpoint-2): pin the "R+1 tally" claim on BOTH counters so the validator's V4 (mutates tally.total) reds.
    assert.equal(d.calls_total, 4, "R+1 tally (total): every attempt counted - mevblocker 1 + chainstack 3 = 4 (kills V4 'tally.total not incremented on retries' => 2 != 4)");
    assert.equal(d.by_operator_method.by_operator.chainstack, 3, "R+1 tally (per operator): chainstack counted 3x (retries=2 => 3 attempts, each re-enters client.call)");
  } finally { rmSync(out, { force: true }); rmSync(diag, { force: true }); cleanup(); }
});

// UKEMI-RETRY-1 / C-2 (checkpoint-2) - the lot's VALUE on the REAL COURSE topology (prereg 5a: 5 keyless + chainstack
// appended LAST). Two keyless eth_call legs (drpc, mevblocker) blip ONCE each with a gateway HTML page at HTTP 200 on
// the same read (a CORRELATED provider blip). Golden: both are retried IN PLACE => the keyless quorum forms => the PAID
// leg (chainstack) is NEVER drawn (0 fetch, 0 attempted ledger line) and the book reproduces the PIN. That is the
// measured value of the lot: a correlated transient blip no longer forces a paid draw. Mutant "clause retired" => both
// legs bench => the eth_call quorum falls to {pocket, chainstack} => the PAID leg IS drawn (cs > 0) => this reds. This
// discriminates the change by VALUE (a paid draw avoided), not by the 2-operator famine of the A-8 mutant.
test("ukemi_record_nonjsonbody_course_topology_correlated_blip_avoids_paid_draw", async () => {
  const { dir, cleanup } = tmpLedger();
  const out = join(tmpdir(), `u-retry-topo-${String(process.pid)}-${String(Date.now())}.json`);
  const HTML = "<!DOCTYPE html><html><body><h1>502 Bad Gateway</h1></body></html>";
  const blipped = new Set<string>();
  let cs = 0;
  const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const u = String(input);
    if (u.includes(CS_HOST)) cs += 1;
    for (const host of ["eth.drpc.org", "rpc.mevblocker.io"]) if (u.includes(host) && !blipped.has(host)) { blipped.add(host); return Promise.resolve(new Response(HTML, { status: 200, headers: { "content-type": "text/html" } })); }
    return Promise.resolve(fxServe(parseReq(init)));
  }) as typeof globalThis.fetch;
  try {
    await withFetch(stub, async () => {
      assert.equal(await runRecorder(argv(dir, "cyc", `${KEYLESS},chainstack`, ["--cluster", "weth", "--block", String(FX.block), "--out", out, "--retries", "2"]), DEPS), 0, "the course completes (both correlated keyless blips retried in place, the keyless quorum forms)");
    });
    const book = JSON.parse(readFileSync(out, "utf8")) as { provenance: { book_digest: string; errors_by_operator: Record<string, number> } };
    assert.equal(book.provenance.book_digest, PIN_BOOK_DIGEST, "the book reproduces the PIN on the 5-keyless course topology");
    assert.equal(blipped.size, 2, "both keyless legs (drpc, mevblocker) blipped once each (a correlated blip on the same read)");
    assert.equal(cs, 0, "the PAID leg (chainstack) was NEVER fetched - the blips were retried IN PLACE (mutant 'clause retired' => both bench => quorum falls to {pocket, chainstack} => cs > 0 => reds)");
    assert.equal(attemptedLines(join(dir, "cyc", "chainstack.jsonl")), 0, "0 attempted line on the paid ledger (no paid draw induced by the correlated blip)");
    assert.deepEqual(book.provenance.errors_by_operator, { "drpc.org": 1, "mevblocker.io": 1 }, "errors_by_operator counts each correlated blip once (D-4 5%-rule surface; keyed by operator label)");
  } finally { rmSync(out, { force: true }); rmSync(out + ".diag.json", { force: true }); cleanup(); }
});

// ---- UKEMI-RETRY-2/3 + HEARTBEAT-1 (course Ukemi, essai 4 STOP 2026-09-23T04:29:31Z). Served path only (REAL runRecorder
// over the REAL openGuardedClient, ONLY globalThis.fetch stubbed); the in-place wait is observed via the injected
// RecorderDeps.sleep (never waits). A-8: the drpc bodies are the source form journaled in the course diags (essai 4: the
// 408 STOP; essai 2: 5 x 408 eth_call, 50 x 400 getLogs), served at their real status (the transport keeps no raw body).
const DRPC_408_BODY = JSON.stringify({ id: 1, jsonrpc: "2.0", error: { message: "Request timeout on the free plan, please upgrade to paid plan", code: 30 } });
const DRPC_400_BODY = JSON.stringify({ id: 1, jsonrpc: "2.0", error: { message: "ranges over 10000 blocks are not supported on free plan", code: 35 } });
const COURSE_OPS = "drpc.org,tenderly.co,chainstack"; // essai 4/5 topology: eth_call pool = [drpc.org, chainstack] (2 operators)
const FILTER_ARGS = ["--cluster", "weth", "--block", String(FX.block), "--filter-only"];
const recSleep = (): { sleeps: number[]; sleep: (ms: number) => Promise<void> } => { const sleeps: number[] = []; return { sleeps, sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); } }; };
/** argv WITHOUT argv()'s pinned `--backoff-ms 0` (parseUkemiArgs keeps the FIRST occurrence of a flag). */
const argvR = (dir: string, operators: string, extra: string[]): string[] =>
  ["--ledger-dir", dir, "--cycle", "cyc", "--floor", "0", "--max-ru", "1000000", "--max-calls", "500000", "--method-caps", METHOD_CAPS, "--operators", operators, "--min-interval-ms", "0", "--no-prereg-binding", ...extra];
/** Capture stdout and stderr SEPARATELY while tee-ing every byte to the real streams (same reason as captured()). */
async function capturedSplit(fn: () => Promise<void>): Promise<{ out: string; err: string }> {
  const buf = { out: "", err: "" }; const so = process.stdout.write.bind(process.stdout), se = process.stderr.write.bind(process.stderr);
  const tee = (orig: typeof so, k: "out" | "err") => (s: string | Uint8Array, ...a: unknown[]): boolean => { buf[k] += String(s); return (orig as unknown as (...x: unknown[]) => boolean)(s, ...a); };
  (process.stdout as unknown as Wr).write = tee(so, "out"); (process.stderr as unknown as Wr).write = tee(se, "err");
  try { await fn(); } finally { (process.stdout as unknown as Wr).write = so; (process.stderr as unknown as Wr).write = se; }
  return buf;
}
// groups: 1 config_read, 2 holders, 3 calls={...} body, 4 errors={...} body, 5 t=<ISO>
const HB_LINE = /^ {2}\.\.filter config_read=(\d+)\/(\d+) n_at_risk_config=\d+ rate=[0-9.]+\/s calls=\{([^}]*)\} errors=\{([^}]*)\} t=(\S+)$/;
const hbLines = (s: string): RegExpExecArray[] => s.split(/\r?\n/).map((l) => HB_LINE.exec(l)).filter((m): m is RegExpExecArray => m !== null);
/** Parse a heartbeat tally body `op:n,op:n` (an operator label carries dots, never a colon) into a record. */
const hbTally = (body: string | undefined): Record<string, number> => Object.fromEntries((body ?? "").split(",").filter((kv) => kv !== "").map((kv) => [kv.slice(0, kv.lastIndexOf(":")), Number(kv.slice(kv.lastIndexOf(":") + 1))]));

// (a) UKEMI-RETRY-2 VALUE on the essai-5 topology (replays the essai-4 death): drpc's FIRST eth_call answers the real 408;
// it is retried IN PLACE (one wait = the unchanged backoff 500 ms) and the full book completes on the PIN. Mutant "408
// removed" => quorum2 benches drpc => eth_call pool = [chainstack] => NoQuorumError (the essai-4 STOP) => reds.
test("ukemi_record_retry2_drpc_408_is_retried_in_place_course_topology_survives", async () => {
  const { dir, cleanup } = tmpLedger();
  const out = join(tmpdir(), `u-retry2-408-${String(process.pid)}-${String(Date.now())}.json`);
  const { sleeps, sleep } = recSleep();
  let failedKey: string | undefined; let failedKeyFetches = 0;
  const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const req = parseReq(init);
    if (String(input).includes("eth.drpc.org") && req.method === "eth_call") {
      const key = JSON.stringify(req.params);
      if (failedKey === undefined) { failedKey = key; failedKeyFetches += 1; return Promise.resolve(new Response(DRPC_408_BODY, { status: 408, headers: { "content-type": "application/json" } })); }
      if (key === failedKey) failedKeyFetches += 1;
    }
    return Promise.resolve(fxServe(req));
  }) as typeof globalThis.fetch;
  try {
    await withFetch(stub, async () => {
      assert.equal(await runRecorder(argvR(dir, COURSE_OPS, ["--cluster", "weth", "--block", String(FX.block), "--out", out, "--retries", "2"]), { ...DEPS, sleep }), 0, "a single drpc 408 no longer STOPs the 2-operator eth_call course: retried in place, the full book completes");
    });
    const book = JSON.parse(readFileSync(out, "utf8")) as { provenance: { book_digest: string; errors_by_operator: Record<string, number> } };
    assert.equal(book.provenance.book_digest, PIN_BOOK_DIGEST, "the book reproduces the PIN on the essai-5 topology after the in-place 408 retry");
    assert.equal(failedKeyFetches, 2, "the 408'd read was fetched exactly twice on drpc: the 408, then the in-place retry (attempt count)");
    assert.deepEqual(sleeps, [500], "exactly one in-place wait = the unchanged backoff 500*2^0 (this 408 carries no Retry-After)");
    assert.deepEqual(book.provenance.errors_by_operator, { "drpc.org": 1 }, "the retried 408 is counted once for drpc (D-4 surface)");
    assert.deepEqual(rpcErrorsOf(out), [{ provider: "drpc.org", method: "eth_call", message: DRPC_408_BODY, http: 408 }], "journaled by e.name as http:408 with the keyless redacted body (the source form)");
  } finally { rmSync(out, { force: true }); rmSync(out + ".diag.json", { force: true }); cleanup(); }
});

// (b) UKEMI-RETRY-2 bound: a PERSISTENT 408 on the PAID leg (body = the fake key in every form: closed-hint discipline) is
// retried EXACTLY --retries times (3 fetches, 3 ledger lines, 2 waits), then SURFACES: the leg is benched => NoQuorumError
// (fail-closed, never an endless retry). Mutant "retry unbounded" (bound + 100) => 103 fetches => reds.
test("ukemi_record_retry2_persistent_408_is_bounded_then_surfaces_and_leaks_nothing", async () => {
  const { dir, cleanup } = tmpLedger();
  const csLedger = join(dir, "cyc", "chainstack.jsonl");
  const out = join(tmpdir(), `u-retry2-408x-${String(process.pid)}-${String(Date.now())}.json`);
  const diag = out + ".diag.json";
  const { sleeps, sleep } = recSleep();
  let cs = 0; let thrown = "";
  const stub = ((input: string | URL): Promise<Response> => { if (String(input).includes(CS_HOST)) { cs += 1; return Promise.resolve(new Response(KEY_BODY, { status: 408 })); } return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); }) as typeof globalThis.fetch;
  try {
    const io = await captured(async () => {
      await withFetch(stub, async () => {
        await runRecorder(argvR(dir, "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1", "--out", out, "--retries", "2"]), { ...LEAK_DEPS, sleep }).then(() => { thrown = "resolved"; }, (e: unknown) => { thrown = e instanceof Error ? e.message : String(e); });
      });
    });
    assert.match(thrown, /quorum needs 2 providers/, "the exhausted 408 surfaces: the leg is benched => NoQuorumError (fail-closed)");
    assert.equal(cs, 3, "--retries 2 => exactly 3 paid fetches (BOUNDED; mutant 'retry unbounded' => 103 => reds)");
    assert.equal(attemptedLines(csLedger), 3, "3 write-ahead ledger lines (each retry re-enters client.call - metered)");
    assert.deepEqual(sleeps, [500, 1000], "2 waits (backoff 500*2^0, 500*2^1), none after the final attempt");
    const d = JSON.parse(readFileSync(diag, "utf8")) as { rpc_errors: Array<{ provider: string; http?: number; code?: number }> };
    const cs408 = d.rpc_errors.filter((e) => e.provider === "chainstack");
    assert.equal(cs408.length, 3, "each of the 3 attempts is journaled in the durable diag");
    assert.ok(cs408.every((e) => e.http === 408 && e.code === undefined), "journaled as http:408, never code:408");
    assert.deepEqual(leaks(thrown + io + cycleFilesText(dir) + readFileSync(diag, "utf8")), [], "0 key char in the thrown message, stdout/stderr, the ledgers or the diag (paid 408 detail = closed hint only)");
  } finally { rmSync(out, { force: true }); rmSync(diag, { force: true }); cleanup(); }
});

// (c) UKEMI-RETRY-2 boundary: ONLY 408 joins. 400 (the real drpc plan-limited body getLogsVia must get THROWN, rpc2.ts:194),
// 403, 407, 409 stay FATAL - 1 fetch, 0 wait, EVEN with a Retry-After; 408 => retries+1 fetches, each wait floored by its
// Retry-After (RETRY-2 x RETRY-3). Mutant "4xx widened" (the 408 arm admits any 4xx) => 400/403/407/409 retried => reds.
test("ukemi_record_retry2_4xx_boundary_only_408_is_transient", async () => {
  const RETRIES = 3;
  const run = async (status: number, body: string): Promise<{ drpc: number; sleeps: number[] }> => {
    const { dir, cleanup } = tmpLedger();
    const { sleeps, sleep } = recSleep();
    let drpc = 0;
    const stub = ((input: string | URL): Promise<Response> => { if (String(input).includes("eth.drpc.org")) { drpc += 1; return Promise.resolve(new Response(body, { status, headers: { "retry-after": "2" } })); } return Promise.resolve(jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" })); }) as typeof globalThis.fetch;
    try { await withFetch(stub, async () => { await assert.rejects(() => runRecorder(argvR(dir, COURSE_OPS, ["--cluster", "weth", "--block", "1", "--retries", String(RETRIES)]), { ...DEPS, sleep })); }); return { drpc, sleeps }; }
    finally { cleanup(); }
  };
  const t408 = await run(408, DRPC_408_BODY);
  assert.equal(t408.drpc, RETRIES + 1, "408 is TRANSIENT: retried to exhaustion => retries+1 drpc fetches");
  assert.deepEqual(t408.sleeps, [2000, 2000, 2000], "each 408 wait = max(Retry-After 2000, backoff 500/1000/2000), under the 8000 cap");
  for (const [status, body] of [[400, DRPC_400_BODY], [403, "forbidden"], [407, "proxy auth"], [409, "conflict"]] as const) {
    const r = await run(status, body);
    assert.equal(r.drpc, 1, `${String(status)} is FATAL: NOT retried => exactly 1 drpc fetch even with retries=${String(RETRIES)} (mutant '4xx widened' => retries+1 => reds)`);
    assert.deepEqual(r.sleeps, [], `${String(status)}: no wait - a Retry-After on a fatal status never induces a retry`);
  }
});

// (d) UKEMI-RETRY-3: wait = min(max(Retry-After, backoff), cap), observed via the injected sleep (~40 s requested, < 5 s
// real). A persistent 429 + Retry-After: 5 (transport => 5000 ms), --retries 2. Kills "Retry-After ignored" ([0,0]), "cap
// ignored" ([5000,5000] under cap 3000), "max -> min"; the pure pins cover the "defined, finite, > 0" guard (unreachable
// through the transport, which only yields a finite value in [0, 60000]).
test("ukemi_record_retry3_retry_after_floors_the_backoff_under_the_cap", async () => {
  const run = async (extra: string[], headers: Record<string, string>): Promise<number[]> => {
    const { dir, cleanup } = tmpLedger();
    const { sleeps, sleep } = recSleep();
    const stub = ((input: string | URL): Promise<Response> => Promise.resolve(String(input).includes(CS_HOST) ? new Response("rate limited", { status: 429, headers }) : jrpc({ hash: FX.block_hash, number: "0x1", timestamp: "0x1" }))) as typeof globalThis.fetch;
    try { await withFetch(stub, async () => { await assert.rejects(() => runRecorder(argvR(dir, "mevblocker.io,chainstack", ["--cluster", "weth", "--block", "1", "--retries", "2", ...extra]), { ...DEPS, sleep })); }); return sleeps; }
    finally { cleanup(); }
  };
  const t0 = Date.now();
  assert.deepEqual(await run(["--backoff-ms", "0"], { "retry-after": "5" }), [5000, 5000], "Retry-After 5 s floors a zero backoff: every wait >= Retry-After");
  assert.deepEqual(await run(["--backoff-ms", "0", "--backoff-cap-ms", "3000"], { "retry-after": "5" }), [3000, 3000], "the cap still bounds a longer Retry-After (truncated to --backoff-cap-ms, declared)");
  assert.deepEqual(await run(["--backoff-ms", "8000", "--backoff-cap-ms", "30000"], { "retry-after": "5" }), [8000, 16000], "a backoff LONGER than Retry-After wins (max), still under the cap");
  assert.deepEqual(await run(["--backoff-ms", "100"], {}), [100, 200], "no Retry-After => the backoff is unchanged (100*2^attempt)");
  assert.ok(Date.now() - t0 < 5000, "no real wait: ~40 s of requested waits ran in < 5 s (the sleep is injected)");
  // Pure pins, in order: none => pre-RETRY-3 formula; NaN and +Infinity ignored (never a NaN wait, never promoted to the
  // cap); 0 (a past HTTP-date) leaves the backoff; the backoff itself stays capped (64000 -> 30000); above-cap truncated.
  assert.deepEqual([undefined, Number.NaN, Number.POSITIVE_INFINITY].map((ra) => retryWaitMs(1, 1000, 30000, ra)).concat([retryWaitMs(0, 1000, 30000, 0), retryWaitMs(6, 1000, 30000, 5000), retryWaitMs(0, 1000, 30000, 45000)]), [2000, 2000, 2000, 1000, 30000, 30000], "retryWaitMs pure pins");
});

// (e) UKEMI-HEARTBEAT-1: period = --heartbeat-every (fixture = 4 holders): every 1 => 4 stderr lines 1/4..4/4 ending t=<ISO
// of deps.now>; every 3 => one (3/4); default 2000 => none; none on stdout. A-10 liage: drpc answers its 2nd config read
// with the real 408 once (retried): the CUMULATIVE errors={} shows it from line 2 on, and the last line's calls={}/errors={}
// EQUAL the provenance tallies. Mutants "period hard-coded 2000", "t= dropped", "calls from byMethod", "errors emptied".
test("ukemi_record_heartbeat1_period_is_the_flag_stderr_only_with_iso_t", async () => {
  const T_ISO = new Date(DEPS.now()).toISOString();
  type Prov = { calls_by_operator: Record<string, number>; errors_by_operator: Record<string, number> };
  const run = async (extra: string[], blip = false): Promise<{ out: string; err: string; prov: Prov }> => {
    const { dir, cleanup } = tmpLedger();
    const out = join(tmpdir(), `u-hb1-${String(process.pid)}-${String(Date.now())}.json`);
    let cfg = 0;
    const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
      const req = parseReq(init);
      const data = (req.params[0] as { data?: string } | undefined)?.data ?? "";
      if (blip && String(input).includes("eth.drpc.org") && req.method === "eth_call" && data.startsWith(SEL.getUserConfiguration) && ++cfg === 2) return Promise.resolve(new Response(DRPC_408_BODY, { status: 408 }));
      return Promise.resolve(fxServe(req));
    }) as typeof globalThis.fetch;
    try {
      const io = await capturedSplit(async () => {
        await withFetch(stub, async () => {
          assert.equal(await runRecorder(argvR(dir, `${KEYLESS},chainstack`, [...FILTER_ARGS, "--out", out, ...extra]), { ...DEPS, sleep: recSleep().sleep }), 0, "the filter-only pass completes");
        });
      });
      return { ...io, prov: (JSON.parse(readFileSync(out, "utf8")) as { provenance: Prov }).provenance };
    } finally { rmSync(out, { force: true }); cleanup(); }
  };
  const every1 = await run(["--heartbeat-every", "1"], true);
  const l1 = hbLines(every1.err);
  assert.deepEqual(l1.map((m) => `${m[1] ?? ""}/${m[2] ?? ""}`), ["1/4", "2/4", "3/4", "4/4"], "--heartbeat-every 1 => ONE stderr line per config read (4 holders)");
  assert.ok(l1.every((m) => m[5] === T_ISO), "each line ends t=<ISO of deps.now> (the injected wall clock)");
  assert.deepEqual(l1.map((m) => hbTally(m[4])), [{}, { "drpc.org": 1 }, { "drpc.org": 1 }, { "drpc.org": 1 }], "errors={} is CUMULATIVE: the read-2 drpc 408 shows from line 2 on and never resets");
  assert.deepEqual(every1.prov.errors_by_operator, { "drpc.org": 1 }, "the retried 408 is in the provenance tally too");
  assert.deepEqual(hbTally(l1[3]?.[3]), every1.prov.calls_by_operator, "last line calls={} == provenance calls_by_operator (liage: same cumulative source)");
  assert.deepEqual(hbTally(l1[3]?.[4]), every1.prov.errors_by_operator, "last line errors={} == provenance errors_by_operator (liage)");
  assert.equal(hbLines(every1.out).length, 0, "stdout carries NO heartbeat line (stderr only)");
  assert.deepEqual(hbLines((await run(["--heartbeat-every", "3"])).err).map((m) => m[1]), ["3"], "--heartbeat-every 3 => one line, at config_read 3");
  assert.equal(hbLines((await run([])).err).length, 0, "default 2000 => no line on a 4-holder pass (the pre-lot period, unchanged)");
});

// (e') --heartbeat-every 0 is refused PRE-FLIGHT (0 fetch, no cycle dir => no lock/ledger line); mutant "0 accepted" =>
// the client opens and reads before the in-core guard throws => reds. The in-core guard (% 0 = silent mute) is pinned too.
test("ukemi_record_heartbeat1_zero_is_refused_preflight_and_in_the_filter_core", async () => {
  const { dir, cleanup } = tmpLedger();
  let fetches = 0;
  try {
    await withFetch((_i, init) => { fetches += 1; return Promise.resolve(fxServe(parseReq(init))); }, async () => {
      await assert.rejects(() => runRecorder(argvR(dir, `${KEYLESS},chainstack`, [...FILTER_ARGS, "--heartbeat-every", "0"]), DEPS), /--heartbeat-every must be >= 1/, "--heartbeat-every 0 is refused fail-closed");
    });
    assert.equal(fetches, 0, "refused before any read (0 fetch)");
    assert.equal(existsSync(join(dir, "cyc")), false, "refused before the guarded client opened (no cycle dir, no lock, no ledger line)");
    let reads = 0;
    const refuse = (): Promise<never> => { reads += 1; return Promise.reject(new Error("no read expected")); };
    await assert.rejects(() => enumerateAndCountAtRisk(CLUSTER_WETH, FX.block, { ethCall: refuse, getLogsRange: refuse, blockAt: refuse, finalized: refuse }, { heartbeatEvery: 0 }), /heartbeatEvery must be an integer >= 1/, "the filter core refuses a 0 period itself (a % 0 would mute the heartbeat silently)");
    assert.equal(reads, 0, "the in-core guard also refuses before any read");
  } finally { cleanup(); }
});

// (f) HEARTBEAT-1 changes NOTHING but stderr: filter passes at every 1 and 2000 (same fixture, frozen clock) write the SAME
// JSON (provenance minus the wall-clock `seconds`) and the SAME stdout summary; only stderr differs. The full book at
// every 1 keeps the PIN (no tick on the book path: declarative for the tick). Mutants "heartbeat on stdout", "period
// written into the provenance" red here.
test("ukemi_record_heartbeat1_changes_nothing_but_stderr", async () => {
  const out = join(tmpdir(), `u-hb1f-${String(process.pid)}-${String(Date.now())}.json`);
  const REC = /^(ukemi\/record FILTER-ONLY | {2}calls=| {2}out=)/; // the recorder's OWN stdout lines (a lazily flushed reporter byte is ignored)
  const pass = async (every: string): Promise<{ prov: Record<string, unknown>; stdout: string; hbErr: number; hbOut: number }> => {
    const { dir, cleanup } = tmpLedger();
    try {
      const io = await capturedSplit(async () => {
        await withFetch((_i, init) => Promise.resolve(fxServe(parseReq(init))), async () => {
          assert.equal(await runRecorder(argvR(dir, `${KEYLESS},chainstack`, [...FILTER_ARGS, "--out", out, "--heartbeat-every", every]), DEPS), 0, "the filter-only pass completes");
        });
      });
      const prov = (JSON.parse(readFileSync(out, "utf8")) as { provenance: Record<string, unknown> }).provenance;
      delete prov.seconds; // the ONLY wall-clock field of the filter provenance
      const stdout = io.out.split(/\r?\n/).filter((l) => REC.test(l)).join("\n").replace(/seconds=[0-9.]+/, "seconds=<t>");
      return { prov, stdout, hbErr: hbLines(io.err).length, hbOut: hbLines(io.out).length };
    } finally { rmSync(out, { force: true }); cleanup(); }
  };
  const a = await pass("1"), b = await pass("2000");
  assert.equal(a.hbErr, 4, "every 1: the heartbeat fired on stderr (4 lines - the comparison below is not vacuous)");
  assert.equal(b.hbErr, 0, "every 2000: no heartbeat line on a 4-holder pass");
  assert.equal(a.hbOut + b.hbOut, 0, "no heartbeat line ever reaches stdout");
  assert.deepEqual(a.prov, b.prov, "the output JSON (provenance minus the wall-clock seconds) is identical at 1 and 2000");
  assert.ok(a.stdout.includes("FILTER-ONLY") && a.stdout.includes("  out="), "the recorder's stdout summary was captured (non-vacuous)");
  assert.equal(a.stdout, b.stdout, "the stdout summary is identical at 1 and 2000 (modulo seconds=)");
  const { dir, cleanup } = tmpLedger(); const bout = join(tmpdir(), `u-hb1b-${String(process.pid)}-${String(Date.now())}.json`);
  try {
    await withFetch((_i, init) => Promise.resolve(fxServe(parseReq(init))), async () => { assert.equal(await runRecorder(argvR(dir, `${KEYLESS},chainstack`, ["--cluster", "weth", "--block", String(FX.block), "--out", bout, "--heartbeat-every", "1"]), DEPS), 0); });
    assert.equal((JSON.parse(readFileSync(bout, "utf8")) as { provenance: { book_digest: string } }).provenance.book_digest, PIN_BOOK_DIGEST, "book_digest = PIN at --heartbeat-every 1");
  } finally { rmSync(bout, { force: true }); cleanup(); }
});

// GARDE-FSYNC-1 pli-1: LAST test of the file - the no-fsync support engaged the SAME DURABLE_FS instance the recorder used
// (a broken module identity would leave 0 here and cost ~275 s of real fsync on this file).
test("ukemi_guard_record_skipped_the_platter_flush_nonvacuous", () => {
  assert.ok(flushesSkipped() > 0, "the recorder's ledger appends went through the counting no-op flush");
});
