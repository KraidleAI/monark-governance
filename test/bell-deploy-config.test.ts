/**
 * Root tests of the Bell deployment configuration (ADR-T1b-backend v2 D8-D11; backlog S-7, S-8, S-11). Governance-only: deploy/
 * and docs/ are not exported. The COMMITTED unit and Caddyfile are parsed and pinned (closed directive sets, valued caps C-7), bound
 * to the code they serve (credential file name read by bell-publish.mjs, its public/ layout, the CA's deployed tree), and the
 * Caddyfile is served over loopback on a REAL publication (runMain -> publishToDir) by a declared closed-subset model of Caddy
 * (test/bell-caddy.ts). No network beyond 127.0.0.1; the test key is generated in memory. No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFileSync, readdirSync } from "node:fs";
import { request } from "node:http";
import type { Server } from "node:http";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { headersFor, parseCaddyfile, realPublication, serveCaddy, type CaddySite } from "./bell-caddy.ts";
import { BELL_TREE_PATHS, UNIT_INSTALLED } from "../scripts/verify-bell.mjs";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");
const UNIT = "deploy/monark-bell-publish.service", CADDY = "deploy/Caddyfile.monark-bell", RUNBOOK = "docs/RUNBOOK-bell.md";
// The one top-level await of this file comes BEFORE every test(): under the CI runner's --test-force-exit, a test registered before
// a pending top-level await ends the file once it passes, and the tests after the await are never registered (measured on this lot,
// oracle run 1: 3 tests silently absent from the TAP).
const PUB = await realPublication();

interface Directive { section: string; key: string; value: string }
/** systemd unit -> directives in order (comments and blank lines dropped; this unit uses no line continuation, asserted). */
function unitDirectives(text: string): { sections: string[]; list: Directive[] } {
  const sections: string[] = [], list: Directive[] = [];
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (l === "" || l.startsWith("#") || l.startsWith(";")) continue;
    assert.ok(!l.endsWith("\\"), `no line continuation: ${l}`);
    const s = /^\[(\w+)\]$/.exec(l);
    if (s !== null) { sections.push(s[1] ?? ""); continue; }
    const kv = /^([A-Za-z]+)=(.*)$/.exec(l);
    assert.ok(kv !== null, `unit line is a Key=Value directive: ${l}`);
    list.push({ section: sections[sections.length - 1] ?? "", key: kv[1] ?? "", value: kv[2] ?? "" });
  }
  return { sections, list };
}
const EXEC = "/usr/bin/env node --max-old-space-size=448 /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --inbox /var/lib/monark-bell/inbox --state /var/lib/monark-bell";
/** The CLOSED [Service] set with its pinned values (ADR D10 + "Constantes" C-7). Any added directive (EnvironmentFile, ...) reddens. */
const SERVICE: Readonly<Record<string, string>> = {
  Type: "oneshot", WorkingDirectory: "/opt/monark-bell", ExecStart: EXEC, LoadCredential: "bell-signing-key:/etc/monark/bell/signing-key.pem",
  TimeoutStartSec: "120", User: "bell", Group: "bell", NoNewPrivileges: "true", ProtectSystem: "strict", ProtectHome: "true", PrivateTmp: "true",
  ReadWritePaths: "/var/lib/monark-bell", PrivateNetwork: "yes", UMask: "0022", CPUQuota: "25%", MemoryMax: "512M", TasksMax: "32",
};

// S-7. Mutants (each red here): PrivateNetwork removed; EnvironmentFile added; ReadWritePaths=/; any cap value changed.
test("bell_deploy_config_publish_unit_least_privilege_offline", () => {
  const text = read(UNIT), { sections, list } = unitDirectives(text);
  assert.deepEqual(sections, ["Unit", "Service"], "exactly [Unit] + [Service]: no [Install] (never enabled, no timer in lot a, C-1)");
  assert.deepEqual(list.filter((d) => d.section === "Unit").map((d) => d.key), ["Description", "Documentation"], "no network-online ordering: the job is offline");
  const svc = list.filter((d) => d.section === "Service");
  assert.deepEqual(svc.map((d) => d.key).sort(), Object.keys(SERVICE).sort(), "the [Service] directive set is CLOSED (each once; no EnvironmentFile/Environment)");
  for (const d of svc) assert.equal(d.value, SERVICE[d.key], `${d.key}=${d.value} is the pinned value`);
  assert.deepEqual((svc.find((d) => d.key === "ReadWritePaths")?.value ?? "").split(/\s+/), ["/var/lib/monark-bell"], "the ONLY writable path is the state dir");
  // V8 heap strictly below MemoryMax (both MiB; systemd suffixes are base-1024): V8 fails cleanly before the cgroup OOM killer.
  const heap = Number(/--max-old-space-size=(\d+) /.exec(svc.find((d) => d.key === "ExecStart")?.value ?? "")?.[1]);
  const mem = Number(/^(\d+)M$/.exec(svc.find((d) => d.key === "MemoryMax")?.value ?? "")?.[1]);
  assert.ok(heap > 0 && heap < mem, `heap cap ${String(heap)} MiB < MemoryMax ${String(mem)} MiB, on the ExecStart line`);
  // Bindings: the credential ID is the exact file name bell-publish.mjs reads under $CREDENTIALS_DIRECTORY; the script run is in the CA's
  // deployed tree (check 11 (a)); the inbox and the state are under the only writable path.
  // The name the PUBLICATION path reads under $CREDENTIALS_DIRECTORY, in either real form: PR-1 `join(credDir, "<name>")`, PR-2
  // `publishToDir({ ..., privateKey: load("<name>") })` with `load = (name) => ... join(credDir, name)` (the rotation's second
  // credential, `newKey: load("bell-signing-key-new")`, is not the unit's).
  const pub = read("apps/bell/scripts/bell-publish.mjs"), cred = /(?:join\(credDir, |privateKey: load\()"([^"]+)"\)/.exec(pub);
  assert.ok(cred !== null && SERVICE.LoadCredential?.startsWith(`${cred[1] ?? "?"}:`), "LoadCredential ID == the file name the publisher reads");
  assert.ok(BELL_TREE_PATHS.some((p) => EXEC.includes(` /opt/monark-bell/${p} `)), "ExecStart runs a file of the deployed tree");
  assert.ok(/--inbox \/var\/lib\/monark-bell\/inbox --state \/var\/lib\/monark-bell$/.test(EXEC), "inbox + state under ReadWritePaths");
  // A committed line shaped like a `systemctl cat` file header would blur check 11 (c) (one fragment, no drop-in).
  assert.equal(text.split("\n").filter((l) => /^# \//.test(l)).length, 0, "no line of the unit starts with '# /'");
  assert.ok(UNIT_INSTALLED.endsWith("/monark-bell-publish.service"), "the CA reads the unit under its committed name");
});

const PATHS = { current: ["/state.json", "/provenance.json", "/timeline.jsonl", "/bell/pubkey.json"], immutable: [`/states/${"a".repeat(64)}.json`, `/provenance/${"b".repeat(64)}.json`] };
function siteOf(text: string): CaddySite {
  const sites = parseCaddyfile(text);
  assert.equal(sites.length, 1, "exactly one site block");
  return sites[0] as CaddySite;
}
interface Got { status: number; headers: Record<string, string | string[] | undefined> }
function get(port: number, path: string): Promise<Got> {
  return new Promise((done, fail) => {
    request({ host: "127.0.0.1", port, path, agent: false }, (res) => { res.resume(); res.on("end", () => { done({ status: res.statusCode ?? 0, headers: res.headers }); }); })
      .on("error", fail).end();
  });
}
async function withServer<T>(srv: Server, f: (port: number) => Promise<T>): Promise<T> {
  srv.listen(0, "127.0.0.1");
  await once(srv, "listening");
  const a = srv.address();
  try { return await f(a !== null && typeof a === "object" ? a.port : 0); } finally { srv.closeAllConnections(); await new Promise<void>((r) => { srv.close(() => { r(); }); }); }
}

// S-8. Mutants (each red here): `browse` added; root widened; ACAO removed.
test("bell_caddyfile_serves_public_dir_only_no_browse_cors", async () => {
  const site = siteOf(read(CADDY));
  assert.equal(site.address, "bell.monarkgate.tech");
  assert.equal(site.root, "/var/lib/monark-bell/public", "root == the publisher's public/ dir and nothing wider");
  assert.equal(site.root, `${/--state (\S+)$/.exec(EXEC)?.[1] ?? "?"}/public`, "root == <unit --state>/public (the publisher serves under join(stateDir, 'public'))");
  assert.deepEqual([...new Set(site.directives)].sort(), ["file_server", "header", "root"], "closed directive set: no reverse_proxy, no log, no auth, no rewrite");
  assert.ok(site.fileServer && !site.browse, "file_server without browse");
  for (const p of [...PATHS.current, ...PATHS.immutable]) {
    const h = headersFor(site, p), cc = h["cache-control"] ?? "";
    assert.equal(h["access-control-allow-origin"], "*", `ACAO * on ${p}`);
    assert.equal(h["x-content-type-options"], "nosniff", `nosniff on ${p}`);
    if (PATHS.immutable.includes(p)) assert.ok(/\bimmutable\b/.test(cc) && /max-age=\d+/.test(cc), `immutable cache on ${p}`);
    else assert.ok(cc === "no-cache", `no-cache (never immutable) on current ${p}`);
  }
  // Served on loopback over a REAL publication: /bell/pubkey.json by the same root (C-10), no listing, no escape from root.
  const pub = PUB;
  const st = readdirSync(`${pub.publicDir}/states`)[0] ?? "?", pv = readdirSync(`${pub.publicDir}/provenance`)[0] ?? "?";
  await withServer(serveCaddy(site, pub.publicDir), async (port) => {
    for (const p of [...PATHS.current, `/states/${st}`, `/provenance/${pv}`]) {
      const r = await get(port, p);
      assert.equal(r.status, 200, `${p} served`);
      assert.equal(r.headers["access-control-allow-origin"], "*", `${p} ACAO`);
    }
    for (const p of ["/", "/states/", "/bell/"]) assert.equal((await get(port, p)).status, 404, `${p} is not a listing`);
    for (const p of ["/../keyring.json", "/%2e%2e/timeline.jsonl"]) assert.notEqual((await get(port, p)).status, 200, `${p} does not escape root`);
  });
});

const KEY_PATH = (SERVICE.LoadCredential ?? "").slice("bell-signing-key:".length);
/** Every place `text` names the key path, as the command text between the last shell separator and the path. A prose mention in
 *  inline code (the path alone between two backticks) is not a use and is masked first. */
function keyUses(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split("`" + KEY_PATH + "`").join("`<key path>`").split("\n")) {
    for (let i = line.indexOf(KEY_PATH); i >= 0; i = line.indexOf(KEY_PATH, i + 1)) {
      const before = line.slice(0, i);
      const cut = Math.max(0, ...["&&", "||", ";", "|", "'", "`", "(", "{"].map((s) => { const j = before.lastIndexOf(s); return j < 0 ? 0 : j + s.length; }));
      out.push(before.slice(cut).trim());
    }
  }
  return out;
}
/** The only uses allowed to name the key path: generate it, stat it, test it, shred it, hand it to systemd as a credential source
 *  (read by PID 1, never displayed), or move the NEW key onto it (rotation R4). Nothing that reads, prints or copies its bytes. */
const ALLOWED_KEY_USES = [/^(?:umask 077 && )?node \S*\/bell-publish\.mjs --generate-key$/, /^stat -c "[^"]*"$/, /^shred -u$/, /^test -[fs]$/,
  /^systemd-run [^|;&]* -p LoadCredential=bell-signing-key:$/, /^mv \/etc\/monark\/bell\/signing-key-new\.pem$/];
const fenced = (text: string): string => text.split("```").filter((_, i) => i % 2 === 1).join("\n");

// S-11 hygiene (not a branching proof). Mutant: a step `cat /etc/monark/bell/signing-key.pem` (or any read of the key bytes) => red.
test("bell_runbook_never_prints_private_key", () => {
  const text = read(RUNBOOK), uses = keyUses(text);
  assert.equal(KEY_PATH, "/etc/monark/bell/signing-key.pem", "the key path is the unit's LoadCredential source");
  assert.ok(uses.some((u) => u.endsWith("--generate-key")) && uses.some((u) => u.startsWith("stat ")), `the RUNBOOK names the key where it must (${String(uses.length)} uses)`);
  for (const u of uses) assert.ok(ALLOWED_KEY_USES.some((re) => re.test(u)), `the key path is only generated, stat-ed, tested or shredded; found: '${u}'`);
  for (const bad of [`cat ${KEY_PATH}`, `ssh h 'head -c 99 ${KEY_PATH}'`, `sha256sum ${KEY_PATH}`, `xxd < ${KEY_PATH}`, `mv ${KEY_PATH} /tmp/k`, `cp ${KEY_PATH} /tmp/k`]) {
    assert.ok(keyUses(bad).some((u) => !ALLOWED_KEY_USES.some((re) => re.test(u))), `the checker reddens on: ${bad}`);
  }
  const code = fenced(text);
  assert.ok(code.length > 1000, "the RUNBOOK carries its commands in fenced blocks");
  for (const re of [/\bset\s+-[a-zA-Z]*x/, /\b(?:ba)?sh\s+-[a-zA-Z]*x\b/, /\bprintenv\b/, /CREDENTIALS_DIRECTORY/, /\/run\/credentials\//]) {
    assert.equal(re.test(code), false, `no ${String(re)} in a RUNBOOK command`);
  }
});

// S-11 bindings (A-10): the RUNBOOK ships exactly the CA's tree, closed under its local imports; it generates the key at the unit's
// LoadCredential path; its keyring command, run as written, prints the exact bytes the publisher serves at /bell/pubkey.json for the
// same key (C-9: the committed root equals the served channel) and refuses a key_id that is not the sha256 of x.
test("bell_runbook_ships_the_ca_tree_and_the_unit_key_path", () => {
  const text = read(RUNBOOK);
  const archive = /git -C \S+ archive --format=tar\.gz "\$G7" ([^|]+)\|/.exec(text);
  assert.ok(archive !== null, "the RUNBOOK ships the tree with git archive at $G7");
  assert.deepEqual((archive[1] ?? "").trim().split(/\s+/).sort(), [...BELL_TREE_PATHS].sort(), "git archive paths == the CA's BELL_TREE_PATHS");
  for (const p of BELL_TREE_PATHS) {
    for (const m of read(p).matchAll(/\bfrom\s+"(\.\/[^"]+)"/g)) assert.ok(BELL_TREE_PATHS.includes(`apps/bell/scripts/${(m[1] ?? "").slice(2)}`), `${p} imports ${String(m[1])}, shipped too`);
  }
  assert.ok(text.includes(`--generate-key ${KEY_PATH} `), "the key is generated at the unit's LoadCredential path");
  const js = /node --input-type=module -e "([^"]+)" '<x>' '<key_id>'/.exec(text)?.[1];
  assert.ok(js !== undefined, "the keyring command is in the RUNBOOK");
  const served = readFileSync(`${PUB.publicDir}/bell/pubkey.json`, "utf8"), k = (JSON.parse(served) as { keys: { key_id: string; jwk: { x: string } }[] }).keys[0];
  assert.ok(k !== undefined, "a served key");
  const run = (id: string): { status: number | null; stdout: string } => spawnSync(process.execPath, ["--input-type=module", "-e", js, k.jwk.x, id], { cwd: REPO, encoding: "utf8" });
  const good = run(k.key_id);
  assert.equal(good.status, 0, "the RUNBOOK keyring command exits 0");
  assert.equal(good.stdout, served, "RUNBOOK keyring bytes == the publisher's served /bell/pubkey.json");
  assert.equal(run("0".repeat(64)).status, 1, "a key_id that is not sha256(x) is refused");
});

