/** MONARK atelier (Lot D) — public API: pure state + pure render + stubs that throw. */
export { buildState, distribution, plusMinutes, LABEL_WINDOW_MIN } from "./state.ts";
export type { AtelierState, Decision, ClockView, ShogenPanel, HikaePanel, UkemiPanel } from "./state.ts";
export { renderState, renderNav, renderSummary, renderAll, esc } from "./render.ts";
export {
  perps_order_preview,
  perps_order_execute,
  PERPS_ORDER_PREVIEW,
  PERPS_ORDER_EXECUTE,
} from "./market-stubs.ts";
export { loadRootFixtures } from "./fixtures-loader.ts";
