# RETIRE-PROBE-ARGS-PROTO-1: the retire probe refuses an inherited name of Object.prototype as an option

RECHERCHES, 2026-10-14. Base `91931d5f` (lot/etude-suite, read by `ls-remote` before the branch). Item formed by the other Claude's
review of `scripts/retire-probe.mjs` l.121-128 on 2026-10-07, carried since as RETIRE-PROBE-ARGS-PROTO-1. Branch
`recherches/retire-probe-args-proto-1`. Zone: `coordination/ZONES.md`, row RETIRE-PROBE-ARGS-PROTO-1.

Author: RECHERCHES. The build instance was launched as `claude-opus-5-5` at effort `high`; the host served it as `claude-fable-5-1` (its
runtime banner), so the model that wrote this change is `claude-fable-5-1` at effort `high`. Clock read at 22:04 UTC at the lock.

## The item

`parseArgs` (`scripts/retire-probe.mjs` l.122-134 at `91931d5f`) reads its option table by a plain property access on l.125,
`const k = OPTIONS[argv[i]], v = argv[i + 1];`, where `OPTIONS` (l.121) is an object literal, so it inherits from `Object.prototype`. An
argument that is an inherited name of that prototype (`constructor`, `__proto__`, `toString`, `hasOwnProperty`, `valueOf`...) yields a
function or an object instead of `undefined`: the refusal on l.126 (`unknown, repeated or empty option`) does not fire, and the value is
stored under the stringified key (`a[k] = v`, l.127: `function Object() { [native code] }`, `[object Object]`...). The required options
being present, `parseArgs` returns, and `main` (l.136) goes on to read the table instead of exiting 2 on usage (l.138).

## Measures before the design (the trunk code, this host, offline)

- `probe-trunk.mjs` on the probe at `91931d5f` (`logs/probe-trunk.out`, sha256 `6be3c338`): each of the five names, given as a flag
  with a value before or after the three required options, is taken; the returned record carries the stringified key beside `api`,
  `table` and `cell`. `main(["constructor", "x", "--api", ..., "--table", "x.json", "--cell", ...])` returns 1 with
  `retire-probe REFUSED: table_invalid: ENOENT`, not 2.
- The symmetric side needs no change: `Object.hasOwn(a, k)` on l.126 reads `a`, an own-property test on an empty literal; a value
  equal to an inherited name is a string stored as a value, never used as a key.

## Decision applied (scripts/retire-probe.mjs at 07a31ad9; one line changed in place, no line inserted, 156 lines before and after)

- l.125 in place: `const k = Object.hasOwn(OPTIONS, argv[i]) ? OPTIONS[argv[i]] : undefined, v = argv[i + 1];`. A name that is not an
  own key of the table is `undefined`, so the existing error on l.126 refuses it as unknown; nothing else of the function changes.
- Why this form and not a null-prototype table on l.121: both work; the own-property test keeps the table a literal that the file's
  header reads as a list, and the change sits on the line the review named. The file's last line (l.156) runs `main()` at import of the
  command line, so no line is added before it: the 14 lines of this file that killer lines pin (39, 45, 64, 65, 76, 78, 84, 96, 100,
  102, 111, 118, 132, 146) are byte for byte the trunk's.
- Not exported: `scripts/retire-probe.d.mts` is untouched; the exports and their signatures are unchanged.

## Tests (test/retire-probe.test.ts l.242-256 at 07a31ad9, red on the trunk code by ERR_ASSERTION, green on the branch)

1. l.246 `retire_probe_refuses_an_inherited_name_of_object_prototype_as_an_option`: for each of `constructor`, `__proto__`, `toString`,
   `hasOwnProperty` and `valueOf`, given as a flag with a value before the three required options and after them, `parseArgs` throws
   `unknown, repeated or empty option <name>` (ten cases); the required options alone give the keys `api`, `table`, `cell` and no
   other; `--out constructor` stores the string as a value; the command line run as a child (`node scripts/retire-probe.mjs constructor x
   --api ...`) exits 2 with the usage line on stderr, `(unknown, repeated or empty option constructor)` at its end, nothing on stdout.
   Killer l.245 (l.125, the own-property test removed: the plain access of the trunk).
2. The import of `spawnSync` is added on l.9; every other line of the file is the trunk's, moved down by one.

Red run on the trunk code, the file alone, offline (0 refused): 13 ok, 1 not ok, `ERR_ASSERTION` (`Missing expected exception:
constructor before the required options is an unknown option`; `logs/red-trunk.tap`, sha256 `a5c22ff3`). Green on the branch: 14/14
(`logs/green-file.tap`, `89fa6bc7`). The probe replayed on the branch (`logs/probe-fixed.out`, `521f04f4`): the ten cases throw,
`main` returns 2 with the usage line.

## Mutation campaign (scripts/mutants/run.mjs --killers, --lock-root, offline)

`--killers` takes every killer of the changed test file: 14 (K1-K13 the trunk's, K14 the new one on l.125), each first run alone as its
named test, on a clone of the branch at `f1998fe4` under the shared host lock. Baseline green (32 tests of the two target files, 0 red;
the count records written first, so the baseline matches them), then `tues 14 / 14, survivants -, non conclus -, anchor-lost -, exit 0`
(`mutants/RESULTS.txt`, sha256 `1b1a4ca6`; `RESULTS.json` `4391be3e`; `logs/mutants.stdout` `888aeae4`). K14 (l.125, the own-property
test replaced by the trunk's plain access) is red by `retire_probe_refuses_an_inherited_name_of_object_prototype_as_an_option` alone,
by an assertion of its own; the 13 killers of the trunk stay killed by their own tests, which proves their pinned lines did not move.

## Proofs (all offline, 0 refused; the suite under the shared host lock)

- `npm run test:main` (hostlock-run, offline: 0 refused): 3097 tests, 3075 pass, 0 fail, 22 skipped, exit 0; the new test passes in the suite (79 ms) (`logs/suite1.stdout`, sha256 `2309fbc5`).
- `node scripts/test-count-floor.mjs write`: `test/test-counts.json` 13 -> 14 for `test/retire-probe.test.ts`, one name added to
  `test/test-names.json`. The count check, `node scripts/test-count-check.mjs --base 91931d5f`, exit 0, its whole line:
  `test counts: 305 files, 3097 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base 91931d5f9c55, each name gone with its line in test/test-count-removals.json`
- Anchors, whole tree, `verifie-ancres.mjs --ref 91931d5f`: `tueurs 1992 ; ANCRE 1992 ; DERIVE 0 ; PERDU 0` (`logs/anchors.out`,
  `691cc8a6`): no pinned line moved (the 15 killers of this file in the two test files that pin it included).
- Gates (`logs/gates.out`, `a3a22a1f`): `tsc --noEmit` 0; eslint on `test/retire-probe.test.ts` 0 (the `.mjs` is under the config's
  `**/*.mjs` ignore); `gate:vocab` 0; `lang:gate` 0; `lint:ratchet` 69/69; `export:check` 0; `git diff --check` 0; no non-ASCII
  character in an added line; winlint `--base 91931d5f`: 2 file(s), no Windows hazard (`logs/winlint1.out`, `f8265674`).
- Size, CI form (docs and the two count records are excluded by the CI pathspec): `scripts/retire-probe.mjs` 1+/1-,
  `test/retire-probe.test.ts` 17+/0-, 18 changed lines.
- r1scan (`bin/r1scan.mjs --repo <worktree> --base 91931d5f --head HEAD`) on the code commit: `r1scan: 0 match(es)`
  (`logs/r1scan1.out`, `bea62e56`); run again on the branch's full head before the push (the report names its result).
- cites.mjs on this note before its commit (`logs/cites1.out`): 3 references ok, 0 failed, on the first pass; the second pass on the final text (`logs/cites2.out`) is named in the report.

## Not verified

- Windows: the suite is not replayed on win32 here (MONARK replays at merge). The new test writes no file: it spawns the probe once
  with a table path that does not exist, and the usage error exits before the table is read.
- The usage line is checked by its start and its end on stderr of the child, not by its full text; the full text stays the one of
  l.138 at `91931d5f`, unchanged by this lot.
- Other argument parsers of `scripts/` that read an option table by a plain property access are not surveyed here: the zone is this
  file alone.
