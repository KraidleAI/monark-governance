// test/kata-recalc.test.ts -- lot 1a of VERIFIERS-LIST-F5A-1 (2026-10-06; G0 docs/G0-lot-verifiers-list-f5a-1.md, sections 3.1, 3.2
// and 5): the recalculation tool under tools/kata-recalc/, imported byte for byte from its delivery, is held by the digest of its tree.
// The tree is read from the git INDEX, never from the working tree (G0 section 3.2, rule 1): `git ls-files -s` gives the mode and the
// blob of each entry, `git cat-file blob` its bytes; every mode is 100644 (a link 120000, a gitlink 160000 or an executable 100755 is
// refused); sha256(manifestText(files)), the MANIFEST.sha256 format of scripts/spec-publish.mjs, equals the pin of the lot. The working
// tree, from which the tool runs, must carry the same blobs: an edit not yet staged reddens too, and so does the killer, which
// scripts/red-proof.mjs fires on the working tree only. Lots 1b to 1e move the pin to the trees they import or modify; lot 1f replaces
// it with the tree_sha256 of the pinned verifier list. git runs without the caller's GIT_* variables (test/helpers/git-tracked.ts).
// Lot 1d (M-7, M-9) adds two tests: the language gate reads the .py sources of the tool, and each entry script imports io_guard, the
// input guard, before any other module. Lot 1e (M-11) moves the pin, names report.py and report_check.py among the entry scripts, and
// gates the fixed texts of the report through contentProblems of scripts/spec-publish.mjs. REASON-ORDER-GUARD-VERIFIER-1 (2026-10-07)
// moves the pin: recalc_p2.py names a constant auxiliary sequence before a rejection, and report_check.py tests it. The frozen-tool lot
// (2026-10-07, G0 section 17) moves the pin once for all its changes (guard_check.py among the entry scripts), reshapes the report of the
// gate test (no field outside the decisions, scope, a scores digest per cell, no digest under differences; its killer moves from the
// removed sentence on the trial head to the text of the decisions) and holds the scope of the report, RELEASE_1_CLASSES, to the
// versed registry of wave 1, to digestProblems and to the short_digest of the gate (form (a)). Its G2 holds the trees of code that
// io_guard admits to MONARK's closed list of two (ecace80). IO-GUARD-POSED-FILES-1 (2026-10-08) rewrites the body of the test of the
// guard first (each entry script opens with the prologue that runs io_guard.py by its path, then imports io_guard) and holds FILES, the
// closed list of the tool's folder that io_guard checks before any other import, to the index and the working tree; its tree moves the
// pin through the list entry that the lot writes, with the revocation of the entry of the frozen tool. Reads only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { collectTextFiles, loadExempt, scanFile } from "../scripts/lang-gate.mjs";
import { isListEntry, listEntries, pinnedVerifiers } from "../apps/harness/src/policy-verifiers.ts";
import { canonicalJson, contentProblems, manifestText, tableRowProblems } from "../scripts/spec-publish.mjs";
import { digestProblems } from "../apps/harness/src/policy-digest-floor.ts";
import { projectCell, readRegistry, type ProjectionInputs } from "../apps/harness/src/policy-projection.ts";
import { gitOut } from "./helpers/git-tracked.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const TOOL_ROOT = "tools/kata-recalc";
const BARE = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_")));
const sha256 = (s: string): string => createHash("sha256").update(s).digest("hex");

/** The index entries under TOOL_ROOT, from `git ls-files -s -z` ("<mode> <object> <stage>\t<path>" per entry). */
function indexEntries(): { mode: string; object: string; stage: string; path: string }[] {
  return gitOut(REPO, ["ls-files", "-s", "-z", "--", TOOL_ROOT]).split("\0").filter((l) => l !== "").map((l) => {
    const m = /^(\d{6}) ([0-9a-f]{40,64}) (\d)\t(.+)$/s.exec(l);
    assert.ok(m !== null, `an index line that does not parse: ${l}`);
    const [, mode = "", object = "", stage = "", path = ""] = m;
    return { mode, object, stage, path };
  });
}

// reddened by: a byte of the tool changed in the index (a commit) or in the working tree (an edit, or the killer below), a file added,
// removed or renamed under tools/kata-recalc/, a mode other than 100644, or an unmerged entry
// killer: tools/kata-recalc/kata_lib.py:265 CONST "(_EWMA_W[nret - j] * r) * r" -> "_EWMA_W[nret - j] * (r * r)"
test("kata_recalc_tree_is_the_pinned_manifest - the index holds the tool as 100644 blobs whose manifest digest is the pin of the lot, and the working tree carries them", () => {
  /** The frozen-tool lot (G0 section 17): the eleven files of REASON-ORDER-GUARD-VERIFIER-1 (289756d3...: those of lot 1e, e9e11ccb...,
   *  the eight of lot 1d, ff72522e..., read as a diff against bca9ee52..., the tree of the delivery that the review of P2b saw, G0
   *  section 2.3), with io_guard.py (A-1, A-2, N-2, N-4, N-5), compare_p2.py and compare_check.py (N-5, N-6, path 1), fdlibm_log.py
   *  (N-1, N-2 of #217), recalc_p2.py (the trial chain), report.py and report_check.py (digests, scope, N-3, N-4, N-6) amended, and
   *  guard_check.py added: twelve files; then the G2 of the lot (io_guard.py, guard_check.py, vectors_check.py, report.py and
   *  report_check.py; 2fb204dd... before it); then MONARK's two decisions of 2026-10-07 on the replay command (report.py refuses a run
   *  whose two inputs are not named as that command names them, whose form becomes python -E -s -B, the form of every child of
   *  io_guard.py; guard_check.py and report_check.py test them; 08b00ed1... before them); then the form python -E -S -s -B, which
   *  io_guard.py checks at its import, and a closed list of C libraries of log (ca63fb3c... before them). In the body, so that each lot
   *  that moves the pin is judged by scripts/red-proof.mjs (a changed line judges a test only inside its body). */
  /** Lot 1f: the pin is no longer a constant of this test but the tree_sha256 of the tool's entry in the pinned verifier list
   *  (apps/harness/data/verifiers.json, read by pinnedVerifiers of policy-verifiers.ts, which checks VERIFIERS_SHA256): the last list
   *  entry of monark-kata-recalc that no revocation names. A new tree of the tool needs a new list entry, with its review. */
  const list = pinnedVerifiers(), revoked = new Set(list.filter((v) => !isListEntry(v)).map((v) => `${v.identity}@${v.commit}`));
  const PIN = listEntries(list).filter((e) => e.identity === "monark-kata-recalc" && !revoked.has(`${e.identity}@${e.commit}`)).at(-1)?.tree_sha256;
  const entries = indexEntries();
  assert.deepEqual(entries.filter((e) => e.mode !== "100644" || e.stage !== "0" || !e.path.startsWith(`${TOOL_ROOT}/`)).map((e) => `${e.mode} ${e.stage} ${e.path}`), [],
    "every entry a merged regular file (100644) under tools/kata-recalc/: no link, gitlink or executable");
  const files = entries.map((e) => ({ path: e.path.slice(TOOL_ROOT.length + 1),
    bytes: execFileSync("git", ["--no-replace-objects", "-C", REPO, "cat-file", "blob", e.object], { env: BARE, maxBuffer: 1 << 26 }) }));
  assert.equal(sha256(manifestText(files)), PIN, `the manifest of the index (empty when the index holds no tool: the base, or files not yet staged):\n${manifestText(files)}`);
  assert.deepEqual(files.filter((f) => { const p = join(REPO, TOOL_ROOT, f.path); return !existsSync(p) || !readFileSync(p).equals(f.bytes); }).map((f) => f.path), [],
    "the working tree, from which the tool runs, carries the blobs of the index");
});

// reddened by: ".py" removed from TEXT_EXTS of scripts/lang-gate.mjs (the walk of `npm run lang:gate` would no longer read the tool),
// tools/ skipped by that walk, or a French word in a .py file of the tool (M-9 renamed the auxiliary sequence of the delivery aux_seq)
// killer: scripts/lang-gate.mjs:107 CONST "\".txt\", \".py\"" -> "\".txt\""
test("lang_gate_reads_python_sources - the walk of the language gate collects every .py file of the tool, through scannable(), and none carries a French word", () => {
  const want = readdirSync(join(REPO, TOOL_ROOT)).filter((f) => f.endsWith(".py")).map((f) => `${TOOL_ROOT}/${f}`).sort();
  const root = join(import.meta.dirname, ".."); // no trailing separator: collectTextFiles cuts dir.length + 1 characters off each path
  const walked = collectTextFiles(root).map((f) => f.rel).filter((rel) => rel.startsWith(`${TOOL_ROOT}/`) && rel.endsWith(".py")).sort();
  assert.ok(walked.includes(`${TOOL_ROOT}/recalc_p2.py`), `the walk reads tools/kata-recalc/recalc_p2.py (walked: ${JSON.stringify(walked)})`);
  assert.deepEqual(walked, want, "the walk reads every .py file of the tool");
  const { maskers } = loadExempt(REPO);
  assert.deepEqual(want.flatMap((rel) => scanFile(join(REPO, rel), maskers).map((h) => `${rel}:${h.line}:${h.col} [${h.kind}] ${h.word}`)), [],
    "no French word in the .py sources of the tool");
});

// reddened by: an entry script of the tool (a .py file with a __main__ block) whose code, after its comments, does not open with the five
// lines of the prologue and then import io_guard (a module looked up by name before the guard, io_guard found by name, the tool's folder
// first in sys.path, or the guard run twice), an entry script added or removed, or io_guard.py absent. A tripwire only: the proof of what
// a run read is its list of inputs (G0 section 3.1, part 2), and guard_check.py runs what the prologue closes (IO-GUARD-POSED-FILES-1)
// killer: tools/kata-recalc/recalc_p2.py:12 CONST "import os, sys" -> "import os, sys, json"
test("kata_recalc_entry_scripts_import_the_input_guard_first - every .py file of the tool that runs as a program imports io_guard before any other module", () => {
  const dir = join(REPO, TOOL_ROOT);
  const text = (f: string): string => readFileSync(join(dir, f), "utf8");
  const entries = readdirSync(dir).filter((f) => f.endsWith(".py") && /^if __name__ == "__main__":$/m.test(text(f))).sort();
  assert.deepEqual(entries, ["binom_check.py", "compare_check.py", "compare_p2.py", "guard_check.py", "recalc_p2.py", "report.py", "report_check.py", "vectors_check.py"],
    "the entry scripts of the tool (lot 1e: the report writer and its self-tests; the frozen-tool lot: the self-tests of the guard)");
  const prologue = [ // IO-GUARD-POSED-FILES-1: io_guard.py run by its path, never found by name, once per process, the tool's folder last
    "import os, sys  # sys built in, os frozen: no file is looked up by name before io_guard has checked its folder (IO-GUARD-POSED-FILES-1)",
    "if \"io_guard\" not in sys.modules:  # io_guard.py run by its path, never found by name: nothing posed or installed stands in for it",
    "    sys.path.append(_d := os.path.dirname(os.path.realpath(__file__)))  # the tool's folder, last in sys.path: -P is in FORM",
    "    _g = sys.modules[\"io_guard\"] = type(sys)(\"io_guard\"); _g.__file__ = os.path.join(_d, \"io_guard.py\")",
    "    exec(compile(open(_g.__file__, \"rb\").read(), _g.__file__, \"exec\"), vars(_g))",
    "import io_guard"].join("\n");
  const escaped = prologue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), opens = new RegExp(`^${escaped}\\b`);
  const code = (f: string): string => text(f).replace(/^(?:#.*\n)*/, ""); // its code, after its comments
  assert.deepEqual(entries.filter((f) => !opens.test(code(f))).map((f) => `${f}: ${code(f).split("\n").slice(0, 6).join(" | ")}`), [],
    "after its comments, each entry script opens with the prologue (io_guard.py run by its path, once, the tool's folder last), then imports io_guard");
  assert.ok(existsSync(join(dir, "io_guard.py")), "the guard lives in the tool's tree");
});

// reddened by: a name of the tool's folder, in the index or in the working tree, outside FILES of io_guard.py, the closed list that io_guard
// checks before any other import (a file added to the tool without its name there: IO-GUARD-POSED-FILES-1), a name of FILES without its
// file, FILES unsorted, or FILES not one tuple of the names
// killer: tools/kata-recalc/io_guard.py:60 CONST "\"vectors_check.py\")" -> "\"vectors_check.py\", \"notes.txt\")"
test("kata_recalc_guard_lists_the_files_of_its_folder - FILES of io_guard.py, sorted, is the list of the names of the tool's folder, in the index and in the working tree", () => {
  const block = /^FILES = \(([^)]*)\)/m.exec(readFileSync(join(REPO, TOOL_ROOT, "io_guard.py"), "utf8"));
  assert.ok(block !== null, "io_guard.py names the files of its folder in one FILES tuple (IO-GUARD-POSED-FILES-1)");
  const files = [...(block[1] ?? "").matchAll(/"([^"]*)"/g)].map((m) => m[1] ?? "");
  const index = gitOut(REPO, ["ls-files", "-z", "--", TOOL_ROOT]).split("\0").filter((p) => p !== "").map((p) => p.slice(TOOL_ROOT.length + 1));
  assert.deepEqual(files, [...files].sort(), "FILES is sorted");
  assert.deepEqual([...index].sort(), files, "the entries of the index under tools/kata-recalc/ are the names of FILES, none in a folder");
  assert.deepEqual(readdirSync(join(REPO, TOOL_ROOT)).sort(), files, "the folder of the working tree, from which the tool runs, holds the names of FILES and no other");
});

// reddened by: a third tree of code in the TREES list of io_guard.py (MONARK's closed list, ecace80: tools/kata-recalc, then
// tools/kata-quarter, read only), the list reordered or absent, or a file of the index under tools/ outside these two trees
// killer: tools/kata-recalc/io_guard.py:63 CONST "\"tools/kata-quarter\")" -> "\"tools/kata-quarter\", \"tools/kata-third\")"
test("kata_recalc_guard_admits_two_trees_of_code - io_guard reads the trees tools/kata-recalc and tools/kata-quarter only, and the index holds no third tree under tools/", () => {
  const block = /^TREES = \(([^)\n]*)\)/m.exec(readFileSync(join(REPO, TOOL_ROOT, "io_guard.py"), "utf8"));
  assert.ok(block !== null, "io_guard.py names its trees of code in one TREES tuple");
  assert.deepEqual([...(block[1] ?? "").matchAll(/"([^"]*)"/g)].map((m) => m[1]), [TOOL_ROOT, "tools/kata-quarter"], "the closed list of two trees");
  const third = gitOut(REPO, ["ls-files", "-z", "--", "tools"]).split("\0").filter((p) => p !== "" && !p.startsWith(`${TOOL_ROOT}/`) && !p.startsWith("tools/kata-quarter/"));
  assert.deepEqual(third, [], "no file of the index under tools/ outside the two trees");
});

// reddened by: a fixed text of report.py that the gate of the spec repository refuses at the dated path of the report (an item name,
// an agent role, a private repository name, a local path, the venue outside a cell key, a banned word), report.py absent, or its TEXTS
// block no longer one JSON object, or a fixed text that puts the trial head outside the decisions again (the sentence that path 1
// retires). The report itself is gated in part 2 (T2-3); here, its fixed texts in a report of its shape
// killer: tools/kata-recalc/report.py:48 CONST "\"decisions\": \"every other" -> "\"decisions\": \"TRIAL-HEAD-WRITTEN-1, every other"
test("kata_recalc_report_texts_pass_the_spec_gate - the fixed texts of report.py, in a report of its shape, pass contentProblems in kind json at the dated path", () => {
  const file = join(REPO, TOOL_ROOT, "report.py");
  assert.ok(existsSync(file), "report.py writes the recompute report (lot 1e)");
  const block = /^TEXTS = (\{\n[\s\S]*?\n\})$/m.exec(readFileSync(file, "utf8"));
  assert.ok(block !== null, "report.py holds its fixed texts in one TEXTS block");
  const t = JSON.parse(block[1] ?? "") as Record<string, string>;
  assert.equal(t.outside_reason, undefined, "path 1: no fixed text puts the trial head outside the decisions (REPORT-TRIAL-HEAD-SENTENCE-1, closed)");
  const [hex, commit, key] = ["0123456789abcdef".repeat(4), "0123456789".repeat(4), "kata:ewma-vol-hw-v1@binance/BTCUSDT/1h/b0"];
  const [ln, as] = ["explained, ln", "explained, association"];
  const cell = { task_class: "btc-range-1h", cell_key: key };
  const report = { format: t.format, verifier: `${t.identity ?? ""}@${commit}`, tool: { commit, tree: t.tree, tree_sha256: hex }, replay: t.replay,
    registry: { sha256: hex, generator_identity: t.generator_identity, cells: 280 }, scope: ["btc-mae-up-1h", "btc-range-1h"],
    inputs: { recompute: [{ role: "series", name: "BTCUSDT-15m.csv", sha256: hex, bytes: 1 }, { role: "libm", name: "ucrtbase.dll", sha256: hex, bytes: 1 }],
      compare: [{ role: "registry", name: "wave1.json", sha256: hex, bytes: 1 }] },
    platform: { python: "3.14.5 (tags/v3.14.5:5607950, May 10 2026, 10:43:50) [MSC v.1944 64 bit (AMD64)]", system: "Windows-10-10.0.19045-SP0",
      machine: "AMD64", libm: { name: "ucrtbase.dll", version: "10.0.19041.3636", sha256: hex, log_vectors_differing: 5780 } },
    oracles: { conformance_vectors: { checks: 333, failures: 0 }, log_port: { checks: 34, failures: 0, measured_outputs: 2122614 } },
    fields: { decisions: t.decisions, values: ["calib.qhat", "hourOfWeekFactors"], digests: ["calib.auxSha256", "calib.scoresSha256", "factorTableSha256"],
      value_rule: t.values, digest_rule: t.digests },
    cells: [{ ...cell, decisions_equal: true, scores_sha256: hex }, { task_class: "btc-dir-4h", cell_key: "kata:trend-ema-v1@binance/BTCUSDT/4h/up-b1", decisions_equal: true, scores_sha256: null }],
    differences: [{ ...cell, field: "hourOfWeekFactors[3]", class: ln, kind: "value", a: "0x1.2a3f5c8e9b1d7p-1", b: "0x1.2a3f5c8e9b1d8p-1", ulps: 1 },
      { ...cell, field: "calib.scoresSha256", class: as, kind: "digest", first_index: 1, terms: 923, max_ulps: 4 }],
    explanation: { classes: { [ln]: t[ln], [as]: t[as] }, engine_log: t.engine_log, log: { log_inputs: 327983, differing: 444, max_ulps: 1 } },
    summary: { cells: 280, decisions_equal: 280, values: 1, digests: 1, [ln]: 1, [as]: 1 } };
  assert.ok(Object.values(t).every((v) => typeof v === "string" && v !== ""), "every fixed text is a string");
  assert.deepEqual(contentProblems("contract-1.1.0-tables-2026-10-20/recompute/wave1-monark-kata-recalc.json", "json", Buffer.from(canonicalJson(report)),
    "contract-1.1.0-tables-2026-10-20"), [], "the report's fixed texts pass the gate of the spec repository at its dated path");
});

// reddened by: a class of RELEASE_1_CLASSES in report.py (the scope of the report, form (a)) that the versed registry does not hold, that
// is not a band (Q-3: the first release publishes the bands only), or whose table the gate holds (a row refused by digestProblems, a
// cell without a table row, or the short_digest of tableRowProblems); a band class of the registry missing from it; the list unsorted or
// repeating a class; the registry not versed at apps/harness/data/kata/registry/wave1.json (811fcd57... at the measure of G0 section 17)
// killer: tools/kata-recalc/report.py:62 CONST "\"btc-mae-up-1h\"" -> "\"btc-dir-1h\""
test("kata_recalc_release_classes_are_the_published_bands - RELEASE_1_CLASSES of report.py is every band class of the versed wave 1 registry, none held by the floor or the gate", () => {
  const block = /^RELEASE_1_CLASSES = \(\n([\s\S]*?)\n\)$/m.exec(readFileSync(join(REPO, TOOL_ROOT, "report.py"), "utf8"));
  assert.ok(block !== null, "report.py holds the classes that its first release publishes in one RELEASE_1_CLASSES block (form (a))");
  const listed = [...(block[1] ?? "").matchAll(/"([^"]*)"/g)].map((m) => m[1] ?? "");
  const file = join(REPO, "apps/harness/data/kata/registry/wave1.json");
  assert.ok(existsSync(file), "the wave 1 registry is versed at apps/harness/data/kata/registry/wave1.json (R25-REGISTRY-ROOT-1, PR 2)");
  const bytes = readFileSync(file);
  const inp: ProjectionInputs = { registryFile: "wave1.json", registrySha256: createHash("sha256").update(bytes).digest("hex"), generator: "kata/bench/write-p2.ts@g",
    attestation: () => ({ verifier: "monark-kata-recalc@v", report_sha256: "0".repeat(64) }), text: (rule) => `text of ${rule}` };
  const classes = new Map<string, { rows: object[]; noRow: number; refused: number }>();
  for (const cell of readRegistry(bytes)) {
    const c = classes.get(cell.taskClass) ?? { rows: [], noRow: 0, refused: 0 };
    classes.set(cell.taskClass, c);
    const row = projectCell(cell, inp);
    if (row === null) c.noRow++;
    else { c.rows.push(row); c.refused += digestProblems(row).length > 0 ? 1 : 0; }
  }
  const band = (c: string): boolean => /^[a-z]+-(range|mae-down|mae-up)-(1h|4h)$/.test(c);
  const held = (c: string): string[] => { const t = classes.get(c) ?? { rows: [], noRow: 0, refused: 0 }; return [...(t.refused > 0 ? [`${String(t.refused)} row(s) refused by digestProblems`] : []),
    ...(t.noRow > 0 ? [`${String(t.noRow)} cell(s) without a row`] : []), ...tableRowProblems({ class: { task_class: c }, rows: t.rows }).filter((p) => p.code === "short_digest").map((p) => p.code)]; };
  assert.deepEqual(listed.filter((c) => !classes.has(c)), [], "every class of the list is a class of the registry");
  assert.deepEqual(listed.filter((c) => !band(c)), [], "every class of the list is a band (Q-3: the first release publishes the bands only)");
  assert.deepEqual([...classes.keys()].filter((c) => band(c) && !listed.includes(c)), [], "every band class of the registry is in the list");
  assert.deepEqual(listed.filter((c) => held(c).length > 0).map((c) => `${c}: ${held(c).join(", ")}`), [], "no class of the list is held by the floor or the gate");
  assert.deepEqual(listed, [...new Set(listed)].sort(), "the list is sorted, each class once");
  assert.equal(listed.length, 24, "the 24 band classes of wave 1");
});
