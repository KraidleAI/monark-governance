// MONARK — "flat" ESLint configuration, ADR-M003 D9 + addendum D9 ter (2026-09-06).
//
// STATUS: EXECUTABLE and MEASURED (TS 6.0.3, classic compiler API) — the toolchain blocker
// (NATIVE TS 7 port without the classic API) is resolved by addendum D9 (2026-09-05, option c:
// typescript pinned 6.0.3). The SCOPE of the violations is settled by addendum D9 ter:
//
//   §2  no-floating-promises: handled by the DOCUMENTED option `allowForKnownSafeCalls` targeting
//       test()/describe()/it() of `node:test` — the promise returned by the runner is handled by
//       the runner (idiom), it is NOT a code defect. The rule is KEPT as an error everywhere
//       else (no disabling). Doc: https://typescript-eslint.io/rules/no-floating-promises/
//       (verified 2026-09-06; plugin @typescript-eslint/eslint-plugin@8.69.0, schema contains
//       `allowForKnownSafeCalls`; "package" form = { from:"package", name:[...], package:"node:test" }).
//
//   §3  test files (**/*.test.ts, test/**): the 6 no-unsafe-*/no-explicit-any rules set to `off`
//       (JSON fixtures handled as `any` in the tests), WITH the measured ratchet `scripts/lint-ratchet.mjs`
//       that RE-ENABLES them on the tests and bounds the count to the committed ceiling `lint-ratchet.json`.
//       The list of the 6 rules is the SINGLE SOURCE `lint-ratchet.json` -> no possible divergence
//       between this config (off) and the ratchet (re-enable/count). Formed pending (D9 ter §3):
//       typing of the test fixtures, target ceiling 0 before checkpoint 2 of Phase 3.
//
// Installed versions, pinned EXACT (npm registry, R-8):
//   eslint@10.10.0  ·  typescript-eslint@8.69.0  ·  typescript@6.0.3
import tseslint from "typescript-eslint";
import ratchet from "./lint-ratchet.json" with { type: "json" };

// Off-map of the 6 deferred-typing rules in the tests — DERIVED from lint-ratchet.json (single source).
const testDeferredOff = Object.fromEntries(ratchet.rules.map((r) => [r, "off"]));

export default tseslint.config(
  // The type-checked linter only sees the project's TypeScript; out-of-program JS/MJS/CJS are ignored.
  { ignores: ["node_modules/**", "dist/**", "**/*.js", "**/*.mjs", "**/*.cjs"] },
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // D9 ter §2 — node:test: test()/describe()/it() return a promise HANDLED by the runner.
      // Rule kept as an error; only these known-safe calls are exempted.
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            { from: "package", name: ["test", "describe", "it"], package: "node:test" },
          ],
        },
      ],
    },
  },
  {
    // D9 ter §3 — test files: 6 no-unsafe-*/no-explicit-any rules OFF (fixtures as any).
    // Tracked by the ratchet scripts/lint-ratchet.mjs (re-enable + ceiling). Globs = those of the ADR.
    files: ["**/*.test.ts", "test/**"],
    rules: testDeferredOff,
  },
);
