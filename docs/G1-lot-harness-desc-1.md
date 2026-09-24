# G1 HARNESS-DESC-1 (Opus 5.5) — description gate conditionnelle au registre

Modèle résolu : claude-opus-5-5[1m]

# HARNESS-DESC-1 : rendu du G1

C'est fait. Quand le registre est vide (l'état livré), la description servie de `gate` ne revendique plus aucune couverture. Rien n'est committé (R-20) : la branche `lot/harness-desc-1` est toujours à `153582f` et `F:\Monark` ne porte aucune modification. Les corrections C-1..C-9 du checkpoint-1 ont été intégrées avant le code, ruling COND compris.

## Ce qui a changé
- **Code** (`apps/harness/src/tools/gate.ts:194,220`) : `describeGate(registryHasLiq)` est une fonction pure, et `GATE_TOOL_DESCRIPTION = describeGate(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE))`.
  - Registre vide : la description porte EMPTY ; REQ ; COND.
  - Registre non vide : elle reprend le texte d'avant le lot, octet pour octet. Le sha256 de `describeGate(true)` vaut `5574450432b7…ed77`, soit l'ancienne description.
- **Surface servie** : seules deux valeurs changent, la description de `gate` dans `tools/list` et celle de `/gate` dans l'openapi. Le dump avant/après montre `cascade`, `attest`, `calibrate` et la version `0.4.0` inchangés.
- **CA de déploiement (C-5)** : `verify-harness.mjs` gagne deux contrôles, `gate_liq_call` et `mcp_gate_description_liq`, couverts par le test racine `test/verify-harness-liq.test.ts`. J'ai aussi ajouté ces deux contrôles à la liste de l'étape 6 de `docs/RUNBOOK-harness.md` (D-7). Contre le harness d'avant le lot, `mcp_gate_description_liq` est rouge : la CA détecte bien la sur-revendication R-10 réelle.
- **Re-pin h5 (C-6)** : un seul champ change dans la trace, `response_sha256` (`b88cd066…` → `6b78a420…`). La taille reste 21 943 octets et le nouveau pin est `90a21adf…8252`. Le recorder, relancé sur l'arbre fusionné avec `etude-suite`, redonne la même trace octet pour octet ; idem avec `etude-suite` + A-9 en plus.

## Vérifications

| Arbre | Tests (total / passés / échecs / skip) | 7 scripts de l'oracle |
|---|---|---|
| base `153582f` | 921 / 920 / 0 / 1 | tous à 0 |
| **lot** | **927 / 926 / 0 / 1** | tous à 0 |
| `etude-suite` `071b3ee` + lot | 939 / 937 / 0 / 2 | tous à 0 |
| `etude-suite` `1744b6f` + A-9 + lot | 943 / 941 / 0 / 2 | tous à 0 |

- Les skips sont nommés et existaient déjà : `u4b_labels_replay_via_main_real_artifact` partout, plus le skip win32 de NARABI-OPS-1d dans les clones.
- **Mutants** : 25 sur 25 sont tués par le test attendu (critère A-11 sur la sortie TAP) et restaurés octet pour octet, sur le worktree comme sur l'arbre avec A-9. Ils couvrent les 7 mutants exigés par C-3, ceux de la mission, l'injection de mots bannis de A-9 et la lecture préservée / sortie altérée de A-10.
- **R-25** : 350 lignes avec le pathspec exact de `ci.yml:65`, donc sous 400.
- **Gel** : les 9 sha gelés sont identiques avant, après et sur l'arbre fusionné.
- **Fusion avec A-9** : propre, les commentaires que A-9 modifie dans `gate.ts` ne sont pas touchés.

## Ce qui reste ouvert
- **Survivant déclaré R-HD-1** : si l'on code en dur `describeGate(false)` au site d'appel, aucun test ne rougit (mesuré). Tant que le registre est vide, on ne peut pas le distinguer du vrai branchement. Il sera tué par l'item C-4, déclenché au G1 de -2b.
- **Item C-4** (-2b / 2b-7) : il est rédigé dans l'amendement ADR.
- **Avant le redéploiement** : lancés contre le processus actuellement en ligne (antérieur à -2a), les deux nouveaux contrôles de la CA seront rouges. C'est attendu, pas un défaut du lot ; ils passeront au vert une fois le harness redéployé à un SHA qui contient ce lot.
- **Sortie de la CA sous Windows** : en cas d'échec, la CA sort avec le code 3221226505 au lieu de 1. J'ai vérifié que c'était déjà le cas avec le script d'avant le lot (3 fois sur 3). La sortie reste non nulle, et le RUNBOOK traite déjà tout code non nul comme un échec.
- **Écarts à la mission** (D-1..D-7, détaillés dans le rapport) : les deux principaux sont que le « mécanisme existant » d'injection du registre n'existe pas (remplacé par la correction cp-1 C-2 (ii)), et que la clause vide suit le ruling EMPTY + REQ + COND.

## À faire de ton côté
- Insérer `F:\tmp\hdesc1\ADR-amendement.md` dans `docs/adr/ADR-U4b-calibration-episode-frais.md` (C-8, avec l'`error_origin` générateur et vérification pour -2a).
- Supprimer les clones de travail `F:\tmp\hdesc1\merge-tree` et `merge-a9` : `rm-nm.ps1` d'abord, jamais `Remove-Item -Recurse` directement.

## Fichiers
Dans `F:\tmp\hdesc1\` :
- G1.md (rapport complet, avec la section « Corrections cp-1 C-1..C-9 : état »)
- ADR-amendement.md
- DELIVERED.sha256 (9 fichiers)
- mutants.mjs
- survivors.mjs
- logs\

Fichiers du lot dans `F:\Monark-wt-hdesc1\` :
- `apps\harness\src\tools\gate.ts`
- `apps\harness\test\gate-liq.test.ts`
- `apps\harness\test\gate.test.ts`
- `test\h5-e2e-probe.test.ts`
- `test\verify-harness-liq.test.ts`
- `fixtures\h5-e2e-trace.json`
- `fixtures\PROVENANCE-h5-e2e-trace.md`
- `scripts\verify-harness.mjs`
- `docs\RUNBOOK-harness.md`
