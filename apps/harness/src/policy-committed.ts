/**
 * The committed kata tables of wave 1: the one disk read of the table files, at load (it sits in src/, not src/tools/, like
 * schema-projection.ts), and the closed reader that turns those bytes into the table of each pinned class. The pins are in
 * policy-committed-pins.ts; the caller passes them, with the kata class entries. The reader checks the files against the
 * pins and the table structure; it does not rerun the import guard, which the offline writer runs before it pins a table.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { canonicalJson, type ClassEntry, type PolicyTable } from "@monark/contracts";
import { assertPolicyTableFile } from "./policy-table-file.ts";

/** What the reader checks the files against: the pinned sha256 of each committed class, and the classes held back. */
export interface CommittedPins {
  readonly tables: Readonly<Record<string, string>>;
  readonly held: readonly string[];
}

const fail = (what: string): never => {
  throw new Error(`MONARK committed tables: ${what}.`);
};
const sha = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

/** The folder of the committed table files: one canonical line per class, <task_class>.json, no final line feed. */
export const TABLES_DIR = fileURLToPath(new URL("../data/kata/tables/", import.meta.url));

/** The bytes of each file of `dir`, keyed by task class (the file name without ".json"); an empty map when `dir` is absent. */
export function readTablesDir(dir: string): ReadonlyMap<string, Uint8Array> {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch (e) {
    if ((e as { code?: unknown }).code === "ENOENT") return new Map();
    throw e;
  }
  return new Map(names.sort().map((n) => [n.endsWith(".json") ? n.slice(0, -5) : fail(`${n} in the tables folder is not a .json file`), new Uint8Array(readFileSync(dir + n))]));
}

/** The committed table files, read once when this module loads. */
export const COMMITTED_FILES: ReadonlyMap<string, Uint8Array> = readTablesDir(TABLES_DIR);

/**
 * The table of each pinned class, or a throw naming the first departure: a pinned class has its file and a file its pin
 * (no file and no pin when the folder is absent); the bytes have the pinned sha256, are JSON and are the canonical writing
 * of their value; the row format is class-policy-v2; the class entry is the expected kata entry; assertPolicyTableFile holds.
 */
export function readCommittedTables(files: ReadonlyMap<string, Uint8Array>, entries: readonly ClassEntry[], pins: CommittedPins): ReadonlyMap<string, PolicyTable> {
  const pinned = Object.keys(pins.tables).sort();
  if (files.size === 0 && pinned.length > 0) fail(`the tables folder is absent or empty, but ${pinned.join(", ")} are pinned`);
  for (const cls of files.keys()) if (!Object.hasOwn(pins.tables, cls)) fail(`${cls}: a committed file without its pin`);
  const out = new Map<string, PolicyTable>();
  for (const cls of pinned) {
    const bytes = files.get(cls) ?? fail(`${cls}: a pinned class without its committed file`);
    if (sha(bytes) !== pins.tables[cls]) fail(`${cls}: the file bytes do not have the pinned sha256`);
    let table: PolicyTable;
    try {
      table = JSON.parse(new TextDecoder().decode(bytes)) as PolicyTable;
    } catch {
      table = fail(`${cls}: the file is not JSON`);
    }
    if (!Buffer.from(canonicalJson(table)).equals(bytes)) fail(`${cls}: the file is not the canonical writing of its table`);
    if ((table as Partial<PolicyTable> | null)?.row_format !== "class-policy-v2") fail(`${cls}: the row format is not class-policy-v2`);
    const entry = entries.find((e) => e.task_class === cls) ?? fail(`${cls}: no kata class entry for a pinned class`);
    if (canonicalJson(table.class) !== canonicalJson(entry)) fail(`${cls}: the class entry of the file differs from the expected entry`);
    assertPolicyTableFile(table);
    out.set(cls, table);
  }
  return out;
}
