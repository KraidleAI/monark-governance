# Genkan

Status: upcoming.

Genkan is an order gate whose decisions will come from a Lean kernel. This package holds three things, and nothing more:

- `kernel/`: a Lean 4 skeleton built with the pinned toolchain (`leanprover/lean4:v4.32.1`). Its executable refuses every request: it exits with code 3, whatever it is given. There is no judge and no theorem yet.
- `scripts/lake.mjs`: runs the pinned Lake of that toolchain, by its path, in `kernel/`.
- `scripts/audit.mjs`: reads the kernel sources (all but the build dir `.lake` at the root) and refuses banned constructs (options and debugging constructs among them), the other axioms and the debugging functions of `Init` named in any part of a name, `#` commands other than `#check` and `#print`, imports other than `Genkan` and its plain modules, and an unpinned lakefile. A tactic's config can add an axiom that no word shows, so the axiom records decide: given the `#print axioms` output, `main` and each theorem need a record within `propext`, `Classical.choice` and `Quot.sound`. CI runs the source part before any Lean runs; no step writes the records yet.

```
ELAN_HOME=<toolchain home> node apps/genkan/scripts/lake.mjs build
node apps/genkan/scripts/audit.mjs
```
