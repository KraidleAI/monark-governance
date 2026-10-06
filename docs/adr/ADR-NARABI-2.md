claude-opus-5-5[1m]
# ADR-NARABI-2 — suite PAROXYSME-NARABI-1 : S1 servie, rejeu sans `pow` (S4), taux de référence de rolling90 (S3), X8/X10 tués — projet G0 pour checkpoint-1

- **Statut** : proposé (G0, projet worker). Checkpoint-1 dû ; aucun code avant son acceptation ET l'ordre d'engagement de la décision 259 (10) (corrections PR-4b et deux cp-2 clos).
- **Horloge** (`date -u`) : début 19:30:14Z ; rédaction 19:54Z ; sceau `ADR-NARABI-2.md.sha256`.
- **Base** : `F:\Monark`, `lot/etude-suite`, HEAD `7b83b57`, arbre propre, lu seulement ; aucun réseau, aucun git écrivant, aucun verrou.
- **Rédaction** : worker `claude-opus-5-5[1m]`, effort max ; advisor intégré (canal 1) consulté avant rédaction et avant livraison (avis, jamais verdict).
- **Décisions déclinées, non rediscutées** : 259 — QI-1 (B), QI-2 (A) conditionnel, QI-3 (A), QI-5 (A). Hors lot : C-PX2-c, C-PX1-b.
- **Entrées** : SYNTHESE-NARABI-1 §2 (PX-1, 2, 4, 14), §4-§6 ; avis defi A1-A3, marché B1, advisor C3/C5 ; CHANTIERS:1888 ; code et ADR cités fichier:ligne.
- **Pli cp-1 (2026-09-27 20:5x UTC — pli cp-1)** : v2 rédigée par un worker `claude-opus-5-5[1m]`, effort max, contexte frais (≠ auteur du G0), sous `F:\tmp\narabi-px2\mission-pli-cp1-narabi-2.md`. Entrées relues : rapport cp-1 `CP1-NARABI-2-report.md` (sha `dc34f4de…` = sha annoncé, `claude-fable-5-1`) ; ADR v1 `8e0fae69…` (= sha annoncé) ; code cité fichier:ligne ; `CROSSREF-PASS-2026-09-27.md` (sha `4ec5b267…`, troisième passe). Base : `F:\Monark`, HEAD `288d8a9` puis `a598730` pendant le pli (seul `docs/CHANTIERS.md` diffère de `7d2f108` ; aucun fichier cité modifié depuis `2f894d3`), arbre propre, lu seulement ; aucun réseau, aucun git écrivant, aucun verrou. **Aucun texte v1 effacé** : chaque ajout porte « 2026-09-27 20:5x UTC — pli cp-1 (C-n) » ; une seule mention barrée (« (à confirmer) », D3), jamais supprimée.
- **Statut (2026-09-27 20:5x UTC — pli cp-1)** : cp-1 rendu (Fable 5.1) : **approuvé-avec-corrections C-1..C-10 pour N2-1 et N2-3** ; **N2-2 non acceptée à ce cp-1** (cp-1 bis sur D5 après le G2 du prover 2) ; pas d'escalade. L'acceptation ne lève pas 259 (10) (cp-1 CA-8). G1 de N2-3 lancé par l'orchestrateur ; G1 de N2-1a et N2-1b après ce pli.
- **Décisions de l'orchestrateur pliées ici** : C-1 (Q-V-2 = (B)), C-2, C-3 (Q-N2-2 (A)), C-4, C-5 (Q-N2-7), C-6, C-7, C-8 (Q-V-1 = (a)), C-9, C-10 (Q-N2-5), suggestion S4′ (« exact integer arithmetic »), PR-N2-2 en cp-1 bis (Q-V-3 : faisabilité (90, 36) = prover 2, P2-5).

## D1 — Invariants (QI-1 (B))
Aucun PR ne touche la région du gate (q̂ committé), les paramètres officiels (`timeline.ts:20`), `trackerDigest`, `hashedFields`/`line_hash` (`timeline.ts:94-101`), `state.json`. Aucun nouveau segment de digest. `tracker.ts`, `timeline.ts`, `run.ts` : diff = 0.

## D2 — PR-N2-1 = S1 + S4 (C-PX1-a, C-PX10-a)
**S1** remplace la queue de `STABLE_RUN_COMMITTED_CORE` après « redemption flow; » (`gate.ts:117-121`), retouches defi A3 incluses :
> « coverage is stated under Theorem 2 of Barber, Candes, Ramdas and Tibshirani 2023 (split conformal, unit weights): at least 1 − α minus the average, over calibration pairs, of the total-variation distance between the distribution of the residuals and the same residuals with that pair swapped for the test pair; that distance is not estimated here, consecutive pairs share a window and the calibration is measured non-stationary across half-years, so the bound is at least 1 − α only if that distance is zero, which is not assumed here; no coverage is measured »

**2026-09-27 20:5x UTC — pli cp-1 (C-1, Q-V-2 = (B))** : S1 retenue en variante (B), « that of » inséré (distance entre deux lois) ; le texte v1 ci-dessus reste pour trace. **S1 v2** (remplace la queue après « redemption flow; ») :
> « coverage is stated under Theorem 2 of Barber, Candes, Ramdas and Tibshirani 2023 (split conformal, unit weights): at least 1 − α minus the average, over calibration pairs, of the total-variation distance between the distribution of the residuals and that of the same residuals with that pair swapped for the test pair; that distance is not estimated here, consecutive pairs share a window and the calibration is measured non-stationary across half-years, so the bound is at least 1 − α only if that distance is zero, which is not assumed here; no coverage is measured »

CORE v2 = tête v1 (`gate.ts:115-117` jusqu'à « redemption flow; ») + S1 v2 : 791 caractères (v1 : 659). La JSDoc `gate.ts:100-106` (« 1 - alpha is the coverage ONLY if … (exchangeability) ») est réalignée dans le même commit : la portée harness scanne aussi les commentaires (`vocab-banned.json:67`, A-9).

Invariant testé : S1 garde verbatim les 4 clauses fermées de `scripts/sync-harness-served.mjs:64-68` et les 3 de `apps/site/lib/how-copy.ts:82-86` (sinon `harness-served.test.ts:119`, `narabi-live.test.ts:892` et le `need()` du sync rougissent).

**2026-09-27 20:5x UTC — pli cp-1 (C-2)** : test nommé **`gate_description_pins_barber_clauses`** (`apps/harness/test/gate.test.ts`, à côté de `gate_sentence_barber` l.563, qui reste). **Liste fermée des clauses neuves**, verbatim : « the distribution of the residuals » ; « consecutive pairs share a window » ; « the bound is at least 1 − α only if ». Le test tient la liste en littéral et asserte, pour ces trois clauses et les quatre clauses fermées de `sync-harness-served.mjs:64-67` : présence dans `STABLE_RUN_COMMITTED_CORE`, dans `GATE_TOOL_DESCRIPTION` (tools/list) et dans `JSON.stringify(buildOpenApi())` (`/openapi.json`) ; absence de l'ancienne queue « calibration windows and the next one » et de « 1 − α is the coverage ». **Mutants tués par ce test** (pré-oracle `F:\tmp\narabi-px2\pli\lex2.mjs`, 5/5 rouges) : M1 ancienne queue (2 assertions), M2 sans « the distribution of » (1), M3 « 1 − α is the coverage only if » (2), M4 sans « consecutive pairs share a window » (1), M5 clause fermée retirée (1). Test non vide avant S1 : la description servie aujourd'hui ne porte aucune des trois clauses (mesuré).
- `scripts/sync-harness-served.mjs:64-68` : les trois clauses forment une liste exportée (`STABLE_BARBER_CLAUSES`) qui entre dans le contrôle fermé `need()` de l.68 (la synchro refuse d'écrire si la source du harnais les perd). Elles **n'entrent pas** dans la ligne de classe rendue (l.72) : le site rend `clauses.join("; ")` sur `/console` (`page.tsx:32`), `/integrators` (:210, :222), `/docs/integrators` (:85, :150), `/docs/research` (:122) et `/docs/use-cases` (:218), où « the bound is at least 1 − α only if » se lirait comme une phrase brisée ; `harness-served.json` garde ses cinq clauses. Contrôle croisé racine (`test/harness-served.test.ts`, non exporté) : liste exportée = littéral, chaque clause dans la CORE.
- `apps/site/lib/how-copy.ts:82-86` : `MEASURED_CLASS_CLAUSES` reçoit « the distribution of the residuals » et « consecutive pairs share a window » verbatim, et **« only if that distance is zero »** au lieu de la troisième : celle-ci porte le chiffre « 1 » (`scanText` de `apps/site/test/honesty-lint.ts` → `["1"]`, mesuré) alors que la réserve doit rester sans chiffre (`test/narabi-live.test.ts:897`) ; la forme retenue est l'extrait sans chiffre de la même clause de la CORE v2 (Q-PLI-1).

**2026-09-27 20:5x UTC — pli cp-1 (C-9)** : N2-1a nomme et réaligne `apps/site/lib/how-copy.ts:87-90` (`MEASURED_CLASS_RESERVE`, « …so the coverage above would need exchangeability… », mot que S1 retire). **Réserve v2** (sans chiffre ; rendue sous « What is not », `app/how/page.tsx:293`) :
> « For the one class calibrated on measured flow, Narabi's redemption-flow velocity, the served description is narrower: its bound is at least one minus α minus the average, over calibration pairs, of the total-variation distance between the distribution of the residuals and that of the same residuals with that pair swapped for the test pair; that distance is not estimated here, consecutive pairs share a window and the calibration is measured non-stationary across half-years, so the bound is at least one minus α only if that distance is zero, which is not assumed here; no coverage is measured. »

Hors le préfixe v1 inchangé, seuls « its bound is » et « one minus α » (pour « 1 − α », comme `/how` :280-281 « one minus a chosen miscoverage level α ») ne sont pas des extraits de la CORE v2. Les six clauses de `MEASURED_CLASS_CLAUSES` v2 sont des sous-chaînes de la CORE v2 et de la réserve v2 (mesuré). `narabi_how_reserve_extracts_served_clause` (:892) est étendu : ni « exchangeab » ni l'ancienne queue dans la réserve ; la réserve passe les règles de phrase de D7 (portée site). Mutants : M-C9 (réserve « would need exchangeability ») rouge ; M-C9b (réserve sans « consecutive pairs share a window ») rouge.

**S4′** (reformulée : la synthèse attribue les opérations binary64 au seul tracker ; or le score passe par deux divisions binary64 et une soustraction, `adapter-narabi.ts:197-198`, `timeline.ts:136`, et `bound_thm1` par `pow`, `timeline.ts:40-44`). Surfaces : README « Replay them yourself » et `/docs/verify` (site, régime T2) :
> « Replaying the scores and the tracker's threshold q needs only exact integer division, IEEE 754 binary64 conversion, subtraction, multiplication and division, which the standard requires to be correctly rounded, and comparisons, once each line's published step eta is taken as input instead of being recomputed: eta and the printed bound come from the engine's power function, an operation the standard only recommends, so engines may round it differently. »

**2026-09-27 20:5x UTC — pli cp-1 (suggestion du cp-1, retenue par l'orchestrateur)** : « exact integer division » → « exact integer arithmetic » : l'entier exact comprend S_open = close + burns − mints (`adapter-narabi.ts:187`, addition et soustraction `BigInt`) avant la division entière de l.197. **S4′ v2** :
> « Replaying the scores and the tracker's threshold q needs only exact integer arithmetic, IEEE 754 binary64 conversion, subtraction, multiplication and division, which the standard requires to be correctly rounded, and comparisons, once each line's published step eta is taken as input instead of being recomputed: eta and the printed bound come from the engine's power function, an operation the standard only recommends, so engines may round it differently. »

**Constat du pli (mesuré)** : sur `/docs/verify` (`apps/site/app/docs/verify/page.tsx:159-161`), S4′ porte « 754 » et « 64 » (`scanText` de `honesty-lint.ts` → `["754","64"]`) : le test 44 (`test/site-honesty.test.ts`, texte JSX) et `docs_data_is_clean` (`test/site-docs.test.ts:309-315`, littéraux des sources docs, chiffres compris) rougiraient ; aucune constante de lib ne contourne le second. Résolution dans N2-1b : Q-PLI-2.

Aucune affirmation sur ECMA-262 (P-PX10-a non lu). Construction : `packages/hikae/src/tracker-replay-eta.ts` (nouveau ; `trackerReplayFromEta(q1, alpha, steps)` = `imocpStep` + comparaison stricte, aucun `**`) ; rejeu de référence Python stdlib `apps/sentinel/test/replay_eta.py` (≈ 60 l.), ajouté à `vocab-banned.json` `scan.sentinel.files` (ligne d'ADR). Test `narabi_replay_eta_bit_exact` : série committée pliée par `initState`/`step` + capture live committée ; Node et Python rejouent depuis η publié ; `q_after` égal au bit (`writeDoubleBE`), digest égal. **En CI, python3 absent = rouge, jamais un saut** (saut déclaré en local seulement : sinon on recrée le motif X8/X10).

**2026-09-27 20:5x UTC — pli cp-1 (C-10, Q-N2-5)** :
- **CI** : `.github/workflows/ci.yml` n'a aucun `setup-python` (mesuré). N2-1b ajoute au job `g3-verification`, avant `npm run gate:vocab && npm run typecheck && npm test` (l.142), une étape `uses: actions/setup-python@<SHA 40 hex> # v<tag>` avec `python-version: "<X.Y>"` exact. Tag, SHA et version ne sont **jamais devinés** : item **CI-SETUP-PYTHON-PIN-1** (orchestrateur, avant le G1 de N2-1b) : lecture de `repos/actions/setup-python/git/ref/tags/<tag>` (object.type = commit, sinon déréférencer l'étiquette), FAITS daté, ligne de provenance ajoutée au bloc `ci.yml:6-10` (convention « never guessed ») ; le test 38 (2) (`uses:` épinglé par 40 hex) couvre l'épinglage. Interpréteur local mesuré pendant le pli : `python3 --version` → 3.14.5 ; le choix X.Y appartient au FAITS.
- **Saut local opt-in seulement** : `MONARK_SKIP_PY_REPLAY=1`. Sans la variable, python3 absent ⇒ le test échoue (message qui nomme la variable) ; avec elle, `t.skip` dont la raison nomme la variable (visible au TAP, jamais silencieux) ; `CI=true` et variable posée ⇒ échec (M9). `test/ci-gates.test.ts` asserte : étape `setup-python` épinglée avant `npm test` dans `g3-verification`, `python-version` au format X.Y, `MONARK_SKIP_PY_REPLAY` absente de tout fichier de workflow. **`npm run ci` local sans python = rouge.**
- **Déclaré** : `ci.yml` ne part que sur `pull_request` (l.18-19) et les fusions locales `--no-ff` n'ouvrent aucune PR (l.12-13, 187-189) : la garde qui mord est l'oracle local (suite + 7 portes sur clone `--no-local` sous verrou) ; son journal consigne `python3 --version` et n'y pose jamais `MONARK_SKIP_PY_REPLAY`.
- **Emplacement** : `narabi_replay_eta_bit_exact` vit dans `apps/sentinel/test/sentinel-replay-eta.test.ts` (glob `npm test`, portée vocab sentinel par le parcours de `apps/sentinel/test`).
- **Constats du pli (mesurés, portés par N2-1b)** : (i) `.py` absent de `TEXT_EXTS` (`scripts/lang-gate.mjs:106-108`) ⇒ `replay_eta.py` échapperait à `lang:gate` et au contrôle de langue de l'export (même filtre `scannable`, `export-public.mjs:548`) : ajout de `.py` (0 fichier `.py` suivi aujourd'hui, ajout inerte sur l'arbre) + contrôle (un `.py` en français planté rougit) ; (ii) `apps/sentinel/test/**` est exporté « package-style » (`export-public.mjs:36, 45`) : `replay_eta.py` et son test partent au miroir public, dont le job g3 dérivé reçoit la même étape (copie octet pour octet, test 42 (f′), `ci.yml:107-108`).

**2026-09-27 20:5x UTC — pli cp-1 (Q-G2-3 : décision de l'orchestrateur hors liste de mission, « S4 : binary64 sans contraction FMA »)** : la spec des deux rejoueurs l'exige : docstrings de `tracker-replay-eta.ts` et `replay_eta.py` (« each operation rounded on its own; a fused multiply-add changes the result ») ; `narabi_replay_eta_bit_exact` ajoute un témoin : l'émulation FMA (arithmétique rationnelle exacte, un seul arrondi de q − η·(α − E)) sur un cas où elle diffère (le G2 en compte 29 675 sur 300 000 appels, `G2-PROVER-report.md` §3, sha `7bc95d62…` ; générateur des cas : `F:\tmp\narabi-px2\g2\g2-a-t5.mjs` §1) diffère au bit du rejeu de référence ; sur la capture, le nombre de pas où elle diffère est mesuré et déclaré (0 admis). La phrase publique reste S4′ v2 ; la variante qui le dit est la question fermée Q-PLI-3.

**2026-09-27 20:5x UTC — pli cp-1 (C-8, Q-V-1 = (a))** : NARABI-SITE-REPLAY-ETA-1 entre dans N2-1b (condition R-25 : D8 amendé) : `apps/site/lib/narabi-live.ts:441-451` (`replayTracker` ; η recalculé l.445 par `trackerStepSize`, `**` l.430) rejoue depuis l'η publié de chaque ligne (`TimelineLine.eta`, l.95) ; `trackerStepSize` et `boundThm1` restent pour le contrôle de borne (l.670, 12 chiffres imprimés : S4′ dit que la borne vient de `pow`). Tuyau : D9 amendé. **Citation corrigée** : la mission du pli cite `test/narabi-live.test.ts:445` ; la ligne qui recalcule η est `apps/site/lib/narabi-live.ts:445` (`test/narabi-live.test.ts:445` appartient au test d'icône).

## D3 — Couplage servi de S1 (constat mesuré, bloquant au G7)
`buildOpenApi()` embarque la description (`openapi.ts:73`). Trois enregistrements committés épinglent l'octet servi : `docs/deploy-CA-harness.json` (check « openapi ») et `apps/site/data/narabi-served.json` (`narabi-live.test.ts:575-577`), `apps/site/data/harness-served.json` (`harness-served.test.ts:79`). Toute édition de `STABLE_RUN_COMMITTED_CORE` les rougit jusqu'à : redéploiement du harnais (go investisseur) → `verify-harness.mjs --out docs/deploy-CA-harness.json` → `sync-harness-served.mjs` et `sync-narabi-served.mjs` → re-pins `PINNED` (`harness-served.test.ts:48-52`) et `manifest.sha256.json`. Dans la PR, sans réseau : trace h5 ré-enregistrée, `TRACE_SHA256_PINNED` (`h5-e2e-probe.test.ts:80`), `PROVENANCE-h5-e2e-trace.md`, `PINNED[H5]`, manifest. Séquence : gel → go → redéploiement depuis le SHA du gel → CA + syncs (actes réseau de l'orchestrateur) → pli « enregistrements » → cp-2 → G7. `RUNBOOK-harness.md:36-42, 65` expédie `git archive … HEAD` depuis la machine de l'orchestrateur : un arbre au SHA du gel est admissible, aucune règle lue n'exige le tronc ~~(à confirmer)~~. `deploy-CA-harness.json` compte au R-25 (seul `docs/**/*.md` est exclu). Scission : Q-N2-2.

**2026-09-27 20:5x UTC — pli cp-1 (C-5, Q-N2-7 fermée par l'orchestrateur)** : « (à confirmer) » levé. L'archive de déploiement du harnais est tirée du **SHA du gel** de N2-1a, `git archive --format=tar.gz <sha-du-gel> apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs`, **jamais `HEAD`**. `docs/RUNBOOK-harness.md:42` (« It reads from `HEAD` ») et `:65` (`git archive --format=tar.gz HEAD`) reçoivent **dans N2-1a** une ligne datée (docs, hors R-25), en anglais comme le RUNBOOK : « A lot deploy ships the archive of the frozen SHA named by the orchestrator, never HEAD; that SHA is recorded in JOURNAL-PROVENANCE. » L'égalité octet pour octet entre le document servi et l'arbre reste prouvée contre le CA ré-enregistré (`narabi-live.test.ts:575`, `harness-served.test.ts:79`).

## D4 — PR-N2-3 = PX-14 (QI-5 (A), nouveau lot sur le gel 3 `b45db28`)
- **X8** : `realpathFor(platform)` exporté (`instrument-replay.ts:186`) ; test d'identité `realpathFor("win32") === realpathSync.native`, `realpathFor("linux") === realpathSync` ; `pathKey` reçoit un résolveur injectable (défaut inchangé), test espion.
- **X10** : garde extraite en `linkOrSkip(create, skip)` ; méta-test : erreur non-EPERM ⇒ lève, EPERM ⇒ `skip` appelé.
- Tués sur tout hôte. `sentinel_sha` (`run.ts:156-161`, hors hachage) change au prochain redéploiement : déclaré au JOURNAL-PROVENANCE ; redéploiement = go (hors lot).

## D5 — PR-N2-2 = C-PX4-a (QI-3 (A))
- **Nulle** : iid Bernoulli(p) sur la sous-suite des paires calmes consécutives, E_static contre q₁ (`timeline.ts:142-145`) = `state.calmMiss` après pli de la série committée par `initState`/`step` (même pli qu'`instrument-replay.ts:141-166`) ; `CALM_WINDOW`, `DRIFT_THRESHOLD` importés (36/90 exact en binary64).
- **p, rendus, jamais tapés** : p̂ = ratés / paires calmes (≈ α par construction de q̂, déclaré) ; p_ref = max in-sample du glissant-90 (27/90, ADR-M012 D6).
- **Densité déclarée** : d = 365 × paires calmes / paires de la série committée, rendue par le script (≈ 321 = 365 × 616/700 [calc. worker sur la fixture]) ; le « 336 calmes / 365 j » d'ADR-M014:106 porte sur une fenêtre non précisée et n'est pas repris.
- **Calcul** : loi exacte du scan (Glaz Thm 13.2, Fu 2000) ; contrôles (13.48) avec Q′₂ exact (13.5) et Q′₃ (13.6), (13.79) ; énumération exhaustive sur petits (m, k, N) ; Monte-Carlo à graine (contrôle, jamais publié).
- **Préconditions de la mission** : rendus Glaz p. 223, 224-225, 232, 241 (acte interne, QO-4 (A), désormais dus) ; faisabilité du Thm 13.2 à (90, 36) établie au rendu (E3 D4 « 72 états » = [dériv. non certifiée]) ; Q-N2-1 et Q-N2-3 fermées.
- **Fichiers** : `apps/sentinel/src/scan-rate.ts` (CLI à garde) ; `apps/sentinel/test/sentinel-scan-rate.test.ts` ; README « What Narabi is NOT » (S3 rendue par le test depuis les données).
- **Format de rendu** : p à 3 décimales ; d entier ; ARL à 2 chiffres significatifs, notation scientifique au-delà de 10⁶ (`2.4e13`).
- **2026-09-27 20:5x UTC — pli cp-1 (décision de l'orchestrateur ; Q-V-3)** : PR-N2-2 **n'est pas acceptée à ce cp-1** : **cp-1 bis après le G2 du prover 2**, sur D5 seul ; la faisabilité du Thm 13.2 à (90, 36) relève du prover 2 (P2-5) ; **aucun code avant**. Pour mémoire, non plié ici : prover 2 rendu (`F:\tmp\narabi-px2\p2\PROVER-2.md`, sha `fb70e36e…`) ; d'après CHANTIERS (HEAD `a598730`), P2-5 réfute « 72 états » et ouvre la voie DP exacte + Thm 13.3 ; les décisions Q-P2-1..3 de l'orchestrateur se plient dans D5 avant le cp-1 bis, après le G2 de ce prover.

## D6 — S3 (gabarit ; portées narabi_docs, site, sentinel, harness vertes)
> « rolling90 carries no false-alarm bound: under a reference null of independent calm misses, the 36-of-90 threshold is first reached after about {arl_ref} calm pairs on average, counted from the first calm pair, at the in-sample record rate {p_ref}, about {y_ref} years at {d} calm pairs a year, and after about {arl_hat} at the calibration's own calm rate {p_hat} (scan statistics, Glaz, Naus and Wallenstein 2001); calm misses are serially dependent, so these are reference rates, not bounds. »

Remplace « rolling90 carries no false-alarm control » (prévue par ADR-M014:111, servie nulle part aujourd'hui). Indicatif [calc. worker, non certifié, jamais publié] : ARL à p = 0,30 ≈ 830 paires (MC 2·10⁴ tirages, e.s. 5) contre 1/u ≈ 318 entre franchissements montants ; l'écart ×2,6 fonde Q-N2-1.

## D7 — Oracle lexical
Chaque phrase servie passe `gate:vocab` (portée de sa surface ; fichier racine `vocab-banned.json`, la mission cite à tort `apps/harness/`), `lang:gate`, et `site_names_no_kitchen` pour `apps/site`. Un test par PR repasse les chaînes rendues par `compilePatterns`/`scanText` (patron A-9 d'`instrument-replay`). Licites : rate, reference, bound ; jamais « probability of being right », « proven », « guaranteed ». Pré-oracle rejouable (scratchpad `n2/lex.mjs`, oracles du dépôt importés en lecture, pas le gate CI) : S1, variante Q-N2-4, S4′, S3 ×2 = 15 cellules vertes ; 7 mutants = 11/11 rouges.

**2026-09-27 20:5x UTC — pli cp-1 (C-7)** : « jamais proven / guaranteed / probability of being right » était une règle de persona, pas d'oracle (cp-1 CA-6 : « proven bounds » vert en narabi_docs, site et sentinel ; « the standard guarantees » vert en narabi_docs ; « probability of being right » vert en site ; ici, « proven » dans S1 est aussi vert en harness, L4). Elle devient un oracle **scopé par phrase et par surface**, dans la PR qui sert chaque phrase. Mesure d'un ajout en portée entière sur l'arbre `a598730` (`F:\tmp\narabi-px2\pli\impact.mjs`, oracles du dépôt importés ; lignes existantes touchées) :

| Motif | harness | site | narabi_docs | sentinel |
|---|---|---|---|---|
| `\bproven\b` | 1 | 9 | **0** | 15 |
| `guarante` | 6 (déjà couvertes par `(?<!\bno\s)guarantee`, l.72) | 0 (déjà banni, l.56) | **0** | 6 |
| `probabilit` hors négation (forme harness, l.89) | 0 (déjà banni) | 12 | 2 | 0 |

Les touches sont des usages légitimes (p. ex. `ukemi-predict.ts:15` « proven equal to … », `token/page.tsx:63` « a commit proven faulty », `docs-pieces.ts:77`) : portée entière **seulement à 0 touche**, `narabi_docs` += `\bproven\b`, `guarante` (N2-1b, première PR qui sert une phrase dans le README). Partout ailleurs, **règles de phrase** : bloc fermé `served_sentence_banned` dans `vocab-banned.json` (ligne d'ADR ; `$comment` qui nomme phrases et surfaces) = { `\bproven\b` ; `guarante` ; `(?<!\bnever a )(?<!\bnot a )(?<!\bno )\bprobabilit\w*` }, appliqué par le test de la PR à la chaîne servie, sur chacune de ses surfaces, avec GLOBAL + les règles de la portée :

| Phrase | Surfaces | PR | Test |
|---|---|---|---|
| S1 v2 (CORE) | harness (`gate.ts` ; tools/list, `/openapi.json`) | N2-1a (introduit le bloc) | `gate_description_pins_barber_clauses` |
| Réserve v2 | site (`how-copy.ts`, `/how`) | N2-1a | `narabi_how_reserve_extracts_served_clause` étendu |
| S4′ v2 | narabi_docs (README), site (`/docs/verify`) | N2-1b | test racine `narabi_replay_sentence_served` (`test/narabi-live.test.ts`) |
| S3 (gabarit, rendu) | sentinel (`scan-rate.ts`), narabi_docs (README) ; site à NARABI-SITE-S3-1 | N2-2 | `sentinel_scan_rate_readme_rendered` |

Pré-oracle rejoué (`F:\tmp\narabi-px2\pli\lex2.mjs`, sortie `lex2.out.txt`) : S1 v2, réserve v2, S4′ v2, S4′ v2-FMA, S3 gabarit (4 surfaces), S3 rendu (3) = **32/32 cellules vertes** (règles actuelles, puis actuelles + règles de phrase, + `lang:gate`) ; **12/12 mutants rouges** : M1-M5, M-C9, M-C9b, L1 S3 « proven bounds » (avant 0 partout ; après narabi_docs 2, sentinel 1, site 1), L2 S4′ « the standard guarantees » (narabi_docs 0 → 2), L3 réserve « probability of being right » (site 0 → 1), L4 S1 « proven » (harness 0 → 1), L5 S3 « not guaranteed » (0 → 2 et 1). Générateur = vérificateur de ce pré-oracle : D11.

## D8 — Ordre, dépendances, prix (R-25 : asc. ≤ 547, ×2,1, STOP 1 150)
| PR | Dépend de | asc. | ×2,1 | C (j) | Mutants tués attendus |
|---|---|---|---|---|---|
| N2-1 | 259 (10) ; go redéploiement avant G7 | 210-300 (+ contenu site ≈ 6) | 441-630 | 2,5 | M1 retour « calibration windows and the next one » ; M2 sans « the distribution of » ; M3 « 1 − α is the coverage » ; M4 sans « consecutive pairs share a window » ; M5 clause fermée retirée ; M6 η recalculé par `**` (η publié décalé d'1 ulp) ; M7 `>=` ; M8 signe ; M9 saut python en CI |
| N2-3 | aucune dépendance de code (verrou d'oracle seul) | 60-100 | 126-210 | 1 | X8 ; X10 ; X10b lève sur EPERM ; X8b `pathKey` ignore l'injection |
| N2-2 | rendus Glaz ; Q-N2-1, Q-N2-3 | 200-300 | 420-630 | 2 (+ R 0,1) | K1 seuil 35 ; K2 toutes paires évaluables ; K3 E contre q ; K4 chiffre README édité ; K5 d ignorée ; K6 contrôle (13.48)/(13.79) hors tolérance |

Ordre : N2-1 jusqu'au gel (texte servi le plus faux, doctrine C5 (3)), puis attente du go ; N2-3 pendant l'attente ; N2-2 en dernier. C ≈ 5,5 j.

**2026-09-27 20:5x UTC — pli cp-1 (C-3, Q-N2-2 = (A))** : R-25 par sous-PR. Estimation ascendante (asc.) en ins + del (une ligne modifiée = 2), chemins CODE contre CONTENU comme `ci.yml:82-86` ; ×2,1 = pire dérive mesurée ; STOP 1 150 ; borne CI 1 205 ; la table v1 reste pour trace.

| PR | Contenu (fichier : asc.) | asc. CODE | ×2,1 | CONTENU | Dépend de | Mutants tués attendus |
|---|---|---|---|---|---|---|
| N2-1a | `gate.ts` CORE 11-12 + JSDoc 10-11 ; `gate.test.ts` (test C-2) 22-32 ; `sync-harness-served.mjs` 5-7 ; `how-copy.ts` 13-15 ; `narabi-live.test.ts:892` 4-6 ; `harness-served.test.ts` (PINNED + contrôle croisé) 9-10 ; `h5-e2e-probe.test.ts:80` 2 ; `fixtures/PROVENANCE-h5-e2e-trace.md` 3-6 ; `vocab-banned.json` (bloc de phrase) 6-8 ; au pli « enregistrements », après redéploiement : `docs/deploy-CA-harness.json` 6-10, `apps/site/data/harness-served.json` 8-10, `narabi-served.json` 4, `manifest.sha256.json` 6 ; hors compte : `fixtures/h5-e2e-trace.json`, `RUNBOOK-harness.md` | 110-150 | 231-315 | 0 | 259 (10) ; go de redéploiement (260) avant G7 | M1-M5, M-C9, M-C9b, L3, L4 |
| N2-1b | `tracker-replay-eta.ts` 25-40 + export 1-2 ; `replay_eta.py` 50-70 ; `sentinel-replay-eta.test.ts` (Node, Python, bit, digest, garde, témoin FMA) 70-100 ; README S4′ 7-10 ; `vocab-banned.json` 4 ; `lang-gate.mjs` `.py` + contrôle 5-8 ; C-8 (a) `narabi-live.ts` + `narabi-live.test.ts` 14-28 ; C-10 `ci.yml` + `ci-gates.test.ts` 10-16 ; Q-PLI-2 (A, recommandée) 5-7 ; test de phrase S4′ 5-8 | 195-295 | 410-620 | 5-8 (`app/docs/verify`) | 259 (10) ; gel de N2-1a (bloc `served_sentence_banned`) ; CI-SETUP-PYTHON-PIN-1 | M6-M9, M6′ (η décalé d'1 ulp suivi par la page), témoin FMA, L2 |

- N2-1a : la mesure du G1 (avant redéploiement) est **sous** celle de la fusion : les quatre enregistrements (≈ 24-30) n'arrivent qu'au pli « enregistrements » (D3).
- N2-1b : **condition de C-8 (a) vérifiée au G1** : asc. mesurée (pathspec CODE de `ci.yml:82`) ≤ 547 ⇒ (a) ; > 547 ⇒ repli (b) déclaré (`trackerReplayFromEta` référence de test, `upcoming` ; README, `/docs/verify` et `replay_eta.py` seuls tuyaux servis) et NARABI-SITE-REPLAY-ETA-1 maintenu.
- N2-3 inchangée (60-100). N2-2 : estimation v1 (200-300) suspendue jusqu'au cp-1 bis.
- N2-1a + N2-1b = 305-445 asc. contre 210-300 (+ ≈ 6) en v1 : l'écart vient de C-2, C-7, C-8 (a), C-9, C-10 et des trois constats du pli (`.py` de `lang:gate`, chiffres de S4′ sur le site, témoin FMA).
- **Ordre amendé** : N2-1a jusqu'au gel, puis attente du redéploiement ; pendant l'attente, N2-1b (empilée sur le gel de N2-1a) et N2-3 ; N2-2 après son cp-1 bis. Fusion de N2-1a avant N2-1b.

## D9 — Tuyaux (règle Branchement)
| PR | Entrée | Sortie servie | État | Test non-LLM | `upcoming` jusqu'à |
|---|---|---|---|---|---|
| N2-1 S1 | `STABLE_RUN_COMMITTED_CORE` | `tools/list`, `tools/call`, `/openapi.json` | aucun | `h5-e2e-probe`, `gate_sentence_barber`, `harness_served_data_matches_in_process_harness` | redéploiement harnais (go) + CA + syncs |
| N2-1 S4 | colonnes `s`, `eta`, `q_after` | README, `/docs/verify` ; `trackerReplayFromEta`, `replay_eta.py` | aucun | `narabi_replay_eta_bit_exact` | release et déploiement site (go) |
| N2-3 | chemins `--out`, garde de lien | CLI `instrument-replay` (RUNBOOK §7 (3)) | aucun | `sentinel-instrument-replay.test.ts` | rien de public ; `sentinel_sha` au redéploiement (go) |
| N2-2 | `usde-calib-series.json` (`7c33027a…`) pliée | README S3 | aucun | `sentinel_scan_rate_readme_rendered` | release (go) ; `sentinel_sha` au redéploiement |

**2026-09-27 20:5x UTC — pli cp-1 (C-3, C-8 (a))** : lignes par sous-PR (la table v1 reste pour trace) :

| PR | Entrée | Sortie servie | État | Test non-LLM | `upcoming` jusqu'à |
|---|---|---|---|---|---|
| N2-1a S1 | `STABLE_RUN_COMMITTED_CORE` v2 | `tools/list`, `tools/call`, `/openapi.json` ; `/how` (réserve v2, extraits) | aucun | `gate_description_pins_barber_clauses`, `h5-e2e-probe`, `harness_served_data_matches_in_process_harness`, `narabi_how_reserve_extracts_served_clause` | redéploiement depuis le SHA du gel (C-5) + CA + syncs ; release du site (go) pour `/how` |
| N2-1b S4′ | colonnes `s`, `eta`, `q_after` du `timeline.jsonl` publié | README, `/docs/verify` ; `/narabi` : `replayCheck` rejoue q depuis l'η publié (`narabi-live.ts:441-451`, port de `trackerReplayFromEta`, même motif que `replayTracker` ↔ `trackerReplay` : le site n'importe aucun `@monark/*`, `apps/site/package.json`) ; `replay_eta.py` (rejeu tiers) | aucun | `narabi_replay_eta_bit_exact` (Node = Python au bit, digest) ; `narabi-live.test.ts:795-803` étendu : port = `trackerReplayFromEta` = `trackerReplay` = `replay_q` sur la capture ; M6′ : l'η d'une ligne décalé d'1 ulp, la page suit l'η publié et non `**` | release et déploiement du site (go) |

`trackerReplayFromEta` est la référence du port, jamais servie seule : son consommateur servi est le port de `/narabi`, épinglé par la composition ci-dessus (CA-11 ; cp-1 C-8).

## D10 — Lignes datées (QO-6 (A) : orchestrateur ; `error_origin` proposés, assignés au G7)
| # | Cible | Porteur | `error_origin` proposé |
|---|---|---|---|
| 1 | `gate.ts:117-121`, ADR-M012 D7 | commit N2-1 | rédaction M012 D7 (C-10 du cp-1 : forme sous indépendance) |
| 1′ (2026-09-27 20:5x UTC — pli cp-1, C-3) | idem | commit **N2-1a** | inchangé |
| 2 | ADR-M014:95-96 (c) | orchestrateur ; construction NARABI-L-2 | rédaction M014-a |
| 3 | ADR-M014:111-112 | commit N2-2 | aucun (source nouvelle) |
| 3b | ADR-M012:95 « ≈ 2,5 % » : queue exacte P(Bin(90 ; 0,30) ≥ 36) ≈ 2,74 % [calc. worker], rendue par le script | commit N2-2 | rédaction M012 D6 (approximation normale non déclarée) |
| 4 | `PLAN-m008-f2b-usde.md:82` | orchestrateur | planification F2-B |
| 5 | `G1-lot-narabi-l.md:591` | commit N2-3 | génération du G1 + lacune CA-9 du cp-2 (259 (6)) |
| 6 | `PAROXYSME-Narabi.md` l. 93, 116, 194, 198 | orchestrateur | l. 93 = n° 1 ; l. 116 réemploi d'ID par E2 ; 194/198 mise à jour |
| 7 | `L-lecture-tibshirani2019-barber2023.md` l. 11, 14, 17 | orchestrateur | rédaction de la fiche |
| 8 | mission G0 : « P-PX4-c/d/i ✔ Crossref » | orchestrateur | rédaction de la mission (seul c résolu : `CROSSREF-PASS` l. 5 ; d, i absents) |
| 8′ (2026-09-27 20:5x UTC — pli cp-1, C-6) | l. 8 mise à jour | orchestrateur | inchangé (rédaction de la mission) ; **mise à jour** : c résolu à 19:20Z (`CROSSREF-PASS` l. 5) ; d et i résolus en **troisième passe 20:01:11Z** (l. 38), après la rédaction de l'ADR (19:54Z) : P-PX4-d Lou 1996 = 10.1080/01621459.1996.10476727 (l. 42), P-PX4-i Schwager 1983 = 10.1080/01621459.1983.10477947 (l. 47) ; fichier sha `4ec5b267…`, 23/23 |

## Items formés (propriétaire : orchestrateur)
| Item | Déclencheur | Action |
|---|---|---|
| C-PX4-b (nulle markovienne) | P-PX4-d, P-PX4-i identifiés (passe Crossref bibliographique ; P-PX4-e incomplet) | demandes mainteneur, G0 propre |
| C-PX4-b′ (2026-09-27 20:5x UTC — pli cp-1, C-6) | **P-PX4-d et P-PX4-i procurés (demandes mainteneur envoyées)**, avec P-PX4-c (identité 19:20Z) ; identités d et i résolues 20:01:11Z (l. 8′) ; P-PX4-e : identité incomplète (Glaz p. 262), à compléter par l'orchestrateur | demandes mainteneur, G0 propre |
| C-PX4-c (bootstrap) | P-PX4-f + OCR Künsch (R-3) + D1 (E3) certifié | G0 propre |
| C-PX1-b | G7 de C-PX2-c(i) + rendu Barber PDF 19, 26 (P-PX1-c) | G0 propre, dernier rang |
| C-PX2-c | G2 du prover C-PX2-b | G0 propre (S2) |
| S5 ; S7 | NARABI-L-2 ; C-PX16-a (trace en k + simulation) | hors lot |
| Rendus restants (§3 D) | la construction qui les porte | rendu d'une page (doc 03 §6) |
| NARABI-SITE-S3-1 | G7 de N2-2 | S3 sur la carte « Pre-registered drift criterion » (données site épinglées, T2) |
| NARABI-SITE-S3-1′ (2026-09-27 20:5x UTC — pli cp-1, C-7) | G7 de N2-2 | S3 sur la carte, **chiffres épissés** depuis les données épinglées, jamais tapés ; **test de copie sans chiffre** (motif `narabi-live.test.ts:579-584`) ; règles de phrase de D7 sur la surface site |
| NARABI-SITE-REPLAY-ETA-1 | G7 de N2-1 | contrôle navigateur par η publié (`narabi-live.ts:445` recalcule par `**`) |
| NARABI-SITE-REPLAY-ETA-1′ (2026-09-27 20:5x UTC — pli cp-1, C-8, Q-V-1 = (a)) | **entre dans N2-1b**, clos à son G7, si l'asc. mesurée au G1 ≤ 547 ; sinon repli (b) déclaré et l'item reste | `narabi-live.ts:445` rejoue depuis l'η publié, sans `**` (D9 amendé) |
| P-PX10-a (ECMA-262, lecture sur place) | avant toute phrase publique « au bit » | FAITS daté |
| CI-SETUP-PYTHON-PIN-1 (2026-09-27 20:5x UTC — pli cp-1, C-10) | avant le G1 de N2-1b | FAITS daté : tag, SHA (`git/ref/tags/<tag>`, object.type), `python-version` X.Y ; ligne de provenance `ci.yml:6-10` |

## Questions fermées à l'orchestrateur
- **Q-N2-1 — quantité de S3.** (A) premier franchissement depuis la première paire calme (ARL de la loi du scan), en paires calmes, conversion par d — **recommandé** (méthode décidée ; le premier tir ouvre un ADR, ADR-M012 D6) ; (B) franchissements montants par an, forme close E = P(Bin(90, p) ≥ 36) + (N − 90)·p(1 − p)·b(35 ; 89, p) [calc. worker, vérifiée par énumération sur 32 cas, à certifier], qui compte les re-franchissements d'un épisode ; (C) les deux. Si le Thm 13.2 est intraitable à (90, 36) : exact jusqu'à N ≤ quelques m, puis (13.48)/(13.79) dites « approximation ».
- **Q-N2-2 — scission de N2-1.** (A) N2-1a (S1 + enregistrements, attend le go) et N2-1b (S4, sans acte d'hôte) — **recommandé** (D3) ; (B) une PR, S4 attend le go.
- **Q-N2-3 — 259 (6) : D1/D2 (E3), O2/O3 (E2) « avant le G0 de PX-4 ».** La mission prover C-PX2-b (T1-T5) ne les couvre pas. (A) mission prover dédiée (R ≈ 0,5 j) ; cp-1 accepte N2-1 et N2-3, N2-2 sous condition de son G2 — **recommandé** ; (B) ruling : non porteurs pour S3 telle qu'écrite (ni taille ni bootstrap), dus au G0 de C-PX4-b/c, ligne datée.
- **Q-N2-4 — S1.** (A) texte décidé tel quel — **recommandé** ; (B) « … and that of the same residuals … » (d_TV entre deux lois), vert ×2.
- **Q-N2-5 — second langage.** (A) Python stdlib + garde CI — **recommandé** ; (B) rejeu JS à entiers émulant binary64, sans interpréteur.
- **Q-N2-6 — 259 (2) ordonne S1 → S4 → S5 → S3 ; S5 vit dans NARABI-L-2 (déclencheur 2026-10-18).** (A) ordre de priorité : S3 peut précéder S5, ligne datée — **recommandé** (textes indépendants) ; (B) séquence stricte : le G7 de N2-2 attend celui de NARABI-L-2.
- **2026-09-27 20:5x UTC — pli cp-1 : décisions de l'orchestrateur** : Q-N2-1 (A) ; Q-N2-2 (A) (C-3) ; Q-N2-3 (A) ; Q-N2-4 **(B)** (C-1, Q-V-2 ; remplace la recommandation (A)) ; Q-N2-5 (A) + C-10 ; Q-N2-6 (A). Questions du cp-1 : Q-V-1 (a) ; Q-V-2 (B) ; Q-V-3 : faisabilité à (90, 36) = prover 2 (P2-5).
- **Q-N2-7 — archive de déploiement (2026-09-27 20:5x UTC — pli cp-1, C-5)** : **fermée** : SHA du gel, jamais `HEAD` ; ligne RUNBOOK dans N2-1a (D3).
- **Q-PLI-1 — troisième clause C-2 dans `how-copy.ts`.** (A) extrait sans chiffre « only if that distance is zero » (forcé par `narabi-live.test.ts:897`) — **recommandé** ; (B) « the bound is at least 1 − α only if » dans `MEASURED_CLASS_CLAUSES` et levée du contrôle sans chiffre de la réserve : ouvre un chiffre tapé sur `/how`.
- **Q-PLI-2 — S4′ sur `/docs/verify` (« 754 », « 64 »).** (A) identifiants bornés dans `ALLOWED_ID` (`apps/site/test/honesty-lint.ts:50`) : « IEEE 754 » et « binary64 » verts, « 754 » et « 64 » nus toujours rouges (contrôles au test 44) — **recommandé** ; (B) entrées `754` et `64` au fichier d'exemptions (précédent `256`, `25519`) : « 64 » nu deviendrait licite sur tout le site (la borne servie `cascade_nodes` vaut 64) ; (C) S4′ sans chiffre sur le site seulement : deux textes pour une phrase.
- **Q-PLI-3 — FMA dans la phrase (Q-G2-3 = oui).** (A) S4′ v2 telle que fixée par la mission ; l'exigence reste dans la spec des rejoueurs (docstrings, témoin) ; (B) **S4′ v2-FMA** : « …which the standard requires to be correctly rounded, each rounded on its own and never fused into a multiply-add, and comparisons… » (518 caractères ; pré-oracle vert narabi_docs, site, `lang:gate`) — **recommandé** : la phrase dit à un tiers ce qu'il faut pour rejouer, et un port contracté en FMA diverge (G2 §3 (g)).

## D11 — MAST (2026-09-27 20:5x UTC — pli cp-1, C-4)
Source : corpus, doc 06 §6.4 ; identifiants tels qu'employés par `docs/adr/ADR-BELL-OTS-ANCHOR-1.md:280-293` ; article MAST (arXiv:2503.13657) non relu par ce rédacteur : niveau [2nd] via le corpus. Gloses du rédacteur.

| Mode | Menace dans ce lot | Contre-mesure |
|---|---|---|
| FM-3.3 (vérification incorrecte) | générateur = vérificateur du pré-oracle lexical : le worker qui écrit S1, la réserve, S4′ et S3 rejoue lui-même `lex2.mjs`, hors gate CI | gate CI (`gate:vocab`, `lang:gate`, tests de phrase de D7) sur l'arbre de chaque PR, rejoué par l'oracle local ; rejeu indépendant au checkpoint (cp-1 : 18/18 et 11 mutants propres ; de même au cp-2) |
| FM-3.1 (terminaison prématurée) | saut Python local silencieux : le lot clôt vert sans le rejeu du second langage | C-10 : saut opt-in `MONARK_SKIP_PY_REPLAY=1` seulement, déclaré au TAP ; python3 absent sans la variable = rouge ; refus en CI (M9) ; `setup-python` épinglé ; `python3 --version` au journal de l'oracle |
| FM-3.3 (vérification incorrecte) | circularité README ⇄ test de rendu (K4, N2-2) : le test lirait ses chiffres dans le README qu'il vérifie, ou l'écrirait | le test recalcule depuis la fixture épinglée (`usde-calib-series.json` `7c33027a…`) par la fonction pure du script et compare aux octets committés du README ; le test n'écrit jamais le README (écriture = CLI à garde) ; K4 (chiffre du README édité) rouge |

## Sources et niveaux
S1 : Barber et al. 2023 Thm 2 [lu E1] via SYNTHESE §2 PX-1 ; S4′ : IEEE 754-2019 §5.4 (« shall »), §9.2 et Table 9.1 p. 58-59 (« should ») [lu E6] ; S3 : Glaz et al. 2001 ch. 13 [lu E3], Thm 13.2 et (13.6) illisibles, rendus dus ; code : [vérif. worker] fichier:ligne ; tout chiffre (2,74 %, 830, 318, 321, 7e-12) : [calc. worker, indicatif, non publié].

**2026-09-27 20:5x UTC — pli cp-1** : cp-1 `CP1-NARABI-2-report.md` [lu] ; `CROSSREF-PASS-2026-09-27.md` troisième passe [lu] ; `G2-PROVER-report.md` §3, §7 [lu] ; prover 2 : sha relu, contenu [2nd] via CHANTIERS ; `ci.yml`, `lang-gate.mjs`, `honesty-lint.ts`, `site-docs.test.ts`, `export-public.mjs`, `narabi-live.ts`, `how-copy.ts`, `sync-harness-served.mjs`, `vocab-banned.json`, `RUNBOOK-harness.md` : [vérif. worker] fichier:ligne ; mesures `pli/impact.mjs`, `pli/lex2.mjs` : [calc. worker, rejouables, sorties `*.out.txt`] ; R-25 : estimation, jamais mesure.

## Journal (UTC)
19:30:14 début ; lectures ; contrôles worker (scratchpad `n2/`) : `upx.mjs` (forme close contre énumération, 32 cas, écart relatif max 7e-12 ; MC 2·10⁶ paires à p = 0,30 : 6 332 contre 6 279), `arl.mjs` (ARL ≈ 830, e.s. 5), `lex.mjs` (15 vertes, 11/11 rouges ; rejoué sur les trois phrases de ce fichier : 9/9 vertes) ; CORE reconstruite depuis `gate.ts` : 5/5 clauses fermées, forme sous indépendance absente ; 19:54 rédaction ; 19:57 premier sceau ; second avis (niveaux, densité, règle de déploiement) ; sceau final.

**2026-09-27 20:5x UTC — pli cp-1** : 20:22:10 début ; lectures (mission ; cp-1 et ADR v1 aux sha annoncés ; code cité ; CROSSREF-PASS) ; HEAD vu `288d8a9` puis `a598730` (seul `docs/CHANTIERS.md` change) ; `pli/impact.mjs` (motifs en portée entière) ; `pli/lex2.mjs` (32/32 vertes, 12/12 rouges) ; `python3 --version` 3.14.5 ; advisor intégré consulté avant rédaction (avis, jamais verdict) ; rédaction 20:51 ; sceau `ADR-NARABI-2.v2.md.sha256` ; second avis ; sceau final.

## Pli orchestrateur (2026-09-27 20:56 UTC) — décisions Q-PLI-1..3, portage v2
- v2 (sha `5d85a5aa…`, rapport `PLI-cp1-narabi-2-report.md` sha `00152f1e…`, worker `claude-opus-5-5[1m]`) portée telle quelle ; v1 `8e0fae69…` contenue ligne pour ligne (contrôle orchestrateur).
- **Q-PLI-1 = (A)** : `how-copy.ts` porte « only if that distance is zero » ; le contrôle sans chiffre de la réserve (`narabi-live.test.ts:897`) reste — aucun chiffre tapé sur `/how`.
- **Q-PLI-2 = (A)** : `ALLOWED_ID` (`honesty-lint.ts:50`) reçoit « IEEE 754 » et « binary64 » ; « 754 » et « 64 » nus restent rouges ; contrôle au test 44 ; entre dans N2-1b avec S4′.
- **Q-PLI-3 = (B)** : S4′ v2-FMA (518 caractères) est le texte public ; l'exigence « trois arrondis séparés, aucune contraction FMA » devient aussi la spec des rejoueurs (Q-G2-3) ; pré-oracle à rejouer au G1 de N2-1b.
- **Ordre** : G1 N2-1a maintenant (worktree `F:\Monark-wt-n2-1a`, branche `lot/narabi-2-n2-1a`, base tronc) ; N2-1b empilée sur le gel de N2-1a, après FAITS CI-SETUP-PYTHON-PIN-1 (orchestrateur) ; N2-3 en G1 (en vol) ; N2-2 au cp-1 bis après le G2 du prover 2.
- **Citation corrigée** (constat du pli) : la ligne qui recalcule η est `apps/site/lib/narabi-live.ts:445` ; la mission du pli et le cp-1 citaient `test/narabi-live.test.ts:445` — `error_origin` : orchestrateur (rédaction de mission).
