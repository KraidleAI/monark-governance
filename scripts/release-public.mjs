// release-public.mjs — fail-closed local gate, then PREPARE one public commit of the exported tree in the local clone of
// KraidleAI/Monark and stop before the push (ADR-M010, amended by ADR-PUBLIC-CADENCE-1 D1).
//
// This is an INTERNAL release tool. It is deliberately NOT in export-public.mjs's whitelist, so it is
// never itself exported to the public repo. It codifies the local-only policy: the private source lives
// in this repo and is never pushed; the ONLY outward push is the exported public tree to KraidleAI/Monark.
//
// Usage:
//   node scripts/release-public.mjs --message <file>            gates -> export -> sync -> local commit, prints the push
//   node scripts/release-public.mjs --message <file> --dry-run  gates + export + diff only (no commit)
//
// The commit message is the --message file (English, written by the orchestrator), passed through checkPublicText
// (scripts/public-text-deny.mjs, kind "message") before anything else and committed byte for byte: the tool adds nothing.
// The push, the tag and the GitHub Release are acts of the orchestrator; this tool writes nothing to GitHub (the local
// tag step, --tag / --notes, belongs to PR-A2 of that lot).
//
// Every gate is BLOCKING: any non-zero exit aborts the release before anything is pushed. The public mirror
// clone lives at $MONARK_PUBLIC_MIRROR (required, no default) and is reset to origin/main on each
// run so the diff is exactly the new change set.
//
// The PURE guards (isSemverTag and checkReleaseText, re-exported from public-text-deny.mjs; branchGuard) and the pinned
// gate list LOCAL_GATES are exported for the tests; the CLI body lives in a run-guarded main() at the bottom, so
// importing this module NEVER triggers a release.

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { basename, dirname, join, resolve } from "node:path";
import { existsSync, readdirSync, readFileSync, rmSync, cpSync, writeFileSync } from "node:fs";
import { checkPublicText } from "./public-text-deny.mjs";
export { isSemverTag, checkReleaseText } from "./public-text-deny.mjs";

const SRC = dirname(dirname(fileURLToPath(import.meta.url)));
const PUBLIC_REMOTE = "https://github.com/KraidleAI/Monark.git";
const GOVERNANCE_SLUG = "KraidleAI/monark-governance"; // its visibility must read 'private' before any preparation (CA-1.7)

// ============================================================ PURE, EXPORTED GUARDS (mutant-tested) =====

/** branchGuard(headRef, porcelain) -> {ok, reason}: ok iff HEAD is exactly 'main' AND the working tree is
 *  clean (empty `git status --porcelain`). There is NO origin/main variant (ADR-M010 B-2): origin/main is a
 *  stale remote ref that can lag a reverted push (fail-open). Pure: no I/O, no process.exit. */
export function branchGuard(headRef, porcelain) {
  if (headRef !== "main") return { ok: false, reason: `HEAD is '${headRef}', not 'main'` };
  if (porcelain !== "") return { ok: false, reason: "working tree is not clean (uncommitted changes)" };
  return { ok: true, reason: "on main, clean" };
}

/** The local gates, in order; export:check last, just before the export (ADR-PUBLIC-CADENCE-1 D1.4). Pinned by
 *  test/release-public.test.ts (commands and order, C-V-4): the flow test substitutes this list through main()'s second
 *  parameter, which the command line never reaches, so a substituted list cannot hide a removed gate. */
export const LOCAL_GATES = Object.freeze([
  ["vocab + typecheck + tests (npm run ci)", "npm run ci"],
  ["language gate", "npm run lang:gate"],
  ["lint ratchet", "node scripts/lint-ratchet.mjs"],
  ["eslint", "npx eslint ."],
  ["export check, global scope (npm run export:check)", "npm run export:check"],
].map((g) => Object.freeze(g)));

// ============================================================ CLI helpers (run-guarded; not exported) ===

function run(cmd, cwd = SRC) {
  execSync(cmd, { stdio: "inherit", cwd, shell: true });
}
function capture(cmd, cwd = SRC) {
  return execSync(cmd, { encoding: "utf8", cwd, shell: true }).trim();
}
/** Capture stdout, swallowing a non-zero exit — used for presence/existence probes. */
function tryCapture(cmd, cwd = SRC) {
  try {
    return { ok: true, out: execSync(cmd, { encoding: "utf8", cwd, stdio: ["ignore", "pipe", "ignore"] }).trim() };
  } catch {
    return { ok: false, out: "" };
  }
}
function step(name) {
  console.log(`\n=== ${name} ===`);
}
function abort(message) {
  console.error(`\nRELEASE ABORTED: ${message}`);
  process.exit(1);
}
/** Run `text` through checkPublicText and abort fail-closed on any violation (empty/whitespace included), naming the
 *  rule and the word (FM-2.4). The SAME guard is used by --dry-run and the real path (ADR-M010 section 4/5). */
function gateOrAbort(label, text, kind) {
  const chk = checkPublicText(text, kind);
  if (!chk.ok) {
    console.error(`\nRELEASE ABORTED: the ${label} did not pass the public-text gate (ADR-PUBLIC-CADENCE-1 D1.3).`);
    for (const v of chk.violations) console.error(`  - rule ${v.rule}, line ${v.line}: ${JSON.stringify(v.word)}`);
    process.exit(1);
  }
}
/** gh is a system dependency (ADR-M010 N-7): refuse fail-closed if it is absent or not authenticated.
 *  `gh auth status` is an auth probe; the only other gh call is the visibility READ of preflight (CA-1.7). */
function requireGh() {
  if (!tryCapture("gh --version").ok) abort("gh (GitHub CLI) is not installed — required to read the governance visibility (ADR-M010 N-7).");
  if (!tryCapture("gh auth status").ok) abort("gh is not authenticated (`gh auth status` failed) — refuse (ADR-M010 N-7).");
}

function parseArgs(argv) {
  const a = { dryRun: false, message: null };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--dry-run") {
      a.dryRun = true;
      continue;
    }
    if (t === "--message") {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) abort(`${t} requires a value.`);
      a.message = v;
      i++;
      continue;
    }
    if (t === "--tag" || t === "--notes") abort(`${t}: the local tag step is not in this tool yet (ADR-PUBLIC-CADENCE-1 D2, PR-A2).`);
    abort(`unknown argument: ${t}`);
  }
  return a;
}

/** Every fail-closed refusal that must precede ANY preparation (ADR-M010 section 4/5; ADR-PUBLIC-CADENCE-1 D1), so a
 *  bad invocation — INCLUDING a --dry-run — refuses before any gate runs and before the mirror clone is touched: the
 *  message gate (CA-1.1), the mirror path and the noreply identity (CA-1.4), the branch guard, gh, and the visibility of
 *  the governance repository (CA-1.7). Returns what main() consumes. */
function preflight(opts) {
  if (!opts.message) abort("--message <file> is required: the English commit message (ADR-PUBLIC-CADENCE-1 D1).");
  if (!existsSync(opts.message)) abort(`--message file not found: ${opts.message}`);
  const message = readFileSync(opts.message, "utf8");
  gateOrAbort("commit message", message, "message");
  if (!process.env.MONARK_PUBLIC_MIRROR) abort("MONARK_PUBLIC_MIRROR is not set: the mirror clone path is required (no default).");
  const mirror = resolve(process.env.MONARK_PUBLIC_MIRROR);
  // Branch guard — publish only from a clean local main (no origin/main variant, B-2). The HEAD ref + porcelain are read
  // from SRC (this repo), never the mirror.
  const headRef = capture("git rev-parse --abbrev-ref HEAD", SRC);
  const porcelain = capture("git status --porcelain", SRC);
  const bg = branchGuard(headRef, porcelain);
  if (!bg.ok) abort(`branch guard: ${bg.reason} (ADR-M010 B-2 — publish only from a clean main).`);
  // Identity guard, before any write: the source repo's committer identity must be a github noreply address (prevents
  // leaking a personal email into public history); main() copies it into the mirror clone.
  const gitName = capture("git config user.name", SRC);
  const gitEmail = capture("git config user.email", SRC);
  if (!/@users\.noreply\.github\.com$/.test(gitEmail)) abort(`refusing to publish under a non-noreply identity: ${gitEmail}`);
  requireGh();
  const vis = tryCapture(`gh api repos/${GOVERNANCE_SLUG} --jq .visibility`);
  if (!vis.ok || vis.out !== "private") abort(`${GOVERNANCE_SLUG} visibility reads '${vis.out}', not 'private' (CA-1.7).`);
  return { message, mirror, gitName, gitEmail };
}

// ============================================================================================ main CLI ==
/** `inject` serves test/release-public-flow.test.ts only ({gates, remote}: substitute gates that journal their passage,
 *  a disposable bare repository). The run-guard below calls main() with no argument, so the production command line never
 *  reaches it (ADR-PUBLIC-CADENCE-1 C-V-4, mutant M1-p). */
export function main(argv = process.argv.slice(2), inject = {}) {
  const opts = parseArgs(argv);

  // 0. Fail-closed preflight BEFORE any preparation: on a refusal no gate runs and the mirror clone is not touched.
  const plan = preflight(opts);
  const MIRROR = plan.mirror;
  const REMOTE = inject.remote ?? PUBLIC_REMOTE;
  // An existing clone points at REMOTE, checked before any gate or export: nothing is left beside it (a fresh clone is of REMOTE).
  if (existsSync(join(MIRROR, ".git")) && capture("git remote get-url origin", MIRROR) !== REMOTE) abort(`mirror at ${MIRROR} points at an unexpected remote`);

  // 1. Local gates — the fuller set (the public CI only re-checks the exported subset).
  const gates = inject.gates ?? LOCAL_GATES;
  for (const [name, cmd] of gates) {
    step(`gate: ${name}`);
    try {
      run(cmd);
    } catch {
      abort(`gate failed: ${name}`);
    }
  }

  // 2. Export the public tree (export-public.mjs fails closed on any structural/blacklist violation).
  step("export public tree");
  const stage = join(dirname(MIRROR), `${basename(MIRROR)}-stage-${process.pid}`); // beside the clone, never os.tmpdir()
  rmSync(stage, { recursive: true, force: true });
  try {
    run(`node scripts/export-public.mjs --out "${stage}"`);
  } catch {
    abort("export failed");
  }

  // 3. Sync the public mirror from a clean origin/main, then overlay the fresh export.
  step("sync public mirror");
  if (!existsSync(join(MIRROR, ".git"))) {
    run(`git clone "${REMOTE}" "${MIRROR}"`, dirname(MIRROR));
  }
  run("git fetch origin --quiet", MIRROR);
  run("git checkout -q main", MIRROR);
  run("git reset --hard origin/main", MIRROR);
  run("git clean -fd", MIRROR);
  for (const entry of readdirSync(MIRROR)) {
    if (entry !== ".git") rmSync(join(MIRROR, entry), { recursive: true, force: true });
  }
  // Copy entry by entry: on this host (Node v24.15.0, win32) a single cpSync(stage, MIRROR) into the mirror clone exits the
  // process silently with code 127 after the mirror was emptied, while the same copy per top-level entry succeeds
  // (measured 2026-09-23, dry-runs 6-7 and a manual bisect; item RELEASE-CPSYNC-127-1). Same bytes, same layout.
  for (const entry of readdirSync(stage)) {
    cpSync(join(stage, entry), join(MIRROR, entry), { recursive: true });
  }
  rmSync(stage, { recursive: true, force: true });
  run("git add -A", MIRROR);
  // The identity checked by preflight (a github noreply address) signs the mirror commit.
  run(`git config user.name "${plan.gitName}"`, MIRROR);
  run(`git config user.email "${plan.gitEmail}"`, MIRROR);

  const dirty = capture("git status --porcelain", MIRROR);
  if (!dirty) {
    console.log("\nNothing to publish (public tree already matches the export).");
    process.exit(0);
  }
  console.log("\nChanges to publish:");
  console.log(capture("git status --short", MIRROR));

  if (opts.dryRun) {
    console.log("\n--dry-run: gates + export + diff OK. Nothing committed or pushed.");
    process.exit(0);
  }

  // 4. Commit in the LOCAL clone with the gated message, byte for byte (--cleanup=verbatim), from a controlled copy beside
  //    the clone (never the user-supplied path, never interpolated), then STOP: the push is an act of the orchestrator
  //    under a go (ADR-PUBLIC-CADENCE-1 D1.6). Nothing is written to GitHub.
  step("local commit (no push)");
  const msgFile = join(dirname(MIRROR), `${basename(MIRROR)}-message-${process.pid}.txt`);
  writeFileSync(msgFile, plan.message);
  run(`git commit -q --cleanup=verbatim -F "${msgFile}"`, MIRROR);
  rmSync(msgFile, { force: true });
  const sha = capture("git rev-parse HEAD", MIRROR);
  console.log(`\nPrepared ${sha} in ${MIRROR}, NOT pushed. After the go: git -C "${MIRROR}" push origin HEAD:main`);
}

// Run-guard: execute the CLI only when invoked directly (node scripts/release-public.mjs ...), NOT when
// imported by a test. Mirrors scripts/grep-forbidden.mjs / scripts/lang-gate.mjs / scripts/export-public.mjs.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
