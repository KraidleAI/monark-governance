# CHECKPOINT-2 - NARABI-OPS-1c - avis du validateur-humain (verbatim, claude-fable-5-1, 2026-09-21, HEAD juge ff98be4)

# CHECKPOINT-2 (LIVRABLE) — NARABI-OPS-1c : **ACCEPTE-AVEC-CORRECTIONS** (4 corrections, liste fermée)

Validateur-humain `claude-fable-5-1`, 2026-09-21. Aucune correction ne touche `run.ts`, donc le sha `54619a40…` reste celui qui sera déployé à E-5. HEAD jugé `ff98be4` sur `lot/narabi-ops-1c`, base `5d177db`. `6bb2f84` et `c0027cb` sont tous deux ancêtres de HEAD (`--is-ancestor` = 0).

Contrôle des blobs : `run.ts` = `54619a40…`, `sentinel-catchup-budget.test.ts` = `bf3579da…`. Ils sont identiques entre HEAD, l'arbre de travail et les valeurs annoncées.

J'ai lu le RENDU `F:\tmp\narabi1c\RENDU-G1.md`, le diff de `run.ts`, le fichier de test en entier, `rpc.ts:140-200` et `ADR-NARABI-OPS-1.md:73,118-124`. Je n'ai pas lu la G2.

**Conditions du rejeu (AM-2 ter).** Copie `git archive HEAD` sous `F:\tmp\cp2-narabi1c\wt\`, sans `.git`, avec une jonction `node_modules`. Aucune écriture dans le dépôt, aucun réseau, aucun mail. Les variables d'environnement SMTP, ALERT, PROBE, MONARK_SENTINEL, NARABI et CHAINSTACK sont purgées.

**Résultats du rejeu, point par point**

- **Suite complète.** `npm run ci` sort en 0. Détail : `gate:vocab` 203 fichiers, `tsc` 0 erreur, 700 tests / 699 pass / 0 fail / 1 skip. Le skip est `fetch_only_inside_client`, pré-existant ; le test inter-fichiers, lui, tourne.
- **(a) Bloc d'écriture.** Le bloc `run.ts:235-249` (du `if` jusqu'à `process.exitCode`) est byte-identique à la base `:182-196`. `diff` est vide et le sha vaut `51091f1e…` des deux côtés. Le Mode B est donc inchangé.
- **(b) Jour normal, par rejeu différentiel.**
  - Méthode : j'ai rejoué le `run.ts` de la base et celui de HEAD, même stub, sur la fixture committée.
  - Sorties : exit 0 des deux côtés, `stopped:null`.
  - Fichiers : `timeline.jsonl` est identique modulo `sentinel_sha`, attendu puisque ce champ est le témoin de build. `state.json` et `public/state.json` sont byte-identiques.
  - End-JSON : les 10 clés de la base sont présentes, égales et dans le même ordre, plus `elapsed_ms` et `max_day_ms`.
  - Hash : le `line_hash` est celui de la ligne 3 de la fixture (L-4).
- **(c) Backlog de 20 jours, variable d'env absente.**
  - Créneaux successifs : 7 lignes, puis 7, puis 6, puis 0. Sorties : exit 1, 1, 0, 0. Les deux premiers portent `stopped:"catchup_budget"`. Lag : 13, puis 6, puis 0. `elapsed_ms` : 210 000, 210 000, 180 000.
  - Équivalence : la chaîne de 20 `line_hash` est égale à celle d'un run non borné de la base. Le `public/state.json` final est byte-identique. Le rattrapage borné produit donc exactement la même publication.
  - Tests committés : ils couvrent en plus le digest public égal au `digest_T` de la 7ᵉ ligne, le `\n` final, et `trackerReplay`. 11 tests sur 11 passent.
- **(d) Premier jour et comparaison stricte.** Le premier jour est toujours tenté : le mutant W-M2 rougit seul `first_due_day`. La comparaison stricte tient : le mutant W-M7 (`>=`) rougit 4 tests, dont `boundary_is_strict`.
- **(e) Entrées limites de `MONARK_SENTINEL_BUDGET_S`.**
  - Absent : 180 000 ms.
  - Rejetés par un throw : `"180.0"`, `" 60"`, `"60 "`, `"1e2"`, `""`, `"0x3C"`, `"+60"`, `"-60"`, `"60."`, `"60\n"`, chiffres pleine-chasse, chiffres arabes, `"1e400"`, `"Infinity"`, `"NaN"`, `"29"`, `"181"`.
  - `"060"` et `"00000000060"` sont acceptés et donnent 60 000 ms. C'est inoffensif (zéros de tête), à mentionner seulement.
- **(f) Horloge.** `run.ts` ne lit aucune clé d'horloge : seulement `MONARK_SENTINEL_{DIR,J0,BUDGET_S}`. `runDue` ne contient ni `Date.now` ni `performance.now`. La couture passe par le stub `--import`. Mon mutant V-2 (`Date.now` dans `main`) rougit 3 tests.
- **(i) Mutants.**
  - Sept mutants rougissent, restauration byte-exacte vérifiée à chaque fois (`54619a40…`) : W-M1, W-M2, W-M3, W-M7 (4 des 7 mutants du worker, rejoués par moi), plus les miens V-2, V-3 (`finally` de `maxDayMs` retiré) et V-4 (validation d'env retirée de `main`).
  - Un mutant survit : V-1. Dans ce mutant, `main` valide la variable d'env mais passe la constante 180 000 à `runDue`. Les 11 tests passent malgré cela.
  - Explication : le code réel est correct, puisque mon rejeu avec `BUDGET_S=30` donne bien 2 jours traités et un lag de 18. Mais aucun test committé ne discrimine ce câblage, car tous utilisent `"180"`, qui est aussi la valeur par défaut. D'où C1.
- **(j) Lint.** `eslint` sur les 2 fichiers du lot : 0 erreur. Le ratchet reste à 70/69, que le nouveau fichier soit présent ou non. Le diff n'ajoute donc rien.
- **(k) R-25.** Je mesure 440 insertions + 18 suppressions = **458**, soit ≤ 1 205.
  - La projection a été dépassée parce que mon checkpoint-1 a élargi les tests.
  - Je l'accepte : une seule unité, 2 fichiers, 71 lignes de production, et ce n'est pas un argument de vitesse (CA-10).
- **Non-écriture.** Les shas du dépôt sont identiques avant et après. `git status` est vide sur `F:\Monark-wt-narabi1c` et sur `F:\Monark`. `rpc.ts`, `sentinel-retry.test.ts` et `deploy/` n'ont aucun diff par rapport à la base.

**Checklist.**
- CA-6 : l'oracle est rejoué, mais la G2 tourne en parallèle, d'où C4.
- CA-7 : conforme. Les résiduels (i) et (ii) sont déclarés dans l'ADR avec leur déclencheur.
- CA-8 : conforme. R-1 est `claude-opus-4-8[1m]` et `error_origin` sera assigné au G7.
- CA-9 : la jonction `@monark/*` pointe vers main, mais aucun import ne passe par `@monark/sentinel` (grep = 0). Seul `@monark/hikae` est importé, et le lot ne le touche pas. Sans effet.
- CA-11 durci : le vrai `main` tourne en sous-processus depuis la fixture committée et les tuyaux sont inchangés. C1 couvre le seul tuyau annoncé et non exécuté.
- Anti-close : sans objet. Les constantes du test sont des quantités on-chain synthétiques d'offre et de flux, aucun prix.

**Corrections**

1. **C1 — bloquant pour le G7, test seul, `error_origin` worker G1 (couverture).**
   - Ajouter un test en sous-processus avec `MONARK_SENTINEL_BUDGET_S:"30"`.
   - Résultat attendu : `processedDays.length===2`, `lag:18`, `stopped:"catchup_budget"`.
   - Ce test tue le mutant V-1, qui doit être rejoué rouge.

2. **C2 — bloquant pour le G7, doc ADR, `error_origin` validateur + orchestrateur.** Je ne l'avais pas vu au checkpoint-1.
   - Le constat : `t0` est pris DANS `runDue` (`run.ts:115`). Le préambule (`loadState`, puis `rpc.finalized()`, un quorum séquentiel qui coûte 20 s par endpoint qui pend) n'est compté ni dans le budget ni dans `elapsed_ms`.
   - Le risque : avec `180 + 120 = 300 ≤ 300`, la marge absorbe ce préambule sans aucun reste.
   - Ce que l'ADR (`:123`) doit déclarer :
     - ce préambule fait partie du résiduel (ii) ;
     - le critère de NON pré-enregistré gagne une condition : durée murale systemd − `elapsed_ms` > 30 000 ms.
   - Un correctif de code (budget compté depuis le début de `main`) serait un autre lot. Je ne l'exige pas ici, pour ne pas changer le sha de `run.ts`.

3. **C3 — non bloquant, test, `error_origin` worker.**
   - Ma réponse à ta question (g) : le skip dans l'export public est LICITE. L'invariant vit là où `deploy/` existe, et le G7 privé le rejoue.
   - La condition du skip est pourtant trop large. `existsSync(SERVICE_FILE)` ferait sauter le test en silence si le `.service` était renommé dans le dépôt source.
   - Il faut sauter le test si et seulement si le RÉPERTOIRE `deploy/` est absent. Si `deploy/` est présent mais le fichier manquant, le test doit échouer.

4. **C4 — bloquant pour le G7.**
   - La G2 séparée doit être rendue PASS et consignée.
   - Si elle trouve un bloquant touchant `run.ts`, ce checkpoint-2 doit être rejoué.
   - Si elle diverge de la checklist, c'est une ESCALADE.

**(l) Ce que j'exige dans le RUNBOOK §6, plié au G7**
- Mode A est dit « RÉDUIT par -1c ». Les mots « supprimé » et « removed » n'apparaissent jamais.
- A.1 (`catchup.conf`) est CONSERVÉE pour A′, pour le résiduel (ii) et pour le préambule.
- Le symptôme nouveau est décrit : `stopped:"catchup_budget"`, exit 1 et `wrote N line(s)` à chaque créneau signalent une progression normale, pas une panne.
- Le réglage `MONARK_SENTINEL_BUDGET_S` est documenté : entier de 30 à 180, en drop-in dans un fichier distinct d'`override.conf`.
- Le critère `max_day_ms > 60 000` est présent.
- Un rattrapage déclenche un mail puis un rappel par jour UTC, et c'est voulu.
- `bash -n` sort en 0 sur chaque bloc ajouté.
- L'ADR `:118-124` dit déjà « REDUCED, not lifted » : conforme.

**(m) Checklist E-5, à exécuter dans cet ordre et à consigner au JOURNAL**
1. `<sha>` = fusion G7 de -1c sur `lot/etude-suite`. `--is-ancestor` vaut 0 pour `6bb2f84`, pour `c0027cb` ET pour le commit -1c. Les docs RUNBOOK et ADR sont dans ce même SHA.
2. `ci && lint && lint:ratchet` sont verts sur l'arbre FUSIONNÉ.
3. Sauvegarde de rollback côté VPS, sha consignés :
   - un tar de `/opt/monark-harness` ;
   - une copie de `/etc/systemd/system/monark-sentinel.{service,timer}` et du répertoire `.service.d/` ;
   - une copie de `/var/lib/monark-sentinel/timeline.jsonl`.
4. `git archive <sha>`. Le `sha256sum` du `run.ts` déployé doit être égal à celui de `git show <sha>:apps/sentinel/src/run.ts`, soit `54619a40…` si rien ne retouche `run.ts`. Même contrôle pour le `.service`.
5. `daemon-reload`, puis `systemctl show -p TimeoutStartUSec` = `5min`. `show -p Environment` doit porter J0 inchangé et AUCUNE `MONARK_SENTINEL_BUDGET_S`. Aucun `catchup.conf` résiduel.
6. `--dry-run` en tant que `sentinel` : l'end-JSON porte `elapsed_ms` et `max_day_ms`, et rien n'est écrit.
7. `restart` du timer, puis premier run :
   - `exit_code:0`, `stopped:null`, `chainstack:true` ;
   - `elapsed_ms` et `max_day_ms` consignés ;
   - durée murale (`ExecMainStartTimestamp` → exit) consignée, avec l'écart au `elapsed_ms` (C2) ;
   - endpoints listant `pocket` sans `llama` ni `blast`.
8. Au tir suivant de la sonde Bell : `healthy` et `state_checked:true`.
9. Critères de STOP et rollback : sha divergent, `TimeoutStartUSec ≠ 5min`, FATAL, ou `max_day_ms > 60 000`. Ce dernier cas déclenche un amendement, pas un rollback.

**AM-1, ce que j'ai attrapé**
- Le câblage de la VALEUR d'env vers `runDue` dans `main` n'est pas testé : le mutant V-1 survit.
- Le préambule est hors budget et hors `elapsed_ms`, avec une marge sans reste. C'est un angle mort de mon propre checkpoint-1.
- La condition de skip est trop large.

Ce que j'ai manqué : à signaler par l'orchestrateur a posteriori.

Modèle résolu (R-1) : `claude-fable-5-1`, effort high.
