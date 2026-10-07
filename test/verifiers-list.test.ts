// test/verifiers-list.test.ts -- lot 1f of VERIFIERS-LIST-F5A-1 (2026-10-07; G0 docs/G0-lot-verifiers-list-1f.md, and the chantier G0
// docs/G0-lot-verifiers-list-f5a-1.md section 3.2 and part 1 as amended there): the pinned list of verifiers, its closed reader, its
// lazy pinned read (Q-P3-7), the one identity rule, the tree digest of the listed tool, the date rule of a revocation and the run log of
// the report writer, never published. Reads only; a child process and a throwaway copy of the module under the OS temporary directory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { verifierIdentity } from "../apps/harness/src/policy-guard.ts";
import { checkedVerifiers, identityOf, isListEntry, isPrefix, listEntries, pinnedVerifiers, readVerifiers, toolTreeSha256, validDate as listDate,
  VERIFIERS_SHA256, type ListEntry, type Verifier } from "../apps/harness/src/policy-verifiers.ts";
import { canonicalJson, contentProblems, manifestText, validDate } from "../scripts/spec-publish.mjs";
import { gitOut } from "./helpers/git-tracked.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const LIST = join(REPO, "apps/harness/data/verifiers.json");
const MODULE = join(REPO, "apps/harness/src/policy-verifiers.ts");
const TOOL_ROOT = "tools/kata-recalc";
const sha256 = (b: Uint8Array | string): string => createHash("sha256").update(b).digest("hex");
const BARE = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_")));
const gitStatus = (args: string[]): number | null => spawnSync("git", ["-C", REPO, ...args], { env: BARE }).status;
const [C1, C2, T1] = ["1".repeat(40), "2".repeat(40), "a".repeat(64)];
const entry = (over: Record<string, unknown> = {}): Record<string, unknown> =>
  ({ commit: C1, identity: "monark-kata-recalc", repository: "KraidleAI/monark-governance", tree: TOOL_ROOT, tree_sha256: T1, ...over });
const listOf = (...vs: unknown[]): string => JSON.stringify({ format: "monark-verifiers-v1", verifiers: vs });
/** The last list entry of the tool that no revocation names: the entry whose tree the index must carry. */
const toolEntry = (vs: readonly Verifier[]): ListEntry | undefined =>
  listEntries(vs).filter((e) => e.identity === "monark-kata-recalc" && !vs.some((r) => !isListEntry(r) && r.identity === e.identity && r.commit === e.commit)).at(-1);

// reddened by: a byte of verifiers.json changed without its pin, a pin that is not the sha256 of the file, a non-canonical writing or a
// final newline, or a pinned read that is not memoised (two calls, two arrays)
// killer: apps/harness/src/policy-verifiers.ts:18 CONST "220e9025654dac553b62d6ae7aeb8c5247c59cc70947baf379a67674163f5ecb" -> "0000000000000000000000000000000000000000000000000000000000000000"
test("verifier_list_is_the_pinned_canonical_bytes - the list file has the sha256 VERIFIERS_SHA256, is its own canonical writing with no final newline, and the pinned read is memoised", () => {
  const bytes = readFileSync(LIST), text = bytes.toString("utf8");
  assert.equal(sha256(bytes), VERIFIERS_SHA256, "the sha256 of apps/harness/data/verifiers.json is the pin");
  assert.equal(canonicalJson(JSON.parse(text)), text, "the canonical writing of the 1.1.0 draft, section 2");
  assert.ok(!text.endsWith("\n"), "no final newline");
  const first = pinnedVerifiers();
  assert.equal(pinnedVerifiers(), first, "memoised: the second call returns the same array");
  assert.deepEqual(first, readVerifiers(bytes), "the pinned read is the reader on the file's bytes");
  assert.ok(toolEntry(first) !== undefined, "the list holds a list entry of monark-kata-recalc that no revocation names");
});

// reddened by: a departure of the two closed entry forms accepted (a key more or less, a mixed form, a revision or a capital in an
// identity, a malformed commit, tree_sha256 or date, another tree or repository, a pair listed twice, a revocation before its entry or
// twice), a refusal unnamed, or a revocation retained as an attesting entry
// killer: apps/harness/src/policy-verifiers.ts:64 CONST "v.identity === identityOf(v.identity)" -> "true"
test("verifier_list_reader_refuses_each_departure - two closed forms, unique (identity, commit) list entries in append order, at most one revocation per entry and after it, each refusal named", () => {
  const revoke = (over: Record<string, unknown> = {}): Record<string, unknown> => ({ commit: C1, identity: "monark-kata-recalc", revoked: "2026-10-07", ...over });
  const refuses = (text: string, why: RegExp, what: string): void => assert.throws(() => readVerifiers(text), (e: unknown) => e instanceof Error && why.test(e.message), what);
  // accepted: append order (not sorted), a second revision of one identity, a revocation after its entry; only list entries attest
  const ok = readVerifiers(listOf(entry({ identity: "z-tool" }), entry(), entry({ commit: C2 }), revoke()));
  assert.deepEqual(ok.map((v) => `${v.identity}@${v.commit}${isListEntry(v) ? "" : " revoked"}`), [`z-tool@${C1}`, `monark-kata-recalc@${C1}`, `monark-kata-recalc@${C2}`, `monark-kata-recalc@${C1} revoked`]);
  assert.deepEqual(listEntries(ok).map((e) => e.tree_sha256), [T1, T1, T1], "A-1 and the guard keep the list entries alone");
  assert.equal(toolEntry(ok)?.commit, C2, "the revoked revision is not the tool's entry");
  refuses(listOf(entry({ extra: 1 })), /entry 0 is of neither form \(keys commit, extra, identity/, "a key more");
  refuses(listOf(entry({ tree_sha256: undefined })), /entry 0 is of neither form/, "a key less");
  refuses(listOf(entry({ revoked: "2026-10-07" })), /entry 0 is of neither form/, "the two forms mixed");
  refuses(listOf(entry(), revoke({ tree: TOOL_ROOT })), /entry 1 is of neither form/, "a revocation with a key of the list form");
  refuses(JSON.stringify({ format: "monark-verifiers-v2", verifiers: [entry()] }), /format is not monark-verifiers-v1/, "another format");
  refuses(JSON.stringify({ format: "monark-verifiers-v1", verifiers: [entry()], note: "" }), /top level is not exactly/, "a top-level key more");
  refuses(listOf(), /not a non-empty array/, "no entry");
  refuses("{", /not UTF-8 JSON/, "not JSON");
  refuses(listOf(entry({ identity: "Monark-Kata-Recalc" })), /entry 0: identity is not an identity/, "a capital");
  refuses(listOf(entry({ identity: "a@b" })), /entry 0: identity is not an identity/, "a revision in the identity");
  refuses(listOf(entry({ identity: "" })), /entry 0: identity is not an identity/, "an empty identity");
  refuses(listOf(entry(), revoke({ identity: "Monark-Kata-Recalc" })), /entry 1: identity is not an identity/, "a capital in a revocation");
  refuses(listOf(entry({ commit: C1.toUpperCase().replace(/1/g, "A") })), /entry 0: commit is not 40/, "an upper-case commit");
  refuses(listOf(entry({ commit: "1".repeat(39) })), /entry 0: commit is not 40/, "a short commit");
  refuses(listOf(entry({ tree_sha256: "a".repeat(63) })), /entry 0: tree_sha256 is not 64/, "a short tree_sha256");
  refuses(listOf(entry({ tree: "tools" })), /entry 0: tree is not tools\/kata-recalc/, "another tree");
  refuses(listOf(entry({ repository: "KraidleAI/other" })), /entry 0: repository is not/, "another repository");
  refuses(listOf(entry(), entry({ tree_sha256: "b".repeat(64) })), /entry 1: monark-kata-recalc@1{40} is listed twice/, "a pair listed twice");
  refuses(listOf(revoke(), entry()), /entry 0: a revocation of monark-kata-recalc@1{40}, which no list entry above it names/, "a revocation before its entry");
  refuses(listOf(entry(), revoke({ commit: C2 })), /entry 1: a revocation of monark-kata-recalc@2{40}, which no list entry/, "a revocation of no entry");
  refuses(listOf(entry(), revoke(), revoke({ revoked: "2026-10-08" })), /entry 2: a second revocation/, "two revocations of one entry");
  for (const d of ["2026-02-29", "2026-13-01", "2026-1-01", "20261001"]) refuses(listOf(entry(), revoke({ revoked: d })), /entry 1: revoked is not a real/, `date ${d}`);
  refuses(listOf(entry(), revoke({ revoked: 20261007 })), /entry 1: revoked is not a real/, "a date that is not a string");
});

// reddened by: the digest of the index under tools/kata-recalc/ other than the listed tree_sha256 (a byte of the tool changed or a file
// added, removed or renamed without a new list entry), a digest rule other than manifestText, or a link, gitlink, executable or path
// outside the tool accepted
// killer: apps/harness/src/policy-verifiers.ts:108 CONST "p.slice(TOOL_ROOT.length + 1)" -> "p"
test("verifier_tool_tree_is_the_listed_tree - toolTreeSha256 of the index under tools/kata-recalc/ is the tree_sha256 of the tool's list entry, by the manifestText rule", () => {
  const index = gitOut(REPO, ["ls-files", "-s", "-z", "--", TOOL_ROOT]).split("\0").filter((l) => l !== "").map((l) => {
    const [, mode = "", object = "", path = ""] = /^(\d{6}) ([0-9a-f]+) \d\t(.+)$/s.exec(l) ?? [];
    return { mode, path, bytes: execFileSync("git", ["--no-replace-objects", "-C", REPO, "cat-file", "blob", object], { env: BARE, maxBuffer: 1 << 26 }) };
  });
  assert.ok(index.length > 0, "the index holds the tool");
  assert.equal(toolTreeSha256(index), sha256(manifestText(index.map((b) => ({ path: b.path.slice(TOOL_ROOT.length + 1), bytes: b.bytes })))), "the rule of MANIFEST.sha256");
  assert.equal(toolTreeSha256(index), toolEntry(pinnedVerifiers())?.tree_sha256, "the index carries the listed tree");
  const one = { mode: "100644", path: `${TOOL_ROOT}/a.py`, bytes: Buffer.from("a\n") }, base = toolTreeSha256([one]);
  assert.equal(base, sha256(`${sha256("a\n")}  a.py\n`), "one line: the blob's sha256, two spaces, the path under the tool, LF");
  assert.notEqual(toolTreeSha256([one, { ...one, path: `${TOOL_ROOT}/b.py` }]), base, "a file more");
  assert.notEqual(toolTreeSha256([{ ...one, bytes: Buffer.from("b\n") }]), base, "a byte changed");
  for (const mode of ["120000", "160000", "100755"]) assert.throws(() => toolTreeSha256([{ ...one, mode }]), new RegExp(`has mode ${mode}, not a regular file`), `mode ${mode}`);
  assert.throws(() => toolTreeSha256([{ ...one, path: "tools/kata-recalc-x/a.py" }]), /is not under tools\/kata-recalc\//, "a path beside the tool");
});

// reddened by: identityOf and the rule of policy-guard.ts l.24 parting on a name (case, several "@", the empty string, a non-ASCII
// letter), an expected identity other than the sample's, or the listed identity equal to the generator's
// killer: apps/harness/src/policy-verifiers.ts:35 CONST "/[A-Z]/g" -> "/[A-Y]/g"
test("verifier_identity_rule_is_the_guard_rule_and_not_the_generator - identityOf is the rule of verifierIdentity on a sample, gives the expected identities, and the listed tool is not the generator", () => {
  const expected: Record<string, string> = { "Monark-Kata-Recalc@1ea4f64": "monark-kata-recalc", "a@b@c": "a", "": "", "@x": "", "ZYX-Tool": "zyx-tool",
    "kata/bench/write-p2.ts@1ea4f64738625d918b9e177e1657207c330a5261": "kata/bench/write-p2.ts", "\u00c9tool-Z@1": "\u00c9tool-z", "\u00dftool": "\u00dftool", "\u01c5@Z": "\u01c5" };
  for (const [name, id] of Object.entries(expected)) {
    assert.equal(identityOf(name), id, `identityOf(${JSON.stringify(name)})`);
    assert.equal(verifierIdentity(name), identityOf(name), `the guard's rule on ${JSON.stringify(name)}`);
  }
  const tool = toolEntry(pinnedVerifiers());
  assert.equal(tool?.identity, "monark-kata-recalc", "the listed tool");
  assert.notEqual(tool?.identity, identityOf("kata/bench/write-p2.ts@1ea4f64738625d918b9e177e1657207c330a5261"), "a verifier is never the generator (A-2)");
});

// reddened by: a byte of the list that the gate of the spec repository refuses at the path of a dated folder's copy (a name of this
// repository taken for a private one, a banned word, a CR), or a list that is no longer its canonical writing
// killer: scripts/spec-publish.mjs:96 CONST "/^monark-governance$/i.test(v.word)" -> "false"
test("verifier_list_copy_passes_the_spec_gate - the list's bytes pass contentProblems in kind json as the copy of a dated folder", () => {
  assert.deepEqual(contentProblems("contract-1.1.0-tables-2026-10-20/verifiers.json", "json", readFileSync(LIST), "contract-1.1.0-tables-2026-10-20"), []);
});

// reddened by: the list read when the module loads (the public export carries apps/harness/src, not apps/harness/data), an altered or
// missing list accepted, or a refusal that a second call forgets (memoised as a success only)
// killer: apps/harness/src/policy-verifiers.ts:85 CONST "sha256(bytes) !== pin" -> "false"
test("pinned_list_is_read_lazily_and_an_altered_list_stops_closed - loading the module reads nothing; a missing or altered list throws on every call; the pinned bytes pass", () => {
  const bytes = readFileSync(LIST), altered = Buffer.from(bytes.toString("utf8").replace("monark-kata-recalc", "monark-kata-recalx"));
  assert.throws(() => checkedVerifiers(altered), /the bytes have sha256 [0-9a-f]{64}, the pin is /, "an altered list, closed");
  assert.deepEqual(checkedVerifiers(bytes), readVerifiers(bytes));
  const dir = mkdtempSync(join(tmpdir(), "verifiers-1f-"));
  try {
    mkdirSync(join(dir, "src")); mkdirSync(join(dir, "data"));
    copyFileSync(MODULE, join(dir, "src/policy-verifiers.ts"));
    const run = (): string => {
      const r = spawnSync(process.execPath, ["--input-type=module", "-e", `import * as m from ${JSON.stringify(join(dir, "src/policy-verifiers.ts"))};
        const out = ["loaded"]; for (let i = 0; i < 2; i++) { try { out.push(m.pinnedVerifiers().length); } catch (e) { out.push(e.code ?? String(e.message).slice(0, 40)); } }
        console.log(out.join("|"));`], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      return r.stdout.trim();
    };
    assert.equal(run(), "loaded|ENOENT|ENOENT", "no list: the module loads, each call throws");
    writeFileSync(join(dir, "data/verifiers.json"), altered);
    assert.equal(run(), "loaded|MONARK verifier list: the bytes have sha|MONARK verifier list: the bytes have sha", "an altered list: each call throws");
    writeFileSync(join(dir, "data/verifiers.json"), bytes);
    assert.equal(run(), `loaded|${readVerifiers(bytes).length}|${readVerifiers(bytes).length}`, "the pinned bytes");
  } finally { rmSync(dir, { recursive: true, force: true }); }
  assert.ok(isPrefix([], pinnedVerifiers()) && isPrefix(pinnedVerifiers(), pinnedVerifiers()), "a carried copy: a prefix of the list");
  const two = readVerifiers(listOf(entry(), entry({ commit: C2 })));
  assert.ok(isPrefix(two.slice(0, 1), two) && !isPrefix(two.slice(1), two) && !isPrefix(readVerifiers(listOf(entry({ tree_sha256: "b".repeat(64) }))), two), "prefix judged entry by entry, in order");
});

// reddened by: the date rule of the list parting from validDate of scripts/spec-publish.mjs on a string or a value, over every day of
// four years (a leap year among them) and their impossible neighbours
// killer: apps/harness/src/policy-verifiers.ts:41 CONST "t.getUTCDate() === d" -> "true"
test("verifier_list_date_rule_is_the_spec_publish_rule - validDate of policy-verifiers.ts agrees with validDate of scripts/spec-publish.mjs, without importing scripts/", () => {
  const samples: unknown[] = ["2026-10-07", "2024-02-29", "2026-02-29", "1900-02-29", "2000-02-29", "2026-00-10", "2026-13-01", "2026-04-31", "2026-1-01", "26-10-07", " 2026-10-07",
    "2026-10-07\n", "\uff12026-10-07", "", null, undefined, 20261007, ["2026-10-07"]];
  for (let y = 2023; y <= 2026; y++) for (let m = 1; m <= 12; m++) for (let d = 0; d <= 32; d++) samples.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  assert.deepEqual(samples.filter((s) => listDate(s) !== validDate(s)), [], "the two rules agree");
  assert.equal(samples.filter((s) => listDate(s)).length, 4 * 365 + 1 + 3, "every real day of 2023 to 2026, plus 2026-10-07, 2024-02-29 and 2000-02-29");
  assert.ok(!/from "[./]*scripts\//.test(readFileSync(MODULE, "utf8")) && !/policy-guard/.test(readFileSync(MODULE, "utf8").replace(/^ \*.*$/gm, "")), "the module imports nothing from scripts/ nor the guard");
  assert.deepEqual([...readFileSync(MODULE, "utf8").matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]), ["node:crypto", "node:fs", "node:url"], "the module's imports");
});

// reddened by: run-log.json no longer ignored by git (anywhere in the tree, any folder), a tracked file of that name, or a release entry of
// scripts/spec-publish-inputs.json that reads or writes one
// killer: .gitignore:36 SDL "run-log.json" -> ""
test("no_run_log_is_ever_published - git ignores run-log.json at every depth, none is tracked, and no release of the spec inputs reads or writes one", () => {
  const where = ["run-log.json", "apps/harness/data/kata/recompute/run-log.json", "tools/kata-recalc/out/run-log.json", "spec/contract-1.1.0-tables-2026-10-20/recompute/run-log.json"];
  assert.deepEqual(where.filter((p) => gitStatus(["check-ignore", "-q", "--no-index", p]) !== 0), [], "each path ignored by git");
  assert.deepEqual(gitOut(REPO, ["ls-files", "-z"]).split("\0").filter((p) => /(^|\/)run-log\.json$/i.test(p)), [], "no tracked run-log.json");
  const inputs = JSON.parse(readFileSync(join(REPO, "scripts/spec-publish-inputs.json"), "utf8")) as { releases: Record<string, { entries: { out: string; path: string }[] }> };
  const named = Object.entries(inputs.releases).flatMap(([id, r]) => r.entries.filter((e) => /(^|\/)run-log\.json$/i.test(e.out) || /(^|\/)run-log\.json$/i.test(e.path)).map((e) => `${id}: ${e.out}`));
  assert.ok(Object.keys(inputs.releases).length > 0, "the spec inputs list releases");
  assert.deepEqual(named, [], "no release entry reads or writes a run-log.json");
  assert.match(readFileSync(join(REPO, TOOL_ROOT, "report.py"), "utf8"), /os\.path\.join\(a\["out"\], "run-log\.json"\)/, "report.py writes its run log by that name, beside the report");
});

// reddened by: a list entry whose commit is not in the repository's history (the placeholder of 40 zeros included: lot 1f is built on
// the trunk before the frozen tool merges), or whose commit does not carry the listed tree under tools/kata-recalc/ (section 3.2 recipe)
// killer: apps/harness/src/policy-verifiers.ts:110 CONST "(a.path < b.path ? -1 : 1)" -> "(a.path < b.path ? 1 : -1)"
test("verifier_list_commit_carries_the_listed_tree - each list entry names a commit of this repository whose tree under tools/kata-recalc/ has the listed digest", () => {
  for (const e of listEntries(pinnedVerifiers())) {
    assert.notEqual(e.commit, "0".repeat(40), "a placeholder: the entry must name the merge commit of the frozen tool on the trunk, and its tree, before this merges");
    assert.equal(gitStatus(["cat-file", "-e", `${e.commit}^{commit}`]), 0, `${e.commit} is a commit of this repository`);
    const blobs = gitOut(REPO, ["ls-tree", "-r", "-z", "--full-tree", e.commit, "--", TOOL_ROOT]).split("\0").filter((l) => l !== "").map((l) => {
      const [, mode = "", object = "", path = ""] = /^(\d{6}) \w+ ([0-9a-f]+)\t(.+)$/s.exec(l) ?? [];
      return { mode, path, bytes: execFileSync("git", ["--no-replace-objects", "-C", REPO, "cat-file", "blob", object], { env: BARE, maxBuffer: 1 << 26 }) };
    });
    assert.equal(toolTreeSha256(blobs), e.tree_sha256, `the tree of ${TOOL_ROOT} at ${e.commit}`);
  }
});
