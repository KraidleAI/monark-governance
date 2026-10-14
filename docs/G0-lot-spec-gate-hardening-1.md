# G0 of SPEC-GATE-HARDENING-1: the spec publication gate keeps a leading BOM and refuses a duplicate JSON key

RECHERCHES, 2026-10-14. Base `fd20e9fa` (lot/etude-suite, read by `ls-remote` before the branch). Items formed by MONARK `e7234bd`
(2026-10-07) in `docs/G0-lot-vocab-venue-fields-1.md` l.66-75 at the trunk. Branch `recherches/spec-gate-hardening-1`. Zone:
`coordination/ZONES.md` row SPEC-GATE-HARDENING-1 (recherches `214cf41`).

Author: RECHERCHES, worker `claude-opus-5-5`, effort `high` (as launched; the host's own runtime banner names `claude-fable-5-1`), clock
read at 19:12 UTC at the lock. Scout (same day, piece `spec-gate-scout/`): `measure.out` sha256 `41daacac`, `probe/probe.out` `1da5093e`.

## The two items (docs/G0-lot-vocab-venue-fields-1.md l.71-75 at fd20e9fa)

- VOCAB-JSON-DUPKEY-1: refuse any duplicate key in the JSON texts of the kinds `json` and `schema`; the kind `policy-table` already is,
  by `not_canonical` (`canonicalJson` writes each key once, so a text with a key twice is never its own canonical writing).
- SPEC-BOM-CANONICAL-1: `scripts/spec-publish.mjs` l.135, `{ fatal: true }` -> `{ fatal: true, ignoreBOM: true }`, so the BOM stays in
  the text and is refused: `[cf]` by the vocabulary pass (a format character), `json_invalid` for the JSON kinds. Before, a table preceded
  by EF BB BF passed the canonical check (the decoder had dropped the BOM) and was published under a sha256 that is not its canonical
  writing's.

Trigger: before the first real publication through `spec-publish` (release L or c). The T0 publication `contract-1.1.0` of 2026-10-06 went
through the unhardened gate; L and c are not published yet, so the trigger is not missed.

## The side finding (scout)

`retireProblems` (`scripts/spec-publish.mjs` l.312, `text(f)` is `f.bytes.toString("utf8")`) and `published()` of
`scripts/spec-policy-tables.mjs` (l.200, `readFileSync(join(root, p), "utf8")`) read the bytes with the BOM kept, so their own
`JSON.parse` threw on a BOM-prefixed table and the `catch` answered "no retired row": such a table was neither refused as not canonical
(the gate had dropped the BOM) nor seen by the retire rule F-1. It would have been published, with no retire list. Once l.135 keeps the
BOM, `contentProblems` refuses the file first (`json_invalid`, `vocabulary`) and `plan` never reaches a publishable state. Neither l.312
nor the writer's l.200 is changed (out of the zone; with the gate ahead of them, their reading is no longer reached by such a file).

## Decision applied (scripts/spec-publish.mjs; no line above the new function moves)

- l.135 in place: `{ fatal: true, ignoreBOM: true }`, with a trailing comment naming the item.
- l.148 in place (the `schema_invalid` line, after `JSON.parse` succeeded at l.146): for a kind other than `policy-table`,
  `duplicateKey(text)`; a hit pushes `duplicate_key` with the key (JSON-quoted) and the path of its object (`/` at the root).
- l.16 in place: `duplicate_key` added to the header's code list, between `json_invalid` and `schema_invalid`.
- l.364-398, appended after the last line of the trunk file (l.362): `duplicateKey(text)`, a function declaration, hoisted, kept last
  (the `retireProblems` precedent). A scanner over the text that `JSON.parse` has just accepted (every string is well formed, every value
  is delimited): per object, the keys compared once unescaped (`JSON.parse` of the key's own writing, l.373), at every depth, arrays
  walked; a string value is skipped whole; a number, `true`, `false` or `null` runs to its delimiter. Not exported: `scripts/spec-publish.d.mts`
  is untouched, the existing exports are unchanged.

What stays as it was, on purpose: a `policy-table` text with a duplicate key is refused by `not_canonical` alone (the item's scope; test
l.440 pins it); `retireProblems` and the writer keep their decoding.

## Tests (test/spec-publish.test.ts l.403-457, red on the trunk code by ERR_ASSERTION, green on the branch)

1. l.407 `a_leading_bom_is_refused_on_every_kind`: EF BB BF ahead of a text, a json, a schema and a policy table; `text` gives
   `["vocabulary"]`, the three JSON kinds `["json_invalid", "vocabulary"]`, each with a `[cf]` detail; the same table bytes without the
   BOM pass (premise). Killer l.406 (l.135, the `ignoreBOM` option removed).
2. l.426 `a_duplicate_key_in_a_json_or_schema_text_is_refused_once_unescaped`: `{"a":1,"a":2}`, `{"a":1,"a":2}` (an escaped key,
   then its plain twin), a duplicate at depth inside an array of objects, a schema with `type` twice and one with `minimum` twice under
   `properties/n`: `["duplicate_key"]`, the key named in the detail. Clean: one key in two objects, at two depths, a string value that
   looks like an object, an escaped key that differs, a spaced and indented text. A policy table with `class` twice: `["not_canonical"]`.
   Killers l.424 (l.382, `seen.has(k)` -> `false`) and l.425 (l.373, the key compared raw, not unescaped).
3. l.448 `a_bom_prefixed_table_with_a_retired_row_is_refused_before_the_retire_rule`: through `plan`, a top-level `policy/btc-dir-1h.json`
   holding one retired row; plain, `["retire_list_missing"]` (premise, M-1 of R-b); BOM-prefixed, `["json_invalid", "vocabulary"]`, the
   file refused before the retire rule, never published. Killer l.447 (l.135, `ignoreBOM: false`).

Red run on the trunk code, the file alone, offline (0 refused): 21 ok, 3 not ok, each `ERR_ASSERTION` (`logs/red-trunk.tap`, sha256
`f92c90e5`). Green on the branch: 24/24 (`logs/green-file.tap`, `c6a88f60`).

## Mutation campaign (scripts/mutants/run.mjs --killers, --lock-root, offline)

`--killers` takes every killer of the changed test file: 26 (K1-K22 the trunk's, K23-K26 the four new ones), each first run alone as its
named test. A first campaign before the records were written was "non conclu (base)" on every row, by MUTANTS-BASELINE-UNREPORTED-1
(`test/test-counts.json` said 21, the run 24; `mutants/RESULTS.txt`, sha256 `4256c750`): the records were written from the full suite, then
the campaign replayed. Replay: baseline vert (124 tests, 0 red), `tues 26 / 26, survivants -, non conclus -, anchor-lost -, exit 0`
(`mutants2/RESULTS.txt`, `7b8b0a0f`; `RESULTS.json` `714f150a`). K23 (l.135, option removed) red by `a_leading_bom_is_refused_on_every_kind`
alone; K24 (l.382) and K25 (l.373) red by `a_duplicate_key_in_a_json_or_schema_text_is_refused_once_unescaped` alone; K26 (l.135,
`ignoreBOM: false`) red by `a_bom_prefixed_table_with_a_retired_row_is_refused_before_the_retire_rule` alone: each killed by an assertion
of its own test.

## Proofs (all offline, 0 refused; the suite under the shared host lock)

- `npm run test:main` (hostlock-run, offline: 0 refused): 3066 tests, 3044 pass, 0 fail, 22 skipped, exit 0 (`logs/suite1.stdout`).
- `node scripts/test-count-floor.mjs write`: `test/test-counts.json` 21 -> 24 for `test/spec-publish.test.ts`, three names added to
  `test/test-names.json`. The count check, `node scripts/test-count-check.mjs --base origin/lot/etude-suite`, exit 0, its whole line:
  `test counts: 301 files, 3066 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base fd20e9fa4bbc, each name gone with its line in test/test-count-removals.json`
- Anchors, whole tree, `verifie-ancres.mjs --ref fd20e9fa`: `tueurs 1917 ; ANCRE 1917 ; DERIVE 0 ; PERDU 0` (`logs/anchors.out`, `03ef35d9`):
  no pinned line moved (the seven test files that pin l.37-360 of the gate included).
- Gates (`logs/gates.out`, `07a7ef9f`): `tsc --noEmit` 0; eslint on `test/spec-publish.test.ts` 0 (the `.mjs` is under the config's
  `**/*.mjs` ignore, l.39 of `eslint.config.mjs`); `gate:vocab` 0; `lang:gate` 0; `lint:ratchet` 69/69; `export:check` 0;
  `git diff --check` 0; winlint `--base fd20e9fa`: 0 file(s), no Windows hazard.
- Size, CI form (R-25; docs and the two count records are excluded by the CI pathspec): `scripts/spec-publish.mjs` 39+/3-,
  `test/spec-publish.test.ts` 56+/0-, 98 changed lines, under 1,205.
- r1scan (`bin/r1scan.mjs --repo <worktree> --base fd20e9fa --head HEAD`) on the code commit `f77f4a89`: `r1scan: 0 match(es)`; run
  again on the branch's full head before the push (the report names its result).
- cites.mjs on this note before its commit (`logs/cites.out`): one FAIL on a first pass (a method name read as a file name at l.108),
  reworded; the second pass is clean (the report names its line).

## Measures (51 real entries, the scout's reading logic, the new gate)

`measure-gate.mjs` reads, at `fd20e9fa`, every entry of `scripts/spec-publish-inputs.json` (governance at the trunk, recherches by its
pin, previous from the bare spec repository at the release's `previous_commit`) and runs `contentProblems` of the branch on the bytes:
51 entries, 51 pinned, 0 leading BOM, 51 pass, 0 refused (text 8/8, json 3/3, schema 5/5, policy-table 35/35) (`logs/measure-gate.out`,
sha256 `0c6c4c7c`). The scout's own measure at the same head: 0 BOM of 51, 0 duplicate key of 43 JSON entries, 0 parse error
(`measure.out`, `41daacac`). Design probe of the codes on synthetic bytes before the tests were written (`logs/probe-design.out`,
`3909e909`): the scanner on 16 synthetic texts, all as expected.

## Not verified

- Windows: the suite is not replayed on win32 here (MONARK replays at merge). The new test writes `plain.json` and `bom.json` under its
  own fresh directory: no two names equal once case is folded.
- A real publication run with the hardened gate (release L or c): no release is built by this lot; the 51 entries are measured through
  `contentProblems` directly, with `carried = true` for every `previous` entry (the plan's own `carried` is the byte equality with the
  committed object; every previous entry here is carried byte for byte, so the flag is the same).
- `retireProblems` l.312 and `published()` of the writer still decode with the BOM kept; this lot relies on the gate ahead of them and
  changes neither (zone).
- The `duplicate_key` scanner trusts the parse of `scripts/spec-publish.mjs` l.146 to have accepted the text first; it is never called on
  a text that failed it.
