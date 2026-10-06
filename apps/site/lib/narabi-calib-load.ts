// apps/site/lib/narabi-calib-load.ts — build-time reader of the gate's committed calibration for the Narabi class
// (server side). The number of calibration pairs and the scores digest are NEVER typed on the page: they are
// derived here from the committed, exported score fixture fixtures/usde-calib-scores.json, after its sha256
// (CRLF->LF, UTF-8) is checked against the same-line pin its provenance file carries (fixtures/PROVENANCE-usde.md,
// the declared+hashed row that test/ci-gates.test.ts also enforces). FAIL-CLOSED: an absent file, a missing pin,
// a hash mismatch, or a non-array / non-finite score throws, so `next build` reds rather than render an unchecked
// count. The digest is scores_sha256 of contract 1.1.0 (packages/contracts: sha256 of the canonical JSON writing of
// the scores in their committed order) — the value the gate's verdict carries; test/narabi-live.test.ts pins this port
// against the producer and against the harness's pinned digest. Self-contained (node built-ins only, no alias).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const CALIB_SCORES_REL = "fixtures/usde-calib-scores.json";
export const CALIB_PROVENANCE_REL = "fixtures/PROVENANCE-usde.md";

export interface NarabiCalibration {
  /** Number of committed calibration scores (one per consecutive calm pair). */
  nCalib: number;
  /** scores_sha256 over those scores, in their committed order. */
  scoresSha256: string;
  /** sha256 (LF) of the fixture file, equal to its provenance pin. */
  fileSha256: string;
}

/** The repository root while `next build` runs (cwd = apps/site), as lib/load-committed.ts documents. */
export function narabiRepoRoot(): string {
  return join(process.cwd(), "..", "..");
}

/** scores_sha256: sha256 of the canonical writing of finite scores, in the order given (JSON.stringify writes a finite
 *  number as the canonical writing does, -0 as 0). */
export function scoresSha256Of(scores: readonly number[]): string {
  return createHash("sha256").update(JSON.stringify(scores), "utf8").digest("hex");
}

export function loadNarabiCalibration(rootDir: string): NarabiCalibration {
  const raw = readFileSync(join(rootDir, CALIB_SCORES_REL), "utf8");
  const fileSha256 = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  const provenance = readFileSync(join(rootDir, CALIB_PROVENANCE_REL), "utf8");
  const pinLine = provenance.split(/\r?\n/).find((l) => l.includes("`" + CALIB_SCORES_REL + "`") && /\b[0-9a-f]{64}\b/.test(l));
  if (pinLine === undefined) throw new Error(`narabi calibration: ${CALIB_PROVENANCE_REL} carries no sha256 pin for ${CALIB_SCORES_REL} (fail-closed)`);
  const pinned = /\b([0-9a-f]{64})\b/.exec(pinLine)?.[1];
  if (pinned !== fileSha256) {
    throw new Error(`narabi calibration: sha256 mismatch for ${CALIB_SCORES_REL} (pinned ${String(pinned)}, actual ${fileSha256})`);
  }
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error(`narabi calibration: ${CALIB_SCORES_REL} is not a non-empty array`);
  const scores: number[] = [];
  for (const v of parsed) {
    if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`narabi calibration: ${CALIB_SCORES_REL} carries a non-finite score`);
    scores.push(v);
  }
  return { nCalib: scores.length, scoresSha256: scoresSha256Of(scores), fileSha256 };
}
