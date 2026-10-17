// SENTINEL — the build witness of the daily job: the execution closure of run.ts and its digest (sentinel_sha).
//
// executionClosure walks, breadth first from the entry, the modules Node loads: the static import declarations (default,
// named, namespace, side-effect) and the export declarations that name a module, read on the source text by a small
// scanner that tells comments, strings, templates and regular expressions apart, so a specifier inside one of them is
// not a load. `import type` and `export type` are skipped: Node erases them, nothing loads. A relative specifier resolves
// to the file named, then with ".ts", then "/index.ts"; a workspace specifier `@monark/<name>[/<sub>]` resolves through
// the `exports` field of the package.json of the workspace package of that name (apps/* and packages/*), and that
// package.json joins the list; a `node:` builtin is not a file. Fail-closed, run.ts then publishing nothing: an import() call,
// a call named require, an unreadable import or export declaration, an unterminated string, template, comment or regular
// expression, a specifier that resolves to no file, a package outside the workspace, a path outside the root. An import()
// call is the word import before "(", not after "." or "?.": a method named import, `typeof import("...")`, refused too.
// closureWitness is the sha256 of a version line followed, for each path of the sorted list, by
// "<path>\0<sha256 of its bytes>\n": each content is bound to its path. Node built-ins only; every read goes through
// the reader (fsReader is the on-disk one, the local witness tool brings a reader of git trees); no network, no
// environment read.
// How the scanner reads a "/" that opens no comment. Right after a "}" it is refused: there a regular expression (after a
// block) and a division (after an object literal) look alike, and a regular expression read as a division can open a
// comment that hides an import. Else it opens a regular expression at the start of the text, after a punctuation other
// than ")" and "]", after the ")" of an if, while, for or with head, or after a word of REGEX_AFTER_WORD that no ".", "?."
// or "#" precedes; anywhere else (another word, a number, a string, a template, a regular expression) it is a division.
// The scanner alone does not prove the walk complete: a walk of the TypeScript syntax tree checks it, on the real tree at
// each run of the closure test, and on each tree that scripts/sentinel-witness.mjs prints (a difference is refused).
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";

/** The files of a tree, by "/"-separated path relative to its root. */
export interface TreeReader {
  /** The bytes of the file at `rel`, or undefined when no file is there (a directory is not a file). */
  read(rel: string): Uint8Array | undefined;
  /** The entry names directly under the directory `rel`, or [] when there is none. */
  list(rel: string): string[];
}

/** The tree on disk under `root`. */
export function fsReader(root: string): TreeReader {
  const abs = (rel: string): string => join(root, ...rel.split("/"));
  return {
    read: (rel) => { const p = abs(rel); return existsSync(p) && statSync(p).isFile() ? readFileSync(p) : undefined; },
    list: (rel) => { const p = abs(rel); return existsSync(p) && statSync(p).isDirectory() ? readdirSync(p).sort() : []; },
  };
}

type Tok = { readonly k: "id" | "str" | "punc" | "other"; readonly v: string };
const REGEX_AFTER_WORD = new Set(["return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "instanceof", "yield", "await", "default", "extends"]);
const HEAD_WORDS = new Set(["if", "while", "for", "with"]);

/** The tokens of a source text, comments dropped; a string token carries its value, templates and regular expressions none. */
function scan(text: string, file: string): Tok[] {
  const out: Tok[] = [];
  const braces: ("{" | "${")[] = [];
  const parens: boolean[] = []; // per open "(": does it open the head of if/while/for/with (a regular expression may follow its ")")
  let afterHead = false; // the last ")" closed such a head
  let i = 0;
  const n = text.length;
  const fail = (what: string): never => { throw new Error(`${file}: ${what} at offset ${String(i)}: the closure cannot be read`); };
  const regexAllowed = (): boolean => {
    const p = out[out.length - 1];
    if (p === undefined) return true;
    if (p.k === "id") { const q = out[out.length - 2]; return REGEX_AFTER_WORD.has(p.v) && !(q?.k === "punc" && (q.v === "." || q.v === "?." || q.v === "#")); }
    if (p.k !== "punc") return false;
    if (p.v === ")") return afterHead;
    return p.v !== "]"; // a "}" never gets here: the slash after it is refused first
  };
  const template = (): void => {
    while (i < n) {
      const c = text[i];
      if (c === "\\") { i += 2; continue; }
      if (c === "`") { i++; out.push({ k: "other", v: "`" }); return; }
      if (c === "$" && text[i + 1] === "{") { i += 2; braces.push("${"); out.push({ k: "punc", v: "${" }); return; }
      i++;
    }
    fail("an unterminated template");
  };
  while (i < n) {
    const c = text[i] ?? "";
    if (c === "/" && text[i + 1] === "/") { const e = text.indexOf("\n", i); i = e < 0 ? n : e; continue; }
    if (c === "/" && text[i + 1] === "*") { const e = text.indexOf("*/", i + 2); if (e < 0) fail("an unterminated comment"); i = e + 2; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === "\"" || c === "'") {
      let j = i + 1, v = "";
      while (j < n && text[j] !== c) {
        if (text[j] === "\\") { v += text[j + 1] ?? ""; j += 2; continue; }
        if (text[j] === "\n") { i = j; fail("an unterminated string"); }
        v += text[j]; j++;
      }
      if (j >= n) fail("an unterminated string");
      out.push({ k: "str", v });
      i = j + 1;
      continue;
    }
    if (c === "`") { i++; template(); continue; }
    if (c === "}" && braces[braces.length - 1] === "${") { braces.pop(); i++; template(); continue; }
    // A "/" here opens no comment (both comments are read above): after a "}" it is refused, never guessed.
    if (c === "/" && out[out.length - 1]?.k === "punc" && out[out.length - 1]?.v === "}") fail("a slash right after a closing brace: a regular expression or a division the closure cannot tell apart");
    if (c === "/" && regexAllowed()) {
      let j = i + 1, cls = false;
      while (j < n) {
        const d = text[j];
        if (d === "\\") { j += 2; continue; }
        if (d === "\n") { i = j; fail("an unterminated regular expression"); }
        if (d === "[") cls = true;
        else if (d === "]") cls = false;
        else if (d === "/" && !cls) break;
        j++;
      }
      if (j >= n) fail("an unterminated regular expression");
      i = j + 1;
      while (i < n && /[a-z]/i.test(text[i] ?? "")) i++;
      out.push({ k: "other", v: "/re/" });
      continue;
    }
    if (/[A-Za-z_$\u0080-\uffff]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w$\u0080-\uffff]/.test(text[j] ?? "")) j++;
      out.push({ k: "id", v: text.slice(i, j) });
      i = j;
      continue;
    }
    if (/\d/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w.]/.test(text[j] ?? "")) j++;
      out.push({ k: "other", v: "0" });
      i = j;
      continue;
    }
    if (c === "?" && text[i + 1] === "." && !/\d/.test(text[i + 2] ?? "")) { out.push({ k: "punc", v: "?." }); i += 2; continue; }
    if (c === "{") braces.push("{");
    else if (c === "}") braces.pop();
    else if (c === "(") { const p = out[out.length - 1]; parens.push(p?.k === "id" && HEAD_WORDS.has(p.v)); }
    afterHead = c === ")" ? parens.pop() === true : false;
    out.push({ k: "punc", v: c });
    i++;
  }
  return out;
}

const is = (t: Tok | undefined, k: Tok["k"], v?: string): boolean => t !== undefined && t.k === k && (v === undefined || t.v === v);
/** The keyword before a module specifier, tested by a regular expression so that no source scanner reads this file as importing. */
const isFrom = (t: Tok | undefined): boolean => t !== undefined && t.k === "id" && /^from$/.test(t.v);

/** The module specifiers a source text loads, in source order; throws on a load the closure cannot follow. */
export function loadedSpecifiers(text: string, file: string): string[] {
  const t = scan(text, file);
  const specs: string[] = [];
  const unreadable = (k: number, what: string): never => { throw new Error(`${file}: an unreadable ${what} declaration (token ${String(k)}): the closure cannot be read`); };
  for (let k = 0; k < t.length; k++) {
    const tok = t[k];
    if (tok === undefined || tok.k !== "id" || is(t[k - 1], "punc", ".") || is(t[k - 1], "punc", "?.")) continue;
    if (/^require$/.test(tok.v) && is(t[k + 1], "punc", "(")) throw new Error(`${file}: a call named require: the closure cannot follow a load made at run time`);
    if (tok.v === "import") {
      const nx = t[k + 1];
      if (is(nx, "punc", "(")) throw new Error(`${file}: an import() call: the closure cannot follow a load made at run time`);
      if (is(nx, "str")) { specs.push(nx?.v ?? ""); continue; }
      if (!(is(nx, "id") || is(nx, "punc", "{") || is(nx, "punc", "*"))) continue; // import.meta, a property name
      let j = k + 1;
      const typeOnly = is(nx, "id", "type") && !isFrom(t[k + 2]) && !is(t[k + 2], "punc", ",") && !is(t[k + 2], "punc", "=");
      if (typeOnly) j++;
      if (is(t[j], "id") && !isFrom(t[j])) { j++; if (is(t[j], "punc", ",")) j++; }
      else if (isFrom(t[j]) && isFrom(t[j + 1])) j++; // a default binding named from
      if (is(t[j], "punc", "{")) { while (j < t.length && !is(t[j], "punc", "}")) j++; j++; }
      else if (is(t[j], "punc", "*")) j += 3;
      if (!isFrom(t[j]) || !is(t[j + 1], "str")) unreadable(k, "import");
      if (!typeOnly) specs.push(t[j + 1]?.v ?? "");
      continue;
    }
    if (tok.v === "export") {
      let j = k + 1;
      const typeOnly = is(t[j], "id", "type") && (is(t[j + 1], "punc", "{") || is(t[j + 1], "punc", "*"));
      if (typeOnly) j++;
      if (is(t[j], "punc", "{")) { while (j < t.length && !is(t[j], "punc", "}")) j++; j++; }
      else if (is(t[j], "punc", "*")) { j++; if (is(t[j], "id", "as")) j += 2; if (!isFrom(t[j])) unreadable(k, "export"); }
      else continue; // export const, function, class, default, type alias: no module named
      if (!isFrom(t[j])) continue; // export { a, b } of local bindings
      if (!is(t[j + 1], "str")) unreadable(k, "export");
      if (!typeOnly) specs.push(t[j + 1]?.v ?? "");
    }
  }
  return specs;
}

const WORKSPACE_GROUPS = ["apps", "packages"];

/** The sorted paths of the execution closure of `entry`, plus the package.json of each workspace package it traverses. */
export function executionClosure(reader: TreeReader, entry: string): string[] {
  let workspace: Map<string, { dir: string; exports: unknown }> | undefined;
  const packages = (): Map<string, { dir: string; exports: unknown }> => {
    if (workspace !== undefined) return workspace;
    workspace = new Map();
    for (const group of WORKSPACE_GROUPS) {
      for (const name of reader.list(group)) {
        const bytes = reader.read(`${group}/${name}/package.json`);
        if (bytes === undefined) continue;
        const pkg = JSON.parse(new TextDecoder().decode(bytes)) as { name?: unknown; exports?: unknown };
        if (typeof pkg.name === "string") workspace.set(pkg.name, { dir: `${group}/${name}`, exports: pkg.exports });
      }
    }
    return workspace;
  };
  const inside = (from: string, p: string): string => {
    const r = posix.normalize(p);
    if (r === ".." || r.startsWith("../") || posix.isAbsolute(r)) throw new Error(`${from}: ${p} is outside the root`);
    return r;
  };
  const found = new Set<string>();
  const resolve = (from: string, spec: string): string => {
    if (spec.startsWith(".")) {
      const base = inside(from, posix.join(posix.dirname(from), spec));
      for (const c of [base, `${base}.ts`, `${base}/index.ts`]) if (reader.read(c) !== undefined) return c;
      throw new Error(`${from}: ${spec} resolves to no file`);
    }
    const m = /^(@monark\/[^/]+)(\/.+)?$/.exec(spec);
    if (m === null) throw new Error(`${from}: ${spec} is a package outside the workspace`);
    const pkg = packages().get(m[1] ?? "");
    if (pkg === undefined) throw new Error(`${from}: ${spec} names no workspace package`);
    const sub = m[2] === undefined ? "." : `.${m[2]}`;
    const map = pkg.exports;
    const target = typeof map === "string" ? (sub === "." ? map : undefined) : map !== null && typeof map === "object" ? (map as Record<string, unknown>)[sub] : undefined;
    if (typeof target !== "string") throw new Error(`${from}: ${spec}: the package.json of ${pkg.dir} exports no ${sub}`);
    const file = inside(from, posix.join(pkg.dir, target));
    if (reader.read(file) === undefined) throw new Error(`${from}: ${spec} resolves to ${file}, which is absent`);
    found.add(`${pkg.dir}/package.json`);
    return file;
  };
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift() ?? "";
    if (seen.has(file)) continue;
    const bytes = reader.read(file);
    if (bytes === undefined) throw new Error(`${file}: absent from the tree`);
    seen.add(file);
    for (const spec of loadedSpecifiers(new TextDecoder().decode(bytes), file)) {
      if (spec.startsWith("node:")) continue;
      queue.push(resolve(file, spec));
    }
  }
  return [...seen, ...found].sort();
}

/** sha256 over "monark-sentinel-closure-v1\n" and, for each path of the sorted closure, "<path>\0<sha256 of its bytes>\n". */
export function closureWitness(reader: TreeReader, entry: string): string {
  const h = createHash("sha256").update("monark-sentinel-closure-v1\n");
  for (const p of executionClosure(reader, entry)) {
    const bytes = reader.read(p);
    if (bytes === undefined) throw new Error(`${p}: absent from the tree`);
    h.update(`${p}\0${createHash("sha256").update(bytes).digest("hex")}\n`);
  }
  return h.digest("hex");
}
