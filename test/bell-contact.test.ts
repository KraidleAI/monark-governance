/**
 * Root tests for the Bell contact link (lot SITE-LEGAL-1; decision 78 amended by decision 94; coordinator message of
 * 2026-09-23: the box bell@monarkgate.tech exists). Non-LLM oracles, run by `npm test`:
 *   (1) bell_contact_mailto_pinned — the address, the label, the subject, the body and the encoding of the ONE contact
 *       link. The expected link is the validated template's own ready-to-use link (MAILTO-TEMPLATE-draft.md section 5,
 *       sha256 1ef97d7fc010cd6b36b033ffd7fa4136f7f922394b8649500af89c60fc67070a, generated there with Python
 *       urllib.parse.quote(text, safe='')), copied byte for byte below, with exactly two declared substitutions: the
 *       country line removed (decision 94) and the draft privacy URL replaced by the served /bell/privacy route.
 *       Decision 78's single named check (the link points to an address on the monarkgate.tech domain) holds.
 *   (2) site_builds_one_mailto — the only `mailto:` string under apps/site is the one built in lib/bell-contact.ts:
 *       .ts/.tsx files are parsed (comments ignored; string, template and JSX text counted), every other text file
 *       under apps/site (public/, .mdx, .md, .json, .css, .html, .svg, .txt) carries none.
 * Named mutants (measured in the lot report): another address in lib/bell-contact.ts => (1) reds; the country line
 * restored => (1) reds; a second `mailto:` link in any apps/site page => (2) reds.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import ts from "typescript";
import {
  CONTACT_ADDRESS,
  CONTACT_LABEL,
  MAIL_SUBJECT,
  PRIVACY_NOTICE_URL,
  mailBody,
  mailtoHref,
  rfc3986,
} from "../apps/site/lib/bell-contact.ts";
import { PRIVACY_ROUTE } from "../apps/site/lib/bell-legal.ts";

const ROOT = join(import.meta.dirname, "..");

// MAILTO-TEMPLATE-draft.md section 5, verbatim (the one illustrative address already on record, bell@monarkgate.tech).
const TEMPLATE_LINK =
  "mailto:bell@monarkgate.tech?subject=Request%20a%20symbol%20%2F%20early%20access%20-%20MONARK%20Bell&body=Profile%20%28choose%20one%29%3A%20Curator%20%2F%20DAO%20%2F%20Lender%20--%20TSV%20issuer%20--%20Market%20maker%20%2F%20venue%20--%20Reconciliation%20infrastructure%20--%20Researcher%20%2F%20press%20--%20Regulator%0D%0A%0D%0AOrganization%20%2B%20professional%20e-mail%20address%3A%0D%0A%0D%0ASymbol%20x%20platform%20x%20regime%20x%20horizon%20requested%3A%0D%0A%0D%0AIntended%20use%20%28internal%20%2F%20publication-citation%20%2F%20redistribution%29%3A%0D%0A%0D%0AConsumption%20mode%20%28files%20%2F%20MCP%20%2F%20signed%20export%29%3A%0D%0A%0D%0ACountry%3A%0D%0A%0D%0A----%0D%0AWe%20process%20the%20information%20above%20to%20answer%20this%20request%20and%20to%20prioritize%20symbol%0D%0Acoverage%2C%20under%20legitimate%20interest.%20See%20the%20Privacy%20Notice%20at%0D%0Ahttps%3A%2F%2Fbell.monarkgate.tech%2Flegal%2Fprivacy-notice%20for%20details%2C%20including%20how%20to%20object.%0D%0ANo%20account%20or%20payment%20is%20required%20to%20send%20this%20request.";
// The two declared substitutions (and nothing else).
const COUNTRY_SEGMENT = "Country%3A%0D%0A%0D%0A";
const DRAFT_PRIVACY_URL = "https%3A%2F%2Fbell.monarkgate.tech%2Flegal%2Fprivacy-notice";

test("bell_contact_mailto_pinned — address, subject, body and encoding of the one Bell contact link", () => {
  assert.equal(CONTACT_ADDRESS, "bell@monarkgate.tech", "the Bell contact box created by the investor");
  assert.match(CONTACT_ADDRESS, /^[a-z]+@monarkgate\.tech$/, "decision 78: the link points to an address on the monarkgate.tech domain");
  assert.equal(PRIVACY_NOTICE_URL, `https://monarkgate.tech${PRIVACY_ROUTE}`, "the privacy line points to the served Privacy Notice route");
  assert.equal(CONTACT_LABEL, "request a symbol / early access", "decision 78 vocabulary");

  // Each substitution applies exactly once to the validated link.
  assert.equal(TEMPLATE_LINK.split(COUNTRY_SEGMENT).length - 1, 1, "the template carries the country line exactly once");
  assert.equal(TEMPLATE_LINK.split(DRAFT_PRIVACY_URL).length - 1, 1, "the template carries the draft privacy URL exactly once");
  const expected = TEMPLATE_LINK.replace(COUNTRY_SEGMENT, "").replace(DRAFT_PRIVACY_URL, rfc3986(PRIVACY_NOTICE_URL));
  assert.equal(mailtoHref(), expected, "the link = the validated template link, country removed, served privacy URL");

  // Decoded view of the same link: subject and body, no country field, CRLF line breaks.
  const href = mailtoHref();
  const query = href.slice(href.indexOf("?") + 1);
  const params = new Map(query.split("&").map((kv) => [kv.slice(0, kv.indexOf("=")), decodeURIComponent(kv.slice(kv.indexOf("=") + 1))]));
  assert.deepEqual([...params.keys()], ["subject", "body"]);
  assert.equal(params.get("subject"), MAIL_SUBJECT);
  assert.equal(params.get("body"), mailBody());
  assert.ok(!/country/i.test(mailBody()), "no country field (decision 94)");
  assert.ok(mailBody().includes("\r\n") && !/[^\r]\n/.test(mailBody()), "CRLF line breaks only (RFC 6068 section 5)");

  // The encoder is RFC 3986 with no safe character (= Python quote(text, safe='')), not bare encodeURIComponent.
  assert.equal(rfc3986("a (b): c's *d*!"), "a%20%28b%29%3A%20c%27s%20%2Ad%2A%21");
});

// ---- (2) one mailto on the site ----------------------------------------------------------------------------------
const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo"]);
const BINARY = new Set([".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".woff", ".woff2", ".ttf", ".otf", ".ots"]);

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(abs, out);
    } else out.push(abs);
  }
}

/** Number of `mailto:` occurrences in the string-bearing nodes of a TS/TSX source (comments are not nodes). */
function mailtoInCode(source: string, tsx: boolean): number {
  const sf = ts.createSourceFile(tsx ? "x.tsx" : "x.ts", source, ts.ScriptTarget.Latest, true, tsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  let n = 0;
  const count = (s: string): void => {
    n += s.toLowerCase().split("mailto:").length - 1;
  };
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) count(node.text);
    else if (ts.isTemplateExpression(node)) {
      count(node.head.text);
      for (const span of node.templateSpans) count(span.literal.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return n;
}

test("site_builds_one_mailto — the only mailto: under apps/site is the one lib/bell-contact.ts builds", () => {
  // Detector controls: a JSX link and a string count; a comment does not.
  assert.equal(mailtoInCode('export const A = () => <a href="mailto:x@y.z">x</a>;', true), 1);
  assert.equal(mailtoInCode("const h = `mailto:${a}?subject=${b}`;", false), 1);
  assert.equal(mailtoInCode("// a `mailto:` link, described in a comment\nconst x = 1;", false), 0);

  const files: string[] = [];
  walk(join(ROOT, "apps", "site"), files);
  assert.ok(files.length >= 50, `implausibly few apps/site files (${files.length}) — false green?`);
  const hits: string[] = [];
  for (const abs of files) {
    const ext = extname(abs).toLowerCase();
    if (BINARY.has(ext)) continue;
    const rel = abs.slice(ROOT.length + 1).replace(/\\/g, "/");
    const text = readFileSync(abs, "utf8");
    const n = ext === ".ts" || ext === ".tsx" ? mailtoInCode(text, ext === ".tsx") : text.toLowerCase().split("mailto:").length - 1;
    for (let i = 0; i < n; i++) hits.push(rel);
  }
  assert.deepEqual(hits, ["apps/site/lib/bell-contact.ts"], `mailto: outside the one builder: ${JSON.stringify(hits)}`);
});
