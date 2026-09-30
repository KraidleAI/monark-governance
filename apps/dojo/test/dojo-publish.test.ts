// MONARK Dojo -- PR-3a-1 oracle (ADR-DOJO-PR-3 section 4, PR-3a-1; cut DOJO-PR3A1-CUT-1, parts 1a and 1b): the publisher's anchor, key
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
import { dirSource, verifyDojoServed } from "../scripts/dojo-verify.mjs";
import { initSeed } from "../scripts/dojo-seed.mjs";
import { ANCHOR_KEYS, DURABLE_FS, DojoPublishError, publishAnchor, revokeKey, rotateKey } from "../scripts/dojo-publish.mjs";
import * as publisher from "../scripts/dojo-publish.mjs"; // publishDay, bound late below: the base of the lot, which lacks it, loads this file
import { readRecord, readingRecord, recordBytes, writeDayBundle } from "../src/bundle.ts";
import { READ_RULE } from "../src/dojo-methods.ts";
import { closeLayout, nextEve, readDayLayout } from "../src/layout.ts";
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

// killer: apps/dojo/scripts/dojo-publish.mjs:161 SDL "closed keys" -> ""
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
    [{ ...req, read_rule: { ...READ_RULE, read_offset_s: 901 } }, "line_refused"], // the walker's read_rule (ADR-DOJO-PR-2 D-5)
    [{ ...req, read_rule: { ...READ_RULE, beacon_period_ms: 3000 } }, "line_refused"],
    [{ ...req, k_reads: 256 }, "line_refused"], [{ ...req, price_window_days: 6 }, "line_refused"]];
  for (const [q, code] of bad) refuses(() => publishAnchor({ stateDir: e, key: k, request: q, clock: () => T0 }), code);
  assert.deepEqual(readdirSync(e), [], "a refused request writes nothing, not even keyring.json");
  const c = tmp("dojo-p-cli-"), q = join(tmp("dojo-p-req-"), "anchor.json"), creds = credsOf({ "dojo-signing-key": k });
  writeFileSync(q, JSON.stringify(req));
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

// killer: apps/dojo/scripts/dojo-publish.mjs:287 CONST "wx" -> "w"
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

// killer: apps/dojo/scripts/dojo-publish.mjs:273 CONST "active" -> "lost"
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
    ["--anchor", "--state", s], ["--revoke", id1, "--state", s], ["--rotate", "--state", s, "--extra"], ["--broken", "--state", s]]) {
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

// killer: apps/dojo/scripts/dojo-publish.mjs:15 CONST "import { pathToFileURL }" -> "import \"node:dns\"; import { pathToFileURL }"
test("dojo_publish_imports_no_network_module", () => {
  const ALLOW = new Set(["node:crypto", "node:fs", "node:path", "node:url"]), seen = new Set<string>(), stack = [SCRIPT];
  const FORBIDDEN = [/node:https?\b/, /node:net\b/, /node:tls\b/, /node:dns\b/, /node:http2\b/, /node:dgram\b/, /child_process/, /\bfetch\s*\(/,
    /\bimport\s*\(/, /\brequire\s*\(/, /createRequire/, /\bundici\b/, /\bWebSocket\b/]; // calque of bell_scripts_import_allowlist_no_network
  for (let f = stack.pop(); f !== undefined; f = stack.pop()) {
    if (seen.has(f)) continue;
    seen.add(f);
    const text = readFileSync(f, "utf8"), specs = [...text.matchAll(/\b(?:from|import)\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1] ?? "");
    assert.ok(specs.length >= 1, `${f}: its imports are parsed (non-vacuity)`);
    for (const x of specs) if (x.startsWith(".")) stack.push(join(dirname(f), x)); else assert.ok(ALLOW.has(x), `${f}: import '${x}' outside the allowlist`);
    for (const re of FORBIDDEN) assert.equal(re.test(text), false, `${f}: forbidden network or dynamic-load token ${String(re)}`);
  }
  const root = join(HERE, "..", "..", "..");
  assert.deepEqual([...seen].map((f) => relative(root, f).split(sep).join("/")).sort(), ["apps/bell/scripts/bell-chain.mjs",
    "apps/dojo/scripts/dojo-chain.mjs", "apps/dojo/scripts/dojo-core.mjs", "apps/dojo/scripts/dojo-publish.mjs", "apps/dojo/src/bundle.ts",
    "apps/dojo/src/layout.ts", "apps/dojo/src/reading.ts"], "the whole import closure: the real reader of the bundle (FM-1.1), no copy");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:62 CONST "staging" -> "public/staging"
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

// killer: apps/dojo/scripts/dojo-publish.mjs:166 SDL "if (last?.kind === " -> ""
test("dojo_publish_anchor_replayed_after_a_stop_adds_no_line", () => {
  const s = tmp("dojo-p-replay-"), k = gen(), req = request(), tl = join(s, "public", "timeline.jsonl"), priv = join(s, "timeline.jsonl");
  const stop = { ...DURABLE_FS, fsyncDir: (d: string): void => { if (existsSync(priv)) throw new Error("SYNTHETIC stop"); DURABLE_FS.fsyncDir(d); } };
  assert.throws(() => publishAnchor({ stateDir: s, key: k, request: req, clock: () => T0, fs: stop }), /SYNTHETIC stop/); // committed, not yet served
  const again = ok(() => publishAnchor({ stateDir: s, key: k, request: { ...req }, clock: () => T0 + 1 }));
  assert.deepEqual([again.seq, again.published_at, linesOf(tl).length], [1, new Date(T0).toISOString(), 1], "the same request replayed: its anchor, no line");
  assert.equal(ok(() => publishAnchor({ stateDir: s, key: k, request: request(), clock: () => T0 + 2 })).seq, 2, "another request: a re-anchor, as before");
  assert.equal(ok(() => publishAnchor({ stateDir: s, key: k, request: req, clock: () => T0 + 3 })).seq, 3, "req after another: a re-anchor");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:299 CONST "^[1-9][0-9]*$" -> "^"
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
interface World { s: string; inbox: string; key: KeyObject; secret: string; chain: number; A: number; eve: Eve }
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
  return { s, inbox, key, secret, chain, A, eve: { addresses: hl.map((x) => x.address), accounts: [] } };
}
interface Opt { day?: number; seed?: string; program?: string; token?: string; k?: number; sol?: boolean; mint?: boolean; beacon?: boolean; inbox?: string }
/** Writes bundles/<d>/ with the real writers and returns the Eve of d + 1 (nextEve of the layout reader's day). `day` misplaces the bundle
 *  of another day under d; `seed`, `program`, `token` (the bundle's mint) and `k` replace the chain's and the anchor's; `sol` false = a
 *  Pyth fault all day (sigma null); `mint` false = the mint changed (abstained, reads kept); `beacon` false = a day without beacon. */
function writeDay(w: World, d: number, eve: Eve, o: Opt = {}): Eve {
  const dd = o.day ?? d, day = dateOf(dd), seed = o.seed ?? daySeed(w.secret, w.chain, dd - w.A), beta = betaOf(dd), T = dd * 86_400;
  const dir = join(o.inbox ?? w.inbox, dateOf(d)), anchor = { mint: MINT, pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_max_age_s: 165 };
  const mint = o.mint === false ? { a: mintChanged(), b: mintChanged() } : ACC.mint;
  const recs = o.beacon === false ? [] : readInstants(seed, beta, o.k ?? K, T, 900).map((t, j) => readingRecord({ day, i: j + 1, instant: t, anchor, eve,
    read_at: new Date((t + 10) * 1000).toISOString(), enumeration: E, mint: j === 0 ? mint : null, pool: ACC.pool, wsol: ACC.wsol,
    pyth: o.sol === false ? { a: null, b: null } : { a: pythAt(t - 10), b: pythAt(t - 10) } }));
  const { bytes } = writeDayBundle({ day, seed, beacon: o.beacon === false ? null : { round: roundOf(dd), signature: beta }, read_rule: READ_RULE,
    k_reads: o.k ?? K, mint: o.token ?? MINT, program: o.program ?? TOKEN_2022, decimals: 6, records: recs, eve }, T + 2 * 86_400);
  mkdirSync(join(dir, "readings"), { recursive: true });
  recs.forEach((r, j) => { writeFileSync(join(dir, "readings", `${j + 1}.json`), recordBytes(r)); });
  writeFileSync(join(dir, "eve.json"), `${canonical(eve)}\n`);
  closeLayout(dir, [], recs.length, bytes);
  const L = readDayLayout(dir);
  return nextEve(L.bundle, L.records, L.eve);
}
const slot = (d: number): (() => number) => () => (d + 1) * DAY + 1_800_000; // 00:30 UTC of d + 1, the first slot of the publish timer (D-5)
const publish = (w: World, d: number, inbox = w.inbox) => ok(() => publishDay({ inboxDir: inbox, stateDir: w.s, key: w.key, clock: slot(d) }));
const versionOf = (r: ReturnType<typeof publish>): number | null => (r.status === "published" ? r.price_version : -1);
const linesAt = (w: World, l: Obj | undefined): Obj[] => linesOf(join(w.s, "public", "lines", `${String(l?.lines_sha256)}.jsonl`));
/** Rewrites one file of a day and its sha256 in publish/SHA256SUMS, so that the layout's sums agree and the deeper reader judges. */
function resum(dir: string, rel: string, f: (text: string) => string): void {
  const old = readFileSync(join(dir, ...rel.split("/")), "utf8"), text = f(old), p = join(dir, "publish", "SHA256SUMS");
  writeFileSync(join(dir, ...rel.split("/")), text);
  writeFileSync(p, readFileSync(p, "utf8").replace(`${sha(old)}  ${rel}`, `${sha(text)}  ${rel}`));
}

// killer: apps/dojo/scripts/dojo-publish.mjs:224 CONST "reads: b.reads," -> "reads: b.reads.slice(1),"
test("dojo_publish_snapshot_carries_beacon_and_reads", async () => {
  const w = world(), d = w.A + 1;
  writeDay(w, d + 1, writeDay(w, d, w.eve), { beacon: false }); // A + 2: a day without beacon (ADR-DOJO-PR-2 D-8, Q-5)
  publish(w, d);
  publish(w, d + 1);
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

// killer: apps/dojo/scripts/dojo-publish.mjs:242 ROR "!==" -> "==="
test("dojo_publish_price_version_needs_seven_valid_days", async () => {
  const w = world(), got: (number | null)[] = [];
  let eve = w.eve;
  for (let j = 1; j <= 11; j++) { eve = writeDay(w, w.A + j, eve, { sol: j !== 3, mint: j !== 4 }); got.push(versionOf(publish(w, w.A + j))); }
  assert.deepEqual(got, [null, null, null, null, null, null, null, null, null, null, 1],
    "day 3 without SOL rate (counted, sigma null), day 4 abstained (mint changed, prices kept): the first seven valid days are 5 to 11 (M-E7)");
  const pv = linesOf(join(w.s, "timeline.jsonl")).find((l) => l.kind === "price_version");
  assert.deepEqual([pv?.window_first_day, pv?.effective_day], [dateOf(w.A + 5), dateOf(w.A + 12)], "never on history days; in force the next day");
  const v = await verify(w.s, dojoKeyringOf([[w.key, 1]]));
  assert.equal(v.ok, true, JSON.stringify(v));
});

// killer: apps/dojo/scripts/dojo-publish.mjs:144 SDL "for (const [rel, text] of immutables)" -> ""
test("dojo_publish_writes_immutables_before_the_line", async () => {
  const w = world(), d = w.A + 1, log: string[] = [], rel = (p: string): string => relative(w.s, p).split(sep).join("/");
  const eve = writeDay(w, d, w.eve);
  const spy: typeof DURABLE_FS = { ...DURABLE_FS, openSync: (p, f) => { log.push(`open ${rel(p)} ${f}`); return DURABLE_FS.openSync(p, f); },
    renameSync: (a, b) => { log.push(`rename ${rel(b)}`); DURABLE_FS.renameSync(a, b); },
    fsyncDir: (x) => { log.push(`fsyncdir ${rel(x)}`); DURABLE_FS.fsyncDir(x); } };
  const crash: typeof spy = { ...spy, openSync: (p, f) => { if (f === "a") throw new Error("SYNTHETIC crash at the append"); return spy.openSync(p, f); } };
  const before = files(join(w.s, "public")), tl = readFileSync(join(w.s, "timeline.jsonl"), "utf8");
  assert.throws(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(d), fs: crash }), /SYNTHETIC crash/);
  assert.deepEqual([files(join(w.s, "public")), readFileSync(join(w.s, "timeline.jsonl"), "utf8")], [before, tl], "a crash before the line: nothing served");
  log.length = 0;
  const r = ok(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(d), fs: spy }));
  const h = r.status === "published" ? r.lines_sha256 : "", i = log.indexOf(`rename staging/lines/${h}.jsonl`), j = log.indexOf("open timeline.jsonl a");
  assert.ok(i >= 0 && log[i + 1] === "fsyncdir staging/lines" && i < j, `the immutable is durable before its line (M-E1): ${log.join(" | ")}`);
  assert.ok(log.indexOf(`rename public/lines/${h}.jsonl`) > j, "served after the commit point");
  writeDay(w, d + 1, eve); // day d + 1: a served immutable altered is refused; a stop past the commit point is repaired at the next start
  const f = join(w.s, "public", "lines", `${h}.jsonl`), kept = readFileSync(f), next = { inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: slot(d + 1) };
  writeFileSync(f, kept.toString("utf8").replace('"day_value":"', '"day_value":"1')); // still JSON: only its sha256 tells
  refuses(() => publishDay(next), "existing_timeline_corrupt");
  writeFileSync(f, kept);
  const stop: typeof DURABLE_FS = { ...DURABLE_FS, renameSync: (a, b) => {
    if (rel(b).startsWith("public/lines/")) throw new Error("SYNTHETIC stop past the commit point"); DURABLE_FS.renameSync(a, b); } };
  assert.throws(() => publishDay({ ...next, fs: stop }), /SYNTHETIC stop/);
  assert.equal(ok(() => publishDay(next)).status, "nothing_to_publish", "the next start serves day d + 1 with its immutable (moved from staging/)");
  assert.equal((await verify(w.s, dojoKeyringOf([[w.key, 1]]))).ok, true, "no served line names a missing file (M-E1 at the repair)");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:196 CONST "refuse(e.code" -> "refuse(\"line_refused\""
test("dojo_publish_refuses_a_malformed_bundle", () => {
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
    refuses(() => publishDay({ inboxDir: inbox, stateDir: w.s, key: w.key, clock: slot(d) }), code);
  }
  const lost = world(); // an Eve without ADDR.A, which holds lots at the history's last day: its line would be missing
  writeDay(lost, d, { addresses: [X], accounts: [] });
  refuses(() => publishDay({ inboxDir: lost.inbox, stateDir: lost.s, key: lost.key, clock: slot(d) }), "eve_mismatch");
  assert.deepEqual(files(w.s), before, "refused with nothing written");
  assert.equal(publish(w, d).status, "published", "the pristine day publishes");
});

// killer: apps/dojo/src/layout.ts:94 CONST ", { records: recs, eve })" -> ")"
test("dojo_publish_reads_the_bundle_with_its_check", () => {
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
  refuses(() => publishDay({ inboxDir: bad, stateDir: w.s, key: w.key, clock: slot(d) }), "bundle_records_mismatch"); // DOJO-BUNDLE-CHECK-REQUIRED-1
  const fsc = createRequire(import.meta.url)("node:fs") as { readFileSync: (...a: unknown[]) => unknown }, orig = fsc.readFileSync, read: string[] = [];
  fsc.readFileSync = (...a: unknown[]) => {
    if (typeof a[0] === "string" && a[0].startsWith(dir)) read.push(relative(dir, a[0]).split(sep).join("/"));
    return orig(...a);
  };
  syncBuiltinESMExports();
  try { assert.equal(publish(w, d).status, "published"); } finally { fsc.readFileSync = orig; syncBuiltinESMExports(); }
  assert.deepEqual(read.sort(), ["eve.json", "publish/SHA256SUMS", "publish/day.json", ...[1, 2, 3, 4].map((i) => `readings/${i}.json`)],
    "exactly the files publish/SHA256SUMS enumerates: never evidence/, never readings/SHA256SUMS");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:201 SDL "refuse(\"seed_outside_anchor_chain\"" -> ""
test("dojo_publish_refuses_a_seed_outside_the_anchor_chain", () => {
  const w = world(), d = w.A + 1, rehearsal = daySeed(sha("SYNTHETIC rehearsal secret"), 30, 1), before = files(w.s);
  const at = (o: Opt): string => { const inbox = tmp("dojo-p-guard-"); writeDay(w, d, w.eve, { ...o, inbox }); return inbox; };
  const cases: [string, string][] = [[at({ seed: rehearsal }), "seed_outside_anchor_chain"], // M-E6: a rehearsal bundle in the inbox (TB-5)
    [at({ day: w.A, seed: rehearsal }), "day_not_after_anchor"], [at({ day: d + 1 }), "bundle_day_mismatch"],
    [at({ program: MINT }), "bundle_anchor_mismatch"], [at({ token: TOKEN_2022 }), "bundle_anchor_mismatch"], [at({ k: 3 }), "bundle_anchor_mismatch"]];
  for (const [inbox, code] of cases) refuses(() => publishDay({ inboxDir: inbox, stateDir: w.s, key: w.key, clock: slot(d) }), code);
  assert.deepEqual(files(w.s), before, "refused before any signature: nothing written");
  const early = world({ history: false }); // decision 231: no snapshot before the history line
  writeDay(early, d, early.eve);
  refuses(() => publishDay({ inboxDir: early.inbox, stateDir: early.s, key: early.key, clock: slot(d) }), "history_missing");
  const short = world({ horizon: 1, chain: 2 }); // day A + 2 is on the secret's chain but past the anchor's horizon: outside it
  writeDay(short, d + 1, writeDay(short, d, short.eve));
  publish(short, d);
  refuses(() => publishDay({ inboxDir: short.inbox, stateDir: short.s, key: short.key, clock: slot(d + 1) }), "seed_outside_anchor_chain");
  const late = (): number => (d + 1) * DAY - 1; // the end of day d, a published day: never a new anchor there (DOJO-WALK-GAPS-1 (c))
  refuses(() => publishAnchor({ stateDir: short.s, key: short.key, request: request(), clock: late }), "anchor_on_published_day");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:194 CONST "t < (d + 1) * DAY_MS" -> "t < d * DAY_MS"
test("dojo_publish_same_bundle_twice_publishes_nothing", () => {
  const w = world(), d = w.A + 1, run = (t: number) => ok(() => publishDay({ inboxDir: w.inbox, stateDir: w.s, key: w.key, clock: () => t }));
  writeDay(w, d, w.eve);
  assert.deepEqual(run((d + 1) * DAY - 1), { status: "nothing_to_publish", day: dateOf(d) }, "the seed of a day is never revealed before its end (M-12)");
  assert.equal(run(slot(d)()).status, "published");
  const tl = readFileSync(join(w.s, "timeline.jsonl"), "utf8"), pub = files(join(w.s, "public"));
  assert.deepEqual([run(slot(d)() + 3_600_000), readFileSync(join(w.s, "timeline.jsonl"), "utf8"), files(join(w.s, "public"))],
    [{ status: "nothing_to_publish", day: dateOf(d + 1) }, tl, pub], "the same bundle twice publishes nothing");
});
