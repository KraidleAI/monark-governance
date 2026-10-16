/**
 * Root test of Bell's key directory, host by host (G0 BELL-COLLECT-TIMER-1 section 4 "P3", lot 3b; Q-7 decided: the Bell probe runs on
 * the former host, the recommended option). Bell's host carries Bell's publisher, the one unit that holds the key (its one credential, LoadCredential=), and Bell's
 * collection, which must never reach it. The former host of Bell keeps the Dojo (collector, publisher, probe) and the Narabi probe (the
 * Bell probe of lot 4b joins them there); Bell's old key stays on it until the act of part 5 (DC-8, M-15), and so do its masks. The
 * site's host runs neither. Each unit of a host that holds Bell's key directory, the holder apart, masks it with InaccessiblePaths=
 * (systemd.exec(5) of systemd 259, section SANDBOXING: such paths "will be made inaccessible for processes inside the namespace along with
 * everything below them"): one entry of the [Service] lists, read in order as systemd reads them (an empty assignment resets the list), with
 * no "-" (systemd would skip a missing path without a word) and no "+". No other directive of these units, and no code file of the tree
 * each one runs, names a path under it. Every committed service is classed by host, so a new committed unit is classed here before it
 * ships; a unit the repository does not carry (Caddy's, from its package) is out of its sight. Governance-only: deploy/ is not exported.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { posix } from "node:path";
import { fileURLToPath } from "node:url";
import * as B from "../scripts/bell-deploy.mjs";
import * as D from "../scripts/dojo-deploy.mjs";
import * as P from "../scripts/probe-dojo-live.mjs";
import { BELL_PROBE_TREE_PATHS } from "../scripts/probe-bell.mjs";
import { BELL_TREE_PATHS } from "../scripts/verify-bell.mjs";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const read = (rel: string): string => readFileSync(REPO + rel, "utf8");
const BELL_UNIT = "deploy/monark-bell-publish.service";
/** The hosts, each unit with the tree its ExecStart runs; on a host that holds Bell's key directory, `holder` names the unit that loads it. */
const HOSTS = (): Readonly<Record<string, { holdsKey: boolean; holder: string | null; units: Readonly<Record<string, readonly string[]>> }>> => ({
  bell: { holdsKey: true, holder: BELL_UNIT, units: { [BELL_UNIT]: BELL_TREE_PATHS, [B.BELL_COLLECT_UNIT]: B.BELL_COLLECT_TREE_PATHS } },
  former: { holdsKey: true, holder: null, units: { [D.DOJO_COLLECT_UNIT]: D.DOJO_COLLECT_TREE_PATHS, [D.DOJO_PUBLISH_UNIT]: D.DOJO_PUBLISH_TREE_PATHS,
    "deploy/monark-dojo-probe.service": P.DOJO_PROBE_TREE_PATHS, "deploy/monark-probe.service": ["scripts/probe-narabi.mjs"], "deploy/monark-bell-probe.service": BELL_PROBE_TREE_PATHS } },
  site: { holdsKey: false, holder: null, units: { "deploy/monark-harness.service": [], "deploy/monark-sentinel.service": [] } },
});

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
/** Path p is `dir` or under it (segment-aware: /etc/monark/bell-collect is not under /etc/monark/bell). */
const under = (p: string, dir: string): boolean => p === dir || p.startsWith(`${dir}/`);

// killer: deploy/monark-bell-collect.service:47 SDL "InaccessiblePaths=/var/lib/monark-bell /etc/monark/bell" -> ""
test("bell_key_directory_is_inaccessible_to_every_unit_by_host", () => {
  assert.ok(typeof B.BELL_COLLECT_UNIT === "string" && existsSync(REPO + B.BELL_COLLECT_UNIT), "Bell's collection unit is committed (lot 3b-ii)");
  // (1) The directory of Bell's key: the source of the one credential of Bell's publisher, pinned.
  const creds = unitOf(BELL_UNIT).filter((d) => d.section === "Service" && d.key === "LoadCredential").map((d) => d.value);
  assert.equal(creds.length, 1, "Bell's publisher loads one credential");
  const source = (creds[0] ?? "").slice((creds[0] ?? "").indexOf(":") + 1), dir = posix.dirname(source);
  assert.deepEqual([source, dir], ["/etc/monark/bell/signing-key.pem", "/etc/monark/bell"], "Bell's key and its directory");
  // (2) Every committed service is classed by host, once.
  const hosts = HOSTS(), classed = Object.values(hosts).flatMap((h) => Object.keys(h.units));
  const services = readdirSync(`${REPO}deploy`).filter((f) => f.endsWith(".service")).map((f) => `deploy/${f}`).sort();
  assert.deepEqual(services, [...classed].sort(), "each committed service, classed by host");
  assert.equal(new Set(classed).size, classed.length, "each in one host only");
  for (const [name, h] of Object.entries(hosts)) {
    for (const [rel, tree] of Object.entries(h.units)) {
      const svc = unitOf(rel).filter((d) => d.section === "Service");
      // (3) The [Service] lists in order, as systemd reads them: entries split on blanks, an empty assignment resets the list.
      // killer: deploy/monark-dojo-collect.service:52 CONST "UMask=0027" -> "InaccessiblePaths="
      const masked = svc.filter((d) => d.key === "InaccessiblePaths").reduce<string[]>((acc, d) => (d.value === "" ? [] : [...acc, ...d.value.split(/\s+/)]), []);
      // killer: deploy/monark-probe.service:40 SDL "InaccessiblePaths=/etc/monark/bell" -> ""
      // killer: deploy/monark-dojo-collect.service:50 CONST " /etc/monark/bell" -> ""
      // killer: deploy/monark-dojo-publish.service:49 CONST " /etc/monark/bell" -> " -/etc/monark/bell"
      const want = h.holdsKey && rel !== h.holder ? [dir] : [];
      assert.deepEqual(masked.filter((p) => p.replace(/^[-+]+/, "") === dir), want, `${name} host, ${rel}: InaccessiblePaths= lists ${dir} ${want.length === 1 ? "once, with no \"-\" and no \"+\"" : "never"}`);
      // (4) No other directive names a path under it (no environment file, read or write path, argument), the holder's one credential apart.
      // killer: deploy/monark-dojo-probe.service:20 CONST "EnvironmentFile=/etc/monark/probe.env" -> "EnvironmentFile=/etc/monark/bell/probe.env"
      const named = svc.filter((d) => d.key !== "InaccessiblePaths" && !(rel === h.holder && d.key === "LoadCredential")).flatMap((d) => d.value.split(/[\s:=,"']+/)).map((t) => t.replace(/^[-+!@~]+/, ""));
      assert.deepEqual(named.filter((t) => under(t, dir)), [], `${name} host, ${rel}: no other directive names a path under ${dir}`);
      // (5) No code file of the tree its ExecStart runs names the directory (the holder reads its key under $CREDENTIALS_DIRECTORY only).
      // killer: scripts/probe-dojo-live.mjs:43 CONST "/etc/monark/dojo-probe-smtp-pass" -> "/etc/monark/bell/smtp-pass"
      const code = tree.filter((p) => /[.](ts|mjs)$/.test(p));
      assert.ok(code.length > 0 || name === "site", `${rel}: the code of its tree (non-vacuity)`);
      const names = new RegExp(`${dir.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?![\\w-])(?!\\.[\\w-])`); // segment-aware: /etc/monark/bell-collect is another directory, /etc/monark/bell. ends a sentence
      assert.deepEqual(code.filter((p) => names.test(read(p))), [], `${rel}: no code file of its tree names ${dir}`);
    }
  }
});
