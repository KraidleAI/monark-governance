// release-public.mjs — fail-closed local gate, then publish the exported tree to KraidleAI/Monark,
// optionally cutting an annotated tag + GitHub Release (ADR-M010).
//
// This is an INTERNAL release tool. It is deliberately NOT in export-public.mjs's whitelist, so it is
// never itself exported to the public repo. It codifies the local-only policy: the private source lives
// in this repo and is never pushed; the ONLY outward push is the exported public tree to KraidleAI/Monark.
//
// Usage:
//   node scripts/release-public.mjs                               plain sync (gates -> export -> sync -> push)
//   node scripts/release-public.mjs --tag v0.1.0 --notes notes.md sync, then annotated tag + GitHub Release
//   node scripts/release-public.mjs --dry-run [--tag .. --notes ..] gates + export + diff only (no commit/push)
//
// There is NO free-text commit-message argument (ADR-M010 B-3): the sync commit message is fixed/generated
// ("Public sync <ISO>"). The ONLY human free text is the --notes file, and it passes the English/vocab
// firewall (checkReleaseText) before it can reach the public repo. --tag / --notes are ALL-OR-NONE (both =
// a tagged release; neither = a plain sync).
//
// Every gate is BLOCKING: any non-zero exit aborts the release before anything is pushed. The public mirror
// clone lives at $MONARK_PUBLIC_MIRROR (default ~/.monark-public-mirror) and is reset to origin/main on each
// run so the diff is exactly the new change set.
//
// Three PURE guard functions (isSemverTag, checkReleaseText, branchGuard) are exported at top level for the
// mutant tests. They perform no writes, no network I/O and no process.exit, and the CLI body lives in a
// run-guarded main() at the bottom, so importing this module NEVER triggers a release.

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { existsSync, readdirSync, readFileSync, rmSync, cpSync, writeFileSync } from "node:fs";
import os from "node:os";
import { scanText as scanLang, loadExempt } from "./lang-gate.mjs";
import { scanText as scanVocab, compilePatterns } from "./grep-forbidden.mjs";

const SRC = dirname(dirname(fileURLToPath(import.meta.url)));
const MIRROR = process.env.MONARK_PUBLIC_MIRROR || join(os.homedir(), ".monark-public-mirror");
const REMOTE = "https://github.com/KraidleAI/Monark.git";
const REPO_SLUG = REMOTE.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, ""); // KraidleAI/Monark

// ============================================================ PURE, EXPORTED GUARDS (mutant-tested) =====

/** isSemverTag(tag) -> boolean: true iff `tag` is a v0.MINOR.PATCH tag (0.x only; MAJOR>=1 is a human
 *  decision, ADR-M010 section 2.3). Rejects v1.0.0, v0.1, 0.1.0, v0.1.0-rc and any trailing space/junk.
 *  Pure: no I/O, no process.exit. */
export function isSemverTag(tag) {
  return typeof tag === "string" && /^v0\.\d+\.\d+$/.test(tag);
}

/** branchGuard(headRef, porcelain) -> {ok, reason}: ok iff HEAD is exactly 'main' AND the working tree is
 *  clean (empty `git status --porcelain`). There is NO origin/main variant (ADR-M010 B-2): origin/main is a
 *  stale remote ref that can lag a reverted push (fail-open). Pure: no I/O, no process.exit. */
export function branchGuard(headRef, porcelain) {
  if (headRef !== "main") return { ok: false, reason: `HEAD is '${headRef}', not 'main'` };
  if (porcelain !== "") return { ok: false, reason: "working tree is not clean (uncommitted changes)" };
  return { ok: true, reason: "on main, clean" };
}

/** checkReleaseText(text) -> {ok, hits}: run the language gate (French detection, lang-exempt maskers) AND
 *  the vocab gate at the STOREFRONT honesty bar over the in-memory string. Empty/whitespace text -> ok:false.
 *  ok iff the text is non-empty AND every hit-list is empty. Reads only the committed gate config
 *  (scripts/lang-exempt.json, vocab-banned.json) — no writes, no network, no process.exit — so it is safe to
 *  import and unit-test. This is the ONLY free text that can reach the public repo, and the GitHub Release
 *  object is public STOREFRONT text, so it meets the same honesty bar as the site — ADR-M010 section 4 m-4
 *  (investisseur 2026-09-16): apply the GLOBAL bans PLUS the `site` AND `skills` scoped honesty bans (brands,
 *  autonomous/predicts/confidence/accuracy, securities vocab, ...), each with the UNION of the two scopes'
 *  closed exemptPhrases masked first, so an honest negation ("no confidence field", "$/token spend cap") that
 *  is exempt on one storefront surface is not falsely reddened by the other's scan. */
export function checkReleaseText(text) {
  if (typeof text !== "string" || text.trim() === "") return { ok: false, hits: [] };
  const { maskers } = loadExempt(SRC);
  const frenchHits = scanLang(text, maskers);
  const cfg = JSON.parse(readFileSync(join(SRC, "vocab-banned.json"), "utf8"));
  const site = cfg.scan?.site ?? {};
  const skills = cfg.scan?.skills ?? {};
  // Fail-closed (m-4 F3): the storefront bar REQUIRES both scoped ban sets. A missing/empty scope is a config
  // defect, never a licence to silently fall back to GLOBAL-only on public text — refuse all text instead.
  if (!Array.isArray(site.banned) || site.banned.length === 0 || !Array.isArray(skills.banned) || skills.banned.length === 0) {
    return { ok: false, hits: [{ why: "storefront gate config incomplete: scan.site.banned / scan.skills.banned missing or empty (fail-closed)" }] };
  }
  // Union of the honest-negation exemptPhrases across the storefront scopes we apply — masked before every
  // scoped scan so a phrase exempt on one surface (site) is not reddened by the other (skills), and vice versa.
  const exemptPhrases = [...(site.exemptPhrases ?? []), ...(skills.exemptPhrases ?? [])];
  const vocabHits = [
    ...scanVocab(text, compilePatterns(cfg.banned)), // GLOBAL bans (no exemptPhrases in the config)
    ...scanVocab(text, compilePatterns(site.banned), exemptPhrases), // site storefront honesty + brands
    ...scanVocab(text, compilePatterns(skills.banned), exemptPhrases), // skills honesty + securities vocab
  ];
  const hits = [...frenchHits, ...vocabHits];
  return { ok: hits.length === 0, hits };
}

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
/** Run `text` through checkReleaseText and abort fail-closed if it reddens (empty/whitespace included). The
 *  SAME guard function is used by --dry-run and the real path (ADR-M010 section 4/5, no divergent path). */
function gateOrAbort(label, text) {
  const chk = checkReleaseText(text);
  if (!chk.ok) {
    console.error(`\nRELEASE ABORTED: the ${label} did not pass the English/vocab firewall (ADR-M010 section 4).`);
    if (!text || !text.trim()) console.error("  - (empty / whitespace-only text)");
    for (const h of chk.hits) console.error(`  - ${JSON.stringify(h)}`);
    process.exit(1);
  }
}
/** gh is a system dependency (ADR-M010 N-7): refuse fail-closed if it is absent or not authenticated.
 *  `gh auth status` is an auth probe, not a git-remote mutation. */
function requireGh() {
  if (!tryCapture("gh --version").ok) abort("gh (GitHub CLI) is not installed — required to cut a Release (ADR-M010 N-7).");
  if (!tryCapture("gh auth status").ok) abort("gh is not authenticated (`gh auth status` failed) — refuse to cut a Release (ADR-M010 N-7).");
}
function tagExistsLocally(tag) {
  const r = tryCapture(`git tag -l "${tag}"`, SRC);
  return r.ok && r.out !== "";
}
function tagExistsOnRemote(tag) {
  const r = tryCapture(`git ls-remote --tags "${REMOTE}" "refs/tags/${tag}"`, SRC);
  return r.ok && r.out !== "";
}

function parseArgs(argv) {
  const a = { dryRun: false, tag: null, notes: null };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--dry-run") {
      a.dryRun = true;
      continue;
    }
    if (t === "--tag" || t === "--notes") {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) abort(`${t} requires a value.`);
      if (t === "--tag") a.tag = v;
      else a.notes = v;
      i++;
      continue;
    }
    abort(`unknown argument: ${t} (the free-text message argument was removed — ADR-M010 B-3; use --notes <file>).`);
  }
  return a;
}

/** Every fail-closed refusal that must precede ANY remote mutation (ADR-M010 section 4/5), so a bad
 *  invocation — INCLUDING a --dry-run — refuses without touching the git remote. Returns the release plan
 *  ({tagPlan:null} for a plain sync). The tag STRING is validated (isSemverTag) BEFORE it is ever
 *  interpolated into a git command. */
function preflight(opts) {
  // --tag / --notes are all-or-none.
  if (!!opts.tag !== !!opts.notes) {
    abort("--tag and --notes are all-or-none: pass both (a tagged release) or neither (a plain sync).");
  }
  // Validate the tag STRING before any interpolation (semver + MAJOR<1, both enforced by isSemverTag).
  if (opts.tag && !isSemverTag(opts.tag)) {
    abort(`--tag '${opts.tag}' is not a v0.MINOR.PATCH tag (0.x only; 1.0.0 is a human decision — ADR-M010 section 2.3/5).`);
  }
  // Branch guard — publish only from a clean local main (no origin/main variant, B-2). Applies to plain
  // syncs too. The HEAD ref + porcelain are read from SRC (this repo), never the mirror.
  const headRef = capture("git rev-parse --abbrev-ref HEAD", SRC);
  const porcelain = capture("git status --porcelain", SRC);
  const bg = branchGuard(headRef, porcelain);
  if (!bg.ok) abort(`branch guard: ${bg.reason} (ADR-M010 B-2 — publish only from a clean main).`);

  if (!opts.tag) return { headRef, tagPlan: null };

  // Notes: present, readable, non-empty, and green through the firewall (checkReleaseText).
  if (!existsSync(opts.notes)) abort(`--notes file not found: ${opts.notes}`);
  const notesText = readFileSync(opts.notes, "utf8");
  gateOrAbort("release notes", notesText);
  // The Release title and the annotated-tag message are derived English text; they pass the SAME firewall.
  const title = opts.tag;
  const tagMessage = `MONARK ${opts.tag}`;
  gateOrAbort("Release title", title);
  gateOrAbort("annotated-tag message", tagMessage);

  // gh must be present + authenticated BEFORE any remote work (N-7).
  requireGh();

  // No clobber: the tag must exist neither locally (the governance tag) nor on the public remote.
  if (tagExistsLocally(opts.tag)) abort(`tag ${opts.tag} already exists locally (no clobber — ADR-M010 section 5).`);
  if (tagExistsOnRemote(opts.tag)) abort(`tag ${opts.tag} already exists on ${REPO_SLUG} (no clobber — ADR-M010 section 5).`);

  return { headRef, tagPlan: { tag: opts.tag, title, tagMessage, notesText, notesPath: opts.notes } };
}

// ============================================================================================ main CLI ==
function main() {
  const opts = parseArgs(process.argv.slice(2));

  // 0. Fail-closed preflight (branch guard + tag/notes validation + gh + no-clobber) BEFORE any remote
  //    mutation, so a bad invocation — including a --dry-run — refuses without touching the remote.
  const plan = preflight(opts);

  if (opts.dryRun && plan.tagPlan) {
    step("dry-run: release plan");
    console.log(`  tag           : ${plan.tagPlan.tag}`);
    console.log(`  Release title : ${plan.tagPlan.title}`);
    console.log(`  notes file    : ${plan.tagPlan.notesPath}`);
    console.log("  notes preview :");
    for (const line of plan.tagPlan.notesText.split(/\r?\n/).slice(0, 12)) console.log(`    | ${line}`);
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
    // N-2: a tag with nothing new to publish is not a release.
    if (plan.tagPlan) {
      abort(`nothing to publish, but --tag ${plan.tagPlan.tag} was given — "nothing to publish" is not a release (ADR-M010 N-2). If a PRIOR run already pushed this sync and only the Release step failed, do NOT re-run: recover manually per ADR-M010 N-1 (recreate the tag + gh release create on the already-pushed mirror HEAD).`);
    }
    console.log("\nNothing to publish (public tree already matches the export).");
    process.exit(0);
  }
  console.log("\nChanges to publish:");
  console.log(capture("git status --short", MIRROR));

  if (opts.dryRun) {
    console.log("\n--dry-run: gates + export + diff OK. Nothing committed or pushed.");
    if (plan.tagPlan) console.log(`--dry-run: would tag ${plan.tagPlan.tag} + create a GitHub Release on ${REPO_SLUG}.`);
    process.exit(0);
  }

  // 4. Commit and push the exported tree. The commit message is fixed/generated (no free-text input,
  //    ADR-M010 B-3); it is written to a temp file and passed via `git commit -F`, never interpolated.
  step("commit + push to KraidleAI/Monark main");
  const message = `Public sync ${new Date().toISOString()}`;
  const msgFile = join(os.tmpdir(), `monark-commit-${process.pid}.txt`);
  writeFileSync(msgFile, `${message}\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>\n`);
  run(`git commit -q -F "${msgFile}"`, MIRROR);
  rmSync(msgFile, { force: true });
  const sha = capture("git rev-parse --short HEAD", MIRROR);
  run("git push origin HEAD:main", MIRROR);
  console.log(`\nPublished ${sha} to ${REPO_SLUG} main.`);

  // 5. Tagged release (ADR-M010 section 2.1): annotated tag on the mirror sync commit -> GitHub Release ->
  //    governance tag on THIS repo's HEAD (local-only, never pushed). Atomic with rollback (N-1).
  if (plan.tagPlan) {
    const { tag, title, tagMessage, notesText } = plan.tagPlan;
    step(`tag + GitHub Release ${tag}`);

    // Re-gate the free text right before it reaches the public repo (same guard as --dry-run/preflight).
    gateOrAbort("release notes", notesText);
    gateOrAbort("annotated-tag message", tagMessage);
    gateOrAbort("Release title", title);

    // Annotated tag on the just-pushed sync commit (MIRROR HEAD), pushed so gh can attach to it.
    const tagMsgFile = join(os.tmpdir(), `monark-tag-${process.pid}.txt`);
    writeFileSync(tagMsgFile, `${tagMessage}\n`);
    run(`git tag -a "${tag}" -F "${tagMsgFile}"`, MIRROR);
    try {
      run(`git push origin "refs/tags/${tag}"`, MIRROR);
    } catch {
      // Tag push failed — the sync commit is already public (pushed above), but no remote tag/Release
      // exists. Delete the local mirror tag, report the ACTUAL outcome, and route MANUAL recovery (N-1):
      // a re-run would reset to origin/main, find nothing to publish, and be refused by N-2.
      const localDel = tryCapture(`git tag -d "${tag}"`, MIRROR);
      rmSync(tagMsgFile, { force: true });
      console.error(`\n  rollback — remote tag: not pushed (nothing to delete)`);
      console.error(`  rollback — local tag:  ${localDel.ok ? "deleted" : `STILL PRESENT; delete by hand: git tag -d ${tag}`}`);
      abort(`failed to push the release tag ${tag}. Sync commit ${sha} is already public — recover MANUALLY per ADR-M010 N-1 (recreate + push the tag, then gh release create on ${sha}); do NOT re-run.`);
    }

    // Write the VALIDATED notes to a controlled temp file — never pass the user-supplied path to gh.
    const notesFile = join(os.tmpdir(), `monark-notes-${process.pid}.md`);
    writeFileSync(notesFile, notesText.endsWith("\n") ? notesText : `${notesText}\n`);
    try {
      run(`gh release create "${tag}" --repo "${REPO_SLUG}" --title "${title}" --notes-file "${notesFile}" --verify-tag`, MIRROR);
    } catch {
      // Rollback (N-1): delete the just-created tag(s), and report the ACTUAL outcome. If the remote delete
      // itself fails (gh just failed; the network may still be down), the remote tag SURVIVES and must be
      // removed by hand, else the next run trips the no-clobber check. The sync commit is already public, so
      // gh-failure recovery is MANUAL (ADR-M010 N-1), never a re-run (which N-2 would refuse).
      const remoteDel = tryCapture(`git push --delete origin "refs/tags/${tag}"`, MIRROR);
      const localDel = tryCapture(`git tag -d "${tag}"`, MIRROR);
      rmSync(tagMsgFile, { force: true });
      rmSync(notesFile, { force: true });
      console.error(`\n  rollback — remote tag: ${remoteDel.ok ? "deleted" : `STILL PRESENT on ${REPO_SLUG}; delete by hand: git push --delete origin refs/tags/${tag}`}`);
      console.error(`  rollback — local tag:  ${localDel.ok ? "deleted" : `STILL PRESENT; delete by hand: git tag -d ${tag}`}`);
      abort(`gh release create failed for ${tag}. Sync commit ${sha} is already public — recover MANUALLY per ADR-M010 N-1 (recreate the tag + gh release create on ${sha}); do NOT re-run.`);
    }
    rmSync(notesFile, { force: true });
    rmSync(tagMsgFile, { force: true });

    // Governance tag on THIS repo's HEAD — private<->public traceability (section 2.1c). LOCAL ONLY, never
    // pushed. Its message carries the mirror sync SHA so the two histories are cross-referenced.
    const srcHead = capture("git rev-parse HEAD", SRC);
    const govMsgFile = join(os.tmpdir(), `monark-govtag-${process.pid}.txt`);
    writeFileSync(govMsgFile, `MONARK ${tag} — public sync ${sha}\n`);
    run(`git tag -a "${tag}" -F "${govMsgFile}" "${srcHead}"`, SRC);
    rmSync(govMsgFile, { force: true });

    console.log(`\nTagged ${tag} on ${REPO_SLUG} (annotated) + created the GitHub Release.`);
    console.log(`Governance tag ${tag} created locally on ${srcHead.slice(0, 12)} (NOT pushed — B-2).`);
  }
}

// Run-guard: execute the CLI only when invoked directly (node scripts/release-public.mjs ...), NOT when
// imported by a test. Mirrors scripts/grep-forbidden.mjs / scripts/lang-gate.mjs / scripts/export-public.mjs.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
