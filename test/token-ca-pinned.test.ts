/**
 * Root governance test `token_ca_pinned`. The MONARK token contract address (CA) is a COMMUNITY
 * REQUIREMENT (investor ruling 2026-09-16): it must stay in the public repo and must NEVER be stripped by
 * a "built-vs-named" / honesty cleanup. This pins the exact mint literal on BOTH public surfaces — the
 * `/token` page and the README — so a removal on either reds in CI (a non-LLM oracle). Lives at the repo
 * root (the `npm test` glob is `test/*.test.ts`); `apps/site/test/**` is dormant at export, this is not.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CA = "FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT";
const ROOT = join(import.meta.dirname, "..");

test("token_ca_pinned — the community CA is present on both public surfaces (never stripped)", () => {
  const tokenPage = readFileSync(join(ROOT, "apps", "site", "app", "token", "page.tsx"), "utf8");
  assert.ok(tokenPage.includes(CA), "the token CA must remain on the /token page");
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  assert.ok(readme.includes(CA), "the token CA must remain in the README (investor community requirement 2026-09-16)");
});
