// scripts/mission/gen.mjs - mission generator (ADR-METHODE-2 D1, lot M-2b; decision 275-d). Node 24, zero dependencies.
// Usage: node scripts/mission/gen.mjs --lot <LOT> --role <G1|G2|cp-2|G7|corr> --tier <id> --repo <worktree> --base <sha>
//          --body <body.md> --out <mission.md> [--adr <docs/adr/X.md>] [--r25 <n>] [--rules <file>] [--tools-root <dir>]
// It writes a HEADER read from `git -C <repo>`, the ADR and --tools-root (default: the checkout of this generator), then
// the rules and the hand-written BODY byte for byte. One header field per line: the title; the fixed fields Palier and
// Role (MISSION-LINT-MODEL-FIELD-1); the stamp line: this generator's absolute path, its checkout's short HEAD, the sha256
// of its own bytes as run (MISSION-GEN-SELF-SHA-1), the UTC time (Q-G2-6; then only a to-create heading declares:
// MISSION-LINT-CREATE-SCOPE-1); the pinned base (short and full sha); the branch; the worktree; HEAD; every path that
// differs from the base (`git diff <base>`: base..HEAD, uncommitted and untracked, Q-M2B-3) with the sha256 of its bytes,
// deleted paths counted, not listed; the ADR anchor, the first line of <tools-root>/<adr> starting with "| <LOT> |", cited
// by that path:N (Q-G2-5); the R-25 bound (default 547); the five tools under <tools-root> with their sha256, red-proof.mjs
// included, no fallback (Q-G2-4, C-G2-12, MISSION-GEN-REDPROOF-PATH-1); the roster (effort max for claude-opus-5-5, else
// high: decisions 262, 267); the path and sha256 of --rules (default <tools-root>/docs/methode/REGLES-MISSION.md), whose
// bytes follow, a LF added if they lack one (Q-M2B-9). The text is linted against --repo by scripts/mission/lint.mjs: green
// writes --out, prints the report and "sha256 <hex> <out>" of the bytes read back from disk, the receipt's sha (C-G2-5),
// exit 0; red writes nothing, prints the hits (exit 1). Exit 2 (refused, nothing written): usage; a role outside the
// vocabulary of scripts/oracle/run.mjs; a tier outside TIERS, claude-sonnet-5 (retired, decision 280) or claude-fable-5-1
// as G1 or corr (decision 274), before any git read; --out naming --body by path or (dev, ino)
// (docs/methode/FAITS-fs-ino-2026-09-28.md); a --tools-root lacking a tool (C-G2-16); a base not a commit of --repo; an
// unreadable body or rules file; a body opening with a UTF-8 BOM (C-G2-9); a generator checkout without a HEAD or whose
// path holds a backtick or a line break (MISSION-GEN-PATH-SPACE-1); an ADR without the anchor line.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TIERS, formatReport, lintMission } from "./lint.mjs";

export const ROLES = ["G1", "G2", "cp-2", "G7", "corr"]; // the --role vocabulary of scripts/oracle/run.mjs, never a second one
const DUTY = { G1: "impl\u00e9menteur", G2: "relecteur", "cp-2": "validateur", G7: "orchestrateur", corr: "correcteur" };
const OPTS = ["lot", "role", "tier", "repo", "base", "body", "out", "adr", "r25", "rules", "tools-root"]; // the first seven are required
const ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(/\\/g, "/").replace(/\/$/, "");
const TOOLS = ["scripts/mission/lint.mjs", "scripts/mission/launch.mjs", "scripts/oracle/run.mjs", "scripts/oracle/r25.mjs"];
const hex = (b) => createHash("sha256").update(b).digest("hex"), fwd = (p) => resolve(p).replace(/\\/g, "/"), SELF = hex(readFileSync(fileURLToPath(import.meta.url))); // SELF: the bytes as run

/** Assemble and lint a mission, never writing: {exit: 2, error} when refused, else {exit: 0 | 1, bytes, text, lint, out}. */
export function generate(o) {
  const miss = OPTS.slice(0, 7).filter((k) => typeof o[k] !== "string" || o[k] === "");
  if (miss.length > 0) return { exit: 2, error: `missing --${miss.join(", --")}` };
  if (!ROLES.includes(o.role)) return { exit: 2, error: `--role ${o.role} is not one of ${ROLES.join("|")} (the vocabulary of scripts/oracle/run.mjs)` };
  if (!TIERS.includes(o.tier) || (o.tier === "claude-fable-5-1" && (o.role === "G1" || o.role === "corr")))
    return { exit: 2, error: `--tier ${o.tier} refused for --role ${o.role}: tiers ${TIERS.join(", ")} (decision 267); claude-fable-5-1 never implements nor corrects (decision 274)` };
  if (o.tier === "claude-sonnet-5") return { exit: 2, error: `--tier claude-sonnet-5: palier retir\u00e9, d\u00e9cision 280 (claude-sonnet-5-5 replaces it; the linter keeps it for --rev replays only)` };
  const r25 = o.r25 === undefined ? 547 : Number(o.r25);
  if (!Number.isInteger(r25) || r25 <= 0) return { exit: 2, error: `--r25 ${o.r25} is not a positive integer` };
  const repo = resolve(o.repo).replace(/\\/g, "/"), out = resolve(o.out);
  if (out === resolve(o.body)) return { exit: 2, error: "--out would overwrite --body" };
  const id = (p) => { const s = statSync(p, { bigint: true }); return `${s.dev}:${s.ino}`; }; // the file, whatever its spelling
  if (existsSync(out) && existsSync(o.body) && id(out) === id(o.body)) return { exit: 2, error: "--out names the --body file under another spelling (same dev and ino)" };
  const gitIn = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" }, maxBuffer: 1 << 28 }), git = (...a) => gitIn(repo, ...a);
  const toolsRoot = o["tools-root"] === undefined ? ROOT : fwd(o["tools-root"]).replace(/\/$/, ""), rulesPath = o.rules === undefined ? `${toolsRoot}/docs/methode/REGLES-MISSION.md` : fwd(o.rules);
  const tools = [...TOOLS.map((t) => `${toolsRoot}/${t}`), `${toolsRoot}/scripts/red-proof.mjs`], lost = tools.filter((p) => !existsSync(p)); // no fallback to another tree
  if (lost.length > 0) return { exit: 2, error: `--tools-root ${toolsRoot}: ${lost.join(", ")} absent (C-G2-16; never a fallback to another tree)` };
  let base, head, body, rules, genHead, branch = null;
  try { base = git("rev-parse", "--verify", "--quiet", `${o.base}^{commit}`).trim(); head = git("rev-parse", "HEAD").trim(); } catch { return { exit: 2, error: `--base ${o.base} is not a commit of ${repo}` }; }
  try { body = readFileSync(o.body); } catch { return { exit: 2, error: `--body ${o.body} cannot be read` }; }
  if (body[0] === 0xef && body[1] === 0xbb && body[2] === 0xbf) return { exit: 2, error: "--body starts with a UTF-8 BOM: its first line would escape the linter (R-STEP)" };
  try { rules = readFileSync(rulesPath); } catch { return { exit: 2, error: `--rules ${rulesPath} cannot be read` }; }
  if (/[`\r\n]/.test(ROOT)) return { exit: 2, error: `the checkout of this generator (${ROOT}) holds a backtick or a line break: no stamp could be recognised (MISSION-GEN-PATH-SPACE-1)` };
  try { genHead = gitIn(ROOT, "rev-parse", "HEAD").trim().slice(0, 8); } catch { return { exit: 2, error: `the checkout of this generator (${ROOT}) has no HEAD` }; }
  try { branch = git("symbolic-ref", "--short", "HEAD").trim(); } catch { /* detached HEAD: no branch */ }
  let anchor = "(`--adr` absent)";
  if (o.adr !== undefined) {
    const adr = resolve(toolsRoot, o.adr).replace(/\\/g, "/");
    let n = -1;
    try { n = readFileSync(adr, "utf8").split(/\r?\n/).findIndex((l) => l.startsWith(`| ${o.lot} |`)); } catch { /* unreadable ADR: no anchor */ }
    if (n < 0) return { exit: 2, error: `anchor absent: no line of ${adr} starts with "| ${o.lot} |"` };
    anchor = `\`${adr}:${n + 1}\``;
  }
  const status = new Map(), ns = git("diff", "--name-status", "--no-renames", "-z", base).split("\0");
  for (let i = 0; i + 1 < ns.length; i += 2) status.set(ns[i + 1], ns[i]);
  for (const p of git("ls-files", "--others", "--exclude-standard", "-z").split("\0")) if (p !== "") status.set(p, "non suivi");
  const kept = [...status].filter(([, s]) => s !== "D").sort(([a], [b]) => (a < b ? -1 : 1));
  const sha = (p) => hex(readFileSync(resolve(repo, p)));
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const header = [
    `# MISSION ${o.role} \u2014 lot ${o.lot} \u2014 ${stamp.slice(0, 10)}`,
    `Palier : \`${o.tier}\``,
    `R\u00f4l\u0065 : ${o.role} (${DUTY[o.role]})`,
    `G\u00e9n\u00e9r\u00e9 : \`${ROOT}/scripts/mission/gen.mjs\` \`${genHead}\` sha256 \`${SELF}\` ${stamp}`,
    `Base tronc \`${base.slice(0, 8)}\` (${base})`,
    `Branche ${branch === null ? ": HEAD d\u00e9tach\u00e9e" : `\`${branch}\``}`,
    `Worktree \`${repo}\``,
    `HEAD \`${head}\``,
    `Changements base \u2192 HEAD + arbre de travail (commis, non commis, non suivis) : ${kept.length} chemin(s), sha256 ; ${status.size - kept.length} supprim\u00e9(s), non list\u00e9(s)`,
    ...kept.map(([p, s]) => `- \`${p}\` (${s}) \`${sha(p)}\``),
    `Ancre ADR : ${anchor}`,
    `Borne R-25 : ${r25} lignes (insertions + suppressions, job CI \`r25-taille-de-lot\`)`,
    `Outils : ${tools.map((t) => `\`${t}\` sha256 \`${hex(readFileSync(t))}\``).join(", ")}`,
    `Roster : palier \`${o.tier}\`, effort \`${o.tier === "claude-opus-5-5" ? "max" : "high"}\` (d\u00e9cisions 262, 267 ; D12 (h))`,
    `R\u00e8gles : \`${rulesPath}\` sha256 \`${hex(rules)}\``,
  ].join("\n");
  const bytes = Buffer.concat([Buffer.from(header.concat("\n"), "utf8"), rules, Buffer.alloc(rules.at(-1) === 10 ? 0 : 1, 10), body]), text = bytes.toString("utf8");
  const lint = lintMission({ text, missionPath: out, repo });
  return { exit: lint.verdict === "vert" ? 0 : 1, bytes, text, lint, out };
}

function main(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = String(argv[i]).slice(2);
    if (!String(argv[i]).startsWith("--") || !OPTS.includes(k) || argv[i + 1] === undefined || k in o) { console.error(`gen: refused: unknown, repeated or incomplete option ${argv[i]}`); return 2; }
    o[k] = argv[i + 1];
  }
  let g;
  try { g = generate(o); } catch (e) { console.error(`gen: refused: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`); return 2; }
  if (g.exit === 2) { console.error(`gen: refused: ${g.error}`); return 2; }
  console.log(formatReport(g.lint, g.out));
  if (g.exit !== 0) { console.error(`gen: red mission, nothing written (${g.out})`); return 1; }
  mkdirSync(dirname(g.out), { recursive: true });
  writeFileSync(g.out, g.bytes);
  console.log(`sha256 ${hex(readFileSync(g.out))} ${g.out.replace(/\\/g, "/")}`); // read back from disk: the sha the receipt of launch.mjs must carry
  return 0;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
