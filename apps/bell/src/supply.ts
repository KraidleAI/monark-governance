// MONARK Bell — fact (iv): on-chain supply vs relayed proof-of-reserves (ADR-B0 D2 iv, ADR-T1aii C-3/C-4).
// The tokenized security supply is read FIRST-HAND on-chain by a PLAIN Token-2022 getAccountInfo (jsonParsed)
// of the mint (C-4: scaledUiAmountConfig, pausableConfig, permanentDelegate are exposed there in 1 credit,
// quorum-able; no DAS detour). Proof-of-reserves (Y) is a RELAYED value: for every token today there is a
// NAMED attestation method but NO first-hand on-chain feed to recompute against, so the honest outcome is the
// named residue por_unavailable (never fabricate a feed address). The published statement is fixed and carries
// no surclaim: "S and Y differ from X at t; Y is not verified against the custodian" (D2 iv; "not verified" is
// the honest word, negation-aware vocab).
//
// C-4 items read-and-logged, NOT yet rendered: pausableConfig.paused is a halt-like on-chain witness (cond. H)
// -> T-1b timeline; permanentDelegate is a parity fact -> T-2. They are carried in the readout so the state
// file records them, but no downstream fact is derived from them at this lot.

import { constantMultiplierOver, overwrittenPending, type MultiplierEvent } from "./rebase-trajectory.ts";

const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
const asArr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

/** First-hand Token-2022 mint readout (plain RPC, jsonParsed). supply is the raw base-unit amount (equals
 *  getTokenSupply.amount). multiplier is the STORED scaled-UI multiplier (`scaled.multiplier`): measured
 *  2026-09-20 TSLAx="1", SPYx="1.0039…", NVDAx="1.0009…", AAPLx="1.0027…" — NOT "1" for three of the four.
 *  paused/permanentDelegate are read and logged (T-1b/T-2), not yet rendered. */
export interface MintReadout {
  readonly symbol: string;
  readonly decimals: number;
  readonly supply: string;
  readonly multiplier: string;
  readonly paused: boolean;
  readonly permanentDelegate: string | null;
  // C-6 rebase-gate inputs (scaledUiAmountConfig): the UPDATE authority (null = immutable multiplier), the
  // scheduled newMultiplier, and the unix-second at which it takes effect (0 = none scheduled). C-G2-2: on the
  // four measured xStocks this effective-timestamp is ELAPSED at the 2026-09-20 read (SPYx effTs=1781755200=
  // 2026-06-18Z, AAPLx 1786149000=2026-08-08Z, NVDAx 1789000200=2026-09-10Z; TSLAx 0=none scheduled) — the
  // newMultiplier is a PAST-DATED value, NOT a "future/pending" one. Whether it supersedes `multiplier` once
  // effTs is elapsed is the ScaledUiAmount rule [abs offline], see readMintToken2022 (C-G2-3 procurement).
  readonly scaledAuthority: string | null;
  readonly newMultiplier: string;
  readonly newMultiplierEffectiveTimestampSec: number;
}

/** Find a Token-2022 extension state by name in the jsonParsed extensions array. */
function extState(info: Record<string, unknown>, name: string): Record<string, unknown> | null {
  for (const e of asArr(info.extensions)) {
    const o = asObj(e);
    if (o.extension === name) return asObj(o.state);
  }
  return null;
}

/** Parse a plain getAccountInfo(jsonParsed) RESULT of a Token-2022 mint into the first-hand readout (C-4).
 *  Reads result.value.data.parsed.info: supply, decimals, and the scaledUiAmount / pausable / permanent-
 *  delegate extensions. A multiplier other than "1" means the display unit differs from the base unit.
 *  C-G2-3 (fail-closed): `multiplier` is the STORED `scaled.multiplier` field verbatim — it is NOT resolved
 *  against `newMultiplier`/effTs here. When `newMultiplierEffectiveTimestampSec` is non-zero AND elapsed, the
 *  EFFECTIVE display multiplier under the SPL Token-2022 ScaledUiAmount rule MAY be `newMultiplier`; that rule
 *  is [abs] offline (`@solana/spl-token` absent from node_modules AND package-lock, checked 2026-09-20 — no
 *  `amountToUiAmount` to read). Procurement PR-B-SPL-TOKEN2022 (ADR-B0). BOTH fields are preserved raw so -b3
 *  can resolve the trajectory; NO `supply × multiplier` value is RENDERED at -b1 (read-and-logged only), so
 *  logging the stored value is honest. The C-6 gate is unaffected either way (mutable authority => unverified;
 *  and multiplier!=1 <=> newMultiplier!=1 on all four measured mints, so `multiplier_unit` fires identically). */
export function readMintToken2022(result: unknown, symbol: string): MintReadout {
  const info = asObj(asObj(asObj(asObj(asObj(result).value).data).parsed).info);
  const supply = typeof info.supply === "string" ? info.supply : "0";
  const decimals = typeof info.decimals === "number" ? info.decimals : 0;
  const scaled = extState(info, "scaledUiAmountConfig");
  const multiplier = scaled && typeof scaled.multiplier === "string" ? scaled.multiplier : "1";
  const scaledAuthority = scaled && typeof scaled.authority === "string" && scaled.authority.length > 0 ? scaled.authority : null;
  const newMultiplier = scaled && typeof scaled.newMultiplier === "string" ? scaled.newMultiplier : multiplier;
  const effRaw = scaled ? scaled.newMultiplierEffectiveTimestamp : 0;
  const newMultiplierEffectiveTimestampSec = typeof effRaw === "number" ? effRaw : typeof effRaw === "string" && effRaw.trim() !== "" && Number.isFinite(Number(effRaw)) ? Number(effRaw) : 0;
  const pausable = extState(info, "pausableConfig");
  const paused = pausable ? pausable.paused === true : false;
  const delegate = extState(info, "permanentDelegate");
  const permanentDelegate = delegate && typeof delegate.delegate === "string" ? delegate.delegate : null;
  return { symbol, decimals, supply, multiplier, paused, permanentDelegate, scaledAuthority, newMultiplier, newMultiplierEffectiveTimestampSec };
}

/** A NAMED proof-of-reserves source (first-hand [lu] 2026-09-19). onchainFeed is the on-chain aggregator proxy
 *  address to recompute Y against, or null when none is public (then the token abstains: por_unavailable). */
export interface PoRSource {
  readonly method: string;
  readonly dashboard: string;
  readonly onchainFeed: string | null;
  readonly note: string;
}

// Per-token PoR registry (C-3). Measured first-hand 2026-09-19: the four Solana xStocks are attested OFF-CHAIN
// by The Network Firm (por.backed.fi); their Chainlink DataLink streams (SYM/POR-Datalink-ProofOfReserves-
// mainnet-production) exist but every proxyAddress is null (no public on-chain aggregator) -> recompute
// unavailable, never fabricate an address. TSLAon PoR is the Ondo reserve API, auth-gated (403, PR-B-ONDO)
// -> declared abstention. onchainFeed stays null everywhere today; add a proxy only when one ships (item).
export const POR_SOURCES: Readonly<Record<string, PoRSource>> = {
  TSLAx: { method: "The Network Firm attestation (read-only custody-bank balances)", dashboard: "por.backed.fi", onchainFeed: null, note: "Chainlink DataLink stream TSLAx/POR-Datalink-ProofOfReserves-mainnet-production, proxyAddress null [lu]" },
  SPYx: { method: "The Network Firm attestation (read-only custody-bank balances)", dashboard: "por.backed.fi", onchainFeed: null, note: "Chainlink DataLink stream SPYx/POR-Datalink-ProofOfReserves-mainnet-production, proxyAddress null [lu]" },
  NVDAx: { method: "The Network Firm attestation (read-only custody-bank balances)", dashboard: "por.backed.fi", onchainFeed: null, note: "Chainlink DataLink stream NVDAx/POR-Datalink-ProofOfReserves-mainnet-production, proxyAddress null [lu]" },
  AAPLx: { method: "The Network Firm attestation (read-only custody-bank balances)", dashboard: "por.backed.fi", onchainFeed: null, note: "Chainlink DataLink stream AAPLx/POR-Datalink-ProofOfReserves-mainnet-production, proxyAddress null [lu]" },
  TSLAon: { method: "Ondo Global Markets reserve API", dashboard: "api.gm.ondo.finance", onchainFeed: null, note: "auth-gated (403 measured 2026-09-19, PR-B-ONDO) -- declared abstention" },
};

/** Wrapper / bridge contracts that could inflate apparent supply (lesson Edel: a wrapper x78, oracle right).
 *  NONE is named first-hand today -> an empty list yields the residue no_wrapper; the wrapper RATE is the
 *  wrapped supply over the base supply, computable only once a wrapper contract is named (never fabricated). */
export const WRAPPERS: Readonly<Record<string, readonly string[]>> = {
  TSLAx: [], SPYx: [], NVDAx: [], AAPLx: [], TSLAon: [],
};

/** PoR status for a token. relayed (value + updatedAtSec) comes from a relayed source (fixture-injected in CI;
 *  live only when a feed is named). Returns the residue when no first-hand Y exists or when Y is stale. */
export type PoRStatus =
  | { readonly kind: "unavailable"; readonly residue: "por_unavailable"; readonly source: PoRSource }
  | { readonly kind: "stale"; readonly residue: "por_stale"; readonly ageSec: number; readonly source: PoRSource }
  | { readonly kind: "ok"; readonly statement: string; readonly source: PoRSource };

/** Fixed honest statement (D2 iv). No surclaim: S and Y differ from X; Y is not verified against the custodian. */
export function supplyVsPoRStatement(symbol: string): string {
  return `${symbol}: on-chain supply S and relayed proof-of-reserves Y differ from the underlying float X at time t; Y is not verified against the custodian.`;
}

/** Decide the PoR status. No relayed value ⇒ por_unavailable (no named on-chain feed today). A relayed value
 *  older than staleBoundSec ⇒ por_stale. Otherwise ⇒ ok with the fixed honest statement. */
export function porStatus(symbol: string, nowSec: number, staleBoundSec: number,
  relayed?: { readonly value: string; readonly updatedAtSec: number }): PoRStatus {
  const source = POR_SOURCES[symbol] ?? { method: "unknown", dashboard: "", onchainFeed: null, note: "no registry entry" };
  if (relayed === undefined) return { kind: "unavailable", residue: "por_unavailable", source };
  const ageSec = nowSec - relayed.updatedAtSec;
  if (ageSec > staleBoundSec) return { kind: "stale", residue: "por_stale", ageSec, source };
  return { kind: "ok", statement: supplyVsPoRStatement(symbol), source };
}

/** Wrapper status for a token: the named wrapper contracts and the residue when none is named. */
export function wrapperStatus(symbol: string): { readonly contracts: readonly string[]; readonly residue: "no_wrapper" | null } {
  const contracts = WRAPPERS[symbol] ?? [];
  return { contracts, residue: contracts.length === 0 ? "no_wrapper" : null };
}

/** C-6 pool-window rebase gate (ADR-T1aii-D1-bis). A founding VWAP is only comparable to a cash close if the
 *  token's scaled-UI multiplier was CONSTANT across the window: a rebase (multiplier change) rescales the base
 *  unit, so `Σ|quote|/Σ|base|` would drift for a reason unrelated to price. The multiplier is read at BOTH the
 *  window's begin and end bounds (first-hand). Both present + equal => `constant`; a missing bound reading OR a
 *  change => `rebase_unverified` (the affected sessions abstain — never a silently rescaled g_t). Pure: the
 *  reconstruction of the two bound readings is a live/spike concern; this function only decides the gate. */
export type RebaseGate =
  | { readonly status: "constant"; readonly multiplier: string }
  // C-6 (D1-quater): the multiplier trajectory was replayed from Initialize and m(t) is available per fill; the
  // events ride as plain data so collect() computes g_t rebase-aware and the replay oracle stays bit-identical.
  | { readonly status: "trajectory_known"; readonly events: readonly MultiplierEvent[]; readonly overwrittenPending: number }
  | { readonly status: "unverified"; readonly residue: "rebase_unverified" };
export function rebaseGate(multiplierAtBegin: string | null, multiplierAtEnd: string | null): RebaseGate {
  if (multiplierAtBegin === null || multiplierAtEnd === null) return { status: "unverified", residue: "rebase_unverified" };
  if (multiplierAtBegin !== multiplierAtEnd) return { status: "unverified", residue: "rebase_unverified" };
  return { status: "constant", multiplier: multiplierAtEnd };
}

/** C-6/C-1 (D1-quater): the pool-window gate DECIDED ON THE REPLAYED TRAJECTORY, pure. `constant` <=> m(t) is
 *  bit-identical at every breakpoint of [fromSec,toSec] (window bounds ∪ in-window event blockTimes ∪ in-window
 *  effTs), established by replay from Initialize — NOT "zero in-window events" (a pre-window update with an
 *  in-window effTs changes m without an in-window instruction). `overwritten_pending > 0` (F-2) fails CLOSED to
 *  `rebase_unverified` (the actually-applied value is not proven cheaply). An INCOMPLETE scan (budget, no_quorum,
 *  blockTime null, undecidable same-slot order, state-oracle divergence) => `rebase_unverified`. Otherwise the
 *  varying trajectory is `trajectory_known` and rides as events for a per-fill g_t. */
export function rebaseGateFromTrajectory(events: readonly MultiplierEvent[], fromSec: number, toSec: number, scanComplete: boolean): RebaseGate {
  if (!scanComplete) return { status: "unverified", residue: "rebase_unverified" };
  const overwritten = overwrittenPending(events);
  if (overwritten > 0) return { status: "unverified", residue: "rebase_unverified" };
  const c = constantMultiplierOver(events, fromSec, toSec);
  if (c !== null) return { status: "constant", multiplier: String(c.value) };
  return { status: "trajectory_known", events: [...events], overwrittenPending: overwritten };
}

/** C-1/C-12: the CURRENT mint readout ALONE cannot establish constancy (the C-G2-8 "authority null now = null in
 *  2025" shortcut is CLOSED by C-1 — a mutable OR immutable authority says nothing about the 2025 trajectory).
 *  Without the replayed trajectory the gate is `rebase_unverified`, fail-closed; constancy comes only from
 *  rebaseGateFromTrajectory (the -b3a scan). Used by rebaseForMint as the no-trajectory fallback in main(). */
export function rebaseGateFromMint(mint: MintReadout): RebaseGate {
  void mint; // the current readout alone cannot establish constancy (C-1); kept in the signature for callers
  return { status: "unverified", residue: "rebase_unverified" };
}

/** C-G2-1 (fail-closed LIVE wiring): the C-6 rebase gate for a symbol given its CURRENT mint readout, which may
 *  be ABSENT when the getAccountInfo quorum failed (mint undefined). An absent mint is NOT "no gate": both
 *  window bounds are then unread, i.e. `rebaseGate(null, null)` => `rebase_unverified` (the founding sessions
 *  abstain), exactly as a mutable multiplier is. This is the LIVE decision: leaving `rebase` undefined would let
 *  collect() compute a g_t with the default "1" multiplier (fail-open — proven offline by repro-A). collect()
 *  itself STILL treats an ABSENT `rebase` field as "not a founding window" (replay fixtures pass rebase:
 *  undefined by design and compute g_t bit-identically); the fail-closed choice belongs HERE, in the wiring,
 *  not in the pure core, so the replay oracle stays green. */
export function rebaseForMint(mint: MintReadout | undefined): RebaseGate {
  return mint ? rebaseGateFromMint(mint) : rebaseGate(null, null);
}
