// GENKAN - the GNK1 vectors (apps/genkan/kernel/vectors/gnk1.json) and the order encoder of the gate (apps/genkan/src/frame.ts).
// The vectors were written by hand from the formats, never from frame.ts, and never change after L2a (the judge of L3 reads
// the same ones). An order is "GNK1" kind:u8 flags:u8 target:str asset:str amount:u128, then assetOut:str minOut:u128 for a
// SWAP only, integers big-endian, a str a length byte of 1 to 128 then that many bytes of the 42-byte alphabet; flags is 1
// for an EXIT and 0 otherwise. The file is checked first on its own; then each valid vector's fields must encode to its hex,
// and each unencodable one must throw a RangeError. The module is reached through a non-literal dynamic import, so tsc stays
// green before it exists and the test reds by an assertion, not by a crash of its file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const VECTORS = fileURLToPath(new URL("../kernel/vectors/gnk1.json", import.meta.url));
const FRAME_TS = fileURLToPath(new URL("../src/frame.ts", import.meta.url));

// The API of frame.ts, mirrored here (the module is imported by a computed path).
type OrderKind = "TRANSFER" | "APPROVE" | "SWAP" | "EXIT" | "OPEN";
interface OrderFields {
  readonly kind: OrderKind;
  readonly target: string;
  readonly asset: string;
  readonly amount: bigint;
  readonly assetOut?: string;
  readonly minOut?: bigint;
}
interface FrameModule { encodeOrder(o: OrderFields): Uint8Array }

/** The fields of a vector as the file writes them: amounts and minOut as decimal strings. */
interface JsonFields { kind: string; target: string; asset: string; amount: string; assetOut?: string; minOut?: string }
interface Vectors {
  format: string;
  orders: {
    valid: { name: string; hex: string; fields: JsonFields; line: string }[];
    invalid: { name: string; hex: string; why: string }[];
  };
  unencodable: { name: string; fields: JsonFields; why: string }[];
  requests: { name: string; hex: string; why: string }[];
  sha256: { seed: string; lengths: number[]; patterns: { byte: number; length: number }[] };
}

// The kind codes of the formats.
const KIND_CODE: Record<OrderKind, number> = { TRANSFER: 1, APPROVE: 2, SWAP: 3, EXIT: 4, OPEN: 5 };
const isKind = (k: string): k is OrderKind => Object.hasOwn(KIND_CODE, k);
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;

/** The kernel's line for a valid order: decimals without leading zeros, strs as their bytes, the SWAP pair last. */
function lineOf(f: JsonFields): string {
  assert.ok(isKind(f.kind), `a valid vector's kind is one of the five: ${f.kind}`);
  const k = KIND_CODE[f.kind];
  const head = `order kind=${String(k)} flags=${k === 4 ? "1" : "0"} target=${f.target} asset=${f.asset} amount=${BigInt(f.amount).toString()}`;
  if (k !== 3) return head;
  assert.ok(f.assetOut !== undefined && f.minOut !== undefined, "a valid SWAP vector holds its assetOut and its minOut");
  return `${head} assetOut=${f.assetOut} minOut=${BigInt(f.minOut).toString()}`;
}

/** The fields as encodeOrder takes them; an absent optional field stays absent. The kind is passed as written. */
const toOrder = (f: JsonFields): OrderFields => ({
  kind: f.kind as OrderKind,
  target: f.target,
  asset: f.asset,
  amount: BigInt(f.amount),
  ...(f.assetOut !== undefined ? { assetOut: f.assetOut } : {}),
  ...(f.minOut !== undefined ? { minOut: BigInt(f.minOut) } : {}),
});

// killer: apps/genkan/src/frame.ts:45 CONST "kind === KIND_CODE.EXIT ? 1 : 0" -> "0"
test("gnk1_vectors_encode", async () => {
  // (1) The vector file on its own: it exists, it parses, its names are unique, its hex is lowercase and of even length, and
  // each valid vector's line is the one the formats give for its fields.
  assert.ok(existsSync(VECTORS), `the vectors must exist: ${VECTORS}`);
  const v = JSON.parse(readFileSync(VECTORS, "utf8")) as Vectors;
  const valid = v.orders.valid;
  const invalid = v.orders.invalid;
  const names = [...valid, ...invalid, ...v.unencodable, ...v.requests].map((x) => x.name);
  assert.equal(new Set(names).size, names.length, `the vector names are unique: ${names.filter((n, i) => names.indexOf(n) !== i).join(", ")}`);
  for (const x of [...valid, ...invalid, ...v.requests]) {
    assert.match(x.hex, /^(?:[0-9a-f]{2})*$/, `${x.name}: the hex is lowercase, of even length`);
  }
  for (const x of valid) {
    for (const n of [x.fields.amount, x.fields.minOut]) if (n !== undefined) assert.match(n, DECIMAL, `${x.name}: a decimal without leading zeros`);
    assert.equal(x.line, lineOf(x.fields), `${x.name}: the line is the one its fields give`);
  }
  // Non-vacuity: the exact count of each family, and the five kinds among the valid vectors.
  assert.equal(valid.length, 9, "9 valid orders");
  assert.equal(invalid.length, 49, "49 invalid orders");
  assert.equal(v.unencodable.length, 20, "20 unencodable fields");
  assert.equal(v.requests.length, 23, "23 refused requests");
  assert.deepEqual([...new Set(valid.map((x) => x.fields.kind))].sort(), ["APPROVE", "EXIT", "OPEN", "SWAP", "TRANSFER"], "the five kinds are valid");

  // (2) The encoder: each valid vector's fields encode to its hex, and each unencodable one throws a RangeError.
  assert.ok(existsSync(FRAME_TS), `the encoder must exist: ${FRAME_TS}`);
  const frame = (await import(pathToFileURL(FRAME_TS).href)) as FrameModule;
  for (const x of valid) {
    const out = frame.encodeOrder(toOrder(x.fields));
    assert.ok(out instanceof Uint8Array, `${x.name}: encodeOrder returns a Uint8Array`);
    assert.equal(Buffer.from(out).toString("hex"), x.hex, `${x.name}: the fields encode to the vector's hex`);
  }
  for (const x of v.unencodable) {
    assert.throws(() => frame.encodeOrder(toOrder(x.fields)), RangeError, `${x.name}: encodeOrder refuses the fields with a RangeError (${x.why})`);
  }
});
