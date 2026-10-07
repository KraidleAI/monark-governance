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
// gates the fixed texts of the report through contentProblems of scripts/spec-publish.mjs. Reads only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { collectTextFiles, loadExempt, scanFile } from "../scripts/lang-gate.mjs";
import { canonicalJson, contentProblems, manifestText } from "../scripts/spec-publish.mjs";
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
  /** Lot 1e: the manifest of the eleven files after M-11, the eight of lot 1d (ff72522e..., itself read as a diff against bca9ee52...,
   *  the tree of the delivery that the review of P2b saw, G0 section 2.3), io_guard.py and recalc_p2.py amended, and fdlibm_log.py,
   *  report.py and report_check.py. In the body, so that each lot that moves the pin is judged by scripts/red-proof.mjs (a changed line
   *  judges a test only inside its body). */
  const PIN = "e9e11ccb63a7f5c538f853d2e4773f63cca3cce4a8d7b55fccd1f5d6646cef24";
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

// reddened by: an entry script of the tool (a .py file with a __main__ block) whose first import is not io_guard, an entry script added
// or removed, or io_guard.py absent. A tripwire only: the proof of what a run read is its list of inputs (G0 section 3.1, part 2)
// killer: tools/kata-recalc/recalc_p2.py:12 CONST "import io_guard" -> "import os"
test("kata_recalc_entry_scripts_import_the_input_guard_first - every .py file of the tool that runs as a program imports io_guard before any other module", () => {
  const dir = join(REPO, TOOL_ROOT);
  const text = (f: string): string => readFileSync(join(dir, f), "utf8");
  const entries = readdirSync(dir).filter((f) => f.endsWith(".py") && /^if __name__ == "__main__":$/m.test(text(f))).sort();
  assert.deepEqual(entries, ["binom_check.py", "compare_check.py", "compare_p2.py", "recalc_p2.py", "report.py", "report_check.py", "vectors_check.py"],
    "the entry scripts of the tool (lot 1e: the report writer and its self-tests)");
  assert.deepEqual(entries.map((f) => `${f}: ${/^(?:import|from) ([\w.]+)/m.exec(text(f))?.[1] ?? "(no import)"}`), entries.map((f) => `${f}: io_guard`),
    "the first import of each entry script");
  assert.ok(existsSync(join(dir, "io_guard.py")), "the guard lives in the tool's tree");
});

// reddened by: a fixed text of report.py that the gate of the spec repository refuses at the dated path of the report (an item name,
// an agent role, a private repository name, a local path, the venue outside a cell key, a banned word), report.py absent, or its TEXTS
// block no longer one JSON object. The report itself is gated in part 2 (T2-3); here, its fixed texts in a report of its shape
// killer: tools/kata-recalc/report.py:50 CONST "\"outside_reason\": \"not a decision:" -> "\"outside_reason\": \"TRIAL-HEAD-WRITTEN-1, not a decision:"
test("kata_recalc_report_texts_pass_the_spec_gate - the fixed texts of report.py, in a report of its shape, pass contentProblems in kind json at the dated path", () => {
  const file = join(REPO, TOOL_ROOT, "report.py");
  assert.ok(existsSync(file), "report.py writes the recompute report (lot 1e)");
  const block = /^TEXTS = (\{\n[\s\S]*?\n\})$/m.exec(readFileSync(file, "utf8"));
  assert.ok(block !== null, "report.py holds its fixed texts in one TEXTS block");
  const t = JSON.parse(block[1] ?? "") as Record<string, string>;
  const [hex, commit, key] = ["0123456789abcdef".repeat(4), "0123456789".repeat(4), "kata:ewma-vol-hw-v1@binance/BTCUSDT/1h/b0"];
  const [ln, as] = ["explained, ln", "explained, association"];
  const cell = { task_class: "btc-range-1h", cell_key: key };
  const report = { format: t.format, verifier: `${t.identity ?? ""}@${commit}`, tool: { commit, tree: t.tree, tree_sha256: hex }, replay: t.replay,
    registry: { file: "wave1.json", sha256: hex, generator_identity: t.generator_identity, cells: 280 },
    inputs: { recompute: [{ role: "series", name: "BTCUSDT-15m.csv", sha256: hex, bytes: 1 }, { role: "libm", name: "ucrtbase.dll", sha256: hex, bytes: 1 }],
      compare: [{ role: "registry", name: "wave1.json", sha256: hex, bytes: 1 }] },
    platform: { python: "3.14.5 (tags/v3.14.5:5607950, May 10 2026, 10:43:50) [MSC v.1944 64 bit (AMD64)]", system: "Windows-10-10.0.19045-SP0",
      machine: "AMD64", libm: { name: "ucrtbase.dll", version: "10.0.19041.3636", sha256: hex, log_vectors_differing: 5780 } },
    oracles: { conformance_vectors: { checks: 333, failures: 0 }, log_port: { checks: 34, failures: 0, measured_outputs: 2122614 } },
    fields: { decisions: t.decisions, values: ["calib.qhat", "hourOfWeekFactors"], digests: ["calib.auxSha256", "calib.scoresSha256", "factorTableSha256"],
      outside_decisions: [{ field: "trialRegistryHead.hash", reason: t.outside_reason }], value_rule: t.values, digest_rule: t.digests },
    cells: [{ ...cell, decisions_equal: true }],
    differences: [{ ...cell, field: "hourOfWeekFactors[3]", class: ln, kind: "value", a: "0x1.2a3f5c8e9b1d7p-1", b: "0x1.2a3f5c8e9b1d8p-1", ulps: 1 },
      { ...cell, field: "calib.scoresSha256", class: as, kind: "digest", a: hex, b: hex, first_index: 1, terms: 923, max_ulps: 4 }],
    explanation: { classes: { [ln]: t[ln], [as]: t[as] }, engine_log: t.engine_log, log: { log_inputs: 327983, differing: 444, max_ulps: 1 } },
    summary: { cells: 280, decisions_equal: 280, values: 1, digests: 1, [ln]: 1, [as]: 1 } };
  assert.ok(Object.values(t).every((v) => typeof v === "string" && v !== ""), "every fixed text is a string");
  assert.deepEqual(contentProblems("contract-1.1.0-tables-2026-10-20/recompute/wave1-monark-kata-recalc.json", "json", Buffer.from(canonicalJson(report)),
    "contract-1.1.0-tables-2026-10-20"), [], "the report's fixed texts pass the gate of the spec repository at its dated path");
});
