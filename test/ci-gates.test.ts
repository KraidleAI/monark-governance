/**
 * Root test `ci_gates_blocking_no_continue_on_error` (test 38, ADR-M003 D11, Lot V).
 * Non-LLM oracle over the instantiated workflow `.github/workflows/ci.yml`: it MUST stay
 * blocking end-to-end and pinned. The test reads the file as text (no `act` run
 * required, D1) and fails if:
 *   (1) a `continue-on-error` appears (a job would stop being blocking);
 *   (2) a `uses:` action is not pinned by a 40-hex commit SHA (movable tag);
 *   (3) `VIBEGATES_PR_LIMIT` != "1205" (bound ADR-M003 D9);
 *   (4) the exclusion pathspec for generated S2 artefacts is missing from the R-25 count;
 *   (5) the `on:` trigger does not carry `pull_request` (delivery by PR — ADR-M003 D9 addendum 2026-09-05);
 *   (6) job g4 does not run the ratchet `npm run lint:ratchet` (ADR-M003 D9 ter §3, 2026-09-06).
 *   (4bis) the G1/G2 governance reports are not excluded from the R-25 count (D9 quater);
 *   (7) job g4 does not literally carry `run: npm run lint && npm run lint:ratchet` (D9 quater).
 * Named mutant (G2 review): `continue-on-error: true` inserted => red; byte-exact
 * restoration (sha256 before/after) recorded in docs/G1-lot-V.md.
 * Run by `npm test` in each worktree (outside per-lot counting).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, extname, dirname, basename } from "node:path";
import ts from "typescript";
import { compilePatterns, scanText, collectTargets } from "../scripts/grep-forbidden.mjs";
import { renderedTexts, scanText as scanNumericText, loadExemptFile, scanAppsSite } from "../apps/site/test/honesty-lint.ts";
import { FLEET_AGENTS, PRODUCTS } from "../apps/site/lib/fleet.ts";
import type { FleetStatus } from "../apps/site/lib/fleet.ts";
import type { AgentStatus } from "../apps/site/lib/status.ts";
import { loadGateEnums } from "../apps/site/lib/gate-enums.ts";
import { ACTION_COMMIT, ACTION_DEFER, ACTION_ABSTAIN, SENSOR_NODES, AMBIENT, decide, fresh, CAVEAT, gateJson, push } from "../apps/site/lib/sim.ts";
import { AGENTS_PRESENTATION } from "../apps/site/lib/agents-presentation.ts";
import { PICKER_PROFILES } from "../apps/site/lib/profiles.ts";
import { OUTCOMES, REGION_KINDS, REASON_GLOSS } from "../apps/site/lib/how-copy.ts";

const ROOT = join(import.meta.dirname, "..");
const WF = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
const LINES = WF.split(/\r?\n/);

test("ci_gates_blocking_no_continue_on_error — blocking and pinned workflow (test 38)", () => {
  // (1) template invariant: no continue-on-error DIRECTIVE (a YAML key on a
  //     non-comment line). A prose mention in a comment is allowed (the template itself
  //     writes "No continue-on-error"); it is the `continue-on-error:` key that would unblock a job.
  const coeDirective = LINES.some((l) => /^\s*continue-on-error\s*:/.test(l));
  assert.ok(!coeDirective, "continue-on-error directive present: a job would stop being blocking");

  // (2) every `uses:` action pinned by a 40-hex commit SHA (comment lines ignored).
  const usesRefs: string[] = [];
  for (const l of LINES) {
    if (/^\s*#/.test(l)) continue;
    const m = /^\s*-?\s*uses:\s*(\S+)/.exec(l);
    if (m && m[1]) usesRefs.push(m[1]);
  }
  assert.ok(usesRefs.length >= 2, `expected at least 2 uses: actions, saw ${usesRefs.length}`);
  for (const u of usesRefs) {
    const at = u.lastIndexOf("@");
    assert.notEqual(at, -1, `uses: not pinned (no @): ${u}`);
    const ref = u.slice(at + 1);
    assert.match(ref, /^[0-9a-f]{40}$/, `uses: not pinned by a 40-hex commit SHA: ${u}`);
  }

  // (3) VIBEGATES_PR_LIMIT set to "1205" (ADR-M003 D9) — and to nothing else.
  const limits: string[] = [];
  for (const m of WF.matchAll(/VIBEGATES_PR_LIMIT\s*:\s*["']?([^"'\s#]+)["']?/g)) {
    if (m[1]) limits.push(m[1]);
  }
  assert.ok(limits.length >= 1, "VIBEGATES_PR_LIMIT missing from the workflow (fail-closed not configured)");
  for (const v of limits) assert.equal(v, "1205", `VIBEGATES_PR_LIMIT = ${v} != 1205 (ADR-M003 D9)`);

  // (4) exclusion pathspec for generated S2 artefacts present in the R-25 count (ADR-M003 D9).
  assert.ok(
    WF.includes(":(exclude)packages/*/docs/S2-*"),
    "S2 exclusion pathspec missing from the R-25 count (lot H would overflow because of the TSV journal)",
  );
  // (4bis) G1/G2 governance reports excluded from the R-25 count (ADR-M003 D9 quater, 2026-09-06:
  //        measured 1311 > 1205 with the reports, 621 code only).
  for (const ps of [":(exclude)docs/G1-lot-*.md", ":(exclude)docs/G2-lot-*.md"]) {
    assert.ok(WF.includes(ps), `pathspec ${ps} missing from the R-25 count (ADR-M003 D9 quater)`);
  }

  // (5) delivery by PR (ADR-M003 D9 addendum 2026-09-05, option c): the workflow MUST trigger
  //     on pull_request. Block-scoped on the top-level key `on:` (lines indented up to the
  //     next column-0 key), end-of-line comments stripped: the header comment that
  //     cites "pull_request" must NOT mask a mutant that removes the real trigger.
  const onIdx = LINES.findIndex((l) => /^on\s*:/.test(l));
  assert.notEqual(onIdx, -1, "top-level key 'on:' missing from the workflow");
  const onBlock = [LINES[onIdx]!.replace(/#.*$/, "")];
  for (let i = onIdx + 1; i < LINES.length; i++) {
    if (/^\S/.test(LINES[i]!) && !/^\s*#/.test(LINES[i]!)) break; // next top-level key
    onBlock.push(LINES[i]!.replace(/#.*$/, ""));
  }
  assert.match(
    onBlock.join("\n"),
    /\bpull_request\b/,
    "the workflow must trigger on pull_request (delivery by PR; ADR-M003 D9 addendum)",
  );

  // (6) the test-debt ratchet (lint:ratchet) is wired INSIDE job g4 (ADR-M003 D9 ter §3).
  //     Block-scoped on the job key `g4-architecture:` (2-space indent), end-of-line
  //     comments stripped: moving `lint:ratchet` out of g4 (another job) or into a comment reddens it.
  const g4Idx = LINES.findIndex((l) => /^  g4-architecture\s*:/.test(l));
  assert.notEqual(g4Idx, -1, "job 'g4-architecture' missing from the workflow");
  const g4Block: string[] = [];
  for (let i = g4Idx + 1; i < LINES.length; i++) {
    if (/^  \S/.test(LINES[i]!) || /^\S/.test(LINES[i]!)) break; // next job key (2 spaces) or root key (0)
    g4Block.push(LINES[i]!.replace(/#.*$/, ""));
  }
  assert.match(
    g4Block.join("\n"),
    /npm run lint:ratchet/,
    "job g4 must run the ratchet `npm run lint:ratchet` (ADR-M003 D9 ter §3)",
  );
  // (7) lint AND ratchet, both blocking, chained by `&&` (ADR-M003 D9 quater, G2 reservation 3:
  //     a `||` or removing `npm run lint` left (6) green).
  assert.ok(
    g4Block.some((l) => /^\s*run:\s*npm run lint && npm run lint:ratchet\s*$/.test(l)),
    "job g4 must literally contain `run: npm run lint && npm run lint:ratchet` (ADR-M003 D9 quater)",
  );
});

// Lot V support (ADR-M003 D12) — the naked Hermes pattern of the monark scope is present and discriminating.
// Unnumbered (D11 is a closed list): a regression lock so that the clawpump-hermes reformulation
// does not drift silently. The end-to-end execution proof (grep of the gate
// on mutant/counter-mutant) is in docs/G1-lot-V.md.
test("vocab_monark_scope_bans_naked_hermes — naked Hermes reddens, pyth-/clawpump- exempted (ADR-M003 D12)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8"));
  const monark = cfg.scan.monark;
  assert.ok(monark, "scope 'monark' missing from vocab-banned.json");
  assert.equal(monark.package, "monark");
  const entry = monark.banned.find((b: { re: string }) => /Hermes/.test(b.re));
  assert.ok(entry, "Hermes pattern missing from the monark scope");
  const re = new RegExp(entry.re, "i");
  assert.ok(re.test("the tokenised agent + Hermes harness wiring"), "naked Hermes must redden");
  assert.ok(re.test("UsePod/Hermes"), "naked Hermes (after slash) must redden");
  assert.ok(!re.test("the tokenised agent + clawpump-hermes harness wiring"), "clawpump-hermes must stay green");
  assert.ok(!re.test("pyth-hermes prices"), "pyth-hermes must stay green");
});

// ADR-M008 D5 (« mutant surclaim ⇒ ROUGE ») — the Narabi peg-score / p_depeg patterns are present in BOTH
// the monark and harness scopes AND discriminating: a naked surclaim reddens, the honest negation stays
// green. Without this, deleting the patterns would redden no test (the G2 R2 gap). Uses the REAL gate
// functions (compilePatterns/scanText) without executing the CLI.
test("vocab_narabi_scopes_ban_peg_score_and_p_depeg — naked surclaim reddens, negation green (ADR-M008 D5)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: Record<string, { banned?: { re: string; why: string }[] } | undefined>;
  };
  for (const scopeName of ["monark", "harness"] as const) {
    const scope = cfg.scan[scopeName];
    assert.ok(scope, `scope '${scopeName}' missing from vocab-banned.json`);
    const patterns = compilePatterns(scope.banned);
    // (a) MUTANT — a naked peg-score / p_depeg surclaim reddens.
    assert.ok(scanText("the sensor emits a peg score of 0.9", patterns).length >= 1, `(a) naked "peg score" must redden the ${scopeName} scope`);
    assert.ok(scanText("field p_depeg carries the estimate", patterns).length >= 1, `(a) "p_depeg" must redden the ${scopeName} scope`);
    // (b) the honest negation stays green (NARABI_LABEL's "not a peg score", and "no peg score").
    assert.deepEqual(scanText("velocity forecast under coverage, not a peg score, not advice", patterns), [], `(b) "not a peg score" must stay green in the ${scopeName} scope`);
    assert.deepEqual(scanText("no peg score is emitted", patterns), [], `(b) "no peg score" must stay green in the ${scopeName} scope`);
  }
});

// ADR-M012 D8 (C-3) — the adaptive-surclaim patterns are present in the site, harness, skills AND narabi_docs scopes (narabi_docs enforces AC-5 on README, C-4) and
// discriminating: "adaptive coverage" / "the gate adapts" / "adaptively covers" redden, while the EXACT
// ADR-M012 D8 public sentence stays green with NO exemption. WORKER DEVIATION (ADR-M012 D8 asked for an
// exemptPhrases entry = the D8 sentence): it is NOT added, because (i) the sentence dodges both patterns by
// construction (measured: 0 match), so the entry would be inert, and (ii) an inert entry in site.exemptPhrases
// would FAIL the vocab_site_confidence_exemption non-inert guard (it has no rendered apps/site carrier), and
// the harness scope does not even consume exemptPhrases (grep-forbidden.mjs add() passes none). The stronger
// property is asserted directly: the D8 sentence is green with an EMPTY exemption list, in all three scopes.
// Uses the REAL gate functions (compilePatterns/scanText) without executing the CLI (run-guarded).
test("vocab_adaptive_coverage_reddens — adaptive surclaim reddens site/harness/skills/narabi_docs/sentinel; the exact D8 sentence green, no exemption (ADR-M012 D8)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: Record<string, { banned?: { re: string; why: string }[] } | undefined>;
  };
  // The EXACT ADR-M012 D8 public sentence (verbatim English; straight apostrophes, en-dash author names).
  const D8_SENTENCE =
    "Narabi runs an adaptive quantile tracker (Angelopoulos–Barber–Bates 2024, decaying step) on the attested " +
    "daily USDe redemption flow: its state moves each 24h window from the realized outcome, and the full " +
    "timeline is published so anyone can replay it. What it carries is a deterministic long-run bound that " +
    "tightens as windows accumulate, printed daily with T, not a per-window coverage, not a probability; the " +
    "gate's committed calibration does not depend on the tracker state. Until the pre-registered drift " +
    "criterion fires and an ADR says otherwise, the gate's region is still the committed static calibration: " +
    "the tracker adapts, the gate does not yet.";
  const MUTANTS = ["adaptive coverage", "the gate adapts", "adaptively covers"];
  for (const scopeName of ["site", "harness", "skills", "narabi_docs", "sentinel"] as const) {
    const scope = cfg.scan[scopeName];
    assert.ok(scope && scope.banned, `scope '${scopeName}' missing from vocab-banned.json`);
    // Both ADR-M012 D8 patterns are present (a deletion also reds the load-bearing check below).
    const adaptive = scope.banned.filter((b) => /adapt/i.test(b.re));
    assert.equal(adaptive.length, 2, `scope '${scopeName}' must carry BOTH ADR-M012 D8 adaptive patterns`);
    const patterns = compilePatterns([...cfg.banned, ...scope.banned]);
    // (a) MUTANT — the three surclaims redden the scope.
    for (const m of MUTANTS) {
      assert.ok(scanText(m, patterns, []).length >= 1, `(a) '${m}' must redden the ${scopeName} scope (ADR-M012 D8)`);
    }
    // (b) the EXACT D8 public sentence stays green with an EMPTY exemption list (no exemptPhrases entry).
    assert.deepEqual(scanText(D8_SENTENCE, patterns, []), [], `(b) the exact D8 sentence must stay green in ${scopeName} with NO exemption`);
    // (c) LOAD-BEARING — remove the two adaptive patterns and every mutant goes green, proving THOSE patterns
    // (not a pre-existing rule) are what redden the surclaims.
    const without = compilePatterns([...cfg.banned, ...scope.banned.filter((b) => !/adapt/i.test(b.re))]);
    for (const m of MUTANTS) {
      assert.deepEqual(scanText(m, without, []), [], `(c) removing the adaptive patterns must green '${m}' in ${scopeName} (load-bearing)`);
    }
  }
});

// ADR-M012 item (j) / G2-lot-m012b C2 — the gate:vocab ratchet is EXTENDED to cover the off-tool sentinel:
// apps/sentinel/src, apps/sentinel/test AND the deploy/ units, via a new `sentinel` scope. The
// vocab_adaptive_coverage_reddens test above proves the CONFIG patterns discriminate; this one proves the
// scope is WIRED INTO THE WALK (the G2 R2 gap: a config-only test stays green if collectTargets ignores the
// scope). It drives the REAL collectTargets() over the REAL tree: with the live config the two adaptive
// patterns are attached to instrument.ts, the sentinel test AND a deploy unit; deleting scan.sentinel drops
// all three from the walk (load-bearing). Live CLI mutant (a sentinel comment "adaptive coverage" ⇒ exit 1
// ⇒ revert, sha256 before/after) is recorded in the M012-c report.
test("vocab_sentinel_scope_scans_src_test_deploy — sentinel src/test/deploy are in the walk with the adaptive patterns (ADR-M012 C2)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: Record<string, { banned?: { re: string; why: string }[]; dirs?: string[]; files?: string[] } | undefined>;
  };
  const sentinel = cfg.scan.sentinel;
  assert.ok(sentinel && sentinel.banned, "scope 'sentinel' missing from vocab-banned.json (C2)");
  assert.equal(
    sentinel.banned.filter((b) => /adapt/i.test(b.re)).length,
    2,
    "the sentinel scope must carry BOTH ADR-M012 D8 adaptive patterns",
  );

  const REQUIRED = [
    join(ROOT, "apps", "sentinel", "src", "instrument.ts"),
    join(ROOT, "apps", "sentinel", "test", "sentinel.test.ts"),
    join(ROOT, "deploy", "monark-sentinel.service"),
  ];
  // (a) with the REAL config, collectTargets attaches the adaptive patterns to every required file.
  const targets = collectTargets(ROOT, cfg, []);
  const byFile = new Map(targets.map((t) => [t.f, t.patterns]));
  for (const f of REQUIRED) {
    const patterns = byFile.get(f);
    assert.ok(patterns, `the sentinel scope must scan ${f}`);
    assert.ok(scanText("adaptive coverage", patterns, []).length >= 1, `the adaptive patterns must be attached to ${f}`);
  }
  // (b) LOAD-BEARING — delete scan.sentinel and the three files leave the walk entirely.
  const stripped = JSON.parse(JSON.stringify(cfg)) as typeof cfg;
  delete stripped.scan.sentinel;
  const strippedFiles = new Set(collectTargets(ROOT, stripped, []).map((t) => t.f));
  for (const f of REQUIRED) {
    assert.ok(!strippedFiles.has(f), `removing scan.sentinel must drop ${f} from the walk (load-bearing)`);
  }
});

// Lot F-2a (PLAN F-2 §6e, C6) — the public storefront vocabulary gate (scope 'site') bans the README
// v2 marketing vocab in apps/site. Live end-to-end mutant (grep of the gate on a banned word in an
// apps/site file) is in docs/G1-lot-F2a.md; this locks the config so the scope cannot drift silently.
test("vocab_site_scope_bans_marketing_words — 7 proscribed words redden in apps/site (C6)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    scan: { site?: { package: string; extensions: string[]; banned: { re: string; why: string }[] } };
  };
  const site = cfg.scan.site;
  assert.ok(site, "scope 'site' missing from vocab-banned.json (C6)");
  assert.equal(site.package, "site");
  assert.deepEqual([...site.extensions].sort(), [".mdx", ".ts", ".tsx"], "site scope scans rendered surfaces only");
  const res = site.banned.map((b) => new RegExp(b.re, "i"));
  for (const w of ["autonomous", "self-evolving", "predicts", "confidence", "accuracy", "hedge fund", "Kraidle"]) {
    assert.ok(res.some((re) => re.test(`the ${w} claim`)), `no site-scope pattern reddens '${w}'`);
  }
  // Discriminating: adjacent honest words stay green (only 'predicts' is banned, not prediction/predictor).
  assert.ok(
    !res.some((re) => re.test("the predictor emits a Prediction and a coverage region")),
    "'prediction'/'predictor' must stay green (only 'predicts' banned)",
  );
});

// Lot F-2a (PLAN F-2 §6f, C11) — package-name collision guard: Base UI is `@base-ui/react`; the
// differently-named `@base-ui-components/react` must NEVER appear. Mutant (adding it to the site
// package.json) reddens; proof in docs/G1-lot-F2a.md.
test("no_base_ui_components_collision — @base-ui-components/react absent from site pkg + lockfile (C11)", () => {
  const pkg = readFileSync(join(ROOT, "apps", "site", "package.json"), "utf8");
  const lock = readFileSync(join(ROOT, "package-lock.json"), "utf8");
  assert.ok(
    !pkg.includes("@base-ui-components/react"),
    "@base-ui-components/react must be absent from apps/site/package.json (use @base-ui/react)",
  );
  assert.ok(
    !lock.includes("@base-ui-components/react"),
    "@base-ui-components/react must be absent from package-lock.json (collision with @base-ui/react)",
  );
  assert.ok(pkg.includes("@base-ui/react"), "positive control: @base-ui/react IS the pinned package");
});

// Lot F-2a (checkpoint-2 C-1) — the D1 decision (drop .md from the honesty walk) is only safe while
// .md is never a route. That safety rests ENTIRELY on next.config.mjs pageExtensions excluding "md":
// guard (a) locks the non-scan of .md, NOT the route closure. This locks pageExtensions so a future
// lot re-adding "md" (reopening F-1 G2 R1's routable-but-unscanned hole) reddens HERE. Named mutant:
// add "md" to pageExtensions ⇒ this test fails.
test("pageExtensions_excludes_md — .md is never a route, so the honesty walk may skip it (C-1)", () => {
  const cfg = readFileSync(join(ROOT, "apps", "site", "next.config.mjs"), "utf8");
  const inner = cfg.match(/pageExtensions\s*:\s*\[([^\]]*)\]/)?.[1] ?? "";
  assert.ok(inner, "pageExtensions array not found in apps/site/next.config.mjs");
  const exts = [...inner.matchAll(/["']([^"']+)["']/g)].map((x) => x[1]).filter((s): s is string => !!s);
  assert.deepEqual([...exts].sort(), ["mdx", "ts", "tsx"], "pageExtensions must be exactly ts/tsx/mdx");
  assert.ok(!exts.includes("md"), "adding 'md' reopens F-1 G2 R1's routable-but-unscanned hole (C-1)");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (PLAN F-2 §12 errata) — the site-scope vocab gate bans `\bconfidence\b`, yet MONARK's
// honest fleet-invariant copy ("no confidence field", README l.67-71) must render. A CLOSED
// exemptPhrases list in vocab-banned.json masks that exact phrase, scope-locally, BEFORE matching.
// This test imports the REAL gate functions (scanText/compilePatterns) from grep-forbidden.mjs
// WITHOUT executing the CLI (run-guarded), and proves the mechanism is closed, load-bearing AND
// non-inert. The live end-to-end proof (real CLI, exit codes, sha256 restore) is in docs/G1-lot-F2b.md.

interface VocabConfig {
  banned: { re: string; why: string }[];
  scan: { site: { banned: { re: string; why: string }[]; exemptPhrases: string[] } };
}

/** apps/site rendered surfaces (.ts/.tsx/.mdx), mirroring grep-forbidden.mjs SITE_SKIP (any depth). */
function siteSurfaces(base: string): { rel: string; text: string }[] {
  const SKIP = new Set(["node_modules", "dist", ".next", ".turbo", "test", "data"]);
  const EXTS = new Set([".ts", ".tsx", ".mdx"]);
  const out: { rel: string; text: string }[] = [];
  const walk = (absDir: string, rel: string): void => {
    for (const name of readdirSync(absDir)) {
      if (SKIP.has(name)) continue;
      const abs = join(absDir, name);
      if (statSync(abs).isDirectory()) {
        walk(abs, `${rel}/${name}`);
      } else if (EXTS.has(extname(name).toLowerCase())) {
        out.push({ rel: `${rel}/${name}`, text: readFileSync(abs, "utf8") });
      }
    }
  };
  walk(base, "apps/site");
  return out;
}

test("vocab_site_confidence_exemption — closed, load-bearing, non-inert (F-2b §12 errata)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as VocabConfig;
  const site = cfg.scan.site;
  assert.ok(
    Array.isArray(site.exemptPhrases) && site.exemptPhrases.length >= 1,
    "site scope must carry a closed exemptPhrases list (PLAN F-2 §12 errata)",
  );
  // The banned `confidence` rule must still be present — the exemption narrows it, never removes it.
  assert.ok(
    site.banned.some((b) => /confidence/.test(b.re)),
    "the site scope must still ban 'confidence' (only the closed honest phrase is exempt)",
  );
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(site.banned)];
  const phrases = site.exemptPhrases;

  // (a) MUTANT — a NON-exempt marketing use of a banned word reddens.
  assert.ok(
    scanText("We deliver high confidence signals.", patterns, phrases).length >= 1,
    "(a) 'high confidence' (non-exempt) must redden the site vocab gate",
  );

  // (b) MUTANT — the honest exempt phrase stays green.
  assert.deepEqual(
    scanText("MONARK keeps no confidence field, anywhere.", patterns, phrases),
    [],
    "(b) the exempt honest phrase must stay green",
  );

  // NON-INERT + (c) MUTANT — every exempt phrase must sit in a genuinely RENDERED position of a scanned
  // apps/site surface, and removing it from the exempt set must redden that very rendered copy.
  const surfaces = siteSurfaces(join(ROOT, "apps", "site"));
  assert.ok(surfaces.length >= 1, "no apps/site surfaces scanned (false green)");
  // R-E (trou M3): the carrier must be a RENDERED position, PROVEN by the honesty-lint AST walker
  // renderedTexts() — a JSX text node, a JSX child expression, or a visible attribute. The former
  // `startsWith("//")` line heuristic accepted a dead `const X = "no confidence field"` as a carrier,
  // so the rendered honest claim could be deleted while this test stayed green. Parsing closes that hole
  // (a variable initialiser is not a rendered position). .mdx is not parsed here (the carriers are .tsx);
  // a phrase living only in .mdx prose would fail this stricter check until put in a TSX/TS rendered
  // position — none such exists in-tree.
  const renderedTextsOf = (rel: string, text: string): string[] => {
    if (!rel.endsWith(".ts") && !rel.endsWith(".tsx")) return [];
    const kind = rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, kind);
    return renderedTexts(sf).map((rt) => rt.text);
  };
  for (const phrase of phrases) {
    const carrier = surfaces.find((s) => renderedTextsOf(s.rel, s.text).some((t) => t.includes(phrase)));
    assert.ok(carrier, `exempt phrase '${phrase}' sits in no RENDERED position under apps/site — inert exemption (R-E)`);
    const withoutThis = phrases.filter((p) => p !== phrase);
    assert.ok(
      scanText(carrier.text, patterns, withoutThis).length >= 1,
      `(c) removing exempt '${phrase}' must redden the rendered copy that carries it (load-bearing)`,
    );
  }

  // Steady state — with the full closed exemption set, EVERY apps/site surface is vocab-clean (this is
  // the in-process mirror of `npm run gate:vocab`; a stray banned word in a page reds here too).
  for (const s of surfaces) {
    assert.deepEqual(
      scanText(s.text, patterns, phrases),
      [],
      `apps/site surface must be vocab-clean with the closed exemptions: ${s.rel}`,
    );
  }
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (PLAN F-2 §12 errata §6b-bis) — generateMetadata() non-usage, documented by test.
// The honesty lint (test 44 §6b) scans the exported `metadata` VARIABLE; an
// `export [async] function generateMetadata()` returning literal title/description renders into
// <title>/<meta> yet would ESCAPE that scan. Chosen resolution (R-C): forbid it. No apps/site .ts/.tsx
// may export generateMetadata — a future lot that needs it reddens HERE and must extend the §6b scan
// first. AST (not regex): a comment or a string that merely names it is never a false red. Named mutant
// (a temp apps/site file exporting generateMetadata reds; removed; git clean) is in docs/G1-lot-F2b.md.
test("no_generate_metadata_in_apps_site — generateMetadata unused, §6b metadata scan not bypassable (F-2b §6b-bis)", () => {
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site TS/TSX surfaces scanned (false green)");
  const isExported = (mods: readonly ts.ModifierLike[] | undefined): boolean =>
    mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  const offenders: string[] = [];
  for (const s of surfaces) {
    const kind = s.rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(s.rel, s.text, ts.ScriptTarget.Latest, true, kind);
    const visit = (node: ts.Node): void => {
      if (ts.isFunctionDeclaration(node) && node.name?.text === "generateMetadata" && isExported(node.modifiers)) {
        offenders.push(s.rel);
      } else if (ts.isVariableStatement(node) && isExported(node.modifiers)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name) && decl.name.text === "generateMetadata") offenders.push(s.rel);
        }
      } else if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const el of node.exportClause.elements) {
          if (el.name.text === "generateMetadata") offenders.push(s.rel);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  assert.deepEqual(
    offenders,
    [],
    `apps/site exports generateMetadata (bypasses the §6b metadata scan): ${offenders.join(", ")}`,
  );
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (R-D / trou M6, widened by G2-delta R-γ) — the frozen-contract FIELD NAMES stay dynamic.
// The panels render `contract.required.map(...)`, read from schemas/ at build time; if a lot hard-coded
// that list the storefront would silently drift from the frozen contract. FOUR contracts are loaded
// (Shōgen→AttestedPrice 9, Hikae→CoverageVerdict 12, Ukemi→Prediction 5, and — Lot F-site-8 G2 R1 —
// GateDecision 8, first rendered by /integrators); this guard covers all four. Mirror of test 44's guard,
// for the field names: none of the required fields of
// those contracts may appear as a QUOTED STRING LITERAL ("f"/'f'/`f`) in an apps/site .ts/.tsx. QUOTED
// (not bare word) ON PURPOSE — `residual`/`attestor`/`region`/`reason` occur legitimately in rendered
// PROSE ("named residual hypotheses", "an output is a region"); a JSX-text occurrence is an ACCEPTED,
// declared non-target (the M6 regression hard-codes an array of quoted strings, which this catches).
// /integrators renders GateDecision with BARE object keys (JSON.stringify quotes them only at render),
// which this quoted-literal guard does not target — the declared scope (an observation for the orchestrator).
// GateDecision adds 6 net-new field names (action, allow, tool, intent, verdict, remaining_budget).
// CARVE-OUT (F-site-8, on rebase onto the merged sim): `action` is dropped from the gated set — it is
// GateDecision's own enum name AND a common English word, referenced as `` `action` `` throughout the sim's
// JSDoc (lib/gate-enums, lib/sim, gate-sim/diagram, gate-sim/index) — prose naming the frozen enum, never a
// hard-coded field list; a lone "action" is not list-drift. Same spirit as `region`/`reason`, which are
// unquoted in prose and so never hit. The 5 remaining net-new fields (allow/tool/intent/verdict/
// remaining_budget — rare words) still catch a hard-coded field list. One EXEMPTION survives — lib/fleet.ts
// `key: "verdict"` (a product id, not the GateDecision field; documented in fleet.ts' doc comment) — in the
// CLOSED, NON-INERT allowlist below; `verdict` stays gated in every OTHER file. The carve-out is THIS lot's
// choice, and the justification is stated truthfully: a `list-context-only` refinement WOULD defeat the
// required mutant (a lone quoted "remaining_budget", not inside an array, reads as not-a-list) — so it is
// rejected. But an AST scan of string/template LITERALS (ts.createSourceFile is already used by the
// generateMetadata gate above) would NOT defeat it: a "remaining_budget" injected into CODE stays a
// StringLiteral → red, while `` `action` `` in a comment is not a literal → the sim's JSDoc drops out,
// restoring `action` to the gated set at zero false positives. That AST refinement is the cleaner end state;
// it is DEFERRED here for scope, tracked as K-5 (owner F-site-5), not claimed impossible.
// Scope = .ts AND .tsx (a strict superset of the task's .tsx): lib/load-contract.ts, the .ts that reads
// required[], is the likeliest hard-code site. Generated .d.ts excluded (mirrors test 44). Reuses
// siteSurfaces() raw text, like test 44. Named mutant proof: docs/G1-lot-F2b.md + docs/G1-lot-fsite-8.md.
test("frozen_contract_fields_stay_dynamic — loaded contracts' required[] never hard-coded in apps/site (F-2b R-D)", () => {
  const contracts: { file: string; count: number }[] = [
    { file: "attested-price.schema.json", count: 9 },
    { file: "coverage-verdict.schema.json", count: 12 },
    { file: "prediction.schema.json", count: 5 },
    { file: "gate-decision.schema.json", count: 8 },
  ];
  const fields = new Set<string>();
  for (const c of contracts) {
    const schema = JSON.parse(readFileSync(join(ROOT, "schemas", c.file), "utf8")) as { required?: string[] };
    const req = schema.required ?? [];
    assert.equal(req.length, c.count, `expected ${c.count} required fields in ${c.file} (schema drift?)`);
    for (const f of req) fields.add(f);
  }
  // Carve-out on the FINAL union (after the count:8 shape assertion above, so it is not broken): `action`
  // is GateDecision's own enum name and a common word, referenced as `` `action` `` throughout the sim's
  // JSDoc — prose, never list-drift (see header). The 5 rare net-new fields still catch a hard-coded list.
  fields.delete("action");

  // CLOSED allowlist (Lot F-site-8): `${rel} :: ${field}` occurrences that are a legitimate same-name
  // token, NOT a hard-coded frozen-contract field list. See the header for why a detection refinement was
  // rejected. The value documents each — and is READ by the non-inert guard's message (never dead data).
  const EXEMPT = new Map<string, string>([
    [
      "apps/site/lib/fleet.ts :: verdict",
      "MONARK Verdict PRODUCT key (fleet register id), not the GateDecision `verdict` field; documented in fleet.ts' `key` doc comment",
    ],
    [
      "apps/site/lib/profiles.ts :: verdict",
      "the E-1 profile picker's productKey for the MONARK Verdict product (same registry id as fleet.ts), not the GateDecision `verdict` field — a product id, not a rendered contract field",
    ],
  ]);

  const quotes = ['"', "'", "`"];
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site .ts/.tsx surfaces scanned (false green)");
  const rawHits: string[] = [];
  for (const s of surfaces) {
    for (const field of fields) {
      if (quotes.some((q) => s.text.includes(q + field + q))) rawHits.push(`${s.rel} :: ${field}`);
    }
  }
  // NON-INERT: an exemption whose occurrence has vanished must be deleted (fail-closed, never silently
  // dead) — a future refactor of fleet.ts re-tightens the gate here rather than rotting.
  for (const [key, why] of EXEMPT) {
    assert.ok(rawHits.includes(key), `stale frozen-field exemption '${key}' (${why}): the occurrence is gone — delete it`);
  }
  const hits = rawHits.filter((h) => !EXEMPT.has(h));
  assert.deepEqual(hits, [], `frozen contract field name hard-coded as a literal in apps/site: ${hits.join(", ")}`);
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2b (checkpoint-2 C-1 / narrow guard C-3c) — α is the MISCOVERAGE level; coverage is one minus α.
// The Hikae "Honest limits" block once rendered "coverage level α" (reads α AS the coverage: α=0.10 would
// mean 10 % coverage, when it means 90 %). The validateur caught this honesty inversion after two mot-pour-
// mot G2 rounds and a full oracle. This is a NARROW regression guard — it pins THIS phrase, it does NOT
// catch every semantic inversion (only G2 review does): no apps/site rendered surface may place the word
// "coverage" directly before "level α" (entity or glyph). `\bcoverage` on purpose, so "MIScoverage level α"
// — which is CORRECT (α is the miscoverage level) — is not a false positive. Named mutant proof in
// docs/G1-lot-F2b.md.
test("no_coverage_level_alpha — α is never rendered as the coverage level in apps/site (F-2b C-1)", () => {
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site .ts/.tsx surfaces scanned (false green)");
  const inversion = /\bcoverage\s+level\s*(?:&alpha;|α)/i;
  const hits = surfaces.filter((s) => inversion.test(s.text)).map((s) => s.rel);
  assert.deepEqual(hits, [], `α rendered as a "coverage level" (it is the miscoverage level; coverage = one minus α): ${hits.join(", ")}`);
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2c (ADR-M004 D14 / PLAN F-2c C-2) — the FLEET REGISTER is the single source of truth for what
// is BUILT vs UPCOMING. This root test locks the invariant: the built set is EXACTLY {Shōgen, Hikae,
// Ukemi, Narabi} (Narabi flipped upcoming→built at go 4, ADR-M012 M012-e); the seven other agents and all
// five products are upcoming. Named mutant (G2): flip any of the twelve to "built" ⇒ this test reds (live
// proof + sha256 restore in docs/G1-lot-F2c.md). Two extra
// guards make the register honest and non-inert: (1) a numeric-hole closure — register strings render
// via {property access}, which the honesty lint (test 44) never flags, so a digit there would render
// un-caught; we scan every rendered register string with the SAME detector here. (2) a consumption
// check — the two new surfaces read status FROM the register, never hard-code a status attribute.
test("fleet_register_built_set_is_frozen — built == {Shōgen,Hikae,Ukemi,Narabi}; 12 others upcoming (F-2c C-2; ADR-M012 M012-e)", () => {
  // Compile-time: FleetStatus IS the honest AgentStatus vocabulary (both "built"|"upcoming"). The two
  // typed identity coercions only type-check if neither type adds or drops a member (a stray "live"
  // reds ONE of them under `npm run typecheck`). Called below so they are not unused.
  const asAgentStatus = (s: FleetStatus): AgentStatus => s;
  const asFleetStatus = (s: AgentStatus): FleetStatus => s;
  assert.equal(asAgentStatus("built"), "built");
  assert.equal(asFleetStatus("upcoming"), "upcoming");

  // The invariant — built agents are exactly the four named, no more, no fewer.
  const BUILT = ["Shōgen", "Hikae", "Ukemi", "Narabi"];
  const builtAgents = FLEET_AGENTS.filter((a) => a.status === "built").map((a) => a.name);
  assert.deepEqual([...builtAgents].sort(), [...BUILT].sort(), "built agents must be exactly {Shōgen, Hikae, Ukemi, Narabi}");

  // Every other agent is upcoming (both directions, per agent — a flip reds here).
  for (const a of FLEET_AGENTS) {
    const expected = BUILT.includes(a.name) ? "built" : "upcoming";
    assert.equal(a.status, expected, `agent ${a.name} must be ${expected}`);
  }

  // All five products are upcoming — a product is a wiring of fleet agents, never the engine, so it is
  // never "built" (ADR-M004 D14 invariant), even when its engine agent (e.g. Ukemi) is built.
  assert.equal(PRODUCTS.length, 5, "exactly five products");
  for (const p of PRODUCTS) {
    assert.equal(p.status, "upcoming", `product ${p.name} must be upcoming (the engine agent may be built, the product is not)`);
  }

  // The register-wide count: exactly 4 built, exactly 12 upcoming (7 agents + 5 products). ADR-M012 M012-e:
  // Narabi flips upcoming→built at go 4 (off-tool sentinel running daily), so built is 4 and upcoming 12.
  const builtCount = FLEET_AGENTS.filter((a) => a.status === "built").length;
  const upcomingCount =
    FLEET_AGENTS.filter((a) => a.status === "upcoming").length + PRODUCTS.filter((p) => p.status === "upcoming").length;
  assert.equal(builtCount, 4, "exactly four agents are built");
  assert.equal(upcomingCount, 12, "exactly twelve upcoming (seven agents + five products)");

  // (0) package.json `description` is exported to the public mirror (scripts/export-public.mjs WHITELIST_FILES)
  // and carries the fleet count in free text — a surface the register does not drive (G2 M012-e C2: it still
  // said "3 agents built, 8 on the roadmap" after Narabi flipped). Lock its counts to the register so a flip
  // that forgets the description reds here instead of shipping a contradiction to the mirror.
  const upcomingAgentCount = FLEET_AGENTS.filter((a) => a.status === "upcoming").length;
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { description: string };
  assert.ok(
    pkg.description.includes(`fleet: ${builtCount} agents built, ${upcomingAgentCount} on the roadmap`),
    `package.json description must state "fleet: ${builtCount} agents built, ${upcomingAgentCount} on the roadmap"`,
  );

  // (1) NUMERIC-HOLE closure — every RENDERED register string carries zero numeric literal. `{a.line}`
  // is a property access the honesty lint never flags, so this scan (same detector) is where a digit in
  // a register string (e.g. a "53h" window) would be caught.
  const noExempt = new Set<string>();
  const registryStrings: string[] = [];
  for (const a of FLEET_AGENTS) registryStrings.push(a.name, a.line);
  for (const p of PRODUCTS) {
    registryStrings.push(p.segment, p.name, p.fn, p.connects, p.wiring.sensor, p.wiring.gate, p.wiring.act);
  }
  const numericHits = registryStrings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a register string carries a rendered numeric literal: ${JSON.stringify(numericHits)}`);

  // (2) CONSUMPTION — the two new surfaces render the badge FROM the register (status={...}), never a
  // hard-coded status="built"/status="upcoming" attribute. The Shōgen/Hikae F-2b panels keep their own
  // declared status on the home page; the Ukemi panel now reads the register too (pinned by (5) below).
  const NEW_SURFACES = ["apps/site/app/roadmap/page.tsx", "apps/site/components/upcoming-panel.tsx"];
  const surfaces = siteSurfaces(join(ROOT, "apps", "site"));
  // Also catches the JSX-wrapped literal status={"built"} (G2-F2c reserve a), not just status="built".
  const hardCoded = /status\s*=\s*\{?\s*["'](?:built|upcoming)["']/;
  for (const rel of NEW_SURFACES) {
    const surface = surfaces.find((s) => s.rel === rel);
    assert.ok(surface, `expected new surface ${rel} to be scanned (false green)`);
    assert.ok(
      !hardCoded.test(surface.text),
      `${rel} must not hard-code a status attribute — read it from lib/fleet.ts (inert register otherwise)`,
    );
  }

  // (3) WIRING (ADR-M018 D1(b)(c)/D2) — every built agent declares a SERVED path and a non-LLM integration
  // test that EXISTS. The FleetAgent union already makes a built-without-wiring / upcoming-with-wiring a
  // COMPILE error (npm run typecheck, via this file's import of fleet.ts); this block additionally reds if
  // served_by is empty or integration_test names no real test. The declared test title may be bare (`"`) or
  // suffixed (` — …`), so we match `test("<id>` followed by a quote OR ` — `. Named mutants: "no_such_test"
  // ⇒ reds; a title-suffixed id (m6, narabi_live_parses_real_state_shape) ⇒ green; drop `wiring` ⇒ typecheck reds.
  const TEST_ROOTS = [join(ROOT, "test"), join(ROOT, "apps", "harness", "test"), join(ROOT, "apps", "sentinel", "test")];
  const testCorpus = TEST_ROOTS.flatMap((dir) =>
    existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".test.ts")).map((n) => readFileSync(join(dir, n), "utf8")) : [],
  ).join("\n");
  assert.ok(testCorpus.length > 0, "no *.test.ts collected under the three test roots (false green)");
  for (const a of FLEET_AGENTS) {
    if (a.status !== "built") continue;
    assert.ok(a.wiring.served_by.trim().length > 0, `built agent ${a.name}: wiring.served_by must be non-empty (ADR-M018 D1(b))`);
    const t = a.wiring.integration_test.trim();
    assert.match(t, /^[A-Za-z0-9_]+$/, `built agent ${a.name}: integration_test must be a bare test identifier, got ${JSON.stringify(t)}`);
    // `t` is a bare identifier (validated above) ⇒ safe to interpolate. Accept a bare (`"`) or title-suffixed
    // (` — …`) declaration: test("<id>" …) or test("<id> — …").
    const declRe = new RegExp(`test\\(\\s*["']${t}(?:["']| — )`);
    assert.ok(
      declRe.test(testCorpus),
      `built agent ${a.name}: integration_test '${t}' names no test("${t}" …) under test/, apps/harness/test/, apps/sentinel/test/ (ADR-M018 D1(c))`,
    );
  }

  // (4) NUMERIC-HOLE tripwire for wiring (DECLARED LIMIT) — served_by carries task-class ids with digits
  // (…-24h, btc-dir-15m). Like ACI.body, a wiring VALUE escapes BOTH the honesty lint (member access OR
  // destructuring) and the register numeric scan above (name/line only). TRIPWIRE: no apps/site surface
  // OTHER THAN lib/fleet.ts (where they are the FleetWiring field NAMES) may reference the identifiers
  // `served_by`/`integration_test` — the bare-identifier scan catches member access {a.wiring.served_by}
  // (m5) AND destructuring `const {served_by}=a.wiring` (A2, which the old `wiring\.served_by` regex missed).
  // DECLARED LIMIT: a text regex canNOT close reflective leaks (Object.values(a.wiring) /
  // JSON.stringify(a.wiring)); the designer item (b) [ADR-W1] that renders wiring MUST (i) lift this tripwire
  // AND (ii) add the wiring strings to the numeric scan above — that fix is the PREREQUISITE of item (b).
  const wiringIdent = /\b(?:served_by|integration_test)\b/;
  const wiringLeakHits = surfaces
    .filter((s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && s.rel !== "apps/site/lib/fleet.ts" && wiringIdent.test(s.text))
    .map((s) => s.rel);
  assert.deepEqual(wiringLeakHits, [], `an apps/site surface (≠ lib/fleet.ts) references wiring identifiers served_by/integration_test (digit-hole tripwire) — ADR-W1 item (b) must land first: ${wiringLeakHits.join(", ")}`);

  // (5) The bespoke Ukemi Home panel reads its AgentCard STATUS from the register (ADR-M018 single source of
  // truth), not a hard-coded literal. NOT in NEW_SURFACES because its PanelBlock maturity attrs
  // (status="built"/"upcoming" at l.56/61/67/80) are legitimately literal; we anchor to the FIRST `status`
  // after `<AgentCard` (the AgentCard's own — mark/name carry no "status"), so those PanelBlock literals stay
  // out of view. Named mutants: status="built" (m3) AND status={"built"} (A1, JSX-wrapped literal the old
  // `stMatch[1]==="{"` check let pass) ⇒ both red; status={IDENTIFIER} ⇒ green.
  const ukemiPanel = surfaces.find((s) => s.rel === "apps/site/components/ukemi-panel.tsx");
  assert.ok(ukemiPanel, "ukemi-panel.tsx must be scanned (false green)");
  assert.match(ukemiPanel.text, /from ["']@\/lib\/fleet["']/, "ukemi-panel must import the fleet register (single source of truth)");
  const acIdx = ukemiPanel.text.indexOf("<AgentCard");
  assert.ok(acIdx >= 0, "ukemi-panel must render an AgentCard (false green)");
  const stIdx = ukemiPanel.text.indexOf("status", acIdx);
  assert.ok(stIdx > acIdx, "the AgentCard must carry a status prop (false green)");
  const acStatus = ukemiPanel.text.slice(stIdx); // anchored at the AgentCard's own status prop
  // (a) not a hard-coded literal — attribute OR JSX-wrapped {"built"} (the guard (2) shape, anchored with ^).
  assert.ok(
    !/^status\s*=\s*\{?\s*["'](?:built|upcoming)["']/.test(acStatus),
    'ukemi-panel AgentCard status must not be a hard-coded literal (status="built" or status={"built"}) — read it from the register',
  );
  // (b) it IS a register read: status={IDENTIFIER} (e.g. status={UKEMI_STATUS}).
  assert.match(acStatus, /^status\s*=\s*\{\s*[A-Za-z_$][\w$.]*\s*\}/, "ukemi-panel AgentCard status must be status={IDENTIFIER} read from lib/fleet.ts");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-2c (ADR-M004 D14 / PLAN F-2c C-4) — the site-scope vocab gate bans unambiguous third-party
// platform names so product wiring stays generic on the public storefront. Live end-to-end mutant
// (real CLI, exit code, sha256 restore) is in docs/G1-lot-F2c.md; this locks the closed list and its
// discriminating boundaries so the scope cannot drift silently.
test("vocab_site_scope_bans_third_party_platforms — nine platform brands redden in apps/site (F-2c C-4)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    scan: { site?: { banned: { re: string; why: string }[] } };
  };
  const site = cfg.scan.site;
  assert.ok(site, "scope 'site' missing from vocab-banned.json (C-4)");
  const res = site.banned.map((b) => new RegExp(b.re, "i"));

  // Each unambiguous brand reddens inside a rendered sentence.
  for (const w of ["Aave", "Polymarket", "Kalshi", "Pendle", "Hyperliquid", "HIP-3", "Arrakis", "UMA", "Gamma"]) {
    assert.ok(res.some((re) => re.test(`settle on ${w} today`)), `no site-scope pattern reddens '${w}'`);
  }

  // Discriminating: the strict \b...\b boundary keeps substrings green (no false positive on the tree).
  for (const green of ["a human review", "in summary", "Pendleton Street", "a gammaglobulin dose"]) {
    assert.ok(!res.some((re) => re.test(green)), `'${green}' must stay green (word-boundary false-positive guard)`);
  }

  // KNOWN LIMIT (declared for checkpoint-2, docs/G1-lot-F2c.md): the gate is case-insensitive, so the
  // standalone options-greek word 'gamma' also reddens. Acceptable today (no such prose in-tree); a
  // future need would take a dated addendum (like D13). Asserted, not hidden.
  assert.ok(res.some((re) => re.test("the gamma of the option")), "standalone 'gamma' reddens (declared limit, checkpoint-2)");

  // 'Safe' is DELIBERATELY not listed (ambiguous English word AND a multisig brand) — manual review,
  // declared for checkpoint-2. Guard the decision so a silent add of a naked \bSafe\b becomes visible.
  assert.ok(!res.some((re) => re.test("keep your funds safe")), "'safe' must stay green (ambiguous; manual control declared)");
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-site-3 (ADR-M004 D15 / checkpoint-1 C-9) — the gate sim's action vocabulary is DERIVED from the
// frozen gate-decision.schema.json, never hard-coded. lib/gate-enums.ts loads the `action` enum; the
// client sim resolves the third action (also a CoverageVerdict field name, which may not be a literal in
// apps/site) by INDEX. This root test PINS the loaded order [commit, defer, abstain] and ties lib/sim.ts's
// ACTION_* indices to it, so the derived type + the index resolution stay honest. This test file lives at
// the repo ROOT (outside apps/site), so spelling out the third action word here is fine — the
// frozen_contract_fields gate only scans apps/site surfaces. Named mutant (G2): reorder the `action`
// enum in the schema => this test reds (run `node --test test/ci-gates.test.ts` alone;
// contracts-frozen.test.ts also reds — expected, that is the byte-freeze). Proof + sha256 restore in
// docs/G1-lot-fsite-3.md.
test("gate_action_enum_order_is_frozen — action=[commit,defer,abstain]; sim indices track it (C-9)", () => {
  const { actions, reasons } = loadGateEnums(ROOT);
  // The order the client indexes by. A reorder in the schema reds HERE.
  assert.deepEqual(actions, ["commit", "defer", "abstain"], "action enum order changed (schema drift)");
  assert.equal(reasons.length, 13, "gate-decision reason enum must carry the thirteen closed reasons");
  // lib/sim.ts resolves each action from the loaded enum by index — the load-bearing link. If the enum is
  // reordered, actions[ACTION_ABSTAIN] stops being the third action and this reds. (The derived type
  // GateAction is `string`; it is THIS test, not the type, that catches a reorder.)
  assert.equal(actions[ACTION_COMMIT], "commit", "ACTION_COMMIT must index the commit action");
  assert.equal(actions[ACTION_DEFER], "defer", "ACTION_DEFER must index the defer action");
  assert.equal(actions[ACTION_ABSTAIN], "abstain", "ACTION_ABSTAIN must index the third action");
});

// Lot F-site-3 (checkpoint-1 / G2 review R1) — HONESTY GATE: every reason code the sim can EMIT in a
// rendered position (region/decision read-outs, the decision log, gateJson's reason) MUST be a member of
// the FROZEN gate-decision `reason` enum (thirteen closed codes). Reason codes are NOT contract fields, so
// the sim writes them as plain literals; nothing else guaranteed they stay inside the frozen enum. The
// emissible SET is built by DRIVING the exported pure policy decide() (lib/sim.ts) over one input per
// branch — never a hard-coded list — so a reason literal edited in lib/sim.ts flows through to `emitted`
// here and reddens THIS test (sole-red mutant proof: `reason: "covered"` -> "covered_XX" in lib/sim.ts
// reddens this test alone under `node --test test/ci-gates.test.ts`). decide() is the SOLE emitter:
// SimState.reason, LogRow.reason and gateJson()'s reason are all set from its Decision.reason.
// use-gate-sim.ts emits nothing (its REASON_BUDGET_EXHAUSTED is a COMPARISON constant only — a drift
// there breaks epoch auto-recovery, a behavioural bug, not a rendered-honesty one) AND is un-importable
// here anyway ("use client" + React hooks + the @/ alias do not resolve under `node --test`); lib/sim.ts
// is a plain module (no JSX/DOM/node: imports), so importing decide/fresh from it is both correct and the
// only viable path. The five branches are traced to their decide() source lines:
//   L130 upstream_timeout      — input.timeout
//   L135 set_too_large         — |reading| <= spread  (labels collapse to {up,down})
//   L138 intent_not_in_region  — single label != intent
//   L141 budget_exhausted      — budget < COST
//   L143 covered               — otherwise
test("sim_emitted_reason_codes_subset_of_frozen_enum — every reason the sim renders is in the frozen enum (R1)", () => {
  const { reasons } = loadGateEnums(ROOT);
  assert.equal(reasons.length, 13, "frozen gate-decision reason enum must carry the thirteen closed codes");
  const frozen = new Set(reasons);

  const base = fresh();
  const emitted = new Set(
    [
      decide(base, { reading: 0.8, spread: 0.25, intent: "up", timeout: true }), // upstream_timeout (L130)
      decide(base, { reading: 0.1, spread: 0.35, intent: "up", timeout: false }), // set_too_large (L135)
      decide(base, { reading: 0.8, spread: 0.25, intent: "down", timeout: false }), // intent_not_in_region (L138)
      decide({ ...base, budget: 0 }, { reading: 0.8, spread: 0.25, intent: "up", timeout: false }), // budget_exhausted (L141)
      decide(base, { reading: 0.8, spread: 0.25, intent: "up", timeout: false }), // covered (L143)
    ].map((d) => d.reason),
  );

  // Completeness (non-vacuity): the five branch-covering inputs reach five DISTINCT codes, so the
  // membership check below is never vacuously true and drift in any exercised branch is observed. A future
  // lot that adds a decide() branch must extend both this input list and this count (declared limit).
  assert.equal(emitted.size, 5, `expected 5 distinct emissible reason codes, saw {${[...emitted].join(", ")}}`);

  // The honesty invariant: every code the sim can render MUST be a member of the frozen reason enum.
  const offenders = [...emitted].filter((r) => !frozen.has(r));
  assert.deepEqual(
    offenders,
    [],
    `sim emits reason code(s) NOT in the frozen gate-decision reason enum: ${offenders.join(", ")}`,
  );
});

// Lot F-site-3 (checkpoint-1 C-4 / ADR-M004 D15) — the sim's RENDERED-LABEL data (the diagram sensor
// labels and the ambient intents) render via {property access}, which the honesty lint (test 44) never
// scans, so a digit there would render un-caught. Mirror of the fleet register numeric-hole closure: scan
// every rendered sim string with the SAME detector. The JSON view's numeric OUTPUT (alpha,
// remaining_budget, schema_version, task-class) is INTENTIONALLY not scanned here — it is the sim's
// illustrative output rendered via a CALL ({gateJson(...)}), honest by construction per honesty-lint a8
// + ADR-M004 D15 + the C-5 caveat (declared, not a hole).
test("gate_sim_rendered_labels_have_no_numeric_hole — sim label data carries zero rendered digit (C-4)", () => {
  const noExempt = new Set<string>();
  const simStrings: string[] = [];
  for (const n of SENSOR_NODES) simStrings.push(n.label);
  for (const a of AMBIENT) simStrings.push(a.intent);
  assert.ok(simStrings.length >= 1, "no sim label strings scanned (false green)");
  const numericHits = simStrings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a rendered sim label carries a numeric literal: ${JSON.stringify(numericHits)}`);
});

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Lot F-site-4 (checkpoint-1 C-4 / ADR-M004 D15) — the NEW home data modules (agents-presentation,
// profiles) render via {property access}, which the honesty lint (test 44) never scans, so a digit there
// would render un-caught. Mirror of the fleet-register + sim-label numeric-hole closures: scan every
// RENDERED string (name/kanji for agents; label/product name for profiles) with the same detector. The
// `accent` (a style value, e.g. a hex) and `engineKeys`/`n` (never rendered as text) are intentionally
// out of scope. Named mutant: put a digit in a kanji/label/product name ⇒ this reds.
test("home_data_modules_have_no_numeric_hole — presentation + profiles carry zero rendered digit (F-site-4 C-4)", () => {
  const noExempt = new Set<string>();
  const strings: string[] = [];
  for (const a of AGENTS_PRESENTATION) strings.push(a.name, a.kanji);
  for (const p of PICKER_PROFILES) strings.push(p.label, p.productName);
  assert.ok(strings.length >= 1, "no home data strings scanned (false green)");
  const numericHits = strings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a home data string carries a rendered numeric literal: ${JSON.stringify(numericHits)}`);
});

// Lot F-site-4 (checkpoint-2 K-2 / C-6) — the honesty-lint EXEMPTION INERTIA GUARD. The closed list
// (apps/site/test/honesty-lint.exempt.json) may only carry a token that is ACTUALLY rendered somewhere
// under apps/site; an entry with no rendered carrier is inert (a hole waiting to launder a future digit)
// and reds here. This guard enters with the first exemptions (the 01-04 section ordinals). Two named
// mutants: (a) add {value:"99"} with no carrier ⇒ (a) reds; (b) add {value:"5"} (a bare single digit that
// would gut the detector, inventory §4a a3) ⇒ (b) reds. (c) proves the exemptions are load-bearing: with an
// EMPTY exempt set the SAME whole-tree walker (scanAppsSite) reds each entry at its carrier — so test 44
// proper (which uses the real list) is green precisely BECAUSE these carriers are exempted, not absent.
test("honesty_exempt_entries_have_rendered_carrier — no inert exemption, no gutting bare digit (F-site-4 C-6/K-2)", () => {
  const ex = loadExemptFile(ROOT);
  assert.ok(ex.entries.length >= 1, "expected at least the 01-04 section ordinals (false green)");
  const noExempt = new Set<string>();

  // Every EXACT numeric token that appears in a RENDERED-TEXT position (renderedTexts) across apps/site.
  const renderedTokens = new Set<string>();
  const surfaces = siteSurfaces(join(ROOT, "apps", "site")).filter(
    (s) => (s.rel.endsWith(".ts") || s.rel.endsWith(".tsx")) && !s.rel.endsWith(".d.ts"),
  );
  assert.ok(surfaces.length >= 1, "no apps/site surfaces scanned (false green)");
  for (const s of surfaces) {
    const kind = s.rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(s.rel, s.text, ts.ScriptTarget.Latest, true, kind);
    for (const rt of renderedTexts(sf)) {
      for (const tok of scanNumericText(rt.text, noExempt)) renderedTokens.add(tok);
    }
  }

  // (a) NON-INERT — every exempt value is an EXACT rendered token somewhere.
  for (const e of ex.entries) {
    assert.ok(
      renderedTokens.has(e.value),
      `exempt '${e.value}' matches no rendered numeric token under apps/site — inert exemption (C-6/K-2)`,
    );
  }
  // (b) no bare single digit — it would gut the numeric detector.
  for (const e of ex.entries) {
    assert.ok(!/^\d$/.test(e.value), `exempt '${e.value}' is a bare single digit — it would gut the detector (C-6)`);
  }
  // (c) LOAD-BEARING — with an EMPTY exempt set the whole-tree walker reds each entry at its carrier.
  const unexemptedTokens = new Set(scanAppsSite(ROOT, noExempt).violations.map((v) => v.token));
  for (const e of ex.entries) {
    assert.ok(
      unexemptedTokens.has(e.value),
      `removing the exemptions must red '${e.value}' at its carrier (load-bearing, C-6)`,
    );
  }
});

// Lot F-site-4 (checkpoint-1 C-5 / G2 reserve R5) — the ILLUSTRATIVE caveat is present at EVERY sim mount.
// The caveat wording lives in lib/sim.ts (CAVEAT), imported by all mounts; this guard pins the wording and
// that the board mount (board.tsx) AND the explainer + token mounts (index.tsx) each render it, plus the
// explainer's illustrative-α clause. Named mutants: delete {CAVEAT} from board.tsx ⇒ (b) reds; delete a
// <Caveat/> from index.tsx ⇒ (b) reds; weaken the CAVEAT wording ⇒ (a) reds.
test("gate_sim_caveat_present_in_all_mounts — illustrative C-5 caveat at every mount (F-site-4 R5)", () => {
  // (a) the wording carries the illustrative disclaimer.
  assert.match(CAVEAT, /illustrative/i, "the caveat must call the sim illustrative");
  assert.match(CAVEAT, /not market activity/i, "the caveat must deny market activity");
  // (b) every mount renders it: the board mount (board.tsx) + the explainer & token mounts (index.tsx).
  const board = readFileSync(join(ROOT, "apps", "site", "components", "gate-sim", "board.tsx"), "utf8");
  const index = readFileSync(join(ROOT, "apps", "site", "components", "gate-sim", "index.tsx"), "utf8");
  assert.match(board, /\{CAVEAT\}/, "the board mount (board.tsx) must render {CAVEAT} (R5/C-5)");
  const caveatMounts = (index.match(/<Caveat\s*\/>/g) ?? []).length;
  assert.ok(caveatMounts >= 2, `index.tsx must render <Caveat/> in the explainer AND token mounts (saw ${caveatMounts})`);
  // (c) the explainer qualifies α as illustrative (R5).
  assert.match(index, /illustrative/i, "the explainer must qualify the α it shows as illustrative (R5)");
});

// Lot F-site-5 (K-4(b) / checkpoint-2, owner F-site-5) — the sim's illustrative GateDecision JSON view
// (lib/sim.ts gateJson, mounted on the How explainer) is an ABBREVIATED read-out; every key it renders
// MUST be a real property of the frozen contract it stands for: top-level keys ⊆ GateDecision.properties,
// and the nested verdict's keys ⊆ CoverageVerdict.properties. A foreign/invented key (a "p_correct"
// slipped into the view) would render an honesty violation the schemas forbid (additionalProperties:
// false). Pattern R1 (like sim_emitted_reason_codes...): DRIVE the real gateJson() over a region-present
// state — never a hard-coded key list — so a key edited in lib/sim.ts flows through to `parsed` here.
// This is DISTINCT from frozen_contract_fields_stay_dynamic (which forbids hard-coding field NAMES as
// quoted literals in apps/site): that guards the SPELLING, this guards the SHAPE the sim emits — no
// duplication: F-site-8's R1 (now merged on main) extends the field-NAME gate (spelling of frozen fields
// as quoted literals); THIS gate guards the SHAPE gateJson() emits (keys ⊆ contract properties) — orthogonal.
// Named mutant (G2): add `p_correct: 0` to gateJson's `view` (or its `verdict`) ⇒ this reds alone under
// `node --test test/ci-gates.test.ts`. Live proof + sha256 restore in docs/G1-lot-fsite-5.md.
test("gate_sim_json_keys_subset_of_frozen_contracts — sim JSON view keys are all frozen-contract properties (K-4b)", () => {
  const propsOf = (file: string): Set<string> => {
    const schema = JSON.parse(readFileSync(join(ROOT, "schemas", file), "utf8")) as {
      properties?: Record<string, unknown>;
    };
    return new Set(Object.keys(schema.properties ?? {}));
  };
  const gateProps = propsOf("gate-decision.schema.json");
  const verdictProps = propsOf("coverage-verdict.schema.json");
  assert.ok(gateProps.size >= 1 && verdictProps.size >= 1, "frozen contract properties not loaded (false green)");

  const { actions } = loadGateEnums(ROOT);
  // Drive the region-present ("covered") branch so `verdict` is an OBJECT, not the ELLIPSIS placeholder —
  // otherwise the verdict-key check below would pass VACUOUSLY (non-vacuity, mirrors the R1 emitted.size).
  const state = push(fresh(), { reading: 0.8, spread: 0.25, intent: "up", timeout: false });
  const parsed = JSON.parse(gateJson(state, actions)) as { verdict?: unknown } & Record<string, unknown>;

  const topForeign = Object.keys(parsed).filter((k) => !gateProps.has(k));
  assert.deepEqual(topForeign, [], `gateJson() emits top-level key(s) not in GateDecision: ${topForeign.join(", ")}`);

  assert.equal(typeof parsed.verdict, "object", "expected a region-present verdict OBJECT (non-vacuity)");
  assert.ok(parsed.verdict !== null, "verdict must not be null in the covered branch");
  const verdictForeign = Object.keys(parsed.verdict as Record<string, unknown>).filter((k) => !verdictProps.has(k));
  assert.deepEqual(verdictForeign, [], `gateJson() verdict emits key(s) not in CoverageVerdict: ${verdictForeign.join(", ")}`);
});

// Lot F-site-5 (R2, PLAN §8 owner F-site-5 / C-4) — the How page renders the region vocabulary and the
// reason/outcome glosses (lib/how-copy.ts) via {property access}, which the honesty lint (test 44) never
// scans, so a stray digit there (a "top-3 labels") would render un-caught. Mirror of the sim/register
// numeric-hole closures: scan every rendered How-copy string with the SAME detector. ALSO pins the
// 13-reasons grid to the frozen enum: the grid renders codes FROM loadGateEnums() and glosses them by
// code, so this proves the gloss table is complete AND has no phantom code (BIDIRECTIONAL) — the grid can
// neither drift from nor outrun the frozen reason enum. Imports the pure data module (no JSX / no @-alias)
// like lib/sim.ts. Live proof in docs/G1-lot-fsite-5.md.
test("how_page_rendered_vocab_has_no_numeric_hole — region + reason copy carries zero rendered digit; glosses match the enum (R2)", () => {
  const noExempt = new Set<string>();
  const strings: string[] = [];
  for (const o of OUTCOMES) strings.push(o.gloss);
  for (const rk of REGION_KINDS) strings.push(rk.eyebrow, rk.title, ...rk.example);
  for (const [, meta] of Object.entries(REASON_GLOSS)) strings.push(meta.gloss);
  assert.ok(strings.length >= 1, "no How-copy strings scanned (false green)");
  const numericHits = strings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a rendered How-copy string carries a numeric literal: ${JSON.stringify(numericHits)}`);

  // The reason grid renders one card per FROZEN enum code (loadGateEnums), reading its gloss from
  // REASON_GLOSS. Completeness must be BIDIRECTIONAL: every enum code has a gloss (no blank card) AND
  // every gloss key is a real enum code (no phantom card). A new reason in the schema without a gloss —
  // or a stale gloss for a removed reason — reds here (a new reason needs an ADR, not a silent deploy).
  const { actions, reasons } = loadGateEnums(ROOT);
  const enumSet = new Set(reasons);
  const missing = reasons.filter((r) => !(r in REASON_GLOSS));
  const phantom = Object.keys(REASON_GLOSS).filter((k) => !enumSet.has(k));
  assert.deepEqual(missing, [], `frozen reason code(s) with no How gloss: ${missing.join(", ")}`);
  assert.deepEqual(phantom, [], `How gloss(es) for a non-existent reason code: ${phantom.join(", ")}`);

  // Every tone (region cards, reasons, outcomes) must index a real action lane [commit, defer, abstain] —
  // the page resolves the action WORD + colour by this index; an out-of-range tone would mis-label.
  const tones = [...OUTCOMES.map((o) => o.tone), ...Object.values(REASON_GLOSS).map((m) => m.tone)];
  for (const t of tones) assert.ok(t >= 0 && t < actions.length, `a How tone ${t} is outside the frozen action enum`);
});

// ---------------------------------------------------------------------------
// Root test `series_pinned_are_declared_and_hashed` — ADR-M003 D9 sexies (Lot R-25-series).
// The r25 job excludes sha-pinned DATA SERIES (fixtures/**/*.{json,jsonl,csv} and
// apps/sentinel/test/fixtures/**, with :(glob) magic — the bare form matches NOTHING in git's default
// pathspec mode, measured 2026-09-19) from the R-25 lot-size count. This root test is the safety
// condition D9 sexies (a): EVERY excluded data file MUST be declared AND hashed in a same-dir declaration
// — a PROVENANCE-*.md, or fixtures/manifest.json (a closed hashed set already enforced by
// fixtures_root_valid, so the nine gate states are NOT duplicated). Reds on: an orphan file (added with no
// declaration); an altered byte (recomputed sha != declaration); a CODE file (.ts/.mjs/.js) under an
// excluded root (condition c — no code disguised as data). It also asserts SET EQUALITY between the
// :(glob) exclusion pathspecs wired in ci.yml and the derived source of truth (SERIES_EXCLUDED_ROOTS x
// exts) — neither a dropped nor an extra pathspec (checkpoint-2 C-1). Named mutants
// (docs/G1-lot-r25-series.md): M3 fixtures/zz.json with no declaration => red; M2 two shas permuted in a
// table => red; M4 fixtures/zz.ts => red; M5 book.json/full-book.json siblings each on its own line =>
// GREEN (token match, C-2a); M6b a sha moved under `## History` => red (rule (ii) removed, C-2b); M8 one
// byte added to a fixture => red; M1/M10 a pathspec losing ,glob => red; M11 a 7th pathspec in ci.yml =>
// red. Run by `npm test`, OUTSIDE the per-lot R-25 count.
// Single source of truth for the R-25 series exclusion (ADR-M003 D9 sexies). POSIX strings, so the
// derived pathspecs are byte-identical on win32 and Linux CI (checkpoint-2 C-1); join(ROOT, rel) still
// normalizes them for the FS walk, and the walk flips `\\`->`/` before comparing.
const SERIES_EXCLUDED_ROOTS = ["fixtures", "apps/sentinel/test/fixtures"];
const SERIES_DATA_EXTS = new Set([".json", ".jsonl", ".csv"]);
const SERIES_CODE_EXTS = new Set([".ts", ".mts", ".cts", ".mjs", ".cjs", ".js"]);
// The pathspecs the r25 job MUST carry — DERIVED from the roots x exts above (never a parallel hand-kept
// list), so ci.yml and this test can be checked for SET EQUALITY (checkpoint-2 C-1, mutant M11: a 7th
// :(glob) pathspec in ci.yml with no marched root here used to stay green). :(glob) is mandatory (the
// bare form matches nothing — measured 2026-09-19).
const SERIES_EXCLUDE_PATHSPECS = SERIES_EXCLUDED_ROOTS.flatMap((root) =>
  [...SERIES_DATA_EXTS].map((ext) => `:(exclude,glob)${root}/**/*${ext}`),
);

function seriesWalk(absDir: string): string[] {
  const out: string[] = [];
  const stack: string[] = [absDir];
  for (let cur = stack.pop(); cur !== undefined; cur = stack.pop()) {
    for (const name of readdirSync(cur)) {
      const abs = join(cur, name);
      if (statSync(abs).isDirectory()) stack.push(abs);
      else out.push(abs);
    }
  }
  return out;
}

function seriesLfSha256(abs: string): string {
  return createHash("sha256").update(readFileSync(abs, "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
}

test("series_pinned_are_declared_and_hashed — every R-25-excluded data file is declared + hashed same-dir (ADR-M003 D9 sexies)", () => {
  // SET EQUALITY between the r25 job's :(glob) exclusion pathspecs and the derived source of truth —
  // neither missing nor extra. `missing`: a required pathspec absent from ci.yml — matched on the FULL
  // single-quoted token because ".json" is a substring of ".jsonl", so a bare includes stays green when
  // the .json pathspec loses its ,glob (G2 C1, mutant M1/M10). `extra`: a :(glob) pathspec present in
  // ci.yml whose root is NOT in SERIES_EXCLUDED_ROOTS — it would drop files from the R-25 count with no
  // declaration guard here (checkpoint-2 C-1, mutant M11).
  const wfGlobPathspecs = [...WF.matchAll(/'(:\(exclude,glob\)[^']+)'/g)]
    .map((m) => m[1])
    .filter((s): s is string => s !== undefined);
  const missing = SERIES_EXCLUDE_PATHSPECS.filter((ps) => !WF.includes("'" + ps + "'"));
  const extra = [...new Set(wfGlobPathspecs)].filter((ps) => !SERIES_EXCLUDE_PATHSPECS.includes(ps));
  assert.deepEqual(missing, [], `r25 job is missing exclusion pathspec(s): ${missing.join(", ")} (ADR-M003 D9 sexies)`);
  assert.deepEqual(
    extra,
    [],
    `r25 job carries :(glob) exclusion pathspec(s) with no marched root in SERIES_EXCLUDED_ROOTS: ${extra.join(", ")} ` +
      `(add the root to the source of truth — ADR-M003 D9 sexies; G2 checkpoint-2 C-1 / mutant M11)`,
  );

  const checked = new Set<string>();
  for (const rootRel of SERIES_EXCLUDED_ROOTS) {
    const root = join(ROOT, rootRel);
    if (!existsSync(root)) continue;
    for (const abs of seriesWalk(root)) {
      const rel = abs.slice(ROOT.length + 1).replace(/\\/g, "/");
      const ext = extname(abs);

      // Condition (c): no code disguised as a data series under an excluded root.
      assert.ok(
        !SERIES_CODE_EXTS.has(ext),
        `code file under an R-25-excluded root: ${rel} — only .json/.jsonl/.csv data may live there (D9 sexies c)`,
      );
      if (!SERIES_DATA_EXTS.has(ext)) continue;

      // Condition (a): declared + hashed in a same-dir declaration (its filename AND its LF sha256 present).
      const dir = dirname(abs);
      const self = basename(abs);
      const sha = seriesLfSha256(abs);
      const declFiles = readdirSync(dir)
        .filter((n) => n !== self && (/^PROVENANCE-.*\.md$/.test(n) || n === "manifest.json"))
        .map((n) => join(dir, n));
      // Binding name<->sha (G2 R-25-series C2 + checkpoint-2 C-2): the sha must sit on the row/bullet that
      // names THIS file, SAME LINE ONLY. A permuted table (each sha present SOMEWHERE in the document) is
      // red (mutant perm). The former rule (ii) — "a heading above the sha names the file" — is REMOVED
      // (checkpoint-2 C-2b): it bound ANY nameless sha line of the document, e.g. a historical sha under a
      // `## History` heading (mutant M6b). Name matching is by TOKEN, delimited by line start/end, backtick,
      // `|`, space, `/` or a parenthesis (checkpoint-2 C-2a): a PATH prefix (`fixtures/x/book.json`) still
      // binds `book.json`, but a NAME prefix (`full-book.json`) does NOT bind the sibling `book.json`
      // (mutant M5), nor does `book.json` bind inside `book.jsonl`. manifest.json is parsed by key.
      const siblingData = readdirSync(dir).filter((n) => SERIES_DATA_EXTS.has(extname(n)));
      const DELIM = "`| /()"; // token boundaries around a filename
      const namesFile = (line: string, n: string): boolean => {
        const esc = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[${DELIM}])${esc}($|[${DELIM}])`).test(line);
      };
      const bindsSelf = (line: string): boolean => {
        const named = siblingData.filter((n) => namesFile(line, n));
        return named.length === 1 && named[0] === self;
      };
      const declaredIn = declFiles.find((d) => {
        const text = readFileSync(d, "utf8");
        if (basename(d) === "manifest.json") {
          try {
            const m = JSON.parse(text) as Record<string, unknown>;
            return m[self] === sha;
          } catch {
            return false;
          }
        }
        // Same-line only: one line carries BOTH this file's exact sha AND its (token-delimited) name.
        return text.split(/\r?\n/).some((line) => line.includes(sha) && bindsSelf(line));
      });
      assert.ok(
        declaredIn !== undefined,
        `series file not declared+hashed same-dir: ${rel} (sha256 LF ${sha}). Add a PROVENANCE-*.md line in ` +
          `${dir.slice(ROOT.length + 1).replace(/\\/g, "/")} carrying its filename and this exact sha (D9 sexies a).`,
      );
      checked.add(rel);
    }
  }

  // Anchor both excluded roots concretely: a walk that silently reached nothing would be a false green.
  assert.ok(checked.has("fixtures/usde-calib-series.json"), "walk did not reach the usde series (broken fixtures root?)");
  assert.ok(
    checked.has("apps/sentinel/test/fixtures/usde-boundary-blocks.json"),
    "walk did not reach the sentinel boundary fixture (broken apps/sentinel/test/fixtures root?)",
  );
});

// (checkpoint-2 V-1(b)/V-3, 2026-09-19) The CI hang backstops are LOCKED, not merely present by inspection: (a) EVERY
// job under `jobs:` carries a job-level `timeout-minutes` <= 20 (a hung run — e.g. an unbounded recorder retry — cannot
// pend a job toward GitHub's 6h ceiling); (b) package.json `scripts.test` carries both `--test-timeout=` (per-test
// guard) and `--test-force-exit` (exit even if a handle leaks after the tests settle). Mutants (measured in the pli):
// drop a job's timeout-minutes => red; set one to 30 => red; drop --test-force-exit => red. Job keys are the 2-space
// entries of the top-level `jobs:` block (not a global regex); the timeout line is anchored at the 4-space (job) column
// so a step-level (8-space) timeout-minutes cannot masquerade as the job backstop.
test("ci_jobs_have_timeout_and_test_flags_locked — per-job timeout-minutes <= 20 + test guards (checkpoint-2 V-1(b)/V-3)", () => {
  const jobsIdx = LINES.findIndex((l) => /^jobs\s*:/.test(l));
  assert.notEqual(jobsIdx, -1, "top-level key 'jobs:' missing from the workflow");
  const jobs: { name: string; start: number }[] = [];
  for (let i = jobsIdx + 1; i < LINES.length; i++) {
    const l = LINES[i]!;
    if (/^\S/.test(l) && !/^\s*#/.test(l)) break; // a column-0 non-comment key ends the jobs block
    const m = /^  ([A-Za-z0-9_-]+)\s*:\s*$/.exec(l); // a job key: exactly 2-space indent, bare `name:`
    if (m && m[1]) jobs.push({ name: m[1], start: i });
  }
  assert.ok(jobs.length >= 5, `expected >= 5 jobs under jobs:, saw ${jobs.length} (${jobs.map((j) => j.name).join(",")})`);
  for (let j = 0; j < jobs.length; j++) {
    const end = j + 1 < jobs.length ? jobs[j + 1]!.start : LINES.length;
    const block: string[] = [];
    for (let i = jobs[j]!.start + 1; i < end; i++) block.push(LINES[i]!.replace(/#.*$/, ""));
    const tmLine = block.find((l) => /^    timeout-minutes\s*:\s*\d+\s*$/.test(l)); // 4-space = job level (not an 8-space step)
    assert.ok(tmLine, `job '${jobs[j]!.name}' has no job-level timeout-minutes (a hung run could pend it to GitHub's 6h ceiling; checkpoint-2 V-1(b))`);
    const minutes = Number(tmLine.replace(/\D/g, ""));
    assert.ok(minutes <= 20, `job '${jobs[j]!.name}' timeout-minutes=${minutes} exceeds the 20-minute backstop (checkpoint-2 V-1(b))`);
  }
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: { test: string } };
  const testScript = pkg.scripts.test;
  assert.match(testScript, /--test-timeout=\d+/, "scripts.test must carry --test-timeout=<ms> (the per-test hang guard, checkpoint-2 V-1(b))");
  assert.ok(testScript.includes("--test-force-exit"), "scripts.test must carry --test-force-exit (exit even if a handle leaks after the tests settle)");
});
