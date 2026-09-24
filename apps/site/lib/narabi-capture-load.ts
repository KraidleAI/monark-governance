// apps/site/lib/narabi-capture-load.ts — build-time loader of the committed capture of the two files the Narabi sentinel
// publishes (server side). /narabi renders it first, DECLARED as the committed capture;
// the browser then reads the files as served now and re-renders, or keeps the capture and SAYS the read failed. Reads
// apps/site/data/narabi-capture.json ONLY after its sha256 (CRLF->LF, UTF-8) equals the value
// apps/site/data/manifest.sha256.json carries for it (same tamper check as lib/bell-served-load.ts), then checks a CLOSED
// shape and the capture's own invariants: each stored body hashes to its recorded sha256, the stored timeline carries no
// URL and no endpoint list (each line keeps only endpoints_count), the recorded served timeline is 64-hex with a positive
// length, and the previous capture is older with a strictly shorter served timeline (append-only). FAIL-CLOSED: an
// unlisted file, a hash mismatch, an extra or missing key, or a broken invariant throws, so `next build` reds rather
// than render an unchecked capture. The file is written by the source repository's sync tool from the served files,
// which also re-checks, before an upload, that the capture is still a byte-faithful prefix of what is served.
// Self-contained (node built-ins only, no alias import): shared by the page and the root test program.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const NARABI_CAPTURE_REL = "apps/site/data/narabi-capture.json";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
export const NARABI_CAPTURE_SCHEMA = "monark-site-narabi-capture-v1";

export interface NarabiCapture {
  readonly capturedAt: string;
  readonly source: string;
  /** state.json exactly as served. */
  readonly stateJson: string;
  /** timeline.jsonl as served, each line's endpoint URL list replaced by its count. */
  readonly timelineJsonl: string;
  readonly stateSha256: string;
  /** sha256 of timelineJsonl as stored. */
  readonly timelineSha256: string;
  /** The timeline exactly as served at capture: its sha256 and its length in characters. */
  readonly served: { readonly timelineSha256: string; readonly timelineChars: number };
  /** The capture this one replaced: the timeline it recorded as served is a byte prefix of the one served at this one. */
  readonly previousCapture: { readonly capturedAt: string; readonly servedTimelineSha256: string; readonly servedTimelineChars: number };
}

const HEX64 = /^[0-9a-f]{64}$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

function obj(v: unknown, keys: readonly string[], where: string): Record<string, unknown> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) throw new Error(`narabi capture: ${where} must be an object`);
  const o = v as Record<string, unknown>;
  const got = Object.keys(o).sort().join(",");
  if (got !== [...keys].sort().join(",")) throw new Error(`narabi capture: ${where} must carry exactly {${keys.join(", ")}}, got {${got}}`);
  return o;
}
function match(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== "string" || !re.test(v)) throw new Error(`narabi capture: ${where} is malformed`);
  return v;
}
function text(v: unknown, where: string): string {
  if (typeof v !== "string" || v.length === 0) throw new Error(`narabi capture: ${where} must be a non-empty string`);
  return v;
}
function positive(v: unknown, where: string): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) throw new Error(`narabi capture: ${where} must be a positive integer`);
  return v;
}

export function loadNarabiCapture(rootDir: string): NarabiCapture {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") throw new Error("narabi capture: site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[NARABI_CAPTURE_REL];
  if (typeof expected !== "string") throw new Error(`narabi capture: ${NARABI_CAPTURE_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, NARABI_CAPTURE_REL), "utf8");
  const actual = sha256(raw.replace(/\r\n/g, "\n"));
  if (actual !== expected) throw new Error(`narabi capture: sha256 mismatch for ${NARABI_CAPTURE_REL} (manifest ${expected}, actual ${actual})`);

  const d = obj(
    JSON.parse(raw),
    ["$comment", "schema", "source", "captured_at", "state_json", "state_sha256", "timeline_jsonl", "timeline_sha256", "served", "previous_capture"],
    "file",
  );
  if (d.schema !== NARABI_CAPTURE_SCHEMA) throw new Error(`narabi capture: schema is not ${NARABI_CAPTURE_SCHEMA}`);
  const stateJson = text(d.state_json, "state_json");
  const timelineJsonl = text(d.timeline_jsonl, "timeline_jsonl");
  const stateSha256 = match(d.state_sha256, HEX64, "state_sha256");
  const timelineSha256 = match(d.timeline_sha256, HEX64, "timeline_sha256");
  if (sha256(stateJson) !== stateSha256) throw new Error("narabi capture: state_json does not hash to state_sha256");
  if (sha256(timelineJsonl) !== timelineSha256) throw new Error("narabi capture: timeline_jsonl does not hash to timeline_sha256");
  // The storefront keeps the endpoint COUNT only: a URL, or a line that still carries its endpoint list, is refused.
  if (timelineJsonl.includes("://") || /"endpoints"\s*:/.test(timelineJsonl)) throw new Error("narabi capture: the stored timeline must carry no URL and no endpoint list");
  const s = obj(d.served, ["timeline_sha256", "timeline_chars"], "served");
  const p = obj(d.previous_capture, ["captured_at", "served_timeline_sha256", "served_timeline_chars"], "previous_capture");
  const capture: NarabiCapture = {
    capturedAt: match(d.captured_at, ISO_DAY, "captured_at"),
    source: text(d.source, "source"),
    stateJson,
    timelineJsonl,
    stateSha256,
    timelineSha256,
    served: { timelineSha256: match(s.timeline_sha256, HEX64, "served.timeline_sha256"), timelineChars: positive(s.timeline_chars, "served.timeline_chars") },
    previousCapture: {
      capturedAt: match(p.captured_at, ISO_DAY, "previous_capture.captured_at"),
      servedTimelineSha256: match(p.served_timeline_sha256, HEX64, "previous_capture.served_timeline_sha256"),
      servedTimelineChars: positive(p.served_timeline_chars, "previous_capture.served_timeline_chars"),
    },
  };
  if (!(capture.previousCapture.capturedAt < capture.capturedAt)) throw new Error("narabi capture: the previous capture must be older");
  if (!(capture.previousCapture.servedTimelineChars < capture.served.timelineChars)) {
    throw new Error("narabi capture: the previous served timeline must be a strictly shorter prefix (append-only)");
  }
  return capture;
}
