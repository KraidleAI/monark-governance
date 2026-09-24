/**
 * Root test for the served-Bell facts the storefront renders (lot BELL-SERVED-1; investor decision 155). The data file
 * apps/site/data/bell-served.json is written by scripts/sync-bell-served.mjs from the SERVED files (two GETs, signature
 * checked under the committed keyring); this OFFLINE test pins it: the manifest hash, the first record's fields, the
 * agreement with the committed deploy check docs/deploy-CA-bell.json and the committed keyring (a second, committed
 * witness of the same served bodies), the closed shape (no market value: the only number is seq), the fail-closed
 * loader, and that /bell and /bell/method render these values by property access, never as typed literals.
 * The provider-name literals below live in a repo-root test/ file, which is never exported (same confinement as
 * test/no-cash-provider-name.test.ts, C-9). Non-LLM oracle, run by `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { loadBellServed, BELL_SERVED_REL, BELL_HOST } from "../apps/site/lib/bell-served-load.ts";

const ROOT = join(import.meta.dirname, "..");
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
const sha = (s: string | Buffer): string => createHash("sha256").update(s).digest("hex");
const shaLf = (rel: string): string => sha(Buffer.from(readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n"), "utf8"));

// Pins (read on the served host 2026-09-23T21:53Z by scripts/sync-bell-served.mjs; first line re-hashed independently).
const PINNED_FILE_SHA256 = "c473570439ff029cf7d60e125d06e4dd106fb059594f9e1c421b70dfcd6d0897";
const PINNED = {
  seq: 1,
  published_at: "2026-09-23T21:35:52.438Z",
  line_hash: "4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c",
  key_id: "30fd26e80efac0d93e1f82c5f4372354ec71e5294f36d946d5167ce0ef39c672",
};

test("bell_served_data_is_listed_and_hash_pinned", () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, MANIFEST_REL), "utf8")) as { files: Record<string, string> };
  assert.equal(manifest.files[BELL_SERVED_REL], shaLf(BELL_SERVED_REL), "manifest entry must equal the file's CRLF->LF sha256");
  assert.equal(shaLf(BELL_SERVED_REL), PINNED_FILE_SHA256, "bell-served.json changed: re-run scripts/sync-bell-served.mjs AND re-pin here");
});

test("bell_served_first_record_fields_pinned", () => {
  const d = loadBellServed(ROOT);
  assert.equal(d.host, BELL_HOST);
  assert.equal(d.host, "https://bell.monarkgate.tech");
  assert.deepEqual(d.first_record, PINNED);
  const keyring = JSON.parse(readFileSync(join(ROOT, "apps/bell/keys/bell-keyring.json"), "utf8")) as { keys: Array<{ key_id: string }> };
  assert.ok(keyring.keys.some((k) => k.key_id === d.first_record.key_id), "the first record's key_id must be in the committed keyring (trust root, C-9)");
  assert.ok(Date.parse(d.read_at) >= Date.parse(d.first_record.published_at), "read after publication");
});

test("bell_served_data_matches_deploy_ca", () => {
  const d = loadBellServed(ROOT);
  const ca = JSON.parse(readFileSync(join(ROOT, "docs/deploy-CA-bell.json"), "utf8")) as {
    url: string;
    keyring_sha256: string;
    bodies_sha256: Record<string, string>;
    checks: Array<{ name: string; ok: boolean }>;
  };
  assert.equal(ca.url, d.host, "the deploy check and the site data name the same host");
  assert.ok(ca.checks.length > 0 && ca.checks.every((c) => c.ok), "the committed deploy check is green on every control");
  assert.equal(d.bodies_sha256.timeline, ca.bodies_sha256["/timeline.jsonl"], "timeline body read by the site data = body checked by the deploy CA");
  assert.equal(d.bodies_sha256.pubkey, ca.bodies_sha256["/bell/pubkey.json"], "key set read by the site data = key set checked by the deploy CA");
  assert.equal(d.bodies_sha256.pubkey, ca.keyring_sha256);
  assert.equal(d.bodies_sha256.pubkey, sha(readFileSync(join(ROOT, "apps/bell/keys/bell-keyring.json"))), "served key set = committed keyring bytes");
});

test("bell_served_data_carries_no_market_value", () => {
  const raw = readFileSync(join(ROOT, BELL_SERVED_REL), "utf8");
  const numbers: unknown[] = [];
  const walk = (v: unknown): void => {
    if (typeof v === "number") numbers.push(v);
    else if (v !== null && typeof v === "object") Object.values(v as Record<string, unknown>).forEach(walk);
  };
  walk(JSON.parse(raw));
  // v2: the numbers are seq, the window bounds (ms), fills, sessions_count, each session's n and the residual counts —
  // on-chain counts and instants only; VWAP, base volume and quorum coverage stay decimal STRINGS (served as such).
  const d2 = JSON.parse(raw) as { first_run: { window: { from_utc_ms: number; to_utc_ms: number }; fills: number; sessions_count: number; sessions: { n: number }[]; residuals: Record<string, number> } };
  const allowed = [PINNED.seq, d2.first_run.window.from_utc_ms, d2.first_run.window.to_utc_ms, d2.first_run.fills, d2.first_run.sessions_count, ...d2.first_run.sessions.map((x) => x.n), ...Object.values(d2.first_run.residuals)];
  assert.deepEqual(numbers, allowed, "the only numbers in the file are seq, window bounds, fills, sessions_count, session n and residual counts");
  assert.equal(d2.first_run.sessions.reduce((a, x) => a + x.n, 0), d2.first_run.fills, "fills = sum of session n");
  const PROVIDER_FORMS = [/\bmassive\b/i, /databento/i, /polygon\.io/i, /POLYGON_API_KEY/];
  const scanned = [BELL_SERVED_REL, "apps/site/app/bell/page.tsx", "apps/site/app/bell/method/page.tsx"];
  for (const rel of scanned) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    for (const re of PROVIDER_FORMS) {
      assert.ok(!re.test(text), `${rel} names a data provider (${String(re)}): the close source is described generically (CLOSE-SOURCE-NAMING-1)`);
    }
  }
  assert.ok(PROVIDER_FORMS[1]?.test("close read from databento"), "positive control: the scan is load-bearing");
});

test("bell_served_loader_is_fail_closed", () => {
  const tmp = mkdtempSync(join(tmpdir(), "bell-served-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const good = readFileSync(join(ROOT, BELL_SERVED_REL), "utf8");
    const manifest = JSON.parse(readFileSync(join(ROOT, MANIFEST_REL), "utf8")) as { files: Record<string, string> };
    const put = (body: string, listed: boolean): void => {
      writeFileSync(join(tmp, BELL_SERVED_REL), body);
      const files = { ...manifest.files };
      if (listed) files[BELL_SERVED_REL] = sha(Buffer.from(body.replace(/\r\n/g, "\n"), "utf8"));
      else delete files[BELL_SERVED_REL];
      writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify({ algorithm: "sha256", files }));
    };
    put(good, true);
    assert.deepEqual(loadBellServed(tmp).first_record, PINNED, "control: an intact copy loads");
    writeFileSync(join(tmp, BELL_SERVED_REL), good.replace(PINNED.published_at, "2026-09-23T21:35:53.438Z"));
    assert.throws(() => loadBellServed(tmp), /sha256 mismatch/, "a tampered file with the old manifest hash throws");
    put(good, false);
    assert.throws(() => loadBellServed(tmp), /not listed/, "an unlisted file throws");
    const d = JSON.parse(good) as Record<string, unknown> & { first_record: Record<string, unknown> };
    put(JSON.stringify({ ...d, first_record: { ...d.first_record, seq: 0 } }), true);
    assert.throws(() => loadBellServed(tmp), /seq/, "a non-positive seq throws even when hashed");
    put(JSON.stringify({ ...d, first_record: { ...d.first_record, vwap: "1" } }), true);
    assert.throws(() => loadBellServed(tmp), /exactly/, "an extra (market) field throws even when hashed");
    put(JSON.stringify({ ...d, first_record: { ...d.first_record, key_id: "not-hex" } }), true);
    assert.throws(() => loadBellServed(tmp), /key_id/, "a malformed key_id throws");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("bell_pages_render_served_values_never_typed", () => {
  const pages = ["apps/site/app/bell/page.tsx", "apps/site/app/bell/method/page.tsx"];
  const data = JSON.parse(readFileSync(join(ROOT, BELL_SERVED_REL), "utf8")) as { bodies_sha256: Record<string, string> };
  const literals = [PINNED.published_at, PINNED.line_hash, PINNED.key_id, ...Object.values(data.bodies_sha256)];
  for (const rel of pages) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    assert.match(text, /loadBellServed\(/, `${rel} must read the served facts through loadBellServed`);
    for (const lit of literals) assert.ok(!text.includes(lit), `${rel} types a served value by hand: ${lit}`);
  }
});
