# TABLEAU DE BORD MONARK — état par chantier

Mis à jour par l'orchestrateur à CHAQUE événement (retour d'agent, décision, fusion). Le détail et l'historique vivent dans `docs/CHANTIERS.md` ; ce fichier ne porte que l'ÉTAT COURANT. Dernière mise à jour : 2026-09-21 18:05 UTC (`date -u`) — 16 lots fusionnés le 21/09 — régime B. Nouvelle session (Fable 5.1 `claude-fable-5-1`, 4ᵉ compte) reprise depuis `BASCULEMENT-COMPTE.md` §11.

**RELEASE EN DEUX TEMPS (décision 117)** : temps 1 = Narabi + Ukemi (priorité 1) ; temps 2 = Bell (avance en parallèle, reste `upcoming` au temps 1).

Légende : FUSIONNÉ · EN COURS (étape) · PRÊT (peut démarrer) · BLOQUÉ (par quoi) · À VENIR.

## 1. Bell (chemin critique du release)
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| -b3d-a contre-vérification | FUSIONNÉ `83da61d` (erratum `7aae8d7`) | — | — |
| -b3d-b1a reprise/ledger/budget | FUSIONNÉ `2c717f8` (G7, 596/596, R-25 858) | — | — |
| -b3d-b1b densité/projection | FUSIONNÉ `f459cc2` (G7, 696 pass / 1 skip, eslint 0, ratchet 69/69, R-25 315) | Amendement 3 committé SEUL `6c9fdaa` (PLI, 85 s après la fusion b1b ; registre corrigé le 21/09 23:xx) | — |
| GARDE-HELIUS (client budgété unique, ledger de cycle) | **1a FUSIONNÉ `88c63bb`** ; **1b PLAN APPROUVÉ** (`docs/G0-lot-garde-helius-1b.md`, cp-1 plié `d6af611`, 4 sous-lots 1b-0..1b-iii) | **1b démarre dès la fusion de 2b-ii (décision 122)** ; course Bell PENDANT U-4b-2 → U-7 | — |
| -b3d-f condition (f) ITEM-A (payload chaîné) | FUSIONNÉ `1fc89a9` (G7 16:06 UTC, 712 tests 0 fail, lint 0, ratchet 69/69, R-25 255, source `2c852f0c…`) | Amendement de format n°2 + ADR D1-octies dans le SHA ; C-F-4 = escalade investisseur au G0 de course ; `RefMod` arité 5 → GARDE-HELIUS-1b | — |
| Course de contre-vérification | BLOQUÉ | GARDE-HELIUS-1b (seul gate de code restant ; G-1/2/3/5 REMPLIS) ; décisions 124 (ancrage B) et 125 (plafond 5 396 170, go-1 sonde / go-2 tirage) rendues ; G0 de course à plier sur 123/124/125 ; G0 de course DRAFT persisté ; fenêtre de cycle : départ avant ~15/10 ; chevauche le temps 1 (122) | — |
| -b3d-b2 post-tirage | À VENIR | après la course | — |
| T-1a-iii-a1 univers Solana | FUSIONNÉ `9a2fca9` (G7, 573/573) | — | — |
| -iii-a1-bis (ledger chaîné, sanitize, shim, drain) | FUSIONNÉ `780a631` + correctif d'interaction `138df67` (G7 16:30 UTC, 720 tests 0 fail, lint 0, ratchet 69/69, R-25 721) | D4 re-diagnostiqué (défaut amont Node/Windows, item sourcé) ; phantom-fresh + CONV-2 → GARDE-HELIUS-1b | — |

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
| -1c `run.ts` rattrapage borné | FUSIONNÉ `c4981d0` (G7 14:06 UTC, 710 tests 0 fail, lint 0, ratchet 69/69, R-25 474, `run.ts` sha `54619a40…`) | **BUILT** (premier run réel 22/09 00:42 UTC : exit 0, `max_day_ms` 25 760, pocket listé) ; 3 corrections G2 non bloquantes portées par -1d | — |
| E-5 (VPS site, pool révisé + rattrapage borné) | DÉPLOYÉ `c4981d0` 14:14 UTC (hachés conformes, `TimeoutStartUSec=5min`, dry-run vert, rollback `/root/rollback-e5-20260921/`) | **RUN RÉEL VERT 22/09 00:42 UTC** (JOURNAL) ⇒ pool L-1 + `catchup_budget` **built** ; reste : tir suivant de la sonde Bell (`healthy`, boîte vide) | — |
| -1d migration `rpc.ts` vers le garde | APRÈS le temps 1 | résiduel accepté (décision 118) ; second redéploiement | — |

## 3. Ukemi
| Lot | État | Étape / bloqueur |
|---|---|---|
| U-4a | FUSIONNÉ `834a416` | — |
| U-4b (absorbe U-4a-ii, décision 99) | **-1a FUSIONNÉ `006da8f`** (G7, 607/607, R-25 882, ADR-U4b) | -0 après GARDE-HELIUS-1a→2 et POOL-RPC-1a ; -1b : prereg (3 sha D4 + 3 transitifs, liste C-V-7, `--concordance-out`), `PR-U4-3-ter`, « agrégat ≠ Σ jambes » avant la course |
| GARDE-HELIUS-2 (recorder Ukemi gardé, Chainstack en RU ; subsume U-4b-0) | **2a FUSIONNÉ `e98b54f`** ; **2b DÉCOUPÉ (couture de repli pré-déclarée, R-25 total estimé 1 150–1 297)** : **2b-i PAQUET FUSIONNÉ `8ba2cbc`** (G7 : 759 tests 0 fail, lint 0, ratchet 69/69, R-25 439 ; `docs/G7-lot-garde-helius-2b-i.md`) ; **2b-ii FUSIONNÉ `ce41619` + `5394dfe`** (G7 `docs/G7-lot-garde-helius-2b-ii.md` : 763 tests 0 fail 2 skip attendus, lint 0, ratchet 69/69 ; paquet **branché** côté Ukemi) ; **2b-iii FUSIONNÉ `985fed9`** (G7 `docs/G7-lot-garde-helius-2b-iii.md` : 779 tests 0 fail 1 skip attendu, lint 0, ratchet 69/69 ; chaîne 2b CLOSE) | **2b-ii** : G0 committé `de2aff0` (rulings R-A..R-G), checkpoint-1 EN COURS → G1 (worktree neuf) → G2 ‖ cp-2 → G7 ; puis prereg U-4b-1b (brouillon `docs/PLAN-u4b-prereg.DRAFT.md`) → course | — |
| U-5 branchement outil servi | À VENIR | après U-4b |
| U-6 book complet + course live | À VENIR | go investisseur |
| U-7 biblio paginée, rejeu public | À VENIR | — |

## 4. Transverse
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| CI-site | FUSIONNÉ `70212e2` | required check `g3-site` à la clôture | — |
| POOL-RPC-1a (pool RPC Ethereum) | FUSIONNÉ `6bb2f84` ; **BUILT en production** (run réel E-5 22/09 : 8 endpoints dont pocket, sans llama/blast) | — | — |
| EXPORT-CLEAN (miroir public) | FUSIONNÉ `5b110c7` (G7, 577/577, R-25 458) | item : `export:check` en CI avant la fenêtre publique | — |
| HELIUS-1 (incident) | CAUSE PROUVÉE | scripts de brouillon hors garde (ledger reset, throw retiré) ; reste : lot GARDE-HELIUS avant toute course Bell | — |
| CI-EXPORT-CHECK (petit lot : `export:check` fail-closed en CI, job r25) | FUSIONNÉ `3df2f73` (G7, 698 tests 0 fail, lint 0, ratchet 69/69, R-25 89) | item `export:check` en CI : CLOS | — |
| LANG-GATE-CI (petit lot : `lang:gate` fail-closed en CI, job r25) | FUSIONNÉ `1f8b78e` (G7, 760 tests 0 fail, lint 0, ratchet 69/69, R-25 80) | item `lang:gate` en CI : CLOS ; reste premier run Linux + required check | — |
| Clôture temps 1 (cartographie Narabi + Ukemi, K-1, `g3-site`) | À VENIR | en dernier | — |

## 5. Site et marque (HORS GATES — décisions 62/101 ; en dernier, investisseur + orchestrateur)
| Élément | État |
|---|---|
| Maquette Bell (charte C) + landing 3D | REÇUE (`F:\MONARK SUITE\bell-design\` ; original non retouché dans `originaux\`) |
| Maquettes v2 temps 1 (logos finaux 120) | LIVRÉES `F:/PRODUITS/etude-2026-09-21/maquettes-release/v2/` (`ukemi.html`, `narabi.html`, `index.html` ; Bell `upcoming` sans logo ; 0 URL chargée, `gate:vocab` OK) ; note `NOTE-maquettes-v2.md` : 6 questions pour la relecture conjointe (vocabulaire « Aave » / « cascade » / « reference price » hérités de la v1, endpoints en clair, `mark-dark`, charte C en production) ; scripts `F:/MONARK SUITE/maquettes-v2-build/` |
| Maquette Ukemi v1 | PRÊTE (`F:\PRODUITS\etude-2026-09-21\maquettes-release\ukemi.html`) ; 20 écarts Bell notés |
| Logos : Bell (64), Ukemi concept 3 (103), Narabi concept A (104) | CHOISIS ; lettrage final en tracés LIVRÉ (`F:\MONARK SUITE\NOTE-serie-logos.md`, 10 SVG + `measures.json`, scripts rejouables) ; **CLOS — décision 120** (6 arbitrages = reco designer : 56 px, `#E8C468`, favicon `mark-small`, justifié sur l'encre, −2,4, accent gardé) |

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
En vol (06:46 UTC `date -u`, 7 agents) : **G2 + checkpoint-2 SITE-RELEASE-1** (arbre fusionne A+B `F:/tmp/site-merge/tree` @ `60ecf64`, 830/829/0/1, build --webpack + assert-fleet-html 0) ; **G2-delta + re-checkpoint-2 U-4b-1b-1 labeler** (pli `298e04a`, labeler re-gele `cb020425...`, 16/16 mutants, 822/821/0/1) ; **pli GARDE-HELIUS-1b** (ETH wiring, worktree `Monark-wt-garde1b`) ; **worker prereg U-4b-1b final** (QF-2 alpha, 9 sha recomputes, ligne figee labeler, reconcile = gate separee per 129 ; commit SEUL apres G7 labeler). Faits depuis 03:24 : **U-4b-1b-0 FUSIONNE `5d58a8a`** (G7 `ee51e56`, 820/819/0/1) ; G2 labeler PASS-AVEC-CORRECTIONS (`0650440`) ; G1 SITE-A plie (`b5f665a`) + G1 SITE-B (`2de11fb`) ; fiche go-1 Bell pliee (`645b147`, rulings GO1-A/B/C) ; cle Helius de course posee par l'investisseur (presse-papiers, longueur 36, jamais affichee) ; floors lus sur place (Chainstack 12 904 RU, Helius 60 938/10 M). Ensuite : G7 labeler -> prereg commit SEUL -> lecture floor Chainstack n2 (investisseur) -> course U-4b-1b (shell frais) ; G7 SITE -> deploy g3-site -> release Narabi ; G7 1b -> floor Helius n2 -> go-1. **Aucune question investisseur en attente.**
Règles : tout worktree de code reçoit `F:/tmp/g2-garde2bi/mk-nm.ps1` et se retire par `rm-nm.ps1` (jamais `Remove-Item -Recurse`). HORS portée (119) : course Bell + C-F-4, U-6, site, DNS, achats. Firecrawl : UUID `6fa0ba96-…` posé dans les 22 agents, effet au REDÉMARRAGE (aucun lecteur/chercheur avant).
À faire (temps 1) : 2b-ii G2‖cp-2→G7 → 2b-iii idem → prereg committé seul → floor lu sur place → course U-4b-1b (GO 119) → U-4b-2 → U-5 → U-6 (go conditionnel pré-enregistré, 122) → U-7 → clôture (carto diff, K-1, g3-site, Linux) → site (relecture conjointe) · E-5 : run réel 22/09 00:41 UTC · Bell (temps 2, chevauché — 122) : 1b dès 2b-ii fusionné → G0 course (2 questions) → course → b2. Consigne standard G1 : `docs/CONSIGNE-STANDARD-G1.md` citée dans chaque mission.
