// MONARK Genkan: the order encoder of the gate. An order is "GNK1" kind:u8 flags:u8 target:str asset:str amount:u128, then
// assetOut:str minOut:u128 for a SWAP and only a SWAP, with no byte after; integers are big-endian, a str is a length byte of
// 1 to 128 then that many bytes, each one of the 42 bytes 0-9, a-z, `:`, `.`, `_`, `/`, `@`, `-`. Kinds: 1 TRANSFER, 2 APPROVE,
// 3 SWAP, 4 EXIT, 5 OPEN; flags is 1 for an EXIT and 0 otherwise. The kernel decodes the same bytes (kernel/Genkan/Format.lean),
// and the vectors kernel/vectors/gnk1.json hold both sides to the formats. Pure, Node built-ins only: a field outside the
// format throws a RangeError, and nothing is written for it.

export type OrderKind = "TRANSFER" | "APPROVE" | "SWAP" | "EXIT" | "OPEN";

/** The fields of an order. A SWAP carries its assetOut and minOut; any other kind carries neither. */
export interface OrderFields {
  readonly kind: OrderKind;
  readonly target: string;
  readonly asset: string;
  readonly amount: bigint;
  readonly assetOut?: string; // a SWAP's, and only a SWAP's
  readonly minOut?: bigint; // a SWAP's, and only a SWAP's
}

const KIND_CODE: Readonly<Record<OrderKind, number>> = { TRANSFER: 1, APPROVE: 2, SWAP: 3, EXIT: 4, OPEN: 5 };
const MAGIC = [0x47, 0x4e, 0x4b, 0x31]; // "GNK1"
const STR_ALPHABET = /^[0-9a-z:._/@-]{1,128}$/;
const U128_LIMIT = 1n << 128n;

/** A str field: its length byte, then its bytes (ASCII once the alphabet holds). */
function str(name: string, s: string): number[] {
  if (!STR_ALPHABET.test(s)) {
    throw new RangeError(`${name} must be 1 to 128 characters of 0-9, a-z, ':', '.', '_', '/', '@', '-' (got ${JSON.stringify(s)})`);
  }
  return [s.length, ...Array.from(s, (c) => c.charCodeAt(0))];
}

/** A u128 field: 16 bytes, big-endian. */
function u128(name: string, n: bigint): number[] {
  if (n < 0n || n >= U128_LIMIT) throw new RangeError(`${name} must be within 0 to 2^128 - 1 (got ${n.toString()})`);
  const out: number[] = [];
  for (let k = 15; k >= 0; k--) out.push(Number((n >> BigInt(8 * k)) & 0xffn));
  return out;
}

/** The GNK1 bytes of an order; a RangeError for any field outside the format. */
export function encodeOrder(o: OrderFields): Uint8Array {
  if (!Object.hasOwn(KIND_CODE, o.kind)) throw new RangeError(`kind must be one of ${Object.keys(KIND_CODE).join(", ")} (got ${JSON.stringify(o.kind)})`);
  const kind = KIND_CODE[o.kind];
  const bytes = [...MAGIC, kind, kind === KIND_CODE.EXIT ? 1 : 0, ...str("target", o.target), ...str("asset", o.asset), ...u128("amount", o.amount)];
  if (kind === KIND_CODE.SWAP) {
    if (o.assetOut === undefined || o.minOut === undefined) throw new RangeError("a SWAP carries its assetOut and its minOut");
    bytes.push(...str("assetOut", o.assetOut), ...u128("minOut", o.minOut));
  } else if (o.assetOut !== undefined || o.minOut !== undefined) {
    throw new RangeError(`a ${o.kind} carries neither assetOut nor minOut`);
  }
  return Uint8Array.from(bytes);
}
