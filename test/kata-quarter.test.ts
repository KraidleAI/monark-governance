// test/kata-quarter.test.ts -- CM-5, the quarter counts tool tools/kata-quarter/ (docs/G0-lot-cm5-c1a.md, the loader: the second tree of
// io_guard's closed list; docs/G0-lot-cm5-c1b.md, the core of the count; docs/G0-lot-cm5-c1d.md, the identity at the commit and the launch
// form, at the end). Its entry runs io_guard.py of the frozen tool by its path first, under FORM; its folder holds the list file
// FILES and modules quarter_*.py with no stem of the frozen tool. The loader reads one symbol twice by its own reader of a series, which
// keeps the checks of recalc_p2.load_series but admits a truncated close (sealed and LIVE, each under its pin; docs/G0-lot-cm5-c1a-2.md,
// rules 8 and 8 bis), and merges them under control. Every launch runs from the temporary git repository of
// test/helpers/kata-quarter-repo.ts, one per test file (one of its own for a stand-in, or a test that changes the folders), on the synthetic fixture of fixtures/kata-quarter/ (no real series). Reads only.
// Excluded by name from test:main: g3-verifier-tool runs it through scripts/verifier-tool-ci.mjs, which gives the helper the pinned
// CPython (KATA_QUARTER_PYTHON) and holds the names of its tests (QUARTER_TESTS); by hand, `node --test test/kata-quarter.test.ts` takes
// the python of PATH (MONARK replays it so under Windows). The tool's output is read by lines, CR LF or LF (linesOf).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gitOut } from "./helpers/git-tracked.ts";
import { canonicalJson, vocabularyHits } from "../scripts/spec-publish.mjs";
import { render, type HistoryLine } from "../scripts/served-history.mjs";
import { ENTRY, TREES, git, linesOf, toolRepo, type Run, type ToolRepo } from "./helpers/kata-quarter-repo.ts";

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
/** A path segment that Windows refuses (MONARK replays this file under Windows, where a case's folder « R at 13:00 » was ENOENT): a
 *  character of < > : " / \ | ? *, a control character, a trailing dot or space, or a device name, with an extension or not (the
 *  device after prn written a[u]x: a French word to lang:gate). */
const winRefused = (s: string): boolean =>
  /[<>:"/\\|?*]/.test(s) || /[. ]$/.test(s) || /^(?:con|prn|a[u]x|nul|com[0-9¹²³]|lpt[0-9¹²³])(?:\..*)?$/i.test(s) || [...s].some((c) => c.charCodeAt(0) < 32);
/** The fixture writer: text written at p, a path under the temporary folder, its folders made; refused by name before anything is
 *  written, on every system, when a segment of p below that folder is one Windows refuses (so Linux CI is red on it too). */
const write = (p: string, text: string): void => {
  const refused = relative(tmpdir(), p).split(sep).filter(winRefused);
  if (refused.length > 0) throw new Error(`a path segment that Windows refuses: ${JSON.stringify(refused)} in ${p}`);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
};
/** A copy of a series folder of the fixture under a work folder, its CSV text and its missing.json replaced. */
const variant = (work: string, name: string, text: string, decl: Missing): string => {
  write(join(work, name, SYM, SERIES), text);
  write(join(work, name, SYM, MISSING), `${JSON.stringify(decl)}\n`);
  return join(work, name);
};
const fixtureOf = (which: string): { csv: string; missing: Missing } =>
  ({ csv: readFileSync(join(FIXTURE, which, SYM, SERIES), "utf8"), missing: JSON.parse(readFileSync(join(FIXTURE, which, SYM, MISSING), "utf8")) as Missing });
const S1 = Date.UTC(2026, 9, 1), CANDLE_S1 = `2026-10-01T00:00:00Z,${S1},100.00,100.10,99.90,100.05,1.000,${S1 + 899_999},100.02,1,0.500,50.01`;

// reddened by: a .py of tools/kata-quarter/ other than quarter_counts.py with a block __main__, an entry whose code (after its comments)
// does not open with the prologue of the frozen tool in its two-tree form (io_guard.py run by its path, the frozen tool's folder last in
// sys.path, then import io_guard before any other module), or a launch of the entry answering otherwise than written: no subcommand or
// an unknown one, the usage and exit 2; month, "not in this lot" and exit 2
// killer: tools/kata-quarter/quarter_counts.py:16 CONST "import io_guard" -> "import kata_lib"
test("kata_quarter_entry_script_imports_the_input_guard_first - the one entry script of the tool runs io_guard.py of the frozen tool by its path and imports io_guard before any other module; month answers not in this lot", () => {
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
  for (const sub of ["month"]) {
    const r = t.run([sub]);
    assert.equal(r.status, 2, `${sub}: exit 2\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, new RegExp(`^${sub}: not in this lot`), `${sub} answers that it is not in this lot`);
  }
  const [sealed, live] = [join(FIXTURE, "sealed"), join(FIXTURE, "live")], livePin = sha256(join(live, SYM, SERIES));
  // killer: tools/kata-quarter/quarter_counts.py:140 CONST "a.isascii() and " -> ""
  const sup = t.run(["check", sealed, live, SYM, "\u00b2", "pinned", livePin, "404"]);
  assert.equal(sup.status, 2, `a quarter written with a superscript digit: the usage, exit 2\n${sup.stdout}${sup.stderr}`);
  assert.match(sup.stdout, /^usage: python -E -S -s -B -P quarter_counts\.py check /, "a digit that is not ASCII is refused by the usage");
  assert.ok(!/Traceback/.test(`${sup.stdout}${sup.stderr}`), "no trace");
  // killer: tools/kata-quarter/quarter_counts.py:65 CONST "pin1 == \"pinned\" and k != 1" -> "False"
  const later = t.run(["check", sealed, live, SYM, "2", "pinned", livePin, "404"]);
  assert.equal(later.status, 2, `pinned for quarter 2: exit 2\n${later.stdout}${later.stderr}`);
  assert.match(later.stdout, /^REFUSED: 'pinned' names the sealed series of wave 1, read 1 of quarter 1 only: quarter 2 reads quarter 1 under the pin posted at its sealing$/m);
});

// reddened by: the merge admitting a grid slot that is neither in the series nor in the missing.json of the read that owns it (the candle
// at S_k absent from the LIVE series and from its declaration), a declared gap refused or not listed, a slot both declared missing and
// present admitted, an instant in both reads admitted (the sealed series read past S_k), a missing.json out of its form admitted (a count
// or an open_time_ms that is not a whole number, an open_time_utc that does not write it), or the merged range off the lookback and E_k;
// or one of the reader's own checks dropped or loosened: line endings, header, twelve fields, integer and decimal fields, open_time_utc,
// the close inside its slot (not after it, not before its open), the grid, the order (an open time repeated or going back)
// killer: tools/kata-quarter/quarter_load.py:108 CONST "if undeclared:" -> "if False:"
test("two_reads_merged_under_check - check reads the sealed and the LIVE series of the fixture, each under its pin, and merges them: the seam at S_1, 10448 slots, the three declared gaps of the LIVE series listed; the same LIVE series with the gap at S_1 undeclared, a declared slot present, an instant in both reads, or a missing.json out of its form, is refused by name", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_load.py")), `${QUARTER}/quarter_load.py absent`);
  for (const f of ["sealed", "live"].flatMap((d) => [join(d, SYM, SERIES), join(d, SYM, MISSING)])) assert.ok(existsSync(join(FIXTURE, f)), `fixtures/kata-quarter/${f} absent`);
  const t = tool(), ok = t.run(checkArgs(join(FIXTURE, "sealed"), join(FIXTURE, "live")));
  assert.equal(ok.status, 0, `check on the fixture: exit 0\n${ok.stdout}${ok.stderr}`);
  const lines = linesOf(ok.stdout);
  assert.ok(lines.includes("quarter 1 2026-10-01T00:00:00Z 2027-01-01T00:00:00Z"), "Q_1 = [2026-10-01, 2027-01-01)");
  assert.ok(lines.includes(`read sealed ${SYM} 2024-10-01T00:00:00Z 2026-10-01T00:00:00Z sha256 ${sha256(join(FIXTURE, "sealed", SYM, SERIES))} rows 1616`), `read 1 under the recording range of the sealed series, its pin printed:\n${ok.stdout}`);
  assert.ok(lines.includes(`read live ${SYM} 2026-10-01T00:00:00Z 2027-01-01T00:00:00Z sha256 ${sha256(join(FIXTURE, "live", SYM, SERIES))} rows 8829`), `read 2 under [S_1, E_1), its pin printed:\n${ok.stdout}`);
  assert.ok(lines.includes("merged 2026-09-14T04:00:00Z 2027-01-01T00:00:00Z seam 2026-10-01T00:00:00Z slots 10448 present 10445 gaps 3"), `the merged range from S_1 minus 404 hours to E_1, 1616 + 8832 slots:\n${ok.stdout}`);
  assert.deepEqual(lines.filter((l) => l.startsWith("gap ")), ["gap live 2026-10-01T00:00:00Z", "gap live 2026-11-15T12:00:00Z", "gap live 2026-12-24T23:45:00Z"], "the declared gaps of the LIVE series, kept as gaps");
  assert.deepEqual(lines.filter((l) => l.startsWith("input ") && !l.startsWith("input tool-tree ")).length, 4, "the four inputs noted by io_guard: two series, two missing.json");
  assert.equal(lines.at(-2), "VERDICT: GREEN");
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-live-")), { csv, missing } = fixtureOf("live"), rest = missing.missing.filter((m) => m.open_time_ms !== S1);
  const undeclared = t.run(checkArgs(join(FIXTURE, "sealed"), variant(work, "undeclared", csv, { count: rest.length, missing: rest })));
  assert.equal(undeclared.status, 2, `the gap at S_1 no longer declared: exit 2\n${undeclared.stdout}${undeclared.stderr}`);
  assert.match(undeclared.stdout, /^REFUSED: undeclared gap: 1 grid slots absent from the series and from the missing\.json of their read, first 2026-10-01T00:00:00Z$/m);
  const [header, ...rows] = linesOf(csv);
  const present = t.run(checkArgs(join(FIXTURE, "sealed"), variant(work, "present", [header, CANDLE_S1, ...rows].join("\n"), missing)));
  assert.equal(present.status, 2, `the candle at S_1 present and declared missing: exit 2\n${present.stdout}${present.stderr}`);
  assert.match(present.stdout, /^REFUSED: syn: 1 slots listed in missing\.json are present in the series, first 2026-10-01T00:00:00Z$/m);
  // an instant in both reads: the candle at S_1 added to the sealed series, which load_series reads under [REC_START, S_1) and refuses
  // killer: tools/kata-quarter/quarter_load.py:236 CONST "not (start <= ot < end)" -> "not (start <= ot <= end)"
  const sealed = fixtureOf("sealed"), both = t.run(checkArgs(variant(work, "both", `${sealed.csv}${CANDLE_S1}\n`, sealed.missing), join(FIXTURE, "live")));
  assert.equal(both.status, 2, `the candle at S_1 in the sealed read too: exit 2\n${both.stdout}${both.stderr}`);
  assert.match(both.stdout, /^REFUSED: syn: line 1618: off grid, out of range or not ascending$/m, "refused by name, by the range of read 1");
  const form = /^REFUSED: syn: missing\.json out of its form: a count or an open_time_ms that is not a whole number, or an open_time_utc that does not write its open_time_ms /m;
  const at = (v: unknown, utc: unknown = "2026-10-01T00:00:00Z"): Missing => ({ count: 3, missing: [{ open_time_ms: v, open_time_utc: utc }, ...rest] });
  // killer: tools/kata-quarter/quarter_load.py:73 CONST "not whole(x[\"open_time_ms\"]) or " -> ""
  // killer: tools/kata-quarter/quarter_load.py:76 CONST "bad or not whole(count)" -> "bad"
  // killer: tools/kata-quarter/quarter_load.py:73 CONST " or x[\"open_time_utc\"] != iso(x[\"open_time_ms\"])" -> ""
  for (const [name, decl] of [["float", at(S1 + 0.5)], ["string", at(String(S1))], ["bool count", { ...missing, count: true }], ["utc", at(S1, "2026-10-01T00:15:00Z")]] as const) {
    const r = t.run(checkArgs(join(FIXTURE, "sealed"), variant(work, name.replace(" ", "-"), csv, decl)));
    assert.equal(r.status, 2, `a missing.json with a ${name} out of its form: exit 2\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, form, `a missing.json with a ${name} out of its form, refused by name`);
  }
  // the reader's own checks (those of recalc_p2.load_series, its words but the close's), each refused by name on the LIVE series with one
  // change: CR LF, no final LF, another header, 13 fields, a signed integer, a decimal with an exponent, an open_time_utc that does not
  // write the open time, a close 1 ms after its slot or 1 ms before its open, an open time off the grid, repeated, or going back
  // killer: tools/kata-quarter/quarter_load.py:218 CONST "if \"\\r\" in text or not text.endswith(\"\\n\"):" -> "if False:"
  // killer: tools/kata-quarter/quarter_load.py:221 CONST "if lines[0] != recalc_p2.CSV_HEADER:" -> "if False:"
  // killer: tools/kata-quarter/quarter_load.py:227 ROR "len(f) != 12" -> "len(f) < 12"
  // killer: tools/kata-quarter/quarter_load.py:229 CONST "if not all(recalc_p2.RE_INT.match(f[i]) for i in (1, 7, 9)):" -> "if False:"
  // killer: tools/kata-quarter/quarter_load.py:231 CONST "if not all(recalc_p2.RE_DEC.match(f[i]) for i in (2, 3, 4, 5, 6, 8, 10, 11)):" -> "if False:"
  // killer: tools/kata-quarter/quarter_load.py:234 CONST "f[0] != recalc_p2.iso(ot) or " -> ""
  // killer: tools/kata-quarter/quarter_load.py:234 CONST "ot <= ct <= ot + K.STEP_MS - 1" -> "ot <= ct <= ot + K.STEP_MS"
  // killer: tools/kata-quarter/quarter_load.py:234 CONST "not ot <= ct <=" -> "not ct <="
  // killer: tools/kata-quarter/quarter_load.py:236 CONST "ot % K.STEP_MS != 0 or " -> ""
  // killer: tools/kata-quarter/quarter_load.py:236 CONST " or (prev is not None and ot <= prev)" -> ""
  // killer: tools/kata-quarter/quarter_load.py:236 ROR "ot <= prev" -> "ot < prev"
  const i = 100, no = i + 2, step = 900_000, cells = (r: string | undefined): string[] => (r ?? "").split(","), ot = Number(cells(rows[i])[1]), off = ot + 60_000;
  const utc = (ms: number): string => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z"), lf = [header, ...rows].join("\n");
  const one = (f: (x: string[]) => string[]): string => [header, ...rows.map((r, j) => (j === i ? f(cells(r)).join(",") : r))].join("\n");
  const set = (k: number, v: string) => (x: string[]): string[] => x.map((y, j) => (j === k ? v : y));
  const slot = "open time, or a close time out of its slot", order = "off grid, out of range or not ascending";
  const reader: [string, string, string][] = [["CR LF", lf.replaceAll("\n", "\r\n"), "line endings"], ["no final LF", lf.slice(0, -1), "line endings"],
    ["another header", [(header ?? "").toUpperCase(), ...rows].join("\n"), "header differs from REC l.34-35"], ["13 fields", one((x) => [...x, "0"]), `line ${no}: 13 fields`],
    ["a signed integer", one(set(9, "+1")), `line ${no}: integer field`], ["a decimal with an exponent", one(set(6, "1e0")), `line ${no}: decimal field`],
    ["another open_time_utc", one(set(0, utc(ot + step))), `line ${no}: ${slot}`], ["a close 1 ms after its slot", one(set(7, String(ot + step))), `line ${no}: ${slot}`],
    ["a close before its open", one(set(7, String(ot - 1))), `line ${no}: ${slot}`],
    ["an open time off the grid", one((x) => [utc(off), String(off), ...x.slice(2, 7), String(off + step - 1), ...x.slice(8)]), `line ${no}: ${order}`],
    ["a repeated open time", [header, ...rows.slice(0, i + 1), rows[i] ?? "", ...rows.slice(i + 1)].join("\n"), `line ${no + 1}: ${order}`],
    ["an open time going back", [header, ...rows.slice(0, i), rows[i + 1] ?? "", rows[i] ?? "", ...rows.slice(i + 2)].join("\n"), `line ${no + 1}: ${order}`]];
  for (const [name, text, why] of reader) {
    const r = t.run(checkArgs(join(FIXTURE, "sealed"), variant(work, `reader-${name.replaceAll(" ", "-")}`, text, missing)));
    assert.equal(r.status, 2, `the LIVE series with ${name}: exit 2\n${r.stdout}${r.stderr}`);
    assert.ok(linesOf(r.stdout).includes(`REFUSED: syn: ${why}`), `the LIVE series with ${name}: refused by name, "${why}"\n${r.stdout}${r.stderr}`);
  }
});

// reddened by: a read whose bytes are not its pin parsed anyway, the sealed read or the LIVE read (D-3 of the frozen tool, kept by the
// loader's reader: the sha256 of the bytes, before parsing), or a refusal that does not name the read and the two digests
// killer: tools/kata-quarter/quarter_load.py:215 CONST "digest != pin" -> "False"
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
// killer: tools/kata-quarter/FILES:3 CONST "quarter_counts.py" -> "quarter_count.py"
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
// killer: tools/kata-quarter/FILES:6 CONST "quarter_load.py" -> "report.py"
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

// The core of the count (docs/G0-lot-cm5-c1b.md): `count` on the registry of fixtures/kata-quarter/registry (made-up region rows of
// `syn`) and on series made from the fixture's: its three LIVE gaps filled with made-up candles (no drop), shifted by a quarter for Q_2,
// or with candles removed and declared in missing.json. The counts are read from the one JSON line that count prints.
const REG = join(FIXTURE, "registry", "wave1-syn.json"), H = 3_600_000, E1 = Date.UTC(2027, 0, 1), E2 = Date.UTC(2027, 3, 1);
const iso = (ms: number): string => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
const candleAt = (t: number): string => `${iso(t)},${t},100.00,100.10,99.90,100.05,1.000,${t + 899_999},100.02,1,0.500,50.01`;
type Series = { text: string; missing: Missing };
/** A CSV of the fixture's shape with made-up candles at `fill`, candles removed (and declared) at `drop`, every time moved by dt, cut at end. */
const edit = (csv: string, { fill = [] as number[], drop = [] as number[], dt = 0, end = Infinity } = {}): Series => {
  const [header = "", ...rows] = linesOf(csv).filter((l) => l !== ""), byT = new Map(rows.map((r): [number, string] => [Number(r.split(",")[1]), r]));
  for (const t of fill) byT.set(t, candleAt(t));
  for (const t of drop) byT.delete(t);
  const out = [...byT].sort(([a], [b]) => a - b).filter(([t]) => t + dt < end).map(([t, r]) => { const f = r.split(","); return [iso(t + dt), t + dt, ...f.slice(2, 7), t + dt + 899_999, ...f.slice(8)].join(","); });
  return { text: `${[header, ...out].join("\n")}\n`, missing: { count: drop.length, missing: drop.map((t) => ({ open_time_ms: t + dt, open_time_utc: iso(t + dt) })) } };
};
/** Writes a series under <dir>/<folder>/ and returns dir. */
const put = (dir: string, folder: string, s: Series): string => {
  write(join(dir, folder, `${folder}-15m.csv`), s.text);
  write(join(dir, folder, MISSING), `${JSON.stringify(s.missing)}\n`);
  return dir;
};
type Row = { task_class: string; horizon: string; n_test: number; k_test: number; drops_label: number; out_input: number; served_from: string; served_to: string; served_tables: string[] };
type Counts = { grid: Record<string, { instants: number; first: string; last: string }>; halts: unknown[]; rows: Row[] };
const hex = (t: string): string => createHash("sha256").update(t).digest("hex");
/** The line of the class c in the served history for the deployment of the day d (t_e at 10:00Z, t_f at 11:00Z), made-up digests. */
const served = (d: string, c: string): HistoryLine => ({ format: "kata-served-history-v1", release_dir: `contract-1.1.0-tables-${d}`, task_class: c,
  policy_table_sha256: hex(`table ${d} ${c}`), probe_record_sha256: hex(`probe ${d} ${c}`), merge_commit: hex(d).slice(0, 40), t_e: `${d}T10:00:00Z`, t_f: `${d}T11:00:00Z`, ca_record_sha256: hex(`ca ${d}`) });
const CLASSES = ["syn-range-1h", "syn-range-4h", "syn-mae-down-1h", "alt-range-1h", "alt-mae-up-1h", "bis-mae-up-1h"];
/** A served history under a new folder, its path and pin: the deployments [day, classes] written by render of scripts/served-history.mjs
 *  (the writer, a JSON array, one canonical line per element), or the text given. By default one deployment of 2026-09-01, every class. */
const history = (deps: [string, string[]][] = [["2026-09-01", CLASSES]], text?: string): [string, string] => {
  const p = join(mkdtempSync(join(tmpdir(), "kata-quarter-served-")), "served-history.json");
  writeFileSync(p, text ?? render(null, deps.flatMap(([d, cs]) => cs.map((c) => served(d, c)))));
  return [p, sha256(p)];
};
/** count on a registry, a served history, the sealed and live folders and the symbol folders named, each pinned by its bytes, its
  *  evidence written under o.out (a new folder by default), o.core the core registry and its pin after the registry; its exit and its JSON line. */
const count = (sealed: string, live: string, k: number, folders: string[], o: { reg?: string; extra?: string[]; repo?: ToolRepo; out?: string; served?: [string, string]; core?: [string, string] } = {}): { r: Run; c: Counts } => {
  const reg = o.reg ?? REG, pins = folders.map((f) => `${f}:${sha256(join(sealed, f, `${f}-15m.csv`))}:${sha256(join(live, f, `${f}-15m.csv`))}`);
  const out = o.out ?? join(mkdtempSync(join(tmpdir(), "kata-quarter-evidence-")), "e");
  const args = ["count", reg, sha256(reg), ...(o.core ?? []), ...(o.served ?? history()), sealed, live, String(k), out, ...pins, ...(o.extra ?? [])], r = (o.repo ?? tool()).run(args);
  return { r, c: JSON.parse(linesOf(r.stdout).find((l) => l.startsWith("{")) ?? "null") as Counts };
};
const byClass = (c: Counts): Record<string, number[]> => Object.fromEntries(c.rows.map((r) => [r.task_class, [r.n_test, r.drops_label, r.out_input]]));
/** The registry with its rows changed by f, written under work. */
const regWith = (work: string, name: string, f: (rows: Record<string, unknown>[]) => Record<string, unknown>[]): string => {
  const reg = JSON.parse(readFileSync(REG, "utf8")) as { rows: Record<string, unknown>[] };
  write(join(work, name), `${JSON.stringify({ ...reg, rows: f(reg.rows) })}\n`);
  return join(work, name);
};
/** Q_1 with no gap: the LIVE fixture with its three declared gaps filled by made-up candles. */
const fullQ1 = (work: string, o: { drop?: number[]; fill?: number[] } = {}, folder = SYM): string => {
  const live = fixtureOf("live");
  return put(join(work, "q1"), folder, edit(live.csv, { fill: [...live.missing.missing.map((m) => m.open_time_ms as number), ...(o.fill ?? [])], drop: o.drop ?? [] }));
};

// reddened by: a grid that does not end at E_k - h (one instant at E_k or after it), that starts off S_k, or a quarter off its calendar
// months; or an instant of a series with no gap counted out or dropped
// killer: tools/kata-quarter/quarter_core.py:140 CONST "{\"Q\": (s_k, e_k)}" -> "{\"Q\": (s_k, e_k + K.H_MS[\"4h\"])}"
test("quarter_grid - on a series with no gap, Q_1 counts 2208 instants at 1h and 552 at 4h, Q_2 2160 and 540, each in n_test with no drop and no instant out; the grid ends at E_k - h", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  assert.ok(existsSync(REG), "fixtures/kata-quarter/registry/wave1-syn.json absent");
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-grid-")), q1 = fullQ1(work);
  const q2 = put(join(work, "q2"), SYM, edit(readFileSync(join(q1, SYM, SERIES), "utf8"), { dt: E1 - S1, end: E2 }));
  for (const [k, sealed, lv, n1, n4, start, end] of [[1, join(FIXTURE, "sealed"), q1, 2208, 552, S1, E1], [2, q1, q2, 2160, 540, E1, E2]] as const) {
    const { r, c } = count(sealed, lv, k, [SYM]);
    assert.equal(r.status, 0, `count on Q_${k}: exit 0\n${r.stdout}${r.stderr}`);
    assert.deepEqual(c.grid, { "1h": { instants: n1, first: iso(start), last: iso(end - H) }, "4h": { instants: n4, first: iso(start), last: iso(end - 4 * H) } }, `the grid of Q_${k}`);
    assert.deepEqual(c.rows.map((x) => [x.task_class, x.n_test, x.drops_label, x.out_input]), c.rows.map((x) => [x.task_class, x.horizon === "1h" ? n1 : n4, 0, 0]), `every instant of Q_${k} in n_test`);
  }
});

// reddened by: an option of count admitted (a file of calls or of traffic, a served history), or one refused without its name
// killer: tools/kata-quarter/quarter_counts.py:33 CONST "FLAGS = [" -> "FLAGS = [\"--calls\", "
test("counts_ignore_traffic - count takes no option: its list FLAGS is closed and --calls is refused by name, exit 2", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const ok = count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM]);
  assert.equal(ok.r.status, 0, `count on the fixture: exit 0\n${ok.r.stdout}${ok.r.stderr}`);
  const calls = count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM], { extra: ["--calls"] });
  assert.equal(calls.r.status, 2, `count with --calls: exit 2\n${calls.r.stdout}${calls.r.stderr}`);
  assert.match(calls.r.stdout, /^REFUSED: --calls: not an option of count, whose list FLAGS is closed: no call or traffic enters a count$/m);
});

// reddened by: a missing candle that does not drop the label it closes or the bar it is in, a drop counted in n_test or out_input, an
// input window holding an absent bar left in, or a label of range read from the bar (only its two closes count)
// killer: tools/kata-quarter/quarter_core.py:102 CONST "lab is None" -> "False"
test("drop_on_missing_candle - a candle removed: at E_k - 15 min, one drop for each row and nothing out; inside a bar, a drop for the path row only; closing a bar, a drop for range and path; the W instants whose window holds the bar out", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const base = count(join(FIXTURE, "sealed"), fullQ1(mkdtempSync(join(tmpdir(), "kata-quarter-drop-"))), 1, [SYM]);
  assert.equal(base.r.status, 0, `count on Q_1 with no gap: exit 0\n${base.r.stdout}${base.r.stderr}`);
  const at = (d: number, h: number, m: number): number => Date.UTC(2026, 10, d, h, m);
  const cases: [string, number, Record<string, number[]>][] = [["E_1 - 15 min", E1 - 900_000, { "syn-range-1h": [-1, 1, 0], "syn-range-4h": [-1, 1, 0], "syn-mae-down-1h": [-1, 1, 0] }],
    ["inside a bar", at(1, 12, 15), { "syn-range-1h": [-101, 0, 101], "syn-range-4h": [-101, 0, 101], "syn-mae-down-1h": [-102, 1, 101] }],
    ["closing a 1h bar", at(20, 12, 45), { "syn-range-1h": [-102, 1, 101], "syn-range-4h": [-101, 0, 101], "syn-mae-down-1h": [-102, 1, 101] }]];
  for (const [name, t, want] of cases) {
    const { r, c } = count(join(FIXTURE, "sealed"), fullQ1(mkdtempSync(join(tmpdir(), "kata-quarter-drop-")), { drop: [t] }), 1, [SYM]);
    assert.equal(r.status, 0, `the candle ${name} removed and declared: exit 0\n${r.stdout}${r.stderr}`);
    const b = byClass(base.c);
    assert.deepEqual(byClass(c), Object.fromEntries(Object.entries(want).map(([k, d]) => [k, d.map((x, i) => (b[k]?.[i] ?? NaN) + x)])), `the candle ${name}: [n_test, drops.label, out_input]`);
  }
});

// reddened by: a score equal to qhat counted as a miss, or a score above it counted covered
// killer: tools/kata-quarter/quarter_core.py:105 CONST "> qhat" -> ">= qhat"
test("miss_is_strict - a score equal to qhat is covered, a score above it is a miss: with qhat 0 the instants whose two closes are equal are covered, and the misses are those of the least double above 0", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-miss-")), t0 = Date.UTC(2026, 10, 3, 6);
  const live = fullQ1(work, { fill: [t0 - 900_000, t0 + 2_700_000] }); // two equal closes: the range score at t0 is 0
  const k = (qhat: number): Row | undefined => {
    const { r, c } = count(join(FIXTURE, "sealed"), live, 1, [SYM], { reg: regWith(work, `q${qhat}.json`, (rows) => rows.map((x) => (x.taskClass === "syn-range-1h" ? { ...x, calib: { qhat } } : x))) });
    assert.equal(r.status, 0, `count with qhat ${qhat}: exit 0\n${r.stdout}${r.stderr}`);
    return c.rows.find((x) => x.task_class === "syn-range-1h");
  };
  const [zero, least] = [k(0), k(5e-324)];
  assert.ok(zero !== undefined && least !== undefined && zero.n_test === 2208, "the row counted on every instant");
  assert.equal(zero.k_test, least.k_test, "qhat 0 and the least double above it give the same misses: no score lies between them");
  assert.ok(zero.k_test < zero.n_test, `the score 0 at ${iso(t0)} equal to qhat 0 is covered: ${zero.k_test} misses of ${zero.n_test}`);
});

/** A repository of its own whose quarter_load.py ends with `code`, committed (a stand-in of a function of the loader). */
const standIn = (code: string): ToolRepo => toolRepo(REPO, (dir) => writeFileSync(join(dir, QUARTER, "quarter_load.py"), `${read("quarter_load.py")}\n${code}\n`));

// reddened by: a halt seen on every symbol of the venue with the same missing candles and resumption kept as two intervals, the
// instance's E not the earliest or R not the latest, its drops posed on one symbol only; halts with other missing candles, or another
// resumption, joined; or an instance formed though a symbol of the venue (a folder of the registry) did not see the halt
// killer: tools/kata-quarter/quarter_core.py:82 CONST "min(es)" -> "es[0]"
test("venue_instance_one_interval - two symbols with the same halt (same missing candles, same resumption, E and R apart) make one venue instance, E the earliest and R the latest, posed on each symbol; halts with other missing candles stay apart, and so do all once a third symbol of the venue did not see them", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-venue-")), at = (d: number, h: number, m: number, s = 0, ms = 0): number => Date.UTC(2026, 10, d, h, m, s, ms);
  const day1 = [at(10, 12, 45), at(10, 13, 0), at(10, 13, 15), at(10, 13, 30), at(10, 13, 45)], sealed = fixtureOf("sealed");
  // day 2: the same resumption (13:15), other missing candles: two halts of their own symbols
  const gone: Record<string, number[]> = { [SYM]: [...day1, at(20, 12, 45), at(20, 13, 0)], alt: [...day1, at(20, 13, 0)], bis: [] };
  for (const f of [SYM, "alt", "bis"]) { fullQ1(work, { drop: gone[f] ?? [] }, f); put(join(work, "sealed"), f, { text: sealed.csv, missing: sealed.missing }); }
  const alt = (rows: Record<string, unknown>[]): Record<string, unknown>[] => [...rows, { ...rows[0], taskClass: "alt-range-1h", symbol: "ALTUSDT", key: "kata:ewma-vol-hw-v1@binance/ALTUSDT/1h/b0" }];
  const [e1s, e1a, r1s, r1a, e2, r2] = [at(10, 12, 0), at(10, 11, 58, 59, 1), at(10, 14, 0), at(10, 13, 59, 30), at(20, 12, 30), at(20, 13, 15)];
  // the halts of the merged reads set by a stand-in of merge: E and R a few seconds apart, an R off the grid (no real series gives one)
  const halts = { [SYM]: [[e1s, r1s], [e2, r2]], alt: [[e1a, r1a], [e2, r2]] }, repo = standIn("_merge = merge\n\n\ndef merge(first, second, lookback_ms):\n" +
    `    return {**_merge(first, second, lookback_ms), "halts": ${JSON.stringify(halts)}.get(first["sym"], [])}`);
  const { r, c } = count(join(work, "sealed"), join(work, "q1"), 1, [SYM, "alt"], { reg: regWith(work, "two.json", alt), repo });
  assert.equal(r.status, 0, `count on two symbols: exit 0\n${r.stdout}${r.stderr}`);
  const one = (e: number, x: number, s: string[]): unknown => ({ start_ms: e, end_ms: x, symbols: s });
  assert.deepEqual(c.halts, [one(e1a, r1s, ["alt", SYM]), one(e2, r2, ["alt"]), one(e2, r2, [SYM])], "day 1 one venue instance, E the earliest, R the latest; day 2 apart");
  // day 1: t = 11:00 meets [E, R) by the earlier E only, t = 12:00 its close at 12:45 absent, 102 out; day 2: syn 12:00 dropped and
  // 102 out, alt 12:00 and 13:00 dropped by its halt and 101 out
  assert.deepEqual([byClass(c)["syn-range-1h"], byClass(c)["alt-range-1h"]], [[2208 - 207, 3, 204], [2208 - 207, 4, 203]], "the drops of each interval posed on its symbols");
  const three = count(join(work, "sealed"), join(work, "q1"), 1, [SYM, "alt", "bis"], { reg: regWith(work, "three.json", (rows) => [...alt(rows), { ...rows[3], taskClass: "bis-mae-up-1h" }]), repo });
  assert.equal(three.r.status, 0, `count on three symbols: exit 0\n${three.r.stdout}${three.r.stderr}`);
  assert.deepEqual(three.c.halts, [one(e1a, r1a, ["alt"]), one(e1s, r1s, [SYM]), one(e2, r2, ["alt"]), one(e2, r2, [SYM])], "bis, a symbol of the venue, did not see them: no instance");
});

// reddened by: a range score without its absolute value, the path row's side read from the other label, or a factor table other than
// the row's: k_test exact on a series made so that every score is known (hourly closes 100 and 101 in turn, lows 99.8, highs 101.1)
// killer: tools/kata-quarter/quarter_core.py:105 CONST "(abs(lab) if cell[\"kind\"] == \"range\" else lab)" -> "lab"
test("k_test_exact_on_a_made_series - on hourly closes 100 and 101 in turn, with qhat 0.9: range-1h misses where the factor is 1 (score 1/f), mae-down-1h after a close at 101 where the factor is 1 or 1.25 (score 1.2/f); range-4h has no move and every instant out", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-exact-")), header = linesOf(fixtureOf("live").csv)[0], odd = (t: number): boolean => Math.floor(t / H) % 2 === 1;
  const zigzag = (from: number, to: number): Series => {
    const rows: string[] = [];
    for (let t = from; t < to; t += 900_000) rows.push(`${iso(t)},${t},${odd(t) === (t % H === 0) ? 100 : 101},101.1,99.8,${odd(t) ? 101 : 100},1,${t + 899_999},100,1,0.5,50`);
    return { text: `${header}\n${rows.join("\n")}\n`, missing: { count: 0, missing: [] } };
  };
  put(join(work, "sealed"), SYM, zigzag(S1 - 404 * H, S1));
  put(join(work, "live"), SYM, zigzag(S1, E1));
  const reg = regWith(work, "q09.json", (rows) => rows.map((x) => ({ ...x, calib: { qhat: 0.9 } })));
  // killer: tools/kata-quarter/quarter_core.py:101 CONST "(d if cell[\"side\"] == \"down\" else u)" -> "(u if cell[\"side\"] == \"down\" else d)"
  // killer: tools/kata-quarter/quarter_core.py:96 CONST "kid, table, h)" -> "kid, [1.0] * 168, h)"
  const { r, c } = count(join(work, "sealed"), join(work, "live"), 1, [SYM], { reg });
  assert.equal(r.status, 0, `count on the made series: exit 0\n${r.stdout}${r.stderr}`);
  const grid = Array.from({ length: 2208 }, (_, i) => S1 + i * H), f = (t: number): number => ((t / H + 72) % 168) % 3; // factor 1, 1.25, 1.5
  assert.deepEqual(c.rows.map((x) => [x.task_class, x.n_test, x.k_test, x.drops_label, x.out_input]), [
    ["syn-range-1h", 2208, grid.filter((t) => f(t) === 0).length, 0, 0], ["syn-range-4h", 0, 0, 0, 552],
    ["syn-mae-down-1h", 2208, grid.filter((t) => !odd(t) && f(t) < 2).length, 0, 0]], "k_test of each row, worked out from the series");
});

// reddened by: a registry parsed under another pin, a row at another attempt admitted, a folder named twice, or a run that does not name
// every symbol folder of the registry (the venue), or names a folder outside it, admitted
// killer: tools/kata-quarter/quarter_core.py:33 CONST "got != pin" -> "False"
test("count_refuses_by_name - count refuses by name, exit 2: a registry under another pin before parsing, a region row at attempt 2, a symbol folder named twice, a run that does not name every symbol folder of the registry or names one outside it", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-refused-")), [sealed, live] = [join(FIXTURE, "sealed"), join(FIXTURE, "live")], other = "0".repeat(64);
  const spec = `${SYM}:${sha256(join(sealed, SYM, SERIES))}:${sha256(join(live, SYM, SERIES))}`, copy = join(work, "live");
  const run = (reg: string, pin: string, specs: string[], out = join(work, "e"), lv = live): Run => tool().run(["count", reg, pin, ...history(), sealed, lv, "1", out, ...specs]);
  cpSync(live, copy, { recursive: true });
  symlinkSync(mkdtempSync(join(tmpdir(), "kata-quarter-target-")), join(work, "link"), "junction"); // a link to an empty folder (a junction on win32)
  const two = regWith(work, "attempt2.json", (rows) => rows.map((x) => (x.taskClass === "syn-range-1h" ? { ...x, calibAttempt: 2 } : x)));
  const venue = regWith(work, "venue.json", (rows) => [...rows, { ...rows[3], taskClass: "alt-mae-up-1h" }]);
  // killer: tools/kata-quarter/quarter_core.py:41 CONST "r[\"calibAttempt\"] != 1" -> "False"
  // killer: tools/kata-quarter/quarter_counts.py:96 CONST "len(folders) != len(specs) or " -> ""
  // killer: tools/kata-quarter/quarter_counts.py:98 CONST "sorted(folders) != venue" -> "False"
  // killer: tools/kata-quarter/quarter_counts.py:98 CONST "sorted(folders) != venue" -> "not set(venue) <= set(folders)"
  for (const [name, r, re] of [["another pin", run(REG, other, [spec]), `registry refused before parsing: sha256 ${sha256(REG)} differs from the pinned ${other}`],
    ["attempt 2", run(two, sha256(two), [spec]), "row syn-range-1h kata:ewma-vol-hw-v1@binance/SYNUSDT/1h/b0: not a band or path cell of wave 1 at attempt 1 "],
    ["a folder twice", run(REG, sha256(REG), [spec, spec]), "a symbol folder named twice, or 'pinned' for a quarter after quarter 1 "],
    ["a venue symbol not named", run(venue, sha256(venue), [spec]), "the symbol folders named ['syn'] are not the venue's ['alt', 'syn'], those of the registry's rows"],
    ["a folder outside the registry", run(REG, sha256(REG), [spec, `alt${spec.slice(SYM.length)}`]), "the symbol folders named ['alt', 'syn'] are not the venue's ['syn'], those of the registry's rows"],
    // killer: tools/kata-quarter/quarter_evidence.py:82 CONST "not os.path.isdir(os.path.dirname(out)) or " -> ""
    ["an output whose parent is absent", run(REG, sha256(REG), [spec], join(work, "absent", "e")), "its parent is not a folder, it is a link, or it lies in an input folder"],
    // killer: tools/kata-quarter/quarter_evidence.py:82 CONST " or any(real == d or real.startswith(d + os.sep) for d in map(os.path.realpath, inputs))" -> ""
    ["an output in the LIVE folder", run(REG, sha256(REG), [spec], join(copy, "e"), copy), "its parent is not a folder, it is a link, or it lies in an input folder"],
    // killer: tools/kata-quarter/quarter_evidence.py:82 CONST " or os.path.islink(out)" -> ""
    ["an output that is a link", run(REG, sha256(REG), [spec], join(work, "link")), "its parent is not a folder, it is a link, or it lies in an input folder"]] as const) {
    assert.equal(r.status, 2, `${name}: exit 2\n${r.stdout}${r.stderr}`);
    assert.ok(r.stdout.startsWith("REFUSED: ") && r.stdout.includes(re), `${name}: refused by name\n${r.stdout}`);
  }
});

// reddened by: kata_lib.py not the blob of the frozen tool, kata_lib's globals left posed after a count, or a global of kata_lib changed
// in place during a count admitted, a dict or a list (a snapshot that keeps references would see it equal to itself), or math left
// replaced by the pass under fdlibm_log (docs/G0-lot-cm5-c1c.md) and not refused after that pass
// killer: tools/kata-quarter/quarter_core.py:128 CONST "K.REC_START, K.REC_END, K.BLOCKS = saved" -> "saved = saved"
test("kata_lib_blob_unchanged_and_globals_restored - kata_lib.py is the blob d4a6373a (sha256 60a2adf3) in the index; a count leaves kata_lib's globals as it found them, and one that changes a global in place (a dict, a list) is refused by name", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const id = /^100644 ([0-9a-f]{40}) 0\t/.exec(gitOut(REPO, ["ls-files", "-s", "--", `${FROZEN}/kata_lib.py`]))?.[1] ?? "";
  assert.equal(id, "d4a6373ad5faeb4e9afc3853ca8a138665f4ef1f", "kata_lib.py in the index, the blob that the frozen tool's tree pins");
  assert.equal(createHash("sha256").update(gitOut(REPO, ["cat-file", "blob", id])).digest("hex"), "60a2adf3bb86c825fd4a1f24cd615354020b8a52c4eebe973f8788449298459e");
  const ok = count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM]);
  assert.equal(ok.r.status, 0, `a count leaves the globals as it found them: exit 0\n${ok.r.stdout}${ok.r.stderr}`);
  // killer: tools/kata-quarter/quarter_core.py:58 CONST "return type(v).__name__, [cp(x) for x in v]" -> "return v"
  for (const [what, line] of [["KATA_FUNCS, a dict,", "K.KATA_FUNCS[\"posed\"] = None"], ["SCALE_KATAS, a list,", "K.SCALE_KATAS.append(\"posed\")"]] as const) {
    const repo = standIn(`_bars = K.build_bars\n\n\ndef _build(candles, h_ms):\n    ${line}\n    return _bars(candles, h_ms)\n\n\nK.build_bars = _build`);
    const bad = count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM], { repo });
    assert.equal(bad.r.status, 2, `${what} changed in place during the count: exit 2\n${bad.r.stdout}${bad.r.stderr}`);
    assert.match(bad.r.stdout, /^REFUSED: kata_lib's globals are not those before the count: the pose not restored, or a global changed in place$/m, `${what} changed in place, refused by name`);
  }
  // killer: tools/kata-quarter/quarter_core.py:150 CONST "if kata_lib_state() != held:" -> "if False:"
  const kept = standIn("import report, types\n_setting = report.setting\n\n\ndef _leave(name, memo):\n    K.math = types.SimpleNamespace(**vars(K.math)) if name == \"ln\" else K.math\n    return _setting(name, memo)\n\n\nreport.setting = _leave");
  const pass = count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM], { repo: kept });
  assert.equal(pass.r.status, 2, `math left replaced after the pass under fdlibm_log: exit 2\n${pass.r.stdout}${pass.r.stderr}`);
  assert.match(pass.r.stdout, /^REFUSED: kata_lib's globals are not those before the pass ln: math not restored, or a global changed in place$/m, "refused after that pass, by name");
});

// reddened by: a label function other than kata_lib.labels_at in the count, or a source of labels_at other than the pinned one
// killer: tools/kata-quarter/quarter_core.py:100 CONST "K.labels_at" -> "local_labels"
test("labels_fn_pinned - the count labels by kata_lib.labels_at, whose source (kata_lib.py l.353-374) has the pinned sha256 b5ca57f7", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_core.py")), `${QUARTER}/quarter_core.py absent`);
  const src = linesOf(readFileSync(join(REPO, FROZEN, "kata_lib.py"), "utf8")).slice(352, 374);
  assert.ok(src[0]?.startsWith("def labels_at(") && src[21] === "    return y, r, d, u", "l.353-374 hold labels_at");
  assert.equal(createHash("sha256").update(`${src.join("\n")}\n`).digest("hex"), "b5ca57f7c4b7332802c0719db7542732588748d0f7232f87427cb30e72af9b1c");
  assert.match(read("quarter_core.py"), /^ {8}_y, r, d, u = K\.labels_at\(candles, bars, t, h\)$/m, "count_row labels by kata_lib.labels_at");
});

// The identity of the tool at its commit (docs/G0-lot-cm5-c1d.md): check and count declare the role tool-tree and, before any input, hold
// both folders on disk to their blobs at the commit that io_guard.git_tree names; the line "identity" names that commit and both trees.
const IDENTITY = /^identity commit ([0-9a-f]{40}) kata_recalc_tree_sha256 ([0-9a-f]{64}) kata_quarter_manifest_sha256 ([0-9a-f]{64})$/m;
/** The digest of a folder's files, as the tool writes it (report.tree_digest): the sha256 of the lines "<sha256>  <name>" sorted by name. */
const treeDigest = (dir: string): string =>
  createHash("sha256").update(readdirSync(dir).sort().map((n) => `${sha256(join(dir, n))}  ${n}\n`).join("")).digest("hex");
/** quarter_spare.py added to the copy's tools/kata-quarter/ and to its FILES (on), or removed from both. */
const spare = (dir: string, on: boolean): void => {
  if (on) writeFileSync(join(dir, QUARTER, "quarter_spare.py"), "x = 1\n");
  else rmSync(join(dir, QUARTER, "quarter_spare.py"));
  writeFileSync(join(dir, QUARTER, "FILES"), `${[...names(), ...(on ? ["quarter_spare.py"] : [])].sort().join("\n")}\n`);
};

// reddened by: a folder of the tool on disk that is not its tree at the commit admitted (a file added and listed, a byte changed in either
// tree, a committed file removed and unlisted, a file of the frozen tool committed 100755), a refusal that does not name the files, a line
// identity that does not name the commit and the digests of both folders, or a repository with no commit not refused by name
// killer: tools/kata-quarter/quarter_identity.py:32 CONST "files != committed" -> "False"
test("kata_quarter_tree_refused_unless_at_its_commit - count from the helper's repository at its commit exits 0 and names the commit and both trees; a file added to tools/kata-quarter/ and listed, a byte changed in either tree, or a committed file removed, is refused by name before any input, exit 2", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_identity.py")), `${QUARTER}/quarter_identity.py absent`);
  const run = (repo: ToolRepo): Run => count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM], { repo }).r;
  const t = toolRepo(REPO), ok = run(t);
  assert.equal(ok.status, 0, `count at the commit: exit 0\n${ok.stdout}${ok.stderr}`);
  assert.deepEqual(IDENTITY.exec(ok.stdout)?.slice(1), [gitOut(t.dir, ["rev-parse", "HEAD"]).trim(), treeDigest(join(t.dir, FROZEN)), treeDigest(join(t.dir, QUARTER))], "the commit and the digests of both folders");
  const flip = (file: string): (() => void) => {
    const raw = readFileSync(join(t.dir, file)), b = Buffer.from(raw);
    b[2] = (b[2] ?? 0) ^ 0x20; // a letter of the first comment line, its case changed
    writeFileSync(join(t.dir, file), b);
    return () => writeFileSync(join(t.dir, file), raw);
  };
  const removed = toolRepo(REPO, (dir) => spare(dir, true)), mode = toolRepo(REPO);
  spare(removed.dir, false);
  git(mode.dir, ["update-index", "--chmod=+x", `${FROZEN}/binom_check.py`]); // the bytes unchanged, the entry 100755 (Windows too)
  git(mode.dir, ["commit", "-q", "-m", "binom_check.py executable"]);
  const cases: [string, () => () => void, ToolRepo, string, string[]][] = [
    ["a file added and listed", () => { spare(t.dir, true); return () => spare(t.dir, false); }, t, QUARTER, ["quarter_spare.py", "FILES"]],
    ["a byte changed in tools/kata-quarter/", () => flip(`${QUARTER}/quarter_core.py`), t, QUARTER, ["quarter_core.py"]],
    ["a byte changed in tools/kata-recalc/", () => flip(`${FROZEN}/binom_check.py`), t, FROZEN, ["binom_check.py"]],
    ["a committed file removed and unlisted", () => () => undefined, removed, QUARTER, ["quarter_spare.py", "FILES"]],
    // killer: tools/kata-quarter/quarter_identity.py:48 CONST "b if m == \"100644\" else None" -> "b"
    ["a file of tools/kata-recalc/ committed 100755", () => () => undefined, mode, FROZEN, ["binom_check.py"]]];
  for (const [name, change, repo, tree, diff] of cases) {
    const restore = change(), r = run(repo);
    restore();
    assert.equal(r.status, 2, `${name}: exit 2\n${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, `REFUSED: ${tree} is not the tree of the commit that git_tree names: ['${diff.join("', '")}'] (a file more, a file less or a byte changed): commit the tool, then run it\n`, `${name}: refused by name, no input read`);
  }
  assert.equal(run(t).status, 0, "the folders restored: exit 0 again");
  // killer: tools/kata-quarter/quarter_identity.py:46 CONST "except subprocess.CalledProcessError as e:" -> "except ZeroDivisionError as e:"
  const bare = toolRepo(REPO);
  rmSync(join(bare.dir, ".git"), { recursive: true, force: true });
  git(bare.dir, ["init", "-q"]); // a repository with no commit: HEAD names none
  const none = run(bare);
  assert.equal(none.status, 2, `no commit to name: exit 2\n${none.stdout}${none.stderr}`);
  assert.match(none.stdout, /^REFUSED: git could not name the tool's commit or read its blobs in .+ \(exit \d+\)\n$/, "refused by name, no input read");
});

// reddened by: check or count without the role tool-tree (git_tree refuses the read, exit 4), or a line identity, or the blobs noted under
// tool-tree, that do not name the commit and the files of the repository the tool runs from
// killer: tools/kata-quarter/quarter_counts.py:63 CONST "\"tool-tree\"" -> "\"oracle-output\""
// killer: tools/kata-quarter/quarter_counts.py:86 CONST "\"tool-tree\"" -> "\"oracle-output\""
test("kata_quarter_subcommands_declare_tool_tree - check and count declare the role tool-tree: each exits 0 from the helper's repository, its line identity names the commit that git_tree returns, and the list and the blobs of tools/kata-quarter/ at that commit are noted under tool-tree", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_identity.py")), `${QUARTER}/quarter_identity.py absent`);
  const t = tool(), head = gitOut(t.dir, ["rev-parse", "HEAD"]).trim(), noted = [...names(), "kata-quarter"].sort();
  for (const [sub, r] of [["check", t.run(checkArgs(join(FIXTURE, "sealed"), join(FIXTURE, "live")))], ["count", count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM]).r]] as const) {
    assert.equal(r.status, 0, `${sub}: exit 0\n${r.stdout}${r.stderr}`);
    assert.equal(IDENTITY.exec(r.stdout)?.[1], head, `${sub}: the line identity names the commit of the repository it runs from`);
    assert.deepEqual(linesOf(r.stdout).filter((l) => l.startsWith("input tool-tree ")).map((l) => l.split(" ")[2]), noted, `${sub}: the list and each blob of ${QUARTER} noted`);
  }
});

// The launch form: io_guard.py checks it at its import, which the entry runs first (plan section 5.2 (D), v6.2): the sys.flags of
// python -E -S -s -B -P, no -W, no -X, no debug build, else exit 2, its fields named on stderr. The entry adds no check of its own.
// reddened by: a sitecustomize.py that runs under the form (PYTHONPATH read, or site run), a posed name beside the frozen tool admitted, or a
// launch under another form admitted (here -s -B: site runs a sitecustomize on PYTHONPATH before io_guard, which detects it)
// killer: tools/kata-recalc/io_guard.py:47 CONST "if _OFF or " -> "if "
test("sitecustomize_beside_kata_recalc_does_not_run - under the form, a sitecustomize.py on PYTHONPATH does not run and check exits 0; posed beside kata-recalc it does not run and io_guard refuses its name, exit 4; under -s -B it runs, and io_guard refuses the launch by name, exit 2", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_identity.py")), `${QUARTER}/quarter_identity.py absent`);
  const t = toolRepo(REPO), site = mkdtempSync(join(tmpdir(), "kata-quarter-site-")), witness = join(site, "ran.txt"), entry = join(t.dir, QUARTER, ENTRY);
  writeFileSync(join(site, "sitecustomize.py"), `open(${JSON.stringify(witness)}, "w").write("ran")\n`);
  const args = checkArgs(join(FIXTURE, "sealed"), join(FIXTURE, "live")), env = { PYTHONPATH: site };
  const form = t.launch(entry, args, { env });
  assert.equal(form.status, 0, `under ${t.form.join(" ")}, PYTHONPATH set: exit 0\n${form.stdout}${form.stderr}`);
  assert.ok(!existsSync(witness), "no sitecustomize ran under the form");
  copyFileSync(join(site, "sitecustomize.py"), join(t.dir, FROZEN, "sitecustomize.py"));
  const beside = t.launch(entry, args, { env });
  rmSync(join(t.dir, FROZEN, "sitecustomize.py"));
  assert.equal(beside.status, 4, `sitecustomize.py beside kata-recalc: exit 4\n${beside.stdout}${beside.stderr}`);
  assert.match(beside.stderr, /^io_guard: refused import \['sitecustomize\.py'\]: a name of the tool's folder outside its closed list FILES/m);
  assert.ok(!existsSync(witness), "the posed sitecustomize did not run");
  const other = t.launch(entry, args, { form: ["-s", "-B"], env });
  assert.equal(other.status, 2, `under -s -B: exit 2\n${other.stdout}${other.stderr}`);
  assert.match(other.stderr, /^io_guard: refused, a launch under another form than python -E -S -s -B -P: .*ignore_environment 0/m, "the fields named");
  assert.ok(existsSync(witness), "under -s -B the sitecustomize on PYTHONPATH ran before io_guard: the form detects the launch, it does not prevent it");
});

// The passes of the count and the oracle acts (docs/G0-lot-cm5-c1c.md): each count is computed under fdlibm_log, which decides, and under
// math.log, whose decisions that differ are printed with their number; `check <act>` writes a report named by its sha256 on synthetic series.
const LOG = /^math\.log decisions that differ from the fdlibm_log pass, which decides: (\d+)$/m;
type Log = { inputs: number; inputs_differing: number; decisions_differing: number; max_ulps: number };
type Report = { equal: boolean; differences: string[]; inputs: unknown[]; result: { log?: Log; rows?: string[][]; math_log_decisions?: string[]; population?: string } };
/** check <act> args (from repo, by default the file's); the report it writes under out, which the line "report" must name by its sha256. */
const act = (name: string, out: string, args: string[], repo = tool()): { r: Run; rep: Report | null; sha: string } => {
  const r = repo.run(["check", name, ...args]), file = join(out, `${name}.json`), text = existsSync(file) ? readFileSync(file, "ascii") : "";
  const sha = createHash("sha256").update(text).digest("hex");
  assert.ok(text === "" || linesOf(r.stdout).includes(`report ${name}.json sha256 ${sha}`), `the line report names the bytes written\n${r.stdout}`);
  return { r, rep: text === "" ? null : (JSON.parse(text) as Report), sha };
};

// reddened by: the counts taken from the math.log pass, a decision that differs not printed, printed under the other pass or without
// their number, a census of the log that does not count the inputs on which the two logs differ, or a report of fdlibm_measure that
// does not list the changed decisions or the largest distance
// killer: tools/kata-quarter/quarter_core.py:155 CONST "passes[\"ln\"], passes[\"base\"]" -> "passes[\"base\"], passes[\"ln\"]"
// killer: tools/kata-quarter/quarter_core.py:160 CONST "not report.same_bits(host[x], memo[x])" -> "False"
test("fdlibm_log_pass_decides - count runs under fdlibm_log and under math.log: on the fixture they decide alike; with the port moved by 1, every input of the log differs, each changed decision is printed with their number, and the counts are those of fdlibm_log", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_oracle.py")), `${QUARTER}/quarter_oracle.py absent`);
  const [sealed, live] = [join(FIXTURE, "sealed"), join(FIXTURE, "live")], base = count(sealed, live, 1, [SYM]);
  assert.equal(base.r.status, 0, `count: exit 0\n${base.r.stdout}${base.r.stderr}`);
  assert.equal(LOG.exec(base.r.stdout)?.[1], "0", "on the fixture the two passes decide alike");
  const port = (f: string): ToolRepo => standIn(`import fdlibm_log\n_ln = fdlibm_log.log\nfdlibm_log.log = lambda x: ${f}`), moved = count(sealed, live, 1, [SYM], { repo: port("_ln(x) + 1.0") });
  assert.equal(moved.r.status, 0, `count, the port moved: exit 0, nothing stops\n${moved.r.stdout}${moved.r.stderr}`);
  const listed = linesOf(moved.r.stdout).flatMap((l) => { const m = /^decision differs (\S+) \S+ \S+: fdlibm_log (\w+), math\.log (\w+)$/.exec(l); return m ? [m.slice(1)] : []; });
  assert.ok(listed.length > 0 && LOG.exec(moved.r.stdout)?.[1] === String(listed.length), "each changed decision printed, then their number");
  const want = Object.fromEntries(base.c.rows.map((x) => [x.task_class, [x.n_test, x.k_test, x.drops_label, x.out_input]]));
  const at: Record<string, number[]> = { miss: [0, 1], covered: [0], drop: [2], out: [3] };
  for (const [c = "", now = "", was = ""] of listed) for (const [d, by] of [[now, 1], [was, -1]] as const) for (const j of at[d] ?? []) (want[c] ?? [])[j] = ((want[c] ?? [])[j] ?? NaN) + by;
  assert.deepEqual(Object.fromEntries(moved.c.rows.map((x) => [x.task_class, [x.n_test, x.k_test, x.drops_label, x.out_input]])), want, "the counts of math.log moved by each listed decision");
  const log = (moved.c as unknown as { log: Log }).log;
  assert.ok(log.inputs > 0 && log.inputs_differing === log.inputs && log.decisions_differing === listed.length, `the census: every input differs\n${JSON.stringify(log)}`);
  // killer: tools/kata-quarter/quarter_oracle.py:144 CONST "\"math_log_decisions\": res[\"differ\"]" -> "\"math_log_decisions\": []"
  // killer: tools/kata-quarter/quarter_core.py:162 CONST "max((compare_p2.ulps(host[x], memo[x]) for x in apart), default=0)" -> "0"
  const out = join(mkdtempSync(join(tmpdir(), "kata-quarter-measure-")), "m"), ma = act("fdlibm_measure", out, testBlock("m.json").args(out), port("_ln(x) * 1.25 if x > 1 else _ln(x)")), m = ma.rep?.result;
  assert.ok(m?.log && m.log.decisions_differing > 0 && m.math_log_decisions?.length === m.log.decisions_differing && m.log.max_ulps > 0, `fdlibm_measure lists each changed decision and the largest distance\n${ma.r.stdout}${ma.r.stderr}`);
  // killer: tools/kata-quarter/quarter_oracle.py:144 CONST "\"math_log_decisions\": res[\"differ\"]" -> "\"math_log_decisions\": res[\"differ\"][:1] * len(res[\"differ\"])"
  const rank = (d: string): string => { const [c = "", , at = ""] = d.split(" "); return `${String(m?.rows?.findIndex(([x]) => x === c)).padStart(2, "0")} ${at}`; };
  assert.deepEqual(m?.math_log_decisions?.map(rank), [...new Set(m?.math_log_decisions?.map(rank))].sort(), "each changed decision once, by row and instant");
  assert.ok(m?.math_log_decisions?.every((d) => /^syn-[a-z0-9-]+ kata:\S+ \d{4}-\d{2}-\d{2}T\d{2}:00:00Z: fdlibm_log (miss|covered|drop|out), math\.log (miss|covered|drop|out)$/.test(d)), "each in the form of the lines decision differs of count");
});

// reddened by: a pose at the original values that changes an output of kata_lib on the TEST block, the first report read under another
// pin or not compared, a first report that is not the first invocation's, comes from other trees or holds a folder the second does not
// read admitted, or a global of kata_lib changed in place under the pose admitted
// killer: tools/kata-quarter/quarter_core.py:125 CONST "= rec_start, rec_end, blocks" -> "= rec_start + 3_600_000, rec_end, blocks"
test("original_values_byte_equal - the first invocation reassigns nothing; the second poses kata_lib's three globals at their original values and reads the first's report under oracle-output, pinned: the outputs of build_bars, decision_times, window_at and labels_at on the TEST block are equal; the first report under another pin is refused by name", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_oracle.py")), `${QUARTER}/quarter_oracle.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-original-")), sealed = join(FIXTURE, "sealed"), spec = `${SYM}:${sha256(join(sealed, SYM, SERIES))}`;
  const name = "original_values_byte_equal", first = act(name, join(work, "1"), [sealed, join(work, "1"), "-", "-", spec]), file = join(work, "1", `${name}.json`);
  assert.equal(first.r.status, 0, `the first invocation: exit 0\n${first.r.stdout}${first.r.stderr}`);
  const second = act(name, join(work, "2"), [sealed, join(work, "2"), file, first.sha, spec]);
  assert.equal(second.r.status, 0, `the second invocation: exit 0\n${second.r.stdout}${second.r.stderr}`);
  assert.deepEqual([second.rep?.equal, second.rep?.differences], [true, []], "every output equal");
  assert.ok(linesOf(second.r.stdout).some((l) => l.startsWith(`input oracle-output ${name}.json sha256 ${first.sha} bytes `)), "the first report read under oracle-output");
  const other = act(name, join(work, "3"), [sealed, join(work, "3"), file, "0".repeat(64), spec]);
  assert.equal(other.r.status, 2, `the first report under another pin: exit 2\n${other.r.stdout}${other.r.stderr}`);
  assert.match(other.r.stdout, new RegExp(`^REFUSED: the first invocation's report refused before parsing: sha256 ${first.sha} differs from the pinned 0{64}$`, "m"));
  // killer: tools/kata-quarter/quarter_oracle.py:83 CONST " or theirs[\"result\"].get(\"invocation\") != \"reassigns nothing\"" -> ""
  const own = act(name, join(work, "4"), [sealed, join(work, "4"), join(work, "2", `${name}.json`), second.sha, spec]);
  assert.match(`${own.r.status} ${own.r.stdout}`, /^2 REFUSED: the first report is not the report of the first invocation of original_values_byte_equal$/m, "the second's own report given as the first");
  // killer: tools/kata-quarter/quarter_oracle.py:89 CONST " + [f\"{f}: not read here\" for f in sorted(set(t) - set(mine))]" -> ""
  const two = join(work, "two"), alt = `alt:${sha256(join(sealed, SYM, SERIES))}`;
  for (const f of [SYM, "alt"]) { mkdirSync(join(two, f), { recursive: true }); copyFileSync(join(sealed, SYM, SERIES), join(two, f, `${f}-15m.csv`)); copyFileSync(join(sealed, SYM, MISSING), join(two, f, MISSING)); }
  const both = act(name, join(work, "5"), [two, join(work, "5"), "-", "-", spec, alt]), one = act(name, join(work, "6"), [two, join(work, "6"), join(work, "5", `${name}.json`), both.sha, spec]);
  assert.deepEqual([both.r.status, one.r.status, one.rep?.differences], [0, 1, ["alt: not read here"]], "a folder of the first report that the second does not read");
  // killer: tools/kata-quarter/quarter_oracle.py:81 CONST "if C.kata_lib_state() != before:" -> "if False:"
  const inPlace = standIn("_bars = K.build_bars\n\n\ndef _build(candles, h_ms):\n    K.SCALE_KATAS.append(\"posed\")\n    return _bars(candles, h_ms)\n\n\nK.build_bars = _build");
  const moved = act(name, join(work, "7"), [sealed, join(work, "7"), file, first.sha, spec], inPlace);
  assert.match(`${moved.r.status} ${moved.r.stdout}`, /^2 REFUSED: kata_lib's globals are not those before the pose: the pose not restored, or a global changed in place$/m, "a global changed in place under the pose");
  // killer: tools/kata-quarter/quarter_oracle.py:85 CONST "if theirs.get(\"identity\") != dict(zip(IDENT, ident)):" -> "if False:"
  const elsewhere = act(name, join(work, "8"), [sealed, join(work, "8"), file, first.sha, spec], standIn("# another tree"));
  assert.match(`${elsewhere.r.status} ${elsewhere.r.stdout}`, /^2 REFUSED: the first report names another commit or other trees than this invocation's line identity$/m, "a first report of other trees");
});

/** The TEST block of wave 1 on a made series (hourly closes 100 and 101 in turn, as in k_test_exact_on_a_made_series) and a registry of
 *  its three region rows at qhat 0.9 and a silence row at qhat 0 (every point a miss), whose test fields are worked out from it; UT, the
 *  UTest of 1464 misses of 4392, is binom_exact.miss_upper_bound(4392, 1464, "0.05") run apart from the tool. change(rows) edits it. */
const TEST_S = Date.UTC(2026, 3, 1), TEST_E = Date.UTC(2026, 9, 1), GRID = Array.from({ length: 4392 }, (_, i) => TEST_S + i * H);
const odd = (t: number): boolean => Math.floor(t / H) % 2 === 1, fac = (t: number): number => ((t / H + 72) % 168) % 3;
type RegRow = { taskClass: string; test: { UTest: string | null; kTest: number; months: Record<string, { n: number; k: number }> } };
const UT = "0.3452271";
const testBlock = (name: string, change: (rows: RegRow[]) => void = () => undefined): { args: (out: string) => string[]; reg: string; sealed: string } => {
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-test-block-")), header = linesOf(fixtureOf("live").csv)[0], rows: string[] = [];
  for (let t = TEST_S - 404 * H; t < TEST_E; t += 900_000) rows.push(`${iso(t)},${t},${odd(t) === (t % H === 0) ? 100 : 101},101.1,99.8,${odd(t) ? 101 : 100},1,${t + 899_999},100,1,0.5,50`);
  put(join(work, "sealed"), SYM, { text: `${header}\n${rows.join("\n")}\n`, missing: { count: 0, missing: [] } });
  const months = (miss: (t: number) => boolean): Record<string, { n: number; k: number }> => {
    const m: Record<string, { n: number; k: number }> = {};
    for (const t of GRID) { const o = (m[iso(t).slice(0, 7)] ??= { n: 0, k: 0 }); o.n += 1; o.k += Number(miss(t)); }
    return m;
  };
  const test = (miss: ((t: number) => boolean) | null, region: boolean) => ({ nTest: miss ? 4392 : 0, kTest: miss ? GRID.filter(miss).length : 0,
    UTest: miss ? (GRID.every(miss) ? "1" : UT) : null, vetoed: miss !== null && region, months: miss ? months(miss) : {} });
  const reg = regWith(work, name, (rs) => {
    const out = rs.slice(0, 4).map((x, i) => ({ ...x, calib: { qhat: i < 3 ? 0.9 : 0, status: i < 3 ? "region" : "silence" }, drops: { test: 0 },
      test: test([(t: number) => fac(t) === 0, null, (t: number) => !odd(t) && fac(t) < 2, () => true][i] ?? null, i < 3) }));
    change(out as unknown as RegRow[]);
    return out;
  });
  return { reg, sealed: join(work, "sealed"), args: (out) => [reg, sha256(reg), join(work, "sealed"), out, `${SYM}:${sha256(join(work, "sealed", SYM, SERIES))}`] };
};

// reddened by: a field of the count on the TEST block off the registry (nTest, kTest, test.months, drops.test, UTest worked out apart from
// the tool, its "1" when every point misses, vetoed by the calibration status) admitted, or one equal reported as a difference; a row
// with a qhat left out of the comparison or of result.rows; the inputs not noted in the report; or fdlibm_measure judging what it measures
// killer: tools/kata-quarter/quarter_oracle.py:113 CONST "\"drops.test\": got[\"drops_label\"]" -> "\"drops.test\": got[\"out_input\"]"
// killer: tools/kata-quarter/quarter_oracle.py:113 CONST "\"months\": got[\"months\"], " -> ""
// killer: tools/kata-quarter/quarter_oracle.py:104 CONST "E.miss_upper_bound(n, k, recalc_p2.DELTA)" -> "E.miss_upper_bound(n, k, \"0.10\")"
// killer: tools/kata-quarter/quarter_oracle.py:104 CONST "\"1\" if k == n else " -> ""
// killer: tools/kata-quarter/quarter_oracle.py:114 CONST "r[\"calib\"][\"status\"] == \"region\" and " -> ""
// killer: tools/kata-quarter/quarter_core.py:38 CONST "or r[\"calib\"][\"qhat\"] is None:" -> "or r[\"calib\"][\"qhat\"] is None or r[\"horizon\"] == \"4h\":"
// killer: tools/kata-quarter/quarter_oracle.py:148 CONST "[[d[\"role\"], d[\"name\"], d[\"sha256\"], d[\"bytes\"]] for d in io_guard.inputs()]" -> "[]"
// killer: tools/kata-quarter/quarter_oracle.py:142 CONST "[] if name == ACTS[3]" -> "[] if False"
test("equals_registry_on_test_block - on the TEST block of a made series the count gives the registry's nTest, kTest, test.months, drops.test, UTest and vetoed for its four rows with a qhat, a silence row whose every point misses among them, each named in the report with the inputs read; a month, a kTest and a UTest changed are named, exit 1; fdlibm_measure reports the same census of the log, exit 0", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_oracle.py")), `${QUARTER}/quarter_oracle.py absent`);
  const name = "equals_registry_on_test_block", work = mkdtempSync(join(tmpdir(), "kata-quarter-l-o1-")), b = testBlock("ok.json"), ok = act(name, join(work, "1"), b.args(join(work, "1")));
  assert.equal(ok.r.status, 0, `every field equal: exit 0\n${ok.r.stdout}${ok.r.stderr}`);
  // killer: tools/kata-quarter/quarter_oracle.py:143 CONST "[[r[\"taskClass\"], r[\"key\"]] for r, _, _ in rows]" -> "[[r[\"taskClass\"], \"\"] for r, _, _ in rows]"
  const pairs = (JSON.parse(readFileSync(b.reg, "utf8")) as { rows: { taskClass: string; key: string }[] }).rows.slice(0, 4).map((x) => [x.taskClass, x.key]);
  assert.deepEqual([ok.rep?.equal, linesOf(ok.r.stdout).at(-2), ok.rep?.result.rows], [true, "VERDICT: GREEN", pairs], "each row compared named by its task class and its key");
  // killer: tools/kata-quarter/quarter_oracle.py:143 CONST " \"population\": POPULATION," -> ""
  assert.equal(ok.rep?.result.population, "the inputs of the port on this tool's own path, the scale kata and the labels of the rows compared on the block counted; not the census of report.run_passes over the 280 cells (report.py l.14-15), which this one does not replace", "the population that the census counts, named");
  const noted = (role: string, p: string): unknown[] => [role, basename(p), sha256(p), readFileSync(p).length];
  assert.deepEqual(ok.rep?.inputs.filter((i) => Array.isArray(i) && i[0] !== "tool-tree"), [noted("recorder", join(b.sealed, SYM, MISSING)), noted("registry", b.reg), noted("series", join(b.sealed, SYM, SERIES))], "the inputs read, noted");
  const bad = act(name, join(work, "2"), testBlock("k.json", (rows) => {
    const [a, , m, u] = rows, may = a?.test.months["2026-05"];
    if (may && m && u) { may.k += 1; m.test.kTest += 1; u.test.UTest = UT; }
  }).args(join(work, "2")));
  assert.equal(bad.r.status, 1, `a month, a kTest and a UTest changed: exit 1\n${bad.r.stdout}`);
  assert.deepEqual(bad.rep?.differences.map((d) => /^(\S+) \S+ (\S+):/.exec(d)?.slice(1).join(" ")), ["syn-range-1h months", "syn-mae-down-1h kTest", "syn-mae-up-1h UTest"]);
  const measure = act("fdlibm_measure", join(work, "3"), b.args(join(work, "3")));
  assert.equal(measure.r.status, 0, `fdlibm_measure: exit 0\n${measure.r.stdout}${measure.r.stderr}`);
  assert.ok((measure.rep?.result.log?.inputs ?? 0) > 0, "the inputs of the log counted");
  assert.deepEqual(measure.rep?.result.log, ok.rep?.result.log, "the census of the TEST block, as the act on the registry counts it");
});

// reddened by: a pseudo quarter other than [2026-07-01, 2026-10-01), or its counts held to other months of the registry than 2026-07..09
// killer: tools/kata-quarter/quarter_oracle.py:39 CONST "K.utc_ms(2026, 7, 1)" -> "K.utc_ms(2026, 6, 1)"
test("pseudo_quarter_2026_07_09 - the count on [2026-07-01, 2026-10-01) equals the sum of the months 2026-07 to 2026-09 of test.months; a count of 2026-08 changed is named, exit 1; one of 2026-06 is not read", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_oracle.py")), `${QUARTER}/quarter_oracle.py absent`);
  const name = "pseudo_quarter_2026_07_09", work = mkdtempSync(join(tmpdir(), "kata-quarter-l-o2-"));
  for (const [month, status] of [["", 0], ["2026-06", 0], ["2026-08", 1]] as const) {
    const out = join(work, month || "none"), r = act(name, out, testBlock(`${month || "none"}.json`, (rows) => { const m = rows[0]?.test.months[month]; if (m) m.n += 1; }).args(out));
    assert.equal(r.r.status, status, `a count of ${month || "no month"} changed: exit ${status}\n${r.r.stdout}${r.r.stderr}`);
    assert.deepEqual(r.rep?.differences.map((d) => d.replace(/ kata:\S+/, "")), status ? ["syn-range-1h n: tool 2208, registry 2209"] : [], "the differences named");
  }
});

// The evidence of the quarter (docs/G0-lot-cm5-c2.md): count writes it into <out dir>/quarter-<k>.json, one line of report.canonical of
// the frozen tool, format kata-quarter-counts-v1, and names it by its sha256 on the line "evidence".
const EVIDENCE = ["format", "grid", "halts", "identity", "log", "pose", "quarter", "registry_sha256", "rows", "series", "served_history_sha256"];
const ROW = ["alpha", "calib_attempt", "drops_label", "fires", "horizon", "k_test", "key", "n_test", "out_input", "prudent", "served_from", "served_tables", "served_to", "task_class", "u_test"];
type Prudent = { n_test: number; k_test: number; fires: boolean | string };
type Evidence = { format: string; rows: (Row & { key: string; alpha: string; u_test: string | null; fires: boolean; prudent: Prudent })[]; identity: Record<string, string>; series: Record<string, object> } & Record<string, unknown>;
/** count on Q_1, its evidence under a new folder: the run, the bytes of the evidence (empty when none is written) and the folder. */
const evidenceOf = (sealed: string, live: string, o: { reg?: string; repo?: ToolRepo; served?: [string, string]; core?: [string, string] } = {}): { r: Run; raw: Buffer; out: string } => {
  const out = join(mkdtempSync(join(tmpdir(), "kata-quarter-evidence-")), "e"), { r } = count(sealed, live, 1, [SYM], { ...o, out }), file = join(out, "quarter-1.json");
  return { r, raw: existsSync(file) ? readFileSync(file) : Buffer.alloc(0), out };
};

// reddened by: a quarter whose LIVE read accounts for no slot up to E_k (a record cut before E_1) counted, or refused otherwise than by
// its name (the merge's undeclared gap), an evidence written for it, or a last slot declared missing taken for an open quarter
// killer: tools/kata-quarter/quarter_evidence.py:37 CONST "series_end >= e_k" -> "True"
test("refuses_open_quarter - count refuses by name, exit 2 and no evidence written, a quarter whose LIVE series accounts for no slot from 2026-12-01 to E_1; the same quarter with its last slot declared missing is closed and counted", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_evidence.py")), `${QUARTER}/quarter_evidence.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-open-")), q1 = fullQ1(work);
  const open = evidenceOf(join(FIXTURE, "sealed"), put(join(work, "open"), SYM, edit(readFileSync(join(q1, SYM, SERIES), "utf8"), { end: Date.UTC(2026, 11, 1) })));
  assert.equal(open.r.status, 2, `a LIVE series cut at 2026-12-01: exit 2\n${open.r.stdout}${open.r.stderr}`);
  assert.equal(open.r.stdout, "REFUSED: quarter open: the LIVE series of syn accounts for no slot from 2026-12-01T00:00:00Z, before E_k 2027-01-01T00:00:00Z: a quarter is counted once it is over and recorded to its end\n", "refused by name, before the merge");
  assert.ok(!existsSync(open.out), "no evidence written");
  const last = evidenceOf(join(FIXTURE, "sealed"), fullQ1(mkdtempSync(join(tmpdir(), "kata-quarter-open-")), { drop: [E1 - 900_000] }));
  assert.equal(last.r.status, 0, `the candle at E_1 - 15 min declared missing: exit 0\n${last.r.stdout}${last.r.stderr}`);
  assert.ok(last.raw.length > 0, "its evidence written");
});

// reddened by: an evidence whose keys are not the closed lists (a key more, such as the instants of the misses, or one less), the months
// of the misses in it, an identity block that is not the line identity or that is mixed with the counts (the evidence of another commit
// not the same but for it), a value that is not an integer, a string, a boolean or null, a file that is not one ASCII line, not named by
// its sha256 on the line evidence, or holding a word the public gate refuses
// killer: tools/kata-quarter/quarter_evidence.py:26 CONST "EVIDENCE_KEYS = (" -> "EVIDENCE_KEYS = (\"miss_times\", "
// killer: tools/kata-quarter/quarter_evidence.py:29 CONST "\"prudent\")" -> "\"prudent\", \"months\")"
// killer: tools/kata-quarter/quarter_counts.py:106 CONST "\"served_history_sha256\": hpin" -> "\"served_history_sha256\": pin"
test("quarter_evidence_closed_canonical - count writes the evidence of Q_1 into <out dir>/quarter-1.json, named by its sha256 on the line evidence: one ASCII line of the closed format kata-quarter-counts-v1, its keys and each row's, integers, strings, booleans and null only, no month, price or instant of a miss; its identity block is the line identity, apart: the evidence of another commit is the same but for it; the public vocabulary gate finds nothing", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_evidence.py")), `${QUARTER}/quarter_evidence.py absent`);
  const h = history(), { r, raw, out } = evidenceOf(join(FIXTURE, "sealed"), join(FIXTURE, "live"), { served: h }), text = raw.toString("ascii");
  assert.equal(r.status, 0, `count on the fixture: exit 0\n${r.stdout}${r.stderr}`);
  assert.ok(raw.length > 0 && raw.every((b) => b >= 0x20 && b < 0x7f), "one line of printable ASCII, no line feed");
  assert.ok(linesOf(r.stdout).includes(`evidence quarter-1.json sha256 ${sha256(join(out, "quarter-1.json"))}`), `named by its sha256\n${r.stdout}`);
  const ev = JSON.parse(text) as Evidence;
  assert.deepEqual([Object.keys(ev), ev.format], [EVIDENCE, "kata-quarter-counts-v1"], "the closed keys, sorted, and the format");
  assert.deepEqual(ev.rows.map((x) => [x.task_class, Object.keys(x)]), ["syn-range-1h", "syn-range-4h", "syn-mae-down-1h"].map((c) => [c, ROW]), "each region row, its closed keys");
  const line = JSON.parse(linesOf(r.stdout).find((l) => l.startsWith("{")) ?? "null") as Record<string, unknown> & { log: Record<string, unknown> }, log = Object.fromEntries(Object.entries(line.log).filter(([k]) => k !== "max_ulps"));
  assert.deepEqual([ev.registry_sha256, ev.served_history_sha256, ev.series], [sha256(REG), sha256(h[0]), { [SYM]: { complete: true, expected: 8832, gaps: 3, present: 8829,
    quarter_sha256: sha256(join(FIXTURE, "live", SYM, SERIES)), sealed_sha256: sha256(join(FIXTURE, "sealed", SYM, SERIES)) } }], "the pins of the registry and of the two reads, the three gaps of the LIVE series, its completeness");
  assert.deepEqual([ev.halts, ev.grid, ev.pose, ev.log, Object.keys(ev.log as object)], [line.halts, line.grid, line.pose, log, ["decides", "decisions_differing", "inputs", "inputs_differing"]], "the halts, the grid, the pose and the census of the log, max_ulps apart");
  const id = IDENTITY.exec(r.stdout) ?? [];
  assert.deepEqual(ev.identity, { commit: id[1], kata_recalc_tree_sha256: id[2], kata_quarter_manifest_sha256: id[3] }, "the identity block, the line identity");
  const leaves = (v: unknown): unknown[] => (v !== null && typeof v === "object" ? Object.values(v).flatMap(leaves) : [v]);
  assert.deepEqual(leaves(ev).filter((v) => !(v === null || typeof v === "boolean" || typeof v === "string" || Number.isSafeInteger(v))), [], "no double");
  const keys = (v: unknown): string[] => (v !== null && typeof v === "object" ? Object.entries(v).flatMap(([k, x]) => [...(Array.isArray(v) ? [] : [k]), ...keys(x)]) : []);
  assert.deepEqual(keys(ev).filter((k) => /month|miss|price|open|close|high|low|time|ulp/i.test(k)), [], "no month, miss, price or instant of a miss");
  assert.deepEqual(vocabularyHits(text), [], "the public vocabulary gate");
  const other = evidenceOf(join(FIXTURE, "sealed"), join(FIXTURE, "live"), { repo: standIn("# another tree") });
  const { identity: a, ...mine } = ev, { identity: b, ...theirs } = JSON.parse(other.raw.toString("ascii")) as Evidence;
  assert.deepEqual([theirs, b.commit === a.commit, b.kata_quarter_manifest_sha256 === a.kata_quarter_manifest_sha256, b.kata_recalc_tree_sha256 === a.kata_recalc_tree_sha256], [mine, false, false, true], "another commit: the same evidence, another identity, the frozen tool's tree the same");
});

// reddened by: the evidence written by another writer than report.canonical (kata_lib.js_json_compact keeps the order of insertion), or
// a writing of report.canonical that is not that of canonicalJson on the values of an evidence
// killer: tools/kata-quarter/quarter_evidence.py:89 CONST "R.canonical(value)" -> "Q.K.js_json_compact(value)"
test("canonical_writer_equals_canonical_json - the bytes of the evidence that report.canonical writes are those of canonicalJson (scripts/spec-publish.mjs) on its values", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_evidence.py")), `${QUARTER}/quarter_evidence.py absent`);
  const { r, raw } = evidenceOf(join(FIXTURE, "sealed"), join(FIXTURE, "live")), text = raw.toString("ascii");
  assert.equal(r.status, 0, `count on the fixture: exit 0\n${r.stdout}${r.stderr}`);
  assert.equal(canonicalJson(JSON.parse(text)), text, "the same bytes");
});

// reddened by: a u_test that is not the exact bound of binom_exact under the veto level 0.05 (another level, another k, the "1" of
// k = n or the null of n = 0 lost), or a fire not by the exact tail at the row's alpha
// killer: tools/kata-quarter/quarter_evidence.py:45 CONST "alpha, recalc_p2.DELTA" -> "\"0.45\", recalc_p2.DELTA"
// killer: tools/kata-quarter/quarter_evidence.py:51 CONST "O.u_test(r[\"n_test\"], r[\"k_test\"])" -> "O.u_test(r[\"n_test\"], 0)"
test("u_test_and_fires_of_each_row - on hourly closes 100 and 101 in turn, the evidence gives each row the exact bound worked out apart from the tool (binom_exact.miss_upper_bound under 0.05: 0.3502186 for 736 misses of 2208, 0.0013559 for none), \"1\" when every point misses, null with no point, and fires by the exact tail at its alpha 0.01", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_evidence.py")), `${QUARTER}/quarter_evidence.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-u-test-")), header = linesOf(fixtureOf("live").csv)[0], rows: string[] = [];
  for (let t = S1 - 404 * H; t < E1; t += 900_000) rows.push(`${iso(t)},${t},${odd(t) === (t % H === 0) ? 100 : 101},101.1,99.8,${odd(t) ? 101 : 100},1,${t + 899_999},100,1,0.5,50`);
  const at = (from: number, to: number): Series => ({ text: `${header}\n${rows.filter((l) => { const t = Number(l.split(",")[1]); return t >= from && t < to; }).join("\n")}\n`, missing: { count: 0, missing: [] } });
  const [sealed, live] = [put(join(work, "sealed"), SYM, at(S1 - 404 * H, S1)), put(join(work, "live"), SYM, at(S1, E1))];
  const run = (q: number[]): unknown[] => {
    const e = evidenceOf(sealed, live, { reg: regWith(work, `q-${q.join("-")}.json`, (rs) => rs.map((x, i) => ({ ...x, calib: { qhat: q[i] ?? 0 } }))) }), text = e.raw.toString("ascii");
    assert.equal(e.r.status, 0, `count with the qhats ${q.join(", ")}: exit 0\n${e.r.stdout}${e.r.stderr}`);
    assert.equal(canonicalJson(JSON.parse(text)), text, "a null u_test and booleans written as canonicalJson writes them");
    return (JSON.parse(text) as Evidence).rows.map((x) => [x.task_class, x.n_test, x.k_test, x.u_test, x.fires]);
  };
  assert.deepEqual(run([0.9, 0.9, 1e9]), [["syn-range-1h", 2208, 736, "0.3502186", true], ["syn-range-4h", 0, 0, null, false], ["syn-mae-down-1h", 2208, 0, "0.0013559", false]], "a bound that fires, a row with no point, a bound with no miss");
  assert.deepEqual(run([0, 0.9, 0]), [["syn-range-1h", 2208, 2208, "1", true], ["syn-range-4h", 0, 0, null, false], ["syn-mae-down-1h", 2208, 2208, "1", true]], "every point a miss: \"1\"");
});

// The served history (lot c2b): count reads kata-served-history-v1 whole under the role served-history, pinned, class by class; a row is
// counted when its class is served at an instant of Q_k, with the span of its service in Q_k (served_from, served_to: [from, to)).
const days = (...d: [string, string[]][]): [string, string[]][] => d;
const refusedBy = (served: [string, string]): Run => count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM], { served }).r;

// reddened by: a gap admitted (a class held by a deployment before and after one that has no line for it), a pair written twice or a
// deployment whose lines differ admitted, a line that carries a list of classes or an unknown key admitted, a history parsed under
// another pin, the absence before the first deployment of a class taken for a gap, a row counted though its class is not served in Q_k,
// a span of service off the deployments' t_f, or the history not noted under the role served-history; a key twice in one object, bytes
// off the writer's canonical text or a field off its form admitted, deployments out of order, t_e after t_f, a quarter with no served row
// counted, or a row's tables not those of its lines that meet Q_k
// killer: tools/kata-quarter/quarter_load.py:202 CONST "len({k for k, _ in pairs}) != len(pairs)" -> "False"
// killer: tools/kata-quarter/quarter_load.py:165 CONST "if data != (" -> "if False and data != ("
// killer: tools/kata-quarter/quarter_load.py:157 CONST " or not all(re.fullmatch(p, x[f]) for f, p in FORMS.items())" -> ""
// killer: tools/kata-quarter/quarter_load.py:158 CONST "not day(x[\"release_dir\"]) or " -> ""
// killer: tools/kata-quarter/quarter_load.py:157 CONST "x[\"format\"] != \"kata-served-history-v1\" or " -> ""
// killer: tools/kata-quarter/quarter_load.py:157 CONST " or any(type(x[f]) is not str for f in HISTORY)" -> ""
// killer: tools/kata-quarter/quarter_load.py:158 CONST " or second(x[\"t_e\"]) > second(x[\"t_f\"])" -> ""
// killer: tools/kata-quarter/quarter_load.py:133 CONST "return ms if iso(ms) == s else None" -> "return ms"
// killer: tools/kata-quarter/quarter_load.py:168 CONST "any(a >= b for a, b in" -> "any(a > b for a, b in"
// killer: tools/kata-quarter/quarter_counts.py:94 CONST "if not rows:" -> "if False:"
// killer: tools/kata-quarter/quarter_load.py:185 CONST "[m[2] for m in met]" -> "[s[2] for s in spans]"
// killer: tools/kata-quarter/quarter_load.py:177 CONST "if gap:" -> "if False:"
// killer: tools/kata-quarter/quarter_load.py:153 CONST "sorted(x) != sorted(HISTORY)" -> "False"
// killer: tools/kata-quarter/quarter_load.py:155 CONST "type(x[\"task_class\"]) is not str" -> "False"
// killer: tools/kata-quarter/quarter_load.py:161 CONST "x[\"task_class\"] in d[\"classes\"] or " -> ""
// killer: tools/kata-quarter/quarter_load.py:145 CONST "got != pin" -> "False"
// killer: tools/kata-quarter/quarter_counts.py:93 CONST "rows = [x for x in rows if service[x[0][\"taskClass\"]]]" -> "rows = rows"
// killer: tools/kata-quarter/quarter_load.py:184 CONST "min(e_k, b)" -> "e_k"
test("served_history_reader_refuses_gap - count reads the served history whole under the role served-history, class by class: each row counted with its span of service in Q_k, a class served after Q_k left out, a class absent before its first deployment admitted; a gap, a pair twice, a deployment whose lines differ, a list of classes, an unknown key or another pin refused by name, exit 2", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_load.py")), `${QUARTER}/quarter_load.py absent`);
  // syn-range-4h withdrawn by the deployment of 2026-11-10, syn-mae-down-1h served from it: no gap, only the spans of Q_1 that they meet
  const spans = history(days(["2026-09-01", ["syn-range-1h", "syn-range-4h"]], ["2026-11-10", ["syn-range-1h", "syn-mae-down-1h"]], ["2027-01-05", ["syn-range-1h", "syn-mae-down-1h"]]));
  const { r, raw } = evidenceOf(join(FIXTURE, "sealed"), join(FIXTURE, "live"), { served: spans }), t = (d: string, c: string): string[] => [hex(`table ${d} ${c}`)];
  assert.equal(r.status, 0, `count under a history of three deployments: exit 0\n${r.stdout}${r.stderr}`);
  assert.deepEqual((JSON.parse(raw.toString("ascii")) as Evidence).rows.map((x) => [x.task_class, x.served_from, x.served_to, x.served_tables]), [["syn-range-1h", iso(S1), iso(E1),
    [...t("2026-09-01", "syn-range-1h"), ...t("2026-11-10", "syn-range-1h")]], ["syn-range-4h", iso(S1), "2026-11-10T11:00:00Z", t("2026-09-01", "syn-range-4h")],
    ["syn-mae-down-1h", "2026-11-10T11:00:00Z", iso(E1), t("2026-11-10", "syn-mae-down-1h")]], "each row's service in Q_1, from the t_f of its deployments, and the table of each of its lines that meets Q_1");
  assert.ok(linesOf(r.stdout).includes(`input served-history served-history.json sha256 ${spans[1]} bytes ${readFileSync(spans[0]).length}`), `noted under its role\n${r.stdout}`);
  const later = count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM], { served: history(days(["2026-09-01", ["syn-range-1h"]], ["2027-01-05", ["syn-range-1h", "syn-range-4h"]])) });
  assert.equal(later.r.status, 0, `count with two classes served after Q_1: exit 0\n${later.r.stdout}${later.r.stderr}`);
  assert.deepEqual(later.c.rows.map((x) => x.task_class), ["syn-range-1h"], "only the row whose class is served in Q_1 is counted");
  const text = (lines: object[]): string => `[\n${lines.map(canonicalJson).join(",\n")}\n]\n`, one = served("2026-09-01", "syn-range-1h");
  const [CANON, FORM, ORDER] = ["served history: not the writer's canonical text of its lines", "not a kata-served-history-v1 line (format, fields of their form, t_e <= t_f)", "deployments not in the order of their t_e and t_f"];
  const cases: [string, [string, string], string][] = [
    ["a gap", history(days(["2026-09-01", ["syn-range-1h"]], ["2026-10-20", ["syn-mae-down-1h"]], ["2026-11-10", ["syn-range-1h", "syn-mae-down-1h"]])),
      "served history: gap, syn-range-1h is served before and after contract-1.1.0-tables-2026-10-20, which has no line for it"],
    ["a pair twice", history([], text([one, one])), "served history: contract-1.1.0-tables-2026-09-01 syn-range-1h: a pair written twice, or a deployment whose lines differ "],
    ["a deployment whose lines differ", history([], text([one, { ...served("2026-09-01", "syn-range-4h"), t_f: "2026-09-01T12:00:00Z" }])), "syn-range-4h: a pair written twice, or a deployment whose lines differ on merge_commit"],
    ["a list of classes", history([], text([{ ...one, task_class: ["syn-range-1h", "syn-range-4h"] }])), "served history: a line that carries a list of classes, or no class: ['syn-range-1h', 'syn-range-4h']"],
    ["an unknown key", history([], text([{ ...one, note: "x" }])), "served history: a line whose fields are not the closed ['format', 'release_dir', 'task_class', "],
    ["another pin", [spans[0], "0".repeat(64)], `served history refused before parsing: sha256 ${spans[1]} differs from the pinned ${"0".repeat(64)}`],
    ["a key twice in one object", history([], text([one]).replace("}\n", ',"t_f":"2026-12-01T11:00:00Z"}\n')), "served history: a key written twice in one object: ['ca_record_sha256', "],
    ["a deployment split around another", history([], text([one, served("2026-10-20", "syn-range-1h"), served("2026-09-01", "syn-range-4h")])), CANON],
    ["lines not sorted by task_class", history([], text([served("2026-09-01", "syn-range-4h"), one])), CANON], ["a pretty-printed array", history([], JSON.stringify([one], null, 2)), CANON],
    ["a release_dir off the writer's form", history([], text([{ ...one, release_dir: "x" }])), `served history: 'x' syn-range-1h: ${FORM}`],
    ["a release_dir of no real day", history([], text([{ ...one, release_dir: "contract-1.1.0-tables-2026-02-30" }])), FORM],
    ["a merge_commit off its form", history([], text([{ ...one, merge_commit: one.merge_commit.toUpperCase() }])), FORM],
    // KQ-SERVED-FORMS-TEST-1: the forms of release_dir and task_class, the 64 hexadecimals of the digests, the year from 100 of the day
    // killer: tools/kata-quarter/quarter_load.py:188 CONST "r\"contract-1\\.1\\.0-tables-[0-9]{4}-[0-9]{2}-[0-9]{2}\"" -> "r\".*\""
    ["a release_dir off the prefix with a real day", history([], text([{ ...one, release_dir: "contract-9.9.9-tables-2026-09-01" }])), FORM],
    // killer: tools/kata-quarter/quarter_load.py:188 CONST "\"task_class\": \"[a-z0-9]+(-[a-z0-9]+)*\"" -> "\"task_class\": \".+\""
    ["a task_class in capitals", history([], text([{ ...one, task_class: "SYN-RANGE-1H" }])), FORM],
    // killer: tools/kata-quarter/quarter_load.py:189 CONST "\"[0-9a-f]{64}\")}" -> "\"[0-9a-fA-F]{64}\")}"
    ["a policy_table_sha256 in capitals", history([], text([{ ...one, policy_table_sha256: one.policy_table_sha256.toUpperCase() }])), FORM],
    // killer: tools/kata-quarter/quarter_load.py:195 CONST ".year >= 100" -> ".year >= 1"
    ["a release_dir of the year 0099", history([], text([{ ...one, release_dir: "contract-1.1.0-tables-0099-09-01" }])), FORM],
    ["two deployments of one t_e", history([], render(null, [one, { ...served("2026-09-02", "syn-range-4h"), t_e: one.t_e }])), ORDER],
    ["a t_f before the one of the deployment before", history([], render(null, [{ ...one, t_f: "2026-09-10T00:00:00Z" }, served("2026-09-05", "syn-range-1h")])), ORDER],
    ["t_e after t_f", history([], text([{ ...one, t_e: "2026-09-01T12:00:00Z" }])), FORM], ["another format", history([], text([{ ...one, format: "kata-served-history-v2" }])), FORM],
    ["a number in a field", history([], text([{ ...one, probe_record_sha256: 5 }])), FORM], ["a second written otherwise", history([], text([{ ...one, t_e: "2026-9-1T10:00:00Z" }])), FORM],
    ["a class foreign to the registry", history(days(["2026-09-01", ["alt-range-1h"]])), "no region row of the registry is served at an instant of quarter 1 by the served history: nothing to count"]];
  for (const [name, h, re] of cases) {
    const x = refusedBy(h);
    assert.equal(x.status, 2, `${name}: exit 2\n${x.stdout}${x.stderr}`);
    assert.ok(x.stdout.startsWith("REFUSED: ") && x.stdout.includes(re), `${name}: refused by name\n${x.stdout}`);
  }
});

// reddened by: a symbol's completeness not in counts of the LIVE read (present, expected) or its threshold off 1000 present >= 999
// expected (8 candles absent of 8832 complete, 9 not), or a prudent variant that is not (n_test + d, k_test + d) with d the drops and the
// instants out, its fire not the guard's vetoFires (as fixtures/kata-quarter/veto-vectors.json holds it), or not "out_of_domain" above LIVE_N_MAX
// killer: tools/kata-quarter/quarter_evidence.py:53 CONST "1000 * s[\"present\"] >= 999 * s[\"expected\"]" -> "1000 * s[\"present\"] >= 998 * s[\"expected\"]"
// killer: tools/kata-quarter/quarter_evidence.py:62 CONST "d = r[\"drops_label\"] + r[\"out_input\"]" -> "d = r[\"drops_label\"]"
// killer: tools/kata-quarter/quarter_evidence.py:64 CONST "if n <= LIVE_N_MAX[r[\"horizon\"]] else" -> "if True else"
test("completeness_and_prudent_variant - each symbol's completeness in counts, complete when 1000 present >= 999 expected (8 candles absent of 8832 complete, 9 not); each row's prudent pair (n_test + d, k_test + d), d its drops and its instants out, fired by the guard's vetoFires, out_of_domain above LIVE_N_MAX", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_evidence.py")), `${QUARTER}/quarter_evidence.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-complete-")), at = (i: number): number => Date.UTC(2026, 10, 2 + i, 6, 15);
  // The fire read as data from the veto vectors, which test/kata-quarter-vectors.test.ts (test:main) holds equal to the guard's vetoFires and uTest.
  const veto = JSON.parse(readFileSync(join(FIXTURE, "veto-vectors.json"), "ascii")) as { alpha: string; vectors: Record<string, [number, number, string, boolean][]> };
  /** k*(n) of each horizon: the k whose pair fires while k - 1 does not; (n, k) fires iff k >= k*(n), "out_of_domain" past the vectors' n. */
  const star = new Map(Object.entries(veto.vectors).map(([h, rows]) => {
    const fire = new Map(rows.map((v) => [`${v[0]} ${v[1]}`, v[3]]));
    return [h, new Map(rows.filter((v) => v[3] && fire.get(`${v[0]} ${v[1] - 1}`) === false).map((v) => [v[0], v[1]]))];
  }));
  const fires = (h: string, n: number, k: number): boolean | "out_of_domain" => { const s = star.get(h)?.get(n); return s === undefined ? "out_of_domain" : k >= s; };
  for (const [absent, complete] of [[8, true], [9, false]] as const) {
    const { r, raw } = evidenceOf(join(FIXTURE, "sealed"), fullQ1(join(work, String(absent)), { drop: Array.from({ length: absent }, (_, i) => at(i)) }));
    assert.equal(r.status, 0, `${absent} candles absent: exit 0\n${r.stdout}${r.stderr}`);
    const ev = JSON.parse(raw.toString("ascii")) as Evidence, s = ev.series[SYM] as Record<string, unknown>;
    assert.deepEqual([s.present, s.expected, s.complete], [8832 - absent, 8832, complete], `${absent} candles absent: complete ${complete}`);
    for (const x of ev.rows) {
      const d = x.drops_label + x.out_input;
      assert.deepEqual([x.alpha, x.prudent], [veto.alpha, { n_test: x.n_test + d, k_test: x.k_test + d, fires: fires(x.horizon, x.n_test + d, x.k_test + d) }], `${x.task_class}: the prudent pair and its fire, at the vectors' alpha`);
    }
    assert.ok(ev.rows.some((x) => x.drops_label > 0 && x.out_input > 0 && !x.fires && x.prudent.fires === true), "a row that does not fire, whose prudent pair fires");
  }
  const capped = toolRepo(REPO, (dir) => writeFileSync(join(dir, QUARTER, "quarter_evidence.py"), `${read("quarter_evidence.py")}\nLIVE_N_MAX = {"1h": 2207, "4h": 552}\n`));
  const ev = JSON.parse(evidenceOf(join(FIXTURE, "sealed"), join(FIXTURE, "live"), { repo: capped }).raw.toString("ascii")) as Evidence;
  assert.deepEqual(ev.rows.map((x) => [x.task_class, x.prudent.fires === "out_of_domain"]), [["syn-range-1h", true], ["syn-range-4h", false], ["syn-mae-down-1h", true]], "above LIVE_N_MAX: out_of_domain");
});

// reddened by: vectors that are not those of the file (another grid of k, another fire or bound, another writer), a fire held off its
// threshold (n 2208: k = 30 does not fire, k = 31 fires), or a file named otherwise than by its sha256, the pin of its provenance
// killer: tools/kata-quarter/quarter_evidence.py:75 CONST "(star - 1, star, star + 1)" -> "(star, star + 1)"
// killer: tools/kata-quarter/quarter_evidence.py:45 CONST "alpha, recalc_p2.DELTA" -> "alpha, \"0.5\""
test("veto_vectors_written_again - vectors writes fixtures/kata-quarter/veto-vectors.json again byte for byte, 8278 pairs named by the sha256 of its provenance; at n 2208, k 30 does not fire and k 31 fires", () => {
  assert.ok(existsSync(join(FIXTURE, "veto-vectors.json")), "fixtures/kata-quarter/veto-vectors.json absent");
  const t = tool(), out = join(mkdtempSync(join(tmpdir(), "kata-quarter-vectors-")), "v"), r = t.launch(join(t.dir, QUARTER, ENTRY), ["vectors", out], { timeout: 600_000 });
  assert.equal(r.status, 0, `vectors: exit 0\n${r.stdout}${r.stderr}`);
  const pin = /^- `veto-vectors\.json` `([0-9a-f]{64})`$/m.exec(readFileSync(join(FIXTURE, "PROVENANCE-veto-vectors.md"), "utf8"))?.[1];
  assert.ok(linesOf(r.stdout).includes(`vectors veto-vectors.json sha256 ${String(pin)} pairs 8278`), `named by the pin of its provenance\n${r.stdout}`);
  assert.ok(readFileSync(join(out, "veto-vectors.json")).equals(readFileSync(join(FIXTURE, "veto-vectors.json"))), "the same bytes as the fixture");
  const v = JSON.parse(readFileSync(join(out, "veto-vectors.json"), "ascii")) as { vectors: Record<string, unknown[][]> };
  assert.deepEqual(v.vectors["1h"]?.filter((x) => x[0] === 2208), [[2208, 30, "0.0183840", false], [2208, 31, "0.0189017", true], [2208, 32, "0.0194182", true]], "the threshold at n 2208");
});

// reddened by: the evidence written straight under its name, so that a write cut short (here a file size limit, Linux) leaves a file
// named as the evidence that is not one, or a part left beside a whole evidence
// killer: tools/kata-quarter/quarter_evidence.py:89 CONST "os.path.join(out, f\"{name}.part\")" -> "os.path.join(out, name)"
test("evidence_written_whole_or_not_at_all - the evidence is written as quarter-1.json.part then renamed: a run leaves quarter-1.json alone; a write cut short by a file size limit exits 2 and leaves no quarter-1.json", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_evidence.py")), `${QUARTER}/quarter_evidence.py absent`);
  const ok = evidenceOf(join(FIXTURE, "sealed"), join(FIXTURE, "live"));
  assert.deepEqual([ok.r.status, readdirSync(ok.out)], [0, ["quarter-1.json"]], `one file, the evidence\n${ok.r.stdout}${ok.r.stderr}`);
  if (process.platform !== "linux") return; // ulimit -f: a Linux shell's (MONARK replays the rest under Windows)
  const t = tool(), out = join(mkdtempSync(join(tmpdir(), "kata-quarter-cut-")), "e"), reg = sha256(REG), [h, hp] = history();
  const args = ["count", REG, reg, h, hp, join(FIXTURE, "sealed"), join(FIXTURE, "live"), "1", out, `${SYM}:${sha256(join(FIXTURE, "sealed", SYM, SERIES))}:${sha256(join(FIXTURE, "live", SYM, SERIES))}`];
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_")));
  const r = spawnSync("sh", ["-c", "ulimit -f 1; exec \"$@\"", "sh", t.python, ...t.form, join(t.dir, QUARTER, ENTRY), ...args], { cwd: t.dir, env, encoding: "utf8" });
  assert.equal(r.status, 2, `under ulimit -f 1: exit 2\n${r.stdout}${r.stderr}`);
  assert.match(linesOf(r.stdout).join("\n"), /^REFUSED: OSError: \[Errno 27\] File too large/m, "the write refused by its error");
  assert.ok(!existsSync(join(out, "quarter-1.json")), "no file under the evidence's name");
});

// Truncated candles (docs/G0-lot-cm5-c1a-2.md, rules 8 and 8 bis): Q_1 with no gap, and on 2026-11-10 the candle at 11:15 with 1 trade, the
// four from 11:30 with 0 trades, the candle at T = 12:30 truncated by `cut` ms with `trades`, the candles at `drop` removed and declared;
// or the truncated candle at another slot t, after another number of 0-trade candles (`zeros`), the one before them with 1 trade.
const T = Date.UTC(2026, 10, 10, 12, 30), M = 900_000, GONE = [1, 2, 3, 4, 5].map((i) => T + i * M);
const candle = (t: number, close: number, n: number): string => `${iso(t)},${t},100.00,100.10,99.90,100.05,1.000,${close},100.02,${n},0.500,50.01`;
/** The series file with the lines of the open times of `set` replaced by its lines, and those of `gone` removed. */
const retouch = (file: string, set: Map<number, string>, gone: number[] = []): void => writeFileSync(file, `${linesOf(readFileSync(file, "utf8"))
  .filter((l) => l !== "" && !gone.includes(Number(l.split(",")[1]))).map((l) => set.get(Number(l.split(",")[1])) ?? l).join("\n")}\n`);
const truncated = (dir: string, cut: number, trades: number, drop: number[] = [], { t = T, zeros = 4 } = {}): string => {
  const live = fullQ1(dir, { drop }), run = Array.from({ length: zeros }, (_, i) => t - (i + 1) * M), first = t - (zeros + 1) * M;
  retouch(join(live, SYM, SERIES), new Map([[first, candle(first, first + M - 1, 1)], ...run.map((s): [number, string] => [s, candle(s, s + M - 1, 0)]), [t, candle(t, t + M - 1 - cut, trades)]]));
  return live;
};
/** The lists irregular_close and zero_trade of the series of live/SYM as the recorder writes them, its candle at t truncated by cut ms. */
const listsOf = (live: string, cut: number, t = T): { irregular_close: { open_time_ms: number; close_time_ms: number }[]; zero_trade: number[] } => ({
  irregular_close: cut === 0 ? [] : [{ open_time_ms: t, close_time_ms: t + M - 1 - cut }],
  zero_trade: linesOf(readFileSync(join(live, SYM, SERIES), "utf8")).slice(1).filter((l) => l !== "").map((l) => l.split(",")).filter((f) => f[9] === "0").map((f) => Number(f[1])) });

// reddened by: a truncation of at most one minute taken for a halt (30 s, 60 s); E of a truncated candle with 0 trades other than the open
// of the run of 0-trade candles that ends at it, or E of one with trades other than its close + 1 ms; R other than the end of the run of
// declared slots that follows it, or than the next candle when none is; a decision whose label window meets [E, R) counted, or one that
// does not dropped; a halt that ends before S_1 printed; a list computed from the series that a manifest contradicts admitted (a v2, or a
// v1 that carries the list), or a manifest with no list refused; a truncation of at most one minute left out of irregular_close (a v2
// manifest that lists it refused); a manifest that is not a JSON object, or writes a key twice, admitted or refused by another error; a
// manifest with no schema, or one the recorder does not write, admitted; a case's folder that Windows refuses written; a bound of [E, R)
// or of the label window closed (the decision at t = R, or the one whose window ends at E, dropped); a halt across the
// seam S_1 that takes its 0-trade run, its truncation or its declared slots from read 2 alone; or a fixture whose truncation the frozen
// tool's load_series admits
// killer: tools/kata-quarter/quarter_load.py:258 CONST "60_000" -> "0"
test("truncated_candle_rule8 - a truncation of 30 s or 60 s is an ordinary candle; one of 10 min at 0 trades after four 0-trade candles halts from the first of them to the resumption after the missing candles, one of 10 min with trades from its close + 1 ms to the next candle: the decisions whose label window meets [E, R) are dropped and [E, R) is printed; the lists computed are held to the manifest; recalc_p2.load_series stops on such a candle", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_load.py")), `${QUARTER}/quarter_load.py absent`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-rule8-")), sealed = join(FIXTURE, "sealed");
  const v2 = { schema: "monark.series.binance.v2" }, v1 = { schema: "monark.series.binance.v1" };
  /** count on the series of truncated (o.t, o.zeros), its lists held to a v2 manifest.json beside it when o.v2. Its folder is the
   *  case's name with each run of characters other than letters, digits, _ . - written as one - (« R at 13:00 », R-at-13-00: Windows
   *  refuses a colon); the messages keep the name. */
  const run = (name: string, cut: number, trades: number, drop: number[] = [], from = sealed, o: { repo?: ToolRepo; t?: number; zeros?: number; v2?: boolean } = {}): { r: Run; c: Counts; live: string } => {
    const live = truncated(join(work, name.replace(/[^\w.-]+/g, "-")), cut, trades, drop, o);
    if (o.v2) writeFileSync(join(live, SYM, "manifest.json"), `${JSON.stringify({ ...v2, ...listsOf(live, cut, o.t) })}\n`);
    const x = count(from, live, 1, [SYM], o);
    assert.equal(x.r.status, o.repo ? 2 : 0, `${name}: exit ${o.repo ? 2 : 0}\n${x.r.stdout}${x.r.stderr}`);
    return { ...x, live };
  };
  const halt = (e: number, r: number): unknown[] => [{ start_ms: e, end_ms: r, symbols: [SYM] }];
  /** The counts of base with d[i] more drops and as many fewer instants in n_test, for range-1h, range-4h and mae-down-1h. */
  const moved = (base: Counts, d: number[]): Record<string, number[]> =>
    Object.fromEntries(["syn-range-1h", "syn-range-4h", "syn-mae-down-1h"].map((c, i) => { const [n = NaN, k = NaN, o = NaN] = byClass(base)[c] ?? []; return [c, [n - (d[i] ?? 0), k + (d[i] ?? 0), o]]; }));
  // a case's folder that Windows refuses, refused by the fixture writer by name before anything is written, on Linux too: the case named
  // as it reads (« E at 12:00 », a colon), one name for each other character of the class but / (the separator; \ is the separator on
  // Windows, so that name is left out there), one for each device stem, with an extension or not, in either case, with a digit or a
  // superscript (the stem after prn written in two parts: a French word to lang:gate), a trailing dot, a trailing space, a control
  // character and the last one (0x1f). The guard is test code, which no killer line may name (scripts/red-proof.mjs, KILLER CONVENTION):
  // each of its clauses dropped, a character of its class but / dropped, a device stem dropped, the superscripts dropped, the bound of
  // the control characters lowered, or its throw, turns these cases red
  for (const name of ["E at 12:00", "a<b", "a>b", "a\"b", ...(process.platform === "win32" ? [] : ["a\\b"]), "a|b", "a?b", "a*b", "CON", "prn.txt", "a" + "ux", "Nul.json", "com1", "LPT9", "com¹", "a dot.", "a space ", "a\ttab", "a\x1fb"]) { // winlint-ok: names the writer refuses before any write, none made
    const p = join(work, name, "q1", SYM, SERIES);
    assert.throws(() => truncated(join(work, name), 600_000, 0), { message: `a path segment that Windows refuses: ${JSON.stringify([name])} in ${p}` }, `${JSON.stringify(name)}: refused by name`);
    assert.ok(!existsSync(join(work, name)), `${JSON.stringify(name)}: nothing written`);
  }
  // the anchors of the device pattern: a name with more after a device stem (« console », « com10 ») or before it (« icon ») is one
  // Windows admits, and the writer makes it; the pattern unanchored at its end refuses the first two, at its start the third
  for (const name of ["console", "com10", "icon"]) {
    const p = join(work, name, "q1", SYM, SERIES);
    truncated(join(work, name), 600_000, 0);
    assert.ok(existsSync(p), `${JSON.stringify(name)}: written`);
  }
  // fixture A, and one minute exactly: an ordinary candle, the counts of the regular candle; still listed in irregular_close, held to a
  // v2 manifest that lists it (the recorder lists every close other than open + 15 min - 1 ms)
  // killer: tools/kata-quarter/quarter_load.py:258 ROR "close >= t" -> "close > t"
  // killer: tools/kata-quarter/quarter_load.py:243 CONST "if ct != ot + K.STEP_MS - 1:" -> "if ct < ot + K.STEP_MS - 1 - 60_000:"
  // killer: tools/kata-quarter/quarter_load.py:285 CONST ", \"monark.series.binance.v2\")" -> ")"
  const base = run("regular", 0, 0, GONE);
  for (const [name, cut] of [["30 s", 30_000], ["60 s", 60_000]] as const) {
    const a = run(name, cut, 0, GONE, sealed, { v2: true });
    assert.deepEqual([a.c.halts, byClass(a.c)], [[], byClass(base.c)], `a truncation of ${name}, its lists held to a v2 manifest: no halt, no drop`);
  }
  // fixture B, 10 min at 0 trades: E = 11:30 (the run of 0-trade candles, 8 bis), R = 14:00 (after the five missing candles); drop (a): at
  // 1h t = 11:00, whose window [11:00, 12:00) meets [11:30, 14:00) (12:00 and 13:00 are dropped or out already); at 4h t = 08:00 and 12:00
  // for range, which reads two closes only (its label at 12:00 is formed though the bar is absent)
  // killer: tools/kata-quarter/quarter_load.py:261 CONST "while e in read[\"zero\"] and" -> "while False and"
  // killer: tools/kata-quarter/quarter_load.py:264 CONST "while r in read[\"declared\"]:" -> "while False:"
  // killer: tools/kata-quarter/quarter_core.py:102 CONST "any(t < x and e < t + h for e, x in halts)" -> "False"
  const b = run("B", 600_000, 0, GONE);
  assert.deepEqual([b.c.halts, byClass(b.c)], [halt(T - 4 * M, T + 6 * M), moved(base.c, [1, 2, 1])], "fixture B: [11:30, 14:00) and its drops (a)");
  // fixture C, 10 min with trades after the same 0-trade candles, no candle missing: E = 12:35 (its close + 1 ms), R = 12:45 (the next
  // candle); drop (a) at t = 12:00 for each row, at 1h and 4h
  // killer: tools/kata-quarter/quarter_load.py:260 CONST "e = t if t in read[\"zero\"] else close + 1" -> "e = t"
  const c = run("C", 600_000, 1);
  assert.deepEqual([c.c.halts, byClass(c.c)], [halt(T + 300_000, T + M), moved(run("regular C", 0, 1).c, [1, 1, 1])], "fixture C: [12:35:00.000, 12:45) and its drops (a)");
  // the bounds, half-open: 10 min with trades at 12:45, [12:50, 13:00), so t = 13:00 counted at 1h (t < R); a 0-trade run from 12:00 to a
  // 0-trade truncation at 12:30, [12:00, 12:45), so t = 11:00 counted at 1h and t = 08:00 at 4h (E < t + h); t = 12:00 dropped for each row
  // killer: tools/kata-quarter/quarter_core.py:102 ROR "t < x and" -> "t <= x and"
  // killer: tools/kata-quarter/quarter_core.py:102 ROR "e < t + h" -> "e <= t + h"
  const atR = run("R at 13:00", 600_000, 1, [], sealed, { t: T + M }), atE = run("E at 12:00", 600_000, 0, [], sealed, { zeros: 2 });
  assert.deepEqual([atR.c.halts, byClass(atR.c)], [halt(T + M + 300_000, T + 2 * M), moved(run("regular R", 0, 1, [], sealed, { t: T + M }).c, [1, 1, 1])], "R = 13:00: t = 13:00 counted");
  assert.deepEqual([atE.c.halts, byClass(atE.c)], [halt(T - 2 * M, T + M), moved(run("regular E", 0, 0, [], sealed, { zeros: 2 }).c, [1, 1, 1])], "E = 12:00: t = 11:00 counted");
  // the lists computed from B's series (its truncated candle, its 0-trade candles) held to a manifest.json beside it
  const lists = listsOf(b.live, 600_000);
  const under = (m: object | string): Run => { writeFileSync(join(b.live, SYM, "manifest.json"), typeof m === "string" ? m : `${JSON.stringify(m)}\n`); return count(sealed, b.live, 1, [SYM]).r; };
  assert.ok(lists.zero_trade.includes(T) && lists.zero_trade.length >= 5, "the truncated candle among the 0-trade candles");
  // killer: tools/kata-quarter/quarter_load.py:285 CONST "(\"monark.series.binance.v1\", " -> "("
  assert.deepEqual([under({ ...v2, ...lists }).status, under(v1).status], [0, 0], "a v2 manifest whose lists are the computed ones, and a v1 with none: counted");
  // killer: tools/kata-quarter/quarter_load.py:290 CONST "if off:" -> "if False:"
  // killer: tools/kata-quarter/quarter_load.py:289 CONST "(k in man or v2)" -> "(v2)"
  // killer: tools/kata-quarter/quarter_load.py:289 CONST "(k in man or v2)" -> "(k in man)"
  for (const [name, m, off] of [["a v2 without the truncated candle in zero_trade", { ...v2, ...lists, zero_trade: lists.zero_trade.filter((t) => t !== T) }, "'zero_trade'"],
    ["a v2 with no zero_trade", { ...v2, irregular_close: lists.irregular_close }, "'zero_trade'"], ["a v1 that carries an empty irregular_close", { ...v1, irregular_close: [] }, "'irregular_close'"]] as const) {
    const r = under(m);
    assert.equal(r.status, 2, `${name}: exit 2\n${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, `REFUSED: syn: the lists computed from the series differ from those of its manifest.json: [${off}]\n`, `${name}: refused by name`);
  }
  // the manifest held to its form, as missing.json is: not a JSON text, not an object, or a key written twice, each refused by name; and
  // to a schema the recorder writes (scripts/record-binance-klines.d.mts: v1 or v2): none, or another, refused by name, its lists aside
  // killer: tools/kata-quarter/quarter_load.py:279 CONST "except ValueError:" -> "except KeyError:"
  // killer: tools/kata-quarter/quarter_load.py:281 CONST "type(man) is not dict" -> "False"
  // killer: tools/kata-quarter/quarter_load.py:278 CONST ", object_pairs_hook=lambda p: unique(p, f\"{sym}: manifest.json\")" -> ""
  // killer: tools/kata-quarter/quarter_load.py:285 CONST "if schema not in (\"monark.series.binance.v1\", \"monark.series.binance.v2\"):" -> "if False:"
  // killer: tools/kata-quarter/quarter_load.py:286 CONST "\"names no schema\" if \"schema\" not in man else " -> ""
  const neither = ", neither monark.series.binance.v1 nor monark.series.binance.v2";
  for (const [name, text, why] of [["not a JSON text", "{\n", " is not a JSON text"], ["a JSON array", "[]\n", " is not a JSON object: list"],
    ["a key written twice", `{"schema":"${v1.schema}","schema":"${v1.schema}"}\n`, ": a key written twice in one object: ['schema', 'schema']"],
    ["an object with no schema", `${JSON.stringify(lists)}\n`, ` names no schema${neither}`],
    ["an object of another schema", `${JSON.stringify({ schema: "monark.series.binance.v3", ...lists })}\n`, ` names the schema 'monark.series.binance.v3'${neither}`]] as const) {
    const r = under(text);
    assert.equal(r.status, 2, `a manifest.json that is ${name}: exit 2\n${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, `REFUSED: syn: manifest.json${why}\n`, `a manifest.json that is ${name}: refused by name`);
  }
  // inside the original range: a truncation at 2026-09-20T12:30Z in the sealed series; counted (its halt ends before S_1, nothing printed)
  // under the tool's reader; the frozen tool's load_series, called on the sealed read by a stand-in, stops on it
  // killer: tools/kata-quarter/quarter_load.py:113 CONST " if r > s2]" -> "]"
  const ts = Date.UTC(2026, 8, 20, 12, 30), sf = fixtureOf("sealed"), line = (ts - (S1 - 404 * H)) / M + 2;
  const cut = put(join(work, "sealed"), SYM, { text: sf.csv.split("\n").map((l) => (l.split(",")[1] === String(ts) ? l.replace(`,${ts + M - 1},`, `,${ts + M - 1 - 600_000},`) : l)).join("\n"), missing: sf.missing });
  assert.deepEqual(run("in range", 0, 0, [], cut).c.halts, [], "a halt that ends before S_1: no label window of Q_1 meets it");
  const frozen = standIn("_read = read_series\n\n\ndef read_series(series_dir, sym, pin, start, end):\n    if start == K.REC_START:\n        recalc_p2.load_series(series_dir, sym, pin)\n    return _read(series_dir, sym, pin, start, end)");
  assert.match(run("frozen", 0, 0, [], cut, { repo: frozen }).r.stdout, new RegExp(`^REFUSED: syn: line ${line}: open or close time$`, "m"), "recalc_p2.load_series stops on it, inside its range");
  // across the seam S_1, the halts of both reads taken together: a 0-trade truncation at S_1 in the LIVE series after two 0-trade candles
  // at the end of the sealed one, E in read 1; a truncation with trades at S_1 - 30 min in the sealed series, S_1 - 15 min declared missing
  // there and S_1 in the LIVE series (the fixture's), R in read 2
  // killer: tools/kata-quarter/quarter_load.py:111 CONST "\"zero\": first[\"zero\"] | second[\"zero\"]" -> "\"zero\": second[\"zero\"]"
  // killer: tools/kata-quarter/quarter_load.py:111 CONST "\"irregular\": {**first[\"irregular\"], **second[\"irregular\"]}" -> "\"irregular\": second[\"irregular\"]"
  // killer: tools/kata-quarter/quarter_load.py:111 CONST "first[\"declared\"] | second[\"declared\"]" -> "second[\"declared\"]"
  const seam = (name: string, set: Map<number, string>, gone: number[] = []): string => {
    const decl = [...sf.missing.missing, ...gone.map((g) => ({ open_time_ms: g, open_time_utc: iso(g) }))], dir = put(join(work, name), SYM, { text: sf.csv, missing: { count: decl.length, missing: decl } });
    retouch(join(dir, SYM, SERIES), set, gone);
    return dir;
  };
  const zeroEnd = seam("seam zero", new Map([[S1 - 3 * M, candle(S1 - 3 * M, S1 - 2 * M - 1, 1)], ...[2, 1].map((i): [number, string] => [S1 - i * M, candle(S1 - i * M, S1 - (i - 1) * M - 1, 0)])]));
  assert.deepEqual(run("seam E", 600_000, 0, [], zeroEnd, { t: S1, zeros: 0 }).c.halts, halt(S1 - 2 * M, S1 + M), "E in read 1: the 0-trade run that ends at the truncation at S_1");
  const declEnd = seam("seam declared", new Map([[S1 - 2 * M, candle(S1 - 2 * M, S1 - M - 1 - 600_000, 1)]]), [S1 - M]), r2 = count(declEnd, join(FIXTURE, "live"), 1, [SYM]);
  assert.deepEqual([r2.r.status, r2.c?.halts], [0, halt(S1 - 2 * M + 300_000, S1 + M)], `R in read 2: S_1 - 15 min declared in read 1, S_1 in read 2\n${r2.r.stdout}${r2.r.stderr}`);
});

// The core registry of wave 2 (docs/G0-lot-cm5-c3.md): quarter_wave2.py reads wave2.json (kata/registry/FORMAT-wave2.md of RECHERCHES,
// frozen) under the role registry, pinned, in its byte form and closed; count takes it after the registry and counts its region rows at
// attempt 2 under the child rule; the act equals_wave2_registry_on_its_blocks holds it to the counts of its rows on its three veto blocks.
const CORE = join(FIXTURE, "registry", "wave2-syn.json");
type Block2 = { nTest: number; kTest: number | null; UTest: string | null; vetoed: boolean; months: Record<string, { n: number; k: number }> };
type CoreRow2 = Record<string, unknown> & { taskClass: string; key: string; hourOfWeekFactors: unknown[]; calib: Record<string, unknown>; drops: Record<string, number>; bridge: Block2; test: Block2; fwd: Block2 };
type CoreDoc = Record<string, unknown> & { rows: CoreRow2[] };
type Counted = Row & { key: string; calib_attempt: number; alpha: string };
const pinned = (p: string): [string, string] => [p, sha256(p)];
/** The core registry of the fixture with its document changed by f, then its text by g, written under work; its path and pin. */
const coreWith = (work: string, name: string, f: (d: CoreDoc) => void, g = (t: string): string => t): [string, string] => {
  const d = JSON.parse(readFileSync(CORE, "utf8")) as CoreDoc;
  f(d);
  write(join(work, name), g(`${JSON.stringify(d, null, 1)}\n`));
  return pinned(join(work, name));
};
/** Hourly closes 100 and 101 in turn on [from, to), lows 99.8, highs 101.1, as in k_test_exact_on_a_made_series: the CSV lines. */
const zig = (from: number, to: number): string[] => {
  const rows: string[] = [];
  for (let t = from; t < to; t += 900_000) rows.push(`${iso(t)},${t},${odd(t) === (t % H === 0) ? 100 : 101},101.1,99.8,${odd(t) ? 101 : 100},1,${t + 899_999},100,1,0.5,50`);
  return rows;
};
const keyOf = (h: string, kata = "ewma-vol-hw-v1"): string => `kata:${kata}@binance/SYNUSDT/${h}/b0`;

// reddened by: a wave2.json with a key outside its format admitted (in a row, at the top level, in a month of a block) or a key missing,
// a row at another attempt than 2, a factor table other than its wave 1 row's (with its own digest, or the parent's), bytes off the byte
// form (compact, CR LF), a key written twice, another pin, another alpha, a region row with no qhat, a status or a vetoedBy off the
// order of its blocks, or a month outside its block admitted; or the core region rows not given to the count with the fields it reads
// killer: tools/kata-quarter/quarter_wave2.py:104 CONST "== 2" -> ">= 1"
// killer: tools/kata-quarter/quarter_wave2.py:52 CONST "list(v) != list(keys)" -> "False"
// killer: tools/kata-quarter/quarter_wave2.py:69 CONST " and text == K.js_json_pretty(doc) + \"\\n\"" -> ""
// killer: tools/kata-quarter/quarter_wave2.py:64 CONST "!= pin:" -> "!= pin and False:"
// killer: tools/kata-quarter/quarter_wave2.py:111 CONST "r[\"factorTableSha256\"] == parent[\"factorTableSha256\"] == " -> ""
// killer: tools/kata-quarter/quarter_wave2.py:111 CONST " == K.seq_sha256(r[\"hourOfWeekFactors\"])" -> ""
// killer: tools/kata-quarter/quarter_wave2.py:109 CONST "r[\"status\"] == (\"vetoed\" if fired else c[\"status\"])" -> "True"
// killer: tools/kata-quarter/quarter_wave2.py:109 CONST " and r[\"vetoedBy\"] == (fired[0] if fired else None)" -> ""
// killer: tools/kata-quarter/quarter_wave2.py:90 CONST "s <= t < e" -> "True"
test("wave2_registry_reader_closed - count reads the synthetic core registry of the fixture under the role registry and counts its two region rows at attempt 2 with the fields it reads; a key outside the format or missing, an attempt other than 2, a factor table other than the wave 1 row's, bytes off the byte form, a key twice, another pin, another alpha, no qhat on a region row, a status off its blocks or a month outside its block is refused by name, exit 2", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_wave2.py")), `${QUARTER}/quarter_wave2.py absent`);
  assert.ok(existsSync(CORE), "fixtures/kata-quarter/registry/wave2-syn.json absent");
  const [sealed, live] = [join(FIXTURE, "sealed"), join(FIXTURE, "live")], ok = count(sealed, live, 1, [SYM], { core: pinned(CORE) });
  assert.equal(ok.r.status, 0, `count with the core registry: exit 0\n${ok.r.stdout}${ok.r.stderr}`);
  assert.deepEqual((ok.c.rows as Counted[]).map((x) => [x.task_class, x.key, x.calib_attempt, x.alpha, x.horizon]), [["syn-range-1h", keyOf("1h"), 1, "0.01", "1h"],
    ["syn-range-4h", keyOf("4h"), 1, "0.01", "4h"], ["syn-mae-down-1h", keyOf("1h"), 1, "0.01", "1h"], ["syn-range-1h", keyOf("1h"), 2, "0.01", "1h"], ["syn-range-4h", keyOf("4h"), 2, "0.01", "4h"]],
  "the wave 1 region rows, then the two core region rows at attempt 2 (the silence, the vetoed and the under_calib rows left out)");
  assert.ok(linesOf(ok.r.stdout).includes(`input registry wave2-syn.json sha256 ${sha256(CORE)} bytes ${readFileSync(CORE).length}`), `read under the role registry\n${ok.r.stdout}`);
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-core-")), row0 = `core row syn-range-1h ${keyOf("1h")}: not `, BYTES = "wave2.json: not its byte form, JSON.stringify(registry, null, 1) and one line feed";
  const own = (d: CoreDoc, digest: (f: unknown[]) => string): void => { const r = d.rows[0], f = [1.5, ...(r?.hourOfWeekFactors ?? []).slice(1)]; if (r) { r.hourOfWeekFactors = f; r.factorTableSha256 = digest(f); } };
  const first = (d: CoreDoc): CoreRow2 => d.rows[0] ?? ({} as CoreRow2);
  const cases: [string, [string, string], string][] = [
    ["a key outside the format in a row", coreWith(work, "row-key.json", (d) => { first(d).note = 1; }), "wave2.json: rows[0]: ['taskClass', 'key', "],
    ["a key outside the format at the top level", coreWith(work, "top-key.json", (d) => { d.note = "x"; }), "wave2.json: the top level: ['plan', 'engine', 'trialRegistryHead', 'rows', 'note']"],
    ["a key outside the format in a month", coreWith(work, "month-key.json", (d) => { Object.assign(first(d).bridge.months["2025-10"] ?? {}, { x: 1 }); }), "wave2.json: rows[0].bridge.months.2025-10: ['n', 'k', 'x']"],
    ["a key missing", coreWith(work, "missing-key.json", (d) => { delete first(d).vetoedBy; }), "wave2.json: rows[0]: ['taskClass', 'key', "],
    ["calibAttempt 1", coreWith(work, "attempt-1.json", (d) => { first(d).calibAttempt = 1; }), `${row0}calibAttempt 2`],
    ["calibAttempt 3", coreWith(work, "attempt-3.json", (d) => { first(d).calibAttempt = 3; }), `${row0}calibAttempt 2`],
    ["a factor table of its own, with its digest", coreWith(work, "table-own.json", (d) => own(d, (f) => hex(JSON.stringify(f)))), `${row0}the factor table of its wave 1 row, byte for byte`],
    ["a factor table of its own, with the parent's digest", coreWith(work, "table-parent.json", (d) => own(d, () => String(first(d).factorTableSha256))), `${row0}the factor table of its wave 1 row, byte for byte`],
    ["the compact writing", coreWith(work, "compact.json", () => undefined, (t) => `${JSON.stringify(JSON.parse(t))}\n`), BYTES],
    ["CR LF line endings", coreWith(work, "crlf.json", () => undefined, (t) => t.split("\n").join("\r\n")), BYTES],
    ["a key written twice", coreWith(work, "twice.json", () => undefined, (t) => t.replace("\n   \"W\": 101,", "\n   \"W\": 101,\n   \"W\": 101,")), "wave2.json: a key written twice in one object: "],
    ["another pin", [CORE, "0".repeat(64)], `core registry refused before parsing: sha256 ${sha256(CORE)} differs from the pinned ${"0".repeat(64)}`],
    ["alpha 0.05", coreWith(work, "alpha.json", (d) => { first(d).alpha = "0.05"; }), `${row0}alpha 0.01`],
    ["a region row with no qhat", coreWith(work, "no-qhat.json", (d) => { first(d).calib.qhat = null; }), `${row0}a qhat, a finite number, iff calibrated`],
    ["a bridge fired under the status region", coreWith(work, "status.json", (d) => { first(d).bridge.vetoed = true; first(d).vetoedBy = "bridge"; }), `${row0}its status and vetoedBy by the order of its blocks`],
    ["a bridge fired under vetoedBy test", coreWith(work, "vetoed-by.json", (d) => { first(d).bridge.vetoed = true; first(d).status = "vetoed"; first(d).vetoedBy = "test"; }), `${row0}its status and vetoedBy by the order of its blocks`],
    ["a month outside its block", coreWith(work, "month.json", (d) => { const { "2023-10": m, ...rest } = first(d).test.months; first(d).test.months = { "2023-09": m ?? { n: 0, k: 0 }, ...rest }; }), `${row0}blocks whose months are of the block`]];
  for (const [name, core, re] of cases) {
    const x = count(sealed, live, 1, [SYM], { core });
    assert.equal(x.r.status, 2, `${name}: exit 2\n${x.r.stdout}${x.r.stderr}`);
    assert.ok(x.r.stdout.startsWith("REFUSED: ") && x.r.stdout.includes(re), `${name}: refused by name\n${x.r.stdout}`);
  }
});

// reddened by: a core row counted on a quarter whose start comes before the end of its calibration data, or not counted on the quarter
// that starts at that end; or other instants than those of Q_k in its counts (its n_test, drops and instants out not the grid of Q_k,
// not those of its wave 1 row, which reads the same series)
// killer: tools/kata-quarter/quarter_wave2.py:129 ROR ">=" -> ">"
// killer: tools/kata-quarter/quarter_wave2.py:129 CONST "s_k >= CALIB_END" -> "True"
test("child_row_counted_from_first_quarter_after_its_data - a core row at attempt 2 is counted on Q_1 when its calibration data ends before S_1 (CALIB-2, 2023-10-01) or at S_1, over every instant of Q_1 and no other, as its wave 1 row is but with its own misses; when its data ends 15 min after S_1 it is not counted on Q_1", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_wave2.py")), `${QUARTER}/quarter_wave2.py absent`);
  assert.ok(existsSync(CORE), "fixtures/kata-quarter/registry/wave2-syn.json absent");
  const ends = (ms: number): ToolRepo => toolRepo(REPO, (dir) => writeFileSync(join(dir, QUARTER, "quarter_wave2.py"), `${read("quarter_wave2.py")}\nCALIB_END = ${ms}\n`));
  for (const [name, repo, counted] of [["the end of CALIB-2", tool(), true], ["S_1", ends(S1), true], ["S_1 + 15 min", ends(S1 + 900_000), false]] as const) {
    const { r, c } = count(join(FIXTURE, "sealed"), join(FIXTURE, "live"), 1, [SYM], { core: pinned(CORE), repo });
    assert.equal(r.status, 0, `the calibration data ending at ${name}: exit 0\n${r.stdout}${r.stderr}`);
    const rows = c.rows as Counted[], two = rows.filter((x) => x.calib_attempt === 2);
    assert.deepEqual(two.map((x) => x.task_class), counted ? ["syn-range-1h", "syn-range-4h"] : [], `the calibration data ending at ${name}: the core rows counted on Q_1 or not`);
    assert.deepEqual(Object.values(c.grid).map((g) => g.first), [iso(S1), iso(S1)], "the grid of Q_1 from S_1");
    for (const x of two) {
      const one = rows.find((p) => p.calib_attempt === 1 && p.task_class === x.task_class && p.key === x.key);
      assert.deepEqual([x.n_test + x.drops_label + x.out_input, x.n_test, x.drops_label, x.out_input], [c.grid[x.horizon]?.instants, one?.n_test, one?.drops_label, one?.out_input], `${name}: ${x.task_class} on each instant of Q_1, as its wave 1 row`);
      assert.ok(x.horizon === "4h" || x.k_test > (one?.k_test ?? Infinity), `${name}: ${x.task_class} counted with its own qhat, 0.75, below its wave 1 row's`);
    }
  }
});

// reddened by: the core rows not given to the count, or given at attempt 1, their rows of the evidence not counted with their own qhat,
// the pin of the core registry not written in the evidence (or another one written), or anything else of the evidence changed by it
// killer: tools/kata-quarter/quarter_wave2.py:138 CONST "rows + mine" -> "rows + [(dict(r, calibAttempt=1), c, f) for r, c, f in mine]"
// killer: tools/kata-quarter/quarter_wave2.py:138 CONST "rows + mine" -> "rows"
// killer: tools/kata-quarter/quarter_counts.py:106 CONST "\"core_registry_sha256\": core[1]" -> "\"core_registry_sha256\": pin"
// killer: tools/kata-quarter/quarter_evidence.py:56 CONST " + (\"core_registry_sha256\",) * (\"core_registry_sha256\" in res)" -> ""
// killer: tools/kata-quarter/quarter_counts.py:153 CONST "(a[2], args[3])" -> "None"
test("core_registry_to_evidence_row_composition - on hourly closes 100 and 101 in turn, count with the core registry writes in the evidence of Q_1 a row at attempt 2 for each core region row, counted with its own qhat (0.75: a miss where the factor is 1 or 1.25), with its u_test and its fire, and the pin of the core registry; the rest of the evidence is that of the count without it", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_wave2.py")), `${QUARTER}/quarter_wave2.py absent`);
  assert.ok(existsSync(CORE), "fixtures/kata-quarter/registry/wave2-syn.json absent");
  const work = mkdtempSync(join(tmpdir(), "kata-quarter-compose-")), header = linesOf(fixtureOf("live").csv)[0], none = { count: 0, missing: [] };
  const [sealed, live] = [put(join(work, "sealed"), SYM, { text: `${header}\n${zig(S1 - 404 * H, S1).join("\n")}\n`, missing: none }), put(join(work, "live"), SYM, { text: `${header}\n${zig(S1, E1).join("\n")}\n`, missing: none })];
  const [a, b] = [evidenceOf(sealed, live), evidenceOf(sealed, live, { core: pinned(CORE) })];
  assert.deepEqual([a.r.status, b.r.status], [0, 0], `count without and with the core registry: exit 0\n${a.r.stdout}${b.r.stdout}${b.r.stderr}`);
  const without = JSON.parse(a.raw.toString("ascii")) as Evidence, withCore = JSON.parse(b.raw.toString("ascii")) as Evidence & { core_registry_sha256?: string };
  const grid = Array.from({ length: 2208 }, (_, i) => S1 + i * H), f = (t: number): number => ((t / H + 72) % 168) % 3;
  const two = (withCore.rows as (Counted & { u_test: string | null; fires: boolean })[]).filter((x) => x.calib_attempt === 2);
  assert.deepEqual(two.map((x) => [x.task_class, x.key, x.n_test, x.k_test, x.drops_label, x.out_input, x.fires]), [["syn-range-1h", keyOf("1h"), 2208, grid.filter((t) => f(t) < 2).length, 0, 0, true],
    ["syn-range-4h", keyOf("4h"), 0, 0, 0, 552, false]], "a row of the evidence at attempt 2 for each core region row, its own misses, its fire");
  assert.ok(/^0\.[0-9]{7}$/.test(two[0]?.u_test ?? "") && two[1]?.u_test === null, "its u_test, null with no point");
  assert.equal(withCore.core_registry_sha256, sha256(CORE), "the pin of the core registry");
  const rest: Record<string, unknown> = { ...withCore, rows: withCore.rows.filter((x) => (x as Counted).calib_attempt === 1) };
  delete rest.core_registry_sha256;
  assert.deepEqual([Object.keys(without), rest], [EVIDENCE, without], "the rest of the evidence is that of the count without it, which has no key of the core registry");
});

/** The three veto blocks of wave 2 on a made series (hourly closes 100 and 101 in turn on each block and the 404 hours before it) and a
 *  core registry of four rows of the fixture, their blocks worked out from it: range-1h at qhat 0.9, a miss where the factor is 1 (UTS:
 *  binom_exact.miss_upper_bound at 0.05 run apart from the tool), firing on each block, vetoed by the bridge; range-4h at qhat 0.9, every
 *  instant out; mae-up-1h a silence at qhat 0, every point a miss ("1", never vetoed); range-4h of realized-vol-hw-v1, under_calib, not
 *  compared. change(rows) edits it. */
const BLOCKS2: Record<string, [number, number]> = { bridge: [Date.UTC(2025, 9, 1), Date.UTC(2026, 9, 1)], test: [Date.UTC(2023, 9, 1), Date.UTC(2024, 3, 1)], fwd: [Date.UTC(2024, 3, 1), Date.UTC(2024, 9, 1)] };
const UTS: Record<string, string> = { bridge: "0.3417152", test: "0.3452271", fwd: "0.3452271" };
const coreBlocks = (work: string, name: string, change: (rows: CoreRow2[]) => void = () => undefined): (out: string) => string[] => {
  const sealed = join(work, "sealed"), csv = join(sealed, SYM, SERIES);
  if (!existsSync(csv)) { // TEST-2 and FWD-2 follow each other; the bridge after a span the series does not hold (no merge in the act)
    const [t0 = 0] = BLOCKS2.test ?? [], [, f1 = 0] = BLOCKS2.fwd ?? [], [b0 = 0, b1 = 0] = BLOCKS2.bridge ?? [];
    put(sealed, SYM, { text: `${[linesOf(fixtureOf("live").csv)[0], ...zig(t0 - 404 * H, f1), ...zig(b0 - 404 * H, b1)].join("\n")}\n`, missing: { count: 0, missing: [] } });
  }
  const block = (b: string, h: number, miss: ((t: number) => boolean) | null, region: boolean): Block2 => {
    const [s = 0, e = 0] = BLOCKS2[b] ?? [], months: Record<string, { n: number; k: number }> = {};
    for (let t = s; miss && t < e; t += h) { const m = (months[iso(t).slice(0, 7)] ??= { n: 0, k: 0 }); m.n += 1; m.k += Number(miss(t)); }
    const n = Object.values(months).reduce((x, m) => x + m.n, 0), k = Object.values(months).reduce((x, m) => x + m.k, 0);
    return { nTest: n, kTest: k, UTest: n === 0 ? null : k === n ? "1" : (UTS[b] ?? ""), vetoed: region && n > 0, months };
  };
  const [file] = coreWith(work, name, (d) => {
    const [range1, range4, , up, under] = d.rows;
    const set = (r: CoreRow2 | undefined, qhat: number, status: string, miss: ((t: number) => boolean) | null, h: number): CoreRow2[] => {
      if (!r) return [];
      Object.assign(r.calib, { qhat, status });
      for (const b of ["bridge", "test", "fwd"] as const) r[b] = block(b, h, miss, status === "region");
      const fired = ["bridge", "test", "fwd"].filter((b) => (r[b] as Block2).vetoed);
      Object.assign(r, { status: fired.length > 0 ? "vetoed" : status, vetoedBy: fired[0] ?? null });
      return [r];
    };
    d.rows = [...set(range1, 0.9, "region", (t) => fac(t) === 0, H), ...set(range4, 0.9, "region", null, 4 * H), ...set(up, 0, "silence", () => true, H), ...(under ? [under] : [])];
    change(d.rows);
  });
  return (out) => [REG, sha256(REG), file, sha256(file), sealed, out, `${SYM}:${sha256(csv)}`];
};

// reddened by: a block of the core registry other than the format's (a bound moved), a field of a block (months, label drops, kTest,
// UTest) changed in the registry and not named, the label drops taken from the instants out, an under_calib row compared, a silence
// row vetoed by the tool, or the report not naming the rows compared and the grid of each block
// killer: tools/kata-quarter/quarter_wave2.py:21 CONST "K.utc_ms(2024, 10, 1))}" -> "K.utc_ms(2024, 9, 1))}"
// killer: tools/kata-quarter/quarter_oracle.py:175 CONST "\"months\": got[\"months\"], " -> ""
// killer: tools/kata-quarter/quarter_oracle.py:175 CONST "\"drops\": got[\"drops_label\"]" -> "\"drops\": got[\"out_input\"]"
// killer: tools/kata-quarter/quarter_oracle.py:164 CONST " if x[0][\"calib\"][\"qhat\"] is not None]" -> "]"
// killer: tools/kata-quarter/quarter_oracle.py:176 CONST "r[\"calib\"][\"status\"] == \"region\" and " -> ""
test("equals_wave2_registry_on_its_blocks - on a made series of the three veto blocks of wave 2, the act counts each core row with a qhat on the bridge, TEST-2 and FWD-2 and gives the registry's nTest, kTest, UTest, vetoed, months and label drops of each block, exit 0, its report naming the rows and the grid of each block; a kTest with its month, a UTest and a label drop changed in the registry are named, exit 1", () => {
  assert.ok(existsSync(join(REPO, QUARTER, "quarter_wave2.py")), `${QUARTER}/quarter_wave2.py absent`);
  assert.ok(existsSync(CORE), "fixtures/kata-quarter/registry/wave2-syn.json absent");
  const name = "equals_wave2_registry_on_its_blocks", work = mkdtempSync(join(tmpdir(), "kata-quarter-l-o3-")), ok = act(name, join(work, "1"), coreBlocks(work, "ok.json")(join(work, "1")));
  assert.equal(ok.r.status, 0, `every field equal: exit 0\n${ok.r.stdout}${ok.r.stderr}`);
  const res = ok.rep?.result as { rows?: string[][]; blocks?: Record<string, { grid: Record<string, { instants: number; first: string; last: string }> }> } | undefined;
  assert.deepEqual([ok.rep?.equal, linesOf(ok.r.stdout).at(-2), res?.rows], [true, "VERDICT: GREEN", [["syn-range-1h", keyOf("1h")], ["syn-range-4h", keyOf("4h")], ["syn-mae-up-1h", keyOf("1h")]]], "the rows with a qhat compared, named");
  assert.deepEqual(Object.fromEntries(Object.entries(res?.blocks ?? {}).map(([b, x]) => [b, x.grid["1h"]])), Object.fromEntries(Object.entries(BLOCKS2).map(([b, [s, e]]) => [b, { instants: (e - s) / H, first: iso(s), last: iso(e - H) }])), "the grid of each block");
  const bad = act(name, join(work, "2"), coreBlocks(work, "bad.json", ([range1, range4]) => {
    const m = range1?.bridge.months["2025-11"];
    if (m && range1 && range4) { m.k += 1; range1.bridge.kTest = (range1.bridge.kTest ?? 0) + 1; range1.fwd.UTest = UTS.bridge ?? ""; range4.drops.test = 1; }
  })(join(work, "2")));
  assert.equal(bad.r.status, 1, `a kTest with its month, a UTest and a label drop changed: exit 1\n${bad.r.stdout}${bad.r.stderr}`);
  assert.deepEqual(bad.rep?.differences.map((d) => /^(\S+) \S+ (\S+):/.exec(d)?.slice(1).join(" ")), ["syn-range-1h bridge.kTest", "syn-range-1h bridge.months", "syn-range-4h test.drops", "syn-range-1h fwd.UTest"], "each difference named, by block, row and field");
});
