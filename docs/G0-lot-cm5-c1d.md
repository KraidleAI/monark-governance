# G0 — CM5-c1d: the identity and the launch form of the quarter counts tool, `tools/kata-quarter/`

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-15. Base: trunk `lot/etude-suite` at `32d8ef18` (the core of the
  count, CM5-c1b, merged by #294).
- **Plan**: the quarter counts plan of CM-5 (recherches, `coordination/pieces/2026-10-07-G0-cm-5/G0-CM-5-PLAN-1.md`, v6): row c1d
  (section 5, l.593), the identity block and the rule of the run (section 3.5, l.436-463), the entry and its subcommands (section 5.2
  (D), l.785-828), tests L-T24 to L-T26 (section 5.3, l.934-936). There is no separate short G0: this note fixes the choices the plan
  leaves open, each with the plan line it rests on. Lines of the plan are cited `plan l.N`.
- **No series byte read.** Every run is on the synthetic fixture of `fixtures/kata-quarter/` (CM5-c1a) and on data the tests make.

## 1. What this lot delivers (code that runs)

- `tools/kata-quarter/quarter_identity.py` (new, no `__main__`), `tool_identity()` (l.39-49): under the role `tool-tree`, the commit
  that `io_guard.git_tree` names (`HEAD` of the repository that holds `tools/kata-recalc/`, which `git_tree` checks, io_guard.py
  l.452-469), then each tree on disk held to its blobs at that commit by `held()` (l.30-36): `tools/kata-recalc/` to the entries that
  `git_tree` returns, `tools/kata-quarter/` to the list of `git show <commit>:tools/kata-quarter` and to each
  `<commit>:tools/kata-quarter/<name>`, read by `io_guard.git_show`. The files on disk are the regular files that `os.listdir` lists,
  no link and no folder, their bytes read (`running()`, l.20-27). A file more, a file less or a byte changed is a named refusal, exit 2
  (plan l.446-448); a git that cannot name the commit or read a blob is one too. There is no option that skips it (plan l.452-454).
- `tools/kata-quarter/quarter_counts.py`: `check` and `count` declare `tool-tree` with their other roles (l.60, l.83) and call
  `tool_identity()` at once, before any input is read; the line `identity commit <sha> kata_recalc_tree_sha256 <sha256>
  kata_quarter_manifest_sha256 <sha256>` (`identity_line`, l.55-56) is printed with their output. `month` is not in this lot (it
  prints `not in this lot` and exits 2 before any role or input, as at the base).
- `tools/kata-quarter/FILES`: the line `quarter_identity.py`.
- `test/helpers/kata-quarter-repo.ts`, the shared test helper (made by CM5-c1a): `toolRepo(root, change)` applies `change` to the copy
  of the two trees before its one commit (a stand-in committed in a repository of its own), and `launch` takes another form or extra
  environment variables for one launch (the launch-form test). The rest is unchanged: a folder under `os.tmpdir()`, the two trees
  copied from the working tree (regular files only), `git init`, `git add`, one commit, every `git` and every launch without the
  caller's `GIT_*` variables (TEST-GIT-ENV-ISOLATION-1; plan l.459-461).

## 2. The choices the plan leaves open, fixed here

| Choice | Fixed as | Rests on |
|---|---|---|
| The helper's name | `test/helpers/kata-quarter-repo.ts`, the one CM5-c1a made, kept: one module for every launch of the tool in a test | plan l.593 (« nom fixé au G0 court de c1d »), l.457 (one shared helper) |
| How the blobs of `tools/kata-quarter/` are read | `io_guard.git_show("tool-tree", repo, f"{commit}:tools/kata-quarter")` for the list, then one `git_show` per name; the frozen tool offers no `git_tree` on its second tree (`git_tree` reads `TREE` alone, io_guard.py l.452-469) | plan l.448-451 |
| The side effect of `git_show` | written down and tested: the list and each blob of `tools/kata-quarter/` are noted as inputs under `tool-tree` (io_guard.py l.444-449) and printed among the input lines; `two_reads_merged_under_check` counts the inputs of the series apart from them | plan l.449-450 (« effet de bord écrit ») |
| Which trees are compared | both: `tools/kata-recalc/` to the entries of `git_tree` (every entry a `100644` blob, else it never equals a file's bytes), as `report.tool_identity` does for the frozen tool (report.py l.145-176) | plan l.436-437 (the commit « comme `report.py` les écrit »), l.443 (« la règle de `report.tool_identity` ») |
| The manifest's text | the form of `report.tree_digest` (report.py l.156): the sha256 of the lines `<sha256>  <name>` sorted by name, for both trees; plan l.439-440 wrote `<chemin> <sha256>`, the v4 form before the rule of l.443: one form for both trees, the one the frozen tool already writes | plan l.443 |
| How the refusal exits | `quarter_load.Refused`, which the entry's top-level catch prints as one line `REFUSED: …` and turns into exit 2 (no trace); io_guard's own refusals keep exit 4 | plan l.446-447 (« sortie 2, refus nommé ») |
| Which subcommands | `check` and `count`, which exist; `month` when lot e makes it | plan l.444, l.819-821; zone row CM5-c1d (« quand ils existent ») |
| When | right after `declare`, before the first `io_guard.read` | plan l.446-448 (the run refuses), l.391-395 of io_guard.py (`declare` before any input) |
| A stand-in in a test | committed in a repository of its own by the helper (`toolRepo(REPO, change)`), so the identity passes and the test's assertion judges the stand-in; a test that changes the folders after the commit makes its own repository too | plan l.457-459 (« le helper le copie et le committe dans ce dépôt, l'identité passe ») |

## 3. The entry lines and the launch form: already at the base

The plan's row asks for « les lignes d'entrée qui posent l'arbre de `kata-recalc` en `sys.path[1]` avant `import io_guard`, et le
contrôle de la forme `-E -S -s -B` par l'instruction qui suit » (plan l.593, from v6, l.789-797). Both are already done otherwise at
the base, and this lot adds no line for them:

- **The entry lines.** CM5-c1a wrote the prologue of the frozen tool's own entry scripts (`quarter_counts.py` l.10-15, held by
  `kata_quarter_entry_script_imports_the_input_guard_first`): `io_guard.py` run by its path, the frozen tool's folder appended **last**
  to `sys.path` (FORM holds `-P`), then `import io_guard`, the first import after `os` and `sys`. That is the entry contract that
  replaced `sys.path[1]` (CM5-G0-ENTRY-CONTRACT-1, docs/G0-lot-cm5-c1a.md l.6-7 and l.50-51).
- **The form.** Since v6.2 the check is io_guard's, at its import: « le contrôle de la forme passe dans io_guard, à son import » and
  « la deuxième instruction de contrôle ci-dessus disparaît de l'entrée » (plan l.799). io_guard.py l.40-53 exits 2 after a line on
  `stderr` and its `flush()` when a field of `sys.flags` is off `FORM` (`-E -S -s -B -P`), when `sys.warnoptions` or `sys._xoptions` is
  not empty, or on a debug build. A check of the entry's own would be a second list of the same fields.

L-T26 is therefore written against io_guard's check, which the entry runs first; its killer is a line of `io_guard.py` (section 4).

## 4. Tests and their killers (`test/kata-quarter.test.ts`, 17 tests; three new)

| Test | What it holds | Killer |
|---|---|---|
| `kata_quarter_tree_refused_unless_at_its_commit` (L-T24) | `count` at the commit of the helper's repository exits 0, its line `identity` names `git rev-parse HEAD` and the digests of both folders (computed in the test); refused by name before any input, exit 2: a file added to `tools/kata-quarter/` and listed in `FILES`, a byte changed in `tools/kata-quarter/quarter_core.py`, a byte changed in `tools/kata-recalc/binom_check.py`, a committed file removed and unlisted (a repository whose commit holds `quarter_spare.py`); exit 0 again once restored | `quarter_identity.py:32 CONST "files != committed" -> "False"` |
| `kata_quarter_subcommands_declare_tool_tree` (L-T25) | `check` and `count` exit 0, their line `identity` names the commit of the repository they run from, and the list and each blob of `tools/kata-quarter/` are noted under `tool-tree`; without the role, `git_tree` refuses (io_guard.py l.457, exit 4) | `quarter_counts.py:60` and `:83 CONST "\"tool-tree\"" -> "\"oracle-output\""` |
| `sitecustomize_beside_kata_recalc_does_not_run` (L-T26) | under the form, a `sitecustomize.py` on `PYTHONPATH` writes no witness and `check` exits 0; posed in the copy of `tools/kata-recalc/` it writes none and io_guard refuses the name, exit 4 (IO-GUARD-POSED-FILES-1, io_guard.py l.75-77, where plan l.936 wrote « code 0 », before that rule); under `-s -B` it runs (the witness is written) and io_guard refuses the launch by name, exit 2 | `tools/kata-recalc/io_guard.py:47 CONST "if _OFF or " -> "if "` |

L-T24's clause « un lien ou un `__pycache__` ajouté n'entre pas dans la liste » (plan l.934) has no case: io_guard refuses any name of
the folder outside `FILES`, links and caches included, at exit 4 before the entry runs (io_guard.py l.88-90, l.494-498); `running()`
still lists regular files only (plan l.446). Each new test opens with `assert.ok(existsSync(quarter_identity.py))`, red at the base by
assertion (plan l.896-897).

**Two items carried from the review of CM5-c1b** (recherches `coordination/ITEMS-PORTES.md` l.26-27), tests only:

- KQ-VENUE-EXTRA-FOLDER-TEST-1: `count_refuses_by_name` gains « a folder outside the registry » (`syn` and `alt` named, the registry's
  venue `['syn']`), killer `quarter_counts.py:89 CONST "sorted(folders) != venue" -> "not set(venue) <= set(folders)"` (mutant N4).
- KQ-GLOBALS-LIST-BRANCH-TEST-1: `kata_lib_blob_unchanged_and_globals_restored` gains a second bad count that appends to the list
  global `kata_lib.SCALE_KATAS` during the count, killer `quarter_core.py:54 CONST "return type(v).__name__, [cp(x) for x in v]" ->
  "return v"` (mutant N7).

The other tests' killers moved with the lines of `quarter_counts.py` and `FILES` (four lines more before them); the stand-ins of
`venue_instance_one_interval` and `kata_lib_blob_unchanged_and_globals_restored` are committed (section 2).

## 5. Cost and counts

- **Cost in the run** (plan l.620-622, « remesuré dans c1d »): each launch of `check` or `count` starts 20 `git` processes (`rev-parse`,
  `ls-tree`, 12 `cat-file` for `git_tree`; one `git show` for the list and five for the blobs). Measured here, CPython 3.14.8, offline:
  the 14 tests of the base take 10.9 s at the base and 12.8 s with the identity (the stand-ins' own repositories included); the file of
  17 tests, 16.2 s (11.1 s at the base).
- The driver's pinned list of test names (`QUARTER_TESTS`, `scripts/verifier-tool-ci.mjs` l.128-131) names the three new tests, and its
  count in `test/verifier-tool-ci.test.ts` is 17.

## 6. Not in this lot

- The identity block of the quarter record (c2): the line `identity` is printed beside the counts, not in a record.
- `month` (lot e) declares `tool-tree` and calls `tool_identity()` when it exists (plan l.819-821).
- The modes of the blobs of `tools/kata-quarter/`: `git show` of a tree lists names, no mode; the index is held at `100644` by
  `kata_quarter_files_are_regular_100644` (L-T21). The entries of `tools/kata-recalc/` are held at `100644` in the run.
- The Windows replay of the test file: MONARK, at the merge. The bytes compared are those of the checkout: `.gitattributes` holds
  every file at `eol=lf` (its l.2), so a Windows checkout holds the blobs' bytes; a checkout that converted line endings would be refused.
