// MONARK Bell — halt delta (ADR-B0 D2 ii). The tokenized security trades on-chain 24/7 while the NYSE
// listing is halted; the delta brackets the first on-chain fill AFTER the halt and the last BEFORE the
// resume. Halt/resume times are ET wall-clock WITHOUT a zone → converted with DST (sessions.ts). Never a
// boolean "compliant": n = 0 on the census-15 is written as-is; residues are named, never bucketed silent.
import { etWallClockToUtcMs } from "./sessions.ts";
import { canonReason, type ReasonFamily } from "./reason-canon.ts";
import type { SwapFill } from "./rpc.ts";

/** Proper RFC4180 CSV parse: quoted fields, "" → ", commas/newlines inside quotes. The `Name` column
 *  carries commas AND escaped quotes (e.g. `"""Freight Technologies, Inc."""`), so a naive split is wrong. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQ = false, i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export interface HaltRow {
  readonly haltDate: string; readonly haltTime: string; readonly symbol: string; readonly name: string;
  readonly exchange: string; readonly reason: string; readonly resumeDate: string; readonly resumeTime: string;
}
/** Parse the halts CSV into rows (header-mapped, skips malformed short rows). */
export function rowsFromCsv(text: string): HaltRow[] {
  const rows = parseCSV(text);
  const head = rows[0] ?? [];
  const H = head.indexOf("Halt Date"), T = head.indexOf("Halt Time"), S = head.indexOf("Symbol"), N = head.indexOf("Name");
  const E = head.indexOf("Exchange"), R = head.indexOf("Reason"), RD = head.indexOf("Resume Date"), RT = head.indexOf("NYSE Resume Time");
  const out: HaltRow[] = [];
  for (const r of rows.slice(1)) {
    if (r.length < 8) continue;
    out.push({ haltDate: r[H] ?? "", haltTime: r[T] ?? "", symbol: r[S] ?? "", name: r[N] ?? "",
      exchange: r[E] ?? "", reason: r[R] ?? "", resumeDate: r[RD] ?? "", resumeTime: r[RT] ?? "" });
  }
  return out;
}

const toUtc = (dateISO: string, hms: string): number => {
  const [y, mo, d] = dateISO.split("-").map(Number);
  const [h, mi, s] = hms.split(":").map(Number);
  return etWallClockToUtcMs(y ?? 0, mo ?? 1, d ?? 1, h ?? 0, mi ?? 0, s ?? 0);
};

export type HaltResidue = "resume_time_missing" | "resume_date_gt_halt_date" | "no_fill_in_window"
  | "reason_unknown" | "block_ts_vs_submission";
export interface HaltDelta {
  readonly symbol: string;
  readonly reasonFamily: ReasonFamily;
  readonly haltUtcMs: number;
  readonly resumeUtcMs: number | null;
  readonly firstFillAfterHaltUtcMs: number | null;
  readonly lastFillBeforeResumeUtcMs: number | null;
  readonly nFillsInWindow: number;
  readonly residues: readonly HaltResidue[];
}

/** Compute the halt delta against a symbol's on-chain fills (sorted or not). `block_ts_vs_submission` is
 *  a STANDING residue (block time is the observed proxy for submission), always declared. */
export function haltDelta(row: HaltRow, fills: readonly SwapFill[]): HaltDelta {
  const residues: HaltResidue[] = ["block_ts_vs_submission"];
  const reasonFamily = canonReason(row.reason);
  if (reasonFamily === "REASON_UNKNOWN") residues.push("reason_unknown");
  const haltUtcMs = toUtc(row.haltDate, row.haltTime);
  let resumeUtcMs: number | null = null;
  if (!row.resumeTime.trim()) residues.push("resume_time_missing");
  else {
    if (row.resumeDate && row.resumeDate > row.haltDate) residues.push("resume_date_gt_halt_date");
    resumeUtcMs = toUtc(row.resumeDate || row.haltDate, row.resumeTime);
  }
  const inWin = fills.filter((f) => f.blockTimeUtcMs >= haltUtcMs && (resumeUtcMs == null || f.blockTimeUtcMs <= resumeUtcMs));
  const after = fills.filter((f) => f.blockTimeUtcMs >= haltUtcMs).sort((a, b) => a.blockTimeUtcMs - b.blockTimeUtcMs);
  const before = resumeUtcMs == null ? [] : fills.filter((f) => f.blockTimeUtcMs <= resumeUtcMs).sort((a, b) => a.blockTimeUtcMs - b.blockTimeUtcMs);
  if (inWin.length === 0) residues.push("no_fill_in_window");
  return {
    symbol: row.symbol, reasonFamily, haltUtcMs, resumeUtcMs,
    firstFillAfterHaltUtcMs: after[0]?.blockTimeUtcMs ?? null,
    lastFillBeforeResumeUtcMs: before.length ? (before[before.length - 1]?.blockTimeUtcMs ?? null) : null,
    nFillsInWindow: inWin.length, residues,
  };
}

/** Census helpers (ADR-B0 §5 / parser oracle): total rows, empty-resume count, and census halts since. */
export function census(rows: readonly HaltRow[]): { total: number; emptyResume: number } {
  let emptyResume = 0;
  for (const r of rows) if (!r.resumeTime.trim()) emptyResume += 1;
  return { total: rows.length, emptyResume };
}
export function haltsSince(rows: readonly HaltRow[], symbols: readonly string[], sinceDateISO: string): HaltRow[] {
  const set = new Set(symbols);
  return rows.filter((r) => set.has(r.symbol) && r.haltDate >= sinceDateISO);
}
