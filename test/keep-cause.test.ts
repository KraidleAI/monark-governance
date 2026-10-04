// test/keep-cause.test.ts -- lot L2-LINKS-FILE-CRASH-1 (2026-10-04): the self-test of test/helpers/keep-cause.ts. Each case runs a
// fixture file as the runner runs a test file (a child with NODE_TEST_CONTEXT=child-v8, its reports serialized on stdout), with its
// stderr dropped, as the runner drops it under load: the cause must reach stdout alone. Each test names, on the line above it, the
// mutation of test/helpers/keep-cause.ts that reddens it (killer form of scripts/red-proof.mjs). Synthetic errors only.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describeCause, keepCause } from "./helpers/keep-cause.ts";

keepCause("test/keep-cause.test.ts");
const HELPER = new URL("./helpers/keep-cause.ts", import.meta.url).href;
let DIR = "", made = 0;
before(() => { DIR = mkdtempSync(join(tmpdir(), "keep-cause-")); });
after(() => { if (DIR !== "") rmSync(DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

/** The "# keep-cause" lines that a fixture of `body` writes on its stdout, run as the runner's child, its stderr dropped; and its exit. */
function run(body: string): { lines: string[]; status: number | null } {
  const file = join(DIR, `fixture-${String(++made)}.mjs`);
  writeFileSync(file, [`import { test } from "node:test";`, `import { keepCause } from ${JSON.stringify(HELPER)};`, `keepCause("fixture");`, body, ""].join("\n"));
  const r = spawnSync(process.execPath, [file], { env: { ...process.env, NODE_TEST_CONTEXT: "child-v8" }, stdio: ["ignore", "pipe", "ignore"], timeout: 60_000 });
  const lines = [...r.stdout.toString("latin1").matchAll(/# keep-cause ([^\n]*)\n/g)].map((m) => String(m[1]).replace(/ \| at .*$/, ""));
  return { lines, status: r.status };
}

// killer: test/helpers/keep-cause.ts:36 CONST "${origin} during ${step}" -> "${origin}"
test("keep_cause_a_throw_at_load_reaches_stdout", () => {
  const r = run(`throw new Error("boom at load");`); // the harness, still booting, throws it again: exit 7, no exit event (harness.js:124)
  assert.deepEqual([r.status, r.lines], [7, ["fixture: unhandledRejection during load: Error: boom at load"]], "the cause on stdout, stderr gone");
});

// killer: test/helpers/keep-cause.ts:32 CONST "begun += 1" -> "begun += 0"
test("keep_cause_names_the_test_and_counts", () => {
  const r = run([`test("a", () => {});`, `test("b", async () => { setImmediate(() => { throw new Error("boom in b"); }); await new Promise((ok) => { setTimeout(ok, 50); }); });`].join("\n"));
  assert.deepEqual([r.status, r.lines], [1, ['fixture: uncaughtException during test "b": Error: boom in b',
    "fixture: exit code 1 during between tests, tests begun 2, ended 2"]]);
});

// killer: test/helpers/keep-cause.ts:38 CONST "if (code !== 0)" -> "if (code > 7)"
test("keep_cause_an_exit_inside_a_test_names_it", () => {
  const r = run([`test("a", () => {});`, `test("c", () => { process.exit(7); });`].join("\n"));
  assert.deepEqual([r.status, r.lines], [7, ['fixture: exit code 7 during test "c", tests begun 2, ended 1']], "no report of c, but its name and the code");
});

// killer: test/helpers/keep-cause.ts:38 CONST "code !== 0" -> "code !== 1"
test("keep_cause_silent_on_a_green_file", () => {
  assert.deepEqual(run(`test("a", () => {});`), { lines: [], status: 0 });
});

// killer: test/helpers/keep-cause.ts:17 CONST "slice(0, 6)" -> "slice(0, 1)"
test("keep_cause_describes_on_one_line", () => {
  const e = new Error("x");
  e.stack = ["Error: x", ...Array.from({ length: 8 }, (_, i) => `    at f${String(i)} (synthetic.ts:${String(i + 1)}:1)`)].join("\n");
  const d = describeCause(e);
  assert.deepEqual([d.startsWith("Error: x | at "), d.includes("\n"), d.split(" | ").length, describeCause("plain")], [true, false, 6, "plain"]);
});
