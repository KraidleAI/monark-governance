# Revue G2 — lot R-25-séries (ADR-M003 D9 sexies), gel `d3eb9bb` sur `lot/r25-series` (base `58fe309`)

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 (~07:10 UTC). Persisté au pliage du checkpoint-2 (C-3, `error_origin` orchestrateur — troisième occurrence de la classe « G2 non persistée », après K-C2-1 de b2 et C-1 de la clôture P1 ; règle : la G2 est écrite sur disque AVANT le lancement du checkpoint-2).
Méthode : oracle et mutants joués en place, arbre initialement propre ; chaque mutant = muter → `node --test test/ci-gates.test.ts` → restauration byte-exacte (sauvegardes scratchpad) → `git status --porcelain` vide + sha256 == baseline. Tree propre, HEAD `d3eb9bb` inchangé, `node_modules` réel jamais jonctionné.

## Oracle re-exécuté
`tsc --noEmit` vert ; `gate:vocab` 142 fichiers 0 claim ; `npm run ci` 290/290 ; lint vert ; ratchet 69/69 ; lang-gate 0 ; export:check 0.

## Pathspec (mesuré)
Bare `fixtures/**/*.json` = 0 fichier au sommet (mais matche un nested — O-1) ; `:(glob)` = 16 ; sentinel `:(glob)` = 1 ; 6 motifs `:(exclude,glob)` présents dans `ci.yml` ; code sous racines exclues = 0 ; compteur `1f4dbaf` ancienne gate 19 674 → nouvelle 1 468 ; série 18 202 lignes.

## Mutants
| # | Mutation | Résultat |
|---|---|---|
| 1 | `fixtures/zz-orphan-mutant.json` non déclaré | ROUGE |
| 2a | hex retourné dans la déclaration (boundary-blocks) | ROUGE |
| 2b | 1 octet ajouté au fichier `usde-boundary-blocks.json` | ROUGE |
| 3 | `fixtures/zz-mutant-code.ts` | ROUGE (D9 sexies c) |
| 4a | `.csv` déclaré dans un dossier non lié | ROUGE |
| 4b | `.csv` sous `fixtures/sub/` déclaré dans le parent | ROUGE ; contrôle same-dir VERT |
| 5 | `,glob` retiré du pathspec `.json` | **VERT à tort** → C1 |
| perm | deux sha permutés dans `PROVENANCE-usde.md` | **VERT à tort** → C2 |

## sha
5 recalculés (utf8, CRLF→LF, sha256) identiques aux déclarations same-dir et à la table G1 §4 ; blob committé `manifest.json` = déclaration.

## Compteur du lot & vocabulaire
172 avec et sans les 6 globs (aucun code du lot exclu) ; brut 261, écart = G1. 0 claim sur les 257 lignes ajoutées.

## Verdict : APPROUVÉ-AVEC-CORRECTIONS
| # | fichier:ligne | défaut | correction | error_origin |
|---|---|---|---|---|
| C1 | `test/ci-gates.test.ts:1021` ; ADR-M003:112 ; commentaires :985/:1019 | `WF.includes(ps)` : `…*.json` est sous-chaîne de `…*.jsonl` → retirer `,glob` du pathspec `.json` reste vert (mutant 5) | asserter le jeton entre quotes `'…'` | implémenteur |
| C2 | `test/ci-gates.test.ts:1046` | `includes(sha) && includes(self)` ne lie pas nom↔sha (permutation verte) | lier nom+sha sur la même ligne / parser `manifest.json` | implémenteur |

## Observations formées
- O-1 : ADR-M003:112 « ne matche AUCUN fichier » imprécis (rate le sommet, matche un nested).
- O-2 : CHANTIERS:59 et ADR-U1:104 citent « D9 quinquies » pour la règle générale → « sexies ».
- O-3 : ADR-B0:79 prévoit `docs/PROVENANCE-bell.md` hors dossier fixtures → non conforme same-dir ; à réconcilier avant le 1ᵉʳ lot Bell portant une série.
- O-4 : miroir `F:\Clawpumptech\ADR-M003-phase2-integration.md` à re-synchroniser.

## Pliage (orchestrateur, `ddd3aa0`)
C1 jeton quoté ; C2 liaison même ligne / titre nommant le fichier / clé manifest ; O-1, O-2 pliées. Contrôle : 290/290, mutants 5 / perm / orphelin rouges. Le checkpoint-2 (validateur, gel `ddd3aa0`) a ensuite montré que la règle « titre nommant le fichier » était trop lâche (M6b) et la liaison par sous-chaîne trop stricte (M5) → second pliage (C-2 du checkpoint-2).
