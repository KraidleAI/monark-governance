/**
 * The 32 kata class entries of wave 1 (lot CM-4a-ii-a, block B2 of 1.1.0; docs/G0-lot-cm-4a-ii.md G-1; spec section 9,
 * plan r3 section 5.2.1; A-2 section 2.2 point 2): the pinned class constants a kata table file must carry. n_min is
 * recomputed (n0 at the base test_delta); the class text is a parameter (published values: a dated line before F-5a).
 */
import type { ClassEntry } from "@monark/contracts";
import { zeroErrorFloor } from "@monark/hikae";

/** The base test_delta of a kata class (A-2 section 2.2 point 2), also the runs level and the TEST veto level. */
export const KATA_BASE_DELTA = "0.05";
/** The horizon of a kata class, in ms (the produced_at grid of CM-4b). */
export const KATA_H_MS: Readonly<Record<string, number>> = { "1h": 3_600_000, "4h": 14_400_000 };

/** The wave 1 kata class entries: {btc,eth,bnb,sol} x {dir,range,mae-down,mae-up} x {1h,4h}. */
export function kataClassEntries(text: (taskClass: string) => string): readonly ClassEntry[] {
  return ["btc", "eth", "bnb", "sol"].flatMap((sym) => ["dir", "range", "mae-down", "mae-up"].flatMap((fam) => ["1h", "4h"].map((h): ClassEntry => {
    const dir = fam === "dir";
    const task_class = `${sym}-${fam}-${h}`;
    const alpha = dir ? "0.45" : "0.01";
    return {
      task_class, region_kind: dir ? "set" : "interval", region_rule: dir ? "sign-set" : "scaled-band", qhat_unit: dir ? "score" : "scale",
      statement: "per-calibration", method: "risk-control", alpha, test_delta: KATA_BASE_DELTA, n_min: zeroErrorFloor(alpha, KATA_BASE_DELTA),
      h_ms: KATA_H_MS[h] ?? null, grid: true, cell_key_rule: "kata-bucket", cell_key_base: null, strata_cuts: null, label_schema: dir ? "up|down" : null,
      text: text(task_class),
    };
  })));
}

const KATA_KEY = /^kata:([a-z0-9]+(?:-[a-z0-9]+)*)@([a-z0-9]+(?:-[a-z0-9]+)*)\/([A-Z0-9]{2,20})\/([a-z0-9]+)$/;

/**
 * The kata key grammar (spec section 9; delegated decision CM-4b C-5): `kata:<kataId>@<venue>/<SYMBOL>/<h>`, kataId and
 * venue lower-case words joined by "-" (1 to 64 characters), SYMBOL 2 to 20 of A-Z 0-9 starting with the class's symbol
 * in upper case, <h> the class's horizon, no bucket. Grammar only: an unregistered kata or venue is a key with no row.
 * One predicate for the request check and the import guard. Returns why the key is refused, or undefined.
 */
export function kataKeyProblem(key: string, taskClass: string): string | undefined {
  const m = KATA_KEY.exec(key);
  const parts = taskClass.split("-");
  if (m === null || (m[1] ?? "").length > 64 || (m[2] ?? "").length > 64) return "is not kata:<kataId>@<venue>/<SYMBOL>/<h> (kataId, venue: 1 to 64 of a-z 0-9 and inner '-'; SYMBOL: 2 to 20 of A-Z 0-9)";
  const [sym, h] = [(parts[0] ?? "").toUpperCase(), parts.at(-1)];
  return (m[3] ?? "").startsWith(sym) && m[4] === h ? undefined : `does not match its class '${taskClass}' (SYMBOL starting with '${sym}', <h> '${String(h)}')`;
}

/** The tau cap of a kata dir class (spec section 9): a set of one label at most. Read by the policy_tau_cap refusal and by
 *  the kata clause of the gate description (block D, lot D-3; G2 N-5 of D-2). */
export const KATA_DIR_TAU_CAP = 1;
