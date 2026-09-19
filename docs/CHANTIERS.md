# Tableau de bord des chantiers — MONARK (tenu par l'orchestrateur, mis à jour à chaque événement)
Dernière mise à jour : 2026-09-19 13:30 UTC (horloge système)

## A. Passe P1 — branchement (ADR-M017/M018/M019) — **CLOSE** (G7 de passe `16ec12a`, checkpoint-2 de clôture accepte-avec-corrections C-1..C-6 pliées)
| Lot | État | Prochaine action | Bloqué par |
|---|---|---|---|
| P1-b1, b2, b3 | CLOS, fusionnés `lot/etude-suite` | — | — |
| W-1 (`wiring`, test de gel, prose vitrine ×5, `fleet.ts:70`, panneau Ukemi) | **CLOS** — G7 `bb252ce`, fusion `ccbb856`, journal `eb0b7e5` | — | — |
| Cartographie M018 D4 | LIVRÉE `e447adf` (2 tuyaux branchés, mensonge retiré, écarts E2/E9/E10/E5 formés) | — | — |
| Rapport de passe P1 | CLOS `16ec12a` ; G2 b3 persistée ; 24 corrections par origine ; zéro dette nue | — | — |
| **Escalade M018 D4** (« corrigée avant toute nouvelle pièce » vs U-1a/T-1a/R-25 déjà lancés) | **TRANCHÉE (b)** par l'investisseur (décision 18) : lot **E-bon-marché** (E5 test deps, E9 région numérique + re-pin h5, E10 snapshot Narabi) **EN COURS** (worktree `F:\Monark-wt-ecart`, `lot/e-bon-marche`) avant fusion de U-1a/T-1a ; (a) amendement M018 réservé aux écarts coûteux | fusion E-bon-marché AVANT fusion U-1a/T-1a | E-bon-marché |
| Miroir public + PR empilées (#78-#83, lot/etude-suite, p1-b*, w-1) | EN ATTENTE fenêtre publique | push au go investisseur | investisseur |

## B. Ukemi — programme « au paroxysme » (décision investisseur 2026-09-19)
| Élément | État | Prochaine action | Bloqué par |
|---|---|---|---|
| **U-1a implémentation** (recorder book WETH + sUSDe/USDe, digest, invariant HF exact, fixture réduite, tests/mutants) | EN COURS — worker, worktree `F:\Monark-wt-p1b1`, branche `lot/u-1a` | G2 fraîche → checkpoint-2 → G7 (G7 attend le lot R-25-séries) | — |
| **ADR-U1b contrat `AttestedBook`** (6e contrat gelé, décision 16) | RÉDIGÉ `1bdea9c` (18 clés, sans prix, description auto-déclarée) ; adjudications provisoires A (témoin total sous abstention) / B (liaison M017 par motif d'URL) / C (`attestor` objet dédié) ; checkpoint-1 : **approuvé-avec-corrections C-1..C-12** (Prediction vacue en U-1b-b → décodeur sans Prediction, `recorder_revision` 64 hex, quorum par méthode, un seul canonicaliseur, tests à liste fixe, « five frozen contracts » public à corriger, résidu `no_third_party_verifier` toujours émis) ; C tranché techniquement ; **rédacteur plie** ; **signature investisseur A/B due** | A/B → U-1b-a après G7 U-1a | investisseur |
| **Lot R-25-séries** (ADR-M003 D9 sexies, pathspec `:(exclude,glob)`, test `series_pinned_are_declared_and_hashed`) | LIVRÉ, gel `d3eb9bb` (290/290, 3 mutants rouges, compteur 19 674 → 1 468 sur `1f4dbaf`) ; **G2 fraîche EN COURS** | checkpoint-2 → G7 → fusion (prérequis du G7 U-1a) | — |
| Avis advisor-DeFi (objet B cascade cluster, plan U-0..U-7) | REÇU, persisté `docs/biblio/ukemi-modeL/` | — | — |
| Avis advisor-marché (payeur = DAO/SP ; classe shortfall vs dette liquidée) | REÇU, persisté | — | — |
| Campagne biblio (25 sources, 12 PDF, 36 sha) | REÇUE — `R-biblio-ukemi-modeL.md` (983 l.) ; cassé : « 47 M$ bad debt à 10 % » (absent de Gatto), « 65 %/15 % FC26 » (identité introuvable), « 15,7 Md$ » (sans primaire) ; procurements §7 : Amini–Filipović–Minca 2016 (ORL, DOI 10.1016/j.orl.2015.10.005), Chow 1970 (IEEE TIT, « reject tradeoff »), post-mortem CAPO primaire, Messari (429) | procurements → investisseur dans ADR-M020 | — |
| 2e avis advisor-DeFi (après M-2) | REÇU (`AVIS-advisor-defi-bis-…`) : **fait structurel** — sources d'oracle Aave sUSDe/USDe/LST = adaptateurs plafonnés à taux de change ⇒ boucle de cascade par l'oracle coupée par construction ; objet → (c) témoin de faits + (b) classe `liquidation-realized-given-oracle-path-24h` ; (a) fermé sur Aave core ; treillis en annexe ; plan U-0..U-7 révisé | ADR-M020 après M-2b + bissection | M-2b |
| Mesures M-2b + bissection | REÇUES (`MESURES-M2b-sources`, `36541b4`) : part 1,52 % (< 5 %) ; update oracle précède la liquidation 15/15 (conséquence) ; bucket de krach pousse la pente vers le haut ; bascule sUSDe/USDe au bloc 22002625 (2025-03-08), ARFC 20495 [lu] ; WETH sur Chainlink SVR depuis 2025-06-28 | — | — |
| Lecture Dunn 2022 (hiérarchique) | REÇUE : nouvel événement non trivial seulement si K ≥ 1/α−1 (99 à α = 0,01) ; événement observé = n₁ > 1/α−1 ; n_j fixé a priori violé et déclaré | — | — |
| Mesures préalables M-1, M-2 | REÇUES (`MESURES-prealables-2026-09-19.md`, `ebf49f2`) : M-1 faisable keyless (5 opérateurs archive, N+2 appels, ~1 min) ; **M-2 Λ indéterminé, pente forte vers absence** (WETH oct. 2025 : 88 % liquidé en 1 h de krach exogène, oracle en V, IC ∋ 0, 0,318 % du volume Binance) ; sUSDe 2025-02 : décote d'oracle exogène ⇒ liquidations (conséquence) | objet B à redéfinir → 2e consultation advisor-DeFi EN COURS | — |
| Lecture Amini 2016 + Chow 1970 (procurés) | REÇUE (`L-lecture-amini2016-chow1970.md`) : étiquetage Q_*/Q^* absent de la littérature → à démontrer ; Chow qualitatif seulement sous `under_calib` | — | — |
| Lecture Gatto 2026 + Garcia Seuma 2026 | REÇUE : « 47 M$ » non trouvé (cassé confirmé) ; Gatto = page web, PDF SSRN 51 p. à procurer ; λ subcritique, k perps seulement | — | — |
| Lecture Tibshirani 2019 + Barber 2023 | REÇUE : intra-événement = Thm 2 exact ; swap de bloc non couvert → Dunn–Wasserman–Ramdas 2022 (JASA, arXiv:1809.07441) téléchargé OA (collision arXiv:2010.06001 écartée) | lecture Dunn à lancer | — |
| Note formelle treillis (T monotone, Q_*/Q^*, unicité, sens du treillis) | EN COURS — worker | affirmation centrale de l'ADR | — |
| ADR-M020 « Eligible is not liquidated » | **checkpoint-1 : approuvé-avec-corrections U-0..U-3** (10 corrections pliées `3a48c88`) ; escalade classe (b) **tranchée : « les 2 »** (position + shortfall cluster, U-4) ; U-1 peut démarrer après W-1 + ADR de lot U-1 | ADR U-1 | W-1 |
| ADR-U1 (recorder du book) | checkpoint-1 : **U-1a approuvé-avec-corrections C-1..C-8** (worker plie) ; **U-1b refusé tel qu'écrit** — mon adjudication « Temoignage sans `attest` » était infondée (vérificateur Shōgen exige Constat compagnon + résidus au registre ; `error_origin` orchestrateur) ; **Q1-Q3 tranchées** (décisions 15-17 : WETH + sUSDe/USDe ; contrat `AttestedBook` (b) ; règle générale séries sha-pinnées) ; U-1b se réécrit sur (b) + ADR de contrat `AttestedBook` ; info : Narabi sert publiquement `attestor.key:"deadbeef"` → lot K-1 clés à ouvrir tôt | Q1-Q3 → U-1a démarre après folds (G7 attend Q3) | investisseur |
| Commit de `docs/biblio/ukemi-modeL/` sur `lot/etude-suite` | FAIT (archive + avis + sha ; pdf/_txt gitignorés, sha tracés) ; MESURES à committer à réception | — | mesures |

## C. MONARK Bell — témoin public attesté des TSV, actions tokenisées (nom investisseur 2026-09-19 ; décisions 1-3, 10 : **produit full fini, VPS dédié dès T-1, grade institutionnel, GTM propre**)
| Élément | État | Prochaine action | Bloqué par |
|---|---|---|---|
| Étude + PROPOSITIONS + procurement §8 | LIVRÉ (`Downloads\PRODUITS\etude-2026-09-19\`) | — | — |
| Sources T-1 gratuites (LULD, CTA/UTP, halts NYSE 2019-2026) | RÉCUPÉRÉES, sha consignés (`sources-T1/`) | — | — |
| Abonnement Massive/Polygon Stocks Starter | ACTIF (29 $/m) ; clé en env utilisateur `POLYGON_API_KEY` (32 car., jamais affichée), testée 2026-09-19 (TSLA prev close 364,27 $, Bearer) ; licence « Individual Use » à revoir avant publication dérivée | — | — |
| Recherche web (post-mortem CAPO, Uniswap rebasing, Token-2022 scaled UI, ERC-8056, événement déficit Aave v3.3, Chainlink SVR) | EN COURS — chercheur, lecture directe par MONARK (investisseur : « il faut que tu lises toi-même ») | intégrer PR-UK-3/14 | — |
| Procurement §8 | reçus : Amini 2016, Chow 1970, CFS BoE WP 264 (Ukemi) ; **Scharnowski 2026** (Bell, item 1, lecteur en cours) ; restent : Gatto PDF SSRN, post-mortem CAPO, Nexus terms, TokenLogic, rsETH report, LlamaRisk scope, Credora, Messari, clé Pyth Hermes, avis Massive licence | intégrer à réception | investisseur |
| **T-1a implémentation** (spike RPC, faits i-ii, digest, 13 mutants, fixture DST) | gelé `8e5752a` (302/302, R-25 **892** mesuré par la G2) ; **G2 fraîche APPROUVÉ-AVEC-CORRECTIONS** (`docs/G2-lot-t1a.md`) : C-1 ancre de session sur jour férié (vraie faute), C-2 mutant ordre de clés survivant, C-3 `CLOSE_KEY` camelCase, C-4 volume nul ⇒ `gT=0` (faux fait), C-5/C-6/C-7 ; O-1 census+MWCB à re-former, O-3 conflation Ondo, O-5 scission = amendement ADR-B0 ; **pliage EN COURS (worker)** ; puis amendement ADR-B0 (orchestrateur : O-1/O-3/O-5), checkpoint-2, G7 | pliage → ADR-B0 amendé → checkpoint-2 → G7 | Helius (rejeu seulement) |
| T-1b (publication `/bell/`, panneau, VPS dédié, clé Ed25519) → T-2 → T-3 | PLANIFIÉS (T-3 après U-4) | ADR de lot + checkpoint-1 | T-1a, VPS, K-1 |
| ADR-B0 (programme Bell) | checkpoint-1 approuvé-avec-corrections, **C-1..C-19 pliées `a45b3f4`**, ESC-1 (c) et ESC-2 (a) tranchées, lettre SEC scopée Q3/Q6, capteur budō « Kane » proposé (collision à vérifier) ; validateur a rejoué le CSV (8 halts historiques sur 15 caps, 0 depuis 2025-06-30, 18 graphies `Reason`, 0 MWCB) ; **ESC-1 tranchée (c) : écart seul publié, close jamais republié, rejeu tiers sous sa propre licence** ; **ESC-2 tranchée (a)** : l'orchestrateur déploie, indépendance = hôte + clé séparés, dit sur `/bell/method` ; T-1a démarre après folds de périmètre + cartographie committée (C-18) | investisseur ESC-1/2 ; C-18 | cartographie |
| GTM-BELL (`docs/GTM-BELL.md`, `9a14841`) | **PRÊT** — corrections advisor pliées ; thèse : « valeur de position, seul acheteur plausible = DAO votant déjà un budget de risque » ; 5 sondes comportementales (Steakhouse/Morpho d'abord) ; pivot : un curateur/DAO consomme `g_t` publiquement sous 30 j après T-1b ; conflit Credora PD/PSL arbitré (présent sur la page méthodologie) | présenté à l'investisseur ; sondes après T-1b | T-1b |
| **RAPPEL investisseur : clé API Helius** (abonnement en cours) → `setx HELIUS_API_KEY` dans le terminal, jamais dans le chat ; à réclamer avant T-1a | ATTENDU | test d'appel à réception | investisseur |
| Registre Bell | TRANCHÉ (décision 11) : capteur `FLEET_AGENTS` upcoming en T-1/T-2 → produit `PRODUCTS` à la Définition de fini (amendement M004 D14) | — | — |
| VPS dédié Bell | À PROVISIONNER par l'investisseur (spec dans ADR-B0 ; ordre de grandeur 2 vCPU / 4 Go / 80 Go, Ubuntu 24.04, ~8-10 €/mois) | clé SSH, DNS `bell.monarkgate.tech` | ADR-B0 |
| Lettre de commentaire SEC File 4-927 | VALIDÉE, après T-1, go avant dépôt | — | T-1 |
| Hackathon Stocklana (dépôt 2026-09-25) | OPTION ultérieure, plan inchangé | décision investisseur le moment venu | — |

## D. Opérations vivantes
- **Miroir public** `KraidleAI/Monark` = `5bde13a` (2026-09-19 07:40Z, restyle B) ; `main` privé = `144ce68` ; 0 PR ouverte. Prochaine fenêtre : après fusion E-bon-marché / R-25-séries / U-1a / T-1a sur `main` privé (go investisseur).
| Élément | État | Prochaine action |
|---|---|---|
| Narabi | T=1 (2026-09-19 00:39 UTC) ; prochain pas 00:39 UTC | vérifier T=2 demain ; consigner |
| Annonce X « Day 1 » | rédigée, NON publiée | go investisseur |
| Shōgen S2 | driver vivant (contrôle 01:44 UTC) | watchdog ; J28 seulement sur décision |
| Harnais Caddy (log D3) | déployé 2026-09-18 21:11 UTC | lecture J+30 = 2026-10-18 |
| memstack | reconnecté au `claude mcp list`, session courante en ConnectionRefused | consigner au redémarrage |
| MCP papiers (arxiv, openalex, semantic-scholar) | installés user-scope | actifs au redémarrage |

## E. Dettes / items formés transverses (avec déclencheur)
**RELEASE GATE (décision investisseur 19, 2026-09-19 06:54 UTC) : « au prochain release ; aucune dette. toutes seront fermées. » Tout item de cette section, plus E1/E2/E6/E7/E8/TEST_ROOTS/skill-DEMO/CRA-ENISA du rapport P1 §3.d, est BLOQUANT pour la prochaine release publique. Lot E-coûteux à lancer après la fusion d'E-bon-marché ; clause (a) M018 écartée définitivement.**
- **Bell (G2 T-1a, décision 19 — à fermer avant la release Bell)** : census complet 839 xStocks + 395 Ondo [déclencheur PR-B-ONDO + Polygon `v3/reference/tickers`] ; flux MWCB (condition H) [procurement feed SIP MWCB — le CSV NYSE porte 0 ligne market-wide] ; conflation « Ondo 837,9 M$ » (USDY/OUSG ≠ actions) → amendement ADR-B0 ; scission T-1a-i/ii + `bell_sha` non signé + mesure fondatrice 0 ligne → amendement ADR-B0 daté ; sondes RPC du spike à consigner en provenance ; scope lang:gate/export:check sans `bell`/`sentinel` (item outillage) ; racine `apps/bell/test/fixtures` dans l'exclusion R-25 (lot R-25-séries C-4).
- **Lot R-25 séries** (décision 17) : amendement ADR-M003 D9 sexies (livré `d3eb9bb` ; G2 APPROUVÉ-AVEC-CORRECTIONS C1 jeton quoté / C2 liaison nom↔sha, pliées `ddd3aa0` ; **checkpoint-2 EN COURS**) — exclusion par pathspec des séries sha-pinnées + test ; à faire AVANT le G7 de U-1a.
- **ADR contrat `AttestedBook`** (décision 16) : rédigé (`b60201d`) ; points (A)/(B) **tranchés par délégation** (décision 20 : A témoin total, B motif par classe) ; U-1b-a lançable après G7 de U-1a.
- **Lot K-1 clés Ed25519** (Narabi sert `deadbeef`) : avant tout `built` de sentinelle / go U-6 / Bell T-1b.
- Étape h5 portant `attested` → prochain lot touchant `apps/harness` (T-1 ou U-4).
- Test d'hygiène dépendances (`import/no-extraneous-dependencies`) → cartographie M018 D4.
- `MONARK_PHASE` export mort → lot de nettoyage.
- Région vide `label_schema:"up|down"` sur classe numérique → ADR-M020.
- ADR-M009 l.124 « 47 % » → 49,1 % à la prochaine édition.
- Replay (l) 11 mois à T ≥ 7 (2026-09-26) ; D3 lecture J+30 (2026-10-18) ; K-0 Koyomi pré-enregistrement ; M012 (g) dépôt dédié à T ≥ 30.
- Ratifications investisseur en suspens : excision journal.jsonl Shōgen (D-ADJ) ; ADR-M002 D5/D6 bFloor.

## F. Règles apprises cette passe (à ne plus enfreindre)
- **Pile de PR** : jamais `--delete-branch` avant que toute la pile soit sur `main` (la suppression d'une base auto-ferme les dépendants et agrège les lots au-delà de R-25 — incident 2026-09-19, corrigé par re-découpage #84-#87).
- **Vitrine = ADR-M013 (T0/T1/T2), rappel investisseur 2026-09-19 (« on l'applique »)** : en vigueur depuis F-site-10 (`d87ffba` T1, puis 4 commits `site[T0]`) ; W-1 était T2 à bon droit (registre `fleet.ts`). Pré-classement des lots site à venir : `/bell` page publique + méthode (T-1b) = **T2** (nouveau service, registre upcoming 12→13, phrases publiques nouvelles) ; panneau Ukemi statut/prose (E2, Shōgen-honnêteté) = **T2 si `fleet.ts` touché, sinon T0** ; rendu du `wiring` (E6, designer) = **T1** (composant sur registre existant) ; README:48/111/112 « verified » = **T0** ; corrections de copie = **T0**. Le régime est déclaré dans le message de commit et contrôlé par la G2.
- Tout fold post-gel re-sha le G1 dans le même commit (récidive b2/b3).
- Consigne de montage G2/checkpoint : jamais de jonction `node_modules` vers le dépôt réel (masque les mutants inter-paquets) ; reconstruire.
- Freeze K-C : aucun commit sur la branche gelée pendant un checkpoint ; les docs de synthèse vont sur `lot/etude-suite`.
- Procurement signalé avant production ; clé/secret jamais dans le chat (sci-bot).

## G. Feuille de route proposée (2026-09-19, à valider par l'investisseur : « ok plan »)
Séquence commune : W-1 → checkpoint-2 → G7 → fusion ; cartographie M018 D4 + rapport de passe P1 ; ADR-M020 (Ukemi) et ADR-B0 (Bell) → checkpoint-1 chacun. Puis deux chantiers en parallèle, deux worktrees (`lot/u-*`, `lot/b-*`), un orchestrateur, workers parallèles, **lots `apps/harness` sérialisés** (U-4 avant T-3), registre `fleet.ts` modifié seulement au G7 de chaque lot.
| Semaine | Ukemi | Bell |
|---|---|---|
| S1 | U-1 recorder book archive (sources d'oracle dans le digest) ‖ U-3 réalisations décomposées + bissection de source | T-1 témoin des faits xStocks/Ondo (écart vs close Polygon, delta halts, volume/pool, supply vs PoR), `/bell/` |
| S2 | U-2 `clearing.ts` (Λ=0 ⇒ statique ; retrait fiction `cascade.ts` ; treillis annexe) | T-2 parité de droits (rebase/dividendes en pool) |
| S3 | U-4 classe `liquidation-realized-given-oracle-path-24h` (harness) | — |
| S4 | U-5 témoin résiduel + rejeux pré-enregistrés | T-3 classe `tsv-offhours-gap` (harness) |
| S5 | U-6 sentinelle-2 servie ⇒ Ukemi réellement built | Bell built ; lettre SEC 4-927 (go) |
| S6+ | U-7 papier | bascule sur le flux G des premiers TSV |
Prérequis manquants (investisseur) : clé Pyth Hermes gratuite ; Gatto PDF SSRN 7157638 ; post-mortem CAPO primaire ; (reçus : Scharnowski 2026, CFS BoE WP 264) ; avis écrit Massive sur la licence « Individual Use » avant publication dérivée. Coût nouveau : 0 $ avant T-3/U-4 (Solana RPC ~50 $/mois à la bascule TSV ; repli archive Ethereum ~50 $/mois si un opérateur gratuit coupe).
- **Règle apprise (checkpoint-1 U-1)** : ne jamais ratifier un tuyau vers un contrat gelé sans lire le vérificateur du contrat (`verification.rs`) ; toute adjudication d'orchestrateur touchant un contrat = lecture de source d'abord.
