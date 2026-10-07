/**
 * The committed kata tables of wave 1 (E-2a loader): the pins module and the closed reader of the table files, judged on
 * synthetic files; the folder is absent and the pins are empty, so the served tables do not move. Each test names its killer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, type PolicyRow, type PolicyTable } from "@monark/contracts";
import { kataClassEntries } from "../src/policy-classes.ts";
import { COMMITTED_FILES, readCommittedTables, readTablesDir, TABLES_DIR, type CommittedPins } from "../src/policy-committed.ts";
import * as PINS from "../src/policy-committed-pins.ts";
import { projectCell, readRegistry, type ProjectionInputs } from "../src/policy-projection.ts";
import { buildPolicyTable } from "../src/policy-table-file.ts";
import { importSpecifiers } from "./helpers/import-specifiers.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
/** The module specifiers of a source file, in every form and quote that importSpecifiers reads (servedModules reads the same). */
const importsOf = (file: string): string[] => importSpecifiers(readFileSync(join(SRC, file), "utf8"));
const ENTRIES = kataClassEntries((c) => `class text of ${c}`);
const SYN = syntheticRegistry();
const INP: ProjectionInputs = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator",
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const rowsOf = (c: string): PolicyRow[] => readRegistry(SYN.bytes).filter((x) => x.taskClass === c).map((x) => projectCell(x, INP)).filter((r) => r !== null);
const entry = (c: string) => ENTRIES.find((e) => e.task_class === c) ?? assert.fail(c);
const tableOf = (c: string): PolicyTable => buildPolicyTable(entry(c), rowsOf(c));
const bytesOf = (value: unknown, text = canonicalJson(value as PolicyTable)): Uint8Array => new TextEncoder().encode(text);
const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
const filesOf = (pairs: [string, Uint8Array][]): Map<string, Uint8Array> => new Map(pairs);
const pinsOf = (files: ReadonlyMap<string, Uint8Array>): CommittedPins => ({ tables: Object.fromEntries([...files].map(([c, b]) => [c, sha(b)])), held: [] });
const read = (files: ReadonlyMap<string, Uint8Array>, pins = pinsOf(files)) => readCommittedTables(files, ENTRIES, pins);
const TWO = filesOf([["btc-dir-1h", bytesOf(tableOf("btc-dir-1h"))], ["eth-mae-up-4h", bytesOf(tableOf("eth-mae-up-4h"))]]);
const one = (c: string, b: Uint8Array) => read(filesOf([[c, b]]));

// killer: apps/harness/src/policy-committed.ts:61 CONST "sha(bytes) !== pins.tables[cls]" -> "false"
test("committed_tables_reader_refuses_each_departure", () => {
  assert.ok(rowsOf("btc-dir-1h").length > 1 && rowsOf("eth-mae-up-4h").length > 0);
  assert.deepEqual([...read(TWO)], [["btc-dir-1h", tableOf("btc-dir-1h")], ["eth-mae-up-4h", tableOf("eth-mae-up-4h")]]);
  const t = tableOf("btc-dir-1h");
  const swapped = { tables: { ...pinsOf(TWO).tables, "btc-dir-1h": sha(TWO.get("eth-mae-up-4h") as Uint8Array) }, held: [] };
  assert.throws(() => read(TWO, swapped), /btc-dir-1h: the file bytes do not have the pinned sha256/);
  assert.throws(() => one("btc-dir-1h", bytesOf(t, canonicalJson(t).slice(0, -1))), /btc-dir-1h: the file is not JSON/);
  assert.throws(() => one("btc-dir-1h", bytesOf(t, `${canonicalJson(t)}\n`)), /not the canonical writing/);
  assert.throws(() => one("btc-dir-1h", bytesOf(t, JSON.stringify(t, null, 1))), /not the canonical writing/);
  const bad = bytesOf(t, canonicalJson(t).replace("class text of btc-dir-1h", "class text of btc-dir-1\u00e9"));
  bad.set([0xc3, 0x28], bad.indexOf(0xc3));
  assert.throws(() => one("btc-dir-1h", bad), /not the canonical writing/);
  const reversed = { tables: Object.fromEntries(Object.entries(pinsOf(TWO).tables).reverse()), held: [] };
  assert.deepEqual([...read(TWO, reversed).keys()], ["btc-dir-1h", "eth-mae-up-4h"]);
  assert.throws(() => one("btc-dir-1h", bytesOf({ ...t, row_format: "class-policy-v1" })), /row format is not class-policy-v2/);
  assert.throws(() => one("btc-dir-1h", bytesOf(null)), /row format is not class-policy-v2/);
  assert.throws(() => one("btc-dir-1h", bytesOf({ ...t, class: { ...t.class, text: "another text" } })), /class entry of the file differs/);
  assert.throws(() => one("btc-dir-1h", bytesOf(tableOf("btc-dir-4h"))), /class entry of the file differs/);
  assert.throws(() => one("btc-dir-1h", bytesOf({ ...t, rows: [...t.rows].reverse() })), /not sorted/);
  assert.throws(() => one("btc-dir-2h", bytesOf(t)), /btc-dir-2h: no kata class entry/);
});

// killer: apps/harness/src/policy-committed.ts:53 CONST "!Object.hasOwn(pins.tables, cls)" -> "!(cls in pins.tables)"
test("committed_tables_reader_pairs_each_pin_with_its_file", () => {
  const first = filesOf([...TWO].slice(0, 1));
  assert.throws(() => read(TWO, pinsOf(first)), /eth-mae-up-4h: a committed file without its pin/);
  assert.throws(() => read(filesOf([["constructor", bytesOf(tableOf("btc-dir-1h"))]]), pinsOf(new Map())), /constructor: a committed file without its pin/);
  assert.throws(() => read(first, pinsOf(TWO)), /eth-mae-up-4h: a pinned class without its committed file/);
  assert.throws(() => read(new Map(), pinsOf(TWO)), /the tables folder is absent or empty, but btc-dir-1h, eth-mae-up-4h are pinned/);
  assert.equal(read(new Map(), pinsOf(new Map())).size, 0);
});

// killer: apps/harness/src/policy-committed.ts:12 CONST "import { assertPolicyTableFile" -> "import \"./tools/gate.ts\"; import { assertPolicyTableFile"
test("committed_tables_folder_is_absent_and_read_once", () => {
  assert.ok(TABLES_DIR.endsWith(`${sep}apps${sep}harness${sep}data${sep}kata${sep}tables${sep}`) && !existsSync(TABLES_DIR));
  assert.equal(COMMITTED_FILES.size, 0);
  assert.equal(readCommittedTables(COMMITTED_FILES, ENTRIES, { tables: PINS.COMMITTED_TABLES, held: [...PINS.FLOOR_HELD_CLASSES, ...PINS.ORDER_HELD_CLASSES] }).size, 0);
  const dir = mkdtempSync(join(tmpdir(), "committed-tables-"));
  try {
    assert.equal(readTablesDir(join(dir, "absent") + sep).size, 0);
    for (const [c, b] of TWO) writeFileSync(join(dir, `${c}.json`), b);
    assert.deepEqual([...readTablesDir(dir + sep)], [...TWO]);
    writeFileSync(join(dir, "notes.txt"), "x");
    assert.throws(() => readTablesDir(dir + sep), /notes\.txt in the tables folder is not a \.json file/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const imports = importsOf("policy-committed.ts");
  const allowed = ["node:fs", "node:crypto", "node:url", "@monark/contracts", "./policy-table-file.ts", "./policy-committed-pins.ts", "./policy-classes.ts"];
  assert.ok(imports.length > 0 && imports.every((i) => allowed.includes(i)), imports.join(", "));
});

// killer: apps/harness/src/policy-committed.ts:57 SDL "if (Object.hasOwn(pins.tables, cls))" -> ""
test("committed_tables_reader_refuses_pinned_held_classes", () => {
  const band = filesOf([...TWO].slice(1));
  const held = [...PINS.FLOOR_HELD_CLASSES, ...PINS.ORDER_HELD_CLASSES];
  assert.throws(() => read(TWO, { ...pinsOf(TWO), held }), /btc-dir-1h: a class both pinned and held back/);
  assert.throws(() => read(band, { ...pinsOf(band), held: ["btc-dir-2h"] }), /btc-dir-2h: a held class that is not a kata class/);
  assert.throws(() => readCommittedTables(band, [...ENTRIES, entry("eth-mae-up-4h")], pinsOf(band)), /a kata class entry is repeated/);
  assert.deepEqual([...read(band, { ...pinsOf(band), held }).keys()], ["eth-mae-up-4h"]);
  const classes = ENTRIES.map((e) => e.task_class);
  assert.ok(classes.length === 32 && new Set([...classes, ...held, "eth-mae-up-4h"]).size === 32);
});

// killer: apps/harness/src/policy-committed.ts:73 CONST "kataKeyReserved(r.kata_id, r.venue)" -> "false"
test("committed_tables_reader_refuses_reserved_rows", () => {
  const t = tableOf("btc-dir-1h");
  const first = t.rows[0] as PolicyRow;
  for (const forged of [{ ...first, kata_id: "ca-probe" }, { ...first, venue: "ca-probe" }]) {
    const b = bytesOf({ ...t, rows: [forged, ...t.rows.slice(1)] });
    assert.throws(() => one("btc-dir-1h", b), new RegExp(`btc-dir-1h ${first.cell_key}: a row under a reserved kata id or venue`));
  }
  const names = [...readFileSync(join(SRC, "policy-committed.ts"), "utf8").matchAll(/^import \{([^}]*)\} from ["']\.\/policy-classes\.ts["']/gm)].flatMap((m) => (m[1] as string).split(",").map((n) => n.trim()).filter((n) => n !== ""));
  assert.equal(importsOf("policy-committed.ts").filter((i) => i === "./policy-classes.ts").length, 1, "one specifier of policy-classes.ts");
  assert.ok(names.length > 0 && names.every((n) => ["kataKeyReserved", "KATA_RESERVED_IDS"].includes(n)), names.join(", "));
});

// killer: apps/harness/src/policy-committed-pins.ts:11 CONST "\"bnb-dir-1h\"" -> "\"bnb-range-1h\""
test("committed_pins_start_empty_with_two_closed_held_lists", () => {
  assert.deepEqual(PINS.FLOOR_HELD_CLASSES, ["bnb-dir-4h", "btc-dir-4h", "eth-dir-4h", "sol-dir-4h"]);
  assert.deepEqual(PINS.ORDER_HELD_CLASSES, ENTRIES.map((e) => e.task_class).filter((c) => c.endsWith("-dir-1h")).sort());
  assert.deepEqual([PINS.COMMITTED_RETIRE_LISTS, PINS.COMMITTED_REPORTS, PINS.COMMITTED_TABLES, PINS.COMMITTED_REGISTRY], [[], [], {}, null]);
  const text = readFileSync(join(SRC, "policy-committed-pins.ts"), "utf8");
  const [above, block] = text.split("// BEGIN committed tables");
  assert.deepEqual([...(above ?? "").matchAll(/^export const (\w+)/gm)].map((m) => m[1]), ["FLOOR_HELD_CLASSES", "ORDER_HELD_CLASSES", "COMMITTED_RETIRE_LISTS", "COMMITTED_REPORTS"]);
  assert.deepEqual([...(block ?? "").matchAll(/^export const (\w+)/gm)].map((m) => m[1]), ["COMMITTED_TABLES", "COMMITTED_REGISTRY"]);
  assert.deepEqual(importsOf("policy-committed-pins.ts"), []);
  assert.ok((block ?? "").trimEnd().endsWith("// END committed tables"));
});

// killer: apps/harness/test/helpers/import-specifiers.ts:6 CONST "[\"']([^\"']+)[\"']" -> "\"([^\"]+)\""
test("import_specifiers_are_read_in_both_quotes", () => {
  const text = ["import './a.ts';", "export { b } from '../b.ts';", "void import('./c.ts');", "import { readFileSync } from 'node:fs';", "import {", "  d,", '} from "./d.ts";', "const u = import.meta.url; // read from the tables folder"].join("\n");
  assert.deepEqual(importSpecifiers(text), ["./a.ts", "../b.ts", "./c.ts", "node:fs", "./d.ts"]);
});
