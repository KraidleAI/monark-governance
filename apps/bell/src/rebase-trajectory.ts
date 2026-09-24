// MONARK Bell — Token-2022 ScaledUiAmount multiplier trajectory (ADR-T1aii D1-quater, lot -b3a). Reconstructs
// multiplier(mint,t) by REPLAYING UpdateMultiplier instructions chronologically from the mint's Initialize —
// never a snapshot (pitfall F-2). Pure, offline, no network. Sources [lu]: L-lecture-spl-token2022-scaled-ui-
// amount-2026-09-20.md (B)/(C)/(F) and solana-program/token-2022@714a2ce program/src/extension/scaled_ui_amount/
// {processor.rs,instruction.rs,mod.rs} (line-cited in D1-quater).
//
// TWO DISTINCT byte layouts (pitfall F-8) => TWO decoders (instruction ordering != state ordering):
//  · UpdateMultiplier instruction (instruction.rs l.66-71): [0]=43 [1]=1 [2..10)=multiplier f64 little-endian
//    [10..18)=effective_timestamp i64 little-endian  (18 bytes).
//  · Initialize instruction (l.56-61): [0]=43 [1]=0 [2..34)=authority (OptionalNonZeroPubkey 32, all-zero=None)
//    [34..42)=multiplier f64 little-endian  (42 bytes).
//  · State ScaledUiAmountConfig (mod.rs, ORDER DIFFERS): authority(32) · multiplier(f64 little-endian) ·
//    new_multiplier_effective_timestamp(i64 little-endian) · new_multiplier(f64 little-endian)  (56 bytes).
//
// Replay (processor.rs, body read verbatim): process_initialize (l.32-34) sets multiplier=new_multiplier=m0,
// effTs=0. process_update_multiplier: new_multiplier=m (l.55); effTs=max(ts,0) (l.57-60); if
// clock.unix_timestamp >= int_effective_timestamp then multiplier=new_multiplier (l.64-65). Read rule (mod.rs):
// current_multiplier(t) = new_multiplier if t >= effTs else multiplier — comparison LARGE (>=), F-3.
// f64 IEEE-754 is not decimal-round-trip-exact (F-4): the multiplier is carried as its 8 little-endian bytes (hex) AND a
// display string; equality is decided on the BITS, never the decimal.

const HEX = (b: Uint8Array): string => [...b].map((n) => n.toString(16).padStart(2, "0")).join("");

/** f64 (host number) -> 8 little-endian bytes as 16 hex chars (bit-exact persistence, F-4). */
export function f64BitsHexLE(x: number): string {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, x, true);
  return HEX(new Uint8Array(dv.buffer));
}
/** 16-hex-char little-endian f64 bits -> host number (read-back; DataView.getFloat64 little-endian). */
export function f64FromBitsHexLE(hex: string): number {
  if (!/^[0-9a-f]{16}$/i.test(hex)) throw new Error("bell rebase: f64 bits must be 16 hex chars");
  const dv = new DataView(new ArrayBuffer(8));
  for (let i = 0; i < 8; i++) dv.setUint8(i, parseInt(hex.slice(i * 2, i * 2 + 2), 16));
  return dv.getFloat64(0, true);
}
const readF64 = (b: Uint8Array, off: number): { value: number; bitsHex: string } => {
  const bits = b.slice(off, off + 8);
  if (bits.length !== 8) throw new Error("bell rebase: f64 slice underrun");
  return { value: new DataView(bits.buffer, bits.byteOffset, 8).getFloat64(0, true), bitsHex: HEX(bits) };
};
const readI64Sec = (b: Uint8Array, off: number): number => {
  const s = b.slice(off, off + 8);
  if (s.length !== 8) throw new Error("bell rebase: i64 slice underrun");
  return Number(new DataView(s.buffer, s.byteOffset, 8).getBigInt64(0, true)); // unix seconds fit a double
};

export const SCALED_UI_INSTR = 43; // TokenInstruction::ScaledUiAmountExtension (instruction.rs)
export const SUB_INITIALIZE = 0, SUB_UPDATE = 1; // ScaledUiAmountMintInstruction

/** Decoded UpdateMultiplier (43/1) instruction payload, or null when the bytes are not a 43/1 instruction. */
export interface DecodedUpdate { readonly multiplier: number; readonly multiplierBitsHex: string; readonly effectiveTimestampSec: number }
export function decodeUpdateMultiplier(data: Uint8Array): DecodedUpdate | null {
  if (data.length < 18 || data[0] !== SCALED_UI_INSTR || data[1] !== SUB_UPDATE) return null;
  const m = readF64(data, 2);
  return { multiplier: m.value, multiplierBitsHex: m.bitsHex, effectiveTimestampSec: readI64Sec(data, 10) };
}
/** Decoded Initialize (43/0) instruction payload (authority: all-zero pubkey => null), or null if not 43/0. */
export interface DecodedInitialize { readonly authority: string | null; readonly multiplier: number; readonly multiplierBitsHex: string }
export function decodeInitialize(data: Uint8Array): DecodedInitialize | null {
  if (data.length < 42 || data[0] !== SCALED_UI_INSTR || data[1] !== SUB_INITIALIZE) return null;
  const auth = data.slice(2, 34);
  const isZero = auth.every((x) => x === 0);
  const m = readF64(data, 34);
  return { authority: isZero ? null : HEX(auth), multiplier: m.value, multiplierBitsHex: m.bitsHex };
}
/** Decoded persistent state ScaledUiAmountConfig (ORDER != instruction — pitfall F-8). Second decoder (C). */
export interface DecodedStateConfig { readonly authority: string | null; readonly multiplier: number; readonly multiplierBitsHex: string; readonly effectiveTimestampSec: number; readonly newMultiplier: number; readonly newMultiplierBitsHex: string }
export function decodeStateConfig(data: Uint8Array): DecodedStateConfig {
  if (data.length < 56) throw new Error("bell rebase: ScaledUiAmountConfig state needs 56 bytes");
  const auth = data.slice(0, 32);
  const mul = readF64(data, 32);
  const eff = readI64Sec(data, 40);
  const nmul = readF64(data, 48);
  return { authority: auth.every((x) => x === 0) ? null : HEX(auth), multiplier: mul.value, multiplierBitsHex: mul.bitsHex, effectiveTimestampSec: eff, newMultiplier: nmul.value, newMultiplierBitsHex: nmul.bitsHex };
}

/** One replayed multiplier event, ordered by (slot, instructionIndex). Plain data: serializable, so it rides
 *  inside SymbolInput and the offline replay oracle is bit-identical. blockTimeSec is the CLOCK of the tx that
 *  carried the instruction (processor uses clock.unix_timestamp). effectiveTimestampSec is 0 for Initialize. */
export interface MultiplierEvent {
  readonly kind: "initialize" | "update";
  readonly multiplier: string;         // decimal display (never re-parsed for compute — F-4)
  readonly multiplierBitsHex: string;  // 8 little-endian bytes; the equality key
  readonly effectiveTimestampSec: number;
  readonly blockTimeSec: number;
  readonly slot: number;
  readonly instructionIndex: number;
  readonly signature: string;
}
/** The resolved (multiplier, new_multiplier, effTs) triplet at a point in the replay — bits + effTs. */
export interface ReplayTriplet { readonly multiplierBitsHex: string; readonly newMultiplierBitsHex: string; readonly effectiveTimestampSec: number }

const bySlotIndex = (a: MultiplierEvent, b: MultiplierEvent): number => a.slot - b.slot || a.instructionIndex - b.instructionIndex;

/** Fold the events with blockTimeSec <= tSec into the stored triplet (multiplier / new_multiplier / effTs),
 *  exactly as the on-chain processor would have (each event's clock = its own blockTime). MUST start at an
 *  Initialize (the first event). Returns null when no Initialize precedes tSec. Pure. */
function tripletUpTo(events: readonly MultiplierEvent[], tSec: number): { mulBits: string; newBits: string; effTs: number } | null {
  const sorted = [...events].sort(bySlotIndex);
  let st: { mulBits: string; newBits: string; effTs: number } | null = null;
  for (const e of sorted) {
    if (e.blockTimeSec > tSec) break;
    if (e.kind === "initialize") { st = { mulBits: e.multiplierBitsHex, newBits: e.multiplierBitsHex, effTs: 0 }; continue; }
    if (st === null) continue; // an update with no preceding Initialize (incomplete scan) — caller fails closed
    const effTs = Math.max(e.effectiveTimestampSec, 0);
    st.newBits = e.multiplierBitsHex; st.effTs = effTs;
    if (e.blockTimeSec >= effTs) st.mulBits = e.multiplierBitsHex; // immediate fold (l.64-65)
  }
  return st;
}

/** current_multiplier at a past instant tSec (unix SECONDS), by chronological replay from Initialize. Read rule
 *  (mod.rs, LARGE >=): after folding events up to t, return new_multiplier if t >= effTs else multiplier. Returns
 *  null when no Initialize precedes t (multiplier undefined — the caller abstains, never a fabricated 1). */
export function multiplierAtSec(events: readonly MultiplierEvent[], tSec: number): { value: number; bitsHex: string } | null {
  const st = tripletUpTo(events, tSec);
  if (st === null) return null;
  const bits = tSec >= st.effTs ? st.newBits : st.mulBits;
  return { value: f64FromBitsHexLE(bits), bitsHex: bits };
}
/** Same, for a fill whose blockTime is in MILLISECONDS (SwapFill.blockTimeUtcMs). One boundary, tested once. */
export function multiplierAtMs(events: readonly MultiplierEvent[], tMs: number): { value: number; bitsHex: string } | null {
  return multiplierAtSec(events, Math.floor(tMs / 1000));
}
/** The fully-resolved stored triplet after replaying ALL events with blockTime <= atSec (C-3 oracle anchor:
 *  bounded to the pinned slot's time). Bit-exact against a read ScaledUiAmountConfig. Null if no Initialize. */
export function replayTriplet(events: readonly MultiplierEvent[], atSec: number): ReplayTriplet | null {
  const st = tripletUpTo(events, atSec);
  return st === null ? null : { multiplierBitsHex: st.mulBits, newMultiplierBitsHex: st.newBits, effectiveTimestampSec: st.effTs };
}

/** Count of scheduled updates that OVERWROTE a still-pending prior update (pitfall F-2): an update whose
 *  immediately-preceding update had not yet taken effect at this update's blockTime (prevEffTs > blockTime).
 *  Such a pending value never folded into `multiplier`. Published; a non-zero count fails the gate closed. */
export function overwrittenPending(events: readonly MultiplierEvent[]): number {
  const updates = [...events].sort(bySlotIndex).filter((e) => e.kind === "update");
  let n = 0;
  for (let i = 1; i < updates.length; i++) {
    const prev = updates[i - 1], cur = updates[i];
    if (prev === undefined || cur === undefined) continue;
    if (Math.max(prev.effectiveTimestampSec, 0) > cur.blockTimeSec) n += 1;
  }
  return n;
}

/** m(t) identical for EVERY t in [fromSec, toSec] (C-1: `constant` is decided on the replayed trajectory, not on
 *  "zero in-window events"). Breakpoints = the two bounds ∪ in-window event blockTimes ∪ in-window effTs values
 *  (m jumps AT an effTs under the >= rule — this catches a pre-window update whose effTs lands in-window).
 *  Equality is on the f64 BITS. Returns the constant multiplier (bits+value) or null. */
export function constantMultiplierOver(events: readonly MultiplierEvent[], fromSec: number, toSec: number): { value: number; bitsHex: string } | null {
  const inWin = (t: number): boolean => t >= fromSec && t <= toSec;
  const breaks = new Set<number>([fromSec, toSec]);
  for (const e of events) { if (inWin(e.blockTimeSec)) breaks.add(e.blockTimeSec); if (inWin(e.effectiveTimestampSec)) breaks.add(e.effectiveTimestampSec); }
  let ref: { value: number; bitsHex: string } | null = null;
  for (const t of [...breaks].sort((a, b) => a - b)) {
    const m = multiplierAtSec(events, t);
    if (m === null) return null; // no Initialize before a bound => not established constant
    if (ref === null) ref = m;
    else if (m.bitsHex !== ref.bitsHex) return null;
  }
  return ref;
}
