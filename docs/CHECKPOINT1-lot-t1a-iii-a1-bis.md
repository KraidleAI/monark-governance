# CHECKPOINT-1 (PLAN) — Bell T-1a-iii-a1-bis — AVIS PERSISTÉ (verbatim récupéré)

**Rôle** : RÉDACTEUR du PLI checkpoint-1 (persistance de l'avis + pli du plan). **Modèle résolu (R-1)** : `claude-opus-4-8[1m]`
(préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Provenance** : `claude-opus-4-8[1m]`, 2026-09-21, dépôt `F:\Monark` (HEAD `5724f05`) en LECTURE seule ; réviseur = orchestrateur
(R-21, vérification adversariale avant consommation). **R-20** : aucun commit, aucun workflow, aucun fichier du dépôt modifié —
écriture unique hors dépôt sous `F:\tmp\a1bis\pli-cp1\`. **AUCUN réseau, aucun secret lu.**

**Verdict du validateur** : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée C-1..C-13 ; **C-1..C-11 bloquantes avant G1**, C-12/C-13 non
bloquantes ; **aucune ESCALADE-INVESTISSEUR**). **Modèle résolu du validateur (R-1)** : `claude-fable-5-1` (Fable 5.1 épinglé ;
appariement Fable/Fable conforme au roster). Record persisté [lu] `docs/CHANTIERS.md:491-492`. Plan plié remplaçant :
`F:\tmp\a1bis\pli-cp1\G0-lot-t1a-iii-a1-bis.md`.

## 0. Provenance de CETTE persistance (item RÉSOLU, jamais dette nue)

L'artefact désigné par la mission pour l'avis intégral —
`F:\tmp\claude\F--Monark\a7659644-0519-4943-8b82-d50d7405fe34\tasks\ae2bc483ca9d2bdea.output` — est de **taille 0 octet**
(vérifié : le Read de ce fichier renvoie « file exists but the contents are empty » — preuve DIRECTE de l'octet-zéro). Le **verbatim intégral a néanmoins été
récupéré de première main** dans le journal de conversation du sous-agent validateur :
`C:\Users\KACIMI\.claude\projects\F--Monark\a7659644-0519-4943-8b82-d50d7405fe34\subagents\agent-ae2bc483ca9d2bdea.jsonl`,
**ligne 106** (dernier message `assistant`, 16 417 caractères ; l'`agentId` `ae2bc483ca9d2bdea` du journal == le préfixe de nom du
`.output` vide ⇒ **même sous-agent**). Ce document **n'est PAS une reconstruction** : la section « AVIS VALIDATEUR — VERBATIM »
ci-dessous est le message **tel quel**. Extraction reproductible :
`python -c "import json;print(json.loads(open(r'…/agent-ae2bc483ca9d2bdea.jsonl',encoding='utf-8').readlines()[106])['message']['content'][0]['text'])"`.
**sha256 du corps verbatim** : `99f761d7b9233d1ffed6ecd93ec6eea35f10bc1e391e06f473081a89514fe67d` (recomputable par la commande ci-dessus | `sha256sum`).

**Contrôles de concordance [lu] du RÉDACTEUR (R-21)** — les shas cités par le validateur au moment de sa revue (avis §1) sont
**re-vérifiés identiques** ce jour (le code jugé == le code à plier) :
- `docs/G0-lot-t1a-iii-a1-bis.md` `686c02e0…` (byte-identique au plan revu, 413 l.) ;
- `apps/bell/src/universe.ts` `d6026584…`, `apps/bell/src/universe-cli.ts` `560cd5d0…`, `apps/bell/test/universe.test.ts` `19edfb99…` ;
- `F:\tmp\cp1-a1bis\` présent (mesure C-8 [lu], Node 24.15.0) : `shim-fetch-only.mjs`, `shim-net-only.mjs`, `shim-net.mjs`, `probe.mjs`, `probe2.mjs`, `probe3.mjs`, `out1/`.

**Item formé à déclencheur** : si `ae2bc483ca9d2bdea.output` est restauré et diverge de ce verbatim, l'orchestrateur substitue le
`.output` et re-plie l'écart (aucun attendu : la source `.jsonl` est le transcript natif du même sous-agent).

---

## AVIS VALIDATEUR — VERBATIM (`agent-ae2bc483ca9d2bdea.jsonl:106`, `claude-fable-5-1`)

# CHECKPOINT-1 (PLAN) — Bell T-1a-iii-a1-bis — **ACCEPTE-AVEC-CORRECTIONS** (liste fermée C-1..C-13 ; aucune question investisseur)

## 1. Artefacts lus (contexte frais ; aucun fil de travail du planificateur)

Dépôt `F:\Monark`, branche `lot/etude-suite`, HEAD `b3acf20` à l'ouverture → `796b32d` à la clôture (seul `docs/TABLEAU-DE-BORD.md` a bougé, 4/4 ; le G0 est byte-identique, sha ci-dessous).

- `F:\Monark\docs\G0-lot-t1a-iii-a1-bis.md` (plan, 413 l.) ; `docs/G7-lot-t1a-iii-a1.md` ; `docs/CHECKPOINT2-lot-t1a-iii-a1.md` ; `docs/G2-lot-t1a-iii-a1.md:40-79` ; `docs/G2-DELTA-lot-t1a-iii-a1.md` ; `docs/PLI-lot-t1a-iii-a1.md` ; `docs/G0-lot-garde-helius.md:95-154` ; `docs/CHANTIERS.md:440-490` (décisions 112-115, checkpoint-1 GARDE-HELIUS).
- `apps/bell/src/universe.ts`, `apps/bell/src/universe-cli.ts`, `apps/bell/test/universe.test.ts`, `apps/bell/test/fixtures/universe/{issuer-assets,expected-universe-candidates}.json`, `apps/bell/src/rebase-crosscheck.ts:100-180,395-445` (etude-suite) et `F:\Monark-wt-b3db1a\apps\bell\src\rebase-crosscheck.ts:105-205,400-510,560-620` (lecture seule), `apps/bell/src/collect.ts:290-310`, `test/ci-gates.test.ts:1260-1349`, `apps/harness/test/server.test.ts`, `apps/harness/src/server.ts:182-184`, `test/byo-demo-probe.test.ts:140-199`, `.github/workflows/ci.yml:35-79`, `package.json:16`.
- **Toutes les citations `fichier:ligne` du G0 ont été ouvertes** : exactes (dont `ci-gates.test.ts:1329` = `assert.ok(testScript.includes("--test-force-exit") …)` — le verrou est bien là ; `:1269` du PLI est périmé, comme le plan le dit).

**Rejeu AM-2 ter** sous `F:\tmp\cp1-a1bis\` (3 shims, 3 sondes, `out1/`) ; **zéro octet dans le dépôt** : `git status --porcelain` vide avant/après ; shas identiques avant/après — G0 `686c02e0…`, `universe.ts` `d6026584…`, `universe-cli.ts` `560cd5d0…`, `universe.test.ts` `19edfb99…`, `server.test.ts` `b41689ce…`, `byo-demo-probe.test.ts` `df85e859…`, `ci-gates.test.ts` `5192437a…`.

## 2. Reformulation en une phrase par tâche (CA-1)

- **D1** : `persist()` écrit d'abord `budget.json {calls}` puis appende une ligne chaînée `{prev_entry_sha256, seq, calls_cumulative, entry_sha256}` ; à la reprise, chaîne re-dérivée + `ancre.calls ≥ tête` sinon throw. Reformulable.
- **D2** : `name`/`symbol` passent par une liste blanche de caractères, ≤ 64, sans motif monétaire, sinon champ vidé ; fixture prouvée identité. Reformulable.
- **D3** : test 22 lance le CLI avec `--import` d'un shim qui interdit le réseau et écrit un marqueur ; le test asserte le marqueur. Reformulable.
- **D4** : `closeAllConnections()` avant `close()` sur 5 sites ; flag conservé ; preuve = matrice. Reformulable.

## 3. Checklist

| Règle | Verdict | Preuve |
|---|---|---|
| CA-1 | **corrections** C-1, C-3, C-4, C-6, C-7, C-10 | des revendications plus larges que le mécanisme (« jamais un sous-compte », « sans réparation manuelle »), un « code devise » sans forme, `verifyChain` non spécifié sur la monotonie, une matrice ×30 non discriminante |
| CA-2 | conforme | aucune décision de valeur nouvelle ; le go de course reste gaté par l'investisseur (checkpoint-2 C-3) |
| CA-3 | conforme (à porter) | §10 : amendement ADR-T1aii D1-septies-bis à porter par l'orchestrateur, avec les précisions C-2 |
| CA-4 | conforme | « un worker, un worktree neuf » ; aucun fan-out |
| CA-5 | conforme + C-12 | table MAST §6 ; concurrence multi-run à nommer au PLI |
| CA-6 | **correction** C-10 | D4 : « ×30 = 0 échec » n'est pas une preuve à la puissance observée |
| CA-7 | conforme + C-11 | 5a/5b/6/CONV-1/2 formés avec déclencheur + propriétaire ; 5a : ceinture plus faible que présentée |
| CA-8 | conforme | modèle résolu `claude-opus-4-8[1m]`, advisor consulté, `error_origin` par correction |
| CA-9 | conforme + C-9 | D3 rejoué par moi (voir §4) ; la forme fetch-only laisse un egress — mesuré |
| CA-10 | conforme | une PR ≈ 335-510 + ~80 (C-3/C-6/C-9/C-11), très sous 1 205 ; aucun argument de vitesse |
| CA-11 | conforme + C-4/C-5 | tuyaux §7 déclarés ; le test de composition doit relire le journal produit par le run (durci) ; « format verrouillé » à rendre falsifiable |

## 4. Points d'attaque demandés — constats

**(1) D1.** *Crash-conservateur dans la fenêtre entre les deux écritures* : oui — ancre écrite d'abord ⇒ un kill avant l'append laisse `ancre.calls ≥ tête`, la reprise repart de l'ancre (sur-compte ≤ 1 pas). Mais **trois revendications dépassent le mécanisme** : (a) `persist()` tourne en `finally` **après** les deux envois RPC (`universe-cli.ts:159`) — un kill entre un envoi et son `persist()` **sous-compte ≤ 2 appels logiques** : c'est du write-behind à la granularité du persist, pas du write-ahead ; (b) un kill **pendant** `writeFileSync(budget.json)` (ancre tronquée ⇒ « malformed » ⇒ throw) ou pendant l'append (ligne torn ⇒ throw fail-closed du plan) exige une réparation manuelle ; (c) le Design B (head dans l'ancre) **ne bat pas non plus** la réécriture coordonnée (l'attaquant réécrit les deux fichiers de façon cohérente) — l'exiger serait du spec-gaming. Le seul ancrage hors de la main de l'opérateur est le **floor lu sur le tableau de bord Chainstack** (GARDE-HELIUS §3.1, décision 115 : 16 M RU). L'exposition d'une reprise trafiquée est bornée par `--max-calls` par run (le compteur in-process de `makeBudgetedCall`, `collect.ts:296-306`, ne dépend d'aucun fichier). **Design A confirmé** avec ces déclarations. *Qui compte quoi* : `pacedInner` (`universe-cli.ts:121`) met `withUniverseRetry` **sous** le tick ⇒ `calls_cumulative` = ticks logiques, pas tentatives (déjà attrapé par le checkpoint-1 GARDE-HELIUS, `CHANTIERS.md:487`) ⇒ **ce ledger de RUN n'est pas la source du rapprochement Chainstack ; le ledger de CYCLE (tentatives, write-ahead) l'est.** γ-prime vs import : acceptable **si** le verrou de format devient un test (C-3) — un import de test n'est pas un couplage src.

**(2) D2.** Forme = `[A-Za-z0-9 .,&()+'-]`, ≤ 64, refus `$` / code devise / `\d+\.\d+`. Fixture : les 8 `name` et 8 `symbol` (`issuer-assets.json`) sont ASCII, < 64, sans décimale ni `$` ⇒ **identité** ⇒ test 13 intact. **« 1.5x » est vidé** (`\d+\.\d+`) ; **« TSLA 420 » PASSE** (entier nu — indissociable de « S&P 500 », « 3M », « SP500 xStock ») : résidu réel sous la formulation « entiers scalés » de la clause anti-close, à déclarer. « code devise » n'a pas de forme.

**(3) D3 — mesuré (`F:\tmp\cp1-a1bis\`, Node v24.15.0, `file:///F:/…`)** : `--import` est **retiré de `process.argv`** (`argv[1]` = script, `argv.length` = 3 ; il vit dans `execArgv`) ⇒ la garde `import.meta` tire. **Shim fetch-only** : `fetch` bloqué, mais `https.request` et `http.request` → `ECONNREFUSED` = **une connexion a été tentée** (egress ouvert). **Shim `net.Socket.prototype.connect`** : `fetch`/undici (cause `SHIM: socket connect blocked`, sans override de `fetch`), `https.request`, `http.request` **tous bloqués** ; contrôle sans shim → `ECONNREFUSED` (tentative réelle). **CLI réel pristine sous le shim, cwd dépôt** : placeholder `http` ⇒ « not https » STOP exit 1 ; placeholder `https` ⇒ « SHIM: fetch blocked », exit 1, `budget.json {"calls":1}` (tick avant envoi) — **preuve déterministe du chemin post-préflight sans mutant** (celle que le G2-delta avait dû obtenir par déviation).

**(4) D4.** `startServer` renvoie un `HttpServer` node (`server.ts:182`) ⇒ `closeAllConnections()` existe (Node ≥ 18.2). Suffisance : indémontrable par mutant, le plan le dit honnêtement — mais **×30 n'est pas discriminant** : au taux observé 1/30, P(0 échec sur 30 | rien changé) = (29/30)^30 ≈ **0,36**. Verrou `:1329` vérifié.

**(5) Résidus** 5a/5b/6 : formés à bon droit (déclencheur + propriétaire), avec une réserve sur 5a (C-11). **(6) R-25** : base merge-base, pathspec `ci.yml:65`, une PR — conforme. **(7) MAST** : table complète ; concurrence à nommer au PLI (C-12). **(8)** Les 6 questions sont tranchées en §6.

## 5. Corrections (liste fermée — à plier dans le G0 avant G1 ; `error_origin` = plan sauf mention)

**C-1 (bloquant) — `docs/G0-lot-t1a-iii-a1-bis.md:68-73, :83-88, :403-404`** : réécrire le modèle de garantie en trois phrases : (i) « write-behind à la granularité du `persist()` : un kill entre un envoi et son persist sous-compte ≤ 2 appels logiques (une confirmation quorum-2) ; le write-ahead réel est le ledger de cycle GARDE-HELIUS (append avant fetch) » ; (ii) « la reprise est sans réparation manuelle pour un kill ENTRE les deux écritures ; une ancre ou une ligne tronquée ⇒ throw fail-closed, réparation manuelle consignée » ; (iii) « une réécriture coordonnée n'est pas détectable par un head dans l'ancre non plus ; l'ancrage hors opérateur = floor Chainstack (décision 115) ; exposition d'une reprise trafiquée ≤ `--max-calls` par run (cap in-process indépendant de tout fichier) ». Retirer « jamais un sous-compte » (`:71`).

**C-2 (bloquant) — `:287-290` (§4) et `:385-388` (§10 ADR)** : déclarer l'unité : `calls_cumulative` = **ticks logiques** (retry sous le tick, `universe-cli.ts:121`, non compté — H-B, GARDE-HELIUS cp-1) ; « ce ledger de RUN sert la reprise sans double compte et le cap de run ; il n'est **pas** la source du rapprochement Chainstack (ledger de CYCLE = tentatives) ». Porter l'unité et la borne d'exposition dans l'amendement ADR.

**C-3 (bloquant, CA-1/CA-11) — `:262-266`, `:275-280` (CONV-1)** : ajouter un test **`bell_universe_ledger_format_is_byte_identical_to_b3d`** important, **côté test seulement**, `LEDGER_GENESIS`, `chainedLedgerEntry`, `ledgerSha` de `../src/rebase-crosscheck.ts` (`:110-149`, identiques sur etude-suite et b3db1a `:117-156`) et assertant : même genesis ; sur un cœur synthétique, `entry_sha256` universe == `sha(JSON.stringify(core))` dans l'ordre d'écriture des champs ; head == `ledgerSha`. Mutant : hacher via `canonical()` ou renommer un champ ⇒ rouge. Sans ce test, « format verrouillé » n'est qu'un commentaire.

**C-4 (bloquant, CA-1) — `:75-81`** : spécifier `verifyChain` = re-dérivation `sha(core)` + `prev` enchaîné depuis genesis **+ `calls_cumulative` monotone non décroissant** ; et spécifier que la cohérence ancre/journal est `ancre.calls ≥ tête.calls_cumulative` (jamais l'égalité — la fenêtre de crash laisse l'ancre en avance). Sinon un G1 qui vérifie l'égalité casse la reprise post-crash.

**C-5 (bloquant, CA-11 durci) — `:106-110`, `universe.test.ts:304`** : `readPriorCalls` rendant `{calls, head}`, l'appel `:304` change ; le test de composition `bell_universe_cli_composes_from_file_to_artifact` doit **relire le journal écrit par le run**, le re-dériver (`verifyChain.ok`), et faire coïncider sa tête avec la ligne head de `PROVENANCE-univers-solana.md` produite — composition exécutée depuis l'artefact réel, pas un journal construit à la main.

**C-6 (bloquant, CA-1) — `:102-103` (M-order)** : ajouter au test de reprise une **simulation de crash** : `deps.appendFile` injecté qui throw après l'écriture de l'ancre ⇒ le run suivant reprend avec `priorCalls = ancre.calls` (≥ tête) **sans throw** ; sous M-order (append d'abord) la même simulation laisse `ancre.calls < tête` ⇒ throw ⇒ rouge. C'est la preuve exécutée de la conservativité, au-delà du spy d'ordre.

**C-7 (bloquant) — `:147-152` (D2)** : donner la **forme exacte** du refus « code devise » (liste fermée à frontières de mot, ex. `\b(USD|EUR|GBP|CHF|JPY|CAD|AUD)\b`, insensible à la casse) — une forme ouverte `[A-Z]{3}` faux-rejetterait un nom légitime ; étendre la liste sans-faux-rejet aux 8 `name` + 8 `symbol` de la fixture ; **déclarer** : « 1.5x » vidé, « TSLA 420 » **passe** (entier nu, indissociable de « S&P 500 ») — résidu borné (valeurs issues de la liste d'identité publique de l'émetteur ; rien de publié ce tour ; revue avant publication) ; ajouter à `provenanceMd` une ligne `identity_text_emptied=N` (compte seul) pour qu'une course qui vide N champs soit visible.

**C-8 (bloquant, CA-9 — mesuré) — `:176-182` (D3)** : le shim bloque au **niveau `net`** : `net.Socket.prototype.connect = () => { throw … }` (+ override `globalThis.fetch` en ceinture pour un message clair) — mesuré : fetch-only laisse `http/https.request` tenter une connexion ; le patch `net` bloque fetch/undici, https, http. Consigner la mesure (chemin `F:\tmp\cp1-a1bis\`, Node 24.15.0) dans le G0/PLI comme fait [lu].

**C-9 (bloquant) — `:184-189` (test 22)** : ajouter un **second sous-cas déterministe sous code pristine** : `spawnSync` avec placeholder **`https`** ⇒ le CLI franchit le préflight et **stderr porte le throw du shim** (`SHIM: …`), exit ≠ 0, aucune connexion — preuve que le shim est sur le chemin (non vacuité) et que l'egress est fermé **sans rejouer C-G2-4a dans un sous-processus** (la déviation G2-delta `:114-115` devient inutile par construction). Mutant : `--import` retiré ⇒ marqueur absent ⇒ rouge (déjà prévu) **et** sous-cas https ⇒ pas de throw shim ⇒ rouge.

**C-10 (bloquant, CA-6) — `:209-213` (D4)** : la matrice de preuve passe à **×100** (P(0 échec | inchangé) ≈ 0,034) ou déclare sa puissance ; ×30 ne discrimine pas (≈ 0,36). L'assertion `getActiveResourcesInfo()` reste la partie déterministe. `error_origin` D4 inchangé (worker, cause infra pré-existante).

**C-11 (bloquant, CA-7) — `:226-234` (5a) et §8 CP1-Q4** : la ceinture « 4 fondateurs » ne couvre qu'une fin prématurée **avant** la page des fondateurs (page 0 sur ~9, très probablement) ; une page courte à la page 3 passe la calibration. Décision : ajouter à la course une **sonde d'observation seule** — après l'ancre de fin, un GET `page+1` avec `maxRetries: 0`, en try/catch, **jamais un STOP**, résultat (statut / forme : tableau vide, longueur, 4xx) écrit dans la provenance (`past_end_probe=…`, aucun contenu) et compté au budget (+1 GET, amendement daté du PLI §6). Elle lève la [lacune] de première main lors de la première course sans pouvoir la casser ; 5a reste formé (la sonde **assertante** attend cette mesure). Si l'orchestrateur écarte la sonde, le PLI doit au minimum déclarer que la ceinture ne couvre pas une fin prématurée passée la page des fondateurs.

**C-12 (non bloquant) — `:326`** : nommer au PLI le résidu « deux runs sur le même dossier `--ledger` forkent le journal » avec son déclencheur (verrou `openSync("wx")` à CONV-2, calque GARDE-HELIUS cp-1).

**C-13 (non bloquant) — `:64`** : `ledger-universe.jsonl` matche le glob `^ledger-.*\.jsonl$` de `rebase-crosscheck.ts:441-452` (`ledgerPagesOnDisk`/`hasResumeState`) ; un `--out` partagé échoue déjà fail-closed sur `calls` vs `calls_used`, donc simple recommandation : un nom hors de ce glob (ex. `universe-budget-ledger.jsonl`).

## 6. Les six questions checkpoint-1

- **CP1-Q1** : **γ-prime confirmé**, sous C-3 (verrou de format par test) ; CONV-1/CONV-2 formés.
- **CP1-Q2** : la règle « qui fusionne le premier héberge » est **remplacée** : l'hôte est **`@monark/rpc-guard`** (G0 GARDE-HELIUS §3.2 déjà accepté ; décisions 112-114 : b3d-b1a avant garde-helius-1a) ; universe **migre** à CONV-2 ; ce lot fusionne avant les deux (hors ligne, gate de la course).
- **CP1-Q3** : **Design A confirmé**, B non exigé (il ne bat pas la réécriture coordonnée) — sous C-1/C-2/C-4/C-6.
- **CP1-Q4** : report de la sonde **assertante** confirmé ; sonde d'**observation** exigée (C-11).
- **CP1-Q5** : mid-course resume **reste formé** (capacité, comportement actuel sûr ; le coupler au ledger après D1 est le bon ordre).
- **CP1-Q6** : shim `--import` **confirmé**, au niveau `net` (C-8) avec le second sous-cas (C-9).

## 7. Décision

**ACCEPTE-AVEC-CORRECTIONS** (C-1..C-11 bloquantes avant G1 ; C-12/C-13 non bloquantes). **Aucune ESCALADE-INVESTISSEUR** : pas de décision de valeur ou de périmètre nouvelle ; l'acceptation d'une reprise trafiquée coordonnée est bornée par `--max-calls` et la course reste gatée par l'investisseur (C-3 du checkpoint-2, GARDE-HELIUS). R-25 projeté après corrections ≈ 415-590 ≤ 1 205, une PR.

**AM-1** — attrapé par la checklist : le shim fetch-only qui laissait `http/https.request` sortir (mesuré), la matrice ×30 non discriminante (puissance ≈ 0,36), le « jamais un sous-compte » plus large que le mécanisme (write-behind ≤ 2 appels), `verifyChain` non spécifié sur la monotonie (un G1 vérifiant l'égalité ancre/tête casserait la reprise post-crash), le « code devise » sans forme, la ceinture 4-fondateurs plus faible que présentée, et la règle d'hébergement contredisant le G0 GARDE-HELIUS accepté.

**Modèle résolu (R-1)** : `claude-fable-5-1`.

---

## Carte du pli (RÉDACTEUR) — correction → section du plan plié `G0-lot-t1a-iii-a1-bis.md`

Chaque correction a été pliée en **rouvrant** son `fichier:ligne` (concordance [lu] vérifiée par le RÉDACTEUR ; R-21).

| # | Bloq. | Section(s) pliée(s) du plan | Ancre code [lu] rouverte + constat |
|---|---|---|---|
| **C-1** | oui | §2 D1 (modèle de menace, 3 phrases) ; RÉSUMÉ 3-4 | `universe-cli.ts:159` `finally { persist() }` **après** les 2 envois quorum-2 ⇒ write-**behind** ≤ 2 appels logiques ; `collect.ts:297-314` cap `--max-calls` in-process (compteur `n`, indépendant de tout fichier) ; floor Chainstack déc. 115 (16 M RU). « jamais un sous-compte » retiré ; collatéral : le commentaire `:159` « never under-count » porte le même sur-claim ⇒ amendé au G1 |
| **C-2** | oui | §4 ; §10 ADR | `universe-cli.ts:121` `pacedInner` met `withUniverseRetry` **sous** le tick ⇒ `calls_cumulative` = ticks logiques ; ledger de RUN ≠ source du rapprochement Chainstack (= ledger de CYCLE, tentatives) |
| **C-3** | oui | §4 CONV-1 ; §2 D1 (tests/mutants) ; §7 | `rebase-crosscheck.ts:110` `LEDGER_GENESIS`, `:136-145` `chainedLedgerEntry`, `:147-149` `ledgerSha` exportés ; `:40` `sha` **non exporté** ⇒ oracle du test = reproduire `entry_sha256` d'un cœur de page par la fonction de hachage d'universe (pas d'import de `sha`) |
| **C-4** | oui | §2 D1 (contrôles de reprise/`verifyChain`) | calque `rebase-crosscheck.ts:403-419` ; `verifyChain` = re-dérivation `sha(core)` + `prev` enchaîné + `calls_cumulative` monotone ; cohérence **`ancre.calls ≥ tête` (≥, pas ==)** |
| **C-5** | oui | §2 D1 (tuyau, test de composition) ; §7 | `universe.test.ts:304` appel `readPriorCalls` (→ `{calls, head}`) ; test `:289-321` relit le journal du run, `verifyChain.ok`, tête == ligne head de `PROVENANCE-univers-solana.md` |
| **C-6** | oui | §2 D1 (mutants M-order) | `universe-cli.ts:159` ; `deps.appendFile` injecté qui throw **après** l'ancre ⇒ reprise sans throw ; sous M-order ⇒ rouge |
| **C-7** | oui | §2 D2 | `universe.ts:311` `name`/`symbol` ; fixture `issuer-assets.json` = 8 `name` + 8 `symbol` ASCII/<64/sans `$`/sans décimale ⇒ **identité** ; refus devise `\b(USD\|EUR\|GBP\|CHF\|JPY\|CAD\|AUD)\b` (i) ; « TSLA 420 » (entier nu) **passe** = résidu déclaré ; `identity_text_emptied=N` dans `provenanceMd` |
| **C-8** | oui | §2 D3 | shim au niveau `net.Socket.prototype.connect` (+ `fetch` en **ceinture**) ; mesure [lu] `F:\tmp\cp1-a1bis\` (Node 24.15.0) : fetch-seul laisse `http/https.request` tenter une connexion, le patch `net` ferme fetch/undici+https+http ; garde `import.meta` `universe-cli.ts:249` tire (argv[1]=script) |
| **C-9** | oui | §2 D3 (test 22) | `universe.test.ts:473-487` ; 2e sous-cas placeholder `https` ⇒ stderr `SHIM:`, exit ≠ 0 ; mutants (`--import` retiré ⇒ marqueur absent ; https ⇒ pas de throw shim) |
| **C-10** | oui | §2 D4 | matrice **×100** (P(0 échec\|inchangé) ≈ 0,034 ; ×30 ≈ 0,36 non discriminant) + `getActiveResourcesInfo()` ; verrou `test/ci-gates.test.ts:1329` ; `server.ts:182` `HttpServer` ⇒ `closeAllConnections()` existe |
| **C-11** | oui | §3 (5a) ; §8 CP1-Q4 ; §6 MAST | `universe.ts:118-127` `withUniverseRetry` (403→`Fatal403Error` `:122`), `pagedGet:125` défaut `maxRetries=4` ⇒ **GET paçé dédié `{maxRetries:0}`** ; sonde d'OBSERVATION `page+1`, try/catch (avale HTTP/transport, **re-jette** `BudgetExceededError`), **jamais un STOP**, `past_end_probe=` en provenance, **+1 GET** (cap PLI §6, amendement daté) |
| **C-12** | non | §6 MAST | résidu « deux runs même dossier `--ledger` forkent le journal » nommé au PLI ; déclencheur = verrou `openSync("wx")` à CONV-2 (calque GARDE-HELIUS cp-1) |
| **C-13** | non | §2 D1 (`:64`) ; §7 ; §10 (PLI + correction de citation) | `rebase-crosscheck.ts:388` glob `^ledger-.*\.jsonl$` (`ledgerPagesOnDisk`) + `:395` `^(ledger\|events\|handoffs)-.*\.jsonl$` (`hasResumeState`) ⇒ `ledger-universe.jsonl` matche ⇒ **renommer `universe-budget-ledger.jsonl`** (hors glob). **Correction de citation** : avis/tâche `:441-452` (= `runRebaseCrosscheckCli`) ⇒ `:385-395` |

**Rulings CP1-Q1..Q6 pliés (§8 : questions ouvertes ⇒ résolues)** : Q1 **γ-prime confirmé** (sous C-3) ; Q2 **hôte du format = `@monark/rpc-guard`**, universe **migre** à CONV-2 (règle « qui fusionne le premier héberge » **retirée**), ordre de fusion : **a1-bis → b3d-b1a (CONV-1) → garde-helius-1a (CONV-2)** ; Q3 **Design A confirmé** (B non exigé) ; Q4 **sonde d'observation exigée** (C-11), sonde **assertante reportée** ; Q5 **mid-course reste FORMÉ** (capacité, après D1) ; Q6 **shim `--import` niveau `net` confirmé** (C-8) + 2e sous-cas (C-9).

**Correction de citation portée au pli** (déjà notée par le plan, re-vérifiée [lu]) : PLI/mission `test/ci-gates.test.ts:1269` ⇒ `:1329` (verrou réel `assert.ok(testScript.includes("--test-force-exit"))`).
