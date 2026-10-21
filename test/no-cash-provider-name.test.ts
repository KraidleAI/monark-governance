/**
 * Root oracle `no_cash_cross_provider_name_in_export` (decision 69, docs/CHANTIERS.md:208; L-6 of lot CI-site).
 *
 * The Bell cash cross-check provider (authorised internally, decision 69) is named on NO public surface of this
 * release (site, README, skills, register, /bell/). This test scans the CONTENT of every EXPORTED file
 * (collectFiles(ROOT).kept) for FORMS of that provider — the brand, the API domain, the env-key name — and reds
 * if any appears (base measured: 0 hit, finding 16).
 *
 * Why a NON-exported test and not vocab-banned.json (C-9): vocab-banned.json is EXPORTED
 * (scripts/export-public.mjs WHITELIST_FILES), so writing the provider name there would PUBLISH the very name it
 * bans — an auto-destructive mechanism. The forbidden LITERALS therefore live ONLY in this file and in the shared module
 * test/helpers/provider-forms.ts (CASH_CROSS_CHECK_FORMS), both repo-root test/ files that are NEVER exported (asserted
 * below). `docs/` is not exported either, so the name may sit in the G0 prose; only the match literals stay confined to
 * these two files.
 *
 * Soundness note (docs/PLI-lot-ci-site.md): `\bmassive\b` is a CONSERVATIVE over-match (the adjective "massive"
 * would also red) — accepted because the measured base is 0 hit and MONARK's public copy is disciplined. A bare
 * "Polygon" (the blockchain) and a bare "Massive" that is NOT a whole word stay green (the imposed control):
 * the domain (`polygon.io`) and env-key (`POLYGON_API_KEY`) forms are specific; only the whole brand word reds.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { collectFiles } from "../scripts/export-public.mjs";
import { publishedRun } from "../apps/bell/test/helpers/bell-served.ts";
import { CASH_CROSS_CHECK_FORMS } from "./helpers/provider-forms.ts";

const ROOT = join(import.meta.dirname, "..");

// FORMS of the cash cross-check provider (decision 69), read from the shared non-exported module (lot 1d-ii, C-6).
const PROVIDER_FORMS = CASH_CROSS_CHECK_FORMS;

// Binary whitelist entries carry no prose (out/logo.png, out/banner.jpg); read only text.
const BINARY = /\.(png|jpg|jpeg|gif|ico|webp|woff2?|ttf|otf)$/i;

test("no_cash_cross_provider_name_in_export — no cash cross-check provider form in any exported file (decision 69, L-6)", () => {
  const kept = collectFiles(ROOT).kept;
  assert.ok(kept.length >= 80, `implausibly few exported files (${kept.length}) — false green?`);

  // Self-check: the literals live in a repo-root test/ file, which is NEVER exported (else they would leak).
  assert.ok(!kept.some((f) => f.rel.startsWith("test/") && f.rel !== "test/helpers/blocking-stdout.cjs"), "no repo-root test/ file may be exported (the provider literals here would leak into the public tree)");

  const hits: string[] = [];
  for (const f of kept) {
    if (BINARY.test(f.rel)) continue;
    readFileSync(f.abs, "utf8").split(/\r?\n/).forEach((line, i) => {
      for (const { re, why } of PROVIDER_FORMS) if (re.test(line)) hits.push(`${f.rel}:${i + 1}  [${why}]  ${line.trim()}`);
    });
  }
  assert.deepEqual(hits, [], `cash cross-check provider form on an EXPORTED surface (decision 69):\n${hits.join("\n")}`);

  // Positive controls — each form OF THE SHARED MODULE, alone, matches its one closed sample (the scan is load-bearing per form,
  // and a form weakened in the module reds here); the list of forms is closed on the samples.
  const samples: Record<string, string> = {
    "cash cross-check provider brand (whole word; conservative over-match)": "the close is cross-checked against Massive",
    "cash cross-check provider API domain": "provider: 'polygon.io'",
    "cash cross-check provider env-key name": "no POLYGON_API_KEY set, cross-check skipped",
  };
  assert.deepEqual(PROVIDER_FORMS.map((p) => p.why).sort(), Object.keys(samples).sort(), "the closed list of cash cross-check forms");
  for (const { re, why } of PROVIDER_FORMS) assert.ok(re.test(samples[why] ?? ""), `form "${why}" must match its sample (mutant: the name in an exported README)`);

  // Negative controls (imposed) — a bare "Polygon" (blockchain) and unrelated words stay GREEN (never a bare Polygon).
  for (const green of ["the token is also deployed on Polygon", "a large redemption window", "a polygonal mesh"]) {
    assert.ok(!PROVIDER_FORMS.some((p) => p.re.test(green)), `must stay green (no bare Polygon / adjective false-positive): ${green}`);
  }
});

// T-1b S-5 (f) (ADR-T1b-backend D5, R-T1b-2): the SAME forms (single source: PROVIDER_FORMS above) on every file Bell SERVES, as the
// real publisher writes them from a REAL runMain run (offline) whose own provenance DOES name the ADV source with one of these
// forms (non-vacuity): the projection drops it, nothing of it reaches public/.
test("no_cash_cross_provider_name_on_bell_served_files", async () => {
  const r = await publishedRun();
  assert.ok(PROVIDER_FORMS.some((p) => p.re.test(JSON.stringify(r.d9Prov))), "the run's provenance (input, never served) carries a provider form");
  const walk = (rel: string): string[] => readdirSync(join(r.pub, rel)).flatMap((n) => (statSync(join(r.pub, rel, n)).isDirectory() ? walk(join(rel, n)) : [join(rel, n)]));
  const served = walk("");
  assert.ok(served.length >= 6, `implausibly few served files (${served.length})`);
  const hits = served.flatMap((f) => readFileSync(join(r.pub, f), "utf8").split(/\r?\n/).flatMap((line, i) => PROVIDER_FORMS.filter((p) => p.re.test(line)).map((p) => `public/${f}:${i + 1} [${p.why}]`)));
  assert.deepEqual(hits, [], `a cash provider form on a Bell served file (decision 69):\n${hits.join("\n")}`);
  // C-7 (R-T1b-2, BOTH fields): the key names close_source / adv_source and their VALUES, read from the input provenance (no new literal)
  const src = (r.d9Prov.sources ?? {}) as Record<string, unknown>, forms = ["close_source", "adv_source"].flatMap((k): Array<[string, string]> => [[k, `${k} name`], [String(src[k]), `${k} value`]]);
  assert.ok(typeof src.close_source === "string" && typeof src.adv_source === "string", "both sources are named in the run's input provenance (non-vacuity)");
  const leaks = served.flatMap((f) => { const t = readFileSync(join(r.pub, f), "utf8").toLowerCase(); return forms.filter(([n]) => t.includes(n.toLowerCase())).map(([, w]) => `public/${f}: ${w}`); });
  assert.deepEqual(leaks, [], "a cash source field (name or value) on a Bell served file (decision 69)");
});
