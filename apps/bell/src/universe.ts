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
// GARDE-HELIUS-1b-i (C-3/D-9): the CANONICAL typed transport fault raised by the guarded client's transport. Bell
// keys its retry policy on it (name + code) instead of a Bell-local HttpStatusError (removed — one canonical class).
import { TransportError } from "@monark/rpc-guard";
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
export const SOLANA_FOUNDATION_LABEL = "solana-foundation"; // the Solana Foundation public RPC (keyless, api.mainnet.solana.com)
export const ISSUER_LABEL = "xstocks-issuer";               // the xStocks issuer public API (keyless HTTP GET witness, 1b-0 C-7)
/** GARDE-HELIUS-1b-i (C-12): the universe course requests EXACTLY this operator SUBSET from the CLI (never probed
 *  from env). openGuardedClient opens/locks ONLY these; the RPC quorum uses {solana-foundation, chainstack}, the
 *  issuer GET uses {xstocks-issuer}. */
export const UNIVERSE_OPERATORS: readonly string[] = [SOLANA_FOUNDATION_LABEL, CHAINSTACK_OPERATOR, ISSUER_LABEL];
/** api.mainnet-beta.solana.com, publicnode and GeckoTerminal are NOT on this list (CONF-SRC-4/5). */
export function hostOf(url: string): string { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } }
/** GARDE-HELIUS-1b-i (C-7): the host allowlist is REDUCED to an operator-LABEL membership test. Bell no longer
 *  parses/holds a URL — the guarded client's transport resolves each label to its private endpoint INTERNALLY and
 *  enforces the admitted host STRUCTURALLY (resolveGetUrl for the GET witness; the POST url comes from env). This
 *  belt refuses a call routed to a label outside the universe's fixed subset (defence-in-depth over the client's
 *  own resolveOperators check); no URL can appear in the message (there is none). */
export function assertHostAllowed(label: string): void {
  if (!UNIVERSE_OPERATORS.includes(label)) throw new Error("bell/universe: operator label is not on the universe allowlist (refused before send)");
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

// ---- Transport error typing + retry policy (Retry-After honored, HARD STOP on 403 / 3xx) ----------------
// GARDE-HELIUS-1b-i (C-1/C-3/D-9): the Bell-local HttpStatusError is REMOVED (one canonical class, consigne C-1).
// The guarded client's transport raises the PACKAGE's TransportError (name + code + retryAfterMs); withUniverseRetry
// keys on it. Fatal403Error / RedirectBlockedError remain the Bell HARD-STOP markers — they SUBCLASS the canonical
// BudgetExceededError (re-exported by quorum.ts) so quorum2 / the C-11 probe re-throw/swallow them by that type.
/** 403 hard stop (mission: stricter than fiche 05 backoff). Subclasses the canonical BudgetExceededError so quorum2
 *  re-throws it immediately (never benched as a coverage fault) and the run stops fail-closed (exit 1). */
export class Fatal403Error extends BudgetExceededError {}
/** A 3xx redirect surfaced on a guarded call (transport name "RedirectBlocked"). A redirect is NEVER followed — the
 *  structural host guard covers only the INITIAL host, so a followed 3xx could reach an off-host endpoint (and, for
 *  the POST, carry the body there). Subclasses the canonical BudgetExceededError so quorum2 / withUniverseRetry
 *  re-throw it immediately (a hard stop, no retry — a redirect is deterministic) and the run stops fail-closed. */
export class RedirectBlockedError extends BudgetExceededError {}
/** Retry one call: honor Retry-After on 429, deterministic backoff on 5xx/timeout, HARD STOP on 403 and 3xx, and
 *  re-throw budget errors immediately. GARDE-HELIUS-1b-i (C-3/D-9): the retryable signal is the PACKAGE's canonical
 *  TransportError (openGuardedClient's transport), keyed on `.name` + `.code` (not a Bell HttpStatusError). ONLY a
 *  transient TRANSPORT fault (Abort/network/429/>=500) is retried; a RpcError / NonJsonBody / a 4xx != 429 is
 *  re-thrown at once (never a transient signal). Injectable sleep/now so offline tests never actually wait. */
export async function withUniverseRetry<T>(
  fn: () => Promise<T>, deps: { readonly sleep: (ms: number) => Promise<void>; readonly now: () => number; readonly maxRetries?: number },
): Promise<T> {
  const maxRetries = deps.maxRetries ?? 4;
  let last: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (e instanceof BudgetExceededError) throw e; // budget / already-fatal 403 / blocked redirect => re-throw
      if (e instanceof TransportError) {
        if (e.name === "RedirectBlocked") throw new RedirectBlockedError("bell/universe: 3xx redirect on a guarded call — hard stop (never followed, fail-closed)");
        if (e.name === "HttpError" && e.code === 403) throw new Fatal403Error("bell/universe: HTTP 403 hard stop (fail-closed)");
        const transient = e.name === "AbortError" || e.name === "TypeError" || e.name === "NetworkError" || (e.name === "HttpError" && e.code !== undefined && (e.code === 429 || e.code >= 500));
        if (!transient) throw e; // RpcError / NonJsonBody / 4xx != 429 => NOT retried
        last = e;
        if (attempt >= maxRetries) throw e;
        await deps.sleep(e.retryAfterMs ?? 400 * (attempt + 1)); // honour the server's Retry-After when present (C-3b)
        continue;
      }
      throw e instanceof Error ? e : new Error(String(e)); // a non-TransportError is not a transient signal
    }
  }
  throw last instanceof Error ? last : new Error("retry exhausted");
}

// ---- Persistent APPELS budget: the METER is now the guarded client (GARDE-HELIUS-1b-i) --------------
// The in-process makeUniverseBudget/makeBudgetedCall counter is REMOVED: openGuardedClient meters + write-ahead
// ledgers + caps every call (the cycle ledger is the inter-run money guard, D-6). The RUN ledger (budget.json +
// chained journal) STAYS as a1-bis PROVENANCE, fed by total = priorCalls + client.spent().attempts.
/** M17 offset, kept PURE (the metering itself is the client). The client's run cap for THIS run = maxCalls -
 *  priorCalls (the RUN ledger's remaining attempts on a resume); a run already at/over its cap throws at
 *  construction (never a 0-remaining course that spends). total() elsewhere = priorCalls + client.spent().attempts,
 *  so a resume never double-counts and the M17 invariant (total = prior + this-run) holds. */
export function universeRunCap(maxCalls: number, priorCalls: number): number {
  const remaining = maxCalls - priorCalls;
  if (!(remaining > 0)) throw new BudgetExceededError(`bell/universe: budget already spent (prior ${String(priorCalls)} >= max ${String(maxCalls)})`);
  return remaining;
}
export interface BudgetLedger { readonly calls: number }
/** The COUNTER ANCHOR (budget.json {calls}) — written FIRST on every persist(). Unchanged shape. */
export function serializeLedger(calls: number): string { return canonical({ calls }) + "\n"; }

// ---- γ-prime chained RUN ledger (C-G2-7): tamper-EVIDENT, non-reducible APPELS journal -------------------
// FORMAT declared INLINE, byte-identical to the calque `rebase-crosscheck.ts:110-149` (etude-suite): same
// genesis, same `prev_entry_sha256`/`entry_sha256` names, same `entry_sha256 = sha(JSON.stringify(core))` in
// FIELD-WRITE ORDER. LEDGER_GENESIS is REDECLARED (cited), never imported: universe deliberately does NOT
// import rebase-crosscheck.ts in `src` (it is edited in-flight by -b3d-b1a; an `src` import would create a
// conflict surface and pull its whole graph). The format is LOCKED BY A TEST (C-3,
// `bell_universe_ledger_format_is_byte_identical_to_b3d`), not by this comment.
//
// BOUND MODEL (C-1, honest — R-21):
//  · Order = ANCHOR-COUNTER FIRST, journal append SECOND (calque b3db1a rebase-crosscheck.ts:592-597). A crash
//    in the window between the two writes leaves anchor.calls >= head.calls_cumulative — an OVER-count on
//    resume, never under. Crash-CONSERVATIVE, not a write-ahead.
//  · WRITE-BEHIND bound, corrected (C-V-1 / C-G2b-2 — the earlier "<= 2 logical calls everywhere" was FALSE):
//    - PAID path (Chainstack confirm): persist() is in `finally` per-mint (universe-cli.ts, the `confirm` closure),
//      so a kill between a quorum-2 send and its persist under-counts <= 2 logical calls (one quorum-2 confirmation)
//      => the PAID exposure is <= 2 RPC. This is the money-bearing bound.
//    - LOGICAL ticks (any path): persist() now runs PER PAGE in the pagination loop body AND in the probe `finally`
//      (not only at the loop `finally`), so at any instant the anchor is <= 1 logical tick behind the counter (a
//      hard-kill loses at most the in-flight page/probe tick). The un-persisted GET is an ISSUER GET (xStocks,
//      NON-paid); it costs no credit.
//    The true write-AHEAD (append before fetch) is the GARDE-HELIUS CYCLE ledger, NOT this RUN ledger. Unit =
//    LOGICAL TICKS (a retry under the tick does NOT increment, C-2); this RUN ledger serves resume-without-double-
//    count and the run cap, it is NOT the source of the Chainstack reconciliation.
//  · Threat model: tamper-EVIDENT for UNCOORDINATED edits only (a budget.json lowered by hand =>
//    anchor.calls < head.calls_cumulative => throw; a journal line edited => verifyChain fails). It does NOT
//    claim to catch a COORDINATED rewrite (truncate to K AND set anchor.calls = calls_cumulative(K)) — beyond
//    "the operator's OWN clean ledger". Tamper-evident, NEVER "non-falsifiable". Exposure of a doctored resume
//    is bounded by --max-calls per run (the in-process makeBudgetedCall counter depends on NO file).
export const LEDGER_GENESIS = "0".repeat(64);
/** The RUN-ledger journal filename. OUTSIDE the -b3d globs `^ledger-.*\.jsonl$` (ledgerPagesOnDisk,
 *  rebase-crosscheck.ts:388) and `^(ledger|events|handoffs)-.*\.jsonl$` (hasResumeState, :395) so a shared
 *  --out is never falsely read as -b3d resume state (C-13). Lives in dirname(--ledger); NO new CLI flag. */
export const UNIVERSE_LEDGER_JOURNAL = "universe-budget-ledger.jsonl";
export interface LedgerEntry { readonly prev_entry_sha256: string; readonly seq: number; readonly calls_cumulative: number; readonly entry_sha256: string }
const ledgerSha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const isHex64 = (x: unknown): x is string => typeof x === "string" && /^[0-9a-f]{64}$/.test(x);
/** sha256hex(JSON.stringify(core)) — the SAME discipline as the calque's module-local `sha`
 *  (rebase-crosscheck.ts:40) applied to the core in FIELD-WRITE ORDER. NOT canonical() (which sorts keys):
 *  byte-identity to -b3d depends on the write order (mutant M-format). */
export function ledgerEntrySha256(core: Record<string, unknown>): string { return ledgerSha256(JSON.stringify(core)); }
/** Build the next chained entry from the prior head sha. Core FIELD-WRITE ORDER = prev, seq, calls_cumulative
 *  (mirrors the calque `{prev_entry_sha256, page, ...}`; page->seq, the page fields->calls_cumulative). */
export function chainedLedgerEntry(prevSha: string, seq: number, callsCumulative: number): LedgerEntry {
  const core = { prev_entry_sha256: prevSha, seq, calls_cumulative: callsCumulative };
  return { ...core, entry_sha256: ledgerEntrySha256(core) };
}
/** Re-derive the whole chain INDEPENDENTLY (the "only proof" the chain engages every entry — leaked lesson
 *  -b3d b3db1a:167-172: a verifier that RE-READS prev_entry_sha256 instead of RECOMPUTING sha(core) lets the
 *  mutant that mutates it survive). Checks: field TYPES (hex64, integers >= 0); prev chained from GENESIS;
 *  entry_sha256 == recomputed ledgerEntrySha256(core); calls_cumulative monotone non-decreasing (C-4). The core
 *  is reconstructed EXPLICITLY in write order (never JSON.stringify of the parsed line). Returns {ok, head}. */
export function verifyChain(entries: readonly unknown[]): { ok: boolean; head: string } {
  let prev = LEDGER_GENESIS;
  let lastCalls = -1;
  let index = 0;
  for (const raw of entries) {
    const e = asObj(raw);
    if (!isHex64(e.prev_entry_sha256) || !isHex64(e.entry_sha256)) return { ok: false, head: prev };
    // C-V-3: seq MUST equal the entry's position (0,1,2,…) — so it is monotone, >= 0, no gap, no duplicate. A
    // writer that freezes seq at 0 (mutant) breaks this at index 1. calls_cumulative stays an integer >= 0 too.
    if (!Number.isInteger(e.seq) || e.seq !== index || !Number.isInteger(e.calls_cumulative) || (e.calls_cumulative as number) < 0) return { ok: false, head: prev };
    if (e.prev_entry_sha256 !== prev) return { ok: false, head: prev };
    const core = { prev_entry_sha256: e.prev_entry_sha256, seq: e.seq, calls_cumulative: e.calls_cumulative };
    if (ledgerEntrySha256(core) !== e.entry_sha256) return { ok: false, head: prev };
    if ((e.calls_cumulative as number) < lastCalls) return { ok: false, head: prev };
    lastCalls = e.calls_cumulative as number;
    prev = e.entry_sha256;
    index += 1;
  }
  return { ok: true, head: prev };
}
export interface PriorLedger { readonly calls: number; readonly head: string; readonly seq: number }
/** Resume reader (fail-closed, C-G2D-2 + calque rebase-crosscheck.ts:403-419). Reads the counter ANCHOR
 *  (budget.json {calls}) and the chained journal, and CONTINUES the chain from its head (never GENESIS a 2nd
 *  time — mutant M-regenesis). Cases:
 *   · neither anchor nor journal            => {0, GENESIS, 0}                 (fresh)
 *   · journal present, anchor ABSENT        => throw                          (incoherent resume; M-absent)
 *   · anchor present, journal absent/empty  => {anchor.calls, GENESIS, 0}     (LEGIT: the crash window between ANY
 *                                              persist's anchor write and its following append — C-V-1 persists per
 *                                              page, so this is no longer only the very first append)
 *   · both present                          => verifyChain (throw if !ok); anchor.calls >= head.calls_cumulative
 *                                              (>=, NEVER ==: the crash window leaves the anchor AHEAD; == would
 *                                              break post-crash resume, C-4). anchor.calls < head => throw
 *                                              (downward edit). Any unreadable line => throw (no skip).
 *  Honest residual: journal DELETION + anchor lowered = a COORDINATED rewrite (out of model; exposure <= --max-calls). */
export function readPriorCalls(anchorPath: string, journalPath: string, exists: (p: string) => boolean, readFile: (p: string) => string): PriorLedger {
  const anchorPresent = exists(anchorPath);
  const lines = (exists(journalPath) ? readFile(journalPath) : "").split("\n").filter((l) => l.trim() !== "");
  if (!anchorPresent) {
    if (lines.length > 0) throw new Error("bell/universe: budget ledger journal present but the counter anchor is absent (fail-closed: a resume without its counter is incoherent)");
    return { calls: 0, head: LEDGER_GENESIS, seq: 0 };
  }
  let parsed: unknown;
  try { parsed = JSON.parse(readFile(anchorPath)); } catch { throw new Error("bell/universe: budget anchor is malformed (fail-closed)"); }
  const anchorCalls = asObj(parsed).calls;
  // C-V-3: the anchor MUST be a whole integer >= 0 (parity with verifyChain's calls_cumulative), so a fractional
  // hand-edited anchor is refused, not silently accepted.
  if (typeof anchorCalls !== "number" || !Number.isInteger(anchorCalls) || anchorCalls < 0) throw new Error("bell/universe: budget anchor 'calls' is invalid (fail-closed, integer >= 0)");
  if (lines.length === 0) return { calls: anchorCalls, head: LEDGER_GENESIS, seq: 0 };
  const entries = lines.map((l, i) => { try { return JSON.parse(l) as unknown; } catch { throw new Error(`bell/universe: budget ledger journal line ${String(i)} is unreadable (fail-closed, no skip)`); } });
  const v = verifyChain(entries);
  if (!v.ok) throw new Error("bell/universe: budget ledger chain does not re-derive (fail-closed, tamper-evident)");
  const headCalls = asObj(entries[entries.length - 1]).calls_cumulative as number;
  if (anchorCalls < headCalls) throw new Error("bell/universe: budget anchor calls below the ledger head (downward edit detected, fail-closed)");
  return { calls: anchorCalls, head: v.head, seq: entries.length };
}

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
// ---- Identity-text sanitizer (C-G2-6) -------------------------------------------------------------
/** `name`/`symbol` are FREE TEXT from the issuer list and ARE on the field allowlist (they are identity), so a
 *  price could ride inside them past assertOnlyAllowedFields. EMPTY the field (never truncate to a sub-price) when
 *  it is not plain identity: outside the value whitelist [A-Za-z0-9 .,&()+'-], longer than 64, or carrying a `$`, a
 *  currency code adjacent-to-a-digit-or-standalone (LETTER-boundary lookaround, C-V-4), or a decimal `\d+[.,]\d+`
 *  (period OR comma separator). The whitelist already excludes `$`; the explicit monetary checks make the intent
 *  legible. DECLARED RESIDUALS / survivors (C-7 / C-R-4; values come from the issuer's PUBLIC identity list,
 *  nothing published this round, reviewed before publication):
 *   - a BARE integer ("TSLA 420"): indistinguishable from "S&P 500" / "3M" / "SP500 xStock";
 *   - a bare integer FOLLOWED by a stablecoin ticker or a word ("100 USDT", "5 shares"): not glued to a CLOSED-list code;
 *   - a currency code glued to a symbol letter ("5USDx"): the trailing letter reads as a ticker, preserved on purpose;
 *   - a decimal WITHOUT an integer part (".5"): the decimal pattern needs digits on BOTH sides;
 *   - a currency OUTSIDE the closed list (CNY, INR, "kr"): the list is CLOSED to avoid false-rejecting legitimate names.
 *  DECLARED FALSE-REJECTS (conservative): a legitimate decimal name ("Fund 2.5") AND a thousands-grouped integer
 *  ("1,234") are emptied. The count is surfaced as identity_text_emptied=N in the provenance. */
const IDENTITY_TEXT_ALLOWED = /^[A-Za-z0-9 .,&()+'-]*$/;
// C-V-4: currency code with a LETTER-boundary lookaround (NOT `\b`): `\b` treats a digit as a word char, so a
// GLUED "USD12"/"12USD"/"AAPL USD150"/"EUR3" slipped through (a currency+amount surviving in identity text). The
// letter-boundary form catches every glued form yet PRESERVES symbol-like "USDx"/"USDCx"/"EURCx" (a letter follows
// the code). Decimal admits BOTH separators `[.,]` so "1,5" is emptied like "1.5".
const IDENTITY_CURRENCY_CODE = /(?<![A-Za-z])(USD|EUR|GBP|CHF|JPY|CAD|AUD)(?![A-Za-z])/i;
const IDENTITY_DECIMAL = /\d+[.,]\d+/;
export function sanitizeIdentityText(s: string): string {
  if (s.length > 64) return "";
  if (!IDENTITY_TEXT_ALLOWED.test(s)) return "";     // covers `$` and any non-identity character
  if (IDENTITY_CURRENCY_CODE.test(s)) return "";     // currency code adjacent to a digit (or standalone), case-insensitive
  if (IDENTITY_DECIMAL.test(s)) return "";           // a price-shaped decimal (period OR comma separator)
  return s;
}
/** Count the name/symbol fields a run would EMPTY (surfaced as identity_text_emptied=N in the provenance). */
export function countIdentityEmptied(candidates: readonly SolanaCandidate[]): number {
  let n = 0;
  for (const c of candidates) {
    if (sanitizeIdentityText(c.name) !== c.name) n += 1;
    if (sanitizeIdentityText(c.symbol) !== c.symbol) n += 1;
  }
  return n;
}
export function buildCandidateRecord(c: SolanaCandidate): Record<string, Json> {
  const rec: Record<string, Json> = {
    symbol: sanitizeIdentityText(c.symbol), name: sanitizeIdentityText(c.name), mint: c.mint, network: c.network, mic: c.mic,
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
  // C-G2-1 (G2 fold): sort by UTF-16 CODE UNIT (the SAME discipline as digest.ts canonical()'s Object.keys().sort()),
  // NOT localeCompare — localeCompare depends on the runtime ICU/locale, so the artifact body order (hence its pinned
  // sha256) would differ between a dev box and ubuntu-latest. This explicit comparator is Array#sort's default
  // string order made legible and locale-independent; the byte-exact-replay fixture is re-frozen to this order.
  const rows = candidates.map(buildCandidateRecord).sort((a, b) => { const x = str(a.mint), y = str(b.mint); return x < y ? -1 : x > y ? 1 : 0; });
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
