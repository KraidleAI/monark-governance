# PROVENANCE: the synthetic sealed series of `fixtures/kata-quarter` (symbol folder `syn`)

Made-up 15-minute candles of a made-up symbol, written by a deterministic generator (an LCG seeded 20261015) for the tests of the
quarter counts tool (`test/kata-quarter.test.ts`, docs/G0-lot-cm5-c1a.md): no real series, no venue. The sealed read of quarter 1
under the recording range of wave 1 (2024-10-01 to 2026-10-01): the 1616 candles of the 404 hours before 2026-10-01T00:00Z, no gap.
Pins: the sha256 of the file bytes (LF), re-verified by the root test `series_pinned_are_declared_and_hashed`.

| file | sha256 (LF) | origin |
|---|---|---|
| `syn-15m.csv` | `9c3ef680b5e1e7959b19632d13b6cec9770d530a3f85a5cdd17f9c9b750ff1f1` | synthetic |
| `missing.json` | `69564604b4b777b4ed1254367c306ed6c4d3ee9c69d8cbf27aabc110929a7108` | synthetic |
