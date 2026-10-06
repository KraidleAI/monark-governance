/**
 * Registry cell -> `class-policy-v2` row (lot CM-4a-i, block B1 of 1.1.0; docs/G0-lot-cm-4a-i.md; A-2 section 2.2 point 1;
 * projection table of the delegated decision on PolicyRow). A closed reader of one wave 1 registry cell (FORMAT.md, "Row
 * fields") and the deterministic projection of a cell into a row. A direction side without thresholds has no row
 * (reading L-1, accepted by MONARK); any other form of such a cell is refused. Inputs outside the registry are parameters.
 */
import { assertClosedPolicyRow, sha256Canonical, type PolicyRow } from "@monark/contracts";
import { ceilDecimal4, zeroErrorFloor } from "@monark/hikae";

type Check<T> = (v: unknown, at: string) => T;
type Shape = Record<string, Check<unknown>>;
type Of<S extends Shape> = { readonly [K in keyof S]: ReturnType<S[K]> };
const bad = (at: string, what: string): never => {
  throw new Error(`MONARK registry cell: ${at} ${what}.`);
};
const is = <T>(ok: (v: unknown) => boolean, what: string): Check<T> => (v, at) => (ok(v) ? (v as T) : bad(at, `is not ${what}`));
const str = is<string>((v) => typeof v === "string", "a string");
const num = is<number>((v) => typeof v === "number" && Number.isFinite(v), "a finite number");
const int = is<number>((v) => Number.isSafeInteger(v) && (v as number) >= 0, "a safe integer >= 0");
const bool = is<boolean>((v) => typeof v === "boolean", "a boolean");
const hex = is<string>((v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v), "a 64-hex digest");
const lit = <const T extends readonly unknown[]>(xs: T): Check<T[number]> => is((v) => xs.includes(v), `one of ${xs.join(" | ")}`);
const nul = <T>(c: Check<T>): Check<T | null> => (v, at) => (v === null ? null : c(v, at));
const arr = <T>(c: Check<T>): Check<readonly T[]> => (v, at) => (Array.isArray(v) ? v.map((x, i) => c(x, `${at}[${String(i)}]`)) : bad(at, "is not an array"));
const plain = (v: unknown, at: string): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : bad(at, "is not an object");
const obj = <S extends Shape>(shape: S): Check<Of<S>> => (v, at) => {
  const o = plain(v, at);
  for (const k of Object.keys(o)) if (!Object.hasOwn(shape, k)) bad(at, `has an unknown key '${k}' (closed format)`);
  for (const [k, c] of Object.entries(shape)) c(Object.hasOwn(o, k) ? o[k] : bad(at, `misses the key '${k}'`), `${at}.${k}`);
  return v as Of<S>;
};
const rec = <T>(c: Check<T>): Check<Readonly<Record<string, T>>> => (v, at) => {
  for (const [k, x] of Object.entries(plain(v, at))) c(x, `${at}.${k}`);
  return v as Record<string, T>;
};
const CHECK = lit(["pass", "reject", "empty", "n/a"] as const);

const CELL = obj({
  taskClass: str, key: str, kataId: str, W: int, venue: str, symbol: str, horizon: lit(["1h", "4h"] as const),
  side: nul(lit(["up", "down"] as const)), bucket: lit(["up-b1", "up-b2", "up-b3", "down-b1", "down-b2", "down-b3", "b0"] as const),
  thresholds: nul(obj({ t1: str, t2: str })), hourOfWeekFactors: nul(arr(nul(num))), factorTableSha256: nul(hex),
  alpha: str, testDelta: str, calibAttempt: lit([1] as const), auxSeq: lit(["label", "score"] as const), order: lit(["time"] as const),
  calibSupport: nul(obj({ min: num, max: num })), seriesSha256: hex, epoch: int, drops: obj({ calib: int, test: int }),
  calib: obj({
    n: int, status: lit(["under_calib", "silence", "region"] as const), reason: str, qhat: nul(num), rank: nul(int), kStar: nul(int),
    kObs: nul(int), misses: nul(int), U: nul(str), check1: CHECK, check2: CHECK, scoresSha256: hex, auxSha256: hex,
  }),
  test: obj({ nTest: int, kTest: nul(int), UTest: nul(str), vetoed: bool, months: rec(obj({ n: int, k: int })) }),
  live1: lit([null] as const), status: lit(["under_calib", "silence", "region", "vetoed"] as const), trialId: str,
});
export type RegistryCell = ReturnType<typeof CELL>;
export const NO_THRESHOLDS = "empty bucket (no thresholds on this side)";

/** Reads one registry cell, closed: every field of FORMAT.md, none more, the key recomposed from its fields. */
export function readRegistryCell(value: unknown, at = "cell"): RegistryCell {
  const c = CELL(value, at);
  if (c.key !== `kata:${c.kataId}@${c.venue}/${c.symbol}/${c.horizon}/${c.bucket}`) bad(`${at}.key`, "is not recomposed from its fields");
  if ((c.side === null) !== (c.hourOfWeekFactors !== null) || (c.hourOfWeekFactors === null) !== (c.factorTableSha256 === null) || (c.side === null && c.thresholds !== null)) bad(at, "mixes direction and scale fields");
  if (!c.taskClass.endsWith(`-${c.horizon}`) || c.taskClass.includes("-dir-") !== (c.side !== null)) bad(`${at}.taskClass`, "does not match the horizon and the kind of the cell");
  if (c.hourOfWeekFactors !== null && c.hourOfWeekFactors.length !== (c.horizon === "1h" ? 168 : 42)) bad(`${at}.hourOfWeekFactors`, "is not 168 values at 1h or 42 at 4h");
  if (c.hourOfWeekFactors !== null && sha256Canonical(c.hourOfWeekFactors) !== c.factorTableSha256) bad(`${at}.factorTableSha256`, "is not the digest of the factors");
  return c;
}

/** Reads a registry file's bytes: `{plan, engine, trialRegistryHead, rows}`, each row through readRegistryCell. */
export function readRegistry(bytes: Uint8Array): readonly RegistryCell[] {
  const top = obj({ plan: str, engine: str, trialRegistryHead: obj({ length: int, hash: hex }), rows: arr((v) => v) });
  const cells = top(JSON.parse(new TextDecoder().decode(bytes)), "registry").rows.map((v, i) => readRegistryCell(v, `registry.rows[${String(i)}]`));
  if (new Set(cells.map((c) => `${c.taskClass} ${c.key}`)).size !== cells.length) bad("registry", "repeats a (taskClass, key) pair");
  return cells;
}

/** The inputs of the projection that the registry does not hold (G0 Q-3: parameters, no published value here). */
export type ProjectionInputs = {
  readonly registryFile: string;
  readonly registrySha256: string;
  readonly generator: string;
  readonly attestation: (cellKey: string) => { readonly verifier: string; readonly report_sha256: string } | undefined;
  readonly text: (rule: "sign-set" | "scaled-band") => string;
};

const outcome = (x: RegistryCell["calib"]["check1"]) => (x === "n/a" ? null : x);

/** The row of a cell, or null for a direction side without thresholds (L-1). The row passes assertClosedPolicyRow. */
export function projectCell(cell: RegistryCell, inp: ProjectionInputs): PolicyRow | null {
  const c = cell.calib;
  const dir = cell.side !== null;
  const region = cell.status === "region";
  if (dir && cell.thresholds === null) {
    if (cell.status !== "under_calib" || c.reason !== NO_THRESHOLDS) bad(cell.key, `has no thresholds on its side but is not under_calib with the reason '${NO_THRESHOLDS}' (L-1)`);
    return null;
  }
  if (c.rank !== (c.kStar === null ? null : c.n - c.kStar)) bad(`${cell.key}.calib.rank`, "is not n - kStar");
  const rule = dir ? "sign-set" : "scaled-band";
  const att = cell.status === "under_calib" ? null : (inp.attestation(cell.key) ?? bad(cell.key, "is calibrated without a recompute attestation"));
  const factors = cell.hourOfWeekFactors;
  const row: PolicyRow = {
    row_format: "class-policy-v2", task_class: cell.taskClass, cell_key: cell.key, region_rule: rule, current: true,
    kata_id: cell.kataId, w: cell.W, venue: cell.venue, symbol: cell.symbol, horizon: cell.horizon, side: cell.side, bucket: cell.bucket,
    thresholds: cell.thresholds,
    scale_table: factors === null ? null : { kind: "hour-of-week", values: factors, sha256: cell.factorTableSha256 as string },
    calib_support: cell.calibSupport, fit_sha256: null,
    statement: "per-calibration", alpha: cell.alpha, test_delta: cell.testDelta, calib_attempt: cell.calibAttempt,
    calib_cause: "initial", calib_parent: "none", epoch: cell.epoch,
    bound_on: region ? (dir ? "commit" : "region") : null,
    tau_cap: dir ? 1 : null, n_min: zeroErrorFloor(cell.alpha, cell.testDelta),
    n: c.n, k_star: c.kStar, p_served: c.rank, k_obs: c.kObs,
    misses: c.misses, qhat: c.qhat, miss_bound: region ? c.U : null,
    marginal_alpha: c.rank === null ? null : ceilDecimal4({ num: BigInt(c.n + 1 - c.rank), den: BigInt(c.n + 1) }),
    aux_seq: cell.auxSeq, runs_miss: outcome(c.check1), runs_aux: outcome(c.check2),
    runs_level: "0.05", tail_frac: null, tail_m: null, tail_a: null, tail_tail_num: null, tail_tail_den: null, miss_adj_a: null, miss_adj_tail_num: null, miss_adj_tail_den: null,
    test: { k_test: cell.test.kTest, n_test: cell.test.nTest, u_test: cell.test.UTest }, bridge: null, fwd: null,
    vetoes: { test: cell.test.vetoed, bridge: null, fwd: null },
    status: cell.status, status_reason: cell.status === "vetoed" ? "vetoed: test" : c.reason, retire: null,
    scores_sha256: c.scoresSha256, aux_sha256: c.auxSha256, series_sha256: cell.seriesSha256, order: cell.order,
    source: { registry_file: inp.registryFile, registry_sha256: inp.registrySha256, trial_id: cell.trialId, wave: 1, generator: inp.generator },
    recompute: att === null ? null : { verifier: att.verifier, scores_sha256: c.scoresSha256, report_sha256: att.report_sha256 },
    text: inp.text(rule),
  };
  assertClosedPolicyRow(row, `projection of ${cell.key}`);
  return row;
}
