// apps/site/lib/narabi-served-load.ts — build-time loader of the committed facts /narabi states that the two published
// Narabi files do not carry (server side): the task class and key of the gate's one committed Narabi
// class (read from the served gate description), the sentinel's daily publication slots and random delay, and the
// external probe's freshness deadline and shots. Reads apps/site/data/narabi-served.json ONLY after its sha256 (CRLF->LF,
// UTF-8) equals the value apps/site/data/manifest.sha256.json carries for it (same tamper check as
// lib/bell-served-load.ts and lib/load-committed.ts), then checks a CLOSED shape: every level carries exactly its keys,
// every slot is an HH:MM UTC time listed in increasing order, the delay is a positive whole number of seconds, the probe's
// first shot is its deadline, and the served document's sha256 is 64 lowercase hex. FAIL-CLOSED: an unlisted file, a
// hash mismatch, an extra or missing key, or a malformed value throws, so `next build` reds rather than render an
// unchecked value. The file is written by the source repository's sync tool from the served document and the units; the
// page renders its values by property access, never as typed literals (pinned by test/narabi-live.test.ts, which also
// binds each value to its producer). Self-contained (node built-ins only, no alias import): shared by the page and the
// root test program.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const NARABI_SERVED_REL = "apps/site/data/narabi-served.json";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
export const NARABI_SERVED_SCHEMA = "monark-site-narabi-served-v1";

/** What the board needs: the gate's class and key, the publication schedule and the probe's deadline. */
export interface NarabiServed {
  readonly gate: { readonly task_class: string; readonly predictor_id: string };
  readonly sentinel_timer: { readonly on_calendar_utc: readonly string[]; readonly randomized_delay_s: number };
  readonly probe: { readonly deadline_utc: string; readonly shots_utc: readonly string[] };
}

/** The whole record as committed (provenance included). */
export interface NarabiServedData extends NarabiServed {
  readonly read_at: string;
  readonly gate: { readonly task_class: string; readonly predictor_id: string; readonly openapi_sha256: string };
}

const HEX64 = /^[0-9a-f]{64}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const HHMM = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const CLASS_ID = /^[a-z0-9][a-z0-9-]*$/;
const KEY_ID = /^[a-z0-9][a-z0-9:@/._-]*$/i;

function obj(v: unknown, keys: readonly string[], where: string): Record<string, unknown> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) throw new Error(`narabi served: ${where} must be an object`);
  const o = v as Record<string, unknown>;
  const got = Object.keys(o).sort().join(",");
  if (got !== [...keys].sort().join(",")) throw new Error(`narabi served: ${where} must carry exactly {${keys.join(", ")}}, got {${got}}`);
  return o;
}
function match(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== "string" || !re.test(v)) throw new Error(`narabi served: ${where} is malformed`);
  return v;
}
/** A non-empty list of HH:MM UTC times in strictly increasing order. */
function slots(v: unknown, where: string): string[] {
  if (!Array.isArray(v) || v.length === 0) throw new Error(`narabi served: ${where} must be a non-empty list`);
  const out = v.map((x, i) => match(x, HHMM, `${where}[${String(i)}]`));
  for (let i = 1; i < out.length; i++) {
    if ((out[i] ?? "") <= (out[i - 1] ?? "")) throw new Error(`narabi served: ${where} must be in increasing order`);
  }
  return out;
}

export function loadNarabiServed(rootDir: string): NarabiServedData {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") throw new Error("narabi served: site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[NARABI_SERVED_REL];
  if (typeof expected !== "string") throw new Error(`narabi served: ${NARABI_SERVED_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, NARABI_SERVED_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) throw new Error(`narabi served: sha256 mismatch for ${NARABI_SERVED_REL} (manifest ${expected}, actual ${actual})`);

  const d = obj(JSON.parse(raw), ["$comment", "schema", "read_at", "gate", "sentinel_timer", "probe"], "file");
  if (d.schema !== NARABI_SERVED_SCHEMA) throw new Error(`narabi served: schema is not ${NARABI_SERVED_SCHEMA}`);
  // The record names the class and key as the served description does (class_id, key); the page reads them as the
  // gate's task class and predictor key.
  const g = obj(d.gate, ["class_id", "key", "openapi_sha256"], "gate");
  const t = obj(d.sentinel_timer, ["on_calendar_utc", "randomized_delay_s"], "sentinel_timer");
  const p = obj(d.probe, ["deadline_utc", "shots_utc"], "probe");
  const delay = t.randomized_delay_s;
  if (typeof delay !== "number" || !Number.isInteger(delay) || delay <= 0) throw new Error("narabi served: sentinel_timer.randomized_delay_s must be a positive integer");
  const deadline = match(p.deadline_utc, HHMM, "probe.deadline_utc");
  const shots = slots(p.shots_utc, "probe.shots_utc");
  if (shots[0] !== deadline) throw new Error("narabi served: the probe's first shot must be its deadline");
  return {
    read_at: match(d.read_at, ISO_UTC, "read_at"),
    gate: {
      task_class: match(g.class_id, CLASS_ID, "gate.class_id"),
      predictor_id: match(g.key, KEY_ID, "gate.key"),
      openapi_sha256: match(g.openapi_sha256, HEX64, "gate.openapi_sha256"),
    },
    sentinel_timer: { on_calendar_utc: slots(t.on_calendar_utc, "sentinel_timer.on_calendar_utc"), randomized_delay_s: delay },
    probe: { deadline_utc: deadline, shots_utc: shots },
  };
}
