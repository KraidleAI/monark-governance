/**
 * Root test of test/helpers/inner-failures.ts (lot EXPORT-HARNESS-413-LOAD-1, extends EXPORT-TEST42-INNER-NAMES-1): test 42 names
 * each failing test of the exported CI WITH the text of its failing assertion. The two outputs below are the shapes Node 24 prints
 * for a failing subtest (spec reporter, the default of the nested `npm run ci`; TAP, the reporter of a nested run under a parent).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { innerFailures, ENTRIES } from "./helpers/inner-failures.ts";

const SPEC = [
  "▶ outer",
  "  ✖ oversized_body_413_and_normal_tools_call_unaffected (65.1ms)",
  "✖ outer (66.2ms)",
  "✔ good (0.2ms)",
  "ℹ tests 3",
  "ℹ fail 2",
  "",
  "✖ failing tests:",
  "",
  "test at apps/harness/test/server.test.ts:102:1",
  "✖ oversized_body_413_and_normal_tools_call_unaffected (65.1ms)",
  "  AssertionError [ERR_ASSERTION]: bad-Origin + oversized body ⇒ 403",
  "  ",
  "  0 !== 403",
  "  ",
  "      at TestContext.<anonymous> (file:///x/apps/harness/test/server.test.ts:136:12)",
  "      at async Test.run (node:internal/test_runner/test:1054:7) {",
  "    generatedMessage: false,",
  "    code: 'ERR_ASSERTION',",
  "    actual: 0,",
  "    expected: 403,",
  "    operator: 'strictEqual',",
  "    diff: 'simple'",
  "  }",
  "",
  "test at apps/harness/test/server.test.ts:90:1",
  "✖ outer (66.2ms)",
  "  'test failed'",
].join("\n");

const TAP = [
  "not ok 3 - oversized_body_413_and_normal_tools_call_unaffected",
  "  ---",
  "  duration_ms: 65.1",
  "  type: 'test'",
  "  location: '/x/apps/harness/test/server.test.ts:102:1'",
  "  failureType: 'testCodeFailure'",
  "  error: |-",
  "    bad-Origin + oversized body ⇒ 403",
  "    ",
  "    0 !== 403",
  "    ",
  "  code: 'ERR_ASSERTION'",
  "  ...",
  "ok 4 - harness_binds_localhost_only",
].join("\r\n");

// Test -- each failing test is named once, with its assertion message and actual/expected values (spec), or its YAML error (TAP);
// a test printed twice keeps the entry that carries the error; stack frames are dropped; the list is bounded.
// killer: test/helpers/inner-failures.ts:9 CONST "DETAIL = 6" -> "DETAIL = 0"
test("inner_failures_carry_the_failing_assertion_text", () => {
  const spec = innerFailures(SPEC);
  assert.equal(spec.length, 2, "the subtest and its parent, each once");
  assert.equal(spec[0], [
    "✖ oversized_body_413_and_normal_tools_call_unaffected (65.1ms)",
    "  AssertionError [ERR_ASSERTION]: bad-Origin + oversized body ⇒ 403",
    "  0 !== 403",
    "  generatedMessage: false,",
    "  code: 'ERR_ASSERTION',",
    "  actual: 0,",
    "  expected: 403,",
  ].join("\n"), "the failing assertion text follows the name; no stack frame");
  assert.equal(spec[1], "✖ outer (66.2ms)\n  'test failed'", "the parent keeps its own reason, cut at the next entry");
  const tap = innerFailures(TAP);
  assert.equal(tap.length, 1);
  assert.ok(tap[0]?.includes("  bad-Origin + oversized body ⇒ 403\n  0 !== 403"), `the TAP error is kept: ${tap[0] ?? ""}`);
  assert.ok(!tap[0]?.includes("duration_ms") && !tap[0]?.includes("harness_binds_localhost_only"), "no TAP bookkeeping, no next entry");
  const many = Array.from({ length: ENTRIES + 5 }, (_, i) => `✖ t${String(i)} (1ms)\n  AssertionError: m${String(i)}`).join("\n");
  assert.equal(innerFailures(many).length, ENTRIES, "the list is bounded");
  assert.deepEqual(innerFailures("✔ a (1ms)\nℹ fail 0"), [], "a green run names nothing");
});
