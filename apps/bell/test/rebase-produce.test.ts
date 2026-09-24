// MONARK Bell — L-3 authority PRODUCER composition oracle (ADR-T1aii D1-sexies, lot -b1-bis-i; checkpoint-1
// C-1/C-8, CA-11 durci). NO network: the injected `call` returns hand-built RPC shapes. The test EXECUTES the
// composition FROM THE PRODUCED FILE (never a regex on the source): runMain --rebase-produce -> FILE ->
// loadTrajectories -> buildSolanaSymbol (with the L-4 C-3 anchor) -> gate -> collect (sessionGapRebase), asserting
// on the produced state (a trajectory_known g_t + rebase_residuals + counts, C-10). Named mutants: producer
// omits/mis-writes scanMethod => entry dropped => rebase_unverified => red; loadTrajectories accepts an unknown
// scanMethod => the bogus-file assertion reds; the gTfA pager double-increment => 1 page => enumeration_capped => reds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { produceTrajectories, writeTrajectoryFile, scanMethodFromMethod, HYBRID_AUTHORITY_METHOD } from "../src/rebase-produce.ts";
import { runMain, buildSolanaSymbol, loadTrajectories, collect, type SymbolInput } from "../src/collect.ts";
import { TOKEN_2022_PROGRAM } from "../src/rebase-scan.ts";
import { f64BitsHexLE } from "../src/rebase-trajectory.ts";
import { assertNoClose } from "../src/digest.ts";
import { type DatabentoGet, type PolygonGet } from "../src/close.ts";
import { POOLS, XSTOCKS } from "../src/pools.ts";
import { classifySession, refCloseDateOf } from "../src/sessions.ts";
import { type JsonRpcCall, type TransportFault } from "../src/quorum.ts";

const PROVIDERS = ["https://mainnet.helius-rpc.com", "https://solana-mainnet.core.chainstack.com"]; // operators helius, chainstack
const RPC_ENV = { BELL_SOLANA_RPC: PROVIDERS.join(",") } as NodeJS.ProcessEnv;
const SPYX = XSTOCKS.find((t) => t.symbol === "SPYx")!;
const SPYX_POOL = POOLS.find((p) => p.baseSymbol === "SPYx" && p.chain === "solana")!;

// A synthetic 32-byte shared authority; AUTHORITY is its base58 (what the CLI --authority would carry). The
// on-chain state carries these exact bytes, so pinOracleState's authority == hex(base58Decode(AUTHORITY)).
const AUTH_BYTES = new Uint8Array(32).fill(7);
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function b58enc(bytes: Uint8Array): string {
  let x = 0n; for (const b of bytes) x = x * 256n + BigInt(b);
  let s = ""; while (x > 0n) { s = B58[Number(x % 58n)] + s; x /= 58n; }
  for (const b of bytes) { if (b === 0) s = "1" + s; else break; }
  return s || "1";
}
const AUTHORITY = b58enc(AUTH_BYTES);

function initBytes(m: number): Uint8Array { const b = new Uint8Array(42); b[0] = 43; b[1] = 0; new DataView(b.buffer).setFloat64(34, m, true); return b; }
function updBytes(m: number, effTs: number): Uint8Array {
  const b = new Uint8Array(18); b[0] = 43; b[1] = 1; const dv = new DataView(b.buffer); dv.setFloat64(2, m, true); dv.setBigInt64(10, BigInt(effTs), true); return b;
}
/** 56-byte ScaledUiAmountConfig with a NON-zero authority (bytes 0..32). */
function stateBytes(auth: Uint8Array, mult: number, effTs: number, newMult: number): Uint8Array {
  const b = new Uint8Array(56); b.set(auth.slice(0, 32), 0);
  const dv = new DataView(b.buffer); dv.setFloat64(32, mult, true); dv.setBigInt64(40, BigInt(effTs), true); dv.setFloat64(48, newMult, true); return b;
}
/** A gTfA-`full` / getTransaction-json body carrying its own signature; accountKeys[MINT, AUTH, T22, OTHER]. */
function jsonTx(sig: string, slot: number, blockTime: number, instrs: Array<{ accts: number[]; data: Uint8Array }>): unknown {
  const mk = (i: { accts: number[]; data: Uint8Array }) => ({ programIdIndex: 2, accounts: i.accts, data: b58enc(i.data) });
  return { slot, blockTime, transaction: { signatures: [sig], message: { accountKeys: [SPYX.address, AUTHORITY, TOKEN_2022_PROGRAM, "OtherMint2222222222222222222222222222222222"], instructions: instrs.map(mk) } },
    meta: { innerInstructions: [] } };
}

// The founding-window trajectory: init m=1 (pre-window), one in-window UpdateMultiplier m=1.0039 whose effTs lands
// in-window => the gate is trajectory_known (not constant). effTs 1761954000 = 2025-10-31T23:40Z (window toSec 1761955199).
const EFF_TS = 1761954000, UPD_BT = 1761950000, FILL_SEC = 1761954600;
const FROM_SEC = 1751328000, TO_SEC = 1761955199;
const initTx = jsonTx("initSig", 10, 1000, [{ accts: [0, 1], data: initBytes(1) }]);
const updTx = jsonTx("updSig", 20, UPD_BT, [{ accts: [0, 1], data: updBytes(1.0039, EFF_TS) }]);
const FINAL_STATE_B64 = Buffer.from(stateBytes(AUTH_BYTES, 1, EFF_TS, 1.0039)).toString("base64");

test("bell_trajectory_producer_composition_from_file — runMain --rebase-produce -> file -> loadTrajectories -> buildSolanaSymbol -> gate -> collect (CA-11)", async () => {
  const outDir = mkdtempSync(join(tmpdir(), "bell-produce-"));
  // (1) CLI PRODUCER: runMain --rebase-produce enumerates the authority over TWO gTfA pages (init on p1, update on
  // p2 => proves pagination AND kills the page-count bug), decodes SPYx's 43/x, quorum-re-reads on op B, anchors C-3.
  const bodies: Record<string, unknown> = { initSig: initTx, updSig: updTx };
  const pcall = (() => {
    let page = 0;
    const c: JsonRpcCall = (_url, method, params) => {
      if (method === "getTransactionsForAddress") { page += 1; return Promise.resolve(page === 1 ? { data: [initTx], paginationToken: "p2" } : { data: [updTx], paginationToken: null }); }
      if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
      if (method === "getAccountInfo") return Promise.resolve({ context: { slot: 25 }, value: { data: [FINAL_STATE_B64, "base64"] } });
      throw new Error("unexpected " + method);
    };
    return c;
  })();
  const noDb: DatabentoGet = () => Promise.resolve([]);
  const noPoly: PolygonGet = () => Promise.resolve({ results: [] });
  await runMain(["--rebase-produce", "--authority", AUTHORITY, "--pools", "SPYx", "--max-calls", "50", "--max-pages", "5", "--min-interval", "0", "--out", outDir],
    { call: pcall, databentoGet: noDb, polygonGet: noPoly, env: RPC_ENV, nowMs: TO_SEC * 1000 });
  // the report proves the pager advanced by ONE per page (mutant: double-increment => 1 page => enumeration_capped => scan_complete false).
  const report = JSON.parse(readFileSync(join(outDir, "rebase-produce-report.json"), "utf8")) as { calls_by_method: Record<string, number>; per_mint: Record<string, { scan_complete: boolean; reason: string | null }> };
  assert.equal(report.calls_by_method.getTransactionsForAddress, 2, "the gTfA pager fetched exactly 2 pages (one increment per page)");
  assert.equal(report.per_mint.SPYx?.scan_complete, true, report.per_mint.SPYx?.reason ?? "SPYx scan complete");

  // (2) FILE -> loadTrajectories: the produced file is trusted (scanMethod === "authority", C-1).
  const trajectories = loadTrajectories(join(outDir, "rebase-trajectory.json"));
  assert.equal(trajectories.SPYx?.scanMethod, "authority", "the committed method maps to the closed scanMethod enum");
  assert.equal(trajectories.SPYx?.events.length, 2, "init + the in-window update");

  // (3) buildSolanaSymbol (the L-4 C-3 anchor fires): the base64 state matches the replayed trajectory => the gate
  // is trajectory_known and carries the two authority residuals. The fill (post-effTs) sees m=1.0039.
  const swapBody = { slot: 1, transaction: { message: { accountKeys: [{ pubkey: SPYX_POOL.vaultBase }, { pubkey: SPYX_POOL.vaultQuote }] } },
    meta: { err: null, preTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1000000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "5000000000" } }],
      postTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1100000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "4350000000" } }] } };
  const acall: JsonRpcCall = (_url, method, params) => {
    if (method === "getSignaturesForAddress") return Promise.resolve([{ signature: "f1", slot: 1, blockTime: FILL_SEC, err: null }]);
    if (method === "getTransaction") return Promise.resolve(swapBody);
    if (method === "getAccountInfo") {
      const enc = ((params as unknown[])[1] as { encoding?: string } | undefined)?.encoding;
      if (enc === "base64") return Promise.resolve({ context: { slot: 25 }, value: { data: [FINAL_STATE_B64, "base64"] } });
      return Promise.resolve({ context: { slot: 25 }, value: { data: { parsed: { info: { supply: "1", decimals: 8, extensions: [] } } } } });
    }
    throw new Error("unexpected " + method);
  };
  const faults: TransportFault[] = [];
  const sym = await buildSolanaSymbol(acall, PROVIDERS, SPYX, SPYX_POOL, { fromSec: FROM_SEC, toSec: TO_SEC }, FILL_SEC * 1000, "", { maxPages: 2, bodySample: 0 }, trajectories.SPYx, faults);
  assert.equal(sym.rebase?.status, "trajectory_known", "the anchored complete trajectory is trajectory_known");
  assert.equal(sym.fills.length, 1, "the pool fill was read");

  // (4) collect (sessionGapRebase): a rebase-aware g_t + multiplierUsed + rebase_residuals; the two codes are
  // counted in state.residuals PER published session (C-10). Close attached exactly as collect keys it.
  const cls = classifySession(FILL_SEC * 1000);
  const refDate = refCloseDateOf(cls.session, cls.sessionDateET);
  const symWithClose: SymbolInput = { ...sym, closeRefBySession: { [refDate]: 640 } };
  const r = collect({ symbols: [symWithClose], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const digest = r.digest as { gaps: Array<Record<string, unknown>>; residuals: Record<string, number> };
  const gap = digest.gaps.find((g) => "gT" in g);
  assert.ok(gap, "a trajectory_known g_t was produced through the whole composition");
  assert.equal(gap.multiplierUsed, "1.0039", "the in-window multiplier divides the base (rebase-aware)");
  assert.deepEqual(gap.rebase_residuals, ["authority_scan_mono_operator", "set_authority_unscanned"], "the gate residuals ride on the published gap (C-10)");
  assert.ok((digest.residuals.authority_scan_mono_operator ?? 0) >= 1, "authority_scan_mono_operator counted in state");
  assert.ok((digest.residuals.set_authority_unscanned ?? 0) >= 1, "set_authority_unscanned counted in state");
  // C-10 sonde: the produced state carries non-empty rebase_residuals and STILL passes the close-guard.
  assert.doesNotThrow(() => { assertNoClose(r.state); }, "rebase_residuals passes assertNoClose (hors CLOSE_KEY)");

  // (5) the CLI is fail-closed: --rebase-produce without --authority rejects (never a scan on a guessed authority).
  await assert.rejects(runMain(["--rebase-produce", "--pools", "SPYx", "--max-calls", "50", "--out", outDir], { call: pcall, databentoGet: noDb, polygonGet: noPoly, env: RPC_ENV, nowMs: TO_SEC * 1000 }),
    /--rebase-produce needs --authority/);
});

test("bell_trajectory_producer_scanmethod_map_and_loader — C-1 closed map + fail-closed loader", () => {
  // the committed map is closed: the series' method maps to "authority"; an unknown method has no scanMethod.
  assert.equal(scanMethodFromMethod(HYBRID_AUTHORITY_METHOD), "authority");
  assert.equal(scanMethodFromMethod("some-unratified-method"), undefined);
  // writeTrajectoryFile with an unmapped method throws (never a silent scanMethod-less file, C-1).
  const outDir = mkdtempSync(join(tmpdir(), "bell-produce-map-"));
  assert.throws(() => writeTrajectoryFile(join(outDir, "x.json"), "not-in-the-map", { SPYx: { events: [], scanComplete: true, readAuthorityHex: null } }),
    /not in the committed SCAN_METHOD_MAP/);
  // loadTrajectories DROPS an entry whose scanMethod is unknown (mutant: accept any string => this reds) OR absent
  // (mutant: producer omits scanMethod / writes `method` instead => this reds).
  const bogus = join(outDir, "bogus.json");
  const ev = { kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: "s" };
  writeFileSync(bogus, JSON.stringify({ SPYx: { events: [ev], scanComplete: true, scanMethod: "bogus" } }));
  assert.equal(Object.keys(loadTrajectories(bogus)).length, 0, "unknown scanMethod is dropped (C-1 fail-closed)");
  const noMethod = join(outDir, "nomethod.json");
  writeFileSync(noMethod, JSON.stringify({ SPYx: { events: [ev], scanComplete: true, method: HYBRID_AUTHORITY_METHOD } }));
  assert.equal(Object.keys(loadTrajectories(noMethod)).length, 0, "an unconverted `method` (no scanMethod) is dropped");
});

test("bell_trajectory_producer_pager_counts_pages — the gTfA pager advances ONE page per call (double-increment mutant reds)", async () => {
  // a THREE-page authority history: the pager must fetch all 3 (a double-increment would stop at 2 and cap).
  const p1 = jsonTx("s1", 10, 1000, [{ accts: [0, 1], data: initBytes(1) }]);
  const p2 = jsonTx("s2", 20, UPD_BT, [{ accts: [0, 1], data: updBytes(1.0039, EFF_TS) }]);
  const p3 = jsonTx("s3", 30, UPD_BT + 10, []); // a non-43/x tx (no event), still a page to traverse
  const pages = [{ data: [p1], paginationToken: "a" }, { data: [p2], paginationToken: "b" }, { data: [p3], paginationToken: null }];
  const bodies: Record<string, unknown> = { s1: p1, s2: p2, s3: p3 };
  let i = 0;
  const call: JsonRpcCall = (_u, method, params) => {
    if (method === "getTransactionsForAddress") return Promise.resolve(pages[i++] ?? { data: [], paginationToken: null });
    if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
    if (method === "getAccountInfo") return Promise.resolve({ context: { slot: 35 }, value: { data: [FINAL_STATE_B64, "base64"] } });
    throw new Error("unexpected " + method);
  };
  // maxPages is EXACTLY the page count (3): a single-increment pager fetches all 3 and completes; a double-increment
  // pager (the fixed bug) halves the bound => caps at page 2 => enumeration_capped => scanComplete false + only 2 gTfA.
  const { perMint, callsByMethod } = await produceTrajectories(call, PROVIDERS, ["SPYx"], AUTHORITY, { maxPages: 3 }, []);
  assert.equal(callsByMethod.getTransactionsForAddress, 3, "all three pages fetched at maxPages=3 (one increment per page)");
  assert.equal(perMint.SPYx?.scanComplete, true, perMint.SPYx?.reason ?? "complete over the full enumeration");
});
