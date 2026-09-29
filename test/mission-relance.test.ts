/**
 * Root tests of scripts/mission/relance.mjs (ADR-METHODE-2 D8b, lot M-7): the class of each key of a workflow run (stored, failed, dead,
 * running), the reset instant of a failed key (quotaLimits first, the text "resets <time> (<zone>)" as fallback and concordance check), and
 * --verify of the resume written after a bound in the same journal. Fixtures under test/fixtures/relance/: a synthetic run of eight keys in
 * a session layout with its persisted script (fields measured on the real runs only), and the real run wf_7a7438e9-085 copied verbatim (its
 * 3-line journal and the last line of its agent's transcript, a harness record with no agent content). A run that needs a variant is copied
 * under os.tmpdir() first: no test writes in the tree. Every call passes now, never the clock. Each test names the mutation of the tool that
 * reddens it (killer convention of scripts/red-proof.mjs). Governance-only.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classify, parseResets, resetsOf, verify, type JournalRecord, type KeyEntry, type RelanceOutput, type TranscriptLine, type VerifyStatus } from "../scripts/mission/relance.mjs";

const TOOL = join(import.meta.dirname, "..", "scripts", "mission", "relance.mjs"), FX = join(import.meta.dirname, "fixtures", "relance");
const RUN_A = join(FX, "sess", "subagents", "workflows", "wf_fx-a"), REAL = join(FX, "real-wf_7a7438e9-085"), NOW_A = "2026-09-27T21:40:42Z";
const TMP: string[] = [];
after(() => { for (const d of TMP) rmSync(d, { recursive: true, force: true, maxRetries: 3 }); });
const scratch = (): string => { const d = mkdtempSync(join(tmpdir(), "relance-")); TMP.push(d); return d; };
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const copyRun = (): string => { const d = join(scratch(), "wf_copy"); cpSync(RUN_A, d, { recursive: true }); return d; };
const L: JournalRecord = { type: "launched" };
const S = (key: string, agentId: string, label = `l-${key}`, phase = "P"): JournalRecord => ({ type: "started", key, agentId, label, phase });
const R = (key: string, agentId: string, result: unknown = { ok: true }): JournalRecord => ({ type: "result", key, agentId, result });
const F = (key: string, agentId: string): JournalRecord => ({ type: "failed", key, agentId });
const T = (h: string): string => `You've hit your session limit · resets ${h} (Europe/London)`;
const W = (d: string): string => `You've hit your weekly limit · resets ${d} (Europe/London)`;
const syn = (h: string, at?: string): TranscriptLine => ({ ...(at === undefined ? {} : { timestamp: at }), error: "rate_limit", apiErrorStatus: 429,
  message: { model: "<synthetic>", content: [{ type: "text", text: T(h) }] } }); // a synthetic limit line, stamped at `at` if given

interface Cli { code: number | null; stdout: string; stderr: string; out: RelanceOutput | null; file: string }
/** Runs the tool; --out defaults to a fresh scratch file; out = the JSON written there, null if none. */
function cli(args: string[], file = join(scratch(), "out.json")): Cli {
  const r = spawnSync(process.execPath, [TOOL, ...args, "--out", file], { encoding: "utf8" });
  let out: RelanceOutput | null = null;
  try { out = JSON.parse(readFileSync(file, "utf8")) as RelanceOutput; } catch { out = null; }
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out, file };
}
const entry = (o: RelanceOutput | null, k: string): KeyEntry<VerifyStatus> | undefined => o?.keys.find((e) => e.key === k);
const facts = (e: KeyEntry<VerifyStatus> | undefined): unknown => (e === undefined ? undefined : { status: e.status, cause: e.cause, resets_at: e.resets_at, divergence: e.divergence });
const spoiled = (line: string): [number | null, RelanceOutput | null, string] => { // --run on a copy of RUN_A with one more journal line
  const d = copyRun(); appendFileSync(join(d, "journal.jsonl"), `${line}\n`);
  const r = cli(["--run", d, "--now", NOW_A]); return [r.code, r.out, r.stderr.trim()]; };

// killer: scripts/mission/relance.mjs:32 CONST "q.rateLimitType ?? \"unknown\"" -> "\"unknown\""
test("run_real_weekly_limit_fixture_takes_the_epoch_and_the_type", () => {
  const r = cli(["--run", REAL, "--now", "2026-09-28T17:39:00Z"]);
  assert.equal(r.code, 1, r.stderr);
  assert.deepEqual(r.out?.keys, [{ key: "v2:5d051c48e5d3bede56a67a50b71991baaa14f164e7980e2264eacca7a874e741", label: "g2:m8:rr3", phase: "Re-revue 3 G2 M-8",
    agentId: "aa4bde63bbfa710ca", status: "failed", cause: "seven_day", resets_at: "2026-10-01T10:00:00.000Z", divergence: null }]); // epoch 1790848800 = "Oct 1, 11am" London
  assert.deepEqual([r.out?.schema, r.out?.script, r.out?.journal_lines, r.out?.now, r.out?.resume_at], ["monark.relance.v1", null, 3, "2026-09-28T17:39:00.000Z", "2026-10-01T10:00:00.000Z"]);
  assert.equal(r.out?.resume, 'Workflow({"scriptPath":null,"resumeFromRunId":"wf_7a7438e9-085"})');
  const last = r.stdout.trimEnd().split("\n").at(-1) ?? "";
  assert.deepEqual(JSON.parse(last.replace(/^relance-result /, "")) as unknown, { exit: 1, record: r.file.replaceAll("\\", "/"), sha256: sha(readFileSync(r.file)) });
});

// killer: scripts/mission/relance.mjs:20 CONST "% 12" -> "% 24"
test("run_session_and_weekly_texts_agree_with_their_epoch", () => {
  const r = cli(["--run", RUN_A, "--now", NOW_A]);
  assert.equal(r.code, 1, r.stderr);
  assert.deepEqual(facts(entry(r.out, "k1")), { status: "failed", cause: "five_hour", resets_at: "2026-09-27T23:40:00.000Z", divergence: null });
  assert.deepEqual(facts(entry(r.out, "k2")), { status: "failed", cause: "seven_day", resets_at: "2026-10-01T10:00:00.000Z", divergence: null });
  assert.equal(r.out?.resume_at, "2026-10-01T10:00:00.000Z");
});

// killer: scripts/mission/relance.mjs:32 CONST "epoch ?? (" -> "("
test("run_divergent_text_is_named_and_the_epoch_kept", () => {
  const r = cli(["--run", RUN_A, "--now", NOW_A]);
  assert.deepEqual(facts(entry(r.out, "k3")), { status: "failed", cause: "five_hour", resets_at: "2026-09-27T23:40:00.000Z", divergence: { text: "2026-09-27T22:40:00.000Z", seconds: 3600 } });
});

// killer: scripts/mission/relance.mjs:27 CONST "cause: \"unknown\"" -> "cause: \"rate_limit\""
test("run_failed_key_without_a_synthetic_line_is_unknown_at_now", () => {
  const r = cli(["--run", RUN_A, "--now", NOW_A]);
  assert.deepEqual(facts(entry(r.out, "k4")), { status: "failed", cause: "unknown", resets_at: "2026-09-27T21:40:42.000Z", divergence: null });
  const cause = (line: TranscriptLine) => classify([L, S("k", "a1"), F("k", "a1")], { a1: [{ timestamp: NOW_A, ...line }] }, NOW_A)[0]?.cause; // stamped
  const q = { resetsAt: 1790552400, rateLimitType: "five_hour" };
  assert.equal(cause({ apiErrorStatus: 429, message: { model: "<synthetic>" }, quotaLimits: q }), "five_hour"); // 429 alone detects the line
  assert.equal(cause({ error: "rate_limit", message: { model: "<synthetic>" }, quotaLimits: q }), "five_hour"); // rate_limit alone too
  assert.equal(cause({ error: "rate_limit", apiErrorStatus: 429, message: { model: "claude-opus-5-5" }, quotaLimits: q }), "unknown"); // not synthetic
});

// killer: scripts/mission/relance.mjs:41 COR " && last.result !== null" -> ""
test("run_null_result_is_failed_v4", () => {
  const r = cli(["--run", RUN_A, "--now", NOW_A]);
  assert.deepEqual(facts(entry(r.out, "k5")), { status: "failed", cause: "unknown", resets_at: "2026-09-27T21:40:42.000Z", divergence: null });
  assert.equal(classify([L, S("k", "a1"), R("k", "a1", null)], {}, NOW_A)[0]?.status, "failed");
});

// killer: scripts/mission/relance.mjs:41 CONST "? \"stored\" :" -> "? \"failed\" :"
test("run_non_null_result_is_stored", () => {
  const r = cli(["--run", RUN_A, "--now", NOW_A]);
  assert.deepEqual(facts(entry(r.out, "k6")), { status: "stored", cause: null, resets_at: null, divergence: null });
  assert.equal(r.out?.verdict, "failed 5, stored 1, running 1, dead 1; the orchestrator relaunches the failed keys after resume_at");
});

// killer: scripts/mission/relance.mjs:85 CONST "stale = Number(o.stale ?? 30)" -> "stale = Number(o.stale ?? 0)"
test("run_started_key_with_a_recent_transcript_is_running_under_the_default_stale", () => {
  const r = cli(["--run", RUN_A, "--now", NOW_A]); // a7 last stamped 21:20:42Z, 20 min before now
  assert.deepEqual(facts(entry(r.out, "k7")), { status: "running", cause: null, resets_at: null, divergence: null });
  assert.deepEqual(facts(entry(r.out, "k8")), { status: "dead", cause: "unknown", resets_at: "2026-09-27T21:40:42.000Z", divergence: null }); // no transcript
  assert.equal(entry(cli(["--run", RUN_A, "--now", NOW_A, "--stale", "10"]).out, "k7")?.status, "dead");
});

// killer: scripts/mission/relance.mjs:41 ROR "stamp >= t0" -> "stamp > t0"
test("classify_dead_running_boundary_is_exactly_stale_minutes", () => {
  const recs = [L, S("k", "a1")], tx = (ts: string): Record<string, TranscriptLine[]> => ({ a1: [{ timestamp: "2026-09-27T20:00:00.000Z" }, { timestamp: ts }] });
  const at = (t: Record<string, TranscriptLine[]>, stale?: number): string | undefined => classify(recs, t, NOW_A, stale)[0]?.status;
  assert.equal(at(tx("2026-09-27T21:10:42.000Z")), "running"); // exactly now - 30 min (the default): running
  assert.equal(at(tx("2026-09-27T21:10:41.999Z")), "dead"); // 1 ms older: dead
  assert.deepEqual([at({}), at({ a1: [] })], ["dead", "dead"]); // no transcript, an empty one
  assert.deepEqual([at(tx("2026-09-27T21:35:42.000Z"), 5), at(tx("2026-09-27T21:35:41.999Z"), 5)], ["running", "dead"]);
  assert.equal(at({ a1: [{ timestamp: "2026-09-27T21:40:00.000Z", error: "rate_limit", apiErrorStatus: 429, message: { model: "<synthetic>" } }] }), "running"); // the journal classes, never the text (FM-2.4)
});

// killer: scripts/mission/relance.mjs:78 CONST ".slice(0, -1)" -> ".slice(0, Infinity)"
test("run_transcript_with_an_unterminated_nul_tail_reads_its_last_complete_line", () => {
  const run = copyRun();
  appendFileSync(join(run, "agent-a7.jsonl"), Buffer.alloc(300)); // the zero-filled unterminated tail of a power cut (2 of 295 real transcripts, 28/09)
  const r = cli(["--run", run, "--now", "2026-09-27T21:51:00Z"]);
  assert.equal(r.code, 1, r.stderr);
  assert.equal(entry(r.out, "k7")?.status, "dead"); // last complete line 21:20:42Z, 30 min 18 s before now
});

// killer: scripts/mission/relance.mjs:23 ROR "t >= t0" -> "t <= t0"
test("parse_dateless_form_takes_the_first_instant_at_or_after_now", () => {
  assert.equal(parseResets(T("12:40am"), "2026-09-27T21:40:00Z"), "2026-09-27T23:40:00.000Z"); // 22:40 London: tonight
  assert.equal(parseResets(T("12:40am"), "2026-09-27T23:50:00Z"), "2026-09-28T23:40:00.000Z"); // 00:50 London: the next night
  assert.equal(parseResets(T("12:40am"), "2026-09-27T23:40:00Z"), "2026-09-27T23:40:00.000Z"); // now on the instant itself: at or after, that one
  for (const [h, now, epoch] of [["6:20am", "2026-09-27T03:59:30Z", 1790486400], ["7:40pm", "2026-09-27T17:26:41Z", 1790534400], ["12:40am", "2026-09-27T21:40:42Z", 1790552400]] as const) {
    assert.equal(parseResets(T(h), now), new Date(epoch * 1000).toISOString(), h); // the three measured session texts against their epochs
  }
});

// killer: scripts/mission/relance.mjs:21 CONST "Number(m[2])" -> "2"
test("parse_dated_form_takes_the_first_year_at_or_after_the_stamp", () => {
  assert.equal(parseResets(W("Oct 1, 11am"), "2026-09-28T17:38:25Z"), new Date(1790848800 * 1000).toISOString()); // the measured weekly text
  assert.equal(parseResets(W("Oct 1, 11am"), "2026-10-01T12:00:00Z"), "2027-10-01T10:00:00.000Z"); // stamped after it: never before the stamp
  assert.equal(parseResets(W("Jan 2, 11:30am"), "2026-12-30T12:00:00Z"), "2027-01-02T11:30:00.000Z"); // across the new year, GMT
  assert.equal(parseResets(W("Foo 2, 11am"), "2026-12-30T12:00:00Z"), null);
});

// killer: scripts/mission/relance.mjs:22 CONST "L + 432e5" -> "L + -432e5"
test("parse_dateless_form_on_the_dst_fold_takes_the_first_of_two_instants_at_or_after_now", () => {
  assert.equal(parseResets(T("1:30am"), "2026-10-25T00:00:00Z"), "2026-10-25T00:30:00.000Z"); // 01:30 BST, the first of the two
  assert.equal(parseResets(T("1:30am"), "2026-10-25T01:00:00Z"), "2026-10-25T01:30:00.000Z"); // 01:30 GMT, the second, once the first is past
  assert.equal(parseResets("resets 6:20am (Mars/Olympus)", "2026-10-25T00:00:00Z"), null); // unknown zone
  assert.equal(parseResets("You've hit your session limit", "2026-10-25T00:00:00Z"), null);
});

// killer: scripts/mission/relance.mjs:88 CONST "=== \"subagents\"" -> "=== \"workflows\""
test("run_script_is_the_persisted_script_of_the_run_or_null", () => {
  const r = cli(["--run", RUN_A, "--now", NOW_A]);
  assert.equal(r.out?.script, join(FX, "sess", "workflows", "scripts", "fx-wf_fx-a.js").replaceAll("\\", "/"));
  assert.equal(r.out?.resume, `Workflow(${JSON.stringify({ scriptPath: r.out?.script, resumeFromRunId: "wf_fx-a" })})`);
  const sess = join(scratch(), "sess");
  cpSync(join(FX, "sess"), sess, { recursive: true });
  rmSync(join(sess, "workflows", "scripts", "fx-wf_fx-a.js"));
  const unnamed = cli(["--run", join(sess, "subagents", "workflows", "wf_fx-a"), "--now", NOW_A]), bare = cli(["--run", copyRun(), "--now", NOW_A]);
  assert.deepEqual([unnamed.out?.script, unnamed.code, bare.out?.script, bare.code, r.code], [null, 1, null, 1, 1]); // no script of that name, no session layout
});

// killer: scripts/mission/relance.mjs:59 CONST "? \"relaunched\" :" -> "? \"replaced\" :"
test("verify_failed_key_restarted_to_a_result_is_relaunched", () => {
  const v = verify([L, S("k1", "a1"), F("k1", "a1"), S("k1", "ab1"), R("k1", "ab1")], 3, {}, NOW_A);
  assert.deepEqual([v.keys.map((k) => k.status), v.verify.relaunched, v.exit], [["relaunched"], 1, 0]);
});

// killer: scripts/mission/relance.mjs:35 ROR "r.phase === k.phase" -> "r.phase !== k.phase"
test("verify_failed_key_answered_by_a_new_key_of_its_label_and_phase_is_replaced", () => {
  const base = [L, S("k1", "a1", "synth", "Synthesis"), F("k1", "a1")];
  const v = verify([...base, S("k2", "ab1", "other", "Synthesis"), R("k2", "ab1"), S("k3", "ab2", "synth", "Synthesis"), R("k3", "ab2")], 3, {}, NOW_A);
  assert.deepEqual([v.keys[0]?.key, v.keys[0]?.status, v.verify.replaced, v.verify.served_from_cache, v.exit], ["k1", "replaced", 1, 0, 0]);
  const w = verify([...base, S("k2", "ab1", "synth", "Reads"), R("k2", "ab1")], 3, {}, NOW_A); // same label, another phase: no replacement
  assert.deepEqual([w.keys[0]?.status, w.verify.served_from_cache, w.exit], ["served-from-cache", 1, 1]);
  const two = verify([L, S("k1", "a1", "synth", "Synthesis"), S("k2", "a2", "synth", "Synthesis"), F("k1", "a1"), F("k2", "a2"), S("k3", "ab1", "synth", "Synthesis"), R("k3", "ab1")], 5, {}, NOW_A);
  assert.deepEqual([two.keys.map((k) => k.status), two.exit], [["replaced", "served-from-cache"], 1]); // one new key answers for one failed key only
});

// killer: scripts/mission/relance.mjs:68 CONST "? 1 : 0" -> "? 0 : 0"
test("verify_failed_key_neither_restarted_nor_replaced_is_served_from_cache_exit_1", () => {
  const v = verify([L, S("k1", "a1"), F("k1", "a1"), S("k9", "ab1", "other", "P"), R("k9", "ab1")], 3, {}, NOW_A);
  assert.deepEqual([v.keys[0]?.status, v.verify.served_from_cache, v.exit], ["served-from-cache", 1, 1]);
  const none = verify([L, S("k1", "a1"), F("k1", "a1")], 3, {}, NOW_A); // nothing after the bound: not verified, never served-from-cache
  assert.deepEqual([none.keys[0]?.status, none.verify.served_from_cache, none.exit], ["failed", 0, 1]);
});

// killer: scripts/mission/relance.mjs:58 ROR "tail.result === null" -> "tail.result !== null"
test("verify_null_result_after_the_bound_is_null_served_exit_1", () => {
  for (const tail of [[S("k1", "ab1"), R("k1", "ab1", null)], [R("k1", "a1", null)]]) { // restarted to null, or a null served without a start
    const v = verify([L, S("k1", "a1"), F("k1", "a1"), ...tail], 3, {}, NOW_A);
    assert.deepEqual([v.keys[0]?.status, v.verify.null_served, v.exit], ["null-served", 1, 1]);
  }
});

// killer: scripts/mission/relance.mjs:54 CONST "status: \"replayed\"" -> "status: \"served-from-cache\""
test("verify_stored_key_restarted_is_replayed_and_reported_with_its_cost_exit_0", () => {
  const recs = [L, S("k1", "a1"), R("k1", "a1"), S("k2", "a2"), F("k2", "a2"), S("k2", "ab2"), R("k2", "ab2"), S("k1", "ab1"), R("k1", "ab1")];
  const tx = { ab1: [{ timestamp: "2026-09-27T05:21:53.801Z" }, { timestamp: "2026-09-27T05:36:24.265Z" }] }; // the replay of KS-P04b, wf_682419e6-d20
  const v = verify(recs, 5, tx, NOW_A);
  assert.deepEqual([v.keys.map((k) => k.status), v.verify.replayed, v.verify.served_from_cache, v.exit], [["replayed", "relaunched"], { keys: 1, seconds: 870.464 }, 0, 0]);
  assert.equal(verify(recs, 5, {}, NOW_A).verify.replayed.seconds, null); // no stamps: the count alone
});

// killer: scripts/mission/relance.mjs:49 COR " || from > records.length" -> ""
test("verify_from_beyond_the_journal_exits_2", () => {
  assert.throws(() => verify([L, S("k1", "a1")], 3, {}, NOW_A), RangeError);
  const r = cli(["--verify", RUN_A, "--from", "16", "--now", NOW_A]);
  assert.deepEqual([r.code, r.out], [2, null]);
  assert.match(r.stderr, /--from 16: the journal holds 15 records/);
  assert.equal(cli(["--verify", RUN_A, "--from", "15", "--now", NOW_A]).code, 1); // at the bound: nothing after it, not verified
});

// killer: scripts/mission/relance.mjs:98 CONST "process.exitCode = 2" -> "process.exitCode = 1"
test("run_unreadable_run_exits_2_never_a_partial_class", () => {
  const journal = (d: string): string => join(d, "journal.jsonl");
  const spoil: [string, (d: string) => void][] = [
    ["journal absent", (d) => { rmSync(journal(d)); }],
    ["empty journal", (d) => { writeFileSync(journal(d), ""); }],
    ["line not JSON", (d) => { appendFileSync(journal(d), '{"type":"failed"\n'); }],
    ["unterminated last line", (d) => { appendFileSync(journal(d), '{"type":"failed","key":"k7","agentId":"a7"}'); }],
    ["unknown type", (d) => { appendFileSync(journal(d), '{"type":"paused","key":"k7","agentId":"a7"}\n'); }],
    ["a second launched", (d) => { appendFileSync(journal(d), '{"type":"launched"}\n'); }],
    ["first record not launched", (d) => { writeFileSync(journal(d), readFileSync(journal(d), "utf8").split("\n").slice(1).join("\n")); }],
    ["agentId outside the measured shape", (d) => { appendFileSync(journal(d), '{"type":"failed","key":"k7","agentId":"../a7"}\n'); }],
    ["transcript line not JSON", (d) => { appendFileSync(join(d, "agent-a1.jsonl"), "not json\n"); }],
  ];
  for (const [what, act] of spoil) {
    const d = copyRun();
    act(d);
    const r = cli(["--run", d, "--now", NOW_A]);
    assert.deepEqual([what, r.code, r.out], [what, 2, null], r.stderr);
  }
});

// killer: scripts/mission/relance.mjs:86 SDL "rel[0] !== \"..\"" -> ""
test("run_never_writes_inside_the_run_directory", () => {
  const d = copyRun(), snap = (): string[] => readdirSync(d).sort().map((f) => `${f} ${sha(readFileSync(join(d, f)))}`), before = snap();
  const r = cli(["--run", d, "--now", NOW_A], join(d, "relance.json"));
  assert.deepEqual([r.code, r.out], [2, null]);
  assert.match(r.stderr, /lies inside the run directory/);
  assert.equal(cli(["--run", d, "--now", NOW_A]).code, 1); // read, never written
  assert.deepEqual(snap(), before);
});

// killer: scripts/mission/relance.mjs:50 CONST "records.slice(from)" -> "records.slice(0)"
test("verify_cli_reads_the_same_journal_after_the_bound", () => {
  const d = copyRun(), more = [S("k1", "ab1", "read:1", "Reads"), R("k1", "ab1"), S("k9", "ab2", "read:2", "Reads"), R("k9", "ab2"), R("k3", "a3", null), S("k6", "ab3", "read:6", "Reads"), R("k6", "ab3")];
  appendFileSync(join(d, "journal.jsonl"), more.map((x) => `${JSON.stringify(x)}\n`).join(""));
  const r = cli(["--verify", d, "--from", "15", "--now", NOW_A]);
  assert.equal(r.code, 1, r.stderr);
  assert.deepEqual(r.out?.keys.map((k) => `${k.key} ${k.status}`), ["k1 relaunched", "k2 replaced", "k3 null-served", "k4 served-from-cache", "k5 served-from-cache", "k6 replayed", "k7 running", "k8 dead"]);
  assert.deepEqual(r.out?.verify, { from: 15, vacuous: false, relaunched: 1, replaced: 1, served_from_cache: 2, null_served: 1, // C-G2-3, C-G2-7
    replayed: { keys: 1, seconds: null }, unmatched: [] });
  assert.deepEqual([r.out?.journal_lines, r.out?.verdict.endsWith("not verified: a failed key neither relaunched nor replaced")], [22, true]);
});

// killer: scripts/mission/relance.mjs:84 SDL "(o.run === undefined) === (o.verify === undefined)" -> ""
test("cli_usage_errors_exit_2_and_write_nothing", () => {
  const bad = [["--run", RUN_A, "--verify", RUN_A, "--now", NOW_A], ["--run", RUN_A, "--from", "3", "--now", NOW_A], ["--verify", RUN_A, "--now", NOW_A],
    ["--run", RUN_A, "--now", "2026-09-27 21:40"], ["--run", RUN_A, "--now", NOW_A, "--stale", "-1"], ["--run", RUN_A, "--now", NOW_A, "--when", "x"]];
  for (const args of bad) {
    const r = cli(args);
    assert.deepEqual([args.join(" "), r.code, r.out], [args.join(" "), 2, null], r.stderr);
  }
});

// killer: scripts/mission/relance.mjs:32 CONST ": Date.parse(said)))" -> ": Date.parse(now)))"
test("resets_of_falls_back_to_the_text_when_the_epoch_is_absent", () => {
  const line: TranscriptLine = { timestamp: "2026-09-27T03:59:30.426Z", error: "rate_limit", apiErrorStatus: 429, message: { model: "<synthetic>", content: [{ type: "text", text: T("6:20am") }] } };
  const d = copyRun(); // the line, no quotaLimits, as the last line of a failed key's transcript, through the CLI first
  writeFileSync(join(d, "agent-a4.jsonl"), `${JSON.stringify({ ...line, timestamp: "2026-09-27T21:40:00.000Z" })}\n`);
  const r = cli(["--run", d, "--now", NOW_A]);
  assert.deepEqual([r.code, facts(entry(r.out, "k4"))], [1, { status: "failed", cause: "unknown", resets_at: "2026-09-28T05:20:00.000Z", divergence: null }]); // 6:20am after 22:40 London: the next morning
  assert.deepEqual(resetsOf(line, "2026-09-27T04:03:00Z"), { cause: "unknown", resets_at: "2026-09-27T05:20:00.000Z", divergence: null });
  assert.deepEqual(resetsOf({ ...line, message: { model: "<synthetic>", content: "no time given" } }, "2026-09-27T04:03:00Z"), { cause: "unknown", resets_at: "2026-09-27T04:03:00.000Z", divergence: null });
  assert.deepEqual(resetsOf(undefined, "2026-09-27T04:03:00Z"), { cause: "unknown", resets_at: "2026-09-27T04:03:00.000Z", divergence: null });
});

// killer: scripts/mission/relance.mjs:29 CONST "parseResets(text, line.timestamp)" -> "parseResets(text, now)"
test("resets_of_anchors_the_text_on_the_stamp_of_its_line_never_on_now", () => {
  const q = { resetsAt: 1790486400, rateLimitType: "five_hour" }, at = "2026-09-27T03:59:30.426Z", t = "2026-09-27T05:20:00.000Z", u = "unknown";
  const got = [{ ...syn("6:20am", at), quotaLimits: q }, syn("6:20am", at), { ...syn("6:20am"), quotaLimits: q }, syn("6:20am")].map((l) => resetsOf(l, NOW_A));
  assert.deepEqual(got.map((g) => [g.cause, g.resets_at, g.divergence]), [["five_hour", t, null], [u, t, null], [u, t, null], [u, null, null]]);
}); // read at NOW_A, long after the reset: no false divergence, the text alone gives that morning (C-G2-1); no stamp: the epoch or null (Q-G2-1)
// killer: scripts/mission/relance.mjs:89 CONST "Number(o.from), transcripts, now, stale)" -> "Number(o.from), transcripts, now)"
test("verify_cli_applies_stale_to_the_origin_states", () => {
  const k7 = (...stale: string[]) => entry(cli(["--verify", RUN_A, "--from", "15", "--now", NOW_A, ...stale]).out, "k7")?.status; // a7: 20 min old
  assert.deepEqual([k7("--stale", "10"), k7()], ["dead", "running"]);
});
// killer: scripts/mission/relance.mjs:77 CONST "${r?.type} record: field ${bad} missing or mistyped" -> ""
test("run_record_with_a_mistyped_field_exits_2_naming_file_line_type_and_field", () => {
  const [code, out, err] = spoiled('{"type":"failed","key":"k7","agentId":7}'); // an agentId that is a number
  assert.deepEqual([code, out, err], [2, null, "relance: journal.jsonl:16: failed record: field agentId missing or mistyped"]);
});
// killer: scripts/mission/relance.mjs:76 CONST "!(f in r) || " -> ""
test("run_record_missing_a_required_field_exits_2_never_a_class", () => {
  const [code, out, err] = spoiled('{"type":"result","key":"k7","agentId":"a7"}'); // a result record without its result: never read as stored
  assert.deepEqual([code, out, err], [2, null, "relance: journal.jsonl:16: result record: field result missing or mistyped"]);
});
// killer: scripts/mission/relance.mjs:12 CONST "key: str," -> "key: () => true,"
test("run_key_of_another_type_exits_2_and_an_additional_field_is_tolerated", () => {
  assert.deepEqual(spoiled('{"type":"failed","key":7,"agentId":"a7"}'), [2, null, "relance: journal.jsonl:16: failed record: field key missing or mistyped"]);
  assert.equal(entry(spoiled('{"type":"failed","key":"k7","agentId":"a7","reason":"x"}')[1], "k7")?.status, "failed"); // Q-G2-3: tolerated
});
// killer: scripts/mission/relance.mjs:52 ROR "restarts(k.key).length > 0" -> "restarts(k.key).length >= 0"
test("verify_stored_origin_key_not_restarted_stays_stored_never_replayed", () => {
  const v = verify([L, S("k1", "a1"), R("k1", "a1"), S("k2", "a2"), F("k2", "a2"), S("k2", "ab2"), R("k2", "ab2")], 5, {}, NOW_A);
  assert.deepEqual([v.keys.map((k) => k.status), v.verify.replayed, v.exit], [["stored", "relaunched"], { keys: 0, seconds: 0 }, 0]);
});
// killer: scripts/mission/relance.mjs:59 CONST "c.status !== \"stored\" ? c.status : " -> ""
test("verify_failed_key_restarted_without_a_result_takes_its_current_state_exit_1", () => {
  const v = verify([L, S("k1", "a1"), F("k1", "a1"), S("k1", "ab1")], 3, { ab1: [{ timestamp: "2026-09-27T05:22:07.856Z" }] }, "2026-09-29T09:00:00Z");
  assert.deepEqual([v.keys.map((k) => k.status), v.verify.relaunched, v.verify.vacuous, v.exit], [["dead"], 0, false, 1]); // wf_2dd4ebc4-88a
});
// killer: scripts/mission/relance.mjs:35 CONST " && records.findIndex((x) => x.key === r.key) === i" -> ""
test("verify_origin_key_restarted_after_the_bound_never_answers_for_another", () => {
  const v = verify([L, S("k1", "a1", "x", "P"), S("k2", "a2", "x", "P"), R("k2", "a2"), F("k1", "a1"), S("k2", "ab2", "x", "P"), R("k2", "ab2")], 5, {}, NOW_A);
  assert.deepEqual([v.keys.map((k) => `${k.key}:${k.status}`), v.exit], [["k1:served-from-cache", "k2:replayed"], 1]);
});
// killer: scripts/mission/relance.mjs:32 ROR "gap > 60 ?" -> "gap >= 60 ?"
test("resets_of_names_a_divergence_beyond_60_seconds_only", () => {
  const at = (s: number) => resetsOf({ ...syn("12:41am", NOW_A), quotaLimits: { resetsAt: 1790552400 + s, rateLimitType: "five_hour" } }, NOW_A).divergence;
  assert.deepEqual([at(0), at(-1)], [null, { text: "2026-09-27T23:41:00.000Z", seconds: 61 }]); // text 23:41Z: 60 s from 23:40Z, 61 s from 23:39:59Z
});
// killer: scripts/mission/relance.mjs:21 CONST "[0, 1].map(" -> "[0].map("
test("parse_dated_form_across_the_new_year_takes_the_next_year", () => {
  assert.deepEqual([parseResets(W("Jan 1, 11am"), "2026-12-31T20:00:00Z"), parseResets(W("Dec 31, 11pm"), "2027-01-01T01:00:00Z")],
    ["2027-01-01T11:00:00.000Z", "2027-12-31T23:00:00.000Z"]); // stamped on Dec 31: the next year; never a year before the stamp
});
// killer: scripts/mission/relance.mjs:57 CONST "r.key === (by ?? k.key)" -> "r.key === k.key"
test("verify_new_key_answering_with_a_null_result_is_null_served_exit_1", () => {
  const v = verify([L, S("k1", "a1", "s", "P"), F("k1", "a1"), S("k2", "ab1", "s", "P"), R("k2", "ab1", null)], 3, {}, NOW_A);
  assert.deepEqual([v.keys.map((k) => k.status), v.verify.null_served, v.exit], [["null-served"], 1, 1]);
});
// killer: scripts/mission/relance.mjs:46 CONST "status: \"replaced\", by" -> "status: \"failed\", by"
test("run_failed_key_answered_by_a_new_key_stored_after_it_is_replaced_with_its_identity", () => {
  const d = join(scratch(), "wf_real"), more = [S("v2:new", "ab9", "g2:m8:rr3", "Re-revue 3 G2 M-8"), R("v2:new", "ab9")]; // a resume, Q-M7-8
  cpSync(REAL, d, { recursive: true }); appendFileSync(join(d, "journal.jsonl"), more.map((x) => `${JSON.stringify(x)}\n`).join(""));
  const r = cli(["--run", d, "--now", "2026-10-02T12:00:00Z"]), got = r.out?.keys.map((k) => [k.status, k.by]);
  assert.deepEqual([r.code, got, r.out?.resume, r.out?.resume_at], [0, [["replaced", { key: "v2:new", agentId: "ab9" }], ["stored", undefined]], null, null]);
});
// killer: scripts/mission/relance.mjs:55 CONST "return cur.get(k.key);" -> "return k;"
test("verify_reports_unmatched_new_keys_origin_keys_in_their_current_state_and_the_answering_key", () => {
  const v = verify([L, S("k1", "a1"), S("k1", "ab1"), R("k1", "ab1"), S("k9", "ab9", "other"), R("k9", "ab9")], 2, {}, NOW_A); // wf_c90635a2-8a8
  const u = { key: "k9", label: "other", phase: "P", status: "stored" }; // a new key answering for no failed key (C-G2-7 (a))
  assert.deepEqual([v.keys.map((k) => k.status), v.verify.vacuous, v.verify.unmatched, v.exit], [["stored"], true, [u], 0]); // k1 dead, then stored
  const w = verify([L, S("k1", "a1", "s", "P"), F("k1", "a1"), S("k2", "ab2", "s", "P"), R("k2", "ab2")], 3, {}, NOW_A).keys[0];
  assert.deepEqual([w?.agentId, w?.status, w?.by], ["a1", "replaced", { key: "k2", agentId: "ab2" }]); // C-G2-7 (c): its own agent, and who answered
});
