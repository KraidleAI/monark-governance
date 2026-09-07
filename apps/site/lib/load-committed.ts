// apps/site/lib/load-committed.ts — the site renders numbers ONLY from committed, hashed data
// (ADR-M004 D1 honesty rule / D11 test 44). This module verifies every file listed in
// apps/site/data/manifest.sha256.json against its committed SHA-256 before returning it, so a
// tampered or drifted data file is caught at load time rather than silently rendered.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export interface SiteManifest {
  algorithm: string;
  files: Record<string, string>;
}

export interface SourcedFigure {
  id: string;
  value: number;
  unit: string;
  qualifier: string;
  claim: string;
  source: string;
  doi: string;
  page: number;
  level: string;
  used_by: string;
}

export interface FiguresFile {
  figures: SourcedFigure[];
}

const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const FIGURES_REL = "fixtures/figures-sourced.json";

/** CRLF->LF then hash the UTF-8 string: OS-independent, mirrors test/fixtures-root.test.ts. */
function sha256Normalized(abs: string): string {
  const text = readFileSync(abs, "utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Verify every file listed in the manifest against its committed sha256, then return the verified
 * figures. Throws on an absent file, an empty/unsupported manifest, or a hash mismatch (tamper-evident,
 * fail-closed).
 *
 * `rootDir` is REQUIRED and points at the repo root. It is NOT derived from `import.meta.url`: under the
 * Next bundler this module's URL is rewritten to a .next/server chunk path, so a relative walk to the
 * repo root would resolve wrong at runtime. Callers pass it explicitly — the root test passes the repo
 * root; a future server component derives it from process.cwd() (apps/site under `next dev`, so
 * `join(process.cwd(), "..", "..")`).
 */
export function loadCommitted(rootDir: string): FiguresFile {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as SiteManifest;
  if (manifest.algorithm !== "sha256") {
    throw new Error(`load-committed: unsupported manifest algorithm '${manifest.algorithm}' (expected sha256)`);
  }
  const entries = Object.entries(manifest.files);
  if (entries.length === 0) {
    throw new Error("load-committed: manifest lists no files (fail-closed)");
  }
  for (const [rel, expected] of entries) {
    const actual = sha256Normalized(join(rootDir, rel));
    if (actual !== expected) {
      throw new Error(`load-committed: sha256 mismatch for ${rel} (manifest ${expected}, actual ${actual})`);
    }
  }
  return JSON.parse(readFileSync(join(rootDir, FIGURES_REL), "utf8")) as FiguresFile;
}
