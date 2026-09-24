# PROVENANCE — weth-book-23545087.json (cascade-cluster lattice WETH fixture, ADR-U2 L-2)

Model `claude-opus-4-8[1m]`, effort max, worker U-2a (G1), 2026-09-20. Read-only derivation, no network.

## What
`packages/ukemi/test/fixtures/weth-book-23545087.json` is the WETH book, reduced to the cascade-cluster
lattice input `Position[]`. It is DERIVED — not hand-written — by replaying the sentinel-2 recorder over
its committed offline fixture and mapping each recorded at-risk account to a `Position`.

## Source (read-only)
`apps/sentinel/test/fixtures/ukemi/weth-book.fixture.json` — sha256
`f98827f94aa2eb941b71b556fa9240e73f53aa230faff1155ff6faddd58ac2bd` (REAL recorded eth_call/getLogs bytes
@ block 23545087, Aave v3 core WETH cluster, one block before the first WETH liquidation; ADR-U1 D9).

## Method (deterministic)
`packages/ukemi/test/derive-weth-lattice-fixture.mjs` — sha256
`9a8c230de030974e5fee64092fc61f1572cd7141f3cb00b3c7683a7a3355ae9f`. It imports `recordBook`/`CLUSTER_WETH`
from `apps/sentinel/src/ukemi/{book,clusters}.ts` from a package TEST/SCRIPT only (precedent
`packages/monark/test/adapter-book.test.ts:30-32`), NEVER from `packages/ukemi/src`. `recordBook` decodes
the raw bytes fresh: counts `{holders:4, at_risk:2, eligible:0}`, `book_digest`
`034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921` (identical to the recorder PIN in
`apps/sentinel/test/ukemi.test.ts`). N = 2 at-risk accounts, both solvent (`eligible_static = 0`); the
`victim_vector` (eligible at B+1) is NOT in `recordBook`'s output and is NOT included.

## Mapping (NOTE §0, P0 := 1)
`collateralQty = total_collateral_base`, `collateralPrice = 1`, `liqThreshold = current_liquidation_threshold_bps/1e4`,
`debt = total_debt_base` ⇒ `pCrit = debt/(collateralQty*collateralPrice*liqThreshold) = B/(C*K)`. The 8-dec
integers are ~1.8e12 < 2^53, so `Number(str)` is exact. Cross-check: `pCrit` vs `1/(hf_onchain/1e18)` agree
to relative diff <= 1.2e-16 (declared tolerance 1e-12), reported in `cross_check_1_over_hf`.

## Caveat (honest, v0)
`total_collateral_base` is the account's collateral over ALL reserves (`getUserAccountData`), so a shock is
applied to the WHOLE account's collateral — the same v0 simplification as `apps/harness/src/tools/cascade.ts:31`.

## Reproduce
`node packages/ukemi/test/derive-weth-lattice-fixture.mjs` prints the fixture (LF). The committed file is that
exact output: sha256 of the LF-normalized bytes = `89085f7c9d2b55341bf888427c95d7a580f9fa6679a0c779a31708cd3327c5dd`,
asserted by `lattice_weth_fixture_replays_bit_identical`. The script resolves `@monark/monark` by module LOCATION (from the script path), not cwd: run from a foreign cwd (`/tmp`) it yields the identical sha256 `89085f7c…`, so the exported public CI (node_modules at the exported root after `npm ci`) replays it the same way. `series_pinned` is N/A (this fixtures root is not a
SERIES_EXCLUDED_ROOT; the JSON counts in R-25).
