// test/retire-instants.test.ts -- item RETIRE-INSTANTS-1 (lot RH-1; docs/G0-lot-retire-latency-rehearsal-1.md section 8): the
// retire-latency-v1 entry assembled from its evidence. The readers are injected, except in the test of the committer date, which makes
// a repository in a temporary directory (git -C only, the host's config out). The tool is loaded on demand, so the base (no tool)
// reddens by assertion. The line above each test names the mutation that reddens it (scripts/red-proof.mjs convention).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { report } from "../scripts/retire-latency.mjs";

type Instants = typeof import("../scripts/retire-instants.mjs");
const TMP = mkdtempSync(join(tmpdir(), "retire-instants-"));
after(() => { rmSync(TMP, { recursive: true, force: true, maxRetries: 3 }); });
const SHA = (c: string): string => c.repeat(40);
async function load(): Promise<Instants> {
  try {
    return await import("../scripts/retire-instants.mjs");
  } catch (e) {
    return assert.fail(`scripts/retire-instants.mjs loads: ${e instanceof Error ? e.message : String(e)}`);
  }
}
const SOURCES = {
  T_a: { commit: SHA("a"), repo: "recherches" }, T_b: { commit: SHA("b"), repo: "gov" }, T_c: { clock: "2027-01-04T11:00:00Z" }, T_d: { clock: "2027-01-04T12:00:00Z" },
  T_e: { commit: SHA("e"), repo: "gov" }, T_f: { ca: "ca.json.local" }, T_g: { probe: "probe.json" },
};
const DATES: Record<string, string> = { [SHA("a")]: "2027-01-04T10:00:00+01:00", [SHA("b")]: "2027-01-04T10:30:00Z", [SHA("e")]: "2027-01-04T15:00:00+02:00" };
const FILES: Record<string, unknown> = {
  "ca.json.local": { checked_at: "2027-01-04T14:00:00.999Z", checks: [{ name: "health", ok: true }] },
  "probe.json": { format: "retire-probe-v1", received_at: "2027-01-04T15:00:01Z", equal: true },
};
const io = (files = FILES) => ({ git: (_repo: string, sha: string): string => DATES[sha] ?? assert.fail(sha), read: (f: string): unknown => files[f] ?? assert.fail(f) });
const evidence = (sources: object = SOURCES, cycle = "rehearsal") => ({ format: "retire-evidence-v1", cycle, sources, mention: null });

// reddened by: an instant read from another source than its kind, a commit date or a CA instant not brought to the UTC second, or an
// entry that the report refuses
// killer: scripts/retire-instants.mjs:21 CONST "Math.floor(ms / 1000)" -> "Math.round(ms / 1000)"
test("retire_instants_reads_each_source_into_the_entry", async () => {
  const t = await load(), e = t.entry(evidence(), io());
  assert.deepEqual(e, { format: "retire-latency-v1", cycle: "rehearsal", mention: null, instants: {
    T_a: "2027-01-04T09:00:00Z", T_b: "2027-01-04T10:30:00Z", T_c: "2027-01-04T11:00:00Z", T_d: "2027-01-04T12:00:00Z", T_e: "2027-01-04T13:00:00Z", T_f: "2027-01-04T14:00:00Z", T_g: "2027-01-04T15:00:01Z",
  } });
  assert.equal(report(e).total_ms, 6 * 3_600_000 + 1000, "the report accepts the entry");
  assert.equal(t.entry(evidence({ ...SOURCES, T_a: { clock: "2027-01-01T00:00:00Z" } }, "real"), io()).instants["T_a"], "2027-01-01T00:00:00Z", "T_a of live:<k> is a clock");
});

// reddened by: the author date read in place of the committer date (a rebase keeps the author date old), or a GIT_* variable obeyed
// killer: scripts/retire-instants.mjs:27 CONST "--format=%cI" -> "--format=%aI"
test("retire_instants_takes_the_committer_date_not_the_author_date", async () => {
  const t = await load(), repo = join(TMP, "repo"), env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "", GIT_AUTHOR_NAME: "F", GIT_AUTHOR_EMAIL: "f@example.invalid", GIT_COMMITTER_NAME: "F", GIT_COMMITTER_EMAIL: "f@example.invalid" };
  const git = (...a: string[]): string => { const r = spawnSync("git", ["-C", TMP, ...a], { encoding: "utf8", env: { ...env, GIT_AUTHOR_DATE: "2026-01-01T00:00:00+02:00", GIT_COMMITTER_DATE: "2027-01-04T10:05:04+02:00" } }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  git("init", "-q", "repo");
  writeFileSync(join(repo, "decision.md"), "- 2027-01-04: retire the row\n");
  git("-C", "repo", "add", "decision.md");
  git("-C", "repo", "commit", "-q", "-m", "decision");
  const sha = git("-C", "repo", "rev-parse", "HEAD");
  assert.equal(t.instant("T_a", { commit: sha, repo }), "2027-01-04T08:05:04Z", "the committer date, in UTC");
  assert.throws(() => t.instant("T_a", { commit: SHA("0"), repo }), (e: unknown) => (e as { code?: string }).code === "source_unreadable");
});

// reddened by: a red record (CA not green, probe of another digest) or a source of the wrong kind taken as an instant, or a refusal
// that the RUNBOOK does not cite
// killer: scripts/retire-instants.mjs:50 CONST "r.equal !== true ||" -> ""
test("retire_instants_refuses_unreadable_or_red_sources_by_code", async () => {
  const t = await load(), code = (ev: object, files = FILES): string => { try { t.entry(ev, io(files)); return "ok"; } catch (e) { return String((e as { code?: string }).code); } };
  const noProbe = Object.fromEntries(Object.entries(SOURCES).filter(([k]) => k !== "T_g"));
  assert.deepEqual([
    code({ ...evidence(), extra: 1 }), code(evidence({ ...SOURCES, T_c: { commit: SHA("b"), repo: "gov" } })), code(evidence({ ...SOURCES, T_b: { commit: "abc", repo: "gov" } })),
    code(evidence({ ...SOURCES, T_f: { ca: "missing.json" } })), code(evidence(), { ...FILES, "ca.json.local": { checked_at: "2027-01-04T14:00:00Z", checks: [{ ok: false }] } }),
    code(evidence(), { ...FILES, "probe.json": { format: "retire-probe-v1", received_at: "2027-01-04T15:00:01Z", equal: false } }), code(evidence(noProbe)),
    code(evidence({ ...SOURCES, T_d: { clock: "2027-01-04T10:59:59Z" } })),
  ], ["evidence_invalid", "evidence_invalid", "evidence_invalid", "source_unreadable", "source_not_green", "source_not_green", "instant_missing", "order_not_monotone"]);
  const runbook = readFileSync(join(import.meta.dirname, "..", "docs", "RUNBOOK-harness.md"), "utf8").replace(/\s+/g, " ");
  assert.ok(["evidence_invalid", "source_unreadable", "source_not_green"].every((c) => runbook.includes(`\`${c}\``)) && runbook.includes("node scripts/retire-instants.mjs <evidence.json>"), "the RUNBOOK runs the tool and cites its refusals");
  assert.equal(t.main([]), 2, "usage exits 2");
});
