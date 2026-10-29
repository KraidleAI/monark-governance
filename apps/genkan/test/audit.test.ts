// GENKAN - the source audit of the kernel, driven as a subprocess. It lexes Lean the way the pinned toolchain does where
// it matters (raw strings, char literals, guillemet names, interpolated strings, openers glued to code), refuses banned
// constructs in code position, foreign imports, an unpinned lakefile, and a theorem whose axiom closure leaves {propext,
// Classical.choice, Quot.sound}. Every case runs in a temporary tree under os.tmpdir(); axiom records come only from a file.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";

const AUDIT_MJS = fileURLToPath(new URL("../scripts/audit.mjs", import.meta.url));
const KERNEL_DIR = fileURLToPath(new URL("../kernel", import.meta.url));

const TMP = mkdtempSync(join(tmpdir(), "genkan-audit-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

const linesOf = (s: string | null): string[] => String(s ?? "").split(/\r?\n/).filter((l) => l.trim() !== "");
const show = (r: SpawnSyncReturns<string>): string =>
  `status=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\nstdout:\n${String(r.stdout)}\nstderr:\n${String(r.stderr)}`;

function run(script: string, args: string[], env: NodeJS.ProcessEnv): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, [script, ...args], { env, encoding: "utf8", stdio: "pipe", timeout: 30_000 });
}

/** Writes `files` (paths relative to the new kernel dir, forward slashes) and returns the kernel dir. */
let kernels = 0;
function makeKernel(files: Record<string, string>): string {
  const dir = join(TMP, `kernel-${String(++kernels)}`);
  mkdirSync(dir, { recursive: true });
  for (const [rel, body] of Object.entries(files)) {
    const abs = join(dir, ...rel.split("/"));
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body);
  }
  return dir;
}

let records = 0;
function axiomsFile(text: string): string {
  const abs = join(TMP, `axioms-${String(++records)}.txt`);
  writeFileSync(abs, text);
  return abs;
}

const audit = (kernel: string, axioms: string): SpawnSyncReturns<string> =>
  run(AUDIT_MJS, ["--kernel", kernel, "--axioms-from", axioms], { ...process.env });
const none = (n: string): string => `'${n}' does not depend on any axioms`;
const recordsFor = (names: string[]): string => axiomsFile(names.map(none).join("\n") + "\n");

/** The audit passed: exit 0, exactly one stdout line starting `audit: `, and no `audit:` line on stderr. */
function assertAuditPasses(r: SpawnSyncReturns<string>, what: string): void {
  assert.equal(r.status, 0, `${what}: the audit must pass\n${show(r)}`);
  const out = linesOf(r.stdout);
  assert.equal(out.length, 1, `${what}: exactly one stdout line on success\n${show(r)}`);
  assert.ok(out[0]!.startsWith("audit: "), `${what}: the success line starts with "audit: "\n${show(r)}`);
  assert.deepEqual(linesOf(r.stderr).filter((l) => l.startsWith("audit:")), [], `${what}: no audit line on stderr\n${show(r)}`);
}

/** The positioned findings of a run (`audit: <rel>:<line>: <what>`), sorted. */
const positioned = (r: SpawnSyncReturns<string>): string[] => linesOf(r.stderr).filter((l) => /^audit: [^\s:]+:\d+: /.test(l)).sort();
/** The axiom refusals of a run, sorted. */
const refusals = (r: SpawnSyncReturns<string>): string[] =>
  linesOf(r.stderr).filter((l) => /^audit: (?:.*: foreign axiom |.*: no axiom record$|unparsed axiom output: )/.test(l)).sort();

// A clean theorems file and its record, so the only findings of a kernel are the ones a case plants.
const CLEAN_THEOREMS = ["namespace Genkan", "theorem t : True := trivial", "end Genkan", ""].join("\n");
const CLEAN_RECORD = "'Genkan.t' does not depend on any axioms\n";

// The token-declaring commands, each banned: a notation can declare a token that holds a quote.
const TOKEN_WORDS = ["infix", "infixl", "infixr", "prefix", "postfix", "declare_syntax_cat", "binder_predicate"];
// Probes measured on the pinned toolchain, verbatim (each compiles there), with their exact findings as [line, what]. P8 is
// the control: a `--` after a space opens a comment, so its `"` opens nothing and the `sorry` of the next line is found.
const PROBES: Record<string, [string[], [number, string][]]> = {
  P6: [['def h : Nat := 1 +--"', "  2", "def v : Nat := sorry", 'def z : String := "x"'], [[1, "glued --"], [1, 'glued "'], [3, "banned sorry"]]],
  P7: [
    ['def h : Nat := 1--"', "instance : Neg (IO Int) := ⟨fun m => do pure (-(← m))⟩", "def v : IO Nat := do let _x : Int <--sorry; pure 0", 'def z : String := "x"'],
    [[1, "glued --"], [1, 'glued "'], [3, "glued --"], [3, "banned sorry"]],
  ],
  P8: [['def h : Nat := 1 --"', "def v : Nat := sorry", 'def z : String := "x"'], [[2, "banned sorry"]]],
  P9: [[String.raw`notation "a\"b" => (1 : Nat)`, 'def w : Nat := a"b', "def v : Nat := sorry", 'def z : String := "x"'], [[1, "banned notation"], [2, 'glued "'], [3, "banned sorry"]]],
  P10: [
    ["instance : CoeSort String Type := ⟨fun _ => Nat⟩", `def T : Type := Nat ×'"'x"`, "def v : Nat := sorry", 'def z : String := "x"'],
    [[2, "glued '"], [2, 'glued "'], [3, "banned sorry"]],
  ],
  // The attribute forms of initialize: compiling a module that imports P11 or P12 ran their IO (each wrote its file).
  P11: [
    [
      "-- The attribute form of `initialize`, anonymous: an `IO Unit` run when a module that imports this one is elaborated.",
      "@[init] def evilInit : IO Unit := do",
      '  match ← IO.getEnv "GENKAN_PROBE_OUT" with',
      String.raw`  | some f => IO.FS.writeFile f "anonymous init ran\n"`,
      "  | none => pure ()",
    ],
    [[2, "banned init"]],
  ],
  P12: [
    [
      "-- The attribute form of `initialize`, named: `mkVal` gives the value of `val` when a module that imports this one is elaborated.",
      "def mkVal : IO Nat := do",
      '  match ← IO.getEnv "GENKAN_PROBE_OUT2" with',
      String.raw`  | some f => IO.FS.writeFile f "named init ran\n"`,
      "  | none => pure ()",
      "  return 0",
      "",
      "@[init mkVal] opaque val : Nat",
    ],
    [[8, "banned init"]],
  ],
};
// The axioms of the pinned toolchain (measured: Lean 4.32.1 declares 15, all in Init) less the three admitted, each named as
// a kernel module would name it; the audit refuses the last component.
const FOREIGN_AXIOMS = [
  "sorryAx", "lcProof", "lcAny", "lcCast", "lcErased", "lcUnreachable", "lcVoid", "isScalarObj", "Quot.lcInv", "Lean.ofReduceBool",
  "Lean.ofReduceNat", "Lean.trustCompiler",
];
// Imports of modules that are not Genkan's plain ones: foreign packages, a module under a nested .lake (lake builds
// Genkan.«.lake».Hidden from Genkan/.lake/Hidden.lean once the kernel has its Genkan library, measured), guillemet and
// lower-case components.
const FOREIGN_IMPORTS = ["Lean", "Std.Data", "Genkan.«.lake».Hidden", "Genkan.«Judge»", "Genkan.judge"];

// killer: apps/genkan/scripts/audit.mjs:168 COR "i === 0 || WHITE" -> "i === 0 && WHITE"
test("audit_refuses_banned_construct", () => {
  // (1) Each finding at its exact line. The header block comment spans two lines (line numbers are kept) and the line
  // comment holds a block opener (it opens nothing). The `sorry` lines from `def q` on each defeat a naive lexer: a char
  // literal `'"'`, a raw string with no escapes, comment openers inside strings, a guillemet name holding a quote, code
  // inside interpolated strings (one with a nested string), and `!sorry`.
  const judge: [string, string | string[] | null][] = [
    ["/- a header comment", null],
    ["   spanning two lines -/", null],
    ["-- /- this does not open a block comment", null],
    ["namespace Genkan", null],
    [`def q : Char := '"'`, null],
    ["def a : Nat := sorry", "banned sorry"],
    ["axiom b : Nat", "banned axiom"],
    ["def c : Bool := by native_decide", "banned native_decide"],
    ["@[implemented_by a] def d : Nat := 0", "banned implemented_by"],
    ['@[extern "lean_genkan_e"] opaque e : Nat', "banned extern"],
    ["unsafe def f : Nat := 0", "banned unsafe"],
    ["partial def g (n : Nat) : Nat := g n", "banned partial"],
    ["theorem h : True := trivial", "banned theorem"],
    [String.raw`def u : String := "trailing backslash \\" ++ toString sorry`, "banned sorry"],
    [String.raw`def r : String := r"a\" ++ toString sorry`, "banned sorry"],
    ['def w : String := "--" ++ toString sorry', "banned sorry"],
    ['def y : String := "/-" ++ toString sorry ++ "-/"', "banned sorry"],
    ['def «a"b» : Nat := sorry', "banned sorry"],
    ['def i : String := s!"{(sorry : Nat)}"', "banned sorry"],
    ['def j : String := s!"{f "x" ++ toString sorry}"', "banned sorry"],
    ['def i2 : Std.Format := f!"{(sorry : Nat)}"', "banned sorry"],
    ['def i3 : IO Unit := println! "{(sorry : Nat)}"', "banned sorry"],
    ["def k : Bool := !sorry", "banned sorry"],
    ["set_option debug.skipKernelTC true in", "banned skipKernelTC"],
    ["def m : Nat := debug.«skipKernelTC»", "banned skipKernelTC"],
    ["example : True := by admit", "banned admit"],
    ["example : True := by stop", "banned stop"],
    ['macro "gm" : term => default', "banned macro"],
    ["macro_rules | _ => default", "banned macro_rules"],
    ['syntax "gs" : term', "banned syntax"],
    ['elab "ge" : term => default', "banned elab"],
    ["elab_rules : term | _ => default", "banned elab_rules"],
    ["initialize gi : Nat ← pure 0", "banned initialize"],
    ["builtin_initialize gb : Nat ← pure 0", "banned builtin_initialize"],
    ["run_cmd pure ()", "banned run_cmd"],
    ["run_elab pure ()", "banned run_elab"],
    ["run_meta pure ()", "banned run_meta"],
    ["#eval 1", "banned #eval"],
    ["#eval! 1", "banned #eval"],
    // An opener glued to code is refused (Lean reads `<-` then `-sorry`, `\/` then `-sorry`), and lexing goes on as code; a
    // guillemet component is read as its content; a `-/` right after a letter still closes a block comment; a raw string
    // glued to `(` is refused, and its text read as code.
    ["def v1 : IO Nat := do let _x <--sorry; pure 0", ["glued --", "banned sorry"]],
    [String.raw`def v2 : Prop := True \/-sorry -/ False`, ["glued /-", "banned sorry"]],
    ["@[«implemented_by» g] def v3 (n : Nat) : Nat := n", ["glued «", "banned implemented_by"]],
    ["def v4 : Nat := «sorry»", "banned sorry"],
    ["def v5 : Nat := «axiom»", "banned axiom"],
    ["/- closes right after a letter x-/ def v6 : Nat := sorry", "banned sorry"],
    ['def v11 : String := (r"sorry")', ["glued r", 'glued "', "banned sorry"]],
    // The attribute forms of initialize (P11, P12) and export; foreign axioms through a qualified, a guillemet and an
    // opened name.
    ["@[init] def gi2 : IO Unit := pure ()", "banned init"],
    ["@[builtin_init] def gb2 : IO Unit := pure ()", "banned builtin_init"],
    ["@[export genkan_gx] def gx : Nat := 0", "banned export"],
    ["def ax1 : Nat := sorryAx Nat", "banned sorryAx"],
    ["def ax2 : Nat := _root_.«sorryAx» Nat", "banned sorryAx"],
    ["def ax3 : True := Lean.«trustCompiler»", "banned trustCompiler"],
    ["open Lean in def ax4 : Bool := ofReduceBool", "banned ofReduceBool"],
    ["end Genkan", null],
  ];
  const dirty = makeKernel({
    "Genkan/Judge.lean": judge.map(([l]) => l).join("\n") + "\n",
    "Genkan/Imports.lean": FOREIGN_IMPORTS.map((m) => `import ${m}`).join("\n") + "\n",
    "Genkan/Tok.lean": TOKEN_WORDS.map((w) => `${w} gk_${w} " x "`).join("\n") + "\n",
    "Genkan/Axioms.lean": FOREIGN_AXIOMS.map((n, i) => `def fa${String(i)} := @${n}`).join("\n") + "\n",
    ...Object.fromEntries(Object.entries(PROBES).map(([p, [text]]) => [`Genkan/${p}.lean`, text.join("\n") + "\n"])),
    "Genkan/Theorems.lean": CLEAN_THEOREMS,
    // A nested .lake is read (the measured probe: lake builds it into the program), and so is a source whose extension a
    // file system that ignores case reads as .lean; only the build dir at the root is skipped.
    "Genkan/.lake/Hidden.lean": "def hidden : Nat := sorry\n",
    "Genkan/Upper.LEAN": "def up : Nat := sorry\n",
    ".lake/packages/x/Bad.lean": "import Lean\naxiom bad : False\ndef z : Nat := sorry\n",
  });
  const r = audit(dirty, axiomsFile(CLEAN_RECORD));
  assert.equal(r.status, 1, `a banned construct must fail the audit\n${show(r)}`);
  const expected = [
    ...judge.flatMap(([, w], i) => [w ?? []].flat().map((x) => `audit: Genkan/Judge.lean:${String(i + 1)}: ${x}`)),
    ...TOKEN_WORDS.map((w, i) => `audit: Genkan/Tok.lean:${String(i + 1)}: banned ${w}`),
    ...FOREIGN_AXIOMS.map((n, i) => `audit: Genkan/Axioms.lean:${String(i + 1)}: banned ${n.slice(n.lastIndexOf(".") + 1)}`),
    ...Object.entries(PROBES).flatMap(([p, [, want]]) => want.map(([l, x]) => `audit: Genkan/${p}.lean:${String(l)}: ${x}`)),
    ...FOREIGN_IMPORTS.map((m, i) => `audit: Genkan/Imports.lean:${String(i + 1)}: foreign import ${m}`),
    "audit: Genkan/.lake/Hidden.lean:1: banned sorry",
    "audit: Genkan/Upper.LEAN:1: banned sorry",
  ].sort();
  assert.equal(
    expected.length,
    95,
    "non-vacuity: 53 findings in Judge.lean, 7 token commands, 12 foreign axioms, 16 in the probes, 5 foreign imports, 2 sources",
  );
  // Exact set: every planted finding at its file and line, nothing from Theorems.lean, nothing from the root's .lake.
  assert.deepEqual(positioned(r), expected, `each finding is named with its file and line, and only those\n${show(r)}`);

  // (2) The same words only in comments (nested too), plain, escaped, raw and interpolated string text, and char literals;
  // near misses that are not single whole names; local imports; ghost theorems in comments; a banned word under .lake.
  // The audit passes. A scanner that ends a block comment at the first `-/`, ends a string at an escaped quote, ends a raw
  // string at the first `"`, or reads `'` inside a name as a char literal would see a word here.
  const clean = makeKernel({
    "Genkan/Judge.lean": [
      "namespace Genkan",
      "-- sorry admit stop axiom native_decide implemented_by extern unsafe partial theorem skipKernelTC #eval run_cmd",
      "/- outer: sorry axiom",
      "   /- inner: native_decide implemented_by -/",
      "   still outer: extern unsafe partial theorem macro syntax elab initialize -/",
      'def s0 : String := "sorry axiom native_decide implemented_by extern unsafe partial theorem skipKernelTC"',
      String.raw`def t0 : String := "escaped quote \" sorry, escaped backslash \\ axiom"`,
      "def sorry_free : Nat := 0",
      "def axioms : Nat := sorry_free",
      "def p : Nat := Foo.unsafe",
      "def partial' : Nat := 0",
      "def theorem2 : Nat := 0",
      String.raw`def c : String := r#"x" sorry "y"#`,
      String.raw`def c2 : Char := '\''`,
      String.raw`def c3 : Char := '\\'`,
      "def x' : Nat := 0",
      "def x'' : Nat := x'",
      'def s : String := "{sorry}"',
      'def t : String := s!"text sorry {1 + 1}"',
      'def t2 : Std.Format := f!"text sorry {1}"',
      "def n : Nat := a!sorry",
      "#print axioms Genkan.t",
      "#check Nat",
      // Controls: `--` and `/-` after a space or a tab still open a comment, and a block comment still nests, an opener
      // right after a letter included.
      "def v7 : Nat := 0 -- sorry",
      "def v8 : Nat := 0\t-- axiom",
      "def v9 : Prop := True /- sorry -/",
      "def v10 : Nat := 0 /- outer x/- nested -/ sorry -/",
      // Not openers: an apostrophe outside the char shape, a dotted guillemet component (after a name, and after the `.1`
      // of a projection, whose `.` the scanner reads itself), a head then a space, a spaced string; then the first line of
      // the measured control probe (P8 above), whose next line stays code.
      "def k2 : Type := Nat ×' Nat", "def k3 := Foo.«bar»", "def k3b (p : Prod Nat Nat) : Nat := p.1.«succ»",
      'def k4 : String := s! "x"', 'def k5 : String := ( "a" )',
      'def h : Nat := 1 --"', 'def h2 : String := "sorry"',
      // Near misses of the attribute words and the foreign axioms, the same words in a comment and a string, and a keyword
      // as the guillemet component of a dotted name.
      "def initial : Nat := 0", "def exported : Nat := initial", "def sorryAxe : Nat := 0", "def lcProofs : Nat := sorryAxe",
      "-- @[init] export sorryAx Lean.ofReduceBool", 'def s1 : String := "@[init] export sorryAx Lean.ofReduceBool"',
      "def k6 := Foo.«unsafe»",
      "end Genkan",
      "",
    ].join("\n"),
    "Genkan/Lead.lean": "/- sorry at the start of the file -/\ndef l : Nat := 0\n",
    "Genkan/Uses.lean": "import Genkan\nimport Genkan.Judge\nimport Genkan.V2\n",
    "Genkan/.lake/Fine.lean": "def fine : Nat := 0\n",
    "Genkan/Theorems.lean": [
      "namespace Genkan",
      "-- theorem ghost : True := trivial",
      "/- theorem ghost2 : True := trivial -/",
      "theorem t : True := trivial",
      "end Genkan",
      "",
    ].join("\n"),
    ".lake/build/ir/Bad.lean": "import Lean\ndef z : Nat := sorry\naxiom bad : False\n",
  });
  assertAuditPasses(audit(clean, axiomsFile(CLEAN_RECORD)), "banned words in comments, strings, char literals and the root's .lake only");
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/audit.mjs:428 ROR "sha !== LAKEFILE_SHA256" -> "sha === LAKEFILE_SHA256"
test("audit_pins_lakefile", () => {
  // The real lakefile next to the scripts is the pinned one: its copy passes, with LF or CRLF line ends.
  const realPath = join(KERNEL_DIR, "lakefile.lean");
  assert.ok(existsSync(realPath), `the pinned lakefile must exist next to the scripts: ${realPath}`);
  const real = readFileSync(realPath, "utf8");
  const lf = real.replace(/\r\n/g, "\n");
  const withLakefile = (body: string): string => makeKernel({ "lakefile.lean": body, "Genkan/Theorems.lean": CLEAN_THEOREMS });
  assertAuditPasses(audit(withLakefile(real), axiomsFile(CLEAN_RECORD)), "the pinned lakefile");
  assertAuditPasses(audit(withLakefile(lf.replace(/\n/g, "\r\n")), axiomsFile(CLEAN_RECORD)), "the pinned lakefile with CRLF");

  // One appended comment line changes its sha256: refused.
  const r = audit(withLakefile(lf + (lf.endsWith("\n") ? "" : "\n") + "-- x\n"), axiomsFile(CLEAN_RECORD));
  assert.equal(r.status, 1, `a changed lakefile must fail the audit\n${show(r)}`);
  const own = linesOf(r.stderr).filter((l) => l.startsWith("audit: lakefile."));
  assert.equal(own.length, 1, `exactly one lakefile refusal\n${show(r)}`);
  assert.match(own[0]!, /^audit: lakefile\.lean: differs from the pinned sha256 [0-9a-f]{12}$/, "the refusal quotes 12 hex characters");

  // A lakefile.toml at the kernel root, whatever it holds: refused.
  const toml = makeKernel({ "lakefile.toml": 'name = "genkan"\n', "Genkan/Theorems.lean": CLEAN_THEOREMS });
  const t = audit(toml, axiomsFile(CLEAN_RECORD));
  assert.equal(t.status, 1, `a lakefile.toml must fail the audit\n${show(t)}`);
  assert.ok(linesOf(t.stderr).includes("audit: lakefile.toml: lakefile.toml refused"), `the refusal names lakefile.toml\n${show(t)}`);

  // In any case: a file system that ignores case finds LAKEFILE.toml as lakefile.toml.
  const upper = makeKernel({ "LAKEFILE.toml": 'name = "genkan"\n', "Genkan/Theorems.lean": CLEAN_THEOREMS });
  const u = audit(upper, axiomsFile(CLEAN_RECORD));
  assert.equal(u.status, 1, `a LAKEFILE.toml must fail the audit\n${show(u)}`);
  assert.ok(linesOf(u.stderr).includes("audit: LAKEFILE.toml: lakefile.toml refused"), `the refusal names LAKEFILE.toml\n${show(u)}`);
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/audit.mjs:326 CONST "name?.length ?? 1" -> "name?.length ?? 0"
test("audit_refuses_foreign_axiom", () => {
  const kernel = makeKernel({
    "Genkan/Theorems.lean": ["namespace Genkan", "theorem a : True := trivial", "theorem b : True := trivial", "end Genkan", ""].join("\n"),
  });
  const B_NONE = none("Genkan.b");

  // (1) An axiom outside the three: refused, naming it; propext alone is not.
  const r1 = audit(kernel, axiomsFile(["'Genkan.a' depends on axioms: [propext, sorryAx]", B_NONE, ""].join("\n")));
  assert.equal(r1.status, 1, `a foreign axiom must fail the audit\n${show(r1)}`);
  assert.deepEqual(refusals(r1), ["audit: Genkan.a: foreign axiom sorryAx"], `the refusal names sorryAx and only it\n${show(r1)}`);

  // (2) The three admitted axioms, in a list Lean wrapped over three lines, and a theorem with none: the audit passes.
  const wrapped = ["'Genkan.a' depends on axioms: [propext,", "  Classical.choice,", "  Quot.sound]", B_NONE].join("\n");
  assertAuditPasses(audit(kernel, axiomsFile(wrapped + "\n")), "admitted axioms, wrapped list");

  // (3) No record for a declared theorem: refused.
  const r3 = audit(kernel, axiomsFile("'Genkan.a' depends on axioms: [propext]\n"));
  assert.equal(r3.status, 1, `a theorem without a record must fail the audit\n${show(r3)}`);
  assert.deepEqual(refusals(r3), ["audit: Genkan.b: no axiom record"], `the refusal names Genkan.b\n${show(r3)}`);

  // (4) A non-blank line of neither form after valid records: refused, with its first 80 characters.
  const junk = "this line is neither form " + "z".repeat(90);
  const r4 = audit(kernel, axiomsFile(wrapped + "\n" + junk + "\n"));
  assert.equal(r4.status, 1, `unparsed axiom output must fail the audit\n${show(r4)}`);
  assert.deepEqual(refusals(r4), [`audit: unparsed axiom output: ${junk.slice(0, 80)}`], `the refusal quotes the first 80 characters\n${show(r4)}`);

  // (5) Full names follow nested namespaces, `end` pops one level, and Vectors.lean declares theorems too.
  const nested = makeKernel({
    "Genkan/Theorems.lean": [
      "namespace Genkan",
      "theorem a : True := trivial",
      "namespace Inner",
      "theorem c : True := trivial",
      "end Inner",
      "theorem b : True := trivial",
      "end Genkan",
      "",
    ].join("\n"),
    "Genkan/Vectors.lean": ["namespace Genkan", "theorem v : True := trivial", "end Genkan", ""].join("\n"),
  });
  assertAuditPasses(audit(nested, recordsFor(["Genkan.a", "Genkan.Inner.c", "Genkan.b", "Genkan.v"])), "nested namespaces and Vectors.lean");
  const r5 = audit(nested, recordsFor(["Genkan.a", "Genkan.b"]));
  assert.equal(r5.status, 1, `missing records must fail the audit\n${show(r5)}`);
  assert.deepEqual(refusals(r5), ["audit: Genkan.Inner.c: no axiom record", "audit: Genkan.v: no axiom record"], `every missing record is named, not only the first\n${show(r5)}`);

  // (6) Sections, named or not, add no name part; `namespace A.B` adds two and `end A.B` removes them; a dotted theorem
  // name and an attribute before `theorem` are read as Lean reads them.
  const sections = makeKernel({
    "Genkan/Theorems.lean": [
      "namespace Genkan",
      "section S",
      "theorem s1 : True := trivial",
      "end S",
      "section",
      "theorem s2 : True := trivial",
      "end",
      "theorem after : True := trivial",
      "namespace Inner.Deep",
      "theorem d : True := trivial",
      "end Inner.Deep",
      "theorem Foo.f : True := trivial",
      "@[simp] theorem s : True := trivial",
      "end Genkan",
      "",
    ].join("\n"),
  });
  const names = ["Genkan.s1", "Genkan.s2", "Genkan.after", "Genkan.Inner.Deep.d", "Genkan.Foo.f", "Genkan.s"];
  assertAuditPasses(audit(sections, recordsFor(names)), "sections, a dotted namespace, a dotted name and an attribute");
  const r6 = audit(sections, recordsFor(names.filter((n) => n !== "Genkan.after")));
  assert.equal(r6.status, 1, `a dropped record must fail the audit\n${show(r6)}`);
  assert.deepEqual(refusals(r6), ["audit: Genkan.after: no axiom record"], `the dropped record's theorem is named\n${show(r6)}`);

  // (7) Without --axioms-from there are no records (Lean never runs): a declared theorem is refused, a kernel without
  // theorems passes.
  const one = makeKernel({ "Genkan/Theorems.lean": ["namespace Genkan", "theorem a : True := trivial", "end Genkan", ""].join("\n") });
  const r7 = run(AUDIT_MJS, ["--kernel", one], { ...process.env });
  assert.equal(r7.status, 1, `no records: a declared theorem must fail the audit\n${show(r7)}`);
  assert.deepEqual(refusals(r7), ["audit: Genkan.a: no axiom record"], `the theorem without a record is named\n${show(r7)}`);
  const mainOnly = makeKernel({ "Main.lean": "def main : IO Unit := pure ()\n" });
  assertAuditPasses(run(AUDIT_MJS, ["--kernel", mainOnly], { ...process.env }), "no records, no theorem");

  // (8) Usage errors exit 2: an unknown flag, a missing axioms file, a missing kernel dir.
  const rec = recordsFor(["Genkan.a"]);
  const usage: [string, string[]][] = [
    ["an unknown flag", ["--kernel", one, "--axioms-from", rec, "--bogus"]],
    ["a missing axioms file", ["--kernel", one, "--axioms-from", join(TMP, "no-such-axioms.txt")]],
    ["a missing kernel dir", ["--kernel", join(TMP, "no-such-kernel"), "--axioms-from", rec]],
  ];
  for (const [what, args] of usage) {
    const u = run(AUDIT_MJS, args, { ...process.env });
    assert.equal(u.status, 2, `${what} is a usage error\n${show(u)}`);
  }
});
