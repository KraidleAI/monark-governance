# PROVENANCE — Bell founding-pool discovery (lot -b1-bis-i, ADR-T1aii D1-sexies, ADR-M003 D9 sexies)

File pins for the per-mint founding-pool discovery measures under `apps/bell/test/fixtures/series/founding/`
(`discovery-<MINT>.json`). Each is the served input of the `FOUNDING_POOLS` registry (`apps/bell/src/pools.ts`):
`bell_founding_registry_equals_discovery_measure` (C-4) asserts `FOUNDING_POOLS[mint].founding_pool` equals this
file's `founding_pool` field-by-field. This directory is under the R-25 series-excluded root
`apps/bell/test/fixtures/series/` (D9 sexies); every data file below is declared + hashed same-dir (root test
`series_pinned_are_declared_and_hashed`, LF-normalized). Worker `claude-opus-4-8[1m]`, effort max, 2026-09-20.
NO commit, NO workflow (R-20).

## Status — MEASURE-GATED (checkpoint-1 C-4, C-8; PLI `docs/PLI-lot-t1a-ii-b1-bis.md`)
Every measure is `founding_pool: null` — **DECLARED pending the L-1/L-2 discovery network run**, the only paid
dependency of the lot, frozen behind the pre-registered budget (PLI §4b: 3 sampling points, N = 5 pages/point,
retention threshold 0.05, `--max-calls 300`). The offline algorithm (`apps/bell/src/discover.ts`
`tallyFoundingVault` / `dexForProgram` / `quoteClass`) is proven on synthetic in-memory gTfA bodies
(`bell_discover_founding_vault_from_tally`, `bell_discover_dex_and_quote_class_from_committed_maps`); the real run
writes the measured `{foundingPoolId, vaultBase, vaultQuote, quoteMint, quoteDec, programId, dex, quote_class}` into
each file AND `FOUNDING_POOLS`, and the C-4 test then proves the registry equals the measure. A mint with no vault
`>= threshold` stays `founding_pool: null` (no course in -ii). Raws (gTfA `full` bodies + quorum-2 confirmations)
kept OUT of the tree (`F:\PRODUITS\etude-2026-09-20\bell-b1bis-raws\`), sha-pinned there under unique names
(C-G2-6 re-measure: exact uncapped in-window count + full vault address). gTfA `full` body shape = real-run
verification item (PR-B-GTFA-SHAPE): an unparsed body yields no tally => `founding_pool: null` (fail-closed).

## Committed data-file pins (plain sha256 of the file bytes, LF-normalized — D9 sexies a)
| file | sha256 (LF) |
|---|---|
| `discovery-TSLAx.json` | `c97fdf97f373e2b9d8ee16e87655276353d2178e87c541e916cbb170d3aa519c` |
| `discovery-SPYx.json` | `84dad24ac5e6b0a84e4d0ad43a6c35e7c04a74867a53ccf1ced709ea32e5b6c8` |
| `discovery-NVDAx.json` | `bc3db666cca724edfe979e42c78a5ee232f17afaf05a7a3ce60c8530659dd80d` |
| `discovery-AAPLx.json` | `2d4106b3f4964b97b5cfa771d4720660e5745cb9a72af332db6df88d6c73e7a0` |

## ToS review (Helius + Chainstack; same reading as the -b1 spike / -b3a course PROVENANCE, 2026-09-19)
Read 2026-09-19 by a Sonnet 5 reader agent (`claude-sonnet-5`): Helius (helius.dev/terms) and Chainstack
(chainstack.com/tos) do not explicitly address ownership, redistribution, or public-repository publication of RPC
response data or statistics derived from it; general non-redistribution clauses target the paid Service/API access
itself, not archived snapshots or downstream statistics. Underlying blockchain data is public. Raw responses kept
out of the repository (sha-pinned out-of-tree); only reduced measures recomputed from public on-chain facts are
committed. Endpoints named by `providerOf`/`operatorOf` only; no URL/key ever written (C-10). Residual risk:
non-zero, unquantified; good-faith reading pending provider confirmation or legal sign-off.

## Honesty (D5, R-21)
These files carry NO cash-reference field and NO ADV — only the discovery shell (per-mint `founding_pool`, `null`
until measured). The discovery method is sampled + mono-operator (declared `discovery_enumeration:
"helius-gtfa-mono-operator"`); the published figures at the real run are `sampled_tx` + `vault_share_of_sample`,
NEVER a "window coverage" (the window total is unknown/capped). Ratification of the founding-registry method is
carried by the lot G7; decision 60 (hybrid authority scan) ratification is separately due.
