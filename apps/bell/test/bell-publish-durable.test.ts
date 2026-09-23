// MONARK Bell -- T-1b S-3 oracle (ADR-T1b-backend v2 D6, D8, D9; checkpoint-1 C-3). The signed line, the durable write order
// observed through the DURABLE_FS seam, crash-and-restart invariants I-1..I-3, torn-tail repair, start-up refusals, idempotence,
// the single clock read, the key read ONLY from $CREDENTIALS_DIRECTORY and the state keyring. Inputs: REAL collect() outputs
// serialized as runMain writes them (collect.ts:855-859, declared). No network; test keys are generated here, never committed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash, generateKeyPairSync, verify as edVerify, type KeyObject } from "node:crypto";
import { collect } from "../src/collect.ts";
import { canonical, keyIdOf, keyringOf, lineHash, publicKeyOfJwk, signLine, signingBytes } from "../scripts/bell-chain.mjs";
import { BellPublishError, DURABLE_FS, publishToDir, runCli, type DurableFs, type PublishResult, type RefusalCode } from "../scripts/bell-publish.mjs";

type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url));
const KEY = generateKeyPairSync("ed25519").privateKey;
const T = 1_800_000_000_000;
const tmp = (prefix: string): string => mkdtempSync(join(tmpdir(), prefix));
const sha = (b: string | Uint8Array): string => createHash("sha256").update(b).digest("hex");
const read = (p: string): string => readFileSync(p, "utf8");
const jsonLines = (p: string): Obj[] => (existsSync(p) ? read(p).split("\n").filter((l) => l !== "").flatMap((l) => { try { return [JSON.parse(l) as Obj]; } catch { return []; } }) : []);
/** Every dir ("x/") and file ("x <sha256>") under root, sorted: a directory fingerprint. */
function tree(root: string, rel = ""): string[] {
  return readdirSync(join(root, rel)).sort().flatMap((n) => {
    const r = rel === "" ? n : `${rel}/${n}`, a = join(root, r);
    return statSync(a).isDirectory() ? [`${r}/`, ...tree(root, r)] : [`${r} ${sha(readFileSync(a))}`];
  });
}
/** Run `run` (default r0) of bundle `name` in <state>/inbox: a REAL collect() output written in runMain's form; `usdc` sets the vwap. */
function drop(state: string, name: string, usdc: bigint, run = "r0"): void {
  const w = Date.UTC(2026, 8, 19, 13, 31, 4), dir = join(state, "inbox", name, run);
  const r = collect({ symbols: [{ symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fillsResidues: [], quorumCoverage: 1, advDailyVolumes: [],
    fills: [{ signature: "a", blockTimeUtcMs: w, baseDelta: 100_000_000n, quoteDelta: -usdc * 1_000_000n }], closeRefBySession: { "2026-09-18": 364 } }],
  haltRows: [], window: { fromUtcMs: w - 86_400_000, toUtcMs: w }, nowSec: T / 1000, staleBoundSec: 93600, generatedAt: new Date(w).toISOString(), providers: ["helius"] });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "state.json"), JSON.stringify(r.state, null, 2));
  writeFileSync(join(dir, "timeline.jsonl"), r.timeline.map((l) => JSON.stringify(l)).join("\n") + "\n");
  writeFileSync(join(dir, "provenance.json"), JSON.stringify(r.provenance, null, 2));
}
const pub = (state: string, o: { clock?: () => number; fs?: DurableFs; key?: KeyObject } = {}): PublishResult =>
  publishToDir({ inboxDir: join(state, "inbox"), stateDir: state, privateKey: o.key ?? KEY, clock: o.clock ?? (() => T), ...(o.fs ? { fs: o.fs } : {}) });
function refuses(state: string, code: RefusalCode, why: string, key: KeyObject = KEY): void {
  const before = tree(state);
  assert.throws(() => pub(state, { key }), (e: unknown) => e instanceof BellPublishError && e.code === code, `${code}: ${why}`);
  assert.deepEqual(tree(state), before, `${code} (${why}): nothing written`);
}
/** Run `f` with process.stderr captured. */
function stderrOf(f: () => void): string {
  const out: string[] = [], w = process.stderr.write.bind(process.stderr);
  process.stderr.write = (c: string | Uint8Array): boolean => { out.push(String(c)); return true; };
  try { f(); } finally { process.stderr.write = w; }
  return out.join("");
}
interface Call { op: string; path: string; from?: string }
/** DURABLE_FS wrapped: every call journaled (path relative to the state dir; a rename also its source `from`). From call `crashAt` on, every call throws (a dead
 *  process writes nothing more) except closeSync, so the test process leaks no handle. */
function seam(state: string, crashAt = -1): { fs: DurableFs; calls: Call[] } {
  const calls: Call[] = [], fds = new Map<number, string>(), rel = (p: string): string => relative(state, p).split(sep).join("/");
  const step = (op: string, p: string, from?: string): void => { if (crashAt >= 0 && calls.length >= crashAt) throw new Error("injected crash"); calls.push({ op, path: rel(p), ...(from === undefined ? {} : { from: rel(from) }) }); };
  return { calls, fs: {
    openSync: (p, f) => { step(`open:${f}`, p); const fd = DURABLE_FS.openSync(p, f); fds.set(fd, p); return fd; },
    writeSync: (fd, d) => { step("write", fds.get(fd) ?? "?"); DURABLE_FS.writeSync(fd, d); },
    fsyncSync: (fd) => { step("fsync", fds.get(fd) ?? "?"); DURABLE_FS.fsyncSync(fd); },
    closeSync: (fd) => { DURABLE_FS.closeSync(fd); fds.delete(fd); },
    renameSync: (a, b) => { step("rename", b, a); DURABLE_FS.renameSync(a, b); },
    fsyncDir: (d) => { step("fsyncDir", d); DURABLE_FS.fsyncDir(d); },
  } };
}
/** ADR D8 invariants. I-1: every file under public/ is cited by a COMMITTED (private) line; I-2: public/state.json is cited by a
 *  SERVED line; I-3: every served line has its immutables served. Returns the violations. */
function invariants(state: string): string[] {
  const committed = jsonLines(join(state, "timeline.jsonl")), served = jsonLines(join(state, "public", "timeline.jsonl")), pubDir = join(state, "public");
  const cites = (ls: Obj[], k: string, h: string): boolean => ls.some((l) => l[k] === h);
  const out: string[] = [];
  for (const f of existsSync(pubDir) ? tree(pubDir).filter((e) => !e.endsWith("/")).map((e) => e.split(" ")[0]!) : []) {
    const h = sha(readFileSync(join(pubDir, f)));
    const ok = f === "timeline.jsonl" ? read(join(state, "timeline.jsonl")).startsWith(read(join(pubDir, f)))
      : f === "bell/pubkey.json" ? existsSync(join(state, "keyring.json")) && read(join(state, "keyring.json")) === read(join(pubDir, f))
        : f === "state.json" || f === `states/${h}.json` ? cites(committed, "state_sha256", h)
          : f === "provenance.json" || f === `provenance/${h}.json` ? cites(committed, "provenance_sha256", h) : false;
    if (!ok) out.push(`I-1 public/${f}`);
  }
  if (existsSync(join(pubDir, "state.json")) && !cites(served, "state_sha256", sha(readFileSync(join(pubDir, "state.json"))))) out.push("I-2 public/state.json");
  for (const l of served) for (const [d, k] of [["states", "state_sha256"], ["provenance", "provenance_sha256"]] as const) {
    if (!existsSync(join(pubDir, d, `${String(l[k])}.json`))) out.push(`I-3 line ${String(l.seq)} ${d}`);
  }
  return out;
}

// ---- S-3 (a): the D8 order observed through the seam; every tmp fsynced before its rename; every rename followed by the fsync of its directory ----
test("bell_publish_dir_fsync_after_rename", () => {
  const s = tmp("t1b-order-");
  drop(s, "b1", 365n);
  const { fs, calls } = seam(s);
  assert.equal(pub(s, { fs }).status, "published");
  const up = (p: string): string => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");
  calls.forEach((c, i) => { if (c.op === "rename") assert.deepEqual(calls[i + 1], { op: "fsyncDir", path: up(c.path) }, `rename ${c.path} then fsync(dir)`); });
  const at = (op: string, re: RegExp): number => calls.findIndex((c) => c.op === op && re.test(c.path));
  const order = [at("rename", /^staging\/states\//), at("rename", /^staging\/provenance\//), at("rename", /^keyring\.json$/), at("fsync", /^timeline\.jsonl$/),
    at("rename", /^public\/states\//), at("rename", /^public\/provenance\//), at("rename", /^public\/timeline\.jsonl$/), at("rename", /^public\/state\.json$/),
    at("rename", /^public\/provenance\.json$/), at("rename", /^public\/bell\/pubkey\.json$/), at("rename", /^archive\/1-b1$/)];
  assert.deepEqual(order, [...order].sort((x, y) => x - y), `step order 2 < 3 (commit) < 4 < 5 < 6 < 7: ${JSON.stringify(calls)}`);
  assert.ok(order[0]! >= 0, "staging written");
  const commit = order[3]!;
  assert.deepEqual(calls[commit + 1], { op: "fsyncDir", path: "" }, "the append's directory is fsynced");
  assert.ok(calls.slice(0, commit + 1).every((c) => !c.path.startsWith("public/")), "nothing written under public/ before the commit point");
  assert.deepEqual(calls.filter((c) => c.op === "open:a").map((c) => c.path), ["timeline.jsonl"], "the only append is the private timeline");
  const tmps = calls.flatMap((c, i) => (c.from?.startsWith("staging/tmp-") ? [{ tmp: c.from, opened: calls.slice(0, i).findLastIndex((x) => x.op === "write" && x.path === c.from), renamed: i }] : []));
  assert.ok(tmps.length === 7 && tmps.every((r) => r.opened >= 0 && calls.slice(r.opened, r.renamed).some((x) => x.op === "fsync" && x.path === r.tmp)), `tmp -> fsync -> rename (ADR D8), 2 immutables + keyring + 4 served: ${JSON.stringify(tmps)}`);
});

// ---- S-3 (b): a crash injected at EVERY durable call, then a restart: I-1..I-3 hold at both points; exactly one line added ----
test("bell_publish_crash_between_steps_never_serves_unbound_state", (t) => {
  for (const firstRun of [true, false]) {
    const tpl = tmp("t1b-tpl-");
    if (!firstRun) { drop(tpl, "b0", 364n); pub(tpl); }
    drop(tpl, "b1", 365n);
    const probe = tmp("t1b-probe-");
    cpSync(tpl, probe, { recursive: true });
    const clean = seam(probe);
    pub(probe, { fs: clean.fs });
    t.diagnostic(`crash points exercised (firstRun=${String(firstRun)}): ${String(clean.calls.length)}`);
    for (let k = 0; k < clean.calls.length; k++) {
      const s = tmp("t1b-crash-"), where = `firstRun=${String(firstRun)} crash at call ${String(k)} ${JSON.stringify(clean.calls[k])}`;
      cpSync(tpl, s, { recursive: true });
      assert.throws(() => pub(s, { fs: seam(s, k).fs, clock: () => T + 1 }), /injected crash/, where);
      assert.deepEqual(invariants(s), [], `after ${where}`);
      if (readdirSync(join(s, "inbox")).length === 0) refuses(s, "inbox_not_exactly_one_bundle", `restart after ${where}: already archived`);
      else stderrOf(() => { pub(s, { clock: () => T + 2 }); });
      assert.deepEqual(invariants(s), [], `after the restart, ${where}`);
      assert.equal(jsonLines(join(s, "timeline.jsonl")).length, firstRun ? 1 : 2, `one line added, ${where}`);
      assert.equal(read(join(s, "public", "timeline.jsonl")), read(join(s, "timeline.jsonl")), `public == private, ${where}`);
      assert.deepEqual(readdirSync(join(s, "inbox")), [], `bundle archived, ${where}`);
    }
  }
});

// ---- S-3 (c): an unterminated private tail NOT served is truncated (repaired_torn_tail); a SERVED one is never truncated ----
test("bell_publish_torn_private_tail_truncated_only_if_unserved", () => {
  const s = tmp("t1b-torn-");
  drop(s, "b0", 364n);
  pub(s);
  const before = read(join(s, "timeline.jsonl"));
  appendFileSync(join(s, "timeline.jsonl"), before.slice(0, 40));
  drop(s, "b1", 365n);
  assert.equal(stderrOf(() => { assert.equal(pub(s).status, "published"); }), "bell/publish: repaired_torn_tail\n");
  const after = read(join(s, "timeline.jsonl"));
  assert.ok(after.startsWith(before) && jsonLines(join(s, "timeline.jsonl")).length === 2, "truncated to the committed prefix, then ONE new line");
  const v = tmp("t1b-torn2-");
  drop(v, "b0", 364n);
  pub(v);
  drop(v, "b1", 365n);
  pub(v, { clock: () => T + 1 });
  const full = read(join(v, "timeline.jsonl"));
  writeFileSync(join(v, "timeline.jsonl"), full.slice(0, full.length - 30)); // the private copy lost the end of line 2, public/ serves it
  drop(v, "b2", 366n);
  refuses(v, "existing_timeline_corrupt", "a torn tail that is served");
});

// ---- S-3 (c): signature, chain (last OR middle link), seq -- each broken ALONE (re-signed by the real key where needed) => refused, nothing written ----
test("bell_publish_refuses_corrupt_existing_timeline", () => {
  const base = tmp("t1b-cor-");
  [364n, 365n, 366n].forEach((u, i) => { drop(base, `b${String(i)}`, u); pub(base, { clock: () => T + i }); }); // three committed lines
  const [l1, l2, l3] = jsonLines(join(base, "timeline.jsonl")) as [Obj, Obj, Obj];
  const resign = (l: Obj): Obj => ({ ...l, sig: signLine(l, KEY) }), mid = resign({ ...l2, prev_line_hash: "f".repeat(64) });
  const cases: Array<[string, Obj[]]> = [["bad signature", [l1, { ...l2, sig: signLine({ ...l2, seq: 99 }, KEY) }]],
    ["broken chain", [l1, mid]], ["non-contiguous seq", [l1, resign({ ...l2, seq: 3 })]],
    ["broken MIDDLE link (the next line re-chained onto it, re-signed)", [l1, mid, resign({ ...l3, prev_line_hash: lineHash(mid) })]], ["broken GENESIS link (line 1 re-signed)", [resign({ ...l1, prev_line_hash: "f".repeat(64) })]]];
  for (const [why, bad] of cases) {
    const s = tmp("t1b-cor-x-");
    cpSync(base, s, { recursive: true });
    const text = bad.map((l) => canonical(l) + "\n").join("");
    writeFileSync(join(s, "timeline.jsonl"), text);
    writeFileSync(join(s, "public", "timeline.jsonl"), text); // served identically: only the named check can object
    drop(s, "b3", 367n);
    refuses(s, "existing_timeline_corrupt", why);
  }
  const midDir = tmp("t1b-cor-x-"), l3b = resign({ ...l2, seq: 3, prev_line_hash: sha(canonical(l2)) }); // G2 PR-2 C-1 (g2-02b) [merge G7: mid/l3 renamed midDir/l3b, PR-1-ter declares them above]: line 1 altered AND re-signed by the
  const three = [resign({ ...l1, runs: [] }), l2, l3b].map((l) => canonical(l) + "\n").join(""); // key holder breaks the chain at line 2, NOT the last line
  cpSync(base, midDir, { recursive: true });
  for (const f of ["timeline.jsonl", "public/timeline.jsonl"]) writeFileSync(join(midDir, f), three);
  drop(midDir, "b2", 366n);
  refuses(midDir, "existing_timeline_corrupt", "a middle line re-signed by the key holder");
});

// ---- S-3 (d) / C-in-9: the same bundle twice => ONE line; the second call archives it and reports nothing_to_publish; a superset publishes ----
test("bell_publish_same_bundle_twice_is_idempotent", () => {
  const s = tmp("t1b-idem-");
  drop(s, "b1", 365n);
  const first = pub(s);
  drop(s, "b1", 365n);
  const again = pub(s, { clock: () => T + 5 });
  assert.deepEqual(again, { ...first, status: "nothing_to_publish" }, "same seq, published_at and hashes");
  assert.equal(jsonLines(join(s, "timeline.jsonl")).length, 1);
  assert.deepEqual(readdirSync(join(s, "archive")).sort(), ["1-b1", `1-b1-dup-${String(T + 5)}`]);
  assert.deepEqual(readdirSync(join(s, "inbox")), []);
  for (const [a, b] of [[365n, 366n], [366n, 365n]] as const) { // IDENTICAL only: {a} then {a, b} publishes, whichever run sorts first
    const u = tmp("t1b-idem-sup-"); drop(u, "b1", a); pub(u); drop(u, "b2", a); drop(u, "b2", b, "r1"); const r = pub(u, { clock: () => T + 1 });
    assert.deepEqual([r.status, r.seq, jsonLines(join(u, "timeline.jsonl")).length], ["published", 2, 2], `{${String(a)}} then {${String(a)}, ${String(b)}}`); }
});

// ---- S-3 (e) / C-3: a clock returning a new value at each call is read ONCE; line and envelopes carry that published_at ----
test("bell_publish_published_at_single_clock_read", () => {
  const s = tmp("t1b-clock-");
  drop(s, "b1", 365n);
  let calls = 0;
  const r = pub(s, { clock: () => T + 1000 * calls++ });
  assert.equal(calls, 1, "one clock read per publication");
  const iso = new Date(T).toISOString();
  assert.deepEqual([r.published_at, jsonLines(join(s, "timeline.jsonl"))[0]?.published_at,
    ...["state.json", "provenance.json"].map((f) => (JSON.parse(read(join(s, "public", f))) as Obj).published_at)], [iso, iso, iso, iso]);
});

// ---- S-3 (f) / ADR D9: the CLI reads the key ONLY from $CREDENTIALS_DIRECTORY/bell-signing-key; absent => signing_key_missing ----
test("bell_publish_cli_reads_key_only_from_credentials_directory", (t) => {
  const script = join(HERE, "..", "scripts", "bell-publish.mjs"), creds = tmp("t1b-creds-"); // a TEST key, written outside the repo
  t.after(() => { rmSync(creds, { recursive: true, force: true }); }); // the throwaway test key never outlives the test
  writeFileSync(join(creds, "bell-signing-key"), KEY.export({ type: "pkcs8", format: "pem" }));
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.CREDENTIALS_DIRECTORY;
  const cli = (state: string, e: NodeJS.ProcessEnv) => spawnSync(process.execPath, [script, "--inbox", join(state, "inbox"), "--state", state], { env: e, encoding: "utf8" });
  const s = tmp("t1b-cli-");
  drop(s, "b1", 365n);
  const before = tree(s), missing = cli(s, env);
  assert.deepEqual([missing.status, missing.stdout], [1, ""]);
  assert.match(missing.stderr, /^bell\/publish: signing_key_missing: /);
  assert.deepEqual(tree(s), before, "nothing written without the key");
  const ok = cli(s, { ...env, CREDENTIALS_DIRECTORY: creds });
  assert.equal(ok.status, 0, ok.stderr);
  assert.equal((JSON.parse(ok.stdout) as Obj).status, "published", "one JSON summary line on stdout");
  // in process: the ONLY environment read is CREDENTIALS_DIRECTORY, also when it is absent (no fallback variable, no enumeration)
  const seen: string[] = [], real = process.env, c = tmp("t1b-cli2-");
  drop(c, "b1", 365n);
  const record = (k: string | symbol): void => { if (typeof k === "string") seen.push(k); };
  try {
    process.env = new Proxy({ ...env }, { get: (o, k) => { record(k); return Reflect.get(o, k) as unknown; }, has: (o, k) => { record(k); return Reflect.has(o, k); },
      ownKeys: (o) => { seen.push("<enumerated>"); return Reflect.ownKeys(o); } });
    stderrOf(() => { assert.equal(runCli(["--inbox", join(c, "inbox"), "--state", c]), 1); });
  } finally { process.env = real; }
  assert.deepEqual([...new Set(seen)], ["CREDENTIALS_DIRECTORY"]);
  assert.deepEqual(read(script).match(/process\.env[.\w[\]"'`]*/g), ["process.env.CREDENTIALS_DIRECTORY"], "one environment access in the module");
});

// ---- S-3 (g), mission addition: keyring created at the first run; another key => refused; lines verify under the SERVED key; start-up root = keyring.json ----
test("bell_publish_refuses_signing_key_not_in_keyring", () => {
  const s = tmp("t1b-keyring-");
  drop(s, "b1", 365n);
  pub(s);
  const kr = JSON.parse(read(join(s, "keyring.json"))) as { keys: Array<{ key_id: string; jwk: { x: string }; valid_from_seq: number; status: string }> };
  assert.deepEqual(kr.keys.map((k) => [k.key_id, k.valid_from_seq, k.status]), [[keyIdOf(KEY), 1, "active"]], "created at the first run");
  assert.equal(read(join(s, "public", "bell", "pubkey.json")), read(join(s, "keyring.json")), "the served keyring is the state keyring");
  const served = publicKeyOfJwk(kr.keys[0]!.jwk);
  for (const l of jsonLines(join(s, "public", "timeline.jsonl"))) {
    assert.ok(edVerify(null, signingBytes(l), served, Buffer.from(String(l.sig), "base64url")), "crypto.verify under the served key");
    assert.equal(l.key_id, keyIdOf(served));
  }
  drop(s, "b2", 366n);
  refuses(s, "signing_key_not_in_keyring", "a key that is not the active key", generateKeyPairSync("ed25519").privateKey);
  writeFileSync(join(s, "public", "bell", "pubkey.json"), canonical(keyringOf(generateKeyPairSync("ed25519").publicKey, 1)) + "\n"); // a tampered SERVED copy
  assert.deepEqual([stderrOf(() => { assert.equal(pub(s, { clock: () => T + 1 }).status, "published"); }), read(join(s, "public", "bell", "pubkey.json"))], ["bell/publish: rederived_public\n", read(join(s, "keyring.json"))], "start-up root = the PRIVATE keyring");
  rmSync(join(s, "keyring.json")); refuses(s, "existing_timeline_corrupt", "keyring.json missing: the served copy is never the start-up root");
});
