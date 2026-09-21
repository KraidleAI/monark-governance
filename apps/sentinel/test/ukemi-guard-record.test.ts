// GARDE-HELIUS-2b-ii (seam 2b-ii-b) - the recorder GUARDED end-to-end. Every oracle drives the REAL runRecorder over
// the REAL openGuardedClient with ONLY globalThis.fetch stubbed (C-5): no fake client, no fake transport. Pins: the
// recorder spends only through the guard (every paid fetch preceded by its on-disk ledger line - write-ahead, checked
// INSIDE the fetch spy); the six run inputs are required; a budget refusal is ledgered and NOT retried; --resume hits
// cost 0 RU; R caller retries => R+1 ledger lines; caller retry is scoped (transient transport only); record -> unlock
// -> reconcile composes (verdict + exit); the finally releases the N locks even on a budget stop; --operators is an
// explicit include list. Named mutants (replayed here): "makeBudgetedCall restored" (a local counter writes no ledger
// line => write-ahead reds), "args made optional", "retry swallows the refusal", "retry under the tick", "finally
// without keyless".
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runRecorder, type RecorderDeps } from "../src/ukemi/record.ts";
import { runCli } from "@monark/rpc-guard";

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
  return ["--ledger-dir", dir, "--cycle", cycle, "--floor", "0", "--max-ru", maxRu, "--max-calls", "500000", "--method-caps", METHOD_CAPS, "--operators", operators, "--min-interval-ms", "0", "--backoff-ms", "0", ...extra];
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
    const book = JSON.parse(readFileSync(out, "utf8")) as { provenance: { book_digest: string } };
    assert.equal(book.provenance.book_digest, PIN_BOOK_DIGEST, "the book reproduces the pinned digest THROUGH the guarded transport (fetch stubbed only)");
    // The finally released every requested operator (keyless + chainstack): no lock files, an `unlocked` line each.
    for (const op of ["drpc.org", "mevblocker.io", "chainstack"]) {
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
// lines); an RpcError / HTTP 400 / NonJsonBody is NOT retried (exactly one). "retry swallows the refusal" is covered by #3.
test("ukemi_budget_counts_http_attempts_and_caller_retry_is_scoped", async () => {
  const csResp = (kind: "503" | "rpc" | "400" | "html"): Response =>
    kind === "503" ? new Response("busy", { status: 503 })
      : kind === "400" ? new Response("bad", { status: 400 })
        : kind === "html" ? new Response("<html>502</html>", { status: 200 })
          : new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted" } }), { status: 200, headers: { "content-type": "application/json" } });
  const csFetchesFor = async (kind: "503" | "rpc" | "400" | "html", retries: number): Promise<{ csFetches: number; attempted: number }> => {
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
  for (const kind of ["rpc", "400", "html"] as const) {
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
