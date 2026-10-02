// MONARK Dojo -- PR-3a-1 oracle (ADR-DOJO-PR-3 section 4, PR-3a-1; cut DOJO-PR3A1-CUT-1, parts 1a to 1c): the publisher's anchor, key
// modes, state and days, through the REAL module and its CLI, each served tree read back by the REAL verifier (dojo-verify.mjs) under a
// SUPPLIED dojo-keyring-v1. Keys are generated at run time by node:crypto and written only under the OS temp dir (TEMP on F: for every run
// of this lot), never committed; seed_anchor and horizon come from the real dojo-seed.mjs over a temp file. Anchor values: the mere's
// (D-3, D-8; decisions 225 (7), 234, 236, 248), the pinned read_rule of dojo-methods.ts, the pinned mint and the addresses of
// fixtures/collect/; the instants are SYNTHETIC. Part 1b writes its days with the REAL writers of PR-2-1 and PR-2-2; its end-to-end
// test (TU-1c) lives under the wiring root, test/dojo-publish-e2e.test.ts (decision 275, Q-G1-5).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, type KeyObject } from "node:crypto";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire, syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, keyIdOf, lineHash, signLine } from "../../bell/scripts/bell-chain.mjs";
import { daySeed, ownerClass, readInstants, rootOf } from "../scripts/dojo-core.mjs";
import { DOJO_VERIFY_REFUSALS, dirSource, verifyDojoServed } from "../scripts/dojo-verify.mjs";
import { initSeed } from "../scripts/dojo-seed.mjs";
import { ANCHOR_KEYS, DOJO_PUBLISH_REFUSALS, DURABLE_FS, DojoPublishError, publishAnchor, revokeKey, rotateKey } from "../scripts/dojo-publish.mjs";
import * as publisher from "../scripts/dojo-publish.mjs"; // publishDay, bound late below: the base of the lot, which lacks it, loads this file
import { DOJO_BUNDLE_REFUSALS, readRecord, readingRecord, recordBytes, writeDayBundle } from "../src/bundle.ts";
import { READ_RULE } from "../src/dojo-methods.ts";
import { historyBundle } from "../src/history-build.ts";
import { DOJO_HISTORY_CREATION as SIG0 } from "../src/history-read.ts";
import { DOJO_LAYOUT_REFUSALS, closeLayout, nextEve, readDayLayout } from "../src/layout.ts";
import type { Eve } from "../src/reading.ts";
import { ADDR, MINT, betaOf, dateOf, dojoKeyringOf, roundOf } from "./helpers/dojo-fixture.ts";

type Obj = Record<string, unknown>;
const HERE = dirname(fileURLToPath(import.meta.url)), SCRIPT = join(HERE, "..", "scripts", "dojo-publish.mjs");
const dirs: string[] = [];
after(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });
const tmp = (prefix: string): string => { const d = mkdtempSync(join(tmpdir(), prefix)); dirs.push(d); return d; };
const gen = (): KeyObject => generateKeyPairSync("ed25519").privateKey;
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const T0 = Date.UTC(2026, 8, 11, 12); // SYNTHETIC anchor instant, 2026-09-11T12:00:00Z (day 2 from day 1, 2026-09-10)
type Accounts = { wsol: { a: { value: { data: { parsed: { info: { owner: string } } } } } } };
const POOL = (JSON.parse(readFileSync(new URL("./fixtures/collect/accounts.json", import.meta.url), "utf8")) as Accounts).wsol.a.value.data.parsed.info.owner;
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", QUOTE_VAULT = "6KLxyVpYwMGyQJHsvWqFpRk1crEQ79sG3Wi3C1SkZbTW"; // ADR-DOJO-PR-2 D-4
const PYTH = "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"; // the SOL/USD account (ADR-DOJO-PR-2 D-3)

/** An anchor request: seed_anchor and horizon from dojo-seed.mjs --init (horizon 365, ADR-DOJO-PR-3 D-4); W = 60 and u = 1..5
 *  (decisions 236, 234), O_1 = 60 000 000 000 (decision 236), one dollar of dust (225 (7)), K = 4 (248); Token-2022, the Pool (owner of
 *  its wSOL account in fixtures/collect/), its quote vault and the Pyth account. */
function request(): Obj {
  const seed = initSeed(join(tmp("dojo-p-seed-"), "seed"), 365);
  return { ...seed, mint: MINT, program: TOKEN_2022, k_reads: 4, validation_days: 60, tier_units: ["1", "2", "3", "4", "5"],
    objective_unit_microusd_days: "60000000000", tier_windows: [60, 60, 60, 60, 180], price_window_days: 7, pool: POOL,
    pool_quote_vault: QUOTE_VAULT, sol_usd_source: PYTH, dust_threshold_microusd: "1000000", read_rule: { ...READ_RULE } };
}
const verify = (s: string, keyring: unknown) => verifyDojoServed({ source: dirSource(join(s, "public")), keyring });
/** JSON of a text; an unparsable text reads {unparsable: <text>}: a corrupt output fails an assertion, never the test body. */
const json = (t: string): Obj => { try { return JSON.parse(t) as Obj; } catch { return { unparsable: t }; } };
const served = (s: string): Obj => json(readFileSync(join(s, "public", "dojo", "pubkey.json"), "utf8"));
const linesOf = (p: string): Obj[] => readFileSync(p, "utf8").trimEnd().split("\n").map(json);
function refuses(f: () => unknown, code: string): void { assert.throws(f, (e: unknown) => e instanceof DojoPublishError && e.code === code, code); }
/** Runs f, which must not throw: an unexpected refusal fails an assertion, never the test body. */
function ok<T>(f: () => T): T { let r: T | undefined; assert.doesNotThrow(() => { r = f(); }); return r as T; }
/** The asynchronous forms, for publishDay, which awaits the verifier (D-C1): f resolves; f rejects with a DojoPublishError of that code. */
async function okA<T>(f: () => Promise<T>): Promise<T> { let r: T | undefined; await assert.doesNotReject(async () => { r = await f(); }); return r as T; }
async function refusesA(f: () => Promise<unknown>, code: string): Promise<void> {
  await assert.rejects(async () => f(), (e: unknown) => e instanceof DojoPublishError && e.code === code, code); }
/** Every file under dir with its sha256, relative and sorted: the witness that nothing was written. */
function files(dir: string): string[] {
  const out: string[] = [], walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p); else out.push(`${relative(dir, p).split(sep).join("/")} ${sha(readFileSync(p))}`);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out.sort();
}
function cli(args: string[], creds?: string, cwd?: string): { status: number | null; stdout: string; stderr: string } {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.CREDENTIALS_DIRECTORY;
  if (creds !== undefined) env.CREDENTIALS_DIRECTORY = creds;
  return spawnSync(process.execPath, [SCRIPT, ...args], { env, encoding: "utf8", ...(cwd === undefined ? {} : { cwd }) });
}
function credsOf(keys: Readonly<Record<string, KeyObject>>): string {
  const d = tmp("dojo-p-cred-");
  for (const [name, k] of Object.entries(keys)) writeFileSync(join(d, name), k.export({ type: "pkcs8", format: "pem" }));
  return d;
}
const pk = (k: KeyObject): Obj => ({ kty: "OKP", crv: "Ed25519", x: createPublicKey(k).export({ format: "jwk" }).x });

// killer: apps/dojo/scripts/dojo-publish.mjs:164 SDL "closed keys" -> ""
test("dojo_publish_anchor_carries_the_read_rule", async () => {
  const s = tmp("dojo-p-anchor-"), k = gen(), req = request();
  const r = ok(() => publishAnchor({ stateDir: s, key: k, request: req, clock: () => T0 }));
  assert.deepEqual([r.status, r.seq, r.key_id, r.published_at], ["anchored", 1, keyIdOf(k), new Date(T0).toISOString()]);
  const [a] = linesOf(join(s, "public", "timeline.jsonl"));
  const common = ["schema", "seq", "kind", "prev_line_hash", "key_id", "published_at", "sig"];
  assert.deepEqual(Object.keys(a ?? {}).sort(), [...ANCHOR_KEYS, ...common].sort(), "the anchor's closed keys (mere D-8, tenth pli)");
  assert.deepEqual([a?.kind, a?.read_rule, a?.seed_anchor, a?.horizon], ["anchor", READ_RULE, req.seed_anchor, 365], "read_rule and seed chain");
  const v = await verify(s, dojoKeyringOf([[k, 1]]));
  assert.deepEqual([v.ok, v.ok && v.status, v.ok && v.head], [true, "consistent_with_supplied_keyring", null], JSON.stringify(v));
  const e = tmp("dojo-p-refused-"), bad: [Obj, string][] = [
    [{ ...req, reference_price: "1" }, "anchor_malformed"], // M-E2: a price field is never signed
    [{ ...req, sol_usd_source: "helius" }, "anchor_malformed"], // M-E3: an operator label is never served
    ...["mint", "program", "pool", "pool_quote_vault"].map((f): [Obj, string] => [{ ...req, [f]: "helius" }, "anchor_malformed"]), // Q-G1-4: each account
    [{ ...req, objective_unit_microusd_days: `1${"0".repeat(1 << 20)}` }, "line_refused"], // a line over MAX_LINE_BYTES is never committed
    [Object.fromEntries(Object.entries(req).filter(([x]) => x !== "read_rule")), "anchor_malformed"],
    [{ ...req, read_rule: { ...READ_RULE, read_offset_s: 901 } }, "anchor_malformed"], // D-C2: the collector's READ_RULE only (TB-17)
    [{ ...req, read_rule: { ...READ_RULE, beacon_period_ms: 3000 } }, "anchor_malformed"],
    [{ ...req, read_rule: { ...READ_RULE, beacon_period: 30 } }, "anchor_malformed"], // P1: a form the walker admits, never the collector's
    [{ ...req, k_reads: 256 }, "line_refused"], [{ ...req, price_window_days: 6 }, "line_refused"]];
  for (const [q, code] of bad) refuses(() => publishAnchor({ stateDir: e, key: k, request: q, clock: () => T0 }), code);
  assert.throws(() => publishAnchor({ stateDir: e, key: k, request: { ...req, read_rule: { ...READ_RULE, read_offset_s: 901 } }, clock: () => T0 }),
    (x: unknown) => x instanceof DojoPublishError && x.code === "anchor_malformed" && x.detail === "read_rule", "C-G2-4: D-C2 names read_rule");
  assert.deepEqual(readdirSync(e), [], "a refused request writes nothing, not even keyring.json");
  const c = tmp("dojo-p-cli-"), q = join(tmp("dojo-p-req-"), "anchor.json"), creds = credsOf({ "dojo-signing-key": k });
  writeFileSync(q, canonical(req)); // C-G2-2: the request in canonical JSON, every key sorted, read_rule's too (D-C2 compares that form)
  const no = cli(["--anchor", q, "--state", c]), near = cli(["--anchor", q, "--state", c], relative(dirname(creds), creds), dirname(creds));
  assert.deepEqual([near.status, /^dojo\/publish: signing_key_missing: \$CREDENTIALS_DIRECTORY is not an absolute path/.test(near.stderr)], [1, true],
    "a relative $CREDENTIALS_DIRECTORY is never read, even when it names the key (systemd sets an absolute one)");
  assert.deepEqual([no.status, no.stdout, /^dojo\/publish: signing_key_missing: /.test(no.stderr)], [1, "", true], "the key comes from its credential");
  const yes = cli(["--anchor", q, "--state", c], creds), out = json(yes.stdout);
  assert.deepEqual([yes.status, out.status, out.key_id], [0, "anchored", keyIdOf(k)], yes.stderr);
  assert.equal((await verify(c, served(c))).ok, true, "the CLI's tree verifies under its served keyring");
  const big = join(tmp("dojo-p-req-"), "big.json");
  writeFileSync(big, JSON.stringify({ ...req, dust_threshold_microusd: "1".repeat(1 << 20) }));
  const over = cli(["--anchor", big, "--state", tmp("dojo-p-cli-")], creds);
  assert.deepEqual([over.status, /anchor_malformed: the request file is absent or too large/.test(over.stderr)], [1, true], "a 1 MiB request: never read");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:325 CONST "wx" -> "w"
test("dojo_generate_key_prints_no_private_member", (t) => {
  const p = join(tmp("dojo-p-keygen-"), "signing-key.pem"), run = () => cli(["--generate-key", p]);
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  const out = json(first.stdout) as { key_id?: string; public_key?: Obj };
  assert.deepEqual([Object.keys(out).sort(), Object.keys(out.public_key ?? {}).sort()], [["key_id", "public_key"], ["crv", "kty", "x"]], "public members only");
  assert.ok(!/"d"|PRIVATE/.test(first.stdout + first.stderr), "nothing private is printed");
  const key = createPrivateKey(readFileSync(p));
  assert.deepEqual([key.asymmetricKeyType, keyIdOf(key), out.public_key], ["ed25519", out.key_id, pk(key)], "the file holds the printed key");
  const before = sha(readFileSync(p)), again = run();
  assert.deepEqual([again.status, again.stdout, /^dojo\/publish: key_file_exists: /.test(again.stderr)], [1, "", true]);
  assert.equal(sha(readFileSync(p)), before, "the existing key file is untouched (M-E10)");
  for (const a of [["--generate-key"], ["--generate-key", p, "--state", p], ["--generate-key", p, "--broken"]]) assert.equal(cli(a).status, 1, a.join(" "));
  if (process.platform === "win32") t.diagnostic("POSIX-ONLY-0600: mode 0600 not asserted under win32 (no POSIX mode bits; as bell-keys.test.ts)");
  else assert.equal(statSync(p).mode & 0o777, 0o600);
});

// killer: apps/dojo/scripts/dojo-publish.mjs:311 CONST "active" -> "lost"
test("dojo_publish_rotation_and_revocation_follow_bell", async () => {
  const [K1, K2, K3, K4] = [gen(), gen(), gen(), gen()], [id1, id2, id3, id4] = [K1, K2, K3, K4].map((k) => keyIdOf(k)) as [string, string, string, string];
  const s = tmp("dojo-p-keys-"), at = (dt: number) => (): number => T0 + dt;
  ok(() => publishAnchor({ stateDir: s, key: K1, request: request(), clock: at(0) })); // seq 1
  refuses(() => rotateKey({ stateDir: tmp("dojo-p-none-"), oldKey: K1, newKey: K2, clock: at(1) }), "no_timeline");
  refuses(() => rotateKey({ stateDir: s, oldKey: K2, newKey: K3, clock: at(1) }), "signing_key_not_in_keyring");
  assert.equal(ok(() => rotateKey({ stateDir: s, oldKey: K1, newKey: K2, clock: at(1) })).key_id, id2, "seq 2: cross-signed by K1 and K2");
  refuses(() => rotateKey({ stateDir: s, oldKey: K2, newKey: K1, clock: at(2) }), "key_already_in_keyring");
  refuses(() => publishAnchor({ stateDir: s, key: K1, request: request(), clock: at(2) }), "signing_key_not_in_keyring"); // a retired key signs nothing
  const ra = tmp("dojo-p-reanchor-"); // a re-anchor by the active key after a rotation: the genesis key of keyring.json stays
  ok(() => publishAnchor({ stateDir: ra, key: K1, request: request(), clock: at(0) }));
  ok(() => rotateKey({ stateDir: ra, oldKey: K1, newKey: K2, clock: at(1) }));
  assert.equal(ok(() => publishAnchor({ stateDir: ra, key: K2, request: request(), clock: at(2) })).seq, 3, "a re-anchor by the active key");
  ok(() => rotateKey({ stateDir: ra, oldKey: K2, newKey: K3, clock: at(3) })); // seq 4: K2 signed seq 3 and seq 4
  refuses(() => revokeKey({ stateDir: ra, key: K3, revokedKeyId: id2, revokedFromSeq: 2, clock: at(4) }), "revocation_invalid"); // below K2 lines
  for (const [id, from] of [[id2, 2], [id1, 0], [id1, 4], [id4, 2]] as const) {
    refuses(() => revokeKey({ stateDir: s, key: K2, revokedKeyId: id, revokedFromSeq: from, clock: at(2) }), "revocation_invalid");
  }
  const v = tmp("dojo-p-void-"); // from-seq 1 or 2 would void a committed line of K1, which the reader refuses (F-1): refused, nothing written
  ok(() => publishAnchor({ stateDir: v, key: K1, request: request(), clock: at(0) }));
  ok(() => rotateKey({ stateDir: v, oldKey: K1, newKey: K2, clock: at(1) }));
  const kept = files(v);
  for (const from of [1, 2]) refuses(() => revokeKey({ stateDir: v, key: K2, revokedKeyId: id1, revokedFromSeq: from, clock: at(2) }), "revocation_invalid");
  assert.deepEqual(files(v), kept, "a revocation that voids a committed line writes nothing");
  const kv = served(v) as { keys: Obj[] }, kRev = { ...kv, keys: kv.keys.map((k) => (k.key_id === id1 ? { ...k, revoked_from_seq: 2 } : k)) };
  assert.deepEqual(await verify(v, kRev), { ok: false, reason: "key_not_active", seq: 2, day: null,
    detail: "voided_lines 2: signed by a key revoked at its seq" }, "the key revoked is refused from --from-seq (Review Focus)");
  ok(() => revokeKey({ stateDir: s, key: K2, revokedKeyId: id1, revokedFromSeq: 3, clock: at(2) })); // seq 3: no line of K1 from seq 3
  assert.equal(ok(() => rotateKey({ stateDir: s, newKey: K3, clock: at(3) })).key_id, id3, "seq 4: K2 lost, continuity broken, signed by K3 alone");
  assert.equal(linesOf(join(s, "timeline.jsonl"))[3]?.continuity, "broken");
  const creds = credsOf({ "dojo-signing-key": K3, "dojo-signing-key-new": K4 }), keyFiles = files(creds);
  for (const a of [["--rotate", "--revoke", id1, "--from-seq", "1"], ["--revoke", id1, "--from-seq", "1", "--broken"], ["--rotate", "--state"],
    ["--anchor", "--state", s], ["--revoke", id1, "--state", s], ["--rotate", "--state", s, "--extra"], ["--broken", "--state", s],
    ["--history", s, "--state", s], ["--history", s, "--inbox", s, "--anchor", s, "--state", s]]) { // B-1: --history takes --inbox, one mode
    const u = cli(a, creds);
    assert.deepEqual([u.status, u.stdout, /^dojo\/publish: usage: /.test(u.stderr)], [1, "", true], a.join(" "));
  }
  const rot = cli(["--rotate", "--state", s], creds);
  assert.deepEqual([rot.status, json(rot.stdout).key_id], [0, id4], rot.stderr);
  assert.deepEqual(files(creds), keyFiles, "--rotate writes no key file (M-E10)");
  const rev = cli(["--revoke", id3, "--from-seq", "6", "--state", s], credsOf({ "dojo-signing-key": K4 }));
  assert.equal(rev.status, 0, rev.stderr);
  assert.deepEqual(served(s), { schema: "dojo-keyring-v1", keys: [
    { key_id: id1, public_key: pk(K1), valid_from_seq: 1, valid_to_seq: 2, revoked_from_seq: 3 },
    { key_id: id2, public_key: pk(K2), valid_from_seq: 2, valid_to_seq: 3 }, { key_id: id3, public_key: pk(K3), valid_from_seq: 4, valid_to_seq: 5,
      revoked_from_seq: 6 }, { key_id: id4, public_key: pk(K4), valid_from_seq: 5 }] }, "Bell's derived schedule, served in dojo-keyring-v1");
  const r = await verify(s, served(s));
  assert.deepEqual([r.ok, r.ok && r.active_key_id, r.ok && r.voided_lines, r.ok && r.seq], [true, id4, [], 6], JSON.stringify(r));
});

// killer: apps/dojo/scripts/dojo-publish.mjs:16 CONST "import { fileURLToPath }" -> "import \"node:dns\"; import { fileURLToPath }"
test("dojo_publish_imports_no_network_module", () => {
  const ALLOW = new Set(["node:crypto", "node:fs", "node:path", "node:url"]), seen = new Set<string>(), stack = [SCRIPT];
  const FORBIDDEN = [/node:https?\b/, /node:net\b/, /node:tls\b/, /node:dns\b/, /node:http2\b/, /node:dgram\b/, /child_process/, /\bfetch\s*\(/,
    /\bimport\s*\(/, /\brequire\s*\(/, /createRequire/, /\bundici\b/, /\bWebSocket\b/]; // calque of bell_scripts_import_allowlist_no_network
  for (let f = stack.pop(); f !== undefined; f = stack.pop()) {
    if (seen.has(f)) continue;
    seen.add(f);
    const text = readFileSync(f, "utf8"), specs = [...text.matchAll(/\b(?:from|import)\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1] ?? "");
    assert.ok(specs.length >= 1 || !text.includes("import"), `${f}: its imports are parsed (non-vacuity of every file holding the word import)`);
    for (const x of specs) if (x.startsWith(".")) stack.push(join(dirname(f), x)); else assert.ok(ALLOW.has(x), `${f}: import '${x}' outside the allowlist`);
    for (const re of FORBIDDEN) assert.equal(re.test(text), false, `${f}: forbidden network or dynamic-load token ${String(re)}`);
  }
  const root = join(HERE, "..", "..", "..");
  assert.deepEqual([...seen].map((f) => relative(root, f).split(sep).join("/")).sort(), ["apps/bell/scripts/bell-chain.mjs",
    "apps/dojo/scripts/dojo-chain.mjs", "apps/dojo/scripts/dojo-core.mjs", "apps/dojo/scripts/dojo-publish.mjs", "apps/dojo/scripts/dojo-verify.mjs",
    "apps/dojo/src/bundle.ts", "apps/dojo/src/dojo-methods.ts", "apps/dojo/src/layout.ts", "apps/dojo/src/reading.ts"],
    "the whole import closure: the real reader of the bundle (FM-1.1), the real verifier's core (D-C1) and READ_RULE (D-C2), no copy");
  const cli = join(HERE, "..", "scripts", "dojo-verify-cli.mjs"); // the verifier's CLI and URL transport (PR-1b-5b): refused if it entered
  assert.deepEqual([seen.has(cli), FORBIDDEN.some((re) => re.test(readFileSync(cli, "utf8")))], [false, true], "dojo-verify-cli.mjs holds fetch(");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:65 CONST "staging" -> "public/staging"
test("dojo_publish_state_is_outside_public", () => {
  const s = tmp("dojo-p-state-"), [K1, K2, K3] = [gen(), gen(), gen()];
  const log: string[] = [], jd = tmp("dojo-p-journal-"), J = { ...DURABLE_FS, // the durable writes, journaled through the seam
    openSync: (p: string, f: string): number => { log.push(`open ${basename(p)} ${f}`); return DURABLE_FS.openSync(p, f); },
    writeSync: (fd: number, d: string): void => { log.push("write"); DURABLE_FS.writeSync(fd, d); },
    fsyncSync: (fd: number): void => { log.push("fsync"); DURABLE_FS.fsyncSync(fd); },
    closeSync: (fd: number): void => { log.push("close"); DURABLE_FS.closeSync(fd); },
    renameSync: (a: string, b: string): void => { log.push(`rename ${basename(b)}`); DURABLE_FS.renameSync(a, b); },
    fsyncDir: (d: string): void => { log.push(`fsyncdir ${basename(d)}`); DURABLE_FS.fsyncDir(d); } };
  ok(() => publishAnchor({ stateDir: jd, key: K1, request: request(), clock: () => T0, fs: J }));
  const krAt = log.indexOf("rename keyring.json"), appendAt = log.indexOf("open timeline.jsonl a");
  log.length = 0;
  ok(() => rotateKey({ stateDir: jd, oldKey: K1, newKey: K2, clock: () => T0 + 1, fs: J }));
  assert.deepEqual([krAt >= 0 && krAt < appendAt, log.slice(0, 6)], [true, ["open timeline.jsonl a", "write", "fsync", "close", `fsyncdir ${basename(jd)}`,
    "open tmp-timeline.jsonl w"]], "keyring.json durable before the first line; each line written, fsynced, closed, its directory fsynced, then public/");
  ok(() => publishAnchor({ stateDir: s, key: K1, request: request(), clock: () => T0 }));
  ok(() => rotateKey({ stateDir: s, oldKey: K1, newKey: K2, clock: () => T0 + 1 }));
  assert.deepEqual([readdirSync(s).sort(), readdirSync(join(s, "public")).sort()], [["keyring.json", "public", "staging", "timeline.jsonl"],
    ["dojo", "timeline.jsonl"]], "the private timeline, keyring.json and staging/ beside public/, never under it (M-E9)");
  assert.deepEqual([files(join(s, "public")).map((f) => f.split(" ")[0]), readdirSync(join(s, "staging"))], [["dojo/pubkey.json", "timeline.jsonl"], []]);
  const kr = json(readFileSync(join(s, "keyring.json"), "utf8")) as { keys?: Obj[] };
  assert.deepEqual((kr.keys ?? []).map((k) => k.key_id), [keyIdOf(K1)], "keyring.json holds the genesis key only; the rest derives from the key lines");
  const priv = join(s, "timeline.jsonl"), text = readFileSync(priv, "utf8");
  assert.equal(readFileSync(join(s, "public", "timeline.jsonl"), "utf8"), text, "public/timeline.jsonl = the private timeline");
  appendFileSync(priv, (text.split("\n")[1] ?? "").slice(0, 40)); // SYNTHETIC crash inside an append: a torn tail
  ok(() => rotateKey({ stateDir: s, oldKey: K2, newKey: K3, clock: () => T0 + 2 }));
  assert.deepEqual(linesOf(priv).map((l) => l.seq), [1, 2, 3], "the torn tail is cut at the next start; the next line is seq 3");
  const pubTl = join(s, "public", "timeline.jsonl"), served0 = readFileSync(pubTl, "utf8");
  writeFileSync(pubTl, `${served0}{}\n`); // a served line that the private timeline does not hold
  refuses(() => rotateKey({ stateDir: s, oldKey: K3, newKey: gen(), clock: () => T0 + 3 }), "existing_timeline_corrupt");
  writeFileSync(pubTl, served0);
  const good = readFileSync(priv, "utf8"), cut = files(s); // line 3 altered and not yet served (public/ = line 1): refused, never served
  writeFileSync(pubTl, `${good.split("\n")[0] ?? ""}\n`);
  writeFileSync(priv, good.replace('"seq":3,', '"seq":3,"x":1,'));
  refuses(() => rotateKey({ stateDir: s, oldKey: K3, newKey: gen(), clock: () => T0 + 3 }), "existing_timeline_corrupt");
  assert.equal(readFileSync(pubTl, "utf8"), `${good.split("\n")[0] ?? ""}\n`, "the start-up repair never serves an invalid line");
  writeFileSync(priv, good);
  writeFileSync(pubTl, served0);
  assert.deepEqual(files(s), cut);
  writeFileSync(priv, readFileSync(priv, "utf8").replace("\"k_reads\":4", "\"k_reads\":5")); // a private line altered after its signature
  const before = files(s);
  refuses(() => rotateKey({ stateDir: s, oldKey: K3, newKey: gen(), clock: () => T0 + 3 }), "existing_timeline_corrupt");
  assert.deepEqual(files(s), before, "a corrupt state is refused with nothing written");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:170 SDL "if (last?.kind === " -> ""
test("dojo_publish_anchor_replayed_after_a_stop_adds_no_line", () => {
  const s = tmp("dojo-p-replay-"), k = gen(), req = request(), tl = join(s, "public", "timeline.jsonl"), priv = join(s, "timeline.jsonl");
  const stop = { ...DURABLE_FS, fsyncDir: (d: string): void => { if (existsSync(priv)) throw new Error("SYNTHETIC stop"); DURABLE_FS.fsyncDir(d); } };
  assert.throws(() => publishAnchor({ stateDir: s, key: k, request: req, clock: () => T0, fs: stop }), /SYNTHETIC stop/); // committed, not yet served
  const again = ok(() => publishAnchor({ stateDir: s, key: k, request: { ...req }, clock: () => T0 + 1 }));
  assert.deepEqual([again.seq, again.published_at, linesOf(tl).length], [1, new Date(T0).toISOString(), 1], "the same request replayed: its anchor, no line");
  assert.equal(ok(() => publishAnchor({ stateDir: s, key: k, request: request(), clock: () => T0 + 2 })).seq, 2, "another request: a re-anchor, as before");
  assert.equal(ok(() => publishAnchor({ stateDir: s, key: k, request: req, clock: () => T0 + 3 })).seq, 3, "req after another: a re-anchor");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:337 CONST "^[1-9][0-9]*$" -> "^"
test("dojo_publish_revoke_reads_a_plain_decimal_from_seq", async () => {
  const s = tmp("dojo-p-fromseq-"), [K1, K2] = [gen(), gen()], creds = credsOf({ "dojo-signing-key": K2 });
  ok(() => publishAnchor({ stateDir: s, key: K1, request: request(), clock: () => T0 }));
  ok(() => rotateKey({ stateDir: s, newKey: K2, clock: () => T0 + 1 })); // seq 2: K1 lost, continuity broken, signed by K2 alone
  const kept = files(s), rev = (f: string) => cli(["--revoke", keyIdOf(K1), "--from-seq", f, "--state", s], creds);
  const bad = ["0x3", "3.0", "3e0", "+3", "0b11", "0o3", "03", " 3"].map((f) => [f, rev(f)] as const); // each one reads 3 under Number()
  assert.deepEqual(bad.map(([f, u]) => [f, u.status, /^dojo\/publish: revocation_invalid: --from-seq /.test(u.stderr)]), bad.map(([f]) => [f, 1, true]));
  assert.deepEqual(files(s), kept, "Q-G2-5: a --from-seq outside the plain decimal form is refused, nothing written");
  const lost = rev("2"); // K1 revoked from its broken rotation's seq: no line of K1 from seq 2 (C-G2-1 bounds by key_id): admitted
  assert.deepEqual([lost.status, (await verify(s, served(s))).ok], [0, true], lost.stderr);
});

// ---- part 1b: days of the inbox written by the REAL writers of PR-2-1 and PR-2-2 (readingRecord, writeDayBundle; closeLayout, nextEve)
// in the handoff layout DOJO-HANDOFF-LAYOUT-1 (ADR-DOJO-PR-2 D-7, dated line C-V-1), from the verbatim responses of fixtures/collect/;
// betas and instants SYNTHETIC (betaOf of the signed fixture); the history line and its file stand in for PR-3a-2, their writer.
type Resp = { context: { slot: number }; value: unknown };
const { publishDay } = publisher; // undefined at the base of the lot: every call below is wrapped (ok, refuses, assert.throws), an assertion there
const { publishHistory } = publisher; // PR-3a-2, bound late as publishDay: absent at the base of the lot, every call below is wrapped
const fx = (f: string): Obj => json(readFileSync(new URL(`./fixtures/collect/${f}`, import.meta.url), "utf8"));
const E = fx("enumeration.json") as { a: Resp; b: Resp }, ACC = fx("accounts.json") as Record<"mint" | "pool" | "wsol" | "pyth", { a: Resp; b: Resp }>;
const DAY = 86_400_000, K = 4, X = "Dw76Ydu2svQ9rMWRevhumwjnRdF1dpzSyD1bY7wF3WbW"; // X: the holder of the fixture's account 3tdL
/** The fixture's Pyth account at a SYNTHETIC publish_time (little-endian i64 at byte 93, reading.ts decodePyth). */
function pythAt(sec: number): Resp {
  const r = structuredClone(ACC.pyth.a) as { context: { slot: number }; value: { data: [string, string] } }, b = Buffer.from(r.value.data[0], "base64");
  new DataView(b.buffer, b.byteOffset, b.byteLength).setBigInt64(93, BigInt(sec), true); // little-endian
  r.value.data = [b.toString("base64"), "base64"];
  return r;
}
/** The fixture's mint with SYNTHETIC decimals 9: checkMint refuses it (mint_decimals), the day abstains (mint_changed) with its reads. */
function mintChanged(): Resp {
  const r = structuredClone(ACC.mint.a) as { context: { slot: number }; value: { data: { parsed: { info: { decimals: number } } } } };
  r.value.data.parsed.info.decimals = 9;
  return r;
}
interface World { s: string; inbox: string; key: KeyObject; secret: string; chain: number; A: number; eve: Eve; hl: Obj[] }
/** Stand-in for PR-3a-2 (the history line's writer): a history line signed after the committed timeline (mere D-18; the walker's day 1,
 *  2026-09-10) and its immutable file in public/history/. */
function withHistory(s: string, key: KeyObject, lastDay: number, hl: readonly Obj[]): void {
  const priv = join(s, "timeline.jsonl"), prior = linesOf(priv), text = hl.map((l) => `${canonical(l)}\n`).join(""), h = sha(text);
  mkdirSync(join(s, "public", "history"), { recursive: true });
  writeFileSync(join(s, "public", "history", `${h}.jsonl`), text);
  const line: Obj = { schema: "dojo-timeline-v1", seq: prior.length + 1, kind: "history", prev_line_hash: lineHash(prior.at(-1)), key_id: keyIdOf(key),
    published_at: new Date((lastDay + 1) * DAY + 600_000).toISOString(), history_first_day: "2026-09-10", history_last_day: dateOf(lastDay),
    history_sha256: h, history_lines_count: hl.length, history_root: rootOf(hl.map((l) => canonical(l))) };
  appendFileSync(priv, `${canonical({ ...line, sig: signLine(line, key) })}\n`);
  writeFileSync(join(s, "public", "timeline.jsonl"), readFileSync(priv)); // served as its writer would: public/ = the private timeline
}
/** An anchored state (day A = 2026-09-11), its seed chain from dojo-seed.mjs and, unless `history` is false, the history line of days 1 to A:
 *  X holds 40 000 000 000 000 (sold down to its enumerated amount on A + 1), ADDR.A holds 5 000 000 (no account on the read days: a
 *  concordant 0, C-1); the Eve of A + 1 = those two addresses (Q-2). SYNTHETIC values. */
function world(o: { horizon?: number; chain?: number; history?: boolean } = {}): World {
  const s = tmp("dojo-p-day-"), inbox = tmp("dojo-p-inbox-"), key = gen(), file = join(tmp("dojo-p-seed-"), "seed"), A = Math.floor(T0 / DAY);
  const horizon = o.horizon ?? 365, chain = o.chain ?? horizon, seed = initSeed(file, chain), secret = readFileSync(file, "utf8").trim();
  ok(() => publishAnchor({ stateDir: s, key, request: { ...request(), seed_anchor: seed.seed_anchor, horizon }, clock: () => T0 }));
  const hl = [{ address: X, day_value: "40000000000000" }, { address: ADDR.A, day_value: "5000000" }]
    .map((x) => ({ ...x, class: ownerClass(x.address), day: dateOf(A) })).sort((x, y) => Buffer.compare(Buffer.from(x.address), Buffer.from(y.address)));
  if (o.history !== false) withHistory(s, key, A, hl);
  return { s, inbox, key, secret, chain, A, hl, eve: { addresses: hl.map((x) => x.address), accounts: [] } };
}
interface Opt { day?: number; seed?: string; program?: string; token?: string; k?: number; sol?: boolean; mint?: boolean; beacon?: boolean; inbox?: string;
  offset?: number } // offset: the read_offset_s of the day's instants (T-1: another one than the anchor's, a collector misconfigured)
/** Writes bundles/<d>/ with the real writers and returns the Eve of d + 1 (nextEve of the layout reader's day). `day` misplaces the bundle
 *  of another day under d; `seed`, `program`, `token` (the bundle's mint) and `k` replace the chain's and the anchor's; `sol` false = a
 *  Pyth fault all day (sigma null); `mint` false = the mint changed (abstained, reads kept); `beacon` false = a day without beacon. */
function writeDay(w: World, d: number, eve: Eve, o: Opt = {}): Eve {
  const dd = o.day ?? d, day = dateOf(dd), seed = o.seed ?? daySeed(w.secret, w.chain, dd - w.A), beta = betaOf(dd), T = dd * 86_400;
  const dir = join(o.inbox ?? w.inbox, dateOf(d)), anchor = { mint: MINT, pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_max_age_s: 165 };
  const mint = o.mint === false ? { a: mintChanged(), b: mintChanged() } : ACC.mint, off = o.offset ?? READ_RULE.read_offset_s;
  const recs = o.beacon === false ? [] : readInstants(seed, beta, o.k ?? K, T, off).map((t, j) => readingRecord({ day, i: j + 1, instant: t, anchor, eve,
    read_at: new Date((t + 10) * 1000).toISOString(), enumeration: E, mint: j === 0 ? mint : null, pool: ACC.pool, wsol: ACC.wsol,
    pyth: o.sol === false ? { a: null, b: null } : { a: pythAt(t - 10), b: pythAt(t - 10) } }));
  const { bytes } = writeDayBundle({ day, seed, beacon: o.beacon === false ? null : { round: roundOf(dd), signature: beta },
    read_rule: { ...READ_RULE, read_offset_s: off },
    k_reads: o.k ?? K, mint: o.token ?? MINT, program: o.program ?? TOKEN_2022, decimals: 6, records: recs, eve }, T + 2 * 86_400);
  mkdirSync(join(dir, "readings"), { recursive: true });
  recs.forEach((r, j) => { writeFileSync(join(dir, "readings", `${j + 1}.json`), recordBytes(r)); });
  writeFileSync(join(dir, "eve.json"), `${canonical(eve)}\n`);
  closeLayout(dir, [], recs.length, bytes);
  const L = readDayLayout(dir);
  return nextEve(L.bundle, L.records, L.eve);
}
const slot = (d: number): (() => number) => () => (d + 1) * DAY + 1_800_000; // 00:30 UTC of d + 1, the first slot of the publish timer (D-5)
const publish = (w: World, d: number, inbox = w.inbox) => okA(() => publishDay({ inboxDir: inbox, stateDir: w.s, key: w.key, clock: slot(d) }));
const versionOf = (r: Awaited<ReturnType<typeof publish>>): number | null => (r.status === "published" ? r.price_version : -1);
const linesAt = (w: World, l: Obj | undefined): Obj[] => linesOf(join(w.s, "public", "lines", `${String(l?.lines_sha256)}.jsonl`));
/** Rewrites one file of a day and its sha256 in publish/SHA256SUMS, so that the layout's sums agree and the deeper reader judges. */
function resum(dir: string, rel: string, f: (text: string) => string): void {
  const old = readFileSync(join(dir, ...rel.split("/")), "utf8"), text = f(old), p = join(dir, "publish", "SHA256SUMS");
  writeFileSync(join(dir, ...rel.split("/")), text);
  writeFileSync(p, readFileSync(p, "utf8").replace(`${sha(old)}  ${rel}`, `${sha(text)}  ${rel}`));
}

// killer: apps/dojo/scripts/dojo-publish.mjs:233 CONST "reads: b.reads," -> "reads: b.reads.slice(1),"
test("dojo_publish_snapshot_carries_beacon_and_reads", async () => {
  const w = world(), d = w.A + 1;
  writeDay(w, d + 1, writeDay(w, d, w.eve), { beacon: false }); // A + 2: a day without beacon (ADR-DOJO-PR-2 D-8, Q-5)
  await publish(w, d);
  await publish(w, d + 1);
  const [s1, s2] = linesOf(join(w.s, "timeline.jsonl")).filter((l) => l.kind === "snapshot"), b1 = readDayLayout(join(w.inbox, dateOf(d))).bundle;
  assert.deepEqual([s1?.day, s1?.seed, s1?.beacon, s1?.reads, s1?.status, s1?.mint, s1?.decimals], [b1.day, b1.seed, b1.beacon, b1.reads, "counted", MINT, 6]);
  assert.deepEqual([s2?.beacon, s2?.reads, s2?.status], [null, [], "abstained"], "a day without beacon: abstained, no reads");
  const [l1, l2] = [linesAt(w, s1), linesAt(w, s2)], row = (a: unknown) => b1.addresses?.find((x) => x.address === a)?.reads;
  assert.ok(l1.length > 0 && l1.every((l) => canonical(l.reads) === canonical(row(l.address))), "each line carries the bundle's K composed reads");
  assert.deepEqual(l2.map((l) => [l.address, l.reads, l.day_value]), l1.filter((l) => l.class === "holder" && canonical(l.lots) !== "[]")
    .map((l) => [l.address, [null, null, null, null], null]), "an abstained day: a line per pile, its reads null, a missing day (D-2)");
  const v = await verify(w.s, dojoKeyringOf([[w.key, 1]]));
  assert.deepEqual([v.ok, v.ok && v.snapshots], [true, 2], JSON.stringify(v));
});

// killer: apps/dojo/scripts/dojo-publish.mjs:253 ROR "!==" -> "==="
test("dojo_publish_price_version_needs_seven_valid_days", async () => {
  const w = world(), got: (number | null)[] = [];
  let eve = w.eve;
  for (let j = 1; j <= 18; j++) { eve = writeDay(w, w.A + j, eve, { sol: j !== 3, mint: j !== 4 }); got.push(versionOf(await publish(w, w.A + j))); }
  assert.deepEqual(got, [null, null, null, null, null, null, null, null, null, null, 1, null, null, null, null, null, null, 2],
    "day 3 without SOL rate (counted, sigma null), day 4 abstained (mint changed, prices kept): the first seven valid days are 5 to 11 (M-E7)");
  const pv = linesOf(join(w.s, "timeline.jsonl")).filter((l) => l.kind === "price_version").map((l) => [l.window_first_day, l.effective_day]);
  assert.deepEqual(pv, [[dateOf(w.A + 5), dateOf(w.A + 12)], [dateOf(w.A + 12), dateOf(w.A + 19)]],
    "never on history days; in force the next day; fourteen valid days: the second window starts at exactly the first + 7 (C-G2-3)");
  const v = await verify(w.s, dojoKeyringOf([[w.key, 1]]));
  assert.equal(v.ok, true, JSON.stringify(v));
});

// killer: apps/dojo/scripts/dojo-publish.mjs:147 SDL "for (const [rel, text] of immutables)" -> ""
test("dojo_publish_writes_immutables_before_the_line", async () => {
  const w = world(), d = w.A + 1, log: string[] = [], rel = (p: string): string => relative(w.s, p).split(sep).join("/");
  const eve = writeDay(w, d, w.eve);
  const spy: typeof DURABLE_FS = { ...DURABLE_FS, openSync: (p, f) => { log.push(`open ${rel(p)} ${f}`); return DURABLE_FS.openSync(p, f); },
    renameSync: (a, b) => { log.push(`rename ${rel(b)}`); DURABLE_FS.renameSync(a, b); },
    fsyncDir: (x) => { log.push(`fsyncdir ${rel(x)}`); DURABLE_FS.fsyncDir(x); } };
  const crash: typeof spy = { ...spy, openSync: (p, f) => { if (f === "a") throw new Error("SYNTHETIC crash at the append"); return spy.openSync(p, f); } };
  const before = files(join(w.s, "public")), tl = readFileSync(join(w.s, "timeline.jsonl"), "utf8");
  await assert.rejects(async () => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(d), fs: crash }), /SYNTHETIC crash/);
  assert.deepEqual([files(join(w.s, "public")), readFileSync(join(w.s, "timeline.jsonl"), "utf8")], [before, tl], "a crash before the line: nothing served");
  log.length = 0;
  const r = await okA(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(d), fs: spy }));
  const h = r.status === "published" ? r.lines_sha256 : "", i = log.indexOf(`rename staging/lines/${h}.jsonl`), j = log.indexOf("open timeline.jsonl a");
  assert.ok(i >= 0 && log[i + 1] === "fsyncdir staging/lines" && i < j, `the immutable is durable before its line (M-E1): ${log.join(" | ")}`);
  assert.ok(log.indexOf(`rename public/lines/${h}.jsonl`) > j, "served after the commit point");
  writeDay(w, d + 1, eve); // day d + 1: a served immutable altered is refused; a stop past the commit point is repaired at the next start
  const f = join(w.s, "public", "lines", `${h}.jsonl`), kept = readFileSync(f), next = { inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(d + 1) };
  writeFileSync(f, kept.toString("utf8").replace('"day_value":"', '"day_value":"1')); // still JSON: only its sha256 tells
  await refusesA(() => publishDay(next), "existing_timeline_corrupt");
  writeFileSync(f, kept);
  const stop: typeof DURABLE_FS = { ...DURABLE_FS, renameSync: (a, b) => {
    if (rel(b).startsWith("public/lines/")) throw new Error("SYNTHETIC stop past the commit point"); DURABLE_FS.renameSync(a, b); } };
  await assert.rejects(async () => publishDay({ ...next, fs: stop }), /SYNTHETIC stop/);
  const stg = join(w.s, "staging", "lines", `${String(linesOf(join(w.s, "timeline.jsonl")).at(-1)?.lines_sha256)}.jsonl`), staged = readFileSync(stg);
  writeFileSync(stg, `${staged.toString("utf8")} `); // C-G2-4: a staged immutable altered before the repair is never moved to public/
  await refusesA(() => publishDay(next), "existing_timeline_corrupt");
  writeFileSync(stg, staged);
  assert.equal((await okA(() => publishDay(next))).status, "nothing_to_publish", "the next start serves day d + 1 with its immutable (moved from staging/)");
  assert.equal((await verify(w.s, dojoKeyringOf([[w.key, 1]]))).ok, true, "no served line names a missing file (M-E1 at the repair)");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:481 CONST "refuse(e.code" -> "refuse(\"line_refused\""
test("dojo_publish_refuses_a_malformed_bundle", async () => {
  const w = world(), d = w.A + 1, src = join(w.inbox, dateOf(d)), before = files(w.s);
  writeDay(w, d, w.eve);
  const cases: [(dir: string) => void, string][] = [[(p) => { writeFileSync(join(p, "publish", "extra.json"), "{}"); }, "layout_stray_file"],
    [(p) => { rmSync(join(p, "readings", "2.json")); }, "layout_malformed"], [(p) => { writeFileSync(join(p, "eve.json"), "{}\n"); }, "layout_sha_mismatch"],
    [(p) => { resum(p, "publish/day.json", (t) => t.replace("\"counted\"", " \"counted\"")); }, "bundle_malformed"],
    [(p) => { resum(p, "eve.json", () => "[]\n"); }, "eve_malformed"], [(p) => { resum(p, "readings/1.json", (t) => `${t} `); }, "record_malformed"]];
  for (const [edit, code] of cases) {
    const inbox = tmp("dojo-p-bad-"), dir = join(inbox, dateOf(d));
    cpSync(src, dir, { recursive: true });
    edit(dir);
    await refusesA(() => publishDay({ inboxDir: inbox, stateDir: w.s, key: w.key, clock: slot(d) }), code);
  }
  const lost = world(); // an Eve without ADDR.A, which holds lots at the history's last day: its line would be missing
  writeDay(lost, d, { addresses: [X], accounts: [] });
  await refusesA(() => publishDay({ inboxDir: lost.inbox, stateDir: lost.s, key: lost.key, clock: slot(d) }), "eve_mismatch");
  assert.deepEqual(files(w.s), before, "refused with nothing written");
  assert.equal((await publish(w, d)).status, "published", "the pristine day publishes");
});

// killer: apps/dojo/src/layout.ts:94 CONST ", { records: recs, eve })" -> ")"
test("dojo_publish_reads_the_bundle_with_its_check", async () => {
  const w = world(), d = w.A + 1, dir = join(w.inbox, dateOf(d));
  writeDay(w, d, w.eve);
  mkdirSync(join(dir, "evidence"), { recursive: true });
  writeFileSync(join(dir, "evidence", "plan.json"), "{}"); // never read (ADR-DOJO-PR-2 D-7, dated line C-V-1)
  const bad = tmp("dojo-p-check-"), copy = join(bad, dateOf(d));
  cpSync(dir, copy, { recursive: true });
  resum(copy, "readings/1.json", (t) => {
    const r = readRecord(t);
    return recordBytes({ ...r, read: { ...r.read, accounts_concordant: r.read.accounts_concordant + 1 } });
  });
  await refusesA(() => publishDay({ inboxDir: bad, stateDir: w.s, key: w.key, clock: slot(d) }), "bundle_records_mismatch"); // DOJO-BUNDLE-CHECK-REQUIRED-1
  const fsc = createRequire(import.meta.url)("node:fs") as { readFileSync: (...a: unknown[]) => unknown }, orig = fsc.readFileSync, read: string[] = [];
  fsc.readFileSync = (...a: unknown[]) => {
    if (typeof a[0] === "string" && a[0].startsWith(dir)) read.push(relative(dir, a[0]).split(sep).join("/"));
    return orig(...a);
  };
  syncBuiltinESMExports();
  try { assert.equal((await publish(w, d)).status, "published"); } finally { fsc.readFileSync = orig; syncBuiltinESMExports(); }
  assert.deepEqual(read.sort(), ["eve.json", "publish/SHA256SUMS", "publish/day.json", ...[1, 2, 3, 4].map((i) => `readings/${i}.json`)],
    "exactly the files publish/SHA256SUMS enumerates: never evidence/, never readings/SHA256SUMS");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:210 SDL "refuse(\"seed_outside_anchor_chain\"" -> ""
test("dojo_publish_refuses_a_seed_outside_the_anchor_chain", async () => {
  const w = world(), d = w.A + 1, rehearsal = daySeed(sha("SYNTHETIC rehearsal secret"), 30, 1), before = files(w.s);
  const at = (o: Opt): string => { const inbox = tmp("dojo-p-guard-"); writeDay(w, d, w.eve, { ...o, inbox }); return inbox; };
  const cases: [string, string][] = [[at({ seed: rehearsal }), "seed_outside_anchor_chain"], // M-E6: a rehearsal bundle in the inbox (TB-5)
    [at({ day: w.A, seed: rehearsal }), "day_not_after_anchor"], [at({ day: d + 1 }), "bundle_day_mismatch"],
    [at({ program: MINT }), "bundle_anchor_mismatch"], [at({ token: TOKEN_2022 }), "bundle_anchor_mismatch"], [at({ k: 3 }), "bundle_anchor_mismatch"]];
  for (const [inbox, code] of cases) await refusesA(() => publishDay({ inboxDir: inbox, stateDir: w.s, key: w.key, clock: slot(d) }), code);
  refuses(() => publishAnchor({ stateDir: w.s, key: w.key, request: request(), clock: () => T0 + 1 }), "anchor_on_published_day"); // C-G2-4: history
  assert.deepEqual(files(w.s), before, "refused before any signature: nothing written");
  const early = world({ history: false }); // decision 231: no snapshot before the history line
  writeDay(early, d, early.eve);
  await refusesA(() => publishDay({ inboxDir: early.inbox, stateDir: early.s, key: early.key, clock: slot(d) }), "history_missing");
  const short = world({ horizon: 1, chain: 2 }); // day A + 2 is on the secret's chain but past the anchor's horizon: outside it
  writeDay(short, d + 1, writeDay(short, d, short.eve));
  await publish(short, d);
  await refusesA(() => publishDay({ inboxDir: short.inbox, stateDir: short.s, key: short.key, clock: slot(d + 1) }), "seed_outside_anchor_chain");
  const late = (): number => (d + 1) * DAY - 1; // the end of day d, a published day: never a new anchor there (DOJO-WALK-GAPS-1 (c))
  refuses(() => publishAnchor({ stateDir: short.s, key: short.key, request: request(), clock: late }), "anchor_on_published_day");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:203 CONST "t < (d + 1) * DAY_MS" -> "t < d * DAY_MS"
test("dojo_publish_same_bundle_twice_publishes_nothing", async () => {
  const w = world(), d = w.A + 1, run = (t: number) => okA(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: () => t }));
  writeDay(w, d, w.eve);
  assert.deepEqual(await run((d + 1) * DAY - 1), { status: "nothing_to_publish", day: dateOf(d) }, "the seed of a day is never revealed before its end (M-12)");
  assert.equal((await run(slot(d)())).status, "published");
  const tl = readFileSync(join(w.s, "timeline.jsonl"), "utf8"), pub = files(join(w.s, "public"));
  assert.deepEqual([await run(slot(d)() + 3_600_000), readFileSync(join(w.s, "timeline.jsonl"), "utf8"), files(join(w.s, "public"))],
    [{ status: "nothing_to_publish", day: dateOf(d + 1) }, tl, pub], "the same bundle twice publishes nothing");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:239 SDL "await checked(stateDir, st, [snap" -> ""
test("dojo_publish_never_commits_a_line_the_verifier_refuses", async () => {
  const w = world(), d = w.A + 1, before = files(w.s);
  writeDay(w, d, w.eve, { offset: 1800 }); // the REAL writers under another read_offset_s: a collector misconfigured or compromised (TB-1)
  for (const clock of [slot(d), () => slot(d)() + 3_600_000]) { // its slot, then the next one: the same refusal, nothing written
    await assert.rejects(async () => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock }),
      (e: unknown) => e instanceof DojoPublishError && e.code === "line_refused" && e.detail === "seq 3: read_instant_mismatch (instant)");
    assert.deepEqual(files(w.s), before, "a line the verifier refuses is never committed: the state intact to the byte (D-C1)");
  }
  const v = await verify(w.s, dojoKeyringOf([[w.key, 1]]));
  assert.deepEqual([v.ok, v.ok && v.snapshots, v.ok && v.seq], [true, 0, 2], `public/ reads green, without that day: ${JSON.stringify(v)}`);
});

// killer: apps/dojo/scripts/dojo-publish.mjs:198 SDL "if (due !== null) return complete(" -> ""
test("dojo_publish_completes_a_pending_price_version", async () => {
  const w = world(), A = w.A, priv = join(w.s, "timeline.jsonl"), kr = dojoKeyringOf([[w.key, 1]]), f1 = tmp("dojo-p-fork-"), f2 = tmp("dojo-p-fork-");
  let eve = w.eve, n = 0;
  for (let j = 1; j <= 8; j++) eve = writeDay(w, A + j, eve);
  for (let j = 1; j <= 6; j++) await publish(w, A + j); // the first --inbox runs on a state without snapshot (M-E19), after the first anchor
  const stop: typeof DURABLE_FS = { ...DURABLE_FS, openSync: (p, f) => { // SYNTHETIC stop at the second append: day 7's price_version
    if (f === "a" && ++n === 2) throw new Error("SYNTHETIC stop"); return DURABLE_FS.openSync(p, f); } };
  await assert.rejects(async () => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(A + 7), fs: stop }), /SYNTHETIC stop/);
  for (const f of [f1, f2]) cpSync(w.s, f, { recursive: true }); // day 7's snapshot committed and served, its price_version due: two forks
  const kept = files(w.s);
  refuses(() => publishAnchor({ stateDir: w.s, key: w.key, request: request(), clock: slot(A + 7) }), "price_version_pending"); // TB-16
  assert.deepEqual([linesOf(priv).at(-1)?.kind, files(w.s)], ["snapshot", kept], "stopped at the second append; --anchor refused, nothing written");
  const err: string[] = [], real = process.stderr.write.bind(process.stderr); // C-G2-4: stderr around the reprise, spied (PC-3)
  process.stderr.write = (c: string | Uint8Array): boolean => { err.push(String(c)); return true; };
  const r = await okA(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(A + 7) }))
    .finally(() => { process.stderr.write = real; });
  const pv = linesOf(priv).at(-1);
  assert.deepEqual([r.status, r.status === "completed" && r.seq, pv?.kind, pv?.window_first_day, pv?.effective_day, pv?.published_at, err],
    ["completed", 10, "price_version", dateOf(A + 1), dateOf(A + 8), new Date(slot(A + 7)()).toISOString(), ["dojo/publish: completed_price_version\n"]],
    "the reprise at the same slot: the version due, its window and effect unshifted, dated at the reprise, one completed_price_version on stderr");
  await publish(w, A + 8);
  assert.deepEqual([linesOf(priv).at(-1)?.price_version, (await verify(w.s, kr)).ok], [1, true], "day 8 names the version completed; the tree verifies");
  const fl = linesOf(join(f1, "timeline.jsonl")), s7 = fl.at(-1) ?? {}, r0 = (s7.reads as Obj[])[0] ?? {}; // C-V-1 (b): a forge inside the segment
  r0.instant = new Date(Date.parse(String(r0.instant)) + 1000).toISOString(); // day 7's first instant moved by a second, the line signed again
  delete s7.sig;
  s7.sig = signLine(s7, w.key);
  for (const p of [join(f1, "timeline.jsonl"), join(f1, "public", "timeline.jsonl")]) writeFileSync(p, fl.map((l) => `${canonical(l)}\n`).join(""));
  const k1 = files(f1);
  assert.deepEqual(await verify(f1, kr), { ok: false, reason: "read_instant_mismatch", seq: 9, day: dateOf(A + 7), detail: "instant" }, "the forge");
  await assert.rejects(async () => publishDay({ inboxDir: w.inbox, stateDir: f1, key: w.key, clock: slot(A + 7) }),
    (e: unknown) => e instanceof DojoPublishError && e.code === "line_refused" && e.detail === "seq 9: read_instant_mismatch (instant)");
  assert.deepEqual(files(f1), k1, "a completion the verifier refuses: a named stop, nothing written");
  const fa = linesOf(join(f2, "timeline.jsonl")), a2: Obj = { ...fa[0], seq: fa.length + 1, prev_line_hash: lineHash(fa.at(-1)) }; // C-V-1 (a)
  a2.published_at = new Date(slot(A + 7)()).toISOString(); // an anchor line signed by hand above the version due, outside --anchor
  delete a2.sig;
  const al = `${canonical({ ...a2, sig: signLine(a2, w.key) })}\n`;
  for (const p of [join(f2, "timeline.jsonl"), join(f2, "public", "timeline.jsonl")]) appendFileSync(p, al);
  const k2 = files(f2), none = await okA(() => publishDay({ inboxDir: w.inbox, stateDir: f2, key: w.key, clock: slot(A + 7) }));
  assert.deepEqual([none, files(f2), await verify(f2, kr)], [{ status: "nothing_to_publish", day: dateOf(A + 9) }, k2, { ok: false,
    reason: "version_not_in_force", seq: 10, day: null, detail: "a segment closed with a price_version due (N3, fail-closed)" }], "nothing due (M-E20)");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:199 CONST "L.findLastIndex(" -> "L.findIndex("
test("dojo_publish_follows_the_last_anchor_after_a_re_anchor", async () => {
  const w = world(), A = w.A, file = join(tmp("dojo-p-seed-"), "seed"), second = initSeed(file, 365), one = tmp("dojo-p-chain1-");
  const eve = writeDay(w, A + 1, w.eve);
  await publish(w, A + 1);
  ok(() => publishAnchor({ stateDir: w.s, key: w.key, request: { ...request(), ...second }, clock: () => (A + 2) * DAY + 600_000 })); // C-G2-2
  writeDay(w, A + 3, eve, { inbox: one }); // day A + 3 of the first chain, after the new anchor of day A + 2
  const before = files(w.s);
  await refusesA(() => publishDay({ inboxDir: one, stateDir: w.s, key: w.key, clock: slot(A + 3) }), "seed_outside_anchor_chain");
  assert.deepEqual(files(w.s), before, "a seed of the first chain after a re-anchor: refused, nothing written");
  writeDay(w, A + 3, eve, { seed: daySeed(readFileSync(file, "utf8").trim(), 365, 1) }); // day A + 3 of the second chain
  assert.equal((await publish(w, A + 3)).status, "published", "the next day follows the last anchor: its day and its seed chain");
  const v = await verify(w.s, dojoKeyringOf([[w.key, 1]]));
  assert.deepEqual([v.ok, v.ok && v.snapshots], [true, 2], JSON.stringify(v));
});

// killer: apps/dojo/scripts/dojo-publish.mjs:266 CONST "L.findLastIndex(" -> "L.findIndex("
test("dojo_publish_completes_a_price_version_due_after_a_re_anchor", async () => {
  const w = world(), A = w.A, file = join(tmp("dojo-p-seed-"), "seed"), second = initSeed(file, 365), secret = readFileSync(file, "utf8").trim();
  const priv = join(w.s, "timeline.jsonl"), kr = dojoKeyringOf([[w.key, 1]]);
  let eve = writeDay(w, A + 1, w.eve), n = 0;
  await publish(w, A + 1);
  ok(() => publishAnchor({ stateDir: w.s, key: w.key, request: { ...request(), ...second }, clock: () => (A + 2) * DAY + 600_000 })); // C-G2-3
  for (let j = 3; j <= 10; j++) eve = writeDay(w, A + j, eve, { seed: daySeed(secret, 365, j - 2) }); // the second seed chain: A + 3 to A + 10
  for (let j = 3; j <= 8; j++) await publish(w, A + j);
  const stop: typeof DURABLE_FS = { ...DURABLE_FS, openSync: (p, f) => { // SYNTHETIC stop at the second append of the segment's seventh day
    if (f === "a" && ++n === 2) throw new Error("SYNTHETIC stop"); return DURABLE_FS.openSync(p, f); } };
  await assert.rejects(async () => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(A + 9), fs: stop }), /SYNTHETIC stop/);
  const r = await okA(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(A + 9) })), pv = linesOf(priv).at(-1);
  assert.deepEqual([r.status, r.status === "completed" && r.seq, pv?.kind, pv?.window_first_day, pv?.effective_day, (await verify(w.s, kr)).ok],
    ["completed", 12, "price_version", dateOf(A + 3), dateOf(A + 10), true], "the version due after a re-anchor: its window opens the segment");
  assert.deepEqual([(await publish(w, A + 10)).status, linesOf(priv).at(-1)?.price_version, (await verify(w.s, kr)).ok], ["published", 1, true],
    "the next day is published and names the version completed; the tree verifies");
});

// ---- PR-3a-2: the history packet of PR-2b, written by its REAL writer (historyBundle, ADR-DOJO-PR-2B D-12), published by --history
// (ADR-DOJO-PR-3 D-1 row PR-3a-2, section 4; mere T-9, D-18, decision 231); the counts, links and slots of the manifest are SYNTHETIC.
/** A history packet under <dir>/publish/, as the collector writes it (SHA256SUMS last): the lines `hl` of days 1 to `last`, the Eve of the
 *  first day read = the addresses of the last day (history-build.ts), SIG0 the pinned creation. */
function packet(hl: readonly Obj[], last: number): string {
  const lines = hl.map((l) => canonical(l)), bytes = lines.map((l) => `${l}\n`).join(""), dir = tmp("dojo-p-hist-");
  const eve = { addresses: hl.filter((l) => l.day === dateOf(last)).map((l) => String(l.address)), accounts: [] };
  const out = historyBundle({ status: "complete", stop_reason: null, mint: MINT, program: TOKEN_2022, decimals: 6, sig0: SIG0.signature, sig0_slot: SIG0.slot,
    transactions_failed_excluded: 0, collector_sha256: sha("SYNTHETIC collector"), evidence_sha256sums_sha256: sha("SYNTHETIC run"),
    build: { history_first_day: "2026-09-10", history_last_day: dateOf(last), first_read_day: dateOf(last + 1), window_slot_max: 1, enumeration_slots: [1],
      lines, bytes, sha256: sha(bytes), root: rootOf(lines), eve, transactions_admitted: hl.length, transactions_without_quorum: 0,
      token_accounts: hl.length, addresses: eve.addresses.length, missing_address_days: 0 } });
  for (const [p, t] of Object.entries(out.publish ?? {})) {
    const f = join(dir, "publish", ...p.split("/"));
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, t);
  }
  return dir;
}
/** Rewrites one file of a packet and its sha256 in publish/SHA256SUMS, so that the check agrees and the deeper reader judges. */
function repack(dir: string, rel: string, f: (text: string) => string): void {
  const p = join(dir, "publish", ...rel.split("/")), s = join(dir, "publish", "SHA256SUMS"), old = readFileSync(p, "utf8"), text = f(old);
  writeFileSync(p, text);
  writeFileSync(s, readFileSync(s, "utf8").replace(`${sha(old)}  ${rel}`, `${sha(text)}  ${rel}`));
}
const hclock = (w: World) => (): number => (w.A + 2) * DAY + 1_200_000; // 00:20 UTC of A + 2: A + 1, the first day read, is over (B-1)

// killer: apps/dojo/scripts/dojo-publish.mjs:376 SDL "history_after_snapshot" -> ""
test("dojo_publish_history_before_the_first_snapshot", async () => {
  const w = world({ history: false }), d = w.A + 1, pkt = packet(w.hl, w.A), none = tmp("dojo-p-hnone-"), log: string[] = [];
  const rel = (p: string): string => relative(w.s, p).split(sep).join("/");
  const go = (s: string, fs = DURABLE_FS) => publishHistory({ historyDir: pkt, inboxDir: w.inbox, stateDir: s, key: w.key, clock: hclock(w), fs });
  await refusesA(() => go(none), "no_timeline");
  assert.deepEqual(readdirSync(none), [], "no anchor: refused, nothing written");
  await refusesA(() => go(w.s), "first_read_day_open"); // B-1: no history line before the close of d, the first day read
  writeDay(w, d, w.eve);
  await refusesA(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(d) }), "history_missing"); // decision 231
  const spy: typeof DURABLE_FS = { ...DURABLE_FS, openSync: (p, f) => { log.push(`open ${rel(p)} ${f}`); return DURABLE_FS.openSync(p, f); },
    renameSync: (a, b) => { log.push(`rename ${rel(b)}`); DURABLE_FS.renameSync(a, b); },
    fsyncDir: (x) => { log.push(`fsyncdir ${rel(x)}`); DURABLE_FS.fsyncDir(x); } };
  const r = await okA(() => go(w.s, spy)), h = r.history_sha256, i = log.indexOf(`rename staging/history/${h}.jsonl`), j = log.indexOf("open timeline.jsonl a");
  assert.ok(i >= 0 && log[i + 1] === "fsyncdir staging/history" && i < j && log.indexOf(`rename public/history/${h}.jsonl`) > j,
    `the history file is durable before its line, served after it (M-E4): ${log.join(" | ")}`);
  const copy = readFileSync(join(w.s, "public", "history", `${h}.jsonl`), "utf8"), k1 = files(w.s), own = join(pkt, "publish", "history", `${h}.jsonl`);
  assert.deepEqual([r.status, r.seq, r.history_last_day, copy], ["published", 2, dateOf(w.A), readFileSync(own, "utf8")], "served: the writer's file");
  await refusesA(() => go(w.s), "history_exists"); // one history line per timeline
  assert.deepEqual(files(w.s), k1, "a second history line: refused, nothing written");
  assert.equal((await publish(w, d)).status, "published", "the first snapshot comes after the history line");
  const k2 = files(w.s);
  await refusesA(() => go(w.s), "history_after_snapshot"); // M-E4: never after a snapshot
  assert.deepEqual(files(w.s), k2, "a history line after a snapshot: refused, nothing written");
  const v = await verify(w.s, dojoKeyringOf([[w.key, 1]]));
  assert.deepEqual([v.ok, v.ok && v.snapshots, v.ok && v.history?.history_sha256], [true, 1, h], JSON.stringify(v));
});

// killer: apps/dojo/scripts/dojo-publish.mjs:360 SDL "for (const [, hex, p] of rows)" -> ""
test("dojo_publish_history_reads_the_packet_with_its_check", async () => {
  const w = world({ history: false }), src = packet(w.hl, w.A), before = files(w.s);
  const go = (dir: string) => publishHistory({ historyDir: dir, inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: hclock(w) });
  writeDay(w, w.A + 1, w.eve); // the first day read, closed and over: every refusal below is the packet's (B-1)
  const man = (f: (m: Obj) => Obj) => (t: string): string => `${canonical(f(json(t)))}\n`, mf = (p: string): string => join(p, "publish", "manifest.json");
  const sums = (p: string): string => join(p, "publish", "SHA256SUMS");
  const M = (f: (m: Obj) => Obj) => (p: string): void => { repack(p, "manifest.json", man(f)); }; // the manifest rewritten, its sum agreeing
  const bad = "history_bundle_malformed", cases: [(p: string) => void, string][] = [[(p) => { rmSync(sums(p)); }, bad], // a packet without its check
    [(p) => { appendFileSync(sums(p), "x"); }, bad], [(p) => { writeFileSync(sums(p), readFileSync(sums(p), "utf8").replace("  ", " ")); }, bad],
    [(p) => { appendFileSync(sums(p), `${readFileSync(sums(p), "utf8").split("\n")[2] ?? ""}\n`); }, bad], // a fourth line
    [(p) => { rmSync(join(p, "publish", "history"), { recursive: true }); }, bad], // a file it names is missing
    [(p) => { writeFileSync(mf(p), man((m) => ({ ...m, evidence_sha256sums_sha256: sha("SYNTHETIC") }))(readFileSync(mf(p), "utf8"))); },
      "history_bundle_mismatch"], // a wrong check: the manifest no longer links its evidence, SHA256SUMS unchanged (M-E12)
    [(p) => { repack(p, "manifest.json", () => "{\n"); }, bad], [(p) => { repack(p, "manifest.json", (t) => ` ${t}`); }, bad], // not JSON; not canonical
    [M((m) => ({ ...m, schema: "dojo-history-bundle-v2" })), bad], [M((m) => ({ ...m, status: "partial" })), bad], [M((m) => ({ ...m, extra: 1 })), bad],
    [M(({ addresses, ...m }) => ({ ...m, address_count: addresses })), bad], [M((m) => ({ ...m, chain_check: "fail" })), bad], // closed keys; a check
    [M((m) => ({ ...m, history_sha256: sha("SYNTHETIC") })), bad], // the manifest names another file
    [M((m) => ({ ...m, mint: TOKEN_2022 })), "bundle_anchor_mismatch"], [M((m) => ({ ...m, program: MINT })), "bundle_anchor_mismatch"],
    [M((m) => ({ ...m, history_root: sha("SYNTHETIC") })), "line_refused"], // the verifier's (history_root_mismatch), before any append
    [(p) => { repack(p, "eve.json", () => `${canonical({ addresses: [X], accounts: [] })}\n`); }, "history_bundle_mismatch"], // short of ADDR.A
    [(p) => { writeFileSync(join(p, "publish", "extra.json"), "{}"); }, bad], // Q-6 (b): a file of publish/ that SHA256SUMS does not list
    [(p) => { writeFileSync(join(p, "publish", "history", "extra.jsonl"), ""); }, bad]]; // ... at any depth
  for (const [edit, code] of cases) {
    const p = tmp("dojo-p-hbad-");
    cpSync(src, p, { recursive: true });
    edit(p);
    await refusesA(() => go(p), code);
  }
  const early = packet(w.hl.map((l) => ({ ...l, day: dateOf(w.A - 1) })), w.A - 1); // a history ending before the anchor's day
  await assert.rejects(async () => go(early), (e: unknown) => e instanceof DojoPublishError && e.code === "line_refused"
    && e.detail === "seq 2: timeline_malformed (a history ending before the anchor's day (DOJO-WALK-GAPS-1 (b)))", "the walker admits it, the VAE refuses it");
  const nested = tmp("dojo-p-hnest-"); // D2-5: a foreign file is named by its path under publish/, never by its name alone
  cpSync(src, nested, { recursive: true });
  writeFileSync(join(nested, "publish", "history", "extra.jsonl"), "");
  await assert.rejects(async () => go(nested), (e: unknown) => e instanceof DojoPublishError && e.code === bad
    && e.detail === "publish/history/extra.jsonl: not listed", "D2-5: the foreign file named by its path under publish/");
  assert.deepEqual(files(w.s), before, "every packet refused with nothing written: the state intact to the byte");
  assert.equal((await okA(() => go(src))).status, "published", "the pristine packet publishes");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:25 CONST "history_exists" -> "history_exist"
test("dojo_publish_refusals_list_is_every_code_raised", () => {
  const text = readFileSync(SCRIPT, "utf8"), raised = [...text.matchAll(/refuse[(]"([a-z_]+)"/g)].map((m) => m[1] ?? ""), listed = [...DOJO_PUBLISH_REFUSALS];
  assert.deepEqual([...text.matchAll(/refuse[(]([^,)]*)/g)].map((m) => m[1] ?? "").filter((c) => !/^"[a-z_]+"$/.test(c)), ["e.code"],
    "Q-8 (b): every refusal names its code, but the one pass-through of the readers, named by its site (e.code)");
  assert.deepEqual([...new Set(listed)].sort(), [...new Set([...raised, ...DOJO_LAYOUT_REFUSALS, ...DOJO_BUNDLE_REFUSALS])].sort(),
    "DOJO-PUBLISH-REFUSALS-LIST-1: the closed list is the codes the publisher raises and those of its readers it passes through");
  assert.deepEqual([listed.length, listed.filter((c) => DOJO_VERIFY_REFUSALS.includes(c))], [new Set(listed).size, []], "each once, none of the verifier's");
  assert.deepEqual(["history_exists", "history_after_snapshot", "history_bundle_malformed", "history_bundle_mismatch", "first_read_day_open", "day_missing"]
    .filter((c) => !listed.includes(c)), [], "the refusals of --history (PR-3a-2) and those of B-1 are listed");
});

// ---- B-1 (G2 inspection of part 1; docs/ETAT.md, first counted day): --history checks the first day read in the inbox BEFORE its
// irreversible line, with the very check of --inbox; --inbox names a missing day instead of waiting for it in silence.
// killer: apps/dojo/scripts/dojo-publish.mjs:508 CONST "t < (d + 1) * DAY_MS" -> "t < d * DAY_MS"
test("dojo_publish_history_waits_for_the_first_day_read", async () => {
  const w = world({ history: false }), d = w.A + 1, pkt = packet(w.hl, w.A), off = tmp("dojo-p-hoff-"), lost = tmp("dojo-p-hlost-");
  const go = (t: number, inbox = w.inbox, dir = pkt) => publishHistory({ historyDir: dir, inboxDir: inbox, stateDir: w.s, key: w.key, clock: () => t });
  const before = files(w.s), over = hclock(w)(), bad = tmp("dojo-p-hlay-");
  await refusesA(() => go(over), "first_read_day_open"); // d, the first day read, absent from the inbox
  writeDay(w, d, w.eve);
  await assert.rejects(async () => go((d + 1) * DAY - 1), (e: unknown) => e instanceof DojoPublishError && e.code === "first_read_day_open"
    && e.detail === `${dateOf(d)}: not closed in the inbox, or not over`, "d closed in the inbox, but not over at the clock: the clock check itself");
  writeDay(w, d, { addresses: [X], accounts: [] }, { inbox: lost }); // d without ADDR.A, which holds lots on the history's last day
  await assert.rejects(async () => go(over, lost), (e: unknown) => e instanceof DojoPublishError && e.code === "eve_mismatch"
    && e.detail === `${dateOf(d)}: an address holding lots is not in the bundle`, "the check of --inbox (evePile), run before the line");
  cpSync(pkt, off, { recursive: true });
  repack(off, "manifest.json", (t) => t.replace(`"first_read_day":"${dateOf(d)}"`, `"first_read_day":"${dateOf(d + 1)}"`));
  await assert.rejects(async () => go(over, w.inbox, off), (e: unknown) => e instanceof DojoPublishError && e.code === "history_bundle_malformed"
    && e.detail === "publish/manifest.json: first_read_day", "Q-7: the first day read is the day after the history's last day");
  cpSync(join(w.inbox, dateOf(d)), join(bad, dateOf(d)), { recursive: true });
  writeFileSync(join(bad, dateOf(d), "publish", "extra.json"), "{}");
  await refusesA(() => go(over, bad), "layout_stray_file"); // the reader's refusal, passed through (readDay, shared with --inbox)
  assert.deepEqual(files(w.s), before, "every refusal comes before the line: the state intact to the byte");
  assert.equal((await okA(() => go(over))).status, "published", "d closed, over, and holding the pile: the history line");
  assert.equal((await publish(w, d)).status, "published", "the first snapshot is d, the day --history checked");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:518 CONST "later.length > 0" -> "later.length > 1"
test("dojo_publish_names_a_missing_day", async () => {
  const w = world(), d = w.A + 1, empty = tmp("dojo-p-empty-");
  writeDay(w, d + 1, w.eve); // d + 1 closed, d absent: the day expected is missing (a day archived, or a history ending too early)
  const before = files(w.s), run = (inbox: string) => publishDay({ inboxDir: inbox, stateDir: w.s, key: w.key, clock: slot(d + 1) });
  await assert.rejects(async () => run(w.inbox), (e: unknown) => e instanceof DojoPublishError && e.code === "day_missing"
    && e.detail === `${dateOf(d)}: not closed, ${dateOf(d + 1)} closed`, "N-5: a named stop, never nothing_to_publish");
  mkdirSync(join(w.inbox, dateOf(d)), { recursive: true }); // d present but open (no publish/SHA256SUMS): the same stop
  await refusesA(() => run(w.inbox), "day_missing");
  assert.deepEqual(files(w.s), before, "refused with nothing written");
  assert.deepEqual([await okA(() => run(empty)), await okA(() => run(join(empty, "absent")))], [{ status: "nothing_to_publish", day: dateOf(d) },
    { status: "nothing_to_publish", day: dateOf(d) }], "no later day closed, or no inbox at all: an open day, as before");
});

// ---- B1-PRECHECK-FULL-1 (suite of B-1): --history builds the first snapshot of d at blank and verifies it WITH its line, so each refusal
// that publication would meet is raised before the irreversible line, with the very detail of --inbox; the state intact to the byte.
const rehearsal = (): string => daySeed(sha("SYNTHETIC rehearsal secret"), 30, 1); // a seed off the anchor's chain (a rehearsal in force)
async function refusedBeforeTheLine(w: World, inbox: string, d: number, code: string, detail: string, pkt = packet(w.hl, w.A)): Promise<void> {
  const before = files(w.s), clock = (): number => (d + 1) * DAY + 1_200_000; // 00:20 UTC of d + 1: d over, and closed in `inbox`
  await assert.rejects(async () => publishHistory({ historyDir: pkt, inboxDir: inbox, stateDir: w.s, key: w.key, clock }),
    (e: unknown) => e instanceof DojoPublishError && e.code === code && e.detail === detail, `${code}: ${detail}`);
  assert.deepEqual(files(w.s), before, `${code} before the history line: the state intact to the byte`);
}

// killer: apps/dojo/scripts/dojo-publish.mjs:206 SDL "if (epochOf(b.day) <= anchorDay)" -> ""
test("dojo_publish_history_checks_the_day_after_the_anchor", async () => {
  const w = world({ history: false }), d = w.A + 1, inbox = tmp("dojo-p-pc1-");
  writeDay(w, d, w.eve, { inbox, day: w.A, seed: rehearsal() }); // the bundle of the anchor's day, in the directory of d
  await refusedBeforeTheLine(w, inbox, d, "day_not_after_anchor", `${dateOf(d)}/publish/day.json: day`);
});

// killer: apps/dojo/scripts/dojo-publish.mjs:207 SDL "if (b.day !== day)" -> ""
test("dojo_publish_history_checks_the_day_of_the_bundle", async () => {
  const w = world({ history: false }), d = w.A + 1, inbox = tmp("dojo-p-pc2-");
  writeDay(w, d, w.eve, { inbox, day: d + 1 }); // the bundle of d + 1, in the directory of d
  await refusedBeforeTheLine(w, inbox, d, "bundle_day_mismatch", `${dateOf(d)}/publish/day.json: day`);
});

// killer: apps/dojo/scripts/dojo-publish.mjs:208 CONST "b.program !== A.program" -> "false"
test("dojo_publish_history_checks_the_anchor_of_the_bundle", async () => {
  const w = world({ history: false }), d = w.A + 1, inbox = tmp("dojo-p-pc3-");
  writeDay(w, d, w.eve, { inbox, program: MINT }); // another program than the anchor's (the snapshot line itself does not carry it)
  await refusedBeforeTheLine(w, inbox, d, "bundle_anchor_mismatch", `${dateOf(d)}: mint, program or k_reads`);
});

// killer: apps/dojo/scripts/dojo-publish.mjs:210 CONST "seedAnchor(b.seed, d - seedDay) !== prior" -> "false"
test("dojo_publish_history_checks_the_seed_chain", async () => {
  const w = world({ history: false }), d = w.A + 1, inbox = tmp("dojo-p-pc4-");
  writeDay(w, d, w.eve, { inbox, seed: rehearsal() }); // the rehearsal's seed still in force at the restart (section 7 (3) not done)
  await refusedBeforeTheLine(w, inbox, d, "seed_outside_anchor_chain", `${dateOf(d)}: seed`);
  const short = world({ history: false, horizon: 1, chain: 2 }), far = short.A + 2; // a first day read past the anchor's horizon
  const hl = short.hl.map((l) => ({ ...l, day: dateOf(far - 1) }));
  writeDay(short, far, { addresses: short.hl.map((l) => String(l.address)), accounts: [] }); // the Eve of the first day read
  await refusedBeforeTheLine(short, short.inbox, far, "seed_outside_anchor_chain", `${dateOf(far)}: seed`, packet(hl, far - 1));
});

// killer: apps/dojo/scripts/dojo-publish.mjs:239 CONST "[snap, ...(pv === null ? [] : [pv])]" -> "[]"
test("dojo_publish_history_verifies_the_first_snapshot_with_the_line", async () => {
  const w = world({ history: false }), d = w.A + 1, inbox = tmp("dojo-p-pc5-");
  writeDay(w, d, w.eve, { inbox, offset: 1800 }); // the REAL writers under another read_offset_s: the reader's verifier refuses that snapshot
  await refusedBeforeTheLine(w, inbox, d, "line_refused", "seq 3: read_instant_mismatch (instant)");
});
