// MONARK Koyomi -- the label reader (lot A1-a; G0 KOYOMI-A DK-6 and C-3 of its checkpoint-1; plan A1 r2 C-A1-13). It reads the `open`
// (the label O of the next trading day) and the `close` of the Databento EQUS.SUMMARY ohlcv-1d records, through the exported seams of
// apps/bell/src/close.ts only: the range path, the date of a bar (dbnBarDateUtc), the scaled-integer decoder, the UNDEF_PRICE sentinel,
// and the GET seam itself. close.ts is not modified and this file carries no network call nor key read (scanner root, test 60). The
// close is selected the way close.ts selects it (a non-empty string, never UNDEF_PRICE, the last valid record of a date), which test 48
// proves on one fixture body against readReferenceCloses. Values are scaled integers at 1e-9, never floats; nothing here prints or
// writes them. Seam held with BELL-CARNET-1, which imports this module (G0 BELL-CARNET-1 DN-10): a change of the exported signatures
// goes through a zone line that names the carnet's test 5.
import { DBN_UNDEF_PRICE, databentoGetRangePath, dbnBarDateUtc, scaledFromDatabento, type DatabentoGet, type DatabentoOhlcvRecord } from "../../bell/src/close.ts";

/** The state of one field of a record: a valid scaled integer, missing or empty, the UNDEF_PRICE sentinel, or a shape refused. */
export type FieldState = "present" | "absent" | "undef" | "rejected";
/** One trading day of one symbol: its open and its close as scaled integers (1e-9), null unless the state is "present". */
export interface DailyLabel { readonly open: bigint | null; readonly open_state: FieldState; readonly close: bigint | null; readonly close_state: FieldState }
export interface LabelDeps { readonly databentoGet: DatabentoGet; readonly databentoKey: string }

type Field = { readonly value: bigint | null; readonly state: FieldState };
function fieldOf(rec: DatabentoOhlcvRecord, name: "open" | "close"): Field {
  const raw = (rec as Readonly<Record<string, unknown>>)[name];
  if (typeof raw !== "string" || raw.trim() === "") return { value: null, state: "absent" };
  if (raw.trim() === DBN_UNDEF_PRICE) return { value: null, state: "undef" };
  try { return { value: scaledFromDatabento(raw), state: "present" }; } catch { return { value: null, state: "rejected" }; }
}
/** close.ts keeps, per date, the LAST non-empty string that is not UNDEF_PRICE and checks its shape afterwards: a later record that
 *  is "present" or "rejected" replaces the earlier one, a later "absent" or "undef" never does. */
const merge = (prev: Field | undefined, next: Field): Field => (prev === undefined || next.state === "present" || next.state === "rejected" ? next : prev);

/** Map single-symbol ohlcv-1d records to {date -> DailyLabel}, the date of a bar being close.ts's dbnBarDateUtc. Pure. */
export function labelsFromRecords(records: readonly DatabentoOhlcvRecord[]): Record<string, DailyLabel> {
  const open: Record<string, Field> = {}, close: Record<string, Field> = {};
  for (const rec of records) {
    const date = dbnBarDateUtc(rec);
    if (date === undefined) continue;
    open[date] = merge(open[date], fieldOf(rec, "open"));
    close[date] = merge(close[date], fieldOf(rec, "close"));
  }
  const out: Record<string, DailyLabel> = {};
  for (const date of Object.keys(open).sort()) {
    const o = open[date]!, c = close[date]!;
    out[date] = { open: o.value, open_state: o.state, close: c.value, close_state: c.state };
  }
  return out;
}

/** One range request (start inclusive, end EXCLUSIVE, UTC dates) through the close.ts seam. An empty key emits no request (the
 *  keyless rule of close.ts, CASH-KEYLESS-SKIP-1): every date of the symbol is then without a label. */
export async function readDatabentoLabels(symbol: string, start: string, endExclusive: string, deps: LabelDeps): Promise<Record<string, DailyLabel>> {
  if (!deps.databentoKey) return {};
  return labelsFromRecords(await deps.databentoGet(databentoGetRangePath(symbol, start, endExclusive), deps.databentoKey));
}
