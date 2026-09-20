// MONARK Bell — L-1(dec)/L-2/L-3 full-mint CROSS-CHECK of the hybrid rebase trajectory (ADR-T1aii D1-quater, lot
// -b3d-a; checkpoint-1 C-1/C-2/C-5/C-8/C-9/C-10, decision 67). INDEPENDENT counter-verification: re-scan the whole
// body set of a mint via Helius getTransactionsForAddress `full` (asc, bounded filters.slot.lte = the SERIES'
// committed oracle_slot), decode its 43/x events AND its SetAuthority hand-offs, and prove the 43/x set is IDENTICAL
// to the committed hybrid series — equal only removes `pending`; any divergence/incompleteness STOPS (pending kept).
// Pure but for the injected `call`; the network read is one command through the fail-closed budget (--rebase-crosscheck).
//
// SetAuthority layout is [lu] docs/biblio/bell/L-lecture-token2022-setauthority-2026-09-20.md, from
// solana-program/token-2022@714a2ce6 program/src/{instruction.rs,processor.rs,pod_instruction.rs}:
//  · tag byte [0] = 6 (TokenInstruction::SetAuthority — instruction.rs:774 unpack, :918-925 pack; PodTokenInstruction
//    ordinal 6, pod_instruction.rs:63-72; dispatch processor.rs:1700-1710).
//  · [1] = authority_type u8. The ScaledUiAmount extension authority is AuthorityType::ScaledUiAmount = 15
//    (instruction.rs:1177 into(), :1199 from()) — the ONLY instruction that changes ScaledUiAmountConfig.authority
//    (the extension's own sub-instructions are Initialize/UpdateMultiplier only; processor.rs:935-947).
//  · [2..] = new_authority as COption<Pubkey>: presence byte 0 => None (len 3, no key), 1 => Some + 32 bytes (len 35);
//    any other presence byte => Err (pod_instruction.rs:130). Accounts: index 0 = target mint [writable]; index 1 =
//    the CURRENT authority A (simple signer, or a multisig account whose members sign at 2+) — so A ALWAYS appears in
//    the accounts (validate_owner, processor.rs:1937-1973 — key equality checked before the multisig branch), which is
//    what makes the piggyback (scan A's history) structurally complete. CPI is NOT forbidden for this instruction
//    (§E: no in_cpi guard in the mint branch) => the scan MUST walk inner instructions (checkpoint-1 C-9).
//
// KEY HYGIENE (C-10): providerOf/operatorOf only; NEVER a url/key. The mint/authority are PUBLIC base58 (not secrets).
// Raws (the ledger + only the 43/x and SetAuthority candidate bodies) are written OUT of the tree (--out, CA-11).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { operatorOf } from "./operators.ts";
import { MAX_TX_VERSION, type JsonRpcCall } from "./rpc.ts";
import { type TransportFault, BudgetExceededError, statusOf } from "./quorum.ts";
import { providerOf } from "../../sentinel/src/rpc.ts";
import { base58Decode, eventsFromTx, flattenInstructions, keysOfJson, firstTwoDistinctOps, bodyEventKey,
  TOKEN_2022_PROGRAM } from "./rebase-scan.ts";
import { XSTOCKS } from "./pools.ts";
import { normalizeBody } from "./rebase-produce.ts";
import { replayTriplet, type MultiplierEvent } from "./rebase-trajectory.ts";

const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
const asArr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const hex = (b: Uint8Array): string => [...b].map((n) => n.toString(16).padStart(2, "0")).join("");
const sha = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

/** [lu] instruction.rs:774,918-925 — TokenInstruction::SetAuthority tag byte. */
export const SET_AUTHORITY_TAG = 6;
/** [lu] instruction.rs:1177,1199 — AuthorityType::ScaledUiAmount (the ONLY path that changes the scaled-UI authority). */
export const AUTHORITY_TYPE_SCALED_UI = 15;

/** A decoded SetAuthority(ScaledUiAmount) payload, or null when the bytes are not that instruction. `newAuthorityHex`
 *  is the target authority (null = None, i.e. the authority is being REMOVED — definitive, §D). Pure. The presence
 *  byte gates the length exactly (COption<Pubkey>): 0 => 3 bytes, 1 => 35 bytes; any other => not decodable (null). */
export interface DecodedSetAuthority { readonly authorityType: number; readonly newAuthorityHex: string | null }
export function decodeSetAuthority(data: Uint8Array): DecodedSetAuthority | null {
  if (data.length < 3 || data[0] !== SET_AUTHORITY_TAG || data[1] !== AUTHORITY_TYPE_SCALED_UI) return null;
  const presence = data[2];
  if (presence === 0) return data.length === 3 ? { authorityType: data[1], newAuthorityHex: null } : null;
  if (presence === 1) return data.length === 35 ? { authorityType: data[1], newAuthorityHex: hex(data.slice(3, 35)) } : null;
  return null; // any other presence byte => Err(InvalidInstructionData) (pod_instruction.rs:130) => not a decodable hand-off
}

/** One SetAuthority(ScaledUiAmount) hand-off found in a mint's history: the target mint, the NEW authority (null =
 *  removed), and the current authority A (account index 1 — always present, validate_owner). Plain data. */
export interface SetAuthorityHandoff {
  readonly mint: string;
  readonly newAuthorityHex: string | null;
  readonly currentAuthority: string;
  readonly slot: number;
  readonly instructionIndex: number;
  readonly signature: string;
}

/** Decode every SetAuthority(ScaledUiAmount) instruction of ONE json tx that targets a mint in `mints`, top-level
 *  AND CPI (flattenInstructions — the SAME walk as eventsFromTx, C-9). Returns [] when blockTime is null (the caller
 *  marks the page inconclusive, never a silent skip) or none match. Filter: programId == Token-2022 AND tag 6 AND
 *  authority_type 15 AND account0 (target mint, instruction.rs:183) ∈ mints. */
export function setAuthorityHandoffsFromTx(sig: string, slot: number, blockTimeSec: number | null, tx: unknown, mints: readonly string[]): SetAuthorityHandoff[] {
  if (blockTimeSec == null) return [];
  const t = asObj(tx);
  const keys = keysOfJson(t);
  const out: SetAuthorityHandoff[] = [];
  let pos = 0;
  for (const ixRaw of flattenInstructions(t)) {
    const ix = asObj(ixRaw);
    const pid = keys[Number(ix.programIdIndex)];
    const accts = asArr(ix.accounts).map(Number);
    const data = typeof ix.data === "string" ? base58Decode(ix.data) : new Uint8Array();
    const a0 = accts[0], a1 = accts[1];
    const target = a0 !== undefined ? keys[a0] : undefined; // instruction.rs:183: account 0 = the mint whose authority changes
    if (pid === TOKEN_2022_PROGRAM && target !== undefined && mints.includes(target)) {
      const d = decodeSetAuthority(data);
      if (d) out.push({ mint: target, newAuthorityHex: d.newAuthorityHex,
        currentAuthority: a1 !== undefined && keys[a1] !== undefined ? keys[a1] : "", slot, instructionIndex: pos, signature: sig });
    }
    pos += 1;
  }
  return out;
}

// ---- chained page ledger (C-5: each entry commits the previous; corp of only candidate bodies kept out of tree) ----
export const LEDGER_GENESIS = "0".repeat(64);

/** One page's chained ledger entry. `tail_sigs_at_slot_hi` = the signatures at the deepest slot of this page, so a
 *  resume at `slot.gte = slot_hi` can DROP the already-ingested boundary txs (lossless resume, checkpoint-1 C-7 b).
 *  `list_sha256` = sha256 of the canonical `signature|slot` list (form fixed at PLI: rows sorted by (slot asc, sig
 *  asc), joined `signature|slot` per row, `\n`-separated, utf8). `entry_sha256` chains: it hashes prev ++ this. */
export interface LedgerEntry {
  readonly prev_entry_sha256: string;
  readonly page: number;
  readonly slot_lo: number;
  readonly slot_hi: number;
  readonly first_sig: string;
  readonly last_sig: string;
  readonly tx_count: number;
  readonly tail_sigs_at_slot_hi: readonly string[];
  readonly list_sha256: string;
  readonly entry_sha256: string;
}

/** Canonical `signature|slot` list sha of a page's txs (C-5; ordering/separator/encoding fixed here + declared at PLI). */
export function canonicalListSha(txs: readonly { readonly sig: string; readonly slot: number }[]): string {
  const rows = [...txs].sort((a, b) => a.slot - b.slot || (a.sig < b.sig ? -1 : a.sig > b.sig ? 1 : 0)).map((x) => `${x.sig}|${String(x.slot)}`);
  return sha(rows.join("\n"));
}

/** Build the next chained ledger entry from the previous entry's sha and this page's txs. Empty page => null. */
export function chainedLedgerEntry(prevSha: string, page: number, txs: readonly { readonly sig: string; readonly slot: number }[]): LedgerEntry | null {
  if (txs.length === 0) return null;
  const slots = txs.map((x) => x.slot);
  const slot_lo = Math.min(...slots), slot_hi = Math.max(...slots);
  const list_sha256 = canonicalListSha(txs);
  const tail = txs.filter((x) => x.slot === slot_hi).map((x) => x.sig).sort();
  const core = { prev_entry_sha256: prevSha, page, slot_lo, slot_hi, first_sig: txs[0]!.sig, last_sig: txs[txs.length - 1]!.sig,
    tx_count: txs.length, tail_sigs_at_slot_hi: tail, list_sha256 };
  return { ...core, entry_sha256: sha(JSON.stringify(core)) };
}
/** The ledger's chained head sha = the last entry's `entry_sha256` (transitively commits every prior page). */
export function ledgerSha(entries: readonly LedgerEntry[]): string {
  return entries.length ? entries[entries.length - 1]!.entry_sha256 : LEDGER_GENESIS;
}

// ---- full-mint scan (gTfA `full` asc, bounded slot.lte = oracle_slot; resumable; fail-closed budget) --------------
export interface ResumeState {
  readonly resumeFromSlot?: number;            // slot_hi of the last complete page (ledger) — sets filters.slot.gte
  readonly tailSigsAtResumeSlot?: readonly string[]; // sigs already ingested at resumeFromSlot (dedupe by signature)
  // Continuity (C-7 b lossless resume): a resumed scan must carry the prior pages' decoded state, else the run-1
  // Initialize is lost (start anchor fails => false inconclusive), the ledger chains from genesis a SECOND time, and
  // N/pages count only the resumed pages. The CLI persists these per page (ledger-/events-/handoffs-<MINT>.jsonl).
  readonly priorLedger?: readonly LedgerEntry[];
  readonly priorEvents?: readonly MultiplierEvent[];
  readonly priorHandoffs?: readonly SetAuthorityHandoff[];
}
export interface FullMintScan {
  readonly events: MultiplierEvent[];          // 43/x events, bounded slot <= oracle_slot, sorted, quorum-2 re-read
  readonly handoffs: SetAuthorityHandoff[];    // SetAuthority(ScaledUiAmount) hand-offs found (incl. CPI)
  readonly complete: boolean;
  readonly reason?: string;                    // budget_exhausted | not_at_genesis | block_time_null | no_quorum | body_quorum | same_slot_order_undecidable | end_anchor_mismatch | non_monotonic | not_full_pages
  readonly n: number;                          // exact tx count under the bound (sub-product at exhaustion)
  readonly pages: number;
  readonly ledger: LedgerEntry[];
}
/** The scan's out-of-tree sinks (C-5): `onPage` persists each chained ledger entry (per page, so a crash resumes
 *  without under-counting); `onCandidate` (optional) keeps the raw body of a 43/x or SetAuthority candidate — the
 *  ONLY bodies retained (the To-scale full page corpus is discarded after decode). Injected as spies offline. */
export interface ScanSink {
  onPage(entry: LedgerEntry, ledger: readonly LedgerEntry[], pageEvents: readonly MultiplierEvent[], pageHandoffs: readonly SetAuthorityHandoff[]): void;
  onCandidate?(sig: string, body: unknown): void;
}

/** Scan a mint's WHOLE body set via gTfA `full` (asc, bounded slot.lte = oracle_slot), offline via the injected
 *  `call`. Per page: chain a ledger entry + persist via `onPage`; decode 43/x (eventsFromTx) and SetAuthority
 *  (setAuthorityHandoffsFromTx); re-read every 43/x candidate under quorum-2 on op B (bodyEventKey). Resume honours
 *  `resume.resumeFromSlot` (filters.slot.gte) and dedupes the boundary txs. A BudgetExceededError is caught and
 *  reported as `budget_exhausted` (complete=false) — the run STOPS, never presents a capped scan as complete (C-11
 *  spirit, plan L-2). Completeness = pagination exhausted + start anchor (an Initialize decoded) + end anchor (a desc
 *  page at slot.lte = oracle_slot whose newest sig == the asc run's last sig) + slot monotonicity + full pages
 *  (option, default on) + no null blockTime + no body-quorum miss + no same-slot ambiguity (C-8). */
export async function scanFullMint(call: JsonRpcCall, providers: readonly string[], mint: string, oracleSlot: number,
  opts: { readonly maxPages?: number; readonly requireFullPages?: boolean }, resume: ResumeState,
  sink: ScanSink, faults: TransportFault[]): Promise<FullMintScan> {
  const ops = firstTwoDistinctOps(providers);
  if (ops === null) return { events: [], handoffs: [], complete: false, reason: "no_quorum", n: 0, pages: 0, ledger: [] };
  const heliusOp = providers.find((u) => operatorOf(u) === "helius") ?? ops[0]; // gTfA is Helius-exclusive
  const otherOp = providers.find((u) => operatorOf(u) !== "helius") ?? ops[1];
  const maxPages = opts.maxPages ?? 5000;
  const requireFullPages = opts.requireFullPages ?? true;

  // C-7 b: SEED the accumulators from the prior run's persisted state so a resume is lossless (start anchor sees the
  // run-1 Initialize; the ledger keeps ONE chain from genesis; N/pages count every page, not just the resumed ones).
  const events: MultiplierEvent[] = [...(resume.priorEvents ?? [])];
  const handoffs: SetAuthorityHandoff[] = [...(resume.priorHandoffs ?? [])];
  const ledger: LedgerEntry[] = [...(resume.priorLedger ?? [])];
  let prevSha = ledgerSha(ledger), pages = ledger.length, n = ledger.reduce((a, e) => a + e.tx_count, 0);
  let paginationToken: string | undefined;
  let blockTimeNull = false, bodyQuorumFail = false, exhausted = false, notFullPages = false, nonMonotonic = false;
  let lastSlotSeen = -1, ascLastSig = "";
  try {
    while (pages < maxPages) {
      const slotFilter: Record<string, number> = { lte: oracleSlot, ...(resume.resumeFromSlot !== undefined ? { gte: resume.resumeFromSlot } : {}) };
      const params: readonly unknown[] = [mint, { transactionDetails: "full", sortOrder: "asc", limit: 1000, filters: { slot: slotFilter }, ...(paginationToken ? { paginationToken } : {}) }];
      const res = asObj(await call(heliusOp, "getTransactionsForAddress", params));
      const data = asArr(res.data);
      const pageTxs: { sig: string; slot: number }[] = [];
      const pageEvents: MultiplierEvent[] = [];
      const pageHandoffs: SetAuthorityHandoff[] = [];
      for (const body of data) {
        const nb = normalizeBody(body);
        if (nb === null) { blockTimeNull = true; continue; } // C-8: unusable body (null blockTime/slot) => inconclusive, never a skip
        if (nb.blockTime == null) { blockTimeNull = true; continue; }
        // resume dedupe (C-7 b): a boundary tx already ingested at the resume slot is dropped exactly once
        if (resume.resumeFromSlot !== undefined && nb.slot === resume.resumeFromSlot && (resume.tailSigsAtResumeSlot ?? []).includes(nb.sig)) continue;
        if (nb.slot < lastSlotSeen) nonMonotonic = true; // asc order property (measured at the sonde, C-8)
        lastSlotSeen = nb.slot; ascLastSig = nb.sig;
        pageTxs.push({ sig: nb.sig, slot: nb.slot }); // enumerated (in the ledger/N) even if it did not execute
        n += 1;
        if (asObj(asObj(nb.tx).meta).err != null) continue; // C-9: a FAILED tx did not execute its instructions => never decoded
        const hs = setAuthorityHandoffsFromTx(nb.sig, nb.slot, nb.blockTime, nb.tx, [mint]);
        for (const h of hs) pageHandoffs.push(h);
        const evA = eventsFromTx(nb.sig, nb.slot, nb.blockTime, nb.tx, mint);
        if (hs.length > 0 || (evA !== null && evA.length > 0)) sink.onCandidate?.(nb.sig, nb.tx); // C-5: keep only candidate raws
        if (evA === null) { blockTimeNull = true; continue; }
        if (evA.length === 0) continue; // not a 43/x-for-this-mint tx
        let txB: Record<string, unknown>;
        try { txB = asObj(await call(otherOp, "getTransaction", [nb.sig, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "json" }])); }
        catch (e) { if (e instanceof BudgetExceededError) throw e; faults.push({ provider: providerOf(otherOp), status: statusOf(e) }); bodyQuorumFail = true; continue; }
        const evB = eventsFromTx(nb.sig, Number(txB.slot), typeof txB.blockTime === "number" ? txB.blockTime : null, txB, mint);
        if (evB === null || bodyEventKey(mint, evA) !== bodyEventKey(mint, evB)) { bodyQuorumFail = true; continue; }
        pageEvents.push(...evA);
      }
      events.push(...pageEvents); handoffs.push(...pageHandoffs);
      const entry = chainedLedgerEntry(prevSha, pages + 1, pageTxs);
      if (entry) { ledger.push(entry); prevSha = entry.entry_sha256; sink.onPage(entry, ledger, pageEvents, pageHandoffs); }
      pages += 1;
      const next = res.paginationToken;
      if (typeof next !== "string" || next === "" || data.length === 0) { exhausted = true; break; }
      if (data.length < 1000) notFullPages = true; // a short non-final page (C-8: full pages except the last)
      paginationToken = next;
    }
  } catch (e) {
    if (!(e instanceof BudgetExceededError)) throw e; // any non-budget error propagates (fatalMessage scrubs it)
    return { events: sortEvents(events), handoffs, complete: false, reason: "budget_exhausted", n, pages, ledger };
  }
  // end anchor (C-8): one desc page at slot.lte = oracle_slot; its newest sig must equal the asc run's last sig.
  let endAnchorOk = false;
  if (exhausted) {
    const descRes = asObj(await call(heliusOp, "getTransactionsForAddress", [mint, { transactionDetails: "full", sortOrder: "desc", limit: 1, filters: { slot: { lte: oracleSlot } } }]));
    const descTop = normalizeBody(asArr(descRes.data)[0]);
    endAnchorOk = descTop !== null && descTop.sig === ascLastSig;
  }
  const sorted = sortEvents(events);
  const sameSlotAmbiguous = hasSameSlotDiffSig(sorted);
  const startAnchor = sorted.some((e) => e.kind === "initialize");
  const complete = exhausted && startAnchor && endAnchorOk && !nonMonotonic && !blockTimeNull && !bodyQuorumFail
    && !sameSlotAmbiguous && (!requireFullPages || !notFullPages);
  const reason = !exhausted ? "not_at_genesis" : blockTimeNull ? "block_time_null" : bodyQuorumFail ? "body_quorum"
    : sameSlotAmbiguous ? "same_slot_order_undecidable" : nonMonotonic ? "non_monotonic"
    : !startAnchor ? "no_initialize_anchor" : !endAnchorOk ? "end_anchor_mismatch"
    : requireFullPages && notFullPages ? "not_full_pages" : undefined;
  return { events: sorted, handoffs, complete, n, pages, ledger, ...(reason !== undefined ? { reason } : {}) };
}
function sortEvents(events: readonly MultiplierEvent[]): MultiplierEvent[] {
  return [...events].sort((a, b) => a.slot - b.slot || a.instructionIndex - b.instructionIndex);
}
function hasSameSlotDiffSig(events: readonly MultiplierEvent[]): boolean {
  for (let i = 1; i < events.length; i++) { const a = events[i], b = events[i - 1]; if (a && b && a.slot === b.slot && a.signature !== b.signature) return true; }
  return false;
}

// ---- comparator: full-mint == committed hybrid series (three verdicts; symmetric divergence) ----------------------
/** The committed hybrid series subset the comparator consumes (rebase-<MINT>.json). oracle_slot bounds BOTH sides;
 *  oracle_triplet is the C-3 anchor (H5) — the COMMITTED value, NEVER the live state (checkpoint-1 C-2). */
export interface HybridSeries {
  readonly symbol: string;
  readonly oracle_slot: number;
  readonly oracle_triplet: { readonly multiplierBitsHex: string; readonly newMultiplierBitsHex: string; readonly effectiveTimestampSec: number };
  readonly events: readonly MultiplierEvent[];
}
export interface FieldDiff { readonly key: string; readonly field: string; readonly fullmint: string; readonly series: string }
export type CrosscheckVerdict =
  | { readonly verdict: "equal" }
  | { readonly verdict: "divergence"; readonly missingFromFullmint: string[]; readonly missingFromSeries: string[]; readonly fieldDiffs: FieldDiff[] }
  | { readonly verdict: "inconclusive"; readonly reason: string };

/** Identity key of an event for the SYMMETRIC set comparison — bits, effTs, slot, in-tx index, signature, kind. */
function eventKey(e: MultiplierEvent): string {
  return `${e.kind}|${e.multiplierBitsHex}|${String(e.effectiveTimestampSec)}|${String(e.slot)}|${String(e.instructionIndex)}|${e.signature}`;
}

/** compareToHybrid — THREE verdicts (decision 67). `inconclusive` if the full-mint scan is not complete OR its H5
 *  anchor (replayTriplet(events <= oracle_slot) == the series' COMMITTED oracle_triplet, on the BITS) fails — the
 *  live state is NEVER consulted here (C-2: no getAccountInfo), so an UpdateMultiplier AFTER oracle_slot cannot make
 *  a false c3_mismatch. `divergence` if the bounded 43/x sets differ in EITHER direction (symmetric, C-10) or an
 *  appariated event differs on a field. `equal` only when the sets are identical AND H5 holds AND the scan is
 *  complete — the SOLE path that would remove `pending`. BOTH sides are re-bounded to slot <= oracle_slot here
 *  (the load-bearing bound for M4; the server-side slot.lte only saves credits). */
export function compareToHybrid(scan: FullMintScan, series: HybridSeries): CrosscheckVerdict {
  if (!scan.complete) return { verdict: "inconclusive", reason: scan.reason ?? "incomplete" };
  const bound = (evs: readonly MultiplierEvent[]): MultiplierEvent[] => evs.filter((e) => e.slot <= series.oracle_slot);
  const full = bound(scan.events);
  const h5 = replayTriplet(full, Number.MAX_SAFE_INTEGER);
  if (h5 === null || h5.multiplierBitsHex !== series.oracle_triplet.multiplierBitsHex
    || h5.newMultiplierBitsHex !== series.oracle_triplet.newMultiplierBitsHex
    || h5.effectiveTimestampSec !== series.oracle_triplet.effectiveTimestampSec) return { verdict: "inconclusive", reason: "c3_mismatch" };
  const hyb = bound(series.events);
  const fullByKey = new Map(full.map((e) => [eventKey(e), e]));
  const hybByKey = new Map(hyb.map((e) => [eventKey(e), e]));
  const missingFromFullmint = [...hybByKey.keys()].filter((k) => !fullByKey.has(k)); // a series event ABSENT from the full-mint (C-10 sens b)
  const missingFromSeries = [...fullByKey.keys()].filter((k) => !hybByKey.has(k));   // a full-mint event ABSENT from the series (C-10 sens a)
  // fieldDiffs: an event PAIRED on the partial key {slot, signature, instructionIndex} but differing on a compared
  // field (bits/effTs/kind) — the actionable detail for the escalation's error_origin (H2). It is a REFINEMENT of the
  // missing-sets (a field diff already shows there); equal is decided on the missing-sets, so this is diagnostic only.
  const partial = (e: MultiplierEvent): string => `${String(e.slot)}|${e.signature}|${String(e.instructionIndex)}`;
  const hybByPartial = new Map(hyb.map((e) => [partial(e), e]));
  const fieldDiffs: FieldDiff[] = [];
  for (const fe of full) {
    const he = hybByPartial.get(partial(fe));
    if (he !== undefined && eventKey(fe) !== eventKey(he))
      for (const f of ["kind", "multiplierBitsHex", "effectiveTimestampSec"] as const)
        if (String(fe[f]) !== String(he[f])) fieldDiffs.push({ key: partial(fe), field: f, fullmint: String(fe[f]), series: String(he[f]) });
  }
  if (missingFromFullmint.length === 0 && missingFromSeries.length === 0) return { verdict: "equal" };
  return { verdict: "divergence", missingFromFullmint, missingFromSeries, fieldDiffs };
}

// ---- CLI (--rebase-crosscheck; run-guarded main only) -------------------------------------------------------------
/** Load a committed hybrid series (rebase-<MINT>.json) as the comparator's target: oracle_slot + oracle_triplet
 *  (the COMMITTED C-3 anchor, C-2) + events + `method`. Same loader offline (a --series-dir temp) and live (the
 *  fixtures path) — CA-11: the test executes the composition from these files, never a regex on the source. */
export function loadHybridSeries(dir: string, symbol: string): (HybridSeries & { readonly method: string }) | null {
  const path = join(dir, `rebase-${symbol}.json`);
  if (!existsSync(path)) return null;
  const s = JSON.parse(readFileSync(path, "utf8")) as { symbol: string; method: string; oracle_slot: number;
    oracle_triplet: { multiplierBitsHex: string; newMultiplierBitsHex: string; effectiveTimestampSec: number }; events: MultiplierEvent[] };
  return { symbol: s.symbol, method: s.method, oracle_slot: s.oracle_slot,
    oracle_triplet: { multiplierBitsHex: s.oracle_triplet.multiplierBitsHex, newMultiplierBitsHex: s.oracle_triplet.newMultiplierBitsHex, effectiveTimestampSec: s.oracle_triplet.effectiveTimestampSec },
    events: s.events };
}

/** C-1: the prior cumulative `calls_used` from <out>/budget.json (offsets the fail-closed budget on resume). Missing
 *  file => 0 (a fresh run); present-but-malformed => THROW (a corrupt ledger read as 0 would be fail-open). */
export function readPriorCalls(out: string): number {
  const path = resolve(out, "budget.json");
  if (!existsSync(path)) return 0;
  const raw = JSON.parse(readFileSync(path, "utf8")) as { calls_used?: unknown };
  if (typeof raw.calls_used !== "number" || !Number.isFinite(raw.calls_used) || raw.calls_used < 0)
    throw new Error("bell/collect: <out>/budget.json is malformed (calls_used must be a finite >= 0 number, C-1 fail-closed)");
  return raw.calls_used;
}

/** Read a jsonl file as an array of parsed lines (empty when absent). */
function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as T);
}
/** Resume state for a mint from its persisted state (ledger-/events-/handoffs-<MINT>.jsonl): the last ledger entry's
 *  slot_hi + tail sigs for the dedupe, AND the prior decoded ledger/events/handoffs so the resume is LOSSLESS (C-7 b:
 *  the run-1 Initialize is carried => start anchor holds; the ledger stays ONE chain). Missing/empty => {} (fresh). */
function resumeFromLedger(out: string, symbol: string): ResumeState {
  const ledger = readJsonl<LedgerEntry>(resolve(out, `ledger-${symbol}.jsonl`));
  if (ledger.length === 0) return {};
  const last = ledger[ledger.length - 1]!;
  return { resumeFromSlot: last.slot_hi, tailSigsAtResumeSlot: last.tail_sigs_at_slot_hi, priorLedger: ledger,
    priorEvents: readJsonl<MultiplierEvent>(resolve(out, `events-${symbol}.jsonl`)),
    priorHandoffs: readJsonl<SetAuthorityHandoff>(resolve(out, `handoffs-${symbol}.jsonl`)) };
}

/** L-2/L-3 --rebase-crosscheck CLI (invoked by collect main()). Per wanted mint: scan the WHOLE body set (gTfA
 *  `full`, bounded to the SERIES' committed oracle_slot), persist a chained ledger + only candidate raws out of the
 *  tree, compare to the committed series, and write the reduced crosscheck-<MINT>.json + a report. The budget is
 *  cumulative across resumes (readPriorCalls offset) and persisted per page. Domains/counts only, never a url/key. */
export async function runRebaseCrosscheckCli(call: JsonRpcCall, providers: readonly string[], wanted: readonly string[],
  seriesDir: string, out: string, opts: { readonly maxPages?: number; readonly requireFullPages?: boolean }, callsUsed: () => number, maxCalls: number, faults: TransportFault[]): Promise<void> {
  mkdirSync(out, { recursive: true });
  mkdirSync(resolve(out, "candidates"), { recursive: true });
  const perMint: Record<string, unknown> = {};
  for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) {
    const symbol = tok.symbol;
    const series = loadHybridSeries(seriesDir, symbol);
    if (series === null) { perMint[symbol] = { error: "no_committed_series" }; continue; }
    const callsByMethod: Record<string, number> = { getTransactionsForAddress: 0, getTransaction: 0 };
    const counted: JsonRpcCall = (u, m, p) => { callsByMethod[m] = (callsByMethod[m] ?? 0) + 1; return call(u, m, p); };
    const ledgerPath = resolve(out, `ledger-${symbol}.jsonl`), eventsPath = resolve(out, `events-${symbol}.jsonl`), handoffsPath = resolve(out, `handoffs-${symbol}.jsonl`);
    const candidateShas: Record<string, string> = {};
    // Persist per PAGE (C-7 b lossless resume): the chained ledger entry, the page's decoded events + hand-offs, and
    // the cumulative calls_used — so a crash/resume re-seeds the accumulators and cannot under-count or re-chain.
    const sink: ScanSink = {
      onPage: (entry, _ledger, pageEvents, pageHandoffs) => {
        appendFileSync(ledgerPath, JSON.stringify(entry) + "\n");
        for (const e of pageEvents) appendFileSync(eventsPath, JSON.stringify(e) + "\n");
        for (const h of pageHandoffs) appendFileSync(handoffsPath, JSON.stringify(h) + "\n");
        writeFileSync(resolve(out, "budget.json"), JSON.stringify({ calls_used: callsUsed() }));
      },
      onCandidate: (sig, body) => { const b = JSON.stringify(body); candidateShas[sig] = sha(b); writeFileSync(resolve(out, "candidates", `${sig}.json`), b); },
    };
    const scan = await scanFullMint(counted, providers, tok.address, series.oracle_slot, opts, resumeFromLedger(out, symbol), sink, faults);
    writeFileSync(resolve(out, "budget.json"), JSON.stringify({ calls_used: callsUsed() })); // final cumulative (incl. the desc end-anchor call)
    const verdict = compareToHybrid(scan, series);
    const creditsRecomputed = (callsByMethod.getTransactionsForAddress ?? 0) * 10 + (callsByMethod.getTransaction ?? 0);
    const artifact = { oracle_slot: series.oracle_slot, n_exact: scan.n, pages: scan.pages, ledger_sha256: ledgerSha(scan.ledger),
      scan_complete: scan.complete, scan_reason: scan.reason ?? null, events: scan.events, c3_oracle_triplet: series.oracle_triplet,
      comparator_verdict: verdict, calls_by_method: callsByMethod, credits_recomputed: creditsRecomputed, candidate_shas: candidateShas };
    writeFileSync(resolve(out, `crosscheck-${symbol}.json`), JSON.stringify(artifact, null, 2));
    perMint[symbol] = { verdict: verdict.verdict, complete: scan.complete, reason: scan.reason ?? null, n_exact: scan.n, pages: scan.pages, credits_recomputed: creditsRecomputed, handoffs: scan.handoffs.length };
  }
  const report = { generated_at: new Date().toISOString(), operators: [...new Set(providers.map(operatorOf))],
    per_mint: perMint, calls_used: callsUsed(), max_calls: maxCalls };
  writeFileSync(resolve(out, "crosscheck-report.json"), JSON.stringify(report, null, 2));
  process.stdout.write(`bell/rebase-crosscheck operators=${report.operators.join(",")} calls=${String(callsUsed())}/${String(maxCalls)} out=${out}\n`);
}
