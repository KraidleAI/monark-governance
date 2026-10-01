/**
 * Root tests of the Dojo publication deployment (PR-3b-2a; ADR-DOJO-PR-3, pli G0 of PR-3b-2: PB-2, PB-3, PB-4 TU-4, PB-5, PB-6
 * T-A1 to T-A11; mere ADR-DOJO-SNAPSHOT-1 T-10). Governance-only: deploy/, docs/ and apps/dojo are not exported. The COMMITTED
 * publish unit, its timer and the host's Caddy extract are parsed and pinned (closed directive sets), bound to the code they run
 * (the publisher's credential name, its import closure, its environment reads, its closed list of refusals) and to the acts of
 * docs/RUNBOOK-dojo.md. T-A7 replays the argv of BOTH units without systemd: the collect unit's REAL --tick over the simulated chain
 * of PR-2-2, then the job of RUNBOOK 18 (iv) (--history, a packet of the REAL writer of PR-2b) and the publish unit's argv, each in a
 * child under the unit's closed environment, then the verifier's public CLI under the
 * keyring that the RUNBOOK's act A-4p commits. Keys and seeds are made at run time by the trees' own tools: no key, no seed and no
 * network in this file (the simulated chain traps sockets and name lookups). Each test first asserts the new exports of
 * scripts/dojo-deploy.mjs (F2P). No backslash in this file (character classes only); no `any`.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ENV as SIM_ENV, MINT, POOL, PYTH, QUOTE_VAULT, ROWS, sim } from "../apps/dojo/test/helpers/collect-chain.ts";
import { ANCHOR_DAY, DAY1, anchorBody, betaOf, dateOf } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { historyBundle } from "../apps/dojo/src/history-build.ts";
import { DOJO_HISTORY_CREATION as SIG0 } from "../apps/dojo/src/history-read.ts";
import { ANCHOR_KEYS, DOJO_PUBLISH_REFUSALS } from "../apps/dojo/scripts/dojo-publish.mjs";
import { READ_RULE } from "../apps/dojo/src/dojo-methods.ts";
import { headersFor, parseCaddyfile, type CaddySite } from "./bell-caddy.ts";
import * as D from "../scripts/dojo-deploy.mjs";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const LF = String.fromCharCode(10), BS = String.fromCharCode(92), RUNBOOK = "docs/RUNBOOK-dojo.md";
const roots: string[] = [];
after(() => { for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true }); });
/** DOJO-VERIFY-SCALE-1 (G1 journal of PR-3b-2a; the dated line proposed to the orchestrator): heap (MiB), MemoryMax, start timeout (s). */
const SCALE = { heap: 448, memoryMax: "512M", timeout: "2900" } as const;
/** The retained guard of FAITS-SYSTEMD-PUBLISH-1 F-2, verbatim: the names the manager's block must not hand to the key's process. */
const UNSET = ["NODE_OPTIONS", "NODE_TLS_REJECT_UNAUTHORIZED", "NODE_EXTRA_CA_CERTS", "SSL_CERT_FILE", "SSL_CERT_DIR", "HTTP_PROXY",
  "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY", "http_proxy", "https_proxy", "all_proxy", "no_proxy"];
const NEW = ["DOJO_PUBLISH_TREE_ROOT", "DOJO_PUBLISH_TREE_PROGRAMS", "DOJO_PUBLISH_TREE_PATHS", "DOJO_PUBLISH_UNIT", "DOJO_PUBLISH_TIMER",
  "DOJO_SIGNING_KEY_SOURCE", "DOJO_HANDOFF_GROUP", "DOJO_CADDYFILE", "DOJO_CADDYFILE_INSTALLED"];
/** F2P (PB-6 "Forme"): every new export of scripts/dojo-deploy.mjs exists; the base of the lot lacks them: an assertion, never ENOENT. */
function exists(): void {
  const d = new Map<string, unknown>(Object.entries(D));
  for (const k of NEW) assert.ok(d.get(k) !== undefined, `scripts/dojo-deploy.mjs exports ${k}`);
}

interface Directive { section: string; key: string; value: string }
/** systemd unit -> directives in order (comments and blank lines dropped; a line continuation is refused). */
function unitOf(rel: string): { sections: string[]; list: Directive[] } {
  const sections: string[] = [], list: Directive[] = [];
  for (const line of read(rel).split(LF)) {
    const l = line.trim(), i = l.indexOf("=");
    if (l === "" || l.startsWith("#") || l.startsWith(";")) continue;
    assert.ok(!l.endsWith(BS), `no line continuation: ${l}`);
    if (l.startsWith("[") && l.endsWith("]")) { sections.push(l.slice(1, -1)); continue; }
    assert.ok(i > 0 && /^[A-Za-z]+$/.test(l.slice(0, i)), `a Key=Value directive: ${l}`);
    list.push({ section: sections.at(-1) ?? "", key: l.slice(0, i), value: l.slice(i + 1) });
  }
  return { sections, list };
}
const inSection = (list: readonly Directive[], s: string): Directive[] => list.filter((d) => d.section === s);
const service = (rel: string): Directive[] => inSection(unitOf(rel).list, "Service");
const one = (list: readonly Directive[], key: string): string => {
  const v = list.filter((d) => d.key === key);
  assert.equal(v.length, 1, key);
  return v[0]?.value ?? "";
};
const words = (list: readonly Directive[], key: string): string[] => list.filter((d) => d.key === key).flatMap((d) => d.value.split(" "));
function closedSet(got: readonly Directive[], want: Readonly<Record<string, string>>, what: string): void {
  assert.deepEqual(got.map((d) => d.key).sort(), Object.keys(want).sort(), `${what}: the directive set is CLOSED (each once)`);
  for (const d of got) assert.equal(d.value, want[d.key], `${what}: ${d.key}=${d.value} is the pinned value`);
}
/** Path p is `dir` or under it (segment-aware). */
const under = (p: string, dir: string): boolean => p === dir || p.startsWith(`${dir}/`);
const treeCode = (): string[] => D.DOJO_PUBLISH_TREE_PATHS.filter((p) => /[.](ts|mjs)$/.test(p));
/** The code lines of a module: its comment lines dropped (a line starting with //, /* or *). */
const codeOf = (rel: string): string => read(rel).split(LF).filter((l) => !/^[ ]*([/][/]|[/][*]|[*])/.test(l)).join(LF);
/** Section n of the RUNBOOK, from its "## n." heading to the next heading of that level; `flat`: its lines joined by spaces. */
function sectionOf(n: number, flat = false): string {
  const t = read(RUNBOOK), a = t.indexOf(`${LF}## ${String(n)}. `), b = t.indexOf(`${LF}## `, a + 1), s = t.slice(a, b < 0 ? undefined : b);
  assert.ok(a >= 0, `RUNBOOK section ${String(n)}`);
  return flat ? s.split(LF).join(" ") : s;
}
const fenced = (t: string): string[] => t.split("```").filter((_, i) => i % 2 === 1);

/** The [Service] of the publish unit (PB-2, PB-3, FAITS-SYSTEMD-PUBLISH-1 F-1, F-2, F-5), every value pinned. */
function SERVICE(): Readonly<Record<string, string>> {
  const exec = `/usr/bin/env node --max-old-space-size=${String(SCALE.heap)} ${D.DOJO_PUBLISH_TREE_ROOT}/${D.DOJO_PUBLISH_TREE_PROGRAMS[0] ?? "?"}`
    + ` --inbox ${D.DOJO_COLLECT_STATE}/bundles --state ${D.DOJO_PUBLISH_STATE}`;
  return { Type: "oneshot", WorkingDirectory: D.DOJO_PUBLISH_TREE_ROOT, User: "dojo", Group: "dojo", SupplementaryGroups: D.DOJO_HANDOFF_GROUP,
    LoadCredential: `${D.DOJO_SIGNING_CREDENTIAL}:${D.DOJO_SIGNING_KEY_SOURCE}`, ExecStart: exec, TimeoutStartSec: SCALE.timeout,
    UnsetEnvironment: UNSET.join(" "), NoNewPrivileges: "true", ProtectSystem: "strict", ProtectHome: "true", PrivateTmp: "true",
    ReadWritePaths: D.DOJO_PUBLISH_STATE, ReadOnlyPaths: `${D.DOJO_COLLECT_STATE}/bundles`,
    InaccessiblePaths: [posix.dirname(D.DOJO_SEED_SOURCE), D.DOJO_COLLECT_ENV_FILE, `${D.DOJO_COLLECT_STATE}/ledger`].join(" "),
    PrivateNetwork: "yes", UMask: "0022", CPUQuota: "25%", MemoryMax: SCALE.memoryMax, TasksMax: "32" };
}

// killer: deploy/monark-dojo-publish.service:52 CONST "PrivateNetwork=yes" -> "PrivateNetwork=no"
test("dojo_unit_is_offline_and_loads_its_own_credential", () => {
  exists();
  const { sections, list } = unitOf(D.DOJO_PUBLISH_UNIT), svc = inSection(list, "Service");
  assert.deepEqual(sections, ["Unit", "Service"], "no [Install]: the timer starts the unit (A-10 enables the timer only)");
  assert.deepEqual(inSection(list, "Unit").map((d) => d.key).sort(), ["Description", "Documentation"], "no network-online ordering");
  closedSet(svc, SERVICE(), "[Service]");
  // M-H1: ONE credential, the name the publisher reads under $CREDENTIALS_DIRECTORY, from the Dojo key directory, never Bell's.
  const code = read(D.DOJO_PUBLISH_TREE_PROGRAMS[0] ?? "?");
  assert.ok(code.includes(`const KEY = "${D.DOJO_SIGNING_CREDENTIAL}";`) && code.includes("load(KEY)"), "the publisher loads this name");
  assert.ok(under(D.DOJO_SIGNING_KEY_SOURCE, D.DOJO_SIGNING_KEY_DIR) && !D.DOJO_SIGNING_KEY_SOURCE.includes("/bell/"), "the Dojo key");
  // M-H2: offline twice: a private network namespace (above) and a tree whose code holds no network module (T-8 of PR-3a-1c).
  const NET = [/fetch[ ]*[(]/, /node:https?/, /node:(net|tls|dns|dgram|http2)/, /undici/, /child_process/, /WebSocket/];
  assert.deepEqual(treeCode().filter((p) => NET.some((re) => re.test(read(p)))), [], "no network code in the publication tree");
  assert.ok(SCALE.memoryMax.endsWith("M") && SCALE.heap < Number(SCALE.memoryMax.slice(0, -1)), "V8 heap below MemoryMax (MiB)");
  // A-8: the RUNBOOK's transient job runs as the unit's user, each of its -p K=V the unit's own (PrivateNetwork=yes included).
  const job = (fenced(sectionOf(16)).find((c) => c.includes("systemd-run")) ?? "").split(LF).join(" ");
  const props = [...job.matchAll(/-p ([A-Za-z]+)=([^ "]+)/g)].map((m): [string, string] => [m[1] ?? "", m[2] ?? ""]);
  assert.ok(job.includes("--uid=dojo --gid=dojo") && props.length === 8, "the A-8 job, its user and its eight properties");
  for (const [k, v] of props) assert.equal(v, one(svc, k), `A-8 job: -p ${k}=${v} is the unit's ${k}`);
});

// killer: deploy/monark-dojo-publish.timer:14 CONST "00:30:00" -> "00:10:00"
test("dojo_publish_timer_runs_after_the_close", () => {
  exists();
  const { sections, list } = unitOf(D.DOJO_PUBLISH_TIMER), tm = inSection(list, "Timer");
  assert.deepEqual(sections, ["Unit", "Timer", "Install"]);
  closedSet(tm.filter((d) => d.key !== "OnCalendar"), { AccuracySec: "1s", RandomizedDelaySec: "0", Persistent: "true",
    Unit: posix.basename(D.DOJO_PUBLISH_UNIT) }, "[Timer]");
  closedSet(inSection(list, "Install"), { WantedBy: "timers.target" }, "[Install]");
  const slots = tm.filter((d) => d.key === "OnCalendar").map((d) => {
    const m = /^[*]-[*]-[*] ([0-9]{2}):([0-9]{2}):00 UTC$/.exec(d.value);
    assert.ok(m !== null, `one slot per expression, in UTC (never a comma list: note C-2 of the sentinel): ${d.value}`);
    return 3600 * Number(m[1]) + 60 * Number(m[2]);
  });
  assert.deepEqual(slots, [1800, 5400, 12600, 23400], "four slots: 00:30, 01:30, 03:30 and 06:30 UTC (PB-2)");
  // The close of day d (ADR D-5 l.110): the collector's first step at or after T_{d+1} + read_offset_s, at most AccuracySec late.
  const ct = inSection(unitOf(D.DOJO_COLLECT_TIMER).list, "Timer"), acc = Number(/^([0-9]+)s$/.exec(one(ct, "AccuracySec"))?.[1]);
  const step = 60 * Number(/[/]([0-9]+):00 UTC$/.exec(one(ct, "OnCalendar"))?.[1]), close = Math.ceil(READ_RULE.read_offset_s / step) * step + acc;
  assert.equal(close, 901, "the close of d starts by 00:15:01 UTC of d + 1 (5-minute steps, 1 s of accuracy)");
  assert.ok(slots.every((s) => s > close), "every slot after the close");
  assert.equal((slots[0] ?? 0) - close, 899, "the first slot 899 s after it; the later ones publish a day whose close ran long");
});

// killer: deploy/Caddyfile.monark-dojo:22 CONST " /history/*" -> ""
test("dojo_caddyfile_serves_public_only_immutables_no_browse", () => {
  exists();
  const text = read(D.DOJO_CADDYFILE), code = text.split(LF).filter((l) => !l.trim().startsWith("#")).join(LF);
  let sites: CaddySite[] = [];
  assert.doesNotThrow(() => { sites = parseCaddyfile(text); }, "the extract lies in the closed subset of test/bell-caddy.ts");
  assert.equal(sites.length, 1, "ONE site block: no http:// nor :80 site beside it");
  const site = sites[0] as CaddySite;
  assert.equal(site.address, "dojo.monarkgate.tech", "the one name, served over HTTPS by the automatic certificate of a public CA");
  assert.equal(site.root, `${D.DOJO_PUBLISH_STATE}/public`, "root = the publisher's public/; its state lies beside it (M-E9)");
  assert.deepEqual([...new Set(site.directives)].sort(), ["file_server", "header", "root"], "closed directive set (M-H18)");
  assert.ok(site.fileServer && !site.browse && site.redirect === null, "no listing; / answers 404, no redirect before the page");
  for (const bad of ["reverse_proxy", "tls", "http://", ":80", "redir", "browse", "log"]) assert.ok(!code.includes(bad), `no ${bad}`);
  const LN = `/lines/${"a".repeat(64)}.jsonl`, HI = `/history/${"b".repeat(64)}.jsonl`;
  for (const p of ["/timeline.jsonl", "/dojo/pubkey.json", LN, HI, "/"]) {
    const h = headersFor(site, p);
    assert.deepEqual([h["access-control-allow-origin"], h["x-content-type-options"]], ["*", "nosniff"], `ACAO * and nosniff on ${p}`);
    assert.equal(h["cache-control"], p === LN || p === HI ? "public, max-age=31536000, immutable" : "no-cache", `c06 on ${p} (M-H11)`);
  }
  // The guards of the site proxy F3 (PR-4c-1b) seen from this side: (i) F3 relays to this one name and sets Host to it; (ii) it checks
  // TLS (no tls_insecure_* option); (iii) it sets no-store on its own path.
  const f3 = read("deploy/Caddyfile.monark-dojo-site.snippet").split(LF).filter((l) => !l.trim().startsWith("#")).join(LF);
  assert.ok(f3.includes(`reverse_proxy https://${site.address} {`) && f3.includes("header_up Host {upstream_hostport}"), "(i) the name");
  assert.ok(!f3.includes("tls_insecure") && f3.includes(`header_down Cache-Control "no-store"`), "(ii) TLS checked, (iii) no-store");
});

// killer: deploy/monark-dojo-publish.service:48 CONST "ReadOnlyPaths=/var/lib/monark-dojo-collect/bundles" -> "ReadOnlyPaths=/var/lib/monark-dojo-collect"
test("dojo_two_units_share_no_writable_path", () => {
  exists();
  const pub = service(D.DOJO_PUBLISH_UNIT), col = service(D.DOJO_COLLECT_UNIT), bundles = `${D.DOJO_COLLECT_STATE}/bundles`;
  assert.deepEqual([one(pub, "User"), one(col, "User")], ["dojo", "dojo-collect"], "two users");
  const [wp, wc] = [words(pub, "ReadWritePaths"), words(col, "ReadWritePaths")];
  assert.deepEqual([wp, wc], [[D.DOJO_PUBLISH_STATE], [D.DOJO_COLLECT_STATE]], "one writable path each: its own state");
  for (const a of wp) for (const b of wc) assert.ok(!under(a, b) && !under(b, a), `no writable path shared: ${a} and ${b}`);
  // M-H13: the publisher reads the collect side through bundles/ alone (its --inbox), through the group the unit declares (A-2p makes
  // the membership); the collect credential sources, its EnvironmentFile (the Helius key) and its ledger are inaccessible to it.
  assert.deepEqual([words(pub, "ReadOnlyPaths"), one(pub, "ExecStart").split(" ")[5]], [[bundles], bundles], "read-only: bundles/, the inbox");
  const hidden = words(pub, "InaccessiblePaths");
  assert.deepEqual(hidden, [posix.dirname(D.DOJO_SEED_SOURCE), D.DOJO_COLLECT_ENV_FILE, `${D.DOJO_COLLECT_STATE}/ledger`]);
  for (const s of [D.DOJO_SEED_SOURCE, D.DOJO_ANCHOR_SOURCE, D.DOJO_COLLECT_ENV_FILE]) assert.ok(hidden.some((p) => under(s, p)), `${s} hidden`);
  assert.equal(one(pub, "SupplementaryGroups"), D.DOJO_HANDOFF_GROUP, "the handoff group, declared by the unit");
  assert.ok(read(RUNBOOK).includes(`--groups ${D.DOJO_HANDOFF_GROUP} dojo`), "...and made at A-2p (FAITS-SYSTEMD-PUBLISH-1 F-1: both)");
  // The collect unit, symmetric: the publication's key directory inaccessible, no path into the publication at all.
  assert.deepEqual(words(col, "InaccessiblePaths"), [D.DOJO_SIGNING_KEY_DIR], "the collect unit masks the key directory");
  assert.deepEqual(col.filter((d) => /^(ReadOnlyPaths|BindPaths|BindReadOnlyPaths)$/.test(d.key)), [], "no read path into the publication");
  // A day's evidence/ is the collector's own (0700): the layout reader reads what publish/SHA256SUMS enumerates, never evidence/.
  // A key name such as evidence_sha256sums_sha256 (the history manifest's closed keys, PR-3a-2) is not a path: the word alone counts.
  const namesEvidence = (p: string): boolean => /evidence(?![_A-Za-z0-9])/.test(codeOf(p));
  assert.deepEqual(treeCode().filter(namesEvidence), [], "no module of the publication tree names evidence/");
});

// killer: scripts/dojo-deploy.mjs:52 CONST "apps/dojo/src/layout.ts" -> "apps/dojo/src/layout.js"
test("dojo_publish_tree_is_the_import_closure", () => {
  exists();
  const entry = one(service(D.DOJO_PUBLISH_UNIT), "ExecStart").split(" ")[3]?.slice(D.DOJO_PUBLISH_TREE_ROOT.length + 1) ?? "?";
  assert.deepEqual(D.DOJO_PUBLISH_TREE_PROGRAMS, [entry], "one program: the unit's script (act A-4p and act A-8 run it too)");
  const IMPORT = /^[ ]*(?:import|export)[ ]+(?!type[ ])(?:[^'";]*?[ ]from[ ]*)?["']([^"']+)["']/gm; // `import type` is erased at load
  const out = new Set<string>(), todo = [...D.DOJO_PUBLISH_TREE_PROGRAMS];
  for (let f = todo.pop(); f !== undefined; f = todo.pop()) {
    if (out.has(f)) continue;
    out.add(f);
    const src = read(f), dyn = src.split(LF).filter((l) => !/^[ ]*([/][/]|[*]|[/][*])/.test(l) && /(^|[^A-Za-z0-9_.$])(import|require)[ ]*[(]/.test(l));
    assert.deepEqual(dyn, [], `${f}: no dynamic import`);
    for (const m of src.matchAll(IMPORT)) {
      const s = m[1] ?? "";
      if (s.startsWith("node:")) continue;
      assert.ok(s.startsWith("."), `${f}: ${s} is not a bare specifier (no node_modules in the publication tree)`);
      todo.push(posix.join(posix.dirname(f), s));
    }
    for (let d = posix.dirname(f); f.endsWith(".ts") && d !== "."; d = posix.dirname(d)) {
      if (existsSync(`${REPO}${d}/package.json`)) { out.add(`${d}/package.json`); break; }
    }
  }
  assert.deepEqual([...out].sort(), [...D.DOJO_PUBLISH_TREE_PATHS], "the tree == the closure of the publisher and its package scope (M-H16)");
  // Branchement: act A-3p ships this list read from the constant AT THE G7 (never retyped) and compares the collect tree at that G7.
  const a3p = fenced(sectionOf(12)).join(LF);
  for (const s of ["m.DOJO_PUBLISH_TREE_PATHS.join(' ')", "m.DOJO_COLLECT_TREE_PATHS.join(' ')", `"$G7" $(cat /f/tmp/dojo-dn/publish-tree.txt) |`,
    `tar xzf - -C ${D.DOJO_PUBLISH_TREE_ROOT} `, "echo TREE-EQUAL || echo TREE-DIFFERENT"]) assert.ok(a3p.includes(s), `A-3p: ${s}`);
});

// killer: deploy/monark-dojo-publish.service:37 CONST "UnsetEnvironment=NODE_OPTIONS " -> "UnsetEnvironment="
test("dojo_publish_unit_environment_is_closed", () => {
  exists();
  const svc = service(D.DOJO_PUBLISH_UNIT), exec = one(svc, "ExecStart").split(" ");
  assert.deepEqual(svc.filter((d) => /^(Environment|EnvironmentFile|PassEnvironment)$/.test(d.key)), [], "no environment handed (M-H17)");
  assert.deepEqual(one(svc, "UnsetEnvironment").split(" "), UNSET, "the manager's block: these names unset as the final step (F-2)");
  // PB-3 (2): no preload nor option in the key's process: the node options are the heap cap alone (no --require, no --import).
  assert.deepEqual(exec.slice(0, 3), ["/usr/bin/env", "node", `--max-old-space-size=${String(SCALE.heap)}`], "node options: the heap cap");
  // The tree reads ONE name of its environment, in one module: CREDENTIALS_DIRECTORY (systemd LoadCredential).
  const env = /process[.]env(?:[.]([A-Za-z_]+)|[[]["']([A-Za-z_]+))?/g;
  const reads = treeCode().flatMap((p) => [...read(p).matchAll(env)].map((m) => `${p}:${m[1] ?? m[2] ?? "*"}`));
  assert.deepEqual(reads, [`${D.DOJO_PUBLISH_TREE_PROGRAMS[0] ?? "?"}:CREDENTIALS_DIRECTORY`], "the one environment read of the tree");
});

/** Act A-11 (iii) (model): the FINAL history packet by the REAL writer of PR-2b (historyBundle; a declared duplicate of packet() of
 *  test/dojo-publish-e2e.test.ts): an EMPTY history of day 1 to `last`, its first day read `last` + 1, under `dir`/publish/, as copied there. */
function packetAt(dir: string, anchor: Readonly<Record<string, unknown>>, last: number): void {
  const out = historyBundle({ status: "complete", stop_reason: null, mint: anchor.mint as string, program: anchor.program as string, decimals: 6,
    sig0: SIG0.signature, sig0_slot: SIG0.slot, transactions_failed_excluded: 0, collector_sha256: sha("SYNTHETIC collector"),
    evidence_sha256sums_sha256: sha("SYNTHETIC run"), build: { history_first_day: dateOf(DAY1), history_last_day: dateOf(last),
      first_read_day: dateOf(last + 1), window_slot_max: 1, enumeration_slots: [1], lines: [], bytes: "", sha256: sha(""), root: rootOf([]),
      eve: { addresses: [], accounts: [] }, transactions_admitted: 0, transactions_without_quorum: 0, token_accounts: 0, addresses: 0,
      missing_address_days: 0 } });
  for (const [p, t] of Object.entries(out.publish ?? {})) {
    mkdirSync(dirname(join(dir, "publish", p)), { recursive: true });
    writeFileSync(join(dir, "publish", p), t);
  }
}

// killer: deploy/monark-dojo-publish.service:29 CONST "--inbox /var/lib/monark-dojo-collect/bundles" -> "--inbox /var/lib/monark-dojo-collect/ledger"
test("dojo_units_compose_collect_to_publish_to_verify", async () => {
  exists();
  const R = mkdtempSync(join(tmpdir(), "dojo-compose-")), host = (p: string): string => join(R, ...p.split("/").filter((x) => x !== ""));
  roots.push(R);
  // Acts A-3 and A-3p (model): both trees from their lists, and the collect tree's resolution link (D-3).
  const ct = host(D.DOJO_COLLECT_TREE_ROOT), pt = host(D.DOJO_PUBLISH_TREE_ROOT), [link, target] = D.DOJO_COLLECT_TREE_LINK;
  const files = [...D.DOJO_COLLECT_TREE_PATHS.map((p): [string, string] => [ct, p]), ...D.DOJO_PUBLISH_TREE_PATHS.map((p): [string, string] => [pt, p])];
  for (const [t, p] of files) { mkdirSync(dirname(join(t, p)), { recursive: true }); cpSync(REPO + p, join(t, p)); }
  mkdirSync(dirname(join(ct, link)), { recursive: true });
  if (process.platform === "win32") symlinkSync(join(dirname(join(ct, link)), target), join(ct, link), "junction"); // absolute on win32
  else symlinkSync(target, join(ct, link), "dir");
  const digest = (): string => sha(files.map(([t, p]) => sha(readFileSync(join(t, p)))).join("")), before = digest();
  const px = one(service(D.DOJO_PUBLISH_UNIT), "ExecStart").split(" "), script = host(px[3] ?? "?"), sd = host(D.DOJO_PUBLISH_STATE);
  // Act A-4p (model): the key by the tree's own --generate-key at the unit's credential source, then its committed keyring by the
  // RUNBOOK's own command run on the PUBLIC output (DOJO-KEY-1).
  const keySrc = host(D.DOJO_SIGNING_KEY_SOURCE), krFile = join(R, "dojo-keyring.json");
  for (const d of [dirname(keySrc), join(sd, "public"), join(host(D.DOJO_COLLECT_STATE), "ledger")]) mkdirSync(d, { recursive: true });
  const gk = spawnSync(process.execPath, [script, "--generate-key", keySrc], { encoding: "utf8" });
  assert.equal(gk.status, 0, gk.stderr);
  const k = JSON.parse(gk.stdout) as { key_id: string; public_key: { x: string } };
  const js = /node --input-type=module -e "([^"]+)" -- '<x>' '<key_id>'/.exec(sectionOf(13))?.[1];
  assert.ok(js !== undefined, "the keyring command of act A-4p");
  const kr = spawnSync(process.execPath, ["--input-type=module", "-e", js, "--", k.public_key.x, k.key_id], { cwd: REPO, encoding: "utf8" });
  assert.equal(kr.status, 0, kr.stderr);
  writeFileSync(krFile, kr.stdout);
  // The unit's credential as PID 1 hands it (the LoadCredential id names the file), its argv mapped into R, its environment closed
  // (CREDENTIALS_DIRECTORY alone: the unit sets none); the clock by a preload (the CLI's only clock, Q-G1-7 of PR-3a-1b).
  const creds = join(R, "run", "credentials", posix.basename(D.DOJO_PUBLISH_UNIT));
  const [cid = "?", csrc = "?"] = one(service(D.DOJO_PUBLISH_UNIT), "LoadCredential").split(":");
  mkdirSync(creds, { recursive: true });
  cpSync(host(csrc), join(creds, cid));
  const publish = (ms: number, args: readonly string[]): { status: number | null; stdout: string; stderr: string } => spawnSync(process.execPath,
    [px[2] ?? "?", "--import", `data:text/javascript,Date.now=()=>${String(ms)}`, script, ...args],
    { env: { CREDENTIALS_DIRECTORY: creds }, encoding: "utf8" });
  // Act A-8 (model): the fifteen keys of ANCHOR_KEYS; seed_anchor and horizon by the collect tree's own dojo-seed.mjs (A-4, collect side).
  const seedSrc = host(D.DOJO_SEED_SOURCE), T = (d: number): number => d * 86_400_000, D1 = ANCHOR_DAY + 1;
  mkdirSync(dirname(seedSrc), { recursive: true });
  const sg = spawnSync(process.execPath, [join(ct, "apps/dojo/scripts/dojo-seed.mjs"), "--init", seedSrc, "--horizon", "365"], { encoding: "utf8" });
  assert.equal(sg.status, 0, sg.stderr);
  const s = JSON.parse(sg.stdout) as { seed_anchor: string; horizon: number };
  const body: Readonly<Record<string, unknown>> = { ...anchorBody(s.seed_anchor, s.horizon, ANCHOR_DAY), pool: POOL, pool_quote_vault: QUOTE_VAULT,
    sol_usd_source: PYTH, read_rule: READ_RULE };
  writeFileSync(join(R, "anchor-request.json"), JSON.stringify(Object.fromEntries(ANCHOR_KEYS.map((key) => [key, body[key]]))));
  const a8 = publish(T(ANCHOR_DAY) + 1_000_000, ["--anchor", join(R, "anchor-request.json"), "--state", sd]);
  assert.deepEqual([a8.status, (JSON.parse(a8.stdout || "{}") as { status?: string }).status], [0, "anchored"], a8.stderr);
  const line1 = readFileSync(join(sd, "timeline.jsonl"), "utf8").split(LF)[0] ?? ""; // the SIGNED anchor line, line 1 of the private timeline
  // Acts A-9 (3), A-9 (4) and A-11-rep (model): the seed and the SIGNED anchor line (line 1 of the private timeline, section 7 (4)) as
  // the collect unit's credentials; the Eve of the first day by the collect tree's dojo-eve.mjs (the history is empty).
  writeFileSync(host(D.DOJO_ANCHOR_SOURCE), `${line1}${LF}`);
  const col = service(D.DOJO_COLLECT_UNIT), cc = join(R, "run", "credentials", posix.basename(D.DOJO_COLLECT_UNIT));
  mkdirSync(cc, { recursive: true });
  for (const [id = "?", src = "?"] of col.filter((d) => d.key === "LoadCredential").map((d) => d.value.split(":"))) cpSync(host(src), join(cc, id));
  const day = join(host(D.DOJO_COLLECT_STATE), "bundles", dateOf(D1));
  const eve = spawnSync(process.execPath, [join(ct, "apps/dojo/scripts/dojo-eve.mjs"), "--empty", "--day", dateOf(D1)], { encoding: "utf8" });
  assert.equal(eve.status, 0, eve.stderr);
  mkdirSync(day, { recursive: true });
  writeFileSync(join(day, "eve.json"), eve.stdout);
  // The collect unit's argv (DOJO-TICK-ARGV-1), host paths mapped, ${CREDENTIALS_DIRECTORY} substituted: the REAL --tick of its tree
  // over the simulated chain at the steps of its timer: 00:01 plans the day, each instant's step reads it, 00:15 of d + 1 closes it.
  const cx = one(col, "ExecStart").split(" "), cv = "${CREDENTIALS_DIRECTORY}";
  const collect = (await import(pathToFileURL(host(cx[2] ?? "?")).href)) as typeof import("../apps/dojo/src/collect.ts");
  const cargv = cx.slice(3).map((x) => (x.includes(cv) ? x.replace(cv, cc) : x.startsWith("/") ? host(x) : x));
  const values: Readonly<Record<string, string>> = { ...SIM_ENV, HELIUS_API_KEY: "not-a-key" };
  const env = { ...Object.fromEntries(D.DOJO_COLLECT_ENV_KEYS.map((key) => [key, values[key]])), CREDENTIALS_DIRECTORY: cc };
  Object.assign(sim, { reqs: [], rows: ROWS, mint: MINT, beta: betaOf(D1), override: null });
  const tick = (sec: number): Promise<void> => {
    sim.nowMs = sec * 1000;
    return collect.runCollect(cargv, { env, nowMs: () => sim.nowMs, sleep: () => Promise.resolve() }); // the relays: the guard labels, by host (DRAND-1b)
  };
  await tick(D1 * 86_400 + 60);
  const plan = JSON.parse(readFileSync(join(day, "evidence", "plan.json"), "utf8")) as { instants: number[] };
  for (const t of plan.instants) await tick(Math.ceil(t / 300) * 300);
  // Acts A-11 (iii) and (iv) (model; C-2 of the G2 inspection of part 1): the FINAL packet of the REAL writer of PR-2b (an EMPTY history of
  // day 1 to the anchor's day; D1 its first day read) at the RUNBOOK's path, then the argv of the job of 18 (iv) in the unit's child: at
  // 00:10 UTC of D1 + 1, D1 over but not yet closed, a named refusal with nothing written (B-1); after the close (00:15), the history line.
  const iv = (fenced(sectionOf(18)).find((c) => c.includes("--history")) ?? "").split(LF).join(" "), hx = (/C="([^"]+)"/.exec(iv)?.[1] ?? "").split(/ +/);
  packetAt(host(hx[4] ?? "?"), body, ANCHOR_DAY);
  const job = (ms: number) => publish(ms, hx.slice(3).map((x) => (x.startsWith("/") ? host(x) : x))), early = job(T(D1 + 1) + 600_000);
  assert.deepEqual([early.status, early.stderr.startsWith("dojo/publish: first_read_day_open: "), readFileSync(join(sd, "timeline.jsonl"), "utf8")],
    [1, true, `${line1}${LF}`], `18 (iv) before the close of D1: refused, nothing written; ${early.stderr}`);
  await tick((D1 + 1) * 86_400 + 900);
  const h = job(T(D1 + 1) + 1_200_000);
  assert.deepEqual([h.status, hx[2] === px[3], (JSON.parse(h.stdout || "{}") as { history_last_day?: string }).history_last_day],
    [0, true, dateOf(ANCHOR_DAY)], `the history line of 18 (iv), the unit's program: ${h.stderr}`);
  // The publish unit's argv at the first slot of its timer (00:30 UTC of d + 1): the day published into public/.
  const r = publish(T(D1 + 1) + 1_800_000, px.slice(4).map((x) => (x.startsWith("/") ? host(x) : x)));
  const out = JSON.parse(r.stdout || "{}") as { status?: string; day?: string };
  assert.deepEqual([r.status, out.status, out.day], [0, "published", dateOf(D1)], r.stderr);
  // The served tree read back by the verifier's public command under the keyring of A-4p, which is the served dojo/pubkey.json (C-9).
  const served = join(sd, "public"), cli = spawnSync(process.execPath, [`${REPO}apps/dojo/scripts/dojo-verify-cli.mjs`, served, "--keyring", krFile],
    { encoding: "utf8" });
  const v = JSON.parse(cli.stdout || "{}") as { ok?: boolean; status?: string; snapshots?: number; head?: { recomputed_root?: string } | null };
  const head = JSON.parse(readFileSync(join(served, "timeline.jsonl"), "utf8").trimEnd().split(LF).at(-1) ?? "{}") as { root?: string };
  assert.deepEqual([cli.status, v.ok, v.status, v.snapshots, v.head?.recomputed_root], [0, true, "consistent_with_supplied_keyring", 1, head.root], cli.stderr);
  assert.equal(kr.stdout, readFileSync(join(served, "dojo", "pubkey.json"), "utf8"), "the committed keyring's bytes are the served ones");
  assert.equal(digest(), before, "both trees left byte-identical (read-only to their units)");
});

const KEY_PATH = /[/]etc[/]monark[/]dojo[/][^ '"`;|&(){}<>]*/g, SEP = ["&&", "||", ";", "|", "'", "`", "(", ")", "{", "}", ">"];
/** Each place a text names a path under the publication's key directory, as the whole shell segment around it on its line (from the
 *  last separator before the path to the first one after it): the verb before AND the operands after are checked. */
function keyUses(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(LF)) {
    for (const m of line.matchAll(KEY_PATH)) {
      const b = line.slice(0, m.index), a = line.slice(m.index + m[0].length);
      const cut = Math.max(0, ...SEP.map((x) => { const j = b.lastIndexOf(x); return j < 0 ? 0 : j + x.length; }));
      const end = Math.min(a.length, ...SEP.map((x) => { const j = a.indexOf(x); return j < 0 ? a.length : j; }));
      out.push((b.slice(cut) + m[0] + a.slice(0, end)).trim());
    }
  }
  return out;
}

// killer: docs/RUNBOOK-dojo.md:453 CONST "grep -c PRIVATE /root/dojo-pubkey.out; " -> "cat /etc/monark/dojo/signing-key.pem; "
test("dojo_runbook_never_prints_private_key", () => {
  exists();
  const K = D.DOJO_SIGNING_KEY_SOURCE, text = read(RUNBOOK), a4 = sectionOf(13);
  const ALLOWED = [`node ${D.DOJO_PUBLISH_TREE_ROOT}/${D.DOJO_PUBLISH_TREE_PROGRAMS[0] ?? "?"} --generate-key ${K}`, `stat -c "%a %U:%G %s" ${K}`,
    `shred -u ${K} /root/dojo-pubkey.out`, `K="-p LoadCredential=${D.DOJO_SIGNING_CREDENTIAL}:${K}"`];
  assert.equal(one(service(D.DOJO_PUBLISH_UNIT), "LoadCredential"), `${D.DOJO_SIGNING_CREDENTIAL}:${K}`, "the unit's credential source");
  assert.deepEqual([...new Set(keyUses(text))].sort(), [...ALLOWED].sort(), "the key file only generated, stat-ed, handed to systemd or shredded");
  for (const bad of [`cat ${K}`, `ssh h 'head -c 99 ${K}'`, `sha256sum ${K}`, `cp ${K} /tmp/k`, `base64 ${K}`, "cat /etc/monark/dojo/*.pem"]) {
    assert.ok(keyUses(bad).some((u) => !ALLOWED.includes(u)), `the checker reddens on: ${bad}`);
  }
  // --generate-key prints the public part only: counted (PRIVATE, a JWK member d) BEFORE the output is displayed.
  const counts = [a4.indexOf("grep -c PRIVATE /root/dojo-pubkey.out"), a4.indexOf(`grep -c -E "[{,] *.d. *:" /root/dojo-pubkey.out`)];
  assert.ok(counts.every((i) => i > 0 && i < a4.indexOf("'cat /root/dojo-pubkey.out'")), "the two counts, before the public output is read");
  // No trace, no environment dump, no credentials directory, outside the two prohibition passages (Conventions of sections 1 to 9, Never).
  const conv = text.indexOf("**Conventions.**"), dash = text.indexOf(`${LF}---${LF}`), never = text.indexOf(`${LF}## Never${LF}`);
  assert.ok(conv > 0 && dash > conv && never > dash, "the two prohibition passages");
  const rest = text.slice(0, conv) + text.slice(dash, never);
  for (const re of [/set[ ]+-[a-zA-Z]*x/, /(^|[^a-z])(ba)?sh[ ]+-[a-zA-Z]*x([^a-z]|$)/, /printenv/, /[/]run[/]credentials[/]/]) {
    assert.equal(re.test(rest), false, `no ${String(re)} in the RUNBOOK outside its prohibition passages`);
  }
});

// killer: docs/RUNBOOK-dojo.md:608 CONST "run only AFTER the first" -> "run only BEFORE the first"
test("dojo_runbook_counts_without_rehearsal_and_stamps_after_the_first_publication", () => {
  exists(); // FAST-START (decisions of 2026-10-01, G1 journal docs/G1-lot-fast-start.md): no rehearsal day, no Bitcoin block before d
  const a8 = sectionOf(16, true), at = (x: string): number => { const i = a8.indexOf(x); assert.ok(i >= 0, `A-8: ${x}`); return i; };
  const check = at("--self-consistent-only; echo verify_exit"), then = at("**Then A-9, the same day J**");
  const stamp = at(" stamp docs/dojo-publications/timeline-seq1-manifest.txt;"), copy = at("cp -n timeline-seq1-manifest.txt.ots ");
  const upgrade = at(" upgrade docs/dojo-publications/timeline-seq1-manifest.txt.ots;");
  assert.ok(check < then && then < stamp && stamp < copy && copy < upgrade, "the offline check, A-9 at once; the stamp, the copy, the upgrade later");
  assert.ok(a8.includes("(5) to (9) below run only AFTER the first `snapshot` is published") && !a8.includes("**Only an upgraded proof opens A-9**")
    && !a8.includes("no A-9 without the proof"), "A-8: the timestamp follows the first publication and never gates A-9");
  const order = sectionOf(10, true), first = order.indexOf("→ the first `snapshot` (d) published → A-8 (5) to (9)");
  assert.ok(order.includes("CA-0 → A-8 (1) to (4)") && first > order.indexOf("A-11 (ii) to (iv)") && !order.includes("`ots upgrade` complete"),
    "section 10: A-9 after the offline check, the timestamp after the first snapshot");
  const a9 = sectionOf(7, true), head = read(RUNBOOK).slice(0, read(RUNBOOK).indexOf("**Conventions.**"));
  assert.ok(a9.includes("`--provisional-day` J") && a9.includes("o = J + 1") && !a9.includes("The first counted day follows DOJO-ANCHOR-OTS-DATE-RULE-1")
    && !a9.includes("R + 2"), "section 7: d read on the plan of J + 1, without the rule of the block nor a rehearsal day");
  assert.ok(!head.includes("the rehearsal criterion of section 6") && sectionOf(6, true).includes("**Off the real path**"), "A-7 off the real path");
  const a11 = sectionOf(18, true);
  assert.ok(a11.includes("--provisional-day <J>") && a11.includes("<local provisional state>/provisional/eve.json") && !a11.includes("`--first-read` = R"),
    "18 (i): the Eve of the provisional course, never a packet");
});

const TU_K = "apps/dojo/keys/dojo-keyring.json", TU_K_SKIP = `TU-K: skipped by name until act A-4p (DOJO-KEY-1) commits ${TU_K}`;
// killer: scripts/dojo-deploy.mjs:57 CONST "/etc/monark/dojo/signing-key.pem" -> "/etc/monark/bell/signing-key.pem"
test("dojo_keyring_shares_no_key_with_bell", { skip: existsSync(REPO + TU_K) ? false : TU_K_SKIP }, () => {
  exists();
  assert.ok(under(D.DOJO_SIGNING_KEY_SOURCE, D.DOJO_SIGNING_KEY_DIR) && !under(D.DOJO_SIGNING_KEY_SOURCE, "/etc/monark/bell"), "its own key");
  const dk = JSON.parse(read(TU_K)) as { schema: string; keys: { key_id: string; public_key: { x: string } }[] };
  const bk = JSON.parse(read("apps/bell/keys/bell-keyring.json")) as { keys: { key_id: string; jwk: { x: string } }[] };
  const ids = new Set(dk.keys.flatMap((x) => [x.key_id, x.public_key.x]));
  assert.equal(dk.schema, "dojo-keyring-v1", "the committed Dojo keyring (A-4p)");
  assert.deepEqual(bk.keys.filter((x) => ids.has(x.key_id) || ids.has(x.jwk.x)), [], "no key of Bell's keyring in Dojo's (key_id or x)");
});

// killer: docs/RUNBOOK-dojo.md:857 SDL "price_version_pending" -> ""
test("dojo_runbook_stops_before_the_stamp_and_on_refusals", () => {
  exists();
  const a8 = sectionOf(16, true), check = a8.indexOf("dojo-verify-cli.mjs /f/PRODUITS/dojo-mirror/public-seq1 --self-consistent-only");
  const stop = a8.indexOf("**STOP on any other output: no `ots stamp`, nothing served**"), stamp = a8.indexOf(" stamp docs/dojo-publications/");
  assert.ok(check > 0 && check < stop && stop < stamp, "A-8: the offline check of the mirror, its STOP, THEN the stamp (Q-V-1; M-H19)");
  // Every refusal of the publisher has its row in section 19, each a STOP (history_missing: expected until the history line).
  const rows = sectionOf(19).split(LF).filter((l) => l.startsWith("| `")).map((l): [string, string] => [l.slice(3, l.indexOf("`", 3)), l]);
  assert.deepEqual(rows.map(([c]) => c).sort(), [...DOJO_PUBLISH_REFUSALS].sort(), "one row per code of DOJO_PUBLISH_REFUSALS, no other");
  for (const [c, l] of rows) assert.ok(l.includes("**STOP**"), `${c}: a STOP`);
  const row = (c: string): string => rows.find(([x]) => x === c)?.[1] ?? "";
  assert.ok(row("history_missing").includes("expected until that line (decision 231)"), "history_missing: expected, then a STOP");
  assert.ok(row("price_version_pending").includes("run `--inbox` first"), "price_version_pending: --inbox first");
  assert.ok(row("first_read_day_open").includes("wait for the close of d") && row("day_missing").includes("never waited out"),
    "B-1: the first day read not closed (--history), a gap of days (--inbox): each a STOP with its act");
  const why = sectionOf(19, true);
  for (const x of ["an anchor line appended OUTSIDE `--anchor` above a `price_version` due", "a DURABLE stop, fail-closed",
    "the only remedy is a new timeline", "Escalation to the orchestrator"]) assert.ok(why.includes(x), `line_refused (C-G2-1 of PR-3a-1c): ${x}`);
  assert.ok(sectionOf(17, true).includes("**STOP** on every other refusal (section 19)"), "A-10: a STOP on every refusal of section 19");
});

// killer: docs/RUNBOOK-dojo.md:814 CONST "-p SupplementaryGroups=dojo-handoff" -> "-p SupplementaryGroups=dojo-collect"
test("dojo_runbook_jobs_carry_the_unit_properties", () => {
  exists(); // C-3 and Q-3 of the G2 inspection of part 1: the three systemd-run jobs of the RUNBOOK, each property the unit's own
  const svc = service(D.DOJO_PUBLISH_UNIT), SANDBOX = ["PrivateNetwork", "NoNewPrivileges", "ProtectSystem", "ProtectHome", "PrivateTmp",
    "ReadWritePaths", "UMask"], KEY = ["LoadCredential", "UnsetEnvironment"];
  const jobs = [16, 18, 19].map((n) => fenced(sectionOf(n)).filter((c) => c.includes("systemd-run")).map((c) => c.split(LF).join(" ")));
  assert.deepEqual(jobs.map((j) => j.length), [1, 1, 1], "three jobs: A-8 (2), 18 (iv) and --unlock (section 19)");
  const want = [[...SANDBOX, ...KEY], [...SANDBOX, "SupplementaryGroups", "ReadOnlyPaths", "InaccessiblePaths", ...KEY], SANDBOX];
  const quoted = [["U"], ["U", "I"], []]; // a list is ONE argument "$X" (X="--property=K=V", then X="$X more"): $S is split on blanks
  jobs.flat().forEach((job, i) => {
    const props = [...job.matchAll(/-p ([A-Za-z]+)=([^ "]+)/g)].map((m): [string, string] => [m[1] ?? "", m[2] ?? ""]), q = new Map<string, string>();
    for (const [, x = "", more, v = ""] of job.matchAll(/([A-Z])="([$][A-Z] )?([^"]*)"/g)) {
      if (more !== undefined || v.startsWith("--property=")) q.set(x, `${q.get(x) ?? ""} ${v}`.trim());
    }
    for (const v of q.values()) { const m = /^--property=([A-Za-z]+)=(.+)$/.exec(v); props.push([m?.[1] ?? "?", m?.[2] ?? ""]); }
    const args = [...q.keys()].map((x) => `"$${x}" `).join(""), run = `$S ${args}${q.size > 0 ? "$K " : ""}$C'`;
    assert.deepEqual([[...q.keys()], job.includes("--uid=dojo --gid=dojo"), job.includes(run)], [quoted[i], true, true], `job ${String(i + 1)}: ${run}`);
    assert.deepEqual(props.map(([k]) => k).sort(), [...(want[i] ?? [])].sort(), `job ${String(i + 1)}: its properties, closed`);
    for (const [k, v] of props) assert.equal(v, one(svc, k), `job ${String(i + 1)}: ${k} is the unit's`);
  });
  // 18 (iv) reads d in the inbox (B-1): the very bundles/ the unit reads, read-only, through its group.
  assert.ok((jobs[1]?.[0] ?? "").includes(`--inbox ${one(svc, "ReadOnlyPaths")} --state ${D.DOJO_PUBLISH_STATE}`), "18 (iv): --inbox, read-only");
});
