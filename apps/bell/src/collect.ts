// MONARK Bell — off-tool collector entrypoint (ADR-B0 D7 O-5, ADR-T1aii D1 lot -a). Env-driven CLI, NEVER
// run in CI (a run-guarded main). The CORE `collect()` is pure: it takes already-read inputs (fills, closes,
// ADV, mint readouts, halt rows — quorum decided by the reader) and returns the digest, state.json body,
// chained timeline, provenance and journal. CI drives it offline on fixtures; the same core runs live.
//
// KEY HYGIENE (C-10, MAST secret-leak): the journal and provenance carry `providerOf` ONLY — never a URL
// (a Helius URL holds ?api-key=<uuid>). The default network call throws `HTTP <status>` with NO url, and the
// quorum records transport faults as {provider,status} (quorum.ts). record.ts:22 / rpc2.ts:136 fold the url
// / the message; NEITHER is reproduced. CA-11: outputs are written OUTSIDE the git tree (--out, default
// F:/tmp/bell-out; main asserts --out is not under the repo root), so nothing is published until T-1b.
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, relative, isAbsolute } from "node:path";
import { XSTOCKS, POOLS, type PoolRef } from "./pools.ts";
import { classifySession, refCloseDateOf, type SessionLabel } from "./sessions.ts";
import { sessionGap, sessionGapRebase, exceeds, vwapDecimal, fixed, GAP_PRECISION } from "./gap.ts";
import { rowsFromCsv, haltDelta, census, haltsSince, type HaltRow } from "./halts.ts";
import { buildDigest, bellSha, assertNoClose, canonical, provenance as makeProvenance,
  type GapEntry, type Provenance, type CashCross } from "./digest.ts";
import { readReferenceCloses, earliestPublishUtc, databentoGet, polygonGet, readCashKeys,
  type PolygonGet, type DatabentoGet } from "./close.ts";
import { newResidualCounts, RESIDUAL_CODES, type Residual, type ResidualCounts } from "./residuals.ts";
import { poolVolumeBase, consolidatedAdv, volumeToAdvRatio } from "./volume.ts";
import { readMintToken2022, porStatus, wrapperStatus, rebaseForMint, rebaseGateFromTrajectory, type MintReadout, type RebaseGate } from "./supply.ts";
import { multiplierAtMs, replayTriplet, decodeStateConfig, type MultiplierEvent } from "./rebase-trajectory.ts";
import { runRebaseScanCli, scaledUiConfigBytes } from "./rebase-scan.ts";
import { runRebaseProduceCli } from "./rebase-produce.ts";
import { runRebaseCrosscheckCli, runDensityProbeCli, readPriorCalls, readPriorByMethod, WORST_CASE_CREDITS_PER_CALL } from "./rebase-crosscheck.ts";
import { runDiscoverCli } from "./discover.ts";
import { quorum2, signaturesSetKey, statusOf, withRetry, NoQuorumError, QuorumDisagreementError, ConcordantRevertError,
  BudgetExceededError, SolRpcError, type JsonRpcCall, type TransportFault } from "./quorum.ts";
import { signaturesUntil, extractPoolSwap, MAX_TX_VERSION, solanaEndpoints, type SigInfo, type SwapFill } from "./rpc.ts";
import { providerOf } from "../../sentinel/src/rpc.ts";
import { operatorOf } from "./operators.ts";
import { liveEthSwaps } from "./ethereum.ts";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** All the per-symbol data the reader gathered (quorum already decided). The core computes facts + residues. */
export interface SymbolInput {
  readonly symbol: string;
  readonly chain: "solana" | "ethereum";
  readonly baseDec: number;
  readonly quoteDec: number;
  readonly fills: readonly SwapFill[];
  readonly fillsResidues: readonly Residual[]; // no_quorum / quorum_sampled from the reader
  readonly quorumCoverage?: number; // sampled-body coverage rate (published with quorum_sampled)
  readonly closeRefBySession: Readonly<Record<string, number>>; // sessionDateET -> close (read, never stored)
  readonly crossBySession?: Readonly<Record<string, CashCross>>; // -b3b C-9: refCloseDate -> cross status (matched/unavailable/mismatch)
  readonly advDailyVolumes: readonly number[]; // prior-month daily share volumes ([2nd] Polygon)
  readonly mint?: MintReadout; // Token-2022 readout (iv)
  readonly porRelayed?: { readonly value: string; readonly updatedAtSec: number };
  readonly rebase?: RebaseGate; // C-6: pool-window multiplier gate (absent = not a founding window, no gate)
}
export interface CollectInput {
  readonly symbols: readonly SymbolInput[];
  readonly haltRows: readonly HaltRow[];
  readonly window: { readonly fromUtcMs: number; readonly toUtcMs: number };
  readonly nowSec: number;
  readonly staleBoundSec: number;
  readonly generatedAt: string; // provenance only (not hashed)
  readonly faults?: readonly TransportFault[]; // transport faults for the journal (providerOf only)
  readonly providers?: readonly string[]; // provider DOMAINS (providerOf), never urls
  readonly closeSource?: string; // C-7/decision 41: names the close provider in provenance (never a value)
  readonly cashRequestDigest?: string; // -b3b C-1/C-7: sha256 of the canonical cash-close request list (no key, no value)
  readonly cashCrossMismatchDays?: readonly string[]; // -b3b: "UNDERLYING:refDate" days that mismatched (provenance detail)
  readonly cashCrossUnavailableDays?: readonly string[]; // -b3b: "UNDERLYING:refDate" days the cross could not run (provenance detail)
}
export interface CollectResult {
  readonly bellSha: string;
  readonly digest: Json;
  readonly state: Json;
  readonly timeline: Json[];
  readonly provenance: Provenance;
  readonly journal: Json;
}

const GENESIS = "0".repeat(64);
/** Append-only chain (Narabi motif M012 D4, unsigned at T-1a-ii): each line carries prev_line_hash = sha256
 *  of the canonical previous line. Tamper-evident; the Ed25519 signature is a T-1b fact (D8). */
export function chainTimeline(records: readonly Json[]): Json[] {
  const out: Json[] = [];
  let prev = GENESIS;
  for (const r of records) {
    const line: { [k: string]: Json } = { ...(r as { [k: string]: Json }), prev_line_hash: prev };
    assertNoClose(line);
    out.push(line);
    prev = createHash("sha256").update(canonical(line)).digest("hex");
  }
  return out;
}

/** Volume of fills in human base units as a fixed-precision decimal (mirrors gap.ts sessionGap.volumeBase). */
function volumeBaseDecimal(fills: readonly SwapFill[], baseDec: number): string {
  const total = poolVolumeBase(fills);
  return fixed((total * 10n ** BigInt(GAP_PRECISION)) / 10n ** BigInt(baseDec), GAP_PRECISION);
}

/** The pure core (ADR-T1aii D1 lot -a). Deterministic: same inputs ⇒ bit-identical bellSha (replay oracle). */
export function collect(input: CollectInput): CollectResult {
  const counts: ResidualCounts = newResidualCounts();
  const bump = (r: Residual): void => { counts[r] += 1; };

  const gapEntries: GapEntry[] = [];
  const volumeEntries: Json[] = [];
  const supplyEntries: Json[] = [];
  const porEntries: Json[] = [];
  const wrapperEntries: Json[] = [];
  const timelineRecords: Json[] = [];

  for (const s of input.symbols) {
    for (const r of s.fillsResidues) bump(r);

    // (i) session gap per session group. Groups are built from the fills, so each has >= 1 fill; a symbol
    // with no fills (and no no_quorum reason) is a no_fill_in_window abstention for the whole window.
    const groups = new Map<string, { session: SessionLabel; regime: string | null; anchor: string; fills: SwapFill[] }>();
    for (const f of s.fills) {
      const cls = classifySession(f.blockTimeUtcMs);
      const key = `${cls.session}|${cls.regime ?? "null"}|${cls.sessionDateET}`;
      const g = groups.get(key) ?? { session: cls.session, regime: cls.regime, anchor: cls.sessionDateET, fills: [] };
      g.fills.push(f);
      groups.set(key, g);
    }
    if (s.fills.length === 0 && !s.fillsResidues.includes("no_quorum")) bump("no_fill_in_window");

    const symGaps: GapEntry[] = [];
    for (const g of [...groups.values()].sort((a, b) => a.anchor.localeCompare(b.anchor) || a.session.localeCompare(b.session))) {
      // C-6: a pool-window whose scaled-UI multiplier was not verified CONSTANT abstains every session
      // (carry the first-hand vwap, never a silently rescaled g_t). Absent gate = not a founding window.
      if (s.rebase?.status === "unverified") {
        bump("rebase_unverified");
        symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: vwapDecimal(g.fills, s.baseDec, s.quoteDec),
          volumeBase: volumeBaseDecimal(g.fills, s.baseDec), n: g.fills.length, abstain: "rebase_unverified" });
        continue;
      }
      // C-7: the reference close is keyed by the session's reference-close DAY (off-hours/after = the anchor day;
      // pre/regular = the prior trading day, avoiding a same-day look-ahead) — never one /prev applied to all.
      const refDate = refCloseDateOf(g.session, g.anchor);
      // -b3b (C-1/C-5/C-9): the Databento close was cross-checked against Massive per reference-close day. A MISMATCH
      // abstains the session with a NAMED residual (never an average, never a silent pick) — checked BEFORE the close
      // lookup so it is distinct from no_close_ref. matched / unavailable carry a per-session marker on the g_t.
      const cross = s.crossBySession?.[refDate];
      if (cross === "mismatch") {
        bump("cash_cross_mismatch");
        symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: vwapDecimal(g.fills, s.baseDec, s.quoteDec),
          volumeBase: volumeBaseDecimal(g.fills, s.baseDec), n: g.fills.length, cash_cross: "mismatch", abstain: "cash_cross_mismatch" });
        continue;
      }
      const close = refDate in s.closeRefBySession ? s.closeRefBySession[refDate] : undefined;
      if (close === undefined || close <= 0) {
        bump("no_close_ref"); // V-7: volume present but no reference close — abstain, carry vwap, never a fake gap
        symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: vwapDecimal(g.fills, s.baseDec, s.quoteDec),
          volumeBase: volumeBaseDecimal(g.fills, s.baseDec), n: g.fills.length, abstain: "no_close_ref" });
        continue;
      }
      if (cross === "unavailable") bump("cash_cross_unavailable"); // C-9 (Q3): cross could not run — publish (interim (a)) + count
      const epu = earliestPublishUtc(refDate); // C-6: publication gate for this session's g_t (16:00 ET refDate + 24 h)
      const xmark: { cash_cross?: CashCross } = cross === "matched" || cross === "unavailable" ? { cash_cross: cross } : {};
      // C-7 (D1-quater): a trajectory_known window, OR a constant window whose multiplier != "1", computes g_t
      // rebase-aware (m divides the base PER FILL: VWAP_share = Σ|q|/Σ(|b|·m)). A constant m == "1" (or no gate)
      // takes the UNCHANGED bigint path so the m=1 digests stay bit-identical to -b1.
      const rb = s.rebase;
      if (rb !== undefined && (rb.status === "trajectory_known" || (rb.status === "constant" && rb.multiplier !== "1"))) {
        let mAt: (ms: number) => number | null;
        // C-10: the gate's named residuals ride ONLY on a trajectory_known gate (constant carries none by construction).
        const gateResiduals: readonly Residual[] = rb.status === "trajectory_known" ? rb.residuals : [];
        if (rb.status === "trajectory_known") { const evs = rb.events; mAt = (ms) => multiplierAtMs(evs, ms)?.value ?? null; }
        else { const mc = Number(rb.multiplier); mAt = () => mc; }
        const rgap = sessionGapRebase(g.fills, close, s.baseDec, s.quoteDec, mAt);
        if ("abstain" in rgap) { bump(rgap.abstain); symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: rgap.vwap, volumeBase: rgap.volumeBase, n: rgap.n, abstain: rgap.abstain }); continue; }
        // C-10 (Q3): count each gate residual PER published trajectory_known session (calque rebase_unverified) + list
        // them on the gap under `rebase_residuals` (hors CLOSE_KEY). PINNED_BELL_SHA is untouched: replay fixtures pass
        // rebase:undefined (never this branch) and a []-residual gate adds no key (gated on .length).
        for (const r of gateResiduals) bump(r);
        symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: rgap.vwap, gT: rgap.gT, volumeBase: rgap.volumeBase, n: rgap.n, multiplierUsed: rgap.multiplierUsed,
          exceed1: exceeds(rgap.gT, 1) ? 1 : 0, exceed2: exceeds(rgap.gT, 2) ? 1 : 0, exceed5: exceeds(rgap.gT, 5) ? 1 : 0, earliest_publish_utc: epu,
          ...(gateResiduals.length ? { rebase_residuals: [...gateResiduals] } : {}), ...xmark });
        continue;
      }
      const gap = sessionGap(g.fills, close, s.baseDec, s.quoteDec);
      if ("abstain" in gap) { bump(gap.abstain); symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: gap.vwap, volumeBase: gap.volumeBase, n: gap.n, abstain: gap.abstain }); continue; }
      symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: gap.vwap, gT: gap.gT, volumeBase: gap.volumeBase, n: gap.n,
        exceed1: exceeds(gap.gT, 1) ? 1 : 0, exceed2: exceeds(gap.gT, 2) ? 1 : 0, exceed5: exceeds(gap.gT, 5) ? 1 : 0, earliest_publish_utc: epu, ...xmark });
    }
    gapEntries.push(...symGaps);

    // (iii) volume vs consolidated ADV — ratio only, ADV never carried (C-6). multiplier != 1 ⇒ unit residue.
    const volumeBaseUnits = poolVolumeBase(s.fills);
    const adv = consolidatedAdv(s.advDailyVolumes);
    const multiplier = s.mint?.multiplier ?? "1";
    let multiplierUnit = Number(multiplier) !== 1;
    if (adv > 0 && s.fills.length > 0) {
      const rr = volumeToAdvRatio(volumeBaseUnits, s.baseDec, adv, multiplier);
      multiplierUnit = multiplierUnit || rr.multiplier_unit;
      volumeEntries.push({ symbol: s.symbol, vol_ratio: rr.vol_ratio, multiplier_unit: multiplierUnit });
    } else {
      volumeEntries.push({ symbol: s.symbol, ratio_computed: false, multiplier_unit: multiplierUnit });
    }
    if (multiplierUnit) bump("multiplier_unit");

    // (iv) supply readout (paused/permanentDelegate read-and-logged, not rendered — T-1b/T-2), PoR, wrappers.
    if (s.mint) {
      supplyEntries.push({ symbol: s.symbol, supply: s.mint.supply, decimals: s.mint.decimals, multiplier: s.mint.multiplier,
        paused: s.mint.paused, permanent_delegate: s.mint.permanentDelegate });
    }
    const por = porStatus(s.symbol, input.nowSec, input.staleBoundSec, s.porRelayed);
    if (por.kind === "unavailable") { bump("por_unavailable"); porEntries.push({ symbol: s.symbol, kind: por.kind, method: por.source.method, note: por.source.note }); }
    else if (por.kind === "stale") { bump("por_stale"); porEntries.push({ symbol: s.symbol, kind: por.kind, age_sec: por.ageSec, method: por.source.method }); }
    else { porEntries.push({ symbol: s.symbol, kind: por.kind, statement: por.statement, method: por.source.method }); }
    const wr = wrapperStatus(s.symbol);
    if (wr.residue) bump(wr.residue);
    wrapperEntries.push({ symbol: s.symbol, contracts: [...wr.contracts], residue: wr.residue ?? "none" });

    // one timeline record per symbol (append-only chain, chained below).
    const cov = s.quorumCoverage;
    timelineRecords.push({ symbol: s.symbol, chain: s.chain, n_fills: s.fills.length, sessions: symGaps.length,
      ...(cov !== undefined ? { quorum_coverage: cov } : {}) });
  }

  // Halt delta (ii) — L-3: joined onto the on-chain leg. Symbol (NYSE) -> underlying -> each token/chain carrying it
  // (TSLA -> TSLAx AND TSLAon); ONE bracket per token/chain, never merged. Row-level residues bump ONCE per ROW;
  // no_fill_in_window is per (row, token). A row whose Symbol has no registered underlying keeps its n=0 position.
  const haltDeltas: Json[] = [];
  const tokensByUnderlying = new Map<string, SymbolInput[]>();
  for (const s of input.symbols) { const u = UNDERLYING[s.symbol]; if (u !== undefined) tokensByUnderlying.set(u, [...(tokensByUnderlying.get(u) ?? []), s]); }
  for (const row of input.haltRows) {
    const toks = tokensByUnderlying.get(row.symbol) ?? [];
    if (toks.length === 0) { for (const r of haltDelta(row, []).residues) bump(r); continue; }
    let rowResiduesDone = false;
    for (const tok of toks) {
      const d = haltDelta(row, tok.fills);
      if (!rowResiduesDone) { for (const r of d.residues) if (r !== "no_fill_in_window") bump(r); rowResiduesDone = true; }
      if (d.residues.includes("no_fill_in_window")) bump("no_fill_in_window");
      haltDeltas.push({ symbol: tok.symbol, chain: tok.chain, reason_family: d.reasonFamily, halt_utc_ms: d.haltUtcMs, resume_utc_ms: d.resumeUtcMs,
        first_fill_after_halt_utc_ms: d.firstFillAfterHaltUtcMs, last_fill_before_resume_utc_ms: d.lastFillBeforeResumeUtcMs, n_fills_in_window: d.nFillsInWindow });
    }
  }
  const cen = census(input.haltRows);
  const haltCensus: Json = { total: cen.total, empty_resume: cen.emptyResume };

  const digest = buildDigest(gapEntries, haltCensus, {
    residuals: counts as unknown as Json, volume: volumeEntries, supply: supplyEntries, por: porEntries, wrapper: wrapperEntries,
  });
  const bellShaHex = bellSha(digest);

  const providers = [...(input.providers ?? [])];
  // V-2 / C-9: distinct OPERATORS behind the quorum (Chainstack's two hosts count as one). providers[] is
  // still logged as providerOf domains (no key); operatorOf only decides the distinct COUNT.
  const providersDistinct = new Set(providers.map(operatorOf)).size;
  const faults = [...(input.faults ?? [])] as unknown as Json;
  // close_source NAMES the cash-close provider (decision 41), never a close value — a non-numeric string, so
  // the close-guard (assertNoClose over the provenance) does not fire on the `close`-containing key.
  // -b3b: cash_request_digest (C-1/C-7, a hex sha — not close-like, passes the guard) + the cross-check day detail
  // (string "UNDERLYING:refDate" lists) travel in the provenance envelope, NOT the hashed digest. The per-session
  // COUNTS live in `residuals` (single counter source); these arrays are traceability detail only.
  const sources: Json = { generated_at: input.generatedAt,
    ...(input.closeSource !== undefined ? { close_source: input.closeSource } : {}),
    ...(input.cashRequestDigest !== undefined ? { cash_request_digest: input.cashRequestDigest } : {}),
    ...(input.cashCrossMismatchDays && input.cashCrossMismatchDays.length ? { cash_cross_mismatch_days: [...input.cashCrossMismatchDays] } : {}),
    ...(input.cashCrossUnavailableDays && input.cashCrossUnavailableDays.length ? { cash_cross_unavailable_days: [...input.cashCrossUnavailableDays] } : {}) };
  const prov = makeProvenance(digest, sources,
    { providers, quorum_required: 2, providers_distinct: providersDistinct, faults }, input.generatedAt);

  const state: Json = { schema: "bell-state-v1", bell_sha: bellShaHex,
    window: { from_utc_ms: input.window.fromUtcMs, to_utc_ms: input.window.toUtcMs }, residuals: counts as unknown as Json, digest,
    ...(haltDeltas.length ? { halt_deltas: haltDeltas } : {}) };
  const timeline = chainTimeline(timelineRecords);
  const journal: Json = { generated_at: input.generatedAt, providers, quorum_required: 2, providers_distinct: providersDistinct, faults,
    residual_total: RESIDUAL_CODES.reduce((a, c) => a + counts[c], 0) };

  return { bellSha: bellShaHex, digest, state, timeline, provenance: prov, journal };
}

// ---- Live wiring (network; run-guarded main only, NOT run in CI) -----------------------------------------
const UNDERLYING: Readonly<Record<string, string>> = { TSLAx: "TSLA", SPYx: "SPY", NVDAx: "NVDA", AAPLx: "AAPL", TSLAon: "TSLA" };

/** Default Solana JSON-RPC call: throws SolRpcError (code) on a node error and `HTTP <status>` (NO url) on a
 *  transport fault — the url is opaque here, so no ?api-key can leak into a message (C-10). */
export const bellSolanaCall: JsonRpcCall = async (url, method, params) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 30_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
    const json = (await res.json()) as { result?: unknown; error?: { code?: number; message?: string } };
    if (json.error) throw new SolRpcError(json.error.message ?? "rpc error", json.error.code ?? 0);
    return json.result;
  } finally { clearTimeout(to); }
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** C-11 fail-closed RPC budget. Wraps a lower-level call: after `maxCalls` calls, every further call throws
 *  BudgetExceededError (a `bell/collect:` message, surfaced verbatim, exit 1) — the "> 1 M credits / 50 %
 *  quota" stop is now machine-enforced, not a human rule. Pure/injectable: the oracle drives it offline. */
export function makeBudgetedCall(maxCalls: number, inner: JsonRpcCall, priorCalls = 0, maxCredits = Infinity, priorByMethod: Readonly<Record<string, number>> = {}): { call: JsonRpcCall; calls: () => number; credits: () => number; tick: () => void; callsByMethod: () => Record<string, number> } {
  let n = priorCalls; // C-1 (-b3d): a cross-process resume offsets the counter by the prior cumulative calls_used
  const byMethod: Record<string, number> = { ...priorByMethod }; // C-B-3 (V-3): per-method count, cumulative + seeded on resume
  const guard = (m?: string): void => {
    if (n >= maxCalls) throw new BudgetExceededError(`bell/collect: --max-calls budget of ${String(maxCalls)} exceeded (C-11 fail-closed)`);
    // C-G2-1: the SAME counter, expressed in WORST-CASE credits (every call = gTfA 10 cr), is capped fail-closed in
    // the SAME unit as the 6.5 M plafond — so a calls-vs-credits confusion cannot overspend (probe 150 calls = 1500 cr).
    if ((n + 1) * WORST_CASE_CREDITS_PER_CALL > maxCredits) throw new BudgetExceededError(`bell/collect: --max-credits budget of ${String(maxCredits)} worst-case credits exceeded (C-G2-1 fail-closed; 1 call = ${String(WORST_CASE_CREDITS_PER_CALL)} cr worst case)`);
    n += 1;
    // C-B-3 (V-3 fix): count the method HERE — same instruction as `n += 1`, AFTER both throw-checks — so a
    // budget_exhausted throw is NEVER counted and the invariant Σ callsByMethod == calls_used holds on that path too
    // (the old rebase-crosscheck `counted` wrapper incremented BEFORE the guard => Σ = calls_used + 1 at exhaustion).
    if (m !== undefined) byMethod[m] = (byMethod[m] ?? 0) + 1;
  };
  const call: JsonRpcCall = (u, m, p) => {
    try { guard(m); } catch (e) { return Promise.reject(e instanceof Error ? e : new Error(String(e))); }
    return inner(u, m, p);
  };
  // C-G2-7 (-b3b): the cash-close leg (Databento + Massive) folds into the SAME budget — a non-JsonRpcCall GET
  // ticks the counter before it fires, so the fail-closed stop covers every paid read, not just Solana RPC.
  const tick = (): void => { guard(); };
  return { call, calls: () => n, credits: () => n * WORST_CASE_CREDITS_PER_CALL, tick, callsByMethod: () => ({ ...byMethod }) };
}

/** Live Solana fills for a pool with quorum (C-1): the signature SET must concord across 2 providers; bodies
 *  are quorum-sampled every N and fetched single-provider otherwise (deterministic sample; coverage published
 *  with quorum_sampled). Fewer than 2 distinct providers ⇒ no_quorum for the whole symbol. */
async function liveSolanaFills(call: JsonRpcCall, providers: readonly string[], pool: PoolRef, fromSec: number, toSec: number,
  opts: { maxPages: number; bodySample: number }, faults: TransportFault[]): Promise<{ fills: SwapFill[]; residues: Residual[]; coverage: number }> {
  const vault = pool.vaultBase;
  if (vault === undefined) return { fills: [], residues: ["no_quorum"], coverage: 0 };
  let sigList: SigInfo[];
  try {
    // Concord on the WINDOWED set (not the racy live tail): filter each provider's enumeration to
    // [fromSec, toSec] BEFORE hashing, so two providers agree on a settled window (C-1).
    sigList = await quorum2(`sigs:${pool.baseSymbol}`, providers, call,
      (c, u) => signaturesUntil(c, u, vault, fromSec, { maxPages: opts.maxPages })
        .then((list) => list.filter((s) => s.err == null && s.blockTime != null && s.blockTime >= fromSec && s.blockTime <= toSec)),
      (list) => signaturesSetKey(list.map((s) => s.signature)), faults);
  } catch (e) {
    if (e instanceof NoQuorumError || e instanceof QuorumDisagreementError) return { fills: [], residues: ["no_quorum"], coverage: 0 };
    throw e;
  }
  const inWin = sigList.filter((s) => s.err == null && s.blockTime != null && s.blockTime >= fromSec && s.blockTime <= toSec);
  const primary = providers[0] ?? ""; // fastest provider first (Helius 50 req/s) for single-provider bodies
  const fills: SwapFill[] = [];
  const seen = new Set<string>();
  let sampled = 0;
  for (let i = 0; i < inWin.length; i++) {
    const s = inWin[i];
    if (s === undefined || s.blockTime == null || seen.has(s.signature)) continue;
    seen.add(s.signature);
    const bt = s.blockTime;
    const sig = s.signature;
    const bodyParams: readonly unknown[] = [sig, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "jsonParsed" }];
    let fill: SwapFill | null = null;
    try {
      if (opts.bodySample > 0 && i % opts.bodySample === 0) {
        fill = await quorum2(`body:${sig.slice(0, 8)}`, providers, call, (c, u) => c(u, "getTransaction", bodyParams).then((tx) => extractPoolSwap(sig, bt, tx, pool)),
          (f) => (f ? `${String(f.baseDelta)}|${String(f.quoteDelta)}` : "null"), faults);
        sampled++;
      } else {
        fill = extractPoolSwap(sig, bt, await withRetry(() => call(primary, "getTransaction", bodyParams)), pool);
      }
    } catch (e) {
      if (e instanceof BudgetExceededError) throw e; // C-11: budget stop is fatal, never a swallowed coverage gap
      // a body we could not read (rate/transport) or a quorum miss on a sampled body: SKIP it (a coverage
      // gap, published via quorum_sampled), never fatal. Record the fault (providerOf/status, no url).
      if (!(e instanceof NoQuorumError || e instanceof QuorumDisagreementError)) faults.push({ provider: providerOf(primary), status: statusOf(e) });
      continue;
    }
    if (fill) fills.push(fill);
  }
  const residues: Residual[] = [];
  const coverage = inWin.length ? sampled / inWin.length : 1;
  if (sampled < inWin.length) residues.push("quorum_sampled");
  return { fills, residues, coverage };
}

/** C-7: the distinct reference-close DAYS across a set of fills (per session, look-ahead-safe via
 *  refCloseDateOf). Sorted for determinism. Pure — the oracle asserts a pre/regular fill maps to the prior
 *  trading day and an off-hours fill to its own anchor day. */
export function refCloseDatesForFills(fills: readonly SwapFill[]): string[] {
  const set = new Set<string>();
  for (const f of fills) { const c = classifySession(f.blockTimeUtcMs); set.add(refCloseDateOf(c.session, c.sessionDateET)); }
  return [...set].sort();
}

/** Massive (Polygon.io, renamed 2025-10-30) prior-month daily SHARE volumes for an underlying (the ADV denominator
 *  of fact (iii)). -b3b: the reference CLOSE moved to close.ts `readReferenceCloses` (Databento EQUS.SUMMARY +
 *  Massive cross), so this leg no longer reads per-day closes — no double Polygon close fetch. Values are READ,
 *  never stored in an output (C-6). Key in the Authorization header, never the url (C-10). `get` is injectable. */
async function advVolumes(underlying: string, polygonKey: string, toUtcMs: number,
  faults: TransportFault[], get: PolygonGet = polygonGet): Promise<number[]> {
  if (!polygonKey) return [];
  try {
    const to = new Date(toUtcMs), from = new Date(toUtcMs - 45 * 86_400_000);
    const fmt = (d: Date): string => d.toISOString().slice(0, 10);
    const bars = await withRetry(() => get(`/v2/aggs/ticker/${underlying}/range/1/day/${fmt(from)}/${fmt(to)}?adjusted=true&sort=asc&limit=60`, polygonKey));
    return (bars.results ?? []).map((r) => r.v ?? 0).filter((v) => v > 0);
  } catch (e) { faults.push({ provider: "polygon.io", status: statusOf(e) }); return []; }
}

/** A stable identity key of a mint account for the quorum (supply drifts, so key the fields that do not). */
function mintKey(result: unknown): Json {
  const m = readMintToken2022(result, "");
  return { decimals: m.decimals, multiplier: m.multiplier, permanent_delegate: m.permanentDelegate };
}

function argOf(argv: readonly string[], k: string): string | undefined { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; }

/** V-1 (O-2): parse + VALIDATE the operator CLI, fail-closed. An unknown --pools symbol, a NaN/negative
 *  numeric, or --eth+TSLAon without a valid block range throws `bell/collect: …`; main() surfaces that
 *  message verbatim (V-3). Pure for a fixed nowMs (the only clock input), so the parse is replay-testable. */
export function parseArgs(argv: readonly string[], knownSymbols: readonly string[], nowMs = Date.now()) {
  const num = (k: string, def: number): number => {
    const raw = argOf(argv, k);
    if (raw === undefined) return def;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) throw new Error(`bell/collect: invalid numeric ${k}='${raw}' (need a finite value >= 0)`);
    return n;
  };
  const wanted = (argOf(argv, "--pools") ?? "TSLAx").split(",").map((x) => x.trim()).filter(Boolean);
  for (const w of wanted) if (!knownSymbols.includes(w)) throw new Error(`bell/collect: unknown pool symbol '${w}' (known: ${knownSymbols.join(", ")})`);
  const toUtcMs = num("--to-utc", nowMs);
  const windowDays = num("--window-days", 3);
  const fromUtcMs = num("--from-utc", toUtcMs - windowDays * 86_400_000);
  const maxPages = num("--max-pages", 3), bodySample = num("--body-sample", 5), minInterval = num("--min-interval", 250);
  const eth = argv.includes("--eth"), ethFrom = num("--eth-from-block", 0), ethTo = num("--eth-to-block", 0);
  if (eth && wanted.includes("TSLAon") && !(ethFrom > 0 && ethTo >= ethFrom))
    throw new Error("bell/collect: --eth with TSLAon needs --eth-from-block > 0 and --eth-to-block >= --eth-from-block");
  // C-11 (budget fail-closed): --max-calls is REQUIRED and must be > 0 — the "> 1 M credits / 50 % quota"
  // stop ceases to be a human rule. Checked LAST so a bad pool/numeric/eth arg surfaces its own error first.
  // O-12: num() already rejects Infinity/NaN/negative; the > 0 check rejects an explicit 0.
  if (argOf(argv, "--max-calls") === undefined) throw new Error("bell/collect: --max-calls is required (fail-closed RPC budget, C-11; e.g. --max-calls 200000)");
  const maxCalls = num("--max-calls", 0);
  if (!(maxCalls > 0)) throw new Error("bell/collect: --max-calls must be > 0 (C-11/O-12 fail-closed budget)");
  // C-G2-1: --rebase-crosscheck meters a paid draw against the 6.5 M plafond, which is stated in CREDITS. --max-credits
  // (worst-case, gTfA 10 cr/call) is REQUIRED for it and enforced fail-closed IN ADDITION to --max-calls, so the
  // calls-vs-credits confusion (writing 1500 where 150 was meant) is unrepresentable. Other branches keep Infinity.
  const rebaseCrosscheck = argv.includes("--rebase-crosscheck");
  // L-b1b-1 (fact 11): --rebase-density (the H6 sonde helper) meters a paid probe against the SAME 6.5 M-credit
  // plafond, so it requires --max-credits too. It does NOT require --max-pages (a distinct, decoupled mode: it fetches
  // exactly 1 page per sample point, never the draw's page-bounded pagination), so the --max-pages gate below is left
  // keyed on rebaseCrosscheck alone.
  const rebaseDensity = argv.includes("--rebase-density");
  if ((rebaseCrosscheck || rebaseDensity) && argOf(argv, "--max-credits") === undefined)
    throw new Error("bell/collect: --rebase-crosscheck/--rebase-density requires --max-credits (worst-case credits, C-G2-1; e.g. --max-credits 6497500 for the draw, 1500 for the probe)");
  const maxCredits = argOf(argv, "--max-credits") === undefined ? Infinity : num("--max-credits", 0);
  if (argOf(argv, "--max-credits") !== undefined && !(maxCredits > 0)) throw new Error("bell/collect: --max-credits must be > 0 (C-G2-1 fail-closed budget)");
  // C-G2D-1: a MISSING --max-pages defaults to 3 (the probe/discover default) => the crosscheck stops at 3 pages =>
  // not_at_genesis => inconclusive at EVERY invocation (a real mint is 100000s of pages), never completing a draw. So
  // --max-pages is REQUIRED (same idiom as --max-credits) + must be > 0. Draw --max-pages 649750 (= --max-calls; pages
  // <= gTfA calls => never binds before the budget); probe 1. Checked AFTER --max-credits so that error surfaces first.
  if (rebaseCrosscheck && argOf(argv, "--max-pages") === undefined)
    throw new Error("bell/collect: --rebase-crosscheck requires --max-pages (else it defaults to 3 and never reaches genesis, C-G2D-1; e.g. --max-pages 649750 for the draw, 1 for the probe)");
  if (rebaseCrosscheck && !(maxPages > 0)) throw new Error("bell/collect: --max-pages must be > 0 (C-G2D-1 fail-closed; a 0 bound never scans a page)");
  // C-10 (D1-quater): --rebase-trajectory <file> feeds a scanned per-mint trajectory to the gate (the g_t
  // rebase-aware path is then CONSUMED by main(), not just fixtures). --rebase-scan runs the scan/probe mode.
  // C-8 (L-3): --rebase-produce runs the in-repo authority scanner (needs --authority <base58>) that WRITES the
  // trajectory file --rebase-trajectory then consumes — the real run is one command through the same budget.
  return { out: argOf(argv, "--out") ?? "F:/tmp/bell-out", toUtcMs, fromUtcMs,
    wanted, maxPages, bodySample, minInterval, eth, ethFrom, ethTo, maxCalls, maxCredits,
    rebaseScan: argv.includes("--rebase-scan"), rebaseTrajectory: argOf(argv, "--rebase-trajectory"),
    rebaseProduce: argv.includes("--rebase-produce"), authority: argOf(argv, "--authority"),
    rebaseCrosscheck, rebaseDensity, seriesDir: argOf(argv, "--series-dir"),
    allowShortPages: argv.includes("--allow-short-pages"),
    discover: argv.includes("--discover") };
}

/** CA-11 guard (pure, wired in main): a bell --out MUST be OUTSIDE the repo tree. win32 path.resolve keeps
 *  the input's drive-letter case, so the old `resolve(out).startsWith(root)` missed `f:\…` vs `F:\…` and wrote
 *  inside (measured, G2 CA-11a). Compare lowercased + path.relative: "" (out === root) or a rel that is neither
 *  ".."-prefixed nor absolute ⇒ under root ⇒ throw. Lowercasing fail-closes a pathological case-sensitive-posix
 *  collision — the safe direction for a CA-11 guard (this runs only in the win32-operator main(), never in CI). */
export function assertOutsideRepo(out: string, repoRoot: string): void {
  const root = resolve(repoRoot).toLowerCase();
  const rel = relative(root, resolve(out).toLowerCase());
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) {
    throw new Error("bell/collect: --out is under the repo root (CA-11: outputs must be OUTSIDE the tree)");
  }
}

/** A scanned per-mint trajectory fed to the gate (D1-quater). `scanComplete` folds the L-2 completeness AND the
 *  C-3 final-state oracle: false => rebase_unverified. `scanMethod` (C-1: REQUIRED, closed enum) names the scan so
 *  the gate carries the method's residuals; a missing/unknown value makes loadTrajectories DROP the entry (an
 *  optional default would be a fail-open, fewer reserves). Plain data (events), so the whole path is offline-testable. */
export interface TrajectoryInput { readonly events: readonly MultiplierEvent[]; readonly scanComplete: boolean; readonly scanMethod: "authority" }

/** L-4 C-3 anchor (C-V-2, C-7): read the mint's ScaledUiAmountConfig base64 under quorum-2 (key on the triplet
 *  bits, calque pinOracleState) and return whether the replayed trajectory's final triplet is bit-identical to the
 *  read state. No Initialize / no_quorum / decode failure / ANY bit divergence => false (fail-closed: the caller
 *  abstains rebase_unverified, never a rescale nor an adjustment of the replay). The comparison is on all THREE
 *  fields (multiplier, new_multiplier, effTs) so a stale file with a post-scan scheduled update is caught. */
async function stateAnchorMatches(call: JsonRpcCall, providers: readonly string[], mint: string,
  events: readonly MultiplierEvent[], faults: TransportFault[]): Promise<boolean> {
  const expected = replayTriplet(events, Number.MAX_SAFE_INTEGER);
  if (expected === null) return false; // no Initialize precedes the read => nothing to anchor => abstain
  let live: { mulBits: string; newBits: string; effTs: number };
  try {
    live = await quorum2(`state:${mint.slice(0, 8)}`, providers, call,
      async (c, u) => {
        const r = await c(u, "getAccountInfo", [mint, { encoding: "base64" }]);
        const data = (r as { value?: { data?: unknown } }).value?.data;
        const b64 = Array.isArray(data) && typeof data[0] === "string" ? data[0] : "";
        const st = decodeStateConfig(scaledUiConfigBytes(Buffer.from(b64, "base64")));
        return { mulBits: st.multiplierBitsHex, newBits: st.newMultiplierBitsHex, effTs: st.effectiveTimestampSec };
      },
      (t) => `${t.mulBits}|${t.newBits}|${String(t.effTs)}`, faults);
  } catch (e) {
    if (e instanceof BudgetExceededError) throw e; // C-11: the budget stop is fatal, never swallowed
    if (e instanceof NoQuorumError || e instanceof QuorumDisagreementError || e instanceof ConcordantRevertError) return false;
    throw e;
  }
  return expected.multiplierBitsHex === live.mulBits && expected.newMultiplierBitsHex === live.newBits && expected.effectiveTimestampSec === live.effTs;
}

/** C-6 (C-V-3): the injectable per-symbol build — one Solana SymbolInput from an injected `call`. main() loops
 *  over it; the offline test drives it with a stub where the mint getAccountInfo makes NO quorum, asserting the
 *  gate is rebase_unverified and collect() yields NO gT. With a scanned `trajectory` the gate is decided by replay
 *  (3 states); WITHOUT one — or when the mint quorum failed (mint absent) — it fails closed to rebase_unverified
 *  (never a g_t on a "1" default, repro-A). Pure but for the injected `call`/`getClose`. */
export async function buildSolanaSymbol(call: JsonRpcCall, providers: readonly string[],
  tok: { readonly symbol: string; readonly address: string; readonly decimals: number }, pool: PoolRef,
  window: { readonly fromSec: number; readonly toSec: number }, toUtcMs: number, polygonKey: string,
  opts: { readonly maxPages: number; readonly bodySample: number }, trajectory: TrajectoryInput | undefined,
  faults: TransportFault[], getAdv: PolygonGet = polygonGet): Promise<SymbolInput> {
  const solved = await liveSolanaFills(call, providers, pool, window.fromSec, window.toSec, opts, faults);
  let mint: MintReadout | undefined;
  const mintResidues: Residual[] = [];
  try {
    const res = await quorum2(`mint:${tok.symbol}`, providers, call, (c, u) => c(u, "getAccountInfo", [tok.address, { encoding: "jsonParsed" }]), (r) => canonical(mintKey(r)), faults);
    mint = readMintToken2022(res, tok.symbol);
  } catch (e) { if (e instanceof NoQuorumError || e instanceof QuorumDisagreementError) mintResidues.push("no_quorum"); else throw e; }
  // C-V-3 / L-4 (C-V-2, C-7): a scanned trajectory is trusted ONLY with a live mint read AND a matching C-3 anchor.
  // `stateAnchorMatches` reads the ScaledUiAmountConfig base64 under quorum-2 and checks replayTriplet(events) == the
  // read triplet ON THE BITS; a stale file (a scheduled update posted after the scan) diverges on newBits/effTs =>
  // NOT anchored => rebase_unverified, never a rescale. The anchor fires ONLY with trajectory + mint (no extra call
  // otherwise, so a no-trajectory build makes exactly the same reads as before). scanMethod rides to the gate (fact 4).
  const anchored = trajectory && mint ? await stateAnchorMatches(call, providers, tok.address, trajectory.events, faults) : false;
  const rebase: RebaseGate = trajectory && mint
    ? (anchored
        ? rebaseGateFromTrajectory(trajectory.events, window.fromSec, window.toSec, trajectory.scanComplete, trajectory.scanMethod)
        : { status: "unverified", residue: "rebase_unverified" })
    : rebaseForMint(mint);
  // -b3b: the reference close is attached later by runMain (Databento cross-checked); here we read only the ADV.
  const advDailyVolumes = await advVolumes(UNDERLYING[tok.symbol] ?? tok.symbol, polygonKey, toUtcMs, faults, getAdv);
  return { symbol: tok.symbol, chain: "solana", baseDec: tok.decimals, quoteDec: 6, fills: solved.fills,
    fillsResidues: [...solved.residues, ...mintResidues], quorumCoverage: solved.coverage, closeRefBySession: {}, advDailyVolumes,
    ...(mint ? { mint } : {}), rebase };
}

/** Load a --rebase-trajectory file (out-of-repo JSON: symbol -> {events, scanComplete, scanMethod}), fail-closed to
 *  {} on a missing/malformed file (every symbol then falls back to rebase_unverified). C-1: an entry is trusted ONLY
 *  when `scanMethod === "authority"` (the closed enum) — a missing/unknown scanMethod (e.g. an unconverted `method`
 *  field) is DROPPED => the symbol falls back to rebase_unverified. Never trusts a partial shape. */
export function loadTrajectories(path: string | undefined): Readonly<Record<string, TrajectoryInput>> {
  if (path === undefined) return {};
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const out: Record<string, TrajectoryInput> = {};
  for (const [sym, v] of Object.entries(raw)) {
    const o = v as { events?: unknown; scanComplete?: unknown; scanMethod?: unknown };
    if (Array.isArray(o.events) && typeof o.scanComplete === "boolean" && o.scanMethod === "authority")
      out[sym] = { events: o.events as MultiplierEvent[], scanComplete: o.scanComplete, scanMethod: "authority" };
  }
  return out;
}

/** C-2 (CA-11): the seams main() needs are injectable so the offline oracle drives the WHOLE composition — read
 *  Solana fills -> read the cash close (Databento EQUS.SUMMARY, cross-checked against Massive) -> collect() ->
 *  write state/provenance — and asserts on the PRODUCED artifacts, never on the source text. main() is a shell. */
export interface RunDeps {
  readonly call: JsonRpcCall;          // raw Solana RPC (wrapped in the budget below); a stub offline
  readonly databentoGet: DatabentoGet; // EQUS.SUMMARY reader (stub offline)
  readonly polygonGet: PolygonGet;     // Massive reader — ADV + close cross (stub offline)
  readonly env: NodeJS.ProcessEnv;     // BELL_SOLANA_RPC / POLYGON_API_KEY / DATABENTO_API_KEY / BELL_HALTS_CSV
  readonly nowMs: number;              // the ONLY clock input (parseArgs default + generatedAt + staleness)
}

export async function runMain(argv: readonly string[], deps: RunDeps): Promise<void> {
  const { out, toUtcMs, fromUtcMs, wanted, maxPages, bodySample, minInterval, eth, ethFrom, ethTo, maxCalls, maxCredits, rebaseScan, rebaseTrajectory, rebaseProduce, authority, rebaseCrosscheck, rebaseDensity, seriesDir, allowShortPages, discover } = parseArgs(argv, POOLS.map((p) => p.baseSymbol), deps.nowMs);
  const repoRoot = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
  assertOutsideRepo(out, repoRoot);

  const solProviders = solanaEndpoints(deps.env);
  // GARDE-HELIUS-1b (C-6): the paid cash keys are read in the ALLOWLISTED cash module (close.ts), never here —
  // collect.ts holds no `env.<paid-key>` read and is never on the scanner allowlist. The values are threaded on.
  const { polygonKey, databentoKey } = readCashKeys(deps.env);
  const faults: TransportFault[] = [];
  // C-11: every Solana RPC call goes through the fail-closed budget (throws BudgetExceededError past --max-calls).
  // C-1 (-b3d): the --rebase-crosscheck branch is RESUMABLE — its budget is offset by the prior cumulative calls_used
  // (<out>/budget.json), so a second process cannot reset the ceiling. Every other branch resumes from 0 (unchanged).
  // L-b1b-1: --rebase-density shares the SAME cumulative budget.json as the crosscheck draw (same --out), so BOTH the
  // calls_used offset AND the per-method global seed resume for it too (else a 2nd density invocation on the same --out
  // would break Σ calls_by_method.global == calls_used — the sonde's 4-invocation pattern, PLI cp-2). The plan's single
  // "priorCalls gate" (fact 11, :589) predates b1a's C-B-3 split into these two lines; both take `|| rebaseDensity`.
  const priorCalls = (rebaseCrosscheck || rebaseDensity) ? readPriorCalls(out) : 0;
  // C-B-3 (V-3): the per-method counter resumes cumulatively too — seed it from budget.json.calls_by_method.global so
  // the artifact's calls_by_method / credits_recomputed track calls_used across resumes (fact 4: else under-counted).
  const priorByMethod = (rebaseCrosscheck || rebaseDensity) ? readPriorByMethod(out) : {};
  // C-G2-1: the worst-case-credits cap (--max-credits) rides the SAME cumulative counter as --max-calls, so a shared
  // --out (probe then draw) bounds probe+draw JOINTLY in the credit unit (Infinity for the non-crosscheck branches).
  const budgeted = makeBudgetedCall(maxCalls, async (u, m, p) => { if (minInterval > 0) await sleep(minInterval); return deps.call(u, m, p); }, priorCalls, maxCredits, priorByMethod);
  const call = budgeted.call;
  // C-G2-7: the cash-close leg (Databento + Massive) folds into the SAME budget — each GET ticks before it fires.
  const budgetedDatabento: DatabentoGet = (path, key) => { budgeted.tick(); return deps.databentoGet(path, key); };
  const budgetedPolygon: PolygonGet = (path, key) => { budgeted.tick(); return deps.polygonGet(path, key); };
  const providerDomains = [...new Set(solProviders.map(providerOf))];

  // L-2 (D1-quater): --rebase-scan runs the multiplier-trajectory scan/probe mode (rebase-scan.ts) and returns;
  // it writes its trajectory + probe out-of-repo (never in the collect digest). The bodies stage is C-V-2-gated.
  if (rebaseScan) { await runRebaseScanCli(call, solProviders, wanted, Math.floor(fromUtcMs / 1000), Math.floor(toUtcMs / 1000), out, { maxPages }, budgeted.calls, maxCalls, faults); return; }
  // L-3 (C-8, D1-sexies): --rebase-produce runs the in-repo authority scanner and WRITES the loadable trajectory
  // file out-of-repo (the C-G2-2 runner is now in-repo, through the budget). --authority is REQUIRED (fail-closed).
  if (rebaseProduce) {
    if (authority === undefined) throw new Error("bell/collect: --rebase-produce needs --authority <base58> (the shared multiplier authority, read on-chain)");
    await runRebaseProduceCli(call, solProviders, wanted, authority, out, { maxPages }, budgeted.calls, maxCalls, faults); return;
  }
  // L-b1b-1 (PLI §3(c)): --rebase-density runs the H6 density sonde (genesis MEASURED + DENSITY_POINTS points/mint) and
  // returns; it writes sonde-report.json + the SHARED budget.json (cumulative global calls_by_method) but NEVER a
  // ledger/crosscheck artifact. Bounded in the credit unit on the SAME budget as the draw, so a shared --out is joint.
  if (rebaseDensity) {
    const dir = seriesDir ?? resolve(repoRoot, "apps/bell/test/fixtures/series/rebase");
    await runDensityProbeCli(call, solProviders, wanted, dir, out, { requireFullPages: !allowShortPages }, budgeted.calls, budgeted.callsByMethod, maxCalls); return;
  }
  // L-2/L-3 (D1-quater, decision 67): --rebase-crosscheck re-scans each wanted mint's WHOLE body set (gTfA `full`,
  // bounded to the committed series' oracle_slot) and compares it to the committed hybrid series (STOP on divergence
  // / incompleteness). Budget cumulative across resumes (readPriorCalls offset). --series-dir defaults to the fixtures.
  if (rebaseCrosscheck) {
    const dir = seriesDir ?? resolve(repoRoot, "apps/bell/test/fixtures/series/rebase");
    await runRebaseCrosscheckCli(call, solProviders, wanted, dir, out, { maxPages, requireFullPages: !allowShortPages }, budgeted.calls, budgeted.callsByMethod, maxCalls, faults); return;
  }
  // L-1 (D1-sexies): --discover samples the founding window (--from-utc/--to-utc) at 3 points, tallies the founding
  // vaults, pairs the quote by owner, confirms quorum-2, and WRITES discovery-<MINT>.json out-of-repo (the served
  // input FOUNDING_POOLS equals, C-4). --max-pages = N pages/point (PLI: 5). One command through the same budget.
  if (discover) { await runDiscoverCli(call, solProviders, wanted, { fromSec: Math.floor(fromUtcMs / 1000), toSec: Math.floor(toUtcMs / 1000) }, out, { pagesPerPoint: maxPages }, budgeted.calls, maxCalls, faults); return; }

  // C-10: a scanned trajectory (out-of-repo file) is CONSUMED here so the g_t rebase-aware path is a real main()
  // path, not a fixture. Absent file => every symbol falls back to rebase_unverified (fail-closed).
  const trajectories = loadTrajectories(rebaseTrajectory);
  const built: SymbolInput[] = [];
  for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) {
    const pool = POOLS.find((pp) => pp.baseSymbol === tok.symbol && pp.chain === "solana");
    if (!pool) continue;
    built.push(await buildSolanaSymbol(call, solProviders, tok, pool,
      { fromSec: Math.floor(fromUtcMs / 1000), toSec: Math.floor(toUtcMs / 1000) }, toUtcMs, polygonKey,
      { maxPages, bodySample }, trajectories[tok.symbol], faults, budgetedPolygon));
  }

  // Ethereum leg (ADR-T1aii D1): Uniswap v3 TSLAon/USDC swaps via makeUkemiPool.getLogsRange (quorum-2),
  // behind --eth with an explicit block range (eth getLogs is block-ranged). Skipped (declared) otherwise.
  if (eth && wanted.includes("TSLAon") && ethFrom > 0 && ethTo >= ethFrom) {
    const ethPool = POOLS.find((pp) => pp.chain === "ethereum" && pp.baseSymbol === "TSLAon");
    if (ethPool) {
      try {
        const ethFills = await liveEthSwaps(ethPool, ethFrom, ethTo);
        const advDailyVolumes = await advVolumes("TSLA", polygonKey, toUtcMs, faults, budgetedPolygon);
        built.push({ symbol: "TSLAon", chain: "ethereum", baseDec: 18, quoteDec: 6, fills: ethFills, fillsResidues: [], closeRefBySession: {}, advDailyVolumes });
      } catch (e) { faults.push({ provider: "ethereum", status: statusOf(e) }); }
    }
  }

  // L-1/L-2: read the cash reference close (Databento EQUS.SUMMARY, decision 53) per reference-close day and
  // cross-check Massive; attach the cross-checked close + per-session marker to each token of the underlying.
  const datesByUnderlying: Record<string, string[]> = {};
  for (const s of built) {
    const u = UNDERLYING[s.symbol] ?? s.symbol;
    const set = new Set(datesByUnderlying[u] ?? []);
    for (const d of refCloseDatesForFills(s.fills)) set.add(d);
    datesByUnderlying[u] = [...set].sort();
  }
  const refCloses = await readReferenceCloses(datesByUnderlying, { databentoGet: budgetedDatabento, polygonGet: budgetedPolygon, databentoKey, polygonKey, faults });
  const symbols: SymbolInput[] = built.map((s) => {
    const u = UNDERLYING[s.symbol] ?? s.symbol;
    return { ...s, closeRefBySession: refCloses.closeByUnderlying[u] ?? {}, crossBySession: refCloses.crossByUnderlying[u] ?? {} };
  });

  const csvPath = deps.env.BELL_HALTS_CSV;
  const haltRows: HaltRow[] = csvPath ? haltsSince(rowsFromCsv(readFileSync(csvPath, "utf8")), Object.values(UNDERLYING), new Date(fromUtcMs).toISOString().slice(0, 10)) : [];
  const result = collect({ symbols, haltRows, window: { fromUtcMs, toUtcMs }, nowSec: Math.floor(deps.nowMs / 1000), staleBoundSec: 26 * 3600,
    generatedAt: new Date(deps.nowMs).toISOString(), faults, providers: providerDomains, closeSource: refCloses.close_source,
    cashRequestDigest: refCloses.cash_request_digest, cashCrossMismatchDays: refCloses.cash_cross_mismatch_days, cashCrossUnavailableDays: refCloses.cash_cross_unavailable_days });

  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, "state.json"), JSON.stringify(result.state, null, 2));
  writeFileSync(resolve(out, "timeline.jsonl"), result.timeline.map((l) => JSON.stringify(l)).join("\n") + "\n");
  writeFileSync(resolve(out, "journal.json"), JSON.stringify(result.journal, null, 2));
  // provenance.json carries close_source (decision 53) + cash_request_digest + providers/quorum — a D9 artifact (out of tree, CA-11).
  writeFileSync(resolve(out, "provenance.json"), JSON.stringify(result.provenance, null, 2));
  process.stdout.write(`bell/collect bell_sha=${result.bellSha} symbols=${String(symbols.length)} calls=${String(budgeted.calls())}/${String(maxCalls)} providers=${providerDomains.join(",")} out=${out}\n`);
}

/** main() is a 3-line shell (C-2): the run-guarded default deps (real network + clock) into runMain. */
async function main(): Promise<void> {
  await runMain(process.argv.slice(2), { call: bellSolanaCall, databentoGet, polygonGet, env: process.env, nowMs: Date.now() });
}

/** V-3: a LOCAL fail-closed error (the `bell/collect:` prefix from parseArgs / assertOutsideRepo) is surfaced
 *  VERBATIM so the operator sees the reason; any other error goes through statusOf, keeping the C-10 scrub so
 *  no url or key can leak from a transport fault. */
export function fatalMessage(e: unknown): string {
  return e instanceof Error && e.message.startsWith("bell/collect:") ? e.message : `FATAL ${e instanceof Error ? statusOf(e) : "error"}`;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => { process.stderr.write(fatalMessage(e) + "\n"); process.exit(1); });
}
