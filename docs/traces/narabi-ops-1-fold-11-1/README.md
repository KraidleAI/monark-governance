# Linux execution traces: the section 11-1 fold of ADR-NARABI-OPS-1

Object: the four SIGTERM tests of `apps/sentinel/test/sentinel-chainstack-guard.test.ts` are skipped on win32 (`process.kill` is
a hard kill there, with no handler), so their execution proof is Linux (decision 136). Each extract carries the header of
`docs/CONSIGNE-STANDARD-G1.md:52` (A-12): the tree's sha, the platform, the node version, the exact command and, for the
mutant, the mutation, the sha256 of the mutated file and of its restoration.

| File | Tree | Producer | Content |
|---|---|---|---|
| `linux-guard-57d0ee5d.extract.log` | `57d0ee5d` (the code commit of the change) | RECHERCHES, native Linux, Node 24.21.0, 2026-10-08 11:10 UTC | the guard test file 17 of 17 green, the four SIGTERM tests `ok 14` to `ok 17` |
| `linux-v6-57d0ee5d.extract.log` | `57d0ee5d` | the same run | V6: `apps/sentinel/src/run.ts:342` emptied (`process.on("SIGTERM", onSigterm);`, the existing killer of the SIGTERM tests); 13 of 17, the four SIGTERM tests red by assertion; `run.ts` restored to `b3b10703…` |

The extracts keep the top-level TAP lines, the reason of each red test and the summary; the full TAP of each run stays outside the
repository, named by its sha256 in the extract. No docker daemon answers on this host (the client is installed): the runs are
native. No network: the tests stub `fetch`, and the paid-key and token variable names are removed from the environment.
The later commits of the change touch `docs/` only, so `run.ts`, the test file and the code they load are the same bytes at its
head.
