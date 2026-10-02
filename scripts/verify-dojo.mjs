#!/usr/bin/env node
// scripts/verify-dojo.mjs -- deployment Conformity Attestation (CA) of MONARK Dojo (ADR-DOJO-PR-3 D-2 l.83-84 and l.286; pli G0 of
// PR-3b-2, PB-2 to PB-6; lot PR-3b-2b-1). Run by the orchestrator from its own machine, under `env -i` and a closed list (RUNBOOK-dojo
// CA-0 and CA-1):
//   node scripts/verify-dojo.mjs (--url https://dojo.monarkgate.tech | --offline <mirror>) --keyring apps/dojo/keys/dojo-keyring.json
//     --g7 <40-hex SHA> --tree-digests <publication> <collect> --loaded-config <captures> --bell-digests <before> <after>
//     [--out docs/deploy-CA-dojo.json] [--repo <dir>] [--dojo-verify <cli>]
// Twelve NAMED checks; their names and the keys of DOJO-CA-FORMAT-1 come from the sync that binds this output (bindDojoCa), never
// retyped (FM-1.1): "VERIFY OK - 12/12" and exit 0 ONLY if all twelve pass, else "VERIFY FAILED: <names>" and exit 1; a usage error
// exits 2 before any GET, nothing written. Offline (CA-0) reads a mirror: c04 to c07 are never passed, so never "VERIFY OK" (M-H28).
// c03 runs the verifier's PUBLIC command as a child whose environment is a closed list taken by name, never the CA's own (PB-3 (1));
// c07 refuses a TLS family or a Node option in the CA's own process (PB-3 (2)); c11 recomputes the head and the history from the bytes
// the CA read and binds them to the verifier's report and to the signed lines (FM-3.3). The transport, the TLS probe, the blob reader
// and the capture parsers are those of scripts/verify-bell.mjs, imported. `deps` (tlsProbe, env, execArgv) is the tests' seam only.
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import * as tls from "node:tls";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical } from "../apps/bell/scripts/bell-chain.mjs";
import { rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { DOJO_VERIFY_REPORT_KEYS, VERIFY_BOUNDS } from "../apps/dojo/scripts/dojo-verify.mjs";
import { DOJO_HOST } from "../apps/site/lib/dojo-served-load.ts";
import * as D from "./dojo-deploy.mjs";
import { CA_BODY_PATHS, CA_CHECKS, CA_SCHEMA } from "./sync-dojo-served.mjs";
import { CADDY_DEDICATED, PRIVATE_SHAPES, UNIT_INSTALLED, gitBlob, httpGet, parseDigests, parseSystemctlCat, tlsProbe } from "./verify-bell.mjs";

const REPO = fileURLToPath(new URL("..", import.meta.url));
/** PB-3 (1): the names the verifier child receives, a CLOSED list taken by name from the CA's environment (never a copy of it minus a
 *  deny list: an unknown name never passes). A win32 child receives these eleven from its parent whatever block it is given (measured on
 *  Node v24.15.0, G1 journal of PR-3b-2b-1); naming them all makes the child see this list on every platform. None is of c07's families. */
export const DOJO_CA_CHILD_ENV = Object.freeze(["HOMEDRIVE", "HOMEPATH", "LOGONSERVER", "PATH", "SYSTEMDRIVE", "SYSTEMROOT", "TEMP",
  "USERDOMAIN", "USERNAME", "USERPROFILE", "WINDIR"]);
/** PB-3 (2): the names c07 refuses in the CA's own environment, case ignored (FAITS node-fetch-tls F-1 to F-5; NO_PROXY, Q-C-3 of PR-1b-4). */
export const DOJO_CA_TLS_FAMILY = /^(NODE_|SSL_|OPENSSL_)|PROXY$/i;
/** T of PB-3 (1), the child's time bound: DOJO-VERIFY-SCALE-1, worst CLI measured 587.4 s x 1.25 (G1 journal of PR-3b-2a l.354). */
export const DOJO_CA_TIMEOUT_MS = 740_000;
/** c08: paths outside public/ or never published (PB-2), each answering non-200. */
export const DOJO_CA_PROBES = Object.freeze(["/keyring.json", "/staging/", "/archive/", "/signing-key.pem", "/dojo/signing-key.pem",
  "/dojo-signing-key", "/../keyring.json", "/%2e%2e/keyring.json", "/bundles/", "/ledger/", "/evidence/", "/seed", "/anchor.json"]);
/** c09: the four units of the host (repository paths); the `systemctl cat` capture of each is <its name>.cat under --loaded-config. */
export const DOJO_CA_UNITS = Object.freeze([D.DOJO_COLLECT_UNIT, D.DOJO_COLLECT_TIMER, D.DOJO_PUBLISH_UNIT, D.DOJO_PUBLISH_TIMER]);
/** The capture files of --loaded-config (RUNBOOK-dojo CA-0), each hashed into inputs_sha256. */
export const DOJO_CA_CAPTURES = Object.freeze(["caddyfile-main", "caddyfile-dojo", ...DOJO_CA_UNITS.map((u) => `${basename(u)}.cat`),
  "need-daemon-reload.txt", "manager-env.txt", "unit-env.txt"]);
/** The closed list of a served tree (dojo-verify-cli.mjs SERVED; mere D-9): the only files a mirror may hold (c08 offline, M-E9). */
const SERVED = /^(timeline[.]jsonl|dojo[/]pubkey[.]json|(lines|history)[/][0-9a-f]{64}[.]jsonl)$/;
const OFFLINE = "offline: never passed (no HTTP response, no TLS handshake)";
const LF = String.fromCharCode(10), WS = new RegExp(`[ ${String.fromCharCode(9)}]+`), BLANKS = new RegExp(`[ ${LF}]+`);
const HEX64 = /^[0-9a-f]{64}$/, HEX40 = /^[0-9a-f]{40}$/, NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const parseJson = (s) => { try { return JSON.parse(s); } catch { return undefined; } };
const readOr = (p) => { try { return statSync(p).isFile() ? readFileSync(p) : null; } catch { return null; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const keysAre = (v, keys) => isObj(v) && Object.keys(v).sort().join() === [...keys].sort().join();
const sameCanonical = (x, y) => { try { return x !== undefined && y !== undefined && canonical(x) === canonical(y); } catch { return false; } };
const tokens = (r) => String(r?.headers?.["cache-control"] ?? "").split(/[ ,]+/);
const shaOf = (l) => (l?.kind === "snapshot" ? l.lines_sha256 : l?.kind === "history" ? l.history_sha256 : undefined);
const pathOf = (l) => `/${l.kind === "snapshot" ? "lines" : "history"}/${String(shaOf(l))}.jsonl`; // a URL path, as the bodies are keyed
const blobs = new Map(); // a blob at a 40-hex commit never changes: read once per path
const blobAt = (repo, g7, p) => { const k = `${repo}|${g7}|${p}`; if (!blobs.has(k)) blobs.set(k, gitBlob(repo, g7, p)); return blobs.get(k); };

/** The offline source (CA-0): a URL path read in the mirror, answered as httpGet answers, without any header. */
function mirrorGet(mirror, p) {
  const f = join(mirror, ...p.split("/").filter((x) => x !== "")), size = readOr(f)?.length ?? -1;
  if (size > VERIFY_BOUNDS.MAX_BODY_BYTES) return { error: "body exceeds the reader's bound" };
  return size < 0 ? { status: 404, headers: {}, body: Buffer.alloc(0) } : { status: 200, headers: {}, body: readFileSync(f) };
}
/** Every entry of the mirror that is not a directory, outside the closed list of a served tree (relative, "/"-separated). */
const strays = (mirror) => readdirSync(mirror, { recursive: true, withFileTypes: true }).filter((e) => !e.isDirectory())
  .map((e) => relative(mirror, join(e.parentPath, e.name)).split(sep).join("/")).filter((r) => !SERVED.test(r)).sort();
/** The verifier child (PB-3 (1)): its public command, asynchronous (a loopback server answers while it runs), env = the closed list. */
function runVerifier(cli, args, env) {
  return new Promise((done) => {
    execFile(process.execPath, [cli, ...args], { env, timeout: DOJO_CA_TIMEOUT_MS, maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES, encoding: "utf8" },
      (e, stdout) => { done({ code: e === null ? 0 : typeof e.code === "number" ? e.code : null, stdout: String(stdout ?? "") }); });
  });
}
/** PB-3 (c): the default certificate store of this binary, NAMED in c07's detail, never a gate (its size, the embedded store's size,
 *  whether they are the same set, its sha256). */
function storeOf() {
  if (typeof tls.getCACertificates !== "function") return "ca_store=unknown";
  const d = tls.getCACertificates("default"), b = new Set(tls.getCACertificates("bundled"));
  return `ca_default=${d.length} ca_bundled=${b.size} ca_default_is_bundled=${d.length === b.size && d.every((c) => b.has(c))} `
    + `ca_default_sha256=${sha256(d.join(""))}`;
}

function parseArgs(argv) {
  const a = { url: null, offline: null, keyring: null, g7: null, trees: null, loaded: null, bell: null, out: null, repo: REPO, cli: null };
  const ONE = { "--url": "url", "--offline": "offline", "--keyring": "keyring", "--g7": "g7", "--loaded-config": "loaded", "--out": "out",
    "--repo": "repo", "--dojo-verify": "cli" }, TWO = { "--tree-digests": "trees", "--bell-digests": "bell" }, seen = new Set();
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], n = Object.hasOwn(TWO, k) ? 2 : Object.hasOwn(ONE, k) ? 1 : 0, v = argv.slice(i + 1, i + 1 + n);
    if (n === 0 || seen.has(k) || v.length < n || v.some((x) => typeof x !== "string" || x === "" || x.startsWith("--"))) {
      return { error: `argument ${String(k)}: unknown, repeated or without its value` };
    }
    seen.add(k);
    a[n === 2 ? TWO[k] : ONE[k]] = n === 2 ? v : v[0];
    i += n;
  }
  if ((a.url === null) === (a.offline === null)) return { error: "--url <origin> or --offline <mirror>: exactly one" };
  if (a.url !== null && a.url !== DOJO_HOST && !/^http:[/][/]127[.]0[.]0[.]1(:[0-9]{1,5})?$/.test(a.url)) {
    return { error: `--url must be ${DOJO_HOST} (no trailing slash), or a loopback test origin http://127.0.0.1[:port] (TLS never passed)` };
  }
  if (a.offline !== null && !isDir(a.offline)) return { error: "--offline <mirror> must be a directory" };
  if (a.keyring === null || readOr(a.keyring) === null) return { error: "--keyring <committed keyring file> is required" };
  if (!HEX40.test(String(a.g7))) return { error: "--g7 <the full 40-hex SHA of the deployed tree> is required" };
  if (a.trees === null || a.loaded === null || a.bell === null) {
    return { error: "--tree-digests <publication> <collect>, --loaded-config <captures> and --bell-digests <before> <after> are required" };
  }
  a.cli ??= join(a.repo, "apps", "dojo", "scripts", "dojo-verify-cli.mjs");
  return a;
}

/**
 * Run the CA. Resolves {code, ca, out}: code 0 iff the twelve checks pass online; or {code: 2, ca: null, usage} before any GET. Never
 * throws on a failing host: a failure is a named red check. `deps` replaces the TLS observation, the CA's environment and its
 * execArgv for the loopback tests only (no certificate can be issued offline).
 */
export async function runCa(argv, deps = {}) {
  const a = parseArgs(argv);
  if (a.error !== undefined) return { code: 2, ca: null, usage: a.error };
  const env = deps.env ?? process.env, execArgv = deps.execArgv ?? process.execArgv, off = a.offline !== null, at = new Date().toISOString();
  const [C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12] = CA_CHECKS, results = new Map(), fetched = {};
  const set = (name, pass, detail) => { results.set(name, { name, pass: pass === true, detail }); };
  const get = async (p) => { const r = off ? mirrorGet(a.offline, p) : await httpGet(a.url, p); fetched[p] = r; return r; };
  const ok200 = (r) => r !== undefined && r.error === undefined && r.status === 200, status = (r) => String(r?.status ?? r?.error);

  const tl = await get(CA_BODY_PATHS.timeline), text = ok200(tl) ? tl.body.toString("utf8") : "";
  const lines = text.endsWith(LF) ? text.slice(0, -1).split(LF).map(parseJson) : [];
  set(C01, lines.length > 0 && lines.every((l) => l?.schema === "dojo-timeline-v1"),
    `checked_at=${at} ${off ? "mode=offline" : `status=${status(tl)}`} lines=${lines.length}`);
  const committed = readFileSync(a.keyring), pk = await get(CA_BODY_PATHS.pubkey), pkJ = ok200(pk) ? parseJson(pk.body.toString("utf8")) : undefined;
  set(C02, sameCanonical(pkJ, parseJson(committed.toString("utf8"))),
    `status=${status(pk)} served_sha256=${ok200(pk) ? sha256(pk.body) : "-"} committed_sha256=${sha256(committed)}`);

  // The files the timeline names, each read once (c12, c06, c11), within the reader's totals.
  const named = lines.filter((l) => ["snapshot", "history"].includes(l?.kind)), bad = named.filter((l) => !HEX64.test(String(shaOf(l))));
  const paths = [...new Set(named.filter((l) => !bad.includes(l)).map(pathOf))], within = 2 + paths.length <= VERIFY_BOUNDS.MAX_FILES, imm = [];
  if (within) for (const p of paths) imm.push(await get(p));

  const E = Object.fromEntries(DOJO_CA_CHILD_ENV.filter((k) => env[k] !== undefined).map((k) => [k, env[k]]));
  const v = existsSync(a.cli) ? await runVerifier(a.cli, [...(off ? [a.offline] : ["--url", a.url]), "--keyring", a.keyring], E) : { code: null, stdout: "" };
  const one = v.stdout.endsWith(LF) && v.stdout.indexOf(LF) === v.stdout.length - 1, rep = one ? parseJson(v.stdout) : undefined;
  const rooted = rep?.status === "consistent_with_supplied_keyring" && rep?.trust_root === "supplied_keyring", r = isObj(rep) && rep.ok === true ? rep : null;
  set(C03, v.code === 0 && one && keysAre(rep, DOJO_VERIFY_REPORT_KEYS) && rep.ok === true && rooted && rep.detail === null,
    `exit=${String(v.code)} one_line=${one} status=${String(rep?.status)} trust_root=${String(rep?.trust_root)} detail_null=${rep?.detail === null} `
    + `stdout_sha256=${sha256(v.stdout)}`);

  const served = [tl, pk, ...imm];
  set(C04, !off && served.every((x) => x.error === undefined && x.headers["access-control-allow-origin"] === "*"),
    off ? OFFLINE : `answered=${served.filter((x) => x.error === undefined).length}/${served.length}`);
  const dirs = off ? [] : await Promise.all(["/", "/lines/", "/history/", "/dojo/"].map((p) => httpGet(a.url, p)));
  const listing = (x) => /timeline[.]jsonl|pubkey[.]json|[0-9a-f]{64}[.]jsonl/.test(x.body?.toString("utf8") ?? "");
  set(C05, !off && dirs.every((x) => x.error === undefined && x.status !== 200 && !listing(x)), off ? OFFLINE : `status=${dirs.map(status).join(",")}`);
  const immOk = imm.every((x) => tokens(x).includes("immutable"));
  const curOk = [tl, pk].every((x) => tokens(x).includes("no-cache") && !tokens(x).includes("immutable"));
  set(C06, !off && immOk && curOk, off ? OFFLINE : `immutable=${immOk} current_no_cache=${curOk}`);

  const u = off ? null : new URL(a.url), port = u?.port ? Number(u.port) : 443;
  const t = off ? { authorized: false } : deps.tlsProbe !== undefined ? await deps.tlsProbe(u.hostname, port)
    : u.protocol === "https:" ? await tlsProbe(u.hostname, port) : { authorized: false, skipped: true };
  const fam = Object.keys(env).filter((k) => DOJO_CA_TLS_FAMILY.test(k)).sort(), opts = [...execArgv];
  const optNames = opts.filter((o) => o.startsWith("-")).map((o) => o.split("=")[0]).join(",") || (opts.length > 0 ? `count:${opts.length}` : "none");
  set(C07, !off && t.authorized === true && fam.length === 0 && opts.length === 0, off ? OFFLINE : `authorized=${t.authorized === true}`
    + `${t.skipped === true ? " tls_skipped=http_target" : ""} env_families=${fam.join(",") || "none"} exec_argv=${optNames} ${storeOf()}`);

  const bodies = Object.values(fetched).filter(ok200).map((x) => x.body.toString("utf8")), shapes = bodies.some((b) => PRIVATE_SHAPES.some((re) => re.test(b)));
  const jwk = Array.isArray(pkJ?.keys) && pkJ.keys.length > 0 && pkJ.keys.every((k) => keysAre(k?.public_key, ["crv", "kty", "x"]));
  const probes = off ? [] : await Promise.all(DOJO_CA_PROBES.map((p) => httpGet(a.url, p)));
  const leaked = off ? strays(a.offline) : DOJO_CA_PROBES.filter((_, i) => ok200(probes[i]));
  set(C08, !shapes && jwk && leaked.length === 0,
    `private_shape=${shapes} jwk_public_only=${jwk} ${off ? "stray_files" : "served_private_paths"}=${leaked.join(",") || "none"}`);

  const c9 = [];
  try {
    const cap = (n) => readOr(join(a.loaded, n)), blob = (p) => blobAt(a.repo, a.g7, p);
    const tree = (f, list) => { const got = parseDigests(readOr(f)?.toString("utf8") ?? "-"), want = new Map(list.map((p) => [p, sha256(blob(p))]));
      return got !== null && got.size === want.size && [...want].every(([p, h]) => got.get(p) === h); };
    const unit = (x) => { const c = cap(`${basename(x)}.cat`), pc = c === null ? null : parseSystemctlCat(c.toString("utf8"));
      return pc !== null && pc.headers.length === 1 && pc.headers[0].index === 0 && pc.headers[0].path === `/etc/systemd/system/${basename(x)}`
        && pc.fragment === blob(x).toString("utf8"); };
    const ndr = (cap("need-daemon-reload.txt")?.toString("utf8") ?? "").split(LF).map((l) => l.trim()).filter((l) => l !== "");
    const imports = (cap("caddyfile-main")?.toString("utf8") ?? "").split(LF).map((l) => l.split("#")[0].trim().split(WS).join(" "))
      .filter((l) => l.split(" ")[0] === "import").sort();
    const envs = ["manager-env.txt", "unit-env.txt"].map((n) => (cap(n)?.toString("utf8") ?? "").split(BLANKS).filter((x) => x !== ""));
    const famHost = envs.flat().filter((x) => DOJO_CA_TLS_FAMILY.test(x));
    c9.push(["tree_publication", tree(a.trees[0], D.DOJO_PUBLISH_TREE_PATHS)], ["tree_collect", tree(a.trees[1], D.DOJO_COLLECT_TREE_PATHS)],
      ["units_one_fragment_equal", DOJO_CA_UNITS.every(unit)], ["need_daemon_reload_no", ndr.length === DOJO_CA_UNITS.length && ndr.every((l) => l === "no")],
      ["imports_bell_dojo", imports.join(LF) === [`import ${CADDY_DEDICATED}`, `import ${D.DOJO_CADDYFILE_INSTALLED}`].sort().join(LF)],
      ["dojo_extract", cap("caddyfile-dojo")?.equals(blob(D.DOJO_CADDYFILE)) === true],
      ["environment_closed", envs.every((e) => e.length > 0 && e.every((x) => NAME.test(x))) && famHost.length === 0]);
    set(C09, c9.every(([, ok]) => ok === true), `${c9.map(([k, ok]) => `${k}=${String(ok)}`).join(" ")} env_families=${famHost.join(",") || "none"}`);
  } catch (e) {
    set(C09, false, `${c9.map(([k, ok]) => `${k}=${String(ok)}`).join(" ")} error=${String(e?.code ?? e?.message ?? e)}`);
  }

  const [bb, ba] = a.bell.map(readOr), bm = bb === null ? null : parseDigests(bb.toString("utf8")), kept = [...(bm?.keys() ?? [])];
  const holds = bm !== null && kept.some((p) => p.startsWith("/opt/monark-bell/")) && bm.has(UNIT_INSTALLED) && bm.has(CADDY_DEDICATED)
    && bm.has("/etc/monark/probe.env") && kept.some((p) => p.startsWith("/opt/monark-probe/"));
  set(C10, bb !== null && ba !== null && bb.equals(ba) && holds,
    `before_sha256=${bb === null ? "-" : sha256(bb)} after_sha256=${ba === null ? "-" : sha256(ba)} entries=${kept.length} required=${holds}`);

  // c11: the head and the history as the CA read them, recomputed here (count, sha256, rootOf) and bound to the report and the lines.
  const bodies_sha256 = Object.fromEntries(Object.entries(fetched).map(([p, x]) => [p, ok200(x) ? sha256(x.body) : null]));
  const snaps = lines.filter((l) => l?.kind === "snapshot"), hl = snaps.length === 0 ? null : snaps[snaps.length - 1];
  const hil = lines.find((l) => l?.kind === "history") ?? null;
  const recount = (l) => { const x = l === null || !HEX64.test(String(shaOf(l))) ? undefined : fetched[pathOf(l)];
    const s = ok200(x) ? x.body.toString("utf8") : null, raw = s === null || (s !== "" && !s.endsWith(LF)) ? null : s === "" ? [] : s.slice(0, -1).split(LF);
    return raw === null ? null : { sha: sha256(x.body), count: raw.length, root: rootOf(raw) }; };
  const hr = recount(hl), hir = recount(hil);
  const head = hl === null ? null : { seq: hl.seq, day: r === null ? null : r.day, lines_sha256: hr?.sha ?? null, lines_count: hr?.count ?? null,
    recomputed_root: hr?.root ?? null };
  const history = hil === null ? null : { history_sha256: hir?.sha ?? null, history_lines_count: hir?.count ?? null, history_root: hir?.root ?? null };
  const headOk = head !== null && hr !== null && r !== null && isObj(r.head) && r.day === hl.day && r.head.seq === head.seq
    && r.head.lines_sha256 === head.lines_sha256 && r.head.lines_count === head.lines_count && r.head.recomputed_root === head.recomputed_root
    && hl.lines_sha256 === head.lines_sha256 && hl.lines_count === head.lines_count && hl.root === head.recomputed_root;
  const histOk = r !== null && (hil === null ? r.history === null : hir !== null && isObj(r.history) && r.history.recomputed_root === history.history_root
    && r.history.history_sha256 === history.history_sha256 && r.history.history_lines_count === history.history_lines_count
    && hil.history_sha256 === history.history_sha256 && hil.history_lines_count === history.history_lines_count && hil.history_root === history.history_root);
  const tlOk = r !== null && r.timeline_sha256 === bodies_sha256[CA_BODY_PATHS.timeline];
  set(C11, headOk && histOk && tlOk, hl === null ? "no snapshot served" : `head=${headOk} history=${histOk} timeline_sha256=${tlOk}`);

  const bytes = Object.values(fetched).reduce((n, x) => n + (x.body?.length ?? 0), 0);
  const wrong = paths.filter((p, i) => !ok200(imm[i]) || sha256(imm[i].body) !== p.split("/")[2].slice(0, 64));
  set(C12, within && bad.length === 0 && wrong.length === 0 && bytes <= VERIFY_BOUNDS.MAX_TOTAL_BYTES, `named=${paths.length} within_files=${within} `
    + `malformed_names=${bad.length} wrong=${wrong.length}${wrong.length > 0 ? ` first=${wrong[0]}` : ""} bytes=${bytes}`);

  const input = (f) => { const b = readOr(f); return b === null ? null : sha256(b); };
  const inputs_sha256 = { keyring: input(a.keyring), tree_publication: input(a.trees[0]), tree_collect: input(a.trees[1]), bell_before: input(a.bell[0]),
    bell_after: input(a.bell[1]), dojo_verify: input(a.cli),
    ...Object.fromEntries(DOJO_CA_CAPTURES.map((n) => [`loaded_config/${n}`, input(join(a.loaded, n))])) };
  const checks = CA_CHECKS.map((n) => results.get(n) ?? { name: n, pass: false, detail: "not run" });
  const ca = { schema: CA_SCHEMA, url: off ? null : a.url, g7: a.g7, checks, tls: { authorized: t.authorized === true }, head, history, bodies_sha256,
    inputs_sha256 };
  return { code: checks.every((c) => c.pass) ? 0 : 1, ca, out: a.out };
}

async function main() {
  const r = await runCa(process.argv.slice(2));
  if (r.ca === null) { process.stderr.write(`verify-dojo: ${r.usage}${LF}`); return 2; }
  const text = `${JSON.stringify(r.ca, null, 2)}${LF}`, failed = r.ca.checks.filter((c) => !c.pass).map((c) => c.name);
  process.stdout.write(text);
  if (r.out !== null) writeFileSync(r.out, text);
  process.stderr.write(failed.length === 0 ? `VERIFY OK - ${CA_CHECKS.length}/${CA_CHECKS.length} checks passed (tls.authorized=true)${LF}`
    : `VERIFY FAILED: ${failed.join(", ")}${LF}`);
  return r.code;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().then((c) => { process.exitCode = c; }, (e) => { process.stderr.write(`verify-dojo crashed: ${String(e?.message ?? e)}${LF}`); process.exitCode = 1; });
}
