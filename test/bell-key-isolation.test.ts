/**
 * Root test of Bell's key directory on Bell's shared host. The host that signs Bell's records also runs the Dojo (collector,
 * publisher, probe) and the Narabi probe, so each of these four committed units masks the directory of Bell's signing key with
 * InaccessiblePaths= (systemd.exec(5) of systemd 259, section SANDBOXING: such paths "will be made inaccessible for processes inside
 * the namespace along with everything below them"). The directory is read from Bell's own unit, the source of its one credential.
 * In each of the four units it is one entry of the [Service] lists, read in order as systemd reads them (an empty assignment resets
 * the list), with no "-" (systemd would skip a missing path without a word; the directory exists on the host, and these units start
 * on no host without it) and no "+". No other directive of these units, and no code file of the tree each one runs, names a path
 * under it. Every committed service is classed by host, so a new committed unit on Bell's host is classed here before it ships; a
 * unit the repository does not carry (Caddy's, from its package) is out of its sight. Governance-only: deploy/ is not exported.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { posix } from "node:path";
import { fileURLToPath } from "node:url";
import * as D from "../scripts/dojo-deploy.mjs";
import * as P from "../scripts/probe-dojo-live.mjs";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");
const BELL_UNIT = "deploy/monark-bell-publish.service";
/** The units that share Bell's host, each with the tree its ExecStart runs: the Dojo's three, then the Narabi probe's one file. */
const COTENANTS: Readonly<Record<string, readonly string[]>> = {
  [D.DOJO_COLLECT_UNIT]: D.DOJO_COLLECT_TREE_PATHS,
  [D.DOJO_PUBLISH_UNIT]: D.DOJO_PUBLISH_TREE_PATHS,
  "deploy/monark-dojo-probe.service": P.DOJO_PROBE_TREE_PATHS,
  "deploy/monark-probe.service": ["scripts/probe-narabi.mjs"],
};
/** The units of the site's host (the harness and the Narabi sentinel), which never run on Bell's. */
const SITE_HOST_UNITS = ["deploy/monark-harness.service", "deploy/monark-sentinel.service"];

interface Directive { section: string; key: string; value: string }
/** systemd unit -> directives in order (comments and blank lines dropped; a line continuation is refused). */
function unitOf(rel: string): Directive[] {
  const list: Directive[] = [];
  let section = "";
  for (const line of read(rel).split("\n")) {
    const l = line.trim(), i = l.indexOf("=");
    if (l === "" || l.startsWith("#") || l.startsWith(";")) continue;
    assert.ok(!l.endsWith("\\"), `${rel}: no line continuation: ${l}`);
    if (l.startsWith("[") && l.endsWith("]")) { section = l.slice(1, -1); continue; }
    assert.ok(i > 0 && /^[A-Za-z]+$/.test(l.slice(0, i)), `${rel}: a Key=Value directive: ${l}`);
    list.push({ section, key: l.slice(0, i), value: l.slice(i + 1).trim() });
  }
  return list;
}
/** Path p is `dir` or under it (segment-aware: /etc/monark/bellx is not under /etc/monark/bell). */
const under = (p: string, dir: string): boolean => p === dir || p.startsWith(`${dir}/`);

// killer: deploy/monark-probe.service:40 SDL "InaccessiblePaths=/etc/monark/bell" -> ""
test("bell_key_directory_is_inaccessible_to_every_unit_sharing_its_host", () => {
  // (1) The directory of Bell's key: the source of the one credential of Bell's unit, pinned.
  const creds = unitOf(BELL_UNIT).filter((d) => d.section === "Service" && d.key === "LoadCredential").map((d) => d.value);
  assert.equal(creds.length, 1, "Bell's unit loads one credential");
  const source = (creds[0] ?? "").slice((creds[0] ?? "").indexOf(":") + 1), dir = posix.dirname(source);
  assert.deepEqual([source, dir], ["/etc/monark/bell/signing-key.pem", "/etc/monark/bell"], "Bell's key and its directory");
  // (2) Every committed service is Bell's, one of the four that share its host, or one of the site's host.
  const services = readdirSync(`${REPO}deploy`).filter((f) => f.endsWith(".service")).map((f) => `deploy/${f}`).sort();
  assert.deepEqual(services, [BELL_UNIT, ...Object.keys(COTENANTS), ...SITE_HOST_UNITS].sort(), "each committed service, classed by host");
  for (const [rel, tree] of Object.entries(COTENANTS)) {
    const svc = unitOf(rel).filter((d) => d.section === "Service");
    // (3) The [Service] lists in order, as systemd reads them: entries split on blanks, an empty assignment resets the list.
    // killer: deploy/monark-dojo-collect.service:52 CONST "UMask=0027" -> "InaccessiblePaths="
    const masked = svc.filter((d) => d.key === "InaccessiblePaths").reduce<string[]>((acc, d) => (d.value === "" ? [] : [...acc, ...d.value.split(/\s+/)]), []);
    // killer: deploy/monark-dojo-collect.service:50 CONST " /etc/monark/bell" -> ""
    // killer: deploy/monark-dojo-publish.service:49 CONST " /etc/monark/bell" -> " -/etc/monark/bell"
    assert.deepEqual(masked.filter((p) => p.replace(/^[-+]+/, "") === dir), [dir], `${rel}: InaccessiblePaths= lists ${dir} once, with no "-" and no "+"`);
    // (4) No other directive names a path under it: no credential, environment file, read or write path, argument.
    // killer: deploy/monark-dojo-probe.service:20 CONST "EnvironmentFile=/etc/monark/probe.env" -> "EnvironmentFile=/etc/monark/bell/probe.env"
    const named = svc.filter((d) => d.key !== "InaccessiblePaths").flatMap((d) => d.value.split(/[\s:=,"']+/)).map((t) => t.replace(/^[-+!@~]+/, ""));
    assert.deepEqual(named.filter((t) => under(t, dir)), [], `${rel}: no other directive names a path under ${dir}`);
    // (5) No code file of the tree its ExecStart runs names the directory.
    // killer: scripts/probe-dojo-live.mjs:43 CONST "/etc/monark/dojo-probe-smtp-pass" -> "/etc/monark/bell/smtp-pass"
    const code = tree.filter((p) => /[.](ts|mjs)$/.test(p));
    assert.ok(code.length > 0, `${rel}: the code of its tree (non-vacuity)`);
    assert.deepEqual(code.filter((p) => read(p).includes(dir)), [], `${rel}: no code file of its tree names ${dir}`);
  }
});
