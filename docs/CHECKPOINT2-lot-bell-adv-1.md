# Checkpoint-2 — lot BELL-ADV-1 (validateur-humain, Fable 5.1)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/cp2-belladv1/CP2.md` (sha256 d118e3da7dc19a3d4b13951d0849e550736adf24b92bff5f656ab02d2b708e77). Décision : ACCEPTE-AVEC-CORRECTIONS (C-V-1 insertion ADR-B0 §1 + ADR-T1aii §2 au commit de fusion ; C-V-2 déviation cp-1 datée ; C-V-3 commentaire digest.ts), sous réserve du G2.

---

Modèle résolu : claude-fable-5-1

# Checkpoint-2 (acceptation) — lot BELL-ADV-1, `lot/bell-adv-1` @ `290548c` (base `d0535cb`)

Validateur-humain (siège d'acceptation AgileGates), 2026-09-23, ~13:3x UTC. Contexte frais : le G2 n'a PAS été lu (en cours ailleurs) ;
aucun fil de travail du worker lu — artefacts seuls. Rejeu sous `F:\tmp\cp2-belladv1\` (AM-2 ter) : clone isolé `clone\` (`290548c`),
worktree de fusion `merge\`, `npm ci --ignore-scripts --cache F:/tmp/npm-cache`, TEMP/TMP/TMPDIR = `F:\tmp\cp2-belladv1\tmp`, ceinture
A-7 (`env -u` des 8 variables) sur chaque commande d'oracle/test/mutant ; 0 appel réseau vers une API de données (seul accès réseau :
`npm ci`, registre des paquets) ; aucune variable d'environnement affichée ; processus de course non touchés.

## 1. Artefacts lus (chemins)
- `F:\tmp\belladv1\G1.md` (sha LF `73c88f13…` = `docs/G1-lot-bell-adv-1.md` committé), `F:\tmp\belladv1\ADR-amendement.md`,
  `F:\tmp\belladv1\DELIVERED.sha256`.
- Clone `290548c` : `apps/bell/src/{volume,collect,digest,residuals,close}.ts`, `apps/bell/scripts/bell-report.mjs`,
  `apps/bell/test/{bell-adv-1,collect,report}.test.ts` (diff complet `d0535cb..290548c`), `.github/workflows/ci.yml:65`,
  `docs/PLAN-u4b-prereg.md` §2, `apps/bell/src/sessions.ts` (CALENDAR_RANGE 2025-01-01 → 2026-12-31).
- Plan : `docs/CHANTIERS.md` entrées 2026-09-23 06:38 / 07:29 / 07:34 UTC (rulings (b)/(c), I-v3-1 « PRÉALABLE au remplissage »),
  entrée 11:55 UTC (`a0f47fe`, rulings D-1/D-2/D-3/D-8/D-11, item Q6-COURSE-1) ; `docs/sec-4927/RENDU-v3.md` V3-5 ;
  `docs/sec-4927/G2-TEXTE-v3.md` C-G2-1 (l.186), O-8 ; `docs/sec-4927/FAITS-sec-gov-4-927-lecture-sur-place-2026-09-23.md` l.22
  (Q6 « during the prior month ») ; `docs/sec-4927/LETTRE-4-927-v3.md` l.48/59/61/64.
- Ordre SEC 34-106402 : `F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt`, sha256 recalculé
  `adee69f69189aee2031773337f5e251963c2dfba85ea37be8b6a226e40b4d08d` (= G1 §1), l.895-908 (II.F : « the average daily share
  volume during the prior month … as reported by an effective transaction reporting plan » ; quotient ADV/ADV) et l.957-964 (note 69).
- Précédents : `docs/CHECKPOINT2-lot-t1a-ii-a.md:14` + `docs/adr/ADR-T1aii…md:32` (ESC-1 c étendu à l'ADV, 2026-09-19) ;
  `docs/CHECKPOINT2-lot-t1a-ii-b3b.md` C-V-1 et `docs/CHECKPOINT2bis-lot-t1a-ii-b3b.md` l.10 (anti-close, candidats « non interdits ») ;
  `docs/CHANTIERS.md:942` (HARNESS-DESC-1b C-V-1 : amendement ADR dans le MÊME commit de fusion).
- Bruts hors dépôt (anti-close) : `F:\PRODUITS\etude-2026-09-20\bell-b3b-raws\get_range-{AAPL,NVDA,SPY,TSLA}-ohlcv1d-2026-09-14_19.json`
  (20 enregistrements `close`, PROVENANCE sha-pinnée) ; `…\etude-2026-09-19\sources-web-2026-09-19\cash-close-bench\` (0 chiffre `c:`).

## 2. Re-exécutions (mission « À re-exécuter »)

| # | Contrôle | Attendu | Mesuré | Preuve (sous `F:\tmp\cp2-belladv1\`) |
|---|---|---|---|---|
| 1a | Oracle 7 gates (clone `290548c`) | 7 × 0 ; 1067/1065/0/2 | `gate:vocab` 0 (227 fichiers), `typecheck` 0, `test` 0 **1067/1065/0/2** (skips : `sentinel_run_releases_chainstack_lock_on_sigterm` win32, `u4b_labels_replay_via_main_real_artifact`), `lint` 0, `lint:ratchet` 0 (69/69), `lang:gate` 0, `export:check` 0 | `oracle\SUMMARY.txt`, `oracle\*.log` |
| 1b | R-25 verbatim `ci.yml:65`, `d0535cb...290548c` | 775 ; STOP > 1 150 | 9 fichiers, +688/−87 = **775** | `r25.out` |
| 1c | A-6 9 sha gelés | 9/9 | **9/9** (sha LF des blobs `290548c` retrouvés dans `PLAN-u4b-prereg.md` §2) | `a6.txt` |
| 1d | `apps/sentinel`/`packages`/`scripts` | diff vide | **0 octet** | `git diff --stat d0535cb 290548c -- apps/sentinel packages scripts` |
| 1e | Collecteur go-1 intouché | blobs identiques | `rebase-crosscheck/scan/produce/trajectory`, `discover`, `sessions`, `supply`, `gap` : **8/8 SAME** (`git rev-parse` base = pointe) | idem |
| 1f | DELIVERED | 9/9 | **9 × OK** (avant ET après mes mutants) | `delivered-check.txt` |
| 2a | Rejeu propre `collect()` : session 2026-01-02 (barres nov./déc. 2025 + jan. 2026 leurres) | `adv_period {2025,12}` | **{2025,12}**, ratio sur le seul ADV de décembre, `n_bars = n_trading_days = 22` (compte indépendant) | `rejeu\rejeu.mts` → `rejeu\rejeu.out` (21/21 OK) |
| 2b | Couverture partielle (déc. 2025 − 1 jour) | `no_adv` compté, pas de `vol_ratio` | **`abstain:["no_adv"]`**, compté 1 (digest ET state), `n_bars 21` vs `n_trading_days 22` visibles | idem |
| 2c | Multiplicateur non établi (porte `unverified` + mint lisible « 1 » ; mint absent ; mint « abc ») | `no_multiplier` compté, jamais « 1 » | **3/3** : `no_multiplier`, aucun `vol_ratio` ni `multiplier_unit`, compté 1 ; jamais le ratio m = 1 ; contrôle porte `constant` 1,5 juste ; deux causes ⇒ deux codes, deux comptes | idem |
| 2d | Mon mutant « mois M au lieu de M−1 » (`advPeriodOf`) | un test nommé rouge | **rouge** : `bell_adv_period_is_prior_calendar_month_of_session_day` (+ 6 autres, 7/8), restauration sha `46fa184d…` identique | `mutants\m1-M-not-Mminus1.tap` |
| 2e | Mon 2e mutant « porte `unverified` ⇒ m = 1 » (`ratioMultiplierOf`) | rouge | **rouge** : `bell_no_multiplier_is_named_counted_never_one` (1/8), restauration sha `df00bdd1…` identique | `mutants\m2-unverified-default-1.tap` |
| 3 | Fusion à blanc dans la pointe `lot/etude-suite` | 0 conflit ; N + 9 | Pointe RÉELLE au moment du rejeu **`a0f47fef`** (> `ed647b7` ; delta `docs/CHANTIERS.md` seul, mesuré) : merge `--no-ff` **propre** (`dea09e6b`, scratch seul), 10 fichiers ; oracle test **1067/1065/0/2** ; N mesuré sur `ed647b7` = **1058/1056/0/2** (delta `ed647b7..a0f47fef` docs-only) ⇒ **1067 = 1058 + 9** ; première fusion sur `ed647b7` (`1e17dc4`) : mêmes comptes | `merge3.log`, `merge3-test.log`, `base-es-test.log`, `merge.log`, `merge-test.log` |

## 3. Checklist CA-1..CA-11 (règle par règle)

- **CA-1 (falsifiabilité)** — conforme, **ex post** (pas de checkpoint-1, déviation déclarée dans la mission) : chaque critère avait une
  réponse localisable (7 × 0, 775, 9/9, tests nommés, mutants nommés) ; reformulation en une phrase : « une entrée volume par session,
  ratio S/A où A = ADV du mois civil précédant le jour ET de la session, couverture exacte sinon `no_adv`, multiplicateur de la porte
  sinon `no_multiplier`, jamais 1 ». Reformulable ⇒ plan bien posé.
- **CA-2 (valeur)** — conforme : la définition est celle de l'ordre (II.F l.898-906 lu ; note 69 l.959-963 lue) ; D-1 (clé du mois =
  `session_date_et`, la parenthèse `refCloseDateOf` du ruling retirée) est un arbitrage d'interprétation ancré sur le texte, ACCEPTÉ par
  l'orchestrateur (`a0f47fe`), sans changement de périmètre ni de coût investisseur ; aucune dérogation à un gate demandée. **Pas de
  décision de valeur nouvelle ⇒ pas d'ESCALADE.**
- **CA-3 (ADR de rattachement)** — **correction bloquante C-V-1** : les amendements ADR-B0 §1 et ADR-T1aii §2 n'existent qu'en
  `F:\tmp\belladv1\ADR-amendement.md` ; `git grep BELL-ADV-1 -- docs/adr` = vide à `290548c` ET à `a0f47fef`, alors que l'entrée
  CHANTIERS 11:55 UTC renvoie déjà à « déclencheurs dans l'amendement » (référence pendante dans le registre). Les tuyaux (table §1),
  la table `error_origin`, les 9 items et la précondition Q6 ne sont pas dans l'arbre.
- **CA-4 (fan-out)** — conforme : 1 worker (Opus 5.5) + relecteur G2 séparé + ce checkpoint-2 séparé ; justification = indépendance de
  vérification imposée par le système (instances distinctes, contexte frais), pas le débit.
- **CA-5 (MAST)** — non nommé dans la mission (conséquence du saut de cp-1) ; risque résiduel observé et contré par le lot : « vérification
  incomplète » contrée par 22 mutants + A-9 ; « dérive de spécification » (ruling contradictoire) contrée par D-1 écrit avec `error_origin`.
  À consigner avec la déviation (C-V-2).
- **CA-6 (oracle ET revue)** — oracle rejoué par moi (7 × 0 sur `290548c`, 1067/1065/0/2 sur la fusion `a0f47fef`+lot) ; **G2 non lu**
  (en cours). Mon acceptation est **conjonctive** : elle vaut sous réserve d'un G2 PASS ; toute divergence G2 / cp-2 remonte à
  l'orchestrateur (frontière d'escalade), jamais tranchée ici.
- **CA-7 (zéro dette)** — conforme sous C-V-1/C-V-2 : 9 items formés avec propriétaire + déclencheur (I-G2-5, ADV-SIP-DAY-1, ADV-SPLIT-1,
  ADV-CAL-2027, SUPPLY-READ-1, TSLAON-MULT-1, CASH-BUDGET-1, ADV-SESSION-CUT-1, MASSIVE-HOST-1) ; le **point bloquant §12** (course Q6 =
  collecte par défaut avec `--rebase-trajectory`, porte `constant`/`trajectory_known` par mint) est devenu l'**item formé Q6-COURSE-1**
  (propriétaire orchestrateur ; déclencheur fin de SPYx + G7 BELL-ADV-1, avant le remplissage) dans `a0f47fe` ⇒ **item formé, pas un dû
  nu**. Reste nu tant que C-V-2 n'est pas faite : la déviation « pas de checkpoint-1 » (aucune ligne datée dans CHANTIERS ni dans
  l'amendement ; les mentions « décision 140-bis / 143 » de CHANTIERS portent sur la course Ukemi).
- **CA-8 (provenance)** — conforme : modèle résolu `claude-opus-5-5[1m]` (préfixe conforme décision 133), G1 committé identique au rendu
  (sha LF `73c88f13…`), `error_origin` assignés (plan T-1a-ii ; orchestrateur pour la parenthèse ; worker pour D-11 et I-1 ; n-a pour le
  double de garde) ; générateur ≠ relecteur (G2 ailleurs) ≠ acceptation (ici).
- **CA-9 (vérification imposée par le système)** — conforme : instance séparée, contexte frais, clone isolé, oracle/mutants/fusion
  ré-exécutés par moi ; aucun chiffre du G1 repris sans mesure.
- **CA-10 (anti-vitesse)** — conforme : R-25 775 ≤ 1 150 ; aucun argument de vitesse ; lot unitaire (un fait, iii).
- **CA-11 (branchement, forme durcie)** — conforme, avec deux nuances écrites :
  (i) Tuyau amont : `runMain` → `buildSolanaSymbol` → `advBarsFor` (GET Massive d'un mois exact, `adjusted=false`) → `collect()` →
  `state.json`/`provenance.json` ÉCRITS puis RELUS par le test 8 (`runMain` + `openGuardedClient` réel + `polygonGet`/`databentoGet` réels,
  seul `globalThis.fetch` bouchonné, corps Massive de forme documentée) : composition exécutée depuis l'artefact d'entrée réel.
  (ii) Tuyau aval : test 9 `collect()` réel → objet state → `aggregate()` (somme `no_adv`/`no_multiplier`, refus d'un `adv` numérique).
  La chaîne fichier → `findStateFiles` → `aggregate` n'est pas rejouée d'un trait : le champ est prouvé ÉCRIT (test 8) et prouvé CONSOMMÉ
  (test 9) — conforme. La regex sur source du test 9 sert à épingler l'égalité des deux littéraux `CLOSE_KEY` (invariant de
  synchronisation), pas à prouver le branchement (celui-ci est l'exécution) — hors du motif proscrit -b3a.
  (iii) Chemin servi : aucun avant T-1b, déclaré ; Bell **absent** de toute surface publique (`git grep Bell -- apps/site README.md` = 0)
  ⇒ aucun « built » indu.
- **Anti-close (lots Bell)** — conforme : diff des littéraux prix-like des lignes ajoutées (src/tests/scripts) contre les 20 clôtures
  brutes sha-pinnées (entiers scalés) et le bench : **deux littéraux nouveaux : 0 coïncidence** (et le jour de référence du test 3 est hors
  couverture des bruts — comparaison non concluante mais conforme au protocole) ; **un littéral préexistant** sur une ligne réécrite
  (bouchon re-clé), même valeur qu'à `d0535cb`, déjà jugé « non interdit » au cp-2 bis -b3b. Aucun enregistrement brut copié ; les
  fixtures réelles utilisées (`tslax-weekend-fills.jsonl`, mint) sont on-chain publiques. Cet avis ne cite aucune valeur. Anti-close bis :
  n-a (aucune constante on-chain nouvelle).
- **ESC-1 (c) étendu à l'ADV** — déjà tranché le 2026-09-19 (ADR-T1aii l.32 : recomposition admise, verbatim seul protégé, précision
  10 décimales). Le lot publie en plus `adv_period`, `n_bars`, `n_trading_days` : cela date le dénominateur sans changer sa précision
  recouvrable ⇒ le ruling tient. Le commentaire de `digest.ts` réécrit par le lot garde « a point for checkpoint-2 » : périmé (C-V-3).

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée), sous réserve d'un G2 PASS ; **pas d'ESCALADE-INVESTISSEUR**

- **C-V-1 (BLOQUANTE avant G7 ; `error_origin` : orchestrateur)** — insérer `ADR-amendement.md` §1 dans `docs/adr/ADR-B0-programme-bell.md`
  et §2 dans `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` dans le **MÊME commit de fusion** (précédent HARNESS-DESC-1b C-V-1) ;
  consigner les sha des deux ADR après insertion ; les 9 items + Q6-COURSE-1 doivent être lisibles depuis l'arbre.
- **C-V-2 (non bloquante, au G7 ; `error_origin` : orchestrateur)** — une ligne datée « lot sans checkpoint-1, déviation (décisions
  140/143), CA-1..CA-5 tenus ex post au cp-2, modes MAST résiduels : vérification incomplète (contrée : 22 mutants + A-9), dérive de
  spécification (contrée : D-1 écrit) » dans l'amendement ADR-B0 ET dans CHANTIERS ; sans elle c'est un dû nu.
- **C-V-3 (non bloquante, prochain lot touchant `digest.ts`, ou pli docs)** — le commentaire `digest.ts` doit renvoyer à l'amendement
  ADR-T1aii du 2026-09-19 (ESC-1 c ADV tranché) au lieu de « a point for checkpoint-2 ».
- **Conditions au remplissage de la lettre (portées par l'orchestrateur, hors lot)** : §3.1 obligatoire ; variante A si I-G2-5 établi,
  sinon B **et** l.61 (« consolidated volume ») à revoir ; §3.2/§3.3 seulement après rejeu de la mesure de pages (I-v3-6) ;
  O-4 : `docs/sec-4927/SOURCES.md` Q6-1 et M-9 re-sha (`volume.ts` `46fa184d…`, `collect.ts` `df00bdd1…`, `residuals.ts` `643f16a1…`).

## 5. AM-1 (une ligne) et AM-2 ter (preuve)
- **Attrapé** : amendements ADR absents de l'arbre avec référence pendante dans CHANTIERS (`a0f47fe`) ; déviation « pas de cp-1 » non
  enregistrée ; commentaire `digest.ts` périmé réécrit par le lot ; pointe `lot/etude-suite` déplacée pendant le rejeu (fusion refaite).
  **Manqué** : à renseigner par l'orchestrateur a posteriori.
- **AM-2 ter** : rejeu sous `F:\tmp\cp2-belladv1\` uniquement (clone, worktree `merge`, `rejeu\`, `mutants\`, `oracle\`) ; les seules
  écritures `git` (clone, worktree, merge à blanc, reset) ont eu lieu dans ce scratch. `F:\Monark` : HEAD `ed647b7` à l'ouverture →
  `a0f47fef` maintenant, **par le commit orchestrateur `a0f47fe` (docs/CHANTIERS.md seul, `git diff --name-status` mesuré)**, `git status`
  0 ligne ; `lot/bell-adv-1` = `290548c` inchangé ; aucun `F:\Monark-wt-*` touché. Clone après mutants : DELIVERED 9 × OK, `git status` 0
  ; sha `volume.ts` `46fa184d…` et `collect.ts` `df00bdd1…` identiques avant/après.

Modèle résolu (R-1) : claude-fable-5-1

Addendum (13:5x UTC) : à la clôture de cet avis, `lot/etude-suite` = `74959c03` (> `a0f47fef`, commits orchestrateur ; fichiers hors `docs/` dans le delta : 0). La fusion à blanc mesurée est celle sur `a0f47fef` ; si le delta est docs-only, le compte N + 9 = 1067 vaut pour la pointe ; sinon l'orchestrateur rejoue la fusion avant G7.
