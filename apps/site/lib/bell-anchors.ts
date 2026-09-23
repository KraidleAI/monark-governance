// apps/site/lib/bell-anchors.ts — the Bell anchors register, as served under /bell/anchors (ruling Q2, decision
// 146), and a structural reader of OpenTimestamps proofs ("status per anchor read from the file").
//
// PURE — no Node/React/Next import, self-contained — so three programs share it: the /bell and /bell/anchors
// pages (server components, build time), the sync script scripts/sync-bell-anchors.mjs, and the root test
// test/bell-anchors.test.ts.
//
// FORMAT SOURCE [lu]: the reference implementation python-opentimestamps 0.4.5 (installed, read locally):
// opentimestamps/core/timestamp.py (DetachedTimestampFile.deserialize, Timestamp.deserialize: 0xff = fork, 0x00 =
// attestation), op.py (append 0xf0 / prepend 0xf1 with a varbytes argument; reverse 0xf2, hexlify 0xf3, sha1 0x02,
// ripemd160 0x03, sha256 0x08, keccak256 0x67 without argument), notary.py (attestation = 8-byte tag + varbytes
// payload; PendingAttestation 83dfe30d2ef90c8e carries a varbytes URI; BitcoinBlockHeaderAttestation
// 0588960d73d71901 carries a varuint block height), serialize.py (LEB128 varuint). The reader WALKS the tree and
// never scans bytes for a tag, so a digest that happens to contain a tag cannot be mistaken for an attestation.
// READING A PROOF IS NOT VERIFYING IT: a Bitcoin attestation names a block; checking that the block header's
// merkle root commits to the digest is done by the reader, with an open OpenTimestamps client.

// ── The served register (apps/site/public/bell/anchors/anchors.json, written by scripts/sync-bell-anchors.mjs) ──

export type AnchorBoundary = "probe_end" | "mint_start" | "mint_resume" | "mint_end" | "final";
const BOUNDARIES: readonly AnchorBoundary[] = ["probe_end", "mint_start", "mint_resume", "mint_end", "final"];

export interface AnchorRow {
  /** ISO-8601 UTC instant of the anchor, as written in the register (date -u). */
  date_utc: string;
  boundary: AnchorBoundary;
  /** Token symbol, or null for a boundary that is not per-token (the register's `n/a`). */
  mint: string | null;
  manifest_sha256: string;
  /** SHA-256 of the last ledger entry where the register gives one, else null. */
  entry_sha256: string | null;
  ledger_sha256: string | null;
  /** Short git SHA of the commit that added the line, the manifest and the proof. */
  commit: string;
  /** Served file names under /bell/anchors/, or null when the line carries no proof (not timestamped). */
  manifest_file: string | null;
  proof_file: string | null;
}

export interface AnchorsRegister {
  register: string;
  rows: AnchorRow[];
}

const HEX64 = /^[0-9a-f]{64}$/;
const ISO_Z = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const SHORT_SHA = /^[0-9a-f]{7,40}$/;
const FILE_NAME = /^[A-Za-z0-9_.-]+$/;

const stripTicks = (s: string): string => s.trim().replace(/^`+|`+$/g, "").trim();
const orNull = (s: string): string | null => {
  const v = stripTicks(s);
  return v === "" || v === "n/a" ? null : v;
};

/**
 * Parse the table of the anchors register (docs/course-bell/ANCHORS.md): one line per boundary,
 * `| date_u | boundary | mint | manifest_sha256 | entry_sha256 | ledger_sha256 | commit | ots_ref |` (+ an
 * optional ninth operator-note cell, never rendered). Only REAL lines are kept: an ISO-8601 Z date, a closed
 * boundary, a 64-hex manifest digest and a short SHA commit — the template and ellipsis lines are skipped. A
 * line whose `ots_ref` is not a `.ots` file name is kept as NOT timestamped (proof_file null). Throws on a real
 * line that is malformed (fail-closed: the page never renders a half-read register). Sorted by date.
 */
export function parseAnchorsRegister(markdown: string): AnchorRow[] {
  const rows: AnchorRow[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith("| 20")) continue;
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    if (cells.length < 8) continue;
    const [dateU, boundary, mint, manifest, entry, ledger, commit, otsRef] = cells.map((c) => stripTicks(c));
    if (dateU === undefined || boundary === undefined || mint === undefined || manifest === undefined) continue;
    if (!ISO_Z.test(dateU) || !HEX64.test(manifest)) continue; // template / ellipsis line
    if (!BOUNDARIES.includes(boundary as AnchorBoundary)) throw new Error(`anchors register: unknown boundary '${boundary}' on ${dateU}`);
    const c = commit ?? "";
    if (!SHORT_SHA.test(c)) throw new Error(`anchors register: malformed commit '${c}' on ${dateU}`);
    const ref = otsRef ?? "";
    const timestamped = ref.endsWith(".ots") && FILE_NAME.test(ref);
    const entryV = orNull(entry ?? "");
    const ledgerV = orNull(ledger ?? "");
    for (const [k, v] of [["entry_sha256", entryV], ["ledger_sha256", ledgerV]] as const) {
      if (v !== null && !HEX64.test(v)) throw new Error(`anchors register: malformed ${k} on ${dateU}`);
    }
    rows.push({
      date_utc: dateU,
      boundary: boundary as AnchorBoundary,
      mint: orNull(mint),
      manifest_sha256: manifest,
      entry_sha256: entryV,
      ledger_sha256: ledgerV,
      commit: c,
      manifest_file: timestamped ? ref.slice(0, -".ots".length) : null,
      proof_file: timestamped ? ref : null,
    });
  }
  rows.sort((a, b) => (a.date_utc < b.date_utc ? -1 : a.date_utc > b.date_utc ? 1 : 0));
  return rows;
}

// ── OpenTimestamps proof reader ──

export type OtsAttestation =
  | { kind: "bitcoin"; height: number }
  | { kind: "pending"; uri: string }
  | { kind: "unknown"; tag: string };

export interface OtsProof {
  hashOp: "sha256" | "sha1" | "ripemd160";
  digestHex: string;
  attestations: OtsAttestation[];
}

const MAGIC = [
  0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73, 0x00, 0x00, 0x50,
  0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf, 0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94,
];
const TAG_PENDING = "83dfe30d2ef90c8e";
const TAG_BITCOIN = "0588960d73d71901";
const BINARY_OPS = new Set([0xf0, 0xf1]);
const UNARY_OPS = new Set([0xf2, 0xf3, 0x02, 0x03, 0x08, 0x67]);
const FILE_HASH_OPS: ReadonlyMap<number, { name: OtsProof["hashOp"]; len: number }> = new Map([
  [0x08, { name: "sha256", len: 32 }],
  [0x02, { name: "sha1", len: 20 }],
  [0x03, { name: "ripemd160", len: 20 }],
]);
const MAX_RECURSION = 256;

const toHex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

/** Read the structure of a detached OpenTimestamps proof (.ots). Throws on anything malformed (bad magic,
 *  unsupported version, unknown operation, truncation, trailing bytes) — fail-closed. */
export function readOtsProof(bytes: Uint8Array): OtsProof {
  let i = 0;
  const byte = (): number => {
    const b = bytes[i];
    if (b === undefined) throw new Error("ots: truncated proof");
    i += 1;
    return b;
  };
  const take = (n: number): Uint8Array => {
    if (i + n > bytes.length) throw new Error("ots: truncated proof");
    const out = bytes.subarray(i, i + n);
    i += n;
    return out;
  };
  const varuint = (): number => {
    let value = 0;
    let scale = 1;
    for (let k = 0; k < 8; k++) {
      const b = byte();
      value += (b & 0x7f) * scale;
      if ((b & 0x80) === 0) return value;
      scale *= 128;
    }
    throw new Error("ots: varuint too long");
  };
  const varbytes = (max: number, min = 0): Uint8Array => {
    const n = varuint();
    if (n > max || n < min) throw new Error("ots: varbytes length out of bounds");
    return take(n);
  };

  for (const m of MAGIC) if (byte() !== m) throw new Error("ots: bad magic (not a detached OpenTimestamps proof)");
  const major = varuint();
  if (major !== 1) throw new Error(`ots: unsupported major version ${String(major)}`);
  const op = FILE_HASH_OPS.get(byte());
  if (op === undefined) throw new Error("ots: unsupported file hash operation");
  const digestHex = toHex(take(op.len));

  const attestations: OtsAttestation[] = [];
  const item = (tag: number, depth: number): void => {
    if (tag === 0x00) {
      const t = toHex(take(8));
      const payload = varbytes(8192);
      let j = 0;
      const pByte = (): number => {
        const b = payload[j];
        if (b === undefined) throw new Error("ots: truncated attestation payload");
        j += 1;
        return b;
      };
      const pVaruint = (): number => {
        let value = 0;
        let scale = 1;
        for (let k = 0; k < 8; k++) {
          const b = pByte();
          value += (b & 0x7f) * scale;
          if ((b & 0x80) === 0) return value;
          scale *= 128;
        }
        throw new Error("ots: varuint too long");
      };
      if (t === TAG_BITCOIN) {
        const height = pVaruint();
        if (j !== payload.length) throw new Error("ots: trailing bytes in a Bitcoin attestation");
        attestations.push({ kind: "bitcoin", height });
      } else if (t === TAG_PENDING) {
        const n = pVaruint();
        if (n > 1000 || j + n !== payload.length) throw new Error("ots: malformed pending attestation");
        attestations.push({ kind: "pending", uri: new TextDecoder("utf-8", { fatal: true }).decode(payload.subarray(j, j + n)) });
      } else {
        attestations.push({ kind: "unknown", tag: t });
      }
      return;
    }
    if (BINARY_OPS.has(tag)) varbytes(4096, 1);
    else if (!UNARY_OPS.has(tag)) throw new Error(`ots: unknown operation tag 0x${tag.toString(16)}`);
    tree(depth + 1);
  };
  const tree = (depth: number): void => {
    if (depth > MAX_RECURSION) throw new Error("ots: recursion limit");
    let tag = byte();
    while (tag === 0xff) {
      item(byte(), depth);
      tag = byte();
    }
    item(tag, depth);
  };
  tree(0);
  if (i !== bytes.length) throw new Error("ots: trailing bytes after the proof");
  return { hashOp: op.name, digestHex, attestations };
}

export interface AnchorStatus {
  /** The Bitcoin block heights inscribed in the proof, ascending, de-duplicated (read, never checked here). */
  bitcoinHeights: number[];
  /** Calendar servers that still hold a pending commitment in the proof. */
  pendingCalendars: string[];
}

export function anchorStatus(proof: OtsProof): AnchorStatus {
  const heights = new Set<number>();
  const calendars = new Set<string>();
  for (const a of proof.attestations) {
    if (a.kind === "bitcoin") heights.add(a.height);
    else if (a.kind === "pending") calendars.add(a.uri);
  }
  return { bitcoinHeights: [...heights].sort((x, y) => x - y), pendingCalendars: [...calendars].sort() };
}
