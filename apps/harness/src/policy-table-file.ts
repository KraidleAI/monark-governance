/**
 * Class table files `class-policy-v2` (lot CM-4a-i, block B1 of 1.1.0; docs/G0-lot-cm-4a-i.md; spec section 10; A-2
 * section 2.2 point 1): one table file per class and its digest, and the byte for byte comparison of a table with its
 * expected class entry and the projection of a pinned registry file (the 32 kata class entries go to block B2, G0 cut).
 */
import { createHash } from "node:crypto";
import { assertClosedPolicyTable, canonicalJson, sha256Canonical, type ClassEntry, type PolicyRow, type PolicyTable } from "@monark/contracts";
import { projectCell, readRegistry, type ProjectionInputs } from "./policy-projection.ts";

const fail = (what: string): never => {
  throw new Error(`MONARK policy table: ${what}.`);
};

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const order = (a: PolicyRow, b: PolicyRow): number => cmp(a.task_class, b.task_class) || cmp(a.cell_key, b.cell_key) || a.calib_attempt - b.calib_attempt;

/** A table file: closed, every row of its class, sorted with a unique key, at most one current row per cell. */
export function assertPolicyTableFile(table: PolicyTable): void {
  assertClosedPolicyTable(table);
  const rows = table.rows;
  for (const r of rows) if (r.task_class !== table.class.task_class) fail(`a row of ${r.task_class} in the file of ${table.class.task_class}`);
  rows.forEach((r, i) => {
    if (i > 0 && order(rows[i - 1] as PolicyRow, r) >= 0) fail(`rows not sorted by (task_class, cell_key, calib_attempt) or a repeated key at ${r.cell_key}`);
  });
  const current = rows.filter((r) => r.current).map((r) => r.cell_key);
  if (new Set(current).size !== current.length) fail("two current rows for one (task_class, cell_key)");
}

/** The table file of one class, rows sorted; checked by assertPolicyTableFile. */
export function buildPolicyTable(cls: ClassEntry, rows: readonly PolicyRow[]): PolicyTable {
  const table: PolicyTable = { row_format: "class-policy-v2", class: cls, rows: [...rows].sort(order) };
  assertPolicyTableFile(table);
  return table;
}

/** policy_table_sha256: the digest of the canonical writing of the table file (spec section 10). */
export const policyTableSha256 = (table: PolicyTable): string => sha256Canonical(table);

/**
 * A-2 section 2.2 point 1: the class entry equals the expected one; the registry bytes have the pinned sha256; each
 * row equals, in canonical writing, the projection of its cell; each projectable cell of the class has exactly one row;
 * no row without a cell. Throws on the first difference, naming the class, the cell key and the column.
 */
export function assertTableMatchesRegistry(table: PolicyTable, registryBytes: Uint8Array, inp: ProjectionInputs, expected: ClassEntry): void {
  const cls = table.class.task_class;
  assertPolicyTableFile(table);
  if (canonicalJson(table.class) !== canonicalJson(expected)) fail(`${cls}: the class entry differs from the expected class entry`);
  if (createHash("sha256").update(registryBytes).digest("hex") !== inp.registrySha256) fail(`${cls}: the registry bytes do not have the pinned sha256`);
  const want = new Map<string, PolicyRow>();
  for (const cell of readRegistry(registryBytes)) {
    const row = cell.taskClass === cls ? projectCell(cell, inp) : null;
    if (row !== null) want.set(row.cell_key, row);
  }
  for (const row of table.rows) {
    const exp = want.get(row.cell_key) ?? fail(`${cls} ${row.cell_key}: a row without a registry cell`);
    for (const [k, v] of Object.entries(exp)) if (canonicalJson(row[k as keyof PolicyRow]) !== canonicalJson(v)) fail(`${cls} ${row.cell_key}: column ${k} differs from the projection`);
    want.delete(row.cell_key);
  }
  for (const key of want.keys()) fail(`${cls} ${key}: a projectable cell without its row`);
}
