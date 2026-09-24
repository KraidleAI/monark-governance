/**
 * Root test of scripts/anchor-bell-timeline.mjs (ADR-BELL-OTS-ANCHOR-1 tuyau P-1, C-5), OFFLINE, run as the orchestrator runs it (a
 * child node, local input). A DETERMINISTIC test key (seed from a public label, in no committed keyring) fixes the manifest digest the
 * committed synthetic proofs test/fixtures/fixture-bell-seq2-*.ots timestamp (C-7). --compare-url meets a fetch stub preloaded in the
 * child (never the network). Named mutants MP-1..MP-6 exit 1 and write nothing; MP-7 takes -2; MP-8 is --check on a wrong row.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync } from "node:crypto";
import { spawnSync } from "node:child_process";
import { canonical, keyringOf, lineHash, signLine, GENESIS } from "../apps/bell/scripts/bell-chain.mjs";
import { readOtsProof, bindPublicationAnchor } from "../apps/site/lib/bell-anchors.ts";

const ROOT = join(import.meta.dirname, ".."), TOOL = join(ROOT, "scripts", "anchor-bell-timeline.mjs"), FIX = join(ROOT, "test", "fixtures");
const sha = (b: string | Uint8Array): string => createHash("sha256").update(b).digest("hex");
// RFC 8410 PKCS#8 prefix of an Ed25519 private key + a seed derived from a public label: a test key, not a secret.
const KEY = createPrivateKey({ key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), createHash("sha256").update("monark bell ots anchor fixture key, test only").digest()]), format: "der", type: "pkcs8" });

/** Lines 1 and 2 (publications) signed by KEY, the keyring, and the two files line 2 names, laid out as the Bell host serves them. */
function served(dir: string): { lines: Array<Record<string, unknown>>; timeline: Buffer; s: string; p: string } {
  const keyring = keyringOf(createPublicKey(KEY), 1), lines: Array<Record<string, unknown>> = [];
  let [s, p] = ["", ""];
  for (const seq of [1, 2]) {
    const state = canonical({ schema: "bell-public-state-v1", seq, runs: [] }) + "\n", prov = canonical({ schema: "bell-public-provenance-v1", seq, runs: [] }) + "\n";
    [s, p] = [sha(state), sha(prov)];
    for (const [d, h, body] of [["states", s, state], ["provenance", p, prov]] as const) { mkdirSync(join(dir, d), { recursive: true }); writeFileSync(join(dir, d, `${h}.json`), body); }
    const prev = lines[seq - 2], line: Record<string, unknown> = { schema: "bell-timeline-v1", seq, kind: "publication", published_at: `2026-09-2${String(seq + 2)}T21:35:52.438Z`,
      prev_line_hash: prev === undefined ? GENESIS : lineHash(prev), key_id: keyring.keys[0]?.key_id ?? "", state_sha256: s, provenance_sha256: p, runs: [] };
    lines.push({ ...line, sig: signLine(line, KEY) });
  }
  const timeline = Buffer.from(lines.map((l) => canonical(l) + "\n").join(""));
  writeFileSync(join(dir, "timeline.jsonl"), timeline);
  writeFileSync(join(dir, "keyring.json"), canonical(keyring) + "\n");
  return { lines, timeline, s, p };
}

test("bell_anchor_tool_writes_the_d1_manifest_from_local_input — offline; never stamps, never overwrites; named mutants red", () => {
  const dir = mkdtempSync(join(tmpdir(), "bell-ots-")), srv = join(dir, "srv"), out = join(dir, "out"), reg = join(dir, "reg"), stub = join(dir, "stub.mjs");
  mkdirSync(out);
  writeFileSync(stub, "import { readFileSync, existsSync } from \"node:fs\";\nglobalThis.fetch = async (url, init) => { const f = process.env.STUB_ROOT + new URL(String(url)).pathname;\n  return init?.redirect !== \"manual\" ? new Response(\"\", { status: 599 }) : existsSync(f) ? new Response(readFileSync(f), { status: 200 }) : new Response(\"\", { status: 404 }); };\n");
  const f = served(srv), line2 = canonical(f.lines[1]);
  const args = (o: Record<string, string> = {}): string[] => Object.entries({ "--seq": "2", "--timeline": join(srv, "timeline.jsonl"), "--immutables": srv, "--mirror-sha": sha(f.timeline),
    "--line-hash": lineHash(f.lines[1]), "--keyring": join(srv, "keyring.json"), "--out-dir": out, ...o }).flat();
  const run = (a: string[], root?: string): { code: number | null; out: string; err: string } => {
    const r = spawnSync(process.execPath, [...(root === undefined ? [] : ["--import", pathToFileURL(stub).href]), TOOL, ...a], { cwd: ROOT, encoding: "utf8", env: { ...process.env, STUB_ROOT: root ?? "" } });
    return { code: r.status, out: r.stdout, err: r.stderr };
  };
  // The D1 manifest, recomputed here: line 2 without its LF (= its line_hash), lines 1..2 with their LF, the two files line 2 names.
  const want = `provenance/${f.p}.json ${f.p}\nstates/${f.s}.json ${f.s}\ntimeline.jsonl#L1-L2 ${sha(f.timeline)}\ntimeline.jsonl#L2 ${sha(line2)}\n`;
  const ok = run(args()), shown = join(out, "timeline-seq2-manifest.txt").split(sep).join("/");
  assert.equal(ok.code, 0, ok.err);
  const manifest = readFileSync(join(out, "timeline-seq2-manifest.txt"), "utf8");
  assert.equal(manifest, want, "the tool writes the D1 manifest of line 2");
  assert.ok(ok.out.includes(`sha256 ${sha(manifest)} (457 bytes, 4 lines)`), ok.out);
  const stamp = ok.out.split("\n").find((l) => l.trim().endsWith(` stamp ${shown}`))?.trim().slice(0, -shown.length) ?? "";
  assert.ok(stamp.startsWith('PATH="/f/MONARK SUITE/ots/dll:'), `the frozen GO1-F stamp command is printed: ${ok.out}`);
  assert.ok(readFileSync(join(ROOT, "docs", "RUNBOOK-bell.md"), "utf8").includes(`${stamp}docs/bell-publications/timeline-seq<n>-manifest.txt`), "RUNBOOK 13 bis carries the same stamp command");
  assert.deepEqual(readdirSync(out), ["timeline-seq2-manifest.txt"], "the tool never stamps: no proof file");
  // C-7 fixtures: ONE synthetic attestation on THIS manifest's digest (the reader refuses any byte more).
  for (const [name, att] of [["fixture-bell-seq2-pending.ots", { kind: "pending", uri: "https://calendar.invalid" }], ["fixture-bell-seq2-block.ots", { kind: "bitcoin", height: 1 }]] as const) {
    assert.deepEqual(readOtsProof(new Uint8Array(readFileSync(join(FIX, name)))), { hashOp: "sha256", digestHex: sha(manifest), attestations: [att] }, name);
  }
  const imm = join(dir, "imm"), other = join(dir, "other.json"), srv2 = join(dir, "srv2");
  for (const d of [imm, srv2]) cpSync(srv, d, { recursive: true });
  writeFileSync(join(imm, "states", `${f.s}.json`), "{}\n");
  writeFileSync(join(srv2, "timeline.jsonl"), Buffer.concat([f.timeline.subarray(0, 10), Buffer.from("X"), f.timeline.subarray(11)]));
  writeFileSync(other, canonical(keyringOf(generateKeyPairSync("ed25519").publicKey, 1)) + "\n");
  // MP-10: the keyring marks the signing key revoked from seq 2 (line 2 voided); MP-11: line 2 re-serialized with one more space (same JSON).
  const revoked = join(dir, "revoked.json"), nc = join(dir, "nc.jsonl"), ring1 = keyringOf(createPublicKey(KEY), 1), ncBuf = Buffer.from(`${canonical(f.lines[0])}\n${line2.replace('{"', '{ "')}\n`);
  writeFileSync(revoked, canonical({ ...ring1, keys: ring1.keys.map((k) => ({ ...k, status: "revoked", revoked_from_seq: 2 })) }) + "\n");
  writeFileSync(nc, ncBuf);
  for (const [o, re, root] of [[{ "--mirror-sha": sha(f.timeline.subarray(0, -1)) }, /do not hash to --mirror-sha/, undefined], [{ "--immutables": imm }, /states\/[0-9a-f]{64}\.json does not hash to its name/, undefined],
    [{ "--keyring": other }, /do not walk under the keyring \(seq 1: key_not_in_keyring\)/, undefined], [{ "--line-hash": lineHash(f.lines[0]) }, /does not hash to --line-hash/, undefined],
    [{ "--compare-url": "https://bell.invalid" }, /the served timeline does not start with the local lines 1\.\.2/, srv2], [{ "--compare-url": "http://bell.invalid" }, /must be https/, srv],
    [{ "--keyring": revoked }, /line 2 is voided by a key revocation/, undefined], [{ "--timeline": nc, "--mirror-sha": sha(ncBuf) }, /are not its canonical form/, undefined]] as const) {
    const r = run(args(o), root);
    assert.deepEqual([r.code, re.test(r.err), readdirSync(out)], [1, true, ["timeline-seq2-manifest.txt"]], `${String(re)}: exit 1, named, nothing written (${r.err})`);
  }
  const cmp = run(args({ "--compare-url": "https://bell.invalid" }), srv); // MP-7: same served bytes pass; the second manifest takes -2
  assert.deepEqual([cmp.code, readdirSync(out).sort(), readFileSync(join(out, "timeline-seq2-2-manifest.txt"), "utf8")], [0, ["timeline-seq2-2-manifest.txt", "timeline-seq2-manifest.txt"], want], cmp.err);
  const row = (lh: string): string => "| date_u | seq | kind | line_hash | prefix_sha256 | manifest_sha256 | commit | ots_ref | note |\n|---|---|---|---|---|---|---|---|---|\n"
    + `| 2026-09-24T13:37:02Z | 2 | publication | \`${lh}\` | \`${sha(f.timeline)}\` | \`${sha(manifest)}\` | \`abcdef0\` | \`timeline-seq2-manifest.txt.ots\` | fixture |\n`;
  mkdirSync(reg);
  writeFileSync(join(reg, "timeline-seq2-manifest.txt"), manifest);
  writeFileSync(join(reg, "ANCHORS.md"), row(sha(line2)));
  for (const [name, re] of [["fixture-bell-seq2-pending.ots", /pending, no Bitcoin block record yet; 1 calendar\(s\) pending/], ["fixture-bell-seq2-block.ots", /Bitcoin block record\(s\) at height 1; 0 calendar/]] as const) {
    cpSync(join(FIX, name), join(reg, "timeline-seq2-manifest.txt.ots"));
    const c = run(["--check", "--out-dir", reg, "--timeline", join(srv, "timeline.jsonl")]);
    assert.deepEqual([c.code, re.test(c.out)], [0, true], `--check with ${name}: ${c.out}${c.err}`);
  }
  writeFileSync(join(reg, "ANCHORS.md"), row(lineHash(f.lines[0]))); // MP-8
  const c8 = run(["--check", "--out-dir", reg]);
  assert.deepEqual([c8.code, /timeline\.jsonl#L2 differs from line_hash/.test(c8.err)], [1, true], c8.err);
  // MP-9: a manifest whose states/ entry is not the file line 2 names (self-consistent, its proof rebuilt on its digest): --check --timeline refuses.
  const m9 = manifest.replace(`states/${f.s}.json ${f.s}`, `states/${sha("x")}.json ${sha("x")}`), fx = readFileSync(join(FIX, "fixture-bell-seq2-pending.ots")), at = fx.indexOf(Buffer.from(sha(manifest), "hex"));
  writeFileSync(join(reg, "timeline-seq2-manifest.txt"), m9);
  writeFileSync(join(reg, "timeline-seq2-manifest.txt.ots"), Buffer.concat([fx.subarray(0, at), Buffer.from(sha(m9), "hex"), fx.subarray(at + 32)]));
  writeFileSync(join(reg, "ANCHORS.md"), row(sha(line2)).replace(sha(manifest), sha(m9)));
  const c9 = run(["--check", "--out-dir", reg, "--timeline", join(srv, "timeline.jsonl")]);
  assert.deepEqual([c9.code, /not those line 2 names/.test(c9.err)], [1, true], c9.err);
  rmSync(dir, { recursive: true, force: true });
});

// KEYLINE-TOOL-TEST-1: a key_rotation line (cross-signed, trusted new key): a manifest of its two timeline entries only, bound as its kind.
test("bell_anchor_tool_writes_a_key_line_manifest_without_immutables", () => {
  const dir = mkdtempSync(join(tmpdir(), "bell-ots-key-")), out = join(dir, "out"), k2 = generateKeyPairSync("ed25519"), ring = keyringOf(createPublicKey(KEY), 1), e2 = keyringOf(k2.publicKey, 3).keys[0];
  mkdirSync(out);
  const f = served(dir), rot: Record<string, unknown> = { schema: "bell-timeline-v1", seq: 3, kind: "key_rotation", published_at: "2026-09-26T21:35:52.438Z", prev_line_hash: lineHash(f.lines[1]),
    key_id: ring.keys[0]?.key_id ?? "", new_key_id: e2?.key_id ?? "", new_key: e2?.jwk };
  const line3 = { ...rot, sig: signLine(rot, KEY), sig_new: signLine(rot, k2.privateKey) }, timeline = Buffer.concat([f.timeline, Buffer.from(canonical(line3) + "\n")]);
  writeFileSync(join(dir, "timeline.jsonl"), timeline);
  writeFileSync(join(dir, "keyring.json"), canonical({ ...ring, keys: [...ring.keys, e2] }) + "\n");
  const r = spawnSync(process.execPath, [TOOL, "--seq", "3", "--timeline", join(dir, "timeline.jsonl"), "--mirror-sha", sha(timeline), "--line-hash", lineHash(line3), "--keyring", join(dir, "keyring.json"), "--out-dir", out], { cwd: ROOT, encoding: "utf8" });
  const manifest = r.status === 0 ? readFileSync(join(out, "timeline-seq3-manifest.txt"), "utf8") : r.stderr;
  assert.equal(manifest, `timeline.jsonl#L1-L3 ${sha(timeline)}\ntimeline.jsonl#L3 ${sha(canonical(line3))}\n`, "a key line's manifest lists its two timeline entries, no immutable");
  const row = { date_utc: "2026-09-26T21:40:00Z", seq: 3, kind: "key_rotation" as const, line_hash: lineHash(line3), prefix_sha256: sha(timeline), manifest_sha256: sha(manifest), commit: "abcdef0",
    manifest_file: "timeline-seq3-manifest.txt", proof_file: "timeline-seq3-manifest.txt.ots" }, proof = { hashOp: "sha256" as const, digestHex: sha(manifest), attestations: [] };
  bindPublicationAnchor(row, manifest, sha(manifest), proof);
  assert.throws(() => bindPublicationAnchor({ ...row, kind: "publication" }, manifest, sha(manifest), proof), /not have exactly the entries of publication line 3/);
  rmSync(dir, { recursive: true, force: true });
});
