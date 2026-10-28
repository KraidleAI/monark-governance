/**
 * Root oracle `site_next_is_at_or_past_the_fixed_release` (the site's Next.js security fix, 2026-10-28).
 *
 * `npm audit` of the g6-compliance job (`--audit-level=high`) rated next 16.0.0 to 16.4.0 critical, under three advisories
 * (GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r), and named next@16.4.3 as the release its fix installs;
 * the site pinned 16.3.8 and runs as a Next server (`next start`, docs/RUNBOOK-vitrine.md l.4). This test holds the pins of
 * `next` and `@next/mdx` in apps/site/package.json, and the versions the lockfile resolves for them, at or past 16.4.3, so
 * that no later edit puts the site back on an affected release without a red test. The audit itself stays the g6-compliance
 * job's: it reads the registry, which a unit test does not.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const FLOOR = "16.4.3"; // the release npm audit's fix installs for the three advisories
const PINNED = ["next", "@next/mdx"];

/** Compares two exact x.y.z releases: negative, zero or positive. */
const compare = (a: string, b: string): number => {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};

// killer: apps/site/package.json:20 CONST "16.4.3" -> "16.3.8"
// killer: apps/site/package.json:16 CONST "16.4.3" -> "16.3.8"
test("site_next_is_at_or_past_the_fixed_release — next and @next/mdx are pinned to one exact release at or past 16.4.3, and the lockfile resolves the same", () => {
  const site = JSON.parse(readFileSync(join(ROOT, "apps", "site", "package.json"), "utf8")) as { dependencies?: Record<string, string> };
  const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8")) as { packages: Record<string, { version?: string }> };
  for (const name of PINNED) {
    const pin = site.dependencies?.[name] ?? "";
    assert.match(pin, /^\d+\.\d+\.\d+$/, `${name} is pinned to one exact release in apps/site/package.json, no range: ${pin}`);
    assert.ok(compare(pin, FLOOR) >= 0, `${name} ${pin} is below ${FLOOR}, the release npm audit's fix installs for next 16.0.0 to 16.4.0`);
    const resolved = lock.packages[`node_modules/${name}`]?.version ?? "";
    assert.equal(resolved, pin, `the lockfile resolves ${name} to its pin`);
  }
});
