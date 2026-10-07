// scripts/retire-instants.mjs -- RETIRE-INSTANTS-1 (ENGINE-ROW-RETIRE-PATH-1, lot RH-1; docs/G0-lot-retire-latency-rehearsal-1.md section 8):
// the retire-latency-v1 entry of one cycle, read from its evidence instead of copied by hand. Node 24, no dependency.
//
//   node scripts/retire-instants.mjs <evidence.json>
//
// Closed evidence: {"format": "retire-evidence-v1", "cycle": <as scripts/retire-latency.mjs>, "sources": {<instant>: <source>}, "mention":
// null | "<text>"}. Each instant has its kinds of source (KINDS): a commit {"commit": <full sha>, "repo": <dir>} reads its committer date,
// `git -C <repo> log -1 --format=%cI <sha>`, in UTC, never the author date (RUNBOOK "Retire a kata row", steps 1, 2 and 5: T_a, T_b, T_e);
// a clock {"clock": "YYYY-MM-DDTHH:MM:SSZ"} is a reading written down at the act (T_c the CI green on the head, T_d the push returned; T_a
// of live:<k>, the close of the quarter); a CA {"ca": <file>} is the checked_at of a green record of scripts/verify-harness.mjs, cut to the
// second (T_f); a probe {"probe": <file>} is the received_at of a retire-probe-v1 record that holds the expected digest (T_g). Which
// instants a cycle holds, and their order, is the report's: the entry is printed, one line on stdout, only once report() accepts it.
// Refused (exit 1) by code: evidence_invalid, source_unreadable, source_not_green, or the report's own; exit 2: usage.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { LatencyError, report } from "./retire-latency.mjs";

export const KINDS = Object.freeze({ T_a: ["commit", "clock"], T_b: ["commit"], T_c: ["clock"], T_d: ["clock"], T_e: ["commit"], T_f: ["ca"], T_g: ["probe"] });
const KEYS = { commit: ["commit", "repo"], clock: ["clock"], ca: ["ca"], probe: ["probe"] };
const no = (code, detail) => { throw new LatencyError(code, detail); };
const second = (ms) => new Date(Math.floor(ms / 1000) * 1000).toISOString().replace(".000Z", "Z");
const obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** The default reader of a commit's committer date: git -C <repo>, no inherited GIT_* variable (TEST-GIT-ENV-ISOLATION-1). */
export function committerDate(repo, sha) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
  const r = spawnSync("git", ["-C", repo, "log", "-1", "--format=%cI", `${sha}^{commit}`], { encoding: "utf8", env });
  if (r.status !== 0) throw new Error(r.stderr.trim() || String(r.error));
  return r.stdout.trim();
}
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

/** instant(name, source, io) -> the UTC instant, to the second, that the source gives. */
export function instant(name, source, { git = committerDate, read = readJson } = {}) {
  const kind = Object.keys(KEYS).find((k) => obj(source) && Object.keys(source).sort().join() === KEYS[k].join() && (KINDS[name] ?? []).includes(k));
  if (kind === undefined) no("evidence_invalid", `${name}: a source of ${(KINDS[name] ?? ["no kind"]).join(" or ")}, its keys only`);
  const at = (what, f) => { try { return f(); } catch (e) { return no("source_unreadable", `${name} ${what}: ${e instanceof Error ? e.message : String(e)}`); } };
  if (kind === "clock") return source.clock;
  if (kind === "commit") {
    if (!/^[0-9a-f]{40}$/.test(source.commit) || typeof source.repo !== "string") no("evidence_invalid", `${name}: a full sha of 40 hex and a repo`);
    const t = Date.parse(at(`${source.commit} in ${source.repo}`, () => git(source.repo, source.commit)));
    return Number.isFinite(t) ? second(t) : no("source_unreadable", `${name}: no committer date for ${source.commit}`);
  }
  const r = at(source[kind], () => read(source[kind]));
  if (kind === "ca") {
    if (!Array.isArray(r?.checks) || r.checks.length === 0 || !r.checks.every((c) => c?.ok === true)) no("source_not_green", `${name}: ${source.ca} is no green record of verify-harness`);
    const t = Date.parse(r.checked_at);
    return Number.isFinite(t) ? second(t) : no("source_unreadable", `${name}: ${source.ca} has no checked_at`);
  }
  if (r?.format !== "retire-probe-v1" || r.equal !== true || typeof r.received_at !== "string") no("source_not_green", `${name}: ${source.probe} is no retire-probe-v1 record of the expected digest`);
  return r.received_at;
}

/** entry(evidence, io) -> the retire-latency-v1 entry, accepted by report(); throws a LatencyError by its code. */
export function entry(evidence, io) {
  if (!obj(evidence) || Object.keys(evidence).sort().join() !== "cycle,format,mention,sources" || evidence.format !== "retire-evidence-v1" || !obj(evidence.sources)) {
    no("evidence_invalid", "retire-evidence-v1 holds format, cycle, sources and mention, nothing else");
  }
  const instants = Object.fromEntries(Object.entries(evidence.sources).map(([name, s]) => [name, instant(name, s, io)]));
  const e = { format: "retire-latency-v1", cycle: evidence.cycle, instants, mention: evidence.mention };
  report(e);
  return e;
}

export function main(argv, io) {
  if (argv.length !== 1 || argv[0].startsWith("-")) { console.error("usage: retire-instants.mjs <evidence.json>"); return 2; }
  try {
    let evidence;
    try { evidence = readJson(argv[0]); } catch (e) { throw new LatencyError("evidence_invalid", `${argv[0]}: ${e instanceof Error ? e.message : String(e)}`); }
    console.log(JSON.stringify(entry(evidence, io)));
    return 0;
  } catch (e) {
    console.error(`retire-instants REFUSED: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

if (import.meta.main !== false) process.exitCode = main(process.argv.slice(2)); // as scripts/retire-latency.mjs: an import runs nothing
