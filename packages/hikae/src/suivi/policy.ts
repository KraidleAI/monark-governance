/**
 * HIKAE tracking: the closed policy object of a cell, its refusals and its canonical sha256.
 *
 *   - a SuiviPolicy has exactly 22 keys; its rationals (a, m, the deltas, the bets and the weights) are texts that qString writes, read
 *     as Q only inside a computation;
 *   - assertSuiviPolicy refuses an object that is not plain, a key too many or missing, a field outside its form, bets that the
 *     functions of the betting library refuse on their side, and a keyring whose ids, hex texts or first steps are malformed;
 *   - mixtureOf reads a BetsText as a Mixture; srReadingDelta is 1/n for the reading threshold n; suiviPolicySha256 is the canonical
 *     sha256 of an accepted policy.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { createHash } from "node:crypto";
import { sha256Canonical, type CanonicalValue } from "@monark/contracts";
import { capitalOfCounts, cmp, q, qParse, srStep, type Mixture, type Q } from "../pari/index.ts";

export interface BetsText {
  readonly lambdas: readonly string[];
  readonly weights: readonly string[];
}

export interface SuiviKey {
  readonly key_id: string;
  readonly public_key_hex: string;
  readonly from_seq: number;
}

export interface SuiviPolicy {
  readonly schema: "hikae-suivi-policy-v1";
  readonly task_class: string;
  readonly cell_key: string;
  readonly population: string;
  readonly policy_version: number;
  readonly a: string;
  readonly delta_adm: string;
  readonly delta_exh: string;
  readonly alpha_arl: string;
  readonly m: string;
  readonly eta_m1: string;
  readonly sr_reading_threshold: string;
  readonly restart_weights: "1/(j(j+1))";
  readonly bets_k: BetsText;
  readonly bets_w: BetsText;
  readonly bets_sr: BetsText;
  readonly grace_steps: number;
  readonly grid_ms: number;
  readonly l_ms: number;
  readonly thin_window: number;
  readonly thin_min: number;
  readonly keyring: readonly SuiviKey[];
}

const POLICY_KEYS = ["schema", "task_class", "cell_key", "population", "policy_version", "a", "delta_adm", "delta_exh", "alpha_arl", "m",
  "eta_m1", "sr_reading_threshold", "restart_weights", "bets_k", "bets_w", "bets_sr", "grace_steps", "grid_ms", "l_ms", "thin_window",
  "thin_min", "keyring"];
const BETS_KEYS = ["lambdas", "weights"];
const KEY_KEYS = ["key_id", "public_key_hex", "from_seq"];
const HEX64 = /^[0-9a-f]{64}$/;
const WHAT = "assertSuiviPolicy";

function fail(rule: string): never {
  throw new RangeError(`${WHAT}: ${rule}`);
}

/** Refuses a value that is not a plain object (the rule of canonicalJson) and a key set other than `keys`. */
function checkPlain(v: unknown, keys: readonly string[], what: string): void {
  // Object(v) boxes a primitive (its prototype is not plain) and maps null or undefined to an empty plain object (its keys are missing).
  const o = Object(v) as object, proto: unknown = Object.getPrototypeOf(o);
  if (proto !== Object.prototype && proto !== null) fail(`${what} is not a plain object`);
  if (JSON.stringify(Object.keys(o).sort()) !== JSON.stringify([...keys].sort())) fail(`${what} has a key too many or missing`);
}

/** A safe integer >= min. */
const intAtLeast = (v: unknown, min: number): boolean => Number.isSafeInteger(v) && (v as number) >= min;
/** An array, as a plain boolean: the declared types are not narrowed, so a policy read from a file may hold anything. */
const isList = (v: unknown): boolean => Array.isArray(v);

/** The Q of a text that qString writes, in (0, 1), bounds excluded. */
function unitText(text: string, what: string): Q {
  const x = qParse(text);
  if (cmp(x, q(0n)) !== 1 || cmp(x, q(1n)) !== -1) fail(`${what} outside (0, 1)`);
  return x;
}

/** The integer n >= 2 of a reading threshold text that qString writes. */
function thresholdOf(text: string): bigint {
  const x = qParse(text);
  if (x.d !== 1n || x.n < 2n) fail("sr_reading_threshold is not an integer >= 2");
  return x.n;
}

export function mixtureOf(b: BetsText): Mixture {
  if (!isList(b.lambdas) || !isList(b.weights) || b.lambdas.length === 0 || b.lambdas.length !== b.weights.length) {
    throw new RangeError("mixtureOf: bet lists that are not lists, empty or of unequal lengths");
  }
  return { lambdas: b.lambdas.map((t) => qParse(t)), weights: b.weights.map((t) => qParse(t)) };
}

export function srReadingDelta(p: SuiviPolicy): Q {
  return q(1n, thresholdOf(p.sr_reading_threshold));
}

export function assertSuiviPolicy(p: SuiviPolicy): void {
  checkPlain(p, POLICY_KEYS, "the policy");
  if (p.schema !== "hikae-suivi-policy-v1") fail("schema is not hikae-suivi-policy-v1");
  for (const [name, v] of [["task_class", p.task_class], ["cell_key", p.cell_key], ["population", p.population]] as const) {
    if (typeof v !== "string" || v === "") fail(`${name} is not a non-empty text`);
  }
  if (!intAtLeast(p.policy_version, 1)) fail("policy_version is not a safe integer >= 1");
  const a = unitText(p.a, "a"), m = unitText(p.m, "m");
  for (const name of ["delta_adm", "delta_exh", "alpha_arl", "eta_m1"] as const) unitText(p[name], name);
  if (p.m !== p.a) fail("m is not the text of a");
  thresholdOf(p.sr_reading_threshold);
  if (p.restart_weights !== "1/(j(j+1))") fail("restart_weights is not 1/(j(j+1))");
  for (const name of ["bets_k", "bets_w", "bets_sr"] as const) checkPlain(p[name], BETS_KEYS, name);
  // The intervals of the bets are those of the betting library, read through its own refusals.
  capitalOfCounts(mixtureOf(p.bets_k), "below", a, 0, 0);
  capitalOfCounts(mixtureOf(p.bets_w), "above", a, 0, 0);
  const sr = mixtureOf(p.bets_sr);
  srStep(sr.lambdas.map(() => 0n), sr, m, 0);
  if (!intAtLeast(p.grace_steps, 0)) fail("grace_steps is not a safe integer >= 0");
  if (!intAtLeast(p.grid_ms, 1)) fail("grid_ms is not a safe integer >= 1");
  if (!intAtLeast(p.l_ms, 1)) fail("l_ms is not a safe integer >= 1");
  if (!intAtLeast(p.thin_window, 1)) fail("thin_window is not a safe integer >= 1");
  if (!intAtLeast(p.thin_min, 0) || p.thin_min > p.thin_window) fail("thin_min is not a safe integer of [0, thin_window]");
  const ids = new Set<string>();
  let previous = -1;
  if (!isList(p.keyring)) fail("keyring is not a list");
  for (const key of p.keyring) {
    checkPlain(key, KEY_KEYS, "a key");
    if (typeof key.public_key_hex !== "string" || !HEX64.test(key.public_key_hex)) fail("public_key_hex is not 64 lowercase hex digits");
    if (key.key_id !== createHash("sha256").update(key.public_key_hex, "hex").digest("hex")) fail("key_id is not the sha256 of the key");
    if (ids.has(key.key_id)) fail("two keys of one key_id");
    ids.add(key.key_id);
    if (!intAtLeast(key.from_seq, 0)) fail("from_seq is not a safe integer >= 0");
    if (key.from_seq <= previous) fail("from_seq does not grow strictly along the keyring");
    previous = key.from_seq;
  }
}

export function suiviPolicySha256(p: SuiviPolicy): string {
  assertSuiviPolicy(p);
  // An interface has no index signature; the shape is the one the check above accepts.
  return sha256Canonical(p as unknown as CanonicalValue);
}
