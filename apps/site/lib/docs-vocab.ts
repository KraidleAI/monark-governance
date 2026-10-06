// apps/site/lib/docs-vocab.ts: the site's vocabulary rule, applied at build time to committed text the documentation renders
// by property access (a figure's claim or qualifier, for instance). The vocabulary gate (scripts/grep-forbidden.mjs) scans the
// site's source files; a string read from a data file at build is not in any source file, so the documentation checks it here,
// with the same rules: the global and the site-scoped patterns of vocab-banned.json, compiled case-insensitive as the gate
// compiles them, after masking the closed exempt phrases. A text that fails is not rendered, and the page says so.
// One documented exception: a page may pass a waiver tag, and the site rules whose reason carries that tag are then not
// applied to what that page renders (vocab-banned.json names the page in the reason itself; the root test pins the only
// page that passes a tag). A tag that matches no rule throws: a stale waiver fails the build.
// Server-only (node built-ins), self-contained (no alias or relative import): the root test program imports it too.
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface Rule {
  re: string;
  why?: string;
}
interface VocabFile {
  banned?: Rule[];
  scan?: { site?: { banned?: Rule[]; exemptPhrases?: string[] } };
}

const escapeLiteral = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A predicate: true when the text passes the site's vocabulary rules. Fail-closed on a file with no site rule, and on a
 *  waiver tag that no site rule carries. */
export function siteVocabulary(root: string, waiver?: string): (text: string) => boolean {
  const cfg = JSON.parse(readFileSync(join(root, "vocab-banned.json"), "utf8")) as VocabFile;
  const site = cfg.scan?.site?.banned ?? [];
  if (site.length === 0) throw new Error("docs vocabulary: vocab-banned.json carries no site rule (fail-closed)");
  const applied = waiver === undefined ? site : site.filter((r) => !(r.why ?? "").includes(waiver));
  if (waiver !== undefined && applied.length === site.length) throw new Error(`docs vocabulary: no site rule carries the waiver '${waiver}' (fail-closed)`);
  const patterns = [...(cfg.banned ?? []), ...applied].map((r) => new RegExp(r.re, "i"));
  const phrases = (cfg.scan?.site?.exemptPhrases ?? []).filter((p) => p.length > 0);
  const masker = phrases.length > 0 ? new RegExp(`(${phrases.map(escapeLiteral).join("|")})`, "gi") : null;
  return (text: string): boolean => {
    const masked = masker === null ? text : text.replace(masker, (m) => " ".repeat(m.length));
    return !patterns.some((re) => re.test(masked));
  };
}
