// MONARK Genkan: the frames of the gate. An order is "GNK1" kind:u8 flags:u8 target:str asset:str amount:u128, then
// assetOut:str minOut:u128 for a SWAP and only a SWAP, with no byte after; integers are big-endian, a str is a length byte of
// 1 to 128 then that many bytes, each one of the 42 bytes 0-9, a-z, `:`, `.`, `_`, `/`, `@`, `-`. Kinds: 1 TRANSFER, 2 APPROVE,
// 3 SWAP, 4 EXIT, 5 OPEN; flags is 1 for an EXIT and 0 otherwise. A context of the judge is "GNKC" action:u8, venues:u8 then
// that many str, assets:u8 then that many str cap:u128, with no byte after; actions 1 commit, 2 defer, 3 abstain (the action
// of HIKAE's GateDecision), no name twice in a list. A request of the judge is "GNKQ" 1 ctx:sec order:sec, a sec being a
// u32 length then that many bytes; the kernel answers one line, `allow` or `deny <reason>`, and exits 0, or refuses a
// malformed request with exit 3 and nothing written. The kernel decodes the same bytes (kernel/Genkan/Format.lean and
// kernel/Genkan/Judge.lean), and the vectors kernel/vectors/gnk1.json and kernel/vectors/judge.json hold both sides to the
// formats. Pure, Node built-ins only: a field outside the format throws a RangeError, and nothing is written for it.

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

// ---- the judge (mode 1) -------------------------------------------------------------------------------------------------

/** HIKAE's decision on the signal an order follows: the action of its GateDecision. */
export type Action = "commit" | "defer" | "abstain";

/** A context of the judge: the action, the venues the orders may target, the assets they may move with each one's cap. */
export interface ContextFields {
  readonly action: Action;
  readonly venues: readonly string[];
  readonly assets: readonly { readonly asset: string; readonly cap: bigint }[];
}

/** Why the kernel's judge refuses an order: its reasons, a closed set. */
export type Reason = "bad-ctx" | "bad-order" | "kind" | "venue" | "not-commit" | "asset" | "over-cap" | "asset-out" | "min-out";

/** The kernel's answer read: an allow, a deny with its reason, a refused request, or anything else (unreadable). */
export type Verdict = { readonly allow: true } | { readonly allow: false; readonly reason: Reason | "refused" | "unreadable" };

const ACTION_CODE: Readonly<Record<Action, number>> = { commit: 1, defer: 2, abstain: 3 };
const CTX_MAGIC = [0x47, 0x4e, 0x4b, 0x43]; // "GNKC"
const REQUEST_MAGIC = [0x47, 0x4e, 0x4b, 0x51]; // "GNKQ"
const REQUEST_CAP = 1_048_576; // the kernel reads at most this many bytes
const LIST_MAX = 255; // a list's count is one byte
const REASONS: ReadonlySet<string> = new Set<Reason>(["bad-ctx", "bad-order", "kind", "venue", "not-commit", "asset", "over-cap", "asset-out", "min-out"]);
const LINE_MAX = 32; // longer than any line of the judge
const UNREADABLE: Verdict = { allow: false, reason: "unreadable" };

/** A list's count byte; a RangeError past 255 names or for a name listed twice. */
function count(name: string, names: readonly string[]): number {
  if (names.length > LIST_MAX) throw new RangeError(`${name} hold at most ${String(LIST_MAX)} names (got ${String(names.length)})`);
  const seen = new Set<string>();
  for (const n of names) {
    if (seen.has(n)) throw new RangeError(`${name} name ${JSON.stringify(n)} twice`);
    seen.add(n);
  }
  return names.length;
}

/** The GNKC bytes of a context; a RangeError for any field outside the format. */
export function encodeContext(c: ContextFields): Uint8Array {
  if (!Object.hasOwn(ACTION_CODE, c.action)) throw new RangeError(`action must be one of ${Object.keys(ACTION_CODE).join(", ")} (got ${JSON.stringify(c.action)})`);
  const bytes = [...CTX_MAGIC, ACTION_CODE[c.action], count("venues", c.venues)];
  for (const v of c.venues) bytes.push(...str("venue", v));
  bytes.push(count("assets", c.assets.map((a) => a.asset)));
  for (const a of c.assets) bytes.push(...str("asset", a.asset), ...u128("cap", a.cap));
  return Uint8Array.from(bytes);
}

/** The four bytes of a u32, big-endian. */
const u32 = (n: number): number[] => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];

/** The mode 1 request of a context's bytes and an order's bytes; a RangeError past the 1 048 576 bytes the kernel reads. */
export function encodeJudgeRequest(ctx: Uint8Array, order: Uint8Array): Uint8Array {
  const size = REQUEST_MAGIC.length + 1 + 4 + ctx.length + 4 + order.length;
  if (size > REQUEST_CAP) throw new RangeError(`a request holds at most ${String(REQUEST_CAP)} bytes (got ${String(size)})`);
  const out = new Uint8Array(size);
  out.set(REQUEST_MAGIC, 0);
  out[4] = 1;
  out.set(u32(ctx.length), 5);
  out.set(ctx, 9);
  out.set(u32(order.length), 9 + ctx.length);
  out.set(order, 13 + ctx.length);
  return out;
}

/** The kernel's answer to a mode 1 request, read fail-closed: an allow only for exit 0 and exactly the line `allow`. */
export function readVerdict(status: number | null, stdout: Uint8Array): Verdict {
  if (status === 3 && stdout.length === 0) return { allow: false, reason: "refused" };
  if (status !== 0 || stdout.length > LINE_MAX) return UNREADABLE;
  const text = String.fromCharCode(...stdout);
  if (text === "allow\n") return { allow: true };
  const m = /^deny ([a-z-]+)\n$/.exec(text);
  return m !== null && REASONS.has(m[1]!) ? { allow: false, reason: m[1] as Reason } : UNREADABLE;
}
