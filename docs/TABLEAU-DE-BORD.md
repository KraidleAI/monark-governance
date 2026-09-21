# TABLEAU DE BORD MONARK — état par chantier

Mis à jour par l'orchestrateur à CHAQUE événement (retour d'agent, décision, fusion). Le détail et l'historique vivent dans `docs/CHANTIERS.md` ; ce fichier ne porte que l'ÉTAT COURANT. Dernière mise à jour : 2026-09-21 ~08:40 UTC — régime de cadence B (décision 116).

Légende : FUSIONNÉ · EN COURS (étape) · PRÊT (peut démarrer) · BLOQUÉ (par quoi) · À VENIR.

## 1. Bell (chemin critique du release)
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| -b3d-a contre-vérification | FUSIONNÉ `83da61d` (erratum `7aae8d7`) | — | — |
| -b3d-b1a reprise/ledger/budget | EN COURS | checkpoint-2 ACCEPTE-AVEC-CORRECTIONS ; G2-delta PASS ; pli docs C-V-1/3/4/5 en cours ; puis G7 | `Monark-wt-b3db1a` |
| -b3d-b1b densité/projection | À VENIR | après b1a | — |
| GARDE-HELIUS (client budgété unique, ledger de cycle) | EN COURS | plan plié `514ee1a` ; **1a** (paquet) en G1 ; 1b (Bell) après fusion b1a ; 2 (Ukemi) après POOL-RPC-1a | `Monark-wt-garde1a` |
| Course de contre-vérification | BLOQUÉ | GARDE-HELIUS + b1b | — |
| -b3d-b2 post-tirage | À VENIR | après la course | — |
| T-1a-iii-a1 univers Solana | FUSIONNÉ `9a2fca9` (G7, 573/573) | — | — |
| -iii-a1-bis (ledger chaîné, sanitize, shim, drain) | EN COURS | G1 (implémentation) ; plan plié `4f81f67` | `Monark-wt-a1bis` |

| R1 registre multi-émetteur | À VENIR | après -b3d-b1 (décision 97) | — |
| T-1a-iv qualification émetteurs | À VENIR | après R1 (décision 93) | — |
| -b1-bis-ii course fondatrice | À VENIR | — | — |
| -b3c | À VENIR | — | — |
| T-1b-backend (publication signée, DNS) | À VENIR | go DNS investisseur | — |
| T-2, T-3 (clé + quota) | À VENIR | T-3 après U-4 | — |

## 2. Narabi (en production ; durcissement)
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| -1b-i | FUSIONNÉ `9b178f3` | — | — |
| -1b-ii-a alerte mail | CHECKPOINT-2 OK (isolation) | 4 corrections docs pliées `68c849b` | `Monark-wt-narabi1b2a` |
| -1b-ii-b détection jour manquant | CHECKPOINT-2 OK (isolation) | — |
| **Fusion -a + -b** (`lot/narabi-ops-1b-ii`) | EN COURS | fusion committée `e87d7b5`, CI 611/611 ; G2 ‖ checkpoint-2 de l'état fusionné (régime B) → G7 combiné | `Monark-wt-narabi1b2` | `Monark-wt-narabi1b2b` |
| Rattrapage `run.ts` (livelock ≥ ~12 j) | À VENIR | G0/ADR, AVANT E-5 | — |
| Déploiements (sonde VPS Bell ; E-5 VPS site) | À VENIR | après G7 -a, -b, POOL-RPC-1a ; mot de passe SMTP posé par l'investisseur | — |

## 3. Ukemi
| Lot | État | Étape / bloqueur |
|---|---|---|
| U-4a | FUSIONNÉ `834a416` | — |
| U-4b (absorbe U-4a-ii, décision 99) | EN COURS | **-1a** en G2 (G1 committé : 14 mutants, 559/559, R-25 821, 3 sha de gel) ; -0 après fusion POOL-RPC-1a ; -1b : prereg avec les sha de gel, classe A seule (108) |
| U-5 branchement outil servi | À VENIR | après U-4b |
| U-6 book complet + course live | À VENIR | go investisseur |
| U-7 biblio paginée, rejeu public | À VENIR | — |

## 4. Transverse
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| CI-site | FUSIONNÉ `70212e2` | required check `g3-site` à la clôture | — |
| POOL-RPC-1a (pool RPC Ethereum) | EN COURS | checkpoint-2 (validateur) sur l'état plié `6ac398c` (ADR écrit, 567/567, R-25 469) ; puis G7 | `Monark-wt-pool1a` |
| EXPORT-CLEAN (miroir public) | EN COURS | checkpoint-2 ACCEPTE-AVEC-CORRECTIONS ; C-1/C-2 docs pliées par l'orchestrateur ; C-4 (regex forme échappée) par reprise du worker ; puis G7 | `Monark-wt-xclean` |
| HELIUS-1 (incident) | CAUSE PROUVÉE | scripts de brouillon hors garde (ledger reset, throw retiré) ; reste : lot GARDE-HELIUS avant toute course Bell | — |
| Clôture (cartographie, K-1, MWCB, export, `g3-site`) | À VENIR | en dernier | — |

## 5. Site et marque (HORS GATES — décisions 62/101 ; en dernier, investisseur + orchestrateur)
| Élément | État |
|---|---|
| Maquette Bell (charte C) + landing 3D | REÇUE (`F:\MONARK SUITE\bell-design\` ; original non retouché dans `originaux\`) |
| Maquette Ukemi | PRÊTE (`F:\PRODUITS\etude-2026-09-21\maquettes-release\ukemi.html`) ; 20 écarts Bell notés |
| Logos : Bell (64), Ukemi concept 3 (103), Narabi concept A (104) | CHOISIS ; finalisation vectorisée EN COURS (designer) |

## 6. EN ATTENTE DE L'INVESTISSEUR (une question à la fois, dans l'ordre)
| # | Quoi | Bloque |
|---|---|---|
| ~~Q-1..Q-4~~ | Ukemi classe A seule (108) ; Narabi E-5 maintenu (109) ; anti-close amendée pour les constantes on-chain (110) ; 4 fichiers u4 hors miroir (111) — TRANCHÉES | — |
| ~~E-1a~~ | Retrait de Blast API — CONFIRMÉ (décision 106) | — |
| ~~E-1b~~ | Retrait de LlamaRPC — CONFIRMÉ (décision 106) | — |
| ~~F-1~~ | Polices OFL — TÉLÉCHARGÉES (décision 107, `F:MONARK SUITEonts`) | — |
| R-25 | Garder 1 205 / passer à 1 600 par ADR / désactiver | rien (défaut : 1 205) |
| Plus tard | mot de passe SMTP (au déploiement Narabi) ; go DNS Bell (T-1b) ; Stripe Atlas KraidleAI ; pièce Massive (2026-10-29) | à leur étape |

## 7. Agents en vol (à tenir à jour)
pli docs b3d-b1a · cp-2 POOL-RPC-1a · G2 U-4b-1a · G1 GARDE-HELIUS-1a · G2 fusion Narabi + pli C5 · pli C-4 EXPORT-CLEAN · G1 -iii-a1-bis.
