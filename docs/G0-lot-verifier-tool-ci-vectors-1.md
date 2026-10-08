# G0 — VERIFIER-TOOL-CI-VECTORS-1: `vectors_check.py` in the verifier tool job, on the spec vectors pinned by commit and by digest; before R1, the public vectors of 2026-10-02 and the tool's refusal of the count, held whole

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max). The plan: a fresh instance, 2026-10-08 from 06:10 UTC (`date -u`),
  recherches `f3c5985` (`coordination/pieces/2026-10-08-G0-verifier-tool-ci-vectors/G0-VERIFIER-TOOL-CI-VECTORS-1.md`, 647 lines,
  sha256 `8bb63f93…`), measured on a prototype of the construction that was never committed (§4). This note is that plan in English,
  with MONARK's decisions folded in (§11), written by the lot's author, another fresh instance, from 08:01 UTC (`date -u`). The lot's
  code is the prototype's, byte for byte (§4); its own measures are in §13.
- **Demand**: MONARK `cc80585` (recherches, `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-247-decisions.md`, §1), m-5:
  VERIFIER-TOOL-CI-VECTORS-1 formed as proposed, carrier RECHERCHES, triggered by the publication of R1 in the public spec repository
  or by the list commit L of IO-GUARD-POSED-FILES-1, whichever comes first; the measure on the public vectors at `ffb5ea33` (333
  checks, 0 failures, then the expected refusal on the count) goes to the G0 as evidence of the current state and does not replace the
  item. The proposal: RECHERCHES `bb1b053` §3.1. Then MONARK `d51b4bb`, m-2: the item reaches the trunk before L, under the same guard
  (nothing under `tools/kata-recalc`). The G0 of #247 (`docs/G0-lot-verifier-tool-ci-1.md` §12, l.406-416) wrote the form: "the job
  fetches `vectors.json` at its commit, checks its sha256 before `vectors_check.py` runs, and drops it from `NOT_RUN`, ~6 lines".
- **Decided** (MONARK `44764dc`, recherches `coordination/messages/2026-10-08-MONARK-vers-RECHERCHES-vectors-decisions.md`, sha256
  `6fe603a3…`, answering RECHERCHES `c135cc3`): way (a), the public vectors of 2026-10-02, taken by commit and checked by sha256
  before any check; the switch to R1's publication commit as the item's second step; `ci.yml` open to the lot; the tolerance bound of
  `within` as an item of its own; one G2. Each decision in §11.
- **Bases read** (explicit refspecs, `git ls-remote`): trunk `lot/etude-suite` = `565c7065` at 07:47 UTC. The plan measured at
  `5e976a1a` and read `1ae166c6`; from `5e976a1a` to `565c7065` eight files change, all under `docs/` (`ETAT.md`,
  `JOURNAL-PROVENANCE.md` and six `PAROXYSME-*.md`); nothing under `tools/kata-recalc/`, nor the driver, its types, its stand-in, its
  test, `ci.yml`, `scripts/oracle/run.mjs`, `apps/harness/data/verifiers.json` or `apps/harness/src/policy-verifiers.ts` (`git diff
  --stat`, empty). **The `file:line` addresses of this note hold at `5e976a1a` and at `565c7065` alike**, except those of the lot's
  code (its commits, §13), those of ETAT (at `5e976a1a`, as written) and those of commit C of IO-GUARD-POSED-FILES-1 (`937d31eb`, a
  local branch, not on the remote). The public spec repository `KraidleAI/monark-kata-spec`: `main` = `ffb5ea33` (07:47 UTC; "Spec
  version 2026-10-06: contract 1.1.0", 2026-10-06 06:13 UTC), taken at depth 1 into a bare repository of the workspace: `vectors.json`
  blob `5743b317`, 127 681 bytes, sha256 `06ecf069…a9fb`. Visibility (`gh api repos/<repository>`, read again at 08:10 UTC):
  `monark-governance` and `monark-kata-spec` public, `recherches` private. recherches: `4fe89cb` at reading, `27dc1fc` at writing.
- **No series byte read**, no data folder walked. The public vectors (`vectors.json` of `ffb5ea33`, public bytes) are read by the tool,
  by the driver and by `sha256sum`, never printed. R1's vectors (`kata/spec/vectors.json` of recherches, private) were read by the plan
  through `vectors_check.py` alone, and by this lot not at all: this note cites R1 only by what is already public, its sha256
  `7414b2fc…` (#247's G0 l.43), its count of checks (363) and the name of its new section, `reason_order` (`vectors_check.py` l.5-7 and
  l.20-22). The wave registry `wave1.json` is read by the tool alone, in the job's runs, never printed.

## 1. What the item closes, and the state today (measured)

- **The gap.** `vectors_check.py`, the oracle D-2 (i) (each value of the spec vectors recomputed by `kata_lib.py` and compared under
  the contract of KATA-SPEC l.71), runs in no CI run: the driver of #247 names it in `NOT_RUN` (`scripts/verifier-tool-ci.mjs` l.24:
  "its input, the spec vectors of the frozen revision (R1), is in no repository this job reads") and announces it (`::notice::not run:
  …`, l.117); off Windows, the `report.py` children of `report_check.py` stop before their vectors oracle (#247's G0 l.408-409). Yet E2,
  the list entry of IO-GUARD-POSED-FILES-1, changes `vectors_check.py` (its usage line and its prologue, l.8-9 at `937d31eb`): without
  this item a revision of the tool would enter the list with one of its oracles never run by the CI, the opposite of the reason that
  MONARK `b9ecc64` §1 gave for VERIFIER-TOOL-CI-1.
- **What the job gains.** A sixth run, `python <FORM> tools/kata-recalc/vectors_check.py <vectors> <work>/vectors.txt`, judged by the
  check's name, on every pull request. Before R1: 333 conformance checks (kata 94, digest 3, ewma_association 4, bucket-frozen 7,
  bucket-probe 13, factors 1 + 168, factors_4h 1 + 42) and 2 046 checks outside conformance (js_number 2 020, js_json 2,
  digest-example 1, lookahead 14, slot 6, grid 1, sections 1, count 1), one of which fails, by construction: the count. Once R1 is
  published: R1's 363 checks and the same checks outside conformance, green (§2.3). Duration: 0.34 s.
- **The state today**, measured by the plan under the CI's build of CPython 3.14.8 (`sys.version` `3.14.8 (main, Oct  1 2026,
  02:38:33) [GCC 13.3.0]`, the one in #247's job log; the interpreter that the instance of IO-GUARD-POSED-FILES-1 posed in a tool cache
  of the workspace, reused read only), Node 24.21.0:

| Measure | Input | Form, tree | Result |
|---|---|---|---|
| M1 | the public `vectors.json` of `ffb5ea33` (blob `5743b317`, 127 681 bytes, sha256 `06ecf069…`) | `-E -S -s -B`, the trunk's tool | exit 1; 28 lines, stderr empty; "conformance checks on vectors.json: 333 (KATA-SPEC section 6 counts 363), failures 0"; one FAIL line, `FAIL [count] 333 conformance checks KATA-SPEC section 6 counts 363`; `VERDICT: RED (1 failure(s) over all sections)`; output and written file equal, sha256 `c05f8cc19bcbd3e3…`: that of #247's G0 (l.416) and of its G2, to the byte |
| M2 | R1's vectors (sha256 `7414b2fc…`, private), read by the tool alone | `-E -S -s -B`, the trunk's tool | exit 0; 363 conformance checks, 0 failures, no FAIL line; the `reason_order` section 30 checks, its inputs 3; `VERDICT: GREEN (0 failure(s) over all sections)` |
| M4 | the public file, outside the repository, then at `kata-spec-vectors/vectors.json` in the worktree | `-E -S -s -B -P`, the tool of IO-GUARD-POSED-FILES-1's commit C (`937d31eb`: `FORM` l.44 with `-P`, the prologue) | exit 1; both outputs byte-equal to M1 (`c05f8cc1…`): E2 does not change this output |

  M3, the plan's comparison of the two files section by section, concerns R1's bytes and is not carried here. This lot measured M1
  again at `565c7065`, before its first commit (a scratch clone, the spec cloned at `ffb5ea33` into `kata-spec-vectors/`, the run as
  the driver launches it): exit 1, 28 lines, stderr empty, output and written file `c05f8cc19bcbd3e3…`.
- **A sentence of #247's G0 is inexact**: "All its code runs" (l.416). On the file of 2026-10-02 the loop of section H of
  `vectors_check.py` (l.220-239, `reason_order`) runs zero times: it reads `v.get("reason_order", [])` (l.225), a key this file lacks;
  its 3 + 30 checks exist only on R1's vectors (M2). And every value that the tool compares under the tolerance of KATA-SPEC l.71 is
  bit-identical to the one it wants (the info lines of M1: 86 of 86 kata values, and the 159 and 42 non-null slots of factors and
  factors_4h), so the tolerance test of `within` (l.29) and the branch of a kata value that is not bit-identical (l.88-89) never run
  either. Measured by this lot at `565c7065` in the same scratch clone, under FORM and the CI's 3.14.8, each change alone, the file
  restored and its sha256 checked: l.29 replaced by `raise SystemExit(99)`, l.88 by `raise SystemExit(98)`, and `raise
  SystemExit(97)` inserted as the first line of the loop's body after l.225: each run unchanged (exit 1, output and file
  `c05f8cc1…`); the same sentinel on l.86 (`bit["same"] += 1`, which runs) exits 96 with no output. The lot corrects l.416 in place,
  on its one line (`docs/`, outside R-25): "not all its code runs", with these three places.

## 2. The input: before R1, after it, and what is public

### 2.1 What is public, and what is not

| Object | Where | Public? | In this lot |
|---|---|---|---|
| the vectors of 2026-10-02 (`06ecf069…`, 127 681 bytes) | `vectors.json` at the root of `KraidleAI/monark-kata-spec` at `ffb5ea33`; pinned by `scripts/spec-publish-inputs.json` l.11 (the source, in recherches) and l.64 (carried) | **yes**, published with the spec of 2026-10-02 | the job's input before R1 |
| R1's vectors (`7414b2fc…`) | `kata/spec/vectors.json` of recherches, private | **no**. Public: their sha256 (#247's G0 l.43), their count and the name of their new section (`vectors_check.py` l.5-7 and l.20-22, on the public trunk). Not public: their bytes, first the `reason_order` section, its cases and their expected values | never read, never copied by this lot |
| R1's text (`KATA-SPEC-proposed.md`, `ea64d03e…`, frozen) | recherches | no | nothing |
| the governance repository and the logs of its CI | `KraidleAI/monark-governance` | **yes**: public visibility, read through the API | the lot's target; everything the job prints is public |
| the tool, the driver, its tests | governance | yes | — |

Consequence: the driver prints every line of every run into the log (`scripts/verifier-tool-ci.mjs` l.111), and `vectors_check.py`
writes the value it got and the value it wanted on each FAIL line (l.48, `got … want …`). A failing run on private bytes would
publish them. Hence the rule of §2.4: the job launches the tool only on public bytes that it pins, checked before any run.

### 2.2 Before R1: four ways, (a) decided

- **(a), decided (Q-1): the public vectors of 2026-10-02, taken from the spec repository at `ffb5ea33`.** The job checks them out from
  their public place by a second, pinned `actions/checkout` step (§3.1); the driver checks their sha256 before any run and holds the
  run whole: exit 1, the four end lines (the refusal of the count, the 333 checks with 0 failures, the input read, the verdict) and
  the sha256 of the whole output (`c05f8cc1…`). Nothing new is published. Every section of `vectors_check.py` runs but section H,
  which only R1's vectors reach: its 33 checks stay out of the CI until the switch (Q-3). The item stays open until the switch
  (§2.3): the run on the version of 2026-10-02 is its first step, not its replacement (`cc80585` §1, translated: it does not replace
  the item). Variant (a′): copy this public file into the repository (`fixtures/**/*.json` is outside R-25, `ci.yml` l.100), no
  network at run time; set aside: a second copy of a spec file away from its place, to follow at each publication, when the spec
  repository serves it at its commit.
- **(b) copy R1's vectors into the governance repository** (under `fixtures/`, say, outside R-25): the 363 checks in CI at once, but
  the publication of R1's vectors, and of the `reason_order` section, before the dated release of the spec, which publishes them with
  part c of E-2a and MONARK's P0 line after the founder's go (ETAT l.1066-1068). An act of publication: MONARK's, and likely the
  founder's. Not taken.
- **(c) read them at run time from recherches with a read token**: a repository secret (a lasting setting), private bytes in the CI of
  a public repository, and a red run that would print their values into a public log (above). Set aside.
- **(d) wait**: `vectors_check.py` stays in `NOT_RUN`, the item waits for R1's publication, and the commit L of IO-GUARD-POSED-FILES-1
  with it (its §12), so the real run of its part 2. Not taken.

### 2.3 After R1: the switch, the item's second step (Q-2)

- When R1 is published, the lot that carries it (part c of E-2a, RECHERCHES; ETAT l.1066) changes the pinned source of
  `vectors.json` (`scripts/spec-publish-inputs.json` l.11, today `06ecf069…`), and the spec repository gets a commit whose root
  `vectors.json` is R1's file.
- **The switch**, a pull request of RECHERCHES, the first after that commit: `VECTORS` takes that commit, the published sha256
  (`7414b2fc…` if the published bytes are the frozen file), its byte count, exit 0, the end `["conformance checks on vectors.json: 363
  (KATA-SPEC section 6 counts 363), failures 0", "input spec-vectors vectors.json sha256 <published> bytes <n>", "VERDICT: GREEN (0
  failure(s) over all sections)"]`, the sha256 of the output measured on the published file, and its notice; the `ref:` of `ci.yml`
  follows; test 7 moves to that end, red first against the driver before it. Nothing under `tools/kata-recalc/`, no list entry.
  Estimated price: 40 to 70 lines (the lines of `VECTORS` and of the end of test 7 rewritten in place). The item closes there, and that
  pull request triggers VECTORS-WITHIN-BOUND-1 (Q-5, §11).
- If the published bytes differ from the frozen file (R1 amended before its publication), the switch measures the end on the
  published file; nothing private is copied, the public spec repository carries them. If R1 is published before the commit L of
  IO-GUARD-POSED-FILES-1, the item starts directly in that form, without the step of 2026-10-02.

### 2.4 The confidentiality rules, in the lot

- No byte of R1 (neither the name of a `reason_order` case nor a value) in the governance repository, a log of its CI, a pull request
  body or this note; this note cites R1 only by what is already public (its sha256, its counts, the name of its section); the digest
  of the tool's output on R1 waits for the switch.
- The job launches `vectors_check.py` only on the pinned bytes: `vectorsProblems` checks their sha256 before any run, and a mismatch
  runs no check (§3.2; measured, §4.3, p1 and p2). The log thus only ever carries the tool's lines on public bytes.
- Local replay (RECHERCHES): the spec taken from the public repository, `git clone https://github.com/KraidleAI/monark-kata-spec.git
  kata-spec-vectors && git -C kata-spec-vectors checkout --detach ffb5ea33fcdcde2bd497cb25fba184ae2c4bbfa8`, at the root of the
  clone, then `VERIFIER_TOOL_PYTHON=3.14.8 node scripts/verifier-tool-ci.mjs` under the CI's build; the folder removed afterwards
  (untracked, never added: no `git add -A`). R1's file is never posed there.

## 3. Construction

### 3.1 The job (`.github/workflows/ci.yml`, MONARK's file, open to the lot: Q-4)

- **One step**, added after l.292 (`python-version: "3.14.8"`) and before the driver's (l.293): two comment lines and `- uses:
  actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` (the action the job already pins), `with:`, `repository:
  KraidleAI/monark-kata-spec`, `ref: ffb5ea33fcdcde2bd497cb25fba184ae2c4bbfa8` (a commit, never a branch), `path:
  kata-spec-vectors`, `persist-credentials: false`. The default depth (1) takes that commit only; no token is kept; the job's token
  reads a public repository. The path is not `spec/`, a tracked folder of the governance repository (`spec/contract-1.1.0`).
- The job's header comment (l.275-276) names `vectors_check`, rewritten in place.
- **Placed after l.292** so that no anchored line moves: the test's killer `ci.yml:292` stays, the one of the new `ref:` line aims at
  l.298. MONARK's oracle never reads a `uses:` step (`scripts/oracle/run.mjs` l.3-5) and the launch line does not change (`CI_ONLY`,
  l.31): nothing changes in the oracle. The job stays internal (`INTERNAL_JOBS`, `scripts/export-public.mjs` l.450): the public
  workflow does not change (`export-public`, 4 of 4).
- `timeout-minutes: 11` unchanged: `vectors_check.py` takes 0.34 s; the checkout of one commit of a tree of about 400 KB (49 blobs,
  414 706 bytes), a few seconds (on the runner: §13).
- **The first job of this CI that checks out a second repository**: no other `repository:` line in the workflows (`git grep`). MONARK
  writes the dated line under ADR-M003 D9 himself, before the merge (Q-4).

### 3.2 The driver (`scripts/verifier-tool-ci.mjs`) and its types

- `NOT_RUN` emptied (l.24): `{}`. The mechanism stays for other lots (`main()` still names its entries); the notice "not run"
  disappears.
- **`VECTORS`** (new, after `NOT_RUN`): `repository`, `commit`, `path` (`kata-spec-vectors/vectors.json`), `sha256`, `bytes`, `exit`
  (1), `end` (the four lines), `stdout` (the sha256 of the whole output, `c05f8cc1…`) and `notice`. Its comment says what the file is
  and why the run ends on a refusal.
- **`OWED`** gains `["vectors_check.py", 0]`: zero bare `VERDICT: GREEN` lines, because the verdict of this tool carries a suffix
  (`vectors_check.py` l.253, "VERDICT: GREEN (0 failure(s) over all sections)"), which the driver's rule does not count (l.81, strict
  equality); its end is held by `VECTORS`. After R1 too.
- **`steps()`** gains the sixth run, `[join(repo, VECTORS.path), join(w, "vectors.txt")]`, its output in the work folder
  (`io_guard.output` wants an absent path, outside the tool's trees).
- **`vectorsProblems(data)`** (new, exported): absent, a refusal that names the checkout; other bytes, a refusal that names both
  digests. Called in the `try` block of `main()` after `accountProblems`: a failed precondition runs no check (l.108).
- **`outputProblems`**, by the check's name alone (the lesson of m-7 of #247: nothing passed along by `main()`, which no test runs):
  for `vectors_check.py`, the wanted exit is `VECTORS.exit`; a FAIL or RED line is admitted only if `VECTORS.end` carries it; each line
  of `VECTORS.end` must appear once; the sha256 of the whole output (stdout and stderr, as `main()` passes them) must be
  `VECTORS.stdout`. For any other check nothing changes (`{ exit: 0, end: [] }`, no digest): held by the last assertion of test 7 and
  by tests 4 and 6, unchanged.
- **Why the whole digest** (v2 of the prototype): without it, the mutant `vectors_check.py:58` `range(1, 2001)` -> `range(1, 1)` (the
  2 000 round trips of `js_number` removed) keeps exit 1 and the four end lines, and the job stays green (measured on v1); with it, it
  reds (`c5cef01f…`, §4.3). A frozen tool on frozen bytes has one output: "exactly" is said by its digest, and the end lines name the
  common cause.
- **The notice**: `::notice::spec vectors: KraidleAI/monark-kata-spec at ffb5ea33…, vectors_check.py on the public spec vectors of
  2026-10-02, 333 of the 363 checks of R1 (no reason_order section): its refusal of the count wanted`. The job says what it does
  (`d51b4bb`, m-1, translated: a case announced must never say anything other than what it does).
- **FORM read, never written**: the new run launches like the others (`formOf`, l.102; `[...form, …]`, l.109); it follows commit C of
  IO-GUARD-POSED-FILES-1 without change (M4).
- Types (`scripts/verifier-tool-ci.d.mts`): `VECTORS` and `vectorsProblems`, 2 lines.

### 3.3 The tests (`test/verifier-tool-ci.test.ts`)

- **A namespace import** for the new names (`import * as ci from "../scripts/verifier-tool-ci.mjs"`): at the base the file loads (a
  named import of a missing export would be a link error, which red-proof refuses: "an import red on a file that exists at base",
  `scripts/red-proof.mjs` l.11-12), and each changed test reds by assertion.
- **Test 1** (the job): the second checkout, after setup-python and before the driver, the same action line as the first,
  `repository`, `ref` equal to `VECTORS.commit`, `path` equal to the first segment of `VECTORS.path`, `persist-credentials: false`.
- **Test 2**: `Object.keys(NOT_RUN)` is `[]` (l.60).
- **Test 3**: the six pinned runs; D-2 removed by `s[3] !== 2` (l.75: `slice(0, 4)` would also remove the sixth); the arguments of the
  new run, the pinned path and `<work>/vectors.txt`.
- **Test 7** (new), `verifier_tool_driver_runs_vectors_check_on_the_pinned_spec_vectors`: the shape of `VECTORS`; the exact end (exit
  1, the four lines); the fixture, M1's whole output (28 lines of counts, no vector value), whose sha256 is `VECTORS.stdout`, admitted;
  refused: exit 0, another FAIL line, the refusal of the count absent or doubled, another input, another verdict, checks removed
  outside the end (the `js_number` line, which only the digest sees); `vectorsProblems(null)` and other bytes; last, the end of
  `vectors_check.py` admitted for no other check (four refusals for each of `guard_check.py`, `compare_check.py`, `binom_check.py`).

## 4. Red first, killers, job mutants (measured on the prototype v2; the lot's own runs in §13)

The prototype: two worktrees detached at `5e976a1a`, the four files uncommitted; v1 without the digest (124 lines, 15 killers
killed, red-proof OK), v2 with it, measured here. Its diff (`git diff -U0`, 188 lines) has sha256 `c2c35ec6…`; its four files:
`ci.yml` `de391ba360bdecad…`, `verifier-tool-ci.d.mts` `330d843e01bb04c7…`, `verifier-tool-ci.mjs` `e252885ff9198336…` (155 lines),
`verifier-tool-ci.test.ts` `6e49186781092e9e…` (185 lines). The plan's probes and worktrees were removed after it.

### 4.1 Red first

- **T** (the test file alone, the three other files at the trunk): 7 tests, 3 pass (4, 5, 6), 4 fail (1, 2, 3, 7), each by
  `ERR_ASSERTION` (TAP `425e2311…`). **C**: 7 of 7, and `every_killer_line_is_readable` green (TAP of both files `85de9ade…`).
- **red-proof** `--base 5e976a1a --gel <prototype> --draw 4 --seed 20261008` (07:05:25 to 07:05:50 UTC): OK, 4 judged, all F2P
  (assertion at the base, green at the gel), 3 unchanged, 4 killers drawn (`:103 CONST`, `:53 SDL`, `:91 CONST`, `ci.yml:292
  CONST`), 4 killed; `RED-PROOF.json` `0f538dd3…` (it carries paths and the hour).
- **In the lot**, T carries the test file with its killer lines as at the base (no new killer, none re-anchored), so that
  `every_killer_line_is_readable` stays green at T; C writes the new killers and re-anchors those that its lines move (§4.2). T and C
  are pushed together and the pull request is opened after them: no CI run judges T alone.

### 4.2 Killers (`// killer: file:line OP "before" -> "after"`)

Sixteen killers, each fired by hand, alone, the file restored and its sha256 checked again: 16 killed by `ERR_ASSERTION` (output
`7a48e0db…`). `verifie-ancres.mjs --files test/verifier-tool-ci.test.ts --ref 5e976a1a`: 16 killers, 16 ANCRE; on all the tracked
files: 1 696, 1 696 ANCRE, 0 DERIVE, 0 PERDU. The lines aimed at are the prototype's, which are the lot's (§13).

| Line of the test | Killer | Reds test | State |
|---|---|---|---|
| l.28, above test 1 | `.github/workflows/ci.yml:292 CONST "python-version: \"3.14.8\"" -> "python-version: \"3.14\""` | 1 | unchanged |
| l.43, body of test 1 | `.github/workflows/ci.yml:298 CONST "ref: ffb5ea33fcdcde2bd497cb25fba184ae2c4bbfa8" -> "ref: main"` | 1 | new |
| l.56, above test 2 | `scripts/verifier-tool-ci.mjs:91 CONST "present[t] !== (t === TOOL)" -> …` | 2 | re-anchored (was :69) |
| l.77, above test 3 | `scripts/verifier-tool-ci.mjs:53 SDL "join(w, \"hikae.txt\")" -> ""` | 2, 3 | re-anchored (was :39) |
| l.85 | `scripts/verifier-tool-ci.mjs:93 CONST "times(o) !== 1" -> "times(o) === 0"` | 3 | re-anchored (was :71) |
| l.87 | `scripts/verifier-tool-ci.mjs:94 SDL "a run that this job does not owe" -> ""` | 3 | re-anchored (was :72) |
| l.96 | `scripts/verifier-tool-ci.mjs:54 SDL "join(w, \"vectors.txt\")" -> ""` (the new run removed) | 2, 3 | new |
| l.102, above test 4 | `scripts/verifier-tool-ci.mjs:110 CONST "[...skipped].sort().join() !== …" -> …` | 4 | re-anchored (was :86) |
| l.118, above test 5 | `scripts/verifier-tool-ci-report-check.py:45 CONST …` | 5 | unchanged |
| l.130, above test 6 | `scripts/verifier-tool-ci.mjs:111 CONST "check === \"report_check.py\" ? REPORT_END : []" -> "[]"` | 4, 6 | re-anchored (was :87) |
| l.135 | `scripts/verifier-tool-ci.mjs:112 CONST "!lines.some(" -> "lines.some("` | 4, 6 | re-anchored (was :88) |
| l.138 | `scripts/verifier-tool-ci.mjs:45 CONST "/^failures 0$/, " -> ""` | 4, 6 | re-anchored (was :31) |
| l.146, above test 7 | `scripts/verifier-tool-ci.mjs:103 CONST "check === \"vectors_check.py\" ? VECTORS : " -> "false ? VECTORS : "` (the run judged like the others) | 7 | new |
| l.171 | `scripts/verifier-tool-ci.mjs:114 CONST "times(e) !== 1" -> "times(e) === 0"` (a doubled end line admitted) | 7 | new |
| l.176 | `scripts/verifier-tool-ci.mjs:116 CONST "digest !== v.stdout" -> "false"` (the digest ignored) | 7 | new |
| l.180 | `scripts/verifier-tool-ci.mjs:82 CONST "sha256 === VECTORS.sha256 ? [] : " -> "true ? [] : "` (other bytes admitted) | 7 | new |

Eight killers re-anchored: the driver's new lines (`VECTORS`, `vectorsProblems`, the run, the header) sit above them; their text is
intact, once on its line. Placing `VECTORS` below `outputProblems` would keep two of them in place, at the price of a constant defined
after its use: set aside for readability.

### 4.3 The job's mutants

**End to end**, by the job's command (`VERIFIER_TOOL_PYTHON=3.14.8 node scripts/verifier-tool-ci.mjs`, the CI's build first on
`PATH`, the spec cloned at `ffb5ea33` into `kata-spec-vectors/` as the action would pose it):

| Run | Change (alone, restored afterwards, sha256 checked again) | Exit | What the job writes |
|---|---|---|---|
| v2-m0 | none | 0 | `GREEN`, 274 s (red-proof ran beside it): guard 7 s, report 142 s, compare 8 s, registry 36 s, binom 81 s, vectors 0 s (exit 1, judged green); `vectors.txt` `c05f8cc1…`; `report.txt` `409e589e…`, `compare.txt` `e8dc7928…`, `binom.txt` `63606d4f…`, `hikae.txt` `68e16302…`, the CI's; three notices (ntfs-stream, section 3 stood in, the vectors), no "not run" notice |
| v1-m3 | `vectors_check.py:20` `SPEC_CHECKS = 363` -> `333` (the count admitted) | 1 | `RED, 4 problem(s)` (driver v1): "exit 0, not 1" and the three end lines absent; judged by the driver v2: 5, the digest added |
| v2-m58 | `vectors_check.py:58` `range(1, 2001)` -> `range(1, 1)` | 1 | `RED, 1 problem(s)`: "output sha256 c5cef01f…, not the pinned c05f8cc1…" (green under v1) |
| v2-p1 | the checkout absent | 1 | `RED, 1 problem(s)` before any check: "kata-spec-vectors/vectors.json: absent; the job checks out KraidleAI/monark-kata-spec at ffb5ea33… there" |
| v2-p2 | another public file at the path (`contract-1.1.0/vectors-1.1.0.json` of the same commit, `190b9fd8…`) | 1 | `RED, 1 problem(s)` before any check: its two digests |

**Judged by `outputProblems` of v2 on the tool's real output** (each mutant alone in the second worktree, restored, sha256 checked
again; output `f213b764…`): the control, green; `:20`, red, 5; `:100` (the check of the window digests inverted), red, 7 (three
`FAIL [digest]` lines, the end, the digest); `kata_lib.py:421` (`-b3` -> `-b2`), red, 7 (three `FAIL [bucket-probe]`); `:58`, red, 1
(the digest); **`:29`, the bound of `within` (1e-12 -> 1e-9), survives**: exit 1, output byte-equal (`c05f8cc1…`). No public value
differs from its expected value (the info lines: kata 86 of 86 bit-identical, factors 159 and factors_4h 42 non-null slots
bit-identical): the tolerance test of `within` never runs (§1), and the checks of `reason_order` compare by equality (l.239). Under the
digest, any drift of the engine, even below 1e-12, changes an info line and reds the job; the survivor counts only for a run that
would read other bytes with this bound: item VECTORS-WITHIN-BOUND-1 (Q-5, §11). On R1: not measured.

Logs (sha256, first 16): v1-m0 `b1e3d40e…`, v1-m3 `58dfcfe1…`, v2-m0 `f62d068e…`, v2-m58 `23009dbd…` (they carry local paths).

## 5. Size (R-25, CI form)

Measured on the prototype v2: `git diff --shortstat 5e976a1a` on the pathspec of the `STAT=` line of the job r25 (`ci.yml` l.100,
read in the tree; `docs/**/*.md` out), the prototype uncommitted (the same count as `base...HEAD` of a branch carrying these four
files). Bounds: **547 per lot** (ETAT l.1924, "547 par lot dès CM-2c") and 1 205 in CI (`ci.yml` l.56).

| File | Change | Lines (ins + del) |
|---|---|---|
| `test/verifier-tool-ci.test.ts` | tests 1 to 3 extended in place, test 7 (its fixture of 28 lines on 6), the import, 8 killers re-anchored, 6 new | 78 (+65 −13) |
| `scripts/verifier-tool-ci.mjs` | `VECTORS` (13), `vectorsProblems` (7), the run, `OWED`, `outputProblems` (4 new, 3 in place, its comment), `main()` (2), the header (4 -> 5) | 50 (+40 −10) |
| `.github/workflows/ci.yml` | the step (8) and l.275-276 in place | 12 (+10 −2) |
| `scripts/verifier-tool-ci.d.mts` | `VECTORS`, `vectorsProblems` | 2 (+2) |
| **Total, CI form** | 4 files, 117 insertions, 25 deletions | **142** |

- **142, under 547 and 1 205.** Out of the count: this note, the in-place correction of l.416 of #247's G0 (`docs/`), ETAT (MONARK).
  The lot counts again at the freeze, in CI form (§13).
- **The gap with the "~6 lines" of #247's G0 (§12)**: they counted the step alone. The driver must also judge a run whose verdict is
  not the bare line and which ends on a refusal before R1, check the bytes before the run, and hold the whole output; the tests hold
  each rule, and the new lines move eight killers (16 lines).
- **The switch after R1**: a pull request apart, estimated at 40 to 70 lines (§2.3).
- **For IO-GUARD-POSED-FILES-1**: its R-25 is measured against the trunk that carries this item (its §7); these 142 lines are in its
  base, not in its count.

## 6. Gates and proofs at the freeze

- Node 24.21.0: the test file; `npx tsc --noEmit`; `eslint` on the touched files; `npm run -s gate:vocab`, `lang:gate`,
  `lint:ratchet`, `export:check`; winlint on the four files; `verifie-ancres.mjs` on the test file and on all tracked files;
  `every_killer_line_is_readable`; `git diff --check`. **On the prototype**: `tsc` 0; `eslint` 0; `gate:vocab` OK (349 files);
  `lang:gate` OK; `lint:ratchet` 69/69; `export:check` OK; winlint, 4 files, no hazard; `git diff --check` clean; the test files that
  read `ci.yml` (the touched one included) and the killer guard, green: `verifier-tool-ci` 7, `killer-lines` 1, `export-public` 4,
  `ci-gates` 44, `oracle-run` 17, `r25-integration` 74, `cra-b` 6, `dojo-render` 13, `site-build-fleet` 35. The whole suite did not
  run on the prototype.
- red-proof `--base <trunk> --gel <head> --draw 4 --seed <s>`: F2P expected, tests 1, 2, 3 and 7. The mutation campaign on the test
  file's killers (`scripts/mutants/run.mjs --killers`).
- The job's command against the mutants of §4.3, under the CI's build.
- The pull request's CI: 12 checks; `g3-verifier-tool`, six runs, `vectors_check.py` exit 1 judged green, `vectors.txt` `c05f8cc1…`,
  the notice, and the job's time read.
- **The guard**: `git diff --stat <base> HEAD -- tools/kata-recalc apps/harness/data/verifiers.json
  apps/harness/src/policy-verifiers.ts` empty; `kata_recalc_tree_is_the_pinned_manifest` and `verifier_tool_tree_is_the_listed_tree`
  green; no list commit.

## 7. The guard, and the form

- **Nothing under `tools/kata-recalc/`**: the lot touches four code files, none there; nor the list of 1f (`verifiers.json`,
  `policy-verifiers.ts`); both tree tests stay green; no list entry. Commit C of IO-GUARD-POSED-FILES-1 stays the last tool commit,
  the one that E2 names (its §4 point 2 bis). This is the guard that MONARK `d51b4bb` (m-2) keeps.
- **The form read**: no line to follow at commit C of IO-GUARD-POSED-FILES-1, and the pinned end holds under it to the byte (M4):
  `VECTORS` holds on the pull request of IO-GUARD-POSED-FILES-1 without change.
- **C′**: the G2 of T and C of IO-GUARD-POSED-FILES-1 (recherches `ad94322`, CORRECTIONS: m-1 and m-2, both in `io_guard.py`, the
  list lines of the second tree and the refusal of homonyms) remakes C; its note 5 says that the outputs of `compare_check.py`,
  `vectors_check.py` and `binom_check.py` should not move, and that the driver measures them again at C′. M4, measured at `937d31eb`,
  is thus made again at C′; step 5 of §8 runs it in any case, on the pull request of IO-GUARD-POSED-FILES-1.
- If MONARK folded a check of the bound into E2, the output would change: the push of IO-GUARD-POSED-FILES-1 would then write the new
  `VECTORS.stdout` and the fixture's line, the rule of its §4 point 2 bis (the lines of the step follow in the same push as C). Q-5
  made the bound an item of its own instead (§11).

## 8. Trigger and sequence, relative to the commit L of IO-GUARD-POSED-FILES-1

- **The trigger** (`cc80585` §1): the first of (i) the publication of R1 in the public spec repository and (ii) the commit L of
  IO-GUARD-POSED-FILES-1. Today (i) is not done (the spec at `ffb5ea33`; R1 goes out with part c of E-2a, ETAT l.1066); (ii) is near:
  T and C are written and measured, and L depends only on this item (RECHERCHES
  `2026-10-08-RECHERCHES-vers-MONARK-247-fusion-recu.md` §1). (ii) commands: the item reaches the trunk **before** L, under the
  same guard.
- **The sequence**:
  1. MONARK's answers, Q-1 first (the way (a) chooses what the CI of a public repository reads): given, `44764dc`, push allowed.
  2. The branch `recherches/verifier-tool-ci-vectors-1`, from the trunk of the moment (`565c7065`); four commits, as for #247: this
     note (with the correction of l.416 of #247's G0), T (the test file, red by assertion in tests 1, 2, 3 and 7, its killers as at
     the base), C (the driver, its types, `ci.yml`, the new and re-anchored killers), the results (§13). T and C pushed together; the
     pull request opened as a draft after them.
  3. The CI at 12 of 12; **one** G2, the lot's, by a fresh instance (it reads this note with the code; Q-6); its fold; RECHERCHES'
     merge request.
  4. MONARK: G7 (his oracle runs the Node tests; the driver stays `CI_ONLY`), the dated line under ADR-M003 D9 (Q-4), a `--no-ff`
     merge on `lot/etude-suite`.
  5. IO-GUARD-POSED-FILES-1: "Merge the trunk" (the trunk that carries the item) into `recherches/io-guard-posed-files-1`, the guard
     `git diff --stat 43f46d9f <merged trunk> -- tools/kata-recalc` empty, then L; T, C, the merge and L pushed together, the pull
     request at L (its condition (e)); its CI runs the six runs under `-E -S -s -B -P`, `vectors_check.py` on the public vectors:
     green predicted (M4); its measures (red-proof, R-25, anchors) against that trunk.
  6. At R1's publication: the switch (§2.3), by RECHERCHES; the item closes, and VECTORS-WITHIN-BOUND-1 starts.
- **The heads**: this note names the trunk `565c7065` and the spec `ffb5ea33`, read by explicit refspec and `ls-remote` when T and C
  were written; an address moves to a new head only after it is read again.

## 9. Files, and MONARK's acts

| File or act | What changes | Whose |
|---|---|---|
| `.github/workflows/ci.yml` | the step after l.292 (8 lines); l.275-276 in place | open to the lot (Q-4) |
| `scripts/oracle/run.mjs` | nothing: `CI_ONLY` (l.31) already holds the driver's line, and a `uses:` step is never read (l.3-5). A way that added a `run:` line fetching over the network would want its `CI_ONLY` entry, by a commit of MONARK before the lot's G7 | — (MONARK, `44764dc`: stays as it is) |
| `docs/ETAT.md` | the item's state: this note, its two steps, the trigger of the switch; then its closing | MONARK (Q-7) |
| `docs/adr/` (ADR-M003 D9) | a dated line for the first checkout of a second repository by the CI: the pinned commit, `persist-credentials: false`, a public repository only | MONARK, before the merge (Q-4) |
| the protection of `lot/etude-suite` | nothing (no protection, ETAT l.426-428; the founder: do nothing for the check unless there are errors or problems) | — |
| `KraidleAI/monark-kata-spec` | read only, at a pinned commit; the publication of R1 is the dated release of part c of E-2a, with MONARK's P0 line after the founder's go | outside the item |
| the Windows replays | unchanged (the driver never runs under Windows); `vectors_check.py` on R1's vectors at the merge of E2 | MONARK (Q-3) |

RECHERCHES' files (those of #247): `scripts/verifier-tool-ci.mjs`, `scripts/verifier-tool-ci.d.mts`, `test/verifier-tool-ci.test.ts`;
this note and l.416 of #247's G0, under `docs/`. Nothing else: neither `package.json`, nor `scripts/export-public.mjs`, nor
`test/export-public.test.ts`, nor `test/ci-gates.test.ts`, nor `.gitignore`.

## 10. Risks

- **The pinned commit becomes unreachable** (a rewrite of the spec's history): the checkout fails, the job reds, closed; the switch
  pins again.
- **GitHub unavailable** at the second checkout: as at the first, the job reds.
- **A wanted refusal taken for a red**: the job is green only on the exact output, and the notice says what it does; this note and the
  pull request body say it too.
- **A revision of the tool that changes a line of the output**: the job reds until `VECTORS` follows, in the same lot; this is wanted
  (a revision held by the CI). IO-GUARD-POSED-FILES-1: measured equal (M4).
- **The checkout nested in the workspace**: an untracked folder; the tool's git calls read the history only (`guard_check.py` clones
  the repository's commits; `report_check.py` and `binom_check.py` read `207f021f`): green end to end with the nested clone (§4.3).
  Locally: the folder removed after the run.
- **A Python warning on stderr** would change the digest: red, closed; stderr is empty under FORM (M1, M4).
- **The published form of R1** (another path, other bytes): the switch measures again; nothing private is copied.
- **Confidentiality**: held by `vectorsProblems` (no run on bytes not pinned) and by §2.4.
- **CodeQL** on the changed workflow: not run here; it runs on the pull request (§13).

## 11. Decided by MONARK (`44764dc`, 2026-10-08)

- **Q-1, the input before R1: (a)**, the public vectors of 2026-10-02, taken by commit (`ffb5ea33`) and checked by sha256 before any
  check; (b) would publish R1 without a decision, (c) is set aside, (d) would delay L for no reason. Push allowed. MONARK: never a
  private byte in a job of `monark-governance`.
- **Q-2, the switch: yes**, the switch to R1's publication commit is the item's second step; the item stays open until then.
- **Q-3, section H until then: yes**, at the merge of E2 MONARK adds `vectors_check.py` on R1's vectors to his Windows replay (on his
  host, nothing published); until the switch he holds the 33 checks of `reason_order` by hand.
- **Q-4, `ci.yml` and the ADR: yes**, `ci.yml` is open to the lot. The first checkout of a second repository deserves a dated line
  under ADR-M003 D9, which MONARK writes himself before the merge: the pinned commit, `persist-credentials: false`, a public repository
  only.
- **Q-5, the bound of `within` (`vectors_check.py` l.25-29): an item**, not a mere mention: **VECTORS-WITHIN-BOUND-1**. Construction:
  a vector whose gap falls between 1e-12 and 1e-9, so that the mutant of `within` dies. Carrier: RECHERCHES (the spec). Trigger: the
  switch pull request, since the vectors change then. Not in this lot.
- **Q-6, the reviews: yes**, one G2 of the lot by a fresh instance, no skeptic unless an M finding.
- **Q-7, ETAT**: the item's line is MONARK's. The correction of l.416 of #247's G0 ("All its code runs") goes in the lot's documents:
  §1, and that line, rewritten in place.
- `scripts/oracle/run.mjs` stays as it is: the `CI_ONLY` entry already covers the driver.

## 12. Not verified

- The job on a GitHub runner before the pull request: the checkout by the action itself, its duration, the nested path; emulated here
  by a local clone at the commit (the pull request's run: §13).
- CodeQL's analyses of the changed workflow, before the pull request.
- Windows: the driver never runs there; MONARK's replays do not change (Q-3 adds `vectors_check.py` on R1's vectors at the merge of
  E2).
- The published form of R1 (path, bytes, commit) and the price of the switch (estimated).
- The bound's mutant on R1's file.
- That the governance CI logs read without an account: deduced from the repository's public visibility, not read on a log page.
