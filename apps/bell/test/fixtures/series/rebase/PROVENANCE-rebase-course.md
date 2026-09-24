# PROVENANCE — Bell multiplier-trajectory course (lot -b3a-3, ADR-T1aii D1-quater, ADR-M003 D9 sexies)

Traceable origin + file pins for the FOUR per-mint multiplier-trajectory series under
`apps/bell/test/fixtures/series/rebase/` (`rebase-<MINT>.json`). Each file is a byte-identical copy of the
out-of-repo course output (SHA-pinned below); it is the offline oracle for `bell_rebase_course_replays_bit_identical`
(replay from the mint's Initialize reproduces the pinned oracle triplet on the f64 BITS). This directory is under the
R-25 series-excluded root `apps/bell/test/fixtures/series/` (D9 sexies); every data file below is declared + hashed
same-dir (root test `series_pinned_are_declared_and_hashed`, LF-normalized). Worker `claude-opus-4-8[1m]`, effort max,
2026-09-20. NO commit, NO workflow (R-20).

## Method (first-hand, orchestrator decision 60 — `F:\Monark\docs\CHANTIERS.md` l.122 [lu])
Hybrid AUTHORITY scan (option 1 of consultation #2, ratified by decision 60). The 43/0 Initialize and every 43/1
UpdateMultiplier of the four xStocks are emitted by ONE shared update authority `S7vYFF...` (`066f5922...45e3`).
Enumerate that authority (164 239 signatures, gettransactionsforaddress `full`, 166 pages), decode the 43/0 and 43/1
instructions per mint, re-read each candidate under quorum-2 (Helius + Chainstack, key = decoded event). Completeness
rests on (a) AUTHORITY INVARIANCE — `Initialize.authority == oracle.authority == S7vYFF` (asserted per series by the
test); `processor.rs` requires the current authority's signature, so only `S7vYFF` could have emitted a 43/1, so the
authority scan captures them all — and (b) the C-3 final-state oracle: the replayed triplet is bit-identical to the
quorum-2 read `ScaledUiAmountConfig` at the pinned slot. The full-mint body method (decision 55) was REFUTED by
measurement (~5.34 M Helius credits projected, decision 60 l.122) and is ~2900x more expensive than this authority
scan (~1 825 credits projected).

## Named residuals (published IN the `trajectory_known` gate, never omitted — decision 60)
- `authority_scan_mono_operator` — the authority enumeration is gettransactionsforaddress on Helius ONLY (no
  Chainstack equivalent); a Helius omission that would change the final state is caught by the C-3 oracle, one that
  would not is not. Same mono-operator step as the refuted method. Backstop: C-3.
- `set_authority_unscanned` — the mint's SetAuthority history is not scanned (C-12); a signer-side A->B->A authority
  change with self-cancelling B-signed updates is the residual gap. Symmetric to the enumeration residual.

Both codes are members of the closed residual set (`apps/bell/src/residuals.ts`) and ride on the gate returned by
`rebaseGateFromTrajectory(..., scanMethod = "authority")`. `constant` (TSLAx, no update) carries NO residual — the two
residuals are scoped to `trajectory_known` by construction.

## Committed data-file pins (plain sha256 of the file bytes, LF-normalized — D9 sexies a)
The copies are byte-identical to the out-of-repo sources, so LF sha == source sha (the sources are LF already).

| file | sha256 (LF) |
|---|---|
| `rebase-TSLAx.json` | `bd68590c7cd422d2c8d1daa6199f941748de92dfe2a866b38275439f3128b998` |
| `rebase-SPYx.json` | `43243b87ab6584c7aa60ae526c3364536297e16f9f464760425daeaffcc81d9b` |
| `rebase-NVDAx.json` | `f2776fe6e028f00b261172fd49ac47a17103c1780c9149e70b2e469c1170161a` |
| `rebase-AAPLx.json` | `02b37ecf87048ad62bd4f2d89c5334b001c9583daad87385ca65a6dd97dc2a43` |

## Out-of-repo raws (NOT committed — C-4; archived `F:\PRODUITS\etude-2026-09-20\bell-b3a-raws\course\`)
Sources of the copies above and the exploration probes; SHA-pinned here (plain sha256 of the file bytes).

| raw file | sha256 |
|---|---|
| `course/series-TSLAx.json` | `bd68590c7cd422d2c8d1daa6199f941748de92dfe2a866b38275439f3128b998` |
| `course/series-SPYx.json` | `43243b87ab6584c7aa60ae526c3364536297e16f9f464760425daeaffcc81d9b` |
| `course/series-NVDAx.json` | `f2776fe6e028f00b261172fd49ac47a17103c1780c9149e70b2e469c1170161a` |
| `course/series-AAPLx.json` | `02b37ecf87048ad62bd4f2d89c5334b001c9583daad87385ca65a6dd97dc2a43` |
| `course/authority-probe.json` | `c0f16476e06f335a7817b9359642d4bb31659168ce8df69624a9ca54481df4fa` |
| `course/probe-course.json` | `a76675f15ab4d7a4c9c26fabaf3c7190398ef86312caab990f1ec0ca1b803e27` |

## Budget spent (exploration; per-operator fail-closed; decision 60 l.122 [lu] + PLI annex -b3a-2)
Helius ~6 323 credits (probe + authority scan + `verify-gtfa-config` exploration), Chainstack 4 042 calls; both far
under the per-operator caps (Helius 1 000 000 credits decision 56, Chainstack 200 000 calls). Projected authority-scan
cost was ~1 825 credits; the surplus is the shape/verify-oldest exploration. NO full-mint body scan was launched.

## ToS review (Helius + Chainstack; same reading as the -b1 spike PROVENANCE, 2026-09-19)
ToS reviewed 2026-09-19 by a Sonnet 5 reader agent (`claude-sonnet-5`): Helius Terms of Service (last updated
2026-04-24, helius.dev/terms) and Chainstack SaaS Terms of Service (last updated June 2026, chainstack.com/tos) do not
explicitly address ownership, redistribution, or public-repository publication of RPC response data or statistics
derived from it. Both carry general non-redistribution / no-derivative-works clauses aimed at the paid Service/API
access itself (Helius section 7(v),(viii); Chainstack section 4.2(i)), not at archived response snapshots or downstream
statistics. Neither imposes a caching/storage restriction on client-held responses or an attribution requirement
applicable to fixtures. Underlying blockchain data is public on-chain data, not provider-authored content. Raw
responses are therefore kept out of the repository (SHA-pinned above); only reduced series recomputed from public
on-chain facts are committed. Endpoints are named by `providerOf`/`operatorOf` (bare hosts) only; no URL or key is ever
written (C-10; leak scan = 0 on the series and raws). Residual risk: non-zero, unquantified; good-faith reading pending
provider confirmation or legal sign-off.

## Honesty (D5, R-21)
The series carry NO cash-reference field and NO ADV — only first-hand on-chain facts (decoded 43/x events, block times,
slots, signatures, the f64 multiplier bits, the pinned oracle triplet). The `multiplier_at` bound values are pure
replays of the captured events; their completeness rests on the authority-invariance argument + the C-3 final-state
oracle, with the two named residuals above. Ratification of the hybrid method is due to the investor (decision 60).
