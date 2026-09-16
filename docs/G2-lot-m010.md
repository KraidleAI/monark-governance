# G2 — Revue, Lot M010-4 (modèle de release du miroir)

- **Réviseur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 vérifié), **instance séparée du générateur,
  contexte frais** (dispatché comme 2ᵉ phase du workflow, ne voit pas le fil de l'implémenteur). Ne
  committe pas (R-20). 2026-09-16.
- **Verdict G2** : **PASS_WITH_NITS** — 1 majeur (fail-closed) + 4 mineurs. Oracle reproduit
  indépendamment par le réviseur : `npm run ci` 184/184, `gate:vocab` OK, `lang:gate` 0 hit.

## Critères d'acceptation vérifiés
- **ADR §6 (5 livrables)** : release-public.mjs (3 gardes, all-or-none, refus §5, dry-run=mêmes
  fonctions, pas de msgArg, branch guard local main) ; tests (mutants + ci vert) ; CONTRIBUTING §Releases ;
  README badge ; PR template gouvernance — **5/5 met**.
- **8 contrôles de la mission G2** (décomposition, pour lever l'ambiguïté « 8/8 » vs table §6 à 5 lignes) :
  (1) run-guard présent, gardes sans effet de bord ; (2) msgArg supprimé, message fixe ; (3) branchGuard
  local main only, pas d'origin/main ; (4) checkReleaseText = 2 gates, fail-closed sur vide ; (5) CLI
  all-or-none + refus non-semver/MAJOR≥1/tag existant/gh-auth/notes ; (6) tag gouvernance local-only,
  rollback N-1, N-2 ; (7) mutants rouges quand la garde est mutée ; (8) sécurité export (root test/ +
  release-public non exportés, README/CONTRIBUTING anglais) — **8/8 met** (probes 1-5 rejouées, exit 1
  chacune ; export --out reproduit 210 fichiers, 0 hit release-public / test/ / PULL_REQUEST_TEMPLATE).

## Findings G2 et résolution G7 (correction-loop, orchestrateur)
- **M-1 (majeur, FAIL-CLOSED, aucun trou de publication)** : le commit de sync est poussé AVANT le bloc
  tag ; si `gh release create` échoue, la récupération est MANUELLE (un re-run serait refusé par N-2).
  Résolu : ADR §7 N-1 amendé (récupération manuelle) ; messages d'abort N-2 + rollback nomment la voie
  manuelle et impriment le SHA sync déjà public. `error_origin` = **ADR §7 FM-3.1 (tension N-1/N-2 telle
  qu'écrite)**, pas l'implémenteur.
- **m-2 (mineur)** : rollback gh rapporte le résultat RÉEL de la suppression (échec distant signalé + cmd
  manuelle). Résolu (release-public.mjs bloc catch gh).
- **m-3 (mineur)** : signature ADR §5 → 1-arg `checkReleaseText(text)` (erratum, conforme impl + .d.mts).
- **m-5 (mineur)** : commentaire de test corrigé (« MONARK » ASCII, non flaggé par lang-gate ; l'assert
  verrouille le texte dérivé, pas l'exemption).
- **m-4 (mineur, DÉFÉRÉ)** : notes de release gatées par vocab GLOBAL seulement, pas les bans site/skills.
  ADR-compliant §4 ; enregistré §4 « pending investisseur » (pas une dette nue). **ESCALADE-INVESTISSEUR
  posée** (voir JOURNAL).

## Checkpoint-2 (validateur-humain `claude-fable-5-1`, R-1) — ACCEPTE-AVEC-CORRECTIONS
Le validateur a accepté le design/impl et levé 3 corrections de clôture, appliquées par l'orchestrateur :
- **C-1** : provenance absente de l'arbre → ce fichier + `G1-lot-m010.md` + l'entrée JOURNAL (R-1, oracle,
  findings, error_origins) créés.
- **C-2** : la branche échec `git push refs/tags` (release-public.mjs) ne tenait pas §7 amendé (m-2 n'avait
  touché que la branche gh) → alignée : suppression au résultat réel, SHA imprimé, voie manuelle nommée.
- **C-3** : `CONTRIBUTING.md` « never carries a tag or Release created by hand on the mirror » contredisait
  la récupération manuelle N-1 → reformulé (« …that did not originate from a governance sync ; … re-created
  on that same already-synced commit »), lang:gate repassé.
- Nits ADR pliés : §5 « remote via gh » → `git ls-remote --tags` ; §10 « 4 deliverables » → 5.

## Oracle final (après C-1/C-2/C-3 + nits)
`npm run ci` 184/184 ; `lang:gate` 0 hit (10 scopes) ; `export:check` 0 forbidden / 0 French ; `node
--check` OK ; sonde d'inertie verte. `error_origin` : M-1 = ADR §7 (spec) ; B-1 = `1f14b9b` mixte ;
tout le reste = néant (générateur conforme). Aucun push.
