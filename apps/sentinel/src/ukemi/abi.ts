// UKEMI (sentinel-2 recorder, ADR-U1 / ADR-M020) — off-tool, K-8: never imports apps/harness/src/tools.
//
// Minimal ABI layer for the Aave v3 liquidation-book recorder: keccak-256 (self-tested at load, Node
// built-ins only), 4-byte selectors COMPUTED from signatures (never pasted — ADR-U1 Sources, discipline
// of scripts-mesure/*.mjs), and the exact-integer decoders for the reads the book needs. No network here;
// every function is pure so the offline replay (fixture) and the live record path decode identically.
import { TRANSFER_TOPIC } from "../rpc.ts";

// ── keccak-256 (Uint32Array lanes: 32-bit lo/hi pairs; ported from the self-tested scripts-mesure impl) ──
const RC: readonly number[][] = [[0x00000001, 0x00000000], [0x00008082, 0x00000000], [0x0000808a, 0x80000000], [0x80008000, 0x80000000], [0x0000808b, 0x00000000], [0x80000001, 0x00000000], [0x80008081, 0x80000000], [0x00008009, 0x80000000], [0x0000008a, 0x00000000], [0x00000088, 0x00000000], [0x80008009, 0x00000000], [0x8000000a, 0x00000000], [0x8000808b, 0x00000000], [0x0000008b, 0x80000000], [0x00008089, 0x80000000], [0x00008003, 0x80000000], [0x00008002, 0x80000000], [0x00000080, 0x80000000], [0x0000800a, 0x00000000], [0x8000000a, 0x80000000], [0x80008081, 0x80000000], [0x00008080, 0x80000000], [0x80000001, 0x00000000], [0x80008008, 0x80000000]];
const RHO: readonly number[] = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];

function rotl(lo: number, hi: number, n: number): [number, number] {
  if (n === 0) return [lo, hi];
  if (n < 32) return [(lo << n) | (hi >>> (32 - n)), (hi << n) | (lo >>> (32 - n))];
  const m = n - 32;
  return [(hi << m) | (lo >>> (32 - m)), (lo << m) | (hi >>> (32 - m))];
}

function keccakF(s: Uint32Array): void {
  // In-bounds by construction; `!` satisfies noUncheckedIndexedAccess on the typed-array reads.
  const C = new Uint32Array(10), D = new Uint32Array(10), Bb = new Uint32Array(50);
  for (let r = 0; r < 24; r++) {
    for (let x = 0; x < 5; x++) {
      C[2 * x] = s[2 * x]! ^ s[2 * (x + 5)]! ^ s[2 * (x + 10)]! ^ s[2 * (x + 15)]! ^ s[2 * (x + 20)]!;
      C[2 * x + 1] = s[2 * x + 1]! ^ s[2 * (x + 5) + 1]! ^ s[2 * (x + 10) + 1]! ^ s[2 * (x + 15) + 1]! ^ s[2 * (x + 20) + 1]!;
    }
    for (let x = 0; x < 5; x++) {
      const [rl, rh] = rotl(C[2 * ((x + 1) % 5)]!, C[2 * ((x + 1) % 5) + 1]!, 1);
      D[2 * x] = C[2 * ((x + 4) % 5)]! ^ rl; D[2 * x + 1] = C[2 * ((x + 4) % 5) + 1]! ^ rh;
    }
    for (let i = 0; i < 25; i++) { s[2 * i] = s[2 * i]! ^ D[2 * (i % 5)]!; s[2 * i + 1] = s[2 * i + 1]! ^ D[2 * (i % 5) + 1]!; }
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
      const i = x + 5 * y, j = y + 5 * ((2 * x + 3 * y) % 5);
      const [rl, rh] = rotl(s[2 * i]!, s[2 * i + 1]!, RHO[i]!); Bb[2 * j] = rl; Bb[2 * j + 1] = rh;
    }
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
      const i = x + 5 * y;
      s[2 * i] = Bb[2 * i]! ^ ((~Bb[2 * (((x + 1) % 5) + 5 * y)]!) & Bb[2 * (((x + 2) % 5) + 5 * y)]!);
      s[2 * i + 1] = Bb[2 * i + 1]! ^ ((~Bb[2 * (((x + 1) % 5) + 5 * y) + 1]!) & Bb[2 * (((x + 2) % 5) + 5 * y) + 1]!);
    }
    s[0] = s[0]! ^ RC[r]![0]!; s[1] = s[1]! ^ RC[r]![1]!;
  }
}

/** keccak-256 of a UTF-8 string or bytes, returned as `0x`-prefixed 32-byte hex. */
export function keccak256(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  const rate = 136;
  const s = new Uint32Array(50);
  const padded = Buffer.alloc(Math.ceil((bytes.length + 1) / rate) * rate);
  bytes.copy(padded); padded[bytes.length] = padded[bytes.length]! ^ 0x01; padded[padded.length - 1] = padded[padded.length - 1]! ^ 0x80;
  const dv = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  for (let off = 0; off < padded.length; off += rate) {
    for (let i = 0; i < rate / 8; i++) { s[2 * i] = s[2 * i]! ^ dv.getUint32(off + i * 8, true); s[2 * i + 1] = s[2 * i + 1]! ^ dv.getUint32(off + i * 8 + 4, true); }
    keccakF(s);
  }
  const out = Buffer.alloc(32);
  const ov = new DataView(out.buffer, out.byteOffset, out.byteLength);
  for (let i = 0; i < 4; i++) { ov.setUint32(i * 8, s[2 * i]! >>> 0, true); ov.setUint32(i * 8 + 4, s[2 * i + 1]! >>> 0, true); }
  return "0x" + out.toString("hex");
}

// Self-test at load: the empty-string vector AND agreement with the sentinel's committed Transfer topic0.
if (keccak256("") !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470") throw new Error("ukemi/abi: keccak self-test failed (empty vector)");
if (keccak256("Transfer(address,address,uint256)") !== TRANSFER_TOPIC) throw new Error("ukemi/abi: keccak self-test failed (Transfer topic0 != rpc.ts)");

/** 4-byte function selector of a canonical signature, `0x`+8 hex. */
export const selector = (sig: string): string => keccak256(sig).slice(0, 10);

/** All selectors/topics the recorder uses, COMPUTED (not pasted). Frozen at load. */
export const SEL = {
  getUserAccountData: selector("getUserAccountData(address)"),
  getUserConfiguration: selector("getUserConfiguration(address)"),
  getUserEMode: selector("getUserEMode(address)"),
  getReserveData: selector("getReserveData(address)"),
  getReservesList: selector("getReservesList()"),
  getAssetPrice: selector("getAssetPrice(address)"),
  getSourceOfAsset: selector("getSourceOfAsset(address)"),
  getPriceOracle: selector("getPriceOracle()"),
  description: selector("description()"),
  balanceOf: selector("balanceOf(address)"),
  aggregator: selector("aggregator()"),                          // U-4a D_e (C-4): EACAggregatorProxy.aggregator() → the live aggregator
  getEModeCategoryData: selector("getEModeCategoryData(uint8)"), // U-4a C-3: e-mode category params (LT) for emode ≠ 0 accounts
} as const;
export const TRANSFER_TOPIC0 = TRANSFER_TOPIC;
export const RESERVE_INITIALIZED_TOPIC0 = keccak256("ReserveInitialized(address,address,address,address,address)");

/** U-4a D_e (C-4) — Chainlink AggregatorV2V3 `AnswerUpdated(int256 indexed current, uint256 indexed roundId,
 *  uint256 updatedAt)`: topic0 COMPUTED via the self-tested keccak (never pasted). The realized oracle path is
 *  the series of these logs on the resolved aggregator over [B₀, B_last]; the PRICE is `topics[1]` (indexed
 *  int256), roundId `topics[2]`, updatedAt the data word. The fetched logs' topic0 must equal this (measured
 *  self-test in the D_e course), and H6 (last update ≤ b == getAssetPrice@b on U3-inputs) validates end-to-end. */
export const ANSWER_UPDATED_TOPIC0 = keccak256("AnswerUpdated(int256,uint256,uint256)");

/** Decode a signed int256 from a 32-byte ABI word / log topic (two's complement). Aave feed answers are positive,
 *  but AnswerUpdated.current is declared int256, so decode as signed for correctness (never assume unsigned). */
export function decInt256(word: string): bigint {
  const d = word.replace(/^0x/, "").padStart(64, "0").slice(-64);
  const u = BigInt("0x" + d);
  return u >= 2n ** 255n ? u - 2n ** 256n : u;
}

// ── encode / decode (all exact-integer; no floats) ──
/** Left-pad a 20-byte address to a 32-byte ABI word (lowercased, no `0x`). */
export const wordAddr = (a: string): string => a.toLowerCase().replace(/^0x/, "").padStart(64, "0");
/** As a log topic (0x-prefixed). */
export const topicAddr = (a: string): string => "0x" + wordAddr(a);
/** `to`-address of a 32-byte word (lowercased 0x + 40 hex). */
export const decAddress = (word: string): string => "0x" + word.replace(/^0x/, "").slice(24, 64);
/** A hex quantity as bigint (fails closed on a non-hex payload). */
export function decUint(hex: string): bigint {
  if (!/^0x[0-9a-fA-F]*$/.test(hex)) throw new Error(`ukemi/abi: not a hex quantity: ${hex.slice(0, 12)}`);
  return hex === "0x" ? 0n : BigInt(hex);
}
/** The i-th 32-byte word of a return payload, as 64 lowercase hex (no 0x). */
export const wordAt = (hex: string, i: number): string => hex.replace(/^0x/, "").slice(i * 64, (i + 1) * 64);
/** Dynamic ABI string return: [offset][len][bytes…]. */
export function decString(hex: string): string {
  const d = hex.replace(/^0x/, "");
  if (d.length < 128) return "";
  const off = Number(BigInt("0x" + d.slice(0, 64))) * 2;
  const len = Number(BigInt("0x" + d.slice(off, off + 64))) * 2;
  return Buffer.from(d.slice(off + 64, off + 64 + len), "hex").toString("utf8");
}

/** Aave v3 ReserveConfigurationMap bit layout (ReserveConfiguration.sol): LTV 0-15, LT 16-31, bonus 32-47,
 *  decimals 48-55, eMode category 168-175. Exact masks, no float. */
export interface ReserveConfig { ltvBps: bigint; liquidationThresholdBps: bigint; liquidationBonusBps: bigint; decimals: bigint; emodeCategory: bigint; }
export function decodeReserveConfig(cfg: bigint): ReserveConfig {
  return {
    ltvBps: cfg & 0xFFFFn,
    liquidationThresholdBps: (cfg >> 16n) & 0xFFFFn,
    liquidationBonusBps: (cfg >> 32n) & 0xFFFFn,
    decimals: (cfg >> 48n) & 0xFFn,
    emodeCategory: (cfg >> 168n) & 0xFFn,
  };
}

/** getReserveData(address) — legacy 15-word struct: word0 config, word8 aToken, word10 variableDebtToken. */
export interface ReserveData extends ReserveConfig { aToken: string; variableDebtToken: string; }
export function decodeReserveData(hex: string): ReserveData {
  const words = hex.replace(/^0x/, "").length / 64;
  if (words < 11) throw new Error(`ukemi/abi: getReserveData too short (${words} words) — abi_mismatch`);
  const cfg = decodeReserveConfig(BigInt("0x" + wordAt(hex, 0)));
  return { ...cfg, aToken: decAddress(wordAt(hex, 8)), variableDebtToken: decAddress(wordAt(hex, 10)) };
}

/** getUserAccountData(address) — 6 base-currency (8-dec) / bps / 1e18 aggregates. */
export interface UserAccountData { totalCollateralBase: bigint; totalDebtBase: bigint; availableBorrowsBase: bigint; currentLiquidationThresholdBps: bigint; ltvBps: bigint; healthFactor: bigint; }
export function decodeUserAccountData(hex: string): UserAccountData {
  const w = (i: number): bigint => BigInt("0x" + wordAt(hex, i));
  return { totalCollateralBase: w(0), totalDebtBase: w(1), availableBorrowsBase: w(2), currentLiquidationThresholdBps: w(3), ltvBps: w(4), healthFactor: w(5) };
}

/** getUserConfiguration(address) bitmap → the reserve indices used as collateral / as debt (bit 2i borrow, 2i+1 collateral). */
export function decodeUserConfig(bitmap: bigint, nReserves: number): { collateral: number[]; borrow: number[] } {
  const collateral: number[] = [], borrow: number[] = [];
  for (let i = 0; i < nReserves; i++) {
    if ((bitmap >> BigInt(2 * i)) & 1n) borrow.push(i);
    if ((bitmap >> BigInt(2 * i + 1)) & 1n) collateral.push(i);
  }
  return { collateral, borrow };
}

/** U-4a C-3 — getEModeCategoryData(uint8) → EModeCategory {uint16 ltv; uint16 liquidationThreshold; uint16
 *  liquidationBonus; address priceSource; string label}. The return is a DYNAMIC tuple (it carries `label`), so
 *  it is OFFSET-PREFIXED (word0 = 0x20) and the struct fields start at that offset — decoded on the REAL @B₀ bytes
 *  (impl 0x97287a4f…; measured cat-1 = ltv 9300 / LT 9500 / bonus 10100 / "ETH correlated", self-tested). The
 *  layout is read via the offset word (robust to a bare-tuple vs offset-prefixed return). Only LT is load-bearing
 *  for the U-4a HF recompute under D_e; `label` is skipped (human-readable, not digest-bearing). */
export interface EModeCategoryData { ltvBps: bigint; liquidationThresholdBps: bigint; liquidationBonusBps: bigint; priceSource: string; }
export function decodeEModeCategoryData(hex: string): EModeCategoryData {
  const totalWords = hex.replace(/^0x/, "").length / 64;
  const off = Number(BigInt("0x" + wordAt(hex, 0)));
  const base = off % 32 === 0 ? off / 32 : 1; // dynamic-tuple offset (0x20 ⇒ struct at word 1); fail-safe to 1
  if (totalWords < base + 4) throw new Error(`ukemi/abi: getEModeCategoryData too short (${totalWords} words) — abi_mismatch`);
  return {
    ltvBps: BigInt("0x" + wordAt(hex, base)) & 0xFFFFn,
    liquidationThresholdBps: BigInt("0x" + wordAt(hex, base + 1)) & 0xFFFFn,
    liquidationBonusBps: BigInt("0x" + wordAt(hex, base + 2)) & 0xFFFFn,
    priceSource: decAddress(wordAt(hex, base + 3)),
  };
}

/** getReservesList() → address[] (lowercased). */
export function decodeAddressArray(hex: string): string[] {
  const d = hex.replace(/^0x/, "");
  const n = Number(BigInt("0x" + d.slice(64, 128)));
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push("0x" + d.slice(128 + i * 64 + 24, 128 + i * 64 + 64));
  return out;
}

/** Distinct recipients (Transfer topic2) of a batch of aToken Transfer logs, lowercased. Enumeration primitive. */
export interface RawLog { readonly topics: readonly string[]; readonly data: string; }
export function transferRecipients(logs: readonly RawLog[]): string[] {
  const set = new Set<string>();
  for (const l of logs) {
    if ((l.topics[0] ?? "").toLowerCase() !== TRANSFER_TOPIC0.toLowerCase()) continue;
    const to = l.topics[2];
    if (to !== undefined) set.add(decAddress(to));
  }
  return [...set];
}
