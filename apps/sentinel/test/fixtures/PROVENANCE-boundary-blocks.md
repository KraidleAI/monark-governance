# PROVENANCE — `usde-boundary-blocks.json` (Narabi sentinel boundary-timestamp fixture)

Traceable origin + file pin for `apps/sentinel/test/fixtures/usde-boundary-blocks.json`, the one-off
sha-pinned boundary-timestamp fixture read by `apps/sentinel/test/sentinel.test.ts`. Added by Lot R-25-series
(ADR-M003 D9 sexies) so the file is declared + hashed same-dir once `apps/sentinel/test/fixtures/**` is
excluded from the R-25 lot-size count. English by ADR-M003 D0.5.

- **Source**: USDe (Ethena) Ethereum mainnet — the boundary block number and its timestamp (`tsFrom`) plus the
  previous block timestamp (`tsPrev`) for each of the **701** calibration windows, with `ceiling_block`
  `23586523` (D6: no window block exceeds the ceiling; blocks ≤ 2025-10-15). The file carries its own header
  (`"source"`, `"note"`, `"ceiling_block"`, `"pulled_at":"2026-09-17"`).
- **Role**: feeds the monotone, piecewise-constant block→timestamp oracle in `sentinel.test.ts` (`makeOracle`),
  so the REAL binary search (`firstBlockAtOrAfter`) runs fully offline (ADR-M012 C-5 / D6). Committed with the
  sentinel job in commit `56acedf` (M012-b, ADR-M012 D1-D6/D9).
- **Integrity**: `.gitattributes` normalizes to `eol=lf`, so the pin survives commit; the root test
  `series_pinned_are_declared_and_hashed` LF-normalizes before hashing.
- **sha256 (LF)** of `usde-boundary-blocks.json`: `f4e509482fc4d6eee799a89822ad586d8010ff0e3d1a5add1e7033f962cce492`
