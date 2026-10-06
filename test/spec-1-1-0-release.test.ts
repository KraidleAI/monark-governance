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
import { canonicalJson, contentProblems, loadInputs, parseInputs, plan, tableRowProblems } from "../scripts/spec-publish.mjs";
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
/** The 1.1.0 specification text, its vectors and the root README, from the recherches root at 3712fc8, pinned. */
const SPEC_TEXT: [string, string, string, string][] = [
  ["README.md", "kata/spec/README-spec-root.md", "text", "71f64c8af6c47bb4c1b9f532de9d38845824abf68e580bfccdbcd2f15bed4ecd"],
  ["contract-1.1.0/CONTRACT.md", "kata/spec/CONTRACT-1.1.0.md", "text", "b02b0599b3d00ae02aba8428ad712c4a3d52922dd7c55fb9da96b811bda68e1d"],
  ["contract-1.1.0/vectors-1.1.0.json", "kata/spec/vectors-1.1.0.json", "json", "190b9fd8f48815c10db2ff62be2961e601388f20b1d4a6e8dfb44ca139214d53"],
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

// killer: scripts/spec-publish-inputs.json:64 CONST "\"root\": \"previous\"" -> "\"root\": \"recherches\""
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

// killer: scripts/spec-publish.mjs:256 CONST "r.recompute !== null" -> "r.recompute === undefined"
test("no_table_with_a_recompute_row_is_published_before_the_verifier_list", async () => {
  const w = await writer(), held = SERVED_POLICY_TABLES.flatMap((t) => t.table.rows.filter((r) => r.recompute !== null).map((r) => `${t.task_class} ${r.cell_key}`));
  assert.deepEqual(held, [], "VERIFIERS-LIST-F5A-1: a published row with a recompute needs the published list of verifiers first");
  const t = SERVED_POLICY_TABLES.find((x) => x.task_class === "stable-run-velocity-24h")?.table, row = t?.rows[0];
  assert.ok(t !== undefined && row !== undefined);
  const recompute = { verifier: "v@1", scores_sha256: "a".repeat(64), report_sha256: "b".repeat(64) };
  assert.equal(w.tableText(t), canonicalJson(t));
  assert.throws(() => w.tableText({ ...t, rows: [{ ...row, recompute }] }), /^Error: VERIFIERS-LIST-F5A-1: stable-run-velocity-24h has a row with a recompute/);
  assert.deepEqual(tableRowProblems({ ...t, rows: [{ ...row, recompute }] }).map((p) => p.code), ["recompute_held"]);
});

// killer: scripts/spec-publish.mjs:257 CONST "r.n <= SHORT_N" -> "r.n < SHORT_N"
test("no_table_publishes_the_digest_of_a_sequence_of_30_points_or_fewer", async () => {
  const w = await writer(), t = SERVED_POLICY_TABLES.find((x) => x.task_class === "liquidation-eligible-coverage")?.table, row = t?.rows[0];
  assert.ok(t !== undefined && row !== undefined);
  assert.deepEqual([w.SHORT_N, SERVED_POLICY_TABLES.flatMap((x) => x.table.rows.map((r) => r.n)).sort((a, b) => a - b)], [30, [170, 613]]);
  assert.equal(w.tableText({ ...t, rows: [{ ...row, n: 31 }] }), canonicalJson({ ...t, rows: [{ ...row, n: 31 }] }));
  for (const n of [0, 1, 30]) {
    assert.throws(() => w.tableText({ ...t, rows: [{ ...row, n }] }), /^Error: SHORT-DIGEST-INVERSION-1: liquidation-eligible-coverage has a row whose digests cover 30 points or fewer/, String(n));
  }
  const why = (o: Record<string, unknown>): string[] => tableRowProblems({ ...t, rows: [{ ...row, ...o }] }).map((p) => p.detail.replace(/^.*: /, ""));
  const key = row.cell_key;
  assert.deepEqual([why({ n: 31, p_served: 31 }), why({ p_served: 30 }), why({ aux_sha256: "a".repeat(64) }), why({ series_sha256: "b".repeat(64), n: 30 })],
    [[], [`${key} (p_served 30)`], [`${key} (aux_sha256)`], [`${key} (n 30, series_sha256)`]]);
});

// killer: scripts/spec-policy-tables.mjs:60 CONST "text: tableText(t.table)" -> "text: canonicalJson(t.table)"
test("the_writer_refuses_through_expected_files_what_the_gate_refuses", async () => {
  const w = await writer(), t = SERVED_POLICY_TABLES.find((x) => x.task_class === "liquidation-eligible-coverage"), row = t?.table.rows[0];
  assert.ok(t !== undefined && row !== undefined);
  assert.equal((await w.expectedFiles(ROOT, [t])).length, 6);
  await assert.rejects(w.expectedFiles(ROOT, [{ ...t, table: { ...t.table, rows: [{ ...row, n: 30 }] } }]), /^Error: SHORT-DIGEST-INVERSION-1/);
  await assert.rejects(w.expectedFiles(ROOT, [{ ...t, table: { ...t.table, rows: [{ ...row, recompute: { verifier: "v@1", scores_sha256: "a".repeat(64), report_sha256: "b".repeat(64) } }] } }]), /^Error: VERIFIERS-LIST-F5A-1/);
});

/** A governance root holding one hand-edited table file, and a one-entry release that pins its bytes again (the G2's hack inputs). */
function repinned(edit: (row: Record<string, unknown>) => void): { gov: string; inputs: Inputs; file: string } {
  const gov = mkdtempSync(join(TMP, "gov-")), rel = "spec/contract-1.1.0/policy/stable-run-velocity-24h.json";
  const table = JSON.parse(readFileSync(join(ROOT, rel), "utf8")) as { rows: Record<string, unknown>[] };
  edit(table.rows[0] ?? {});
  const text = canonicalJson(table), file = join(gov, "inputs.json");
  mkdirSync(join(gov, "spec", "contract-1.1.0", "policy"), { recursive: true });
  writeFileSync(join(gov, rel), text);
  const inputs: Inputs = { format: "spec-inputs-v1", releases: { "contract-1.1.0": { previous_commit: null, entries: [
    { out: "contract-1.1.0/policy/stable-run-velocity-24h.json", root: "governance", path: rel, kind: "policy-table", sha256: sha(text) }] } } };
  writeFileSync(file, JSON.stringify(inputs));
  return { gov, inputs, file };
}

// killer: scripts/spec-publish.mjs:133 CONST "tableRowProblems(v)" -> "tableRowProblems({})"
test("spec_publish_refuses_a_hand_edited_table_even_pinned_again", () => {
  const cases: [(r: Record<string, unknown>) => void, string][] = [[(r) => { r.n = 30; }, "short_digest"],
    [(r) => { r.recompute = { verifier: "someone@1", scores_sha256: "a".repeat(64), report_sha256: "b".repeat(64) }; }, "recompute_held"]];
  for (const [edit, code] of cases) {
    const { gov, inputs, file } = repinned(edit), out = join(gov, "out");
    assert.deepEqual(plan({ inputs, release: "contract-1.1.0", date: "2026-10-06", roots: { governance: gov } }).problems.map((p) => p.code), [code]);
    const r = spawnSync(process.execPath, [join(ROOT, "scripts", "spec-publish.mjs"), "--release", "contract-1.1.0", "--date", "2026-10-06", "--out", out, "--inputs", file, "--root", `governance=${gov}`], { encoding: "utf8" });
    assert.deepEqual([r.status, r.stderr.includes(code), existsSync(out)], [1, true, false], code);
  }
});

// killer: scripts/spec-publish.mjs:131 CONST "&& at[1] !== release" -> "&& false"
test("a_table_file_lies_at_policy_or_under_its_own_release_directory_only", () => {
  const table = bytes(OUT, "policy", "btc-dir-1h.json"), codes = (out: string, rel?: string): string[] => contentProblems(out, "policy-table", table, rel).map((p) => p.code);
  assert.deepEqual([codes("contract-1.1.0/policy/btc-dir-1h.json", "contract-1.1.0"), codes("policy/btc-dir-1h.json", "contract-1.1.0"), codes("policy/btc-dir-1h.json")], [[], [], []]);
  for (const out of ["policy/policy/btc-dir-1h.json", ".../policy/btc-dir-1h.json", "-/policy/btc-dir-1h.json", "reports/policy/btc-dir-1h.json", "contract-9.9.9/policy/btc-dir-1h.json",
    "../policy/btc-dir-1h.json", "contract-1.1.0/policy/x/btc-dir-1h.json", "contract-1.1.0/policy/btc-dir-4h.json"]) assert.deepEqual(codes(out, "contract-1.1.0"), ["policy_table_invalid"], out);
  assert.deepEqual(codes("contract-1.1.0/policy/btc-dir-1h.json"), ["policy_table_invalid"], "no release, no version directory");
});

// killer: scripts/spec-publish.mjs:35 CONST "!/^\\.+$/.test(s)" -> "!/^\\.\\.?$/.test(s)"
test("an_output_path_has_no_segment_made_of_dots_only", () => {
  const make = (out: string): unknown => ({ format: "spec-inputs-v1", releases: { v: { previous_commit: null, entries: [{ out, root: "recherches", path: "a.md", kind: "text", sha256: "0".repeat(64) }] } } });
  for (const out of [".../a.md", "a/.../b.md", "a/..../b.md", "a/...", "./a.md"]) assert.throws(() => parseInputs(make(out)), /inputs_invalid/, out);
  for (const out of ["a.md", ".a/b.md", "a/b..c.md", "a/.b"]) assert.doesNotThrow(() => parseInputs(make(out)), out);
});

/** A previous tree (a git repository) that already publishes a versioned file and the root KATA-SPEC.md. */
function previousTree(): { dir: string; head: string } {
  const dir = mkdtempSync(join(TMP, "prev-")), git = (...a: string[]): string => {
    const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t.invalid", "-c", "commit.gpgsign=false", ...a], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  mkdirSync(join(dir, "contract-1.1.0"));
  writeFileSync(join(dir, "contract-1.1.0", "a.json"), "{}\n");
  writeFileSync(join(dir, "KATA-SPEC.md"), "# Old\n");
  git("init", "-q"); git("add", "-A"); git("commit", "-qm", "v");
  return { dir, head: git("rev-parse", "HEAD") };
}

// killer: scripts/spec-publish.mjs:172 CONST "!now.bytes.equals(" -> "now.bytes.equals("
test("a_file_under_a_version_directory_is_never_rewritten", () => {
  const prev = previousTree(), gov = mkdtempSync(join(TMP, "gov-"));
  writeFileSync(join(gov, "same.json"), "{}\n"); writeFileSync(join(gov, "other.json"), "{\"a\":1}\n"); writeFileSync(join(gov, "spec.md"), "# New\n");
  const entry = (out: string, path: string, kind: "json" | "text"): Inputs["releases"][string]["entries"][number] => ({ out, root: "governance", path, kind, sha256: sha(readFileSync(join(gov, path))) });
  const problems = (versioned: string): string[] => plan({ inputs: { format: "spec-inputs-v1", releases: { v: { previous_commit: prev.head, entries: [
    entry("contract-1.1.0/a.json", versioned, "json"), entry("KATA-SPEC.md", "spec.md", "text")] } } }, release: "v", date: "2026-10-06", roots: { governance: gov, previous: prev.dir } }).problems.map((p) => `${p.code} ${p.detail}`);
  assert.deepEqual([problems("same.json"), problems("other.json")], [[], ["rewritten contract-1.1.0/a.json is published with other bytes, the release changes it"]]);
});

// killer: scripts/spec-publish-inputs.json:57 CONST "\"root\": \"governance\"" -> "\"root\": \"recherches\""
test("contract_1_1_0_passes_the_spec_publish_gate_offline", () => {
  const r = release(), problems = plan({ inputs: loadInputs(), release: "contract-1.1.0", date: "2026-10-06", roots: { governance: ROOT } }).problems;
  assert.deepEqual(problems.map((p) => p.detail), [...r.entries.filter((e) => e.root !== "governance").map((e) => `${e.out}: root ${e.root} not given`), `previous tree at ${PREVIOUS} not given`]);
  for (const e of r.entries.filter((x) => x.root === "governance")) assert.deepEqual(contentProblems(e.out, e.kind, bytes(ROOT, e.path), "contract-1.1.0"), [], e.out);
  assert.deepEqual([r.entries.filter((e) => e.root === "governance").length, contentProblems("contract-1.1.0/policy/eth-dir-1h.json", "policy-table", bytes(OUT, "policy", "btc-dir-1h.json"), "contract-1.1.0")[0]?.code], [40, "policy_table_invalid"]);
});

// killer: scripts/spec-policy-tables.mjs:74 SDL "for (const p of existsSync(join(root, OUT_DIR)) ? tree(root, OUT_DIR) : []) if (!want.has(p)) out.push(`extra ${p}`);" -> ""
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
  mkdirSync(join(out, "schemas", "tool-error.schema.json", "x"), { recursive: true }); // the last rename fails, after 39 have replaced their file
  assert.deepEqual([run(WRITER, "--write", "--root", root).status, readdirSync(join(out, "schemas")).filter((n) => n.includes(".tmp-"))], [1, []]);
  assert.deepEqual(w.differences(root, files), ["differ spec/contract-1.1.0/schemas/policy-row.schema.json", "differ spec/contract-1.1.0/schemas/tool-error.schema.json",
    "extra spec/contract-1.1.0/policy/x.json", "extra spec/contract-1.1.0/stray.json"], "the replaced files have their previous bytes back");
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

// killer: scripts/spec-policy-tables.mjs:116 CONST "return realpathSync(p);" -> "return resolve(p);"
test("the_writer_runs_when_called_through_a_link", async (t) => {
  await writer();
  const empty = join(TMP, "empty");
  mkdirSync(join(empty, "schemas"), { recursive: true });
  const r = throughLink(t, WRITER, "--check", "--root", empty);
  if (r !== null) assert.equal(r.status, 1, "main ran and refused the empty root");
});

// killer: scripts/spec-publish.mjs:264 CONST "const r = realpathSync(p);" -> "const r = resolve(p);"
test("spec_publish_runs_when_called_through_a_link", (t) => {
  const r = throughLink(t, join(ROOT, "scripts", "spec-publish.mjs"));
  if (r !== null) assert.equal(r.status, 2, "usage error: main ran");
});
