# G7 — LANG-GATE-CI (petit lot, décision 116) — ACCEPTED, fusionné `1f8b78e`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-21 ~21:5x UTC (`date -u`). Branche `lot/lang-gate-ci` (G1 `57b9e1b` + G2 persistée) fusionnée `--no-ff` dans `lot/etude-suite`. Régime petit lot : G1 + G2 (aucun checkpoint-2, R-25 80 ≤ 300, rien de servi/réseau/argent/secret/prix).

## 1. Oracle complet sur l'arbre FUSIONNÉ (codes capturés directement)
`npm run ci` → 0 : `gate:vocab` OK, typecheck 0, tests **760 / 759 pass / 0 fail / 1 skip** (`fetch_only_inside_client`, déclaré) ; `npm run lint` → 0 ; `npm run lint:ratchet` → 0 (69/69) ; `npm run lang:gate` → 0 ; `npm run export:check` → 0. Logs `F:\tmp\langgate-g1\g7-*.log`.

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| G0 | `docs/G0-lot-lang-gate-ci.md` (`4ee3285`), miroir de CI-EXPORT-CHECK | — |
| G1 | `57b9e1b`, rendu `F:\tmp\langgate-g1\RENDU-G1.md` ; vérifs orchestrateur sha 3/3, lint 0, vocab 0 | 8/8 mutants conformes à la table du G0, R-25 80 |
| G2 | `docs/G2-lot-lang-gate-ci.md` (worker `claude-opus-4-8`, arbre isolé, seule vérification indépendante) | **PASS** ; 3 mutants propres (block-scoping, `\|\| true`, `if: ${{ true }}`) rouges ; miroir A/B reproduit |

## 3. Livré
Étape `lang:gate` dans le job r25 de `.github/workflows/ci.yml` (avant `export:check`, après `setup-node`) ; test `ci_runs_lang_gate` (`test/ci-gates.test.ts`) : présence, commande réelle, ni `continue-on-error` ni aucune forme de `if:`, block-scopé r25 ; addendum daté ADR-M004 (tuyaux : entrée job CI / sortie statut PR / état « câblé localement, servi au premier run réel sur runner Linux » / test). Mesuré : `lang:gate` ne rougit PAS sur le miroir public (placement par doctrine et symétrie, pas par rouge-miroir — différence déclarée avec `export:check`).

## 4. Ferme / reste
- FERME l'item « `lang:gate` absent de CI » (CHANTIERS:222, :313, :587).
- Reste (items existants, propriétaire orchestrateur) : premier run réel sur runner Linux ; required status check `g3-site`/r25 (action sortante, protection de branche).
- C-G-1 (G2, non bloquant, `error_origin` G0) : invariant « le corps r25 ne porte aucun `r25` minuscule » (dépendance du test 42(f')) — omis du blast-radius G0 §11, corrigé au G1, reproduit par la G2 ; consigné ici.
- C-G-2 (non bloquant) : compte de fichiers scannés 414/417 (G2) vs « 418/421 » (G0/G1) — pré-existant au lot, sans effet ; l'ADR dit « ~418 ».

## 5. `error_origin`
G0 (orchestrateur/worker docs) pour C-G-1 et C-G-2 ; aucun défaut de code.

Worktree `F:\Monark-wt-langgate` : retiré après ce G7 (`rm-nm.ps1` puis `git worktree remove`). Débloque l'ouverture du worktree GARDE-HELIUS-2b-ii (`ci.yml` partagé).
