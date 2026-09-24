![MONARK — it abstains so DeFi can act.](out/banner.jpg)

# MONARK

<!-- The CI badge points at the PUBLIC repo's workflow (KraidleAI/Monark) — what a stranger sees. -->
[![CI](https://github.com/KraidleAI/Monark/actions/workflows/ci.yml/badge.svg)](https://github.com/KraidleAI/Monark/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
<!-- Latest tagged release on the PUBLIC repo (KraidleAI/Monark) — the version source of truth is the git tag. -->
[![Latest Release](https://img.shields.io/github/v/release/KraidleAI/Monark?sort=semver&label=release)](https://github.com/KraidleAI/Monark/releases/latest)

**MONARK is a two-sided toolkit — a DeFi side and an AI side — built like a Swiss-army knife: one handle,
several blades.** The handle is a coverage-controlled decision engine that emits `commit | defer | abstain`
against a depletable authorization budget (`B_t`) — never a probability of being right. The blades are the
sensors, witnesses and acts that plug into it, each one grown from an empirical study of on-chain data before
it is served. Around the engine, an AI layer of agents is being put in place to keep it adapted to DeFi as
DeFi changes.

Single token, single ticker (`MONARK`). The agents are **products, not tokens**. This repository is the
MONARK **tokenisation layer**, the **six frozen interface contracts** (the sixth, AttestedBook, upcoming
until served) and the served pieces that let AI agents and DeFi meet on measured ground.

## Two sides, one engine

| Side | What it is | Where it lives |
|---|---|---|
| **DeFi side — the DeFAI layer** | The engine: sensors that **attest** to what happened on chain (bytes, hash, named residual hypotheses), a gate that **authorizes** under coverage control, acts that **execute** — all on frozen, language-neutral contracts. | `schemas/`, `packages/hikae`, `packages/ukemi`, `apps/sentinel`, `apps/bell`, the public endpoints |
| **AI side — the agent layer** | The harness through which any AI agent reaches the engine (MCP / HTTP), and the agents that keep the engine adapted: recalibration when a measured drift criterion fires, onboarding of new protocols and venues, tracking of new liquidation mechanics, watch of the data sources the sensors depend on. | `apps/harness`, `skills/monark`, the build-and-review workflows that produce every lot of this repo |

**Measurement first.** No piece of MONARK is designed on a whiteboard and shipped. Each one starts as an
empirical study — a recorded liquidation book at an archive block, a redemption-flow series measured on calm
windows, a census of trading halts, a session-by-session record of tokenized-equity fills — and the study's
artefacts stay attached to the served piece: committed calibrations with their digests, replayable
timelines with per-line hash chains, published signing keys. That is what we mean by an **instrumented
environment**: an AI agent operating in DeFi through MONARK acts on attested readings and audited regions,
and gets an explicit `abstain` where nothing is measured — instead of a guess dressed as a number.

**Kept adapted.** DeFi does not hold still: protocols upgrade, liquidation engines change shape, oracles
and data feeds move, calibrations drift. The engine is built so that each of these is a *measured* event
with a pre-registered response (a drift criterion, a new recorder, a new residual hypothesis, a re-frozen
contract), and the AI layer is the set of agents whose job is to detect those events and carry the
response through the same review gates the engine was built under. Today that layer is the workflow that
builds and reviews this repository under human acceptance; the agents that will run it continuously are
named directions, not delivered products (see the maturity table below).

## The backbone — the gate

Everything in MONARK plugs into one decision primitive. A sensor reads the world and attests to it; a
predictor turns that reading into a claim; the gate conformalises the claim into a **region** at a target
coverage and returns one of three actions against a depletable budget:

- **commit** — the region is tight enough to act on, and the budget can pay for it;
- **defer** — the reading is ambiguous; the gate waits for a better one;
- **abstain** — the gate cannot state a region it stands behind, so it says nothing and invents no success.

The gate never reports how likely it is to be correct. It reports a region you can audit and a budget you
can watch — **never a probability of being right**.

## Maturity (labelled by what is built)

The labels are the point: they say what exists today and what is only named.

| Layer | What it is | Status |
|---|---|---|
| **Backbone** — the gate | Hikae (coverage control) + the MONARK token's budget `B_t`; turns a sensor reading into `commit \| defer \| abstain` | **Built** — six frozen contracts (the sixth, AttestedBook, upcoming until served) |
| **Fleet** — sensors, witnesses, acts | one token across all of them | **5 built** (Shōgen · Hikae · Ukemi · Narabi · MONARK Bell) · **11 named** |
| **Harness** — the AI side's door | the same engine made reachable *by other agents* over HTTP / MCP | **Built** — public 4-tool MCP endpoint (attest · gate · cascade · calibrate) + skill on ClawHub |
| **Adaptation agents** — the AI side's work | agents that recalibrate, onboard protocols, track liquidation mechanics, watch sources, and review one another's lots | **Direction, unscheduled** — the build-and-review workflow exists; the continuous agents are named, not delivered |

## The fleet

**Built** (each closed under an independent review and a closing verdict):

- **Shōgen** — attested perception: an attested price testimony — origin and bytes, never truth.
- **Hikae** — coverage-controlled inference: the gate.
- **Ukemi** — liquidation-cascade survival: a recorder reads a lending protocol's liquidation book at an
  archive block under a keyless RPC quorum and digests it (the AttestedBook contract); the served gate class
  abstains (`under_calib`) until a committed calibration is served — stated plainly, not hidden.
- **Narabi** — redemption-run sensing. Its `AttestedFlow` attestation (the fifth frozen contract) and the
  velocity adapter ship in this repo; the public endpoint serves the gate class `stable-run-velocity-24h`
  with **a committed calibration for one population** — USDe — measured on calm onchain redemption-flow
  windows. That calibration is **measured non-stationary** across half-years, so no per-window coverage is
  claimed; the honesty sentence on the wire is the Barber, Candès, Ramdas and Tibshirani 2023 (Thm 2, unit
  weights) wording — *no coverage is measured*. **Every other population abstains** (`under_calib`).
  An off-tool **daily** sentinel steps the tracker at block finality and publishes a replayable timeline at
  `https://monarkgate.tech/narabi/` (`state.json`, `timeline.jsonl`, per-line hash-chained).
- **MONARK Bell** — a public, attested witness of **tokenized equities outside cash-market hours**: per
  session (pre, regular, after, overnight, weekend), the on-chain fills at the declared pools, their VWAP and
  volume, the trading-halt census and the supply / proof-of-reserve residuals — published as a signed,
  hash-chained timeline at `https://bell.monarkgate.tech/` (`state.json`, `timeline.jsonl`,
  `provenance.json`, the Ed25519 public key at `bell/pubkey.json`) with a reader-side verifier and the
  signing keyring in this repo. Never a price call; abstentions are counted and published as such.

The single public sentence for Narabi, verbatim:

> Narabi runs an adaptive quantile tracker (Angelopoulos–Barber–Bates 2024, decaying step) on the attested daily USDe redemption flow: its state moves each 24h window from the realized outcome, and the bound it prints stays above the target until T = 1789 — stated plainly, not as a feature.

**What Narabi is NOT.** The bound printed daily is the Angelopoulos, Barber and Bates 2024 (Thm 1) quantity
`(B + η₁)/(T·η_T)` with `c = B = 1/24` and `ε = 0.1`. The published region is the tracker's, not the gate's:
the gate keeps the committed static calibration and does **not** change until the pre-registered drift
criterion (`rolling90_calm_miss ≥ 0.40`, evaluable after 90 calm pairs) fires and an ADR says so. Not a
per-window coverage, not a probability of being right, not a price call.

**Replay them yourself.** Narabi: recompute every window from its `[from_block, to_block]` via
`eth_getLogs` + `totalSupply`, then re-derive `q` with the committed `trackerReplay` over the `s` column of
`timeline.jsonl`. Bell: verify each timeline line's Ed25519 signature against the published key, recompute
`state_sha256` from the served state, and rebuild the digest from the declared pools at the declared window
(`apps/bell`, `scripts/verify-bell.mjs`). The per-line hash chains make any rewrite detectable.

**Named on the roadmap** (teasers — *not* delivered products, no metrics claimed):

- Agents: **Mokugeki** (document / event attestation) · **Kaihi** (LVR / toxicity avoidance) · **Kessai**
  (swap execution, transaction-cost analysis) · **Kamae** (inventory market-making) · **Kyokusen** (PT / YT
  curve) · **Koyomi** (weekend gap) · **Genkan** (the storefront / MCP entry point).
- Products on the same gate: **MONARK Firebreak** (ride out an auto-deleveraging cascade on a perp venue) ·
  **MONARK Warden** (a least-privilege gate on a treasury a DAO or another agent controls) · **MONARK
  Softlanding** (ease a leveraged position down before it clears) · **MONARK Verdict** (turn a raw event
  call into a coverage-controlled, settled decision) · **MONARK Ballast**.

## The interlocking (why the pieces work together)

```
sensors / witnesses (attest)  →  the gate: Hikae + MONARK B_t  →  acts (execute · upcoming)
                                     commit | defer | abstain
        ▲                                                                  │
        │            AI layer: harness (MCP / HTTP) · adaptation agents     │
        └──────────── recalibrate · onboard · track · watch · review ◄──────┘
```

Every future act plugs into the same gate; every future sensor attests into the same contract shape; every
change to the engine goes through the same gates the engine was built under.

## Six frozen contracts

The interface is frozen and language-neutral (source of truth: `schemas/*.json`):

| Contract | Producer | Meaning |
|---|---|---|
| `AttestedPrice` | Shōgen | An **attested** testimony (bytes + hash + named residual hypotheses) — origin and bytes, never truth. The price *number* is interpreted by a Hikae-side adapter — Shōgen never asserts a price. |
| `AttestedFlow` | Narabi | An **attested** testimony of redemption flow (bytes + hash + a **closed** `residual[]` enum) — origin and bytes, never truth. `burns`/`mints`/`supply` are carried **raw**. |
| `Prediction` | any predictor | The `ŷ` Hikae conformalises, with `predictor_id` (venue/model). |
| `CoverageVerdict` | Hikae | Conformal region — **polymorphic** `set` (classification) \| `interval` (regression, so Ukemi plugs in). No `p_correct` field. |
| `GateDecision` | Hikae L3 | `commit \| defer \| abstain` + `remaining_budget` = `B_t`, the depletable conformal authorization capacity that attaches to MONARK (never a return). |
| `AttestedBook` | Ukemi (recorder) | A **self-declared** reading of a liquidation book at an archive block under a keyless RPC quorum: the digests (book, holders) with block/provider/quorum context — upcoming until served. |

## The token

`MONARK` carries `B_t`, a **depletable authorization budget**: each `commit` spends it; `defer` and
`abstain` do not. It is the fleet's right-to-act, metered — **not a return, not a deposit, not an oracle**.
Tokenomics: to be announced.

**Contract address (CA):** `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` (address only — no price, no buy call).

## Fleet invariant — no confidence field, anywhere

Both Shōgen and Hikae refuse it. An output is a **region**, a **set**, or **bytes + hash + named residual
hypotheses** — never a score. There is **no confidence field** anywhere in the interface, and the contract
layer **enforces this in code**:

1. **Closed schemas** (`additionalProperties: false`) — the primary guard, mirroring Shōgen's decoder,
   which *refuses* an unknown key rather than ignoring it. Enforced at runtime by `closed-check.ts`
   (hand-rolled allow-key sets), kept in sync with the JSON Schemas by a test.
2. **Recursive forbidden-key check** — defense in depth (`forbidden-keys.ts`), catching a banned key at
   *any* depth. A contract carrying one **throws** instead of serialising.
3. **Vocabulary gate** (`scripts/grep-forbidden.mjs`) — CI fails on marketing or overclaim wording.

## Reach the engine (the AI side's door)

The engine is reachable by any MCP-capable agent over one public endpoint:

- **MCP endpoint:** `https://mcp.monarkgate.tech/mcp` (HTTP/JSON mirror: `POST https://api.monarkgate.tech/{attest|gate|cascade|calibrate}`; the served `openapi.json` states the served version).
  Four tools: `attest · gate · cascade · calibrate`. Listed on the official MCP Registry as `tech.monarkgate/monark`.
- **Skill:** an integration skill on ClawHub — `clawhub install monark` — carrying the same honesty
  framing. The skill is MIT-0; the harness itself is Apache-2.0.
- **Add it in one line:**

```bash
hermes mcp add monark --url https://mcp.monarkgate.tech/mcp
openclaw mcp add monark --url https://mcp.monarkgate.tech/mcp --transport streamable-http
```

No personal data is required to use the service (no account, e-mail, or wallet).

## Status

**Phase two — integration, served piece by piece.** The contract freeze and the Hikae + Ukemi engines are
**closed** under an independent review and a closing verdict; Narabi and MONARK Bell are served with
published, replayable timelines. The public projection of this repo is produced by
`scripts/export-public.mjs`; the private working history is not pushed.

## Run the gates

```bash
npm ci
npm run ci   # vocabulary gate → typecheck (tsc strict) → tests (node:test)
```

## Engineering choices

- **Polyglot fleet, schema-first contracts.** Shōgen is Rust, the runtime is **Python**, Hikae's engine and
  the storefront are **TS**. So the contracts are expressed as language-neutral **JSON Schema**; the TS
  package in `packages/contracts` is the first binding. Rust and Python bind to the same schemas.
- **Zero runtime dependencies.** The published contracts pull in nothing at runtime. Dev deps:
  `typescript`, `@types/node`, `ajv`/`ajv-formats` (**test-only**), and `eslint`/`typescript-eslint` (lint only); tests run on the built-in
  `node:test` (Node ≥ 24 native TS type-stripping). **Key-closedness** is enforced hand-rolled at runtime
  (mirroring Shōgen's zero-dep unknown-key refusal); the **value constraints** (min/unique items, hash
  length, ASCII-printable) are expressed in the JSON Schemas and exercised against `ajv` in tests.
- **`ajv` is a dev-dependency** (test-only): it compiles the six frozen JSON Schemas, resolves the
  `$ref`s, and proves they reject the value-constraint violations (empty/duplicate arrays, wrong-length
  hash, control chars) that the TS types alone do not.
- **Measured before served.** A piece reaches a public surface only with its study artefacts committed
  and hashed next to it (calibration digests, recorded fixtures with same-directory provenance, replayable
  timelines) and an execution oracle — not a language model — as the proof of composition.

## Layout

```
schemas/            JSON Schema — the language-neutral source of truth (closed)
packages/contracts  TS binding: types, closed-check, forbidden-keys, calib_digest, serializers, tests
packages/hikae      HAC-CP engine: L1 split / L2 monitor / L3 gate, interval conformer  (built)
packages/ukemi      liquidation-cascade survival: clearing, liquidable                  (built)
packages/monark     integration adapters: Shōgen→AttestedPrice, Narabi AttestedFlow→Prediction; canonical CBOR
packages/atelier    local demo surface (not a shipped product)
apps/harness        the MCP / HTTP harness — four tools over the frozen contracts (the AI side's door)
apps/sentinel       off-tool sentinels: Narabi daily tracker; Ukemi liquidation-book recorder
apps/bell           MONARK Bell: publisher, hash chain, reader-side verifier, public signing keyring
apps/site           public vitrine
skills/monark       the integration skill (MIT-0)
.github/workflows   CI (5 blocking jobs)
```

## Links

- **Site:** https://monarkgate.tech
- **Bell (attested witness):** https://bell.monarkgate.tech
- **Narabi (daily timeline):** https://monarkgate.tech/narabi/
- **MCP endpoint:** https://mcp.monarkgate.tech/mcp (HTTP/JSON mirror: POST https://api.monarkgate.tech/{attest|gate|cascade|calibrate})
- **Skill:** ClawHub — `clawhub install monark`
- **Linktree:** https://linktr.ee/monarkgate

## License

Apache-2.0 — see [LICENSE](./LICENSE). The published integration skill is MIT-0.

<!--
GitHub "About" description (≤ 350 chars, draft to apply with `gh repo edit --description` on the public mirror, on investor go):

MONARK — a two-sided toolkit for DeFi and AI: a coverage-controlled decision engine (commit | defer | abstain over a depletable budget, never a probability of being right) on six frozen contracts, served to AI agents over MCP/HTTP, and an agent layer that keeps it adapted to DeFi. Everything else: https://linktr.ee/monarkgate
-->
