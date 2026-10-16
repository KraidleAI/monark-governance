# G0 — CM5-c3: the closed reader of the wave 2 core registry, `tools/kata-quarter/quarter_wave2.py`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-16. Base: trunk `lot/etude-suite` at `a2264edd` (#311, the
  Windows-safe case folders of CM5-c1a-3); the branch merges the trunk at `576a63d0` (#312, no file of the tool) before its push.
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`): row c3 (section 5,
  l.595), the registry row of section 4.1 (l.524), the tests of section 5.3 (l.884-965: l.894-902 the existence assertion, L-T12 l.921,
  L-T19 l.929, L-T23 l.933), the host act L-O3 (l.949-953), the child rule (section 3.1, l.322-325) and the vocabulary rule (l.95-102).
  Lines of the plan are cited `plan l.N`.
- **The format**: the frozen `kata/registry/FORMAT-wave2.md` of RECHERCHES (33 560 bytes, sha256 `a9db3fa9…`, freeze go of MONARK in
  `305f408`). The plan cites the draft that preceded it (S24, `FORMAT-W2-draft.md` at `5318125`) by line, its « Reader checks » at
  l.218-229; this note cites the frozen file only, `FORMAT l.N`: Byte form l.10, Top level l.18, Trials l.29, Row fields l.55 (calib l.95,
  the three veto blocks l.120), Reasons and status l.140, Reader checks l.189-203, Edge conventions l.204.
- **No series byte read, no real registry read.** At the base `wave2.json`, `PROVENANCE-wave2.md` and `quarter_wave2.py` are absent; the
  reader is built and tested on a synthetic `fixtures/kata-quarter/registry/wave2-syn.json` (no real value), declared and hashed in
  `PROVENANCE-wave2-syn.md` beside it, as `wave1-syn.json` is.

## 1. What this lot delivers

- `tools/kata-quarter/quarter_wave2.py` (new, no `__main__`; listed in `tools/kata-quarter/FILES`):
  - `document` (l.61-75): `wave2.json` read under the role `registry`, refused before parsing unless its sha256 is the pin; decoded as
    UTF-8, parsed with a key written twice refused (`quarter_load.unique`), then held to its byte form (FORMAT l.10-16): the text must be
    `kata_lib.js_json_pretty` of the document (the frozen tool's writing of `JSON.stringify(v, null, 1)`) and one line feed, with no
    U+2028 or U+2029. So a CR, a compact or another indentation, a number written otherwise than JavaScript writes it, a non-finite
    number, an integer JavaScript does not write: each is the one named refusal « not its byte form ».
  - `closed` (l.42-58): every object holds exactly the keys of its table, **in the format's order** (FORMAT l.12: the order of the
    tables; the snapshot binding rebuilds the bytes in it), `months` with `YYYY-MM` keys ascending; the arrays are the rows and the
    factor tables only; any other place holds a scalar, or null where the format writes `T | null`. An unknown key or a missing one
    (« never omitted », FORMAT l.15) is refused by name with the path of the object.
  - `row` (l.95-115): the fields that the count reads, each refused by name: the cell (`taskClass`, `key`, `kataId`, `W`, `venue`,
    `symbol`, `horizon`, `trialId` recomposed with `W2-CALIB`) is a band or path cell of `recalc_p2.cells_of`; `calibAttempt` is 2 (an
    int, not a bool); `alpha` is `"0.01"`; `calib.qhat` is a finite number iff `calib.status` is `silence` or `region`, null on
    `under_calib`; `status` and `vetoedBy` follow the order of the three veto blocks (`status2`, FORMAT l.155; `vetoedBy` the first
    block that fires, l.138; a block fires only on a region); `factorTableSha256` equals the one of the wave 1 row of the same
    (`taskClass`, `key`) and the digest of the row's own `hourOfWeekFactors` (`kata_lib.seq_sha256`), so the table is that of the wave 1
    row byte for byte (FORMAT l.69); and the blocks pass `months_ok` (l.86-92).
  - `core_rows` (l.118-123): the rows in their order, a cell written twice refused; `wave1` (l.78-83) reads the wave 1 registry again
    under its pin for the factor tables.
  - `child_counted` (l.126-129) and `counted` (l.132-138): the child rule and the rows that the count takes (section 3).
  - `BLOCKS` (l.20-21), the three veto blocks of FORMAT l.124-128 in their order; `READS` (l.22), the range of the months a core cell
    reads (FORMAT l.76); `CALIB_END` (l.19), the end of CALIB-2 (ADR 0006 v8.1 l.167, plan l.324).
- `tools/kata-quarter/quarter_counts.py`: `count` takes the core registry and its pin after the registry's (l.151-153, the second form
  of `count`; l.29 its usage), reads it through `quarter_wave2.counted` before any series (l.91), and writes its pin
  `core_registry_sha256` in its JSON line and the evidence (l.106). Its import of the module is on the line of `quarter_oracle` (l.24):
  no line of the file before l.151 moves, so no killer of the earlier lots moves on it.
- `tools/kata-quarter/quarter_evidence.py` l.56: the key `core_registry_sha256` enters the evidence when the count read a core registry,
  and only then.
- `tools/kata-quarter/quarter_oracle.py`: the act `equals_wave2_registry_on_its_blocks` (L-O3) in `ACTS` (l.31), its usage
  (l.35, the text `USAGE` of `tools/kata-quarter/quarter_wave2.py`), its arguments (l.128, l.134-137) and its code `on_blocks` (l.160-182), at the end of the file.

```
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py count <registry> <sha256> <core registry> <sha256> <served history> <sha256> <sealed dir> <live dir> <k> <out dir> <folder>:<sha256|pinned>:<sha256> ...
python -E -S -s -B -P tools/kata-quarter/quarter_counts.py check equals_wave2_registry_on_its_blocks <registry> <sha256> <core registry> <sha256> <sealed dir> <out dir> <folder>:<sha256> ...
```

The two forms of `count` cannot be taken one for the other: counting its arguments from 0, the first form has its quarter at 6 and a
symbol spec (`<folder>:<pin>:<pin>`) at 8, the second its quarter at 8; a number is never a spec, so each form's test refuses the other.

## 2. The Reader checks (FORMAT l.189-203): taken and left out

| Check (FORMAT) | Here | Why |
|---|---|---|
| l.199, the keys of `months` in the three blocks are `YYYY-MM` within their block, ascending | **taken** (`months_ok` l.90, `closed` l.51 for the order) | the act L-O3 compares `months` block by block: a month outside its block is a registry out of its format, refused before any comparison, not a difference laid on the tool |
| l.200, with a `kTest`, the months sum to `nTest` and `kTest` | **taken** (`months_ok` l.91-92, with `kTest` null iff no `qhat` and `{}` then, FORMAT l.133, l.136, l.206) | the same: L-O3 compares `nTest`, `kTest` and `months` apart, and a registry whose blocks do not add up is refused by name |
| l.193, `auxSeq` and `auxSha256` | left out | the count reads no digest of the scores: it recomputes its own decisions on Q_k or on a block |
| l.194, `tailFrac` the exact string of its horizon | left out | the tail check is a calibration check; the count reads `qhat` only, never the tail |
| l.195, the four snapshot digests | left out | they need the digests posted in the coordination record and listed in `PROVENANCE-wave2.md`, which the tool does not read; MONARK holds `wave2.json` to them when it classifies the file |
| l.196, `tail.r`, `check1.m` = `kObs` = `misses` ≤ `tail.m` | left out | calibration counts, not read by the count |
| l.197, the three verdicts by the exact adjacency tail | left out | they need the big-integer adjacency null of D2 (`kata/w2c/`); calibration only |
| l.198, `U` the 7-decimal bound at (n, `kStar`, 0.025) | left out | `U` is the calibration bound; the count writes its own `u_test` on Q_k (and L-O3 compares `UTest` of the blocks, computed again) |
| l.201, `kObs` ≤ `kStar` on a calibrated row | left out | calibration counts |
| l.202, `seriesSha256` from the posted sha256 of the sealed files | left out | it needs the per-month digests posted in P0-2, which the tool does not read; the tool holds each series it reads to the pin given on its command line (D-3), and the act L-O3 to the pin that MONARK posts |

Beyond the list, the reader holds what the count depends on and the format states elsewhere: the byte form, the closed keys, the
cell and its trial id, the attempt, alpha, a `qhat` iff calibrated, the status order of the blocks, the factor table (above).
**Left out on purpose**: the number of rows (40) and their order, `trialRegistryHead` (the chain of FORMAT l.29-52) and the values of
`plan` and `engine`. The count keys each row on (`taskClass`, `key`, `calibAttempt`) and counts it alone; the chain is a commitment
of the writer, recomposed from the wave 1 head by a verifier of the trial registry, not an input of a count. The reader of wave 1 of
c1b checks neither the 280 rows (`quarter_core.registry_rows`), and the synthetic fixtures of both waves hold a handful of rows.

## 3. The child rule (L-T12) and the count of the core rows (L-T23)

Addendum 9 point 2: « A child row (`calib_attempt` + 1) is first counted on the first quarter Q_k whose start S_k is at or after the
end of its calibration data; no instant at or before that end ever enters its counts. » The calibration data of a core row is
CALIB-2, 2022-10-01 to 2023-10-01, end exclusive (ADR 0006 v8.1 l.167). **Reading fixed here**: the end is the exclusive bound
`CALIB_END`, so the last instant of the data is `CALIB_END` − 1 ms; « S_k at or after the end » is `S_k >= CALIB_END`
(`child_counted`, l.129), and « no instant at or before that end » holds since every instant counted on Q_k is at or after S_k. This
is the reading under which the plan's case « at S_k it is counted » (plan l.921) holds with all the instants of Q_k, as the TEST block
of wave 1, which ends at S_1, is followed by Q_1 counted from S_1. With the real CALIB-2 every quarter from `live:1` counts a core row
(plan l.324-325); the test poses `CALIB_END` at S_1 and 15 minutes after it in a repository of its own (the stand-in form of the file).

`counted` (l.132-138) gives the count the wave 1 region rows as before, then, with a core registry, its rows of status `region` at
attempt 2 when the child rule admits them on Q_k; the venue is the union of both (the same symbols). Each core row is served by the
served history by its class, as a wave 1 row is: the history names no attempt, so the caller gives the core registry from the day a
core row is current; both attempts of a cell served in Q_k are then counted, two rows, two keys (plan l.334-339, Q-CM5-3b). Its row of
the evidence is a row of `kata-quarter-counts-v1` with `calib_attempt` 2, its own `qhat` and its own `u_test`, `fires` and prudent
variant; the evidence gains one key, `core_registry_sha256`, the pin of the core registry read, present iff one was read.

**No change without a core registry.** Every line of `count` that the core registry reaches is a no-op without it (`counted` returns
its input; the key is not written). Shown by running the same count of the fixture (Q_1, the served history of three classes) from
the base tool and from the head tool, each from a repository of its own trees, and comparing: the stdout, with the line `identity`,
the lines `input tool-tree` (each tool's own blobs) and the line `evidence` (the evidence's sha256) left out, is equal (13 lines,
sha256 `af6f8b4e…`); the evidence, its `identity` block left out, is equal (sha256 `1f7a9715…`), with the same eleven keys. The
earlier 30 tests of the file, which hold the outputs of `count`, `check` and the acts, pass unchanged.

## 4. The act L-O3 `equals_wave2_registry_on_its_blocks`

Plan l.949-953: the tool, run on the blocks of the core registry, gives for each row its counts on its blocks, compared with
`wave2.json`. **Reads**: the wave 1 registry (pinned; the factor tables), the core registry (pinned, the whole reader of section 1),
and for each symbol folder one sealed series `<sealed dir>/<folder>/<folder>-15m.csv` with its `missing.json` (and `manifest.json` if
there is one), under the pin given, read alone under `READS`, 2022-09-01 to 2026-10-01 (no merge: an absent slot is an instant out or
a drop; rule 8 and 8 bis apply to its truncated candles, `quarter_load.halts`). **Counts**: each core row with a `qhat`, whatever its
status, on the bridge, TEST-2 and FWD-2, by `quarter_core.count` posed on each block (REC_START the 00:00Z before the block minus the
longest window, the grid of the block up to its end minus h; fdlibm_log decides, math.log is listed). **Compares**, under the rule of
`report.py` l.9-13 (strict equality of canonical writings): `nTest`, `kTest`, `UTest` (`quarter_oracle.u_test`), `months`, the label
drops of the block (`drops.<block>`) and `vetoed` (region, n ≥ 1 and the exact tail at the row's alpha under 0.05, as L-O1).
**Outputs**: the report `<out dir>/equals_wave2_registry_on_its_blocks.json` (`kata-quarter-oracle-v1`, canonical, named by its
sha256 on the line `report`): the inputs noted, the pins of both registries, the rows compared, and for each block its pose, grid,
halts, census of the log and the decisions of math.log that differ; each difference named `<taskClass> <key> <block>.<field>`; exit 0
when every field is equal, 1 otherwise.

Limits, written for MONARK's run: (a) the historical exclusion instances (addendum 4 §1) are not an input of the tool: a decision that
one of them excludes is counted here, and its difference is listed as not explained; MONARK's report reads such a line against the
dated list of wave 2 halts. (b) An `under_calib` row (no `qhat`; on the recorded series, only the n = 0 rows of a symbol absent by
rule) is not compared, its blocks having no `kTest`; the venue is the folders of the rows compared. (c) The series form is the tool's
(one file per symbol over `READS`); the sealed monthly files of wave 2 are put in that form by the run.

## 5. Tests (`test/kata-quarter.test.ts`; each red at the base by its first assertion, `existsSync(quarter_wave2.py)`)

| Test (plan) | What it holds | Its killers (`test/kata-quarter.test.ts`, the comment lines above the declaration; red-proof reads the last) |
|---|---|---|
| `wave2_registry_reader_closed` (L-T19) | count on the fixture with `wave2-syn.json`: its two region rows at attempt 2 with their key, alpha and horizon after the three wave 1 rows; 17 named refusals, exit 2 | nine, test l.1134-1142: the plan's (attempt « == 2 » → « >= 1 »), the closed keys, the byte form, the pin, both halves of the factor table, the status, `vetoedBy`, the months within their block |
| `child_row_counted_from_first_quarter_after_its_data` (L-T12) | calibration data ending at CALIB-2's end or at S_1: both core rows counted on every instant of Q_1, the counts of their wave 1 rows but their own misses; ending at S_1 + 15 min: not counted | two, test l.1183-1184: the plan's (ROR « >= » → « > »), and the rule made true |
| `core_registry_to_evidence_row_composition` (L-T23) | on hourly closes 100 and 101 in turn: the evidence rows at attempt 2 (range-1h: 2208 instants, the misses where the factor is 1 or 1.25 at qhat 0.75, a fire; range-4h: every instant out), the pin of the core registry; the rest of the evidence equal to the count without it | five, test l.1205-1209: the plan's, fixed here (the core rows given at attempt 1), the core rows dropped, the pin, the key of the evidence, the core pair of the command line dropped |
| `equals_wave2_registry_on_its_blocks` (L-O3 in CI, on the fixture only) | on a made series of the three blocks and a registry derived from the fixture whose blocks are worked out from it (UTest by `binom_exact` run apart from the tool): exit 0, the rows and each block's grid named; a kTest with its month, a UTest and a label drop changed: four differences named, exit 1 | five, test l.1267-1271: the end of FWD-2 moved, the months and the drops of the comparison, the under_calib row compared, the silence row vetoed by the tool |

Each killer, applied alone to the working tree and that test run alone (offline, CPython 3.14.8): **21 of 21 killed** (L-T19 9,
L-T12 2, L-T23 5, L-O3 5); each file restored and its sha256 checked after each run. Each test is red at the base by its first
assertion, the absence of `quarter_wave2.py`; red-proof reads the killer on the line right above each declaration.

The killers of the earlier tests on `quarter_oracle.py` l.138-144 moved by four lines with the branch of L-O3 (six killer lines); every
killer line of the file holds its text once on its line at the head (148 lines checked). `scripts/verifier-tool-ci.mjs` names the four
new tests on the last line of `QUARTER_TESTS`, and `test/verifier-tool-ci.test.ts` their number, 34. The file runs in 167 s here
(121 s at the base, and the same in CI at #311): the driver's bound for the file is 300 s.

## 6. Left to MONARK and to later lots

- **MONARK**: the host run of L-O3 and its report, after `wave2.json` and `PROVENANCE-wave2.md` are classified (plan l.953), and the
  checks of `wave2.json` that need the posted digests (the snapshots, `seriesSha256`); the Windows replay of the test file.
- **Later lots**: the reader of the retire list with two registries (RETIRE-READER-WAVE2-1, plan l.340-342); the 2b registry and its
  count (c4, c4b and L-O4); the calibration checks of the reader list left out above, if a lot reads those fields.
