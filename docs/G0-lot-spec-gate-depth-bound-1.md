# SPEC-GATE-DEPTH-BOUND-1: the spec publication gate refuses a JSON text nested deeper than 256 levels by its code

RECHERCHES, 2026-10-14. Base `76dc31fd` (lot/etude-suite, read by `ls-remote` before the branch). Item formed by the other Claude's review
of the gate's hardening (PR #276, point "Depth" and its last observation; the earlier review of that change had noted the same throw as a
nit). Branch `recherches/spec-gate-depth-bound-1`. Zone: `coordination/ZONES.md`, row SPEC-GATE-DEPTH-BOUND-1.

Author: RECHERCHES. The build instance was launched as `claude-opus-5-5` at effort `high`; the host served it as `claude-fable-5-1` (its
runtime banner), so the model that wrote this change is `claude-fable-5-1` at effort `high`. Clock read at 21:04 UTC at the lock.

## The item

`contentProblems` (`scripts/spec-publish.mjs` l.133 at `76dc31fd`) walks the parsed value of a JSON text by recursion several times: the
`structuredClone` of `venueMasked` (l.343, reached from `venueMaskedText` on l.137 for every kind, and again on l.146), `tablesIn` (l.141),
`strings` (l.146) and `duplicateKey` (l.148). A text nested deep enough made one of them throw `RangeError`; `main()` caught it (l.278-281)
and printed `spec-publish REFUSED: Maximum call stack size exceeded`, exit 1, nothing written: fail-closed, but with no code, while the
header (l.13-14) says each problem is named by its code. The reviewer measured the throw at 1,276 levels for objects and 1,758 for arrays
on the review host, and asked for a declared bound with a named code, checked before `structuredClone`.

## Measures before the design (the trunk code, this host)

- `probe-depth.mjs` on the gate at `76dc31fd` (`logs/probe-trunk.out`, sha256 `c09d906c`): by bisection, the first depth at which
  `contentProblems` throws is 1,649 for nested objects (`{"a":` repeated) and 2,616 for nested arrays, kind `json`; 1,648 and 2,615 pass.
  At 256 and 257 levels the trunk gate returns `[]`. The review host gave 1,276 and 1,758: the overflow depends on the host's stack.
- `probe-walks.mjs` (`logs/probe-walks.out`, `1abf9ab7`): at those same depths, each walk called alone from the top level passes
  (`structuredClone`, `venueMasked`, `venueMaskedText`, `tablesIn`, `canonicalJson`; `tablesIn` alone throws at 2,616 for arrays), so which
  walk fires first depends on the stack the caller has already used, not on one function. `JSON.parse` itself parses 100,000 nested
  objects or arrays: it is iterative, so the depth can be measured on the parsed value without a throw.
- `measure-depth.mjs` (`logs/measure-depth.out`, `e7557cc2`), the reading logic of the hardening's `measure-gate.mjs`: of the 51 real
  entries of `scripts/spec-publish-inputs.json` at `76dc31fd`, 43 are JSON kinds; the deepest is 11 levels deep (one entry), 33 are 2
  levels deep; none is missing.

The bound: 256 levels. It is about five times under the smallest overflow measured on any host (1,276) and more than twenty times above
the deepest real entry (11), so no real file is near it from either side, and it stays valid on a host with a smaller stack than the
review host's. It is written once, as a named constant inside the function that applies it (`DEPTH_BOUND`, l.410 at `921be0a0`): the
file's last line runs `main()` before the end of the module (l.301), so a constant appended after the functions would not be initialised
yet when the gate runs from the command line.

## Decision applied (scripts/spec-publish.mjs at 921be0a0; no line inserted before the trunk's l.382, no line above the new function moves)

- l.136 in place, at the end of the NUL-byte line: `const deep = tooDeep(out, text); if (deep !== null) return [deep];`. The check runs
  once the text is known to be UTF-8 without NUL and before l.137, the first line that walks the parsed value (`venueMaskedText` parses
  any text that is JSON, whatever the kind). A too-deep text is refused with that one problem: the other passes are not run on it, since
  each would throw. Why l.136 and not l.137: l.137 is pinned by two killers of the trunk (`test/spec-publish.test.ts` l.409 and
  `test/spec-venue-fields.test.ts` l.91); a call written on l.137 kept both anchored but changed the pinned line's text, which the anchor
  check reported as two drifts. On l.136 every pinned line of the gate stays byte for byte (`tueurs 1963 ; ANCRE 1963 ; DERIVE 0 ; PERDU 0`).
- l.16 in place: `too_deep` added to the header's code list, between `not_text` and `crlf`, the order the checks run in.
- l.399-422, appended after the trunk's last line (l.398): `tooDeep(out, text)`, a function declaration, hoisted, kept last (the
  `duplicateKey` precedent). It parses the text itself (a text that is not JSON gives `null`; the gate already parses the text on l.137,
  l.139 and l.146, so this is one more parse of small files) and measures the depth with an explicit stack, each object or array counting
  one level, a scalar none, so the walk itself cannot overflow (`logs/probe-fixed.out`, `081c3e97`: 2,097,152 nested levels, the probe's
  own cap, are measured and refused without a throw). Past the bound it returns `{ code: "too_deep", detail: "<out>: nested <depth>
  levels deep, past the bound of 256 levels (SPEC-GATE-DEPTH-BOUND-1)" }`: the depth found and the bound are both named.
- Not exported: `scripts/spec-publish.d.mts` is untouched (`Problem.code` is a plain string there).

What stays as it was, on purpose: a text at 256 levels passes every pass as before; the recursive walks are unchanged (they are never
reached by a text deeper than 256); the command line still answers a refused file with `REFUSED`, the code under it, exit 1 and nothing
written at `--out`.

## Tests (test/spec-publish.test.ts l.461-507 at 921be0a0, red on the trunk code by assertion, green on the branch)

1. l.473 `a_json_text_nested_past_the_depth_bound_is_refused_as_too_deep_never_thrown`: a throw of `contentProblems` is caught and
   reported as a problem of its own, so the trunk code reddens by `ERR_ASSERTION`, never by `RangeError`. For objects and for arrays: a
   `json` text at 256 levels passes; at 257, the four kinds (`json`, `schema`, `policy-table`, `text`) give `["too_deep"]` with a detail
   naming `257 levels` and the `bound of 256`; at 100,000 levels, past the old overflow, `["too_deep"]` naming `100000 levels`. A shallow
   mixed nest passes, a schema at the bound passes, an object around an array nest at the bound is one level too deep. Killers l.469-472:
   l.136 (`return [deep];` to `return [];`), l.410 (the bound 257), l.418 (`d > depth` to `d < depth`, the depth never recorded), l.421
   (`depth > DEPTH_BOUND ?` to `depth >= DEPTH_BOUND ?`, the text at the bound refused).
2. l.498 `the_cli_refuses_a_too_deep_table_by_its_code_and_writes_nothing`: through the command line, the synthetic world of the file
   with its policy table replaced by one whose `rows` hold an array nested 256 deep (258 levels in all; under the old overflow, so the
   trunk reads it through and ends with another verdict): exit 1, `spec-publish REFUSED:` on stderr, the line
   `  too_deep  policy/btc-dir-1h.json: nested 258 levels deep` under it, `--out` absent. Killer l.497 (l.421, the code renamed).

Red run on the trunk code, the file alone, offline (0 refused): 24 ok, 2 not ok, each `ERR_ASSERTION` (`logs/red-trunk.tap`, sha256
`b4e4a540`). Green on the branch: 26/26 (`logs/green-file.tap`, `05dd5090`).

## Mutation campaign (scripts/mutants/run.mjs --killers, --lock-root, offline)

`--killers` takes every killer of the changed test file: 32 (K1-K27 the trunk's, K28-K32 the five new ones), each first run alone as its named test, after the count records were written (the baseline reads them). Baseline green (126 tests, 0 red), `tues 32 / 32, survivants -, non conclus -, anchor-lost -, exit 0` (`mutants/RESULTS.txt`, sha256 `575bb55c`; `RESULTS.json` `fa87d7eb`). K28 (l.136, the early return emptied), K29 (l.410, the bound 257), K30 (l.418) and K31 (l.421, `>=`) red by `a_json_text_nested_past_the_depth_bound_is_refused_as_too_deep_never_thrown` alone; K32 (l.421, the code renamed) red by `the_cli_refuses_a_too_deep_table_by_its_code_and_writes_nothing` alone: each killed by an assertion of its own test. The two killers of the trunk that pin l.137 (K24 here, and the one of `test/spec-venue-fields.test.ts`) still find their text once on an unchanged line.

## Proofs (all offline, 0 refused; the suite under the shared host lock)

- `npm run test:main` (hostlock-run, offline: 0 refused): 3074 tests, 3052 pass, 0 fail, 22 skipped, exit 0 (`logs/suite1.stdout`, sha256 `07aefa21`).
- `node scripts/test-count-floor.mjs write`: `test/test-counts.json` 24 -> 26 for `test/spec-publish.test.ts`, two names added to
  `test/test-names.json`. The count check, `node scripts/test-count-check.mjs --base 76dc31fd`, exit 0, its whole line:
  `test counts: 302 files, 3074 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base 76dc31fd340f, each name gone with its line in test/test-count-removals.json`
- Anchors, whole tree, `verifie-ancres.mjs --ref 76dc31fd`: `tueurs 1963 ; ANCRE 1963 ; DERIVE 0 ; PERDU 0` (`logs/anchors.out`, `245f5853`):
  no pinned line moved or changed (the test files that pin l.37-360 of the gate included).
- Gates (`logs/gates.out`, `34072f53`): `tsc --noEmit` 0; eslint on `test/spec-publish.test.ts` 0 (the `.mjs` is under the config's
  `**/*.mjs` ignore); `gate:vocab` 0 (356 files); `lang:gate` 0; `lint:ratchet` 69/69; `export:check` 0; `git diff --check` 0; winlint
  `--base 76dc31fd`: no Windows hazard; no non-ASCII character in an added line.
- Size, CI form (docs and the two count records are excluded by the CI pathspec): `scripts/spec-publish.mjs` 26+/2-,
  `test/spec-publish.test.ts` 47+/0-, 75 changed lines, under the bound.
- r1scan (`bin/r1scan.mjs --repo <worktree> --base 76dc31fd --head HEAD`) on the commits of the code and the records: `r1scan: 0 match(es)` (`logs/r1scan1.out`); run again on the branch's full head before the push (the report names its result).
- cites.mjs on this note before its commit: 4 references ok, 0 failed, on the draft (`logs/cites1.out`) and on the final text (`logs/cites2.out`).

## Measures (51 real entries, the hardening's reading logic, the new gate)

`measure-gate.mjs` of the hardening reads, at `76dc31fd`, every entry of `scripts/spec-publish-inputs.json` (governance at the trunk,
recherches by its pin, previous from the bare spec repository at the release's `previous_commit`) and runs `contentProblems` of the branch
on the bytes: 51 entries, 51 pinned, 0 leading BOM, 51 pass, 0 refused (text 8/8, json 3/3, schema 5/5, policy-table 35/35)
(`logs/measure-gate.out`, sha256 `0c6c4c7c`, byte-identical to the hardening's own measure). Their depths: `measure-depth.mjs` above.

## Not verified

- Windows: the suite is not replayed on win32 here (MONARK replays at merge). The overflow depths of the trunk gate on Windows are the
  reviewer's (1,276 and 1,758); the bound is far under both. The new test writes `policy/deep.json` and `inputs.json` under fresh
  directories of its own: no two names equal once case is folded.
- A real publication run with the bounded gate: no release is built by this change; the 51 entries are measured through `contentProblems`
  directly, as the hardening measured them.
- The exact walk that overflows first in `contentProblems` on a given host is not pinned (it depends on the stack already used, see
  `probe-walks.mjs`); the design does not depend on it, since every recursive walk is behind the bound.
- A text-kind file that is a JSON text nested deeper than 256 levels is refused as `too_deep` too (before, such a text threw at the same
  depths as the JSON kinds); no real text-kind entry is JSON.
- `retireProblems` (l.312) and `published()` of the writer keep their own `JSON.parse`; this change relies on the gate ahead of them and
  changes neither (zone).
