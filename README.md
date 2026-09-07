# MONARK

**MONARK is a company of agent-products for DeFi and inference, built on one backbone: a
coverage-controlled decision gate that emits `commit | defer | abstain` and a depletable
authorization budget (`B_t`) — never a probability of being right.**

Single token, single ticker (`MONARK`). The agents are **products, not tokens**: sensors that
attest, a gate that authorizes, and acts that execute. This repository is the MONARK
**tokenisation layer** plus the **frozen interface contracts** that let those agents interoperate.

## The four layers (labelled by what is built)

MONARK is not one product and not "three sub-agents" — it is four layers at different maturity. The
labels below are the point: they say what exists today and what is only named.

| Layer | What it is | Status |
|---|---|---|
| **Backbone** — the gate | Hikae (coverage control) + the MONARK token's budget `B_t`; turns a sensor reading into `commit \| defer \| abstain` | **Built** — 4 frozen contracts, Hikae + Ukemi engines, CI |
| **Fleet** — a company of agents | sensors → gate → acts, one token across all of them | **3 built, 8 on the roadmap** |
| **Harness** — DeFAI, multi-directional | the same fleet made reachable *by other agents* over HTTP / MCP | **Specified, not shipped** |
| **Self-improving company** | agents that rate, improve, and sell one another's products | **Direction, unscheduled** |

### The fleet

Built (Phase 1 closed under independent G2 review + G7 verdict):

- **Shōgen** — attested perception (verified price testimony)
- **Hikae** — coverage-controlled inference (the gate)
- **Ukemi** — liquidation-cascade survival

Named on the roadmap (teasers — *not* delivered products, no metrics claimed):

- **Mokugeki** — document / event attestation
- **Narabi** — redemption-run sensing
- **Kaihi** — LVR / toxicity avoidance
- **Kessai** — swap execution (transaction-cost analysis)
- **Kamae** — inventory market-making
- **Kyokusen** — PT / YT curve
- **Koyomi** — weekend gap
- **Genkan** — the storefront / MCP entry point (how other agents reach the fleet)

## The interlocking (why the agents work together)

```
sensors (attest)  →  the gate: Hikae + MONARK B_t  →  acts (execute)
                        commit | defer | abstain
```

The first vertical, built end to end: `Shōgen → Hikae → Ukemi`. Every future act plugs into the
same gate; every future sensor attests into the same contract.

Four contracts, frozen (source of truth: `schemas/*.json`, language-neutral):

| Contract | Producer | Meaning |
|---|---|---|
| `AttestedPrice` | Shōgen | A **verified** testimony (bytes + hash + named residual hypotheses). The price *number* is interpreted by a Hikae-side adapter — Shōgen deliberately carries no number and **no confidence** (doc 03 §0). |
| `Prediction` | any predictor | The `ŷ` Hikae conformalizes, with `predictor_id` (venue/model). |
| `CoverageVerdict` | Hikae | Conformal region — **polymorphic** `set` (classification) \| `interval` (regression, so Ukemi plugs in). **No `p_correct`.** |
| `GateDecision` | Hikae L3 | `commit \| defer \| abstain` + `remaining_budget` = `B_t`, the depletable conformal authorization capacity that attaches to MONARK (never a return). |

## The token

`MONARK` carries `B_t`, a **depletable authorization budget**: each `commit` spends it; `defer` and
`abstain` do not. It is **not a yield, not a stake, not an oracle** — it is the fleet's right-to-act,
metered. Tokenomics: to be announced.

## Fleet invariant — no confidence field, anywhere

Both Shōgen (doc 03 §0: no truth/confidence/"validated") and Hikae (`hac-cp.ts:77`: no
`p_correct`/`confidence`/`hallucination*`) refuse a confidence field. An output is a **region**, a
**set**, or **bytes + hash + named residual hypotheses** — never a score. The contract layer
**enforces this in code**:

1. **Closed schemas** (`additionalProperties:false`) — the primary guard, mirroring Shōgen's decoder,
   which *refuses* an unknown key (`CleInconnue`) rather than ignoring it. Enforced at runtime by
   `closed-check.ts` (hand-rolled allow-key sets), kept in sync with the JSON Schemas by a test.
2. **`FORBIDDEN_KEYS`, recursive** — defense in depth (`forbidden-keys.ts`), catching a banned key at
   *any* depth. A contract carrying one **throws** instead of serializing.
3. **Vocabulary gate** (`scripts/grep-forbidden.mjs`) — CI fails on marketing/guarantee claims
   ("95% correct", "anti-hallucination", "everlasting", …).

## Status

**Phase 2 — integration.** Phase 0 (contract freeze) and Phase 1 (Hikae + Ukemi engines) are
**closed** under an independent G2 review and a G7 verdict
(`docs/adr/ADR-M001..ADR-M003`, `docs/G7-phase1.md`). Governance is versioned in a **private**
repository; the public projection of this repo is produced by `scripts/export-public.mjs` and is
**gated per lot** — nothing is published before its acceptance checkpoint (ADR-M004 D12).

## Run the gates

```bash
npm ci
npm run ci   # vocabulary gate → typecheck (tsc strict) → tests (node:test)
```

## Engineering choices

- **Polyglot fleet, schema-first contracts.** Shōgen is Rust, the Hermes/`claw-agent` runtime is
  **Python**, Hikae's engine + the storefront are **TS**. So the contracts live as language-neutral
  **JSON Schema**; the TS package in `packages/contracts` is the first binding. Rust/Python bind to
  the same schemas.
- **Zero runtime dependencies.** The published contracts pull in nothing at runtime. Dev deps:
  `typescript`, `@types/node`, and `ajv`/`ajv-formats` (**test-only**); tests run on the built-in
  `node:test` (Node ≥ 24 native TS type-stripping). **Key-closedness** is enforced hand-rolled at
  runtime (mirroring Shōgen's zero-dep `CleInconnue`); the **value constraints** (min/unique items,
  hash length, ASCII-printable) live in the JSON Schemas and are exercised against `ajv` in tests.
- **`ajv` is a dev-dependency** (test-only, per ADR-M001 D2): it executes the four frozen JSON
  Schemas — compiling them, resolving the `$ref`, and proving they reject the value-constraints
  (empty/duplicate arrays, wrong-length hash, control chars) that the TS types alone do not. Applying
  `ajv` at the runtime boundary to validate an external Rust/Python producer's JSON is a natural
  later extension.

## Layout

```
schemas/            JSON Schema — the language-neutral source of truth (closed)
packages/contracts  TS binding: types, closed-check, forbidden-keys, calib_digest, serializers, tests
packages/hikae      HAC-CP engine: L1 split / L2 monitor / L3 gate, interval conformer  (Phase 1 — built)
packages/ukemi      liquidation-cascade survival: clearing, liquidable                  (Phase 1 — built)
packages/monark     cross-agent gate — freezes the wiring signature; token budget B_t   (engine = Phase 2)
packages/atelier    local demo surface (not a shipped product)
apps/site           public vitrine — foundation only (Lot F-1); rich pages = Lot F-2
docs/adr            ADR-M001..M004 (phases 0-2, infrastructure), ADR-CERT-MONARK (token)
.github/workflows   CI (5 blocking jobs)
```

## Discipline

Governed by the "Compliance et ingénierie logicielle et architecturale" corpus (gates G0–G7,
R-1..R-26) and the AgileGates framework. **Only the orchestrator commits** (R-19/R-20): a worker
stages, never commits. Contracts are frozen — they evolve **by ADR only** (`schema_version`,
ADR-M001 D9). No debt is admitted at a pass close: every open point is a formed procurement or a
sourced solution-search, never a naked "due".
