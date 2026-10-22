// MONARK Bell -- the validation of a run and of a bundle, extracted from the publisher into apps/bell/scripts/bell-validate.mjs: one
// module with no key and no environment, imported by the publisher (and, later, by the collection tick), without changing one byte
// of the --inbox mode. The publisher re-exports the SAME bindings, so its consumers stay unchanged. No network; the publication key
// is fixed (a PKCS#8 Ed25519 key built from a hashed label, precedent test/bell-anchor-timeline.test.ts:21), test only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey } from "node:crypto";
import * as P from "../scripts/bell-publish.mjs";
import * as V from "../scripts/bell-validate.mjs";
import { collectFiles } from "../../../scripts/export-public.mjs";
import { CASH_CROSS_CHECK_FORMS } from "../../../test/helpers/provider-forms.ts";
import { REPO, T_PUBLISH, dropRun, runMainInto, tmp } from "./helpers/bell-served.ts";

const SCRIPTS = join(REPO, "apps", "bell", "scripts");
const KEY = createPrivateKey({ key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"),
  createHash("sha256").update("monark bell validate fixture key, test only").digest()]), format: "der", type: "pkcs8" });
const isCode = (code: string) => (e: unknown): boolean => e instanceof V.BellPublishError && e.code === code;

// The --inbox mode, byte for byte: ONE fixed bundle (the real runMain run of bell-served-e2e plus three collect() runs of the same
// helper, so the sort by bell_sha and the duplicate check run on several runs), the fixed clock T_PUBLISH and the fixed key. The
// constant is the line_hash MEASURED on the base 971eda88, before the extraction (publishToDir of bell-publish.mjs at that commit,
// same bundle, clock and key; measured twice, two temporary directories, same value). The publication is made inside
// doesNotThrow, so a refusal changed into a throw is an assertion too. Every publisher test file passes unchanged.
const BASE_LINE_HASH = "c66c8f3d64c5ba0218d4f4cb53261425378dc0b9b9fec294c8fd8f087ce3ad88";
// killer: apps/bell/scripts/bell-validate.mjs:77 ROR "!== undefined).map" -> "=== undefined).map"
test("bell_publish_inbox_mode_is_unchanged", async () => {
  const base = tmp("bv-inbox-"), state = join(base, "state");
  await runMainInto(join(base, "inbox", "b1", "run0"), base);
  dropRun(base, "b1", 365n, 3);
  mkdirSync(state);
  let r: P.PublishResult | undefined;
  assert.doesNotThrow(() => { r = P.publishToDir({ inboxDir: join(base, "inbox"), stateDir: state, privateKey: KEY, clock: () => T_PUBLISH }); });
  assert.deepEqual([r?.status, r?.seq, r?.line_hash], ["published", 1, BASE_LINE_HASH]);
});

// The publisher re-exports the validation bindings: the SAME objects (===), never copies.
// killer: apps/bell/scripts/bell-publish.mjs:18 SDL "export { REFUSAL_CODES, BellPublishError, BOUNDS, WHITELIST, NOT_SERVED, KEY_SHAPES } from \"./bell-validate.mjs\";" -> ""
test("bell_publish_reexports_the_validate_bindings", () => {
  for (const k of ["BellPublishError", "KEY_SHAPES", "WHITELIST", "NOT_SERVED", "BOUNDS", "REFUSAL_CODES"] as const) {
    assert.ok(V[k] !== undefined, `bell-validate.mjs exports ${k}`);
    assert.equal(P[k], V[k], `bell-publish.mjs re-exports the same ${k}`);
  }
  assert.ok(new P.BellPublishError("schema_mismatch", "x") instanceof V.BellPublishError, "one error class for both modules");
});

// No key, no environment: neither the module nor the chain and the calendar it imports reads process.env or a credential; its imports are
// exactly node:fs, node:path, ./bell-chain.mjs and ../src/sessions.ts (PXB-1, lot 5a), and importing it (a fresh node, every resolved URL
// recorded) never loads bell-publish.mjs.
// killer: apps/bell/scripts/bell-validate.mjs:17 CONST "throw new BellPublishError(code, detail);" -> "throw new BellPublishError(code, process.env.BELL_X ?? detail);"
test("bell_validate_module_reads_no_environment", () => {
  for (const f of ["bell-validate.mjs", "bell-chain.mjs", "../src/sessions.ts"]) {
    const text = readFileSync(join(SCRIPTS, f), "utf8");
    assert.equal(/process\.env|CREDENTIALS_DIRECTORY/.test(text), false, `${f} reads no environment`);
  }
  const specs = [...readFileSync(join(SCRIPTS, "bell-validate.mjs"), "utf8").matchAll(/\bfrom\s+"([^"]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(specs, ["../src/sessions.ts", "./bell-chain.mjs", "node:fs", "node:path"]);
  const js = `import { registerHooks } from "node:module"; const seen = [];
registerHooks({ resolve(s, c, next) { const r = next(s, c); seen.push(r.url); return r; } });
await import(${JSON.stringify(pathToFileURL(join(SCRIPTS, "bell-validate.mjs")).href)});
process.stdout.write(JSON.stringify(seen.filter((u) => u.startsWith("file:")).map((u) => u.slice(u.lastIndexOf("/") + 1)).sort()));`;
  const r = spawnSync(process.execPath, ["--no-warnings", "--input-type=module", "-e", js], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), ["bell-chain.mjs", "bell-validate.mjs", "sessions.ts"], "the import loads the module, the chain and the calendar only");
});

// The two new files ship in the public export (named, file by file) and carry no form of the cash cross-check provider. The forms
// are IMPORTED from the one module that holds them (test/helpers/provider-forms.ts, never exported), never copied here.
// killer: scripts/export-public.mjs:109 CONST ", \"apps/bell/scripts/bell-validate.mjs\"" -> ""
test("export_ships_bell_validate_and_no_provider_name", () => {
  const forms = CASH_CROSS_CHECK_FORMS.map((f) => f.re);
  assert.equal(forms.length, 3, "the three provider forms are read from their single source");
  const kept = collectFiles(REPO).kept;
  for (const rel of ["apps/bell/scripts/bell-validate.mjs", "apps/bell/scripts/bell-validate.d.mts"]) {
    const f = kept.find((x) => x.rel === rel);
    assert.ok(f !== undefined, `the public export ships ${rel}`);
    const text = readFileSync(f.abs, "utf8");
    assert.deepEqual(forms.filter((re) => re.test(text)).map(String), [], `${rel} names no cash provider`);
  }
});

// validateBundle IS the bundle check of publishToDir: the same refusal (code and detail) on an empty bundle, a bundle over MAX_RUNS
// and a bundle holding the same run twice; on a good bundle it returns the runs sorted by bell_sha.
// killer: apps/bell/scripts/bell-validate.mjs:143 SDL "  runs.forEach((r, i) => { if (seen.has(r.bellSha)) refuse(\"duplicate_run\", `$.runs[${i}].state.bell_sha`); seen.add(r.bellSha); });" -> ""
test("bell_validate_bundle_is_the_publisher_bundle_check", () => {
  const cases: Array<[string, (b: string) => void, Partial<V.Bounds>]> = [
    ["inbox_not_exactly_one_bundle", (b) => { mkdirSync(join(b, "inbox", "b1"), { recursive: true }); }, {}],
    ["too_many_runs", (b) => { dropRun(b, "b1", 365n, 3); }, { MAX_RUNS: 2 }],
    ["duplicate_run", (b) => { dropRun(b, "b1", 365n, 1); cpSync(join(b, "inbox", "b1", "r0"), join(b, "inbox", "b1", "r1"), { recursive: true }); }, {}],
  ];
  for (const [code, make, bounds] of cases) {
    const b = tmp("bv-bundle-"), state = join(b, "state");
    make(b);
    mkdirSync(state);
    let viaValidate: unknown, viaPublish: unknown;
    assert.throws(() => V.validateBundle(join(b, "inbox", "b1"), { ...V.BOUNDS, ...bounds }, T_PUBLISH), (e: unknown) => { viaValidate = e; return isCode(code)(e); }, `validateBundle: ${code}`);
    assert.throws(() => P.publishToDir({ inboxDir: join(b, "inbox"), stateDir: state, privateKey: KEY, clock: () => T_PUBLISH, bounds }), (e: unknown) => { viaPublish = e; return isCode(code)(e); }, `publishToDir: ${code}`);
    assert.equal((viaValidate as V.BellPublishError).detail, (viaPublish as V.BellPublishError).detail, `same detail: ${code}`);
  }
  const b = tmp("bv-bundle-");
  dropRun(b, "b1", 365n, 3);
  const runs = V.validateBundle(join(b, "inbox", "b1"), V.BOUNDS, T_PUBLISH);
  assert.equal(runs.length, 3);
  assert.deepEqual(runs.map((r) => r.bellSha), runs.map((r) => r.bellSha).sort(), "sorted by bell_sha");
});
