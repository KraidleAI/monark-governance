/**
 * Policy table files `class-policy-v2` (spec section 10, plan r3 sections 5.1 to 5.2.1; lot CM-3c-1, block A): the
 * qhat units, the table enums, the ClassEntry and PolicyRow types and their closed checks. The row format is fixed
 * here (delegated decision of 2026-10-04 on Q-1, approved by MONARK): 60 keys, all present, null when a column does
 * not apply. The check holds the shape: exact keys, JSON types, safe integers, enums, 64-hex digests, the numeric
 * grammars, the closed list of a marginal row and the structural couplings. The import guard holds the rest: the
 * projection, the arithmetic, the grammars of reasons, causes, epoch and calendar ids, verifier names, the length of
 * scale_table.values per kind, and the couplings with source.wave. The types are derived from the check shapes.
 */
import { sha256Canonical } from "./canonical.ts";

export const QHAT_UNITS = ["label", "scale", "score"] as const;
export const REGION_RULES = ["sign-set", "scaled-band", "additive-band", "upper-bound"] as const;
export const ROW_STATUSES = ["region", "silence", "vetoed", "under_calib", "retired"] as const;
export const STATEMENTS = ["per-calibration", "marginal"] as const;
export const CELL_KEY_RULES = ["kata-bucket", "committed-key", "liq-stratum"] as const;
export const SCORE_ORDERS = ["time", "ascending"] as const;
export const CHECK_OUTCOMES = ["pass", "reject", "empty"] as const;
export type QhatUnit = (typeof QHAT_UNITS)[number];

type Check<T> = (v: unknown, at: string) => T;
type Shape = Record<string, Check<unknown>>;
type Of<S extends Shape> = { readonly [K in keyof S]: ReturnType<S[K]> };

const fail = (at: string, what: string): never => {
  throw new Error(`MONARK policy check: ${at} ${what}.`);
};
const is = <T>(ok: (v: unknown) => boolean, what: string): Check<T> => (v, at) => (ok(v) ? (v as T) : fail(at, `is not ${what}`));
const str = is<string>((v) => typeof v === "string", "a string");
const bool = is<boolean>((v) => typeof v === "boolean", "a boolean");
const num = is<number>((v) => typeof v === "number" && Number.isFinite(v), "a finite number");
const pos = is<number>((v) => typeof v === "number" && Number.isFinite(v) && v > 0, "a finite number > 0");
const int = (min: number, max = Number.MAX_SAFE_INTEGER): Check<number> =>
  is((v) => Number.isSafeInteger(v) && (v as number) >= min && (v as number) <= max, `a safe integer in [${String(min)}, ${String(max)}]`);
const re = (r: RegExp): Check<string> => is((v) => typeof v === "string" && r.test(v), `a string ${String(r)}`);
const dec = is<string>((v) => typeof v === "string" && Number.isFinite(Number(v)) && String(Number(v)) === v, "a shortest round-trip decimal");
const oneOf = <const T extends readonly unknown[]>(xs: T): Check<T[number]> => is((v) => xs.includes(v), `one of ${xs.join(" | ")}`);
const nul = <T>(c: Check<T>): Check<T | null> => (v, at) => (v === null ? null : c(v, at));
const arr = <T>(c: Check<T>): Check<readonly T[]> => (v, at) => (Array.isArray(v) ? v.map((x, i) => c(x, `${at}[${String(i)}]`)) : fail(at, "is not an array"));
const obj = <S extends Shape>(shape: S): Check<Of<S>> => (v, at) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return fail(at, "is not an object");
  const o = v as Record<string, unknown>;
  for (const k of Object.keys(o)) if (!Object.hasOwn(shape, k)) fail(at, `has an unknown key '${k}' (closed contract)`);
  for (const k of Object.keys(shape)) if (!Object.hasOwn(o, k)) fail(at, `misses the key '${k}' (null is written, never omitted)`);
  for (const [k, c] of Object.entries(shape)) c(o[k], `${at}.${k}`);
  return v as Of<S>;
};

const HEX64 = re(/^[0-9a-f]{64}$/);
const U_TEST = re(/^(1|0\.[0-9]{7})$/);
const COUNT = re(/^(0|[1-9][0-9]*)$/);
const COUNT1 = re(/^[1-9][0-9]*$/);
/** One shared block type for test, bridge and fwd (TEST or TEST-2, the wave 2 bridge, FWD-2). */
const VETO_BLOCK = obj({ k_test: nul(int(0)), n_test: int(0), u_test: nul(U_TEST) });

const CLASS_SHAPE = {
  task_class: str, region_kind: oneOf(["set", "interval"] as const), region_rule: oneOf(REGION_RULES), qhat_unit: oneOf(QHAT_UNITS),
  statement: oneOf(STATEMENTS), method: oneOf(["risk-control", "split"] as const), alpha: nul(dec), test_delta: nul(dec),
  n_min: nul(int(1)), h_ms: nul(int(1)), grid: bool, cell_key_rule: oneOf(CELL_KEY_RULES), cell_key_base: nul(str),
  strata_cuts: nul(arr(int(1))), label_schema: nul(str), text: str,
};

const ROW_SHAPE = {
  row_format: oneOf(["class-policy-v2"] as const), task_class: str, cell_key: str, region_rule: oneOf(REGION_RULES), current: bool,
  kata_id: nul(str), w: nul(int(1)), venue: nul(str), symbol: nul(str), horizon: nul(oneOf(["15m", "1h", "4h", "24h"] as const)),
  side: nul(oneOf(["up", "down"] as const)),
  bucket: nul(oneOf(["up-b1", "up-b2", "up-b3", "down-b1", "down-b2", "down-b3", "b0"] as const)),
  thresholds: nul(obj({ t1: dec, t2: dec })),
  scale_table: nul(obj({ kind: oneOf(["hour-of-week", "us-profile"] as const), values: arr(nul(pos)), sha256: HEX64 })),
  calib_support: nul(obj({ min: pos, max: pos })), fit_sha256: nul(HEX64),
  statement: oneOf(STATEMENTS), alpha: re(/^0\.[0-9]{0,3}[1-9]$/), test_delta: nul(dec), calib_attempt: int(1, 4), calib_cause: nul(str),
  calib_parent: nul(re(/^(none|[0-9a-f]{64})$/)), epoch: nul(int(1)), bound_on: nul(oneOf(["commit", "region"] as const)),
  tau_cap: nul(int(1, 1)), n_min: int(1),
  n: int(0), k_star: nul(int(0)), p_served: nul(int(1)), k_obs: nul(int(0)), misses: nul(int(0)), qhat: nul(num),
  miss_bound: nul(re(/^0\.[0-9]{7}$/)), marginal_alpha: nul(re(/^0\.[0-9]{4}$/)), aux_seq: nul(oneOf(["label", "score"] as const)),
  runs_miss: nul(oneOf(CHECK_OUTCOMES)), runs_aux: nul(oneOf(CHECK_OUTCOMES)), tail_frac: nul(str), runs_level: nul(str),
  tail_m: nul(int(0)), tail_a: nul(int(0)), tail_tail_num: nul(COUNT), tail_tail_den: nul(COUNT1),
  miss_adj_a: nul(int(0)), miss_adj_tail_num: nul(COUNT), miss_adj_tail_den: nul(COUNT1),
  test: nul(VETO_BLOCK), bridge: nul(VETO_BLOCK), fwd: nul(VETO_BLOCK),
  vetoes: nul(obj({ test: bool, bridge: nul(bool), fwd: nul(bool) })),
  status: oneOf(ROW_STATUSES), status_reason: str,
  retire: nul(obj({ cause: str, k_test: nul(int(0)), n_test: nul(int(0)), u_test: nul(U_TEST) })),
  scores_sha256: HEX64, aux_sha256: nul(HEX64), series_sha256: nul(HEX64), order: oneOf(SCORE_ORDERS),
  source: obj({ registry_file: str, registry_sha256: HEX64, trial_id: nul(str), wave: nul(int(1)), generator: str }),
  recompute: nul(obj({ verifier: str, scores_sha256: HEX64, report_sha256: HEX64 })),
  text: str,
};

export type ClassEntry = Of<typeof CLASS_SHAPE>;
export type PolicyRow = Of<typeof ROW_SHAPE>;
export type PolicyTable = { readonly row_format: "class-policy-v2"; readonly class: ClassEntry; readonly rows: readonly PolicyRow[] };

/** The closed key lists of the table file formats (apart from ALLOWED_KEYS: their schemas enter in block C). */
export const POLICY_ALLOWED_KEYS = { classEntry: Object.keys(CLASS_SHAPE), policyRow: Object.keys(ROW_SHAPE) } as const;

/** The columns a marginal row may set (spec section 10); every other column of a marginal row is null. */
const MARGINAL_SET = [
  "row_format", "task_class", "cell_key", "region_rule", "current", "statement", "alpha", "calib_attempt", "n_min", "n",
  "p_served", "qhat", "marginal_alpha", "status", "status_reason", "retire", "scores_sha256", "order", "source", "text",
];

const need = (ok: boolean, at: string, what: string): void => {
  if (!ok) fail(at, what);
};

export function assertClosedClassEntry(value: unknown, at = "ClassEntry"): void {
  const c = obj(CLASS_SHAPE)(value, at);
  const cuts = c.strata_cuts ?? [];
  need(cuts.every((x, i) => i === 0 || x > (cuts[i - 1] as number)), `${at}.strata_cuts`, "is not strictly increasing");
}

export function assertClosedPolicyRow(value: unknown, at = "PolicyRow"): void {
  const r = obj(ROW_SHAPE)(value, at);
  const pair = (a: unknown, b: unknown): boolean => (a === null) === (b === null);
  need(pair(r.vetoes, r.test) && pair(r.vetoes?.bridge ?? null, r.bridge) && pair(r.vetoes?.fwd ?? null, r.fwd), at, "has vetoes not matching its test, bridge and fwd blocks");
  need((r.retire !== null) === (r.status === "retired"), at, "has retire not null exactly when status is retired");
  need(pair(r.tail_tail_num, r.tail_tail_den) && pair(r.miss_adj_tail_num, r.miss_adj_tail_den), at, "has a tail numerator without its denominator");
  need(r.side === (r.bucket === null || r.bucket === "b0" ? null : r.bucket.split("-")[0]), at, "has a side that does not lead its bucket");
  need(pair(r.miss_bound, r.bound_on) && (r.miss_bound === null || r.status === "region"), at, "has miss_bound and bound_on not both set on a region row");
  const signSet = r.region_rule === "sign-set";
  need((r.tau_cap !== null) === signSet && (!signSet || (r.scale_table === null && r.calib_support === null)), at, "breaks the sign-set columns");
  need(r.scale_table === null || r.scale_table.sha256 === sha256Canonical(r.scale_table.values), `${at}.scale_table`, "has a sha256 that is not the digest of its values");
  if (r.statement !== "marginal") return;
  for (const [k, v] of Object.entries(r)) need(MARGINAL_SET.includes(k) || v === null, `${at}.${k}`, "is set on a marginal row");
  need(r.p_served !== null && r.qhat !== null && r.marginal_alpha !== null, at, "is a marginal row without p_served, qhat and marginal_alpha");
}

export function assertClosedPolicyTable(value: unknown): void {
  const any: Check<unknown> = (v) => v;
  const t = obj({ row_format: oneOf(["class-policy-v2"] as const), class: any, rows: arr(any) })(value, "PolicyTable");
  assertClosedClassEntry(t.class, "PolicyTable.class");
  t.rows.forEach((row, i) => assertClosedPolicyRow(row, `PolicyTable.rows[${String(i)}]`));
}
