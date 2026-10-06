// apps/site/lib/dojo-lookup.ts -- the look-up of one address among the lines of the table of /dojo (components/dojo/dojo-table.tsx).
// PURE and DUAL-COMPILE (as lib/dojo-live.ts): no I/O, no value import, no alias. The text typed is reduced by trim(), then checked
// by the rule of the reader's tool BEFORE any use (ownerClass of apps/dojo/scripts/dojo-core.mjs does not throw on it: pinned equal
// by test), then searched EXACTLY among the rows already bound, in the order of the signed file (strict byte order of addresses), by
// bisection. It enters no request and no link, it is never kept, and an outcome never carries it: the row found, or no row.
import type { DojoTable, DojoTableRow } from "./dojo-served.ts";

/** The Bitcoin alphabet of base58: the digits but zero, the letters but capital O, capital I and small l. */
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** An address as the reader's tool admits one, after trim(): 32 to 44 characters of the alphabet whose base58 value, BigInt-exact,
 *  is 32 bytes, each leading "1" a zero byte. */
export function isDojoAddress(typed: string): boolean {
  const s = typed.trim();
  if (s.length < 32 || s.length > 44 || [...s].some((c) => !B58.includes(c))) return false;
  let x = 0n, n = 0;
  for (const c of s) x = x * 58n + BigInt(B58.indexOf(c));
  for (; x > 0n; x >>= 8n) n++;
  for (let k = 0; k < s.length && s[k] === "1"; k++) n++;
  return n === 32;
}

/** The row of `address` among `bound`, whose addresses are in strict byte order (checked when the table was bound), by bisection;
 *  base58 is ASCII, so the order of its code units is the order of its bytes. */
export function findDojoRow(bound: readonly DojoTableRow[], address: string): DojoTableRow | null {
  let lo = 0, hi = bound.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1, row = bound[mid] as DojoTableRow;
    if (row.address === address) return row;
    if (row.address < address) lo = mid + 1;
    else hi = mid;
  }
  return null;
}

/** A look-up: not an address, no line for it, or its row. The text typed is never part of it. */
export type DojoLookup = { kind: "invalid" | "absent" } | { kind: "found"; row: DojoTableRow };
export function dojoLookupOf(typed: string, bound: readonly DojoTableRow[]): DojoLookup {
  if (!isDojoAddress(typed)) return { kind: "invalid" };
  const row = findDojoRow(bound, typed.trim());
  return row === null ? { kind: "absent" } : { kind: "found", row };
}

/** The look-up of the table (components/dojo/dojo-table.tsx): the text typed, searched among EVERY line bound, a line the table does not
 *  list included (under the dust threshold of a version in force), never among the lines shown; no look-up before the lines are bound. */
export function dojoTableLookupOf(typed: string, table: DojoTable): DojoLookup | null {
  return table.kind === "rows" ? dojoLookupOf(typed, table.bound) : null;
}
