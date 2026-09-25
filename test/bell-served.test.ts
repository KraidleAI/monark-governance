/**
 * Root tests for the served-Bell facts the storefront renders (lot BELL-SERVED-1, v3; investor decision 155). The data
 * file apps/site/data/bell-served.json is written by scripts/sync-bell-served.mjs from the SERVED files through the pure
 * projection buildBellServed() (apps/site/lib/bell-served-load.ts). These OFFLINE, non-LLM oracles pin:
 *   - the file itself: manifest hash and pinned sha, the first record and the latest publication, the agreement with the
 *     committed deploy check docs/deploy-CA-bell.json and the committed keyring (a second, committed witness of the same
 *     served bodies), the collector revision (a real commit touching the collector source);
 *   - what it must never carry: a number outside the listed count/instant/identifier paths (market values stay strings), a
 *     volume-ratio value, a provider label, a proof-of-reserves method or note, a key (the served jwk.x included);
 *   - the projection: on a two-line signed fixture (first record != latest publication) the current files bind to the
 *     LATEST line (the v1/v2 binding to the first line would refuse this fixture), every run of the latest publication is
 *     copied, provider labels are read and dropped, a tampered line, a stale deploy check or a wrong state fail closed;
 *   - the publisher's closed list: the keys the site copies equal the publisher's WHITELIST objects (minus what the site
 *     never carries), the served schema block equals WHITELIST, each run counts exactly the collector's residual codes, the
 *     thresholds derive from the exceed<k> keys;
 *   - the pages: /bell and /bell/method read these values through loadBellServed, never as typed literals, and the stale
 *     placeholders of served values are gone;
 *   - the pairing: each session row is paired by index with the volume entry of its session group (the collector pushes one
 *     of each per group, in the same order), checked one to one by the loader; a two-day fixture shows two same-named rows
 *     keep their own dates (a join on symbol, session and regime would give both the first date);
 *   - the wording: no licence claim of Bell's own (only the reader's own licence is named), no "never carried" claim that the
 *     served ratio values contradict, the served facts dated by read_at, the abstentions stated from the served rows.
 * The provider-name literals below live in a repo-root test/ file, which is never exported (same confinement as
 * test/no-cash-provider-name.test.ts, C-9). Run by `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash, generateKeyPairSync } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  loadBellServed,
  buildBellServed,
  thresholdsOf,
  shiftDecimal,
  sessionRowsOf,
  abstentionsOf,
  setManifestEntry,
  BELL_SERVED_REL,
  BELL_HOST,
  BELL_GENESIS,
  BELL_SESSION_KEYS,
  BELL_VOLUME_KEYS,
  BELL_VOLUME_DROPPED,
  BELL_SUPPLY_KEYS,
  BELL_POR_KEYS,
  BELL_WRAPPER_KEYS,
  BELL_HALT_DELTA_KEYS,
  BELL_RECORD_KEYS,
} from "../apps/site/lib/bell-served-load.ts";
import { canonical, keyringOf, lineHash, signLine, trustOf, walkTimeline, GENESIS } from "../apps/bell/scripts/bell-chain.mjs";
import { WHITELIST } from "../apps/bell/scripts/bell-publish.mjs";
import { BELL_ROOT_REDIRECT } from "../scripts/verify-bell.mjs";
import { RESIDUAL_CODES } from "../apps/bell/src/residuals.ts";

const ROOT = join(import.meta.dirname, "..");
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const PAGES = ["apps/site/app/bell/page.tsx", "apps/site/app/bell/method/page.tsx"];
const sha = (s: string | Uint8Array): string => createHash("sha256").update(s).digest("hex");
const shaLf = (rel: string): string => sha(Buffer.from(readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n"), "utf8"));
const readJson = <T>(rel: string): T => JSON.parse(readFileSync(join(ROOT, rel), "utf8")) as T;
const CHAIN = { walkTimeline, trustOf, lineHash };

// Pins: written by scripts/sync-bell-served.mjs from the served host at 2026-09-24T02:00:59Z (read_at in the file); the first
// line's facts re-hashed independently by the reader-side verifier (bell-verify.mjs, lines 1, head_seq 1) before this lot.
// v4 (ADR-BELL-OTS-PRB D-B12): the sync now writes the manifest entry itself; this pin is re-set to the sha256 it prints.
const PINNED_FILE_SHA256 = "8bf1424bc988689458dac1902cb443d7d395141e8969afc27672ab16de309f53";
const PINNED_FIRST = {
  seq: 1,
  kind: "publication",
  published_at: "2026-09-23T21:35:52.438Z",
  line_hash: "4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c",
  prev_line_hash: "0000000000000000000000000000000000000000000000000000000000000000",
  key_id: "30fd26e80efac0d93e1f82c5f4372354ec71e5294f36d946d5167ce0ef39c672",
  state_sha256: "a828489f64f112c8026b7c38f3710b82af1c97245fdba10b16170e39aed7a240",
  provenance_sha256: "4935a259b7d6c2ddd929b4ecd440b6918d103c76b8a42b364df1b505f041ea3b",
  symbols: ["TSLAx"],
};

test("bell_served_data_is_listed_and_hash_pinned", () => {
  const manifest = readJson<{ files: Record<string, string> }>(MANIFEST_REL);
  assert.equal(manifest.files[BELL_SERVED_REL], shaLf(BELL_SERVED_REL), "manifest entry must equal the file's CRLF->LF sha256");
  assert.equal(shaLf(BELL_SERVED_REL), PINNED_FILE_SHA256, "bell-served.json changed: re-run scripts/sync-bell-served.mjs AND re-pin here");
});

// SYNC-MANIFEST-WRITE-1 (for this sync only): the sync sets its own entry of the site manifest; on an in-memory copy, only that value changes.
test("bell_served_sync_sets_its_manifest_entry_only", () => {
  const text = readFileSync(join(ROOT, MANIFEST_REL), "utf8"), files = readJson<{ files: Record<string, string> }>(MANIFEST_REL).files, next = "a".repeat(64);
  const out = setManifestEntry(text, BELL_SERVED_REL, next);
  assert.equal(out, text.replace(`"${BELL_SERVED_REL}": "${files[BELL_SERVED_REL] ?? "?"}"`, `"${BELL_SERVED_REL}": "${next}"`), "every other byte is kept");
  assert.deepEqual(JSON.parse(out), { ...(JSON.parse(text) as object), files: { ...files, [BELL_SERVED_REL]: next } });
  for (const [t, rel, v, why] of [[text, "apps/site/data/absent.json", next, "an unlisted file"], [text + text, BELL_SERVED_REL, next, "a file listed twice"], [text, BELL_SERVED_REL, "0xz", "a value that is not a sha256"]] as const) {
    assert.throws(() => setManifestEntry(t, rel, v), /does not list/, `${why} is refused, nothing added`);
  }
  const sync = readFileSync(join(ROOT, "scripts", "sync-bell-served.mjs"), "utf8");
  assert.match(sync, /manifest = setManifestEntry\(readFileSync\(join\(ROOT, MANIFEST_REL\), "utf8"\), OUT_REL, sha\);/, "the sync computes the entry before any write");
  assert.match(sync, /writeFileSync\(join\(ROOT, OUT_REL\), text\);\n\s+writeFileSync\(join\(ROOT, MANIFEST_REL\), manifest\);/, "and writes it with the file");
});

test("bell_served_first_record_and_latest_publication_pinned", () => {
  const d = loadBellServed(ROOT, RESIDUAL_CODES);
  assert.equal(d.host, BELL_HOST);
  assert.equal(d.host, "https://bell.monarkgate.tech");
  assert.deepEqual(d.first_record, PINNED_FIRST);
  assert.equal(d.first_record.prev_line_hash, GENESIS, "the first line is chained from the publisher's GENESIS");
  assert.equal(BELL_GENESIS, GENESIS, "the site's genesis value is the publisher's");
  // Seq 2 (2026-09-24T08:41:21.864Z, decision 184: TSLAx, AAPLx and SPYx published together) is the latest publication; the
  // first record stays seq 1. Pins re-hashed from the served host by sync-bell-served (read_at in the file) and cross-checked
  // against the publisher's status line (JOURNAL-PROVENANCE, D-n seq 2).
  assert.equal(d.timeline.lines, 2);
  assert.equal(d.timeline.publications, 2);
  assert.equal(d.head.seq, 2);
  assert.equal(d.head.line_hash, "ef3b06f2ff93951e200a6559b42ab66df5ac4aa38b86d3aa763c118c766f6464");
  assert.equal(d.head.prev_line_hash, PINNED_FIRST.line_hash, "seq 2 chains from seq 1");
  assert.equal(d.head.state_sha256, "4564701add6e4231a67912ef45c7db640cd76dfe88302a96bc0e7722090508b9");
  assert.equal(d.head.provenance_sha256, "ad8dd9b023bdfafade328d7ada5d17ae53d0de2133fcdf808237409d136fc39b");
  // lines[] (v4) = the facts of both served lines, pinned through the two pinned lines above (ADR-BELL-OTS-PRB §1.1, re-derived offline
  // from the durable mirror copy of the timeline, sha256 fba1824d…d28b, in the lot's G1).
  assert.deepEqual(d.lines, [d.first_record, d.head].map((l) => ({ seq: l.seq, kind: "publication", line_hash: l.line_hash, prev_line_hash: l.prev_line_hash,
    state_sha256: l.state_sha256, provenance_sha256: l.provenance_sha256 })), "lines[] carries the first record and the head, in order, and nothing else");
  assert.deepEqual(d.head.runs.map((r) => r.bell_sha), [
    "502720e32861c74d4d149a07a3375e61cd10868244401a8fc7faf1fae7f592c4",
    "5fbb856db73eed59b95524f4ab508e311f56f5989c463d5c57eba8e781ce270b",
    "5fde676ec83b66c7c8ca6c93cb86985c4d37da3f8af1a6a1fd47698e171c1663",
  ], "three runs at the head: TSLAx W3, AAPLx W3, SPYx W4 (never a single instrument, investor rule)");
  const keyring = readJson<{ keys: Array<{ key_id: string; status: string; valid_from_seq: number }> }>("apps/bell/keys/bell-keyring.json");
  assert.deepEqual(d.keyring.keys, keyring.keys.map((k) => ({ key_id: k.key_id, status: k.status, valid_from_seq: k.valid_from_seq })), "key statuses = the committed keyring");
  assert.ok(keyring.keys.some((k) => k.key_id === d.head.key_id), "the latest line's key_id is in the committed keyring (trust root, C-9)");
  assert.ok(Date.parse(d.read_at) >= Date.parse(d.head.published_at), "read after publication");
});

test("bell_served_data_matches_deploy_ca", () => {
  const d = loadBellServed(ROOT);
  const ca = readJson<{ url: string; checked_at: string; keyring_sha256: string; bodies_sha256: Record<string, string>; checks: Array<{ name: string; ok: boolean; detail: string }>; tls: { authorized: boolean } }>("docs/deploy-CA-bell.json");
  assert.equal(ca.url, d.host, "the deploy check and the site data name the same host");
  assert.ok(ca.checks.length > 0 && ca.checks.every((c) => c.ok), "the committed deploy check is green on every control");
  assert.equal(d.bodies_sha256.timeline, ca.bodies_sha256["/timeline.jsonl"], "timeline body read by the site data = body checked by the deploy CA");
  assert.equal(d.bodies_sha256.pubkey, ca.bodies_sha256["/bell/pubkey.json"], "key set read by the site data = key set checked by the deploy CA");
  assert.equal(d.bodies_sha256.state, ca.bodies_sha256["/state.json"], "state body read by the site data = state checked by the deploy CA");
  assert.equal(d.bodies_sha256.provenance, ca.bodies_sha256["/provenance.json"], "provenance body read by the site data = provenance checked by the deploy CA");
  assert.equal(d.bodies_sha256.pubkey, ca.keyring_sha256);
  assert.equal(d.bodies_sha256.pubkey, sha(readFileSync(join(ROOT, "apps/bell/keys/bell-keyring.json"))), "served key set = committed keyring bytes");
  // The counts the page renders are the committed deploy check's own, recomputed here.
  assert.deepEqual(d.deploy_check, { checked_at: ca.checked_at, checks_total: ca.checks.length, checks_passed: ca.checks.filter((c) => c.ok).length, tls_authorized: ca.tls.authorized });
  // The /bell sentence "its root redirects to this page" is backed by the deploy check's root control.
  assert.equal(BELL_ROOT_REDIRECT, "https://monarkgate.tech/bell");
  assert.ok(ca.checks.some((c) => c.ok && c.detail.includes(`root_location=${BELL_ROOT_REDIRECT}`)), "the committed deploy check saw the root redirect to /bell");
  assert.match(readFileSync(join(ROOT, PAGES[0] ?? ""), "utf8"), /its root redirects to this page/);
});

test("bell_served_collector_revision_is_a_collector_commit", () => {
  const d = loadBellServed(ROOT);
  const git = (...args: string[]): string => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  assert.equal(git("cat-file", "-t", d.collector_revision.commit), "commit");
  assert.notEqual(git("diff-tree", "--no-commit-id", "--name-only", "-r", d.collector_revision.commit, "--", "apps/bell/src"), "", "the recorded revision touches the collector source");
  assert.equal(new Date(git("show", "-s", "--format=%cI", d.collector_revision.commit)).toISOString(), d.collector_revision.committed_at);
});

// Every path of a number in the file (array indices as []): counts, instants, identifiers — never a market value.
const NUMBER_PATHS = new Set([
  "timeline.lines", "timeline.publications", "lines[].seq", "first_record.seq", "head.seq",
  "head.runs[].window.from_utc_ms", "head.runs[].window.to_utc_ms",
  "head.runs[].records[].n_fills", "head.runs[].records[].sessions",
  ...RESIDUAL_CODES.map((c) => `head.runs[].residuals.${c}`),
  "head.runs[].sessions[].n", "head.runs[].sessions[].exceed1", "head.runs[].sessions[].exceed2", "head.runs[].sessions[].exceed5",
  "head.runs[].sessions[].earliest_publish_utc",
  "head.runs[].volume[].window.from_utc_ms", "head.runs[].volume[].window.to_utc_ms", "head.runs[].volume[].adv_period.year",
  "head.runs[].volume[].adv_period.month", "head.runs[].volume[].n", "head.runs[].volume[].n_bars", "head.runs[].volume[].n_trading_days",
  "head.runs[].supply[].decimals", "head.runs[].por[].age_sec", "head.runs[].halt_census.total", "head.runs[].halt_census.empty_resume",
  ...["halt_utc_ms", "resume_utc_ms", "first_fill_after_halt_utc_ms", "last_fill_before_resume_utc_ms", "n_fills_in_window"].map((k) => `head.runs[].halt_deltas[].${k}`),
  "head.runs[].provenance.providers_distinct", "head.runs[].provenance.quorum_required",
  "keyring.keys[].valid_from_seq", "deploy_check.checks_total", "deploy_check.checks_passed",
]);
const FORBIDDEN_KEYS = new Set(["vol_ratio", "provider", "providers", "method", "note", "statement", "close_source", "adv_source", "jwk", "x", "d"]);
// Provider and third-party forms (the audit list): never on the data file or on a Bell storefront source.
const PROVIDER_FORMS = [/\bmassive\b/i, /databento/i, /polygon/i, /POLYGON_API_KEY/, /helius/i, /chainstack/i, /tenderly/i, /drpc/i, /chainlink/i, /network firm/i, /hostinger/i, /\bpocket\b/i];
const SCANNED = [BELL_SERVED_REL, ...PAGES, "apps/site/app/bell/anchors/page.tsx", "apps/site/components/bell/anchors-table.tsx", "apps/site/lib/bell-served-load.ts", "apps/site/lib/bell-method.ts", "apps/site/lib/bell-anchors-load.ts",
  "apps/site/components/bell/publication-anchors-table.tsx", "apps/site/lib/bell-publications-load.ts", "apps/site/public/bell/anchors/publications.json"];

function walkJson(v: unknown, path: string, onNumber: (p: string) => void, onKey: (k: string, p: string) => void): void {
  if (typeof v === "number") onNumber(path);
  else if (Array.isArray(v)) v.forEach((x: unknown) => { walkJson(x, `${path}[]`, onNumber, onKey); });
  else if (v !== null && typeof v === "object") {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      onKey(k, path);
      walkJson(x, path === "" ? k : `${path}.${k}`, onNumber, onKey);
    }
  }
}

test("bell_served_data_carries_no_market_value", () => {
  const raw = readFileSync(join(ROOT, BELL_SERVED_REL), "utf8");
  const numbers: string[] = [];
  const badKeys: string[] = [];
  const data = JSON.parse(raw) as unknown;
  walkJson(data, "", (p) => numbers.push(p), (k, p) => { if (FORBIDDEN_KEYS.has(k) && !p.startsWith("served_schema.objects")) badKeys.push(`${p}.${k}`); });
  assert.deepEqual(numbers.filter((p) => !NUMBER_PATHS.has(p)), [], "a number outside the count / instant / identifier paths (a market value must stay a served string)");
  assert.ok(numbers.includes("head.runs[].sessions[].n") && numbers.includes("head.runs[].residuals.no_close_ref"), "non-vacuity: counts are walked");
  assert.deepEqual(badKeys, [], "a key the site never carries (ratio value, provider label, reserves method or note, key material)");
  const d = loadBellServed(ROOT);
  for (const r of d.head.runs) for (const s of r.sessions) {
    assert.equal(typeof s.vwap, "string");
    assert.equal(typeof s.volumeBase, "string");
  }
  // The key material: the committed (= served) public key is linked, never copied (ADR-T1b-backend D9 C-10).
  const x = readJson<{ keys: Array<{ jwk: { x: string } }> }>("apps/bell/keys/bell-keyring.json").keys[0]?.jwk.x ?? "";
  assert.ok(x.length > 20, "non-vacuity: the committed public key is read");
  for (const rel of SCANNED) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    assert.ok(!text.includes(x), `${rel} carries a copy of the public key (the site links its one URL)`);
    for (const re of PROVIDER_FORMS) assert.ok(!re.test(text), `${rel} names a data provider or a third party (${String(re)})`);
  }
  // Positive controls: each form is load-bearing on the served provenance bytes the sync reads and drops.
  const servedProvenanceLabels = ["databento", "helius", "chainstack"];
  for (const label of servedProvenanceLabels) assert.ok(PROVIDER_FORMS.some((re) => re.test(label)), `the scan catches ${label}`);
});

test("bell_served_loader_is_fail_closed", () => {
  const tmp = mkdtempSync(join(tmpdir(), "bell-served-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const good = readFileSync(join(ROOT, BELL_SERVED_REL), "utf8");
    const manifest = readJson<{ files: Record<string, string> }>(MANIFEST_REL);
    const put = (body: string, listed: boolean): void => {
      writeFileSync(join(tmp, BELL_SERVED_REL), body);
      const files = { ...manifest.files };
      if (listed) files[BELL_SERVED_REL] = sha(Buffer.from(body.replace(/\r\n/g, "\n"), "utf8"));
      else delete files[BELL_SERVED_REL];
      writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify({ algorithm: "sha256", files }));
    };
    put(good, true);
    assert.deepEqual(loadBellServed(tmp, RESIDUAL_CODES).first_record, PINNED_FIRST, "control: an intact copy loads");
    writeFileSync(join(tmp, BELL_SERVED_REL), good.replace(PINNED_FIRST.published_at, "2026-09-23T21:35:53.438Z"));
    assert.throws(() => loadBellServed(tmp), /sha256 mismatch/, "a tampered file with the old manifest hash throws");
    put(good, false);
    assert.throws(() => loadBellServed(tmp), /not listed/, "an unlisted file throws");
    type File = Record<string, unknown> & { first_record: Record<string, unknown>; head: Record<string, unknown> & { runs: Array<Record<string, unknown> & { volume: Array<Record<string, unknown>>; por: Array<Record<string, unknown>>; residuals: Record<string, number> }> } };
    const d = JSON.parse(good) as File;
    const run0 = d.head.runs[0];
    assert.ok(run0 !== undefined);
    const withRun = (r: Record<string, unknown>): string => JSON.stringify({ ...d, head: { ...d.head, runs: [r] } });
    put(JSON.stringify({ ...d, first_record: { ...d.first_record, seq: 0 } }), true);
    assert.throws(() => loadBellServed(tmp), /seq/, "a non-positive seq throws even when hashed");
    put(JSON.stringify({ ...d, first_record: { ...d.first_record, key_id: "not-hex" } }), true);
    assert.throws(() => loadBellServed(tmp), /key_id/, "a malformed key_id throws");
    put(withRun({ ...run0, volume: run0.volume.map((v) => ({ ...v, vol_ratio: "0.0000018781" })) }), true);
    assert.throws(() => loadBellServed(tmp), /unknown key \{vol_ratio\}/, "a volume-ratio value throws even when hashed (display suspended)");
    put(withRun({ ...run0, por: run0.por.map((p) => ({ ...p, method: "a named attestation firm" })) }), true);
    assert.throws(() => loadBellServed(tmp), /unknown key/, "a proof-of-reserves method throws even when hashed");
    put(withRun({ ...run0, volume: run0.volume.slice(1) }), true);
    assert.throws(() => loadBellServed(tmp), /pair one to one/, "a session row without its volume entry throws even when hashed");
    put(withRun({ ...run0, volume: [...run0.volume].reverse() }), true);
    assert.throws(() => loadBellServed(tmp), /does not pair/, "volume entries out of the session order throw even when hashed");
    const { no_adv: _dropped, ...fewer } = run0.residuals;
    void _dropped;
    put(withRun({ ...run0, residuals: fewer }), true);
    assert.throws(() => loadBellServed(tmp, RESIDUAL_CODES), /closed list/, "a run that does not count every residual code throws");
    put(JSON.stringify({ ...d, extra: 1 }), true);
    assert.throws(() => loadBellServed(tmp), /exactly/, "an extra top-level key throws");
    // lines[] (v4): each mutant is hashed into the manifest, so only the loader's own checks refuse it (L-2..L-8; L-1 is in the build test).
    type Line = Record<string, unknown>;
    const L = (d as unknown as { lines: Line[] }).lines, tl = d.timeline as Record<string, unknown>, at1 = (f: (l: Line) => Line): Line[] => L.map((l, i) => (i === 1 ? f(l) : l));
    const third = { seq: 3, kind: "publication", line_hash: "c".repeat(64), prev_line_hash: L[1]?.line_hash, state_sha256: "d".repeat(64), provenance_sha256: "e".repeat(64) };
    const noState = (l: Line): Line => Object.fromEntries(Object.entries(l).filter(([k]) => k !== "state_sha256"));
    for (const [lines, timeline, re, why] of [
      [at1((l) => ({ ...l, prev_line_hash: "0".repeat(64) })), tl, /lines\[1\] is not chained/, "L-2 a prev_line_hash that is not the line_hash before it"],
      [at1((l) => ({ ...l, seq: 3 })), tl, /lines\[1\] must be line 2/, "L-3 a gap in seq"],
      [at1((l) => ({ seq: 2, kind: "note", line_hash: l.line_hash, prev_line_hash: l.prev_line_hash })), tl, /lines\[1\] must be line 2, of a closed kind/, "L-3 bis a kind outside the closed list"],
      [at1((l) => ({ ...l, line_hash: "a".repeat(64) })), tl, /facts of the first record and of the head/, "L-4 the head's line_hash differs"],
      [at1(noState), tl, /lines\[1\] must carry exactly/, "L-5 a publication without state_sha256"],
      [at1((l) => ({ ...l, kind: "key_rotation" })), tl, /lines\[1\] must carry exactly/, "L-6 a key line with state_sha256"],
      [[...L, third], { ...tl, lines: 3, publications: 3 }, /publication line follows the head/, "L-7 a publication after the head"],
      [L, { ...tl, lines: 3 }, /count the timeline's lines/, "L-8 fewer lines than the timeline counts"],
      [L, { ...tl, publications: 1 }, /count the timeline's lines and publications/, "L-8 bis more publication lines than the timeline counts"],
    ] as const) {
      put(JSON.stringify({ ...d, timeline, lines }), true);
      assert.throws(() => loadBellServed(tmp), re, `${why} throws even when hashed`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ── The projection on a two-line signed fixture ──
const T1 = "2026-09-23T21:35:52.438Z", T2 = "2026-09-24T01:00:00.000Z";
const W = { from_utc_ms: 1789545600000, to_utc_ms: 1789631999000 };
const PD = "5aMNNLQJwAEeoemTEMkv5NVjqKwvvefRYCQ5Z67HFvEq";
function residuals(nonZero: Record<string, number>): Record<string, number> {
  return Object.fromEntries(RESIDUAL_CODES.map((c) => [c, nonZero[c] ?? 0]));
}
function stateRun(symbol: string, bellSha: string, gap: boolean): Record<string, unknown> {
  const r = residuals(gap ? { quorum_sampled: 1 } : { no_close_ref: 1, quorum_sampled: 1 });
  const g = gap
    ? { symbol, session: "after", regime: null, vwap: "1.5000000000", volumeBase: "2.0000000000", n: 3, gT: "0.0123000000", exceed1: 1, exceed2: 0, exceed5: 0, earliest_publish_utc: 1789700000000, cash_cross: "matched" }
    : { symbol, session: "after", regime: null, vwap: "1.5000000000", volumeBase: "2.0000000000", n: 3, abstain: "no_close_ref" };
  return {
    schema: "bell-state-v1", bell_sha: bellSha, window: W, residuals: r,
    digest: {
      schema: "bell-digest-v1", gaps: [g], halt_census: { total: 0, empty_resume: 0 }, residuals: r,
      volume: [{ symbol, session: "after", regime: null, session_date_et: "2026-09-16", window: { from_utc_ms: W.from_utc_ms + 1000, to_utc_ms: W.from_utc_ms + 2000 },
        adv_period: { year: 2026, month: 8 }, n: 3, n_bars: 21, n_trading_days: 21, formula: "a served formula", vol_ratio: "0.0000123456", multiplier_unit: false }],
      supply: [{ symbol, supply: "100000000", decimals: 8, multiplier: "1", paused: false, permanent_delegate: symbol === "SPYx" ? null : PD }],
      por: [{ symbol, kind: "unavailable", method: "a named attestation firm", note: "a named oracle stream [lu]" }],
      wrapper: [{ symbol, contracts: [], residue: "no_wrapper" }],
    },
  };
}
function provRun(bellSha: string): Record<string, unknown> {
  return { bellSha, generatedAt: "2026-09-23T17:08:22.496Z", sources: { generated_at: "2026-09-23T17:08:22.496Z", cash_request_digest: "c".repeat(64) },
    providers: { providers: ["operator-a", "operator-b"], quorum_required: 2, providers_distinct: 2, faults: [{ provider: "cash-source-label", status: "HTTP 400" }, { provider: "operator-a", status: "HTTP 429" }] } };
}
function fixture(): { input: Parameters<typeof buildBellServed>[0]; lines: Array<Record<string, unknown>>; states: string[] } {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const keyring = keyringOf(publicKey, 1);
  const keyBytes = Buffer.from(canonical(keyring) + "\n");
  const keyId = keyring.keys[0]?.key_id ?? "";
  const pubs = [
    { published_at: T1, runs: [{ symbol: "TSLAx", sha: "a".repeat(64), gap: false }] },
    { published_at: T2, runs: [{ symbol: "AAPLx", sha: "b".repeat(64), gap: true }, { symbol: "SPYx", sha: "e".repeat(64), gap: false }] },
  ];
  const lines: Array<Record<string, unknown>> = [];
  const states: string[] = [];
  const provs: string[] = [];
  pubs.forEach((p, i) => {
    const seq = i + 1;
    const stateText = canonical({ schema: "bell-public-state-v1", seq, published_at: p.published_at, runs: p.runs.map((r) => stateRun(r.symbol, r.sha, r.gap)) }) + "\n";
    const provText = canonical({ schema: "bell-public-provenance-v1", seq, published_at: p.published_at, runs: p.runs.map((r) => provRun(r.sha)) }) + "\n";
    const prev = lines[i - 1];
    const line: Record<string, unknown> = {
      schema: "bell-timeline-v1", seq, kind: "publication", published_at: p.published_at, prev_line_hash: prev === undefined ? GENESIS : lineHash(prev), key_id: keyId,
      state_sha256: sha(stateText), provenance_sha256: sha(provText),
      runs: p.runs.map((r) => ({ bell_sha: r.sha, window: W, records: [{ symbol: r.symbol, chain: "solana", n_fills: 3, sessions: 1, quorum_coverage: 0.5, prev_line_hash: GENESIS }] })),
    };
    line.sig = signLine(line, privateKey);
    lines.push(line);
    states.push(stateText);
    provs.push(provText);
  });
  const timeline = Buffer.from(lines.map((l) => canonical(l) + "\n").join(""));
  const head = Buffer.from(states[1] ?? ""), provenance = Buffer.from(provs[1] ?? "");
  const deployCheck = { url: BELL_HOST, checked_at: "2026-09-24T01:05:00.000Z", tls: { authorized: true }, checks: [{ name: "c01", ok: true }, { name: "c02", ok: true }],
    bodies_sha256: { "/timeline.jsonl": sha(timeline), "/bell/pubkey.json": sha(keyBytes), "/state.json": sha(head), "/provenance.json": sha(provenance) } };
  return {
    lines, states,
    input: {
      readAt: "2026-09-24T01:10:00.000Z", timeline, pubkey: keyBytes, state: head, provenance, headStateImmutable: head,
      firstStateImmutable: Buffer.from(states[0] ?? ""), committedKeyring: keyBytes, deployCheck,
      collectorRevision: { commit: "f".repeat(40), committed_at: "2026-09-23T13:05:58.000Z" }, whitelist: WHITELIST,
    },
  };
}
interface Built {
  first_record: { seq: number; line_hash: string; symbols: string[] };
  head: { seq: number; line_hash: string; prev_line_hash: string; runs: Array<{ bell_sha: string; records: Array<{ symbol: string; quorum_coverage: string | null }>; volume: Array<Record<string, unknown>>; por: Array<Record<string, unknown>>; provenance: { faults: Array<{ status: string; ledger_operator: boolean }>; cash_request_digest: string | null } }> };
  timeline: { lines: number; publications: number };
  lines: unknown[];
  served_schema: { objects: unknown };
}

test("bell_served_build_binds_the_latest_publication_not_the_first", () => {
  const f = fixture();
  const first = f.lines[0] ?? {}, second = f.lines[1] ?? {};
  // The fixture discriminates: the v1/v2 sync bound /state.json to the FIRST line, which this served state is not.
  assert.notEqual(sha(f.input.state), first.state_sha256, "fixture: the current state is not the first line's");
  const out = buildBellServed(f.input, CHAIN) as unknown as Built;
  assert.equal(out.timeline.lines, 2);
  assert.equal(out.timeline.publications, 2);
  // L-1: lines[] = the facts of every walked line, recomputed here from the signed fixture lines (state and provenance: publications only).
  assert.deepEqual(out.lines, f.lines.map((l) => ({ seq: l.seq, kind: l.kind, line_hash: lineHash(l), prev_line_hash: l.prev_line_hash, state_sha256: l.state_sha256, provenance_sha256: l.provenance_sha256 })), "lines[] equals a recomputation");
  assert.equal(out.first_record.seq, 1);
  assert.equal(out.first_record.line_hash, lineHash(first));
  assert.deepEqual(out.first_record.symbols, ["TSLAx"]);
  assert.equal(out.head.seq, 2, "the head is the latest publication");
  assert.equal(out.head.line_hash, lineHash(second));
  assert.equal(out.head.prev_line_hash, lineHash(first), "the head is chained to the first line");
  assert.deepEqual(out.head.runs.map((r) => r.records[0]?.symbol), ["AAPLx", "SPYx"], "every run of the latest publication is copied");
  assert.equal(out.head.runs[0]?.records[0]?.quorum_coverage, "0.5", "the coverage ratio stays a string");
  // Read and dropped: the ratio value, the reserves method and note, the provider labels (the served_schema block names
  // the publisher's KEYS, vol_ratio among them, and no value: it is left out of this scan and pinned to WHITELIST below).
  const { served_schema: schemaBlock, ...values } = out;
  const text = JSON.stringify(values);
  for (const gone of ["vol_ratio", "0.0000123456", "a named attestation firm", "a named oracle stream", "[lu]", "cash-source-label", "operator-a", "operator-b"]) {
    assert.equal(text.indexOf(gone), -1, `${gone} is carried by the built file`);
  }
  assert.ok(JSON.stringify(schemaBlock).includes("vol_ratio"), "non-vacuity: the key is in the publisher's closed list");
  assert.ok(out.head.runs.every((r) => r.volume.every((v) => !Object.hasOwn(v, "vol_ratio"))), "no volume entry carries a ratio value");
  assert.deepEqual(out.head.runs[0]?.por, [{ symbol: "AAPLx", kind: "unavailable" }], "the reserves status only");
  assert.deepEqual(out.head.runs[0]?.provenance.faults, [{ status: "HTTP 400", ledger_operator: false }, { status: "HTTP 429", ledger_operator: true }], "fault statuses classified, labels dropped");
  assert.deepEqual(schemaBlock.objects, JSON.parse(JSON.stringify(WHITELIST)) as unknown, "the served schema block is the publisher's closed list");
  // Round trip through the build-time loader (closed shape, every residual code counted).
  const tmp = mkdtempSync(join(tmpdir(), "bell-built-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const body = JSON.stringify(out, null, 2) + "\n";
    writeFileSync(join(tmp, BELL_SERVED_REL), body);
    writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify({ algorithm: "sha256", files: { [BELL_SERVED_REL]: sha(body) } }));
    const loaded = loadBellServed(tmp, RESIDUAL_CODES);
    assert.equal(loaded.head.runs[0]?.sessions[0]?.gT, "0.0123000000");
    assert.deepEqual(loaded.head.runs[0]?.sessions[0]?.exceed, [{ threshold: 1, exceeded: 1 }, { threshold: 2, exceeded: 0 }, { threshold: 5, exceeded: 0 }]);
    assert.equal(loaded.head.runs[1]?.sessions[0]?.abstain, "no_close_ref");
    assert.equal(loaded.head.runs[0]?.supply[0]?.permanent_delegate, PD, "a mint with a permanent-delegate authority");
    assert.equal(loaded.head.runs[1]?.supply[0]?.permanent_delegate, null, "a mint without one loads as null (collector MintReadout: string | null)");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("bell_served_build_is_fail_closed", () => {
  const f = fixture();
  assert.throws(() => buildBellServed({ ...f.input, state: Buffer.from(f.states[0] ?? ""), headStateImmutable: Buffer.from(f.states[0] ?? "") }, CHAIN), /latest signed line/, "the first line's state served as current is refused");
  const tampered = f.lines.map((l, i) => (i === 1 ? { ...l, published_at: "2026-09-24T01:00:01.000Z" } : l));
  const tl = Buffer.from(tampered.map((l) => canonical(l) + "\n").join(""));
  assert.throws(() => buildBellServed({ ...f.input, timeline: tl }, CHAIN), /does not walk/, "an edited signed line is refused");
  const staleCa = { ...(f.input.deployCheck as Record<string, unknown>), bodies_sha256: { ...((f.input.deployCheck as { bodies_sha256: Record<string, string> }).bodies_sha256), "/state.json": "0".repeat(64) } };
  assert.throws(() => buildBellServed({ ...f.input, deployCheck: staleCa }, CHAIN), /deploy check was captured on another/, "a deploy check of other bodies is refused");
  assert.throws(() => buildBellServed({ ...f.input, pubkey: Buffer.from(f.input.pubkey.toString() + " ") }, CHAIN), /byte-identical/, "a served key set other than the committed keyring is refused");
  const wl = { ...WHITELIST, gap: { ...WHITELIST.gap } };
  delete (wl.gap as Record<string, unknown>).cash_cross;
  assert.throws(() => buildBellServed({ ...f.input, whitelist: wl }, CHAIN), /does not know: cash_cross/, "a served key outside the closed list is refused, never carried");
});

test("bell_served_projection_matches_the_publisher_closed_list", () => {
  const keys = (name: string): string[] => Object.keys(WHITELIST[name] ?? {}).sort();
  assert.deepEqual([...BELL_SESSION_KEYS].sort(), keys("gap"), "session rows carry every key of the served gap object");
  assert.deepEqual([...BELL_VOLUME_KEYS, ...BELL_VOLUME_DROPPED].sort(), keys("volume"), "volume entries = the served volume object minus the ratio value");
  assert.deepEqual([...BELL_VOLUME_DROPPED], ["vol_ratio"]);
  assert.deepEqual([...BELL_SUPPLY_KEYS].sort(), keys("supply"));
  assert.deepEqual([...BELL_WRAPPER_KEYS].sort(), keys("wrapper"));
  assert.deepEqual([...BELL_HALT_DELTA_KEYS].sort(), keys("halt_deltas"));
  assert.deepEqual([...BELL_RECORD_KEYS].sort(), keys("record"));
  assert.ok(BELL_POR_KEYS.every((k) => keys("por").includes(k)), "reserves keys copied are served keys");
  for (const k of ["method", "note", "statement"]) assert.ok(!(BELL_POR_KEYS as readonly string[]).includes(k), `the reserves ${k} is never copied`);
  const d = loadBellServed(ROOT, RESIDUAL_CODES);
  assert.deepEqual(d.served_schema.objects, JSON.parse(JSON.stringify(WHITELIST)) as unknown, "the served schema block = WHITELIST");
  for (const r of d.head.runs) assert.deepEqual(Object.keys(r.residuals).sort(), [...RESIDUAL_CODES].sort(), "each run counts exactly the collector's residual codes");
  // Thresholds derive from the exceed<k> keys (METHOD-THRESHOLDS-1): mutant = drop exceed2, the two-percent threshold goes.
  assert.deepEqual(thresholdsOf(keys("gap")), [1, 2, 5]);
  assert.deepEqual(thresholdsOf(keys("gap").filter((k) => k !== "exceed2")), [1, 5]);
  assert.deepEqual(thresholdsOf(Object.keys(d.served_schema.objects.gap ?? {})), [1, 2, 5]);
  // The supply readout is shifted by its decimals with exact string arithmetic.
  assert.equal(shiftDecimal("22963671522680", 8), "229636.71522680");
  assert.equal(shiftDecimal("5", 3), "0.005");
  assert.equal(shiftDecimal("0012", 0), "12");
  assert.throws(() => shiftDecimal("1.5", 2));
});

test("bell_pages_render_served_values_never_typed", () => {
  const d = loadBellServed(ROOT);
  const run = d.head.runs[0];
  assert.ok(run !== undefined);
  const literals = [
    d.first_record.published_at, d.first_record.line_hash, d.head.key_id, d.head.state_sha256, d.head.provenance_sha256, d.head.sig, d.read_at,
    ...Object.values(d.bodies_sha256), run.bell_sha, run.provenance.cash_request_digest ?? "", run.provenance.generated_at,
    ...run.sessions.flatMap((s) => [s.vwap, s.volumeBase]), ...run.supply.flatMap((s) => [s.supply, s.permanent_delegate ?? ""]),
    ...run.records.flatMap((r) => [r.quorum_coverage ?? ""]), ...run.volume.map((v) => v.formula), d.collector_revision.commit.slice(0, 7),
    d.deploy_check.checked_at,
  ].filter((x) => x.length > 0);
  for (const rel of PAGES) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    assert.match(text, /loadBellServed\(/, `${rel} must read the served facts through loadBellServed`);
    for (const lit of literals) assert.ok(!text.includes(lit), `${rel} types a served value by hand: ${lit}`);
    // Stale placeholders of values that are served (B02, B03, B13, B46) and the unserved residual_total (B07) are gone.
    for (const stale of ["bell_sha_latest", "window_ratio", 'name="adv_period"', 'name="n_bars"', "method_version", "method_date", "method_commit", "residual_total", "in review"]) {
      assert.ok(!text.includes(stale), `${rel} still carries ${stale}`);
    }
  }
  const bell = readFileSync(join(ROOT, PAGES[0] ?? ""), "utf8");
  const method = readFileSync(join(ROOT, PAGES[1] ?? ""), "utf8");
  assert.match(bell, /bellStatePathOf\(head\.state_sha256\)/, "/bell links the immutable state by its loaded digest");
  assert.match(bell, /head\.runs|runs\.map\(\(run\) =>/, "/bell renders every run of the latest publication");
  assert.match(bell, /publicationAnchorState\(served\.head, served\.lines, /, "/bell derives the latest record's timestamp state from the bound publication rows");
  assert.match(method, /r\.bell_sha/, "/bell/method renders the published digests by property access (B02)");
  assert.match(method, /thresholdsOf\(/, "/bell/method derives the thresholds from the served schema (B22)");
  assert.match(method, /\{schemaText\}/, "/bell/method renders the served schema block (B21)");
  assert.ok(!/one percent and five percent/.test(method), "the two typed thresholds are gone (METHOD-THRESHOLDS-1)");
});

test("bell_served_session_rows_pair_by_index — two same-named sessions on two dates keep their own dates", () => {
  type Row = Record<string, unknown>;
  type File = Record<string, unknown> & { head: Record<string, unknown> & { runs: Array<Row & { window: { from_utc_ms: number; to_utc_ms: number }; records: Row[]; sessions: Row[]; volume: Array<Row & { window: { from_utc_ms: number; to_utc_ms: number } }> }> } };
  const d = JSON.parse(readFileSync(join(ROOT, BELL_SERVED_REL), "utf8")) as File;
  const run0 = d.head.runs[0];
  assert.ok(run0 !== undefined);
  const gap = run0.sessions.find((s) => s.session === "after");
  const vol = run0.volume.find((v) => v.session === "after");
  const rec = run0.records[0];
  assert.ok(gap !== undefined && vol !== undefined && rec !== undefined, "fixture: the served record has an after session");
  const DAY = 86_400_000;
  // The collector groups by (session, regime, session date): two "after" groups of one instrument on two dates.
  const earlier = { ...vol, n: 1, session_date_et: "2026-09-15", window: { from_utc_ms: vol.window.from_utc_ms - DAY, to_utc_ms: vol.window.to_utc_ms - DAY } };
  const run = {
    ...run0,
    window: { from_utc_ms: run0.window.from_utc_ms - DAY, to_utc_ms: run0.window.to_utc_ms },
    records: [{ ...rec, sessions: 2, n_fills: Number(gap.n) + 1 }],
    sessions: [gap, { ...gap, n: 1 }],
    volume: [vol, earlier],
  };
  const tmp = mkdtempSync(join(tmpdir(), "bell-pair-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const body = JSON.stringify({ ...d, head: { ...d.head, runs: [run] } }, null, 2) + "\n";
    writeFileSync(join(tmp, BELL_SERVED_REL), body);
    writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify({ algorithm: "sha256", files: { [BELL_SERVED_REL]: sha(body) } }));
    const loaded = loadBellServed(tmp, RESIDUAL_CODES).head.runs[0];
    assert.ok(loaded !== undefined);
    const rows = sessionRowsOf(loaded);
    assert.deepEqual(rows.map((r) => [r.session.session, r.session.n, r.volume.session_date_et]), [["after", gap.n, vol.session_date_et], ["after", 1, "2026-09-15"]], "each row keeps the date of its own group");
    // The fixture discriminates: a join on (symbol, session, regime) attaches the first group's date to both rows.
    const byName = loaded.sessions.map((s) => loaded.volume.find((v) => v.symbol === s.symbol && v.session === s.session && v.regime === s.regime)?.session_date_et);
    assert.deepEqual(byName, [vol.session_date_et, vol.session_date_et], "control: the name join would repeat the first date");
    assert.equal(new Set(rows.map((r) => `${r.session.symbol}-${r.session.session}-${r.session.regime ?? ""}-${r.volume.session_date_et}`)).size, 2, "the row keys stay distinct");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  const bell = readFileSync(join(ROOT, PAGES[0] ?? ""), "utf8");
  assert.match(bell, /sessionRowsOf\(run\)\.map/, "/bell pairs the rows through the loader's pairing");
  assert.ok(!/run\.volume\.find\(/.test(bell), "/bell no longer joins a row to a volume entry by name");
});

test("bell_pages_state_the_record_literally — no licence of Bell's own, no contradicted absolute, served facts dated", () => {
  const norm = (s: string): string => s.replace(/&rsquo;/g, "'").replace(/\s+/g, " ");
  const bell = norm(readFileSync(join(ROOT, PAGES[0] ?? ""), "utf8"));
  const method = norm(readFileSync(join(ROOT, PAGES[1] ?? ""), "utf8"));
  for (const [rel, text] of [[PAGES[0] ?? "", bell], [PAGES[1] ?? "", method]] as const) {
    // A licence is named only as the reader's own (the replay condition), never as a status of Bell's reads.
    const all = text.match(/\blicen[cs]\w*/gi) ?? [];
    const own = text.match(/\bown (?:reference-close )?licen[cs]\w*/gi) ?? [];
    assert.ok(all.length > 0, `${rel}: non-vacuity, the reader's licence is named`);
    assert.equal(own.length, all.length, `${rel}: a licence is named other than the reader's own`);
    // The served record carries ratio values (not rendered): the pages state which fields the record has, never "never carried".
    for (const stale of ["never carried", "is never carried", "never a closing price or a consolidated volume", "read under licence and", "served gap schema", "read from the served state.json", "ollection window", "founding enumeration", "outside the ledger reads"]) {
      assert.ok(!text.includes(stale), `${rel} still says "${stale}"`);
    }
    assert.match(text, /\{served\.read_at\}/, `${rel} dates the served facts by the instant they were read`);
    assert.match(text, /abstentionsOf\(/, `${rel} states the abstentions from the served rows`);
  }
  assert.ok(bell.includes("it has no closing-price field and no consolidated-volume field, and the ratio values it carries are not rendered on this site"));
  assert.ok(bell.includes("it has no closing-price or consolidated-volume field"));
  assert.ok(method.includes("The record has no consolidated-volume field"));
  assert.ok(method.includes("The record has no closing-price field"));
  // "No closing price is read" is said only when every row abstains with no_close_ref, never inferred from the absence of a gap.
  assert.match(bell, /const allNoClose = sessions\.length > 0 && noClose\.length === sessions\.length;/);
  assert.match(method, /const allNoClose = sessions\.length > 0 && sessions\.every\(\(x\) => x\.abstain === "no_close_ref"\);/);
  // A residual counter is read or the page throws: no typed default count in a rendered position.
  assert.ok(!/residuals\[[^\]]+\] \?\? 0/.test(method), "/bell/method never renders a default count for a missing counter");
  assert.match(method, /String\(countOf\(run, r\.code\)\)/);
  // The closing-price request line no longer carries a fault count (faults of other reads land in the same list).
  assert.ok(!/cash_request_digest\}<\/span> \{outside/.test(bell), "the closing-price request line carries no fault count");
  // abstentionsOf states the served counts, first seen first.
  const row = (abstain: string | null): Parameters<typeof abstentionsOf>[0][number] => ({ symbol: "S", session: "after", regime: null, n: 1, vwap: "1", volumeBase: "1", abstain, gT: abstain === null ? "0.1" : null, exceed: [], earliest_publish_utc: null, cash_cross: null, multiplierUsed: null, rebase_residuals: [] });
  assert.deepEqual(abstentionsOf([row("no_close_ref"), row("rebase_unverified"), row("no_close_ref"), row(null)]), ["2 with no_close_ref", "1 with rebase_unverified"]);
});
