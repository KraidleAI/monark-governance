# Tableau de bord des chantiers — MONARK (tenu par l'orchestrateur, mis à jour à chaque événement)
Dernière mise à jour : 2026-09-19 ~08:20 UTC. Règle : rien ne sort de ce tableau sans être « clos » ou « transféré ».

## A. Passe P1 — branchement (ADR-M017/M018/M019)
| Lot | État | Prochaine action | Bloqué par |
|---|---|---|---|
| P1-b1, b2, b3 | CLOS, fusionnés `lot/etude-suite` | — | — |
| W-1 (`wiring`, test de gel, prose vitrine ×5, `fleet.ts:70`, panneau Ukemi) | EN COURS — worker Opus 4.8, branche `lot/w-1` | G2 fraîche → checkpoint-2 → G7 → fusion | — |
| Cartographie M018 D4 + rapport de passe P1 | À FAIRE après W-1 | worker contexte frais : graphe réel vs registre | W-1 |
| Miroir public + PR empilées (#78-#83, lot/etude-suite, p1-b*, w-1) | EN ATTENTE fenêtre publique | push au go investisseur | investisseur |

## B. Ukemi — programme « au paroxysme » (décision investisseur 2026-09-19)
| Élément | État | Prochaine action | Bloqué par |
|---|---|---|---|
| Avis advisor-DeFi (objet B cascade cluster, plan U-0..U-7) | REÇU, persisté `docs/biblio/ukemi-modeL/` | — | — |
| Avis advisor-marché (payeur = DAO/SP ; classe shortfall vs dette liquidée) | REÇU, persisté | — | — |
| Campagne biblio (25 sources, 12 PDF, 36 sha) | REÇUE — `R-biblio-ukemi-modeL.md` (983 l.) ; cassé : « 47 M$ bad debt à 10 % » (absent de Gatto), « 65 %/15 % FC26 » (identité introuvable), « 15,7 Md$ » (sans primaire) ; procurements §7 : Amini–Filipović–Minca 2016 (ORL, DOI 10.1016/j.orl.2015.10.005), Chow 1970 (IEEE TIT, « reject tradeoff »), post-mortem CAPO primaire, Messari (429) | procurements → investisseur dans ADR-M020 | — |
| Mesures préalables M-1 (coût `eth_call` archive), M-2 (Λ ≠ 0) | EN COURS — worker Opus 4.8 | résultat conditionne U-0 | — |
| ADR-M020 (plan : objet, classe, lots U-0..U-7, oracles, procurement) | À RÉDIGER par l'orchestrateur | → checkpoint-1 validateur → présentation investisseur point par point | biblio + mesures |
| Commit de `docs/biblio/ukemi-modeL/` sur `lot/etude-suite` | FAIT (archive + avis + sha ; pdf/_txt gitignorés, sha tracés) ; MESURES à committer à réception | — | mesures |

## C. Actions tokenisées — témoin public des TSV (décisions 1-3 du 2026-09-19)
| Élément | État | Prochaine action | Bloqué par |
|---|---|---|---|
| Étude + PROPOSITIONS + procurement §8 | LIVRÉ (`Downloads\PRODUITS\etude-2026-09-19\`) | — | — |
| Sources T-1 gratuites (LULD, CTA/UTP, halts NYSE 2019-2026) | RÉCUPÉRÉES, sha consignés (`sources-T1/`) | — | — |
| Abonnement Massive/Polygon Stocks Starter | ACTIF (29 $/m) ; clé en env utilisateur `POLYGON_API_KEY` (32 car., jamais affichée), testée 2026-09-19 (TSLA prev close 364,27 $, Bearer) ; licence « Individual Use » à revoir avant publication dérivée | — | — |
| Procurement §8 items 1, 5, 6, 8-15 | investisseur « je vais les chercher » | intégrer à réception (pdftotext, sha, lecteur) | investisseur |
| Lots T-1 (témoin faits) → T-2 (parité droits) → T-3 (classe écart) | PLANIFIÉS après P1/W-1 et après ADR-M020 (ordre investisseur) | ADR T-1 + checkpoint-1 | W-1, ordre |
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
