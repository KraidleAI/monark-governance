// MONARK Bell — L-3 authority-scan trajectory PRODUCER (ADR-T1aii D1-sexies, lot -b1-bis-i; checkpoint-1 C-1/C-8,
// Q1=(a) in-repo scanner). Ports the decision-60 hybrid AUTHORITY scan IN-REPO so its output — a per-mint
// {events, scanComplete, scanMethod} file — is CONSUMED by collect main() (loadTrajectories), closing C-V-1
// (the producer was ABSENT at the -b3a gel) and C-G2-2 (the lost out-of-repo runner). Pure but for the injected
// `call`; the network read is one command through the fail-closed budget (main --rebase-produce).
//
// METHOD (PROVENANCE-rebase-course.md l.11-21, decision 60 [lu]): the 43/0 Initialize and every 43/1
// UpdateMultiplier of the four xStocks are emitted by ONE shared update authority (S7vYFF, read on-chain).
// Enumerate that authority with Helius getTransactionsForAddress `full` (MONO-OPERATOR — no Chainstack
// equivalent; the `authority_scan_mono_operator` residual), decode 43/x per wanted mint (eventsFromTx), re-read
// each candidate under quorum-2 on a second operator (bodyEventKey), and anchor per mint on the C-3 oracle
// (replayTriplet == the quorum-2 read ScaledUiAmountConfig, on the f64 BITS). The full-mint body method
// (decision 55) was REFUTED by measurement (~5.34 M credits, ~2900x this scan; A-5: out of -i), NOT ported.
//
// gTfA `full` BODY SHAPE (real-run verification item, PLI): the response `{data, paginationToken}` (params shape
// PROVENANCE-spike l.26) carries per-tx bodies whose EXACT encoding vs a getTransaction `encoding:"json"` body
// (base58 instruction data, F-4) is NOT documented (RESSOURCES-HELIUS l.30 not-stated). eventsFromTx parses the
// json shape; if the live gTfA body differs, NO 43/x is decoded => the per-mint C-3 oracle fails closed
// (scanComplete false), never a silent partial. The offline oracle drives the json shape; live confirmation = PLI item.
//
// KEY HYGIENE (C-10): providerOf/operatorOf only; NEVER a url/key. The authority + mints are PUBLIC base58 (not
// secrets; no_secret_in_repo matches api-key CONTEXT, not base58). Raws written OUT of the tree (--out, CA-11).
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { operatorOf } from "./operators.ts";
import { MAX_TX_VERSION, type JsonRpcCall } from "./rpc.ts";
import { type TransportFault } from "./quorum.ts";
import { XSTOCKS } from "./pools.ts";
import { base58Decode, eventsFromTx, pinOracleState, firstTwoDistinctOps, bodyEventKey } from "./rebase-scan.ts";
import { replayTriplet, type MultiplierEvent } from "./rebase-trajectory.ts";

const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
const asArr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const hex = (b: Uint8Array): string => [...b].map((n) => n.toString(16).padStart(2, "0")).join("");

/** C-1: the committed CLOSED map from a scan `method` identity to the `scanMethod` enum. The producer NEVER tests
 *  a substring of `method`; an unmapped method has NO scanMethod (fail-closed — loadTrajectories then ignores the
 *  entry => rebase_unverified). The four -b3a series carry this exact `method` string (rebase-SPYx.json:4). */
export const SCAN_METHOD_MAP: Readonly<Record<string, "authority">> = {
  // The four -b3a series carry the `pending` label until the -b3d full-mint cross-check reaches `equal` 4/4 (label
  // KEPT until then, checkpoint-1 C-13). The RATIFIED label (pending removed on `equal`, L-4) maps to the SAME
  // scanMethod enum — the cross-check is a provenance attestation, not a new scan method (Q4 = "authority" unchanged).
  // Both coexist so the producer loads either the pending or the ratified series with no re-pin (bell_series_method_maps_to_authority).
  "hybrid-authority-scan (pending R-26 ratification)": "authority",
  "hybrid-authority-scan": "authority",
};
export function scanMethodFromMethod(method: string): "authority" | undefined { return SCAN_METHOD_MAP[method]; }
/** The producer's own method identity (decision 60, pending R-26 ratification — carried verbatim by the series). */
export const HYBRID_AUTHORITY_METHOD = "hybrid-authority-scan (pending R-26 ratification)";

/** One produced per-mint trajectory (plain data; the offline replay oracle is bit-identical). `readAuthorityHex`
 *  is the on-chain scaledUiAmountConfig authority (hex) READ for this mint — recorded for the invariance witness. */
export interface ProducedTrajectory {
  readonly events: MultiplierEvent[];
  readonly scanComplete: boolean;
  readonly readAuthorityHex: string | null;
  readonly reason?: string;
}

const bySlotIndex = (a: MultiplierEvent, b: MultiplierEvent): number => a.slot - b.slot || a.instructionIndex - b.instructionIndex;

/** Normalize one gTfA `full` body element to {sig, slot, blockTime, tx} for eventsFromTx (which reads the json
 *  message/CPI shape). sig = transaction.signatures[0] (fallback top-level `signature`). Null when unusable.
 *  Exported so the L-2 full-mint scanner (rebase-crosscheck.ts) normalizes gTfA bodies the SAME way (no drift). */
export function normalizeBody(b: unknown): { sig: string; slot: number; blockTime: number | null; tx: unknown } | null {
  const o = asObj(b);
  const sigs = asArr(asObj(o.transaction).signatures);
  const sig = typeof sigs[0] === "string" ? sigs[0] : typeof o.signature === "string" ? o.signature : "";
  const slot = typeof o.slot === "number" ? o.slot : NaN;
  const blockTime = typeof o.blockTime === "number" ? o.blockTime : null;
  if (!sig || !Number.isFinite(slot)) return null;
  return { sig, slot, blockTime, tx: b };
}

/** Enumerate an address's FULL history via Helius getTransactionsForAddress `full` (params shape PROVENANCE-spike
 *  l.26). Paginates on `paginationToken` until null (complete) or `maxPages` (incomplete => fail-closed). Bodies
 *  are accumulated; the credit cost is 10/page [lu] (RESSOURCES-HELIUS l.12). Budget re-thrown (C-11). */
async function gtfaFull(call: JsonRpcCall, url: string, address: string, maxPages: number): Promise<{ bodies: unknown[]; complete: boolean; pages: number }> {
  const bodies: unknown[] = [];
  let paginationToken: string | undefined;
  let pages = 0;
  while (pages < maxPages) {
    const params: readonly unknown[] = [address, { transactionDetails: "full", sortOrder: "asc", limit: 1000, ...(paginationToken ? { paginationToken } : {}) }];
    const res = asObj(await call(url, "getTransactionsForAddress", params));
    const data = asArr(res.data);
    for (const d of data) bodies.push(d);
    pages += 1; // ONE increment per page (the fail-closed capped-enumeration bound must count real pages)
    const next = res.paginationToken;
    if (typeof next !== "string" || next === "" || data.length === 0) return { bodies, complete: true, pages };
    paginationToken = next;
  }
  return { bodies, complete: false, pages }; // maxPages hit before genesis/tail => enumeration incomplete
}

/** Scan the multiplier trajectory of every wanted mint from ONE authority enumeration (offline via injected
 *  `call`). opA (Helius) enumerates the authority via gTfA `full`; opB re-reads each 43/x candidate under quorum-2
 *  (getTransaction json). Per mint: events bounded to slot <= the oracle slot S, replay anchored to the quorum-2
 *  read state on the BITS (C-3), authority-invariance witnessed (mint's on-chain authority == the enumerated one).
 *  Any completeness failure => scanComplete=false + a reason (caller => rebase_unverified). Budget re-thrown. */
export async function produceTrajectories(call: JsonRpcCall, providers: readonly string[], wanted: readonly string[],
  authority: string, opts: { readonly maxPages?: number }, faults: TransportFault[]): Promise<{ perMint: Record<string, ProducedTrajectory>; callsByMethod: Record<string, number> }> {
  const callsByMethod: Record<string, number> = { getTransactionsForAddress: 0, getTransaction: 0, getAccountInfo: 0 };
  const counted: JsonRpcCall = (u, m, p) => { callsByMethod[m] = (callsByMethod[m] ?? 0) + 1; return call(u, m, p); };
  const perMint: Record<string, ProducedTrajectory> = {};
  const ops = firstTwoDistinctOps(providers);
  if (ops === null) {
    for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) perMint[tok.symbol] = { events: [], scanComplete: false, readAuthorityHex: null, reason: "no_quorum" };
    return { perMint, callsByMethod };
  }
  const [opA, opB] = ops;
  // gTfA is HELIUS-EXCLUSIVE: enumerate on Helius regardless of provider order (Chainstack first would die on call 1);
  // the body quorum re-read uses the OTHER operator, and pinOracleState uses both (order-independent).
  const heliusOp = providers.find((u) => operatorOf(u) === "helius") ?? opA;
  const otherOp = providers.find((u) => operatorOf(u) !== "helius") ?? opB;
  const authHex = hex(base58Decode(authority)); // compare the on-chain authority (hex) against the enumerated one
  const en = await gtfaFull(counted, heliusOp, authority, opts.maxPages ?? 5000);
  for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) {
    const mint = tok.address;
    const events: MultiplierEvent[] = [];
    let blockTimeNull = false, bodyQuorumFail = false;
    for (const body of en.bodies) {
      const nb = normalizeBody(body);
      if (nb === null) { blockTimeNull = true; continue; }
      const evA = eventsFromTx(nb.sig, nb.slot, nb.blockTime, nb.tx, mint);
      if (evA === null) { blockTimeNull = true; continue; }
      if (evA.length === 0) continue; // not a 43/x-for-this-mint tx
      const txB = asObj(await counted(otherOp, "getTransaction", [nb.sig, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "json" }]));
      const evB = eventsFromTx(nb.sig, Number(txB.slot), typeof txB.blockTime === "number" ? txB.blockTime : null, txB, mint);
      if (evB === null || bodyEventKey(mint, evA) !== bodyEventKey(mint, evB)) { bodyQuorumFail = true; continue; }
      events.push(...evA);
    }
    const oracle = await pinOracleState(counted, ops, mint, faults);
    const inBand = events.filter((e) => oracle !== null && e.slot <= oracle.S).sort(bySlotIndex);
    const sameSlotAmbiguous = ((): boolean => {
      for (let i = 1; i < inBand.length; i++) { const a = inBand[i], b = inBand[i - 1]; if (a && b && a.slot === b.slot && a.signature !== b.signature) return true; }
      return false;
    })();
    const trip = replayTriplet(inBand, Number.MAX_SAFE_INTEGER);
    const finalStateOk = oracle !== null && trip !== null && trip.multiplierBitsHex === oracle.mulBits && trip.newMultiplierBitsHex === oracle.newBits && trip.effectiveTimestampSec === oracle.effTs;
    const authorityInvariant = oracle !== null && oracle.auth === authHex;
    const scanComplete = en.complete && !blockTimeNull && !bodyQuorumFail && !sameSlotAmbiguous && authorityInvariant && finalStateOk;
    const reason = oracle === null ? "no_quorum_state" : !en.complete ? "enumeration_capped" : blockTimeNull ? "block_time_null" : bodyQuorumFail ? "body_quorum"
      : sameSlotAmbiguous ? "same_slot_order_undecidable" : !authorityInvariant ? "authority_not_invariant" : !finalStateOk ? "state_oracle_divergence" : undefined;
    perMint[tok.symbol] = { events: inBand, scanComplete, readAuthorityHex: oracle?.auth ?? null, ...(reason !== undefined ? { reason } : {}) };
  }
  return { perMint, callsByMethod };
}

/** C-1: write the loadable trajectory file {symbol:{events, scanComplete, scanMethod}} (out-of-repo). `scanMethod`
 *  comes from the committed map (never the raw `method`, never a substring); an unmapped method throws (fail-closed
 *  — a producer misconfiguration is a defect, not a silent empty file). loadTrajectories rejects any entry whose
 *  scanMethod !== "authority" (C-1 fail-closed), so an incomplete or wrong-method scan abstains to rebase_unverified. */
export function writeTrajectoryFile(path: string, method: string, perMint: Readonly<Record<string, ProducedTrajectory>>): void {
  const scanMethod = scanMethodFromMethod(method);
  if (scanMethod === undefined) throw new Error(`bell/rebase-produce: method '${method}' is not in the committed SCAN_METHOD_MAP (C-1 fail-closed)`);
  const obj: Record<string, { events: MultiplierEvent[]; scanComplete: boolean; scanMethod: "authority" }> = {};
  for (const [sym, r] of Object.entries(perMint)) obj[sym] = { events: r.events, scanComplete: r.scanComplete, scanMethod };
  writeFileSync(path, JSON.stringify(obj, null, 2));
}

const sha = (s: string): string => createHash("sha256").update(s).digest("hex");

/** L-3 --rebase-produce CLI (invoked by collect main()). Enumerates the shared authority (--authority, base58,
 *  read on-chain from the -b3a scan), decodes per-mint trajectories, and writes the loadable file + a report
 *  (calls_by_method for A-2, mono-operator declaration) OUT of the tree. Domains/counts only, never a url/key. */
export async function runRebaseProduceCli(call: JsonRpcCall, providers: readonly string[], wanted: readonly string[],
  authority: string, out: string, opts: { readonly maxPages?: number }, callsUsed: () => number, maxCalls: number, faults: TransportFault[]): Promise<void> {
  mkdirSync(out, { recursive: true });
  // Errors propagate to main()'s fatalMessage: a SolRpcError surfaces `FATAL rpc <code>` (the operator sees the node
  // reason), a BudgetExceededError stops the run (C-11). No wrap that would flatten the rpc code to `transport`.
  const { perMint, callsByMethod } = await produceTrajectories(call, providers, wanted, authority, opts, faults);
  const trajPath = resolve(out, "rebase-trajectory.json");
  writeTrajectoryFile(trajPath, HYBRID_AUTHORITY_METHOD, perMint);
  const report = { generated_at: new Date().toISOString(), method: HYBRID_AUTHORITY_METHOD,
    discovery_enumeration: "helius-gtfa-mono-operator", operators: [...new Set(providers.map(operatorOf))],
    per_mint: Object.fromEntries(Object.entries(perMint).map(([s, r]) => [s, { event_count: r.events.length, scan_complete: r.scanComplete, read_authority_hex: r.readAuthorityHex, reason: r.reason ?? null }])),
    calls_by_method: callsByMethod, calls_used: callsUsed(), max_calls: maxCalls };
  const body = JSON.stringify(report, null, 2);
  writeFileSync(resolve(out, "rebase-produce-report.json"), body);
  process.stdout.write(`bell/rebase-produce sha=${sha(body)} operators=${report.operators.join(",")} calls=${String(callsUsed())}/${String(maxCalls)} out=${trajPath}\n`);
}
