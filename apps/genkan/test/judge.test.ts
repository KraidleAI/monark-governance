// GENKAN - the judge vectors (apps/genkan/kernel/vectors/judge.json) and the judge's frames in apps/genkan/src/frame.ts:
// encodeContext, encodeJudgeRequest and readVerdict. A context is "GNKC" action:u8, venues:u8 then that many str,
// assets:u8 then that many str cap:u128, with no byte after; actions 1 commit, 2 defer, 3 abstain; no name twice in a list.
// A mode 1 request is "GNKQ" 1 ctx:sec order:sec. The kernel answers it with one line, `allow` or `deny <reason>`, the
// reasons a closed set. The file is checked first on its own (names, hex, references, lines, counts); then each valid
// context's fields must encode to its hex, each unencodable one must throw a RangeError, each order's fields must encode
// to its hex, a request must be the two secs after "GNKQ" 1, and readVerdict must allow on exactly `allow` and exit 0, and
// nothing else. The kernel's answers to the cases are checked in formats.kernel.test.ts. The module is reached through a
// non-literal dynamic import, as frame.test.ts does, so the test reds by an assertion while a function is missing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const JUDGE = fileURLToPath(new URL("../kernel/vectors/judge.json", import.meta.url));
const GNK1 = fileURLToPath(new URL("../kernel/vectors/gnk1.json", import.meta.url));
const FRAME_TS = fileURLToPath(new URL("../src/frame.ts", import.meta.url));
const CAP = 1_048_576;

// The API of frame.ts for the judge, mirrored here (the module is imported by a computed path).
type Action = "commit" | "defer" | "abstain";
interface ContextFields {
  readonly action: Action;
  readonly venues: readonly string[];
  readonly assets: readonly { readonly asset: string; readonly cap: bigint }[];
}
type Verdict = { readonly allow: true } | { readonly allow: false; readonly reason: string };
type OrderKind = "TRANSFER" | "APPROVE" | "SWAP" | "EXIT" | "OPEN";
interface OrderFields {
  readonly kind: OrderKind;
  readonly target: string;
  readonly asset: string;
  readonly amount: bigint;
  readonly assetOut?: string;
  readonly minOut?: bigint;
}
interface FrameModule {
  encodeOrder?: (o: OrderFields) => Uint8Array;
  encodeContext?: (c: ContextFields) => Uint8Array;
  encodeJudgeRequest?: (ctx: Uint8Array, order: Uint8Array) => Uint8Array;
  readVerdict?: (status: number | null, stdout: Uint8Array) => Verdict;
}

/** The fields of a context as the file writes them: caps as decimal strings. */
interface JsonContext { action: string; venues: string[]; assets: { asset: string; cap: string }[] }
interface Named { name: string; hex: string }
interface JudgeVectors {
  format: string;
  contexts: { valid: (Named & { fields: JsonContext })[]; invalid: (Named & { why: string })[] };
  orders: (Named & { fields: Record<string, string> })[];
  cases: { ctx: string; order: string; line: string }[];
  requests: (Named & { why: string })[];
  unencodable: { name: string; fields: JsonContext; why: string }[];
}
interface Gnk1 { orders: { valid: Named[]; invalid: Named[] }; unencodable: { name: string }[]; requests: Named[] }

const REASONS = ["bad-ctx", "bad-order", "kind", "venue", "not-commit", "asset", "over-cap", "asset-out", "min-out"];
const LINES = new Set(["allow", ...REASONS.map((r) => `deny ${r}`)]);
const DECIMAL = /^-?(?:0|[1-9][0-9]*)$/;

const toContext = (f: JsonContext): ContextFields => ({
  action: f.action as Action,
  venues: f.venues,
  assets: f.assets.map((a) => ({ asset: a.asset, cap: BigInt(a.cap) })),
});
/** The fields of an order as the file writes them, as encodeOrder takes them: an absent optional field stays absent. */
const toOrder = (f: Record<string, string>): OrderFields => ({
  kind: f.kind as OrderKind,
  target: f.target ?? "",
  asset: f.asset ?? "",
  amount: BigInt(f.amount ?? ""),
  ...(f.assetOut !== undefined ? { assetOut: f.assetOut } : {}),
  ...(f.minOut !== undefined ? { minOut: BigInt(f.minOut) } : {}),
});
const u32 = (n: number): Buffer => {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
};
const sec = (b: Buffer): Buffer => Buffer.concat([u32(b.length), b]);
const latin = (s: string): Buffer => Buffer.from(s, "latin1");

/** The vectors, read and checked on their own. */
function judgeVectors(): { v: JudgeVectors; g: Gnk1 } {
  assert.ok(existsSync(JUDGE), `the judge vectors must exist: ${JUDGE}`);
  const v = JSON.parse(readFileSync(JUDGE, "utf8")) as JudgeVectors;
  const g = JSON.parse(readFileSync(GNK1, "utf8")) as Gnk1;
  return { v, g };
}

test("judge_vectors_hold_together", () => {
  const { v, g } = judgeVectors();
  // Names: unique in the file, and none taken from gnk1.json.
  const own = [...v.contexts.valid, ...v.contexts.invalid, ...v.orders, ...v.requests, ...v.unencodable].map((x) => x.name);
  assert.equal(new Set(own).size, own.length, `the names are unique: ${own.filter((n, i) => own.indexOf(n) !== i).join(", ")}`);
  const theirs = new Set([...g.orders.valid, ...g.orders.invalid, ...g.unencodable, ...g.requests].map((x) => x.name));
  for (const n of own) assert.ok(!theirs.has(n), `${n} is not a name of gnk1.json`);
  for (const x of [...v.contexts.valid, ...v.contexts.invalid, ...v.orders, ...v.requests]) {
    assert.match(x.hex, /^(?:[0-9a-f]{2})*$/, `${x.name}: the hex is lowercase, of even length`);
  }
  for (const x of v.contexts.valid) for (const a of x.fields.assets) assert.match(a.cap, DECIMAL, `${x.name}: a cap is a decimal`);
  // Each case names a context of the file and an order of the file or of gnk1.json, and its line is one of the closed set.
  const contexts = new Set([...v.contexts.valid, ...v.contexts.invalid].map((x) => x.name));
  const orders = new Set([...v.orders, ...g.orders.valid, ...g.orders.invalid].map((x) => x.name));
  for (const c of v.cases) {
    assert.ok(contexts.has(c.ctx), `a case names the context ${c.ctx}`);
    assert.ok(orders.has(c.order), `a case names the order ${c.order}`);
    assert.ok(LINES.has(c.line), `${c.ctx} x ${c.order}: the line ${JSON.stringify(c.line)} is allow or deny with a reason of the set`);
  }
  // Every invalid context is a case, with the line `deny bad-ctx`; no valid one is.
  for (const x of v.contexts.invalid) {
    assert.ok(v.cases.some((c) => c.ctx === x.name && c.line === "deny bad-ctx"), `the invalid context ${x.name} is judged deny bad-ctx`);
  }
  for (const c of v.cases) if (v.contexts.valid.some((x) => x.name === c.ctx)) assert.notEqual(c.line, "deny bad-ctx", `${c.ctx} is valid`);
  // Non-vacuity: the counts, every line of the set among the cases, the three actions among the valid contexts.
  assert.equal(v.contexts.valid.length, 7, "7 valid contexts");
  assert.equal(v.contexts.invalid.length, 24, "24 invalid contexts");
  assert.equal(v.orders.length, 25, "25 orders of the cases");
  assert.equal(v.cases.length, 82, "82 cases");
  assert.equal(v.requests.length, 7, "7 refused mode 1 requests");
  assert.equal(v.unencodable.length, 12, "12 unencodable contexts");
  for (const l of LINES) assert.ok(v.cases.some((c) => c.line === l), `a case has the line ${l}`);
  assert.deepEqual([...new Set(v.contexts.valid.map((x) => x.fields.action))].sort(), ["abstain", "commit", "defer"], "the three actions are valid");
  for (const x of v.requests) assert.equal(Buffer.from(x.hex, "hex")[4], 1, `${x.name} is a mode 1 request`);
});

test("judge_context_encodes", async () => {
  const { v } = judgeVectors();
  assert.ok(existsSync(FRAME_TS), `the encoder must exist: ${FRAME_TS}`);
  const frame = (await import(pathToFileURL(FRAME_TS).href)) as FrameModule;
  assert.equal(typeof frame.encodeContext, "function", "frame.ts exports encodeContext");
  const encode = frame.encodeContext!;
  for (const x of v.contexts.valid) {
    const out = encode(toContext(x.fields));
    assert.ok(out instanceof Uint8Array, `${x.name}: encodeContext returns a Uint8Array`);
    assert.equal(Buffer.from(out).toString("hex"), x.hex, `${x.name}: the fields encode to the vector's hex`);
  }
  for (const x of v.unencodable) {
    assert.throws(() => encode(toContext(x.fields)), RangeError, `${x.name}: encodeContext refuses the fields with a RangeError (${x.why})`);
  }
});

test("judge_orders_encode", async () => {
  // The orders of the cases: the fields of each, as the file writes them, encode to its hex.
  const { v } = judgeVectors();
  const frame = (await import(pathToFileURL(FRAME_TS).href)) as FrameModule;
  assert.equal(typeof frame.encodeOrder, "function", "frame.ts exports encodeOrder");
  const encode = frame.encodeOrder!;
  for (const x of v.orders) {
    assert.equal(Buffer.from(encode(toOrder(x.fields))).toString("hex"), x.hex, `${x.name}: the fields encode to the vector's hex`);
  }
});

test("judge_request_encodes", async () => {
  const { v, g } = judgeVectors();
  const frame = (await import(pathToFileURL(FRAME_TS).href)) as FrameModule;
  assert.equal(typeof frame.encodeJudgeRequest, "function", "frame.ts exports encodeJudgeRequest");
  const encode = frame.encodeJudgeRequest!;
  const ctx = Buffer.from(v.contexts.valid[0]!.hex, "hex");
  const order = Buffer.from(g.orders.valid[0]!.hex, "hex");
  const want = Buffer.concat([latin("GNKQ"), Buffer.from([1]), sec(ctx), sec(order)]);
  assert.equal(Buffer.from(encode(ctx, order)).toString("hex"), want.toString("hex"), "GNKQ, mode 1, the ctx's sec, the order's sec");
  const empty = Buffer.alloc(0);
  assert.equal(Buffer.from(encode(empty, empty)).toString("hex"), "474e4b51010000000000000000", "two empty secs");
  // The kernel reads 1 048 576 bytes at most: a request of exactly that is encoded, one byte more is refused.
  assert.equal(encode(Buffer.alloc(CAP - 13), empty).length, CAP, "a request of exactly 1 048 576 bytes");
  assert.throws(() => encode(Buffer.alloc(CAP - 12), empty), RangeError, "a request of 1 048 577 bytes is refused");
});

test("judge_verdict_reads_fail_closed", async () => {
  const frame = (await import(pathToFileURL(FRAME_TS).href)) as FrameModule;
  assert.equal(typeof frame.readVerdict, "function", "frame.ts exports readVerdict");
  const read = frame.readVerdict!;
  const out = (s: string): Uint8Array => latin(s);
  assert.deepEqual(read(0, out("allow\n")), { allow: true }, "exactly `allow` and a line end, exit 0: allow");
  for (const r of REASONS) assert.deepEqual(read(0, out(`deny ${r}\n`)), { allow: false, reason: r }, `deny ${r}`);
  assert.deepEqual(read(3, out("")), { allow: false, reason: "refused" }, "exit 3 and nothing written: the kernel refused the request");
  // Anything else is unreadable, and never an allow.
  const unreadable: [number | null, string, string][] = [
    [0, "allow", "no line end"],
    [0, "allow\n\n", "two line ends"],
    [0, "allow\r\n", "a carriage return"],
    [0, " allow\n", "a leading space"],
    [0, "ALLOW\n", "upper case"],
    [0, "deny\n", "a deny without its reason"],
    [0, "deny over-cap", "a deny without its line end"],
    [0, "deny over-cap \n", "a space after the reason"],
    [0, "deny foo\n", "a reason outside the set"],
    [0, "deny refused\n", "refused is no reason of the kernel"],
    [0, "allow\ndeny kind\n", "two lines"],
    [0, "", "nothing written"],
    [0, "order kind=5 flags=0 target=market asset=btc amount=256\n", "a mode 2 line"],
    [1, "allow\n", "exit 1"],
    [2, "allow\n", "exit 2"],
    [3, "allow\n", "exit 3 with a line"],
    [null, "allow\n", "no exit code"],
  ];
  for (const [status, s, why] of unreadable) {
    assert.deepEqual(read(status, out(s)), { allow: false, reason: "unreadable" }, `${why}: unreadable`);
  }
});
