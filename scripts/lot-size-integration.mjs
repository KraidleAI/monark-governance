// scripts/lot-size-integration.mjs: the single implementation of the R-25 integration rule (ADR-M003 D9 nonies, lot
// R25-INTEGRATION-RULE-1a, wired by 1b, plan docs/G0-lot-r25-integration-rule-1.md). Zero dependency, node: only, Node >= 20 (the
// r25 job calls it before setup-node). Run by the CI job r25-taille-de-lot from the measured tree, and by the oracle's
// r25 gate (scripts/oracle/r25.mjs) from the ORACLE's tree, only when the measured tree holds the same bytes (G2 B-3).
//   node scripts/lot-size-integration.mjs proof (--event <payload.json> | --pr <n>) [--base <ref>] --out <file>
//   node scripts/lot-size-integration.mjs count --ci <ci.yml> --base <ref> --proof <file> --written <code> <content>
// `proof` reads GitHub (CI: fetch + R25_READ_TOKEN on GITHUB_API_URL; local: the `gh api` transport) and writes the
// proof only when every page answered 200 (any old file is removed first). `count` prints ONE stdout line
// `<mode> <code> <content>` (detail on stderr). Only mode `integration` lowers a count, to the sum over the commits no
// proving merged PR carries: (b) diff to the parent, (a) `git show --remerge-diff` of a merge (a PR's own merge M
// included, G2 B-1; whole files under a content conflict, its largest diff to a parent under a structural one, G2 B-4;
// at least its combined diff without renames, delta2 B-5); at most the written count W. A PR whose contribution M^1..M exceeds a bound proves nothing (G2 B-2).
// Anything else (no or foreign proof, a non-candidate PR, an unproven commit touching the gate, git < 2.40,
// an error) returns W: the module is never a source of green. `pin --ci <ci.yml> --base <ref>` prints the pinned read of the job's W, or refuses (refusals).
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url"; import { inflateSync } from "node:zlib";

export const REPO = "KraidleAI/monark-governance";
export const SCHEMA = "monark.r25-proof.v1";
export const R25_DIFF_RE = /^\s*([A-Z_]+)=\$\(git diff --shortstat "origin\/\$\{\{ github\.base_ref \}\}\.\.\.HEAD" -- (.+)\) \|\| \{\s*$/;
export const L = ["lot/etude-suite", "main"]; // the closed list, plus base/<name> under the closed grammar below (G0 2.1)
export const inL = (ref) => typeof ref === "string" && (L.includes(ref) || /^base\/[a-z0-9][a-z0-9.-]*$/.test(ref));
export const EXCEPTED_PRS = [56, 89]; // green by a keyed exception (D9 quinquies, octies), never by a measure: they prove nothing
export const GATE_FILES = [".github/workflows/", "scripts/lot-size-integration.mjs", "scripts/oracle/r25.mjs", "scripts/oracle/run.mjs"];
export const BOUND_KEYS = ["VIBEGATES_PR_LIMIT", "VIBEGATES_CONTENT_LIMIT"]; // the bounds of the STAT and CONTENT_STAT counts
const CHECK = "r25-taille-de-lot", SHA = /^[0-9a-f]{40}$/, EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
// Options that change a count, pinned over any user or system config so the CI and the oracle cannot diverge (G2 m-2): no user
// attributes file (G2 m-a) nor system one (GIT_ATTR_NOSYSTEM, delta3 m-f); messages in English (counts and conflict headers are
// parsed); GIT_DIFF_OPTS dropped (G2 B-4); git's default bigFileThreshold (delta2 m-d); attributes of attrTree, not the tree's (B-6), matched case-sensitively (a clone on NTFS sets core.ignorecase).
// The oracle's W read takes the same PIN and env (delta3 m-g), and so do the r25 job's two W counts, through `pin` (O-1). A non-empty $GIT_DIR/info/attributes, that --attr-source does not replace, is an error: W (delta3 m-f).
export const infoAttributes = (cwd) => (statSync(execFileSync("git", ["-C", cwd, "rev-parse", "--path-format=absolute", "--git-path", "info/attributes"], { encoding: "utf8", env: GIT_ENV() }).trim(), { throwIfNoEntry: false })?.size ?? 0) > 0;
export const PIN = ["-c", "merge.conflictStyle=merge", "-c", "diff.algorithm=myers", "-c", "diff.renames=true", "-c", "merge.renames=true", "-c", "merge.directoryRenames=conflict", "-c", "diff.suppressBlankEmpty=false", "-c", "core.attributesFile=", "-c", "core.bigFileThreshold=512m", "-c", "core.ignorecase=false"];
export const GIT_ENV = (base = process.env) => ({ ...base, GIT_DIFF_OPTS: undefined, LC_ALL: "C", GIT_ATTR_NOSYSTEM: "1" }); const gitIn = (cwd, raw = false, src = attrTree(cwd)) => (...a) => { const o = execFileSync("git", ["-C", cwd, `--attr-source=${src}`, ...PIN, ...a], { encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"], env: GIT_ENV() }); return raw ? o : o.trim(); };
const rows = (s) => s.split("\n").filter((l) => l !== "");

/** Candidate (G0 2.2): head and target in L, both in this repository, distinct; read from GitHub's PR object only. */
export function isCandidate(id) {
  return id?.head_repo === REPO && id.base_repo === REPO && inL(id.head_ref) && inL(id.base_ref) && id.head_ref !== id.base_ref;
}

/** A merged PR proves (G0 2.3) iff merged into L, not keyed-excepted, and r25-taille-de-lot green on its exact head. */
export const proves = (p) => p.merged_at != null && !EXCEPTED_PRS.includes(p.number) && inL(p.base_ref) && p.r25 === "success";

/** The commits the proving PRs brought to their target, derived from the GRAPH of merge_commit_sha M, never from names.
 * M itself is never proven (a local merge pushed to the trunk can carry lines: its remerge-diff counts, 0 when clean), and
 * a PR proves only if what it brought to its target, M^1..M, stays under each bound (a green run says nothing of the
 * target it was measured against: retarget, target pushed back, old run re-run). */
export function provenSet(git, merged, specs, bounds) {
  const s = new Set();
  for (const p of merged.filter(proves)) {
    if (!SHA.test(p.merge_commit_sha) || !SHA.test(p.head_sha)) continue;
    let m, ps;
    try { [m, ...ps] = git("rev-list", "--parents", "-n", "1", p.merge_commit_sha).split(" "); } catch { continue; } // absent (rewritten): nothing proven
    if (specs.some((sp, i) => metric(git("diff", "--shortstat", ps[0] ?? EMPTY_TREE, m, "--", ...sp)) > bounds[i])) continue;
    if (ps.length === 2 && ps[1] === p.head_sha) for (const c of rows(git("rev-list", ps[1], `^${ps[0]}`))) s.add(c);
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

/** The two bounds, from the r25 job only (the job block holding the STAT lines), each `KEY: "<digits>"` declared exactly
 * once there: a decoy in another job or a second declaration picks nothing (G2 m-c); else an error, so W. */
export function boundsOf(ciText) {
  const lines = ciText.split(/\r?\n/), top = (l) => /^ {0,2}[^\s#]/.test(l), at = lines.findIndex((l) => R25_DIFF_RE.test(l));
  const from = lines.findLastIndex((l, i) => i <= at && top(l)), to = lines.findIndex((l, i) => i > at && top(l));
  const job = at < 0 || from < 0 ? [] : lines.slice(from, to < 0 ? lines.length : to);
  return BOUND_KEYS.map((k) => {
    const v = job.map((l) => new RegExp(`^\\s*${k}:\\s*["']?(\\d+)["']?\\s*(#.*)?$`).exec(l)?.[1]).filter((x) => x !== undefined);
    if (v.length !== 1) throw new Error(`bound ${k} declared ${v.length} times in the r25 job, not once`);
    return Number(v[0]);
  });
}

const metric = (stat) => { if (stat.trim() !== "" && !/ (insertion|deletion)/.test(stat)) throw new Error(`unread --shortstat ${stat.trim()}`); return ["insertion", "deletion"].reduce((n, w) => n + Number(new RegExp(`(\\d+) ${w}`).exec(stat)?.[1] ?? 0), 0); }; // never 0 unread (delta2 O-2)
// The new material of one commit: (b) diff to its parent; (a) a merge's remerge-diff (its conflict resolutions and any
// line added to a clean merge); a root or an octopus: the full diff to the empty tree or the first parent (fail-closed).
const change = (c, ps) => (ps.length === 2 ? ["show", "--remerge-diff", "--format=", c] : ["diff", ps[0] ?? EMPTY_TREE, c]);
const REMERGE = ["show", "--remerge-diff", "--unified=99999999", "--no-ext-diff", "--no-textconv", "--no-color", "--format="];
/** A merge's lines from its remerge-diff with whole files as context (G2 B-4): every +/- line and, in a file with a content
 * conflict, every line, since a resolution can keep a side's lines no R-25 measured (a proven PR's net hides what it adds
 * then removes). Any other conflict (rename/delete, modify/delete, ...) or one without a hunk shows nothing: null. */
function remerged(patch) {
  let n = 0;
  for (const e of patch.split(/^(?=diff --git )/m)) {
    const at = e.search(/^@@ /m), kinds = [...(at < 0 ? e : e.slice(0, at)).matchAll(/^remerge CONFLICT \(([^)]*)\)/gm)].map((m) => m[1]);
    if (kinds.some((k) => k !== "content" && k !== "add/add") || (kinds.length > 0 && at < 0)) return null;
    if (at >= 0) for (const l of e.slice(at).split("\n").slice(0, -1)) if (l[0] === "+" || l[0] === "-" || (kinds.length > 0 && !l.startsWith("@@ ") && l[0] !== "\\")) n++;
  }
  return n;
}
/** A merge's combined diff without renames (G2 delta2 B-5): the lines of M absent at the same path from EACH parent; a merge's
 * rename detection (file or directory) carries lines its remerge-diff never shows. A floor: null (structural) stays null. */
const both = (r, k) => (r === null ? null : Math.max(r, k));
const COMBINED = ["show", "--cc", "--no-renames", "--no-ext-diff", "--no-textconv", "--no-color", "--unified=0", "--format="];
function combined(patch) {
  let n = 0, h = false;
  for (const l of patch.split("\n")) if (/^diff --(cc|combined) /.test(l)) h = false; else if (l.startsWith("@@@")) h = true; else if (h && /[+-]/.test(l.slice(0, 2))) n++;
  return n;
}

/** The counts R-25 compares to its bounds (G0 section 3). written = [code, content] as counted today (W). */
export function effective({ cwd, ciText, base, proof, written }) {
  const out = (mode, code = written[0], content = written[1], detail = []) => ({ mode, code, content, detail });
  try {
    const git = gitIn(cwd), raw = gitIn(cwd, true), v = /(\d+)\.(\d+)/.exec(git("--version")) ?? ["", "0", "0"];
    if (Number(v[1]) * 1000 + Number(v[2]) < 2040) throw new Error(`git ${v[0]} is older than 2.40 (--remerge-diff 2.36, --attr-source 2.40): the count of today`); if (infoAttributes(cwd)) throw new Error("$GIT_DIR/info/attributes is not empty: --attr-source does not replace it (delta3 m-f)");
    const specs = specsOf(ciText), b = git("rev-parse", "--verify", "--end-of-options", `${base}^{commit}`);
    const [head, p1, p2] = git("rev-list", "--parents", "-n", "1", "HEAD").split(" "), heads = p2 !== undefined && p1 === b ? [head, p2] : [head];
    if (!(proof?.schema === SCHEMA && proof.repo === REPO && proof.complete === true && Array.isArray(proof.merged) && heads.includes(proof.pr?.head_sha))) return out("unproven");
    if (!isCandidate(proof.pr)) return out("written");
    const proven = provenSet(git, proof.merged, specs, boundsOf(ciText)), sum = [0, 0], detail = [];
    for (const [c, ...ps] of rows(git("rev-list", "--parents", "HEAD", `^${b}`)).map((l) => l.split(" "))) {
      if (proven.has(c)) continue;
      // A merge whose remerge-diff hides what a conflict kept (null: a structural conflict) counts, like its gate check, its
      // largest diff to a parent (G2 B-4, fail-closed).
      const per = specs.map((s) => (ps.length === 2 ? both(remerged(raw(...REMERGE, c, "--", ...s)), combined(raw(...COMBINED, c, "--", ...s))) : metric(git(...change(c, ps), "--shortstat", "--", ...s))));
      const odd = per.includes(null), views = odd ? ps.map((p) => ["diff", p, c]) : [change(c, ps)];
      const gate = views.some((v) => git(...v, "--name-only", "-z").split("\0").some((f) => GATE_FILES.some((g) => f === g || (g.endsWith("/") && f.startsWith(g)))));
      if (gate) return out("gate-files", written[0], written[1], [`${c} touches the gate unproven: every line counts`]);
      const n = per.map((x, i) => x ?? Math.max(...ps.map((p) => metric(git("diff", "--shortstat", p, c, "--", ...specs[i])))));
      n.forEach((x, i) => { sum[i] += x; });
      detail.push(`${c} ${odd ? "structural-merge" : ps.length === 2 ? "merge" : "commit"} ${n[0]} ${n[1]}`);
    }
    return out("integration", Math.min(written[0], sum[0]), Math.min(written[1], sum[1]), detail);
  } catch (e) { return out("error", written[0], written[1], [String(e.message).split("\n")[0]]); }
}

/** The proof (G0 2.4) from GitHub's PR object `pr` and a GET transport `api`; complete or thrown, never partial. A global
 * deadline (G2 m-3) throws before the job's timeout-minutes, so a slow API gives the written count, not a timeout. */
export async function buildProof({ api, cwd, pr, base, deadline = Date.now() + 120_000 }) {
  const git = gitIn(cwd), merged = [];
  const get = (path) => { if (Date.now() > deadline) throw new Error(`proof deadline passed before GET ${path}`); return api(path, deadline); };
  const id = { number: pr?.number, head_ref: pr?.head?.ref, head_repo: pr?.head?.repo?.full_name, base_ref: pr?.base?.ref, base_repo: pr?.base?.repo?.full_name, head_sha: pr?.head?.sha };
  const proof = { schema: SCHEMA, repo: REPO, pr: id, base_sha: null, head_sha: git("rev-parse", "HEAD"), complete: true, merged };
  if (!isCandidate(id)) return proof; // no API read: nothing to prove
  proof.base_sha = git("rev-parse", "--verify", "--end-of-options", `${base ?? `origin/${id.base_ref}`}^{commit}`);
  const R = new Set(rows(git("rev-list", "HEAD", `^${proof.base_sha}`)));
  for (let page = 1; ; page++) {
    const got = await get(`/repos/${REPO}/pulls?state=closed&per_page=100&page=${page}`);
    if (!Array.isArray(got) || page > 200) throw new Error(`closed PR page ${page} unreadable`);
    for (const p of got) if (p.merged_at && R.has(p.merge_commit_sha)) merged.push({ number: p.number, base_ref: p.base?.ref, merged_at: p.merged_at, merge_commit_sha: p.merge_commit_sha, head_sha: p.head?.sha, r25: null });
    if (got.length < 100) break;
  }
  for (const m of merged) {
    if (!SHA.test(m.head_sha)) throw new Error(`PR #${m.number}: no head sha`);
    const r = await get(`/repos/${REPO}/commits/${m.head_sha}/check-runs?check_name=${CHECK}&per_page=100`);
    if (!Array.isArray(r?.check_runs) || r.total_count !== r.check_runs.length) throw new Error(`PR #${m.number}: check runs unreadable or paginated`);
    const runs = r.check_runs.filter((c) => c.name === CHECK && c.app?.slug === "github-actions");
    m.r25 = runs.length > 0 && runs.every((c) => c.conclusion === "success") ? "success" : "not-success";
  }
  return proof;
}

const fetchApi = (root, token) => async (path, deadline) => {
  if (!token) throw new Error("R25_READ_TOKEN is empty: no anonymous read");
  const r = await fetch(`${root}${path}`, { headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28" }, signal: AbortSignal.timeout(Math.max(1, Math.min(30_000, deadline - Date.now()))) });
  if (r.status !== 200) throw new Error(`GET ${path}: HTTP ${r.status}`); // a 403 (scope not granted) included: no proof
  return r.json();
};
const ghApi = async (path) => JSON.parse(execFileSync("gh", ["api", path.slice(1)], { encoding: "utf8", maxBuffer: 1 << 28, timeout: 30_000 }));

/** The r25 job's two `git diff --shortstat` counts (W, the lines R25_DIFF_RE reads) under the read of the module and the oracle (lot
 * R25-ATTR-SOURCE-1, G7 O-1, ADR-M003 D9 undecies): shell lines the job evaluates first. PIN as command-scope config (GIT_CONFIG_COUNT;
 * GIT_CONFIG_PARAMETERS, read after it, dropped), GIT_ENV, and the attributes of attrTree (GIT_ATTR_SOURCE, git >= 2.40): a
 * .gitattributes of the measured tree (-diff, binary, a diff driver) no longer lowers W. Refused (W unread, the job red): git < 2.40, a
 * non-empty $GIT_DIR/info/attributes, that GIT_ATTR_SOURCE does not replace. */
export function pinShell(cwd) {
  const v = /(\d+)\.(\d+)/.exec(execFileSync("git", ["--version"], { encoding: "utf8", env: GIT_ENV() })) ?? ["", "0", "0"];
  if (Number(v[1]) * 1000 + Number(v[2]) < 2040) throw new Error(`git ${v[0]} is older than 2.40: no GIT_ATTR_SOURCE`);
  if (infoAttributes(cwd)) throw new Error("$GIT_DIR/info/attributes is not empty: GIT_ATTR_SOURCE does not replace it");
  const kv = PIN.filter((_, i) => PIN[i - 1] === "-c").map((a) => [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)]);
  const env = { ...GIT_ENV({}), GIT_CONFIG_PARAMETERS: undefined, GIT_ATTR_SOURCE: attrTree(cwd), GIT_CONFIG_COUNT: String(kv.length), ...Object.fromEntries(kv.flatMap(([k, x], i) => [[`GIT_CONFIG_KEY_${i}`, k], [`GIT_CONFIG_VALUE_${i}`, x]])) };
  return Object.entries(env).map(([k, x]) => (x === undefined ? `unset ${k}` : `export ${k}='${x.replaceAll("'", "'\\''")}'`)).join("\n");
}

/** The attributes every count reads, in place of the empty tree's (lot R25-GUARDS-1, item R25-NUL-BINARY-1, ADR-M003 D9 duodecies). A
 * content git detects as binary (a NUL byte in its first 8 000) counted 0 lines; every path is now text for diff and counts its lines,
 * under both pathspecs, but the closed list of binary assets the repository holds, each in its own directory (measured on the trunk),
 * left to git's detection. Written to the object store of `cwd` (two objects, the same bytes each time), then proven in force by check-attr. */
export const BINARY_ASSETS = ["apps/site/app/fonts/*.ttf", "apps/site/public/bell/anchors/*.ots", "docs/bell-publications/*.ots", "docs/course-bell/*.ots", "docs/dojo-publications/*.ots", "fixtures/*.cbor", "out/*.jpg", "out/*.png", "test/fixtures/*.ots"];
export const ATTRIBUTES = `* diff\n${BINARY_ASSETS.map((p) => `${p} !diff\n`).join("")}`;
const PROBES = `probe.mjs: diff: set\n${BINARY_ASSETS[0].replaceAll("*", "probe")}: diff: unspecified`; // a code path and an asset path
export function attrTree(cwd) {
  const g = (a, input, env = GIT_ENV()) => execFileSync("git", ["-C", cwd, ...a], { input, encoding: "utf8", env }).trim();
  const id = g(["mktree"], `100644 blob ${g(["hash-object", "-w", "--no-filters", "--stdin"], ATTRIBUTES)}\t.gitattributes\n`);
  // An id absent from the store reads no attribute, silently: the read of `pin` (GIT_ATTR_SOURCE; --attr-source sets it) must see them.
  const read = g([...PIN, "check-attr", "diff", "--", ...PROBES.split("\n").map((l) => l.slice(0, l.indexOf(": ")))], undefined, { ...GIT_ENV(), GIT_ATTR_SOURCE: id });
  if (read !== PROBES) throw new Error(`attribute tree ${id} not in force: check-attr read ${read.replaceAll("\n", "; ")}`);
  return id;
}

/** The paths R-25 refuses before any count (lot R25-GUARDS-2, items R25-ASSET-DIR-MAGIC-1, R25-CR-ONLY-LINES-1 and R25-GITLINK-SYMLINK-1,
 * ADR-M003 D9 terdecies), each `<reason> <path as a JSON string>`, sorted. On the range of the two counts, `<base>...HEAD`, under either pathspec of `specs`:
 * a gitlink (its code lives in another repository) or a symlink (it counts its target); a declared binary asset (a path attrTree leaves to
 * git's detection) whose first bytes are not one of the magic numbers of its format, measured on the trunk; any other path holding a CR not
 * followed by LF, or a JS line separator (U+2028, U+2029): JS ends a line there, git does not. Read from objects only (no work tree, no
 * autocrlf, no filesystem symlink, no .gitmodules `ignore`); deletions pass; a UTF-16/32 byte order mark is refused. A declared asset past its magic is parsed by ASSET_STRUCTURE (D9 quindecies). Residual, said as is: a polyglot in a legitimate field of its format passes. */
export const ASSET_MAGIC = { cbor: Array.from({ length: 32 }, (_, i) => (0xa0 + i).toString(16)), jpg: ["ffd8ff"], ots: ["004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e8929401"], png: ["89504e470d0a1a0a"], ttf: ["00010000"] };
export function refusals(cwd, base, specs) {
  const g = (a, input, env = GIT_ENV()) => execFileSync("git", ["-C", cwd, ...PIN, ...a], { input, env, maxBuffer: 1 << 30, stdio: ["pipe", "pipe", "pipe"] });
  const bare = BINARY_ASSETS.map((p) => p.slice(p.lastIndexOf(".") + 1)).filter((x) => !Object.hasOwn(ASSET_MAGIC, x) || !Object.hasOwn(ASSET_STRUCTURE, x));
  if (bare.length > 0) throw new Error(`no magic number or no structure check for the declared assets ${bare.join(", ")}`);
  const to = new Map(), out = [], files = [];
  for (const s of specs) { // paths as latin1 strings: their bytes, whatever their encoding
    const f = g(["diff", "--raw", "-z", "--no-renames", "--no-abbrev", "--ignore-submodules=none", `${base}...HEAD`, "--", ...s]).toString("latin1").split("\0");
    for (let i = 0; i + 1 < f.length; i += 2) { const m = /^:\d{6} (\d{6}) [0-9a-f]+ ([0-9a-f]+) [A-Z]$/.exec(f[i]); if (m === null) throw new Error(`unread --raw entry ${f[i]}`); to.set(f[i + 1], [m[1], m[2]]); }
  }
  for (const [p, [mode, id]] of to) if (mode === "160000") out.push(`gitlink ${p}`); else if (mode === "120000") out.push(`symlink ${p}`); else if (mode !== "000000") files.push([p, id]);
  if (files.length > 0) {
    const a = g(["check-attr", "-z", "--stdin", "diff"], Buffer.from(files.map(([p]) => `${p}\0`).join(""), "latin1"), { ...GIT_ENV(), GIT_ATTR_SOURCE: attrTree(cwd) }).toString("latin1").split("\0");
    const asset = new Set(a.filter((_, i) => i % 3 === 0 && a[i + 2] === "unspecified")), batch = g(["cat-file", "--batch"], files.map(([, id]) => `${id}\n`).join(""));
    let at = 0;
    for (const [p, id] of files) {
      const nl = batch.indexOf(10, at), [got, type, size] = batch.subarray(at, nl).toString("latin1").split(" ");
      if (got !== id || type !== "blob") throw new Error(`blob ${id} of ${named(Buffer.from(p, "latin1").toString("utf8"))} unread`);
      const b = batch.subarray(nl + 1, nl + 1 + Number(size));
      at = nl + 2 + b.length;
      if (asset.has(p)) { const x = p.slice(p.lastIndexOf(".") + 1); if (!(ASSET_MAGIC[x] ?? []).some((h) => b.subarray(0, h.length / 2).toString("hex") === h)) out.push(`asset-magic ${p}`); else if (ASSET_STRUCTURE[x](b) !== null) out.push(`asset-structure ${p}`); continue; }
      for (let i = b.indexOf(13); i >= 0; i = b.indexOf(13, i + 1)) if (b[i + 1] !== 10) { out.push(`bare-cr ${p}`); break; }
      if (b.includes("\u2028") || b.includes("\u2029")) out.push(`line-separator ${p}`); if (/^(fffe|feff|0000feff)/.test(b.subarray(0, 4).toString("hex"))) out.push(`utf16-bom ${p}`);
      if (LONG_LINE_PATHS[p] !== id && overlong(b) && !(p.endsWith(".json") && /^[\x20-\x7e]*$/.test(p) && !/(^|\/)(package|\.?devcontainer|tasks|deno|turbo|vercel|composer)\.json$/i.test(p) && isJson(b))) out.push(`long-line ${p}`);
    }
  }
  return out.map((r) => `${r.slice(0, r.indexOf(" "))} ${named(Buffer.from(r.slice(r.indexOf(" ") + 1), "latin1").toString("utf8"))}`).sort(); // one ASCII line each
}

/** Code on one long line counted 1 line and runs (lot R25-MINIFIED-LINE-1, ADR-M003 D9 quaterdecies). A text path of `refusals` is refused
 * `long-line` when one of its lines (the bytes between two LF, a CR included, the last one with or without a final LF) is longer than
 * LINE_MAX bytes, measured on the trunk, but a `.json` path whose blob parses as JSON (Node reads it as data; `.jsonl`, `.csv`, `.txt` and any
 * other extension run as CommonJS), never a non-ASCII path or a JSON file a tool runs (any ASCII case), and the blobs of LONG_LINE_PATHS. */
export const LINE_MAX = 2000, LONG_LINE_PATHS = { "docs/biblio/procurements-M015/_raw/tradexyz_llms_full.txt": "3989315d68addc8ea3bb6e5cd0ee7dcd6f8bf326" };
function overlong(b) { // memchr steps over the blob: no string built, one pass even for a single line of a gibibyte
  for (let at = 0, nl = 0; at <= b.length; at = nl + 1) { nl = b.indexOf(10, at); if (nl < 0) nl = b.length; if (nl - at > LINE_MAX) return true; }
  return false;
}
function isJson(b) { try { JSON.parse(b.toString("utf8")); return true; } catch { return false; } } // decodes the blob: called on a long-line .json only
function named(s) { return JSON.stringify(s).replace(/[\[\u007f-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`); } // one ASCII name: no `::`, no `##[`

/** The end of structure of each declared asset format, past its magic (lot R25-ASSET-STRUCTURE-1, item R25-ASSET-POLYGLOT-1, option (c)
 * reduced, ADR-M003 D9 quindecies): null, or why the blob is refused `asset-structure`. A payload appended after the format's end (a zip
 * archive, read from its end) or held in a metadata chunk, segment, table, operation or attestation outside the closed lists measured on the
 * trunk (45 assets, 0 refused) is refused. A free field of an admitted part (PNG palette and deflate stream, JPEG tables and entropy data,
 * TrueType tables, OpenTimestamps operands of at most OTS_OPERAND_MAX bytes and pending branches, CBOR strings) is not: hardening, not closure. */
const CRC = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
const crc32 = (b) => { let c = ~0; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; }; // zlib.crc32 is Node >= 20.15 only
export const PNG_CHUNKS = ["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "iCCP", "pHYs", "bKGD", "sBIT"], JPEG_SEGMENTS = [0xc0, 0xc1, 0xc2, 0xc4, 0xdb, 0xdd, 0xda];
export const TTF_TABLES = ["DSIG", "GDEF", "GPOS", "GSUB", "HVAR", "OS/2", "STAT", "avar", "cmap", "cvt ", "fpgm", "fvar", "gasp", "glyf", "gvar", "head", "hhea", "hmtx", "loca", "maxp", "name", "post", "prep"];
export const OTS_CALENDARS = ["alice.btc.calendar.opentimestamps.org", "bob.btc.calendar.opentimestamps.org", "btc.calendar.catallaxy.com", "calendar.invalid", "finney.calendar.eternitywall.com"], OTS_OPERAND_MAX = 89;
const ADAM7 = [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]];
function png(b) { // chunks with their CRC, IHDR first, IEND last and nothing after it; PLTE on a palette image only; one zlib stream of the exact pixel size
  if (b.length < 33 || b.readUInt32BE(8) !== 13 || b.toString("latin1", 12, 16) !== "IHDR") return "IHDR first";
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), depth = b[24], color = b[25], idat = [], row = (x) => 1 + Math.ceil((x * depth * ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color] ?? NaN)) / 8);
  for (let o = 8; ; ) {
    if (o + 12 > b.length) return "no IEND";
    const n = b.readUInt32BE(o), t = b.toString("latin1", o + 4, o + 8);
    if (n > b.length - o - 12 || crc32(b.subarray(o + 4, o + 8 + n)) !== b.readUInt32BE(o + 8 + n)) return `chunk ${t} overruns or fails its CRC`;
    if (!PNG_CHUNKS.includes(t) || (t === "PLTE" && color !== 3) || (t === "IHDR" && o !== 8)) return `chunk ${t}`;
    if (t === "IDAT") idat.push(b.subarray(o + 8, o + 8 + n));
    o += 12 + n;
    if (t === "IEND") { if (o !== b.length) return `${b.length - o} bytes after IEND`; break; }
  }
  const z = Buffer.concat(idat), size = b[28] === 0 ? h * row(w) : ADAM7.reduce((s, [x, y, dx, dy]) => s + (w > x && h > y ? Math.ceil((h - y) / dy) * row(Math.ceil((w - x) / dx)) : 0), 0);
  if (((z[2] >> 1) & 3) === 0) return "stored deflate block";
  try { const { buffer, engine } = inflateSync(z, { info: true, maxOutputLength: Math.max(1, size) }); return buffer.length === size && engine.bytesWritten === z.length ? null : "pixel data size"; } catch { return "pixel data"; }
}
function jpg(b) { // segments of the closed list, entropy data to the next marker but RSTn, EOI and nothing after it
  for (let o = 2; o + 1 < b.length; ) {
    const m = b[o + 1];
    if (b[o] !== 0xff) return `no marker at ${String(o)}`;
    if (m === 0xd9) return o + 2 === b.length ? null : `${String(b.length - o - 2)} bytes after EOI`;
    if (!JPEG_SEGMENTS.includes(m) || o + 4 > b.length) return `segment ff${m.toString(16)}`;
    o += 2 + b.readUInt16BE(o + 2);
    if (m === 0xda) while (o + 1 < b.length && !(b[o] === 0xff && b[o + 1] !== 0 && (b[o + 1] & 0xf8) !== 0xd0)) o++;
  }
  return "no EOI";
}
function ttf(b) { // tags of the closed list, ascending; tables in offset order, 0 to 3 NUL bytes before each and after the last, nothing else
  const n = b.length < 12 ? 0 : b.readUInt16BE(4), dir = [];
  if (n === 0 || 12 + 16 * n > b.length) return "table directory";
  for (let i = 0, r = 12; i < n; i++, r += 16) dir.push([b.toString("latin1", r, r + 4), b.readUInt32BE(r + 8), b.readUInt32BE(r + 12)]);
  if (dir.some(([t], i) => !TTF_TABLES.includes(t) || (i > 0 && t <= dir[i - 1][0]))) return "table tags";
  let end = 12 + 16 * n;
  for (const [t, off, len] of dir.sort((x, y) => x[1] - y[1])) { if (off < end || off - end > 3 || b.subarray(end, off).some((x) => x !== 0)) return `bytes before ${t}`; end = off + len; }
  return end <= b.length && b.length - end <= 3 && !b.subarray(end).some((x) => x !== 0) ? null : "bytes after the last table";
}
function ots(b) { // readOtsProof of apps/site/lib/bell-anchors.ts in plain JS (header and version read as the magic), and no unknown attestation, a pending URI of the closed list, operands of at most OTS_OPERAND_MAX bytes
  let i = 32;
  const byte = () => { if (i >= b.length) throw new Error("truncated proof"); return b[i++]; };
  const varuint = () => { for (let v = 0, s = 1, k = 0; k < 8; k++, s *= 128) { const x = byte(); v += (x & 0x7f) * s; if (x < 0x80) return v; } throw new Error("varuint too long"); };
  const varbytes = (max, min = 0) => { const n = varuint(); if (n > max || n < min || i + n > b.length) throw new Error("varbytes out of bounds"); i += n; return b.subarray(i - n, i); };
  const item = (t, d) => {
    if (t === 0x00) {
      const tag = b.toString("hex", i, (i += 8)), p = varbytes(8192), at = i;
      if (tag === "0588960d73d71901") { i -= p.length; varuint(); }
      else if (tag === "83dfe30d2ef90c8e") { i -= p.length; const u = varbytes(1000).toString("latin1"); if (!OTS_CALENDARS.some((h) => u === `https://${h}`)) throw new Error("calendar outside the list"); }
      else throw new Error(`attestation ${tag}`);
      if (i !== at) throw new Error("attestation payload");
    } else if (t === 0xf0 || t === 0xf1) { varbytes(OTS_OPERAND_MAX, 1); tree(d + 1); }
    else if ([0xf2, 0xf3, 0x02, 0x03, 0x08, 0x67].includes(t)) tree(d + 1);
    else throw new Error(`operation ${t.toString(16)}`);
  };
  const tree = (d) => { if (d > 256) throw new Error("recursion limit"); let t = byte(); while (t === 0xff) { item(byte(), d); t = byte(); } item(t, d); };
  try { const op = byte(); i += { 8: 32, 2: 20, 3: 20 }[op] ?? NaN; if (!(i <= b.length)) return "file hash"; tree(0); } catch (e) { return e.message; }
  return i === b.length ? null : "bytes after the proof";
}
function cbor(b) { // one well-formed item, definite lengths, depth at most 64, nothing after it
  let i = 0;
  const item = (d) => {
    const x = b[i++], ai = x & 31, k = [1, 2, 4, 8][ai - 24];
    if (x === undefined || d > 64 || ai > 27 || i + (k ?? 0) > b.length) throw new Error("item");
    const n = k === undefined ? ai : Number(k === 8 ? b.readBigUInt64BE(i) : b.readUIntBE(i, k));
    i += k ?? 0;
    if (x >> 5 === 2 || x >> 5 === 3) { if (n > b.length - i) throw new Error("string"); i += n; }
    else if (x >> 5 === 4 || x >> 5 === 5) for (let j = 0; j < n * (x >> 5 === 5 ? 2 : 1); j++) item(d + 1);
    else if (x >> 5 === 6) item(d + 1);
  };
  try { item(0); } catch (e) { return e.message; }
  return i === b.length ? null : "bytes after the item";
}
export const ASSET_STRUCTURE = { cbor, jpg, ots, png, ttf };

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
    } else if (cmd === "pin") {
      const [ci] = opt("--ci"), [base] = opt("--base");
      if (!ci || !base) throw new Error("usage: pin --ci <ci.yml> --base <ref>: the changed paths are checked before the read is printed");
      const shell = pinShell(process.cwd()), refused = refusals(process.cwd(), base, specsOf(readFileSync(ci, "utf8")));
      for (const r of refused) console.error(`r25-integration: refused ${r}`);
      if (refused.length > 0) throw new Error(`${refused.length} changed path(s) refused before the count (ADR-M003 D9 terdecies, quaterdecies): no pinned read`);
      console.log(shell);
    }
    else throw new Error("usage: lot-size-integration.mjs proof|count|pin ...");
  } catch (e) { const why = String(e.stderr ?? "").trim().split("\n").at(-1); console.error(`r25-integration: ${String(e.message).split("\n")[0]}${why ? ` (${why})` : ""}`); process.exitCode = 2; }
}
