/**
 * Root test `contracts_frozen` — ADR-M002 D2 / D13 (CA-0).
 * Throughout Phase 1, `schemas/*.json` and `packages/contracts/src/**` stay byte-identical to the
 * frozen manifest below (sha256 of the content, LF): the Phase 0 commit `357ef25`, re-baselined once
 * by the ADR-M001 D9-bis annotation-only erratum (the 5 schema `description`/`title` reissued in
 * English — NO `schema_version` bump, no data-shape change). Any drift = red. A DATA-SHAPE contract
 * evolution goes through an ADR + a `schema_version` bump; an ANNOTATION-ONLY erratum
 * (`description`/`title`, no bump) goes through an ADR too — both then re-baseline this manifest in
 * the same commit. Re-baselined again by ADR-M008 D9: a NEW frozen contract `AttestedFlow`
 * (schemas/attested-flow.schema.json, the 5th) + its TS binding in packages/contracts/src/** +
 * forbidden-keys extension (peg_score/p_depeg/nav) — a new file and new keys, the 4 existing
 * contracts unchanged.
 * Re-baselined again by ADR-U1b D1: a NEW frozen contract `AttestedBook`
 * (schemas/attested-book.schema.json, the 6th) + its TS binding in packages/contracts/src/**: a new file,
 * NO forbidden-keys change (D1, the closed schema suffices), the 5 existing contracts byte-unchanged.
 * Re-baselined again by ADR-U1b D2ter (lot U-1b-a-bis, investor decision V-6 (b)): `residual` now carries
 * `contains: {const: "no_third_party_verifier"}` — one schema line, same schema_version (Option A), no new data key.
 * Run by `npm test` in EACH worktree (outside per-lot counting).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const FROZEN_MANIFEST: Record<string, string> = JSON.parse(
  readFileSync(join(ROOT, "test", "contracts-frozen.manifest.json"), "utf8"),
) as Record<string, string>;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function sha256(path: string): string {
  const buf = readFileSync(path);
  const lf = buf.toString("utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(lf, "utf8").digest("hex");
}

function currentManifest(): Record<string, string> {
  const files = [
    ...walk(join(ROOT, "schemas")),
    ...walk(join(ROOT, "packages", "contracts", "src")),
  ];
  const m: Record<string, string> = {};
  for (const f of files) {
    const key = relative(ROOT, f).split(sep).join("/");
    m[key] = sha256(f);
  }
  return m;
}

test("contracts_frozen — schemas/ and packages/contracts/src/ match the current frozen manifest (357ef25 baseline, re-pinned by ADR-M001 D9-bis + ADR-M008 D9 + ADR-U1b D1; not pure Phase 0)", () => {
  const now = currentManifest();
  const frozenKeys = Object.keys(FROZEN_MANIFEST).sort();
  const nowKeys = Object.keys(now).sort();
  assert.deepEqual(nowKeys, frozenKeys, "file added or removed in the frozen zone (ADR required)");
  for (const k of frozenKeys) {
    assert.equal(now[k], FROZEN_MANIFEST[k], `content modified in the frozen zone: ${k} (ADR required)`);
  }
});

test("contracts_frozen — the manifest is not empty and covers the 7 schemas", () => {
  const keys = Object.keys(FROZEN_MANIFEST);
  assert.ok(keys.length >= 10, `manifest too short: ${keys.length}`);
  const schemas = keys.filter((k) => k.startsWith("schemas/")).length;
  assert.equal(schemas, 7, "expected: 6 schemas (attested-price, attested-flow, attested-book, prediction, coverage-verdict, gate-decision) + forbidden-keys.json");
});
