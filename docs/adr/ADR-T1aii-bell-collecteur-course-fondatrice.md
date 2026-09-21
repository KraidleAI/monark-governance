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

