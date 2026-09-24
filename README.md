![MONARK — it abstains so DeFi can act.](out/banner.jpg)

# MONARK

<!-- The CI badge points at the PUBLIC repo's workflow (KraidleAI/Monark) — what a stranger sees. -->
[![CI](https://github.com/KraidleAI/Monark/actions/workflows/ci.yml/badge.svg)](https://github.com/KraidleAI/Monark/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
<!-- Latest tagged release on the PUBLIC repo (KraidleAI/Monark) — the version source of truth is the git tag. -->
[![Latest Release](https://img.shields.io/github/v/release/KraidleAI/Monark?sort=semver&label=release)](https://github.com/KraidleAI/Monark/releases/latest)

**MONARK is a two-sided toolkit — an AI side and a DeFi side — built like a Swiss-army knife: one handle,
several blades.** The handle is the **MONARK engine**, the AI side: a coverage-controlled decision gate that
emits `commit | defer | abstain` against a depletable authorization budget (`B_t`) — never a probability of
being right — with the sensors that attest to what happened on chain, the frozen contracts they speak, the
harness through which other AI agents reach it, and the agents that keep it adapted to DeFi as DeFi changes.
The blades are the DeFi side: the **on-chain applications it powers**, each one grown from an empirical
study of on-chain data before it is served. The first is MONARK Bell; the others are research leads.

Single token, single ticker (`MONARK`). The agents are **applications, not tokens**. This repository is the
MONARK **tokenisation layer**, the **six frozen interface contracts** (the sixth, AttestedBook, upcoming
until served) and the served pieces that let AI agents and DeFi meet on measured ground.

## Two sides, one engine — the eleven components

The engine is eleven components: three sensors, one gate, one act, six distribution pieces. Each of them can
serve both sides. **Left:** what it gives an AI agent connected to the MONARK MCP endpoint (today's four
tools are `attest · gate · cascade · calibrate`; a component marked *planned* has no served tool yet).
**Right:** what it gives the DeFi side — the on-chain applications it powers (in parentheses: the applications
on the site's diagram; *wired* = declared in the registry today, *can serve* = a lead, not a delivered link).

| AI side — for an agent on our MCP | Component | DeFi side — DeFAI, for the applications |
|---|---|---|
| `attest`: an attested price testimony (bytes, hash, named residual hypotheses) the agent can cite instead of a scraped number — origin and bytes, never truth. | **Shōgen** — sensor, attested perception · *built* | A price an application can defend when it spends, hedges or de-risks (can serve: Warden, Softlanding, Firebreak, Ballast). |
| `gate` + `calibrate`: the agent submits a claim and gets `commit \| defer \| abstain`, an auditable region and the budget left — never a probability of being right. | **Hikae** — the gate, coverage-controlled inference · *built* | The decision primitive of every application (wired: Firebreak, Warden, Softlanding, Verdict, Ballast). Bell's gate is its own closed publication check; a gate class for its off-hours gap is planned. |
| `cascade`: the agent asks what a lending book would liquidate along a price path; today the served class abstains (`under_calib`) until a committed calibration is served — stated on the wire. | **Ukemi** — act, liquidation-cascade survival · *built* | Reads the deleveraging queue or the position before it clears (wired: Firebreak, Softlanding). |
| A daily, replayable redemption-flow timeline (`state.json`, `timeline.jsonl`) any agent can read, and the served gate class `stable-run-velocity-24h` through `gate`. | **Narabi** — sensor, redemption-run sensing · *built, served daily* | Early sensing of a stablecoin run for a treasury that holds the stable (can serve: Warden, Ballast). |
| *planned*: attest a document or an event the agent must act on — bytes and hash, never a verdict on its truth. | **Mokugeki** — sensor, document / event attestation · *named* | The attested event a settled decision starts from (can serve: Verdict). |
| *planned*: ask, before routing a swap, whether the fill is exposed to LVR / toxic flow. | **Kaihi** — LVR / toxicity avoidance · *named* | The execution leg of a de-risk or a hedge that must not be picked off (can serve: Firebreak, Softlanding, Ballast). |
| *planned*: execute a swap under transaction-cost analysis, with the gate's decision attached. | **Kessai** — swap execution, TCA · *named* | The act leg — de-risk, ease down, rebalance (can serve: Firebreak, Softlanding, Ballast). |
| *planned*: quote and manage inventory for the agent's market-making. | **Kamae** — inventory market-making · *named* | Inventory-aware hedging for a treasury (can serve: Ballast). |
| *planned*: read a PT / YT curve as an attested rate surface. | **Kyokusen** — PT / YT curve · *named* | The rate surface a rate treasury steadies against (can serve: Ballast). |
| *planned*: the weekend / off-hours gap as a sensed quantity the agent can gate on. | **Koyomi** — weekend gap · *named* | The off-hours gap of tokenized equities, the very quantity Bell publishes (can serve: Bell). |
| The door: discovery of the tools and the skill (MCP Registry `tech.monarkgate/monark`). | **Genkan** — the storefront / MCP entry point · *named* (the harness serves the door today) | Distribution of every application to the agents that consume it (can serve: all six). |

**Measurement first.** No piece of MONARK is designed on a whiteboard and shipped. Each one starts as an
empirical study — a recorded liquidation book at an archive block, a redemption-flow series measured on calm
windows, a census of trading halts, a session-by-session record of tokenized-equity fills — and the study's
artefacts stay attached to the served piece: committed calibrations with their digests, replayable
timelines with per-line hash chains, published signing keys. That is what we mean by an **instrumented
environment**: an AI agent operating in DeFi through MONARK acts on attested readings and audited regions,
and gets an explicit `abstain` where nothing is measured — instead of a guess dressed as a number.

**Kept adapted.** DeFi does not hold still: protocols upgrade, liquidation engines change shape, oracles
and data feeds move, calibrations drift. The engine is built so that each of these is a *measured* event
with a pre-registered response (a drift criterion, a new recorder, a new residual hypothesis, a versioned
change to a contract). The adaptation agents are the part of the AI side that detects those events and
prepares the response. They are on the roadmap, not yet shipped (see the maturity table below).

## What is served today

Everything below is live, machine-readable, and replayable by a third party without an account:

| Surface | What it serves | Who consumes it |
|---|---|---|
| `https://mcp.monarkgate.tech/mcp` · `https://api.monarkgate.tech/openapi.json` | The engine's four tools (`attest · gate · cascade · calibrate`) over MCP and a plain HTTP/JSON mirror; the served OpenAPI document states the served version | Any MCP-capable agent |
| `https://monarkgate.tech/narabi/state.json` · `timeline.jsonl` | Narabi's tracker state and its append-only, per-line hash-chained daily timeline (one line per window, with the blocks it was read from) | Anyone replaying the tracker; the site's `/narabi` page |
| `https://bell.monarkgate.tech/state.json` · `timeline.jsonl` · `provenance.json` · `bell/pubkey.json` | MONARK Bell's signed publications: per-session fills, VWAP and volume for the listed tokenized equities, halt census, supply and proof-of-reserve residuals, the provenance of each run, the active Ed25519 key | Anyone verifying a publication; the site's `/bell` page |
| `https://monarkgate.tech` | The vitrine: every number on it is read from a committed, hashed copy of the served files above — never typed | Readers |

A surface that is not in this table is not served. A component that has no served surface is labelled
*named*, not *built*, wherever it appears.

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

| Side | Layer | What it is | Status |
|---|---|---|---|
| AI | **Backbone** — the gate | Hikae (coverage control) + the MONARK token's budget `B_t`; turns a sensor reading into `commit \| defer \| abstain` | **Built** — six frozen contracts (the sixth, AttestedBook, upcoming until served) |
| AI | **Sensors and acts** | the engine's agents: sensors that attest, acts that execute, one token across all of them | **4 built** (Shōgen · Hikae · Ukemi · Narabi) · **7 named** |
| AI | **Harness** — the door | the same engine made reachable *by other AI agents* over HTTP / MCP | **Built** — public 4-tool MCP endpoint (attest · gate · cascade · calibrate)  |
| AI | **Adaptation agents** | agents that recalibrate, onboard protocols, track liquidation mechanics and watch data sources | **Roadmap** — named, not shipped |
| DeFi | **Applications** — powered by the engine | one application per DeFi need, served with its own published artefacts | **1 built** (MONARK Bell) · **5 research leads** |

## The engine — AI side

**Built:**

- **Shōgen** — attested perception: an attested price testimony — origin and bytes, never truth.
- **Hikae** — coverage-controlled inference: the gate.
- **Ukemi** — liquidation-cascade survival: a recorder reads a lending protocol's liquidation book at an
  archive block under a keyless RPC quorum and digests it (the AttestedBook contract); the served gate class
  abstains (`under_calib`) until a committed calibration is served — stated plainly, not hidden.
- **Narabi** — redemption-run sensing. Its `AttestedFlow` attestation (the fifth frozen contract) and the
  velocity adapter ship in this repo; the public endpoint serves the gate class `stable-run-velocity-24h`
  with **a committed calibration for one population** — USDe — measured on calm onchain redemption-flow
  windows. That calibration is **measured non-stationary** across half-years, so no per-window coverage is
  claimed; the honesty sentence on the wire is the Barber, Candes, Ramdas and Tibshirani 2023 (Thm 2, unit
  weights) wording — *no coverage is measured*. **Every other population abstains** (`under_calib`).
  An off-tool **daily** sentinel steps the tracker at block finality and publishes a replayable timeline at
  `https://monarkgate.tech/narabi/` (`state.json`, `timeline.jsonl`, per-line hash-chained).

The single public sentence for Narabi, verbatim:

> Narabi runs an adaptive quantile tracker (Angelopoulos–Barber–Bates 2024, decaying step) on the attested daily USDe redemption flow: its state moves each 24h window from the realized outcome, and the full timeline is published so anyone can replay it. What it carries is a deterministic long-run bound that tightens as windows accumulate, printed daily with T, not a per-window coverage, not a probability; the gate's committed calibration does not depend on the tracker state. Until the pre-registered drift criterion fires and an ADR says otherwise, the gate's region is still the committed static calibration: the tracker adapts, the gate does not yet.

**What Narabi is NOT.** The bound printed daily is the Angelopoulos, Barber and Bates 2024 (Thm 1) quantity
`(B + η₁)/(T·η_T)` with `c = B = 1/24` and `ε = 0.1`. The published region is the tracker's, not the gate's:
the gate keeps the committed static calibration and does **not** change until the pre-registered drift
criterion (`rolling90_calm_miss ≥ 0.40`, evaluable after 90 calm pairs) fires and a published decision record says so. Not a
per-window coverage, not a probability of being right, not a price call.

**Replay them yourself.** Narabi: recompute every window from its `[from_block, to_block]` via
`eth_getLogs` + `totalSupply`, then re-derive `q` with the committed `trackerReplay` over the `s` column of
`timeline.jsonl`. Bell: verify each timeline line's Ed25519 signature against the published key, recompute
`state_sha256` from the served state, and rebuild the digest from the declared pools at the declared window
(`apps/bell`, `scripts/verify-bell.mjs`). The per-line hash chains make any rewrite detectable.

**Named on the engine's roadmap** (teasers — *not* delivered pieces, no metrics claimed): **Mokugeki**
(document / event attestation) · **Kaihi** (LVR / toxicity avoidance) · **Kessai** (swap execution,
transaction-cost analysis) · **Kamae** (inventory market-making) · **Kyokusen** (PT / YT curve) ·
**Koyomi** (weekend gap) · **Genkan** (the storefront / MCP entry point).

## The applications — DeFi side

Applications are what the engine is put to work on. Each one is derived from the same gate and the same
contracts, starts as an empirical study, and is served with its own published, replayable artefacts.

**Built and served:**

- **MONARK Bell** — the first application: a public, attested witness of **tokenized equities outside cash-market hours**: per
  session (pre, regular, after, overnight, weekend), the on-chain fills at the declared pools, their VWAP and
  volume, the trading-halt census and the supply / proof-of-reserve residuals — published as a signed,
  hash-chained timeline at `https://bell.monarkgate.tech/` (`state.json`, `timeline.jsonl`,
  `provenance.json`, the Ed25519 public key at `bell/pubkey.json`) with a reader-side verifier and the
  signing keyring in this repo. Never a price call; abstentions are counted and published as such.

**Development leads — research phase** (named, not delivered; no metrics, no dates):

- **MONARK Firebreak** — ride out an auto-deleveraging cascade on a perp venue rather than be caught in it.
- **MONARK Warden** — a least-privilege gate on a treasury a DAO or another agent controls.
- **MONARK Softlanding** — read the liquidation risk on a leveraged position and ease the exposure down before it clears.
- **MONARK Verdict** — turn a raw event call into a coverage-controlled, settled decision.
- **MONARK Ballast** — named; scope under study.

Each lead becomes an application the way Bell did: a study on chain data, a recorder, a frozen contract if one
is needed, a served host with a signed timeline — then, and only then, `built`.

## Maturity criteria

A component or an application is labelled `built` when all of the following hold; otherwise it is `named`:

1. **A study first.** A measurement on chain data, pre-registered where it can be (hypotheses and thresholds
   written before the run), with its artefacts committed and hashed next to the code.
2. **A frozen contract** if the piece speaks a new shape (six today; a seventh is a versioned change to the
   interface, not a patch).
3. **A served surface.** Its output is consumed by a live surface — an MCP/HTTP tool, a published file, a
   downstream component — not only by a test or a demo.
4. **An end-to-end integration test** that replays the composition, and a deployment check that runs the
   reader-side verifier against the served host.

The same criteria apply to a change in the engine: a recalibration, a new recorder, a new residual hypothesis.

## The studies behind the pieces

- **Narabi** — attested redemption flow of a stablecoin, read at block finality; calibration measured on calm
  windows and found non-stationary across half-years, which is why the served region says so instead of
  claiming a coverage. A pre-registered drift criterion decides when the gate may move.
- **Ukemi** — a lending protocol's liquidation book recorded at an archive block under a keyless RPC quorum,
  health factors cross-checked in exact fixed-point arithmetic, liquidations replayed along recorded oracle
  paths; hypotheses and outcomes of the calibration course are published on the site, digit for digit from
  the hashed report.
- **MONARK Bell** — a census of U.S. trading halts, session calendars with daylight-saving handling, the
  on-chain fills of tokenized equities at their declared pools read on two operators, and a signed
  publication protocol with an explicit earliest publication time.
- **Shōgen and Hikae** — a testimony format that carries bytes and residual hypotheses instead of truth, and
  a coverage-controlled gate whose region is auditable and whose budget is depletable.

Where a study finds nothing, the piece says so: an `abstain`, a named residual, a counted absence.

## The interlocking (why the pieces work together)

```
AI side — the MONARK engine
  sensors (attest)  →  the gate: Hikae + MONARK B_t  →  acts (execute · upcoming)
                            commit | defer | abstain
  harness (MCP / HTTP)  ·  adaptation agents: recalibrate · onboard · track · watch
                                        │
                                        ▼
DeFi side — the applications
  MONARK Bell (built, served)  ·  Firebreak · Warden · Softlanding · Verdict · Ballast (research)
```

Every application plugs into the same gate; every future sensor attests into the same contract shape; every
change to the engine meets the same maturity criteria.

## Verify it yourself

- **Bell.** Fetch `bell/pubkey.json`, then each line of `timeline.jsonl`: check its Ed25519 signature
  against the active key, recompute `state_sha256` from the served state and `provenance_sha256` from the
  served provenance, and follow `prev_line_hash` back to the genesis line. `scripts/verify-bell.mjs` does
  exactly this with Node alone; the deploy check it produces is committed in this repo.
- **Narabi.** Recompute every window from its `[from_block, to_block]` via `eth_getLogs` + `totalSupply`,
  then re-derive `q` with the committed `trackerReplay` over the `s` column of `timeline.jsonl`.
- **The site.** Every figure on `monarkgate.tech` is read from a file under `apps/site/data/` whose hash is
  pinned in `manifest.sha256.json` and compared byte for byte to the served file by a test.

## For agent builders

1. Add the endpoint (`hermes` / `openclaw` one-liners below) or install the skill.
2. Call `attest` for a price you must cite, `gate` for a claim you must act on, `cascade` for a lending
   position you must protect, `calibrate` to bring your own scores.
3. Read the answer as a region and a budget. On `abstain`, do nothing and say why — the reason is on the
   wire. No confidence score exists to be misread.
4. Read Bell and Narabi as files: they are published to be consumed by programs, not only by people.

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

## Reach the engine (the door for other AI agents)

The engine is reachable by any MCP-capable agent over one public endpoint:

- **MCP endpoint:** `https://mcp.monarkgate.tech/mcp` (HTTP/JSON mirror: `POST https://api.monarkgate.tech/{attest|gate|cascade|calibrate}`; the served `openapi.json` states the served version).
  Four tools: `attest · gate · cascade · calibrate`. Listed on the official MCP Registry as `tech.monarkgate/monark`.
- **Add it in one line:**

```bash
hermes mcp add monark --url https://mcp.monarkgate.tech/mcp
openclaw mcp add monark --url https://mcp.monarkgate.tech/mcp --transport streamable-http
```

No personal data is required to use the service (no account, e-mail, or wallet).

## Status

**Phase two — integration, served piece by piece.** The interface is frozen and the Hikae + Ukemi engines
are complete; Narabi and MONARK Bell are served with published, replayable timelines. The public projection
of this repository is produced by `scripts/export-public.mjs`.

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
  timelines) and an end-to-end execution test as the proof of composition.

## Layout

```
schemas/            JSON Schema — the language-neutral source of truth (closed)
packages/contracts  TS binding: types, closed-check, forbidden-keys, calib_digest, serializers, tests
packages/hikae      HAC-CP engine: L1 split / L2 monitor / L3 gate, interval conformer  (built)
packages/ukemi      liquidation-cascade survival: clearing, liquidable                  (built)
packages/monark     integration adapters: Shōgen→AttestedPrice, Narabi AttestedFlow→Prediction; canonical CBOR
packages/atelier    local demo surface (not a shipped application)
apps/harness        the MCP / HTTP harness — four tools over the frozen contracts (engine, AI side)
apps/sentinel       off-tool sentinels: Narabi daily tracker; Ukemi liquidation-book recorder (engine, AI side)
apps/bell           MONARK Bell — the first application (DeFi side): publisher, hash chain, verifier, public keyring
apps/site           public vitrine
skills/monark       the integration skill (MIT-0)
.github/workflows   CI (5 blocking jobs)
```

## Links

- **Site:** https://monarkgate.tech
- **Bell (attested witness):** https://bell.monarkgate.tech
- **Narabi (daily timeline):** https://monarkgate.tech/narabi/
- **MCP endpoint:** https://mcp.monarkgate.tech/mcp (HTTP/JSON mirror: POST https://api.monarkgate.tech/{attest|gate|cascade|calibrate})
- **Linktree:** https://linktr.ee/monarkgate

## License

Apache-2.0 — see [LICENSE](./LICENSE). The published integration skill is MIT-0.
