# G7 — CI-EXPORT-CHECK (petit lot : `export:check` exécuté en CI, épinglé par test) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 (heure : `git log` de la fusion). Fusion `--no-ff` `3df2f73` sur `lot/etude-suite` (branche `lot/ci-export-check`, G1 `013b4bf`, pli `02849b3`).

## Vérifications de l'orchestrateur (exécutées sur l'arbre FUSIONNÉ)
- `npm run ci` exit 0 (**698 tests / 697 pass / 0 fail / 1 skip pré-existant**) ; `npm run lint` exit 0 ; `lint:ratchet` **69/69** ; `npm run export:check` exit 0. Journal `scratchpad/ci-cix.log`.
- `git show --stat 3df2f73` : 5 fichiers, +271/-6 (dont G2 151 lignes de doc). R-25 du lot (pathspec `ci.yml:65`, mesuré par la G2-delta, recoupé par le stat) : 83 + 6 = **89 ≤ 1 205** ; ≤ 300 ⇒ régime « petit lot » (décision 116), rien de servi/réseau/argent/secret/prix ⇒ pas de checkpoint-2.
- Pli confronté avant annonce (ADR-C01 complément 2) : sha256 worktree == rendu worker (test `cb87b794…`, lang-gate `3bb63efa…`, ADR `df206963…`, `ci.yml` `3b015ce3…` inchangé).

## Chaîne
G0 petit lot → G1 (`013b4bf`) → G2 séparée PASS-AVEC-CORRECTIONS (C-1..C-3) → pli par l'auteur (`02849b3`) → G2-delta par reprise **PASS** (mutants `if: false`, `if: ${{ false }}`, `if: github.event_name == 'never'`, job-level : tous rouges sur `ci_runs_export_check` ; baseline sans faux rouge) → G7.

## Tuyaux (règle Branchement)
Entrée : `npm run export:check` (script existant). Sortie : étape du job r25 de `.github/workflows/ci.yml` (chemin servi = la CI). Preuve : test non-LLM `ci_runs_export_check` (présence, commande réelle, ni `continue-on-error` ni `if:`).

## error_origin
C-1 (garde `if:` absente) : worker G1 ; C-2a/C-2b (commentaires à prémisse périmée « global rouge » / « export:check hors CI ») : pré-existant, périmé par ce lot ; C-3 (affirmation ASCII inexacte du rendu) : worker G1.

## Items
Aucun item ouvert par ce lot.
