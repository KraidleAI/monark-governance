# TABLEAU DE BORD MONARK — état par chantier

Mis à jour par l'orchestrateur à CHAQUE événement (retour d'agent, décision, fusion). Le détail et l'historique vivent dans `docs/CHANTIERS.md` ; ce fichier ne porte que l'ÉTAT COURANT. Dernière mise à jour : 2026-09-21 ~12:00 UTC (horloge) — 12 lots fusionnés depuis minuit — régime B ; 9 lots fusionnés depuis minuit.

**RELEASE EN DEUX TEMPS (décision 117)** : temps 1 = Narabi + Ukemi (priorité 1) ; temps 2 = Bell (avance en parallèle, reste `upcoming` au temps 1).

Légende : FUSIONNÉ · EN COURS (étape) · PRÊT (peut démarrer) · BLOQUÉ (par quoi) · À VENIR.

## 1. Bell (chemin critique du release)
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| -b3d-a contre-vérification | FUSIONNÉ `83da61d` (erratum `7aae8d7`) | — | — |
| -b3d-b1a reprise/ledger/budget | FUSIONNÉ `2c717f8` (G7, 596/596, R-25 858) | — | — |
| -b3d-b1b densité/projection | FUSIONNÉ `f459cc2` (G7, 696 pass / 1 skip, eslint 0, ratchet 69/69, R-25 315) | Amendement 3 à committer seul avant la sonde | — |
| GARDE-HELIUS (client budgété unique, ledger de cycle) | **1a FUSIONNÉ `88c63bb`** (G7, 688 pass / 1 skip déclaré, R-25 1 096, paquet `upcoming`) | **1b** (Bell consomme `openGuardedClient`) après b1b + (f) (mêmes fichiers) ; **2** (Ukemi) PRÊT à lancer | — |
| -b3d-f condition (f) ITEM-A (payload chaîné) | EN COURS | G1 en cours (base `f459cc2`) ; C-F-4 : question investisseur au G0 de la course | `Monark-wt-b3df` |
| Course de contre-vérification | BLOQUÉ | GARDE-HELIUS-1b + b1b + (f) + Amendement 3 committé seul | — |
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
| **-1b-ii (-a + -b fusionnés)** | FUSIONNÉ `c0027cb` (G7, 646/646, R-25 1 690 déclaré : deux unités relues) | — | — |
| Rattrapage `run.ts` (livelock ≥ ~12 j) | À VENIR | G0/ADR, AVANT E-5 | — |
| Sonde VPS Bell | **DÉPLOYÉE** `c0027cb`, timer actif, premier mail réel délivré (tuyaux `built`) | — | — |
| -1c `run.ts` rattrapage borné | EN COURS | plan plié `5d177db` (ADR amendé avant code) ; G1 en cours | `Monark-wt-narabi1c` |
| E-5 (VPS site, pool révisé) | À VENIR | après -1c seulement (décision 118) ; go investisseur | — |
| -1d migration `rpc.ts` vers le garde | APRÈS le temps 1 | résiduel accepté (décision 118) ; second redéploiement | — |

## 3. Ukemi
| Lot | État | Étape / bloqueur |
|---|---|---|
| U-4a | FUSIONNÉ `834a416` | — |
| U-4b (absorbe U-4a-ii, décision 99) | **-1a FUSIONNÉ `006da8f`** (G7, 607/607, R-25 882, ADR-U4b) | -0 après GARDE-HELIUS-1a→2 et POOL-RPC-1a ; -1b : prereg (3 sha D4 + 3 transitifs, liste C-V-7, `--concordance-out`), `PR-U4-3-ter`, « agrégat ≠ Σ jambes » avant la course |
| GARDE-HELIUS-2 (recorder Ukemi gardé, Chainstack en RU ; subsume U-4b-0) | EN COURS | addendum plié (C-1..C-7) ; **2a** (paquet) en G1 ; 2b (recorder) après fusion 2a |
| U-5 branchement outil servi | À VENIR | après U-4b |
| U-6 book complet + course live | À VENIR | go investisseur |
| U-7 biblio paginée, rejeu public | À VENIR | — |

## 4. Transverse
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| CI-site | FUSIONNÉ `70212e2` | required check `g3-site` à la clôture | — |
| POOL-RPC-1a (pool RPC Ethereum) | FUSIONNÉ `6bb2f84` (G7, 663/663, R-25 469 ; SHA nommé pour E-5) | débloque GARDE-HELIUS-2, U-4b-0, U-4b-1b | — |
| EXPORT-CLEAN (miroir public) | FUSIONNÉ `5b110c7` (G7, 577/577, R-25 458) | item : `export:check` en CI avant la fenêtre publique | — |
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
G1 Narabi -1c · G1 GARDE-HELIUS-2a (priorité 1, temps 1) · G1 -b3d-f · G1 -iii-a1-bis (Bell, temps 2).
