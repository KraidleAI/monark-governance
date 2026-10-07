# Provenance of the wave registries in `apps/harness/data/kata/registry/`

This root holds the wave registries copied byte for byte for the harness, and this declaration only (ADR-M003 D9 septdecies,
investor decision of 2026-10-06). The registries (`wave<k>.json`) are out of the R-25 count by one pathspec of the r25 job,
`:(exclude,glob)apps/harness/data/kata/registry/**/*.json`; this declaration is counted. The gate is `scripts/registry-root.mjs`
(refusals (a) to (f)), run by the root test `kata_registry_root_is_wave_registries_only` in `test/ci-gates.test.ts`: each registry
sits on the one table row below that names it, and it alone, with the sha256 of its raw bytes (no line-ending normalization).

| File | sha256 (raw bytes) | Bytes | Lines | Source | Generator | Generated (UTC) |
|---|---|---|---|---|---|---|
| `wave1.json` | `811fcd574e182f33e24e19795b18139adb1917cf392a02810705c6adda1dd9cb` | 565462 | 26202 | `recherches` commit `a43ad70` | `kata/bench/write-p2.ts` at `1ea4f64` | 2026-10-02 |

**Copy.** `wave1.json` is the output of `git show a43ad70:kata/registry/wave1.json` in the RECHERCHES repository,
written on 2026-10-07 with no line-ending conversion. Checked before and after the write: the sha256 above, 565462 bytes, 26202 lines,
and `git hash-object` returns the source blob id `cf426e8d7680bc2fefd9fb29c33c6fdf3a839bbb` in both repositories. The file holds no
CR, U+2028 or U+2029 and is plain ASCII.

**Upstream provenance.** `recherches:kata/registry/PROVENANCE-wave1.md` at `a43ad70` (sha256
`ba7942ab240fc1b2e92107bbe09c442c7672a4368677930e44ed1271e9be4325`) pins the same sha256 on its own row and names the generator
(`kata/bench/write-p2.ts` at `1ea4f64`, 2026-10-02) and its sources: the four pinned 15-minute series of plan P2, private, never
in a repository, each with its sha256 in that file.

**Reader.** `readRegistry` (`apps/harness/src/policy-projection.ts`) reads `wave1.json` (refusal (f)); a `wave2.json` is refused
until the reader of FORMAT-W2 exists (lot E-1a). No served code path reads this root yet: that pipe is the loader of lot E-2a, with
its composition test (item E2A-DIGEST-FLOOR-TEST-1).

**Export.** `apps/harness/data/` is not exported to the public mirror: the export takes `src`, `test`, `package.json` and
`README.md` of `apps/harness` only (`APP_PACKAGE_DIRS` and `PACKAGE_SUBPATHS`, `scripts/export-public.mjs`).

Lot R25-REGISTRY-ROOT-1, PR 2: built by MONARK (worker `claude-opus-5-5`, 2026-10-07); G2 seat: RECHERCHES (each side reviews
the other's lots).
