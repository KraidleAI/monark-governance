# @monark/harness

A **stateless MCP server** (plus a **HTTP/JSON mirror**, Lot H4) that exposes the real engine primitives
— the HIKAE `gate`, the UKEMI `cascade`, the Shōgen `attest`, and the HIKAE BYO `calibrate` (Lot C1,
ADR-M007) — as callable tools. This document details the `gate` tool; the mirror and deployment are
covered at the end.
No stand-in: the `gate` tool composes the actual `@monark/hikae` policy (`conformalSet` / `conformInterval`
→ `buildVerdict` → `gate()`) and returns a **frozen, closed `GateDecision`** (`@monark/contracts`).
Free, pure, no persistence, no trading (ADR-M005 D1). Transport: MCP Streamable HTTP via
`createMcpHandler` (SDK v2, `@modelcontextprotocol/server`), bound to **`127.0.0.1:3001`** only.

## The `gate` tool

**Input** is an envelope `{ prediction, params }`:

- `prediction` — the **frozen `Prediction`** (`schemas/prediction.schema.json`, projected verbatim,
  `additionalProperties:false`; the SDK enforces the closed contract at the boundary).
- `params` — the **non-frozen** gate parameters (declared by the server, never in `schemas/`). The
  OPTIONAL `params.calibration` opens the **BYO** path (Lot C2, ADR-M007 D7): see below.

**Dispatch is on `prediction.task_class`** (ADR-M005 D5), UNLESS the caller supplies `params.calibration`
(then the BYO path runs, keyed on presence — see the BYO row):

| `task_class`               | Path                          | Calibration                                   | Typical result |
|----------------------------|-------------------------------|-----------------------------------------------|----------------|
| `btc-dir-15m`              | `conformalSet` (region `set`) | committed **synthetic** (HIKAE S2a draw)      | a real decision (commit/defer/abstain) |
| `cascade-liquidable-24h`   | `conformInterval` (`interval`)| **none committed** ⇒ empty region             | **`abstain` / `under_calib`** (the honest, expected result — not a defect) |
| any caller-owned class **with `params.calibration`** | BYO — `splitQuantile` over the caller's scores, then `buildIntervalRegion` (`interval` mode) or `conformalSet` over `candidates` (`set` mode) | **caller-supplied** (BYO, ADR-M007 D7) | a real decision on the caller's own model; `verdict.calib_digest = calibDigest(caller scores)` closes the `calibrate`↔`gate` audit |

**BYO (`params.calibration`, ADR-M007 D7).** Shape: `{ scores: number[], mode: "interval" \| "set",
candidates?: { label, score }[] }` (optional ⇒ existing committed-class calls are unchanged). `interval`
mode requires **every score `>= 0`** (a negative one ⇒ tool error before the region, B-6); `set` mode
requires a non-empty `candidates` list whose labels are printable ASCII, non-empty, unique, and free of
`|` (the `label_schema` separator; the schema is **derived** from the candidates, B-3). **Anti-override
guard:** a `calibration` supplied alongside a committed class (`btc-dir-15m` / `cascade-liquidable-24h`)
is a **tool error** — never a silent overwrite of the committed synthetic decision. MONARK stores nothing;
the caller carries `q̂` and `B_t` exactly as before (stateless, D6).

**Output** is the frozen `GateDecision` (`schemas/gate-decision.schema.json`, projected as the tool
`outputSchema`; its `verdict` `$ref` is mechanically dereferenced from `coverage-verdict.schema.json`).
The honesty declaration (`synthetic`, calibration digest, "B_t is caller-carried", the cascade
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
| `nCalib`        | derived (btc-dir: committed calibration size; cascade: `0`; BYO: the caller's `scores.length`) | K-4d |
| `verdict`       | built server-side (calibration ⇒ region; BYO ⇒ the caller's scores) | D5 |

Any invalid param, an unknown `task_class` (with no `calibration`), a BYO validation failure, a
`calibration` on a committed class (anti-override), or a wrong-typed `yhat` yields a **tool error**,
never a silent gate.

## Calibration (synthetic, committed)

The `btc-dir-15m` calibration is **derived** from the HIKAE S2a instrument (`generateLabeledSeries`
over the committed `S2_DEFAULT.s2a` — `harness_version = "fixtures-synth"`, seed `101`, `n=300`) and
is **digest-pinned** (`calibDigest` asserted equal to a committed constant at load, fail-closed). It is
**declared `synthetic`** — a plumbing fixture, not a measured predictor (ADR-M005 D5, C-8). No cascade
calibration exists, so that class abstains honestly.

## Transport & Origin

- Stateless: `createMcpHandler` builds a **fresh `McpServer` per request** — B_t is caller-carried, not
  server-held (D6). `keepAliveMs = 15000` (D7).
- Origin (K-9/C-1): a **present-and-invalid** `Origin` ⇒ **`403`**; an **absent** `Origin` ⇒ **accepted**
  (non-browser MCP clients send none). Allowlist: `monarkgate.tech` + sub-domains.
- Bind: **`127.0.0.1:3001`** only (K-8/C-10).

The listener starts only when `src/server.ts` is run directly; importing the module is side-effect-free.

## HTTP/JSON mirror & deployment (Lot H4)

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
