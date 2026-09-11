// scripts/lang-gate.mjs — French-language gate for the MONARK public export (ADR-M004 D7).
// Node 24, ZERO dependencies.
//
// WHY: the public storefront repo must be English (ADR-M004 D0.5 / ADR-M003 D0.5). This gate
// flags residual French in the EXPORTED (whitelisted) text files, with a CLOSED, committed
// exemption list (scripts/lang-exempt.json) for the frozen French that legitimately stays:
// the frozen contract identifiers (ADR-M001, byte-frozen by contracts-frozen.test.ts), the
// Shogen fixture keys, proper nouns, ADR/R/§ references, and the 5 frozen JSON-Schema
// descriptions.
//
// DETECTION (three signals, applied AFTER masking the exemptions on each line):
//   (1) diacritic  — a letter-run containing a French diacritic. CODEPOINT-level: Node reads
//                    UTF-8, so there is NO byte-grep §/0xA7 false positive (the "4 accented
//                    lines" mirages of the mission were 0xA7 = the trailing byte of ç).
//   (2) fr-word    — a curated whole-word list of common French words that do not collide with
//                    English or code in this repo (verified code-scope=0). `de`/`du` are
//                    DELIBERATELY absent (they collide with the CI job name r25-taille-de-lot
//                    and the vocab-banned regex `(de\\s+|of\\s+)`); French prose is still caught
//                    by le/la/les/un/une/est/...
//   (3) fr-id      — the genuinely-French frozen snake_case identifiers that carry no diacritic
//                    and are not fr-words (octets_recalcules, verite, ...). This list lives HERE,
//                    SEPARATE from scripts/lang-exempt.json, so removing an identifier from the
//                    exempt file (test 42 mutant) un-masks it and reddens on that token — the
//                    exemption is load-bearing.
//
// The gate's OWN definition files (this file and lang-exempt.json) and the generated
// package-lock.json are NOT scanned: they enumerate the very French tokens they detect, by
// construction. This is an exclusion of SCANNING, not an exemption of words.
//
// PATH EXEMPTION (lang-exempt.json "paths", K-2 / ADR-M005 D3): a repo-relative glob list
// (only `*` = a run of non-slash chars) of WHOLE FILES that are verbatim, sha256-pinned third-party
// artifacts and thus legitimately non-English — here the Shogen fixtures fixtures/s3-binance.* (the
// verifier output is French: "VERDICT : valide sous A(notary-neutrality), ..."). A path-exempt file is skipped entirely
// (never scanned). This is a PATH mechanism, NOT phrase masking: the fixtures stay byte-frozen and
// removing the entry un-skips the file so its French reddens the root scope (mutant-testable).
//
// SCOPE: every run computes hit counts for ALL scopes (root, contracts, schemas, hikae, ukemi,
// atelier, monark) — free input data for the E-* translation lots. `--scope a,b` only gates the EXIT
// CODE: exit 1 iff a non-exempt hit falls in a selected scope. No --scope = global. For this gate
// the E-hikae/ukemi/atelier/monark lots are NOT done, so global is RED by design; the lot's
// oracle is `--scope root,contracts` = GREEN. The frozen `schemas` scope (ADR-M001 D9-bis) is
// English-only and GATED alongside root,contracts (test 42 uses root,contracts,schemas,site).
//
// Usage: node scripts/lang-gate.mjs [--dir <path>] [--scope root,contracts] [--json]
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SCRIPT_DIR = fileURLToPath(new URL(".", import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..");

// Frozen French identifiers (ASCII, no diacritic, not fr-words). Detected here; exempted (normally)
// by scripts/lang-exempt.json. Kept as a SEPARATE source so the exempt list is mutant-testable.
export const FRENCH_IDENTIFIERS = [
  "octets_recalcules", "verifier_revision", "sens_emis_digest", "verdict_de_verite",
  "score_de_confiance", "empreinte_du_sens_emis", "revision_amont_deleguee",
  "temoignage", "verite", "valide",
];

// Curated French words (case-insensitive). Distinctly French, verified not to collide with the
// English/code of the root+contracts scope. Accented entries are redundant with (1) but explicit.
export const FR_WORDS = [
  // articles / determiners
  // NB: "ce"/"de"/"du" are omitted — 2-letter words made of hex chars [a-f] or that collide
  // with CI job names collide with sha256 values / identifiers; "cet"/"cette"/"ces" cover them.
  "le", "la", "les", "un", "une", "des", "cet", "cette", "ces", "au", "aux",
  "mon", "mes", "tes", "ses", "notre", "nos", "votre", "vos", "leur", "leurs",
  // pronouns
  "je", "il", "elle", "ils", "elles", "nous", "vous", "lui", "eux",
  "celui", "celle", "ceux", "celles", "ceci", "cela",
  // etre / avoir / modal
  "est", "sont", "était", "étaient", "sera", "seront", "sommes", "êtes", "être", "été",
  "ont", "avait", "avaient", "avons", "avez", "avoir",
  "peut", "peuvent", "pouvait", "doit", "doivent", "devait", "fait", "faire",
  // prepositions / conjunctions
  "pour", "avec", "dans", "sur", "sous", "sans", "chez", "vers", "par", "entre", "selon",
  "depuis", "pendant", "avant", "après", "contre", "parmi", "malgré",
  "mais", "donc", "puis", "ainsi", "alors", "aussi", "comme", "lorsque", "puisque", "quoique", "afin",
  // negation / quantifiers
  "pas", "jamais", "rien", "aucun", "aucune", "personne", "guère",
  // interrogative / relative
  "que", "qui", "quoi", "dont", "où", "quand", "pourquoi", "lequel", "laquelle",
  // quantity / adjectives
  "tout", "tous", "toute", "toutes", "chaque", "quelque", "quelques", "plusieurs",
  "autre", "autres", "même", "mêmes", "tel", "telle", "tels", "telles",
  // adverbs
  "très", "trop", "assez", "peu", "beaucoup", "toujours", "déjà", "enfin", "ensuite",
  "ici", "là", "souvent", "parfois", "seulement", "surtout", "notamment", "également",
  "cependant", "toutefois", "néanmoins",
  // mission markers (nouns / verbs)
  "fichier", "fichiers", "règle", "règles", "échec", "erreur", "erreurs",
  "vérifie", "vérifier", "vérifié", "valeur", "valeurs", "champ", "champs", "clé", "clés",
  "niveau", "chaîne", "chaînes", "exemple", "exemples", "utilisateur",
  "données", "donnée", "sortie", "entrée", "entrées", "preuve", "preuves",
];

const DIACRITICS = "àâäáéèêëíîïóôöùûüÿçœæÀÂÄÁÉÈÊËÍÎÏÓÔÖÙÛÜŸÇŒÆ";

export const TEXT_EXTS = new Set([
  ".ts", ".tsx", ".mjs", ".cjs", ".js", ".jsx", ".md", ".mdx", ".yml", ".yaml", ".json", ".html", ".css", ".sh", ".txt",
]);
// `.next`/`.turbo` added for the apps/site scope: Next.js build output and Turbo cache are
// generated (gitignored) minified JS that would produce spurious hits and slow the scan — skipping them
// is an exclusion of SCANNING, not of words. A committed working tree never contains them.
export const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "docs", ".next", ".turbo"]);
export const EXCLUDE_NAMES = new Set(["package-lock.json", "lang-exempt.json", "lang-gate.mjs"]);
// `site` = apps/site (English-only per ADR-M003 D0.5). Gated by the export --scope site.
// `harness` = apps/harness (English-only per ADR-M005 D7/D9). Gated by --scope harness.
// `schemas` = the frozen contract JSON Schemas under schemas/ (ADR-M001 D9-bis). English-only external
// surface (published via the export whitelist + the D8 harness wire); GATED in ci (test 42) and at export
// so French prose in a schema `description`/`title` reddens — the annotation-erratum door-hole closure.
// `skills` = the ClawHub skill artefacts under skills/ (ADR-M006 D5). English-only (the
// SKILL.md/INTEGRATION.md are English); GATED so a French string in a published skill file reds.
export const SCOPES = ["root", "contracts", "schemas", "hikae", "ukemi", "atelier", "monark", "site", "harness", "skills"];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byLenDesc = (a, b) => b.length - a.length || (a < b ? -1 : 1);

// Detectors (built once).
const LETTER = "A-Za-zÀ-ÖØ-öø-ÿœŒ";
const LETTER_RUN = new RegExp("[" + LETTER + "]+", "g");
const DIA_ONE = new RegExp("[" + DIACRITICS + "]");
// fr-words: standalone words only. The boundary excludes an adjacent letter OR hyphen, so an
// English hyphenated compound (un-exemptable, non-...) is NOT a French "un"/"non". Real French
// hyphenated compounds (peut-être) still redden via their diacritic.
const FRW_RE = new RegExp(
  "(?<![" + LETTER + "-])(" + FR_WORDS.slice().sort(byLenDesc).map(esc).join("|") + ")(?![" + LETTER + "-])",
  "gi",
);
const FRID_RE = new RegExp("\\b(" + FRENCH_IDENTIFIERS.slice().sort(byLenDesc).map(esc).join("|") + ")\\b", "g");

/** POSIX-relative path -> scope name. */
export function classifyScope(rel) {
  const p = rel.replace(/\\/g, "/");
  if (p === "apps/site" || p.startsWith("apps/site/")) return "site"; // apps/site scope
  if (p === "apps/harness" || p.startsWith("apps/harness/")) return "harness"; // (K-3)
  if (p === "skills" || p.startsWith("skills/")) return "skills"; // (ADR-M006 D5)
  if (p === "schemas" || p.startsWith("schemas/")) return "schemas"; // ADR-M001 D9-bis: frozen contract schemas, gated
  const m = /^packages\/([^/]+)\//.exec(p);
  if (m && SCOPES.includes(m[1])) return m[1];
  return "root";
}

export function scannable(rel) {
  const name = basename(rel);
  return TEXT_EXTS.has(extname(rel).toLowerCase()) && !EXCLUDE_NAMES.has(name);
}

/** Convert a repo-relative POSIX glob (only `*` = any run of non-slash chars) to an anchored RegExp. */
export function globToRegExp(glob) {
  let body = "";
  for (const ch of glob) {
    if (ch === "*") body += "[^/]*";
    else body += /[.*+?^${}()|[\]\\]/.test(ch) ? "\\" + ch : ch;
  }
  return new RegExp("^" + body + "$");
}

/** True iff the POSIX-relative path is whole-file exempt by any compiled path glob (lang-exempt.json "paths"). */
export function pathExempt(rel, pathMatchers) {
  const p = rel.replace(/\\/g, "/");
  return pathMatchers.some((re) => re.test(p));
}

/** Compile the exemption maskers + path matchers from <dir>/scripts/lang-exempt.json. */
export function loadExempt(dir) {
  const raw = JSON.parse(readFileSync(join(dir, "scripts", "lang-exempt.json"), "utf8"));
  const terms = Array.isArray(raw.terms) ? raw.terms : [];
  const phrases = Array.isArray(raw.phrases) ? raw.phrases : [];
  const patterns = Array.isArray(raw.patterns) ? raw.patterns : [];
  const paths = Array.isArray(raw.paths) ? raw.paths : [];
  const maskers = [];
  if (phrases.length) maskers.push(new RegExp("(" + phrases.slice().sort(byLenDesc).map(esc).join("|") + ")", "g"));
  if (terms.length) maskers.push(new RegExp("\\b(" + terms.slice().sort(byLenDesc).map(esc).join("|") + ")\\b", "g"));
  for (const p of patterns) maskers.push(new RegExp(p, "g"));
  const pathMatchers = paths.map(globToRegExp);
  return { maskers, pathMatchers, raw };
}

/** Blank every exempt span with equal-length spaces (columns preserved for reporting). */
function maskLine(line, maskers) {
  let out = line;
  for (const re of maskers) {
    re.lastIndex = 0;
    out = out.replace(re, (m) => " ".repeat(m.length));
  }
  return out;
}

/** Scan raw text; returns deduped hits [{line,col,word,kind}]. */
export function scanText(text, maskers) {
  const hits = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const masked = maskLine(lines[i], maskers);
    let m;
    LETTER_RUN.lastIndex = 0;
    while ((m = LETTER_RUN.exec(masked))) {
      if (DIA_ONE.test(m[0])) hits.push({ line: i + 1, col: m.index + 1, word: m[0], kind: "diacritic" });
    }
    FRW_RE.lastIndex = 0;
    while ((m = FRW_RE.exec(masked))) hits.push({ line: i + 1, col: m.index + 1, word: m[0], kind: "fr-word" });
    FRID_RE.lastIndex = 0;
    while ((m = FRID_RE.exec(masked))) hits.push({ line: i + 1, col: m.index + 1, word: m[0], kind: "fr-id" });
  }
  const seen = new Set();
  const out = [];
  for (const h of hits) {
    const k = `${h.line}:${h.col}:${h.word}`;
    if (!seen.has(k)) { seen.add(k); out.push(h); }
  }
  return out;
}

export function scanFile(abs, maskers) {
  return scanText(readFileSync(abs, "utf8"), maskers);
}

/** True iff the file carries at least one non-exempt French hit (exempt-aware). */
export function isFileFrench(abs, maskers) {
  return scanFile(abs, maskers).length > 0;
}

/** Recursively collect scannable text files under dir, skipping SKIP_DIRS / excluded names. */
export function collectTextFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const abs = join(d, name);
      const st = statSync(abs);
      if (st.isDirectory()) {
        if (!SKIP_DIRS.has(name)) walk(abs);
      } else {
        const rel = abs.slice(dir.length + 1).replace(/\\/g, "/");
        if (scannable(rel)) out.push({ abs, rel });
      }
    }
  };
  walk(dir);
  return out;
}

/** Scan a list of {abs, rel}; returns per-file results + per-scope aggregation.
 *  pathMatchers (lang-exempt.json "paths", K-2): whole-file exemptions skipped entirely (never scanned). */
export function scanFileList(files, maskers, pathMatchers = []) {
  const results = [];
  const byScope = Object.fromEntries(SCOPES.map((s) => [s, { files: 0, hits: 0 }]));
  for (const f of files) {
    if (!scannable(f.rel)) continue;
    if (pathExempt(f.rel, pathMatchers)) continue; // whole-file path exemption (K-2 / ADR-M005 D3)
    const hits = scanFile(f.abs, maskers);
    const scope = classifyScope(f.rel);
    results.push({ rel: f.rel, scope, hits });
    if (hits.length) { byScope[scope].files += 1; byScope[scope].hits += hits.length; }
  }
  return { results, byScope };
}

// ---------------------------------------------------------------------------- CLI
function parseArgs(argv) {
  const a = { scope: null, dir: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--scope") a.scope = argv[++i];
    else if (t === "--dir") a.dir = argv[++i];
    else if (t === "--json") a.json = true;
  }
  return a;
}

export function reportAndExit({ byScope, results }, selectedScopes, json) {
  const withHits = results.filter((r) => r.hits.length);
  if (json) {
    console.log(JSON.stringify({ byScope, selected: selectedScopes, files: withHits }, null, 2));
  } else {
    for (const r of withHits) {
      for (const h of r.hits) console.log(`${r.rel}:${h.line}:${h.col}  [${h.kind}]  ${h.word}`);
    }
    console.log("\nlang-gate — hits per scope (non-exempt):");
    for (const s of SCOPES) {
      const flag = selectedScopes.includes(s) ? "GATED" : "count";
      console.log(`  ${s.padEnd(9)} ${String(byScope[s].hits).padStart(5)} hit(s) in ${byScope[s].files} file(s)  [${flag}]`);
    }
  }
  const bad = selectedScopes.reduce((n, s) => n + byScope[s].hits, 0);
  if (bad > 0) {
    console.error(`\nlang-gate FAILED — ${bad} non-exempt French hit(s) in scope {${selectedScopes.join(",")}} (ADR-M004 D7).`);
    process.exit(1);
  }
  console.log(`\nlang-gate OK — 0 non-exempt French hit(s) in scope {${selectedScopes.join(",")}}.`);
  process.exit(0);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dir = args.dir ? resolve(args.dir) : REPO_ROOT;
  if (!existsSync(join(dir, "scripts", "lang-exempt.json"))) {
    console.error(`lang-gate: no scripts/lang-exempt.json under ${dir} (needed for the exemptions).`);
    process.exit(2);
  }
  const { maskers, pathMatchers } = loadExempt(dir);
  const files = collectTextFiles(dir);
  const agg = scanFileList(files, maskers, pathMatchers);
  const selected = args.scope ? args.scope.split(",").map((s) => s.trim()).filter(Boolean) : SCOPES.slice();
  for (const s of selected) {
    if (!SCOPES.includes(s)) { console.error(`lang-gate: unknown scope '${s}' (known: ${SCOPES.join(",")})`); process.exit(2); }
  }
  reportAndExit(agg, selected, args.json);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
