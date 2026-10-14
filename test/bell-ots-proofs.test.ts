/**
 * Every OpenTimestamps proof under docs/, but those at the top level of docs/course-bell, timestamps the bytes of its manifest
 * (BELL-OTS-PROOF-BINDING-ALL-1). test/bell-course-manifests.test.ts holds the proofs at the top level of docs/course-bell (it reads that
 * folder alone, not its subfolders) to their register rows; test/bell-anchors.test.ts holds the served copies under
 * apps/site/public/bell/anchors/. This file holds the other proofs of docs/, found by a walk of docs/ that enters every folder, the
 * subfolders of docs/course-bell included (today docs/bell-publications/timeline-seq2-manifest.txt.ots and
 * docs/dojo-publications/timeline-seq1-manifest.txt.ots). The walk never follows a link: it lists every link under docs/, file or
 * folder, whatever its name, and refuses it by name. Test 1: each proof is read by readOtsProof (apps/site/lib/bell-anchors.ts, no
 * network) as a SHA-256 timestamp of the digest of its neighbour, the same path without ".ots". Test 2: each proof attests Bitcoin block
 * numbers or commitments pending at a listed calendar, at least one; the proof still pending is held by its digest, never by a block
 * height: an upgrade adds heights, not a digest. Reading a proof is not verifying it against a block header. Non-LLM oracle, run by
 * `npm test`.
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
// The calendars the proofs of docs/ name at fd20e9fa (read by readOtsProof); a commitment pending at another one, in any proof the walk
// finds, reds test 2.
const CALENDARS = ["https://alice.btc.calendar.opentimestamps.org", "https://bob.btc.calendar.opentimestamps.org",
  "https://btc.calendar.catallaxy.com", "https://finney.calendar.eternitywall.com"];
// The magic header of a detached proof (MAGIC in apps/site/lib/bell-anchors.ts, checked below on a real proof), then a varuint major version.
const HEADER = Buffer.from("004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e89294", "hex");
const sha256 = (buf: Uint8Array): string => createHash("sha256").update(buf).digest("hex");
const rel = (abs: string): string => relative(ROOT, abs).split(sep).join("/");

/**
 * The *.ots files under docs/, subfolders included, but those at the top level of docs/course-bell (test/bell-course-manifests.test.ts
 * reads that level); and every link under docs/, file or folder, whatever its name: listed, never followed, refused below by name.
 */
function proofsUnderDocs(dir = DOCS): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const abs = join(dir, d.name);
    if (d.isSymbolicLink()) return [abs];
    if (d.isDirectory()) return proofsUnderDocs(abs);
    return d.name.endsWith(".ots") && dir !== COURSE ? [abs] : [];
  });
}

/** The proof at `abs` read by readOtsProof, or why it is not one: a link, or bytes the reader refuses (named). */
function readProof(abs: string): OtsProof | string {
  if (lstatSync(abs).isSymbolicLink()) return `${rel(abs)}: a link, not a file`;
  try {
    return readOtsProof(readFileSync(abs));
  } catch (e) {
    return `${rel(abs)}: unreadable (${(e as Error).message})`;
  }
}

/** Why the proof at `abs` is not a SHA-256 timestamp of the digest of its manifest, or null. */
function bindingProblem(abs: string): string | null {
  const proof = readProof(abs);
  if (typeof proof === "string") return proof;
  const manifest = abs.slice(0, -".ots".length);
  if (!existsSync(manifest)) return `${rel(abs)}: no manifest ${rel(manifest)}`;
  if (proof.hashOp !== "sha256") return `${rel(abs)}: file hash operation ${proof.hashOp}, not sha256`;
  const want = sha256(readFileSync(manifest));
  return proof.digestHex === want ? null : `${rel(abs)}: timestamps ${proof.digestHex}, its manifest hashes to ${want}`;
}

/** Why the attestations of the proof at `abs` are not Bitcoin block numbers or commitments pending at a listed calendar, one at least. */
function anchorProblems(abs: string): string[] {
  const proof = readProof(abs);
  if (typeof proof === "string") return [proof];
  const { bitcoinHeights, pendingCalendars } = anchorStatus(proof);
  const odd = proof.attestations.flatMap((a) => {
    if (a.kind === "unknown") return [`${rel(abs)}: an attestation of unknown tag ${a.tag}`];
    const block = a.kind !== "bitcoin" || (Number.isInteger(a.height) && a.height > 0);
    return block ? [] : [`${rel(abs)}: height ${String(a.height)} is not a block number`];
  });
  const foreign = pendingCalendars.filter((u) => !CALENDARS.includes(u)).map((u) => `${rel(abs)}: pending at ${u}, not a listed calendar`);
  const none = bitcoinHeights.length > 0 || pendingCalendars.length > 0 ? [] : [`${rel(abs)}: no Bitcoin height and no pending calendar`];
  return [...odd, ...foreign, ...none];
}

// killer: docs/dojo-publications/timeline-seq1-manifest.txt:1 CONST "#L1 492f" -> "#L1 592f"
// killer: apps/site/lib/bell-anchors.ts:134 CONST "name: \"sha256\"" -> "name: \"sha1\""
// killer: apps/site/lib/bell-anchors.ts:180 CONST "toHex(take(op.len))" -> "toHex(take(op.len).slice(1))"
// killer: docs/bell-publications/timeline-seq2-manifest.txt:4 CONST "#L2 ef3b" -> "#L2 ff3b"
test("bell_ots_proofs_bind_their_manifest — each .ots under docs/ outside the top level of docs/course-bell timestamps its manifest's SHA-256; no link", () => {
  const found = proofsUnderDocs().map(rel).sort();
  assert.ok(found.length > 0, "non-vacuity: the walk of docs/ finds proofs outside the top level of docs/course-bell");
  assert.deepEqual(TODAY.filter((p) => !found.includes(p)), [], `the walk of docs/ holds ${TODAY.join(" and ")} (found: ${found.join(", ")})`);
  assert.deepEqual(found.flatMap((p) => bindingProblem(join(ROOT, p)) ?? []), [], "every proof timestamps the SHA-256 of its manifest; none is a link");
});

// killer: docs/dojo-publications/timeline-seq1-manifest.txt:2 CONST "-L1 2f81" -> "-L1 3f81"
// killer: apps/site/lib/bell-anchors.ts:212 CONST "kind: \"pending\"" -> "kind: \"bitcoin\""
// killer: apps/site/lib/bell-anchors.ts:212 CONST "j + n))" -> "j + n - 1))"
// killer: apps/site/lib/bell-anchors.ts:129 CONST "83dfe30d2ef90c8e" -> "83dfe30d2ef90c8f"
// killer: apps/site/lib/bell-anchors.ts:209 ROR "t === TAG_PENDING" -> "t !== TAG_PENDING"
// killer: apps/site/lib/bell-anchors.ts:130 CONST "0588960d73d71901" -> "0588960d73d71902"
// killer: apps/site/lib/bell-anchors.ts:208 CONST "height }" -> "height: 0 }"
// killer: apps/site/lib/bell-anchors.ts:248 SDL "calendars.add(a.uri)" -> ""
test("bell_ots_proofs_attest_heights_or_listed_calendars — every proof the walk of docs/ finds; the pending one held by its digest", () => {
  const found = proofsUnderDocs().map(rel).sort();
  assert.ok(found.includes(PENDING), `non-vacuity: the walk of docs/ finds ${PENDING} (found: ${found.join(", ")})`);
  assert.equal(bindingProblem(join(ROOT, PENDING)), null, `${PENDING}, pending at fd20e9fa, is held by the SHA-256 of its manifest, not a height`);
  // Heights are not held: an upgrade adds them. Each proof attests block numbers or listed calendars, one at least.
  assert.deepEqual(found.flatMap((p) => anchorProblems(join(ROOT, p))), [], `every proof attests block numbers or one of ${CALENDARS.join(", ")}`);
});

// killer: apps/site/lib/bell-anchors.ts:177 CONST "unsupported major version" -> "unsupported version"
// killer: apps/site/lib/bell-anchors.ts:177 ROR "major !== 1" -> "major === 1"
// killer: apps/site/lib/bell-anchors.ts:177 CONST "major !== 1" -> "major < 1"
// killer: apps/site/lib/bell-anchors.ts:176 CONST "varuint()" -> "byte()"
test("bell_ots_reader_refuses_an_unknown_major_version — the magic header then a major version other than 1 throws, named", () => {
  const real = readFileSync(join(ROOT, PENDING));
  assert.deepEqual([real.subarray(0, HEADER.length).equals(HEADER), real[HEADER.length]], [true, 1], "the real proof: the header, then version 1");
  const at = (version: number[]): Buffer => Buffer.concat([HEADER, Buffer.from(version), real.subarray(HEADER.length + 1)]);
  assert.doesNotThrow(() => readOtsProof(at([1])), "the same bytes at major version 1 read");
  // [0x81, 0x02] is the varuint 257; read as one byte it would be 129.
  for (const [version, n] of [[[2], 2], [[0], 0], [[0x81, 0x02], 257]] as const) {
    assert.throws(() => readOtsProof(at([...version])), { message: `ots: unsupported major version ${String(n)}` }, `major version ${String(n)}`);
  }
});
