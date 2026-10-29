# Genkan

Status: upcoming.

Genkan is an order gate whose decisions will come from a Lean kernel. This package holds three things, and nothing more:

- `kernel/`: a Lean 4 skeleton built with the pinned toolchain (`leanprover/lean4:v4.32.1`). Its executable refuses every request: it exits with code 3, whatever it is given. There is no judge and no theorem yet.
- `scripts/lake.mjs`: runs the pinned Lake of that toolchain, by its path, in `kernel/`.
- `scripts/audit.mjs`: reads the kernel sources (all but the build dir `.lake` at the root) and refuses banned constructs, the other axioms of `Init` named in any part of a name, imports other than `Genkan` and its plain modules, an unpinned lakefile, and a theorem whose axiom record leaves `propext`, `Classical.choice` and `Quot.sound`. CI runs it before any Lean runs.

```
ELAN_HOME=<toolchain home> node apps/genkan/scripts/lake.mjs build
node apps/genkan/scripts/audit.mjs
```
