// release-public.mjs — fail-closed local gate, then publish the exported tree to KraidleAI/monark.
//
// This is an INTERNAL release tool. It is deliberately NOT in export-public.mjs's whitelist, so it is
// never itself exported to the public repo. It codifies the local-only policy (2026-09-11): the private
// source lives in this repo and is never pushed; the ONLY outward push is the exported public tree to
// KraidleAI/monark.
//
// Usage:
//   node scripts/release-public.mjs "commit message"   full release (gates -> export -> sync -> push)
//   node scripts/release-public.mjs --dry-run           gates + export + diff only (no commit, no push)
//
// Every gate is BLOCKING: any non-zero exit aborts the release before anything is pushed.
// The public mirror clone lives at $MONARK_PUBLIC_MIRROR (default ~/.monark-public-mirror) and is reset
// to origin/main on each run so the diff is exactly the new change set.

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, readdirSync, rmSync, cpSync, writeFileSync } from "node:fs";
import os from "node:os";

const SRC = dirname(dirname(fileURLToPath(import.meta.url)));
const MIRROR = process.env.MONARK_PUBLIC_MIRROR || join(os.homedir(), ".monark-public-mirror");
const REMOTE = "https://github.com/KraidleAI/monark.git";

const dryRun = process.argv.includes("--dry-run");
const msgArg = process.argv.slice(2).find((a) => !a.startsWith("--"));

function run(cmd, cwd = SRC) {
  execSync(cmd, { stdio: "inherit", cwd, shell: true });
}
function capture(cmd, cwd = SRC) {
  return execSync(cmd, { encoding: "utf8", cwd, shell: true }).trim();
}
function step(name) {
  console.log(`\n=== ${name} ===`);
}
function abort(message) {
  console.error(`\nRELEASE ABORTED: ${message}`);
  process.exit(1);
}

// 1. Local gates — the fuller set (the public CI only re-checks the exported subset).
const gates = [
  ["vocab + typecheck + tests (npm run ci)", "npm run ci"],
  ["language gate", "npm run lang:gate"],
  ["lint ratchet", "node scripts/lint-ratchet.mjs"],
  ["eslint", "npx eslint ."],
];
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
const stage = join(os.tmpdir(), `monark-export-${process.pid}`);
rmSync(stage, { recursive: true, force: true });
try {
  run(`node scripts/export-public.mjs --out "${stage}"`);
} catch {
  abort("export failed");
}

// 3. Sync the public mirror from a clean origin/main, then overlay the fresh export.
step("sync public mirror");
if (!existsSync(join(MIRROR, ".git"))) {
  run(`git clone ${REMOTE} "${MIRROR}"`, os.tmpdir());
}
if (capture("git remote get-url origin", MIRROR) !== REMOTE) {
  abort(`mirror at ${MIRROR} points at an unexpected remote`);
}
run("git fetch origin --quiet", MIRROR);
run("git checkout -q main", MIRROR);
run("git reset --hard origin/main", MIRROR);
run("git clean -fd", MIRROR);
for (const entry of readdirSync(MIRROR)) {
  if (entry !== ".git") rmSync(join(MIRROR, entry), { recursive: true, force: true });
}
cpSync(stage, MIRROR, { recursive: true });
run("git add -A", MIRROR);

// Identity guard: copy the source repo's committer identity, and refuse to publish under anything that
// is not a github noreply address (prevents leaking a personal email into public history).
const gitName = capture("git config user.name", SRC);
const gitEmail = capture("git config user.email", SRC);
if (!/@users\.noreply\.github\.com$/.test(gitEmail)) {
  abort(`refusing to publish under a non-noreply identity: ${gitEmail}`);
}
run(`git config user.name "${gitName}"`, MIRROR);
run(`git config user.email "${gitEmail}"`, MIRROR);

const dirty = capture("git status --porcelain", MIRROR);
if (!dirty) {
  console.log("\nNothing to publish (public tree already matches the export).");
  process.exit(0);
}
console.log("\nChanges to publish:");
console.log(capture("git status --short", MIRROR));

if (dryRun) {
  console.log("\n--dry-run: gates + export + diff OK. Nothing committed or pushed.");
  process.exit(0);
}

// 4. Commit and push the exported tree to the public repo. The message (the only free-text input) is
// written to a temp file and passed via `git commit -F`, so it is never interpolated into a shell string.
step("commit + push to KraidleAI/monark main");
const message = msgArg || `Public sync ${new Date().toISOString()}`;
const msgFile = join(os.tmpdir(), `monark-commit-${process.pid}.txt`);
writeFileSync(msgFile, `${message}\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>\n`);
run(`git commit -q -F "${msgFile}"`, MIRROR);
rmSync(msgFile, { force: true });
const sha = capture("git rev-parse --short HEAD", MIRROR);
run("git push origin HEAD:main", MIRROR);
console.log(`\nPublished ${sha} to KraidleAI/monark main.`);
