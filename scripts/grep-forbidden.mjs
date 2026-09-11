// MONARK vocabulary gate (ADR-M001 D8, ADR-M002 D0/D1, ADR-M003 D12, PLAN F-2 §6e/§12) —
// "discipline enforced in code". Scans package SOURCE (packages/*/src/**/*.ts), the whole atelier
// package (packages/atelier/**), the whole monark package (packages/monark/**), and the public
// storefront (apps/site/**, rendered surfaces .ts/.tsx/.mdx) for the guarantee/marketing claims
// banned by the 09 discipline. NOT the structural FORBIDDEN_KEYS (closed-check.ts + forbidden-keys.ts).
// Patterns live in ONE place: vocab-banned.json (root). Zero dependencies.
//
// GLOBAL patterns (vocab-banned.json "banned") apply to EVERY scanned file. SCOPED patterns
// (vocab-banned.json "scan.<name>.banned") apply ONLY to that scope's files (naked "Hermes" bounded
// to packages/monark/**; the README-v2 marketing vocab bounded to apps/site/**).
//
// EXEMPT PHRASES (PLAN F-2 §12 errata, Lot F-2b): a scope may carry a CLOSED "exemptPhrases" list of
// honest sentences that legitimately contain an otherwise-banned word — here the fleet-invariant
// negation "no confidence field" (README l.67-71). Those spans are blanked BEFORE matching, scope-
// locally (site only); "high confidence" still reddens. Load-bearing + non-inert proof:
// test/ci-gates.test.ts (imports scanText/compilePatterns without running this CLI).
//
// Usage: node scripts/grep-forbidden.mjs [extra file or dir ...]   (CLI targets = GLOBAL patterns only)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Compile a list of {re, why} vocab rules into {re: RegExp('i'), why}. Pure, no state. */
export function compilePatterns(banned) {
  return (banned ?? []).map(({ re, why }) => ({ re: new RegExp(re, "i"), why }));
}

const escapeLiteral = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Compile a closed exempt-phrase list into one equal-length blanking masker (case-insensitive). */
function compilePhraseMaskers(phrases) {
  const list = (phrases ?? []).filter((p) => typeof p === "string" && p.length > 0);
  if (list.length === 0) return [];
  // Longest-first so a phrase that is a prefix of another cannot partially mask.
  const alt = list.slice().sort((a, b) => b.length - a.length).map(escapeLiteral).join("|");
  return [new RegExp("(" + alt + ")", "gi")];
}

/** Blank every exempt span with equal-length spaces (columns preserved for reporting). */
function maskLine(line, maskers) {
  let out = line;
  for (const re of maskers) {
    re.lastIndex = 0;
    out = out.replace(re, (m) => " ".repeat(m.length));
  }
  return out;
}

/**
 * Scan `text` line-by-line for the compiled vocab `patterns`, AFTER masking the closed
 * `exemptPhrases` (scope-local). Returns one hit {line, why, text} per (line, matching pattern).
 * Pure: no I/O, no process.exit — this is what the tests import.
 */
export function scanText(text, patterns, exemptPhrases = []) {
  const maskers = compilePhraseMaskers(exemptPhrases);
  const out = [];
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const masked = maskLine(lines[i], maskers);
    for (const { re, why } of patterns) {
      if (re.test(masked)) out.push({ line: i + 1, why, text: lines[i] });
    }
  }
  return out;
}

// ---- CLI walk + target assembly (run-guarded main at the bottom) ----------------------------
const DEFAULT_SKIP = new Set(["node_modules", "dist"]);
// The apps/site walk also skips Next build output and non-rendered surfaces (PLAN F-2 C6).
const SITE_SKIP = new Set(["node_modules", "dist", ".next", ".turbo", "test", "data"]);

function walk(dir, exts, skip = DEFAULT_SKIP) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!skip.has(name)) out.push(...walk(p, exts, skip));
    } else if (exts.includes(extname(p))) {
      out.push(p);
    }
  }
  return out;
}

/** Resolve every scan target under `root` to {f, patterns, exemptPhrases}. cliArgs = GLOBAL only. */
function collectTargets(root, config, cliArgs) {
  const GLOBAL = compilePatterns(config.banned);
  const targets = [];
  const add = (files, patterns, exemptPhrases = []) => {
    for (const f of files) targets.push({ f, patterns, exemptPhrases });
  };

  const packagesDir = join(root, "packages");
  const srcExts = config.scan.packages_src.extensions;
  const atelier = config.scan.atelier;
  const monark = config.scan.monark; // may be undefined in older trees
  const MONARK_EXTRA = compilePatterns(monark?.banned);

  for (const pkg of readdirSync(packagesDir)) {
    const pkgDir = join(packagesDir, pkg);
    if (atelier && pkg === atelier.package) {
      try {
        if (statSync(pkgDir).isDirectory()) add(walk(pkgDir, atelier.extensions), GLOBAL);
      } catch {
        /* no atelier package yet */
      }
      continue;
    }
    if (monark && pkg === monark.package) {
      try {
        // WHOLE package (package.json, src, future adapters) — GLOBAL + the monark-scoped ban.
        if (statSync(pkgDir).isDirectory()) add(walk(pkgDir, monark.extensions), [...GLOBAL, ...MONARK_EXTRA]);
      } catch {
        /* no monark package yet */
      }
      continue;
    }
    const srcDir = join(pkgDir, "src");
    try {
      if (statSync(srcDir).isDirectory()) add(walk(srcDir, srcExts), GLOBAL);
    } catch {
      /* no src/ in this package yet */
    }
  }

  // The public storefront apps/site (NOT under packages/) — GLOBAL + site-scoped marketing bans,
  // with the site's closed exemptPhrases masked before matching (PLAN F-2 §6e/§12).
  const site = config.scan.site;
  if (site) {
    const siteDir = join(root, "apps", site.package ?? "site");
    const SITE_EXTRA = compilePatterns(site.banned);
    try {
      if (statSync(siteDir).isDirectory()) {
        // Skip generated *.d.ts (e.g. next-env.d.ts — gitignored, written by `next build`/`next dev`) so the
        // scanned-file count is build-state-independent, aligning with the two twins that already skip them:
        // apps/site/test/honesty-lint.ts (scanAppsSite: `name.endsWith(".d.ts")`) and test/ci-gates.test.ts
        // (the siteSurfaces() callers: `!rel.endsWith(".d.ts")`). A .d.ts carries no rendered vocab.
        const siteFiles = walk(siteDir, site.extensions, SITE_SKIP).filter((f) => !f.endsWith(".d.ts"));
        add(siteFiles, [...GLOBAL, ...SITE_EXTRA], site.exemptPhrases ?? []);
      }
    } catch {
      /* no apps/site yet */
    }
  }

  // The harness apps/harness/src (Lot H1, ADR-M005 D9 / K-3) — GLOBAL + harness-scoped honesty bans.
  // SOURCE only (not test/): a negative-control test may legitimately name a banned token in a fixture.
  const harness = config.scan.harness;
  if (harness) {
    const harnessSrc = join(root, "apps", harness.package ?? "harness", "src");
    const HARNESS_EXTRA = compilePatterns(harness.banned);
    try {
      if (statSync(harnessSrc).isDirectory()) add(walk(harnessSrc, harness.extensions), [...GLOBAL, ...HARNESS_EXTRA]);
    } catch {
      /* no apps/harness/src yet */
    }
  }

  // The ClawHub skill artefacts under skills/ (Lot M006-B, ADR-M006 D2/D5) — GLOBAL + skills-scoped
  // honesty/securities bans, with the skill scope's closed exemptPhrases masked before matching (same
  // closed-list mechanism as the site scope). Not under packages/ or apps/, so it is a top-level walk.
  const skills = config.scan.skills;
  if (skills) {
    const skillsDir = join(root, "skills");
    const SKILLS_EXTRA = compilePatterns(skills.banned);
    try {
      if (statSync(skillsDir).isDirectory()) add(walk(skillsDir, skills.extensions), [...GLOBAL, ...SKILLS_EXTRA], skills.exemptPhrases ?? []);
    } catch {
      /* no skills/ yet */
    }
  }

  // Extra targets from the command line (tests use this on temp files) — GLOBAL patterns only.
  for (const arg of cliArgs) {
    const p = resolve(arg);
    const st = statSync(p);
    if (st.isDirectory()) add(walk(p, [...srcExts, ...atelier.extensions]), GLOBAL);
    else add([p], GLOBAL);
  }
  return targets;
}

function main() {
  const config = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8"));
  const targets = collectTargets(ROOT, config, process.argv.slice(2));

  let hits = 0;
  for (const { f, patterns, exemptPhrases } of targets) {
    for (const { line, why, text } of scanText(readFileSync(f, "utf8"), patterns, exemptPhrases)) {
      hits++;
      console.error(`FORBIDDEN VOCAB: ${f}:${line}  ${why}`);
      console.error(`  > ${text.trim()}`);
    }
  }

  if (hits > 0) {
    console.error(`\ngate:vocab FAILED — ${hits} forbidden claim(s) (ADR-M001 D8, 09 discipline).`);
    process.exit(1);
  }
  console.log(`gate:vocab OK — scanned ${targets.length} file(s), no forbidden claim.`);
}

// Run-guard: execute the CLI only when invoked directly (node scripts/grep-forbidden.mjs ...), NOT
// when imported by a test. Mirrors scripts/lang-gate.mjs / scripts/export-public.mjs.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
