// scripts/mission/launch.mjs - the launch gate of a mission (ADR-METHODE-2 D1, lot M-2a; Q-PLI3-7: the launcher runs
// outside the workflow by default). Node 24, zero dependencies.
// Usage: node scripts/mission/launch.mjs <mission.md> --repo <worktree>
// It reads the mission bytes ONCE, lints them (scripts/mission/lint.mjs) and hashes the same bytes. Green: it writes the
// receipt <mission without .md>.recu.json next to the mission, {sha, verdict: "vert", date, lint: {<code>: 0, ...}, repo,
// base, mission}, and prints it (exit 0). Red: it prints the hits, deletes any earlier receipt and writes none (exit 1).
// date = ISO 8601 UTC to the second (as `date -u`); base = the full sha of the pinned base.
// WORKFLOW-SIDE CONTRACT. A workflow script has neither fs nor crypto: it can neither run this launcher nor hash the text.
//   1. The orchestrator runs this launcher, then starts the workflow with args.recu = the receipt object and
//      args.mission = the text of the linted file, unchanged.
//   2. The workflow script starts with a verbatim copy of the block of scripts/mission/launch-guard.js (workflows import
//      nothing; the sha256 of the copied block is cited in the lot journal) and calls `const mission = assertRecu(args)`
//      before any agent(). assertRecu throws, so no agent() runs, when recu is absent, is not "vert", carries a non-zero
//      lint count or no sha256; it returns args.mission, the only text an agent() may receive.
//   3. sha256(args.mission) === recu.sha is replayed after the fact by M-5: a stale or forged receipt is detected there, not
//      prevented here (item METHODE-RECU-SIGNE-1). A launch outside a workflow escapes the gate (METHODE-LAUNCH-AGENT-1).
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { formatReport, lintMission } from "./lint.mjs";

export const recuPath = (mission) => `${mission.replace(/\.md$/i, "")}.recu.json`;

/** Lint the mission; write its receipt when green, delete any earlier receipt when red. */
export function launch(mission, repo) {
  const bytes = readFileSync(mission);
  const text = bytes.toString("utf8");
  const lint = lintMission({ text, missionPath: mission, repo });
  const out = recuPath(mission);
  if (lint.verdict !== "vert") { rmSync(out, { force: true }); return { recu: null, lint }; }
  const recu = { sha: createHash("sha256").update(bytes).digest("hex"), verdict: "vert", date: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    lint: lint.counts, repo: resolve(repo).replace(/\\/g, "/"), base: lint.base, mission: resolve(mission).replace(/\\/g, "/") };
  writeFileSync(out, `${JSON.stringify(recu, null, 2)}\n`);
  return { recu, lint };
}

function main(argv) {
  let mission = null, repo = null;
  for (let i = 0; i < argv.length; i++) if (argv[i] === "--repo") repo = argv[++i] ?? null; else mission = argv[i];
  if (!mission || !repo) { console.error("usage: node scripts/mission/launch.mjs <mission.md> --repo <worktree>"); process.exitCode = 2; return; }
  const { recu, lint } = launch(mission, repo);
  if (recu) { console.log(JSON.stringify(recu, null, 2)); return; }
  console.log(formatReport(lint, mission));
  console.error(`launch refused: red mission, no receipt (${recuPath(mission)} absent)`);
  process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
