/**
 * HIKAE — Phase 1 predictors (ADR-M002 D7: DECLARED momentum baseline; the UsePod/Hermes
 * LLM predictor, Python + API key, is Phase 2).
 *
 * D7/D8 index convention (anti look-ahead): `close[k]` = close of the candle CLOSED
 * at instant `k`. For the window `[t, t+15)`, the features are `close[t], close[t-15],
 * close[t-30], close[t-45], close[t-60]` (candles closed at an instant <= t) and
 * `ŷ = sign of close[t] - close[t-60]`. The label `sign(close - open)` of `[t, t+15)`
 * is NEVER a feature (guard: test `features_strictly_before_t`).
 *
 * No CLOCK is read here or anywhere in `src/` (`Date.now()`, `new Date()` with no argument: forbidden;
 * formatting a CARRIED instant, `new Date(t*1000).toISOString()`, is allowed — hash stability) —
 * every instant (`close_time`, `t`) is carried data / an injected parameter.
 */

/** Predictor identifiers (`internal:` prefix kept from ADR-M001). */
export const MOMENTUM_4C_ID = "internal:momentum-4c";
export const ORACLE_DIDACTIQUE_ID = "internal:oracle-didactique";

/** One closed 15 min candle (UTC grid :00/:15/:30/:45). */
export interface Candle {
  /** Candle END instant (UTC seconds, 15 min aligned). Carried data, never a read clock. */
  close_time: number;
  open: number;
  close: number;
}

/** Direction, or non-evaluability (strict equality ⇒ `non_evaluable`, never an invented `flat`). */
export type Direction = "up" | "down" | "non_evaluable";

/** `sign(a - b)` projected onto `{up, down}`; `a === b` ⇒ `non_evaluable`. */
export function signDirection(a: number, b: number): Direction {
  if (a > b) return "up";
  if (a < b) return "down";
  return "non_evaluable";
}

/**
 * Realized label of the candle `[t, t+15)`: `y = sign(close - open)` (D8).
 * `close === open` ⇒ `non_evaluable` (the point is excluded, counted; no 3rd label).
 */
export function labelOf(candle: Candle): Direction {
  return signDirection(candle.close, candle.open);
}

/** The 5 momentum feature closes: `[close[t], close[t-15], close[t-30], close[t-45], close[t-60]]`. */
export interface MomentumFeatures {
  readonly closes: readonly [number, number, number, number, number];
}

/**
 * close of the candle closed at `t - offsetMinutes*60`, with an anti look-ahead GUARD (D7):
 * an `offsetMinutes < 0` (hence `close_time > t`, candle closed AFTER `t`) is a
 * look-ahead — that is an INTEGRITY violation, not a data gap: we THROW.
 * `offsetMinutes = 0` (`close[t]`) is accepted.
 */
export function featureCloseAt(
  candlesByCloseTime: ReadonlyMap<number, Candle>,
  t: number,
  offsetMinutes: number,
): number {
  const closeTime = t - offsetMinutes * 60;
  if (closeTime > t) {
    throw new Error(
      `featureCloseAt: look-ahead forbidden — offset ${offsetMinutes}m gives close_time=${closeTime} > t=${t} (D7).`,
    );
  }
  const c = candlesByCloseTime.get(closeTime);
  if (c === undefined) {
    throw new Error(`featureCloseAt: missing candle at close_time=${closeTime} (offset ${offsetMinutes}m).`);
  }
  return c.close;
}

/** Extracts the 5 momentum features at decision instant `t` (all closed <= t). */
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
 * Baseline `internal:momentum-4c` (D7): `ŷ = sign of close[t] - close[t-60]`.
 * Equality ⇒ `non_evaluable`. No candle closed AFTER `t` enters (guard `featureCloseAt`).
 */
export function momentum4c(f: MomentumFeatures): Direction {
  return signDirection(f.closes[0], f.closes[4]);
}

/**
 * Mutant `internal:oracle-didactique` (D7): `ŷ = y` BY CONSTRUCTION (via `labelOf`).
 * This is NOT a product — it makes the COMMIT path visible for the MECHANISM demo
 * (S2b), never a performance claim.
 */
export function oracleDidactique(candle: Candle): Direction {
  return labelOf(candle);
}
