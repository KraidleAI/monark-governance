# CHECKPOINT-1 — lot NARABI-OPS-1 (retry sentinel, 3e opérateur Chainstack, sonde externe)

Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1`. Date : 2026-09-20. Dépôt `F:\Monark`, branche `lot/etude-suite`,
HEAD `e4cd07d9b04a5fe0c812ba9511f77885e0af05dc`, `git status` propre avant et après (aucune écriture hors `F:/tmp/cp1-nops/`).
Contexte frais : seuls les artefacts ci-dessous ont été lus, jamais le fil du planificateur.

## 1. Artefacts lus
- Plan : `F:\Monark\docs\G0-lot-narabi-ops-1.md` (intégral).
- Code : `apps/sentinel/src/run.ts` (intégral), `apps/sentinel/src/rpc.ts` (intégral), `apps/sentinel/src/timeline.ts` (intégral —
  `hashedFields`, `lineHashOf`), `apps/sentinel/src/windows.ts` (intégral), `apps/sentinel/src/flow.ts` l.40-75 (`attest`, `utteranceHash`),
  `apps/bell/src/operators.ts` (intégral), `apps/site/lib/narabi-snapshot.ts` (intégral : lignes publiées 09-17, 09-18, `line_hash`
  `ec4ce67e…`), `test/no-secret-in-repo.test.ts` (intégral).
- Tests : `apps/sentinel/test/sentinel.test.ts` l.1-215 et 335-494 (`sentinel_windows_identical_to_pull`, `sentinel_quorum_disagreement_fails_closed`,
  `sentinel_quorum_needs_two_providers`, `sentinel_gap_is_lag_not_skip`), `apps/bell/test/collect.test.ts` (grep `providerOf`), `test/ci-gates.test.ts`
  l.1064-1206 (`series_pinned_are_declared_and_hashed`, racines exclues R-25), `.github/workflows/ci.yml` l.65 (pathspec R-25),
  `scripts/export-public.mjs` l.60-70 (liste blanche).
- Déploiement/doc : `deploy/monark-sentinel.service`, `deploy/monark-sentinel.timer`, `docs/RUNBOOK-sentinel.md`, `docs/CHANTIERS.md` §E l.69-70
  (incident) et l.114-118 (décisions 54, 55, 56, 57 ; VPS Bell provisionné `bell.monarkgate.tech`), `docs/adr/ADR-M012-narabi-live-sentinel.md` l.60-99
  (D4/D5), `docs/adr/ADR-M018-regle-branchement.md` D3, `docs/adr/ADR-B0-programme-bell.md` D8.
- Sources externes (2026-09-20 ; **extraits obtenus via l'outil de fetch, qui résume par un modèle : cités [abs], non lecture directe ; aucune conclusion ne dépend de la lettre exacte** ; XML source du dépôt systemd sur raw.githubusercontent.com — freedesktop.org répond 403 à l'outil) :
  `man/systemd.timer.xml` (Persistent=, OnCalendar= répété), `man/systemd.time.xml` (listes par composante), `man/systemd.exec.xml`
  (EnvironmentFile=, préfixe `-`).

## 2. Réponses aux huit questions de l'orchestrateur (preuves par artefact)

**(1) L-1 code de sortie.** `runDue` (`run.ts:75-93`) : tout `stopped` est posé dans un `break` qui précède `processedDays.push`, donc
`stopped != null ⇒ lag ≥ 1` toujours ; la conjonction `stopped != null && lag > 0` est redondante mais pas fausse. Le cas « waiting for finality »
passe par `dueDays` (`run.ts:31-41`) qui omet le jour non finalisé : `due = []`, `runDue` rend `lag 0, stopped null`, `main` imprime « nothing due »
(`run.ts:176`). `stopped` distingue donc correctement les deux cas. Les quatre valeurs de `stopped` (`fetch_error`, `quorum_disagreement`,
`unfinalized_to_block`, `c1_fail`) méritent toutes exit 1 : chacune est un run empêché ; la relance du créneau suivant est soit utile (fetch,
unfinalized) soit un signal visible (c1/disagreement rejoueront rouge — voulu, fail-closed visible). Le chemin FATAL (`main().catch`,
`run.ts:190`) met déjà `exitCode = 1` — l'incident n'y est pas passé parce que `finalized()` avait réussi et que l'échec est survenu dans `supplyAt`
(pris par le `try` de `runDue`). **Non spécifié par le plan** : `main()` n'est pas exporté, est sous run-guard et utilise le `fetch` global ;
tester un code de sortie exige un sous-processus avec `fetch` stubbé (`node --import <stub.mjs> run.ts --state <tmp>`) ou une fonction CLI exportée
rendant le code. Les lignes traitées AVANT un arrêt doivent rester écrites (rattrapage partiel) : `exitCode` se pose après l'écriture. → C-6.

**(2) L-2 timer.** systemd.timer, Persistent= ([abs], extrait) : « the service unit is triggered immediately if it would have been triggered at least once
during the time when the timer was inactive » ; « Such triggering is nonetheless subject to the delay imposed by RandomizedDelaySec= ». Un reboot
qui a manqué quatre créneaux déclenche **un** run, pas quatre ; l'idempotence L-4 couvre de toute façon le cas. **Défaut de syntaxe** : systemd.time ([abs], extrait),
« each component can be specified as a list of values separated by commas » ; exemples normalisés `12,14,13,12:20,10,30 → *-*-* 12,13,14:10,20,30:00`.
La forme `00:30,03:30,06:30,09:30` (liste de paires hh:mm) n'est **pas** une spécification valide ; il faut `*-*-* 00,03,06,09:30:00 UTC` ou quatre
lignes `OnCalendar=` (systemd.timer : « May be specified more than once, in which case the timer unit will trigger whenever any of the specified
expressions elapse »). → C-2. `EnvironmentFile=-` : systemd.exec, [abs] le préfixe `-` rend l'absence du fichier non fatale (aucune erreur), le fichier étant lu par le
gestionnaire de services ; `root:sentinel 0640` est de toute façon lisible par le groupe `sentinel` (justification suffisante, sans hypothèse d'ordre des privilèges).
Avec le tiret, fichier absent ⇒ pool des 8 gratuits ⇒ **le quorum reste fail-closed** (2 opérateurs distincts, `rpc.ts:154-156`) : compatible avec
« fail-closed sans clé » au sens M012 (aucune donnée fausse n'est publiée), mais c'est une **dégradation silencieuse** qui recrée l'incident. Je ne demande
pas d'exiger le fichier (une unité qui refuse de démarrer sans clé ne publie plus rien, sans canal d'alerte à ce jour — pire) ; je demande la visibilité :
le JSON de fin porte `chainstack: boolean` (ou le nombre d'opérateurs), le runbook vérifie `systemctl show -p EnvironmentFiles`, et l'ADR amende
ADR-M012 D5 (« pool RPC public, sans clé ») par référence datée. → C-4, C-5, C-10.

**(3) L-3 distribution des lectures.** `sentinel_windows_identical_to_pull` (`sentinel.test.ts:114-139`) n'utilise **pas** le pool : oracle
`makeOracle()` injecté dans `firstBlockAtOrAfter`/`windowBounds` — insensible à l'ordre du pool. `sentinel_quorum_disagreement_fails_closed`
(`:340-352`) construit `makeRpcPool({ endpoints: ["a","b"] })` explicitement — insensible aussi, **à condition** que l'injection env ne s'applique
jamais quand `opts.endpoints` est fourni. Digest : `hashedFields` (`timeline.ts:94-101`) **exclut** `endpoints`, `node_version`, `sentinel_sha` ⇒
`line_hash` et `digest_T` restent bit-identiques quel que soit le pool. **Mais** `run.ts:160` publie `prov.endpoints = PUBLIC_ENDPOINTS` **verbatim dans
chaque ligne** (`narabi-snapshot.ts:23` : le champ `endpoints` est servi sur monarkgate.tech) — si le pool devient « 8 gratuits + URL Chainstack » et
que la provenance reflète le pool, **la clé est publiée sur le site**. `no_secret_in_repo` scanne l'arbre committé, pas la sortie d'exécution ; le test
prévu `sentinel_never_prints_endpoint_url` ne vise que les messages d'erreur. → C-1 (bloquant). « Chainstack en tête du round-robin (fiable) » :
`quorumTwo` gèle `start = rr` puis avance `rr` (`rpc.ts:139,157`) ; `one()` tourne aussi (`:120`). L'index 0 n'est privilégié qu'à la première lecture
d'un pool neuf — le plan doit dire « un 3e opérateur distinct dans la rotation », pas « en tête ». → C-3. `providerOf` étendu :
`apps/bell/src/operators.ts:10`, `apps/bell/src/quorum.ts:2-4`, `apps/sentinel/src/ukemi/rpc2.ts:2` et `record.ts:16` l'importent sous contrat
documenté (« stays the LOGGING form », « WITHOUT modifying them ») ; Bell est hors isolation du lot. Le pool sentinel ne contiendra qu'**une** URL
Chainstack ⇒ la fusion `chainstack.com`/`p2pify.com` est sans objet ici. `providerOf` reste byte-identique. → C-3.

**(4) L-4 bruts hors ligne.** Non nécessaires : `attest` est pur dans les faits (`flow.ts:66-74` ; `utteranceHash(fromBlock,toBlock)`, `flowSha256`
sur `serializeAttestedFlow` sans horloge) et `step` est pur ; le stub de run 2 se **dérive de la ligne publiée** (oracle ts plaçant `from_block`/`to_block`
comme `makeOracle` ; un log mint + un log burn sommant à `mints`/`burns` — `sumFlow` ne fait que sommer ; `supplyAt(to_block)=supply_close`,
`supplyAt(from_block-1)=s_open`). Ce qui **manque au dépôt** : la ligne 2026-09-19 elle-même (T=2) — `narabi-snapshot.ts` s'arrête à 09-18 ; le plan
n'épingle que `prev` (`ec4ce67e…`). Il faut une **fixture nommée** `apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl` (3 lignes capturées par
`curl` de `https://monarkgate.tech/narabi/timeline.jsonl`, aucun RPC), sha-épinglée avec `PROVENANCE-*.md` même répertoire (règle
`series_pinned_are_declared_and_hashed`, `ci-gates.test.ts:1085` : racine exclue R-25). L'oracle de run 2 = égalité de **tous les champs hachés +
`line_hash`** de la ligne 3 (pas seulement `prev`). Le state dir du VPS n'est pas une source admissible (non commité, non rejouable en CI). → C-7.
Le stub de run 1 doit être **méthode-consciente** : `finalized()` et `blockTs` réussissent, seul `eth_call` tombe sous 2 opérateurs — sinon
`finalized()` lève, `main().catch` prend le relais (exit 1 pré-existant) et L-1 n'est jamais exercé. → C-6.

**(5) L-5 sonde.** Dépendance de déploiement **satisfaite** : VPS Bell provisionné et configuré (CHANTIERS l.117, décision 54 : `bell.monarkgate.tech`,
Node v24.21.0) ; décision 57 l'autorise explicitement (« n'accueille que Bell et la sonde externe »). `line_hash` exportable ? **Non** :
`@monark/sentinel` est `private: true`, `timeline.ts` importe `@monark/hikae` et `@monark/harness/calibration` — rien d'importable depuis un `.mjs`
nu sur le VPS Bell avant T-1b. La duplication de l'ordre des 31 champs de `hashedFields` est inévitable ⇒ exiger un **test d'identité** contre les
lignes committées (`ec4ce67e…` et la ligne 3 de la fixture C-7) : `probe_line_hash_equals_sentinel_lineHashOf`. Fenêtre : dernier créneau 09:30 +
`RandomizedDelaySec=1800` peut finir à 10:00 ; une sonde « après 10:00 » peut fausser l'alarme ⇒ sonde à 10:30 UTC ou plus tard. `export:check` : liste
blanche (`export-public.mjs:65-70`) — un script non listé n'est simplement pas exporté, pas de blocage. → C-8.

**(6) R-25 <= 500.** Pathspec `ci.yml:65` exclut `docs/**/*.md` et `apps/sentinel/test/fixtures/**` ⇒ comptent : `run.ts` (~10), `rpc.ts` (~30),
unités (~10), `sentinel-retry.test.ts` (~150-200), tests ci-gates (~40), `probe-narabi.mjs` (~90), unités sonde (~35), test sonde (~60),
commentaires (~10) ≈ **440-520**. Réaliste, marge faible : mesurer au milieu du G1 (précédent C-10 `CHECKPOINT1-lot-u2a.md:67`) ; si > 500, L-5
passe en NARABI-OPS-1b. → C-11.

**(7) CA-11.** Le plan déclare ses tuyaux (L-6, §Tuyaux) et ne déclare rien « built ». Sonde : sortie `narabi.json` **sans consommateur** (alerte = item
formé) ⇒ `upcoming`, comme le plan le dit — conforme, à condition que l'ADR porte le tuyau avec déclencheur nommé (choix du canal par l'investisseur).
`env → rpc.ts` : entrée = fichier hors dépôt, sortie = pool, état = `/etc/monark/sentinel.env`, test = L-3 ; timer → run → timeline : existant,
test d'intégration non-LLM = L-4 (rejoue la composition sur `main` réel en sous-processus, C-6). → C-10.

**(8) Secret posé par SSH.** La clé est déjà détenue par l'orchestrateur (décision 43, courses Ukemi) : la transmettre par **stdin** de `ssh`
(`printf` local | `ssh … 'umask 077; cat > …'`) n'élargit pas le périmètre de confiance ; la valeur n'apparaît jamais dans la chaîne de commande ni
dans le transcript. Acceptable avec : vérification par `sha256sum` comparé des deux côtés (jamais `cat` du fichier distant), `install -d -m 0750 -o root
-g sentinel /etc/monark`, fichier `0640 root:sentinel`, `set -x` interdit. Information à l'investisseur (non bloquant) : s'il préfère poser le fichier
lui-même, le runbook doit l'accepter à l'identique.

## 3. Checklist CA-1..CA-11

| Règle | Verdict | Preuve |
|---|---|---|
| CA-1 falsifiabilité | **correction** | Reformulation une phrase par tâche (§4) possible ; mais L-1 sans mécanisme de test du code de sortie, L-4 sans source pour la ligne 09-19, L-5 sans stratégie d'import — C-6, C-7, C-8. Syntaxe OnCalendar invalide — C-2. |
| CA-2 valeur | conforme | Aucune décision de valeur nouvelle : Chainstack = décision 43 + item (b) §E ; sonde = ADR-B0 D8 + décision 57 ; canal d'alerte **explicitement laissé à l'investisseur** (relayé §5). |
| CA-3 ADR / gates | **correction** | ADR-NARABI-OPS-1 prévue (L-6) ; doit amender ADR-M012 D5 « sans clé » par référence datée, porter la sémantique exit et les tuyaux — C-10. Aucun gate suspendu. |
| CA-4 fan-out | conforme | Worker Opus 4.8 → G2 fraîche → checkpoint-2 : séparation par instance, aucune justification par débit. |
| CA-5 MAST | **correction** | Cinq modes nommés ; manquent « secret dans la provenance publiée » (C-1) et « dérive de l'ordre de hash dupliqué » (C-8) — C-9. |
| CA-6..CA-8 | n-a (checkpoint-2) | Oracle L-4 = test d'intégration non-LLM sur `main` réel (C-6) ; journal avec `error_origin` exigé au checkpoint-2. |
| CA-9 vérification imposée | conforme (plan) | Au checkpoint-2 je rejouerai moi-même `npm run ci`, les mutants L-1/L-4 et l'identité de hash de la sonde sous `F:\tmp\cp2-nops\`. |
| CA-10 anti-vitesse | conforme | Aucun argument de vitesse ; « 3 no-op négligeables » est un coût, pas une vitesse. |
| CA-11 branchement | conforme sous C-10 | Rien déclaré built ; sonde `upcoming` avec tuyau + déclencheur ; `fleet.ts`/site intacts (T0). |

## 4. Reformulation CA-1 (une phrase par livrable)
- L-1 : le run sort en 1 exactement quand un arrêt (`stopped`) l'a empêché d'écrire un jour dû, et en 0 quand rien n'était dû ou tout est écrit.
- L-2 : quatre créneaux quotidiens rejouent le même oneshot idempotent ; la clé vit dans un fichier hors dépôt lu par systemd.
- L-3 : un neuvième endpoint (Chainstack, opérateur distinct) entre dans la rotation du quorum ; son URL n'apparaît nulle part (erreur, ligne publiée, journal).
- L-4 : un test rejoue l'incident (échec quorum → rattrapage → no-op) sur le vrai `main` et retrouve la ligne 09-19 publiée au `line_hash` près.
- L-5 : depuis un autre hôte, un script sans dépendance vérifie que la dernière ligne publiée est J-1 et que sa chaîne de hash se recalcule.
- L-6 : le runbook et l'ADR consignent la procédure, l'amendement de M012 D5 et les tuyaux avec déclencheurs.

## 5. Décision : **APPROUVÉ-AVEC-CORRECTIONS** (liste fermée, à intégrer au G0 avant tout code)

- **C-1 (bloquant, secret).** La provenance publiée (`prov.endpoints`, `run.ts:160`) ne porte **jamais** l'URL Chainstack : forme expurgée
  (`providerOf(url)` ou `https://<host>/<redacted>`), `PUBLIC_ENDPOINTS` inchangé. `sentinel_never_prints_endpoint_url` asserte sur (i) le message
  d'erreur, (ii) la **ligne écrite** (`timeline.jsonl` et `state.json`), (iii) la sortie stdout du run ; mutant : URL brute dans `endpoints` ⇒ rouge.
- **C-2 (timer).** Quatre lignes `OnCalendar=*-*-* HH:30:00 UTC` (ou `*-*-* 00,03,06,09:30:00 UTC`) — jamais `00:30,03:30,…` ; le runbook exécute
  `systemd-analyze calendar` sur chaque expression avant `enable` ; `sentinel_timer_has_retry_slots` compte 4 expressions valides (mutant : 1 ⇒ rouge).
- **C-3 (pool).** `providerOf` reste byte-identique (consommateurs Bell/ukemi hors isolation) ; pas de fusion `p2pify` dans le sentinel (une seule URL
  Chainstack) ; le texte du plan et de l'ADR remplace « en tête, fiable » par « troisième opérateur distinct dans la rotation » (ou spécifie et teste
  une priorité réelle).
- **C-4 (injection env).** L'URL est lue **dans `main()`** (ou par une fonction pure `poolEndpoints(env)` appliquée seulement quand `opts.endpoints`
  est absent) — jamais au niveau module de `rpc.ts` ni dans les défauts de `makeRpcPool` ; le JSON de fin porte `chainstack: boolean` (ou `operators: n`).
- **C-5 (EnvironmentFile).** `EnvironmentFile=-/etc/monark/sentinel.env` **conservé** (base sans clé de M012 D5 continue de publier), avec la
  visibilité C-4, la vérification runbook `systemctl show -p EnvironmentFiles`, et mise à jour des commentaires devenus faux (`monark-sentinel.service`
  l.4 « no key » ; `test/no-secret-in-repo.test.ts` l.4 « the systemd unit sets no Environment= » — commentaire seul, ou item formé si hors isolation).
- **C-6 (L-1 test).** Mécanisme nommé : sous-processus `node --import <stub-fetch.mjs> apps/sentinel/src/run.ts --state <tmp>` (ou CLI exportée
  rendant le code + un test sous-processus pour le vrai `process.exitCode`). Stub **méthode-consciente** (`eth_getBlockByNumber` et `eth_getLogs`
  sains, `eth_call` en 403/503 sous 2 opérateurs). Trois cas : (a) no_quorum ⇒ exit 1, 0 ligne ; (b) rattrapage partiel (2 jours dus, le 2e échoue)
  ⇒ **1 ligne écrite ET exit 1** ; (c) `due = []` ⇒ exit 0 « nothing due ». `--dry-run` : même sémantique déclarée. Condition écrite `stopped !== null`
  (la redondance `lag > 0` est admise si commentée).
- **C-7 (L-4 fixture).** `apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl` (3 lignes, capture `curl` du site, aucun RPC) +
  `PROVENANCE-narabi-timeline-2026-09-19.md` avec sha256 LF ; state dir de test amorcé avec les lignes 1-2 ; oracle de run 2 = égalité de tous les
  champs hachés + `line_hash` avec la ligne 3 ; stub dérivé de la ligne publiée (oracle ts, un log mint + un log burn, map de supply).
- **C-8 (sonde).** `probe-narabi.mjs` = built-ins Node seulement ; ordre des 31 champs dupliqué + test `probe_line_hash_equals_sentinel_lineHashOf`
  sur les lignes committées (fixture C-7 et `narabi-snapshot.ts`) ; `OnCalendar` sonde à 10:30 UTC ou plus tard (jitter du dernier créneau) ; unité avec
  utilisateur dédié et `ReadWritePaths=/var/lib/monark-probe` ; registre : `upcoming`.
- **C-9 (MAST).** Ajouter au §Risques : « secret dans la provenance publiée » (contre-mesure C-1) et « dérive de l'ordre de hash dupliqué dans la
  sonde » (contre-mesure C-8).
- **C-10 (ADR).** `ADR-NARABI-OPS-1` porte : amendement daté de ADR-M012 D5 (« sans clé » → clé Chainstack hors dépôt, `root:sentinel 0640`) ;
  sémantique du code de sortie ; table des tuyaux (entrée, sortie, état, test) pour `env → rpc.ts`, `timer → run → timeline`, `timeline → sonde →
  narabi.json → alerte (item formé, déclencheur = choix du canal par l'investisseur)`.
- **C-11 (R-25).** Mesure `git diff --shortstat` sous la pathspec `ci.yml:65` au milieu du G1 ; si > 500, L-5 (+ ses unités et son test) devient
  le pli NARABI-OPS-1b avant tout ajout.

Pas d'ESCALADE. **Deux points relayés à l'investisseur (non bloquants)** : (i) canal d'alerte de la sonde (mail / webhook / page `/status`) — c'est
le déclencheur de `upcoming → built` ; (ii) pose du fichier secret par l'orchestrateur via stdin SSH (acceptée ici) ou par l'investisseur lui-même.

## 6. AM-1 — ce que la checklist a attrapé
Clé Chainstack qui serait **publiée sur le site** via le champ `endpoints` de chaque ligne (C-1) ; syntaxe `OnCalendar` invalide (C-2) ;
L-1 non exercé par un stub qui casse `finalized()` (C-6) ; ligne 09-19 absente du dépôt (C-7) ; `line_hash` non importable sur le VPS Bell (C-8).
Manqués : à renseigner par l'orchestrateur a posteriori.

## 7. Preuve d'innocuité
Aucun `git`, aucune écriture dans `F:\Monark` ; seul chemin écrit : `F:\tmp\cp1-nops\`. HEAD et `git status` identiques avant/après (consignés dans la réponse).
