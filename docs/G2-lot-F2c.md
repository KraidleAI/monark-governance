# G2 — Revue, Lot F-2c (roadmap flotte + 8 teasers + câblage segment→produit)

- **Relecteur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 conforme, effort max ; instance fraîche ≠ générateur). Ne committe pas (R-20).
- **Générateur** : worker `claude-opus-4-8[1m]` (lot F-2c).
- **Base** : `main bee7ad7` ; worktree `F:\Monark-wt-f2c`, branche `lot-f2c`.

## Verdict G2 : PASS-AVEC-RÉSERVES (0 bloquante, 4 non-bloquantes)

## Oracle indépendant (relecteur) + R-21 (orchestrateur, arbre final après correctif réserve a)
| Commande | Exit | Résultat |
|---|---|---|
| `npm run ci` | 0 | **100/100** (dont `fleet_register_built_set_is_frozen`, `vocab_site_scope_bans_third_party_platforms`, gardes F-2b, test 44, contracts_frozen) |
| `npm run lint` | 0 | — |
| `npm run lint:ratchet` | 0 | 92/92 |
| `next build` | 0 | `/`, `/_not-found`, `/roadmap` toutes ○ Static |
| `lang-gate --scope site` | 0 | 0 hit |
| `grep-forbidden` | 0 | 60 fichiers |
| `git diff main -- schemas/ packages/` | — | VIDE |
| R-25 | — | **581 ins / 8 fichiers < 1205** (lot unique) |

Mutants rejoués par le relecteur (rouge → restauré byte-exact) : C-2 registre (bascule upcoming→built ⇒ rouge), honnêteté numérique (« 53h » dans une chaîne du registre ⇒ rouge, ferme le trou `{a.line}`), honnêteté `live` (⇒ tsc rouge, union fermée), C-4 plateforme (« Aave » rendu ⇒ grep rouge).

## Cibles conformes
Honnêteté (statuts built/upcoming jamais live ; 0 p_correct/score rendu ; 0 chiffre en position rendue ; 0 plateforme tierce ; 5 produits tous upcoming ; anglais) ; **C-1** (Verdict sans agent-moteur, biblio-00-index l.8 confirmée) ; **C-2** (registre `fleet.ts` = source unique consommée par `/roadmap` et les placeholders ; built ⊂ exactement {Shōgen,Hikae,Ukemi}) ; **C-4** (9 plateformes gatées + mutant ; UMA/Gamma en `\b`) ; **C-5** (8 phrases sourcées deck+memstack ; G1 porte le wording final) ; **C-9/C-10** (phrase deux-étages rendue ; 5 produits absents de `/roadmap` ; un seul badge par placeholder, nœuds sans pilule) ; **RSC/build** ; **G0** (PLAN v2 + ADR-M004 D14 cohérents avec le livré). Les 6 « choix douteux » du générateur adjugés ACCEPTABLES par le relecteur.

## Réserves — disposition orchestrateur (zéro dette)
- **(a) Trou de la garde « consommation » C-2** (regex ne capturait pas `status={"built"}` — littéral entre accolades JSX). **CORRIGÉ** : regex resserrée `/status\s*=\s*\{?\s*["'](?:built|upcoming)["']/` (`test/ci-gates.test.ts`). Oracle re-passé vert (les surfaces livrées lisent `status={a.status}` → pas de faux positif). `error_origin` = **générateur** (garde partielle), attrapé au G2.
- **(b) Erreur factuelle du PLAN C-5** (« 2 écarts vs archive » alors que 0 écart réel PLAN↔archive ; les vrais écarts sont archive↔deck). `error_origin` = **spec/PLAN** (le PLAN a mal désigné la cible) ; correctement escaladé par le générateur, **pas** un dû nu. Consigné ici + G7.
- **(c) C-4 = verrou de régression sur 9 noms connus, pas un détecteur** : les noms hors-liste (Safe/Hermes/OpenClaw/pump.fun…) passent structurellement. **Déclaré** ; la copy actuelle est vérifiée à 0 marque tierce ; « Safe » (ambigu) en contrôle manuel. Extension de la liste par addendum si un nom entre en copy.
- **(d) Artefacts G0 (PLAN v2 + ADR-M004 D14) non committés dans le worktree** au moment de la revue : **résolu** — committés AVEC le lot dans l'unique PR F-2c (R-25 conforme dans les deux découpes, 581 < 1205). Décision de timing orchestrateur, non un défaut de code.

## error_origin (pour le G7)
(a) générateur (garde) · (b) spec/PLAN · worker mort antérieur = outillage/limite de session (partielle jetée, cf. G1). Aucun défaut vivant dans le livré.
