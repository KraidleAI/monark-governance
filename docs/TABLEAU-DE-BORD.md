# TABLEAU DE BORD MONARK — état par chantier

Mis à jour par l'orchestrateur à CHAQUE événement (retour d'agent, décision, fusion). Le détail et l'historique vivent dans `docs/CHANTIERS.md` ; ce fichier ne porte que l'ÉTAT COURANT. Dernière mise à jour : 2026-09-21 18:05 UTC (`date -u`) — 16 lots fusionnés le 21/09 — régime B. Nouvelle session (Fable 5.1 `claude-fable-5-1`, 4ᵉ compte) reprise depuis `BASCULEMENT-COMPTE.md` §11.

**RELEASE EN DEUX TEMPS (décision 117)** : temps 1 = Narabi + Ukemi (priorité 1) ; temps 2 = Bell (avance en parallèle, reste `upcoming` au temps 1).

Légende : FUSIONNÉ · EN COURS (étape) · PRÊT (peut démarrer) · BLOQUÉ (par quoi) · À VENIR.

## 1. Bell (chemin critique du release)
| Lot | État | Étape / bloqueur | Worktree |
|---|---|---|---|
| -b3d-a contre-vérification | FUSIONNÉ `83da61d` (erratum `7aae8d7`) | — | — |
| -b3d-b1a reprise/ledger/budget | FUSIONNÉ `2c717f8` (G7, 596/596, R-25 858) | — | — |
| -b3d-b1b densité/projection | FUSIONNÉ `f459cc2` (G7, 696 pass / 1 skip, eslint 0, ratchet 69/69, R-25 315) | Amendement 3 à committer seul avant la sonde | — |
| GARDE-HELIUS (client budgété unique, ledger de cycle) | **1a FUSIONNÉ `88c63bb`** (G7, 688 pass / 1 skip déclaré, R-25 1 096, paquet `upcoming`) | **1b** (Bell consomme `openGuardedClient`) après b1b + (f) (mêmes fichiers) ; **2** (Ukemi) PRÊT à lancer | — |
| -b3d-f condition (f) ITEM-A (payload chaîné) | FUSIONNÉ `1fc89a9` (G7 16:06 UTC, 712 tests 0 fail, lint 0, ratchet 69/69, R-25 255, source `2c852f0c…`) | Amendement de format n°2 + ADR D1-octies dans le SHA ; C-F-4 = escalade investisseur au G0 de course ; `RefMod` arité 5 → GARDE-HELIUS-1b | — |
| Course de contre-vérification | BLOQUÉ | GARDE-HELIUS-1b + b1b + (f) + Amendement 3 committé seul | — |
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
| -1c `run.ts` rattrapage borné | FUSIONNÉ `c4981d0` (G7 14:06 UTC, 710 tests 0 fail, lint 0, ratchet 69/69, R-25 474, `run.ts` sha `54619a40…`) | 3 corrections G2 non bloquantes portées par -1d ; WIRED jusqu'à E-5 | — |
| E-5 (VPS site, pool révisé + rattrapage borné) | DÉPLOYÉ `c4981d0` 14:14 UTC (hachés conformes, `TimeoutStartUSec=5min`, dry-run vert, rollback `/root/rollback-e5-20260921/`) | **premier run réel 22/09 00:41 UTC** ⇒ ligne JOURNAL « built » (pocket listé, `max_day_ms`) + tir sonde suivant | — |
| -1d migration `rpc.ts` vers le garde | APRÈS le temps 1 | résiduel accepté (décision 118) ; second redéploiement | — |

## 3. Ukemi
| Lot | État | Étape / bloqueur |
|---|---|---|
| U-4a | FUSIONNÉ `834a416` | — |
| U-4b (absorbe U-4a-ii, décision 99) | **-1a FUSIONNÉ `006da8f`** (G7, 607/607, R-25 882, ADR-U4b) | -0 après GARDE-HELIUS-1a→2 et POOL-RPC-1a ; -1b : prereg (3 sha D4 + 3 transitifs, liste C-V-7, `--concordance-out`), `PR-U4-3-ter`, « agrégat ≠ Σ jambes » avant la course |
| GARDE-HELIUS-2 (recorder Ukemi gardé, Chainstack en RU ; subsume U-4b-0) | **2a FUSIONNÉ `e98b54f`** ; **2b DÉCOUPÉ (couture de repli pré-déclarée, R-25 total estimé 1 150–1 297)** : **2b-i PAQUET** G1 `798b4e9` RELU : G2 PASS-AVEC-CORRECTIONS + checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (`f0a6f1d`), pli EN COURS ; **2b-ii MIGRATION** à lancer après la fusion de 2b-i | 2b-i : G2 ‖ checkpoint-2 (worktree GELÉ) → pli → G7 ; puis 2b-ii (blueprint : §8 de `F:/tmp/garde2b/RENDU-G1.md`) → prereg U-4b-1b → course | `Monark-wt-garde2b` |
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
| CI-EXPORT-CHECK (petit lot : `export:check` fail-closed en CI, job r25) | FUSIONNÉ `3df2f73` (G7, 698 tests 0 fail, lint 0, ratchet 69/69, R-25 89) | item `export:check` en CI : CLOS ; reste `lang:gate` en CI (CHANTIERS:222) | — |
| Clôture temps 1 (cartographie Narabi + Ukemi, K-1, `g3-site`) | À VENIR | en dernier | — |

## 5. Site et marque (HORS GATES — décisions 62/101 ; en dernier, investisseur + orchestrateur)
| Élément | État |
|---|---|
| Maquette Bell (charte C) + landing 3D | REÇUE (`F:\MONARK SUITE\bell-design\` ; original non retouché dans `originaux\`) |
| Maquette Ukemi | PRÊTE (`F:\PRODUITS\etude-2026-09-21\maquettes-release\ukemi.html`) ; 20 écarts Bell notés |
| Logos : Bell (64), Ukemi concept 3 (103), Narabi concept A (104) | CHOISIS ; lettrage final en tracés LIVRÉ (`F:\MONARK SUITE\NOTE-serie-logos.md`, 10 SVG + `measures.json`, scripts rejouables) ; **6 points à arbitrer par l'investisseur** (note §6, dont largeur du bloc : 56 px recommandé vs ≈ 63,7 px) ; demande formée conditionnelle §7 (fontTools lu depuis un venv tiers) |

## 6. EN ATTENTE DE L'INVESTISSEUR (une question à la fois, dans l'ordre)
| # | Quoi | Bloque |
|---|---|---|
| ~~Q-1..Q-4~~ | Ukemi classe A seule (108) ; Narabi E-5 maintenu (109) ; anti-close amendée pour les constantes on-chain (110) ; 4 fichiers u4 hors miroir (111) — TRANCHÉES | — |
| ~~E-1a~~ | Retrait de Blast API — CONFIRMÉ (décision 106) | — |
| ~~E-1b~~ | Retrait de LlamaRPC — CONFIRMÉ (décision 106) | — |
| ~~F-1~~ | Polices OFL — TÉLÉCHARGÉES (décision 107, `F:MONARK SUITEonts`) | — |
| R-25 | Garder 1 205 / passer à 1 600 par ADR / désactiver | rien (défaut : 1 205) |
| Logos | Note §6 du designer : 6 arbitrages (largeur du bloc 56 vs ≈ 63,7 px, etc.) | finalisation des SVG de la série |
| **Firecrawl** | Connecter le connecteur Firecrawl au nouveau compte claude.ai (absent de la session du 21/09 18:00 UTC) ; puis l'orchestrateur relève l'UUID et réécrit les 22 agents s'il a changé | lecteurs/chercheurs (WebFetch seul en attendant) |
| Plus tard | mot de passe SMTP (au déploiement Narabi) ; go DNS Bell (T-1b) ; Stripe Atlas KraidleAI ; pièce Massive (2026-10-29) | à leur étape |

## 7. Agents en vol (à tenir à jour)
En vol (18:55 UTC, fan-out investisseur « enchaîne en parallèle sur tous les chantiers ») :
1. **2b-i PLI** (worker, worktree `F:/Monark-wt-garde2b`, base `f0a6f1d`) — revues rentrées 18:22 UTC : G2 **PASS-AVEC-CORRECTIONS** (C-G-1..5), checkpoint-2 **ACCEPTE-AVEC-CORRECTIONS** (C-R-1 test helius D6 + C-R-2 ADR BLOQUANTS, clôture mécanique : mutant V1 rouge `FULL=1` + greps ADR ; C-R-3/C-R-4) ; TOUT plié dans 2b-i. Rendu `F:/tmp/garde2b-pli/RENDU-PLI.md` ; ensuite sha -c, lint rejoué, commit (+ `docs/G1-lot-garde-helius-2b-i.md` = rendu G1 persisté, hors R-25), clôture mécanique, G2-delta, G7 arbre fusionné.
2. **2b-ii G0 brouillon** (worker, docs seulement, `F:/tmp/garde2b-ii/`) — mesure la transitivité `record.ts`/`rpc2.ts` ↔ code de score gelé, blueprint §8, point `"0x"`, seconde couture. Puis checkpoint-1.
3. **Prereg U-4b-1b brouillon** (worker, docs seulement, `F:/tmp/u4b-prereg/`) — à committer SEUL après 2b-ii (arguments du recorder gardé finaux).
4. **GARDE-HELIUS-1b G0 brouillon** (worker, docs seulement, `F:/tmp/garde1b/`, temps 2) — code après 2b-ii.
5. **LANG-GATE-CI G0 court** (worker, docs seulement, `F:/tmp/langgate/`) — miroir de CI-EXPORT-CHECK ; doit FUSIONNER avant l'ouverture du worktree 2b-ii (`ci.yml` partagé).
Règles : tout worktree de code reçoit `F:/tmp/g2-garde2bi/mk-nm.ps1` et se retire par `rm-nm.ps1` (un `node_modules` reconstruit est un VRAI dossier de 220 jonctions : jamais `Remove-Item -Recurse`) ; checkpoint-1 validateur à la réception des brouillons 2/4/5. HORS portée (119) : course Bell + C-F-4, U-6, site, DNS, achats ; aucun chercheur/lecteur tant que Firecrawl est absent.
À faire (temps 1) : G0 GARDE-HELIUS-2b → prereg U-4b-1b committé seul → course U-4b-1b (GO 119, plafonds actifs) → U-4b-2 → U-5 → U-6 (go) → U-7 · E-5 : ligne du run réel du 22/09 00:41 UTC · Bell (temps 2) : GARDE-HELIUS-1b puis G0 de course.
