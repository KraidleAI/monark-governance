/**
 * Every OpenTimestamps proof under docs/ outside docs/course-bell timestamps the bytes of its manifest (BELL-OTS-PROOF-BINDING-ALL-1).
 * test/bell-course-manifests.test.ts holds the proofs of docs/course-bell to their register rows; test/bell-anchors.test.ts holds the
 * served copies under apps/site/public/bell/anchors/. This file holds the other proofs of docs/, found by a walk of docs/ (today
 * docs/bell-publications/timeline-seq2-manifest.txt.ots and docs/dojo-publications/timeline-seq1-manifest.txt.ots): each is read by
 * readOtsProof (apps/site/lib/bell-anchors.ts, no network) as a SHA-256 timestamp of the digest of its neighbour, the same path
 * without ".ots". A proof still pending is held by its digest, never by a block height: an upgrade adds heights, not a digest.
 * Reading a proof is not verifying it against a block header. Non-LLM oracle, run by `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createHash } from "node:crypto";
import { anchorStatus, readOtsProof, type OtsProof } from "../apps/site/lib/bell-anchors.ts";

const ROOT = join(import.meta.dirname, "..");
const DOCS = join(ROOT, "docs"), COURSE = join(DOCS, "course-bell");
const TODAY = ["docs/bell-publications/timeline-seq2-manifest.txt.ots", "docs/dojo-publications/timeline-seq1-manifest.txt.ots"];
const PENDING = "docs/dojo-publications/timeline-seq1-manifest.txt.ots";
// The calendars the proofs of docs/ name at fd20e9fa (read by readOtsProof); a pending commitment to another one reds below.
const CALENDARS = ["https://alice.btc.calendar.opentimestamps.org", "https://bob.btc.calendar.opentimestamps.org",
  "https://btc.calendar.catallaxy.com", "https://finney.calendar.eternitywall.com"];
// The magic header of a detached proof (MAGIC in apps/site/lib/bell-anchors.ts, checked below on a real proof), then a varuint major version.
const HEADER = Buffer.from("004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e89294", "hex");
const sha256 = (buf: Uint8Array): string => createHash("sha256").update(buf).digest("hex");
const rel = (abs: string): string => relative(ROOT, abs).split(sep).join("/");

/** The *.ots entries under docs/, docs/course-bell skipped; a linked directory is not walked, a linked proof is listed (and refused). */
function proofsUnderDocs(dir = DOCS): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const abs = join(dir, d.name);
    if (d.isDirectory()) return abs === COURSE ? [] : proofsUnderDocs(abs);
    return d.name.endsWith(".ots") ? [abs] : [];
  });
}

/** The proof read by readOtsProof; a throw is an assertion failure that names the file. */
function read(abs: string): OtsProof {
  try {
    return readOtsProof(readFileSync(abs));
  } catch (e) {
    return assert.fail(`${rel(abs)}: unreadable (${(e as Error).message})`);
  }
}

/** Why the proof at `abs` is not a SHA-256 timestamp of the digest of its manifest, or null. */
function bindingProblem(abs: string): string | null {
  if (lstatSync(abs).isSymbolicLink()) return `${rel(abs)}: a link, not a file`;
  const manifest = abs.slice(0, -".ots".length);
  if (!existsSync(manifest)) return `${rel(abs)}: no manifest ${rel(manifest)}`;
  let proof: OtsProof;
  try {
    proof = readOtsProof(readFileSync(abs));
  } catch (e) {
    return `${rel(abs)}: unreadable (${(e as Error).message})`;
  }
  if (proof.hashOp !== "sha256") return `${rel(abs)}: file hash operation ${proof.hashOp}, not sha256`;
  const want = sha256(readFileSync(manifest));
  return proof.digestHex === want ? null : `${rel(abs)}: timestamps ${proof.digestHex}, its manifest hashes to ${want}`;
}

// killer: docs/dojo-publications/timeline-seq1-manifest.txt:1 CONST "#L1 492f" -> "#L1 592f"
// killer: apps/site/lib/bell-anchors.ts:134 CONST "name: \"sha256\"" -> "name: \"sha1\""
// killer: apps/site/lib/bell-anchors.ts:180 CONST "toHex(take(op.len))" -> "toHex(take(op.len).slice(1))"
// killer: docs/bell-publications/timeline-seq2-manifest.txt:4 CONST "#L2 ef3b" -> "#L2 ff3b"
test("bell_ots_proofs_bind_their_manifest — every .ots under docs/ outside docs/course-bell is a SHA-256 timestamp of its manifest", () => {
  const found = proofsUnderDocs().map(rel).sort();
  assert.ok(found.length > 0, "non-vacuity: the walk of docs/ finds proofs outside docs/course-bell");
  assert.deepEqual(TODAY.filter((p) => !found.includes(p)), [], `the walk of docs/ holds ${TODAY.join(" and ")} (found: ${found.join(", ")})`);
  assert.deepEqual(found.flatMap((p) => bindingProblem(join(ROOT, p)) ?? []), [], "every proof timestamps the SHA-256 of its manifest");
});

// killer: docs/dojo-publications/timeline-seq1-manifest.txt:2 CONST "-L1 2f81" -> "-L1 3f81"
// killer: apps/site/lib/bell-anchors.ts:212 CONST "kind: \"pending\"" -> "kind: \"bitcoin\""
// killer: apps/site/lib/bell-anchors.ts:212 CONST "j + n))" -> "j + n - 1))"
// killer: apps/site/lib/bell-anchors.ts:129 CONST "83dfe30d2ef90c8e" -> "83dfe30d2ef90c8f"
// killer: apps/site/lib/bell-anchors.ts:209 ROR "t === TAG_PENDING" -> "t !== TAG_PENDING"
test("bell_ots_pending_proof_is_held_by_its_digest_not_a_height — docs/dojo-publications seq1, pending at fd20e9fa", () => {
  const abs = join(ROOT, PENDING), proof = read(abs), { bitcoinHeights, pendingCalendars } = anchorStatus(proof);
  const want = sha256(readFileSync(abs.slice(0, -".ots".length)));
  assert.deepEqual([proof.hashOp, proof.digestHex], ["sha256", want], `${PENDING} timestamps the SHA-256 of its manifest`);
  assert.deepEqual(proof.attestations.filter((a) => a.kind === "unknown"), [], "every attestation reads as Bitcoin or pending");
  // Its heights are not held: an upgrade adds them. Without one, the proof holds at least one calendar commitment.
  assert.ok(bitcoinHeights.length > 0 || pendingCalendars.length > 0, `${PENDING} carries no Bitcoin height and no pending calendar`);
  assert.deepEqual(proof.attestations.filter((a) => a.kind === "bitcoin" && !(Number.isInteger(a.height) && a.height > 0)), [], "a height is a block number");
  assert.deepEqual(pendingCalendars.filter((u) => !CALENDARS.includes(u)), [], `every pending calendar is one of ${CALENDARS.join(", ")}`);
});

// killer: apps/site/lib/bell-anchors.ts:177 CONST "unsupported major version" -> "unsupported version"
// killer: apps/site/lib/bell-anchors.ts:177 ROR "major !== 1" -> "major === 1"
// killer: apps/site/lib/bell-anchors.ts:177 CONST "major !== 1" -> "major < 1"
test("bell_ots_reader_refuses_an_unknown_major_version — the magic header then a major version other than 1 throws, named", () => {
  const real = readFileSync(join(ROOT, PENDING));
  assert.deepEqual([real.subarray(0, HEADER.length).equals(HEADER), real[HEADER.length]], [true, 1], "the real proof: the header, then version 1");
  const at = (version: number[]): Buffer => Buffer.concat([HEADER, Buffer.from(version), real.subarray(HEADER.length + 1)]);
  assert.doesNotThrow(() => readOtsProof(at([1])), "the same bytes at major version 1 read");
  for (const [version, n] of [[[2], 2], [[0], 0], [[0x81, 0x01], 129]] as const) {
    assert.throws(() => readOtsProof(at([...version])), { message: `ots: unsupported major version ${String(n)}` }, `major version ${String(n)}`);
  }
});
