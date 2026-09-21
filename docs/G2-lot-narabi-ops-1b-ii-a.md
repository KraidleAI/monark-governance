# G2 SMTP DÉDIÉE — lot NARABI-OPS-1b-ii-a (alerte mail SMTP + rappel quotidien, « Bell »)

**Relecteur G2 dédié SMTP, instance séparée à contexte frais (n'a PAS écrit ce code).**
**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, effort max.
Horloge d'ouverture `date -u` = `2026-09-21T02:02:30Z`. Worktree `F:\Monark-wt-narabi1b2a`, branche `lot/narabi-ops-1b-ii-a`, HEAD `9fd3736`.
R-20 : aucun commit, aucun workflow, aucune action sortante ; toutes les commandes sous `env -u SMTP_HOST -u SMTP_PORT -u SMTP_USER -u SMTP_PASS -u SMTP_TLS -u ALERT_TO -u ALERT_FROM`. Scratch `F:\tmp\narabi1b2a\g2\`. Worktree laissé PROPRE (`git status --porcelain` vide ; toutes mutations/patchs restaurés byte-exact, jamais `git checkout`).

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le cœur sécurité tient : **aucun chemin de fuite du secret**, **aucun chemin d'injection d'enveloppe vivant**, **aucun chemin de vrai mail / hors-loopback**, TLS épinglé non surchargeable, machine à états correcte, écriture atomique + « narabi.json toujours écrit » (exception synchrone du connecteur comprise). Suite complète **503/503**, tous les gates verts, **R-25 = 919 ≤ 1 205**, **18/18 mutants du worker rejoués ROUGES** (indépendamment).

**Mais** deux corrections **bloquantes** (une de code de prod, une d'intégrité du gate) et six non bloquantes.

---

## C-B-6 (point de contrôle NOMMÉ) — AUCUN test ne peut envoyer un vrai mail : **VÉRIFIÉ, PASS**
Vérifié par lecture AVANT toute exécution, puis exécuté sous `env -u …` :
- `childEnv()` (`test:32-36`) fait le SEUL spread de `process.env` du fichier, puis SUPPRIME toute clé `^(SMTP_|ALERT_)`, puis ajoute `TZ` + extras. `g2_no_test_can_send_real_mail` (`test:987-1001`) épingle : (a) purge effective même quand la variable est posée sur le parent ; (b) override loopback explicite conservé ; (c) `...process.env` apparaît **exactement 1 fois** dans le fichier (assertion `:1000`).
- **Tous** les `spawn`/`spawnSync` passent par `childEnv(env)` : `runProbe` `:67`, `runProbeAsync` `:79`, `runRealSentinel` `:293/299`, `runProbeAt` `:629`, atomicité `:490`, io-fault `:522`, unknown-flag `:977`. Aucun spawn nu.
- Tous les hôtes de test sont **loopback `127.0.0.1`** ou **`.invalid`** (RFC 6761, ne résout jamais) ou des **fonctions pures** (`smtpTransportPlan`, `composeMail`, `isEmailish`, `urlTransportAllowed`) qui ne composent aucun paquet. Les refus hors-loopback sont prouvés SANS dial via `.invalid` (`probe_smtp_refuses_plaintext_off_loopback` `:860`, `probe_refuses_http_off_loopback` `:399`).
- Balayage scratch après exécution : le secret de test `s3cr3t-PONY-cell-42` et sa forme base64 sont ABSENTS de tout `*.out` (captures runner) et `*.json` (narabi.json écrits). Aucun chemin vers un vrai serveur trouvé ⇒ exécution autorisée et effectuée.

---

## DÉFAUTS

### C-G2-1 — BLOQUANT — L'échéance SMTP n'est PAS « globale unique » : DEUX échéances séquentielles (viole C-B-2)
`scripts/probe-narabi.mjs:555` pose une échéance de **phase de connexion** `s.setTimeout(deadlineMs, …)` — **basée sur l'INACTIVITÉ** (`socket.setTimeout` se réarme à chaque octet), pleine valeur `deadlineMs` — puis `:557` la désarme (`socket.setTimeout(0)`), puis `:563` démarre une **NOUVELLE** échéance murale `setTimeout(…, deadlineMs)` pour la conversation. Donc pire cas SMTP = **2 × MAX_SMTP_DEADLINE_MS = 60 s**, pas 30. Le commentaire `.d.mts:22` (« SINGLE global deadline for the WHOLE SMTP conversation ») et `probe-narabi.mjs:559` (« a SINGLE global deadline ») sont **contredits par `:555`**.

Conséquences prouvées (reproductibles) :
- **Arithmétique sur les constantes exportées réelles** (`F:\tmp\narabi1b2a\g2\verify.mjs`) : `MAX_TIMEOUT_MS*(MAX_RETRIES+1)=50 000` + **1×** `MAX_SMTP_DEADLINE_MS` + `START_MARGIN_MS` = **90 s** (formule du test `test:432`) ⇒ `120 > 90` = vrai (le test PASSE) ; mais la formule CORRECTE **2×** `MAX_SMTP_DEADLINE_MS` = **120 s** ⇒ `120 > 120` = **FAUX**. `TimeoutStartSec=120` (`deploy/monark-probe.service:29`) **n'excède PAS strictement** le vrai pire cas capé. Le commentaire de l'unité `:25-28` (« 50+30+10 = 90 s … STRICTLY above ») est **faux** sur l'artefact livré.
- Le test `probe_timer_multiple_shots` (`test:432-433`) **assure une propriété de sûreté FAUSSE** : sa formule `worstCappedSec` **omet une** `MAX_SMTP_DEADLINE_MS` ; il est vert seulement grâce à cet oubli. C'est exactement le genre d'assertion qu'une G2 doit rejeter (elle donne une fausse garantie sur la frontière « narabi.json toujours écrit avant que systemd ne tue »).
- `s.setTimeout` (`:555`) est une échéance à **INACTIVITÉ** — **[lu]** nodejs.org/api/net.html, `socket.setTimeout`, ouvert en session 2026-09-21 : « Sets the socket to timeout after `timeout` milliseconds of **inactivity** on the socket » et « the connection will not be severed » (le code appelle bien `s.destroy()` dans `no()`). Donc elle se réarme à chaque octet ⇒ une poignée de main TLS en **goutte-à-goutte** (slow-loris) n'est **pas bornée** par la logique de la sonde — seul `TimeoutStartSec` la tuerait, **avant l'écriture** (violation de contrat). La réponse à la question de mission « MAX_SMTP_DEADLINE_MS vraiment globale ? » est **non pour la phase de connexion**.
- **Isolation dynamique du budget de connexion** (`verify.mjs`, serveur `node:net` silencieux, `SMTP_TLS=implicit`, `SMTP_DEADLINE_MS=700`) : elapsed **802 ms**, `alert_error=smtp_timeout`, `killed=false` ⇒ la phase de connexion consomme À ELLE SEULE ~`deadlineMs` AVANT que le timer de conversation ne démarre.

**Correction minimale (rend vrais le commentaire ET la formule)** : une échéance MURALE unique pour TOUTE la conversation. En tête de `sendSmtp` : `const deadlineAt = Date.now() + deadlineMs;` et **UN seul** `const timer = setTimeout(…, deadlineMs)` créé AVANT le connect, dont le callback alimente `no("smtp_timeout", s)` pendant la connexion PUIS `failWaiter("smtp_timeout")` pendant la conversation ; **`clearTimeout(timer)` en `finally` uniquement** (ne PAS créer un 2ᵉ timer en `:563`, ne PAS utiliser `s.setTimeout`/`socket.setTimeout(0)`). **Attention au piège signalé** : si on garde `:555` en `setTimeout` mural sans le lier au socket, `socket.setTimeout(0)` (`:557`) ne le désarme plus et il **survivrait après un envoi réussi** (handle qui garde le process vivant jusqu'à `deadlineMs`) — d'où le timer unique cleared en `finally`. Alors SMTP ≤ `deadlineMs`, la formule `test:432` (90 s) devient exacte, `120 > 90` reste vrai avec marge, et le goutte-à-goutte de handshake est borné.
**error_origin : G1 (implémentation) ; secondairement l'auto-test G1 (formule `:432` qui a masqué le défaut).** Bloquant.

*Nuance honnête pour l'adjudication* : en exploitation normale (Hostinger répond en < 3 s) l'impact pratique est nul ; le risque de contrat n'apparaît qu'au pire cas maximal ou sous slow-loris du relais. Je classe bloquant car (a) C-B-2 était **bloquante** et n'est pas satisfaite à la lettre, et (b) un test livré affirme une propriété de sûreté fausse.

### C-G2-2 — BLOQUANT (intégrité du gate, test-only, correctif 1 ligne) — Test FLAKY `probe_smtp_global_deadline`
Le factice SMTP `startFakeSmtp` (`test:575`) n'attache **aucun** `sock.on("error", …)` (il attache `sock.on("close")` en branche drip `:578`, mais jamais `error`). Quand le chemin d'échéance de la sonde fait `socket.destroy()` (`probe-narabi.mjs:563/578`), un **RST TCP** part ; côté factice, le socket émet un `error` **non géré** ⇒ **`Error: read ECONNRESET` non attrapé dans le process de test** ⇒ le test plante par intermittence.
- **Mesuré** : `probe_smtp_global_deadline` (`test:764`) échoue **3/8 en isolation** et **1/6 en contexte fichier** sur le code PRISTINE (toujours ECONNRESET). C'est l'oracle même de C-B-2. La claim « 503/503 » du worker n'est donc **pas reproductible** de façon fiable.
- **Correctif prouvé** : patch **temporaire du fichier de test EN WORKTREE** (pas scratch) ajoutant `sock.on("error", () => {});` après `cap.connections++;`, puis **restauré byte-exact** (jamais `git checkout` ; sha `test/probe-narabi.test.ts` avant==après = `eb47981…`, vérifié) ⇒ `probe_smtp_global_deadline` **8/8 vert, 0 ECONNRESET**.
Scénario reproductible : `for i in $(seq 1 8); do node --test --test-name-pattern 'probe_smtp_global_deadline' test/probe-narabi.test.ts; done` ⇒ ~2-3 ROUGES ECONNRESET.
**Correction minimale** : `test:575` ajouter `sock.on("error", () => {});` dans le handler de connexion du factice (couvre drip/silent/neverGreet/closeAfterAuth — tous les chemins où la sonde détruit le socket). **error_origin : G1 (rédaction du test).** Bloquant pour un gate vert fiable ; production non affectée.

### C-G2-3 — non bloquant — Lacune d'oracle : rejet CR/LF de `ALERT_TO/ALERT_FROM` non épinglé (injection d'enveloppe)
`isEmailish` (`probe-narabi.mjs:429`) rejette bien les CR/LF (le vrai code : `isEmailish("a@b.c\r\nRCPT TO:<x>")` = **false**, mesuré `verify.mjs`) via `\s`. Mais la liste des cas invalides du test (`test:830`) ne contient AUCUN cas CR/LF. Mutant **N-2** (`\s` → espace littéral) **SURVIT** (mesuré) : le garde anti-injection d'enveloppe n'est pas falsifiable par la suite. Pas de vulnérabilité vivante (le vrai code protège), mais oracle absent. **Correction** : ajouter `"a@b.c\r\nRCPT TO:<x>"` (et `\n`) à la liste `:830`. error_origin G1.

### C-G2-4 — non bloquant — Lacune d'oracle : borne d'octets SMTP (`SMTP_MAX_BYTES`) non exercée
La borne totale d'octets (`probe-narabi.mjs:577-578`, `total > maxBytes` ⇒ `smtp_timeout`) est du code vivant correct (couvre la « ligne de 1 Mo »), mais aucun test n'inonde > 64 Kio (le drip n'envoie ~275 o). Mutant **N-3** (borne désactivée) **SURVIT**. **Correction** : un factice qui inonde vite (> 64 Kio) avec `SMTP_DEADLINE_MS=5000` et un oracle « fini en < 2000 ms via la borne d'octets ». error_origin G1.

### C-G2-5 — non bloquant — Lacune d'oracle : plafond de `smtpDeadlineMs` non testé
`smtpDeadlineMs` (`probe-narabi.mjs:527-533`) n'est PAS exportée et son plafond `Math.min(n, MAX_SMTP_DEADLINE_MS)` (`:532`) n'a aucun test (contrairement à `transportBounds`). Mutant **N-4** (plafond retiré) **SURVIT**. **Correction** : exporter `smtpDeadlineMs` et épingler comme `probe_env_bounds_fall_back…`. error_origin G1.

### C-G2-6 — non bloquant — `deliver()` accepte une ligne non terminée
`probe-narabi.mjs:565-567` : `buf.split(/\r?\n/)` est scanné sur TOUS les éléments, y compris la queue incomplète ; `/^\d{3} /` matche un préfixe (`"250 O"`). Une frontière de segment TCP après `250 O` résout la réponse avant son CRLF et laisse `K` polluer la réponse suivante. Le loopback ne fragmente jamais ⇒ latent (aucun test ne le voit). Impact borné = désync ⇒ `smtp_rejected` (pas de fuite, pas de vrai mail). **Correction** : scanner `i < lines.length - 1` (n'accepter qu'une ligne suivie d'un CRLF). error_origin G1.

### C-G2-7 — non bloquant — L-6b (docs ADR/RUNBOOK) NON fait, déviation non déclarée
L'addendum §1 assigne **L-6b au worker (-1b-ii)** : flip `ADR :82` (`probe → alerte` → canal FIXÉ mail SMTP + test nommé), amendement schema 2, résiduels RUNBOOK (« sonde morte = silence », « faute disque = aucun mail ce run-là »). Or `git diff 331c169..9fd3736 -- docs/adr docs/RUNBOOK-sentinel.md` = **VIDE** : le worker n'a PAS touché ces docs. La `PLI:37` réassigne « ADR/RUNBOOK = orchestrateur (hors -a code) » **mais ne le liste PAS sous « Déviations » (`PLI:70-76`, six déviations, pas celle-ci)**. Déviation non déclarée du plan qui fait foi ⇒ **item formé, propriétaire orchestrateur, déclencheur « avant G7 de -a »** (ou amender l'addendum). Docs exclus de R-25 et revus par les checkpoints, pas par la G2 code ⇒ non bloquant pour le code.

### C-G2-8 — non bloquant — Base PÉRIMÉE (empilage sur un -1b-i dépassé)
Le worker a branché sur `331c169` ; `lot/narabi-ops-1b-i` a AVANCÉ depuis à `e52dce5` (un seul commit : **L-6a docs**, `331c169..e52dce5` ne touche QUE `ADR`/`RUNBOOK`). Donc `git diff lot/narabi-ops-1b-i..9fd3736` (deux points) montre des **réversions FANTÔMES** de l'ADR/RUNBOOK — **artefact de base périmée, PAS une action du worker** (prouvé : `331c169..9fd3736 -- docs/adr,RUNBOOK` = vide). Les fichiers de CODE sont **intacts** dans l'avance (aucun conflit de code à un rebase). **Instructions orchestrateur** : rebaser/fusionner -1b-ii-a sur `e52dce5` (propre, 3-way préserve L-6a) ; ne JAMAIS lire le diff deux-points comme une régression. R-25 **inchangé** (les seuls fichiers divergents sont `.md`, exclus par la pathspec).

---

## Revue par axe (mission 1–10)
1. **Fuite du secret — PASS.** Mot de passe + jetons AUTH (PLAIN `\0user\0pass` b64 ; user/pass b64 LOGIN) n'entrent jamais dans stdout/stderr/narabi.json/`alert_error`/`Error`/pile. `alert_error` est un **ensemble FERMÉ** (tous les chemins d'affectation vérifiés : connect `classifyConnectError` `:509-512`, catch conversation `:611-612`, `failWaiter`, `smtpConfig`, `smtpTransportPlan` — tous littéraux clos). `main` imprime l'état (`:687`, `alert_error` clos) ; le handler FATAL `:693` est inatteignable pour les erreurs SMTP (toutes attrapées en `{alertError}`). L'oracle `probe_secret_never_printed` (`:744`) compare bien **les jetons CAPTURÉS SUR LE FIL** (`cap.auth`) + mot de passe brut + base64, sur `535`-écho ET fermeture en pleine AUTH, pour PLAIN et LOGIN. Tueurs M-ii-3 (client logge le fil) **RED**, **M-ii-15 (ligne serveur copiée dans `alert_error`) RED**. Balayage scratch : aucun secret.
2. **Injection — PASS (oracle N-2 à combler).** Seul champ distant libre = `day`/`last_day` (`:300/468`), assaini (`sanitizeField:423-425` retire CR/LF/8-bit + borne 100). `provider` ∈ liste fermée. En-têtes : `from/to` validés `isEmailish` (rejette CR/LF, mesuré) ⇒ pas d'injection MAIL FROM/RCPT TO ; `SMTP_USER` en base64 (pas dans en-têtes) ; Subject constant `:433`. `day` hostile ne peut PAS terminer DATA : double défense (assainissement + dot-stuffing `encodeData:478-483`). `probe_smtp_injection_crlf_sanitized` prouve « 1 message, 1 RCPT, texte injecté reste sur la ligne `last_day` » ; M-ii-5 **RED**, M-ii-17 (dot-stuffing) **RED**. Lacune : CR/LF de `ALERT_TO/FROM` non épinglé (C-G2-3).
3. **TLS — PASS.** `tlsConnectOptions:491-495` = `{minVersion:"TLSv1.2", rejectUnauthorized:true, servername}` **codés en dur, non surchargeables par env**. `SMTP_TLS` ∈ {implicit, none} sinon `smtp_unconfigured` (`:522`). `SMTP_TLS=none` hors loopback ⇒ **refus SANS connexion** (`smtpTransportPlan:499`, prouvé via `.invalid` sans dial, `:860`). `probe_smtp_implicit_tls_never_speaks_plaintext` prouve que le factice en clair ne reçoit **NI EHLO NI AUTH**. M-ii-4/7/12/19 **RED**. Pas de `NODE_TLS_REJECT_UNAUTHORIZED` honoré (l'option explicite `true` prime).
4. **Machine de réponses — PARTIEL (voir C-G2-1).** Multi-lignes `250-`/`250 ` OK ; codes 4xx/5xx/421 ⇒ `smtp_rejected` ; bannière tardive/précoce OK ; octets après QUIT ignorés (socket détruit `finally:613-616`) ; pipeline : première réponse consommée, reste en buf. **Sockets toujours détruits** (aucune fuite de handle ; l'enfant de `verify.mjs` s'est fermé seul). Borne d'octets totale OK (non testée >64 Kio, C-G2-4). **MAIS échéance non vraiment globale (C-G2-1)** + `deliver()` accepte une ligne non terminée (C-G2-6).
5. **Machine à états — PASS.** Bootstrap absent/corrompu/schema≠2/incohérent/schema-1 (`readPriorState:409-419`, M-ii-18 **RED**, `probe_reads_schema1_state_without_crash`). ≤ 1 mail/tir. Rappel 1/jour UTC (frontière minuit via `nowDay=checked_at.slice(0,10)`, comparaison lexicographique). FLAP = 3 mails (`:713-721`). Rétablissement. Écriture UNIQUE après 250 (`probe:376/386`), échec SMTP (exception synchrone comprise) ⇒ narabi.json TOUJOURS écrit (`maybeAlert:648`, M-ii-20 **RED**, `probe_smtp_failure_leaves_narabi_written`). Écriture atomique tmp+rename (`:384-387`) + repli non-atomique borné déclaré. Déviation 1 (OPTION 2) conforme addendum §5 C-NB-10. Déviation 2 (`none` hors loopback ⇒ `smtp_unconfigured`) **acceptable** (`smtp_tls_failed` mentirait sur un handshake jamais tenté).
6. **parseArgs strict — PASS.** Flag inconnu ⇒ `throw` AVANT `probe()` (`:670`, `main:678-684`), exit 2, **aucun narabi.json** (M-ii-21 **RED**, `probe_rejects_unknown_flag`). `--out` lu ET écrit. `--state` n'existe pas.
7. **Unité systemd — PARTIEL.** `EnvironmentFile=/etc/monark/probe.env` **sans `-`** (`:23`) ✓ ; durcissements intacts (User=probe, ProtectSystem=strict, ReadWritePaths, MemoryMax=128M, assertion RSS `≥13×MAX_MAX_BYTES` `test:439-441`) ; `no-secret-in-repo` vert. **`TimeoutStartSec=120` : cohérence liée à C-G2-1** (le test passe sur une formule fausse ; 120 non strictement > vrai pire cas 120). Timer + `DEADLINE_UTC` **INTACTS** (`git diff` vide sur `monark-probe.timer`, `DEADLINE_UTC`, oracles de deadline).
8. **Contenu du mail — PASS.** `probe_alert_mail_has_no_forbidden_vocab` teste sujet+corps pour CHAQUE reason + recovery contre `mailVocab` (`/partner|autonomous|guarantee|verified|score/i` — collision « scores » couverte par `/score/`) ET les patterns GLOBAUX+sentinel chargés de `vocab-banned.json`. Aucune URL à clé, aucun secret. `Date` déterministe sous `--now` (`rfc5322Date:436-446`). `Message-ID` = timestamp + hex aléatoire + domaine, sans donnée sensible.
9. **CA-11 durci — PASS.** `probe_alert_composition_from_fixture` (`:649`) exécute la VRAIE sonde en sous-processus depuis la fixture réelle → vrai narabi.json → factice SMTP `node:net` loopback capturant MAIL/RCPT/DATA, et enchaîne panne → (re-run même jour = 0 mail) → rétablissement (1 mail « recovered ») → silence. Rien n'est « built » (registre honnête). (Même factice que C-G2-2 ; ce test-ci n'a pas flaké dans mes runs — la fermeture après QUIT est gracieuse — mais partage le défaut d'error-handler.)
10. Voir tableau mutants, oracles, R-25, conflits ci-dessous.

---

## Tableau des mutants (rejoués indépendamment ; runner `F:\tmp\narabi1b2a\g2\mutate.mjs`+`mutate2.mjs` ; pristine en mémoire ; restauration byte-exact ; sha `probe-narabi.mjs` avant==après = `4c25b344…`)

| Mutant | Cible | Attendu | Obtenu |
|---|---|---|---|
| M-ii-1 alerted avant 250 | C-2 | RED | **RED** |
| M-ii-2 ré-alerte sur reason même jour | C-3 | RED | **RED** |
| M-ii-3 client logge le fil (AUTH) | C-B-1 | RED | **RED** |
| M-ii-4 plaintext hors loopback | C-B-8 | RED | **RED** |
| M-ii-5 assainissement `day` retiré | C-B-3 | RED | **RED** |
| M-ii-6 `smtp_unconfigured` non enregistré | C-8 | RED | **RED** |
| M-ii-7 `rejectUnauthorized:false` | C-B-8 | RED | **RED** |
| M-ii-8a rappel à chaque tir | E-3 | RED | **RED** |
| M-ii-8b aucun rappel | E-3 | RED | **RED** |
| M-ii-11 parseur EHLO mono-ligne | AUTH | RED | **RED** |
| M-ii-12 `minVersion` retiré | C-B-8 | RED | **RED** |
| M-ii-15 ligne serveur → `alert_error` (secret) | C-B-1 | RED | **RED** |
| M-ii-16 échéance conversation à inactivité | C-B-2 | RED | **RED** |
| M-ii-17 dot-stuffing retiré | C-B-4 | RED | **RED** |
| M-ii-18 crash sur JSON invalide | C-B-5 | RED | **RED** |
| M-ii-19 net partout (implicit→clair) | C-B-8 | RED | **RED** |
| M-ii-20 connecteur jette → FATAL | C-NB-10 | RED | **RED** |
| M-ii-21 flag inconnu ignoré | C-B-13 | RED | **RED** |
| **18/18 worker** | | | **18/18 ROUGES** |
| **N-1** connect bound ×2 (double-échéance) | C-G2-1 | (survie attendue) | **FLAKY** — tue `probe_smtp_global_deadline` 1/5 (= le flake ECONNRESET C-G2-2, pas un oracle de la double-échéance) ; défaut prouvé par arithmétique+dynamique |
| **N-2** `isEmailish \s`→espace (CR/LF ALERT_TO) | C-G2-3 | SURVIE | **SURVIT** (lacune d'oracle) |
| **N-3** borne d'octets SMTP désactivée | C-G2-4 | SURVIE | **SURVIT** (lacune d'oracle) |
| **N-4** plafond `smtpDeadlineMs` retiré | C-G2-5 | SURVIE | **SURVIT** (lacune d'oracle) |
| **N-5** handler `error` de connexion retiré | robustesse | RED | **RED** (port fermé ⇒ narabi.json NON écrit, exit 1 ; répond à la question `uncaughtException`) |

*N-5 mesuré (`F:\tmp\narabi1b2a\g2\n5.stderr/.stdout`, port loopback fermé, `SMTP_PASS` sentinelle)* : narabi.json **non écrit** (le test RED via `r.state` null), exit 1, et la trace du crash ne porte **que host:port** (`127.0.0.1`, `ECONNREFUSED`) — occurrences du secret brut ET base64 dans stdout **= 0** et stderr **= 0** (mesuré `grep -c`, valeurs jamais affichées). Restauré byte-exact.

## Oracles (suite COMPLÈTE, sous `env -u SMTP_* ALERT_*`)
- `npm test` (tous workspaces) : **503 pass / 0 fail** (~38 s). ⚠️ **non reproductible de façon fiable** à cause de C-G2-2 (flake ECONNRESET ~17-37 % sur `probe_smtp_global_deadline`).
- `tsc --noEmit` : **0**.
- `eslint test/probe-narabi.test.ts` : **0** (`.mjs`/`.d.mts` ignorés par eslint).
- `lint:ratchet` : **69/69**.
- `gate:vocab` : **OK, 178 fichiers**.
- `export:check` : **OK**.
- `lang:gate` : **OK, 0 hit** (scope root..bell).
- `no-secret-in-repo` : vert (dans la suite).

## R-25
Pathspec `STAT=` de `.github/workflows/ci.yml` (**3 points** `origin/base...HEAD` = base-de-fusion, exclut `docs/**/*.md` etc.). Contre `lot/narabi-ops-1b-i` : **919** (868 ins + 51 del), **identique** en 2-points et 3-points (les seuls fichiers divergents dus à la base périmée sont `.md`, exclus). ≤ **1 205** (plafond), < 1 100 (seuil d'alerte). Par fichier : `.mjs` 331 (314/17), `.d.mts` 65 (62/3), `.test.ts` 495 (478/17), `.service` 28 (14/14). Conforme à la PLI. shas des 4 livrables vérifiés == PLI (`4c25b344…`, `eb47981…`, `5c4c0210…`, `b2d5e8ca…`). `DEADLINE_UTC`, `monark-probe.timer`, oracles de deadline **INCHANGÉS** (vérifié `git diff`).

## Conflits à prévoir avec le sous-lot frère -1b-ii-b (même `probe-narabi.mjs`)
Régions que -b éditera (à re-fusionner soigneusement) : `:50-72` bloc de constantes (STATE_MAX_BYTES/STATE_TIMEOUT_MS) ; `:259` boucle de réessai GET (tueur M-ii-10) ; `:293-324` `evaluate` précédence (insertion `state_unreachable`/`state_mismatch`) ; `:300`/`:368` défauts `state_checked:false` ; `:343-352` branche URL (2ᵉ GET) ; `.d.mts:29-30` `ProbeReason` ; `deploy/monark-probe.service:25-29` (TimeoutStartSec re-relevé +GET₂ — **et la correction C-G2-1 doit être portée AVANT ce recalcul**) ; `test:432` formule de pire cas (à corriger en même temps que C-G2-1).

## Provenance
G2 SMTP dédiée par relecteur **`claude-opus-4-8[1m]`** (effort max), instance séparée à contexte frais, 2026-09-21. R-20 (aucun commit/workflow/action sortante ; tout offline/loopback, sous `env -u`). R-21 (chaque défaut porte `fichier:ligne` + scénario reproductible + mesure : arithmétique `verify.mjs`, isolation dynamique du budget de connexion, 24 mutants rejoués, flake mesuré 3/8 & 1/6 + correctif prouvé 8/8). error_origin assigné au G7 par l'orchestrateur. Advisor intégré (`claude-fable-5-1`) consulté avant travail substantiel (double-échéance confirmée first-hand, non prise sur parole). Verdict, vérification adversariale finale et acceptation validateur-humain restent chez l'orchestrateur.
