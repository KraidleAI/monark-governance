// MONARK Bell -- T-1b S-4 oracle (ADR-T1b-backend v2 D6, D9, D11 control 5; checkpoint-1 C-9). bell-verify.mjs re-derives a
// served publication from its files alone and refuses BY NAME: a tampered middle line, a removed or foreign signature, a state
// not bound by the head, a wrong bell_sha in ANY run, a redirect, plain http off loopback, and a served key outside the SUPPLIED
// keyring (the trust root); without a keyring it reports "self_consistent_only". Inputs = real publisher outputs over REAL
// collect() runs (helpers/bell-served.ts), each refusal mutating the served files as an adversary would. Loopback only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { canonical, keyIdOf, keyringOf, signLine } from "../scripts/bell-chain.mjs";
import { BellVerifyError, VERIFY_BOUNDS, dirSource, urlAllowed, urlSource, verifyServed } from "../scripts/bell-verify.mjs";
import { rotateKey } from "../scripts/bell-publish.mjs";
import { readJson, resealHead, serveDir, servedState, tmp, type Obj } from "./helpers/bell-served.ts";

const HERE = dirname(fileURLToPath(import.meta.url)), SCRIPT = join(HERE, "..", "scripts", "bell-verify.mjs");
const K = generateKeyPairSync("ed25519").privateKey, KR = keyringOf(K, 1);
/** "<code>: <detail>" of the refusal, or "accepted". */
async function outcome(p: Promise<unknown>): Promise<string> {
  try { await p; return "accepted"; } catch (e) { if (e instanceof BellVerifyError) return `${e.code}: ${e.detail}`; throw e; }
}
const check = (pub: string, keyring: unknown = KR): Promise<string> => outcome(verifyServed({ source: dirSource(pub), keyring }));
const lines = (pub: string): Obj[] => readFileSync(join(pub, "timeline.jsonl"), "utf8").trimEnd().split("\n").map((l) => JSON.parse(l) as Obj);
const writeLines = (pub: string, ls: readonly Obj[]): void => { writeFileSync(join(pub, "timeline.jsonl"), ls.map((l) => canonical(l) + "\n").join("")); };
/** A copy of the served tree (the adversary's copy; the original stays intact). */
const copy = (pub: string): string => { const out = tmp("t1b-v-"); cpSync(pub, out, { recursive: true }); return out; };
/** Line n (1-based) replaced by f(line n); nothing else touched (the next line keeps the ORIGINAL prev_line_hash). */
function withLine(pub: string, n: number, f: (l: Obj) => Obj): string {
  const out = copy(pub), src = lines(pub);
  src[n - 1] = f(src[n - 1]!);
  writeLines(out, src);
  return out;
}
const resign = (l: Obj, key: KeyObject): Obj => { const b: Obj = { ...l }; delete b.sig; return { ...b, sig: signLine(b, key) }; };

// ---- every line is re-derived: a middle line altered (not the head, not bound by any immutable) is refused at its seq ----
test("bell_verify_detects_middle_line_tamper", async () => {
  const { pub } = servedState(K, 4);
  assert.equal(await check(pub), "accepted", "the untouched 4-line publication passes under the supplied keyring");
  const bad = withLine(pub, 2, (l) => { const runs = structuredClone(l.runs) as Array<{ records: Obj[] }>; runs[0]!.records[0]!.n_fills = 99; return { ...l, runs }; });
  assert.equal(await check(bad), "signature_invalid: line 2", "a record of line 2 altered: refused at line 2 (lines 3-4 and every immutable untouched)");
  assert.equal(await check(withLine(pub, 2, (l) => resign({ ...l, runs: (l.runs as Obj[]).map((r) => ({ ...r, records: [] })) }, K))), "chain_broken: line 3", "C-1: line 2 altered AND re-signed by the key holder");
});

// ---- signatures: removed, by a key outside the keyring, or by another key under the genuine key_id ----
test("bell_verify_rejects_removed_or_wrong_signature", async () => {
  const { pub } = servedState(K, 3), X = generateKeyPairSync("ed25519").privateKey;
  assert.equal(await check(withLine(pub, 2, (l) => { const c = { ...l }; delete c.sig; return c; })), "signature_invalid: line 2", "sig removed");
  assert.equal(await check(withLine(pub, 2, (l) => resign({ ...l, key_id: keyIdOf(X) }, X))), "key_not_in_keyring: line 2", "a key outside the keyring");
  assert.equal(await check(withLine(pub, 2, (l) => resign(l, X))), "signature_invalid: line 2", "another key under the genuine key_id");
});

// ---- binding: state.json and provenance.json served are the immutables cited by the head line, byte for byte ----
test("bell_verify_rejects_state_not_bound_by_head", async () => {
  const { pub } = servedState(K, 2);
  const flip = (rel: string): string => { const out = copy(pub), b = readFileSync(join(out, rel)), i = b.length - 2; b[i] = (b[i] ?? 0) ^ 1; writeFileSync(join(out, rel), b); return out; };
  assert.equal(await check(flip("state.json")), "state_not_bound_by_head: line 2", "one byte of state.json");
  assert.equal(await check(flip("provenance.json")), "state_not_bound_by_head: line 2", "one byte of provenance.json");
  const stale = copy(pub), l1 = lines(pub)[0]!;
  writeFileSync(join(stale, "state.json"), readFileSync(join(pub, "states", `${String(l1.state_sha256)}.json`)));
  assert.equal(await check(stale), "state_not_bound_by_head: line 2", "the previous (still signed) state served as current");
  assert.equal(await check(flip(`states/${String(l1.state_sha256)}.json`)), "immutable_mismatch: line 1", "C-4: one byte of a NON-head immutable");
  const one = servedState(K, 1).pub; // C-5: the key holder re-seals the envelope with a published_at other than its line's
  resealHead(one, K, (s) => { s.published_at = new Date(0).toISOString(); });
  assert.equal(await check(one), "envelope_mismatch: line 1", "C-5: the envelope's published_at differs from the line's");
});

// ---- bell_sha recomputed for EVERY run of every publication, the head re-signed by the key holder ----
test("bell_verify_recomputes_each_run_bell_sha", async () => {
  const { pub } = servedState(K, 1, 2);
  assert.equal(await check(pub), "accepted");
  for (const i of [0, 1]) {
    const out = copy(pub);
    resealHead(out, K, (s) => { (((s.runs as Obj[])[i]!.digest as Obj).gaps as Obj[])[0]!.vwap = "1.0000000000"; });
    assert.equal(await check(out), `bell_sha_mismatch: line 1 runs[${String(i)}]`, `run ${String(i)} of 2`);
  }
});

// ---- transport: https anywhere, http on a loopback literal only (no dial otherwise), no redirect followed, bounded bodies ----
test("bell_verify_refuses_redirect_and_offloopback_http", async () => {
  for (const u of ["https://bell.monarkgate.tech", "http://127.0.0.1:8080", "http://[::1]:8080/"]) assert.ok(urlAllowed(u), u);
  for (const u of ["http://bell.monarkgate.tech", "http://127.1:8080", "http://localhost:8080", "http://127.0.0.1.example.invalid", "http://u@127.0.0.1:8080", "https://u@x.invalid", "ftp://x.invalid"]) {
    assert.ok(!urlAllowed(u), u);
    assert.throws(() => urlSource(u), (e: unknown) => e instanceof BellVerifyError && e.code === "insecure_url", u);
  }
  const { pub } = servedState(K, 1), target = await serveDir(pub, null);
  const redirector = createServer((req, res) => { if ((req.url ?? "").startsWith("/mute/")) return; res.writeHead(302, { location: `${target.url}${req.url ?? "/"}` }); res.end(); }); // /mute/: silent (C-6)
  await new Promise<void>((r) => { redirector.listen(0, "127.0.0.1", () => { r(); }); });
  const a = redirector.address(), rUrl = `http://127.0.0.1:${String(a !== null && typeof a === "object" ? a.port : 0)}`;
  try {
    assert.equal(await outcome(verifyServed({ source: urlSource(target.url), keyring: KR })), "accepted", "served over loopback http");
    const hits = target.seen.length;
    assert.equal(await outcome(verifyServed({ source: urlSource(rUrl), keyring: KR })), "redirect_refused: timeline.jsonl");
    assert.equal(target.seen.length, hits, "the redirect target is never requested");
    assert.equal(await outcome(verifyServed({ source: urlSource(target.url, { ...VERIFY_BOUNDS, MAX_BODY_BYTES: 64 }), keyring: KR })), "too_large: timeline.jsonl");
    assert.equal(await outcome(verifyServed({ source: dirSource(pub, { ...VERIFY_BOUNDS, MAX_BODY_BYTES: 64 }), keyring: KR })), "too_large: timeline.jsonl", "C-6: directory source, body bound lowered");
    assert.equal(await outcome(verifyServed({ source: dirSource(pub), keyring: KR, bounds: { ...VERIFY_BOUNDS, MAX_LINE_BYTES: 64 } })), "too_large: timeline line 1", "C-6: line bound lowered");
    const hung = new Promise<string>((r) => { setTimeout(() => { r("hung"); }, 5000).unref(); }); // C-6: a race guard, never the 120 s test timeout
    assert.equal(await Promise.race([outcome(verifyServed({ source: urlSource(`${rUrl}/mute`, { ...VERIFY_BOUNDS, TIMEOUT_MS: 200 }), keyring: KR })), hung]), "unreachable: timeline.jsonl", "C-6: silent server, timeout lowered");
  } finally { redirector.closeAllConnections(); redirector.close(); await target.close(); }
});

// ---- C-9: the trust root is the SUPPLIED keyring; a served key outside it (a host that turned to its own key) is refused ----
test("bell_verify_trust_root_is_supplied_keyring_not_served_pubkey", async () => {
  const X = generateKeyPairSync("ed25519").privateKey, impostor = servedState(X, 2).pub;
  assert.equal(await check(impostor, null), "accepted", "the impostor tree IS self-consistent under its own served key");
  assert.equal(await check(impostor), `served_key_not_in_keyring: ${keyIdOf(X)}`, "refused under the supplied keyring");
  const { pub } = servedState(K, 1), extra = copy(pub);
  writeFileSync(join(extra, "bell", "pubkey.json"), canonical({ schema: "bell-keyring-v1", keys: [...KR.keys, ...keyringOf(X, 2).keys] }) + "\n");
  assert.equal(await check(extra), `served_key_not_in_keyring: ${keyIdOf(X)}`, "an extra served key, the timeline being genuine");
  const swapped = copy(pub); // the served keyring swapped for the impostor's
  writeFileSync(join(swapped, "bell", "pubkey.json"), readFileSync(join(impostor, "bell", "pubkey.json")));
  assert.equal(await check(swapped), `served_key_not_in_keyring: ${keyIdOf(X)}`);
  assert.equal(await check(pub), "accepted");
  rotateKey({ stateDir: dirname(pub), oldKey: K, newKey: X, clock: () => Date.now() }); // C-3 (D-2 strict): a COUNTER-SIGNED rotation to X, outside KR,
  writeFileSync(join(pub, "bell", "pubkey.json"), canonical(KR) + "\n"); // the pre-rotation keyring served: only the timeline can object
  assert.equal(await check(pub), "rotation_key_not_in_keyring: line 2", "C-3: the counter-signature adds no trust");
});

// ---- without --keyring: "self_consistent_only", never the keyring-rooted status; the CLI says the same ----
test("bell_verify_without_keyring_reports_self_consistent_only", async (t) => {
  const { pub } = servedState(K, 1), krFile = join(tmp("t1b-kr-"), "bell-keyring.json");
  const r = await verifyServed({ source: dirSource(pub) });
  assert.deepEqual([r.status, r.trust_root], ["self_consistent_only", "served_keyring"]);
  const rk = await verifyServed({ source: dirSource(pub), keyring: KR });
  assert.deepEqual([rk.status, rk.trust_root, rk.head_seq, rk.active_key_id], ["consistent_with_supplied_keyring", "supplied_keyring", 1, keyIdOf(K)]);
  writeFileSync(krFile, canonical(KR) + "\n");
  const cli = (...a: string[]): { status: number | null; out: Obj; err: string } => {
    const p = spawnSync(process.execPath, [SCRIPT, "--dir", pub, ...a], { encoding: "utf8" });
    t.diagnostic(`bell-verify ${a.join(" ")} -> exit ${String(p.status)}`);
    return { status: p.status, out: p.stdout === "" ? {} : JSON.parse(p.stdout) as Obj, err: p.stderr };
  };
  const bare = cli(), rooted = cli("--keyring", krFile);
  assert.deepEqual([bare.status, bare.out.status], [0, "self_consistent_only"]);
  assert.deepEqual([rooted.status, rooted.out.status], [0, "consistent_with_supplied_keyring"]);
  for (const a of [["--keyring"], ["--keyring", "--dir"]]) { const u = cli(...a); assert.deepEqual([u.status, u.out, /^bell\/verify: usage: /.test(u.err)], [1, {}, true], `C-8 (a): ${a.join(" ")} is a usage error`); }
  const tampered = withLine(pub, 1, (l) => ({ ...l, seq: 9 })), bad = spawnSync(process.execPath, [SCRIPT, "--dir", tampered], { encoding: "utf8" });
  assert.deepEqual([bad.status, bad.stdout], [1, ""]);
  assert.match(bad.stderr, /^bell\/verify: timeline_malformed: line 1\r?\n$/);
  assert.deepEqual(readJson(join(pub, "..", "keyring.json")), KR, "the state keyring is the one the test supplies");
});

// ---- B-5: the reader's only network is the global fetch of this one file; built-in imports only, no environment read ----
test("bell_verify_imports_builtins_and_fetch_only", () => {
  const text = readFileSync(SCRIPT, "utf8"), specs = [...text.matchAll(/\b(?:from|import)\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1] ?? "");
  assert.ok(specs.length >= 4, "imports parsed (non-vacuity)");
  for (const s of specs) assert.ok(["node:fs", "node:path", "node:url", "./bell-chain.mjs"].includes(s), `import '${s}' outside the allowlist`);
  assert.ok(/\bfetch\s*\(/.test(text), "the allowlisted fetch site exists (non-vacuity of the allowlist entry)");
  for (const re of [/node:https?\b/, /node:net\b/, /node:tls\b/, /child_process/, /\bundici\b/, /\brequire\s*\(/, /\bimport\s*\(/, /process\.env/]) assert.equal(re.test(text), false, String(re));
});
