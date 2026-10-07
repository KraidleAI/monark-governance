// test/kata-recalc.test.ts -- lot 1a of VERIFIERS-LIST-F5A-1 (2026-10-06; G0 docs/G0-lot-verifiers-list-f5a-1.md, sections 3.1, 3.2
// and 5): the recalculation tool under tools/kata-recalc/, imported byte for byte from its delivery, is held by the digest of its tree.
// The tree is read from the git INDEX, never from the working tree (G0 section 3.2, rule 1): `git ls-files -s` gives the mode and the
// blob of each entry, `git cat-file blob` its bytes; every mode is 100644 (a link 120000, a gitlink 160000 or an executable 100755 is
// refused); sha256(manifestText(files)), the MANIFEST.sha256 format of scripts/spec-publish.mjs, equals the pin of the lot. The working
// tree, from which the tool runs, must carry the same blobs: an edit not yet staged reddens too, and so does the killer, which
// scripts/red-proof.mjs fires on the working tree only. Lots 1b to 1e move the pin to the trees they import or modify; lot 1f replaces
// it with the tree_sha256 of the pinned verifier list. git runs without the caller's GIT_* variables (test/helpers/git-tracked.ts).
// Lot 1d (M-7, M-9) adds two tests: the language gate reads the .py sources of the tool, and each entry script imports io_guard, the
// input guard, before any other module. Reads only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { collectTextFiles, loadExempt, scanFile } from "../scripts/lang-gate.mjs";
import { manifestText } from "../scripts/spec-publish.mjs";
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
  /** Lot 1d: the manifest of the eight files after M-1 to M-9, the seven files of the delivery modified in place and io_guard.py; it is
   *  read as a diff against bca9ee52..., the tree of the delivery that the review of P2b saw (G0 section 2.3), pinned by lot 1c. In the
   *  body, so that each lot that moves the pin is judged by scripts/red-proof.mjs (a changed line judges a test only inside its body). */
  const PIN = "33363936d77790bddf509a509dd2278b1807741525fa9c3bfbfa38536e87a588";
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
// killer: tools/kata-recalc/recalc_p2.py:11 CONST "import io_guard" -> "import os"
test("kata_recalc_entry_scripts_import_the_input_guard_first - every .py file of the tool that runs as a program imports io_guard before any other module", () => {
  const dir = join(REPO, TOOL_ROOT);
  const text = (f: string): string => readFileSync(join(dir, f), "utf8");
  const entries = readdirSync(dir).filter((f) => f.endsWith(".py") && /^if __name__ == "__main__":$/m.test(text(f))).sort();
  assert.deepEqual(entries, ["binom_check.py", "compare_check.py", "compare_p2.py", "recalc_p2.py", "vectors_check.py"], "the entry scripts of the tool");
  assert.deepEqual(entries.map((f) => `${f}: ${/^(?:import|from) ([\w.]+)/m.exec(text(f))?.[1] ?? "(no import)"}`), entries.map((f) => `${f}: io_guard`),
    "the first import of each entry script");
  assert.ok(existsSync(join(dir, "io_guard.py")), "the guard lives in the tool's tree");
});
