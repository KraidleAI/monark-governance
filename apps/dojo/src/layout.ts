// MONARK Dojo -- PR-2-2: the local handoff layout of one day (ADR-DOJO-PR-2 D-7, dated line C-V-1, DOJO-HANDOFF-LAYOUT-1), its
// writer (the order of --close-day: missed readings, rights of readings/, readings/SHA256SUMS, publish/day.json, publish/SHA256SUMS,
// each through a synced temporary file then a rename) and its reader, imported as is by the publisher PR-3a-1 (one reader of one
// form, FM-1.1): publish/SHA256SUMS is its single entry point; it reads exactly the files it enumerates, checks each sha256, refuses
// a stray file under publish/ or readings/, then readDayBundle(day.json, {records, eve}) (DOJO-BUNDLE-CHECK-REQUIRED-1). Never
// evidence/, readings/SHA256SUMS or plan.json. Refusals are the collector's (outside the verifier's 45 codes).
import { createHash } from "node:crypto";
import { chmodSync, closeSync, existsSync, fsyncSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, writeSync } from "node:fs";
import { join } from "node:path";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { readDayBundle, readRecord, type DayBundle, type ReadingRecord } from "./bundle.ts";
import { byteOrder, type Eve } from "./reading.ts";

export const DOJO_LAYOUT_REFUSALS = Object.freeze(["layout_malformed", "layout_sha_mismatch", "layout_stray_file", "eve_malformed"] as const);
type Code = (typeof DOJO_LAYOUT_REFUSALS)[number];
export class DojoLayoutError extends Error {
  readonly code: Code;
  readonly detail: string;
  constructor(code: Code, detail: string) { super(`dojo/layout: ${code}: ${detail}`); this.code = code; this.detail = detail; }
}
const fail = (code: Code, detail: string): never => { throw new DojoLayoutError(code, detail); };
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const sorted = (l: readonly string[]): boolean => l.every((x, j) => j === 0 || byteOrder(l[j - 1] as string, x) < 0);

/** A directory with an explicit mode (evidence/ and readings/ of an open day 0700; the day, publish/ and a closed readings/ 0750). */
export function ensureDir(path: string, mode: number): void { mkdirSync(path, { recursive: true, mode }); }
/** Synced temporary file, then rename (ADR D-7 dated line C-V-1). */
export function writeAtomic(path: string, text: string): void {
  const tmp = `${path}.tmp`, fd = openSync(tmp, "w", 0o640);
  try { writeSync(fd, text); fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(tmp, path);
}
/** One line per file, `<sha256>  <path>` + LF, paths relative to bundles/<d>/ in byte order (ADR D-7 dated line C-V-1, "Format"). */
const sums = (dir: string, paths: readonly string[]): string =>
  [...paths].sort(byteOrder).map((p) => `${sha(readFileSync(join(dir, ...p.split("/"))))}  ${p}\n`).join("");
const readingPaths = (k: number): string[] => Array.from({ length: k }, (_, j) => `readings/${String(j + 1)}.json`);

/** The writer of --close-day, in its order (ADR D-7 dated line C-V-1): the missed readings, readings/ to 0750 (after the end of the
 *  reading day, before readings/SHA256SUMS: TB-12 of PR-3, M-Q5), readings/SHA256SUMS (K + 1 lines), publish/day.json, then
 *  publish/SHA256SUMS (K + 2 lines), whose existence marks the day closed. K = 0 for a day without beacon. */
export function closeLayout(dir: string, missed: readonly (readonly [number, string])[], k: number, dayBytes: string): void {
  ensureDir(join(dir, "readings"), 0o700);
  for (const [i, text] of missed) writeAtomic(join(dir, "readings", `${String(i)}.json`), text);
  chmodSync(join(dir, "readings"), 0o750);
  writeAtomic(join(dir, "readings", "SHA256SUMS"), sums(dir, ["eve.json", ...readingPaths(k)]));
  ensureDir(join(dir, "publish"), 0o750);
  writeAtomic(join(dir, "publish", "day.json"), dayBytes);
  writeAtomic(join(dir, "publish", "SHA256SUMS"), sums(dir, ["eve.json", "publish/day.json", ...readingPaths(k)]));
}

/** The Eve entry (ADR D-7, Q-2 dated line): closed keys {addresses, accounts}, addresses strictly sorted, accounts [account, owner]
 *  strictly sorted by account then owner, canonical bytes + LF (its sha256 is eve_sha256 of the bundle). */
export function readEve(text: string): Eve {
  let e: unknown = null;
  try { e = JSON.parse(text); } catch { fail("eve_malformed", "json"); }
  const o = e as { addresses?: unknown; accounts?: unknown } | null;
  const ok = o !== null && typeof o === "object" && !Array.isArray(o) && Object.keys(o).length === 2 && Array.isArray(o.addresses) && Array.isArray(o.accounts)
    && o.addresses.every((a) => typeof a === "string") && sorted(o.addresses)
    && o.accounts.every((p) => Array.isArray(p) && p.length === 2 && p.every((s) => typeof s === "string" && s !== "" && !s.includes(" ")))
    && sorted((o.accounts as string[][]).map((p) => p.join(" ")));
  if (!ok || `${canonical(o)}\n` !== text) fail("eve_malformed", "form");
  return o as Eve;
}

/** The Eve of day d + 1 from the closed day d: the addresses of its bundle and the union of the (account, owner) of the accepted
 *  enumerations of its records (Q-2 dated line); a day without addresses (abstained) carries its own Eve over (ADR dated line 08:28Z,
 *  point (3): the last Eve written). */
export function nextEve(bundle: DayBundle, records: readonly ReadingRecord[], eve: Eve): Eve {
  if (bundle.addresses === null) return eve;
  const pairs = new Map<string, readonly [string, string]>();
  for (const r of records) for (const e of r.enumerations) for (const [a, o] of e.accounts) pairs.set(`${a} ${o}`, [a, o]);
  return { addresses: bundle.addresses.map((x) => x.address), accounts: [...pairs.keys()].sort(byteOrder).map((key) => pairs.get(key) as readonly [string, string]) };
}

/** The reader of a closed day (the publisher's entry point, ADR D-7 dated line C-V-1). */
export function readDayLayout(dir: string): { bundle: DayBundle; records: ReadingRecord[]; eve: Eve } {
  const file = (p: string): string | null => { const f = join(dir, ...p.split("/")); return existsSync(f) ? readFileSync(f, "utf8") : null; };
  const text = file("publish/SHA256SUMS") ?? fail("layout_malformed", "publish/SHA256SUMS");
  const lines = text.endsWith("\n") ? text.slice(0, -1).split("\n") : fail("layout_malformed", "publish/SHA256SUMS");
  const rows = lines.map((l) => /^([0-9a-f]{64}) {2}([a-z0-9/.]+)$/.exec(l) ?? fail("layout_malformed", "publish/SHA256SUMS line"));
  const paths = rows.map((m) => m[2] as string), k = paths.length - 2;
  const want = ["eve.json", "publish/day.json", ...readingPaths(k)].sort(byteOrder);
  if (k < 0 || !sorted(paths) || canonical(paths) !== canonical(want)) fail("layout_malformed", "publish/SHA256SUMS paths");
  const bodies = new Map(rows.map((m) => {
    const p = m[2] as string, body = file(p) ?? fail("layout_malformed", p);
    if (sha(body) !== m[1]) fail("layout_sha_mismatch", p);
    return [p, body] as const;
  }));
  const subs: [string, readonly string[]][] = [["publish", ["SHA256SUMS", "day.json"]], ["readings", ["SHA256SUMS", ...readingPaths(k).map((p) => p.slice(9))]]];
  for (const [sub, allowed] of subs) {
    for (const n of existsSync(join(dir, sub)) ? readdirSync(join(dir, sub)) : []) if (!allowed.includes(n)) fail("layout_stray_file", `${sub}/${n}`);
  }
  const eve = readEve(bodies.get("eve.json") as string), recs = readingPaths(k).map((p) => bodies.get(p) as string);
  const bundle = readDayBundle(bodies.get("publish/day.json") as string, { records: recs, eve });
  if (k !== (bundle.beacon === null ? 0 : bundle.k_reads)) fail("layout_malformed", "count of readings");
  return { bundle, records: recs.map(readRecord), eve };
}
