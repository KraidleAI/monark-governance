# Revue G2 — lot P1-b3 (ADR-M017 D2(v)/D5, ADR-M019), gel `0a21718` sur `lot/p1-b3` (base `8cd5d32`)

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 (~03:40 UTC). Persisté a posteriori au G7 de passe (checkpoint-2 de clôture C-1, `error_origin` orchestrateur — même classe que K-C2-1 de b2) depuis la sortie du relecteur détenue par l'orchestrateur ; contenu intégral, non perdu.
Méthode : copie `git archive 0a21718` en scratchpad avec `node_modules` **reconstruit** (une jonction littérale vers le dépôt aurait rendu m3 faussement vert — observation O1) ; mutations restaurées byte-exact ; worktree propre.

## Oracle re-exécuté
`npm run ci` 289/289 (292 − 3 blocs du test 30) ; lint 0 ; ratchet 69/69 ; lang-gate root OK ; export:check OK ; typecheck 0 ; `git diff --stat 8cd5d32 0a21718 -- schemas packages/contracts packages/hikae packages/ukemi apps/site apps/sentinel apps/harness/src` vide.

## Retrait effectif
grep `crossAgentGate|GateContext|CalibrationState|BudgetState|GateRequest` hors `docs/` = 0 ; `@monark/(ukemi|hikae)` sous `packages/monark/` = 0 ; `dependencies` = `@monark/contracts` seul ; `npm ls -w packages/monark` vide ; lockfile `npm install --package-lock-only --dry-run` = up to date (sha inchangé).

## Mutants
| # | Mutation | Résultat |
|---|---|---|
| m1 | réimport `@monark/ukemi` dans `index.ts` | VERT — vacué par hoisting (déclaré par le worker) |
| m2 | test 30 restauré sans les symboles | ROUGE TS2305 `crossAgentGate` et `GateContext` |
| m3 | re-export `fromShogen` retiré | ROUGE TS2305 dans `apps/harness/src/tools/attest.ts:19` |

## Vacuité (ADR-M019 D2) rejouée
`runGate` avec les args exacts de l'étape 4 de la trace, `yhat` ∈ {100, 999999, −5} : trois `GateDecision` byte-identiques (sha `64619eb952817d33…`), `abstain / under_calib / n_calib 0`, identique au step enregistré.

## Verdict : APPROUVÉ-AVEC-CORRECTIONS
| # | fichier:ligne | défaut | correction | error_origin |
|---|---|---|---|---|
| C1 | ADR-M019:58 et ADR-M017:149 | `h5-trace-builder.ts:218` étiqueté « appel `gate` » (c'est la construction des arguments ; l'appel est :219) | citer :219 | worker |
| C2 | ADR-M019:145, :169 | motif du report du test d'hygiène (« hors portée `packages/monark` ») imprécis ; déclencheur « lot d'hygiène » non planifié | unitarité/R-25 + nature transverse ; déclencheur = cartographie M018 D4 | worker |

## Adjudication des décisions de portée : les trois ACCEPTÉES
Retrait de `@monark/hikae` en plus d'`@monark/ukemi` (unique consommateur = `crossAgentGate`, extension déclarée, `error_origin` planificateur, réversible) ; `description` de `package.json` corrigée (même fausseté que `README:188`) ; `MONARK_PHASE` conservé (export mort, hors mandat).

## Avis G2 sur le registre Ukemi (siège nommé par ADR-M018 D2)
Option A « upcoming » + clause (b′), motifs : consommation réelle mais effet servi vacu (décision byte-identique), région `label_schema:"up|down"` sur classe numérique. **Décision finale = investisseur** (tranchée « built » + programme ADR-M020, non retenu).

## m1 et l'item formé
Suffisant : aucun test neuf mandaté pour un lot de suppression pure ; preuve d'absence = manifeste + lock + `npm ls` ; réserve C2 (motif + déclencheur).

## Observations hors portée
O1 (`error_origin` orchestrateur) : consigne de montage G2 par jonction `node_modules` vers le dépôt réel masque les mutants inter-paquets — corrigée pour les passes suivantes. O2 : ADR-M019 statut auto-déclaré « accepté » avant G7 → « proposé ». O3 : région `label_schema:"up|down"` sur classe numérique (harnais, hors b3). O4 : `fleet.ts:70` « verified », `ukemi-panel.tsx:33` `status="built"` codé en dur → W-1.
