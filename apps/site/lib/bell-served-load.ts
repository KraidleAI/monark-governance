// apps/site/lib/bell-served-load.ts — build-time loader of the committed facts about the SERVED Bell host (lot
// BELL-SERVED-1, decision 155; server side). Reads apps/site/data/bell-served.json ONLY after its sha256 (CRLF->LF,
// UTF-8) equals the value apps/site/data/manifest.sha256.json carries for it (same tamper check as
// lib/bell-legal-load.ts and lib/load-committed.ts), then checks a CLOSED shape: every level carries exactly its
// keys, seq is a positive integer, instants are ISO UTC, digests and key_id are 64 lowercase hex. FAIL-CLOSED: an
// unlisted file, a hash mismatch, an extra or missing key, or a malformed value throws, so `next build` reds rather
// than render an unchecked record. The file is written by scripts/sync-bell-served.mjs from the served files; the
// pages render its values by property access, never as typed literals (pinned by test/bell-served.test.ts).
// Self-contained (node built-ins only, no alias import): shared by the two pages and the root test program.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const BELL_SERVED_REL = "apps/site/data/bell-served.json";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
/** The one Bell host (ADR-T1b-backend D9, C-10: the site links it and serves no second copy of the key). */
export const BELL_HOST = "https://bell.monarkgate.tech";
export const BELL_TIMELINE_PATH = "/timeline.jsonl";
export const BELL_PUBKEY_PATH = "/bell/pubkey.json";

export interface BellServedSession { symbol: string; session: string; regime: string | null; n: number; vwap: string; volumeBase: string; abstain: string | null }
export interface BellServedRun {
  bell_sha: string; symbol: string; chain: string;
  window: { from_utc_ms: number; to_utc_ms: number };
  fills: number; sessions_count: number; quorum_coverage: string;
  sessions: BellServedSession[]; residuals: Record<string, number>;
}
export interface BellServedData {
  host: string;
  read_at: string;
  first_record: { seq: number; published_at: string; line_hash: string; key_id: string };
  first_run: BellServedRun;
  bodies_sha256: { timeline: string; pubkey: string; state: string };
}
export const BELL_STATE_PATH = "/state.json";

/** The repository root while `next build` runs (cwd = apps/site), as lib/load-committed.ts documents. */
export function bellServedRepoRoot(): string {
  return join(process.cwd(), "..", "..");
}

const HEX64 = /^[0-9a-f]{64}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function obj(v: unknown, keys: readonly string[], where: string): Record<string, unknown> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) throw new Error(`bell served: ${where} must be an object`);
  const o = v as Record<string, unknown>;
  const got = Object.keys(o).sort().join(",");
  if (got !== [...keys].sort().join(",")) throw new Error(`bell served: ${where} must carry exactly {${keys.join(", ")}}, got {${got}}`);
  return o;
}
function match(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== "string" || !re.test(v)) throw new Error(`bell served: ${where} is malformed`);
  return v;
}

export function loadBellServed(rootDir: string): BellServedData {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") throw new Error("bell served: site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[BELL_SERVED_REL];
  if (typeof expected !== "string") throw new Error(`bell served: ${BELL_SERVED_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, BELL_SERVED_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) throw new Error(`bell served: sha256 mismatch for ${BELL_SERVED_REL} (manifest ${expected}, actual ${actual})`);

  const d = obj(JSON.parse(raw), ["$comment", "schema", "host", "read_at", "first_record", "first_run", "bodies_sha256"], "file");
  if (d.schema !== "monark-site-bell-served-v2") throw new Error("bell served: schema is not monark-site-bell-served-v2");
  if (d.host !== BELL_HOST) throw new Error(`bell served: host must be ${BELL_HOST}`);
  const r = obj(d.first_record, ["seq", "published_at", "line_hash", "key_id"], "first_record");
  if (typeof r.seq !== "number" || !Number.isInteger(r.seq) || r.seq < 1) throw new Error("bell served: first_record.seq must be a positive integer");
  const b = obj(d.bodies_sha256, [BELL_TIMELINE_PATH, BELL_PUBKEY_PATH, BELL_STATE_PATH], "bodies_sha256");
  const DEC = /^-?\d+(?:\.\d+)?$/, LABEL = /^[a-z0-9][a-z0-9_-]*$/i;
  const nonneg = (v: unknown, where: string): number => { if (typeof v !== "number" || !Number.isInteger(v) || v < 0) throw new Error(`bell served: ${where} must be a non-negative integer`); return v; };
  const fr = obj(d.first_run, ["bell_sha", "symbol", "chain", "window", "fills", "sessions_count", "quorum_coverage", "sessions", "residuals"], "first_run");
  const w = obj(fr.window, ["from_utc_ms", "to_utc_ms"], "first_run.window");
  if (!Array.isArray(fr.sessions) || fr.sessions.length < 1) throw new Error("bell served: first_run.sessions must be a non-empty array");
  const sessions = fr.sessions.map((x, i) => {
    const g = obj(x, ["symbol", "session", "regime", "n", "vwap", "volumeBase", "abstain"], `first_run.sessions[${String(i)}]`);
    return {
      symbol: match(g.symbol, LABEL, "session symbol"), session: match(g.session, LABEL, "session"),
      regime: g.regime === null ? null : match(g.regime, LABEL, "session regime"), n: nonneg(g.n, "session n"),
      vwap: match(g.vwap, DEC, "session vwap"), volumeBase: match(g.volumeBase, DEC, "session volumeBase"),
      abstain: g.abstain === null ? null : match(g.abstain, LABEL, "session abstain"),
    };
  });
  if (fr.residuals === null || typeof fr.residuals !== "object" || Array.isArray(fr.residuals)) throw new Error("bell served: first_run.residuals must be an object");
  const residuals: Record<string, number> = {};
  for (const [k, v] of Object.entries(fr.residuals as Record<string, unknown>)) { if (!LABEL.test(k)) throw new Error("bell served: residual name is malformed"); residuals[k] = nonneg(v, `residual ${k}`); }
  const first_run = {
    bell_sha: match(fr.bell_sha, HEX64, "first_run.bell_sha"), symbol: match(fr.symbol, LABEL, "first_run.symbol"), chain: match(fr.chain, LABEL, "first_run.chain"),
    window: { from_utc_ms: nonneg(w.from_utc_ms, "window.from_utc_ms"), to_utc_ms: nonneg(w.to_utc_ms, "window.to_utc_ms") },
    fills: nonneg(fr.fills, "first_run.fills"), sessions_count: nonneg(fr.sessions_count, "first_run.sessions_count"),
    quorum_coverage: match(fr.quorum_coverage, DEC, "first_run.quorum_coverage"), sessions, residuals,
  };
  if (first_run.window.to_utc_ms <= first_run.window.from_utc_ms) throw new Error("bell served: window must end after it starts");
  if (first_run.sessions.length !== first_run.sessions_count) throw new Error("bell served: sessions_count must equal the number of session rows");
  if (first_run.sessions.reduce((a, x) => a + x.n, 0) !== first_run.fills) throw new Error("bell served: fills must equal the sum of session n");
  return {
    host: BELL_HOST,
    read_at: match(d.read_at, ISO_UTC, "read_at"),
    first_record: {
      seq: r.seq,
      published_at: match(r.published_at, ISO_UTC, "first_record.published_at"),
      line_hash: match(r.line_hash, HEX64, "first_record.line_hash"),
      key_id: match(r.key_id, HEX64, "first_record.key_id"),
    },
    first_run,
    bodies_sha256: { timeline: match(b[BELL_TIMELINE_PATH], HEX64, "bodies_sha256 timeline"), pubkey: match(b[BELL_PUBKEY_PATH], HEX64, "bodies_sha256 pubkey"), state: match(b[BELL_STATE_PATH], HEX64, "bodies_sha256 state") },
  };
}
