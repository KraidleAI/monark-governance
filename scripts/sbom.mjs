// scripts/sbom.mjs — local CycloneDX SBOM helper for the CRA no-regret lot (ADR-CRA-B L-3).
// Node 24, ZERO dependencies. NOT whitelisted for the public export and NOT called by CI: the
// g6-compliance job runs the raw command below, and SBOM_COMMAND is its single source of truth,
// asserted against .github/workflows/ci.yml by the root test `ci_publishes_sbom`. This script is a
// LOCAL mirror: it runs the same command, checks the output is a CycloneDX bill with >= 1 component,
// and writes it to an --out path (default sbom.cdx.json in the cwd; the file is gitignored).
//
//   node scripts/sbom.mjs --out <path>
//
// `--package-lock-only` makes the COMPONENT SET reproducible (measured 2026-09-19: 183 components,
// CycloneDX 1.5). It does NOT make the bytes reproducible: `serialNumber` and `metadata.timestamp`
// are generated per run.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath as urlToPath } from "node:url";

/** The exact command the CI job runs (single source of truth; asserted by ci_publishes_sbom). */
export const SBOM_COMMAND = "npm sbom --sbom-format cyclonedx --omit dev --package-lock-only";

/** Throw unless `raw` parses as a CycloneDX bill with >= 1 component. Returns the parsed bill. */
export function validateSbom(raw) {
  const bom = JSON.parse(raw);
  if (bom.bomFormat !== "CycloneDX") throw new Error(`SBOM bomFormat=${JSON.stringify(bom.bomFormat)}, expected "CycloneDX"`);
  if (!Array.isArray(bom.components) || bom.components.length < 1) throw new Error("SBOM carries no components");
  return bom;
}

function main(argv) {
  let out = "sbom.cdx.json";
  for (let i = 0; i < argv.length; i++) if (argv[i] === "--out") out = argv[++i];
  // Fixed literal command as a single string (no args array) so shell:true does not trip DEP0190 (motif export-public.test.ts).
  const r = spawnSync(SBOM_COMMAND, { encoding: "utf8", shell: true, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 || r.error) { console.error(`sbom: command failed (status=${r.status}): ${r.error?.message ?? r.stderr}`); process.exit(1); }
  const bom = validateSbom(r.stdout);
  writeFileSync(resolve(out), r.stdout);
  console.log(`sbom OK — CycloneDX ${bom.specVersion}, ${bom.components.length} component(s) -> ${out}`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(urlToPath(import.meta.url))) main(process.argv.slice(2));
