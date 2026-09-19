# Tableau de bord des chantiers — MONARK (tenu par l'orchestrateur, mis à jour à chaque événement)
Dernière mise à jour : 2026-09-19 05:45 UTC (horloge système)

## A. Passe P1 — branchement (ADR-M017/M018/M019)
| Lot | État | Prochaine action | Bloqué par |
|---|---|---|---|
| P1-b1, b2, b3 | CLOS, fusionnés `lot/etude-suite` | — | — |
| W-1 (`wiring`, test de gel, prose vitrine ×5, `fleet.ts:70`, panneau Ukemi) | G2 approuvé-avec-corrections C1-C4 pliées ; gel `3e0a150` ; **checkpoint-2 EN COURS** | G7 → fusion → cartographie | — |
| Cartographie M018 D4 + rapport de passe P1 | À FAIRE après W-1 | worker contexte frais : graphe réel vs registre | W-1 |
| Miroir public + PR empilées (#78-#83, lot/etude-suite, p1-b*, w-1) | EN ATTENTE fenêtre publique | push au go investisseur | investisseur |

## B. Ukemi — programme « au paroxysme » (décision investisseur 2026-09-19)
| Élément | État | Prochaine action | Bloqué par |
|---|---|---|---|
| Avis advisor-DeFi (objet B cascade cluster, plan U-0..U-7) | REÇU, persisté `docs/biblio/ukemi-modeL/` | — | — |
| Avis advisor-marché (payeur = DAO/SP ; classe shortfall vs dette liquidée) | REÇU, persisté | — | — |
| Campagne biblio (25 sources, 12 PDF, 36 sha) | REÇUE — `R-biblio-ukemi-modeL.md` (983 l.) ; cassé : « 47 M$ bad debt à 10 % » (absent de Gatto), « 65 %/15 % FC26 » (identité introuvable), « 15,7 Md$ » (sans primaire) ; procurements §7 : Amini–Filipović–Minca 2016 (ORL, DOI 10.1016/j.orl.2015.10.005), Chow 1970 (IEEE TIT, « reject tradeoff »), post-mortem CAPO primaire, Messari (429) | procurements → investisseur dans ADR-M020 | — |
| 2e avis advisor-DeFi (après M-2) | REÇU (`AVIS-advisor-defi-bis-…`) : **fait structurel** — sources d'oracle Aave sUSDe/USDe/LST = adaptateurs plafonnés à taux de change ⇒ boucle de cascade par l'oracle coupée par construction ; objet → (c) témoin de faits + (b) classe `liquidation-realized-given-oracle-path-24h` ; (a) fermé sur Aave core ; treillis en annexe ; plan U-0..U-7 révisé | ADR-M020 après M-2b + bissection | M-2b |
| Mesures M-2b (part de l'heure 21:00Z, test intra-bloc, bootstrap) + bissection du bloc de bascule de source sUSDe/USDe | EN COURS — worker | conditionne U-0 | — |
| Lecture Dunn 2022 (hiérarchique) | REÇUE : nouvel événement non trivial seulement si K ≥ 1/α−1 (99 à α = 0,01) ; événement observé = n₁ > 1/α−1 ; n_j fixé a priori violé et déclaré | — | — |
| Mesures préalables M-1, M-2 | REÇUES (`MESURES-prealables-2026-09-19.md`, `ebf49f2`) : M-1 faisable keyless (5 opérateurs archive, N+2 appels, ~1 min) ; **M-2 Λ indéterminé, pente forte vers absence** (WETH oct. 2025 : 88 % liquidé en 1 h de krach exogène, oracle en V, IC ∋ 0, 0,318 % du volume Binance) ; sUSDe 2025-02 : décote d'oracle exogène ⇒ liquidations (conséquence) | objet B à redéfinir → 2e consultation advisor-DeFi EN COURS | — |
| Lecture Amini 2016 + Chow 1970 (procurés) | REÇUE (`L-lecture-amini2016-chow1970.md`) : étiquetage Q_*/Q^* absent de la littérature → à démontrer ; Chow qualitatif seulement sous `under_calib` | — | — |
| Lecture Gatto 2026 + Garcia Seuma 2026 | REÇUE : « 47 M$ » non trouvé (cassé confirmé) ; Gatto = page web, PDF SSRN 51 p. à procurer ; λ subcritique, k perps seulement | — | — |
| Lecture Tibshirani 2019 + Barber 2023 | REÇUE : intra-événement = Thm 2 exact ; swap de bloc non couvert → Dunn–Wasserman–Ramdas 2022 (JASA, arXiv:1809.07441) téléchargé OA (collision arXiv:2010.06001 écartée) | lecture Dunn à lancer | — |
| Note formelle treillis (T monotone, Q_*/Q^*, unicité, sens du treillis) | EN COURS — worker | affirmation centrale de l'ADR | — |
| ADR-M020 (plan : objet, classe, lots, oracles, procurement) | À RÉDIGER après 2e avis DeFi + note treillis | → checkpoint-1 validateur → présentation investisseur point par point | avis DeFi bis, note treillis |
| Commit de `docs/biblio/ukemi-modeL/` sur `lot/etude-suite` | FAIT (archive + avis + sha ; pdf/_txt gitignorés, sha tracés) ; MESURES à committer à réception | — | mesures |

## C. MONARK Bell — témoin public attesté des TSV, actions tokenisées (nom investisseur 2026-09-19 ; décisions 1-3)
| Élément | État | Prochaine action | Bloqué par |
|---|---|---|---|
| Étude + PROPOSITIONS + procurement §8 | LIVRÉ (`Downloads\PRODUITS\etude-2026-09-19\`) | — | — |
| Sources T-1 gratuites (LULD, CTA/UTP, halts NYSE 2019-2026) | RÉCUPÉRÉES, sha consignés (`sources-T1/`) | — | — |
| Abonnement Massive/Polygon Stocks Starter | ACTIF (29 $/m) ; clé en env utilisateur `POLYGON_API_KEY` (32 car., jamais affichée), testée 2026-09-19 (TSLA prev close 364,27 $, Bearer) ; licence « Individual Use » à revoir avant publication dérivée | — | — |
| Procurement §8 items 1, 5, 6, 8-15 | investisseur « je vais les chercher » | intégrer à réception (pdftotext, sha, lecteur) | investisseur |
| Lots T-1 (témoin faits, inscription « Bell » upcoming) → T-2 (parité droits) → T-3 (classe écart) | PLANIFIÉS après P1/W-1 et après ADR-M020 (ordre investisseur) | ADR T-1 + checkpoint-1 | W-1, ordre |
| Lettre de commentaire SEC File 4-927 | VALIDÉE, après T-1, go avant dépôt | — | T-1 |
| Hackathon Stocklana (dépôt 2026-09-25) | OPTION ultérieure, plan inchangé | décision investisseur le moment venu | — |

## D. Opérations vivantes
| Élément | État | Prochaine action |
|---|---|---|
| Narabi | T=1 (2026-09-19 00:39 UTC) ; prochain pas 00:39 UTC | vérifier T=2 demain ; consigner |
| Annonce X « Day 1 » | rédigée, NON publiée | go investisseur |
| Shōgen S2 | driver vivant (contrôle 01:44 UTC) | watchdog ; J28 seulement sur décision |
| Harnais Caddy (log D3) | déployé 2026-09-18 21:11 UTC | lecture J+30 = 2026-10-18 |
| memstack | reconnecté au `claude mcp list`, session courante en ConnectionRefused | consigner au redémarrage |
| MCP papiers (arxiv, openalex, semantic-scholar) | installés user-scope | actifs au redémarrage |

## E. Dettes / items formés transverses (avec déclencheur)
- Étape h5 portant `attested` → prochain lot touchant `apps/harness` (T-1 ou U-4).
- Test d'hygiène dépendances (`import/no-extraneous-dependencies`) → cartographie M018 D4.
- `MONARK_PHASE` export mort → lot de nettoyage.
- Région vide `label_schema:"up|down"` sur classe numérique → ADR-M020.
- ADR-M009 l.124 « 47 % » → 49,1 % à la prochaine édition.
- Replay (l) 11 mois à T ≥ 7 (2026-09-26) ; D3 lecture J+30 (2026-10-18) ; K-0 Koyomi pré-enregistrement ; M012 (g) dépôt dédié à T ≥ 30.
- Ratifications investisseur en suspens : excision journal.jsonl Shōgen (D-ADJ) ; ADR-M002 D5/D6 bFloor.

## F. Règles apprises cette passe (à ne plus enfreindre)
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
Prérequis manquants (investisseur) : clé Pyth Hermes gratuite ; Gatto PDF SSRN 7157638 ; Scharnowski 2026 (JIFMIM, payant) ; Cifuentes–Ferrucci–Shin 2004 BoE WP ; post-mortem CAPO primaire ; avis écrit Massive sur la licence « Individual Use » avant publication dérivée. Coût nouveau : 0 $ avant T-3/U-4 (Solana RPC ~50 $/mois à la bascule TSV ; repli archive Ethereum ~50 $/mois si un opérateur gratuit coupe).
