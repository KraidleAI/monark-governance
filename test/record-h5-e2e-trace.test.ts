/**
 * Root tests of scripts/record-h5-e2e-trace.mjs, the recorder of the end-to-end trace fixtures/h5-e2e-trace.json, which also sets
 * the entry of that trace in the site manifest apps/site/data/manifest.sha256.json. Non-LLM oracles, run by `npm test`. Each test
 * first checks, on the recorder's text, its script guard and its closed refusal line, then imports a fresh instance of the module
 * (one query per import), so that importing it runs nothing. The staged roots live under os.tmpdir() and are removed in `finally`;
 * no test writes under the repository root. The staged manifest is canonical (two-space JSON), the trace entry between two decoys
 * of 64 hex. Every expected value is written by hand or by a closed formula (createHash of the LF text, a string replacement checked
 * to occur once), never by a function of the recorder. `build` is a fake, `log` and `accept` are recorders, except where a test
 * names the default. A refusal is the closed code alone: the bytes of both files as they were, nothing logged, no exception text.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { inspect } from "node:util";

const ROOT = join(import.meta.dirname, "..");
const RECORDER_URL = new URL("../scripts/record-h5-e2e-trace.mjs", import.meta.url);
const TRACE = "fixtures/h5-e2e-trace.json";
const MANIFEST = "apps/site/data/manifest.sha256.json";
const MAIN_LINE = "const MAIN = process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;";
const REFUSE_LINE = "writeSync(2, refusalLine(e));";
const ROOT_LINE = 'await recordH5Trace(join(dirname(fileURLToPath(import.meta.url)), ".."));';
const EXIT_LINE = "process.exit(1);";
const CODES = ["manifest_unreadable", "trace_unreadable", "build_failed", "manifest_entry_unlisted", "manifest_not_canonical", "write_failed", "postcondition_failed"];
const sha = (s: string): string => createHash("sha256").update(s.replace(/\r\n/g, "\n"), "utf8").digest("hex");
const DECOY_A = sha("record-h5 decoy one"), DECOY_B = sha("record-h5 decoy two");
/** The trace before a run, written by hand, and its entry. */
const OLD_TRACE = '{\n  "schema": "an-older-trace"\n}\n';
const OLD_SHA = sha(OLD_TRACE);
/** What the fake build returns, and the text the recorder must write for it, by hand (65 bytes). */
const STAGED = { schema: "staged-h5-trace", steps: [1, 2] };
const NEW_TRACE = '{\n  "schema": "staged-h5-trace",\n  "steps": [\n    1,\n    2\n  ]\n}\n';
const NEW_SHA = sha(NEW_TRACE);
/** A message that quotes the manifest and a decoy digest: a fake throws it, and no rejection may carry it. */
const LEAK = `${MANIFEST} lists ${DECOY_A}`;
/** The staged canonical manifest: the trace entry between two decoys. */
const manifestOf = (traceSha: string, algorithm = "sha256"): string =>
  JSON.stringify({ algorithm, files: { "apps/site/data/aa-decoy.json": DECOY_A, [TRACE]: traceSha, "fixtures/zz-decoy.json": DECOY_B } }, null, 2) + "\n";
const OLD_MANIFEST = manifestOf(OLD_SHA);
/** `text` with `from` replaced by `to`, `from` checked to occur exactly once. */
function swap(text: string, from: string, to: string): string {
  assert.equal(text.split(from).length, 2, "the replaced text occurs once (control of the expected value)");
  return text.replace(from, () => to);
}
const PINNED_MANIFEST = swap(OLD_MANIFEST, OLD_SHA, NEW_SHA);
const okLines = (verb: "set" | "unchanged"): string[][] => [[`wrote ${TRACE}`], ["bytes: 65"], [`sha256(LF): ${NEW_SHA}`], [`manifest entry of ${TRACE} ${verb}`]];

interface Opts { build?: () => Promise<unknown>; log?: (...a: unknown[]) => void; accept?: (root: string) => unknown }
interface Recorder {
  TRACE_REL: string; MANIFEST_REL: string; REFUSALS: readonly string[];
  pinnedManifest: (manifestText: string, traceText: string) => { text: string; sha: string; changed: boolean };
  recordH5Trace: (root: string, opts?: Opts) => Promise<string>;
  refusalLine: (e: unknown) => string;
}
let imports = 0;
/** The guard checked on the recorder's text, before any import; then a fresh instance of the module. */
async function recorder(): Promise<Recorder> {
  const text = readFileSync(RECORDER_URL, "utf8");
  assert.ok(text.includes(MAIN_LINE), "the recorder runs only as a script: it carries the guard line of scripts/pin-bell-legal.mjs");
  assert.ok(text.includes(REFUSE_LINE), "the recorder writes its closed refusal line on stderr");
  imports += 1;
  const mod = (await import(RECORDER_URL.href + "?import=" + String(imports))) as Recorder;
  return mod;
}

/** A staged root: the manifest and the trace, each written unless null; both directories exist. */
function stage(manifest: string | null, trace: string | null = OLD_TRACE): string {
  const tmp = mkdtempSync(join(tmpdir(), "record-h5-"));
  mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
  mkdirSync(join(tmp, "fixtures"));
  if (manifest !== null) writeFileSync(join(tmp, MANIFEST), manifest);
  if (trace !== null) writeFileSync(join(tmp, TRACE), trace);
  return tmp;
}
const unstage = (tmp: string): void => { rmSync(tmp, { recursive: true, force: true, maxRetries: 5 }); };
const read = (tmp: string, rel: string): string | null => (existsSync(join(tmp, rel)) ? readFileSync(join(tmp, rel), "utf8") : null);
const files = (tmp: string): Array<string | null> => [read(tmp, MANIFEST), read(tmp, TRACE)];

/** The closed refusal: exactly new Error(code), no other property nor cause, and nothing of an exception or of the manifest in it. */
function closedAs(code: string): (e: unknown) => boolean {
  return (e: unknown): boolean => {
    assert.ok(e instanceof Error && Object.getPrototypeOf(e) === Error.prototype, `${code}: a plain Error`);
    assert.equal(e.message, code, "the message is the code");
    assert.deepEqual(Object.getOwnPropertyNames(e).sort(), ["message", "stack"], `${code}: no other property, no cause`);
    const shown = inspect(e, { depth: 8 });
    for (const s of [LEAK, DECOY_A, DECOY_B, OLD_SHA, "manifest.sha256.json", "in JSON", "EPERM", "EACCES", "ENOENT"]) {
      assert.ok(!shown.includes(s), `${code}: the rejection carries no ${s}`);
    }
    return true;
  };
}
/** The fakes of a run: build gives STAGED, log records into `logged`, accept passes. */
const fakes = (logged: unknown[][]): Required<Opts> => ({ build: (): Promise<unknown> => Promise.resolve(STAGED), log: (...a: unknown[]): void => { logged.push(a); }, accept: (): void => undefined });
/** recordH5Trace on `tmp` rejects with the closed `code`; the bytes of both files are the ones before (none created); nothing logged. */
async function refuses(r: Recorder, tmp: string, code: string, change: (o: Required<Opts>) => Opts = (o: Required<Opts>): Opts => o): Promise<void> {
  const before = files(tmp), logged: unknown[][] = [];
  await assert.rejects(r.recordH5Trace(tmp, change(fakes(logged))), closedAs(code), code);
  assert.deepEqual(files(tmp), before, `${code}: the manifest and the trace keep their bytes, no file created`);
  assert.deepEqual(logged, [], `${code}: nothing logged`);
}
/** `refuses` with each file of `tmp` that exists made read-only (0o444), each first shown to refuse a write of its own bytes
 *  (positive control), all made writable again in `finally`: a refusal before the write never writes, not even to undo. */
async function refusesReadOnly(r: Recorder, tmp: string, code: string, change?: (o: Required<Opts>) => Opts): Promise<void> {
  const present = [MANIFEST, TRACE].map((rel) => join(tmp, rel)).filter((p) => existsSync(p));
  assert.ok(present.length > 0, `${code}: a file of the staged root exists (control)`);
  try {
    for (const p of present) chmodSync(p, 0o444);
    for (const p of present) {
      const bytes = readFileSync(p);
      assert.throws(() => { writeFileSync(p, bytes); }, `${code}: a read-only file refuses a write (positive control)`);
    }
    await refuses(r, tmp, code, change);
  } finally {
    for (const p of present) chmodSync(p, 0o644);
  }
}

// killer: scripts/record-h5-e2e-trace.mjs:27 CONST "= H5_TRACE_REL;" -> "= H5_TRACE_REL; console.log(H5_TRACE_REL);"
// killer: scripts/record-h5-e2e-trace.mjs:100 CONST "\"..\"" -> "\".\""
// killer: scripts/record-h5-e2e-trace.mjs:103 CONST "process.exit(1)" -> "process.exit(0)"
test("record_h5_runs_only_as_a_script", async () => {
  const calls: unknown[][] = [], [log, error] = [console.log, console.error];
  let r: Recorder | undefined;
  console.log = (...a: unknown[]): void => { calls.push(a); };
  console.error = (...a: unknown[]): void => { calls.push(a); };
  try {
    r = await recorder();
  } finally {
    console.log = log;
    console.error = error;
  }
  assert.deepEqual(calls, [], "importing the recorder prints nothing, on stdout or stderr");
  assert.ok(r !== undefined, "the module is imported");
  assert.deepEqual([r.TRACE_REL, r.MANIFEST_REL], [TRACE, MANIFEST], "the two paths it writes");
  assert.deepEqual(r.REFUSALS, CODES, "the seven refusal codes, in order");
  assert.ok(Object.isFrozen(r.REFUSALS), "the refusal codes are frozen");
  for (const f of [r.pinnedManifest, r.recordH5Trace, r.refusalLine]) assert.equal(typeof f, "function");
  const text = readFileSync(RECORDER_URL, "utf8");
  assert.ok(text.includes(ROOT_LINE), "run as a script, the recorder records under the repository root, the parent of scripts/");
  assert.ok(text.includes(EXIT_LINE), "run as a script, a refusal exits 1");
});

// killer: scripts/record-h5-e2e-trace.mjs:87 CONST "\"set\" : \"unchanged\"" -> "\"set\" : \"set\""
test("record_h5_pins_its_manifest_entry", async () => {
  const r = await recorder();
  const set = { text: PINNED_MANIFEST, sha: NEW_SHA, changed: true };
  assert.deepEqual(r.pinnedManifest(OLD_MANIFEST, NEW_TRACE), set, "the entry set to the sha256 of the LF text, every other byte kept");
  assert.deepEqual(r.pinnedManifest(OLD_MANIFEST, NEW_TRACE.replace(/\n/g, "\r\n")), set, "the same trace with CRLF ends: the same entry");
  assert.deepEqual(r.pinnedManifest(PINNED_MANIFEST, NEW_TRACE), { ...set, changed: false }, "already pinned: the same bytes back");
  const tmp = stage(OLD_MANIFEST);
  try {
    const logged: unknown[][] = [], seen: Array<[string, Array<string | null>]> = [];
    const opts: Required<Opts> = { ...fakes(logged), accept: (root: string): void => { seen.push([root, files(root)]); } };
    assert.equal(await r.recordH5Trace(tmp, opts), NEW_SHA, "the run returns the new entry");
    assert.deepEqual(files(tmp), [PINNED_MANIFEST, NEW_TRACE], "the trace written, its manifest entry pinned");
    assert.deepEqual(logged, okLines("set"), "four lines, the last one: set");
    assert.deepEqual(seen, [[tmp, [PINNED_MANIFEST, NEW_TRACE]]], "accept called once, with the root, both files already on disk");
    for (const s of [OLD_SHA, DECOY_A, DECOY_B]) assert.ok(!JSON.stringify(logged).includes(s), "no line carries the former entry nor a decoy");
    logged.length = 0;
    assert.equal(await r.recordH5Trace(tmp, opts), NEW_SHA, "a second pass returns the same entry");
    assert.deepEqual(files(tmp), [PINNED_MANIFEST, NEW_TRACE], "a second pass leaves the manifest as it is");
    assert.deepEqual(logged, okLines("unchanged"), "four lines, the last one: unchanged");
    const manifestPath = join(tmp, MANIFEST), pinnedBytes = readFileSync(manifestPath);
    chmodSync(manifestPath, 0o444);
    try {
      assert.throws(() => { writeFileSync(manifestPath, pinnedBytes); }, "the read-only manifest refuses a write (positive control)");
      logged.length = 0;
      await assert.doesNotReject(r.recordH5Trace(tmp, opts), "a pass on the read-only manifest, already pinned, succeeds: it is not written");
      assert.deepEqual(logged, okLines("unchanged"), "the read-only pass: four lines, the last one: unchanged");
      assert.deepEqual(readFileSync(manifestPath), pinnedBytes, "the read-only manifest keeps its bytes");
    } finally {
      chmodSync(manifestPath, 0o644);
    }
    const printed: unknown[][] = [], log = console.log;
    console.log = (...a: unknown[]): void => { printed.push(a); };
    try {
      await r.recordH5Trace(tmp, { build: opts.build, accept: opts.accept });
    } finally {
      console.log = log;
    }
    assert.deepEqual(printed, okLines("unchanged"), "log left to its default: the four lines go to console.log");
  } finally {
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:50 COR " || !Object.hasOwn(files, TRACE_REL)" -> ""
test("record_h5_refuses_an_unlisted_entry", async () => {
  const r = await recorder();
  const unlisted = JSON.stringify({ algorithm: "sha256", files: { "apps/site/data/aa-decoy.json": DECOY_A, "fixtures/zz-decoy.json": DECOY_B } }, null, 2) + "\n";
  for (const m of [unlisted, JSON.stringify({ algorithm: "sha256" }, null, 2) + "\n", JSON.stringify({ algorithm: "sha256", files: null }, null, 2) + "\n"]) {
    assert.throws(() => r.pinnedManifest(m, NEW_TRACE), closedAs("manifest_entry_unlisted"), "an absent entry is never added");
  }
  assert.throws(() => r.pinnedManifest("null\n", NEW_TRACE), closedAs("manifest_entry_unlisted"), "a manifest that is JSON null lists no entry");
  const tmp = stage(unlisted);
  try {
    await refuses(r, tmp, "manifest_entry_unlisted");
    await refusesReadOnly(r, tmp, "manifest_entry_unlisted");
  } finally {
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:62 CONST "throw closed(\"manifest_unreadable\")" -> "throw closed(\"manifest_not_canonical\")"
test("record_h5_refuses_an_unreadable_manifest", async () => {
  const r = await recorder();
  const trailing = swap(OLD_MANIFEST, `"${DECOY_B}"\n`, `"${DECOY_B}",\n`);
  assert.equal(trailing.split(`"${TRACE}": "${OLD_SHA}"`).length, 2, "the broken text still lists the entry once with 64 hex (control)");
  assert.throws(() => r.pinnedManifest(trailing, NEW_TRACE), closedAs("manifest_unreadable"), "a text that is not JSON");
  for (const m of [null, trailing]) {
    const tmp = stage(m);
    try {
      await refuses(r, tmp, "manifest_unreadable");
      await refusesReadOnly(r, tmp, "manifest_unreadable");
    } finally {
      unstage(tmp);
    }
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:53 CONST "catch { throw closed(\"manifest_not_canonical\"); }" -> "catch (e) { throw e; }"
test("record_h5_refuses_a_non_canonical_manifest", async () => {
  const r = await recorder();
  for (const m of [JSON.stringify(JSON.parse(OLD_MANIFEST)) + "\n", manifestOf(OLD_SHA, "md5")]) {
    assert.throws(() => r.pinnedManifest(m, NEW_TRACE), closedAs("manifest_not_canonical"), "one line of JSON, or another algorithm");
    const tmp = stage(m);
    try {
      await refuses(r, tmp, "manifest_not_canonical");
      await refusesReadOnly(r, tmp, "manifest_not_canonical");
    } finally {
      unstage(tmp);
    }
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:63 CONST "catch { throw closed(\"trace_unreadable\"); }" -> "catch { traceBefore = \"\"; }"
test("record_h5_refuses_without_a_trace", async () => {
  const r = await recorder();
  const tmp = stage(OLD_MANIFEST, null);
  try {
    await refuses(r, tmp, "trace_unreadable");
    await refusesReadOnly(r, tmp, "trace_unreadable");
    assert.equal(existsSync(join(tmp, TRACE)), false, "no trace file exists after the refusal");
  } finally {
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:64 CONST "catch { throw closed(\"build_failed\"); }" -> "catch (e) { throw e; }"
test("record_h5_refuses_a_failed_build", async () => {
  const r = await recorder();
  const tmp = stage(OLD_MANIFEST);
  try {
    await refuses(r, tmp, "build_failed", (o: Required<Opts>): Opts => ({ ...o, build: (): Promise<unknown> => Promise.reject(new Error(LEAK)) }));
    await refusesReadOnly(r, tmp, "build_failed", (o: Required<Opts>): Opts => ({ ...o, build: (): Promise<unknown> => Promise.reject(new Error(LEAK)) }));
  } finally {
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:75 SDL "restore();" -> ""
test("record_h5_restores_on_a_failed_write", async () => {
  const r = await recorder();
  const tmp = stage(OLD_MANIFEST), manifestPath = join(tmp, MANIFEST);
  try {
    chmodSync(manifestPath, 0o444);
    assert.throws(() => { writeFileSync(manifestPath, OLD_MANIFEST); }, "the read-only manifest refuses a write (positive control)");
    // The trace is written first, then the manifest write fails: the trace before is written back.
    await refuses(r, tmp, "write_failed");
    chmodSync(manifestPath, 0o644);
    const tracePath = join(tmp, TRACE);
    chmodSync(tracePath, 0o444);
    try {
      assert.throws(() => { writeFileSync(tracePath, OLD_TRACE); }, "the read-only trace refuses a write (positive control)");
      // The trace write fails, then its write back fails too: that failure is ignored, the refusal is the closed code.
      await refuses(r, tmp, "write_failed");
    } finally {
      chmodSync(tracePath, 0o644);
    }
  } finally {
    chmodSync(manifestPath, 0o644);
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:81 SDL "restore();" -> ""
test("record_h5_restores_on_a_failed_postcondition", async () => {
  const r = await recorder();
  const tmp = stage(OLD_MANIFEST), seen: Array<Array<string | null>> = [];
  try {
    await refuses(r, tmp, "postcondition_failed", (o: Required<Opts>): Opts => ({ ...o, accept: (root: string): void => { seen.push(files(root)); throw new Error(LEAK); } }));
    assert.deepEqual(seen, [[PINNED_MANIFEST, NEW_TRACE]], "accept read the new trace and the pinned manifest, then threw");
    let settled = false;
    const flags: boolean[] = [];
    await r.recordH5Trace(tmp, { build: (): Promise<unknown> => Promise.resolve(STAGED), log: (): void => { flags.push(settled); }, accept: async (): Promise<void> => { await new Promise<void>((res) => { setTimeout(res, 20); }); settled = true; } });
    assert.deepEqual(flags, [true, true, true, true], "an asynchronous accept is awaited: the four lines are logged once it has settled");
  } finally {
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:59 CONST "accept = loadH5Trace" -> "accept = () => undefined"
test("record_h5_postcondition_is_the_site_loader", async () => {
  const r = await recorder();
  const { loadH5Trace } = await import("../apps/site/lib/harness-served-load.ts");
  const tmp = stage(OLD_MANIFEST);
  try {
    assert.throws(() => loadH5Trace(tmp), "the site loader refuses a root without the served snapshots (positive control)");
    await refuses(r, tmp, "postcondition_failed", (o: Required<Opts>): Opts => ({ build: o.build, log: o.log }));
  } finally {
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:59 CONST "build = buildTrace" -> "build = async () => ({})"
test("record_h5_default_build_reproduces_the_committed_trace", async () => {
  const r = await recorder();
  const committed = readFileSync(join(ROOT, TRACE), "utf8"), entry = sha(committed);
  const tmp = stage(OLD_MANIFEST), logged: unknown[][] = [], seen: string[] = [];
  try {
    const sha256 = await r.recordH5Trace(tmp, { log: (...a: unknown[]): void => { logged.push(a); }, accept: (root: string): void => { seen.push(root); } });
    assert.equal(read(tmp, TRACE), committed, "the default build writes the bytes of the committed trace");
    assert.equal(read(tmp, MANIFEST), swap(OLD_MANIFEST, OLD_SHA, entry), "the entry is the sha256 of the committed text");
    assert.equal(sha256, entry, "the run returns that sha256");
    assert.deepEqual(seen, [tmp], "accept called once, with the root");
    assert.equal(logged.length, 4, "four lines logged");
    assert.notEqual(Buffer.byteLength(committed, "utf8"), committed.length, "the committed trace carries non-ASCII text: its UTF-8 bytes are not its UTF-16 units (control)");
    assert.deepEqual(logged[1], [`bytes: ${String(Buffer.byteLength(committed, "utf8"))}`], "the bytes line counts the UTF-8 bytes of the trace written");
  } finally {
    unstage(tmp);
  }
});

// killer: scripts/record-h5-e2e-trace.mjs:93 COR "e instanceof Error && REFUSALS.includes(e.message)" -> "e instanceof Error"
test("record_h5_refusal_line_is_closed", async () => {
  const r = await recorder();
  for (const c of CODES) assert.equal(r.refusalLine(new Error(c)), `record-h5-e2e-trace REFUSED: ${c}\n`, c);
  assert.equal(r.refusalLine({ message: "build_failed" }), "record-h5-e2e-trace REFUSED: unexpected\n", "an object that is not an Error, its message a closed code: unexpected");
  const others: unknown[] = [new Error(`${LEAK}: ${OLD_SHA}`), new TypeError("Cannot read properties of undefined (reading 'files')"), "manifest_unreadable", undefined];
  for (const e of others) assert.equal(r.refusalLine(e), "record-h5-e2e-trace REFUSED: unexpected\n", `${inspect(e).slice(0, 40)}: unexpected and nothing else`);
});
