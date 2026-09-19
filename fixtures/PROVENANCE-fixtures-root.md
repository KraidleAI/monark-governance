# PROVENANCE — root `fixtures/` records not carried by a series-specific PROVENANCE

Traceable origin + file pins for the `fixtures/*.json` files that are NOT covered by
`PROVENANCE-{usde,h5-e2e-trace,byo-demo,s3-binance}.md`. Added by Lot R-25-series (ADR-M003 D9 sexies)
so that EVERY `.json` under `fixtures/` is declared + hashed same-dir once these files are excluded from
the R-25 lot-size count. English by ADR-M003 D0.5. Provenance of THIS file: model `claude-opus-4-8[1m]`,
2026-09-19, Lot R-25-series; all pins are the sha256 of the FILE bytes, LF-normalized (`.gitattributes`
`eol=lf`), and are re-verified by the root test `series_pinned_are_declared_and_hashed` (`npm test`).

## The nine gate-decision states — declared via `manifest.json` (NOT duplicated here)

The nine `NN-*.gate-decision.json` states are declared + hashed in **`fixtures/manifest.json`**, a closed
sha256 set enforced by `test/fixtures-root.test.ts` (`fixtures_root_valid`, ADR-M002 D1/D11): the manifest
key set MUST equal the `*.gate-decision.json` files and each sha256 (LF) MUST match. Under ADR-M003 D9 sexies
the root test `series_pinned_are_declared_and_hashed` accepts `manifest.json` as a same-dir declaration, so
these nine shas stay in ONE place (the manifest) — no drift, no duplication. Do not copy them here.

## `manifest.json` — the manifest itself

- **Role**: the closed sha256 manifest of the nine gate-decision states (above). Source of truth =
  `fixtures-root.test.ts` + ADR-M002 D1/D11.
- **Why pinned here**: `manifest.json` is itself a `.json` under `fixtures/` and is therefore excluded from
  the R-25 count (D9 sexies); it cannot declare itself (a file never declares itself), so it is declared here.
- **Cascade (declared, loud, rare)**: editing any gate-decision state changes `manifest.json` (updated hash),
  which changes the pin below; `fixtures_root_valid` AND `series_pinned_are_declared_and_hashed` both red until
  this line is updated. This is the intended tamper-evidence, not a defect.
- **sha256 (LF)** of `manifest.json`: `08b2c3edb97a8420956eabe0211fcde04ef0460718784b2fde1c0be6b9269af4`

## `figures-sourced.json` — committed sourced figures for the public site

- **Role**: the committed set of SOURCED numeric figures rendered by `apps/site` and read via
  `apps/site/lib/load-committed.ts` (`FIGURES_REL = "fixtures/figures-sourced.json"`). It is the allow-list of
  numbers exempt from the site numeric-hole honesty lint ("hors figures-sourced.json", ADR-M004 D11;
  `apps/site/test/honesty-lint.ts`) — a number is honoured ONLY when read from this file, never as a literal.
- **Source**: ADR-M004 D11; consumed by `load-committed.ts` / `honesty-lint.ts`.
- **sha256 (LF)** of `figures-sourced.json`: `15aad757d9f182ef203dd213bc20eaa8d18d03e9f602b61ef2359f162acb693e`
