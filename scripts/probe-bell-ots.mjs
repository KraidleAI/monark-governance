// scripts/probe-bell-ots.mjs -- the OpenTimestamps client of the Bell probe, Node built-ins only, no dependency (G0 BELL-COLLECT-TIMER-1
// section 13 L-5; PLAN-P4 C4-8, lot 4b; FAITS LSP-12 bis of 2026-10-16). Imported by scripts/probe-bell.mjs, which runs otsRun once a run
// after its kept copy is written; it has no command line. FORMAT, read on the local copy of the reference client (opentimestamps 0.4.5,
// opentimestamps-client 0.7.2): a detached proof is the magic header, the varuint major version 1, the file hash op sha256 (0x08) and the
// manifest's digest, then the timestamp tree (core/timestamp.py serialize: at each node its attestations, sorted, then its operations, sorted,
// every item but the last after a fork byte 0xff); an operation is its tag and, for append 0xf0 and prepend 0xf1, a varbytes argument (op.py);
// an attestation is 0x00, an 8-byte tag and a varbytes payload (notary.py: a pending one carries its calendar URI as varbytes, a Bitcoin one
// its block height as varuint). A STAMP (otsclient/cmds.py l.176-177): the manifest's digest, append a 16-byte nonce, sha256, the result posted
// to the four aggregators (POST <aggregator>/digest), at least OTS_M answers merged under that node (calendar.py submit: a timestamp rooted at
// the posted digest, at most 10 000 bytes). An UPGRADE (cmds.py l.277-299): each pending attestation whose URI the whitelist admits is asked
// GET <uri>/timestamp/<hex of its node's message>; 200 merges the answer under that node, 404 is "still pending", never an error. A proof is
// complete once it records a Bitcoin block (cmds.py is_timestamp_complete); a complete proof is not asked again. Only append, prepend and
// sha256 are computed (the server imports no other, FAITS point 7): any other operation tag in an answer, or a graft reaching MAX_DEPTH, is
// ots_op_unsupported, the answer dropped and the proof on disk kept as written. STATE, under <state>/bell/ots/: timeline-seq<n>-manifest.txt and
// its .ots (the names of docs/bell-publications/, PUBLICATION_PROOF of apps/site/lib/bell-anchors.ts), each written by the probe's atomic write,
// then the run's rows of registry.jsonl, rewritten as its prior bytes plus the new rows (append only): "stamped" and "upgraded" name a proof,
// "tried" the first run that asked the calendars for a line and got no proof. A proof found without its row (a cut between the two) is adopted,
// never stamped again: one automatic proof per line. ots_unstamped: a line still without proof OTS_UNSTAMPED_ALERT_H after its "tried" row (C4-8,
// dated line of 2026-10-16 19:1x UTC: from the first missed try, on the probe's own clock, never from the served published_at); a line the run's
// bound leaves for the next run is not tried. ots_pending_stale: a proof still pending OTS_PENDING_STALE_H after its "stamped" row. Bounds of
// one run: at most OTS_MAX_STAMPS lines stamped (four parallel calls under one OTS_TIMEOUT_MS timer each) and OTS_MAX_UPGRADES upgrade calls
// of OTS_TIMEOUT_MS each (the reference client's --timeout, 5 s), shared by the pending proofs: the run resumes after the last seq the run
// before asked (`after`, bell.json's ots.upgrade_after_seq), round the list, and a proof once complete is asked no more, in the same run too.
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { urlTransportAllowed } from "./probe-narabi.mjs";

/** The four aggregators of the reference client (otsclient/cmds.py l.186-189, calendar.py DEFAULT_AGGREGATORS; FAITS point 1). */
export const OTS_AGGREGATORS = Object.freeze(["https://a.pool.opentimestamps.org", "https://b.pool.opentimestamps.org", "https://a.pool.eternitywall.com",
  "https://ots.btc.catallaxy.com"]);
/** Answers needed for a proof (otsclient/args.py l.180: -m 2). */
export const OTS_M = 2;
/** The upgrade whitelist (calendar.py DEFAULT_CALENDAR_WHITELIST, https://*.<suffix>, an empty path): here a host of letters, digits, dots
 *  and dashes that ends with one of these, no port, no user, no path, no query (stricter than fnmatch on the netloc). */
export const OTS_WHITELIST_SUFFIXES = Object.freeze([".calendar.opentimestamps.org", ".calendar.eternitywall.com", ".calendar.catallaxy.com"]);
export const OTS_TIMEOUT_MS = 5_000;
export const OTS_MAX_RESPONSE_BYTES = 10_000;
export const OTS_MAX_STAMPS = 4;
export const OTS_MAX_UPGRADES = 8;
export const OTS_UNSTAMPED_ALERT_H = 24;
/** Proposed (C4-8, dated line of 2026-10-16 19:1x UTC): the code defaults of the calendar server (FAITS LSP-12 bis point 10: at least 6 h
 *  between two transactions, a first transaction aimed at 1 008 blocks, 6 confirmations before a proof is kept), at the ten-minute block
 *  spacing (nPowTargetSpacing = 10 * 60, FAITS BELL-OTS-SPACING-READ-1 of 2026-10-21) 6 + 168 + 1 = 175 h, rounded up to the next whole
 *  day; point 11 (0.73 h between transactions, a value of the day) is far below it. */
export const OTS_PENDING_STALE_H = 192;

const MAGIC = Buffer.from("004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e89294", "hex");
const APPEND = 0xf0, PREPEND = 0xf1, SHA256 = 0x08, FORK = 0xff, ATT = 0x00, MAX_MSG = 4096, MAX_PAYLOAD = 8192, MAX_DEPTH = 256, TIP_DEPTH = 2;
const PENDING = "83dfe30d2ef90c8e", BITCOIN = "0588960d73d71901", LITECOIN = "06869a0d73d71b45";
const sha256 = (b) => createHash("sha256").update(b).digest();
/** An answer carries an operation this client does not compute (ots_op_unsupported). */
export class OtsOpUnsupported extends Error {}
/** A tree reaches a node at depth MAX_DEPTH, which readProof refuses: an answer refused at its graft (ots_op_unsupported, treeOf). */
class OtsTooDeep extends Error {}

const varuint = (v) => { const out = []; for (let n = v; ; n = Math.floor(n / 128)) { out.push(n >= 128 ? (n % 128) | 0x80 : n); if (n < 128) return Buffer.from(out); } };
const varbytes = (b) => Buffer.concat([varuint(b.length), b]);
/** A cursor over `buf` (serialize.py: LEB128 varuint, varbytes = varuint length then bytes). */
function cursor(buf) {
  let i = 0;
  const take = (n) => { if (i + n > buf.length) throw new Error("ots: truncated"); i += n; return buf.subarray(i - n, i); };
  const byte = () => take(1)[0];
  const uint = () => { let v = 0; for (let k = 0, s = 1; k < 9; k++, s *= 128) { const b = byte(); v += (b & 0x7f) * s; if ((b & 0x80) === 0) return v; } throw new Error("ots: varuint too long"); };
  const bytes = (max, min = 0) => { const n = uint(); if (n > max || n < min) throw new Error("ots: varbytes out of bounds"); return Buffer.from(take(n)); };
  return { take, byte, uint, bytes, end: () => i === buf.length };
}
/** append, prepend, sha256 on `msg` (op.py: message and result at most 4 096 bytes). */
function apply(tag, arg, msg) {
  const r = tag === APPEND ? Buffer.concat([msg, arg]) : tag === PREPEND ? Buffer.concat([arg, msg]) : sha256(msg);
  if (msg.length > MAX_MSG || r.length > MAX_MSG) throw new Error("ots: message too long");
  return r;
}
/** An attestation: its tag, its payload, and the key it sorts by (notary.py __lt__: the tag, then the URI, the height or the payload). A
 *  pending or block payload is written again from its URI or height (notary.py _serialize_payload: varbytes, varuint), so that equality and
 *  rewriting go by the value, as the reference's do (l.260-264, l.292-293); check_uri admits an empty URI (l.176-186). */
function attestationOf(tag, payload) {
  const c = cursor(payload), a = { tag, payload, uri: null, height: null };
  if (tag === PENDING) a.uri = c.bytes(1000).toString("utf8");
  else if (tag === BITCOIN || tag === LITECOIN) a.height = c.uint();
  if ((a.uri !== null || a.height !== null) && !c.end()) throw new Error("ots: trailing bytes in an attestation");
  if (a.uri !== null && !/^[A-Za-z0-9._/:-]*$/.test(a.uri)) throw new Error("ots: a pending URI off its characters");
  if (a.uri !== null) a.payload = varbytes(Buffer.from(a.uri));
  else if (a.height !== null) a.payload = varuint(a.height);
  return a;
}
const attCmp = (a, b) => (a.tag !== b.tag ? (a.tag < b.tag ? -1 : 1) : a.height !== null ? a.height - b.height : Buffer.compare(a.uri === null ? a.payload : Buffer.from(a.uri), b.uri === null ? b.payload : Buffer.from(b.uri)));
const opCmp = (a, b) => a.tag - b.tag || Buffer.compare(a.arg ?? Buffer.alloc(0), b.arg ?? Buffer.alloc(0));
/** `b` merged into `a`, both at the same message (timestamp.py merge): attestations by equality, operations by tag and argument, recursively. */
export function mergeTree(a, b) {
  for (const x of b.atts) if (!a.atts.some((y) => y.tag === x.tag && y.payload.equals(x.payload))) a.atts.push(x);
  for (const o of b.ops) {
    const same = a.ops.find((p) => p.tag === o.tag && Buffer.compare(p.arg ?? Buffer.alloc(0), o.arg ?? Buffer.alloc(0)) === 0);
    if (same === undefined) a.ops.push(o);
    else mergeTree(same.node, o.node);
  }
  return a;
}
/** The timestamp tree at `msg` read from cursor `c` (timestamp.py deserialize, its _recursion_limit of 256 at the root, minus one a level,
 *  refused at 0: a node at depth 256 is refused): {msg, atts, ops: [{tag, arg, node}]}. */
function readTree(c, msg, depth = 0) {
  if (depth >= MAX_DEPTH) throw new OtsTooDeep("ots: recursion limit");
  const node = { msg, atts: [], ops: [] };
  const item = (tag) => {
    if (tag === ATT) { const t = Buffer.from(c.take(8)).toString("hex"); mergeTree(node, { atts: [attestationOf(t, c.bytes(MAX_PAYLOAD))], ops: [] }); return; }
    if (tag !== APPEND && tag !== PREPEND && tag !== SHA256) throw new OtsOpUnsupported(`ots: operation tag 0x${tag.toString(16)}`);
    const arg = tag === SHA256 ? null : c.bytes(MAX_MSG, 1);
    mergeTree(node, { atts: [], ops: [{ tag, arg, node: readTree(c, apply(tag, arg, msg), depth + 1) }] });
  };
  let tag = c.byte();
  for (; tag === FORK; tag = c.byte()) item(c.byte());
  item(tag);
  return node;
}
/** A calendar answer: the whole of `buf` as the tree at `msg`, grafted at a node at `depth` of its proof, each of its nodes counted at its
 *  depth once grafted: an answer that would put a node at MAX_DEPTH is refused here, never written, so a written proof always reads again. */
export function readAnswer(buf, msg, depth = 0) { const c = cursor(buf), t = readTree(c, msg, depth); if (!c.end()) throw new Error("ots: trailing bytes"); return t; }
/** The bytes of a tree (timestamp.py serialize). */
function writeTree(n) {
  const items = [...[...n.atts].sort(attCmp).map((a) => Buffer.concat([Buffer.from([ATT]), Buffer.from(a.tag, "hex"), varbytes(a.payload)])),
    ...[...n.ops].sort(opCmp).map((o) => Buffer.concat([Buffer.from([o.tag]), o.arg === null ? Buffer.alloc(0) : varbytes(o.arg), writeTree(o.node)]))];
  if (items.length === 0) throw new Error("ots: an empty timestamp");
  return Buffer.concat(items.flatMap((b, i) => (i < items.length - 1 ? [Buffer.from([FORK]), b] : [b])));
}
/** A detached proof (timestamp.py DetachedTimestampFile): its tree rooted at the file's sha256 digest. */
export function readProof(buf) {
  const c = cursor(buf);
  if (!Buffer.from(c.take(MAGIC.length)).equals(MAGIC) || c.uint() !== 1 || c.byte() !== SHA256) throw new Error("ots: not a detached sha256 proof");
  const t = readTree(c, Buffer.from(c.take(32)));
  if (!c.end()) throw new Error("ots: trailing bytes");
  return t;
}
export const writeProof = (root) => Buffer.concat([MAGIC, varuint(1), Buffer.from([SHA256]), root.msg, writeTree(root)]);
/** Every attestation of a tree, with the node that holds it and that node's depth (the root at 0, as readTree counts). */
const attestationsOf = (n, depth = 0) => [...n.atts.map((a) => ({ node: n, a, depth })), ...n.ops.flatMap((o) => attestationsOf(o.node, depth + 1))];
export const isComplete = (root) => attestationsOf(root).some((x) => x.a.tag === BITCOIN);
/** A pending URI the upgrade may ask (OTS_WHITELIST_SUFFIXES). */
export function whitelisted(uri) {
  const m = /^https:\/\/([A-Za-z0-9.-]+)$/.exec(uri);
  return m !== null && OTS_WHITELIST_SUFFIXES.some((s) => (m[1] ?? "").endsWith(s) && (m[1] ?? "").length > s.length);
}

/** The D1 manifest of line n of the kept copy `kept` (LF-terminated lines), byte for byte the one scripts/anchor-bell-timeline.mjs writes
 *  (l.60-61): `timeline.jsonl#L<n>` (line n without its LF), `timeline.jsonl#L1-L<n>` (lines 1..n with their LF) and, for a publication,
 *  `states/<h>.json` and `provenance/<h>.json` named by their own digest, sorted by byte order, each `<path> <sha256>` and a LF. */
export function manifestOf(kept, n, line) {
  let start = 0, end = -1;
  for (let k = 0; k < n; k++) { start = end + 1; end = kept.indexOf(10, start); if (end < 0) throw new Error(`ots: the kept copy has no line ${String(n)}`); }
  const hex = (b) => createHash("sha256").update(b).digest("hex"), lineHash = hex(kept.subarray(start, end)), prefix = hex(kept.subarray(0, end + 1));
  const files = line.kind === "publication" ? [["states", line.state_sha256], ["provenance", line.provenance_sha256]].map(([d, h]) => [`${d}/${h}.json`, h]) : [];
  const entries = [[`timeline.jsonl#L${String(n)}`, lineHash], [`timeline.jsonl#L1-L${String(n)}`, prefix], ...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return { text: entries.map(([p, d]) => `${p} ${d}\n`).join(""), line_hash: lineHash, prefix_sha256: prefix };
}

/** One bounded calendar call over `fetchFn`: probe-narabi's transport policy, the reference client's headers, no redirect followed, one
 *  OTS_TIMEOUT_MS timer, a body of at most OTS_MAX_RESPONSE_BYTES. POST of `digest` when given, else GET. Resolves {status, body} or null. */
function calendarCall(fetchFn) {
  return async (url, digest = null) => {
    if (!urlTransportAllowed(url).ok) return null;
    const ctl = new AbortController(), timer = setTimeout(() => { ctl.abort(); }, OTS_TIMEOUT_MS);
    try {
      const res = await fetchFn(url, { method: digest === null ? "GET" : "POST", body: digest ?? undefined, redirect: "manual", signal: ctl.signal,
        headers: { Accept: "application/vnd.opentimestamps.v1", "User-Agent": "monark-bell-probe" } });
      if (res.status !== 200 || res.body === null) { res.body?.cancel().catch(() => undefined); return { status: res.status, body: null }; }
      const chunks = [];
      let n = 0;
      for await (const c of res.body) { n += c.length; if (n > OTS_MAX_RESPONSE_BYTES) return null; chunks.push(c); }
      return { status: 200, body: Buffer.concat(chunks) };
    } catch { return null; } finally { clearTimeout(timer); }
  };
}
/** An answer of a 200 read as the tree at `msg`, grafted at a node at `depth`; null when it is none or malformed; ots_op_unsupported pushed
 *  to `alerts` when it carries an operation this client does not compute or would put a node at MAX_DEPTH once grafted (G2 of part 4,
 *  nit-7): either way an answer this client does not take, dropped, the proof on disk kept as written (PLAN-P4 C4-8). */
function treeOf(answer, msg, alerts, depth) {
  if (answer?.status !== 200 || answer.body === null) return null;
  try { return readAnswer(answer.body, msg, depth); } catch (e) { if (e instanceof OtsOpUnsupported || e instanceof OtsTooDeep) alerts.push("ots_op_unsupported"); return null; }
}

/** The OpenTimestamps step of one run over the kept copy on disk (`kept`, its lines `lines`) and the registry under `dir`; `write` is the
 *  probe's atomic write, `fetchFn` the run's transport, `after` the last seq the previous run asked an upgrade for. Resolves {alerts,
 *  summary}; a registry that does not parse throws (probe_error); a pending proof that does not read is probe_error for itself alone (G2 of
 *  part 4, nit-7): left as found and counted pending, the other proofs asked and the run's rows written. */
export async function otsRun({ dir, kept, lines, nowMs, fetchFn, write, after = 0 }) {
  const call = calendarCall(fetchFn), alerts = [], regPath = join(dir, "registry.jsonl"), at = new Date(nowMs).toISOString(), H = 3_600_000;
  const prior = existsSync(regPath) ? readFileSync(regPath) : Buffer.alloc(0), rows = prior.toString("utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l));
  const first = (n, event) => rows.find((r) => r.seq === n && r.event === event);
  const add = [], row = (n, m, proof, event) => {
    const name = `timeline-seq${String(n)}-manifest.txt`;
    add.push({ seq: n, kind: lines[n - 1].kind, line_hash: m.line_hash, prefix_sha256: m.prefix_sha256, manifest: name, manifest_sha256: proof.msg.toString("hex"),
      proof: `${name}.ots`, proof_sha256: createHash("sha256").update(writeProof(proof)).digest("hex"), event, complete: isComplete(proof), at });
  };
  let stamps = 0, unstamped = 0;
  for (let n = 1; n <= lines.length; n++) {
    if (first(n, "stamped") !== undefined) continue;
    const m = manifestOf(kept, n, lines[n - 1]), name = join(dir, `timeline-seq${String(n)}-manifest.txt`), digest = sha256(m.text);
    const there = existsSync(`${name}.ots`); // a proof is never overwritten: adopted when it timestamps this manifest, else left as found
    let proof = null;
    try { const p = there ? readProof(readFileSync(`${name}.ots`)) : null; proof = p?.msg.equals(digest) ? p : null; } catch { proof = null; }
    const tried = there || stamps < OTS_MAX_STAMPS; // a line past the run's bound waits for the next run, with no alert
    if (!there && stamps < OTS_MAX_STAMPS) {
      stamps += 1;
      write(name, m.text);
      const nonce = randomBytes(16), tipMsg = sha256(Buffer.concat([digest, nonce])), tip = { msg: tipMsg, atts: [], ops: [] }; // TIP_DEPTH: root, nonce, sha256
      const trees = (await Promise.all(OTS_AGGREGATORS.map((a) => call(`${a}/digest`, tipMsg)))).map((x) => treeOf(x, tipMsg, alerts, TIP_DEPTH)).filter((t) => t !== null);
      if (trees.length >= OTS_M) {
        for (const t of trees) mergeTree(tip, t);
        proof = { msg: digest, atts: [], ops: [{ tag: APPEND, arg: nonce, node: { msg: Buffer.concat([digest, nonce]), atts: [], ops: [{ tag: SHA256, arg: null, node: tip }] } }] };
        write(`${name}.ots`, writeProof(proof));
      }
    }
    if (proof !== null) { row(n, m, proof, "stamped"); continue; }
    unstamped += 1;
    if (!tried) continue; // a line past the run's bound waits for the next run: no row, no alert
    const t0 = first(n, "tried");
    if (t0 === undefined) add.push({ seq: n, kind: lines[n - 1].kind, event: "tried", at }); // the first missed try, the start of the 24 hours
    else if (!(nowMs - Date.parse(String(t0.at)) <= OTS_UNSTAMPED_ALERT_H * H)) alerts.push("ots_unstamped"); // closed on an unreadable date
  }
  // Upgrades: the proofs whose last proof row is not complete, stamped before this run, from the first seq after `after` round the list; a
  // proof is asked until it is complete or the run's OTS_MAX_UPGRADES calls are spent; a proof whose bytes change gets its "upgraded" row.
  let calls = 0, pending = 0, last = after;
  const proofs = [...new Map(rows.filter((r) => r.event !== "tried").map((r) => [r.seq, r])).values()].filter((r) => !r.complete).sort((a, b) => a.seq - b.seq);
  for (const r of [...proofs.filter((x) => x.seq > after), ...proofs.filter((x) => x.seq <= after)]) {
    let proof = null;
    try { proof = readProof(readFileSync(join(dir, r.proof))); } catch { proof = null; }
    if (proof === null) { alerts.push("probe_error"); pending += 1; continue; } // the probe's own state that does not read, as a registry: left as found
    const before = alerts.length, was = writeProof(proof);
    for (const { node, a, depth } of attestationsOf(proof)) {
      if (calls >= OTS_MAX_UPGRADES || isComplete(proof)) break;
      if (a.uri === null || !whitelisted(a.uri)) continue;
      calls += 1;
      last = r.seq;
      const t = treeOf(await call(`${a.uri}/timestamp/${node.msg.toString("hex")}`), node.msg, alerts, depth);
      if (t !== null) mergeTree(node, t);
    }
    if (!writeProof(proof).equals(was) && alerts.length === before) { // a 200 with nothing new writes nothing (otsclient/cmds.py l.310-318)
      write(join(dir, r.proof), writeProof(proof));
      row(r.seq, { line_hash: r.line_hash, prefix_sha256: r.prefix_sha256 }, proof, "upgraded");
    }
    if (isComplete(proof) && alerts.length === before) continue;
    pending += 1;
    if (!(nowMs - Date.parse(String(first(r.seq, "stamped")?.at)) <= OTS_PENDING_STALE_H * H)) alerts.push("ots_pending_stale");
  }
  if (add.length > 0) write(regPath, Buffer.concat([prior, Buffer.from(add.map((x) => `${JSON.stringify(x)}\n`).join(""))]));
  const latest = new Map([...rows, ...add].filter((x) => x.event !== "tried").map((x) => [x.seq, x]));
  return { alerts, summary: { lines_stamped: latest.size, lines_unstamped: unstamped, proofs_pending: pending + add.filter((x) => x.event === "stamped" && !x.complete).length,
    proofs_complete: [...latest.values()].filter((x) => x.complete).length, upgrade_after_seq: last } };
}
