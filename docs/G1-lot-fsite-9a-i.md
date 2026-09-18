# G1 — Journal de provenance, lot F-site-9a-i (modèle / machine / audit purs + tests)

## Provenance
- **Modèle résolu (worker)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme roster épinglé ; effort max). Contrôle de résolution R-1 fait.
- **Date** : 2026-09-18. **Dépôt** : `F:\Monark`, HEAD `ca15080` (arbre propre au départ sauf `docs/PLAN-Fsite-9-sas.md` non suivi).
- **Rattachement** : `PLAN-Fsite-9-sas.md` §2 (F-site-9a-i) ; modèle `MODELE-ILLUSTRATION.md` §3/§4/§5/§7/§8 ; `BRIEF.md` addenda 6/6 bis [lu] ; ADR-M004 **D18** (corrigé C-1).
- **Réviseur** : orchestrateur (G2 fraîche + checkpoint-2 + G7). Le worker ne committe pas (R-20) ; sortie vérifiable adversarialement (R-21).
- **Périmètre** : fichiers NOUVEAUX uniquement + addendum ADR. Zéro dépendance installée (sous-lot zéro `three`). Aucun fichier touché hors liste.

## Fichiers livrés + sha256
| Fichier | sha256 |
|---|---|
| `apps/site/components/sas/sas-model.ts` | `7da3bee6… (post-G2 C-4 ; initial 8354a8a5…)` |
| `apps/site/components/sas/sas-machine.ts` | `a10a710a1671c2216e83355b5f0dc09e584e76c66fdbf4377098f5263eb8c5d9` |
| `apps/site/components/sas/sas-audit.ts` | `3203b910718a630ba03727248a1d47e9e4de457a724e31c32b1e2a517cd92b07` |
| `apps/site/components/sas/use-sas-state.ts` | `6b5c6b2563e50cee802a924f6402b314d73be0d6b3819890cc845776fa1b6357` |
| `test/sas-model.test.ts` | `46ce68bb084828900acea42240793b8ed45f7d87bf6cfe7a10cbd0078a5ca422` |
| `test/sas-machine.test.ts` | `fe1b0dd871ed7c666c3f8816806d2620eadc67dc614410a53f2bdcaf888c8c03` |
| `test/sas-audit.test.ts` | `878f9e448236dc04897befb3ae8c28dc01919527862a1210358306f69375688d` |
| `docs/adr/ADR-M004-infrastructure-plateforme.md` (mod, D18 corrigé C-1) | `1dfc8264… (octets LF = blob commis ; post-G2 C-1/C-2 + rectificatif 6 quater ; initial 275c23f8…)` |

## Architecture (client-safe + resolver-neutral, mesuré sur les fichiers finaux)
Les trois modules purs `sas-model.ts`/`sas-machine.ts`/`sas-audit.ts` **n'importent aucune valeur** de `lib` et **aucun `node:`** (le hook `use-sas-state.ts`, client, importe la valeur `PICKER_PROFILES` — G2 C-3) : les types viennent par `import type … .ts` (élidés), les registres/enums/`required[]` sont **injectés en paramètres** (précédent `hikae-panel`). La composition (dérivation + réducteur + audit) est faite par les tests racine (nodenext) et par le hook client `use-sas-state.ts` (alias `@/`, jamais dans le programme racine). Résultat : les livrables type-checkent sous les DEUX programmes.

Mesures d'import (reproductibles) :
- `import { X } from "../../lib/fleet.ts"` (valeur, `.ts`) sous `apps/site/tsconfig.json` (bundler) → **TS5097** (rouge).
- `import type { X } from "../../lib/fleet.ts"` (type seul, `.ts`) → **OK sous bundler ET nodenext** (élidé). Forme retenue.
- `import { X } from "../../lib/fleet.js"` (valeur, `.js`) → typecheck OK mais **`node --test` runtime KO** (`ERR_MODULE_NOT_FOUND` : pas de `fleet.js` sur disque). Rejetée.
- Preuve finale : `npx tsc --noEmit -p apps/site/tsconfig.json` → **exit 0** (baseline aussi exit 0, donc attribuable) ; `npm run typecheck` (racine nodenext) → **exit 0** ; `grep -rn "node:" components/sas/` → seulement de la prose de commentaire, **aucun import** `node:`.

## Oracle (brut)
- `npm run ci` (gate:vocab + typecheck + test) → **exit 0** ; `ℹ tests 263 · pass 263 · fail 0` (256 base + 7 nouveaux). Stable sur 2 relances.
- `npm run typecheck` → exit 0. `npx tsc --noEmit -p apps/site/tsconfig.json` (bundler) → exit 0.
- `npm run lint` (`eslint .`) → exit 0. `npm run lint:ratchet` → **69/69** (0 violation ajoutée par les tests neufs).
- `npm run lang:gate` → **exit 0** (le PREMIER run avait rougi 1 hit `inchangé` [diacritic] dans `test/sas-machine.test.ts:56` — corrigé en anglais ; preuve d'oracle non-inerte, pas de contournement).
- `npm run export:check` → exit 0. `npm run gate:vocab` → OK. `git diff --check` → exit 0.
- Auto-contrôle `frozen_contract_fields_stay_dynamic` : grep des 26 champs gelés (quotes/backtick) sur `components/sas/**` → **0 hit**.
- Note transitoire : une relance `ci` isolée a affiché `260/259/1` pendant que l'orchestrateur écrivait des fichiers docs concurremment (course de lecture) ; non reproductible, `263/263/0` stable après.

## Mutants (un nommé par test/invariant ; appliqué → rouge avec message → revert avec sha256 identique avant/après)
Runner reproductible : `scratchpad/mutants.mjs` (sha256 AVANT, mutation, `node --test <cible>`, restauration verbatim, sha256 APRÈS, assert AVANT==APRÈS). Les 12 sont RED + restaurés byte-identique (sha256 du fichier cible inchangé, cf. table ci-dessus).

| Mutant | Test tué | Assertion touchée | Message rouge |
|---|---|---|---|
| M1 | `sas_model_matches_registers` | Hikae `["calibrate"]` ≠ `["calibrate","gate"]` | strictly deep-equal |
| M2 | `sas_monark_is_container_not_piece` | `CONTAINER="Hikae"` → collision pièce | `MONARK must not be a piece` / `assert.equal(CONTAINER,"MONARK")` |
| M3 | `sas_defidrama_absent` | jeton hors-scope injecté | `the out-of-scope name appears under apps/site: …/sas-model.ts` |
| M4 | `sas_audit_reasons_from_frozen_enum` | `upstream_timeout` retiré du mapping | `code upstream_timeout maps to no chamber (coverage hole)` |
| M5 | `sas_states_closed` I1 | S1 change `downstream` | strictly deep-equal (`s1.downstream` vs `S0.downstream`) |
| M6 | `sas_states_closed` I2 | clockClose ne vide pas la brume | strictly equal (`s2c.brume` ≠ null) |
| M7 | `sas_states_closed` I3 | `valveClosed:false` en budgetLow | strictly equal (`s3.valveClosed`) |
| M8 | `sas_states_closed` I4 | S4 `litPieceKeys=[]` | strictly deep-equal (lit ≠ engineKeys) |
| M9 | `sas_states_closed` I5 | calm ne réinitialise pas | strictly deep-equal (`reduce(s4,calm)` ≠ S0) |
| M10 | `sas_spine_single_definition` | `SPINE=CHAMBER_ORDER.slice(1)` | strictly deep-equal (diagonale 4 chambres) |
| M10-bis | `sas_spine_single_definition` | 2ᵉ occurrence textuelle `export const SPINE` | `SPINE must be defined exactly once` (`defs.length===1`) |
| M11 | `sas_audit_labels_from_required` | `FIELD.REGION 5→4` | strictly equal (`required[5]="region"`) |

## R-25
- Fichiers nouveaux (7) : 641 lignes. Addendum ADR-M004 D18 : +9 lignes. **Total lot = 650** (< 1205, < 700 visé). G1 exclu du compte.
- `docs/PLAN-Fsite-9-sas.md` et `docs/PLAN-Fsite-9aii-diagram.md` sont **non suivis mais NON produits par ce worker** (artefacts orchestrateur, mtime 06:24/06:33) — à **ne pas imputer** au lot.

## Déviations déclarées
1. **D18(b) `three` — conflit résolu par correction C-1 (coordinateur).** La mission d'origine demandait D18(b) = installer `three@0.186.0`+`@types/three@0.186.0` ; pendant la session, `PLAN-Fsite-9-sas.md` (base de mission) a été amendé (BRIEF addendum 6 [lu]) : 3D **abandonnée**, `three` **caduc**, 9a-ii = diagramme SVG. Signalé, puis le coordinateur a émis la **correction C-1** : D18(b) **sans `three`**, providers **et** blockchains avec cadrage rendu. **Appliqué** dans D18. 9a-i inchangé (les modules purs « restent valides et alimentent le diagramme », BRIEF add. 6).
2. **7ᵉ test `sas_audit_labels_from_required` — AJOUT assumé** (au-delà des 6 noms exigés, tous présents verbatim). Justification : AC-5 « libellés depuis `required[]` » + épinglage non-vacuité des index `FIELD` contre le schéma chargé (motif C-9) ; tué par M11. Déclaré pour la G2.
3. **`FIELD` = littéraux numériques non rendus** (précédent `ACTION_ABSTAIN = 2`, `OUTPUT_LANES`), épinglés au racine contre `required[]` chargé (`required[FIELD.REGION]==="region"`, quotable hors apps/site). honesty-lint ne scanne que les positions rendues (JSX) ; ces modules n'en ont aucune.

## Clôture (orchestrateur, 2026-09-18)
G2 fraîche : `docs/G2-lot-fsite-9a-i.md` (APPROUVÉ-AVEC-CORRECTIONS C-1..C-4, appliquées). Checkpoint-2 validateur : ACCEPTE-AVEC-CORRECTIONS C-1 (ADR D18
rectificatif 6 quater), C-2 (ce G1 : base de commit réelle = `ba71cae`, sources + 6 quater, sha post-corrections ci-dessus, oracle 264/264 dans l'arbre
composite avec M012-f), C-3 (G2 persisté), C-4 (item « animation d'états » détaillé au PLAN 9a-ii §8 C-5) — appliquées. G7 : rejoué 264/264, lint 0,
ratchet 69/69, export 0, lang 0, diff --check propre ⇒ ACCEPTÉ ; commit des 9 chemins du lot seulement.
