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
// we require head == recomputed head (ledger present + head absent, or head != recomputed => throw, fail-closed) -
// EXCEPT the crash-in-append-window case (1b-0, item i): a head EXACTLY one entry behind (== the durable ledger's
// penultimate head) is HEALED at open (the last line was durably appended, only the sidecar lagged); a tail truncation
// (head AHEAD) stays fail-closed. Residual: a crash after the FIRST-ever append presents as head-absent (== a deleted
// sidecar), which stays fail-closed (recovering it would admit a delete-head+truncate attack) - runbook manual repair.
// GARDE-FSYNC-1: every line, head and lock write is DURABLE (DURABLE_FS below); a power-cut NUL tail stays fail-closed
// here ("malformed") and is repaired by the served `repair-tail` (./repair.ts, docs/RUNBOOK-rpc-guard.md).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, openSync, writeSync, fsyncSync, closeSync, renameSync, ftruncateSync, unlinkSync } from "node:fs";
import { join, basename } from "node:path";
import type { AttemptRecord, Outcome } from "./client.ts";
import { tariffVersionOf } from "./tariff.ts";

export const LEDGER_GENESIS = "0".repeat(64);
export const sha256Hex = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

/** GARDE-FSYNC-1 (INCIDENT 2026-09-22: a power cut kept 9 460 lines and lost ~420 the process HAD appended - 211 008
 *  NUL bytes at the tail - with the head sidecar AHEAD of the durable chain). A returned write sits in the OS cache until
 *  fsync. Every write of this package goes through DURABLE_FS in a FIXED order: open -> write -> fsync -> close; a
 *  whole-file replace (the head) writes <path>.tmp that way, THEN renames it over <path>. Never `{flush: true}`: the
 *  node 24.15.0 writeFileSync UTF-8 fast path drops it silently (measured, ADR). MUTABLE on purpose - the test seam:
 *  tests wrap these methods to journal the SEQUENCE through the real openGuardedClient/runCli, then restore them. NOT
 *  exported by index.ts (closed export set, exports.test.ts). */
export interface DurableFs {
  openSync: (path: string, flags: "a" | "w" | "wx" | "r+") => number;
  writeSync: (fd: number, data: string | Uint8Array) => void;
  fsyncSync: (fd: number) => void;
  closeSync: (fd: number) => void;
  renameSync: (from: string, to: string) => void;
  ftruncateSync: (fd: number, len: number) => void;
  unlinkSync: (path: string) => void;
  sleepSync: (ms: number) => void;
}
export const DURABLE_FS: DurableFs = {
  openSync: (p, f) => openSync(p, f),
  writeSync: (fd, d) => { const b = typeof d === "string" ? Buffer.from(d, "utf8") : d; for (let o = 0; o < b.length;) o += writeSync(fd, b, o, b.length - o); },
  fsyncSync: (fd) => { fsyncSync(fd); },
  closeSync: (fd) => { closeSync(fd); },
  renameSync: (from, to) => { renameSync(from, to); },
  ftruncateSync: (fd, len) => { ftruncateSync(fd, len); },
  unlinkSync: (p) => { unlinkSync(p); },
  sleepSync: (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); },
};
/** open(flags) -> write -> fsync -> close: returns once the bytes were flushed to the device (fault model, ADR). */
export function writeDurable(path: string, flags: "a" | "w" | "wx", data: string | Uint8Array): void {
  const fd = DURABLE_FS.openSync(path, flags);
  try { DURABLE_FS.writeSync(fd, data); DURABLE_FS.fsyncSync(fd); } finally { DURABLE_FS.closeSync(fd); }
}
/** E-3 (declared at the ADR): on win32, MoveFileExW(REPLACE_EXISTING) fails EPERM while ANY other handle holds the target
 *  open (measured: 452 of 2000 renames under a concurrent reader; the orchestrator's probe, 22:0x UTC: Node, Git-Bash,
 *  Python and PowerShell readers alike). BOUNDED retry: waits of min(10 * k, 100) ms (the graceful-fs polyfills.js win32
 *  rename backoff) while the cumulated wait stays <= RENAME_MAX_WAIT_MS, then a NAMED fail-closed error - never an
 *  in-place fallback (cut #2 left a head of 64 NUL bytes). The waits are synchronous: the append path is sync. */
export const RENAME_MAX_WAIT_MS = 3000;
/** Replace a whole small file: <path>.tmp written durably, THEN renamed over <path>. After a power cut the file is the
 *  OLD or the NEW complete content, never a torn one (the tmp was fsynced first); the persistence of the rename itself is
 *  NOT guaranteed by the API called (win32: MoveFileExW without MOVEFILE_WRITE_THROUGH -
 *  docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md), so a head ONE entry behind is healed at open. The
 *  parent-directory fsync is NOT done (measured feasible on win32 with flag "r+" only; formed item, ADR). */
export function replaceDurable(path: string, data: string): void {
  const tmp = `${path}.tmp`;
  writeDurable(tmp, "w", data);
  for (let k = 1, waited = 0; ; k++) {
    try { DURABLE_FS.renameSync(tmp, path); return; } catch (e) {
      const code = (e as { code?: string }).code ?? "", wait = Math.min(10 * k, 100);
      if (!["EPERM", "EACCES", "EBUSY"].includes(code)) throw e;
      if (waited + wait > RENAME_MAX_WAIT_MS) throw Object.assign(new Error(`rpc-guard: rename of '${basename(tmp)}' refused ${String(k)} times over ${String(waited)} ms (${code}: another handle holds '${basename(path)}'; fail-closed, no in-place fallback)`), { code, cause: e });
      DURABLE_FS.sleepSync(wait); waited += wait;
    }
  }
}

export interface CycleLedgerEntry {
  readonly prev_entry_sha256: string;
  readonly cycle_id: string;
  readonly tariff_version: string;
  readonly by_op_method: Readonly<Record<string, number>>;
  readonly outcome: Outcome;
  readonly credits_derived: number;
  // GARDE-HELIUS-1b-0 (C-5 / decision 121): for the multi-network operator `chainstack` (ONE operator per ACCOUNT,
  // one 16 M RU cap across networks) the network is an ADDITIONAL core attribute (after credits_derived, before
  // reason), NEVER a second operator/ledger/cap. It is OMITTED on every other line (helius/keyless) AND on a
  // pre-121 chainstack line written without opts.network, so those stay byte-identical; verifyCycleLedger recomputes
  // on the PRESENT fields, so a legacy (no-network) line and a network line chain and verify in the SAME ledger.
  readonly network?: string;
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

/** Parse the chain text, one entry per line. An unparseable line throws - a NUL tail included (trim() keeps U+0000). */
export function parseEntries(text: string): CycleLedgerEntry[] {
  const out: CycleLedgerEntry[] = [];
  for (const line of text.split(/\r?\n/)) {
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
export function openOperatorLedger(cycleDir: string, op: string, floor: number, network?: string): CycleLedger {
  const cycleId = basename(cycleDir);
  const path = join(cycleDir, `${op}.jsonl`);
  const headPath = join(cycleDir, `${op}.head`);
  const hasLedger = existsSync(path), hasHead = existsSync(headPath);
  let entries: CycleLedgerEntry[] = [];
  if (hasLedger) {
    if (!hasHead) throw new Error(`rpc-guard: ledger '${op}.jsonl' present but head sidecar absent (tamper, fail-closed, C-V-8)`);
    entries = parseEntries(readFileSync(path, "utf8"));
    verifyCycleLedger(entries);
    const recomputed = ledgerHeadSha(entries);
    const onDisk = readFileSync(headPath, "utf8").trim();
    if (onDisk !== recomputed) {
      // GARDE-HELIUS-1b-0 (item i, CP2 2b-ii C-G-5 / E-1): CRASH-IN-APPEND-WINDOW RECOVERY. A crash between the
      // append (appendChained below) and the head-sidecar rewrite leaves the head EXACTLY ONE entry behind the
      // durable ledger. That last line WAS durably appended (write-ahead honoured); only the tamper-evidence
      // sidecar lagged, so the state is RECOVERABLE and is DISTINCT from a tail truncation, which leaves the head
      // AHEAD of the ledger (== the sha of a REMOVED entry, never the penultimate of the CURRENT chain). Recover
      // IFF the on-disk head == the head of all-but-the-last verified entry; anything else (head ahead, or matching
      // a non-penultimate entry) stays fail-closed. Self-heal the sidecar so `runCli unlock` / reconcile / the next
      // open are consistent - this is what makes a post-crash lock recoverable by `unlock` alone (the runbook
      // RESERVE closed). It does NOT widen the C-V-8 threat model: the sidecar only ever defended a PARTIAL
      // (jsonl-only) tamper; an attacker who writes BOTH files already wins, and a truncation never presents the
      // penultimate head, so it still throws (ledger.test.ts C-V-8(c) keeps reddening the too-permissive mutant).
      if (entries.length >= 1 && onDisk === ledgerHeadSha(entries.slice(0, -1))) {
        replaceDurable(headPath, recomputed); // GARDE-FSYNC-1 C-4: the heal is durable too (tmp + fsync + rename)
      } else {
        throw new Error(`rpc-guard: head sidecar != recomputed head for '${op}' (tail truncation, fail-closed, C-V-8)`);
      }
    }
  } else if (hasHead) {
    throw new Error(`rpc-guard: head sidecar present but ledger '${op}.jsonl' absent (tamper, fail-closed, C-V-8)`);
  }
  // GARDE-FSYNC-1 C-4: a <op>.head.tmp left by a power cut between its fsync and its rename is an ORPHAN; the <op>.head
  // on disk stays authoritative (at most one entry behind, healed above). Removed only once the pair is verified.
  if (existsSync(`${headPath}.tmp`)) DURABLE_FS.unlinkSync(`${headPath}.tmp`);
  let head = ledgerHeadSha(entries);
  const frozenPrior = Math.max(floor, entries.reduce((a, e) => a + (e.outcome === "attempted" ? e.credits_derived : 0), 0));
  const tariffVersion = tariffVersionOf(op); // per-operator (GARDE-HELIUS-2): a chainstack line never carries the helius version
  const appendChained = (outcome: Outcome, byOpMethod: Record<string, number>, credits: number, reason?: string): CycleLedgerEntry => {
    // GARDE-HELIUS-1b-0 (C-5 / 121): stamp `network` (after credits_derived, before reason) ONLY when this operator
    // ledger was opened FOR a network (chainstack under an explicit opts.network). Omitted otherwise => byte-identical
    // legacy lines; a mixed ledger (legacy + network lines) chains + verifies (verifyCycleLedger recomputes present fields).
    const core: CycleCore = { cycle_id: cycleId, tariff_version: tariffVersion, by_op_method: byOpMethod, outcome, credits_derived: credits, ...(network !== undefined ? { network } : {}), ...(reason !== undefined ? { reason } : {}) };
    const entry = chainCycleEntry(head, core);
    writeDurable(path, "a", JSON.stringify(entry) + "\n"); // the LINE is durable BEFORE its head (C-V-8 order)
    entries.push(entry); head = entry.entry_sha256;
    replaceDurable(headPath, head); // head rewritten AFTER the durable append (C-V-8)
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
