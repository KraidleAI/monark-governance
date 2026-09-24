Modèle résolu : claude-opus-5-5[1m]

# G1 — LOT BELL-ADV-1 : ratio Q6 de Bell aligné sur l'ordre SEC 34-106402 II.F ; abstentions `no_adv` / `no_multiplier` nommées et comptées

- Worker : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, décision 133), effort max. Aucun commit (R-20), aucun workflow.
- Worktree : `F:\Monark-wt-belladv1`, branche `lot/bell-adv-1` @ `d0535cb638ba87b78c56d48a061e220c1d6a1fd7` (HEAD inchangé ; le lot
  est dans l'arbre de travail : 8 fichiers modifiés et 1 nouveau).
- Items : I-v3-1, I-G2-1, I-G2-3 (`docs/CHANTIERS.md`, entrées SEC 4-927 de 06:38 et 07:29 UTC) ; `docs/sec-4927/RENDU-v3.md` V3-5 ;
  `docs/sec-4927/G2-TEXTE-v3.md` C-G2-1, O-8.
- Temporaires et preuves : `F:\tmp\belladv1\` (TEMP/TMP/TMPDIR = `F:\tmp\belladv1\tmp`). Consigne : `docs/CONSIGNE-STANDARD-G1.md`.

## 0. Journal (`date -u`)

- 10:47:39Z : orientation. Worktree propre, HEAD `d0535cb`. Un `git status` lancé sans `GIT_OPTIONAL_LOCKS=0` (incident I-1, §11).
- ~10:50Z : `npm ci --ignore-scripts --cache F:/tmp/npm-cache` (ceinture A-7), exit 0. `require.resolve('@monark/rpc-guard')` =
  `F:\Monark-wt-belladv1\packages\rpc-guard\src\index.ts` (dans le worktree, A-2).
- ~10:52Z : A-6 AVANT : les 9 sha gelés (`docs/PLAN-u4b-prereg.md` §2) égalent la table, en blob HEAD comme en fichier
  (`a6-before.txt`).
- ~10:55Z : lecture de la page Massive « Custom Bars (OHLC) » (firecrawl, `maxAge: 0`, statusCode 200 ; documentation, pas une API de
  données).
- 10:58:05Z : sha AVANT des fichiers Bell (`bell-before.txt`). `collect.ts` `67d7091f…9fb1` = celui de la sonde G2.
- ~11:0xZ : capture AVANT de l'entrée volume de la fixture épinglée (`old-volume-entry.mts` → `.out`) ; advisor n°1 (§0bis).
- ~11:1xZ : conflit posé par écrit ; advisor n°2 (conciliation).
- 11:1xZ-11:25:41Z : code et tests (outils Edit/Write, A-13). Typecheck exit 0 ; les 3 fichiers de test du lot : 45/45.
- 11:27:33Z : mutants, passe 1 : 20/20 tués par le test visé.
- 11:28:51Z-11:30:50Z : oracle, passe 1 : `test` exit 1 et `lang:gate` exit 1. Mes noms `mon`/`Mon` et « EST » sont dans la liste de
  mots français de la gate (D-11). Corrigés.
- 11:31:36Z-11:34:01Z : oracle, passe 2 : 7 × exit 0.
- 11:35:10Z : mutants, passe 2 : 22/22 (M21 et M22 ajoutés pour `bell_ratio_killer_adv_and_unit`) ; A-9, passe 1 : 3/3 rouges.
- ~11:36Z : trois tirets longs (non ASCII) de mes commentaires remplacés (F-2 ; commentaires seulement).
- 11:37:17Z-11:40:47Z : oracle FINAL sur les octets livrés, 7 × exit 0 ; puis mutants FINAUX 22/22 (11:40:47Z) et A-9 FINAL 3/3
  (11:40:58Z).
- 11:41:51Z : R-25 = 775 ; A-6 APRÈS 9/9 identiques ; diffstat `apps/sentinel packages scripts` vide ; `DELIVERED.sha256` écrit et
  vérifié (`sha256sum -c`, 9 × OK).
- ~11:42Z : comptage de base lancé sur l'arbre `d0535cb` (git archive, `npm ci` propre) ; journal de test horodaté 11:45:43Z :
  1 058 / 1 056 / 0 / 2 (§6).
- ~11:45Z : `G1.md` et `ADR-amendement.md` rendus durables, puis advisor n°3 (revue finale, §13).
- ~11:48Z : rejeu A-9 avec les sha imprimés, 3/3, restaurations octet pour octet ; 11:48:26Z : `sha256sum -c DELIVERED.sha256`, 9 × OK.
- ~11:5xZ : points 2 à 5 de l'avis n°3 intégrés au rendu et à l'amendement ; sha des livrables texte calculés (message final).

## 0bis. Consultations advisor (outil intégré, canal 1 ; avis, jamais verdict)

- **n°1 (~11:0xZ, après l'orientation) : 10 points.**
  - Suivis : garde `CLOSE_KEY` étendue par `(?<!no_)adv`. Sans elle, le compteur `no_adv` fait rougir `bellSha` et `bell-report`.
  - Suivis : barres datées par `t`, requête d'un mois exact, suffisance = couverture exacte du calendrier committé.
  - Suivis : multiplicateur tiré de la même preuve que g_t ; une entrée par groupe de session ; `formula` ASCII sans `%`.
  - Suivis : re-pin par substitution ; R-25 mesuré sur l'arbre de travail ; re-clé du bouchon `adjusted=false` du test runMain existant.
  - Écarté : l'avis n°3 (« appliquer `refCloseDateOf` à la lettre ») — voir n°2.
- **n°2 (~11:1xZ, conciliation ; le conflit est écrit dans le transcript avant l'appel).** L'advisor retire l'avis n°3 : la contrainte qui
  tranche est le livrable 3, qui exige que « prior month » redevienne vrai. Ajouts suivis :
  - citer la note 69 ;
  - épingler deux cas hors séance à cheval sur un mois (mutant M3, « mois civil de l'horodatage ») ;
  - former l'hypothèse « début du jour SIP = 04:00 ET » en item (ADV-SIP-DAY-1) ;
  - `error_origin` de la parenthèse = orchestrateur.
- **n°3 : revue finale avant clôture**, après que les livrables sont durables (§13).

## 1. Sources (niveau, localisation)

- [lu] Ordre SEC 34-106402, `F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt`, sha256
  `adee69f69189aee2031773337f5e251963c2dfba85ea37be8b6a226e40b4d08d` :
  - II.F, p.24 l.897-906 : limites de 0,25 % / 2,5 % de « the average daily share volume during the prior month … as reported by an
    effective transaction reporting plan » ; le pourcentage a pour numérateur l'ADV du jeton sur le TSV et pour dénominateur l'ADV de
    l'action (ADV/ADV).
  - Note 67, p.24 : « as reported » = plans CTA/CQ et UTP.
  - Note 69, p.25 l.959-963 : « the next trade date will start concurrently with when trades must be reported to the SIP ».
  - Note 72, p.25 : moyennes mensuelles pondérées « based on the number of trading days in each month ».
  - Note 81, p.29 l.1129-1131 : volume journalier de publication II.G (24 h avant la publication) ; il ne s'applique pas à II.F.
  - p.26-27 : dépassement, pause de trois mois, « miscalculation in either a numerator or denominator ».
  - Q6, p.58 l.2057-2064.
- [lu] Massive (ex-Polygon), « Custom Bars (OHLC) », `https://massive.com/docs/rest/stocks/aggregates/custom-bars`, firecrawl
  `maxAge: 0`, statusCode 200, 2026-09-23 ~10:55Z. Citations (≤ 25 mots) :
  - « over a custom date range and time interval in Eastern Time (ET) » ;
  - « If no eligible trades occur within a given timeframe, no aggregate bar is produced » ;
  - `t` : « The Unix millisecond timestamp for the start of the aggregate window » ;
  - `v` : « The trading volume of the symbol in the given time period » ;
  - `adjusted` : « By default, results are adjusted » ;
  - `limit` : « Limits the number of base aggregates queried to create the aggregate results. Max 50000 and Default 5000 » ;
  - `queryCount` : « The number of aggregates (minute or day) used to generate the response » ;
  - exemple : `t: 1577941200000` (= 2020-01-02T05:00:00Z = minuit EST) ; deux résultats journaliers pour `queryCount: 2` ; clés
    `adjusted, next_url, queryCount, request_id, results[{c,h,l,n,o,t,v,vw}], resultsCount, status, ticker` ; hôte des exemples
    `https://api.massive.com`.
  - NON établi par la page : que `v` soit le volume consolidé du SIP (« Aggregates are constructed exclusively from qualifying trades
    that meet specific conditions »). I-G2-5 reste ouvert.
- [lu] Code à HEAD : `apps/bell/src/{collect,volume,sessions,residuals,digest,close,supply,gap,rebase-trajectory}.ts`,
  `apps/bell/scripts/bell-report.mjs` (+ `.d.mts`), `apps/bell/test/{collect,guard-collect-1bii,report,rebase-gate-gt}.test.ts`,
  `packages/rpc-guard/src/transport.ts` l.93-113.
- [lu] Documents : `docs/CHANTIERS.md` l.1016-1040 ; `docs/sec-4927/RENDU-v3.md` V3-5, D-v3-2, D-v3-3 ; `docs/sec-4927/G2-TEXTE-v3.md`
  C-G2-1, O-8, O-20, I-G2-1..5 ; `docs/sec-4927/LETTRE-4-927-v3.md` l.29, l.48, l.59, l.64, l.82 ; `docs/sec-4927/SOURCES.md` Q6-1..4,
  M-9 ; `docs/adr/ADR-B0-programme-bell.md` D2 (iii) l.30, D4, D6 ; `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` l.16,
  structure des amendements (§8 Tuyaux) ; `docs/PLAN-u4b-prereg.md` §2 ; `vocab-banned.json` (portée bell).
- Sonde G2 `F:\tmp\g2-sec-v3\probe-q6.mts`, sha `69f0a2a4…38f3` (= G2-TEXTE-v3 l.436), et sa sortie `probe-q6.out`
  (`fb7fa05e…2af7`). Cas A, B et D rejoués en assertions (tests 2 et 3, §5).

## 2. Livrables

| Fichier (relatif au worktree) | Nature | sha256 (octets livrés, LF) |
|---|---|---|
| `apps/bell/src/volume.ts` | réécrit : définition (iii) | `46fa184d36128fab9f773c9ae459f0d918500c212e0fef87b6d5085022a10ccc` |
| `apps/bell/src/collect.ts` | cœur par session, `ratioMultiplierOf`, lecteur mensuel `advBarsFor`, `adv_source` | `df00bdd1b3261f4f086ef0ba45baa26a1c5d0fc456066d489bc9883d68cc00c0` |
| `apps/bell/src/residuals.ts` | + `no_adv`, `no_multiplier` | `643f16a1982aa70fba50bb5d814c34ddd1ec557777cb7dc5108a662a2c9a3a4e` |
| `apps/bell/src/digest.ts` | `CLOSE_KEY` : `(?<!no_)adv` + commentaire | `e7ee1a25a0bb1859e67c34faf57e4d33a805af32c3c2493dc5ef8bb7aee2cef1` |
| `apps/bell/src/close.ts` | type `PolygonGet` : + `t?` | `764426a9097029ddb6e61e45d937c720872689562db2e8f8e0d87fb30e6e3f52` |
| `apps/bell/scripts/bell-report.mjs` | double déclaré de `CLOSE_KEY`, synchronisé | `d27b5e96542276fcb87f2fed9f6edeb63f1f7ae872fd400102a192eb1ca8ea91` |
| `apps/bell/test/bell-adv-1.test.ts` | NOUVEAU, 8 tests | `421a5fb9c979a400706fbe8ee984877b779de5bc6418322741469637d95f972e` |
| `apps/bell/test/collect.test.ts` | adapté (D-4, §5.2) | `69595cdb6338b9629f1bfae82c2e6a0f10cbdbef11e3d41987e3fea6bfb1148c` |
| `apps/bell/test/report.test.ts` | + 1 test | `3862f6755b6e43f643562bac5d03e24d3a060c7574b9e7f1fdac6d744a260182` |

- `F:\tmp\belladv1\DELIVERED.sha256` : octets de l'arbre de travail, compatible `sha256sum -c` depuis la racine du worktree (9 × OK à
  11:41Z).
- `F:\tmp\belladv1\DELIVERED-LF.sha256` : identique. Mesure dans node : 0 octet CR dans ces fichiers. Voir l'incident I-2 sur le faux
  compte de CR de `grep $'\r'`.
- `F:\tmp\belladv1\ADR-amendement.md` : amendements datés PROPOSÉS (non appliqués) pour ADR-B0 D2 (iii) et ADR-T1aii l.16, avec
  définition, formule, tuyaux, `error_origin` et items. On y trouve aussi le texte exact à substituer dans la lettre v3 (Q6, deux
  variantes ; « Dated periods » et « Named abstention » en option ; comptes de mots mesurés) et le texte proposé pour `/bell/method`.
- Preuves (A-12, chacune avec en-tête HEAD / node / commande) : `oracle/SUMMARY.txt` et les 7 journaux ; `mutants.mjs` →
  `mutants.out` ; `mutants-a9.mjs` → `mutants-a9.out` ; `r25.sh` → `r25.out` ; `a6-before.txt` / `a6-after.txt` ; `a13-check.mjs` ;
  `letter-q6.mjs` → `letter-q6.out` ; `base-count.sh` → `base-count/SUMMARY.txt`. Passes antérieures conservées : `oracle-run1/`,
  `oracle-run2/`, `mutants-run1.out`, `mutants-run2.out`, `mutants-a9-run1.out`.

## 3. Ce que calcule le code livré (définition exacte)

- **Une entrée par groupe de session** (`session`, `regime`, `session_date_et` de `classifySession`), dans `state.json` → `digest.volume[]` :
  - calculée : `{symbol, session, regime, session_date_et, window{from_utc_ms,to_utc_ms}, adv_period{year,month}, n, n_bars,
    n_trading_days, formula, vol_ratio, multiplier_unit}` ;
  - abstenue : les mêmes champs sans `vol_ratio` ni `multiplier_unit`, avec `abstain: [...]` (toutes les causes).
  - Les deux listes de clés sont fermées et testées (test 2).
- **`vol_ratio` = S / A** (`volumeRatio`, 10 décimales) :
  - S = Σ |baseDelta| / 10^baseDec × m(t), par fill de la session (`sessionShareVolume`) ;
  - A = Σv / n_bars sur les barres datées dans `adv_period` (`periodAdv`) ;
  - `adv_period` = mois civil précédant le mois de `session_date_et` (`advPeriodOf`).
- **m(t)** (`ratioMultiplierOf`, `collect.ts` l.109) :
  - porte `trajectory_known` ⇒ `multiplierAtMs` par fill ;
  - porte `constant` ⇒ son multiplicateur ;
  - porte `unverified` ⇒ `no_multiplier` ;
  - porte absente (rejeu seulement) ⇒ `mint.multiplier` s'il est fini et > 0 ;
  - mint absent ⇒ `no_multiplier`.
- **`no_adv`** : les barres de la période ne couvrent pas exactement les jours de bourse du calendrier committé (`tradingDaysOf`), ou le
  mois est hors `CALENDAR_RANGE` (`n_trading_days: null`).
- **Lecteur** (`advBarsFor`, `collect.ts` l.422) : une requête par période distincte des fills (`advPeriodsForFills`) :
  `/v2/aggs/ticker/{U}/range/1/day/{AAAA-MM-01}/{AAAA-MM-dernier}?adjusted=false&sort=asc&limit=50`, sous le budget de la jambe cash.
  Les barres sont datées par `barDateET(t)` (ET, heure d'été via Intl) ; une barre hors du mois demandé, ou sans `t`/`v` finis, est
  écartée.
- **`formula`** (`VOL_RATIO_FORMULA`, ASCII, publiée sur chaque entrée) : « vol_ratio = S / A; S = sum over this session's pool fills
  (session, regime, session_date_et; first and last fill in window) of abs(baseDelta) / 10^baseDec * m, m = shares-per-token
  multiplier in effect at the fill; A = sum(v) / n_bars over the unadjusted daily bars of the underlying dated in adv_period = the
  calendar month before session_date_et, one bar per NYSE trading day (n_bars = n_trading_days, else no_adv); unit = fraction of one
  average trading day of adv_period ».
- **Provenance** : `sources.adv_source = "massive-aggs-range-1-day-unadjusted"`.
- **Forme choisie (I-G2-3)**, avec sa formule, déclarée ci-dessus. Il s'agit du « volume de session rapporté à l'ADV ».
  - C'est la composante ADDITIVE du quotient II.F ADV/ADV. La somme des ratios des sessions d'un même `session_date_et` donne le
    volume du jour rapporté à l'ADV du mois précédent (vérifié par le test 4, 2,52e-6). La moyenne sur les jours de bourse d'un mois
    redonne la forme ADV/ADV.
  - Écartée : le « volume journalier moyen de la session » (débit / 24 h), non additif et dépendant des bornes. Mutant M9 rouge.

## 4. Décisions et écarts du worker (D-n : motivés, vérifiables, jamais un contournement)

- **D-1 — clé du mois = `session_date_et`, pas `refCloseDateOf` (`error_origin` : orchestrateur, ruling).**
  - Le ruling se contredit. En gras : « ADV du **mois civil précédent** la session ». Entre parenthèses : « … du mois M−1 de la date du
    close de référence de la session, `refCloseDateOf` ».
  - Divergence mesurée par les tests 1 et 5 :
    - regular 2025-10-01 ⇒ septembre (texte en gras) contre août (parenthèse) ;
    - regular 2026-01-02 ⇒ décembre 2025 contre novembre ;
    - regular 2025-11-03 ⇒ octobre contre septembre.
  - Arbitrage par le texte en gras :
    - le livrable 3 exige que « the prior month's » redevienne vrai ;
    - la note 69 fonde la convention d'ancrage ;
    - additivité par jour ;
    - aucune anticipation possible, M−1 étant clos avant M.
  - Alternative : une ligne (`advPeriodOf(refCloseDateOf(g.session, g.anchor))`), mutant M2 rouge.
  - Advisor : avis n°3 retiré à la conciliation.
- **D-2 — `adjusted=true` → `adjusted=false`.** II.F prend l'ADV « as reported » (note 67). Le cross du close utilisait déjà
  `adjusted=false`, et ADR-B0 D6 retient déjà la convention « non ajusté ». Résidu : ADV-SPLIT-1. Mutant M15 rouge.
- **D-3 — le multiplicateur du ratio est celui de la porte, pas la lecture ponctuelle du mint.** Le ruling dit « illisible ⇒
  `no_multiplier` ». Je l'étends à « non établi » :
  - porte `unverified`, et aucun multiplicateur au fill ⇒ `no_multiplier` ;
  - c'est l'asymétrie du cas D de C-G2-1, qui est fermée ;
  - la lettre dit « converted … with the on-chain shares-per-token multiplier ».
  - Conséquence déclarée : une course sans trajectoire publie des ratios abstenus `no_multiplier`, comme elle abstient déjà ses g_t
    (`rebase_unverified`).
  - Mutants M13 et M14 rouges.
- **D-4 — « N déclaré » = le nombre de jours de bourse du mois selon le calendrier committé**, publié par entrée (`n_trading_days`),
  avec une exigence de couverture EXACTE : ni N fixe, ni moyenne partielle. La note 72 de l'ordre moyenne par jours de bourse du
  mois. Mutants M7, M18 et M19 rouges.
- **D-5 — `abstain` est une LISTE de toutes les causes** (`["no_multiplier","no_adv"]`), chaque cause étant comptée. Motif : D8,
  « never bucketed in silence ». Les entrées d'écart gardent leur chaîne unique (inchangées).
- **D-6 — `window` = premier et dernier fill de la session.** C'est un fait haché ; les bornes de collecte, non hachées, restent dans
  `state.window`. Une session coupée par les bornes est rapportée sur sa partie observée (item ADV-SESSION-CUT-1).
- **D-7 — compteur `multiplier_unit` par symbole inchangé** (lecture du mint ≠ 1, règle (iii)/(iv)). Le drapeau par entrée dit si la
  conversion de CETTE session a utilisé m ≠ 1.
- **D-8 — `apps/bell/scripts/bell-report.mjs` modifié, alors que la mission ne le liste pas.** C'est le double déclaré de `CLOSE_KEY`.
  Sans la modification, le rapport aurait refusé TOUT `state.json`, désormais porteur de `no_adv`. Égalité des littéraux épinglée ;
  mutant M12 rouge. Chemin hors de la racine `scripts/` : le diffstat protégé reste vide.
- **D-9 — `buildSolanaSymbol` garde son paramètre `toUtcMs`, qui n'est plus lu** (fenêtre de 45 jours retirée). Motif : trois tests
  l'appellent par position ; le code le documente.
- **D-10 — ajout de `adv_source` en provenance** (calque `close_source`), sur avis de l'advisor. Mutant M20 rouge.
- **D-11 — défaut G1 du worker, corrigé avant livraison (`error_origin` : worker).** Mes noms `mon`/`Mon` et « EST » sont dans la liste
  de mots français de `lang:gate`, ce qui faisait échouer aussi `export_public_no_governance_no_french`. Renommés en
  `monday` / « UTC-5 » ; oracle rejoué.
- **D-12 — forme de la mesure R-25** (§7) : celle de l'arbre de travail, la forme littérale `d0535cb...HEAD` donnant 0 avant le commit
  de l'orchestrateur.
- **D-13 — `npm ci` (mission), pas `mk-nm.ps1` (A-2).** Les liens `@monark/*` résolvent dans le worktree (mesuré).
  - `npm ci` crée ses propres liens d'espace de travail : `node_modules/@monark/*` → `packages/*` et `apps/*` du MÊME worktree.
  - `node_modules` reste dans le worktree (ignoré par git) pour que G2 et checkpoint-2 puissent rejouer.
  - Retrait : `rm-nm.ps1` seulement, jamais `Remove-Item -Recurse`, qui traverserait ces liens.
  - Même remarque pour `F:\tmp\belladv1\base` (arbre de base pour le comptage, liens vers ses propres `packages`).

## 5. Tests

### 5.1 Nouveaux — `apps/bell/test/bell-adv-1.test.ts` (8) et `report.test.ts` (1)

| # | Test | Ce qu'il prouve (vecteurs non vides, valeurs dérivées à la main) | Mutants tueurs |
|---|---|---|---|
| 1 | `bell_adv_period_is_prior_calendar_month_of_session_day` | Changement de mois et d'année : (a) regular 10-01 ⇒ septembre ; (b) 02:00 ET du 10-01 = nuit du 09-30 ⇒ août ; (c) samedi 11-01 = week-end du 10-31 ⇒ septembre ; (d) 2026-01-02 ⇒ décembre 2025. Mois leurres à volumes différents. Comptes de jours comptés indépendamment (21/21/21/22). | M1, M2, M3 |
| 2 | `bell_no_adv_is_named_counted_and_ratio_absent` | Cas B de la sonde. Aucune barre ⇒ `["no_adv"]` sur 2 sessions, compté 2 (par session) dans le digest ET dans state. Variantes : un jour manquant, une barre de samedi en plus, un doublon, un volume nul, un mois hors calendrier (`n_trading_days: null`). Contrôle 2 × 1,5 / 1e6. Listes de clés fermées. | M4, M7, M18, M19 |
| 3 | `bell_no_multiplier_is_named_counted_never_one` | Cas A (mint absent) et D (porte réelle `rebaseForMint(undefined)` + close ⇒ écart `rebase_unverified` ET ratio `no_multiplier`) de la sonde. Porte `unverified` avec mint lisible ; chaînes `abc`, vide, `0`, `-1`, `Infinity` ; trajectoire postérieure au fill ; deux causes ⇒ deux codes, deux comptes ; contrôle porte `constant` 1,5. | M5, M6, M13 |
| 4 | `bell_vol_ratio_unit_is_session_share_volume_over_daily_adv` | I-G2-3 : 4 sessions (pre, regular, after du mercredi ; regular du jeudi). Multiplicateur par fill (1 → 1,02 entre deux fills) : 0,5 / 1,255 / 0,765 / 3,06 (e-6). Additivité du jour. `window` par session. | M8, M9, M14 |
| 5 | `bell_adv_bars_roll_across_months` | Fenêtre à cheval sur octobre et novembre : chaque session prend SON mois (2e6 contre 3e6), jamais l'union ; mois incomplet ⇒ seule la session concernée s'abstient ; `advPeriodsForFills` demande exactement les 2 mois. | M10 |
| 6 | `bell_vol_ratio_recomputable_from_published_entry` | Recalcul INDÉPENDANT depuis les champs publiés : sélection des fills par la règle de session, `window` = premier et dernier fill, `n`, `n_bars`. Sur la série réelle épinglée (8 fills, `0.0000019375`) et sur l'entrée multi-sessions du test 4. | M17 |
| 7 | `bell_no_adv_counter_passes_close_guard_adv_still_reddens` | `{no_adv}` vert ; `adv`, `advShares`, `adv_shares`, `x_adv` et `adv_period` numériques rouges ; un digest qui compte `no_adv` se hache et l'état passe la garde. | M11 |
| 8 | `bell_adv_leg_is_wired_runmain_guard_real_polygon_get` | **D-3 BRANCHÉ.** `runMain` → `openGuardedClient` réel + `polygonGet`/`databentoGet` réels ; SEUL `globalThis.fetch` est bouchonné. Corps Massive de forme documentée (A-8). Une seule requête (mars 2026, `adjusted=false`, clé en en-tête `Bearer`, jamais dans l'URL). Entrée écrite : mars 2026, 22 barres des deux côtés du passage à l'heure d'été, `0.0000005000`. `adv_source` en provenance ; la valeur de l'ADV (5e6) n'apparaît nulle part comme nombre. | M15, M16, M20 |
| 9 | `bell_report_accepts_named_adv_residuals_in_sync` (`report.test.ts`) | Tuyau aval réel : `collect()` → state → `aggregate()` somme `no_adv`/`no_multiplier` (2 + 2), refuse un `adv` numérique ; littéraux `CLOSE_KEY` de `digest.ts` et `bell-report.mjs` égaux octet pour octet. | M12 |

### 5.2 Adaptés — `collect.test.ts` (D-4 : diff annoté, aucune assertion affaiblie)

- `tslaxInput` : `advDailyVolumes: [1e6, 1.1e6, 0.9e6]` → `AUG_2026_BARS`. Ce sont 21 barres datées d'août 2026, cycliques sur les
  MÊMES trois volumes, de même moyenne 1e6. `−` : les 3 nombres non datés, que le nouveau type rejette ; `+` : leur version datée.
- `PINNED_BELL_SHA` : `0cfbed20…43d7` → `79a59086…7658f`.
  - `+` `PINNED_BELL_SHA_B3B` (l'ancienne valeur) et `PRE_LOT_VOLUME_ENTRY` (entrée capturée AVANT le lot, `old-volume-entry.out`).
  - `+` preuve par SUBSTITUTION dans `bell_pinned_sha_reduces_to_b3a_by_subtraction` : entrée volume remise, `no_adv`/`no_multiplier`
    retirés ⇒ `0cfbed20…` exactement. La soustraction -b3b suit, inchangée, vers `126abfae…`.
- `bell_abstentions_counted` : l'élément B `advDailyVolumes: [1000]` devient `[]` (nouveau type daté). `+` `no_adv === 1` et
  `no_multiplier === 0` ; les 13 assertions existantes sont conservées.
- `bell_ratio_killer_adv_and_unit` : `volumeToAdvRatio` (supprimé) → `sessionShareVolume` + `volumeRatio`. Correspondance un pour un :
  l'ADV change le ratio ; m ≠ 1 lève le drapeau ; m = 1 ne le lève pas ; adv ≤ 0 lève une exception. `+` NaN lève une exception ;
  m = 2 double les actions ; multiplicateur `null` ⇒ `null`. Les 5 assertions de garde sont conservées. Mutants M21 et M22.
- `bell_close_databento_replays_synthetic_fixture` : les deux jambes Massive sont désormais `adjusted=false`, donc le bouchon est
  re-clé sur la FORME du chemin (jour unique = cross ; mois = ADV) au lieu de `includes("adjusted=false")`. `+` : une seule requête ADV
  exacte (août 2026), un seul cross, `no_adv === 1` (corps non daté) ; tout l'existant est conservé.

## 6. Oracle (A-3 : codes capturés directement, `cmd > log 2>&1; rc=$?`, jamais après un tube ; ceinture A-7)

Script `F:\tmp\belladv1\oracle.sh`. Passe FINALE 11:37:17Z-11:40:47Z sur les octets livrés (HEAD `d0535cb` + arbre de travail du lot),
node v24.15.0, npm 11.12.1 :

| Gate | exit | Détail |
|---|---|---|
| `gate:vocab` | 0 | « scanned 227 file(s), no forbidden claim » |
| `typecheck` | 0 | `tsc --noEmit` |
| `test` | 0 | **1 067 tests / 1 065 pass / 0 fail / 2 skip** (skips préexistants : `sentinel_run_releases_chainstack_lock_on_sigterm` win32 ; `u4b_labels_replay_via_main_real_artifact`, artefacts e2 absents) |
| `lint` | 0 | eslint |
| `lint:ratchet` | 0 | 69/69 (plafond inchangé ; aucune violation différée ajoutée) |
| `lang:gate` | 0 | 0 occurrence non exemptée, portée bell comprise |
| `export:check` | 0 | 0 chemin interdit, 0 occurrence française |

**Base MESURÉE** sur l'arbre `d0535cb` (`base-count.sh`) :
- extraction : `git archive d0535cb` → `F:\tmp\belladv1\base`, `git get-tar-commit-id` = `d0535cb638ba…a1fd7` ;
- installation : `npm ci` propre, sans jonction ; `@monark/rpc-guard` résout dans `F:\tmp\belladv1\base\packages\…` ;
- `npm run test`, ceinture A-7, journal horodaté 11:45:43 UTC (12:45:43 +0100) : exit 0, **1 058 / 1 056 / 0 / 2**, mêmes deux skips.
- **1 067 = 1 058 + 9** (8 tests dans `bell-adv-1.test.ts`, 1 dans `report.test.ts` ; aucun retiré).

## 7. R-25 (A-5) — `F:\tmp\belladv1\r25.sh` → `r25.out`, pathspec VERBATIM de `.github/workflows/ci.yml:65`

- (a) forme littérale `git diff --shortstat d0535cb...HEAD -- <pathspec>` = **0**. HEAD = `d0535cb` : rien n'est committé (R-20).
- (b) arbre de travail contre `d0535cb` (fichiers suivis) : 8 fichiers, +318 / −87 = **405**.
- (c) fichier nouveau non suivi dans le pathspec : `apps/bell/test/bell-adv-1.test.ts` +370.
- **Total (b) + (c) = 775 ≤ 1 150.** C'est ce que CI mesurera après le commit de l'orchestrateur. Aucun seam n'est requis.

## 8. Invariants (A-6) et périmètre

- **9 sha gelés** (`docs/PLAN-u4b-prereg.md` §2), blob HEAD et fichier de travail en LF, AVANT (`a6-before.txt`) = APRÈS
  (`a6-after.txt`) : identiques 9/9, et égaux à la table §2 :
  - `2f9a31f6…` `u4b-scores.mjs`, `a5e66cd3…` `u4b-reduce.mjs`, `5733daeb…` `record-u4b-calib.mjs` ;
  - `7bee76fc…` `wadray.ts`, `3376eb08…` `abi.ts`, `9206df91…` `l1-split.ts`, `0e232519…` `apps/sentinel/src/rpc.ts` ;
  - `3603265d…` `calib-digest.ts`, `cb020425…` `u3-realized.mjs`.
- `git diff --stat d0535cb -- apps/sentinel packages scripts` : **VIDE** (0 octet, `diffstat-protected.txt`) ; aucun fichier non suivi
  sous ces racines.
- **Collecteur go-1 intouché.**
  - `rebase-crosscheck.ts` `15cc8773…`, `rebase-scan.ts` `1d3c892a…`, `rebase-produce.ts` `25a64a65…`, `rebase-trajectory.ts`
    `b831c087…` et `discover.ts` `c033ea4d…` : sha AVANT = APRÈS.
  - Carte des hunks de `collect.ts` (lignes anciennes) : 24, 52, 66, 100, 129, 189-199, 201, 259, 379-391, 559-560, 779, 803. AUCUN
    dans les branches `--rebase-*`/`--discover` (l.734-758 anciennes), ni dans `parseArgs`, `makeBudgetedCall`, `liveSolanaFills` ou la
    construction du client gardé. Ces branches retournent avant la jambe volume.
  - Le processus Bell SPYx (pid 102592, `F:\Monark-wt-bellexec` @ `a703e24`) et l'enregistreur Ukemi n'ont pas été touchés (arbres
    séparés).
- `sessions.ts` `6aaec1e6…`, `supply.ts` `b7352581…`, `gap.ts` : inchangés.

## 9. Mutants (A-11 / D-1) — `mutants.mjs` : reporter TAP, CRLF normalisé, attribution `byIntended`, restauration vérifiée par sha

- **Passe FINALE (11:40:47Z) : 22/22 tués par le test VISÉ**, 22/22 restaurations octet pour octet ; la base était verte.
- Liste :
  - M1 mois M au lieu de M−1 ; M2 clé `refCloseDateOf` ; M3 mois civil (UTC) du fill ;
  - M4 `no_adv` non compté ; M5 « 1 » par défaut restauré ; M6 `no_multiplier` non compté ;
  - M7 contrôle de couverture retiré ; M8 total de fenêtre restauré ; M9 forme débit par 24 h ;
  - M10 union des barres ; M11 garde du digest sans lookbehind ; M12 garde du rapport sans lookbehind ;
  - M13 porte `unverified` rabattue sur la lecture courante ; M14 un seul multiplicateur pour toute la trajectoire ;
  - M15 `adjusted=true` ; M16 date de barre à décalage EST fixe (naïf à l'heure d'été) ; M17 `window` sur tous les fills du symbole ;
  - M18 volume nul ou non fini accepté ; M19 contrôle de plage du calendrier retiré ; M20 `adv_source` retiré ;
  - M21 garde de `volumeRatio` affaiblie (NaN) ; M22 contrôle de multiplicateur nul retiré.
- Mutant ÉQUIVALENT déclaré, non compté : « date = date UTC de `t` ». Minuit ET (04:00Z/05:00Z) tombe le même jour UTC ; le mutant est
  indiscernable sur la forme documentée (avis advisor). M16 couvre le défaut réel (heure d'été).
- **A-9 (`mutants-a9.mjs`) : 3/3 rouges**, à 11:40:58Z puis à ~11:48Z (rejeu avec les sha imprimés, sur l'avis n°3).
  - Injection d'un mot interdit dans CHAQUE constante servie (`VOL_RATIO_FORMULA`, `ADV_SOURCE`, le commentaire du code `no_adv`).
    `gate:vocab` sort en exit 1 et nomme le fichier.
  - `mutants-a9.out` imprime `orig sha` et `restored sha` : `volume.ts` `46fa184d…` = `46fa184d…` ; `residuals.ts` `643f16a1…` =
    `643f16a1…`. Ce sont les valeurs de `DELIVERED.sha256`.
  - `sha256sum -c DELIVERED.sha256` est rejoué APRÈS ce rejeu (11:48:26Z) : 9 × OK.
  - Chaîne des écritures sur les fichiers livrés : édition ASCII (~11:36Z) → oracle final (11:37-11:40Z) → mutants finaux (11:40:47Z,
    restaurés) → A-9 (11:40:58Z et ~11:48Z, restaurés) → contrôles DELIVERED (11:41Z, 11:48:26Z). Aucune autre écriture.

## 10. Consigne standard, point par point

- **A-1** fait (1re ligne). **A-2** fait autrement (D-13 : `npm ci` exigé par la mission ; `require.resolve` dans le worktree).
- **A-3** fait (§6). **A-4** fait : `DELIVERED.sha256` ; rendu sous `F:\tmp\belladv1\` ; aucun commit.
  - Réseau : `npm ci` (registre des paquets, exigé par la mission, cache `F:/tmp/npm-cache`), et une lecture de DOCUMENTATION Massive
    (firecrawl). Aucune API de données appelée ; tous les tests sont bouchonnés, clés factices `p-fake`/`d-fake`, hôte
    `helius.example.invalid`.
  - Rien d'écrit volontairement sur `C:`.
- **A-5** fait (§7, 775). **A-6** fait (§8).
- **A-7** fait : `env -u …` sur chaque oracle, test, mutant et installation ; aucune variable affichée.
- **A-8** fait : test 8, corps Massive de forme documentée. Les corps Solana ont la forme des tests existants.
- **A-9** fait (§9). **A-10** fait : tests 6 et 8 (valeur ÉCRITE = recalcul indépendant) ; les mutants M9 et M14 altèrent la sortie et
  rougissent.
- **A-11** fait (§9). **A-12** fait : en-têtes des traces. **A-13** fait : tous les fichiers par Write/Edit ; `a13-check.mjs` recompte
  dans node chaque littéral à barre oblique inverse (7/7 présents une fois).
- **B-1..B-6** n-a : aucun corps d'opérateur payant journalisé ; aucune lecture de clé ajoutée (`readCashKeys` inchangé) ; aucun
  `fetch(` ni hôte ajouté dans `apps/bell/src`. La clé Massive reste en en-tête, ce que le test 8 asserte.
- **C-1..C-4** n-a : aucune classe d'erreur ni retry ajoutés. `withRetry` garde le refus de budget fatal. CASH-BUDGET-1 est déclaré.
- **D-1** fait : chaque test nouveau et chaque assertion ajoutée a un mutant tueur nommé. **D-2** fait : vecteurs non vides, listes de
  clés fermées, valeurs recalculées. **D-3** fait (test 8). **D-4** fait (§5.2).
- **E-1..E-3** n-a : aucun verrou, ledger ni cooldown touché.
- **F-1** fait : ligne « Tuyaux » dans `ADR-amendement.md` ; aucune source `F:\tmp` dans le texte d'ADR ; résidus nommés avec
  déclencheur.
- **F-2** fait : lignes ajoutées 100 % ASCII (mesuré) ; `gate:vocab` propre ; aucun « score ».
- **F-3** fait : D-n au §4 ; deux consultations advisor ; aucun contournement.
- **G-1** n-a pour un worker. Aucune pièce publique n'est touchée : registre, README, site et skill sont intacts, et Bell reste
  `upcoming`.

## 11. Items formés, observations, incidents

Items (le détail — propriétaire, déclencheur, usage — figure dans `ADR-amendement.md` §1) :
- I-G2-5 (inchangé, ouvert) ; ADV-SIP-DAY-1 ; ADV-SPLIT-1 ; ADV-CAL-2027 ; SUPPLY-READ-1 ; TSLAON-MULT-1 ; CASH-BUDGET-1 ;
  ADV-SESSION-CUT-1 ; MASSIVE-HOST-1.

Observations (aucune action requise par ce lot) :
- **O-1.** `formula` (≈ 480 caractères) est répétée sur CHAQUE entrée, comme le demandait la mission. Une course fondatrice de 4 mois
  en porterait quelques milliers. Option pour l'export T-1b : un identifiant de formule plus un texte unique.
- **O-2.** Avec `--eth`, TSLAx et TSLAon demandent chacun le mois de TSLA (deux GET payants pour les mêmes barres). C'est déjà le cas
  avant ce lot (un GET par symbole). Optimisation possible sous 1b-iii.
- **O-3.** Une session dont tous les fills ont `baseDelta` = 0 publie `vol_ratio` = 0 (un zéro mesuré), alors que son écart s'abstient
  `no_fill_in_window`. Pas de nouveau résidu.
- **O-5 (couverture exacte, D-4).** Une seule journée de bourse sans barre Massive met TOUT le mois en `no_adv`, donc toutes les sessions
  dont c'est la période ADV. C'est voulu (fail-closed) et visible sur chaque entrée (`n_bars` contre `n_trading_days`). À savoir avant
  la première course.
- **O-4.** À appliquer avec la lettre 3.1 : `docs/sec-4927/SOURCES.md` Q6-1 (l.68) cite `volume.ts` `d521dd87…` et « pour chaque
  session … mois précédent ». Ses sources deviennent `volume.ts` `46fa184d…`, `collect.ts` `df00bdd1…` et l'amendement ADR-B0 du
  2026-09-23. M-9 (l.85) gagne `no_adv` et `no_multiplier` (`residuals.ts` `643f16a1…`).

Incidents :
- **I-1 (`error_origin` : worker).** `git status` lancé à 10:47:39Z sans `GIT_OPTIONAL_LOCKS=0`. Seul l'index de CE worktree a pu voir
  son cache stat rafraîchi ; contenu inchangé (index = HEAD, status vide). Toutes les commandes git suivantes : `GIT_OPTIONAL_LOCKS=0`.
- **I-2 (sans effet, famille A-13).** `grep -c $'\r'` via l'outil Bash a « compté » des CR (140 pour `volume.ts`, etc.) ; la mesure
  dans node donne 0 octet CR. Le transport a altéré `\r`. Aucune décision n'en dépendait : le harnais normalise les CRLF et le
  mutant M19 n'embarque plus de fin de ligne.

## 12. Ce qui reste à l'orchestrateur (non fait ici, par règle)

- **Précondition de la course qui remplira Q6 (conséquence opérationnelle de D-3).** Sur le code livré :
  - sans `--rebase-trajectory`, la porte est `unverified` ; une collecte publie alors **100 % de `no_multiplier` et aucun ratio** ;
  - les tirages go-1 (`--rebase-crosscheck`) retournent avant la jambe volume et ne produisent aucun ratio ;
  - la course de Q6 est donc une collecte par défaut avec `--rebase-trajectory <fichier>` (écrit par `--rebase-produce`, C-8, pour
    chaque mint), et une porte `constant` ou `trajectory_known` sur chaque mint. Ceci est écrit dans la ligne « Entrée » des Tuyaux de
    `ADR-amendement.md` §1.
- Committer les 9 fichiers (R-20) ; G2 ‖ checkpoint-2 ; G7 sur l'arbre fusionné.
- Insérer les amendements proposés (`ADR-amendement.md` §1-2) et appliquer ou non les substitutions de la lettre (§3), avec rejeu de
  la mesure de pages (I-v3-6).
- Porter les items du §11 au CHANTIERS.

## 13. Clôture

- **Comptage de base** : MESURÉ, 1 058 / 1 056 / 0 / 2 ; 1 067 = 1 058 + 9 (§6).
- **Advisor n°3 (revue finale, ~11:45Z)**. Contrôles refaits à la main et trouvés justes :
  - comptes de jours des sept mois (21/21/23/19/22/21/22) ;
  - les quatre ancrages du test 1 ;
  - le passage de 1 à 1,02 entre r1 et r2 (1,255) ;
  - la substitution du re-pin (seuls `volume` et `residuals` changent) ;
  - la carte des hunks.
- **Points de l'advisor n°3, tous suivis sans changement de code** :
  - (1) ne pas clore avant le comptage de base : fait, 1 058 attendu = mesuré ;
  - (2) précondition `--rebase-trajectory` élevée au §12 et dans les Tuyaux de l'amendement ;
  - (3) variante B de la lettre ⇒ vérifier aussi la l.61 (« consolidated volume ») : noté dans `ADR-amendement.md` §3.1 ;
  - (4) sha de `residuals.ts` imprimés par un rejeu A-9, DELIVERED re-vérifié après (§9) ;
  - (5) observation O-5 (un jour manquant ⇒ tout le mois en `no_adv`).
- sha256 de ce rendu : donné dans le message final (un fichier ne peut pas contenir son propre sha). Ce fichier n'est plus modifié
  après le calcul.
