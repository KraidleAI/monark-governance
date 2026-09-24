// MONARK Bell -- T-1b S-1 oracle (ADR-T1b-backend v2 D3, D6; checkpoint-1 C-6). The .mjs chain primitives are proven
// EQUAL to the collector (canonical byte for byte; CLOSE_KEY by literal AND verdict), line signing excludes sig/sig_new,
// and the publication scripts import Node built-ins only. No network; every key is built in memory, none is committed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign as edSign, verify as edVerify } from "node:crypto";
import { canonical as digestCanonical, assertNoClose } from "../src/digest.ts";
import { canonical, CLOSE_KEY, assertNoCloseLike, signLine, verifyLine, keyIdOf, keyringOf, lineHash, GENESIS } from "../scripts/bell-chain.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const src = (rel: string): string => readFileSync(join(HERE, rel), "utf8");
const sha = (x: string | Uint8Array): string => createHash("sha256").update(x).digest("hex");

// ---- S-1 (a): canonical() of the .mjs is byte-equal to digest.ts canonical on a fixed corpus (C-6 duplicate) ----
test("bell_chain_canonical_equals_digest_canonical", () => {
  // non-ASCII built at run time (ASCII source, F-2): e-acute, a CJK ideograph, an astral emoji, a lone surrogate, U+2028, NUL
  const uni = String.fromCodePoint(0xe9, 0x4e2d, 0x1f600) + String.fromCharCode(0xdc00), ctl = String.fromCharCode(0x2028, 0) + "\"\\\n";
  const corpus: unknown[] = [null, true, false, 0, -0, -1, 1.5, -2.25e-7, 1e21, 123456789012345680000, 5e-324, "", "plain", uni, ctl, [], {},
    [1, "a", null, [], {}, [[-3]]], { b: 1, a: 2, "10": 3, "2": 4, Z: 5, [String.fromCodePoint(0xe9)]: 6, "": 7, nested: { y: [{ d: 1, c: 2 }], x: -0.5, e: "1e3" } }];
  for (const v of corpus) {
    assert.equal(canonical(v), digestCanonical(v as Parameters<typeof digestCanonical>[0]), `byte-equal on ${JSON.stringify(v)}`);
  }
  for (const bad of [NaN, Infinity, -Infinity, { k: [1, NaN] }]) {
    assert.throws(() => digestCanonical(bad), /non-finite number in digest/);
    assert.throws(() => canonical(bad), /non-finite number in digest/, "same throw on a non-finite number");
  }
});

// ---- S-1 (b): CLOSE_KEY (digest.ts:38, NOT exported) equal TWICE: (i) literal, (ii) verdict vs assertNoClose ----
test("bell_chain_close_key_equals_digest", () => {
  // (i) the regex literal extracted from each source text (method of report.test.ts:88) is byte-equal.
  const lit = (rel: string): string | undefined => /const CLOSE_KEY = (\/.+\/i);/.exec(src(rel))?.[1];
  const fromDigest = lit("../src/digest.ts");
  assert.ok(fromDigest?.includes("(?<!no_)adv"), "digest.ts exempts the no_adv counter (BELL-ADV-1)");
  assert.equal(lit("../scripts/bell-chain.mjs"), fromDigest, "bell-chain.mjs CLOSE_KEY literal == digest.ts:38");
  assert.equal(String(CLOSE_KEY), fromDigest, "the exported runtime regex is that literal");
  // (ii) the same verdict (throws / does not) as the exported assertNoClose, top-level and nested, on named cases.
  const throwsOn = (f: (v: unknown) => void, v: unknown): boolean => { try { f(v); return false; } catch { return true; } };
  const cases: Array<[string, unknown, boolean]> = [["close", 1, true], ["closeRef", 364.5, true], ["ref_price", 2, true], ["pRef", 3, true],
    ["reference", 4, true], ["prev", 5, true], ["adv", 6, true], ["share_volume", 7, true], ["volume_ref", 8, true], ["close", "364.5", true],
    ["no_close_ref", 1, false], ["no_adv", 2, false], ["prev_line_hash", 3, false], ["adv_period", { year: 2026, month: 8 }, false],
    ["close_source", "a-named-source", false]];
  for (const [k, val, expected] of cases) {
    for (const v of [{ [k]: val }, { runs: [{ digest: { gaps: [{ symbol: "S", [k]: val }] } }] }]) {
      assert.equal(throwsOn((x) => { assertNoClose(x); }, v), expected, `assertNoClose verdict on '${k}'`);
      assert.equal(throwsOn((x) => { assertNoCloseLike(x); }, v), expected, `assertNoCloseLike verdict on '${k}' (same as digest.ts)`);
    }
  }
});

// ---- S-1 (c): Ed25519. RFC 8032 section 7.1 TEST 1 is a public vector (not a Bell key), built IN MEMORY from its seed.
// The three hex strings are TEST 1 of the primary source (https://www.rfc-editor.org/rfc/rfc8032.html#section-7.1: SECRET KEY,
// PUBLIC KEY, SIGNATURE of the MESSAGE of length 0), read on site by the orchestrator on 2026-09-23 and recorded in
// docs/biblio/FAITS-rfc8032-test1-2026-09-23.md (closes PROC-RFC8032-KAT-1). No todo guard: an emptied or altered vector
// fails this subtest (the KAT is the external anchor of the platform Ed25519 that signLine/verifyLine rely on).
const RFC8032_TEST1 = { secretKeyHex: "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60", publicKeyHex: "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", signatureHex: "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b" };
test("bell_chain_ed25519_rfc8032_kat", async (t) => {
  await t.test("rfc8032_section_7_1_test1", () => {
    const b64 = (hex: string): string => Buffer.from(hex, "hex").toString("base64url");
    // node derives the public key from `d` (a wrong `x` is ignored, measured): the derived key is compared to the RFC's.
    const priv = createPrivateKey({ key: { kty: "OKP", crv: "Ed25519", d: b64(RFC8032_TEST1.secretKeyHex), x: b64(RFC8032_TEST1.publicKeyHex) }, format: "jwk" });
    const pub = createPublicKey(priv);
    assert.equal(Buffer.from(pub.export({ format: "jwk" }).x ?? "", "base64url").toString("hex"), RFC8032_TEST1.publicKeyHex, "public key derived from the seed");
    const sig = edSign(null, Buffer.alloc(0), priv);
    assert.equal(sig.toString("hex"), RFC8032_TEST1.signatureHex, "signature of the empty message");
    assert.ok(edVerify(null, Buffer.alloc(0), pub, sig));
    assert.equal(keyIdOf(pub), sha(Buffer.from(RFC8032_TEST1.publicKeyHex, "hex")), "key_id = sha256 of the 32 raw public-key bytes");
  });
  await t.test("line_signing_excludes_sig_and_verifies", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const body = { schema: "bell-timeline-v1", seq: 1, kind: "publication", published_at: "2027-01-15T08:00:00.000Z", prev_line_hash: GENESIS,
      key_id: keyIdOf(publicKey), state_sha256: "a".repeat(64), provenance_sha256: "b".repeat(64), runs: [] };
    const sig = signLine(body, privateKey);
    assert.equal(sig, edSign(null, Buffer.from(canonical(body), "utf8"), privateKey).toString("base64url"), "Ed25519 over canonical(line without sig)");
    assert.equal(signLine({ ...body, sig: "x", sig_new: "y" }, privateKey), sig, "sig and sig_new are NOT in the signed bytes");
    assert.ok(sig.length === 86 && !sig.includes("="), "base64url of 64 bytes, no padding");
    const line = { ...body, sig };
    assert.equal(verifyLine(line, publicKey), true);
    assert.equal(verifyLine({ ...line, seq: 2 }, publicKey), false, "a changed field breaks the signature");
    const flipped = sig.slice(0, 10) + (sig[10] === "A" ? "B" : "A") + sig.slice(11);
    assert.equal(verifyLine({ ...line, sig: flipped }, publicKey), false, "a changed signature byte does not verify");
    assert.equal(verifyLine({ ...line, sig: sig + "=" }, publicKey), false, "a non-canonical encoding is refused");
    assert.equal(verifyLine(line, generateKeyPairSync("ed25519").publicKey), false, "another key does not verify");
    const x = publicKey.export({ format: "jwk" }).x ?? "";
    assert.equal(keyIdOf(publicKey), sha(Buffer.from(x, "base64url")));
    assert.equal(keyIdOf(privateKey), keyIdOf(publicKey), "the key_id of a private key is its public key's");
    assert.deepEqual(keyringOf(publicKey, 1), { schema: "bell-keyring-v1", keys: [{ key_id: keyIdOf(publicKey), jwk: { kty: "OKP", crv: "Ed25519", x }, valid_from_seq: 1, status: "active" }] });
    assert.equal(lineHash(line), sha(canonical(line)));
  });
});

// ---- S-1 (d) + B-5: the publication scripts import Node built-ins only (allowlist), no network or dynamic loading ----
test("bell_scripts_import_allowlist_no_network", () => {
  const ALLOW = new Set(["node:crypto", "node:fs", "node:path", "node:url", "./bell-chain.mjs"]);
  for (const f of ["bell-chain.mjs", "bell-publish.mjs"]) {
    const text = src(`../scripts/${f}`);
    const specs = [...text.matchAll(/\b(?:from|import)\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1] ?? "");
    assert.ok(specs.length >= 1, `${f}: its imports are parsed (non-vacuity)`);
    for (const s of specs) assert.ok(ALLOW.has(s), `${f}: import '${s}' is outside the allowlist`);
    for (const re of [/node:https?\b/, /node:net\b/, /node:tls\b/, /node:dns\b/, /node:http2\b/, /node:dgram\b/, /child_process/, /\bfetch\s*\(/,
      /\bimport\s*\(/, /\brequire\s*\(/, /createRequire/, /\bundici\b/, /\bWebSocket\b/]) {
      assert.equal(re.test(text), false, `${f}: forbidden network or dynamic-load token ${String(re)}`);
    }
  }
});
