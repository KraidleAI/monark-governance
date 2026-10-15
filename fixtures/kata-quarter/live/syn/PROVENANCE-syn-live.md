# PROVENANCE: the synthetic LIVE series of `fixtures/kata-quarter` (symbol folder `syn`)

Made-up 15-minute candles of a made-up symbol, written by the same deterministic generator as the sealed folder, for the tests of the
quarter counts tool (`test/kata-quarter.test.ts`, docs/G0-lot-cm5-c1a.md): no real series, no venue. The LIVE read of quarter 1,
[2026-10-01T00:00Z, 2027-01-01T00:00Z): 8832 grid slots, 8829 candles, three slots declared missing in `missing.json` (2026-10-01T00:00Z,
the seam; 2026-11-15T12:00Z; 2026-12-24T23:45Z). Pins: the sha256 of the file bytes (LF), re-verified by the root test
`series_pinned_are_declared_and_hashed`.

| file | sha256 (LF) | origin |
|---|---|---|
| `syn-15m.csv` | `5f7f1601a6dd339492ba2f5668408637c573744c68d6a6164604118aa1d47f2a` | synthetic |
| `missing.json` | `60ba3c3a286e8ac8d065db3265b01dbe3b45494dcceb6a50750029dbbd13e1aa` | synthetic |
