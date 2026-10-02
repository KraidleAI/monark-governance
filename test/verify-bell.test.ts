/**
 * Root tests of the Bell deployment CA scripts/verify-bell.mjs (ADR-T1b-backend v2 D11, backlog S-9; C-5, C-9). The CA runs
 * against a loopback server that applies the headers READ FROM deploy/Caddyfile.monark-bell (declared closed-subset model of
 * Caddy, test/bell-caddy.ts) over a REAL publication (two runMain runs -> publishToDir, test key generated here). The host
 * captures are written in the exact forms the RUNBOOK produces (sha256sum lines, `systemctl cat`, NeedDaemonReload). Seams (in
 * process only, never reachable from the CLI): the TLS observation (no certificate can be issued offline) and the committed-bytes
 * provider (the new deploy files are not in HEAD before the G7 commit: the worktree bytes stand for them, declared). Check 5 runs
 * a verifier through the CLI interface of backlog S-4 (`<url> --keyring <file>`): a stub here, the real bell-verify.mjs in
 * `verify_bell_ca_check5_runs_real_bell_verify`, which SKIPS BY NAME while PR-2 is not merged (never a false green).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { execFile, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, generateKeyPairSync } from "node:crypto";
import { headersFor, parseCaddyfile, realPublication, serveCaddy, type CaddySite } from "./bell-caddy.ts";
import { BELL_ROOT_REDIRECT, BELL_TREE_PATHS, CHECK_NAMES, UNIT_INSTALLED, gitBlob, runCa, type CaDeps, type CaResult } from "../scripts/verify-bell.mjs";
import { canonical, keyringOf } from "../apps/bell/scripts/bell-chain.mjs";
import { CADDY_DEDICATED } from "../scripts/verify-bell.mjs";
import { DOJO_CADDYFILE_INSTALLED } from "../scripts/dojo-deploy.mjs";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const sha = (b: string | Uint8Array): string => createHash("sha256").update(b).digest("hex");
const W = mkdtempSync(join(tmpdir(), "t1b3-ca-"));
const at = (...p: string[]): string => join(W, ...p);
const G7 = "7".repeat(40);
const CADDY_TEXT = readFileSync(join(REPO, "deploy", "Caddyfile.monark-bell"), "utf8");
const UNIT_TEXT = readFileSync(join(REPO, "deploy", "monark-bell-publish.service"), "utf8");

// ---- fixture: a real publication, the committed keyring of its key, and the host captures in their RUNBOOK forms ------------
const pub = await realPublication();
writeFileSync(at("bell-keyring.json"), pub.keyringText);
writeFileSync(at("other-keyring.json"), canonical(keyringOf(generateKeyPairSync("ed25519").privateKey, 1)) + "\n");
/** RUNBOOK step 11 capture, one directory per variant; `edit` alters ONE capture file. */
function capture(name: string, edit: (dir: string) => void = () => undefined): string {
  const d = at(name);
  mkdirSync(d);
  writeFileSync(join(d, "caddyfile-main"), CADDY_TEXT);
  writeFileSync(join(d, "systemctl-cat.txt"), `# ${UNIT_INSTALLED}\n${UNIT_TEXT}`);
  writeFileSync(join(d, "need-daemon-reload.txt"), "no\n");
  writeFileSync(join(d, "tree.sha256"), BELL_TREE_PATHS.map((p) => `${sha(readFileSync(join(REPO, p)))}  ./${p}\n`).join(""));
  edit(d);
  return d;
}
const PROBE = `${sha("synthetic env")}  /etc/monark/probe.env\n${sha("sha")}  ./DEPLOYED-SHA\n${sha("probe")}  ./probe-narabi.mjs\n`;
writeFileSync(at("probe-before.sha256"), PROBE);
writeFileSync(at("probe-after.sha256"), PROBE);
writeFileSync(at("probe-after-changed.sha256"), PROBE.replace(sha("probe"), sha("probe edited")));
/** A verifier stub honouring the CLI of PR-2 (`--url <u> --keyring <f>`; one JSON report line): records its argv, prints `status`,
 *  exits `code`. */
function stub(code: number, status: string): string {
  const f = at(`stub-verify-${String(code)}-${status}.mjs`);
  writeFileSync(f, `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(at("argv.json"))}, JSON.stringify(process.argv.slice(2)));\n`
    + `process.stdout.write(${JSON.stringify(JSON.stringify({ status }) + "\n")});\nprocess.exit(${String(code)});\n`);
  return f;
}
const STUB0 = stub(0, "consistent_with_supplied_keyring"), STUB1 = stub(1, "consistent_with_supplied_keyring"), STUB_SELF = stub(0, "self_consistent_only");
const BASE = capture("cap-base");
/** Import mode (ruling C-5): a main Caddyfile serving another site plus `imports` import lines, and the dedicated file. */
const importMode = (imports: number, dedicated: string) => (d: string): void => {
  writeFileSync(join(d, "caddyfile-main"), `other.example {\n\trespond "other"\n}\n${"\nimport /etc/caddy/monark-bell.caddyfile\n".repeat(imports)}`);
  writeFileSync(join(d, "caddyfile-dedicated"), dedicated);
};
interface Opts { keyring?: string; loaded?: string; after?: string; verifier?: string }
const argv = (url: string, o: Opts = {}): string[] => ["--url", url, "--keyring", o.keyring ?? at("bell-keyring.json"), "--g7", G7, "--tree-digests",
  join(o.loaded ?? BASE, "tree.sha256"), "--loaded-config", o.loaded ?? BASE, "--probe-digests", at("probe-before.sha256"), o.after ?? at("probe-after.sha256"),
  "--bell-verify", o.verifier ?? STUB0, "--repo", REPO];
/** In-process seams: the TLS observation and the committed bytes of <G7>:<path> (= the worktree bytes the G7 commit carries). */
const deps = (authorized = true): CaDeps => ({ tlsProbe: (host) => Promise.resolve({ host, authorized }), gitBlob: (_r, _v, p) => readFileSync(join(REPO, p)) });
const red = (r: CaResult): string[] => (r.ca === null ? ["usage"] : r.ca.checks.filter((c) => !c.ok).map((c) => c.name));
async function served<T>(caddyText: string, f: (url: string) => Promise<T>): Promise<T> {
  const site: CaddySite | undefined = parseCaddyfile(caddyText)[0];
  assert.ok(site !== undefined, "one site block");
  const srv: Server = serveCaddy(site, pub.publicDir).listen(0, "127.0.0.1");
  await once(srv, "listening");
  const a = srv.address();
  try { return await f(`http://127.0.0.1:${String(a !== null && typeof a === "object" ? a.port : 0)}`); } finally {
    srv.closeAllConnections();
    await new Promise<void>((r) => { srv.close(() => { r(); }); });
  }
}
/** G2 BELL-HOST-ROOT-1 C-1: a dedicated loopback server where `/` answers 301 with the EXACT Location and the site headers (only
 *  the status differs from the committed 302); every other path goes to the committed site served by the model, whose handler is
 *  reached through its `request` event (it never listens itself). The model and its `Redirect.code: 302` are untouched. */
async function servedRoot301<T>(f: (url: string) => Promise<T>): Promise<T> {
  const site: CaddySite | undefined = parseCaddyfile(CADDY_TEXT)[0];
  assert.ok(site !== undefined, "one site block");
  const inner = serveCaddy(site, pub.publicDir), rootHeaders = headersFor(site, "/");
  const srv: Server = createServer((req, res) => {
    if ((req.url ?? "/").split("?")[0] === "/") { res.writeHead(301, { ...rootHeaders, location: BELL_ROOT_REDIRECT }); res.end(); return; }
    inner.emit("request", req, res);
  }).listen(0, "127.0.0.1");
  await once(srv, "listening");
  const a = srv.address();
  try { return await f(`http://127.0.0.1:${String(a !== null && typeof a === "object" ? a.port : 0)}`); } finally {
    srv.closeAllConnections();
    await new Promise<void>((r) => { srv.close(() => { r(); }); });
  }
}
/** Rewrite ONE served file for the duration of `f` (restored byte-exact after). */
async function withServedFile<T>(rel: string, content: string | null, f: () => Promise<T>): Promise<T> {
  const p = join(pub.publicDir, rel), before = existsSync(p) ? readFileSync(p) : null;
  if (content === null) rmSync(p); else writeFileSync(p, content);
  try { return await f(); } finally { if (before === null) rmSync(p, { force: true }); else writeFileSync(p, before); }
}
const reschema = (rel: string): string => { const o = JSON.parse(readFileSync(join(pub.publicDir, rel), "utf8")) as Record<string, unknown>; o.schema = "not-bell"; return canonical(o) + "\n"; };

// S-9. Each of the 12 checks, put ALONE in failure over loopback, turns the CA red on EXACTLY that named check with exit code 1;
// the untouched publication is 12/12 green with exit 0. Mutants (each red here): check 11 or 12 removed; installed unit body not
// compared; drop-in not detected; NeedDaemonReload not read; exit 0 on failure; c07 accepting a 301 on `/`, or not reading its
// status (G2 BELL-HOST-ROOT-1 C-1).
test("verify_bell_ca_checks_named_and_fail_closed", async () => {
  const cases: { target: string; why?: string; run: () => Promise<CaResult> }[] = [];
  const onCaddy = (text: string, o: Opts = {}, d: CaDeps = deps()) => (): Promise<CaResult> => served(text, (u) => runCa(argv(u, o), d));
  const onFile = (rel: string, content: string | null) => (): Promise<CaResult> => withServedFile(rel, content, onCaddy(CADDY_TEXT));
  const stateBad = reschema("state.json");
  cases.push({ target: "c01_state_json", run: () => withServedFile(`states/${sha(stateBad)}.json`, stateBad, onFile("state.json", stateBad)) });
  const tl = readFileSync(join(pub.publicDir, "timeline.jsonl"), "utf8").split("\n");
  cases.push({ target: "c02_timeline_jsonl", run: onFile("timeline.jsonl", tl.map((l, i) => (i === tl.length - 2 ? l.replace('"schema":"bell-timeline-v1"', '"schema":"x"') : l)).join("\n")) });
  cases.push({ target: "c03_pubkey_equals_committed_keyring", run: onCaddy(CADDY_TEXT, { keyring: at("other-keyring.json") }) });
  cases.push({ target: "c04_provenance_json", run: onFile("provenance.json", reschema("provenance.json")) });
  cases.push({ target: "c05_bell_verify_keyring_root", run: onCaddy(CADDY_TEXT, { verifier: STUB1 }) });
  cases.push({ target: "c05_bell_verify_keyring_root", why: "exit 0 but self_consistent_only", run: onCaddy(CADDY_TEXT, { verifier: STUB_SELF }) });
  cases.push({ target: "c06_acao_star", run: onCaddy(CADDY_TEXT.replace(/^\theader Access-Control-Allow-Origin.*\n/m, "")) });
  cases.push({ target: "c07_no_directory_listing", run: onCaddy(CADDY_TEXT.replace(/^\tfile_server$/m, "\tfile_server browse")) });
  cases.push({ target: "c07_no_directory_listing", why: "redir removed: / is a 404", run: onCaddy(CADDY_TEXT.replace(/^\tredir .*\n/m, "")) });
  cases.push({ target: "c07_no_directory_listing", why: "/ redirected elsewhere", run: onCaddy(CADDY_TEXT.replace("https://monarkgate.tech/bell 302", "https://example.com/bell 302")) });
  cases.push({ target: "c07_no_directory_listing", why: "C-1: / answers 301 with the exact Location, the 302 is required", run: () => servedRoot301((u) => runCa(argv(u), deps())) });
  cases.push({ target: "c08_cache_immutable_states_no_cache_current", run: onCaddy(CADDY_TEXT.replace("public, max-age=31536000, immutable", "no-cache")) });
  cases.push({ target: "c08_cache_immutable_states_no_cache_current", why: "immutable on the current files",
    run: onCaddy(CADDY_TEXT.replace('Cache-Control "no-cache"', 'Cache-Control "no-cache, immutable"')) });
  cases.push({ target: "c09_tls_authorized", run: onCaddy(CADDY_TEXT, {}, deps(false)) });
  cases.push({ target: "c10_no_private_material_served", run: onFile("signing-key.pem", `-----BEGIN ${"PRIVATE"} KEY-----\n`) });
  const provPem = (): string => {
    const o = JSON.parse(readFileSync(join(pub.publicDir, "provenance.json"), "utf8")) as Record<string, unknown>;
    o.note = `-----BEGIN ${"PRIVATE"} KEY-----`;
    return canonical(o) + "\n";
  };
  cases.push({ target: "c10_no_private_material_served", why: "private shape inside served provenance.json", run: onFile("provenance.json", provPem()) });
  // G2 PR-3 C-2, probe cases P1..P3 of the reviewer (F:/tmp/g2-t1b-pr3/probe/); P4/P5 = the import-mode cases below and above.
  const provJwkD = (): string => {
    const o = JSON.parse(readFileSync(join(pub.publicDir, "provenance.json"), "utf8")) as Record<string, unknown>;
    o.leak = { d: "A".repeat(43) };
    return canonical(o) + "\n";
  };
  cases.push({ target: "c10_no_private_material_served", why: "P1 private JWK member d in served provenance.json", run: onFile("provenance.json", provJwkD()) });
  const krUse = ((): string => {
    const kr = JSON.parse(pub.keyringText) as { keys: { jwk: Record<string, string> }[] };
    const k0 = kr.keys[0];
    assert.ok(k0 !== undefined, "a keyring entry");
    k0.jwk.use = "sig";
    return canonical(kr) + "\n";
  })();
  writeFileSync(at("keyring-use.json"), krUse);
  cases.push({ target: "c10_no_private_material_served", why: "P2 non-public JWK member in the served AND committed keyring (c03 stays green)",
    run: () => withServedFile("bell/pubkey.json", krUse, onCaddy(CADDY_TEXT, { keyring: at("keyring-use.json") })) });
  const c11: [string, (d: string) => void][] = [
    ["tree digest differs", (d) => { writeFileSync(join(d, "tree.sha256"), readFileSync(join(d, "tree.sha256"), "utf8").replace(/^[0-9a-f]/, (c) => (c === "0" ? "1" : "0"))); }],
    ["loaded Caddyfile differs", (d) => { writeFileSync(join(d, "caddyfile-main"), CADDY_TEXT.replace("no-cache", "no-store")); }],
    ["installed unit copied then modified", (d) => { writeFileSync(join(d, "systemctl-cat.txt"), `# ${UNIT_INSTALLED}\n${UNIT_TEXT.replace("PrivateNetwork=yes", "PrivateNetwork=no")}`); }],
    ["drop-in present", (d) => { writeFileSync(join(d, "systemctl-cat.txt"), `# ${UNIT_INSTALLED}\n${UNIT_TEXT}\n# ${UNIT_INSTALLED}.d/override.conf\n[Service]\nPrivateNetwork=no\n`); }],
    ["NeedDaemonReload=yes", (d) => { writeFileSync(join(d, "need-daemon-reload.txt"), "yes\n"); }],
    ["unit header not on line 1", (d) => { writeFileSync(join(d, "systemctl-cat.txt"), `\n# ${UNIT_INSTALLED}\n${UNIT_TEXT}`); }],
    ["P3 extra file in the deployed tree", (d) => { writeFileSync(join(d, "tree.sha256"), readFileSync(join(d, "tree.sha256"), "utf8") + `${sha("x")}  ./apps/bell/scripts/extra.mjs\n`); }],
    ["import mode: two import lines", importMode(2, CADDY_TEXT)],
    ["import mode: dedicated file differs", importMode(1, CADDY_TEXT.replace("no-cache", "no-store"))],
  ];
  c11.forEach(([why, edit], i) => { cases.push({ target: "c11_loaded_config_equals_g7", why, run: onCaddy(CADDY_TEXT, { loaded: capture(`cap-${String(i)}`, edit) }) }); });
  cases.push({ target: "c12_probe_untouched", run: onCaddy(CADDY_TEXT, { after: at("probe-after-changed.sha256") }) });

  const ok = await onCaddy(CADDY_TEXT)();
  assert.deepEqual(ok.ca?.checks.map((c) => c.name), [...CHECK_NAMES], "twelve checks, named, in order");
  assert.deepEqual(red(ok), [], `baseline: every check passes (${JSON.stringify(ok.ca?.checks.filter((c) => !c.ok))})`);
  assert.equal(ok.code, 0, "baseline exit 0");
  assert.deepEqual(JSON.parse(readFileSync(at("argv.json"), "utf8")), ["--url", ok.ca?.url, "--keyring", at("bell-keyring.json")],
    "check 5 calls the verifier CLI as `--url <url> --keyring <committed keyring>` (PR-2 runVerifyCli, C-9 root)");
  const imp = await onCaddy(CADDY_TEXT, { loaded: capture("cap-import-ok", importMode(1, CADDY_TEXT)) })();
  assert.deepEqual(red(imp), [], `import mode (one import line, dedicated == G7) passes: ${JSON.stringify(imp.ca?.checks.find((c) => c.name === "c11_loaded_config_equals_g7"))}`);
  assert.equal(new Set(cases.map((c) => c.target)).size, CHECK_NAMES.length, "every check has at least one isolated fault");
  for (const c of cases) {
    const r = await c.run();
    const label = `${c.target}${c.why === undefined ? "" : ` (${c.why})`}`;
    assert.deepEqual(red(r), [c.target], `fault on ${label}: the red set is exactly that check`);
    assert.equal(r.code, 1, `fault on ${label}: exit 1`);
  }
});

// The CLI with NO seam on an http target: TLS is skipped, check 9 is red, the exit code is 1 and "VERIFY OK" is never printed
// (backlog S-9: tls.skipped never satisfies the go-live). Mutant: a skipped TLS counted as passed => red.
test("verify_bell_ca_cli_http_target_is_never_verify_ok", async () => {
  const r = await served(CADDY_TEXT, (u) => new Promise<{ code: number | null; stdout: string; stderr: string }>((done) => {
    execFile(process.execPath, [join(REPO, "scripts", "verify-bell.mjs"), ...argv(u)], { encoding: "utf8", timeout: 120000 }, (e, stdout, stderr) => {
      done({ code: e === null ? 0 : typeof e.code === "number" ? e.code : null, stdout, stderr });
    });
  }));
  const ca = JSON.parse(r.stdout) as { tls: { skipped?: boolean }; checks: { name: string; ok: boolean }[] };
  assert.equal(ca.tls.skipped, true, "http target: TLS skipped");
  assert.ok(ca.checks.some((c) => c.name === "c09_tls_authorized" && !c.ok), "check 9 red when TLS is skipped");
  assert.equal(r.code, 1, "exit 1");
  assert.ok(r.stderr.includes("VERIFY FAILED") && r.stderr.includes("c09_tls_authorized") && !r.stderr.includes("VERIFY OK"), r.stderr.slice(0, 300));
});

// The committed-bytes provider of the CLI reads GIT OBJECTS at the given revision, never the working tree: a throwaway repository
// (git init + add + write-tree: a tree object, no commit, no ref) whose working file then changes. Mutant: gitBlob reading the
// working tree => red.
test("verify_bell_git_blob_reads_committed_bytes", () => {
  const d = at("git-probe");
  mkdirSync(d);
  const git = (...a: string[]): string => execFileSync("git", ["-C", d, ...a], { encoding: "utf8" }).trim();
  git("init", "-q");
  writeFileSync(join(d, "unit.service"), "committed bytes");
  git("add", "unit.service");
  const tree = git("write-tree");
  writeFileSync(join(d, "unit.service"), "working-tree bytes");
  assert.equal(gitBlob(d, tree, "unit.service").toString("utf8"), "committed bytes", "git cat-file blob <rev>:<path> == the recorded bytes, not the working file");
  assert.throws(() => gitBlob(d, tree, "absent.service"), "an absent path is an error, never an empty blob");
});

// Check 5 through the REAL verifier of PR-2 (backlog S-4 CLI): the untouched publication verifies against the committed keyring;
// a keyring that does not hold the signing key is refused (C-9: the root is --keyring, never the served key). Skipped BY NAME
// while apps/bell/scripts/bell-verify.mjs is absent from this tree (PR-2 is merged before the G7).
const VERIFY = join(REPO, "apps", "bell", "scripts", "bell-verify.mjs");
test("verify_bell_ca_check5_runs_real_bell_verify", { skip: existsSync(VERIFY) ? false : "PR-2 not merged: apps/bell/scripts/bell-verify.mjs absent (T-1b S-4)" }, async () => {
  const c5 = (r: CaResult): boolean | undefined => r.ca?.checks.find((c) => c.name === "c05_bell_verify_keyring_root")?.ok;
  const good = await served(CADDY_TEXT, (u) => runCa(argv(u, { verifier: VERIFY }), deps()));
  assert.equal(c5(good), true, `real verifier, committed keyring: ${JSON.stringify(good.ca?.checks.find((c) => c.name === "c05_bell_verify_keyring_root"))}`);
  const wrongRoot = await served(CADDY_TEXT, (u) => runCa(argv(u, { verifier: VERIFY, keyring: at("other-keyring.json") }), deps()));
  assert.equal(c5(wrongRoot), false, "a keyring without the signing key is refused (trust root = --keyring)");
  const tl = readFileSync(join(pub.publicDir, "timeline.jsonl"), "utf8");
  const tampered = await withServedFile("timeline.jsonl", tl.replace(/"seq":1,/, '"seq":1,"x":0,'), () => served(CADDY_TEXT, (u) => runCa(argv(u, { verifier: VERIFY }), deps())));
  assert.equal(c5(tampered), false, "a tampered line is refused");
});

// Lot BELL-CA-DOJO-1 (ADR-DOJO-PR-3 E-2, act A-6): in import mode, check 11 (b) accepts the main Caddyfile's import lines as {Bell} or
// {Bell, Dojo} in either order, each at most once, no other line, Bell's dedicated file being the G7 blob; the Dojo file is never read by
// Bell's CA. One fresh capture per case (RUNBOOK step 11 forms) over the same loopback publication; a refusal is red on c11 ALONE.
// killer: scripts/verify-bell.mjs:207 CONST "imports.includes(closed[0])" -> "true"
// killer: scripts/verify-bell.mjs:207 CONST "new Set(imports).size === imports.length" -> "true"
// killer: scripts/verify-bell.mjs:208 CONST "ded.equals(caddyBlob)" -> "true"
// killer: scripts/verify-bell.mjs:208 CONST " && importsOk)" -> ")"
// killer: scripts/verify-bell.mjs:207 CONST "imports.every(" -> "imports.slice(0, 2).every("
test("verify_bell_ca_check11_accepts_the_closed_import_set", async () => {
  const LF = String.fromCharCode(10), B = `import ${CADDY_DEDICATED}`, D = `import ${DOJO_CADDYFILE_INSTALLED}`;
  const X = "import /etc/caddy/other.caddyfile", DIFFERS = CADDY_TEXT.replace("no-cache", "no-store");
  let n = 0;
  const main = (lines: string[], dedicated: string) => (d: string): void => {
    writeFileSync(join(d, "caddyfile-main"), lines.map((l) => l + LF).join(""));
    writeFileSync(join(d, "caddyfile-dedicated"), dedicated);
  };
  const run = (lines: string[], dedicated = CADDY_TEXT): Promise<CaResult> =>
    served(CADDY_TEXT, (u) => runCa(argv(u, { loaded: capture(`cap-set-${String(n++)}`, main(lines, dedicated)) }), deps()));
  const c11 = (r: CaResult): string => JSON.stringify(r.ca?.checks.find((c) => c.name === "c11_loaded_config_equals_g7"));
  for (const lines of [[B, D], [B], [D, B]]) {
    const r = await run(lines);
    assert.deepEqual(red(r), [], `accepted, ${lines.join(" + ")}: no red check (${c11(r)})`);
    assert.equal(r.code, 0, `accepted, ${lines.join(" + ")}: exit 0`);
  }
  const refused: [string, string[], string?][] = [["a third import line", [B, D, X]], ["an import of another file", [B, X]],
    ["another file alone", [X]], ["the Dojo line without Bell's", [D]], ["Bell's line twice", [B, B]], ["the Dojo line twice", [B, D, D]],
    ["both lines, the dedicated file differs from the G7 blob", [B, D], DIFFERS]];
  for (const [why, lines, dedicated] of refused) {
    const r = await run(lines, dedicated);
    assert.deepEqual(red(r), ["c11_loaded_config_equals_g7"], `refused, ${why}: the red set is exactly c11 (${c11(r)})`);
    assert.equal(r.code, 1, `refused, ${why}: exit 1`);
  }
});
