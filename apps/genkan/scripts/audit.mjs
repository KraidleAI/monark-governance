// apps/genkan/scripts/audit.mjs — the source and axiom audit of the Genkan kernel. Node 24, built-ins only; it never runs
// Lean or lake. It reads every *.lean file (any case) under the kernel dir, only the build dir .lake at its root skipped,
// lexes it as the pinned toolchain does where it matters (nested block comments, strings, raw strings, char literals,
// guillemet names, the code parts of interpolated strings), and refuses, in code position only: an opener of those glued
// to a character (not after white space), a banned word as a whole single-component name (a guillemet name read as its
// content), a foreign axiom or a debugging function of Init as any component of a name, a panic (a ] glued to !, a name
// component that holds ! or the word panic in any case, the interpolation heads s!, f! and println! excepted, and Init's
// outOfBounds), a # command other than #check and #print, any skipKernelTC, a theorem outside the two theorem files and,
// inside them, the word private (a private theorem's name is mangled: no record names it, measured) and a theorem whose
// full name is not plain (records.mjs refuses it as a root), an import other than Genkan and its plain modules; then any
// lakefile.toml (any case), and a lakefile.lean whose sha256 (LF line ends) is not the pinned one.
// Words do not see every axiom (a tactic's config adds one with no word for it, measured): the records do. Read only from
// --axioms-from (the `#print axioms` output records.mjs writes), they must name main and each theorem of
// Genkan/Theorems.lean and Genkan/Vectors.lean (named through their namespaces), and every record must stay within
// {propext, Classical.choice, Quot.sound}; bare, no record is given, so main has none and the audit fails. --source-only
// judges the sources alone (CI runs it before any Lean runs), and refuses a .lake (any case) at the kernel root: before the
// build it can only hold files git tracks, which lake would reuse and no rule reads. --roots prints the roots whose records
// are due, one line `<module> <name>` each, `Main main` first, and exits 0 whatever the sources hold.
//
//   node apps/genkan/scripts/audit.mjs [--kernel <dir>] [--axioms-from <file> | --source-only | --roots]
//
// Exit 0 with one stdout line `audit: ...` (the counts, then `(sources only)` under --source-only); 1 when anything is
// found or refused, every finding printed on stderr as `audit: <file>:<line>: <what>`; 2 on a usage error or an
// unreadable kernel dir or axioms file.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** sha256 of apps/genkan/kernel/lakefile.lean, LF line ends. */
const LAKEFILE_SHA256 = "ed9d18b98ef3cfa1269b4d053bdf9ef83db0351bbf06ec83e7b35e5486b0785d";
const BANNED = new Set([
  "sorry", "admit", "stop", "axiom", "native_decide", "implemented_by", "extern", "unsafe", "partial", "macro", "macro_rules",
  "syntax", "elab", "elab_rules", "initialize", "builtin_initialize", "run_cmd", "run_elab", "run_meta",
  // the attribute forms of initialize (measured on the pinned toolchain: `@[init] def f : IO Unit` runs f while a module
  // that imports its module is elaborated), and export, which gives compiled code a symbol name as extern does
  "init", "builtin_init", "export",
  // a notation can declare a token that holds a quote, and so change how the lexer must read the rest
  "notation", "infix", "infixl", "infixr", "prefix", "postfix", "declare_syntax_cat", "binder_predicate",
  // builtin debugging syntax: dbg_trace prints from pure code (its string is read as interpolated, below); idbg makes the
  // compiled program fetch code from a debugger over TCP and evaluate it
  "dbg_trace", "idbg",
  // builtin terms whose message is an interpolated string after a name (and a term, for the At forms), a shape the lexer
  // does not follow; none elaborates without an import of Lean (measured on throwNamedError)
  "throwNamedError", "throwNamedErrorAt", "logNamedError", "logNamedErrorAt", "logNamedWarning", "logNamedWarningAt",
  // debug.byAsSorry, debug.proofAsSorry and debug.terminalTacticsAsSorry make Lean accept a false claim through sorryAx,
  // with no word for it (measured), and debug.skipKernelTC skips the kernel's check: the kernel sets no option
  "set_option",
  // decide's native mode adds an axiom of its own (measured); a tactic's config sets it as +native, (native := true) or
  // (config := ...), the config forms of Init/Tactics.lean
  "native", "config",
]);
const THEOREM_FILES = new Set(["Genkan/Theorems.lean", "Genkan/Vectors.lean"]);
const ADMITTED_AXIOMS = new Set(["propext", "Classical.choice", "Quot.sound"]);
// The other axioms of the pinned toolchain (Lean 4.32.1 declares 15, all in Init). Each is refused as any component of a
// name: a qualified name, a guillemet one or an opened namespace reaches it as surely as `sorry` reaches sorryAx.
const FOREIGN_AXIOMS = ["sorryAx", "lcProof", "lcAny", "lcCast", "lcErased", "lcUnreachable", "lcVoid", "isScalarObj", "Quot.lcInv",
  "Lean.ofReduceBool", "Lean.ofReduceNat", "Lean.trustCompiler"];
const AXIOM_WORDS = new Set(FOREIGN_AXIOMS.map((n) => n.slice(n.lastIndexOf(".") + 1)));
// Init's debugging functions (Init/Util.lean): from pure code they print, read the stack or sleep. Refused as any component
// of a name, as the foreign axioms are.
const DEBUG_FUNCTIONS = ["dbgTrace", "dbgTraceVal", "dbgTraceIfShared", "dbgStackTrace", "dbgStackTraceIf", "dbgSleep"];
// A panic reached in compiled code prints on stderr and goes on with the type's default value, or aborts the program when
// the host sets LEAN_ABORT_ON_PANIC (measured): either way the output depends on more than the input. Refused: a ] glued to
// ! (getElem!, the only spelling that parses), any name component that holds ! (get!, head!, panic!, get!Internal) or the
// word panic in any case (panicCore, sliceOrPanic), and the one function of Init that panics under neither, outOfBounds
// (Init/GetElem.lean, a panic! of its own), refused as the debugging functions are.
const PANIC_FUNCTIONS = ["outOfBounds"];
const PANIC_WORD = /panic/i;
const PART_WORDS = new Set([...AXIOM_WORDS, ...DEBUG_FUNCTIONS, ...PANIC_FUNCTIONS]);
// The # commands admitted: #check and #print only read the environment. #eval and #guard run code while the file is
// elaborated (measured on #guard), #exit ends it, others wrap a command. The vector literal #v[ is a term, not a command.
const HASH_COMMANDS = new Set(["check", "print"]);
// The kernel's own modules: Genkan and Genkan.<Name>, plain ASCII components that open with a capital.
const GENKAN_MODULE = /^Genkan(?:\.[A-Z][A-Za-z0-9]*)*$/;
// Tokens after which a string is interpolated (Init: s!, f!, println!; the builtin dbg_trace; Macro.trace[...] is handled
// apart).
const INTERP_HEADS = new Set(["s!", "f!", "println!", "dbg_trace"]);
// The heads whose ! is part of the name: exempt from the panic rule as written, never through guillemets or a qualifier.
const BANG_HEADS = new Set([...INTERP_HEADS].filter((h) => h.endsWith("!")));
// A plain name: dotted ASCII components. The very line of records.mjs, which refuses any other root (a test reads both).
const NAME = /^[A-Za-z_][A-Za-z0-9_']*(?:\.[A-Za-z_][A-Za-z0-9_']*)*$/;
// Words that are never the name of a section or an `end` (a name is the next identifier on the same line).
// (Word lists and the two words below are spelled so that no keyword is followed by a quote on its line: the specifier
// scan of packages/rpc-guard/test/durable.test.ts reads every scripts/ file of every workspace.)
const KEYWORDS = new Set(
  (
    "theorem def example instance structure inductive class abbrev opaque axiom namespace section end open variable universe " +
    "set_option attribute import mutual private protected noncomputable public meta export deriving where in"
  ).split(" "),
);
const IMPORT_WORD = "import";
const KERNEL_FLAG = "--kernel";
const AXIOMS_FLAG = "--axioms-from";
const SOURCE_FLAG = "--source-only";
const ROOTS_FLAG = "--roots";
const CHAR_LIT = /'(?:\\(?:x[0-9a-fA-F]{2}|u\{[0-9a-fA-F]+\}|.)|[^\\'\n])'/uy;
const UNICODE_ESCAPE = /u\{[0-9a-fA-F]+\}/y;
const WHITE = new Set([" ", "\t", "\r", "\n"]);

function usage(msg) {
  process.stderr.write(
    `audit: ${msg}\naudit: usage: node apps/genkan/scripts/audit.mjs [--kernel <dir>] [--axioms-from <file> | --source-only | --roots]\n`,
  );
  process.exit(2);
}

// ---- identifiers, as Init/Meta/Defs.lean defines them --------------------------------------------------------------

const isLetterLike = (c) =>
  (c >= 0x3b1 && c <= 0x3c9 && c !== 0x3bb) || (c >= 0x391 && c <= 0x3a9 && c !== 0x3a0 && c !== 0x3a3) || (c >= 0x3ca && c <= 0x3fb) ||
  (c >= 0x1f00 && c <= 0x1ffe) || (c >= 0x2100 && c <= 0x214f) || (c >= 0x1d49c && c <= 0x1d59f) ||
  (c >= 0xc0 && c <= 0xff && c !== 0xd7 && c !== 0xf7) || (c >= 0x100 && c <= 0x17f);
const isAsciiAlpha = (c) => (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
const isIdFirst = (c) => isAsciiAlpha(c) || c === 0x5f || isLetterLike(c);
const isSubscript = (c) => (c >= 0x2080 && c <= 0x2089) || (c >= 0x2090 && c <= 0x209c) || (c >= 0x1d62 && c <= 0x1d6a) || c === 0x2c7c;
const isIdRest = (c) =>
  isIdFirst(c) || (c >= 0x30 && c <= 0x39) || c === 0x27 || c === 0x21 || c === 0x3f || isSubscript(c);
const cp = (s, i) => (i < s.length ? (s.codePointAt(i) ?? -1) : -1);
const width = (c) => (c > 0xffff ? 2 : 1);

// ---- the lexer ------------------------------------------------------------------------------------------------------

/**
 * Lexes `src`. Returns the code tokens ({kind: "id" | "sym", text, parts, start}) and `code`, the text with every
 * comment, string and char literal blanked (a newline is kept, so positions and lines are those of `src`). An unterminated
 * comment, string or guillemet name is read as code from its opener on (Lean refuses it anyway).
 */
function lex(src) {
  const n = src.length;
  const mask = src.split("");
  const tokens = [];
  const gluedAt = []; // [index, opener] of each opener glued to a character
  let interpNext = false; // the next string is interpolated (only white space and comments since its head)
  let traceOpen = false; // inside `Macro.trace[ ... ]`

  const blank = (a, b) => { for (let k = a; k < b; k++) if (mask[k] !== "\n") mask[k] = " "; };
  const restore = (a, b) => { for (let k = a; k < b; k++) mask[k] = src[k]; };
  /** A glued opener at i: refused, its first character read as code; lexing goes on at the next one. */
  const glue = (i, opener) => { gluedAt.push([i, opener]); tokens.push({ kind: "sym", text: src[i], parts: 1, start: i }); interpNext = false; return i + 1; };

  /** End (exclusive) of the nested block comment opened at i, or -1 (Lean's finishCommentBlock). */
  function blockEnd(i) {
    for (let j = i + 2, depth = 1; j < n; ) {
      if (src[j] === "-" && src[j + 1] === "/") { j += 2; if (--depth === 0) return j; }
      else if (src[j] === "/" && src[j + 1] === "-") { j += 2; depth++; }
      else j++;
    }
    return -1;
  }

  /** Whether a string opens at k, past white space and comments (k > 0: the end of an interpolation head). */
  function opensString(k) {
    while (k > 0 && k < n) {
      if (WHITE.has(src[k])) k++;
      else if (src[k] === "-" && src[k + 1] === "-") k = src.indexOf("\n", k) === -1 ? n : src.indexOf("\n", k);
      else if (src[k] === "/" && src[k + 1] === "-") k = blockEnd(k);
      else return src[k] === '"';
    }
    return false;
  }

  /** End (exclusive) of the plain string opened at i, or -1. */
  function stringEnd(i) {
    for (let j = i + 1; j < n; j++) {
      if (src[j] === "\\") j++;
      else if (src[j] === '"') return j + 1;
    }
    return -1;
  }

  /** End (exclusive) of the raw string whose `r` is at i, or -1 when i does not open one. */
  function rawEnd(i) {
    let j = i + 1;
    while (src[j] === "#") j++;
    if (src[j] !== '"') return -1;
    const close = '"' + "#".repeat(j - i - 1);
    const k = src.indexOf(close, j + 1);
    return k === -1 ? -1 : k + close.length;
  }

  /** Lexes the interpolated string opened at i (text blanked, each {...} part lexed as code); its end, or -1. */
  function interpEnd(i) {
    let j = i + 1;
    let textFrom = i;
    while (j < n) {
      const c = src[j];
      if (c === "\\") { UNICODE_ESCAPE.lastIndex = j + 1; j = UNICODE_ESCAPE.test(src) ? UNICODE_ESCAPE.lastIndex : j + 2; }
      else if (c === '"') { blank(textFrom, j + 1); return j + 1; }
      else if (c === "{") {
        blank(textFrom, j);
        tokens.push({ kind: "sym", text: "{", parts: 1, start: j });
        const close = lexCode(j + 1, true);
        if (close >= n) return -1;
        tokens.push({ kind: "sym", text: "}", parts: 1, start: close });
        j = close + 1;
        textFrom = j;
      } else j++;
    }
    return -1;
  }

  /** Lexes code from i to the end, or (braceStop) to the unmatched `}`, whose index it returns. */
  function lexCode(i, braceStop) {
    let depth = 0;
    while (i < n) {
      const c = src[i];
      if (c === " " || c === "\n" || c === "\r" || c === "\t") { i++; continue; }
      let end = -1; // the end of the comment or literal that opens at i, if any
      // An opener counts only at the start of the file or right after white space. Glued to a character, it may belong to a
      // token of Lean's table (`<-`, `+`, a notation), which the audit does not model: it is refused, and read as code.
      const opens = i === 0 || WHITE.has(src[i - 1]);
      CHAR_LIT.lastIndex = i;
      const glued = opens ? null
        : c === "-" && src[i + 1] === "-" ? "--"
        : c === "/" && src[i + 1] === "-" ? "/-"
        : c === '"' && !interpNext ? '"' // the quote of an interpolation head belongs to its head
        : c === "'" && CHAR_LIT.test(src) ? "'"
        : c === "r" && (src[i + 1] === '"' || src[i + 1] === "#") ? "r"
        : c === "«" && !(src[i - 1] === "." && (src[i - 2] === "»" || isIdRest(cp(src, i - 2)))) ? "«"
        : null;
      if (glued !== null) { i = glue(i, glued); continue; }
      if (c === "-" && src[i + 1] === "-") end = src.indexOf("\n", i) === -1 ? n : src.indexOf("\n", i);
      else if (c === "/" && src[i + 1] === "-") end = blockEnd(i);
      else if (c === '"') {
        const interp = interpNext, saved = tokens.length;
        interpNext = traceOpen = false;
        end = interp ? interpEnd(i) : stringEnd(i);
        if (end !== -1 && interp) { i = end; continue; } // its text is blanked, its code parts lexed
        if (end === -1) { tokens.length = saved; restore(i, n); interpNext = traceOpen = false; } // the quote is read as code
      } else if (c === "r") end = rawEnd(i);
      else if (c === "'") { CHAR_LIT.lastIndex = i; if (CHAR_LIT.test(src)) end = CHAR_LIT.lastIndex; }
      if (end !== -1) {
        blank(i, end);
        if (c !== "-" && c !== "/") interpNext = false; // a comment keeps it, a literal ends it
        i = end;
        continue;
      }
      const ch = cp(src, i);
      if (isIdFirst(ch) || c === "«") {
        const end = identEnd(i);
        if (end !== -1) {
          const text = src.slice(i, end);
          const head = INTERP_HEADS.has(text) || (text === "Macro.trace" && src[end] === "[");
          if (head && !opens && opensString(text === "Macro.trace" ? src.indexOf("]", end) + 1 : end)) { i = glue(i, text); continue; }
          tokens.push({ kind: "id", text, parts: splitName(text).length, start: i });
          interpNext = INTERP_HEADS.has(text);
          if (text === "Macro.trace" && src[end] === "[") traceOpen = true;
          i = end;
          continue;
        }
      }
      if (braceStop && c === "{") depth++;
      if (braceStop && c === "}" && depth-- === 0) return i;
      tokens.push({ kind: "sym", text: String.fromCodePoint(ch), parts: 1, start: i });
      interpNext = c === "]" && traceOpen;
      if (c === "]") traceOpen = false;
      i += width(ch);
    }
    return n;
  }

  /** End (exclusive) of the identifier starting at i, components joined by `.`; -1 on an unterminated guillemet. */
  function identEnd(i) {
    let j = i;
    for (;;) {
      if (src[j] === "«") {
        const k = src.indexOf("»", j + 1);
        if (k === -1) return j === i ? -1 : j - 1;
        j = k + 1;
      } else {
        j += width(cp(src, j));
        while (j < n && isIdRest(cp(src, j))) j += width(cp(src, j));
      }
      if (src[j] === "." && (src[j + 1] === "«" || isIdFirst(cp(src, j + 1)))) j++;
      else return j;
    }
  }

  lexCode(0, false);
  return { tokens, gluedAt, code: mask.join("") };
}

/** The components of a name: split on dots outside guillemets. */
function splitName(text) {
  const parts = [];
  let cur = "";
  let inG = false;
  for (const ch of text) {
    if (ch === "«") inG = true;
    else if (ch === "»") inG = false;
    if (ch === "." && !inG) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts;
}

/** A name component read as Lean reads it: a guillemet one as its content. */
const unquote = (part) => (/^«.*»$/s.test(part) ? part.slice(1, -1) : part);

/** 1-based line of each index. */
function lineIndex(src) {
  const starts = [0];
  for (let k = 0; k < src.length; k++) if (src[k] === "\n") starts.push(k + 1);
  return (idx) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

// ---- one file -------------------------------------------------------------------------------------------------------

/** The positioned findings of one file and, for a theorem file, its theorems' full names. */
function auditFile(rel, src) {
  const { tokens, gluedAt, code } = lex(src);
  const lineOf = lineIndex(src);
  const findings = new Set();
  const add = (idx, what) => findings.add(`${rel}:${String(lineOf(idx))}: ${what}`);
  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];
    const next = tokens[t + 1];
    if (tok.kind === "sym") {
      if (tok.text === "#" && next?.kind === "id" && next.start === tok.start + 1 && !HASH_COMMANDS.has(next.text)) {
        const after = tokens[t + 2];
        const vector = next.text === "v" && after?.text === "[" && after.start === next.start + 1;
        if (!vector) add(tok.start, next.text.startsWith("eval") ? "banned #eval" : `banned #${next.text}`);
      }
      if (tok.text === "]" && next?.kind === "sym" && next.text === "!" && next.start === tok.start + 1) add(tok.start, "banned ]!");
      continue;
    }
    const parts = splitName(tok.text).map(unquote);
    const part = parts.find((p) => PART_WORDS.has(p));
    if (part !== undefined) add(tok.start, `banned ${part}`);
    const prev = tokens[t - 1];
    const commandWord = prev?.kind === "sym" && prev.text === "#" && prev.start === tok.start - 1; // judged by the # rule
    const panic = parts.find((p) => p.includes("!") || PANIC_WORD.test(p));
    if (panic !== undefined && !BANG_HEADS.has(tok.text) && !commandWord) add(tok.start, `banned ${panic}`);
    if (tok.parts !== 1) continue;
    const word = unquote(tok.text); // Lean applies `@[«implemented_by» g]`
    if (BANNED.has(word)) add(tok.start, `banned ${word}`);
    if (word === "theorem" && !THEOREM_FILES.has(rel)) add(tok.start, "banned theorem");
    if (word === "private" && THEOREM_FILES.has(rel)) add(tok.start, "banned private");
    if (tok.text === IMPORT_WORD && rel !== "lakefile.lean" && next?.kind === "id") {
      if (!GENKAN_MODULE.test(next.text)) add(tok.start, `foreign import ${next.text}`);
    }
  }
  for (const [k, opener] of gluedAt) add(k, `glued ${opener}`);
  for (let k = code.indexOf("skipKernelTC"); k !== -1; k = code.indexOf("skipKernelTC", k + 1)) add(k, "banned skipKernelTC");
  const theorems = THEOREM_FILES.has(rel) ? theoremNames(tokens, lineOf) : [];
  for (const { name, start } of theorems) if (!NAME.test(name)) add(start, `theorem name ${name} is not plain`);
  return { findings: [...findings], theorems: theorems.map((th) => th.name) };
}

/** Full names of the `theorem` declarations, through namespace, section, mutual and end, each with its keyword's index. */
function theoremNames(tokens, lineOf) {
  const scopes = []; // one entry per scope: a namespace component, or null (a section or a mutual block)
  const names = [];
  /** The name that follows token t on its line, or null. */
  const sameLineName = (t) => {
    const a = tokens[t];
    const b = tokens[t + 1];
    if (b?.kind !== "id" || b.parts === 0 || KEYWORDS.has(b.text) || lineOf(a.start) !== lineOf(b.start)) return null;
    return splitName(b.text);
  };
  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];
    if (tok.kind !== "id" || tok.parts !== 1) continue;
    const next = tokens[t + 1];
    if (tok.text === "namespace" && next?.kind === "id") {
      for (const p of splitName(next.text)) scopes.push(p);
      t++;
    } else if (tok.text === "section") {
      const name = sameLineName(t);
      for (let k = 0; k < (name?.length ?? 1); k++) scopes.push(null);
      if (name !== null) t++;
    } else if (tok.text === "mutual") {
      scopes.push(null);
    } else if (tok.text === "end") {
      const name = sameLineName(t);
      scopes.splice(Math.max(0, scopes.length - (name?.length ?? 1)));
      if (name !== null) t++;
    } else if (tok.text === "theorem" && next?.kind === "id") {
      const own = splitName(next.text);
      const full = own[0] === "_root_" ? own.slice(1) : [...scopes.filter((p) => p !== null), ...own];
      names.push({ name: full.join("."), start: tok.start });
      t++;
    }
  }
  return names;
}

// ---- the axiom records ----------------------------------------------------------------------------------------------

/** Parses `#print axioms` output: a map name -> axioms, and the refusals of unparsed text. */
function parseRecords(text) {
  const records = new Map();
  const refusals = [];
  const lines = text.split(/\r?\n/);
  for (let k = 0; k < lines.length; k++) {
    const line = lines[k].trim();
    if (line === "") continue;
    const none = /^'(.+)' does not depend on any axioms$/.exec(line);
    if (none !== null) { records.set(none[1], records.get(none[1]) ?? []); continue; }
    const some = /^'(.+)' depends on axioms: \[(.*)$/.exec(line);
    if (some !== null) {
      let body = some[2];
      let j = k;
      while (!body.includes("]") && j + 1 < lines.length) body += " " + lines[++j].trim();
      const close = body.indexOf("]");
      if (close !== -1 && body.slice(close + 1).trim() === "") {
        const axioms = body.slice(0, close).split(",").map((a) => a.trim()).filter((a) => a !== "");
        records.set(some[1], [...(records.get(some[1]) ?? []), ...axioms]);
        k = j;
        continue;
      }
    }
    refusals.push(`unparsed axiom output: ${[...line].slice(0, 80).join("")}`);
  }
  return { records, refusals };
}

// ---- main -----------------------------------------------------------------------------------------------------------

let kernelDir = fileURLToPath(new URL("../kernel", import.meta.url));
let axiomsFrom;
const seen = new Set();
const argv = process.argv.slice(2);
for (let k = 0; k < argv.length; k++) {
  const flag = argv[k];
  if (![KERNEL_FLAG, AXIOMS_FLAG, SOURCE_FLAG, ROOTS_FLAG].includes(flag)) usage(`unknown argument ${flag}`);
  if (seen.has(flag)) usage(`${flag} given twice`);
  seen.add(flag);
  if (flag === SOURCE_FLAG || flag === ROOTS_FLAG) continue; // no value
  const value = argv[++k];
  if (value === undefined || value === "") usage(`${flag} needs a value`);
  if (flag === KERNEL_FLAG) kernelDir = path.resolve(value);
  else axiomsFrom = path.resolve(value);
}
if ([AXIOMS_FLAG, SOURCE_FLAG, ROOTS_FLAG].filter((f) => seen.has(f)).length > 1) {
  usage(`${AXIOMS_FLAG}, ${SOURCE_FLAG} and ${ROOTS_FLAG} exclude each other`);
}
const sourceOnly = seen.has(SOURCE_FLAG);

const leanFiles = [];
const tomls = [];
const rootLakes = []; // the names of the .lake entries (any case) at the kernel root
const walked = new Set(); // real paths of the walked dirs: a linked dir is read once, and a link loop ends
function walk(abs, rel) {
  const real = realpathSync(abs);
  if (walked.has(real)) return;
  walked.add(real);
  const entries = orExit(() => readdirSync(abs, { withFileTypes: true }), `kernel dir ${abs}`);
  for (const d of entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const childAbs = path.join(abs, d.name);
    const childRel = rel === "" ? d.name : `${rel}/${d.name}`;
    if (rel === "" && d.name.toLowerCase() === ".lake") rootLakes.push(d.name);
    const st = statSync(childAbs, { throwIfNoEntry: false });
    if (st === undefined) continue;
    if (st.isDirectory()) {
      if (rel !== "" || d.name !== ".lake") walk(childAbs, childRel); // the build dir of the root only: a nested .lake is read
    } else if (d.name.toLowerCase() === "lakefile.toml") tomls.push(childRel);
    else if (d.name.toLowerCase().endsWith(".lean")) leanFiles.push({ abs: childAbs, rel: childRel });
  }
}
if (statSync(kernelDir, { throwIfNoEntry: false })?.isDirectory() !== true) usage(`kernel dir unreadable (${kernelDir})`);
walk(kernelDir, "");

/** fn(), or a usage exit naming what could not be read. */
function orExit(fn, what) {
  try { return fn(); } catch (e) { return usage(`${what} unreadable (${String(e.code ?? e.message)})`); }
}
const axiomsText = axiomsFrom === undefined ? "" : orExit(() => readFileSync(axiomsFrom, "utf8"), `axioms file ${axiomsFrom}`);

const out = [];
const theorems = [];
for (const f of leanFiles) {
  const src = orExit(() => readFileSync(f.abs, "utf8"), `kernel file ${f.rel}`);
  const r = auditFile(f.rel, src);
  out.push(...r.findings);
  theorems.push(...r.theorems.map((name) => ({ module: f.rel.slice(0, -".lean".length).split("/").join("."), name })));
  if (f.rel === "lakefile.lean") {
    const sha = createHash("sha256").update(src.replace(/\r\n/g, "\n"), "utf8").digest("hex");
    if (sha !== LAKEFILE_SHA256) out.push(`lakefile.lean: differs from the pinned sha256 ${LAKEFILE_SHA256.slice(0, 12)}`);
  }
}
for (const rel of tomls) out.push(`${rel}: lakefile.toml refused`);
if (sourceOnly) for (const name of rootLakes) out.push(`${name}: build dir refused under ${SOURCE_FLAG}`);

// The roots whose records are due, for records.mjs: main, the program's root, then each theorem with its module.
if (seen.has(ROOTS_FLAG)) {
  process.stdout.write([{ module: "Main", name: "main" }, ...theorems].map((r) => `${r.module} ${r.name}\n`).join(""));
  process.exit(0);
}

if (!sourceOnly) {
  const { records, refusals } = parseRecords(axiomsText);
  out.push(...refusals);
  for (const [name, axioms] of records) for (const a of axioms) if (!ADMITTED_AXIOMS.has(a)) out.push(`${name}: foreign axiom ${a}`);
  for (const { name } of theorems) if (!records.has(name)) out.push(`${name}: no axiom record`);
  // The program's root is among the records: what main's value reaches is in its record. Bare, no record is given.
  if (!records.has("main")) out.push("main: no axiom record");
}

if (out.length > 0) {
  for (const l of out) process.stderr.write(`audit: ${l}\n`);
  process.exit(1);
}
const counts = `${String(leanFiles.length)} Lean files, ${String(theorems.length)} theorems`;
process.stdout.write(`audit: ${counts}, no finding${sourceOnly ? " (sources only)" : ""}\n`);
