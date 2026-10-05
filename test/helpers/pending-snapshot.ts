// The site data of a copied tree as the T0 promotion leaves it (SITE-SEND-GUARD-MECH-1, lot CM-3c-4a): the two pending
// snapshots removed, pending_since dropped from the two served files, the site manifest re-hashed (CRLF->LF, its rule).
// For the tests that run a real `export-public.mjs --out` on a whole-tree copy: the guard refuses while a snapshot exists.
import { createHash } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
}
