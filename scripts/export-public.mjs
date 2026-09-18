// scripts/export-public.mjs — export the MONARK governance repo to the PUBLIC storefront repo
// (ADR-M004 D7). Node 24, ZERO dependencies.
//
//   node scripts/export-public.mjs --out <dir>            copy the whitelist to <dir> + manifest
//   node scripts/export-public.mjs --check [--scope a,b]  no copy; exit 1 if a forbidden file
//                                                         would be included OR the language gate reds
//
// MODEL (defense in depth):
//   1. WHITELIST — only these paths are ever candidates for the public repo.
//   2. STRUCTURAL BLACKLIST — governance/provenance paths that must NEVER appear. If the whitelist
//      ever selects one (e.g. a mutated whitelist slips docs/adr/* in), the export FAILS HARD
//      (exit 1, writes nothing). A silent drop would let such a mutant survive test 42(a).
//   3. FRENCH .md RULE — a whitelisted .md that the (exempt-aware) language gate flags as French is
//      EXCLUDED from the copy and REPORTED (not fatal): the root README.md carries only the exempt
//      corpus proper name, so a raw accent check would wrongly drop it; the gate is exempt-aware.
//
// The first publication of KraidleAI/monark is a deliberate maintainer decision. This
// script only writes to a LOCAL --out directory; it never pushes and never touches a
// remote.
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { loadExempt, scanFile, isFileFrench, classifyScope, scannable, pathExempt, SCOPES } from "./lang-gate.mjs";

const SCRIPT_DIR = fileURLToPath(new URL(".", import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..");

// ---- 1. WHITELIST --------------------------------------------------------------------------
// Each package contributes src/**, test/**, package.json, README.md. Plus the shared root files.
// Kept as data so a mutant (test 42) can slip a forbidden path in and be caught by the blacklist.
export const PACKAGE_SUBPATHS = ["src", "test", "package.json", "README.md"];
// apps/* exported PACKAGE-STYLE (ADR-M005 D10 / D16, Q-A): the SAME four subpaths as a package
// (src, test, package.json, README.md), NOT a whole-dir walk like apps/site (WHITELIST_DIRS). Rationale:
// apps/harness/test/** IS run by the exported CI (`apps/harness/test/*.test.ts` is in the exported
// package.json "test" glob), so it is NON-DORMANT — unlike apps/site/test/**, whose runner
// (test/site-honesty.test.ts) lives at the repo root and is never exported, which is why apps/site/test/**
// is dropped as a dormant guard (DORMANT_APP_TEST). A whole-dir walk would also drag
// apps/harness/tsconfig.json, which the export does not need (the exported root tsconfig.json already
// includes apps/harness/**); package-style keeps the public surface minimal and matches packages/*.
export const APP_PACKAGE_DIRS = ["apps/harness", "apps/sentinel"];
// `enforcement/` (contains lint-model-pinning.sh, English): required by the exported
// g1-controle-generation job (`bash enforcement/lint-model-pinning.sh .`). Confirmed in the whitelist
// by ADR-M004 D7 bis R3 (D7 amended). `apps/site` shipped earlier, so the D7 tolerated-absence
// carve-out is RETIRED: EVERY fixed whitelist entry is now REQUIRED (fail-closed on absence, D7 bis
// R2 — see TOLERATED_ABSENT below).
// `skills` (ADR-M006 D5/M-4): the ClawHub skill artefacts (skills/monark/SKILL.md +
// INTEGRATION.md + LICENSE). Whitelisted AND created in the SAME lot, so this fixed entry is REQUIRED
// (fail-closed on absence, like every other entry below — TOLERATED_ABSENT is empty).
export const WHITELIST_DIRS = ["schemas", "fixtures", "enforcement", "apps/site", "skills"];
export const WHITELIST_FILES = [
  "README.md", "LICENSE", "CONTRIBUTING.md",
  ".github/workflows/ci.yml",
  "eslint.config.mjs", "lint-ratchet.json", "vocab-banned.json",
  "package.json", "package-lock.json", "tsconfig.json",
  // grep-forbidden.d.mts: the type surface of grep-forbidden.mjs. Required since ADR-M005 D10/Q-A exports
  // apps/harness, whose registry.test.ts imports `../../../scripts/grep-forbidden.mjs`; without the .d.mts
  // the exported `tsc --noEmit` reds TS7016 (measured, H4). It declares only pure functions (English).
  "scripts/grep-forbidden.mjs", "scripts/grep-forbidden.d.mts", "scripts/lint-ratchet.mjs",
  "scripts/export-public.mjs", "scripts/lang-gate.mjs", "scripts/lang-exempt.json",
  // The Narabi F2-B out-of-tool method (ADR-M008 Amendement bis, C-18): publish HOW the USDe series was
  // acquired and how the committed scores/digest are reproduced, so PROVENANCE-usde.md §6 "Reproduce" is not
  // hollow in public. Read-only public RPC, no key; English, no forbidden vocab (lang:gate + gate:vocab clean).
  "scripts/usde-full-pull.mjs", "scripts/record-usde-calib.mjs",
  // ADR-M004 D7 addendum (2026-09-06): the four rendered atelier demo files scanned by
  // atelier_no_network. They live at the package ROOT (outside src/), so PACKAGE_SUBPATHS does not
  // cover them; without them the exported atelier surface is < 8 and the test reds. To be
  // translated later.
  "packages/atelier/index.html", "packages/atelier/main.js",
  "packages/atelier/style.css", "packages/atelier/serve.js",
  // Community-facing public assets at stable raw URLs (ADR-M004 D7 — "adding a name = this ADR line").
  // out/mint.txt is the token contract address the community links to (documented since the initial
  // publish); out/logo.png is the published logo. They pre-exist on the mirror; whitelisting them makes the
  // private repo their single source of truth so a full-replace sync PRESERVES them instead of deleting them
  // (community request: never drop the CA). Binary/plain — not language-scanned; pinned by test/token-ca-pinned.
  // out/banner.jpg is the README hero banner (investor ruling 2026-09-16; see JOURNAL-PROVENANCE) — an image,
  // outside the text vocab gate by nature.
  "out/mint.txt", "out/logo.png", "out/banner.jpg",
];

// ADR-M004 D7 bis R2(a): every fixed whitelist entry (dir or file) MUST exist under the export root or
// the export/check FAILS CLOSED (exit 1). There is now NO tolerated absence: apps/site shipped in Lot
// F-1, so its D7 carve-out is retired and the set is EMPTY (the mechanism is kept so a future carve-out
// can be reinstated by adding its path here). LICENSE is NOT tolerated either — while the license
// choice (D7 bis Q4) is open, LICENSE is absent and the real export deliberately fails.
// PACKAGE_SUBPATHS stay optional per package (a package may legitimately lack a test/ dir).
export const TOLERATED_ABSENT = new Set();

// ---- 2. STRUCTURAL BLACKLIST (defense in depth behind the whitelist) ----------------------
export const STRUCTURAL_BLACKLIST = [
  /^docs\/adr\//,
  /^docs\/G1-/, /^docs\/G2-/, /^docs\/G7-/,
  /^docs\/CHECKPOINT/,
  /^docs\/AUDIT-ENTREE\.md$/,
  /^docs\/JOURNAL-PROVENANCE\.md$/,
  /^docs\/R-P1-/,
  /^packages\/[^/]+\/docs\//, // packages/*/docs/ — incl. packages/hikae/docs/S2-* (D7)
];

const toPosix = (p) => p.replace(/\\/g, "/");

// ---- 2d. DORMANT app-internal test exclusion (F-1 G2 O1) -----------------------------------
// apps/site/test/** is the honesty-lint DETECTOR + its closed exempt list. NOTHING in the public export
// imports it: its runner test/site-honesty.test.ts lives at the repo ROOT (not whitelisted, so never
// exported), and the exported `npm run ci` test glob is test/*.test.ts + packages/*/test/*.test.ts, which
// never reaches apps/site/test/. Shipping it would plant a DORMANT guard in the public repo. This is a
// SILENT, NON-FATAL skip (not a structural violation), and is DISTINCT from the config-driven governance
// `excluded_tests` (scripts/export-exclude-tests.json) that test 42(d) asserts equals its committed config.
export const DORMANT_APP_TEST = /^apps\/site\/test\//;

// ---- 2b. GOVERNANCE-ONLY TEST EXCLUSIONS (ADR-M004 D7 addendum, 2026-09-06) ----------------
// A CLOSED, committed list of test files that must NOT be exported because they read files the
// public export deliberately omits (initially packages/hikae/test/s2.test.ts, whose
// s2_report_reproducible regenerates packages/hikae/docs/S2-RAPPORT-*.md — a French report
// excluded by D7). FAIL-CLOSED: a missing / unparseable list, or one whose `tests` is not an
// array, ABORTS the export (exit 1) — never a silent empty exclusion. An empty `tests` array IS
// valid (nothing is excluded; the formed pending is that E-hikae empties it once s2-report.mjs is
// English). The manifest records the tests actually excluded under `excluded_tests`.
export const EXCLUDE_TESTS_FILE = "scripts/export-exclude-tests.json";

export function loadExcludedTests(root) {
  const abs = join(root, EXCLUDE_TESTS_FILE);
  let raw;
  try {
    raw = JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    console.error(`export FAILED — ${EXCLUDE_TESTS_FILE} is missing or unparseable (fail-closed, D7 addendum): ${e.message}`);
    process.exit(1);
  }
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.tests)) {
    console.error(`export FAILED — ${EXCLUDE_TESTS_FILE} must be an object with a "tests" array (fail-closed, D7 addendum).`);
    process.exit(1);
  }
  return raw.tests.map(toPosix);
}

// Directory names NEVER copied to the public export: installed deps and build output. Added by Lot
// F-public for apps/site (Next.js). A committed working tree lacks them, but a local `npm install` /
// `next build` creates node_modules/.next/.turbo, and the whole-tree copy exercised by test 42 would
// otherwise walk them into the manifest. Skipping is defense in depth; git-tracking is the real source.
export const WALK_SKIP_DIRS = new Set(["node_modules", ".next", ".turbo"]);

// ---- 2c. GENERATED-FILE EXCLUSION under apps/site (F-1 G2 O2) --------------
// Item 3b offered a git-tracked-only walk as an alternative. A LITERAL git filter is NOT usable here,
// MEASURED on this tree (2026-09-07): (1) the apps/site tree is UNCOMMITTED, so `git ls-files apps/site`
// returns 0 files and a tracked-only walk would drop the whole app; (2) test 42 runs the COPIED script
// with cwd in os.tmpdir() and `.git` stripped by cpSync, so any `git` subprocess fatals (or, worse,
// resolves to an unrelated parent repo). So we take the SECOND sanctioned option — filter out gitignored
// files — by PARSING the .gitignore that IS copied into the export root, git-independently. This drops the
// generated, gitignored next-env.d.ts (and any future generated FILE a .gitignore line names); generated
// DIRS (.next/.turbo/node_modules) stay covered by WALK_SKIP_DIRS. Bounded to apps/site (item 3b: keep the
// change local so no other whitelist dir is perturbed).
// Supported .gitignore subset (a line outside it is SKIPPED — never a silent broad match): a bare
// basename (next-env.d.ts, .DS_Store) and a basename `*` glob (*.tsbuildinfo). Directory ('foo/'),
// path-anchored ('a/b') and negated ('!keep') lines are NOT file-matched here (dirs => WALK_SKIP_DIRS).
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function appIgnoredFileMatcher(root) {
  const abs = join(root, ".gitignore");
  const names = new Set();
  const globs = [];
  if (existsSync(abs)) {
    for (const raw of readFileSync(abs, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#") || line.startsWith("!")) continue;
      if (line.endsWith("/") || line.includes("/")) continue; // dir / path-anchored: not a basename file rule
      if (line.includes("*")) globs.push(new RegExp("^" + line.split("*").map(reEsc).join("[^/]*") + "$"));
      else names.add(line);
    }
  }
  return (name) => names.has(name) || globs.some((g) => g.test(name));
}

function walkFiles(absDir, relDir, out, skipFile) {
  for (const name of readdirSync(absDir)) {
    if (WALK_SKIP_DIRS.has(name)) continue; // F-public: never export node_modules/.next/.turbo
    const abs = join(absDir, name);
    const rel = relDir ? `${relDir}/${name}` : name;
    if (statSync(abs).isDirectory()) walkFiles(abs, rel, out, skipFile);
    else if (!skipFile || !skipFile(name)) out.push({ abs, rel: toPosix(rel) }); // F-1 G2 O2: drop gitignored files
  }
}

/** Resolve the whitelist to concrete files under root; classify structural violations & French .md. */
export function collectFiles(root) {
  const excludedTestPaths = new Set(loadExcludedTests(root)); // fail-closed (D7 addendum)
  const candidates = [];
  const seen = new Set();
  const missingRequired = []; // D7 bis R2(a): fixed whitelist entries absent (and not tolerated).
  const ignoreAppFile = appIgnoredFileMatcher(root); // F-1 G2 O2: gitignored FILES under apps/site (next-env.d.ts, ...)
  const addFile = (rel) => {
    const abs = join(root, rel);
    if (existsSync(abs) && statSync(abs).isFile() && !seen.has(rel)) { seen.add(rel); candidates.push({ abs, rel }); }
  };
  const addDir = (rel, skipFile) => {
    const abs = join(root, rel);
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      const acc = [];
      walkFiles(abs, rel, acc, skipFile);
      for (const f of acc) if (!seen.has(f.rel)) { seen.add(f.rel); candidates.push(f); }
    }
  };
  // packages/*
  const pkgRoot = join(root, "packages");
  if (existsSync(pkgRoot)) {
    for (const pkg of readdirSync(pkgRoot)) {
      if (!statSync(join(pkgRoot, pkg)).isDirectory()) continue;
      for (const sub of PACKAGE_SUBPATHS) {
        const rel = `packages/${pkg}/${sub}`;
        const abs = join(root, rel);
        if (!existsSync(abs)) continue;
        if (statSync(abs).isDirectory()) addDir(rel);
        else addFile(rel);
      }
    }
  }
  // apps/* exported PACKAGE-STYLE (ADR-M005 D10 / D16, Q-A): the same four PACKAGE_SUBPATHS as a package.
  // Silent-skip an absent subpath (an app may legitimately lack a test/ dir), exactly like packages/* above.
  for (const app of APP_PACKAGE_DIRS) {
    for (const sub of PACKAGE_SUBPATHS) {
      const rel = `${app}/${sub}`;
      const abs = join(root, rel);
      if (!existsSync(abs)) continue;
      if (statSync(abs).isDirectory()) addDir(rel);
      else addFile(rel);
    }
  }
  // Fixed whitelist — FAIL CLOSED on a missing required entry (D7 bis R2(a)); no dir is tolerated absent
  // now that apps/site ships (F-1). addDir/addFile stay silent-skip for the per-package (optional) paths above.
  for (const d of WHITELIST_DIRS) {
    const abs = join(root, d);
    // F-1 G2 O2: only apps/site gets the gitignored-file filter (item 3b: bounded there, no side effects).
    if (existsSync(abs) && statSync(abs).isDirectory()) addDir(d, d === "apps/site" ? ignoreAppFile : undefined);
    else if (!TOLERATED_ABSENT.has(d)) missingRequired.push(d);
  }
  for (const f of WHITELIST_FILES) {
    const abs = join(root, f);
    if (existsSync(abs) && statSync(abs).isFile()) addFile(f);
    else if (!TOLERATED_ABSENT.has(f)) missingRequired.push(f);
  }

  // classify — ORDER IS LOAD-BEARING (ADR-M004 D7 bis R4). The structural governance blacklist is
  // evaluated FIRST and is FAIL-CLOSED (a hit aborts the whole export in doExport). The French-.md rule
  // is a REPORTED, NON-FATAL exclusion and MUST stay AFTER it: were the French rule first, a French
  // governance file slipped into the whitelist (finding MINE-B) would be SILENTLY dropped by the
  // language rule instead of triggering the hard blacklist failure. Test 42(g) / mutant M6 proves it.
  const { maskers, pathMatchers } = loadExempt(root);
  const structuralViolations = [];
  const frenchMd = [];
  const excludedTests = [];
  const dormantAppTests = []; // F-1 G2 O1: apps/site/test/** dropped (dormant detector), reported not fatal
  const kept = [];
  for (const c of candidates) {
    if (STRUCTURAL_BLACKLIST.some((re) => re.test(c.rel))) { structuralViolations.push(c.rel); continue; } // (1) fail-closed, FIRST
    if (excludedTestPaths.has(c.rel)) { excludedTests.push(c.rel); continue; } // (2) governance-only test (D7 addendum)
    if (DORMANT_APP_TEST.test(c.rel)) { dormantAppTests.push(c.rel); continue; } // (2b) F-1 G2 O1: dormant honesty-lint detector, silent skip
    if (c.rel.toLowerCase().endsWith(".md") && isFileFrench(c.abs, maskers)) { frenchMd.push(c.rel); continue; } // (3) French .md, reported
    kept.push(c);
  }
  kept.sort((a, b) => (a.rel < b.rel ? -1 : 1));
  excludedTests.sort((a, b) => (a < b ? -1 : 1));
  dormantAppTests.sort((a, b) => (a < b ? -1 : 1));
  missingRequired.sort((a, b) => (a < b ? -1 : 1));
  return { kept, structuralViolations, frenchMd, excludedTests, dormantAppTests, missingRequired, maskers, pathMatchers };
}

function sha256(abs) {
  const buf = readFileSync(abs);
  return { sha256: createHash("sha256").update(buf).digest("hex"), bytes: buf.length };
}

// ---- 3. DERIVE THE PUBLIC CI WORKFLOW (ADR-M004 D7 bis R1) ----------------------------------
// The internal .github/workflows/ci.yml runs on `pull_request` only and carries the
// `r25-taille-de-lot` lot-size gate. Neither fits the public storefront, which D7 populates with one
// commit per export on a fresh history: a push must run the gates (CA-X "CI green remotely"), and lot
// size is an internal concern, not a storefront one. So the export DERIVES the public workflow from
// the internal one by a DETERMINISTIC, dependency-free text rewrite:
//   (1) add a `push` trigger under `on:` (public pushes run the gates);
//   (2) remove the whole `r25-taille-de-lot` job (its 2-space key line up to the next 2-space job key);
//   (3) prepend a one-line provenance header;
//   (4) drop the 2-line governance "Delivery flow" comment (it is FALSE in the public workflow and is
//       the sole other "r25" mention — see the inline note; error_origin = internal).
// The JOBS stay BYTE-IDENTICAL: the pinned action SHAs and the "every job blocking, no
// continue-on-error" invariant carry over untouched. FAIL-CLOSED (exit 1) if the `on:` block or the r25
// job are not found — a silent verbatim copy would ship the governance-only gate and mask the drift,
// which test 42(f) / mutant M5 (short-circuited derivation) catches.
export const CI_WORKFLOW_PATH = ".github/workflows/ci.yml";
export const DERIVED_HEADER =
  "# Derived by scripts/export-public.mjs from the internal workflow (ADR-M004 D7 bis): lot-size gate removed, push trigger added.";

export function derivePublicWorkflow(raw) {
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  // (1) push trigger under `on:` (governance file has `on:` then a 2-space `pull_request:`).
  const onNeedle = `on:${eol}  pull_request:`;
  if (!raw.includes(onNeedle)) {
    console.error(`export FAILED — ${CI_WORKFLOW_PATH}: the expected on / pull_request trigger block was not found (fail-closed, D7 bis R1).`);
    process.exit(1);
  }
  let out = raw.replace(onNeedle, `on:${eol}  push:${eol}  pull_request:`);
  // (2) remove the `r25-taille-de-lot` job: its 2-space-indented key line up to (not including) the next
  //     2-space-indented job key. All r25 body lines are >= 4 spaces, so /^ {2}\S/ first re-matches at
  //     the following job (g3-verification), never inside the job body.
  const lines = out.split(eol);
  const start = lines.findIndex((l) => l === "  r25-taille-de-lot:");
  if (start === -1) {
    console.error(`export FAILED — ${CI_WORKFLOW_PATH}: the internal lot-size gate job was not found (fail-closed, D7 bis R1).`);
    process.exit(1);
  }
  let end = start + 1;
  while (end < lines.length && !/^ {2}\S/.test(lines[end])) end++;
  lines.splice(start, end - start);
  // (4) drop the governance-only "Delivery flow" comment pair (source lines 11-12). It is FALSE in the
  //     public workflow (a push DOES run now; there is no r25) and would contradict the header prepended
  //     below; it is also the sole surviving "r25" mention, so removing it makes `grep -c r25` = 0 (D7 bis
  //     oracle). Anchored on the unique ASCII prefixes (line 12 carries an em-dash; a full === would be
  //     codepoint-fragile). Remove-if-present, NOT fail-closed. error_origin = internal: the D7 bis
  //     oracle `grep -c r25 = 0` and the "byte-identical rest" method text collide because the method
  //     overlooked this comment (adjudicated 2026-09-06).
  const dfi = lines.findIndex(
    (l, i) =>
      l.startsWith("# Delivery flow (ADR-M003 D9 bis):") &&
      (lines[i + 1] ?? "").startsWith("# A direct push produces no run"),
  );
  if (dfi !== -1) lines.splice(dfi, 2);
  out = lines.join(eol);
  // (3) provenance header on top; the JOBS below (pinned SHAs, no continue-on-error) are byte-identical.
  return `${DERIVED_HEADER}${eol}${out}`;
}

// ---- WRITE mode ---------------------------------------------------------------------------
function doExport(root, outDir) {
  const { kept, structuralViolations, frenchMd, excludedTests, dormantAppTests, missingRequired } = collectFiles(root);
  if (structuralViolations.length) {
    console.error("export FAILED — the whitelist selected forbidden path(s) (blacklist, D7):");
    for (const r of structuralViolations) console.error(`  ${r}`);
    process.exit(1);
  }
  if (missingRequired.length) {
    console.error("export FAILED — required whitelist entr(ies) missing (fail-closed, D7 bis R2; no entry is tolerated absent since F-1 shipped apps/site):");
    for (const r of missingRequired) console.error(`  ${r}`);
    process.exit(1);
  }
  // Derive the public CI workflow up-front so a bad workflow fails CLOSED before anything is written
  // (D7 bis R1). Only .github/workflows/ci.yml is transformed; every other kept file is copied verbatim.
  const derived = new Map();
  const ciEntry = kept.find((f) => f.rel === CI_WORKFLOW_PATH);
  if (ciEntry) derived.set(CI_WORKFLOW_PATH, derivePublicWorkflow(readFileSync(ciEntry.abs, "utf8")));
  if (existsSync(outDir)) {
    if (readdirSync(outDir).length > 0) {
      console.error(`export FAILED — --out ${outDir} is not empty (stale files would break manifest coherence). Use a fresh directory.`);
      process.exit(1);
    }
  } else {
    mkdirSync(outDir, { recursive: true });
  }
  const files = [];
  for (const f of kept) {
    const dest = join(outDir, f.rel);
    mkdirSync(dirname(dest), { recursive: true });
    if (derived.has(f.rel)) writeFileSync(dest, derived.get(f.rel)); // D7 bis R1: transformed workflow
    else copyFileSync(f.abs, dest);
    const { sha256: hash, bytes } = sha256(dest);
    files.push({ path: f.rel, sha256: hash, bytes });
  }
  files.sort((a, b) => (a.path < b.path ? -1 : 1));
  const manifest = { files, excluded_tests: excludedTests };
  writeFileSync(join(outDir, "EXPORT-MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`export OK — ${files.length} file(s) -> ${outDir}`);
  if (excludedTests.length) {
    console.log(`  excluded ${excludedTests.length} governance-only test(s) (D7 addendum; see ${EXCLUDE_TESTS_FILE}):`);
    for (const r of excludedTests) console.log(`    - ${r}`);
  }
  if (frenchMd.length) {
    console.log(`  excluded ${frenchMd.length} French .md (D7 French-.md rule; translate in the E-* lots):`);
    for (const r of frenchMd) console.log(`    - ${r}`);
  }
  if (dormantAppTests.length) {
    console.log(`  excluded ${dormantAppTests.length} dormant apps/site test file(s) (F-1 G2 O1; not imported by any exported test):`);
    for (const r of dormantAppTests) console.log(`    - ${r}`);
  }
  console.log("  EXPORT-MANIFEST.json written (files[].{path,sha256,bytes}, excluded_tests[]).");
}

// ---- CHECK mode ---------------------------------------------------------------------------
function doCheck(root, selectedScopes) {
  const { kept, structuralViolations, frenchMd, missingRequired, maskers, pathMatchers } = collectFiles(root);
  let bad = false;
  if (structuralViolations.length) {
    console.error("check FAILED — the whitelist would include forbidden path(s) (blacklist, D7):");
    for (const r of structuralViolations) console.error(`  ${r}`);
    bad = true;
  }
  if (missingRequired.length) {
    console.error("check FAILED — required whitelist entr(ies) missing (fail-closed, D7 bis R2; no entry is tolerated absent since F-1 shipped apps/site):");
    for (const r of missingRequired) console.error(`  ${r}`);
    bad = true;
  }
  // R1: exercise the workflow derivation so --check fails CLOSED on a workflow the real export could not
  // derive (D7 bis R1). Result discarded; derivePublicWorkflow exits 1 on a missing on:/r25 block — a
  // --check that stayed green while the real export exits 1 would be a fail-open (the R2(a) failure class).
  const ciEntry = kept.find((f) => f.rel === CI_WORKFLOW_PATH);
  if (ciEntry) derivePublicWorkflow(readFileSync(ciEntry.abs, "utf8"));
  const byScope = Object.fromEntries(SCOPES.map((s) => [s, { files: 0, hits: 0 }]));
  const printed = [];
  for (const f of kept) {
    if (!scannable(f.rel)) continue;
    if (pathExempt(f.rel, pathMatchers)) continue; // whole-file path exemption (lang-exempt.json "paths") — mirror lang-gate scanFileList; the s3-binance Shogen fixtures are verbatim third-party evidence (investor ruling 2026-09-16)
    const hits = scanFile(f.abs, maskers);
    if (!hits.length) continue;
    const scope = classifyScope(f.rel);
    byScope[scope].files += 1;
    byScope[scope].hits += hits.length;
    if (selectedScopes.includes(scope)) for (const h of hits) printed.push(`${f.rel}:${h.line}:${h.col}  [${h.kind}]  ${h.word}`);
  }
  for (const line of printed) console.log(line);
  console.log("\nexport:check — language hits per scope (non-exempt):");
  for (const s of SCOPES) {
    const flag = selectedScopes.includes(s) ? "GATED" : "count";
    console.log(`  ${s.padEnd(9)} ${String(byScope[s].hits).padStart(5)} hit(s) in ${byScope[s].files} file(s)  [${flag}]`);
  }
  if (frenchMd.length) console.log(`\n  (info) ${frenchMd.length} French .md would be excluded from the copy: ${frenchMd.join(", ")}`);
  const langBad = selectedScopes.reduce((n, s) => n + byScope[s].hits, 0);
  if (langBad > 0) { console.error(`\ncheck FAILED — ${langBad} non-exempt French hit(s) in scope {${selectedScopes.join(",")}} (D7 language gate).`); bad = true; }
  if (bad) {
    if (selectedScopes.length < SCOPES.length) console.error("(scoped check: the E-* translation lots are not all done; a GLOBAL check stays RED by design.)");
    process.exit(1);
  }
  console.log(`\ncheck OK — 0 forbidden path, 0 non-exempt French hit in scope {${selectedScopes.join(",")}}.`);
  process.exit(0);
}

function parseArgs(argv) {
  const a = { out: null, check: false, scope: null };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--out") a.out = argv[++i];
    else if (t === "--check") a.check = true;
    else if (t === "--scope") a.scope = argv[++i];
  }
  return a;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const selected = args.scope ? args.scope.split(",").map((s) => s.trim()).filter(Boolean) : SCOPES.slice();
  for (const s of selected) if (!SCOPES.includes(s)) { console.error(`export: unknown scope '${s}' (known: ${SCOPES.join(",")})`); process.exit(2); }
  if (args.check) { doCheck(REPO_ROOT, selected); return; }
  if (!args.out) { console.error("export: --out <dir> required (or --check)."); process.exit(2); }
  doExport(REPO_ROOT, resolve(args.out));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
