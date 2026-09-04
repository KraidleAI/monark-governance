# MONARK

**MONARK** is the single tokenised agent (ticker `MONARK`) and the storefront for a fleet of
sub-agents ("X agents", **not** tokens): **Shōgen** (attested perception), **HIKAE** (coverage-controlled
inference / conformal prediction), **UKEMI** (liquidation-cascade survival). This repository is the
MONARK **tokenisation layer + the frozen interface contracts** that make the fleet interoperate.

> **Phase 0 — skeleton & freeze.** This repo is **LOCAL-ONLY**: no git remote, nothing public.
> Nothing is published before the Phase 3 HARD GATE (Shōgen's S2 pilot run on **real** data).
> Governed by `docs/adr/ADR-M001-*` — plan accepted-with-corrections at checkpoint 1; deliverable **accepted at
> checkpoint 2** (2026-09-04) after an independent G2 review (`docs/adr/G2-review-M001.md`) and the G7 verdict.

## The interlocking (why the agents work together)

```
Shōgen (attested price)  →  HIKAE (coverage verdict / gate)  →  UKEMI (liquidation-cascade risk)
```

Four contracts, frozen in Phase 0 (source of truth: `schemas/*.json`, language-neutral):

| Contract | Producer | Meaning |
|---|---|---|
| `AttestedPrice` | Shōgen | A **verified** testimony (bytes + hash + named residual hypotheses). The price *number* is interpreted by a HIKAE-side adapter — Shōgen deliberately carries no number and **no confidence** (03 §0). |
| `Prediction` | any predictor | The `ŷ` HIKAE conformalizes, with `predictor_id` (venue/model). |
| `CoverageVerdict` | HIKAE | Conformal region — **polymorphic** `set` (classification) \| `interval` (regression, so UKEMI plugs in). **No `p_correct`.** |
| `GateDecision` | HIKAE L3 | `commit \| defer \| abstain` + `remaining_budget` = B_t, the depletable conformal authorization capacity that attaches to MONARK (never a return). |

## Fleet invariant — no confidence field, anywhere

Both Shōgen (03 §0: no truth/confidence/"validated") and HIKAE (Grok `hac-cp.ts:77`: no
`p_correct`/`confidence`/`hallucination*`) refuse a confidence field. The contract layer **enforces
this in code**:

1. **Closed schemas** (`additionalProperties:false`) — the primary guard, mirroring Shōgen's decoder,
   which *refuses* an unknown key (`CleInconnue`) rather than ignoring it. Enforced at runtime by
   `closed-check.ts` (hand-rolled allow-key sets), kept in sync with the JSON Schemas by a test.
2. **`FORBIDDEN_KEYS`, recursive** — defense in depth (`forbidden-keys.ts`), catching a banned key at
   *any* depth. A contract carrying one **throws** instead of serializing.
3. **Vocabulary gate** (`scripts/grep-forbidden.mjs`) — CI fails on marketing/guarantee claims
   ("95% correct", "anti-hallucination", "everlasting", …).

## Run the gates

```bash
npm ci
npm run ci   # vocabulary gate → typecheck (tsc strict) → tests (node:test)
```

## Engineering choices (Phase 0)

- **Polyglot fleet, schema-first contracts.** Shōgen is Rust, the Hermes/`claw-agent` runtime is
  **Python**, HIKAE's engine + the vitrine are **TS**. So the contracts live as language-neutral
  **JSON Schema**; the TS package in `packages/contracts` is the first binding. Rust/Python bind to
  the same schemas.
- **Zero runtime dependencies.** The published contracts pull in nothing at runtime. Dev deps:
  `typescript`, `@types/node`, and `ajv`/`ajv-formats` (**test-only**); tests run on the built-in
  `node:test` (Node ≥ 24 native TS type-stripping). **Key-closedness** is enforced hand-rolled at runtime
  (mirroring Shōgen's zero-dep `CleInconnue`); the **value constraints** (min/unique items, hash length,
  ASCII-printable) live in the JSON Schemas and are exercised against `ajv` in tests.
- **`ajv` is a dev-dependency** (test-only, per ADR-M001 D2): it executes the four frozen JSON Schemas —
  compiling them, resolving the `$ref`, and proving they reject the value-constraints (empty/duplicate
  arrays, 63-char hash, control chars) that the TS types alone do not. Applying `ajv` to validate an
  external Rust/Python producer's JSON at the runtime boundary is a natural later extension.
- **Deferred to the DEVOPS pass** (ADR-M001 D8): a dedicated linter (`eslint`) — `tsc --strict` + the
  vocabulary gate stand in for Phase 0 — and SHA-pinning the CI actions + signed commits (before any
  remote is enabled).

## Layout

```
schemas/            JSON Schema — the language-neutral source of truth (closed)
packages/contracts  TS binding: types, closed-check, forbidden-keys, calib_digest, serializers, tests
packages/hikae      HAC-CP engine        (Phase 1 — stub)
packages/ukemi      cascade-VaR          (Phase 1 — stub)
packages/monark     cross-agent gate     (Phase 0 freezes the wiring signature; engine = Phase 2)
docs/adr            ADR-M001 (Phase 0), ADR-CERT-MONARK (token)
.github/workflows   CI (local-only in Phase 0)
```

## Discipline

Governed by the "Compliance et ingénierie logicielle et architecturale" corpus (gates G0–G7,
R-1..R-26) and AgileGates. **Only the orchestrator commits** (R-19/R-20): a worker stages, never
commits. Contracts are frozen — they evolve **by ADR only** (`schema_version`, ADR-M001 D9).
