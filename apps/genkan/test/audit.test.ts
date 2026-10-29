// GENKAN - the source audit of the kernel, driven as a subprocess. It lexes Lean the way the pinned toolchain does where
// it matters (raw strings, char literals, guillemet names, interpolated strings, openers glued to code), refuses banned
// constructs in code position, # commands other than #check and #print, foreign imports, an unpinned lakefile, the word
// private in the theorem files, and a record of main or of a theorem whose axiom closure leaves {propext, Classical.choice,
// Quot.sound}; main and each theorem must have a record unless --source-only asks for the source rules only, and --roots
// prints the roots whose records are asked for. Every case runs in a temporary tree under os.tmpdir(); axiom records come
// only from a file.
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
const MAIN_NONE = none("main");
/** Records with no axiom for `names` and for main, which given records must hold. */
const recordsFor = (names: string[]): string => axiomsFile([...names.map(none), MAIN_NONE].join("\n") + "\n");

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

// A clean theorems file and its records (main's included), so the only findings of a kernel are the ones a case plants.
const CLEAN_THEOREMS = ["namespace Genkan", "theorem t : True := trivial", "end Genkan", ""].join("\n");
const CLEAN_RECORD = "'Genkan.t' does not depend on any axioms\n'main' does not depend on any axioms\n";

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
  // A sorry inside dbg_trace's interpolated string compiled (P13); #guard ran its term while the file was elaborated (P14);
  // the three options made Lean accept false claims through sorryAx (P15); decide's native mode added an axiom of its own
  // in each spelling (P16, P17).
  P13: [
    ["-- A sorry inside the code part of dbg_trace's interpolated string (the review's case).", 'def x : Nat := dbg_trace "{(sorry : Nat)}"; 0'],
    [[2, "banned dbg_trace"], [2, "banned sorry"]],
  ],
  P14: [
    ["-- #guard compiles and runs its term while the file is elaborated.", '#guard (dbgTrace "guard ran while the file was elaborated" fun _ => true)'],
    [[2, "banned #guard"], [2, "banned dbgTrace"]],
  ],
  P15: [
    [
      "-- The three options, each on a false claim: byAsSorry in a def, proofAsSorry in a theorem, terminalTacticsAsSorry on omega.",
      "set_option debug.byAsSorry true in",
      "def falseDef : { n : Nat // n > 0 } := ⟨0, by decide⟩",
      "",
      "set_option debug.proofAsSorry true in",
      "theorem falseThm : 0 > 0 := by decide",
      "",
      "set_option debug.terminalTacticsAsSorry true in",
      "def falseDef2 : { n : Nat // n > 0 } := ⟨0, by omega⟩",
      "",
      "#print axioms falseDef",
      "#print axioms falseThm",
      "#print axioms falseDef2",
    ],
    [[2, "banned set_option"], [5, "banned set_option"], [6, "banned theorem"], [8, "banned set_option"]],
  ],
  P16: [
    [
      "-- decide's native flag set through an anonymous constructor: no word native, no word axiom.",
      "def big2 : { n : Nat // n = 1 } := ⟨1, by decide (config := ⟨false, true, true, false⟩)⟩",
      "",
      "#print axioms big2",
    ],
    [[2, "banned config"]],
  ],
  P17: [
    [
      "-- decide's native mode through its flag and its named item: each adds an axiom of its own, the word axiom never written.",
      "def big : { n : Nat // n = 1 } := ⟨1, by decide +native⟩",
      "def big3 : { n : Nat // n = 1 } := ⟨1, by decide (native := true)⟩",
      "",
      "#print axioms big",
      "#print axioms big3",
    ],
    [[2, "banned native"], [3, "banned native"]],
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
// Init's debugging functions, each refused as a name component; the builtin terms whose message is an interpolated string
// after a name, each banned (the lexer reads that string as plain text, so the sorry in it is not seen: the word refuses);
// # commands other than #check and #print, each refused by its name.
const DEBUG_FUNCTIONS = ["dbgTrace", "dbgTraceVal", "dbgTraceIfShared", "dbgStackTrace", "dbgStackTraceIf", "dbgSleep"];
const NAMED_HEADS = ["throwNamedError", "throwNamedErrorAt", "logNamedError", "logNamedErrorAt", "logNamedWarning", "logNamedWarningAt"];
const HASH_REFUSED = ["#guard true", "#guard_msgs in #check 1", "#reduce 1", "#exit", "#synth Inhabited Nat", "#check_failure 1", "#time #check 1", "#where"];

// killer: apps/genkan/scripts/audit.mjs:198 COR "i === 0 || WHITE" -> "i === 0 && WHITE"
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
    ["set_option debug.skipKernelTC true in", ["banned set_option", "banned skipKernelTC"]],
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
    // dbg_trace in a do block (its string's code part is read), idbg, a qualified debugging function, an option in a term.
    ['def dd : IO Unit := do dbg_trace "{sorryAx Nat}"; pure ()', ["banned dbg_trace", "banned sorryAx"]],
    ["def id1 (n : Nat) : Nat := idbg n; n + 1", "banned idbg"],
    ["def db1 : Nat := _root_.dbgSleep 1 fun _ => 0", "banned dbgSleep"],
    ["def so : Nat := set_option pp.all true in 0", "banned set_option"],
    ["end Genkan", null],
  ];
  const dirty = makeKernel({
    "Genkan/Judge.lean": judge.map(([l]) => l).join("\n") + "\n",
    "Genkan/Imports.lean": FOREIGN_IMPORTS.map((m) => `import ${m}`).join("\n") + "\n",
    "Genkan/Tok.lean": TOKEN_WORDS.map((w) => `${w} gk_${w} " x "`).join("\n") + "\n",
    "Genkan/Axioms.lean": FOREIGN_AXIOMS.map((n, i) => `def fa${String(i)} := @${n}`).join("\n") + "\n",
    "Genkan/Debug.lean": DEBUG_FUNCTIONS.map((n, i) => `def db${String(i)} := @${n}`).join("\n") + "\n",
    "Genkan/Named.lean": NAMED_HEADS.map((w, i) => `def nh${String(i)} := ${w} lean.x "{(sorry : Nat)}"`).join("\n") + "\n",
    "Genkan/Hash.lean": HASH_REFUSED.join("\n") + "\n",
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
    ...DEBUG_FUNCTIONS.map((n, i) => `audit: Genkan/Debug.lean:${String(i + 1)}: banned ${n}`),
    ...NAMED_HEADS.map((w, i) => `audit: Genkan/Named.lean:${String(i + 1)}: banned ${w}`),
    ...HASH_REFUSED.map((c, i) => `audit: Genkan/Hash.lean:${String(i + 1)}: banned ${c.split(" ")[0]!}`),
    ...Object.entries(PROBES).flatMap(([p, [, want]]) => want.map(([l, x]) => `audit: Genkan/${p}.lean:${String(l)}: ${x}`)),
    ...FOREIGN_IMPORTS.map((m, i) => `audit: Genkan/Imports.lean:${String(i + 1)}: foreign import ${m}`),
    "audit: Genkan/.lake/Hidden.lean:1: banned sorry",
    "audit: Genkan/Upper.LEAN:1: banned sorry",
  ].sort();
  assert.equal(
    expected.length,
    132,
    "non-vacuity: 59 findings in Judge.lean, 7 token commands, 12 foreign axioms, 6 debugging functions, 6 named heads, 8 # commands, " +
      "27 in the probes, 5 foreign imports, 2 sources",
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
      // The words of the second review in a comment and in a plain string (its braces hold text), near misses of them, and
      // the # forms admitted besides #check: #print, the array and the vector literals.
      "-- dbg_trace idbg set_option native config dbgTrace throwNamedError #guard #reduce #exit",
      'def s2 : String := "dbg_trace {sorry} idbg set_option native config dbgTrace #guard"',
      "def natively : Nat := 0", "def configs : Nat := natively", "def dbgTraced : Nat := 0", "def idbgs : Nat := dbgTraced",
      "def vv : Vector Nat 2 := #v[1, 2]", "def aa : Array Nat := #[1, 2]", "#print Nat",
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

// killer: apps/genkan/scripts/audit.mjs:468 ROR "sha !== LAKEFILE_SHA256" -> "sha === LAKEFILE_SHA256"
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

// killer: apps/genkan/scripts/audit.mjs:361 CONST "name?.length ?? 1" -> "name?.length ?? 0"
// killer: apps/genkan/scripts/audit.mjs:485 CONST "if (!records.has(\"main\")) out.push(\"main: no axiom record\");" -> "if (false) out.push(\"main: no axiom record\");"
// killer: apps/genkan/scripts/audit.mjs:483 SDL "  for (const { name } of theorems) if (!records.has(name)) out.push(`${name}: no axiom record`);" -> ""
test("audit_refuses_foreign_axiom", () => {
  const kernel = makeKernel({
    "Genkan/Theorems.lean": ["namespace Genkan", "theorem a : True := trivial", "theorem b : True := trivial", "end Genkan", ""].join("\n"),
  });
  const B_NONE = none("Genkan.b");

  // (1) An axiom outside the three: refused, naming it; propext alone is not.
  const r1 = audit(kernel, axiomsFile(["'Genkan.a' depends on axioms: [propext, sorryAx]", B_NONE, MAIN_NONE, ""].join("\n")));
  assert.equal(r1.status, 1, `a foreign axiom must fail the audit\n${show(r1)}`);
  assert.deepEqual(refusals(r1), ["audit: Genkan.a: foreign axiom sorryAx"], `the refusal names sorryAx and only it\n${show(r1)}`);

  // (2) The three admitted axioms, in a list Lean wrapped over three lines, and a theorem with none: the audit passes.
  const wrapped = ["'Genkan.a' depends on axioms: [propext,", "  Classical.choice,", "  Quot.sound]", B_NONE, MAIN_NONE].join("\n");
  assertAuditPasses(audit(kernel, axiomsFile(wrapped + "\n")), "admitted axioms, wrapped list");

  // (3) No record for a declared theorem: refused.
  const r3 = audit(kernel, axiomsFile(["'Genkan.a' depends on axioms: [propext]", MAIN_NONE, ""].join("\n")));
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

  // (7) Bare (neither --axioms-from nor --source-only), records are required and none is given (Lean never runs): main and
  // each declared theorem are refused for want of a record, and a kernel without theorems fails too, on main's.
  const one = makeKernel({ "Genkan/Theorems.lean": ["namespace Genkan", "theorem a : True := trivial", "end Genkan", ""].join("\n") });
  const r7 = run(AUDIT_MJS, ["--kernel", one], { ...process.env });
  assert.equal(r7.status, 1, `no records: a declared theorem must fail the audit\n${show(r7)}`);
  assert.deepEqual(refusals(r7), ["audit: Genkan.a: no axiom record", "audit: main: no axiom record"], `the theorem and main, each without a record, are named\n${show(r7)}`);
  const mainOnly = makeKernel({ "Main.lean": "def main : IO Unit := pure ()\n" });
  const r7b = run(AUDIT_MJS, ["--kernel", mainOnly], { ...process.env });
  assert.equal(r7b.status, 1, `no records, no theorem: main's missing record must fail the audit\n${show(r7b)}`);
  assert.deepEqual(linesOf(r7b.stderr), ["audit: main: no axiom record"], `main without a record is named, and only it\n${show(r7b)}`);

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

  // (9) Given records, main is among them, within the three admitted axioms: a missing record of main is refused, and so
  // is the axiom decide's native mode adds (measured, P16) when it reaches main's record.
  const r9 = audit(mainOnly, axiomsFile(none("Genkan.other") + "\n"));
  assert.equal(r9.status, 1, `records without main must fail the audit\n${show(r9)}`);
  assert.deepEqual(refusals(r9), ["audit: main: no axiom record"], `the missing record of main is named\n${show(r9)}`);
  const r9b = audit(mainOnly, axiomsFile("'main' depends on axioms: [big2._native.decide.ax_1]\n"));
  assert.equal(r9b.status, 1, `a foreign axiom in main's record must fail the audit\n${show(r9b)}`);
  assert.deepEqual(refusals(r9b), ["audit: main: foreign axiom big2._native.decide.ax_1"], `the axiom is named\n${show(r9b)}`);
  assertAuditPasses(audit(mainOnly, axiomsFile("'main' depends on axioms: [propext, Quot.sound]\n")), "main within the admitted axioms");
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/audit.mjs:417 CONST "[KERNEL_FLAG, AXIOMS_FLAG, SOURCE_FLAG, ROOTS_FLAG].includes(flag)" -> "[KERNEL_FLAG, AXIOMS_FLAG, SOURCE_FLAG].includes(flag)"
// killer: apps/genkan/scripts/audit.mjs:420 SDL "  if (flag === SOURCE_FLAG || flag === ROOTS_FLAG) continue; // no value" -> ""
// killer: apps/genkan/scripts/audit.mjs:426 CONST ".filter((f) => seen.has(f)).length > 1)" -> ".filter((f) => seen.has(f)).length > 2)"
// killer: apps/genkan/scripts/audit.mjs:475 CONST "[{ module: \"Main\", name: \"main\" }, ...theorems]" -> "[...theorems]"
// killer: apps/genkan/scripts/audit.mjs:465 CONST ".split(\"/\").join(\".\")" -> ".split(\"/\").join(\"/\")"
// killer: apps/genkan/scripts/audit.mjs:476 SDL "  process.exit(0);" -> ""
// killer: apps/genkan/scripts/audit.mjs:479 CONST "if (!sourceOnly) {" -> "if (true) {"
// killer: apps/genkan/scripts/audit.mjs:493 CONST "sourceOnly ? \" (sources only)\" : \"\"" -> "\"\""
test("audit_modes_source_only_and_roots", () => {
  const env = { ...process.env };
  const MAIN = "def main : IO UInt32 := pure 3\n";
  const theorems = [
    "namespace Genkan",
    "theorem a : True := trivial",
    "namespace Inner",
    "theorem c : True := trivial",
    "end Inner",
    "theorem b : True := trivial",
    "end Genkan",
    "",
  ].join("\n");
  const vectors = ["namespace Genkan", "theorem v : True := trivial", "end Genkan", ""].join("\n");
  const full = makeKernel({ "Main.lean": MAIN, "Genkan/Theorems.lean": theorems, "Genkan/Vectors.lean": vectors });

  // (1) --source-only: the source rules only, no record read or required, its own success line; --kernel combines with it
  // in either order.
  for (const args of [["--kernel", full, "--source-only"], ["--source-only", "--kernel", full]]) {
    const s = run(AUDIT_MJS, args, env);
    assertAuditPasses(s, `${args.join(" ")}: a kernel with theorems and no records`);
    assert.deepEqual(linesOf(s.stdout), ["audit: 3 Lean files, 4 theorems, no finding (sources only)"], `the success line of the sources only\n${show(s)}`);
  }

  // (2) --source-only still fails on a source finding, with the same finding line, and asks for no record.
  const dirty = makeKernel({ "Main.lean": "def main : IO UInt32 := pure (UInt32.ofNat sorry)\n", "Genkan/Theorems.lean": theorems });
  const s2 = run(AUDIT_MJS, ["--kernel", dirty, "--source-only"], env);
  assert.equal(s2.status, 1, `--source-only: a source finding must fail the audit\n${show(s2)}`);
  assert.deepEqual(linesOf(s2.stderr), ["audit: Main.lean:1: banned sorry"], `the finding, and no record asked for\n${show(s2)}`);
  assert.deepEqual(linesOf(s2.stdout), [], `no success line\n${show(s2)}`);

  // (3) Usage errors, exit 2, in their form (`audit: <msg>` then the usage line): two modes or three, in either order; a flag
  // given twice; a word after a valueless flag, an unknown argument.
  const rec = recordsFor(["Genkan.a", "Genkan.Inner.c", "Genkan.b", "Genkan.v"]);
  const usage: [string, string[], string | null][] = [
    ["--axioms-from then --source-only", ["--axioms-from", rec, "--source-only"], null],
    ["--source-only then --axioms-from", ["--source-only", "--axioms-from", rec], null],
    ["--axioms-from then --roots", ["--axioms-from", rec, "--roots"], null],
    ["--roots then --axioms-from", ["--roots", "--axioms-from", rec], null],
    ["--source-only then --roots", ["--source-only", "--roots"], null],
    ["--roots then --source-only", ["--roots", "--source-only"], null],
    ["the three modes", ["--axioms-from", rec, "--source-only", "--roots"], null],
    ["--source-only twice", ["--source-only", "--source-only"], null],
    ["--roots twice", ["--roots", "--roots"], null],
    ["--axioms-from twice", ["--axioms-from", rec, "--axioms-from", rec], null],
    ["--kernel twice", ["--kernel", full, "--source-only"], null],
    ["a word after --source-only", ["--source-only", "x"], "audit: unknown argument x"],
    ["a word after --roots", ["--roots", "x"], "audit: unknown argument x"],
  ];
  for (const [what, args, first] of usage) {
    const u = run(AUDIT_MJS, ["--kernel", full, ...args], env);
    assert.equal(u.status, 2, `${what} is a usage error\n${show(u)}`);
    const lines = linesOf(u.stderr);
    assert.equal(lines.length, 2, `${what}: two stderr lines, the message then the usage line\n${show(u)}`);
    assert.ok(lines[0]!.startsWith("audit: ") && lines[1]!.startsWith("audit: usage: "), `${what}: the usage form\n${show(u)}`);
    if (first !== null) assert.equal(lines[0], first, `${what}: the word is an unknown argument\n${show(u)}`);
    else assert.doesNotMatch(lines[0]!, /^audit: unknown argument/, `${what}: each flag is known, the usage error is another one\n${show(u)}`);
    if (what.endsWith("twice")) assert.match(lines[0]!, /given twice/, `${what}: the message says the flag is given twice\n${show(u)}`);
    assert.deepEqual(linesOf(u.stdout), [], `${what}: nothing on stdout\n${show(u)}`);
  }

  // (4) Bare: records are required and none is given. A kernel without theorems fails on main's record; one with theorems
  // names main and each of them, with the source findings.
  const mainOnly = makeKernel({ "Main.lean": MAIN });
  const b1 = run(AUDIT_MJS, ["--kernel", mainOnly], env);
  assert.equal(b1.status, 1, `bare, no theorem: main's missing record must fail the audit\n${show(b1)}`);
  assert.deepEqual(linesOf(b1.stderr), ["audit: main: no axiom record"], `main is named, and only it\n${show(b1)}`);
  const b2 = run(AUDIT_MJS, ["--kernel", dirty], env);
  assert.equal(b2.status, 1, `bare, theorems and a source finding: the audit fails\n${show(b2)}`);
  assert.deepEqual(positioned(b2), ["audit: Main.lean:1: banned sorry"], `the source finding is reported\n${show(b2)}`);
  assert.deepEqual(
    refusals(b2),
    ["audit: Genkan.a: no axiom record", "audit: Genkan.Inner.c: no axiom record", "audit: Genkan.b: no axiom record", "audit: main: no axiom record"].sort(),
    `main and each theorem, each without a record\n${show(b2)}`,
  );

  // (5) --roots: `Main main` first (the walk reads Genkan/ before Main.lean), then each theorem file in walk order, each
  // theorem in declaration order with its full name; exit 0, nothing on stderr, whatever the findings: a banned word in
  // Main.lean, a theorem outside the theorem files (not a root), a lakefile.toml.
  const findings = makeKernel({
    "Main.lean": "def main : IO UInt32 := pure (UInt32.ofNat sorry)\n",
    "Genkan/Theorems.lean": theorems,
    "Genkan/Vectors.lean": vectors,
    "Genkan/Judge.lean": "theorem j : True := trivial\n",
    "lakefile.toml": 'name = "genkan"\n',
  });
  const ROOTS = ["Main main", "Genkan.Theorems Genkan.a", "Genkan.Theorems Genkan.Inner.c", "Genkan.Theorems Genkan.b", "Genkan.Vectors Genkan.v"];
  const roots = (kernel: string, want: string[], what: string): void => {
    for (const args of [["--kernel", kernel, "--roots"], ["--roots", "--kernel", kernel]]) {
      const r = run(AUDIT_MJS, args, env);
      assert.equal(r.status, 0, `${what}: --roots exits 0\n${show(r)}`);
      assert.equal(String(r.stdout), want.map((l) => `${l}\n`).join(""), `${what}: the roots, one line each, in order\n${show(r)}`);
      assert.equal(String(r.stderr), "", `${what}: nothing on stderr, no finding printed\n${show(r)}`);
    }
  };
  roots(findings, ROOTS, "Main, Theorems, Vectors and findings");
  // Non-vacuity: the same kernel holds findings the audit reports.
  const f = run(AUDIT_MJS, ["--kernel", findings, "--source-only"], env);
  assert.equal(f.status, 1, `the kernel of --roots holds findings\n${show(f)}`);
  roots(makeKernel({ "Genkan/Theorems.lean": theorems, "Genkan/Vectors.lean": vectors }), ROOTS, "no Main.lean");
  roots(makeKernel({ "Main.lean": MAIN, "Genkan/Judge.lean": "def j : Nat := 0\n" }), ["Main main"], "no theorem file");
  roots(makeKernel({ "Genkan/Judge.lean": "def j : Nat := 0\n" }), ["Main main"], "neither Main.lean nor a theorem file");
  const missing = run(AUDIT_MJS, ["--roots", "--kernel", join(TMP, "no-such-kernel")], env);
  assert.equal(missing.status, 2, `--roots on an unreadable kernel dir is a usage error\n${show(missing)}`);

  // (6) A protected theorem keeps its full name (measured: `#print axioms Genkan.guarded` finds it): a root, and admitted
  // by the source rules.
  const guarded = makeKernel({ "Genkan/Theorems.lean": ["namespace Genkan", "protected theorem guarded : True := trivial", "end Genkan", ""].join("\n") });
  roots(guarded, ["Main main", "Genkan.Theorems Genkan.guarded"], "a protected theorem");
  const g = run(AUDIT_MJS, ["--kernel", guarded, "--source-only"], env);
  assertAuditPasses(g, "a protected theorem, sources only");
  assert.deepEqual(linesOf(g.stdout), ["audit: 1 Lean files, 1 theorems, no finding (sources only)"], `the protected theorem is counted\n${show(g)}`);
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/audit.mjs:331 CONST "if (word === \"private\" && THEOREM_FILES.has(rel))" -> "if (false && THEOREM_FILES.has(rel))"
// killer: apps/genkan/scripts/audit.mjs:331 COR "word === \"private\" && THEOREM_FILES.has(rel)" -> "word === \"private\""
test("audit_refuses_private_in_theorem_files", () => {
  // A private theorem gets a mangled name that `#print axioms` does not find under its written one (measured): in the two
  // theorem files the word private is refused, as a whole single-component name in code position, read through
  // guillemets. Elsewhere, in a comment, in a string, as a part of a longer name or as a dotted component it is not;
  // protected is admitted.
  const theorems = [
    "namespace Genkan",
    "private theorem p1 : True := trivial",
    "private nonrec theorem p2 : True := trivial",
    "private def p3 : Nat := 0",
    "«private» def p4 : Nat := 0",
    "protected theorem guarded : True := trivial",
    "-- private theorem ghost : True := trivial",
    "/- private def ghost2 : Nat := 0 -/",
    'def s : String := "private"',
    "def privately : Nat := 0",
    "def k : Nat := Foo.«private»",
    "end Genkan",
    "",
  ];
  const vectors = ["namespace Genkan", "private theorem pv : True := trivial", "end Genkan", ""];
  const elsewhere = {
    "Main.lean": "private def helper : Nat := 0\ndef main : IO UInt32 := pure 3\n",
    "Genkan/Judge.lean": "private def j : Nat := 0\n",
  };
  const rec = recordsFor(["Genkan.p1", "Genkan.p2", "Genkan.guarded", "Genkan.pv"]);
  const r = audit(makeKernel({ ...elsewhere, "Genkan/Theorems.lean": theorems.join("\n"), "Genkan/Vectors.lean": vectors.join("\n") }), rec);
  assert.equal(r.status, 1, `private in a theorem file must fail the audit\n${show(r)}`);
  const expected = [2, 3, 4, 5].map((l) => `audit: Genkan/Theorems.lean:${String(l)}: banned private`);
  expected.push("audit: Genkan/Vectors.lean:2: banned private");
  assert.deepEqual(positioned(r), expected.sort(), `each private of the theorem files at its line, and only those\n${show(r)}`);
  assert.deepEqual(refusals(r), [], `every theorem has its record: the findings are the source ones\n${show(r)}`);

  // Control: the same kernel without the private lines of the theorem files passes; private stays in Main.lean, in another
  // file, in a comment and in a string.
  const clean = theorems.filter((l) => !/^(?:private|«private»)/.test(l)).join("\n");
  const c = audit(makeKernel({ ...elsewhere, "Genkan/Theorems.lean": clean, "Genkan/Vectors.lean": "namespace Genkan\nend Genkan\n" }), rec);
  assertAuditPasses(c, "private outside the theorem files, in a comment and in a string; protected");
});
