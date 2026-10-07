// test/runbook-retire.test.ts -- item RETIRE-RUNBOOK-1 (ENGINE-ROW-RETIRE-PATH-1; docs/G0-lot-retire-latency-rehearsal-1.md): the
// retire section of docs/RUNBOOK-harness.md quotes the scripts it runs. Every expected value is READ from the scripts, never typed
// here (the pattern of srf_runbook_harness_names_every_check, test/surfaces-1-1-0.test.ts): the seven instants of
// scripts/retire-latency.mjs, one per step and in its order; its closed input, which the report accepts once the instants are
// filled; the retire list directory and the redo rule of scripts/spec-policy-tables.mjs; the usage of the writer and of the
// latency report; every script the section runs exists, and the publication command parses as scripts/spec-publish.mjs reads it,
// into a dated table version. Lot RH-1 (RECHERCHES review d55006f, N-6) adds: T_d before T_e, the refusals and exit codes cited, the
// --out flags, and the scope of the redo commands. Reads files, writes nothing. The lines above each test name the mutation that reddens it
// (scripts/red-proof.mjs convention).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { INSTANTS, main as latencyMain, report } from "../scripts/retire-latency.mjs";
import { datedDir, main as writerMain, RETIRE_DIR } from "../scripts/spec-policy-tables.mjs";
import { versionDir } from "../scripts/spec-publish.mjs";

const ROOT = join(import.meta.dirname, "..");
const read = (...parts: string[]): string => readFileSync(join(ROOT, ...parts), "utf8");
const HEAD = "## Retire a kata row (ENGINE-ROW-RETIRE-PATH-1)";
/** The retire section of the harness runbook, from its heading to the next second-level heading or the end of the file. */
function section(): string {
  const text = read("docs", "RUNBOOK-harness.md"), at = text.indexOf(`\n${HEAD}\n`);
  assert.ok(at >= 0, "the harness runbook carries the retire section");
  const next = text.indexOf("\n## ", at + 1);
  return text.slice(at + 1, next < 0 ? undefined : next);
}
/** f() returns: a throw fails the test by assertion (ERR_ASSERTION, the kill that scripts/red-proof.mjs counts). */
function admit<T>(f: () => T, what: string): T {
  try {
    return f();
  } catch (e) {
    return assert.fail(`${what}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// reddened by: a step heading that names another instant than the script's, a step out of the order of INSTANTS, or one missing, or
// a merge of the harness pull request not said to follow the publication (T_d before T_e)
// killer: docs/RUNBOOK-harness.md:372 CONST "(T_e)" -> "(T_f)"
test("runbook_retire_steps_carry_the_seven_instants_in_order", () => {
  const steps = [...section().matchAll(/^### (\d+)\. .*\((T_[a-z])\)$/gm)].map((m) => [Number(m[1]), m[2] ?? ""]);
  assert.deepEqual(steps, INSTANTS.map(([name], i) => [i + 1, name]), "steps 1 to 7 carry T_a to T_g, in the order of scripts/retire-latency.mjs");
  const names = INSTANTS.map(([name]) => name);
  assert.ok(names.indexOf("T_d") < names.indexOf("T_e") && section().replace(/\s+/g, " ").includes("merges it after T_d, never before"), "the pull request is merged after T_d");
});

// reddened by: the input shown off the closed format retire-latency-v1 (its format, a key, the cycle, an instant name or their
// order), or a second input shown, or a refusal of the report or its exit codes cited otherwise than the script names and returns them,
// or an Exit 1 list that is not the set of refusal codes of the script (a code missing, renamed or added; G2 of #223, m-2)
// killer: docs/RUNBOOK-harness.md:429 CONST "\"format\": \"retire-latency-v1\"" -> "\"format\": \"retire-latency-v2\""
test("runbook_retire_shows_the_closed_latency_input", () => {
  const blocks = [...section().matchAll(/```json\n([\s\S]*?)```/g)].map((m) => admit(() => JSON.parse(m[1] ?? "") as { instants: Record<string, string> }, "the input shown parses"));
  assert.equal(blocks.length, 1, "one input is shown");
  const shown = blocks[0] ?? { instants: {} }, at = (h: number): string => new Date(Date.UTC(2027, 0, 4, 9 + h)).toISOString().replace(".000Z", "Z");
  const filled = { ...shown, instants: Object.fromEntries(Object.keys(shown.instants).map((name, h) => [name, at(h)])) };
  assert.equal(admit(() => report(filled), "the report accepts the input shown, its instants filled in order").format, "retire-latency-report-v1");
  const text = section().replace(/\s+/g, " "), codes = new Set([...read("scripts", "retire-latency.mjs").matchAll(/no\("(\w+)"/g)].map((m) => m[1] ?? ""));
  assert.deepEqual([...codes].filter((c) => !text.includes(`\`${c}\``)), [], "every refusal of the report is cited by its name");
  assert.ok(text.includes("Exit 1 names the refusal: `format_invalid`") && text.includes("Exit 2: usage (l.62)"), "the exit codes of the report are cited");
  const from = text.indexOf("Exit 1 names the refusal:"), exit1 = text.slice(from, text.indexOf(" (l.", from));
  assert.deepEqual([...exit1.matchAll(/`(\w+)`/g)].map((m) => m[1] ?? "").sort(), [...codes].sort(), "the Exit 1 list is the set of refusal codes of the script");
  assert.ok(!(codes.has("instant_out_of_cycle") && text.includes("AFTER #218")), "once the script raises instant_out_of_cycle, the note on #218 is no longer in the future tense");
  assert.deepEqual([latencyMain([]), latencyMain([join(ROOT, "docs", "no-such-instants.json")])], [2, 1], "usage exits 2, a refusal 1");
});

// reddened by: the input not said to be UTF-8 without a byte order mark while the report parses the file as read in UTF-8 (a BOM
// fails JSON.parse, format_invalid), or a PowerShell form of the write that does not turn the BOM off or that resolves a relative
// name against the process directory, which Set-Location does not change, instead of the current location
// killer: docs/RUNBOOK-harness.md:438 CONST "(New-Object System.Text.UTF8Encoding $false)" -> "(New-Object System.Text.UTF8Encoding $true)"
test("runbook_retire_input_is_written_in_utf8_without_a_bom", () => {
  assert.ok(read("scripts", "retire-latency.mjs").includes('JSON.parse(readFileSync(argv[0], "utf8"))'), "the report parses the file as read in UTF-8");
  assert.throws(() => JSON.parse("\uFEFF{}"), SyntaxError, "a byte order mark read in UTF-8 fails JSON.parse");
  const text = section().replace(/\s+/g, " "), writes = [...text.matchAll(/`(\[System\.IO\.File\]::WriteAllText\([^`]*)`/g)].map((m) => m[1] ?? "");
  assert.ok(text.includes("UTF-8 without a byte order mark"), "the input is said to be UTF-8 without a byte order mark");
  assert.ok(writes.length > 0 && writes.every((w) => w.includes("(New-Object System.Text.UTF8Encoding $false))")), "the PowerShell write turns the byte order mark off");
  assert.ok(writes.every((w) => w.startsWith("[System.IO.File]::WriteAllText((Join-Path $PWD ")), "the PowerShell write lands in the current location, where node reads it");
});

// reddened by: the list directory off RETIRE_DIR, the redo rule off the refusal the writer prints, a command off the usage of its
// script, a script run that does not exist, or a publication command that spec-publish does not read as a dated table version
// with its previous root
// killer: docs/RUNBOOK-harness.md:300 CONST "apps/harness/data/kata/retire/" -> "apps/harness/data/retire/"
test("runbook_retire_quotes_the_writer_the_report_and_the_publication_gate", async () => {
  const text = section().replace(/\s+/g, " "), writer = read("scripts", "spec-policy-tables.mjs"), latency = read("scripts", "retire-latency.mjs");
  assert.ok(text.includes(`\`${RETIRE_DIR}/retire-<YYYY-MM-DD>.json\``), "the retire list lies where the writer reads it");
  const redo = /to redo it before its publication, remove it with git, then write it again/.exec(writer)?.[0];
  assert.ok(redo !== undefined && text.includes(`"${redo}"`), "the redo rule is quoted as the writer prints it");
  assert.ok(writer.includes("--write --date <YYYY-MM-DD>") && text.includes("node scripts/spec-policy-tables.mjs --write --date <YYYY-MM-DD>"), "the writer runs as its usage reads");
  assert.ok(latency.includes("usage: retire-latency.mjs <instants.json>") && text.includes("node scripts/retire-latency.mjs <instants.json>"), "the report runs as its usage reads");
  const run = [...text.matchAll(/node (scripts\/[\w/-]+\.mjs)/g)].map((m) => m[1] ?? "");
  assert.deepEqual([...new Set(run)].sort(), ["scripts/retire-instants.mjs", "scripts/retire-latency.mjs", "scripts/retire-probe.mjs", "scripts/spec-policy-tables.mjs", "scripts/spec-publish.mjs", "scripts/verify-harness.mjs"], "the scripts the section runs");
  for (const s of run) assert.ok(existsSync(join(ROOT, s)), `${s} exists`);
  const line = /node scripts\/spec-publish\.mjs (--release [^`#]*?) ?(?:```|$)/.exec(text)?.[1] ?? "";
  const { parseArgs } = (await import(new URL("../scripts/spec-publish.mjs", import.meta.url).href)) as { parseArgs: (a: string[]) => { release: string; date: string; out: string; roots: Record<string, string> } };
  const a = admit(() => parseArgs(line.split(" ")), "spec-publish reads the publication command");
  assert.deepEqual([a.release, a.date, a.out, Object.keys(a.roots)], ["contract-1.1.0-tables-<YYYY-MM-DD>", "<YYYY-MM-DD>", "<dir>", ["previous"]], "the release of a dated directory, out of tree, with the previous tree");
  const verify = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as { parseArgs: (a: string[]) => { out: string | null } };
  assert.ok(text.includes("node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json") && verify.parseArgs(["--out", "docs/deploy-CA-harness.json"]).out === "docs/deploy-CA-harness.json", "the deployment record is written by --out");
  assert.ok(versionDir(a.release.replace("<YYYY-MM-DD>", "2027-01-04")), "the release names a dated table version as spec-publish reads one");
});

// reddened by: a redo command whose path is not the dated directory (a wider scope, spec/ or the tree), a git clean, rm or restore
// written with no scope at all (the counter-example `git rm -r -f` alone excepted, by name), a git clean without -d, or a second form
// of git rm (G2 of #223, m-3); a git clean -f not right after its git clean -n dry run on the same path, or a git restore that does
// not unstage (--staged), which leaves a staged directory staged
// killer: docs/RUNBOOK-harness.md:472 CONST "`git clean -f -d -- spec/contract-1.1.0-tables-<YYYY-MM-DD>/`" -> "`git clean -f -d`"
test("runbook_retire_redo_removes_the_dated_directory_only", () => {
  const dir = `spec/${datedDir("2027-01-04").replace("2027-01-04", "<YYYY-MM-DD>")}`, text = section().replace(/\s+/g, " ");
  const scoped = [...text.matchAll(/`(git [a-z]+ [^`]*?) -- ([^`]*)`/g)].map((m): [string, string] => [m[1] ?? "", m[2] ?? ""]);
  assert.deepEqual(scoped.filter(([, path]) => path !== dir && path !== `${dir}/`), [], `every redo command is scoped to ${dir}`);
  const redo = [...text.matchAll(/`(git (?:clean|rm|restore)\b[^`]*)`/g)].map((m) => m[1] ?? "").filter((c) => c !== "git rm -r -f");
  assert.deepEqual(redo.filter((c) => !c.endsWith(` -- ${dir}`) && !c.endsWith(` -- ${dir}/`)), [], "every git clean, rm or restore cited ends on the dated directory");
  assert.deepEqual(redo.filter((c) => c.startsWith("git clean") && !/ -d\b/.test(c)), [], "every git clean carries -d");
  assert.deepEqual([...new Set(redo.filter((c) => c.startsWith("git rm")))], [`git rm -r -- ${dir}`], "one form of git rm, on the dated directory");
  assert.deepEqual(redo.flatMap((c, i) => (c.startsWith("git clean -f -d -- ") && redo[i - 1] !== c.replace("git clean -f -d", "git clean -n -d") ? [c] : [])), [], "every git clean -f comes right after its git clean -n dry run on the same path");
  assert.deepEqual(redo.filter((c) => c.startsWith("git restore") && !c.startsWith("git restore --staged -- ")), [], "every git restore cited unstages, --staged");
});

// reddened by: a refusal of the publication gate cited under a name that scripts/spec-publish.mjs does not raise, or the usage exit of
// the writer cited otherwise than it returns it
// killer: docs/RUNBOOK-harness.md:366 CONST "`short_digest`" -> "`short_digests`"
test("runbook_retire_cites_the_refusals_of_the_gate_and_the_writer", async () => {
  const text = section().replace(/\s+/g, " "), gate = read("scripts", "spec-publish.mjs");
  const from = text.indexOf("Every refusal is named by its code"), cited = text.slice(from, text.indexOf("### 5.", from));
  const names = [...cited.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] ?? "");
  assert.ok(from >= 0 && names.length >= 9, "the refusals of the publication gate are cited");
  assert.deepEqual(names.filter((n) => !gate.includes(`"${n}"`)), [], "each refusal cited is raised by scripts/spec-publish.mjs");
  assert.ok(text.includes("`--check --date` is a usage error, exit 2"), "the writer's usage exit is cited");
  assert.equal(await writerMain(["--check", "--date", "2027-01-04"]), 2, "--check --date exits 2");
});

// G2 of #223, m-1: the notes N-1 to N-4 of this lot are pinned against the code they describe. Each test reads its expected value in
// the code (or in .gitattributes) and holds on every sentence of the section that makes the claim: the base text, which makes none,
// passes as is; a sentence of the lot turned against the code reddens it.

// reddened by: a clock refusal cited on the wrong side of the server clock, as kata-path.ts (stale) and tools/gate.ts (future) test it,
// or one of the two cited without the other
// killer: docs/RUNBOOK-harness.md:400 CONST "in the past is `produced_at_stale`" -> "in the past is `produced_at_future`"
test("runbook_retire_clock_refusals_face_the_way_the_code_tests_them", () => {
  const sideOf = (src: string, code: string): string => {
    const i = src.indexOf(`"${code}"`), cond = i < 0 ? "" : src.slice(src.lastIndexOf("if (", i), i);
    return /nowMs - at >/.test(cond) ? "past" : /at > nowMs \+/.test(cond) ? "future" : "unread";
  };
  const side: Record<string, string> = { produced_at_stale: sideOf(read("apps", "harness", "src", "kata-path.ts"), "produced_at_stale"), produced_at_future: sideOf(read("apps", "harness", "src", "tools", "gate.ts"), "produced_at_future") };
  assert.deepEqual({ ...side }, { produced_at_stale: "past", produced_at_future: "future" }, "the code tests a stale produced_at in the past, a future one in the future");
  const text = section().replace(/\s+/g, " "), said = [...text.matchAll(/in the (past|future) is `(produced_at_\w+)`/g)].map((m) => [m[2] ?? "", m[1] ?? ""]);
  assert.deepEqual(said.filter(([code, s]) => side[code ?? ""] !== s), [], "each clock refusal is cited on the side the code tests");
  assert.ok(said.length === 0 || said.length === 2, "the two clock refusals are cited together, or neither");
});

// reddened by: a reason said to be tested before (or after) another while kata-path.ts tests it after (or before), a reason the scale
// path does not return, or `out_of_support` named with no order sentence that the test reads
// killer: docs/RUNBOOK-harness.md:404 CONST "`out_of_support` (`kata-path.ts` l.93)" -> "`calib_retired` (`kata-path.ts` l.93)"
test("runbook_retire_support_precedes_retired_as_kata_path_tests_it", () => {
  const src = read("apps", "harness", "src", "kata-path.ts"), scale = src.slice(src.indexOf("const s = row.calib_support"));
  const at: Record<string, number> = { out_of_support: scale.indexOf('reason: "out_of_support"'), calib_retired: scale.indexOf("reason: calib }") };
  assert.ok(src.includes('retired: "calib_retired"') && at.out_of_support !== undefined && at.calib_retired !== undefined && at.out_of_support >= 0 && at.out_of_support < at.calib_retired, "kata-path tests the support before the retired status on a scale row");
  const text = section().replace(/\s+/g, " ");
  const said = [...text.matchAll(/`(\w+)` \(`kata-path\.ts` l\.\d+\) is tested (before|after) `(\w+)`/g)].map((m) => (m[2] === "before" ? [m[1] ?? "", m[3] ?? ""] : [m[3] ?? "", m[1] ?? ""]));
  assert.deepEqual(said.filter(([a, b]) => !((at[a ?? ""] ?? -1) >= 0 && (at[a ?? ""] ?? -1) < (at[b ?? ""] ?? -1))), [], "each order cited is the order of kata-path.ts");
  assert.ok(!text.includes("`out_of_support`") || said.length > 0, "a section that names out_of_support says its order in a sentence the test reads");
});

// reddened by: a git command of the section that converts line ends, the CRLF of a clone stated with no clone command that turns
// core.autocrlf off (or with one that leaves it on), or the governance tree said to keep LF while .gitattributes no longer forces it
// killer: docs/RUNBOOK-harness.md:358 CONST "`git -c core.autocrlf=false clone`" -> "`git -c core.autocrlf=true clone`"
test("runbook_retire_line_ends_follow_the_attributes", () => {
  const text = section().replace(/\s+/g, " "), attrs = read(".gitattributes").split(/\r?\n/);
  const git = [...text.matchAll(/`(git [^`]*core\.autocrlf[^`]*)`/g)].map((m) => m[1] ?? "");
  assert.deepEqual(git.filter((c) => !c.includes("core.autocrlf=false")), [], "every git command that names core.autocrlf turns it off");
  const clones = [...text.matchAll(/`(git [^`]*\bclone\b[^`]*)`/g)].map((m) => m[1] ?? "");
  assert.ok(!text.includes("holds CRLF") || (clones.length > 0 && clones.every((c) => c.includes("core.autocrlf=false"))), "a section that says a clone holds CRLF makes every clone it cites with core.autocrlf=false");
  assert.ok(!text.includes("keeps LF whatever `core.autocrlf`") || attrs.includes("* text=auto eol=lf"), "the governance tree keeps LF by its .gitattributes");
});

// reddened by: a rebase of the lot branch said anywhere but under "never" (a rebase moves the committer dates T_b and T_c are read on)
// killer: docs/RUNBOOK-harness.md:380 CONST "never rebase it" -> "rebase it"
test("runbook_retire_lot_branch_is_never_rebased", () => {
  const text = section().replace(/\s+/g, " ");
  assert.deepEqual([...text.matchAll(/\brebase/gi)].map((m) => text.slice(Math.max(0, m.index - 12), m.index + 6)).filter((s) => !s.endsWith("never rebase")), [], "a rebase is cited only as never done");
});
