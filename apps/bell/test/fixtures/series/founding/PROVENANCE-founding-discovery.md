# PROVENANCE — Bell founding-pool discovery (lot -b1-bis-i, ADR-T1aii D1-sexies, ADR-M003 D9 sexies)

File pins for the per-mint founding-pool discovery measures under `apps/bell/test/fixtures/series/founding/`
(`discovery-<MINT>.json`). Each is the served input of the `FOUNDING_POOLS` registry (`apps/bell/src/pools.ts`):
`bell_founding_registry_equals_discovery_measure` (C-4) asserts `FOUNDING_POOLS[mint].founding_pool` equals this
file's `founding_pool` field-by-field. This directory is under the R-25 series-excluded root
`apps/bell/test/fixtures/series/` (D9 sexies); every data file below is declared + hashed same-dir (root test
`series_pinned_are_declared_and_hashed`, LF-normalized). Worker `claude-opus-4-8[1m]`, effort max, 2026-09-20.
NO commit, NO workflow (R-20).

## Status — MEASURED (lot -b1-bis-i network run, 2026-09-20)
The L-1/L-2 discovery network run has been executed (the only paid dependency of the lot, under the pre-registered
budget PLI §4b). Each mint yields a founding vault at/above `FOUNDING_DISCOVERY_THRESHOLD` (0.05 share of the
sample); every `founding_pool` is now the measured top-tally vault (quote paired by owner), and `FOUNDING_POOLS` is
set equal field-by-field (C-4). Exact pre-registered command (no key/URL printed — operators named by `operatorOf`
only):
`node apps/bell/src/collect.ts --discover --pools TSLAx,SPYx,NVDAx,AAPLx --max-calls 300 --max-pages 5 --min-interval 250 --from-utc 1751328000000 --to-utc 1761955199000 --out <out-of-tree>`
- Window (Cong founding window, seconds): `[1751328000, 1761955199]` (2025-07-01 .. 2025-10-31T23:59:59Z).
- 3 sampling points per mint: asc from `fromSec`, asc from the median, desc to `toSec` (C-3); N = 5 pages/point,
  1000 tx/page => `sampled_tx = 15000` per mint. `discovery_enumeration = helius-gtfa-mono-operator` (declared
  mono-operator, calque `authority_scan_mono_operator`). `window_total_tx = "unknown (>= floor)"` — the sample is
  NOT a window coverage; a pool active only outside the sampled points is not seen (declared limitation).
- Calls: 76 total (reported by the CLI stdout). Reconstructed by method from the committed measures + the total:
  60 `getTransactionsForAddress` (3 points x 5 pages x 4 mints, each `sampled_tx=15000`) x 10 cr = 600 cr; plus
  16 `getAccountInfo` (confirmVault quorum-2: 4 mints x [owner-of-owner 2 + program 2]) x 1 cr = 16 cr. Actual
  ~616 cr; worst-case conversion (A-2, every call at 10 cr) = 760 cr. The `--discover` CLI reports only the total
  call count — a `calls_by_method` field like the producer's `rebase-produce-report.json` is a formed observability
  item.

Result per mint (dex from the committed `DEX_BY_PROGRAM_ID` only, never from memory — C-5; addresses are public
on-chain accounts):

| mint | founding_pool base vault | top-tally share | programId (read on-chain, owner-of-owner) | dex | quote | quote_class |
|---|---|---|---|---|---|---|
| TSLAx | `D2JXvYgyqo2CktPN4aNfdmHn8mK2vrF9essKdH8M4wn7` | 0.3985 | `CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK` | raydium-clmm | USDC | usd |
| SPYx | `EfmaMxuPJaU914gV9N8Z2sDTp249AtEASTLDZdhRsN37` | 0.4529 | `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc` | unknown-program | USDC | usd |
| NVDAx | `FaHQ9Ny2U2RkcdapsKVr9pvnt4Mg7n92NdKnvyRzuibH` | 0.3218 | `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc` | unknown-program | USDC | usd |
| AAPLx | `3DRUhhz5q1wsXZxYYpujPP4Fq5hYNfEGggSq93d99Tn7` | 0.5219 | `CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK` | raydium-clmm | USDC | usd |

- SPYx / NVDAx sit under programId `whirLbMii...`, OFF the committed `DEX_BY_PROGRAM_ID` map => `dex:
  "unknown-program"` with the id preserved as READ on-chain (adding a map entry is an ADR line with a source — a
  formed item, not guessed here). TSLAx / AAPLx under `CAMMCzo5...` => `raydium-clmm`.
- All four quotes are USDC (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`) => `quote_class: "usd"` (on the committed
  USD-stable list, C-6); all four are eligible for the -ii course.
- Multi-pool per mint: several vaults sit at/above threshold (TSLAx 8, SPYx 7, NVDAx 10, AAPLx 5 — see each file's
  `vault_share_of_sample`). `founding_pool` is the single top-tally vault; the aggregation rule over the other
  retained vaults is a formed item (G0 C-9 i, course -ii). The -b1 PoC TSLAx vault `CY9Xzc1z...` is present but
  ranks 6th (share 0.0753) under the richer 3-point / 15000-tx sample, not the top-tally vault.

## In-repo committed measures vs out-of-tree bruts (lean-vs-full)
The committed in-repo `discovery-<MINT>.json` is a LEAN measure: `symbol`, `founding_pool`, `discovery_enumeration`,
`sampled_tx`, `window_total_tx`, `vault_share_of_sample` (every vault at/above threshold), and
`candidates_below_threshold_count`. The FULL CLI DiscoveryFile (with the complete below-threshold address list,
~3.3k-3.7k public accounts per mint) is kept OUT of the tree as the brut, sha-pinned below. Reason: repo hygiene
(the below-threshold list is noise — accounts holding the mint in few sampled tx), and one TSLAx below-threshold
public account address happens to carry a 4-letter sequence that the coarse operator-name net flags — it is a
base58 pubkey, not a URL or key. The lean committed files carry no such coincidental match. The endpoint/key scan
(RPC operator hostnames + the key-query fragment) is empty on every committed file and every brut; only operator IDs
(never a URL, never a key — C-10) appear in run metadata. The `founding_pool` in the lean file is byte-for-byte the
same object measured in the full brut.

## Committed data-file pins (plain sha256 of the file bytes, LF-normalized — D9 sexies a)
| file | sha256 (LF) |
|---|---|
| `discovery-TSLAx.json` | `2472f2438cc193bfd99795f916a9f2a62661254a803e160ed51d46a578b9bc83` |
| `discovery-SPYx.json` | `298d16c52bfae7cfeb41271c5e1bd7443622c08823bf53b18a4d1b5763e21945` |
| `discovery-NVDAx.json` | `3567522dcb6fd22ec4f9c1c92dea87b46e386842cd4fe659112f8efe7addc51d` |
| `discovery-AAPLx.json` | `69b3fce822edd2e60fec69f45c98cb4d926e272f1466b1b93f266d037182ff67` |

## Out-of-tree bruts (NOT committed — CA-11; archived `F:\PRODUITS\etude-2026-09-20\bell-b1bis-raws\discover\`)
Full CLI DiscoveryFile per mint (complete `candidates_below_threshold`); SHA-pinned (plain sha256 of the file bytes).
| brut file | sha256 |
|---|---|
| `discover/discovery-TSLAx.json` | `50c7f3579cc15b3a94dc93814abc5667811a5f32fa52be0a7f189e11ffeb96d4` |
| `discover/discovery-SPYx.json` | `72fe57923ad4518c40db4a5227192afcf7e80f06f6dc735557a2d6ec966725e6` |
| `discover/discovery-NVDAx.json` | `ab423513ae7d085c3dd1c9cfe196a5ac7701ee0cbb5fc18cfa3e622293c9fe85` |
| `discover/discovery-AAPLx.json` | `6799122fa7b326e20c92ab3be0ee2a0b98894c430a07266b7878f8edfd2a2402` |

## ToS review — same reading as the -b3a course PROVENANCE (`PROVENANCE-rebase-course.md`)
Read 2026-09-19 by a Sonnet 5 reader agent (`claude-sonnet-5`); the two RPC operators' terms do not explicitly
address ownership, redistribution, or public-repository publication of RPC response data or statistics derived from
it. General non-redistribution clauses target the paid Service/API access itself, not archived response snapshots or
downstream statistics. Underlying blockchain data is public. Raw responses kept out of the repository (sha-pinned
out-of-tree); only reduced measures recomputed from public on-chain facts are committed. Endpoints named by
`providerOf`/`operatorOf` only; no URL/key ever written (C-10). Residual risk: non-zero, unquantified; good-faith
reading pending provider confirmation or legal sign-off. See `PROVENANCE-rebase-course.md` for the full ToS text.

## Honesty (D5, R-21)
These files carry NO cash-reference field and NO ADV — only the discovery measure (per-mint `founding_pool`,
retained-vault shares, sampled count). The discovery method is sampled + mono-operator (declared
`discovery_enumeration: "helius-gtfa-mono-operator"`); the published figures are `sampled_tx` +
`vault_share_of_sample`, NEVER a "window coverage" (the window total is unknown/capped). A pool active only outside
the three sampled points is not seen (declared limitation). Ratification of the founding-registry method is carried
by the lot G7; decision 60 (hybrid authority scan) was ratified by the investor 2026-09-20.
