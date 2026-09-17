# PROVENANCE — USDe (Ethena) stable-run velocity calibration (Lot F2-B, ADR-M008 Amendement bis)

Traceable origin for the FIRST committed MEASURED calibration of the `stable-run-velocity-24h` class:
`fixtures/usde-calib-series.json` (the raw 24h-window series) and `fixtures/usde-calib-scores.json` (the
613 nonconformity scores committed into `apps/harness/src/calibration.ts`). English by ADR-M003 D0.5.
This file is scanned by the vocabulary gate (`npm run gate:vocab`, scope `narabi_docs`): it carries no
performance or probability claim — a flow is measured under coverage, never scored.

## 1. Instrument (VERIFIED [lu] onchain at the scouting/pull)

- **Token**: `0x4c9EDD5852cd905f086C759E8383e09bff1E68B3` (Ethereum mainnet, CAIP-2 `eip155:1`), USDe, 18
  decimals; Etherscan "Verified — Exact Match", cross-checked Ethplorer.
- **Deploy block**: `18571358` (2023-11-14T16:32:35Z), the genesis anchor of the series.
- **Redemption = burn-to-0x0** via **EthenaMinting** (V1 `0x2CC4…8AFc3`, V2 `0xe349…62D3`): `redeem()`
  (whitelisted benefactors) ⇒ `usde.burnFrom(benefactor, amount)` ⇒ `Transfer(benefactor, 0x0, amount)`.
  Filtering `Transfer → 0x0` on the token captures BOTH versions. LayerZero OFT (lock-and-mint) does
  not burn ⇒ does not contaminate; mainnet only, omnichain out of scope. This is why the committed KEY
  carries the CHAIN (`eip155:1`): the SAME token on an L2 emits no redemption burn — a different law.

## 2. Acquisition (K-8, out of tool; read-only, no key)

`scripts/usde-full-pull.mjs` (committed out-of-tool acquisition method, NOT run by CI) pulled DAILY 24h UTC
windows [deploy .. 2025-10-16) over a pool of public archive RPC endpoints (round-robin, per-endpoint
cooldown on rate-limit, getLogs split on result-limit); NO API key, resumable JSONL. Per window: `burns`
(Transfer→0x0), `mints` (Transfer 0x0→), `supplyClose` and `supplyOpen` (`totalSupply` at the window bounds),
`[fromBlock, toBlock]`.

- **The committed ROOT is the sha-pinned series** `fixtures/usde-calib-series.json`, NOT any transient RPC
  session: the recompute domain is carried IN the fixture — the token `0x4c9EDD5852cd905f086C759E8383e09bff1E68B3`,
  the `Transfer → 0x0` redemption topic, and the `[fromBlock, toBlock]` bounds PRESENT PER WINDOW — so a third
  party recomputes every window against `eth_getLogs` from the committed bytes, independent of any live endpoint.
  (The series header field `"chain": "ethereum-mainnet"` is an INFORMAL label; the committed KEY uses CAIP-2
  `eip155:1` — the canonical form. The fixture is sha-pinned and is NOT edited.)
- **C1 identity (per-window integrity gate, fail-closed)**: `totalSupply(fromBlock−1) == supplyClose +
  burns − mints`. The committed series holds C1 on **every** window (`c1_fail = 0`), 0 errors, 695 calm +
  6 run = 701 windows. Series **sha256** (LF): `7c33027a0e4c6a72e6b390dd95aa2396f1f8c6cdcfee22f8abe729ba8dfc9ef1`
  (pinned in `apps/harness/test/usde-calibration.test.ts`).

## 3. Cross-checks of reproduction (C-6, PRE-REGISTERED data-integrity gate)

Reproduced onchain, tolerance ±0.5% magnitude / ±2 event counts:

| Date (UTC) | Quantity | Reproduced |
|---|---|---|
| 2025-10-11 | burns | 1 595 045 831.80 USDe / 908 burn events |
| 2025-03-01 | burns | 267 874 594.64 USDe / 66 burn events |
| 2025-02-21 | net Δ `totalSupply` | −123.26M USDe |

The 2025-03-01 magnitude ($267.9M) is documented in provenance but EXCLUDED by MAGNITUDE (the θ_stress
rule), not by any "legitimate vs artefact" judgement. The 2025-02-21 window (Bybit, net delta −123.26M) is
the single sourced day; the earlier 5-day width was unsourced and dropped.

## 4. Committed calibration — the pre-registered criterion (PLAN §3/§5)

- **Velocity** `v_t = burns/(S_open·Δ)`, Δ=24 (fraction of the OPENING stock redeemed per hour);
  `S_open = supplyClose + burns − mints` (window conservation). Predictor = persistence `v̂_t = v_{t−24h}`;
  nonconformity score `s_t = |v_t − v̂_t|` on CONSECUTIVE calm 24h windows.
- **Bootstrap floor** `S_open ≥ 1e25 wei` (10,000,000 USDe): excludes **30** early ramp windows.
- **Stress rule** (ONE symmetric mechanical ABSOLUTE rule, non-circular): drop a calm window iff
  `burns/S_open ≥ θ_stress = 0.01` (1% of the opening stock in 24h): excludes **28** windows.
- **Kept**: 637 calm windows; **403 active** (`burns ≥ 1e21` wei = 1000 USDe) ⇒ **ρ = 0.6327** (≥ ρ_min 0.30).
- **Support**: **n = 613** consecutive-calm pairs (≥ nMin 50); **α = 0.10**.
- **q̂ = 1.3119e-4 /h** (support 61); **q99 = 3.4009e-4 /h** (support 6); region non-degenerate (q̂ > 0).
- **Sensitivity WITHOUT the stress exclusion** (diagnostic, NEVER committed): q̂ = 2.487e-4, q99 = 1.221e-3.

## 5. Scale — recorder(1e6) ↔ adapter(1e12), DECLARED (A1)

The committed pull `scripts/usde-full-pull.mjs` computed `v_t_per_hr` at a **1e6** fixed-point scale
(`scripts/usde-full-pull.mjs:120`), while
the DEPLOYED adapter `packages/monark/src/adapter-narabi.ts` uses **1e12** (`RATIO_SCALE`). The committed
scores are the ADAPTER's (`scripts/record-usde-calib.mjs` rebuilds `AttestedFlow` objects from THIS series
and runs `fromAttestedFlow`), so they match exactly what the deployed predictor produces. The pull(1e6) ↔
adapter(1e12) per-score gap is a truncation artefact: **max |Δ| ≤ 4.11e-8, mean |Δ| ≈ 1.22e-8**. Under the
adapter scale the PRE-REGISTERED set HELD: q̂ and q99 kept supports 61 and 6 (no re-declaration). The
committed digest is `calibDigest` (ADR-M001 C5, float64_be sorted) over the adapter scores:
`c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c`.

## 6. Reproduce

```
node scripts/record-usde-calib.mjs      # series -> AttestedFlow -> adapter (1e12) -> scores -> calibDigest
                                         # prints COMMITTABLE + the pinned digest; rewrites the scores fixture
```

The recorder self-checks `calibDigest([0,1]) == 1e47beee…` (proving the C5 function, not a JSON look-alike)
and cross-checks q̂ against the production `splitQuantile` (L1) before declaring COMMITTABLE.
