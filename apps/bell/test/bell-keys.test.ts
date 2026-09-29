// MONARK Bell -- T-1b S-6 oracle (ADR-T1b-backend v2 D9; checkpoint-1 C-9; ESC-2 formula of 2026-09-23: any restore of a provider
// backup = exposure => counter-signed rotation). Rotation (cross-signed, key lost), revocation and --generate-key through the REAL
// publisher, each result read back by bell-verify.mjs under a SUPPLIED keyring. Plus the checkpoint-2 PR-1 folds: C-V-1 (the bare
// provider-label guard pinned to the operator vocabulary) and C-V-2 (a served timeline diverging at equal length), and the G2 PR-1
// rulings BELL-REPUBLISH-1 (a published run is never published again) and BELL-EPU-REQUIRED-1 (a g_t needs its gate). Inputs = real
// collect() runs (helpers/bell-served.ts); throwaway keys generated here, written only under the OS temp dir, removed after.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey, generateKeyPairSync, type KeyObject } from "node:crypto";
import { canonical, keyIdOf, keyringOf, lineHash, sha256Hex, signLine } from "../scripts/bell-chain.mjs";
import { BellPublishError, publishToDir, revokeKey, rotateKey, type RefusalCode } from "../scripts/bell-publish.mjs";
import { BellVerifyError, dirSource, verifyServed } from "../scripts/bell-verify.mjs";
import { operatorLabels, ETH_CALL_KEYLESS_LABELS, GET_LOGS_KEYLESS_LABELS } from "../../../packages/rpc-guard/src/transport.ts";
import { T_PUBLISH, dropRun, readJson, tmp, type Obj } from "./helpers/bell-served.ts";
import { ADV_BARS_LABEL, CASH_CLOSE_LABEL, CASH_CROSS_LABEL } from "../src/close.ts";

const HERE = dirname(fileURLToPath(import.meta.url)), SCRIPT = join(HERE, "..", "scripts", "bell-publish.mjs");
const gen = (): KeyObject => generateKeyPairSync("ed25519").privateKey;
const [K1, K2, K3] = [gen(), gen(), gen()] as const;
const pub = (s: string, key: KeyObject, name: string, usdc: bigint, dt: number): void => {
  dropRun(s, name, usdc);
  publishToDir({ inboxDir: join(s, "inbox"), stateDir: s, privateKey: key, clock: () => T_PUBLISH + dt });
};
async function outcome(p: Promise<unknown>): Promise<string> {
  try { await p; return "accepted"; } catch (e) { if (e instanceof BellVerifyError) return `${e.code}: ${e.detail}`; throw e; }
}
const check = (s: string, keyring: unknown): Promise<string> => outcome(verifyServed({ source: dirSource(join(s, "public")), keyring }));
const report = (s: string, keyring: unknown) => verifyServed({ source: dirSource(join(s, "public")), keyring });
const servedKeyring = (s: string): Obj => readJson(join(s, "public", "bell", "pubkey.json"));
const keyRows = (kr: Obj): unknown[][] => (kr.keys as Obj[]).map((k) => [k.key_id, k.status, k.valid_from_seq, k.valid_to_seq, k.revoked_from_seq, k.continuity]);
const lines = (p: string): Obj[] => readFileSync(p, "utf8").trimEnd().split("\n").map((l) => JSON.parse(l) as Obj);
function refuses(f: () => unknown, code: RefusalCode): void { assert.throws(f, (e: unknown) => e instanceof BellPublishError && e.code === code, code); }
const [id1, id2, id3] = [keyIdOf(K1), keyIdOf(K2), keyIdOf(K3)];

// ---- (a) a rotation signed by the old AND the new key verifies; a rotation line without sig_new is refused ----
test("bell_key_rotation_cross_signed_verifies", async (t) => {
  const s = tmp("t1b-rot-");
  pub(s, K1, "b0", 365n, 0);
  assert.equal(rotateKey({ stateDir: s, oldKey: K1, newKey: K2, clock: () => T_PUBLISH + 1 }).key_id, id2);
  pub(s, K2, "b1", 366n, 2);
  assert.deepEqual(keyRows(servedKeyring(s)), [[id1, "retired", 1, 2, undefined, undefined], [id2, "active", 2, undefined, undefined, undefined]]);
  const r = await report(s, servedKeyring(s)); // the supplied keyring = the served one, as committed after the rotation
  assert.deepEqual([r.status, r.lines, r.active_key_id, r.breaks, r.voided_lines], ["consistent_with_supplied_keyring", 3, id2, [], []]);
  refuses(() => { pub(s, K1, "b2", 367n, 3); }, "signing_key_not_in_keyring");
  refuses(() => rotateKey({ stateDir: s, oldKey: K2, newKey: K1, clock: () => T_PUBLISH + 3 }), "key_already_in_keyring");
  const bare = tmp("t1b-rot2-"); // the rotation as head, then its sig_new stripped from the SERVED line (sig excludes sig_new)
  pub(bare, K1, "b0", 365n, 0);
  rotateKey({ stateDir: bare, oldKey: K1, newKey: K2, clock: () => T_PUBLISH + 1 });
  const tl = join(bare, "public", "timeline.jsonl"), ls = lines(tl);
  assert.equal(await check(bare, servedKeyring(bare)), "accepted");
  writeFileSync(tl, ls.map((l) => canonical(l.seq === 2 ? { ...l, sig_new: l.sig } : l) + "\n").join("")); // C-2: sig_new a copy of sig (the OLD key's)
  assert.equal(await check(bare, servedKeyring(bare)), "signature_invalid: line 2", "C-2: sig_new is not the new key's signature");
  delete ls[1]!.sig_new;
  writeFileSync(tl, ls.map((l) => canonical(l) + "\n").join(""));
  assert.equal(await check(bare, servedKeyring(bare)), "signature_invalid: line 2", "a rotation line without sig_new");
  // the operator CLI (ADR D9): both keys from $CREDENTIALS_DIRECTORY only, one JSON line out
  const creds = tmp("t1b-creds-");
  t.after(() => { rmSync(creds, { recursive: true, force: true }); });
  writeFileSync(join(creds, "bell-signing-key"), K2.export({ type: "pkcs8", format: "pem" }));
  writeFileSync(join(creds, "bell-signing-key-new"), K3.export({ type: "pkcs8", format: "pem" }));
  const env: NodeJS.ProcessEnv = { ...process.env, CREDENTIALS_DIRECTORY: creds };
  for (const a of [["--rotate", "--revoke", id1, "--from-seq", "1"], ["--revoke", id1, "--from-seq", "1", "--broken"], ["--generate-key"], ["--inbox", s, "--broken"], ["--generate-key", join(creds, "k"), "--rotate"], ["--rotate", "--state"]]) { // C-D-2 (b) // C-8 (b): one mode, --broken
    const u = spawnSync(process.execPath, [SCRIPT, ...a, "--state", s], { env, encoding: "utf8", cwd: creds }); // with --rotate only, never a flag as a value
    assert.deepEqual([u.status, u.stdout, /^bell\/publish: usage: /.test(u.stderr)], [1, "", true], a.join(" "));
  }
  assert.deepEqual([lines(join(s, "timeline.jsonl")).length, readdirSync(creds).length], [3, 2], "C-8 (b): no key line, no key file named after a flag");
  const cli = spawnSync(process.execPath, [SCRIPT, "--rotate", "--state", s], { env, encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.deepEqual([(JSON.parse(cli.stdout) as Obj).status, (JSON.parse(cli.stdout) as Obj).key_id], ["rotated", id3]);
  assert.equal((await report(s, servedKeyring(s))).active_key_id, id3);
  writeFileSync(join(s, "public", "bell", "pubkey.json"), canonical(keyringOf(K1, 1)) + "\n"); // C-3 (D-2 strict): the pre-rotation keyring served AND supplied
  assert.equal(await check(s, keyringOf(K1, 1)), "rotation_key_not_in_keyring: line 2", "C-3: a counter-signed rotation to a key outside the supplied keyring");
});

// ---- (b) a revoked key: its lines at seq >= revoked_from_seq are void, from the timeline OR from the supplied keyring ----
test("bell_revoked_key_lines_after_revocation_rejected", async () => {
  const s = tmp("t1b-rev-");
  pub(s, K1, "b0", 365n, 0);
  pub(s, K1, "b1", 366n, 1);
  rotateKey({ stateDir: s, oldKey: K1, newKey: K2, clock: () => T_PUBLISH + 2 });
  refuses(() => revokeKey({ stateDir: s, key: K2, revokedKeyId: id2, revokedFromSeq: 2, clock: () => T_PUBLISH + 3 }), "revocation_invalid");
  refuses(() => revokeKey({ stateDir: s, key: K2, revokedKeyId: id1, revokedFromSeq: 0, clock: () => T_PUBLISH + 3 }), "revocation_invalid");
  revokeKey({ stateDir: s, key: K2, revokedKeyId: id1, revokedFromSeq: 2, clock: () => T_PUBLISH + 3 });
  pub(s, K2, "b2", 367n, 4);
  assert.deepEqual(keyRows(servedKeyring(s))[0], [id1, "revoked", 1, 3, 2, undefined]);
  assert.deepEqual((await report(s, servedKeyring(s))).voided_lines, [2, 3], "the revoked key's lines from seq 2 are void");
  const before = { schema: "bell-keyring-v1", keys: [...keyringOf(K1, 1).keys, ...keyringOf(K2, 3).keys] }; // committed BEFORE the revocation
  assert.deepEqual((await report(s, before)).voided_lines, [2, 3], "known from the timeline's revocation line alone");
  const forged = join(s, "public", "timeline.jsonl"), ls = lines(forged), last = ls[ls.length - 1]!;
  const f6: Obj = { ...last, seq: 6, prev_line_hash: lineHash(last), key_id: id1 };
  delete f6.sig;
  writeFileSync(forged, [...ls, { ...f6, sig: signLine(f6, K1) }].map((l) => canonical(l) + "\n").join(""));
  assert.equal(await check(s, servedKeyring(s)), "key_not_active: line 6", "a line signed by the revoked key after the revocation");
  const oob = tmp("t1b-oob-"); // the revocation known ONLY out of band: the served timeline has none, its head is the revoked key's
  pub(oob, K1, "b0", 365n, 0);
  pub(oob, K1, "b1", 366n, 1);
  assert.equal(await check(oob, { schema: "bell-keyring-v1", keys: [{ ...keyringOf(K1, 1).keys[0], revoked_from_seq: 2 }] }), "head_signed_by_revoked_key: line 2");
  for (const m of [{ revoked_from_seq: "2" }, { revoked_from_seq: 1.5 }, { revoked_from_seq: 0 }, {}, { status: "active", revoked_from_seq: "2" }]) { // C-D-1: whatever the status // C-9 (a): a malformed marker of the SUPPLIED keyring
    assert.equal(await check(oob, { schema: "bell-keyring-v1", keys: [{ ...keyringOf(K1, 1).keys[0], status: "revoked", ...m }] }), "keyring_invalid: the supplied keyring", JSON.stringify(m));
  }
  assert.equal(await check(oob, keyringOf(K1, 1)), "accepted");
  const priv = join(s, "timeline.jsonl"); // C-9 (b): a private rotation line whose new_key_id is not its key's => a NAMED start-up refusal, never a TypeError
  writeFileSync(priv, lines(priv).map((l) => canonical(l.kind === "key_rotation" ? { ...l, new_key_id: "0".repeat(64) } : l) + "\n").join(""));
  refuses(() => revokeKey({ stateDir: s, key: K2, revokedKeyId: id1, revokedFromSeq: 2, clock: () => T_PUBLISH + 9 }), "existing_timeline_corrupt");
});

// ---- (c) key LOST: continuity "broken", signed by the new key alone, accepted only if that key is in the SUPPLIED keyring ----
test("bell_key_loss_break_accepted_only_if_new_key_in_supplied_keyring", async () => {
  const s = tmp("t1b-loss-");
  pub(s, K1, "b0", 365n, 0);
  const oldServed = readFileSync(join(s, "public", "bell", "pubkey.json"));
  rotateKey({ stateDir: s, newKey: K2, clock: () => T_PUBLISH + 1 }); // no old key: it is lost
  const both = servedKeyring(s), onlyK1 = keyringOf(K1, 1);
  assert.deepEqual(keyRows(both), [[id1, "lost", 1, 1, undefined, undefined], [id2, "active", 2, undefined, undefined, "broken"]]);
  const r = await report(s, both);
  assert.deepEqual([r.status, r.breaks], ["consistent_with_supplied_keyring", [{ seq: 2, lost_key_id: id1, new_key_id: id2 }]], "the break is REPORTED");
  assert.equal(await check(s, onlyK1), `served_key_not_in_keyring: ${id2}`);
  writeFileSync(join(s, "public", "bell", "pubkey.json"), oldServed); // a host serving the pre-loss keyring: the timeline alone decides
  assert.equal(await check(s, onlyK1), "rotation_key_not_in_keyring: line 2", "a break to a key outside the supplied keyring (C-9)");
  assert.equal(await check(s, both), "accepted");
  pub(s, K2, "b1", 366n, 2);
  assert.deepEqual((await report(s, both)).breaks, [{ seq: 2, lost_key_id: id1, new_key_id: id2 }], "still reported after the next publication");
});

// ---- (d) --generate-key: public part only on stdout, 0600 (POSIX), never over an existing file ----
test("bell_keygen_prints_public_only_refuses_overwrite", (t) => {
  const dir = tmp("t1b-keygen-"), p = join(dir, "signing-key.pem");
  t.after(() => { rmSync(dir, { recursive: true, force: true }); });
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.CREDENTIALS_DIRECTORY;
  const run = () => spawnSync(process.execPath, [SCRIPT, "--generate-key", p], { env, encoding: "utf8" });
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  const out = JSON.parse(first.stdout) as { key_id: string; jwk: Obj };
  assert.deepEqual([Object.keys(out).sort(), Object.keys(out.jwk).sort()], [["jwk", "key_id"], ["crv", "kty", "x"]], "public members only");
  assert.ok(!/"d"|PRIVATE/.test(first.stdout + first.stderr), "nothing private is printed");
  const key = createPrivateKey(readFileSync(p));
  assert.deepEqual([key.asymmetricKeyType, keyIdOf(key)], ["ed25519", out.key_id], "the file holds the key whose public part was printed");
  const sha = (): string => createHash("sha256").update(readFileSync(p)).digest("hex"), before = sha(), again = run();
  assert.deepEqual([again.status, again.stdout], [1, ""]);
  assert.match(again.stderr, /^bell\/publish: key_file_exists: /);
  assert.equal(sha(), before, "the existing key file is untouched");
  if (process.platform === "win32") t.diagnostic("POSIX-ONLY-0600: mode 0600 not asserted under win32 (no POSIX mode bits; declared, backlog S-6 (d))");
  else assert.equal(statSync(p).mode & 0o777, 0o600);
});

// ---- C-V-1 (checkpoint-2 PR-1): BARE_LABEL is right only because the operator vocabulary is dot-free: pin the two together ----
test("bell_publish_bare_label_guard_pins_operator_vocabulary", () => {
  const keyless = new Set([...ETH_CALL_KEYLESS_LABELS, ...GET_LOGS_KEYLESS_LABELS]); // refused in --operators (collect.ts:708)
  const labels = operatorLabels({ BELL_SOLANA_RPC: "https://rpc.example.invalid", CHAINSTACK_ETH_URL: "https://cs.example.invalid" }).map(String);
  // + the ETH leg's fault label (collect.ts:829) + the three cash-leg labels (ADR-BELL-CASH-LEG-1 C-11: they publish)
  const emitted = [...labels.filter((l) => !keyless.has(l)), "ethereum", CASH_CLOSE_LABEL, CASH_CROSS_LABEL, ADV_BARS_LABEL].sort();
  // DRAND-RELAY-GET-1a (ADR-RPC-GUARD-DRAND-1 D-1, Q-2, 2026-09-27): + drand-cf, drand-pl, the dot-free drand relay labels of the guard.
  assert.deepEqual(emitted, ["adv-bars", "cash-close", "cash-crosscheck", "chainstack", "drand-cf", "drand-pl", "ethereum", "helius", "solana-foundation", "xstocks-issuer"], "the labels a Bell provenance can carry");
  const withLabel = (label: string, where: "providers" | "faults"): string => {
    const s = tmp("t1b-lbl-");
    dropRun(s, "b0", 365n);
    const f = join(s, "inbox", "b0", "r0", "provenance.json"), o = readJson(f), pv = o.providers as Obj;
    if (where === "providers") pv.providers = [label]; else pv.faults = [{ provider: label, status: "503" }];
    writeFileSync(f, JSON.stringify(o, null, 2));
    try { return publishToDir({ inboxDir: join(s, "inbox"), stateDir: s, privateKey: K1, clock: () => T_PUBLISH }).status; } catch (e) { return e instanceof BellPublishError ? e.code : "fatal"; }
  };
  for (const l of emitted) for (const w of ["providers", "faults"] as const) assert.equal(withLabel(l, w), "published", `${l} in ${w}`);
  // + the two host labels the cash leg emitted before D2 (seq 1 journals): refused, never served
  for (const l of [...keyless, "helius-rpc.com", "databento.com", "polygon.io"]) for (const w of ["providers", "faults"] as const) assert.equal(withLabel(l, w), "url_or_key_shaped_string", `${l} in ${w}`);
});

// ---- C-V-2 (checkpoint-2 PR-1, mutant mv5): public/timeline.jsonl of the SAME length as the private one but different => refused ----
test("bell_publish_refuses_served_timeline_diverging_at_equal_length", () => {
  const s = tmp("t1b-div-");
  pub(s, K1, "b0", 365n, 0);
  pub(s, K1, "b1", 366n, 1);
  const p = join(s, "public", "timeline.jsonl"), ls = readFileSync(p, "utf8").split("\n");
  ls[1] = ls[1]!.replace(/"published_at":"[^"]+"/, `"published_at":"${new Date(T_PUBLISH + 9).toISOString()}"`);
  writeFileSync(p, ls.join("\n"));
  assert.equal(readFileSync(p, "utf8").split("\n").length, readFileSync(join(s, "timeline.jsonl"), "utf8").split("\n").length, "equal line count");
  dropRun(s, "b2", 367n);
  const snap = tmp("t1b-div-snap-");
  cpSync(s, snap, { recursive: true });
  refuses(() => publishToDir({ inboxDir: join(s, "inbox"), stateDir: s, privateKey: K1, clock: () => T_PUBLISH + 2 }), "existing_timeline_corrupt");
  for (const f of ["timeline.jsonl", "keyring.json", "public/timeline.jsonl", "public/state.json"]) assert.equal(readFileSync(join(s, f), "utf8"), readFileSync(join(snap, f), "utf8"), `${f} untouched`);
});

// ---- G2 PR-1 ruling BELL-REPUBLISH-1 (O-1): a run already published is NEVER published again; only the bundle's new runs are ----
test("bell_publish_never_republishes_a_published_run", () => {
  const s = tmp("t1b-repub-"), P = (dt: number) => publishToDir({ inboxDir: join(s, "inbox"), stateDir: s, privateKey: K1, clock: () => T_PUBLISH + dt });
  const cited = (): string[] => lines(join(s, "timeline.jsonl")).flatMap((l) => (l.runs as Obj[]).map((r) => String(r.bell_sha)));
  dropRun(s, "b0", 365n); // run A
  P(0);
  const [a] = cited();
  dropRun(s, "b1", 365n, 2); // runs A (already published) and B (new)
  const out: string[] = [], w = process.stderr.write.bind(process.stderr);
  process.stderr.write = (c: string | Uint8Array): boolean => { out.push(String(c)); return true; };
  try { assert.equal(P(1).status, "published"); } finally { process.stderr.write = w; }
  assert.equal(out.join(""), "bell/publish: skipped_already_published 1\n", "the skip is journaled, never silent");
  assert.equal(cited().filter((x) => x === a).length, 1, "run A is cited by ONE publication line");
  assert.deepEqual((readJson(join(s, "public", "state.json")).runs as Obj[]).map((r) => r.bell_sha), [cited()[1]], "line 2 publishes run B only");
  dropRun(s, "b2", 365n, 2); // A and B again: nothing new (and not identical to the last publication, so C-in-9 alone would not stop it)
  assert.equal(P(2).status, "nothing_to_publish");
  assert.equal(lines(join(s, "timeline.jsonl")).length, 2);
});

// ---- G2 PR-1 ruling BELL-EPU-REQUIRED-1 (O-2): a g_t gap WITHOUT earliest_publish_utc is refused fail-closed by C-in-5 ----
test("bell_publish_refuses_gt_gap_without_earliest_publish_utc", () => {
  const s = tmp("t1b-epu-"), run = join(s, "inbox", "b0", "r0");
  dropRun(s, "b0", 365n);
  const st = readJson(join(run, "state.json")), g = ((st.digest as Obj).gaps as Obj[]).find((x) => "gT" in x)!;
  assert.equal(typeof g.earliest_publish_utc, "number", "collect() gates its g_t (non-vacuity)");
  delete g.earliest_publish_utc;
  st.bell_sha = sha256Hex(canonical(st.digest)); // re-sealed: C-in-3 and C-in-7 pass, only C-in-5 can object
  writeFileSync(join(run, "state.json"), JSON.stringify(st, null, 2));
  const pv = readJson(join(run, "provenance.json"));
  pv.bellSha = st.bell_sha;
  writeFileSync(join(run, "provenance.json"), JSON.stringify(pv, null, 2));
  refuses(() => publishToDir({ inboxDir: join(s, "inbox"), stateDir: s, privateKey: K1, clock: () => T_PUBLISH }), "session_not_yet_publishable");
  assert.deepEqual(readdirSync(s), ["inbox"], "nothing written");
});
