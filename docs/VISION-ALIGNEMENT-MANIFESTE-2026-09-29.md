# VISION-ALIGNEMENT — ce que le manifeste promet, ce qui existe, ce qui doit le tenir (2026-09-29)

Orchestrateur `claude-fable-5-1`, décision 284. Objet : le texte public `F:/PRODUITS/annonces/ANNONCE-MONARK-MANIFESTE-2026-09-29.md` donne une image de MONARK ; ce registre liste **chaque affirmation** du texte, son statut au registre de flotte (`apps/site/lib/fleet.ts`, source unique de vérité, gelé par test) et le lot ou l item qui la rend vraie. Règle : le texte n affirme JAMAIS une capacité upcoming comme livrée ; il l écrit au temps de l intention. Ce registre est la feuille de route que le développement doit rejoindre, dans l ordre de la décision 283 (AgileGates d abord), puis Dōjō rang 1, puis le reste.

## 1. Affirmations sur les pièces livrées (doivent rester vraies : test racine `fleet_register_built_set_is_frozen`)

| Affirmation du texte | Pièce | Statut registre | Preuve servie | Ce qui la casserait |
|---|---|---|---|---|
| « turns each source answer into a signed testimony, types it into a dated fact, measures how independent the sources are ; residual carried into the verdict » | Shōgen | built | `served_by` MCP attest → gate ; test `gate_attested_concordant_files_residual` | retirer le résidu attesté du verdict servi |
| « coverage controlled inference, the gate itself ; replayed on the real wire and on a bring your own calibration loop » | Hikae | built | MCP gate (`btc-dir-15m`, `stable-run-velocity-24h`, BYO) ; tests d intégration nommés | une décision servie sans région de couverture |
| « upper bound on the liquidable amount for the calibrated stratum ; abstains by construction elsewhere » | Ukemi | built | MCP cascade → gate ; `probe_harness_records_real_decision`, `u4b_gate_serves_region_from_real_artifact` | servir un chiffre hors strate calibrée ; outil cascade « transitional, to be replaced » (dit au registre) |
| « daily published timeline parsed by the site from the published files ; attested flow into the served gate » | Narabi | built | fichiers publiés + flux attesté ; tests d intégration | une chronologie non publiée ou non parsée par la surface |
| « signed, hash chained timeline served on its own host, checked end to end by a verifier on the reader's side » | MONARK Bell | built | hôte servi + vérificateur non-LLM contre le trousseau commis | un enregistrement altéré non détecté par le vérificateur lecteur |
| « never a probability of being right » | doctrine D-0 | règle | copie publique épinglée (`shogen-copy.ts`), porte des textes | un texte servi qui affiche une confiance |

## 2. Affirmations au temps de l intention (upcoming au registre ; chacune = un lot futur)

| Affirmation | Pièce | Statut | Lot / item qui la tient | Précondition |
|---|---|---|---|---|
| « the point every transfer, swap or signature passes through first ; commit, defer or abstain ; remaining allowance ; least privilege, dual control » | Genkan | upcoming | lot Genkan (G0 à écrire ; ligne publique fleet.ts l.260) | Dōjō rang 1 puis ordre de la file ; mandat de capital D-2 |
| « attests the facts it extracts from a document or an event » | Mokugeki | upcoming | lot Mokugeki ; moteur de MONARK Verdict (fleet-presentation l.118) | Shōgen (attestation) fusionné : oui |
| « quotes both sides of a market from inventory, stays silent when told to abstain » | Kamae | upcoming | lot Kamae (Avellaneda Stoikov cité au registre) | Hikae (abstention gatée) : oui |
| « exits a liquidity range ahead of toxic order flow » | Kaihi | upcoming | lot Kaihi | Shōgen + Hikae |
| « routes a swap to a venue and issues a settlement receipt » | Kessai | upcoming | lot Kessai | Genkan (porte) d abord |
| « fits a rate curve across maturities, gates rollovers and looped positions » | Kyokusen | upcoming | lot Kyokusen (Nelson Siegel cité au registre) | Hikae |
| « flattens leveraged exposure ahead of a recurring weekend window closure » | Koyomi | upcoming | lot Koyomi | Genkan + Kessai |
| « five applications : Firebreak, Warden, Softlanding, Verdict, Ballast » | applications | upcoming | un lot par application ; Verdict = Mokugeki × Kamae | leurs agents moteurs livrés et branchés |
| « institutional grade tools in ordinary hands » | plateforme (site à trois surfaces : public, live, console d audit ; décision 2026-09-05) | partiel | Dōjō rang 1 (page snapshot, PLAN-DOJO-PAGE-1) ; console d audit ; PUBLIC-CADENCE-1 | AgileGates finalisé (283) |
| « agents that decide for a stranger's capital » | direction D-2 | direction, pas produit | chaque G0/G7 jugé à cette aune ; mandat de capital avec plafond de perte : lot futur | attesteur K-1, rejeu depuis paramètres publiés |

## 3. Affirmations sur la méthode (AgileGates)

| Affirmation | Réalité au 2026-09-29 00:5x UTC | Lot |
|---|---|---|
| « a plan is approved before code is written » | cp-1 du validateur à chaque lot (fait) ; cp-1 bref pour les lots bounded (amendement 29/09) | fait |
| « a reviewer who has never seen the author's context reads one hundred percent and replays every proof » | G2 à contexte frais (fait) ; re-revues ciblées (fait) | fait |
| « a single oracle replays the entire test suite on a clean clone and writes a dated record, with the role that requested it » | `scripts/oracle/run.mjs` (M-3 fusionné) | fait |
| « every new test carries the mutation that kills it ; a red proof shows it failed before and passed after » | `scripts/red-proof.mjs` (M-4 fusionné) ; mutation automatique du diff = M-6 (à faire) | fait / M-6 |
| « a journal of the lot records each gate with the receipt and the oracle record, and rejects a forged record » | M-5 (tour 3 en vol ; G7 attendu) | M-5 |
| « the registry of what is built is frozen by a test » | `fleet_register_built_set_is_frozen` | fait |
| « everything that passes lands on a public mirror through a gate that strips anything internal » | `release-public.mjs`, `export:check`, porte des textes (faits) ; cadence par lot : PUBLIC-CADENCE-1 (rang 1 après la méthode, décision 275) ; push = acte investisseur | PUBLIC-CADENCE-1 |
| « we ran this method on itself » | lots M-1..M-9 conduits sous la méthode ; 5 fusionnés | fait |

## 4. Affirmations chiffrées et leurs sources (FAITS `docs/FAITS-manifeste-monark-2026-09-29.md`)

| Chiffre | Source | Niveau |
|---|---|---|
| > 7 M jetons, < 97 000 avec liquidité > 1 000 $ ; 98,6 % | Solidus Labs, Rug Pull Report 2025 | [lu] |
| majorité perdante chaque mois avril 2024 → fin 2025 ; plancher 30 % juin 2025 ; gagnant typique 1 à 500 $ ; bots non filtrés | CoinGecko Research, mai 2026 | [lu] |
| « collectibles », « not protected by the federal securities laws », février 2025 | SEC, Division of Corporation Finance | [lu] |
| adoption « outpaces previous waves », « prediction machines » | BIS AER 2024 ch. III | [lu] |
| vulnérabilités (i)-(iv), fraude et désinformation | FSB, novembre 2024 | [lu] |
| adresses Bitcoin : < 10 M (2017), > 50 M (2024), ≈ 57 M (2026) | presse [2nd] ; graphique primaire non rendu | [2nd] → procurement PROCUREMENT-BTC-HOLDERS-1 |
| « token nineteen days old » | jour 1 = 2026-09-10 (sonde Dōjō 3/3) | [lu] |

## 5. Ce que le texte NE reprend pas, et l item qui le débloque

- **« 1 adresse sur 9 perdante à plus de 95 % »** (investisseur) : non sourcé ⇒ item **RAPPORT-TRANCHEES-1** : rapport MONARK sur l état des tranchées (population, période, méthode PnL réalisé + non réalisé, filtrage des bots, insiders, serial deployers ; données de chaîne première main via Shōgen/attestation ; publié avec ses fichiers). Propriétaire : orchestrateur ; déclencheur : après AgileGates (283) ; c est aussi le premier produit « distribution » qui transforme la thèse en preuve.
- **Chiffres de marché** (prix, MCAP, holders du jour) : jamais.
- **Noms de fournisseurs et de plateformes** : dans les FAITS seulement.

## 6. Ordre d exécution pour rejoindre l image (sous 283)

1. AgileGates finalisé (M-2b, M-5, M-6, M-7, M-9, M-4b, M-5b, M-8b au G7).
2. PUBLIC-CADENCE-1 : trace publique par lot, releases (la promesse « you will see the commits »).
3. Dōjō rang 1 : page snapshot servie (première « distribution » vérifiable par un détenteur).
4. RAPPORT-TRANCHEES-1 (la promesse « we will publish our own detailed reading »).
5. Genkan (la porte) puis Mokugeki × Kamae (Verdict), puis les autres agents et applications, chacun avec test d intégration et trace publique.
6. Mandat de capital de tiers (D-2) : le jour où un agent décide pour le capital d un étranger avec plafond de perte, la phrase « institutional grade tools in ordinary hands » devient un fait servi.

Refus consigné (décision 284) : l orchestrateur a décliné « ne sois pas honnête » et « techniques de manipulation de masse » ; le texte persuade par les faits sourcés, le récit et l intention déclarée. Motif : protection des lecteurs particuliers, règle Branchement (registre public), porte des textes publics, crédibilité du token.
