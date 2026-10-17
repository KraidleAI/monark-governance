// scripts/sentinel-witness.mjs — the local witness tool of the Narabi sentinel. SOURCE-REPO tool (not exported); Node 24,
// built-ins, the sentinel's own witness module (apps/sentinel/src/witness.ts), the repo's typescript and the loads check
// of the closure test (forbiddenLoads, apps/harness/test/helpers/import-specifiers.ts). Two commands:
//   node scripts/sentinel-witness.mjs print --tree <sha> [--overlay <prefix>=<sha>] [--repo <dir>]
//       The expected sentinel_sha of a tree whose sentinel writes this tool's witness: closureWitness of
//       apps/sentinel/src/run.ts on the tree <sha> read by git (ls-tree, cat-file), every file under <prefix> read at the
//       overlay sha instead (a deploy that ships the sentinel directory, apps/sentinel, from one sha over the rest of the
//       tree from another); an overlay commit with no file under <prefix> is refused. Refused as well: a composed tree whose
//       closure does not hold apps/sentinel/src/witness.ts, or holds one whose bytes differ from the witness.ts next to
//       this tool (its sentinel does not write this witness: run the tool of that tree); and one that fails the checks the
//       closure test makes on the real tree: a walk of the TypeScript syntax tree (syntaxTreeClosure) finds another
//       closure, an import() call or a Node module outside a closed list (no worker, child process, vm or module hook),
//       or a module of the closure makes a load forbiddenLoads names (require, eval, …). Prints one JSON object { witness, files,
//       tree, overlay }. Git runs as `git -C <repo>` with every inherited GIT_* variable removed from its environment
//       (`git -C` yields neither to GIT_DIR nor to GIT_INDEX_FILE); never a write.
//   node scripts/sentinel-witness.mjs compare --expected <64-hex> --after-day <YYYY-MM-DD> [--url <served timeline>]
//       One GET of the served timeline (https only, no redirect followed, 200 only, body bounded); strict JSON lines, days
//       increasing. --after-day is the last day served before the deploy: a timeline that no longer serves it (cut, or
//       empty) is refused. The first line whose day follows it is judged: none -> exit 2 "waiting"; its sentinel_sha
//       equal to --expected -> exit 0 "confirmed"; different -> exit 1 "mismatch".
//       The lines up to --after-day were written before the deploy and carry the witness of before: never compared.
// Any other failure (usage, git, network, a malformed line, a refusal above) exits 3, so it is never read as one of the
// three outcomes.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { closureWitness, executionClosure } from "../apps/sentinel/src/witness.ts";
import { forbiddenLoads } from "../apps/harness/test/helpers/import-specifiers.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ENTRY = "apps/sentinel/src/run.ts";
const WITNESS_MODULE = "apps/sentinel/src/witness.ts";
export const SERVED_TIMELINE = "https://monarkgate.tech/narabi/timeline.jsonl";
const MAX_BYTES = 8 * 1024 * 1024;
/** The Node modules a closure may import, a closed list (the closure test of apps/sentinel holds the same one). */
const NODE_MODULES = ["node:crypto", "node:fs", "node:path", "node:url"];
const SHA_RE = /^[0-9a-f]{64}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** The flags each command takes: required, then optional. The runbook's steps name these, as written here. */
export const COMMANDS = Object.freeze({
  print: Object.freeze({ required: Object.freeze(["--tree"]), optional: Object.freeze(["--overlay", "--repo"]) }),
  compare: Object.freeze({ required: Object.freeze(["--expected", "--after-day"]), optional: Object.freeze(["--url"]) }),
});

/** git -C <repo> <args>, stdout as bytes; every inherited GIT_* variable removed from the child's environment. */
function git(repo, args) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
  const r = spawnSync("git", ["-C", repo, ...args], { env, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${String(r.stderr ?? "").trim() || String(r.error)}`);
  return r.stdout;
}

/** "<prefix>=<sha>" -> { prefix, rev }, or null when absent. */
function parseOverlay(overlay) {
  if (overlay === undefined || overlay === null) return null;
  const m = /^([\w.@-]+(?:\/[\w.@-]+)*)=([^=\s]+)$/.exec(String(overlay));
  if (m === null || m[1].split("/").includes("..")) throw new Error(`--overlay takes <prefix>=<sha> (got ${JSON.stringify(overlay)})`);
  return { prefix: m[1], rev: m[2] };
}

/** A reader of the tree `tree` of `repo`, the files under the overlay's prefix read at its sha. */
export function gitTreeReader(repo, tree, overlay) {
  const commit = (rev) => git(repo, ["rev-parse", "--verify", "--end-of-options", `${rev}^{commit}`]).toString("utf8").trim();
  const filesOf = (sha) => git(repo, ["ls-tree", "-r", "-z", "--name-only", sha]).toString("utf8").split("\0").filter(Boolean);
  const base = commit(tree);
  const ov = parseOverlay(overlay);
  const at = new Map();
  let laid = null;
  if (ov === null) for (const f of filesOf(base)) at.set(f, base);
  else {
    const top = commit(ov.rev), under = (f) => f.startsWith(`${ov.prefix}/`);
    const laidFiles = filesOf(top).filter(under);
    if (laidFiles.length === 0) throw new Error(`--overlay ${ov.prefix}=${ov.rev}: the commit ${top} has no file under ${ov.prefix}`);
    for (const f of filesOf(base)) if (!under(f)) at.set(f, base);
    for (const f of laidFiles) at.set(f, top);
    laid = { prefix: ov.prefix, sha: top };
  }
  const reader = {
    read: (rel) => (at.has(rel) ? git(repo, ["cat-file", "blob", `${at.get(rel)}:${rel}`]) : undefined),
    list: (rel) => [...new Set([...at.keys()].filter((f) => f.startsWith(`${rel}/`)).map((f) => f.slice(rel.length + 1).split("/")[0]))].sort(),
  };
  return { reader, tree: base, overlay: laid };
}

/** The print command: the witness the sentinel writes when it runs from this composition of trees. */
export function runPrint({ repo = ROOT, tree, overlay }) {
  if (typeof tree !== "string" || tree === "") throw new Error("print takes --tree <sha>");
  const { reader, tree: sha, overlay: ov } = gitTreeReader(repo, tree, overlay);
  const files = executionClosure(reader, ENTRY);
  const theirs = files.includes(WITNESS_MODULE) ? reader.read(WITNESS_MODULE) : undefined;
  const ours = readFileSync(new URL("../apps/sentinel/src/witness.ts", import.meta.url));
  if (theirs === undefined || !ours.equals(Buffer.from(theirs))) throw new Error(`the sentinel of this tree does not write this witness (${WITNESS_MODULE} ${theirs === undefined ? "is not in its closure" : "differs from the one of this tool"}): run the tool of that tree`);
  assertClosureTest(reader, files);
  return { witness: closureWitness(reader, ENTRY), files, tree: sha, overlay: ov };
}

/** The served lines, strictly: one JSON object per LF-ended line, a day and a 64-hex sentinel_sha each, days increasing. */
export function servedLines(text) {
  const raw = String(text).split("\n");
  if (raw.pop() !== "") throw new Error("the served timeline does not end with a line feed");
  const lines = raw.map((l, i) => {
    let v;
    try { v = JSON.parse(l); } catch { throw new Error(`line ${String(i + 1)} is not JSON`); }
    if (v === null || typeof v !== "object" || !DAY_RE.test(String(v.day)) || !SHA_RE.test(String(v.sentinel_sha))) throw new Error(`line ${String(i + 1)} has no day or no sentinel_sha`);
    return { day: v.day, sentinel_sha: v.sentinel_sha };
  });
  for (let i = 1; i < lines.length; i++) if (!(lines[i].day > lines[i - 1].day)) throw new Error(`line ${String(i + 1)}: the days do not increase`);
  return lines;
}

/** GET of the served timeline: https only, a redirect refused, 200 only, the body cut at the bound; `fetchImpl` is the seam. */
export async function httpsGet(url, fetchImpl = fetch) {
  if (new URL(url).protocol !== "https:") throw new Error(`${url}: https only`);
  const res = await fetchImpl(url, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) throw new Error(`GET ${url} answered ${String(res.status)} (200 only, no redirect followed)`);
  const chunks = [];
  let n = 0;
  for await (const c of res.body ?? []) {
    if ((n += c.byteLength) > MAX_BYTES) throw new Error(`GET ${url}: the body exceeds ${String(MAX_BYTES)} bytes`);
    chunks.push(c);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** The compare command: the first served line after the last day served before the deploy, against the expected witness. */
export async function runCompare({ expected, afterDay, get = httpsGet, url = SERVED_TIMELINE }) {
  if (!SHA_RE.test(String(expected))) throw new Error("compare takes --expected <64 lowercase hex>");
  if (!DAY_RE.test(String(afterDay))) throw new Error("compare takes --after-day <YYYY-MM-DD>");
  const lines = servedLines(await get(url));
  if (!lines.some((l) => l.day === afterDay)) throw new Error(`--after-day ${afterDay} is not served: that day was served before the deploy and must still be`);
  const next = lines.find((l) => l.day > afterDay);
  if (next === undefined) return { status: "waiting", exit: 2, day: null, served: null, expected };
  const same = next.sentinel_sha === expected;
  return { status: same ? "confirmed" : "mismatch", exit: same ? 0 : 1, day: next.day, served: next.sentinel_sha, expected };
}

/** The second walk, on the TypeScript syntax tree, independent of the witness's scanner (the closure test keeps its own copy,
 *  read from disk: it ships in the public export, this tool does not): from `entry`, the modules Node loads (an import or
 *  export declaration naming a module, a type-only one erased; a relative specifier as the file, ".ts" or "/index.ts"; a
 *  workspace one through its package.json exports), the package directories traversed; an import() call throws, and so
 *  does a Node module outside NODE_MODULES. */
export function syntaxTreeClosure(reader, entry) {
  const pkgs = new Map();
  for (const group of ["apps", "packages"]) {
    for (const name of reader.list(group)) {
      const bytes = reader.read(`${group}/${name}/package.json`);
      if (bytes === undefined) continue;
      const j = JSON.parse(new TextDecoder().decode(bytes));
      pkgs.set(j.name, { dir: `${group}/${name}`, exports: j.exports });
    }
  }
  const dirs = new Set(), seen = new Set(), queue = [entry];
  const resolve = (from, spec) => {
    if (spec.startsWith("node:") && !NODE_MODULES.includes(spec)) throw new Error(`${from}: ${spec} is outside the closed list of Node modules (${NODE_MODULES.join(", ")}): a worker, a child process, vm or a module hook runs code no closure holds`);
    if (spec.startsWith("node:")) return null;
    if (spec.startsWith(".")) {
      const base = posix.normalize(posix.join(posix.dirname(from), spec));
      const hit = [base, `${base}.ts`, `${base}/index.ts`].find((c) => reader.read(c) !== undefined);
      if (hit === undefined) throw new Error(`${from}: ${spec} resolves to no file`);
      return hit;
    }
    const m = /^(@[^/]+\/[^/]+)(\/.*)?$/.exec(spec), pk = pkgs.get(m?.[1] ?? ""), sub = m?.[2] === undefined ? "." : `.${m[2]}`;
    const target = typeof pk?.exports === "string" ? (sub === "." ? pk.exports : undefined) : pk?.exports?.[sub];
    if (pk === undefined || typeof target !== "string") throw new Error(`${from}: ${spec} is no export of a workspace package`);
    dirs.add(pk.dir);
    return posix.normalize(posix.join(pk.dir, target));
  };
  while (queue.length > 0) {
    const f = queue.shift();
    if (seen.has(f)) continue;
    const bytes = reader.read(f);
    if (bytes === undefined) throw new Error(`${f}: absent from the tree`);
    seen.add(f);
    const visit = (n) => {
      if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) throw new Error(`${f}: an import() call: a load made at run time`);
      let spec;
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier) && n.importClause?.isTypeOnly !== true) spec = n.moduleSpecifier.text;
      else if (ts.isExportDeclaration(n) && n.moduleSpecifier !== undefined && ts.isStringLiteral(n.moduleSpecifier) && !n.isTypeOnly) spec = n.moduleSpecifier.text;
      const r = spec === undefined ? null : resolve(f, spec);
      if (r !== null) queue.push(r);
      ts.forEachChild(n, visit);
    };
    visit(ts.createSourceFile(f, new TextDecoder().decode(bytes), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
  }
  return { modules: [...seen].sort(), packageDirs: [...dirs].sort() };
}

/** The checks the closure test makes on the real tree, made on this one: the closure `files` read by the witness is the
 *  closure the syntax tree reads, and no module of it (a .ts, .mts, .cts, .js, .mjs or .cjs file) makes a load that no
 *  specifier shows (forbiddenLoads); else it throws. */
function assertClosureTest(reader, files) {
  const second = syntaxTreeClosure(reader, ENTRY);
  const walked = [...second.modules, ...second.packageDirs.map((d) => `${d}/package.json`)];
  const extra = files.filter((p) => !walked.includes(p)), missing = walked.filter((p) => !files.includes(p));
  if (extra.length > 0 || missing.length > 0) throw new Error(`the closure read by the witness is not the one the TypeScript syntax tree reads (witness only: ${extra.join(", ") || "none"}; syntax tree only: ${missing.join(", ") || "none"}): its sentinel would not hash what Node loads`);
  const loads = files.filter((p) => /\.[cm]?[jt]s$/.test(p)).flatMap((p) => forbiddenLoads(new TextDecoder().decode(reader.read(p))).map((h) => `${p} ${h}`));
  if (loads.length > 0) throw new Error(`a load that no specifier shows (${loads.join("; ")}): the closure cannot follow it`);
}

/** argv -> { command, flags }: a known command, each of its flags once with a value, the required ones present. */
export function parseArgs(argv) {
  const [command, ...rest] = argv;
  const spec = Object.hasOwn(COMMANDS, command ?? "") ? COMMANDS[command] : undefined;
  if (spec === undefined) throw new Error(`usage: sentinel-witness.mjs ${Object.keys(COMMANDS).join(" | ")} (got ${JSON.stringify(command)})`);
  const flags = {};
  for (let i = 0; i < rest.length; i += 2) {
    const k = rest[i], v = rest[i + 1];
    if (![...spec.required, ...spec.optional].includes(k) || Object.hasOwn(flags, k) || v === undefined || v.startsWith("--")) throw new Error(`${command}: unexpected ${JSON.stringify(k)}; takes ${[...spec.required, ...spec.optional].join(" ")}`);
    flags[k] = v;
  }
  for (const k of spec.required) if (!Object.hasOwn(flags, k)) throw new Error(`${command}: ${k} is required`);
  return { command, flags };
}

async function main(argv) {
  const { command, flags } = parseArgs(argv);
  if (command === "print") {
    console.log(JSON.stringify(runPrint({ repo: flags["--repo"] ?? ROOT, tree: flags["--tree"], overlay: flags["--overlay"] }), null, 2));
    return 0;
  }
  const r = await runCompare({ expected: flags["--expected"], afterDay: flags["--after-day"], url: flags["--url"] ?? SERVED_TIMELINE });
  console.log(JSON.stringify(r));
  return r.exit;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = await main(process.argv.slice(2)); } catch (e) {
    console.error(`sentinel-witness: FAIL-CLOSED: ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 3;
  }
}
