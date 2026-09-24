// apps/site/lib/bell-anchors-load.ts — build-time loader of the served anchors (server components only).
// Reads apps/site/public/bell/anchors/ (the files a visitor downloads), re-checks each line (manifest bytes hash to
// the line's digest; the proof attests that digest) and reads each proof's attestations. FAIL-CLOSED: any mismatch
// throws, so `next build` reds rather than render a pair a third party could not check. Every number shown on the
// page (block heights, counts) comes from here — never a literal in the page source (orchestrator ruling (3)).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { readOtsProof, anchorStatus, type AnchorRow, type AnchorsRegister, type AnchorStatus } from "@/lib/bell-anchors";

/** URL path the anchors are served under (apps/site/public/bell/anchors/). */
export const ANCHORS_ROUTE = "/bell/anchors";

export interface AnchorView extends AnchorRow {
  status: AnchorStatus | null;
  /** Same manifest digest as a later line that carries a proof (derived, for a line without proof). */
  sameDigestAsLater: string | null;
}

export interface AnchorsView {
  register: string;
  rows: AnchorView[];
  proofs: number;
  withBitcoin: number;
  withoutProof: number;
  /** Mints that have a start line but no end line yet, in first-seen order (derived from the register). */
  openMints: string[];
  hasFinal: boolean;
}

export function loadAnchors(): AnchorsView {
  const dir = join(process.cwd(), "public", "bell", "anchors");
  const reg = JSON.parse(readFileSync(join(dir, "anchors.json"), "utf8")) as AnchorsRegister;
  const rows: AnchorView[] = reg.rows.map((r) => {
    if (r.proof_file === null || r.manifest_file === null) return { ...r, status: null, sameDigestAsLater: null };
    const manifest = readFileSync(join(dir, r.manifest_file));
    const digest = createHash("sha256").update(manifest).digest("hex");
    if (digest !== r.manifest_sha256) throw new Error(`bell anchors: ${r.manifest_file} does not hash to its line's digest`);
    const proof = readOtsProof(new Uint8Array(readFileSync(join(dir, r.proof_file))));
    if (proof.digestHex !== r.manifest_sha256) throw new Error(`bell anchors: ${r.proof_file} does not attest its line's digest`);
    return { ...r, status: anchorStatus(proof), sameDigestAsLater: null };
  });
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r === undefined || r.proof_file !== null) continue;
    const later = rows.slice(i + 1).find((x) => x.proof_file !== null && x.manifest_sha256 === r.manifest_sha256);
    r.sameDigestAsLater = later ? later.date_utc : null;
  }
  const started = [...new Set(rows.filter((r) => r.boundary === "mint_start" && r.mint !== null).map((r) => r.mint as string))];
  const ended = new Set(rows.filter((r) => r.boundary === "mint_end" && r.mint !== null).map((r) => r.mint as string));
  return {
    register: reg.register,
    rows,
    proofs: rows.filter((r) => r.status !== null).length,
    withBitcoin: rows.filter((r) => r.status !== null && r.status.bitcoinHeights.length > 0).length,
    withoutProof: rows.filter((r) => r.status === null).length,
    openMints: started.filter((m) => !ended.has(m)),
    hasFinal: rows.some((r) => r.boundary === "final"),
  };
}

/** "2026-09-22T14:07:18Z" -> "2026-09-22 14:07:18" (UTC). */
export function utcLabel(iso: string): string {
  return iso.replace("T", " ").replace(/Z$/, "");
}

/** First and last eight hex characters of a digest, the full value kept for a title attribute. */
export function shortDigest(hex: string): string {
  return `${hex.slice(0, 8)}…${hex.slice(-8)}`;
}
