// scripts/lint-ratchet.mjs — CLIQUET de dette de typage différé dans les fichiers de test.
// ADR-M003 addendum D9 ter §3 (2026-09-06). Lot V DEVOPS, MONARK Phase 2.
//
// D9 ter §3 met les 6 règles no-unsafe-*/no-explicit-any en `off` sur **/*.test.ts et test/**
// (fixtures JSON manipulées en `any`). Sans garde, cette dette pourrait croître silencieusement.
// Ce cliquet RÉACTIVE ces 6 règles EN ERREUR sur les tests seulement (via overrideConfig, appliqué
// APRÈS eslint.config.mjs — c'est donc l'inverse exact du bloc `off`), COMPTE les violations, et
// ÉCHOUE (exit 1) si le compte dépasse le plafond commis `lint-ratchet.json`.
//
//   - Source unique des 6 règles = lint-ratchet.json `rules` (partagée avec eslint.config.mjs).
//   - Fail-closed : plafond non entier/absent, `rules` vide, ou message fatal/sans-règle (parse
//     cassé, config cassée) ⇒ exit 1. Sans cela, un config cassé donnerait 0 message → « 0/92 » →
//     faux vert (gate décoratif). Le compteur n'est fiable QUE si le run est sain.
//   - Job CI g4 = `npm run lint && npm run lint:ratchet` (le lint généraliste d'abord).
//
// Pendant formé (D9 ter §3) : typer les fixtures (parse + validation ajv typée), un lot par package
// (S, I, K), objectif plafond 0 avant le checkpoint 2 de la Phase 3. Toute baisse abaisse le plafond.
import { ESLint } from "eslint";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const ratchetPath = join(root, "lint-ratchet.json");

let ratchet;
try {
  ratchet = JSON.parse(readFileSync(ratchetPath, "utf8"));
} catch (e) {
  console.error(`::error:: lint-ratchet: lecture/parse de lint-ratchet.json impossible (${e.message}). Fail-closed.`);
  process.exit(1);
}

// Validation fail-closed du plafond et de la liste de règles.
if (!Number.isInteger(ratchet.ceiling) || ratchet.ceiling < 0) {
  console.error(`::error:: lint-ratchet: plafond invalide (ceiling=${JSON.stringify(ratchet.ceiling)}) ; entier >= 0 requis. Fail-closed.`);
  process.exit(1);
}
if (!Array.isArray(ratchet.rules) || ratchet.rules.length === 0) {
  console.error("::error:: lint-ratchet: `rules` absent ou vide dans lint-ratchet.json. Fail-closed.");
  process.exit(1);
}

const tracked = new Set(ratchet.rules);
const reenable = Object.fromEntries(ratchet.rules.map((r) => [r, "error"]));

// overrideConfig est fusionné APRÈS eslint.config.mjs → pour les tests, `error` gagne sur le `off` de base.
const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["**/*.test.ts", "test/**"],
      rules: reenable,
    },
  ],
});

const results = await eslint.lintFiles(["."]);

let count = 0;
let fatal = 0;
for (const res of results) {
  for (const m of res.messages) {
    // Fail-closed : erreur fatale (parse) ou message sans règle ⇒ le run n'est pas sain, compte non fiable.
    if (m.fatal || m.ruleId == null) {
      fatal++;
      const rel = res.filePath.replace(root, "").replace(/^[\\/]/, "");
      console.error(`::error:: lint-ratchet: message fatal/sans-règle à ${rel}:${m.line ?? "?"} — ${m.message}`);
      continue;
    }
    if (tracked.has(m.ruleId)) count++;
  }
}

if (fatal > 0) {
  console.error(`::error:: lint-ratchet: ${fatal} message(s) fatal(aux)/sans-règle — parse ou config cassé, compte NON fiable. Fail-closed (exit 1).`);
  process.exit(1);
}

const ceiling = ratchet.ceiling;
console.log(`lint-ratchet: ${count}/${ceiling} (violations de typage differe dans les tests / plafond commis, measured_on ${ratchet.measured_on})`);

if (count > ceiling) {
  console.error(`::error:: lint-ratchet ECHEC : ${count} > plafond ${ceiling}. Nouvelle dette de typage dans les tests bloquee (D9 ter S3). Typez les fixtures (parse + ajv) au lieu d'ajouter des \`any\`.`);
  process.exit(1);
}
if (count < ceiling) {
  console.log(`lint-ratchet: NOTE — compte (${count}) < plafond (${ceiling}) : la dette a baisse ; abaissez le plafond a ${count} et commettez lint-ratchet.json (D9 ter S3, « toute baisse abaisse le plafond »).`);
}
process.exit(0);
