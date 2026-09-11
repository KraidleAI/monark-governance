/**
 * Atelier market stubs (ADR-M002 D0/D11 test 27 `perps_stubs_throw`).
 * The two names are the ones gated by HIKAE (`GATED_TOOLS`). MONARK NEVER calls them —
 * neither real nor paper: they THROW if invoked. Trading is a future product, KAIZEN.
 */
export const PERPS_ORDER_PREVIEW = "perps_order_preview";
export const PERPS_ORDER_EXECUTE = "perps_order_execute";

function refuse(name: string): never {
  throw new Error(`${name}: MONARK places no order (ADR-M002 D0) — stub, never callable`);
}

export function perps_order_preview(): never {
  return refuse(PERPS_ORDER_PREVIEW);
}
export function perps_order_execute(): never {
  return refuse(PERPS_ORDER_EXECUTE);
}
