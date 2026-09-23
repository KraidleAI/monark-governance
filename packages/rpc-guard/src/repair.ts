// MONARK rpc-guard - `repair-tail`, the SERVED repair of a power-cut NUL tail (GARDE-FSYNC-1, checkpoint-1 C-1..C-3/C-5;
// procedure docs/RUNBOOK-rpc-guard.md). A power loss can leave <op>.jsonl with its durable lines followed by NUL bytes
// (the file size reached the disk, the data did not - INCIDENT 2026-09-22); openOperatorLedger stays FAIL-CLOSED on it
// ("malformed"). This tool removes ONLY a trailing NUL run that starts right after a complete line, and ONLY when the
// head sidecar then equals the recomputed head (head_action none) or its penultimate (heal_penultimate, the existing
// crash-in-append-window heal). ANY other head - a head AHEAD of the chain first - stays the C-V-8 tail-truncation
// refusal: since GARDE-FSYNC-1 a line is fsynced BEFORE its head, so a power cut can no longer leave a head ahead; it is
// a truncation signature, never normalised by a served tool (C-1). Every refusal changes NO byte. The evidence is kept
// (<op>.jsonl.bak / <op>.head.bak, created "wx", never overwritten) and each repair is journaled in <op>.repair.jsonl
// (outside the chained core; its consumer is reconcile, C-9). No Outcome value is added (the format is frozen).
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { DURABLE_FS, writeDurable, replaceDurable, parseEntries, verifyCycleLedger, ledgerHeadSha, openOperatorLedger, type CycleLedgerEntry } from "./ledger.ts";
import { acquireLock, releaseLock } from "./lock.ts";
import type { CliResult } from "./cli.ts";

const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");

/** C-2: the lock's writer is presumed ALIVE unless the OS reports the pid absent (ESRCH; EPERM = it exists). A pid
 *  reused after the reboot therefore REFUSES (fail-closed, declared residual). */
function pidAlive(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch (e) { return (e as { code?: string }).code !== "ESRCH"; }
}

/** Closed refusal tokens: ledger_absent | head_absent | lock_unreadable | writer_alive | no_nul_tail | torn_tail |
 *  malformed_line | chain_broken | tail_truncation | bak_exists. Exit 1 = REFUSED (no byte written), 0 = REPAIRED. */
export function runRepairTail(ledgerDir: string, cycle: string, op: string, reason: string, floor: number): CliResult {
  const refuse = (token: string): CliResult => ({ exitCode: 1, verdict: "REFUSED", reason: token });
  const cycleDir = join(ledgerDir, cycle);
  const at = (name: string): string => join(cycleDir, name);
  const path = at(`${op}.jsonl`), headPath = at(`${op}.head`), lockPath = at(`${op}.lock`);
  if (!existsSync(path)) return refuse("ledger_absent");
  if (!existsSync(headPath)) return refuse("head_absent"); // C-5: head absent stays REFUSED (ledger.ts header residual)
  let lockHeld = false;
  if (existsSync(lockPath)) {
    let pid: unknown;
    try { pid = (JSON.parse(readFileSync(lockPath, "utf8")) as { pid?: unknown }).pid; } catch { return refuse("lock_unreadable"); }
    if (typeof pid !== "number" || !Number.isInteger(pid) || pid <= 0) return refuse("lock_unreadable");
    if (pidAlive(pid)) return refuse("writer_alive"); // C-2: a live writer may still append - never race it
    lockHeld = true; // a DEAD writer's lock (the power-cut signature) stays in place: `unlock` is the ledgered release
  }
  const raw = readFileSync(path);
  let end = raw.length;
  while (end > 0 && raw[end - 1] === 0) end--;
  if (end === raw.length) return refuse("no_nul_tail");
  if (end > 0 && raw[end - 1] !== 0x0a) return refuse("torn_tail"); // a partial line before the NULs: manual (RUNBOOK)
  let entries: CycleLedgerEntry[];
  try { entries = parseEntries(raw.subarray(0, end).toString("utf8")); } catch { return refuse("malformed_line"); }
  try { verifyCycleLedger(entries); } catch { return refuse("chain_broken"); }
  const headRaw = readFileSync(headPath), onDisk = headRaw.toString("utf8").trim(), recomputed = ledgerHeadSha(entries);
  let headAction: "none" | "heal_penultimate";
  if (onDisk === recomputed) headAction = "none";
  else if (entries.length >= 1 && onDisk === ledgerHeadSha(entries.slice(0, -1))) headAction = "heal_penultimate";
  else return refuse("tail_truncation"); // C-1: a head AHEAD (or any other head) is NEVER rewritten by this tool
  const bak = { jsonl: `${op}.jsonl.bak`, head: `${op}.head.bak` };
  if (existsSync(at(bak.jsonl)) || existsSync(at(bak.head))) return refuse("bak_exists"); // C-3: never overwrite evidence
  if (!lockHeld) acquireLock(cycleDir, op); // no lock: hold it during the repair (calque cli reconcile C-G2-4), then release
  try {
    writeDurable(at(bak.jsonl), "wx", raw);
    writeDurable(at(bak.head), "wx", headRaw);
    const fd = DURABLE_FS.openSync(path, "r+");
    try { DURABLE_FS.ftruncateSync(fd, end); DURABLE_FS.fsyncSync(fd); } finally { DURABLE_FS.closeSync(fd); }
    if (headAction === "heal_penultimate") replaceDurable(headPath, recomputed);
    openOperatorLedger(cycleDir, op, floor); // the CONSUMER check: the repaired pair opens (else it throws => exit 2)
    const record = {
      iso: new Date().toISOString(), pid: process.pid, cycle, op, reason,
      sha_before: { jsonl: sha(raw), head: sha(headRaw) }, sha_after: { jsonl: sha(readFileSync(path)), head: sha(readFileSync(headPath)) },
      nul_bytes_removed: raw.length - end, lines_after: entries.length, head_after: recomputed,
      bak_path: bak, bak_sha256: { jsonl: sha(readFileSync(at(bak.jsonl))), head: sha(readFileSync(at(bak.head))) }, head_action: headAction,
    };
    writeDurable(at(`${op}.repair.jsonl`), "a", JSON.stringify(record) + "\n");
  } finally { if (!lockHeld) releaseLock(cycleDir, op); }
  return { exitCode: 0, verdict: "REPAIRED", reason: `nul_bytes_removed=${String(raw.length - end)} head_action=${headAction}` };
}
