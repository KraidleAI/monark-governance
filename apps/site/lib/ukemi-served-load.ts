// apps/site/lib/ukemi-served-load.ts — build-time loader of the committed facts about the SERVED
// liquidation-eligible-coverage class (server side). Reads apps/site/data/ukemi-served.json ONLY after its sha256
// (CRLF->LF, UTF-8) equals the value apps/site/data/manifest.sha256.json carries for it (the same tamper check as
// lib/bell-served-load.ts), then checks a CLOSED shape: the file carries exactly its keys, the host and path are the
// harness OpenAPI document, read_at is an ISO UTC instant, the registry state is one of the two the gate can serve,
// the served clause is printable ASCII and opens with the sentence of that state, and the body digest is 64 lowercase
// hex. FAIL-CLOSED: an unlisted file, a hash mismatch, an extra or missing key, or a malformed value throws, so
// `next build` reds rather than render an unchecked state. The file is written by the source repository's served-state
// sync tool from one GET of the served document (schema v1) and, in schema v2, one POST of the served /gate with the
// deploy check's liquidation-eligible-coverage body (`liq_verdict`, the dated served verdict of the class). A v1 file
// carries no verdict (liq_verdict null): the course page then states no served status. The
// verdict is checked here for its CLOSED shape and its coherence with the registry state and with its own alpha (the
// interior-rank threshold is recomputed); the sync checked it against the source repository's committed calibration.
// The pages render its values by property access, never as typed literals. Self-contained (node built-ins only, no
// alias and no value import).
// apps/site/data/ukemi-pending.json (schema monark-site-ukemi-pending-v1) exists only from time (i) of a block to T0: written
// IN PROCESS by the sync's --pending (no fact read on the server), with pending_since (never rendered) on the served file.
// The pages read the served file alone; the source repository's in-process pins read loadUkemiInProcess.
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const UKEMI_SERVED_REL = "apps/site/data/ukemi-served.json";
export const UKEMI_PENDING_REL = "apps/site/data/ukemi-pending.json";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
/** The harness host and the served document the state is read from. */
export const UKEMI_SERVED_HOST = "https://api.monarkgate.tech";
export const UKEMI_SERVED_PATH = "/openapi.json";

/** The two registry states the gate can serve for the class. */
export type UkemiRegistryState = "empty" | "committed";

/** The served verdict of the class's /gate probe, read at `read_at` (v2 files only). */
export interface UkemiServedVerdict {
  /** The served path the verdict was read from (/gate). */
  path: string;
  /** The stratum of the probe's prediction (derived server-side from yhat). */
  stratum: number;
  verdict_reason: "covered" | "under_calib";
  /** The alpha of the served verdict. */
  served_alpha: number;
  /** The served count of calibration points of the stratum. */
  calibration_points: number;
  /** The served bound margin as an exact base-currency integer string, or null (under_calib). */
  bound_margin_base: string | null;
  /** The served scores digest of the stratum. */
  calibration_digest: string;
  /** Smallest calibration count for which the conformal rank at the served alpha is below that count (interior). */
  interior_rank_min_n: number;
  body_sha256: string;
}

export interface UkemiServed {
  host: string;
  path: string;
  read_at: string;
  served_class: string;
  registry_state: UkemiRegistryState;
  /** The served clause of the class, verbatim (it carries the class's requirements and its conditional rule). */
  liq_clause: string;
  cascade_uncalibrated_sentence_served: boolean;
  body_sha256: string;
  /** The dated served verdict of the class (v2), or null for a v1 file (no verdict recorded). */
  liq_verdict: UkemiServedVerdict | null;
}

const SCHEMA_V1 = "monark-site-ukemi-served-v1";
const SCHEMA_V2 = "monark-site-ukemi-served-v2";
const KEYS_V1 = [
  "$comment", "schema", "host", "path", "read_at", "served_class", "registry_state", "liq_clause",
  "cascade_uncalibrated_sentence_served", "body_sha256",
];
const KEYS_V2 = [...KEYS_V1, "liq_verdict"];
const VERDICT_KEYS = ["path", "stratum", "verdict_reason", "served_alpha", "calibration_points", "bound_margin_base", "calibration_digest", "interior_rank_min_n", "body_sha256"];
/** The fields the pending snapshot shares with the served file (its verdict without body_sha256): the promotion compares exactly these. */
export const UKEMI_PENDING_SHARED = ["served_class", "registry_state", "liq_clause", "cascade_uncalibrated_sentence_served", "liq_verdict"] as const;
const PENDING_SCHEMA = "monark-site-ukemi-pending-v1";
const INT_STRING = /^[1-9][0-9]*$/;
const HEX64 = /^[0-9a-f]{64}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ASCII = /^[\x20-\x7e]+$/;
/** The opening words of each state's clause (the empty-registry sentence, or the upper-bound lead). */
const CLAUSE_OPENING: Record<UkemiRegistryState, string> = {
  empty: "no liquidation-eligible-coverage calibration is committed yet;",
  committed: "the served region is a conformal upper bound",
};

function fail(msg: string): never {
  throw new Error(`ukemi served: ${msg}`);
}
const nonNegInt = (v: unknown, where: string): number => (typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? v : fail(`${where} must be a non-negative integer`));

/** Smallest n whose conformal rank ceil((n+1)(1-alpha)) is below n, alpha = 1/k exactly (the sync's own rule). */
function interiorRankMinN(alpha: number): number {
  const k = Math.round(1 / alpha);
  if (!(k >= 2) || Math.abs(1 / k - alpha) > 1e-15) fail(`liq_verdict.served_alpha ${String(alpha)} is not 1/k`);
  for (let n = 1; ; n++) if (Math.ceil(((n + 1) * (k - 1)) / k) < n) return n;
}

/** A verdict (v2 served file, with its body digest; pending snapshot, without): closed shape, typed fields, coherent with
 *  itself and with the registry state. */
function verdictOf(v: unknown, state: UkemiRegistryState, keys: readonly string[]): Omit<UkemiServedVerdict, "body_sha256"> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail("liq_verdict must be an object");
  const o = v as Record<string, unknown>;
  if (Object.keys(o).sort().join(",") !== [...keys].sort().join(",")) fail(`liq_verdict must carry exactly {${keys.join(", ")}}`);
  if (o.path !== "/gate") fail("liq_verdict.path must be /gate");
  if (o.verdict_reason !== "covered" && o.verdict_reason !== "under_calib") fail("liq_verdict.verdict_reason must be covered or under_calib");
  const reason: "covered" | "under_calib" = o.verdict_reason;
  if (typeof o.served_alpha !== "number" || !(o.served_alpha > 0 && o.served_alpha < 1)) fail("liq_verdict.served_alpha must be in (0, 1)");
  const qhat = o.bound_margin_base === null ? null : typeof o.bound_margin_base === "string" && INT_STRING.test(o.bound_margin_base) ? o.bound_margin_base : fail("liq_verdict.bound_margin_base must be null or a positive integer string");
  if (typeof o.calibration_digest !== "string" || !HEX64.test(o.calibration_digest)) fail("liq_verdict.calibration_digest must be 64 lowercase hex");
  const nCalib = nonNegInt(o.calibration_points, "liq_verdict.calibration_points");
  const interior = nonNegInt(o.interior_rank_min_n, "liq_verdict.interior_rank_min_n");
  if (interior !== interiorRankMinN(o.served_alpha)) fail("liq_verdict.interior_rank_min_n is not the rule's value at its served alpha");
  if ((reason === "covered") !== (qhat !== null && nCalib > 0)) fail("liq_verdict: covered iff a q-hat over committed points");
  if (reason === "under_calib" && qhat !== null) fail("liq_verdict: an under_calib verdict carries no q-hat");
  if (state === "empty" && (reason !== "under_calib" || nCalib !== 0)) fail("liq_verdict: an empty registry answers under_calib with no calibration point");
  if (state === "committed" && reason !== "covered") fail("liq_verdict: a committed registry answers covered for the probe's stratum");
  return {
    path: o.path, stratum: nonNegInt(o.stratum, "liq_verdict.stratum"), verdict_reason: reason, served_alpha: o.served_alpha,
    calibration_points: nCalib, bound_margin_base: qhat, calibration_digest: o.calibration_digest, interior_rank_min_n: interior,
  };
}

function readListed(rootDir: string, rel: string): Record<string, unknown> {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") fail("site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[rel];
  if (typeof expected !== "string") fail(`${rel} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, rel), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) fail(`sha256 mismatch for ${rel} (manifest ${expected}, actual ${actual})`);
  const d = JSON.parse(raw) as unknown;
  if (d === null || typeof d !== "object" || Array.isArray(d)) fail("the file must be an object");
  return d as Record<string, unknown>;
}

/** The fields both files carry (the verdict apart), checked (fail-closed). */
function sharedOf(o: Record<string, unknown>): Pick<UkemiServed, "served_class" | "registry_state" | "liq_clause" | "cascade_uncalibrated_sentence_served"> {
  if (o.served_class !== "liquidation-eligible-coverage") fail("served_class must be liquidation-eligible-coverage");
  if (o.registry_state !== "empty" && o.registry_state !== "committed") fail("registry_state must be empty or committed");
  const state: UkemiRegistryState = o.registry_state;
  if (typeof o.liq_clause !== "string" || !ASCII.test(o.liq_clause)) fail("liq_clause must be printable ASCII");
  if (!o.liq_clause.startsWith(CLAUSE_OPENING[state])) fail(`liq_clause does not open with the ${state} clause`);
  if (typeof o.cascade_uncalibrated_sentence_served !== "boolean") fail("cascade_uncalibrated_sentence_served must be a boolean");
  return { served_class: o.served_class, registry_state: state, liq_clause: o.liq_clause, cascade_uncalibrated_sentence_served: o.cascade_uncalibrated_sentence_served };
}

/** The served file, and its pending_since (a day, admitted in schema v2 only, present iff a pending snapshot exists). */
function servedFile(rootDir: string): { out: UkemiServed; pendingSince: string | undefined } {
  const o = readListed(rootDir, UKEMI_SERVED_REL);
  if (o.schema !== SCHEMA_V1 && o.schema !== SCHEMA_V2) fail(`schema is not ${SCHEMA_V1} or ${SCHEMA_V2}`);
  const keys = o.schema === SCHEMA_V2 ? [...KEYS_V2, ...("pending_since" in o ? ["pending_since"] : [])] : KEYS_V1;
  if (Object.keys(o).sort().join(",") !== [...keys].sort().join(",")) fail(`the file must carry exactly {${keys.join(", ")}}`);
  if (typeof o.$comment !== "string") fail("$comment must be a string");
  if (o.host !== UKEMI_SERVED_HOST || o.path !== UKEMI_SERVED_PATH) fail(`the state must be read from ${UKEMI_SERVED_HOST}${UKEMI_SERVED_PATH}`);
  if (typeof o.read_at !== "string" || !ISO_UTC.test(o.read_at)) fail("read_at must be an ISO UTC instant");
  const shared = sharedOf(o);
  if (typeof o.body_sha256 !== "string" || !HEX64.test(o.body_sha256)) fail("body_sha256 must be 64 lowercase hex");
  if (o.pending_since !== undefined && (typeof o.pending_since !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.pending_since))) fail("pending_since must be a UTC day");
  const out: UkemiServed = {
    host: o.host,
    path: o.path,
    read_at: o.read_at,
    ...shared,
    body_sha256: o.body_sha256,
    liq_verdict: o.schema === SCHEMA_V2 ? { ...verdictOf(o.liq_verdict, shared.registry_state, VERDICT_KEYS), body_sha256: bodyOf(o.liq_verdict) } : null,
  };
  return { out, pendingSince: o.pending_since as string | undefined };
}

/** The body digest of a served verdict (its keys are checked first). */
function bodyOf(v: unknown): string {
  const b = (v as Record<string, unknown>).body_sha256;
  return typeof b === "string" && HEX64.test(b) ? b : fail("liq_verdict.body_sha256 must be 64 lowercase hex");
}

/** The served facts the pages render (pending_since is admitted, never returned). */
export function loadUkemiServed(rootDir: string): UkemiServed {
  return servedFile(rootDir).out;
}

/** The pending snapshot: the shared fields the next harness serves, computed in process, and the instant it was written. */
export interface UkemiPending extends Pick<UkemiServed, "served_class" | "registry_state" | "liq_clause" | "cascade_uncalibrated_sentence_served"> {
  written_at: string;
  liq_verdict: Omit<UkemiServedVerdict, "body_sha256">;
}
/** The pending snapshot, or null when none exists. FAIL-CLOSED: it exists iff the served file carries pending_since, it is
 *  listed and hashed like the served file, closed (no fact read on the server), and written on or after pending_since. */
export function loadUkemiPending(rootDir: string): UkemiPending | null {
  const { pendingSince } = servedFile(rootDir);
  if (!existsSync(join(rootDir, UKEMI_PENDING_REL))) {
    if (pendingSince !== undefined) fail("the served file carries pending_since but no pending snapshot exists (fail-closed)");
    return null;
  }
  if (pendingSince === undefined) fail("a pending snapshot exists but the served file carries no pending_since (fail-closed)");
  const o = readListed(rootDir, UKEMI_PENDING_REL);
  const keys = ["$comment", "schema", "written_at", ...UKEMI_PENDING_SHARED];
  if (Object.keys(o).sort().join(",") !== [...keys].sort().join(",")) fail(`the pending file must carry exactly {${keys.join(", ")}}`);
  if (o.schema !== PENDING_SCHEMA) fail(`schema is not ${PENDING_SCHEMA}`);
  if (typeof o.$comment !== "string") fail("$comment must be a string");
  if (typeof o.written_at !== "string" || !ISO_UTC.test(o.written_at)) fail("written_at must be an ISO UTC instant");
  if (pendingSince > o.written_at.slice(0, 10)) fail("pending_since is later than the day the pending snapshot was written");
  const shared = sharedOf(o);
  return { written_at: o.written_at, ...shared, liq_verdict: verdictOf(o.liq_verdict, shared.registry_state, VERDICT_KEYS.filter((k) => k !== "body_sha256")) };
}

/** What the IN-PROCESS facts of the class are compared with (the source repository's tests, never a page): the pending
 *  snapshot while one exists, else the served file. */
export function loadUkemiInProcess(rootDir: string): UkemiPending | UkemiServed {
  return loadUkemiPending(rootDir) ?? loadUkemiServed(rootDir);
}
