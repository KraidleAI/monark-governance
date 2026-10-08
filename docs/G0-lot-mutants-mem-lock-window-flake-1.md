# G0 — MUTANTS-MEM-LOCK-WINDOW-FLAKE-1: the memory wait under the lock counted on an injected clock, never in a 300 ms window of host time

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), 2026-10-08, from 05:32 UTC (`date -u`).
- **Demand**: MONARK `9e7f096` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-247-pousse-flake.md`, points 2
  and 3): a test that no longer depends on the host's clock, its polls counted by an injected clock or a bounded number of turns, never
  in a window of 300 ms, and the test keeps its killer. Plan: recherches `fe93f79`
  (`coordination/pieces/2026-10-08-G0-mutants-lock-window/G0-MUTANTS-MEM-LOCK-WINDOW-FLAKE-1.md`). Decisions: MONARK `ba9bda5`
  (`…-MONARK-vers-RECHERCHES-flake-decisions.md`): variant B, G32 on the same clock (Q-1); the 400 ms stall of real time kept (Q-2); a
  lot of its own with this short G0, a G2 by a fresh instance without a skeptic, then MONARK's Windows replay and G7 (Q-3);
  `scripts/mutants/` untouched, so MUTANTS-REPLAY-PROMOTE-1 keeps its trigger (Q-4).
- **Base**: trunk `lot/etude-suite` = `5e976a1a` (explicit refspec), branch `recherches/mutants-mem-lock-window-flake-1`. The plan read
  `43f46d9f`. The measures below were taken on `a2609c22`, the parent of `5e976a1a`, which changes `docs/methode/REGLES-MISSION.md`
  alone. `scripts/mutants/run.mjs` (blob `b321e4a9`, sha256 `13b2b11f…`), `scripts/oracle/lock.mjs` (`de154f32`),
  `test/mutants-run.test.ts` (`c3e9b0b2`) and `scripts/red-proof.mjs` (`9933788f`) are the same blobs at all three, so the plan's
  addresses hold. Lines below are at the base, except those marked "here".
- **Zone**: `test/mutants-run.test.ts` alone (G32 and D-4) and this G0. No production code: `scripts/mutants/` and `scripts/oracle/`
  are unchanged.

red-proof: test-only

## Finding

- MONARK's first G7 of #247 reddened `test:main`, 1 failure in 2 932, in
  `mutants_short_memory_under_the_lock_is_waited_out_without_it_to_the_bound` (D-4, l.553): its memory log read `-L` against
  `/^-L-+$/`. The first red of that test in 528 oracle records; green 3 of 3 alone.
- Mechanism: `gate()` (`scripts/mutants/run.mjs` l.227-235) takes `t0` (l.228), reads memory (not short), takes the lock (l.231),
  reads memory under it (short, l.232), releases it (l.233), then checks the bound (l.230) before each wait. With D the host time from
  l.228 to the first check after l.233, the log holds a `-` after `L` if and only if D < 300 ms. A host stall that eats the window
  stops the tool at its first check, without a read, and that is the rule: the bound counts from the entry into the wait, the lock
  included (header l.21-24). The tool is right; the test counted reads in a window of host time.
- G32 (`mutants_a_memory_stop_at_the_baseline_is_not_waited_again_by_the_typecheck_baseline`, l.538) runs the same 300 ms window and
  bounds it above on the host's clock, `waited_ms < 600` (l.541): the plan measured 474 ms under a CPU quota.

## Reproduction (at base)

- **Injected stall**, in a throwaway worktree at `a2609c22`: the plan's line in D-4's stub blocks the read under the lock for
  `FX_DELAY` ms. With 400 ms, D-4 is red 3 of 3 by assertion, log `-L`; without it, green 2 of 2. The plan: green at 295 ms, red from
  298 ms.
- **CPU starvation**: the two tests alone (`--test-name-pattern`), 30 times, in a cpu cgroup (v1) of their own with a CFS quota of 25 ms
  per 500 ms period, 5 % of one core (1 089 of 1 113 periods throttled): D-4 red **4 of 30** (runs 8, 13, 19 and 21), each `-L` with
  its first assertion green, MONARK's red to the letter; G32 green 30 of 30. The plan measured 3 of 30.

## Construction (variant B)

1. `CLOCK` (here l.537-539), a preload that the tool's process loads by `--import`: `Date.now` returns a time the preload holds, and
   `globalThis.setTimeout` advances that time by its delay and fires at the next turn of the loop (`setImmediate`); past 64 waits it
   ends the tool, `process.exit(99)`. These are the only two clocks of the wait: `Date.now()` at `run.mjs` l.228-232 and `lock.mjs`
   l.21, l.38 and l.41, the global `setTimeout` at `run.mjs` l.206 and `lock.mjs` l.42; neither file names `performance`, `hrtime`,
   `setInterval`, `setImmediate` or `node:timers`. Six waits of 50 ms take the tool from `t0` to `t0 + 300`, whatever the host's load.
2. G32 (here l.541) runs the tool under `--import` of a file that holds `CLOCK` alone (memory is short by `--min-free-mb 999999999`;
   nothing else is replaced) and reads `waited_ms` **300** in place of `< 600`.
3. D-4 (here l.557) takes `CLOCK` into its stub. At the read under the lock, the second, the stub blocks the tool 400 ms of real time
   (`Atomics.wait`), more than the whole wait: the stall that reddens the base form at every run. A lost injection (the tool reading
   `performance.now()`, or waiting through another API) would redden D-4 at every run, never once in 528. Its assertions become exact:
   `waited_ms` **300**, and the log equals `-L------` (one read before the lock, one under it, six waits without it) in place of
   `/^-L-+$/`.
4. Unchanged: the two test names (`--test-only` refuses a removed test), the killer lines and their targets, the 49 other tests. The
   host-time bounds left in the file are lower bounds that load only lengthens (l.205, l.387, l.549), and G27 keeps its 3 000 ms margin.
5. Not chosen (plan §4.8): a wider window; admitting `-L`; turns counted by the stub alone; a clock seam in the tool, which would touch
   `scripts/mutants/` and bring MUTANTS-REPLAY-PROMOTE-1 in.

## Killers (listed for `--test-only`)

- G32 (here l.540): `scripts/mutants/run.mjs:243 CONST " || stop !== null ?" -> " ?"`.
- D-4 (here l.556): `scripts/mutants/run.mjs:232 CONST "short = memShort(); if (!short)" -> "short = false; if (!short)"`.

## Mutants of the wait

Run by the tool itself (`scripts/mutants/run.mjs --table`, one row per mutant, each first on its test alone; record sha256
`259bb693…`): all killed by assertion (`ERR_ASSERTION`), the value read in each TAP.

| Mutant of `run.mjs` | D-4 | G32 |
|---|---|---|
| l.230 ROR `>= o.wait` -> `> o.wait` (one wait too many) | 350 for 300 | 350 for 300 |
| l.230 `await sleep(o.poll)` -> `await sleep(1)` (the step ignored) | exit 99 | exit 99 |
| l.230 `>= o.wait` -> `>= 2 * o.wait` (the bound doubled) | 600 for 300 | 600 for 300 |
| l.233 `finally { lk?.release();` -> `finally {` (the lock kept) | the lock still held | not run: G32 takes no lock |
| l.230 `if (Date.now() - t0 >= o.wait) return` -> `if (false) return` (no end) | exit 99 | exit 99 |

At base the first one survives the whole file (plan §7, measured at `43f46d9f`, the same blobs): no test saw the equality of the bound.

## Verification

- `test/mutants-run.test.ts` under the flags of `test:main`, Node 24.21.0: 51 of 51, 42 s.
- Under the quota above, the two tests alone: **30 of 30** green (1 062 of 1 100 periods throttled).
- `node scripts/red-proof.mjs --base 5e976a1a --gel <head> --test-only`: G32 and D-4 judged and pinned, the 49 other tests unchanged;
  each killer, fired at the head, reddens its test by an assertion; no production file, no test removed.
- `node scripts/mutants/run.mjs --killers` on the file: 51 of 51 killed by assertion, all strict, none replayed (record `31842cdb…`).
- `tsc --noEmit`, `eslint test/mutants-run.test.ts`, `lint:ratchet` (69/69), `gate:vocab`, `lang:gate`, `export:check`, winlint;
  `verifie-ancres.mjs --files test/mutants-run.test.ts --ref 5e976a1a`: 51 ANCRE; `every_killer_line_is_readable`; the full main
  suite before the PR.

## Size

R-25 in CI form: 17 changed lines of `test/` (11 insertions, 6 deletions), one file; this G0 (`docs/**/*.md`) does not count. Bound
547. The plan's prototype, not kept, measured 19.
