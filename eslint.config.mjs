// MONARK — configuration ESLint « flat », ADR-M003 D9 + addendum D9 ter (2026-09-06).
//
// STATUT : EXÉCUTABLE et MESURÉ (TS 6.0.3, API classique du compilateur) — le blocage toolchain
// (portage NATIF TS 7 sans l'API classique) est résolu par l'addendum D9 (2026-09-05, option c :
// typescript épinglé 6.0.3). Le PÉRIMÈTRE des violations est tranché par l'addendum D9 ter :
//
//   §2  no-floating-promises : traité par l'option DOCUMENTÉE `allowForKnownSafeCalls` ciblant
//       test()/describe()/it() de `node:test` — la promesse retournée par le runner est gérée par
//       le runner (idiome), ce n'est PAS un défaut de code. La règle est CONSERVÉE en erreur partout
//       ailleurs (aucune désactivation). Doc : https://typescript-eslint.io/rules/no-floating-promises/
//       (vérifiée le 2026-09-06 ; plugin @typescript-eslint/eslint-plugin@8.69.0, schéma contient
//       `allowForKnownSafeCalls` ; forme « package » = { from:"package", name:[...], package:"node:test" }).
//
//   §3  fichiers de test (**/*.test.ts, test/**) : les 6 règles no-unsafe-*/no-explicit-any en `off`
//       (fixtures JSON manipulées en `any` dans les tests), AVEC cliquet mesuré `scripts/lint-ratchet.mjs`
//       qui les RÉACTIVE sur les tests et borne le compte au plafond commis `lint-ratchet.json`.
//       La liste des 6 règles est la SOURCE UNIQUE `lint-ratchet.json` → aucune divergence possible
//       entre cette config (off) et le cliquet (réactivation/compte). Pendant formé (D9 ter §3) :
//       typage des fixtures de test, objectif plafond 0 avant le checkpoint 2 de la Phase 3.
//
// Versions installées, épinglées EXACTES (registre npm, R-8) :
//   eslint@10.10.0  ·  typescript-eslint@8.69.0  ·  typescript@6.0.3
import tseslint from "typescript-eslint";
import ratchet from "./lint-ratchet.json" with { type: "json" };

// Off-map des 6 règles à typage différé dans les tests — DÉRIVÉE de lint-ratchet.json (source unique).
const testDeferredOff = Object.fromEntries(ratchet.rules.map((r) => [r, "off"]));

export default tseslint.config(
  // Le linter type-checked ne voit que le TypeScript du projet ; JS/MJS/CJS hors programme sont ignorés.
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
      // D9 ter §2 — node:test : test()/describe()/it() renvoient une promesse GÉRÉE par le runner.
      // Règle conservée en erreur ; seuls ces appels connus-sûrs sont exemptés.
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
    // D9 ter §3 — fichiers de test : 6 règles no-unsafe-*/no-explicit-any OFF (fixtures en any).
    // Suivies par le cliquet scripts/lint-ratchet.mjs (réactivation + plafond). Globs = ceux de l'ADR.
    files: ["**/*.test.ts", "test/**"],
    rules: testDeferredOff,
  },
);
