// MONARK Bell — L-1/L-2 founding-pool discovery + registry oracle (ADR-T1aii D1-sexies, lot -b1-bis-i; checkpoint-1
// C-2/C-4/C-5/C-6). NO network: the tally runs on hand-built gTfA `full` bodies (in-memory). Named mutants: quote
// paired by sign only (C-2) => wrong quote mint => red; threshold ignored / top-1 forced => a second pool missing =>
// red; dex from memory (C-5) => red; a quote off the USD list marked "usd" (C-6) => red; FOUNDING_POOLS != the
// discovery measure (C-4) => red.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tallyFoundingVault, dexForProgram, quoteClass, discoverFounding, SYSTEM_PROGRAM } from "../src/discover.ts";
import { runMain } from "../src/collect.ts";
import { type DatabentoGet, type PolygonGet } from "../src/close.ts";
import { type JsonRpcCall } from "../src/quorum.ts";
import { FOUNDING_POOLS, FOUNDING_DISCOVERY_THRESHOLD, USDC_SOLANA, DEX_BY_PROGRAM_ID, POOLS, type FoundingPoolRef } from "../src/pools.ts";

const SERIES = fileURLToPath(new URL("./fixtures/series/founding/", import.meta.url));
const PROVIDERS = ["https://mainnet.helius-rpc.com", "https://solana-mainnet.core.chainstack.com"];
const RAYDIUM = "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"; // committed in DEX_BY_PROGRAM_ID
const FROM_SEC = 1751328000, TO_SEC = 1761955199;
const SPYX = "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W"; // SPYx mint (base leg)
const WSOL = "So11111111111111111111111111111111111111112"; // a non-USD quote (WSOL) for the C-2 decoy
// synthetic accounts / owners (base58-shaped, NOT real; the tally is address-agnostic).
const BASE = "BASEvaULT1111111111111111111111111111111111", QUOTE = "QUOTEvaULT111111111111111111111111111111111";
const DECOY = "DECOYwsoL1111111111111111111111111111111111", POOL_AUTH = "POOLauth11111111111111111111111111111111111";
const OTHER_AUTH = "OTHERauth1111111111111111111111111111111111";
const BASE2 = "BASE2vaULT111111111111111111111111111111111", QUOTE2 = "QUOTE2vaULT11111111111111111111111111111111", POOL2_AUTH = "POOL2auth1111111111111111111111111111111111";
const USER = "USERata111111111111111111111111111111111111", USER_WALLET = "USERwallet111111111111111111111111111111111";

interface B { idx: number; mint: string; owner: string; pre: number; post: number; dec: number }
function tx(keys: string[], bals: B[]): unknown {
  const bal = (side: "pre" | "post") => bals.map((b) => ({ accountIndex: b.idx, mint: b.mint, owner: b.owner, uiTokenAmount: { amount: String(side === "pre" ? b.pre : b.post), decimals: b.dec } }));
  return { transaction: { message: { accountKeys: keys } }, meta: { preTokenBalances: bal("pre"), postTokenBalances: bal("post") } };
}
const KEYS = [BASE, QUOTE, DECOY, BASE2, QUOTE2, USER];
// DECOY is listed BEFORE QUOTE so a sign-only (owner-blind) pairing picks the DECOY (WSOL) — the owner filter must
// override that and pick QUOTE (USDC, same owner as BASE).
const baseTx = (withUser: boolean): unknown => tx(KEYS, [
  { idx: 0, mint: SPYX, owner: POOL_AUTH, pre: 1000, post: 1100, dec: 8 }, // BASE +100 (buy)
  { idx: 2, mint: WSOL, owner: OTHER_AUTH, pre: 50, post: 45, dec: 9 },    // DECOY -5 (opposite, DIFFERENT owner)
  { idx: 1, mint: USDC_SOLANA, owner: POOL_AUTH, pre: 5000, post: 4350, dec: 6 }, // QUOTE -650 (opposite, SAME owner)
  ...(withUser ? [{ idx: 5, mint: SPYX, owner: USER_WALLET, pre: 3, post: 4, dec: 8 }] : []),
]);
const base2Tx = (): unknown => tx(KEYS, [
  { idx: 3, mint: SPYX, owner: POOL2_AUTH, pre: 2000, post: 2100, dec: 8 },
  { idx: 4, mint: USDC_SOLANA, owner: POOL2_AUTH, pre: 8000, post: 7350, dec: 6 },
]);
// 10 sampled txs: BASE in 6 (share 0.6), BASE2 in 4 (0.4), USER in 1 (0.1). Threshold 0.3 => BASE & BASE2 retained,
// USER below (a user ATA appears in few txs — the threshold separates it from a vault).
const BODIES = [baseTx(true), baseTx(false), baseTx(false), baseTx(false), baseTx(false), baseTx(false), base2Tx(), base2Tx(), base2Tx(), base2Tx()];

test("bell_discover_founding_vault_from_tally — tally -> vaults>=threshold + quote paired by owner + share of sample (C-2/C-3)", () => {
  const d = tallyFoundingVault(BODIES, SPYX, 0.3);
  assert.equal(d.sampledTx, 10);
  // BOTH pools retained (mutant: top-1 forced => BASE2 missing => reds). BASE dominant (0.6), BASE2 (0.4).
  assert.deepEqual(d.foundingVaults, [BASE, BASE2], "all vaults >= threshold retained, tally desc (never top-1)");
  assert.equal(d.vaultShareOfSample[BASE], 0.6);
  assert.equal(d.vaultShareOfSample[BASE2], 0.4);
  // the USER ATA (share 0.1 < 0.3) is a candidate, NOT a founding vault (published, never dropped).
  assert.deepEqual(d.candidatesBelowThreshold, [USER], "a below-threshold account is a published candidate");
  // C-2: the quote vault is paired by OWNER — QUOTE (USDC, same owner as BASE), NOT the DECOY (WSOL, opposite delta
  // but different owner). A sign-only mutant would pick the DECOY => quoteMint WSOL => this reds.
  assert.ok(d.quote, "a quote vault was paired");
  assert.equal(d.quote?.vaultQuote, QUOTE, "quote paired by owner, not by sign");
  assert.equal(d.quote?.quoteMint, USDC_SOLANA, "the quote mint is USDC (the same-owner leg), not the WSOL decoy");
  assert.equal(d.quote?.quoteDec, 6);
  assert.equal(d.quote?.baseOwner, POOL_AUTH);
});

test("bell_discover_dex_and_quote_class_from_committed_maps — C-5/C-6: labels from committed constants, never memory", () => {
  // C-5: the dex is read from the committed programId map; an id off the map is unknown-program (mutant: hardcode a
  // dex => the unknown-program assertion reds).
  assert.equal(dexForProgram("CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"), "raydium-clmm");
  assert.equal(dexForProgram("SomeUnknownProgramId1111111111111111111111"), "unknown-program");
  assert.equal(dexForProgram(null), "unknown-program");
  assert.ok(Object.prototype.hasOwnProperty.call(DEX_BY_PROGRAM_ID, "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"), "the map is the single committed source");
  // C-6: quote_class "usd" ONLY for a committed USD-stable mint; any other mint is "non-usd" (mutant: mark WSOL
  // "usd" => reds).
  assert.equal(quoteClass(USDC_SOLANA), "usd");
  assert.equal(quoteClass(WSOL), "non-usd");
  assert.equal(quoteClass(null), "non-usd");
});

test("bell_founding_registry_equals_discovery_measure — C-4: FOUNDING_POOLS == series/founding/discovery-<MINT>.json", () => {
  // the pre-registered threshold is the PLI value (drift-proofing: the registry consumer and the PLI agree).
  assert.equal(FOUNDING_DISCOVERY_THRESHOLD, 0.05, "the retention threshold is the PLI-pinned 0.05");
  for (const entry of FOUNDING_POOLS) {
    const measure = JSON.parse(readFileSync(SERIES + "discovery-" + entry.baseSymbol + ".json", "utf8")) as { symbol: string; founding_pool: unknown };
    assert.equal(measure.symbol, entry.baseSymbol, `${entry.baseSymbol}: discovery symbol matches`);
    // field-by-field equality (here both null, MEASURE-GATED pending the network run). Mutant: fabricate a
    // FOUNDING_POOLS entry (null -> a non-null pool) => != the measure => this reds (the registry cannot drift from
    // the measure). The real run flips both to the measured vaults and this test proves registry == measure.
    assert.deepEqual(entry.founding_pool, measure.founding_pool, `${entry.baseSymbol}: registry entry == discovery measure`);
  }
});

test("bell_founding_registry_shape_and_distinct — founding_pool != pairAddress census; quote_class closed (C-4/C-6)", () => {
  const census = new Set(POOLS.filter((p) => p.chain === "solana").map((p) => p.poolId));
  for (const entry of FOUNDING_POOLS) {
    assert.ok(["TSLA", "SPY", "NVDA", "AAPL"].includes(entry.underlying), `${entry.baseSymbol}: known underlying`);
    const fp = entry.founding_pool;
    if (fp !== null) {
      assert.ok(!census.has(fp.foundingPoolId), `${entry.baseSymbol}: founding_pool distinct from the census pairAddress`);
      assert.ok(fp.vaultBase.length > 0 && fp.vaultQuote.length > 0, `${entry.baseSymbol}: both vaults present`);
      assert.ok(fp.programId.length > 0, `${entry.baseSymbol}: programId present (or unknown-program declared)`);
      assert.ok(fp.quote_class === "usd" || fp.quote_class === "non-usd", `${entry.baseSymbol}: quote_class in the closed set`);
    }
  }
});

test("bell_discover_cli_writes_measure_from_runMain — runMain --discover -> discovery-<MINT>.json (CA-11, C-5 confirm)", async () => {
  const outDir = mkdtempSync(join(tmpdir(), "bell-discover-"));
  // one founding tx: BASE (SPYx, POOL_AUTH) +100, QUOTE (USDC, POOL_AUTH) -650 => quote paired by owner.
  const baseTx = tx([BASE, QUOTE], [
    { idx: 0, mint: SPYX, owner: POOL_AUTH, pre: 1000, post: 1100, dec: 8 },
    { idx: 1, mint: USDC_SOLANA, owner: POOL_AUTH, pre: 5000, post: 4350, dec: 6 },
  ]);
  const gtfaOrders: string[] = [];
  const call: JsonRpcCall = (_url, method, params) => {
    if (method === "getTransactionsForAddress") { gtfaOrders.push((((params as unknown[])[1]) as { sortOrder: string }).sortOrder); return Promise.resolve({ data: [baseTx], paginationToken: null }); }
    if (method === "getAccountInfo") {
      const addr = (params as unknown[])[0] as string;
      if (addr === POOL_AUTH) return Promise.resolve({ value: { owner: RAYDIUM, executable: false } }); // vault authority -> owned by the Raydium program
      if (addr === RAYDIUM) return Promise.resolve({ value: { owner: "BPFLoaderUpgradeab1e11111111111111111111111", executable: true } }); // the program IS executable
      return Promise.resolve({ value: { owner: null, executable: false } });
    }
    throw new Error("unexpected " + method);
  };
  const noDb: DatabentoGet = () => Promise.resolve([]);
  const noPoly: PolygonGet = () => Promise.resolve({ results: [] });
  const env = { BELL_SOLANA_RPC: PROVIDERS.join(",") } as NodeJS.ProcessEnv;
  await runMain(["--discover", "--pools", "SPYx", "--max-calls", "50", "--max-pages", "1", "--min-interval", "0", "--from-utc", String(FROM_SEC * 1000), "--to-utc", String(TO_SEC * 1000), "--out", outDir],
    { call, databentoGet: noDb, polygonGet: noPoly, env, nowMs: TO_SEC * 1000 });
  // #2 drift-proof: the 3 sampling points carry orders [asc, asc, desc] — the "desc from toSec" point IS expressed.
  assert.deepEqual(gtfaOrders, ["asc", "asc", "desc"], "3 points sampled, the third desc (PLI)");
  // the produced discovery file carries the founding_pool as a FoundingPoolRef (the EXACT shape FOUNDING_POOLS equals, C-4).
  const d = JSON.parse(readFileSync(join(outDir, "discovery-SPYx.json"), "utf8")) as { symbol: string; founding_pool: FoundingPoolRef | null; discovery_enumeration: string; sampled_tx: number; window_total_tx: string };
  assert.equal(d.symbol, "SPYx");
  assert.equal(d.discovery_enumeration, "helius-gtfa-mono-operator");
  assert.equal(d.window_total_tx, "unknown (>= floor)", "never a window coverage (C-3)");
  assert.ok(d.founding_pool, "a founding pool measured");
  const fp: FoundingPoolRef = d.founding_pool;
  assert.equal(fp.vaultBase, BASE);
  assert.equal(fp.vaultQuote, QUOTE, "quote paired by owner");
  assert.equal(fp.quoteMint, USDC_SOLANA);
  assert.equal(fp.quoteDec, 6);
  assert.equal(fp.quote_class, "usd", "USDC => usd (C-6)");
  // C-5: the dex + programId come from the quorum-2 owner-of-owner read, mapped by the committed constant.
  assert.equal(fp.programId, RAYDIUM, "programId = owner-of-owner read on-chain");
  assert.equal(fp.dex, "raydium-clmm", "dex from the committed programId map (never memory)");
  assert.equal(fp.foundingPoolId, POOL_AUTH, "founding pool id = the vault authority (distinct from the census pairAddress)");
});

test("bell_discover_confirm_vault_executable_and_system_owned — C-5 erratum: executable AND in map => dex; System-owned RETAINED", async () => {
  const baseTx = tx([BASE, QUOTE], [
    { idx: 0, mint: SPYX, owner: POOL_AUTH, pre: 1000, post: 1100, dec: 8 },
    { idx: 1, mint: USDC_SOLANA, owner: POOL_AUTH, pre: 5000, post: 4350, dec: 6 },
  ]);
  const points = [{ from: FROM_SEC, to: TO_SEC, order: "asc" as const }];
  // POOL_AUTH's owner (owner-of-owner) = `authorityOwner`; that program's own account reports `progExecutable`.
  const mk = (authorityOwner: string, progExecutable: boolean): JsonRpcCall => (_url, method, params) => {
    if (method === "getTransactionsForAddress") return Promise.resolve({ data: [baseTx], paginationToken: null });
    if (method === "getAccountInfo") {
      const addr = (params as unknown[])[0] as string;
      if (addr === POOL_AUTH) return Promise.resolve({ value: { owner: authorityOwner, executable: false } });
      return Promise.resolve({ value: { owner: "BPFLoaderUpgradeab1e11111111111111111111111", executable: progExecutable } });
    }
    throw new Error("unexpected " + method);
  };
  // (A) owner-of-owner IS in the map but NOT executable => unknown-program (mutant "assume executable" => reds).
  const a = await discoverFounding(mk(RAYDIUM, false), PROVIDERS, SPYX, "SPYx", points, 1, 0.05, []);
  assert.equal(a.founding_pool?.dex, "unknown-program", "owner-of-owner not executable => unknown-program (the executable check is load-bearing)");
  assert.equal(a.founding_pool?.programId, RAYDIUM, "the owner-of-owner id is still recorded");
  // (B) System-owned authority => authority_kind declared, dex unknown, but the vault is RETAINED (never rejected on owner alone).
  const b = await discoverFounding(mk(SYSTEM_PROGRAM, false), PROVIDERS, SPYX, "SPYx", points, 1, 0.05, []);
  assert.ok(b.founding_pool, "a System-owned-authority vault is RETAINED on tally (erratum C-5, never rejected on owner alone)");
  assert.equal(b.founding_pool?.dex, "unknown-program", "System-owned => unknown-program (never a DEX label)");
  assert.equal(b.founding_pool?.programId, SYSTEM_PROGRAM);
  // (C) owner-of-owner executable AND in the map => the dex.
  const c = await discoverFounding(mk(RAYDIUM, true), PROVIDERS, SPYX, "SPYx", points, 1, 0.05, []);
  assert.equal(c.founding_pool?.dex, "raydium-clmm", "owner-of-owner executable AND in the committed map => the dex");
});
