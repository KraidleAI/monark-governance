// MONARK Bell -- T-1b S-5 oracle (ADR-T1b-backend v2 Tuyaux T-a, T-b, T-c, T-f, T-g; checkpoint-1 C-3, CA-11 durci). The
// composition, end to end, from a REAL runMain run (offline stubs, --out outside the repo = the bundle as written): bell-publish
// -> a loopback server applying the headers READ from deploy/Caddyfile.monark-bell -> bell-verify --keyring over HTTP; the served
// runs deep-equal the run's parsed state.json; one published_at; the served text passes the vocabulary gate; bell-report's
// aggregate() is the same on the served runs and on the D9. No network beyond 127.0.0.1; the key is generated in memory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { canonical } from "../scripts/bell-chain.mjs";
import { BellVerifyError, dirSource, urlSource, verifyServed } from "../scripts/bell-verify.mjs";
import { aggregate, findStateFiles } from "../scripts/bell-report.mjs";
import { compilePatterns, scanText } from "../../../scripts/grep-forbidden.mjs";
import { REPO, caddyHeaderRules, committedCaddyRules, publishedRun, readJson, serveDir, type Obj } from "./helpers/bell-served.ts";

const R = await publishedRun();
const files = (root: string, rel = ""): string[] => readdirSync(join(root, rel)).sort().flatMap((n) => {
  const r = rel === "" ? n : `${rel}/${n}`;
  return statSync(join(root, r)).isDirectory() ? files(root, r) : [r];
});

test("bell_publish_consumes_real_runmain_output_end_to_end", async (t) => {
  // (d) the D9 runMain wrote carries every shape the served whitelist must pass (non-vacuity, the ADR D5 coverage proof)
  const d = R.d9.digest as Obj, gaps = d.gaps as Obj[], vol = d.volume as Obj[];
  for (const [what, ok] of [["abstained gap", gaps.some((g) => "abstain" in g)], ["rebase_residuals", gaps.some((g) => "rebase_residuals" in g)],
    ["cash_cross", gaps.some((g) => "cash_cross" in g)], ["computed volume", vol.some((v) => "vol_ratio" in v)], ["abstained volume", vol.some((v) => "abstain" in v)]] as const) {
    assert.ok(ok, `runMain produced a ${what}`);
  }
  const rules = committedCaddyRules(), srv = await serveDir(R.pub, rules);
  try {
    // (a) served over loopback HTTP, checked with the SUPPLIED keyring as the trust root
    const rep = await verifyServed({ source: urlSource(srv.url), keyring: R.keyring });
    assert.deepEqual([rep.status, rep.head_seq, rep.publications, rep.voided_lines, rep.breaks], ["consistent_with_supplied_keyring", 1, 1, [], []]);
    const krFile = join(R.base, "bell-keyring.json"), script = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts", "bell-verify.mjs");
    writeFileSync(krFile, canonical(R.keyring) + "\n"); // the CLI as a reader runs it: --url + --keyring (async: the server is in-process)
    const cli = await promisify(execFile)(process.execPath, [script, "--url", srv.url, "--keyring", krFile], { encoding: "utf8" });
    assert.equal((JSON.parse(cli.stdout) as Obj).status, "consistent_with_supplied_keyring", "bell-verify --url --keyring");
    // (b) the served run IS the run: deep equality with runMain's state.json, parsed (canonical re-serialization changes bytes, not value)
    const served = readJson(join(R.pub, "state.json")), prov = readJson(join(R.pub, "provenance.json"));
    assert.deepStrictEqual(served.runs, [R.d9]);
    assert.deepStrictEqual(readJson(join(R.state, "archive", "1-b1", "run0", "state.json")), R.d9, "the bundle archived as runMain wrote it");
    // (c) one clock read: the line, the state envelope and the provenance envelope carry the same published_at
    const line = JSON.parse(readFileSync(join(R.pub, "timeline.jsonl"), "utf8")) as Obj;
    assert.deepEqual([served.published_at, prov.published_at], [line.published_at, line.published_at]);
    // negative control: ONE byte of the served state.json altered => refused by name over HTTP
    const f = join(R.pub, "state.json"), good = readFileSync(f), bad = Buffer.from(good), i = bad.length - 2;
    bad[i] = (bad[i] ?? 0) ^ 1;
    writeFileSync(f, bad);
    try { await assert.rejects(verifyServed({ source: urlSource(srv.url), keyring: R.keyring }), (e: unknown) => e instanceof BellVerifyError && e.code === "state_not_bound_by_head"); }
    finally { writeFileSync(f, good); } // the other tests of this file read the same served tree
    // the headers S-8 specifies, as READ from the committed Caddyfile (a NAMED skip while the PR-3 file is not in this tree)
    await t.test("caddyfile_headers_applied", { skip: rules === null ? "CADDYFILE-ABSENT: deploy/Caddyfile.monark-bell not in this tree (PR-3); headers not applied" : false }, async () => {
      const imm = [`/states/${String(line.state_sha256)}.json`, `/provenance/${String(line.provenance_sha256)}.json`];
      for (const p of ["/state.json", "/provenance.json", "/timeline.jsonl", "/bell/pubkey.json", ...imm]) {
        const h = (await fetch(srv.url + p)).headers;
        assert.deepEqual([h.get("access-control-allow-origin"), h.get("x-content-type-options")], ["*", "nosniff"], p);
        assert.match(h.get("cache-control") ?? "", imm.includes(p) ? /\bimmutable\b/ : /\bno-cache\b/, p);
      }
      assert.notEqual((await fetch(srv.url + "/")).status, 200, "no listing");
    });
  } finally { await srv.close(); }
  // the reader of the Caddyfile on the S-8 shape (proven even while the file is absent); an unread header form throws
  const spec = caddyHeaderRules(["bell.monarkgate.tech {", "\troot * /var/lib/monark-bell/public", "\tfile_server", "\t@imm path /states/* /provenance/*",
    "\t@cur not path /states/* /provenance/*", "\theader {", "\t\tAccess-Control-Allow-Origin \"*\"", "\t\tX-Content-Type-Options nosniff", "\t}",
    "\theader @imm Cache-Control \"public, max-age=31536000, immutable\"", "\theader @cur Cache-Control no-cache", "}"].join("\n"));
  const at = (p: string): Record<string, string> => Object.fromEntries(spec.filter((r) => r.matches(p)).map((r) => [r.name, r.value]));
  assert.deepEqual(at("/states/x.json"), { "Access-Control-Allow-Origin": "*", "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=31536000, immutable" });
  assert.equal(at("/state.json")["Cache-Control"], "no-cache");
  assert.throws(() => caddyHeaderRules("b {\n\theader -Server\n}"), /unsupported header form/);
  assert.throws(() => caddyHeaderRules("b {\n\thandle /x {\n\t\theader A b\n\t}\n}"), /nested/);
});

// ---- (e) A-9: the vocabulary gate (global + scope bell) on the text REALLY served, and on the reader's reports ----
test("bell_served_files_pass_vocab_gate", async () => {
  const cfg = JSON.parse(readFileSync(join(REPO, "vocab-banned.json"), "utf8")) as { banned: Array<{ re: string; why: string }>; scan: { bell: { banned: Array<{ re: string; why: string }> } } };
  const pats = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.bell.banned)];
  const served = files(R.pub);
  assert.ok(served.length >= 6 && served.includes("bell/pubkey.json"), `every served file is scanned (${String(served.length)})`);
  for (const f of served) assert.deepEqual(scanText(readFileSync(join(R.pub, f), "utf8"), pats), [], `public/${f}`);
  for (const keyring of [R.keyring, null]) assert.deepEqual(scanText(JSON.stringify(await verifyServed({ source: dirSource(R.pub), keyring })), pats), [], "the reader's report");
  assert.ok(scanText(canonical({ status: "verified" }), pats).length > 0, "the same patterns catch a naked 'verified' in a served-shaped string");
});

// ---- (g) T-g: bell-report's aggregate() is the same on the served runs[] and on the D9 directory runMain wrote ----
test("bell_report_aggregate_equals_on_served_bundle", () => {
  const d9 = findStateFiles(join(R.state, "archive", "1-b1")).map((f) => JSON.parse(readFileSync(f, "utf8")) as Obj);
  assert.equal(d9.length, 1, "the D9 = the archived bundle, one state.json");
  const onServed = aggregate(readJson(join(R.pub, "state.json")).runs as Obj[]), onD9 = aggregate(d9);
  assert.deepStrictEqual(onServed, onD9);
  const all = Object.values(onD9.byRegime);
  assert.ok(all.some((b) => b.withGt > 0) && all.some((b) => b.abstain > 0), "non-vacuity: a g_t and an abstention are aggregated");
});
