// scripts/mission/lint.mjs - mission linter (ADR-METHODE-2 D1, lot M-2a). Node 24, zero dependencies.
// It proves the EXISTENCE and BOUNDS of what a mission cites, never its meaning (MAST FM-2.6): green reads "every cited
// path, line, branch, base, tool and tier exists and is allowed", not "the mission is right". R-VAGUE, R-SIMILAR and
// R-STEP prove only the ABSENCE of the forms they list (for R-STEP: that a step carries some backtick span or path), never
// that a phrase, a reference or a step is right (C-G2-10).
// Closed rule list, one code each; one hit makes the verdict "rouge" (exit 1):
//   R-LINE        a cited line (`path:N[-M][,K]`, or `l.N` in the parenthesis or chain right after a path) is past the end
//   R-PATH        a repo path (first segment docs, scripts, test, apps, packages or a top-level directory of the tree) or an
//                 absolute drive path (checked on disk, not in the repo) is absent and not declared to-create
//   R-BRANCH      a cited `lot/...` branch is absent from `git branch --list` of --repo
//   R-BASE        no "base [tronc] <sha>" in the text, or that sha is not a commit of --repo
//   R-TOOL        an absent tool: absolute script path, repo script under scripts/, or a bare backticked x.ps1|sh|mjs|cjs|js|py
//                 held by no directory the mission names (a cited absolute path or its directory, a cited repo path or
//                 its directory, the mission's own directory, --repo, --repo/scripts)
//   R-MODEL       no allowed tier, a claude-* id outside TIERS (claude-opus-5 is banned), or claude-fable-5-1 as worker,
//                 implementer or corrector (decision 274)
//   R-PLACEHOLDER TBD, TODO, XXX or "a completer" outside backticks (a backticked token is a quoted mention, not a use)
//   R-FOCUS       a "MISSION G1" title without a "Review Focus" heading, with 0 or more than 5 classes, or with a class that
//                 names no task, step, test or item
// Lot M-2b (D12 (a)(h), decision 275-d) adds four codes, each on a closed list:
//   R-VAGUE       outside backticks and pairs of French quotes (a quotation, Q-M2B-7), a VAGUE phrase: add appropriate
//                 error handling, appropriate validation, handle edge cases, as appropriate, as needed, four French forms
//   R-SIMILAR     outside backticks and pairs of French quotes, a SIMILAR reference then a number: similar to Task N, same
//                 as step N, like task N, and three French forms
//   R-SYMBOL      an identifier shown as existing (function, type, interface, class or a French form before a backticked
//                 name, or a backticked name()) that no .ts .mts .mjs .js .cjs file of --repo (untracked files included)
//                 or of the --rev tree defines (function, const, let, var, class, interface, type, enum, export list or
//                 default, a binding on an import line; one git grep), unless declared to-create or one of the closed
//                 list GLOBALS, the names a workflow script receives from its engine (Q-M2B-6)
//   R-STEP        under a STEPS heading, a numbered step (N. at column 0 and its continuation lines, up to the next step or
//                 heading) with neither a backtick span nor a path
// A GENERATED mission carries the stamp line of scripts/mission/gen.mjs, anchored at both ends: its absolute path (blanks
// allowed, never a backtick: MISSION-GEN-PATH-SPACE-1), the short sha of its checkout's HEAD, the sha256 of its bytes that
// ran (MISSION-GEN-SELF-SHA-1), the UTC time (Q-G2-6; the line itself is never checked): only a to-create heading declares
// there, never a creation word (MISSION-LINT-CREATE-SCOPE-1). A line starting with the Palier field sets the tier, read
// before the prose: an id outside TIERS, or claude-fable-5-1 with an implementer or corrector role (Role field, else the
// Palier line; decision 274), is red; the proximity rule applies only without that field (MISSION-LINT-MODEL-FIELD-1).
// claude-sonnet-5, retired (decision 280), is a tier only with --rev (a replay of a historical receipt): on disk, red (Q-G2-9).
// To-create list (R-PATH, R-TOOL): a path or bare tool is declared when one of its mentions sits under a heading that says
// "a creer" or "to create", or on a line that carries a creation word (creer, cree, creation, neuf, nouveau and their
// inflections); every mention of a declared path is then exempt. Never checked: a lock path (last segment
// "lock": a transient lock is never a rule), a relative path outside the repo roots (it only extends the tool search path,
// resolved from the mission's directory), a bare non-tool name, a placeholder span (backticks holding an ellipsis, <, >, *, ?).
// Outside backticks, a relative path is taken only with a file extension, a lot/ branch only right after "branch(e)".
// Usage: node scripts/mission/lint.mjs <mission.md> --repo <worktree> [--rev <commit>] [--json]
// Paths and lines are read from the worktree on disk (a G1 base, a G2 with uncommitted files) or, with --rev, from the git
// tree of <commit> (a past mission replayed at its base). Absolute paths are drive paths (Windows-host convention).
import { existsSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CODES = ["R-LINE", "R-PATH", "R-BRANCH", "R-BASE", "R-TOOL", "R-MODEL", "R-PLACEHOLDER", "R-FOCUS", "R-VAGUE", "R-SIMILAR", "R-SYMBOL", "R-STEP"];
export const TIERS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-sonnet-5", "claude-fable-5-1"]; // claude-sonnet-5: retired (decision 280), --rev replays only (Q-G2-9)
const W = "\\p{L}\\p{N}_";
const SEG = `(?:\\{[^{}\\s\`]+\\}|[${W}.~+-])+`;
const PATH_RE = new RegExp(`(?<![${W}./\\\\-])([A-Za-z]:[\\\\/](?:${SEG}[\\\\/]?)*|(?:${SEG}[\\\\/])+(?:${SEG})?)(?::(\\d+(?:-\\d+)?(?:,\\d+(?:-\\d+)?)*))?`, "gu");
const LTAIL = /^`?\**\s*(\([^()`]*\)|l\.\d+(?:-\d+)?(?:\s*(?:,|\u00e0|et|-)\s*l\.\d+(?:-\d+)?)*)/u;
const CREATE = new RegExp(`(?<![${W}])(?:cr\\u00e9(?:er|\\u00e9e?s?|es?|ation)|neu(?:fs?|ves?)|nouveaux?|nouvelles?|nouvel)(?![${W}])`, "iu");
const TO_CREATE = /^#{1,6}\s.*(?:[\u00e0a]\s+cr[\u00e9e]er|to\s+create)/iu;
const HEAD = /^#{1,6}\s/;
const LOCK = /(?:^|[/._-])lock\/?$/i;
const SCRIPT = /\.(?:ps1|sh|mjs|cjs|js|py)$/i;
const BRANCH_RE = new RegExp(`(?<![${W}./\\\\-])lot/[${W}][${W}./-]*`, "gu");
const BASE_RE = new RegExp(`(?<![${W}-])base(?:\\s+tronc)?\\s*[:=]?\\s*\`?([0-9a-f]{7,40})(?![${W}])`, "iu");
const ALT_BASE_RE = new RegExp(`(?<![${W}])(?:--base\\s+|gel\\s*[:=]?\\s*)\`?([0-9a-f]{7,40})(?![${W}])`, "iu");
const MODEL_RE = /(?<![\w-])claude-(?:opus|sonnet|haiku|fable)(?:-[a-z0-9]+)*/giu;
const ROLE = "(?:worker|impl(?:\\u00e9|e)menteur|implementer|correcteur|corrector)";
const FABLE_CODER = new RegExp(`${ROLE}[^${W}\\n]{0,4}claude-fable-5-1|claude-fable-5-1[^${W}\\n]{0,4}${ROLE}`, "iu");
const PLACEHOLDER = new RegExp(`(?<![${W}])(?:TBD|TODO|XXX)(?![${W}])|[\\u00e0\\u00c0]\\s+compl[\\u00e9\\u00c9]ter`, "gu");
const TIED = new RegExp(`(?<!\\p{L})(?:t[\\u00e2a]ches?|tasks?|[\\u00e9e]tapes?|steps?|tests?|items?|\\([a-z]\\)|\\([ivx]{1,4}\\))(?!\\p{L})`, "iu");
const words = (list) => list.join("|").replace(/ /g, "\\s+");
const FQ = "(?!(?<=\\u00ab[^\\u00ab\\u00bb\\n]*)[^\\u00ab\\u00bb\\n]*\\u00bb)"; // not inside a pair of French quotes on its line (Q-M2B-7)
const VAGUE = new RegExp(`(?<![${W}])${FQ}(?:${words(["add appropriate error handling", "appropriate validation", "handle edge cases", "as appropriate", "as needed",
  "gestion d['\\u2019]?\\s*erre\\u0075rs? appropri[\\u00e9e]e?s?", "validations? appropri[\\u00e9e]e?s?", "cas limites? appropri[\\u00e9e]e?s?", "a\\u0075 besoin"])})(?![${W}])`, "giu");
const SIMILAR = new RegExp(`(?<![${W}])${FQ}(?:${words(["similar to tasks?", "same as steps?", "like tasks?", "co\\u006dme l\\u0061 t[\\u00e2a]ches?", "idem [\\u00e9e]tapes?", "m[\\u00eae]me chose q\\u0075e"])})\\s+\\d+`, "giu");
const STEPS = /^#{1,6}\s.*(?:[\u00e0a]\s+fai\u0072e|recette|[\u00e9e]tapes|steps)/iu;
const GENERATED = /^G\u00e9n\u00e9r\u00e9 : `(?:[A-Za-z]:)?\/[^`]*\/scripts\/mission\/gen\.mjs` `[0-9a-f]{8}` sha256 `[0-9a-f]{64}` \d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/u;
const PALIER = /^Palier\s*:\s*`([^`\n]+)`/mu;
const ROLE_FIELD = /(?<!\p{L})R[\u00f4o]l[e]\s*:\s*([^\n,;.]*)/u;
const IMPL = new RegExp(`(?<![${W}-])(?:G1|corr)(?![${W}-])|${ROLE}`, "iu");
const SYMBOL = /(?<![\p{L}\p{N}_])(?:fonction|function|type|interface|classe|class)\s+`([A-Za-z_]\w*)`|`([A-Za-z_]\w*)\(\)`/giu;
const DEF = (s) => new RegExp(`(?:\\bfunction(?:\\s*\\*\\s*|\\s+)|\\b(?:const|let|var|class|interface|type|enum)\\s+)${s}\\b|\\bexport\\s*\\{[^}\\n]*\\b${s}\\b|\\bexport\\s+default\\s+${s}\\b|\\bimport\\b[^;\\n]*\\b${s}\\b[^;\\n]*\\bfrom\\b`);
const GLOBALS = ["agent", "pipeline", "parallel", "phase", "log", "args", "budget", "workflow"]; // engine names of a workflow script (Q-M2B-6)
const blank = (s) => " ".repeat(s.length);
const expand = (p) => { const m = /^(.*?)\{([^{}]+)\}(.*)$/.exec(p); return m ? m[2].split(",").flatMap((x) => expand(m[1] + x + m[3])) : [p]; };
const count = (s) => (s === null ? null : (s.match(/\n/g) ?? []).length + (s.length > 0 && !s.endsWith("\n") ? 1 : 0));
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return null; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const nums = (s) => [...s.matchAll(/\d+/g)].map((x) => Number(x[0]));

/** Lint a mission text against --repo (its worktree on disk, or the git tree of `rev`). Pure apart from reads and git. */
export function lintMission({ text, missionPath, repo, rev = null, host = true }) { // host false: no host read (JOURNAL-LINT-FREEZE-HOST-1)
  const git = (...a) => { try { return execFileSync("git", ["-C", repo, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1 << 28 }); } catch { return null; } };
  const src = text.replace(/^\ufeff/, "");
  const lines = src.split(/\r?\n/);
  const lineOf = (i) => src.slice(0, i).split("\n").length;
  const hits = [];
  const hit = (code, line, extract) => hits.push({ code, line, extract: extract.slice(0, 200) });
  const tree = rev === null ? null : new Set((git("ls-tree", "-r", "--name-only", rev) ?? "").split("\n").filter(Boolean));
  const dirs = new Set([...(tree ?? [])].flatMap((p) => p.split("/").slice(1).map((_, i, a) => p.split("/").slice(0, a.length - i).join("/"))));
  const roots = new Set(["docs", "scripts", "test", "apps", "packages", ...(git("ls-tree", "-d", "--name-only", rev ?? "HEAD") ?? "").split("\n").filter(Boolean)]);
  const inRepo = (p) => (tree ? tree.has(p.replace(/\/$/, "")) || dirs.has(p.replace(/\/$/, "")) : existsSync(join(repo, p)));
  const readRepo = (p) => (tree ? git("show", `${rev}:${p}`) : read(join(repo, p)));
  const branches = !host ? null : new Set((git("branch", "--list", "--format=%(refname:short)") ?? "").split("\n").map((s) => s.trim()).filter(Boolean));
  const missionDir = dirname(resolve(missionPath));
  const toolDirs = new Set([missionDir]);
  const repoDirs = new Set(["scripts"]);
  const bare = [];
  const absent = [];
  const declared = new Set();
  const covers = (q) => [...declared].some((d) => (d.endsWith("/") ? q === d.slice(0, -1) || q.startsWith(d) : q === d));
  let createSection = false;
  const generated = lines.some((l) => GENERATED.test(l)), pf = PALIER.exec(src), syms = [];
  let stepSection = false, step = null; // step: [its line, carries a backtick span or a path]
  const closeStep = () => { if (step !== null && !step[1]) hit("R-STEP", step[0], "numbered step with neither a backtick span nor a path"); step = null; };
  lines.forEach((raw, i) => {
    const ln = i + 1;
    if (GENERATED.test(raw)) return; // the stamp of gen.mjs is provenance, not a citation
    if (HEAD.test(raw)) createSection = TO_CREATE.test(raw);
    if (HEAD.test(raw)) { stepSection = STEPS.test(raw); closeStep(); } else if (stepSection && /^\d+\.\s/.test(raw)) { closeStep(); step = [ln, false]; }
    const create = createSection || (!generated && CREATE.test(raw));
    const found = [];
    const line = raw.replace(/`([^`]*)`/g, (m, inner) => {
      const tool = /^([\p{L}\p{N}_][\p{L}\p{N}_.-]*)(?:\s|$)/u.exec(inner);
      if (tool && SCRIPT.test(tool[1])) { bare.push([tool[1], ln]); if (create) declared.add(tool[1]); }
      if (/[\u2026<>*?]/.test(inner)) return blank(m);
      if (/^[A-Za-z]:[\\/]/.test(inner) && /\s/.test(inner)) { found.push([inner, undefined, ""]); return blank(m); }
      return m;
    });
    const prose = line.replace(/`[^`]*`/g, blank);
    const quoted = (i) => prose[i] !== line[i];
    for (const m of line.matchAll(PATH_RE)) {
      const p = m[1].replace(/\.+$/, "");
      if (quoted(m.index) || /^[A-Za-z]:|\.\w+$/.test(p)) found.push([p, m[2], line.slice(m.index + m[0].length)]);
    }
    for (const [rawPath, suffix, after] of found) {
      for (const p of expand(rawPath.replace(/\\/g, "/"))) {
        const abs = /^[A-Za-z]:\//.test(p), rel = !abs && !roots.has(p.split("/")[0]);
        if (rel) { const q = resolve(missionDir, p); if (host && existsSync(q)) toolDirs.add(isDir(q) ? q : dirname(q)); continue; }
        if (create) declared.add(p);
        if (!(abs ? !host || existsSync(p) : inRepo(p))) {
          if (!(abs && LOCK.test(p))) absent.push([SCRIPT.test(p) && (abs || /(^|\/)scripts\//.test(p)) ? "R-TOOL" : "R-PATH", ln, p]);
          continue;
        }
        if (abs && host) toolDirs.add(isDir(p) ? p : dirname(p));
        else repoDirs.add(p.replace(/\/$/, "")).add(p.replace(/\/[^/]*\/?$/, ""));
        const tail = LTAIL.exec(after)?.[1] ?? "";
        const want = Math.max(0, ...nums(suffix ?? ""), ...[...tail.matchAll(/(?<![\p{L}\p{N}_])l\.\d+(?:-\d+)?/gu)].flatMap((x) => nums(x[0])));
        const n = want > 0 && (host || !abs) ? count(abs ? read(p) : readRepo(p)) : null;
        if (n !== null && want > n) hit("R-LINE", ln, `${p}:${want} past the end (${n} lines)`);
      }
    }
    for (const b of line.matchAll(BRANCH_RE)) {
      const name = b[0].replace(/[./-]+$/, "");
      if ((quoted(b.index) || /branche?\s+$/i.test(line.slice(0, b.index))) && branches !== null && !branches.has(name)) hit("R-BRANCH", ln, `${name} absent from git branch --list`);
    }
    for (const m of prose.matchAll(PLACEHOLDER)) hit("R-PLACEHOLDER", ln, m[0]);
    for (const m of prose.matchAll(VAGUE)) hit("R-VAGUE", ln, m[0]);
    for (const m of prose.matchAll(SIMILAR)) hit("R-SIMILAR", ln, m[0]);
    for (const m of raw.matchAll(SYMBOL)) { syms.push([m[1] ?? m[2], ln]); if (create) declared.add(m[1] ?? m[2]); }
    if (step !== null && (/`[^`]+`|^\s*```/.test(raw) || found.length > 0)) step[1] = true;
    if (!pf && FABLE_CODER.test(raw)) hit("R-MODEL", ln, "claude-fable-5-1 as worker, implementer or corrector (decision 274)");
  });
  closeStep();
  for (const [code, ln, p] of absent) if (!covers(p)) hit(code, ln, `${p} absent`);
  for (const [name, ln] of bare)
    if (host && !declared.has(name) && ![...toolDirs].some((d) => existsSync(join(d, name))) && !inRepo(name) && ![...repoDirs].some((d) => inRepo(`${d}/${name}`))) hit("R-TOOL", ln, `${name} held by no directory the mission names`);
  const want = [...new Set(syms.map(([s]) => s))].filter((s) => !declared.has(s) && !GLOBALS.includes(s));
  const defs = want.length === 0 ? "" : git("grep", "-I", "-h", "-w", "-F", ...(rev === null ? ["--untracked"] : []), ...want.flatMap((s) => ["-e", s]), ...(rev === null ? [] : [rev]), "--", "*.ts", "*.mts", "*.mjs", "*.js", "*.cjs") ?? "";
  for (const [s, ln] of syms) if (!declared.has(s) && !GLOBALS.includes(s) && !DEF(s).test(defs)) hit("R-SYMBOL", ln, `${s} is defined nowhere in the tree`);
  const bm = BASE_RE.exec(src) ?? ALT_BASE_RE.exec(src);
  const base = bm ? git("rev-parse", "--verify", "--quiet", `${bm[1]}^{commit}`)?.trim() || null : null;
  if (!bm) hit("R-BASE", 1, "no pinned base (base [tronc] <sha>)");
  else if (!base) hit("R-BASE", lineOf(bm.index), `${bm[1]} is not a commit of ${repo}`);
  const models = [...src.matchAll(MODEL_RE)];
  const tier = pf?.[1].trim().toLowerCase(), at = pf ? pf.index + pf[0].indexOf("`") + 1 : -1;
  const tiers = rev === null ? TIERS.filter((t) => t !== "claude-sonnet-5") : TIERS, why = (t) => (t === "claude-opus-5" ? "is banned" : TIERS.includes(t) ? "is retired (decision 280): a --rev replay only (Q-G2-9)" : "is outside the tier list");
  if (pf && !tiers.includes(tier)) hit("R-MODEL", lineOf(pf.index), `Palier ${tier} ${why(tier)}`);
  else if (tier === "claude-fable-5-1" && IMPL.test(ROLE_FIELD.exec(src)?.[1] ?? lines[lineOf(pf.index) - 1])) hit("R-MODEL", lineOf(pf.index), "Palier claude-fable-5-1 with an implementer or corrector role (decision 274)");
  if (!pf && !models.some((m) => tiers.includes(m[0].toLowerCase()))) hit("R-MODEL", 1, `no allowed tier (${tiers.join(", ")})`);
  for (const m of models) if (m.index !== at && !tiers.includes(m[0].toLowerCase())) hit("R-MODEL", lineOf(m.index), `${m[0]} ${why(m[0].toLowerCase())}`);
  if (/\bMISSION G1\b/.test(lines.find((l) => /^#\s/.test(l)) ?? "")) {
    const h = lines.findIndex((l) => /^#{1,6}\s.*review focus/i.test(l));
    const items = [];
    for (let i = h + 1; h >= 0 && i < lines.length && !HEAD.test(lines[i]); i++) if (/^\s*(?:[-*+]|\d+[.)])\s/.test(lines[i])) items.push(i);
    if (h < 0) hit("R-FOCUS", 1, "MISSION G1 without a Review Focus section");
    else if (items.length === 0 || items.length > 5) hit("R-FOCUS", h + 1, `${items.length} classes (1 to 5 required)`);
    for (const i of items) if (!TIED.test(lines[i])) hit("R-FOCUS", i + 1, `class tied to no task, step, test or item: ${lines[i].trim()}`);
  }
  hits.sort((a, b) => a.line - b.line);
  const counts = Object.fromEntries(CODES.map((c) => [c, hits.filter((x) => x.code === c).length]));
  const shas = [...new Set([...src.matchAll(/`([0-9a-f]{7,12})`/g)].map((m) => m[1]))];
  return { verdict: hits.length ? "rouge" : "vert", counts, hits, base, shas };
}

/** One line per hit (`code mission:line extract`), then the count per code, then the verdict. */
export const formatReport = (r, missionPath) => [...r.hits.map((x) => `${x.code} ${missionPath}:${x.line} ${x.extract}`),
  `counts ${CODES.map((c) => `${c}=${r.counts[c]}`).join(" ")}`, `verdict ${r.verdict} (${r.hits.length} hit(s))`].join("\n");

function main(argv) {
  const o = { mission: null, repo: null, rev: null, json: false };
  for (let i = 0; i < argv.length; i++) if (argv[i] === "--json") o.json = true; else if (argv[i] === "--repo" || argv[i] === "--rev") o[argv[i].slice(2)] = argv[++i] ?? null; else o.mission = argv[i];
  if (!o.mission || !o.repo) { console.error("usage: node scripts/mission/lint.mjs <mission.md> --repo <worktree> [--rev <commit>] [--json]"); process.exitCode = 2; return; }
  if (o.rev) { try { execFileSync("git", ["-C", o.repo, "cat-file", "-e", `${o.rev}^{commit}`], { stdio: "ignore" }); } catch { console.error(`usage: --rev ${o.rev} is not a commit of ${o.repo}`); process.exitCode = 2; return; } }
  const r = lintMission({ text: readFileSync(o.mission, "utf8"), missionPath: o.mission, repo: o.repo, rev: o.rev });
  console.log(o.json ? JSON.stringify({ mission: o.mission, repo: o.repo, rev: o.rev, ...r }, null, 2) : formatReport(r, o.mission));
  process.exitCode = r.verdict === "vert" ? 0 : 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
