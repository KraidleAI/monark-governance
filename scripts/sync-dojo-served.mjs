// scripts/sync-dojo-served.mjs -- write apps/site/data/dojo-served.json from the files the Dojo host SERVES, bound to the committed
// deploy check (ADR-DOJO-PR-4 D-2 PR-4a-2 and D-3 TU-7; mere D-11). SOURCE-REPO tool, not exported (motif sync-bell-served.mjs), run
// by the orchestrator after the deploy check of the same bodies is committed, with the G7 of the deployed tree:
//   node scripts/sync-dojo-served.mjs --g7 <the 40-hex sha of the deployed tree>
// It reads, and nothing else: GETs on the Dojo host (https only, a redirect refused, 200 only, each body within the reader's bound)
// of timeline.jsonl, dojo/pubkey.json, then every lines file and the history file the timeline names; the committed keyring
// apps/dojo/keys/dojo-keyring.json (the trust root); the committed deploy check docs/deploy-CA-dojo.json (DOJO-CA-FORMAT-1,
// ADR-DOJO-PR-3 D-2); the site manifest. The projection is buildDojoServed() (apps/site/lib/dojo-served-load.ts), which runs the
// reader's tool on the very bytes it projects: no figure the tool refuses is composed (P-10). The record is then bound to the deploy
// check: its twelve controls green, TLS authorized, its head, history and served bodies those of the record, its G7 the act's (a
// stale or incomplete check is refused); no operator label of the reading, no vendor name and no site-banned word rides in it.
// FAIL-CLOSED: every check holds before either write, else nothing is written and it exits 1. Output: LF, two-space JSON, its
// CRLF->LF sha256 set as its entry of the site manifest, whose $comment names the file once (setManifestEntry). The pure parts
// and runSync and httpsGet (I/O and fetch injected) are exported for test/dojo-served.test.ts, which runs them without the network.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildDojoServed, dojoHistoryPathOf, dojoLinesPathOf, jsonDepth, DOJO_HOST, DOJO_PUBKEY_PATH, DOJO_SERVED_REL,
  DOJO_SERVED_MAX_DEPTH, DOJO_TIMELINE_PATH } from "../apps/site/lib/dojo-served-load.ts";
import { dojoTrustOf, verifyDojoServed, VERIFY_BOUNDS } from "../apps/dojo/scripts/dojo-verify.mjs";
import { walkDojoTimeline } from "../apps/dojo/scripts/dojo-chain.mjs";
import { rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { lineHash } from "../apps/bell/scripts/bell-chain.mjs";
import { CHAIN_OPERATORS } from "../apps/dojo/src/dojo-methods.ts";
import { DATA_SOURCE_FORMS, OPERATOR_FORMS } from "./public-text-deny.mjs";
import { compilePatterns } from "./grep-forbidden.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_REL = DOJO_SERVED_REL;
export const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
export const KEYRING_REL = "apps/dojo/keys/dojo-keyring.json";
export const CA_REL = "docs/deploy-CA-dojo.json";
// DOJO-CA-FORMAT-1 (ADR-DOJO-PR-3 D-2 l.84, frozen): closed keys, the twelve controls in order. The names inside bodies_sha256 are not
// frozen: read as the Bell check writes them, the URL path of each served body (docs/deploy-CA-bell.json; Q-G1-1 of the G1 journal).
export const CA_SCHEMA = "dojo-deploy-ca-v1";
export const CA_KEYS = Object.freeze(["schema", "url", "g7", "checks", "tls", "head", "history", "bodies_sha256", "inputs_sha256"]);
export const CA_CHECKS = Object.freeze(["c01_timeline_jsonl", "c02_pubkey_equals_committed_keyring", "c03_dojo_verify_keyring_root",
  "c04_acao_star", "c05_no_directory_listing", "c06_cache_immutable_lines_history_no_cache_timeline", "c07_tls_authorized",
  "c08_no_private_material_served", "c09_loaded_config_equals_g7", "c10_bell_and_probe_untouched", "c11_head_and_history_recomputed",
  "c12_immutables_hash_to_their_names"]);
export const CA_BODY_PATHS = Object.freeze({ timeline: `/${DOJO_TIMELINE_PATH}`, pubkey: `/${DOJO_PUBKEY_PATH}` });
const CA_HEAD = ["seq", "day", "lines_sha256", "lines_count", "recomputed_root"], CA_HISTORY = ["history_sha256", "history_lines_count", "history_root"];
/** The clause the manifest's $comment carries once for the record, before MANIFEST_ANCHOR (mere D-11: the sync writes the entry and it). */
export const MANIFEST_CLAUSE = "apps/site/data/dojo-served.json (the facts of the latest signed snapshot of the served Dojo host, bound to "
  + "the committed deploy check of the same bodies) by apps/site/lib/dojo-served-load.ts, for /dojo and its link on /token. ";
export const MANIFEST_ANCHOR = "The served-data files are written by";
// The labels no record carries (mere l.280, M-P6): the operators the Dojo reads through (their labels, as whole words), the vendor
// forms the site applies to its JSON files, and the site's word gate, which reads .ts, .tsx and .mdx only (vocab-banned.json "site").
const word = (label) => new RegExp(`\\b${label.split(/[^a-z0-9]+/i).join("[\\s._-]*")}\\b`, "i");
const siteScope = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")).scan.site.banned;
export const LABEL_FORMS = Object.freeze([...CHAIN_OPERATORS.map(word), ...[...OPERATOR_FORMS, ...DATA_SOURCE_FORMS].map((f) => f.re),
  ...compilePatterns(siteScope).map((p) => p.re)]);
const DEPS = { trustOf: dojoTrustOf, walk: walkDojoTimeline, lineHash, rootOf, verify: verifyDojoServed };
const HEX64 = /^[0-9a-f]{64}$/, HEX40 = /^[0-9a-f]{40}$/;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const keysAre = (v, keys) => isObj(v) && Object.keys(v).sort().join(",") === [...keys].sort().join(",");
const same = (a, b, keys) => keys.every((k) => a[k] === b[k]);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const fail = (why) => { throw new Error(`dojo sync: ${why} (fail-closed)`); };

/** Binds the committed deploy check to a record (M-P7, M-P9): the closed form of DOJO-CA-FORMAT-1, its twelve controls in order and
 *  green, TLS authorized, the head, the history and the served bodies of the record, and, for the act (g7 not null), its G7. */
export function bindDojoCa(ca, record, g7) {
  if (!keysAre(ca, CA_KEYS) || ca.schema !== CA_SCHEMA || ca.url !== DOJO_HOST || !isObj(ca.inputs_sha256)) fail("not a check of the Dojo host");
  const checks = Array.isArray(ca.checks) ? ca.checks : [];
  if (checks.length !== CA_CHECKS.length || checks.some((c, i) => !keysAre(c, ["name", "pass", "detail"]) || c.name !== CA_CHECKS[i])) {
    fail("the deploy check does not carry the twelve controls of DOJO-CA-FORMAT-1 in order");
  }
  if (!checks.every((c) => c.pass === true) || !keysAre(ca.tls, ["authorized"]) || ca.tls.authorized !== true) fail("the deploy check is not green");
  if (!HEX40.test(String(ca.g7)) || (g7 !== null && ca.g7 !== g7)) fail("the deploy check was captured for another G7: re-run it on the deployed tree");
  const h = record.head, hi = record.history, b = isObj(ca.bodies_sha256) ? ca.bodies_sha256 : {};
  if (!keysAre(ca.head, CA_HEAD) || !same(ca.head, h, ["seq", "day", "lines_sha256", "lines_count"])) fail("the deploy check was captured on another head");
  if (ca.head.recomputed_root !== h.root) fail("the deploy check does not carry the recomputed root of the head");
  if (!keysAre(ca.history, CA_HISTORY) || !same(ca.history, hi, ["history_sha256", "history_lines_count"])) fail("the check carries no history, or another");
  if (ca.history.history_root !== hi.history_root) fail("the deploy check does not carry the recomputed root of the history");
  if (b[CA_BODY_PATHS.timeline] !== record.bodies_sha256.timeline || b[CA_BODY_PATHS.pubkey] !== record.bodies_sha256.pubkey) {
    fail("the deploy check was captured on other served bodies: re-run it, then this sync");
  }
}

/** The label forms found in any string of `value`, object keys included; empty when no label rides to the site. */
export function operatorLabelsIn(value) {
  const texts = [];
  const walk = (v) => {
    if (typeof v === "string") texts.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (isObj(v)) for (const [k, x] of Object.entries(v)) { texts.push(k); walk(x); }
  };
  walk(value);
  return LABEL_FORMS.filter((re) => texts.some((t) => re.test(t))).map((re) => String(re));
}

/** The site manifest with the record's entry set (appended when absent) and its $comment naming the record once (MANIFEST_CLAUSE
 *  before MANIFEST_ANCHOR), every other byte kept; the text must be in its canonical two-space form (motif sync-ukemi-served.mjs). */
export function setManifestEntry(text, sha) {
  const m = JSON.parse(text), c = m.$comment;
  if (`${JSON.stringify(m, null, 2)}\n` !== text.replace(/\r\n/g, "\n") || m.algorithm !== "sha256" || !isObj(m.files) || typeof c !== "string") {
    fail("the site manifest is not in its canonical sha256 form");
  }
  const n = c.split(MANIFEST_CLAUSE).length - 1;
  if (!HEX64.test(sha) || n > 1 || (n === 0 && c.split(MANIFEST_ANCHOR).length !== 2)) fail("the sha256 or the manifest's $comment is malformed");
  if (n === 0) m.$comment = c.replace(MANIFEST_ANCHOR, () => `${MANIFEST_CLAUSE}${MANIFEST_ANCHOR}`);
  m.files = { ...m.files, [OUT_REL]: sha };
  return `${JSON.stringify(m, null, 2)}\n`;
}

/** The committed leg of dojo_served_data_matches_deploy_ca (ADR-DOJO-PR-4 D-3), never a skip: a record is bound to the committed
 *  deploy check; no record is a coherent absence only with no file, no manifest entry and the register upcoming (M-P20). */
export function committedRefusals({ record, present, listed, status, ca }) {
  if (record !== null) {
    if (ca === null) return ["a committed record without its committed deploy check"];
    try { bindDojoCa(ca, record, null); } catch (e) { return [e instanceof Error ? e.message : String(e)]; }
    return [];
  }
  const out = [];
  if (present) out.push(`${OUT_REL} is present while no record loads`);
  if (listed) out.push(`${OUT_REL} is listed in the site manifest while no record loads`);
  if (status !== "upcoming") out.push("the register is not upcoming while no record is committed");
  return out;
}

/** The lines and history files the timeline names (a malformed name fails); a line past the depth bound is measured, never parsed: none. */
function immutablesOf(timeline) {
  const rels = new Set(), parsed = (s) => (jsonDepth(s) > DOJO_SERVED_MAX_DEPTH ? null : JSON.parse(s)); // the build refuses it by name
  for (const s of new TextDecoder().decode(timeline).split("\n").filter((x) => x !== "")) {
    const l = parsed(s), sha = !isObj(l) ? null : l.kind === "snapshot" ? l.lines_sha256 : l.kind === "history" ? l.history_sha256 : null;
    if (sha === null) continue;
    if (!HEX64.test(String(sha))) fail("the timeline names a file by a malformed sha256");
    rels.add(l.kind === "snapshot" ? dojoLinesPathOf(sha) : dojoHistoryPathOf(sha));
  }
  return [...rels];
}

/** One sync under `root`: the served bodies through `get`, every check before either write (the record, then the manifest). */
export async function runSync({ root, g7, get, readAt }) {
  if (!HEX40.test(String(g7))) fail("--g7 <the 40-hex sha of the deployed tree> is required");
  const read = (rel) => readFileSync(join(root, ...rel.split("/")));
  const committedKeyring = read(KEYRING_REL), ca = JSON.parse(read(CA_REL).toString("utf8")), manifestText = read(MANIFEST_REL).toString("utf8");
  const tree = new Map([[DOJO_TIMELINE_PATH, await get(DOJO_TIMELINE_PATH)], [DOJO_PUBKEY_PATH, await get(DOJO_PUBKEY_PATH)]]);
  for (const rel of immutablesOf(tree.get(DOJO_TIMELINE_PATH))) tree.set(rel, await get(rel));
  const record = await buildDojoServed({ readAt, tree, committedKeyring }, DEPS);
  bindDojoCa(ca, record, g7);
  const labels = operatorLabelsIn(record);
  if (labels.length > 0) fail(`the record would carry an operator or vendor label (${labels.join(", ")}); nothing is written`);
  const text = `${JSON.stringify(record, null, 2)}\n`, sha = sha256(Buffer.from(text.replace(/\r\n/g, "\n"), "utf8"));
  const manifest = setManifestEntry(manifestText, sha); // checked before either write
  writeFileSync(join(root, ...OUT_REL.split("/")), text);
  writeFileSync(join(root, ...MANIFEST_REL.split("/")), manifest);
  return { record, sha };
}

/** GET on the Dojo host: https only (the host constant), a redirect refused, 200 only, the body within the reader's bound, read as a
 *  stream and cut at the bound even without a content-length (leaving the loop cancels the body); `fetchImpl` is the test's seam. */
export async function httpsGet(rel, fetchImpl = fetch) {
  const res = await fetchImpl(`${DOJO_HOST}/${rel}`, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) fail(`GET ${rel} answered ${String(res.status)} (200 only, no redirect followed)`);
  if (Number(res.headers.get("content-length") ?? 0) > VERIFY_BOUNDS.MAX_BODY_BYTES) fail(`GET ${rel}: the body exceeds the reader's bound`);
  const chunks = [];
  let n = 0;
  for await (const c of res.body ?? []) {
    if ((n += c.byteLength) > VERIFY_BOUNDS.MAX_BODY_BYTES) fail(`GET ${rel}: the body exceeds the reader's bound`);
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

async function main(argv) {
  if (argv.length !== 2 || argv[0] !== "--g7") fail("usage: node scripts/sync-dojo-served.mjs --g7 <the 40-hex sha of the deployed tree>");
  const { record, sha } = await runSync({ root: ROOT, g7: argv[1], get: httpsGet, readAt: new Date().toISOString() });
  console.log(`sync-dojo-served OK: ${OUT_REL} written (head seq ${String(record.head.seq)}); its ${MANIFEST_REL} entry set to ${sha}`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await main(process.argv.slice(2)); } catch (e) {
    console.error(`sync-dojo-served: FAIL-CLOSED: ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 1;
  }
}
