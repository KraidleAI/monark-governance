# ADR-T1aii — Bell : entrypoint collecteur (faits iii-iv, jambe Ethereum) et course fondatrice Helius
- **Statut** : **checkpoint-1 validateur `claude-fable-5-1` : APPROUVÉ-AVEC-CORRECTIONS C-1..C-14 (pliées ci-dessous, `docs/CHECKPOINT1-ADR-T1aii.md`) ; P3 confirmé (aucune décision investisseur requise aujourd'hui) ; escalades conditionnelles E-1/E-2 déclenchées seulement par le spike -b.** Rattachement : ADR-B0 (D2 faits i-iv, D5/D6 sources, D7 scission O-5, D8 abstentions comptées, V-7 `no_close_ref`, O-6 spike, item (g)), `docs/G1-lot-t1a.md` (§0 spike, §5 mesures, §7 points), section « Checkpoint-2 » de `docs/G1-lot-t1a.md` (V-1..V-7), ADR-M003 D9 sexies (séries exclues, PROVENANCE same-dir, `SERIES_EXCLUDED_ROOTS`), ADR-EC C-11 (ii)(iii), `docs/RESSOURCES-HELIUS-2026-09-19.md`, ADR-U1 D3 (quorum ≥ 2 fournisseurs distincts), ADR-M013 (régime site : **aucun** — pas de surface site dans ce lot).
- **Déclencheur** : `HELIUS_API_KEY` posée et testée le 2026-09-19 (INVENTAIRE §5) — prérequis explicite de la mesure fondatrice (ADR-B0 C-1/O-5). Consigne investisseur du jour : priorité aux lots à valeur produit sous AgileGates.
- **Provenance** : rédigé par l'orchestrateur `claude-fable-5-1` le 2026-09-19 ; aucun code écrit ; mesures relues dans `docs/G1-lot-t1a.md` et `apps/bell/src/pools.ts` à HEAD `lot/etude-suite`.

## Contexte (mesuré)
- T-1a-i (clos `9c515ce`, fusionné `7f93e6a`) livre : registre `pools.ts` (4 xStocks Solana Token-2022 + TSLAon Ethereum + 5 pools : 4 Raydium CLMM, 1 Uniswap v3), faits (i) écart de session et (ii) delta de halt, digest canonique non signé, dédup par signature, oracle 307/307, spike RPC public : **corps de transactions élagués sur les endpoints publics rapides** (`getTransaction` = `null` à 90 j), énumération sérielle ~1 447 pages × pools sur le seul endpoint archival ⇒ **rejeu jul.-oct. 2025 impossible sans Helius** ; fenêtre fondatrice = **0 ligne**.
- Helius Developer (mesuré) : archive complète, `getTransactionsForAddress` (Helius-exclusif, 1-1 000 tx/page, filtres slot/`blockTime`/mint/direction, `full`), 10 M crédits/mois, 50 req/s, autoscaling off.
- Dettes formées à fermer ici (bloquantes release, décision 21 : items de code) : entrypoint collecteur + résidu `no_close_ref` (V-7) ; faits (iii) volume/ADV et (iv) supply/PoR ; jambe swap Ethereum (Uniswap v3 TSLAon) ; sondes RPC en provenance (O-6) ; `SERIES_EXCLUDED_ROOTS` + pathspecs Bell + PROVENANCE same-dir (ADR-EC C-11 ii) ; amendements ADR-B0 (C-11 iii : conflation Ondo, scission datée, sondes) ; motif UUID Helius dans `no_secret_in_repo` (RESSOURCES-HELIUS §3.3).

## Décision
**D1 — Deux lots, chacun < 1 205 (R-25 D9 sexies + septies), worktrees `F:\Monark-wt-bell2a`/`-bell2b`, worker `claude-opus-4-8` max, G2 fraîche + checkpoint-2 chacun, aucun registre site touché (`fleet.ts` intact, Bell reste `upcoming` jusqu'à T-1b).**

| Lot | Contenu | Tuyau (M018 D3) | Test d'intégration non-LLM | Estimation |
|---|---|---|---|---|
| **T-1a-ii-a — collecteur** (`lot/t-1a-ii-a`) | `apps/bell/src/collect.ts` (entrypoint CLI env-driven, hors CI, motif `apps/sentinel/src/ukemi/record.ts` durci : retry borné 429/5xx, journal structuré par fournisseur, paramètres en CLI) ; **quorum ≥ 2 fournisseurs distincts** par lecture (Helius + `api.mainnet-beta.solana.com`/publicnode pour Solana ; drpc/mevblocker… pour Ethereum — réutilise `providerOf`/`quorum2` de `rpc2.ts` par import, pas de copie) ; **fait (iii)** volume par pool recalculé des logs (dédup par signature, Jupiter = agrégateur ⇒ swaps au niveau des pools) vs plafond = ADV consolidé mois précédent via Polygon `v2/aggs/ticker/{T}/range/1/day` ([2nd] déclaré, unité actions, résidu `multiplier_unit`) — **jamais « sous le plafond »** ; **fait (iv)** supply on-chain (`getTokenSupply` + DAS `getAsset` Token-2022, mints/burns) vs PoR relayé + staleness + **taux des wrappers** (leçon Edel) — phrase honnête « S et Y diffèrent de X à t ; Y n'est pas vérifiée contre le custodian » ; **jambe Ethereum** : swaps Uniswap v3 TSLAon/USDC (`Swap` logs, VWAP signé) ; résidus nommés : `no_close_ref` (V-7), `volume_zero` (abstention), `por_stale`, `multiplier_unit`, `no_quorum` ; timeline JSONL chaînée (motif T-1a-i) | collecteur → `state.json` + `timeline.jsonl` locaux (publiés à T-1b) | `bell_collector_replays_fixture_bit_identical` (fixture réduite d'une session réelle, sha-pinnée, same-dir PROVENANCE) ; `bell_volume_dedup_by_signature` ; `bell_por_staleness_and_wrapper_rate` ; `bell_no_close_ref_is_a_named_residual` ; mutants : quorum 1 ⇒ `no_quorum` ; signature dupliquée ⇒ rouge ; `closeRef ≤ 0` ⇒ résidu, jamais un digest tronqué | ≈ 700 l. (dont ≈ 250 de tests) |
| **T-1a-ii-b — course fondatrice** (`lot/t-1a-ii-b`, après -a) | **spike Helius** (O-6, committé) : `apps/bell/test/fixtures/spike/` réponses brutes sha-pinnées + PROVENANCE same-dir ; profondeur mesurée de `getTransactionsForAddress` sur les 4 pools Raydium (jusqu'au 2025-06-30 ?), coût en crédits par appel `full`, débit ; **course** : fills des 4 pools xStocks, bornes `[fromUtc, toUtc]` = **2025-07-01 → 2025-10-31 UTC épinglées en provenance** (G2 C-6), close SIP via Polygon (jamais republié, ESC-1 c), **mesure fondatrice = statistique Table 4 de Cong sur données Bell** (part des heures/sessions hors séance où |g_t| > 1 %, > 5 % ; par régime nuit-semaine / week-end / férié) — **écart à Cong = constat publié, jamais vert/rouge** (C-3) ; artefact complet = D9 non committé (`F:\tmp\bell-course\`, sha consigné) ; **série réduite committée** (une session par régime, ≈ 150 lignes) sous `apps/bell/test/fixtures/series/` **exclue R-25** : racine ajoutée à `SERIES_EXCLUDED_ROOTS` + 3 pathspecs `ci.yml` + PROVENANCE same-dir (ADR-EC C-11 ii ; `halts-reduced.csv` reste compté) ; **`no_secret_in_repo` étendu au motif UUID Helius** (`[0-9a-f]{8}-…` en contexte `api-key=`) ; amendements ADR-B0 (C-11 iii) : O-3 conflation Ondo datée, O-5 scission datée, O-6 sondes ; **rapport `docs/MESURE-FONDATRICE-bell-2026-09.md`** (chiffres avec unité, n par régime, comparaison Cong colonne par colonne, [lu]/[2nd]) | course → série réduite + rapport ; T-3 consomme la série pour calibrer | `series_pinned_are_declared_and_hashed` (racine Bell) ; `bell_course_reduced_series_replays` (recompute g_t sur la série réduite = valeurs épinglées) ; mutant : un octet de la série ⇒ rouge | ≈ 500 l. hors série exclue |

**D2 — Ce que la course n'affirme pas** : aucune couverture, aucune probabilité, aucun « le token suit » ; la comparaison à Cong est descriptive (leurs heures ≠ nos sessions, leur top-100 ≠ nos 4 pools) ; la population TSV (post-ordre SEC) ≠ population xStocks — dit dans le rapport.

**D3 — Coût** : Helius Developer inclus (49 $/mois déjà payé) ; estimation ≤ 100 000 crédits pour la course (≈ 4 pools × ≤ 2 500 pages × 10 crédits) — mesuré au spike avant lancement ; autoscaling reste off ; si > 1 M crédits, arrêt et rapport.

**D4 — Séquence** : -a maintenant (worktree neuf, parallèle aux lots E et U-1a-hard, fichiers disjoints : `apps/bell/**` + `test/no-secret-in-repo.test.ts` partagé avec K-1 plus tard) ; -b après G7 de -a. Aucun site, aucun registre : Bell reste `upcoming` (CA-11) ; T-1b (VPS, clé, `/bell/`, liste blanche d'export = T2) suit.


## Corrections checkpoint-1 (2026-09-19) — pliées, font foi sur D1
- **C-1 quorum archival (mesuré par le validateur)** : `api.mainnet-beta.solana.com` sert des corps `getTransaction` de juin 2025 (bloc 350 000 000) ⇒ **second archival réel** ; `solana-rpc.publicnode.com` ne sert aucun corps ancien (« first available block 447832277 ») ⇒ **retiré du quorum**. Liste = **Helius + mainnet-beta**. Politique de quorum archival déclarée : (1) **concordance de l'ensemble des signatures** par pool et fenêtre (sha du jeu trié, motif `logsKey`) — plein, ≈ 400 pages/pool ; (2) **corps** : plein sur mainnet-beta si le runtime mesuré au spike le permet (≈ 3 244 tx/j × 4 pools × 123 j ≈ 1,6 M corps à 2-5 req/s = 4-9 jours), sinon **échantillonné** avec résidu nommé `quorum_sampled` et **taux de couverture publié dans la statistique fondatrice** ; une lecture Helius seule sans ce résidu = `no_quorum`. Le spike -b refait la sonde sur une **signature de pool** de juillet 2025 et l'épingle en provenance O-6 (slot, préfixe de signature, `blockTime`, endpoint).
- **C-2 `quorum2` non exporté** (closure de `makeUkemiPool`, fichier du lot U-1a-hard) : choix orchestrateur **(b)** — `apps/bell/src/quorum.ts` (Solana), calque déclaré du motif, important seulement `providerOf` de `apps/sentinel/src/rpc.ts` ; test `bell_no_quorum_on_single_provider` ; la jambe Ethereum importe `makeUkemiPool.getLogsRange` tel quel. Aucun fichier d'U-1a-hard touché.
- **C-3 fait (iv) falsifiable** : par token, **source PoR nommée** (feed/adresse/chaîne/méthode lue première main) ou résidu nommé `por_unavailable` ; « taux des wrappers » = contrats nommés ou résidu `no_wrapper` ; TSLAon (API Ondo 403) = abstention déclarée.
- **C-4 Token-2022 (mesuré)** : `getAccountInfo(jsonParsed)` du mint TSLAx expose `scaledUiAmountConfig{multiplier:"1", newMultiplier:"1", newMultiplierEffectiveTimestamp:0}`, `supply` (= `getTokenSupply.amount`), `pausableConfig{paused:false}`, `permanentDelegate` ⇒ lecture **RPC plain** (1 crédit, quorum-able), pas DAS ; supply vs PoR = `supply` brut × multiplicateur, unité dite ; VWAP fondatrice par unité brute ⇒ hypothèse « multiplicateur constant jul.-oct. 2025 » **déclarée et vérifiée** (historique `UpdateMultiplier` du mint) ou déclarée non vérifiée. **Items formés** : `pausableConfig.paused` = témoin on-chain type halt (cond. H) → T-1b (timeline) ; `permanentDelegate` = fait de parité → T-2.
- **C-5 série réduite** : CI recompute **VWAP bit-identique depuis les fills** (signature, `blockTime`, deltas), le hash de chaîne, et `exceeds` 1/2/5 % depuis le **g_t épinglé** ; **aucun champ close-like** dans la série (mutant D5 `CLOSE_KEY` appliqué au fichier de série) ; la preuve de g_t vit dans l'artefact D9 hors dépôt (close lu en direct, sha consigné). Test renommé `bell_course_reduced_series_replays_vwap_and_chain`.
- **C-6 ADV** : **ratio seul** publié, ADV jamais verbatim (application conservatrice d'ESC-1 (c)) ; garde `CLOSE_KEY` étendue (`adv|share_volume|volume_ref`) + mutant. **Amendement 2026-09-19 (G7, checkpoint-2 T-1a-ii-a C-6 dérivabilité)** : ESC-1 (c) accepte la recomposition et ne protège que le verbatim ; `vol_ratio` à 10 décimales rend l'ADV recouvrable **moins précisément** que le close déjà admis ⇒ conforme a fortiori ; consigné, pas de changement de code.
- **C-7 oracles de (iii)** : tueur du ratio — ADV changé ⇒ ratio ≠ ; unité actions vs tokens ⇒ `multiplier_unit` ; `bell_volume_dedup_by_signature` (déjà committé) n'est pas recompté comme preuve nouvelle.
- **C-8 colonnes Cong** : seuils **1 / 2 / 5 %** (`gap.ts` `exceeds`).
- **C-9 résidus** : carte fermée = **union** des résidus T-1a-i déjà committés (`resume_time_missing`, `reason_unknown`, `no_fill_in_window`, `block_ts_vs_submission`) et des nouveaux `{no_close_ref, por_unavailable, por_stale, no_wrapper, multiplier_unit, no_quorum, quorum_sampled}` (`volume_zero` retiré = `no_fill_in_window`) — une seule source runtime, un seul enum, test d'égalité ; test **`bell_abstentions_counted`** (compteurs par résidu dans `state.json`, mutant : compteur figé ⇒ rouge) — D8.
- **C-10 fuite de clé (MAST)** : provenance et erreurs ne portent que `providerOf(url)` — jamais l'URL (`record.ts:22,58-60` et `NoQuorumError` de `rpc2.ts:136` replient l'URL : **ne pas reproduire ce motif**) ; test nommé **`bell_journal_and_provenance_carry_no_key`** (journal structuré + provenance émis par le collecteur sur fixture : aucun motif UUID en contexte `api-key=`, aucune URL brute) + mutant « URL brute dans un message d'erreur ⇒ rouge » ; mutant du test racine `no_secret_in_repo` étendu : planter un UUID en contexte ⇒ rouge.
- **C-11 terminaison prématurée** : si la profondeur Helius d'un pool < 2025-07-01 ⇒ bornes réduites **par pool** déclarées, n par régime publié, jamais une course partielle présentée complète.
- **C-12 items (g)** : **census xStocks** (839, indépendant de PR-B-ONDO) porté par **-b** (Polygon `v3/reference/tickers` + registre Backed) ; census Ondo (PR-B-ONDO) et **flux MWCB (PR-B-8)** = procurements investisseur, re-formés par amendement daté d'ADR-B0 dans -b — bloquants release Bell (décision 19/21).
- **C-13 CGU Helius** (`helius.dev/terms`) : lus **avant** que -b committe des fixtures dérivées ; consignés dans la PROVENANCE same-dir (E-2 si interdiction).
- **C-14 exclusion R-25** : la pièce `SERIES_EXCLUDED_ROOTS` + 3 pathspecs `ci.yml` + PROVENANCE same-dir passe au **premier lot qui committe une série réelle = -a**, sur le sous-dossier **`apps/bell/test/fixtures/series/`** (jamais la racine, V-6 : `halts-reduced.csv` reste compté). Seam pré-déclaré : si -a dépasse 1 205, la **jambe Ethereum → lot -a2**.
- **P2 régimes (code fait foi, `sessions.ts:34-35`)** : régimes = `{overnight-weekday, weekend, holiday}` ; `pre`/`after` = sessions à part (`regime: null`), rapportées, non comparées à Cong ; ancre = dernier jour de bourse.
- **CA-11 état** : sorties du collecteur **réellement hors dépôt** — `F:\tmp\bell-out\state.json` + `timeline.jsonl` (calque D9 `F:\tmp\bell-course\`), chemin fourni par paramètre CLI `--out` (défaut hors arbre, jamais `apps/bell/out`) ; aucun fichier de sortie sous l'arbre git, rien à `.gitignore`r ; `no_secret_in_repo` marche l'arbre de travail seul. Jusqu'à T-1b.
- **E-1 / E-2 (escalades conditionnelles, investisseur)** : E-1 si le quorum plein ne tient pas sur mainnet-beta et l'échantillonnage est jugé insuffisant (second archival payant — **acquis en principe par la décision investisseur 38 du 2026-09-19**, verbatim « on va trouver un RPC qu on va payer si non ; en plus de helius » ; montant et fournisseur à valider, cf. `RESSOURCES-RPC-CANDIDATS-2026-09-19.md`) ; E-2 si les CGU Helius interdisent les fixtures dérivées (série hors dépôt ?).

## Modes MAST et contre-mesures
| Mode | Contre-mesure |
|---|---|
| Lecture Helius seule prise pour vraie | quorum ≥ 2 fournisseurs distincts, `no_quorum` sinon (ADR-U1 D3 réutilisé) |
| Clé Helius dans un artefact/log/fixture | `no_secret_in_repo` étendu (motif UUID en contexte), artefacts D9 hors dépôt, URL sans clé dans les fixtures de spike |
| Close Polygon republié (licence) | mutant « champ `close` numérique ⇒ rouge » (ADR-B0 D5) ; seule g_t publiée |
| « Sous le plafond » / « suit le sous-jacent » (surclaim) | vocab scope `bell` ; phrases fermées ; constat ≠ verdict |
| Fixture auto-enregistrée (rejeu circulaire) | recompute indépendant à la G2 (canonicaliseur séparé), série réduite tirée de la course, pas l'inverse |
| Générateur = relecteur | worker ≠ G2 ≠ validateur ; pliages de code par worker |

## Points à trancher (checkpoint-1)
- (P1) Découpe -a/-b et estimations R-25 — validateur.
- (P2) **Tranché, voir « P2 régimes » dans les corrections** — régimes = `{overnight-weekday, weekend, holiday}` ; pre/after = sessions rapportées, non comparées. avec calendrier férié NYSE committé (T-1a-i : constante) — confirmer la liste et l'ancre « dernier close consolidé » (ADR-B0 D2 i).
- (P3) Décision investisseur non requise (aucune surface publique, aucune dépense nouvelle, décisions 1-3/10/21 couvrent) — le validateur confirme ou escalade.

## Amendement D1-bis — 2026-09-19 (checkpoint-1 lot -b, C-1 ; décisions investisseur 38, 40, 41, 44, 45)
Le lot -b est découpé en **quatre sous-lots séquentiels** (un worker à la fois, un worktree neuf chacun) : **-b1** course fondatrice Solana (spike Helius + Chainstack, fenêtre **2025-07-01 → 2025-10-31 épinglée** pour la réplication Cong Table 4, pools nés après = depuis le premier fill, borne déclarée par pool ; close **par ancre** via Massive `range/1/day` ; budget fail-closed ; gate C-4 par pool-fenêtre ou résidu `rebase_unverified`) ; **-b3** corporate actions (rebases/multiplicateurs xStocks, Coinbase, Ondo NAV) + fichier séance (horaires NY, halts par titre, niveaux MWCB) ; **-b2a** décodeurs DEX (Uniswap V3, PancakeSwap V3, Aerodrome ; Raydium/Meteora/Orca) + registre par pool (`baseIndex`, décimales, quote, `chainId`, sha census) + fixtures hors ligne ; **-b2b** course EVM (Robinhood Chain, BSC, Base, Ethereum) fenêtre **premier fill → 2026-09-15** + rapport. **Fenêtre par chaîne** (décision 44) avec filtres utilisateur en T-1b ; **couverture** (décision 45) : population entière du census si projection au spike ≤ 5 M crédits Helius ET ≤ 10 M RU Chainstack ET ≤ 7 jours, sinon top 20 par chaîne avec part du volume 24 h couverte publiée ; item d'extension Solana 2025-11 → 2026-09. Quorum : Helius + Chainstack (Solana) ; Chainstack + keyless par `chainId` (EVM), carte domaine → opérateur committée. Clôture cash : Massive Starter interne (décision 41), `close_source` en provenance, aucun close dans la série ni le rapport ; bascule de licence avant toute publication (item C-8). Seule la jambe Solana 2025 est comparable à Cong ; les autres chaînes = constat par régime avec période déclarée. Cadre : `docs/G0-lot-t1a-ii-b.md` + amendement checkpoint-1 C-1..C-15.

## Tuyaux -b1 (C-12, worker 2026-09-20) — entrée / sortie / état / test
- **Entrée (qui produit)** : RPC **Helius + Chainstack** en quorum par OPÉRATEUR (`operatorOf`, C-9 ; Chainstack
  archive bloc 0 mesurée) ; `census-v3.csv` (sha `25db700e…`, `CENSUS_V3_SHA256`) ; close cash **Massive/Polygon**
  (`POLYGON_API_KEY`, `close_source: massive-starter-internal`, jamais republié ESC-1 c). Secrets lus du scope User
  dans le process, jamais loggés (`no_secret_in_repo` étendu C-10).
- **Sortie (qui consomme)** : (1) **spike mesures** `apps/bell/test/fixtures/series/spike/{spike-measures,spike-findings}.json`
  + `PROVENANCE-spike.md` → consommées par l'escalade `docs/PLI-lot-t1a-ii-b1.md` et l'amendement O-6 d'ADR-B0 ;
  (2) collecteur `collect()` → `state.json`/`timeline.jsonl`/`journal.json`/`provenance.json` (D9 hors dépôt) →
  `bell-report.mjs` (agrégat Table 4 par régime) → `docs/MESURE-FONDATRICE-bell-2026-09.md` → T-3. **La chaîne (2)
  est BLOQUÉE** sur la CONSULTATION (pools fondateurs découverts vs escalade) : aucune course lancée.
- **État (où il vit)** : réponses RPC brutes **hors dépôt** sha-pinnées (`F:\tmp\bell-b1\spike`, archivées
  `F:\PRODUITS\etude-2026-09-19\bell-b1-spike`) ; mesures + séries réduites (à venir) committées sous
  `apps/bell/test/fixtures/series/` (exclues R-25). **État public : `upcoming`** (CA-11 ; aucune surface servie —
  Bell n'est « built » qu'à T-1b : règle de branchement). Le code -b1 (operators, corrections collect, gate rebase,
  report) est aujourd'hui consommé par des **tests** (oracle non-LLM) + un smoke live, pas par un chemin servi ⇒ reste `upcoming`.
- **Test** : 45 tests bell au gel `2ac2e25` — **49 après pli G2 -b1-2** (48 bell + 1 racine `no_secret_in_repo`) (+4 : C-G2-1/3/5 sur `collect.test.ts`,
  C-G2-4 sur `report.test.ts`) (`bell.test.ts`+`collect.test.ts`+`report.test.ts`) ; racine `no_secret_in_repo`
  (5 motifs C-10 + mutant), `series_pinned_are_declared_and_hashed` (spike files, dont `spike-poc-discovery.json`) ;
  smoke live (budget-stop exit 1 verbatim ; quorum 2 opérateurs ; aucune url/clé/uuid en sortie). Mutants ≥ 8 (voir PLI).

## Amendement D1-ter — 2026-09-20 (décision investisseur 47, variante SPLIT ; pli G2 -b1-2)
**Décision 47 (verbatim « A », option (a) en variante SPLIT).** Le registre fondateur Solana = les **pools 2025
découverts on-chain** (champ `founding_pool` distinct du `pairAddress` census v3), PAS les pools census (nés en
2026, 0 tx in-window ; NVDAx 8 tx — mesuré -b1). Les xStocks portant un multiplicateur mutable dont l'état 2025
est illisible hors ligne, la **g_t fondatrice est déplacée APRÈS -b3** :
- **-b1** (gel `2ac2e25`, ce lot) = corrections + spike + découverte (PoC) + décomptes in-window + **abstention
  nommée** (`rebase_unverified`). AUCUNE g_t fondatrice produite ni committée.
- **-b3** = corporate actions + reconstruction de la trajectoire `SetMultiplier`/effTs (rebase-aware).
- **-b1-bis** (NOUVEAU sous-lot, APRÈS -b3) = découverte des pools 2025 + registre fondateur + **course
  rebase-aware** consommant la trajectoire de -b3.
**Ordre (décision 47)** : `-b1 → -b3 → -b1-bis → -b2a → -b2b`. La variante **FUSION** (-b1+-b3 en un seul lot) est
**écartée** (viole C-2 : séquence stricte, un worker / un worktree par sous-lot) ; la variante **SPLIT** ci-dessus
est retenue (avis G2 §6). Fenêtre Cong 2025-07→10 conservée. Décisions 40/44/45 amendées (CHANTIERS.md décision 47).

## Tuyaux -b1-bis (C-12) — entrée / sortie / état / test
- **Entrée** : mints xStocks (Helius gTfA `full`, fenêtre) → tally des comptes → vaults fondateurs 2025 ; la
  trajectoire `SetMultiplier`/effTs produite par **-b3** ; close Massive par ancre.
- **Sortie** : registre fondateur (`founding_pool` ≠ `pairAddress`) → `collect()` rebase-aware → série réduite +
  `bell-report.mjs` → `docs/MESURE-FONDATRICE-bell-2026-09.md` (g_t fondatrice, enfin calculable).
- **État** : bruts hors dépôt sha-pinnés ; `upcoming` (CA-11) jusqu'à T-1b. La fonction de planification
  `apps/bell/src/coverage.ts` (`coverageDecision`, C-5 / décision 45) est aujourd'hui consommée par des **tests
  seuls** ⇒ `upcoming` ; son consommateur servi est la décision de couverture de -b1-bis (règle de branchement).
- **Test** (à former au G0 -b1-bis) : découverte reproductible (mint → vault, sha du raw épinglé — item C-G2-6) ;
  g_t rebase-aware inchangée sur multiplicateur constant, abstention sinon.

## Corrections G2 (pli -b1-2, 2026-09-20, worker `claude-opus-4-8[1m]`) — origine + déclencheur
- **C-G2-1** (BLOQUANT, `error_origin` rédacteur -b1) — fail-open C-6 en câblage LIVE corrigé dans `main()` : un
  mint absent (quorum `getAccountInfo` échoué) ⇒ `rebaseForMint(mint)` = `rebase_unverified` (abstention), jamais
  une g_t au multiplicateur défaut « 1 ». `collect()` INCHANGÉ (rebase absent = mode rejeu ⇒ oracle bit-identique
  vert). Preuve : repro `F:/tmp/bell-b1-2/repro-A(-after).mts` (avant g_t=-0.5753641449 ; après abstention, vwap
  porté) ; test `bell_mint_read_failure_abstains_fail_closed` ; mutant rouge.
- **C-G2-2** (`error_origin` rédacteur -b1) — effTs à signe inversé corrigé (`supply.ts`, `PROVENANCE-spike.md`:66,
  `PLI`:81) : les effTs sont ÉCHUS au 2026-09-20 (past-dated), pas « futur / pending ».
- **C-G2-3** — `readMintToken2022` fail-closed (multiplicateur STORED conservé ; « effectif = newMultiplier si
  effTs échu » = spec SPL Token-2022 ScaledUiAmount, illisible hors ligne). **Procurement PR-B-SPL-TOKEN2022**
  (ci-dessous). Non bloquant -b1 (gate mutable ⇒ unverified ; supply non rendu ; `multiplier_unit` identique quel
  que soit le champ effectif — `multiplier != 1 ⇔ newMultiplier != 1` sur les 4 mints mesurés).
- **C-G2-4** — garde close niveau rapport (`assertNoCloseLike` dans `bell-report.mjs`, duplication DÉCLARÉE de
  `digest.ts` CLOSE_KEY — un `.mjs` lancé par `node` ne peut importer un `.ts`) + test `bell_report_input_close_guard`
  + mutant ; défense en profondeur (le digest est déjà `assertNoClose`-gardé en amont).
- **C-G2-5** — dette C-5 levée : `coverage.ts` `coverageDecision` (décision 45) livrée en fonction pure testée
  (`bell_c5_coverage_projection_over_threshold_top20`) : > seuil ⇒ top20 + part de volume 24 h publiée ; non
  computable ⇒ abstention nommée `projection_not_computable`. **Plancher** computable (PAS plafond) via les mints :
  ≥ 8000 sigs in-window × 4 mints (capé ; total exact = énumération non capée à -b1-bis).
- **C-G2-6** — PoC de découverte recordée `spike-poc-discovery.json` (raw non retenu ⇒ `raw_sha256: null`, valeurs
  = run first-hand -b1 non conservé) + item formé (re-mesure au go -b1-bis : raw sous nom unique + sha + compte
  exact + adresse vault complète).
- **C-G2-7** (item -b2, déclencheur **-b2b**) — `--max-calls` couvre la jambe Solana mais PAS la jambe ETH
  (`liveEthSwaps`) ni Massive (`closeAndAdv`) ⇒ la course EVM `getLogs` doit passer par le budget fail-closed (RU
  Chainstack). Propriétaire : worker -b2b.
- **C-G2-8** (mineur) — hypothèse « autorité null MAINTENANT = null en 2025 » énoncée dans le docstring de
  `rebaseGateFromMint` avec la clause **« sauf découverte contraire »** (déférée à la reconstruction -b3).

## Procurement PR-B-SPL-TOKEN2022 (C-G2-3, doc 03 — demande formée, zéro dette nue)
- **Quoi lire** : la règle du multiplicateur EFFECTIF de l'extension SPL Token-2022 **ScaledUiAmount** — laquelle
  de `multiplier` / `newMultiplier` s'applique selon `newMultiplierEffectiveTimestamp` vs `now`. Sources : (1)
  programme Rust `solana-program-library` `token/program-2022/src/extension/scaled_ui_amount/` (sélection du
  multiplicateur par timestamp) ; ET/OU (2) JS `@solana/spl-token`, chemin scaled-UI de `amountToUiAmount` ; ET/OU
  (3) doc `spl.solana.com/token-2022/extensions` section ScaledUiAmount.
- **Version** : à épingler au procurement (dernière `@solana/spl-token` publiée) — non devinée ici.
- **Tentatives d'acquisition** : `@solana/spl-token` **absent de `node_modules` ET 0 occurrence dans
  `package-lock.json`** (vérifié first-hand 2026-09-20) ; session **offline** (ni `npm install` ni fetch autorisés)
  ⇒ non lisible ici.
- **Usage prévu** : figer la règle du multiplicateur effectif dans `readMintToken2022` (ou documenter pourquoi le
  champ brut est conservé) **avant tout rendu `supply × multiplier`**. Déclencheur : -b3 (rebase-aware) au plus tard.
- **Propriétaire** : orchestrateur → mainteneur (procurement).

## Amendement D1-quater — 2026-09-20 (lot -b3a, worker `claude-opus-4-8[1m]` effort max ; G0 `docs/G0-lot-t1a-ii-b3.md` + checkpoint-1 C-1..C-12 pliées)
**Objet** : rendre `multiplier(mint,t)` calculable par rejeu chronologique des instructions Token-2022
ScaledUiAmount (43/0 Initialize, 43/1 UpdateMultiplier) depuis l'Initialize du mint ; étendre le gate rebase à
**3 états** ; rendre `g_t` **rebase-aware** (fixtures). Aucune course fondatrice (décision 47). Sources [lu] :
`docs/biblio/bell/L-lecture-spl-token2022-scaled-ui-amount-2026-09-20.md` + relecture first-hand du code
`solana-program/token-2022@714a2ce6` (worker, 2026-09-20).

### Faits [lu] qui fixent le rejeu (code cité ligne à ligne — R-21)
- `program/src/extension/scaled_ui_amount/processor.rs` : **`process_initialize`** (l.24-35) pose
  `multiplier = *multiplier` (l.32), `new_multiplier_effective_timestamp = 0` (l.33), `new_multiplier =
  *multiplier` (l.34) ⇒ triplet initial `(m0, m0, 0)`. **`process_update_multiplier`** (l.37-66) :
  `new_multiplier = *new_multiplier` (l.55, **écrasement inconditionnel**), `effTs = max(effective_timestamp, 0)`
  (l.57-60), et `if clock.unix_timestamp >= int_effective_timestamp` (l.64) ⇒ `multiplier = *new_multiplier`
  (l.65, repli immédiat).
- `instruction.rs` : **compte 0 = le mint** (Initialize l.24 ; UpdateMultiplier l.39-42), compte 1 = l'autorité
  (l.40) — c'est le filtre anti-contamination C-2 (l'autorité partagée `S7vYFF…` peut grouper plusieurs xStocks
  dans une même tx). Layouts (piège F-8, deux décodeurs) : `UpdateMultiplierInstructionData` = `multiplier` PodF64
  puis `effective_timestamp` UnixTimestamp (l.66-71) ⇒ 18 octets `[43][1][f64 LE 8][i64 LE 8]` ;
  `InitializeInstructionData` = `authority` OptionalNonZeroPubkey puis `multiplier` PodF64 (l.56-61) ⇒ 42 octets.
- `mod.rs` : règle de lecture `current_multiplier(t) = new_multiplier si t >= effTs sinon multiplier`
  (comparaison **large `>=`**, F-3) ; état persistant `ScaledUiAmountConfig` = `authority(32)·multiplier(f64 LE)·
  effTs(i64 LE)·new_multiplier(f64 LE)` (56 octets, **ordre distinct** de l'instruction).
- f64 IEEE-754 non round-trip décimal (F-4) : le multiplicateur voyage en **8 octets LE (hex)** ; l'égalité
  (`constant`, oracle C-3) se décide **sur les bits**, jamais sur le décimal.

### C-1 (`constant` sur la trajectoire, pas « 0 événement in-window »)
`constant` ⇔ `m(t)` identique (bits) à **chaque breakpoint** de `[from,to]` = {bornes} ∪ {blockTimes d'événements
in-window} ∪ {effTs in-window}, évalué par rejeu **depuis l'Initialize**. Un `UpdateMultiplier` pré-fenêtre à
effTs in-window, ou un spike-and-revert (deux effTs in-window, `overwritten_pending=0`, bornes égales), change
`m(t)` sans instruction in-window ⇒ refusé (test `bell_rebase_constant_needs_trajectory`, mutant « drop effTs
breakpoint » rouge). Le raccourci C-G2-8 (« autorité null maintenant = null en 2025 ») est **CLOS** : le readout
courant seul n'établit jamais `constant` (`rebaseGateFromMint` renvoie toujours `rebase_unverified`).
`overwritten_pending > 0` (piège F-2) ⇒ `rebase_unverified` fail-closed.

### C-7 (direction de `g_t` — convention d'unités écrite, formule G0 inversée corrigée)
`ui_amount = raw × m` et `volume.ts:47` `shares = tokens × m` ⇒ **une unité brute vaut `m` actions**. Donc prix
par action = `VWAP_raw / m`, appliqué **par fill** : `VWAP_share = Σ|q| / Σ(|b|·m(tᵢ))`, `g_t = ln(VWAP_share /
P_close)`. La formule du G0 (`VWAP × m`) était **inversée** (biais `2·ln(m)` ≈ +0,8 % sur SPYx) — corrigée. Le
`vwap` publié reste le ratio brut first-hand (recomputable) ; `multiplierUsed` est publié par session.
**Citation « O-8 » corrigée** : O-8 = tueur `vol_ratio` sous multiplicateur (CHECKPOINT2 -a), PAS « multiplicateur
avant VWAP ».

### Défaut trouvé — `error_origin` = rédacteur -b1 (pas -b3a)
`collect()` calculait `g_t` sur la VWAP **brute** pour un gate `constant` de multiplicateur ≠ 1 (biais `ln(m)`).
Jamais exercé à -b1 (aucun xStock immuable ; tous partagent `S7vYFF…` ⇒ `rebase_unverified`). Corrigé ici :
`constant m≠"1"` prend le chemin rebase-aware (÷ m) ; `constant m=="1"` et « pas de gate » gardent le chemin
bigint inchangé (digests m=1 bit-identiques à -b1). Test `bell_gt_constant_m_neq_1_defect`.

### Tuyaux -b3a (entrée / sortie / état / test)
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test |
|---|---|---|---|---|
| scan → trajectoire | course d'autorité `S7vYFF…` (gTfA Helius + relecture quorum-2 Chainstack), bruts hors dépôt sha-pinnés | décodeurs 43/x + `replayTriplet` (events + oracle d'état C-3) | course FAITE (décision 60) ; 4 séries sha-pinnées `test/fixtures/series/rebase/`, rejouées bit-à-bit hors ligne ; consommateur servi = -b1-bis ⇒ **upcoming** | `bell_rebase_course_replays_bit_identical`, `bell_rebase_scan_state_divergence_is_unverified` |
| trajectoire → gate | `MultiplierEvent[]` | `rebaseGateFromTrajectory` (3 états ; `scanMethod="authority"` ⇒ résiduels nommés) | branché (offline) | `bell_rebase_gate_three_states`, `bell_rebase_authority_residuals_named_and_gated` |
| gate → g_t | `RebaseGate` (events) | `collect()` → `sessionGapRebase` (÷ m par fill) + `multiplierUsed` | **flag `--rebase-trajectory` consommé ; producteur in-repo ABSENT ; composition non rejouée** (checkpoint-2 C-V-1 : aucun producteur n'émet la forme `{symbol:{events,scanComplete}}` — `runRebaseScanCli` s'arrête au probe, séries committées en `scan_complete` snake_case ; `loadTrajectories` sans appelant de test ; `buildSolanaSymbol` testé seulement avec `trajectory=undefined` ; `collect.test.ts:494-498` = regex sur le source, pas une exécution) ⇒ **item formé** : producteur + test d'intégration non-LLM exécutant la composition depuis un fichier de trajectoire ; déclencheur G0 -b1-bis avant toute g_t fondatrice ; propriétaire orchestrateur | `bell_gt_trajectory_known_integration`, `bell_symbol_build_mint_quorum_fail_unverified` (C-V-3) |
| gate.residuals → compteur résiduel / state.json | `RebaseGate.residuals` (trajectory_known) | — | **ABSENT** : `collect()` ne compte pas les résiduels du gate (la granularité mint vs séance n'est pas spécifiée) ⇒ **item formé** (déclencheur -b1-bis, propriétaire orchestrateur) | émission couverte par `bell_rebase_authority_residuals_named_and_gated` |
| g_t → course | — | -b1-bis (course rebase-aware) | item formé | G0 -b1-bis |

Branchement (règle KACIMI 2026-09-19, CA-11) : `rebase-trajectory.ts` → `supply.ts` (`rebaseGateFromTrajectory`)
→ `collect.ts` `buildSolanaSymbol`/`main()` (flag `--rebase-trajectory` consommé) ; **consommateur servi = -b1-bis**
(course), non encore réel ⇒ état **`upcoming`**. Bell reste **absent** de `fleet.ts`/README/site/skills (vérifié).
Le seul consommateur actuel = tests non-LLM + le smoke live ⇒ jamais « built ».

### Sonde (first-hand, quorum-2 helius+chainstack, bruts hors dépôt `F:\PRODUITS\etude-2026-09-20\bell-b3a-raws\`)
Voir `docs/PLI-lot-t1a-ii-b3a.md` (mesures, sha, budget). Le gate `--rebase-scan` s'arrête AVANT les corps
(méthode deux étages C-4) : le **coût crédit/appel de `getTransactionsForAddress` est NON TROUVÉ** dans la doc
Helius (RESSOURCES-HELIUS l.12) ⇒ **C-V-2 = mesure Usage dashboard, propriétaire orchestrateur** = prérequis des
corps. La course de trajectoire (L-5) et l'extension rapport `bell-report.mjs --rebase` sont **différées**
(consultation formée, non un contournement).

### Méthode hybride — scan de l'autorité (DÉCISION ORCHESTRATEUR 60, 2026-09-20, `docs/CHANTIERS.md` l.122 [lu] ; pli -b3a-3)
La méthode mandatée (décision 55 : corps **full-mint** via `getTransactionsForAddress`) est **réfutée par mesure** :
débits 55 k–627 k signatures/jour par mint ⇒ **~5,34 M crédits Helius** projetés (SPYx seul ~2,92 M), > plafond 1 M
(décision 56) — chiffre de la décision 60 l.122 [lu] ; le tableau par mint de l'annexe -b3a-2 en donne la ventilation
(~5,4 M au total, même ordre de grandeur). `error_origin` orchestrateur (décision 55 fondée sur la sonde -b1 capée à
8 pages). `getTransactionsForAddress` n'offre **aucun filtre programme/instruction serveur-side** ⇒ tirer tous les
corps du mint est requis pour trouver les 43/x ⇒ infaisable sous plafond.
**Option 1 ratifiée — scan de l'AUTORITÉ de mise à jour partagée `S7vYFF…`** (`066f5922…45e3`) : les 43/0 Initialize
et **tous** les 43/1 UpdateMultiplier des 4 mints sont émis par cette autorité. Énumérer l'autorité (164 239
signatures, gTfA `full` ~166 pages ≈ **1 825 crédits** projetés, ~2 900× moins cher que full-mint), décoder les 43/x
par mint, relire chaque candidat quorum-2 (Helius + Chainstack, clé = événement décodé).
**Précondition d'invariance d'autorité** (le socle de complétude) : `Initialize.authority == oracle.authority ==
S7vYFF` (asserté par mint dans `bell_rebase_course_replays_bit_identical`). `processor.rs` (l.44-53) exige la
**signature de l'autorité courante** pour un UpdateMultiplier ⇒ seule `S7vYFF` a pu en émettre un ⇒ le scan
d'autorité les capture tous. Backstop : **oracle d'état final C-3 bit-à-bit** (le triplet rejoué == le
`ScaledUiAmountConfig` lu quorum-2 au slot pinné).
**Résiduels nommés** (symétriques, publiés **dans** le gate `trajectory_known` — jamais accordé sans eux) :
`authority_scan_mono_operator` (l'énumération gTfA est **Helius seul** — pas d'équivalent Chainstack ; une omission
Helius qui changerait l'état final est attrapée par C-3, une qui ne le changerait pas ne l'est pas) et
`set_authority_unscanned` (l'historique `SetAuthority` du mint n'est pas scanné, C-12 : un changement d'autorité
A→B→A avec updates B-signés qui s'annulent est la faille résiduelle côté signataire). Ajoutés à l'enum fermé
`residuals.ts` ; émis par `rebaseGateFromTrajectory(…, scanMethod="authority")`.
**Résultats de la course** (4/4, first-hand ; hors dépôt `course/series-*.json`, copiés sha-pinnés sous
`test/fixtures/series/rebase/`) : TSLAx `constant` (1 événement, m = 1, **aucun résiduel** — les deux résiduels sont
scopés à `trajectory_known`) ; SPYx 9, NVDAx 11, AAPLx 11 événements, `trajectory_known`, `overwritten_pending = 0`,
C-3 OK ; premier update **dans** la fenêtre Cong (AAPLx 2025-08-14, NVDAx 2025-10-02, SPYx 2025-10-31 23:55Z) ⇒ 3/4
mints non `constant` en fenêtre (g_t = VWAP_raw / m requis, incréments ≤ ~0,3 %). **Coût réel : ~6 323 crédits Helius,
4 042 appels Chainstack** (inclut l'exploration `shape`/`verify-oldest`/`verify-gtfa-config`) — largement sous
plafonds ; **aucun scan full-mint corps lancé**. Ratification **investisseur** due au retour (décision 60).

### Items formés (déclencheurs + propriétaires ; zéro dette nue)
- **E-1** (date d'activation ScaledUiAmount) — **CLOS par argument** : le rejeu part de l'`Initialize` (43/0) du
  mint ; la date d'activation du feature-gate n'est pas requise (le premier événement du mint borne la trajectoire).
- **E-3** (commit du client JS `@solana/spl-token`) — **CLOS par argument** : Bell écrit ses **propres** décodeurs
  (18/42/56 octets, testés sur vecteurs binaires à la main) ; aucune vendorisation.
- **E-2** (Chainstack `getAccountInfo` à slot passé) — déclencheur : divergence de l'oracle d'état final C-3 OU
  besoin d'un contrôle croisé rétrospectif ; propriétaire orchestrateur.
- **E-4** (palier Alchemy account-archive) — déclencheur : idem E-2 ; propriétaire orchestrateur.
- **E-5** (`try_validate_multiplier` bornes) — déclencheur : un multiplicateur décodé hors bornes plausibles ;
  propriétaire orchestrateur. Non bloquant.
- **E-6** (correctif PR #522 « not live yet » au 2026-09-20) — déclencheur : toute extension de la trajectoire
  rejouée au-delà de la date/slot d'activation du correctif ; borner la trajectoire à cette date, relire le
  processeur ; propriétaire orchestrateur.
- **E-7** (NOUVEAU) : le locateur TLV `scaledUiConfigBytes`/`locateScaledUiTlv` (base 82, `account_type`@165,
  TLV@166, type 25, valeur 56 octets) est **validé first-hand par la sonde** (oracle-slot pinné sur 3 mints réels,
  678 octets) ; déclencheur d'une relecture : un mint dont le layout TLV diffère (autre ordre d'extensions) ou un
  échec du locateur. Propriétaire orchestrateur.
- **C-V-2** (crédit/appel `getTransactionsForAddress`) — **prérequis des corps** ; propriétaire orchestrateur
  (Usage dashboard). Sans lui, la course L-5 ne démarre pas (budget écrit avant les corps, C-4). Contourné par la
  méthode hybride (scan d'autorité), qui tire ~166 pages gTfA au coût mesuré 10 cr/appel (décision 55/60).
- **Énumération d'autorité mono-opérateur** (`authority_scan_mono_operator`, décision 60) — gTfA n'a pas
  d'équivalent Chainstack ⇒ l'énumération de l'autorité est Helius seul ; backstop = oracle d'état final C-3 ;
  déclencheur : contrôle croisé de l'énumération sur un 2ᵉ archiveur gTfA si disponible ; propriétaire orchestrateur.
- **`SetAuthority` non scanné** (`set_authority_unscanned`, C-12, décision 60) — faille résiduelle de complétude
  côté signataire (A→B→A avec updates B-signés qui s'annulent) ; déclencheur : scan `SetAuthority` du mint ;
  propriétaire orchestrateur.
- **Débits mints** (55 k–627 k signatures/jour, mesurés décision 60) — fait pertinent pour tout scan full-mint
  futur (réfutation de la décision 55) ; propriétaire orchestrateur / worker -b1-bis.
- **`gate.residuals` non compté dans `state.json`** — `collect()` compte `rebase_unverified` par séance mais ne
  déverse pas les résiduels du gate `trajectory_known` (granularité mint vs séance non spécifiée) ⇒ l'émission est
  couverte par test mais non servie ; déclencheur : -b1-bis (course rebase-aware qui publie le gate) ;
  propriétaire orchestrateur. **Réserve `scanMethod` (côté ENTRÉE, C-G2 -b3a)** : servir ces résiduels exige AUSSI
  d'étendre `TrajectoryInput`/`loadTrajectories` (`collect.ts` l.421/453) pour PORTER `scanMethod`, et `buildSolanaSymbol`
  (l.442-444) pour le PASSER à `rebaseGateFromTrajectory` — l'appel actuel omet `scanMethod` ⇒ résiduels jamais émis en `main()` ; même déclencheur/propriétaire.
- **Fail-open C-3 sur le chemin servi (checkpoint-2 C-V-2, prouvé par harnais)** : `buildSolanaSymbol` (`collect.ts` l.442-444)
  avec un fichier de trajectoire contredisant l'état live du mint (rejeu m = 1,5 ; mint lu m = 1) et `scanComplete: true`
  rend `trajectory_known` — la lecture live du mint est un test de PRÉSENCE, jamais une comparaison `replayTriplet` vs état
  sur les bits ; la parenthèse « (the C-3 oracle anchor) » du commentaire de `collect.ts` est FAUSSE (édition du `.ts`
  différée à l'item, comptée R-25). Item formé, fusionné avec la réserve `scanMethod` ci-dessus : ancrer C-3 dans
  `buildSolanaSymbol` (état du mint base64 quorum-2, comparaison sur les bits, divergence ⇒ `rebase_unverified`) + porter
  `scanMethod` ; déclencheur : avant toute g_t -b1-bis ; propriétaire orchestrateur ; `error_origin` : rédacteur -b3a
  (câblage L-3/C-10).

### MAST (résiduel)
+ « rejeu circulaire » (contre-mesure : oracle d'état final C-3, `getAccountInfo` quorum-2 après scan, comparaison
sur bits ; `bell_rebase_scan_state_divergence_is_unverified` prouve qu'une divergence ⇒ `rebase_unverified`, jamais
un ajustement du rejeu) ; + « upgrade de programme » (E-6) ; **`SetAuthority` non scanné = résiduel NOMMÉ
`set_authority_unscanned`** (décision 60) : contrairement à la formulation initiale « sans effet », un changement
d'autorité A→B→A avec updates B-signés qui s'annulent est une faille résiduelle réelle côté signataire, désormais
listée dans le gate `trajectory_known` (jamais accordé sans elle), avec l'oracle C-3 pour backstop d'état final.

## Amendement D1-quinquies — 2026-09-20 (lot -b3b, worker `claude-opus-4-8[1m]` effort max ; G0 `docs/G0-lot-t1a-ii-b3b.md` + checkpoint-1 C-1..C-11 pliées ; PR-B-DBN `docs/biblio/bell/L-lecture-databento-api-2026-09-20.md` [lu])
Clôture cash publiable en écart dérivé (ESC-1 c) : **Databento EQUS.SUMMARY `ohlcv-1d`** (`close_source: "databento-equs-summary"`,
décision 53) **croisé** contre Massive/Polygon `range/1/day adjusted=false` sur **entier scalé 1e-9** (C-5, jamais la chaîne brute) ;
mismatch ⇒ résiduel nommé `cash_cross_mismatch` + séance abstenue (jamais moyenne) ; Massive indisponible ⇒ résiduel distinct
`cash_cross_unavailable` + publication (intérim Q3(ii) (a), `error_origin: orchestrateur` si renversée). Noms **hors** motif `CLOSE_KEY`
(C-1 mesuré : `close_*` numérique fait lever `assertNoClose`). `earliest_publish_utc` = 16 h 00 ET du jour de clôture de référence + 24 h
(C-6, fonction pure, **placé dans le digest haché par entrée `gT`**, option (a) déclarée) ; re-pin `PINNED_BELL_SHA` par **soustraction**
(retirer `earliest_publish_utc` des gaps + les 2 clés `cash_*` ⇒ `126abfae…` -b3a). `cash_request_digest` = sha256 de la liste canonique
des requêtes émises (ni clé ni valeur), en provenance. Delta de halt (fait ii) **rebranché** sur la jambe on-chain (jointure `Symbol`→`underlying`→token/chaîne,
un bracket par token/chaîne, jamais fusionné). Séance : croisement 2026 [lu] contre le calendrier primaire NYSE (C-8 ; 2025 = PR-B-CAL).
`no_secret_in_repo` étendu au motif clé Databento `db-`. Endpoint/auth/encodage confirmés first-hand (`metadata.get_cost` 200 + 4 `get_range`,
bruts sha-pinnés `F:\PRODUITS\etude-2026-09-20\bell-b3b-raws\`) : NDJSON, `close` = chaîne entier scalé 1e-9, `ts_event` sous `hd` = minuit UTC du bar, pas de champ `symbol` (⇒ une requête par symbole). MWCB = **PR-B-8** (procurement, bloquant release, aucune constante). Corporate actions non-rebase ⇒ **-b3c**.

### Tuyaux -b3b (entrée / sortie / état / test) — CA-11 : la composition est EXÉCUTÉE depuis l'artefact
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| close Databento → collect | `DatabentoGet` EQUS.SUMMARY `ohlcv-1d` (`runMain`) | `closeRefBySession` → `collect()` → digest / `state.json` | **upcoming** (consommateur servi = T-1b) | `bell_close_databento_replays_synthetic_fixture` |
| croisement Massive → résiduel | Databento vs Polygon `range/1/day` (entier scalé) | `cash_cross_mismatch` / `cash_cross_unavailable` (compteur + champ `cash_cross` par session) | **upcoming** | `bell_cash_cross_mismatch_is_a_named_residual` ; `bell_read_reference_closes_cross_matched_mismatch_unavailable` |
| halt CSV + fills → compteur/bracket | `haltRows` + fills on-chain (jointure `underlying`) | `haltDelta` résidus + `halt_deltas` (state) | **upcoming** | `bell_halt_delta_brackets_real_fills_integration` |
| sessions → calendrier primaire | `FULL_CLOSURES`/`HALF_DAYS` (2026 [lu]) | assertion vs NYSE primaire | **livré/testé, upcoming** | `bell_sessions_match_primary_nyse_calendar` |
| MWCB → fichier séance (T-1b) | PR-B-8 (doc NYSE sha-pinné) | niveaux + halts par titre + 5 dates | **ABSENT** (item formé, bloquant release) | (doc — assemblé à T-1b) |

Invariant durable : `bell_residual_counter_passes_close_guard` (tout futur nom de résiduel heurtant `CLOSE_KEY` rougit ; exemption `(?<!no_)` non élargie, ESC-1 c). `error_origin` -b3b : rédacteur/worker (aucun défaut latent d'un lot antérieur trouvé).

## Amendement D1-sexies — 2026-09-20 (lot -b1-bis-i, worker `claude-opus-4-8[1m]` effort max ; G0 `docs/G0-lot-t1a-ii-b1-bis.md` + « Amendement checkpoint-1 » C-1..C-11 + « Adjudications » A-1..A-5 pliées ; PLI `docs/PLI-lot-t1a-ii-b1-bis.md`)
**Plumbing de la course fondatrice (L-3..L-6 livrés ; L-1/L-2 = découverte réseau, gelée derrière le PLI).** Ferme C-V-1 (producteur ABSENT au gel -b3a) et C-V-2 (ancrage C-3 non branché) ; ouvre le `founding_pool` (décision 47).
- **Producteur BRANCHÉ (L-3, Q1=(a), C-8)** : `apps/bell/src/rebase-produce.ts` porte le scan d'autorité **in-repo** (décision 60) — énumération Helius `getTransactionsForAddress` `full` sur l'autorité partagée S7vYFF (**mono-opérateur**, résiduel `authority_scan_mono_operator`), décodage 43/x par mint (`eventsFromTx`), relecture quorum-2 par corps (`bodyEventKey`), ancrage C-3 par mint (`replayTriplet == pinOracleState` sur les bits). Écrit `{symbol:{events, scanComplete, scanMethod}}` **hors dépôt** ; `scanMethod` vient d'une **table committée fermée** `method`→`scanMethod` (`SCAN_METHOD_MAP`, C-1), jamais un test de sous-chaîne. `--rebase-produce`/`--authority` câblés dans `runMain` (le run réel = une commande, sous le budget). Méthode full-mint (décision 55) **réfutée** (~5,34 M cr), non portée (A-5). **Shape gTfA `full` = item de vérification au run réel** (PLI) : non documentée getTransaction-json-compatible ; corps non parsé ⇒ 0 événement ⇒ oracle C-3 ferme (`scanComplete:false`), jamais un partiel muet.
- **`scanMethod` REQUIS (L-3, C-1)** : `TrajectoryInput.scanMethod: "authority"` (enum fermé) ; `loadTrajectories` **écarte** toute entrée sans `scanMethod === "authority"` (⇒ `rebase_unverified`) — un `scanMethod?` optionnel défaut « aucun résiduel » serait un **fail-open**.
- **Ancrage C-3 (L-4, C-V-2, C-7)** : `buildSolanaSymbol` lit l'état `ScaledUiAmountConfig` **base64 quorum-2** (clé `mulBits|newBits|effTs`, calque `pinOracleState`) et n'accorde le gate que si `replayTriplet(events, Number.MAX_SAFE_INTEGER)` == triplet lu **sur les trois champs de bits** ; toute divergence (un update programmé posté APRÈS le scan diverge sur `newBits`/`effTs`), `no_quorum`, ou état illisible ⇒ `rebase_unverified` (fail-closed, jamais un rescale). L'ancrage ne tire un appel de plus **que** si trajectoire + mint présents (un build sans trajectoire fait les mêmes lectures qu'avant). `scanMethod` passé au gate (fait 4).
- **`gate.residuals → state.json` (L-5, C-10, Q3)** : `collect()` compte `authority_scan_mono_operator`/`set_authority_unscanned` **par séance `trajectory_known` publiée** (calque `rebase_unverified`) dans `state.residuals` + les liste sur l'entrée `gap` sous `rebase_residuals` (**hors** `CLOSE_KEY` ; `assertNoClose` vert). `PINNED_BELL_SHA 0cfbed20…` **inchangé prouvé** (`bell_pinned_sha_reduces_to_b3a_by_subtraction` vert : les fixtures de rejeu passent `rebase:undefined` ; un gate `[]`-résiduel n'ajoute aucune clé, gaté sur `.length`).
- **`founding_pool` doctrine (L-1/L-2, CODE livré hors ligne, MESURE gelée)** : registre fondateur = **pools 2025 découverts on-chain** (`founding_pool` ≠ `pairAddress` census v3, décision 47). `discover.ts` livré + `--discover` câblé dans `runMain` (écrit `discovery-<MINT>.json` hors dépôt, une commande sous le budget ; gTfA sur Helius quel que soit l'ordre des providers) : tally échantillonné mono-opérateur (3 points asc/médian/desc, part de l'échantillon publiée, jamais « couverture de fenêtre », C-3) ; appariement quote **par owner** (`tallyFoundingVault`, C-2) ; confirmation quorum-2 des trois champs du vault `owner`/`owner_of_owner`/`executable` (`confirmVault` lit l'**autorité du vault** = `vault.owner` du token balance (le tally la donne), puis `getAccountInfo(authorité).owner` = owner-of-owner = le programme du pool, et son `executable` — carte `DEX_BY_PROGRAM_ID` si owner-of-owner exécutable ∈ carte, sinon `unknown-program` ; System-owned ⇒ `authority_kind` déclaré, **jamais rejeté sur l'owner seul**, C-5) ; `quote_class` liste fermée `USD_STABLE_MINTS` (`quoteClass`, C-6). `FOUNDING_POOLS` **measure-gated** (`founding_pool: null` × 4, `bell_founding_registry_equals_discovery_measure` prouve `registre == series/founding/discovery-<MINT>.json`). **La seule MESURE réseau est gelée derrière le PLI** (plafond ≤ 20 000 cr, `--max-calls` pire cas ≤ 2 000 appels) ; le run écrit les vaults mesurés dans les deux et le test C-4 reste vert.
- **Erratum C-G2-1 (2026-09-20, pli G2, worker `claude-opus-4-8[1m]`)** : au gel `9033670` la phrase ci-dessus (« confirmation quorum-2 des trois champs … `authority_kind` déclaré ») **sur-déclarait** — `confirmVault` LISAIT bien `executable`/`authority_kind` mais `discoverFounding` les **jetait** (jamais portés par `FoundingPoolRef`/`discovery-*.json`, `dex:"unknown-program"` irréductiblement ambigu). Corrigé ici : les deux sont **ENREGISTRÉS** ; `authority_kind` = enum FERMÉ `program|system-owned-pda-or-wallet|unread` (jamais `null` — `null` conflait « programme exécutable » et « quorum échoué »). Les 4 pools = `(executable:true, authority_kind:"program")`, produits **FIRST-HAND** (relecture `confirmVault` quorum-2, 16 `getAccountInfo`, 8 helius/8 chainstack, ~16 cr ; owner-of-owner == `programId` committé 4/4 ; record `confirm-reread-2026-09-20.json` sha `c9e144f9…`). Couverture : `bell_discover_confirm_vault_executable_and_system_owned` (asserts sur (A)(B)(C)(D), dont (D) une autorité illisible ⇒ `authority_kind:"unread"`) + C-4 `deepEqual` (nouveaux champs) ; mutant « authority_kind hardcodé `program` » ⇒ (B) rouge. `error_origin` proposé : **worker** (rédacteur -b1-bis-i : câblage `discoverFounding` + ADR en deçà de la bloquante C-5).
- **Déclaration C-V-4 (checkpoint-2 2026-09-20) — double sémantique de `sampled_tx`.** Le champ `sampledTx` du CODE (`discover.ts`, `tallyFoundingVault`) = **tx DISTINCTES après dédup par signature** (déviation C-G2-8) ; les `discovery-*.json` committés portent `sampled_tx:15000` = **compte BRUT du run pré-enregistré SANS dédup** (= 3 points × 5 pages × 1 000 tx). Les deux ne coïncident que si aucun corps n'est dédupliqué. **Adjudication rectifiée (`error_origin: orchestrateur`)** : l'effet d'une dédup sur les vaults retenus près du seuil (parts 0,0532 à 0,0612) est **improbable, non mesurable a posteriori** (corps gTfA non archivés), **re-mesuré par `PR-B-DISCOVER-DEDUP` avant toute course -ii** ; le vault top retenu (0,32–0,52) ne bouge pas, mais l'**ENSEMBLE des vaults retenus près du seuil peut bouger** (remplace « sans effet sur le `founding_pool` retenu »). Le pointeur PROVENANCE de cette double sémantique est **reporté au lot -ii** (PROVENANCE compté R-25, hors marge de 4). error_origin croisé : sous-déclaration au fold = **worker** (C-G2D-5).

### Tuyaux -b1-bis-i (entrée / sortie / état / test) — CA-11 durci : la composition est EXÉCUTÉE depuis l'artefact d'entrée
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| producteur → fichier trajectoire | scanner d'autorité in-repo (`rebase-produce.ts`, gTfA `full` S7vYFF) | `{symbol:{events, scanComplete, scanMethod}}` (hors dépôt) → `loadTrajectories` | **upcoming** (consommateur servi = course -b1-bis-ii) | `bell_trajectory_producer_composition_from_file` |
| fichier → gate (ancré C-3) | `loadTrajectories` + état mint base64 quorum-2 | `buildSolanaSymbol` → `RebaseGate` (3 états, résiduels) → `collect()` | **upcoming** (chemin servi = course -b1-bis-ii) | `bell_c3_anchor_stale_trajectory_is_unverified` |
| `gate.residuals` → state.json | `RebaseGate.residuals` (`trajectory_known`) | compteur `state.residuals` + champ `rebase_residuals` sur `gap` | **upcoming** | `bell_gate_residuals_counted_in_state` |
| découverte → registre fondateur | Helius gTfA `full` tally (3 points) + quorum-2 confirmation | `FOUNDING_POOLS` (`founding_pool`, vaults, dex) + `series/founding/discovery-*.json` | **upcoming** (consommateur servi = course -ii) — **mesuré 2026-09-20 (RUN 2)** ; `FOUNDING_POOLS` **== mesure** (C-4 vert) ; `executable`/`authority_kind` enregistrés **first-hand** (C-G2-1) | `bell_discover_founding_vault_from_tally` + `bell_founding_registry_equals_discovery_measure` (C-4) |
| brut complet → lean (C-V-3) | réducteur `leanFromDiscovery` (`discover.ts`, **au dépôt**) + script d'invocation `scripts-cg2/write-committed.mts` (**hors dépôt, sha-pinné**) | `series/founding/discovery-*.json` committés (ordre canonique, exclus R-25) | **branché (offline)** — byte-for-byte sur brut **RÉEL** prouvé 3× first-hand **hors CI** (G2, checkpoint-2, G2 delta) ; test CI = **forme sur brut synthétique** (item C-G2D-7) | `bell_discovery_lean_reducer_shape` (forme, brut synthétique) ; recompute first-hand hors CI (C-G2D-7) |
| g_t fondatrice → course/rapport | — | -b1-bis-ii (course rebase-aware) | **item formé** | G0 -b1-bis-ii |

Invariant durable (repris) : `bell_residual_counter_passes_close_guard` (les deux codes d'autorité + `rebase_residuals` hors `CLOSE_KEY`, ESC-1 c). `error_origin` -b1-bis-i : rédacteur/worker (C-V-1/C-V-2 -b3a fermés par ce lot ; aucun défaut latent d'un lot antérieur non déjà formé). Décision 60 (méthode hybride) : **ratifiée par l'investisseur le 2026-09-20** (CHANTIERS, ratifications du jour ; cf. A-4) — la clause conditionnelle « si renversée ⇒ `error_origin: orchestrateur` » est **caduque** ; reste à re-pinner le label de série `method: "…(pending R-26 ratification)"` (item registre #12).

## Registre des items formés du lot -b1-bis-i (durable) — C-V-2 (checkpoint-2 2026-09-20, worker `claude-opus-4-8[1m]` effort max)
Porté hors du PLI (durable) sur demande **bloquante C-V-2** du checkpoint-2 (`docs/CHECKPOINT2-lot-t1a-ii-b1-bis.md`). Chaque item : **déclencheur** (CONTRAIGNANT sauf mention « optionnel »), **propriétaire**, **lot porteur**. Zéro dette nue (règle Dettes) : un tuyau annoncé absent est un item à déclencheur, jamais un dû. Le bloc miroir pour `docs/CHANTIERS.md` (autre branche) est remis à l'orchestrateur à la fusion (le worker n'édite pas CHANTIERS). Les 3 items de la G2 delta portant sur du CODE dépassent la marge R-25 de 4 lignes (décision orchestrateur : pas de seam `-b1-bis-i-b`) ⇒ exigences d'entrée du G0 -b1-bis-ii.

| # | Item | Déclencheur (contraignant sauf mention) | Propriétaire | Lot porteur |
|---|---|---|---|---|
| 1 | **`PR-B-DISCOVER-DEDUP`** — archiver les signatures par point, re-tirer les parts **avec** dédup, rapporter tout franchissement de 0,05 | **AVANT toute consommation de `FOUNDING_POOLS` par la course -ii** — exigence d'entrée du **G0 -b1-bis-ii** | orchestrateur → worker | -b1-bis-ii |
| 1a | sous-item **`PR-B-DEDUP-OBSERVABLE`** (C-G2D-4) — publier `dedup_removed` / `bodies_without_signature` au rapport `--discover` (dédup aujourd'hui silencieuse : on ne sait pas, sur un run réel, si elle a agi) | idem #1 (sous `PR-B-DISCOVER-DEDUP`) | orchestrateur → worker | -b1-bis-ii |
| 2 | **`PR-B-CONFIRMVAULT-UNREAD`** (C-G2D-2) — tester la 2ᵉ branche `unread` de `confirmVault` (autorité non-System lue + compte programme au quorum raté) ; mutant M-B1 survit | exigence d'entrée du **G0 -b1-bis-ii** — la course ne consomme pas `FOUNDING_POOLS` sans ce livrable ; code compté R-25 (> marge 4 ⇒ hors -i) | orchestrateur → worker | -b1-bis-ii |
| 3 | **`PR-B-SIGOFBODY-FALLBACK`** (C-G2D-3) — tester le repli `signature` top-level de `sigOfBody` ; mutant M-B3 survit | idem #2 | orchestrateur → worker | -b1-bis-ii |
| 4 | **C-G2D-8** (R-3) — factoriser le wrapper `counted` dupliqué entre `runDiscoverCli` et `produceTrajectories` | **optionnel, non bloquant** ; G0 -b1-bis-ii ; code inter-fichiers compté R-25 | orchestrateur → worker | -b1-bis-ii |
| 5 | **C-G2D-7** — test CI rejouant `leanFromDiscovery` sur les 4 bruts pinnés **RÉELS** (aujourd'hui : forme sur brut synthétique en CI ; byte-for-byte réel prouvé 3× first-hand hors CI — G2, checkpoint-2, G2 delta) | **G0 -b1-bis-ii** ; code compté R-25 | orchestrateur → worker | -b1-bis-ii |
| 6 | **carte DEX `whirLbMii…`** — entrée `DEX_BY_PROGRAM_ID` avec **source [lu]** (programId lu on-chain ; SPYx/NVDAx `unknown-program` au gel), jamais un id de mémoire | **G0 -b1-bis-ii** | orchestrateur → lecteur | -b1-bis-ii |
| 7 | **agrégation multi-pool** (C-9 i) — règle d'agrégation VWAP quand plusieurs vaults ≥ seuil (mesuré 8/7/10/5) ; par pool ou fusionné, déclaré (licite ADR-B0 D2 i) | **G0 -b1-bis-ii** | orchestrateur | -b1-bis-ii |
| 8 | **`quoteDec: 6` en dur** (C-9 ii, `collect.ts:472`) — lire `quoteDec` du `founding_pool` (L-2) sinon VWAP biaisé de 10^Δ ; mutant à ajouter | **G0 -b1-bis-ii** | orchestrateur | -b1-bis-ii |
| 9 | **compte in-window exact non capé** (C-G2-6) — énumération non capée du compte in-window par `founding_pool`, si voulu | **G0 -b1-bis-ii** | orchestrateur → worker | -b1-bis-ii |
| 10 | **corps gTfA structurel** — archiver UN corps gTfA `full` structurel (sonde de forme ; résout `PR-B-GTFA-SHAPE` sur brut réel, aujourd'hui CLOS par inférence RUN 1) | **lot -b3d (sonde C-7)** | orchestrateur → worker | -b3d |
| 11 | **`bell-report.mjs --founding`** + **consommateur servi de `coverage.ts`** — extension rapport Table 4 par régime ; `coverageDecision` branché à la planification de course + test de composition | **G0 -b1-bis-ii** (sinon `coverage.ts` reste `upcoming`) | orchestrateur | -b1-bis-ii |
| 12 | **label périmé `method: "…(pending R-26 ratification)"`** — les séries (champ `method` des `rebase-*.json`), le CODE (`SCAN_METHOD_MAP`) et le rapport portent encore « pending R-26 ratification » alors que la **décision 60 est ratifiée le 2026-09-20** ; re-pin des séries. **Couplage à vérifier par le worker -b3d (non vérifié ici)** : si la clé de `SCAN_METHOD_MAP` est le libellé complet, re-pinner le libellé de série SANS mettre à jour la clé en lockstep ⇒ `loadTrajectories` écarte l'entrée ⇒ `rebase_unverified` (code compté R-25) | **lot -b3d** (re-pin des séries) | orchestrateur → worker | -b3d |
| 13 | **source ÉMETTEUR dans `pools.ts`** — inscrire la source émetteur dans le champ `source` des **4 mints** (lecture `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md` sur `lot/etude-suite`, **4/4 identiques** ; cf. commit `fd53836`, chercheur `claude-sonnet-5`) | **premier lot Bell avec marge R-25**, au plus tard **G0 T-1b** | orchestrateur → worker | T-1b (au plus tard) |
| 14 | **C-V-6** — purge de la partie ENTIÈRE collisionnante `collect.test.ts:781/785` (littéral synthétique hérité de la base, hors formes ratifiées de l'anti-close, égalité exacte = 0) ; **adjugée au G7 comme hasard** | **optionnel** (modification en place, 0 ligne R-25) ; lot -ii | orchestrateur → worker | -b1-bis-ii |

**Items déjà CLOS (rappel, non ré-ouverts)** : `calls_by_method` au `--discover` (CLOS pli G2 C-G2-6, `discover-report.json`) ; C-G2-2 runner in-repo (CLOS RUN 1 : le scanner reproduit les 4 séries) ; `PR-B-GTFA-SHAPE` (CLOS par inférence RUN 1 ; réserve brut structurel = item #10). **Items repris inchangés d'ADR/G0 antérieurs** : `PR-B-SETAUTH` / `set_authority_unscanned`, `authority_scan_mono_operator`, `PR-B-SPL-TOKEN2022`, PR-B-8 (MWCB), PR-B-CAL, PR-B-DBN, PR-B-ONDO / -b3c, extension population/fenêtre — cf. §Items formés D1-quater/D1-sexies et G0 -b1-bis-i §Items formés. Plafond course -ii (≤ 1 M cr Helius + ≤ 200 k appels Chainstack) ratifié A-4 ; -ii soumis à son propre G0 + checkpoint-1.

## Amendement D1-septies — 2026-09-21 (lot -iii, univers Solana élargi ; C-2 du checkpoint-2 `docs/CHECKPOINT2-lot-t1a-iii-a1.md`)
**Porté par** : worker `claude-opus-4-8[1m]` effort max au pli du checkpoint-2 (**R-20** : le worker ne committe pas ; l'orchestrateur committe ce pur ajout daté). **Source** : amendement rédigé dans `docs/G0-lot-t1a-iii-univers-solana.md:213-219` (rédigé 2026-09-20, `claude-opus-4-8[1m]`), **jamais porté dans un ADR** jusqu'ici — défaut CA-3/CA-7 relevé au checkpoint-2. **`error_origin` : orchestrateur** (amendement B-9 rédigé au G0, non porté). Aucune décision antérieure n'est réécrite ; le corps -iii reste **`upcoming`** (Bell built à T-1b). Rattachement : ADR-B0 **D6** (Données, coûts, dépendances (R-8), `ADR-B0:52`) — l'alternative « ADR-B0 D6 » du G0 n'est pas retenue puisque le présent ADR-T1aii existe.

**Sources nouvelles [lu] (R-8)** : (1) `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md` (API émetteur `api.xstocks.fi`, `deployments[].network`, `exchange.mic`, pagination à épuisement) ; (2) `docs/PLI-lot-t1a-ii-b1-bis.md:45` (barème `getAccountInfo` 1 cr) et `:118-122` (RUN 1 scanner 1 686 cr + RUN 2 découverte 616 cr = 154 cr/mint) ; (3) `apps/bell/src/digest.ts:33,38` (`CLOSE_KEY`/`assertNoClose`) ; (4) `apps/bell/src/operators.ts:18-26` (opérateurs keyless) ; (5) `F:\Monark-wt-bellb3d\…:G0-lot-t1a-ii-b3d.md:23,24,96,97,102` et `collect.ts:29,297,440-447,582` (commit `eb54baa` : `--max-credits`/`readPriorCalls`, non fusionné) ; (6) `docs/CHANTIERS.md:241,244-245` (décision 82 + amendement). Conditions d'usage des API tierces = PR-U-\* [à lire] (§6 du G0), citations **≤ 25 mots + URL + date + sha** (NB-5).

**Table des tuyaux (§4.2 du G0 ; ADR-M018 D3 ; entrée / sortie / état / test — règle de Branchement) — portée telle quelle, tous `upcoming`** :

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| liste émetteur + confirm on-chain → univers candidats | `api.xstocks.fi/public/assets` (keyless, ToS [lu]) + `getAccountInfo` quorum-2 keyless | `universe-candidates.json` (identité confirmée, `scaled_ui`, `authority`) | **upcoming** | `bell_universe_enumerates_from_issuer_list_and_onchain`, oracle de calibration |
| API DEX/Gecko (liquidité) + on-chain réserves → colonnes de classement | Raydium/Orca/GeckoTerminal (ToS [lu], allowlist d'hôtes) + vault quote keyless via `tick()` | colonnes `quote_vault_balance_usd`/volume (**allowlist de champs, prix absent**) | **upcoming** | `bell_universe_artifact_built_by_field_allowlist_no_price` |
| candidats + critères pré-enregistrés → liste CLASSÉE | `universe-candidates` + seuils (prereg committé) | classement ordonné + `below_founding_anchor` publié (committé à l'octet) | **upcoming** (consommateur servi = décision investisseur) | `bell_liquidity_rank_columns_and_below_founding_anchor_published` |
| gSFA par mint (Phase B) → coût full-mint + durée | gSFA Helius archive (mono-opérateur, ledger dédié `--max-credits`) | `crosscheck-signatures.json` (M1, durée, authority) | **upcoming** | `bell_signature_count_paginates_and_projects`, `bell_signature_count_method_allowlist_fail_closed`, lit le top-N depuis l'artefact -iii-a committé |
| liste CLASSÉE → décision investisseur ajouts | classement + M1/M2 | décision investisseur → **ADR d'ajout par symbole** (lot ultérieur) | **item à déclencheur** | (décision hors code) |

**Coûts** : Phase A **0 crédit** ; Phase B **≤ 50 000 cr** sur ledger **dédié** (`--max-credits`, `WORST_CASE=1`), plafond « pour cet usage » **distinct** du 6,5 M -b3d (décision 67). **Dépendance** : -iii-b **bloqué sur la fusion de -b3d-a** (source de `--max-credits`).

**Pointeur daté (2026-09-21, guard de formulation ; N'ÉDITE PAS la table portée « telle quelle »)** : la 1ʳᵉ ligne dit « quorum-2 keyless » au sens du G0 ; l'exécution **-iii-a1 est voie (A)** — **un seul opérateur keyless admis** (`api.mainnet.solana.com` → solana-foundation) + **Chainstack Solana** comme 2ᵉ opérateur (RU consommés, 0 Helius). Cf. `docs/PLI-lot-t1a-iii-a1.md` §2 et « Amendement 1 » (CONF-SRC-4). Ce pointeur lève l'ambiguïté sans modifier la ligne (mandat C-2 : port « telle quelle »).

## Amendement D1-octies — 2026-09-21 (lot -b3d-f, condition (f) : le payload de page est engagé par la chaîne ; orchestrateur `claude-fable-5-1`)
*Nommage : le G0 du lot (`docs/G0-lot-t1a-ii-b3d-f.md:35`) annonçait cet amendement sous le nom « D1-quater », déjà pris (lot -b3a, l.150). Il est porté sous le premier nom libre, D1-octies ; écart de nommage déclaré, `error_origin` plan.*
- **Contexte.** Le ledger chaîné du crosscheck (b1a) hachait le seul core §6 : `page_events` et `page_handoffs`, qui portent TOUS DEUX un verdict (`compareToHybrid` equal/divergence ; `authority_change_found`, gate L-5), pouvaient être édités sous un `entry_sha256` conservé, et une reprise rendait alors un verdict falsifié (ITEM-A, reproduit indépendamment au checkpoint-2 b1a). Condition (f) du G0-b `:239` : non falsifiable AVANT la course.
- **Décision (option A).** `payload_sha256 = sha256(JSON.stringify({page_events, page_handoffs}))`, forme écrite, ordre d'ingestion, writer unique, ajouté en DERNIER au core (dix champs) ; le vérificateur RECALCULE, ne lit jamais le champ stocké seul ; un record sans `payload_sha256` est refusé, sans migration. Texte normatif et vecteurs littéraux : Amendement de format n°2 de `docs/PLI-lot-t1a-ii-b3d.md`.
- **Rejets.** (B) scinder l'engagement (événements seuls, ou handoffs seuls) : laisse un vecteur, les deux payloads portent un verdict. (C) re-décoder à la reprise depuis `candidates/<MINT>/` sans engagement chaîné : le remède reste sur disque, éditable au même titre. (D) canonicalisation sémantique RFC 8785 (JCS) [abs] : aucun consommateur non-JS, coût et surface sans bénéfice ; l'ordre d'ingestion fait partie de ce qui est engagé.
- **Conséquences.** `ledger_sha256` inchangé de calcul, renforcé de sens. M-b1a-7/9 inversés (notes datées au G0-b). Audit §5 en deux vérifications (recompute sur disque ; vérité du payload par ensemble `eventKey`, jamais par hex d'une page re-tirée). `candidate_shas` hors chaîne, déclaré. **Limite** : (f) ne défait pas un re-hachage complet de la chaîne avant publication de `ledger_sha256` ; l'ancrage externe par page (C-F-4) est une escalade investisseur au G0 de la course.
- **Tuyaux (règle Branchement).** Entrée : pages tirées par le CLI crosscheck. Sortie : `ledger-<MINT>.jsonl` → `resumeFromLedger` (reprise) et artefact `crosscheck-<MINT>.json` (`ledger_sha256`). État : `<out>/` hors dépôt. Preuve : `bell_crosscheck_resume_refuses_edited_payload` (composition `runMain` de bout en bout) et `…rederives_committing_page_payload` (vecteurs littéraux). Le crosscheck reste hors registre public jusqu'à la course.
- **Item formé.** `packages/rpc-guard/test/ledger-format-lock.test.ts:16-17` (`RefMod` arité 3 périmée) : déclencheur **GARDE-HELIUS-1b**, propriétaire orchestrateur.

## Amendement D1-nonies — 2026-09-23 (lot BELL-SHORTPAGE-1 + micro-pli 1b, `f5fc682` : page courte finale prouvée par sonde + ancre C-8 ; écritures durables C-6 ; retry borné du rename R-SP-A)
*Nommage : D1-octies (l.388) est le dernier nom pris ; le premier nom libre est D1-nonies (règle de la note de collision l.389). Texte rédigé au G1 (v1, 2026-09-22) puis replié au G7 (2026-09-23) : chaque correction de revue porte sa source entre parenthèses ; la table du §11 les récapitule avec leur `error_origin`. Numérotation : les revues persistées citent la v1 (§1-§8) ; v1 → texte final : §1→§2, §2→§3, §3→§4, §4→§5 (+ §6 retry, nouveau), §5→§7, §6→§8, §7→§9, §8→§10 ; §1 et §11 sont nouveaux.*

**Porté par** : worker `claude-opus-5-5[1m]` (préfixe conforme, décision 133), effort max — v1 au G1, blocs du micro-pli, repli G7 par une instance docs séparée. **R-20** : aucun worker ne committe ; l'orchestrateur `claude-fable-5-1` insère ce pur ajout daté, le committe et en est le réviseur R-21. **Autorité** : décision investisseur 135, ruling (2) (`docs/CHANTIERS.md:839`) ; décision 137 (`docs/CHANTIERS.md:857-860`) ; ruling orchestrateur C-6 (`docs/CHANTIERS.md:865`, étendu `docs/CHANTIERS.md:889`) ; rulings R-SP-A/B/C (`docs/CHANTIERS.md:894`). **Périmètre du code** : `apps/bell/src/rebase-crosscheck.ts` SEUL (sha256 `15cc8773…` à `f5fc682`) ; tests dans `apps/bell/test/rebase-crosscheck.test.ts` (`bed50110…`). **Numérotation** : `:NNN` seul = ligne de `apps/bell/src/rebase-crosscheck.ts`, `T:NNN` = ligne du fichier de test, les deux à `f5fc682` et identiques dans l'arbre fusionné (`lot/etude-suite` ne modifie aucun de ces deux fichiers depuis la base `de30eab` ; l'insertion les épingle par sha) ; les lignes de `docs/CHANTIERS.md` sont celles de `56e7730` (identiques à `fad24ab` jusqu'à la l.952).

### 1. Chaîne de revue (ordre réel ; heure UTC = `TZ=UTC git log --date=iso-local` du commit porteur)
| étape | acteur | objet (commit, heure) | verdict et mesures | source en dépôt |
|---|---|---|---|---|
| checkpoint-1 (plan) | validateur `claude-fable-5-1` | plan sur `de30eab` ; persisté `c17cdc8` (20:14) | APPROUVE-AVEC-CORRECTIONS C-1..C-5 (C-1 : ordre sonde → ancre C-8 → commit) | `docs/CHECKPOINT1-lot-bell-shortpage-1.md:38-45` |
| G1 | worker `claude-opus-5-5[1m]` | `e5dfbb4` (21:21) ; rendu persisté `ebf364d` (21:24) | 930/929/0/1 ; 30/30 mutants tués par leur test désigné ; R-25 322 ; v1 de cet amendement | `docs/G1-lot-bell-shortpage-1.md:7,31-35` ; `docs/CHANTIERS.md:882` |
| checkpoint-2 | validateur `claude-fable-5-1` | `e5dfbb4` ; persisté `91a719b` (22:09) | ACCEPTE-AVEC-CORRECTIONS C-1..C-5, toutes hors code ; escalade pré-cadrée (déployer C-6 à une reprise post-crash ?) | `docs/CHECKPOINT2-lot-bell-shortpage-1.md:58-65` |
| rulings orchestrateur | `claude-fable-5-1` | `097bc9e` (22:16) ; RUNBOOK `91a719b` ; FAITS `7cdfb7c` (22:25) | fait mesuré : `EPERM` pour tout lecteur ; R-SP-A (retry borné), R-SP-B (runbook de supervision), R-SP-C (arbre d'exécution épinglé, D-n = déploiement) ; lecture sur place win32 | `docs/CHANTIERS.md:893-894` ; `docs/CHANTIERS.md:906` ; `docs/course-bell/RUNBOOK-supervision-tirage.md:7-29` ; `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:7-47` |
| G2 | relecteur `claude-opus-5-5[1m]`, instance séparée | `e5dfbb4` ; persisté `147d50f` (22:23) | PASS-AVEC-CORRECTIONS C-G2-1..C-G2-4 ; 9/25 mutants propres survivants ; coût C-6 mesuré (§5) | `docs/G2-lot-bell-shortpage-1.md:9,47-77,89-103` |
| micro-pli 1b | même worker que le G1 | `f5fc682` (00:16) | C-G2-1..C-G2-3 (tests), R-SP-A (code), cp-2 C-1 (commentaires seuls) ; 10 tests ; 46/46 mutants tués par leur test désigné ; 940/939/0/1 ; re-vérifié par l'orchestrateur ; déviations D-1..D-8 déclarées | message du commit `f5fc682` ; `docs/CHANTIERS.md:933-934` ; `docs/CHANTIERS.md:937` ; `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:32` |
| re-checkpoint-2 | validateur `claude-fable-5-1` | `f5fc682` ; persisté `04d9d8d` (00:41) | ACCEPTE sous trois réserves : (i) purge secret-scan de la cible (faite `7f05c08`, 00:39) ; (ii) re-G2 PASS ; (iii) actes d'insertion (§11) ; 46/46 + 5/5 mutants propres sur le retry | `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:15-26,32,36-42` |
| re-G2 | même relecteur que le G2 (contexte intact) | `f5fc682` ; persisté `f1b9f5d` (01:05) | PASS-AVEC-CORRECTIONS C-1b-1..C-1b-3 + C-G2-4 reconduite ; fusion à blanc sans régression (+19 tests verts) | `docs/G2-lot-bell-shortpage-1-1b.md:9,27-72` |
| G7 | orchestrateur `claude-fable-5-1` | fusion de `f5fc682` + ce texte | oracle sur l'arbre principal fusionné | entrée « G7 BELL-SHORTPAGE-1 » de `docs/CHANTIERS.md` |

- **R-25** : cumul lot + micro-pli = **617** (575 + 42 ; `de30eab...f5fc682`, pathspec de `.github/workflows/ci.yml:65`), dont lot 322 et micro-pli 309 (mesures : `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:22` ; `docs/G2-lot-bell-shortpage-1-1b.md:33` ; re-mesuré au repli). **Ruling G7 : accepté** — la cible < 600 de la mission du lot était indicative ; 617 est un dépassement déclaré de la cible de mission, pas une dérogation de gate : la règle est A-5 (> 1 150 ⇒ STOP, `docs/CONSIGNE-STANDARD-G1.md:10`) et la borne CI 1 205 (`.github/workflows/ci.yml:43`) (source : question du re-G2, `docs/G2-lot-bell-shortpage-1-1b.md:76` ; ruling `docs/CHANTIERS.md:951` ; vocabulaire `docs/CHANTIERS.md:958` ; précédent `docs/CHANTIERS.md:935`).
- **Précondition de fusion hors lot** : `no_secret_in_repo` était rouge sur la cible depuis `b147db0` (`docs/G2-lot-u4b-1b-4-integral.md:78`) ; purgé par `7f05c08` avant la fusion (source : re-cp-2 (i), `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:38` ; `docs/CHANTIERS.md:942`).

### 2. L'invariant C-B-1, replié tel qu'il était avant ce lot [lu]
- **Source.** C-B-1 n'a pas d'ADR propre (checkpoint-1 C-2 : le seul homonyme de `docs/adr` est le C-B-12 de `docs/adr/ADR-NARABI-OPS-1.md:102`, sans rapport). Il vit dans :
  - `docs/G0-lot-t1a-ii-b3d-b.md:63-75` (L-b1a-1 : une page fautée n'est PAS committée, STOP au premier défaut ; committer P+1 après un défaut sur P perd P, c'est V-1) ;
  - `docs/G0-lot-t1a-ii-b3d-b.md:414-416` (Amendement L-b1a-1, **option (d)**) ;
  - `docs/PLI-lot-t1a-ii-b3d.md:346` (C-V-1 (i), option (d) portée au PLI) ;
  - `docs/CHANTIERS.md:465` (adjudication).
- **Invariant.** Sous `require_full_pages:true`, aucune page n'est committée sans preuve de sa complétude.
  - Une page fautée (`block_time_null`, `body_quorum`, `non_monotonic`) n'est jamais committée ; le scan s'arrête et la reprise la re-tire.
  - Une page **courte non finale** (`data.length` BRUT, avant dédoublonnage, `< GTFA_PAGE_LIMIT`, AVEC un token de page suivante) est une faute re-tirable : non committée, STOP `not_full_pages`.
  - `--allow-short-pages` la committe. `require_full_pages` est persisté dans `budget.json` ; une reprise plus stricte que le mode stocké lève.
  - Le core du ledger reste inchangé (aucun `raw_count`).
- **Conséquence déjà écrite** (`docs/CHECKPOINT2-lot-t1a-ii-b3d-b1a.md:71`) : si Helius rend légitimement des pages courtes non finales, le tirage strict reste `inconclusive` et `--allow-short-pages` devient le mode du tirage.

### 3. Le fait mesuré qui motive la relaxation [lu]
- `docs/CHANTIERS.md:817` : tirage strict TSLAx. 8 783 pages committées, arrêt C-B-1 sur une page non finale courte (`data.length < 1000` avec token), non committée, `inconclusive:not_full_pages`, à 344 slots de `oracle_slot`. La relance rejoue la même page, donc l'arrêt persiste.
- `docs/CHANTIERS.md:838` : exécution dans une COPIE du répertoire, sous `--allow-short-pages`, en 3 appels. La page courte était la VRAIE page finale : page 8 784, **180 tx, token de pagination émis quand même par Helius**. La page suivante était **vide**, d'où `exhausted`, ancre de fin C-8 OK, `initialize` OK, `complete:true`, **N_exact 8 783 173, 8 784 pages, comparateur `equal`**.
- `docs/CHANTIERS.md:839`, ruling (2) : « page courte non finale + page suivante vide ⇒ page finale (C-8 décide) ; sinon STOP `not_full_pages` inchangé ».
- `docs/CHANTIERS.md:898` (fait postérieur à la v1) : même cas sur AAPLx — STOP `not_full_pages` à 2 628 pages, page 2 629 courte AVEC token ; procédure 135 (a) (copie + `--allow-short-pages`, 3 appels) ⇒ page finale de 828 tx, page suivante vide, ancre C-8 OK, `complete:true`, **N_exact 2 628 814, 2 629 pages, `equal`**. Helius émet donc un `paginationToken` sur la vraie dernière page **sur 2 mints sur 2** (fait de première main pour I-SP-2 et I-SP-3).

### 4. Décision (relaxation bornée de C-B-1 ; checkpoint-1 C-1 = ordre sonde → ancre → commit)
- **Règle.** Sous `require_full_pages:true`, une page courte AVEC token est committée comme **page finale** si et seulement si les deux conditions suivantes tiennent :
  - (i) **UNE sonde** rend **0 tx BRUT**, quel que soit le token qu'elle porte. La sonde est la requête exacte de la page suivante : mêmes `mint`, `full`, `asc`, `GTFA_PAGE_LIMIT`, `filters.slot` (`lte = oracle_slot` et le `gte` de reprise), plus le token de la page. Un seul constructeur, `pageParams` (`:293-294`). Une sonde NON vide AVEC token — forme réaliste d'une continuation tronquée — arrête sans commit (`bell_shortpage_probe_nonempty_with_token_stops_uncommitted`, `T:1633` ; source : G2 C-G2-1, `docs/G2-lot-bell-shortpage-1.md:51-53`).
  - (ii) Seulement après une sonde vide, **l'ancre de fin C-8** (page desc, `limit 1`, `slot.lte = oracle_slot`) est demandée (`endAnchorMatches`, `:298-302`) ; sa signature la plus récente doit égaler la dernière signature asc, c'est-à-dire la dernière tx de cette page. La comparaison porte sur la SIGNATURE : une autre tx au même slot est refusée (`T:1660`) ; la requête desc est enregistrée et épinglée, une seule fois, sur les deux chemins (`T:1644`) ; l'ancre passe par `retry` sur les deux chemins (`T:1671`) (source : G2 C-G2-2 (a)(b)(c), `docs/G2-lot-bell-shortpage-1.md:54-61`).
- Tout autre résultat donne le **STOP `not_full_pages` inchangé** (`:359`) : page non committée, `exhausted` non posé, la voie de guérison d'une page courte transitoire reste intacte (`bell_crosscheck_short_page_transient_token_heals_on_resume`, `T:1114`).
- L'ancre est **déplacée, jamais rejouée** : un seul appel desc par scan (`endAnchorOk` posé une fois, `:357` sur le chemin sonde ou `:375` après la boucle).
- Sonde et ancre passent par `retry(() => call(...))` dans le `try` du scan : un `BudgetExceededError` tombe dans le `catch` (`:370-373`, `budget_exhausted`) sans rien committer.
- La sonde n'alimente **jamais** `pageTxs`, N, `events`, `onPage` ni `fetched`. Il y a **au plus une sonde par invocation**, car elle termine le scan dans les deux branches. Elle ne compte pas dans `--max-pages` ; elle est bornée par le budget d'appels et de crédits, comme l'ancre.
- **`--allow-short-pages` est inchangé : aucune sonde** (`T:1537`). Sa boucle lit elle-même la page suivante ; une sonde doublerait cet appel, ou arrêterait un mode qui committe par construction.
- **Énoncé de sûreté (précis).** La force de preuve d'une page courte committée par ce chemin est **celle d'une page pleine** :
  - l'ancre desc épingle le sommet sous la borne (aucune tx plus récente `≤ oracle_slot` au moment du scan) ;
  - une omission **intra-page** reste indétectable dans les deux cas (résidu R-SP-1, pré-existant) ;
  - la sonde vide est une condition nécessaire **ajoutée** (défense en profondeur contre une ancre desc incohérente : `bell_shortpage_probe_nonempty_stops_uncommitted_even_if_anchor_agrees`, `T:1495`), pas la preuve ; la preuve est C-8.
- **Invariant après ce lot** : toute page committée sous `require_full_pages:true` est **pleine** (BRUT = `GTFA_PAGE_LIMIT`) **ou prouvée finale** (sans token, ou sonde vide ET ancre C-8 égale).
- **Provenance (checkpoint-1 C-5 ; sémantique de `null` corrigée — source : cp-2 C-1, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:46,60` ; G2 C-G2-4 (d), `docs/G2-lot-bell-shortpage-1.md:76,79-87`).** Le champ additif `short_final_page_probe: {page, raw_len, probe_calls: 1, probe_empty, end_anchor_ok, committed}` figure TOUJOURS dans `crosscheck-<MINT>.json` et dans `crosscheck-report.json` (`per_mint`) (`:818`, `:824`) ; il est renseigné sur le commit ET sur le STOP (`probe_empty:false`, ou `end_anchor_ok:false`).
  - **`null` = aucune décision de sonde atteinte**, dans trois cas : (1) aucune page courte portant un token ; (2) refus budgétaire SUR la sonde — le garde lève avant l'appel (`apps/bell/src/collect.ts:294-307`), la sonde n'est ni émise ni facturée ; (3) refus budgétaire sur l'ANCRE du chemin sonde — la sonde a été émise et facturée (≤ 10 crédits), son appel reste visible dans `calls_by_method` et dans le ledger de cycle, sans résultat tracé.
  - **Refus sur la sonde ≠ refus sur l'ancre** ; dans les deux cas le scan rend `budget_exhausted` sans rien committer et la reprise refait la sonde (`bell_shortpage_budget_bites_during_probe_or_anchor_commits_nothing`, `T:1546`, max-calls 4 puis 5). La phrase de la v1 (« toujours présent ; `null` = pas de sonde », puis « pas tracé sur `budget_exhausted` ») se contredisait : elle est remplacée par ce qui précède.
  - Le code porte la même sémantique en commentaires depuis `f5fc682` (JSDoc `:217-225`, artefact `:814-817`) ; le commentaire du champ `FullMintScan.shortFinalPageProbe` (`:242`, « absent when no probe was made ») reste à aligner (item CP2-C1-bis, §10).
  - La provenance est réécrite à chaque invocation (résidu R-SP-3, §10).
  - **Le core du ledger (10 champs, `packages/rpc-guard/test/ledger-format-lock.test.ts`) et `LedgerRecord` (`page_events`/`page_handoffs`) ne gagnent AUCUN champ.**
  - Lecteurs de `crosscheck-*.json` : le contrôle `sealed` du CLI (`:822`, lit `scan_complete` seul), les manifestes d'ancre (sha seul), l'orchestrateur (rapport). La gate L-5 (`set_authority_scan`) reste *upcoming*, sans code lecteur. Une clé additive ne casse aucun lecteur. Le champ n'a aucun consommateur code : c'est une provenance déclarée, lue par l'orchestrateur à `mint_end` (I-SP-3), pas une pièce (source : cp-2 CA-11, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:41`).

### 5. Ruling C-6 — écritures durables sous perte d'alimentation (D-n : durabilité write-ahead)
- **Fait, cité depuis le dépôt (source : cp-2 C-2, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:61` ; G2 C-G2-4 (b), `docs/G2-lot-bell-shortpage-1.md:74`).**
  - Coupure n°1 (~20:32 UTC) : `ledger-AAPLx.jsonl` = 593 lignes durables + **760 298 octets NUL** en queue alors que `budget.json` indiquait `pages 1222` ; ledger de cycle rpc-guard `helius.jsonl` = 9 460 lignes durables + **211 008 octets NUL** (`docs/course-bell/INCIDENT-powercut-2026-09-22.md:8-9` ; `docs/CHANTIERS.md:865`).
  - Coupure n°2 (~21:37 UTC) : `budget.json` **entièrement NUL** (499 octets : réécriture de fichier entier non flushée, second mode de perte) et `helius.head` = **64 octets NUL** (erratum I-6 : « vide » dans le premier rendu) (`docs/course-bell/INCIDENT-powercut-2026-09-22.md:36`) ; le ruling C-6 est alors étendu à tout fichier réécrit en entier (`docs/CHANTIERS.md:889`).
- **Décision.** Toute écriture du module passe par deux primitives (`:656-669`) — 8 sites au total :
  - `appendDurable` : `open "a"` → écriture de la ligne entière → `fsyncSync` → `close`. Un seul site : la ligne de ledger par page (`:799`).
  - `writeDurable` : `<f>.tmp` ouvert `"w"` → écriture → `fsyncSync` → `close`, PUIS rename sur `<f>` (retry borné, §6). **7 sites** (source : re-G2 C-1b-3 (i), `docs/G2-lot-bell-shortpage-1-1b.md:61`) : troncature de queue C-B-5 (`:686`), `budget.json` du crosscheck (`:774`), `candidates/<MINT>/<sig>.json` (`:801`), `crosscheck-<MINT>.json` ou `-attempt.json` (`:823`), `crosscheck-report.json` (`:831`), `budget.json` de la sonde de densité (`:863`), `sonde-report.json` (`:907`).
- **Couture de test : `DURABLE_FS`** (`:652-655`, membres `:600-609`), objet exporté, enveloppé par les tests à travers `runMain` puis restauré.
- **Ordre inchangé, désormais épinglé** : le compteur `budget.json`, durable, précède la ligne de ledger, durable (`:797-799`). Une coupure entre les deux laisse `calls_used ≥ pages` : sur-compte d'une page, conservateur (C-G2D-2/4). Épinglés par des tests (source : G2 C-G2-3 (a)(b)(c), `docs/G2-lot-bell-shortpage-1.md:62-68`) : l'ordre, page par page (`bell_crosscheck_budget_durable_before_each_ledger_line`, `T:1689`) ; la troncature durable d'une queue NUL à la reprise (`bell_crosscheck_nul_tail_truncated_durably_on_resume`, `T:1706`) ; les écritures de la densité (`bell_density_writes_are_durable`, `T:1724`) ; les 8 sites sont donc épinglés (5 avant le micro-pli, `docs/G2-lot-bell-shortpage-1.md:67`, + la troncature + les 2 sites de densité).
- **Coût mesuré (source : G2 C-G2-4 (a), `docs/G2-lot-bell-shortpage-1.md:70-73,89-103` ; remplace le chiffre de la v1).** Sur le vrai `runRebaseCrosscheckCli`, 2 000 pages pleines en mode strict, win32, disque F:, node v24.15.0 :
  - surcoût du lot par page : p50 **+7,6 ms**, moyenne **+10,9 ms**, p99 +79 ms ; bloc durable seul : p50 7,78 ms, moyenne 11,15 ms, p99 80,7 ms ;
  - le coût ne croît pas avec la taille du ledger (p50 d'un ajout durable inchangé sur un fichier de 261 Mio) ;
  - au plafond SPYx, ≈ 55 min en moyenne. **295 700 est un plafond, pas un compte** : c'est le sous-plafond `--max-pages`/`--max-calls` de SPYx (décision 125, `docs/CHANTIERS.md:839`) ; le coût réel suit le nombre réel de pages (calculs du repli : 8 784 pages de TSLAx × 10,9 ms ≈ 96 s ; au p50, 295 700 × 7,6 ms ≈ 37 min) ;
  - retiré : « ≈ 5 ms par page (≈ 25 min sur les ~296 k pages de SPYx) » de la v1 — primitives isolées sans source en dépôt, et « ~296 k » présenté comme un compte ;
  - sans contention, le retry R-SP-A (§6) ne fait qu'UNE tentative (même appel `fs.renameSync` qu'avant) ; son coût n'est pas re-mesuré sur `f5fc682` (déclaré).
- **Hors lot** : la garde rpc-guard (ledger de cycle, `<op>.head`) reçoit le même traitement dans le lot séparé **GARDE-FSYNC-1** (G1 `docs/G1-lot-garde-fsync-1.md` ; G1 + pli committés `d141413` sur `lot/garde-fsync-1`, G2 ‖ cp-2 en cours à ce repli, `docs/CHANTIERS.md:956`) ; son G7 est une condition du déploiement (§7).

### 6. Retry borné du rename (R-SP-A ; micro-pli 1b ; item BELL-RENAME-RETRY-1)
- **Fait [lu].** Sous win32, `fs.renameSync(tmp, cible)` échoue `EPERM` tant qu'un lecteur QUELCONQUE tient la cible ouverte (Node `openSync(cible,"r")`, Git-Bash, Python, PowerShell ; mesuré par l'orchestrateur, `docs/course-bell/RUNBOOK-supervision-tirage.md:7-21`). Motif (`docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:27-39`) : `fs.renameSync` = libuv 1.51.0 `MoveFileExW(…, MOVEFILE_REPLACE_EXISTING)` seul, sans `MOVEFILE_WRITE_THROUGH` ni sémantique POSIX ; aucun chemin Node ne remplace une cible ouverte. L'ancien `writeFileSync` tolérait les lecteurs ; C-6 échange cette tolérance contre la durabilité (`docs/course-bell/RUNBOOK-supervision-tirage.md:23-27`).
- **Décision (code `:610-655`).** Le rename de `writeDurable` (`:668`) est `DURABLE_FS.renameSync` = `renameWithBoundedRetry` (`:640-651`) :
  - UNE tentative brute (`DURABLE_FS.renameAttemptSync` = `fs.renameSync`) ;
  - réessai sur `RENAME_RETRY_CODES = ["EPERM", "EACCES", "EBUSY"]` **seulement** (`:617`), après une attente BLOQUANTE (`DURABLE_FS.sleepSync` = `Atomics.wait` ; le chemin durable est synchrone, `onPage` est synchrone) ;
  - attentes `RENAME_RETRY_FIRST_WAIT_MS = 10` ms doublées jusqu'à `RENAME_RETRY_MAX_WAIT_MS = 200` ms, la dernière rognée au plafond ; plafond TOTAL `RENAME_RETRY_TOTAL_MS = 3000` ms (`:618-620`) compté sur les attentes DEMANDÉES (déterministe) : 20 tentatives et 19 attentes au plus (10, 20, 40, 80, 160, 13 × 200, 90) ;
  - plafond épuisé ⇒ **`DurableWriteError`** (`:621-635` ; classe exportée ; champs `code`, `attempts`, `waitedMs`, `cause` ; message préfixé `bell/collect:`, donc restitué verbatim par `fatalMessage`, `apps/bell/src/collect.ts:829-831` ; nom de base du fichier et compteurs seulement) : STOP fail-closed, **le fichier précédent est intact**, le `.tmp` peut rester (réécrit `"w"` au prochain appel ; aucun lecteur n'accepte un nom `*.tmp`) ;
  - tout autre code (`ENOENT`, …) est relancé tel quel, sans attente (comportement d'avant R-SP-A) ;
  - **jamais de repli `writeFileSync`** : une troncature + écriture en place perdrait la durabilité C-6 ;
  - couture : le membre `DURABLE_FS.renameSync` désigne le rename BORNÉ, la primitive brute devient `renameAttemptSync` (`:596-599`) ; la ligne `DURABLE_FS.renameSync(tmp, path)` de `writeDurable` est inchangée.
- **Ce qui est épinglé, ce qui reste déclaratif (source : re-G2 C-1b-1 et C-1b-2, `docs/G2-lot-bell-shortpage-1-1b.md:50-59`).** Épinglés par les tests : l'échéancier, le plafond (par défaut et abaissé), les codes réessayés, l'erreur nommée sur `EPERM`, `ENOENT` relancé sans attente AU PREMIER ESSAI, le sommeil de production réellement bloquant, le défaut de la couture = constante nommée. **Encore déclaratifs** (item C-1b-2, §10) : `ENOENT` survenu APRÈS un premier refus relancé tel quel ; `code` de l'erreur égal au code réellement refusé hors `EPERM` ; `cause` conservée ; message sans le chemin de `--out`. Le coupe-circuit anti-emballement des tests vit dans le crochet `sleepSync` : une boucle qui cesse de dormir n'y passe plus (trou déclaré au §9 ; item C-1b-1, §10).
- **Conséquences.** Sans contention, une seule tentative (§5). Un lecteur tenu retarde la page d'au plus ≈ 3 s puis STOP fail-closed ; l'ordre du §5 (`budget.json` avant la ligne) garantit que ni `budget.json` ni le ledger n'avancent sur ce STOP (reprise sans perte ; `budget.json` et ledger byte-identiques dans `T:1786`). Temps réel : l'échéancier complet (3 000 ms d'attentes demandées) dure **3,09 à 3,10 s** mesurés (`docs/G2-lot-bell-shortpage-1-1b.md:41`). Le RUNBOOK de supervision reste en vigueur (défense en profondeur, `docs/course-bell/RUNBOOK-supervision-tirage.md:43-45`).
- **Précédent de forme [lu].** graceful-fs 4.2.11 (épinglé, `package-lock.json:2751-2752`), `polyfills.js:87-123` de la version installée : sous win32, `rename` réessayé sur `EACCES`/`EPERM`/`EBUSY` jusqu'à 60 s, backoff +10 ms plafonné à 100 ms (motif : antivirus) — **mais seulement si la cible est ABSENTE** (`fs.stat(to)` ⇒ `ENOENT`) ; cible présente ⇒ erreur rendue sans réessai. graceful-fs fournit donc la FORME (codes, backoff court, plafond), pas une preuve pour notre cas (cible présente tenue par un lecteur) ; exactitude confirmée à la source par le re-G2 (`docs/G2-lot-bell-shortpage-1-1b.md:40`) et relue au repli ; constat en dépôt `docs/CHANTIERS.md:933`.
- **Preuves** (composition `runMain` de bout en bout, fichiers réels ; lecteur RÉEL `openSync(cible,"r")` : sous win32 — le poste du tirage — le vrai rename échoue seul ; sous POSIX, la couture émule le refus win32 mesuré TANT QUE le même lecteur est tenu) :
  - `bell_durable_rename_retry_reader_released_then_succeeds` (`T:1755`) : lecteur libéré par le crochet `sleepSync` après ≥ 300 ms d'attentes ⇒ succès, `budget.json` = nouveau contenu, `.tmp` absent, attentes `[10, 20, 40, 80, 160]`, tirage complet `equal` ;
  - `bell_durable_rename_retry_cap_exhausted_fails_closed_named` (`T:1786`) : lecteur jamais relâché, plafond abaissé à 300 ms par la couture ⇒ `DurableWriteError` (6 tentatives, 300 ms), attentes exactes `[10, 20, 40, 80, 150]` × 2 (écriture de `onPage` puis `finally` du CLI, `:826`), `budget.json` et ledger byte-identiques ; l'erreur qui remonte est celle du `finally`, qui masque celle de `onPage` (masquage préexistant, sans effet de sûreté : les deux portent 6 tentatives / 300 ms) ;
  - `bell_durable_rename_retry_codes_schedule_and_real_wait` (`T:1816`) : `EACCES`/`EBUSY` réessayés, `ENOENT` relancé tel quel sans attente, plafond PAR DÉFAUT ⇒ 20 tentatives et l'échéancier déclaré, `sleepSync` de production réellement bloquant, défaut de la couture = constante nommée ;
  - branche d'émulation POSIX forcée sur win32 par le re-G2 : 2/2 verts (`docs/G2-lot-bell-shortpage-1-1b.md:39`) ; le vrai `rename(2)` POSIX reste à constater en CI (item CI-POSIX-1b) ;
  - ces tests portent des bornes murales (≥ 250 ms réels, durée bornée) : même classe de fragilité sous charge que le rouge à borne murale constaté au re-cp-2 (`docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:19,41`) ; consigne d'outillage : ne pas paralléliser un oracle et un harnais de mutants sur le poste (`docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:28`).
- **Mutants.** 46 = 30 du G1 + 9 du G2 (ses survivants, rendus tuables) + 7 R-SP-A (`docs/CHANTIERS.md:933`), dont les trois exigés par le RUNBOOK (« pas de retry », « retry infini », « repli writeFileSync », `docs/course-bell/RUNBOOK-supervision-tirage.md:52`) : 46/46 tués par leur test désigné (TAP `byIntended`), rejoués sur l'arbre committé par le re-cp-2 et par le re-G2 (`docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:20` ; `docs/G2-lot-bell-shortpage-1-1b.md:35-36`) ; 5/5 mutants propres du re-cp-2 sur le retry tués (`docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:21`) ; 16 mutants propres du re-G2 : 11 tués, 1 pendaison (X02), 4 survivants, tous tués par un prototype de test de 38 lignes (`docs/G2-lot-bell-shortpage-1-1b.md:37-38`) ⇒ items C-1b-1 et C-1b-2.

### 7. D-n — conditions de déploiement (checkpoint-1 C-2 §(2) ; réécrite selon R-SP-C ; calque `mint_resume-TSLAx-3`, `docs/course-bell/ANCHORS.md:45`)
- **(i) Arbre d'exécution et événement D-n (source : cp-2 C-5, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:54,64` ; ruling R-SP-C, `docs/CHANTIERS.md:894` ; précisions du re-cp-2 (iii), `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:32,40` ; remplace la v1 « après `mint_end-AAPLx` et avant `mint_start-NVDAx`, jamais un `mint_resume` »).**
  - L'arbre d'exécution d'un tirage est le cwd du processus (mesuré, `docs/CHANTIERS.md:893`). Depuis R-SP-C, les tirages Bell partent d'un arbre ÉPINGLÉ distinct, `F:\Monark-wt-bellexec` (détaché à `a703e24`, `apps/bell` + `packages/rpc-guard` byte-identiques à l'arbre qui a tiré TSLAx et AAPLx ; `docs/CHANTIERS.md:894`, `docs/course-bell/ANCHORS.md:51`).
  - Forme 1 du cp-2 C-5 : **la fusion de cette branche dans `lot/etude-suite` est libre** à tout moment ; elle ne change pas le code qui tire.
  - **L'événement D-n est le DÉPLOIEMENT** : le ré-épinglage de `F:\Monark-wt-bellexec` à un sha nommé, à une frontière SANS processus de tirage en vol — `mint_end` OU reprise post-crash —, jamais pendant qu'un processus tourne. Motif : « jamais un `mint_resume` » visait le processus en vol, pas une reprise post-crash (aucun processus en vol) ; deux pertes de ~600 pages en une soirée (`docs/CHANTIERS.md:894`).
  - **Condition du déploiement** : G7 de BELL-SHORTPAGE-1 (ce lot, micro-pli 1b compris) **ET** G7 de GARDE-FSYNC-1. La troisième condition de R-SP-C (BELL-RENAME-RETRY-1) est **satisfaite par ce lot** : le retry borné est livré par `f5fc682` (§6) (source : re-cp-2 (iii)(a)).
  - **Fenêtre de veto investisseur** : l'événement de DÉPLOIEMENT, pas la fusion (décision 137 : investisseur informé, veto possible ; source : re-cp-2 CA-2, `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:32`).
  - **État au repli** : AAPLx COMPLET (`mint_end-AAPLx` `244a903`, `docs/CHANTIERS.md:898`) ; NVDAx tiré depuis l'arbre épinglé sous l'ancien code, époque « pre-shortpage » (`docs/CHANTIERS.md:899`, `docs/course-bell/ANCHORS.md:51`). Frontières possibles : une reprise post-crash de NVDAx, `mint_end-NVDAx`, ou une frontière ultérieure. Tant que le déploiement n'a pas eu lieu, une fin de mint à page courte + token relève de la procédure 135 (a) (copie du répertoire + `--allow-short-pages`, comme TSLAx et AAPLx, `docs/CHANTIERS.md:838`, `docs/CHANTIERS.md:898`).
- **(ii) Époque (source : re-cp-2 (iii)(b), `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:40`).** La première ancre posée APRÈS le ré-épinglage (`mint_resume` d'une reprise post-crash, ou `mint_start` du mint suivant) porte, dans sa cellule libre (format de `docs/course-bell/ANCHORS.md:45`), « époque shortpage » : le sha du **ré-épinglage de `F:\Monark-wt-bellexec`** (pas le HEAD de `lot/etude-suite`), les commits de fusion de BELL-SHORTPAGE-1 et de GARDE-FSYNC-1, et le sha256 de `rebase-crosscheck.ts`. L'arbre est vérifié à ce sha avant le lancement (HEAD détaché = sha nommé, statut vide, sha du fichier, `@monark/rpc-guard` résolu dans l'arbre épinglé), car le manifeste ne pin pas le code (item I-SP-1).
- **(iii) Compatibilité dans les deux sens.**
  - Ancien code sur un ledger « nouveau strict » dont la dernière page est courte : refetch `gte = slot_hi`, page BRUT ≥ 1 (dédoublonnée) + token, donc STOP `not_full_pages`. C'est sûr : un artefact scellé n'est jamais dégradé (C-B-2).
  - Nouveau code sur un ancien ledger (cas d'un déploiement à une reprise post-crash) : trivial, un ancien ledger strict ne contient aucune page courte non prouvée.
  - Le format du ledger est inchangé. Les écritures C-6 et le retry R-SP-A produisent les mêmes octets (même contenu, autre chemin d'écriture).
- **(iv) Marqueur d'époque dans `budget.json` : NON (tranché ; accepté au cp-2, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:48`, et au G2, `docs/G2-lot-bell-shortpage-1.md:45`).**
  - L'invariant du §4 (« pleine ou prouvée finale ») tient dans les deux époques ; la garde booléenne `:768` (`require_full_pages !== true` ⇒ refus) garde donc son sens.
  - Aucun lecteur ne consommerait un marqueur : un champ sans consommateur est un tuyau mort (règle Branchement).
  - L'époque est portée par la ligne ANCHORS (ii) ; la provenance par mint par `short_final_page_probe`.
- **(v) Répertoires de course intouchés.** Ni `bell-b3d-run` (strict), ni `bell-b3d-run-tslax-completion`, ni `bell-b3d-run-aaplx-completion` (procédure 135 (a)) n'ont été écrits ou rejoués par ce lot : les tests tirent dans des répertoires temporaires. Déclaré par les revues (G2 : lecture seule, mtimes inchangés, `docs/G2-lot-bell-shortpage-1.md:11` ; re-G2 : non ouverts, `docs/G2-lot-bell-shortpage-1-1b.md:46`), non re-mesuré au repli (accès interdit pendant le tirage). La ligne CHANTIERS revient à l'orchestrateur (entrée G7).

### 8. Tuyaux (règle Branchement ; format de l.394)
- **Entrée** : le CLI crosscheck strict (`apps/bell/src/collect.ts:753` → `runRebaseCrosscheckCli` `:751` → `scanFullMint` `:267`) tire les pages gTfA asc, la sonde (même requête + token) et l'ancre desc C-8.
- **Sortie** : la page courte prouvée finale entre dans `ledger-<MINT>.jsonl` (record inchangé), que lit `resumeFromLedger` (`:698`, reprise) ; `short_final_page_probe`, `scan_complete` et `n_exact` vont dans `crosscheck-<MINT>.json` et `crosscheck-report.json`, qui alimentent le verdict et le manifeste `mint_end` (`docs/course-bell/ANCHORS.md:27`).
- **État** : `<out>/` hors dépôt, écritures durables C-6 (§5). `budget.json` garde `require_full_pages` sans marqueur.
- **Preuves** (composition `runMain` de bout en bout, artefacts écrits par le code) :
  - `bell_shortpage_probe_empty_and_anchor_equal_commits_the_final_page` (`T:1478`) ;
  - `bell_shortpage_probe_metered_on_the_guarded_cycle_ledger` (`T:1557` ; garde réelle, seul `globalThis.fetch` bouchonné, ledger de cycle helius + 1 ligne, +10 cr) ;
  - `bell_crosscheck_writes_are_durable_fsync_per_page_and_per_json` (`T:1588`, C-6) ;
  - négatifs : `…probe_nonempty_stops_uncommitted_even_if_anchor_agrees` (`T:1495`), `…probe_empty_but_anchor_differs_commits_nothing` (`T:1508`), `…resume_then_short_final_page_then_idempotent_reverification` (`T:1518`), `…allow_short_pages_never_probes` (`T:1537`), `…budget_bites_during_probe_or_anchor_commits_nothing` (`T:1546`), `…probe_transient_error_is_retried` (`T:1572`) ;
  - ajoutés au micro-pli (source : G2 C-G2-1, C-G2-2) : `…probe_nonempty_with_token_stops_uncommitted` (`T:1633`), `…anchor_request_pinned_on_both_paths` (`T:1644`), `…anchor_same_slot_other_sig_refuses` (`T:1660`), `…anchor_transient_error_is_retried_on_both_paths` (`T:1671` ; `scanFullMint` + retry injecté, calque de `T:1572`).
- **Tuyau « retry borné du rename » (R-SP-A)** :
  - **Entrée** : `writeDurable`, pour ses **7 sites** (§5) → `DURABLE_FS.renameSync` = `renameWithBoundedRetry`. Le 8ᵉ site d'écriture, la ligne de ledger (`appendDurable`, `:799`), n'a pas de rename, donc pas de retry (source : re-G2 C-1b-3 (i), `docs/G2-lot-bell-shortpage-1-1b.md:61` ; remplace « 8 sites d'écriture entière » du bloc du micro-pli).
  - **Sortie** : le fichier remplacé, lu par `readPriorCalls` / `readPriorBudget` / `readPriorByMethod` (`budget.json`), `resumeFromLedger` (ledger tronqué), le contrôle `sealed` (`:822`), l'orchestrateur et les manifestes d'ancre ; OU `DurableWriteError`, qui remonte `runMain` → `fatalMessage` (verbatim) → exit 1 (STOP fail-closed, reprise sans perte).
  - **État** : aucun état persistant nouveau ; `.tmp` résiduel possible (jamais lu, réécrit `"w"`).
  - **Preuves** : les trois tests R-SP-A (§6) ; les 8 sites et l'ordre `budget.json` → ligne épinglés par C-G2-3 (§5).
- Le crosscheck reste **hors registre public (upcoming)** jusqu'à la course (inchangé).

### 9. MAST (checkpoint-1 C-4 ; checklist de risque résiduel, référentiel doc 06 §6.4)
- **Vérification incorrecte.** Risques : un test fabrique la réponse de la sonde au lieu de traverser `runMain` ; un test fabrique le refus de rename sans lecteur. Contre-mesures : chaque test de règle passe par `runMain`, le test gardé par la garde réelle (seul `fetch` bouchonné) ; les requêtes de sonde ET d'ancre sont ENREGISTRÉES et comparées, jamais supposées ; lecteur RÉEL et vrai `EPERM` sous win32, émulation POSIX seulement pendant que ce même lecteur est tenu ; échéancier et compteurs exacts assertés ; 46 mutants à attribution TAP `byIntended`. Résidu déclaré : quatre affirmations du §6 restent déclaratives (X05, X07, X12, X13 survivent au re-G2) ⇒ item C-1b-2.
- **Terminaison prématurée.** Risques : committer avant C-8 (ce que corrige le cp-1 C-1) ; abandonner le rename à la première collision, ou « attendre » sans attendre ⇒ STOP du tirage. Contre-mesures : l'ordre sonde → ancre → commit ; `…anchor_differs_commits_nothing` et `…budget_bites…` (sur la sonde ET sur l'ancre) ; mutants « commit avant sonde », « commit avant ancre », « `exhausted` sans commit » ; tests `T:1755` et `T:1816` (retry réel, sommeil réellement bloquant).
- **Répétition d'étape.** Risques : une deuxième sonde, une ancre rejouée, un retry infini ou le réessai d'une erreur non transitoire. Contre-mesures : une sonde au plus par invocation, ancre posée une fois, comptes EXACTS (`calls_by_method` 4 gTfA, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:41`) ; plafond nommé de 3 000 ms compté sur les attentes demandées, codes fermés, coupe-circuit dans les tests. **Trou déclaré** (source : re-G2 C-1b-1, `docs/G2-lot-bell-shortpage-1-1b.md:50-54`) : la forme SANS attente du retry infini (X02 : plafond atteint ⇒ `continue`) PEND au lieu de rougir — les coupe-circuits des tests sont dans `sleepSync` et `--test-timeout` n'agit pas sur une boucle synchrone (mesuré : 240 s sans `not ok` nommé) ; en CI, le job serait coupé à 10 min (`.github/workflows/ci.yml:101`), jamais un faux vert ⇒ item C-1b-1.
- **Rétention d'information.** Risques : une sonde non tracée ; un repli silencieux qui masquerait la perte de durabilité ; une erreur anonyme ; une provenance écrasée. Contre-mesures : `short_final_page_probe` figure dans l'artefact ET le rapport, y compris sur les STOP, avec la sémantique exacte de `null` (§4) ; mutants « provenance absente » (artefact, rapport), « `raw_len` post-dédoublonnage », « `committed` forcé » (liage A-10) ; `DurableWriteError` nommée, message `bell/collect:` verbatim, champs `code`/`attempts`/`waitedMs` ; aucun repli `writeFileSync` ; ancre `mint_end` avant toute ré-invocation (R-SP-3).

### 10. Items formés, résidus et clôtures (zéro dû nu ; propriétaire : orchestrateur)
**Clos à ce G7**
- **I-SP-4** (porter les chiffres C-6 dans CHANTIERS) : PÉRIMÉ — déjà en dépôt deux fois (`docs/course-bell/INCIDENT-powercut-2026-09-22.md:8-9`, commit `5bbbfda` de 20:50 UTC ; `docs/CHANTIERS.md:865`) ; le §5 les cite (source : cp-2 C-2, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:61` ; G2 C-G2-4 (b)).
- **I-SP-5** (committer le checkpoint-1) : PÉRIMÉ — tracké depuis `c17cdc8` (20:14 UTC) (source : cp-2 C-3, `docs/CHECKPOINT2-lot-bell-shortpage-1.md:62` ; G2 C-G2-4 (c), `docs/G2-lot-bell-shortpage-1.md:75`).
- **cp-2 C-1, volet code** (commentaire de l'artefact et JSDoc au prochain toucher du fichier) : FAIT par `f5fc682`, commentaires seuls (`:223-225`, `:814-817`) ; exactitude vérifiée au re-cp-2 (`docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:34`) ; reste CP2-C1-bis (source : re-G2 C-1b-3 (iii), `docs/G2-lot-bell-shortpage-1-1b.md:63` ; l'item « cp-2 C-1 non traité » du bloc du micro-pli est périmé par le ruling qui l'a fait appliquer).
- **cp-2 C-4** (règle de lecture pendant un tirage) : FAIT — RUNBOOK de supervision (`91a719b`, R-SP-B), ré-écrit après le fait mesuré « tout lecteur » (`docs/CHANTIERS.md:893`).
- **cp-2 C-5** et l'escalade pré-cadrée du cp-2 : TRANCHÉS par R-SP-C sous la décision 137 (§7).
- **BELL-RENAME-RETRY-1** (`docs/course-bell/RUNBOOK-supervision-tirage.md:49-53`) : LIVRÉ par `f5fc682` (§6).
- Demande formée du G2 (lecture sur place de `FlushFileBuffers` et `MoveFileExW`, `docs/G2-lot-bell-shortpage-1.md:110`) : FAITE (`7cdfb7c`). Observations O-2 à O-5 du G2 : « aucune action » (`docs/G2-lot-bell-shortpage-1.md:108-109`).

**Ouverts**
- **I-SP-1** (déclencheur révisé : l'événement de DÉPLOIEMENT, §7 ; l'ancien déclencheur `mint_start-NVDAx` est passé sous l'époque « pre-shortpage », `docs/course-bell/ANCHORS.md:51`) : cellule « époque shortpage » de la première ancre posée après le ré-épinglage, et vérification de l'arbre d'exécution (§7 (ii)).
- **I-SP-2** (déclencheur inchangé : premier STOP `not_full_pages` dont `short_final_page_probe.probe_empty` vaut `false` sur un tirage réel, c'est-à-dire une troncature confirmée) : lecture sur place de la documentation Helius `getTransactionsForAddress` (sémantique du `paginationToken`). La règle n'en dépend pas, puisque C-8 décide ; la lecture est un acte de l'orchestrateur (règle « lecture sur place »). Fait de première main acquis depuis la v1 : token sur la vraie dernière page, 2 mints sur 2 (§3).
- **I-SP-3** (déclencheur révisé : le premier `mint_end` tiré sous l'époque shortpage) : consigner la première valeur réelle de `short_final_page_probe`, première mesure de première main de la règle.
- **R-SP-1** (résidu pré-existant, non introduit) : une omission intra-page reste indétectable, que la page soit pleine ou courte. Chemin existant : recoupement de N par gSFA (phase B -iii, D1-septies l.381, *upcoming*). Déclencheur : cette phase.
- **R-SP-2** (pré-existant) : back-fill fournisseur (tx `≤ oracle_slot` apparues après une page prouvée finale). Le cas valait déjà pour une page finale sans token. C-8 re-décide à chaque run (re-vérification terminale : `…idempotent_reverification`, `T:1518`).
- **R-SP-3** (résidu nouveau ; source : G2 C-G2-4 (e), `docs/G2-lot-bell-shortpage-1.md:77`) : la provenance `short_final_page_probe` est écrite PAR invocation ; une ré-invocation terminale l'écrase (dans `T:1518`, la provenance du commit, page 2 et `committed:true`, devient page 3 et `committed:false`, `T:1534`), alors que N, pages et `ledger_sha256` restent identiques. Contre-mesure de procédure : poser l'ancre `mint_end` — son manifeste hache `crosscheck-<MINT>.json` (`docs/course-bell/ANCHORS.md:27`) — AVANT toute ré-invocation du même mint. Déclencheur : chaque `mint_end` sous l'époque shortpage.
- **R-C6-1** (réécrit ; sources : bloc (c) du micro-pli ; re-G2 C-1b-3 (ii), `docs/G2-lot-bell-shortpage-1-1b.md:62` ; mesure GARDE-FSYNC-1, `docs/CHANTIERS.md:917`, `docs/CHANTIERS.md:948`) :
  - **Sourcé** : après une coupure, chaque fichier visible a un contenu complet — le `.tmp` est `fsync`é (`FlushFileBuffers`) avant le rename (`docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:7-16`) ; la persistance du RENOMMAGE lui-même n'est PAS garantie par l'API appelée (`MoveFileExW` sans `MOVEFILE_WRITE_THROUGH`, `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:18-34`).
  - **Hypothèse d'environnement NON sourcée** : que l'état du nom après coupure soit exactement « ancien fichier complet OU nouveau fichier complet » (exclusivité). Les pages lues (FAITS §1-§2) ne l'établissent pas ; la phrase du FAITS §4 (`docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:40-42`) est une conclusion de l'orchestrateur. L'affirmation « NTFS journalise la méta » de la v1 est RETIRÉE (non sourcée, `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:42-43`).
  - **Reprise fail-closed si `budget.json` manque** alors qu'un ledger existe : `readPriorCalls` (a) lève (`:577-580` ; `bell_crosscheck_readPriorCalls_binds_to_ledger`, `T:468`).
  - Un rename perdu peut laisser `budget.json` à la page N−1 alors que la ligne N du ledger est durable. `readPriorCalls` (b) ne lève (`:587-589`) que si `calls_used` est inférieur aux pages sur disque ; sinon la reprise **sous-compte au plus les appels d'une page** dans `budget.json` : dérive BORNÉE de la provenance et du plafond de tentatives par run. Ce n'est **pas** un dépassement : le garde d'argent est le ledger de cycle rpc-guard, au prior gelé à l'ouverture (D-6), dont la durabilité relève de GARDE-FSYNC-1.
  - **Le `fsync` du répertoire parent n'est pas fait ; il est POSSIBLE sous win32** — mesure du G1 GARDE-FSYNC-1 : `openSync(dir, "r+")` puis `fsyncSync` ⇒ OK (`"r"` ⇒ `EPERM`), p50 0,105 ms (`docs/G1-lot-garde-fsync-1-integral.md:139`) ; son effet de durabilité n'est pas vérifié (`docs/G1-lot-garde-fsync-1-integral.md:178`). La justification « non portable win32 » de la v1 (et de la JSDoc `writeDurable`, `:661-664`) est FAUSSE et retirée.
  - Items : **I-1** (fsync du répertoire parent ; formé au G1 GARDE-FSYNC-1, `docs/G1-lot-garde-fsync-1.md:80`, déclencheur : avant le 2ᵉ redéploiement VPS) est étendu au `writeDurable` Bell et y est réalisé au plus tard avec DURABLE-FS-UNIFY (une primitive, un fsync de répertoire), au premier des deux ; **R-C6-1-T** (test exigé par `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:46-47` : `budget.json` à N−1 et ligne N durable ⇒ reprise fail-closed ou sous-compte borné, jamais un double compte ; déclencheur : G7 de GARDE-FSYNC-1, où l'ordre ou le couplage `budget.json`/ligne est revu) ; **R-C6-1-DOC** (commentaire seul : la JSDoc `writeDurable` `:661-664` dit encore « not portable to win32 » ; même déclencheur que CP2-C1-bis).
- **R-C6-2** (réécrit ; sources : bloc (c) du micro-pli ; `docs/course-bell/RUNBOOK-supervision-tirage.md:23-27` ; `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:37-39`) : sous win32, un rename échoue `EPERM` si un lecteur QUELCONQUE tient la cible (mesuré) ; la mention « lecteur non-Node » de la v1 est fausse et retirée. Contre-mesure code LIVRÉE (R-SP-A, §6) ; contre-mesure procédure maintenue (RUNBOOK §2) ; résidu : un lecteur tenu plus de ≈ 3 s provoque un STOP fail-closed sans perte (`DurableWriteError`). Revue du plafond : R-SP-A-1.
- **R-SP-A-1** (déclencheur : première `DurableWriteError` d'un tirage réel) : revoir le plafond de 3 000 ms. graceful-fs documente des verrous antivirus « for up to a minute » (commentaire de `polyfills.js:91-92`) ; notre `.tmp` est une entrée neuve à chaque écriture. Le plafond actuel reprend l'expérience mesurée de l'orchestrateur (retry toutes les 100 ms, plafond 3 s, `docs/course-bell/RUNBOOK-supervision-tirage.md:21`) ; tout relèvement est une décision de valeur (durée de blocage d'une page).
- **DURABLE-FS-UNIFY** (déclencheur : G7 du second des deux lots {BELL-SHORTPAGE-1, GARDE-FSYNC-1}, soit celui de GARDE-FSYNC-1) : GARDE-FSYNC-1 porte son propre retry borné pour la garde rpc-guard (`docs/CHANTIERS.md:917`) ; deux primitives durables et deux erreurs de plafond coexisteront. Unifier la primitive et la classe d'erreur (une classe canonique ré-exportée, mutant « classe locale restaurée », consigne C-1), y inclure le fsync du répertoire (I-1) ; toute attribution du backoff à graceful-fs y dit « forme seulement » (graceful-fs ne réessaie pas sur une cible présente, `docs/CHANTIERS.md:933`).
- **CI-POSIX-1b** (déclencheur : premier run CI de la PR, avec préavis investisseur, décision 136) : constater que `T:1755` et `T:1786` passent aussi par la branche d'émulation POSIX sur `ubuntu-latest` ; risque réduit (branche forcée verte sur win32, `docs/G2-lot-bell-shortpage-1-1b.md:39`).
- **CP2-C1-bis** (déclencheur : prochain lot de code Bell qui touche `rebase-crosscheck.ts` ; commentaire seul) : `:242` « absent when no probe was made » → « absent when no probe decision was reached » (`docs/CHANTIERS.md:934`).
- **C-1b-1** (tests seulement, ≈ 2 lignes ; déclencheur : prochain toucher de `apps/bell/test/rebase-crosscheck.test.ts`) : coupe-circuit sur le nombre de tentatives dans les coutures `renameAttemptSync` de `T:1786` et `T:1816` (au-delà d'un seuil nommé ⇒ erreur « runaway ») ; motif : X02 (§9) (source : `docs/G2-lot-bell-shortpage-1-1b.md:50-54`).
- **C-1b-2** (tests seulement, ≈ 34 lignes ; même déclencheur) : épingler les quatre affirmations déclaratives du §6 — `ENOENT` après un premier `EPERM` relancé tel quel (X05), `code` = code réellement refusé hors `EPERM` (X07), `cause` conservée (X13), message sans le chemin de `--out` (X12) (source : `docs/G2-lot-bell-shortpage-1-1b.md:55-59`).
- **RUNBOOK-SUP-1** (déclencheur : prochaine édition du RUNBOOK de supervision OU prochaine reprise post-crash, au premier des deux ; source : observation du re-G2, `docs/G2-lot-bell-shortpage-1-1b.md:80`, et relevé du repli) : (a) RUNBOOK §2 : le ledger n'est pas strictement append-only — à une reprise post-crash, la troncature C-B-5 le REMPLACE par rename (`:686`) ; un `tail` resté ouvert fait tomber la reprise en `DurableWriteError` après ≈ 3 s ⇒ ajouter « fermer tout lecteur du ledger avant une reprise post-crash » ; (b) le RUNBOOK §1 (`docs/course-bell/RUNBOOK-supervision-tirage.md:28`) cite encore « ≈ 3 ms par `writeDurable`, ADR §4 » et « ~296 k fois (SPYx) » : l'aligner sur le §5 (mesure du G2 ; 295 700 = plafond).
- **CI-YML-1** (déclencheur : prochain toucher de `.github/workflows/ci.yml`, ou C-1b-1 qui rend le cas nommé ; source : `docs/G2-lot-bell-shortpage-1-1b.md:81`) : le commentaire de `.github/workflows/ci.yml:24-27` (« `--test-timeout` … is the finer per-test guard ») est faux pour une boucle synchrone.
- **O-1 du G2** (`ledgerPagesOnDisk` compte une queue NUL comme une page ; `docs/G2-lot-bell-shortpage-1.md:107`) : repris tel que formé — à joindre au RUNBOOK de GARDE-FSYNC-1 (déclencheur : son G7).

### 11. Traçabilité des corrections repliées (correction → source → emplacement → `error_origin` → état)
Les `error_origin` marqués « adjugé » sont ceux de l'orchestrateur au G7, reportés dans l'entrée G7 de `docs/CHANTIERS.md` ; les autres sont proposés par le repli et valent adjudication par l'insertion de ce texte (R-21).

| correction | source | emplacement | `error_origin` | état |
|---|---|---|---|---|
| STOP de fin de mint (motif du lot) | `docs/CHANTIERS.md:817-819` | §3, §4 | **plan** (adjugé) : b1a / option (d) n'avait pas prévu un token sur la dernière page, pourtant annoncé comme possible (`docs/CHECKPOINT2-lot-t1a-ii-b3d-b1a.md:71`) | relaxation §4 |
| ruling C-6 (durabilité) | `docs/CHANTIERS.md:865`, `docs/CHANTIERS.md:889` | §5 | **plan + infrastructure** (adjugé ; `docs/CHANTIERS.md:892`) : C-B-5 couvrait l'arrêt de processus, pas la perte d'alimentation | livré (`e5dfbb4`, `f5fc682`) |
| R-SP-A / BELL-RENAME-RETRY-1 (lecteur concurrent ⇒ `EPERM`) | `docs/CHANTIERS.md:893-894` ; RUNBOOK §3 | §6 | rattaché à C-6 : **plan + infrastructure** (le ruling C-6 ne prévoyait pas le lecteur de supervision) | livré (`f5fc682`) |
| cp-1 C-1..C-5 (ordre, rattachement ADR, tests, MAST, core) | `docs/CHECKPOINT1-lot-bell-shortpage-1.md:40-44` | §2, §4, §8, §9 | **plan** (défauts du plan attrapés au checkpoint du plan) | fermées au G1 |
| cp-2 C-1 = G2 C-G2-4 (d) (sémantique de `null` ; refus sonde ≠ refus ancre) | `docs/CHECKPOINT2-lot-bell-shortpage-1.md:46,60` ; `docs/G2-lot-bell-shortpage-1.md:76` | §4 « Provenance » | **G1** (v1 auto-contradictoire ; commentaire de l'artefact) | texte : ce repli ; code : `f5fc682` ; reste CP2-C1-bis |
| cp-2 C-2 = G2 C-G2-4 (b) (I-SP-4 périmé ; citer l'INCIDENT) | `docs/CHECKPOINT2-lot-bell-shortpage-1.md:61` ; `docs/G2-lot-bell-shortpage-1.md:74` | §5 « Fait » ; §10 | **G1** (dépôt non relu : INCIDENT en dépôt depuis 20:50 UTC, avant la v1) | clos |
| cp-2 C-3 = G2 C-G2-4 (c) (I-SP-5 périmé) | `docs/CHECKPOINT2-lot-bell-shortpage-1.md:62` ; `docs/G2-lot-bell-shortpage-1.md:75` | §10 | **G1** (checkpoint-1 tracké depuis 20:14 UTC, avant la v1) | clos |
| cp-2 C-4 (runbook) ; libellés « lecteur non-Node » / « Node ou Git-Bash seulement » | `docs/CHECKPOINT2-lot-bell-shortpage-1.md:52,63` ; `docs/course-bell/RUNBOOK-supervision-tirage.md:23-27` | §10 R-C6-2 | libellé : **G1 / cp-2** (adjugé ; corrigé par le fait mesuré `docs/CHANTIERS.md:893`) | RUNBOOK `91a719b` ; R-C6-2 réécrit |
| cp-2 C-5 (arbre d'exécution dans la D-n) | `docs/CHECKPOINT2-lot-bell-shortpage-1.md:54,64` | §7 (i)-(ii) | **plan** (D-n dictée par le checkpoint-1 sans désigner l'arbre ; fait mesuré `docs/CHANTIERS.md:893`) | tranchée par R-SP-C |
| escalade pré-cadrée du cp-2 (déploiement à une reprise post-crash) | `docs/CHECKPOINT2-lot-bell-shortpage-1.md:65` | §7 (i) | n-a (question de valeur, pas un défaut) | tranchée : R-SP-C sous 137 |
| G2 C-G2-1 (sonde non vide AVEC token) | `docs/G2-lot-bell-shortpage-1.md:51-53` | §4 (i) ; §8 | **G1** (adjugé) | fermée au micro-pli (`T:1633`) |
| G2 C-G2-2 (a)(b)(c) (ancre C-8 épinglée) | `docs/G2-lot-bell-shortpage-1.md:54-61` | §4 (ii) ; §8 | **G1** (adjugé) | fermée au micro-pli (`T:1644`, `T:1660`, `T:1671`) |
| G2 C-G2-3 (a)(b)(c) (C-6 : ordre, troncature, densité) | `docs/G2-lot-bell-shortpage-1.md:62-68` | §5 | **G1** (adjugé) | fermée au micro-pli (`T:1689`, `T:1706`, `T:1724`) |
| G2 C-G2-4 (a) (coût : « ≈ 5 ms / 25 min », « ~296 k » compté) | `docs/G2-lot-bell-shortpage-1.md:70-72` | §5 « Coût mesuré » | **G1** (adjugé : libellés de coût) | fermée (ce repli) |
| G2 C-G2-4 (a) (hypothèse NTFS non sourcée) | `docs/G2-lot-bell-shortpage-1.md:73` | §10 R-C6-1 | **G1** (affirmation non sourcée) | retirée |
| G2 C-G2-4 (e) (résidu R-SP-3) | `docs/G2-lot-bell-shortpage-1.md:77` | §10 R-SP-3 | **G1** (résidu visible dans son propre test (d), non déclaré) | déclaré |
| re-G2 C-1b-1 (X02 pend) | `docs/G2-lot-bell-shortpage-1-1b.md:50-54` | §9 ; §10 | **micro-pli** (coupe-circuit placé dans `sleepSync` seulement) | item |
| re-G2 C-1b-2 (4 affirmations déclaratives) | `docs/G2-lot-bell-shortpage-1-1b.md:55-59` | §6 ; §10 | **micro-pli** (affirmations sans test tueur) | item |
| re-G2 C-1b-3 (i) (« 8 sites » → 7 + 1) | `docs/G2-lot-bell-shortpage-1-1b.md:61` | §5 ; §8 | **micro-pli** (décompte du bloc (b)) | fermée (ce repli) |
| re-G2 C-1b-3 (ii) (exclusivité « ancien OU nouveau » non sourcée) | `docs/G2-lot-bell-shortpage-1-1b.md:62` | §10 R-C6-1 | **orchestrateur** (conclusion du FAITS §4) repris sans réserve par le **micro-pli** | fermée (ce repli) |
| re-G2 C-1b-3 (iii) (item cp-2 C-1 périmé) | `docs/G2-lot-bell-shortpage-1-1b.md:63` | §10 « Clos » | n-a (périmé par un ruling postérieur au bloc) | clos |
| re-G2 C-G2-4 reconduite (a)-(e) | `docs/G2-lot-bell-shortpage-1-1b.md:64-72` | §4, §5, §10 | voir les lignes C-G2-4 ci-dessus | fermée (ce repli) |
| GARDE-FSYNC-1 : fsync de répertoire `"r+"` possible (« non portable win32 » faux) | `docs/G1-lot-garde-fsync-1.md:68` ; `docs/G1-lot-garde-fsync-1-integral.md:139,178` ; `docs/CHANTIERS.md:917,948` | §10 R-C6-1 | **G1** (affirmation non mesurée, reprise dans la JSDoc `:661-664`) ; même prémisse dans la mission GARDE-FSYNC-1 (**plan**) | retirée ; items I-1, R-C6-1-DOC |
| précondition secret-scan (cible rouge) | `docs/CHECKPOINT2-lot-bell-shortpage-1-1b.md:38` ; `docs/CHANTIERS.md:942` | §1 | **orchestrateur** (adjugé : persistance d'un rendu sans rejouer le scan) | purgé (`7f05c08`) |
| R-25 617 > cible 600 | `docs/G2-lot-bell-shortpage-1-1b.md:76` | §1 | n-a (cible de mission indicative ; R-SP-A ajouté après le plan du lot) | accepté : dépassement déclaré de la cible, pas une dérogation (`docs/CHANTIERS.md:951`, `docs/CHANTIERS.md:958`) |
| observation re-G2 RUNBOOK §2 ; renvoi périmé du RUNBOOK §1 au coût de la v1 | `docs/G2-lot-bell-shortpage-1-1b.md:80` ; `docs/course-bell/RUNBOOK-supervision-tirage.md:28` | §10 RUNBOOK-SUP-1 | **orchestrateur** (RUNBOOK rédigé sur la v1) | item |
| observation re-G2 sur `.github/workflows/ci.yml:24-27` | `docs/G2-lot-bell-shortpage-1-1b.md:81` | §10 CI-YML-1 | pré-existant, hors lot | item |

## Amendement 2026-09-23 — fait (iii) : définition de D1 (l.16) remplacée (lot BELL-ADV-1)

La cellule D1 du lot T-1a-ii-a (l.16) écrit « vs plafond = ADV consolidé mois précédent via Polygon `v2/aggs/ticker/{T}/range/1/day`
([2nd] déclaré, unité actions, résidu `multiplier_unit`) ». Le code livré par ce lot n'y était pas conforme (fenêtre glissante de 45 jours,
total de fenêtre, un ratio par symbole ; `error_origin` : plan T-1a-ii). La définition de (iii) est désormais celle de l'amendement
ADR-B0 du 2026-09-23 (BELL-ADV-1). Rappel :
- une entrée par session ;
- `vol_ratio` = S / A ; S = volume de la session en actions, au multiplicateur en vigueur à chaque fill ; A = ADV du mois civil qui
  précède `session_date_et`, en barres Massive `adjusted=false` couvrant exactement les jours de bourse du calendrier committé ;
- abstentions `no_adv` et `no_multiplier` nommées et comptées ;
- `window`, `adv_period`, `n_bars`, `n_trading_days`, `formula` publiés ; l'ADV n'est jamais publié.

Les **tuyaux** et les **items** formés sont ceux de l'amendement ADR-B0 (même lot, même date). Les tests de D1 (l.16) restent verts ; le
re-pin de `bell_collector_replays_fixture_bit_identical` est prouvé par substitution. Les deux abstentions sont fermées par les nouveaux
tests de `apps/bell/test/bell-adv-1.test.ts`.

---
