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
import { fileURLToPath, pathToFileURL } from "node:url";
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
  const r = run(`throw new Error("boom at load");`); // Node 24.21.0 rethrows it from the booting harness (exit 7, origin unhandledRejection): neither is pinned
  assert.deepEqual([r.status !== 0, r.lines.some((l) => /^fixture: (uncaughtException|unhandledRejection) during load: Error: boom at load$/.test(l))], [true, true], "the cause on stdout, stderr gone");
});

// killer: test/helpers/keep-cause.ts:32 CONST "begun += 1" -> "begun += 0"
test("keep_cause_names_the_test_and_counts", () => {
  const r = run([`test("a", () => {});`, `test("b", async () => { await new Promise((ok) => { setImmediate(() => { setImmediate(ok); throw new Error("boom in b"); }); }); });`].join("\n")); // b ends only after its throw: no race
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

// Lot L2-BOOK-KEEP-CAUSE-1 (2026-10-05): test/l2-book.test.ts itself, run as the runner's child with a fault preloaded (--import) and its
// stderr dropped. A throw of its trap() and an exit inside its first test must each leave their "# keep-cause" line on stdout.
const BOOK = fileURLToPath(new URL("./l2-book.test.ts", import.meta.url));
/** The "# keep-cause" lines, the exit and the whole stdout of `file` (test/l2-book.test.ts) run with the module `inject` preloaded, stderr dropped. */
function runBook(inject: string, file = BOOK): { lines: string[]; status: number | null; out: string } {
  const pre = join(DIR, `inject-${String(++made)}.mjs`);
  writeFileSync(pre, `${inject}\n`);
  const r = spawnSync(process.execPath, [`--import=${pathToFileURL(pre).href}`, file], { env: { ...process.env, NODE_TEST_CONTEXT: "child-v8" }, stdio: ["ignore", "pipe", "ignore"], timeout: 120_000 });
  const out = r.stdout.toString("latin1");
  return { lines: [...out.matchAll(/# keep-cause ([^\n]*)\n/g)].map((m) => String(m[1])), status: r.status, out };
}

// killer: test/helpers/keep-cause.ts:33 CONST "ended += 1" -> "ended += 2"
test("keep_cause_l2_book_a_throw_of_trap_is_named_on_stdout", () => {
  const r = runBook(`const real = globalThis.fetch; Object.defineProperty(globalThis, "fetch", { configurable: true, get: () => real, set: () => { throw new Error("INJECTED at trap"); } });`);
  assert.deepEqual([r.status, r.lines, r.out.includes("INJECTED at trap")], [1, ["test/l2-book.test.ts: exit code 1 during between tests, tests begun 0, ended 6"], true], "six named reds carrying the cause, then the exit line");
});

// killer: test/helpers/keep-cause.ts:32 CONST "step = " -> "void "
test("keep_cause_l2_book_an_exit_in_a_test_is_named_on_stdout", () => {
  const r = runBook([`import fs from "node:fs";`, `import { syncBuiltinESMExports } from "node:module";`, `const real = fs.mkdtempSync;`,
    `fs.mkdtempSync = (p, o) => { if (String(p).includes("l2-book-")) process.exit(9); return real(p, o); };`, `syncBuiltinESMExports();`].join("\n"));
  assert.deepEqual([r.status, r.lines], [9, ['test/l2-book.test.ts: exit code 9 during test "l2_h_steps_table", tests begun 1, ended 0']], "no report of the test, but its name and the code");
});

// Lot L2-KEEP-CAUSE-REST-1 (2026-10-05): the four other L2 files that worked at load, run the same way. A throw of their trap(), or of the
// mkdtempSync of their root, must give their named reds carrying the cause, then their exit line, on stdout alone.
const TRAP = `const real = globalThis.fetch; Object.defineProperty(globalThis, "fetch", { configurable: true, get: () => real, set: () => { throw new Error("INJECTED at trap"); } });`;
const MKDTEMP = [`import fs from "node:fs";`, `import { syncBuiltinESMExports } from "node:module";`, `const real = fs.mkdtempSync;`,
  `fs.mkdtempSync = (p, o) => { if (String(p).includes("l2-segments-")) throw new Error("INJECTED at mkdtemp"); return real(p, o); };`, `syncBuiltinESMExports();`].join("\n");
/** [exit, "# keep-cause" lines, cause on stdout] of test/<name>.test.ts run with `inject` preloaded, stderr dropped. */
const seen = (name: string, inject: string, cause: string): [number | null, string[], boolean] => {
  const r = runBook(inject, fileURLToPath(new URL(`./${name}.test.ts`, import.meta.url)));
  return [r.status, r.lines, r.out.includes(cause)];
};
const named = (name: string, n: number): [number, string[], boolean] => [1, [`test/${name}.test.ts: exit code 1 during between tests, tests begun 0, ended ${String(n)}`], true];

// killer: test/helpers/keep-cause.ts:31 CONST "ended = 0" -> "ended = 1"
test("keep_cause_l2_rest_a_throw_of_trap_is_named_on_stdout", () => {
  assert.deepEqual(seen("l2-rest", TRAP, "INJECTED at trap"), named("l2-rest", 9), "nine named reds carrying the cause, then the exit line");
});

// killer: test/helpers/keep-cause.ts:38 CONST "ended ${String(ended)}" -> "ended ${String(begun)}"
test("keep_cause_l2_rest_tls_a_throw_of_trap_is_named_on_stdout", () => {
  assert.deepEqual(seen("l2-rest-tls", TRAP, "INJECTED at trap"), named("l2-rest-tls", 3), "three named reds carrying the cause, then the exit line");
});

// killer: test/helpers/keep-cause.ts:33 CONST "step = \"between tests\"" -> "void 0"
test("keep_cause_l2_fake_place_a_throw_of_trap_is_named_on_stdout", () => {
  assert.deepEqual(seen("l2-fake-place", TRAP, "INJECTED at trap"), named("l2-fake-place", 8), "eight named reds carrying the cause, then the exit line");
});

// killer: test/helpers/keep-cause.ts:38 CONST "${file}: exit code" -> "exit code"
test("keep_cause_l2_segments_a_throw_of_its_root_is_named_on_stdout", () => {
  assert.deepEqual(seen("l2-segments", MKDTEMP, "INJECTED at mkdtemp"), named("l2-segments", 6), "six named reds carrying the cause, then the exit line");
});
