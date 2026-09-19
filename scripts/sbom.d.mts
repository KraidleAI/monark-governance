// scripts/sbom.d.mts — type surface for scripts/sbom.mjs so the root test ci_publishes_sbom can import
// SBOM_COMMAND WITHOUT executing the CLI and stay free of the ratcheted no-unsafe rules (same precedent as
// scripts/export-public.d.mts / scripts/lang-gate.d.mts). Runtime impl = sbom.mjs; Node ignores this file.
// Governance-only: NOT whitelisted for the public export (the g6 job runs the raw npm command, not this).

/** The exact command the CI g6-compliance job runs; single source of truth for the SBOM step. */
export const SBOM_COMMAND: string;
/** Throw unless `raw` parses as a CycloneDX bill with >= 1 component. Returns the parsed bill. */
export function validateSbom(raw: string): { bomFormat: string; specVersion: string; components: unknown[] };
