// The site data of a copied tree as the T0 promotion leaves it (SITE-SEND-GUARD-MECH-1, lot CM-3c-4a): the two pending
// snapshots removed, pending_since dropped from the two served files, the site manifest re-hashed (CRLF->LF, its rule).
// For the tests that run a real `export-public.mjs --out` on a whole-tree copy: the guard refuses while a snapshot exists.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as harnessSync from "../../scripts/sync-harness-served.mjs";
import * as ukemiSync from "../../scripts/sync-ukemi-served.mjs";

/** T0-TOOLING-1 (review B-2): the pending snapshot of a copied tree, whatever state it is in. A tree that carries none (after
 *  T0) gets one from the two syncs' own --pending writers, in process (files, pending_since, manifest entries); a tree that
 *  carries one keeps it. The guard tests stay meaningful on both sides of T0, with nothing to re-pin. */
export async function ensurePendingSnapshot(root: string): Promise<void> {
  const writers = { harness: (harnessSync as Record<string, unknown>)["writeHarnessPending"], ukemi: (ukemiSync as Record<string, unknown>)["writeUkemiPending"] };
  for (const [name, write] of Object.entries(writers)) {
    assert.equal(typeof write, "function", `scripts/sync-${name}-served.mjs exports its --pending writer`);
    if (!existsSync(join(root, `apps/site/data/${name}-pending.json`))) await (write as (r: string, at: string) => Promise<string>)(root, new Date().toISOString());
  }
}

export function dropPendingSnapshot(root: string): void {
  const manifestRel = "apps/site/data/manifest.sha256.json";
  const manifest = JSON.parse(readFileSync(join(root, manifestRel), "utf8")) as { files: Record<string, string> };
  for (const name of ["harness", "ukemi"]) {
    rmSync(join(root, `apps/site/data/${name}-pending.json`), { force: true });
    delete manifest.files[`apps/site/data/${name}-pending.json`];
    const rel = `apps/site/data/${name}-served.json`;
    const text = readFileSync(join(root, rel), "utf8").replace(/\r\n/g, "\n").replace(/\n {2}"pending_since": "[^"]*",/, "");
    writeFileSync(join(root, rel), text);
    manifest.files[rel] = createHash("sha256").update(text, "utf8").digest("hex");
  }
  writeFileSync(join(root, manifestRel), `${JSON.stringify(manifest, null, 2)}\n`);
  // G2 N-7: fail here, not later with the send guard's message, if the drop removed nothing (key moved, last or re-indented).
  for (const name of ["harness", "ukemi"]) {
    const rel = `apps/site/data/${name}-served.json`;
    assert.doesNotMatch(readFileSync(join(root, rel), "utf8"), /"pending_since"/, `dropPendingSnapshot left pending_since in ${rel}: its layout changed, fix the helper`);
  }
}
