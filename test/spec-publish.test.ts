// test/spec-publish.test.ts -- lot SPEC-PUBLISH-PIPELINE-1: the producer of the public spec repository (scripts/spec-publish.mjs) and its
// closed input list (scripts/spec-publish-inputs.json). The module is loaded on demand, so the base, which lacks it, reddens by assertion.
// Composition: a version is produced from synthetic roots under the OS temp directory (governance, recherches, and a previous git tree),
// replayed and compared byte for byte. No network, nothing pushed. Each test names on the line above it the production mutation that
// reddens it (scripts/red-proof.mjs convention).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Inputs, Kind, Problem } from "../scripts/spec-publish.mjs";

type Api = typeof import("../scripts/spec-publish.mjs");
type Roots = { governance: string; recherches: string; previous: string };
const SCRIPT = fileURLToPath(new URL("../scripts/spec-publish.mjs", import.meta.url));
let loaded: Api | null = null;
async function api(): Promise<Api> {
  loaded ??= await import("../scripts/spec-publish.mjs").then((m: Api) => m, () => null);
  assert.ok(loaded !== null, "scripts/spec-publish.mjs loads");
  return loaded;
}
const ROOT = mkdtempSync(join(tmpdir(), "spec-publish-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
let made = 0;
const fresh = (): string => join(ROOT, `d${String(++made)}`);
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const put = (dir: string, rel: string, body: string): void => { mkdirSync(dirname(join(dir, rel)), { recursive: true }); writeFileSync(join(dir, rel), body); };
const git = (cwd: string, ...args: string[]): string => {
  const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t.invalid", "-c", "commit.gpgsign=false", ...args], { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};
const commit = (dir: string): string => { git(dir, "add", "-A"); git(dir, "commit", "-qm", "v"); return git(dir, "rev-parse", "HEAD"); };
const codes = (ps: readonly Problem[]): string[] => ps.map((p) => p.code).sort();
const SPEC = "# Spec\n\nA kata is a pure function.\n", REPORT = "# Report\n\nkata:trend-ema-v1@binance/BTCUSDT/1h\n", NOTE = "# Note\n";
const SCHEMA = '{"$schema":"https://json-schema.org/draft/2020-12/schema"}\n';
const TABLE = '{"class":{"task_class":"btc-dir-1h"},"row_format":"class-policy-v2","rows":[]}';
const at = (head: string, entries: Inputs["releases"][string]["entries"]): Inputs => ({ format: "spec-inputs-v1", releases: { v: { previous_commit: head, entries } } });

/** Three synthetic roots and a release "v" that reads all of them; the previous tree is a git repository with two published files. */
function world(): { roots: Roots; head: string; inputs: Inputs } {
  const roots = { governance: fresh(), recherches: fresh(), previous: fresh() };
  put(roots.governance, "spec/schema.json", SCHEMA); put(roots.governance, "policy/btc-dir-1h.json", TABLE);
  put(roots.recherches, "kata/KATA-SPEC.md", SPEC); put(roots.recherches, "kata/report.md", REPORT);
  put(roots.previous, "KATA-SPEC.md", "old\n"); put(roots.previous, "reports/README.md", NOTE);
  git(roots.previous, "init", "-q");
  const head = commit(roots.previous);
  return { roots, head, inputs: at(head, [
    { out: "KATA-SPEC.md", root: "recherches", path: "kata/KATA-SPEC.md", kind: "text", sha256: sha(SPEC) },
    { out: "policy/btc-dir-1h.json", root: "governance", path: "policy/btc-dir-1h.json", kind: "policy-table", sha256: sha(TABLE) },
    { out: "reports/README.md", root: "previous", path: "reports/README.md", kind: "text", sha256: sha(NOTE) },
    { out: "reports/wave1-report.md", root: "recherches", path: "kata/report.md", kind: "text", sha256: sha(REPORT) },
    { out: "schemas/x.schema.json", root: "governance", path: "spec/schema.json", kind: "schema", sha256: sha(SCHEMA) },
  ]) };
}

// killer: scripts/spec-publish-inputs.json:8 CONST "b32a4062" -> "b32a4063"
test("inputs_pin_the_four_files_published_at_ddfee9e", async () => {
  const w = (await api()).loadInputs().releases["kata-wave1"];
  assert.equal(w?.previous_commit, "ddfee9e076d979081fa7b21ec27940e3556bacf7");
  assert.deepEqual(w.entries.map((e) => [e.out, e.root, e.path, e.sha256]), [
    ["KATA-SPEC.md", "recherches", "kata/spec/KATA-SPEC.md", "b32a4062794d32292fd37f340061c3b5e61b5d40d077bfbb7fdf6b38548cc39d"],
    ["reports/README.md", "previous", "reports/README.md", "32f26de654a0cd1604d943eb5f5d25174566dee454b2abb1d13f4ceae6920b2e"],
    ["reports/wave1-report.md", "recherches", "kata/registry/wave1-report.md", "e91edb41b1c50e4c1f87ebd2c99f6192e09d8c7cdc5574c38aee9f16b042016b"],
    ["vectors.json", "recherches", "kata/spec/vectors.json", "06ecf06909e39d67d0703f48a71b4975d536dd2dcf6903396e1a10648fbda9fb"],
  ]);
});

// killer: scripts/spec-publish.mjs:64 SDL "if (!/^[0-9a-f]{64}$/.test(String(e.sha256)))" -> ""
test("parse_inputs_refuses_any_departure_from_the_closed_format", async () => {
  const m = await api(), head = "a".repeat(40);
  const make = (e: Record<string, unknown>, rel: Record<string, unknown> = {}, format = "spec-inputs-v1"): unknown => ({ format, releases: { v: {
    previous_commit: head, entries: [{ out: "A.md", root: "recherches", path: "a.md", kind: "text", sha256: "0".repeat(64), ...e }], ...rel } } });
  assert.doesNotThrow(() => m.parseInputs(make({})));
  assert.doesNotThrow(() => m.parseInputs(make({ out: ".github/workflows/verify.yml" })));
  const two = (a: string, b: string): Record<string, unknown> => ({ entries: [a, b].map((out) => ({ out, root: "recherches", path: "a.md", kind: "text", sha256: "0".repeat(64) })) });
  const bad: [Record<string, unknown>, Record<string, unknown>?][] = [[{ extra: 1 }], [{ out: "VERSION" }], [{ out: "a/../b" }], [{ out: ".git/config" }],
    [{ root: "elsewhere" }], [{ kind: "binary" }], [{ sha256: "ABC" }], [{ sha256: null }], [{ root: "governance", sha256: null }], [{ root: "previous" }, { previous_commit: null }],
    [{}, { previous_commit: "main" }], [{}, { entries: [] }], [{}, two("A.md", "A.md")], [{}, two("A.md", "a.md")], [{}, two("a", "a/b.md")], [{ out: "MANIFEST.sha256/x.md" }],
    [{ out: "version/x" }], [{}, { owner: "x" }]];
  for (const [e, rel] of bad) {
    assert.throws(() => m.parseInputs(make(e, rel)), (x: unknown) => x instanceof m.SpecPublishError && x.code === "inputs_invalid", JSON.stringify([e, rel]));
  }
  assert.throws(() => m.parseInputs(make({}, {}, "spec-inputs-v2")), (x: unknown) => x instanceof m.SpecPublishError && x.code === "inputs_invalid");
});

// killer: scripts/spec-publish.mjs:167 CONST "}  ${f.path}" -> "} ${f.path}"
test("produce_copies_each_input_byte_for_byte_with_version_and_manifest", async () => {
  const m = await api(), w = world(), out = fresh(), mask = process.umask(0o077); // the modes must not follow the umask
  const r = (() => { try { return m.produce({ inputs: w.inputs, release: "v", date: "2026-10-02", roots: w.roots, out }); } finally { process.umask(mask); } })();
  const want: [string, string][] = [["KATA-SPEC.md", SPEC], ["VERSION", "2026-10-02\n"], ["policy/btc-dir-1h.json", TABLE], ["reports/README.md", NOTE],
    ["reports/wave1-report.md", REPORT], ["schemas/x.schema.json", SCHEMA]];
  const mode = process.platform === "win32" ? 0o666 : 0o644; // win32 shows a writable file as 0o666, whatever was asked (oracle G7, 2026-10-04)
  for (const [p, body] of want) assert.deepEqual([readFileSync(join(out, p), "utf8"), statSync(join(out, p)).mode & 0o777], [body, mode], p);
  const manifest = want.map(([p, body]) => `${sha(body)}  ${p}\n`).join("");
  assert.equal(readFileSync(join(out, "MANIFEST.sha256"), "utf8"), manifest);
  assert.equal(r.manifest_sha256, sha(manifest));
  assert.deepEqual(m.listTree(out), ["KATA-SPEC.md", "MANIFEST.sha256", "VERSION", "policy/btc-dir-1h.json", "reports/README.md", "reports/wave1-report.md", "schemas/x.schema.json"]);
});

// killer: scripts/spec-publish.mjs:245 SDL "rmSync(tmp, { recursive: true, force: true });" -> ""
test("a_failed_write_leaves_out_absent_and_no_temporary_tree", async () => {
  const m = await api(), w = world(), entries = w.inputs.releases.v?.entries ?? [], parent = fresh();
  mkdirSync(parent);
  const fails = (inputs: Inputs, out: string, code: string): void => {
    assert.throws(() => m.produce({ inputs, release: "v", date: "2026-10-02", roots: w.roots, out }), (x: unknown) => x instanceof m.SpecPublishError && x.code === code, code);
  };
  fails(at(w.head, [...entries, { ...entries[0]!, out: "a" }, { ...entries[0]!, out: "a/b.md" }]), join(parent, "o1"), "write_failed"); // unparsed: a file under a file
  fails(at(w.head, [...entries, { ...entries[0]!, out: `${"z".repeat(300)}.md` }]), join(parent, "o2"), "write_failed"); // ENAMETOOLONG mid-write
  assert.deepEqual(readdirSync(parent), []);
  fails(w.inputs, join(w.roots.previous, "o3"), "out_in_git_tree");
  fails(w.inputs, join(parent, "missing", "o4"), "out_parent_missing");
  assert.deepEqual([existsSync(join(w.roots.previous, "o3")), readdirSync(parent)], [false, []]);
});

// killer: scripts/spec-publish.mjs:227 CONST "else r.differ.push(p);" -> "else r.equal.push(p);"
test("composition_replay_gives_the_same_bytes_and_only_the_date_moves_them", async () => {
  const m = await api(), w = world(), [a, b, c] = [fresh(), fresh(), fresh()];
  for (const [out, date] of [[a, "2026-10-02"], [b, "2026-10-02"], [c, "2026-10-03"]] as const) m.produce({ inputs: w.inputs, release: "v", date, roots: w.roots, out });
  const same = m.compareTrees(a, b), moved = m.compareTrees(a, c);
  assert.deepEqual([same.equal.length, same.differ, same.missing, same.extra], [7, [], [], []]);
  assert.deepEqual([moved.equal.length, moved.differ], [5, ["MANIFEST.sha256", "VERSION"]]);
});

// killer: scripts/spec-publish.mjs:276 ROR "diff === 0 ? 0 : 1" -> "diff !== 0 ? 0 : 1"
test("cli_verify_compares_a_published_tree_path_by_path", async () => {
  await api();
  const w = world(), file = join(fresh(), "inputs.json"), first = fresh();
  put(dirname(file), "inputs.json", JSON.stringify(w.inputs));
  const run = (out: string, ...more: string[]): { status: number | null; stdout: string; stderr: string } => spawnSync(process.execPath, [SCRIPT, "--release", "v",
    "--date", "2026-10-02", "--out", out, "--inputs", file, ...Object.entries(w.roots).flatMap(([k, v]) => ["--root", `${k}=${v}`]), ...more], { encoding: "utf8" });
  assert.equal(run(first).status, 0);
  const copy = (): string => { const d = fresh(); cpSync(first, d, { recursive: true }); return d; };
  const equal = run(fresh(), "--verify", copy());
  assert.deepEqual([equal.status, /verify EQUAL: 7 equal, 0 differ, 0 missing, 0 extra/.test(equal.stdout)], [0, true]);
  const old = run(fresh(), "--verify", w.roots.previous);
  assert.deepEqual([old.status, /differ  KATA-SPEC\.md/.test(old.stdout), /verify DIFFERENT: 1 equal, 1 differ, 0 missing, 5 extra/.test(old.stdout)], [1, true, true]);
  const more = copy(), less = copy();
  put(more, "LICENSE", "x\n"); rmSync(join(less, "VERSION"));
  const [missing, extra] = [run(fresh(), "--verify", more), run(fresh(), "--verify", less)];
  assert.deepEqual([missing.status, /7 equal, 0 differ, 1 missing, 0 extra/.test(missing.stdout), extra.status, /6 equal, 0 differ, 0 missing, 1 extra/.test(extra.stdout)], [1, true, 1, true]);
  rmSync(join(w.roots.recherches, "kata/report.md"));
  const refused = fresh(), r = run(refused);
  assert.deepEqual([r.status, /input_missing {2}reports\/wave1-report\.md/.test(r.stderr), existsSync(refused)], [1, true, false]);
});

// killer: scripts/spec-publish.mjs:186 SDL "if (sha(bytes) !== e.sha256)" -> ""
test("a_missing_tampered_escaping_or_blacklisted_input_or_root_refuses_and_writes_nothing", async () => {
  const m = await api(), w = world(), out = fresh(), entry = (out: string, path: string): Inputs["releases"][string]["entries"][number] =>
    ({ out, root: "governance", path, kind: "text", sha256: sha(NOTE) });
  put(w.roots.recherches, "kata/report.md", `${REPORT}tampered\n`);
  rmSync(join(w.roots.governance, "spec/schema.json"));
  put(w.roots.governance, "dir/x.md", NOTE); put(dirname(w.roots.governance), "outside.md", NOTE);
  symlinkSync(join(dirname(w.roots.governance), "outside.md"), join(w.roots.governance, "link.md"));
  const inputs = at(w.head, [...(w.inputs.releases.v?.entries ?? []), entry("notes.md", "docs/adr/ADR-X.md"), entry("d.md", "dir"), entry("l.md", "link.md")]);
  const r = m.plan({ inputs, release: "v", date: "2026-10-02", roots: w.roots });
  assert.deepEqual([codes(r.problems), r.files], [["input_blacklisted", "input_digest", "input_escapes", "input_missing", "input_not_file"], []]);
  assert.throws(() => m.produce({ inputs, release: "v", date: "2026-10-02", roots: w.roots, out }), (x: unknown) => x instanceof m.SpecPublishError && x.code === "refused");
  assert.equal(existsSync(out), false);
  assert.deepEqual(codes(m.plan({ inputs: w.inputs, release: "v", date: "2026-10-02", roots: { governance: w.roots.governance } }).problems),
    ["input_missing", ...Array<string>(4).fill("root_missing")]);
  assert.deepEqual(codes(m.plan({ inputs: w.inputs, release: "w", date: "2026-10-02", roots: w.roots }).problems), ["release_unknown"]);
  put(out, "stale", "x");
  const clean = world();
  assert.throws(() => m.produce({ inputs: clean.inputs, release: "v", date: "2026-10-02", roots: clean.roots, out }), (x: unknown) => x instanceof m.SpecPublishError && x.code === "out_not_empty");
});

// killer: scripts/spec-publish.mjs:203 COR "!outs.has(p)" -> "outs.has(p)"
test("the_previous_tree_must_be_the_clean_top_of_its_commit_and_nothing_published_is_withdrawn", async () => {
  const m = await api(), w = world(), p = w.roots.previous, entries = w.inputs.releases.v?.entries ?? [];
  const problems = (inputs: Inputs, roots: Roots = w.roots): Problem[] => m.plan({ inputs, release: "v", date: "2026-10-02", roots }).problems;
  assert.deepEqual(problems(w.inputs), []);
  put(p, "VERSION", "2026-10-01\n"); put(p, "MANIFEST.sha256", "x\n"); put(p, "reports/old.md", "# Old\n");
  const head = commit(p), sub = entries.map((e) => (e.root === "previous" ? { ...e, path: "README.md" } : e));
  assert.deepEqual(problems(at(head, entries)).map((x) => [x.code, x.detail]), [["withdrawn", "reports/old.md is published, the release drops it"]]);
  assert.deepEqual(codes(problems(at(head, sub), { ...w.roots, previous: join(p, "reports") })), ["previous_blob_missing", "previous_commit"]); // a subdirectory hides KATA-SPEC.md; README.md is not a path of the commit
  assert.deepEqual(codes(problems(w.inputs)), ["previous_commit"]);
  put(p, "stray.md", "x\n");
  assert.deepEqual(codes(problems(at(head, entries))), ["previous_dirty"]);
});

// killer: scripts/spec-publish.mjs:96 CONST "/^G[0-7]$/" -> "/^G[1-7]$/"
test("vocabulary_gate_is_the_public_free_text_gate_with_closed_exceptions", async () => {
  const m = await api(), rules = (t: string, withheld?: { length: number; sha256: string }[]): string[] => [...new Set(m.vocabularyHits(t, withheld).map((h) => h.rule))];
  const e = String.fromCharCode(0xe9), wide = (s: string): string => [...s].map((ch) => String.fromCharCode(ch.charCodeAt(0) + 0xfee0)).join("");
  const samples: [string, string][] = [["a", `R${e}sum${e}`], ["a", "anti" + "-hallucination"], ["a", "helius"], ["a", "chainstack"], ["a", "tenderly"], ["a", "Aave lends"],
    ["a", "Kraidle"], ["a", "Hyperliquid"], ["a", "listed on binance"], ["f", "Data" + "bento"], ["f", wide("Databento")], ["k", "the orchestrator ruling"],
    ["private", "RECHERCHES"], ["private", "recherches"], ["private", "KraidleAI/recherches"], ["private", wide("RECHERCHES")], ["home", "/home/user/x"],
    ["home", "/Users/x/y"], ["home", "~/notes"], ["home", "/var/home/u/x"], ["home", "$HOME/x"], ["private", "kata:x@KraidleAI/recherches"],
    ["a", "ukemi:Helius@Chainstack/Tenderly"], ["b", "kata:x@a/BLQ-DEP-7"], ["p", "kata:x@a/192.168.1.4"], ["g", `ghp_${"a".repeat(36)}`], ["e", "F:" + "\\tmp\\x"], ["cf", `a${String.fromCharCode(0x200b)}b`],
    ["p", "write to someone@example.org"], ["b", "BLQ-DEP-7"], ["c", "R-25"], ["p", "at 10.0.0.1"], ["g", "https://example.org/x"], ["d", "public sync"]];
  for (const [rule, text] of samples) assert.deepEqual(rules(text), [rule], text);
  const zorblax = [{ length: 7, sha256: sha("zorblax") }];
  assert.deepEqual([m.WITHHELD.length, m.WITHHELD.every((d) => /^[0-9a-f]{64}$/.test(d.sha256) && d.length > 0), rules("a Zorblax word", zorblax)], [1, true, ["withheld"]]);
  assert.deepEqual([rules("Zorblax2026 and WZorblaxBot", zorblax), rules("kata:x@zorblax/a", zorblax), rules("zorbla x", zorblax)], [["withheld"], ["withheld"], []]);
  const keys = "kata:trend-ema-v1@binance/BTCUSDT/1h/up-b1, ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/weth-2025-09-22/A/s0";
  assert.deepEqual(m.vocabularyHits(`${keys}, monark-governance, plan 0005-G0-part-P1-library.md, G7, KraidleAI/monark-precommitments, noreply@example.org`), []);
  assert.deepEqual(codes(m.contentProblems("v.json", "json", Buffer.from('{"k":"\\u0052ECHERCHES"}'))), ["vocabulary"]);
});

// killer: scripts/spec-publish.mjs:154 ROR "canonicalJson(v) !== text" -> "canonicalJson(v) === text"
test("each_output_kind_is_checked_and_a_policy_table_must_be_canonical", async () => {
  const m = await api(), c = (out: string, kind: Kind, body: string | Buffer): string[] => codes(m.contentProblems(out, kind, typeof body === "string" ? Buffer.from(body) : body));
  assert.deepEqual(c("policy/btc-dir-1h.json", "policy-table", TABLE), []);
  assert.deepEqual(c("policy/btc-dir-1h.json", "policy-table", JSON.stringify(JSON.parse(TABLE), null, 2)), ["not_canonical"]);
  assert.deepEqual(c("policy/eth-dir-1h.json", "policy-table", TABLE), ["policy_table_invalid"]);
  assert.deepEqual(c("policy/btc-dir-1h.json", "policy-table", TABLE.replace("v2", "v1")), ["policy_table_invalid"]);
  assert.deepEqual(c("a.md", "text", "one\r\ntwo\n"), ["crlf"]);
  assert.deepEqual([c("a.md", "text", Buffer.from([0x61, 0xff])), c("a.md", "text", "a\0b")], [["not_text"], ["not_text"]]);
  assert.deepEqual([c("a.json", "json", "{"), c("s.json", "schema", "{}"), c("s.json", "schema", SCHEMA)], [["json_invalid"], ["schema_invalid"], []]);
});

// killer: scripts/spec-publish.mjs:83 CONST "? \"0\" :" -> "? \"-0\" :"
test("canonical_writing_follows_section_2_of_the_draft", async () => {
  const m = await api();
  assert.equal(m.canonicalJson(JSON.parse('{"b":1,"a":[0.1,1e-7,-0]}')), '{"a":[0.1,1e-7,0],"b":1}');
  assert.equal(m.canonicalJson({ z: null, y: [true, 1e21, "x"] }), '{"y":[true,1e+21,"x"],"z":null}');
  for (const bad of [{ [`k${String.fromCharCode(0xe9)}`]: 1 }, [`a${String.fromCharCode(0xd800)}`], [Infinity]]) {
    assert.throws(() => m.canonicalJson(bad), (x: unknown) => x instanceof m.SpecPublishError && x.code === "not_canonical", JSON.stringify(bad));
  }
});

// killer: scripts/spec-publish.mjs:47 SDL "return false;" -> ""
test("the_version_date_is_a_calendar_day_and_no_clock_is_read", async () => {
  const m = await api(), w = world();
  for (const [s, ok] of [["2026-10-02", true], ["2024-02-29", true], ["2026-02-29", false], ["2026-10-2", false], ["2026-13-01", false], ["2026-10-02T00:00:00Z", false]] as const) {
    assert.equal(m.validDate(s), ok, s);
  }
  assert.deepEqual(codes(m.plan({ inputs: w.inputs, release: "v", date: "2026-02-30", roots: w.roots }).problems), ["date_invalid"]);
  assert.ok(!/Date\.now\(|new Date\(\)|process\.hrtime|performance\.now|toISOString/.test(readFileSync(SCRIPT, "utf8")), "no clock read in the producer");
});

// killer: scripts/spec-publish.mjs:195 CONST "[\"rev-parse\", \"--show-toplevel\", \"HEAD\"]" -> "[\"push\", \"--show-toplevel\", \"HEAD\"]"
test("the_producer_never_publishes_its_git_commands_are_reads_only_and_it_writes_once", async () => {
  await api();
  const src = readFileSync(SCRIPT, "utf8");
  assert.deepEqual([...src.matchAll(/git\(\w+, \["([\w-]+)"/g)].map((x) => x[1]), ["rev-parse", "status", "ls-files", "rev-parse"]);
  assert.deepEqual([src.match(/spawnSync\("git"/g)?.length, src.match(/spawnSync\(/g)?.length, src.match(/writeFileSync\(/g)?.length], [1, 1, 1]);
  assert.deepEqual([...src.matchAll(/execFileSync\("git", \[([^\]]*)\]/g)].map((x) => x[1]), ['"-C", dir, "cat-file", "blob", `${commit}:${path}`'], "the one object read: cat-file blob, no shell, no filter");
  assert.deepEqual(src.match(/GIT_NO_REPLACE_OBJECTS: "1"/g)?.length, 1, "one git environment, replace objects ignored (G2 F-1)");
  assert.equal(src.match(/env: GIT_ENV/g)?.length, 2, "both git runners take it");
  assert.ok(!/fetch\(|node:https?"|node:net"/.test(src), "no network");
});

// killer: scripts/spec-publish.mjs:266 CONST "return 2; }" -> "return 1; }"
test("cli_usage_errors_exit_2", async () => {
  await api();
  const out = fresh(), ok = ["--release", "v", "--date", "2026-10-02", "--out", out];
  for (const args of [[], ["--release", "v"], [...ok, "--root", "elsewhere=/x"], [...ok, "--root", "previous=/a", "--root", "previous=/b"], [...ok, "--date", "2026-10-03"], ["--bogus", "1"]]) {
    assert.equal(spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" }).status, 2, args.join(" "));
  }
  assert.equal(existsSync(out), false);
});

// SPEC-PUBLISH-PREVIOUS-BLOBS-1 (lot T0-FOLLOWUP-1; T0 act 8 on win32 with core.autocrlf=true): a root:"previous" entry is read from
// the git object of previous_commit, never from the working tree. A previous clone checked out with CRLF (status clean) gives the same
// output and MANIFEST.sha256 as an LF clone; a working-tree edit hidden from status is ignored; a path absent from the commit is named.
// killer: scripts/spec-publish.mjs:185 CONST "got !== null ? got.bytes : readFileSync(abs)" -> "readFileSync(abs)"
test("previous_entries_are_read_from_the_pinned_commit_not_the_working_tree", async () => {
  const m = await api(), w = world(), p = w.roots.previous;
  const published = (inputs: Inputs = w.inputs): { problems: string[]; files: Record<string, string> } => {
    const r = m.plan({ inputs, release: "v", date: "2026-10-02", roots: w.roots });
    return { problems: codes(r.problems), files: Object.fromEntries(r.files.map((f) => [f.path, f.bytes.toString("utf8")])) };
  };
  const lf = published();
  assert.deepEqual(lf.problems, [], "premise: the LF clone publishes");
  git(p, "config", "core.autocrlf", "true");
  for (const f of ["KATA-SPEC.md", "reports/README.md"]) rmSync(join(p, f));
  git(p, "checkout", "--", ".");
  assert.ok(readFileSync(join(p, "reports/README.md"), "utf8").includes("\r\n") && git(p, "status", "--porcelain") === "", "premise: a clean CRLF checkout");
  assert.deepEqual(published(), lf, "the CRLF clone gives the LF clone's files and MANIFEST.sha256");
  git(p, "update-index", "--assume-unchanged", "reports/README.md");
  writeFileSync(join(p, "reports/README.md"), "# Edited\n");
  assert.deepEqual(published(), lf, "a working-tree edit is ignored");
  const ghost = at(w.head, [...(w.inputs.releases.v?.entries ?? []), { out: "reports/ghost.md", root: "previous", path: "reports/ghost.md", kind: "text", sha256: sha(NOTE) }]);
  assert.ok(published(ghost).problems.includes("previous_blob_missing"), "a path absent from the commit is named");
});

// G2 F-4 of T0-FOLLOWUP-1: a previous entry git cannot read is refused with git's own first stderr line, not a bare "is not in".
// killer: scripts/spec-publish.mjs:180 CONST ": ${got.why}" -> ""
test("a_refused_previous_entry_carries_the_reason_git_gives", async () => {
  const m = await api(), w = world();
  const ghost = at(w.head, [...(w.inputs.releases.v?.entries ?? []), { out: "reports/ghost.md", root: "previous", path: "reports/ghost.md", kind: "text", sha256: sha(NOTE) }]);
  const detail = m.plan({ inputs: ghost, release: "v", date: "2026-10-02", roots: w.roots }).problems.find((x) => x.code === "previous_blob_missing")?.detail ?? "";
  assert.match(detail, /reports\/ghost\.md.*does not exist/, "the refusal carries git's own reason");
});

// G2 of T0-FOLLOWUP-1 (F-1, F-2, F-3): a published contract-*/ file is compared with its committed object. contractWorld gives a
// previous tree holding contract-1.0.0/t.md and a release that carries it (from "previous") or publishes other bytes there.
type Contract = { w: ReturnType<typeof world>; inputs: Inputs };
function contractWorld(from: "previous" | "recherches"): Contract {
  const w = world(), p = w.roots.previous, T = "# T\n", T2 = "# T2\n";
  put(p, "contract-1.0.0/t.md", T); put(w.roots.recherches, "kata/t2.md", T2);
  const head = commit(p), entry = from === "previous" ? { out: "contract-1.0.0/t.md", root: "previous" as const, path: "contract-1.0.0/t.md", kind: "text" as const, sha256: sha(T) }
    : { out: "contract-1.0.0/t.md", root: "recherches" as const, path: "kata/t2.md", kind: "text" as const, sha256: sha(T2) };
  return { w, inputs: at(head, [...(w.inputs.releases.v?.entries ?? []), entry]) };
}
const contractCodes = async (c: Contract, inputs: Inputs = c.inputs): Promise<string[]> =>
  codes((await api()).plan({ inputs, release: "v", date: "2026-10-02", roots: c.w.roots }).problems);

// G2 F-3: a carried contract file stays equal on a CRLF checkout and under a working-tree edit hidden from status.
// killer: scripts/spec-publish.mjs:205 CONST "once(prev, rel.previous_commit, p)" -> "{ bytes: readFileSync(join(prev, p)), why: \"\" }"
test("a_published_contract_file_is_compared_with_its_committed_object", async () => {
  const carried = contractWorld("previous"), p = carried.w.roots.previous;
  git(p, "config", "core.autocrlf", "true");
  rmSync(join(p, "contract-1.0.0/t.md")); git(p, "checkout", "--", ".");
  assert.ok(readFileSync(join(p, "contract-1.0.0/t.md"), "utf8").includes("\r\n") && git(p, "status", "--porcelain") === "", "premise: a clean CRLF checkout");
  assert.deepEqual(await contractCodes(carried), [], "a carried contract file on a CRLF checkout is not rewritten");
  git(p, "update-index", "--assume-unchanged", "contract-1.0.0/t.md"); writeFileSync(join(p, "contract-1.0.0/t.md"), "# Edited\n");
  assert.deepEqual(await contractCodes(carried), [], "a hidden working-tree edit is ignored");
});

// G2 F-1: a replace object (refs/replace) in the previous clone does not hide a rewrite. On a CRLF clone that also carries a second
// contract file unchanged, exactly one rewrite is named: the file whose committed object the replace object stands in for.
// killer: scripts/spec-publish.mjs:159 CONST ", GIT_NO_REPLACE_OBJECTS: \"1\" }" -> " }"
test("a_replace_object_does_not_hide_a_rewrite", async () => {
  const changed = contractWorld("recherches"), q = changed.w.roots.previous, rech = changed.w.roots.recherches, C = "# C\n";
  put(q, "contract-1.0.0/c.md", C);
  const head = commit(q), inputs = at(head, [...(changed.inputs.releases.v?.entries ?? []),
    { out: "contract-1.0.0/c.md", root: "previous", path: "contract-1.0.0/c.md", kind: "text", sha256: sha(C) }]);
  git(q, "config", "core.autocrlf", "true"); rmSync(join(q, "contract-1.0.0"), { recursive: true }); git(q, "checkout", "--", ".");
  assert.ok(readFileSync(join(q, "contract-1.0.0/c.md"), "utf8").includes("\r\n") && git(q, "status", "--porcelain") === "", "premise: a clean CRLF checkout");
  const old = git(q, "rev-parse", "HEAD:contract-1.0.0/t.md"), now = git(rech, "hash-object", "kata/t2.md");
  git(q, "hash-object", "-w", join(rech, "kata/t2.md")); git(q, "replace", old, now);
  assert.equal(git(q, "cat-file", "blob", "HEAD:contract-1.0.0/t.md"), "# T2", "premise: git honours the replace object");
  assert.deepEqual(await contractCodes(changed, inputs), ["rewritten"], "the replace object does not hide the rewrite, the carried file is not one");
});

// G2 F-2: an object git cannot read as a blob (a gitlink) is refused by name, never compared with empty bytes.
// killer: scripts/spec-publish.mjs:164 CONST "bytes: null" -> "bytes: Buffer.alloc(0)"
test("an_unreadable_published_object_is_refused_never_read_as_empty", async () => {
  const linked = contractWorld("recherches"), r = linked.w.roots.previous;
  git(r, "rm", "-q", "--cached", "contract-1.0.0/t.md"); rmSync(join(r, "contract-1.0.0/t.md"));
  git(r, "update-index", "--add", "--cacheinfo", `160000,${git(r, "rev-parse", "HEAD")},contract-1.0.0/t.md`); git(r, "commit", "-qm", "gitlink");
  mkdirSync(join(r, "contract-1.0.0/t.md")); // an unpopulated submodule: an empty directory, a clean status
  const head = git(r, "rev-parse", "HEAD");
  put(linked.w.roots.recherches, "kata/t2.md", ""); // an empty file where the published tree holds a gitlink
  const inputs = at(head, (linked.inputs.releases.v?.entries ?? []).map((e) => (e.out === "contract-1.0.0/t.md" ? { ...e, sha256: sha("") } : e)));
  const got = await contractCodes(linked, inputs).catch((e: unknown) => [`threw ${String((e as { code?: unknown }).code ?? e)}`]);
  assert.deepEqual(got, ["previous_blob_missing"], "an unreadable published object is refused by name, it neither throws nor reads as empty");
});

/** plan(request) in a child node process, whose environment GIT_ENV takes at import: its exit status, the problems as JSON, stderr. */
const planInChild = (request: unknown, env: NodeJS.ProcessEnv): { status: number | null; stdout: string; stderr: string } => {
  const code = "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(m.plan(JSON.parse(process.argv[2])).problems));";
  return spawnSync(process.execPath, ["--input-type=module", "-e", code, pathToFileURL(SCRIPT).href, JSON.stringify(request)], { encoding: "utf8", env: { ...process.env, ...env } });
};

// G2 T-3 of T0-FOLLOWUP-1: each object of previous_commit is read once per plan. A previous entry published under its own path is
// wanted by the entry, by the "carried" check and by the rewritten check: one cat-file, counted in git's own trace2 events (a child
// process, so that GIT_ENV takes GIT_TRACE2_EVENT at import; no wrapper, any OS). Only top-level git processes count (a sid without
// "/": a child's sid carries its parent's as a prefix), so a trace2-instrumented launcher that re-runs git logs one read, not two;
// GIT_TRACE2_PARENT_SID is dropped so that a caller under trace2 does not make every process a child (G2 A-3).
// killer: scripts/spec-publish.mjs:171 CONST "if (!objects.has(k)) " -> ""
test("each_object_of_the_previous_commit_is_read_once", async () => {
  await api();
  const c = contractWorld("previous"), trace = join(fresh(), "t2.json"), request = { inputs: c.inputs, release: "v", date: "2026-10-02", roots: c.w.roots };
  mkdirSync(dirname(trace), { recursive: true });
  const r = planInChild(request, { GIT_TRACE2_EVENT: trace, GIT_TRACE2_PARENT_SID: undefined });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, "[]", "premise: the release plans");
  const reads = (existsSync(trace) ? readFileSync(trace, "utf8") : "").split("\n").flatMap((l) => {
    try {
      const e = JSON.parse(l) as { event?: unknown; sid?: unknown; argv?: unknown };
      return e.event === "start" && typeof e.sid === "string" && !e.sid.includes("/") && Array.isArray(e.argv) && e.argv.includes("cat-file") ? [String(e.argv.at(-1))] : [];
    } catch { return []; }
  });
  assert.ok(reads.some((x) => x.endsWith(":contract-1.0.0/t.md")), "premise: the trace sees the object reads");
  assert.deepEqual(reads.filter((x, i) => reads.indexOf(x) !== i), [], "no object of previous_commit is read twice");
});

// G2 T-8 of T0-FOLLOWUP-1: spec-publish run from a pre-commit hook of a linked worktree inherits the hook's GIT_DIR and an absolute
// GIT_INDEX_FILE. Each git call of the plan names its tree with -C <previous>; a repository-location variable inherited from the
// caller never stands in for it (before: previous_blob_missing, previous_commit or previous_dirty, a false refusal). The caller's
// configuration (GIT_CONFIG_*) still reaches git: a -c safe.directory is honoured. A child process each, since GIT_ENV is fixed at import.
// killer: scripts/spec-publish.mjs:159 CONST "^GIT_(?:DIR|" -> "^GIT_(?:CONFIG_COUNT|DIR|"
// killer: scripts/spec-publish.mjs:159 CONST "!GIT_LOCATION.test(k)" -> "true"
test("a_caller_s_git_location_never_stands_in_for_the_previous_tree", async () => {
  await api();
  const c = contractWorld("previous"), request = { inputs: c.inputs, release: "v", date: "2026-10-02", roots: c.w.roots };
  const other = fresh(), dotGit = join(other, ".git"), index = join(dotGit, "index");
  put(other, "KATA-SPEC.md", "another repository\n"); git(other, "init", "-q"); commit(other);
  const cases: Record<string, NodeJS.ProcessEnv> = {
    "a pre-commit hook of a linked worktree": { GIT_DIR: dotGit, GIT_INDEX_FILE: index },
    GIT_DIR: { GIT_DIR: dotGit },
    GIT_OBJECT_DIRECTORY: { GIT_OBJECT_DIRECTORY: join(dotGit, "objects") },
    GIT_WORK_TREE: { GIT_WORK_TREE: other },
    GIT_INDEX_FILE: { GIT_INDEX_FILE: index },
  };
  const got = Object.fromEntries(Object.entries(cases).map(([why, env]) => { const r = planInChild(request, env); return [why, r.status === 0 ? r.stdout : `exit ${String(r.status)}: ${r.stderr}`]; }));
  assert.deepEqual(got, Object.fromEntries(Object.keys(cases).map((why) => [why, "[]"])), "another repository named by the environment is never read in place of -C <previous>");
  const owner = { GIT_TEST_ASSUME_DIFFERENT_OWNER: "1" }; // git's own switch (2.35.2+): the tree is taken for another user's
  assert.notEqual(planInChild(request, owner).stdout, "[]", "premise: git refuses a tree it takes for another user's");
  const r = planInChild(request, { ...owner, GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "safe.directory", GIT_CONFIG_VALUE_0: "*" });
  assert.equal(r.stdout, "[]", `the caller's -c safe.directory (GIT_CONFIG_*) reaches git: ${r.stderr}`);
});
