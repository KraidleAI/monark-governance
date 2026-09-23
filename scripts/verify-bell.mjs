#!/usr/bin/env node
// scripts/verify-bell.mjs -- deployment Conformity Attestation (CA) of the MONARK Bell publication (ADR-T1b-backend v2 D11,
// backlog S-9). Run by the orchestrator from its own machine at the D-n (docs/RUNBOOK-bell.md). Node built-ins only.
//
//   node scripts/verify-bell.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json
//     --g7 <40-hex SHA of the deployed tree> --tree-digests <tree.sha256> --loaded-config <capture dir>
//     --probe-digests <before.sha256> <after.sha256> [--out docs/deploy-CA-bell.json] [--repo <dir>] [--bell-verify <path>]
//
// Twelve NAMED checks (CHECK_NAMES); "VERIFY OK" and exit 0 ONLY if all twelve pass, else "VERIFY FAILED: <names>" and exit 1
// (a usage error exits 2). Check 9 needs a real TLS handshake with authorized === true: an http target is SKIPPED, and a
// skipped TLS check never passes (it is never a go-live). The trust root of check 5 is the COMMITTED keyring (--keyring, C-9);
// the served /bell/pubkey.json is only a cross-checked channel (check 3). Check 7 also requires the host root `/` to answer 302
// with Location BELL_ROOT_REDIRECT (decision 155, lot BELL-HOST-ROOT-1). Check 11 proves the configuration really LOADED on
// the host (C-5) against `git cat-file blob <G7>:<path>`; its inputs are raw host captures (RUNBOOK step 11):
//   --tree-digests    sha256sum lines of every file under /opt/monark-bell (paths relative to it)
//   --loaded-config   a directory: caddyfile-main (/etc/caddy/Caddyfile), caddyfile-dedicated (import mode only),
//                     systemctl-cat.txt (`systemctl cat monark-bell-publish.service`), need-daemon-reload.txt
//                     (`systemctl show -p NeedDaemonReload --value monark-bell-publish.service`)
//   --probe-digests   the same sha256sum capture of /etc/monark/probe.env + /opt/monark-probe, before and after the D-n.
// Check 5 runs the verifier through its CLI (backlog S-4, PR-2 apps/bell/scripts/bell-verify.mjs runVerifyCli): node <bell-verify>
// --url <url> --keyring <committed keyring>; it passes iff exit 0 AND the one-line JSON report says status
// "consistent_with_supplied_keyring" (the verifier's own statement that the SUPPLIED keyring was the root, C-9). The CA JSON pins
// the sha256 of every input and every observed body.
import { createHash } from "node:crypto";
import { execFile, execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { connect as tlsConnect } from "node:tls";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical } from "../apps/bell/scripts/bell-chain.mjs";

const REPO = fileURLToPath(new URL("..", import.meta.url));
export const CHECK_NAMES = Object.freeze(["c01_state_json", "c02_timeline_jsonl", "c03_pubkey_equals_committed_keyring", "c04_provenance_json",
  "c05_bell_verify_keyring_root", "c06_acao_star", "c07_no_directory_listing", "c08_cache_immutable_states_no_cache_current", "c09_tls_authorized",
  "c10_no_private_material_served", "c11_loaded_config_equals_g7", "c12_probe_untouched"]);
/** The dedicated tree holds ONLY what the unit runs (ADR D1): its ExecStart script and that script's local import. The RUNBOOK's
 *  git archive lists exactly these paths (pinned by test/verify-bell.test.ts). */
export const BELL_TREE_PATHS = Object.freeze(["apps/bell/scripts/bell-chain.mjs", "apps/bell/scripts/bell-publish.mjs"]);
export const UNIT_NAME = "monark-bell-publish.service";
export const UNIT_INSTALLED = `/etc/systemd/system/${UNIT_NAME}`;
export const CADDY_DEDICATED = "/etc/caddy/monark-bell.caddyfile";
/** The host root `/` sends a human reader to the site's Bell page (decision 155): the target of the Caddyfile's one `redir`
 *  (bound by test S-8), required by check 7 on the live host. */
export const BELL_ROOT_REDIRECT = "https://monarkgate.tech/bell";
const MAX_BODY = 64 * 1024 * 1024; // = MAX_PUBLIC_STATE_BYTES of the publisher
/** Private-key shapes that must never be served: a PEM private block, a JWK private member "d", a bare base64 Ed25519 PKCS#8 DER
 *  (its fixed 16-byte prefix 302e...0420 always encodes to the same 21 base64 characters; built from the hex, never a literal). */
export const PRIVATE_SHAPES = Object.freeze([/-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/, /"d"\s*:\s*"[A-Za-z0-9_-]{40,}"/,
  new RegExp(Buffer.from("302e020100300506032b657004220420", "hex").toString("base64").slice(0, 21))]);
/** Paths outside public/ or never published: each must answer non-200 (check 10). */
const PRIVATE_PROBES = ["/keyring.json", "/../keyring.json", "/%2e%2e/keyring.json", "/staging/", "/inbox/", "/archive/", "/signing-key.pem",
  "/bell/signing-key.pem", "/bell-signing-key"];

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const parseJson = (s) => { try { return JSON.parse(s); } catch { return undefined; } };
const readOr = (p) => (existsSync(p) ? readFileSync(p) : null);

/** One GET, no redirect followed, body bounded; resolves {status, headers, body} or {error}; never throws. */
export function httpGet(url, path) {
  return new Promise((done) => {
    const u = new URL(url), https = u.protocol === "https:";
    const req = (https ? httpsRequest : httpRequest)({ hostname: u.hostname, port: u.port ? Number(u.port) : (https ? 443 : 80), path, method: "GET",
      headers: { "accept-encoding": "identity" }, timeout: 20000, ...(https ? { servername: u.hostname } : {}) }, (res) => {
      const chunks = [];
      let n = 0;
      res.on("data", (c) => { n += c.length; if (n > MAX_BODY) { req.destroy(); done({ error: "body exceeds 64 MiB" }); } else chunks.push(c); });
      res.on("end", () => { done({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) }); });
    });
    req.on("error", (e) => { done({ error: String(e?.code ?? e?.message ?? e) }); });
    req.on("timeout", () => { req.destroy(); done({ error: "timeout" }); });
    req.end();
  });
}
/** A real TLS handshake with default certificate validation; authorized === true only for a trusted, matching certificate. */
export function tlsProbe(host, port) {
  return new Promise((done) => {
    const s = tlsConnect({ host, port, servername: host, timeout: 20000 }, () => {
      const c = s.getPeerCertificate();
      done({ host, authorized: s.authorized === true, issuer: c?.issuer?.O ?? c?.issuer?.CN ?? null, valid_to: c?.valid_to ?? null });
      s.end();
    });
    s.on("error", (e) => { done({ host, authorized: false, error: String(e?.code ?? e?.message ?? e) }); });
    s.on("timeout", () => { s.destroy(); done({ host, authorized: false, error: "timeout" }); });
  });
}
/** The committed bytes of `path` at revision `rev` (never the working tree). */
export const gitBlob = (repo, rev, path) => execFileSync("git", ["-C", repo, "cat-file", "blob", `${rev}:${path}`], { maxBuffer: MAX_BODY });
/** Run the verifier CLI; resolves {code, stdout, stderr}. */
function runVerifier(script, url, keyring) {
  return new Promise((done) => {
    execFile(process.execPath, [script, "--url", url, "--keyring", keyring], { timeout: 180000, maxBuffer: MAX_BODY, encoding: "utf8" }, (e, stdout, stderr) => {
      done({ code: e === null ? 0 : typeof e.code === "number" ? e.code : 1, stdout, stderr });
    });
  });
}

/** sha256sum lines ("<hex>  <path>" or "<hex> *<path>") -> Map(path without "./" -> hex); null if any line is malformed. */
export function parseDigests(text) {
  const m = new Map();
  for (const line of text.split("\n").filter((l) => l !== "")) {
    const r = /^([0-9a-f]{64}) [ *](.+)$/.exec(line);
    if (r === null) return null;
    m.set((r[2] ?? "").replace(/^\.\//, ""), r[1] ?? "");
  }
  return m;
}
/** `systemctl cat` output -> {headers: [file names], fragment: the text of the FIRST file only}. A header is "# /<absolute path>";
 *  a drop-in is a second header. The fragment and the drop-in count are two independent predicates of check 11 (c). */
export function parseSystemctlCat(text) {
  const lines = text.split("\n"), headers = [];
  lines.forEach((l, i) => { const r = /^# (\/\S+)$/.exec(l); if (r !== null) headers.push({ index: i, path: r[1] }); });
  const from = headers.length > 0 ? headers[0].index + 1 : 0, to = headers.length > 1 ? headers[1].index : lines.length;
  return { headers, fragment: lines.slice(from, to).join("\n") };
}
const isListing = (r) => r.status === 200 && /state\.json|timeline\.jsonl|provenance|pubkey\.json|[0-9a-f]{64}\.json/.test(r.body.toString("utf8"));

function parseArgs(argv) {
  const a = { url: null, keyring: null, g7: null, tree: null, loaded: null, probe: [], out: null, repo: REPO, verifier: null };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--url") a.url = argv[++i]; else if (k === "--keyring") a.keyring = argv[++i]; else if (k === "--g7") a.g7 = argv[++i];
    else if (k === "--tree-digests") a.tree = argv[++i]; else if (k === "--loaded-config") a.loaded = argv[++i];
    else if (k === "--probe-digests") { a.probe = [argv[i + 1], argv[i + 2]]; i += 2; } else if (k === "--out") a.out = argv[++i];
    else if (k === "--repo") a.repo = argv[++i]; else if (k === "--bell-verify") a.verifier = argv[++i];
    else return { error: `unknown argument ${String(k)}` };
  }
  if (!a.url || !/^https?:\/\/[^/]+$/.test(a.url)) return { error: "--url must be an origin (scheme://host[:port], no path)" };
  if (!a.keyring || !existsSync(a.keyring)) return { error: "--keyring <committed keyring file> is required" };
  if (!a.g7 || !/^[0-9a-f]{40}$/.test(a.g7)) return { error: "--g7 <full 40-hex SHA of the deployed tree> is required" };
  if (!a.tree || !a.loaded || a.probe.length !== 2 || a.probe.some((p) => !p)) return { error: "--tree-digests, --loaded-config and --probe-digests <before> <after> are required" };
  a.verifier = a.verifier ?? join(a.repo, "apps", "bell", "scripts", "bell-verify.mjs");
  return a;
}

/**
 * Run the CA. `deps` is the test seam (tlsProbe, gitBlob); the CLI always passes the real ones. Resolves {code, ca}; code 0 iff
 * the twelve checks pass; the caller (CLI) prints and exits. Never throws on a failing host: a failure is a named red check.
 */
export async function runCa(argv, deps = {}) {
  const blob = deps.gitBlob ?? gitBlob;
  const a = parseArgs(argv);
  if (a.error !== undefined) return { code: 2, ca: null, usage: a.error };
  const u = new URL(a.url), results = new Map(), fetched = {};
  const set = (name, ok, detail) => { results.set(name, { name, ok: ok === true, detail }); };
  const get = async (p) => { const r = await httpGet(a.url, p); fetched[p] = r; return r; };
  const ok200 = (r) => r.error === undefined && r.status === 200;
  const committed = readFileSync(a.keyring);

  const st = await get("/state.json"), stJ = ok200(st) ? parseJson(st.body.toString("utf8")) : undefined;
  set("c01_state_json", stJ?.schema === "bell-public-state-v1", `status=${String(st.status ?? st.error)} schema=${String(stJ?.schema)}`);
  const tl = await get("/timeline.jsonl"), tlText = ok200(tl) ? tl.body.toString("utf8") : "";
  const tlLines = tlText.endsWith("\n") ? tlText.slice(0, -1).split("\n").map(parseJson) : [];
  set("c02_timeline_jsonl", tlLines.length > 0 && tlLines.every((l) => l?.schema === "bell-timeline-v1"), `status=${String(tl.status ?? tl.error)} lines=${String(tlLines.length)}`);
  const pk = await get("/bell/pubkey.json"), pkJ = ok200(pk) ? parseJson(pk.body.toString("utf8")) : undefined, krJ = parseJson(committed.toString("utf8"));
  set("c03_pubkey_equals_committed_keyring", pkJ !== undefined && krJ !== undefined && canonical(pkJ) === canonical(krJ),
    `status=${String(pk.status ?? pk.error)} served_sha256=${ok200(pk) ? sha256(pk.body) : "-"} committed_sha256=${sha256(committed)}`);
  const pv = await get("/provenance.json"), pvJ = ok200(pv) ? parseJson(pv.body.toString("utf8")) : undefined;
  set("c04_provenance_json", pvJ?.schema === "bell-public-provenance-v1", `status=${String(pv.status ?? pv.error)} schema=${String(pvJ?.schema)}`);

  const v = existsSync(a.verifier) ? await runVerifier(a.verifier, a.url, a.keyring) : { code: null, stdout: "", stderr: "" };
  const vStatus = parseJson(v.stdout.trim())?.status;
  set("c05_bell_verify_keyring_root", v.code === 0 && vStatus === "consistent_with_supplied_keyring",
    v.code === null ? `verifier absent: ${a.verifier}` : `exit=${String(v.code)} status=${String(vStatus)} stdout_sha256=${sha256(v.stdout)}`);

  // The current state.json is a copy of its content-addressed immutable: fetch states/<sha256(state.json)>.json (checks 6, 8, 10).
  const stSha = ok200(st) ? sha256(st.body) : null, imm = stSha !== null ? await get(`/states/${stSha}.json`) : { error: "no state.json" };
  const served = [st, tl, pk, pv, imm];
  set("c06_acao_star", served.every((r) => ok200(r) && r.headers["access-control-allow-origin"] === "*"),
    `acao=${served.map((r) => String(r.headers?.["access-control-allow-origin"])).join(",")}`);
  const dirs = await Promise.all(["/", "/states/", "/provenance/", "/bell/"].map((p) => httpGet(a.url, p)));
  const root = dirs[0], rootOk = root?.error === undefined && root?.status === 302 && root?.headers?.location === BELL_ROOT_REDIRECT;
  set("c07_no_directory_listing", rootOk && dirs.every((r) => r.error === undefined && !isListing(r)),
    `status=${dirs.map((r) => String(r.status ?? r.error)).join(",")} root_location=${String(root?.headers?.location)}`);
  const cc = (r) => String(r.headers?.["cache-control"] ?? "");
  const immOk = ok200(imm) && sha256(imm.body) === stSha && /\bimmutable\b/.test(cc(imm));
  const curOk = [st, tl, pk, pv].every((r) => ok200(r) && /\bno-cache\b/.test(cc(r)) && !/\bimmutable\b/.test(cc(r)));
  set("c08_cache_immutable_states_no_cache_current", immOk && curOk, `immutable=${String(immOk)} current_no_cache=${String(curOk)}`);

  // The CLI never passes deps.tlsProbe: an http target is then SKIPPED and check 9 is red (never a go-live). The seam replaces
  // the whole TLS observation for the loopback test only (no certificate can be issued offline without a committed key).
  const port = u.port ? Number(u.port) : 443;
  const t = deps.tlsProbe !== undefined ? await deps.tlsProbe(u.hostname, port)
    : u.protocol === "https:" ? await tlsProbe(u.hostname, port) : { host: u.hostname, skipped: true, reason: "http target: TLS not checked, never a go-live" };
  set("c09_tls_authorized", t.authorized === true, t.skipped === true ? "tls.skipped" : `authorized=${String(t.authorized)}`);

  const bodies = served.filter(ok200).map((r) => r.body.toString("utf8"));
  const shapes = bodies.some((b) => PRIVATE_SHAPES.some((re) => re.test(b)));
  const jwkPublic = Array.isArray(pkJ?.keys) && pkJ.keys.every((k) => k?.jwk && Object.keys(k.jwk).sort().join(",") === "crv,kty,x");
  const probes = await Promise.all(PRIVATE_PROBES.map((p) => httpGet(a.url, p)));
  const leaked = PRIVATE_PROBES.filter((_, i) => probes[i]?.error === undefined && probes[i]?.status === 200);
  set("c10_no_private_material_served", !shapes && jwkPublic && leaked.length === 0, `private_shape=${String(shapes)} jwk_public_only=${String(jwkPublic)} served_private_paths=${leaked.join(",") || "none"}`);

  const c11 = [];
  try {
    const want = new Map(BELL_TREE_PATHS.map((p) => [p, sha256(blob(a.repo, a.g7, p))])), got = parseDigests(readFileSync(a.tree, "utf8"));
    const treeOk = got !== null && got.size === want.size && [...want].every(([p, h]) => got.get(p) === h);
    c11.push(`tree=${String(treeOk)}`);
    const caddyBlob = blob(a.repo, a.g7, "deploy/Caddyfile.monark-bell"), unitBlob = blob(a.repo, a.g7, "deploy/monark-bell-publish.service");
    const main = readOr(join(a.loaded, "caddyfile-main")), ded = readOr(join(a.loaded, "caddyfile-dedicated"));
    const imports = main === null ? [] : main.toString("utf8").split("\n").map((l) => l.replace(/(^|\s)#.*$/, "").trim()).filter((l) => /^import\s/.test(l));
    const mode = main !== null && main.equals(caddyBlob) ? "replace" : "import";
    const caddyOk = mode === "replace" || (ded !== null && ded.equals(caddyBlob) && imports.length === 1 && imports[0] === `import ${CADDY_DEDICATED}`);
    c11.push(`caddy_${mode}=${String(caddyOk)}`);
    const cat = readOr(join(a.loaded, "systemctl-cat.txt")), ndr = readOr(join(a.loaded, "need-daemon-reload.txt"));
    const pc = cat === null ? null : parseSystemctlCat(cat.toString("utf8"));
    const unitOk = pc !== null && pc.headers.length === 1 && pc.headers[0]?.index === 0 && pc.headers[0]?.path === UNIT_INSTALLED && pc.fragment === unitBlob.toString("utf8");
    c11.push(`unit_one_fragment_equal=${String(unitOk)} fragments=${String(pc?.headers.length ?? 0)}`);
    const ndrOk = ndr !== null && ndr.toString("utf8").trim() === "no";
    c11.push(`need_daemon_reload_no=${String(ndrOk)}`);
    set("c11_loaded_config_equals_g7", treeOk && caddyOk && unitOk && ndrOk, c11.join(" "));
  } catch (e) {
    set("c11_loaded_config_equals_g7", false, `${c11.join(" ")} error=${String(e?.code ?? e?.message ?? e)}`);
  }

  const [pb, pa] = a.probe.map(readOr);
  const probeOk = pb !== null && pa !== null && pb.equals(pa) && /\/etc\/monark\/probe\.env/.test(pb.toString("utf8")) && /probe-narabi\.mjs/.test(pb.toString("utf8"))
    && parseDigests(pb.toString("utf8")) !== null;
  set("c12_probe_untouched", probeOk, `before_sha256=${pb ? sha256(pb) : "-"} after_sha256=${pa ? sha256(pa) : "-"}`);

  const checks = CHECK_NAMES.map((n) => results.get(n) ?? { name: n, ok: false, detail: "not run" });
  const ca = { schema: "bell-deploy-ca-v1", url: a.url, g7: a.g7, checked_at: new Date().toISOString(), keyring_sha256: sha256(committed),
    bell_verify_sha256: existsSync(a.verifier) ? sha256(readFileSync(a.verifier)) : null,
    inputs_sha256: { tree: sha256(readOr(a.tree) ?? ""), probe_before: pb ? sha256(pb) : null, probe_after: pa ? sha256(pa) : null },
    bodies_sha256: Object.fromEntries(Object.entries(fetched).map(([p, r]) => [p, r.body ? sha256(r.body) : null])),
    content_types: Object.fromEntries(Object.entries(fetched).map(([p, r]) => [p, r.headers?.["content-type"] ?? null])), checks, tls: t };
  return { code: checks.every((c) => c.ok) ? 0 : 1, ca, out: a.out };
}

async function main() {
  const r = await runCa(process.argv.slice(2));
  if (r.ca === null) { process.stderr.write(`verify-bell: ${r.usage}\n`); return 2; }
  const text = JSON.stringify(r.ca, null, 2) + "\n";
  process.stdout.write(text);
  if (r.out) writeFileSync(r.out, text);
  const failed = r.ca.checks.filter((c) => !c.ok).map((c) => c.name);
  process.stderr.write(failed.length === 0 ? `VERIFY OK - ${String(CHECK_NAMES.length)}/${String(CHECK_NAMES.length)} checks passed (tls.authorized=true)\n` : `VERIFY FAILED: ${failed.join(", ")}\n`);
  return r.code;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().then((c) => { process.exitCode = c; }, (e) => { process.stderr.write(`verify-bell crashed: ${String(e?.message ?? e)}\n`); process.exitCode = 1; });
}
