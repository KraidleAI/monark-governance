// MONARK Koyomi: the closed list of abstention codes (G0 KOYOMI-A DK-8, test 9). One signed line per slot, a forecast or an
// abstention named from this list; no code reads the state of a trading session. Namespace import: a symbol absent from the
// module reads undefined and fails an assertion, never the module link.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as A from "../src/abstain.ts";

const srcOf = (name: string): string => readFileSync(new URL(`../src/${name}.ts`, import.meta.url), "utf8");
/** The import specifiers of a module's source: static `from "..."`, bare `import "..."` and dynamic `import("...")`. */
const importsOf = (src: string): string[] => [...src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g)].map((m) => m[1] ?? "");

// killer: apps/koyomi/src/abstain.ts:21 CONST "\"input_late\"," -> "\"input_late\", \"market_closed\","
test("koyomi_abstain_closed_list", () => {
  assert.equal(Array.isArray(A.ABSTAIN_CODES), true, "abstain.ts exports ABSTAIN_CODES");
  // DK-8, word for word and in its order: eleven codes, no other.
  assert.deepEqual([...A.ABSTAIN_CODES], ["under_calib", "region_degenerate", "no_fill_in_window", "no_close_ref", "cash_cross_mismatch",
    "rebase_unverified", "corporate_action_in_window", "holiday", "straddle", "calendar_unknown", "input_late"]);
  assert.ok(Object.isFrozen(A.ABSTAIN_CODES), "the list cannot grow at run time");
  assert.equal(typeof A.isAbstainCode, "function", "abstain.ts exports isAbstainCode");
  for (const code of A.ABSTAIN_CODES) assert.equal(A.isAbstainCode(code), true, code);
  // A reason read from the session state is not a code; nor is a near miss, a non-string or an inherited key.
  for (const other of ["market_closed", "session_closed", "halted", "HOLIDAY", "holiday ", "", "toString", 7, null, undefined, {}])
    assert.equal(A.isAbstainCode(other), false, JSON.stringify(other) ?? "undefined");
  assert.equal(typeof A.assertAbstainCode, "function", "abstain.ts exports assertAbstainCode");
  assert.equal(A.assertAbstainCode("straddle"), "straddle");
  assert.throws(() => A.assertAbstainCode("market_closed"), /not a Koyomi abstention code: "market_closed"/);
  // No code reads the session state: the list module imports nothing, and no module of the lot reaches Bell's sessions
  // (C-A1-13 of the plan: only label-read.ts and input.ts import Bell; the calendar reaches slots and cuts as an argument).
  // killer: apps/koyomi/src/slots.ts:7 CONST "import type { AbstainCode } from \"./abstain.ts\";" -> "import type { AbstainCode } from \"./abstain.ts\"; import \"../../bell/src/sessions.ts\";"
  // The guard sees every form of import: static, type-only, bare (side effect only) and dynamic.
  assert.deepEqual(importsOf('import { a } from "./x.ts";\nimport type { B } from "./y.ts";\nimport "../../bell/src/sessions.ts";\nawait import("./z.ts");\n'),
    ["./x.ts", "./y.ts", "../../bell/src/sessions.ts", "./z.ts"], "a bare import of Bell is seen");
  assert.deepEqual(importsOf(srcOf("abstain")), [], "abstain.ts is a closed list, it imports nothing");
  for (const name of ["slots", "cut", "abstain"]) {
    const src = srcOf(name);
    assert.deepEqual(importsOf(src).filter((s) => !/^\.\/(slots|cut|abstain)\.ts$/.test(s)), [], `${name}.ts imports only the lot's own modules`);
    assert.doesNotMatch(src, /classifySession|sessionDateET|SessionLabel/, `${name}.ts reads no session state`);
  }
});
