// MONARK Bell -- T-1b reader-side check (ADR-T1b-backend v2 D6, D9, D11 control 5; checkpoint-1 C-9). Library + CLI. From the
// SERVED files alone it re-derives what a Bell publication claims: the chain and every signature of timeline.jsonl, the key
// schedule (rotations, revocations, losses), the binding of state.json and provenance.json to the head publication line, every
// immutable, and every run's bell_sha. TRUST ROOT = the keyring SUPPLIED with --keyring (the committed
// apps/bell/keys/bell-keyring.json, C-9); the served /bell/pubkey.json is only a cross-checked channel: a served key absent from
// the supplied keyring is refused. Without --keyring the result is "self_consistent_only", never an unqualified success.
// A signature attests ORIGIN (who published these bytes), never that a fact is true.
// Sources: a directory (--dir) or a base URL (--url): https anywhere, http only on a loopback literal, no redirect followed,
// every body and line bounded. Node built-ins (global fetch) + bell-chain.mjs only.
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { canonical, sha256Hex, trustOf, walkTimeline } from "./bell-chain.mjs";

/** The CLOSED list of refusal codes (the walk's reasons included). The detail names a file, a line or a run, never a value. */
export const VERIFY_REFUSALS = Object.freeze(["insecure_url", "redirect_refused", "http_status", "unreachable", "too_large", "not_json",
  "keyring_invalid", "served_key_not_in_keyring", "timeline_malformed", "chain_broken", "rotation_key_not_in_keyring", "key_not_in_keyring",
  "signature_invalid", "key_not_active", "rotation_malformed", "revocation_malformed", "no_publication", "head_signed_by_revoked_key",
  "state_not_bound_by_head", "immutable_mismatch", "envelope_mismatch", "bell_sha_mismatch"]);
export class BellVerifyError extends Error {
  constructor(code, detail) { super(`bell/verify: ${code}: ${detail}`); this.name = "BellVerifyError"; this.code = code; this.detail = detail; }
}
const refuse = (code, detail) => { throw new BellVerifyError(code, detail); };

// Bounds (value + motive, C-7 form): MAX_BODY_BYTES 64 MiB = the publisher's MAX_PUBLIC_STATE_BYTES (the served state is built
// under that budget; the timeline and the immutables are held to it too until an amendment); MAX_LINE_BYTES 1 MiB = the
// publisher's MAX_LINE_BYTES; TIMEOUT_MS 30 s per GET = the collector transport's per-attempt default (rpc-guard DEFAULT_TIMEOUT_MS).
export const VERIFY_BOUNDS = Object.freeze({ MAX_BODY_BYTES: 64 * 1024 * 1024, MAX_LINE_BYTES: 1024 * 1024, TIMEOUT_MS: 30_000 });

/** Transport policy, read on the RAW string before any URL normalization: https (no userinfo) anywhere; http ONLY on the
 *  loopback literals 127.0.0.1 or [::1] (so 127.1, 0x7f.0.0.1, localhost, 127.0.0.1.example are refused). */
export const urlAllowed = (u) => /^https:\/\/[^/?#@\s\\]+(?:[/?#]|$)/i.test(u) || /^http:\/\/(?:127\.0\.0\.1|\[::1\])(?::\d{1,5})?(?:\/|$)/.test(u);

/** A directory holding the served layout (a mirror, or the publisher's public/). */
export function dirSource(root, bounds = VERIFY_BOUNDS) {
  return {
    get: (rel) => {
      const p = join(root, ...rel.split("/"));
      let size = -1;
      try { const st = statSync(p); if (st.isFile()) size = st.size; } catch { size = -1; }
      if (size < 0) refuse("unreachable", rel);
      if (size > bounds.MAX_BODY_BYTES) refuse("too_large", rel);
      return Promise.resolve(readFileSync(p));
    },
  };
}
/** A served base URL: one GET per file, redirect "manual" and any 3xx REFUSED (never followed), 200 only, body bounded. */
export function urlSource(base, bounds = VERIFY_BOUNDS) {
  if (!urlAllowed(base)) refuse("insecure_url", "https anywhere, http on 127.0.0.1 or [::1] only");
  const root = base.replace(/\/+$/, "");
  return {
    get: async (rel) => {
      const ctl = new AbortController(), timer = setTimeout(() => { ctl.abort(); }, bounds.TIMEOUT_MS);
      try {
        const res = await fetch(`${root}/${rel}`, { redirect: "manual", signal: ctl.signal });
        if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) refuse("redirect_refused", rel);
        if (res.status !== 200 || res.body === null) refuse("http_status", `${rel}: ${String(res.status)}`);
        const chunks = [];
        let n = 0;
        for await (const c of res.body) { n += c.length; if (n > bounds.MAX_BODY_BYTES) refuse("too_large", rel); chunks.push(c); }
        return Buffer.concat(chunks);
      } catch (e) {
        if (e instanceof BellVerifyError) throw e;
        return refuse("unreachable", rel);
      } finally { clearTimeout(timer); }
    },
  };
}

const HEX64 = /^[0-9a-f]{64}$/;
const parse = (buf, what, code = "not_json") => { try { return JSON.parse(buf.toString("utf8")); } catch { return refuse(code, what); } };
/** An immutable state + provenance pair against its publication line: envelopes, runs, and each run's bell_sha recomputed. */
function checkPublication(line, state, prov) {
  const at = `line ${String(line.seq)}`;
  const ok = (e, schema) => e !== null && typeof e === "object" && e.schema === schema && e.seq === line.seq && e.published_at === line.published_at
    && Array.isArray(e.runs) && e.runs.length === line.runs.length;
  if (!ok(state, "bell-public-state-v1") || !ok(prov, "bell-public-provenance-v1")) refuse("envelope_mismatch", at);
  state.runs.forEach((r, i) => {
    if (r?.bell_sha !== line.runs[i]?.bell_sha || prov.runs[i]?.bellSha !== r.bell_sha || canonical(r.window) !== canonical(line.runs[i].window)) refuse("envelope_mismatch", `${at} runs[${String(i)}]`);
    if (sha256Hex(canonical(r.digest)) !== r.bell_sha) refuse("bell_sha_mismatch", `${at} runs[${String(i)}]`); // every run, every line
  });
}

/** The complete check (ADR D11 control 5). `keyring` = the SUPPLIED keyring (parsed JSON), the trust root; null => the served
 *  keyring stands in and the status is "self_consistent_only". Resolves to a report or rejects with a BellVerifyError. */
export async function verifyServed({ source, keyring = null, bounds = VERIFY_BOUNDS }) {
  const text = (await source.get("timeline.jsonl")).toString("utf8");
  if (text !== "" && !text.endsWith("\n")) refuse("timeline_malformed", "timeline.jsonl: no final newline");
  const lines = text === "" ? [] : text.slice(0, -1).split("\n").map((s, i) => {
    if (Buffer.byteLength(s) + 1 > bounds.MAX_LINE_BYTES) refuse("too_large", `timeline line ${String(i + 1)}`);
    return parse(Buffer.from(s), `timeline line ${String(i + 1)}`, "timeline_malformed");
  });
  const served = trustOf(parse(await source.get("bell/pubkey.json"), "bell/pubkey.json"));
  if (served === null) refuse("keyring_invalid", "bell/pubkey.json");
  let trust = served;
  if (keyring !== null) { // C-9: the supplied keyring is the root; the served one must not name a key outside it
    trust = trustOf(keyring);
    if (trust === null) refuse("keyring_invalid", "the supplied keyring");
    for (const [id, k] of served) if (trust.get(id)?.x !== k.x) refuse("served_key_not_in_keyring", id);
  }
  const w = walkTimeline(lines, trust);
  if (!w.ok) refuse(w.reason, `line ${String(w.seq)}`);
  if (w.head === null) refuse("no_publication", "timeline.jsonl");
  if (w.voided.includes(w.head.seq)) refuse("head_signed_by_revoked_key", `line ${String(w.head.seq)}`);
  const pubs = lines.filter((l) => l.kind === "publication");
  for (const l of pubs) if (!HEX64.test(l.state_sha256) || !HEX64.test(l.provenance_sha256) || !Array.isArray(l.runs)) refuse("timeline_malformed", `line ${String(l.seq)}`);
  const cur = await source.get("state.json"), curProv = await source.get("provenance.json");
  if (sha256Hex(cur) !== w.head.state_sha256 || sha256Hex(curProv) !== w.head.provenance_sha256) refuse("state_not_bound_by_head", `line ${String(w.head.seq)}`);
  for (const l of pubs) {
    const s = await source.get(`states/${l.state_sha256}.json`), p = await source.get(`provenance/${l.provenance_sha256}.json`);
    if (sha256Hex(s) !== l.state_sha256 || sha256Hex(p) !== l.provenance_sha256) refuse("immutable_mismatch", `line ${String(l.seq)}`);
    checkPublication(l, parse(s, `states/${l.state_sha256}.json`), parse(p, `provenance/${l.provenance_sha256}.json`));
  }
  return { status: keyring === null ? "self_consistent_only" : "consistent_with_supplied_keyring", trust_root: keyring === null ? "served_keyring" : "supplied_keyring",
    lines: lines.length, head_seq: w.head.seq, publications: pubs.length, active_key_id: w.active, voided_lines: w.voided, breaks: w.breaks,
    scope: "a signature attests origin, never truth" };
}

/** CLI: node bell-verify.mjs (--url <base> | --dir <dir>) [--keyring <file>]. Exit 0 with one JSON report line on stdout, or
 *  exit 1 with `bell/verify: <code>: <detail>` on stderr. */
export async function runVerifyCli(argv) {
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const url = arg("--url"), dir = arg("--dir"), kr = arg("--keyring");
  const dangling = ["--url", "--dir", "--keyring"].some((k) => argv.includes(k) && (argv[argv.indexOf(k) + 1] ?? "--").startsWith("--")); // C-8: never a silent root-less run
  if (dangling || (url === undefined) === (dir === undefined)) { process.stderr.write("bell/verify: usage: node bell-verify.mjs (--url <base> | --dir <dir>) [--keyring <file>]\n"); return 1; }
  try {
    const keyring = kr === undefined ? null : parse(readFileSync(kr), "--keyring", "keyring_invalid");
    const report = await verifyServed({ source: url !== undefined ? urlSource(url) : dirSource(dir), keyring });
    process.stdout.write(JSON.stringify(report) + "\n");
    return 0;
  } catch (e) {
    process.stderr.write(`bell/verify: ${e instanceof BellVerifyError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await runVerifyCli(process.argv.slice(2));
