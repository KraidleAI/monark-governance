// MONARK Bell -- the OpenTimestamps step of the Bell probe, scripts/probe-bell-ots.mjs through the probe's entry point (G0 BELL-COLLECT-TIMER-1
// section 13 L-5; PLAN-P4 C4-8 and section 4 "4b", tuyaux T-q and T-q2; FAITS LSP-12 bis). Offline: runProbe runs in process, its fake fetch
// serves the timeline and the immutables at the constant origin and answers as calendars do (a POST of a digest: a commitment pending at a
// whitelisted URI; an upgrade GET: 404 until told, then a Bitcoin attestation), never the network. The proofs are read by the site's reader
// (readOtsProof of apps/site/lib/bell-anchors.ts, an implementation independent of the probe's) and the manifests compared with the bytes of
// scripts/anchor-bell-timeline.mjs, run as the orchestrator runs it. The probe's reader and writer are also held to the proofs the reference
// client wrote under docs/, byte for byte.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GENESIS, canonical, keyringOf, lineHash, sha256Hex, signLine } from "../apps/bell/scripts/bell-chain.mjs";
import { anchorStatus, bindPublicationAnchor, readOtsProof } from "../apps/site/lib/bell-anchors.ts";
import { BELL_PUBLIC_ORIGIN as ORIGIN } from "../scripts/bell-deploy.mjs";
import * as P from "../scripts/probe-bell.mjs";

type Obj = Record<string, unknown>;
const ROOT = join(import.meta.dirname, ".."), TL = `${ORIGIN}/timeline.jsonl`, NOON = "2026-10-19T12:00:00.000Z";
const dirs: string[] = [];
after(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });
const scratch = (): string => { const d = mkdtempSync(join(tmpdir(), "bell-ots-")); dirs.push(d); return d; };
const K1 = generateKeyPairSync("ed25519").privateKey, K2 = generateKeyPairSync("ed25519").privateKey, id = (k: typeof K1): string => keyringOf(k, 1).keys[0]?.key_id ?? "";
const KR = join(scratch(), "keyring.json");
writeFileSync(KR, JSON.stringify({ schema: "bell-keyring-v1", keys: [K1, K2].map((k) => keyringOf(k, 1).keys[0]) }));
const IMM = new Map<string, Buffer>(), imm = (o: unknown): string => { const b = Buffer.from(JSON.stringify(o)), h = sha256Hex(b); IMM.set(h, b); return h; };
const signed = (l: Obj): Obj => ({ ...l, sig: signLine(l, K1) });
/** Publication `seq` of unit `d` after `prev`, with its two immutables (the envelopes bell-verify.mjs checks). */
function pub(seq: number, prev: Obj | null, d: string): Obj {
  const end = P.unitEndOf(d) - 1000, published_at = new Date(end + 43_200_000).toISOString(), digest = { seq }, bell_sha = sha256Hex(canonical(digest));
  const window = { from_utc_ms: end - 86_399_000, to_utc_ms: end }, base = { seq, published_at };
  return signed({ schema: "bell-timeline-v1", seq, kind: "publication", published_at, prev_line_hash: prev === null ? GENESIS : lineHash(prev), key_id: id(K1),
    state_sha256: imm({ schema: "bell-public-state-v1", ...base, runs: [{ bell_sha, window, digest }] }), provenance_sha256: imm({ schema: "bell-public-provenance-v1", ...base, runs: [{ bellSha: bell_sha }] }),
    runs: [{ bell_sha, window, records: 1 }] });
}
const LINES: Obj[] = [];
for (const d of ["2026-10-14", "2026-10-15", "2026-10-16"]) LINES.push(pub(LINES.length + 1, LINES.at(-1) ?? null, d));
const bytes = (ls: readonly Obj[]): Buffer => Buffer.from(ls.map((l) => `${canonical(l)}\n`).join(""));

const PENDING = Buffer.from("83dfe30d2ef90c8e", "hex"), BITCOIN = Buffer.from("0588960d73d71901", "hex");
const att = (tag: Buffer, payload: Buffer): Buffer => Buffer.concat([Buffer.from([0x00]), tag, Buffer.from([payload.length]), payload]);
/** A calendar's answer to a POST: prepend its 4-byte prefix, sha256, then a commitment pending at its URI. */
const pending = (prefix: number, uri: string): Buffer => Buffer.concat([Buffer.from([0xf1, 4, prefix, 0, 0, 0, 0x08]), att(PENDING, Buffer.concat([Buffer.from([uri.length]), Buffer.from(uri)]))]);
const URI = (u: string): string => `https://${new URL(u).hostname.replaceAll(".", "-")}.calendar.opentimestamps.org`;
interface Cal { answer?: (aggregator: number) => Buffer | number; upgrade?: (uri: string, url: string) => Buffer | number }
/** One run: the timeline `tl` and the immutables at the origin; the aggregators answer by `cal.answer` (default: pending at URI), the upgrades
 *  by `cal.upgrade` (its calendar and the URL asked; default 404). Every URL and every POSTed body recorded. */
async function run(state: string, tl: Buffer, now = NOON, cal: Cal = {}): Promise<{ exitCode: number; report: P.BellProbeReport; seen: string[]; posted: Buffer[] }> {
  const seen: string[] = [], posted: Buffer[] = [];
  const fetch: P.BellProbeFetch = (url, init) => {
    seen.push(url);
    const f = /^\/(?:states|provenance)\/([0-9a-f]{64})\.json$/.exec(url.slice(ORIGIN.length))?.[1], i = P.OTS_AGGREGATORS.findIndex((a) => url === `${a}/digest`);
    if (i >= 0 && init?.body !== undefined) posted.push(Buffer.from(init.body));
    const cur = ["state", "provenance"].find((x) => url === `${ORIGIN}/${x}.json`), last = cur === undefined ? undefined : tl.toString("utf8").trimEnd().split("\n").map((l) => JSON.parse(l) as Obj).filter((l) => l.kind === "publication").at(-1);
    const a = url === TL ? tl : f !== undefined ? IMM.get(f) : last !== undefined ? IMM.get(String(last[`${String(cur)}_sha256`])) : i >= 0 ? (cal.answer ?? ((k: number) => pending(k, URI(url))))(i)
      : url.includes("/timestamp/") ? (cal.upgrade ?? (() => 404))(url.slice(0, url.indexOf("/timestamp/")), url) : undefined;
    return Promise.resolve(Buffer.isBuffer(a) ? new Response(new Uint8Array(a), { status: 200 }) : new Response(null, { status: typeof a === "number" ? a : 404 }));
  };
  const r = await P.runProbe(["--state", state, "--keyring", KR, "--smtp-pass-file", join(state, "none")], { clock: () => Date.parse(now), fetch, smtp: () => Promise.resolve({ ok: true }) });
  return { exitCode: r.exitCode, report: r.report as P.BellProbeReport, seen, posted };
}
const OTS = (state: string, f: string): string => join(state, "bell", "ots", f);
const rows = (state: string): Obj[] => (existsSync(OTS(state, "registry.jsonl")) ? readFileSync(OTS(state, "registry.jsonl"), "utf8").trimEnd().split("\n").map((l) => JSON.parse(l) as Obj) : []);
const proofOf = (state: string, n: number): Buffer => readFileSync(OTS(state, `timeline-seq${String(n)}-manifest.txt.ots`));
const sha = (b: Uint8Array | string): Buffer => Buffer.from(sha256Hex(b), "hex");
const opsOf = (alerts: readonly string[]): string[] => alerts.filter((a) => a.startsWith("ots_"));

// reddened by: a line stamped twice or not at all, a proof under fewer than OTS_M answers, a digest posted other than sha256(manifest digest,
// nonce), a calendar asked again for a stamped line, or a line left without proof past OTS_UNSTAMPED_ALERT_H after its first missed try
// unnamed, named sooner, or timed from the served published_at (a date in the future never rings; an old line rings at its first try)
// killer: scripts/probe-bell-ots.mjs:206 CONST "trees.length >= OTS_M" -> "trees.length >= 1"
test("bell_probe_stamps_each_new_line_once", async () => {
  assert.ok(typeof P.readProof === "function" && P.OTS_M === 2 && P.OTS_AGGREGATORS.length === 4, "the OpenTimestamps step: m = 2 of the four aggregators (FAITS LSP-12 bis)");
  assert.deepEqual([...P.OTS_AGGREGATORS], ["https://a.pool.opentimestamps.org", "https://b.pool.opentimestamps.org", "https://a.pool.eternitywall.com", "https://ots.btc.catallaxy.com"]);
  const s = scratch(), r1 = await run(s, bytes(LINES.slice(0, 2)));
  assert.deepEqual([opsOf(r1.report.alerts), rows(s).map((x) => [x.seq, x.event, x.complete]), r1.posted.length], [[], [[1, "stamped", false], [2, "stamped", false]], 8]);
  for (const n of [1, 2]) { // the posted digest: sha256 of the manifest's digest and the proof's nonce (otsclient/cmds.py l.176-177)
    const root = P.readProof(proofOf(s, n)), nonce = root.ops[0]?.arg ?? Buffer.alloc(0), manifest = readFileSync(OTS(s, `timeline-seq${String(n)}-manifest.txt`));
    assert.deepEqual([root.msg.equals(sha(manifest)), nonce.length, root.ops[0]?.node.ops[0]?.tag], [true, 16, 0x08], `line ${String(n)}: append a 16-byte nonce, then sha256`);
    assert.ok(r1.posted.slice((n - 1) * 4, n * 4).every((b) => b.equals(sha(Buffer.concat([root.msg, nonce])))), `line ${String(n)}: the same digest to the four`);
  }
  const r2 = await run(s, bytes(LINES)), r3 = await run(s, bytes(LINES), "2026-10-19T18:00:00.000Z");
  assert.deepEqual([r2.posted.length, r3.posted.length, rows(s).filter((x) => x.event === "stamped").map((x) => x.seq), r3.report.ots], [4, 0, [1, 2, 3],
    { lines_stamped: 3, lines_unstamped: 0, proofs_pending: 3, proofs_complete: 0, upgrade_after_seq: 1 }], "the new line alone, then nothing: one proof a line");
  // One answer of four: no proof, one "tried" row at the first missed try, retried each run; named past 24 h after that row, stamped once answered.
  const t = scratch(), one = (k: number): Buffer | number => (k === 0 ? pending(0, URI(P.OTS_AGGREGATORS[0] ?? "")) : 503);
  const early = await run(t, bytes(LINES), "2026-10-16T12:00:00.000Z", { answer: one }), late = await run(t, bytes(LINES), "2026-10-20T21:00:00.000Z", { answer: one });
  assert.deepEqual([opsOf(early.report.alerts), early.report.ots?.lines_unstamped, rows(t).map((x) => [x.seq, x.event]), existsSync(OTS(t, "timeline-seq3-manifest.txt.ots"))],
    [[], 3, [[1, "tried"], [2, "tried"], [3, "tried"]], false], "under m: no proof, the first try recorded");
  assert.deepEqual([opsOf(late.report.alerts), late.posted.length, rows(t).length], [["ots_unstamped"], 12, 3], "past 24 h: named, still asked, no row more");
  const done = await run(t, bytes(LINES), "2026-10-20T22:00:00.000Z");
  assert.deepEqual([done.exitCode, opsOf(done.report.alerts), rows(t).filter((x) => x.event === "stamped").map((x) => x.seq)], [0, [], [1, 2, 3]], "answered: stamped, once each");
  // From the first missed try, not from the served published_at: a line dated three days ahead (2026-10-19T19:59:59Z) still rings 24 h after it.
  // killer: scripts/probe-bell-ots.mjs:217 CONST "Date.parse(String(t0.at))" -> "Date.parse(String(lines[n - 1].published_at))"
  const f = scratch(), ahead = bytes([pub(1, null, "2026-10-16")]), down = { answer: (): number => 503 };
  const f1 = await run(f, ahead, "2026-10-16T12:00:00.000Z", down), f2 = await run(f, ahead, "2026-10-17T11:59:00.000Z", down), f3 = await run(f, ahead, "2026-10-17T12:01:00.000Z", down);
  assert.deepEqual([f1.report.alerts, f2.report.alerts, f3.report.alerts, rows(f).map((x) => x.event)], [[], [], ["ots_unstamped"], ["tried"]], "a date in the future rings all the same");
  // A catch-up (six publications days old, the calendars down at the first run): the head and the freshness read the six, the mirror keeps
  // BELL_PROBE_MAX_NEW_PUBLICATIONS, and the first try of an old line rings nothing; 25 h later four stamps, the two lines past the run's
  // bound waiting without a row or an alert; then the last two.
  // killer: scripts/probe-bell.mjs:264 CONST "if (++pubs > BELL_PROBE_MAX_NEW_PUBLICATIONS) return at(null);" -> ""
  // killer: scripts/probe-bell.mjs:323 CONST "lines = [...k.parsed, ...n.parsed.slice(0, good)];" -> "lines = k.parsed;"
  // killer: scripts/probe-bell-ots.mjs:214 SDL "if (!tried) continue;" -> ""
  const six: Obj[] = [], c = scratch();
  for (const d of ["2026-10-09", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]) six.push(pub(six.length + 1, six.at(-1) ?? null, d));
  const c1 = await run(c, bytes(six), NOON, { answer: () => 503 }), c2 = await run(c, bytes(six), "2026-10-20T13:00:00.000Z"), c3 = await run(c, bytes(six), "2026-10-20T14:00:00.000Z");
  assert.deepEqual([c1.exitCode, c1.report.alerts, c1.report.kept_lines, c1.report.head_seq, c2.exitCode, c2.report.alerts, c2.report.kept_lines, c2.report.ots, c3.exitCode,
    rows(c).map((x) => `${String(x.seq)}:${String(x.event)}`)], [0, [], 4, 6, 0, [], 6, { lines_stamped: 4, lines_unstamped: 2, proofs_pending: 4, proofs_complete: 0, upgrade_after_seq: 0 }, 0,
    ["1:tried", "2:tried", "3:tried", "4:tried", "1:stamped", "2:stamped", "3:stamped", "4:stamped", "5:stamped", "6:stamped"]], "a catch-up rings nothing, the calendars down included");
});

// reddened by: a registry row rewritten or dropped (each registry a byte prefix of the next), a row before its proof, or a proof found
// without its row (a cut between the two) stamped again instead of adopted
// killer: scripts/probe-bell-ots.mjs:244 CONST "Buffer.concat([prior, " -> "Buffer.concat(["
test("bell_probe_ots_registry_is_append_only", async () => {
  assert.ok("PROBE_FS" in P && typeof P.readProof === "function", "the probe's file gestures and its proof reader");
  const s = scratch(), reg = (): Buffer => (existsSync(OTS(s, "registry.jsonl")) ? readFileSync(OTS(s, "registry.jsonl")) : Buffer.alloc(0)), seq: Buffer[] = [];
  const bitcoin = (): Buffer => Buffer.concat([Buffer.from([0x08]), att(BITCOIN, Buffer.from([0x81, 0x01]))]);
  for (const [tl, cal] of [[bytes(LINES.slice(0, 1)), {}], [bytes(LINES.slice(0, 2)), {}], [bytes(LINES.slice(0, 2)), { upgrade: bitcoin }]] as const) { await run(s, tl, NOON, cal); seq.push(reg()); }
  assert.deepEqual(seq.map((b, i) => (i === 0 ? b.length > 0 : b.subarray(0, seq[i - 1]?.length).equals(seq[i - 1] ?? Buffer.alloc(0)) && b.length > (seq[i - 1]?.length ?? 0))), [true, true, true], "each registry extends the last");
  assert.deepEqual(rows(s).map((x) => [x.seq, x.event]), [[1, "stamped"], [2, "stamped"], [2, "upgraded"], [1, "upgraded"]], "the upgrades resume after the seq the run before asked");
  // A cut after the proof of line 3, before its row: the next run adopts the proof (no calendar asked, its bytes kept), one row.
  const regPath = OTS(s, "registry.jsonl"), { rename, remove } = P.PROBE_FS;
  Object.assign(P.PROBE_FS, { rename: (a: string, b: string): void => { if (b === regPath) throw new Error("cut"); rename(a, b); }, remove: (): void => undefined });
  const cut = await run(s, bytes(LINES)).finally(() => { Object.assign(P.PROBE_FS, { rename, remove }); });
  const proof3 = proofOf(s, 3), regCut = reg(), next = await run(s, bytes(LINES));
  assert.deepEqual([cut.posted.length, cut.report.alerts.includes("probe_error"), regCut.equals(seq[2] ?? Buffer.alloc(0))], [4, true, true], "the cut: a proof, no row");
  assert.deepEqual([next.posted.length, proofOf(s, 3).equals(proof3), rows(s).filter((x) => x.seq === 3).map((x) => x.event)], [0, true, ["stamped"]], "adopted, not stamped again");
});

// reddened by: a proof the site's reader does not read as a sha256 timestamp of its manifest, pending at the calendars that answered, a row
// that does not bind to its files by bindPublicationAnchor (tuyau T-q2), a proof of the reference client not written back byte for byte, the
// attestations of a node off the reference's order, a block attestation compared or written by its bytes, a pending one written by its bytes,
// an empty URI refused, or a recursion limit off the reference's
// killer: scripts/probe-bell-ots.mjs:123 CONST "i < items.length - 1 ?" -> "i < 0 ?"
test("bell_probe_ots_proof_reads_with_the_site_reader", async () => {
  assert.ok(typeof P.writeProof === "function", "the probe's proof writer");
  const s = scratch();
  await run(s, bytes(LINES));
  for (const row of rows(s)) {
    const manifest = readFileSync(OTS(s, String(row.manifest))), proof = readOtsProof(new Uint8Array(readFileSync(OTS(s, String(row.proof)))));
    assert.deepEqual([proof.hashOp, proof.digestHex, anchorStatus(proof)], ["sha256", sha256Hex(manifest), { bitcoinHeights: [], pendingCalendars: P.OTS_AGGREGATORS.map(URI).sort() }],
      `seq ${String(row.seq)}: read by the site's reader, pending at the four calendars`);
    bindPublicationAnchor({ date_utc: String(row.at).replace(/\.\d{3}Z$/, "Z"), seq: Number(row.seq), kind: "publication", line_hash: String(row.line_hash), prefix_sha256: String(row.prefix_sha256),
      manifest_sha256: String(row.manifest_sha256), commit: "0000000", manifest_file: String(row.manifest), proof_file: String(row.proof) }, manifest.toString("utf8"), sha256Hex(manifest), proof);
  }
  // No committed proof below holds two attestations at a node: given out of order, a node's are written as the reference sorts them (notary.py
  // __lt__: the tag, then the height or the URI; 255 before 256, whose LEB128 bytes sort the other way); a block payload goes by its height
  // (8100 is height 1: one attestation, written 01); a pending payload goes by its URI (a length of 14 written 8e00 reads, alone or merged with
  // the same URI, and is written 0e: notary.py _serialize_payload); an empty URI reads (check_uri); a node at depth 255 reads, at 256 is refused
  // (timestamp.py _recursion_limit).
  // killer: scripts/probe-bell-ots.mjs:87 CONST "a.tag < b.tag ? -1 : 1" -> "a.tag < b.tag ? 1 : -1"
  // killer: scripts/probe-bell-ots.mjs:87 CONST "a.height - b.height" -> "b.height - a.height"
  // killer: scripts/probe-bell-ots.mjs:83 SDL "if (a.uri !== null) a.payload = varbytes(Buffer.from(a.uri));" -> ""
  // killer: scripts/probe-bell-ots.mjs:84 SDL "else if (a.height !== null) a.payload = varuint(a.height);" -> ""
  // killer: scripts/probe-bell-ots.mjs:82 CONST "/^[A-Za-z0-9._/:-]*$/" -> "/^[A-Za-z0-9._/:-]+$/"
  // killer: scripts/probe-bell-ots.mjs:102 CONST "depth >= MAX_DEPTH" -> "depth > MAX_DEPTH"
  const detached = (tree: Buffer): Buffer => Buffer.concat([Buffer.from("004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e89294", "hex"), Buffer.from([0x01, 0x08]), sha("node"), tree]);
  const fork = (items: Buffer[]): Buffer => Buffer.concat(items.flatMap((b, i) => (i < items.length - 1 ? [Buffer.from([0xff]), b] : [b])));
  const at = (u: string): Buffer => att(PENDING, Buffer.concat([Buffer.from([u.length]), Buffer.from(u)])), block = (...b: number[]): Buffer => att(BITCOIN, Buffer.from(b));
  assert.ok(P.writeProof(P.readProof(detached(fork([at("https://b.test"), block(0x80, 0x02), at("https://a.test"), block(0xff, 0x01)]))))
    .equals(detached(fork([block(0xff, 0x01), block(0x80, 0x02), at("https://a.test"), at("https://b.test")]))), "a node's attestations, in the reference's order");
  assert.ok(P.writeProof(P.readProof(detached(fork([block(0x81, 0x00), block(0x01)])))).equals(detached(block(0x01))), "a height, by its value");
  const wide = att(PENDING, Buffer.concat([Buffer.from([0x8e, 0x00]), Buffer.from("https://a.test")]));
  assert.deepEqual([wide, fork([wide, at("https://a.test")])].map((t) => P.writeProof(P.readProof(detached(t))).equals(detached(at("https://a.test")))), [true, true],
    "a pending URI, by its value");
  const read = (tree: Buffer): string => { try { const t = P.readProof(detached(tree)); return `read ${String(t.ops.length)} ${JSON.stringify(t.atts[0]?.uri ?? null)}`; } catch { return "refused"; } };
  assert.deepEqual([read(att(PENDING, Buffer.from([0x00]))), read(Buffer.concat([Buffer.alloc(255, 0x08), block(0x01)])), read(Buffer.concat([Buffer.alloc(256, 0x08), block(0x01)]))],
    ["read 0 \"\"", "read 1 null", "refused"], "an empty URI; depth 255, then 256");
  // The proofs the reference client wrote (docs/, its own serialization order of forks, attestations and operations): read and written back.
  const docs = ["bell-publications", "course-bell", "dojo-publications"].flatMap((d) => readdirSync(join(ROOT, "docs", d)).filter((f) => f.endsWith(".ots")).map((f) => join(ROOT, "docs", d, f)));
  assert.ok(docs.length >= 3, "non-vacuity: the committed proofs");
  for (const f of docs) {
    const b = readFileSync(f), t = P.readProof(b);
    assert.deepEqual([P.writeProof(t).equals(b), anchorStatus(readOtsProof(new Uint8Array(P.writeProof(t)))).bitcoinHeights.length > 0, t.msg.toString("hex")],
      [true, P.isComplete(t), readOtsProof(new Uint8Array(b)).digestHex], f);
  }
});

// reddened by: a manifest of the probe off the bytes scripts/anchor-bell-timeline.mjs writes from the same kept copy and immutables, for a
// publication line and a key line
// killer: scripts/probe-bell-ots.mjs:151 CONST ".sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));" -> ";"
test("bell_probe_ots_manifest_is_the_anchor_tool_manifest", async () => {
  assert.ok(typeof P.manifestOf === "function", "the probe's manifest");
  const rot = { schema: "bell-timeline-v1", seq: 4, kind: "key_rotation", published_at: "2026-10-19T11:00:00.000Z", prev_line_hash: lineHash(LINES[2]), key_id: id(K1),
    new_key: keyringOf(K2, 1).keys[0]?.jwk, new_key_id: id(K2) }, rotated = { ...rot, sig_new: signLine(rot, K2) }, key = { ...rotated, sig: signLine(rotated, K1) };
  const s = scratch(), r = await run(s, bytes([...LINES, key])), kept = readFileSync(join(s, "bell", "timeline.jsonl")), out = scratch();
  assert.deepEqual([r.report.kept_lines, rows(s).map((x) => x.kind)], [4, ["publication", "publication", "publication", "key_rotation"]]);
  const ends = [...kept.entries()].filter(([, b]) => b === 10).map(([i]) => i);
  for (let n = 1; n <= 4; n++) {
    const prefix = kept.subarray(0, (ends[n - 1] ?? -1) + 1);
    const tool = spawnSync(process.execPath, [join(ROOT, "scripts", "anchor-bell-timeline.mjs"), "--seq", String(n), "--timeline", join(s, "bell", "timeline.jsonl"),
      "--immutables", join(s, "bell"), "--mirror-sha", sha256Hex(prefix), "--keyring", KR, "--out-dir", out], { cwd: ROOT, encoding: "utf8" });
    assert.equal(tool.status, 0, tool.stderr);
    const name = `timeline-seq${String(n)}-manifest.txt`;
    assert.ok(readFileSync(join(out, name)).equals(readFileSync(OTS(s, name))), `${name}: the anchor tool's bytes`);
  }
});

// reddened by: a pending proof not upgraded when its calendar completes it, an answer merged off its node, the nonce or a pending commitment
// lost, a complete proof asked again (in the same run too), a URI off the whitelist asked, an unknown operation merged or the proof rewritten,
// a 200 with nothing new written, the budget spent at the head of the list each run, or a proof pending past OTS_PENDING_STALE_H unnamed
// killer: scripts/probe-bell-ots.mjs:229 CONST "calls >= OTS_MAX_UPGRADES || isComplete(proof)" -> "calls >= OTS_MAX_UPGRADES"
test("bell_probe_ots_upgrades_a_pending_proof_once_complete", async () => {
  assert.ok(typeof P.whitelisted === "function" && P.whitelisted("https://alice.btc.calendar.opentimestamps.org") && !P.whitelisted("https://calendar.opentimestamps.org.evil.test"), "the whitelist");
  const s = scratch(), tl = bytes(LINES.slice(0, 1)), first = await run(s, tl), pend = proofOf(s, 1);
  const asks = (x: { seen: string[] }): number => x.seen.filter((u) => u.includes("/timestamp/")).length, still = await run(s, tl);
  assert.deepEqual([asks(first), asks(still), proofOf(s, 1).equals(pend), opsOf(still.report.alerts), rows(s).length], [0, 4, true, [], 1], "404: still pending, nothing written");
  // A 200 that brings nothing new (the commitment the proof holds, again): no row, no write (otsclient/cmds.py l.310-318).
  // killer: scripts/probe-bell-ots.mjs:236 CONST "!writeProof(proof).equals(was) && " -> ""
  const same = await run(s, tl, NOON, { upgrade: (uri) => att(PENDING, Buffer.concat([Buffer.from([uri.length]), Buffer.from(uri)])) });
  assert.deepEqual([asks(same), proofOf(s, 1).equals(pend), rows(s).length], [4, true, 1], "a 200 with nothing new: no row, no write");
  const upgrade = (uri: string): Buffer | number => (uri === URI(P.OTS_AGGREGATORS[1] ?? "") ? Buffer.concat([Buffer.from([0x08]), att(BITCOIN, Buffer.from([0xb4, 0x9a, 0x37]))]) : 404);
  const up = await run(s, tl, NOON, { upgrade }), after1 = readOtsProof(new Uint8Array(proofOf(s, 1))), root = P.readProof(proofOf(s, 1));
  assert.deepEqual([anchorStatus(after1), root.ops[0]?.arg?.equals(P.readProof(pend).ops[0]?.arg ?? Buffer.alloc(0)), rows(s).at(-1)?.event, rows(s).at(-1)?.complete, up.report.ots?.proofs_complete],
    [{ bitcoinHeights: [904500], pendingCalendars: P.OTS_AGGREGATORS.map(URI).sort() }, true, "upgraded", true, 1], "complete: the block recorded, the nonce and the four commitments kept");
  // The answer is merged under the commitment it upgrades: asked for that node's message, the block one sha256 below it.
  const holding = (n: P.OtsNode, f: (a: P.OtsAttestation) => boolean): P.OtsNode[] => [...(n.atts.some(f) ? [n] : []), ...n.ops.flatMap((o) => holding(o.node, f))];
  const pend1 = holding(root, (a) => a.uri === URI(P.OTS_AGGREGATORS[1] ?? ""))[0], block = holding(root, (a) => a.height === 904500)[0];
  assert.deepEqual([up.seen.includes(`${URI(P.OTS_AGGREGATORS[1] ?? "")}/timestamp/${pend1?.msg.toString("hex") ?? ""}`), block?.msg.equals(sha(pend1?.msg ?? Buffer.alloc(0)))], [true, true], "at its node");
  const again = await run(s, tl, NOON, { upgrade });
  assert.deepEqual([asks(again), rows(s).length], [0, 2], "a complete proof is not asked again");
  // The budget shared: two proofs whose calendars never complete and a third that would. The first run spends its OTS_MAX_UPGRADES calls on
  // the first two; the next resumes after the last seq asked, completes the third in one call (asked no more), then asks the two others. A
  // proof still pending OTS_PENDING_STALE_H after its "stamped" row (NOON) is named.
  // killer: scripts/probe-bell-ots.mjs:223 CONST "...proofs.filter((x) => x.seq > after), " -> ""
  // killer: scripts/probe-bell-ots.mjs:242 CONST "OTS_PENDING_STALE_H * H" -> "OTS_PENDING_STALE_H * H * 2"
  assert.deepEqual([P.OTS_PENDING_STALE_H, P.BELL_PROBE_ALERTS.includes("ots_pending_stale")], [192, true], "ots_pending_stale: 192 h (FAITS LSP-12 bis point 10), named");
  const v = scratch();
  await run(v, bytes(LINES));
  const seqOf = new Map([1, 2, 3].flatMap((n) => holding(P.readProof(proofOf(v, n)), (a) => a.uri !== null).map((x): [string, number] => [x.msg.toString("hex"), n])));
  const hexOf = (u: string): string => u.slice(u.indexOf("/timestamp/") + "/timestamp/".length), asked = (x: { seen: string[] }): unknown[] => x.seen.filter((u) => u.includes("/timestamp/")).map((u) => seqOf.get(hexOf(u)));
  const third = (_: string, url: string): Buffer | number => (seqOf.get(hexOf(url)) === 3 ? Buffer.concat([Buffer.from([0x08]), att(BITCOIN, Buffer.from([0x01]))]) : 404);
  const v1 = await run(v, bytes(LINES), "2026-10-19T13:00:00.000Z", { upgrade: third }), v2 = await run(v, bytes(LINES), "2026-10-19T14:00:00.000Z", { upgrade: third });
  assert.deepEqual([asked(v1), v1.report.ots?.upgrade_after_seq, asked(v2), rows(v).filter((x) => x.event === "upgraded").map((x) => [x.seq, x.complete]), v2.report.ots?.proofs_pending],
    [[1, 1, 1, 1, 2, 2, 2, 2], 2, [3, 1, 1, 1, 1, 2, 2, 2], [[3, true]], 2], "the third completed by the run after, in one call");
  const ring = async (now: string): Promise<string[]> => opsOf((await run(v, bytes(LINES), now)).report.alerts);
  assert.deepEqual([await ring("2026-10-27T11:59:00.000Z"), await ring("2026-10-27T12:01:00.000Z")], [[], ["ots_pending_stale"]], "pending 192 h after its stamp: named");
  // An unknown operation (reverse, 0xf2) in an upgrade answer, asked before a complete one: named, and the proof kept as written, the complete
  // answer with it; a URI off the whitelist: never asked.
  const u = scratch(), evil = (k: number): Buffer => (k === 0 ? pending(0, "https://calendar.evil.test") : pending(k, URI(P.OTS_AGGREGATORS[k] ?? "")));
  await run(u, tl, NOON, { answer: evil });
  const lastOne = (x: string): Buffer => (x === URI(P.OTS_AGGREGATORS[3] ?? "") ? Buffer.concat([Buffer.from([0x08]), att(BITCOIN, Buffer.from([0x01]))]) : Buffer.from([0xf2, 0x00]));
  const before = proofOf(u, 1), odd = await run(u, tl, NOON, { upgrade: lastOne });
  assert.deepEqual([opsOf(odd.report.alerts), proofOf(u, 1).equals(before), rows(u).length, asks(odd), odd.seen.some((x) => new URL(x).hostname === "calendar.evil.test")],
    [["ots_op_unsupported"], true, 1, 3, false]);
  const bad = await run(scratch(), tl, NOON, { answer: (k) => (k === 0 ? Buffer.from([0xf2, 0x00]) : pending(k, URI(P.OTS_AGGREGATORS[k] ?? ""))) });
  assert.deepEqual([opsOf(bad.report.alerts), bad.report.ots?.lines_stamped], [["ots_op_unsupported"], 1], "at the stamp: that answer dropped, the three others merged");
});

// reddened by: a calendar answer grafted past MAX_DEPTH (a proof written that the next run cannot read: its rows lost at each run after),
// at the stamp (under the tip, depth 2) or at an upgrade (under its pending node), or one refused a level short of the bound, or refused
// unnamed; a proof on disk that does not read failing the whole step (no row of the run written, no other proof asked) instead of that
// proof alone, or failing unnamed (G2 of part 4, nit-7)
// killer: scripts/probe-bell-ots.mjs:117 CONST "readTree(c, msg, depth)" -> "readTree(c, msg, 0)"
test("bell_probe_ots_written_proof_always_reads_again", async () => {
  assert.ok(P.BELL_PROBE_ALERTS.includes("ots_op_unsupported") && P.BELL_PROBE_ALERTS.includes("probe_error"), "the two names, in the closed list");
  /** An answer `k` sha256 operations deep, ending in a commitment pending at `uri`: its deepest node `k` below the node it is grafted at. */
  const deep = (k: number, uri: string): Buffer => Buffer.concat([Buffer.alloc(k, 0x08), att(PENDING, Buffer.concat([Buffer.from([uri.length]), Buffer.from(uri)]))]);
  const depthOf = (n: P.OtsNode): number => Math.max(0, ...n.ops.map((o) => 1 + depthOf(o.node)));
  const depthAt = (st: string, n: number): number => { try { return depthOf(P.readProof(proofOf(st, n))); } catch { return -1; } };
  const fault = (alerts: readonly string[]): string[] => alerts.filter((a) => a.startsWith("ots_") || a === "probe_error");
  const asks = (x: { seen: string[] }): number => x.seen.filter((u) => u.includes("/timestamp/")).length, cal = (k: number): string => URI(P.OTS_AGGREGATORS[k] ?? "");
  // At the stamp the tip is at depth 2 (the root, its nonce appended, sha256): an answer 254 deep would put a node at 256, refused and named,
  // the three others merged; one 253 deep reaches 255 and is kept. The proof reads, and the next run writes its rows.
  // killer: scripts/probe-bell-ots.mjs:49 CONST "TIP_DEPTH = 2;" -> "TIP_DEPTH = 1;"
  // killer: scripts/probe-bell-ots.mjs:49 CONST "TIP_DEPTH = 2;" -> "TIP_DEPTH = 3;"
  // killer: scripts/probe-bell-ots.mjs:177 CONST " || e instanceof OtsTooDeep" -> ""
  const s = scratch(), at2 = (k: number): Buffer => (k === 0 ? deep(254, cal(0)) : k === 1 ? deep(253, cal(1)) : pending(k, cal(k)));
  const s1 = await run(s, bytes(LINES.slice(0, 1)), NOON, { answer: at2 }), s2 = await run(s, bytes(LINES.slice(0, 2)));
  assert.deepEqual([fault(s1.report.alerts), depthAt(s, 1), fault(s2.report.alerts), rows(s).map((x) => [x.seq, x.event])],
    [["ots_op_unsupported"], 255, [], [[1, "stamped"], [2, "stamped"]]], "at the stamp: the answer past the bound refused and named, the proof read again");
  // At an upgrade the pending node is at depth 4 (the tip, the calendar's prefix, sha256): an answer 252 deep is refused and named, the proof
  // kept as written; one 251 deep is merged, written, and read by the next run, which writes its rows.
  // killer: scripts/probe-bell-ots.mjs:135 CONST "attestationsOf(o.node, depth + 1)" -> "attestationsOf(o.node, depth)"
  // killer: scripts/probe-bell-ots.mjs:135 CONST "({ node: n, a, depth })" -> "({ node: n, a, depth: depth + 1 })"
  const u = scratch(), one = (k: number, d: number) => (uri: string): Buffer | number => (uri === cal(k) ? deep(d, cal(k)) : 404);
  await run(u, bytes(LINES.slice(0, 1)));
  const before = proofOf(u, 1), u2 = await run(u, bytes(LINES.slice(0, 2)), NOON, { upgrade: one(0, 252) });
  assert.deepEqual([fault(u2.report.alerts), proofOf(u, 1).equals(before), rows(u).map((x) => [x.seq, x.event])], [["ots_op_unsupported"], true, [[1, "stamped"], [2, "stamped"]]],
    "at an upgrade: the answer past the bound refused and named, the proof kept as written, the run's row written");
  const u3 = await run(u, bytes(LINES), NOON, { upgrade: one(1, 251) }), u4 = await run(u, bytes(LINES));
  assert.deepEqual([fault(u3.report.alerts), depthAt(u, 1), depthAt(u, 2), fault(u4.report.alerts), asks(u4) > 0, rows(u).map((x) => `${String(x.seq)}:${String(x.event)}`)],
    [[], 255, 255, [], true, ["1:stamped", "2:stamped", "3:stamped", "2:upgraded", "1:upgraded"]], "an answer to the bound: merged, then read again");
  // A pending proof on disk that does not read: named for that proof alone (probe_error, the probe's own state, as a registry that does not
  // parse), left as found; the other proof still asked, the run's rows written.
  // killer: scripts/probe-bell-ots.mjs:225 CONST "catch { proof = null; }" -> "catch (e) { throw e; }"
  // killer: scripts/probe-bell-ots.mjs:226 CONST "alerts.push(\"probe_error\"); " -> ""
  // killer: scripts/probe-bell-ots.mjs:226 CONST "pending += 1; continue;" -> "continue;"
  const v = scratch();
  await run(v, bytes(LINES.slice(0, 2)));
  writeFileSync(OTS(v, "timeline-seq1-manifest.txt.ots"), "not a proof");
  const v2 = await run(v, bytes(LINES));
  assert.deepEqual([fault(v2.report.alerts), asks(v2), v2.report.ots?.proofs_pending, readFileSync(OTS(v, "timeline-seq1-manifest.txt.ots"), "utf8"), rows(v).map((x) => [x.seq, x.event])],
    [["probe_error"], 4, 3, "not a proof", [[1, "stamped"], [2, "stamped"], [3, "stamped"]]], "an unreadable proof: named, alone; the rows of the run written");
});
