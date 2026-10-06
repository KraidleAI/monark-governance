/**
 * SITE-SEND-GUARD-MECH-1 (lot CM-3c-4a, docs/G0-lot-c-prime.md item 1; MONARK Q-CP-4: no bypass, fail-closed). The site send
 * (RUNBOOK-vitrine step 1, `export-public.mjs --out`) and the mirror release (`release-public.mjs`, which runs that export)
 * refuse while a pending snapshot is in the exported tree: apps/site/data/harness-pending.json or ukemi-pending.json, or
 * pending_since on harness-served.json or ukemi-served.json. `--check` (CI) is not guarded. The T0 promotion removes the
 * snapshot and pending_since, so the guard lifts there. New names are read through a namespace import (the base loads).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import * as exportPublic from "../scripts/export-public.mjs";
import { dropPendingSnapshot, ensurePendingSnapshot } from "./helpers/pending-snapshot.ts";

const ROOT = join(import.meta.dirname, "..");
const DATA = "apps/site/data";
type Blockers = (kept: { abs: string; rel: string }[], readText: (abs: string) => string | null) => string[];

// The whole tree as a send would export it: --out refuses and writes nothing while the snapshot is there, --check stays
// green with it, and once the snapshot is promoted the same --out exports, with no pending file in the export.
// killer: scripts/export-public.mjs:517 CONST "if (blockers.length)" -> "if (false)"
test("site_send_refused_while_a_pending_snapshot_exists", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "monark-send-guard-"));
  try {
    const src = join(tmp, "src");
    cpSync(ROOT, src, { recursive: true, filter: (from: string): boolean => !/(^|\/)(node_modules|\.git|dist)(\/|$)/.test(relative(ROOT, from).replace(/\\/g, "/")) });
    writeFileSync(join(src, "LICENSE"), "MONARK export test fixture (not a real license).\n");
    const run = (...args: string[]): { status: number | null; out: string } => {
      const r = spawnSync(process.execPath, [join(src, "scripts", "export-public.mjs"), ...args], { cwd: src, encoding: "utf8", timeout: 240_000 });
      return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
    };
    await ensurePendingSnapshot(src); // the committed one from C2 to T0, else one written by the syncs' --pending (after T0)
    assert.ok(existsSync(join(src, DATA, "harness-pending.json")) && existsSync(join(src, DATA, "ukemi-pending.json")), "the tree carries a pending snapshot");
    const refused = run("--out", join(tmp, "out-refused"));
    assert.equal(refused.status, 1, `--out refuses while the snapshot exists:\n${refused.out.slice(-1500)}`);
    for (const name of ["harness-pending.json", "ukemi-pending.json", "harness-served.json (pending_since)", "ukemi-served.json (pending_since)", "SITE-SEND-GUARD-MECH-1"]) assert.ok(refused.out.includes(name), `the refusal names ${name}`);
    assert.equal(existsSync(join(tmp, "out-refused")), false, "nothing is written");
    const check = run("--check");
    assert.equal(check.status, 0, `--check is not guarded:\n${check.out.slice(-1500)}`);
    dropPendingSnapshot(src);
    const sent = run("--out", join(tmp, "out-sent"));
    assert.equal(sent.status, 0, `the promoted tree exports:\n${sent.out.slice(-1500)}`);
    const data = readdirSync(join(tmp, "out-sent", DATA));
    assert.ok(data.includes("harness-served.json") && !data.some((f) => f.endsWith("-pending.json")), "the export carries no pending snapshot");
    await ensurePendingSnapshot(src); // the promoted tree, as after T0: the syncs' --pending writers stage a new snapshot
    const again = run("--out", join(tmp, "out-again"));
    assert.ok(again.status === 1 && again.out.includes("harness-pending.json") && !existsSync(join(tmp, "out-again")), "a snapshot written on the promoted tree is refused again");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// The pure guard: each of the two snapshot files alone blocks, pending_since alone blocks on either served file, an
// unreadable served file blocks (fail-closed), and a tree without any of them is let through.
// killer: scripts/export-public.mjs:277 CONST "\"apps/site/data/ukemi-pending.json\"" -> "\"apps/site/data/ukemi-pending.jsonl\""
test("site_send_allowed_after_promotion_and_check_unaffected", () => {
  const blockers = (exportPublic as Record<string, unknown>)["pendingSendBlockers"] as Blockers | undefined;
  assert.equal(typeof blockers, "function", "export-public.mjs exports pendingSendBlockers");
  if (blockers === undefined) return;
  const texts: Record<string, string | null> = {
    [`${DATA}/harness-served.json`]: '{"schema":"x","read_at":"t"}', [`${DATA}/ukemi-served.json`]: '{"schema":"x"}',
    marked: '{"schema":"x","read_at":"t","pending_since":"2026-10-05"}', unreadable: null,
  };
  const file = (rel: string, text = rel): { abs: string; rel: string } => ({ abs: text, rel });
  const read = (abs: string): string | null => texts[abs] ?? null;
  const clean = [file(`${DATA}/harness-served.json`), file(`${DATA}/ukemi-served.json`), file(`${DATA}/bell-served.json`, "unreadable"), file("README.md", "unreadable")];
  assert.deepEqual(blockers(clean, read), [], "a promoted tree is let through");
  assert.deepEqual(blockers([...clean, file(`${DATA}/harness-pending.json`)], read), [`${DATA}/harness-pending.json`]);
  assert.deepEqual(blockers([...clean, file(`${DATA}/ukemi-pending.json`)], read), [`${DATA}/ukemi-pending.json`]);
  assert.deepEqual(blockers([file(`${DATA}/harness-served.json`, "marked"), file(`${DATA}/ukemi-served.json`)], read), [`${DATA}/harness-served.json (pending_since)`]);
  assert.deepEqual(blockers([file(`${DATA}/harness-served.json`), file(`${DATA}/ukemi-served.json`, "marked")], read), [`${DATA}/ukemi-served.json (pending_since)`]);
  assert.deepEqual(blockers([file(`${DATA}/ukemi-served.json`, "unreadable")], read), [`${DATA}/ukemi-served.json (pending_since)`], "an unreadable served file blocks");
  assert.deepEqual(blockers([file("apps/site/data/sub/harness-pending.json"), file("harness-pending.json")], read), [], "only the two site data paths count");
});
