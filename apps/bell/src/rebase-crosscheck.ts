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
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { operatorOf } from "./operators.ts";
import { MAX_TX_VERSION, type JsonRpcCall } from "./rpc.ts";
import { type TransportFault, BudgetExceededError, statusOf, withRetry } from "./quorum.ts";
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

/** [lu, G0 fact 2 / CHANTIERS l.122 decision 55] Helius credit tariffs — the SOLE home of the credit unit (C-G2-1/3):
 *  getTransactionsForAddress (gTfA) = 10 cr/call (≤1000 tx), getTransaction = 1 cr. The WORST-CASE per-call rate for
 *  the budget conversion (A-2) is the most expensive method = gTfA = 10 cr; EVERY call (incl. the Chainstack
 *  getTransaction re-read) is metered at this worst case, so `calls × WORST_CASE_CREDITS_PER_CALL ≤ plafond`. The
 *  `--max-credits` fail-closed cap (collect.ts) and `credits_worst_case` (budget.json) are expressed in the SAME unit
 *  as the 6.5 M plafond, so probe/draw commands are written in credits and the calls-vs-credits confusion (C-G2-1) is
 *  unrepresentable. Dropping the ×10 factor reds the C-G2-1 (credits_worst_case / --max-credits) and C-G2-3
 *  (credits_recomputed) assertions — the unit is pinned in exactly one place. */
export const CREDITS_PER_GTFA = 10;
export const CREDITS_PER_GET_TX = 1;
export const WORST_CASE_CREDITS_PER_CALL = CREDITS_PER_GTFA;

/** Helius gTfA `full` page size: the `limit:` asked per page AND the completeness threshold. A page returned with
 *  FEWER *raw* txs than this WHILE a next token exists is a short NON-FINAL page (C-8: full pages except the last). The
 *  test uses the SAME constant, and the check is on the RAW `data.length` (never the post-dedup pageTxs.length) so a
 *  full boundary page deduped on a resume is never falsely flagged. `notFullPages` is thus NOT derived from the ledger
 *  and the §6 core stays 9 fields (no `raw_count`) — the resolution of the checkpoint-1 notFullPages consultation (d). */
export const GTFA_PAGE_LIMIT = 1000;

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

/** The ATOMIC on-disk page record (§6 amended, C-B-7): the chained `LedgerEntry` PLUS the page's decoded payload
 *  (`page_events`/`page_handoffs`, formerly the separate `events-`/`handoffs-<MINT>.jsonl`). ONE `appendFileSync` per
 *  page = a single commit point, closing the fact-7 window where a page committed to the ledger before its events. The
 *  payload is NEVER hashed: `entry_sha256` covers the §6 core alone, so the chain stays re-derivable (verifyLedgerChain). */
export interface LedgerRecord extends LedgerEntry {
  readonly page_events: readonly MultiplierEvent[];
  readonly page_handoffs: readonly SetAuthorityHandoff[];
}

/** C-V-3: RE-DERIVE the chain from the on-disk records, INDEPENDENTLY of the writer — the sole proof that
 *  `ledger_sha256` transitively commits every page (the prior test only checked the field was carried, never
 *  recomputed it, so a mutant dropping `prev_entry_sha256` from the core survived). Each `entry_sha256` is recomputed
 *  as sha(JSON.stringify(core)) over the §6 core ALONE (prev..list_sha256, in the writer's field order), STRIPPING
 *  `page_events`/`page_handoffs`; `prev_entry_sha256` must thread from genesis. The §5 audit (CA-9) calls this on
 *  `ledger-<MINT>.jsonl`. A tampered prev, a re-hash including the payload, or a broken link => { ok:false }. */
export function verifyLedgerChain(entries: readonly LedgerEntry[]): { readonly ok: boolean; readonly headSha: string } {
  let prev = LEDGER_GENESIS;
  for (const e of entries) {
    const core = { prev_entry_sha256: e.prev_entry_sha256, page: e.page, slot_lo: e.slot_lo, slot_hi: e.slot_hi,
      first_sig: e.first_sig, last_sig: e.last_sig, tx_count: e.tx_count, tail_sigs_at_slot_hi: e.tail_sigs_at_slot_hi, list_sha256: e.list_sha256 };
    if (e.prev_entry_sha256 !== prev || sha(JSON.stringify(core)) !== e.entry_sha256) return { ok: false, headSha: prev };
    prev = e.entry_sha256;
  }
  return { ok: true, headSha: prev };
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

/** L-b1a-8 (fact 9): a bounded retry injected into the scan's calls. `method` names the call so the caller can meter
 *  retries_by_method. The OFFLINE default is the identity (no retry, no backoff); production passes `withRetry`. Every
 *  attempt goes through the SAME budgeted `call`, so a retry is counted and can neither exceed the budget nor
 *  double-commit a page. */
export type RetryFn = <T>(fn: () => Promise<T>, method: string) => Promise<T>;

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
  sink: ScanSink, faults: TransportFault[], retry: RetryFn = (fn) => fn()): Promise<FullMintScan> {
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
  let prevSha = ledgerSha(ledger), fetched = ledger.length, n = ledger.reduce((a, e) => a + e.tx_count, 0);
  let paginationToken: string | undefined;
  let exhausted = false;
  // fact 3: `pages` in the artifact is DERIVED from ledger.length (idempotent), so a terminal resume that fetches an
  // empty page does not drift it +1; `fetched` bounds the maxPages loop (counts every fetch, empty pages included).
  // C-B-1 (fact 1 SEMIS): seed the end-anchor cursor from the last committed page so a 0-page terminal resume still
  // reproduces ascLastSig (else the end anchor fails forever). last.last_sig == the last enumerated tx's sig (:142).
  const seed = resume.priorLedger?.at(-1);
  let lastSlotSeen = seed ? seed.slot_hi : -1, ascLastSig = seed ? seed.last_sig : "";
  try {
    while (fetched < maxPages) {
      const slotFilter: Record<string, number> = { lte: oracleSlot, ...(resume.resumeFromSlot !== undefined ? { gte: resume.resumeFromSlot } : {}) };
      const params: readonly unknown[] = [mint, { transactionDetails: "full", sortOrder: "asc", limit: GTFA_PAGE_LIMIT, filters: { slot: slotFilter }, ...(paginationToken ? { paginationToken } : {}) }];
      const res = asObj(await retry(() => call(heliusOp, "getTransactionsForAddress", params), "getTransactionsForAddress"));
      const data = asArr(res.data);
      const pageTxs: { sig: string; slot: number }[] = [];
      const pageEvents: MultiplierEvent[] = [];
      const pageHandoffs: SetAuthorityHandoff[] = [];
      // C-B-1 (option i, ROOT of V-1): a RE-FETCHABLE fault (a dropped/undecodable body, a body-quorum miss, an
      // out-of-order slot) discards the WHOLE page and STOPS — committing its sig without its event, then resuming
      // past it with the process-local flag reset, is exactly the false `equal` (fact 8). A resume re-fetches from the
      // last CLEAN page's slot_hi (a transient fault resolves via the injected retry; a persistent one stays
      // inconclusive => escalate, fail-closed). Never commit page P+1 after a fault on P (that loses P's txs => V-1).
      let pageFault: string | null = null;
      for (const body of data) {
        const nb = normalizeBody(body);
        if (nb === null || nb.blockTime == null) { pageFault = "block_time_null"; break; } // C-8 unusable body => never a skip
        // resume dedupe (C-7 b): a boundary tx already ingested at the resume slot is dropped exactly once
        if (resume.resumeFromSlot !== undefined && nb.slot === resume.resumeFromSlot && (resume.tailSigsAtResumeSlot ?? []).includes(nb.sig)) continue;
        if (nb.slot < lastSlotSeen) { pageFault = "non_monotonic"; break; } // asc order property (measured at the sonde, C-8)
        lastSlotSeen = nb.slot; ascLastSig = nb.sig;
        pageTxs.push({ sig: nb.sig, slot: nb.slot }); // enumerated (in the ledger/N) even if it did not execute
        if (asObj(asObj(nb.tx).meta).err != null) continue; // C-9: a FAILED tx did not execute its instructions => never decoded
        const hs = setAuthorityHandoffsFromTx(nb.sig, nb.slot, nb.blockTime, nb.tx, [mint]);
        for (const h of hs) pageHandoffs.push(h);
        const evA = eventsFromTx(nb.sig, nb.slot, nb.blockTime, nb.tx, mint);
        if (hs.length > 0 || (evA !== null && evA.length > 0)) sink.onCandidate?.(nb.sig, nb.tx); // C-5: keep only candidate raws
        if (evA === null) { pageFault = "block_time_null"; break; }
        if (evA.length === 0) continue; // not a 43/x-for-this-mint tx
        let txB: Record<string, unknown>;
        try { txB = asObj(await retry(() => call(otherOp, "getTransaction", [nb.sig, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "json" }]), "getTransaction")); }
        catch (e) { if (e instanceof BudgetExceededError) throw e; faults.push({ provider: providerOf(otherOp), status: statusOf(e) }); pageFault = "body_quorum"; break; }
        const evB = eventsFromTx(nb.sig, Number(txB.slot), typeof txB.blockTime === "number" ? txB.blockTime : null, txB, mint);
        if (evB === null || bodyEventKey(mint, evA) !== bodyEventKey(mint, evB)) { pageFault = "body_quorum"; break; }
        pageEvents.push(...evA);
      }
      if (pageFault !== null) return { events: sortEvents(events), handoffs, complete: false, reason: pageFault, n, pages: ledger.length, ledger };
      const next = res.paginationToken;
      const finalPage = typeof next !== "string" || next === "" || data.length === 0;
      // C-B-1 (option d, notFullPages): under requireFullPages, a short NON-FINAL page (RAW data.length < GTFA_PAGE_LIMIT,
      // tested BEFORE the boundary dedup) is a re-fetchable completeness fault => NOT committed + STOP (never a sig
      // without proof its page was full). A full boundary page deduped to fewer txs keeps its RAW length = the limit, so
      // a resume never falsely STOPs (the tx_count-based derivation the plan first prescribed WOULD have). A persistent
      // short page stays inconclusive => escalate. --allow-short-pages commits it (offline oracle); the FINAL page (no
      // token) may be short. `notFullPages` is no longer a process-local flag NOR ledger-derived (core §6 stays 9 fields).
      if (requireFullPages && !finalPage && data.length < GTFA_PAGE_LIMIT) return { events: sortEvents(events), handoffs, complete: false, reason: "not_full_pages", n, pages: ledger.length, ledger };
      events.push(...pageEvents); handoffs.push(...pageHandoffs);
      n += pageTxs.length; // only a COMMITTED page counts toward N (a discarded faulted page never does)
      const entry = chainedLedgerEntry(prevSha, ledger.length + 1, pageTxs);
      if (entry) { ledger.push(entry); prevSha = entry.entry_sha256; sink.onPage(entry, ledger, pageEvents, pageHandoffs); }
      fetched += 1;
      if (finalPage) { exhausted = true; break; }
      paginationToken = next;
    }
  } catch (e) {
    if (!(e instanceof BudgetExceededError)) throw e; // any non-budget error propagates (fatalMessage scrubs it)
    return { events: sortEvents(events), handoffs, complete: false, reason: "budget_exhausted", n, pages: ledger.length, ledger };
  }
  // end anchor (C-8): one desc page at slot.lte = oracle_slot; its newest sig must equal the asc run's last sig.
  let endAnchorOk = false;
  if (exhausted) {
    const descRes = asObj(await retry(() => call(heliusOp, "getTransactionsForAddress", [mint, { transactionDetails: "full", sortOrder: "desc", limit: 1, filters: { slot: { lte: oracleSlot } } }]), "getTransactionsForAddress"));
    const descTop = normalizeBody(asArr(descRes.data)[0]);
    endAnchorOk = descTop !== null && descTop.sig === ascLastSig;
  }
  const sorted = sortEvents(events);
  const sameSlotAmbiguous = hasSameSlotDiffSig(sorted);
  const startAnchor = sorted.some((e) => e.kind === "initialize");
  // the FOUR re-fetchable faults (block_time_null / body_quorum / non_monotonic / not_full_pages) now RETURN early
  // (C-B-1), so none can be a lost process-local flag here; only exhaustion + anchors + same-slot gate completeness.
  const complete = exhausted && startAnchor && endAnchorOk && !sameSlotAmbiguous;
  const reason = !exhausted ? "not_at_genesis" : sameSlotAmbiguous ? "same_slot_order_undecidable"
    : !startAnchor ? "no_initialize_anchor" : !endAnchorOk ? "end_anchor_mismatch" : undefined;
  return { events: sorted, handoffs, complete, n, pages: ledger.length, ledger, ...(reason !== undefined ? { reason } : {}) };
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
/** A per-field difference between the full-mint's replayed triplet (H5) and the series' COMMITTED oracle_triplet.
 *  Published on any c3 mismatch (divergence sub-case A OR inconclusive sub-case B) so the verdict is never mute (C-G2-2). */
export interface TripletDiff { readonly field: string; readonly fullmint: string; readonly series: string }
export type CrosscheckVerdict =
  | { readonly verdict: "equal"; readonly fieldDiffs: FieldDiff[] }
  | { readonly verdict: "divergence"; readonly missingFromFullmint: string[]; readonly missingFromSeries: string[]; readonly fieldDiffs: FieldDiff[]; readonly tripletDiff: TripletDiff[] }
  | { readonly verdict: "inconclusive"; readonly reason: string; readonly missingFromFullmint?: string[]; readonly missingFromSeries?: string[]; readonly fieldDiffs?: FieldDiff[]; readonly tripletDiff?: TripletDiff[] };

/** Identity key for the SYMMETRIC set comparison — {slot, signature, kind, bits, effTs}. instructionIndex is RELAXED
 *  OUT (C-G2-7, DEVIATION): the committed series carry a flatten index from a getTransaction body, the full-mint one
 *  from a gTfA-`full` body, and their VALUE-identity across the two RPC methods is NOT establishable offline (the raw
 *  bodies are unarchived). Measured SAFE — the relaxed key is UNIQUE across all 32 committed events (9+11+11+1; same-slot pairs
 *  differ in bits AND effTs), so relaxing introduces no false-equal; an index-only gap is PUBLISHED in fieldDiffs
 *  (never masked), and a residual same-key collision fails closed (relaxed_key_collision). */
function eventKey(e: MultiplierEvent): string {
  return `${String(e.slot)}|${e.signature}|${e.kind}|${e.multiplierBitsHex}|${String(e.effectiveTimestampSec)}`;
}
/** The non-identity fields (instructionIndex, blockTimeSec) that CAN differ between two identity-matched events:
 *  instructionIndex is the relaxed C-G2-7 gap; blockTimeSec is NOT in eventKey yet it drives the replay fold
 *  (tripletUpTo folds on blockTimeSec), so a key-equal set can still fail H5 (C-G2-2 sub-case B) — both are published. */
function nonKeyDiffs(fe: MultiplierEvent, he: MultiplierEvent): FieldDiff[] {
  const out: FieldDiff[] = [];
  for (const f of ["instructionIndex", "blockTimeSec"] as const)
    if (fe[f] !== he[f]) out.push({ key: eventKey(fe), field: f, fullmint: String(fe[f]), series: String(he[f]) });
  return out;
}

/** compareToHybrid — THREE verdicts (decision 67). `inconclusive` if the scan is not complete, if the relaxed key
 *  collides (C-G2-7), or (sub-case B, C-G2-2) if H5 fails while the sets are key-EQUAL. `divergence` if the bounded
 *  43/x sets differ in EITHER direction (symmetric, C-10) — including sub-case A (C-G2-2): sets differ AND H5 fails
 *  (a genuine divergence, never masked as a mute c3_mismatch). `equal` only when the sets are identical AND H5 holds
 *  AND the scan is complete — the SOLE path that would remove `pending`. H5 (replayTriplet(events <= oracle_slot) ==
 *  the series' COMMITTED oracle_triplet, on the BITS) is checked BEFORE the equal decision: eventKey omits
 *  blockTimeSec but the fold uses it, so an "equal sets" shortcut ahead of H5 would return a FALSE equal on a
 *  blockTime-only gap (relecteur). The live state is NEVER consulted (C-2: no getAccountInfo), so an UpdateMultiplier
 *  AFTER oracle_slot cannot make a false c3_mismatch. BOTH sides are re-bounded to slot <= oracle_slot (M4 bound). */
export function compareToHybrid(scan: FullMintScan, series: HybridSeries): CrosscheckVerdict {
  if (!scan.complete) return { verdict: "inconclusive", reason: scan.reason ?? "incomplete" };
  const bound = (evs: readonly MultiplierEvent[]): MultiplierEvent[] => evs.filter((e) => e.slot <= series.oracle_slot);
  const full = bound(scan.events), hyb = bound(series.events);
  const fullByKey = new Map(full.map((e) => [eventKey(e), e]));
  const hybByKey = new Map(hyb.map((e) => [eventKey(e), e]));
  // C-G2-7 structural safety: if the relaxed key collapses two DISTINCT events on either side, the set comparison is
  // unreliable => fail closed, never a silent false equal (measured not to occur on the committed series; a real
  // duplicate 43/1 in one tx would be the trigger).
  if (full.length !== fullByKey.size || hyb.length !== hybByKey.size) return { verdict: "inconclusive", reason: "relaxed_key_collision" };
  const missingFromFullmint = [...hybByKey.keys()].filter((k) => !fullByKey.has(k)); // a series event ABSENT from the full-mint (C-10 sens b)
  const missingFromSeries = [...fullByKey.keys()].filter((k) => !hybByKey.has(k));   // a full-mint event ABSENT from the series (C-10 sens a)
  const setsEqual = missingFromFullmint.length === 0 && missingFromSeries.length === 0;
  // fieldDiffs: instructionIndex + blockTimeSec gaps on IDENTITY-MATCHED events (C-G2-7 index diagnostic + C-G2-2 b
  // blockTime declaration) — published on every verdict so an index/blockTime gap is never mute.
  const fieldDiffs: FieldDiff[] = [];
  for (const [k, fe] of fullByKey) { const he = hybByKey.get(k); if (he !== undefined) fieldDiffs.push(...nonKeyDiffs(fe, he)); }
  const h5 = replayTriplet(full, Number.MAX_SAFE_INTEGER);
  const h5Ok = h5 !== null && h5.multiplierBitsHex === series.oracle_triplet.multiplierBitsHex
    && h5.newMultiplierBitsHex === series.oracle_triplet.newMultiplierBitsHex
    && h5.effectiveTimestampSec === series.oracle_triplet.effectiveTimestampSec;
  if (!h5Ok) {
    const tripletDiff: TripletDiff[] = [];
    const cmp = (field: string, f: string, s: string): void => { if (f !== s) tripletDiff.push({ field, fullmint: f, series: s }); };
    cmp("multiplierBitsHex", h5?.multiplierBitsHex ?? "null", series.oracle_triplet.multiplierBitsHex);
    cmp("newMultiplierBitsHex", h5?.newMultiplierBitsHex ?? "null", series.oracle_triplet.newMultiplierBitsHex);
    cmp("effectiveTimestampSec", String(h5?.effectiveTimestampSec ?? "null"), String(series.oracle_triplet.effectiveTimestampSec));
    // (A, C-G2-2) the sets ALSO differ => a GENUINE divergence, never masked as a mute inconclusive — route as divergence (C-4).
    if (!setsEqual) return { verdict: "divergence", missingFromFullmint, missingFromSeries, fieldDiffs, tripletDiff };
    // (B, C-G2-2) sets key-equal but the replay differs (a blockTimeSec fold gap not carried by eventKey, or a wrong
    // committed oracle) => inconclusive with a DISTINCT reason + the triplet diff + the blockTime gap (fieldDiffs), never mute.
    return { verdict: "inconclusive", reason: "c3_mismatch_sets_equal", missingFromFullmint, missingFromSeries, fieldDiffs, tripletDiff };
  }
  if (setsEqual) {
    // C-G2D-3: `equal` is the SOLE pending-removal path — it must carry ONLY the relaxed instructionIndex gap. A
    // blockTimeSec fieldDiff on identity-matched events (in the fold, not the key) is a data-quality alarm the internal
    // quorum-2 does not catch (bodyEventKey excludes blockTime); H5 can concord by coincidence => publish it and REFUSE
    // equal (inconclusive, escalated at the checkpoint), never a silent pending removal on a blockTime disagreement.
    const outsideIndex = fieldDiffs.filter((d) => d.field !== "instructionIndex");
    if (outsideIndex.length > 0) return { verdict: "inconclusive", reason: "field_diff_outside_index", missingFromFullmint, missingFromSeries, fieldDiffs };
    return { verdict: "equal", fieldDiffs }; // an index-only fieldDiff rides here (C-G2-7): equal set, published gap.
  }
  return { verdict: "divergence", missingFromFullmint, missingFromSeries, fieldDiffs, tripletDiff: [] };
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

/** Total ledger pages on disk across all ledger-<MINT>.jsonl in <out> (non-empty lines; NO JSON.parse — a page costs
 *  >= 1 gTfA call, so this is a lower bound on calls_used, and a corrupt line must not mask the C-G2D-2 tamper check). */
function ledgerPagesOnDisk(out: string): number {
  if (!existsSync(out)) return 0;
  let pages = 0;
  for (const f of readdirSync(out)) if (/^ledger-.*\.jsonl$/.test(f))
    pages += readFileSync(resolve(out, f), "utf8").split("\n").filter((l) => l.trim() !== "").length;
  return pages;
}
/** Any persisted resume state (a ledger-/events-/handoffs-<MINT>.jsonl carrying content) in <out>. */
function hasResumeState(out: string): boolean {
  if (!existsSync(out)) return false;
  return readdirSync(out).some((f) => /^(ledger|events|handoffs)-.*\.jsonl$/.test(f) && readFileSync(resolve(out, f), "utf8").trim() !== "");
}

/** C-1: the prior cumulative `calls_used` from <out>/budget.json (offsets the fail-closed budget on resume). Missing
 *  file => 0 (a fresh run); present-but-malformed => THROW (a corrupt ledger read as 0 would be fail-open). C-G2D-2
 *  binds the budget to the ledger so a decrease is detectable, never a silent reset: (a) resume state present but
 *  budget.json absent is INCOHERENT => throw, never a fresh run; (b) calls_used below the on-disk ledger pages it must
 *  cover (a page = >= 1 gTfA call) is a downward tamper => throw. */
export function readPriorCalls(out: string): number {
  const path = resolve(out, "budget.json");
  if (!existsSync(path)) {
    // (a) fail-closed: a ledger/events/handoffs jsonl with no budget.json is a resume state missing its counter.
    if (hasResumeState(out)) throw new Error("bell/collect: <out> carries ledger/events/handoffs resume state but no budget.json (C-G2D-2 fail-closed: a resume without its cumulative counter is incoherent, never a fresh run)");
    return 0;
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as { calls_used?: unknown };
  if (typeof raw.calls_used !== "number" || !Number.isFinite(raw.calls_used) || raw.calls_used < 0)
    throw new Error("bell/collect: <out>/budget.json is malformed (calls_used must be a finite >= 0 number, C-1 fail-closed)");
  // (b) fail-closed: calls_used must cover every persisted ledger page (a page costs >= 1 gTfA call). A budget.json
  // edited DOWN below the on-disk ledger it must account for is a tamper => throw (the decrease is detectable).
  const ledgerPages = ledgerPagesOnDisk(out);
  if (raw.calls_used < ledgerPages)
    throw new Error(`bell/collect: <out>/budget.json calls_used=${String(raw.calls_used)} is below the ${String(ledgerPages)} ledger pages on disk (C-G2D-2 fail-closed: budget edited below the ledger it must cover)`);
  return raw.calls_used;
}

/** Read a jsonl file as parsed lines. C-B-5 (α): `appendFileSync` is not crash-atomic, so a process kill mid-append
 *  leaves a TORN last line. ONLY the trailing torn line is repairable — it is dropped and the file TRUNCATED to its
 *  last complete line (byte-exact prefix) before any further append, so the queue is the sole legitimate truncation
 *  point. An unreadable line with content AFTER it is fail-closed (throw): a corruption in the body, never silently
 *  skipped, so it cannot end up buried mid-file by a later append. */
function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").split("\n");
  const out: T[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    if (l.trim() === "") continue;
    try { out.push(JSON.parse(l) as T); }
    catch {
      if (lines.slice(i + 1).some((x) => x.trim() !== "")) throw new Error("bell/collect: " + path + " has an unreadable line before its queue (C-B-5 fail-closed: only a trailing torn line is repairable)");
      writeFileSync(path, i > 0 ? lines.slice(0, i).join("\n") + "\n" : ""); // truncate the torn tail (byte-exact prefix)
      break;
    }
  }
  return out;
}
/** Resume state for a mint from its persisted ATOMIC ledger (`ledger-<MINT>.jsonl`, C-B-7): the last record's slot_hi
 *  + tail sigs for the dedupe, AND the prior decoded ledger/events/handoffs (from each record's `page_events`/
 *  `page_handoffs`) so the resume is LOSSLESS (C-7 b: the run-1 Initialize is carried => start anchor holds; the ledger
 *  stays ONE chain). C-B-5 belt: verifyLedgerChain re-derives the chain at EVERY resume; a broken chain (a corruption
 *  past the repaired torn queue) is fail-closed, never resumed onto. Missing/empty => {} (fresh). */
function resumeFromLedger(out: string, symbol: string): ResumeState {
  const records = readJsonl<LedgerRecord>(resolve(out, `ledger-${symbol}.jsonl`));
  if (records.length === 0) return {};
  if (!verifyLedgerChain(records).ok) throw new Error("bell/collect: ledger-" + symbol + ".jsonl chain does not re-derive (C-B-5/C-V-3 fail-closed: a resume onto a broken chain is refused)");
  const last = records[records.length - 1]!;
  return { resumeFromSlot: last.slot_hi, tailSigsAtResumeSlot: last.tail_sigs_at_slot_hi, priorLedger: records,
    priorEvents: records.flatMap((r) => [...r.page_events]), priorHandoffs: records.flatMap((r) => [...r.page_handoffs]) };
}

/** C-B-6: re-derive the C-5 candidate sha-pins for ONE mint from its dedicated subdir `candidates/<MINT>/`, keyed by
 *  signature (the filename stem). Read from disk (not an in-process map) so a terminal 0-page resume still recovers the
 *  pins (the old per-process map wrote `{}` on such a resume), and per-mint so two mints can never mix (a flat readdir
 *  would). Absent subdir => {} (no candidate seen yet). */
function deriveCandidateShas(out: string, symbol: string): Record<string, string> {
  const dir = resolve(out, "candidates", symbol);
  if (!existsSync(dir)) return {};
  const shas: Record<string, string> = {};
  for (const f of readdirSync(dir)) if (f.endsWith(".json")) shas[f.slice(0, -5)] = sha(readFileSync(resolve(dir, f), "utf8"));
  return shas;
}

/** C-B-3 / fact 4: the prior cumulative per-method counts from budget.json.calls_by_method.global (or {} — a fresh run
 *  or a legacy budget.json without the field), so a resumed run continues the count cumulatively (Σ == calls_used and
 *  credits_recomputed is not under-counted after a resume). */
export function readPriorByMethod(out: string): Record<string, number> {
  const path = resolve(out, "budget.json");
  if (!existsSync(path)) return {};
  const g = (JSON.parse(readFileSync(path, "utf8")) as { calls_by_method?: { global?: unknown } }).calls_by_method?.global;
  if (g === null || typeof g !== "object") return {};
  const bm: Record<string, number> = {};
  for (const [k, v] of Object.entries(g)) if (typeof v === "number" && Number.isFinite(v) && v >= 0) bm[k] = v;
  return bm;
}
/** C-B-4 / C-B-7: the prior per-mint call slices + cumulative retries_by_method from budget.json (reseeded so a resume
 *  keeps them cumulative). Missing/legacy => empty. */
function readPriorBudget(out: string): { byMint: Record<string, Record<string, number>>; retries: Record<string, number>; requireFullPages: boolean | undefined } {
  const path = resolve(out, "budget.json");
  if (!existsSync(path)) return { byMint: {}, retries: {}, requireFullPages: undefined };
  const raw = JSON.parse(readFileSync(path, "utf8")) as { calls_by_method?: { by_mint?: unknown }; retries_by_method?: unknown; require_full_pages?: unknown };
  const bm = raw.calls_by_method?.by_mint, rt = raw.retries_by_method;
  return { byMint: bm !== null && typeof bm === "object" ? (bm as Record<string, Record<string, number>>) : {},
    retries: rt !== null && typeof rt === "object" ? (rt as Record<string, number>) : {},
    requireFullPages: typeof raw.require_full_pages === "boolean" ? raw.require_full_pages : undefined };
}
/** L-b1a-8: retry attempts for the DRAW. tries=6 => backoff <= Σ 400·(i+1), i=0..4 = 6.0 s (the wasted final sleep is
 *  skipped, fact 9). A probe / offline run uses the identity retry (no backoff). */
const RETRY_TRIES = 6;

/** L-2/L-3 --rebase-crosscheck CLI (invoked by collect main()). Per wanted mint: scan the WHOLE body set (gTfA `full`,
 *  bounded to the SERIES' committed oracle_slot), persist a chained ATOMIC ledger + only candidate raws out of the
 *  tree, compare to the committed series, and write the reduced crosscheck-<MINT>.json + a report. The budget is
 *  cumulative across resumes (readPriorCalls/readPriorByMethod offset), persisted per page AND in a `finally` (C-B-4),
 *  and a sealed scan_complete:true artifact is NEVER degraded (C-B-2). Domains/counts only, never a url/key. */
export async function runRebaseCrosscheckCli(call: JsonRpcCall, providers: readonly string[], wanted: readonly string[],
  seriesDir: string, out: string, opts: { readonly maxPages?: number; readonly requireFullPages?: boolean },
  callsUsed: () => number, callsByMethod: () => Record<string, number>, maxCalls: number, faults: TransportFault[]): Promise<void> {
  mkdirSync(out, { recursive: true });
  const perMint: Record<string, unknown> = {};
  const prior = readPriorBudget(out);
  const requireFullPages = opts.requireFullPages ?? true;
  // C-B-1 mixed-mode guard (family of C-G2D-2): a ledger's short-page trust depends on the mode it was built under. A
  // resume STRICTER than a prior LOOSER run cannot trust a ledger that may hold a short non-final page committed under
  // --allow-short-pages => fail-closed throw (the reverse — a strict ledger read loosely — stays safe).
  if (prior.requireFullPages === false && requireFullPages)
    throw new Error("bell/collect: <out>/budget.json was written under --allow-short-pages (require_full_pages:false) but this resume is strict (C-B-1 fail-closed: a strict run cannot trust a ledger built loosely)");
  const byMint: Record<string, Record<string, number>> = { ...prior.byMint };
  const retriesByMethod: Record<string, number> = { getTransactionsForAddress: 0, getTransaction: 0, ...prior.retries };
  const gm = (): { getTransactionsForAddress: number; getTransaction: number } => ({ getTransactionsForAddress: 0, getTransaction: 0, ...callsByMethod() }); // global cumulative, both keys present
  const writeBudget = (pages: number): void =>
    writeFileSync(resolve(out, "budget.json"), JSON.stringify({ calls_used: callsUsed(), credits_worst_case: callsUsed() * WORST_CASE_CREDITS_PER_CALL,
      pages, calls_by_method: { global: gm(), by_mint: byMint }, retries_by_method: retriesByMethod, require_full_pages: requireFullPages }));
  for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) {
    const symbol = tok.symbol;
    const series = loadHybridSeries(seriesDir, symbol);
    if (series === null) { perMint[symbol] = { error: "no_committed_series" }; continue; }
    const ledgerPath = resolve(out, `ledger-${symbol}.jsonl`), candidateDir = resolve(out, "candidates", symbol);
    mkdirSync(candidateDir, { recursive: true }); // C-B-6: candidate raws in a per-mint subdir (a flat readdir would mix 2 mints)
    const resume = resumeFromLedger(out, symbol);
    const priorSlice = { getTransactionsForAddress: 0, getTransaction: 0, ...(prior.byMint[symbol] ?? {}) };
    const before = gm(); // snapshot at mint start => the mint's slice = priorSlice + (global now - before), recomputed idempotently
    const setSlice = (): void => { const now = gm(); byMint[symbol] = {
      getTransactionsForAddress: priorSlice.getTransactionsForAddress + (now.getTransactionsForAddress - before.getTransactionsForAddress),
      getTransaction: priorSlice.getTransaction + (now.getTransaction - before.getTransaction) }; };
    // L-b1a-8 retry (fact 9): tries=6, metered into retries_by_method (persisted via the finally, C-B-4). Every attempt
    // goes through the SAME budgeted `call` => counted, and can neither exceed the budget nor double-commit a page.
    const retry: RetryFn = (fn, method) => withRetry(fn, { tries: RETRY_TRIES, onRetry: () => { retriesByMethod[method] = (retriesByMethod[method] ?? 0) + 1; } });
    let lastPages = resume.priorLedger?.length ?? 0;
    const sink: ScanSink = {
      onPage: (entry, ledger, pageEvents, pageHandoffs) => {
        // C-G2D-2/C-G2D-4: counter FIRST (before the ledger append) so a crash in the append window leaves calls_used >=
        // pages (a resume re-fetches; over-count by one, conservative). C-B-7: ONE atomic record per page = a single
        // commit point (closes the fact-7 desync window); entry_sha256 stays over the core alone (verifyLedgerChain).
        lastPages = ledger.length; setSlice(); writeBudget(ledger.length);
        const record: LedgerRecord = { ...entry, page_events: pageEvents, page_handoffs: pageHandoffs };
        appendFileSync(ledgerPath, JSON.stringify(record) + "\n");
      },
      onCandidate: (sig, body) => { writeFileSync(resolve(candidateDir, `${sig}.json`), JSON.stringify(body)); }, // C-B-6: candidate_shas re-derived from this per-mint subdir
    };
    let scan: FullMintScan | undefined;
    try {
      scan = await scanFullMint(call, providers, tok.address, series.oracle_slot, opts, resume, sink, faults, retry);
      const verdict = compareToHybrid(scan, series);
      const g = gm();
      const creditsRecomputed = g.getTransactionsForAddress * CREDITS_PER_GTFA + g.getTransaction * CREDITS_PER_GET_TX;
      const artifact = { oracle_slot: series.oracle_slot, n_exact: scan.n, pages: scan.pages, ledger_sha256: ledgerSha(scan.ledger),
        scan_complete: scan.complete, scan_reason: scan.reason ?? null, events: scan.events, c3_oracle_triplet: series.oracle_triplet,
        comparator_verdict: verdict, calls_by_method: g, credits_recomputed: creditsRecomputed, candidate_shas: deriveCandidateShas(out, symbol),
        // fact 8: the L-5 gate (b2) reads this attestation; `source:"fullmint"` is the only value that closes a residual.
        set_authority_scan: { scanned: scan.complete, authority_change_found: scan.handoffs.length > 0, through_slot: series.oracle_slot, source: "fullmint" } };
      // C-B-2 (V-2): a sealed scan_complete:true artifact is NEVER degraded to false by a mordant relaunch — the sealed
      // file stays byte-identical and the degraded attempt is journaled to a `-attempt` sidecar, never overwriting equal.
      const artifactPath = resolve(out, `crosscheck-${symbol}.json`);
      const sealed = existsSync(artifactPath) && (JSON.parse(readFileSync(artifactPath, "utf8")) as { scan_complete?: boolean }).scan_complete === true;
      writeFileSync(sealed && !scan.complete ? resolve(out, `crosscheck-${symbol}-attempt.json`) : artifactPath, JSON.stringify(artifact, null, 2));
      perMint[symbol] = { verdict: verdict.verdict, complete: scan.complete, reason: scan.reason ?? null, n_exact: scan.n, pages: scan.pages, credits_recomputed: creditsRecomputed, handoffs: scan.handoffs.length };
    } finally {
      setSlice(); writeBudget(scan?.ledger.length ?? lastPages); // C-B-4: budget durable on the error/desc path (retries included)
    }
  }
  const report = { generated_at: new Date().toISOString(), operators: [...new Set(providers.map(operatorOf))],
    per_mint: perMint, calls_used: callsUsed(), max_calls: maxCalls };
  writeFileSync(resolve(out, "crosscheck-report.json"), JSON.stringify(report, null, 2));
  process.stdout.write(`bell/rebase-crosscheck operators=${report.operators.join(",")} calls=${String(callsUsed())}/${String(maxCalls)} out=${out}\n`);
}
