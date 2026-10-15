# PROVENANCE: the veto vectors of `fixtures/kata-quarter`

Written by the quarter counts tool itself, `python -E -S -s -B -P tools/kata-quarter/quarter_counts.py vectors <out dir>`
(`quarter_evidence.vectors`), under CPython 3.14.8; no series, no registry, no input but the tool's own trees. One canonical line
(`report.canonical` of `tools/kata-recalc/`), format `kata-veto-vectors-v1`, alpha `0.01`, veto level `0.05`: for each horizon
(1h up to 2208, 4h up to 552, the longest quarter) and each n from 1, k* the least k that fires, and `[n, k, u_test, fires]` for
k = k* - 1, k*, k* + 1 within 0 <= k <= n; 8278 pairs. `u_test` is `binom_exact.miss_upper_bound` under `0.05`, `"1"` when k = n;
`fires` is `binom_exact.binom_upper_tail_leq` at alpha. `test/kata-quarter.test.ts` writes it again and holds it byte for byte;
`test/kata-quarter-vectors.test.ts` holds `vetoFires` and `uTest` of `apps/harness/src/policy-guard.ts` equal to it.
Pin: the sha256 of the file bytes (no line feed).
- `veto-vectors.json` `7ab8f5705a46eea28dad6bd23e8ccffd2e482c85d5e5688547fe414422069378`
