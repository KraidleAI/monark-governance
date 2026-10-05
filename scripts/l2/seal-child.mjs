#!/usr/bin/env node
// scripts/l2/seal-child.mjs -- the child process that seals one day of one symbol for the recording loop (lot P1-c5-bis-a of part P1,
// 2026-10-05; lot plan docs/G0-lot-l2-p1-c5-bis.md). Node 24, zero dependencies. Spawned by sealApart (scripts/l2/seal.mjs) as
// node --max-old-space-size=<n> seal-child.mjs <spec>, never by hand. Its own guards first, before any data is read (its modules are
// loaded by then: the parent's explicit env is the first defence, n-1 of the G2 of c5-bis-a): its execArgv is exactly one flag, the heap
// cap (any other, or none: proxy_refused); its environment passes guardEnv of the command with no flag (the closed list: empty on Linux,
// so a proxy variable, NODE_OPTIONS or any other name stops it, named); its fd 3 is the root its parent pinned, a linked directory of the dev
// and ino the spec names, and no file, directory nor socket is inherited past it (else out_not_l2; B-1 of that G2). Then sealOf of the
// spec (JSON: out, symbol, day, nowUs, config, scale, bounds; open, the "cid/seg" its parent's writers hold open; root) written through
// /proc/self/fd/3, the result's dir named under spec.out. One JSON line on stdout: { result } (exit 0) or { stop, detail } of a named
// stop (exit 1); a heap past the cap aborts this process alone. A descriptor the recorder itself inherited without O_CLOEXEC never reaches this child (n-14 of the G2 delta of c5-bis-a: spawn passes its stdio alone). The agent never commits (R-20).
import { fstatSync, readdirSync, readlinkSync, realpathSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { guardEnv, RecorderStop } from "../record-binance-l2.mjs";
import { DayStop } from "./day.mjs";
import { sealOf } from "./seal.mjs";

const HEAP = /^--max-old-space-size=[1-9][0-9]*$/, LF = String.fromCharCode(10), SCRIPT = fileURLToPath(import.meta.url);
const ROOT = 3, PINNED = `/proc/self/fd/${ROOT}`, OWN = /^((anon_inode|pipe):|\/dev\/null$)/; // past fd 3, node's own: its loops', its pipes', /dev/null
const target = (n) => { try { return readlinkSync(`/proc/self/fd/${n}`); } catch { return "pipe:"; } }; // gone since listed: the listing's own
/** Why fd 3 is not the root the parent pinned (a directory still linked, r-1 of the G2 delta, of the spec's dev and ino, nothing inherited past it), or null. */
function unpinned(root) {
  try {
    const st = fstatSync(ROOT, { bigint: true }), extra = readdirSync("/proc/self/fd").map(Number).filter((n) => n > ROOT && !OWN.test(target(n)));
    return st.isDirectory() && st.nlink > 0n && String(st.dev) === root?.dev && String(st.ino) === root?.ino && extra.length === 0 ? null : { extra };
  } catch (e) { return { error: e?.code ?? null }; }
}

/** One seal: the guards of the child (execArgv, env, fd 3), then sealOf of the spec `text`; sealOf's result, or a named stop thrown. */
export function sealChild(text, { execArgv, env }) {
  if (execArgv.length !== 1 || !HEAP.test(execArgv[0])) throw new RecorderStop("proxy_refused", { execArgv_length: execArgv.length, why: "the heap cap alone" });
  guardEnv(env, []);
  const { open = [], root, ...spec } = JSON.parse(text), why = unpinned(root);
  if (why !== null) throw new RecorderStop("out_not_l2", { ...why, why: "fd 3 alone, the pinned root" });
  const r = sealOf({ ...spec, out: PINNED, closed: (cid, seg) => !open.includes(`${cid}/${seg}`) });
  return typeof r.dir === "string" ? { ...r, dir: join(spec.out, relative(PINNED, r.dir)) } : r;
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
