// apps/dojo/scripts/dojo-core.d.mts -- type surface of dojo-core.mjs (TS7016 sidecar, precedent
// apps/bell/scripts/bell-chain.d.mts) so the type-checked tests import the runtime module. Runtime = dojo-core.mjs.

/** Canonical non-negative decimal integer string (no sign, no leading zero). */
export type Decimal = string;
/** Day value of an address: a decimal, or null for a missing day. series[i] is the value of day i + 1. */
export type DayValue = Decimal | null;
/** D-7 lot: [amount in base units, birth day]. */
export type Lot = readonly [amount: Decimal, birthDay: number];
/** Exact fraction [numerator, denominator], denominator > 0. */
export type Fraction = readonly [numerator: Decimal, denominator: Decimal];
export type OwnerClass = "holder" | "program";

export function addressReading(accounts: readonly (Decimal | null)[]): DayValue;
export function dayValue(readings: readonly (readonly (Decimal | null)[])[]): DayValue;
export function stepLots(lots: readonly Lot[], day: number, value: DayValue): [Decimal, number][];
export function lotsOf(series: readonly DayValue[]): [Decimal, number][];
export function scoreOf(series: readonly DayValue[]): Decimal;
export function validatedOf(series: readonly DayValue[], window: number): Decimal;
export function provisionalOf(series: readonly DayValue[], window: number): Decimal;
export function ageOf(series: readonly DayValue[]): number;
export function unitsOf(series: readonly DayValue[], window: number, unitThreshold: Decimal | null): Decimal | null;
export function tierOf(series: readonly DayValue[], unitThreshold: Decimal | null, tierUnits: readonly Decimal[], tierWindows: readonly number[]): number | null;
export function holderCounted(klass: OwnerClass, series: readonly DayValue[], dustThreshold: Decimal | null): boolean | null;
export function medianOfSeven(values: readonly Fraction[]): [Decimal, Decimal];
export function unitPrice(poolPriceDaily: readonly Fraction[], usdPerSolDaily: readonly Fraction[]): [Decimal, Decimal];
export function unitThreshold(microUsd: Decimal, price: Fraction): Decimal;
export function base58Decode(s: string): Uint8Array;
export function ed25519OnCurve(bytes: Uint8Array): boolean;
export function ownerClass(address: string): OwnerClass;
export function leafHash(line: string | Uint8Array): string;
export function nodeHash(left: string, right: string): string;
export function rootOf(lines: readonly (string | Uint8Array)[]): string;
export function proofOf(lines: readonly (string | Uint8Array)[], index: number): string[];
export function verifyProof(line: string | Uint8Array, index: number, count: number, path: readonly string[], root: string): boolean;
export function seedAnchor(secret: string, horizon: number): string;
export function daySeed(secret: string, horizon: number, j: number): string;
export function beaconRound(dayStart: number, genesisTime: number, period: number): number;
export function readInstants(seed: string, beaconSig: string, k: number, dayStart: number, offset: number): number[];
export function readingPrice(numerator: Decimal, denominator: Decimal): [Decimal, Decimal] | null;
export function dayMinimum(values: readonly (Fraction | null)[]): [Decimal, Decimal] | null;
