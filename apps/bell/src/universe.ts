// MONARK Bell — T-1a-iii-a1: enumerate the xStocks Solana universe (issuer identity + on-chain identity +
// ScaledUiAmount) FIRST-HAND, ZERO Helius. Pure core + call-path guards. NO network in this module: the
// low-level http/rpc call is INJECTED (calque of rpc.ts / collect.ts), so CI runs offline on synthetic
// fixtures and the SAME path runs live. This is -iii-a1 ONLY: NO liquidity, NO ranking (that is -iii-a2).
//
// SCOPE (G0 T-1a-iii §2 (i)/(iii), checkpoint-1 B-2/B-8/B-11, CONF-SRC-4): enumerate api.xstocks.fi
// /public/assets to EXHAUSTION, client-filter deployments[].network=="Solana" (NB-2: server filters are
// unreliable), and confirm each Solana mint on-chain under quorum-2 (api.mainnet.solana.com + Chainstack,
// CONF-SRC-4 operator plan A): owner==Token-2022 + decimals, and read the ScaledUiAmount extension + its
// authority. Aggregator-only identity => identity_unconfirmed; quorum disagreement => unverified (never
// decided); a quorum miss => scaled_ui_unread fail-closed (Q8).
//
// ANTI-CLOSE by FIELD ALLOWLIST (B-11), never by strip: a committable record carries ONLY on-chain
// identity + issuer identity (name/mic/network) — NO price/value/volume field and NO price-derivable pair.
// The mechanism is EXPLICIT PICK + assertOnlyAllowedFields; assertNoClose (digest.ts, D5) stays as a belt.
//
// SECRET (C-10): the Chainstack node URL carries a hex key in its path — never a literal here, never
// logged. The third allowlist host is admitted ONLY by operatorOf==="chainstack" (committed map), so an
// env pointing elsewhere is refused (an env is not an allowlist bypass). scrubSecret() cleans any string.
import { createHash } from "node:crypto";
import { XSTOCKS, TOKEN_2022_PROGRAM } from "./pools.ts";
import { readMintToken2022 } from "./supply.ts";
import {
  quorum2, BudgetExceededError, NoQuorumError, QuorumDisagreementError,
  type JsonRpcCall, type TransportFault,
} from "./quorum.ts";
import { operatorOf } from "./operators.ts";
import { assertNoClose, canonical } from "./digest.ts";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
const asArr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const str = (x: unknown): string => (typeof x === "string" ? x : "");

// ---- Host + method allowlists (fed ONLY by the PLI / CONF-SRC-4) -----------------------------------
export const ISSUER_HOST = "api.xstocks.fi";
export const SOLANA_PUBLIC_HOST = "api.mainnet.solana.com";
export const SOLANA_PUBLIC_URL = "https://api.mainnet.solana.com";
export const CHAINSTACK_OPERATOR = "chainstack"; // the 3rd host is admitted by operator, not by raw env
/** api.mainnet-beta.solana.com, publicnode and GeckoTerminal are NOT on this list (CONF-SRC-4/5). */
export function hostOf(url: string): string { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } }
/** Refuse (throw) BEFORE any send if the URL host is off the allowlist. Two literal public hosts; the
 *  third only when operatorOf(url)===chainstack (so CHAINSTACK_SOLANA_URL=https://evil/x is refused). No
 *  url in the message (C-10). */
export function assertHostAllowed(url: string): void {
  const h = hostOf(url);
  if (h === ISSUER_HOST || h === SOLANA_PUBLIC_HOST) return;
  if (operatorOf(url) === CHAINSTACK_OPERATOR) return;
  throw new Error("bell/universe: request host is not on the PLI allowlist (refused before send)");
}
export const RPC_METHODS_ALLOWED: readonly string[] = ["getAccountInfo"]; // -iii-a1: this method only
/** Refuse (throw BudgetExceededError, re-thrown by quorum2 => exit 1) BEFORE send on any other method. */
export function assertMethodAllowed(method: string): void {
  if (!RPC_METHODS_ALLOWED.includes(method)) {
    throw new BudgetExceededError(`bell/universe: RPC method '${method}' is off the allowlist (only getAccountInfo in -iii-a1)`);
  }
}
/** Wrap a JsonRpcCall with the method + host allowlists, BOTH before the send (and before any budget tick,
 *  so an illegal call never consumes budget). */
export function guardedRpcCall(inner: JsonRpcCall): JsonRpcCall {
  return (url, method, params) => { assertMethodAllowed(method); assertHostAllowed(url); return inner(url, method, params); };
}

// ---- Secret scrub (C-10): URL never printed nor written -------------------------------------------
/** Remove secret URLs (Chainstack node, hex key in path) from any string BEFORE logging/writing. Tested
 *  by PATTERN (the secret substring is gone) and controlled by LENGTH (output is no longer than input). */
export function scrubSecret(s: string, ...secrets: readonly (string | undefined)[]): string {
  let out = s;
  for (const sec of secrets) if (sec && sec.length > 0) out = out.split(sec).join("<redacted>");
  return out
    .replace(/https?:\/\/[^\s"']*chainstack[^\s"']*/gi, "<redacted>")
    .replace(/https?:\/\/[^\s"']*p2pify[^\s"']*/gi, "<redacted>");
}

// ---- Transport error typing + retry policy (Retry-After honored, HARD STOP on 403) ----------------
/** A non-2xx HTTP status with the parsed Retry-After (ms) when present. Message is scrubbed ("HTTP <n>"),
 *  so statusOf() (quorum.ts) reads it and no url leaks (C-10). */
export class HttpStatusError extends Error {
  readonly status: number; readonly retryAfterMs: number | null;
  constructor(status: number, retryAfterMs: number | null) {
    super(`HTTP ${String(status)}`); this.name = "HttpStatusError"; this.status = status; this.retryAfterMs = retryAfterMs;
  }
}
/** 403 hard stop (mission: stricter than fiche 05 backoff). Subclasses BudgetExceededError so quorum2
 *  re-throws it immediately (never benched as a coverage fault) and the run stops fail-closed (exit 1). */
export class Fatal403Error extends BudgetExceededError {}
/** Parse a Retry-After header (delta-seconds or HTTP-date) to ms, bounded by capMs. Pure. */
export function retryAfterMs(header: string | null | undefined, nowMs: number, capMs = 60_000): number | null {
  if (header == null) return null;
  const s = header.trim();
  if (/^\d+$/.test(s)) return Math.min(Number(s) * 1000, capMs);
  const d = Date.parse(s);
  if (!Number.isNaN(d)) return Math.min(Math.max(0, d - nowMs), capMs);
  return null;
}
/** Retry one call: honor Retry-After on 429, deterministic backoff on 5xx/timeout, HARD STOP on 403, and
 *  re-throw budget errors immediately. Injectable sleep/now so offline tests never actually wait. */
export async function withUniverseRetry<T>(
  fn: () => Promise<T>, deps: { readonly sleep: (ms: number) => Promise<void>; readonly now: () => number; readonly maxRetries?: number },
): Promise<T> {
  const maxRetries = deps.maxRetries ?? 4;
  let last: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (e instanceof BudgetExceededError) throw e; // budget / already-fatal 403 => re-throw
      if (e instanceof HttpStatusError && e.status === 403) throw new Fatal403Error("bell/universe: HTTP 403 hard stop (fail-closed)");
      last = e;
      if (attempt >= maxRetries) throw e instanceof Error ? e : new Error(String(e));
      const ra = e instanceof HttpStatusError ? e.retryAfterMs : null;
      await deps.sleep(ra ?? 400 * (attempt + 1));
    }
  }
  throw last instanceof Error ? last : new Error("retry exhausted");
}

// ---- Persistent APPELS budget (fail-closed, resume without double-count: C-G2-1, M17/M15 of -b3d-a) --
export interface UniverseBudget { readonly call: JsonRpcCall; readonly tick: () => void; readonly calls: () => number; readonly total: () => number }
/** Reuse makeBudgetedCall by CAP REDUCTION (B-5 authorizes importing tick()): the in-process counter runs
 *  0..(maxCalls-priorCalls) and total()=priorCalls+calls() is the M17 offset (no duplicated guard, no
 *  double-count on resume). priorCalls>=maxCalls => throws at construction (already spent). `inner` is the
 *  paced/retried low-level call. */
export function makeUniverseBudget(maxCalls: number, priorCalls: number, mk: (cap: number, inner: JsonRpcCall) => { call: JsonRpcCall; calls: () => number; tick: () => void }, inner: JsonRpcCall): UniverseBudget {
  const remaining = maxCalls - priorCalls;
  if (!(remaining > 0)) throw new BudgetExceededError(`bell/universe: budget already spent (prior ${String(priorCalls)} >= max ${String(maxCalls)})`);
  const b = mk(remaining, inner);
  return { call: b.call, tick: b.tick, calls: b.calls, total: () => priorCalls + b.calls() };
}
export interface BudgetLedger { readonly calls: number }
/** Read the prior APPELS count from a ledger file. Absent => 0 (fresh). Malformed / invalid => THROW
 *  (fail-closed, C-G2D-2). Never re-chains from genesis silently. */
export function readPriorCalls(path: string, exists: (p: string) => boolean, readFile: (p: string) => string): number {
  if (!exists(path)) return 0;
  let parsed: unknown;
  try { parsed = JSON.parse(readFile(path)); } catch { throw new Error("bell/universe: budget ledger is malformed (fail-closed)"); }
  const n = asObj(parsed).calls;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) throw new Error("bell/universe: budget ledger 'calls' is invalid (fail-closed)");
  return n;
}
export function serializeLedger(calls: number): string { return canonical({ calls }) + "\n"; }

// ---- On-chain identity confirmation (quorum-2, getAccountInfo) ------------------------------------
export type IdentityState = "confirmed" | "identity_unconfirmed" | "unverified" | "no_quorum";
export interface OnchainReadout {
  readonly state: IdentityState;
  readonly owner: string | null;
  readonly decimals: number | null;       // ON-CHAIN only (issuer does not publish it; its decimals is USDC)
  readonly scaled_ui: boolean | null;      // null only when unread
  readonly scaled_ui_authority: string | null;
  readonly scaled_ui_unread: boolean;      // fail-closed residual (Q8)
  readonly extension_names: readonly string[]; // names only, no values
  readonly permanent_delegate: string | null;
}
const asMint = (result: unknown) => readMintToken2022(result, "");
export function extensionNames(result: unknown): string[] {
  const info = asObj(asObj(asObj(asObj(asObj(result).value).data).parsed).info);
  const names = asArr(info.extensions).map((e) => String(asObj(e).extension)).filter((s) => s.length > 0 && s !== "undefined");
  return [...new Set(names)].sort();
}
/** Stable quorum KEY of a mint account: owner + decimals + sorted extension names + scaled-UI authority +
 *  permanent delegate. Excludes SUPPLY and the volatile multiplier/newMultiplier/effTs (rebase in flight),
 *  and paused (a live pause is state, not identity) — so concordance is on identity, not on drift. A
 *  value:null (absent account) keys to "absent" so two providers concord on absence, never on a phantom. */
export function accountIdentityKey(result: unknown): string {
  if (asObj(result).value === null || asObj(result).value === undefined) return "absent";
  const v = asObj(asObj(result).value);
  const m = asMint(result);
  return canonical({
    owner: typeof v.owner === "string" ? v.owner : "",
    type: str(asObj(asObj(v.data).parsed).type),
    decimals: m.decimals, exts: extensionNames(result),
    scaled_ui_authority: m.scaledAuthority, permanent_delegate: m.permanentDelegate,
  });
}
const unread = (state: IdentityState): OnchainReadout => ({
  state, owner: null, decimals: null, scaled_ui: null, scaled_ui_authority: null,
  scaled_ui_unread: true, extension_names: [], permanent_delegate: null,
});
/** Interpret a quorum-concordant getAccountInfo result. value:null (concordant) => identity_unconfirmed
 *  (absent account: impostor / wrong address), NOT unread. owner==Token-2022 => confirmed. */
export function interpretAccount(result: unknown): OnchainReadout {
  if (asObj(result).value === null || asObj(result).value === undefined) {
    return { state: "identity_unconfirmed", owner: null, decimals: null, scaled_ui: false, scaled_ui_authority: null, scaled_ui_unread: false, extension_names: [], permanent_delegate: null };
  }
  const v = asObj(asObj(result).value);
  const owner = typeof v.owner === "string" ? v.owner : null;
  // C1 (owner + decimals): a Token-2022 token ACCOUNT is ALSO owned by Token-2022 — only a `type:"mint"`
  // account is the security's mint. Without this, a token account at the address would falsely confirm.
  const isMint = str(asObj(asObj(v.data).parsed).type) === "mint";
  const m = asMint(result);
  const exts = extensionNames(result);
  return {
    state: owner === TOKEN_2022_PROGRAM && isMint ? "confirmed" : "identity_unconfirmed",
    owner, decimals: m.decimals, scaled_ui: exts.includes("scaledUiAmountConfig"),
    scaled_ui_authority: m.scaledAuthority, scaled_ui_unread: false, extension_names: exts, permanent_delegate: m.permanentDelegate,
  };
}
/** Confirm one mint under quorum-2. Disagreement => unverified (never decided); miss => no_quorum; both
 *  fail-closed to scaled_ui_unread (Q8). BudgetExceededError (incl. Fatal403Error) re-thrown => run stops. */
export async function confirmMintIdentity(mint: string, providers: readonly string[], call: JsonRpcCall, faults: TransportFault[] = []): Promise<OnchainReadout> {
  try {
    const result = await quorum2(`acct:${mint.slice(0, 8)}`, providers, call,
      (c, u) => c(u, "getAccountInfo", [mint, { encoding: "jsonParsed", commitment: "confirmed" }]),
      accountIdentityKey, faults);
    return interpretAccount(result);
  } catch (e) {
    if (e instanceof BudgetExceededError) throw e;
    if (e instanceof QuorumDisagreementError) return unread("unverified");
    if (e instanceof NoQuorumError) return unread("no_quorum");
    throw e;
  }
}
/** Preflight (before burning any issuer page): exactly two providers, both present, DISTINCT operators, and
 *  the second is Chainstack (operator plan A) — never mainnet-beta / publicnode / BELL_SOLANA_RPC. */
export function assertProvidersDistinctForQuorum(providers: readonly string[]): void {
  if (providers.length !== 2 || !providers[0] || !providers[1]) throw new Error("bell/universe: exactly two RPC providers are required for quorum-2");
  const [a, b] = providers;
  assertHostAllowed(a); assertHostAllowed(b);
  if (operatorOf(a) === operatorOf(b)) throw new Error("bell/universe: the two RPC providers collapse to one operator (no quorum-2)");
  if (operatorOf(a) !== "solana-foundation" || operatorOf(b) !== CHAINSTACK_OPERATOR) {
    throw new Error("bell/universe: operator plan A requires solana-foundation + chainstack (CONF-SRC-4)");
  }
}

// ---- Enumeration (client filter on deployments[].network) -----------------------------------------
export interface SolanaCandidate {
  readonly symbol: string; readonly name: string; readonly mint: string; readonly network: "Solana";
  readonly mic: string | null; readonly onchain: OnchainReadout;
}
/** The Solana deployment address of an issuer asset, or null when it has no Solana deployment (CLIENT
 *  filter, NB-2 — never trust a server ?network= filter). */
export function solanaDeploymentAddress(asset: unknown): string | null {
  for (const d of asArr(asObj(asset).deployments)) {
    const o = asObj(d);
    if (String(o.network).toLowerCase() === "solana" && typeof o.address === "string" && o.address.length > 0) return o.address;
  }
  return null;
}
/** underlying.exchange.mic (C2 input, consumed in -iii-a2), null-tolerant: the list shape may trim it. */
export function micOf(asset: unknown): string | null {
  const ex = asObj(asObj(asObj(asset).underlying).exchange);
  return typeof ex.mic === "string" && ex.mic.length > 0 ? ex.mic : null;
}
/** PURE core: injected issuer list + injected on-chain confirmation => Solana candidates with identity
 *  state. Deterministic order (issuer order); the artifact re-sorts by mint. */
export async function enumerateUniverse(
  rawAssets: readonly unknown[], confirm: (mint: string) => Promise<OnchainReadout>,
): Promise<{ candidates: SolanaCandidate[]; totalAssets: number; solanaAssets: number }> {
  const candidates: SolanaCandidate[] = [];
  let solanaAssets = 0;
  for (const asset of rawAssets) {
    const mint = solanaDeploymentAddress(asset);
    if (mint === null) continue;
    solanaAssets += 1;
    const o = asObj(asset);
    candidates.push({ symbol: str(o.symbol), name: str(o.name), mint, network: "Solana", mic: micOf(asset), onchain: await confirm(mint) });
  }
  return { candidates, totalAssets: rawAssets.length, solanaAssets };
}

// ---- Calibration oracle (pre-registered): the 4 founding mints appear + confirmed, or STOP -----------
export interface CalibrationResult { readonly ok: boolean; readonly missing: readonly string[]; readonly notConfirmed: readonly string[] }
/** The 4 founding mints (XSTOCKS, pools.ts) MUST appear in the exhausted enumeration at the SAME address
 *  (Map key = char-for-char), owner==Token-2022 (state confirmed). Otherwise ok:false => the CLI STOPs
 *  (exit != 0, no artifact): the enumerator is broken. */
export function foundingCalibration(candidates: readonly SolanaCandidate[]): CalibrationResult {
  const byMint = new Map(candidates.map((c) => [c.mint, c] as const));
  const missing: string[] = []; const notConfirmed: string[] = [];
  for (const f of XSTOCKS) {
    const c = byMint.get(f.address);
    if (c === undefined) { missing.push(f.symbol); continue; }
    if (c.onchain.state !== "confirmed" || c.onchain.owner !== TOKEN_2022_PROGRAM) notConfirmed.push(f.symbol);
  }
  return { ok: missing.length === 0 && notConfirmed.length === 0, missing, notConfirmed };
}

// ---- Committable artifact by FIELD ALLOWLIST (B-11), never by strip -------------------------------
/** CLOSED allowlist for a committable candidate record: on-chain identity + issuer identity ONLY. NO
 *  price/value/volume/balance/reserve/supply/multiplier field and NO price-derivable pair. */
export const CANDIDATE_FIELDS = [
  "symbol", "name", "mint", "network", "mic",
  "owner_program", "decimals", "extension_names",
  "scaled_ui", "scaled_ui_authority", "scaled_ui_unread", "identity_state",
] as const;
/** A field-name regex for price/value-bearing keys: the allowlist MUST match none of these (mutant: a
 *  price field added to CANDIDATE_FIELDS reddens the allowlist test). */
export const PRICE_LIKE_FIELD = /price|value|volume|fdv|market[_-]?cap|reserve|balance|liquidity|tvl|quote_vault|usd|amount|supply|multiplier/i;
/** Every key of a committable record MUST be on CANDIDATE_FIELDS — the load-bearing anti-close mechanism
 *  (explicit pick, not strip). A price-derivable pair cannot enter because neither key is on the list. */
export function assertOnlyAllowedFields(rec: Record<string, unknown>): void {
  const allowed = new Set<string>(CANDIDATE_FIELDS);
  for (const k of Object.keys(rec)) if (!allowed.has(k)) throw new Error(`bell/universe: field '${k}' is not on the committable allowlist (B-11)`);
}
export function buildCandidateRecord(c: SolanaCandidate): Record<string, Json> {
  const rec: Record<string, Json> = {
    symbol: c.symbol, name: c.name, mint: c.mint, network: c.network, mic: c.mic,
    owner_program: c.onchain.owner, decimals: c.onchain.decimals, extension_names: [...c.onchain.extension_names],
    scaled_ui: c.onchain.scaled_ui, scaled_ui_authority: c.onchain.scaled_ui_authority,
    scaled_ui_unread: c.onchain.scaled_ui_unread, identity_state: c.onchain.state,
  };
  assertOnlyAllowedFields(rec);
  assertNoClose(rec);
  return rec;
}
/** Timestamp-free artifact body (byte-exact replay): candidates sorted by mint, canonical serialization.
 *  Date/providers/fetch times live in a SEPARATE provenance envelope, never here. */
export function buildUniverseArtifact(candidates: readonly SolanaCandidate[], counts: { totalAssets: number; solanaAssets: number }): Json {
  const rows = candidates.map(buildCandidateRecord).sort((a, b) => str(a.mint).localeCompare(str(b.mint)));
  const body: Json = {
    schema: "bell-universe-candidates-v1",
    candidates: rows as Json,
    counts: { total_assets: counts.totalAssets, solana_assets: counts.solanaAssets, confirmed: candidates.filter((c) => c.onchain.state === "confirmed").length },
  };
  assertNoClose(body);
  return body;
}
export function universeArtifactBytes(body: Json): string { return canonical(body) + "\n"; }
export function universeSha256(body: Json): string { return createHash("sha256").update(canonical(body)).digest("hex"); }

// ---- Pagination-to-exhaustion proof (end anchor + monotonicity, never "N pages") -----------------
export interface PageProof { readonly pages: number; readonly endAnchor: boolean; readonly duplicateIds: boolean }
/** Assets on one /public/assets page: tolerant of an array or an {data|assets|items:[...]} envelope. */
export function pageAssets(pageJson: unknown): unknown[] {
  if (Array.isArray(pageJson)) return pageJson;
  const o = asObj(pageJson);
  for (const k of ["data", "assets", "items", "results"]) if (Array.isArray(o[k])) return o[k] as unknown[];
  return [];
}
const assetId = (a: unknown): string => { const o = asObj(a); return str(o.id) || str(o.symbol) || JSON.stringify(a); };
/** Fold a page into the running enumeration state and decide exhaustion. Exhaustion is PROVEN by an END
 *  ANCHOR (a page with fewer than pageSize items, or empty) with strictly monotone page index and no
 *  duplicate asset ids — NEVER by "we stopped at N pages". A full page with no shrink means keep going;
 *  the CLI caps pages fail-closed and treats cap-without-anchor as an ERROR (exhaustion not proven). */
export function foldPage(seenIds: Set<string>, page: unknown, pageSize: number): { assets: unknown[]; endAnchor: boolean; duplicateIds: boolean } {
  const assets = pageAssets(page);
  let duplicateIds = false;
  for (const a of assets) { const id = assetId(a); if (seenIds.has(id)) duplicateIds = true; seenIds.add(id); }
  return { assets, endAnchor: assets.length < pageSize, duplicateIds };
}
