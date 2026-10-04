# @monark/harness

A **stateless MCP server** (plus a **HTTP/JSON mirror**) that exposes the real engine primitives
— the HIKAE `gate`, the UKEMI `cascade`, the Shōgen `attest`, and the HIKAE BYO `calibrate`
(ADR-M007) — as callable tools. This document details the `gate` tool; the mirror and deployment are
covered at the end.
No stand-in: the `gate` tool composes the actual `@monark/hikae` policy (`conformalSet` / `conformInterval`
→ `buildVerdict` → `gate()`) and returns a **frozen, closed `GateDecision`** (`@monark/contracts`).
Free, pure, no persistence, no trading (ADR-M005 D1). Transport: MCP Streamable HTTP via
`createMcpHandler` (SDK v2, `@modelcontextprotocol/server`), bound to **`127.0.0.1:3001`** only.

## The `gate` tool

**Input** is an envelope `{ prediction, params, attested? }`:

- `prediction` — the **frozen `Prediction`** (`schemas/prediction.schema.json`, projected verbatim,
  `additionalProperties:false`; the SDK enforces the closed contract at the boundary).
- `params` — the **non-frozen** gate parameters (declared by the server, never in `schemas/`). The
  OPTIONAL `params.calibration` opens the **BYO** path (ADR-M007 D7): see below.
- `attested` — OPTIONAL: a caller-carried frozen `AttestedPrice` (ADR-M017). Its subject must be DECLARED
  consistent with the served class (exact committed-URL membership); the gate runs no verifier on it at call time.
  No served class has a committed attestation subject (the retired `btc-dir-15m` held the only one), so any
  `attested` is refused: a tool error (`attested_inconsistent`; on `btc-dir-15m`, `task_class_retired`). The
  residual seam (`attested.residual` filed into `verdict.residual`) is therefore dormant on every served path.

**Dispatch is on `prediction.task_class`** (ADR-M005 D5), UNLESS the caller supplies `params.calibration`
(then the BYO path runs, keyed on presence — see the BYO row):

| `task_class`               | Path                          | Calibration                                   | Typical result |
|----------------------------|-------------------------------|-----------------------------------------------|----------------|
| `btc-dir-15m`              | **retired** (ADR 0005, 2026-09-30; ADR-CM B-5) | not served (the synthetic calibration stays committed for the fixtures) | **tool error** `task_class_retired` (400); the name stays reserved against BYO |
| `cascade-liquidable-24h`   | `conformInterval` (`interval`)| **none committed** ⇒ empty region             | **`abstain` / `under_calib`** (the honest, expected result — not a defect) |
| `stable-run-velocity-24h`  | `splitQuantile` + `buildIntervalRegion` (`interval`) | committed **per key** `(task_class, predictor_id)`: one **measured** population (USDe, calm-window redemption flow) | the committed key: `alpha = 0.1`, `nMin = 50` imposed (else a tool error, ADR-CM B-2), a real decision under the served wording (no coverage is measured; each band edge is the nearest double of yhat -/+ q̂, at most half an ulp of the edge away); any other key: **`abstain` / `under_calib`** with the caller's `alpha`/`nMin` |
| `liquidation-eligible-coverage` | `splitQuantile` over the committed stratum, then the upper bound `[0, yhat + q̂]` (wire kind `interval`) | committed **per stratum** of `yhat`, the stratum derived server-side (the client `predictor_id` is ignored): stratum 0 of one recorded episode, **measured**; `alpha = 0.01`, `nMin = 100` imposed (else a tool error) | the committed stratum: a conformal **upper bound** (with a narrow `tauInterval`, `defer` / `interval_too_wide`); every other stratum: **`abstain` / `under_calib`** |
| any caller-owned class **with `params.calibration`** | BYO — `splitQuantile` over the caller's scores, then `buildIntervalRegion` (`interval` mode) or `conformalSet` over `candidates` (`set` mode) | **caller-supplied** (BYO, ADR-M007 D7) | a real decision on the caller's own model; `verdict.calib_digest = calibDigest(caller scores)` closes the `calibrate`↔`gate` audit |

**BYO (`params.calibration`, ADR-M007 D7).** Shape: `{ scores: number[], mode: "interval" \| "set",
candidates?: { label, score }[] }` (optional ⇒ existing committed-class calls are unchanged). `interval`
mode requires **every score `>= 0`** (a negative one ⇒ tool error before the region, B-6); `set` mode
requires a non-empty `candidates` list whose labels are printable ASCII, non-empty, unique, and free of
`|` (the `label_schema` separator; the schema is **derived** from the candidates, B-3). **Anti-override
guard:** a `calibration` supplied alongside a committed class (`btc-dir-15m`, `cascade-liquidable-24h`,
`liquidation-eligible-coverage`, or the committed `stable-run-velocity-24h` key) is a **tool error** — never a silent overwrite of a committed calibration. MONARK stores nothing;
the caller carries `q̂` and `B_t` exactly as before (stateless, D6).

**Output** is the frozen `GateDecision` (`schemas/gate-decision.schema.json`, projected as the tool
`outputSchema`; its `verdict` `$ref` is mechanically dereferenced from `coverage-verdict.schema.json`).
The honesty declaration (calibration provenance, "B_t is caller-carried", the cascade
abstention sentence) rides in the tool result **`content` text**, never inside the closed decision (K-1).

## `GateInput` — field by field (who owns each field)

`GateInput` (HIKAE `l3-gate.ts`) is assembled by the server from the envelope. Ownership (C-3, K-4):

### Caller-carried (in `params`)
| Field            | Meaning | Server validation (K-4a) |
|------------------|---------|--------------------------|
| `remainingBudget`| `B_t`, remaining authorization capacity (D6). Depletion is out of scope (stateless). | finite |
| `bFloor`         | `B_floor` threshold. | finite, `>= 0` |
| `tau`            | set-size threshold for the `set` path (`\|C\| <= tau` ⇒ commit). | finite, `>= 0` |
| `tauInterval`    | width threshold for the `interval` path. | finite, `>= 0` |
| `alpha`          | target miscoverage (used to conformalize). | finite, in `(0,1)` |
| `nMin`           | minimum calibration count. | integer, `>= 1` |
| `intent`         | the intent tested for containment. | `string \| number \| null` |
| `tool`           | the **named** gated tool — echoed into `GateDecision.tool`, **never invoked** (D0/D1). | non-empty string |
| `clockOpen`      | whether the coverage window is still open (the caller owns the window, K-4d). | boolean |
| `calibration`    | **OPTIONAL** BYO calibration (ADR-M007 D7): `{ scores, mode, candidates? }`. Present ⇒ the BYO conformal path (see above). | closed object; `mode ∈ {interval,set}`; `\|scores\| <= CALIBRATE_MAX_N`; interval ⇒ scores `>= 0`; set ⇒ non-empty, well-formed unique candidate labels |

### Caller-carried (in `prediction`, frozen)
`schema_version` (must be `1.0.0` — the server speaks one version), `task_class`, `yhat`,
`predictor_id`, `produced_at`. `produced_at` is the **carried instant** reused for the verdict — the
server **reads no clock**.

### Server-fixed / derived (never accepted from the caller)
| Field         | Value | Rule |
|---------------|-------|------|
| `schemaVersion` | fixed `"1.0.0"` | K-4c |
| `timedOut`      | `false` | K-4d — a pure server never invents an upstream timeout |
| `evaluable`     | derived from `yhat` | K-4d — right type but non-directional/non-finite `yhat` ⇒ `abstain`/`non_evaluable` (a decision); wrong-typed `yhat` ⇒ tool error |
| `nCalib`        | derived (cascade: `0`; stable-run: the committed key's size, else `0`; liquidation-eligible-coverage: the committed stratum's size, else `0`; BYO: the caller's `scores.length`) | K-4d |
| `verdict`       | built server-side (calibration ⇒ region; BYO ⇒ the caller's scores) | D5 |

Any invalid param, an unknown or retired `task_class` (with no `calibration`), a BYO validation failure, a
`calibration` on a committed class (anti-override), or a wrong-typed `yhat` yields a **tool error**,
never a silent gate.

## Committed calibrations

The `btc-dir-15m` calibration is **derived** from the HIKAE S2a instrument (`generateLabeledSeries`
over the committed `S2_DEFAULT.s2a` — `harness_version = "fixtures-synth"`, seed `101`, `n=300`) and
is **digest-pinned** (`calibDigest` asserted equal to a committed constant at load, fail-closed). It is
**declared `synthetic`**, a plumbing fixture, not a measured predictor (ADR-M005 D5, C-8); since CM-2b the class is
retired and this calibration is no longer served (kept for the fixtures and the engine oracles). No cascade
calibration exists, so that class abstains honestly.

The `stable-run-velocity-24h` calibration is **measured** for ONE population (USDe, calm-window redemption flow),
keyed `(task_class, predictor_id)` and digest-pinned; it is measured non-stationary across half-years, so the served
wording states that no coverage is measured. Every other population abstains (`under_calib`).

The `liquidation-eligible-coverage` calibration is **measured** on one recorded episode (Aave v3 core, WETH
collateral): one-sided exceedance scores `max(Y - yhat, 0)` grouped by a-priori strata of `yhat`. Only a stratum that
reaches `nMin = 100` is committed (today stratum 0, n = 170; since n < 199 its q̂ is the stratum maximum, reported as
is), digest-pinned and checked at load; the served region is the upper bound `[0, yhat + q̂]` and the other strata
abstain. The registry entries are written by an emitter from the output of a frozen generator, never by hand.

## Transport & Origin

- Stateless: `createMcpHandler` builds a **fresh `McpServer` per request** — B_t is caller-carried, not
  server-held (D6). `keepAliveMs = 15000` (D7).
- Origin (K-9/C-1): a **present-and-invalid** `Origin` ⇒ **`403`**; an **absent** `Origin` ⇒ **accepted**
  (non-browser MCP clients send none). Allowlist: `monarkgate.tech` + sub-domains.
- Bind: **`127.0.0.1:3001`** only (K-8/C-10).

The listener starts only when `src/server.ts` is run directly; importing the module is side-effect-free.

## HTTP/JSON mirror & deployment

One `127.0.0.1:3001` listener serves two surfaces, routed by Host: `mcp.monarkgate.tech` → the MCP tools
above; `api.monarkgate.tech` → a plain-JSON mirror of the **same** four tools and the **same** frozen
schemas.

- `POST /gate`, `POST /cascade`, `POST /attest`, `POST /calibrate` — JSON body in,
  `{ structuredContent, content }` out (`structuredContent` is the frozen contract for gate/cascade, the
  K-1 envelope for attest/calibrate; the honesty text rides in `content`, K-1). A body that fails the
  frozen schema, or a tool refusal, is a `4xx`, never a silent result.
- `GET /openapi.json` — the OpenAPI 3.1 spec, **derived** from the frozen schemas (never hand-written).
- `GET /health` — liveness plus the operation list.
- The Origin guard (K-9) and the `127.0.0.1` bind apply to **both** surfaces.

Deployment: the harness runs as a systemd service behind Caddy, which terminates TLS and reverse-proxies
both sub-domains (`mcp.`/`api.`) to the loopback listener `127.0.0.1:3001`.
