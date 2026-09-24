// apps/site/lib/ukemi-served-load.ts — build-time loader of the committed facts about the SERVED
// liquidation-eligible-coverage class (server side). Reads apps/site/data/ukemi-served.json ONLY after its sha256
// (CRLF->LF, UTF-8) equals the value apps/site/data/manifest.sha256.json carries for it (the same tamper check as
// lib/bell-served-load.ts), then checks a CLOSED shape: the file carries exactly its keys, the host and path are the
// harness OpenAPI document, read_at is an ISO UTC instant, the registry state is one of the two the gate can serve,
// the served clause is printable ASCII and opens with the sentence of that state, and the body digest is 64 lowercase
// hex. FAIL-CLOSED: an unlisted file, a hash mismatch, an extra or missing key, or a malformed value throws, so
// `next build` reds rather than render an unchecked state. The file is written by the source repository's served-state
// sync tool from one GET of the served document; the pages render its values by property access, never as typed
// literals. Self-contained (node built-ins only, no alias and no value import).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const UKEMI_SERVED_REL = "apps/site/data/ukemi-served.json";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
/** The harness host and the served document the state is read from. */
export const UKEMI_SERVED_HOST = "https://api.monarkgate.tech";
export const UKEMI_SERVED_PATH = "/openapi.json";

/** The two registry states the gate can serve for the class. */
export type UkemiRegistryState = "empty" | "committed";

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
}

const KEYS = [
  "$comment", "schema", "host", "path", "read_at", "served_class", "registry_state", "liq_clause",
  "cascade_uncalibrated_sentence_served", "body_sha256",
];
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

export function loadUkemiServed(rootDir: string): UkemiServed {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") fail("site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[UKEMI_SERVED_REL];
  if (typeof expected !== "string") fail(`${UKEMI_SERVED_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, UKEMI_SERVED_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) fail(`sha256 mismatch for ${UKEMI_SERVED_REL} (manifest ${expected}, actual ${actual})`);

  const d = JSON.parse(raw) as unknown;
  if (d === null || typeof d !== "object" || Array.isArray(d)) fail("the file must be an object");
  const o = d as Record<string, unknown>;
  if (Object.keys(o).sort().join(",") !== [...KEYS].sort().join(",")) fail(`the file must carry exactly {${KEYS.join(", ")}}`);
  if (typeof o.$comment !== "string") fail("$comment must be a string");
  if (o.schema !== "monark-site-ukemi-served-v1") fail("schema is not monark-site-ukemi-served-v1");
  if (o.host !== UKEMI_SERVED_HOST || o.path !== UKEMI_SERVED_PATH) fail(`the state must be read from ${UKEMI_SERVED_HOST}${UKEMI_SERVED_PATH}`);
  if (typeof o.read_at !== "string" || !ISO_UTC.test(o.read_at)) fail("read_at must be an ISO UTC instant");
  if (o.served_class !== "liquidation-eligible-coverage") fail("served_class must be liquidation-eligible-coverage");
  if (o.registry_state !== "empty" && o.registry_state !== "committed") fail("registry_state must be empty or committed");
  const state: UkemiRegistryState = o.registry_state;
  if (typeof o.liq_clause !== "string" || !ASCII.test(o.liq_clause)) fail("liq_clause must be printable ASCII");
  if (!o.liq_clause.startsWith(CLAUSE_OPENING[state])) fail(`liq_clause does not open with the ${state} clause`);
  if (typeof o.cascade_uncalibrated_sentence_served !== "boolean") fail("cascade_uncalibrated_sentence_served must be a boolean");
  if (typeof o.body_sha256 !== "string" || !HEX64.test(o.body_sha256)) fail("body_sha256 must be 64 lowercase hex");
  return {
    host: o.host,
    path: o.path,
    read_at: o.read_at,
    served_class: o.served_class,
    registry_state: state,
    liq_clause: o.liq_clause,
    cascade_uncalibrated_sentence_served: o.cascade_uncalibrated_sentence_served,
    body_sha256: o.body_sha256,
  };
}
