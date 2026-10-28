# Genkan

Status: upcoming.

Genkan is an order gate whose decisions will come from a Lean kernel. This package holds two things, and nothing more:

- `kernel/`: a Lean 4 skeleton built with the pinned toolchain (`leanprover/lean4:v4.32.1`). Its executable refuses every request: it exits with code 3, whatever it is given. There is no judge and no theorem yet.
- `scripts/lake.mjs`: runs the pinned Lake of that toolchain, by its path, in `kernel/`.

```
ELAN_HOME=<toolchain home> node apps/genkan/scripts/lake.mjs build
```
