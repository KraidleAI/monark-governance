// scripts/mission/relance.d.mts - type surface and rules of scripts/mission/relance.mjs (ADR-METHODE-2 D8b, lot M-7) for the root test
// test/mission-relance.test.ts (precedent: scripts/mission/lint.d.mts). Node ignores this file; governance-only, not exported.

/** One record of <run>/journal.jsonl (the four measured types; the first record is the only launched one; other fields tolerated). */
export type JournalRecord =
  | { type: "launched" }
  | { type: "started"; key: string; agentId: string; label: string; phase: string }
  | { type: "result"; key: string; agentId: string; result: unknown }
  | { type: "failed"; key: string; agentId: string };
/** One parsed line of agent-<agentId>.jsonl; only these top-level fields are read (and the text of message.content by the fallback). */
export interface TranscriptLine {
  timestamp?: string; error?: string; apiErrorStatus?: number; quotaLimits?: { resetsAt?: number; rateLimitType?: string };
  message?: { model?: string; content?: string | { type?: string; text?: string }[] };
}
/** agentId to the complete lines of its transcript (an unterminated last line is dropped); null or absent: no transcript. */
export type Transcripts = Record<string, TranscriptLine[] | null | undefined>;
export type Status = "stored" | "failed" | "dead" | "running" | "replaced";
export type VerifyStatus = Status | "relaunched" | "served-from-cache" | "null-served" | "replayed";
/** divergence: the instant read in the text when it is more than 60 s away from quotaLimits.resetsAt, and that gap in seconds. */
export interface Divergence { text: string; seconds: number }
export interface KeyEntry<S extends string = Status> {
  key: string; label: string | null; phase: string | null; agentId: string; status: S;
  cause: string | null; resets_at: string | null; divergence: Divergence | null; by?: { key: string; agentId: string }; // by: the new key answering
}
/** The fate of the failed origin keys (vacuous: none at the bound, Q-M7-3); unmatched: the new keys answering for none, current state. */
export interface VerifyCounts {
  from: number; vacuous: boolean; relaunched: number; replaced: number; served_from_cache: number; null_served: number;
  replayed: { keys: number; seconds: number | null }; unmatched: { key: string; label: string | null; phase: string | null; status: Status }[];
}
/** The output written to --out and printed; verify only with --verify; resume_at: the latest resets_at of the failed keys, null if one is. */
export interface RelanceOutput {
  schema: "monark.relance.v1"; run: string; script: string | null; journal_lines: number; now: string; keys: KeyEntry<VerifyStatus>[];
  resume_at: string | null; resume: string | null; verdict: string; verify?: VerifyCounts;
}

/** The UTC instant (ISO) of "resets <h[:mm]am|pm> (<IANA zone>)" or "resets <Mon> <D>, <h[:mm]am|pm> (<zone>)", the zone applied by
 *  Intl.DateTimeFormat: the FIRST instant at or after `anchor` (the stamp of the line that says it; Q-M7-1, Q-G2-1), that day or the
 *  next (two instants on a DST fold, e.g. 1:30am on 2026-10-25 in Europe/London: 00:30Z then 01:30Z; a wall time in a spring gap has
 *  none that day), that year or the next for the dated form. null when the text does not match, the month or the zone is unknown. */
export function parseResets(text: string | undefined, anchor: string): string | null;
/** From the last synthetic rate-limit line of a failed key's transcript: cause = quotaLimits.rateLimitType ("unknown" if absent),
 *  resets_at = quotaLimits.resetsAt (epoch seconds) as ISO, else the instant of the text anchored on the line's timestamp, else now;
 *  divergence when both exist and differ by more than 60 s (the epoch is kept). A line without a valid timestamp: text not read,
 *  cause "unknown", resets_at the epoch or null, never now (Q-G2-1). No line: cause "unknown", resets_at = now. */
export function resetsOf(line: TranscriptLine | null | undefined, now: string):
  { cause: string; resets_at: string | null; divergence: Divergence | null };
/** One entry per key, in the order of its first record; the LAST record of the key decides: stored (a non-null result), failed (a
 *  failed record or a null result, V-4), dead (a started record whose transcript's last complete line is stamped strictly before
 *  now - staleMin minutes, or no transcript or no stamp), running (the rest: at now - staleMin exactly, running). A failed key is
 *  dated by resetsOf (its last line with error "rate_limit" or apiErrorStatus 429 and message.model "<synthetic>"); a dead key has
 *  cause "unknown" and resets_at = now; stored and running keys carry nulls. Top-level fields class a key, the text never does. Then a
 *  failed key is replaced (by: that key) when the first key whose first record is a start after its last record, with its label and
 *  phase, and answering for no other failed key, is stored (Q-M7-8: --run on a journal prolonged by a resume). */
export function classify(records: readonly JournalRecord[], transcripts: Transcripts, now: string, staleMin?: number): KeyEntry[];
/** --verify on the same journal: the keys classed on records[0, from) (origin), then the records after the bound. A failed origin
 *  key restarted after the bound takes the current state of that key: relaunched (non-null result), null-served (null result, V-4),
 *  else failed, dead or running; not restarted, the first key whose first record is a start after the bound, with its label and
 *  phase, answers for it (by: that key): replaced (non-null result), null-served, or its state; none: null-served if a null result
 *  of the key follows the bound, else served-from-cache. No record after the bound: failed stays failed. A stored origin key restarted
 *  after the bound is replayed (verify.replayed: keys, and the seconds from first to last stamp of the replaying transcripts, null if
 *  any is missing); a dead, running or replaced origin key takes its current state. staleMin as --stale. exit 1 when a failed origin
 *  key is neither relaunched nor replaced, else 0; a from outside [0, records.length] throws a RangeError (the CLI exits 2). */
export function verify(records: readonly JournalRecord[], from: number, transcripts?: Transcripts, now?: string, staleMin?: number): { keys: KeyEntry<VerifyStatus>[]; verify: VerifyCounts; exit: 0 | 1 };
/** The CLI: --run <dir> | --verify <dir> --from <n>, with --out <file> [--now <ISO>] [--stale <min>, default 30] for both; returns the
 *  exit code (0, 1); throws on usage, an unread run or a --from beyond the journal (the guard exits 2). */
export function main(argv: readonly string[]): 0 | 1;
