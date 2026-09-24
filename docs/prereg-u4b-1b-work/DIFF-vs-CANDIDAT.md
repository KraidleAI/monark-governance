# DIFF — `PLAN-u4b-prereg.md` FINAL vs `docs/PLAN-u4b-prereg.CANDIDAT.md`

Worker `claude-opus-4-8[1m]`, 2026-09-22, HEAD `0534551`. Chaque changement est justifié par une **source mesurée** (fichier:ligne / commit / décision). Regroupé par section. Les changements marqués **[FAIT MERGÉ]** découlent de l'état du dépôt qui a évolué depuis la rédaction du candidat (2b-ii/2b-iii fusionnés) ; **[R-21]** = correction d'une affirmation inexacte du candidat ; **[MISSION]** = exigence explicite de la mission ; **[ADVISOR]** = raffinement issu de la consultation.

## En-tête / marqueurs

1. **HEAD `b38a399` → `0534551`, date 2026-09-21 → 2026-09-22.** Source : `git rev-parse HEAD` = `0534551` ce tour.
2. **[MISSION 7]** Retrait de la « NOTE ORCHESTRATEUR (2026-09-21) — ce fichier est le CANDIDAT » (candidat l.260-263) et des mentions « CANDIDAT/DRAFT ». L'historique des rulings Q1-Q11 et la note orchestrateur (4) sont déplacés en **Annexe A datée**. Source : mission (« retire les marques CANDIDAT/notes de brouillon, garde l'historique des rulings en annexe datée »).
3. **[R-21]** L'affirmation d'en-tête « le script de course refuse de démarrer sans `--prereg-sha` == sha256 LF du blob committé de CE fichier » (candidat l.3) est **FAUSSE au HEAD** et **remplacée** par la description du mécanisme PROCÉDURAL réel. Source : `record.ts:239-241` — le garde est **optionnel** (`if (args.preregSha !== undefined)`) et compare à `docs/PLAN-u4-prereg.md` (U-4 LIVRE), jamais à ce prereg. Enforcement U-4b = commit seul + recompute des 9 sha par l'orchestrateur + marqueurs sonde. → Question ouverte **Q-A** ; la phrase D4 de l'ADR-U4b est signalée à amender (R-20).

## §DISC — sélection d'épisode

4. **[R-21]** `LIQ_TOPIC = u3-realized.mjs:54` → **`:52`**. Source : `sed -n 52p` = `export const LIQ_TOPIC = keccak256("LiquidationCall(...)")` ; `:54` = `UPGRADED_TOPIC` (périmé, candidat).
5. **[R-21]** « `u3-realized.mjs:3-5,:40` » (trois clusters) → **`:6-8` (commentaire des trois événements) / `:73-77` (`EVENTS`)**. Source : mesuré ce tour (`:3-5` = note POOL-RPC-1a ; `:40` = `export const POOL`).
6. **[ADVISOR]** Ajout de la distinction **B0 (= `--block`, B_first−1) vs B_lo (22803459, borne getLogs) vs `--from-block` (plancher d'énumération Transfer aWETH)** dans le pseudocode. Source : `record.ts:71` (`max(reserveInitBlock, fromBlock)`) ; §DISC.
7. **[ADVISOR]** Ajout du constat « l'outil de la passe getLogs LiquidationCall n'est PAS figé » (`u4b-discover.mjs` absent ; `u4-oracle-path.mjs` fait `AnswerUpdated`, pas `LiquidationCall`). Source : `ls scripts/census/u4b/` ; en-tête `u4-oracle-path.mjs`. → **Q-D**.

## Définitions / §Y

8. **[R-21]** Throw non-USDT `u4b-scores.mjs:112` → **`:113`**. Source : `sed -n 113p` = le `throw … deficit_base_no_price on non-USDT asset`. (`:112` = `if (dn > 0n) {`.)
9. **Score** : citation précise `u4b-scores.mjs:245` = `const score = Y > yhat ? Y - yhat : 0n;` + `STRATA_CUTS` `:54` + réserve WETH `:89-90`. Source : mesuré. (Le candidat portait le score en §Définitions sans la ligne exacte ; le G7 SCORE-1 `error_origin` a épinglé `:245` après insertion du commentaire.)
10. **[R-21]** `toBase … u3-realized.mjs:101-104` → **`:101` (`floorDiv`) / `:103-104` (`toBase`)**. Source : mesuré.
11. **[R-21/MISSION 2]** `--labeler-sha` requalifié de « argument obligatoire » (candidat §Y, §5a, §sonde f) en **marqueur écrit par l'orchestrateur** dans la sonde/brut — car `record.ts` (`parseUkemiArgs:130-174`) **n'a pas** ce flag. → **Q-B**.
12. **[ADVISOR]** Le paramétrage -1b du labeler est écrit comme **PRÉCONDITION** (pas détail) : `EVENTS:73-77`, `RAWLOGS_SHA:43`, chemin prereg `:405` sont e2 **en dur** ; réducteur pur `:81-267` inchangé ; condition (i-a) → **9ᵉ** sha (au lieu de « 8ᵉ », renumérotation). Source : `u3-realized.mjs` mesuré.
13. Champ de fil `region.kind` : ajout des références de contrat gelé (`packages/contracts/src/types.ts`, `schemas/coverage-verdict.schema.json`). Source : ADR-U4b amendement 2026-09-22 §2.

## §2 — table des sha

14. **[MISSION 1]** La table passe de **8 lignes** (candidat : 7 gelés + labeler) à **9 lignes** = **8 gelés + labeler**, en ajoutant **`packages/contracts/src/calib-digest.ts` (#8, `contracts_frozen`)** qui n'était qu'en PROSE dans le candidat. Source : ADR-U4b amendement 2026-09-22 §3 (table de 9 lignes incl. `calib-digest.ts 3603265d…`). Recompute HEAD `0534551` : 9/9 concordent (MESURES §1).
15. **Titre** « Tableau des 8 sha GELÉS » → « des 8 sha GELÉS + labeler » ; référence ADR du #1 précisée « amendement 2026-09-22 §3 » et #7 « amendement 2026-09-21 §1 ». Source : ADR mesuré.
16. Note de bas de table : « était 2b-ii NON fusionné » retiré ; ajout « lot SCORE-1 fusionné `6652ed0` » et la seule édition `:245`. Source : `docs/G7-lot-u4b-score-1.md`.

## §5 — lignes de commande FIGÉES (réécriture majeure, [FAIT MERGÉ])

17. **[FAIT MERGÉ / MISSION 2]** §5a recorder : `--exclude-operators mevblocker` (candidat l.184) → **`--operators drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack`** (5 keyless + chainstack ; **nombre de keyless FIGÉ = 5**). Source : `record.ts:244-256` (`--operators` liste d'inclusion, `--exclude-operator` supprimé en 2b-ii) ; `transport.ts:34-35` ; item G7 GARDE-HELIUS-2b-ii §5 (« risque d'abstention varie à l'inverse du nombre de keyless — paramètre à figer »).
18. **[MISSION 2]** Ajout explicite des **6 arguments requis sans condition** : `--ledger-dir`, `--cycle`, `--floor`, `--max-ru`, `--method-caps` (non vide), `--max-calls` (>0). Source : `record.ts:223-235`.
19. **[MISSION 3 / ADVISOR]** `--floor <FLOOR-INSTANCE>` et `--max-ru <MAX-RU-INSTANCE>` = **deux instances DISTINCTES** (la mission écrivait les deux `<FLOOR-INSTANCE>`). Justification de l'écart : `client.ts:74` (`floor ≤ cap`), `:113`/`:118` (deux plafonds séparés : `runCaps` = coût du run, `cycleFloor` = prior de cycle). Règle pré-enregistrée : floor lu au dashboard (somme des réseaux, décision 121) ; max-ru ≤ 16 M − floor (Q7). Valeurs = instances de sonde AVANT le premier appel.
20. **[R-21]** `--prereg-sha` du recorder : clarifié **optionnel** et comparant `docs/PLAN-u4-prereg.md` (valeur `9209cdab…`, MESURES §2), PAS ce prereg. Source : `record.ts:239-241`.
21. **[ADVISOR]** `--max-calls`/`--method-caps` : ajout de la **RÈGLE de dérivation** (go en deux temps `--filter-only` → `9 × n_at_risk_config` + énumération + marge déclarée). Source : `record.ts:344-377,367`. Le candidat laissait `<n>` nu.
22. **[R-21]** §5b `reconcile` : ajout de **`--op chainstack`** (manquant au candidat) ; `--mode` est un argument de `reconcile`, pas du recorder. Source : `cli.ts:4,22-32` ; `reconcile.ts:26-28`.
23. **[MISSION 2 / note 5]** §5c : ligne de commande **complète du labeler sous `env -u CHAINSTACK_ETH_URL`** (KEYLESS-ONLY, CARTO-T1-1) avec `--rawlogs`, `--prereg-sha` (`835805cc…`, PLAN-u3-prereg.md), `--max-calls`, `--raws-dir`, `--only`. Source : `u3-realized.mjs:273-274` (jambe Chainstack hors garde si var posée) ; CHANTIERS:614 ; `:400-408` (args).
24. **[ADVISOR]** Les **sondes d'env du labeler** sont nommées (`CHAINSTACK_ETH_URL:273`, `U3_MIN_INTERVAL_MS:282`) ; « aucune sonde d'env » n'est écrit QUE du recorder (`record.ts:221-222`), pas du labeler. Source : mesuré.
25. **[MISSION 2]** §5d : lignes complètes **`u4b-reduce.mjs`** (`--book-raw --oracle-raw --labels --event-id --episode-tag [--out]`), **`u4b-scores.mjs`** (book/oracle/u3 positionnels, tous requis), **`record-u4b-calib.mjs`** (`--scores [--scale 1]`). Source : `u4b-reduce.mjs:10-11,31-36` ; `u4b-scores.mjs:278-296` ; `record-u4b-calib.mjs:9,64-69`.
26. **[R-21]** Retrait de l'affirmation candidat (l.188) « `record.ts:17,328-330` importe encore les URL de `rpc2.ts` et lit `CHAINSTACK_ETH_URL` » — **FAUX post-2b-ii** : `record.ts:24` importe de `@monark/rpc-guard`, `:221-222` ne lit aucune clé. Ordre du pool = `transport.ts:34-35` (candidat citait `rpc2.ts:268-269` → réels `:248-249`).

## §Sonde / §4 / §6

27. **[R-21]** §e : mevblocker **N'EST PAS exclu** pour le recorder (candidat : `--exclude-operators mevblocker`, « ETH_CALL 2 groupes marge nulle »). Recorder eth_call = **3 opérateurs distincts** {drpc, mevblocker, pocket} — « marge nulle » de -1a **résolue**. L'exclusion D-5 est locale à `u4-oracle-path.mjs:63-65`. Source : `rpc2.ts:4-5` (mevblocker dans le quorum eth_call) ; `operatorOf` `rpc2.ts:28-31`.
28. **[R-21]** §e : retrait des références `u4-probe.mjs:29` (fichier **supprimé** `d311809`) ; `u4-oracle-path.mjs:56-57,127` requalifié (prober, migré sous garde 2b-iii). Source : merges.
29. **[MISSION / ADVISOR]** §Sonde : ajout du **go en deux temps `--filter-only`** et de la dérivation `--max-calls`. Source : `record.ts:344-377`.
30. **[ADVISOR]** §sonde (f) : prereg-sha + labeler-sha + HEAD = **marqueurs procéduraux écrits par l'orchestrateur**, pas des flags de code. Source : `record.ts` (absence de flags).
31. **[R-21/ADVISOR]** §6 étape 1 (`unlock`) : le **`finally` du recorder fait déjà les N `unlock`** (`record.ts:429-432`) ; le `unlock` manuel n'est dû qu'après **crash dur** (`:426-428`). Le candidat présentait `unlock` comme une étape manuelle systématique.
32. **[MISSION 6 / ADVISOR]** Ajout du **journal de diagnostic durable sur course en ÉCHEC (C-R-b7)** + le **trou de code mesuré** : au HEAD, seul `BudgetExceededError` produit un rapport ; tout autre throw perd `rpc_errors`/`errByOp`/tally (provenance écrite seulement au succès, `:371`/`:400`). Source : `record.ts:407-434` ; item G7 GARDE-HELIUS-2b-ii §5. → **Q-C**.
33. §4 : `runReconcile(mode=…)` → CLI servie `reconcile --op chainstack --mode aggregate-calibration` ; ajout `AGGREGATE_ONLY_OPERATORS` `reconcile.ts:26-28`. Source : mesuré.

## §7 / nouvelles sections

34. **[FAIT MERGÉ]** Préconditions §7 : « GARDE-HELIUS-2b-ii en cours / non fusionné » → **SATISFAIT** (2b-ii `5394dfe` + 2b-iii `985fed9`) ; ajout précondition 7 (paramétrage labeler + prober D_e, Q-D). Source : merges.
35. **[MISSION note 2/4]** Clause **go U-6 conditionnel** promue de la « note orchestrateur (4) » (candidat l.261) au **corps §7**, verbatim décision 122 item 3. Source : CHANTIERS:610.
36. **[MISSION / ADVISOR]** Nouvelle section **QUESTIONS OUVERTES (Q-A..Q-D)** — liste FERMÉE de ce que le worker ne peut fixer sans décision (enforcement code vs procédure ; `--labeler-sha` ; journal d'échec ; outil §DISC/D_e). Source : mission (dernier §) ; advisor. Portée aussi dans le message final au parent.

## Corrections de 2e passe (advisor, sur références HÉRITÉES du candidat non re-mesurées à la 1re passe)

37. **[ADVISOR/R-21] Marqueurs temporels : sonde + SIDECAR daté, jamais le brut.** Candidat (en-tête, §Y, §sonde f, §8b/8c) : « écrits dans la sonde ET le brut de découverte ». **FAUX exécutablement** : le brut est écrit par `record.ts:400` avec sa propre `provenance` qui ne porte que le `prereg_sha` U-4 (`:393` ; `--resume` meta idem `:331-333`) ; y injecter des marqueurs U-4b = altération d'artefact. Remplacé partout par « sonde go/no-go + **fichier sidecar daté** (sha_brut ↔ prereg-sha ↔ labeler-sha ↔ HEAD), jamais le brut ». Renforce Q-A/Q-B.
38. **[ADVISOR/R-21] §5b `reconcile` : PROGRAMMATIQUE, pas un binaire shell → Q-E.** Candidat/1re passe : `node <cli> reconcile …`. Mesuré `cli.ts:1-44` : `runCli(argv, deps)` sans `main`/run-guard, `package.json` sans `bin`, deps `{ledgerDir, floor, readSnapshot}` INJECTÉS (pas argv) ; seul appelant non-test = `record.ts:431` (`unlock`). §5b fige l'`argv`, marque l'invocation servie **absente au HEAD** → **Q-E**.
39. **[ADVISOR] §Sonde temps 1 `--filter-only` porte AUSSI les 6 args requis.** Mesuré : `record.ts:224-247` (throws) sont AVANT la branche `filterOnly` (`:345`). Ajout : temps 1 a son propre `--max-calls` (énumération getLogs ~1 412/op + holders×2 + marge) ; MÊME `--resume` aux deux temps. Le candidat ne dérivait que le temps 2.
40. **[ADVISOR/R-21] §8d numéros de ligne re-mesurés.** `book_digest 034fbff9` `ukemi.test.ts:29` → **`:33`** ; `PINNED_DIGEST 267cd991` `ukemi-u4-scores.test.ts:20` → **`:24`**. `PROVENANCE-u3.md:10` (b4d93590) re-vérifié CORRECT. `G0-lot-u4b:358` (C-15) et `docs/G7-lot-garde-helius-2b-iii.md` re-vérifiés PRÉSENTS/exacts. Source : `grep`/`sed -n` ce tour (MESURES §3).

## Inchangé (vérifié conforme, gardé verbatim)

- Décision 126 déjà dans le candidat : **H-3 conservateur sous ex æquo, H-2bis n ≥ 199, compteurs (3 vs 1 disjoints), score `max(Y−ŷ,0)`, `region.kind` inchangé** — vérifiés présents et corrects (mission 5). Chiffres e2 (509/565 nuls, q̂₀=231,70 $, q̂₁=3609978241254) conformes à l'ADR §4/§5 et au G7 SCORE-1.
- C-V-7 verbatim, formulation CA (a) verbatim, règle d'abstention verbatim, agrégat ≠ Σ jambes CLOS — gardés (rulings Q4/Q5 déjà rendus).
- Régime B / AM-1, plafonds décision 119/121, créneaux Narabi exclus — gardés.
