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
import { tallyFoundingVault, dexForProgram, quoteClass, discoverFounding, SYSTEM_PROGRAM, leanFromDiscovery } from "../src/discover.ts";
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
    // field-by-field equality (MEASURED; incl. the C-G2-1 executable + authority_kind — deepEqual covers the new
    // fields for free). Mutant: fabricate a FOUNDING_POOLS entry (a changed address, or a wrong executable/
    // authority_kind) => != the measure => this reds (the registry cannot drift from the served measure).
    assert.deepEqual(entry.founding_pool, measure.founding_pool, `${entry.baseSymbol}: registry entry == discovery measure (incl. executable/authority_kind, C-G2-1)`);
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
  // C-G2-1: executable + authority_kind RECORDED (POOL_AUTH -> RAYDIUM non-System => program; RAYDIUM executable => true).
  assert.equal(fp.executable, true, "C-G2-1: executable recorded from the quorum-2 program read");
  assert.equal(fp.authority_kind, "program", "C-G2-1: authority_kind recorded (closed enum)");
  // C-G2-6: the run is AUTO-DESCRIPTIVE — discover-report.json publishes calls_by_method/operator, effective params, recomputed credits.
  const rep = JSON.parse(readFileSync(join(outDir, "discover-report.json"), "utf8")) as { calls_by_method: Record<string, number>; calls_by_operator: Record<string, number>; points: unknown[]; pages_per_point: number; threshold: number; window: { from_sec: number; to_sec: number }; credits_recomputed: number };
  const gtfa = rep.calls_by_method.getTransactionsForAddress ?? 0, gai = rep.calls_by_method.getAccountInfo ?? 0;
  assert.ok(gtfa >= 1 && gai >= 1, "C-G2-6: calls_by_method populated (gTfA + getAccountInfo)");
  assert.ok(Object.keys(rep.calls_by_operator).length >= 1, "C-G2-6: calls_by_operator populated");
  assert.deepEqual([rep.points.length, rep.pages_per_point, rep.threshold, rep.window.from_sec, rep.window.to_sec], [3, 1, 0.05, FROM_SEC, TO_SEC], "C-G2-6: effective params published");
  assert.equal(rep.credits_recomputed, gtfa * 10 + gai, "C-G2-6: credits recomputed (gTfA 10cr + rpc 1cr)");
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
  // C-G2-1: executable + authority_kind are RECORDED. Non-System owner-of-owner read but non-executable => (program, false).
  assert.equal(a.founding_pool?.executable, false, "C-G2-1: executable recorded (false here)");
  assert.equal(a.founding_pool?.authority_kind, "program", "C-G2-1: non-System owner-of-owner => authority_kind program");
  // (B) System-owned authority => authority_kind "system-owned-pda-or-wallet", dex unknown, vault RETAINED (never rejected on owner alone).
  const b = await discoverFounding(mk(SYSTEM_PROGRAM, false), PROVIDERS, SPYX, "SPYx", points, 1, 0.05, []);
  assert.ok(b.founding_pool, "a System-owned-authority vault is RETAINED on tally (erratum C-5, never rejected on owner alone)");
  assert.equal(b.founding_pool?.dex, "unknown-program", "System-owned => unknown-program (never a DEX label)");
  assert.equal(b.founding_pool?.programId, SYSTEM_PROGRAM);
  // C-G2-1 mutant killer ("authority_kind hardcoded program" / "field dropped" => this reds): System => the closed enum value.
  assert.equal(b.founding_pool?.authority_kind, "system-owned-pda-or-wallet", "C-G2-1: System-owned => authority_kind recorded");
  assert.equal(b.founding_pool?.executable, false, "C-G2-1: System-owned => executable false");
  // (C) owner-of-owner executable AND in the map => the dex; the four MEASURED pools are this (program, true).
  const c = await discoverFounding(mk(RAYDIUM, true), PROVIDERS, SPYX, "SPYx", points, 1, 0.05, []);
  assert.equal(c.founding_pool?.dex, "raydium-clmm", "owner-of-owner executable AND in the committed map => the dex");
  assert.equal(c.founding_pool?.executable, true, "C-G2-1: executable recorded (true — the 4 measured pools)");
  assert.equal(c.founding_pool?.authority_kind, "program", "C-G2-1: executable program => authority_kind program");
  // (D) C-G2-1: an UNREADABLE vault authority (quorum concords on owner:null) => authority_kind "unread" (never null, never program).
  const unreadCall: JsonRpcCall = (_url, method) => method === "getTransactionsForAddress" ? Promise.resolve({ data: [baseTx], paginationToken: null }) : Promise.resolve({ value: { owner: null, executable: false } });
  const dd = await discoverFounding(unreadCall, PROVIDERS, SPYX, "SPYx", points, 1, 0.05, []);
  assert.equal(dd.founding_pool?.authority_kind, "unread", "C-G2-1: quorum-unreadable authority => unread (fail-closed, never null)");
});

test("bell_discovery_lean_reducer_shape — C-G2-2: leanFromDiscovery(brut) -> committed lean form (count + measure_note + order)", () => {
  const brut = { symbol: "SPYx", discovery_enumeration: "helius-gtfa-mono-operator" as const, sampled_tx: 15000,
    vault_share_of_sample: { [BASE]: 0.4 }, window_total_tx: "unknown (>= floor)" as const, candidates_below_threshold: [USER, DECOY, OTHER_AUTH],
    founding_pool: { foundingPoolId: POOL_AUTH, vaultBase: BASE, vaultQuote: QUOTE, quoteMint: USDC_SOLANA, quoteDec: 6, programId: RAYDIUM, dex: "raydium-clmm", quote_class: "usd" as const, executable: true, authority_kind: "program" as const } };
  const lean = leanFromDiscovery(brut);
  assert.equal(lean.candidates_below_threshold_count, 3, "the ~3k-address candidates list becomes a COUNT");
  assert.ok(!("candidates_below_threshold" in lean), "the full address list is dropped from the lean (repo hygiene)");
  assert.ok(lean.measure_note.includes("FOUNDING_POOLS[SPYx]"), "measure_note templated with the symbol");
  assert.deepEqual(lean.founding_pool, brut.founding_pool, "founding_pool passes through untouched (incl. C-G2-1 fields)");
  // the COMMITTED key order (the lean was hand-reordered; the reducer emits founding_pool SECOND — the C-G2-2 bug).
  assert.deepEqual(Object.keys(lean), ["symbol", "founding_pool", "discovery_enumeration", "sampled_tx", "window_total_tx", "vault_share_of_sample", "candidates_below_threshold_count", "measure_note"]);
});

test("bell_discover_tally_dedups_by_signature — C-G2-8: a tx enumerated by two sampling points is counted once (deviation)", () => {
  const withSig = (sig: string): unknown => ({ transaction: { signatures: [sig], message: { accountKeys: [BASE, QUOTE] } },
    meta: { preTokenBalances: [{ accountIndex: 0, mint: SPYX, owner: POOL_AUTH, uiTokenAmount: { amount: "1000", decimals: 8 } }],
      postTokenBalances: [{ accountIndex: 0, mint: SPYX, owner: POOL_AUTH, uiTokenAmount: { amount: "1100", decimals: 8 } }] } });
  // same-signature bodies (a tx returned by points 2 AND 3) dedup to ONE distinct tx (mutant: drop dedup => sampledTx 2).
  assert.equal(tallyFoundingVault([withSig("SIGA"), withSig("SIGA")], SPYX, 0.05).sampledTx, 1, "same-signature bodies dedup (sampledTx = distinct count)");
  // distinct signatures are NOT collapsed; a body with no signature (synthetic tallies) stays distinct.
  assert.equal(tallyFoundingVault([withSig("SIGA"), withSig("SIGB")], SPYX, 0.05).sampledTx, 2, "distinct signatures are not collapsed");
});
