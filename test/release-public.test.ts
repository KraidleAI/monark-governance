/**
 * Root test `release_public_guards` (ADR-M010 section 5/6) — mutant tests for the three PURE guard
 * functions that scripts/release-public.mjs exports behind its run-guard: isSemverTag, checkReleaseText,
 * branchGuard. Each test carries a positive case, a negative case, and the specific mutation-catching
 * assertion named in ADR-M010 section 5 ("isSemverTag mutated to accept v1 must red; branchGuard mutated
 * to ignore porcelain must red; checkReleaseText mutated to pass empty text must red").
 *
 * This file lives at the REPO ROOT test/ — governance-only: scripts/release-public.mjs is NOT whitelisted
 * and the root test/ dir is NOT exported (only packages/-star-/test and apps/harness/test are), so these
 * tests never run in the public CI. They DO run in `npm run ci` locally.
 *
 * Import inertness (ADR-M010 section 5, "importing this module never triggers a release"): the module body
 * that gates -> exports -> pushes lives in a run-guarded main(); importing the three pure functions must be
 * side-effect free. The last test spawns `node -e "import(<module>)"` with an argv that is NOT the module
 * path, so the run-guard stays false, and asserts a clean exit with no release banner / no abort.
 *
 * NOTE on the French test string: scripts/lang-gate.mjs scans this very file (root scope). To keep the
 * source ASCII (so the language gate stays green on this governance test) while still handing
 * checkReleaseText genuinely accented French at RUNTIME, the two diacritics are built from char codes:
 * 0xE9 = e-acute, 0xE7 = c-cedilla. The forbidden-vocab sample is plain English ASCII; grep-forbidden does
 * not scan the root test/ dir, so neither gate reddens on this file.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { isSemverTag, checkReleaseText, branchGuard } from "../scripts/release-public.mjs";

const E_ACUTE = String.fromCharCode(0xe9); // e-acute
const C_CEDILLA = String.fromCharCode(0xe7); // c-cedilla
// Decodes at runtime to "Ameliorations et corrections francaises." with real diacritics on the marked
// letters; the source above stays pure ASCII so lang-gate does not flag this governance file.
const FRENCH_SAMPLE = `Am${E_ACUTE}liorations et corrections fran${C_CEDILLA}aises.`;
const CLEAN_ENGLISH = "Public mirror sync. Frozen contracts and the coverage gate are unchanged in this release.";
const FORBIDDEN_VOCAB = "Now with anti-hallucination and guaranteed coverage."; // hits two GLOBAL vocab bans

test("isSemverTag — accepts v0.x.y, rejects major>=1 / partial / non-v / suffixed / trailing space", () => {
  // Positive: canonical 0.x tags.
  assert.equal(isSemverTag("v0.1.0"), true, "v0.1.0 must be accepted");
  assert.equal(isSemverTag("v0.12.3"), true, "v0.12.3 (multi-digit) must be accepted");

  // Negative: the shapes ADR-M010 section 5 enumerates.
  assert.equal(isSemverTag("v0.1"), false, "v0.1 (no patch) must be rejected");
  assert.equal(isSemverTag("0.1.0"), false, "0.1.0 (no leading v) must be rejected");
  assert.equal(isSemverTag("v0.1.0-rc"), false, "v0.1.0-rc (pre-release suffix) must be rejected");
  assert.equal(isSemverTag("v0.1.0 "), false, "v0.1.0 with a trailing space must be rejected");

  // MUTATION-CATCHER (ADR-M010 section 5): isSemverTag relaxed to /^v\d+\.\d+\.\d+$/ would accept v1.0.0.
  // A green build then ships a MAJOR>=1 tag the schemas never authorised, so this assertion must red it.
  assert.equal(isSemverTag("v1.0.0"), false, "v1.0.0 (MAJOR>=1) must be rejected — 1.0.0 is a human decision");
});

test("checkReleaseText — clean English passes; French, forbidden vocab, and empty/whitespace fail", () => {
  // Positive: a clean English notes string clears BOTH gates.
  assert.equal(checkReleaseText(CLEAN_ENGLISH).ok, true, "clean English release text must pass");

  // Negative (language gate): accented French reddens the language gate wired inside checkReleaseText.
  assert.equal(checkReleaseText(FRENCH_SAMPLE).ok, false, "French text must be rejected (language gate)");

  // Negative (vocab gate): a marketing/guarantee claim reddens the GLOBAL vocab gate wired inside it.
  assert.equal(checkReleaseText(FORBIDDEN_VOCAB).ok, false, "a forbidden-vocab claim must be rejected (vocab gate)");

  // Both gates are genuinely wired: the French sample is clean of vocab bans, the vocab claim is clean of
  // French, yet each is rejected — so neither rejection can be the other gate firing.
  assert.ok(checkReleaseText(FRENCH_SAMPLE).hits.length >= 1, "French sample must produce at least one hit");
  assert.ok(checkReleaseText(FORBIDDEN_VOCAB).hits.length >= 1, "vocab sample must produce at least one hit");

  // MUTATION-CATCHER (ADR-M010 section 5): checkReleaseText relaxed to pass empty text would return ok:true
  // here. Empty and whitespace-only notes must both be refused (an empty Release note is not a release).
  assert.equal(checkReleaseText("").ok, false, "empty text must be rejected");
  assert.equal(checkReleaseText("   ").ok, false, "whitespace-only text must be rejected");

  // Lock the tool's DERIVED free text: the annotated-tag message `MONARK <tag>` and the Release title (the
  // bare tag) must both pass the same firewall before the release. This guards the derived strings staying
  // green — NOT the "MONARK" lang-exempt entry: "MONARK" is all-caps ASCII, neither an FR word nor an FR
  // identifier, so lang-gate never flags it, exemption present or not; only the vocab gate could redden it.
  assert.equal(checkReleaseText("MONARK v0.1.0").ok, true, "the derived annotated-tag message must pass the firewall");
  assert.equal(checkReleaseText("v0.1.0").ok, true, "the derived Release title (the bare tag) must pass the firewall");
});

test("checkReleaseText — storefront honesty bar (m-4): site + skills scoped bans redden; honest negations pass", () => {
  // Release notes are public storefront text (ADR-M010 section 4 m-4): checkReleaseText applies the site
  // AND skills scoped honesty bans on top of GLOBAL. Each term below is UNIQUE to one scope (absent from
  // GLOBAL and from the other scope), so it doubles as that scope's mutation-catcher.

  // Site-scope: a third-party venue brand. If the site scope were dropped, this would pass.
  assert.equal(checkReleaseText("MONARK plugs straight into Aave.").ok, false, "a site-scoped brand (Aave) must redden — proves the site scope is wired");

  // Skills-scope: securities vocab. If the skills scope were dropped, this would pass.
  assert.equal(checkReleaseText("Redemptions now earn yield for holders.").ok, false, "a skills-scoped term (yield) must redden — proves the skills scope is wired");

  // A shared storefront honesty term reddens at the bar either way.
  assert.equal(checkReleaseText("The fleet is fully autonomous now.").ok, false, "an autonomy claim must redden at the storefront bar");

  // Cross-scope exemption (why the two scopes' exemptPhrases are UNIONed): "no confidence field" is an
  // honest negation exempt on the SITE surface. Without the union it would still redden under the SKILLS
  // scan (which also bans "confidence"); with the union it passes on both.
  assert.equal(checkReleaseText("This release keeps the fleet invariant: no confidence field is exposed.").ok, true, "the honest 'no confidence field' negation must pass under the union exemption");

  // Over-exemption regression: the exempt phrase masks ONLY its own span, so a real ban co-located with it
  // still reddens. If the masker ever blanked the whole line, this would wrongly pass.
  assert.equal(checkReleaseText("The fleet is autonomous; no confidence field is exposed.").ok, false, "a real ban next to an exempt phrase must still redden (no over-exemption)");
});

test("branchGuard — ok only on a clean main; a wrong branch or a dirty tree refuses", () => {
  // Positive: on main with an empty porcelain.
  assert.equal(branchGuard("main", "").ok, true, "main + clean tree must pass");

  // Negative: the wrong branch (this lot's own branch) must refuse.
  assert.equal(branchGuard("lot-m010", "").ok, false, "a non-main HEAD must be refused");

  // MUTATION-CATCHER (ADR-M010 section 5): branchGuard relaxed to ignore `porcelain` would pass ('main','?? x').
  // A dirty tree on main must refuse, so this assertion reds that mutation.
  assert.equal(branchGuard("main", "?? x").ok, false, "a dirty tree (non-empty porcelain) must be refused");
});

test("importing release-public.mjs is inert — the run-guard prevents any release on import", () => {
  // The three exports are functions (import resolved without executing the CLI body).
  for (const fn of [isSemverTag, checkReleaseText, branchGuard]) {
    assert.equal(typeof fn, "function", "each guard must be an exported function");
  }

  // Reproducible isolation: a fresh `node -e "import(<module>)"` process. Its argv[1] is undefined (not the
  // module path), so the run-guard is false and main() never runs. Assert a clean exit and no release
  // banner / no RELEASE ABORTED in either stream — proof that the import performs no gate/export/push.
  const modUrl = pathToFileURL(join(import.meta.dirname, "..", "scripts", "release-public.mjs")).href;
  const probe = spawnSync(
    process.execPath,
    ["-e", `import(${JSON.stringify(modUrl)}).then(() => {}, (e) => { console.error(e); process.exit(3); })`],
    { encoding: "utf8", timeout: 60_000 },
  );
  const out = `${probe.stdout ?? ""}\n${probe.stderr ?? ""}`;
  assert.equal(probe.status, 0, `importing the module must exit 0 (status=${String(probe.status)}): ${out.slice(-500)}`);
  assert.ok(!/RELEASE ABORTED/.test(out), "importing the module must not abort a release");
  assert.ok(!/^=== /m.test(out), "importing the module must not print a release step banner (=== ...)");
});
