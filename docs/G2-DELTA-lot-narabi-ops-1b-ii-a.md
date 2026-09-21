# G2-DELTA — sous-lot NARABI-OPS-1b-ii-a (alerte mail SMTP « Bell »), fold G2

**Relecteur G2-DELTA, instance séparée à contexte frais (n'a écrit NI le code NI le fold).**
**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé.
Horloge d'ouverture (`date -u`) : **2026-09-21T04:38:18Z**. Worktree `F:\Monark-wt-narabi1b2a`, branche `lot/narabi-ops-1b-ii-a`, HEAD **`7f86882`** (inchangé, aucun commit).
Delta relu : `git diff ffe4b9d..7f86882` (le FOLD des corrections C-G2-1..8 sur le G2 d'origine `docs/G2-lot-narabi-ops-1b-ii-a.md`).
R-20 : aucun commit, aucun rebase/fusion, aucun workflow. Toutes commandes sous `env -u SMTP_HOST -u SMTP_PORT -u SMTP_USER -u SMTP_PASS -u ALERT_TO -u ALERT_FROM`. Aucun réseau hors loopback, aucun vrai mail, aucun fichier d'environnement du poste lu/sourcé. Scratch `F:\tmp\g2d-narabi1b2a\`. Mutants : sauvegarde Buffers + restauration byte-exacte vérifiée sha256, JAMAIS `git checkout`/`stash`.
**Arbre laissé PROPRE** (`git status --porcelain` vide ; sha256 des 4 livrables avant==après == table PLI G2).

## VERDICT : **PASS-AVEC-CORRECTIONS**

Les DEUX bloquants du G2 d'origine sont **RÉSOLUS et vérifiés first-hand par re-exécution** :
- **C-G2-1** (échéance murale unique, pire cas ×1) : établi **structurellement** (UN seul timer, `timers.length===1`, cleared une fois) ET borné par mesure murale à chaque phase (11/11), y compris un goutte-à-goutte de handshake TLS continu.
- **C-G2-2** (flake ECONNRESET) : `probe-narabi.test.ts` **15/15 = 45 pass / 0 fail / 0 cancelled**, aucun ECONNRESET/uncaught.

C-G2-3/4/5/6 (lacunes d'oracle) pliés, mutants ROUGES rejoués. C-G2-7 (docs L-6b) fait. C-G2-8 (carte des conflits) substantiellement exacte.
Suite complète **509/509** (`npm run test` ET `npm run ci`). **R-25 = 1077 ≤ 1205**. Sécurité intacte.

**Deux corrections NON BLOQUANTES** (le code livré est CORRECT ; renforcements d'oracle / précisions de carte, items formés propriétaire+déclencheur — zéro dette) : **C-G2D-1** (voisin survivant : chemin d'échec-connexion sans oracle de fuite de timer) et **C-G2D-2** (la formule `test:434` auto-merge PROPRE — composition +GET₂ non signalée par git au merge -b).

---

## 1. C-G2-1 (BLOQUANT d'origine) — échéance MURALE UNIQUE couvrant connexion + handshake TLS + conversation, pire cas ×1 : **VÉRIFIÉ, RÉSOLU**

### Preuve du « ×1 » = STRUCTURELLE (lecture ligne à ligne, `sendSmtp` :540-639)
Le « pire cas ×1, pas ×2 » ne se déduit PAS des chiffres muraux (sur loopback la connexion ≈ 0 ms, donc l'ANCIEN code à deux échéances par phase montrerait AUSSI ~700 ms sur chaque phase post-connexion). Il est établi par la STRUCTURE :
- **UN seul timer**, armé comme instant absolu AVANT le connect : `deadlineAt = nowFn() + deadlineMs` (:554), `const timer = setT(() => { if (onDeadline) onDeadline(); }, Math.max(0, deadlineAt - nowFn()))` (:556). Horloge injectable (`nowFn/setT/clearT`, :551-553, défaut réel).
- **`onDeadline` mutable, un seul timer, deux phases** : connexion `onDeadline = () => no("smtp_timeout", s)` (:569, DANS l'exécuteur du Promise, synchrone — aucune fenêtre nulle avant que le timer puisse tirer) ; conversation `onDeadline = () => { dead=true; socket.destroy(); failWaiter("smtp_timeout"); }` (:582). Entre :575 (résolution connect) et :582 : **aucun `await`** → le timer ne peut pas s'interleaver.
- **`clearT(timer)` en EXACTEMENT deux points mutuellement exclusifs** : (a) catch d'échec-connexion `:576` (`clearT(timer); throw e;`), (b) `finally` de conversation `:635`. Un chemin OU l'autre, jamais un 2ᵉ timer, jamais `s.setTimeout`/`socket.setTimeout(0)` (l'ancien bug supprimé). Le total de l'arme (avant connect) à la libération est donc `deadlineMs`, quelle que soit la répartition connect/conversation → ×1.
- **Pas de double résolution** : `no()` gardé par `settled` (:566-567) ; `failWaiter`/`deliver` mettent `waiter=null` avant de résoudre/rejeter (:581/593) ; `dead` court-circuite les `read()` ultérieurs (:605). Vérifié : aucune promesse non gérée sur 45 tests + harness.
- Oracle nommé `probe_smtp_single_wall_clock_deadline_covers_whole_exchange` (:796, horloge injectée → `timers.length===1`, `timers[0].ms===DEADLINE`, cleared en finally) — **c'est la preuve ×1** (mutant C-G2-1a « 2ᵉ timer » ⇒ `timers.length===2` ⇒ RED).

### Re-exécution murale = BORNITUDE de chaque chemin (harness `F:\tmp\g2d-narabi1b2a\harness-timing.mjs`, import réel de `sendSmtp`, horloge RÉELLE, `deadlineMs=700`)
Faux serveur loopback qui accepte puis **se tait à CHAQUE phase** ; le temps mural confirme que chaque chemin est borné par UNE échéance (couvrant connexion+handshake+conversation), jamais un SIGKILL :

| Chemin (silence à) | error obtenu | elapsed | borné ≤ deadline+marge (1100) |
|---|---|---|---|
| greeting | smtp_timeout | 706 ms | ✓ |
| EHLO | smtp_timeout | 710 ms | ✓ |
| AUTH | smtp_timeout | 703 ms | ✓ |
| MAIL | smtp_timeout | 704 ms | ✓ |
| RCPT | smtp_timeout | 707 ms | ✓ |
| DATA | smtp_timeout | 703 ms | ✓ |
| après-DATA (silentAfterData) | smtp_timeout | 706 ms | ✓ |
| handshake TLS silencieux (raw TCP, jamais de ServerHello) | smtp_timeout | 706 ms | ✓ |
| **handshake TLS goutte-à-goutte** (record `16 03 03 00 40` égrené 1 o/200 ms) | **smtp_timeout** | **701 ms** | ✓ |
| handshake TLS drip body (header complet puis 1 o/150 ms) | smtp_timeout | 703 ms | ✓ |
| échec connexion (port fermé, deadline 10 000) | smtp_unreachable | **1 ms** + harness sort promptement | timer libéré :576 |

Toutes les phases sont bornées à ~703-710 ms (≈ échéance), aucune approche du SIGKILL ; le harness se termine promptement (aucune fuite de handle sur aucun chemin). Discriminant : en phase connexion, `smtp_timeout` ne peut venir QUE de `onDeadline` (le seul timer), car `classifyConnectError` ne renvoie jamais `smtp_timeout`.

### Item de mission « goutte-à-goutte PENDANT le handshake TLS » — testé, résultat NUANCÉ et MESURÉ
Le worker (PLI § limite honnête) affirmait (a) que ce cas n'est pas fabricable hors ligne et (b) qu'« un flux d'octets bruts fait échouer la couche TLS immédiatement ».
- **(b) est réfuté** : un serveur TCP brut qui égrène un en-tête de record TLS plausible fait **ATTENDRE** OpenSSL (pas échouer) → le timer MURAL le borne à **701 ms, `smtp_timeout` (pas `smtp_tls_failed`, pas de hang)**. C'est fabricable hors ligne (contre (a)).
- **MAIS le drip de handshake n'est PAS un falsifieur inactivité↔mural** — je l'ai testé (`F:\tmp\g2d-narabi1b2a\falsifier-inactivity.mjs`, mutant 2-patchs = ancien timer d'inactivité de connexion `s.setTimeout(deadlineMs, …)`) : **PRISTINE (mural) = smtp_timeout 709 ms ; MUTANT (inactivité) = smtp_timeout 738 ms — PAS de hang**. Raison mesurée : sur un TLSSocket, `socket.setTimeout` (inactivité) **n'est PAS réarmé par les octets bruts de handshake** (consommés par la couche TLS sous-jacente, non surfacés comme activité du TLSSocket) ⇒ inactivité et mural bornent TOUS DEUX le handshake à ~échéance. Le worker avait donc raison sur le fond (le handshake ne discrimine pas les deux régimes), pour une raison plus fine que celle donnée.
- **La distinction inactivité↔mural se falsifie sur le chemin CONVERSATION** (octets `data` en clair qui réarment l'inactivité), exactement ce que le serveur drip de `probe_smtp_global_deadline` exerce : mutant **M-ii-16 REDÉFINI (inactivité) ⇒ hang ⇒ SIGKILL ⇒ RED** (rejoué, ci-dessous). C-G2-1 pleinement vérifié.

L'unité `deploy/monark-probe.service:31` `TimeoutStartSec=120` vs formule x1 `test:434` = `MAX_TIMEOUT_MS*(MAX_RETRIES+1)+MAX_SMTP_DEADLINE_MS+START_MARGIN_MS` = 50+30+10 = **90 s ; 120 > 90 VRAI** (mesuré sur les constantes exportées réelles). **STARTTLS n'existe pas dans ce code** (TLS implicite 465 ou plaintext-loopback ; 587 = item différé) ⇒ chemin STARTTLS **N/A par conception**.

---

## 2. Sécurité — **VÉRIFIÉ, PASS (first-hand)**
- **Fuite du secret : AUCUNE.** Balayage de TOUS les artefacts scratch (15 runs probe, npm-test, npm-ci, harness) pour `s3cr3t-PONY-cell-42` + sa forme base64 `czNjcjN0LVBPTlktY2VsbC00Mg==` : **0 hit dans tout artefact produit par la sonde** (seuls hits = mes propres sources : backup du test + scripts harness). `alert_error` = ensemble fermé (`.d.mts:34-36`) ; `probe_secret_never_printed` (:756) vert (jetons PLAIN/LOGIN capturés SUR LE FIL + pass brut + base64, absents de stdout/stderr/narabi.json ; tueurs M-ii-3/15 RED).
- **Injection CR/LF — bloquée sur les 3 vecteurs (vérif directe `node`)** : `isEmailish("a@b.c\r\n…")`, `"…\n…"`, `"…\r…"` = **false** (destinataire/expéditeur, enveloppe MAIL FROM/RCPT TO sûre) ; `sanitizeField("2026-09-19\r\n.\r\nRCPT TO:<x>")` = `"2026-09-19.RCPT TO:<x>"` (CR/LF retirés) ; `composeMail` avec `last_day` injecté CRLF ⇒ **aucune ligne `INJECT:` autonome**, texte inerte sur l'unique ligne `last_day` ; Subject **constant** (`SUBJECT` :434).
- **`rejectUnauthorized` jamais désactivé** : `scripts/probe-narabi.mjs:493` `{ minVersion:"TLSv1.2", rejectUnauthorized:true }` codé en dur ; **aucune** occurrence de `rejectUnauthorized:false` ni `NODE_TLS_REJECT_UNAUTHORIZED`.
- **Borne d'octets** : `total > maxBytes` ⇒ `smtp_timeout` (:599), `SMTP_MAX_BYTES=64Kio` ; mutant C-G2-4 ROUGE ; `probe_smtp_byte_bound_stops_flood` (:871) coupe le flood > 64 Kio bien avant l'échéance.
- **Aucun narabi.json ne peut porter le secret par construction** : `alert_error` est un ensemble fermé (jamais une ligne serveur), le seul champ distant libre (`last_day`) est assaini, et `probe_secret_never_printed` compare les jetons du fil ⇒ argument structurel + oracle (pas seulement un balayage).

---

## 3. Mutants rejoués (byte-exact, `F:\tmp\g2d-narabi1b2a\mutate.mjs` ; restauration vérifiée, sha `probe-narabi.mjs` avant==après = `a6db4358…`)

| Mutant | cible | tueur | attendu | obtenu |
|---|---|---|---|---|
| C-G2-1a (2ᵉ timer de connexion) | C-G2-1 | `single_wall_clock` (`timers.length===1`) | RED | **RED** (fail=1) |
| M-ii-16 redéfini (inactivité, 2 patchs) | C-B-2/C-G2-1 | `single_wall_clock` + `global_deadline` | RED | **RED (fail=2)** |
| C-G2-3 (`isEmailish \s`→espace, ×3) | C-G2-3 | `probe_smtp_headers_wellformed` | RED | **RED** |
| C-G2-4 (borne octets désactivée) | C-G2-4 | `probe_smtp_byte_bound_stops_flood` | RED | **RED** |
| C-G2-5 (plafond `smtpDeadlineMs` retiré) | C-G2-5 | `probe_smtp_deadline_ms_is_capped` | RED | **RED** |
| C-G2-6 (`deliver` ligne incomplète) | C-G2-6 | `probe_smtp_reply_needs_complete_line` | RED | **RED** |
| no-leak (`clearT` retiré du finally) | C-G2-1 | `probe_smtp_no_residual_timer_handle` | RED | **RED** |
| **VOISIN** `clearT` retiré du catch connexion (:576) | robustesse | `failure_leaves_narabi` + `unreachable_closed_port` + `no_residual_timer` | (chasse) | **SURVIT** (pass=3) → C-G2D-1 |

7/7 tueurs ROUGES ; le voisin :576 **SURVIT** aux tests nommés → lacune d'oracle (C-G2D-1). Restauration byte-exacte après chaque mutant.

---

## 4. Flakiness + suite complète (décomptes exacts, sous `env -u`)
- **`test/probe-narabi.test.ts` ×15** : **15/15 → 45 pass / 0 fail / 0 cancelled, exit 0** (tuple unique `45/0/0` ; durées 10,9-19,5 s). **Aucun** ECONNRESET/uncaught/`not ok`. Le de-flake C-G2-2 tient.
- **`npm run test`** (tous workspaces) : **509 tests / 509 pass / 0 fail / 0 cancelled**, exit 0 (~34 s).
- **`npm run ci`** (`gate:vocab && typecheck && test`) : exit 0 ; `gate:vocab OK — scanned 178 file(s)` ; typecheck 0 ; suite **509/509**.

---

## 5. R-25 (pathspec `STAT=` exacte de `.github/workflows/ci.yml`, contre `lot/narabi-ops-1b-i`)
`git diff --shortstat lot/narabi-ops-1b-i...HEAD -- . <exclusions ci.yml>` (3-points, merge-base `331c169`) = **1026 ins + 51 del = 1077**. Identique en 2-points (les seuls fichiers divergents dus à la base avancée `e52dce5` sont des `docs/**/*.md`, exclus). **1077 ≤ 1205 (plafond), ≤ 1150 (cible)**. **Conforme à la valeur PLI G2 = 1077.** sha256 des 4 livrables == table PLI G2 (`a6db4358…`, `9197d866…`, `e4cbc9fa…`, `a8bb73f8…`).

---

## 6. Cohérence inter-lots — **VÉRIFIÉ (merge-tree non destructif, git 2.55)**

### Arithmétique `TimeoutStartSec` combinée -a + -b : **100 < 120 TIENT avec le code réel**
- `-b` (`lot/narabi-ops-1b-ii-b` = `b9e9675`) constantes lues FIRST-HAND : `STATE_TIMEOUT_MS = 5_000` (`-b:mjs:69`), `STATE_RETRIES = 1` (`-b:mjs:70`, « FIXED, not env-tunable ») ⇒ **GET₂ pire cas = 5000×(1+1) = 10 s** (le « +10 s » de la note `service:30` est EXACT, source lue, pas de seconde main).
- Combiné = GET₁ 50 + GET₂ 10 + SMTP 30 + marge 10 = **100 s < TimeoutStartSec 120 s**. VRAI.
- **`-b` ne touche PAS `deploy/monark-probe.service`** (diff -b = `probe-narabi.mjs` + `test` + docs). À la fusion -a×-b, **seul -a modifie `TimeoutStartSec` (90→120) ⇒ AUCUN conflit sur cette ligne, 120 gagne proprement** (vérifié : arbre fusionné `fa5c4e34:deploy/monark-probe.service` = `TimeoutStartSec=120`, note -b préservée).

### Carte des conflits — merge-tree first-hand
- **(A) -a × -b** (merge-base `331c169`, exit 1) : conflits **`ADR-NARABI-OPS-1.md`**, **`probe-narabi.d.mts`**, **`probe-narabi.mjs`** ; **auto-merge PROPRE** de `RUNBOOK-sentinel.md` ET **`test/probe-narabi.test.ts`** ; **`deploy/monark-probe.service` SANS conflit**.
- **(B) -a × `e52dce5`** (L-6a) : **seul `ADR-NARABI-OPS-1.md` en conflit** ; `RUNBOOK-sentinel.md` auto-merge PROPRE. **Conforme au PLI G2 (B).**
- **Conflit ADR = adjacence, diagnostic PLI EXACT** : base `331c169` a deux rangées consécutives sans ligne vide ; L-6a réécrit `timeline → probe` (rangée 1), -a réécrit `probe → alerte` (rangée 2) ; git groupe le hunk ⇒ conflit bien que les changements par rangée ne se chevauchent pas. -a n'a PAS touché la rangée 1 (contexte seul), comme le PLI l'affirme. **Résolution PLI correcte** : `theirs` (L-6a) pour `timeline → probe` + `ours` (-a) pour `probe → alerte` ; amendement daté -a auto-merge propre. Le label « prendre-les-deux » est lâche mais la spécification par rangée est exacte et non ambiguë.

---

## Corrections proposées (NON BLOQUANTES — code livré CORRECT ; items formés, zéro dette)

### C-G2D-1 — non bloquant — Lacune d'oracle : le chemin d'ÉCHEC-CONNEXION ne fixe pas la libération du timer (`scripts/probe-narabi.mjs:576`)
Le `clearT(timer)` du catch d'échec-connexion (`:576`) est le SEUL point de libération sur ce chemin (le `finally :635` n'est pas atteint quand le connect rejette). **Aucun test nommé ne l'épingle** : `probe_smtp_no_residual_timer_handle` (:857) ne couvre que le SUCCÈS ; les tests de port fermé (`:1015`, `:1059`) utilisent `killMs=0` et l'échéance par défaut (20 s) ⇒ ils PASSENT même si le timer fuit.
**Voisin survivant mesuré** : retirer `clearT(timer)` de `:576` ⇒ les 3 tests nommés PASSENT (pass=3), MAIS le sous-processus réel fuit un handle ~`deadlineMs` — **mesuré : pristine `100 ms` vs mutant `10095 ms`** (port fermé, `SMTP_DEADLINE_MS=10000`, narabi.json écrit, exit 1, `smtp_unreachable`, pas de FATAL dans les deux cas). Fuite BORNÉE (≤ échéance capée 30 s < `TimeoutStartSec` 120 s, narabi.json déjà écrit) ⇒ pas de violation de contrat, mais une régression future ne serait pas attrapée.
**Correction** : jumeau côté ÉCHEC de `probe_smtp_no_residual_timer_handle` — port fermé + `SMTP_DEADLINE_MS=30000` + `killMs`, asserter `elapsed < ~8000` et `killed:false` (pristine ~100 ms ; timer fui ⇒ SIGKILL ⇒ RED). **error_origin : worker G1 (rédaction du test — même classe que C-G2-3/4/5 d'origine).**

### C-G2D-2 — non bloquant — Précision de la carte des conflits : `test:434` auto-merge PROPRE (composition +GET₂ non signalée par git)
Deux imprécisions de la carte (A), dans le sens SÛR :
1. `deploy/monark-probe.service:25-31` est listé « Conflit AVEC -b » mais **ne conflicte PAS** (-b n'y touche pas ; 120 de -a gagne proprement) — sur-inclusif, sans risque.
2. `test:434` (`worstCappedSec`) est listé « à re-fusionner / corriger avec C-G2-1 », **mais le fichier test auto-merge PROPRE** : -b ne modifie PAS cette ligne (sa formule reste base GET+marge = 60 s ; -a l'a passée à 90 s ⇒ -a gagne sans conflit). Après fusion -b (qui AJOUTE GET₂ +10 s au code), la formule fusionnée resterait **90 s**, sous-estimant de 10 s le vrai pire cas combiné **100 s** — **git ne signalera AUCUN conflit** pour forcer la composition. Reste sûr (120 > 100), mais un futur abaissement de `TimeoutStartSec` se fiant à la formule (90) casserait la marge.
**Correction** : au merge -b, l'orchestrateur compose MANUELLEMENT `worstCappedSec` avec le terme GET₂ (`STATE_TIMEOUT_MS*(STATE_RETRIES+1)` = 10 s ⇒ 100 s), git ne le forçant pas ; et la carte (A) marque `service` « non conflictuel » et `test:434` « auto-merge → composition manuelle », pas « conflit ». **error_origin : orchestrateur (exécution merge -b) ; précision de carte = worker G1.** Propriétaire orchestrateur, déclencheur = fusion -b.

*(Notes formées hors mandat -a, propriétaire orchestrateur, déclencheur fusion -b : (i) commentaire périmé `mjs:57` « < TimeoutStartSec 90 s » — item du PLI, toujours présent, non aggravé par le fold ; (ii) -b a le MÊME défaut de formule en interne — son propre `worstCappedSec` (60 s, GET+marge) omet le terme GET₂ que son commentaire code chiffre à 70 s.)*

---

## error_origin proposé (assigné au G7 par l'orchestrateur, non auto-déclaré)
- C-G2-1..6 (mandat du fold) : **worker G1** — tous correctement pliés et vérifiés.
- C-G2-7/8 (docs / carte) : **orchestrateur** (réassignation de plan / exécution merge).
- C-G2D-1 : **worker G1** (lacune d'oracle sur le chemin d'échec-connexion, introduite par le design timer-unique du fold).
- C-G2D-2 : **orchestrateur** (composition arithmétique au merge -b) + précision de carte worker G1.

## Provenance
G2-DELTA par relecteur **`claude-opus-4-8[1m]`** (effort max), instance séparée à contexte frais, 2026-09-21. R-20 (aucun commit/rebase/fusion/workflow ; tout offline/loopback, sous `env -u` ; `.invalid`/vrai mail jamais atteints ; scratch `F:\tmp\g2d-narabi1b2a\`, rien sur C:). R-21 (chaque affirmation porte `fichier:ligne` + scénario reproductible + mesure : harness murale 11/11, falsifieur inactivité↔mural rejoué first-hand [709 ms mural vs 738 ms inactivité, drip handshake NON discriminant — distinction portée par M-ii-16 conversation], 8 mutants byte-exacts, voisin mesuré 100 ms↔10095 ms, flakiness 15/15, R-25 1077, GET₂ 10 s des constantes -b lues, merge-tree first-hand). Advisor intégré (`claude-fable-5-1`) consulté avant travail substantiel ET avant clôture (falsifieur drip exécuté sur son conseil ; formulation ×1 corrigée en structurelle ; STATE_RETRIES lu first-hand). Verdict, vérification adversariale finale (R-21) et acceptation validateur-humain restent chez l'orchestrateur.
