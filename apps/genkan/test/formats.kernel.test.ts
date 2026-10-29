// GENKAN - the formats read by the real kernel under the pinned toolchain (Lean 4.32.1). The file builds one temporary tree
// under os.tmpdir() with a copy of scripts/lake.mjs and of the real kernel (its root .lake left out), builds it once with
// `lake.mjs build`, and runs the binary on requests: `"GNKQ" mode:u8` then one `sec` (`len:u32` big-endian, then len bytes),
// mode 2 to decode an order, mode 3 to hash bytes with SHA-256. A malformed request, or one over 1 048 576 bytes, exits 3
// with nothing on stdout or stderr; mode 2 prints one line ended by a single 0x0a, mode 3 the 32 bytes of the digest. The
// vectors are apps/genkan/kernel/vectors/gnk1.json. It runs in test:genkan only (the file name ends .kernel.test.ts, which
// test and test:main leave out). With ELAN_HOME unset or blank and CI unset or false, every test is skipped; with CI set,
// a missing ELAN_HOME or a home without the pinned lake fails. The temp dir of the wrapper is GENKAN_TMP, a dir of the tree.
import { test, after, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";

const SCRIPTS_DIR = fileURLToPath(new URL("../scripts", import.meta.url));
const KERNEL_DIR = fileURLToPath(new URL("../kernel", import.meta.url));
const VECTORS = join(KERNEL_DIR, "vectors", "gnk1.json");
const TOOLCHAIN = "leanprover--lean4---v4.32.1";
const LAKE_EXE = process.platform === "win32" ? "lake.exe" : "lake";
const BINARY = process.platform === "win32" ? "genkan-kernel.exe" : "genkan-kernel";
const CAP = 1_048_576;

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
const OPTIONS = { skip: SKIP, timeout: 280_000 };

const TMP = mkdtempSync(join(tmpdir(), "genkan-formats-kernel-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

const show = (r: SpawnSyncReturns<string>): string =>
  `status=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\nstdout:\n${String(r.stdout)}\nstderr:\n${String(r.stderr)}`;

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

/** The modules of Genkan/ in a kernel dir, as paths relative to Genkan/ without the .lean extension. */
function genkanModules(kernel: string, rel = ""): string[] {
  const dir = join(kernel, "Genkan", rel);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const r = rel === "" ? d.name : join(rel, d.name);
    if (d.isDirectory()) return genkanModules(kernel, r);
    return d.name.endsWith(".lean") ? [r.slice(0, -".lean".length)] : [];
  });
}

interface Built { kernel: string; binary: string }
/** The kernel of the file: copied into a tree with lake.mjs and built once, by the first test that needs it. */
let built: Built | undefined;
function buildKernel(): Built {
  if (built !== undefined) return built;
  const home = pinnedHome();
  const root = join(TMP, "tree");
  const scripts = join(root, "apps", "genkan", "scripts");
  const kernel = join(root, "apps", "genkan", "kernel");
  const tmp = join(root, "tmp");
  for (const d of [scripts, kernel, tmp]) mkdirSync(d, { recursive: true });
  copyFileSync(join(SCRIPTS_DIR, "lake.mjs"), join(scripts, "lake.mjs"));
  copyKernel(KERNEL_DIR, kernel);
  const env: NodeJS.ProcessEnv = { ...process.env, ELAN_HOME: home, GENKAN_TMP: tmp };
  const b = spawnSync(process.execPath, [join(scripts, "lake.mjs"), "build"], { env, encoding: "utf8", stdio: "pipe", timeout: 240_000 });
  assert.equal(b.status, 0, `the kernel builds with the pinned lake\n${show(b)}`);
  const binary = join(kernel, ".lake", "build", "bin", BINARY);
  assert.ok(existsSync(binary), `the build writes the binary ${binary}\n${show(b)}`);
  built = { kernel, binary };
  return built;
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

/** One run of the kernel on `input`, and a counter of the runs of a test. */
interface Runner { run(input: Buffer): SpawnSyncReturns<Buffer>; runs: number }
function runner(binary: string): Runner {
  const r: Runner = {
    runs: 0,
    run(input) {
      r.runs++;
      return spawnSync(binary, [], { input, stdio: "pipe", timeout: 30_000 });
    },
  };
  return r;
}
const showRun = (what: string, r: SpawnSyncReturns<Buffer>): string =>
  `${what}\nstatus=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\n` +
  `stdout (latin1): ${JSON.stringify(r.stdout.toString("latin1"))}\nstderr: ${JSON.stringify(r.stderr.toString("latin1"))}`;

/** Exit 0, stdout exactly `want` (bytes), nothing on stderr. */
function assertAnswers(r: SpawnSyncReturns<Buffer>, want: Buffer, what: string): void {
  const s = showRun(what, r);
  assert.equal(r.status, 0, `${what}: exit 0\n${s}`);
  assert.equal(r.stdout.toString("hex"), want.toString("hex"), `${what}: stdout is exactly ${JSON.stringify(want.toString("latin1"))}\n${s}`);
  assert.equal(r.stderr.length, 0, `${what}: nothing on stderr\n${s}`);
}
/** Exit 3, nothing on stdout or stderr. */
function assertRefused(r: SpawnSyncReturns<Buffer>, what: string): void {
  const s = showRun(what, r);
  assert.equal(r.status, 3, `${what}: refused with exit 3\n${s}`);
  assert.equal(r.stdout.length, 0, `${what}: nothing on stdout\n${s}`);
  assert.equal(r.stderr.length, 0, `${what}: nothing on stderr\n${s}`);
}
const line = (s: string): Buffer => Buffer.from(`${s}\n`, "latin1");

/** The first n bytes of the stream sha256(utf8(seed) || u32be(k)), k = 0, 1, 2, ... */
function stream(seed: string, n: number): Buffer {
  const blocks: Buffer[] = [];
  for (let k = 0, have = 0; have < n; k++, have += 32) blocks.push(createHash("sha256").update(Buffer.concat([Buffer.from(seed, "utf8"), u32(k)])).digest());
  return Buffer.concat(blocks).subarray(0, n);
}

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/kernel/Genkan/Format.lean:41 CONST "kind == 4" -> "kind == 5"
test("gnk1_vectors_decode_by_kernel", OPTIONS, (t: TestContext) => {
  // The kernel holds the three modules of the formats, and its library target builds every module of Genkan/, not only
  // those Main imports.
  for (const m of ["Bytes", "Sha256", "Format"]) {
    assert.ok(existsSync(join(KERNEL_DIR, "Genkan", `${m}.lean`)), `the kernel holds Genkan/${m}.lean`);
  }
  const k = buildKernel();
  const modules = genkanModules(k.kernel);
  assert.ok(modules.length >= 3, `the copy holds the modules of Genkan/ (found ${modules.join(", ")})`);
  for (const m of modules) {
    const olean = join(k.kernel, ".lake", "build", "lib", "lean", "Genkan", `${m}.olean`);
    assert.ok(existsSync(olean), `the build writes the .olean of Genkan/${m}.lean: ${olean}`);
  }
  const v = vectors();
  const kr = runner(k.binary);
  const start = Date.now();
  try {
    // Each valid order: its line. Each invalid order, each proper prefix of a valid order and each valid order followed by
    // one byte 0x00: the line `invalid`.
    for (const x of v.orders.valid) assertAnswers(kr.run(request(2, Buffer.from(x.hex, "hex"))), line(x.line), `valid order ${x.name}`);
    for (const x of v.orders.invalid) assertAnswers(kr.run(request(2, Buffer.from(x.hex, "hex"))), line("invalid"), `invalid order ${x.name}`);
    for (const x of v.orders.valid) {
      const o = Buffer.from(x.hex, "hex");
      for (let n = 0; n < o.length; n++) assertAnswers(kr.run(request(2, o.subarray(0, n))), line("invalid"), `${x.name} cut to ${String(n)} bytes`);
      assertAnswers(kr.run(request(2, Buffer.concat([o, ZERO]))), line("invalid"), `${x.name} followed by one byte 0x00`);
    }
    // Each stored request: refused.
    for (const x of v.requests) assertRefused(kr.run(Buffer.from(x.hex, "hex")), `request ${x.name}`);
    // Built here: every proper prefix of the mode 2 request of the first valid vector and of the first SWAP vector, and
    // each of those requests followed by one byte.
    const first = v.orders.valid[0];
    const swap = v.orders.valid.find((x) => x.fields.kind === "SWAP");
    assert.ok(first !== undefined && swap !== undefined, "the vectors hold a valid order and a valid SWAP");
    for (const x of [first, swap]) {
      const q = request(2, Buffer.from(x.hex, "hex"));
      for (let n = 0; n < q.length; n++) assertRefused(kr.run(q.subarray(0, n)), `the mode 2 request of ${x.name} cut to ${String(n)} bytes`);
      assertRefused(kr.run(Buffer.concat([q, ZERO])), `the mode 2 request of ${x.name} followed by one byte`);
    }
    // Mode 1, a ctx sec then the first valid order's sec: refused. This holds until the judge of L3 serves mode 1.
    assertRefused(kr.run(request(1, Buffer.from("ctx", "latin1"), Buffer.from(first.hex, "hex"))), "a mode 1 request, before the judge of L3");
    // The cap: a well-formed mode 2 request of exactly 1 048 576 bytes is read (its order of 1 048 567 bytes 0x00 is
    // invalid); a mode 3 request of 1 048 577 bytes is refused.
    const atCap = request(2, Buffer.alloc(CAP - 9));
    assert.equal(atCap.length, CAP, "the mode 2 request at the cap is 1 048 576 bytes");
    assertAnswers(kr.run(atCap), line("invalid"), "a mode 2 request of exactly 1 048 576 bytes");
    const overCap = request(3, Buffer.alloc(CAP - 8));
    assert.equal(overCap.length, CAP + 1, "the mode 3 request over the cap is 1 048 577 bytes");
    assertRefused(kr.run(overCap), "a mode 3 request of 1 048 577 bytes");
  } finally {
    t.diagnostic(`kernel runs: ${String(kr.runs)} in ${String(Date.now() - start)} ms`);
  }
});

// killer: apps/genkan/kernel/Genkan/Sha256.lean:132 CONST "8 * len" -> "len"
test("sha256_kernel_equals_node_crypto", OPTIONS, (t: TestContext) => {
  // Each length and each pattern of the vectors' sha256 section, in a mode 3 request: the digest node:crypto gives. The
  // lengths cross every padding boundary (55, 56, 63, 64, 119, 120, 127, 128).
  const v = vectors();
  const { seed, lengths, patterns } = v.sha256;
  for (const b of [55, 56, 63, 64, 119, 120, 127, 128]) assert.ok(lengths.includes(b), `the lengths hold the padding boundary ${String(b)}`);
  assert.equal(lengths.length, 133, "non-vacuity: the lengths 0 to 130, 1000 and 4096");
  assert.equal(patterns.length, 4, "non-vacuity: 64 and 65 bytes, all 0x00 and all 0xff");
  const k = buildKernel();
  const kr = runner(k.binary);
  const start = Date.now();
  let capMs = -1;
  try {
    const hashes = (bytes: Buffer, what: string): void => {
      const want = createHash("sha256").update(bytes).digest();
      assertAnswers(kr.run(request(3, bytes)), want, what);
    };
    for (const n of lengths) hashes(stream(seed, n), `the first ${String(n)} bytes of the stream`);
    for (const p of patterns) hashes(Buffer.alloc(p.length, p.byte), `${String(p.length)} bytes 0x${p.byte.toString(16).padStart(2, "0")}`);
    // The cap itself: a mode 3 request of exactly 1 048 576 bytes, its sec the first 1 048 567 bytes of the same stream.
    const bytes = stream(seed, CAP - 9);
    const atCap = request(3, bytes);
    assert.equal(atCap.length, CAP, "the mode 3 request at the cap is 1 048 576 bytes");
    const capStart = Date.now();
    const r = kr.run(atCap);
    capMs = Date.now() - capStart;
    assertAnswers(r, createHash("sha256").update(bytes).digest(), "a mode 3 request of exactly 1 048 576 bytes");
  } finally {
    t.diagnostic(`kernel runs: ${String(kr.runs)} in ${String(Date.now() - start)} ms; the request at the cap: ${capMs < 0 ? "not run" : `${String(capMs)} ms`}`);
  }
});
