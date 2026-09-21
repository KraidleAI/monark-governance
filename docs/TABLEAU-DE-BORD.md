# TABLEAU DE BORD MONARK — état par chantier

Mis à jour par l'orchestrateur à CHAQUE événement (retour d'agent, décision, fusion). Le détail et l'historique vivent dans `docs/CHANTIERS.md` ; ce fichier ne porte que l'ÉTAT COURANT. Dernière mise à jour : 2026-09-21 ~05:10 UTC.

Légende : FUSIONNÉ · EN COURS (étape) · PRÊT (peut démarrer) · BLOQUÉ (par quoi) · À VENIR.

## 1. Bell (chemin critique du release)
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| -b3d-a contre-vérification | FUSIONNÉ `83da61d` (erratum `7aae8d7`) | — | — |
| -b3d-b1a reprise/ledger/budget | EN COURS | G1 rendu `93446f8` + correctif notFullPages (option d) en cours ; puis G2 | `Monark-wt-b3db1a` |
| -b3d-b1b densité/projection | À VENIR | après b1a | — |
| Course de contre-vérification | BLOQUÉ | lot GARDE-HELIUS (client budgété unique, cap par méthode) | — |
| -b3d-b2 post-tirage | À VENIR | après la course | — |
| T-1a-iii-a1 univers Solana | EN COURS | checkpoint-2 REFUSÉ (clause anti-close, fixture) ; pli C-1..C-4 en cours ; ré-acceptation sur pièces | `Monark-wt-univers` |
| -iii-a1-bis (C-G2-6/7, C-G2D-1/3) | À VENIR | BLOQUANT avant la 1ʳᵉ course (Chainstack facture l'usage supplémentaire — lu sur place) | — |

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
| -1b-ii-a alerte mail | EN COURS | pli G2-delta (C-G2D-1/2) ; puis checkpoint-2 | `Monark-wt-narabi1b2a` |
| -1b-ii-b détection jour manquant | CHECKPOINT-2 OK (isolation) | fusion -a+-b = G2 + checkpoint-2 propres ; ESCALADE E-5 (résiduel livelock) | `Monark-wt-narabi1b2b` |
| Rattrapage `run.ts` (livelock ≥ ~12 j) | À VENIR | G0/ADR, AVANT E-5 | — |
| Déploiements (sonde VPS Bell ; E-5 VPS site) | À VENIR | après G7 -a, -b, POOL-RPC-1a ; mot de passe SMTP posé par l'investisseur | — |

## 3. Ukemi
| Lot | État | Étape / bloqueur |
|---|---|---|
| U-4a | FUSIONNÉ `834a416` | — |
| U-4b (absorbe U-4a-ii, décision 99) | EN COURS | pli checkpoint-1 (15 bloquantes) ; ESCALADE E-I-3 (classe A seule) ; dépend de POOL-RPC-1a |
| U-5 branchement outil servi | À VENIR | après U-4b |
| U-6 book complet + course live | À VENIR | go investisseur |
| U-7 biblio paginée, rejeu public | À VENIR | — |

## 4. Transverse
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| CI-site | FUSIONNÉ `70212e2` | required check `g3-site` à la clôture | — |
| POOL-RPC-1a (pool RPC Ethereum) | EN COURS | G1 (implémentation) ; plan plié `84c4df6` ; sonde L-5 VERTE | `Monark-wt-pool1a` |
| EXPORT-CLEAN (miroir public) | EN COURS | G2 (relecteur séparé) ; G1 committé `74a0058` (export 10,4 → 4,25 Mo, 553/553, R-25 359) | `Monark-wt-xclean` |
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
| Q-1 | Ukemi : servir la seule classe A au release, classe B en item formé ? (reco : oui) | prereg U-4b |
| Q-2 | Narabi : redéployer le sentinel avec le résiduel documenté (livelock ≥ ~12 j, réparation RUNBOOK §6) ou corriger `run.ts` d'abord ? (reco validateur : maintenir) | E-5 |
| Q-3 | Clause anti-close : exempter les constantes d'état on-chain public déjà committées ? | rien (fixture purgée de toute façon) |
| ~~E-1a~~ | Retrait de Blast API — CONFIRMÉ (décision 106) | — |
| ~~E-1b~~ | Retrait de LlamaRPC — CONFIRMÉ (décision 106) | — |
| ~~F-1~~ | Polices OFL — TÉLÉCHARGÉES (décision 107, `F:MONARK SUITEonts`) | — |
| R-25 | Garder 1 205 / passer à 1 600 par ADR / désactiver | rien (défaut : 1 205) |
| Plus tard | mot de passe SMTP (au déploiement Narabi) ; go DNS Bell (T-1b) ; Stripe Atlas KraidleAI ; pièce Massive (2026-10-29) | à leur étape |

## 7. Agents en vol (à tenir à jour)
G1 b3d-b1a (correctif d) · G1 POOL-RPC-1a · pli cp-2 univers · pli G2-delta Narabi -a · pli cp-1 U-4b · G2 EXPORT-CLEAN.
