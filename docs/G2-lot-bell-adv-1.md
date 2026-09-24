# G2 — lot BELL-ADV-1 (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-belladv1/G2.md` (sha256 7d7de794878a07dcebf579a105da7572588b02044550389648260523f217774e). Verdict : PASS-AVEC-CORRECTIONS (C-1 pli test-only : tueurs G3/G13/G14 ; C-2 texte ADR (a)-(d) à l'insertion) ; O-1..O-8.

---

Modèle résolu : claude-opus-5-5[1m]

# G2 — REVUE du lot BELL-ADV-1 (`lot/bell-adv-1` @ `290548c`, base `d0535cb`)

**Verdict : PASS-AVEC-CORRECTIONS** — code conforme à II.F et aux rulings D-1/D-2/D-3/D-8/D-11 (preuves rejouées, aucune valeur reprise du
G1) ; 2 corrections (liste fermée §7) : C-1 = 3 mutants survivants sur des gardes fail-closed du lot (tests seuls), C-2 = exactitude du
texte de l'amendement ADR proposé. Aucune correction ne touche la sémantique du code.

- Relecteur : `claude-opus-5-5[1m]`, effort max, contexte frais, instance séparée du worker G1. Aucune écriture dans `F:\Monark` ni
  `F:\Monark-wt-*` (sur `F:\Monark` : `branch --list`, `log`, `rev-parse`, `show`, `diff` commit..commit seulement — aucune ne rafraîchit
  l'index ; `git fetch` depuis le clone). Aucun commit (R-20), aucun workflow. Processus de course (Bell SPYx `F:\Monark-wt-bellexec`,
  recorder Ukemi) : jamais touchés.
- Clone isolé `F:\tmp\g2-belladv1\clone` (`git clone --no-hardlinks -b lot/bell-adv-1 F:/Monark`, HEAD `290548c628d0312d7e27e7826ab924ecec644d13`) ;
  worktrees du clone : `base` (`d0535cb`), `tip` (`lot/etude-suite` = `a0f47fe`, puis fusion à blanc), `mut` (`290548c`, mutants). `npm ci
  --ignore-scripts --cache F:/tmp/npm-cache` exit 0 dans chacun ; `@monark/rpc-guard` résout dans l'arbre même
  (`F:\tmp\g2-belladv1\<arbre>\packages\rpc-guard\src\index.ts`). TEMP/TMP/TMPDIR = `F:\tmp\g2-belladv1\tmp`. Ceinture A-7 (`env -u` des 8 clés)
  sur toute installation, oracle, test, sonde, mutant ; aucune variable affichée. Aucun appel à une API de données (une lecture de
  DOCUMENTATION Massive, §2).
- Preuves (sous `F:\tmp\g2-belladv1\`, en-têtes A-12 : arbre/HEAD, node, commande) : `oracle.sh` → `oracle-{lot,base,tip,merged}/` (SUMMARY,
  7 journaux, `test.tap`) ; `r25.mjs` → `r25.out` ; `probe/{probe-q6-lot,repin,semantics,honesty,killer-check}.mts`,
  `probe/{letter-check,killer-demo}.mjs` → `.out` ; `mutants-g2.mjs` → `mutants-g2.out` + `tap/` (52 fichiers : TAP de CHAQUE exécution) ;
  `merge.log`. sha256 au §10.

## 0. Journal (`date -u`)

- 11:51:06Z : orientation (branche, clone, G1, diff, ADR proposé, sonde, harnais du worker, ordre SEC II.F, notes 67/69/72/81).
- ~11:58Z : advisor n°1 (après orientation, avant tout travail substantiel ; §9).
- ~12:00Z : `lot/etude-suite` a avancé à `a0f47fe` (CHANTIERS 11:55 UTC : rulings D-1/D-2/D-3/D-8/D-11, item Q6-COURSE-1) ; `git fetch` dans le
  clone ; pointe retenue `a0f47fe` (≥ `ed647b7` ; 10 commits docs-only depuis `d0535cb`, 0 octet sous `apps/`, `packages/`, `scripts/`).
- 12:05:24Z-12:07:33Z oracle du lot ; 12:05:49Z R-25 ; 12:06:19Z sonde probe-q6 ; 12:07:23Z re-pin ; 12:08:04Z-12:13:30Z oracles base puis
  pointe ; 12:10:46Z sonde sémantique (3ᵉ exécution, voir I-1) ; 12:13:01Z honnêteté ; ~12:14Z fusion à blanc ; 12:14:18Z-12:16:18Z oracle
  fusionné ; 12:17:07Z-12:18:11Z mutants ; 12:19:35Z démonstration des tueurs ; ~12:2xZ relecture de la page Massive ; 12:21:45Z hachage des
  preuves ; rédaction ; advisor n°2 (avant clôture).

## 1. Diff et périmètre (point 1) — CONFORME

- `git diff --name-status d0535cb..290548c` : 10 fichiers — 9 sous `apps/bell/**` (8 M ; 1 A `apps/bell/test/bell-adv-1.test.ts`) + le rendu
  `docs/G1-lot-bell-adv-1.md` (A ; sha `73c88f13…` = `F:\tmp\belladv1\G1.md`). Aucun autre chemin.
- `git diff d0535cb..290548c -- apps/sentinel` / `packages` / `scripts` : **0 octet** chacun.
- A-6 (méthode de `docs/PLAN-u4b-prereg.md` §2 : `git show <rev>:<path> | tr -d '\r' | sha256sum`) : **9/9 égaux à la table, en `d0535cb` ET en
  `290548c`** — `2f9a31f6` u4b-scores, `a5e66cd3` u4b-reduce, `5733daeb` record-u4b-calib, `7bee76fc` wadray, `3376eb08` abi, `9206df91` l1-split,
  `0e232519` sentinel rpc, `3603265d` calib-digest, `cb020425` u3-realized.
- Collecteur go-1 intouché (blob `d0535cb` = blob `290548c`) : `rebase-crosscheck.ts` `15cc8773`, `rebase-scan.ts` `1d3c892a`, `rebase-produce.ts`
  `25a64a65`, `rebase-trajectory.ts` `b831c087`, `discover.ts` `c033ea4d` ; aussi `sessions.ts` `6aaec1e6`, `supply.ts` `b7352581`, `gap.ts` `9dd168af`.
  Diff de `collect.ts` lu : aucun hunk dans les branches `--rebase-*`/`--discover` de `runMain` (elles retournent avant la jambe volume), ni
  dans `parseArgs`, `makeBudgetedCall`, `liveSolanaFills`, la construction du client gardé.
- DELIVERED : `F:\tmp\belladv1\DELIVERED.sha256` **9/9 OK** contre les blobs de `290548c`, contre l'arbre du clone, et contre l'arbre
  fusionné (`core.autocrlf=true` système mais `.gitattributes` `* text=auto eol=lf` : octets LF).

## 2. Sémantique contre II.F (point 2) — CONFORME

Sources [lu] :
- Ordre SEC 34-106402, texte `F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt`, sha256 recalculé `adee69f6…b40d08d`
  (2 116 lignes) : II.F l.898-906 (« 0.25 percent of the average daily share volume during the prior month in the relevant NMS stock as reported
  by an effective transaction reporting plan » ; numérateur = ADV du jeton sur le TSV, dénominateur = ADV de l'action) ; note 67 l.925-935
  (CTA/CQ, UTP, SIP) ; note 69 l.959-963 (« the next trade date will start concurrently with when trades must be reported to the SIP ») ;
  note 72 l.979-983 (moyennes mensuelles pondérées par les jours de bourse) ; note 81 l.1129-1131 (volume 24 h de la publication II.G,
  étranger à II.F).
- Massive « Custom Bars (OHLC) », `https://massive.com/docs/rest/stocks/aggregates/custom-bars`, firecrawl `maxAge: 0`, statusCode 200,
  ~12:2xZ (documentation, pas une API de données) — confirme les citations du G1 : `t` « The Unix millisecond timestamp for the start of the
  aggregate window » ; `adjusted` « Whether or not the results are adjusted for splits. By default, results are adjusted. » ; `limit`
  « Limits the number of base aggregates queried to create the aggregate results » ; `queryCount` « (minute or day) » ; exemple
  `t: 1577941200000` (= minuit EST) ; « Aggregates are constructed exclusively from qualifying trades that meet specific conditions » (I-G2-5
  reste ouvert) ; hôte des exemples `api.massive.com` (MASSIVE-HOST-1). L'exemple de réponse porte un `next_url` (curseur `limit=2`) : la
  pagination suit `limit` ; à `limit=50` pour ≤ 23 barres journalières, pas de page 2 (et une page manquante tomberait en `no_adv`).

Sonde indépendante `probe/semantics.mts` → `semantics.out` : **43 PASS / 0 FAIL**. Fériés NYSE listés à la main par mois (indépendamment de
`sessions.ts`) ; ADV distinct par mois (mois × 1e6) pour qu'un mauvais mois donne un mauvais ratio ; valeurs attendues dérivées à la main.
- (i) mois ADV = mois civil précédant `session_date_et` (D-1) : mar. 2025-09-02 03:59 EDT ⇒ nuit du 08-29 ⇒ juillet ; 04:00 EDT ⇒ pre du 09-02 ⇒
  août ; Labor Day ⇒ juillet ; 2026-01-01 ⇒ jour 2025-12-31 ⇒ novembre ; 2026-01-02 04:00 EST ⇒ décembre 2025 ; 03:59 EST ⇒ novembre ;
  2025-12-31 20:30 EST rejoint le même groupe nocturne ; 1ᵉʳ jour de bourse 2025-12-01 ⇒ novembre ; sam. 2025-11-29 ⇒ octobre ; 2025-01-02 ⇒
  déc. 2024 hors calendrier ⇒ `no_adv`, `n_trading_days: null` ; 2027-01-04 ⇒ déc. 2026 calculé ; 2027-02-01 ⇒ `no_adv`.
- (ii) couverture EXACTE : 21 barres exactes ⇒ calculé ; 21 dates distinctes avec un samedi à la place d'un jour de bourse ⇒ `no_adv` ;
  +1 dimanche ⇒ `no_adv` ; `v` NaN ou < 0 ⇒ `no_adv` ; barres d'autres mois ignorées ; barre du Labor Day à la place du 09-02 ou en plus ⇒ `no_adv`.
- (iii) `advRangePath` = `/v2/aggs/ticker/TSLA/range/1/day/2025-08-01/2025-08-31?adjusted=false&sort=asc&limit=50` ; bornes exactes (févr. 2024
  → 29, févr. 2025 → 28, déc. → 31) ; `barDateET(1577941200000)` = 2020-01-02 ; minuit EDT ⇒ bonne date ; minuit UTC ⇒ veille ET (couverture
  en échec, jamais un décalage silencieux).
- (iv) S = Σ|baseDelta|/10^dec × m(t) : trajectoire 1 → 2 entre deux fills ⇒ 3 actions ⇒ `0.0000003750` ; même porte que g_t
  (`ratioMultiplierOf`, `collect.ts` l.109-120 = les trois états de la porte ; l'expression `multiplierAtMs(evs, ms)?.value ?? null` de
  l.113 est celle du chemin g_t l.191) ; `constant "1.5"` ⇒ 1,5.
- (v) `VOL_RATIO_FORMULA` (474 caractères ASCII) sur CHAQUE entrée, calculée ET abstenue ; unité « fraction of one average trading day of
  adv_period » ; additivité : les trois sessions d'un jour somment au volume du jour sur l'ADV du mois précédent (écart 6e-23).
- (vi) aucun « 1 » par défaut : porte absente + mint absent ; porte `unverified` + mint lisible « 1 » ; `constant "0"`/`"-1"` ; trajectoire
  m = 0 ou −2 ⇒ `["no_multiplier"]`, compté.
- (vii) deux causes ⇒ `["no_multiplier","no_adv"]`, chacune comptée une fois (digest ET `state.residuals`).
- (viii) `collect → bell-report.mjs` : `aggregate()` accepte un état portant entrées calculées + abstenues et somme `no_adv`/`no_multiplier` ;
  littéraux `CLOSE_KEY` égaux octet pour octet ; `adv_source` nommé ; l'ADV n'apparaît jamais comme nombre. Portée exacte : le rapport
  consomme les nouveaux CODES de résidu, pas les champs de `digest.volume[]` (O-1).
- (ix) re-pin par substitution, INDÉPENDANT (`probe/repin.mts` : cœurs base ET lot dans un même processus, mêmes fixtures — sha identiques) :
  base ⇒ `0cfbed20…43d7` et `digest.volume` = `[{"symbol":"TSLAx","vol_ratio":"0.0000019375","multiplier_unit":false}]` (pris du run de base,
  pas de la constante du test) ; lot ⇒ `79a59086…7658f` ; diff profond : **seuls `volume` et `residuals.no_adv`/`no_multiplier`** ; digest du
  lot avec `volume` := entrée de base et les deux clés retirées ⇒ `0cfbed20…` avec la fonction `bellSha` des DEUX arbres.

## 3. Sonde probe-q6 (chemins seuls), harnais du worker, mutants (point 3)

- **Sonde** `probe/probe-q6-lot.mts` : `diff` contre `F:\tmp\g2-sec-v3\probe-q6.mts` (sha `69f0a2a4…38f3`, recalculé) = les 2 lignes d'import ;
  0 double barre oblique. Sortie : A (mint absent) ⇒ `["no_multiplier","no_adv"]`, `no_multiplier 1`, `no_adv 1` ; B (ADV absent) ⇒
  `["no_adv"]`, `no_adv 1` ; C ⇒ `["no_adv"]` ; D (porte réelle `rebaseForMint(undefined)` + close) ⇒ écart `rebase_unverified` ET ratio
  `["no_multiplier","no_adv"]`, comptés ; E (rejeu sans porte ni mint) ⇒ g_t calculé, ratio `["no_multiplier","no_adv"]`. `no_adv` s'ajoute
  partout parce que la sonde passe l'ADV dans l'ANCIENNE forme non datée : 0 barre datée dans la période ⇒ abstention (fail-closed sur une
  entrée invalide, attendu). En forme datée (sonde sémantique M1/F1/C1 ; tests 2 et 3 du lot) : A ⇒ `["no_multiplier"]` seul, B ⇒ `["no_adv"]`.
- **Harnais** `mutants-g2.mjs` (Write, A-13) sur le worktree `mut` : définitions du worker EXTRAITES VERBATIM à l'exécution (bloc `const T1`…fin
  de `MUTANTS`, évalué en `node:vm` ; source `mutants.mjs` sha `fde551d6…`, bloc `3d968736…`, 35 lignes ; A-9 : `mutants-a9.mjs` `0a913b7a…`,
  bloc `d8b31f06…`) ; mécanique conforme D-1-bis (écriture et restauration `openSync`/`writeSync`/`fsyncSync`/`closeSync`, sha RE-LU après
  fermeture) et REVIEW-TAP-1 (TAP de chaque exécution gardé, `tap/001…052`) ; A-11 `byIntended` ; baseline 45/45 ; `git status --porcelain`
  final VIDE. Sha des fichiers mutés identiques à ceux de `F:\tmp\belladv1\mutants.out` (contrôle ponctuel : M1 `8e9ed559…`, M2 `7af69555…`).
  - **W (worker) : 22/22 tués par le test visé** (rejeu conforme de l'affirmation G1).
  - **A-9 : 3/3 rouges** (worker) + **2/2** des miens sur les LITTÉRAUX servis (`"no_adv"` dans `residuals.ts`, `["no_adv" as const]` dans
    `collect.ts`) : gate:vocab exit 1 et nomme le fichier.
  - **G (miens, 18) : 14 tués par le test visé** — G1 mois M−2 (T1) ; G2 couverture partielle acceptée (T2) ; G4 paramètre `adjusted`
    retiré ⇒ défaut Massive « adjusted » (T8) ; G5 porte `unverified` ⇒ « 1 » littéral (T3) ; G6 absence de m au fill comptée à 1 (T3) ; G7
    `abstain` tronqué à sa 1ʳᵉ cause (T3) ; G8 `formula` non publiée (T6) ; G9 `CLOSE_KEY` divergent côté `digest.ts` (TR) ; G10 côté
    `bell-report.mjs` (TR) ; G11 barres ANTÉRIEURES au mois comptées (T5) ; G12 fin de période = mois suivant (T8) ; G16 rapport qui ne
    somme pas `no_adv` (TR) ; G17 `n_trading_days` publié = nombre de barres (T2) ; G18 bornes de `window` inversées (T4).
  - **4 survivants** (3 fichiers du lot ET les 240 tests des 19 fichiers `apps/bell/test`, TAP `027`, `038`, `040`, `042` : `# fail 0`) :
    **G3** (`volume.ts` `periodAdv` : `&& days.every((d) => dates.has(d))` retiré — « barres hors calendrier comptées », forme chirurgicale),
    **G13** (`sessionShareVolume` : `|| !(m > 0)` retiré), **G14** (`!Number.isFinite(m) ||` retiré), **G15** (branche `constant` de
    `ratioMultiplierOf` : `&& mc > 0` retiré).
  - `probe/killer-demo.mjs` (mêmes garanties D-1-bis, un processus neuf par cas) : G3 ⇒ un mois de 21 dates distinctes (le 08-15 manquant,
    le samedi 08-16 présent) PUBLIE `vol_ratio 0.0000001250` au lieu de `no_adv` ; G13 ⇒ trajectoire m = 0 publie `0.0000000000` ; G14 ⇒
    m = +Infinity publie `Infinity` ; chacun est TUÉ par un contrôle d'un cas (exit 1). G15 : `constant "0"` reste `no_multiplier` —
    masqué par la garde aval de `sessionShareVolume` : **équivalent en effet**, déclaré, non compté. ⇒ C-1.

## 4. Oracle, R-25, fusion (point 4) — CONFORME

- **Lot `290548c`** (`oracle-lot/`, node v24.15.0, npm 11.12.1) : **7 × exit 0** ; test **1067 / 1065 / 0 / 2** (TAP : tests 1067, pass 1065, fail 0,
  skipped 2 : `sentinel_run_releases_chainstack_lock_on_sigterm` win32, `u4b_labels_replay_via_main_real_artifact` artefacts e2 absents) ;
  vocab « scanned 227 file(s), no forbidden claim » ; ratchet 69/69 ; lang:gate et export:check 0 occurrence.
- **Base `d0535cb`** : 7 × 0 ; **1058 / 1056 / 0 / 2**, mêmes skips ⇒ **1067 = 1058 + 9** (8 + 1 nouveaux, aucun retiré).
- **R-25** (`r25.mjs` : pathspec EXTRAIT à l'exécution de `.github/workflows/ci.yml:65` du blob `290548c`, 15 arguments ; forme
  `git diff --shortstat d0535cb...290548c` ; règle awk du CI) : `9 files changed, 688 insertions(+), 87 deletions(-)` ⇒ **775** ≤ 1 150.
- **Fusion à blanc** dans la pointe `a0f47fe` (≥ `ed647b7`) : `git merge --no-ff --no-commit 290548c` ⇒ « Automatic merge went well » ;
  **0 conflit** ; 10 chemins ; 9 fichiers livrés = DELIVERED ; HEAD inchangé (`MERGE_HEAD` = `290548c`, aucun commit). Pointe seule :
  7 × 0, **1058 / 1056 / 0 / 2**. Arbre fusionné : **7 × 0, 1067 / 1065 / 0 / 2 = N(pointe) + 9**, mêmes skips.

## 5. Honnêteté (point 5) — CONFORME

- gate:vocab 0 hit (oracles lot et fusionné). `probe/honesty.mts` (matcher de la gate elle-même, `scanText` + `compilePatterns` de
  `scripts/grep-forbidden.mjs`, 10 motifs globaux + 7 de portée bell) : texte SERVI composé par le vrai `collect()` (`state` + `provenance` +
  `journal`, 211 lignes ; entrées calculée et abstenues, `adv_source`) **0 hit** ; `bell-adv-1.test.ts` entier et lignes ajoutées de
  `collect.test.ts`/`report.test.ts` **0 hit** (la gate ne scanne pas `apps/bell/test`, par conception) ; lignes ajoutées des sources 0 hit.
- Données de marché : littéraux ≥ 1000 des tests du lot = volumes ronds synthétiques (1e6…6e6, 1_100_000, 900_000), montants de jetons,
  horodatages ; corps Massive du test 8 synthétique (`c/h/l/o/vw = 1`). **Aucune donnée de marché réelle.** La série de fills lue par le
  test 6 est la fixture on-chain préexistante épinglée (`tslax-weekend-fills.jsonl`, sha `7f81f670…`, identique en base).

## 6. Amendement ADR proposé (point 6)

- Exact contre le code et les sources : citations de lignes (ADR-B0 l.30 ; ADR-T1aii l.16 ; `collect.ts@d0535cb` l.189-201 et l.383-392 ;
  `supply.ts` l.67) ; définition, abstentions, objet publié, garde, provenance ; tuyaux (entrée `runMain` → `buildSolanaSymbol`/jambe ETH →
  `advBarsFor` sous le budget cash ; sortie `state.json`/`provenance.json` ; consommateur en dépôt `bell-report.mjs` « somme des résidus » ;
  chemin servi aucun avant T-1b, consommateur T-1b déclaré par ADR-B0 D4 l.43 `bell_panel_reads_published_state` ; tests nommés existants).
- Lettre (§3 ; `probe/letter-check.mjs`, pointe `a0f47fe` ET lot) : chaque ancienne chaîne présente **exactement 1 fois** ; Q6 l.48 : 48 mots
  → A 47 / B 46 ; l.64 +5 ; l.59 +3 ; « consolidated volume » l.61 (1 occurrence) ; A total = +7. Exact.
- Items (9) : chacun a propriétaire et déclencheur ; ADV-CAL-2027 « dès le 2027-02-01 » confirmé (sonde A11/A12) ; SUPPLY-READ-1 exact.
- **Point bloquant §12 = Q6-COURSE-1 : EXACT** contre le code : sans `--rebase-trajectory`, la porte Solana est `rebaseForMint(mint)` =
  `unverified` ⇒ 100 % `no_multiplier` ; `--rebase-crosscheck` retourne avant la jambe volume, sur `290548c` (l.799 < l.810/827) comme sur
  l'arbre de course `a703e24` (l.751 < l.762/779) ⇒ les tirages go-1 ne portent aucun ratio, dans aucune définition ; `--rebase-produce` écrit le format que
  `loadTrajectories` accepte (`{symbol:{events, scanComplete, scanMethod:"authority"}}`). Deux précisions : O-2.
- Inexactitudes : C-2.

## 7. Liste FERMÉE des corrections

- **C-1 (tests seuls ; `error_origin` : worker G1 ; à faire avant G7, pli test-only).** Trois gardes fail-closed du lot ne sont épinglées par
  AUCUN test : G3, G13, G14 survivent aux 240 tests `apps/bell` (TAP gardés) et chacun est tué par un contrôle d'un cas (`killer-demo.out`).
  - G3 (`volume.ts` `periodAdv`, `days.every`) : ajouter au test 2 (`bell_no_adv_is_named_counted_and_ratio_absent`) la variante « un samedi à la
    place d'un jour de bourse manquant », p. ex. `[...full.filter((x) => x.dateET !== "2025-08-15"), { dateET: "2025-08-16", v: 1_000_000 }]`,
    `n_bars` 21, attendu `["no_adv"]`. C'est le mutant « barres hors calendrier comptées » de la mission ; M7 du worker retire toute
    l'expression et n'isole pas ce cas.
  - G13 / G14 (`volume.ts` `sessionShareVolume`, positivité et finitude de m) : ajouter au test 3 (`bell_no_multiplier_is_named_counted_never_one`)
    deux portes `trajectory_known` dont l'`initialize` vaut m = 0 et m = +Infinity (`f64BitsHexLE`), attendu `["no_multiplier"]`, sans
    `vol_ratio`. Seul le chemin trajectoire atteint ces gardes : les branches mint et `constant` filtrent avant.
  - Mutants nommés G3/G13/G14 rouges `byIntended` (T2, T3, T3) au pli ; G15 déclaré équivalent (masqué par la garde aval).
- **C-2 (texte de `F:\tmp\belladv1\ADR-amendement.md`, à l'insertion ; `error_origin` : worker, sauf (d) = chronologie).**
  - (a) « Preuves » : « 20 mutants tués par le test visé » → **22** (`mutants.out` final 22/22 ; rejoué ici 22/22).
  - (b) « 3 tests adaptés (`collect.test.ts`) » → **4 corps de test modifiés** (`bell_abstentions_counted`, `bell_ratio_killer_adv_and_unit`,
    `bell_pinned_sha_reduces_to_b3a_by_subtraction`, `bell_close_databento_replays_synthetic_fixture`), plus la fixture (`tslaxInput` →
    `AUG_2026_BARS`) et les épingles (`PINNED_BELL_SHA` re-pin, `PINNED_BELL_SHA_B3B`, `PRE_LOT_VOLUME_ENTRY`), dont dépend
    `bell_collector_replays_fixture_bit_identical` ; le G1 §5.2 les liste correctement.
  - (c) « Porte absente (rejeu hors ligne seulement ; `buildSolanaSymbol` la pose toujours en course) » est inexact : la jambe ETH de
    `runMain` (`collect.ts` l.827-828, TSLAon) construit en COURSE une entrée sans porte ni mint. L'issue reste fail-closed (`no_multiplier`,
    TSLAON-MULT-1), mais la phrase dit le contraire. Texte : « Porte absente (rejeu hors ligne, et jambe ETH TSLAon en course, sans mint ⇒
    `no_multiplier`) ». Le même énoncé est dans le commentaire de `ratioMultiplierOf` (`collect.ts` l.106) : le corriger dans le pli C-1
    (commentaire seul, aucun octet exécuté), sinon item formé (déclencheur : prochain lot touchant `collect.ts`).
  - (d) le paragraphe « Écart déclaré au ruling (D-n …) » a été écrit avant le ruling : à l'insertion, « D-1 ACCEPTÉE (CHANTIERS 2026-09-23
    11:55 UTC ; parenthèse `refCloseDateOf` retirée) ».

## 8. Observations (aucune action requise par ce lot ; routage proposé)

- **O-1 (viii).** `bell-report.mjs` consomme les nouveaux CODES (`no_adv`, `no_multiplier`) et fait passer tout l'état par sa garde, mais ne
  lit pas `digest.volume[]` : les entrées par session n'ont, en dépôt, que des tests pour consommateurs jusqu'à T-1b (déclaré, Bell reste
  `upcoming`). Asymétrie à connaître : sous une porte `trajectory_known` à scan d'autorité, les résidus nommés de la porte
  (`authority_scan_mono_operator`, `set_authority_unscanned`) ne sont portés que par l'entrée d'écart, qui n'a pas de `session_date_et`. Un
  lecteur du seul ratio ne voit pas d'où vient m. À traiter par `/bell/method` (T-1b) ou par un champ sur l'entrée volume.
- **O-2 (Q6-COURSE-1, deux précisions).** (i) La course exige aussi `POLYGON_API_KEY` : sans elle, `advBarsFor` rend `[]` SANS faute journalisée
  (`collect.ts` l.424 ; même comportement que l'ancien `advVolumes`) ⇒ 100 % `no_adv`, indiscernable dans le journal d'un mois incomplet.
  (ii) Une trajectoire ne compte que si le mint est lu sous quorum ET que l'ancre C-3 concorde (`stateAnchorMatches`), sinon `rebase_unverified`
  ⇒ `no_multiplier`. Avec `--eth`, les sessions TSLAon s'abstiennent toujours (TSLAON-MULT-1). La ligne de plan CHANTIERS l.941 (« volumes par
  pool du tirage go-1 pour Q6 ») est caduque (§6).
- **O-3 (TSLAon, préexistant).** Porte absente en course ⇒ le g_t TSLAon est calculé sur le prix du jeton NON converti (`sessionGap` sans m,
  `collect.ts` l.204), tandis que son ratio s'abstient désormais `no_multiplier`. L'asymétrie C-G2-1 est fermée pour le cas D (Solana) et
  inversée pour TSLAon. La phrase de la lettre l.59, actuelle comme proposée au §3.3 (« … multiplier cannot be established, Bell abstains »),
  n'est exacte que pour les symboles Solana. À borner au remplissage (I-v3-6), ou à couvrir en étendant TSLAON-MULT-1 au côté g_t.
- **O-4 (ESC-1 c, point préexistant du checkpoint-2, commentaire de `digest.ts`).** Avec un ratio par session à 10 décimales et `adv_period`
  publié, l'ADV mensuel A = S / `vol_ratio` se recalcule depuis les champs publics (S = `volumeBase` de l'écart × m). Pour un ratio de
  l'ordre de 1e-6, on obtient environ 5 chiffres significatifs, et le mois est désormais daté. Rien à corriger dans ce lot ; à verser au
  point ESC-1 (c) existant.
- **O-5 (D-1-bis / REVIEW-TAP-1).** Ces règles datent de `b48311d` (11:15:47Z), après la base `d0535cb` (10:41:42Z) : l'arbre du worker ne les
  portait pas (`290548c` : consigne de 53 lignes, 0 occurrence). Le `mutants.mjs` du worker restaure par `writeFileSync` et relit le sha,
  sans `fsync`. Il n'est donc pas conforme à la règle en vigueur à la revue, sans que ce soit un défaut du worker (`error_origin` :
  orchestration, la mission citait la consigne de l'arbre). Rejoué ici en mécanique conforme : 22/22.
- **O-6 (libellé du trou de garde).** `(?<!no_)adv` exempte toute clé où « adv » suit « no_ », où qu'elle soit (p. ex. `xno_adv`), et pas seulement
  « `no_adv*` » (commentaire de `digest.ts`, ADR). La forme est la même que celle de `(?<!no_)close`, préexistante. L'ensemble des résidus est
  fermé : toléré, il ne s'agit que du libellé.
- **O-7 (libellé).** Commentaire d'`advBarsFor` et G1 §3 : « a bar without a finite t/v … is dropped ». En fait, un `v` non fini (de type
  number) est gardé, et le contrôle `positive` du cœur met le mois en `no_adv`. L'issue est la même (fail-closed).
- **O-8 (liage de la mention « unadjusted », A-10, non bloquant).** La requête envoie bien `adjusted=false` (prouvé : `advRangePath`, test 8,
  mutants M15/G4). En revanche, le champ `adjusted` de la RÉPONSE n'est jamais lu : `grep -n "\.adjusted"` sur `collect.ts`, `volume.ts` et
  `close.ts` = 0 ligne, et le type `PolygonGet` ne le déclare pas. La page Massive le documente pourtant : « Whether or not this response
  was adjusted for splits. » Les mentions servies (« unadjusted daily bars » dans `formula`, « …-unadjusted » dans `adv_source`) reposent
  donc sur le paramètre de la requête, pas sur l'indicateur de la réponse. Forme liée proposée : `bars.adjusted !== false` ⇒ mois écarté
  ⇒ `no_adv`, avec un test à corps `adjusted: true`. Même déclencheur qu'ADV-SPLIT-1 ou Q6-COURSE-1 (avant la course Q6).

## 9. Déviations du relecteur (D-G2-n) et incidents

- **D-G2-1 (« chemins seuls »).** Les définitions du worker sont rejouées à l'octet (extraction `vm`, sha du bloc imprimé). Seule la mécanique
  change : restauration durable (D-1-bis) et TAP gardé (REVIEW-TAP-1), que la mission rend applicables à mes harnais. La sonde probe-q6,
  elle, est rejouée en chemins seuls stricts.
- **D-G2-2.** Pour la porte `test`, l'oracle lance la commande EXACTE de `package.json` (mêmes 5 globs, `--test-timeout=120000
  --test-force-exit`), avec deux options de reporter placées AVANT les globs (spec → journal, tap → `test.tap`) et `node_modules/.bin` en
  tête du PATH, plutôt que `npm run test`. Mesuré : une option placée après les globs est ignorée, et aucun test ne lit `npm_*`
  (grep : 0). Les 6 autres portes passent par `npm run`.
- **D-G2-3.** La pointe retenue est `a0f47fe` (> `ed647b7`, delta docs-only), la plus récente au moment de la fusion à blanc.
- **I-1 (`error_origin` : relecteur, sans effet sur le lot).** Deux exécutions de `semantics.mts` ont échoué sur MES entrées : un
  `multiplierBitsHex` vide (le décodeur exige 16 hex), puis un mint incomplet (`canonical` sur `supply` indéfini). Corrigé par l'outil Edit
  avant l'exécution finale de 12:10:46Z (43/43).
- **I-2.** La fusion à blanc a été lancée avec `-c user.name/email` : c'est inerte, `--no-commit` n'a créé aucun commit (HEAD = `a0f47fe`,
  `MERGE_HEAD` = `290548c`).
- **Advisor n°1 (~11:58Z, outil intégré, avis jamais verdict).** Suivis : comparer les sha sur les BLOBS, harnais D-1-bis + TAP, fusion
  en worktree, re-pin sur la base réelle, mutants chirurgicaux (`days.every`, positivité et finitude de m, `mc > 0`). Les quatre
  survivent, conformément à sa prévision ; G15 s'avère masqué. Un fait de l'avis est corrigé par la mesure : D-1-bis n'est PAS dans la
  consigne de `290548c` (O-5).
- **Advisor n°2 (~12:2xZ, avant clôture, sur ce fichier rendu durable).** L'advisor retire son fait sur D-1-bis : il lisait `F:\Monark`
  (etude-suite), pas l'arbre du lot. Il confirme le verdict et le périmètre de C-1/C-2 (ni aggravés ni adoucis), et signale une
  vérification manquante sur la liaison de la mention « unadjusted » à la réponse. Mesurée (0 ligne), elle est ajoutée en O-8, non
  bloquante. La fusion à blanc est LAISSÉE en place pour inspection dans `F:\tmp\g2-belladv1\tip` (HEAD `a0f47fe`, `MERGE_HEAD` `290548c`) :
  aucun `git merge --abort` n'a été lancé.

## 10. Provenance et sha256

- Relecteur `claude-opus-5-5[1m]` (préfixe conforme, décision 133), effort max ; 2026-09-23, 11:51:06Z → clôture (horodatage de la réponse).
  Contexte : clone isolé + 3 worktrees sous `F:\tmp\g2-belladv1\`. Réviseur : l'orchestrateur (R-21), puis le checkpoint-2.
- sha256 (12:21:45Z) : `oracle.sh` 7b2f0af3… ; `r25.mjs` 78e0c80d… ; `r25.out` 2184ab56… ; `mutants-g2.mjs` 43a887a2… ; `mutants-g2.out` 445fb77b… ;
  `merge.log` 96bb6a19… ; `oracle-lot/SUMMARY.txt` 92bb7da2…, `test.tap` 4a911d9e… ; `oracle-base/SUMMARY.txt` b1aacb4d…, `test.tap` 73b3d01a… ;
  `oracle-tip/SUMMARY.txt` 984877d0…, `test.tap` 4caf71bb… ; `oracle-merged/SUMMARY.txt` 1993c4a4…, `test.tap` 3f4f81ae… ; `probe/semantics.mts`
  578b5c43…, `.out` b997b84a… ; `probe/repin.mts` d8059dde…, `.out` 6286b70d… ; `probe/probe-q6-lot.mts` ed19dca5…, `.out` d2baa9bd… ;
  `probe/honesty.mts` 01624431…, `.out` ed1f14a9… ; `probe/killer-check.mts` ca1fb0f3… ; `probe/killer-demo.mjs` c5443ff5…, `.out` 5d141e74… ;
  `probe/letter-check.mjs` 6d9db279…, `.out` dc3419b8…. Le sha de CE fichier est donné dans le message de clôture (un fichier ne peut pas
  contenir son propre sha).
- État laissé : les quatre arbres sont propres (clone et `mut` : `status` vide ; `tip` : fusion non committée, à jeter). `node_modules`
  contiennent des jonctions vers `packages/`/`apps/` de leur propre arbre : retrait par `rm-nm.ps1`, jamais `Remove-Item -Recurse`.
