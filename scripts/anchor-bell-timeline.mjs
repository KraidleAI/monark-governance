// scripts/anchor-bell-timeline.mjs — ADR-BELL-OTS-ANCHOR-1 D1, D2, C-5 (tuyau P-1); usage and procedure: docs/RUNBOOK-bell.md step 13 bis.
// SOURCE-REPO tool (not exported), run by the orchestrator on the operator machine; built-ins and repo modules; no git, no ots, no subprocess.
// Build (--seq --timeline --mirror-sha [--immutables --line-hash --compare-url --keyring --out-dir]), from LOCAL input: lines 1..n walk under
// the committed keyring, line n is not voided and its bytes hash to its line_hash (and to --line-hash), lines 1..n with their LF hash to
// --mirror-sha, each file line n names hashes to its name; --compare-url only compares (https, no redirect, 200, bounded). Then the D1
// manifest is written in exclusive creation (a taken name moves to -<k>, k >= 2), read back and printed with its sha256 and the frozen
// stamp command (ruling GO1-F), never run here. Check (--check [--out-dir --timeline]): each register row binds to its manifest and proof
// (read, never checked against a node) and to the timeline copy. Fail-closed: exit 1; nothing is written unless every check held.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, isAbsolute, basename, sep } from "node:path";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { lineHash, trustOf, walkTimeline } from "../apps/bell/scripts/bell-chain.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), ".."), HEX64 = /^[0-9a-f]{64}$/;
/** The client's frozen execution form (docs/CHANTIERS.md, ruling GO1-F): Git Bash, the DLL shim first on PATH, the pinned venv. */
const OTS = 'PATH="/f/MONARK SUITE/ots/dll:/c/Program Files/Git/mingw64/bin:$PATH" "/f/MONARK SUITE/ots/venv/Scripts/ots"';
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const fail = (why) => { console.error(`anchor-bell-timeline: FAIL-CLOSED — ${why}`); process.exit(1); };
const shown = (p) => { const r = relative(process.cwd(), p); return (r.startsWith("..") || isAbsolute(r) ? p : r).split(sep).join("/"); };
const pathOr = (given, dflt) => (given === undefined ? join(ROOT, dflt) : resolve(given));

/** Lines 1..n of a timeline copy: the bytes of line n without its LF, of lines 1..n with their LF, and the parsed lines. */
function prefixOf(buf, n) {
  const ends = [];
  for (let i = buf.indexOf(0x0a); i !== -1 && ends.length < n; i = buf.indexOf(0x0a, i + 1)) ends.push(i);
  if (buf.includes(0x0d) || ends.length < n) fail(`the timeline copy carries a CR byte or fewer than ${n} LF-terminated lines`);
  const prefix = buf.subarray(0, ends[n - 1] + 1), text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(prefix);
  return { prefix, line: buf.subarray(n === 1 ? 0 : ends[n - 2] + 1, ends[n - 1]), parsed: text.slice(0, -1).split("\n").map((l) => JSON.parse(l)) };
}

async function build(o) {
  const n = Number(o.seq);
  if (!/^[1-9]\d{0,8}$/.test(o.seq ?? "") || o.timeline === undefined || !HEX64.test(o["mirror-sha"] ?? "")) fail("--seq <n>, --timeline <step 13 copy> and --mirror-sha <its sha256> are required");
  const { prefix, line, parsed } = prefixOf(readFileSync(resolve(o.timeline)), n), l = parsed[n - 1];
  const trust = trustOf(JSON.parse(readFileSync(pathOr(o.keyring, "apps/bell/keys/bell-keyring.json"), "utf8")));
  const walk = trust === null ? fail("the keyring is malformed") : walkTimeline(parsed, trust);
  if (!walk.ok) fail(`lines 1..${n} do not walk under the keyring (seq ${walk.seq}: ${walk.reason})`);
  if (walk.voided.includes(n)) fail(`line ${n} is voided by a key revocation`);
  if (sha256(line) !== lineHash(l)) fail(`the bytes of line ${n} are not its canonical form (their sha256 is not its line_hash)`);
  if (o["line-hash"] !== undefined && o["line-hash"] !== lineHash(l)) fail(`line ${n} does not hash to --line-hash`);
  if (sha256(prefix) !== o["mirror-sha"]) fail(`lines 1..${n} do not hash to --mirror-sha (the step 13 digest)`);
  const files = new Map(l.kind === "publication" ? [["states", l.state_sha256], ["provenance", l.provenance_sha256]].map(([d, h]) => [`${d}/${h}.json`, h]) : []);
  if (files.size > 0 && o.immutables === undefined) fail("--immutables <dir> is required for a publication line");
  const local = new Map([...files].map(([rel, h]) => {
    const abs = join(resolve(o.immutables ?? "."), rel), bytes = HEX64.test(String(h)) && existsSync(abs) ? readFileSync(abs) : fail(`${rel}, named by line ${n}, is not under --immutables`);
    return sha256(bytes) === h ? [rel, bytes] : fail(`${rel} does not hash to its name`);
  }));
  if (o["compare-url"] !== undefined) {
    const base = URL.canParse(o["compare-url"]) ? new URL(o["compare-url"]) : fail("--compare-url is not a URL");
    if (base.protocol !== "https:") fail("--compare-url must be https");
    const get = async (rel) => {
      const res = await fetch(new URL(rel, base), { redirect: "manual", signal: AbortSignal.timeout(30_000) }), bytes = Buffer.from(await res.arrayBuffer());
      return res.status === 200 && bytes.length > 0 && bytes.length <= 64 * 1024 * 1024 ? bytes : fail(`GET /${rel} answered ${res.status} with ${bytes.length} bytes (200 and a bounded body only, no redirect followed)`);
    };
    if (!(await get("timeline.jsonl")).subarray(0, prefix.length).equals(prefix)) fail(`the served timeline does not start with the local lines 1..${n}`);
    for (const [rel, bytes] of local) if (!(await get(rel)).equals(bytes)) fail(`the served ${rel} differs from the local copy`);
  }
  const entries = [[`timeline.jsonl#L${n}`, sha256(line)], [`timeline.jsonl#L1-L${n}`, sha256(prefix)], ...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const text = entries.map(([p, d]) => `${p} ${d}\n`).join(""), out = pathOr(o["out-dir"], "docs/bell-publications");
  let k = 1;
  const nameOf = () => `timeline-seq${n}${k === 1 ? "" : `-${k}`}-manifest.txt`;
  while (existsSync(join(out, nameOf())) || existsSync(join(out, `${nameOf()}.ots`))) k += 1;
  const file = join(out, nameOf());
  writeFileSync(file, text, { flag: "wx" });
  const back = readFileSync(file), digest = back.equals(Buffer.from(text)) ? sha256(back) : fail(`${shown(file)} does not read back as written`);
  console.log(`anchor-bell-timeline OK — line ${n} (${l.kind}) walks under the keyring; line_hash ${sha256(line)}; prefix_sha256 ${sha256(prefix)}${o["compare-url"] === undefined ? "" : "; the served bytes are the local ones"}`
    + `\nmanifest ${shown(file)} sha256 ${digest} (${back.length} bytes, ${entries.length} lines)\nnext, orchestrator only, from the repository root (this tool never runs it; RUNBOOK-bell 13 bis):`
    + `\n  ${OTS} --cache /f/tmp/ots-cache stamp ${shown(file)}\nregister row once stamped (date_u read after the stamp; commit = the commit that adds the manifest and its proof):`
    + `\n  | <date_u> | ${n} | ${l.kind} | \`${sha256(line)}\` | \`${sha256(prefix)}\` | \`${digest}\` | \`<commit>\` | \`${basename(file)}.ots\` | <note> |`);
}

async function check(o) {
  const lib = await import(pathToFileURL(join(ROOT, "apps", "site", "lib", "bell-anchors.ts")).href);
  const dir = pathOr(o["out-dir"], "docs/bell-publications"), rows = lib.parsePublicationAnchors(readFileSync(join(dir, "ANCHORS.md"), "utf8"));
  const timeline = o.timeline === undefined ? null : readFileSync(resolve(o.timeline));
  for (const r of rows) {
    const copy = timeline === null ? null : prefixOf(timeline, r.seq);
    if (copy !== null && sha256(copy.line) !== r.line_hash) fail(`seq ${r.seq}: line_hash differs from line ${r.seq} of the timeline copy`);
    if (copy !== null && sha256(copy.prefix) !== r.prefix_sha256) fail(`seq ${r.seq}: prefix_sha256 differs from lines 1..${r.seq} of the timeline copy`);
    if (r.proof_file === null) { console.log(`seq ${r.seq} (${r.date_utc}): not timestamped`); continue; }
    const m = readFileSync(join(dir, r.manifest_file)), proof = lib.readOtsProof(new Uint8Array(readFileSync(join(dir, r.proof_file)))), st = lib.anchorStatus(proof);
    lib.bindPublicationAnchor(r, m.toString("utf8"), sha256(m), proof);
    const l = copy?.parsed[r.seq - 1], files = lib.manifestEntries(m.toString("utf8")).map((e) => e.relpath).filter((p) => !p.startsWith("timeline.jsonl#")).join(" ");
    if (l !== undefined && files !== (l.kind === "publication" ? `provenance/${l.provenance_sha256}.json states/${l.state_sha256}.json` : "")) fail(`seq ${r.seq}: the manifest's files are not those line ${r.seq} names`);
    const blocks = st.bitcoinHeights.length > 0 ? `Bitcoin block record(s) at height ${st.bitcoinHeights.join(", ")}` : "pending, no Bitcoin block record yet";
    console.log(`seq ${r.seq} ${r.proof_file}: bound to manifest ${r.manifest_sha256}; ${blocks}; ${st.pendingCalendars.length} calendar(s) pending (read from the file, not checked against a node)`);
  }
  console.log(`anchor-bell-timeline check OK — ${rows.length} row(s) in ${shown(dir)}; cross-check a proof with: ${OTS} --no-cache info <proof> (its "File sha256 hash" is the manifest's)`);
}

async function main() {
  const strings = ["seq", "timeline", "immutables", "mirror-sha", "line-hash", "compare-url", "keyring", "out-dir"];
  try {
    const { values: o } = parseArgs({ options: { ...Object.fromEntries(strings.map((k) => [k, { type: "string" }])), check: { type: "boolean" } } });
    await (o.check ? check(o) : build(o));
  } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
