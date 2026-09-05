/**
 * HIKAE — prédicteurs Phase 1 (ADR-M002 D7 : baseline momentum DÉCLARÉE ; le prédicteur
 * LLM UsePod/Hermes, Python + clé API, est Phase 2).
 *
 * Convention d'indice D7/D8 (anti look-ahead) : `close[k]` = close de la bougie TERMINÉE
 * à l'instant `k`. Pour la fenêtre `[t, t+15)`, les features sont `close[t], close[t-15],
 * close[t-30], close[t-45], close[t-60]` (bougies terminées à un instant <= t) et
 * `ŷ = signe de close[t] - close[t-60]`. Le label `sign(close - open)` de `[t, t+15)`
 * n'est JAMAIS une feature (garde : test `features_strictly_before_t`).
 *
 * Aucune HORLOGE n'est lue ici ni dans `src/` (`Date.now()`, `new Date()` sans argument : interdits ;
 * formater un instant PORTÉ, `new Date(t*1000).toISOString()`, est licite — stabilité des hashes) —
 * tout instant (`close_time`, `t`) est une donnée portée / un paramètre injecté.
 */

/** Identifiants de prédicteur (préfixe `internal:` conservé d'ADR-M001). */
export const MOMENTUM_4C_ID = "internal:momentum-4c";
export const ORACLE_DIDACTIQUE_ID = "internal:oracle-didactique";

/** Une bougie 15 min terminée (grille UTC :00/:15/:30/:45). */
export interface Candle {
  /** Instant de FIN de bougie (secondes UTC, aligné 15 min). Donnée portée, jamais une horloge lue. */
  close_time: number;
  open: number;
  close: number;
}

/** Direction, ou non-évaluabilité (égalité stricte ⇒ `non_evaluable`, jamais un `flat` inventé). */
export type Direction = "up" | "down" | "non_evaluable";

/** `sign(a - b)` projeté sur `{up, down}` ; `a === b` ⇒ `non_evaluable`. */
export function signDirection(a: number, b: number): Direction {
  if (a > b) return "up";
  if (a < b) return "down";
  return "non_evaluable";
}

/**
 * Label réalisé de la bougie `[t, t+15)` : `y = sign(close - open)` (D8).
 * `close === open` ⇒ `non_evaluable` (le point est exclu, compté ; pas de 3e label).
 */
export function labelOf(candle: Candle): Direction {
  return signDirection(candle.close, candle.open);
}

/** Les 5 closes de features momentum : `[close[t], close[t-15], close[t-30], close[t-45], close[t-60]]`. */
export interface MomentumFeatures {
  readonly closes: readonly [number, number, number, number, number];
}

/**
 * close de la bougie terminée à `t - offsetMinutes*60`, avec GARDE anti look-ahead (D7) :
 * un `offsetMinutes < 0` (donc `close_time > t`, bougie terminée APRÈS `t`) est un
 * look-ahead — c'est une violation d'INTÉGRITÉ, pas un trou de données : on LÈVE.
 * `offsetMinutes = 0` (`close[t]`) est accepté.
 */
export function featureCloseAt(
  candlesByCloseTime: ReadonlyMap<number, Candle>,
  t: number,
  offsetMinutes: number,
): number {
  const closeTime = t - offsetMinutes * 60;
  if (closeTime > t) {
    throw new Error(
      `featureCloseAt: look-ahead interdit — offset ${offsetMinutes}m donne close_time=${closeTime} > t=${t} (D7).`,
    );
  }
  const c = candlesByCloseTime.get(closeTime);
  if (c === undefined) {
    throw new Error(`featureCloseAt: bougie manquante à close_time=${closeTime} (offset ${offsetMinutes}m).`);
  }
  return c.close;
}

/** Extrait les 5 features momentum à l'instant de décision `t` (toutes terminées <= t). */
export function extractMomentumFeatures(
  candlesByCloseTime: ReadonlyMap<number, Candle>,
  t: number,
): MomentumFeatures {
  return {
    closes: [
      featureCloseAt(candlesByCloseTime, t, 0),
      featureCloseAt(candlesByCloseTime, t, 15),
      featureCloseAt(candlesByCloseTime, t, 30),
      featureCloseAt(candlesByCloseTime, t, 45),
      featureCloseAt(candlesByCloseTime, t, 60),
    ],
  };
}

/**
 * Baseline `internal:momentum-4c` (D7) : `ŷ = signe de close[t] - close[t-60]`.
 * Égalité ⇒ `non_evaluable`. Aucune bougie terminée APRÈS `t` n'entre (garde `featureCloseAt`).
 */
export function momentum4c(f: MomentumFeatures): Direction {
  return signDirection(f.closes[0], f.closes[4]);
}

/**
 * Mutant `internal:oracle-didactique` (D7) : `ŷ = y` PAR CONSTRUCTION (via `labelOf`).
 * Ce n'est PAS un produit — il rend le chemin COMMIT visible pour la démo de MÉCANISME
 * (S2b), jamais une revendication de performance.
 */
export function oracleDidactique(candle: Candle): Direction {
  return labelOf(candle);
}
