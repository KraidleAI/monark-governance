---
name: monark
description: A coverage-controlled gate for agents. You bring your own predictor and nonconformity scores; MONARK calibrates a split-conformal region and returns commit / defer / abstain over YOUR prediction over one public MCP endpoint. Never a probability of being right, never permission to execute a tool. Four tools - attest, gate, cascade, calibrate.
license: MIT-0
---

# MONARK - a coverage-controlled gate for agents

MONARK exposes four pure tools over one public MCP endpoint: `{attest, gate, cascade, calibrate}`.
It gates a **prediction**, never an **act**: **gate never executes the named tool**. The decision is
one of **commit / defer / abstain**; **B_t is caller-carried; never a probability of being right**.
**attest is demonstrative, not probative** - it replays a committed witness, it does not prove an
outcome. This skill is a reference implementation of a coverage-controlled gate; adopt the contract.

## The BYO loop: `calibrate` then `gate`

The real path is **bring your own**: you own the predictor and the nonconformity score function.
`calibrate` turns YOUR nonconformity scores into a split-conformal region; `gate` then returns a
coverage verdict on YOUR next prediction under that region. MONARK stores nothing between calls, and
the audit `calibrate` to `gate` closes when the verdict's `scores_sha256`, `alpha` and `qhat` equal those of `calibrate`.

### `calibrate` - the honesty label (verbatim)

The `calibrate` tool carries exactly this label, on its description, its result content, and its
output field alike:

> split-conformal quantile at miscoverage α over caller-supplied nonconformity scores. MONARK does not see, store, or verify the caller's data or model, and does not validate that the supplied numbers are nonconformity scores of any model. Marginal 1−α coverage holds ONLY for future points exchangeable with the supplied scores; non-exchangeable data (e.g. distribution-shifted or time-ordered) voids it. Never a probability of being right.

## What a verdict is, and what it is NOT

- **commit / defer / abstain** are the three actions; **B_t is caller-carried; never a probability of
  being right**.
- **gate never executes the named tool** - it gates YOUR prediction, not YOUR act.
- **The B_t mechanism - read this before wiring any budget.** B_t is a number YOU pass in each call; MONARK never measures, derives, or stores it (stateless); it is compared only to YOUR bFloor (below it ⇒ budget_exhausted). It is NOT a $/token spend cap and NOT a rate-limit. `allow` is a coverage verdict on YOUR prediction, NOT permission to execute the named tool (MONARK never executes it). MONARK does not evaluate the legitimacy of an act and does not predict prices — it gates YOUR predictions. For a $/token spend cap, use your platform's spend controls; MONARK is not that.

MONARK offers no guarantee of availability. It does not predict prices and does not judge whether an
act is legitimate; it gates the coverage of YOUR prediction and nothing else.

### The `gate` envelope: `{prediction, params}`, and the `attested` key (refused today)

`gate` takes `{prediction, params}` — both required, unchanged. Its contract also declares an OPTIONAL
`attested: AttestedPrice` — an attested price testimony (origin and bytes, never truth) whose
`attested.subject` must be a URL committed for that `task_class`. No served class has a committed
attestation subject (the retired `btc-dir-15m` held the only one), so **any `attested` is refused** today
(a named 400, `attested_inconsistent`), never accepted silently: do not send it. `attested` never enters
the coverage math and makes no claim that the price is true; there is no temporal binding in this phase.

## Operational surface

A public, unauthenticated endpoint, no availability commitment; bounded: n ≤ 10000 scores, request
body ≤ 256 KB. A verdict below your `bFloor` returns `budget_exhausted`; out-of-calibration input
returns `under_calib` and abstains - no success is invented.

## The built-in fixture class is NOT a use case

The built-in `task_class` `cascade-liquidable-24h` is an internal **plumbing fixture**, not a use case and not
an endorsement: it ships no calibration at all, so it abstains (`under_calib`). The former fixture `btc-dir-15m`
is retired and not served (a call to it returns a named 400, `task_class_retired`; its declared **synthetic**
calibration is no longer served). They are NOT use cases. The real path is BYO: bring your own predictor +
nonconformity scores.

Two other `task_class`es are served with a committed calibration. `liquidation-eligible-coverage` has one committed stratum, s0 (the server imposes `alpha = 0.01` and `nMin = 100`); `stable-run-velocity-24h` (redemption-run velocity, the Narabi sensor) is **served by
this endpoint** with a **committed calibration for one population** — USDe, key
`narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3`, measured on calm onchain
redemption-flow windows. The calibration is measured non-stationary across half-years, so **no per-window
coverage is claimed**; the committed region is static and **every other population abstains** (`under_calib`).
On that key the server imposes `alpha = 0.1` and `nMin = 50` (any other value is a named 400).
Alongside it, an off-tool **daily** sentinel steps an adaptive quantile tracker on the attested 24h flow and
publishes a replayable timeline (`state.json`, `timeline.jsonl`) at `monarkgate.tech/narabi/`; the committed
gate region does not change until a pre-registered drift criterion fires and an ADR says so.

The 32 kata classes `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}` are also served, without calibration: the gate abstains on every well-formed call (`under_calib`, or `non_evaluable` for a lean of exactly 0 on a `dir` class), and a malformed one is a named 400. Do not bring your own calibration under a class name of the form `^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$` (compared without ASCII case): it is refused (`byo_reserved_kata`).

## Endpoint and license

- Endpoint: `https://mcp.monarkgate.tech/mcp` (HTTP/JSON mirror: `POST https://api.monarkgate.tech/{attest|gate|cascade|calibrate}`).
- Install on each runtime: see `INTEGRATION.md`.
- This skill is licensed under **MIT-0** (MIT No Attribution); see `LICENSE`. The MONARK harness is a
  separate, Apache-2.0 codebase - only this descriptive skill is MIT-0.
