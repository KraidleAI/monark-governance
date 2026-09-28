/**
 * Root test `byte_guard` (ADR-METHODE-2 D9, lot M-1; audit A, class OUTILLAGE: transport corruptions). Every text file TRACKED
 * by git (`git ls-files -z`, never a disk walk: untracked copies, junctions and stray worktrees are not the tree) is free of:
 *   TAB outside the closed types where it is licit (Makefile, go.mod, *.tsv) and the closed per-path ranges of EXEMPT;
 *   CTRL, a C0 control byte 0x01-0x08, 0x0B, 0x0C, 0x0E-0x1F (a shell, PowerShell or JSON layer read an escape);
 *   NUL (0x00); CONFLICT, a git conflict marker at line start (7 "<" + space, exactly 7 "=", 7 ">" + space);
 *   F_SPACES, "F:" followed by two or more spaces (measured: the TAB of a "F:\tmp" path rewritten as spaces);
 *   F_CTRL, "F:" followed by a control byte.
 * Red output: one "path:line:CLASS" per hit and the count per class; `node --test test/byte-guard.test.ts` exits non-zero on
 * a single hit (standalone use: pre-commit, G1). Binary types are not read (extension outside the scanned list). Fixtures are
 * throwaway git repositories under os.tmpdir() (index only: no commit, no identity; every GIT_* variable removed, no system or
 * global config); this file builds every forbidden shape at run time, so it needs no exemption of its own. Each test names the
 * production mutation that reddens it.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../", import.meta.url));

type Cls = "NUL" | "CTRL" | "TAB" | "CONFLICT" | "F_SPACES" | "F_CTRL";
const CLASSES: ReadonlyArray<readonly [Cls, RegExp]> = [
  ["NUL", /\x00/],
  ["CTRL", /[\x01-\x08\x0b\x0c\x0e-\x1f]/],
  ["TAB", /\t/],
  ["CONFLICT", /^(?:<{7} |={7}\r?$|>{7} )/],
  ["F_SPACES", /F: {2}/],
  ["F_CTRL", /F:[\x00-\x09\x0b\x0c\x0e-\x1f]/],
];

/** Read types (closed): lang-gate's TEXT_EXTS plus the other text types of the tree (.mts type surfaces, .jsonl/.csv/.tsv
 *  series, .svg) and the TAB-licit names. Any other extension is not read (Review Focus of the G1 journal). */
const TEXT_EXT = new Set([".ts", ".tsx", ".mts", ".mjs", ".cjs", ".js", ".jsx", ".md", ".mdx", ".yml", ".yaml", ".json", ".jsonl",
  ".html", ".css", ".svg", ".sh", ".txt", ".csv", ".tsv"]);
const TAB_NAMES = new Set(["Makefile", "go.mod"]);
const isRead = (rel: string): boolean => TEXT_EXT.has(extname(rel).toLowerCase()) || TAB_NAMES.has(basename(rel));
/** TAB is licit only in these types (closed): Makefile recipes and go.mod are TAB-indented, a TSV separates its fields with it. */
const tabLicit = (rel: string): boolean => TAB_NAMES.has(basename(rel)) || extname(rel).toLowerCase() === ".tsv";

/** Per-path exemptions (closed): [class, first line, last line, motive] of pasted tool output that carries the class verbatim.
 *  Only that class, only in that range; an entry whose range no longer carries its class reddens the tree test (stale). */
const NUMSTAT = "verbatim `git diff --numstat` output (TAB-separated)";
const EXEMPT: Readonly<Record<string, readonly [Cls, number, number, string]>> = {
  "docs/G1-lot-dojo-pr1a.md": ["TAB", 165, 171, NUMSTAT],
  "docs/G1-lot-dojo-pr1b1.md": ["TAB", 197, 200, NUMSTAT],
  "docs/G1-lot-lang-gate-claude-1.md": ["TAB", 53, 56, NUMSTAT],
  "docs/G1-lot-narabi-txt-1.md": ["TAB", 23, 24, NUMSTAT],
  "docs/G1-lot-public-cadence-1-A1.md": ["TAB", 63, 71, NUMSTAT],
  "docs/G2-lot-ukemi-retry-2.md": ["TAB", 19, 22, NUMSTAT],
  "docs/PLI-lot-t1a-ii-b1.md": ["TAB", 221, 228, NUMSTAT],
  "docs/G2-delta-lot-e-honnetete-2.md": ["TAB", 15, 19, "verbatim `git diff --name-status` output (TAB-separated)"],
  "docs/sec-4927/work-2026-09-24/DIFF-v3-v4.md": ["TAB", 10, 11, "verbatim unified-diff header (file name, TAB, timestamp)"],
  "docs/G2-delta-lot-t1a-ii-a.md": ["CONFLICT", 109, 115, "quoted `git merge-tree` conflict in a fenced block (G2 evidence)"],
};

interface Hit { file: string; line: number; cls: Cls }
interface Verdict { hits: Hit[]; exempted: Map<string, number>; read: number }

/** The verdict over the tracked text files of `root`: the ONE function the fixture tests and the tree test share. */
function scan(root: string, env: NodeJS.ProcessEnv = process.env): Verdict {
  const listed = execFileSync("git", ["ls-files", "-z"], { cwd: root, env, maxBuffer: 1 << 26 }).toString("utf8").split("\0");
  const v: Verdict = { hits: [], exempted: new Map(), read: 0 };
  for (const rel of listed.filter((f) => f !== "" && isRead(f))) {
    let text: string;
    try { text = readFileSync(join(root, rel), "latin1"); } catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") continue; throw e; }
    v.read++;
    const ex = EXEMPT[rel];
    text.split("\n").forEach((line, i) => {
      for (const [cls, re] of CLASSES) {
        if (!re.test(line) || (cls === "TAB" && tabLicit(rel))) continue;
        if (ex !== undefined && ex[0] === cls && i + 1 >= ex[1] && i + 1 <= ex[2]) v.exempted.set(rel, (v.exempted.get(rel) ?? 0) + 1);
        else v.hits.push({ file: rel, line: i + 1, cls });
      }
    });
  }
  return v;
}

function report(v: Verdict): string {
  const n = new Map<Cls, number>();
  for (const h of v.hits) n.set(h.cls, (n.get(h.cls) ?? 0) + 1);
  const counts = [...n].map(([c, k]) => `${c} ${String(k)}`).join(", ");
  return [`byte guard: ${String(v.hits.length)} hit(s) (${counts})`, ...v.hits.map((h) => `${h.file}:${String(h.line)}:${h.cls}`)].join("\n");
}

/** Red on ONE hit (the tree's verdict, also driven on fixtures below). */
function assertClean(v: Verdict): void {
  assert.equal(v.hits.length, 0, report(v));
}

const TMP: string[] = [];
after(() => { for (const d of TMP) rmSync(d, { recursive: true, force: true, maxRetries: 3 }); });

/** A throwaway repository outside the tree: `tracked` files are written then `git add`-ed (the index is what ls-files reads),
 *  `loose` files are written only. No GIT_* variable and no system/global config reach git, so a hook context can never point it
 *  at the real repository. */
function fixture(tracked: Record<string, string>, loose: Record<string, string> = {}, afterAdd: (root: string) => void = () => undefined): Verdict {
  const base = mkdtempSync(join(tmpdir(), "byte-guard-"));
  TMP.push(base);
  const root = join(base, "repo");
  writeFileSync(join(base, "gitconfig"), "");
  const env: NodeJS.ProcessEnv = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_"))),
    GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(base, "gitconfig") };
  try {
    mkdirSync(root);
    execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root, env });
    for (const [rel, body] of Object.entries({ ...tracked, ...loose })) {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), body, "latin1");
    }
    execFileSync("git", ["add", "--", ...Object.keys(tracked)], { cwd: root, env });
    afterAdd(root);
    return scan(root, env);
  } catch (e) { rmSync(base, { recursive: true, force: true, maxRetries: 3 }); throw e; } // a load-time failure never reaches after()
}

const LT = "<".repeat(7), EQ = "=".repeat(7), GT = ">".repeat(7);
/** Every read extension, pinned here: a TAB in t/x<ext> reddens for all of them but .tsv. */
const PIN_EXT = [".ts", ".tsx", ".mts", ".mjs", ".cjs", ".js", ".jsx", ".md", ".mdx", ".yml", ".yaml", ".json", ".jsonl", ".html",
  ".css", ".svg", ".sh", ".txt", ".csv", ".tsv"];
const EX_PATH = "docs/G2-delta-lot-t1a-ii-a.md"; // its CONFLICT range 109-115, replayed below with a TAB inside and a marker after
const V = fixture({
  "tab.md": "a\tb\n",
  "ctrl.md": "one\ntwo \x08ell\n",
  "zero.md": "x\x00y\n", // never "nul.*": a reserved device name on Windows
  "conflict.md": `${LT} HEAD\nours\n${EQ}\ntheirs\n${GT} branch\n`,
  "fspaces.md": `see F:${" ".repeat(4)}mp\n`,
  "fctrl.md": "see F:\x0bocab\n",
  "clean.md": `F: drive, LF: end\r\n${"<".repeat(6)} six\r\n${"=".repeat(8)}\r\n${">".repeat(8)} eight\r\n`,
  "bin.png": `\x00\t\x08F:${" ".repeat(4)}\n${EQ}\n`,
  [EX_PATH]: `${"\n".repeat(108)}${LT} .our\n\tx\nx\n${EQ}\nx\nx\n${GT} .their\n${LT} after the range\n`,
  ...Object.fromEntries(PIN_EXT.map((e) => [`t/x${e}`, "a\tb\n"])),
  "t/Makefile": "all:\n\techo \x07\n",
  "t/go.mod": "require (\n\tx v1 \x07\n)\n",
}, { "loose.md": "a\tb\n" });
const at = (file: string): string[] => V.hits.filter((h) => h.file === file).map((h) => `${String(h.line)}:${h.cls}`);

// Mutant: the TAB class removed from CLASSES => red.
test("byte_guard_flags_tab", () => { assert.deepEqual(at("tab.md"), ["1:TAB"]); });
// Mutant: the CTRL class removed, or its range without 0x08 (e.g. [\x01-\x07]), or a line number off by one => red.
test("byte_guard_flags_control_byte_0x08", () => { assert.deepEqual(at("ctrl.md"), ["2:CTRL"]); });
// Mutant: the NUL class removed => red.
test("byte_guard_flags_nul", () => { assert.deepEqual(at("zero.md"), ["1:NUL"]); });
// Mutant: the CONFLICT class removed, or any of its three markers dropped => red.
test("byte_guard_flags_conflict_markers", () => { assert.deepEqual(at("conflict.md"), ["1:CONFLICT", "3:CONFLICT", "5:CONFLICT"]); });
// Mutant: the F_SPACES class removed => red.
test("byte_guard_flags_f_followed_by_spaces", () => { assert.deepEqual(at("fspaces.md"), ["1:F_SPACES"]); });
// Mutant: the F_CTRL class removed => red (the same line also carries its CTRL hit).
test("byte_guard_flags_f_followed_by_a_control_byte", () => { assert.deepEqual(at("fctrl.md"), ["1:CTRL", "1:F_CTRL"]); });
// Mutant: a false positive (the CR of CRLF read as CTRL, "F:" + ONE space, a 6- or 8-character run read as a marker) => red.
test("byte_guard_clean_file_is_green", () => { assert.deepEqual(at("clean.md"), []); });
// Mutant: binary extensions read (the type filter bypassed) => red.
test("byte_guard_ignores_binary_extensions", () => { assert.deepEqual(at("bin.png"), []); });
// Mutant: a disk walk instead of `git ls-files` => the planted untracked loose.md reddens.
test("byte_guard_reads_git_ls_files_not_the_disk", () => { assert.deepEqual(at("loose.md"), []); });
// Mutant: the TAB-licit types widened (any read type added, or the rule inverted), or a read type dropped => red; Makefile and
// go.mod stay READ (a control byte in each reddens) while their TABs are licit.
test("byte_guard_tab_licit_types_are_closed", () => {
  const tab = V.hits.filter((h) => h.cls === "TAB" && h.file.startsWith("t/")).map((h) => h.file).sort();
  assert.deepEqual(tab, PIN_EXT.filter((e) => e !== ".tsv").map((e) => `t/x${e}`).sort());
  assert.deepEqual([...at("t/Makefile"), ...at("t/go.mod"), ...at("t/x.tsv")], ["2:CTRL", "2:CTRL"]);
});
// Mutant: an exemption applied to every class of its file, or beyond its line range => red.
test("byte_guard_exemptions_are_per_path_class_and_range", () => {
  assert.deepEqual(at(EX_PATH), ["110:TAB", "116:CONFLICT"]);
  assert.equal(V.exempted.get(EX_PATH), 3);
});
// Mutant: every read error swallowed (an unreadable or locked tracked path skipped in silence), or a deleted tracked file made
// fatal => red. A tracked file deleted in the working tree carries no byte; any other read error stays fatal (fail-closed).
test("byte_guard_skips_a_deleted_file_and_fails_on_an_unreadable_one", () => {
  assert.deepEqual(fixture({ "gone.md": "a\tb\n" }, {}, (r) => { rmSync(join(r, "gone.md")); }).hits, []);
  assert.throws(() => fixture({ "dir.md": "x\n" }, {}, (r) => { rmSync(join(r, "dir.md")); mkdirSync(join(r, "dir.md")); }), /EISDIR/);
});
// Mutant: the GIT_* variables kept => in a hook context (GIT_DIR, GIT_INDEX_FILE set) the fixture's git init/add would write into
// the repository they point at => red (a decoy GIT_DIR must stay absent).
test("byte_guard_fixture_git_ignores_the_callers_git_env", () => {
  const decoy = join(tmpdir(), `byte-guard-decoy-${String(process.pid)}`), prev = process.env.GIT_DIR;
  let leaked = true;
  process.env.GIT_DIR = decoy;
  try { fixture({ "a.md": "x\n" }); leaked = existsSync(decoy); } finally {
    if (prev === undefined) delete process.env.GIT_DIR; else process.env.GIT_DIR = prev;
    rmSync(decoy, { recursive: true, force: true, maxRetries: 3 });
  }
  assert.equal(leaked, false, "the fixture wrote into the caller's GIT_DIR");
});
// Mutant: the host's system/global git config reaching the fixture's git => a hostile global config injected through HOME
// (core.autocrlf + core.safecrlf: `git add` of an LF file is fatal, measured 2026-09-28) reddens.
test("byte_guard_fixture_git_ignores_the_host_git_config", () => {
  const home = mkdtempSync(join(tmpdir(), "byte-guard-home-")), prev = process.env.HOME;
  writeFileSync(join(home, ".gitconfig"), "[core]\n  autocrlf = true\n  safecrlf = true\n");
  process.env.HOME = home;
  try { assert.deepEqual(fixture({ "a.md": "x\n" }).hits, []); } finally {
    if (prev === undefined) delete process.env.HOME; else process.env.HOME = prev;
    rmSync(home, { recursive: true, force: true, maxRetries: 3 });
  }
});
// Mutant: exit 0 despite a hit (assertClean without its assertion, or a threshold above one hit), or a report without its per-class
// counts or its "path:line:CLASS" lines => red.
test("byte_guard_fails_on_a_single_hit", () => {
  assert.throws(() => { assertClean(fixture({ "one.md": "a\x08b\n" })); },
    (e: unknown) => e instanceof assert.AssertionError && e.message.includes("1 hit(s) (CTRL 1)") && e.message.includes("one.md:1:CTRL"));
  assert.doesNotThrow(() => { assertClean(fixture({ "ok.md": "fine\n" })); });
});

// The tracked tree. F2P: red on the base 6f769b7 (the live corruptions of audit A), green once they are restored.
// Mutant: a stale exemption added (its range carries no longer its class), or the read counter dropped (a vacuous scan) => red.
test("byte_guard_tracked_tree_is_clean", () => {
  const v = scan(REPO);
  assert.ok(v.read > 1000, `implausibly few tracked text files read (${String(v.read)})`);
  assert.deepEqual(Object.keys(EXEMPT).filter((p) => (v.exempted.get(p) ?? 0) === 0), [], "stale exemption: its range lost its class");
  assertClean(v);
});
