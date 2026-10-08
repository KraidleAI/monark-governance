# G0 — VERIFIER-TOOL-CI-1: the frozen verifier tool held by its own Python checks in CI, under one pinned CPython

- **Author**: RECHERCHES (`claude-opus-5-5`, effort max), 2026-10-07, from 22:26 UTC (`date -u`).
- **Demand**: MONARK `b9ecc64` (recherches, `coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-ioguard-v2-reponses.md` §1):
  of the two triggers, the first holds (the chantier G0, `docs/G0-lot-verifiers-list-f5a-1.md` §8 l.590-592: "before a second
  revision of `monark-kata-recalc` enters the list"); E2 of IO-GUARD-POSED-FILES-1 is that revision, so this item is **merged before
  that lot's list commit L**; about 55 lines; the step also runs the new `guard_check` cases as soon as they are on the trunk; the
  Windows cases are skipped there **and named**. Earlier: ETAT l.730-736 (one CPython 3.14 step, the action pinned by its commit
  SHA, run under Linux without series: `vectors_check`, `binom_check` (ii), (iii) and `--registry`, `compare_check`, `report_check`,
  and those of `tools/kata-quarter/`; before the freeze of c1a of CM-5); MONARK `3b54dd8` point 3 and `ab352b0` (Q-CM5-17: yes);
  RECHERCHES `cm5-v3` l.18 and l.47 ("one pinned Python step for both trees"), `cinq-relectures-recues` l.31. Then MONARK `6c268ee`
  (`…-MONARK-vers-RECHERCHES-ioguard-ci-porte.md`): **the step is a gate, not the proof** that event (2) of IO-GUARD-INSTALL-MASK-1
  names (§8).
- **Fold** (2026-10-08, from 01:29 UTC): the G2 of #247 (recherches `41fa442`, `G2-247-verifier-tool-ci.json`, six minor findings,
  CORRECTIONS) and MONARK's decisions `cc80585` (`…-MONARK-vers-RECHERCHES-247-decisions.md`, merged at `1a732d2`): m-1 and m-4 in
  this plan (§1); m-2 and m-3 in the driver, tests first (§6, §7.3); m-5, m-6 and Q-2 to Q-4 written as decided (§2, §5, §7.1,
  §12). The tool does not change.
- **Second fold** (2026-10-08, from 03:10 UTC): the delta G2 of #247 (recherches `6725ec4`, `G2-247-delta.json`, sha256
  `cc36bd7d…`, one minor finding, CORRECTIONS) and MONARK's decisions `3c5b01f` (`…-MONARK-vers-RECHERCHES-g2-deltas-decisions.md`,
  sha256 `348e68f2…`): m-7 by way (a), in the driver, tests first (§6, §7.4); n-8 is MONARK's own, the `CI_ONLY` entry before
  the G7 (§5, §12); of the optional notes, n-9, n-12 and n-13 are taken, n-10 and n-11 left (§7.4). The trunk moved to `e13cfff7`
  (#244, no file in common with this lot) and is merged in. Bases: trunk `e13cfff7`, recherches `8903074` (explicit refspecs). The
  tool does not change.
- **Bases read**: trunk `lot/etude-suite` = `5437cd0d` (explicit refspec); the tool's tree `tools/kata-recalc/` there is E1's
  (`d6c80e9d…`, twelve files); recherches `76b3121`, then `6156194`. The IO-GUARD plan v2
  (`coordination/pieces/2026-10-07-G0-io-guard-posed-files/G0-IO-GUARD-POSED-FILES-1.md`, sha256 `d2c44eae…`, 726 lines) and its
  G2 delta (`G2-io-guard-posed-files-G0-v2.json`, `d33ee50`: M-1 asks the step to follow the `FORM` line of `io_guard.py`).
- **No series byte read.** The checks read their fixtures only; the wave registry `apps/harness/data/kata/registry/wave1.json` is
  read by the tool, never printed.

## 1. What the job runs

One job, `g3-verifier-tool` (`.github/workflows/ci.yml` l.271-296), one run step: `node scripts/verifier-tool-ci.mjs` (the driver,
Node 24, no dependency). The driver launches each check of the tool as `python <FORM> <script> …`, in this order, and judges it:

| Check of the tool | How | Judged |
|---|---|---|
| `guard_check.py <repo> <work> <out>` | every case of the tree at the PR head, the cases IO-GUARD-POSED-FILES-1 adds included | exit 0, one `VERDICT: GREEN`, no `FAIL`, its `SKIP` lines exactly the closed list `WINDOWS_ONLY` (§4) |
| `report_check.py <repo> <work> <out>` | off Windows through `scripts/verifier-tool-ci-report-check.py`, section 3 stood in (below); on Windows as written | exit 0, one `VERDICT: GREEN`, no `FAIL`, and the two lines that only `report_check.main` writes after its checks (§6) |
| `compare_check.py <wave1.json> <work> <out>` | the comparator's 33 cases on the registry of the repository | the same |
| `binom_check.py --registry <wave1.json> <out>` | every k*, rank and U of the registry against the second writing | the same |
| `binom_check.py <repo> <out-binom> <out-hikae>` | D-2 (ii) the second writing, D-2 (iii) the hikae cases read by `git show 207f021f:…` | exit 0, two `VERDICT: GREEN` |
| `vectors_check.py` | **not run, named**: its input, the spec vectors of the frozen revision (R1, `7414b2fc…`), is in no repository the job reads | VERIFIER-TOOL-CI-VECTORS-1 (§12) |

- **Each run owed.** The five runs are a closed list, `OWED` in the driver: each check in each of its modes (the options it is
  given: `binom_check.py` runs twice, with `--registry` and without), with its count of `VERDICT: GREEN` lines. The accounting wants
  each in `steps()` once and no other run, so neither run of `binom_check.py` can be dropped unseen (m-2 of the G2; §6).
- **The modules** (`binom_exact.py`, `fdlibm_log.py`, `io_guard.py`, `kata_lib.py`) run through the checks; `compare_p2.py`,
  `recalc_p2.py` and `report.py` are entry scripts whose own runs read the series: they run here as modules and as children of
  `report_check.py` and `compare_check.py` (usage, refusals, the passes on synthetic walks, `report.run()` to its end).
- **Section 3 of `report_check.py` off Windows.** As written it stops there on Linux: `report.platform_fields` raises "the C library
  of log is located on Windows only (ucrtbase.dll)" (`report.py` l.115-116), uncaught, exit 1 (measured). The stand-in replaces that
  one function and adds one entry to `report.LIBMS`: a 48-byte library made by the run (a `VS_VERSION_INFO` resource, file version
  0.0.0.1, sha256 `349a0de7…`), read under the role `libm` as `ucrtbase.dll`, with the count of measured inputs where the host's log
  differs from the port (9 070 under glibc 2.39, as the G2 of the tool measured). The log names it: `platform: Windows-standin-0.0.0-
  SP0, standin`. Every other section runs as written; with the five checks of section 3, which read the stand-in's values, the run
  counts 75 checks, 75 green, as the G2's Linux pilot (`G2-tool-29c53bd5.json`; worded so since n-9 of the delta G2). Section 3
  itself is held on Windows only, by MONARK's replay by hand (§5). Because the stand-in sits outside the tool's tree, the driver
  wants the end of `report_check.main` in that run, by the check's name (§6): a stand-in that printed a verdict and exited before it
  would be refused.
- **One case of section 8 passes off Windows for another reason** (m-4 of the G2). "A run that cannot finish exits 2 and writes
  run-log.json only" launches `report.py` itself, which the stand-in does not reach: as written, it stops at its platform check,
  Windows only, before the missing series and vectors that the case names. Measured here (FORM, the runner's 3.14.8, the case's
  arguments, the wave registry as `--registry`): exit 2, `run-log.json` alone, its `refused` "the C library of log is located on
  Windows only (ucrtbase.dll); another system is not yet named", its `steps` `[]` (the G2 measured the same). The case is green on
  Linux without reaching the refusals it is written for; on Windows it reaches them, held there by MONARK's replay.
- **Both trees.** The driver reads `TREES` from `io_guard.py`. Today only `tools/kata-recalc` exists. A second tree present on disk
  reds the job ("a tree of the tool that this job does not run") until its checks join `steps()`: the lot of CM-5 that creates
  `tools/kata-quarter` (named by its role: c1a by the CM-5 G0, MONARK `1c41bd2`) adds them to `steps()` and `OWED`, and extends the
  accounting of `*_check.py` to that tree, in the same lot. A new `*_check.py` in the tool reds the job the same way until it joins
  `steps()` and `OWED`, or `NOT_RUN`.
- **Duration** (measured here, Ubuntu 24.04.4, glibc 2.39, the runner's own build of 3.14.8): guard 6 s, report 98 s, compare 8 s,
  registry 29 s, binom 73 s; 213 s for the driver. On the runner (PR 247, first run): guard 3 s, report 48 s, compare 3 s, registry
  15 s, binom 39 s; 108 s for the step, 116 s for the job.

## 2. The pinned Python

- `actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97 # v7.0.0` (`ci.yml` l.290): `git ls-remote
  https://github.com/actions/setup-python refs/tags/v7.0.0` gives that commit; fetched, `git cat-file -t` reads `commit` (a light
  tag), dated 2026-07-19, runtime `node24`. The provenance sits as a comment above the step (l.288-289), not in the file header,
  whose lines the killers of `ci.yml` anchor below.
- `python-version: "3.14.8"` (l.292): an exact release, no range, so `check-latest` and prereleases cannot choose another. 3.14.8 is
  the last 3.14 release in `actions/python-versions`' manifest on 2026-10-07 and the version of RECHERCHES' Linux replays of the tool.
  `runs-on: ubuntu-24.04` (l.278) names the image, so the build is `python-3.14.8-linux-24.04-x64` (tarball sha256 `fa74abc7…`, read
  here; setup-python checks no digest: the bytes are those the manifest entry serves). No other job sets up or runs a Python.
- **Checked at run time.** The driver asks the `python` on PATH for its implementation, version and release level and refuses
  anything but a final CPython 3.14; in the job the step names `VERIFIER_TOOL_PYTHON: "3.14.8"` (l.295) and the driver then refuses
  any other version (measured: 3.14.8 under the name 3.14.5, red). It prints `sys.version` and `sys.executable`. `io_guard` itself
  refuses a virtual environment and a debug build. The Node test holds the version of l.292 and of l.295 equal.
- Measured alternative: the runner's build of **3.14.5** (MONARK's host version): the five runs green, the oracle outputs byte-equal
  (`63606d4f…`, `68e16302…`, `9ae338f5…`). **Decided** (`cc80585` §3, Q-2): 3.14.8 in CI; MONARK's host keeps its 3.14.5 for his
  Windows replays, so two patch releases are covered.

## 3. The launch form

- The driver reads `FORM = (...)` from `io_guard.py` as text (one line at column 0, a tuple of one-letter options, else red) and
  launches every check under it: today `python -E -S -s -B`. No line of the job or the driver writes the form: when
  IO-GUARD-POSED-FILES-1 adds `-P` to `FORM` (its commit C), the job launches under `-E -S -s -B -P` with no change here (the fix the
  G2 delta of that plan names under M-1). Measured: `FORM` given `-P` without that lot's prologue, every check refused, red (§7).
- The stand-in already runs under both forms: it loads `io_guard.py` by its path (the prologue of that plan, §2.2) and drops its
  own folder from `sys.path` when `-P` is absent, so the tool's folder, last, is the only one that offers the tool's modules.

## 4. Windows-only cases: skipped and named

- `guard_check.py` skips a case whose subject the host lacks and writes `SKIP <case>: …`. Under the runner's build only
  `ntfs-stream` (Windows only) is skipped: the two extension cases, which the python-build-standalone build of the earlier Linux runs
  skipped, run here (`_json`, `_ctypes` and the others are `.so` files of `lib-dynload`). The closed list `WINDOWS_ONLY =
  ["ntfs-stream"]` (`scripts/verifier-tool-ci.mjs` l.21): off Windows the `SKIP` lines must name exactly it, on Windows none; any
  other set reds and names both sets.
- **Named in the output**: the case's own `SKIP` line in the log, then one annotation per name (`::notice::skipped: the case
  ntfs-stream of guard_check.py (Windows only)`), with `::notice::stood in: section 3 of report_check.py …` and `::notice::not run:
  vectors_check.py, …`.
- Rule for later lots: a case that a lot makes skip on Linux joins `WINDOWS_ONLY` in that lot; a case it makes skip on Windows (the
  FIFO part, or the link case without the privilege, in the IO-GUARD plan) joins a second closed list there, or the Windows replay
  reds (§5).

## 5. Where it sits

- **A job of its own, appended after `g3-site`**: the last killer anchor of `ci.yml` is l.267, so no anchor moves. A step appended
  to `r25-taille-de-lot` would move the anchors l.205 and l.267 (its token also reads more than this needs), one appended to
  `g3-export` the anchor l.267; `g3-verification` is kept in the public workflow, where the tool does not exist.
- **Internal**: `g3-verifier-tool` joins `INTERNAL_JOBS` (`scripts/export-public.mjs` l.450, rewritten in place, its killer text kept),
  so `derivePublicWorkflow` drops it: the tool is never exported, and a kept job would red on the mirror
  (`derived_workflow_run_paths_are_exported` would also refuse it). `DERIVED_HEADER` (l.449) names the dropped job.
- Steps: `checkout` (`fetch-depth: 0`: `git show 207f021f`, the tree at the commit of lot 1d, the partial clone of `guard_check`;
  `persist-credentials: false`: every git call of the tool is local), `setup-node` (`"24"`, the pinned SHA of the other jobs),
  `setup-python` (§2), the run step. No job-level token block (the root `contents: read`), no `if:`, no `continue-on-error`;
  `timeout-minutes: 11`: the job's first three runs, on PR 247, took 116 s, 201 s and 191 s (three runners), and the slowest x3 is
  603 s (15 at first, from the local 213 s, then measured on the runner, §11).
- **R-25**: `ci.yml`, `scripts/` and `test/` count; this G0 (`docs/**/*.md`) does not. Size in §10.
- **Required check** (**decided**, `cc80585` §5, Q-4): `g3-verifier-tool` joins the required checks of `lot/etude-suite`. Branch
  protection is a lasting setting of the repository: MONARK sets it at the merge of #247, after the founder's approval. Until then a
  red of this job does not block.
- **The local oracle** (**decided**, `cc80585` §4, Q-3; by whom and when, `3c5b01f`): the run line goes on the closed `CI_ONLY` list
  of MONARK's oracle (`scripts/oracle/run.mjs` l.25-31: five entries at `e13cfff7`, none for this line), so the oracle does not
  replay the driver on Windows. MONARK adds that entry himself, by a commit of his own on `lot/etude-suite`, **before the G7 of
  #247**, at the merge check and not after the merge, and he recounts and re-anchors himself the killers of `run.mjs` that it moves
  (they all sit below the list); this lot does not change that file. Before, because the oracle derives its gates from the `run:`
  lines of the tree it judges (`run.mjs` l.3): from the G7 of #247 on, that tree carries this run line, and an oracle without the
  entry would launch the driver on Windows without the pin (n-8 of the delta G2). MONARK's Windows replays of `guard_check.py` and of
  `report_check.py` (section 3 on the real `ucrtbase.dll`) stay by hand, under the tool's form, at each merge that touches the tool.
  In the job the driver refuses any interpreter but 3.14.8; the oracle reads `run:` lines only, so that pin would not reach it, and
  the driver would take the host's 3.14.5 there: the `CI_ONLY` entry keeps the driver out of the oracle either way.

## 6. Fail closed

Red, with an `::error::` line naming the cause: a platform other than Linux or Windows; no `python`, or not a final CPython 3.14, or
not the pinned version in the job; `FORM` or `TREES` not one well-formed line; the tool's tree absent, or a second tree present;
a `*_check.py` neither run nor named; a run of `OWED` absent from `steps()` or in it twice, or with another count of `VERDICT:
GREEN` lines, or a run that `OWED` does not name (m-2: the accounting by name alone let either run of `binom_check.py` go); any run
with an exit other than 0 (a signal or the 300 s bound per run included), fewer or more `VERDICT: GREEN` lines than wanted, a `FAIL`
or `VERDICT: RED` line, or a `SKIP` set other than the one named; a run of `report_check.py` without the two lines that only
`report_check.main` writes after its checks, `failures 0` and the input line of the C library of log that its section 3 read through
`io_guard` (`input libm ucrtbase.dll sha256 <64 hex> bytes <n>`: the stand-in's library off Windows, the system's on Windows), so
a stand-in that prints `VERDICT: GREEN` and exits before that main is red (m-3: it was green, the G2 measured it). Those two lines,
like the closed list of skips, are wanted by the check's name inside `outputProblems`, never handed to it by its caller: passed
along by `main()`, which no test runs, they could be lost by the deletion of one word, and that red turned green again (m-7 of the
delta G2, §7.4). A failed precondition runs no check. setup-python fails the job if it cannot install the exact version. The job
carries no `if:` and no `continue-on-error`; each run prints the check's own output and the sha256 of each output file.

## 7. Red proof

- **The step** cannot be judged by `red-proof.mjs`: its red is shown by the same command, `node scripts/verifier-tool-ci.mjs`, under
  the runner's build of 3.14.8, on a scratch checkout of this branch where one line of the tool is mutated (each mutant alone,
  never committed). Results: §7.1.
- **Node** (`test/verifier-tool-ci.test.ts`, four tests, and `export_public_derived_jobs_are_byte_identical` in
  `test/export-public.test.ts`): the four are new-module at the base (the driver does not exist there), the export test is red at the
  base by assertion (the job is absent). They hold the job's text (the image, the history, the pinned action, one exact version that
  the step names again, the driver last, no `if:`, dropped from the public workflow), the driver's rules on fixtures (the form and
  the trees of `io_guard.py`, the accounting, the interpreter, the skips, the verdicts), and the stand-in's reach (two names of
  `report.py`, `io_guard.py` run by its path first, `report_check.main` once). red-proof results: §7.2.
- **The fold** (m-2, m-3) adds two tests to that file, in a commit of their own, red there by assertion: the driver of `4158c0ff`
  ignores the runs it is given and the lines it is asked for. Then the driver. red-proof with `--base 4158c0ff`, and the step's own
  command against two more mutants (the stand-in that exits before `report_check.main`; a run deleted from `steps()`): §7.3.
- **The second fold** (m-7) rewrites two tests of that file first, each red by assertion against the driver of `bef77851`, then moves
  the end of `report_check.main` into `outputProblems`. red-proof with the merge of the trunk as its base, the mutation campaign on
  the file's killers, mutants by hand, and `main()` driven end to end under the delta G2's stand-in `python`: §7.4.

### 7.1 The step against mutated copies of the tool

Each run: `node scripts/verifier-tool-ci.mjs` with `VERIFIER_TOOL_PYTHON=3.14.8`, under the runner's build of 3.14.8 (installed here
from the tarball setup-python downloads, `LD_LIBRARY_PATH` set as setup-python sets it), in a scratch clone (`git clone --shared`) at
the trunk `5437cd0d` with the three files of the driver of this branch (the tool there is this branch's: it is not changed). One
change per clone, applied by a script that requires the old text once on its line and prints both digests; never committed.

| Clone | Change | Exit | The job's first `::error::` lines |
|---|---|---|---|
| m0 | none (control) | 0 | none: `GREEN`, 293 s (four runs side by side) |
| m1 | `io_guard.py:314` `if name not in NATIVE:` -> `if False:` | 1 | `guard_check.py: FAIL import-extension-outside-list: exit 0 (want 4): LOADED _ctypes` |
| m2 | `report.py:88` `if not v.isascii():` -> `if False:` | 1 | `report_check.py: FAIL canonical refuses a non-ASCII string` |
| m3 | `compare_p2.py:75` `1e-12 *` -> `1e-9 *` | **0** | none: survives (finding below) |
| m3b | `compare_p2.py:75` `1e-12 *` -> `1e-8 *` | 1 | `compare_check.py: FAIL case 03 float calib.qhat x (1 + 1e-9), beyond the contract`; `report_check.py: FAIL case 08 …` |
| m4 | `binom_exact.py:113` `return k` -> `return k + 1` | 1 | `binom_check.py: FAIL k* n 6 alpha 0.45 delta 0.05 A 1 B 0`; `report_check.py: FAIL reason of a down-side direction cell …` |
| m5 | `guard_check.py:344` the case `residual-stat` added to the skipped ones | 1 | `guard_check.py: skipped [ntfs-stream, residual-stat], [ntfs-stream] wanted` (the tool alone: `skipped 2, failures 0`, `VERDICT: GREEN`) |
| m6 | none; `VERIFIER_TOOL_PYTHON=3.14.5` | 1 | `CPython 3.14.8, not the pinned 3.14.5` (no check runs) |
| m7 | `tools/kata-quarter/quarter_counts.py` posed | 1 | `tools/kata-quarter: a tree of the tool that this job does not run` (no check runs) |
| m8 | `io_guard.py:48` `FORM` gains `"-P"` (the prologue of IO-GUARD-POSED-FILES-1 absent) | 1 | every run red: the entry scripts `ModuleNotFoundError: io_guard`, the stand-in refused by the guard (`safe_path True`) |

Logs (sha256, first 16): m0 `627122fe…`, m1 `3d446656…`, m2 `c8e0c36f…`, m3 `30663783…`, m3b `c44a17bd…`, m4 `e2f735e6…`, m5
`787bb2a2…`, m6 `b1427629…`, m7 `aa93ed34…`, m8 `fcecd223…` (they carry local paths).

**Finding, on the frozen tool (not this lot's to change):** its comparator's contract, relative 1e-12 (`compare_p2.py` l.75), is held
from outside by changes of 1e-9 at the closest (`compare_check.py` l.68-69, case 03, and `report_check.py` l.183-184, case 08; the
others are at 1e-6, l.89-94), and from inside by 1e-13 (l.70-71). A contract widened to 1e-9 passes them all: `fl(1 + 1e-9)` exceeds
1 + 1e-9 by about 8e-17, so the 1e-9 change still lands just beyond a 1e-9 bound (m3). A widening to 1e-8 reds (m3b). A case at
1e-11 would pin the contract within a factor of ten; it would be a new revision of the tool, so a new list entry. Confirmed by the
G2 (m-6: the mutant run again, green in 225 s, `compare.txt` and `report.txt` byte-equal to its control; the 1e-9 change lands beyond
a 1e-9 bound for about 97.6 % of drawn values). **Decided** (`cc80585` §2, m-6): the new case of `compare_check.py` is folded into
IO-GUARD-POSED-FILES-1, not here: a change of 2e-12 or 1e-11, never equal to a plausible bound, separates 1e-12 from 1e-9; one
revision of the tool, one E2 entry, whose plan drops its sentence on the unchanged output of `compare_check.py`. This job, on the
trunk before that plan's L, runs the case on E2's pull request.

### 7.2 red-proof

`node scripts/red-proof.mjs --base 5437cd0d --gel 5d03eea5 --draw 5 --seed 20261007`: OK, 5 judged, 3 unchanged, 5 killers drawn,
5 killed. Judged: the four tests of `test/verifier-tool-ci.test.ts`, new-module at the base (`import-fail`: the driver is absent),
green at the gel; `export_public_derived_jobs_are_byte_identical`, F2P (red at the base by assertion: "internal job
'g3-verifier-tool' missing from the source workflow"). `RED-PROOF.json` sha256 `fa46c230…` (it carries paths and the hour).
Red first, by hand: at the commit of the tests alone (`49ab28db`), in a clean clone, the same two files: the new file cannot load
(`ERR_MODULE_NOT_FOUND … scripts/verifier-tool-ci.mjs`), and the export test fails on the assertion above. The killer that this lot
leaves second above the export test (`", \"g3-export\"]" -> "]"`, DERIVE for `verifie-ancres.mjs`) still kills it at the head: "internal
job 'g3-export' must be dropped from the derived public workflow".

### 7.3 The fold: each run owed, the end of `report_check.main`

- **Tests first** (`test/verifier-tool-ci.test.ts`): `verifier_tool_driver_owes_each_run_of_each_check` (each of the five runs
  dropped, doubled or judged on another count of `VERDICT: GREEN` lines is refused by `accountProblems`; `steps()` pinned whole, on
  both systems, as check, script, options and count) and `verifier_tool_driver_wants_the_end_of_report_check_main` (a run of
  `report_check.py` that prints `VERDICT: GREEN` alone is refused by `outputProblems`, the end of `report_check.main` as the job's log
  shows it passes, the same two lines wanted on Windows, none from the four runs of the tool's own files). Both call the driver's
  existing exports only, so at the base they load and fail by assertion.
- **The step** against two more mutants, by §7.1's command: m9, the stand-in prints `VERDICT: GREEN` and exits before
  `report_check.main`; m10, the D-2 run deleted from `steps()`. Both pass the driver of `4158c0ff` (the G2 measured its rules on
  them), and both must red the driver of the fold.

Results (Linux, Node 24.21.0, the runner's build of 3.14.8):

- **Red first, by hand**: at `cfc1654a` (the tests alone; the tree of that commit), `node --test test/verifier-tool-ci.test.ts`:
  6 tests, 4 pass, the two new ones fail by `ERR_ASSERTION`, the driver returning `[]` for both ("D-2 (ii) and (iii) dropped:
  binom_check.py is still run, by --registry"; "a verdict printed before report_check.main ran: refused"). TAP `f62273d7…`.
- **red-proof**: `node scripts/red-proof.mjs --base 4158c0ff --gel 2bac3033 --draw 2 --seed 20261008`: OK, 2 judged (both F2P, red
  at the base by assertion, green at the gel), 4 unchanged, 2 killers drawn (`:36 CONST`, `:39 SDL`), 2 killed. `RED-PROOF.json`
  sha256 `f2d706ac…` (it carries paths and the hour).
- **The other killers, fired by hand** at `2bac3033`, each alone, the file restored and its sha256 checked: `:71` and `:72` red the
  first new test, `:87` and `:31` the second, `:69` and `:86` (moved) their own tests; each by assertion, no other test red.
- **The step**, by §7.1's command, in scratch clones (`git clone --shared`) at `4158c0ff` (before) and `2bac3033` (after), one
  change per clone, applied by a script that requires the old text once on its line and prints both digests:

| Clone | Change | Exit | The job's `::error::` lines |
|---|---|---|---|
| c0 | none, at `2bac3033` (this worktree) | 0 | none: `GREEN`, 242 s; `report.txt` `409e589e…`, `compare.txt` `e8dc7928…`, `binom.txt` `63606d4f…` and `hikae.txt` `68e16302…`, equal to the CI's (§11); `registry.txt` `9ae338f5…`, equal to the earlier local runs (§2), not to the CI's `7f34eda7…`: it names the registry by its path, as `guard.txt` names its work folder; the report run ends with `failures 0` and `input libm ucrtbase.dll sha256 349a0de7… bytes 48` |
| b-m9 | `scripts/verifier-tool-ci-report-check.py:46` gains `print("VERDICT: GREEN"); sys.exit(0);` before `report_check.main` (`376ba838…` -> `998dca6e…`), at `4158c0ff` | **0** | none: `GREEN`, 147 s; the report run prints `VERDICT: GREEN` alone (13 s) and writes no `report.txt` |
| a-m9 | the same, at `2bac3033` | 1 | `report_check.py: no line /^failures 0$/, which the check's own main writes after its checks`, and the same for the input line |
| b-m10 | `scripts/verifier-tool-ci.mjs:30`, the D-2 run, emptied (`f57977fe…` -> `46d911c6…`), at `4158c0ff` | **0** | none: `GREEN`, 168 s, four runs |
| a-m10 | `scripts/verifier-tool-ci.mjs:39`, the same run, emptied (`86cc2892…` -> `c44dbec7…`), at `2bac3033` | 1 | `binom_check.py (2 VERDICT: GREEN): a run that this job owes once, run 0 time(s)` (0 s, no check runs) |

Logs (sha256, first 16): c0 `e38a1693…`, b-m9 `b3dd9487…`, a-m9 `2934554e…`, b-m10 `52ce38f2…`, a-m10 `952ceb2b…` (they carry
local paths). The runs of b-m9, b-m10 and c0 overlapped in part, on four cores.

### 7.4 The second fold: the end of `report_check.main` by the check's name

m-7 of the delta G2 (`6725ec4`): the rule of §6 reached the run of `report_check.py` only through `main()`, which took `REPORT_END`
from a fifth field of `steps()` and passed it on to `outputProblems` (l.107 and l.109 at `bef77851`). The tests judged
`outputProblems` on fixtures with that list in hand, and no test runs `main()`: deleting `, ends` from the call kept the six tests
green and gave the job back the green that m-3 had measured (the G2's H1 and E2). Way (a), decided (`3c5b01f`): `outputProblems`
derives the list from the check's name, `const ends = check === "report_check.py" ? REPORT_END : [];` (l.87), as it derives the
skips (l.85); `steps()` loses its fifth field, `main()` its argument, `verifier-tool-ci.d.mts` both. No wire is left to lose: `main()`
hands `outputProblems` the check's name from `steps()`, the name that the accounting (`OWED`) and tests 2 and 3 already pin. Lines 1
to 86 of the driver keep their place, so no other killer moves.

- **Tests first, in two commits.** `6272a26d`: test 6 calls `outputProblems` with the arguments that `main()` passes and nothing
  more, on both systems, and wants nothing more of the three other checks. `f303691e`: in test 4, a skip in `report_check.py` is
  refused beside the two lines that its fixture lacks. Against the driver of `bef77851` each fails on its first changed assertion by
  `ERR_ASSERTION` (that driver returns `[]` for the two lines: it wants them only when its caller passes them), the four other tests
  pass, and `every_killer_line_is_readable` stays green: the killers of test 6 move with the driver, in `a44aa80d`. TAP `42f84cd8…`
  (at `6272a26d`: 5 pass, 1 fail) and `6bc49cfe…` (at `f303691e`: 4 pass, 2 fail); at `a44aa80d`, this file, `export-public` and
  `killer-lines`: 11 tests, 11 pass (`2c2d11e9…`).
- **red-proof**: `node scripts/red-proof.mjs --base d489b09d --gel a44aa80d --draw 2 --seed 20261008` (its base the merge of the
  trunk, so that this fold alone is judged), 03:33:16Z to 03:33:28Z: OK, 2 judged (tests 4 and 6, F2P: `assert-fail` at the base,
  `pass` at the gel), 4 unchanged, 2 killers drawn (`:86 CONST`, `:87 CONST`), 2 killed. `RED-PROOF.json` `2e429b3d…` (it carries
  paths and the hour).
- **Mutation campaign**: `node scripts/mutants/run.mjs --killers --base d489b09d`, on the shared lock `F:/tmp`, to 03:33:54Z: the 10
  killers of the test file, 10 killed by assertion, no survivor, no inconclusive, no anchor lost; `:88` and `:31`, in the body of
  test 6, now red tests 4 and 6. `RESULTS.json` `f8ad7c97…`.
- **By hand**, each mutant alone against the whole test file (the G2's `mutate.mjs`, `240e8527…`: the old text once on its line, else
  refused), restored by `git checkout`, the tree checked clean; then `main()` driven under the G2's stand-in `python` (`fakepy/python`,
  Node, `518d75a8…`: no Python runs, each check gets a fixed output, the report run `VERDICT: GREEN` alone), with
  `VERIFIER_TOOL_PYTHON=3.14.8`:

| Mutant | Change | Tests | `main()`, the report run ending early |
|---|---|---|---|
| none | | 6 of 6 | `RED, 2 problem(s)`, the two lines named, exit 1 (E1, `6e00370f…`); with the full end of the main, `GREEN` (E0, `c0dbabf8…`): both byte-equal to the G2's E1 and E0 |
| N1 | l.87 `check === "report_check.py" ? REPORT_END : []` -> `[]` (the killer) | tests 4 and 6 red, by assertion | `GREEN` (`b416ee0a…`, byte-equal to the G2's E2 under H1): the job alone still cannot see it; the tests now do |
| N2 | l.87 `? REPORT_END : []` -> `? [] : REPORT_END` | 4 and 6 | `RED, 8 problem(s)` |
| N3 | l.87 `check === "report_check.py"` -> `true` | 4 and 6 | `RED, 10 problem(s)` |
| N4 | l.87 `"report_check.py"` -> `"report_check"` | 4 and 6 | `GREEN` |
| N5 | l.36, the run's name in `steps()`, `"report_check.py"` -> `"report_check"` | 2 and 3 | `RED, 3 problem(s)` before any run: the accounting |
| N6 | the G2's H1, `, ends` out of `main()`'s call (l.109 then, l.110 now), and its H2, out of the loop (l.107 then, l.108 now) | refused: the text is gone | |
| N7 | `, win` out of `main()`'s call (l.110) | 6 of 6 | `RED, 2 problem(s)`, byte-equal to E1: `win` is false off Windows, so the mutant is inert on Linux, the one system where the driver runs (§5) |

TAP (sha256, first 16) of N1 to N5 and N7: `0e5d1b40…`, `8926ba89…`, `ccc793b6…`, `d24d0b00…`, `95797ce1…`, `bf183991…`; the
drives of N2, N3, N4, N5: `1cee6687…`, `78a1bbb9…`, `b416ee0a…`, `2641275d…`. The drives carry no path and no time.

- **The optional notes of the delta G2.** n-9 taken: §1 and the PR body say that the 75 checks include the five of section 3, which
  read the stand-in's values. n-12 taken: the anchors of this fold are read on the two touched test files against `e13cfff7` and
  `bef77851`, the trunk and the previous head, never the head under judgment (§11). n-13 taken: `d489b09d` merges the trunk
  `e13cfff7` into the branch, so the CI of this push runs on the merged tree. n-10 left: a stand-in that forges the two lines itself
  stays visible in its 46 lines, and a textual ban of `print`, `sys.exit` and `os._exit` before its last line would leave other exits
  open (`raise SystemExit`, `os.write`): a partial rule, not a closure. n-11 left: it predates the delta; the scripts of the runs are
  pinned whole by test 3, and a test of the accounting's call in `main()` (l.103 now) needs `main()`'s judgment exported, way (b),
  which the decision did not take; the job itself holds the tree and check cases (§7.1, m7). n-8 is MONARK's (§5).

## 8. IO-GUARD-INSTALL-MASK-1

Decided by MONARK (`6c268ee`): the job is a gate. It runs the tool and its cases under a pinned Python, on a clean install of the
runner; it reads no installation that someone posed. Event (2) of that item's trigger is the day a result of this job would be cited,
in a public text or a report, as proof that a recompute run is intact. Nothing here cites it so.

## 9. Killers (`// killer: file:line OP "before" -> "after"`, each right above its test)

- `test/verifier-tool-ci.test.ts`: `.github/workflows/ci.yml:292 CONST "python-version: \"3.14.8\"" -> "python-version: \"3.14\""`
  (a range); `scripts/verifier-tool-ci.mjs:69 CONST "present[t] !== (t === TOOL)" -> "t === TOOL && !present[t]"` (a second tree
  admitted); `scripts/verifier-tool-ci.mjs:86 CONST "[...skipped].sort().join() !== [...expected].sort().join()" ->
  "skipped.some((c) => !WINDOWS_ONLY.includes(c))"` (a skip on Windows, or none off it, admitted);
  `scripts/verifier-tool-ci-report-check.py:45 CONST "report.platform_fields = platform_fields" -> "report.platform_fields =
  report.tree_digest = platform_fields"` (one more name of the tool stood in). The first two were l.56 and l.70 before the fold: the
  same text, moved down by `OWED`, `REPORT_END` and the accounting of runs.
- The fold's two tests: `scripts/verifier-tool-ci.mjs:39 SDL "join(w, \"hikae.txt\")" -> ""` (the D-2 run dropped from `steps()`)
  above the first, and in its body `:71 CONST "times(o) !== 1" -> "times(o) === 0"` (a doubled run admitted) and `:72 SDL "a run
  that this job does not owe" -> ""` (another count admitted); above the second, since the second fold,
  `scripts/verifier-tool-ci.mjs:87 CONST "check === \"report_check.py\" ? REPORT_END : []" -> "[]"` (the end of `report_check.main`
  no longer wanted of that check; it replaces `:36 CONST ", 1, REPORT_END]" -> ", 1]"`, whose field is gone), and in its body
  `:88 CONST "!lines.some(" -> "lines.some("` (`:87` before the new line) and `:31 CONST "/^failures 0$/, " -> ""`. red-proof draws
  the line above each test; the others are fired by hand (§7.3) and by the mutation campaign (§7.4).
- `test/export-public.test.ts`: `scripts/export-public.mjs:450 CONST "\"g3-verifier-tool\", " -> ""` (the job kept in the public
  workflow), right above the test; the earlier killer of that line (`", \"g3-export\"]" -> "]"`) stays above it, its text on the line
  once: `verifie-ancres.mjs` reads it DERIVE (its line is the one this lot rewrites), anchored for red-proof.

## 10. Size

In the CI form (`node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base origin/lot/etude-suite`, evaluated,
then `git diff --shortstat 5437cd0d...HEAD` on the pathspec of `ci.yml` l.100): **353** changed lines at the fold, 7 files, 347
insertions and 6 deletions (299 before it: the fold adds 100 changed lines, 54 net); the content count 0. Under 547 (the bound of a
lot) and 1 205 (the bound of the CI). Above the ~55 of the item: the job is 27 lines, and the driver (124), its types (11), the
stand-in (46) and the tests (131) make the step fail closed and judgeable. This plan, under `docs/`, is not counted. At the second
fold, against `origin/lot/etude-suite` = `e13cfff7` (the merge base after `d489b09d`), by the G2's `r25.mjs` (the pin's lines parsed
in Node, the pathspec read from `ci.yml`): **356** changed lines, 7 files, 350 insertions and 6 deletions (the driver 125 lines, one
more; the tests 133, two more); the content count 0.

## 11. At the freeze

- **Heads**: trunk `5437cd0d`; branch `recherches/verifier-tool-ci-1`: `e96f9ba8` (this plan), `49ab28db` (the tests, red),
  `5d03eea5` (the job, the driver, the stand-in, the export), then the commit that writes these results into this plan;
  recherches `6156194`.
- **Gates at `5d03eea5`** (Linux, Node 24.21.0): `npx tsc --noEmit` 0; `eslint` on `test/verifier-tool-ci.test.ts` and
  `test/export-public.test.ts` 0; `gate:vocab` OK (349 files); `lang:gate` OK; `lint:ratchet` 69/69; `export:check` OK; winlint, the
  seven files, no hazard; `npm run test:main`: 2 929 tests, 2 907 pass, 0 fail, 22 skipped (547 s); `every_killer_line_is_readable`
  green; `verifie-ancres.mjs . --ref origin/lot/etude-suite` (it reads tracked files): 1 648 killers, the four of the new test file
  included, 1 647 ANCRE, 1 DERIVE (§9), 0 PERDU; on the two touched test files, 7 killers, 6 ANCRE, 1 DERIVE.
- **The list of 1f**: nothing under `tools/kata-recalc/`, nor `apps/harness/data/verifiers.json`, nor
  `apps/harness/src/policy-verifiers.ts` changes (`git diff --stat 5437cd0d..HEAD` on these paths, empty); the tree tests
  `kata_recalc_tree_is_the_pinned_manifest` and `verifier_tool_tree_is_the_listed_tree` are green: no list commit.
- **The PR's run** (PR 247, head `d1022a35`, run 37704705811, read online): the eight jobs green. `g3-verifier-tool` (job
  113076186570): setup-python "Successfully set up CPython (3.14.8)" from the image's tool cache; the driver printed `python: 3.14.8
  (main, Oct  1 2026, 02:38:33) [GCC 13.3.0] at /opt/hostedtoolcache/Python/3.14.8/x64/bin/python; pinned by the job: 3.14.8` (the
  build measured here); `guard_check.py` "cases 43 and the homonyms, skipped 1, failures 0" (the two extension cases ran,
  `ntfs-stream` skipped); `report_check.py` 75 green through the stand-in, its output `409e589e…` equal to the local one;
  `compare_check.py` 33 cases; `binom_check.py --registry` 1 680 checks; `binom_check.py` 16 821 checks, 207 756 assertions, its
  outputs `63606d4f…` and `68e16302…`; the three notices (skipped, stood in, not run); "verifier tool checks under python -E -S -s -B:
  GREEN". `g3-verification`: 2 929 tests, 2 907 pass, 0 fail, 22 skipped. `r25-taille-de-lot`: "Changed lines: 299 (ADR bound:
  1205)", content 0, mode written. `g3-export` green: the public export, its own CI included, with the job dropped. Then the bound
  of §5, set from the runs of `2c7091ba` (201 s) and `032ffb68` (191 s, run 37705257088, eight jobs green) too, the step 183 s there.

- **At the fold** (2026-10-08): branch `recherches/verifier-tool-ci-1` at `4158c0ff`, then `cf77b58f` (this plan, the review and
  the decisions folded), `cfc1654a` (the two tests, red), `2bac3033` (the driver, its types, the step's name), then the commit that
  writes these results; trunk `5437cd0d`; recherches `1a732d2`. Gates at `2bac3033` (Linux, Node 24.21.0): `npx tsc --noEmit` 0;
  `eslint` on the two test files 0 errors (the `scripts/` files are ignored by its configuration); `gate:vocab` OK (349 files);
  `lang:gate` OK; `lint:ratchet` 69/69; `export:check` OK; winlint `--base 5437cd0d`, 8 files, no hazard; `npm run test:main`:
  2 931 tests (the two new ones included), 2 909 pass, 0 fail, 22 skipped, 304 s; `every_killer_line_is_readable` green; `verifie-ancres.mjs . --ref origin/lot/etude-suite`: 1 654 killers, 1 653 ANCRE, 1 DERIVE
  (the same as §9, `scripts/export-public.mjs:450`), 0 PERDU; on the two touched test files with `--ref origin/lot/etude-suite --ref
  origin/recherches/verifier-tool-ci-1`, 13 killers, 13 ANCRE. Nothing under `tools/kata-recalc/`, nor `verifiers.json`, nor
  `policy-verifiers.ts` changes.
- **The PR's run at the fold** (head `817e0760`, run 37715666825, read online): 12 of 12 checks, the eight jobs, CodeQL and its three
  analyses. `g3-verifier-tool` (job 113111438695), 194 s: the checkout removes its credentials; setup-node finds 24.21.0;
  setup-python "Successfully set up CPython (3.14.8)"; the driver prints `python: 3.14.8 (main, Oct  1 2026, 02:38:33) [GCC 13.3.0]
  at /opt/hostedtoolcache/Python/3.14.8/x64/bin/python; pinned by the job: 3.14.8`; guard 3 s ("cases 43 and the homonyms, skipped
  1, failures 0", `ntfs-stream` skipped, the two extension cases run), report 90 s (its end: `failures 0`, then `input libm
  ucrtbase.dll sha256 349a0de7… bytes 48`; `report.txt` `409e589e…`), compare 5 s (33 cases, `e8dc7928…`), registry 25 s (280
  rows, 1 680 checks), binom 62 s (16 821 checks; 24 tests, 207 756 assertions; `63606d4f…`, `68e16302…`); the three notices;
  "verifier tool checks under python -E -S -s -B: GREEN". `g3-verification`: 2 931 tests, 2 909 pass, 0 fail, 22 skipped.
  `r25-taille-de-lot`: "R-25 mode: written", "Changed lines: 353 (ADR bound: 1205)", "Content changed lines: 0".
- **At the second fold** (2026-10-08): branch `recherches/verifier-tool-ci-1` at `bef77851`, then `d489b09d` (the merge of the trunk
  `e13cfff7`, a merge commit, its tree `ddb1d571` the one the delta G2 posed), `6272a26d` and `f303691e` (the tests, red),
  `a44aa80d` (the driver, its types, the killers that move), then the commit that writes this; recherches `8903074`. Gates at
  `a44aa80d` (Linux, Node 24.21.0): `npx tsc --noEmit` 0; `eslint` on the test file and the two driver files, 0 errors (the
  `scripts/` files ignored by its configuration); `gate:vocab` OK (349 files); `lang:gate` OK; `lint:ratchet` 69/69; `export:check`
  OK; winlint `--base e13cfff7`, 8 files, no hazard; `npm run test:main` (a second worktree at `a44aa80d`): 2 932 tests (one more
  from #244), 2 910 pass, 0 fail, 22 skipped, 261 s; `every_killer_line_is_readable` green at each of the four commits;
  `verifie-ancres.mjs . --ref e13cfff7`: 1 669 killers (the 15 of #244 included), 1 668 ANCRE, the one DERIVE of §9, 0 PERDU; on the
  two touched test files against `e13cfff7` and `bef77851` alone (n-12), 13 killers, 13 ANCRE. Nothing under `tools/kata-recalc/`,
  nor `apps/harness/data/verifiers.json`, nor `apps/harness/src/policy-verifiers.ts` changes (by git object, the same at `5437cd0d`,
  `e13cfff7`, `bef77851` and `a44aa80d`: the tool's tree `10e6f04d`, `verifiers.json` `918b0713`, `policy-verifiers.ts` `00fdced6`).

## 12. Decided by MONARK (`cc80585`, then `3c5b01f`, 2026-10-08)

- **m-5, Q-1 `vectors_check.py`: item VERIFIER-TOOL-CI-VECTORS-1, formed**, carrier RECHERCHES. Trigger: the publication of R1 in
  the public spec repository (`KraidleAI/monark-kata-spec`), or the list commit L of IO-GUARD-POSED-FILES-1, whichever comes first:
  E2 changes `vectors_check.py` (the prologue of its entry scripts), and no CI step runs that file today (`NOT_RUN` here; off
  Windows the `report.py` children of `report_check.py` stop before their vectors oracle, §1). The form proposed here: the job
  fetches `vectors.json` at its commit, checks its sha256 before `vectors_check.py` runs, and drops it from `NOT_RUN`, ~6 lines;
  copying the R1 vectors into this repository would publish them, MONARK's decision. **State today, as evidence** (it does not
  replace the item): the frozen `vectors_check.py`, under `FORM` and the runner's 3.14.8, on the public vectors at `ffb5ea33` (the
  spec repository's head by `git ls-remote`; `vectors.json` sha256 `06ecf06909e39d67…`, 127 681 bytes, extracted from git into a
  fresh folder, its bytes never shown): "conformance checks on vectors.json: 333 (KATA-SPEC section 6 counts 363), failures 0", then
  one `FAIL` line, the expected refusal on the count (`[count] 333 conformance checks KATA-SPEC section 6 counts 363`), `VERDICT: RED`,
  exit 1. All its code runs and its 333 conformance checks pass; stdout sha256 `c05f8cc19bcbd3e3…`, the G2's byte for byte.
- **m-6** the tolerance case: in IO-GUARD-POSED-FILES-1 (§7.1).
- **Q-2** the version: 3.14.8 (§2).
- **Q-3** the oracle: `g3-verifier-tool` on the `CI_ONLY` list of MONARK's oracle, the entry added by MONARK's own commit on the
  trunk before the G7 of #247, the killers of `run.mjs` that it moves recounted and re-anchored by him (`3c5b01f`, n-8 of the delta
  G2); the Windows replays of `guard_check.py` and `report_check.py` by hand (§5).
- **Q-4** the required checks: `g3-verifier-tool` required on `lot/etude-suite`, set by MONARK at the merge after the founder's
  approval (§5).
- **m-7 of the delta G2** (`3c5b01f`): way (a), folded before the merge request, with its killer (§6, §7.4); n-9 to n-13 at the
  author's choice (§7.4).

## 13. Not verified here

The Windows side, which MONARK replays by hand (§5): `report_check.py` section 3 on the real `ucrtbase.dll`, the failed-run case of
section 8 reaching its own refusals (§1), `guard_check.py` with nothing skipped; the driver itself on Windows (CI only, §5: its
`win32` branch, the cleanup of its work directory under a read-only pack of the partial clone) is never run. `vectors_check.py`
(VERIFIER-TOOL-CI-VECTORS-1, §12). The `CI_ONLY` entry of MONARK's oracle (MONARK, by his own commit before the G7 of #247, §5)
and the required-check registration (MONARK, at the merge). Off Windows, `main()` of the driver is run end to end only under the
delta G2's stand-in `python` (§7.4) and by the job itself; no test runs it.
