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
import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Canonical } from "@monark/contracts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../apps/harness/src/calibration.ts";
import { runGate, SCHEMA_VERSION, SERVED_POLICY_TABLES } from "../apps/harness/src/tools/gate.ts";
import { COMMITTED_TABLES } from "../apps/harness/src/policy-committed-pins.ts";
import { canonicalJson, contentProblems, loadInputs, parseInputs, plan, validDate } from "../scripts/spec-publish.mjs";
import type { Inputs, Kind } from "../scripts/spec-publish.mjs";

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
/** The 1.1.0 specification text, its vectors and the root README, from the recherches root at 1107e12, pinned. */
const SPEC_TEXT: [string, string, string, string][] = [
  ["README.md", "kata/spec/README-spec-root.md", "text", "71f64c8af6c47bb4c1b9f532de9d38845824abf68e580bfccdbcd2f15bed4ecd"],
  ["contract-1.1.0/CONTRACT.md", "kata/spec/CONTRACT-1.1.0.md", "text", "ac8187fa76626256d3e4c16bb484257b5247a9faf1a40ed1dc1247f7374332aa"],
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
/** tableRowProblems of the publication gate, loaded on demand (the base's spec-publish.mjs lacks it: red by assertion, not by import). */
async function rowGate(): Promise<NonNullable<Partial<typeof import("../scripts/spec-publish.mjs")>["tableRowProblems"]>> {
  const m: Partial<typeof import("../scripts/spec-publish.mjs")> = await import("../scripts/spec-publish.mjs");
  assert.ok(typeof m.tableRowProblems === "function", "scripts/spec-publish.mjs exports tableRowProblems");
  return m.tableRowProblems;
}
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

// killer: apps/harness/src/tools/gate.ts:217 CONST "for this cell_key; the gate" -> "for this cell_key, the gate"
test("published_tables_are_the_served_tables_byte_for_byte", async () => {
  const versions = (s: string): string[] => readdirSync(s).filter((d) => d === "contract-1.1.0" || (d.startsWith("contract-1.1.0-tables-") && validDate(d.slice(22)))).sort(); // the writer's versionDirs: a real day only
  const spec = join(ROOT, "spec"), dirs = versions(spec), held = (d: string): string[] => (existsSync(join(spec, d, "policy")) ? readdirSync(join(spec, d, "policy")).sort() : []);
  for (const t of SERVED_POLICY_TABLES) { // SPEC-TABLES-TEST-PER-DIR-1: each served table is the file of the last directory that holds its class; an older dated directory is never rewritten
    const b = bytes(spec, dirs.filter((d) => held(d).includes(`${t.task_class}.json`)).at(-1) ?? "contract-1.1.0", "policy", `${t.task_class}.json`);
    assert.deepEqual([b.toString("utf8") === canonicalJson(t.table), sha(b), sha(b)], [true, t.policy_table_sha256, sha256Canonical(t.table)], t.task_class);
  }
  assert.deepEqual([dirs[0], held("contract-1.1.0"), dirs.flatMap(held).filter((f) => !held("contract-1.1.0").includes(f)), dirs.filter((d) => held(d).length === 0), SERVED_POLICY_TABLES.filter((t) => t.table.class.cell_key_rule === "kata-bucket").map((t) => t.table.rows.length), readdirSync(spec).filter((d) => !dirs.includes(d))], ["contract-1.1.0", SERVED_POLICY_TABLES.map((t) => `${t.task_class}.json`).sort(), [], [], SERVED_POLICY_TABLES.filter((t) => t.table.class.cell_key_rule === "kata-bucket").map((t) => (Object.hasOwn(COMMITTED_TABLES, t.task_class) ? t.table.rows.length : 0)), []]);
  const fake = join(TMP, "dirs"), w = await writer(); // a directory that names no real day is no version, for this test as for the writer (it would hide a stale dated file)
  for (const d of ["contract-1.1.0", "contract-1.1.0-tables-2026-11-02", "contract-1.1.0-tables-2026-13-01", "contract-1.1.0-tables-2026-02-30"]) { mkdirSync(join(fake, "spec", d, "policy"), { recursive: true }); writeFileSync(join(fake, "spec", d, "policy", "btc-dir-1h.json"), d); }
  assert.deepEqual([versions(join(fake, "spec")), w.servedTableDirs(fake, [{ task_class: "btc-dir-1h" }])], [["contract-1.1.0", "contract-1.1.0-tables-2026-11-02"], { "btc-dir-1h": "contract-1.1.0-tables-2026-11-02" }]);
});

// killer: spec/contract-1.1.0/schemas/prediction.schema.json:4 CONST "\"title\": \"Prediction\"" -> "\"title\": \"Prediction \""
test("the_repository_passes_the_writer_check", async () => { // SPEC-CHECK-ROOT-1: --check on this repository, contract-1.1.0/ and every dated directory (a missing, differing, extra or duplicated file reds)
  const w = await writer();
  assert.deepEqual(w.differences(ROOT, await w.expectedFiles(ROOT)), []);
});

// killer: scripts/spec-publish.mjs:292 CONST "r.recompute !== null" -> "r.recompute === undefined"
test("no_table_with_a_recompute_row_is_published_before_the_verifier_list", async () => {
  const w = await writer(), held = SERVED_POLICY_TABLES.flatMap((t) => t.table.rows.filter((r) => r.recompute !== null).map((r) => `${t.task_class} ${r.cell_key}`));
  assert.deepEqual(held, [], "VERIFIERS-LIST-F5A-1: a published row with a recompute needs the published list of verifiers first");
  const t = SERVED_POLICY_TABLES.find((x) => x.task_class === "stable-run-velocity-24h")?.table, row = t?.rows[0];
  assert.ok(t !== undefined && row !== undefined);
  const recompute = { verifier: "v@1", scores_sha256: "a".repeat(64), report_sha256: "b".repeat(64) };
  assert.equal(w.tableText(t), canonicalJson(t));
  assert.throws(() => w.tableText({ ...t, rows: [{ ...row, recompute }] }), /^Error: VERIFIERS-LIST-F5A-1: stable-run-velocity-24h has a row with a recompute/);
  assert.deepEqual((await rowGate())({ ...t, rows: [{ ...row, recompute }] }).map((p) => p.code), ["recompute_held"]);
});

// killer: scripts/spec-publish.mjs:293 CONST "r.n <= SHORT_N" -> "r.n < SHORT_N"
test("no_table_publishes_the_digest_of_a_sequence_of_30_points_or_fewer", async () => {
  const w = await writer(), t = SERVED_POLICY_TABLES.find((x) => x.task_class === "liquidation-eligible-coverage")?.table, row = t?.rows[0];
  assert.ok(t !== undefined && row !== undefined);
  assert.deepEqual([w.SHORT_N, SERVED_POLICY_TABLES.flatMap((x) => x.table.rows.map((r) => r.n)).sort((a, b) => a - b)], [30, [170, 613]]);
  assert.equal(w.tableText({ ...t, rows: [{ ...row, n: 31 }] }), canonicalJson({ ...t, rows: [{ ...row, n: 31 }] }));
  for (const n of [0, 1, 30]) {
    assert.throws(() => w.tableText({ ...t, rows: [{ ...row, n }] }), /^Error: SHORT-DIGEST-INVERSION-1: liquidation-eligible-coverage has a row whose digests cover 30 points or fewer/, String(n));
  }
  const gate = await rowGate(), why = (o: Record<string, unknown>): string[] => gate({ ...t, rows: [{ ...row, ...o }] }).map((p) => p.detail.replace(/^.*: /, ""));
  const key = row.cell_key;
  assert.deepEqual([why({ n: 31, p_served: 31 }), why({ p_served: 30 }), why({ aux_sha256: "a".repeat(64) }), why({ series_sha256: "b".repeat(64), n: 30 })],
    [[], [`${key} (p_served 30)`], [`${key} (aux_sha256)`], [`${key} (n 30, series_sha256)`]]);
  assert.deepEqual([why({ p_served: "31" }), why({ n: 30.5 }), why({ n: undefined }), why({ p_served: null })], [[`${key} (p_served 31)`], [`${key} (n 30.5)`], [`${key} (n undefined)`], []]);
  assert.deepEqual(gate({ ...t, rows: [row, [row]] }).map((p) => p.code), ["policy_table_invalid"], "a row that is not an object");
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
function repinned(edit: (row: Record<string, unknown>) => void, kind: Kind = "policy-table"): { gov: string; inputs: Inputs; file: string } {
  const gov = mkdtempSync(join(TMP, "gov-")), rel = "spec/contract-1.1.0/policy/stable-run-velocity-24h.json";
  const table = JSON.parse(bytes(ROOT, rel).toString("utf8")) as { rows: Record<string, unknown>[] };
  edit(table.rows[0] ?? {});
  const text = canonicalJson(table), file = join(gov, "inputs.json");
  mkdirSync(join(gov, "spec", "contract-1.1.0", "policy"), { recursive: true });
  writeFileSync(join(gov, rel), text);
  const inputs: Inputs = { format: "spec-inputs-v1", releases: { "contract-1.1.0": { previous_commit: null, entries: [
    { out: "contract-1.1.0/policy/stable-run-velocity-24h.json", root: "governance", path: rel, kind, sha256: sha(text) }] } } };
  writeFileSync(file, JSON.stringify(inputs));
  return { gov, inputs, file };
}

// killer: scripts/spec-publish.mjs:153 CONST "tableRowProblems(v)" -> "tableRowProblems({})"
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

// killer: scripts/spec-publish.mjs:151 CONST "(at[1] !== release && !carried)" -> "(false)"
test("a_table_file_lies_at_policy_or_under_its_own_release_directory_only", () => {
  const table = bytes(OUT, "policy", "btc-dir-1h.json"), codes = (out: string, rel?: string): string[] => contentProblems(out, "policy-table", table, rel).map((p) => p.code);
  assert.deepEqual([codes("contract-1.1.0/policy/btc-dir-1h.json", "contract-1.1.0"), codes("policy/btc-dir-1h.json", "contract-1.1.0"), codes("policy/btc-dir-1h.json")], [[], [], []]);
  for (const out of ["policy/policy/btc-dir-1h.json", ".../policy/btc-dir-1h.json", "-/policy/btc-dir-1h.json", "reports/policy/btc-dir-1h.json", "contract-9.9.9/policy/btc-dir-1h.json",
    "../policy/btc-dir-1h.json", "contract-1.1.0/policy/x/btc-dir-1h.json", "contract-1.1.0/policy/btc-dir-4h.json"]) assert.deepEqual(codes(out, "contract-1.1.0"), ["policy_table_invalid"], out);
  assert.deepEqual([codes("contract-1.1.0/policy/btc-dir-1h.json"), codes("kata-wave1/policy/btc-dir-1h.json", "kata-wave1")], [["policy_table_invalid"], ["policy_table_invalid"]],
    "no release, no version directory; a release directory is a contract-<x.y.z> one");
});

// killer: scripts/spec-publish.mjs:37 CONST "!/^\\.+$/.test(s)" -> "!/^\\.\\.?$/.test(s)"
test("an_output_path_has_no_segment_made_of_dots_only", () => {
  const make = (out: string): unknown => ({ format: "spec-inputs-v1", releases: { v: { previous_commit: null, entries: [{ out, root: "recherches", path: "a.md", kind: "text", sha256: "0".repeat(64) }] } } });
  for (const out of [".../a.md", "a/.../b.md", "a/..../b.md", "a/...", "./a.md"]) assert.throws(() => parseInputs(make(out)), /inputs_invalid/, out);
  for (const out of ["a.md", ".a/b.md", "a/b..c.md", "a/.b"]) assert.doesNotThrow(() => parseInputs(make(out)), out);
});

/** A previous tree (a git repository) that already publishes a versioned file and the root KATA-SPEC.md. */
function previousTree(extra: Record<string, Buffer | string> = {}): { dir: string; head: string } {
  const dir = mkdtempSync(join(TMP, "prev-")), git = (...a: string[]): string => {
    const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t.invalid", "-c", "commit.gpgsign=false", ...a], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  mkdirSync(join(dir, "contract-1.1.0"));
  writeFileSync(join(dir, "contract-1.1.0", "a.json"), "{}\n");
  writeFileSync(join(dir, "KATA-SPEC.md"), "# Old\n");
  for (const [p, b] of Object.entries(extra)) { mkdirSync(join(dir, p, ".."), { recursive: true }); writeFileSync(join(dir, p), b); }
  git("init", "-q"); git("add", "-A"); git("commit", "-qm", "v");
  return { dir, head: git("rev-parse", "HEAD") };
}

// killer: scripts/spec-publish.mjs:207 CONST "!now.bytes.equals(" -> "now.bytes.equals("
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

const TABLE_KIND_HACK = (r: Record<string, unknown>): void => { r.n = 30; };
// killer: scripts/spec-publish.mjs:142 CONST "if (kind !== \"policy-table\" &&" -> "if (false &&"
test("a_table_declared_json_or_text_is_refused_by_its_path_or_its_row_format", () => {
  const table = Buffer.from(canonicalJson({ ...(JSON.parse(bytes(OUT, "policy", "btc-dir-1h.json").toString("utf8")) as object) })), codes = (out: string, kind: Kind, b = table): string[] =>
    contentProblems(out, kind, b, "contract-1.1.0").map((p) => p.code);
  assert.deepEqual([codes("contract-1.1.0/policy/btc-dir-1h.json", "json"), codes("contract-1.1.0/policy/btc-dir-1h.json", "text"), codes("contract-1.1.0/other.json", "json")],
    [["policy_table_kind"], ["policy_table_kind"], ["policy_table_kind"]]);
  assert.deepEqual(codes("contract-1.1.0/vectors.json", "json", Buffer.from('{"tables":[{"row_format":"class-policy-v2","rows":[]}]}')), [], "a table nested in vectors is data");
  for (const kind of ["json", "text"] as const) {
    const { gov, file } = repinned(TABLE_KIND_HACK, kind), out = join(gov, "out");
    const r = spawnSync(process.execPath, [join(ROOT, "scripts", "spec-publish.mjs"), "--release", "contract-1.1.0", "--date", "2026-10-06", "--out", out, "--inputs", file, "--root", `governance=${gov}`], { encoding: "utf8" });
    assert.deepEqual([r.status, r.stderr.includes("policy_table_kind"), existsSync(out)], [1, true, false], kind);
  }
});

/** A release over a previous tree: one entry per [out, governance path, kind], each pinned, roots governance (ROOT) and previous. */
function over(prev: { dir: string; head: string }, release: string, entries: [string, string, Kind][]): string[] {
  const inputs: Inputs = { format: "spec-inputs-v1", releases: { [release]: { previous_commit: prev.head, entries: [["KATA-SPEC.md", "", "text"] as [string, string, Kind], ["contract-1.1.0/a.json", "", "json"] as [string, string, Kind], ...entries]
    .map(([out, path, kind]) => (path === "" ? { out, root: "previous" as const, path: out, kind, sha256: sha(readFileSync(join(prev.dir, out))) } : { out, root: "governance" as const, path, kind, sha256: sha(bytes(ROOT, path)) })) } } };
  return plan({ inputs, release, date: "2026-10-06", roots: { governance: ROOT, previous: prev.dir } }).problems.map((p) => p.code);
}

// killer: scripts/spec-publish.mjs:151 CONST "&& !carried)" -> ")"
test("a_later_version_carries_the_published_tables_and_still_checks_their_rows", () => {
  const btc = "spec/contract-1.1.0/policy/btc-dir-1h.json", prev = previousTree({ "contract-1.1.0/policy/btc-dir-1h.json": bytes(ROOT, btc) });
  assert.deepEqual(over(prev, "contract-1.2.0", [["contract-1.1.0/policy/btc-dir-1h.json", "", "policy-table"]]), []);
  assert.deepEqual(over(prev, "contract-1.2.0", [["contract-1.1.0/policy/btc-dir-1h.json", "", "policy-table"], ["contract-1.1.0/policy/eth-dir-1h.json", "spec/contract-1.1.0/policy/eth-dir-1h.json", "policy-table"]]),
    ["policy_table_invalid", "added_to_published"], "a new table lies under the release's own directory");
  assert.deepEqual(over(prev, "contract-1.2.0", [["contract-1.1.0/policy/btc-dir-1h.json", "", "json"]]), ["policy_table_kind"]);
});

// killer: scripts/spec-publish.mjs:200 CONST "&& !ls.includes(o)) add(" -> "&& false) add("
test("a_published_version_directory_is_closed_and_its_name_has_one_form", () => {
  const prev = previousTree(), sc = "spec/contract-1.1.0/schemas/prediction.schema.json";
  assert.deepEqual([over(prev, "v", []), over(prev, "v", [["contract-1.1.0/x.schema.json", sc, "schema"]]), over(prev, "v", [["x.schema.json", sc, "schema"]])], [[], ["added_to_published"], []]);
  const dir = (top: string): string[] => contentProblems(`${top}/x.md`, "text", Buffer.from("# x\n"), "v").map((p) => p.code);
  assert.deepEqual(["contract-1.2.0", "contract-1.1.0-tables-2026-11-01", "contract-1.1", "contract-1.1.0-r1", "contract-1.1.0-tables-2026-1-1", "contract-v1.2.0"].map(dir),
    [[], [], ["version_dir_invalid"], ["version_dir_invalid"], ["version_dir_invalid"], ["version_dir_invalid"]]);
  assert.deepEqual(over(prev, "contract-1.2.0", [["contract-9.9.9/x.schema.json", sc, "schema"], ["contract-1.2.0/x.schema.json", sc, "schema"], ["Contract-1.1.0/x.schema.json", sc, "schema"]]),
    ["version_dir_invalid", "foreign_version_dir", "added_to_published"], "a release creates its own directory only; case does not hide a published one");
  assert.deepEqual(contentProblems("contract-1.1.0-tables-2026-11-01/policy/btc-dir-1h.json", "policy-table", bytes(OUT, "policy", "btc-dir-1h.json"), "contract-1.1.0-tables-2026-11-01"), []);
});

// killer: scripts/spec-publish.mjs:122 CONST "validDate(m[1])" -> "true"
test("a_version_directory_has_no_leading_zero_and_a_real_date", () => {
  const ok = ["contract-0.1.0", "contract-10.0.0", "contract-1.1.0-tables-2024-02-29"], bad = ["contract-01.1.0", "contract-1.01.0", "contract-1.1.0-tables-20261006",
    "contract-1.1.0-tables-2026-13-40", "contract-1.1.0-tables-2026-02-30", "contract-1.1.0-tables-0000-00-00", "Contract-1.1.0", "CONTRACT-1.1.0"];
  assert.deepEqual([ok.map((d) => contentProblems(`${d}/x.md`, "text", Buffer.from("# x\n"), "v").length), bad.map((d) => contentProblems(`${d}/x.md`, "text", Buffer.from("# x\n"), "v")[0]?.code)],
    [[0, 0, 0], Array<string>(bad.length).fill("version_dir_invalid")]);
});

// killer: scripts/spec-publish.mjs:142 CONST "/(^|\\/)policy\\//i" -> "/^policy\\//i"
test("a_table_is_known_by_its_shape_at_any_depth_and_any_policy_path_in_any_case", () => {
  const t = JSON.parse(bytes(OUT, "policy", "btc-dir-1h.json").toString("utf8")) as Record<string, unknown>, bare = { ...t, row_format: undefined };
  const codes = (out: string, v: unknown, kind: Kind = "json"): string[] => contentProblems(out, kind, Buffer.from(JSON.stringify(v)), "contract-1.1.0").map((p) => p.code);
  for (const v of [[t], { tables: [t] }, { table: t }, { a: { b: [bare] } }]) assert.deepEqual(codes("contract-1.1.0/other.json", v), ["policy_table_kind"], JSON.stringify(v).slice(0, 40));
  for (const out of ["contract-1.1.0/policy/x.json", "contract-1.1.0/Policy/x.JSON", "policy/x.txt", "a/b/policy/c/d.json"]) assert.deepEqual(codes(out, {}), ["policy_table_kind"], out);
  assert.deepEqual([codes("contract-1.1.0/other.json", { rows: [], class: {} }), codes("contract-1.1.0/other.json", { rows: [] })], [[], []], "no task_class, no table");
});

// killer: scripts/spec-publish.mjs:143 CONST "t.path.startsWith(\"/synthetic_kata/\")" -> "true"
test("the_vectors_file_may_hold_tables_and_only_its_synthetic_fixtures_skip_recompute", () => {
  const t = JSON.parse(bytes(OUT, "policy", "btc-dir-1h.json").toString("utf8")) as { rows: unknown[] }, row = { n: 92, p_served: 59, aux_sha256: "a".repeat(64), series_sha256: null, recompute: { verifier: "v" }, cell_key: "k" };
  const codes = (v: unknown, out = "contract-1.1.0/vectors-1.1.0.json"): string[] => contentProblems(out, "json", Buffer.from(JSON.stringify(v)), "contract-1.1.0").map((p) => p.code);
  const at = (r: object): unknown => ({ synthetic_kata: { tables: [{ table: { ...t, rows: [r] } }] } });
  assert.deepEqual([codes(at(row)), codes(at({ ...row, n: 30 })), codes(at({ ...row, p_served: 30 })), codes({ other: { ...t, rows: [row] } }), codes(at(row), "contract-1.1.0/vectors-1.2.0.json")],
    [[], ["short_digest"], ["short_digest"], ["recompute_held", "short_digest"], ["policy_table_kind"]]);
});

// killer: scripts/spec-publish.mjs:188 CONST "was !== null && was.equals(bytes)" -> "true"
test("a_carried_table_is_read_from_the_previous_commit_not_its_working_tree", () => {
  const btc = bytes(ROOT, "spec/contract-1.1.0/policy/btc-dir-1h.json"), prev = previousTree({ ".gitignore": "contract-0.9.0/\n", "contract-0.9.0/policy/btc-dir-1h.json": btc });
  assert.ok(over(prev, "contract-1.2.0", [["contract-0.9.0/policy/btc-dir-1h.json", "spec/contract-1.1.0/policy/btc-dir-1h.json", "policy-table"]]).includes("policy_table_invalid"),
    "an ignored file of the previous tree is not published, so not carried");
});

// killer: scripts/spec-policy-tables.mjs:83 SDL "for (const f of tmp) if (lstatSync(f.at, { throwIfNoEntry: false })?.isSymbolicLink() === true)" -> ""
test("the_writer_does_not_write_over_a_symbolic_link", async (t) => {
  await writer();
  const root = join(TMP, "link-root"), bnb = join(root, "spec", "contract-1.1.0", "policy", "bnb-dir-1h.json");
  cpSync(join(ROOT, "schemas"), join(root, "schemas"), { recursive: true });
  assert.equal(run(WRITER, "--write", "--root", root).status, 0);
  rmSync(bnb);
  try { symlinkSync(join(root, "schemas", "prediction.schema.json"), bnb); } catch (e) {
    if (process.platform === "win32") { t.skip(`symlink creation not permitted on win32: ${String(e)}`); return; }
    throw e;
  }
  const r = spawnSync(process.execPath, [WRITER, "--write", "--root", root], { encoding: "utf8" });
  assert.deepEqual([r.status, /symbolic link/.test(r.stderr), lstatSync(bnb).isSymbolicLink()], [1, true, true]);
});

// killer: scripts/spec-policy-tables.mjs:90 CONST "chmodSync(d.at, d.mode & 0o7777)" -> "chmodSync(d.at, 0o644)"
test("a_failed_write_gives_back_the_mode_of_the_files_it_replaced", async (t) => {
  if (process.platform === "win32") { t.skip("win32: no POSIX file modes"); return; }
  await writer();
  const root = join(TMP, "mode"), out = join(root, "spec", "contract-1.1.0"), eth = join(out, "policy", "eth-dir-1h.json");
  cpSync(join(ROOT, "schemas"), join(root, "schemas"), { recursive: true });
  assert.equal(run(WRITER, "--write", "--root", root).status, 0);
  writeFileSync(eth, "stale"); chmodSync(eth, 0o600);
  rmSync(join(out, "schemas", "tool-error.schema.json")); mkdirSync(join(out, "schemas", "tool-error.schema.json", "x"), { recursive: true });
  assert.deepEqual([run(WRITER, "--write", "--root", root).status, readFileSync(eth, "utf8"), statSync(eth).mode & 0o777], [1, "stale", 0o600]);
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

// killer: scripts/spec-policy-tables.mjs:119 CONST "return realpathSync(p);" -> "return resolve(p);"
test("the_writer_runs_when_called_through_a_link", async (t) => {
  await writer();
  const empty = join(TMP, "empty");
  mkdirSync(join(empty, "schemas"), { recursive: true });
  const r = throughLink(t, WRITER, "--check", "--root", empty);
  if (r !== null) assert.equal(r.status, 1, "main ran and refused the empty root");
});

// killer: scripts/spec-publish.mjs:300 CONST "const r = realpathSync(p);" -> "const r = resolve(p);"
test("spec_publish_runs_when_called_through_a_link", (t) => {
  const r = throughLink(t, join(ROOT, "scripts", "spec-publish.mjs"));
  if (r !== null) assert.equal(r.status, 2, "usage error: main ran");
});
