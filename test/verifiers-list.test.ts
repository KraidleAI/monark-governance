// test/verifiers-list.test.ts -- lot 1f of VERIFIERS-LIST-F5A-1 (2026-10-07; G0 docs/G0-lot-verifiers-list-1f.md, and the chantier G0
// docs/G0-lot-verifiers-list-f5a-1.md section 3.2 and part 1 as amended there): the pinned list of verifiers, its closed reader (closed
// on the bytes too, and rendering frozen), its lazy pinned read (Q-P3-7), the one identity rule, the tree digest of the listed tool, the
// date rule of a revocation, the run log of the report writer (ignored and untracked) and the shared reader of module loads. Reads only;
// a child process and a throwaway copy of the module under the OS temporary directory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { forbiddenLoads, importSpecifiers } from "../apps/harness/test/helpers/import-specifiers.ts";
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
// final newline, a pinned read that is not memoised (two calls, two arrays), or a list or an element that a caller can change (not frozen)
// killer: apps/harness/src/policy-verifiers.ts:18 CONST "220e9025654dac553b62d6ae7aeb8c5247c59cc70947baf379a67674163f5ecb" -> "0000000000000000000000000000000000000000000000000000000000000000"
test("verifier_list_is_the_pinned_canonical_bytes - the list file has the sha256 VERIFIERS_SHA256, is its own canonical writing with no final newline, and the pinned read is memoised and frozen", () => {
  const bytes = readFileSync(LIST), text = bytes.toString("utf8");
  assert.equal(sha256(bytes), VERIFIERS_SHA256, "the sha256 of apps/harness/data/verifiers.json is the pin");
  assert.equal(canonicalJson(JSON.parse(text)), text, "the canonical writing of the 1.1.0 draft, section 2");
  assert.ok(!text.endsWith("\n"), "no final newline");
  const first = pinnedVerifiers();
  assert.equal(pinnedVerifiers(), first, "memoised: the second call returns the same array");
  assert.deepEqual(first, readVerifiers(bytes), "the pinned read is the reader on the file's bytes");
  assert.ok(toolEntry(first) !== undefined, "the list holds a list entry of monark-kata-recalc that no revocation names");
  assert.ok(Object.isFrozen(first) && first.every((v) => Object.isFrozen(v)), "the array and each of its elements frozen: one list for the whole process");
  assert.throws(() => (first as Verifier[]).push({ ...first[0] } as Verifier), TypeError, "a push on the pinned list throws (strict mode)");
  assert.throws(() => { (first[0] as { identity: string }).identity = "x"; }, TypeError, "a write in an element throws (strict mode)");
  assert.deepEqual(pinnedVerifiers(), readVerifiers(bytes), "the pinned list is unchanged");
});

// reddened by: a departure of the two closed entry forms accepted (a key more or less, a mixed form, a revision or a capital in an
// identity, a malformed commit, tree_sha256 or date: upper case, not hex, short, or not a string; another tree or repository, a pair
// listed twice, a revocation before its entry or twice), a refusal unnamed, or a revocation retained as an attesting entry
// killer: apps/harness/src/policy-verifiers.ts:67 CONST "v.identity === identityOf(v.identity)" -> "true"
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
  refuses(listOf(entry({ identity: 1 })), /entry 0: identity is not an identity/, "an identity that is not a string");
  refuses(listOf(entry({ commit: C1.toUpperCase().replace(/1/g, "A") })), /entry 0: commit is not 40/, "an upper-case commit");
  refuses(listOf(entry({ commit: "g".repeat(40) })), /entry 0: commit is not 40/, "a commit that is not hex");
  refuses(listOf(entry({ commit: [C1] })), /entry 0: commit is not 40/, "a commit that is not a string");
  refuses(listOf(entry({ commit: "1".repeat(39) })), /entry 0: commit is not 40/, "a short commit");
  refuses(listOf(entry({ tree_sha256: "a".repeat(63) })), /entry 0: tree_sha256 is not 64/, "a short tree_sha256");
  refuses(listOf(entry({ tree_sha256: "A".repeat(64) })), /entry 0: tree_sha256 is not 64/, "an upper-case tree_sha256");
  refuses(listOf(entry({ tree_sha256: "g".repeat(64) })), /entry 0: tree_sha256 is not 64/, "a tree_sha256 that is not hex");
  refuses(listOf(entry({ tree_sha256: [T1] })), /entry 0: tree_sha256 is not 64/, "a tree_sha256 that is not a string");
  refuses(listOf(entry({ tree: "tools" })), /entry 0: tree is not tools\/kata-recalc/, "another tree");
  refuses(listOf(entry({ repository: "KraidleAI/other" })), /entry 0: repository is not/, "another repository");
  refuses(listOf(entry(), entry({ tree_sha256: "b".repeat(64) })), /entry 1: monark-kata-recalc@1{40} is listed twice/, "a pair listed twice");
  refuses(listOf(revoke(), entry()), /entry 0: a revocation of monark-kata-recalc@1{40}, which no list entry above it names/, "a revocation before its entry");
  refuses(listOf(entry(), revoke({ commit: C2 })), /entry 1: a revocation of monark-kata-recalc@2{40}, which no list entry/, "a revocation of no entry");
  refuses(listOf(entry(), revoke(), revoke({ revoked: "2026-10-08" })), /entry 2: a second revocation/, "two revocations of one entry");
  for (const d of ["2026-02-29", "2026-13-01", "2026-1-01", "20261001"]) refuses(listOf(entry(), revoke({ revoked: d })), /entry 1: revoked is not a real/, `date ${d}`);
  refuses(listOf(entry(), revoke({ revoked: 20261007 })), /entry 1: revoked is not a real/, "a date that is not a string");
});

// reddened by: a writing of a well-formed list other than its canonical writing accepted (pretty-printed, a final LF or a BOM, as bytes
// or as a string, a CRLF, an invalid UTF-8 byte, a key twice at the top level or in an entry, the keys of an entry, of the top level or
// of a revocation in another order, an escaped lone surrogate in any entry), a revocation rendered unfrozen, or such a refusal unnamed
// killer: apps/harness/src/policy-verifiers.ts:84 SDL "fail(\"not the canonical writing of the list\")" -> ""
test("verifier_list_reader_is_closed_on_the_bytes - the reader renders a text only if it is the canonical writing of what it renders; each other writing is refused, named", () => {
  const text = listOf(entry()), canonical = /^MONARK verifier list: not the canonical writing of the list\.$/;
  const refuses = (bytes: Uint8Array | string, why: RegExp, what: string): void => assert.throws(() => readVerifiers(bytes), (e: unknown) => e instanceof Error && why.test(e.message), what);
  assert.deepEqual(readVerifiers(Buffer.from(text)), readVerifiers(text), "the canonical writing is read, as bytes or as a string");
  refuses(JSON.stringify(JSON.parse(text), null, 2), canonical, "pretty-printed");
  refuses(Buffer.from(`${text}\n`), canonical, "a final LF");
  refuses(Buffer.from(text.replace(",", ",\r\n")), canonical, "a CRLF");
  refuses(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text)]), /^MONARK verifier list: not UTF-8 JSON\.$/, "a BOM in the bytes: the decoder keeps it, so JSON.parse refuses it");
  refuses(text.replace('"verifiers":', `"verifiers":[${JSON.stringify(entry({ commit: C2 }))}],"verifiers":`), canonical, "verifiers twice at the top level (the last wins in JSON.parse)");
  refuses(text.replace('"commit":', `"commit":"${C2}","commit":`), canonical, "commit twice in an entry (the last wins in JSON.parse)");
  refuses(text.replace(`"commit":"${C1}","identity":"monark-kata-recalc"`, `"identity":"monark-kata-recalc","commit":"${C1}"`), canonical, "the keys of an entry in another order");
  refuses(JSON.stringify({ verifiers: [entry()], format: "monark-verifiers-v1" }), canonical, "the top-level keys in another order");
  refuses(listOf(entry({ identity: "\ud800" })), canonical, "an escaped lone surrogate, an identity by the rule of identityOf");
  const [pre = "", post = ""] = text.split("monark-kata-recalc");
  refuses(Buffer.concat([Buffer.from(`${pre}monark-`), Buffer.from([0xff]), Buffer.from(post)]), /^MONARK verifier list: not UTF-8 JSON\.$/, "an invalid UTF-8 byte");
  refuses(`${text}\n`, canonical, "a final LF, as a string");
  refuses(`\uFEFF${text}`, /^MONARK verifier list: not UTF-8 JSON\.$/, "a BOM, as a string");
  refuses(listOf(entry(), entry({ commit: C2, identity: "\ud800" })), canonical, "an escaped lone surrogate in a second entry");
  refuses(`${text.slice(0, -2)},{"revoked":"2026-10-07","commit":"${C1}","identity":"monark-kata-recalc"}]}`, canonical, "the keys of a revocation in another order");
  assert.ok(readVerifiers(`${text.slice(0, -2)},{"commit":"${C1}","identity":"monark-kata-recalc","revoked":"2026-10-07"}]}`).every((v) => Object.isFrozen(v)), "a revocation is rendered frozen too");
});

// reddened by: the digest of the index under tools/kata-recalc/ other than the listed tree_sha256 (a byte of the tool changed or a file
// added, removed or renamed without a new list entry), a digest rule other than manifestText, or a link, gitlink, executable or path
// outside the tool accepted
// killer: apps/harness/src/policy-verifiers.ts:113 CONST "p.slice(TOOL_ROOT.length + 1)" -> "p"
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
// letter), an expected identity other than the sample's, a listed tool other than the identity report.py writes, or the listed identity
// equal to the identity of the generator that report.py names (its TEXTS block, read as test/kata-recalc.test.ts reads it)
// killer: apps/harness/src/policy-verifiers.ts:35 CONST "/[A-Z]/g" -> "/[A-Y]/g"
test("verifier_identity_rule_is_the_guard_rule_and_not_the_generator - identityOf is the rule of verifierIdentity on a sample, gives the expected identities, and the listed tool is the identity report.py writes, not the generator it names", () => {
  const expected: Record<string, string> = { "Monark-Kata-Recalc@1ea4f64": "monark-kata-recalc", "a@b@c": "a", "": "", "@x": "", "ZYX-Tool": "zyx-tool",
    "kata/bench/write-p2.ts@1ea4f64738625d918b9e177e1657207c330a5261": "kata/bench/write-p2.ts", "\u00c9tool-Z@1": "\u00c9tool-z", "\u00dftool": "\u00dftool", "\u01c5@Z": "\u01c5" };
  for (const [name, id] of Object.entries(expected)) {
    assert.equal(identityOf(name), id, `identityOf(${JSON.stringify(name)})`);
    assert.equal(verifierIdentity(name), identityOf(name), `the guard's rule on ${JSON.stringify(name)}`);
  }
  const block = /^TEXTS = (\{\n[\s\S]*?\n\})$/m.exec(readFileSync(join(REPO, TOOL_ROOT, "report.py"), "utf8"));
  const texts = JSON.parse(block?.[1] ?? "{}") as Record<string, unknown>, generator = texts.generator_identity;
  assert.ok(typeof generator === "string" && generator !== "", "report.py names the generator's identity in its TEXTS block");
  const tool = toolEntry(pinnedVerifiers());
  assert.equal(tool?.identity, texts.identity, "the listed tool is the identity that report.py writes in a report's verifier");
  assert.notEqual(tool?.identity, identityOf(generator), "a verifier is never the generator that report.py names (A-2)");
});

// reddened by: a byte of the list that the gate of the spec repository refuses at the path of a dated folder's copy (a name of this
// repository taken for a private one, a banned word, a CR), or a list that is no longer its canonical writing
// killer: scripts/spec-publish.mjs:96 CONST "/^monark-governance$/i.test(v.word)" -> "false"
test("verifier_list_copy_passes_the_spec_gate - the list's bytes pass contentProblems in kind json as the copy of a dated folder", () => {
  assert.deepEqual(contentProblems("contract-1.1.0-tables-2026-10-20/verifiers.json", "json", readFileSync(LIST), "contract-1.1.0-tables-2026-10-20"), []);
});

// reddened by: the list read when the module loads (the public export carries apps/harness/src, not apps/harness/data), an altered or
// missing list accepted, a refusal that a second call forgets (memoised as a success only), or a failure memoised (a third call, once
// the pinned bytes are written, still throws)
// killer: apps/harness/src/policy-verifiers.ts:90 CONST "sha256(bytes) !== pin" -> "false"
test("pinned_list_is_read_lazily_and_an_altered_list_stops_closed - loading the module reads nothing; a missing or altered list throws on every call, and a failure is not memoised; the pinned bytes pass", () => {
  const bytes = readFileSync(LIST), altered = Buffer.from(bytes.toString("utf8").replace("monark-kata-recalc", "monark-kata-recalx"));
  assert.throws(() => checkedVerifiers(altered), /the bytes have sha256 [0-9a-f]{64}, the pin is /, "an altered list, closed");
  assert.deepEqual(checkedVerifiers(bytes), readVerifiers(bytes));
  const dir = mkdtempSync(join(tmpdir(), "verifiers-1f-")), n = readVerifiers(bytes).length;
  try {
    mkdirSync(join(dir, "src")); mkdirSync(join(dir, "data"));
    copyFileSync(MODULE, join(dir, "src/policy-verifiers.ts"));
    // two calls, then the pinned bytes written in place and a third call, in the same process
    const run = (): string => {
      const r = spawnSync(process.execPath, ["--input-type=module", "-e", `import * as m from ${JSON.stringify(pathToFileURL(join(dir, "src/policy-verifiers.ts")).href)};
        import { copyFileSync } from "node:fs";
        const out = ["loaded"], call = () => { try { out.push(m.pinnedVerifiers().length); } catch (e) { out.push(e.code ?? String(e.message).slice(0, 40)); } };
        call(); call(); copyFileSync(${JSON.stringify(LIST)}, ${JSON.stringify(join(dir, "data/verifiers.json"))}); call();
        console.log(out.join("|"));`], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      return r.stdout.trim();
    };
    assert.equal(run(), `loaded|ENOENT|ENOENT|${n}`, "no list: the module loads, each call throws, and the third call reads the pinned bytes");
    writeFileSync(join(dir, "data/verifiers.json"), altered);
    assert.equal(run(), `loaded|MONARK verifier list: the bytes have sha|MONARK verifier list: the bytes have sha|${n}`, "an altered list: each call throws, then the pinned bytes are read");
    writeFileSync(join(dir, "data/verifiers.json"), bytes);
    assert.equal(run(), `loaded|${n}|${n}|${n}`, "the pinned bytes");
  } finally { rmSync(dir, { recursive: true, force: true }); }
  assert.ok(isPrefix([], pinnedVerifiers()) && isPrefix(pinnedVerifiers(), pinnedVerifiers()), "a carried copy: a prefix of the list");
  const two = readVerifiers(listOf(entry(), entry({ commit: C2 })));
  assert.ok(isPrefix(two.slice(0, 1), two) && !isPrefix(two.slice(1), two) && !isPrefix(readVerifiers(listOf(entry({ tree_sha256: "b".repeat(64) }))), two), "prefix judged entry by entry, in order");
});

// reddened by: the date rule of the list parting from validDate of scripts/spec-publish.mjs on a string or a value, over every day of
// four years (a leap year among them) and their impossible neighbours; or a specifier other than node:crypto, node:fs and node:url, as
// importSpecifiers (ts.preProcessFile) lists them, scripts/ or the guard above all; or what forbiddenLoads reads on the AST: an import() of a
// non-literal, or require, getBuiltinModule, createRequire, eval, Function, constructor, dlopen or binding, named or as a constant string
// killer: apps/harness/src/policy-verifiers.ts:39 CONST "/^\\d{4}-\\d{2}-\\d{2}$/" -> "/^\\d{4}-\\d{1,2}-\\d{2}$/"
test("verifier_list_date_rule_is_the_spec_publish_rule - validDate of policy-verifiers.ts agrees with validDate of scripts/spec-publish.mjs, without importing scripts/", () => {
  const samples: unknown[] = ["2026-10-07", "2024-02-29", "2026-02-29", "1900-02-29", "2000-02-29", "2026-00-10", "2026-13-01", "2026-04-31", "2026-1-01", "26-10-07", " 2026-10-07",
    "2026-10-07\n", "\uff12026-10-07", "", null, undefined, 20261007, ["2026-10-07"]];
  for (let y = 2023; y <= 2026; y++) for (let m = 1; m <= 12; m++) for (let d = 0; d <= 32; d++) samples.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  assert.deepEqual(samples.filter((s) => listDate(s) !== validDate(s)), [], "the two rules agree");
  assert.equal(samples.filter((s) => listDate(s)).length, 4 * 365 + 1 + 3, "every real day of 2023 to 2026, plus 2026-10-07, 2024-02-29 and 2000-02-29");
  const text = readFileSync(MODULE, "utf8"), specifiers = importSpecifiers(text);
  assert.deepEqual(specifiers.filter((s) => /(^|\/)scripts\/|policy-guard/.test(s)), [], "the module imports nothing from scripts/ nor the guard");
  assert.ok(!/policy-guard/.test(text.replace(/^ \*.*$/gm, "")), "nor names the guard outside its doc comments");
  assert.deepEqual(specifiers, ["node:crypto", "node:fs", "node:url"], "the module's specifiers, as ts.preProcessFile lists them (importSpecifiers)");
  assert.deepEqual(forbiddenLoads(text), [], "nor a load that no specifier shows, as forbiddenLoads reads it");
});

// reddened by: run-log.json no longer ignored by git (anywhere in the tree, any folder), a tracked file of that name, or a release entry of
// scripts/spec-publish-inputs.json that reads or writes one. It proves no more: refusing a run log in a release is the gate's (part 3, 3a)
// killer: .gitignore:36 SDL "run-log.json" -> ""
test("run_log_is_ignored_untracked_and_named_by_no_spec_input - git ignores run-log.json at every depth, none is tracked, and no release of the spec inputs reads or writes one", () => {
  const where = ["run-log.json", "apps/harness/data/kata/recompute/run-log.json", "tools/kata-recalc/out/run-log.json", "spec/contract-1.1.0-tables-2026-10-20/recompute/run-log.json"];
  assert.deepEqual(where.filter((p) => gitStatus(["check-ignore", "-q", "--no-index", p]) !== 0), [], "each path ignored by git");
  assert.deepEqual(gitOut(REPO, ["ls-files", "-z"]).split("\0").filter((p) => /(^|\/)run-log\.json$/i.test(p)), [], "no tracked run-log.json");
  const inputs = JSON.parse(readFileSync(join(REPO, "scripts/spec-publish-inputs.json"), "utf8")) as { releases: Record<string, { entries: { out: string; path: string }[] }> };
  const named = Object.entries(inputs.releases).flatMap(([id, r]) => r.entries.filter((e) => /(^|\/)run-log\.json$/i.test(e.out) || /(^|\/)run-log\.json$/i.test(e.path)).map((e) => `${id}: ${e.out}`));
  assert.ok(Object.keys(inputs.releases).length > 0, "the spec inputs list releases");
  assert.deepEqual(named, [], "no release entry reads or writes a run-log.json");
  assert.match(readFileSync(join(REPO, TOOL_ROOT, "report.py"), "utf8"), /os\.path\.join\(a\["out"\], "run-log\.json"\)/, "report.py writes its run log by that name, beside the report");
});

// reddened by: a list entry whose commit is not in the history of HEAD (git merge-base --is-ancestor: an object of the repository outside
// it, such as the head of an unmerged branch or a head from before a rebase, is refused; so is the placeholder of 40 zeros: lot 1f is built
// on the trunk before the frozen tool merges), or whose commit does not carry the listed tree under tools/kata-recalc/ (section 3.2 recipe).
// Each git read of a listed commit runs with --no-replace-objects, as the blob reads do: no refs/replace can graft it or swap its tree
// killer: apps/harness/src/policy-verifiers.ts:115 CONST "(a.path < b.path ? -1 : 1)" -> "(a.path < b.path ? 1 : -1)"
test("verifier_list_commit_carries_the_listed_tree - each list entry names a commit in the history of HEAD whose tree under tools/kata-recalc/ has the listed digest", () => {
  for (const e of listEntries(pinnedVerifiers())) {
    assert.notEqual(e.commit, "0".repeat(40), "a placeholder: the entry must name the merge commit of the frozen tool on the trunk, and its tree, before this merges");
    assert.equal(gitStatus(["--no-replace-objects", "merge-base", "--is-ancestor", e.commit, "HEAD"]), 0, `${e.commit} is in the history of HEAD`);
    const blobs = gitOut(REPO, ["--no-replace-objects", "ls-tree", "-r", "-z", "--full-tree", e.commit, "--", TOOL_ROOT]).split("\0").filter((l) => l !== "").map((l) => {
      const [, mode = "", object = "", path = ""] = /^(\d{6}) \w+ ([0-9a-f]+)\t(.+)$/s.exec(l) ?? [];
      return { mode, path, bytes: execFileSync("git", ["--no-replace-objects", "-C", REPO, "cat-file", "blob", object], { env: BARE, maxBuffer: 1 << 26 }) };
    });
    assert.equal(toolTreeSha256(blobs), e.tree_sha256, `the tree of ${TOOL_ROOT} at ${e.commit}`);
  }
});

// reddened by: a literal specifier left out of importSpecifiers (an import, a side-effect import, an import over several lines, a re-export,
// export * from, import() or require(), in single quotes, as a template without substitution, or after a comment that follows the keyword)
// or prose read as one; or a load left out of forbiddenLoads: an import() of a computed specifier (a name, a template with a substitution, E1
// to E5 of the review), require, getBuiltinModule (E3: by a computed key), createRequire, eval, Function, constructor (R1), dlopen or
// binding (process.binding, an internal module of Node); or a comment, a string or a literal import() read as a forbidden load
// killer: apps/harness/test/helpers/import-specifiers.ts:51 CONST "ts.isStringLiteralLike(n.arguments[0])" -> "true"
test("import_helper_reads_literal_specifiers_and_refuses_computed_loads - importSpecifiers lists each literal form and no prose; forbiddenLoads names each load that no specifier shows, and no comment, string or literal import()", () => {
  const NOT_LITERAL = "import() of a specifier that is not a literal";
  const forms = ['import { a } from "./a.ts";', "import './b.ts';", 'import {\n  c,\n} from "./c.ts";', 'export { d } from /* reviewed */ "./d.ts";', 'import /* reviewed */ "./e.ts";',
    'export * from "./f.ts";', "void import(`./g.ts`);", 'void import /* lazy */ ("./h.ts");', 'require("./i.ts");', '/** read from "./j.ts" */ // import "./k.ts"', 'const s = "import(\'./l.ts\')";'];
  assert.deepEqual(importSpecifiers(forms.join("\n")), ["./a.ts", "./b.ts", "./c.ts", "./d.ts", "./e.ts", "./f.ts", "./g.ts", "./h.ts", "./i.ts"], "the literal specifiers in source order, and no prose");
  const refused: [string, string, string[]][] = [
    ["a computed specifier (G7)", "export const g7 = (n: string) => import(n);", [`l.1: ${NOT_LITERAL}`]],
    ["a template with a substitution (G11)", 'export const g11 = () => import(`../../../scripts/${"spec-publish"}.mjs`);', [`l.1: ${NOT_LITERAL}`]],
    ["E1: a doc comment before it on its line", "/** @internal */ export const e1 = (n: string) => import(n);", [`l.1: ${NOT_LITERAL}`]],
    ["E2: a comment between import and (", "export const e2 = (n: string) => import /* lazy */ (n);", [`l.1: ${NOT_LITERAL}`]],
    ["E3: getBuiltinModule by a computed key", 'export const e3 = () => process["getBuiltin" + "Module"]("node:path");', ['l.1: "getBuiltinModule", a constant string']],
    ["E3 by a template and parentheses", 'process[`${("getBuiltin")}Module`]("node:path");\nglobalThis[("eval")]("1");', ['l.1: "getBuiltinModule", a constant string', 'l.2: "eval", a constant string']],
    ["E4: on a line that begins with *", "export const e4 = async (n: string) => 2\n * (await import(n)).x;", [`l.2: ${NOT_LITERAL}`]],
    ["E5: G11 behind a doc comment", '/** lazy */ export const e5 = () => import(`../../../scripts/${"spec-publish"}.mjs`);', [`l.1: ${NOT_LITERAL}`]],
    ["getBuiltinModule (G9)", 'export const g9 = () => process.getBuiltinModule("node:path");', ["l.1: getBuiltinModule"]],
    ["createRequire", 'import { createRequire } from "node:module";\nexport const c = createRequire(import.meta.url)("./x.ts");', ["l.1: createRequire", "l.2: createRequire"]],
    ["require", 'export const q = require("./x.ts");', ["l.1: require"]],
    ["eval and Function", 'eval("1");\nnew Function("return 1")();', ["l.1: eval", "l.2: Function"]],
    ["R1: the constructor of a function", 'export const r1 = () => Reflect.get(Object.getPrototypeOf(async () => {}), "constr" + "uctor")("return imp" + "ort(\'node:path\')")();', ['l.1: "constructor", a constant string']],
    ["dlopen", 'process.dlopen({ exports: {} }, "./x.node");', ["l.1: dlopen"]],
    ["binding: an internal module of Node with no import, as getBuiltinModule", "process.binding('fs');", ["l.1: binding"]],
  ];
  for (const [what, text, want] of refused) assert.deepEqual(forbiddenLoads(text), want, what);
  const prose = ["// import(n) require( getBuiltinModule", "  /** import(n), require(x), createRequire, eval(), Function() */", "/* getBuiltinModule(x) */", 'const s = "import(n) require( eval(";',
    'void import("./x.ts");', "void import(`./y.ts`);"];
  assert.deepEqual(forbiddenLoads(prose.join("\n")), [], "a comment, a string and a literal import() name no forbidden load");
});
