/**
 * Lot U JSON fixtures loader (pure data, recomputable by hand — never code).
 * Runtime shape guards: a malformed fixture throws, it does not "pass" silently.
 */
import { readFileSync } from "node:fs";
import type { FinancialSystem, Position } from "../src/index.ts";

function isNumArr(x: unknown): x is number[] {
  return Array.isArray(x) && x.every((v) => typeof v === "number" && Number.isFinite(v));
}
function isMatrix(x: unknown): x is number[][] {
  return Array.isArray(x) && x.every(isNumArr);
}
function readJson(file: string): Record<string, unknown> {
  const raw: unknown = JSON.parse(readFileSync(new URL(`./fixtures/${file}`, import.meta.url), "utf8"));
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new Error(`fixture ${file}: not an object`);
  return raw as Record<string, unknown>;
}

export interface SystemFixture {
  readonly name: string;
  readonly note: string;
  readonly L: number[][];
  readonly e: Record<string, number[]>;
}

export function loadSystem(file: string): SystemFixture {
  const o = readJson(file);
  const name = o["name"];
  const note = o["note"];
  const L = o["L"];
  const eRaw = o["e"];
  if (typeof name !== "string" || typeof note !== "string" || !isMatrix(L)) throw new Error(`fixture ${file}: invalid shape`);
  if (typeof eRaw !== "object" || eRaw === null) throw new Error(`fixture ${file}: e missing`);
  const e: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(eRaw as Record<string, unknown>)) {
    if (!isNumArr(v) || v.length !== L.length) throw new Error(`fixture ${file}: e.${k} invalid`);
    e[k] = v;
  }
  return { name, note, L, e };
}

/** System `(L, e[key])` of a fixture; throws if the e key does not exist. */
export function sys(f: SystemFixture, eKey: string): FinancialSystem {
  const e = f.e[eKey];
  if (!e) throw new Error(`fixture ${f.name}: e.${eKey} absent`);
  return { L: f.L, e };
}

export function loadPositions(file: string): Position[] {
  const o = readJson(file);
  const arr = o["positions"];
  if (!Array.isArray(arr)) throw new Error(`fixture ${file}: positions missing`);
  return arr.map((p: unknown, i) => {
    if (typeof p !== "object" || p === null) throw new Error(`fixture ${file}: position ${i} invalid`);
    const q = p as Record<string, unknown>;
    const id = q["id"];
    const collateralQty = q["collateralQty"];
    const collateralPrice = q["collateralPrice"];
    const liqThreshold = q["liqThreshold"];
    const debt = q["debt"];
    if (
      typeof id !== "string" ||
      typeof collateralQty !== "number" ||
      typeof collateralPrice !== "number" ||
      typeof liqThreshold !== "number" ||
      typeof debt !== "number"
    ) {
      throw new Error(`fixture ${file}: position ${i} mistyped`);
    }
    return { id, collateralQty, collateralPrice, liqThreshold, debt };
  });
}

/** Difference norms, for the (non)expansiveness assertions. */
export function l1(a: readonly number[], b: readonly number[]): number {
  return a.reduce((s, x, i) => s + Math.abs(x - (b[i] ?? 0)), 0);
}
export function linf(a: readonly number[], b: readonly number[]): number {
  return a.reduce((m, x, i) => Math.max(m, Math.abs(x - (b[i] ?? 0))), 0);
}
