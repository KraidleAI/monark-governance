# TIMED-TESTS-LOAD-1: three time-bound tests made safe under the load of the full suite (tests only)

MONARK mission of 2026-10-15 (`MISSION-TIMED-TESTS-LOAD-1.md`), items MUTANTS-DEAD-TSC-LOAD-1 and L2-EXIT-BOUND-LOAD-1. Base `f6a2ef0e`
(lot/etude-suite), branch `lot/timed-tests-load-1`. Zone: `test/mutants-run.test.ts`, `test/l2-loop.test.ts`, this note, the two count
records by `write`. No production code: `scripts/mutants/` and `scripts/record-binance-l2.mjs` are unchanged to the byte. Author: a builder
instance launched as `claude-opus-5-5` at effort `high`, resolved as `claude-opus-5-5`. Clock read at 13:39 UTC.

red-proof: test-only

## The item

The G7 oracle of `c4a7058d` (the local merge of #299, never pushed) failed two tests of `test/mutants-run.test.ts` under `test:main`, and two
local runs of the #299 branch each failed one of the three tests below; the trunk `ebabd0f9` without #299 was green (3147 pass, 0 fail,
`testmain-trunk-ebabd0f9.log` l.4213-4216).

- `mutants_a_dead_or_silent_tsc_is_non_conclu_never_survit` (G24): Z2 gives `['non conclu', null]` where the note
  `'tsc exit 1 without a diagnostic line'` is expected (oracle log `09-test_main.log` l.4251-4278; local `testmain-3bii-ecac76f1.log`
  l.4251-4280).
- `mutants_a_time_overrun_is_non_conclu_and_never_replayed` (D-5): X1's replay is `null` where `'non conclu'` is expected (oracle log
  l.4280-4308).
- `l2_command_exit_bounded`: `[3, null, false]`, 15495 ms against a bound of 15 000 (local `testmain-3bii-fd29c70d.log` l.4252-4276).

The load that makes them yield is the #299 branch (`d8332d6c`), whose `apps/bell/test/bell-units-compose.test.ts` runs in `test:main`
with the other files: 62.8 to 66.3 s in the thirteen full-suite logs read here (for example `with-5.log` l.118, 63 617 ms), 45 to 50 s
when it runs alone (45.2 s in the build report of lot 3b-ii, 49.7 s in its review, both local).

## Measures before the design (this host, Windows, Node 24.21.0 by `node -v`, 24 logical processors by `os.cpus().length`)

Every run below is on a clone of `d8332d6c` outside the repository (`git clone --shared`, `node_modules` junctioned as
`scripts/oracle/run.mjs` l.106-117 does). The instrumented clone `probe` adds logging only (6 lines added, 3 removed, the assertions
unchanged); each test appends the record's fields it reads (row `ms`, `exit`, `signal`; for l2 the child's own clock at its start, after
its import and at its exit).

1. Alone, the two files (`probe`): green. Z2 48 ms, the typecheck baseline 54 ms, X1 165 ms, the D-5 baseline 176 ms; l2 5079 ms =
   18 (spawn to the child's clock origin) + 17 (bootstrap) + 29 (import) + 5008 (the grace, `EXIT_GRACE_MS` = 5000) + 7 (teardown).
2. Under `test:main`, two runs of `probe`: both green (3159 pass, 0 fail). Z2 95 and 89 ms, X1 247 and 241 ms; l2 5223 ms, then
   7883 ms = **2603 ms before the child's clock origin** + 40 + 211 + 5013 + 16. In these breakdowns the grace did not move (5008 to 5013 ms); the start did (but see the tail of l2, below).
3. A sampler beside the second run (one `node -e 0` timed by `spawnSync` every 500 ms): 642 samples over 7.5 min, median 66 ms, p90
   153 ms, p99 3461 ms, **max 13 279 ms** (13:11:35 UTC); 16 samples past 1 s; free memory never below 9478 MB, no spawn error. The load
   is not a steady slowdown but bursts in which the start of a process stalls for seconds.
4. Under `test:main`, the clean clone `without` (`d8332d6c`, no change): `l2_command_exit_bounded` red, 16 168 ms, `[3, null, false]`
   (3158 pass, 1 fail); G24 and D-5 green that run.

## Mechanism (read in the code, confirmed by the measures)

- **G24**: the tool runs each `tsc` child under `spawnSync(..., { timeout: o.timeout * 10 })` (`scripts/mutants/run.mjs` l.262), and calls
  any child with `r.error`, a signal or status 134 `non conclu` without a note (l.265). With `--timeout-ms` = `OVER` = 1500, a stall of
  15 s or more at the start of Z2's `tsc` (48-95 ms of work) cuts it with `ETIMEDOUT`: `['non conclu', null]`, exactly the recorded red. The
  typecheck baseline is exposed the same way. Z1 (a `tsc` that hangs) runs to the bound whatever the load.
- **D-5**: a node run is late when its `spawnSync` ends in `ETIMEDOUT` (l.238, l.241) or its TAP holds a `testTimeoutFailure`; a late
  first run is never replayed (l.308). The file-level entry of the inner `node --test` is not bounded by `--test-timeout` (G1, whose
  module sleeps, runs to 15 009 ms, never 1500). So X1's replay is `null` only when X1's first run (165-247 ms of work) is cut at
  10 * OVER = 15 s; that the stall falls at its start is a deduction (the record cannot tell start from run), and the construction does
  not depend on it: any cut is run again. The D-5 baseline is exposed the same way; H1, G1 and a cut replay stay `non conclu`.
- **l2**: the bound, 15 000 ms, counts from before the spawn, so it holds the child's start (18 ms alone, 2603 ms under load, and a
  `node -e 0` stalled up to 13 279 ms) besides the 5 s grace it is about. 15 495 ms and 16 168 ms read as a stall of 10 to 11 s at the
  start (those runs kept no breakdown).

A bound read before a run cannot cover a stall that begins after it: the measures show bursts, not a slowdown a prior `node -e 0` would
predict. The durations that do identify a stall are produced during the run: the child's own report for l2, and for the tool the `ms` it
records of each child that ends on its own.

## Construction

1. **l2** (`test/l2-loop.test.ts` l.981-993): the child is spawned asynchronously and writes one line as it calls `leave(3)`. `launch`,
   the time from `t0` to that line, is measured here; the assertion becomes `Date.now() - t0 < launch + 15_000`, and the kill that
   `spawnSync`'s `timeout: 20_000` gave is armed at the line, 20 s past the launch. The start of the process, where the load lands, is
   out of both bounds; the 5 s grace and the 10 s beyond it are what the test bounds, as before. A `timeout: 120_000` on the spawn reaps
   a child that never writes its line (an import that hangs): it stays under the runner's `--test-timeout` of 300 s and is about nine times the longest stall measured (13.3 s), so such a child is
   red in 120 s and does not outlive the test; it is no bound of the test. The assertion is unchanged in form: `[status, signal, bound] = [3, null, true]`.
   The import line l.16 gains `spawn` (no line added above l.199).
2. **G24 and D-5** (`test/mutants-run.test.ts` l.637-652 and l.705-710): each run ahead goes through `bounded()`. The first run keeps
   `--timeout-ms` = `OVER` = 1500, as before. After it, the test reads in the record the children that must end on their own (G24: the
   typecheck baseline and Z2; D-5: the baseline and X1's first run). One that ran (`ms` > 0) and has no exit code (`exit` null) was
   ended by its bound, by the host or by its own signal, never by an exit (on their own, Z2 and X1 exit 1 and the baselines 0) nor judged
   by the tool: the run is void, and runs again with `over` = the larger of `2 * over` and the longest such `ms` / 5, so that its bound
   `10 * over` doubles (the `ms` of a cut child reads its bound plus 9 to 52 ms, never the length of the stall). A red that does not
   depend on load is red in all three runs, so it stays red. Worst realistic case, a cut in the first two runs and a clean third: about
   155 s for G24 and 175 s for D-5, under the runner's 300 s: the two runs measured, 64.3 s and 73.5 s (`stall-lot-2.tap`), plus the cut
   child's bound in the second run (30 s) and the third run's hanging rows (60 s for G24, about 70 s for D-5). The exit code, not the `ms`, tells the cut: the cuts measured read
   15 009 to 15 052 ms, 9 to 52 ms past the bound, a margin no threshold on `ms` should lean on. The third run is final, whatever it
   shows (`RUNS` = 3, a count of attempts, not a measured bound). G1's module and H1's test sleep `FX_HOLD` = `10 * over + 5000`
   ms, set for each run (5 s past the run's bound, as G1 did; H1 slept 60 s before). A row that hangs (Z1, G1, H1) only runs
   longer under load, never shorter than its bound.
3. The killer lines stay right above their tests; their targets are unchanged. The test names are unchanged; the count records do not
   move (`node scripts/test-count-floor.mjs write`: no diff).

## Proofs

- **Stall injected, red then green** (the two files, the three tests by name, on clones of `d8332d6c`): a preload of the tool wraps
  `spawnSync` and, once, starts the named child 16 s late (`--import` of an `Atomics.wait`): Z2's `tsc` for G24, X1's first run for D-5;
  the l2 child waits 11 s before its import. Without the lot: 3/3 red, exactly the recorded reds (`['non conclu', null]` for Z2; X1's
  replay `null`; `[3, null, false]` at 16 128 ms). With the lot (final bytes): 3/3 green; the attempt log shows G24's Z2 cut (`exit`
  null, 15 022 ms) then green at over 3005, D-5's X1 cut (`exit` null, 15 035 ms) then green at over 3007; l2 green at 16 090 ms.
- **Under the load of the suite**: seven `test:main` runs of the merge (`d8332d6c` with this lot's diff), one after the other, nothing
  else running: see the table below.
  Without the lot, `without` (above, point 4) is red on l2.
- **Killers by hand** on a clone with the lot (final bytes): `run.mjs:265` (G24) red in 17 s, one run (Z1 `'tsc exit null without a
  diagnostic line'`); `run.mjs:308` (D-5) red in 36 s, one run (H1 replayed); `record-binance-l2.mjs:432` (l2) red in 20 s, `[null,
  'SIGTERM', false]`. A void run needs a must-end child without an exit code; none of the three mutants gives one.
- Alone on the lot's tree, final bytes: the two files green (166 tests, 139 pass, 0 fail, 27 skipped). `test:main` on the lot's tree,
  final bytes: 3194 tests, 3147 pass, 0 fail, 47 skipped, as the trunk `ebabd0f9` (l2 green at 10 668 ms that run, 4.3 s under the
  old bound); `test-count-check --base f6a2ef0e` exit 0.

| run | tree | `test:main` | G24 | D-5 | l2 |
|---|---|---|---|---|---|
| without-1 | `d8332d6c` | 3158 pass, 1 fail | green | green | **red**, 16 168 ms |
| with-1 | `d8332d6c` + lot | 3159 pass, 0 fail | green | green | green, 9311 ms |
| with-2 | `d8332d6c` + lot | 3159 pass, 0 fail | green | green | green, 5143 ms |
| with-3 | `d8332d6c` + lot | 3159 pass, 0 fail | green | green | green, 5129 ms |
| with-4 | `d8332d6c` + lot, second version | 3159 pass, 0 fail | green | green | green, 6072 ms |
| with-5 | `d8332d6c` + lot, final bytes | 3159 pass, 0 fail | green | green | green, 5183 ms |
| with-6 | `d8332d6c` + lot, final bytes | 3159 pass, 0 fail | green | green | green, 5209 ms |
| with-7 | `d8332d6c` + lot, final bytes | 3158 pass, 1 fail (below) | green | green | green, 5177 ms |

with-7's one red is outside this lot: `probe_smtp_implicit_tls_never_speaks_plaintext` (`test/probe-narabi.test.ts` l.1028, assertion
l.1037), `'smtp_timeout'` where `'smtp_tls_failed'` is expected, 1792 ms. Green in the 16 other loaded runs read here (169 to 561 ms).
Its bound is not a start's: the probe child reads `SMTP_DEADLINE_MS: "800"` (l.1036) and arms that deadline itself, once running,
just before the connect (`scripts/probe-narabi.mjs` l.477, l.654-656); the fake server lives in the test's own process. So a process
already running, the child or the test's, stalled past 800 ms in a handshake that fails in milliseconds on a calm host (a deduction from
the timeout, not a measure). Not in this zone, not touched: item **PROBE-SMTP-TLS-DEADLINE-LOAD-1** (tests only,
`test/probe-narabi.test.ts`): construction, this test's deadline set far above the longest stall measured, for example 30 s (more than
twice 13.3 s), and the kill of `runProbeAt` (8000 ms at l.1036, armed at the spawn) above it, both under the runner's 300 s; the green
run stays as short, since the handshake fails at once, and a mutant whose client waits for a reply goes red at the deadline instead of
at 0.8 s. The other fixed deadlines of the file (l.851, l.859, l.917) are read in the same pass, each kept or raised by what it tests.
Price, two values of one test and a run of its killers; carrier MONARK; trigger, a red of it in an oracle, or the close of part 3 of
the Bell timer at the latest.

The lot has three versions in this table. with-1 to with-3: a cut told by `ms >= 10 * over` alone, one space missing (`t =table`,
l.708) and a comment worded otherwise (l.639-640). with-4: the space and the comment fixed. with-5: the final bytes, a cut told by the
exit code (point 2 of the construction): the comment l.639-641, `bounded()` l.643-649 and its two callers l.651 and l.709. with-5 to
with-7 run the final bytes. The killers and the injected stall were run again on the final bytes (above).

Without the lot, four of the six loaded runs read here had one or two of the three tests red (the oracle of `c4a7058d`, `ecac76f1`,
`fd29c70d`, without-1), two had none (the two `probe` runs). Seven runs with the three tests green do not prove the tail gone; the
injected stall above proves the construction, and these runs show it holds under the real load.

## What remains, and its items

- **The tail**: the test is red by the load only if a stall cuts a must-end child in all three runs, with bounds of 15 s, then at
  least 30 s, then at least 60 s. The longest stall measured is 13.3 s (the oracle's red implies one of at least 15 s, a deduction from
  its cut, not a measure). Item **MUTANTS-BOUND-FROM-START-1** (construction, production code, outside this zone): the tool's bound of a
  child would count from the child's own start (a line it writes once running, as l2 now does), so that no stall at creation can cut it;
  then G24 and D-5 need no second run. Trigger: the next pass on `scripts/mutants/run.mjs`.
- **The tail of l2**: the lot takes the start out of l2's bound, but a stall of more than 10 s after the child's line (in its grace or
  its exit) still reddens it. Three breakdowns showed the grace steady (5008 to 5013 ms); that does not exclude it, and the sampler times
  the whole life of a `node -e 0`, start and run together. The question goes to the next item: does a stall hit a process already running?
  with-7 gives one datum (PROBE-SMTP-TLS-DEADLINE-LOAD-1, above): a deadline running in a started process expired, though it does not
  say which of the two processes stalled.
- **The source of the stalls**: what holds the start of a process for seconds on this host under `test:main` (free memory stays above
  9 GB) is not identified. Item **HOST-START-STALL-SOURCE-1** (research): trace process creation during a `test:main` (Windows
  performance recorder, process start events) against the sampler's bursts, name the cause, and say whether a stall also hits a process
  already running (the tail of l2 above). Trigger: the next PAROXYSME mapping of the test tooling.

## Size

Two test files, 30 lines added and 15 removed: 45 (`git diff --shortstat 00ef74ee` outside `docs/**/*.md`, from the merge base with
the trunk; the same count as `f6a2ef0e..985bcb66`, before the merge). R-25 bound: 1205
(`VIBEGATES_PR_LIMIT`, `.github/workflows/ci.yml` l.56).
