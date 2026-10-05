// scripts/lot-size-integration.mjs: the single implementation of the R-25 integration rule (ADR-M003 D9 nonies, lot
// R25-INTEGRATION-RULE-1, plan docs/G0-lot-r25-integration-rule-1.md). Zero dependency, node: only, Node >= 20 (the
// r25 job calls it before setup-node). Run from the MEASURED tree by the CI job r25-taille-de-lot and by the oracle's
// r25 gate (scripts/oracle/r25.mjs), so the two can never hold two copies of the algorithm.
//   node scripts/lot-size-integration.mjs proof (--event <payload.json> | --pr <n>) [--base <ref>] --out <file>
//   node scripts/lot-size-integration.mjs count --ci <ci.yml> --base <ref> --proof <file> --written <code> <content>
// `proof` reads GitHub (CI: fetch + R25_READ_TOKEN on GITHUB_API_URL; local: the `gh api` transport) and writes the
// proof only when every page answered 200 (any old file is removed first). `count` prints ONE stdout line
// `<mode> <code> <content>` (detail on stderr). Only mode `integration` lowers a count, to the sum over the commits no
// proving merged PR carries: (b) diff to the parent, (a) `git show --remerge-diff` of a merge; at most the written
// count W. Anything else (no or foreign proof, a non-candidate PR, an unproven commit touching the gate, git < 2.36,
// an error) returns W: the module is never a source of green.
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const REPO = "KraidleAI/monark-governance";
export const SCHEMA = "monark.r25-proof.v1";
export const R25_DIFF_RE = /^\s*([A-Z_]+)=\$\(git diff --shortstat "origin\/\$\{\{ github\.base_ref \}\}\.\.\.HEAD" -- (.+)\) \|\| \{\s*$/;
export const L = ["lot/etude-suite", "main"]; // the closed list, plus base/<name> under the closed grammar below (G0 2.1)
export const inL = (ref) => typeof ref === "string" && (L.includes(ref) || /^base\/[a-z0-9][a-z0-9.-]*$/.test(ref));
export const EXCEPTED_PRS = [56, 89]; // green by a keyed exception (D9 quinquies, octies), never by a measure: they prove nothing
export const GATE_FILES = [".github/workflows/", "scripts/lot-size-integration.mjs", "scripts/oracle/r25.mjs", "scripts/oracle/run.mjs"];
const CHECK = "r25-taille-de-lot", SHA = /^[0-9a-f]{40}$/, EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
const gitIn = (cwd) => (...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] }).trim();
const rows = (s) => s.split("\n").filter((l) => l !== "");

/** Candidate (G0 2.2): head and target in L, both in this repository, distinct; read from GitHub's PR object only. */
export function isCandidate(id) {
  return id?.head_repo === REPO && id.base_repo === REPO && inL(id.head_ref) && inL(id.base_ref) && id.head_ref !== id.base_ref;
}

/** A merged PR proves (G0 2.3) iff merged into L, not keyed-excepted, and r25-taille-de-lot green on its exact head. */
export const proves = (p) => p.merged_at != null && !EXCEPTED_PRS.includes(p.number) && inL(p.base_ref) && p.r25 === "success";

/** The commits the proving PRs brought to their target, derived from the GRAPH of merge_commit_sha M, never from names. */
export function provenSet(git, merged) {
  const s = new Set();
  for (const p of merged.filter(proves)) {
    if (!SHA.test(p.merge_commit_sha) || !SHA.test(p.head_sha)) continue;
    let m, ps;
    try { [m, ...ps] = git("rev-list", "--parents", "-n", "1", p.merge_commit_sha).split(" "); } catch { continue; } // absent (rewritten): nothing proven
    if (ps.length === 2 && ps[1] === p.head_sha) for (const c of [m, ...rows(git("rev-list", ps[1], `^${ps[0]}`))]) s.add(c);
    else if (ps.length === 1) s.add(m);
  }
  return s;
}

/** The STAT (CODE) and CONTENT_STAT pathspecs of the workflow, by the R25_DIFF_RE of test 38 and of the oracle. */
export function specsOf(ciText) {
  const specs = ciText.split(/\r?\n/).map((l) => R25_DIFF_RE.exec(l)).filter((m) => m !== null).map((m) => m[2].split(/\s+/).map((t) => t.replace(/^'(.*)'$/, "$1")));
  if (specs.length !== 2) throw new Error(`expected the STAT and CONTENT_STAT lines of the r25 job, read ${specs.length}`);
  return specs;
}

const metric = (stat) => ["insertion", "deletion"].reduce((n, w) => n + Number(new RegExp(`(\\d+) ${w}`).exec(stat)?.[1] ?? 0), 0);
// The new material of one commit: (b) diff to its parent; (a) a merge's remerge-diff (its conflict resolutions and any
// line added to a clean merge); a root or an octopus: the full diff to the empty tree or the first parent (fail-closed).
const change = (c, ps) => (ps.length === 2 ? ["show", "--remerge-diff", "--format=", c] : ["diff", ps[0] ?? EMPTY_TREE, c]);

/** The counts R-25 compares to its bounds (G0 section 3). written = [code, content] as counted today (W). */
export function effective({ cwd, ciText, base, proof, written }) {
  const out = (mode, code = written[0], content = written[1], detail = []) => ({ mode, code, content, detail });
  try {
    const git = gitIn(cwd), v = /(\d+)\.(\d+)/.exec(git("--version")) ?? ["", "0", "0"];
    if (Number(v[1]) * 1000 + Number(v[2]) < 2036) throw new Error(`git ${v[0]} has no --remerge-diff (2.36)`);
    const specs = specsOf(ciText), b = git("rev-parse", "--verify", "--end-of-options", `${base}^{commit}`);
    const [head, p1, p2] = git("rev-list", "--parents", "-n", "1", "HEAD").split(" "), heads = p2 !== undefined && p1 === b ? [head, p2] : [head];
    if (!(proof?.schema === SCHEMA && proof.repo === REPO && proof.complete === true && Array.isArray(proof.merged) && heads.includes(proof.pr?.head_sha))) return out("unproven");
    if (!isCandidate(proof.pr)) return out("written");
    const proven = provenSet(git, proof.merged), sum = [0, 0], detail = [];
    for (const [c, ...ps] of rows(git("rev-list", "--parents", "HEAD", `^${b}`)).map((l) => l.split(" "))) {
      if (proven.has(c)) continue;
      const gate = rows(git(...change(c, ps), "--name-only")).some((f) => GATE_FILES.some((g) => f === g || (g.endsWith("/") && f.startsWith(g))));
      if (gate) return out("gate-files", written[0], written[1], [`${c} touches the gate unproven: every line counts`]);
      const n = specs.map((s) => metric(git(...change(c, ps), "--shortstat", "--", ...s)));
      n.forEach((x, i) => { sum[i] += x; });
      detail.push(`${c} ${ps.length === 2 ? "merge" : "commit"} ${n[0]} ${n[1]}`);
    }
    return out("integration", Math.min(written[0], sum[0]), Math.min(written[1], sum[1]), detail);
  } catch (e) { return out("error", written[0], written[1], [String(e.message).split("\n")[0]]); }
}

/** The proof (G0 2.4) from GitHub's PR object `pr` and a GET transport `api`; complete or thrown, never partial. */
export async function buildProof({ api, cwd, pr, base }) {
  const git = gitIn(cwd), merged = [];
  const id = { number: pr?.number, head_ref: pr?.head?.ref, head_repo: pr?.head?.repo?.full_name, base_ref: pr?.base?.ref, base_repo: pr?.base?.repo?.full_name, head_sha: pr?.head?.sha };
  const proof = { schema: SCHEMA, repo: REPO, pr: id, base_sha: null, head_sha: git("rev-parse", "HEAD"), complete: true, merged };
  if (!isCandidate(id)) return proof; // no API read: nothing to prove
  proof.base_sha = git("rev-parse", "--verify", "--end-of-options", `${base ?? `origin/${id.base_ref}`}^{commit}`);
  const R = new Set(rows(git("rev-list", "HEAD", `^${proof.base_sha}`)));
  for (let page = 1; ; page++) {
    const got = await api(`/repos/${REPO}/pulls?state=closed&per_page=100&page=${page}`);
    if (!Array.isArray(got) || page > 200) throw new Error(`closed PR page ${page} unreadable`);
    for (const p of got) if (p.merged_at && R.has(p.merge_commit_sha)) merged.push({ number: p.number, base_ref: p.base?.ref, merged_at: p.merged_at, merge_commit_sha: p.merge_commit_sha, head_sha: p.head?.sha, r25: null });
    if (got.length < 100) break;
  }
  for (const m of merged) {
    if (!SHA.test(m.head_sha)) throw new Error(`PR #${m.number}: no head sha`);
    const r = await api(`/repos/${REPO}/commits/${m.head_sha}/check-runs?check_name=${CHECK}&per_page=100`);
    if (!Array.isArray(r?.check_runs) || r.total_count !== r.check_runs.length) throw new Error(`PR #${m.number}: check runs unreadable or paginated`);
    const runs = r.check_runs.filter((c) => c.name === CHECK && c.app?.slug === "github-actions");
    m.r25 = runs.length > 0 && runs.every((c) => c.conclusion === "success") ? "success" : "not-success";
  }
  return proof;
}

const fetchApi = (root, token) => async (path) => {
  if (!token) throw new Error("R25_READ_TOKEN is empty: no anonymous read");
  const r = await fetch(`${root}${path}`, { headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28" }, signal: AbortSignal.timeout(30_000) });
  if (r.status !== 200) throw new Error(`GET ${path}: HTTP ${r.status}`); // a 403 (scope not granted) included: no proof
  return r.json();
};
const ghApi = async (path) => JSON.parse(execFileSync("gh", ["api", path.slice(1)], { encoding: "utf8", maxBuffer: 1 << 28 }));

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, ...argv] = process.argv.slice(2), opt = (k, n = 1) => (argv.includes(k) ? argv.slice(argv.indexOf(k) + 1, argv.indexOf(k) + 1 + n) : []);
  try {
    if (cmd === "proof") {
      const [out] = opt("--out"), [event] = opt("--event"), [n] = opt("--pr");
      if (!out || (!event && !/^\d+$/.test(n ?? ""))) throw new Error("usage: proof (--event <payload> | --pr <n>) [--base <ref>] --out <file>");
      rmSync(out, { force: true });
      const pr = event ? JSON.parse(readFileSync(event, "utf8")).pull_request : await ghApi(`/repos/${REPO}/pulls/${n}`);
      const api = event ? fetchApi(process.env.GITHUB_API_URL ?? "https://api.github.com", process.env.R25_READ_TOKEN) : ghApi;
      const proof = await buildProof({ api, cwd: process.cwd(), pr, base: opt("--base")[0] });
      writeFileSync(out, `${JSON.stringify(proof, null, 2)}\n`);
      console.error(`r25-integration: proof written, candidate=${isCandidate(proof.pr)}, merged PRs=${proof.merged.length}`);
    } else if (cmd === "count") {
      const [ci] = opt("--ci"), [base] = opt("--base"), [pf] = opt("--proof"), w = opt("--written", 2);
      if (!ci || !base || !pf || w.length !== 2 || !w.every((x) => /^\d+$/.test(x))) throw new Error("usage: count --ci <ci.yml> --base <ref> --proof <file> --written <code> <content>");
      let proof = null;
      try { proof = JSON.parse(readFileSync(pf, "utf8")); } catch { /* no readable proof: unproven */ }
      const r = effective({ cwd: process.cwd(), ciText: readFileSync(ci, "utf8"), base, proof, written: w.map(Number) });
      for (const d of [`mode ${r.mode}`, ...r.detail]) console.error(`r25-integration: ${d}`);
      console.log(`${r.mode} ${r.code} ${r.content}`);
    } else throw new Error("usage: lot-size-integration.mjs proof|count ...");
  } catch (e) { console.error(`r25-integration: ${String(e.message).split("\n")[0]}`); process.exitCode = 2; }
}
