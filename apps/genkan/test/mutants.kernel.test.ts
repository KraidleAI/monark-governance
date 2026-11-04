// GENKAN - the mutants of the decoder (Genkan/Bytes.lean and Genkan/Format.lean) and of the judge (Genkan/Judge.lean) under
// the real pinned toolchain (Lean 4.32.1), each killed by an input of the vectors. The file builds one temporary tree under
// os.tmpdir() with a copy of scripts/lake.mjs and of the real kernel (its root .lake left out), builds it once, and records
// the real binary's answer (exit code, stdout, stderr) on two sets of inputs, cheapest first: for the decoder, the inputs of
// the formats, built from apps/genkan/kernel/vectors/gnk1.json as formats.kernel.test.ts builds them; for the judge, the
// inputs of mode 1, built from apps/genkan/kernel/vectors/judge.json (and the orders of gnk1.json it names) as
// judge_vectors_by_kernel builds them, the answer to each case first held to the case's line. Then each mutant of
// helpers/mutants.ts: its text written over the copy's file, `lake.mjs build genkan-kernel` (not exit 0, or no exit within
// 120 s: « not built », counted, never run), the inputs of its file's set in order until one answer differs from the real
// one or a run times out (killed), then the original bytes restored, their sha256 checked. A mutant that no input of its
// set kills must be listed in kernel/vectors/mutants-equivalent.json, with the sha256 of its source file and why no input
// tells it from the real kernel. Each build is the executable alone: a mutant that breaks a theorem of Genkan/Theorems.lean
// must still be told from the real kernel by an input; the theorems are built and replayed by the other kernel tests and
// CI. One test per mutated file (each takes minutes: the bounds below). It runs in test:genkan only (the file name ends
// .kernel.test.ts, which npm test leaves out). With ELAN_HOME unset or blank and CI unset or false, every test is skipped;
// with CI set, a missing ELAN_HOME or a home without the pinned lake fails. The temp dir of the wrapper is GENKAN_TMP, a
// dir of the tree.
import { test, after, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { mutantsOf, type Mutant } from "./helpers/mutants.ts";

const SCRIPTS_DIR = fileURLToPath(new URL("../scripts", import.meta.url));
const KERNEL_DIR = fileURLToPath(new URL("../kernel", import.meta.url));
const VECTORS = join(KERNEL_DIR, "vectors", "gnk1.json");
const JUDGE_VECTORS = join(KERNEL_DIR, "vectors", "judge.json");
const EQUIVALENT = join(KERNEL_DIR, "vectors", "mutants-equivalent.json");
const TOOLCHAIN = "leanprover--lean4---v4.32.1";
const LAKE_EXE = process.platform === "win32" ? "lake.exe" : "lake";
const BINARY = process.platform === "win32" ? "genkan-kernel.exe" : "genkan-kernel";
const CAP = 1_048_576;
const BUILD_MS = 120_000;
const RUN_MS = 10_000;

// Measured per mutated file (win32, Lean 4.32.1), on the kernel named: the mutants generated and the mutants that do not
// build. In Bytes and Format, each a literal of a pattern, `| 0` made `| 1` or `n + 1` made `n + 2`: Lean reports missing
// cases. In Judge, four of these, in strs and capped, and there the two `n + 1` made `n + 0`, whose recursive call keeps
// the count: Lean fails to show termination. A later kernel may build more of them, never fewer.
const MEASURED: Record<string, { generated: number; notBuilt: number; on: string }> = {
  "Genkan/Bytes.lean": { generated: 59, notBuilt: 9, on: "2026-10-30, trunk 8824d25d" },
  "Genkan/Format.lean": { generated: 56, notBuilt: 2, on: "2026-10-30, trunk 8824d25d" },
  "Genkan/Judge.lean": { generated: 55, notBuilt: 6, on: "2026-11-04, 412339a0" },
};

/** A non-blank environment value, or undefined. */
const envValue = (name: string): string | undefined => {
  const v = process.env[name];
  return v === undefined || v.trim() === "" ? undefined : v;
};
const ELAN_HOME = envValue("ELAN_HOME");
const CI_VALUE = envValue("CI");
const ON_CI = CI_VALUE !== undefined && CI_VALUE.trim().toLowerCase() !== "false";
const SKIP: string | false =
  ELAN_HOME === undefined && !ON_CI ? "ELAN_HOME is unset and CI is not set: these tests need the pinned Lean 4.32.1 toolchain under ELAN_HOME" : false;
// Each test's bound: three times the longer of its two durations measured on 2026-10-30 (win32, with
// records.kernel.test.ts beside it): Bytes 208 s and 216 s, Format 186 s and 264 s.
const BYTES_OPTIONS = { skip: SKIP, timeout: 649_000 };
const FORMAT_OPTIONS = { skip: SKIP, timeout: 792_000 };
// Judge's, the same rule, its two durations measured on 2026-11-04 (win32, other sessions' Lean builds beside it): 200 s
// alone (the tree built and both sets recorded first) and 162 s in test:genkan.
const JUDGE_OPTIONS = { skip: SKIP, timeout: 600_000 };

const TMP = mkdtempSync(join(tmpdir(), "genkan-mutants-kernel-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

const show = (r: SpawnSyncReturns<string>): string =>
  `status=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\nstdout:\n${String(r.stdout)}\nstderr:\n${String(r.stderr)}`;
const sha256 = (b: Buffer): string => createHash("sha256").update(b).digest("hex");

/** The toolchain home, held to the pinned lake: a failure names ELAN_HOME. */
function pinnedHome(): string {
  assert.ok(ELAN_HOME !== undefined, `CI is set (CI=${String(CI_VALUE)}) and ELAN_HOME is not: the kernel tests need ELAN_HOME, the home of the pinned toolchain`);
  const lake = join(ELAN_HOME, "toolchains", TOOLCHAIN, "bin", LAKE_EXE);
  assert.ok(existsSync(lake), `ELAN_HOME=${ELAN_HOME} holds no pinned lake at ${lake}`);
  return ELAN_HOME;
}

/** Copies the files of `from` into `to`, the build dir .lake at its root left out. */
function copyKernel(from: string, to: string, rel = ""): void {
  for (const d of readdirSync(join(from, rel), { withFileTypes: true })) {
    if (rel === "" && d.name === ".lake") continue;
    const r = rel === "" ? d.name : join(rel, d.name);
    if (d.isDirectory()) {
      mkdirSync(join(to, r), { recursive: true });
      copyKernel(from, to, r);
    } else copyFileSync(join(from, r), join(to, r));
  }
}

interface Vectors {
  orders: { valid: { name: string; hex: string; fields: { kind: string }; line: string }[]; invalid: { name: string; hex: string }[] };
  requests: { name: string; hex: string }[];
  sha256: { seed: string; lengths: number[]; patterns: { byte: number; length: number }[] };
}
const vectors = (): Vectors => {
  assert.ok(existsSync(VECTORS), `the vectors must exist: ${VECTORS}`);
  return JSON.parse(readFileSync(VECTORS, "utf8")) as Vectors;
};

const u32 = (n: number): Buffer => {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
};
const sec = (b: Buffer): Buffer => Buffer.concat([u32(b.length), b]);
/** A request: the magic, the mode, then each sec. */
const request = (mode: number, ...secs: Buffer[]): Buffer => Buffer.concat([Buffer.from("GNKQ", "latin1"), Buffer.from([mode]), ...secs.map(sec)]);
const ZERO = Buffer.from([0]);
/** An order of the formats: "GNK1" kind:u8 flags:u8 target:str asset:str amount:u128 (no SWAP tail). */
function order(kind: number, flags: number, target: string, asset: string, amount: bigint): Buffer {
  const str = (s: string): Buffer => Buffer.concat([Buffer.from([s.length]), Buffer.from(s, "latin1")]);
  const u128 = Buffer.alloc(16);
  for (let k = 15, n = amount; k >= 0; k--, n >>= 8n) u128[k] = Number(n & 0xffn);
  return Buffer.concat([Buffer.from("GNK1", "latin1"), Buffer.from([kind, flags]), str(target), str(asset), u128]);
}
/** The first n bytes of the stream sha256(utf8(seed) || u32be(k)), k = 0, 1, 2, ... */
function stream(seed: string, n: number): Buffer {
  const blocks: Buffer[] = [];
  for (let k = 0, have = 0; have < n; k++, have += 32) blocks.push(createHash("sha256").update(Buffer.concat([Buffer.from(seed, "utf8"), u32(k)])).digest());
  return Buffer.concat(blocks).subarray(0, n);
}

/** An answer: exit code, stdout and stderr, or the timeout of the run; `key` compares two of them. */
interface Answer { status: number | null; signal: string | null; timedOut: boolean; stdout: Buffer; stderr: Buffer }
const key = (a: Answer): string =>
  a.timedOut ? "timeout" : `${String(a.status)}/${String(a.signal)}/${a.stdout.toString("hex")}/${a.stderr.toString("hex")}`;
const showAnswer = (a: Answer): string =>
  `status=${String(a.status)} signal=${String(a.signal)} timedOut=${String(a.timedOut)} stdout (latin1): ${JSON.stringify(a.stdout.toString("latin1").slice(0, 200))} ` +
  `stderr: ${JSON.stringify(a.stderr.toString("latin1").slice(0, 200))}`;

/** An input; `want`, when given, is its expected stdout, with exit 0 and nothing on stderr: the line of a case of
 * judge.json, or the line by the formats of an input added here to kill a survivor. */
interface Input { name: string; bytes: Buffer; want?: { stdout: string } }

/** The inputs of the formats, cheapest first. */
function formatsInputs(): Input[] {
  const v = vectors();
  const out: Input[] = [];
  for (const x of v.orders.valid) out.push({ name: `valid order ${x.name}`, bytes: request(2, Buffer.from(x.hex, "hex")) });
  for (const x of v.orders.invalid) out.push({ name: `invalid order ${x.name}`, bytes: request(2, Buffer.from(x.hex, "hex")) });
  for (const x of v.orders.valid) out.push({ name: `${x.name} followed by one byte 0x00`, bytes: request(2, Buffer.concat([Buffer.from(x.hex, "hex"), ZERO])) });
  for (const x of v.requests) out.push({ name: `request ${x.name}`, bytes: Buffer.from(x.hex, "hex") });
  for (const n of v.sha256.lengths) out.push({ name: `mode 3 on the first ${String(n)} bytes of the stream`, bytes: request(3, stream(v.sha256.seed, n)) });
  for (const p of v.sha256.patterns) out.push({ name: `mode 3 on ${String(p.length)} bytes 0x${p.byte.toString(16).padStart(2, "0")}`, bytes: request(3, Buffer.alloc(p.length, p.byte)) });
  // The proper prefixes of the first valid order and of the first SWAP, each in a mode 2 request.
  const first = v.orders.valid[0];
  const swap = v.orders.valid.find((x) => x.fields.kind === "SWAP");
  assert.ok(first !== undefined && swap !== undefined, "the vectors hold a valid order and a valid SWAP");
  for (const x of [first, swap]) {
    const o = Buffer.from(x.hex, "hex");
    for (let n = 0; n < o.length; n++) out.push({ name: `${x.name} cut to ${String(n)} bytes`, bytes: request(2, o.subarray(0, n)) });
  }
  out.push({ name: "a mode 1 request", bytes: request(1, Buffer.from("ctx", "latin1"), Buffer.from(first.hex, "hex")) });
  // The order encoder of this file gives the bytes of the vector `transfer`.
  const transfer = v.orders.valid.find((x) => x.name === "transfer");
  assert.ok(transfer !== undefined, "the vectors hold the order transfer");
  assert.equal(order(1, 0, "alice", "usdc", 100n).toString("hex"), transfer.hex, "the order encoder gives the bytes of the vector transfer");
  // Added to kill Genkan/Format.lean:67:12 literal-1 (`n < 10` -> `n < 9` in digits): no number of the vectors has 9 as its
  // leading digit, the one place the two differ (the mutant prints 9 as "09"). The formats: a TRANSFER, flags 0, its line.
  out.push({
    name: "a TRANSFER of amount 9",
    bytes: request(2, order(1, 0, "alice", "usdc", 9n)),
    want: { stdout: "order kind=1 flags=0 target=alice asset=usdc amount=9\n" },
  });
  out.push({ name: "a mode 2 request of exactly 1 048 576 bytes", bytes: request(2, Buffer.alloc(CAP - 9)) });
  out.push({ name: "a mode 3 request of 1 048 577 bytes", bytes: request(3, Buffer.alloc(CAP - 8)) });
  return out;
}

interface JudgeVectors {
  contexts: { valid: { name: string; hex: string }[]; invalid: { name: string; hex: string }[] };
  orders: { name: string; hex: string }[];
  cases: { ctx: string; order: string; line: string }[];
  requests: { name: string; hex: string }[];
}

/** The inputs of mode 1, as judge_vectors_by_kernel (formats.kernel.test.ts) sends them, cheapest first. */
function judgeInputs(): Input[] {
  const v = vectors();
  assert.ok(existsSync(JUDGE_VECTORS), `the judge vectors must exist: ${JUDGE_VECTORS}`);
  const j = JSON.parse(readFileSync(JUDGE_VECTORS, "utf8")) as JudgeVectors;
  const bytesOf = new Map<string, Buffer>();
  for (const x of [...j.contexts.valid, ...j.contexts.invalid, ...j.orders, ...v.orders.valid, ...v.orders.invalid]) bytesOf.set(x.name, Buffer.from(x.hex, "hex"));
  const named = (name: string): Buffer => {
    const b = bytesOf.get(name);
    assert.ok(b !== undefined, `the vectors hold ${name}`);
    return b;
  };
  const out: Input[] = [];
  // Each case, its answer held to its line.
  for (const c of j.cases) out.push({ name: `the case ${c.ctx} x ${c.order}`, bytes: request(1, named(c.ctx), named(c.order)), want: { stdout: `${c.line}\n` } });
  // The stored mode 1 requests, each refused.
  for (const x of j.requests) out.push({ name: `request ${x.name}`, bytes: Buffer.from(x.hex, "hex") });
  // Under ctx-commit: each invalid order of gnk1.json, each proper prefix of a valid OPEN and that OPEN followed by one byte.
  const commit = named("ctx-commit");
  const open = named("open-flags-0-amount-256");
  for (const x of v.orders.invalid) out.push({ name: `ctx-commit x the invalid order ${x.name}`, bytes: request(1, commit, Buffer.from(x.hex, "hex")) });
  for (let n = 0; n < open.length; n++) out.push({ name: `ctx-commit x the OPEN cut to ${String(n)} bytes`, bytes: request(1, commit, open.subarray(0, n)) });
  out.push({ name: "ctx-commit x the OPEN followed by one byte 0x00", bytes: request(1, commit, Buffer.concat([open, ZERO])) });
  // Each proper prefix of three valid contexts, and each followed by one byte, with the OPEN; a ctx and an order that do
  // not decode.
  for (const name of ["ctx-commit", "ctx-commit-nothing-listed", "ctx-commit-btc-cap-255"]) {
    const c = named(name);
    for (let n = 0; n < c.length; n++) out.push({ name: `${name} cut to ${String(n)} bytes x the OPEN`, bytes: request(1, c.subarray(0, n), open) });
    out.push({ name: `${name} followed by one byte 0x00 x the OPEN`, bytes: request(1, Buffer.concat([c, ZERO]), open) });
  }
  out.push({ name: "ctx-text x the order empty", bytes: request(1, named("ctx-text"), named("empty")) });
  // Every proper prefix of a well-formed mode 1 request, and that request followed by one byte.
  const q = request(1, commit, open);
  for (let n = 0; n < q.length; n++) out.push({ name: `the mode 1 request ctx-commit x the OPEN cut to ${String(n)} bytes`, bytes: q.subarray(0, n) });
  out.push({ name: "the mode 1 request ctx-commit x the OPEN followed by one byte", bytes: Buffer.concat([q, ZERO]) });
  // The cap: a mode 1 request of exactly 1 048 576 bytes, and one of 1 048 577 bytes.
  out.push({ name: "a mode 1 request of exactly 1 048 576 bytes", bytes: request(1, Buffer.alloc(CAP - 13), Buffer.alloc(0)) });
  out.push({ name: "a mode 1 request of 1 048 577 bytes", bytes: request(1, Buffer.alloc(CAP - 12), Buffer.alloc(0)) });
  return out;
}

/** One run of the binary on `bytes`. */
function runOnce(binary: string, bytes: Buffer): Answer {
  const r = spawnSync(binary, [], { input: bytes, stdio: "pipe", timeout: RUN_MS });
  const timedOut = (r.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT";
  return { status: r.status, signal: r.signal, timedOut, stdout: r.stdout, stderr: r.stderr };
}

/** A set of inputs, and the real kernel's answer to each. */
interface InputSet { inputs: Input[]; real: Answer[] }
type SetName = "formats" | "judge";
interface Tree { kernel: string; binary: string; build: () => SpawnSyncReturns<string>; sets: Record<SetName, InputSet> }
/** The tree of the file: built once, by the first test that needs it, the real answers recorded on every input of both
 * sets. */
let tree: Tree | undefined;
function realTree(): Tree {
  if (tree !== undefined) return tree;
  const home = pinnedHome();
  const root = join(TMP, "tree");
  const scripts = join(root, "apps", "genkan", "scripts");
  const kernel = join(root, "apps", "genkan", "kernel");
  const tmp = join(root, "tmp");
  for (const d of [scripts, kernel, tmp]) mkdirSync(d, { recursive: true });
  copyFileSync(join(SCRIPTS_DIR, "lake.mjs"), join(scripts, "lake.mjs"));
  copyKernel(KERNEL_DIR, kernel);
  const env: NodeJS.ProcessEnv = { ...process.env, ELAN_HOME: home, GENKAN_TMP: tmp };
  const build = (): SpawnSyncReturns<string> =>
    spawnSync(process.execPath, [join(scripts, "lake.mjs"), "build", "genkan-kernel"], { env, encoding: "utf8", stdio: "pipe", timeout: BUILD_MS });
  const b = build();
  assert.equal(b.status, 0, `the real kernel builds with the pinned lake\n${show(b)}`);
  const binary = join(kernel, ".lake", "build", "bin", BINARY);
  assert.ok(existsSync(binary), `the build writes the binary ${binary}\n${show(b)}`);
  const record = (all: Input[]): InputSet => {
    const real = all.map((x) => runOnce(binary, x.bytes));
    all.forEach((x, k) => {
      const a = real[k]!;
      assert.ok(!a.timedOut, `the real kernel answers ${x.name} within ${String(RUN_MS)} ms`);
      // An input with its expected answer: the real kernel gives it, first.
      if (x.want !== undefined) {
        assert.equal(key(a), key({ status: 0, signal: null, timedOut: false, stdout: Buffer.from(x.want.stdout, "latin1"), stderr: Buffer.alloc(0) }), `the real kernel answers ${x.name} as expected\n${showAnswer(a)}`);
      }
    });
    return { inputs: all, real };
  };
  tree = { kernel, binary, build, sets: { formats: record(formatsInputs()), judge: record(judgeInputs()) } };
  return tree;
}

interface Entry { file: string; line: number; fragment: string; replacement: string; sha256: string; why: string }
const equivalent = (): Entry[] => {
  assert.ok(existsSync(EQUIVALENT), `the list of equivalent mutants must exist: ${EQUIVALENT}`);
  const doc = JSON.parse(readFileSync(EQUIVALENT, "utf8")) as { format: string; equivalent: Entry[] };
  assert.ok(typeof doc.format === "string" && doc.format !== "" && Array.isArray(doc.equivalent), "the list holds its format and its entries");
  return doc.equivalent;
};
const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0 ? 0 : s[Math.floor((s.length - 1) / 2)]!;
};
/** The first line of a build's output that reports an error in `file` (cut to 300 characters), else its first error
 * line; undefined when it holds none. */
function firstError(b: SpawnSyncReturns<string>, file: string): string | undefined {
  const errors = `${String(b.stdout)}\n${String(b.stderr)}`.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.includes("error:"));
  const line = errors.find((l) => l.includes(file) || l.includes(file.replace(/\//g, "\\"))) ?? errors[0];
  return line?.slice(0, 300);
}

/** Builds every mutant of `file` on the tree and runs it on the inputs of `set`, then restores the file and checks the
 * restored binary. */
function killMutants(t: TestContext, file: string, set: SetName): void {
  const k = realTree();
  const s = k.sets[set];
  const path = join(k.kernel, ...file.split("/"));
  const original = readFileSync(path);
  const originalSha = sha256(original);
  const mutants = mutantsOf(file, original.toString("utf8"));
  const measured = MEASURED[file];
  assert.ok(measured !== undefined, `${file} has its measured counts`);
  assert.ok(mutants.length > 0, `${file}: the generator gives mutants`);
  const builds: number[] = [];
  const notBuilt: string[] = [];
  const survivors: Mutant[] = [];
  let killed = 0;
  let runs = 0;
  const start = Date.now();
  try {
    for (const m of mutants) {
      const what = `${file}:${String(m.line)}:${String(m.column)} ${m.operator} ${JSON.stringify(m.fragment)} -> ${JSON.stringify(m.replacement)}`;
      writeFileSync(path, m.text);
      const b0 = Date.now();
      const b = k.build();
      const ms = Date.now() - b0;
      builds.push(ms);
      try {
        if (b.status !== 0) {
          const why = (b.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT" ? `no exit within ${String(BUILD_MS)} ms` : `exit ${String(b.status)}`;
          const lean = firstError(b, file) ?? "no error line in the build's output";
          notBuilt.push(`${what} (${why}; ${lean})`);
          t.diagnostic(`${what}: not built (${why}), ${String(ms)} ms; ${lean}`);
          continue;
        }
        let by: string | undefined;
        for (let i = 0; i < s.inputs.length && by === undefined; i++) {
          runs++;
          const a = runOnce(k.binary, s.inputs[i]!.bytes);
          if (a.timedOut || key(a) !== key(s.real[i]!)) by = s.inputs[i]!.name;
        }
        if (by !== undefined) {
          killed++;
          t.diagnostic(`${what}: killed by ${by}, build ${String(ms)} ms`);
        } else {
          survivors.push(m);
          t.diagnostic(`${what}: SURVIVES every input, build ${String(ms)} ms`);
        }
      } finally {
        writeFileSync(path, original);
        assert.equal(sha256(readFileSync(path)), originalSha, `${what}: the original bytes are restored`);
      }
    }
  } finally {
    writeFileSync(path, original);
    t.diagnostic(
      `${file}: generated ${String(mutants.length)} (measured ${String(measured.generated)} on ${measured.on}), not built ${String(notBuilt.length)}, ` +
        `killed ${String(killed)}, survivors ${String(survivors.length)}; builds min ${String(Math.min(...builds))} median ${String(median(builds))} ` +
        `max ${String(Math.max(...builds))} ms; ${String(runs)} runs on the ${String(s.inputs.length)} inputs of the ${set} set; ${String(Date.now() - start)} ms`,
    );
  }
  // Restored and rebuilt, the binary answers the first input as at the start.
  assert.equal(sha256(readFileSync(path)), originalSha, `${file}: the original bytes are restored`);
  const rb = k.build();
  assert.equal(rb.status, 0, `${file}: the restored kernel builds\n${show(rb)}`);
  assert.equal(key(runOnce(k.binary, s.inputs[0]!.bytes)), key(s.real[0]!), `${file}: the restored binary answers ${s.inputs[0]!.name} as at the start`);

  // Every survivor is an entry of the list, for this source; every entry of this file is a survivor.
  const entries = equivalent().filter((e) => e.file === file);
  const same = (e: Entry, m: Mutant): boolean => e.line === m.line && e.fragment === m.fragment && e.replacement === m.replacement;
  for (const m of survivors) {
    const e = entries.find((x) => same(x, m));
    assert.ok(e !== undefined, `${file}:${String(m.line)}:${String(m.column)} ${m.operator} ${JSON.stringify(m.fragment)} -> ${JSON.stringify(m.replacement)} survives every input and is not in ${EQUIVALENT}`);
    assert.equal(e.sha256, originalSha, `${file}:${String(m.line)}: the entry names the current sha256 of ${file}`);
    assert.ok(e.why.trim() !== "", `${file}:${String(m.line)}: the entry says why`);
  }
  for (const e of entries) assert.ok(survivors.some((m) => same(e, m)), `the entry ${JSON.stringify(e)} matches a survivor of ${file}`);
  assert.ok(killed >= 1, `${file}: at least one mutant built and killed`);
  assert.ok(
    notBuilt.length <= measured.notBuilt,
    `${file}: at most ${String(measured.notBuilt)} mutants not built (measured on ${measured.on}), found ${String(notBuilt.length)}:\n${notBuilt.join("\n")}`,
  );
}

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/kernel/vectors/mutants-equivalent.json:9 CONST "7dca4e3002a5ed5d" -> "7dca4e3002a5ed5e"
test("decoder_mutants_killed_in_bytes", BYTES_OPTIONS, (t: TestContext) => {
  killMutants(t, "Genkan/Bytes.lean", "formats");
});

// killer: apps/genkan/kernel/vectors/mutants-equivalent.json:33 CONST "6b10eaa3c758055b" -> "6b10eaa3c758055c"
test("decoder_mutants_killed_in_format", FORMAT_OPTIONS, (t: TestContext) => {
  killMutants(t, "Genkan/Format.lean", "formats");
});

test("judge_mutants_killed", JUDGE_OPTIONS, (t: TestContext) => {
  killMutants(t, "Genkan/Judge.lean", "judge");
});
