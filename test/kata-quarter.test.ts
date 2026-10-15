// test/kata-quarter.test.ts -- CM-5, the quarter counts tool tools/kata-quarter/ (docs/G0-lot-cm5-c1a.md), the loader: the second tree of
// io_guard's closed list. Its entry runs io_guard.py of the frozen tool by its path first, under FORM; its folder holds the list file
// FILES and modules quarter_*.py with no stem of the frozen tool. The loader reads one symbol twice through recalc_p2.load_series (sealed
// and LIVE, each under its pin) and merges them under control. Every launch runs from the temporary git repository of
// test/helpers/kata-quarter-repo.ts, one per test file, on the synthetic fixture of fixtures/kata-quarter/ (no real series). Reads only.
// Excluded by name from test:main: g3-verifier-tool runs it through scripts/verifier-tool-ci.mjs, which gives the helper the pinned
// CPython (KATA_QUARTER_PYTHON); by hand, `node --test test/kata-quarter.test.ts` takes the python of PATH.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gitOut } from "./helpers/git-tracked.ts";
import { ENTRY, TREES, toolRepo, type ToolRepo } from "./helpers/kata-quarter-repo.ts";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const [FROZEN, QUARTER] = TREES;
const FIXTURE = join(REPO, "fixtures", "kata-quarter");
const SYM = "syn", SERIES = `${SYM}-15m.csv`, MISSING = "missing.json";
const sha256 = (p: string): string => createHash("sha256").update(readFileSync(p)).digest("hex");
const read = (f: string): string => readFileSync(join(REPO, QUARTER, f), "utf8");
let shared: ToolRepo | null = null;
/** The one repository of this file, made at the first launch (after the assertions on the files' existence). */
const tool = (): ToolRepo => (shared ??= toolRepo(REPO));
/** The arguments of `check` on a sealed and a live series folder of the fixture's shape, each pinned by its bytes. */
const checkArgs = (sealed: string, live: string): string[] =>
  ["check", sealed, live, SYM, "1", sha256(join(sealed, SYM, SERIES)), sha256(join(live, SYM, SERIES)), "404"];
const names = (): string[] => readFileSync(join(REPO, QUARTER, "FILES"), "ascii").split("\n").slice(0, -1);
type Missing = { count: unknown; missing: { open_time_ms: unknown; open_time_utc: unknown }[] };
/** A copy of a series folder of the fixture under a work folder, its CSV text and its missing.json replaced. */
const variant = (work: string, name: string, text: string, decl: Missing): string => {
  mkdirSync(join(work, name, SYM), { recursive: true });
  writeFileSync(join(work, name, SYM, SERIES), text);
  writeFileSync(join(work, name, SYM, MISSING), `${JSON.stringify(decl)}\n`);
  return join(work, name);
};
const fixtureOf = (which: string): { csv: string; missing: Missing } =>
  ({ csv: readFileSync(join(FIXTURE, which, SYM, SERIES), "utf8"), missing: JSON.parse(readFileSync(join(FIXTURE, which, SYM, MISSING), "utf8")) as Missing });
const S1 = Date.UTC(2026, 9, 1), CANDLE_S1 = `2026-10-01T00:00:00Z,${S1},100.00,100.10,99.90,100.05,1.000,${S1 + 899_999},100.02,1,0.500,50.01`;

// reddened by: a .py of tools/kata-quarter/ other than quarter_counts.py with a block __main__, an entry whose code (after its comments)
// does not open with the prologue of the frozen tool in its two-tree form (io_guard.py run by its path, the frozen tool's folder last in
// sys.path, then import io_guard before any other module), or a launch of the entry answering otherwise than written: no subcommand or
// an unknown one, the usage and exit 2; count and month, "not in this lot" and exit 2
// killer: tools/kata-quarter/quarter_counts.py:14 CONST "import io_guard" -> "import kata_lib"
test("kata_quarter_entry_script_imports_the_input_guard_first - the one entry script of the tool runs io_guard.py of the frozen tool by its path and imports io_guard before any other module; count and month answer not in this lot", () => {
  assert.ok(existsSync(join(REPO, QUARTER, ENTRY)), `${QUARTER}/${ENTRY} absent`);
  const entries = readdirSync(join(REPO, QUARTER)).filter((f) => f.endsWith(".py") && /^if __name__ == "__main__":$/m.test(read(f))).sort();
  assert.deepEqual(entries, [ENTRY], "the entry script of the tool, and no other .py file with a block __main__");
  const prologue = [ // the prologue of the frozen tool's entry scripts, the frozen tool's folder appended from this folder's parent
    "import os, sys  # sys built in, os frozen: no file is looked up by name before io_guard has checked both folders (IO-GUARD-POSED-FILES-1)",
    "if \"io_guard\" not in sys.modules:  # io_guard.py of the frozen tool, run by its path, never found by name: nothing posed or installed stands in for it",
    "    sys.path.append(_d := os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), \"kata-recalc\"))  # the frozen tool's folder, last in sys.path: -P is in FORM",
    "    _g = sys.modules[\"io_guard\"] = type(sys)(\"io_guard\"); _g.__file__ = os.path.join(_d, \"io_guard.py\")",
    "    exec(compile(open(_g.__file__, \"rb\").read(), _g.__file__, \"exec\"), vars(_g))",
    "import io_guard"].join("\n");
  const escaped = prologue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), code = read(ENTRY).replace(/^(?:#.*\n)*/, "");
  assert.ok(new RegExp(`^${escaped}\\b`).test(code), `after its comments, the entry opens with the prologue, then imports io_guard:\n${code.split("\n").slice(0, 7).join("\n")}`);
  const t = tool(), none = t.run([]);
  assert.equal(none.status, 2, `no subcommand: the usage, exit 2\n${none.stdout}${none.stderr}`);
  assert.match(none.stdout, /^usage: python -E -S -s -B -P quarter_counts\.py check /, "the usage names the form of the launch and the subcommand of this lot");
  for (const sub of ["count", "month"]) {
    const r = t.run([sub]);
    assert.equal(r.status, 2, `${sub}: exit 2\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, new RegExp(`^${sub}: not in this lot`), `${sub} answers that it is not in this lot`);
  }
  const [sealed, live] = [join(FIXTURE, "sealed"), join(FIXTURE, "live")], livePin = sha256(join(live, SYM, SERIES));
  // killer: tools/kata-quarter/quarter_counts.py:77 CONST "a.isascii() and " -> ""
  const sup = t.run(["check", sealed, live, SYM, "\u00b2", "pinned", livePin, "404"]);
  assert.equal(sup.status, 2, `a quarter written with a superscript digit: the usage, exit 2\n${sup.stdout}${sup.stderr}`);
  assert.match(sup.stdout, /^usage: python -E -S -s -B -P quarter_counts\.py check /, "a digit that is not ASCII is refused by the usage");
  assert.ok(!/Traceback/.test(`${sup.stdout}${sup.stderr}`), "no trace");
  // killer: tools/kata-quarter/quarter_counts.py:50 CONST "pin1 == \"pinned\" and k != 1" -> "False"
  const later = t.run(["check", sealed, live, SYM, "2", "pinned", livePin, "404"]);
  assert.equal(later.status, 2, `pinned for quarter 2: exit 2\n${later.stdout}${later.stderr}`);
  assert.match(later.stdout, /^REFUSED: 'pinned' names the sealed series of wave 1, read 1 of quarter 1 only: quarter 2 reads quarter 1 under the pin posted at its sealing$/m);
});

// reddened by: the merge admitting a grid slot that is neither in the series nor in the missing.json of the read that owns it (the candle
// at S_k absent from the LIVE series and from its declaration), a declared gap refused or not listed, a slot both declared missing and
// present admitted, an instant in both reads admitted (the sealed series read past S_k), a missing.json out of its form admitted (a count
// or an open_time_ms that is not a whole number, an open_time_utc that does not write it), or the merged range off the lookback and E_k
// killer: tools/kata-quarter/quarter_load.py:108 CONST "if undeclared:" -> "if False:"
test("two_reads_merged_under_check - check reads the sealed and the LIVE series of the fixture, each under its pin, and merges them: the seam at S_1, 10448 slots, the three declared gaps of the LIVE series listed; the same LIVE series with the gap at S_1 undeclared, a declared slot present, an instant in both reads, or a missing.json out of its form, is refused by name", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_load.py")), `${QUARTER}/quarter_load.py absent`);
  for (const f of ["sealed", "live"].flatMap((d) => [join(d, SYM, SERIES), join(d, SYM, MISSING)])) assert.ok(existsSync(join(FIXTURE, f)), `fixtures/kata-quarter/${f} absent`);
  const t = tool(), ok = t.run(checkArgs(join(FIXTURE, "sealed"), join(FIXTURE, "live")));
  assert.equal(ok.status, 0, `check on the fixture: exit 0\n${ok.stdout}${ok.stderr}`);
  const lines = ok.stdout.split("\n");
  assert.ok(lines.includes("quarter 1 2026-10-01T00:00:00Z 2027-01-01T00:00:00Z"), "Q_1 = [2026-10-01, 2027-01-01)");
  assert.ok(lines.includes(`read sealed ${SYM} 2024-10-01T00:00:00Z 2026-10-01T00:00:00Z sha256 ${sha256(join(FIXTURE, "sealed", SYM, SERIES))} rows 1616`), `read 1 under the recording range of the sealed series, its pin printed:\n${ok.stdout}`);
  assert.ok(lines.includes(`read live ${SYM} 2026-10-01T00:00:00Z 2027-01-01T00:00:00Z sha256 ${sha256(join(FIXTURE, "live", SYM, SERIES))} rows 8829`), `read 2 under [S_1, E_1), its pin printed:\n${ok.stdout}`);
  assert.ok(lines.includes("merged 2026-09-14T04:00:00Z 2027-01-01T00:00:00Z seam 2026-10-01T00:00:00Z slots 10448 present 10445 gaps 3"), `the merged range from S_1 minus 404 hours to E_1, 1616 + 8832 slots:\n${ok.stdout}`);
  assert.deepEqual(lines.filter((l) => l.startsWith("gap ")), ["gap live 2026-10-01T00:00:00Z", "gap live 2026-11-15T12:00:00Z", "gap live 2026-12-24T23:45:00Z"], "the declared gaps of the LIVE series, kept as gaps");
  assert.deepEqual(lines.filter((l) => l.startsWith("input ")).length, 4, "the four inputs noted by io_guard: two series, two missing.json");
  assert.equal(lines.at(-2), "VERDICT: GREEN");
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-live-")), { csv, missing } = fixtureOf("live"), rest = missing.missing.filter((m) => m.open_time_ms !== S1);
  const undeclared = t.run(checkArgs(join(FIXTURE, "sealed"), variant(work, "undeclared", csv, { count: rest.length, missing: rest })));
  assert.equal(undeclared.status, 2, `the gap at S_1 no longer declared: exit 2\n${undeclared.stdout}${undeclared.stderr}`);
  assert.match(undeclared.stdout, /^REFUSED: undeclared gap: 1 grid slots absent from the series and from the missing\.json of their read, first 2026-10-01T00:00:00Z$/m);
  const [header, ...rows] = csv.split("\n");
  const present = t.run(checkArgs(join(FIXTURE, "sealed"), variant(work, "present", [header, CANDLE_S1, ...rows].join("\n"), missing)));
  assert.equal(present.status, 2, `the candle at S_1 present and declared missing: exit 2\n${present.stdout}${present.stderr}`);
  assert.match(present.stdout, /^REFUSED: syn: 1 slots listed in missing\.json are present in the series, first 2026-10-01T00:00:00Z$/m);
  // an instant in both reads: the candle at S_1 added to the sealed series, which load_series reads under [REC_START, S_1) and refuses
  // killer: tools/kata-quarter/quarter_load.py:67 CONST "= start, end" -> "= start, end + K.STEP_MS"
  const sealed = fixtureOf("sealed"), both = t.run(checkArgs(variant(work, "both", `${sealed.csv}${CANDLE_S1}\n`, sealed.missing), join(FIXTURE, "live")));
  assert.equal(both.status, 2, `the candle at S_1 in the sealed read too: exit 2\n${both.stdout}${both.stderr}`);
  assert.match(both.stdout, /^REFUSED: syn: line 1618: off grid, out of range or not ascending$/m, "refused by name, by the range of read 1");
  const form = /^REFUSED: syn: missing\.json out of its form: a count or an open_time_ms that is not a whole number, or an open_time_utc that does not write its open_time_ms /m;
  const at = (v: unknown, utc: unknown = "2026-10-01T00:00:00Z"): Missing => ({ count: 3, missing: [{ open_time_ms: v, open_time_utc: utc }, ...rest] });
  // killer: tools/kata-quarter/quarter_load.py:75 CONST "not whole(x[\"open_time_ms\"]) or " -> ""
  // killer: tools/kata-quarter/quarter_load.py:78 CONST "bad or not whole(count)" -> "bad"
  // killer: tools/kata-quarter/quarter_load.py:75 CONST " or x[\"open_time_utc\"] != iso(x[\"open_time_ms\"])" -> ""
  for (const [name, decl] of [["float", at(S1 + 0.5)], ["string", at(String(S1))], ["bool count", { ...missing, count: true }], ["utc", at(S1, "2026-10-01T00:15:00Z")]] as const) {
    const r = t.run(checkArgs(join(FIXTURE, "sealed"), variant(work, name.replace(" ", "-"), csv, decl)));
    assert.equal(r.status, 2, `a missing.json with a ${name} out of its form: exit 2\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, form, `a missing.json with a ${name} out of its form, refused by name`);
  }
});

// reddened by: a read whose bytes are not its pin parsed anyway, the sealed read or the LIVE read (D-3 of the frozen tool: the sha256 of
// the bytes, before parsing), or a refusal that does not name the read and the two digests
// killer: tools/kata-recalc/recalc_p2.py:89 CONST "got != pinned" -> "False"
test("series_pinned_before_parse - check refuses a sealed series or a LIVE series whose sha256 is not the pin it is given, before parsing, by name", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_load.py")), `${QUARTER}/quarter_load.py absent`);
  const [sealed, live] = [join(FIXTURE, "sealed"), join(FIXTURE, "live")], other = "0".repeat(64);
  for (const [which, at, got] of [["sealed", 5, sha256(join(sealed, SYM, SERIES))], ["live", 6, sha256(join(live, SYM, SERIES))]] as const) {
    const args = checkArgs(sealed, live);
    args[at] = other;
    const r = tool().run(args);
    assert.equal(r.status, 2, `the ${which} series under another pin: exit 2\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, new RegExp(`^REFUSED: D-3: syn refused before parsing: sha256 ${got} differs from the pinned ${other}$`, "m"), `the ${which} read refused before parsing`);
  }
});

// reddened by: an entry of the index under tools/kata-quarter/ that is not a merged regular file 100644, a name of the folder (in the
// index or in the working tree) outside the list file FILES, a name of FILES without its file, FILES out of the form io_guard reads
// (ASCII, one name per line ended by LF, sorted, each once, FILES itself named), or a launch from the helper's repository, whose
// folders carry these names, that io_guard refuses
// killer: tools/kata-quarter/FILES:2 CONST "quarter_counts.py" -> "quarter_count.py"
test("kata_quarter_files_are_regular_100644 - the index holds the tool as merged regular files 100644, named one by one in its list file FILES (the form io_guard reads), and the working tree carries the same names; a launch from a copy of the two trees is admitted", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "FILES")), `${QUARTER}/FILES absent`);
  const entries = gitOut(REPO, ["ls-files", "-s", "-z", "--", QUARTER]).split("\0").filter((l) => l !== "").map((l) => {
    const m = /^(\d{6}) ([0-9a-f]{40,64}) (\d)\t(.+)$/s.exec(l);
    assert.ok(m !== null, `an index line that does not parse: ${l}`);
    return { mode: m[1] ?? "", stage: m[3] ?? "", path: m[4] ?? "" };
  });
  assert.ok(entries.length > 0, "the index holds the tool (staged or committed)");
  assert.deepEqual(entries.filter((e) => e.mode !== "100644" || e.stage !== "0").map((e) => `${e.mode} ${e.stage} ${e.path}`), [], "every entry a merged regular file (100644): no link, gitlink or executable");
  const raw = readFileSync(join(REPO, QUARTER, "FILES"));
  assert.ok(raw.every((b) => b < 128) && raw.at(-1) === 10, "FILES is ASCII and ends with LF");
  const listed = names();
  assert.deepEqual(listed, [...new Set(listed)].sort(), "FILES is sorted, each name once");
  assert.ok(listed.includes("FILES"), "the list file is named in it too");
  assert.deepEqual(entries.map((e) => e.path.slice(QUARTER.length + 1)).sort(), listed, "the entries of the index under tools/kata-quarter/ are the names of FILES, none in a folder");
  assert.deepEqual(readdirSync(join(REPO, QUARTER)).sort(), listed, "the folder of the working tree, from which the helper copies, holds the names of FILES and no other");
  const r = tool().run(checkArgs(join(FIXTURE, "sealed"), join(FIXTURE, "live")));
  assert.equal(r.status, 0, `io_guard admits both lists in the copy: exit 0\n${r.stdout}${r.stderr}`);
});

// reddened by: a file of tools/kata-quarter/ (in the folder or in FILES) whose stem, the name before its first dot as io_guard.homonyms
// reads it, is a stem of tools/kata-recalc/ (first in sys.path, it would mask the second), a file that is neither the list file FILES
// nor quarter_*.py (a name of the standard library there would mask its import while io_guard loads), or a copy of the tool with a posed
// homonym that io_guard no longer refuses by name
// killer: tools/kata-quarter/FILES:3 CONST "quarter_load.py" -> "report.py"
test("kata_quarter_names_disjoint_from_kata_recalc - no stem of tools/kata-quarter/ is a stem of tools/kata-recalc/, every file of the folder is quarter_*.py but the list file, and a posed homonym (report.py, listed) is refused by io_guard by name, exit 4", () => {
  assert.ok(existsSync(join(REPO, QUARTER, ENTRY)), `${QUARTER}/${ENTRY} absent`);
  const stems = (ns: string[]): Set<string> => new Set(ns.map((n) => n.split(".")[0] ?? n));
  const quarter = [...new Set([...readdirSync(join(REPO, QUARTER)), ...names()])], frozen = stems(readdirSync(join(REPO, FROZEN)));
  assert.deepEqual([...stems(quarter)].filter((s) => frozen.has(s)), [], "no stem of tools/kata-quarter/ is a stem of tools/kata-recalc/");
  assert.deepEqual(quarter.filter((n) => n !== "FILES" && !/^quarter_[a-z0-9_]+\.py$/.test(n)), [], "every file of the folder is quarter_*.py, but the list file FILES");
  const t = tool(), copy = mkdtempSync(join(tmpdir(), "kata-quarter-homonym-"));
  cpSync(join(t.dir, "tools"), join(copy, "tools"), { recursive: true });
  writeFileSync(join(copy, QUARTER, "report.py"), "x = 1\n");
  writeFileSync(join(copy, QUARTER, "FILES"), `${[...names(), "report.py"].sort().join("\n")}\n`);
  const r = t.launch(join(copy, QUARTER, ENTRY), []);
  assert.equal(r.status, 4, `a homonym of report.py of the frozen tool, listed: refused at the import of io_guard, exit 4\n${r.stdout}${r.stderr}`);
  assert.match(r.stderr, /^io_guard: refused import \['report'\]: a module of tools\/kata-quarter named as one of tools\/kata-recalc/m, "the refusal names the stem");
});
