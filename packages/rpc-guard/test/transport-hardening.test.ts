import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openGuardedClient, TransportError, verifyCycleLedger, BELL_SOLANA_METHODS, assertMethodCapsCover, type RunLimits, type OperatorLabel, type CycleLedgerEntry } from "@monark/rpc-guard";
import { resolveOperators } from "../src/transport.ts";
import { ensureCycleDir, openOperatorLedger } from "../src/ledger.ts";
import { releaseLock } from "../src/lock.ts";
import { tmp } from "./harness.ts";

// GARDE-HELIUS-1b-0 - the hardened transport semantics ported from apps/bell/src/universe(.ts) into @monark/rpc-guard
// (D-9 / C-2 / C-3b / C-7), the multi-network chainstack (decision 121 / C-5 / D-4), and the Bell method-cap coverage
// (C-3c). Only globalThis.fetch is stubbed (no fake transport/client). Named mutants are replayed by mutants.mjs.

const HELIUS_ENV = { BELL_SOLANA_RPC: "https://helius.example.invalid/RPC", HELIUS_API_KEY: "FAKEKEY-9z9z9z" };
async function withFetch(stub: typeof globalThis.fetch, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch; globalThis.fetch = stub;
  try { await body(); } finally { globalThis.fetch = real; }
}
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });

test("solana_foundation_label_resolves_to_pli_admitted_host", async () => {
  // C-2: the keyless solana-foundation label resolves the PLI-ADMITTED host api.mainnet.solana.com, NEVER the EXCLUDED
  // api.mainnet-beta.solana.com (CONF-SRC-5). The keyless URL carries no secret, so the spy may read it.
  const { transport } = resolveOperators({});
  let seen = "";
  await withFetch(((input: string | URL) => { seen = String(input); return Promise.resolve(jrpc(1)); }) as typeof globalThis.fetch, async () => {
    await transport("solana-foundation" as OperatorLabel, "getAccountInfo", ["MINT"]);
  });
  assert.equal(seen, "https://api.mainnet.solana.com", "solana-foundation resolves the ADMITTED host (mutant 'mainnet-beta' reds)");
  assert.ok(!seen.includes("mainnet-beta"), "never the excluded mainnet-beta host (CONF-SRC-5)");
});

test("transport_error_carries_retry_after_ms", async () => {
  // C-3b / D-9: a 429 carries the parsed Retry-After (ms) so the CALLER (never the one-attempt transport) can honour
  // the server backoff. Mutant "header not read" => retryAfterMs undefined => reds.
  const { transport } = resolveOperators(HELIUS_ENV);
  await withFetch(() => Promise.resolve(new Response("rate limited", { status: 429, headers: { "retry-after": "2" } })), async () => {
    await assert.rejects(transport("helius" as OperatorLabel, "getTransaction", [1]), (e: unknown) => {
      assert.ok(e instanceof TransportError);
      assert.equal(e.code, 429);
      assert.equal(e.retryAfterMs, 2000, "Retry-After: 2 parsed to 2000 ms (mutant 'header not read' reds)");
      return true;
    });
  });
});

test("transport_3xx_is_hard_stop_never_followed", async () => {
  // D-9a: redirect:"manual" => a 3xx is a typed HARD STOP (name RedirectBlocked), never followed; the body is never
  // read nor forwarded to the redirected host. Mutant "redirect suivi" (drop redirect:"manual") reds the init check.
  const { transport } = resolveOperators(HELIUS_ENV);
  let calls = 0; let sawManual = false;
  await withFetch(((_i: string | URL, init?: RequestInit) => { calls += 1; if (init?.redirect === "manual") sawManual = true; return Promise.resolve(new Response(null, { status: 302, headers: { location: "https://evil.example.invalid/" } })); }) as typeof globalThis.fetch, async () => {
    await assert.rejects(transport("helius" as OperatorLabel, "getTransaction", [1]), (e: unknown) => {
      assert.ok(e instanceof TransportError);
      assert.equal(e.name, "RedirectBlocked", "a 3xx surfaces as the typed hard-stop RedirectBlocked (mutant '3xx branch removed' => HttpError reds)");
      assert.equal(e.code, 302);
      return true;
    });
  });
  assert.ok(sawManual, "fetch was called with redirect:'manual' (mutant 'redirect suivi' => absent reds)");
  assert.equal(calls, 1, "the redirect was NOT followed (exactly one fetch; the body never reached the Location host)");
});

test("transport_403_is_fatal_hard_stop", async () => {
  // D-9b: a 403 surfaces as a TransportError with code 403 and NO retryAfterMs (fatal, never rate-limited). The caller
  // (1b-i withUniverseRetry) maps code 403 -> Fatal403Error and never retries; 1b-0 proves the transport preserves the
  // 403 distinctly (never a swallowed value, never a redirect, never a retryable backoff). Mutant "403 retryable" reds.
  const { transport } = resolveOperators(HELIUS_ENV);
  await withFetch(() => Promise.resolve(new Response("forbidden", { status: 403 })), async () => {
    await assert.rejects(transport("helius" as OperatorLabel, "getTransaction", [1]), (e: unknown) => {
      assert.ok(e instanceof TransportError);
      assert.equal(e.name, "HttpError");
      assert.equal(e.code, 403, "the 403 code is preserved (never masked, never a resolved value)");
      assert.equal(e.retryAfterMs, undefined, "a 403 carries NO retry-after => the caller hard-stops it, never retries");
      return true;
    });
  });
});

test("xstocks_issuer_get_uses_get_and_structural_host", async () => {
  // C-7 beta: the keyless xstocks-issuer operator does an HTTP GET (method="GET", params=[pathAndQuery]); the request URL
  // is the pathAndQuery RESOLVED under the admitted host, and assertHostAllowed is STRUCTURAL - a pathAndQuery can
  // never escape to another host. Mutant "structural host check removed" reds (an off-host path would be fetched).
  const { transport } = resolveOperators({});
  let method = ""; let url = "";
  await withFetch(((i: string | URL, init?: RequestInit) => { method = String(init?.method); url = String(i); return Promise.resolve(jrpc({ assets: [] })); }) as typeof globalThis.fetch, async () => {
    await transport("xstocks-issuer" as OperatorLabel, "GET", ["/api/v2/public/assets?pageSize=100&page=0"]);
    assert.equal(method, "GET", "the issuer operator uses method=GET (C-7 beta)");
    assert.equal(url, "https://api.xstocks.fi/api/v2/public/assets?pageSize=100&page=0", "the GET URL is the pathAndQuery under the admitted host");
    // STRUCTURAL host: a protocol-relative or an absolute off-host pathAndQuery is REFUSED before any fetch.
    await assert.rejects(transport("xstocks-issuer" as OperatorLabel, "GET", ["//evil.example.invalid/x"]), /off the admitted host/, "a protocol-relative host escape is refused (structural)");
    await assert.rejects(transport("xstocks-issuer" as OperatorLabel, "GET", ["https://evil.example.invalid/x"]), /off the admitted host/, "an absolute off-host url is refused (structural)");
  });
});

test("chainstack_one_account_cap_across_networks", async () => {
  // D-4 / C-5 (decision 121): chainstack is ONE operator per ACCOUNT. An ETH course then a Solana course on the SAME
  // cycle dir share ONE chainstack.jsonl, so the 2nd course's frozen prior INCLUDES the 1st (one 16 M cap across
  // networks). Mutant "prior filtered by network" (per-network floor) => prior 1, and "ledger split per network" =>
  // a second file + prior 1: both red the prior==3 assertion below.
  const { dir, cleanup } = tmp();
  const cyc = "cyc-121";
  const cd = join(dir, cyc);
  const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1_000_000 }, methodCaps: { eth_getBlockByNumber: 100, getAccountInfo: 100 }, cycleFloor: { chainstack: 0 } };
  try {
    await withFetch(() => Promise.resolve(jrpc({ number: "0x1" })), async () => {
      const eth = openGuardedClient({ CHAINSTACK_ETH_URL: "https://cs-eth.example.invalid/FAKE" }, limits, dir, { chainstack: cyc }, { network: "ethereum-mainnet" });
      await eth.call("chainstack" as OperatorLabel, "eth_getBlockByNumber", ["finalized", false]); // 2 RU
      releaseLock(cd, "chainstack"); // end of course 1 (a real course's finally)
      const sol = openGuardedClient({ CHAINSTACK_SOLANA_URL: "https://cs-sol.example.invalid/FAKE" }, limits, dir, { chainstack: cyc }, { network: "solana-mainnet" });
      await sol.call("chainstack" as OperatorLabel, "getAccountInfo", ["MINT", { encoding: "jsonParsed" }]); // 1 RU
      releaseLock(cd, "chainstack");
    });
    assert.ok(existsSync(join(cd, "chainstack.jsonl")), "ONE chainstack ledger per account (never per-network)");
    assert.ok(!existsSync(join(cd, "chainstack-solana-mainnet.jsonl")) && !existsSync(join(cd, "chainstack-ethereum-mainnet.jsonl")), "no per-network ledger split (121: one cap per account)");
    const reopen = openOperatorLedger(ensureCycleDir(dir, cyc), "chainstack", 0, "solana-mainnet");
    assert.equal(reopen.priorAtOpen(), 3, "the frozen prior includes BOTH networks' attempted RU (2 ETH + 1 Solana) - one 16 M account cap");
  } finally { cleanup(); }
});

test("cycle_ledger_mixes_legacy_and_network_lines", async () => {
  // C-5 / C-R-b6: the LEGACY line is produced by the REAL guard stack (openGuardedClient -> makeClient -> commit ->
  // appendChained) with opts.network ABSENT - the EXACT path the 2b-ii recorder uses (it passes no opts.network), so
  // the line is byte-identical to a 2b-ii-written chainstack line, NOT a fabricated one. A 121 course (opts.network
  // set) then stamps `network`. Both mix in ONE chainstack.jsonl: the chain re-derives (verifyCycleLedger on PRESENT
  // fields) and the prior is the ACCOUNT total. Mutant "prior filtered by network" reds the prior==3 assertion.
  const { dir, cleanup } = tmp();
  const cyc = "cyc-mix";
  const cd = join(dir, cyc);
  const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1_000_000 }, methodCaps: { eth_getBlockByNumber: 100, getAccountInfo: 100 }, cycleFloor: { chainstack: 0 } };
  try {
    await withFetch(() => Promise.resolve(jrpc({ number: "0x1" })), async () => {
      // LEGACY course: NO opts.network => chainstack resolves via the pre-121 default (CHAINSTACK_ETH_URL) and the line
      // carries NO network field - the real 2b-ii recorder shape (produced by the real stack, not fabricated by hand).
      const legacy = openGuardedClient({ CHAINSTACK_ETH_URL: "https://cs-eth.example.invalid/FAKE" }, limits, dir, { chainstack: cyc });
      await legacy.call("chainstack" as OperatorLabel, "eth_getBlockByNumber", ["finalized", false]); // 2 RU, legacy line
      releaseLock(cd, "chainstack");
      // 121 course: opts.network set => the new line stamps network=solana-mainnet, chained from the legacy head.
      const net = openGuardedClient({ CHAINSTACK_SOLANA_URL: "https://cs-sol.example.invalid/FAKE" }, limits, dir, { chainstack: cyc }, { network: "solana-mainnet" });
      await net.call("chainstack" as OperatorLabel, "getAccountInfo", ["MINT", { encoding: "jsonParsed" }]); // 1 RU, network line
      releaseLock(cd, "chainstack");
    });
    const lines = readFileSync(join(cd, "chainstack.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry);
    assert.equal(lines.length, 2);
    assert.ok(!("network" in lines[0]!), "line 1 (legacy, pre-121 course via the real guard stack) carries NO network field");
    assert.equal(lines[1]!.network, "solana-mainnet", "line 2 (121 course) carries network=solana-mainnet");
    assert.doesNotThrow(() => { verifyCycleLedger(lines); }, "the mixed legacy + network chain re-derives (verifyCycleLedger on present fields)");
    const reopen = openOperatorLedger(cd, "chainstack", 0, "solana-mainnet");
    assert.equal(reopen.priorAtOpen(), 3, "prior = sum of legacy + network attempted (one account total, 121; mutant 'prior filtered by network' reds)");
  } finally { cleanup(); }
});

test("bell_method_caps_table_covers_every_called_method", () => {
  // C-3c / D-8: the closed 4-method Bell-Solana table, and a construction-time --method-caps coverage check.
  assert.deepEqual([...BELL_SOLANA_METHODS].sort(), ["getAccountInfo", "getSignaturesForAddress", "getTransaction", "getTransactionsForAddress"], "the closed Bell-Solana method table (4 methods, M4)");
  const full: Record<string, number> = { getSignaturesForAddress: 100, getTransaction: 100, getAccountInfo: 100, getTransactionsForAddress: 10 };
  assert.doesNotThrow(() => { assertMethodCapsCover(full, BELL_SOLANA_METHODS, "bell-solana"); }, "a table covering all 4 methods passes at construction");
  for (const drop of BELL_SOLANA_METHODS) {
    const partial: Record<string, number> = Object.fromEntries(Object.entries(full).filter(([k]) => k !== drop));
    assert.throws(() => { assertMethodCapsCover(partial, BELL_SOLANA_METHODS, "bell-solana"); }, new RegExp(drop), `dropping ${drop} from --method-caps throws at construction (mutant 'coverage check no-op' reds)`);
  }
  assert.throws(() => { assertMethodCapsCover({ ...full, getAccountInfo: 0 }, BELL_SOLANA_METHODS, "bell-solana"); }, /getAccountInfo/, "a cap of 0 counts as uncovered (it would refuse every call)");
});
