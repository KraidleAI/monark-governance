// GARDE-HELIUS-1b PLI (orchestrator ruling 2026-09-22, checkpoint-2 fold) — the three tests the pli owes, each a
// non-LLM composition over the REAL served entries with ONLY globalThis.fetch stubbed (CA-11 durci: no fake client,
// no fake transport, real-form bodies A-8). No commit (R-20), no network. All oracles run under `env -u` of the 8 paid
// keys (A-7). Three pins:
//  (1) bell_course_reaches_fetch_only_via_openGuardedClient — the imposed D-1 test (G0 §7), a functional probe on BOTH
//      served entries (runUniverse AND collect runMain): every fetch is preceded by its write-ahead cycle-ledger line
//      on disk (i.e. reached ONLY via openGuardedClient.call). Reddened by 1b-i M5 (commit-after-transport, universe)
//      and 1b-ii "guard bypassed" (shim raw-bypass, collect).
//  (2) bell_collect_eth_leg_served_fills_state_through_guard — the ETH leg is wired at collect.ts (C-G2-A): runMain --eth
//      from the real argv, a SECOND keyless guarded client, produces a TSLAon fill in state.json.digest. Reddened by the
//      "eth call omitted at call site" mutant (reverts the wiring => liveEthSwaps throws => fault, 0 fill).
//  (3) bell_universe_429_streak_stops_fail_closed — the cross-lot 429-streak (1b-ii statusOf(.code) -> 1b-i streak429):
//      chainstack answers 429 forever (Retry-After), --max-429-streak 2 => STOP fail-closed after 2 confirms (R+1 ledger
//      lines per confirm, 0 .lock). Reddened by 1b-ii "statusOf ignores .code" and by the dedicated ">= -> >" mutant.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runMain } from "../src/collect.ts";
import { runUniverse } from "../src/universe-cli.ts";
import { UNISWAP_V3_SWAP_TOPIC } from "../src/ethereum.ts";
import { BELL_SOLANA_METHODS } from "@monark/rpc-guard";
import type { DatabentoGet, PolygonGet } from "../src/close.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, "fixtures", "universe");
const issuerAssets = (): unknown[] => JSON.parse(readFileSync(join(FIX, "issuer-assets.json"), "utf8")) as unknown[];
const rpcMap = (): Record<string, unknown> => JSON.parse(readFileSync(join(FIX, "rpc-getaccountinfo.json"), "utf8")) as Record<string, unknown>;
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
const jbody = (v: unknown): Response => new Response(JSON.stringify(v), { status: 200, headers: { "content-type": "application/json" } });
const parseReq = (init?: RequestInit): { method: string; params: unknown[] } => JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
/** Sum, across every <op>.jsonl under the cycle dir, the write-ahead "attempted" line count (the money meter). */
function attemptedLines(cd: string): number {
  let n = 0;
  if (!existsSync(cd)) return 0;
  for (const f of readdirSync(cd)) { if (!f.endsWith(".jsonl")) continue; n += readFileSync(join(cd, f), "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"attempted"')).length; }
  return n;
}
const locksLeft = (cd: string): string[] => (existsSync(cd) ? readdirSync(cd).filter((f) => f.endsWith(".lock")) : []);
function tmp(prefix: string): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), prefix)); // OUT of repo; ensureCycleDir needs the parent to pre-exist
  return { dir, cleanup: (): void => rmSync(dir, { recursive: true, force: true }) };
}
async function withFetch(stub: typeof globalThis.fetch, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch; globalThis.fetch = stub;
  try { await body(); } finally { globalThis.fetch = real; }
}
/** File-backed universe deps (fs + no-op sleep counter + a Chainstack env url). */
function universeDeps(env: Record<string, string | undefined>, onSleep?: () => void): Parameters<typeof runUniverse>[1] {
  return {
    sleep: (): Promise<void> => { onSleep?.(); return Promise.resolve(); }, now: () => 1_700_000_000_000, env,
    readFile: (p: string) => readFileSync(p, "utf8"), writeFile: (p: string, d: string) => { writeFileSync(p, d); },
    appendFile: (p: string, d: string) => { appendFileSync(p, d); }, exists: (p: string) => existsSync(p), mkdirp: (p: string) => { mkdirSync(p, { recursive: true }); },
  };
}
const UNIVERSE_ARGS = (out: string, ld: string, extra: string[] = []): string[] => [
  // --min-interval omitted (defaults to the 286 ms floor; the injected deps.sleep is a no-op so the run is fast).
  "--out", out, "--max-calls", "100000", "--date", "2026-09-21", "--page-size", "100", "--ledger-dir", ld, "--cycle", "cyc",
  "--floor", "0", "--max-ru", "1000000", "--method-caps", "getAccountInfo=20000", "--operators", "solana-foundation,chainstack,xstocks-issuer", ...extra];
const CS_URL = "https://cs-node.example.invalid/tk"; // chainstack node url (host carries "invalid": stub matches it)
const HELIUS_HOST = "helius.example.invalid";
const SOL_CAPS = BELL_SOLANA_METHODS.map((m) => `${m}=100000000`).join(",");
const noDb: DatabentoGet = () => Promise.resolve([]);
const noPoly: PolygonGet = () => Promise.resolve({ results: [] });

// ---------------------------------------------------------------------------------------------------------------------
// (1) D-1 imposed: BOTH served entries reach fetch ONLY through openGuardedClient (write-ahead line precedes every fetch)
// ---------------------------------------------------------------------------------------------------------------------
test("bell_course_reaches_fetch_only_via_openGuardedClient", async () => {
  // ----- Entry A: runUniverse (universe course) -----
  {
    const { dir: ld, cleanup: cl } = tmp("pli-univ-ld-");
    const { dir: out, cleanup: co } = tmp("pli-univ-out-");
    const cd = join(ld, "cyc");
    let fetches = 0, writeAheadOk = true, chainstackFetches = 0;
    const spy = ((input: string | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input);
      fetches += 1;
      if (attemptedLines(cd) < fetches) writeAheadOk = false; // the write-ahead line must ALREADY be on disk when a fetch fires
      if (url.includes("invalid")) chainstackFetches += 1; // chainstack (the paid operator)
      if (url.includes("xstocks")) { const page = Number(new URL(url).searchParams.get("page") ?? "0"); return Promise.resolve(jbody(page === 0 ? issuerAssets() : [])); }
      const req = parseReq(init);
      return Promise.resolve(jbody({ jsonrpc: "2.0", id: 1, result: rpcMap()[String(req.params[0])] ?? { value: null } }));
    }) as typeof globalThis.fetch;
    try {
      await withFetch(spy, async () => { await runUniverse(UNIVERSE_ARGS(out, ld), universeDeps({ CHAINSTACK_SOLANA_URL: CS_URL })); });
      assert.ok(fetches >= 1, "the universe course actually fetched (composition ran)");
      assert.ok(chainstackFetches >= 1, "the PAID chainstack operator was drawn (the guarded paid leg was exercised)");
      assert.ok(writeAheadOk, "universe: EVERY fetch was preceded by its write-ahead cycle-ledger line on disk (mutant 'commit after transport' => reds)");
    } finally { co(); cl(); }
  }
  // ----- Entry B: collect runMain (Solana course) -----
  {
    const { dir: ld, cleanup: cl } = tmp("pli-collect-ld-");
    const { dir: out, cleanup: co } = tmp("pli-collect-out-");
    const cd = join(ld, "cyc");
    const btSec = Math.floor(Date.UTC(2026, 8, 19, 13, 31, 4) / 1000);
    let fetches = 0, writeAheadOk = true, heliusFetches = 0;
    const spy = ((input: string | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input); const req = parseReq(init);
      fetches += 1;
      if (attemptedLines(cd) < fetches) writeAheadOk = false;
      if (url.includes(HELIUS_HOST)) heliusFetches += 1; // helius (the paid operator)
      if (req.method === "getSignaturesForAddress") return Promise.resolve(jrpc([{ signature: "sig1", slot: 1, blockTime: btSec, err: null }]));
      if (req.method === "getTransaction") return Promise.resolve(jrpc({ slot: 1, meta: { err: null } }));
      if (req.method === "getAccountInfo") return Promise.resolve(jrpc({ context: { slot: 1 }, value: null }));
      return Promise.resolve(jrpc(null));
    }) as typeof globalThis.fetch;
    try {
      await withFetch(spy, async () => {
        await runMain(["--ledger-dir", ld, "--cycle", "cyc", "--operators", "helius,solana-foundation", "--floor", "helius=0,solana-foundation=0",
          "--method-caps", SOL_CAPS, "--max-credits", "1000000000", "--max-calls", "500000", "--min-interval", "0", "--out", out,
          "--pools", "TSLAx", "--body-sample", "0", "--max-pages", "1", "--from-utc", String((btSec - 2 * 86400) * 1000), "--to-utc", String((btSec + 86400) * 1000)],
          { databentoGet: noDb, polygonGet: noPoly, env: { BELL_SOLANA_RPC: `https://${HELIUS_HOST}` }, nowMs: Date.UTC(2026, 8, 20) });
      });
      assert.ok(fetches >= 1, "the collect course actually fetched (composition ran)");
      assert.ok(heliusFetches >= 1, "the PAID helius operator was drawn (the guarded paid leg was exercised)");
      assert.ok(writeAheadOk, "collect: EVERY fetch was preceded by its write-ahead cycle-ledger line on disk (mutant 'guard bypassed' => reds)");
    } finally { co(); cl(); }
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// (2) C-G2-A: the ETH leg is WIRED at collect.ts:736 via a SECOND keyless guarded client — runMain --eth from the real
// argv produces a served TSLAon fill in state.json.digest, keyless ledger lines write-ahead, 0 .lock, no fault.
// ---------------------------------------------------------------------------------------------------------------------
test("bell_collect_eth_leg_served_fills_state_through_guard", async () => {
  const { dir: ld, cleanup: cl } = tmp("pli-eth-ld-");
  const { dir: out, cleanup: co } = tmp("pli-eth-out-");
  const cd = join(ld, "cyc");
  const word = (n: bigint): string => n.toString(16).padStart(64, "0");
  const SWAP = { blockNumber: "0x1", logIndex: "0x0", transactionHash: "0x" + "cc".repeat(32), topics: [UNISWAP_V3_SWAP_TOPIC], data: "0x" + word(1_000_000n) + word(2_000_000n) };
  let ethFetches = 0, writeAheadOk = true;
  const spy = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    ethFetches += 1;
    if (attemptedLines(cd) < ethFetches) writeAheadOk = false; // keyless ETH ledger line BEFORE the fetch
    const req = parseReq(init);
    if (req.method === "eth_getLogs") return Promise.resolve(jrpc([SWAP]));
    if (req.method === "eth_getBlockByNumber") return Promise.resolve(jrpc({ hash: "0x" + "11".repeat(32), number: "0x1", timestamp: "0x66000000" }));
    return Promise.resolve(jrpc(null));
  }) as typeof globalThis.fetch;
  const CAPS = SOL_CAPS + ",eth_getLogs=100000,eth_getBlockByNumber=100000";
  try {
    await withFetch(spy, async () => {
      await runMain(["--ledger-dir", ld, "--cycle", "cyc", "--operators", "helius,solana-foundation", "--floor", "helius=0,solana-foundation=0",
        "--method-caps", CAPS, "--max-credits", "1000000", "--max-calls", "500000", "--min-interval", "0", "--out", out,
        "--pools", "TSLAon", "--eth", "--eth-from-block", "1", "--eth-to-block", "100"],
        { databentoGet: noDb, polygonGet: noPoly, env: { BELL_SOLANA_RPC: `https://${HELIUS_HOST}` }, nowMs: Date.UTC(2026, 8, 20) });
    });
    assert.ok(ethFetches >= 1, "the ETH leg actually fetched (eth_getLogs quorum ran) — a non-wired call site fetches 0");
    assert.ok(writeAheadOk, "every ETH fetch was preceded by its write-ahead keyless ledger line on disk");
    // the served TSLAon fill flowed into state.json.digest (a non-wired call site produces NO TSLAon entry).
    const state = JSON.parse(readFileSync(join(out, "state.json"), "utf8")) as { digest?: { gaps?: Array<{ symbol: string; n: number }> } };
    const tslaon = (state.digest?.gaps ?? []).filter((g) => g.symbol === "TSLAon");
    assert.ok(tslaon.length >= 1, "state.json.digest carries a TSLAon gap entry (the ETH leg produced a symbol)");
    assert.ok(tslaon.some((g) => g.n >= 1), `the TSLAon entry carries >= 1 fill (n>=1); got ${JSON.stringify(tslaon.map((g) => g.n))}`);
    // the timeline record confirms the ethereum fill count.
    const timeline = readFileSync(join(out, "timeline.jsonl"), "utf8").trim().split(/\r?\n/).map((l) => JSON.parse(l) as { symbol: string; chain: string; n_fills: number });
    const tl = timeline.find((r) => r.symbol === "TSLAon");
    assert.ok(tl && tl.chain === "ethereum" && tl.n_fills >= 1, "timeline carries the TSLAon ethereum record with n_fills >= 1");
    // no silent transport fault (the bug was: liveEthSwaps threw => faults[{provider:'ethereum',status:'transport'}]).
    const journal = JSON.parse(readFileSync(join(out, "journal.json"), "utf8")) as { faults?: Array<{ provider: string }> };
    assert.equal((journal.faults ?? []).filter((f) => f.provider === "ethereum").length, 0, "no ethereum transport fault (the leg served, it did not silently fault)");
    assert.deepEqual(locksLeft(cd), [], "the finally released every lock on BOTH clients (Solana + ETH keyless): 0 .lock");
  } finally { co(); cl(); }
});

// ---------------------------------------------------------------------------------------------------------------------
// (2b) C-G2-A contract, fail-closed BEFORE any lock: a --eth course must NOT list the keyless ETH labels in --operators
// (they get their OWN client). The old served form (validator §3(c)) listed them; the pli refuses it by name so the
// Solana client `c` never locks a label the ETH client would collide on (which would leak c's N locks). 0 .lock.
// ---------------------------------------------------------------------------------------------------------------------
test("bell_eth_course_refuses_keyless_labels_in_operators", async () => {
  const { dir: ld, cleanup: cl } = tmp("pli-ethrej-ld-");
  const { dir: out, cleanup: co } = tmp("pli-ethrej-out-");
  const cd = join(ld, "cyc");
  const CAPS = SOL_CAPS + ",eth_getLogs=100000,eth_getBlockByNumber=100000";
  try {
    await assert.rejects(
      () => runMain(["--ledger-dir", ld, "--cycle", "cyc", "--operators", "helius,solana-foundation,drpc.org", "--floor", "helius=0,solana-foundation=0",
        "--method-caps", CAPS, "--max-credits", "1000000", "--max-calls", "500000", "--min-interval", "0", "--out", out,
        "--pools", "TSLAon", "--eth", "--eth-from-block", "1", "--eth-to-block", "100"],
        { databentoGet: noDb, polygonGet: noPoly, env: { BELL_SOLANA_RPC: `https://${HELIUS_HOST}` }, nowMs: Date.UTC(2026, 8, 20) }),
      /must NOT be in --operators/, "a keyless ETH label in --operators is refused fail-closed (contract C-G2-A)");
    assert.deepEqual(locksLeft(cd), [], "the refusal took NO lock (it fired BEFORE any openGuardedClient): 0 .lock (mutant 'labels check removed' => LockHeld collision + leaked locks => reds)");
  } finally { co(); cl(); }
});

// (2c) C-G2-A: a --eth course must carry --method-caps for the two ETH methods (assertMethodCapsCover covers only Solana).
// Fail-closed BEFORE any lock. Mutant "eth caps check removed" => no construction refusal => this assert.rejects reds.
test("bell_eth_course_fails_closed_without_eth_method_caps", async () => {
  const { dir: ld, cleanup: cl } = tmp("pli-ethcap-ld-");
  const { dir: out, cleanup: co } = tmp("pli-ethcap-out-");
  const cd = join(ld, "cyc");
  try {
    await assert.rejects(
      () => runMain(["--ledger-dir", ld, "--cycle", "cyc", "--operators", "helius,solana-foundation", "--floor", "helius=0,solana-foundation=0",
        "--method-caps", SOL_CAPS, "--max-credits", "1000000", "--max-calls", "500000", "--min-interval", "0", "--out", out,
        "--pools", "TSLAon", "--eth", "--eth-from-block", "1", "--eth-to-block", "100"],
        { databentoGet: noDb, polygonGet: noPoly, env: { BELL_SOLANA_RPC: `https://${HELIUS_HOST}` }, nowMs: Date.UTC(2026, 8, 20) }),
      /requires --method-caps to cover 'eth_getLogs'/, "a --eth course without the ETH method caps is refused fail-closed at construction");
    assert.deepEqual(locksLeft(cd), [], "the refusal took NO lock (fired BEFORE any openGuardedClient): 0 .lock");
  } finally { co(); cl(); }
});

// ---------------------------------------------------------------------------------------------------------------------
// (3) cross-lot 429-streak: chainstack 429s forever (Retry-After), --max-429-streak 2 => STOP fail-closed after 2
// confirms (each confirm: 1 + 4 retries = 5 chainstack fetches; R+1 ledger lines), 0 .lock.
// ---------------------------------------------------------------------------------------------------------------------
test("bell_universe_429_streak_stops_fail_closed", async () => {
  const { dir: ld, cleanup: cl } = tmp("pli-429-ld-");
  const { dir: out, cleanup: co } = tmp("pli-429-out-");
  const cd = join(ld, "cyc");
  let chainstack429 = 0;
  const spy = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes("xstocks")) { const page = Number(new URL(url).searchParams.get("page") ?? "0"); return Promise.resolve(jbody(page === 0 ? issuerAssets() : [])); }
    if (url.includes("invalid")) { chainstack429 += 1; return Promise.resolve(new Response("slow down", { status: 429, headers: { "retry-after": "0" } })); }
    const req = parseReq(init);
    return Promise.resolve(jbody({ jsonrpc: "2.0", id: 1, result: rpcMap()[String(req.params[0])] ?? { value: null } }));
  }) as typeof globalThis.fetch;
  try {
    await withFetch(spy, async () => {
      await assert.rejects(
        () => runUniverse(UNIVERSE_ARGS(out, ld, ["--max-429-streak", "2"]), universeDeps({ CHAINSTACK_SOLANA_URL: CS_URL })),
        /consecutive rate-limited \(429\)/, "2 consecutive 429-rate-limited confirms STOP the run fail-closed (never a truncated universe as complete)");
    });
    // 2 confirms x (1 + 4 retries) = 10 chainstack fetches; R+1 write-ahead ledger lines per confirm (each retry re-enters c.call).
    assert.equal(chainstack429, 10, `2 confirms x 5 attempts (1 + 4 retries honouring Retry-After) = 10 chainstack fetches; got ${String(chainstack429)}`);
    assert.ok(attemptedLines(cd) >= 10, `each retry is its own write-ahead ledger line (R retries => R+1 per confirm); got ${String(attemptedLines(cd))}`);
    assert.deepEqual(locksLeft(cd), [], "the finally released the N locks on the fail-closed STOP: 0 .lock");
  } finally { co(); cl(); }
});
