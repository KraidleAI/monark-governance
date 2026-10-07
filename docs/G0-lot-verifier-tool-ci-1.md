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
| `report_check.py <repo> <work> <out>` | off Windows through `scripts/verifier-tool-ci-report-check.py`, section 3 stood in (below); on Windows as written | exit 0, one `VERDICT: GREEN`, no `FAIL` |
| `compare_check.py <wave1.json> <work> <out>` | the comparator's 33 cases on the registry of the repository | the same |
| `binom_check.py --registry <wave1.json> <out>` | every k*, rank and U of the registry against the second writing | the same |
| `binom_check.py <repo> <out-binom> <out-hikae>` | D-2 (ii) the second writing, D-2 (iii) the hikae cases read by `git show 207f021f:…` | exit 0, two `VERDICT: GREEN` |
| `vectors_check.py` | **not run, named**: its input, the spec vectors of the frozen revision (R1, `7414b2fc…`), is in no repository the job reads | Q-1 |

- **The modules** (`binom_exact.py`, `fdlibm_log.py`, `io_guard.py`, `kata_lib.py`) run through the checks; `compare_p2.py`,
  `recalc_p2.py` and `report.py` are entry scripts whose own runs read the series: they run here as modules and as children of
  `report_check.py` and `compare_check.py` (usage, refusals, the passes on synthetic walks, `report.run()` to its end).
- **Section 3 of `report_check.py` off Windows.** As written it stops there on Linux: `report.platform_fields` raises "the C library
  of log is located on Windows only (ucrtbase.dll)" (`report.py` l.115-116), uncaught, exit 1 (measured). The stand-in replaces that
  one function and adds one entry to `report.LIBMS`: a 48-byte library made by the run (a `VS_VERSION_INFO` resource, file version
  0.0.0.1, sha256 `349a0de7…`), read under the role `libm` as `ucrtbase.dll`, with the count of measured inputs where the host's log
  differs from the port (9 070 under glibc 2.39, as the G2 of the tool measured). The log names it: `platform: Windows-standin-0.0.0-
  SP0, standin`. Every other section runs as written: 75 checks, 75 green, as the G2's Linux pilot (`G2-tool-29c53bd5.json`). Section
  3 itself is held on Windows only, by MONARK's replay (and by the oracle, §5).
- **Both trees.** The driver reads `TREES` from `io_guard.py`. Today only `tools/kata-recalc` exists. A second tree present on disk
  reds the job ("a tree of the tool that this job does not run") until its checks join `steps()`: the lot that creates
  `tools/kata-quarter` (c1d of CM-5) adds them in the same lot. A new `*_check.py` in the tool reds the job the same way until it
  joins `steps()` or `NOT_RUN`.
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
  (`63606d4f…`, `68e16302…`, `9ae338f5…`). Q-2.

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
  `timeout-minutes: 6`: the job's first run, on PR 247, took 116 s (the step 108 s), x3 is 348 s (15 at first, from the local 213 s,
  then measured on the runner, §11).
- **R-25**: `ci.yml`, `scripts/` and `test/` count; this G0 (`docs/**/*.md`) does not. Size in §10.
- **Required check**: a new job reds without blocking until MONARK adds `g3-verifier-tool` to the required status checks, as for
  `g3-site`. Q-4.
- **The local oracle** (`scripts/oracle/run.mjs` l.3-7, l.25-31): every `run:` line outside its closed `CI_ONLY` list is a gate, so
  `node scripts/verifier-tool-ci.mjs` becomes a gate of MONARK's oracle on Windows. There `VERIFIER_TOOL_PYTHON` is absent (the oracle
  reads `run:` lines only): the driver wants a final CPython 3.14 named `python` on the PATH of the oracle's bash, runs
  `report_check.py` as written (section 3 on the real `ucrtbase.dll`) and wants no skip. The oracle then replays on Windows, at each
  G7, what MONARK replays by hand at a tool lot. Cost: 213 s here, not measured on Windows. Q-3.

## 6. Fail closed

Red, with an `::error::` line naming the cause: a platform other than Linux or Windows; no `python`, or not a final CPython 3.14, or
not the pinned version in the job; `FORM` or `TREES` not one well-formed line; the tool's tree absent, or a second tree present;
a `*_check.py` neither run nor named; any run with an exit other than 0 (a signal or the 300 s bound per run included), fewer or
more `VERDICT: GREEN` lines than wanted, a `FAIL` or `VERDICT: RED` line, or a `SKIP` set other than the one named. A failed
precondition runs no check. setup-python fails the job if it cannot install the exact version. The job carries no `if:` and no
`continue-on-error`; each run prints the check's own output and the sha256 of each output file.

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
1e-11 would pin the contract within a factor of ten; it would be a new revision of the tool, so a new list entry. For MONARK.

### 7.2 red-proof

`node scripts/red-proof.mjs --base 5437cd0d --gel 5d03eea5 --draw 5 --seed 20261007`: OK, 5 judged, 3 unchanged, 5 killers drawn,
5 killed. Judged: the four tests of `test/verifier-tool-ci.test.ts`, new-module at the base (`import-fail`: the driver is absent),
green at the gel; `export_public_derived_jobs_are_byte_identical`, F2P (red at the base by assertion: "internal job
'g3-verifier-tool' missing from the source workflow"). `RED-PROOF.json` sha256 `fa46c230…` (it carries paths and the hour).
Red first, by hand: at the commit of the tests alone (`49ab28db`), in a clean clone, the same two files: the new file cannot load
(`ERR_MODULE_NOT_FOUND … scripts/verifier-tool-ci.mjs`), and the export test fails on the assertion above. The killer that this lot
leaves second above the export test (`", \"g3-export\"]" -> "]"`, DERIVE for `verifie-ancres.mjs`) still kills it at the head: "internal
job 'g3-export' must be dropped from the derived public workflow".

## 8. IO-GUARD-INSTALL-MASK-1

Decided by MONARK (`6c268ee`): the job is a gate. It runs the tool and its cases under a pinned Python, on a clean install of the
runner; it reads no installation that someone posed. Event (2) of that item's trigger is the day a result of this job would be cited,
in a public text or a report, as proof that a recompute run is intact. Nothing here cites it so.

## 9. Killers (`// killer: file:line OP "before" -> "after"`, each right above its test)

- `test/verifier-tool-ci.test.ts`: `.github/workflows/ci.yml:292 CONST "python-version: \"3.14.8\"" -> "python-version: \"3.14\""`
  (a range); `scripts/verifier-tool-ci.mjs:56 CONST "present[t] !== (t === TOOL)" -> "t === TOOL && !present[t]"` (a second tree
  admitted); `scripts/verifier-tool-ci.mjs:70 CONST "[...skipped].sort().join() !== [...expected].sort().join()" ->
  "skipped.some((c) => !WINDOWS_ONLY.includes(c))"` (a skip on Windows, or none off it, admitted);
  `scripts/verifier-tool-ci-report-check.py:45 CONST "report.platform_fields = platform_fields" -> "report.platform_fields =
  report.tree_digest = platform_fields"` (one more name of the tool stood in).
- `test/export-public.test.ts`: `scripts/export-public.mjs:450 CONST "\"g3-verifier-tool\", " -> ""` (the job kept in the public
  workflow), right above the test; the earlier killer of that line (`", \"g3-export\"]" -> "]"`) stays above it, its text on the line
  once: `verifie-ancres.mjs` reads it DERIVE (its line is the one this lot rewrites), anchored for red-proof.

## 10. Size

In the CI form (`node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base origin/lot/etude-suite`, evaluated,
then `git diff --shortstat 5437cd0d...HEAD` on the pathspec of `ci.yml` l.100): **299** changed lines, 7 files, 293 insertions and
6 deletions; the content count 0. Under 547 (the bound of a lot) and 1 205 (the bound of the CI). Above the ~55 of the item: the
job is 27 lines, and the driver (107), its types (11), the stand-in (46) and the tests (100) make the step fail closed and
judgeable. This plan, under `docs/`, is not counted.

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
  of §5 set from that run (the next commit), and its run read again in the PR.

## 12. Questions for MONARK (default in brackets)

- **Q-1** `vectors_check.py`: the R1 vectors live only in the private recherches repository; the public spec repository
  (`KraidleAI/monark-kata-spec`, head `ffb5ea33`) carries those of 2026-10-02 (`06ecf069…`), which the frozen oracle refuses by design
  (333 checks for 363). [Item **VERIFIER-TOOL-CI-VECTORS-1**, carrier RECHERCHES, trigger: the R1 revision published in that
  repository; then the job fetches `vectors.json` at its commit, checks its sha256 before `vectors_check.py` runs, and drops it from
  `NOT_RUN`, ~6 lines. Copying the R1 vectors into this repository would publish them: your decision, not this lot's.]
- **Q-2** the version: [3.14.8] or 3.14.5, your host's (both measured green, outputs byte-equal).
- **Q-3** the oracle: [keep the run line as a gate of your G7 oracle: it replays on Windows the tool's checks with the real section 3;
  it needs `python` = CPython 3.14 on the oracle's PATH], or a `CI_ONLY` entry of `scripts/oracle/run.mjs` (your file, whose killers
  anchor below that list).
- **Q-4** the required checks: [you add `g3-verifier-tool` at the merge, as for `g3-site`].

## 13. Not verified here

The oracle's replay on Windows (§5): `python` on its PATH, the duration, `report_check.py` section 3 on the real `ucrtbase.dll`,
`guard_check.py` with nothing skipped; the cleanup of the work directory under Windows (a read-only pack of the partial clone).
`vectors_check.py` (Q-1). The required-check registration (Q-4).
