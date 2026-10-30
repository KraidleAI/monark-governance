// GENKAN - the mutant generator of the decoder (helpers/mutants.ts), pure: no Lean runs here (mutants.kernel.test.ts builds
// and runs the mutants of the real kernel). A Lean text written below holds each of the eight operators at least once and
// each case the rules skip: comments of the three kinds, a string, char literals, identifiers that end in digits or hold a
// prime, a projection, the tokens that start as an operator does, a `some` in a match pattern and one before a non-atom,
// and a `0` (no literal-1). Every mutant is checked against a list written by hand from the rules, in order.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mutantsOf, type Operator } from "./helpers/mutants.ts";

const OPERATORS: Operator[] = ["literal+1", "literal-1", "lt-to-le", "le-to-lt", "eq-to-ne", "and-to-or", "or-to-and", "some-to-none"];

// The text, one entry per line (line k of the text is SOURCE_LINES[k - 1]). Lines 1 to 6 and 8 and 10 hold no mutant.
const SOURCE_LINES = [
  "-- 1 < 2 && some x",
  "/-- 1 < 2 && some x -/",
  "/- a /- 1 < 2 && some x -/ 1 < 2 && some x -/",
  String.raw`def s := "7 == 8 || some y \" 9"`,
  String.raw`def c := ('9', '\n', '\x41', '\u{3b1}')`,
  "def i := u128 UInt8 sha256 x'1 p.1",
  "def t := do let a <- f <| g; if a <= b then 0 else 2",
  "def m := match o with",
  "  | some (a, b) => some a",
  "  | none => some ⟨a, b⟩",
  "def n := if 3 < 4 && b ≤ 5 then x == y || z else 10",
  "def k := (some (f (g x)), some {a := 7}, some o.val, some  q)",
];
const SOURCE = SOURCE_LINES.join("\n") + "\n";

// [line, column, operator, fragment, replacement], written by hand from the rules of helpers/mutants.ts.
const EXPECTED: [number, number, Operator, string, string][] = [
  // line 7: `<-`, `<|` and `<=` are not a `<` between white spaces; `0` has no literal-1.
  [7, 45, "literal+1", "0", "1"],
  [7, 52, "literal+1", "2", "3"],
  [7, 52, "literal-1", "2", "1"],
  // line 9: the first `some` is in the match pattern, the second after its `=>`.
  [9, 20, "some-to-none", "some a", "none"],
  // line 11: every operator but some-to-none.
  [11, 13, "literal+1", "3", "4"],
  [11, 13, "literal-1", "3", "2"],
  [11, 15, "lt-to-le", "<", "≤"],
  [11, 17, "literal+1", "4", "5"],
  [11, 17, "literal-1", "4", "3"],
  [11, 19, "and-to-or", "&&", "||"],
  [11, 24, "le-to-lt", "≤", "<"],
  [11, 26, "literal+1", "5", "6"],
  [11, 26, "literal-1", "5", "4"],
  [11, 35, "eq-to-ne", "==", "!="],
  [11, 40, "or-to-and", "||", "&&"],
  [11, 50, "literal+1", "10", "11"],
  [11, 50, "literal-1", "10", "9"],
  // line 12: the three atoms (a nested group, braces, a dotted identifier), a literal inside the braces; two spaces after
  // the last `some`: no atom follows one space.
  [12, 11, "some-to-none", "some (f (g x))", "none"],
  [12, 27, "some-to-none", "some {a := 7}", "none"],
  [12, 38, "literal+1", "7", "8"],
  [12, 38, "literal-1", "7", "6"],
  [12, 42, "some-to-none", "some o.val", "none"],
];

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/test/helpers/mutants.ts:145 CONST "String(n + 1n)" -> "String(n + 2n)"
test("mutants_operators_are_exact", () => {
  const file = "Genkan/Probe.lean";
  const mutants = mutantsOf(file, SOURCE);
  assert.deepEqual(
    mutants.map((m) => [m.line, m.column, m.operator, m.fragment, m.replacement]),
    EXPECTED,
    "every mutant of the text, in order, as the rules give them",
  );
  // Each mutant's text: the source with that one fragment replaced at its place.
  for (const m of mutants) {
    const what = `${String(m.line)}:${String(m.column)} ${m.operator}`;
    assert.equal(m.file, file, `${what}: the file as given`);
    const at = SOURCE_LINES.slice(0, m.line - 1).reduce((n, l) => n + l.length + 1, 0) + m.column - 1;
    assert.equal(SOURCE.slice(at, at + m.fragment.length), m.fragment, `${what}: the fragment stands at its line and column`);
    assert.equal(m.text, SOURCE.slice(0, at) + m.replacement + SOURCE.slice(at + m.fragment.length), `${what}: the mutated text`);
  }
  // Non-vacuity: the count, and each of the eight operators at least once.
  assert.equal(mutants.length, 22, "22 mutants");
  for (const op of OPERATORS) assert.ok(mutants.some((m) => m.operator === op), `the text holds a mutant of ${op}`);
  assert.equal(mutantsOf(file, "").length, 0, "an empty source has no mutant");
});
