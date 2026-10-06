// test/spec-1-1-0-release.test.ts -- lot SPEC-1-1-0-RELEASE: the contract-1.1.0 version of the public spec repository. Its governance
// sources under spec/contract-1.1.0/ are derived by scripts/spec-policy-tables.mjs (served table = published table; schema copies = the
// frozen schemas under a closed replacement list), and scripts/spec-publish-inputs.json declares the version. Offline: no network, no
// other repository read, nothing written outside the OS temp directory. The writer is loaded on demand, so the base, which lacks it and
// the files, reddens by assertion. Each test names on the line above it the production mutation that reddens it (red-proof convention).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Canonical } from "@monark/contracts";
import { SERVED_POLICY_TABLES } from "../apps/harness/src/tools/gate.ts";
import { canonicalJson, contentProblems, loadInputs, plan } from "../scripts/spec-publish.mjs";
import type { Inputs } from "../scripts/spec-publish.mjs";

type Writer = typeof import("../scripts/spec-policy-tables.mjs");
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const WRITER = join(ROOT, "scripts", "spec-policy-tables.mjs");
const OUT = join(ROOT, "spec", "contract-1.1.0");
const PREVIOUS = "ddfee9e076d979081fa7b21ec27940e3556bacf7";
const NAMES = ["coverage-verdict", "gate-decision", "policy-row", "prediction", "tool-error"];
let loaded: Writer | null = null;
async function writer(): Promise<Writer> {
  loaded ??= await import("../scripts/spec-policy-tables.mjs").then((m: Writer) => m, () => null);
  assert.ok(loaded !== null, "scripts/spec-policy-tables.mjs loads");
  return loaded;
}
const TMP = mkdtempSync(join(tmpdir(), "spec-1-1-0-"));
after(() => { rmSync(TMP, { recursive: true, force: true, maxRetries: 3 }); });
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const bytes = (...parts: string[]): Buffer => {
  const p = join(...parts);
  assert.ok(existsSync(p), `${p} exists`);
  return readFileSync(p);
};
const release = (): Inputs["releases"][string] => {
  const r = loadInputs().releases["contract-1.1.0"];
  assert.ok(r !== undefined, "scripts/spec-publish-inputs.json declares contract-1.1.0");
  return r;
};

// killer: scripts/spec-publish-inputs.json:61 CONST "\"root\": \"previous\"" -> "\"root\": \"recherches\""
test("contract_1_1_0_declares_every_published_file_pinned", () => {
  const r = release(), wave1 = new Map(loadInputs().releases["kata-wave1"]?.entries.map((e) => [e.out, e]));
  const carried = ["KATA-SPEC.md", "reports/README.md", "reports/wave1-report.md", "vectors.json"];
  const outs = [...carried, ...NAMES.map((n) => `schemas/${n}.schema.json`), ...SERVED_POLICY_TABLES.map((t) => `policy/${t.task_class}.json`)].sort();
  assert.deepEqual([r.previous_commit, r.entries.map((e) => e.out), SERVED_POLICY_TABLES.length], [PREVIOUS, outs, 35]);
  for (const e of r.entries) {
    if (carried.includes(e.out)) assert.deepEqual([e.root, e.path, e.kind, e.sha256], ["previous", e.out, wave1.get(e.out)?.kind, wave1.get(e.out)?.sha256], e.out);
    else assert.deepEqual([e.root, e.path, e.kind, e.sha256], ["governance", `spec/contract-1.1.0/${e.out}`, e.out.startsWith("policy/") ? "policy-table" : "schema", sha(bytes(ROOT, e.path))], e.out);
  }
});

// killer: spec/contract-1.1.0/policy/btc-dir-1h.json:1 CONST "\"rows\":[]" -> "\"rows\":[ ]"
test("published_tables_are_the_served_tables_byte_for_byte", () => {
  for (const t of SERVED_POLICY_TABLES) {
    const b = bytes(OUT, "policy", `${t.task_class}.json`);
    assert.deepEqual([b.toString("utf8") === canonicalJson(t.table), sha(b), sha(b)], [true, t.policy_table_sha256, sha256Canonical(t.table)], t.task_class);
  }
  assert.deepEqual(existsSync(join(OUT, "policy")) ? readdirSync(join(OUT, "policy")).sort() : [], SERVED_POLICY_TABLES.map((t) => `${t.task_class}.json`).sort());
  assert.deepEqual(SERVED_POLICY_TABLES.filter((t) => t.table.class.cell_key_rule === "kata-bucket").map((t) => t.table.rows.length), Array<number>(32).fill(0));
});

// killer: scripts/spec-policy-tables.mjs:23 CONST "\" ADR-M001 Decision 6.\"" -> "\" ADR-M001 Decision 7.\""
test("published_schemas_differ_from_the_frozen_ones_by_annotations_only", async () => {
  const w = await writer(), strip = (v: Record<string, unknown>): Record<string, unknown> => ({ ...v, $id: null, description: null });
  assert.deepEqual([...w.SCHEMA_NAMES].sort(), NAMES);
  for (const n of NAMES) {
    const frozen = readFileSync(join(ROOT, "schemas", `${n}.schema.json`), "utf8"), copy = bytes(OUT, "schemas", `${n}.schema.json`).toString("utf8");
    const [f, c] = [frozen, copy].map((s) => JSON.parse(s) as Record<string, unknown>) as [Record<string, unknown>, Record<string, unknown>];
    assert.equal(copy, w.schemaCopy(n, frozen), n);
    assert.deepEqual([canonicalJson(strip(c)) === canonicalJson(strip(f)), c.$id, frozen.split("\n").length], [true, `https://github.com/KraidleAI/monark-kata-spec/blob/main/schemas/${n}.schema.json`, copy.split("\n").length], n);
  }
  assert.throws(() => w.schemaCopy("prediction", "{}"), /does not occur exactly once/);
});

// killer: scripts/spec-publish-inputs.json:57 CONST "\"root\": \"governance\"" -> "\"root\": \"recherches\""
test("contract_1_1_0_passes_the_spec_publish_gate_offline", () => {
  const r = release(), problems = plan({ inputs: loadInputs(), release: "contract-1.1.0", date: "2026-10-06", roots: { governance: ROOT } }).problems;
  assert.deepEqual(problems.map((p) => p.detail), [...r.entries.filter((e) => e.root === "previous").map((e) => `${e.out}: root previous not given`), `previous tree at ${PREVIOUS} not given`]);
  for (const e of r.entries.filter((x) => x.root === "governance")) assert.deepEqual(contentProblems(e.out, e.kind, bytes(ROOT, e.path)), [], e.out);
  assert.equal(r.entries.filter((e) => e.root === "governance").length, 40);
});

// killer: scripts/spec-policy-tables.mjs:55 SDL "for (const p of [...listed(root, \"schemas\"), ...listed(root, \"policy\")]) if (!want.has(p)) out.push(`extra ${p}`);" -> ""
test("writer_check_reports_any_drift_in_a_copy_and_exits_by_it", async () => {
  const w = await writer(), root = join(TMP, "root"), out = join(root, "spec", "contract-1.1.0");
  cpSync(join(ROOT, "schemas"), join(root, "schemas"), { recursive: true });
  const run = (...a: string[]): number | null => spawnSync(process.execPath, [WRITER, ...a], { encoding: "utf8" }).status;
  assert.deepEqual([run("--check", "--root", root), run("--write", "--root", root)], [1, 0]);
  const files = await w.expectedFiles(root);
  assert.deepEqual([files.length, w.differences(root, files), run("--check", "--root", root), readdirSync(root).sort()], [40, [], 0, ["schemas", "spec"]]);
  const table = join(out, "policy", "btc-dir-1h.json");
  writeFileSync(table, `${readFileSync(table, "utf8")}\n`);
  writeFileSync(join(out, "policy", "extra.json"), "{}");
  rmSync(join(out, "schemas", "tool-error.schema.json"));
  assert.deepEqual(w.differences(root, files), ["differ spec/contract-1.1.0/policy/btc-dir-1h.json", "missing spec/contract-1.1.0/schemas/tool-error.schema.json", "extra spec/contract-1.1.0/policy/extra.json"]);
  assert.deepEqual([run("--check", "--root", root), run("--bogus"), run("--check", "--root")], [1, 2, 2]);
});
