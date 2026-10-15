# PROBE-SMTP-TLS-DEADLINE-LOAD-1: the time bounds of the Narabi probe test, counted from the child's start (tests only)

MONARK mission of 2026-10-15 (`MISSION-PROBE-SMTP-TLS-DEADLINE-LOAD-1.md`), item PROBE-SMTP-TLS-DEADLINE-LOAD-1, formed in the G0 of lot
TIMED-TESTS-LOAD-1 (#303, `docs/G0-lot-timed-tests-load-1.md` l.117-140); its trigger, the close of part 3 of the Bell timer at the latest,
has come. Base `250991f9` (lot/etude-suite after the merge of #306), branch `lot/probe-smtp-deadline-load-1`. Zone: `test/probe-narabi.test.ts`,
`test/helpers/probe-start-line.mjs` (new), this note, the two count records by `write`. No production code: `scripts/probe-narabi.mjs` is
unchanged to the byte (sha256 `15da93f2...`, the same at the base and here). Author: a builder instance launched as `claude-opus-5-5` at
effort `high`, resolved as `claude-opus-5-5`. Clock read at 21:37 UTC (first draft) and 22:33 UTC (last edit).

red-proof: test-only

## The item

- with-7 of #303: `probe_smtp_implicit_tls_never_speaks_plaintext` red, `'smtp_timeout'` where `'smtp_tls_failed'` is expected, 1792 ms
  (`docs/G0-lot-timed-tests-load-1.md` l.117-118). Its deadline, 800 ms, runs in the started child.
- The corrector of lot 3c, 2026-10-15: the same test red, 8034 ms against the kill of 8000 ms, by a `TypeError` (as the mission reports it;
  that log is not read here). Point 2 below reproduces it.

## Measures before the design (this host, Windows, Node 24.21.0 by `node -v`)

Every run is on a clone of `250991f9` outside the repository (`git clone --shared`, `node_modules` junctioned as `scripts/oracle/run.mjs`
l.106-117 does). The instrumented clone `measure` adds logging only (9 lines added, 3 removed, the assertions unchanged): `runProbeAt`
preloads a module that writes the child's own clock on fd 3, and logs for each call the time from the spawn to that line (launch), the
child's clock at its preload, the time from the line to the exit (ran) and the kill; the 4 s wait logs its length.

1. Alone, the file in TAP: 50 pass, 12.9 s. Over the 41 calls of `runProbeAt`: launch median 49 ms, max 84 ms; ran median 49 ms, max
   752 ms (the test whose deadline is 700 ms). The 4 s wait: 12 ms.
2. Under `test:main`, beside the sampler: 3232 tests, 3182 pass, **3 fail**, 47 skipped, 12.3 min. The three reds are this file's:
   - `probe_smtp_no_residual_timer_handle`: elapsed 8016 ms against 8000 (assertion of l.937): launch 1180 ms, then **ran 6832 ms**
     for a send that takes 55 ms alone. A process already running stalled, the child or the test's own fake server.
   - `probe_smtp_implicit_tls_never_speaks_plaintext`: no line from the child within the kill of 8000 ms (8039 ms), the child killed,
     then `TypeError: Cannot read properties of null (reading 'alert_error')` (l.1037): the corrector's red.
   - `probe_smtp_unreachable_closed_port_and_timeout`: the same at its second call (8056 ms), `TypeError` at l.1094.
   Over the 41 calls: 2 without a line (both killed); launch median 122 ms, max 4874 ms, 8 past 1 s; the child's own clock at its
   preload up to 1983 ms; ran median 146 ms, max 6832 ms.
3. The sampler of #303 beside that run (one `node -e 0` timed by `spawnSync` every 500 ms): 798 samples over 12.4 min, median 125 ms, p90
   886 ms, p99 5074 ms, **max 20 329 ms** (21:14:33 UTC), 64 past 1 s; free memory never below 13 186 MB; no spawn error. The load is
   heavier than in #303 (max 13 279 ms).

The stalls hit the start of a process (no line in 8 s) and a process already running (6.8 s in a send of 55 ms). This is the datum the
G0 of #303 asked for (l.160-162): a stall does hit a running process, at least 6.8 s; which process stalled is not told.

## Design

1. **(b) The bounds count from a line the child writes once running.** `runProbeAt` spawns the probe with
   `--import=<test/helpers/probe-start-line.mjs>` and a fourth stdio pipe; the module writes `started` on fd 3 and closes it, before the
   probe's module loads. The probe writes stdout and stderr only (`console`, l.804-815) and never touches fd 3. The parent arms the kill at that line:
   `KILL_MS` = 2 * `MAX_SMTP_DEADLINE_MS` = 60 s, above any SMTP deadline the probe can arm (`smtpDeadlineMs` clamps to 30 s,
   `scripts/probe-narabi.mjs` l.634): a reaper of a hung child, never a bound of a test. The GET bounds of URL mode (l.54-86) do not
   reach it here: the callers of `runProbeAt` in URL mode set no `PROBE_TIMEOUT_MS`, and their GETs are answered at once by a loopback
   server, refused before any dial (`bad_port`) or failed at once by the test's fetch spy. `REAP_MS` = 120 s, armed at the spawn, reaps a
   child that never writes its line; it stays under the runner's `--test-timeout` of 300 s, about 5.9 times the sampler's max. `ran` is
   the time from the line to the exit. After the exit `runProbeAt` asserts by name: the child was not killed, it wrote its line, it wrote
   `narabi.json` (as `runProbe` does, l.75). A kill is never a `TypeError` (V-n1 of the check of the fold of 3c). The parameter `killMs`
   and the five `r.killed` assertions go: every caller gets the named assertion.
2. **The bound of a run that ends on its own**: `RUN_BOUND_MS` = 15 s, over twice the longest stall of a running process measured (6.8 s),
   under the default deadline (20 s, `DEFAULT_SMTP_DEADLINE_MS`), which is the shortest wait of the mutants these bounds catch. A stall only
   lengthens a run: a bound below the mutant's shortest wait catches it whatever the load, so the margin is needed on the green side only.
3. **(a) and each fixed `SMTP_DEADLINE_MS`** (line numbers of the base):

| test | deadline | before (from the spawn) | after (from the line) | why |
|---|---|---|---|---|
| `probe_smtp_global_deadline` l.851, l.859 | 500, kept | kill 8000 | `ran < 500 + RUN_BOUND_MS`, each call | it proves that a short deadline cuts a drip and a silent server; at 30 s the green run would last 30 s. The kill bounded the test (its name says "WITHIN the bound"); `ran` does now |
| `probe_smtp_connect_deadline_bounds_handshake` l.917-923 | 700, kept | kill 8000, elapsed < 4700 | `ran < 700 + RUN_BOUND_MS` | it proves that a short deadline cuts a silent handshake |
| `probe_smtp_no_residual_timer_handle` l.932-937 | 30 000, kept | kill 20 000, elapsed < 8000 | `ran < RUN_BOUND_MS` | the timer that must be cleared; already the ceiling |
| `probe_smtp_byte_bound_stops_flood` l.946-951 | 20 000, kept | kill 8000, elapsed < 8000 | `ran < RUN_BOUND_MS` | the test's name says "well before the 20 s deadline"; a new name would move the names record |
| `probe_smtp_reply_needs_complete_line` l.967 | default, kept | kill 8000 | `KILL_MS` only | its mutant fails at once (`smtp_auth_failed`) |
| `probe_smtp_implicit_tls_never_speaks_plaintext` l.1036 | 800, **raised to 30 000** (`MAX_SMTP_DEADLINE_MS`) | kill 8000 | `KILL_MS` (60 s) above it | (a): the handshake fails at once on a calm host (143 ms alone, with the lot), so the green run stays short; a client that waits for a reply goes red at the deadline |
| `probe_smtp_unreachable_closed_port_and_timeout` l.1093 | 500, kept | kill 8000 | `ran < 500 + RUN_BOUND_MS` | it proves that a server that never greets times out |
| `probe_smtp_no_residual_timer_handle_on_connect_failure` l.1202-1207 | 30 000, kept | kill 20 000, elapsed < 8000 | `ran < RUN_BOUND_MS` | as its twin |

4. **(c)** The wait for the fake server's AUTH in the test's own process (l.893-896): 4000 ms becomes 60 000 ms, about 3 times the
   sampler's max; it ends as soon as the AUTH comes (12 ms measured). The `spawnSync` timeouts of 60 s (at the base, l.73, l.312, l.514, l.547, l.1169)
   are kept, as #303 read them.
5. A killer line goes above each of the nine tests whose body changes (the killer convention of `scripts/red-proof.mjs`); the test names
   are unchanged.

## Proofs

- **Stall injected, red then green.** A preload in `NODE_OPTIONS` (`F:/tmp/probe-lot/tools/stall.mjs`, outside the repository) blocks
  one process once (`Atomics.wait`): `start`, the probe child at its preload, before its line (the preloads of `NODE_OPTIONS` run before
  those of the command line; a green under a 16 s stall also shows it, since 16 s past the line would exceed `RUN_BOUND_MS`); `connect`,
  the probe child right after its first `tls.connect` or `net.connect`, its deadline armed (a stall of a running process); `ehlo`, the
  test's own process, before its fake server writes the EHLO reply. Each cell runs one test alone (`--test-name-pattern`), on the clone
  `base` (`250991f9`) and on the clone `lot` (the base plus the final bytes of the two test files):

| stall | tests | `base` | `lot` |
|---|---|---|---|
| `start`, 16 s | the 8 tests of the table above | 8 red: 5 by an assertion (`r.killed` or elapsed), 3 by a `TypeError` (l.1037, l.1094, l.968) | 8 green |
| `connect`, 9 s | the same 8 | 8 red: 5 by an assertion, 3 by a `TypeError` | 8 green |
| `connect`, 2 s | `probe_smtp_implicit_tls_never_speaks_plaintext` | red, `'smtp_timeout'` where `'smtp_tls_failed'` is expected: the red of with-7 | green |
| `ehlo`, 16 s | `probe_smtp_single_wall_clock_deadline_covers_whole_exchange` | red, "the client got past connect and into the conversation (sent AUTH)" | green |

- **Killers by hand** on the clone `lot`: each applied alone (its `<before>` once on its line), the one test run alone, the file restored
  (sha256 `15da93f2...` checked after each): 9 of 9 red by an assertion. The three that hang the child (l.656, l.669, l.682) are red at
  `KILL_MS` by the named assertion of `runProbeAt` (60.6 s each); l.715 at the 60 s wait of (c) (60.6 s); l.735 and l.676 by `ran`, the
  child living to its 30 s deadline (30.5 s each); l.699 by `ran` at the 20 s deadline (20.4 s); l.671 by `'smtp_timeout'` at the 30 s
  deadline (30.5 s); l.688 at once (0.5 s). One more mutant, not a killer line: `smtpDeadlineMs` returning the default (l.634 CONST
  `"Math.min(n, MAX_SMTP_DEADLINE_MS)" -> "DEFAULT_SMTP_DEADLINE_MS"`), the env deadline ignored, which the kill of 8000 ms caught
  before: red by `ran` in the three tests that keep a short deadline (20.5 s, 20.6 s, 20.9 s). So moving the kill to 60 s loses none.
- **red-proof** `node scripts/red-proof.mjs --base 250991f9 --gel F:/Monark-probe-1 --test-only`: OK, 9 tests judged, each `pinned` (green at the base and here, its killer fired here reddens it by an
  assertion), 41 unchanged, 9 killers killed, by the same assertions as by hand (`ok: true`, digest `6a3cbf05...`).
- **Under the load of the suite**: three `test:main` runs of this tree, final bytes, one after the other, nothing else of this lot
  running (table below). The nine tests of the lot are green in all three; four of them, ms per run: `global_deadline` 1572, 1372,
  1290; `connect_deadline_bounds_handshake` 1655, 1828, 852; `no_residual_timer_handle` 780, **6283**, 789; `implicit_tls` 381, 252,
  **2853** (a test's duration holds its child's start and run). Then
  `node scripts/test-count-floor.mjs write` (the run of `test:main` 3): no change to the two records; `node scripts/test-count-check.mjs
  --base 250991f9`: exit 0.

| run | `test:main` | this file (50 tests) | other reds |
|---|---|---|---|
| base, instrumented (`measure`) | 3232 tests, 3182 pass, 3 fail, 47 skipped | **3 red** (above) | none |
| lot 1 (21:52-22:07 UTC) | 3232 tests, 3183 pass, 2 fail, 47 skipped | green | 2, outside this zone (below) |
| lot 2 (22:07-22:19 UTC) | 3232 tests, 3185 pass, 0 fail, 47 skipped | green | none |
| lot 3 (22:19-22:27 UTC) | 3232 tests, 3185 pass, 0 fail, 47 skipped | green | none |

Run 1's two reds are outside this zone, in two files the lot does not touch: `coinbase_probe_reads_a_body_as_a_stream_of_at_most_65536_bytes`
(`test/probe-coinbase-bounds.test.ts` l.300, 60 238 ms) and `coinbase_candles_runs_its_command_line_when_launched_through_a_link`
(`test/record-coinbase-candles.test.ts` l.728, 30 031 ms). Each runs, by `spawnSync` with a timeout of 30 s and an environment of
`SYSTEMROOT` alone (`test/probe-coinbase-bounds.test.ts` l.213, `test/record-coinbase-candles.test.ts` l.725-726), node children on copies
of scripts reached through a fresh junction of the temp root, which end at once (a usage stop, exit 2, or nothing, exit 0); each of the
three children gave `status` null with no output: cut by its 30 s timeout (a deduction from the null status and the durations, 60 238 =
2 x 30 s, not a measure of the children). Green in runs 2 and 3 and in the instrumented run. Item below.

## Killers of the lot (each fired by hand and by `red-proof --test-only`)

- `scripts/probe-narabi.mjs:656 CONST "deadlineAt - nowFn()" -> "2147483647"`
- `scripts/probe-narabi.mjs:715 SDL "EHLO monark-probe" -> ""`
- `scripts/probe-narabi.mjs:669 SDL "onDeadline = () => no(" -> ""`
- `scripts/probe-narabi.mjs:735 SDL "clearT(timer);" -> ""`
- `scripts/probe-narabi.mjs:699 CONST "total > maxBytes" -> "false"`
- `scripts/probe-narabi.mjs:688 CONST "lines.length - 1" -> "lines.length"`
- `scripts/probe-narabi.mjs:671 ROR "===" -> "!=="`
- `scripts/probe-narabi.mjs:682 SDL "onDeadline = () => { dead = true;" -> ""`
- `scripts/probe-narabi.mjs:676 CONST "clearT(timer); throw e;" -> "throw e;"`

## What remains, and its items

- **A stall of a running process past the bounds.** The lot takes the start of the process out of every bound. A stall of a process
  already running still reddens a test once it outlasts the bound minus the run: about 14.5 s for the six bounds on `ran`, 30 s for (a),
  60 s for (c) and for `KILL_MS`. Measured here: 6.8 s at most (one run, 41 calls). These bounds read the wall clock, which a stall
  lengthens; `RUN_BOUND_MS` cannot pass 20 s without letting the default-deadline mutant through. Item **PROBE-TEST-CLOCKLESS-BOUNDS-1**
  (construction, tests only, carrier MONARK): tell the mutants apart by what the child does, not by how long it takes. The preload,
  already in the child, would report on fd 3 the delay of each timer the probe arms (the deadline it read: 500 ms, not 20 s) and, right
  after the probe renames its `narabi.json` into place, the handles still active (`process.getActiveResourcesInfo()`: a timer left armed
  is the residual-timer mutant); the six `ran` assertions then become assertions on those reports, and only the reapers keep a time.
  Price: the preload module, the six assertions, their killers fired again. Trigger: a red of one of these tests by `ran` in an oracle or
  a `test:main`, or the next pass on `test/probe-narabi.test.ts`.
- **The two reds outside this zone** (run 1 above). Item **COINBASE-LINK-CHILD-LOAD-1** (measure, then tests only, carrier MONARK): time
  the children of the two tests under `test:main` (spawn to a line each writes once running, then to its exit, as `measure` did here),
  tell a stall at the start of a process from one tied to a script freshly copied under a junction, then give each child the
  construction of this lot (its bound from its line, a far reaper under the runner's 300 s). Price: two test files and a preload.
  Trigger: a red of one of them in an oracle, or the next pass on either file.
- **The source of the stalls** stays item **HOST-START-STALL-SOURCE-1** (the G0 of #303, l.163-166), with two data from this lot: a stall
  hits a process already running (6.8 s), and a `node -e 0` stalled up to 20 329 ms in this run (13 279 ms in #303).

## Size

Two test files, 64 lines added and 38 removed: 102 (`git diff --shortstat 250991f9` of `test/probe-narabi.test.ts`, 55 and 38, plus the 9
lines of the new `test/helpers/probe-start-line.mjs`; this note and the two count records are out of the count). R-25 bound: 1205
(`VIBEGATES_PR_LIMIT`, `.github/workflows/ci.yml` l.56).
