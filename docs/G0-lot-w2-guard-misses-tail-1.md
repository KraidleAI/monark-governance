# G0 — W2-GUARD-MISSES-TAIL-1: the import guard refuses a wave 2 row whose misses exceed tail_m, and a band row whose misses exceed k*

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), 2026-10-08, from 19:07 UTC (the lot lock; `date -u` read at 19:23,
  19:54 and before the commit). A short G0, before any test or code (RECHERCHES `037add4`): nothing below is built yet.
- **Demand**: the item W2-GUARD-MISSES-TAIL-1 of `docs/ETAT.md` l.1593-1603, formed by MONARK (`docs/G0-lot-verifiers-list-f5a-1.md`
  l.1199; recherches `52e0091`). Clause 1: `misses <= tail_m` in `wave2Admission`, with its killer; the test
  `w2_guard_names_a_constant_tail_before_a_rejection` becomes a refusal test. Clause 2, the sister clause of the second review of R1
  (m, recherches `1586565`): a clause of `guardKataRow` that refuses `!dir && m > ks`, a count invariant, with its killer, rather than
  a reason branch kept for directions, under which a forged band row would pass as region. Carrier RECHERCHES (`3b54dd8` point 2;
  taken, `037add4`). Trigger: before any import of `wave2.json` (MONARK `47939bb`). Agreement and branch: MONARK, recherches `169cbc3`.
- **Base**: trunk `lot/etude-suite` = `92d01d67`, the merge of #256 (explicit refspec; `ls-remote` at 19:54 UTC), branch
  `recherches/w2-guard-misses-tail-1`. The probes ran on `c94c57df`, the trunk when this run began (#258); the five suites and the
  first probe, run again on `92d01d67`, give the same results. MONARK named `74d2cdbc`. From it to `92d01d67`, #258 changes two
  PAROXYSME documents and #256 the test count gate. No file a probe reads changes (`git diff --name-only 74d2cdbc 92d01d67 -- apps
  packages`: no file), nor any file cited below except `.github/workflows/ci.yml` and `test/test-counts.json`, whose lines are read
  at `92d01d67`; every other address holds at all three heads.
- **Conditions**: those of `037add4` hold: #221 is merged (`bdc0ff41`), and the frozen tool extension reached the trunk with #241
  (`6536057c`).
- **The test of the item** came with that extension, from REASON-ORDER-GUARD-VERIFIER-1: it is on the trunk at
  `apps/harness/test/policy-wave2.test.ts` l.250-258, byte for byte as at `09f49fc2`.
- **Zone**: `apps/harness/src/policy-wave2.ts`, `apps/harness/src/policy-guard.ts`, `apps/harness/test/policy-wave2.test.ts`,
  `apps/harness/test/policy-guard.test.ts`, two lines of `test/test-counts.json` (written by `write`: section 8) and this note.
  Not touched: `apps/harness/src/policy-marginal.ts` and `apps/harness/test/gate-cell.test.ts` (K116, another item).
- **Rules held**: every probe row is built in memory, as the test files build theirs, on the seeded synthetic registry
  (`syntheticRegistry()`, seed 37); the probes open no data series, registry file or committed table, and the suites they run read
  the repository's own files as the CI does, only the counts of the rows the guard receives being recorded. The trunk ships no
  committed kata table: no folder `apps/harness/data/kata/tables/` at the base, and `COMMITTED_TABLES` is `{}`
  (`apps/harness/src/policy-committed-pins.ts`). Nothing of R1. Node 24.21.0; every run under `offline.mjs --no-egress`, 0
  refused attempts (section 11).

## 1. Why the lot is still needed: the base enforces neither clause (MONARK `eea4990`)

**The code.** `wave2Admission` (`apps/harness/src/policy-wave2.ts` l.26-43) bounds tail_m by n - r (l.36), recomputes both tails
from the counts (l.37-39) and compares their strings (l.41); nothing compares misses with tail_m. `guardKataRow` only keeps misses
between 0 and n (`apps/harness/src/policy-guard.ts` l.75); l.83 names "misses <m> above k* <k>" on `m > ks` whatever the family
(`dir`, l.40), and l.89 requires that reason.

**The probe** (`probe-admission.mjs`; the rows of `apps/harness/test/policy-wave2.test.ts` l.21-57, copied line for line). P1 is
the wave 1 band row `eth-mae-down-1h kata:ewma-vol-hw-v1@binance/ETHUSDT/1h/b0`: n 740, misses 1, k* 2 at test_delta 0.05 and at
0.025, r 703, n - r 37.

| Row fed to `guardKataRow` at the base | Result |
|---|---|
| (a1) wave 2, region, misses 2, tail_m 1, tail_a 0, miss_adj_a 0 | admitted |
| (a2) wave 2, the row of `w2_guard_names_a_constant_tail_before_a_rejection`: tail_m 0, misses 2, miss_adj_a 1, silence, "tail sequence constant (fails closed)" | admitted |
| (a3) wave 2, the empty tail of l.111 and l.118 of that file: tail_m 0, misses 1, the same reason | admitted |
| (b1) wave 1 band (P1), misses 3, silence, "misses 3 above k* 2" | admitted |
| (b2) the same row as region | refused: "has status 'region' and reason '', not 'silence' and 'misses 3 above k* 2'" |
| (b3) wave 2 band, misses 3, tail_m 37, tail_a 1, silence, "misses 3 above k* 2" | admitted |
| witnesses: misses = tail_m = 2; tail_m 0 with misses 0; misses = k* = 2 on each wave | admitted |

Clause 1 does not hold (a1 to a3; a1 is a region row, as the review of `1586565` found), nor clause 2: a band row with misses above
k* is admitted with the direction reason (b1, b3) and refused as region (b2).

**No row computed from scores breaks either clause.** A band's qhat is its (n - k*)-th score (`packages/hikae/src/l1-split.ts`
l.73-78), so its misses, the scores above qhat, are at most k*; the wave 1 generator gives "misses <m> above k* <k>" to direction
cells only (`kata/bench/calibrate.ts` l.138), and the wave 2 generator has no such reason (`kata/w2c/calibrate2.ts` l.121-123). In
wave 2, tail_m counts the scores above tau, the r-th score (`packages/hikae/src/tail.ts` l.139-154), and misses the scores above
qhat (`kata/w2c/calibrate2.ts` l.108-110). When n - k* >= r, qhat is at or above tau and misses <= tail_m. `probe-margin.mjs`
recomputes (n - k*) - r for every n the guard calibrates in wave 2 (from n0 368 to `W2_CALIB_N_MAX`, alpha 0.01, test_delta 0.025):
the minimum is 18 at 1h and 36 at 4h, both at n 368, and none is negative, as MONARK measured (`52e0091`). So an empty tail
carries no miss.

## 2. Construction

No line of either file moves: each clause is a second statement on an existing line, and the comment of `wave2Admission`
(`apps/harness/src/policy-wave2.ts` l.21-24) is rewritten on its four lines, adding misses at most tail_m to its list.

**Clause 2**, on `apps/harness/src/policy-guard.ts` l.76 (today `const p = r.n - ks;`):

```ts
  const p = r.n - ks; is(dir || m <= ks, `has misses above k_star on a band row (misses ${String(m)}, k_star ${String(ks)}): a band's qhat is its (n - k_star)-th score, so at most k_star scores exceed it`);
```

- Place in the order: after the checks that make m and ks exact (l.62-64, l.75), before p_served (l.77), qhat and k_obs (l.79-80),
  the check outcomes (l.81), `wave2Admission` (l.82) and the reason (l.83). A count invariant sits with the counts, as l.75 does;
  and before l.83, the third branch of the reason (`m > ks`) is then reached by direction rows only, the order of the wave 1
  generator (`kata/bench/calibrate.ts` l.135-141) and the closed list of wave 2 (`kata/w2c/calibrate2.ts` l.121-123). l.83 is
  unchanged.
- Every wave 2 row is a band (l.43), so the clause holds on both waves. A wave 2 row that breaks both clauses is named by this one,
  checked before `wave2Admission` is called.

**Clause 1**, on `apps/harness/src/policy-wave2.ts` l.36, beside the bound of tail_m:

```ts
  is((r.tail_m ?? 0) <= r.n - rank, `has tail_m above n - r (r ${String(rank)})`); is(r.tail_m === null || (r.misses ?? 0) <= r.tail_m, `has misses above tail_m (misses ${String(r.misses)}, tail_m ${String(r.tail_m)}): qhat is at or above the tail threshold (n - k_star >= r), so every miss is a tail point`);
```

- Place in the order: the two bounds of the tail's counts together, before any tail arithmetic (l.37-39) and the strings (l.41),
  as n is bounded before the tails (`apps/harness/src/policy-guard.ts` l.46). misses already lies between 0 and n there
  (`apps/harness/src/policy-guard.ts` l.75). A null tail_m is left to the exact null, which refuses it by name (count-not-integer,
  through l.38 of `wave2Admission`), as today.
- The generator's reason order: a wave 2 row that reaches l.83 of the guard now has misses <= tail_m. An empty tail carries no miss,
  check 1 is empty, so "tail sequence constant (fails closed)" never meets "dependence check rejects" on one row: the order of
  `kata/w2c/calibrate2.ts` l.121-122 holds by construction.

**The test builder**, `apps/harness/test/policy-wave2.test.ts` l.45, rewritten in place: misses default to P1's, at most tail_m,
`misses: Math.min(P1.misses ?? 0, c.tail_m ?? 37)`; its comment (l.43) says so. A case that names misses keeps them (T1, section
4). Why, in section 3.

## 3. The fixture sweep: no row refused by mistake

**Method.** `sweep/hooks.mjs` and `sweep/register.mjs` wrap `guardKataRow` in memory: its declaration is renamed on its own line and
a wrapper is appended after the last line, so no line moves; the files on disk keep their sha256 (checked before and after). The
wrapper records each row the suites pass to the guard, the base outcome and the line of the refusing check. The suites are the five
files that call the guard (`kata-path`, `policy-guard`, `policy-retire`, `policy-row-schema-corpus`, `policy-wave2`;
`test/verifiers-list.test.ts` imports `verifierIdentity` only): 67 of 67 green under the wrapper, as without it.
`sweep/classify.mjs` then places each clause after its line and asks, of every row, whether the clause is reached, whether it is
broken, and what the base did.

**Result**: 481 calls, 263 distinct rows, 353 admitted and 128 refused at the base.

| Clause, place | Newly refused | Refusal message changed |
|---|---|---|
| clause 2, after l.75, l.76, l.79 or l.81 of the guard | 0 | 0 |
| clause 1, after l.36 or l.39 of `policy-wave2.ts`, a null tail_m read either way | 3 calls, 2 rows | 3 |

The two rows have an empty tail (tail_m 0) and misses 1 or 2, in three tests of `apps/harness/test/policy-wave2.test.ts`:

- `w2_guard_names_a_constant_tail_before_a_rejection` (l.254): misses 2, miss_adj_a 1. It becomes T1 (section 4), as the item says.
- `w2_guard_refuses_a_reduced_tail` (l.102, rows of l.111-113) and `w2_guard_refuses_region_with_empty_or_low_tail` (l.117, case 1
  of l.118): `w2({ tail_m: 0, tail_a: 0 })` takes P1's misses, 1. These tests hold the null pair and the reason of an empty tail, not
  a miss in it. The builder line gives them the generator's empty tail, misses 0, with their bodies unchanged; those rows are green
  at the base (probe 4, its control test).

Each newly refused row has the shape clause 1 targets, a miss in an empty tail, which no generator row has (section 1): none is
refused by mistake. No committed table exists to sweep. Clause 2 touches no row, as the synthetic registry predicts: it draws band
misses between 0 and k* and turns a band's "silence-misses" plan into "silence-runs"
(`apps/harness/test/helpers/synthetic-registry.ts` l.51 and l.56).

Set aside: `misses: 0` written into l.111 and l.118. Red-proof would then judge both tests and refuse them as green at the base
(`scripts/red-proof.mjs` l.188), and the second is K264's test (section 6), whose killer reddens it through the guard's exception.

## 4. Tests first (planned; none is written in this run)

Every new assertion judges by an assertion, the lesson of PAROXYSME's killer sweep (`169cbc3`): a test reddened only by the guard's
exception (`ERR_TEST_FAILURE`) reads inconclusive. A refusal is `assert.throws` on the whole message,
`/^Error: MONARK import guard: <task_class> <cell_key> has … \.$/`. An admission is `assert.deepEqual(verdict(row), [status,
reason])`, where `verdict` returns the status and reason of an admitted row and the guard's message otherwise. No bare `check(row)`
in the new tests. Probe 4 (`planned-at-base.test.mjs`) runs these assertions against the base: each planned test is red there with
TAP code `ERR_ASSERTION`, never by a guard exception or a load error, and its admissions are green.

| Test (file, place) | What it asserts | Red at the base by |
|---|---|---|
| T1 `w2_guard_refuses_misses_above_tail_m` (`policy-wave2.test.ts`, in place of `w2_guard_names_a_constant_tail_before_a_rejection`, l.250-258, with `verdict` above it) | the row of l.255 (tail_m 0, misses 2, miss_adj_a 1) refused with clause 1's message as silence "dependence check rejects" and as "tail sequence constant (fails closed)"; the region row misses 2, tail_m 1 refused (a1); misses = tail_m = 2 admitted as region; the empty tail with no miss admitted with its reason; a null tail_m still refused as count-not-integer | its first assertion: the base refuses the row by the reason ("has status 'silence' and reason 'dependence check rejects', not …"), so the regex fails; the next two: "Missing expected exception" |
| T2 `guard_refuses_band_misses_above_k_star` (`policy-guard.test.ts`, after its last line, 258) | on the band row the finder of l.253 returns (eth-mae-down-1h b0, n 740, k* 2): misses 3 refused with clause 2's message as silence "misses 3 above k* 2" and as region; misses = k* admitted as region; `dirMisses` (l.36: btc-dir-1h, misses 342, k* 331) admitted with "misses 342 above k* 331" | its first assertion: "Missing expected exception" (the base admits the row) |
| T3 `w2_guard_refuses_band_misses_above_k_star` (`policy-wave2.test.ts`, after T1) | wave 2 band, misses 3, tail_m 37: refused with clause 2's message as silence "misses 3 above k* 2" and as region; misses 3 with tail_m 1, which breaks both clauses, refused with clause 2's message; misses = k* admitted as region | its first assertion: "Missing expected exception" |

The killer line above each, in that order:

```
// killer: apps/harness/src/policy-wave2.ts:36 CONST "(r.misses ?? 0) <= r.tail_m" -> "true"
// killer: apps/harness/src/policy-guard.ts:76 CONST "dir || m <= ks" -> "dir || !w2 || m <= ks"
// killer: apps/harness/src/policy-guard.ts:76 CONST "dir || m <= ks" -> "dir || w2 || m <= ks"
```

T2's mutant turns the clause off on wave 1 rows and T3's on wave 2 rows; each kills its own test by its first assertion.

**The killer of the old test retires.** Its mutant, `apps/harness/src/policy-guard.ts:83 COR "adm.empty ? [" -> "adm.empty && (!w2 ||
!adm.reject) ? ["`, becomes equivalent under clause 1: a wave 2 row with an empty tail has no miss, so check 1 is empty and
`adm.reject` is false (`apps/harness/src/policy-wave2.ts` l.42), and the mutated condition equals `adm.empty` on every row. Its
wave 1 sister (`apps/harness/test/policy-guard.test.ts` l.250) stays, killable on wave 1 rows.

**Mutants in the table**, run at C by `scripts/mutants/run.mjs --table`. The tool pairs a killer line with the test declared on the
next line (`scripts/mutants/run.mjs` l.9), so one killer line per test, and these go to the table, each killed by an assertion:

| Mutant | Killed by |
|---|---|
| `policy-wave2.ts` l.36 ROR `(r.misses ?? 0) <= r.tail_m` to `<` | T1, its two admissions |
| `policy-wave2.ts` l.36 CONST `r.tail_m === null \|\| ` to nothing | T1, the null tail_m |
| `policy-guard.ts` l.76 CONST `dir \|\| m <= ks` to `true` | T2 and T3 |
| `policy-guard.ts` l.76 ROR `m <= ks` to `m < ks` | T2 and T3, misses = k* |
| `policy-guard.ts` l.76 CONST `dir \|\| m <= ks` to `m <= ks` | T2, `dirMisses` |

Red-proof, F2P, `--base 92d01d67`: T1, T2 and T3 judged, red at the base by an assertion (probe 4) and green at C. The builder
lines (l.43, l.45) lie in no test body (`scripts/red-proof.mjs` l.7-9), so no other test is judged, and the rename needs no
removal line in this mode.

## 5. Killer anchors

Thirty-five killer lines of the tree target the two files (`killers-on-guard-files.txt`); at the base, the anchor checker reads the
73 killer lines of the four test files that carry them as anchored, and `every_killer_line_is_readable` passes. Those at or below
the two places:

- `apps/harness/src/policy-guard.ts`, l.76 and below, 14 lines: l.83 three times (`apps/harness/test/policy-guard.test.ts` l.250,
  `apps/harness/test/policy-wave2.test.ts` l.116 and l.253), l.84 (`apps/harness/test/policy-guard.test.ts` l.111), l.85 twice
  (`apps/harness/test/policy-wave2.test.ts` l.141 and l.243), l.89 (`apps/harness/test/policy-guard.test.ts` l.102), l.94
  (`apps/harness/test/policy-retire.test.ts` l.176), l.102, l.106 and l.111 (`apps/harness/test/policy-guard.test.ts` l.201,
  l.233, l.133), l.118 (`apps/harness/test/policy-retire.test.ts` l.149), l.124 (`apps/harness/test/policy-guard.test.ts` l.65),
  l.130 (`apps/harness/test/kata-path.test.ts` l.307). None targets l.76.
- `apps/harness/src/policy-wave2.ts`, l.36 and below, 5 lines: l.36 (`apps/harness/test/policy-wave2.test.ts` l.126, ROR
  "<= r.n - rank"), l.41 (l.101 of that file), l.60 three times (`apps/harness/test/policy-retire.test.ts` l.165,
  `apps/harness/test/policy-wave2.test.ts` l.167 and l.207).

None moves. l.36 is rewritten: its killer's "<= r.n - rank" still occurs exactly once there, so the trunk guard passes, and the
anchor checker with `--ref 92d01d67` will read one drift, the line rewritten on its own site, declared here. The killer of the old
test leaves with it (section 4); the three new ones are anchored at C. One comment names a line of these files:
`test/verifiers-list.test.ts` l.143, which names line 24 of the guard, above both places. In the test files, no line of
`apps/harness/test/policy-wave2.test.ts` above l.250 moves (l.43 and l.45 are rewritten in place), and
`apps/harness/test/policy-guard.test.ts` only grows after l.258.

## 6. The neighbouring lot: the KATA killers of PAROXYSME's sweep

MONARK asks its G0 after this one (`169cbc3`). Its lines in the two test files are K212 (`apps/harness/test/policy-guard.test.ts`
l.93), K214 (l.111) and K223 (l.206); K264 (`apps/harness/test/policy-wave2.test.ts` l.116), K265 (l.126), K267 (l.141), K268
(l.156) and K276 (l.243). Elsewhere: K116 (`apps/harness/test/gate-cell.test.ts` l.67), K235
(`apps/harness/test/policy-projection.test.ts` l.79) and K1348 (`test/recompute-report.test.ts` l.172). This lot fixes none and
moves none: their killer lines, the bodies of their tests and their targets keep their lines. One of their rows changes: case 1 of
K264's test (l.118) gets misses 0 from the builder; under K264's killer the test still reddens through the guard's exception at
l.121, the verdict of the sweep. The new tests have no bare `check`, so they add nothing to that lot.

## 7. Size (R-25, CI form)

The pathspec of `.github/workflows/ci.yml` l.100, documents out. Planned: `policy-guard.ts` 2 (+1 −1); `policy-wave2.ts` 10 (l.21-24
and l.36); `policy-wave2.test.ts` about 39 (l.43 and l.45: 4; `verdict` and T1 for the nine lines of the old test: about 24; T3:
about 11); `policy-guard.test.ts` about 15 (`verdict` and T2); `test/test-counts.json` 4. About **70**, bound 547.

## 8. Test count (TEST-COUNT-FLOOR-1)

- **The record**: `test/test-counts.json` l.69 and l.75 give 18 tests to each of the two test files at the base. The lot makes them
  19 and 19 (T2; T3; T1 replaces the old test): a rise, no drop, so no line in `test/test-count-removals.json`.
- **The gate is in force**: #256 is merged, the base itself, and its job `g3-test-count` (`.github/workflows/ci.yml` l.306) holds
  each run of the main suite to the record. So the lot writes the record: after C, on its tree merged with the trunk of the moment,
  `npm run test:main && node scripts/test-count-floor.mjs write`, and it commits the two rewritten lines, never by hand. If the
  trunk moves before the merge, the same is done again on the new merge (`docs/G0-lot-test-count-floor-1.md` l.199). MONARK's
  order (`169cbc3`): the record is written after #256, from which point the gate holds it in CI.

## 9. Risks, and what the review should check

- **The margin rests on pinned constants**: `W2_TAIL_FRAC`, `W2_CALIB_N_MAX`, alpha 0.01, test_delta 0.025 at attempt 2. A change
  to one of them, or the admission of wave 2b rows with a test_delta per horizon (W2B-GUARD-ADMISSION-1), reruns
  `probe-margin.mjs`; a negative margin would make clause 1 refuse a generator row, a refusal and never an admission.
- **The builder line** changes the rows of two tests that red-proof does not judge: the review reruns both at C, and checks that a
  case naming misses keeps its forged row (T1 relies on it).
- **The retired mutant**: the review checks the equivalence of section 4, or runs it at C and finds no test that kills it.
- **The sweep**, rerun at the lot's head: clause 2 refuses no fixture row, clause 1 only the rows of T1.
- **The rename**: `docs/ETAT.md` l.1596 and `docs/G0-lot-verifiers-list-f5a-1.md` l.1116 and l.1203 keep the old name, as dated
  text; MONARK's line that closes the item names the new one. If MONARK prefers the old name, T1 keeps it (one line).
- **The record** (section 8): written by `write` on the merged tree; a change of count in any other file, or a drop, is a finding.
- **Messages**: English and ASCII; `gate:vocab` and `lang:gate` at C, with `tsc --noEmit`, eslint on the four files,
  `lint:ratchet`, `export:check` and winlint.

## 10. Windows

No fixture path: the planned tests and the probes build their rows in memory and write no file, so case folding plays no part.
MONARK's Windows replay at the merge runs the two test files and `every_killer_line_is_readable`.

## 11. Evidence

Kept under the author's scratchpad (`w2-guard-author/`), Node 24.21.0, each run offline with 0 refused attempts:

| File | sha256 |
|---|---|
| `probe/probe-admission.mjs`, its output `logs/probe-admission.out` | `be4031ac…`, `0755c4ac…` |
| `probe/probe-margin.mjs`, `logs/probe-margin.out` | `e5861926…`, `9c4e852b…` |
| `probe/sweep/hooks.mjs`, `register.mjs`, `classify.mjs` | `562facd4…`, `06776ee3…`, `fc0b1f3f…` |
| `logs/sweep/classify.out`, `logs/sweep/sweep-suites.tap`, the records concatenated | `b85e7174…`, `e790e62a…`, `85ac067d…` |
| `probe/planned-at-base.test.mjs`, `logs/planned-at-base.tap` | `44b06dce…`, `adf8c6ed…` |
| `logs/base-suites.tap` (the five suites, 67 of 67, on `c94c57df`) | `4d58e3ee…` |
| `logs/base-suites-92d01d67.tap`, `logs/probe-admission-92d01d67.out` (the same two runs on `92d01d67`) | `e95f6833…`, `d534d5eb…` |
| `logs/killers-on-guard-files.txt`, `logs/anchors-base.out`, `logs/killer-lines-base.tap` | `741ae279…`, `d36cedcf…`, `72f8b88d…` |

## 12. As built

- **Heads** of `recherches/w2-guard-misses-tail-1`, on `92d01d67`: T `f8abf303` (the tests), C `9aba7b95` (the two clauses), the
  record `fab4573b` (two lines), then this section. Nothing is merged.
- **The trunk moved** to `52ddf000` during the build, documents only (ETAT, JOURNAL-PROVENANCE, ADR-METHODE-2); there the item reads
  at `docs/ETAT.md` l.1934, its text unchanged.
- **As planned** (C, `9aba7b95`): the clauses on `apps/harness/src/policy-guard.ts` l.76 and `apps/harness/src/policy-wave2.ts`
  l.36 with the messages of section 2, the comment of l.21-24 rewritten on its four lines, the builder line, T1 to T3 and their
  killers (section 4). Both files keep their line counts, 136 and 64.
- **Where the build departs** (C, `9aba7b95`): T1 and T3 stand at `apps/harness/test/policy-wave2.test.ts` l.259 and l.273, T2 at
  `apps/harness/test/policy-guard.test.ts` l.269; each file gains `verdict` and `whole` just above them. `whole` builds each refusal
  regex from the plain message, escaped and anchored, where the note wrote it out by hand. At T alone, `every_killer_line_is_readable`
  is red on the three new killer lines, whose target text comes with C; it is green at C, and no CI runs without a pull request. The
  size is 77, against about 70 in section 7.
- **Measured**, Node 24.21.0, every run offline with 0 refused attempts:
  - At T, the two files: 38 tests, 35 green; T1, T2 and T3 red by `ERR_ASSERTION`, each at its first assertion; every other test
    keeps its base verdict.
  - At C: the five suites 69 of 69; `tsc --noEmit` and eslint on the four files clean; the anchor checker reads the 75 killer lines
    of the four test files as anchored, and with `--ref 92d01d67` one drift, the line of section 5.
  - Red-proof, `--base 92d01d67 --gel 9aba7b95 --draw 3 --seed 20261008`: OK, 3 judged, all F2P, 35 unchanged, 3 killers drawn and
    killed.
  - `scripts/mutants/run.mjs --killers --table` on the three killer lines and the table of section 4, plus the retired killer as a
    sixth row: 8 of 9 killed, each by an assertion of its test; the retired killer survives the 81 target tests and their replay, as
    section 4 says.
  - `npm run test:main` at C: 2 970 tests, 2 948 pass, 0 fail, 22 skipped. The record writer then changes two lines of the record,
    18 to 19 for each guard test file (290 files, 2 970 tests; 2 968 at the base), and `node scripts/test-count-check.mjs --base
    origin/lot/etude-suite` is green, 0 drop.
  - At the record's head: `lint:ratchet` 69/69; `gate:vocab`, `lang:gate` and `export:check` OK; winlint, 6 files, no hazard;
    `git diff --check` clean; the host-address test 13 of 13; the R1 scan 0 at each push. The sweep of section 3, rerun there: no
    admitted row breaks either clause, and the two new messages refuse rows of T1, T2 and T3 only (3, 2 and 3 calls).
- **The review's fold** (fresh review at `59882c09`: one m, recherches `ad818b5`; MONARK `e6ebb72`):
  - **The finding**: `verdict` returned the message of any error, so a crash of the guard under a mutation read as a refusal judged
    by an assertion.
  - **The fix**: both helpers, `apps/harness/test/policy-wave2.test.ts` l.251 and `apps/harness/test/policy-guard.test.ts` l.261, now
    return only a message that starts with `MONARK import guard: ` and throw any other error again. Their comments, l.250 and l.260,
    say so. Each edit stays on its line: no line moves and no killer anchor is touched. The older helper `refuse` has the same flaw
    for refusals; it is narrowed in the next lot (section 6), before that lot adds its thirteen calls to `verdict`.
  - **Measured**, every run offline with 0 refused attempts:
    - the crash mutation of `apps/harness/src/policy-guard.ts` l.100 (`rc.scores_sha256` read as `rc.x.scores_sha256`) turns T1, T2
      and T3 red by `ERR_TEST_FAILURE`, where the broad helper gave `ERR_ASSERTION`. The 38 entries of the two files give the same
      codes as the review's run of its narrowed helper;
    - unmutated, the two files: 38 of 38;
    - `scripts/mutants/run.mjs --killers` against `92d01d67`: 38 killer lines in the two files, 30 killed, each by an assertion,
      among them the three of section 4. The 8 others are not concluded: they are the eight lines of the next lot;
    - `npm run test:main`: 2 970 tests, 2 948 pass, 0 fail, 22 skipped. `node scripts/test-count-check.mjs --base
      origin/lot/etude-suite` is green, 0 drop, and the record does not change;
    - the anchor checker with `--ref 92d01d67`: 1 788 killer lines, 1 787 anchored, the one drift of section 5, 0 lost;
    - `tsc --noEmit`, eslint on the two files, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check`, winlint and `git diff
      --check` clean; the R1 scan 0.
