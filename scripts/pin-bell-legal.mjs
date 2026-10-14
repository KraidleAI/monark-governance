// scripts/pin-bell-legal.mjs - re-pin the one entry of apps/site/data/bell-legal.json in the site manifest
// apps/site/data/manifest.sha256.json (chantier BELL-COLLECT-TIMER-1, part 1, lot 1d-i; decision Q-18 (a)). Node 24, built-ins and the
// site's own loaders only. SOURCE-REPO tool, not exported (scripts/ is not in WHITELIST_DIRS of scripts/export-public.mjs, nor this
// file in WHITELIST_FILES), like scripts/sync-bell-served.mjs. Run after an edit of the legal file:  node scripts/pin-bell-legal.mjs
//
// The rule is the loader's (apps/site/lib/bell-legal-load.ts): the file read as utf8, CRLF folded to LF, sha256 of that text in utf8,
// lowercase hex. The manifest text must parse as JSON (the result is dropped); its one entry is then replaced by setManifestEntry of
// apps/site/lib/bell-served-load.ts (a slice of text, every other byte kept; refused unless the entry is listed once with 64 hex),
// and written only on a change. The legal file is never written. Postcondition on every run: loadBellLegal(ROOT) must accept the
// result, else the original text is written back, so a drift between this rule and the loader's is seen at each run.
// Outputs, closed: stdout one line "pin-bell-legal OK: <file> set to <sha256>" or "pin-bell-legal OK: <file> unchanged <sha256>";
// stderr one line "pin-bell-legal REFUSED: <code>". No exception message is relayed (a JSON.parse message quotes the text it read).
// Codes: usage (any argument, before any read, the loaders' modules included); legal_unreadable; manifest_unreadable (unreadable, or
// not JSON); manifest_entry_not_once; write_failed (a write of the manifest throws, the write back included); postcondition_failed.
// Exits: 0 set, or already right; 1 a named refusal; 64 usage.
import { readFileSync, writeFileSync, writeSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const MAIN = process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;
/** The one stderr line, written synchronously before the exit. */
const refuse = (code) => {
  writeSync(2, `pin-bell-legal REFUSED: ${code}\n`);
  process.exit(code === "usage" ? 64 : 1);
};
if (MAIN && process.argv.length !== 2) refuse("usage");

const lib = (name) => pathToFileURL(join(ROOT, "apps", "site", "lib", name)).href;
const { BELL_LEGAL_REL, loadBellLegal } = await import(lib("bell-legal-load.ts"));
const { setManifestEntry } = await import(lib("bell-served-load.ts"));
/** An error that carries the closed code only, never the message of the exception it replaces. */
const closed = (code) => new Error(code);

/** Pure, no file nor environment read: the manifest text with the legal entry set to the loader's sha256 of `legalRaw`, as
 *  { text, sha, changed }. Throws closed("manifest_unreadable") if the text is not JSON, closed("manifest_entry_not_once") if
 *  setManifestEntry refuses. */
export function pinnedManifest(manifestText, legalRaw) {
  try { JSON.parse(manifestText); } catch { throw closed("manifest_unreadable"); }
  const lf = legalRaw.replace(/\r\n/g, "\n");
  const sha = createHash("sha256").update(lf, "utf8").digest("hex");
  let text;
  try { text = setManifestEntry(manifestText, BELL_LEGAL_REL, sha); } catch { throw closed("manifest_entry_not_once"); }
  return { text, sha, changed: text !== manifestText };
}

function main() {
  const manifestPath = join(ROOT, MANIFEST_REL);
  let legalRaw, manifestText, out;
  try { legalRaw = readFileSync(join(ROOT, BELL_LEGAL_REL), "utf8"); } catch { return refuse("legal_unreadable"); }
  try { manifestText = readFileSync(manifestPath, "utf8"); } catch { return refuse("manifest_unreadable"); }
  try { out = pinnedManifest(manifestText, legalRaw); } catch (e) { return refuse(e.message); } // a closed code, by pinnedManifest
  if (out.changed) {
    try { writeFileSync(manifestPath, out.text); } catch { return refuse("write_failed"); }
  }
  let accepted = true;
  try { loadBellLegal(ROOT); } catch { accepted = false; }
  if (!accepted) {
    if (out.changed) {
      try { writeFileSync(manifestPath, manifestText); } catch { return refuse("write_failed"); }
    }
    return refuse("postcondition_failed");
  }
  console.log(`pin-bell-legal OK: ${BELL_LEGAL_REL} ${out.changed ? "set to" : "unchanged"} ${out.sha}`);
}

if (MAIN) main();
