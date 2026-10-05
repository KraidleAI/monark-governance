#!/usr/bin/env node
// scripts/l2/seal-child.mjs -- the child process that seals one day of one symbol for the recording loop (lot P1-c5-bis-a of part P1,
// 2026-10-05; lot plan docs/G0-lot-l2-p1-c5-bis.md). Node 24, zero dependencies. Spawned by sealApart (scripts/l2/seal.mjs) as
// node --max-old-space-size=<n> seal-child.mjs <spec>, never by hand. Its own guards first, before anything is read: its execArgv is
// exactly one flag, the heap cap (any other, or none: proxy_refused); its environment passes guardEnv of the command with no flag (the
// closed list: empty on Linux, so a proxy variable, NODE_OPTIONS or any other name stops it, named). Then sealOf of the spec (JSON:
// out, symbol, day, nowUs, config, scale, bounds; open, the "cid/seg" its parent's writers hold open). One JSON line on stdout: { result }
// (exit 0) or { stop, detail } of a named stop (exit 1); a heap past the cap aborts this process alone. The agent never commits (R-20).
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { guardEnv, RecorderStop } from "../record-binance-l2.mjs";
import { DayStop } from "./day.mjs";
import { sealOf } from "./seal.mjs";

const HEAP = /^--max-old-space-size=[1-9][0-9]*$/, LF = String.fromCharCode(10), SCRIPT = fileURLToPath(import.meta.url);

/** One seal: the guards of the child (execArgv, env), then sealOf of the spec `text`; sealOf's result, or a named stop thrown. */
export function sealChild(text, { execArgv, env }) {
  if (execArgv.length !== 1 || !HEAP.test(execArgv[0])) throw new RecorderStop("proxy_refused", { execArgv_length: execArgv.length, why: "the heap cap alone" });
  guardEnv(env, []);
  const { open = [], ...spec } = JSON.parse(text);
  return sealOf({ ...spec, closed: (cid, seg) => !open.includes(`${cid}/${seg}`) });
}

const started = (argv1) => { try { return realpathSync(argv1) === realpathSync(SCRIPT); } catch { return false; } };
if (started(process.argv[1])) {
  try {
    process.stdout.write(JSON.stringify({ result: sealChild(process.argv[2], process) }) + LF);
  } catch (e) {
    if (!(e instanceof RecorderStop || e instanceof DayStop)) throw e;
    process.stdout.write(JSON.stringify({ stop: e.code, detail: e.detail }) + LF);
    process.exitCode = 1;
  }
}
