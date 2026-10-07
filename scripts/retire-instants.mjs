// scripts/retire-instants.mjs -- RETIRE-INSTANTS-1 (ENGINE-ROW-RETIRE-PATH-1, lot RH-1; docs/G0-lot-retire-latency-rehearsal-1.md section 8):
// the retire-latency-v1 entry of one cycle, read from its evidence instead of copied by hand. Node 24, no dependency.
//
//   node scripts/retire-instants.mjs <evidence.json> [--out <instants.json>]
//
// Closed evidence: {"format": "retire-evidence-v1", "cycle": <as scripts/retire-latency.mjs>, "sources": {<instant>: <source>}, "mention":
// null | "<text>"}. Each instant has its kinds of source (KINDS): a commit {"commit": <full sha>, "repo": <dir>} reads its committer date,
// `git -C <repo> log -1 --format=%cI <sha>`, in UTC, never the author date (RUNBOOK "Retire a kata row", steps 1, 2 and 5: T_a, T_b, T_e);
// a clock {"clock": "YYYY-MM-DDTHH:MM:SSZ"} is a reading written down at the act (T_c the CI green on the head, T_d the push returned; T_a
// of live:<k>, the close of a quarter E_k, 00:00:00Z of its first day after it, apps/harness/src/policy-retire.ts l.80: an adr: T_a is a
// commit); T_e is a merge commit (two parents). A CA {"ca": <file>} is the checked_at, cut to the second, of a record of
// scripts/verify-harness.mjs that the script itself rates (recordKind, failedOf) "green", or "local" in a rehearsal only, with its 18
// checks by name (CHECK_NAMES), each an object, no more (T_f). A probe {"probe": <file>} is the received_at of a retire-probe-v1 record
// that the probe accepted (ok true, problem null, status 200, the expected digest), made against an https api off the loopback (by
// address: no loopback or unspecified address, in any spelling, nor localhost) with an authorized TLS handshake (tls_authorized), or any
// api in a rehearsal only, as a local CA (T_g). Which instants a cycle holds, and their order, is the report's: the
// entry is printed, one line on stdout, only once report() accepts it; --out also writes it, through a temporary file and a rename
// (writeAtomic of scripts/verify-harness.mjs: no shell redirection, which PowerShell 5.1 writes in UTF-16).
// Refused (exit 1) by code: evidence_invalid, source_unreadable, source_not_green, or the report's own; exit 2: usage.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { BlockList, isIP } from "node:net";
import { LatencyError, report } from "./retire-latency.mjs";
import { CHECK_NAMES, failedOf, recordKind, writeAtomic } from "./verify-harness.mjs";

export const KINDS = Object.freeze({ T_a: ["commit", "clock"], T_b: ["commit"], T_c: ["clock"], T_d: ["clock"], T_e: ["commit"], T_f: ["ca"], T_g: ["probe"] });
const KEYS = { commit: ["commit", "repo"], clock: ["clock"], ca: ["ca"], probe: ["probe"] };
const no = (code, detail) => { throw new LatencyError(code, detail); };
const second = (ms) => new Date(Math.floor(ms / 1000) * 1000).toISOString().replace(".000Z", "Z");
const obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
/** The loopback and unspecified addresses, IPv4, IPv6 and IPv4-mapped: each reaches a local listener. */
const LOOPBACK = new BlockList();
LOOPBACK.addSubnet("127.0.0.0", 8, "ipv4");
LOOPBACK.addSubnet("0.0.0.0", 8, "ipv4");
LOOPBACK.addSubnet("::1", 128, "ipv6");
LOOPBACK.addSubnet("::", 128, "ipv6");
LOOPBACK.addSubnet("::ffff:127.0.0.0", 104, "ipv6");
LOOPBACK.addSubnet("::ffff:0.0.0.0", 104, "ipv6");
/** A host of the loopback, by address: the URL parser has normalised an IPv4 (0 and 127.1 to 0.0.0.0 and 127.0.0.1) and an IPv6 in
 *  brackets; the brackets and a trailing dot are taken off, then an IP is tested against LOOPBACK, and a name is localhost or not. */
const loopbackHost = (hostname) => { const h = hostname.replace(/^\[(.*)\]$/, "$1").replace(/\.+$/, "").toLowerCase(), v = isIP(h); return h === "localhost" || (v !== 0 && LOOPBACK.check(h, v === 6 ? "ipv6" : "ipv4")); };
/** The api of a probe record is a deployed one: https (an http target is never a deployment record, as recordKind) off the loopback. */
const deployedApi = (api) => { const u = typeof api === "string" && URL.canParse(api) ? new URL(api) : null; return u !== null && u.protocol === "https:" && !loopbackHost(u.hostname); };

/** The default reader of a commit: "<committer date> <parent sha>...", git -C <repo>, no inherited GIT_* variable (TEST-GIT-ENV-ISOLATION-1). */
export function committerDate(repo, sha) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
  const r = spawnSync("git", ["-C", repo, "log", "-1", "--format=%cI %P", `${sha}^{commit}`], { encoding: "utf8", env });
  if (r.status !== 0) throw new Error(String(r.stderr ?? "").trim() || String(r.error));
  return r.stdout.trim();
}
/** E_k, the close of quarter k >= 1: 00:00:00Z of the first day after it (apps/harness/src/policy-retire.ts l.80, Date.UTC(2026, 9 + 3k, 1)). */
const quarterClose = (s) => { const d = new Date(Date.parse(s)), k = ((d.getUTCFullYear() - 2026) * 12 + d.getUTCMonth() - 9) / 3; return Number.isInteger(k) && k >= 1 && d.getTime() === Date.UTC(2026, 9 + 3 * k, 1); };
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

/** instant(name, source, io) -> the UTC instant, to the second, that the source gives. */
export function instant(name, source, { git = committerDate, read = readJson } = {}, cycle = "real") {
  const kind = Object.keys(KEYS).find((k) => obj(source) && Object.keys(source).sort().join() === KEYS[k].join() && (KINDS[name] ?? []).includes(k));
  if (kind === undefined) no("evidence_invalid", `${name}: a source of ${(KINDS[name] ?? ["no kind"]).join(" or ")}, its keys only`);
  const at = (what, f) => { try { return f(); } catch (e) { return no("source_unreadable", `${name} ${what}: ${e instanceof Error ? e.message : String(e)}`); } };
  if (kind === "clock") {
    if (name === "T_a" && !quarterClose(source.clock)) no("evidence_invalid", `${name}: a clock is the close of a quarter (live:<k>), 00:00:00Z of its first day after it; an adr: trigger is a commit`);
    return source.clock;
  }
  if (kind === "commit") {
    if (!/^[0-9a-f]{40}$/.test(source.commit) || typeof source.repo !== "string") no("evidence_invalid", `${name}: a full sha of 40 hex and a repo`);
    const [date = "", ...parents] = String(at(`${source.commit} in ${source.repo}`, () => git(source.repo, source.commit))).split(" "), t = Date.parse(date);
    if (name === "T_e" && parents.length !== 2) no("evidence_invalid", `${name}: ${source.commit} is not a merge commit (${String(parents.length)} parent(s))`);
    return Number.isFinite(t) ? second(t) : no("source_unreadable", `${name}: no committer date for ${source.commit}`);
  }
  const r = at(source[kind], () => read(source[kind]));
  if (kind === "ca") {
    const checks = Array.isArray(r?.checks) && r.checks.every(obj) ? r.checks : [], names = checks.map((c) => c.name); // a non-object entry: no checks
    const rated = obj(r?.tls) && obj(r?.tls_mcp) ? recordKind(failedOf(checks, r.tls, r.tls_mcp), [r.tls, r.tls_mcp]) : "failed";
    if (!(cycle === "rehearsal" ? ["green", "local"] : ["green"]).includes(rated) || names.length !== CHECK_NAMES.length || !CHECK_NAMES.every((n) => names.includes(n))) {
      no("source_not_green", `${name}: ${source.ca} is rated ${rated} by verify-harness with ${String(names.length)} of its ${String(CHECK_NAMES.length)} checks; a ${String(cycle)} cycle takes ${cycle === "rehearsal" ? "green or local" : "green"} with all of them`);
    }
    const t = Date.parse(r.checked_at);
    return Number.isFinite(t) ? second(t) : no("source_unreadable", `${name}: ${source.ca} has no checked_at`);
  }
  if (r?.format !== "retire-probe-v1" || r.ok !== true || r.problem !== null || r.status !== 200 || r.equal !== true || typeof r.received_at !== "string") {
    no("source_not_green", `${name}: ${source.probe} is no retire-probe-v1 record that the probe accepted (ok, problem null, status 200, the expected digest)`);
  }
  if (cycle !== "rehearsal" && !(r.tls_authorized === true && deployedApi(r.api) && typeof r.api_host === "string" && r.api_host !== "")) {
    no("source_not_green", `${name}: ${source.probe} probed ${String(r.api)} (Host ${String(r.api_host)}, TLS authorized ${String(r.tls_authorized)}); a ${String(cycle)} cycle takes a probe of an https api off the loopback with an authorized TLS handshake, a local one in a rehearsal only`);
  }
  return r.received_at;
}

/** entry(evidence, io) -> the retire-latency-v1 entry, accepted by report(); throws a LatencyError by its code. */
export function entry(evidence, io) {
  if (!obj(evidence) || Object.keys(evidence).sort().join() !== "cycle,format,mention,sources" || evidence.format !== "retire-evidence-v1" || !obj(evidence.sources)) {
    no("evidence_invalid", "retire-evidence-v1 holds format, cycle, sources and mention, nothing else");
  }
  const instants = Object.fromEntries(Object.entries(evidence.sources).map(([name, s]) => [name, instant(name, s, io, evidence.cycle)]));
  const e = { format: "retire-latency-v1", cycle: evidence.cycle, instants, mention: evidence.mention };
  report(e);
  return e;
}

export function main(argv, io) {
  if (!(argv.length === 1 || (argv.length === 3 && argv[1] === "--out" && argv[2] !== "" && !argv[2].startsWith("-"))) || argv[0].startsWith("-")) { console.error("usage: retire-instants.mjs <evidence.json> [--out <instants.json>]"); return 2; }
  try {
    let evidence;
    try { evidence = readJson(argv[0]); } catch (e) { throw new LatencyError("evidence_invalid", `${argv[0]}: ${e instanceof Error ? e.message : String(e)}`); }
    const line = JSON.stringify(entry(evidence, io));
    console.log(line);
    if (argv[2] !== undefined) writeAtomic(argv[2], `${line}\n`);
    return 0;
  } catch (e) {
    console.error(`retire-instants REFUSED: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

if (import.meta.main !== false) process.exitCode = main(process.argv.slice(2)); // as scripts/retire-latency.mjs: an import runs nothing
