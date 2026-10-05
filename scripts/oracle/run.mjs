// scripts/oracle/run.mjs: the single local oracle (ADR-METHODE-2 D3, D4; lot M-3).
//   node scripts/oracle/run.mjs --role <G1|G2|cp-2|G7|corr> --tree <path> --base <sha> [--key <label>] [--static-only] [--r25-proof <file>]
// Gates are DERIVED at launch from the `run:` lines of <tree>/.github/workflows/ci.yml (block scalars whole, one-liners
// split on &&, a repeated command runs once: test 42 runs once, inside `npm test`), minus the CLOSED CI_ONLY list (each
// with its reason; `uses:` steps, actions/*, are never read). The tree is cloned --no-local into a fresh run dir, its
// uncommitted state (tracked diff + untracked files) committed there (freeze commit); node_modules is junctioned from the
// main checkout as mk-nm.ps1 does. Each gate runs as `bash -e -c` (GitHub's default shell for run: with no shell: key, docs/methode/FAITS-gha-shell-2026-09-28.md); STATIC gates run
// outside the host lock, the others under the FIFO lock (lock.mjs) after the C-V-4 check. Output:
// <root>/oracle-results/<head>[-<dirty16>]-<role>-<stamp>-<pid>.json + one log per gate.
// Store (D4; C-1, C-7): G1 and corr with --key are served a full (not static-only), clean, green, never-served same-key
// record if the tree is clean, cited by file and sha256, never copied; a red one is replayed with a mention (decision
// 267 (c)); G2, cp-2 and G7 always replay; a same-key record missing a field, its pid or its tree object is a refusal.
// Exit: 0 green or served | 1 a gate red | 2 refusal (usage, tree, incomplete record, record not written) | 3 C-V-4 |
// 75 lock timeout | 130/143 SIGINT/SIGTERM. Env: ORACLE_ROOT=F:/tmp, ORACLE_MIN_FREE_MB=4096, ORACLE_MAX_NODE=40 (C-V-4,
// decision Q-M3-8), ORACLE_LOCK_POLL_MS=5000, ORACLE_LOCK_MAX_MS=5400000 (90 min, the bound of the older protocol). Precedence (Q-G2-5): 3 and 75 are mutually exclusive per run (C-V-4 is read only after the lock is granted) and either overrides a red static gate (`code = refusal ?? …`).
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { freemem } from "node:os";
import { dirname, join, resolve } from "node:path";
import { acquire } from "./lock.mjs";
import { r25, R25_DIFF_RE } from "./r25.mjs";

const ROLES = ["G1", "G2", "cp-2", "G7", "corr"], SERVED_ROLES = ["G1", "corr"];
const CI_ONLY = [
  [/^npm ci\b/, "install: the run dir junctions node_modules from the main checkout (mk-nm.ps1), no network"],
  [/^npm audit\b/, "network: registry advisory lookup"],
  [/^npm sbom\b/, "per-run CI artefact (serialNumber, timestamp); scripts/sbom.mjs mirrors it"],
  [/^npm run build -w @monark\/site\b/, "build site: next build writes .next/ (job g3-site)"],
  [/^node scripts\/assert-fleet-html\.mjs\b/, "build site: O-2 reads the next build output (job g3-site)"],
];
const STATIC = /^(npm run (gate:vocab|typecheck|lint|lint:ratchet|lang:gate|export:check)|bash enforcement\/lint-model-pinning\.sh \.|r25)$/;
const REQUIRED = ["schema", "role", "tree", "base", "key", "pid", "start", "end", "static_only", "gates", "tests", "r25", "residues", "ci_only", "cv4", "exit", "served_from"];
const ENV_KEY = ["NODE_OPTIONS", "NODE_ENV", "TZ", "LANG", "LC_ALL", "CI"]; // the declared env of the D4 key
// DENY (closed list, rule Q-M1-10): every variable whose NAME matches is deleted from process.env before any child process
// (gates of both lanes, git, r25): the eight paid variables of run-oracle.sh l.9 (HELIUS_API_KEY, POLYGON_API_KEY,
// DATABENTO_API_KEY, CHAINSTACK_{ETH,SOLANA,BASE,BSC,ROBINHOOD}_URL), any *API_KEY*, *_KEY, *TOKEN*, *SECRET*, GH_*,
// GITHUB_*, and MONARK_PUBLIC_MIRROR. The gates also get npm_config_offline=true (npm never reaches the registry).
const DENY = /API_KEY|_KEY$|TOKEN|SECRET|^GH_|^GITHUB_|^CHAINSTACK_|^MONARK_PUBLIC_MIRROR$/i;
if (import.meta.main !== false) { // main guard (lot M-6, Q-V-3): an import (childEnv below) runs nothing; fail-closed: runs where Node lacks import.meta.main
const argv = process.argv.slice(2), opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : undefined);
const [role, treeArg, baseArg, label, proofArg] = ["--role", "--tree", "--base", "--key", "--r25-proof"].map(opt), staticOnly = argv.includes("--static-only"), proofFile = proofArg === undefined ? null : resolve(proofArg);
const refuse = (msg) => { console.error(`oracle: refused: ${msg}`); process.exit(2); };
if (!ROLES.includes(role)) refuse(`--role ${ROLES.join("|")} is required (C-1); got ${role ?? "none"}`);
if (!treeArg || !baseArg) refuse("--tree <path> and --base <sha> are required"); else if (proofFile !== null && !existsSync(proofFile)) refuse(`--r25-proof ${proofFile} is not a file (ADR-M003 D9 nonies: written by \`node scripts/lot-size-integration.mjs proof\` outside the oracle)`);
for (const k of Object.keys(process.env)) if (DENY.test(k) || /^npm_config_(offline|logs_dir)$/i.test(k)) delete process.env[k]; // before any child process (DENY above); genv's npm overrides win under any case
const sha256 = (b) => createHash("sha256").update(b).digest("hex"), stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
const gitS = (cwd, ...a) => git(cwd, ...a).toString().trim();
const tree = resolve(treeArg), start = stamp(), root = process.env.ORACLE_ROOT ?? "F:/tmp", results = join(root, "oracle-results");
let head, base, patch, untracked;
try {
  [head, base] = [gitS(tree, "rev-parse", "HEAD"), gitS(tree, "rev-parse", "--verify", `${baseArg}^{commit}`)];
  patch = git(tree, "diff", "--binary", "--full-index", "HEAD");
  untracked = git(tree, "ls-files", "-z", "--others", "--exclude-standard").toString().split("\0").filter((f) => f !== "" && !f.endsWith("/")).sort();
} catch (e) { refuse(`tree or base not readable by git (${tree}, ${baseArg}): ${String(e.message).split("\n")[0]}`); }
const dh = createHash("sha256").update(patch);
for (const f of untracked) dh.update(`\0${f}\0${sha256(readFileSync(join(tree, f)))}`);
const dirty = patch.length > 0 || untracked.length > 0 ? dh.digest("hex") : null; // sha256 of the diff + untracked files
const lockfile = join(tree, "package-lock.json"), here = import.meta.dirname;
const parts = { commit: head, base, node: process.version, lockfile: existsSync(lockfile) ? sha256(readFileSync(lockfile)) : null,
  script: sha256(readdirSync(here).filter((f) => f.endsWith(".mjs")).sort().map((f) => readFileSync(join(here, f), "utf8")).join("\0")),
  env: sha256(JSON.stringify(ENV_KEY.map((k) => [k, process.env[k] ?? null]))), r25_proof: proofFile === null ? null : sha256(readFileSync(proofFile)) };
const key = sha256(JSON.stringify(parts)), name = `${head}${dirty ? `-${dirty.slice(0, 16)}` : ""}-${role}-${start.replace(/[-:]/g, "")}-${process.pid}`;
const rec = { schema: "monark.oracle.v1", role, tree: { path: tree, head, dirty, object: null }, base, key, key_parts: parts, label: label ?? null, pid: process.pid, start };
const write = (fields) => { // a result without its record is a refusal: exit 2, no oracle-result line
  const file = join(results, `${name}.json`), body = `${JSON.stringify({ ...rec, end: stamp(), ...fields }, null, 2)}\n`;
  try { mkdirSync(results, { recursive: true }); writeFileSync(`${file}.tmp`, body); renameSync(`${file}.tmp`, file); }
  catch (e) { refuse(`record not written (${e.code ?? e.message}): no result without its record`); }
  console.log(`oracle-result ${JSON.stringify({ exit: fields.exit, record: file, sha256: sha256(body) })}`);
};
console.log(`oracle: role=${role} tree=${tree} head=${head} dirty=${dirty ?? "none"} base=${base} key=${key}`);

// Store (D4): G1 and corr only, --key only, clean tree only; never G2, cp-2, G7 (CA-9, C-1).
if (SERVED_ROLES.includes(role) && label !== undefined && dirty === null && !staticOnly && existsSync(results)) {
  for (const f of readdirSync(results).filter((x) => x.endsWith(".json")).sort()) {
    let body, r;
    try { body = readFileSync(join(results, f)); r = JSON.parse(body.toString()); } catch { continue; } // unparsable: never servable
    if (r?.key !== key) continue;
    const miss = REQUIRED.filter((k) => r[k] === undefined).concat(Number.isInteger(r.pid) && r.pid > 0 ? [] : ["pid"], /^[0-9a-f]{40,64}$/.test(r.tree?.object) ? [] : ["tree.object"]);
    if (miss.length > 0) refuse(`incomplete record ${f} (missing or invalid: ${[...new Set(miss)].join(", ")}): neither served nor replayed`);
    if (r.served_from !== null || r.static_only !== false || r.tree?.dirty !== null) continue; // a citation, a partial run, a dirty tree
    if (r.exit !== 0) { console.error(`oracle: same-key record ${f} is red (exit ${r.exit}): never served, replayed (red base => item before the G1, decision 267 (c))`); continue; }
    if (!(Array.isArray(r.gates) && r.gates.length > 0 && r.gates.every((g) => g.exit === 0))) continue;
    write({ tree: { ...rec.tree, object: gitS(tree, "rev-parse", "HEAD^{tree}") }, static_only: false, gates: [], tests: null, r25: null, residues: null, ci_only: null, cv4: null, lock_wait_s: null, exit: r.exit, served_from: { file: f, sha256: sha256(body) } });
    process.exit(r.exit); // the cited exit, never a hard-coded 0
  }
}

mkdirSync(join(root, "oracle-runs"), { recursive: true });
const runDir = mkdtempSync(join(root, "oracle-runs", "run-")), clone = join(runDir, "tree"), tmp = join(runDir, "tmp"), logs = join(results, name);
process.on("exit", () => { // also on SIGINT/SIGTERM below; junctions are unlinked by rmSync, never traversed (measured)
  try { rmSync(runDir, { recursive: true, force: true, maxRetries: 3 }); } catch (e) { console.error(`oracle: cleanup incomplete, left ${runDir}: ${e.message}`); }
});
for (const [sig, c] of [["SIGINT", 130], ["SIGTERM", 143]]) process.once(sig, () => process.exit(c));
const ran = [];
let code = 2;
try {
  execFileSync("git", ["clone", "-q", "--no-local", "--no-checkout", "-c", "core.autocrlf=false", tree, clone], { stdio: "ignore" });
  git(clone, "checkout", "-q", "--detach", head);
  if (patch.length > 0) { writeFileSync(join(runDir, "dirty.patch"), patch); git(clone, "apply", join(runDir, "dirty.patch")); }
  for (const f of untracked) { mkdirSync(dirname(join(clone, f)), { recursive: true }); copyFileSync(join(tree, f), join(clone, f)); }
  if (dirty) { git(clone, "add", "-A"); git(clone, "-c", "user.name=oracle", "-c", "user.email=oracle@localhost", "commit", "-q", "-m", `oracle freeze ${dirty}`); }
  rec.tree.object = gitS(clone, "rev-parse", "HEAD^{tree}"); // item B-TREE-SHA-1
  const nmSrc = join(dirname(resolve(tree, gitS(tree, "rev-parse", "--git-common-dir"))), "node_modules"), nm = join(clone, "node_modules");
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
  mkdirSync(logs, { recursive: true });

  const ciText = readFileSync(join(clone, ".github", "workflows", "ci.yml"), "utf8"), lines = ciText.split(/\r?\n/), runs = [], gates = [], ciOnly = [];
  lines.forEach((l, i) => {
    const m = /^\s*(?:-\s+)?run:\s*(.*)$/.exec(l);
    if (m === null) return;
    if (!/^[|>]/.test(m[1])) return void runs.push(...m[1].replace(/\s+#.*$/, "").split(/\s+&&\s+/));
    let j = i + 1;
    while (j < lines.length && (lines[j].trim() === "" || lines[j].search(/\S/) > l.indexOf("run:"))) j++;
    runs.push(lines.slice(i + 1, j).join("\n"));
  });
  for (const cmd of new Set(runs.map((r) => r.trim()))) {
    const only = CI_ONLY.find(([re]) => re.test(cmd));
    if (only) ciOnly.push({ cmd, reason: only[1] });
    else if (cmd.split("\n").some((l) => R25_DIFF_RE.test(l))) gates.push({ name: "r25", cmd: "r25" });
    else gates.push({ name: /^npm (?:run )?([\w:.-]+)$/.exec(cmd)?.[1] ?? cmd, cmd });
  }

  const sh = process.platform === "win32" ? join(execFileSync("git", ["--exec-path"], { encoding: "utf8" }).trim(), "..", "..", "..", "bin", "bash.exe") : "bash";
  const genv = { ...childEnv(tmp), NEXT_TELEMETRY_DISABLED: "1", npm_config_offline: "true", npm_config_logs_dir: join(runDir, "npm-logs") };
  let r25counts = null, r25info = { mode: null, proof: null }, refusal, cv4 = null, waited = null;
  const runGate = (g) => {
    const log = join(logs, `${String(ran.length + 1).padStart(2, "0")}-${g.name.replace(/[^\w.-]+/g, "_").slice(0, 60)}.log`), t = Date.now();
    let exit = 1;
    if (g.cmd !== "r25") { const fd = openSync(log, "w"); exit = spawnSync(sh, ["-e", "-c", g.cmd], { cwd: clone, env: genv, stdio: ["ignore", fd, fd] }).status ?? 128; closeSync(fd); }
    else try { const res = r25(clone, ciText, base, proofFile); [r25counts, exit, r25info] = [res.counts, res.exit, res]; writeFileSync(log, res.log); }
    catch (e) { writeFileSync(log, `${e.message}\nRED: diff not computable (fail-closed, ci.yml l.83-88)\n`); }
    ran.push({ name: g.name, lane: STATIC.test(g.cmd) ? "static" : "locked", exit, ms: Date.now() - t, log });
    console.log(`oracle: gate ${g.name} exit=${exit} ${Date.now() - t} ms`);
  };
  gates.filter((g) => STATIC.test(g.cmd)).forEach(runGate);
  if (!staticOnly) {
    const lk = await acquire(root, { role, sha: dirty ? `${head}+${dirty}` : head, date: stamp() }, { pollMs: Number(process.env.ORACLE_LOCK_POLL_MS ?? 5000), maxMs: Number(process.env.ORACLE_LOCK_MAX_MS ?? 5_400_000) });
    if (lk === null) refusal = 75;
    else try {
      waited = Math.round(lk.waitedMs / 1000);
      const node = process.platform === "win32"
        ? execFileSync("tasklist", ["/FI", "IMAGENAME eq node.exe", "/NH", "/FO", "CSV"], { encoding: "utf8" }).split("\n").filter((l) => l.startsWith('"node.exe"'))
        : execFileSync("ps", ["-A", "-o", "args="], { encoding: "utf8" }).split("\n").filter((l) => /^(\S*\/)?node(\s|$)/.test(l.trim()));
      cv4 = { free_mb: Math.floor(freemem() / 2 ** 20), node_exe: node.length, min_free_mb: Number(process.env.ORACLE_MIN_FREE_MB ?? 4096), max_node: Number(process.env.ORACLE_MAX_NODE ?? 40) };
      if (!(cv4.free_mb >= cv4.min_free_mb && cv4.node_exe <= cv4.max_node)) refusal = 3;
      else gates.filter((g) => !STATIC.test(g.cmd)).forEach(runGate);
    } finally { lk.release(); }
  }
  // node --test summary: the spec reporter prints "\u2139 tests N", TAP "# tests N"; a cancelled test counts as failed.
  const txt = ran.some((g) => g.name === "test") ? readFileSync(ran.find((g) => g.name === "test").log, "utf8") : "";
  const n = (k) => Number([...txt.matchAll(new RegExp(`^(?:\\u2139|#) ${k} (\\d+)\\r?$`, "gm"))].pop()?.[1] ?? 0);
  const tests = /^(?:\u2139|#) tests \d+\r?$/m.test(txt) ? { total: n("tests"), pass: n("pass"), fail: n("fail") + n("cancelled"), skip: n("skipped") } : null;
  code = refusal ?? (ran.every((g) => g.exit === 0) ? 0 : 1);
  if (refusal) console.error(`oracle: ${refusal === 3 ? `C-V-4 refused the suite: ${JSON.stringify(cv4)}` : "lock not obtained in time"}`);
  write({ static_only: staticOnly, gates: ran, tests, r25: r25counts, r25_mode: r25info.mode, r25_proof: r25info.proof, residues: { tmp_entries: readdirSync(tmp).length }, ci_only: ciOnly, cv4, lock_wait_s: waited, exit: code, served_from: null });
} catch (e) { code = 2; console.error(`oracle: refused: run dir preparation or gate derivation failed: ${e.stack ?? e}`); }
process.exitCode = code;
} // end of the main guard (l.40)

/** The env of every gate's child (l.136) and of scripts/mutants/run.mjs's children (lot M-6, Q-V-3): process.env without a name matching deny, TEMP/TMP/TMPDIR = tmp. */
export function childEnv(tmp, deny = DENY) { return { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !deny.test(k))), TEMP: tmp, TMP: tmp, TMPDIR: tmp }; }
