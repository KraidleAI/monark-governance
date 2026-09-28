// scripts/mission/launch-guard.js - the workflow half of the mission launch gate (ADR-METHODE-2 D1, lot M-2a, Q-PLI3-7).
// Workflow scripts import nothing: COPY the block between the two markers, verbatim, at the head of every workflow script
// and cite its sha256 in the lot journal. The block is pure (no import, no global, no I/O: a workflow has neither fs nor
// crypto). Call `const mission = assertRecu(args)` before any agent(): it throws unless args.recu is a green receipt of
// scripts/mission/launch.mjs carrying a sha256, and returns args.mission, the only text an agent() may be given.
// BEGIN launch-guard
function assertRecu(args) {
  const recu = args && args.recu;
  if (!recu || typeof recu !== "object") throw new Error("launch-guard: no receipt, run scripts/mission/launch.mjs first");
  if (recu.verdict !== "vert" || !recu.lint || typeof recu.lint !== "object" || Object.values(recu.lint).some((n) => n !== 0)) throw new Error("launch-guard: the receipt is not vert");
  if (typeof recu.sha !== "string" || !/^[0-9a-f]{64}$/.test(recu.sha)) throw new Error("launch-guard: the receipt carries no sha256");
  if (typeof args.mission !== "string" || args.mission === "") throw new Error("launch-guard: no mission text");
  return args.mission;
}
// END launch-guard
export { assertRecu };
