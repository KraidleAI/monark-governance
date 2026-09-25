// apps/site/lib/bell-anchors.ts — the Bell anchors register, as served under /bell/anchors, and a structural
// reader of OpenTimestamps proofs ("status per anchor read from the file").
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

/** The digests a head manifest lists, one per "<relpath> <sha256hex>" line (what its anchor timestamps). Throws on a line
 *  of another shape (fail-closed: a half-read manifest never decides whether a record is anchored). */
export function manifestDigests(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split("\n")) {
    if (line === "") continue;
    const m = /^\S+ ([0-9a-f]{64})$/.exec(line);
    if (m?.[1] === undefined) throw new Error("anchors manifest: a line is not '<relpath> <sha256hex>'");
    out.push(m[1]);
  }
  return out;
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

// ── The publications register (docs/bell-publications/ANCHORS.md), served as publications.json by scripts/sync-bell-anchors.mjs;
// separate from the course register above, whose boundary list stays closed. A row = one OpenTimestamps proof (pending, or recording a
// Bitcoin block) of a manifest listing `timeline.jsonl#L<n>` (line n without its LF: its line_hash), `timeline.jsonl#L1-L<n>` (lines
// 1..n with their LF) and, for a publication, the two files line n names. The timestamp state of the latest published record is
// derived at the end of this file, from rows already bound (publicationAnchorState), and worded there once (publicationAnchorSentence).

export type PublicationKind = "publication" | "key_rotation" | "key_revocation";
export const PUBLICATION_COLUMNS = ["date_u", "seq", "kind", "line_hash", "prefix_sha256", "manifest_sha256", "commit", "ots_ref", "note"] as const;
/** `timeline-seq<n>-manifest.txt.ots`, or `timeline-seq<n>-<k>-manifest.txt.ots` (k >= 2) for a new timestamp of the same line. */
const PUBLICATION_PROOF = /^timeline-seq([1-9]\d{0,8})(?:-(?:[2-9]|[1-9]\d{1,8}))?-manifest\.txt\.ots$/;

export interface PublicationAnchorRow {
  date_utc: string; seq: number; kind: PublicationKind; line_hash: string; prefix_sha256: string; manifest_sha256: string; commit: string;
  /** Served file names under /bell/anchors/, or null when the row carries no proof (not timestamped). */
  manifest_file: string | null; proof_file: string | null;
}
export interface PublicationAnchorsRegister { register: string; rows: PublicationAnchorRow[] }

/** Parse the publications register: its header (PUBLICATION_COLUMNS) first, then EVERY table row is a real row (no template row);
 *  a malformed row throws, naming its column. An `ots_ref` that is not a `.ots` name must read `not timestamped at <ISO Z>` and marks
 *  the row NOT timestamped (both files null); a `.ots` name must be the proof name of the row's own seq, named once. Sorted by seq,
 *  then date. The files are bound by bindPublicationAnchor, the row to the served chain by bindPublicationRowToLines. */
export function parsePublicationAnchors(markdown: string): PublicationAnchorRow[] {
  const rows: PublicationAnchorRow[] = [];
  let header = false;
  for (const line of markdown.split(/\r?\n/).filter((l) => l.startsWith("|"))) {
    const cells = line.trim().replace(/^\||\|$/g, "").split("|").map(stripTicks);
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    if (!header && cells.join("|") !== PUBLICATION_COLUMNS.join("|")) throw new Error(`publications register: the first table row is not the header '${PUBLICATION_COLUMNS.join(" | ")}'`);
    if (!header) { header = true; continue; }
    const no = (why: string): never => { throw new Error(`publications register: row ${String(rows.length + 1)}: ${why}`); };
    const [dateU = "", seq = "", kind = "", lineHash = "", prefix = "", manifest = "", commit = "", otsRef = ""] = cells, stamped = otsRef.endsWith(".ots");
    if (cells.length !== PUBLICATION_COLUMNS.length) no(`${String(cells.length)} cells, not ${String(PUBLICATION_COLUMNS.length)}`);
    if (!ISO_Z.test(dateU)) no(`date_u '${dateU}' is not an ISO-8601 Z instant`);
    if (!/^[1-9]\d{0,8}$/.test(seq)) no(`malformed seq '${seq}'`);
    if (!["publication", "key_rotation", "key_revocation"].includes(kind)) no(`unknown kind '${kind}'`);
    for (const [k, v] of [["line_hash", lineHash], ["prefix_sha256", prefix], ["manifest_sha256", manifest]] as const) if (!HEX64.test(v)) no(`malformed ${k}`);
    if (!SHORT_SHA.test(commit)) no(`malformed commit '${commit}'`);
    if (stamped && PUBLICATION_PROOF.exec(otsRef)?.[1] !== seq) no(`ots_ref '${otsRef}' is not the proof name of line ${seq}`);
    if (stamped && rows.some((r) => r.proof_file === otsRef)) no(`ots_ref '${otsRef}' is named twice`);
    if (!stamped && !/^not timestamped at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(otsRef)) no(`ots_ref '${otsRef}' is neither a proof name nor 'not timestamped at <ISO Z>'`);
    rows.push({ date_utc: dateU, seq: Number(seq), kind: kind as PublicationKind, line_hash: lineHash, prefix_sha256: prefix, manifest_sha256: manifest, commit,
      manifest_file: stamped ? otsRef.slice(0, -".ots".length) : null, proof_file: stamped ? otsRef : null });
  }
  if (!header) throw new Error("publications register: no table");
  return rows.sort((a, b) => a.seq - b.seq || (a.date_utc < b.date_utc ? -1 : a.date_utc > b.date_utc ? 1 : 0));
}

/** The entries of a publication manifest, in its format (printable-ASCII relpaths in strictly increasing byte order, lowercase
 *  64-hex digests, LF line ends, a final LF); throws on any other shape. The course keeps manifestDigests. */
export function manifestEntries(text: string): Array<{ relpath: string; digest: string }> {
  const lines = text.split("\n");
  if (lines.pop() !== "" || lines.length === 0) throw new Error("publication manifest: not LF-terminated lines");
  const out = lines.map((line) => /^([!-~]+) ([0-9a-f]{64})$/.exec(line) ?? []).map(([, relpath, digest]) => {
    if (relpath === undefined || digest === undefined) throw new Error("publication manifest: a line is not '<relpath> <sha256hex>'");
    return { relpath, digest };
  });
  if (out.some((e, i) => i > 0 && !((out[i - 1]?.relpath ?? "") < e.relpath))) throw new Error("publication manifest: relpaths are not in strictly increasing byte order");
  return out;
}

/** Bind a timestamped row to its files, one named error per requirement: the manifest bytes hash to manifest_sha256 (hashed by
 *  the caller: no crypto here); the manifest has exactly the entries of the row's line (its two timeline entries and, for a
 *  publication, one states/ and one provenance/ file, each named by its own digest); its `timeline.jsonl#L<seq>` entry is
 *  line_hash (key and value), its `timeline.jsonl#L1-L<seq>` entry prefix_sha256; the proof timestamps manifest_sha256 with
 *  sha256. The proof is read, not checked against a node. */
export function bindPublicationAnchor(row: PublicationAnchorRow, manifestText: string, manifestSha256: string, proof: OtsProof): void {
  const at = `publications register, seq ${String(row.seq)} (${row.manifest_file ?? "no proof"})`, no = (why: string): never => { throw new Error(`${at}: ${why}`); };
  const lineKey = `timeline.jsonl#L${String(row.seq)}`, prefixKey = `timeline.jsonl#L1-L${String(row.seq)}`;
  if (row.manifest_file === null || row.proof_file === null) no("a row without proof has no file to bind");
  if (manifestSha256 !== row.manifest_sha256) no("the manifest bytes do not hash to manifest_sha256");
  const entries = manifestEntries(manifestText), digestOf = (key: string): string | undefined => entries.find((e) => e.relpath === key)?.digest;
  const shape = entries.map((e) => { const m = /^(states|provenance)\/([0-9a-f]{64})\.json$/.exec(e.relpath); return m?.[2] === e.digest ? `${m[1] ?? ""} file` : e.relpath; });
  const want = [lineKey, prefixKey, ...(row.kind === "publication" ? ["provenance file", "states file"] : [])];
  if (shape.sort().join("\n") !== want.sort().join("\n")) no(`the manifest does not have exactly the entries of ${row.kind} line ${String(row.seq)}`);
  if (digestOf(lineKey) !== row.line_hash) no(`the manifest entry ${lineKey} differs from line_hash`);
  if (digestOf(prefixKey) !== row.prefix_sha256) no(`the manifest entry ${prefixKey} differs from prefix_sha256`);
  if (proof.hashOp !== "sha256" || proof.digestHex !== row.manifest_sha256) no("the proof does not timestamp manifest_sha256");
}

/** The facts of one line of the served timeline (lines[] of the site data): a publication names its state and provenance files. */
export interface TimelineLineFacts { seq: number; kind: string; line_hash: string; prev_line_hash: string; state_sha256?: string; provenance_sha256?: string }

/** Bind a register row to the chain the site data walked, one named error per requirement: its seq is a served line, its line_hash and
 *  its kind are that line's, and for a timestamped row (its manifest entries given; null for a row without proof) the manifest's files
 *  are exactly the ones the line names: its provenance and state files for a publication, none for a key line. */
export function bindPublicationRowToLines(row: Pick<PublicationAnchorRow, "seq" | "kind" | "line_hash">, entries: ReadonlyArray<{ relpath: string; digest: string }> | null, lines: readonly TimelineLineFacts[]): void {
  const n = String(row.seq), line = lines[row.seq - 1], no = (why: string): Error => new Error(`publications register, seq ${n}: ${why}`);
  if (line === undefined || line.seq !== row.seq) throw no(`seq ${n} is beyond the served lines (run the served-data sync first)`);
  if (row.line_hash !== line.line_hash) throw no(`line_hash is not that of line ${n}`);
  if (row.kind !== line.kind) throw no(`kind is not that of line ${n}`);
  const files = entries?.filter((e) => !e.relpath.startsWith("timeline.jsonl#")).map((e) => `${e.relpath} ${e.digest}`).sort().join("\n");
  const [p, s] = [line.provenance_sha256 ?? "", line.state_sha256 ?? ""], want = line.kind === "publication" ? `provenance/${p}.json ${p}\nstates/${s}.json ${s}` : "";
  if (files !== undefined && files !== want) throw no(`the manifest's files are not those line ${n} names`);
}

/** "2026-09-22T14:07:18Z" -> "2026-09-22 14:07:18" (UTC). */
export function utcLabel(iso: string): string {
  return iso.replace("T", " ").replace(/Z$/, "");
}

/** A register row bound by the loader (bindPublicationAnchor, then bindPublicationRowToLines): its manifest entries and the status read
 *  from its proof, never checked against a node. */
export interface BoundPublicationRow { row: PublicationAnchorRow; entries: ReadonlyArray<{ relpath: string; digest: string }>; status: AnchorStatus }
/** The timestamp state of the latest published record (the head), and the highest line whose own proof records a block. */
export type PublicationAnchorState = { head_seq: number; latestAnchoredSeq: number | null } & (
  | { state: "none" }
  | { state: "pending"; via_seq: number; date_utc: string }
  | { state: "anchored"; via_seq: number; date_utc: string; earliestHeight: number; blockRecords: number });

/** The state of the head `{seq, line_hash}` (the latest publication line) from rows already bound. A row counts when (i) its seq is the
 *  head's or later, (ii) lines[] carries the head's line_hash at the head's seq and chains every line from the head to the row, (iii) its
 *  manifest entry `timeline.jsonl#L<seq>` carries that line's hash (key and value), (iv) its proof timestamps the manifest (held by the
 *  loader). A line after the head that is not a key line throws (incoherent site data). anchored: a counted row whose proof records a
 *  block, the earliest height over every counted row (ties: seq, then date); pending: a counted row without one, the oldest (seq, then
 *  date); none otherwise. latestAnchoredSeq: the highest seq of a row carrying its own line whose proof records a block, or null. */
export function publicationAnchorState(head: { seq: number; line_hash: string }, lines: readonly TimelineLineFacts[], bound: readonly BoundPublicationRow[]): PublicationAnchorState {
  if (lines.slice(head.seq).some((l) => l.kind !== "key_rotation" && l.kind !== "key_revocation")) throw new Error(`publication anchor state: a line after the head (seq ${String(head.seq)}) is not a key line`);
  const carries = (b: BoundPublicationRow): boolean => b.entries.some((e) => e.relpath === `timeline.jsonl#L${String(b.row.seq)}` && e.digest === lines[b.row.seq - 1]?.line_hash);
  const chained = (to: number): boolean => lines[head.seq - 1]?.line_hash === head.line_hash && lines.length >= to && lines.slice(head.seq, to).every((l, i) => l.prev_line_hash === lines[head.seq - 1 + i]?.line_hash);
  const order = (a: BoundPublicationRow, b: BoundPublicationRow): number => a.row.seq - b.row.seq || (a.row.date_utc < b.row.date_utc ? -1 : a.row.date_utc > b.row.date_utc ? 1 : 0);
  const counted = bound.filter((b) => b.row.seq >= head.seq && chained(b.row.seq) && carries(b)).sort(order);
  const earliest = (b: BoundPublicationRow | undefined): number => b?.status.bitcoinHeights[0] ?? Infinity;
  const best = counted.reduce<BoundPublicationRow | undefined>((m, b) => (earliest(b) < earliest(m) ? b : m), undefined), first = counted[0];
  const blocks = bound.filter((b) => carries(b) && b.status.bitcoinHeights.length > 0).map((b) => b.row.seq);
  const base = { head_seq: head.seq, latestAnchoredSeq: blocks.length > 0 ? Math.max(...blocks) : null };
  if (best !== undefined) return { ...base, state: "anchored", via_seq: best.row.seq, date_utc: best.row.date_utc, earliestHeight: earliest(best), blockRecords: best.status.bitcoinHeights.length };
  return first === undefined ? { ...base, state: "none" } : { ...base, state: "pending", via_seq: first.row.seq, date_utc: first.row.date_utc };
}

/** The one wording of the state, rendered by every page that states it (never typed in a page); numbers and dates come from the state. */
export function publicationAnchorSentence(s: PublicationAnchorState): string {
  if (s.state === "none") return "none: no anchor manifest lists the latest record's digests; it is signed and chained, not timestamp-anchored";
  const later = s.via_seq > s.head_seq ? ` through a later line of the same chain (line ${String(s.via_seq)}), which carries this record's line by its hash` : "";
  if (s.state === "pending") return `submitted for a timestamp on ${utcLabel(s.date_utc)} UTC${later}; the proof is pending: it records calendars, no Bitcoin block yet`;
  const block = `the proof file records Bitcoin block ${String(s.earliestHeight)}${s.blockRecords > 1 ? `, the earliest of ${String(s.blockRecords)}` : ""}`;
  return `anchored${later}: ${block}; the record's line and every line before it existed before that block; read from the file when this page was built, not checked against a node here`;
}

/** The line /bell/anchors renders for latestAnchoredSeq (never typed). */
export function latestAnchoredLine(seq: number | null): string {
  return `latest line whose proof records a Bitcoin block: ${seq === null ? "none yet" : String(seq)}`;
}
