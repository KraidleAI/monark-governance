/**
 * The course manifests under docs/course-bell are the bytes the anchors register timestamps (BELL-COURSE-TSLAX-DRIFT-1: the first
 * TSLAx mint_resume manifest was overwritten by the second one, whose proof name collided, so its timestamp covered other bytes).
 * test/bell-anchors.test.ts holds the served copies under apps/site/public/bell/anchors/ to their digests; this file holds the
 * governance copies: every manifest an ANCHORS.md row timestamps hashes to that row's digest, every proof in the folder has its row,
 * and every such proof is a SHA-256 timestamp of that same digest (read by readOtsProof, no network). Non-LLM oracle, run by `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { parseAnchorsRegister, readOtsProof } from "../apps/site/lib/bell-anchors.ts";

const SOURCE = join(import.meta.dirname, "..", "docs", "course-bell");
const sha256 = (buf: Uint8Array): string => createHash("sha256").update(buf).digest("hex");

// killer: apps/site/lib/bell-anchors.ts:91 CONST "timestamped ? ref.slice" -> "false ? ref.slice"
test("bell_course_manifests_hash_to_their_timestamped_digest — every manifest under docs/course-bell that an ANCHORS.md row timestamps hashes to that row's digest, every proof in the folder has its row, and every proof timestamps its row's digest", () => {
  const rows = parseAnchorsRegister(readFileSync(join(SOURCE, "ANCHORS.md"), "utf8")).filter((r) => r.manifest_file !== null);
  const proofs = readdirSync(SOURCE).filter((n) => n.endsWith(".ots")).sort();
  assert.deepEqual(rows.map((r) => r.proof_file).sort(), proofs);
  const drift = rows.filter((r) => sha256(readFileSync(join(SOURCE, r.manifest_file as string))) !== r.manifest_sha256)
    .map((r) => `${r.date_utc} ${r.manifest_file ?? ""}`);
  assert.deepEqual(drift, []);
  const unbound = rows.filter((r) => {
    const proof = readOtsProof(readFileSync(join(SOURCE, r.proof_file as string)));
    return proof.hashOp !== "sha256" || proof.digestHex !== r.manifest_sha256;
  }).map((r) => `${r.date_utc} ${r.proof_file ?? ""}`);
  assert.deepEqual(unbound, []);
});
