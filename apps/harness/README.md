# @monark/harness — Lot H1

A **stateless MCP server** that exposes the **real HIKAE gate** primitive as one callable tool.
No stand-in: the tool composes the actual `@monark/hikae` policy (`conformalSet` / `conformInterval`
→ `buildVerdict` → `gate()`) and returns a **frozen, closed `GateDecision`** (`@monark/contracts`).
Free, pure, no persistence, no trading (ADR-M005 D1). Transport: MCP Streamable HTTP via
`createMcpHandler` (SDK v2, `@modelcontextprotocol/server`), bound to **`127.0.0.1:3001`** only.

## The `gate` tool

**Input** is an envelope `{ prediction, params }`:

- `prediction` — the **frozen `Prediction`** (`schemas/prediction.schema.json`, projected verbatim,
  `additionalProperties:false`; the SDK enforces the closed contract at the boundary).
- `params` — the **non-frozen** gate parameters (declared by the server, never in `schemas/`).

**Dispatch is on `prediction.task_class`** (ADR-M005 D5):

| `task_class`               | Path                          | Calibration                                   | Typical result |
|----------------------------|-------------------------------|-----------------------------------------------|----------------|
| `btc-dir-15m`              | `conformalSet` (region `set`) | committed **synthetic** (HIKAE S2a draw)      | a real decision (commit/defer/abstain) |
| `cascade-liquidable-24h`   | `conformInterval` (`interval`)| **none committed** ⇒ empty region             | **`abstain` / `under_calib`** (the honest, expected result — not a defect) |

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
| `nCalib`        | derived (btc-dir: committed calibration size; cascade: `0`) | K-4d |
| `verdict`       | built server-side (calibration ⇒ region) | D5 |

Any invalid param, an unknown `task_class`, or a wrong-typed `yhat` yields a **tool error**, never a
silent gate.

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
Deployment (systemd, HTTP mirror) is Lot H4 — the harness is deployed by the investor (ADR-M005 D10).
