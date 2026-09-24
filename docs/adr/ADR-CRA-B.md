# ADR-CRA-B — CRA no-regret artefacts (route B) for MONARK

Status: accepted (route B ratified by the investor, decisions 42-43, 2026-09-19).
Date: 2026-09-19. Models: `claude-opus-4-8` (worker, effort max), `claude-fable-5-1`
(orchestrator / validateur). Lot: CRA-B. Base: `lot/cra-b` (worktree `F:\Monark-wt-crab`).

## Context

Regulation (EU) 2024/2847 (the Cyber Resilience Act) may or may not apply to MONARK. The
entry audit (`docs/AUDIT-ENTREE-CRA-2026-09-19.md`) and the advisor opinion
(`docs/AVIS-ADVISOR-CRA-2026-09-19.md`) leave applicability INDETERMINATE — a mixed
question of fact and law the primary text alone does not settle. The nearest deadline
(Article 14, applicable since 11 September 2026 for a product within scope) would already
be live if MONARK were a manufacturer of a product within scope. Rather than assert
applicability either way, this lot ships the artefacts that help under either answer and
cost nothing if the answer is "not within scope".

## Decision

Route B (ratified, investor decisions 42-43): ship the CRA no-regret public artefacts now,
without waiting for counsel, and without asserting that the CRA applies or that it does
not (G0 objective).

- `SECURITY.md` (repo root, whitelisted for the public export): Reporting (GitHub Security
  Advisories only — no e-mail, no bounty; investor decision 42), Scope, Supported versions
  ("latest tagged release on KraidleAI/Monark", no frozen number — C-9), Timelines (72 h
  acknowledgement, 90-day coordinated disclosure — investor decision 43), Data (no personal
  data required; the measured Caddy access log).
- `docs/PROCEDURE-notification-CRA.md` (internal, English): the Article 14 clocks, written
  conditionally ("if MONARK is in scope as a manufacturer"), inbound channel = GitHub
  Security Advisories; the CSIRT fallback is left undetermined (counsel Q1).
- SBOM in CI (job `g6-compliance`): `npm sbom` CycloneDX per run, uploaded as an artefact.
- `docs/PRODUCT-BOUNDARY.md`: the distributed surface versus the internal tree.

## Alternatives

- Route A (declare MONARK a manufacturer / steward, full conformity work now): premature
  while applicability is indeterminate and the monetisation trigger has not fired.
- Do nothing until counsel: leaves the public surface (SECURITY.md, SBOM) absent at
  release, which the orchestrator's decision 21 treats as a blocker.

## Consequences

- The public surface gains SECURITY.md and an SBOM with no conformity claim; six root tests
  keep them honest and wired (see Tuyaux).
- Timelines source: the 72 h / 90-day windows are MONARK's own committed policy (investor
  decision 43), aligned with the coordinated vulnerability disclosure practice of
  ISO/IEC 29147:2018. ISO/IEC 29147:2018 was NOT read for this lot (paywalled ISO
  standard) — it is named as the framework, and NO number is attributed to it (the windows
  are the maintainer's decision, not a quantity taken from the standard). Procurement
  (docs 03): if a verbatim citation of 29147's coordinated-disclosure process is later
  required, acquire ISO/IEC 29147:2018 (ISO, list price ~CHF 200; usage: cite the
  coordinated-disclosure clause). Formed item with trigger, not a bare due.
- Route A stays conditional on two events (advisor section 4): KraidleAI a legal person AND
  a decision to charge — counsel BEFORE the first payment.

## Measurements (reproducible)

- PVR (private vulnerability reporting) on KraidleAI/Monark:
  `gh api repos/KraidleAI/Monark/private-vulnerability-reporting` -> `{"enabled":true}`
  (2026-09-19, gh authenticated as Kraidle). GitHub Security Advisories is therefore
  available as the reporting channel.
- upload-artifact SHA: `gh api repos/actions/upload-artifact/git/ref/tags/v7.0.1` ->
  `object.type=commit`, `object.sha=043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` (2026-09-19).
- SBOM: `npm sbom --sbom-format cyclonedx --omit dev --package-lock-only` (local npm
  11.12.1) -> CycloneDX 1.5, 183 components, exit 0. `--package-lock-only` fixes the
  COMPONENT SET (without it: 153 components, environment drift). `serialNumber` and
  `metadata.timestamp` are generated per run, so the BYTES are not reproducible;
  `metadata.component.name` is the checkout directory name (`Monark-wt-crab` locally,
  `Monark` in CI). The CI-bundled npm (via `setup-node@24`) version is not measured —
  stated as such.

## SBOM origin (C-8)

The CI SBOM is computed from the lockfile of the tree it runs in. The PRIVATE governance
tree carries packages the public mirror does not ship (for example `apps/bell`), so a
private-tree SBOM is a superset of the public one. The SBOM published at a release is the
SBOM of the PUBLIC repository where the tag lives — the distributed surface, not the
governance tree (`docs/PRODUCT-BOUNDARY.md`).

## Tuyaux (branchement)

- `SECURITY.md` -> GitHub (Security tab, served) + the export whitelist
  (`scripts/export-public.mjs`, ADR-M004 D7 quinquies). Tests:
  `security_policy_present_and_closed` (sections + channel + windows),
  `public_surfaces_make_no_probative_claim` (`surfaces()` extended),
  `cra_surfaces_stay_conditional`, `product_boundary_matches_export_list`
  (`collectFiles(ROOT).kept` contains it).
- SBOM -> CI artefact per run (job `g6-compliance`) -> release tag (trigger, out of lot).
  Test: `ci_publishes_sbom`. Local mirror: `scripts/sbom.mjs` (`SBOM_COMMAND` single
  source; NOT whitelisted and NOT called by CI, which runs the raw command).
- Procedure -> `docs/JOURNAL-PROVENANCE.md` (one dated line per Article 14 step). Test:
  `notification_procedure_declares_clocks` (clocks + real language oracle via
  `scanFile`/`loadExempt`).
- `docs/PRODUCT-BOUNDARY.md` -> the export whitelist. Test:
  `product_boundary_matches_export_list`.

## Questions for counsel (advisor opinion section 5)

- Q1 non-EU anchoring: importer (Article 3(16)), authorised representative (Article 18,
  permissive), competent surveillance authority (Article 52) for a manufacturer with no EU
  establishment — and thus which CSIRT the Article 14(7) fallback names.
- Q3 does a documented intent to monetise, with no mechanism yet, already characterise a
  commercial activity (recital 15 versus examples 14-16 of the guidance)?
- Q6 is a ClawHub skill "software" within Article 3(4)?
- Q2/Q5 (merged) if so, is the hosted service a remote data processing solution (guidance
  sections 184-202)?
- Q4 only if the free/paid split (community-edition steward versus paid-edition
  manufacturer) is not clean.

## Non-regret note

This lot asserts neither applicability nor non-applicability of the CRA. The mechanical
scrub `cra_surfaces_stay_conditional` enforces the no-claim rule on the public CRA
surfaces; conditional wording and this ADR carry the rest.
