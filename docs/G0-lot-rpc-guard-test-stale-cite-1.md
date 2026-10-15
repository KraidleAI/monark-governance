# RPC-GUARD-TEST-STALE-CITE-1: the scanner test's header cites the lines that hold a bare key name, and a test holds the citation

RECHERCHES, 2026-10-15. Base `d65f31d1` (lot/etude-suite, read by `ls-remote` before the branch). Item formed by the cross review of #259 on
2026-10-08, carried since as RPC-GUARD-TEST-STALE-CITE-1. Branch `recherches/rpc-guard-test-stale-cite-1`. Zone: `coordination/ZONES.md`,
row RPC-GUARD-TEST-STALE-CITE-1.

Author: RECHERCHES. The build instance was launched as `claude-opus-5-5` at effort `high`; the host served it as `claude-fable-5-1` (its
runtime banner), so the model that wrote this change is `claude-fable-5-1` at effort `high`. Clock read at 00:21 UTC at the lock.

## The item

The header comment of `test/rpc-guard-fetch-only-inside-client.test.ts` explains why the bare paid-key name is not refused on the
packages and Bell scopes: it appears in comments there, and the sentence on l.18-19 at `d65f31d1` cites where, in a parenthesis
after `appears in comments:`, lines 5 to 8 of `apps/bell/src/rpc.ts`, l.43 of `apps/bell/src/universe.ts`, and an ellipsis. Those citations are stale. At `d65f31d1` the six names of `KEY_NAMES` (l.42)
appear in `apps/bell/src` on 12 lines of 7 files (comments, the string literals of `apps/bell/src/tick.ts` l.192, and the two allowlisted
key reads of `apps/bell/src/close.ts` l.53; the list is in the measures below), and in the two files the trunk's sentence named on exactly
one line each: `apps/bell/src/rpc.ts` l.8 (a comment: ``// env-driven `BELL_SOLANA_RPC`/`PUBLIC_SOLANA=mainnet-beta` list and the default `fetchCall` are REMOVED from this``)
and `apps/bell/src/universe.ts` l.322 (the end of a doc comment: `never mainnet-beta / publicnode / BELL_SOLANA_RPC. */`). Lines 5 to 7
of `rpc.ts` hold none; l.43 of `universe.ts` is `export const SOLANA_FOUNDATION_LABEL = "solana-foundation";` with a comment that names
no key. Nothing checked the sentence, so the sources moved under it and the comment went on citing lines that no longer say what it
says they say.

## Measures before the design (the trunk at d65f31d1, read with `git show`)

- A grep of the alternation of `KEY_NAMES` over `apps/bell/src/rpc.ts` gives one line, 8; over `apps/bell/src/universe.ts` one line, 322.
- The same grep over the whole of `apps/bell/src` (measured after the first review at `590c88ec`, where `apps/bell/src` is byte for byte
  the base's: the trunk moved by #284, which changed `test/bell-handoff-perms.test.ts` only) gives 12 lines in 7 files:
  `apps/bell/src/close.ts` l.45, l.46 and l.53; `apps/bell/src/collect.ts` l.540 and l.696; `apps/bell/src/residuals.ts` l.42;
  `apps/bell/src/rpc.ts` l.8; `apps/bell/src/tick.ts` l.192; `apps/bell/src/universe-cli.ts` l.176, l.177 and l.303;
  `apps/bell/src/universe.ts` l.322 (`logs2/bare-names.out`). All but three are comments: l.192 of `tick.ts` holds four names as string
  literals of code, l.303 of `universe-cli.ts` holds one name in a string literal, neither of which a KEY regex of the scanner matches,
  and l.53 of `close.ts` holds two key reads the allowlist admits.
- The one allowlisted packages file, `packages/rpc-guard/src/transport.ts`, holds 13 lines with a bare name (comments and the key
  reads of the sole transport); the scanner skips it by its allowlist, so the sentence is about the Bell lines only.

## Decision applied (test/rpc-guard-fetch-only-inside-client.test.ts at 847d6900)

- l.19 in place: the parenthesis after `appears in comments:` now holds two items, `apps/bell/src/rpc.ts` l.8 and `apps/bell/src/universe.ts`
  l.322, written as the test resolves them (the file name, a colon, the line). The rest of the sentence is the trunk's; the range and the
  ellipsis are gone, so the sentence has one shape: a parenthesis of `<path>:<line>` items separated by commas.
- After the first review (`530f4623`), l.19 also says `and elsewhere` after the closing parenthesis: the two cited lines are where the
  sentence points, not the full list of the lines that hold a name (12 in `apps/bell/src`, 13 in the allowlisted transport). The needle
  and the parenthesis the test reads are untouched.
- No code of the scanner changes: the regexes, the roots, the allowlists and the seven existing tests are byte for byte the trunk's.
  The killer lines of this file that pin other files (l.156, l.192) do not move: the new block is appended after the last test.

## Tests (test/rpc-guard-fetch-only-inside-client.test.ts l.253-279 at 847d6900; red on the trunk's comment by ERR_ASSERTION, green on the branch)

1. l.261 `rpc_guard_scanner_comment_cites_lines_that_hold_a_bare_key_name`: reads this test file's own text, finds exactly one citing
   sentence (the needle is built in two halves so that the test's own line is not a match), splits its parenthesis on commas, requires at
   least two items, and for each item requires the shape `<path>:<line>` (a path with no slash is read under `apps/bell/src`, one with a
   slash as written), an existing file, an existing line, and a bare name of `KEY_NAMES` on that line (`KEY_BARE`, built from it). Every
   problem is collected and the assertion lists them all.
2. Two killers (l.259-260) take the bare name off a cited production line: `apps/bell/src/rpc.ts:8` and `apps/bell/src/universe.ts:322`,
   `BELL_SOLANA_RPC` replaced by prose. A killer on the test's own comment line is refused by the killer convention (a killer mutates
   production code), so the mutation is on the sources the sentence cites.
3. Scope rule, after the first review (`530f4623`, l.273-275 inside the test body; no pinned line moves): a cited path must sit under
   `apps/bell/src/` or `packages/<name>/src/`, the two scopes the sentence is about, with no `..` segment; else the item is listed as
   `outside the packages and Bell scopes the sentence is about`. Before it, a citation of this test file's own l.42, of a path with
   three `..` segments out of `apps/bell/src`, or of a line of this note under `docs/` passed, each holding a bare name (the review's
   probes P1, P3, P9). What the test still passes: a cited line that holds a bare name in code rather than in a comment (the string
   literals of `apps/bell/src/tick.ts` l.192, the allowlisted key reads of `apps/bell/src/close.ts` l.53); telling a comment from code
   needs a parser, the two cited lines are comments today, and the sentence's argument holds for any occurrence.

Red run on the trunk's comment (commit 0c86b150: the test added, the comment untouched), the file alone, offline (0 refused): 7 ok, 1 not ok,
`ERR_ASSERTION` listing three problems: the range item of the Bell `rpc.ts` (lines 5 to 8) is `not a <path>:<line> citation`, the item for
l.43 of `apps/bell/src/universe.ts` `holds no bare name of KEY_NAMES`, and the ellipsis is `not a <path>:<line> citation` (`logs/red-trunk.tap`,
sha256 `e8d682ed`). Green on the branch: 8/8
(`logs/green-file.tap`, `94fd1dea`).

## Mutation campaign (scripts/mutants/run.mjs --killers, --lock-root, offline)

`--killers` takes every killer of the changed test file: 4 (K1 and K2 the trunk's, on `apps/sentinel/src/rpc.ts` l.17 and
`scripts/census/u4-redraw.mjs` l.23; K3 and K4 the new ones, on `apps/bell/src/rpc.ts` l.8 and `apps/bell/src/universe.ts` l.322), each
first run alone as its named test, on a clone of the branch at `588f9a3f` under the shared host lock. Baseline green (918 tests of the
target files, 0 red; the count records written first, so the baseline matches them), then `tues 4 / 4, survivants -, non conclus -,
anchor-lost -, exit 0` (`mutants/RESULTS.txt`, sha256 `89e991ae`; `RESULTS.json` `d87cfc4e`; `logs/mutants.stdout` `cba22be5`). K3 and
K4 are each red by `rpc_guard_scanner_comment_cites_lines_that_hold_a_bare_key_name` alone, by its own assertion (the cited line no
longer holds a bare name); K1 and K2 stay killed by their own tests, which proves their pinned lines did not move.

## Proofs (all offline, 0 refused; the suite under the shared host lock)

- `npm run test:main` (hostlock-run, offline: 0 refused): 306 files, 3128 tests, 3105 pass, 1 fail, 22 skipped, exit 1
  (`logs/suite1.stdout`, sha256 `ed032f6e`). The one red is `bell_handoff_permissions_on_linux` of `test/bell-handoff-perms.test.ts`,
  which needs the users `bell-collect`, `bell` and `bell-outsider` on the host (`id: 'bell-collect': no such user`); it is not of this
  change and is fixed by #284. The new test passes in the suite.
- `node scripts/test-count-floor.mjs write`: `test/test-counts.json` 7 -> 8 for `test/rpc-guard-fetch-only-inside-client.test.ts`, one name
  added to `test/test-names.json` (`logs/count-write.out`, `668418fa`). The count check, `node scripts/test-count-check.mjs --base d65f31d1`,
  exit 0, its whole line (`logs/count-check.out`, `c21f8c36`):
  `test counts: 306 files, 3128 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base d65f31d1b48b, each name gone with its line in test/test-count-removals.json`
- Anchors, whole tree, `verifie-ancres.mjs --ref d65f31d1`: `tueurs 2090 ; ANCRE 2090 ; DERIVE 0 ; PERDU 0` (`logs/anchors1.out`,
  `84264b7a`): no pinned line moved.
- `test/killer-lines.test.ts` alone, offline: 1/1 (`logs/killer-lines.tap`, `e78759e8`): the two new killer lines are readable and
  their `<before>` occurs once on its line.
- Gates on the tree with this note present (`logs/gates.out`): `tsc --noEmit` 0; eslint on `test/rpc-guard-fetch-only-inside-client.test.ts` 0;
  `lint:ratchet` 69/69; `gate:vocab` 0 (357 files, no forbidden claim); `lang:gate` 0; `export:check` 0; `git diff --check d65f31d1` 0;
  no non-ASCII character in an added line (the note included); winlint on the changed files: no Windows hazard (`logs/winlint1.out`,
  `ad66d0bd`, the test file alone before the records; the four files together in `logs/gates.out`).
- Size, CI form (docs and the two count records are excluded by the CI pathspec): `test/rpc-guard-fetch-only-inside-client.test.ts`
  29+/1-, 30 changed lines (`git diff --numstat d65f31d1 HEAD` on the code commits).
- r1scan (`bin/r1scan.mjs --repo <worktree> --base d65f31d1 --head HEAD`) on the two code commits: `r1scan: 0 match(es)`
  (`logs/r1scan1.out`, `bea62e56`); run again on the branch's full head before the push (the report names its result).
- cites.mjs on this note before its commit (`logs/cites1.out`): every reference ok, 0 failed; the second pass on the committed text
  (`logs/cites2.out`) is named in the report.

## Proofs after the first review (branch at 530f4623 on 590c88ec, all offline, 0 refused)

- The review's probes replayed on a temporary copy of the test under `test/` whose l.19 parenthesis cites, beside `universe.ts:322`, this
  test file's own l.42 (P1), the same line through three `..` segments after `apps/bell/src` (P3), or l.15 of this note (P9). At
  `590c88ec` each is green, 8/8 (`logs2/probe-P1-590c88ec.tap` sha256 `eddbd6fa`, `probe-P3-590c88ec.tap` `41c0a167`,
  `probe-P9-590c88ec.tap` `49c5ff7c`): the gap. At `530f4623` each is red by the named test alone, `ERR_ASSERTION`, the item listed as
  `outside the packages and Bell scopes the sentence is about` (`probe-P1-fix.tap` `c60e650c`, `probe-P3-fix.tap` `4736a4d7`,
  `probe-P9-fix.tap` `66a1f8da`). The file itself: 8/8 (`logs2/green-file-fix.tap`, `54f09fb7`).
- `npm run test:main` (hostlock-run, offline): 306 files, 3128 tests, 3105 pass, 0 fail, 23 skipped (#284 skips the handoff test
  on this host), exit 0 (`logs2/suite2.stdout`, `6ac2c010`). `test-count-floor.mjs write` changes neither record (the same 8 tests of
  this file); `test-count-check.mjs --base a421d23e`, exit 0, its whole line (`logs2/count-check.out`, `ab01fe2c`):
  `test counts: 306 files, 3128 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base a421d23ec7bd, each name gone with its line in test/test-count-removals.json`
- Campaign `--base a421d23e` on a clone at `530f4623`: baseline green (918 tests, 0 red), `tues 4 / 4, survivants -, non conclus -,
  anchor-lost -, exit 0` (`mutants2/RESULTS.txt` `735c059c`; `RESULTS.json` `a4530e77`); `test/killer-lines.test.ts` alone 1/1.
- Anchors, `verifie-ancres.mjs --ref a421d23e`: `tueurs 2090 ; ANCRE 2090 ; DERIVE 0 ; PERDU 0` (`logs2/anchors.out`, `84264b7a`): the
  lines added sit inside the test body, after every pinned line of the file.
- Gates on the tree with this note (`logs2/gates.out`): `tsc --noEmit` 0; eslint on the test file 0; `lint:ratchet` 69/69; `gate:vocab` 0;
  `lang:gate` 0; `export:check` 0; winlint: no Windows hazard; `git diff --check 590c88ec` 0; 0 non-ASCII character in an added line;
  r1scan `--base a421d23e`: 0 match(es). Size, CI form: `test/rpc-guard-fetch-only-inside-client.test.ts` 4+/1- since `590c88ec`.
- cites.mjs on this note before its commit: 0 failed (`logs2/cites1.out`); the pass on the committed text is named in the report.

## Not verified

- Windows: the suite is not replayed on win32 here (MONARK replays at merge). The new test writes no file; it reads this test file and
  two Bell sources.
- The test holds one sentence of the header, the one that cites where a bare name appears in comments. The measured-hits block of the
  same header (l.22-26) records a measure at base `6114ce9` and is not a claim about today; it is not checked.
- The test checks that a cited line holds a bare name, not that the line is a comment: a code line that holds the name in a string
  literal (`apps/bell/src/tick.ts` l.192, which the scanner accepts, no KEY regex matching a string literal) or an allowlisted key read
  (`apps/bell/src/close.ts` l.53) would pass it. A key read outside the allowlist is refused by the scanner's own tests, not by this one.

## Changelog

- `0c86b150` Rpc-guard scanner test: the header's cited lines must hold a bare key name (the test, red on the trunk's comment).
- `847d6900` Rpc-guard scanner test: cite the lines that hold the bare key name today (l.19 in place).
- `588f9a3f` Test counts: the records after the new test (`test/test-counts.json` 7 -> 8 for this file, one name added to `test/test-names.json`).
- `52052d0a` This note (`docs/G0-lot-rpc-guard-test-stale-cite-1.md`, new; no other file).
- `590c88ec` Merge of the trunk `a421d23e` (#284) into the branch, by the orchestrator.
- `530f4623` Rpc-guard scanner test: a cited path must sit in the packages or Bell scope (after the first review: the scope rule in the
  test body, `and elsewhere` on l.19).
- The commit that updates this note after the first review (the bare-name count of the Bell scope, the scope rule, the proofs below).
- After the second review: the comment-or-code split of the twelve Bell lines counts three code lines (the string literal of
  `universe-cli.ts` l.303 was counted as a comment).
