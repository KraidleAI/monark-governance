/**
 * Import guard of kata rows, wave 1 (lot CM-4a-ii-a, block B2 of 1.1.0; docs/G0-lot-cm-4a-ii.md G-2, G-3; A-2 section
 * 2.2 points 2 to 5, 7, 8; plan r3 sections 4 and 5.3; delegated decision on PolicyRow, condition 2). Fails closed and
 * throws on the first difference. Every value the row's counts determine is recomputed by the exact comparator; what
 * depends on the unpublished scores (qhat on a band, misses, the check outcomes) is bound by the projection of the pinned
 * registry (block B1) and by `recompute`. Wave 2 band rows (lot CM-4a-ii-b, docs/G0-lot-cm-4a-ii-b.md): tails from
 * counts through the one seam policy-wave2.ts, bridge and FWD-2 vetoes, A-1 spend; other waves are refused.
 */
import { assertClosedPolicyRow, type ClassEntry, type PolicyRow, type PolicyTable } from "@monark/contracts";
import { bandEdge, binomCdfLeq, ceilDecimal4, missUpperBound, parseAlpha, parseTestDelta, riskControlMaxExceedances, spendDelta, splitRankExact, zeroErrorFloor } from "@monark/hikae";
import { KATA_BASE_DELTA, KATA_H_MS, kataKeyProblem } from "./policy-classes.ts";
import { readRegistry, type ProjectionInputs } from "./policy-projection.ts";
import { assertTableMatchesRegistry } from "./policy-table-file.ts";
import { guardCalibChain, W2_BLOCK_N_MAX, W2_CALIB_N_MAX, W2_TAIL_FRAC, wave2Admission } from "./policy-wave2.ts";

/** The pins of the guard: the projection inputs and the closed list of verifier identities (A-2 section 2.2 point 7). */
export type GuardPins = ProjectionInputs & { readonly verifiers: readonly string[] };

const want = (ok: boolean, key: string, what: string): void => {
  if (!ok) throw new Error(`MONARK import guard: ${key} ${what}.`);
};

/** The identity of a verifier or generator: the name before its first "@" (the revision), ASCII lower case (G0 G-2.6). */
export const verifierIdentity = (name: string): string => (name.split("@")[0] ?? "").replace(/[A-Z]/g, (c) => c.toLowerCase());

/** A-2 section 2.2 point 5: P(Bin(n, alpha) >= k) <= 0.05, as P(Bin(n, 1 - alpha) <= n - k) <= 0.05. */
export function vetoFires(n: number, k: number, alpha: string): boolean {
  const a = parseAlpha(alpha);
  return binomCdfLeq(n, n - k, { num: a.den - a.num, den: a.den }, parseTestDelta(KATA_BASE_DELTA));
}

/** u_test of a block (FORMAT.md edge conventions), at the veto level. */
const uTest = (k: number | null, n: number | null): string | null => (k === null || n === null || n === 0 ? null : k === n ? "1" : missUpperBound(n, k, KATA_BASE_DELTA));

/** G-2: one kata row of wave 1 or 2 against its class entry and the pins. */
export function guardKataRow(r: PolicyRow, cls: ClassEntry, pins: GuardPins): void {
  const key = `${r.task_class} ${r.cell_key}`;
  const is = (ok: boolean, what: string): void => want(ok, key, what);
  assertClosedPolicyRow(r, key);
  const dir = r.region_rule === "sign-set";
  const t = r.test ?? { k_test: null, n_test: 0, u_test: null };
  const w2 = r.source.wave === 2;
  is(r.source.wave === 1 || (w2 && !dir && r.fit_sha256 === null), `has source.wave ${String(r.source.wave)}: the wave 2 guard admits wave 2 core band rows only (ADR 0006 D1; wave 2b waits for P0-2), a null wave is a marginal row`);
  const tails = [r.tail_m, r.tail_a, r.tail_tail_num, r.tail_tail_den, r.miss_adj_a, r.miss_adj_tail_num, r.miss_adj_tail_den];
  is(w2 || [r.bridge, r.fwd, r.vetoes?.bridge ?? null, r.vetoes?.fwd ?? null, r.tail_frac, ...tails, r.fit_sha256].every((v) => v === null), "carries a wave 2 column on a wave 1 row");
  is(!w2 || r.n <= (W2_CALIB_N_MAX[r.horizon ?? ""] ?? 0), "has n above the CALIB-2 block (8760 at 1h, 2190 at 4h), refused before any tail arithmetic");
  is(!w2 || (r.bridge !== null && r.fwd !== null && r.tail_frac === W2_TAIL_FRAC[r.horizon ?? ""] && r.runs_miss === null && r.runs_aux === null), "is a wave 2 row without its bridge and fwd blocks, with a tail_frac off 0.95 at 1h and 0.90 at 4h, or with wave 1 check outcomes");
  is(r.statement === "per-calibration" && r.task_class === cls.task_class && r.region_rule === cls.region_rule && r.alpha === cls.alpha && cls.test_delta === KATA_BASE_DELTA, "does not follow its class entry");
  is(KATA_H_MS[r.horizon ?? ""] === cls.h_ms && dir === (r.bucket !== "b0") && dir === (r.thresholds !== null) && r.aux_seq === (dir ? "label" : "score"), "has a horizon, bucket, thresholds or aux_seq off its class and mode");
  is([r.kata_id, r.w, r.venue, r.symbol, r.test, r.vetoes, r.aux_sha256, r.series_sha256].every((v) => v !== null), "misses a kata column");
  is(r.cell_key === `kata:${String(r.kata_id)}@${String(r.venue)}/${String(r.symbol)}/${String(r.horizon)}/${String(r.bucket)}` && kataKeyProblem(r.cell_key.slice(0, r.cell_key.lastIndexOf("/")), r.task_class) === undefined, "has a cell_key or symbol off its columns and class, or a key off the kata key grammar (C-5)");
  is(r.source.registry_file === pins.registryFile && r.source.registry_sha256 === pins.registrySha256 && r.source.generator === pins.generator, "has a source off the pins");
  is(r.source.trial_id === [r.task_class, r.kata_id, r.venue, r.symbol, r.horizon, w2 ? "W2-CALIB" : "CALIB"].join("|"), "has a trial_id not recomposed from its columns");
  is(r.order === "time" && (w2 || r.current) && r.runs_level === KATA_BASE_DELTA, "breaks the pinned constants of a wave 1 row (order time, current, runs_level) or of a wave 2 row (order time, runs_level)");
  const at = r.calib_attempt;
  const delta = spendDelta(KATA_BASE_DELTA, at);
  is(at === (w2 ? 2 : 1) && r.test_delta === delta && (at === 1 ? r.calib_cause === "initial" && r.calib_parent === "none" : r.calib_cause === "outcome" && /^[0-9a-f]{64}$/.test(r.calib_parent ?? "")), "breaks the pinned constants of the A-1 spend (attempt 1 on wave 1, 2 on wave 2 (ADR 0006 D1); test_delta = base / 2^(attempt - 1); initial and none at attempt 1 only, outcome and a parent digest after)");
  is(r.epoch === 1, "has an epoch other than 1 while no epoch log is pinned");
  is(dir ? r.scale_table === null : r.scale_table?.kind === "hour-of-week" && r.scale_table.values.length === (r.horizon === "1h" ? 168 : 42), "has a scale_table off hour-of-week, 168 values at 1h or 42 at 4h");
  is(!Object.is(r.qhat, -0) && (r.calib_support === null || r.calib_support.min <= r.calib_support.max), "has a qhat -0 or a calib_support with min above max");
  const n0 = zeroErrorFloor(r.alpha, delta);
  const ks = riskControlMaxExceedances(r.n, r.alpha, delta);
  is(r.n_min === n0, `has n_min ${String(r.n_min)}, not n0 ${String(n0)}`);
  is(r.k_star === (ks < 0 ? null : ks), "has a k_star the exact rule does not give");
  const blocks = { bridge: r.bridge, test: r.test, fwd: r.fwd };
  is(!w2 || (["bridge", "test", "fwd"] as const).every((k) => (blocks[k]?.n_test ?? 0) <= (W2_BLOCK_N_MAX[k][r.horizon ?? ""] ?? 0)), "has an n_test above its block (bridge 8760 / 2190, TEST-2 and FWD-2 4392 / 1098 at 1h / 4h), refused before any bound or veto");
  is([t, r.bridge ?? t, r.fwd ?? t, r.retire ?? t].every((b) => b.k_test === null || b.n_test === null || b.k_test <= b.n_test), "has a k_test above its n_test (test, bridge, fwd or retire block)");
  is([t, r.bridge ?? t, r.fwd ?? t].every((b) => b.u_test === uTest(b.k_test, b.n_test)), "has a u_test the exact bound does not give");
  if (r.n < n0) {
    is([r.p_served, r.k_obs, r.misses, r.qhat, r.miss_bound, r.marginal_alpha, r.runs_miss, r.runs_aux, r.recompute, r.bound_on, r.retire, ...tails].every((v) => v === null), "is under_calib with a calibrated column set");
    is(r.status === "under_calib" && r.status_reason === (r.n === 0 ? "empty bucket" : `n ${String(r.n)} below n0 ${String(n0)}`) && [r.vetoes?.test, ...(w2 ? [r.vetoes?.bridge, r.vetoes?.fwd] : [])].every((v) => v === false), "has a status, reason or veto off under_calib");
    return;
  }
  const m = r.misses ?? -1;
  is(m >= 0 && m <= r.n, "has misses outside 0..n");
  const p = r.n - ks;
  is(r.p_served === p && p >= splitRankExact(r.n, r.alpha), "has a p_served off n - k_star or below the split rank");
  is(r.marginal_alpha === ceilDecimal4({ num: BigInt(r.n + 1 - p), den: BigInt(r.n + 1) }), "has a marginal_alpha the exact rule does not give");
  const q = dir ? (m > ks ? 1 : 0) : r.qhat;
  is(m >= 0 && q !== null && r.qhat === q && r.k_obs === (dir && q === 1 ? 0 : m), "has a qhat or k_obs that does not follow from (misses, k_star)");
  is(w2 || (r.runs_miss !== null && r.runs_aux !== null && (r.runs_miss === "empty") === (r.k_obs === 0 || r.k_obs === r.n)), "has check outcomes that do not follow from k_obs");
  const adm = w2 ? wave2Admission(r, is) : { reject: r.runs_miss === "reject" || r.runs_aux === "reject", empty: r.runs_aux === "empty" };
  const [calib, reason] = adm.reject ? ["silence", "dependence check rejects"] : adm.empty ? ["silence", w2 ? "tail sequence constant (fails closed)" : "auxiliary sequence constant (fails closed)"] : m > ks ? ["silence", `misses ${String(m)} above k* ${String(ks)}`] : ["region", ""];
  const fire = (b: typeof r.test): boolean => calib === "region" && b !== null && b.n_test >= 1 && b.k_test !== null && vetoFires(b.n_test, b.k_test, r.alpha);
  const first = (["bridge", "test", "fwd"] as const).find((k) => fire(blocks[k]));
  is(r.vetoes?.test === fire(r.test) && (r.vetoes?.bridge ?? false) === fire(r.bridge) && (r.vetoes?.fwd ?? false) === fire(r.fwd), "has vetoes.test, vetoes.bridge or vetoes.fwd off the conditional TEST, bridge or FWD-2 veto");
  const status = first !== undefined ? "vetoed" : calib;
  const [st, why] = r.retire === null ? [status, first !== undefined ? `vetoed: ${first}` : reason] : ["retired", `retired: ${r.retire.cause}`];
  is(r.status === st && r.status_reason === why, `has status '${r.status}' and reason '${r.status_reason}', not '${st}' and '${why}'`);
  if (r.retire !== null) {
    const c = r.retire;
    const live = /^live:[1-9][0-9]*$/.test(c.cause);
    is(status === "region" && (live || (/^adr:decisions\/[0-9A-Za-z][0-9A-Za-z._-]*\.md$/.test(c.cause) && !c.cause.includes(".."))), "has a retire cause outside live:<k> and adr:decisions/<file>.md (epoch:<id> needs the pinned epoch log), or retires a row that serves no region");
    is(live ? c.n_test !== null && c.k_test !== null && c.n_test >= 1 && vetoFires(c.n_test, c.k_test, r.alpha) && c.u_test === uTest(c.k_test, c.n_test) : c.n_test === null && c.k_test === null && c.u_test === null, "has retire counts off its cause or a live block the binomial rule does not fire on");
  }
  const region = r.status === "region";
  is(r.bound_on === (region ? (dir ? "commit" : "region") : null) && r.miss_bound === (region ? missUpperBound(r.n, ks, delta) : null), "has a miss_bound or bound_on off the region rule");
  const rc = r.recompute;
  is(rc !== null && rc.scores_sha256 === r.scores_sha256, "is calibrated without a recompute bound to its scores_sha256");
  const id = verifierIdentity(rc?.verifier ?? "");
  is(pins.verifiers.every((v) => v === verifierIdentity(v)), "pins a verifier that is not an identity (lower case, no revision)");
  is(pins.verifiers.includes(id), "has a verifier outside the pinned list");
  is(id !== verifierIdentity(r.source.generator), "has a verifier equal to the generator");
  if (dir) return;
  const s = r.calib_support;
  const qb = q ?? NaN;
  is(s !== null && qb >= 2 ** -1022 && Number.isFinite(qb), "is a calibrated band row without calib_support or with a qhat that is not a normal double");
  is((bandEdge(qb, s?.min ?? 1) ?? 0) > 0 && bandEdge(qb, s?.max ?? 1) !== null, "has no positive band edge at calib_support.min or no finite edge at calib_support.max (plan section 4)");
}

/** G-3: the table matches the pinned registry (block B1) with its expected class entry; each row passes G-2; cell checks. */
export function guardKataTable(table: PolicyTable, registryBytes: Uint8Array, pins: GuardPins, expected: ClassEntry): void {
  assertTableMatchesRegistry(table, registryBytes, pins, expected);
  for (const row of table.rows) guardKataRow(row, table.class, pins);
  guardCalibChain(table.rows);
  const rows = new Map(table.rows.map((r) => [r.cell_key, r]));
  for (const cell of readRegistry(registryBytes).filter((c) => c.taskClass === table.class.task_class)) {
    want(Object.keys(cell.test.months).every((k) => /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(k)), cell.key, "has a test.months key outside YYYY-MM");
    const st = rows.get(cell.key)?.status;
    want(st === undefined || cell.calib.status === (st === "vetoed" || st === "retired" ? "region" : st), cell.key, "has a calib.status off the recomputed CALIB status");
  }
  // C-8 (delegated decision CM-4b): the current rows of a direction side are its three buckets, with the same thresholds.
  for (const [side, rs] of Map.groupBy(table.rows.filter((r) => r.current && r.side !== null), (r) => r.cell_key.slice(0, r.cell_key.lastIndexOf("-")))) {
    want(new Set(rs.map((r) => r.bucket)).size === 3 && rs.every((r) => r.thresholds?.t1 === rs[0]?.thresholds?.t1 && r.thresholds?.t2 === rs[0]?.thresholds?.t2), side, "is a direction side without its three buckets or with thresholds that differ between its rows (C-8)");
  }
}
