// test/spec-1-1-0-release.test.ts -- lot SPEC-1-1-0-RELEASE: the contract-1.1.0 version of the public spec repository. Its governance
// sources under spec/contract-1.1.0/ (published under contract-1.1.0/) are derived by scripts/spec-policy-tables.mjs: the schema copies
// are the frozen schemas under a closed replacement list, each table file is the served table (served table = published table), and
// scripts/spec-publish-inputs.json declares the version. Offline: no network, no other repository read, nothing written outside the OS
// temp directory. The writer is loaded on demand, so the base, which lacks it and the files, reddens by assertion. Each test names on the
// line above it the production mutation that reddens it (red-proof convention).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Canonical } from "@monark/contracts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../apps/harness/src/calibration.ts";
import { runGate, SCHEMA_VERSION, SERVED_POLICY_TABLES } from "../apps/harness/src/tools/gate.ts";
import { canonicalJson, contentProblems, loadInputs, plan } from "../scripts/spec-publish.mjs";
import type { Inputs } from "../scripts/spec-publish.mjs";

type Writer = typeof import("../scripts/spec-policy-tables.mjs");
type Validator = { (v: unknown): boolean; errors?: unknown };
type Ajv = { addSchema: (s: unknown) => Ajv; getSchema: (id: string) => Validator | undefined };
const require = createRequire(import.meta.url);
const ajvMod = require("ajv/dist/2020") as { default?: new (o: object) => Ajv } & (new (o: object) => Ajv);
const Ajv2020 = ajvMod.default ?? ajvMod;
const addFormatsMod = require("ajv-formats") as { default?: (a: Ajv) => void } & ((a: Ajv) => void);
const addFormats = addFormatsMod.default ?? addFormatsMod;
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const WRITER = join(ROOT, "scripts", "spec-policy-tables.mjs");
const OUT = join(ROOT, "spec", "contract-1.1.0");
const PREVIOUS = "ddfee9e076d979081fa7b21ec27940e3556bacf7";
/** The 1.1.0 specification text and its vectors, from the recherches root, pinned (their G2 may move these two digests). */
const SPEC_TEXT: [string, string, string, string][] = [
  ["contract-1.1.0/CONTRACT.md", "kata/spec/CONTRACT-1.1.0.md", "text", "642ac97e4c07d5cc1f8b6d3db6e5ab9f4a78a0f566633f0dc01ae0cd59bfbca0"],
  ["contract-1.1.0/vectors-1.1.0.json", "kata/spec/vectors-1.1.0.json", "json", "1210637f761e4c470f998566e6bbd4694a29049a7c91f4aeb73f6658da3dc347"],
];
const NAMES = ["coverage-verdict", "gate-decision", "policy-row", "prediction", "tool-error"];
const ID = (n: string): string => `https://github.com/KraidleAI/monark-kata-spec/raw/main/contract-1.1.0/schemas/${n}.schema.json`;
/** The published copies, byte for byte (G0 annex A, after the G2 of part a). */
const COPY_SHA256: Record<string, string> = {
  "coverage-verdict": "90e8fc0d91c760738e56523799c13d6393d5671fdfba1379e7ef2715426047a7", "gate-decision": "b6db2d362e7577c119aa47c2b4011eefe9d6955aedfc438a0648cf602637fbcf",
  "policy-row": "2dc64bd6292f4ada2c84f74c9b4cb79b0c54ba2ce94058d46203c50fa5a6e7bb", prediction: "54e9210627090aed365c5b1aa79b2ed7e7180d56a09c656095198983cc1c3a89",
  "tool-error": "8e7177c77688afec4dc837944a65cb8504ae57658a76583a702c837d6750acaf",
};
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
const run = (script: string, ...a: string[]): { status: number | null; stdout: string } => spawnSync(process.execPath, [script, ...a], { encoding: "utf8" });

// killer: scripts/spec-policy-tables.mjs:32 CONST "never an investment return" -> "always an investment return"
test("published_schemas_differ_from_the_frozen_ones_by_annotations_only", async () => {
  const w = await writer(), strip = (v: Record<string, unknown>): Record<string, unknown> => ({ ...v, $id: null, description: null });
  assert.deepEqual([...w.SCHEMA_NAMES].sort(), NAMES);
  for (const n of NAMES) {
    const frozen = readFileSync(join(ROOT, "schemas", `${n}.schema.json`), "utf8"), b = bytes(OUT, "schemas", `${n}.schema.json`), copy = b.toString("utf8");
    const [f, c] = [frozen, copy].map((s) => JSON.parse(s) as Record<string, unknown>) as [Record<string, unknown>, Record<string, unknown>];
    assert.equal(copy, w.schemaCopy(n, frozen), n);
    assert.deepEqual([sha(b), copy.includes("\r"), contentProblems(`contract-1.1.0/schemas/${n}.schema.json`, "schema", b)], [COPY_SHA256[n], false, []], n);
    assert.deepEqual([canonicalJson(strip(c)) === canonicalJson(strip(f)), c.$id, frozen.split("\n").length], [true, ID(n), copy.split("\n").length], n);
  }
  assert.ok(readFileSync(join(OUT, "schemas", "gate-decision.schema.json"), "utf8").includes("depletable, never an investment return or income paid to anyone."));
  assert.throws(() => w.schemaCopy("prediction", "{}"), /does not occur exactly once/);
});

// killer: scripts/spec-policy-tables.mjs:39 CONST "\"$id\": \"${publicId(name)}\"" -> "\"$id\": \"${publicId(\"x\")}\""
test("the_published_schemas_load_together_and_validate_a_served_decision", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajv);
  const files = await (await writer()).expectedFiles(ROOT);
  for (const f of files.filter((x) => x.path.includes("/schemas/"))) ajv.addSchema(JSON.parse(f.text));
  const validate = ajv.getSchema(ID("gate-decision"));
  assert.ok(validate !== undefined, "gate-decision is found by its public $id");
  const params = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
  const decision = runGate({ schema_version: SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: USDE_STABLE_RUN_PREDICTOR_ID, produced_at: "2026-09-04T00:00:00Z" }, params);
  assert.equal(validate(decision), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...decision, verdict: { ...decision.verdict, alpha: "0.1" } }), false, "the coverage-verdict $ref is followed");
  const table = ajv.getSchema(ID("policy-row"));
  assert.ok(table !== undefined);
  for (const f of files.filter((x) => x.path.includes("/policy/"))) assert.equal(table(JSON.parse(f.text)), true, `${f.path} ${JSON.stringify(table.errors)}`);
});

// killer: scripts/spec-publish-inputs.json:63 CONST "\"root\": \"previous\"" -> "\"root\": \"recherches\""
test("contract_1_1_0_declares_every_published_file_pinned", () => {
  const r = release(), wave1 = new Map(loadInputs().releases["kata-wave1"]?.entries.map((e) => [e.out, e]));
  const carried = ["KATA-SPEC.md", "reports/README.md", "reports/wave1-report.md", "vectors.json"];
  const outs = [...carried, ...SPEC_TEXT.map((x) => x[0]), ...NAMES.map((n) => `contract-1.1.0/schemas/${n}.schema.json`), ...SERVED_POLICY_TABLES.map((t) => `contract-1.1.0/policy/${t.task_class}.json`)].sort();
  assert.deepEqual([r.previous_commit, r.entries.map((e) => e.out), SERVED_POLICY_TABLES.length], [PREVIOUS, outs, 35]);
  for (const e of r.entries) {
    const text = SPEC_TEXT.find((x) => x[0] === e.out);
    if (text !== undefined) assert.deepEqual([e.root, e.path, e.kind, e.sha256], ["recherches", text[1], text[2], text[3]], e.out);
    else if (carried.includes(e.out)) assert.deepEqual([e.root, e.path, e.kind, e.sha256], ["previous", e.out, wave1.get(e.out)?.kind, wave1.get(e.out)?.sha256], e.out);
    else assert.deepEqual([e.root, e.path, e.kind, e.sha256], ["governance", `spec/${e.out}`, e.out.includes("/policy/") ? "policy-table" : "schema", sha(bytes(ROOT, e.path))], e.out);
  }
  for (const e of r.entries.filter((x) => x.kind === "schema")) assert.equal(e.sha256, COPY_SHA256[e.out.slice("contract-1.1.0/schemas/".length, -".schema.json".length)], e.out);
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

// killer: scripts/spec-policy-tables.mjs:51 CONST "r.recompute !== null" -> "r.recompute === undefined"
test("no_table_with_a_recompute_row_is_published_before_the_verifier_list", async () => {
  const w = await writer(), held = SERVED_POLICY_TABLES.flatMap((t) => t.table.rows.filter((r) => r.recompute !== null).map((r) => `${t.task_class} ${r.cell_key}`));
  assert.deepEqual(held, [], "VERIFIERS-LIST-F5A-1: a published row with a recompute needs the published list of verifiers first");
  const t = SERVED_POLICY_TABLES.find((x) => x.task_class === "stable-run-velocity-24h")?.table, row = t?.rows[0];
  assert.ok(t !== undefined && row !== undefined);
  const recompute = { verifier: "v@1", scores_sha256: "a".repeat(64), report_sha256: "b".repeat(64) };
  assert.equal(w.tableText(t), canonicalJson(t));
  assert.throws(() => w.tableText({ ...t, rows: [{ ...row, recompute }] }), /^Error: VERIFIERS-LIST-F5A-1: stable-run-velocity-24h has a row with a recompute/);
});

// killer: scripts/spec-policy-tables.mjs:53 CONST "r.n <= SHORT_N" -> "r.n < SHORT_N"
test("no_table_publishes_the_digest_of_a_sequence_of_30_points_or_fewer", async () => {
  const w = await writer(), t = SERVED_POLICY_TABLES.find((x) => x.task_class === "liquidation-eligible-coverage")?.table, row = t?.rows[0];
  assert.ok(t !== undefined && row !== undefined);
  assert.deepEqual([w.SHORT_N, SERVED_POLICY_TABLES.flatMap((x) => x.table.rows.map((r) => r.n)).sort((a, b) => a - b)], [30, [170, 613]]);
  assert.equal(w.tableText({ ...t, rows: [{ ...row, n: 31 }] }), canonicalJson({ ...t, rows: [{ ...row, n: 31 }] }));
  for (const n of [0, 1, 30]) {
    assert.throws(() => w.tableText({ ...t, rows: [{ ...row, n }] }), /^Error: SHORT-DIGEST-INVERSION-1: liquidation-eligible-coverage has a row whose digests cover 30 points or fewer/, String(n));
  }
});

// killer: scripts/spec-publish-inputs.json:56 CONST "\"root\": \"governance\"" -> "\"root\": \"recherches\""
test("contract_1_1_0_passes_the_spec_publish_gate_offline", () => {
  const r = release(), problems = plan({ inputs: loadInputs(), release: "contract-1.1.0", date: "2026-10-06", roots: { governance: ROOT } }).problems;
  assert.deepEqual(problems.map((p) => p.detail), [...r.entries.filter((e) => e.root !== "governance").map((e) => `${e.out}: root ${e.root} not given`), `previous tree at ${PREVIOUS} not given`]);
  for (const e of r.entries.filter((x) => x.root === "governance")) assert.deepEqual(contentProblems(e.out, e.kind, bytes(ROOT, e.path)), [], e.out);
  assert.deepEqual([r.entries.filter((e) => e.root === "governance").length, contentProblems("contract-1.1.0/policy/eth-dir-1h.json", "policy-table", bytes(OUT, "policy", "btc-dir-1h.json"))[0]?.code], [40, "policy_table_invalid"]);
});

// killer: scripts/spec-policy-tables.mjs:76 SDL "for (const p of existsSync(join(root, OUT_DIR)) ? tree(root, OUT_DIR) : []) if (!want.has(p)) out.push(`extra ${p}`);" -> ""
test("writer_check_reports_any_drift_in_a_copy_and_exits_by_it", async () => {
  const w = await writer(), root = join(TMP, "root"), out = join(root, "spec", "contract-1.1.0");
  cpSync(join(ROOT, "schemas"), join(root, "schemas"), { recursive: true });
  assert.deepEqual([run(WRITER, "--check", "--root", root).status, run(WRITER, "--write", "--root", root).status], [1, 0]);
  const files = await w.expectedFiles(root), written = readdirSync(join(out, "schemas")).sort();
  assert.deepEqual([files.length, w.differences(root, files), run(WRITER, "--check", "--root", root).status, written], [40, [], 0, NAMES.map((n) => `${n}.schema.json`)]);
  assert.ok(files.every((f) => readFileSync(join(root, f.path)).equals(Buffer.from(f.text)) && !f.text.includes("\r")), "LF bytes as computed");
  writeFileSync(join(out, "schemas", "policy-row.schema.json"), `${readFileSync(join(out, "schemas", "policy-row.schema.json"), "utf8")}\n`);
  writeFileSync(join(out, "stray.json"), "{}");
  mkdirSync(join(out, "policy"), { recursive: true });
  writeFileSync(join(out, "policy", "x.json"), "{}");
  rmSync(join(out, "schemas", "tool-error.schema.json"));
  assert.deepEqual(w.differences(root, files), ["differ spec/contract-1.1.0/schemas/policy-row.schema.json", "missing spec/contract-1.1.0/schemas/tool-error.schema.json",
    "extra spec/contract-1.1.0/policy/x.json", "extra spec/contract-1.1.0/stray.json"]);
  assert.deepEqual([run(WRITER, "--check", "--root", root).status, run(WRITER, "--bogus").status, run(WRITER, "--check", "--root").status], [1, 2, 2]);
  mkdirSync(join(out, "schemas", "tool-error.schema.json", "x"), { recursive: true }); // a rename that fails after the temporaries are written
  assert.deepEqual([run(WRITER, "--write", "--root", root).status, readdirSync(join(out, "schemas")).filter((n) => n.includes(".tmp-"))], [1, []]);
});

/** Each script run through a symlink in TMP: it must run, not exit 0 having done nothing. A win32 host without the privilege skips, named. */
function throughLink(t: { skip: (m: string) => void }, script: string, ...a: string[]): { status: number | null; stdout: string } | null {
  const link = join(TMP, `link-${String(Math.random()).slice(2)}.mjs`);
  try { symlinkSync(script, link); } catch (e) {
    if (process.platform === "win32") { t.skip(`symlink creation not permitted on win32: ${String(e)}`); return null; }
    throw e;
  }
  return run(link, ...a);
}

// killer: scripts/spec-policy-tables.mjs:112 CONST "return realpathSync(p);" -> "return resolve(p);"
test("the_writer_runs_when_called_through_a_link", async (t) => {
  await writer();
  const empty = join(TMP, "empty");
  mkdirSync(join(empty, "schemas"), { recursive: true });
  const r = throughLink(t, WRITER, "--check", "--root", empty);
  if (r !== null) assert.equal(r.status, 1, "main ran and refused the empty root");
});

// killer: scripts/spec-publish.mjs:243 CONST "const r = realpathSync(p);" -> "const r = resolve(p);"
test("spec_publish_runs_when_called_through_a_link", (t) => {
  const r = throughLink(t, join(ROOT, "scripts", "spec-publish.mjs"));
  if (r !== null) assert.equal(r.status, 2, "usage error: main ran");
});
