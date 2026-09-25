/**
 * Root tests of the timestamp state of the latest published Bell record (ADR-BELL-OTS-PRB T-B7 and the pilot of T-B9). T-1 derives the
 * state from bound rows built here (no proof bytes: statuses are objects), one assertion per named mutant of the ADR (M-1..M-4, M-7,
 * M-7 bis, M-8, M-9) and the sentences S-0..S-3 of its §4.3 word for word; the pilot drives the rendered-page assertions of
 * scripts/assert-fleet-html.mjs on synthetic HTML (M-6, M-10, M-11, M-12). Offline, non-LLM, run by `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publicationAnchorState, publicationAnchorSentence, latestAnchoredLine, type BoundPublicationRow, type PublicationKind, type TimelineLineFacts } from "../apps/site/lib/bell-anchors.ts";
import { assertBellAnchorBody, assertBellPublicationsTable, bellStatusText } from "../scripts/assert-fleet-html.mjs";

const H = (c: string): string => c.repeat(64);
// lines[]: publication 1, publication 2 (the head), key_rotation 3, chained from the genesis value.
const LINES: TimelineLineFacts[] = [
  { seq: 1, kind: "publication", line_hash: H("1"), prev_line_hash: H("0"), state_sha256: H("a"), provenance_sha256: H("b") },
  { seq: 2, kind: "publication", line_hash: H("2"), prev_line_hash: H("1"), state_sha256: H("c"), provenance_sha256: H("d") },
  { seq: 3, kind: "key_rotation", line_hash: H("3"), prev_line_hash: H("2") },
];
const HEAD = { seq: 2, line_hash: H("2") };
/** A bound row of line `seq`: its manifest's two timeline entries (the line key carries `lineHash`, the line's own by default). */
function row(seq: number, o: { heights?: number[]; key?: string; lineHash?: string; date?: string } = {}): BoundPublicationRow {
  const l = LINES[seq - 1], lineHash = o.lineHash ?? l?.line_hash ?? "";
  return {
    row: { date_utc: o.date ?? `2026-09-2${String(seq)}T13:37:02Z`, seq, kind: (l?.kind ?? "publication") as PublicationKind, line_hash: lineHash, prefix_sha256: H("f"),
      manifest_sha256: H("e"), commit: "694e98b", manifest_file: `timeline-seq${String(seq)}-manifest.txt`, proof_file: `timeline-seq${String(seq)}-manifest.txt.ots` },
    entries: [{ relpath: `timeline.jsonl#L1-L${String(seq)}`, digest: H("f") }, { relpath: o.key ?? `timeline.jsonl#L${String(seq)}`, digest: lineHash }],
    status: { bitcoinHeights: o.heights ?? [], pendingCalendars: ["https://calendar.invalid"] },
  };
}
const st = (bound: BoundPublicationRow[], lines: TimelineLineFacts[] = LINES) => publicationAnchorState(HEAD, lines, bound);

test("bell_publication_anchor_state_is_derived_strictly — M-1..M-4, M-7, M-7 bis, M-8, M-9 and the sentences S-0..S-3 (T-1)", () => {
  const TAIL = "the record's line and every line before it existed before that block; read from the file when this page was built, not checked against a node here";
  const pending = st([row(2)]), anchored = st([row(2, { heights: [968300, 968400] })]);
  assert.deepEqual(pending, { head_seq: 2, latestAnchoredSeq: null, state: "pending", via_seq: 2, date_utc: "2026-09-22T13:37:02Z" }, "M-2: calendars only: pending, never anchored");
  assert.equal(publicationAnchorSentence(pending), "submitted for a timestamp on 2026-09-22 13:37:02 UTC; the proof is pending: it records calendars, no Bitcoin block yet");
  assert.deepEqual(anchored, { head_seq: 2, latestAnchoredSeq: 2, state: "anchored", via_seq: 2, date_utc: "2026-09-22T13:37:02Z", earliestHeight: 968300, blockRecords: 2 });
  assert.equal(publicationAnchorSentence(anchored), `anchored: the proof file records Bitcoin block 968300, the earliest of 2; ${TAIL}`);
  // M-1: the manifest lists the head's state file but not its line: none (a rule on any listed digest would have counted it).
  const m1 = st([{ ...row(2, { heights: [1] }), entries: [{ relpath: `states/${H("c")}.json`, digest: H("c") }] }]);
  assert.deepEqual([m1.state, publicationAnchorSentence(m1)], ["none", "none: no anchor manifest lists the latest record's digests; it is signed and chained, not timestamp-anchored"]);
  assert.equal(st([row(2, { heights: [1], lineHash: H("1") })]).state, "none", "M-3: the line key carries another line's hash");
  assert.equal(st([row(2, { heights: [1], key: "timeline.jsonl#L1" })]).state, "none", "M-3 bis: the head's hash under another line's key");
  // M-4: a row before the head never counts for it; latestAnchoredSeq says how far the earlier lines are, with a block only.
  assert.deepEqual([st([row(1, { heights: [1] })]).state, st([row(1, { heights: [1] })]).latestAnchoredSeq], ["none", 1], "M-4 with a block");
  assert.deepEqual([st([row(1)]).state, st([row(1)]).latestAnchoredSeq], ["none", null], "M-4 without a block");
  // M-7: a key line after the head, chained to it, with a block, and no row for the head: anchored through that line.
  const m7 = st([row(3, { heights: [5] })]);
  assert.deepEqual(m7, { head_seq: 2, latestAnchoredSeq: 3, state: "anchored", via_seq: 3, date_utc: "2026-09-23T13:37:02Z", earliestHeight: 5, blockRecords: 1 });
  assert.equal(publicationAnchorSentence(m7), `anchored through a later line of the same chain (line 3), which carries this record's line by its hash: the proof file records Bitcoin block 5; ${TAIL}`);
  const later = st([row(3)]);
  assert.equal(publicationAnchorSentence(later), "submitted for a timestamp on 2026-09-23 13:37:02 UTC through a later line of the same chain (line 3), which carries this record's line by its hash; the proof is pending: it records calendars, no Bitcoin block yet");
  assert.equal(st([row(3, { heights: [5] })], LINES.map((l) => (l.seq === 3 ? { ...l, prev_line_hash: H("9") } : l))).state, "none", "M-7 bis: the chain is broken between the head and the row");
  assert.throws(() => st([row(2)], LINES.map((l) => (l.seq === 3 ? { ...l, kind: "publication" } : l))), /not a key line/, "M-8: a publication after the head throws");
  // M-9: the earliest height over every counted row and the row that carries it; pending: the oldest counted row (seq, then date).
  assert.deepEqual(st([row(2, { heights: [900] }), row(3, { heights: [800, 950] })]), { head_seq: 2, latestAnchoredSeq: 3, state: "anchored", via_seq: 3, date_utc: "2026-09-23T13:37:02Z", earliestHeight: 800, blockRecords: 2 });
  assert.deepEqual(st([row(3), row(2, { date: "2026-09-25T00:00:00Z" }), row(2, { date: "2026-09-24T00:00:00Z" })]), { head_seq: 2, latestAnchoredSeq: null, state: "pending", via_seq: 2, date_utc: "2026-09-24T00:00:00Z" });
  assert.deepEqual([latestAnchoredLine(null), latestAnchoredLine(2)], ["latest line whose proof records a Bitcoin block: none yet", "latest line whose proof records a Bitcoin block: 2"]);
});

// Pilot of T-3b (motif of assertUkemiBody): the rendered-page assertions of scripts/assert-fleet-html.mjs, on synthetic HTML.
const page = (main: string): string => `<!DOCTYPE html><html><head><title>t</title></head><body><main>${main.replace(/'/g, "&#x27;")}</main><script>self.__next_f.push([1,"x"])</script></body></html>`;
test("bell_anchor_state_assertions_drive_on_synthetic_html — M-6, M-10, M-11, M-12 (pilot of T-3b)", () => {
  const pending = publicationAnchorSentence(st([row(2)])), none = publicationAnchorSentence(st([]));
  assert.doesNotThrow(() => assertBellAnchorBody({ html: page(`<dl><dt>timestamp anchor</dt><dd>${pending}</dd></dl>`), state: "pending", sentence: pending }));
  assert.throws(() => assertBellAnchorBody({ html: page(`<dd>${none}</dd>`), state: "pending", sentence: pending }), /pending sentence is absent/, "M-6: another computation rendered");
  assert.throws(() => assertBellAnchorBody({ html: page(`<dd>${pending}</dd><p>${none}</p>`), state: "pending", sentence: pending }), /another state than pending: none/, "M-10: another state's sentence beside it");
  assert.throws(() => assertBellAnchorBody({ html: page("<p>x</p>").replace('"x"', JSON.stringify(pending)), state: "pending", sentence: pending }), /absent/, "only in the script payload: absent from the body");
  assert.throws(() => assertBellAnchorBody({ html: page("<p>x</p>"), state: "none", sentence: pending }), /vacuity guard/);
  assert.doesNotThrow(() => assertBellAnchorBody({ html: page("<p>none, pending while the proof carries calendar attestations only, anchored once it carries a Bitcoin block</p>"), state: null, sentence: null }));
  for (const bad of [pending, "Anchoring each published line with OpenTimestamps is in preparation"]) assert.throws(() => assertBellAnchorBody({ html: page(`<p>${bad}</p>`), state: null, sentence: null }), /states another state than null/);
  const status = { bitcoinHeights: [], pendingCalendars: ["a", "b", "c", "d"] }, want = { manifest_sha256: H("e"), ...bellStatusText(status) };
  assert.deepEqual([want.label, want.detail], ["pending", "4 calendar records, no block yet"]);
  const table = (label: string, detail: string, latest: string): string => page(`<table><tr><td><span title="${H("e")}">x</span></td><td><span>${label}</span><div>${detail}</div></td></tr><tr><td><span title="${H("d")}">y</span></td><td>bitcoin attestation</td></tr></table><p>${latest}</p>`);
  assert.doesNotThrow(() => assertBellPublicationsTable({ html: table("pending", "4 calendar records, no block yet", latestAnchoredLine(null)), rows: [want], latest: latestAnchoredLine(null) }));
  assert.throws(() => assertBellPublicationsTable({ html: table("bitcoin attestation", "4 calendar records, no block yet", latestAnchoredLine(null)), rows: [want], latest: latestAnchoredLine(null) }), /does not render "pending 4 calendar records, no block yet"/, "M-11: a status not read from the proof");
  assert.throws(() => assertBellPublicationsTable({ html: table("pending", "4 calendar records, no block yet", latestAnchoredLine(null)), rows: [want], latest: latestAnchoredLine(2) }), /latest-anchored line is absent/, "M-12: none yet rendered while line 2 records a block");
  assert.deepEqual(bellStatusText({ bitcoinHeights: [968149, 968150], pendingCalendars: ["a"] }), { label: "bitcoin attestation", detail: "earliest block 968149 · 2 block records · 1 calendar record pending" });
});
