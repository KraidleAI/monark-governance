// GARDE-HELIUS-1b-ii — Bell collect consumes @monark/rpc-guard openGuardedClient. Every integration oracle drives the
// REAL runMain over the REAL openGuardedClient with ONLY globalThis.fetch stubbed (CA-11 durci, C-12): no fake client,
// no fake transport, synthetic closes. Pins (this file): quorum.ts speaks the canonical package error vocabulary
// (C-3a); collect spends only through the guard, write-ahead checked INSIDE the fetch spy (IT-2); a Solana course
// passes opts.network:"solana-mainnet" EXPLICITLY (chainstack unresolved otherwise => throw before any lock);
// assertMethodCapsCover fails closed on a method missing from --method-caps; the finally releases the N locks; the
// 1b-ii src files are clean of fetch/paid-keys (per-file T4a). credits-from-the-ledger (IT-3), the density mode-guard
// (C-G2-3) and resume-after-STOP (decision 125) live in rebase-crosscheck.test.ts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { statusOf, withRetry, isSolRevert, BudgetExceededError } from "../src/quorum.ts";
import { runMain } from "../src/collect.ts";
import { TransportError, RpcError, BELL_SOLANA_METHODS } from "@monark/rpc-guard";
import type { DatabentoGet, PolygonGet } from "../src/close.ts";

const noSleep = { sleep: (): Promise<void> => Promise.resolve() };
const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = (f: string): string => readFileSync(join(HERE, "..", "src", f), "utf8");

// ---- Guard-path harness (calque apps/sentinel/test/ukemi-guard-record.test.ts): the REAL runMain over the REAL
// openGuardedClient, ONLY globalThis.fetch stubbed (CA-11 durci). No deps.call (that is the offline UNIT seam, D-1). --
const HELIUS_HOST = "helius.example.invalid";
const CAPS = BELL_SOLANA_METHODS.map((m) => `${m}=100000000`).join(",");
const noDb: DatabentoGet = () => Promise.resolve([]);
const noPoly: PolygonGet = () => Promise.resolve({ results: [] });
function tmpLedger(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "bell-it-")); // OUT of repo; ensureCycleDir needs the parent to pre-exist
  return { dir, cleanup: (): void => rmSync(dir, { recursive: true, force: true }) };
}
function tmpOut(): { out: string; cleanup: () => void } {
  const out = mkdtempSync(join(tmpdir(), "bell-out-"));
  return { out, cleanup: (): void => rmSync(out, { recursive: true, force: true }) };
}
async function withFetch(stub: typeof globalThis.fetch, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch;
  globalThis.fetch = stub;
  try { await body(); } finally { globalThis.fetch = real; }
}
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
const parseReq = (init?: RequestInit): { method: string; params: unknown[] } => JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
const attemptedLines = (path: string): number => (existsSync(path) ? readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"attempted"')).length : 0);
const hasOutcome = (path: string, outcome: string): boolean => existsSync(path) && readFileSync(path, "utf8").includes(`"outcome":"${outcome}"`);
/** guard-course argv for the DEFAULT collect (helius + solana-foundation), the guard args auto-supplied. */
function guardArgs(dir: string, out: string, extra: string[] = [], maxCredits = "1000000000"): string[] {
  return ["--ledger-dir", dir, "--cycle", "cyc", "--operators", "helius,solana-foundation", "--floor", "helius=0,solana-foundation=0",
    "--method-caps", CAPS, "--max-credits", maxCredits, "--max-calls", "500000", "--min-interval", "0", "--out", out, ...extra];
}
const GUARD_ENV = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}` } as NodeJS.ProcessEnv;
const GUARD_DEPS = { databentoGet: noDb, polygonGet: noPoly, env: GUARD_ENV, nowMs: Date.UTC(2026, 8, 20) };

// C-3a — quorum.ts classifies the CANONICAL @monark/rpc-guard errors (checkpoint-1 C-3). The migrated collect.ts calls
// openGuardedClient, whose transport throws TransportError/RpcError. statusOf must read .code (never the scrubbed
// message), withRetry must retry a transient TransportError (429/5xx/abort) but NEVER a 403 / RpcError / budget stop,
// and isSolRevert must recognise a canonical RpcError with the Solana bench codes. RED on the base (SolRpcError-based
// classification): message-regex statusOf yields "transport" for a 403 => withRetry RETRIES the 403, and
// isSolRevert(RpcError) is false => a node revert benches instead of concording. Mutants (mutants.mjs): "statusOf
// ignores .code", "withRetry retries a 403", "isSolRevert keeps SolRpcError".
test("quorum_classifies_canonical_transport_errors", async () => {
  // (a) a 403 HttpError: statusOf reads .code (HTTP 403), withRetry does NOT retry it (fatal, exactly one attempt).
  const http403 = new TransportError("helius", "rpc-guard: HttpError for operator 'helius' (code 403)", "HttpError", 403);
  assert.equal(statusOf(http403), "HTTP 403", "statusOf reads TransportError.code, not the (scrubbed) message");
  let n403 = 0;
  await assert.rejects(() => withRetry(() => { n403 += 1; return Promise.reject(http403); }, { tries: 4, ...noSleep }), /403|HttpError/);
  assert.equal(n403, 1, "a 403 is fatal - withRetry does not retry it (mutant '403 retried' => 4 => reds)");
  // (b) a transient 429 and 5xx ARE retried (to exhaustion): the caller owns retry, the transport made one attempt.
  for (const code of [429, 503]) {
    let n = 0;
    await assert.rejects(() => withRetry(() => { n += 1; return Promise.reject(new TransportError("helius", "busy", "HttpError", code)); }, { tries: 3, ...noSleep }));
    assert.equal(n, 3, `a ${String(code)} is retried tries times (transient transport)`);
  }
  // an abort/network fault is transient too (retried).
  let na = 0;
  await assert.rejects(() => withRetry(() => { na += 1; return Promise.reject(new TransportError("helius", "aborted", "AbortError", undefined)); }, { tries: 2, ...noSleep }));
  assert.equal(na, 2, "an AbortError is transient (retried)");
  // (c) a canonical RpcError with a DETERMINISTIC Solana code is a revert (concordant on-chain fact), not a fault.
  assert.equal(isSolRevert(new RpcError("solana-foundation", "account not found", -32602)), true, "a deterministic RpcError is a Solana revert (mutant 'isSolRevert keeps SolRpcError' => false => reds)");
  assert.equal(isSolRevert(new RpcError("helius", "method not found", -32601)), true, "another deterministic code is a revert");
  // (d) transport-like Solana codes bench (NOT a revert) — the same bench set as before, on the canonical class.
  for (const code of [-32005, -32004, -32603]) assert.equal(isSolRevert(new RpcError("helius", "behind", code)), false, `code ${String(code)} is transport-like, benched not concorded`);
  // a non-RpcError is never a revert; withRetry never retries a budget stop (fatal first).
  assert.equal(isSolRevert(new Error("plain transport")), false, "a plain Error is not a revert");
  assert.equal(isSolRevert(new TransportError("helius", "busy", "HttpError", 500)), false, "a non-Rpc TransportError is not a revert");
  let nb = 0;
  await assert.rejects(() => withRetry(() => { nb += 1; return Promise.reject(new BudgetExceededError("bell/collect: cycle_cap")); }, { tries: 5, ...noSleep }), BudgetExceededError);
  assert.equal(nb, 1, "a BudgetExceededError is fatal FIRST, never retried");
});

// IT-2 — collect_spends_only_through_guard: a REAL runMain default-collect course (deps.call ABSENT => openGuardedClient)
// makes its paid Solana calls ONLY through the guard — EVERY paid (helius) fetch is preceded by its write-ahead
// cycle-ledger line ON DISK (checked INSIDE the fetch spy, C-12 synthetic closes). The finally releases the N locks.
// Mutant (mutants.mjs): "guard bypassed" (the shim raw-fetches instead of client.call) => no ledger line => this reds.
test("collect_spends_only_through_guard", async () => {
  const { dir, cleanup } = tmpLedger();
  const { out, cleanup: co } = tmpOut();
  const heliusLedger = join(dir, "cyc", "helius.jsonl");
  let heliusFetches = 0;
  let writeAheadOk = true; // set false if a paid fetch fires with fewer attempted ledger lines than paid fetches so far
  const btSec = Math.floor(Date.UTC(2026, 8, 19, 13, 31, 4) / 1000);
  const spy = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input); const req = parseReq(init);
    // Read helius.jsonl SYNCHRONOUSLY the moment a paid fetch fires: the write-ahead line must ALREADY be on disk.
    if (url.includes(HELIUS_HOST)) { heliusFetches += 1; if (attemptedLines(heliusLedger) < heliusFetches) writeAheadOk = false; }
    if (req.method === "getSignaturesForAddress") return Promise.resolve(jrpc([{ signature: "sig1", slot: 1, blockTime: btSec, err: null }]));
    if (req.method === "getTransaction") return Promise.resolve(jrpc({ slot: 1, meta: { err: null } })); // no vault balances => no fill (fine)
    if (req.method === "getAccountInfo") return Promise.resolve(jrpc({ context: { slot: 1 }, value: null })); // no mint (fine)
    return Promise.resolve(jrpc(null));
  }) as typeof globalThis.fetch;
  try {
    await withFetch(spy, async () => {
      await runMain(guardArgs(dir, out, ["--pools", "TSLAx", "--body-sample", "0", "--max-pages", "1",
        "--from-utc", String((btSec - 2 * 86400) * 1000), "--to-utc", String((btSec + 86400) * 1000)]), GUARD_DEPS);
    });
    assert.ok(heliusFetches >= 1, "helius (paid) was actually drawn (the guarded paid leg was exercised)");
    assert.ok(writeAheadOk, "EVERY paid fetch was preceded by its write-ahead cycle-ledger line ON DISK (mutant 'guard bypassed' => no line => reds)");
    assert.ok(attemptedLines(heliusLedger) >= heliusFetches, "helius.jsonl carries >= 1 attempted line per paid fetch");
    // the finally released BOTH requested operators (helius + solana-foundation): no lock files, an `unlocked` line each.
    for (const op of ["helius", "solana-foundation"]) {
      assert.ok(!existsSync(join(dir, "cyc", `${op}.lock`)), `${op}.lock released in the finally (N unlock)`);
      assert.ok(hasOutcome(join(dir, "cyc", `${op}.jsonl`), "unlocked"), `${op}.jsonl carries the chained unlocked line`);
    }
  } finally { co(); cleanup(); }
});

// opts.network EXPLICIT — a Solana course passes opts.network:"solana-mainnet", so `chainstack` resolves
// CHAINSTACK_SOLANA_URL; with only CHAINSTACK_ETH_URL set (no SOLANA) the guard THROWS before any lock. The mutant
// "network omitted (default ethereum-mainnet)" would resolve CHAINSTACK_ETH_URL and NOT throw => this reds. Also pins
// that a NON-explicit env (no SOLANA url) never silently runs on the ETH endpoint for a Solana course.
test("solana_course_passes_network_explicit_and_fails_closed_without_solana_url", async () => {
  const { dir, cleanup } = tmpLedger();
  const { out, cleanup: co } = tmpOut();
  const env = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, CHAINSTACK_ETH_URL: "https://cs-eth.example.invalid/KEY" } as NodeJS.ProcessEnv;
  try {
    await assert.rejects(
      () => runMain(["--ledger-dir", dir, "--cycle", "cyc", "--operators", "helius,chainstack", "--floor", "helius=0,chainstack=0",
        "--method-caps", CAPS, "--max-credits", "1000000", "--max-ru", "1000000", "--max-calls", "500000", "--min-interval", "0",
        "--out", out, "--pools", "TSLAx"], { databentoGet: noDb, polygonGet: noPoly, env, nowMs: GUARD_DEPS.nowMs }),
      /not resolved from env|CHAINSTACK_SOLANA_URL|chainstack/i,
      "a Solana course with chainstack but no CHAINSTACK_SOLANA_URL throws BEFORE any lock (opts.network solana-mainnet => SOLANA url; mutant 'network omitted' resolves ETH => no throw => reds)",
    );
    // the source passes the explicit network (belt-and-suspenders on the mutant target).
    assert.match(SRC("collect.ts"), /\{ network: "solana-mainnet", onTransportError/);
    assert.equal(existsSync(join(dir, "cyc", "chainstack.lock")), false, "no lock left on the fail-closed throw (openGuardedClient rollback)");
  } finally { co(); cleanup(); }
});

// assertMethodCapsCover — a --method-caps missing one of the 4 Bell Solana methods FAILS CLOSED at construction (before
// any lock / any call), never only at the first call. Mutant "verif no-op" (drop assertMethodCapsCover) => the course
// opens with a hole => this reds.
test("bell_method_caps_missing_a_called_method_fails_closed_at_construction", async () => {
  const { dir, cleanup } = tmpLedger();
  const { out, cleanup: co } = tmpOut();
  const partial = "getSignaturesForAddress=100,getTransaction=100,getAccountInfo=100"; // MISSING getTransactionsForAddress
  try {
    await assert.rejects(
      () => runMain(["--ledger-dir", dir, "--cycle", "cyc", "--operators", "helius,solana-foundation", "--floor", "helius=0,solana-foundation=0",
        "--method-caps", partial, "--max-credits", "1000000", "--max-calls", "500000", "--out", out, "--pools", "TSLAx"], GUARD_DEPS),
      /getTransactionsForAddress/,
      "a --method-caps missing getTransactionsForAddress fails closed at construction (assertMethodCapsCover; mutant 'verif no-op' => reds)",
    );
    assert.equal(existsSync(join(dir, "cyc", "helius.lock")), false, "the construction throw left NO lock (before openGuardedClient)");
  } finally { co(); cleanup(); }
});

// T4a (per-file, GARDE-HELIUS-1b-ii progress proof while the root fetch_only_inside_client stays SKIP until 1b-iii):
// quorum.ts / rpc.ts / rebase-crosscheck.ts hold NO `fetch(` and read NO paid key; collect.ts holds NO `fetch(` and
// ONLY the two DECLARED cash keys (POLYGON_API_KEY / DATABENTO_API_KEY), an allowlist entry with trigger "1b-iii". The
// common grep CI (extended to apps/bell/src/**) is created by 1b-i; this per-file test proves 1b-ii's files clean.
test("bell_1bii_src_files_clean_of_fetch_and_paid_keys", () => {
  const FETCH = /\bfetch\s*\(|node:https?|\bundici\b|child_process/;
  const KEY = /\benv\s*[.[]\s*["']?(HELIUS_API_KEY|CHAINSTACK_[A-Z]+_URL|POLYGON_API_KEY|DATABENTO_API_KEY)|["'](HELIUS_API_KEY|CHAINSTACK_[A-Z]+_URL|POLYGON_API_KEY|DATABENTO_API_KEY)["']\s+in\b/;
  for (const f of ["quorum.ts", "rpc.ts", "rebase-crosscheck.ts"]) {
    const src = SRC(f);
    assert.equal(FETCH.test(src), false, `${f} holds no fetch/node:http/undici/child_process (mutant: reintroduce a fetch => reds)`);
    assert.equal(KEY.test(src), false, `${f} reads no paid key`);
  }
  const collect = SRC("collect.ts");
  assert.equal(FETCH.test(collect), false, "collect.ts holds NO fetch( (bellSolanaCall removed; the transport owns fetch)");
  // collect.ts reads NO Solana endpoint key (helius/chainstack resolved by the transport); a mutant reintroducing one reds.
  const solanaKeyReads = collect.match(/\benv\s*[.[]\s*["']?(HELIUS_API_KEY|CHAINSTACK_[A-Z]+_URL|BELL_SOLANA_RPC)/g) ?? [];
  assert.deepEqual(solanaKeyReads, [], "collect.ts reads NO Solana endpoint key (BELL_SOLANA_RPC/HELIUS/CHAINSTACK) — the guard transport does");
  // collect.ts reads EXACTLY the two DECLARED cash keys (1b-iii allowlist, trigger "G0 course cash Bell").
  const cashKeyReads = (collect.match(/deps\.env\.(POLYGON_API_KEY|DATABENTO_API_KEY)/g) ?? []).sort();
  assert.deepEqual(cashKeyReads, ["deps.env.DATABENTO_API_KEY", "deps.env.POLYGON_API_KEY"], "collect.ts reads ONLY the two DECLARED cash keys (1b-iii allowlist, trigger G0 course cash Bell)");
  // CONF-SRC-5: the EXCLUDED host literal is GONE from rpc.ts (the guard resolves the keyless solana-foundation label ->
  // the ADMITTED host api.mainnet.solana.com). Mutant "restore mainnet-beta literal in rpc.ts" reds this.
  assert.equal(SRC("rpc.ts").includes("mainnet-beta.solana.com"), false, "CONF-SRC-5: the excluded host api.mainnet-beta.solana.com is removed from rpc.ts (the guard resolves solana-foundation -> the admitted api.mainnet.solana.com)");
});
