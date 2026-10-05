// scripts/l2/seal.mjs -- the derive hook of the recorder's seals (lot P1-c5 of part P1, 2026-10-05): the replay of P1-c2 and the
// canonical digests of P1-c3 composed in one hook of sealDay (P1-c1), as the notes of the G7 of c2 and c3 ask; plan
// docs/G0-partie-l2-p1.md section 8.2 (line P1-c5); lot plan docs/G0-lot-l2-p1-c5.md. Node 24, zero dependencies. One scale for the tap
// and the replay (n-5 of the G2 of c3); in this order: bestTap, deriveDay with its tap, canonDay with the tap's result (Q-C3-4); the
// parts' manifest keys disjoint, and their missing.json keys, else stray_file, nothing written; provisional bounds of L2-MINUTES-SIZE-1
// (minutes.jsonl 64 MiB, twice a run of canonDay 32 MiB) until its joint measure under the unit; this module and the command hashed into
// script_sha256 beside the modules of the day (Q-C1-8, Q-C4-5). The agent never commits (R-20).
import { bestTap, canonDay } from "./canon.mjs";
import { DayStop, sealDay } from "./day.mjs";
import { deriveDay } from "./derive.mjs";

export const SEAL_BOUNDS = Object.freeze({ minutes: 67_108_864, canon: 33_554_432 }); // L2-MINUTES-SIZE-1: provisional, 64 MiB and 32 MiB
export const COMMAND = "../record-binance-l2"; // the command, relative to scripts/l2: script_sha256 names it scripts/record-binance-l2.mjs

/** Derived parts merged in their order: files, references and modules joined; a key of two parts' manifests, or of two parts'
 *  missing.json, stops (stray_file): naming, never overwriting. */
export function mergeDerived(symbol, day, parts) {
  const keys = ["manifest", "missing"].flatMap((p) => parts.flatMap((d) => Object.keys(d[p] ?? {})).filter((k, i, all) => all.indexOf(k) !== i));
  if (keys.length > 0) throw new DayStop("stray_file", { symbol, day, keys });
  const all = (p) => parts.flatMap((d) => d[p] ?? []);
  return { files: all("files"), refs: all("refs"), modules: all("modules"), manifest: Object.assign({}, ...parts.map((d) => d.manifest)),
    missing: Object.assign({}, ...parts.map((d) => d.missing)) };
}

/** The hook of sealDay for one day at price scale `scale` (header); `bounds` of minutes.jsonl and of canonDay, SEAL_BOUNDS by default. */
export function hookOf(scale, bounds = SEAL_BOUNDS) {
  return (ctx) => {
    const best = bestTap({ scale, start: ctx.start, end: ctx.end });
    const dv = deriveDay({ ...ctx, scale, bound: bounds.minutes, tap: best.tap });
    const cv = canonDay({ ...ctx, best: best.result(), bound: bounds.canon });
    return mergeDerived(ctx.symbol, ctx.day, [dv, cv, { modules: ["seal", COMMAND] }]);
  };
}

/** One day of one symbol sealed by the recorder: sealDay's spec, the day's scale and the bounds; sealDay's result. */
export const sealOf = ({ scale, bounds = SEAL_BOUNDS, ...spec }) => sealDay({ ...spec, derive: hookOf(scale, bounds) });

// The seal of the loop runs apart (lot P1-c5-bis-a): in a child process of node whose heap a node flag caps, never in a Worker, whose
// resourceLimits are no hard cap under node v24.21.0 and leave the external memory out (m-5 of the G2 of c5; measures in the lot plan).
// The child is spawned with the env its caller gives (the recorder's, guarded: empty on Linux) and one flag, the cap; it refuses any
// other (scripts/l2/seal-child.mjs). A heap past the cap kills the child alone: the day stays unsealed, the failure named to the caller.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
export const SEAL_HEAP_MB = 128; // the cap of the child's heap (L2-MINUTES-SIZE-1: the external memory, about 224 MiB at INDEX_BOUND, comes on top)
const CHILD = fileURLToPath(new URL("./seal-child.mjs", import.meta.url));

/** sealOf of `spec` in a child process: closed(cid, seg) is false for the "cid/seg" of spec.open (the segments its writers hold open);
 *  sealOf's result, or { sealed: false, failed: { code, signal, stop, detail } } (a named stop of the child, or its death); never rejects. */
export function sealApart(spec, { env, heapMb = SEAL_HEAP_MB }) {
  return new Promise((done) => {
    let text = "";
    const child = spawn(process.execPath, [`--max-old-space-size=${heapMb}`, CHILD, JSON.stringify(spec)], { env, stdio: ["ignore", "pipe", "ignore"] });
    child.stdout.setEncoding("utf8").on("data", (d) => { text += d; });
    child.on("error", (e) => { done({ sealed: false, failed: { code: null, signal: null, stop: "spawn_failed", detail: { error: e.code ?? null } } }); });
    child.on("close", (code, signal) => {
      let line = null;
      try { line = JSON.parse(text); } catch { line = null; }
      done(code === 0 && line?.result ? line.result : { sealed: false, failed: { code, signal, stop: line?.stop ?? null, detail: line?.detail ?? null } });
    });
  });
}
