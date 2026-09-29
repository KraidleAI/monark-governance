// MONARK Dojo -- PR-3a-1a oracle (ADR-DOJO-PR-3 section 4, PR-3a-1; cut DOJO-PR3A1-CUT-1, part 1a): the publisher's anchor, key modes
// and state, through the REAL module and its CLI, each served tree read back by the REAL verifier (dojo-verify.mjs) under a SUPPLIED
// dojo-keyring-v1. Keys are generated at run time by node:crypto and written only under the OS temp dir (TEMP on F: for every run of
// this lot), never committed; seed_anchor and horizon come from the real dojo-seed.mjs over a temp file. Anchor values: the mere's
// (D-3, D-8; decisions 225 (7), 234, 236, 248), the pinned read_rule of dojo-methods.ts, the pinned mint and the addresses of
// fixtures/collect/; the instants are SYNTHETIC.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, type KeyObject } from "node:crypto";
import { appendFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { keyIdOf } from "../../bell/scripts/bell-chain.mjs";
import { dirSource, verifyDojoServed } from "../scripts/dojo-verify.mjs";
import { initSeed } from "../scripts/dojo-seed.mjs";
import { ANCHOR_KEYS, DojoPublishError, publishAnchor, revokeKey, rotateKey } from "../scripts/dojo-publish.mjs";
import { READ_RULE } from "../src/dojo-methods.ts";
import { MINT, dojoKeyringOf } from "./helpers/dojo-fixture.ts";

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

// killer: apps/dojo/scripts/dojo-publish.mjs:136 SDL "closed keys" -> ""
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
});

// killer: apps/dojo/scripts/dojo-publish.mjs:179 CONST "wx" -> "w"
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

// killer: apps/dojo/scripts/dojo-publish.mjs:166 CONST "active" -> "lost"
test("dojo_publish_rotation_and_revocation_follow_bell", async () => {
  const [K1, K2, K3, K4] = [gen(), gen(), gen(), gen()], [id1, id2, id3, id4] = [K1, K2, K3, K4].map((k) => keyIdOf(k)) as [string, string, string, string];
  const s = tmp("dojo-p-keys-"), at = (dt: number) => (): number => T0 + dt;
  ok(() => publishAnchor({ stateDir: s, key: K1, request: request(), clock: at(0) })); // seq 1
  refuses(() => rotateKey({ stateDir: tmp("dojo-p-none-"), oldKey: K1, newKey: K2, clock: at(1) }), "no_timeline");
  refuses(() => rotateKey({ stateDir: s, oldKey: K2, newKey: K3, clock: at(1) }), "signing_key_not_in_keyring");
  assert.equal(ok(() => rotateKey({ stateDir: s, oldKey: K1, newKey: K2, clock: at(1) })).key_id, id2, "seq 2: cross-signed by K1 and K2");
  refuses(() => rotateKey({ stateDir: s, oldKey: K2, newKey: K1, clock: at(2) }), "key_already_in_keyring");
  refuses(() => publishAnchor({ stateDir: s, key: K1, request: request(), clock: at(2) }), "signing_key_not_in_keyring"); // a retired key signs nothing
  for (const [id, from] of [[id2, 2], [id1, 0], [id1, 4], [id4, 2]] as const) {
    refuses(() => revokeKey({ stateDir: s, key: K2, revokedKeyId: id, revokedFromSeq: from, clock: at(2) }), "revocation_invalid");
  }
  const v = tmp("dojo-p-void-"); // revoked from the rotation's own seq: that line of K1 is void, the reader refuses it (F-1)
  ok(() => publishAnchor({ stateDir: v, key: K1, request: request(), clock: at(0) }));
  ok(() => rotateKey({ stateDir: v, oldKey: K1, newKey: K2, clock: at(1) }));
  ok(() => revokeKey({ stateDir: v, key: K2, revokedKeyId: id1, revokedFromSeq: 2, clock: at(2) }));
  assert.deepEqual(await verify(v, served(v)), { ok: false, reason: "key_not_active", seq: 2, day: null,
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

// killer: apps/dojo/scripts/dojo-publish.mjs:13 CONST "import { pathToFileURL }" -> "import \"node:dns\"; import { pathToFileURL }"
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
    "apps/dojo/scripts/dojo-chain.mjs", "apps/dojo/scripts/dojo-core.mjs", "apps/dojo/scripts/dojo-publish.mjs"], "the whole import closure");
});

// killer: apps/dojo/scripts/dojo-publish.mjs:50 CONST "staging" -> "public/staging"
test("dojo_publish_state_is_outside_public", () => {
  const s = tmp("dojo-p-state-"), [K1, K2, K3] = [gen(), gen(), gen()];
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
  writeFileSync(priv, readFileSync(priv, "utf8").replace("\"k_reads\":4", "\"k_reads\":5")); // a private line altered after its signature
  const before = files(s);
  refuses(() => rotateKey({ stateDir: s, oldKey: K3, newKey: gen(), clock: () => T0 + 3 }), "existing_timeline_corrupt");
  assert.deepEqual(files(s), before, "a corrupt state is refused with nothing written");
});
