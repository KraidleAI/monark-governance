// scripts/registry-root.mjs -- lot R25-REGISTRY-ROOT-1 (ADR-M003 D9 septdecies, 2026-10-06): the closed root of the wave registries
// that the harness reads byte for byte, excluded from the R-25 count by one pathspec of the r25 job (.github/workflows/ci.yml, derived
// in test/ci-gates.test.ts). registryRootProblems names, for a root directory: (a) a symbolic link (the root itself or an entry: git
// counts the link, not its target, so the target would escape both the closed root and the count; G2 B-1) or a subdirectory; (b) any
// file but a wave<k>.json (k >= 1, no leading zero) and the one declaration PROVENANCE-kata-registry.md; (c) a registry that is not
// UTF-8, or that holds a CR, U+2028 or U+2029; (d) a registry whose raw-byte sha256 is not on the declaration row (a line opening with
// "|") that names it, and it only; (e) a declaration row naming an absent wave<k>.json; (f) a registry that its wave's reader refuses:
// readRegistry for wave1.json, no reader yet for k >= 2 (FORMAT-W2, lot E-1a). Entries are read by lstat, never through a link.
// Tests: test/ci-gates.test.ts (kata_registry_*).
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readRegistry } from "../apps/harness/src/policy-projection.ts";

/** The registry root, repo-relative (POSIX). */
export const REGISTRY_ROOT = "apps/harness/data/kata/registry";
/** The one declaration of the root, counted under R-25. */
export const REGISTRY_DECL = "PROVENANCE-kata-registry.md";
const REGISTRY_FILE = /^wave[1-9][0-9]*\.json$/;
/** CR, U+2028 and U+2029: no registry holds them. */
const SEPARATORS = [0x0d, 0x2028, 0x2029].map((c) => String.fromCharCode(c));

/** The wave<k>.json names of a declaration row, each delimited as in series_pinned_are_declared_and_hashed (line ends, backtick,
 *  "|", space, "/" or a parenthesis). */
export const declaredWaves = (row) => [...row.matchAll(/(?:^|[`| /()])(wave[1-9][0-9]*\.json)(?=$|[`| /()])/g)].map((m) => m[1] ?? "");

/** The refusals of a registry root directory, each opening with its letter, and the registries read. */
export function registryRootProblems(absRoot) {
  const problems = [], registries = [], names = readdirSync(absRoot).sort(), at = (n) => lstatSync(join(absRoot, n));
  if (lstatSync(absRoot).isSymbolicLink()) problems.push(`(a) the root is a symbolic link`);
  const rows = names.includes(REGISTRY_DECL) && at(REGISTRY_DECL).isFile()
    ? readFileSync(join(absRoot, REGISTRY_DECL), "utf8").split(/\r?\n/).filter((l) => l.startsWith("|")) : [];
  for (const n of names) {
    const st = at(n);
    if (st.isSymbolicLink()) { problems.push(`(a) ${n} is a symbolic link`); continue; }
    if (st.isDirectory()) { problems.push(`(a) ${n}/ is a subdirectory`); continue; }
    if (n === REGISTRY_DECL) continue;
    if (!REGISTRY_FILE.test(n)) { problems.push(`(b) ${n} is neither a wave<k>.json nor ${REGISTRY_DECL}`); continue; }
    registries.push(n);
    const bytes = readFileSync(join(absRoot, n));
    let text = "";
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { problems.push(`(c) ${n} is not UTF-8`); continue; }
    if (SEPARATORS.some((c) => text.includes(c))) problems.push(`(c) ${n} holds a CR, U+2028 or U+2029`);
    const sha = createHash("sha256").update(bytes).digest("hex");
    if (!rows.some((r) => r.includes(sha) && declaredWaves(r).join() === n)) problems.push(`(d) ${n}: sha256 ${sha} is not on the row that names it`);
    if (n !== "wave1.json") { problems.push(`(f) ${n} has no reader yet (FORMAT-W2, lot E-1a)`); continue; }
    try { readRegistry(bytes); } catch (e) { problems.push(`(f) wave1.json is refused by readRegistry: ${e instanceof Error ? e.message : String(e)}`); }
  }
  for (const w of rows.flatMap(declaredWaves)) if (!names.includes(w)) problems.push(`(e) ${REGISTRY_DECL} declares an absent ${w}`);
  return { problems, registries };
}
