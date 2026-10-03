# Product boundary

What MONARK distributes versus what it keeps internal. "Distributed" means shipped to the
public mirror `KraidleAI/Monark` by `scripts/export-public.mjs`; that script's whitelist is
the single source of truth, and the root test `product_boundary_matches_export_list` keeps
this table in lockstep with it (every whitelist entry has a row here; a dropped row or a
dropped whitelist line reds the test). The hosted service (`mcp./api.monarkgate.tech`) and
the storefront (`monarkgate.tech`, on the VPS behind Caddy) are the served surfaces; the fleet register
`apps/site/lib/fleet.ts` records which agents are served and by which integration test.

This document makes no statement about whether any regulation applies to MONARK.

## Distributed surface (the public mirror)

Every row below is an entry of the export whitelist. "Surface" is the distribution path:
`git mirror` = the public git tree a reader clones; `CI` = GitHub Actions on the mirror;
`site` = the storefront; `MCP/HTTP` = the hosted harness wire; `skill` = ClawHub.
Responsible = the maintainer for every row (one maintainer today).

### Root files

| Path | Distributed | Surface | Responsible |
|---|---|---|---|
| `README.md` | yes | git mirror, site | maintainer |
| `LICENSE` | yes | git mirror | maintainer |
| `CONTRIBUTING.md` | yes | git mirror | maintainer |
| `SECURITY.md` | yes | git mirror, GitHub Security tab | maintainer |
| `.github/workflows/ci.yml` | yes | CI | maintainer |
| `eslint.config.mjs` | yes | git mirror, CI | maintainer |
| `lint-ratchet.json` | yes | git mirror, CI | maintainer |
| `vocab-banned.json` | yes | git mirror, CI | maintainer |
| `package.json` | yes | git mirror | maintainer |
| `package-lock.json` | yes | git mirror, CI | maintainer |
| `tsconfig.json` | yes | git mirror, CI | maintainer |
| `scripts/grep-forbidden.mjs` | yes | git mirror, CI | maintainer |
| `scripts/grep-forbidden.d.mts` | yes | git mirror | maintainer |
| `scripts/lint-ratchet.mjs` | yes | git mirror, CI | maintainer |
| `scripts/export-public.mjs` | yes | git mirror | maintainer |
| `scripts/lang-gate.mjs` | yes | git mirror, CI | maintainer |
| `scripts/lang-exempt.json` | yes | git mirror, CI | maintainer |
| `scripts/usde-full-pull.mjs` | yes | git mirror | maintainer |
| `scripts/record-usde-calib.mjs` | yes | git mirror | maintainer |
| `scripts/assert-fleet-html.mjs` | yes | CI | maintainer |
| `packages/atelier/index.html` | yes | git mirror | maintainer |
| `packages/atelier/main.js` | yes | git mirror | maintainer |
| `packages/atelier/style.css` | yes | git mirror | maintainer |
| `packages/atelier/serve.js` | yes | git mirror | maintainer |
| `out/mint.txt` | yes | git mirror, site | maintainer |
| `out/logo.png` | yes | git mirror, site | maintainer |
| `out/banner.jpg` | yes | git mirror, site | maintainer |
| `apps/bell/package.json` | yes | git mirror | maintainer |
| `apps/bell/keys/bell-keyring.json` | yes | git mirror, Bell host (trust root of the verifier) | maintainer |
| `apps/bell/scripts/bell-chain.mjs` | yes | git mirror, Bell host (deployed tree) | maintainer |
| `apps/bell/scripts/bell-chain.d.mts` | yes | git mirror | maintainer |
| `apps/bell/scripts/bell-publish.mjs` | yes | git mirror, Bell host (deployed tree) | maintainer |
| `apps/bell/scripts/bell-publish.d.mts` | yes | git mirror | maintainer |
| `apps/bell/scripts/bell-verify.mjs` | yes | git mirror (third-party verifier of the Bell host) | maintainer |
| `apps/bell/scripts/bell-verify.d.mts` | yes | git mirror | maintainer |
| `scripts/verify-bell.mjs` | yes | git mirror (deployment conformity check of the Bell host) | maintainer |
| `scripts/verify-bell.d.mts` | yes | git mirror | maintainer |
| `apps/dojo/package.json` | yes | git mirror | maintainer |
| `apps/dojo/keys/dojo-keyring.json` | yes | git mirror (trust root of the Dojo verifier, `--keyring`) | maintainer |
| `apps/dojo/scripts/dojo-verify-cli.mjs` | yes | git mirror (the reader's verifier of the Dojo, public command) | maintainer |
| `apps/dojo/scripts/dojo-verify-cli.d.mts` | yes | git mirror | maintainer |
| `apps/dojo/scripts/dojo-verify.mjs` | yes | git mirror, Dojo host (publication tree) | maintainer |
| `apps/dojo/scripts/dojo-verify.d.mts` | yes | git mirror | maintainer |
| `apps/dojo/scripts/dojo-chain.mjs` | yes | git mirror, Dojo host (publication tree) | maintainer |
| `apps/dojo/scripts/dojo-chain.d.mts` | yes | git mirror | maintainer |
| `apps/dojo/scripts/dojo-core.mjs` | yes | git mirror, Dojo host (publication and collect trees) | maintainer |
| `apps/dojo/scripts/dojo-core.d.mts` | yes | git mirror | maintainer |

### Directories (whole-tree or package-style export)

| Path | Distributed | Surface | Responsible |
|---|---|---|---|
| `schemas` | yes | git mirror, MCP/HTTP | maintainer |
| `fixtures` | yes | git mirror | maintainer |
| `enforcement` | yes | CI | maintainer |
| `apps/site` | yes | site | maintainer |
| `skills` | yes | skill | maintainer |
| `apps/harness` | yes | MCP/HTTP | maintainer |
| `apps/sentinel` | yes | git mirror, site (published timeline) | maintainer |
| `packages/atelier` | yes | git mirror | maintainer |
| `packages/contracts` | yes | git mirror | maintainer |
| `packages/hikae` | yes | git mirror | maintainer |
| `packages/monark` | yes | git mirror | maintainer |
| `packages/rpc-guard` | yes | git mirror | maintainer |
| `packages/ukemi` | yes | git mirror | maintainer |

## Not distributed (kept internal)

- Governance and provenance: `docs/**` (architecture decision records,
  `docs/JOURNAL-PROVENANCE.md`, gate reports, audits, and this document) — reviewed at the
  checkpoints, never exported (the structural blacklist in `scripts/export-public.mjs`).
- The off-tool Bell collector — `apps/bell/src/**`, `apps/bell/test/**`,
  `apps/bell/scripts/bell-report.mjs` (+ `.d.mts`) — the Bell governance files `docs/RUNBOOK-bell.md`,
  `docs/deploy-CA-bell.json`, the root Bell tests, and every `deploy/**` unit (the public export omits `deploy/`,
  ADR-NARABI-OPS-1c C3): not in the whitelist (ADR-M004 D7 octies, 2026-09-24).
  Only the Bell signed publication chain is distributed (rows above, file by file); the collector's language
  gate runs on the source tree.
- The Dojo collector and publication side — `apps/dojo/src/**`, `apps/dojo/test/**`,
  `apps/dojo/scripts/dojo-publish.mjs`, `dojo-seed.mjs` and `dojo-eve.mjs` (+ their `.d.mts`) — and the Dojo
  deployment conformity check `scripts/verify-dojo.mjs` (+ `.d.mts`), whose imports reach governance-only scripts
  (`scripts/dojo-deploy.mjs`, `scripts/sync-dojo-served.mjs`): not in the whitelist (ADR-M004 D7 nonies, 2026-10-03).
  Only the reader's verifier is distributed (the import closure of `apps/dojo/scripts/dojo-verify-cli.mjs`, its
  public keyring and the package manifest, rows above, file by file); the rest of `apps/dojo` stays under the
  language gate of the source tree (`root` scope).
- Root `test/**` and per-package `packages/*/docs/**` — not whitelisted.

## SBOM origin (why the tree matters)

The CI SBOM (`npm sbom --sbom-format cyclonedx --omit dev --package-lock-only`, job
`g6-compliance` in `.github/workflows/ci.yml`) is computed from the lockfile of the tree it
runs in. The private governance tree carries sources the public mirror does not ship (for
example the Bell collector `apps/bell/src`), so a private-tree SBOM is a superset of the public one. The SBOM
published at a release is the SBOM of the PUBLIC repository where the tag lives — the
distributed surface, not the governance tree. The component set is reproducible through
`--package-lock-only` (183 components, CycloneDX 1.5, measured 2026-09-19); the serial
number and the timestamp are generated per run, so the bytes are not reproducible.
