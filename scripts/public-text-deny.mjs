// scripts/public-text-deny.mjs — the gate of the PUBLIC FREE TEXTS (ADR-PUBLIC-CADENCE-1 D1.3): the commit message of the
// public mirror, release notes and public issue texts. GOVERNANCE-ONLY: NOT in export-public.mjs's whitelist (CA-1.5,
// asserted by test/site-build-fleet.test.ts and test 42 (f)), because it holds the closed list of the vendor names it bans:
// exporting it would publish them (decision 69 / C-9, the confinement that keeps them out of the exported vocab-banned.json).
//
// checkPublicText(text, kind) -> {ok, violations}: pure (reads only the committed gate configs), fail-closed (empty text,
// unknown kind), each violation names its rule, line and matched word (MAST FM-2.4). Rules, every kind:
//   (a) checkReleaseText: language gate + GLOBAL vocab + the site, skills and bell storefront scopes;
//   (b) the item-id shape [A-Z]+-[A-Z0-9-]+-digit, a CVE id excepted;   (c) the closed internal set (Q-5, Q-A1-3);
//   (d) "public sync";   (e) a reader-local drive path;   (f) a vendor name form, in any case (the lists below; Q-4);
//   (g) a credential shape (bell-publish KEY_SHAPES without its "://" rule; reported as prefix + length, never in clear),
//   or a URL outside the three public origins;   (k) a kitchen form (KITCHEN_FORMS: G0-G7, ADR-, decision N live there);
//   (p) an email address (a noreply address excepted: commit trailers) or an IPv4 address;   (cf) a format character
//   (\p{Cf}: zero-width, BOM, bidi), checked on the raw text; every other rule reads the NFKC form of the text;
//   (q3) the internal words budget, credit, lock and their -s/-ed/-ing forms (Q-3; "test" stays allowed);
//   (ph) an unfilled template marker, an upper-case identifier in braces such as {T0} or { OPENAPI-SHA256 }, EACH one of a
//   line named (lower-case brace lists such as {btc,eth} and shell variables such as ${HOME} pass, but not ${T0}, the
//   variable form of a TEMPLATE_MARKERS name, the markers of docs/public-notes/TEMPLATE.md);
// plus (h), kind "issue" only: no date or schedule word; and (title), kind "message" only: a first line of at most 50
// code points (Q-P-4), followed by an empty line when a body follows (git-commit DISCUSSION).
// kindForPath(rel) maps docs/public-notes/** to a kind (C-V-9), null (= refused) for any other path, and for TEMPLATE.md (the notes
// template, not a public text; docs/ is never exported).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scanText as scanLang, loadExempt } from "./lang-gate.mjs";
import { scanText as scanVocab, compilePatterns } from "./grep-forbidden.mjs";
import { WINDOWS_ABS_PATH_RE } from "./export-public.mjs";
import { KEY_SHAPES } from "../apps/bell/scripts/bell-publish.mjs";

const SRC = dirname(dirname(fileURLToPath(import.meta.url)));

// ---- (f) vendor name forms. The first four lists moved here from test/site-build-fleet.test.ts (VOCAB-PROVIDERS-SITE-1,
// G2 SITE-DOCS-1 C-G2-9), which imports them: one source (R-3). `sample` is one text the form matches, so a test builds its
// vectors from these lists and names no vendor of its own.
export const DATA_SOURCE_FORMS = Object.freeze([
  { re: /databento/i, why: "close-source brand (any form, substring)", sample: "Databento" },
  { re: /\bmassive\b/i, why: "cash cross-check brand (whole word; conservative over-match on the adjective)", sample: "Massive" },
  // Case-SENSITIVE on purpose: the lower-case SVG element <polygon> and the CSS clip-path function polygon() are markup,
  // not a name (measured: Base UI ships clip-path polygon() in the /fleet and /products chunks); the capitalised word is
  // the brand — and a chain of the same name, which also reds on the storefront (declared limit).
  { re: /\bPolygon\b/, why: "cash cross-check former brand (capitalised whole word; a chain of the same name also reds on the storefront)", sample: "Polygon" },
  { re: /polygon\.io/i, why: "cash cross-check API domain", sample: "polygon.io" },
  { re: /\b(?:POLYGON|DATABENTO)_API_KEY\b/, why: "data-source env-key name", sample: "DATABENTO_API_KEY" },
]);
// Data-source STEMS for the exported gate file (vocab-banned.json): matched as SUBSTRINGS, never behind a word boundary
// (a boundary form is what an escaped rule evades). No legitimate rule, reason or comment of that file needs them.
export const DATA_SOURCE_STEMS = Object.freeze([/massive/i, /databento/i, /polygon/i]);
// What a rule BANNING a data-source name would match, however the rule is spelled (escapes, character classes).
export const DATA_SOURCE_MENTIONS = Object.freeze(["Massive", "Databento", "Polygon", "polygon.io", "POLYGON_API_KEY", "DATABENTO_API_KEY"]);
// RPC operators the repository reads through, and the vendors of the G2 SITE-DOCS-1 list; "pocket" alone would hit "pocket
// knife", so that network is named by its token and full name. helius, chainstack and tenderly stay in the exported site
// scope of vocab-banned.json, so rule (a) already refuses them.
const rpc = (token) => ({ re: new RegExp(`\\b${token}\\b`, "i"), why: "RPC operator", sample: token });
export const OPERATOR_FORMS = Object.freeze([
  rpc("drpc"), rpc("publicnode"), rpc("llamarpc"), rpc("blastapi"), rpc("mevblocker"), rpc("1rpc"), rpc("ankr"),
  { re: /\bpokt\b|\bpocket\s+network\b/i, why: "RPC operator", sample: "pokt" }, rpc("alchemy"), rpc("quicknode"), rpc("infura"),
  { re: /\bkaiko\b/i, why: "market-data vendor", sample: "kaiko" }, { re: /\bdune\b/i, why: "query vendor", sample: "dune" },
  // The inference partner of the Dōjō's later piece: named in the internal records only, never on the storefront (any form).
  { re: /\buse[\s._-]*pod\b/i, why: "inference partner", sample: "UsePod" },
]);
// Q-4 (decision of the orchestrator, CHANTIERS l.1647): the hosting, registrar, registry and CDN vendors named in governance
// (ADR-M004 D2, D3, D6, D16 K-7). Open tools and protocols (web server, TLS, container runtime) are NOT listed. Applied to
// the public free texts only, never to the site scan (the exported code already names one of them, M-21).
export const HOSTING_FORMS = Object.freeze([
  { re: /\bhostinger\b|\bhstgr\b/i, why: "hosting, registrar and DNS vendor", sample: "Hostinger" },
  { re: /\bcloudflare\b/i, why: "CDN, proxy and DNS vendor", sample: "Cloudflare" },
  { re: /\bvercel\b/i, why: "site hosting vendor (rejected option)", sample: "Vercel" },
  { re: /\bghcr\b/i, why: "container registry", sample: "ghcr.io" },
]);
// Free text has no <polygon> markup: every vendor form reads in any case there (G2 C-G2-7: POLYGON, polygon).
const VENDOR_RES = Object.freeze([...DATA_SOURCE_FORMS, ...OPERATOR_FORMS, ...HOSTING_FORMS].map((f) => new RegExp(f.re.source, `${f.re.flags.replace("i", "")}i`)));
// KITCHEN-PUBLIC-1 forms, moved here from test/site-build-fleet.test.ts (which imports them; order load-bearing there): rule (k).
export const KITCHEN_FORMS = Object.freeze([[/\bsub-?agents?\b/i, "sub-agent", "three sub-agents"], [/\borchestrat(?:or|ors|ion|ed|ing)\b/i, "orchestrator", "the orchestrator ruling"],
  [/\bworkers?\b/i, "worker", "a worker lot"], [/\bcheckpoint(?:s|-\d+)?\b/i, "checkpoint", "checkpoint-2"], [/\bG[0-7]\b/, "gate G0..G7", "gate G7"],
  [/\b[Ll]ots? [A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+/, "lot <NAME>", "lot SITE-LEGAL-1"], [/\bd[e\u00e9]cisions?\s+(?:n\u00b0\s*|#)?\d+/i, "decision <n>", "decision #69"],
  [/\bADR-[A-Z0-9]/, "ADR identifier", "ADR-M004 D15"], [/vibe-?cod/i, "vibecoding", "vibecoded"], [/\bG2 review\b/i, "G2 review", "the G2 review"]].map(([re, why, sample]) => ({ re, why, sample })));

/** isSemverTag(tag) -> boolean: true iff `tag` is a v0.MINOR.PATCH tag (0.x only; MAJOR>=1 is a human decision,
 *  ADR-M010 section 2.3). Rejects v1.0.0, v0.1, 0.1.0, v0.1.0-rc and any trailing space/junk. Moved here from
 *  release-public.mjs, which re-exports it (kindForPath needs it and this module never imports the CLI). Pure. */
export function isSemverTag(tag) {
  return typeof tag === "string" && /^v0\.\d+\.\d+$/.test(tag);
}

// ---- (a) the storefront bar. checkReleaseText moved here from release-public.mjs (which re-exports it); the bell scope is
// the ADR-PUBLIC-CADENCE-1 addition to the site and skills scopes of ADR-M010 section 4 m-4.
const STOREFRONT_SCOPES = Object.freeze(["site", "skills", "bell"]);

/** checkReleaseText(text) -> {ok, hits}: the language gate (French detection, lang-exempt maskers) AND the vocab gate at
 *  the STOREFRONT bar over an in-memory string: GLOBAL bans plus the site, skills and bell scoped bans, each scoped scan
 *  with the UNION of those scopes' closed exemptPhrases masked first, so an honest negation exempt on one storefront surface
 *  is not reddened by another. Fail-closed: empty/whitespace text, or a storefront scope with no ban list (m-4 F3: never a
 *  silent GLOBAL-only fallback on public text), refuses. Reads only scripts/lang-exempt.json and vocab-banned.json. */
export function checkReleaseText(text) {
  if (typeof text !== "string" || text.trim() === "") return { ok: false, hits: [] };
  const { maskers } = loadExempt(SRC);
  const cfg = JSON.parse(readFileSync(join(SRC, "vocab-banned.json"), "utf8"));
  const scopes = STOREFRONT_SCOPES.map((s) => cfg.scan?.[s] ?? {});
  if (scopes.some((s) => !Array.isArray(s.banned) || s.banned.length === 0)) {
    return { ok: false, hits: [{ why: `storefront gate config incomplete: a scan.<scope>.banned of ${STOREFRONT_SCOPES.join("/")} is missing or empty (fail-closed)` }] };
  }
  const exemptPhrases = scopes.flatMap((s) => s.exemptPhrases ?? []);
  const hits = [
    ...scanLang(text, maskers),
    ...scanVocab(text, compilePatterns(cfg.banned)), // GLOBAL bans (no exemptPhrases in the config)
    ...scopes.flatMap((s) => scanVocab(text, compilePatterns(s.banned), exemptPhrases)),
  ];
  return { ok: hits.length === 0, hits };
}

// ---- (b)-(h), (q3). The lookbehind keeps the CVE exception from being bypassed by a match starting inside "CVE".
const ITEM_ID = /(?<![A-Z])(?!CVE-\d{4}-\d)[A-Z]+-[A-Z0-9-]+-\d/;
// The ADR, decision and G0-G7 forms of Q-5 are KITCHEN_FORMS entries (rule k, one source); the last six are Q-A1-3 (G2: 0 false
// positive measured on the mirror's messages and notes; no generic [A-Z]digit-[A-Z] form: "L1-L" of a public README).
const INTERNAL_FORMS = Object.freeze([/\bR-\d+\b/, /\bCA-\d+\b/, /\bcheckpoint[-\s]?\d\b/i, /\b(?:PR|[A-Z])-\d+[a-z]?(?:-\d+[a-z]?)+\b/, /\bPR-\d+[a-z]?\b/,
  /\bmonark-governance\b/i, /\bPR-[A-Z]\d/, /\bQ-(?:P-)?\d+\b/, /\bM\d-[a-z]\b/, /\bD\d+\.\d+\b/, /\bA-\d+\b/, /\bCP\d\b/]);
const PRIVATE_FORMS = Object.freeze([/(?<![\w.+-])(?!noreply@|[\w.+-]+@users\.noreply\.github\.com(?![\w-]|\.[\w-]))[\w.+-]+@[\w-]+\.[\w.]+/, /\b\d{1,3}(?:\.\d{1,3}){3}\b/]);
const PUBLIC_SYNC = /\bpublic\s+sync\b/i;
const URL_ANY = /[a-z][a-z0-9+.-]*:\/\/[^\s)>`"]+/gi;
const URL_ALLOW = /^https:\/\/(?:[a-z0-9-]+\.)*monarkgate\.tech(?:[/?#]|$)|^https:\/\/github\.com\/KraidleAI\/Monark(?:[/?#]|$)|^https:\/\/github\.com\/KraidleAI\/monark-kata-spec(?:[/?#]|$)/i;
// An allowed URL carries one "://" only (no URL nested in its query), and its resolved form ("..", "%2e%2e") is allowed too.
const urlAllowed = (url) => { if (url.indexOf("://") !== url.lastIndexOf("://")) return false; let href; try { href = new URL(url).href; } catch { return false; }
  return URL_ALLOW.test(url) && URL_ALLOW.test(href); };
// KEY_SHAPES carries a bare "://" rule for served strings; free text may carry an allowlisted URL, checked apart (URL_ALLOW).
export const SECRET_SHAPES = Object.freeze(KEY_SHAPES.filter((re) => re.source !== ":\\/\\/"));
const INTERNAL_WORDS = /\b(?:budget|credit|lock)(?:s|ed|ing)?\b/i;
const PLACEHOLDER = /(?<!\$)\{\s*[A-Z][A-Z0-9_-]*\s*\}/g;
const TEMPLATE_REL = "docs/public-notes/TEMPLATE.md"; // the notes template; markers read with PLACEHOLDER's shape, refused empty
export const templateMarkers = (text) => { const names = [...new Set([...text.matchAll(/(?<!\$)\{\s*([A-Z][A-Z0-9_-]*)\s*\}/g)].map((m) => m[1]))];
  if (names.length === 0) throw new Error(`${TEMPLATE_REL} has no marker`);
  return names; };
// TEMPLATE-MARKERS-SOURCE-1: derived from the committed notes template, never typed (a missing template fails the import, by name).
export const TEMPLATE_MARKERS = Object.freeze(templateMarkers(readFileSync(join(SRC, ...TEMPLATE_REL.split("/")), "utf8")));
const MARKER_VARIABLE = new RegExp(`\\$\\{\\s*(?:${TEMPLATE_MARKERS.join("|")})\\s*\\}`, "g"); // ${T0}: still a marker (E-2); a name is [A-Z0-9_-], literal outside a class: no escape (G2 T-2; "\-" breaks under the u flag)
// The year form also catches an ISO date; month names are capitalised whole words, so the verb "may" stays green.
const DATE_FORMS = Object.freeze([/\b(?:19|20)\d\d\b/, /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/,
  /\bQ[1-4]\b/, /\bsoon\b|\bnext\s+(?:week|month|quarter|year)\b/i]);

/** The closed list of kinds (C-V-9). PR-A2 adds the tag message and the Release title, PR-B the monark-record README. */
export const PUBLIC_TEXT_KINDS = Object.freeze(["message", "notes", "issue"]);
export const TITLE_MAX_CODE_POINTS = 50;

/** First match of each form on each line, as {rule, line, word}; `mask` reports a prefix and a length only (FM-2.4 kept). */
function formHits(lines, rule, forms, out, mask = false) {
  lines.forEach((l, i) => {
    for (const re of forms) {
      const m = re.exec(l);
      if (m) out.push({ rule, line: i + 1, word: mask ? `${m[0].slice(0, 4)}... (${String(m[0].length)} chars)` : m[0] });
    }
  });
}

/** checkPublicText(text, kind) -> {ok, violations}: see the header. Pure; fail-closed; ok iff no violation. */
export function checkPublicText(text, kind) {
  const v = [];
  if (!PUBLIC_TEXT_KINDS.includes(kind)) v.push({ rule: "kind", line: 0, word: String(kind) });
  if (typeof text !== "string" || text.trim() === "") return { ok: false, violations: [...v, { rule: "empty", line: 0, word: "" }] };
  const raw = text.split(/\r?\n/); // (cf) and the title bound read the bytes that get committed
  formHits(raw, "cf", [/\p{Cf}/u], v);
  const lines = text.normalize("NFKC").split(/\r?\n/);
  for (const h of checkReleaseText(lines.join("\n")).hits) v.push({ rule: "a", line: h.line ?? 0, word: h.word ?? h.why });
  formHits(lines, "b", [ITEM_ID], v);
  formHits(lines, "c", INTERNAL_FORMS, v);
  formHits(lines, "d", [PUBLIC_SYNC], v);
  formHits(lines, "e", [WINDOWS_ABS_PATH_RE], v);
  formHits(lines, "f", VENDOR_RES, v);
  formHits(lines, "g", SECRET_SHAPES, v, true);
  formHits(lines, "k", KITCHEN_FORMS.map((f) => f.re), v);
  formHits(lines, "p", PRIVATE_FORMS, v);
  lines.forEach((l, i) => {
    for (const m of l.matchAll(URL_ANY)) {
      const url = m[0].replace(/[.,;:!?]+$/, ""); // sentence punctuation after a URL is not part of it
      if (!urlAllowed(url)) v.push({ rule: "g", line: i + 1, word: url });
    }
  });
  formHits(lines, "q3", [INTERNAL_WORDS], v);
  lines.forEach((l, i) => { for (const re of [PLACEHOLDER, MARKER_VARIABLE]) for (const m of l.matchAll(re)) v.push({ rule: "ph", line: i + 1, word: m[0] }); });
  if (kind === "issue") formHits(lines, "h", DATE_FORMS, v);
  if (kind === "message") {
    const title = raw[0] ?? "";
    const long = [...title].length > TITLE_MAX_CODE_POINTS; // code points, not UTF-16 units or bytes (Q-P-4)
    if (title.trim() === "" || long || (raw.length > 1 && raw[1] !== "")) v.push({ rule: "title", line: 1, word: title });
  }
  return { ok: v.length === 0, violations: v };
}

/** kindForPath(rel) -> kind | null (C-V-9, CA-1.6), in this order: docs/public-notes/<tag>.commit.md => "message",
 *  docs/public-notes/<tag>.md => "notes" (<tag> as isSemverTag reads it), docs/public-notes/issues/<name>.md => "issue";
 *  any other path => null, which the root test refuses (unknown kind, fail-closed) until a dated line gives it a kind. */
export function kindForPath(rel) {
  const m = /^docs\/public-notes\/(.+)$/.exec(String(rel).replace(/\\/g, "/"));
  if (!m) return null;
  const commit = /^([^/]+)\.commit\.md$/.exec(m[1]);
  if (commit) return isSemverTag(commit[1]) ? "message" : null;
  const notes = /^([^/]+)\.md$/.exec(m[1]);
  if (notes && isSemverTag(notes[1])) return "notes";
  return /^issues\/[^/]+\.md$/.test(m[1]) ? "issue" : null;
}
