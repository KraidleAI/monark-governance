// scripts/red-proof.mjs -- mechanical F2P proof of a lot's tests (ADR-METHODE-2 D2, lot M-4, decision 267 (b)). Node 24, zero dependencies.
// Usage: node scripts/red-proof.mjs --base <sha> --gel <worktree dir | sha> [--repo <dir>] [--out <dir>] [--draw <n> --seed <integer> | --test-only]
//
// The *.test.ts files that base..gel adds or modifies (a worktree gel counts its untracked files and applies its deletions; --gel may name
// any directory of it) and the diff's other files under a test/ directory are copied into a no-local clone of the base; each test file
// runs alone under node --test (TAP) there and in a clone of the gel, node_modules of --repo linked in, workspace links re-pointed to the
// clone's packages/* and apps/*; no child sees a variable whose name matches DENY (M-3's closed list). A test is JUDGED when a changed
// line falls in its body: its declaration line if that line ends with ");" (a // note may follow), else from it down to the first later line opening at column 0 with "}" or ")" before the next test
// (neither: refused, "unsupported test layout"); a changed killer line never counts; a pure deletion counts between two lines of one body. F2P = red at base by an assertion failure (TAP code
// ERR_ASSERTION), green at gel; new-module = the base run cannot load a file that the diff adds. Refused: green at base (self-confirming),
// an import red on a file that exists at base, any other red, not green at gel, no valid killer. A killed child (exit 134, signal, heap
// limit) or a timed-out run or test is inconclusive, never a pass nor a kill; so is a truncated TAP (inconclusive_truncated, RED-PROOF-TAP-TRUNCATION-1). Exit 0 iff a test at least is judged, each is F2P or
// new-module and each drawn killer is killed (ok holds without --draw: the JSON then reads "drawn": 0; G2 and cp-2 draw by mission);
// 1 otherwise; 2 on a usage or tool error. --test-only (RED-PROOF-TEST-ONLY-1; mode written in the JSON; no --draw): any change outside *.test.ts, test/ and docs/**/*.md (files.production) refuses with no test run; else a test green at base and gel is "pinned" iff its killer, fired at gel, kills it (the F2P substitute). "(test 42)" is skipped (host lock only). Outputs in --out: RED-PROOF.json (digest over the
// changes, docs/**/*.md out), base.tap and gel.tap (per-file TAP streams after "# red-proof file:" lines).
//
// Style hypothesis (C-G2-10): a body closes on its declaration line (ends with ");") or on the first later line closing at column 0 ("}" or ")"); else refused, "unsupported test layout" (RED-PROOF-LEX-FALLBACK-1).
// KILLER CONVENTION (closed): the line right above a top-level test( or it( declaration reads
//   // killer: <file>:<line> <OP> "<before>" -> "<after>"        OP in COR, ROR, SDL, CONST
// <file> is repo-relative production code (never *.test.ts nor under test/) whose real path lies in the gel clone (else out of scope);
// <before> occurs exactly once on that line and becomes <after>; SDL empties the line, with "" as <after>. --draw n --seed s draws n
// killers of the admitted tests (seeded, reproducible), applies each alone to the gel clone and reruns that test: killed = red with its
// modules loaded, stillborn = still green, invalid = a load failure, inconclusive = as above; the file is restored (sha256 checked
// before and after) and the run kept as killer-<n>.tap.
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const OPS = ["COR", "ROR", "SDL", "CONST"];
const KILLER = /^\s*\/\/ killer: (\S+):(\d+) (\w+) "((?:[^"\\]|\\.)*)" -> "((?:[^"\\]|\\.)*)"\s*$/;
export const DENY = /API_KEY|_KEY$|TOKEN|SECRET|^GH_|^GITHUB_|^CHAINSTACK_|^MONARK_PUBLIC_MIRROR$/i; // the lot's tests never see these names (Q-G2-5); exported for scripts/mutants/run.mjs (lot M-6, Q-V-3)
const ENV = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !DENY.test(k))), GIT_OPTIONAL_LOCKS: "0", NODE_TEST_CONTEXT: undefined }; // a nested node --test must print TAP, not report to a parent
// Loaded in the runner and, through its execArgv, in the child: a blocking stdout leaves process.exit() of --test-force-exit nothing to drop (POSIX pipes are non-blocking;
// Windows already blocks). The child takes the run's nonce out of its env (a grandchild never sees it) and, at exit, writes its exit line straight to fd 1 iff nothing is still queued: truncation() requires it.
const PRELOAD = `--import=data:text/javascript,${encodeURIComponent('import { writeSync } from "node:fs"; process.stdout._handle?.setBlocking?.(true); const n = process.env.RED_PROOF_EXIT; if (process.env.NODE_TEST_CONTEXT === "child-v8" && n) { delete process.env.RED_PROOF_EXIT; process.on("exit", (c) => { if (process.stdout.writableLength === 0) try { writeSync(1, `\\nred-proof child exit ${n} ${c}\\n`); } catch {} }); }')}`;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const str = (s) => { try { return JSON.parse(`"${s}"`); } catch { return s; } };
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

function git(cwd, args) {
  const r = spawnSync("git", ["-c", "core.longpaths=true", ...args], { cwd, env: ENV, encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr || String(r.error)}`);
  return r.stdout;
}

export function parseKiller(line) {
  const m = KILLER.exec(line ?? "");
  return m ? { file: m[1], line: Number(m[2]), op: m[3], before: str(m[4]), after: str(m[5]) } : null;
}

function killerProblem(k, tree) {
  if (!OPS.includes(k.op)) return `operator ${k.op} is not one of ${OPS.join(", ")}`;
  if (!/^[\w.@-]+(\/[\w.@-]+)*$/.test(k.file) || k.file.split("/").includes("..") || !existsSync(join(tree, k.file)) || !realpathSync(join(tree, k.file)).startsWith(realpathSync(tree) + sep)) return `${k.file} is out of scope: not a file inside the gel clone`;
  if (/(^|\/)test\/|\.test\.ts$/.test(k.file)) return `${k.file} is test code: a killer mutates production code`;
  const text = readFileSync(join(tree, k.file), "utf8").split("\n")[k.line - 1];
  if (text === undefined) return `${k.file}:${k.line} is out of range`;
  if (k.op === "SDL" ? k.after !== "" : k.before === k.after) return "SDL takes an empty <after>; the other operators change the text";
  return k.before !== "" && text.split(k.before).length === 2 ? null : `"${k.before}" does not occur exactly once on ${k.file}:${k.line}`;
}

function declarations(text) {
  const lines = text.split("\n"), decl = /^(?:test|it)\(\s*"((?:[^"\\]|\\.)*)"/;
  return lines.flatMap((l, i) => { const m = decl.exec(l); return m ? [{ name: str(m[1]), line: i + 1, killer: parseKiller(lines[i - 1]) }] : []; });
}

/** Top-level TAP entries of one node --test run; `lines` = the comments, subtests and diagnostic lines that belong to the entry. */
export function parseTap(tap) {
  const all = tap.split(/\r?\n/), out = [];
  let lines = [];
  for (let i = 0; i < all.length; i++) {
    const m = /^(ok|not ok) \d+ - (.*?)( # (?:SKIP|TODO)\b.*)?$/.exec(all[i]);
    if (!m) { lines.push(all[i]); continue; }
    if (all[i + 1] === "  ---") while (i + 1 < all.length && all[i] !== "  ...") lines.push(all[++i]);
    out.push({ ok: m[1] === "ok", name: m[2].replace(/\\(.)/g, (_, c) => ({ n: "\n", t: "\t", r: "\r" })[c] ?? c), skip: m[3] !== undefined, lines });
    lines = [];
  }
  return out;
}

function blocks(lines) {
  const out = [];
  let cur = null, pad = "";
  for (const l of lines) {
    if (cur === null) { const o = /^( *)---$/.exec(l); if (o) { cur = {}; pad = o[1]; } continue; }
    if (l === `${pad}...`) { out.push(cur); cur = null; continue; }
    const k = l.startsWith(pad) ? /^(\w+): (.*)$/.exec(l.slice(pad.length)) : null;
    if (k) cur[k[1]] = k[2];
  }
  return out;
}

/** Why one run's TAP is incomplete, or null: closed by its summary, a plan that counts its top-level entries, the child's exit line with the run's nonce (any lost suffix loses it). */
export function truncation(tap, nonce) {
  const plan = /^1\.\.(\d+)$/m.exec(tap), n = tap.split(/\r?\n/).filter((l) => /^(ok|not ok) \d+ - /.test(l)).length;
  if (!/^# duration_ms \S+$/.test(tap.trimEnd().split(/\r?\n/).at(-1) ?? "")) return "no closing summary (# duration_ms)";
  if (plan === null || Number(plan[1]) !== n) return `plan ${plan?.[0] ?? "missing"} for ${n} top-level entries`;
  if (!new RegExp(`^# red-proof child exit ${nonce} -?\\d+$`, "m").test(tap)) return "no child exit line: the child's stream was cut";
  return null;
}

const notes = (e) => e.lines.filter((l) => l.startsWith("#")).join("\n");
const fileLevel = (entries) => entries.find((e) => !e.ok && "exitCode" in (blocks(e.lines).at(-1) ?? {}));

export function classify(e) {
  if (e === undefined) return "missing";
  if (e.ok) return e.skip ? "skip" : "pass";
  const bs = blocks(e.lines), me = bs.at(-1) ?? {};
  if (/Reached heap limit|heap out of memory/.test(notes(e)) || me.exitCode === "134" || (me.signal ?? "~") !== "~" || bs.some((b) => b.failureType === "'testTimeoutFailure'")) return "inconclusive";
  if ("exitCode" in me) return /ERR_MODULE_NOT_FOUND|does not provide an export named/.test(notes(e)) ? "import-fail" : "other-fail";
  const fails = bs.filter((b) => "failureType" in b && b.failureType !== "'subtestsFailed'");
  return fails.length > 0 && fails.every((b) => b.code === "'ERR_ASSERTION'") ? "assert-fail" : "other-fail";
}

function missingModule(e, file, added) {
  const text = notes(e).replace(/\\\\/g, "\\");
  const ne = /The requested module '([^']+)' does not provide/.exec(text), nf = /Cannot find module '([^']+)'/.exec(text);
  if (ne) return posix.join(posix.dirname(file), ne[1]);
  const miss = nf ? nf[1].split("\\").join("/") : null;
  return miss === null ? null : ([...added].find((p) => miss.endsWith(`/${p}`)) ?? miss);
}

function changedLines(gitDir, range, file) {
  const set = new Set();
  for (const m of git(gitDir, ["diff", "-U0", "--no-color", "--no-ext-diff", ...range, "--", file]).matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    const c = Number(m[1]), d = m[2] === undefined ? 1 : Number(m[2]);
    if (d === 0) set.add(c + 0.5); else for (let l = c; l < c + d; l++) set.add(l); // a pure deletion sits between lines c and c + 1
  }
  return set;
}

function judgedOf(text, changed) { // a changed line judges a test only inside its body: from its declaration line to its end, that line if it ends with ");", else the first later line opening at column 0 with "}" or ")" before the next test (none: refused); a changed killer line never counts
  const lines = text.split("\n"), decls = declarations(text), unsupported = new Set();
  const hit = (l) => (changed === null || changed.has(l)) && !/^\s*\/\/ killer:/.test(lines[l - 1]);
  const judged = decls.filter((t, i) => { const bound = (decls[i + 1]?.line ?? lines.length + 1) - 1; let end; if (/\);\s*(\/\/.*)?$/.test(lines[t.line - 1])) end = t.line; else for (let l = t.line + 1; l <= bound; l++) if (/^[})]/.test(lines[l - 1])) { end = l; break; } if (end === undefined) { unsupported.add(t); return true; } for (let l = t.line; l <= end; l += 0.5) if (hit(l)) return true; return false; });
  return { judged, all: decls.length, unsupported };
}

function cloneAt(repo, rev, dir) {
  git(dirname(dir), ["clone", "-c", "core.autocrlf=false", "--no-local", "--no-checkout", "-q", repo, dir]); // the clone holds the blob bytes
  git(dir, ["checkout", "-q", "--detach", rev]);
}
const put = (from, to, rel) => { mkdirSync(dirname(join(to, rel)), { recursive: true }); copyFileSync(join(from, rel), join(to, rel)); };

function linkModules(repo, tree) {
  const src = join(repo, "node_modules"), nm = join(tree, "node_modules"), ws = new Map(), link = (a, b) => symlinkSync(a, b, "junction");
  if (!existsSync(src)) return;
  for (const d of ["packages", "apps"]) for (const e of isDir(join(tree, d)) ? readdirSync(join(tree, d)) : []) {
    const pj = join(tree, d, e, "package.json");
    if (existsSync(pj)) ws.set(JSON.parse(readFileSync(pj, "utf8")).name, join(tree, d, e));
  }
  const place = (ent, name, from, to) => { if (ent.isFile()) copyFileSync(from, to); else if (!ent.isSymbolicLink()) link(from, to); else if (ws.has(name)) link(ws.get(name), to); else if (isDir(from) && realpathSync(from).split(sep).includes("node_modules")) link(realpathSync(from), to); }; // a junction to a package (mk-nm.ps1): its real target, never a workspace the tree lacks
  mkdirSync(nm);
  for (const e of readdirSync(src, { withFileTypes: true })) {
    if (!e.name.startsWith("@") || !isDir(join(src, e.name))) { place(e, e.name, join(src, e.name), join(nm, e.name)); continue; }
    mkdirSync(join(nm, e.name));
    for (const f of readdirSync(join(src, e.name), { withFileTypes: true })) place(f, `${e.name}/${f.name}`, join(src, e.name, f.name), join(nm, e.name, f.name));
  }
}

function runFile(tree, file, tmp, only) {
  const pick = only === undefined ? [] : [`--test-name-pattern=^${only.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`], nonce = randomBytes(8).toString("hex");
  const r = spawnSync(process.execPath, [PRELOAD, "--test", "--test-reporter=tap", "--test-force-exit", "--test-timeout=120000", "--test-skip-pattern=\\(test 42\\)", ...pick, file],
    { cwd: tree, env: { ...ENV, TEMP: tmp, TMP: tmp, TMPDIR: tmp, RED_PROOF_EXIT: nonce }, encoding: "utf8", timeout: 1_800_000, maxBuffer: 1 << 28 });
  return { tap: r.stdout ?? "", nonce, dead: r.error !== undefined || r.signal !== null || r.status === 134 }; // 134: the runner itself aborted (Q-G2-3)
}

function statusIn(run, name) {
  if (run.dead) return { status: "inconclusive", entry: undefined, file: false };
  const es = parseTap(run.tap), fl = fileLevel(es), entry = fl ?? es.find((e) => e.name === name), status = classify(entry);
  return { status: status !== "inconclusive" && truncation(run.tap, run.nonce) !== null ? "inconclusive_truncated" : status, entry, file: fl !== undefined };
}

function verdictOf(t) {
  if (/\(test 42\)/.test(t.name)) return ["refused", "runs under the host lock only (test 42)"];
  if (t.base.startsWith("inconclusive") || t.gel.startsWith("inconclusive")) return ["inconclusive", [t.base, t.gel].includes("inconclusive_truncated") ? "a run's TAP is truncated (inconclusive_truncated)" : "a child process was killed or timed out"];
  if (t.killer === null) return ["refused", "no killer declared on the line above the test"];
  if (t.killerProblem !== null) return ["refused", `invalid killer: ${t.killerProblem}`];
  if (t.gel !== "pass") return ["refused", `not green at gel (${t.gel})`];
  if (t.only) return t.base === "pass" ? ["pinned", "green at base and gel on the same production code, its declared killer fired at gel"] : ["refused", `red at base under --test-only (${t.base}): the production code is the same`];
  if (t.base === "assert-fail") return ["F2P", "red at base by an assertion failure, green at gel"];
  if (t.base === "import-fail" && t.newModule) return ["new-module", `the base cannot load ${t.module}, which the diff adds`];
  if (t.base === "import-fail") return ["refused", `import red on ${t.module}, which exists at base`];
  if (t.base === "pass") return ["refused", "green at base: a self-confirming test"];
  return ["refused", `red at base without an assertion failure (${t.base})`];
}

/** Seeded partial Fisher-Yates (mulberry32): the same seed and population give the same draw. */
export function drawKillers(population, n, seed) {
  let s = seed >>> 0;
  const next = () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const a = [...population], k = Math.min(n, a.length);
  for (let i = 0; i < k; i++) { const j = i + Math.floor(next() * (a.length - i)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, k);
}

function fire(tree, tmp, out, row, i) {
  const k = row.killer, p = join(tree, k.file), orig = readFileSync(p), before = sha(orig), lines = orig.toString("utf8").split("\n");
  lines[k.line - 1] = k.op === "SDL" ? "" : lines[k.line - 1].replace(k.before, () => k.after);
  writeFileSync(p, lines.join("\n"));
  let run;
  try { run = runFile(tree, row.file, tmp, row.name); } finally { writeFileSync(p, orig); }
  const after = sha(readFileSync(p)), st = statusIn(run, row.name), tap = `killer-${i + 1}.tap`;
  if (after !== before) throw new Error(`${k.file} was not restored to sha256 ${before}`);
  writeFileSync(join(out, tap), run.tap);
  const outcome = st.status === "pass" ? "stillborn" : ["inconclusive", "inconclusive_truncated", "missing", "skip"].includes(st.status) ? "inconclusive" : st.file ? "invalid" : "killed";
  return { name: row.name, file: row.file, killer: k, status: st.status, outcome, sha256_before: before, sha256_after: after, tap: { path: tap, sha256: sha(run.tap) } };
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (argv[i] === "--test-only") { a["test-only"] = true; i--; continue; } // the one flag without a value
    if (!["--base", "--gel", "--repo", "--out", "--draw", "--seed"].includes(argv[i]) || argv[i + 1] === undefined) throw new Error(`unknown or incomplete option ${argv[i]}`);
    a[argv[i].slice(2)] = argv[i + 1];
  }
  const draw = Number(a.draw ?? 0), seed = Number(a.seed ?? 0);
  if (a["test-only"] && draw > 0) throw new Error("--test-only fires every killer at gel: --draw does not apply");
  if (!a.base || !a.gel || !Number.isInteger(draw) || draw < 0 || (draw > 0 && !/^\d+$/.test(a.seed ?? "")) || seed > 0xffffffff) throw new Error("usage: --base <sha> --gel <dir|sha> [--repo <dir>] [--out <dir>] [--draw <n> --seed <integer> | --test-only]");
  return { ...a, draw, seed };
}

export function main(argv) {
  const a = parseArgs(argv), wt = isDir(a.gel), top = wt ? git(resolve(a.gel), ["rev-parse", "--show-toplevel"]).trim() : null, repo = resolve(a.repo ?? top ?? "."), gitDir = top ?? repo;
  const base = git(repo, ["rev-parse", "--verify", `${a.base}^{commit}`]).trim();
  const gelSha = wt ? null : git(repo, ["rev-parse", "--verify", `${a.gel}^{commit}`]).trim();
  const range = wt ? [base] : [base, gelSha], changes = new Map(), skipped = [];
  const ns = git(gitDir, ["diff", "--name-status", "--no-renames", "-z", ...range]).split("\0");
  for (let i = 0; i + 1 < ns.length; i += 2) changes.set(ns[i + 1], ns[i] === "D" || ns[i] === "A" ? ns[i] : "M");
  if (wt) for (const p of git(gitDir, ["ls-files", "--others", "--exclude-standard", "-z"]).split("\0")) if (p !== "" && lstatSync(join(gitDir, p)).isSymbolicLink() && isDir(join(gitDir, p))) skipped.push(p); else if (p !== "") changes.set(p, "A"); // a link to a directory (a junctioned node_modules) is no change, recorded; a nested repo still stops
  const added = new Set([...changes.keys()].filter((p) => changes.get(p) === "A"));
  const live = [...changes.keys()].filter((p) => changes.get(p) !== "D").sort();
  const tests = live.filter((p) => p.endsWith(".test.ts")), support = live.filter((p) => !p.endsWith(".test.ts") && /(^|\/)test\//.test(p));
  const only = a["test-only"] === true, production = [...changes.keys()].filter((p) => !p.endsWith(".test.ts") && !/(^|\/)test\//.test(p) && !/^docs\/(.+\/)?[^/]+\.md$/.test(p)).sort();
  const out = resolve(a.out ?? join(tmpdir(), "red-proof-out")), work = mkdtempSync(join(tmpdir(), "red-proof-")), tmp = join(work, "tmp");
  mkdirSync(out, { recursive: true }); mkdirSync(tmp);
  try {
    const gelTree = join(work, "gel"), baseTree = join(work, "base");
    cloneAt(repo, gelSha ?? base, gelTree);
    if (wt) for (const [p, s] of changes) { if (s === "D") rmSync(join(gelTree, p), { force: true }); else put(gitDir, gelTree, p); }
    cloneAt(repo, base, baseTree);
    for (const p of [...tests, ...support]) put(gelTree, baseTree, p);
    linkModules(repo, gelTree); linkModules(repo, baseTree);
    const digest = sha([...changes.keys()].filter((p) => !/^docs\/(.+\/)?[^/]+\.md$/.test(p)).sort().map((p) => `${changes.get(p)} ${p} ${changes.get(p) === "D" ? "-" : sha(readFileSync(join(gelTree, p)))}`).join("\n"));
    const rows = [];
    let baseTap = "", gelTap = "", unchanged = 0;
    for (const f of only && production.length > 0 ? [] : tests) { // --test-only: a production change refuses before any run
      const b = runFile(baseTree, f, tmp), g = runFile(gelTree, f, tmp);
      baseTap += `# red-proof file: ${f}\n${b.tap}`; gelTap += `# red-proof file: ${f}\n${g.tap}`;
      const { judged, all, unsupported } = judgedOf(readFileSync(join(gelTree, f), "utf8"), added.has(f) ? null : changedLines(gitDir, range, f));
      unchanged += all - judged.length;
      for (const t of judged) {
        const bs = statusIn(b, t.name), gs = statusIn(g, t.name), module = bs.status === "import-fail" ? missingModule(bs.entry, f, added) : null;
        const row = { name: t.name, file: f, line: t.line, base: bs.status, gel: gs.status, module, killer: t.killer, killerProblem: t.killer === null ? null : killerProblem(t.killer, gelTree) };
        const [verdict, reason] = unsupported.has(t) ? ["refused", "unsupported test layout"] : verdictOf({ ...row, newModule: module !== null && added.has(module), only });
        rows.push({ ...row, verdict, reason, kill: null });
      }
    }
    for (const r of rows.filter((x) => x.verdict === "pinned")) { // the F2P substitute: its declared killer, fired alone at gel, must kill it
      r.kill = fire(gelTree, tmp, out, r, rows.filter((x) => x.kill !== null).length);
      if (r.kill.outcome !== "killed") [r.verdict, r.reason] = r.kill.outcome === "inconclusive" ? ["inconclusive", "the run of its declared killer was killed, timed out or truncated"] : ["refused", `its declared killer is ${r.kill.outcome} at gel: the test pins nothing it names`];
    }
    const admitted = rows.filter((r) => r.verdict === "F2P" || r.verdict === "new-module" || r.verdict === "pinned");
    const drawn = a.draw > 0 ? drawKillers(admitted, a.draw, a.seed).map((r, i) => fire(gelTree, tmp, out, r, i)) : [];
    writeFileSync(join(out, "base.tap"), baseTap); writeFileSync(join(out, "gel.tap"), gelTap);
    const ok = rows.length > 0 && admitted.length === rows.length && drawn.every((d) => d.outcome === "killed") && !(only && production.length > 0);
    const head = wt ? git(gitDir, ["rev-parse", "HEAD"]).trim() : gelSha;
    const proof = {
      schema: "red-proof-v1", mode: only ? "test-only" : "f2p", at: new Date().toISOString(), node: process.version, repo, base, gel: { ref: a.gel, mode: wt ? "worktree" : "commit", head, digest },
      files: { tests, support, added: [...added].sort(), skipped, production }, tests: rows, unchanged,
      draw: a.draw > 0 ? { seed: a.seed, requested: a.draw, population: admitted.length, drawn } : null,
      tap: { base: { path: "base.tap", sha256: sha(baseTap) }, gel: { path: "gel.tap", sha256: sha(gelTap) } }, drawn: drawn.length, ok,
    };
    writeFileSync(join(out, "RED-PROOF.json"), `${JSON.stringify(proof, null, 2)}\n`);
    for (const r of rows) console.log(`${r.verdict.padEnd(12)} ${r.file} :: ${r.name}${admitted.includes(r) ? "" : ` -- ${r.reason}`}`);
    if (only && production.length > 0) console.log(`--test-only refused: production files changed: ${production.join(", ")}`);
    for (const d of [...rows.flatMap((r) => r.kill ?? []), ...drawn]) console.log(`killer ${d.outcome.padEnd(12)} ${d.killer.file}:${d.killer.line} ${d.killer.op} (${d.name})`);
    console.log(`red-proof ${ok ? "OK" : "REFUSED"}: ${rows.length} judged, ${unchanged} unchanged, ${drawn.length} killer(s) drawn -> ${join(out, "RED-PROOF.json")}`);
    return ok ? 0 : 1;
  } finally {
    rmSync(work, { recursive: true, force: true, maxRetries: 5 });
  }
}

if (import.meta.main !== false) { // as oracle/run.mjs l.40: a launch through a junction or a link runs main; an import runs nothing
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`red-proof: ${e instanceof Error ? e.message : String(e)}`); process.exitCode = 2; }
}
