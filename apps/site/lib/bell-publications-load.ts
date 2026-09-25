// apps/site/lib/bell-publications-load.ts — build-time loader of the served publications register (/bell/anchors/publications.json and
// the manifests and proofs it names), shared by the pages, the rendered-page assertion scripts/assert-fleet-html.mjs and the root tests.
// Self-contained (node built-ins only, no alias or relative import): the pure reader of lib/bell-anchors.ts is passed in. Every row is
// bound BEFORE any state is derived from it: a timestamped row to its files (bindPublicationAnchor: the manifest bytes hash to the row's
// digest, carry exactly the entries of the row's line, and the proof timestamps them), then every row to the chain the site data walked
// (bindPublicationRowToLines: seq, line_hash, kind, the manifest's files). FAIL-CLOSED: a row that does not bind throws, so the build reds;
// a loader that skipped a binding would let the state fall to "none" in silence, which the root tests refuse.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

type Entries = Array<{ relpath: string; digest: string }>;
interface RowShape { date_utc: string; seq: number; manifest_sha256: string; manifest_file: string | null; proof_file: string | null }
/** The functions of the pure reader (lib/bell-anchors.ts) this loader calls (function properties: their parameters are inferred and checked
 *  contravariantly, so the row type is the reader's own). */
export interface PublicationsReader<R, P, S, L> {
  readOtsProof: (bytes: Uint8Array) => P;
  anchorStatus: (proof: P) => S;
  manifestEntries: (text: string) => Entries;
  bindPublicationAnchor: (row: R, manifestText: string, manifestSha256: string, proof: P) => void;
  bindPublicationRowToLines: (row: R, entries: Entries | null, lines: readonly L[]) => void;
}
export interface PublicationsView<R, S> {
  register: string;
  /** Every row in register order, with the status read from its proof, or null for a row without proof. */
  rows: Array<R & { status: S | null }>;
  /** The timestamped rows, bound: what the timestamp state is derived from. */
  bound: Array<{ row: R; entries: Entries; status: S }>;
  proofs: number;
  withBitcoin: number;
  withoutProof: number;
}

export function loadPublicationAnchors<R extends RowShape, P, S extends { bitcoinHeights: number[] }, L>(publicDir: string, served: { lines: readonly L[] }, lib: PublicationsReader<R, P, S, L>): PublicationsView<R, S> {
  const reg = JSON.parse(readFileSync(join(publicDir, "publications.json"), "utf8")) as { register: string; rows: R[] };
  const bound: PublicationsView<R, S>["bound"] = [];
  const rows = reg.rows.map((r) => {
    if (r.manifest_file === null || r.proof_file === null) {
      lib.bindPublicationRowToLines(r, null, served.lines);
      return { ...r, status: null };
    }
    if (![r.manifest_file, r.proof_file].every((n) => /^[A-Za-z0-9_.-]+$/.test(n))) throw new Error(`bell publications: seq ${String(r.seq)} names a file that is not a plain served name`);
    const bytes = readFileSync(join(publicDir, r.manifest_file)), text = bytes.toString("utf8");
    const proof = lib.readOtsProof(new Uint8Array(readFileSync(join(publicDir, r.proof_file))));
    lib.bindPublicationAnchor(r, text, createHash("sha256").update(bytes).digest("hex"), proof);
    const entries = lib.manifestEntries(text);
    lib.bindPublicationRowToLines(r, entries, served.lines);
    const status = lib.anchorStatus(proof);
    bound.push({ row: r, entries, status });
    return { ...r, status };
  });
  const withBitcoin = bound.filter((b) => b.status.bitcoinHeights.length > 0).length;
  return { register: reg.register, rows, bound, proofs: bound.length, withBitcoin, withoutProof: rows.length - bound.length };
}
