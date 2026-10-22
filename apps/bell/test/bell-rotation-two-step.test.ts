// MONARK Bell -- the rotation in two steps (G0 BELL-COLLECT-TIMER-1 DC-8 (a), Q-6 "Signature en deux temps"; PLAN-P5 C5-4, lot 5a): the
// key_rotation line of rotateKey, drafted on the new host (--rotate-draft, the new key only), cosigned on the former host (--rotate-cosign,
// the old key only) and committed on the new host (--rotate-commit, no key), each through the REAL command line in its own process with
// its own $CREDENTIALS_DIRECTORY, so no private key leaves the directory of its run and only the line's public bytes pass between runs.
// Inputs: real collect() runs (helpers/bell-served.ts), published at an instant before the runs of the test (the draft reads the real
// clock); throwaway keys generated here, written only under the OS temp dir. The committed chronology is read back by bell-verify.mjs under
// the committed keyring of (R2) (RUNBOOK "Key incidents") and walked by the probe's own code (scripts/probe-bell.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash, generateKeyPairSync, type KeyObject } from "node:crypto";
import { canonical, keyIdOf, keyringOf, signLine } from "../scripts/bell-chain.mjs";
import { publishToDir, rotateKey } from "../scripts/bell-publish.mjs";
import { BellVerifyError, dirSource, verifyServed } from "../scripts/bell-verify.mjs";
import { trustOf as probeTrustOf, walkLines } from "../../../scripts/probe-bell.mjs";
import { REPO, dropRun, readJson, tmp, type Obj } from "./helpers/bell-served.ts";

const SCRIPT = join(REPO, "apps", "bell", "scripts", "bell-publish.mjs");
const gen = (): KeyObject => generateKeyPairSync("ed25519").privateKey;
const [K1, K2, K3] = [gen(), gen(), gen()] as const;
const [id1, id2, id3] = [keyIdOf(K1), keyIdOf(K2), keyIdOf(K3)];
const pem = (k: KeyObject): string => k.export({ type: "pkcs8", format: "pem" }) as string;
const T0 = Date.now() - 3_600_000; // the seq 1 publication: past the fixture's gates, before the draft's real clock
const DRAFT_KEYS = ["key_id", "kind", "new_key", "new_key_id", "prev_line_hash", "published_at", "schema", "seq", "sig_new"];
/** A state holding ONE publication (seq 1), signed by K1 at T0. */
function seeded(): string {
  const s = tmp("rot2-");
  dropRun(s, "b0", 365n);
  publishToDir({ inboxDir: join(s, "inbox"), stateDir: s, privateKey: K1, clock: () => T0 });
  return s;
}
/** A credentials directory holding exactly `files` (name -> content). */
function creds(files: Record<string, string>): string {
  const d = tmp("rot2-creds-");
  for (const [n, c] of Object.entries(files)) writeFileSync(join(d, n), c);
  return d;
}
interface Run { status: number | null; stdout: string; stderr: string }
/** One run of the real publisher: `credDir` its $CREDENTIALS_DIRECTORY, or null for an environment without the variable. */
function run(args: string[], credDir: string | null): Run {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.CREDENTIALS_DIRECTORY;
  if (credDir !== null) env.CREDENTIALS_DIRECTORY = credDir;
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { env, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}
/** Every file under `dir`, relative, with the sha256 of its bytes, sorted: "nothing written" is this list unchanged. */
function tree(dir: string, rel = ""): string[] {
  return readdirSync(join(dir, rel)).flatMap((n) => {
    const r = rel === "" ? n : `${rel}/${n}`;
    return statSync(join(dir, r)).isDirectory() ? tree(dir, r) : [`${r} ${createHash("sha256").update(readFileSync(join(dir, r))).digest("hex")}`];
  }).sort();
}
const io = (text: string): string => { const p = join(tmp("rot2-io-"), "line.json"); writeFileSync(p, text); return p; };
const lastLine = (s: string): Obj => JSON.parse(readFileSync(join(s, "timeline.jsonl"), "utf8").trimEnd().split("\n").pop() ?? "null") as Obj;
const refusal = (field: string): string => `bell/publish: rotation_line_mismatch: ${field}: the line does not follow the head of this state or its signatures\n`;

// killer: apps/bell/scripts/bell-publish.mjs:571 CONST "keyLoader()(\"bell-signing-key-new\")" -> "keyLoader()(\"bell-signing-key\")"
test("bell_rotation_two_step_signs_without_moving_keys", () => {
  const a = seeded(), b = tmp("rot2-b-"), c = tmp("rot2-c-");
  cpSync(a, b, { recursive: true });
  cpSync(a, c, { recursive: true });
  const junk = "not a key\n"; // a file under the OTHER key's name: a run that read it would refuse signing_key_missing
  const draftCreds = creds({ "bell-signing-key-new": pem(K2), "bell-signing-key": junk }), cosignCreds = creds({ "bell-signing-key": pem(K1), "bell-signing-key-new": junk });
  const before = tree(b);
  const draft = run(["--rotate-draft", "--state", b], draftCreds);
  assert.deepEqual([draft.status, draft.stderr], [0, ""], "the draft runs on the new key alone");
  assert.deepEqual(tree(b), before, "the draft writes nothing");
  const drafted = JSON.parse(draft.stdout) as Obj;
  assert.equal(draft.stdout, canonical(drafted) + "\n", "the draft prints one canonical line");
  assert.deepEqual([Object.keys(drafted).sort(), drafted.seq, drafted.key_id, drafted.new_key_id], [DRAFT_KEYS, 2, id1, id2], "sig_new, no sig; seq 2 on the head, the old key active");
  const cosign = run(["--rotate-cosign", "--line", io(draft.stdout), "--state", b], cosignCreds);
  assert.deepEqual([cosign.status, cosign.stderr], [0, ""], "the cosign runs on the old key alone");
  assert.deepEqual(tree(b), before, "the cosign writes nothing");
  const commit = run(["--rotate-commit", "--line", io(cosign.stdout), "--state", b], null);
  assert.deepEqual([commit.status, commit.stderr], [0, ""], "the commit runs with no $CREDENTIALS_DIRECTORY at all");
  const r = JSON.parse(commit.stdout) as Obj;
  assert.deepEqual([r.status, r.seq, r.key_id, r.published_at], ["rotated", 2, id2, drafted.published_at]);
  // The same rotation by ONE process holding both keys (rotateKey), on the same state and at the same instant: the same line, the same state.
  const ref = rotateKey({ stateDir: a, oldKey: K1, newKey: K2, clock: () => Date.parse(String(drafted.published_at)) });
  assert.equal(r.line_hash, ref.line_hash, "the committed line is rotateKey's line");
  assert.equal(readFileSync(join(b, "timeline.jsonl"), "utf8"), readFileSync(join(a, "timeline.jsonl"), "utf8"), "the private timeline, byte for byte");
  assert.deepEqual(tree(b), tree(a), "keyring.json and public/ too: the state of the two steps is the state of rotateKey");
  // Each form loads its own key and no other: without it, it refuses before any read of the line, nothing written.
  const cBefore = tree(c), line = io(cosign.stdout);
  const runs: Array<[string, Run]> = [
    ["draft, the old key only", run(["--rotate-draft", "--state", c], creds({ "bell-signing-key": pem(K1) }))],
    ["cosign, the new key only", run(["--rotate-cosign", "--line", io(draft.stdout), "--state", c], creds({ "bell-signing-key-new": pem(K2) }))],
    ["cosign, a key that is not the active one", run(["--rotate-cosign", "--line", io(draft.stdout), "--state", c], creds({ "bell-signing-key": pem(K2) }))],
  ];
  assert.deepEqual(runs.map(([n, x]) => [n, x.status, x.stdout, x.stderr]), [
    ["draft, the old key only", 1, "", "bell/publish: signing_key_missing: $CREDENTIALS_DIRECTORY/bell-signing-key-new absent or unreadable\n"],
    ["cosign, the new key only", 1, "", "bell/publish: signing_key_missing: $CREDENTIALS_DIRECTORY/bell-signing-key absent or unreadable\n"],
    ["cosign, a key that is not the active one", 1, "", "bell/publish: signing_key_not_in_keyring: the loaded key is not the active key of the state keyring\n"]]);
  assert.deepEqual(tree(c), cBefore, "nothing written by a refused form");
  assert.equal(run(["--rotate-commit", "--line", line, "--state", c], null).status, 0, "the cosigned line commits on a copy of the same head");
});

// killer: apps/bell/scripts/bell-publish.mjs:407 SDL "  if (line.seq !== st.lines.length + 1) bad(\"seq\");" -> ""
test("bell_rotation_two_step_refuses_a_mismatched_line", () => {
  const s = seeded(), head = lastLine(s);
  const draft = run(["--rotate-draft", "--state", s], creds({ "bell-signing-key-new": pem(K2) }));
  assert.equal(draft.status, 0, draft.stderr);
  const good = JSON.parse(draft.stdout) as Obj, k3 = keyringOf(K3, 1).keys[0]!;
  /** The line re-signed sig_new by the new key after a change: only the check of its place on the head can refuse it. */
  const resign = (l: Obj): Obj => { const x: Obj = { ...l }; delete x.sig_new; return { ...x, sig_new: signLine(x, K2) }; };
  const cases: Array<[string, Obj | string, string]> = [
    ["seq", resign({ ...good, seq: 3 }), "seq"],
    ["prev_line_hash", resign({ ...good, prev_line_hash: "0".repeat(64) }), "prev_line_hash"],
    ["key_id", resign({ ...good, key_id: id3 }), "key_id"],
    ["published_at before the head's", resign({ ...good, published_at: new Date(Date.parse(String(head.published_at)) - 1).toISOString() }), "published_at"],
    ["published_at one millisecond on, after sig_new", { ...good, published_at: new Date(Date.parse(String(good.published_at)) + 1).toISOString() }, "sig_new"],
    ["the new key swapped after sig_new", { ...good, new_key: k3.jwk, new_key_id: id3 }, "sig_new"],
    ["one octet of sig_new", { ...good, sig_new: `${String(good.sig_new).slice(0, -2)}${String(good.sig_new).endsWith("AA") ? "AQ" : "AA"}` }, "sig_new"],
    ["a space inserted", draft.stdout.replace("\"kind\":", "\"kind\": "), "bytes"],
  ];
  const before = tree(s), cosignCreds = creds({ "bell-signing-key": pem(K1) });
  const text = (x: Obj | string): string => (typeof x === "string" ? x : canonical(x) + "\n");
  const expect = (field: string): string => (field === "bytes" ? "bell/publish: rotation_line_mismatch: bytes: --line holds no canonical line with its final newline\n" : refusal(field));
  for (const [name, line, field] of cases) {
    const co = run(["--rotate-cosign", "--line", io(text(line)), "--state", s], cosignCreds);
    assert.deepEqual([co.status, co.stdout, co.stderr], [1, "", expect(field)], `cosign: ${name}`);
    // the same change behind a sig of the old key: the commit refuses it as well
    const signed = typeof line === "string" ? line : canonical({ ...line, sig: signLine(line, K1) }) + "\n";
    const cm = run(["--rotate-commit", "--line", io(signed), "--state", s], null);
    assert.deepEqual([cm.status, cm.stdout, cm.stderr], [1, "", expect(field)], `commit: ${name}`);
    assert.deepEqual(tree(s), before, `nothing written: ${name}`);
  }
  // The commit needs both signatures: the draft alone (no sig) and a sig that is not the old key's are refused, nothing written.
  const cosigned = JSON.parse(run(["--rotate-cosign", "--line", io(draft.stdout), "--state", s], cosignCreds).stdout) as Obj;
  const bare = run(["--rotate-commit", "--line", io(draft.stdout), "--state", s], null), forged = run(["--rotate-commit", "--line", io(canonical({ ...cosigned, sig: signLine(good, K3) }) + "\n"), "--state", s], null);
  assert.deepEqual([[bare.status, bare.stderr], [forged.status, forged.stderr]], [[1, refusal("fields")], [1, refusal("sig")]]);
  assert.deepEqual(tree(s), before, "nothing written by a refused commit");
  const ok = run(["--rotate-commit", "--line", io(canonical(cosigned) + "\n"), "--state", s], null);
  assert.equal(ok.status, 0, ok.stderr);
  const again = run(["--rotate-commit", "--line", io(canonical(cosigned) + "\n"), "--state", s], null);
  assert.deepEqual([again.status, again.stderr], [1, refusal("seq")], "a committed line is never committed twice");
});

// killer: apps/bell/scripts/bell-publish.mjs:423 CONST "key_id: activeKeyId(st.keyring), new_key" -> "key_id: nk.key_id, new_key"
test("bell_rotation_two_step_verifies_with_the_committed_keyring", async () => {
  const s = seeded(), committed = keyringOf(K1, 1);
  assert.equal(readFileSync(join(s, "public", "bell", "pubkey.json"), "utf8"), canonical(committed) + "\n", "before the rotation the committed keyring is the served one");
  const draft = run(["--rotate-draft", "--state", s], creds({ "bell-signing-key-new": pem(K2) }));
  const cosign = run(["--rotate-cosign", "--line", io(draft.stdout), "--state", s], creds({ "bell-signing-key": pem(K1) }));
  const commit = run(["--rotate-commit", "--line", io(cosign.stdout), "--state", s], null);
  assert.deepEqual([draft.status, cosign.status, commit.status], [0, 0, 0], `${draft.stderr}${cosign.stderr}${commit.stderr}`);
  dropRun(s, "b1", 366n); // the new key signs the next publication
  publishToDir({ inboxDir: join(s, "inbox"), stateDir: s, privateKey: K2, clock: () => Date.now() });
  // (R2): the new public key appended to the committed keyring as the RUNBOOK's command appends it, {key_id, jwk}, no status, no valid_from_seq.
  const nk = keyringOf(K2, 1).keys[0]!, r2 = { ...committed, keys: [...committed.keys, { key_id: nk.key_id, jwk: nk.jwk }] };
  const r = await verifyServed({ source: dirSource(join(s, "public")), keyring: r2 });
  assert.deepEqual([r.status, r.lines, r.head_seq, r.active_key_id, r.breaks, r.voided_lines], ["consistent_with_supplied_keyring", 3, 3, id2, [], []]);
  await assert.rejects(verifyServed({ source: dirSource(join(s, "public")), keyring: committed }), (e: unknown) => e instanceof BellVerifyError && e.code === "served_key_not_in_keyring",
    "before (R2) the committed keyring does not name the new key the state serves: the reader refuses (KEYRING-COMMIT-AFTER-KEY-LINE-1)");
  // The probe walks it with its own code: under (R2)'s keyring, and under the derived keyring served from then on, (R5)'s.
  const lines = readFileSync(join(s, "public", "timeline.jsonl"), "utf8").trimEnd().split("\n").map((l) => JSON.parse(l) as unknown);
  for (const kr of [r2, readJson(join(s, "public", "bell", "pubkey.json"))]) {
    const trust = probeTrustOf(kr);
    assert.ok(trust !== null, "the probe reads the keyring");
    const w = walkLines(lines, trust);
    assert.deepEqual([w.ok, w.ok ? w.active : null, w.ok ? w.breaks : null], [true, id2, []], "the probe walks the rotation and the publication after it");
  }
});
