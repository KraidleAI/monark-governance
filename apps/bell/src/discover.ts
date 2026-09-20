// MONARK Bell — L-1 founding-pool discovery (2025 pools, ADR-T1aii D1-sexies, lot -b1-bis-i; checkpoint-1
// C-2/C-3/C-5/C-6). Pure core + injected `call` (offline-testable). The census `pairAddress` pools are 2026 CLMM
// (spike-findings.json); the 2025 founding trading happened on OTHER (now-drained) pools, discoverable on-chain:
// sample the MINT's gTfA `full` history at THREE points (asc/median/desc, C-3), TALLY the accounts holding the mint
// in each tx's token balances, RETAIN every vault whose share of the sample >= a pre-registered threshold (never
// top-1 — AMM v4 + CLMM + Orca possible), pair the QUOTE vault by OWNER (C-2), and label the dex from a committed
// programId map (C-5) and the quote_class from a committed USD-stable list (C-6). --discover writes the measure.
//
// HONEST METRICS (C-3): the window total is UNKNOWN (capped); the published figures are `sampled_tx` and
// `vault_share_of_sample` — NEVER a "window coverage". A pool active only OUTSIDE the sampled points is not seen
// (declared limitation). The gTfA `full` body shape is a real-run verification item (PLI, PR-B-GTFA-SHAPE): an
// unparsed body yields no tally => the mint's discovery is null (fail-closed), never a guessed pool.
//
// KEY HYGIENE (C-10): providerOf/operatorOf only; base58 accounts are PUBLIC (not secrets). Raws out of the tree.
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { DEX_BY_PROGRAM_ID, USD_STABLE_MINTS, FOUNDING_DISCOVERY_THRESHOLD, XSTOCKS, type FoundingPoolRef } from "./pools.ts";
import { quorum2, NoQuorumError, QuorumDisagreementError, ConcordantRevertError, BudgetExceededError, type JsonRpcCall, type TransportFault } from "./quorum.ts";
import { operatorOf } from "./operators.ts";

const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
const asArr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

/** The Solana System Program (owns plain wallets / system PDAs). A vault authority owned by it is a
 *  `system-owned-pda-or-wallet` (erratum C-5: DECLARED, retained on tally dominance, never rejected on owner alone). */
export const SYSTEM_PROGRAM = "11111111111111111111111111111111";

/** C-5: the dex for a programId READ on-chain (owner-of-owner), from the committed map; an id off the map is
 *  `unknown-program` with the id preserved — NEVER a dex from memory (a mutant hardcoding a dex reds the C-5 test). */
export function dexForProgram(programId: string | null): string {
  return programId !== null && Object.prototype.hasOwnProperty.call(DEX_BY_PROGRAM_ID, programId) ? DEX_BY_PROGRAM_ID[programId]! : "unknown-program";
}
/** C-6: the quote_class of a quote mint — "usd" ONLY if it is on the committed CLOSED USD-stable list, else
 *  "non-usd" (excluded from the -ii course, ADR-B0 D6). A mutant marking an off-list mint "usd" reds the C-6 test. */
export function quoteClass(quoteMint: string | null): "usd" | "non-usd" {
  return quoteMint !== null && USD_STABLE_MINTS.includes(quoteMint) ? "usd" : "non-usd";
}

interface Bal { readonly account: string; readonly mint: string; readonly owner: string | null; readonly amount: bigint; readonly decimals: number }
/** The full ordered account keys of a (v0/jsonParsed) tx: static ++ loaded writable ++ readonly. */
function keysOf(body: unknown): string[] {
  const msg = asObj(asObj(asObj(body).transaction).message);
  const stat = asArr(msg.accountKeys).map((k) => (typeof k === "string" ? k : String(asObj(k).pubkey)));
  const loaded = asObj(asObj(asObj(body).meta).loadedAddresses);
  return [...stat, ...asArr(loaded.writable).map(String), ...asArr(loaded.readonly).map(String)];
}
/** The pre/post token balances of a tx as {account, mint, owner, amount, decimals} (jsonParsed / gTfA full shape). */
function tokenBalances(body: unknown): { pre: Bal[]; post: Bal[] } {
  const keys = keysOf(body);
  const read = (side: string): Bal[] => asArr(asObj(asObj(body).meta)[side]).map((b) => {
    const o = asObj(b); const ui = asObj(o.uiTokenAmount);
    return { account: keys[Number(o.accountIndex)] ?? "", mint: typeof o.mint === "string" ? o.mint : "", owner: typeof o.owner === "string" ? o.owner : null,
      amount: BigInt(typeof ui.amount === "string" ? ui.amount : "0"), decimals: typeof ui.decimals === "number" ? ui.decimals : 0 };
  });
  return { pre: read("preTokenBalances"), post: read("postTokenBalances") };
}

export interface FoundingDiscovery {
  readonly foundingVaults: string[];               // accounts holding the mint with share >= threshold (tally desc)
  readonly vaultShareOfSample: Record<string, number>; // published share per retained vault (never a window coverage)
  readonly candidatesBelowThreshold: string[];     // present but < threshold (published, never dropped silently)
  readonly quote: { readonly vaultQuote: string; readonly quoteMint: string; readonly quoteDec: number; readonly baseOwner: string } | null;
  readonly sampledTx: number;
}

/** PURE core (C-2/C-3): tally the mint-holding accounts across the sampled bodies, retain vaults >= threshold, and
 *  pair the quote vault by OWNER (a Jupiter multi-hop puts several opposite-delta accounts in one tx; only the pool
 *  authority's own quote reserve shares the base vault's owner). Offline-testable — the network sampler feeds it. */
export function tallyFoundingVault(bodies: readonly unknown[], mint: string, threshold: number): FoundingDiscovery {
  const sampledTx = bodies.length;
  const tally = new Map<string, number>();
  for (const body of bodies) {
    const { pre, post } = tokenBalances(body);
    const seen = new Set<string>();
    for (const b of [...pre, ...post]) if (b.mint === mint && b.account && !seen.has(b.account)) { seen.add(b.account); tally.set(b.account, (tally.get(b.account) ?? 0) + 1); }
  }
  const share = (n: number): number => (sampledTx > 0 ? n / sampledTx : 0);
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const foundingVaults = ranked.filter(([, n]) => share(n) >= threshold).map(([a]) => a);
  const candidatesBelowThreshold = ranked.filter(([, n]) => share(n) > 0 && share(n) < threshold).map(([a]) => a);
  const vaultShareOfSample: Record<string, number> = {};
  for (const a of foundingVaults) vaultShareOfSample[a] = share(tally.get(a) ?? 0);
  const base = foundingVaults[0] ?? null;
  let quote: FoundingDiscovery["quote"] = null;
  if (base !== null) {
    for (const body of bodies) {
      const { pre, post } = tokenBalances(body);
      const find = (side: Bal[], acct: string): Bal | undefined => side.find((x) => x.account === acct);
      const bPost = find(post, base);
      if (!bPost || bPost.mint !== mint) continue;
      const baseDelta = bPost.amount - (find(pre, base)?.amount ?? 0n);
      if (baseDelta === 0n || bPost.owner === null) continue;
      for (const acct of new Set([...pre, ...post].map((x) => x.account))) {
        if (acct === base) continue;
        const qPost = find(post, acct);
        if (!qPost || qPost.mint === mint) continue; // the quote holds a DIFFERENT mint
        const qDelta = qPost.amount - (find(pre, acct)?.amount ?? 0n);
        const opposite = (baseDelta > 0n && qDelta < 0n) || (baseDelta < 0n && qDelta > 0n);
        if (opposite && qPost.owner === bPost.owner) { quote = { vaultQuote: acct, quoteMint: qPost.mint, quoteDec: qPost.decimals, baseOwner: bPost.owner }; break; }
      }
      if (quote) break;
    }
  }
  return { foundingVaults, vaultShareOfSample, candidatesBelowThreshold, quote, sampledTx };
}

export interface SamplePoint { readonly from: number; readonly to: number; readonly order: "asc" | "desc" }
/** Network sampler (offline-testable via injected `call`): fetch the mint's gTfA `full` history at each sampling
 *  point (asc from fromSec, from the median, desc to toSec — the `order` is PER point, C-3), up to N pages. The
 *  enumeration is MONO-OPERATOR Helius (declared). The exact gTfA `full` body shape is a real-run item (PR-B-GTFA-SHAPE). */
export async function sampleFoundingBodies(call: JsonRpcCall, url: string, mint: string,
  points: readonly SamplePoint[], pagesPerPoint: number): Promise<unknown[]> {
  const bodies: unknown[] = [];
  for (const pt of points) {
    let paginationToken: string | undefined;
    for (let page = 0; page < pagesPerPoint; page++) {
      const params: readonly unknown[] = [mint, { transactionDetails: "full", sortOrder: pt.order, limit: 1000, ...(paginationToken ? { paginationToken } : {}), filters: { blockTime: { gte: pt.from, lte: pt.to } } }];
      const res = asObj(await call(url, "getTransactionsForAddress", params));
      const data = asArr(res.data);
      for (const d of data) bodies.push(d);
      const next = res.paginationToken;
      if (typeof next !== "string" || next === "" || data.length === 0) break;
      paginationToken = next;
    }
  }
  return bodies;
}

/** C-5 (erratum): read an account's parsed owner + executable under quorum-2 (jsonParsed). Null on quorum failure
 *  (fail-closed). Budget re-thrown (C-11). */
async function readAccount(call: JsonRpcCall, providers: readonly string[], addr: string, faults: TransportFault[]): Promise<{ owner: string | null; executable: boolean } | null> {
  try {
    return await quorum2(`acct:${addr.slice(0, 8)}`, providers, call,
      async (c, u) => { const v = asObj(asObj(await c(u, "getAccountInfo", [addr, { encoding: "jsonParsed" }])).value); return { owner: typeof v.owner === "string" ? v.owner : null, executable: v.executable === true }; },
      (x) => `${x.owner ?? ""}|${String(x.executable)}`, faults);
  } catch (e) {
    if (e instanceof BudgetExceededError) throw e;
    if (e instanceof NoQuorumError || e instanceof QuorumDisagreementError || e instanceof ConcordantRevertError) return null;
    throw e;
  }
}

export interface VaultConfirmation { readonly ownerOfOwner: string | null; readonly executable: boolean; readonly dex: string; readonly authorityKind: string | null; readonly programId: string | null }
/** C-5 (erratum, quorum-2, fail-closed): read the vault-authority's owner (owner-of-owner = the pool's program) and
 *  its executable flag. Owner-of-owner executable AND in the committed map => the dex; executable off the map =>
 *  unknown-program; System-owned => `system-owned-pda-or-wallet` DECLARED (retained on tally, NEVER rejected). */
export async function confirmVault(call: JsonRpcCall, providers: readonly string[], vaultAuthority: string, faults: TransportFault[]): Promise<VaultConfirmation> {
  const auth = await readAccount(call, providers, vaultAuthority, faults);
  if (auth === null || auth.owner === null) return { ownerOfOwner: null, executable: false, dex: "unknown-program", authorityKind: null, programId: null };
  const ownerOfOwner = auth.owner;
  if (ownerOfOwner === SYSTEM_PROGRAM) return { ownerOfOwner, executable: false, dex: "unknown-program", authorityKind: "system-owned-pda-or-wallet", programId: ownerOfOwner };
  const prog = await readAccount(call, providers, ownerOfOwner, faults);
  const executable = prog?.executable === true;
  return { ownerOfOwner, executable, dex: executable ? dexForProgram(ownerOfOwner) : "unknown-program", authorityKind: null, programId: ownerOfOwner };
}

export interface DiscoveryFile {
  readonly symbol: string;
  readonly founding_pool: FoundingPoolRef | null;
  readonly discovery_enumeration: "helius-gtfa-mono-operator";
  readonly sampled_tx: number;
  readonly vault_share_of_sample: Record<string, number>;
  readonly window_total_tx: "unknown (>= floor)";
  readonly candidates_below_threshold: string[];
}
/** Assemble ONE mint's discovery measure: sample -> tally -> owner-paired quote -> quorum-2 vault confirmation ->
 *  the FoundingPoolRef (or `founding_pool: null` when no vault >= threshold OR no quote could be paired). The gTfA
 *  enumeration runs on HELIUS (mono-operator, exclusive); the vault confirmation uses the full quorum. */
export async function discoverFounding(call: JsonRpcCall, providers: readonly string[], mint: string, symbol: string,
  points: readonly SamplePoint[], pagesPerPoint: number, threshold: number, faults: TransportFault[]): Promise<DiscoveryFile> {
  const heliusOp = providers.find((u) => operatorOf(u) === "helius") ?? providers[0] ?? ""; // gTfA is Helius-exclusive
  const bodies = await sampleFoundingBodies(call, heliusOp, mint, points, pagesPerPoint);
  const t = tallyFoundingVault(bodies, mint, threshold);
  const shell = { symbol, discovery_enumeration: "helius-gtfa-mono-operator" as const, sampled_tx: t.sampledTx,
    vault_share_of_sample: t.vaultShareOfSample, window_total_tx: "unknown (>= floor)" as const, candidates_below_threshold: t.candidatesBelowThreshold };
  const vault = t.foundingVaults[0];
  if (vault === undefined || t.quote === null) return { ...shell, founding_pool: null };
  const conf = await confirmVault(call, providers, t.quote.baseOwner, faults);
  const founding_pool: FoundingPoolRef = { foundingPoolId: t.quote.baseOwner, vaultBase: vault, vaultQuote: t.quote.vaultQuote,
    quoteMint: t.quote.quoteMint, quoteDec: t.quote.quoteDec, programId: conf.programId ?? "unknown-program", dex: conf.dex, quote_class: quoteClass(t.quote.quoteMint) };
  return { ...shell, founding_pool };
}

const sha = (s: string): string => createHash("sha256").update(s).digest("hex");
/** L-1 --discover CLI (invoked by collect main()). Computes the 3 sampling points from the founding window, discovers
 *  each wanted mint, and writes `discovery-<MINT>.json` OUT of the tree (the served input the registry equals, C-4).
 *  Domains/counts only, never a url/key. Budget/errors propagate to main() (fatalMessage). */
export async function runDiscoverCli(call: JsonRpcCall, providers: readonly string[], wanted: readonly string[],
  window: { fromSec: number; toSec: number }, out: string, opts: { readonly pagesPerPoint?: number }, callsUsed: () => number, maxCalls: number, faults: TransportFault[]): Promise<void> {
  mkdirSync(out, { recursive: true });
  const mid = Math.floor((window.fromSec + window.toSec) / 2);
  const points: SamplePoint[] = [
    { from: window.fromSec, to: window.toSec, order: "asc" },   // earliest N pages
    { from: mid, to: window.toSec, order: "asc" },              // from the median
    { from: window.fromSec, to: window.toSec, order: "desc" },  // latest N pages
  ];
  const summary: Record<string, unknown> = {};
  for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) {
    const d = await discoverFounding(call, providers, tok.address, tok.symbol, points, opts.pagesPerPoint ?? 5, FOUNDING_DISCOVERY_THRESHOLD, faults);
    const body = JSON.stringify(d, null, 2);
    writeFileSync(resolve(out, `discovery-${tok.symbol}.json`), body);
    summary[tok.symbol] = { founding: d.founding_pool !== null, sampled_tx: d.sampled_tx, sha: sha(body) };
  }
  process.stdout.write(`bell/discover mints=${String(Object.keys(summary).length)} calls=${String(callsUsed())}/${String(maxCalls)} out=${out}\n`);
}
