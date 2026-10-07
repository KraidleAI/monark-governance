// test/runbook-retire.test.ts -- item RETIRE-RUNBOOK-1 (ENGINE-ROW-RETIRE-PATH-1; docs/G0-lot-retire-latency-rehearsal-1.md): the
// retire section of docs/RUNBOOK-harness.md quotes the scripts it runs. Every expected value is READ from the scripts, never typed
// here (the pattern of srf_runbook_harness_names_every_check, test/surfaces-1-1-0.test.ts): the seven instants of
// scripts/retire-latency.mjs, one per step and in its order; its closed input, which the report accepts once the instants are
// filled; the retire list directory and the redo rule of scripts/spec-policy-tables.mjs; the usage of the writer and of the
// latency report; every script the section runs exists, and the publication command parses as scripts/spec-publish.mjs reads it,
// into a dated table version. Reads files, writes nothing. The lines above each test name the mutation that reddens it
// (scripts/red-proof.mjs convention).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { INSTANTS, report } from "../scripts/retire-latency.mjs";
import { RETIRE_DIR } from "../scripts/spec-policy-tables.mjs";
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

// reddened by: a step heading that names another instant than the script's, a step out of the order of INSTANTS, or one missing
// killer: docs/RUNBOOK-harness.md:366 CONST "(T_e)" -> "(T_f)"
test("runbook_retire_steps_carry_the_seven_instants_in_order", () => {
  const steps = [...section().matchAll(/^### (\d+)\. .*\((T_[a-z])\)$/gm)].map((m) => [Number(m[1]), m[2] ?? ""]);
  assert.deepEqual(steps, INSTANTS.map(([name], i) => [i + 1, name]), "steps 1 to 7 carry T_a to T_g, in the order of scripts/retire-latency.mjs");
});

// reddened by: the input shown off the closed format retire-latency-v1 (its format, a key, the cycle, an instant name or their
// order), or a second input shown
// killer: docs/RUNBOOK-harness.md:399 CONST "\"format\": \"retire-latency-v1\"" -> "\"format\": \"retire-latency-v2\""
test("runbook_retire_shows_the_closed_latency_input", () => {
  const blocks = [...section().matchAll(/```json\n([\s\S]*?)```/g)].map((m) => admit(() => JSON.parse(m[1] ?? "") as { instants: Record<string, string> }, "the input shown parses"));
  assert.equal(blocks.length, 1, "one input is shown");
  const shown = blocks[0] ?? { instants: {} }, at = (h: number): string => new Date(Date.UTC(2027, 0, 4, 9 + h)).toISOString().replace(".000Z", "Z");
  const filled = { ...shown, instants: Object.fromEntries(Object.keys(shown.instants).map((name, h) => [name, at(h)])) };
  assert.equal(admit(() => report(filled), "the report accepts the input shown, its instants filled in order").format, "retire-latency-report-v1");
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
  assert.deepEqual([...new Set(run)].sort(), ["scripts/retire-latency.mjs", "scripts/spec-policy-tables.mjs", "scripts/spec-publish.mjs", "scripts/verify-harness.mjs"], "the scripts the section runs");
  for (const s of run) assert.ok(existsSync(join(ROOT, s)), `${s} exists`);
  const line = /node scripts\/spec-publish\.mjs (--release [^`#]*?) ?(?:```|$)/.exec(text)?.[1] ?? "";
  const { parseArgs } = (await import(new URL("../scripts/spec-publish.mjs", import.meta.url).href)) as { parseArgs: (a: string[]) => { release: string; date: string; roots: Record<string, string> } };
  const a = admit(() => parseArgs(line.split(" ")), "spec-publish reads the publication command");
  assert.deepEqual([a.release, a.date, Object.keys(a.roots)], ["contract-1.1.0-tables-<YYYY-MM-DD>", "<YYYY-MM-DD>", ["previous"]], "the release of a dated directory, with the previous tree");
  assert.ok(versionDir(a.release.replace("<YYYY-MM-DD>", "2027-01-04")), "the release names a dated table version as spec-publish reads one");
});
