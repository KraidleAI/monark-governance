// MONARK rpc-guard - the durable CYCLE ledger (GARDE-HELIUS task 2). Append-only, CHAINED, env-derived, OUTSIDE the
// working dir. It lives under HELIUS_LEDGER_DIR/<cycle>/ledger.jsonl (decision 114), NEVER under --out (the exact
// inverse of the HELIUS-1 defect universe-cli.ts:77 / universe.ts:147 where the ledger sat in --out and read absent
// as 0). The parent HELIUS_LEDGER_DIR MUST pre-exist (C-8): we create only the <cycle> subdir; a ledger under an
// auto-created parent is a phantom that a wrong path silently reinitialises.
//
// The chaining is a BYTE-IDENTICAL calque of apps/bell/src/rebase-crosscheck.ts:136-148 (locked by
// ledger-format-lock.test.ts): entry_sha256 = sha256(JSON.stringify(core)) with `prev_entry_sha256` as the FIRST
// key of core. The unit is the REQUEST by (op, method); credits are DERIVED. `verifyCycleLedger` is replayed at
// open: a broken chain / unreadable line is fail-closed (throw), NEVER read as 0 (calque readPriorCalls).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import type { AttemptRecord, LedgerSink, Outcome } from "./client.ts";
import { HELIUS_TARIFF_VERSION } from "./tariff.ts";

export const LEDGER_GENESIS = "0".repeat(64);
export const sha256Hex = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

export interface CycleLedgerEntry {
  readonly prev_entry_sha256: string;
  readonly cycle_id: string;
  readonly tariff_version: string;
  readonly by_op_method: Readonly<Record<string, number>>;
  readonly outcome: Outcome;
  readonly credits_derived: number;
  readonly reason?: string;
  readonly entry_sha256: string;
}
type CycleCore = Omit<CycleLedgerEntry, "prev_entry_sha256" | "entry_sha256">;

/** Chain the next entry. entry_sha256 = sha256(JSON.stringify({prev_entry_sha256, ...core})). The prev sha is the
 *  FIRST key, exactly as the reference - this is what the format-lock test pins byte-for-byte. */
export function chainCycleEntry(prevSha: string, core: CycleCore): CycleLedgerEntry {
  const full = { prev_entry_sha256: prevSha, ...core };
  return { ...full, entry_sha256: sha256Hex(JSON.stringify(full)) };
}
/** The chained head = the last entry's sha, or GENESIS for an empty ledger (calque ledgerSha). */
export function ledgerHeadSha(entries: readonly CycleLedgerEntry[]): string {
  return entries.length ? entries[entries.length - 1]!.entry_sha256 : LEDGER_GENESIS;
}
/** Replay the chain: every prev link + every entry_sha256 recomputes, else throw (fail-closed, never read as 0). */
export function verifyCycleLedger(entries: readonly CycleLedgerEntry[]): void {
  let prev = LEDGER_GENESIS;
  for (const e of entries) {
    if (e.prev_entry_sha256 !== prev) throw new Error("rpc-guard: cycle ledger chain broken (prev mismatch, fail-closed)");
    const { entry_sha256: got, prev_entry_sha256, ...rest } = e;
    if (sha256Hex(JSON.stringify({ prev_entry_sha256, ...rest })) !== got) throw new Error("rpc-guard: cycle ledger entry sha mismatch (tamper, fail-closed)");
    prev = got;
  }
}

function readEntries(path: string): CycleLedgerEntry[] {
  const out: CycleLedgerEntry[] = [];
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (line.trim() === "") continue;
    try { out.push(JSON.parse(line) as CycleLedgerEntry); } catch { throw new Error("rpc-guard: cycle ledger line is malformed (fail-closed)"); }
  }
  return out;
}

export interface CycleLedger extends LedgerSink {
  readonly path: string;
  readonly cycleDir: string;
  entries(): readonly CycleLedgerEntry[];
  appendChained(outcome: Outcome, byOpMethod: Record<string, number>, credits: number, reason?: string): CycleLedgerEntry;
}

/** Open (create) the cycle ledger. prior = max(floor, sum credits_derived of `attempted`) - deleting/emptying the
 *  ledger can NEVER reopen the budget below the floor (the anti-reset invariant, T10). */
export function openCycleLedger(dir: string, cycleId: string, floor: number): CycleLedger {
  if (!existsSync(dir)) throw new Error(`rpc-guard: HELIUS_LEDGER_DIR '${dir}' does not pre-exist (fail-closed, C-8)`);
  const cycleDir = join(dir, cycleId);
  if (!existsSync(cycleDir)) mkdirSync(cycleDir);
  const path = join(cycleDir, "ledger.jsonl");
  const entries: CycleLedgerEntry[] = existsSync(path) ? readEntries(path) : [];
  verifyCycleLedger(entries);
  let head = ledgerHeadSha(entries);
  const appendChained = (outcome: Outcome, byOpMethod: Record<string, number>, credits: number, reason?: string): CycleLedgerEntry => {
    const core: CycleCore = { cycle_id: cycleId, tariff_version: HELIUS_TARIFF_VERSION, by_op_method: byOpMethod, outcome, credits_derived: credits, ...(reason !== undefined ? { reason } : {}) };
    const entry = chainCycleEntry(head, core);
    appendFileSync(path, JSON.stringify(entry) + "\n");
    entries.push(entry); head = entry.entry_sha256;
    return entry;
  };
  return {
    path, cycleDir,
    entries: () => entries,
    priorCredits: () => Math.max(floor, entries.reduce((a, e) => a + (e.outcome === "attempted" ? e.credits_derived : 0), 0)),
    append: (rec: AttemptRecord) => { appendChained(rec.outcome, { [`${rec.op}|${rec.method}`]: 1 }, rec.credits, rec.reason); },
    appendChained,
  };
}
