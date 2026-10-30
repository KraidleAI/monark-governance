#!/usr/bin/env node
// scripts/record-h5-e2e-trace.mjs - reproducible recorder for the Lot H5 end-to-end demonstration
// (ADR-M005 H5 / C-6, docs/PLAN-harnais-lot.md H5). Drives the harness IN-PROCESS over the real MCP
// tools/call wire (streamable-HTTP) + the HTTP/JSON mirror, and writes the captured chain to
// fixtures/h5-e2e-trace.json (deterministic: the tools read no clock, the ephemeral port is not
// recorded). Prints the LF sha256, which is pinned in test/h5-e2e-probe.test.ts and stated in
// fixtures/PROVENANCE-h5-e2e-trace.md. The probe re-drives the SAME chain live and deep-equals it.
// It then sets the entry of that trace in the site manifest apps/site/data/manifest.sha256.json, by
// setManifestEntry of scripts/sync-ukemi-served.mjs, written only on a change. Refused before any write:
// a manifest that is unreadable or not JSON, a trace before that is unreadable, a failed build, an entry
// not already listed (it is never added), a manifest not in its canonical form. A failed write, or the
// site loader loadH5Trace refusing the new trace, writes back both texts before and refuses.
// Outputs, closed: stdout four lines (wrote, bytes, sha256(LF), the manifest entry set or unchanged),
// nothing of the manifest; stderr one line "record-h5-e2e-trace REFUSED: <code>", no exception message
// relayed; exit 1. Importing this module runs nothing: the run is under the script guard below.
//
//   node scripts/record-h5-e2e-trace.mjs
//
// The agent does NOT commit (R-20); the orchestrator commits the produced fixture + provenance.
import { readFileSync, writeFileSync, writeSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { MANIFEST_REL, setManifestEntry } from "./sync-ukemi-served.mjs";
import { H5_TRACE_REL, loadH5Trace } from "../apps/site/lib/harness-served-load.ts";
import { buildTrace, sha256Lf } from "../test/h5-trace-builder.ts";

export const TRACE_REL = H5_TRACE_REL;
export { MANIFEST_REL };
/** The closed refusal codes, in the order of the run. */
export const REFUSALS = Object.freeze([
  "manifest_unreadable",
  "trace_unreadable",
  "build_failed",
  "manifest_entry_unlisted",
  "manifest_not_canonical",
  "write_failed",
  "postcondition_failed",
]);
/** An error that carries the closed code only, never the message of the exception it replaces. */
const closed = (code) => new Error(code);

/** Pure, no file nor environment read: the manifest text with the trace entry set to the LF sha256 of `traceText`, as
 *  { text, sha, changed }. Throws closed("manifest_unreadable") if the text is not JSON, closed("manifest_entry_unlisted")
 *  if its files table is not an object or does not list the entry, closed("manifest_not_canonical") if setManifestEntry
 *  refuses. */
export function pinnedManifest(manifestText, traceText) {
  let m;
  try { m = JSON.parse(manifestText); } catch { throw closed("manifest_unreadable"); }
  const files = m !== null && typeof m === "object" ? m.files : undefined;
  if (files === null || typeof files !== "object" || !Object.hasOwn(files, TRACE_REL)) throw closed("manifest_entry_unlisted");
  const sha = sha256Lf(traceText);
  let text;
  try { text = setManifestEntry(manifestText, TRACE_REL, sha); } catch { throw closed("manifest_not_canonical"); }
  return { text, sha, changed: text !== manifestText };
}

/** Record the trace under `root`, set its manifest entry, check both by the site loader; returns the LF sha256.
 *  Every refusal is a closed code; nothing is written before pinnedManifest, and a write already made is undone. */
export async function recordH5Trace(root, { build = buildTrace, log = console.log, accept = loadH5Trace } = {}) {
  const manifestPath = join(root, MANIFEST_REL), tracePath = join(root, TRACE_REL);
  let manifestText, traceBefore, text;
  try { manifestText = readFileSync(manifestPath, "utf8"); } catch { throw closed("manifest_unreadable"); }
  try { traceBefore = readFileSync(tracePath, "utf8"); } catch { throw closed("trace_unreadable"); }
  try { text = JSON.stringify(await build(), null, 2) + "\n"; } catch { throw closed("build_failed"); }
  const out = pinnedManifest(manifestText, text); // its refusal, a closed code, goes out as it is
  /** Both texts before written back, each on its own; a failure of the write back is ignored (the refusal stands). */
  const restore = () => {
    try { writeFileSync(tracePath, traceBefore, "utf8"); } catch { /* ignored: the refusal that follows is the outcome */ }
    try { writeFileSync(manifestPath, manifestText, "utf8"); } catch { /* ignored: the refusal that follows is the outcome */ }
  };
  try {
    writeFileSync(tracePath, text, "utf8");
    if (out.changed) writeFileSync(manifestPath, out.text, "utf8");
  } catch {
    restore();
    throw closed("write_failed");
  }
  try {
    await accept(root);
  } catch {
    restore();
    throw closed("postcondition_failed");
  }
  log(`wrote ${TRACE_REL}`);
  log(`bytes: ${String(Buffer.byteLength(text))}`);
  log(`sha256(LF): ${out.sha}`);
  log(`manifest entry of ${TRACE_REL} ${out.changed ? "set" : "unchanged"}`);
  return out.sha;
}

/** The one stderr line of a refusal: the closed code, or "unexpected"; no exception text is relayed. */
export function refusalLine(e) {
  const code = e instanceof Error && REFUSALS.includes(e.message) ? e.message : "unexpected";
  return `record-h5-e2e-trace REFUSED: ${code}\n`;
}

const MAIN = process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;
if (MAIN) {
  try {
    await recordH5Trace(join(dirname(fileURLToPath(import.meta.url)), ".."));
  } catch (e) {
    writeSync(2, refusalLine(e));
    process.exit(1);
  }
}
