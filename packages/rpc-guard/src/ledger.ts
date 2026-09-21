// MONARK rpc-guard - the durable PER-OPERATOR cycle ledger (GARDE-HELIUS task 2, C-V-8). Append-only, CHAINED,
// env-derived, OUTSIDE the working dir. Files are keyed by (cycle, operator): <cycleDir>/<op>.jsonl (the chain),
// <cycleDir>/<op>.head (the tamper-evident head sidecar), <cycleDir>/<op>.lock (the exclusive writer lock, ./lock.ts).
// PER-OPERATOR is structural, not cosmetic: a shared ledger.jsonl with per-op locks would let run A (helius) and run
// B (chainstack) append concurrently and FORK the chain - the exact C-9 hazard the lock exists to close. Separate
// files close it by construction, and give a per-operator prior (C-V-9).
//
// The chaining is a BYTE-IDENTICAL calque of apps/bell/src/rebase-crosscheck.ts:136-148 (ledger-format-lock.test.ts):
// entry_sha256 = sha256(JSON.stringify(core)) with prev_entry_sha256 as the FIRST key of core. The unit is the
// REQUEST by (op, method); credits are DERIVED. HEAD SIDECAR (C-V-8): the last entry's sha is persisted OUTSIDE the
// chain after each append; a tail truncation (a valid chain PREFIX) is undetectable by chain replay alone, so at open
// we require head == recomputed head (ledger present + head absent, or head != recomputed => throw, fail-closed).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import type { AttemptRecord, Outcome } from "./client.ts";
import { tariffVersionOf } from "./tariff.ts";

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

/** entry_sha256 = sha256(JSON.stringify({prev_entry_sha256, ...core})); prev is the FIRST key (format-lock pins it). */
export function chainCycleEntry(prevSha: string, core: CycleCore): CycleLedgerEntry {
  const full = { prev_entry_sha256: prevSha, ...core };
  return { ...full, entry_sha256: sha256Hex(JSON.stringify(full)) };
}
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

/** The parent HELIUS_LEDGER_DIR must PRE-EXIST (C-8); we create only the <cycle> subdir. A ledger under an
 *  auto-created parent is a phantom a wrong path silently reinitialises. Returns the cycle dir. */
export function ensureCycleDir(ledgerDir: string, cycleId: string): string {
  if (!existsSync(ledgerDir)) throw new Error(`rpc-guard: HELIUS_LEDGER_DIR '${ledgerDir}' does not pre-exist (fail-closed, C-8)`);
  const cycleDir = join(ledgerDir, cycleId);
  if (!existsSync(cycleDir)) mkdirSync(cycleDir);
  return cycleDir;
}

export interface CycleLedger {
  readonly path: string;
  readonly headPath: string;
  readonly cycleDir: string;
  readonly op: string;
  entries(): readonly CycleLedgerEntry[];
  priorAtOpen(): number;
  append(rec: AttemptRecord): void;
  appendChained(outcome: Outcome, byOpMethod: Record<string, number>, credits: number, reason?: string): CycleLedgerEntry;
}

/** Open (create) the PER-OPERATOR ledger under an existing <cycleDir>. prior_cycle is FROZEN at open =
 *  max(floor, Sigma attempted credits) (C-V-1); the head sidecar makes a tail truncation fail-closed (C-V-8). */
export function openOperatorLedger(cycleDir: string, op: string, floor: number): CycleLedger {
  const cycleId = basename(cycleDir);
  const path = join(cycleDir, `${op}.jsonl`);
  const headPath = join(cycleDir, `${op}.head`);
  const hasLedger = existsSync(path), hasHead = existsSync(headPath);
  let entries: CycleLedgerEntry[] = [];
  if (hasLedger) {
    if (!hasHead) throw new Error(`rpc-guard: ledger '${op}.jsonl' present but head sidecar absent (tamper, fail-closed, C-V-8)`);
    entries = readEntries(path);
    verifyCycleLedger(entries);
    if (readFileSync(headPath, "utf8").trim() !== ledgerHeadSha(entries)) throw new Error(`rpc-guard: head sidecar != recomputed head for '${op}' (tail truncation, fail-closed, C-V-8)`);
  } else if (hasHead) {
    throw new Error(`rpc-guard: head sidecar present but ledger '${op}.jsonl' absent (tamper, fail-closed, C-V-8)`);
  }
  let head = ledgerHeadSha(entries);
  const frozenPrior = Math.max(floor, entries.reduce((a, e) => a + (e.outcome === "attempted" ? e.credits_derived : 0), 0));
  const tariffVersion = tariffVersionOf(op); // per-operator (GARDE-HELIUS-2): a chainstack line never carries the helius version
  const appendChained = (outcome: Outcome, byOpMethod: Record<string, number>, credits: number, reason?: string): CycleLedgerEntry => {
    const core: CycleCore = { cycle_id: cycleId, tariff_version: tariffVersion, by_op_method: byOpMethod, outcome, credits_derived: credits, ...(reason !== undefined ? { reason } : {}) };
    const entry = chainCycleEntry(head, core);
    appendFileSync(path, JSON.stringify(entry) + "\n");
    entries.push(entry); head = entry.entry_sha256;
    writeFileSync(headPath, head); // head rewritten AFTER the append (C-V-8)
    return entry;
  };
  return {
    path, headPath, cycleDir, op,
    entries: () => entries,
    priorAtOpen: () => frozenPrior,
    append: (rec: AttemptRecord) => { appendChained(rec.outcome, { [`${rec.op}|${rec.method}`]: 1 }, rec.credits, rec.reason); },
    appendChained,
  };
}
