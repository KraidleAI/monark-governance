// GENKAN - the mutants of a Lean source, pure: eight operators, applied in code positions only, one mutant per position and
// operator. A code position is outside a line comment (`--` to the line end), a block or doc comment (`/-` ... `-/`, nested),
// a string literal (`"..."`, backslash escapes) and a char literal (`'x'`, `'\n'`, `'\x41'`, `'\u{...}'`; a `'` right after an
// identifier character belongs to the identifier). The operators: a maximal run of decimal digits, not glued to an
// identifier character (letters, digits, `_`, `'`, `!`, `?`) and not right after a `.`, becomes n + 1, and n - 1 when n > 0;
// a `<` with white space on both sides becomes `≤`, a `≤` becomes `<`; `==` becomes `!=`; `&&` becomes `||` and `||` becomes
// `&&`; the word `some` (no identifier character nor `.` glued before it) followed by one space and an atom (a balanced
// `( ... )` or `{ ... }` in code position, or a run of letters, digits, `_`, `'`, `.`) becomes `none`, outside a match
// pattern (from a `|` that opens its line, after indentation, to the first `=>` of that line, or its end). The mutants are
// sorted by line, then column, then the operator's place in OPERATORS. decoder_mutants_killed builds and runs them.

export type Operator = "literal+1" | "literal-1" | "lt-to-le" | "le-to-lt" | "eq-to-ne" | "and-to-or" | "or-to-and" | "some-to-none";

export interface Mutant {
  readonly file: string; // as given, e.g. "Genkan/Bytes.lean"
  readonly line: number; // 1-based, the line of the fragment's first character
  readonly column: number; // 1-based, in code units
  readonly operator: Operator;
  readonly fragment: string; // the original text replaced
  readonly replacement: string;
  readonly text: string; // the whole mutated source
}

/** The operators, in the order that breaks ties at one position. */
const OPERATORS: readonly Operator[] = ["literal+1", "literal-1", "lt-to-le", "le-to-lt", "eq-to-ne", "and-to-or", "or-to-and", "some-to-none"];

const IDENT = /[\p{L}0-9_'!?]/u;
const ATOM = /[\p{L}0-9_'.]/u;
const DIGIT = /[0-9]/;
const HEX = /[0-9a-fA-F]/;
const SPACE = /\s/;

const isIdent = (c: string | undefined): boolean => c !== undefined && IDENT.test(c);

/** The end (exclusive) of the char literal that opens at `i`, or -1 when none does. */
function charLiteralEnd(src: string, i: number): number {
  const j = i + 1;
  if (src[j] === "\\") {
    if (src[j + 1] === "x") return HEX.test(src[j + 2] ?? "") && HEX.test(src[j + 3] ?? "") && src[j + 4] === "'" ? j + 5 : -1;
    if (src[j + 1] === "u" && src[j + 2] === "{") {
      let k = j + 3;
      while (k < src.length && HEX.test(src[k]!)) k++;
      return k > j + 3 && src[k] === "}" && src[k + 1] === "'" ? k + 2 : -1;
    }
    return j + 1 < src.length && src[j + 2] === "'" ? j + 3 : -1;
  }
  const cp = src.codePointAt(j);
  if (cp === undefined || src[j] === "'" || src[j] === "\n") return -1;
  const after = j + (cp > 0xffff ? 2 : 1);
  return src[after] === "'" ? after + 1 : -1;
}

/** For each code unit of `src`: whether it is in code position. */
function codeMask(src: string): boolean[] {
  const code: boolean[] = new Array<boolean>(src.length).fill(true);
  const off = (from: number, to: number): void => {
    for (let k = from; k < to && k < src.length; k++) code[k] = false;
  };
  let i = 0;
  while (i < src.length) {
    if (src.startsWith("--", i)) {
      const nl = src.indexOf("\n", i);
      const end = nl === -1 ? src.length : nl;
      off(i, end);
      i = end;
    } else if (src.startsWith("/-", i)) {
      let depth = 1;
      let k = i + 2;
      while (k < src.length && depth > 0) {
        if (src.startsWith("/-", k)) {
          depth++;
          k += 2;
        } else if (src.startsWith("-/", k)) {
          depth--;
          k += 2;
        } else k++;
      }
      off(i, k);
      i = k;
    } else if (src[i] === '"') {
      let k = i + 1;
      while (k < src.length && src[k] !== '"') k += src[k] === "\\" ? 2 : 1;
      off(i, k + 1);
      i = k + 1;
    } else if (src[i] === "'" && !isIdent(src[i - 1])) {
      const end = charLiteralEnd(src, i);
      if (end === -1) i++;
      else {
        off(i, end);
        i = end;
      }
    } else i++;
  }
  return code;
}

/** The end (exclusive) of the balanced group that opens at `i` (code positions only), or -1. */
function groupEnd(src: string, code: boolean[], i: number): number {
  const open = src[i]!;
  const close = open === "(" ? ")" : "}";
  let depth = 0;
  for (let k = i; k < src.length; k++) {
    if (!code[k]) continue;
    if (src[k] === open) depth++;
    else if (src[k] === close && --depth === 0) return k + 1;
  }
  return -1;
}

/** Whether index `k` lies in a match pattern: from a `|` that opens its line to the first `=>` of that line. */
function inPattern(src: string, code: boolean[], k: number): boolean {
  const start = src.lastIndexOf("\n", k - 1) + 1;
  let f = start;
  while (f < src.length && (src[f] === " " || src[f] === "\t")) f++;
  if (src[f] !== "|" || !code[f]) return false;
  const nl = src.indexOf("\n", f);
  const end = nl === -1 ? src.length : nl;
  let arrow = end;
  for (let a = f; a + 1 < end; a++) {
    if (code[a] && code[a + 1] && src.startsWith("=>", a)) {
      arrow = a;
      break;
    }
  }
  return k >= f && k < arrow;
}

interface Found { index: number; operator: Operator; fragment: string; replacement: string }

/** The mutants of `source`, the file named `file`. */
export function mutantsOf(file: string, source: string): Mutant[] {
  const code = codeMask(source);
  const found: Found[] = [];
  const both = (k: number, s: string): boolean => source.startsWith(s, k) && code.slice(k, k + s.length).every((c) => c);
  for (let k = 0; k < source.length; k++) {
    if (!code[k]) continue;
    const c = source[k]!;
    const before = source[k - 1];
    if (DIGIT.test(c) && !isIdent(before) && before !== ".") {
      let j = k;
      while (j < source.length && code[j] && DIGIT.test(source[j]!)) j++;
      if (!isIdent(source[j])) {
        const fragment = source.slice(k, j);
        const n = BigInt(fragment);
        found.push({ index: k, operator: "literal+1", fragment, replacement: String(n + 1n) });
        if (n > 0n) found.push({ index: k, operator: "literal-1", fragment, replacement: String(n - 1n) });
      }
    } else if (c === "<" && before !== undefined && SPACE.test(before) && SPACE.test(source[k + 1] ?? "")) {
      found.push({ index: k, operator: "lt-to-le", fragment: "<", replacement: "≤" });
    } else if (c === "≤") {
      found.push({ index: k, operator: "le-to-lt", fragment: "≤", replacement: "<" });
    } else if (both(k, "==")) {
      found.push({ index: k, operator: "eq-to-ne", fragment: "==", replacement: "!=" });
      k++;
    } else if (both(k, "&&")) {
      found.push({ index: k, operator: "and-to-or", fragment: "&&", replacement: "||" });
      k++;
    } else if (both(k, "||")) {
      found.push({ index: k, operator: "or-to-and", fragment: "||", replacement: "&&" });
      k++;
    } else if (both(k, "some ") && !isIdent(before) && before !== "." && !inPattern(source, code, k)) {
      const a = k + 5;
      let end = -1;
      if (code[a] && (source[a] === "(" || source[a] === "{")) end = groupEnd(source, code, a);
      else if (code[a] && ATOM.test(source[a] ?? "")) {
        end = a;
        while (end < source.length && code[end] && ATOM.test(source[end]!)) end++;
      }
      if (end !== -1) found.push({ index: k, operator: "some-to-none", fragment: source.slice(k, end), replacement: "none" });
    }
  }
  const order = (f: Found): number => OPERATORS.indexOf(f.operator);
  found.sort((x, y) => x.index - y.index || order(x) - order(y));
  return found.map((f) => {
    const line = source.slice(0, f.index).split("\n").length;
    const column = f.index - (source.lastIndexOf("\n", f.index - 1) + 1) + 1;
    const text = source.slice(0, f.index) + f.replacement + source.slice(f.index + f.fragment.length);
    return { file, line, column, operator: f.operator, fragment: f.fragment, replacement: f.replacement, text };
  });
}
