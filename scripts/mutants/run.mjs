// scripts/mutants/run.mjs -- one mutant campaign on a clone (ADR-METHODE-2 D6, lot M-6): the ad hoc harnesses that each G1, corrector
// and reviewer wrote since 2026-09-28 (m2b corr2, m5 corr3, m5b G1, m8b), made unique. Node 24, zero dependencies.
// Usage: node scripts/mutants/run.mjs --repo <worktree> --base <sha> --out <dir> [--table <mutants.mjs|.json>] [--killers]
//   [--file <path>] [--only <id,...>] [--targets <test.ts,...>] [--timeout-ms <n>] [--min-free-mb <n>] [--lock-root <dir>]
// MUTANTS: --table, a module exporting MUTANTS or a JSON array, rows { id, line, op, before, after, why[, file][, test] }, op in COR,
// ROR, SDL, CONST (SDL empties the line); a row without file mutates --file, else the one non-test code file that base..tree
// changes, else refused ("ambiguous file"). --killers: the "// killer:" lines (parseKiller of scripts/red-proof.mjs) of the test
// files that base..tree changes, as K1, K2... (files sorted, then line), each first run as the test declared right below it, alone.
// TARGETS: the test files of the quoted package.json "test" globs whose import closure holds the mutated file (targetsOf): import/
// export ... from "x", import "x", import("x") of a string literal (a computed import( is skipped, never a target: item
// MUTANTS-DYNAMIC-IMPORT-1); relative and file: specifiers; .ts .tsx .mts .cts .mjs .cjs .js. First run on the direct importers
// (a killer: its own test file), a survivor rerun on every target file whole; no importer: --targets, else refused.
// REFUSED (exit 2) before any clone: usage, --repo without .git, --out inside --repo, a host oracle lock that held() of
// oracle/lock.mjs reads held (no race with an oracle), <out>/clone present (one launch per clone), a malformed row, no target.
// THEN: one --no-local clone of --repo at its HEAD, its changed and untracked files copied (sha256 checked), deleted ones removed;
// a baseline run of every target file (not green: no mutant runs, "non conclu (base)"); one mutant at a time: <before> exactly once
// on its line, else anchor-lost (counted, never applied elsewhere); free memory under --min-free-mb (default and floor 4096: C-V-4, C-V-9):
// "non conclu (memoire)", nothing runs; node --test (TAP), the file restored in a finally and its sha256 checked (a mismatch, or a
// file changed since the start, stops the campaign: exit 3). VERDICT: tue iff a top-level entry fails by assertion (classify of
// red-proof.mjs: ERR_ASSERTION), survit iff every entry is ok, non conclu otherwise (dead or timed-out child, signal, exit 134, no
// entry, failures without assertion); never "equivalent". Children: childEnv of oracle/run.mjs over the DENY list of red-proof.mjs.
// RECORD monark.mutants.v1 <out>/RESULTS.json (tool_sha256: the bytes that run; tool_tree: HEAD of the tool's repository), one line
// per mutant in <out>/RESULTS.txt, TAP in <out>/tap/; last stdout line: mutants-result {"exit","record","sha256"}. Exit 0 iff every
// mutant is killed, 1 otherwise (a survivor, non conclu or anchor-lost), 2 refused, 3 restore.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, existsSync, globSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { freemem, tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { classify, DENY, parseKiller, parseTap } from "../red-proof.mjs";
import { held } from "../oracle/lock.mjs";
import { childEnv } from "../oracle/run.mjs";

const OPS = ["COR", "ROR", "SDL", "CONST"], EXTS = [".ts", ".tsx", ".mts", ".cts", ".mjs", ".cjs", ".js"], TEST_CODE = /(^|\/)test\/|\.test\.ts$/;
const envOf = (tmp) => ({ ...childEnv(tmp, DENY), GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0", NODE_TEST_CONTEXT: undefined }); // Q-V-3: imported, never recopied
const IMPORT = /(?:^|[^\w$.])(?:(?:import|export)\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"'\s]+)["']|import\s*\(\s*["']([^"'\s]+)["']\s*[,)])/g;
const VALUED = ["--repo", "--base", "--out", "--table", "--file", "--only", "--targets", "--timeout-ms", "--min-free-mb", "--lock-root"];
const USAGE = "usage: --repo <worktree> --base <sha> --out <dir> (--table <mutants.mjs|.json> | --killers | both) [--file <path>] [--only <id,...>] [--targets <test.ts,...>] [--timeout-ms <n>] [--min-free-mb <n, at least 4096>] [--lock-root <dir>]";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const TOOL_SHA256 = sha(readFileSync(fileURLToPath(import.meta.url))); // the bytes that run, never a blob of HEAD
const stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const slash = (p) => p.split(sep).join("/");
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const str = (s) => { try { return JSON.parse(`"${s}"`); } catch { return s; } };

function git(cwd, ...args) {
  const r = spawnSync("git", ["-c", "core.longpaths=true", ...args], { cwd, env: envOf(tmpdir()), maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${String(r.stderr ?? r.error).trim()}`);
  return r.stdout;
}
const names = (cwd, ...args) => git(cwd, ...args).toString("utf8").split("\0").filter((f) => f !== "" && !f.endsWith("/"));

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
  Object.assign(o, { timeout: num("timeout-ms", 120000), minFree: num("min-free-mb", 4096), lockRoot: o["lock-root"] ?? "F:/tmp" });
  if (!o.repo || !o.base || !o.out || (!o.table && !o.killers) || !(o.timeout > 0) || !(o.minFree >= 4096)) throw new Error(USAGE);
  return o;
}

function mutate(text, m) { // the text with the mutant applied on its line, or null when <before> is not exactly once there
  const lines = text.split("\n"), l = lines[m.line - 1];
  if (l === undefined || l.split(m.before).length !== 2) return null;
  lines[m.line - 1] = m.op === "SDL" ? "" : l.replace(m.before, () => m.after);
  return lines.join("\n");
}

function lostOf(m, root) { // why the mutant cannot apply to the tree at root, or null
  if (!OPS.includes(m.op) || m.before === "") return `operator ${m.op} or an empty <before>`;
  if (!/^[\w.@-]+(\/[\w.@-]+)*$/.test(m.file ?? "") || m.file.split("/").includes("..") || !isFile(join(root, m.file))) return `${String(m.file)} is not a file of the tree`;
  if (TEST_CODE.test(m.file)) return `${m.file} is test code: a mutant mutates production code`;
  return mutate(readFileSync(join(root, m.file), "utf8"), m) === null ? `"${m.before}" is not exactly once on ${m.file}:${m.line}` : null;
}

const malformed = (m) => !(m !== null && typeof m === "object" && typeof m.id === "string" && /^[\w.-]+$/.test(m.id) && Number.isInteger(m.line) && m.line > 0 &&
  OPS.includes(m.op) && typeof m.before === "string" && m.before !== "" && typeof m.after === "string" && ["undefined", "string"].includes(typeof m.file) && ["undefined", "string"].includes(typeof m.test));

const lineOf = (r) => `${r.id} l.${r.line} ${r.op} ${r.status} (${r.fails.length} rouge(s), ${r.oks} vert(s), ${r.ms} ms) restaure ${r.sha_before === r.sha_after ? "OK" : "ECHEC"} ; ${r.why}` +
  (r.fails.length > 0 ? ` ; rouges : ${r.fails.map((f) => f.slice(0, 60)).join(" | ")}` : "") + (r.note ? ` ; ${r.note}` : "") +
  (r.replay ? ` ; rejeu ${r.replay.files.join(",")} : ${r.replay.status} (${r.replay.fails.length} rouge(s), ${r.replay.oks} vert(s))` : "");

export async function main(argv) {
  const o = parseArgs(argv), repo = resolve(o.repo), out = resolve(o.out), clone = join(out, "clone"), tmp = join(out, "tmp"), taps = join(out, "tap");
  if (!existsSync(join(repo, ".git"))) throw new Error(`${slash(repo)} is not a git checkout (no .git)`);
  if (!relative(repo, out).startsWith("..") && !isAbsolute(relative(repo, out))) throw new Error(`--out ${slash(out)} lies inside --repo: a campaign never writes in the tree`);
  const lock = held(o.lockRoot);
  if (lock !== null) throw new Error(`${lock}: no campaign races an oracle`);
  if (existsSync(clone)) throw new Error(`${slash(clone)} exists: one launch per clone (read its RESULTS.txt, take a new --out)`);
  const base = git(repo, "rev-parse", "--verify", `${o.base}^{commit}`).toString().trim(), gel = git(repo, "rev-parse", "HEAD").toString().trim();
  const toolTree = git(join(import.meta.dirname, "..", ".."), "rev-parse", "HEAD").toString().trim(); // Q-V-4: the commit of the tool and of its imports
  const changed = [...new Set([...names(repo, "diff", "--name-only", "--no-renames", "-z", base), ...names(repo, "ls-files", "--others", "--exclude-standard", "-z")])].sort();
  let table = null, mutants = [];
  if (o.table) {
    const buf = readFileSync(o.table), rows = o.table.endsWith(".json") ? JSON.parse(buf.toString("utf8")) : (await import(pathToFileURL(resolve(o.table)).href)).MUTANTS;
    if (!Array.isArray(rows) || rows.some(malformed)) throw new Error(`${o.table}: MUTANTS is not an array of { id, line, op, before, after, why[, file][, test] } rows`);
    const code = changed.filter((p) => EXTS.some((e) => p.endsWith(e)) && !/\.d\.[cm]?ts$/.test(p) && !TEST_CODE.test(p) && isFile(join(repo, p)));
    table = { path: slash(resolve(o.table)), sha256: sha(buf) };
    for (const r of rows) {
      if (r.file === undefined && o.file === undefined && code.length !== 1) throw new Error(`ambiguous file: row ${r.id} names no file, no --file, and base..tree changes ${code.length} code files`);
      mutants.push({ ...r, file: r.file ?? o.file ?? code[0], origin: "table" });
    }
  }
  if (o.killers) for (const t of changed.filter((p) => p.endsWith(".test.ts") && isFile(join(repo, p)))) {
    const lines = readFileSync(join(repo, t), "utf8").split("\n");
    lines.forEach((l, i) => {
      const k = parseKiller(l), d = /^(?:test|it)\(\s*"((?:[^"\\]|\\.)*)"/.exec(lines[i + 1] ?? "");
      if (k !== null) mutants.push({ ...k, id: `K${mutants.filter((x) => x.origin === "killer").length + 1}`, why: `killer of ${d ? str(d[1]) : `${t}:${i + 1}`}`, test: d ? str(d[1]) : undefined, own: t, origin: "killer" });
    });
  }
  const only = o.only?.split(","), unknown = (only ?? []).filter((id) => !mutants.some((m) => m.id === id));
  if (unknown.length > 0 || new Set(mutants.map((m) => m.id)).size !== mutants.length) throw new Error(`unknown --only id(s) ${unknown.join(",")} or mutant ids not unique`);
  if (only) mutants = mutants.filter((m) => only.includes(m.id));
  const globs = [...String(JSON.parse(readFileSync(join(repo, "package.json"), "utf8")).scripts?.test ?? "").matchAll(/"([^"]+\.test\.ts)"/g)].map((x) => x[1]);
  if (globs.length === 0) throw new Error("the package.json test script quotes no *.test.ts glob");
  const fallback = o.targets?.split(",") ?? [];
  if (fallback.some((t) => !isFile(join(repo, t)))) throw new Error(`--targets ${o.targets}: not files of the tree`);
  for (const m of mutants) {
    m.lost = lostOf(m, repo);
    const g = m.lost === null ? targetsOf(repo, m.file, globs) : { direct: [], transitive: [] }, found = [...g.direct, ...g.transitive];
    m.targets = [...new Set([...(m.own ? [m.own] : []), ...(found.length > 0 ? found : fallback)])];
    m.first = m.own ? [m.own] : g.direct.length > 0 ? g.direct : m.targets;
    if (m.lost === null && m.targets.length === 0) throw new Error(`no target: ${m.id} (${m.file}) is imported by no test file of ${globs.join(" ")}; name one with --targets`);
  }

  mkdirSync(out, { recursive: true });
  git(out, "clone", "-q", "--no-local", "--no-checkout", "-c", "core.autocrlf=false", repo, clone);
  git(clone, "checkout", "-q", "--detach", gel);
  const patch = git(repo, "diff", "--binary", "--full-index", "HEAD"), untracked = names(repo, "ls-files", "--others", "--exclude-standard", "-z").sort();
  const dh = createHash("sha256").update(patch);
  for (const f of untracked) dh.update(`\0${f}\0${sha(readFileSync(join(repo, f)))}`);
  const dirty = patch.length > 0 || untracked.length > 0 ? dh.digest("hex") : null; // the recipe of oracle/run.mjs
  for (const p of new Set([...names(repo, "diff", "--name-only", "--no-renames", "-z", "HEAD"), ...untracked])) {
    if (!isFile(join(repo, p))) { rmSync(join(clone, p), { force: true }); continue; }
    mkdirSync(dirname(join(clone, p)), { recursive: true });
    copyFileSync(join(repo, p), join(clone, p));
    if (sha(readFileSync(join(clone, p))) !== sha(readFileSync(join(repo, p)))) throw new Error(`${p}: the copy differs from the tree`);
  }
  mkdirSync(tmp);
  mkdirSync(taps);

  const txt = join(out, "RESULTS.txt"), start = stamp(), memShort = () => Math.floor(freemem() / 2 ** 20) < o.minFree;
  const say = (s) => { appendFileSync(txt, `${s}\n`); console.log(s); };
  const runSet = (files, pattern, name) => {
    const args = ["--test", "--test-reporter=tap", `--test-timeout=${o.timeout}`, "--test-force-exit", "--test-skip-pattern=\\(test 42\\)"];
    if (pattern !== undefined) args.push(`--test-name-pattern=^${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
    const t0 = Date.now(), r = spawnSync(process.execPath, [...args, ...files], { cwd: clone, env: envOf(tmp), encoding: "utf8", timeout: o.timeout * 10, maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
    const tap = r.stdout ?? "", es = parseTap(tap).filter((e) => !e.skip), bad = es.filter((e) => !e.ok), codes = [...tap.matchAll(/^\s*code: '?([A-Z_]+)'?\s*$/gm)].map((x) => x[1]);
    writeFileSync(join(taps, `${name}.tap`), tap);
    const dead = r.error !== undefined || r.signal !== null || r.status === 134;
    return { files, status: dead || es.length === 0 ? "non conclu" : bad.length === 0 ? "survit" : bad.some((e) => classify(e) === "assert-fail") ? "tue" : "non conclu",
      strict: codes.length === 1 && codes[0] === "ERR_ASSERTION", fails: bad.map((e) => e.name), oks: es.length - bad.length, exit: r.status, signal: r.signal, ms: Date.now() - t0, tap_sha256: sha(tap) };
  };
  const runnable = mutants.filter((m) => m.lost === null), all = [...new Set(runnable.flatMap((m) => m.targets))];
  const sha0 = Object.fromEntries([...new Set(runnable.map((m) => m.file))].sort().map((f) => [f, sha(readFileSync(join(clone, f)))]));
  writeFileSync(txt, `# mutants monark.mutants.v1, repo ${slash(repo)} gel ${gel} dirty ${dirty ?? "none"}, base ${base}, clone ${slash(clone)}, tool sha256 ${TOOL_SHA256} tree ${toolTree}, start ${start}\n`);
  for (const [f, s] of Object.entries(sha0)) say(`# sha0 ${f} ${s}`);
  const b = all.length === 0 ? null : memShort() ? { files: all, status: "non conclu (memoire)", strict: false, fails: [], oks: 0, exit: null, signal: null, ms: 0, tap_sha256: null } : runSet(all, undefined, "BASELINE");
  if (b !== null) {
    b.status = { survit: "vert", tue: "rouge" }[b.status] ?? b.status;
    say(`BASELINE l.0 - ${b.status} (${b.fails.length} rouge(s), ${b.oks} vert(s), ${b.ms} ms) restaure OK ; unmutated`);
  }
  const rows = [];
  let code = null;
  for (const m of mutants) {
    const row = { id: m.id, origin: m.origin, file: m.file ?? null, line: m.line, op: m.op, why: m.why ?? "", test: m.test ?? null, targets: m.targets, status: "anchor-lost",
      strict: false, fails: [], oks: 0, exit: null, ms: 0, tap_sha256: null, sha_before: null, sha_after: null, replay: null, note: m.lost };
    rows.push(row);
    if (m.lost === null) {
      const p = join(clone, m.file), orig = readFileSync(p), text = mutate(orig.toString("utf8"), m);
      row.sha_before = row.sha_after = sha(orig);
      if (row.sha_before !== sha0[m.file]) [row.status, row.note, code] = ["non conclu", "the file is not in its initial state", 3];
      else if (text === null) row.note = "anchor lost on the clone";
      else if (memShort()) row.status = "non conclu (memoire)";
      else if (b.status !== "vert") row.status = "non conclu (base)";
      else {
        let first, replay = null;
        try { writeFileSync(p, text); first = runSet(m.first, m.test, m.id); if (first.status === "survit") replay = runSet(m.targets, undefined, `${m.id}.replay`); }
        finally { writeFileSync(p, orig); }
        row.sha_after = sha(readFileSync(p));
        Object.assign(row, { status: first.status, strict: first.strict, fails: first.fails, oks: first.oks, exit: first.exit, ms: first.ms, tap_sha256: first.tap_sha256, replay });
        if (row.sha_after !== row.sha_before) [row.note, code] = ["the file was not restored", 3];
      }
    }
    say(lineOf(row));
    if (code === 3) break;
  }
  const counts = {}, ids = (f) => rows.filter(f).map((r) => r.id).join(",") || "-", end = stamp();
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  code ??= rows.length > 0 && rows.every((r) => r.status === "tue") ? 0 : 1;
  say(`# end ${end} ; tues ${counts.tue ?? 0} / ${rows.length}, survivants ${ids((r) => r.status === "survit")}, non conclus ${ids((r) => r.status.startsWith("non conclu"))}, anchor-lost ${ids((r) => r.status === "anchor-lost")}, exit ${code}`);
  const rec = { schema: "monark.mutants.v1", repo: slash(repo), base, gel, dirty, tool_sha256: TOOL_SHA256, tool_tree: toolTree, table, killers: o.killers, only: only ?? null, test_globs: globs, clone: slash(clone),
    timeout_ms: o.timeout, min_free_mb: o.minFree, lock_root: slash(resolve(o.lockRoot)), start, end, sha0, baseline: b, results: rows, counts, exit: code };
  const file = join(out, "RESULTS.json"), body = `${JSON.stringify(rec, null, 2)}\n`;
  writeFileSync(`${file}.tmp`, body);
  renameSync(`${file}.tmp`, file);
  console.log(`mutants-result ${JSON.stringify({ exit: code, record: slash(file), sha256: sha(body) })}`);
  return code;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = await main(process.argv.slice(2)); } catch (e) { console.error(`mutants: refused: ${e instanceof Error ? e.message : String(e)}`); process.exitCode = 2; }
}
