# @monark/harness

A **stateless MCP server** (plus a **HTTP/JSON mirror**) that exposes the engine as three callable tools: the HIKAE
`gate`, the HIKAE BYO `calibrate` (ADR-M007) and the Genkan `judge`. The UKEMI `cascade` and the Shōgen `attest` were
archived at step 7 of `ROADMAP.md`. This document details the `gate` tool, then `calibrate` and `judge`; the mirror
and deployment are covered at the end.
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
| `cascade-liquidable-24h`   | `conformInterval` (`interval`)| **none committed** ⇒ no region (`region: null`) | **`abstain` / `under_calib`** (the honest, expected result — not a defect) |
| `stable-run-velocity-24h`  | `splitQuantile` + `buildIntervalRegion` (`interval`) | committed **per key** `(task_class, predictor_id)`: one **measured** population (USDe, calm-window redemption flow) | the committed key: `alpha = 0.1`, `nMin = 50` imposed (else a tool error, ADR-CM B-2), a real decision under the served wording (no coverage is measured; the band edges are taken from the score test of the specification, section 8); any other key: **`abstain` / `under_calib`** with the caller's `alpha`/`nMin` |
| `liquidation-eligible-coverage` | `splitQuantile` over the committed stratum, then the upper bound `[0, yhat + q̂]` (wire kind `interval`) | committed **per stratum** of `yhat`, the stratum derived server-side (the client `predictor_id` is ignored): stratum 0 of one recorded episode, **measured**; `alpha = 0.01`, `nMin = 100` imposed (else a tool error) | the committed stratum: a conformal **upper bound** (with a narrow `tauInterval`, `defer` / `interval_too_wide`); every other stratum: **`abstain` / `under_calib`** |
| any caller-owned class **with `params.calibration`** | BYO — `splitQuantile` over the caller's scores, then `buildIntervalRegion` (`interval` mode) or `conformalSet` over `candidates` (`set` mode) | **caller-supplied** (BYO, ADR-M007 D7) | a real decision on the caller's own model; `verdict.scores_sha256` (sha256 of the canonical writing of the caller's scores, in the order sent), `alpha` and `qhat` equal those of `calibrate`: the `calibrate`↔`gate` audit closes |
| the 32 kata classes `{btc,eth,bnb,sol}-{dir,range,mae-down,mae-up}-{1h,4h}` | their policy table files | **no row served** | after the kata request checks (key grammar, `features_digest`, the class's `alpha`/`nMin`, the `tau` cap on `dir`, the `yhat` type and domain, the `produced_at` grid and the 300 s staleness, each a named 400): **`abstain` / `under_calib`**, or `non_evaluable` for a lean of exactly 0 on a `dir` class |

**BYO (`params.calibration`, ADR-M007 D7).** Shape: `{ scores: number[], mode: "interval" \| "set",
candidates?: { label, score }[] }` (optional ⇒ existing committed-class calls are unchanged). `interval`
mode requires **every score `>= 0`** (a negative one ⇒ tool error before the region, B-6); `set` mode
requires a non-empty `candidates` list whose labels are printable ASCII, non-empty, unique, and free of
`|` (the `label_schema` separator; the schema is **derived** from the candidates, B-3). **Anti-override
guard:** a `calibration` supplied alongside a committed class (`btc-dir-15m`, `cascade-liquidable-24h`,
`liquidation-eligible-coverage`, or the committed `stable-run-velocity-24h` key) is a **tool error** — never a silent overwrite of a committed calibration. A caller-owned class name in the reserved kata pattern
`^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$` (compared without ASCII case) is refused with `byo_reserved_kata`, and a
lookalike of one with `byo_lookalike_confusable`. MONARK stores nothing;
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
| `remainingBudget`| `B_t`, remaining authorization capacity (D6). Depletion is out of scope (stateless); `suivi`, when present, can only lower it. | finite |
| `bFloor`         | `B_floor` threshold. | finite, `>= 0` |
| `tau`            | set-size threshold for the `set` path (`\|C\| <= tau` ⇒ commit). | finite, `>= 0` |
| `tauInterval`    | width threshold for the `interval` path. | finite, `>= 0` |
| `alpha`          | target miscoverage (used to conformalize). | finite, in `(0,1)` |
| `nMin`           | minimum calibration count. | integer, `>= 1` |
| `intent`         | the intent tested for containment. | `string \| number \| null` |
| `tool`           | the **named** gated tool — echoed into `GateDecision.tool`, **never invoked** (D0/D1). | non-empty string |
| `clockOpen`      | whether the coverage window is still open (the caller owns the window, K-4d). | boolean |
| `calibration`    | **OPTIONAL** BYO calibration (ADR-M007 D7): `{ scores, mode, candidates? }`. Present ⇒ the BYO conformal path (see above). | closed object; `mode ∈ {interval,set}`; `\|scores\| <= CALIBRATE_MAX_N`; interval ⇒ scores `>= 0`; set ⇒ non-empty, well-formed unique candidate labels |
| `suivi`          | **OPTIONAL** tracking evidence of the cell: `{ policy, evaluations, outcomes, open }`, replayed server-side; the gate reads `B_t = min(remainingBudget, replayed budget)` (see "Online tracking" below). | closed object; at most `SUIVI_MAX_N` (500) evaluations and outcomes, `SUIVI_MAX_BETS` (8) bets a mixture; the policy's class and cell are the request's |

### Caller-carried (in `prediction`, frozen)
`schema_version` (must be `1.1.0` — the server speaks one version; `1.0.0` is a 400 `schema_version_unsupported`), `task_class`, `yhat`,
`predictor_id`, `produced_at`. `produced_at` is the **carried instant** reused for the verdict — the
server **reads no clock**.

### Server-fixed / derived (never accepted from the caller)
| Field         | Value | Rule |
|---------------|-------|------|
| `schemaVersion` | fixed `"1.1.0"` | K-4c |
| `timedOut`      | `false` | K-4d — a pure server never invents an upstream timeout |
| `evaluable`     | derived from `yhat` | K-4d — right type but non-directional/non-finite `yhat` ⇒ `abstain`/`non_evaluable` (a decision); wrong-typed `yhat` ⇒ tool error |
| `nCalib`        | derived (cascade: `0`; stable-run: the committed key's size, else `0`; liquidation-eligible-coverage: the committed stratum's size, else `0`; a kata class: `0` (no row served); BYO: the caller's `scores.length`) | K-4d |
| `verdict`       | built server-side (calibration ⇒ region; BYO ⇒ the caller's scores) | D5 |

Any invalid param, an unknown or retired `task_class` (with no `calibration`), a BYO validation failure, a
`calibration` on a committed class (anti-override), or a wrong-typed `yhat` yields a **tool error**,
never a silent gate.

## Online tracking (`params.suivi`, step 6 of `ROADMAP.md`)

The caller carries the cell's tracking evidence, and the server replays it from the start on every call (`suiviReplay` of
`@monark/hikae`, pure; nothing is stored):

- `policy`: the closed `hikae-suivi-policy-v1` settings of the cell (22 keys, checked by `assertSuiviPolicy`). Its `task_class` must
  be the request's and its `cell_key` the verdict's `cell_key`.
- `evaluations`: the cell's reference evaluations from the start, on the policy's grid (`grid_ms`).
- `outcomes`: their arrived outcomes, `{ seq, resolved, member, miss }`.
- `open`: whether the segment was open (licensed) at the start.

The replay enters the labels in order. For each label it steps K and W (`o4Step`), then the detector (`detStep`), then closes an open
segment on an alarm (W closes first on a tie). The replayed budget is `floor(10^9 (1 - delta_exh * W)) / 10^9` on an open segment,
and `-1` otherwise (no licence yet, or closed: a closed segment stays closed). The gate reads `B_t = min(params.remainingBudget,
replayed budget)`. The tracking only lowers the caller's budget: it moves a decision toward `abstain` (`budget_exhausted`), never toward
`commit`. A call without `suivi` is unchanged. `judge` reads the same `params`, so it takes `suivi` too.

Refusals:

- outside the schema (an unknown key, a `miss` other than 0 or 1, more than 500 evaluations or outcomes, more than 8 bets a
  mixture): refused at the input boundary (`input_invalid`, 400 at the mirror);
- a policy of another class or cell, a BYO call (its verdict names no cell), a malformed policy, an evaluation off the grid, an
  outcome of no evaluation: a tool error `param_invalid`, whose message starts with `invalid param 'suivi': ` and names the cause.

Not done at this step:

- the policy's `keyring` is checked for shape, but no signature of an evaluation or an outcome is read;
- no tracking policy is committed server-side: the caller carries it. Committed policies per cell come with the calibration of the
  strategy's classes (step 3);
- the SR reading (`sr_reading_threshold`) and the M1 module are not served;
- "no licence yet" and "closed" both answer `budget_exhausted`. A reason of their own would change the frozen `GateDecision` contract:
  that is the founder's call;
- the replay re-checks every state on exact rationals, and its cost grows faster than n² (about 0.5 s at 500 labels with 8 bets a
  mixture, measured on 2026-11-04): hence the bounds.

## Committed calibrations

The `btc-dir-15m` calibration is **derived** from the HIKAE S2a instrument (`generateLabeledSeries`
over the committed `S2_DEFAULT.s2a` — `harness_version = "fixtures-synth"`, seed `101`, `n=300`) and
is **digest-pinned** (`scores_sha256` asserted equal to a committed constant at load, fail-closed). It is
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

## The `calibrate` tool

**Input** `{ scores, alpha, nMin }`: the caller's nonconformity scores (each finite, at most `CALIBRATE_MAX_N` = 10 000),
the miscoverage `alpha` in the open interval (0, 1) and the minimum count `nMin` (an integer `>= 1`); anything else is a
tool error. **Output** `{ qhat, n, alpha, method, scores_sha256, label, reason }`: `qhat` is the split-conformal quantile,
the ceil((n+1)(1-alpha))-th smallest score (`splitQuantileShortest` of `@monark/hikae`); `n < nMin`, or a rank above `n`,
gives `qhat: null` and `reason: "under_calib"`, never a clamped value. `scores_sha256` is `scoresSha256` of the scores in
the order sent, the same digest the gate's BYO verdict carries. The `label`, also the tool description and the `content`
text, states the exchangeability hypothesis the coverage rests on. MONARK stores nothing and commits no calibration: the
caller carries the scores to `gate` (`params.calibration`).

## The `judge` tool (Genkan's kernel)

`judge` links the gate to Genkan, the order gate (step 5 of `ROADMAP.md`). **Input**: the gate's envelope
`{ prediction, params, attested? }`, plus:

- `order` — `{ kind, target, asset, amount, assetOut?, minOut? }`, the fields of a GNK1 order: `kind` is one of
  `TRANSFER`, `APPROVE`, `SWAP`, `EXIT`, `OPEN`; a name is 1 to 128 characters of `0-9`, `a-z`, `:`, `.`, `_`, `/`, `@`,
  `-`; an integer is a decimal string, below 2^128; `assetOut` and `minOut` are a SWAP's, and only a SWAP's.
- `limits` — `{ venues, assets: [{ asset, cap }] }`: at most 255 of each, no name twice.

The tool runs the gate on the envelope (the same rules and the same refusals as `gate`), builds the kernel's context from
**that decision's action** and the caller's limits, and hands the mode 1 request to the kernel binary: `src/kernel.ts`
runs the binary that `lake build genkan-kernel` writes in `apps/genkan/kernel/.lake/build/bin`, by its path, with no
shell, no argument and an empty environment, killed after 10 s or past 64 bytes of stdout. It reads the answer with
`readVerdict`, fail-closed: an allow only for exit 0 and exactly the line `allow`. The gate runs first: an envelope it
refuses (a `produced_at` in the future, say) is a tool error for every order but an EXIT. An EXIT is judged even then (the
founder's decision of 2026-11-04), under the action abstain, since the kernel judges an EXIT whatever the action: `decision`
is then `null` and `gate_error` holds the gate's code and message. A malformed envelope, one the input schema refuses, is
still a 400 `input_invalid` for every order, an EXIT included. The kernel runs synchronously: each `judge` call holds
the server until the kernel answers (about 30 ms measured on Windows), at most 10 s; an asynchronous runner, capped, comes
before any deployment behind a public host.

**Output** `{ decision, gate_error, kernel_verdict, kernel_reason, reduce_only, kernel_request_sha256 }`: the gate's
`GateDecision`, or `null` with the gate's refusal in `gate_error` (an EXIT only);
`allow` or `deny`; `null`, or the reason of the deny: the kernel's (`kind`, `venue`, `not-commit`, `asset`, `over-cap`,
`asset-out`, `min-out`, `bad-ctx`, `bad-order`), `refused` (exit 3), `unreadable` (any other answer, a run killed past
its timeout or its cap included) or `unavailable` (no kernel ran: no runner, or a binary no process can be made of);
`reduce_only`, true for an allowed EXIT only; the sha256 of the request bytes. The `content` text says which: the kernel
judged the order, or (`refused`, `unreadable`, `unavailable`) it gave no verdict on it. A field outside the frames is a
tool error `param_invalid`, and no kernel runs.

`startServer` hands the tools the built kernel; `createHarnessHandler` and `handleJsonMirror` hand them the runner they are
given, and with none `judge` denies every order `unavailable`. What an allow does not say: the kernel knows no balance,
position, price or venue rule; a cap holds one order, not a total; a `minOut` above 0 is not a slippage bound; and an EXIT
on a listed venue passes whatever the gate decided, so whoever executes it must make it reduce-only. The tool places no
order. Tests: `test/judge.test.ts` (a fake kernel) and `test/judge.kernel.test.ts` (the real kernel through the served
server, in `npm run test:genkan`).

## HTTP/JSON mirror & deployment

One `127.0.0.1:3001` listener serves two surfaces, routed by Host: `mcp.monarkgate.tech` → the MCP tools
above; `api.monarkgate.tech` → a plain-JSON mirror of the **same** three tools and the **same** frozen
schemas.

- `POST /gate`, `POST /calibrate`, `POST /judge` — JSON body in,
  `{ structuredContent, content }` out (`structuredContent` is the frozen contract for gate, the
  K-1 envelope for calibrate, the output above for judge; the honesty text rides in `content`, K-1). A body that fails the
  frozen schema, or a tool refusal, is a `4xx`, never a silent result.
- `GET /openapi.json` — the OpenAPI 3.1 spec, **derived** from the frozen schemas (never hand-written).
- `GET /health` — liveness plus the operation list.
- The Origin guard (K-9) and the `127.0.0.1` bind apply to **both** surfaces.

Deployment: the harness runs as a systemd service behind Caddy, which terminates TLS and reverse-proxies
both sub-domains (`mcp.`/`api.`) to the loopback listener `127.0.0.1:3001`.
