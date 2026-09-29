// apps/site/lib/dojo-register.ts -- the register of the Dōjō program, kept apart from the fleet register (lib/fleet.ts does not
// change): one program and one piece, the hold snapshot. A piece is "built" only with the path that serves it, the non-LLM
// integration tests of that path and a note without digits; until then it is "upcoming". It declares no role, sensor, gate or
// act, so no fleet or application component can render it; /dojo renders its status beside the program's name. Pure data.
export type DojoPieceStatus = "built" | "upcoming";
/** What a built piece declares: the path that serves it, the non-LLM integration tests of that path, a note without digits. */
export interface DojoServedPath { path: string; tests: readonly string[]; note: string }
export type DojoPiece =
  | { key: "hold-snapshot"; name: string; status: "upcoming" }
  | { key: "hold-snapshot"; name: string; status: "built"; served: DojoServedPath };
export interface DojoRegister { program: string; pieces: readonly DojoPiece[] }

export const DOJO_REGISTER: DojoRegister = { program: "MONARK Dōjō", pieces: [{ key: "hold-snapshot", name: "hold snapshot", status: "upcoming" }] };

/** The status of the hold snapshot; throws if the register lost it (no silent fallback). */
export function holdSnapshotStatus(register: DojoRegister = DOJO_REGISTER): DojoPieceStatus {
  const piece = register.pieces.find((p) => p.key === "hold-snapshot");
  if (piece === undefined) throw new Error("dojo register: the hold snapshot is missing (fail-closed)");
  return piece.status;
}
