// MONARK Dojo -- PR-1a pure core (ADR-DOJO-SNAPSHOT-1 section 6, PR-1a, T-1 to T-3): hold score, curve class, Merkle
// tree. Node built-ins only (node:crypto for SHA-256). No I/O, no clock, no network, no default value: every business
// number (window W, unit threshold T_1, tier units and windows, dust threshold) is an explicit argument, and a
// malformed input throws (fail-closed). Amounts, points and thresholds are canonical decimal strings computed in
// BigInt, never a JavaScript number (D-2, l.160). A series is the list of the day values of one address:
// series[i] is the value of day i + 1, day 1 being the token creation day (D-16, l.270); null is a missing day.
import { createHash } from "node:crypto";

const DECIMAL = /^(0|[1-9][0-9]*)$/;
function big(s, what) {
  if (typeof s !== "string" || !DECIMAL.test(s)) throw new Error(`dojo/core: ${what} must be a canonical decimal string`);
  return BigInt(s);
}
function positive(s, what) {
  const x = big(s, what);
  if (x === 0n) throw new Error(`dojo/core: ${what} must be positive`);
  return x;
}
function posInt(n, what) {
  if (!Number.isSafeInteger(n) || n < 1) throw new Error(`dojo/core: ${what} must be a positive integer`);
  return n;
}

// ---- T-1: readings, lots, points -------------------------------------------------------------------------------

/** One reading of an address (C-9, D-2 l.157, D-4 l.190): concordant iff each of its accounts of the mint is
 *  concordant, the balance being then their sum. An account is a decimal string (a concordant absence is "0",
 *  C-1, D-7 l.217) or null (no quorum). An empty list is vacuously concordant: balance "0" (G1 journal, Q-3). */
export function addressReading(accounts) {
  if (!Array.isArray(accounts)) throw new Error("dojo/core: accounts must be an array");
  let sum = 0n;
  let concordant = true;
  for (const a of accounts) {
    if (a === null) concordant = false;
    else sum += big(a, "account amount");
  }
  return concordant ? String(sum) : null;
}

/** Day value m_d(a) (D-2 l.158): the smallest balance among the concordant readings of the day, or null (missing
 *  day) when none is concordant. `readings` holds the K readings of the day, each an account list. */
export function dayValue(readings) {
  if (!Array.isArray(readings) || readings.length === 0) throw new Error("dojo/core: readings must be a non-empty array");
  let min = null;
  for (const r of readings) {
    const v = addressReading(r);
    if (v !== null && (min === null || BigInt(v) < min)) min = BigInt(v);
  }
  return min === null ? null : String(min);
}

// LIFO transition on {q, b} lots, oldest first (D-16 l.271): a rise is pushed as a lot born on `day`; a fall is taken
// from the newest lot first (whole lots, then a part of the last one touched); an equal value changes nothing.
function step(lots, day, m) {
  let held = 0n;
  for (const l of lots) held += l.q;
  if (m > held) return [...lots, { q: m - held, b: day }];
  const out = lots.map((l) => ({ q: l.q, b: l.b }));
  let rest = held - m;
  for (let i = out.length - 1; i >= 0 && rest > 0n; i--) {
    const t = out[i].q < rest ? out[i].q : rest;
    out[i].q -= t;
    rest -= t;
  }
  return out.filter((l) => l.q > 0n);
}

function readLots(lots) {
  if (!Array.isArray(lots)) throw new Error("dojo/core: lots must be an array");
  let prev = 0;
  return lots.map((l) => {
    if (!Array.isArray(l) || l.length !== 2) throw new Error("dojo/core: a lot is [amount, birth day]");
    const q = positive(l[0], "lot amount");
    const b = posInt(l[1], "lot birth day");
    if (b <= prev) throw new Error("dojo/core: lots must be born on increasing days");
    prev = b;
    return { q, b };
  });
}
const pair = (l) => [String(l.q), l.b];

/** One day of the pile: D-7 lots [amount, birth day] (l.217), oldest first; `value` is the day value, null for a
 *  missing day, which changes nothing (D-2 l.158). A sold part leaves with its points; a rebuy is a new lot born on
 *  the day of the rise, with no claim (D-16 l.275, decision 228). */
export function stepLots(lots, day, value) {
  const pile = readLots(lots);
  posInt(day, "day");
  const newest = pile[pile.length - 1];
  if (newest !== undefined && day <= newest.b) throw new Error("dojo/core: the day must follow the newest birth day");
  if (value === null) return pile.map(pair);
  return step(pile, day, big(value, "day value")).map(pair);
}

// Fold of a series: lots at the last day d, and cnt[x] = number of counted days in days 1..x (D-16 l.270).
function trace(series) {
  if (!Array.isArray(series)) throw new Error("dojo/core: series must be an array");
  let lots = [];
  const cnt = [0];
  for (let i = 0; i < series.length; i++) {
    const v = series[i];
    if (v === null) {
      cnt.push(cnt[i]);
      continue;
    }
    lots = step(lots, i + 1, big(v, "day value"));
    cnt.push(cnt[i] + 1);
  }
  return { d: series.length, lots, cnt };
}
// Points of a lot at day d: q x c(b, d), c = counted days in [b, d] (D-16 l.272).
const pointsOf = (t, l) => l.q * BigInt(t.cnt[t.d] - t.cnt[l.b - 1]);
// Validated at day d iff d - b + 1 >= W, calendar days, birth day included (D-16 l.273).
const validated = (t, l, w) => t.d - l.b + 1 >= w;
function sumPoints(t, keep) {
  let s = 0n;
  for (const l of t.lots) if (keep(l)) s += pointsOf(t, l);
  return s;
}
function threshold(s) {
  return s === null ? null : positive(s, "unit threshold");
}

/** Lots held at the last day of the series. */
export function lotsOf(series) {
  return trace(series).lots.map(pair);
}

/** Hold score S = V + P at the last day: the sum, over the days counted, of the part still held (D-2 l.159). */
export function scoreOf(series) {
  const t = trace(series);
  return String(sumPoints(t, () => true));
}

/** V^(W): points of the lots held at least W days (D-16 l.273; D-3 l.172, C-16). */
export function validatedOf(series, w) {
  posInt(w, "window");
  const t = trace(series);
  return String(sumPoints(t, (l) => validated(t, l, w)));
}

/** P: points of the lots held fewer than W days, provisional (D-16 l.273). */
export function provisionalOf(series, w) {
  posInt(w, "window");
  const t = trace(series);
  return String(sumPoints(t, (l) => !validated(t, l, w)));
}

/** Age: counted days of the oldest lot still held, 0 for an empty pile (the C-1 example of D-2 l.158: age 5 when
 *  an absence is a missing day, age 2 when it reads 0). */
export function ageOf(series) {
  const t = trace(series);
  const oldest = t.lots[0];
  return oldest === undefined ? 0 : t.cnt[t.d] - t.cnt[oldest.b - 1];
}

/** Units = floor(V^(W) / T_1), validated points only (D-3 l.173); null before the first price version (D-7 l.217). */
export function unitsOf(series, w, unitThresholdValue) {
  posInt(w, "window");
  const t = trace(series);
  const T = threshold(unitThresholdValue);
  if (T === null) return null;
  return String(sumPoints(t, (l) => validated(t, l, w)) / T);
}

// Five tiers, Egg, Caterpillar, Chrysalis, Monarch, Migration: closed list of decision 224 (D-3 l.171).
const TIERS = 5;

/** Tier index, 0 (none) to 5 (Migration), null before the first price version (D-7 l.217). Tier k is reached iff
 *  floor(V^(W_k) / T_1) >= u_k (D-3 l.172, C-16); the tier is the highest reached. u_1 = 1 and u strictly increasing
 *  (D-3 l.171); W non-decreasing, so that a reached tier implies the lower ones (D-3 l.172, monotonicity). */
export function tierOf(series, unitThresholdValue, tierUnits, tierWindows) {
  const t = trace(series);
  if (!Array.isArray(tierUnits) || tierUnits.length !== TIERS || !Array.isArray(tierWindows) || tierWindows.length !== TIERS) {
    throw new Error("dojo/core: five tier units and five tier windows are required");
  }
  const u = tierUnits.map((x) => big(x, "tier units"));
  const w = tierWindows.map((x) => posInt(x, "tier window"));
  for (let k = 0; k < TIERS; k++) {
    const ok = k === 0 ? u[0] === 1n : u[k] > u[k - 1] && w[k] >= w[k - 1];
    if (!ok) throw new Error("dojo/core: tier units must be 1 then strictly increasing, tier windows non-decreasing");
  }
  const T = threshold(unitThresholdValue);
  if (T === null) return null;
  for (let k = TIERS; k >= 1; k--) {
    if (sumPoints(t, (l) => validated(t, l, w[k - 1])) / T >= u[k - 1]) return k;
  }
  return 0;
}

/** holder_counted (D-7 l.217, C-10): class holder and day value (last day of the series) at least the dust threshold
 *  of the version in force, in base units (D-17 l.290); false otherwise, missing day included; null before the
 *  first price version. */
export function holderCounted(klass, series, dustThreshold) {
  if (klass !== "holder" && klass !== "program") throw new Error("dojo/core: class must be holder or program");
  const t = trace(series);
  if (t.d === 0) throw new Error("dojo/core: the series has no day");
  if (dustThreshold === null) return null;
  const dust = positive(dustThreshold, "dust threshold");
  const last = series[t.d - 1];
  return klass === "holder" && last !== null && BigInt(last) >= dust;
}

// ---- T-1: conversion (option B, D-17) ---------------------------------------------------------------------------

function fraction(f, what) {
  if (!Array.isArray(f) || f.length !== 2) throw new Error(`dojo/core: ${what} must be [numerator, denominator]`);
  return { n: big(f[0], what), d: positive(f[1], `${what} denominator`) };
}
function reduced(n, d) {
  let a = n;
  let b = d;
  while (b !== 0n) [a, b] = [b, a % b];
  return [String(n / a), String(d / a)];
}

/** Median of exactly seven exact fractions [numerator, denominator] (D-17 l.287: seven valid daily values, else no
 *  new version). Returned reduced. */
export function medianOfSeven(values) {
  if (!Array.isArray(values) || values.length !== 7) throw new Error("dojo/core: exactly seven values are required");
  const fs = values.map((v) => fraction(v, "daily value"));
  fs.sort((x, y) => {
    const l = x.n * y.d;
    const r = y.n * x.d;
    return l < r ? -1 : l > r ? 1 : 0;
  });
  return reduced(fs[3].n, fs[3].d);
}

/** Conversion price p_v in micro-dollars per base unit (D-17 l.287): median of the seven daily pi_d x sigma_d x 10^-3,
 *  pi in lamports per base unit, sigma in dollars per SOL (10^-9 SOL per lamport, 10^6 micro-dollars per dollar). */
export function unitPrice(poolPriceDaily, usdPerSolDaily) {
  if (!Array.isArray(poolPriceDaily) || !Array.isArray(usdPerSolDaily) || poolPriceDaily.length !== usdPerSolDaily.length) {
    throw new Error("dojo/core: the two daily series must have the same length");
  }
  return medianOfSeven(poolPriceDaily.map((pi, i) => {
    const a = fraction(pi, "pool price");
    const s = fraction(usdPerSolDaily[i], "SOL rate");
    return [String(a.n * s.n), String(a.d * s.d * 1000n)];
  }));
}

/** ceil(x / p) base units, x in micro-dollars (or micro-dollar-days), p > 0 the conversion price: T_1 = ceil(O_1 / p)
 *  (D-3 l.174, rounded up so that a unit never costs less than its objective) and dust_threshold =
 *  ceil(dust_threshold_microusd / p) (D-17 l.290). */
export function unitThreshold(microUsd, price) {
  const x = positive(microUsd, "micro-dollar amount");
  const p = fraction(price, "unit price");
  if (p.n === 0n) throw new Error("dojo/core: unit price must be positive");
  return String((x * p.d + p.n - 1n) / p.n);
}

// ---- T-2: curve class (D-6 l.206-211, C-8) ----------------------------------------------------------------------

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Base58 to bytes, BigInt-exact: Bitcoin alphabet (FAITS L-14), each leading "1" a zero byte; duplicate of Bell's
 *  rebase-scan.ts:30-40. Solana: five8::decode_32, at most 44 characters (MAX_BASE58_LEN), 32 bytes (FAITS L-15). */
export function base58Decode(s) {
  if (typeof s !== "string" || s.length === 0) throw new Error("dojo/core: base58 input must be a non-empty string");
  let x = 0n;
  for (const c of s) {
    const i = B58.indexOf(c);
    if (i < 0) throw new Error("dojo/core: not a base58 string");
    x = x * 58n + BigInt(i);
  }
  const out = [];
  while (x > 0n) {
    out.unshift(Number(x & 255n));
    x >>= 8n;
  }
  for (let k = 0; k < s.length && s[k] === "1"; k++) out.unshift(0);
  return Uint8Array.from(out);
}

const P = 2n ** 255n - 19n; // p = 2^255 - 19, RFC 8032 s5.1 Table 1 (FAITS L-13)
const mod = (a) => ((a % P) + P) % P;
function pow(base, e) {
  let r = 1n;
  let b = mod(base);
  for (let k = e; k > 0n; k >>= 1n) {
    if (k & 1n) r = (r * b) % P;
    b = (b * b) % P;
  }
  return r;
}
// d = -121665/121666 mod p, RFC 8032 s5.1 Table 1 (FAITS L-13); the test also anchors it on node:crypto keys.
const EDWARDS_D = mod(-121665n * pow(121666n, P - 2n));

/** Same verdict as the reference is_on_curve = CompressedEdwardsY::decompress().is_some() (C-8 (a); curve25519-dalek
 *  edwards.rs step_1, field.rs sqrt_ratio_i, u64/field.rs from_bytes): bit 255 (sign of x) masked and never part of
 *  the verdict; y = the low 255 bits, reduced mod p without rejecting y >= p; u = y^2 - 1, v = d y^2 + 1; on the
 *  curve iff u = 0, or v != 0 and u / v is a square. */
export function ed25519OnCurve(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length !== 32) throw new Error("dojo/core: a curve point is 32 bytes");
  let y = 0n;
  for (let i = 31; i >= 0; i--) y = (y << 8n) | BigInt(bytes[i]);
  y = mod(y & ((1n << 255n) - 1n));
  const u = mod(y * y - 1n);
  const v = mod(EDWARDS_D * y * y + 1n);
  if (u === 0n) return true;
  if (v === 0n) return false;
  return pow((u * pow(v, P - 2n)) % P, (P - 1n) / 2n) === 1n;
}

/** Owner class (D-6 l.206, C-8 (b)): 32 bytes off the Ed25519 curve are a program address (no key signs for them,
 *  zero hold score), on the curve a holder. Other lengths throw; 45+ characters decode to 33+ bytes (FAITS L-15). */
export function ownerClass(address) {
  const bytes = base58Decode(address);
  if (bytes.length !== 32) throw new Error("dojo/core: an address decodes to 32 bytes");
  return ed25519OnCurve(bytes) ? "holder" : "program";
}

// ---- T-3: Merkle tree (D-7 l.220; RFC 6962 s2.1 = RFC 9162 s2.1.1) ---------------------------------------------

const HEX = /^[0-9a-f]{64}$/;
function sha256(...parts) {
  const h = createHash("sha256");
  for (const p of parts) h.update(p);
  return h.digest();
}
function hashBytes(h) {
  if (typeof h !== "string" || !HEX.test(h)) throw new Error("dojo/core: a hash is 64 lowercase hex characters");
  return Buffer.from(h, "hex");
}
function lineBytes(line) {
  if (typeof line === "string") return Buffer.from(line, "utf8");
  if (line instanceof Uint8Array) return line;
  throw new Error("dojo/core: a line is a string or bytes");
}

/** Leaf hash SHA-256(0x00 || line bytes, without the LF), lowercase hex. */
export function leafHash(line) {
  return sha256(Buffer.of(0), lineBytes(line)).toString("hex");
}

/** Node hash SHA-256(0x01 || left || right), lowercase hex. */
export function nodeHash(left, right) {
  return sha256(Buffer.of(1), hashBytes(left), hashBytes(right)).toString("hex");
}

// k = the largest power of two strictly smaller than n (n >= 2), no leaf duplicated.
function split(n) {
  let k = 1;
  while (k * 2 < n) k *= 2;
  return k;
}
function mth(leaves, lo, hi) {
  if (hi - lo === 1) return leaves[lo];
  const k = split(hi - lo);
  return nodeHash(mth(leaves, lo, lo + k), mth(leaves, lo + k, hi));
}
function leavesOf(lines) {
  if (!Array.isArray(lines)) throw new Error("dojo/core: lines must be an array");
  return lines.map(leafHash);
}

/** Merkle tree hash MTH of the lines in their given order; MTH of an empty list = SHA-256 of nothing. */
export function rootOf(lines) {
  const leaves = leavesOf(lines);
  return leaves.length === 0 ? sha256().toString("hex") : mth(leaves, 0, leaves.length);
}

/** Audit path PATH(m, D[n]) of RFC 6962 s2.1.1, deepest sibling first. */
export function proofOf(lines, index) {
  const leaves = leavesOf(lines);
  if (!Number.isSafeInteger(index) || index < 0 || index >= leaves.length) throw new Error("dojo/core: index out of range");
  const top = [];
  let lo = 0;
  let hi = leaves.length;
  let m = index;
  while (hi - lo > 1) {
    const k = split(hi - lo);
    if (m < k) {
      top.push(mth(leaves, lo + k, hi));
      hi = lo + k;
    } else {
      top.push(mth(leaves, lo, lo + k));
      lo += k;
      m -= k;
    }
  }
  return top.reverse();
}

/** True iff `path` proves `line` at `index` in a tree of `count` lines with root `root`; false on any malformed
 *  input, never an exception. */
export function verifyProof(line, index, count, path, root) {
  try {
    if (!Number.isSafeInteger(count) || !Number.isSafeInteger(index) || index < 0 || index >= count) return false;
    if (!Array.isArray(path)) return false;
    const leftSide = [];
    let lo = 0;
    let hi = count;
    let m = index;
    while (hi - lo > 1) {
      const k = split(hi - lo);
      leftSide.push(m < k);
      if (m < k) hi = lo + k;
      else {
        lo += k;
        m -= k;
      }
    }
    if (leftSide.length !== path.length) return false;
    let r = leafHash(line);
    for (let i = 0; i < path.length; i++) {
      r = leftSide[leftSide.length - 1 - i] ? nodeHash(r, path[i]) : nodeHash(path[i], r);
    }
    return r === hashBytes(root).toString("hex");
  } catch {
    return false;
  }
}

// ---- PR-2-1: seeds, beacon round, read instants, reading prices (ADR-DOJO-PR-2 D-1 l.105, D-5 l.149; mere D-4 l.191, l.193) --

const DAY_S = 86_400;
function midnight(t) {
  if (!Number.isSafeInteger(t) || t < 0 || t % DAY_S !== 0) throw new Error("dojo/core: a day start is a UTC midnight in seconds");
  return t;
}
function hashChain(hex, k) {
  let b = hashBytes(hex);
  for (let i = 0; i < k; i++) b = sha256(b);
  return b.toString("hex");
}

/** Anchor a_0 = H^n(s), H = SHA-256 on the 32 raw bytes of the secret s (64 lowercase hex), n the horizon (mere D-4 l.191). */
export function seedAnchor(secret, horizon) {
  return hashChain(secret, posInt(horizon, "horizon"));
}

/** Seed of the day j days after the anchor's day, g = H^(n-j)(s), 1 <= j <= n (mere D-4 l.191; the anchor's day is day 0 of the
 *  chain and is never read, ADR-DOJO-PR-2 D-8 l.190). */
export function daySeed(secret, horizon, j) {
  if (posInt(j, "day offset") > posInt(horizon, "horizon")) throw new Error("dojo/core: the day offset exceeds the horizon");
  return hashChain(secret, horizon - j);
}

/** r_d = the first beacon round at or after the day start T_d (ADR-DOJO-PR-2 D-5 l.149): round r starts at genesis + (r - 1) x
 *  period, so r_d = ceil((T_d - genesis) / period) + 1. Genesis time and period are arguments (read_rule, D-5 l.151). */
export function beaconRound(dayStart, genesisTime, period) {
  const t = midnight(dayStart);
  if (!Number.isSafeInteger(genesisTime) || genesisTime < 0 || t < genesisTime) throw new Error("dojo/core: the day starts before the beacon genesis");
  const p = posInt(period, "beacon period");
  return Math.floor((t - genesisTime + p - 1) / p) + 1;
}

// beta = 48 raw bytes, a compressed G1 point: compression bit 0x80 set, infinity bit 0x40 clear (ADR-DOJO-PR-2 D-5 l.154).
function beaconBytes(sig) {
  if (typeof sig !== "string" || !/^[0-9a-f]{96}$/.test(sig)) throw new Error("dojo/core: a beacon signature is 96 lowercase hex characters");
  const b = Buffer.from(sig, "hex");
  if ((b[0] & 0x80) === 0 || (b[0] & 0x40) !== 0) throw new Error("dojo/core: a beacon signature is a compressed, finite point");
  return b;
}

/** The K read instants of a day in seconds, sorted, duplicates kept (ADR-DOJO-PR-2 D-5 l.149; mere D-4 l.193): t_i = T_d + O +
 *  (big-endian integer of SHA-256(g_d || "dojo-read" || byte(i) || beta) mod (86 400 - O)), i = 1..K, g_d 32 raw bytes. */
export function readInstants(seed, beaconSig, k, dayStart, offset) {
  const g = hashBytes(seed);
  const beta = beaconBytes(beaconSig);
  if (posInt(k, "k") > 255) throw new Error("dojo/core: byte(i) holds at most 255 readings");
  const t = midnight(dayStart);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset >= DAY_S) throw new Error("dojo/core: the read offset lies within a day");
  const span = BigInt(DAY_S - offset);
  const out = [];
  for (let i = 1; i <= k; i++) {
    const h = sha256(g, Buffer.from("dojo-read", "ascii"), Buffer.of(i), beta).toString("hex");
    out.push(t + offset + Number(BigInt(`0x${h}`) % span));
  }
  return out.sort((a, b) => a - b);
}

/** Exact price of one reading, reduced; null when the denominator is 0 (ADR-DOJO-PR-2 D-4 l.144: r_M = 0 gives no price). Pool
 *  price [r_S, r_M] in lamports per base unit (D-4 l.144); SOL rate [price, 10^-exponent] in dollars per SOL (D-3 l.133). */
export function readingPrice(numerator, denominator) {
  const n = big(numerator, "numerator");
  const d = big(denominator, "denominator");
  return d === 0n ? null : reduced(n, d);
}

/** Daily value: the smallest of the non-null reading values, reduced; null when none (mere D-17 l.299 pi_d, l.301 sigma_d). */
export function dayMinimum(values) {
  if (!Array.isArray(values)) throw new Error("dojo/core: values must be an array");
  let m = null;
  for (const v of values) {
    if (v === null) continue;
    const f = fraction(v, "reading value");
    if (m === null || f.n * m.d < m.n * f.d) m = f;
  }
  return m === null ? null : reduced(m.n, m.d);
}
