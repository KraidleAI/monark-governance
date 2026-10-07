// scripts/address-literals.mjs -- the address-literal gate of the tracked tree (founder decision of 2026-10-07: the host addresses
// leave the current tree, a CI check refuses any IP literal, history is not rewritten; docs/G0-lot-host-address-gate.md). Node 24,
// zero dependencies. Its root test is test/no-host-address.test.ts (CI job g3-verification).
//
// A literal is an IPv4 dotted quad (net.isIPv4) or an IPv6 address (net.isIPv6), bounded as a word, in a path that `git ls-files`
// lists (line 0) or in its file when that holds no NUL byte, whatever its extension. It passes only when EXEMPT holds it (a closed
// set of ranges that name no host: loopback, unspecified, documentation; a BlockList also matches their IPv4-mapped and long
// spellings) or when LISTED names it for its file, with its reason (a number or a code form shaped like an address, or a boundary
// input of an address test). This file may carry the literals of LISTED and nothing else. Any other literal is a hit: its path,
// line, column and a mask with no digit (a literal in a path is masked there too).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { BlockList, isIPv4, isIPv6 } from "node:net";
import { join } from "node:path";

export const SELF = "scripts/address-literals.mjs";
export const EXEMPT = new BlockList();
EXEMPT.addSubnet("127.0.0.0", 8, "ipv4"); // loopback
EXEMPT.addAddress("0.0.0.0", "ipv4"); // unspecified
EXEMPT.addAddress("::1", "ipv6"); // loopback
EXEMPT.addAddress("::", "ipv6"); // unspecified, also the "::" of a text separator or of a regular expression
EXEMPT.addSubnet("192.0.2.0", 24, "ipv4"); // documentation (RFC 5737)
EXEMPT.addSubnet("198.51.100.0", 24, "ipv4"); // documentation (RFC 5737)
EXEMPT.addSubnet("203.0.113.0", 24, "ipv4"); // documentation (RFC 5737)
EXEMPT.addSubnet("2001:db8::", 32, "ipv6"); // documentation (RFC 3849)

const RFC9162 = "a section number of RFC 9162 (verifying an inclusion proof)";
const WHATWG = "a section number of the WHATWG HTML standard (tokenizer states, tree construction)";
const ECMA = "a section number of ECMA-262 (the template value of a line terminator)";
const CABF = "a section number of the CA/Browser Forum Baseline Requirements (domain validation)";
const V8 = "the V8 version of a Node build";
const CLAUSE = "a clause number of a cover wording";
const PCT = "the tail of a loopback address whose first octet is percent-encoded";
const ADD_MASK = "the GitHub Actions workflow command add-mask, quoted with its colons";
const SLICE = "a Python slice step (argv); the recalculation tool is pinned, never edited here";
const EDGE = "a boundary input of the loopback test: the top of 0/8, or just outside a range it pins";
const all = (reason, ...literals) => Object.freeze(Object.fromEntries(literals.map((l) => [l, reason])));
/** Literals that are not host addresses, each admitted only in the file named (closed; an entry no longer found is stale). */
export const LISTED = Object.freeze({
  "docs/CHECKPOINT2-lot-dojo-pr1a.md": all(RFC9162, "2.1.3.2"),
  "docs/CHECKPOINT2-lot-public-cadence-1-A1.md": all(WHATWG, "13.2.6.4", "13.2.5.43"),
  "docs/G0-lot-dojo-pr4c2.md": all(RFC9162, "2.1.3.2"),
  "docs/G0-lot-r25-minified-line-1.md": all(ADD_MASK, "::add"),
  "docs/G0-lot-verifiers-list-f5a-1.md": all(V8, "13.6.233.17"),
  "docs/G1-lot-codeql-alerts-1.md": all(WHATWG, "13.2.5.2", "13.2.5.3", "13.2.5.5", "13.2.5.11", "13.2.5.14", "13.2.5.18", "13.2.5.31",
    "13.2.5.32", "13.2.5.42", "13.2.5.43", "13.2.5.44", "13.2.5.46", "13.2.5.51", "13.2.5.52"),
  "docs/G1-lot-dojo-pr1a.md": all(RFC9162, "2.1.3.2"),
  "docs/G1-lot-dojo-pr1b2.md": all(RFC9162, "2.1.3.2"),
  "docs/G2-DELTA-lot-narabi-ops-1b-i.md": all(PCT, "37.0.0.1"),
  "docs/G2-lot-dojo-pr1a.md": all(RFC9162, "2.1.3.2"),
  "docs/G2-lot-garde-fsync-1-3.md": all(ECMA, "12.9.6.2"),
  "docs/G2-lot-garde-fsync-1-4.md": all(ECMA, "12.9.6.2"),
  "docs/PASSATION-2026-09-26.md": all(RFC9162, "2.1.3.2"),
  "docs/PLI-lot-bell-shortpage-1b.md": all(V8, "13.6.233.17"),
  "docs/PLI-lot-garde-fsync-1-4.md": all(ECMA, "12.9.6.2"),
  "docs/PLI-lot-garde-fsync-1-5.md": all(ECMA, "12.9.6.2"),
  "docs/adr/ADR-DOJO-PR-4.md": all(RFC9162, "2.1.3.2"),
  "docs/adr/ADR-PUBLIC-CADENCE-1.md": all(WHATWG, "13.2.6.4"),
  "docs/biblio/ukemi-modeL/L-lecture-nexus-11-wordings-2026-09-19.md": all(CLAUSE, "1.1.1.1", "1.1.1.2"),
  "docs/biblio/ukemi-modeL/L-lecture-nexus-leveraged-liquidation-cover.md": all(CLAUSE, "1.1.1.1", "1.1.1.2"),
  "docs/dojo/FAITS-pr1a-lectures-2026-09-26.md": all(RFC9162, "2.1.3.2"),
  "docs/dojo/FAITS-reserved-names-certs-2026-09-27.md": all(CABF, "3.2.2.4"),
  "packages/rpc-guard/test/durable.test.ts": all(ECMA, "12.9.6.2"),
  "scripts/assert-fleet-html.mjs": all(WHATWG, "13.2.5.2", "13.2.5.3", "13.2.5.5", "13.2.5.14", "13.2.5.17", "13.2.5.18", "13.2.5.31",
    "13.2.5.43", "13.2.5.44", "13.2.5.46", "13.2.5.49", "13.2.5.51", "13.2.5.52"),
  "test/retire-instants.test.ts": all(EDGE, "0.255.255.255", "126.255.255.255", "128.0.0.1", "1.0.0.0", "::2", "::ffff:128.0.0.1"),
  "test/site-build-fleet.test.ts": all(WHATWG, "13.2.5.43", "13.2.5.52"),
  "tools/kata-recalc/report.py": all(SLICE, "0::2", "1::2"),
});

const WORD = /\w/;
const V4 = /(?<![\w.])\d{1,3}(?:\.\d{1,3}){3}(?!\w|\.\d)/g;
const RUN = /[\dA-Fa-f:.]+/g; // a maximal run of hex digits, colons and dots: linear, an IPv6 is read inside it
/** The address literals of one line of text, each as [literal, 1-based column, 4 | 6]. */
export function literals(text) {
  const out = [];
  for (const m of text.matchAll(V4)) if (isIPv4(m[0])) out.push([m[0], m.index + 1, 4]);
  for (const m of text.matchAll(RUN)) {
    if (m[0].split(":").length < 3) continue;
    let at = m.index, t = m[0];
    const glued = at > 0 && WORD.test(text[at - 1]), cut = glued || t.startsWith(":") ? /^[^:]*:(?!:)/.exec(t) : null;
    if (glued && cut === null) continue; // a word runs into a "::" (Type::new, ::error::)
    if (WORD.test(text[at + t.length] ?? "")) continue; // a word goes on after it (::before)
    if (cut !== null) { at += cut[0].length; t = t.slice(cut[0].length); } // the label or the word before a single colon
    t = t.replace(/\.+$/, "").replace(/([^:]):$/, "$1"); // a full stop, or a single colon, after it
    if (isIPv6(t)) out.push([t, at + 1, 6]);
  }
  return out;
}

/** The mask of a refused literal: every run of digits becomes x (a CI log of a public repository is public). */
export const mask = (literal) => literal.replace(/[\dA-Fa-f]+/g, "x");
const listedAnywhere = (lit) => Object.values(LISTED).some((e) => Object.hasOwn(e, lit));
const bareEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_")));

/** A path with each literal it carries masked: a hit never prints an address, not even through a file name. */
const hide = (rel) => literals(rel).reduce((s, [lit]) => s.split(lit).join(mask(lit)), rel);
/** Judge the literals of one line of `rel` (line 0: the path itself) into the verdict `v`. */
function judge(v, rel, line, text) {
  for (const [lit, col, kind] of literals(text)) {
    if (EXEMPT.check(lit, kind === 4 ? "ipv4" : "ipv6")) continue;
    if (Object.hasOwn(LISTED, rel) && Object.hasOwn(LISTED[rel], lit)) { v.used.add(`${rel} ${lit}`); continue; }
    if (rel === SELF && listedAnywhere(lit)) continue;
    v.hits.push({ file: hide(rel), line, col, kind, mask: mask(lit) });
  }
}

/** The verdict over the tracked files of `root`: the refused literals (masked), the listed pairs met, the files read. */
export function scan(root, env = bareEnv()) {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root, env, maxBuffer: 1 << 26 }).toString("utf8").split("\0");
  const v = { hits: [], used: new Set(), read: 0 };
  for (const rel of tracked.filter((f) => f !== "")) {
    judge(v, rel, 0, rel);
    let buf;
    try { buf = readFileSync(join(root, rel)); } catch (e) { if (e.code === "ENOENT") continue; throw e; } // deleted in the work tree
    if (buf.includes(0)) continue; // a binary file
    v.read++;
    buf.toString("utf8").split("\n").forEach((text, i) => { judge(v, rel, i + 1, text); });
  }
  return v;
}

/** The pairs of LISTED that the verdict never met: each is stale and must leave the list. */
export const stale = (v) => Object.entries(LISTED).flatMap(([f, e]) => Object.keys(e).filter((l) => !v.used.has(`${f} ${l}`)).map((l) => `${f} ${l}`));

/** One line per hit (path:line:column, family, mask), after a count: never a digit of a literal. */
export const report = (v) => [`address literals: ${String(v.hits.length)} hit(s) in ${String(new Set(v.hits.map((h) => h.file)).size)} file(s)`,
  ...v.hits.map((h) => `${h.file}:${String(h.line)}:${String(h.col)} IPv${String(h.kind)} ${h.mask}`)].join("\n");
