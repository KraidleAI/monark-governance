// GARDE-FSYNC-1 (checkpoint-1 C-4/C-7) - the durable write SEQUENCE of the cycle ledger. harness.journal() wraps the
// DURABLE_FS seam (ledger.ts) and records every operation IN ORDER. A power cut drops the OS write cache: a line is
// durable once fsync returned, so the ORDER is the property - line open(a)/write/fsync/close, THEN the head through
// <op>.head.tmp open(w)/write/fsync/close, THEN rename. Each G1 mutant (mutants.mjs) reds a NAMED test of this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { closeSync, existsSync, openSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, posix } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { openGuardedClient, verifyCycleLedger } from "@monark/rpc-guard";
import { ensureCycleDir, openOperatorLedger, type CycleLedgerEntry } from "../src/ledger.ts";
import { FAKE_HELIUS_ENV, HELIUS, ONE_METHOD_LIMITS, childEnv, journal, okFetch, tmp } from "./harness.ts";

const APPEND = ["open:a:helius.jsonl", "write:helius.jsonl", "fsync:helius.jsonl", "close:helius.jsonl",
  "open:w:helius.head.tmp", "write:helius.head.tmp", "fsync:helius.head.tmp", "close:helius.head.tmp", "rename:helius.head.tmp>helius.head"];
const RENAME = "rename:helius.head.tmp>helius.head";
const eperm = (code: string): Error => Object.assign(new Error(`${code}: rename`), { code });
/** A recording, NON-waiting sleep with a guard: an unbounded retry reds instead of spinning forever. */
const virtualSleep = (slept: number[]) => (ms: number): void => { slept.push(ms); if (slept.length > 1000) throw new Error("unbounded retry"); };
const CAP_ERROR = /refused 35 times over 2950 ms \((EPERM|EACCES|EBUSY): another handle holds 'helius\.head'; fail-closed, no in-place fallback\)/;

test("durable_append_writes_the_line_then_the_head_in_order", async () => {
  // Through the REAL openGuardedClient (only globalThis.fetch stubbed): 3 metered calls, then the raw files re-read.
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  const j = journal();
  try {
    const client = openGuardedClient(FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, dir, { helius: "c-seq" });
    assert.deepEqual(j.ops.splice(0), ["open:wx:helius.lock", "write:helius.lock", "fsync:helius.lock", "close:helius.lock"], "the lock {pid, iso} is fsynced before close, before any ledger write");
    for (let i = 0; i < 3; i++) await client.call(HELIUS, "getTransaction", [i]);
    assert.deepEqual(j.ops, [...APPEND, ...APPEND, ...APPEND], "per call: the line open(a)-write-fsync-close, THEN head.tmp open(w)-write-fsync-close, THEN rename");
    // The OUTPUT is unchanged (format frozen): 3 chained legacy lines, head == last entry, no tmp left behind.
    const cd = join(dir, "c-seq");
    const lines = readFileSync(join(cd, "helius.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry);
    assert.equal(lines.length, 3);
    verifyCycleLedger(lines);
    assert.deepEqual(Object.keys(lines[0]!), ["prev_entry_sha256", "cycle_id", "tariff_version", "by_op_method", "outcome", "credits_derived", "entry_sha256"]);
    assert.equal(readFileSync(join(cd, "helius.head"), "utf8"), lines[2]!.entry_sha256);
    assert.equal(existsSync(join(cd, "helius.head.tmp")), false);
  } finally { j.restore(); globalThis.fetch = realFetch; cleanup(); }
});

test("durable_heal_of_a_head_one_behind_is_tmp_fsync_rename", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "c-heal");
    const led = openOperatorLedger(cd, "helius", 0);
    led.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    const behind = readFileSync(led.headPath, "utf8");
    const e2 = led.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    writeFileSync(led.headPath, behind); // the cut hit after E2's line fsync, before its head rename
    const j = journal();
    try { openOperatorLedger(cd, "helius", 0); } finally { j.restore(); }
    assert.deepEqual(j.ops, APPEND.slice(4), "C-4: the heal is durable (tmp + fsync + rename), never an in-place write");
    assert.equal(readFileSync(led.headPath, "utf8"), e2.entry_sha256);
  } finally { cleanup(); }
});

test("durable_orphan_head_tmp_is_removed_once_the_pair_verifies", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "c-orphan");
    const led = openOperatorLedger(cd, "helius", 0);
    const e1 = led.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    const orphan = `${led.headPath}.tmp`;
    writeFileSync(orphan, "f".repeat(64)); // the cut hit between the tmp fsync and its rename: an ORPHAN
    const j = journal();
    try { openOperatorLedger(cd, "helius", 0); } finally { j.restore(); }
    assert.deepEqual(j.ops, ["unlink:helius.head.tmp"], "C-4: the orphan is removed, nothing else is written");
    assert.equal(existsSync(orphan), false);
    assert.equal(readFileSync(led.headPath, "utf8"), e1.entry_sha256, "the authoritative head is untouched");
    // C-5: head ABSENT stays refused, and a refused open has no side effect (the orphan stays for the forensics).
    writeFileSync(orphan, "f".repeat(64));
    rmSync(led.headPath);
    assert.throws(() => openOperatorLedger(cd, "helius", 0), /head sidecar absent/);
    assert.equal(existsSync(orphan), true);
  } finally { cleanup(); }
});

test("durable_head_rename_retries_a_sharing_violation_with_a_bounded_backoff", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "c-eperm");
    const led = openOperatorLedger(cd, "helius", 0);
    // (1) two sharing violations, then the reader lets go: waits 10 then 20 ms; fsync(tmp) BEFORE the first attempt.
    let fails = 2;
    const slept: number[] = [];
    const j = journal({ sleepSync: virtualSleep(slept), renameSync: (a, b) => { if (fails-- > 0) throw eperm("EPERM"); renameSync(a, b); } });
    let e1: CycleLedgerEntry;
    try { e1 = led.appendChained("attempted", { "helius|getTransaction": 1 }, 1); } finally { j.restore(); }
    assert.deepEqual(j.ops.slice(6), ["fsync:helius.head.tmp", "close:helius.head.tmp", RENAME, "sleep:10", RENAME, "sleep:20", RENAME]);
    assert.equal(readFileSync(led.headPath, "utf8"), e1.entry_sha256);
    // (2) a PERSISTENT violation: waits min(10k, 100) ms while the total stays <= 3000, then a NAMED fail-closed error;
    //     the line is durable, the head one entry behind - the next open heals it (no loss, no manual step).
    slept.length = 0;
    const j2 = journal({ sleepSync: virtualSleep(slept), renameSync: () => { throw eperm("EPERM"); } });
    try { assert.throws(() => led.appendChained("attempted", { "helius|getTransaction": 1 }, 1), CAP_ERROR); } finally { j2.restore(); }
    assert.deepEqual(slept, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, ...Array<number>(24).fill(100)], "the declared schedule, 2950 ms in total");
    assert.equal(j2.ops.filter((o) => o === RENAME).length, 35);
    const re = openOperatorLedger(cd, "helius", 0);
    assert.equal(re.entries().length, 2);
    assert.equal(readFileSync(led.headPath, "utf8"), re.entries()[1]!.entry_sha256);
    // (3) a NON-transient code is not retried.
    const j3 = journal({ sleepSync: virtualSleep(slept), renameSync: () => { throw eperm("ENOENT"); } });
    try { assert.throws(() => re.appendChained("attempted", { "helius|getTransaction": 1 }, 1), /ENOENT/); } finally { j3.restore(); }
    assert.equal(j3.ops.filter((o) => o === RENAME).length, 1);
    // (4) G2 C-G2-2(c): the two other transient codes declared at the ADR (D-FS-2, E-3) are retried exactly like (1).
    for (const code of ["EACCES", "EBUSY"]) {
      const l = openOperatorLedger(ensureCycleDir(dir, `c-${code}`), "helius", 0);
      let left = 2;
      const jc = journal({ sleepSync: virtualSleep([]), renameSync: (a, b) => { if (left-- > 0) throw eperm(code); renameSync(a, b); } });
      let e: CycleLedgerEntry;
      try { e = l.appendChained("attempted", { "helius|getTransaction": 1 }, 1); } finally { jc.restore(); }
      assert.deepEqual(jc.ops.slice(6), ["fsync:helius.head.tmp", "close:helius.head.tmp", RENAME, "sleep:10", RENAME, "sleep:20", RENAME], code);
      assert.equal(readFileSync(l.headPath, "utf8"), e.entry_sha256, code);
    }
  } finally { cleanup(); }
});

test("durable_head_rename_outlasts_a_real_reader_then_fails_closed_without_fallback", async () => {
  // Orchestrator requirement (22:0x UTC, measured on F: win32/NTFS): a rename onto a target that ANY reader holds open
  // fails EPERM. A REAL reader (fs.openSync(head, "r")) holds the head; on win32 the real rename fails by itself, on POSIX
  // (a rename over an open file succeeds) the same refusal is emulated while the reader is held.
  const win = process.platform === "win32";
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  let fetches = 0, reader: number | undefined;
  const release = (): void => { if (reader !== undefined) { closeSync(reader); reader = undefined; } };
  const heldRename = (a: string, b: string): void => { if (!win && reader !== undefined) throw eperm("EPERM"); renameSync(a, b); };
  globalThis.fetch = () => { fetches++; return okFetch(); };
  try {
    const client = openGuardedClient(FAKE_HELIUS_ENV, ONE_METHOD_LIMITS, dir, { helius: "c-reader" });
    await client.call(HELIUS, "getTransaction", [0]);
    const cd = join(dir, "c-reader"), headPath = join(cd, "helius.head");
    const headOf = (): string => readFileSync(headPath, "utf8");
    // (a) the reader lets go after >= 300 ms of REAL backoff (waits 10..80 ms): the call succeeds, nothing is lost.
    reader = openSync(headPath, "r");
    let waited = 0;
    const j = journal({ renameSync: heldRename, sleepSync: (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); waited += ms; if (waited >= 300) release(); } });
    try { await client.call(HELIUS, "getTransaction", [1]); } finally { j.restore(); release(); }
    assert.ok(j.ops.filter((o) => o.startsWith("sleep:")).length >= 8 && waited >= 300, "the rename waited for the reader");
    let es = readFileSync(join(cd, "helius.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry);
    assert.equal(headOf(), es[1]!.entry_sha256, "target = the NEW head");
    assert.equal(existsSync(`${headPath}.tmp`), false, "the tmp was consumed by the rename");
    assert.equal(fetches, 2);
    // (b) a reader that never lets go: NAMED error at the cap, target = the OLD head INTACT, the request NOT sent.
    reader = openSync(headPath, "r");
    const slept: number[] = [];
    const j2 = journal({ renameSync: heldRename, sleepSync: virtualSleep(slept) });
    try { await assert.rejects(client.call(HELIUS, "getTransaction", [2]), CAP_ERROR); } finally { j2.restore(); release(); }
    assert.equal(fetches, 2, "fail-closed BEFORE the transport: the request was never sent");
    assert.equal(headOf(), es[1]!.entry_sha256, "no in-place fallback: the old head is intact");
    // The write-ahead line of the unsent request stays (over-count by one, the safe side); the next open heals the head
    // (one entry behind) and consumes the orphan tmp.
    const re = openOperatorLedger(cd, "helius", 0);
    es = re.entries().slice();
    assert.equal(es.length, 3);
    assert.equal(headOf(), es[2]!.entry_sha256);
    assert.equal(existsSync(`${headPath}.tmp`), false);
  } finally { release(); globalThis.fetch = realFetch; cleanup(); }
});

test("durable_head_one_entry_behind_advances_to_the_last_durable_entry_never_back_never_double_counted", () => {
  // FAITS-win32-flush-rename-2026-09-22 section 4: the rename's persistence is NOT guaranteed, so after a cut the head can
  // be the OLD complete file - one entry behind the durable ledger (head = E2, ledger ends at E3).
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "c-behind");
    const led = openOperatorLedger(cd, "helius", 0);
    led.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    const e2 = led.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, 10);
    const e3 = led.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, 100);
    writeFileSync(led.headPath, e2.entry_sha256); // E3's head rename never reached the disk
    const re = openOperatorLedger(cd, "helius", 0);
    assert.equal(readFileSync(led.headPath, "utf8"), e3.entry_sha256, "the head ADVANCES to the last durable entry, never back");
    assert.equal(re.priorAtOpen(), 111, "each durable entry counted ONCE: 1 + 10 + 100 (double-counted E3 = 211, lost E3 = 11)");
    const e4 = re.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    assert.equal(e4.prev_entry_sha256, e3.entry_sha256, "the next line chains from E3, never from the stale head E2 (no fork)");
    const again = openOperatorLedger(cd, "helius", 0);
    assert.equal(again.entries().length, 4, "exactly four durable lines: nothing re-appended");
    verifyCycleLedger(again.entries());
    assert.equal(again.priorAtOpen(), 112);
  } finally { cleanup(); }
});

test("durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch", () => {
  // Ruling I-10 (c). (1) BEHAVIOUR: a FRESH process counts node:fs's OWN fsyncSync (count, then delegate to the real one,
  // via module.syncBuiltinESMExports), THEN imports the package by its PRODUCTION specifier: 1 lock + 2 appends x (line +
  // head.tmp) = 5 real flushes. The sequence journal cannot see this: it records `fsync:` before delegating, so a no-op
  // default flush stayed green under all 15 durability tests (replayed at pli-1, "M27" gap).
  const REPO = fileURLToPath(new URL("../../../", import.meta.url));
  const { dir, cleanup } = tmp();
  try {
    const code = `import fs from "node:fs"; import { syncBuiltinESMExports } from "node:module";
const real = fs.fsyncSync; let n = 0; fs.fsyncSync = (fd) => { n++; real(fd); }; syncBuiltinESMExports();
const { openGuardedClient } = await import("@monark/rpc-guard");
globalThis.fetch = () => Promise.resolve(new Response('{"result":1}', { status: 200, headers: { "content-type": "application/json" } }));
const c = openGuardedClient(${JSON.stringify(FAKE_HELIUS_ENV)}, ${JSON.stringify(ONE_METHOD_LIMITS)}, ${JSON.stringify(dir)}, { helius: "prod" });
for (let i = 0; i < 2; i++) await c.call("helius", "getTransaction", [i]);
process.stdout.write(String(n));`;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], { cwd: REPO, env: childEnv(), encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, "5", "the production path flushes through node:fs itself: lock + 2 x (line + head.tmp)");
  } finally { cleanup(); }
  // (2) STRUCTURE (G2 C-G2-4, re-G2 C-G2b-1, re-G2-delta C-G2c-1): no production source reaches THIS package's
  //     off-switches - the DURABLE_FS seam (src/ledger.ts), the no-fsync test support, an env read. The grammar reads a
  //     literal specifier after from, import, require, new URL or import.meta.resolve (comments included) in every
  //     .ts .mts .cts .js .mjs .cjs source under scripts/ and {apps,packages}/*/{src,scripts,bin}. Its resolution is
  //     LEXICAL, on the RAW source text: a specifier starting with "." is joined to the file's directory and normalised,
  //     any other is kept verbatim; @monark/rpc-guard/<x> and any node_modules/@monark/rpc-guard/<x> ->
  //     packages/rpc-guard/<x>. Node resolves the VALUE (after JS escapes) as a URL or, for require, a path, then keys
  //     the module by its realpath. Outside this package's src/ and bin/, a target under packages/rpc-guard/src/ or test/
  //     is a hit (G2 X1); inside, a target under test/, a `DURABLE_FS.<x> =` or a process.env read (ruling (a)); in
  //     bin/, ANY DURABLE_FS token or a src/ledger.ts target (re-G2 S6); anywhere, the createRequire token (re-G2 S3).
  //     Where the two resolutions part, the spelling is itself a hit (pli-4): a specifier with a backslash, a percent
  //     sign, a TAB/LF/CR, or a C0 control or space at either end (what a literal's value, ECMA-262 12.9.4/12.9.6.2, or
  //     the WHATWG URL parser, 4.4, drops or maps, and node's percent-decoding; a LF never reaches the capture); an
  //     absolute or data: specifier ("/", a drive letter, file:, data:, any case - only a relative one is normalised
  //     here); a `new URL` literal whose next token is neither ")" nor ", import.meta.url)" (resolved here against its
  //     file); a FILE without extension under these roots (node 24 loads it as ESM under "type": "module"); and a
  //     capture whose CLOSING quote is not its opening one (rule Q, pli-5, labelled and removable: the regex closes on
  //     the first quote of ANY kind, so an inner quote of another kind ends it short - re-G2-delta pli-4 G1, G2 the
  //     served bin). No bare-token rule outside bin/: apps/bell/src/rebase-crosscheck.ts declares Bell's OWN DURABLE_FS
  //     (2c276bb). A static heuristic, DECLARED by its own hypotheses, each a FINITE list (no residue by example: three
  //     enumerations were refuted in a row - S3-S9 pli-2, H1-H17 pli-3, ten forms pli-4 - so the closure is the
  //     hypotheses, not the cases). It does NOT see (a) a module the scan does not read: outside these roots, loaded
  //     directly or through a scanned one (measured: re-G2 S7), or under them with an extension the file glob does not
  //     list - import refuses an unknown extension, require runs a foreign one as JavaScript (measured: pli-4 W3); (b)
  //     a specifier the grammar's REGEX does not capture as a bare literal (hypothesis 1 - the regex IS the whole
  //     reading: a keyword, an optional "(", blanks, one quote, then a capture up to the first quote of ANY kind or a
  //     LF): a value not literal at that position - computed, or a comment / parenthesis / optional "?." between the
  //     keyword and the literal, or a literal cut by a raw LF (measured: re-G2 S8; re-G2-delta pli-4 G3-G6; W1, W2);
  //     OR a literal handed to one of the reading calls that are BINDINGS, not syntax (hypothesis 2 - they are exactly
  //     four: require, the CJS wrapper parameter; URL, a global; import.meta.resolve, a property; and import.meta.url,
  //     the base the `new URL` rule accepts - whereas import(...) and `import ... from` are syntax, not rebindable),
  //     the binding rebound or aliased or reached without its token (measured: re-G2-delta pli-4 B7-B9, G7; require.resolve,
  //     URL.parse, Reflect.construct(URL, ...), an alias of import.meta.resolve: pli-3 B1, B3, B4, re-G2-delta B6-B9);
  //     (c) the seam re-exported by src/ under any name, then reached by a specifier that is no hit (re-cp-2 MV-14:
  //     index.ts + the bare @monark/rpc-guard - not checked here; exports.test.ts public_export_set_is_closed pins
  //     index.ts's exports, not another src/ module's); (d) in src/, a seam write not spelled `DURABLE_FS.<x> =` that
  //     part (1) does not run (a function it does not call, a module only the bin loads); (e) a patch of node itself:
  //     node:fs (fsyncSync replaced + module.syncBuiltinESMExports), its native binding (process.binding("fs").fsync -
  //     part (1) still counts 5: pli-4 W9), the module loader (a module.registerHooks hook: pli-4 W8), or node's
  //     RESOLUTION ENVIRONMENT the scan cannot read - NODE_PATH / GLOBAL_FOLDERS resolve a BARE require() specifier that
  //     is no hit (node reads them at process start, not from the source; ESM ignores NODE_PATH), likewise
  //     --preserve-symlinks / --conditions / a preload (measured: pli-5 W10 - a bare require("ledger.ts") under the
  //     roots resolves to the seam through NODE_PATH; the deployment's environment, NOT the repository's - item D-P5-1);
  //     (f) a literal
  //     READ and passed by the rules above whose module node resolves OTHERWISE than this lexical resolution, through a
  //     resolver input beyond the text, each a finite list: (hypothesis 3) a package.json field the scan does not read -
  //     node reads exactly "name", "main", "type", "exports" and "imports" (measured: an "imports" #name or a
  //     directory's "main" for require - pli-4 W4, W5; a deep "exports" subpath is refused, ERR_PACKAGE_PATH_NOT_EXPORTED,
  //     so not a vector - pli-4 W7); (hypothesis 4) the realpath step - node keys a module by the real path of the
  //     resolved file (measured: a symbolic link or junction reached by a relative specifier - pli-4 W6, re-G2-delta
  //     F3b; F3 under the roots is killed by an artefact, not by a rule); (hypothesis 5) the case - the
  //     node_modules/@monark/rpc-guard/ normalisation is case-sensitive, the file system is not, so a link spelled in
  //     another case resolves through the workspace and realpath yields the canonical module (measured: re-G2-delta
  //     pli-4 F4, F5 the served bin). Part (1) is the BEHAVIOURAL proof for the module graph index.ts loads ONLY (all
  //     of src/, run through openGuardedClient - a real fsyncSync count in a fresh process). It does NOT prove the
  //     served bin (unlock, repair-tail, reconcile) or the course scripts, covered here ONLY by this scan; their
  //     behavioural proof - a real fsync counted under node --import on the bin - is item GARDE-FSYNC-BIN-1.
  const hits: string[] = [], scanned: string[] = [], targets = new Set<string>();
  const workspaces = ["apps", "packages"].flatMap((w) => (existsSync(join(REPO, w)) ? readdirSync(join(REPO, w)).map((p) => `${w}/${p}`) : []));
  for (const root of ["scripts", ...workspaces.flatMap((p) => [`${p}/src`, `${p}/scripts`, `${p}/bin`])]) {
    if (!existsSync(join(REPO, root))) continue; // apps/bell, bin/ and most of scripts/ are not in the public mirror
    for (const f of readdirSync(join(REPO, root), { recursive: true, encoding: "utf8" }).filter((x) => posix.extname(x.replace(/\\/g, "/")) === "" && statSync(join(REPO, root, x)).isFile()))
      hits.push(`${root}/${f.replace(/\\/g, "/")}: a file without extension under the scanned roots (node loads it as ESM under "type": "module")`);
    for (const f of readdirSync(join(REPO, root), { recursive: true, encoding: "utf8" }).filter((x) => /\.[mc]?[jt]s$/.test(x))) {
      const rel = `${root}/${f.replace(/\\/g, "/")}`, text = readFileSync(join(REPO, root, f), "utf8");
      const own = /^packages\/rpc-guard\/(src|bin)\//.test(rel), inBin = rel.startsWith("packages/rpc-guard/bin/");
      scanned.push(rel);
      for (const m of text.matchAll(/(?:\bfrom|\bimport\s*\.\s*meta\s*\.\s*resolve|\bimport|\brequire|\bnew\s+URL)\s*\(?\s*["'`]([^"'`\n]+)["'`]/g)) {
        const spec = m[1] ?? "", target = (spec.startsWith(".") ? posix.normalize(posix.join(posix.dirname(rel), spec)) : spec.replace(/^@monark\/rpc-guard\//, "packages/rpc-guard/"))
          .replace(/^(?:.*\/)?node_modules\/@monark\/rpc-guard\//, "packages/rpc-guard/"); // the workspace link IS this package
        targets.add(target);
        if (/[\\%\t\n\r]|^[\x00-\x20]|[\x00-\x20]$/.test(spec)) hits.push(`${rel}: imports a specifier not in canonical spelling ${JSON.stringify(spec)}`);
        if (/^(?:\/|[a-z]:|file:|data:)/i.test(spec)) hits.push(`${rel}: imports an absolute or data: specifier ${JSON.stringify(spec)}`);
        if (m[0].at(-2 - spec.length) !== m[0].at(-1)) // rule Q (pli-5, ruling C-G2d-1), removable: opening quote != closing quote
          hits.push(`${rel}: a specifier literal cut by a quote of another kind ${JSON.stringify(m[0].slice(-2 - spec.length))} (rule Q)`);
        if (m[0].startsWith("new") && !/^\s*(?:\)|,\s*import\s*\.\s*meta\s*\.\s*url\s*\))/.test(text.slice(m.index + m[0].length)))
          hits.push(`${rel}: imports ${JSON.stringify(spec)} by new URL against a base other than import.meta.url`);
        const internal = /(?:^|\/)packages\/rpc-guard\/(src|test)\//.exec(target)?.[1];
        if (internal === "test" || (internal === "src" && !own)) hits.push(`${rel}: imports ${target}`);
        else if (inBin && /(?:^|\/)packages\/rpc-guard\/src\/ledger\.ts/.test(target)) hits.push(`${rel}: the served bin imports ${target}`);
      }
      if (/no-fsync/.test(text)) hits.push(`${rel}: references the no-fsync test support`);
      if (/\bcreateRequire\b/.test(text)) hits.push(`${rel}: mentions createRequire (the token, under any import alias)`);
      if (inBin && /\bDURABLE_FS\b/.test(text)) hits.push(`${rel}: the served bin names the DURABLE_FS seam`);
      if (own && /DURABLE_FS\.\w+\s*=[^=]/.test(text)) hits.push(`${rel}: assigns the DURABLE_FS seam`);
      if (own && /process\.env/.test(text)) hits.push(`${rel}: reads process.env`);
    }
  }
  assert.ok(scanned.includes("packages/rpc-guard/src/ledger.ts") && scanned.includes("packages/rpc-guard/src/index.ts"), "the scan reached the package sources (non-vacuous)");
  assert.ok(targets.has("packages/rpc-guard/src/ledger.ts"), "the specifier resolver maps the package's own ./ledger.ts (non-vacuous)");
  if (existsSync(join(REPO, "scripts/census/u4-guard.mjs"))) assert.ok(scanned.includes("scripts/census/u4-guard.mjs"), "the scan reached the paid course scripts (non-vacuous)");
  if (existsSync(join(REPO, "packages/rpc-guard/bin"))) assert.ok(scanned.includes("packages/rpc-guard/bin/rpc-guard.mjs"), "the scan reached the served bin (non-vacuous)");
  assert.deepEqual(hits, [], "no production off-switch for the platter flush");
});
