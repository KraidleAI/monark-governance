# PROVENANCE - Ukemi lot U-5a: reduced PUBLIC book slice for the `fromRealizedBook` / `ukemi-predict` tests

Traceable origin of the sha-pinned data series under this directory (ADR-M003 D9 sexies: declared + hashed
same-dir, one file per line, LF-normalized). English by ADR-M003 D0.5. Scanned by `gate:vocab` (scope
`sentinel`) and the language gate (scope `sentinel`). This file is R-25-excluded DATA whose public test
consumer (`apps/harness/test/ukemi-predict.test.ts`) survives the export, so it is NOT orphan (decision 111):
the exclusion motive is orphaning, not confidentiality.

| file | sha256 (LF) |
|---|---|
| `U5a-book-slice.json` | `975df2014b3cd7e93de1f8f0dfac459cf5c6a12b18ae0f9665c62e2459a11fae` |

## 1. What it is
A REDUCED, PUBLIC slice extracted VERBATIM from the U-4b-1a design set at block 23545087 (cluster `weth`, event
`e2-2025-10-10-weth`): the 39 reserves and the FULL oracle path (1 pre-B0 anchor + 140 AnswerUpdated + the
decoded e-mode params) copied unchanged from the design book and oracle path, plus SIX real accounts, one per
`fromRealizedBook` branch:

| case | address | branch | expected |
|---|---|---|---|
| emode0-crossing-strate0 | `0x007d9f73473f4c3603a38255af7ddef996f38f90` | e-mode 0, crosses | yhat 6209662, m_bps 10500, strate 0 |
| emode1-wethcat-crossing | `0x071c6780217a8f10056118df96c96ac2cd27a5c2` | e-mode WETH-category, crosses | yhat 42492, m_bps 10100, strate 0 |
| large-yhat-strate3 | `0x077a25d1f579574fe168bbaa924e40c9bfa57ccc` | e-mode 0, crosses, large | yhat 140751764283444, m_bps 10500, strate 3 |
| no-crossing-yhat0 | `0x6760ffa7343ac465af13d9a84eff8f45c07eec3f` | evaluable, no crossing | yhat 0, m_bps null, pstar null, strate 0 |
| non-mono-weth-refusal | `0x001fd99044af0e172b2528bd3267eda0e98143fe` | not mono-collateral WETH | refusal non_mono_weth |
| emode-out-of-range-refusal | `0x0518722ba30a3b460b34eaf9e1b4a259535455d1` | e-mode 2 (outside {0, WETH-cat}) | refusal emode_out_of_range |

The four evaluable expectations are the committed class-A score values for those addresses (an anti-drift
assertion in the export-excluded oracle re-checks equality against the committed class-A scores). The
`book_digest` field is the authoritative `695d862f...`, carried as an ECHO (never recomputed by the producer, K-8).

## 2. Acquisition
Derived deterministically from the two sha-pinned U-4b-1a design fixtures (the reduced book B0 and the D_e oracle
path; their own provenance and raw bytes are export-excluded with the U-4b design set, decision 111); no network,
no provider bytes. The extraction keeps each account object BYTE-FOR-BYTE (so the tool is fed the REAL form, A-8:
the account keeps `user_config`/`eligible_static`, the update lines keep `round_id`/`updated_at`, the oracle keeps
`usdt_prices`; none is read by the producer).

## 3. Integrity
`.gitattributes` normalizes to `eol=lf`; the root test `series_pinned_are_declared_and_hashed` LF-normalizes
before hashing and requires the filename AND its exact LF sha256 on the SAME line of the table above. Regenerate
from the U-4b-1a design set, never hand-edit; any drift re-pins the table.
