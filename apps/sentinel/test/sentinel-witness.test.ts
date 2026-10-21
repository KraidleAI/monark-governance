// SENTINEL — the build witness each daily line carries (sentinel_sha): the execution closure of run.ts and its digest
// (apps/sentinel/src/witness.ts), and the sentinelSha that run.ts exports and writes into each line's provenance.
// The closure read by the witness is compared with a second walk made here on the TypeScript syntax tree (the loads Node
// makes: import and export declarations naming a module, type-only ones erased), on the real tree; the digest is judged
// on a copy of the closure and on small trees given through an injected reader. Each test loads what it judges inside
// its body: a missing export reds by assertion, not by import.
import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import ts from "typescript";
import { forbiddenLoads } from "../../harness/test/helpers/import-specifiers.ts";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const ENTRY = "apps/sentinel/src/run.ts";
type Witness = Partial<typeof import("../src/witness.ts")>;
type Reader = { read(rel: string): Uint8Array | undefined; list(rel: string): string[] };
const loadWitness = async (): Promise<Witness> => await import("../src/witness.ts").catch(() => ({}));
/** The value of `f`, or "threw: <message>" when it throws: a refusal is judged by assertion. */
const attempt = <T>(f: () => T): T | string => {
  try { return f(); } catch (e) { return `threw: ${e instanceof Error ? e.message : String(e)}`; }
};
/** A tree held in memory, by "/"-separated path. */
const memReader = (files: Record<string, string>): Reader => ({
  read: (rel) => (Object.hasOwn(files, rel) ? new TextEncoder().encode(files[rel]) : undefined),
  list: (rel) => [...new Set(Object.keys(files).filter((f) => f.startsWith(`${rel}/`)).map((f) => f.slice(rel.length + 1).split("/")[0] ?? ""))].sort(),
});

/** The second walk: the modules Node loads from `entry`, read on the TypeScript syntax tree (importClause.isTypeOnly and the
 *  isTypeOnly of an export declaration skipped), relative specifiers as the file, ".ts" or "/index.ts", workspace packages
 *  through their exports; and the package directories a workspace specifier traversed. An import() call fails it, as it
 *  fails the witness. The same walk, through a tree reader, is syntaxTreeClosure of scripts/sentinel-witness.mjs, which
 *  print runs on every tree it composes; this test keeps its own copy, since it ships in the public export and the tool
 *  does not. A Node module outside NODE_MODULES, the closed list the tool holds too, fails it: a worker, a child process,
 *  vm or a module hook runs code no closure holds. */
const NODE_MODULES = ["node:crypto", "node:fs", "node:path", "node:url"];
function syntaxTreeClosure(root: string, entry: string): { modules: string[]; packageDirs: string[] } {
  const pkgs = new Map<string, { dir: string; exports: string | Record<string, string> }>();
  for (const group of ["apps", "packages"]) {
    for (const name of readdirSync(join(root, group))) {
      const pj = join(root, group, name, "package.json");
      if (!existsSync(pj)) continue;
      const j = JSON.parse(readFileSync(pj, "utf8")) as { name: string; exports?: string | Record<string, string> };
      pkgs.set(j.name, { dir: `${group}/${name}`, exports: j.exports ?? {} });
    }
  }
  const isFile = (rel: string): boolean => existsSync(join(root, rel)) && statSync(join(root, rel)).isFile();
  const dirs = new Set<string>(), seen = new Set<string>(), queue = [entry];
  const resolve = (from: string, spec: string): string | null => {
    assert.ok(!spec.startsWith("node:") || NODE_MODULES.includes(spec), `${from}: ${spec} is outside the closed list of Node modules`);
    if (spec.startsWith("node:")) return null;
    if (spec.startsWith(".")) {
      const base = posix.normalize(posix.join(posix.dirname(from), spec));
      const hit = [base, `${base}.ts`, `${base}/index.ts`].find(isFile);
      assert.ok(hit !== undefined, `${from}: ${spec} resolves`);
      return hit;
    }
    const m = /^(@[^/]+\/[^/]+)(\/.*)?$/.exec(spec);
    const pk = pkgs.get(m?.[1] ?? "");
    const sub = m?.[2] === undefined ? "." : `.${m[2]}`, ex = pk?.exports;
    const target = typeof ex === "string" ? (sub === "." ? ex : undefined) : ex?.[sub];
    assert.ok(pk !== undefined && target !== undefined, `${from}: ${spec} is a workspace export`);
    dirs.add(pk.dir);
    return posix.normalize(posix.join(pk.dir, target));
  };
  while (queue.length > 0) {
    const f = queue.shift() ?? "";
    if (seen.has(f)) continue;
    seen.add(f);
    const visit = (n: ts.Node): void => {
      assert.ok(!(ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword), `${f}: an import() call, a load made at run time`);
      let spec: string | undefined;
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier) && n.importClause?.isTypeOnly !== true) spec = n.moduleSpecifier.text;
      else if (ts.isExportDeclaration(n) && n.moduleSpecifier !== undefined && ts.isStringLiteral(n.moduleSpecifier) && !n.isTypeOnly) spec = n.moduleSpecifier.text;
      const r = spec === undefined ? null : resolve(f, spec);
      if (r !== null) queue.push(r);
      ts.forEachChild(n, visit);
    };
    visit(ts.createSourceFile(f, readFileSync(join(root, f), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
  }
  return { modules: [...seen].sort(), packageDirs: [...dirs].sort() };
}

// killer: apps/sentinel/src/witness.ts:223 SDL "found.add(" -> ""
test("sentinel_build_witness_covers_execution_closure", async () => {
  const w = await loadWitness();
  const run = (await import("../src/run.ts").catch(() => ({}))) as { sentinelSha?: unknown };
  assert.equal(typeof w.executionClosure, "function", "apps/sentinel/src/witness.ts exports executionClosure");
  assert.equal(typeof w.closureWitness, "function", "apps/sentinel/src/witness.ts exports closureWitness");
  assert.equal(typeof w.fsReader, "function", "apps/sentinel/src/witness.ts exports fsReader");
  assert.equal(typeof run.sentinelSha, "function", "run.ts exports the sentinelSha it writes into each line");
  const { executionClosure, closureWitness, fsReader } = w as typeof import("../src/witness.ts");
  const hashed = attempt(() => executionClosure(fsReader(ROOT), ENTRY));
  assert.ok(Array.isArray(hashed), `the closure of run.ts is read on the real tree: ${String(hashed)}`);
  const second = syntaxTreeClosure(ROOT, ENTRY);
  assert.ok(second.modules.includes("apps/harness/src/calibration.ts") && second.modules.includes("apps/sentinel/src/witness.ts"), "the second walk reaches a workspace package and the witness module");
  assert.deepEqual(hashed.filter((p) => !p.endsWith("/package.json")), second.modules, "the hashed modules are the modules Node loads, as the syntax tree reads them");
  assert.ok(second.packageDirs.includes("packages/rpc-guard") && second.packageDirs.includes("apps/harness"), "the second walk traverses workspace packages");
  assert.deepEqual(hashed.filter((p) => p.endsWith("/package.json")), second.packageDirs.map((d) => `${d}/package.json`), "each package a workspace specifier traverses has its package.json hashed, and no other package.json is");
  const sentinelSha = run.sentinelSha as (srcDir: string) => string;
  const served = attempt(() => sentinelSha(join(ROOT, "apps", "sentinel", "src")));
  assert.match(String(served), /^[0-9a-f]{64}$/, "sentinelSha gives a sha256");
  assert.equal(served, closureWitness(fsReader(ROOT), ENTRY), "the sentinelSha of run.ts is the closure witness of the tree it runs from");
});

// killer: apps/sentinel/src/witness.ts:245 CONST "executionClosure(reader, entry)" -> "executionClosure(reader, entry).filter((x) => x.startsWith(\"apps/sentinel/\"))"
test("sentinel_sha_changes_when_calibration_module_changes", async () => {
  const w = await loadWitness();
  assert.ok(typeof w.executionClosure === "function" && typeof w.closureWitness === "function" && typeof w.fsReader === "function", "apps/sentinel/src/witness.ts exports the closure, its witness and the disk reader");
  const { executionClosure, closureWitness, fsReader } = w as typeof import("../src/witness.ts");
  const list = executionClosure(fsReader(ROOT), ENTRY);
  const CAL = "apps/harness/src/calibration.ts";
  assert.ok(list.includes(CAL), "the calibration module of the harness is in the closure");
  const tmp = mkdtempSync(join(tmpdir(), "sentinel-witness-"));
  try {
    for (const p of list) { mkdirSync(dirname(join(tmp, p)), { recursive: true }); copyFileSync(join(ROOT, p), join(tmp, p)); }
    const before = closureWitness(fsReader(tmp), ENTRY);
    assert.equal(before, closureWitness(fsReader(ROOT), ENTRY), "a copy of the closure alone has the witness of the whole tree");
    const bytes = readFileSync(join(tmp, CAL)), changed = Buffer.from(bytes), last = changed.length - 1;
    changed[last] = changed[last] === 0x0a ? 0x20 : 0x0a;
    writeFileSync(join(tmp, CAL), changed);
    assert.notEqual(closureWitness(fsReader(tmp), ENTRY), before, "one byte of the calibration module changes the witness");
    writeFileSync(join(tmp, CAL), bytes);
    assert.equal(closureWitness(fsReader(tmp), ENTRY), before, "the byte given back gives the witness back");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// killer: apps/sentinel/src/witness.ts:248 CONST "${p}\\0${" -> "${"
test("sentinel_witness_binds_path_to_content", async () => {
  const w = await loadWitness();
  assert.equal(typeof w.closureWitness, "function", "apps/sentinel/src/witness.ts exports closureWitness");
  const { closureWitness } = w as typeof import("../src/witness.ts");
  const RUN = 'import { a } from "./a.ts";\nimport { b } from "./b";\nexport const r = [a, b];\n', A = "export const a = 1;\n", B = "export const b = 2;\n";
  const tree = { [ENTRY]: RUN, "apps/sentinel/src/a.ts": A, "apps/sentinel/src/b.ts": B };
  const base = closureWitness(memReader(tree), ENTRY);
  assert.match(base, /^[0-9a-f]{64}$/);
  const swapped = closureWitness(memReader({ ...tree, "apps/sentinel/src/a.ts": B, "apps/sentinel/src/b.ts": A }), ENTRY);
  assert.notEqual(swapped, base, "two files of the closure whose contents are exchanged give another witness");
  // The same bytes in the same order, one file moved from b.ts to b/index.ts (the same import resolves to either).
  const moved = closureWitness(memReader({ [ENTRY]: RUN, "apps/sentinel/src/a.ts": A, "apps/sentinel/src/b/index.ts": B }), ENTRY);
  assert.notEqual(moved, base, "a content moved to another path gives another witness: each content is bound to its path");
});

// killer: apps/sentinel/src/witness.ts:154 SDL "an import() call" -> ""
test("sentinel_witness_refuses_dynamic_import", async () => {
  const w = await loadWitness();
  assert.ok(typeof w.closureWitness === "function" && typeof w.executionClosure === "function" && typeof w.fsReader === "function", "apps/sentinel/src/witness.ts exports the closure, its witness and the disk reader");
  const { closureWitness, executionClosure, fsReader } = w as typeof import("../src/witness.ts");
  const X = { "apps/sentinel/src/x.ts": "export const x = 1;\n" };
  const refusal = (run: string): string => String(attempt(() => closureWitness(memReader({ ...X, [ENTRY]: run }), ENTRY)));
  assert.match(refusal('export async function f() { return await import("./x.ts"); }\n'), /^threw: .*an import\(\) call/, "an import() call is refused, never skipped");
  assert.match(refusal('import { y } from "./y.ts";\n'), /^threw: .*\.\/y\.ts resolves to no file/, "an unresolved specifier is refused");
  assert.match(refusal('import "left-pad";\n'), /^threw: .*left-pad is a package outside the workspace/, "a package outside the workspace is refused");
  assert.match(refusal('const m = require("./x.ts");\nexport { m };\n'), /^threw: .*a call named require/, "a call named require is refused");
  // A regular expression right after the "}" of a block, read as a division, would let its "/*" open a comment that runs to
  // the doc comment below and hides the import between them: the slash is refused, never read either way.
  // killer: apps/sentinel/src/witness.ts:96 CONST "out[out.length - 1]?.v === \"}\"" -> "false"
  assert.match(refusal('const s = "a";\nif (s) { void s; }\n/^[/*]/.test(s) ? 1 : 0;\nimport { x } from "./x.ts";\n/** the end */\nexport const r = x;\n'), /^threw: .*a slash right after a closing brace/, "a slash right after a closing brace is refused, never read as a division that hides an import");
  // After a word that opens an expression (export default, extends) a "/" opens a regular expression, whose "/*" opens no
  // comment; after the same kind of word read as a property name (after ".", "?." or "#") a "/" is a division, never a
  // regular expression that runs to the end of its line.
  // killer: apps/sentinel/src/witness.ts:46 CONST "\"await\", \"default\", \"extends\"" -> "\"await\""
  // killer: apps/sentinel/src/witness.ts:61 CONST "!(q?.k === \"punc\" && (q.v === \".\" || q.v === \"?.\" || q.v === \"#\"))" -> "true"
  for (const [what, run] of [
    ["export default opens a regular expression", 'export default /[/*]/;\nimport { x } from "./x.ts";\n/** the end */\nexport const r = x;\n'],
    ["extends opens a regular expression", 'export class A extends /[/*]/.constructor {}\nimport { x } from "./x.ts";\n/** the end */\nexport const r = x;\n'],
    ["a word after \".\", \"?.\" or \"#\" is a property name, a division follows it", 'import { x } from "./x.ts";\nconst o = { in: 4 };\nexport const a = o.in / 2;\nexport const b = o?.in / 2;\nexport class C { #in = 4; f(): number { return this.#in / 2; } }\nexport const r = x;\n'],
  ] as const) assert.deepEqual(attempt(() => executionClosure(memReader({ ...X, [ENTRY]: run }), ENTRY)), ["apps/sentinel/src/run.ts", "apps/sentinel/src/x.ts"], what);
  // A specifier inside a comment, a string, a template or a regular expression is not a load.
  const quiet = 'import { x } from "./x.ts";\n// import("./nope.ts")\nconst s = \'import "./nope.ts"\', t = `${s} from "./nope.ts"`, re = /from "\\.\\/nope\\.ts"/;\nexport const r = [x, s, t, re];\n';
  assert.deepEqual(attempt(() => executionClosure(memReader({ ...X, [ENTRY]: quiet }), ENTRY)), ["apps/sentinel/src/run.ts", "apps/sentinel/src/x.ts"], "comments, strings, templates and regular expressions load nothing");
  // On the real tree, the walk of the syntax tree finds no load that a specifier does not show: the closure is complete.
  const list = executionClosure(fsReader(ROOT), ENTRY).filter((p) => /\.[cm]?[jt]s$/.test(p));
  assert.ok(list.length > 1, "the real closure is read");
  assert.deepEqual(list.flatMap((p) => forbiddenLoads(readFileSync(join(ROOT, p), "utf8")).map((h) => `${p} ${h}`)), [], "no file of the closure loads a module by a form the walk does not follow");
});
