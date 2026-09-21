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
| `packages/ukemi` | yes | git mirror | maintainer |

## Not distributed (kept internal)

- Governance and provenance: `docs/**` (architecture decision records,
  `docs/JOURNAL-PROVENANCE.md`, gate reports, audits, and this document) — reviewed at the
  checkpoints, never exported (the structural blacklist in `scripts/export-public.mjs`).
- The off-tool Bell collector `apps/bell` — not in the whitelist; its language gate runs on
  the source tree, not on the export.
- Root `test/**` and per-package `packages/*/docs/**` — not whitelisted.

## SBOM origin (why the tree matters)

The CI SBOM (`npm sbom --sbom-format cyclonedx --omit dev --package-lock-only`, job
`g6-compliance` in `.github/workflows/ci.yml`) is computed from the lockfile of the tree it
runs in. The private governance tree carries packages the public mirror does not ship (for
example `apps/bell`), so a private-tree SBOM is a superset of the public one. The SBOM
published at a release is the SBOM of the PUBLIC repository where the tag lives — the
distributed surface, not the governance tree. The component set is reproducible through
`--package-lock-only` (183 components, CycloneDX 1.5, measured 2026-09-19); the serial
number and the timestamp are generated per run, so the bytes are not reproducible.
