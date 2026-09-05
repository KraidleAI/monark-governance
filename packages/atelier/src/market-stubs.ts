/**
 * Stubs de marché de l'atelier (ADR-M002 D0/D11 test 27 `perps_stubs_throw`).
 * Les deux noms sont ceux gatés par HIKAE au Lot H (`GATED_TOOLS`). MONARK ne les appelle JAMAIS —
 * ni réel, ni papier : ils LÈVENT s'ils sont invoqués. Le trading est un produit futur, KAIZEN.
 */
export const PERPS_ORDER_PREVIEW = "perps_order_preview";
export const PERPS_ORDER_EXECUTE = "perps_order_execute";

function refuse(name: string): never {
  throw new Error(`${name} : MONARK ne passe aucun ordre (ADR-M002 D0) — stub, jamais appelable`);
}

export function perps_order_preview(): never {
  return refuse(PERPS_ORDER_PREVIEW);
}
export function perps_order_execute(): never {
  return refuse(PERPS_ORDER_EXECUTE);
}
