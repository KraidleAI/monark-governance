// scripts/mutants/run.mjs -- one mutant campaign on a clone (ADR-METHODE-2 D6, lot M-6): the ad hoc harnesses that each G1, corrector
// and reviewer wrote since 2026-09-28 (m2b corr2, m5 corr3, m5b G1, m8b), made unique. Node 24, zero dependencies.
// Usage: node scripts/mutants/run.mjs --repo <worktree> --base <sha> --out <dir> [--table <mutants.mjs|.json>] [--killers]
//   [--file <path>] [--only <id,...>] [--targets <test.ts,...>] [--timeout-ms <n>] [--min-free-mb <n>] [--lock-root <dir>] [--wait-ms <n>] [--poll-ms <n>]
// MUTANTS: --table, a module exporting MUTANTS or a JSON array, rows { id, line, op, before, after, why[, file][, test][, typecheck] }, or with
// edits: [{ line, before, after }, ...] in place of line, before, after: edits on distinct lines, applied as one block (lot MUTANTS-TOOL-2, D-1); op in COR,
// ROR, SDL, CONST (SDL empties the line); a row without file mutates --file, else the one non-test code file that base..tree
// changes, else refused ("ambiguous file"); a file under test/ is mutable iff a test file of the globs imports it directly, never a *.test.ts (MUTANTS-TEST-SUPPORT-1). --killers: the "// killer:" lines (parseKiller of scripts/red-proof.mjs) of the test
// files that base..tree changes, as K1, K2... (files sorted, then line), each first run alone as its named test (MUTANTS-SKIPPED-NOT-KILLED-1): the
// column-0 test( or it( declared right below it, or right below the last line of its pile (killer lines stacked); for a line in a test's body, the
// column-0 declaration that encloses it (the nearest above, no column-0 line opening with "}" or ")" between, and not closed on its own line by ");");
// else none: its file runs whole.
// TARGETS: the test files of the quoted package.json "test" globs whose import closure holds the mutated file (targetsOf): import/export ... from
// "x", import "x", import("x") of a string literal (a computed import( is skipped, never a target: item MUTANTS-DYNAMIC-IMPORT-1); relative and
// file: specifiers; .ts .tsx .mts .cts .mjs .cjs .js; plus the --targets files, no duplicate (Q-G2-3). First run on the direct importers (a killer:
// its own test file), else on every target; a survivor or a non conclu (D-4) rerun on every target file whole, never a time overrun (a run past
// its bound or a test past --timeout-ms: corrections D-5). REFUSED (exit 2) before any clone: usage, --repo without .git, --out inside --repo by
// real paths (a link, a name like ..x: C-G2-3), <out>/clone present (one launch per clone), the tool outside a git checkout (tool_tree), a --file
// or --targets not in the tree, a malformed row, no target (an empty graph needs --targets); a held host lock is no refusal, each run waits for
// it in the FIFO queue (corrections D-6). THEN: one --no-local clone of --repo at its HEAD, its changed and untracked files
// copied (sha256 checked), deleted ones removed; its node_modules built as in oracle/run.mjs: the main checkout's entries junctioned, @monark/*
// re-pointed into the clone (item MUTANTS-NM-WORKSPACES-1); a baseline run of every target file (not green: no mutant runs, "non conclu (base)"),
// MUTANTS-BASELINE-UNREPORTED-1: when the tree has scripts/test-counts-reporter.mjs and test/test-counts.json, the baseline also runs that reporter
// (a second reporter, its output in <out>/tmp) and holds each target file of the record to it: a count that differs, or no summary of its own, makes a
// green baseline non conclu; a target file absent from the record is named in the baseline's note; without the two, its note says so; one mutant
// at a time: each <before> exactly once on its line, else anchor-lost (counted, no edit applied); before each run (a baseline, a mutant), free memory
// under --min-free-mb (default and floor 4096: C-V-4, C-V-9) is polled every --poll-ms (5000) up to --wait-ms (5400000, the bound of acquire()), then the
// host lock is taken by acquire() of oracle/lock.mjs for that run alone (FIFO, never forced: a waiting oracle passes between two mutants) and released
// at once (D-3, D-5); memory is read again once the lock is taken: short, the lock is released at once and the bounded wait goes on, never with the
// lock held (corrections D-4); a bound passed stops the campaign by name (exit 4, record stop with the ids not run); node --test in TAP ("(test 42)" skipped: it
// runs once, in the oracle's suite, ADR D3), the file restored in a finally and its sha256 checked (a mismatch, or a file changed since the start,
// stops the campaign: exit 3). VERDICT of a node run (classify of red-proof.mjs), the first row that holds; noted on the line of RESULTS.txt too (a
// mutant, its replay, a baseline); never "equivalent":
//   non conclu  a dead child (error, signal, exit 134) or a run past its bound; no test entry; an exit code that contradicts the entries, non-zero
//               without a failing entry ("lost") or 0 with one (MUTANTS-RUN-EXIT-CODE-1; "TAP cut" noted without its closing # duration_ms, G2 m-4)
//   non conclu  the row names its test (a killer line, a row's test), run alone by --test-name-pattern: no entry of its own, or skipped ones only
//   survit      its named test's own entry is ok, whatever else is red, a hook or another test (noted "red outside the named test only":
//               MUTANTS-SKIPPED-NOT-KILLED-1); without a named test, every entry is ok
//   tue         its named test's own entry fails by assertion (ERR_ASSERTION); without a named test, a top-level entry does
//   non conclu  otherwise: failures without an assertion (a test past --timeout-ms, a load error)
// then PROMOTED to tue, noted (MUTANTS-REPLAY-PROMOTE-1): a "lost" first run whose replay shows its named test's own entry (that name, located in a
// file of the first run) failing by assertion; never by another test, a hook or a load, never a skipped test. A replay keeps its verdict (no named test).
// A row marked typecheck (D-2) runs tsc --noEmit -p tsconfig.json of the clone's node_modules/typescript instead: tue iff an error falls in a target file;
// non conclu if tsc dies, if every error falls outside the targets (corrections D-2, note "N error(s) outside the targets") or if tsc exits non-zero
// without a diagnostic line "file(l,c): error TSn:" (corrections D-3, note "tsc exit N without a diagnostic line"); survit otherwise. Such rows run
// iff the unmutated tsc exits 0 (baseline_typecheck: vert, rouge on a non-zero exit, non conclu if tsc dies). Children: childEnv of
// oracle/run.mjs over the DENY list of red-proof.mjs; each node --test child takes, ahead of its flags, the -r, --require and --import of the tree's
// package.json test script in their order, a quoted word as one word (test_preload: MUTANTS-BASELINE-UNREPORTED-1).
// RECORD monark.mutants.v1 <out>/RESULTS.json (tool_sha256: the bytes that run; tool_tree,
// tool_dirty: HEAD and dirty recipe of the tool's repository; fields only added since, D-6), one line per mutant in <out>/RESULTS.txt, TAP in <out>/tap/;
// last stdout line: mutants-result {"exit","record","sha256"}. Exit 0 iff every mutant is killed, 1 otherwise, 2 refused, 3 restore, 4 stopped by a bound (D-3, D-5). Main guard: import.meta.main.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, globSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, symlinkSync,
  writeFileSync } from "node:fs";
import { freemem, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { classify, DENY, parseKiller, parseTap } from "../red-proof.mjs";
import { acquire } from "../oracle/lock.mjs";
import { childEnv } from "../oracle/run.mjs";

const OPS = ["COR", "ROR", "SDL", "CONST"], EXTS = [".ts", ".tsx", ".mts", ".cts", ".mjs", ".cjs", ".js"], TEST_CODE = /(^|\/)test\/|\.test\.ts$/;
const COUNTS = ["scripts/test-counts-reporter.mjs", "test/test-counts.json"]; // the reporter of test:main and its record (TEST-COUNT-FLOOR-1), read in the clone
const envOf = (tmp) => ({ ...childEnv(tmp, DENY), GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0", NODE_TEST_CONTEXT: undefined }); // Q-V-3: imported, never recopied
const IMPORT = /(?:^|[^\w$.])(?:(?:import|export)\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"'\s]+)["']|import\s*\(\s*["']([^"'\s]+)["']\s*[,)])/g;
const VALUED = ["--repo", "--base", "--out", "--table", "--file", "--only", "--targets", "--timeout-ms", "--min-free-mb", "--lock-root", "--wait-ms", "--poll-ms"];
const USAGE = "usage: --repo <worktree> --base <sha> --out <dir> (--table <mutants.mjs|.json> | --killers | both) [--file <path>] [--only <id,...>] [--targets <test.ts,...>] [--timeout-ms <n>] [--min-free-mb <n, at least 4096>] [--lock-root <dir>] [--wait-ms <n>] [--poll-ms <n, at least 1>]";
const SIGNALS = ["exit", "SIGINT", "SIGTERM"]; // acquire() of oracle/lock.mjs adds one listener of each per call: removed after each release (D-5)
const sha = (b) => createHash("sha256").update(b).digest("hex");
const TOOL_SHA256 = sha(readFileSync(fileURLToPath(import.meta.url))); // the bytes that run, never a blob of HEAD
const TOOL_ROOT = join(import.meta.dirname, "..", ".."); // the checkout of the tool and of its imports: tool_tree, tool_dirty (Q-V-4, Q-G2-5)
const stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const slash = (p) => p.split(sep).join("/");
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const real = (p) => { try { return realpathSync(p); } catch { return dirname(p) === p ? p : join(real(dirname(p)), basename(p)); } }; // C-G2-3
const inTree = (root, f) => /^[\w.@-]+(\/[\w.@-]+)*$/.test(f ?? "") && !f.split("/").includes("..") && isFile(join(root, f)); // relative, no ..
const str = (s) => { try { return JSON.parse(`"${s}"`); } catch { return s; } };

function git(cwd, ...args) {
  const r = spawnSync("git", ["-c", "core.longpaths=true", ...args], { cwd, env: envOf(tmpdir()), maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${String(r.stderr ?? r.error).trim()}`);
  return r.stdout;
}
const names = (cwd, ...args) => git(cwd, ...args).toString("utf8").split("\0").filter((f) => f !== "" && !f.endsWith("/"));
function stateOf(dir) { // [HEAD, dirty, untracked]: dirty is the recipe of oracle/run.mjs, sha256 of the diff to HEAD and of the untracked files, or null
  const head = git(dir, "rev-parse", "HEAD").toString().trim(), patch = git(dir, "diff", "--binary", "--full-index", "HEAD");
  const untracked = names(dir, "ls-files", "--others", "--exclude-standard", "-z").sort(), dh = createHash("sha256").update(patch);
  for (const f of untracked) dh.update(`\0${f}\0${sha(readFileSync(join(dir, f)))}`);
  return [head, patch.length > 0 || untracked.length > 0 ? dh.digest("hex") : null, untracked];
}

function resolveSpec(from, spec) { // a relative or file: specifier to an existing source file; a bare name is not followed (null)
  if (!/^(?:\.\.?\/|file:)/.test(spec)) return null;
  let p;
  try { p = spec.startsWith("file:") ? fileURLToPath(spec) : resolve(dirname(from), spec); } catch { return null; }
  return [p, ...EXTS.map((e) => p + e)].find((c) => EXTS.some((e) => c.endsWith(e)) && isFile(c)) ?? null;
}

/** The test files of testGlobs under repoRoot whose import closure (static forms, import() of a literal) holds file: the direct importers, then the others. */
export function targetsOf(repoRoot, file, testGlobs) {
  const root = resolve(repoRoot), goal = resolve(root, file), memo = new Map(), direct = [], transitive = [];
  const deps = (f) => { if (!memo.has(f)) memo.set(f, [...readFileSync(f, "utf8").matchAll(IMPORT)].map((m) => resolveSpec(f, m[1] ?? m[2])).filter((p) => p !== null)); return memo.get(f); };
  for (const t of globSync([...testGlobs], { cwd: root }).map(slash).sort()) {
    const start = resolve(root, t), seen = new Set(), stack = [start];
    if (!isFile(start)) continue;
    while (stack.length > 0) { const f = stack.pop(); if (!seen.has(f)) { seen.add(f); stack.push(...deps(f)); } }
    if (deps(start).includes(goal)) direct.push(t);
    else if (seen.has(goal)) transitive.push(t);
  }
  return { direct, transitive };
}

function parseArgs(argv) {
  const o = { killers: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--killers") o.killers = true;
    else if (VALUED.includes(argv[i]) && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) o[argv[i].slice(2)] = argv[++i];
    else throw new Error(`unknown or incomplete option ${argv[i]}; ${USAGE}`);
  }
  const num = (k, d) => (o[k] === undefined ? d : /^\d+$/.test(o[k]) ? Number(o[k]) : NaN);
  Object.assign(o, { timeout: num("timeout-ms", 120000), minFree: num("min-free-mb", 4096), lockRoot: o["lock-root"] ?? "F:/tmp", wait: num("wait-ms", 5_400_000), poll: num("poll-ms", 5000) });
  if (!o.repo || !o.base || !o.out || (!o.table && !o.killers) || !(o.timeout > 0) || !(o.minFree >= 4096) || !(o.wait >= 0) || !(o.poll > 0)) throw new Error(USAGE);
  return o;
}

function mutate(text, m) { // the text with the mutant's edits applied as one block (D-1), or null when a <before> is not exactly once on its line
  const lines = text.split("\n");
  for (const e of m.edits) {
    const l = lines[e.line - 1];
    if (l === undefined || l.split(e.before).length !== 2) return null;
    lines[e.line - 1] = m.op === "SDL" ? "" : l.replace(e.before, () => e.after);
  }
  return lines.join("\n");
}

function lostOf(m, root, globs) { // why the mutant cannot apply to the tree at root, or null; its edits lie on distinct lines, each is checked alone
  if (!OPS.includes(m.op) || m.edits.some((e) => e.before === "")) return `operator ${m.op} or an empty <before>`;
  if (!inTree(root, m.file)) return `${String(m.file)} is not a file of the tree`;
  if (TEST_CODE.test(m.file) && (m.file.endsWith(".test.ts") || targetsOf(root, m.file, globs).direct.length === 0)) return `${m.file} is test code: a mutant mutates production code`;
  const text = readFileSync(join(root, m.file), "utf8"), e = m.edits.find((x) => mutate(text, { op: m.op, edits: [x] }) === null);
  return e === undefined ? null : `"${e.before}" is not exactly once on ${m.file}:${e.line}`;
}

const edit = (e) => e !== null && typeof e === "object" && Number.isInteger(e.line) && e.line > 0 && typeof e.before === "string" && e.before !== "" && typeof e.after === "string";
const malformed = (m) => !(m !== null && typeof m === "object" && typeof m.id === "string" && /^[\w.-]+$/.test(m.id) && OPS.includes(m.op) && ["undefined", "string"].includes(typeof m.file) &&
  ["undefined", "string"].includes(typeof m.test) && ["undefined", "boolean"].includes(typeof m.typecheck) && (m.edits === undefined ? edit(m) : Array.isArray(m.edits) && // D-1
  m.edits.length > 0 && m.edits.every(edit) && new Set(m.edits.map((e) => e.line)).size === m.edits.length && [m.line, m.before, m.after].every((x) => x === undefined)));

const lineOf = (r) => `${r.id} l.${r.line} ${r.op} ${r.status} (${r.fails.length} rouge(s), ${r.oks} vert(s), ${r.ms} ms) restaure ${r.sha_before === r.sha_after ? "OK" : "ECHEC"} ; ${r.why}` +
  (r.fails.length > 0 ? ` ; rouges : ${r.fails.map((f) => f.slice(0, 60)).join(" | ")}` : "") + (r.note ? ` ; ${r.note}` : "") +
  (r.replay ? ` ; rejeu ${r.replay.files.join(",")} : ${r.replay.status} (${r.replay.fails.length} rouge(s), ${r.replay.oks} vert(s)${r.replay.note ? `, ${r.replay.note}` : ""})` : "") +
  (r.edits.length > 1 ? ` ; edits l.${r.edits.map((e) => e.line).join(",l.")}` : "") + (r.typecheck ? " ; typecheck" : "");

export async function main(argv) {
  const o = parseArgs(argv), repo = resolve(o.repo), out = resolve(o.out), clone = join(out, "clone"), tmp = join(out, "tmp"), taps = join(out, "tap");
  if (!existsSync(join(repo, ".git"))) throw new Error(`${slash(repo)} is not a git checkout (no .git)`);
  const rel = relative(realpathSync(repo), real(out)); // C-G2-3: real paths, never a string prefix (a link into --repo, a name like ..x: inside)
  if (!isAbsolute(rel) && rel.split(sep)[0] !== "..") throw new Error(`--out ${slash(out)} lies inside --repo: a campaign never writes in the tree`);
  if (existsSync(clone)) throw new Error(`${slash(clone)} exists: one launch per clone (read its RESULTS.txt, take a new --out)`);
  if (o.file !== undefined && !inTree(repo, o.file)) throw new Error(`--file ${o.file} is not a file of the tree`); // Q-G2-6: before any clone
  const base = git(repo, "rev-parse", "--verify", `${o.base}^{commit}`).toString().trim(), [gel, dirty, untracked] = stateOf(repo);
  let toolTree, toolDirty; // Q-V-4, Q-G2-5: HEAD and dirty recipe of the tool's checkout; outside one, refused naming tool_tree and its root (C-G2-2)
  try { [toolTree, toolDirty] = stateOf(TOOL_ROOT); } catch (e) { throw new Error(`tool_tree: ${slash(TOOL_ROOT)} is not a git checkout: ${e.message}`); }
  const changed = [...new Set([...names(repo, "diff", "--name-only", "--no-renames", "-z", base), ...names(repo, "ls-files", "--others", "--exclude-standard", "-z")])].sort();
  let table = null, mutants = [];
  if (o.table) {
    const buf = readFileSync(o.table), rows = o.table.endsWith(".json") ? JSON.parse(buf.toString("utf8")) : (await import(pathToFileURL(resolve(o.table)).href)).MUTANTS;
    if (!Array.isArray(rows) || rows.some(malformed)) throw new Error(`${o.table}: MUTANTS is not an array of { id, line, op, before, after, why[, file][, test][, typecheck] } rows (or edits: [{ line, before, after }, ...] on distinct lines in place of line, before, after)`);
    const code = changed.filter((p) => EXTS.some((e) => p.endsWith(e)) && !/\.d\.[cm]?ts$/.test(p) && !TEST_CODE.test(p) && isFile(join(repo, p)));
    table = { path: slash(resolve(o.table)), sha256: sha(buf) };
    for (const r of rows) {
      if (r.file === undefined && o.file === undefined && code.length !== 1) throw new Error(`ambiguous file: row ${r.id} names no file, no --file, and base..tree changes ${code.length} code files`);
      mutants.push({ ...r, edits: r.edits ?? [{ line: r.line, before: r.before, after: r.after }], line: r.line ?? r.edits[0].line, file: r.file ?? o.file ?? code[0], origin: "table" });
    }
  }
  if (o.killers) for (const t of changed.filter((p) => p.endsWith(".test.ts") && isFile(join(repo, p)))) {
    const lines = readFileSync(join(repo, t), "utf8").split("\n"), decl = (l) => /^(?:test|it)\(\s*"((?:[^"\\]|\\.)*)"/.exec(l ?? "");
    lines.forEach((l, i) => {
      const k = parseKiller(l);
      if (k === null) return;
      let j = i; // its named test: the declaration right below its pile, else the one whose body holds it (MUTANTS-SKIPPED-NOT-KILLED-1)
      while (parseKiller(lines[j + 1]) !== null) j++;
      let d = decl(lines[j + 1]);
      for (let u = i - 1; d === null && u >= 0 && !/^[})]/.test(lines[u]); u--) if (decl(lines[u]) !== null) { d = /\);\s*(\/\/.*)?$/.test(lines[u]) ? null : decl(lines[u]); break; }
      mutants.push({ ...k, edits: [{ line: k.line, before: k.before, after: k.after }], id: `K${mutants.filter((x) => x.origin === "killer").length + 1}`, why: `killer of ${d ? str(d[1]) : `${t}:${i + 1}`}`, test: d ? str(d[1]) : undefined, own: t, origin: "killer" });
    });
  }
  const only = o.only?.split(","), unknown = (only ?? []).filter((id) => !mutants.some((m) => m.id === id));
  if (unknown.length > 0 || new Set(mutants.map((m) => m.id)).size !== mutants.length) throw new Error(`unknown --only id(s) ${unknown.join(",")} or mutant ids not unique`);
  if (only) mutants = mutants.filter((m) => only.includes(m.id));
  const script = String(JSON.parse(readFileSync(join(repo, "package.json"), "utf8")).scripts?.test ?? ""), globs = [...script.matchAll(/"([^"]+\.test\.ts)"/g)].map((x) => x[1]);
  if (globs.length === 0) throw new Error("the package.json test script quotes no *.test.ts glob");
  const words = (script.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((w) => w.replace(/"([^"]*)"/g, "$1")); // MUTANTS-BASELINE-UNREPORTED-1: a quoted word is one word
  const preload = words.flatMap((w, i) => (/^(?:-r|--require|--import)$/.test(w) && i + 1 < words.length ? [w, words[i + 1]] : /^(?:--require|--import)=/.test(w) ? [w] : []));
  const fallback = o.targets?.split(",") ?? [];
  if (fallback.some((t) => !isFile(join(repo, t)))) throw new Error(`--targets ${o.targets}: not files of the tree`);
  for (const m of mutants) {
    m.lost = lostOf(m, repo, globs);
    const g = m.lost === null ? targetsOf(repo, m.file, globs) : { direct: [], transitive: [] }, found = [...g.direct, ...g.transitive];
    m.targets = [...new Set([...(m.own ? [m.own] : []), ...found, ...fallback])]; // Q-G2-3: --targets adds its files to the graph's
    m.first = m.own ? [m.own] : g.direct.length > 0 ? g.direct : m.targets;
    if (m.lost === null && m.targets.length === 0) throw new Error(`no target: ${m.id} (${m.file}) is imported by no test file of ${globs.join(" ")}; name one with --targets`);
  }

  mkdirSync(out, { recursive: true });
  git(out, "clone", "-q", "--no-local", "--no-checkout", "-c", "core.autocrlf=false", repo, clone);
  git(clone, "checkout", "-q", "--detach", gel);
  for (const p of new Set([...names(repo, "diff", "--name-only", "--no-renames", "-z", "HEAD"), ...untracked])) {
    if (!isFile(join(repo, p))) { rmSync(join(clone, p), { force: true }); continue; }
    mkdirSync(dirname(join(clone, p)), { recursive: true });
    copyFileSync(join(repo, p), join(clone, p));
    if (sha(readFileSync(join(clone, p))) !== sha(readFileSync(join(repo, p)))) throw new Error(`${p}: the copy differs from the tree`);
  }
  // node_modules of the clone: scripts/oracle/run.mjs l.105-115 copied, unchanged there (item MUTANTS-NM-WORKSPACES-1), its tree read as --repo
  const nmSrc = join(dirname(resolve(repo, git(repo, "rev-parse", "--git-common-dir").toString().trim())), "node_modules"), nm = join(clone, "node_modules");
  if (existsSync(nmSrc)) { // as mk-nm.ps1: every entry junctioned, except the workspaces, re-pointed into the clone
    mkdirSync(join(nm, "@monark"), { recursive: true });
    for (const e of readdirSync(nmSrc, { withFileTypes: true }).filter((x) => x.name !== "@monark")) {
      if (e.isFile()) copyFileSync(join(nmSrc, e.name), join(nm, e.name)); else symlinkSync(join(nmSrc, e.name), join(nm, e.name), "junction");
    }
    for (const w of ["packages", "apps"].flatMap((d) => (existsSync(join(clone, d)) ? readdirSync(join(clone, d)).map((x) => join(clone, d, x)) : []))) {
      const n = existsSync(join(w, "package.json")) ? JSON.parse(readFileSync(join(w, "package.json"), "utf8")).name : undefined;
      if (typeof n === "string" && n.startsWith("@monark/")) symlinkSync(w, join(nm, n), "junction");
    }
  }
  mkdirSync(tmp);
  mkdirSync(taps);

  const txt = join(out, "RESULTS.txt"), start = stamp(), memShort = () => Math.floor(freemem() / 2 ** 20) < o.minFree, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const say = (s) => { writeFileSync(txt, `${s}\n`, { flag: "a" }); console.log(s); };
  const runSet = (files, pattern, name, { counts, read } = {}) => { // counts: where the baseline's per-file counts go; read: a replay's named test, { test, files }
    const args = [...preload, "--test", "--test-reporter=tap", `--test-timeout=${o.timeout}`, "--test-force-exit", "--test-skip-pattern=\\(test 42\\)"];
    if (pattern !== undefined) args.push(`--test-name-pattern=^${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
    if (counts !== undefined) args.push("--test-reporter-destination=stdout", `--test-reporter=${pathToFileURL(join(clone, COUNTS[0])).href}`, `--test-reporter-destination=${counts}`);
    const t0 = Date.now(), r = spawnSync(process.execPath, [...args, ...files], { cwd: clone, env: envOf(tmp), encoding: "utf8", timeout: o.timeout * 10, maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
    const tap = r.stdout ?? "", all = parseTap(tap), es = all.filter((e) => !e.skip), bad = es.filter((e) => !e.ok), codes = [...tap.matchAll(/^\s*code: '?([A-Z_]+)'?\s*$/gm)].map((x) => x[1]), named = pattern === undefined ? null : es.filter((e) => e.name === pattern);
    writeFileSync(join(taps, `${name}.tap`), tap); const cut = !/^# duration_ms \S+$/.test(tap.trimEnd().split(/\r?\n/).at(-1) ?? ""); // truncation() of red-proof.mjs, its first test (G2 m-4)
    const dead = r.error !== undefined || r.signal !== null || r.status === 134, late = r.error?.code === "ETIMEDOUT" || /^\s*failureType: 'testTimeoutFailure'\s*$/m.test(tap), lost = bad.length === 0 && r.status !== 0, odd = bad.length > 0 && r.status === 0, own = named === null ? bad : named.filter((e) => !e.ok), miss = named?.length === 0;
    const at = (e) => slash(/^ {2}location: (['"`])(.*):\d+:\d+\1$/m.exec(e.lines.join("\n"))?.[2].replace(/\\(.)/g, "$1") ?? ""); // a failing entry's file, quoted and escaped as util.inspect writes it
    return { files, status: dead || es.length === 0 || lost || odd || miss ? "non conclu" : own.length === 0 ? "survit" : own.some((e) => classify(e) === "assert-fail") ? "tue" : "non conclu",
      strict: codes.length === 1 && codes[0] === "ERR_ASSERTION", fails: bad.map((e) => e.name), oks: es.length - bad.length, exit: r.status, signal: r.signal, ms: Date.now() - t0, tap_sha256: sha(tap),
      timed_out: late, lost: lost && !dead, named_kill: read && bad.some((e) => e.name === read.test && read.files.some((f) => at(e).endsWith(`/clone/${f}`)) && classify(e) === "assert-fail"),
      note: dead ? null : miss ? `the named test ${all.some((e) => e.name === pattern) ? "is skipped" : "has no entry"}` : es.length === 0 || lost || odd ? `exit ${String(r.status)} ${es.length === 0 ? "without a test entry" : lost ? "without a failing entry" : `with ${bad.length} failing entr${bad.length === 1 ? "y" : "ies"}`}${cut ? " (TAP cut: no closing summary)" : ""}` : own.length === 0 && bad.length > 0 ? "red outside the named test only" : null };
  }; // late (corrections D-5): a run past its bound (spawnSync ETIMEDOUT) or a test past --timeout-ms (TAP testTimeoutFailure); lost, odd: the exit code contradicts the entries (MUTANTS-RUN-EXIT-CODE-1)
  const counted = COUNTS.every((p) => isFile(join(clone, p))) ? join(tmp, "BASELINE.counts.json") : undefined; // MUTANTS-BASELINE-UNREPORTED-1
  const tally = (g, files) => { // a green baseline is non conclu if a target file of the record reports another count or no summary of its own
    const json = (p) => { try { const v = JSON.parse(readFileSync(p, "utf8")); return v !== null && typeof v === "object" && !Array.isArray(v) ? v : null; } catch { return null; } };
    const rec = counted === undefined ? null : json(join(clone, COUNTS[1])), got = (counted === undefined ? null : json(counted)) ?? {}, listed = files.filter((f) => rec !== null && Object.hasOwn(rec, f));
    const gaps = counted === undefined ? [] : rec === null ? files : listed.filter((f) => got[f]?.summary !== true || got[f].tests !== rec[f]), absent = files.filter((f) => !listed.includes(f));
    const said = counted === undefined ? `no test count check: the tree has no ${COUNTS.filter((p) => !isFile(join(clone, p))).join(" nor ")}` : rec === null ? `${COUNTS[1]} unreadable` : [
      gaps.length > 0 ? `${COUNTS[1]} not met: ${gaps.map((f) => `${f} ${got[f]?.summary === true ? `${String(got[f].tests)} of ${String(rec[f])}` : "without a summary"}`).join(", ")}` : "",
      absent.length > 0 ? `not in ${COUNTS[1]}: ${absent.join(", ")}` : ""].filter((x) => x !== "").join("; ");
    return { ...g, status: gaps.length > 0 && g.status === "survit" ? "non conclu" : g.status, note: [g.note, said].filter((x) => x).join("; ") || null };
  };
  const tsc = (files, name) => { // TYPECHECK (D-2): the typecheck gate of the clone under its own TypeScript; tue iff an error falls in a target file
    const t0 = Date.now(), r = spawnSync(process.execPath, [join(clone, "node_modules", "typescript", "lib", "tsc.js"), "--noEmit", "-p", "tsconfig.json"],
      { cwd: clone, env: envOf(tmp), encoding: "utf8", timeout: o.timeout * 10, maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
    const text = r.stdout ?? "", errors = [...text.matchAll(/^(\S+?)\((\d+),\d+\): error (TS\d+):/gm)], fails = errors.filter((x) => files.includes(x[1])).map((x) => `${x[1]}:${x[2]} ${x[3]}`);
    writeFileSync(join(taps, `${name}.tsc.txt`), text);
    return { files, status: r.error !== undefined || r.signal !== null || r.status === 134 ? "non conclu" : fails.length > 0 ? "tue" : "survit", strict: fails.length > 0 && fails.length === errors.length,
      fails, oks: 0, exit: r.status, signal: r.signal, ms: Date.now() - t0, tap_sha256: sha(text), typecheck: true, outside: errors.length - fails.length };
  };
  const gate = async (id, run) => { // MEMORY-WAIT (D-3), then LOCK-MIDRUN (D-5): the host lock held for this run alone; { stop, waited_ms } once a bound passes
    const t0 = Date.now(); // corrections D-4: memory read again once the lock is taken; short, the lock is released and the bounded wait goes on
    for (let short = memShort(); ;) {
      if (short) { if (Date.now() - t0 >= o.wait) return { stop: "memoire", waited_ms: Date.now() - t0 }; await sleep(o.poll); short = memShort(); continue; }
      const memory = Date.now() - t0, had = SIGNALS.map((e) => process.listeners(e)), lk = await acquire(o.lockRoot, { role: "mutants", out: slash(out), mutant: id }, { pollMs: o.poll, maxMs: o.wait });
      try { if (lk === null) return { stop: "verrou", waited_ms: Date.now() - t0 }; short = memShort(); if (!short) return { ...run(), memory_wait_ms: memory, lock_wait_ms: lk.waitedMs }; }
      finally { lk?.release(); SIGNALS.forEach((e, i) => process.listeners(e).filter((f) => !had[i].includes(f)).forEach((f) => process.removeListener(e, f))); }
    }
  };
  const runnable = mutants.filter((m) => m.lost === null), all = [...new Set(runnable.filter((m) => !m.typecheck).flatMap((m) => m.targets))];
  const typed = [...new Set(runnable.filter((m) => m.typecheck).flatMap((m) => m.targets))]; // D-2: the target files of the typecheck rows
  const sha0 = Object.fromEntries([...new Set(runnable.map((m) => m.file))].sort().map((f) => [f, sha(readFileSync(join(clone, f)))]));
  writeFileSync(txt, `# mutants monark.mutants.v1, repo ${slash(repo)} gel ${gel} dirty ${dirty ?? "none"}, base ${base}, clone ${slash(clone)}, tool sha256 ${TOOL_SHA256} tree ${toolTree}, start ${start}\n`);
  for (const [f, s] of Object.entries(sha0)) say(`# sha0 ${f} ${s}`);
  let stop = null;
  const baseline = async (files, name, run) => { // vert, rouge or non conclu (a dead child); null without a file or once the campaign stops
    const g = files.length === 0 || stop !== null ? null : await gate(name, run);
    if (g?.stop) stop = { reason: g.stop, at: name, waited_ms: g.waited_ms };
    if (g === null || g.stop) return null;
    g.status = g.typecheck ? (g.status === "non conclu" ? g.status : g.exit === 0 ? "vert" : "rouge") : ({ survit: "vert", tue: "rouge" }[g.status] ?? g.status);
    say(`${name} l.0 - ${g.status} (${g.fails.length} rouge(s), ${g.oks} vert(s), ${g.ms} ms) restaure OK ; unmutated${g.note ? ` ; ${g.note}` : ""}`);
    return g;
  };
  const b = await baseline(all, "BASELINE", () => tally(runSet(all, undefined, "BASELINE", { counts: counted }), all)), bt = await baseline(typed, "BASELINE-TYPECHECK", () => tsc(typed, "BASELINE-TYPECHECK"));
  const rows = [];
  let code = null;
  for (const m of mutants) {
    if (stop !== null) break;
    const row = { id: m.id, origin: m.origin, file: m.file ?? null, line: m.line, op: m.op, why: m.why ?? "", test: m.test ?? null, targets: m.targets, status: "anchor-lost",
      strict: false, fails: [], oks: 0, exit: null, ms: 0, tap_sha256: null, sha_before: null, sha_after: null, replay: null, note: m.lost, edits: m.edits, typecheck: m.typecheck === true,
      memory_wait_ms: null, lock_wait_ms: null };
    if (m.lost === null) {
      const p = join(clone, m.file), orig = readFileSync(p), text = mutate(orig.toString("utf8"), m);
      row.sha_before = row.sha_after = sha(orig);
      if (row.sha_before !== sha0[m.file]) [row.status, row.note, code] = ["non conclu", "the file is not in its initial state", 3];
      else if (text === null) row.note = "anchor lost on the clone";
      else if ((m.typecheck ? bt : b)?.status !== "vert") row.status = "non conclu (base)";
      else {
        const g = await gate(m.id, () => { // the file mutated under the lock only; a non conclu replayed as a survivor (D-4) unless timed out (corrections
          try { writeFileSync(p, text); const first = m.typecheck ? tsc(m.targets, m.id) : runSet(m.first, m.test, m.id); // D-5); a typecheck row has no replay
            return { first, replay: !m.typecheck && (first.status === "survit" || (first.status === "non conclu" && !first.timed_out)) ? runSet(m.targets, undefined, `${m.id}.replay`,
              { read: m.test === undefined ? undefined : { test: m.test, files: m.first } }) : null }; }
          finally { writeFileSync(p, orig); }
        });
        if (g.stop) { stop = { reason: g.stop, at: m.id, waited_ms: g.waited_ms }; break; }
        const f = g.first, unjudged = m.typecheck && f.status === "survit" && f.exit !== 0; // corrections D-2, D-3: tsc out non-zero (any error), none in a target
        const promoted = f.lost === true && g.replay?.named_kill === true; // MUTANTS-REPLAY-PROMOTE-1: a lost first run whose replay reddens the named test itself
        row.sha_after = sha(readFileSync(p));
        Object.assign(row, { status: unjudged ? "non conclu" : promoted ? "tue" : f.status, strict: f.strict, fails: f.fails, oks: f.oks, exit: f.exit, ms: f.ms, tap_sha256: f.tap_sha256, replay: g.replay,
          note: f.outside > 0 ? `${f.outside} error(s) outside the targets` : unjudged ? `tsc exit ${String(f.exit)} without a diagnostic line` : promoted ? `promoted by its replay, where its named test fails by assertion; first run: ${String(f.note)}` : f.note ?? null,
          memory_wait_ms: g.memory_wait_ms, lock_wait_ms: g.lock_wait_ms });
        if (row.sha_after !== row.sha_before) [row.note, code] = ["the file was not restored", 3];
      }
    }
    rows.push(row);
    say(lineOf(row));
    if (code === 3) break;
  }
  if (stop !== null) { // stopped by name (D-3, D-5): the ids not run, for a relaunch by --only
    [stop.not_run, code] = [mutants.slice(rows.length).map((m) => m.id), 4];
    say(`# stop ${stop.reason} at ${stop.at} after ${stop.waited_ms} ms (bound ${o.wait} ms) ; not run ${stop.not_run.join(",")}`);
  }
  const counts = {}, ids = (f) => rows.filter(f).map((r) => r.id).join(",") || "-", end = stamp();
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  code ??= rows.length > 0 && rows.every((r) => r.status === "tue") ? 0 : 1;
  say(`# end ${end} ; tues ${counts.tue ?? 0} / ${rows.length}, survivants ${ids((r) => r.status === "survit")}, non conclus ${ids((r) => r.status.startsWith("non conclu"))}, anchor-lost ${ids((r) => r.status === "anchor-lost")}, exit ${code}`);
  const rec = { schema: "monark.mutants.v1", repo: slash(repo), base, gel, dirty, tool_sha256: TOOL_SHA256, tool_tree: toolTree, tool_dirty: toolDirty,
    table, killers: o.killers, only: only ?? null, test_globs: globs, clone: slash(clone), timeout_ms: o.timeout, min_free_mb: o.minFree,
    lock_root: slash(resolve(o.lockRoot)), start, end, sha0, baseline: b, results: rows, counts, exit: code, wait_ms: o.wait, poll_ms: o.poll, baseline_typecheck: bt, stop, test_preload: preload };
  const file = join(out, "RESULTS.json"), body = `${JSON.stringify(rec, null, 2)}\n`;
  writeFileSync(`${file}.tmp`, body);
  renameSync(`${file}.tmp`, file);
  console.log(`mutants-result ${JSON.stringify({ exit: code, record: slash(file), sha256: sha(body) })}`);
  return code;
}

if (import.meta.main !== false) { // C-G2-1: as oracle/run.mjs l.40, a launch through a junction or a link runs main; an import runs nothing
  try { process.exitCode = await main(process.argv.slice(2)); } catch (e) { console.error(`mutants: refused: ${e instanceof Error ? e.message : String(e)}`); process.exitCode = 2; }
}
