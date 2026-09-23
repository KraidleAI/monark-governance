/**
 * Root tests for the Bell anchors served under /bell/anchors (lot SITE-CHARTE-C; decision 146 ruling Q2 — "status
 * per anchor read from the file"; orchestrator ruling (3) of 2026-09-23: block heights are never a literal in the
 * source, they are read from the served proof files). Non-LLM oracles, run by `npm test`:
 *   (1) bell_anchors_served_register_matches_source — the register served under apps/site/public/bell/anchors/
 *       IS the governance register docs/course-bell/ANCHORS.md (real lines, parsed by the page's own reader),
 *       every served proof is byte-identical to the committed proof, every served manifest hashes to its line's
 *       digest, every proof attests exactly that digest, and nothing else is served there;
 *   (2) bell_ots_reader_matches_reference_client — the structural proof reader equals the reference client on a
 *       known answer (opentimestamps-client 0.7.2 `ots info`, recorded in the lot report) and fails closed on
 *       malformed bytes.
 * Mutants (named, measured in the lot report): change one digest in anchors.json => (1) reds; append a byte to a
 * served proof => (1) and (2) red.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { parseAnchorsRegister, readOtsProof, anchorStatus } from "../apps/site/lib/bell-anchors.ts";
import type { AnchorsRegister } from "../apps/site/lib/bell-anchors.ts";

const ROOT = join(import.meta.dirname, "..");
const SERVED = join(ROOT, "apps", "site", "public", "bell", "anchors");
const SOURCE = join(ROOT, "docs", "course-bell");
const sha256 = (buf: Uint8Array): string => createHash("sha256").update(buf).digest("hex");

test("bell_anchors_served_register_matches_source — served register == ANCHORS.md real lines; proofs byte-equal; manifests hash to their digest", () => {
  const source = parseAnchorsRegister(readFileSync(join(SOURCE, "ANCHORS.md"), "utf8"));
  const served = JSON.parse(readFileSync(join(SERVED, "anchors.json"), "utf8")) as AnchorsRegister;
  assert.ok(source.length >= 1, "no real line parsed from docs/course-bell/ANCHORS.md (false green)");
  assert.deepEqual(served.rows, source, "anchors.json must equal the parsed register — run node scripts/sync-bell-anchors.mjs");

  const expectedFiles = new Set<string>(["anchors.json"]);
  let proofs = 0;
  for (const r of served.rows) {
    if (r.proof_file === null || r.manifest_file === null) {
      assert.equal(r.proof_file, r.manifest_file, `${r.date_utc}: a line without proof serves no manifest either`);
      continue;
    }
    proofs += 1;
    expectedFiles.add(r.proof_file).add(r.manifest_file);
    const proofBytes = new Uint8Array(readFileSync(join(SERVED, r.proof_file)));
    assert.deepEqual(proofBytes, new Uint8Array(readFileSync(join(SOURCE, r.proof_file))), `${r.proof_file}: served proof must be the committed proof`);
    assert.equal(sha256(new Uint8Array(readFileSync(join(SERVED, r.manifest_file)))), r.manifest_sha256, `${r.manifest_file}: served bytes must hash to the line's manifest digest`);
    const proof = readOtsProof(proofBytes);
    assert.equal(proof.hashOp, "sha256", `${r.proof_file}: proof must timestamp a sha256 digest`);
    assert.equal(proof.digestHex, r.manifest_sha256, `${r.proof_file}: the proof must attest the line's manifest digest`);
    assert.ok(proof.attestations.length >= 1, `${r.proof_file}: a proof carries at least one attestation`);
  }
  assert.ok(proofs >= 1, "no timestamped line served (false green)");
  assert.deepEqual(new Set(readdirSync(SERVED)), expectedFiles, "the served directory holds exactly anchors.json + the lines' manifests and proofs");
});

test("bell_ots_reader_matches_reference_client — known answer from `ots info` (probe_end) + fail-closed on malformed bytes", () => {
  const bytes = new Uint8Array(readFileSync(join(SERVED, "probe_end-manifest.txt.ots")));
  const proof = readOtsProof(bytes);
  // Reference: opentimestamps-client 0.7.2, `ots info probe_end-manifest.txt.ots` (offline), 2026-09-23 (lot report).
  assert.equal(proof.digestHex, "ea83d5460a41abca8ab2385c306602cb38a09edaf6b8c507cff48f1423e05803");
  const st = anchorStatus(proof);
  for (const h of [968149, 968150, 968184, 968193]) assert.ok(st.bitcoinHeights.includes(h), `Bitcoin attestation at block ${String(h)} expected`);
  for (const c of ["alice.btc.calendar.opentimestamps.org", "bob.btc.calendar.opentimestamps.org", "finney.calendar.eternitywall.com", "btc.calendar.catallaxy.com"]) {
    assert.ok(st.pendingCalendars.includes(`https://${c}`), `pending attestation from ${c} expected`);
  }
  // Fail-closed mutants: truncation, bad magic, trailing garbage.
  assert.throws(() => readOtsProof(bytes.subarray(0, bytes.length - 3)), /truncated|ots:/);
  const badMagic = bytes.slice();
  badMagic[1] = 0x6f;
  assert.throws(() => readOtsProof(badMagic), /bad magic/);
  const trailing = new Uint8Array(bytes.length + 1);
  trailing.set(bytes);
  assert.throws(() => readOtsProof(trailing), /trailing bytes|ots:/);
});
