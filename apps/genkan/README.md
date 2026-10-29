# Genkan

Status: upcoming.

Genkan is an order gate whose decisions will come from a Lean kernel. This package holds four things, and nothing more:

- `kernel/`: a Lean 4 skeleton built with the pinned toolchain (`leanprover/lean4:v4.32.1`). Its executable refuses every request: it exits with code 3, whatever it is given. There is no judge and no theorem yet.
- `scripts/lake.mjs`: runs the pinned Lake of that toolchain, by its path, in `kernel/`.
- `scripts/audit.mjs`: reads the kernel sources (all but the build dir `.lake` at the root) and refuses banned constructs (options and debugging constructs among them), the other axioms and the debugging functions of `Init` named in any part of a name, panics (`]!`, `outOfBounds`, and any part of a name that holds `!` or the word `panic` in any case, the interpolation heads `s!`, `f!` and `println!` excepted), `#` commands other than `#check` and `#print`, `private` and theorem names that are not plain in the theorem files, imports other than `Genkan` and its plain modules, and an unpinned lakefile. A tactic's config can add an axiom that no word shows, so the axiom records decide: given the `#print axioms` output, `main` and each theorem need a record within `propext`, `Classical.choice` and `Quot.sound`. Without records the audit fails; `--source-only` judges the sources alone, and refuses a `.lake` of any case at the kernel root: before the build, it could only hold files from the repository, which lake would reuse and no rule reads.
- `scripts/records.mjs`: writes those records from the built kernel. It takes the roots from `audit.mjs --roots` (`main`, then each theorem with its module), refuses a root whose name is not plain (dotted ASCII components), and asks the pinned Lean for each one's `#print axioms`, through `lake.mjs`; it writes the file only when Lean succeeds.

CI runs the source audit before any Lean runs, then the build, the records and the audit that judges them:

```
node apps/genkan/scripts/audit.mjs --source-only
ELAN_HOME=<toolchain home> node apps/genkan/scripts/lake.mjs build
ELAN_HOME=<toolchain home> node apps/genkan/scripts/records.mjs --out <file>
node apps/genkan/scripts/audit.mjs --axioms-from <file>
```
