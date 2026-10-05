/**
 * schemas/policy-row.schema.json on the admitted corpus (contract 1.1.0, block C, lot CM-3c-2; decision Q-C4, condition 1): the 32 kata
 * tables projected from the synthetic registry of seed 37 (blocks B1, B2; admitted by guardKataTable) and the 35 tables of
 * servedPolicyTables on synthetic texts are valid; four row statuses (retired: packages/contracts) and the four region rules are
 * reached. Pinned gap: a second current row for one cell is valid for the schema, refused by assertPolicyTableFile. No real text.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { kataClassEntries } from "../src/policy-classes.ts";
import { guardKataTable, type GuardPins } from "../src/policy-guard.ts";
import { projectCell, readRegistry } from "../src/policy-projection.ts";
import { assertPolicyTableFile, buildPolicyTable } from "../src/policy-table-file.ts";
import { servedPolicyTables } from "../src/kata-path.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const require = createRequire(import.meta.url);
const Ajv = (require("ajv/dist/2020.js") as { default: new (o: object) => { compile: (s: unknown) => (v: unknown) => boolean } }).default;
const FILE = new URL("../../../schemas/policy-row.schema.json", import.meta.url); // absent: the test fails by an assertion, not at load
const valid = new Ajv({ strict: true, allowUnionTypes: true }).compile(existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : { not: {} });
const SYN = syntheticRegistry();
const PINS: GuardPins = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator", verifiers: ["verifier-b", "synthetic-generator"],
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};

// killer: schemas/policy-row.schema.json:12 CONST "{7}" -> "{6}"
test("policy_row_schema_admits_the_synthetic_kata_tables_and_the_served_tables", () => {
  const kata = kataClassEntries((c) => `class text of ${c}`).map((e) => {
    const t = buildPolicyTable(e, readRegistry(SYN.bytes).filter((c) => c.taskClass === e.task_class).map((c) => projectCell(c, PINS)).filter((r) => r !== null));
    guardKataTable(t, SYN.bytes, PINS, e);
    return t;
  });
  const served = servedPolicyTables({ classText: (c) => `class text of ${c}`, marginal: () => ({ registry_file: "r", registry_sha256: "ab".repeat(32), generator: "g", text: "t" }) }).map((s) => s.table);
  assert.deepEqual([kata.length, served.length], [32, 35]);
  for (const t of [...kata, ...served]) assert.ok(valid(t), t.class.task_class);
  const rows = [...kata, ...served].flatMap((t) => t.rows);
  assert.deepEqual([...new Set(rows.map((r) => r.status))].sort(), ["region", "silence", "under_calib", "vetoed"]);
  assert.deepEqual([...new Set(rows.map((r) => r.region_rule))].sort(), ["additive-band", "scaled-band", "sign-set", "upper-bound"]);
  const first = kata[0] ?? assert.fail("no kata table"), twice = { ...first, rows: [...first.rows, ...first.rows.slice(0, 1)] };
  assert.ok(valid(twice) && (() => { try { assertPolicyTableFile(twice); return false; } catch { return true; } })(), "gap: the file rules are the server's");
});
