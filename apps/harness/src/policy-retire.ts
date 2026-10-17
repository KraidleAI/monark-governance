/**
 * The retire list of kata rows, format kata-retire-v1 (R-a of ENGINE-ROW-RETIRE-PATH-1; docs/G0-lot-retire-path-ra.md; draft G0
 * sections 4.1 and 4.2, MONARK's review F-2 to F-4; ADR 0006 addendum 9 points 1, 5 and 6). The closed reader of a pinned list,
 * called by the import guard on its chain GuardPins.retireLists, never served: bytes of the pinned sha256, a file retire-<YYYY-MM-DD>.json (the
 * list's date), one canonical JSON line {format, entries}, entries sorted by (task_class, cell_key, calib_attempt) with no repeated key, each
 * exactly the eight columns of RetireEntry, on the attempt of a region cell current at the list's date (attempt 2 from the day a wave 2 child is current); live:<k> counts within
 * LIVE_N_MAX, on a quarter Q_k that ends at or before the list's date; a dated list carries every entry of the previous one
 * unchanged (cumulative). The arithmetic of live counts (veto, u_test) stays with guardKataRow on the overlaid row (draft 4.2).
 */
import { createHash } from "node:crypto";
import { canonicalJson, type CanonicalValue } from "@monark/contracts";
import { readRegistry, type RetiredCell } from "./policy-projection.ts";
import { LIVE_N_MAX } from "./policy-wave2.ts";

/** One entry: the cell, the attempt it retires, the retire block of its row, the digest of its evidence (CM-5's record of the LIVE counts, or the ADR cited). */
export type RetireEntry = RetiredCell & { readonly calib_attempt: number; readonly evidence_sha256: string };
/** The pin of a list: its file, exactly retire-<YYYY-MM-DD>.json by its date (a bare name, no directory), the sha256 of its bytes (from a committed pin), and the bytes. */
export type RetirePin = { readonly file: string; readonly sha256: string; readonly bytes: Uint8Array };
export type RetireList = { readonly date: string; readonly entries: readonly RetireEntry[] };

type Columns = Readonly<Record<string, (v: unknown) => boolean>>;
const fail = (what: string): never => {
  throw new Error(`MONARK retire list: ${what}.`);
};
const text = (v: unknown): boolean => typeof v === "string";
const count = (v: unknown): boolean => v === null || (Number.isSafeInteger(v) && (v as number) >= 0);
const ENTRY: Columns = {
  calib_attempt: (v) => Number.isSafeInteger(v) && (v as number) >= 1, cause: text, cell_key: text, evidence_sha256: (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v),
  k_test: count, n_test: count, task_class: text, u_test: (v) => v === null || (typeof v === "string" && /^(1|0\.[0-9]{7})$/.test(v)),
};

/** A closed object: exactly the keys of `cols`, each of its type. */
function closed<T>(v: unknown, cols: Columns, at: string): T {
  const o = v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : fail(`${at} is not an object`);
  for (const k of Object.keys(o)) if (!Object.hasOwn(cols, k)) fail(`${at} has an unknown key '${k}' (closed format)`);
  for (const [k, ok] of Object.entries(cols)) if (!ok(Object.hasOwn(o, k) ? o[k] : fail(`${at} misses the key '${k}'`))) fail(`${at}.${k} is off the format kata-retire-v1`);
  return o as T;
}

/** The value of bytes that are its canonical writing (spec section 2: minified, sorted keys, UTF-8, no final newline); refused otherwise. */
function canonical(pin: RetirePin): unknown {
  try {
    const v = JSON.parse(new TextDecoder().decode(pin.bytes)) as CanonicalValue;
    if (Buffer.from(canonicalJson(v)).equals(pin.bytes)) return v;
  } catch {
    // JSON.parse or canonicalJson refuses the text: no canonical line, refused below
  }
  return fail(`${pin.file}: the bytes are not one canonical JSON line (spec section 2)`);
}

/** The cause grammar, one source for this reader and guardKataRow: live:<k> (k >= 1, no leading zero) gives k, adr:decisions/<file>.md gives 0, any other cause undefined (epoch:<id> needs the pinned epoch log). */
export const retireQuarter = (cause: string): number | undefined =>
  /^live:[1-9][0-9]*$/.test(cause) ? Number(cause.slice(5)) : /^adr:decisions\/[0-9A-Za-z][0-9A-Za-z._-]*\.md$/.test(cause) && !cause.includes("..") ? 0 : undefined;

/**
 * Reads a pinned list against the registry bytes the guard pins and, when the guard's chain holds an older list, against its
 * predecessor (R-T5), and against the `children` of its wave 2 core cells (attemptAt, below). A live:<k> retire is computed on the closed quarter only (addendum 9 point 6): its quarter end E_k, S_1 =
 * 2026-10-01T00:00Z plus 3k calendar months (point 1), is at or before 00:00Z of the list's date. Throws on the first difference.
 */
export function readRetireList(pin: RetirePin, registryBytes: Uint8Array, previous?: RetireList, children: ChildCells = new Map()): RetireList {
  if (createHash("sha256").update(pin.bytes).digest("hex") !== pin.sha256) fail(`${pin.file}: the bytes do not have the pinned sha256`);
  const date = /^retire-([0-9]{4}-[0-9]{2}-[0-9]{2})\.json$/.exec(pin.file)?.[1] ?? "";
  const day = Date.parse(`${date}T00:00:00Z`);
  if (!(day >= 0 && new Date(day).toISOString().startsWith(date))) fail(`${pin.file}: the file is not named retire-<YYYY-MM-DD>.json (no directory) on a real day`);
  const top = closed<{ readonly entries: readonly unknown[] }>(canonical(pin), { entries: Array.isArray, format: (v) => v === "kata-retire-v1" }, pin.file);
  const entries = top.entries.map((e, i) => closed<RetireEntry>(e, ENTRY, `${pin.file} entries[${String(i)}]`));
  entries.forEach((e, i) => {
    const p = entries[i - 1];
    if (p !== undefined && (p.task_class > e.task_class || (p.task_class === e.task_class && (p.cell_key > e.cell_key || (p.cell_key === e.cell_key && p.calib_attempt >= e.calib_attempt))))) fail(`${pin.file}: entries not sorted by (task_class, cell_key, calib_attempt), or a repeated key, at ${e.task_class} ${e.cell_key} (one entry per attempt of a cell, in attempt order)`);
  });
  const cells = new Map(readRegistry(registryBytes).map((c) => [`${c.taskClass} ${c.key}`, c] as const));
  for (const e of entries) {
    const [at, child] = [`${pin.file} ${e.task_class} ${e.cell_key}`, children.get(`${e.task_class} ${e.cell_key}`)];
    const c = cells.get(`${e.task_class} ${e.cell_key}`) ?? fail(`${at}: names no cell of the registry`);
    const now = attemptAt(child, date, at); if (!(e.calib_attempt === now || (e.calib_attempt === 1 && carried(previous, e)))) fail(`${at}: retires attempt ${String(e.calib_attempt)}, not the current attempt ${String(now)} of its cell on ${date} (an entry carried unchanged from the previous list keeps attempt 1)`);
    const st = e.calib_attempt === 1 ? c.status : (child?.status ?? ""); if (st !== "region") fail(`${at}: retires a cell that serves no region (registry status ${st})`);
    const k = retireQuarter(e.cause) ?? fail(`${at}: has a cause outside live:<k> and adr:decisions/<file>.md (epoch:<id> needs the pinned epoch log)`);
    if (k > 0 ? !(e.n_test !== null && e.k_test !== null && e.u_test !== null && e.n_test >= 1 && e.k_test <= e.n_test) : [e.k_test, e.n_test, e.u_test].some((x) => x !== null)) fail(`${at}: has counts off its cause (live:<k>: 1 <= n_test, k_test <= n_test, u_test set; adr: none)`);
    if (k > 0 && (e.n_test ?? 0) > (LIVE_N_MAX[c.horizon] ?? 0)) fail(`${at}: has an n_test above LIVE_N_MAX at ${c.horizon}, the longest quarter (ADR 0006 addendum 9 point 5)`);
    if (k > 0 && !(Date.UTC(2026, 9 + 3 * k, 1) <= day)) fail(`${at}: names live:${String(k)}, a quarter that ends after the list's date ${date} (ADR 0006 addendum 9 points 1 and 6)`);
  }
  const kept = new Set(entries.map((e) => canonicalJson(e)));
  if (previous !== undefined && !(previous.date < date && previous.entries.every((e) => kept.has(canonicalJson(e))))) fail(`${pin.file}: drops or changes an entry of the list of ${previous.date}, or is not dated after it (a list cumulates every earlier retire)`);
  return { date, entries };
}

/**
 * The attempt 2 of a wave 2 core cell (FORMAT-wave2.md, the 40 band cells of wave 1 recalibrated at calib_attempt 2): the registry
 * status of its row and the day, YYYY-MM-DD, from which that row is current (a pinned date, that of the first dated version of its
 * class's table that carries it; final check of the wave 2 format, M-2). The caller reads wave2.json with its closed reader and pins the day.
 */
export type ChildCell = { readonly status: string; readonly current: string };
/** The children a list is read against, keyed `<task_class> <cell_key>`. None (the guard today): every cell is at attempt 1. */
export type ChildCells = ReadonlyMap<string, ChildCell>;

/** The current attempt of a cell at a list's date (FORMAT-wave2.md, the quarter counts): 2 in a list dated on or after the day its child is current, 1 before it or without a child. */
function attemptAt(child: ChildCell | undefined, date: string, at: string): number {
  if (child !== undefined && !realDay(child.current)) fail(`${at}: has a child whose current day '${child.current}' is not a real day YYYY-MM-DD`);
  return child !== undefined && child.current <= date ? 2 : 1;
}

/** An entry carried unchanged from the previous list: its canonical writing is one of that list's entries (the test of the cumulative rule). */
function carried(previous: RetireList | undefined, e: RetireEntry): boolean {
  return previous?.entries.some((x) => canonicalJson(x) === canonicalJson(e)) === true;
}

/** A day written YYYY-MM-DD that exists in the calendar (no 2027-02-30). */
function realDay(d: string): boolean {
  const t = Date.parse(`${d}T00:00:00Z`);
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d) && t >= 0 && new Date(t).toISOString().startsWith(d);
}
