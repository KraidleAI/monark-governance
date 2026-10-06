// test/kata-recalc.test.ts -- lot 1a of VERIFIERS-LIST-F5A-1 (2026-10-06; G0 docs/G0-lot-verifiers-list-f5a-1.md, sections 3.1, 3.2
// and 5): the recalculation tool under tools/kata-recalc/, imported byte for byte from its delivery, is held by the digest of its tree.
// The tree is read from the git INDEX, never from the working tree (G0 section 3.2, rule 1): `git ls-files -s` gives the mode and the
// blob of each entry, `git cat-file blob` its bytes; every mode is 100644 (a link 120000, a gitlink 160000 or an executable 100755 is
// refused); sha256(manifestText(files)), the MANIFEST.sha256 format of scripts/spec-publish.mjs, equals the pin of the lot. The working
// tree, from which the tool runs, must carry the same blobs: an edit not yet staged reddens too, and so does the killer, which
// scripts/red-proof.mjs fires on the working tree only. Lots 1b and 1c move the pin to the trees they import; lot 1f replaces it with
// the tree_sha256 of the pinned verifier list. git runs without the caller's GIT_* variables (test/helpers/git-tracked.ts). Reads only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { manifestText } from "../scripts/spec-publish.mjs";
import { gitOut } from "./helpers/git-tracked.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const TOOL_ROOT = "tools/kata-recalc";
/** Lot 1a: the manifest of binom_exact.py c83d971a..., kata_lib.py 11656b35... and vectors_check.py d96f4fab..., the bytes of the
 *  delivery (its DELIVERED.sha256, l.58, l.61, l.63). */
const PIN = "72b1c80c6a1e6b18d05abdc8d6589c8245efae8ff8cf051ea96ab9c60e6860b5";
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
// killer: tools/kata-recalc/kata_lib.py:265 CONST "_EWMA_W[nret - j] * (r * r)" -> "(_EWMA_W[nret - j] * r) * r"
test("kata_recalc_tree_is_the_pinned_manifest - the index holds the tool as 100644 blobs whose manifest digest is the pin of the lot, and the working tree carries them", () => {
  const entries = indexEntries();
  assert.deepEqual(entries.filter((e) => e.mode !== "100644" || e.stage !== "0" || !e.path.startsWith(`${TOOL_ROOT}/`)).map((e) => `${e.mode} ${e.stage} ${e.path}`), [],
    "every entry a merged regular file (100644) under tools/kata-recalc/: no link, gitlink or executable");
  const files = entries.map((e) => ({ path: e.path.slice(TOOL_ROOT.length + 1),
    bytes: execFileSync("git", ["--no-replace-objects", "-C", REPO, "cat-file", "blob", e.object], { env: BARE, maxBuffer: 1 << 26 }) }));
  assert.equal(sha256(manifestText(files)), PIN, `the manifest of the index (empty when the index holds no tool: the base, or files not yet staged):\n${manifestText(files)}`);
  assert.deepEqual(files.filter((f) => { const p = join(REPO, TOOL_ROOT, f.path); return !existsSync(p) || !readFileSync(p).equals(f.bytes); }).map((f) => f.path), [],
    "the working tree, from which the tool runs, carries the blobs of the index");
});
