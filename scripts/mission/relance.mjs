// scripts/mission/relance.mjs - prepares, never runs, the resume of a workflow run cut by an account limit (ADR-METHODE-2 D8b, lot M-7; Node 24, no
// dependency; the rules of each export in relance.d.mts). --run <run dir> --out <file> [--now <ISO>] [--stale <min>] | --verify <run dir> --from <n>
// --out <file> [--now <ISO>] [--stale <min>]: writes monark.relance.v1 to --out, never in the run, prints it, then relance-result {exit, record, sha256}.
// Exit 0: no failed key (--verify: each relaunched or replaced); 1: failed keys; 2: usage or a run not read (FM-3.2). Never relaunches (FM-1.2, R-20).
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const SHAPE = { launched: [], started: ["key", "agentId", "label", "phase"], result: ["key", "agentId", "result"], failed: ["key", "agentId"] }, iso = (ms) => new Date(ms).toISOString();
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "), synthetic = (l) => (l?.error === "rate_limit" || l?.apiErrorStatus === 429) && l?.message?.model === "<synthetic>";
const USAGE = "usage: --run <dir> --out <file> [--now <ISO>] [--stale <min>] | --verify <dir> --from <n> --out <file> [--now <ISO>] [--stale <min>]";
export function parseResets(text, now) {
  const m = /resets (?:([A-Z][a-z]{2}) (\d{1,2}), )?(\d{1,2})(?::(\d{2}))?(am|pm) \(([^)]+)\)/.exec(text ?? ""), t0 = Date.parse(now);
  if (m === null || (m[1] !== undefined && !MONTHS.includes(m[1]))) return null;
  let fmt; try { fmt = new Intl.DateTimeFormat("en-US", { timeZone: m[6], hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }); } catch { return null; }
  const wall = (t) => { const p = Object.fromEntries(fmt.formatToParts(t).map((x) => [x.type, Number(x.value)])); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute); };
  const day = new Date(wall(t0)), h = (Number(m[3]) % 12) + (m[5] === "pm" ? 12 : 0), dates = [-1, 0, 1].map((d) => (m[1] === undefined ? [day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + d] : [day.getUTCFullYear() + d, MONTHS.indexOf(m[1]), Number(m[2])]));
  const at = dates.flatMap(([y, mo, d]) => { const L = Date.UTC(y, mo, d, h, Number(m[4] ?? 0)); return [L - 432e5, L + 432e5].map((x) => L - (wall(x) - x)).filter((t) => wall(t) === L); }).sort((a, b) => a - b);
  const pick = m[1] === undefined ? at.find((t) => t >= t0) : at.reduce((b, t) => (Math.abs(t - t0) < Math.abs(b - t0) ? t : b), at[0]);
  return pick === undefined ? null : iso(pick);
}
export function resetsOf(line, now) {
  if (line === undefined || line === null) return { cause: "unknown", resets_at: iso(Date.parse(now)), divergence: null };
  const q = line.quotaLimits ?? {}, said = parseResets([line.message?.content ?? []].flat().map((c) => (typeof c === "string" ? c : (c?.text ?? ""))).join(" "), now);
  const epoch = Number.isFinite(q.resetsAt) ? q.resetsAt * 1000 : null, gap = epoch !== null && said !== null ? Math.abs(Date.parse(said) - epoch) / 1000 : 0;
  return { cause: q.rateLimitType ?? "unknown", resets_at: iso(epoch ?? (said === null ? Date.parse(now) : Date.parse(said))), divergence: gap > 60 ? { text: said, seconds: gap } : null };
}
export function classify(records, transcripts, now, staleMin = 30) {
  const keys = new Map(), t0 = Date.parse(now);
  for (const r of records.filter((x) => x.type !== "launched")) keys.set(r.key, Object.assign(keys.get(r.key) ?? { key: r.key, label: null, phase: null }, r.type === "started" ? { label: r.label, phase: r.phase } : {}, { agentId: r.agentId, last: r }));
  return [...keys.values()].map(({ last, ...k }) => {
    const tx = transcripts[k.agentId] ?? [], stamp = Date.parse(tx.at(-1)?.timestamp);
    const status = last.type === "result" && last.result !== null ? "stored" : last.type !== "started" ? "failed" : stamp >= t0 - staleMin * 60000 ? "running" : "dead";
    return { ...k, status, ...(status === "failed" ? resetsOf(tx.findLast(synthetic), now) : status === "dead" ? resetsOf(undefined, now) : { cause: null, resets_at: null, divergence: null }) };
  });
}
export function verify(records, from, transcripts = {}, now = iso(Date.now()), staleMin = 30) {
  if (!Number.isInteger(from) || from < 0 || from > records.length) throw new RangeError(`--from ${from}: the journal holds ${records.length} records`);
  const after = records.slice(from), origin = classify(records.slice(0, from), transcripts, now, staleMin), known = new Set(origin.map((k) => k.key)), taken = new Set();
  const cur = new Map(classify(records, transcripts, now, staleMin).map((k) => [k.key, k])), restarts = (key) => after.filter((r) => r.type === "started" && r.key === key);
  const span = (id) => { const t = transcripts[id] ?? []; return (Date.parse(t.at(-1)?.timestamp) - Date.parse(t[0]?.timestamp)) / 1000; }, replays = origin.filter((k) => k.status === "stored" && restarts(k.key).length > 0);
  const keys = origin.map((k) => {
    if (k.status === "stored") return replays.includes(k) ? { ...k, status: "replayed" } : k;
    if (k.status !== "failed" || after.length === 0) return k;
    const by = restarts(k.key).length > 0 ? k.key : after.find((r) => r.type === "started" && !known.has(r.key) && !taken.has(r.key) && r.label === k.label && r.phase === k.phase)?.key;
    const tail = after.filter((r) => r.key === (by ?? k.key)).at(-1), c = by === undefined ? k : cur.get(by);
    taken.add(by);
    return { ...c, key: k.key, status: tail?.type === "result" && tail.result === null ? "null-served" : by === undefined ? "served-from-cache" : c.status !== "stored" ? c.status : by === k.key ? "relaunched" : "replaced" };
  });
  const seconds = replays.flatMap((k) => restarts(k.key)).reduce((a, r) => a + span(r.agentId), 0), n = (s) => keys.filter((k) => k.status === s).length;
  const count = { from, relaunched: n("relaunched"), replaced: n("replaced"), served_from_cache: n("served-from-cache"), null_served: n("null-served"), replayed: { keys: replays.length, seconds: Number.isFinite(seconds) ? seconds : null } };
  return { keys, verify: count, exit: keys.some((k, i) => origin[i].status === "failed" && k.status !== "relaunched" && k.status !== "replaced") ? 1 : 0 };
}
function readRun(run) {
  const lines = (p) => readFileSync(p, "utf8").split("\n"), parse = (l, at) => { try { return JSON.parse(l); } catch { throw new Error(`${at} is not JSON`); } }, raw = lines(join(run, "journal.jsonl")), transcripts = {};
  if (raw.pop() !== "" || raw.length === 0) throw new Error(`${join(run, "journal.jsonl")} is empty or ends with an unterminated line`);
  const records = raw.map((l, i) => parse(l, `journal.jsonl:${i + 1}`));
  records.forEach((r, i) => {
    const need = SHAPE[r?.type], p = join(run, `agent-${r?.agentId}.jsonl`);
    if (need === undefined || (i === 0) !== (r.type === "launched") || need.some((f) => !(f in r)) || (need.length > 0 && !(typeof r.key === "string" && /^a[0-9a-f]+$/.test(r.agentId)))) throw new Error(`journal.jsonl:${i + 1} is not a record of the measured shape`);
    if (need.length > 0 && !(r.agentId in transcripts)) transcripts[r.agentId] = existsSync(p) ? lines(p).slice(0, -1).map((l, j) => parse(l, `agent-${r.agentId}.jsonl:${j + 1}`)) : null;
  });
  return { records, transcripts };
}
export function main(argv) {
  const o = {}; for (let i = 0; i < argv.length; i += 2) { if (!/^--(run|verify|from|out|now|stale)$/.test(argv[i]) || argv[i + 1] === undefined || argv[i].slice(2) in o) throw new Error(USAGE); o[argv[i].slice(2)] = argv[i + 1]; }
  if ((o.run === undefined) === (o.verify === undefined) || o.out === undefined || (o.verify === undefined ? o.from !== undefined : !/^\d+$/.test(o.from ?? "")) || !(Number(o.stale ?? 30) >= 0) || !(o.now === undefined || /^\d{4}-\d\d-\d\dT[\d:.]+(Z|[+-]\d\d:\d\d)$/.test(o.now))) throw new Error(USAGE);
  const run = resolve(o.run ?? o.verify), out = resolve(o.out), rel = relative(run, out).split(/[\\/]/), now = iso(o.now === undefined ? Date.now() : Date.parse(o.now)), stale = Number(o.stale ?? 30);
  if (rel[0] !== ".." && !isAbsolute(rel.join("/"))) throw new Error(`--out ${out} lies inside the run directory: the tool never writes there`);
  const { records, transcripts } = readRun(run), runId = /wf_[\w-]+$/.exec(basename(run))?.[0] ?? basename(run), sdir = join(dirname(dirname(dirname(run))), "workflows", "scripts");
  const found = basename(dirname(dirname(run))) === "subagents" && existsSync(sdir) ? readdirSync(sdir).filter((f) => f.endsWith(`-${runId}.js`)).sort()[0] : undefined, script = found === undefined ? null : join(sdir, found).replaceAll("\\", "/");
  const res = o.run !== undefined ? { keys: classify(records, transcripts, now, stale) } : verify(records, Number(o.from), transcripts, now, stale), failed = res.keys.filter((k) => k.status === "failed"), exit = res.exit ?? (failed.length > 0 ? 1 : 0);
  const say = res.verify ? ["verified: each failed key relaunched or replaced", "not verified: a failed key neither relaunched nor replaced"] : ["nothing to relaunch", "the orchestrator relaunches the failed keys after resume_at"];
  const text = `${JSON.stringify({ schema: "monark.relance.v1", run: run.replaceAll("\\", "/"), script, journal_lines: records.length, now, keys: res.keys, resume_at: failed.map((k) => k.resets_at).sort().at(-1) ?? null,
    resume: failed.length === 0 ? null : `Workflow(${JSON.stringify({ scriptPath: script, resumeFromRunId: runId })})`, verdict: `${Object.entries(Object.groupBy(res.keys, (k) => k.status)).map(([s, ks]) => `${s} ${ks.length}`).join(", ") || "no key"}; ${say[exit]}`, ...(res.verify ? { verify: res.verify } : {}) }, null, 2)}\n`;
  writeFileSync(out, text);
  console.log(`${text}relance-result ${JSON.stringify({ exit, record: out.replaceAll("\\", "/"), sha256: createHash("sha256").update(text).digest("hex") })}`);
  return exit;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`relance: ${e instanceof Error ? e.message : String(e)}`); process.exitCode = 2; }
