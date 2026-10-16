# PROVENANCE: the synthetic wave 2 core registry of `fixtures/kata-quarter`

Made-up rows of the made-up symbol `SYNUSDT` (folder `syn`) in the shape of the frozen wave 2 format (`kata/registry/FORMAT-wave2.md`
of RECHERCHES), for `test/kata-quarter.test.ts`; written by `JSON.stringify(registry, null, 1)` and one line feed, the format's byte
form. Five cells of `wave1-syn.json` at `calibAttempt` 2, each with the factor table of its wave 1 row: `syn-range-1h` and
`syn-range-4h` (`ewma-vol-hw-v1`, region, qhat 0.75), `syn-mae-down-1h` (silence), `syn-mae-up-1h` (vetoed by the bridge) and
`syn-range-4h` of `realized-vol-hw-v1` (under_calib, n 0). Every count, bound, digest and check is made up; `trialRegistryHead` is
the head that the format states, not one of these rows. No real registry row.
Pin: the sha256 of the file bytes (LF).
- `wave2-syn.json` `3bc6aec304a12d21c72404765eac9f62dd4fa5d0c12eb1d30da8217cb56a745b`
