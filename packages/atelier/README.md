# @monark/atelier — local demo screen (Phase 1, Lot D)

**Local** atelier (ADR-M002 D0/D1, hackathon cap): a page served on `127.0.0.1` that **replays the
9 frozen states** from root `fixtures/` — coverage verdict, **COMMIT / DEFER / ABSTAIN** decision with
its reason, **B_t that depletes**, **two clocks**, and the **Shōgen → HIKAE → UKEMI** chain in three
panels. Built for the judgment stream. Inspired by the Grok atelier (input), **our own code**.

```bash
npm run atelier --workspace @monark/atelier
```

## What the screen says — and does not say

- **Two clocks, named for what they are on fixtures**: "coverage before decision"
  (verdict timestamp) and "label arrived at t+w" (w = 15 min, `btc-dir-15m` beachhead, D8). The explanation
  "before the order / after the fill; the kill-switch is not a stop-loss" lives **here and in the ADR, not in
  the render**: MONARK places no order.
- **B_t** is the remaining authorization capacity (ADR-CERT-MONARK) — **never a yield**.
- **Calibrated silence = result**: 3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 `under_calib`, all visible.
- **UKEMI** is shown **not wired** (Phase 1) — nothing is simulated in its place.
- **No gate-vocab word** on screen: the whole package **and** the render pass `scripts/grep-forbidden.mjs`
  (test 26, mutant verified).

## Architecture (zero dependency, zero network)

| File | Role |
|---|---|
| `src/state.ts` | **pure state** from a frozen `GateDecision` (`@monark/contracts`, closed-check before any render) |
| `src/render.ts` | **pure render** into HTML strings (testable in node, no DOM) |
| `src/fixtures-loader.ts` | disk read of the 9 root states |
| `src/market-stubs.ts` | `perps_order_preview` / `perps_order_execute`: **throw** if invoked |
| `serve.js` | local `node:http` server; renders server-side, serves `index.html` / `style.css` / `main.js` |
| `main.js` | minimal DOM glue (state toggle) — **no data, no `fetch`** |

The package `tsconfig.json` adds `lib: DOM` without touching the root (D13); the TS modules stay
DOM-free, which keeps them typable and testable by the root.

## Tests (ADR-M002 D11, Lot D)

24 `atelier_state_oracle` · 25 `atelier_replays_root_fixtures` · 26 `atelier_no_forbidden_vocab` ·
27 `perps_stubs_throw` · 28 `atelier_no_network`. The H and U engines are consumed **by contract**
(fixtures); they wire in at their merge.
