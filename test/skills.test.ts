/**
 * Root tests for the MONARK ClawHub skill (Lot M006-B, ADR-M006 D0..D11). Non-LLM oracles over the
 * generated skill artefacts under skills/monark/ + the extended gates. Five tests, each killed by >= 1
 * named mutant (proven red, then restored byte-exact via sha256 — see the passe report):
 *
 *   skill_carries_calibrate_label_verbatim   — SKILL.md carries CALIBRATE_LABEL byte-exact (D2/C-4)
 *   skill_vocab_is_non_vacuous               — surclaims redden, honest phrases green, exemptions load-bearing (D2/M-2/M-9)
 *   skill_carries_the_negative_honesty_lines — the B_t-mechanism / allow≠execute / no-price / operational / classes lines (D2/D9/D11)
 *   export_includes_skills                   — skills/ whitelisted, SKILL.md exported, fail-closed on absence (D5/M-4)
 *   skill_is_mit0                            — LICENSE is MIT-0 (MIT No Attribution), not plain MIT (D4)
 *
 * Run by `npm test` at the repo root (root test/ is NOT in the public export whitelist, so this file is
 * local-only, like ci-gates.test.ts / export-public.test.ts). Fully typed (lint ratchet ceiling).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import { CALIBRATE_LABEL } from "../apps/harness/src/tools/calibrate.ts";
import { compilePatterns, scanText } from "../scripts/grep-forbidden.mjs";
import { collectFiles, WHITELIST_DIRS } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, "..");
const SKILL_DIR = join(ROOT, "skills", "monark");
const SKILL = readFileSync(join(SKILL_DIR, "SKILL.md"), "utf8");

interface VocabRule {
  re: string;
  why: string;
}
interface VocabConfig {
  banned: VocabRule[];
  scan: { skills: { extensions: string[]; banned: VocabRule[]; exemptPhrases: string[] } };
}

/** The skills/ artefacts the vocab gate actually scans (.md/.json/.yaml/.txt), read as raw text. */
function skillsSurfaces(): { rel: string; text: string }[] {
  const EXTS = new Set([".md", ".json", ".yaml", ".txt"]);
  const out: { rel: string; text: string }[] = [];
  const walk = (absDir: string, rel: string): void => {
    for (const name of readdirSync(absDir)) {
      const abs = join(absDir, name);
      if (statSync(abs).isDirectory()) walk(abs, `${rel}/${name}`);
      else if (EXTS.has(extname(name).toLowerCase())) out.push({ rel: `${rel}/${name}`, text: readFileSync(abs, "utf8") });
    }
  };
  walk(join(ROOT, "skills"), "skills");
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
test("skill_carries_calibrate_label_verbatim — SKILL.md embeds CALIBRATE_LABEL byte-exact (ADR-M006 D2/C-4)", () => {
  // Positive control: the imported constant is the real, non-empty label (a hollow import would make the
  // includes() check vacuous). Sourced from apps/harness/src/tools/calibrate.ts — the single K-1 carrier.
  assert.ok(
    CALIBRATE_LABEL.length > 300 && CALIBRATE_LABEL.includes("split-conformal") && CALIBRATE_LABEL.includes("exchangeable"),
    "CALIBRATE_LABEL did not import as the real honesty label",
  );
  // Byte-exact carriage. Named mutant: paraphrase the label in SKILL.md (e.g. change "ONLY" to "only")
  // ⇒ this reds. Proven via a scratchpad cp backup + sha256 restore (passe report).
  assert.ok(SKILL.includes(CALIBRATE_LABEL), "SKILL.md must carry CALIBRATE_LABEL byte-exact (verbatim, C-4)");
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────
test("skill_vocab_is_non_vacuous — surclaims redden, honest phrases green, exemptions load-bearing (ADR-M006 D2/M-2/M-9)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as VocabConfig;
  const skills = cfg.scan.skills;
  assert.ok(skills, "scope 'skills' missing from vocab-banned.json (ADR-M006 D2)");
  assert.deepEqual([...skills.extensions].sort(), [".json", ".md", ".txt", ".yaml"], "skills scope scans .md/.json/.yaml/.txt");
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(skills.banned)];
  const phrases = skills.exemptPhrases;

  // (a) MUTANTS — every surclaim (positive AND negative/securities) reddens the skills vocab gate.
  const surclaims: [string, string][] = [
    ["spend-guard mis-read (bare, no $/token)", "MONARK is a spend cap for your agent."],
    ["naked probative", "the supplied scores are probative of the outcome."],
    ["naked guarantee of coverage", "MONARK guarantees coverage of your predictions."],
    ["predicts (price prediction claim)", "the engine predicts prices for you."],
    ["securities: profit-share", "operators receive a profit-share on inference."],
    ["securities: yield/APY", "deposit the token for a fixed APY yield."],
    ["securities: staking", "stake the token to unlock the gate."],
    ["M-9: live", "the gate is live and audited in production."],
    ["M-9: proven", "a proven track record over thousands of calls."],
  ];
  for (const [label, s] of surclaims) {
    assert.ok(scanText(s, patterns, phrases).length >= 1, `surclaim must redden (${label}): "${s}"`);
  }

  // (b) HONEST — the exact phrases the honest framing needs must stay GREEN (negation-aware + exemptPhrase).
  const honest: [string, string][] = [
    ["exempt $/token spend cap + green 'spend controls'", "For a $/token spend cap, use your platform's spend controls; MONARK is not that."],
    ["negation-aware 'not probative'", "attest is demonstrative, not probative."],
    ["negation-aware 'no guarantee'", "MONARK offers no guarantee of availability."],
    ["'predictor'/'prediction' are not 'predicts'", "the caller brings its own predictor and its prediction."],
  ];
  for (const [label, s] of honest) {
    assert.deepEqual(scanText(s, patterns, phrases), [], `honest phrase must stay green (${label}): "${s}"`);
  }

  // (c) exemptPhrases are NON-INERT (each occurs in a scanned skills file) AND LOAD-BEARING (removing it
  //     reds that very file). Mirrors vocab_site_confidence_exemption's non-inert + load-bearing proof.
  assert.ok(Array.isArray(phrases) && phrases.length >= 1, "skills scope must carry a closed exemptPhrases list");
  // The narrowed rule must still be PRESENT — the exemption narrows the spend-guard ban, never removes it.
  assert.ok(skills.banned.some((b) => /spend\[/.test(b.re)), "the skills scope must still ban the spend-guard mis-read");
  const surfaces = skillsSurfaces();
  assert.ok(surfaces.length >= 2, "expected at least SKILL.md + INTEGRATION.md scanned (false green)");
  for (const phrase of phrases) {
    const carrier = surfaces.find((s) => s.text.includes(phrase));
    assert.ok(carrier, `exempt phrase '${phrase}' occurs in no skills file — inert exemption (C-1)`);
    const withoutThis = phrases.filter((p) => p !== phrase);
    assert.ok(
      scanText(carrier.text, patterns, withoutThis).length >= 1,
      `(c) removing exempt '${phrase}' must redden its carrier ${carrier.rel} (load-bearing)`,
    );
  }

  // (d) STEADY STATE — with the full closed exemptions, EVERY scanned skills file is vocab-clean (the
  //     in-process mirror of `npm run gate:vocab`; a stray banned word in a skill file reds here too).
  for (const s of surfaces) {
    assert.deepEqual(scanText(s.text, patterns, phrases), [], `skills file must be vocab-clean with the closed exemptions: ${s.rel}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────
test("skill_carries_the_negative_honesty_lines — B_t mechanism / allow≠execute / no price / operational / committed classes (ADR-M006 D2/D9/D11)", () => {
  // The accepted-contract (ADR-M006 D2) wording is asserted verbatim, so a paraphrase or a deletion reds.
  const required: [string, string][] = [
    ["B_t is caller-carried, stateless", "B_t is a number YOU pass in each call; MONARK never measures, derives, or stores it (stateless)"],
    ["compared to caller's bFloor", "it is compared only to YOUR bFloor (below it ⇒ budget_exhausted)"],
    ["NOT a spend cap / rate-limit (ADR D2 wording)", "It is NOT a $/token spend cap and NOT a rate-limit."],
    ["allow is a coverage verdict, not permission to execute", "`allow` is a coverage verdict on YOUR prediction, NOT permission to execute the named tool"],
    ["no price prediction / no legitimacy judgement", "does not evaluate the legitimacy of an act and does not predict prices"],
    ["use your platform's spend controls", "For a $/token spend cap, use your platform's spend controls; MONARK is not that."],
    ["positive: gate never executes", "gate never executes the named tool"],
    ["positive: attest is demonstrative, not probative", "attest is demonstrative, not probative"],
    ["operational line (D11/M-6)", "no availability commitment; bounded: n ≤ 10000 scores, request\nbody ≤ 256 KB"],
    ["committed classes are plumbing fixtures (D9/C-3)", "internal\n**plumbing fixtures**"],
    ["committed class btc-dir-15m (D9/C-3)", "`btc-dir-15m`"],
    ["committed class cascade-liquidable-24h (D9/C-3)", "`cascade-liquidable-24h`"],
    ["classes are NOT use cases", "They are NOT use cases. The real path is BYO"],
  ];
  for (const [label, line] of required) {
    assert.ok(SKILL.includes(line), `SKILL.md must carry the honesty line (${label}): "${line}"`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────
test("export_includes_skills — skills/ whitelisted, SKILL.md exported, fail-closed on absence (ADR-M006 D5/M-4)", () => {
  // (a) config-level: 'skills' is a REQUIRED whitelist dir.
  assert.ok(WHITELIST_DIRS.includes("skills"), "'skills' must be in export WHITELIST_DIRS (ADR-M006 D5)");

  // (b) in-process (the real root's LICENSE is absent pending investor Q4, so the full export CLI fails
  //     closed by design — export-public.mjs:69-70; we assert on collectFiles directly instead).
  const { kept, missingRequired } = collectFiles(ROOT);
  const keptPaths = new Set(kept.map((f) => f.rel.replace(/\\/g, "/")));
  assert.ok(keptPaths.has("skills/monark/SKILL.md"), "skills/monark/SKILL.md must be collected for the public export");
  assert.ok(keptPaths.has("skills/monark/INTEGRATION.md"), "skills/monark/INTEGRATION.md must be collected");
  assert.ok(keptPaths.has("skills/monark/LICENSE"), "skills/monark/LICENSE must be collected");
  assert.ok(!missingRequired.includes("skills"), "'skills' exists ⇒ not a fail-closed-missing entry");

  // (c) FAIL-CLOSED (M-4): a root that carries the fail-closed machinery collectFiles reads
  //     (scripts/export-exclude-tests.json + scripts/lang-exempt.json) but NO skills/ must report 'skills'
  //     as a missing required entry — so the whitelist can never point at an absent dir silently.
  const tmp = mkdtempSync(join(tmpdir(), "monark-skills-fc-"));
  try {
    mkdirSync(join(tmp, "scripts"), { recursive: true });
    copyFileSync(join(ROOT, "scripts", "export-exclude-tests.json"), join(tmp, "scripts", "export-exclude-tests.json"));
    copyFileSync(join(ROOT, "scripts", "lang-exempt.json"), join(tmp, "scripts", "lang-exempt.json"));
    const { missingRequired: mr } = collectFiles(tmp);
    assert.ok(mr.includes("skills"), "fail-closed: 'skills' absent from a tree ⇒ missingRequired (ADR-M006 M-4)");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────
test("skill_is_mit0 — LICENSE is MIT-0 (MIT No Attribution), not plain MIT (ADR-M006 D4)", () => {
  // Text sourced from SPDX MIT-0 (spdx.org/licenses/MIT-0.html, [lu] 2026-09-11); ClawHub imposes MIT-0
  // on published skills (R-P4 #14, docs/skill-format.md L198-209 [lu]).
  const lic = readFileSync(join(SKILL_DIR, "LICENSE"), "utf8");
  assert.match(lic, /MIT No Attribution/, "LICENSE must be MIT-0 (title 'MIT No Attribution')");
  assert.match(lic, /without restriction/, "positive control: the permission grant paragraph is present");
  // DISCRIMINATOR: MIT-0 DROPS MIT's attribution-retention clause. Its presence would make this plain MIT
  // (attribution required) — the exact opposite of what ClawHub imposes. Named mutant: add the clause ⇒ red.
  assert.ok(
    !/shall be included in all copies/i.test(lic),
    "MIT-0 must NOT carry MIT's 'shall be included in all copies' attribution clause (else it is plain MIT)",
  );
});
