# TABLEAU DE BORD MONARK — état par chantier

Mis à jour par l'orchestrateur à CHAQUE événement (retour d'agent, décision, fusion). Le détail et l'historique vivent dans `docs/CHANTIERS.md` ; ce fichier ne porte que l'ÉTAT COURANT. Dernière mise à jour : 2026-09-21 ~05:00 UTC.

Légende : FUSIONNÉ · EN COURS (étape) · PRÊT (peut démarrer) · BLOQUÉ (par quoi) · À VENIR.

## 1. Bell (chemin critique du release)
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| -b3d-a contre-vérification | FUSIONNÉ `83da61d` (erratum `7aae8d7`) | — | — |
| -b3d-b1a reprise/ledger/budget | EN COURS | G1 (implémentation) | `Monark-wt-b3db1a` |
| -b3d-b1b densité/projection | À VENIR | après b1a | — |
| Course de contre-vérification | BLOQUÉ | HELIUS-1 (rapprochement + garde) | — |
| -b3d-b2 post-tirage | À VENIR | après la course | — |
| T-1a-iii-a1 univers Solana | EN COURS | G2-delta (relecteur séparé) | `Monark-wt-univers` |
| -iii-a1-bis (C-G2-6/7, reprise) | À VENIR | après a1 | — |
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
| -1b-ii-a alerte mail | EN COURS | G2-delta (relecteur séparé) ; pli `7f86882` | `Monark-wt-narabi1b2a` |
| -1b-ii-b détection jour manquant | EN COURS | pli G2-delta (C-G2D-1..3) ; `b9e9675` | `Monark-wt-narabi1b2b` |
| Rattrapage `run.ts` (livelock ≥ ~12 j) | À VENIR | G0/ADR, AVANT E-5 | — |
| Déploiements (sonde VPS Bell ; E-5 VPS site) | À VENIR | après G7 -a, -b, POOL-RPC-1a ; mot de passe SMTP posé par l'investisseur | — |

## 3. Ukemi
| Lot | État | Étape / bloqueur |
|---|---|---|
| U-4a | FUSIONNÉ `834a416` | — |
| U-4b (absorbe U-4a-ii, décision 99) | EN COURS | rédaction du G0 ; prérequis rendus |
| U-5 branchement outil servi | À VENIR | après U-4b |
| U-6 book complet + course live | À VENIR | go investisseur |
| U-7 biblio paginée, rejeu public | À VENIR | — |

## 4. Transverse
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| CI-site | FUSIONNÉ `70212e2` | required check `g3-site` à la clôture | — |
| POOL-RPC-1 (pool RPC Ethereum) | EN COURS | pli checkpoint-1 (8 bloquantes) ; L-1/L-2 BLOQUÉS par E-1 | — |
| EXPORT-CLEAN (miroir public) | EN COURS | G0+G1 | `Monark-wt-xclean` |
| HELIUS-1 (incident) | EN COURS | fuite écartée (2 lectures = 60 938) ; audit appel par appel en cours | — |
| Clôture (cartographie, K-1, MWCB, export, `g3-site`) | À VENIR | en dernier | — |

## 5. Site et marque (HORS GATES — décisions 62/101 ; en dernier, investisseur + orchestrateur)
| Élément | État |
|---|---|
| Maquette Bell (charte C) + landing 3D | REÇUE (`F:\MONARK SUITE\bell-design\` ; original non retouché dans `originaux\`) |
| Maquette Ukemi | PRÊTE (`F:\PRODUITS\etude-2026-09-21\maquettes-release\ukemi.html`) ; 20 écarts Bell notés |
| Logos : Bell (64), Ukemi concept 3 (103), Narabi concept A (104) | CHOISIS ; lettrage définitif BLOQUÉ par le téléchargement des polices (décision 105) |

## 6. EN ATTENTE DE L'INVESTISSEUR
| # | Quoi | Bloque |
|---|---|---|
| E-1a | Confirmer le retrait de Blast API du pool RPC | L-1/L-2 de POOL-RPC-1 |
| E-1b | Confirmer le retrait de LlamaRPC | idem |
| F-1 | Autoriser le téléchargement des polices OFL (Archivo Black, Space Grotesk, JetBrains Mono, ~1 Mo, `github.com/google/fonts`) | lettrage final des logos, polices du site |
| R-25 | Garder 1 205 / passer à 1 600 par ADR / désactiver | rien (défaut : 1 205) |
| Plus tard | mot de passe SMTP (au déploiement Narabi) ; go DNS Bell (T-1b) ; Stripe Atlas KraidleAI ; pièce Massive (2026-10-29) | à leur étape |

## 7. Agents en vol (à tenir à jour)
G1 Bell -b3d-b1a · G2-delta univers · G2-delta Narabi -a · pli G2-delta Narabi -b · pli cp-1 POOL-RPC-1 · G0 U-4b · audit HELIUS-1 · EXPORT-CLEAN.
