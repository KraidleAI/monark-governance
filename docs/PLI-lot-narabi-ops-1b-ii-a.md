# PLI — sous-lot NARABI-OPS-1b-ii-a (ALERTE mail SMTP + rappel quotidien — « Bell »)

Implémenteur G1, worker **`claude-opus-4-8[1m]`**, effort max, 2026-09-21. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme ; l'orchestrateur vérifie ce préfixe avant de consommer cette sortie comme preuve.
Worktree EXCLUSIF `F:\Monark-wt-narabi1b2a`, branche `lot/narabi-ops-1b-ii-a` **empilée sur `lot/narabi-ops-1b-i`** (base R-25 = `lot/narabi-ops-1b-i`, HEAD `331c169`). R-20 : aucun commit, aucun workflow, aucune action sortante (tout offline/loopback ; `.invalid` jamais résolu ; aucun mail réel). R-21 : chaque affirmation porte sa preuve `fichier:ligne` ouverte first-hand ou sa mesure reproductible.
Plan qui FAIT FOI : `docs/G0-ADDENDUM-lot-narabi-ops-1b-ii.md` (périmètre **-a** seul) + `docs/CHECKPOINT1-DELTA-lot-narabi-ops-1b-ii.md` (C-B-1..13, C-NB-1..11). Décisions investisseur acquises : **E-4 = AUCUNE exception** (décision 88), **E-5 = redéploiement accordé** (décision 92, concerne **-b**, pas -a).

## Modèle résolu PAR ÉTAPE (provenance)
| Étape | Rôle | Modèle résolu | Effort |
|---|---|---|---|
| Orientation + lecture des plans/code | worker | `claude-opus-4-8[1m]` | max |
| Advisor (avant travail substantiel + spike codes d'erreur) | advisor intégré | `claude-fable-5-1` (harness) | — |
| Implémentation `probe-narabi.mjs` / `.d.mts` / `.service` | worker | `claude-opus-4-8[1m]` | max |
| Tests `probe-narabi.test.ts` (nouveaux + réconciliation hérités) | worker | `claude-opus-4-8[1m]` | max |
| Mutants M-ii-* (18 runs, RED, restauration byte-exacte) | worker | `claude-opus-4-8[1m]` | max |
| Oracles (suite complète, gates) + rédaction du PLI | worker | `claude-opus-4-8[1m]` | max |

## Livrables (sha256, mesuré `sha256sum` le 2026-09-21)
| Fichier | sha256 | R-25 (ins/del) |
|---|---|---|
| `scripts/probe-narabi.mjs` | `4c25b3443987241a278f9a4ff0b105be50c6440aaf7676be208e54e8db224107` | 314 / 17 |
| `scripts/probe-narabi.d.mts` | `5c4c021005ca011ab43b9dc9485604d0c4c3c5b28d005a03effa97754751c041` | 62 / 3 |
| `test/probe-narabi.test.ts` | `eb47981237b684f5ec7eb5d7e7178f7a02de6c5ba992eac004759f9535a9b026` | 478 / 17 |
| `deploy/monark-probe.service` | `b2d5e8ca8344e389bba1d1f9f84123be93eb3e10c0ca4ab3049688957aae3d4d` | 14 / 14 |
| `docs/PLI-lot-narabi-ops-1b-ii-a.md` (ce fichier) | — | exclu R-25 (`docs/**/*.md`) |

> **NOTE (fold G2, 2026-09-21) : ces shas + R-25 sont ceux du G1 (`9fd3736`). Après le fold des corrections
> C-G2-1..8, les shas et le R-25 ont changé — voir la section « PLI G2 » plus bas (shas recalculés, R-25 = 1077).
> C'est la table « PLI G2 » qui fait foi pour la vérification adversariale de l'orchestrateur.**

## Table de traçabilité : correction → `fichier:ligne` → test → mutant
| C-B/C-NB | Implémentation (`scripts/probe-narabi.mjs` sauf mention) | Test (`test/probe-narabi.test.ts`) | Mutant (RED) |
|---|---|---|---|
| **C-B-1** `alert_error` ensemble FERMÉ, jamais la réponse serveur | `sendSmtp` `:538` renvoie un code fermé ; type `AlertError` (`.d.mts:26`) ; `main` imprime l'état `:687` | `probe_secret_never_printed` `:744` | M-ii-3 (log du fil), M-ii-15 (ligne serveur copiée) |
| **C-B-2** échéance GLOBALE unique + bornes octets | `MAX_SMTP_DEADLINE_MS` `:71`, `SMTP_MAX_BYTES` `:72`, timer unique `:563`, borne octets `:578` | `probe_smtp_global_deadline` `:764` (goutte-à-goutte + muet après DATA) | M-ii-16 (inactivité seule) |
| **C-B-3** injection CR/LF via `day` (seul champ distant libre) | `sanitizeField` `:423` appliqué à `last_day` dans le corps `:468` | `probe_smtp_injection_crlf_sanitized` `:784` | M-ii-5 (assainissement retiré) |
| **C-B-4** dot-stuffing (encodeur DATA pur) | `encodeData` `:478` | `probe_smtp_dot_stuffing` `:804` | M-ii-17 (dot-stuffing retiré) |
| **C-B-5** bootstrap état absent/corrompu/schéma inconnu | `readPriorState` `:409` | `probe_reads_missing_or_corrupt_state_as_bootstrap` `:907` + `probe_reads_schema1_state_without_crash` `:925` | M-ii-18 (crash JSON) |
| **C-B-6** aucun test n'envoie un vrai mail (env explicite purgé) | n-a (test) : `childEnv` (spread unique) ; runners/factices loopback | `g2_no_test_can_send_real_mail` `:987` (purge + spread unique) | garde de contrôle (scan source `...process.env` = 1) |
| **C-B-7** borne VRAIE ≤ 1 mail/tir ; flap = incident neuf | `maybeAlert` `:625` (prédicats i/ii + rétablissement) | `probe_alert_daily_reminder_once_per_utc_day` `:700` (soutenue + FLAP) | M-ii-8a/b (rappel chaque tir / aucun rappel) |
| **C-B-8** TLS prouvé PAR EXÉCUTION sans cert + aiguillage épinglé | `tlsConnectOptions` `:491`, `smtpTransportPlan` `:498`, connexion `:551` | `probe_smtp_implicit_tls_never_speaks_plaintext` `:834`, `probe_smtp_tls_options_pinned` `:852`, `probe_smtp_refuses_plaintext_off_loopback` `:860` | M-ii-19 (net partout), M-ii-7 (rejectUnauthorized:false), M-ii-12 (minVersion retiré), M-ii-4 (plaintext hors loopback) |
| **C-B-9** L-6b docs | ADR/RUNBOOK = orchestrateur (hors -a code) ; ce PLI | n-a | n-a |
| **C-B-13** flag inconnu ⇒ erreur, sans écrire narabi.json de prod | `parseArgs` `else { throw }` `:670` ; `main` catch → exit 2 sans probe() `:678` | `probe_rejects_unknown_flag` `:975` | M-ii-21 (flag ignoré) |
| **C-NB-8** en-têtes + validation `ALERT_TO/FROM` | `composeMail` `:450` (Date déterministe, sujet constant `:433`, Message-ID, MIME, Content-Type), `isEmailish` `:428`, `smtpConfig` `:515` | `probe_smtp_headers_wellformed` `:814` | (couvert par C-8 M-ii-6 pour la forme manquante) |
| **C-NB-10** échec SMTP laisse narabi.json écrit (exception synchrone comprise) | OPTION 2 : `maybeAlert` `:625` try/catch UNIQUE ; `probe` écrit UNE fois `:390` | `probe_smtp_failure_leaves_narabi_written` `:936` | M-ii-20 (garde retirée ⇒ FATAL, non écrit) |
| **C-2** alerte jamais perdue (`alerted:=true` après 250 seul) | `maybeAlert` succès `:651` vs échec `:654` | `probe_alert_retries_until_delivered` `:683` | M-ii-1 (alerted avant 250) |
| **C-3** changement de `reason` même jour ⇒ 0 mail | prédicat (i) `if (!alerted)` `:630` | `probe_alert_reason_change_same_day_no_mail` `:725` | M-ii-2 (ré-alerte) |
| **C-8** config absente ⇒ bruyant (`smtp_unconfigured`, exit 1) | `smtpConfig` `:515`, `maybeAlert` `:637` ; unité `EnvironmentFile` sans `-` (`deploy/monark-probe.service:23`) | `probe_smtp_unconfigured_is_noisy` `:882`, `probe_timer_multiple_shots` `:408` (unité) | M-ii-6 (unconfigured sauté) |
| **fait 16** AUTH PLAIN + LOGIN négociés depuis EHLO `250-` | `sendSmtp` parse mécanismes `:596`, PLAIN `:598`, LOGIN `:600` | `probe_smtp_auth_plain_and_login` `:868` | M-ii-11 (parseur EHLO mono-ligne) |
| **fait 12** vocabulaire du mail | `composeMail` `:450` (corps/sujet sur ensemble fermé) | `probe_alert_mail_has_no_forbidden_vocab` `:956` (patterns chargés de `vocab-banned.json`) | (test dédié ; patterns GLOBAUX+sentinel) |
| **C-3 SMTP** transport port fermé + timeout | `classifyConnectError` `:509`, borne connexion `:555` | `probe_smtp_unreachable_closed_port_and_timeout` `:892` | (couvert par M-ii-20 pour l'écriture) |
| **Q10** hérités `--file` unhealthy ⇒ `alert_error:"smtp_unconfigured"` | env purgé (test) | `probe_narabi_detects_lag` `:143` (asserte `alert_error` sans deepEqual) | — |
| **schéma 2** `alerted/alert_error/last_alert_day/state_checked` | `SCHEMA=2` `:26`, base `evaluate`, exit `unhealthy \|\| alert_error` `:399` | tous les tests -a ci-dessus | — |
| **L-3a** unité : `EnvironmentFile` sans `-`, `TimeoutStartSec=120` | `deploy/monark-probe.service:23,29` | `probe_timer_multiple_shots` `:408` (pire cas GET+SMTP+marge = 90 s < 120) | — |

## Mutants imposés -a (§10.3) — 18 runs, TOUS ROUGES, restauration byte-exacte (jamais `git checkout`)
Runner `F:\tmp\narabi1b2a\run-mutants.mjs` : pristine gardé en mémoire, mutation → test tueur ciblé (`--test-name-pattern`) → **restauration byte-exacte depuis la copie pristine**. sha256 `probe-narabi.mjs` avant == après = `4c25b344…` (RESTORE OK ; == sha du livrable).

M-ii-1 (RED), M-ii-2 (RED), M-ii-3 (RED), M-ii-4 (RED), M-ii-5 (RED), M-ii-6 (RED), M-ii-7 (RED), M-ii-8a (RED), M-ii-8b (RED), M-ii-11 (RED), M-ii-12 (RED), M-ii-15 (RED), M-ii-16 (RED), M-ii-17 (RED), M-ii-18 (RED), M-ii-19 (RED), M-ii-20 (RED), M-ii-21 (RED). **18/18 ROUGES.**

## Oracles (suite COMPLÈTE — leçon U-4a)
- `npm test` (suite entière) : **503 pass / 0 fail** (baseline avant -a = 482 ; +21 tests -a ; suite sonde = 39). Aucun gate racine masqué.
- `tsc --noEmit` (typecheck) : **0**.
- `npx eslint test/probe-narabi.test.ts` (fichier touché ; `.mjs`/`.d.mts` ignorés par eslint) : **0**.
- `node scripts/lint-ratchet.mjs` : **69/69** (0 violation ajoutée).
- `node scripts/grep-forbidden.mjs` (gate:vocab) : **OK, 178 fichiers** (dont `scripts/probe-narabi.mjs` + `test/probe-narabi.test.ts` sous le scope `sentinel`).
- `node scripts/export-public.mjs --check` (export:check) : **OK**.
- `node scripts/lang-gate.mjs --scope root,contracts,sentinel,bell` : **OK, 0 hit**.
- `no-secret-in-repo` : vert (dans la suite ; `SMTP_PASS` jamais committé — env hors dépôt).
- (Non exécuté volontairement : `npm run ci`.)

## R-25
`git diff --shortstat lot/narabi-ops-1b-i -- . <excludes ci.yml:65>` (arbre de travail, ref unique) = **919** (868 ins + 51 del). Plafond 1 205 ; seuil d'alerte 1 100 ; projection addendum 915–1 040 ⇒ **dans la bande** (marge 286 sous le plafond). Par fichier mesuré (`git diff --shortstat` par pathspec) : `.mjs` 331 (314/17), `.d.mts` 65 (62/3), `.test.ts` 495 (478/17), `.service` 28 (14/14). Docs (ce PLI) exclus.

## Déviations (toutes RÉSOLUES avec source — aucune dette)
1. **Ordre d'écriture — résumé de mission vs addendum §5 C-NB-10.** Le résumé de mission disait « écrire narabi.json (détection) AVANT l'envoi puis réécrire après le 250 ». L'addendum G0 (qui FAIT FOI, §5 C-NB-10) choisit explicitement l'**OPTION 2 = écrire UNE fois APRÈS** (évaluer→décider→envoyer→250→écrire) et **rejette** « écrire avant » (motif : cela changerait le résiduel E-4). Ce résiduel « faute disque = aucun mail ce run-là » est le verbatim E-4 **accepté par l'investisseur (décision 88)**. **Suivi = OPTION 2** (advisor intégré consulté, confirmé). Implémenté : `maybeAlert` `:625` (try/catch unique) + écriture unique `probe` `:390`. Test `probe_smtp_failure_leaves_narabi_written` `:936` ; M-ii-20.
2. **`SMTP_TLS=none` hors loopback ⇒ `smtp_unconfigured`.** L'ensemble fermé n'a pas de code « insecure » ; un refus de configuration TLS non sûre AVANT toute connexion est un défaut de config ⇒ `smtp_unconfigured` (pas `smtp_tls_failed`, qui mentirait sur un handshake jamais tenté). `smtpTransportPlan` `:499`. Advisor confirmé.
3. **`state_checked:false` toujours en -a.** Le champ fait partie du schéma 2 (addendum §7) ; le 2ᵉ GET qui peut le passer à `true` est **-b**. Schéma stable entre -a et -b. Base `evaluate` (défauts).
4. **Jeton AUTH PLAIN sans octet NUL en source.** Le `\u0000` (JSON de l'outil) décodait en octet NUL brut dans le fichier (fragile, R-21). Remplacé par `Buffer.concat([Buffer.from([0]), Buffer.from(user), Buffer.from([0]), Buffer.from(pass)])` (`:598`) — **jeton identique sur le fil**, source sans NUL (vérifié : `has NUL: false`).
5. **`probe_timer_multiple_shots` (hérité) modifié côté SERVICE uniquement.** EnvironmentFile sans `-` + pire cas `TimeoutStartSec` incluant `MAX_SMTP_DEADLINE_MS`. Les assertions timer/DEADLINE (`OnCalendar >= DEADLINE`) sont **intactes**. `deploy/monark-probe.timer`, la constante `DEADLINE_UTC`, et les oracles `probe_timer_oncalendar_ge_deadline`/`probe_deadline_single_source…` sont **NON TOUCHÉS** (vérifié `git diff` = 0 sur ces cibles), conformément à la règle « delta -1b-i, pas -a ».
6. **Contrat de sortie étendu** : `exit 1 ssi unhealthy OU alert_error !== null` (G0 -1b C-15), `probe` `:399`.

## Items formés / reste dû (déclencheur + propriétaire — aucun « dû » nu, aucune dette nouvelle ouverte par -a)
- **Confirmations de déploiement** (orchestrateur, §10.5-A-5, déclencheur = campagne Bell sous GO 72) : handshake TLS 1.2+ réel sur 465 + refus à nom d'hôte erroné ; mécanisme AUTH observé (PLAIN/LOGIN, sans imprimer `SMTP_PASS`) ; RSS sans OOM ; **preuve Linux fuseau + injection `--import` = premier run CI** ; **premier mail réel = déclencheur `upcoming → built`** (décision 58). Le CODE de -a supporte PLAIN **et** LOGIN négociés ⇒ l'item « mécanisme AUTH Hostinger non documenté » est **résolu côté code** (aucune procuration requise ; confirmation au 1er mail = orchestrateur).
- **587 STARTTLS** (déclencheur : « 465 refusé au mail de test ») et **dead-man/heartbeat** (déclencheur : G0 T-1b) : items FORMÉS préexistants (addendum §8), propriétaire orchestrateur — **non codés** (pas de code mort), inchangés par -a.
- **Reste dû de -a : néant côté code.** Le périmètre -a de l'addendum est complet ; aucune procuration de document formée (aucun chiffre de seconde main introduit ; le fait 16 Hostinger est déjà tranché côté code par PLAIN+LOGIN).

## Bloc CHANTIERS (verbatim, un modèle résolu par étape)
```
NARABI-OPS-1b-ii-a (Bell — alerte mail SMTP + rappel quotidien) : G1 IMPLÉMENTÉ.
- Client SMTP built-ins (node:tls implicite 465 / node:net loopback), AUTH PLAIN+LOGIN négociés, TLS>=1.2
  rejectUnauthorized épinglé ; échéance globale MAX_SMTP_DEADLINE_MS=30s + borne octets ; alert_error ensemble
  fermé ; assainissement day + dot-stuffing ; en-têtes déterministes sujet constant ; machine à états schéma 2
  (bootstrap, ≤1 mail/tir, 1/jour UTC, flap=incident neuf) ; parseArgs flag inconnu ⇒ erreur ; unité sans `-`,
  TimeoutStartSec=120.  (worker claude-opus-4-8[1m], effort max, 2026-09-21)
- E-4 (aucune exception, décision 88) : le code démarre et reste sous « un mail pour tout état unhealthy ».
- 503/503 tests, 18/18 mutants ROUGES, R-25=919<=1205, tous gates verts.  (worker claude-opus-4-8[1m])
- NON couvert (=-b) : 2ᵉ GET state.json, state_mismatch/state_unreachable, unité sentinel, tueur réessai GET.
- Déploiement (GO 72, Bell) = orchestrateur seul, après G7+checkpoint-2 des DEUX sous-lots. Le worker ne déploie
  ni ne committe (R-20).
```

## Bloc JOURNAL (verbatim, un modèle résolu par étape)
```
2026-09-21  NARABI-OPS-1b-ii-a  G1  worker=claude-opus-4-8[1m](effort max)  base=lot/narabi-ops-1b-i(331c169)
  R-1 déclaré : claude-opus-4-8[1m] (préfixe conforme).
  Advisor intégré (claude-fable-5-1, harness) consulté AVANT écriture : ordre d'écriture tranché OPTION 2
    (addendum §5, lié à la décision 88) ; mapping erreurs fondé par un SPIKE offline mesuré (tls->plaintext =
    ERR_SSL_WRONG_VERSION_NUMBER ; port fermé = ECONNREFUSED ; .invalid = ENOTFOUND).
  Livrables : probe-narabi.mjs (+314/-17), probe-narabi.d.mts (+62/-3), probe-narabi.test.ts (+478/-17),
    monark-probe.service (+14/-14).  sha256 consignés au PLI (table Livrables).
  Oracles (suite COMPLÈTE) : npm test 503/503 ; typecheck 0 ; eslint(fichier touché) 0 ; lint:ratchet 69/69 ;
    gate:vocab OK(178) ; export:check OK ; lang:gate(root,contracts,sentinel,bell) 0 ; no-secret-in-repo vert.
  Mutants M-ii-1..21 (18, dont 8a/8b) : 18/18 ROUGES, restauration byte-exacte (sha probe-narabi.mjs inchangé).
  Fichiers interdits (delta -1b-i) NON touchés : DEADLINE_UTC, monark-probe.timer, oracles de deadline.
  error_origin : assigné au G7 par l'orchestrateur (non auto-déclaré).  R-20 : aucun commit/workflow/action.
```

---

# PLI G2 — fold des corrections du relecteur (worker `claude-opus-4-8[1m]`, effort max, 2026-09-21)

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, effort max ; l'orchestrateur
vérifie ce préfixe avant de consommer cette sortie comme preuve. Fold du G2 SMTP dédié
(`docs/G2-lot-narabi-ops-1b-ii-a.md`, PASS-AVEC-CORRECTIONS). Worktree exclusif `F:\Monark-wt-narabi1b2a`, branche
`lot/narabi-ops-1b-ii-a`, base `ffe4b9d`. R-20 : aucun commit, aucun rebase, aucune fusion, aucun workflow
(l'orchestrateur le fait). Tout offline/loopback, sous `env -u SMTP_HOST -u SMTP_PORT -u SMTP_USER -u SMTP_PASS -u
SMTP_TLS -u ALERT_TO -u ALERT_FROM` ; `.invalid` jamais résolu ; aucun vrai mail. Scratch `F:\tmp\narabi1b2a\pli\`,
rien sur C:. R-21 : chaque affirmation ci-dessous porte sa preuve `fichier:ligne` first-hand ou sa mesure
reproductible.

## Modèle résolu PAR ÉTAPE (fold G2)
| Étape | Rôle | Modèle résolu | Effort |
|---|---|---|---|
| Orientation (lecture G2/code/tests/docs/PLI) | worker | `claude-opus-4-8[1m]` | max |
| Advisor (avant écriture — design C-G2-1) | advisor intégré (harness) | `claude-fable-5-1` | — |
| C-G2-2 de-flake + preuve mécanisme + stabilité 20×/5× | worker | `claude-opus-4-8[1m]` | max |
| C-G2-1 (échéance murale unique) + C-G2-6 (`deliver`) | worker | `claude-opus-4-8[1m]` | max |
| C-G2-3/4/5 + commentaires (`service`, `.d.mts`, `test`) | worker | `claude-opus-4-8[1m]` | max |
| C-G2-7 docs (ADR/RUNBOOK) — L-6b réassigné au lot | worker | `claude-opus-4-8[1m]` | max |
| Mutants (11, RED, restauration byte-exacte) + oracles ×3 + PLI | worker | `claude-opus-4-8[1m]` | max |

## Livrables (sha256 recalculés APRÈS fold, `sha256sum`, 2026-09-21) — **FAIT FOI**
| Fichier | sha256 | R-25 (ins/del vs `lot/narabi-ops-1b-i`) |
|---|---|---|
| `scripts/probe-narabi.mjs` | `a6db4358255ada5de89817548d5b14d89fc773fa3858d27ad97e0b931899e964` | 335 / 17 |
| `scripts/probe-narabi.d.mts` | `e4cbc9fabc9f35d9785c72c660bfb42acbeecd1a11829d567a84905f35ff0fa3` | 74 / 3 |
| `test/probe-narabi.test.ts` | `9197d8661aa5d040421e35a635040fcd5707fe9eae1b2358bb7d858337ac27af` | 601 / 17 |
| `deploy/monark-probe.service` | `a8bb73f80c2d980d432316918c7b3b8749f53996da08fc91ecd25b7cccdef648` | 16 / 14 |
| `docs/adr/ADR-NARABI-OPS-1.md` | `b383fae2a6f3df5c8c1e1c7a7e025e79870b21570469e958fb651b6c4ea89795` | exclu R-25 (docs) |
| `docs/RUNBOOK-sentinel.md` | `980b32bad6c6cd9dc4955a0c1f715564ef6555eda66ae11f6e1e92b5d9d1dcad` | exclu R-25 (docs) |

## Table de correction : C-G2-n → `fichier:ligne` (après fold) → test → mutant RED → error_origin
| # | Correction pliée | `fichier:ligne` | Test non-LLM | Mutant rejoué (RED) | error_origin |
|---|---|---|---|---|---|
| **C-G2-1** BLOQUANT | échéance MURALE UNIQUE (connexion+handshake TLS+conversation), UN seul timer `setT` avant connect, `onDeadline` réassignable (connect→conversation), `clearT` en `finally` seul + connect-catch, horloge injectable | `mjs:540` (sig `clock`), `mjs:554-556` (`deadlineAt`+timer unique), `mjs:561-575` (connect-catch), `mjs:582` (onDeadline conv.), `mjs:635` (clearT finally) ; `.d.mts:22,119-131` ; `service:25-31` ; `test:434` (formule x1) | `probe_smtp_single_wall_clock_deadline_covers_whole_exchange:796`, `probe_smtp_connect_deadline_bounds_handshake:839`, `probe_smtp_no_residual_timer_handle:857`, `probe_smtp_global_deadline` (hérité) | **C-G2-1a** (2ᵉ timer connexion) RED ; **M-ii-16** (inactivité au lieu de mural) RED sur `global_deadline` **ET** `single_wall_clock` ; **no-leak** (clearT retiré) RED | **worker G1** |
| **C-G2-2** BLOQUANT (test) | `sock.on("error", () => {})` sur TOUS les factices SMTP | `test:582` (`startFakeSmtp`), `test:961` (factice TLS-clair), + serveurs inline ajoutés `test:806` / `test:843` | stabilité (voir plus bas) | garde de flake (mécanisme prouvé, pas un mutant) | **worker G1** |
| **C-G2-3** | cas CR/LF ajoutés à la liste invalide `ALERT_TO/FROM` | `test:953` ; garde `isEmailish` `mjs:429` | `probe_smtp_headers_wellformed:816` | **C-G2-3** (`\s`→espace) RED — via cas CLEAN `a@b.c\r\nx` / `a@b.c\nx` (voir nuance) | **worker G1** |
| **C-G2-4** | test de la BORNE d'octets SMTP (>64 Kio) | `mjs:599` (garde) ; `test:871` + factice `flood` (`test:582`) | `probe_smtp_byte_bound_stops_flood:871` | **C-G2-4** (borne désactivée) RED | **worker G1** |
| **C-G2-5** | export `smtpDeadlineMs` + plafond épinglé | `mjs:529` (export), `mjs:532` (plafond) ; `.d.mts:119` ; `test:885` | `probe_smtp_deadline_ms_is_capped:885` | **C-G2-5** (plafond retiré) RED | **worker G1** |
| **C-G2-6** | `deliver()` : lignes COMPLÈTES seulement | `mjs:588` (`i < lines.length - 1`) ; `test:893` + factice `fragmentAuthFinalLine` | `probe_smtp_reply_needs_complete_line:893` | **C-G2-6** (`i < lines.length`) RED | **worker G1** |
| **C-G2-7** | docs L-6b (réassigné au lot, cf. addendum) | `ADR:83` (ligne `probe → alerte`) + amendement daté fin de fichier ; `RUNBOOK` nouvelle section « Déploiement de la sonde (Bell) » | revus par checkpoints (docs hors R-25) | N/A | **orchestrateur** |
| **C-G2-8** | base périmée / carte des conflits | ce PLI (carte des conflits ci-dessous) | merge-tree 3-way first-hand | N/A | **orchestrateur** |

**Nuance C-G2-3 (R-21, vérifiable par l'orchestrateur)** : le payload réaliste `"a@b.c\r\nRCPT TO:<x>"` (imposé)
est déjà rejeté par son espace et ses `<>` **même sous le mutant** `\s`→espace, donc il ne suffit **PAS** à tuer le
mutant. Ce sont les cas à queue PROPRE `"a@b.c\r\nx"` / `"a@b.c\nx"` (ajoutés) qui rendent le mutant ROUGE : sous
`[^ @<>]`, `\r`/`\n` passent → `isEmailish` renvoie `true` → l'assertion `false` échoue. Les trois cas sont présents
(`test:953`).

## C-G2-1 — limite honnête (R-21, non dissimulée)
Le mutant « exact retour aux DEUX échéances séquentielles par phase » (`socket.setTimeout` connexion + `setTimeout`
conversation, = le code d'origine) **n'est pas falsifiable par un test fonctionnel loopback de timing** : sur
loopback la connexion `net` est instantanée et une connexion TLS silencieuse expire à ~1× sous l'ancien **comme**
sous le nouveau code (mesuré). Le pire cas 2× n'apparaît qu'avec une connexion qui SUCCÈDE après ~deadline PUIS une
conversation qui pend ~deadline — non reproductible sur loopback (poignée de main TLS lente non fabricable offline
sans vrai serveur TLS). C'est exactement le constat N-1 du relecteur (« survie attendue… prouvé par
arithmétique+dynamique »). La propriété est donc gardée **structurellement** (horloge injectable → UN seul timer
couvrant les 2 phases, `probe_smtp_single_wall_clock…`) **et arithmétiquement** (formule x1 `test:434`, vraie une
fois le timer unique), pas par un seuil de temps. Les deux mutants imposés SONT rouges : « 2ᵉ timer connexion »
(C-G2-1a, via `timers.length===1`) et « inactivité au lieu de mural » (M-ii-16, via le drip + `timers.length===0`).

**« Goutte-à-goutte PENDANT le handshake » (item de mission, R-21)** : avec le timer MURAL armé AVANT le connect et
JAMAIS réarmé, un handshake en goutte-à-goutte est borné **à l'identique** d'un handshake silencieux (le timer mural
ne se réarme pas sur les octets reçus, contrairement à l'ancien `socket.setTimeout` d'inactivité) — borne prouvée
par `probe_smtp_connect_deadline_bounds_handshake` (silencieux ⇒ `smtp_timeout` ≤ deadline + marge, non SIGKILL) et
propriété « UN timer, non réarmé » prouvée par `probe_smtp_single_wall_clock…`. Un test « vrai handshake TLS **valide**
égrené octet par octet » n'est **PAS fabricable offline** : il faudrait un vrai serveur TLS lent ; un cert auto-signé
est refusé par `rejectUnauthorized:true` épinglé AVANT la fin du handshake (⇒ `smtp_tls_failed` immédiat, pas un
handshake lent), et un flux d'octets bruts non-TLS fait échouer la couche TLS immédiatement. La distinction
inactivité↔mural qu'un goutte-à-goutte exploiterait est, elle, bien tuée par M-ii-16 (drip de conversation ⇒ pend
puis SIGKILL sous inactivité). Recherche de solutions documentée, pas un contournement (doc 03).

## Mutants — 11 rejoués, TOUS ROUGES (runner `F:\tmp\narabi1b2a\pli\run-mutants.mjs`)
Runner : snapshot des octets pristine en mémoire → patch(s) (assert : chaque `find` matche EXACTEMENT 1×) → test
tueur sous `env -u SMTP_*/ALERT_*` → **restauration byte-exacte depuis le snapshot (jamais `git checkout`)** →
assert sha256 avant==après. Résultat :

| Mutant | Cible | Tueur | Obtenu |
|---|---|---|---|
| M-ii-3 client logge le fil (AUTH→stderr) | C-B-1 | `probe_secret_never_printed` | **RED** |
| M-ii-15 ligne serveur → `alert_error` | C-B-1 | `probe_secret_never_printed` | **RED** |
| M-ii-16 inactivité au lieu de mural (2 patchs) | C-B-2/C-G2-1 | `probe_smtp_global_deadline` + `…single_wall_clock…` | **RED (fail=2)** |
| M-ii-19 net partout (implicit→clair) | C-B-8 | `probe_smtp_implicit_tls_never_speaks_plaintext` | **RED** |
| M-ii-20 garde retirée ⇒ FATAL non écrit | C-NB-10 | `probe_smtp_failure_leaves_narabi_written` | **RED** |
| C-G2-1a 2ᵉ timer de connexion | C-G2-1 | `…single_wall_clock…` (`timers.length===1`) | **RED** |
| C-G2-3 `isEmailish \s`→espace | C-G2-3 | `probe_smtp_headers_wellformed` | **RED** |
| C-G2-4 borne d'octets SMTP désactivée | C-G2-4 | `probe_smtp_byte_bound_stops_flood` | **RED** |
| C-G2-5 plafond `smtpDeadlineMs` retiré | C-G2-5 | `probe_smtp_deadline_ms_is_capped` | **RED** |
| C-G2-6 `deliver` accepte une ligne incomplète | C-G2-6 | `probe_smtp_reply_needs_complete_line` | **RED** |
| no-leak `clearT(timer)` retiré du finally | C-G2-1 | `probe_smtp_no_residual_timer_handle` | **RED** |
| **11/11** | | | **11/11 ROUGES** |

**M-ii-16 REDÉFINI pour le nouveau code (pas rejoué à l'identique)** : sa mutation d'origine (conversation
`setTimeout` → `socket.setTimeout`) visait une ligne **SUPPRIMÉE par C-G2-1** (il n'y a plus de `setTimeout` de
conversation séparé — un seul timer mural). L'équivalent à 2 patchs (retirer le timer mural pré-connect + poser un
`socket.setTimeout` d'inactivité pour la conversation) garde la propriété gardée **identique** et tue DEUX tests
(`fail=2` : drip + horloge injectable `timers.length===0`) — plus fort que l'original. **M-ii-3/15/19/20 sont, eux,
rejoués TELS QUELS** (leurs lignes cibles sont intactes après le fold).

sha `probe-narabi.mjs` avant==après = `a6db4358…` ; sha `test` avant==après = `9197d866…` (restauration byte-exacte
vérifiée par le runner). Note : le délai de fragmentation C-G2-6 (60 ms) a suffi (mutant ROUGE dès le 1er essai,
deux événements `data` distincts) ; à re-vérifier si un CI plus lent coalesce les segments (relever à 80 ms).

## C-G2-2 — preuve du flake + stabilité
- **Mécanisme (déterministe)** : `F:\tmp\narabi1b2a\pli\mechanism.mjs` — un socket `net` émettant `error` (ECONNRESET,
  ce que le pair RST du `socket.destroy()` de la sonde provoque) SANS listener **THREW: ECONNRESET** ; avec
  `sock.on("error")` **swallowed**. (Sur ma machine le flake ne s'est pas reproduit en 8× puis 20× isolé — race
  sensible à la charge ; le relecteur l'a mesuré 3/8 & 1/6. Le mécanisme + le correctif sont indépendants de la
  reproduction.)
- **Factices concernés** : `startFakeSmtp` (`test:582`) et le factice TLS-clair (`test:961`) — corrigés. Les
  `net.createServer()` **sans handler de connexion** (`test:1016`, `test:1069`, ports fermés) n'acceptent aucune
  socket ⇒ pas de handler requis. Les serveurs `node:http` (GET) ont un modèle d'erreur distinct (`clientError`
  interne) ⇒ non touchés. Les factices AJOUTÉS (`single_wall_clock` `test:806`, `connect_bounds` `test:843`, `flood`
  et `fragment` dans `startFakeSmtp`) portent tous `sock.on("error")`.
- **Stabilité (FIXÉ, mesurée sur le fichier FINAL 45 tests, sha `9197d866…`, APRÈS l'ajout des 6 tests + 3 factices
  RST `single_wall_clock`/`connect_bounds`/`flood`+`fragment`, tous porteurs de `sock.on("error")`)** :
  `probe_smtp_global_deadline` **20/20** isolé + fichier entier **5/5** (chacun **45 pass / 0 fail / 0 cancelled**).

## Oracles (suite COMPLÈTE, sous `env -u SMTP_*/ALERT_*`)
- `npm run test` (tous workspaces) **× 3 exécutions consécutives** : **509 / 509 / 509 pass, 0 fail, 0 cancelled**
  (stable ; baseline 503 + 6 tests -a du fold). Durée ~36 s/run.
- `tsc --noEmit` (typecheck) : **0**.
- `npx eslint test/probe-narabi.test.ts` (fichier touché ; `.mjs`/`.d.mts` ignorés) : **0**.
- `lint:ratchet` : **69/69**. `gate:vocab` : **OK, 178 fichiers**. `export:check` : **OK**. `lang:gate` : **OK, 0
  hit** (scope `{root,contracts,schemas,hikae,ukemi,atelier,monark,site,harness,skills,sentinel,bell}` — `docs/` hors
  scope, donc le titre FR « Déploiement de la sonde » du RUNBOOK, comme l'existant « Sonde externe », ne trippe pas).
- `no_secret_in_repo` : **vert** (test isolé 1/1 ; et dans la suite ×3). Balayage : `s3cr3t-PONY-cell-42` n'apparaît
  hors `test/probe-narabi.test.ts` que dans `docs/G2-…md` (prose du relecteur) — aucun ajout par ce fold.

## R-25 (pathspec `STAT=` de `.github/workflows/ci.yml`, contre `lot/narabi-ops-1b-i`)
**1026 ins + 51 del = 1077** (2-points arbre de travail ; docs `*.md` exclus). Plafond **1 205**, cible ≤ 1 150,
seuil d'alerte 1 100 ⇒ **1077 sous la cible**, marge 128 sous le plafond, 23 sous le seuil d'alerte. Par fichier :
`.mjs` 335/17, `.d.mts` 74/3, `.test.ts` 601/17, `.service` 16/14. Rien ne sort en item (aucun dépassement).
`DEADLINE_UTC`, `deploy/monark-probe.timer`, les oracles de deadline et `vocab-banned.json` **NON touchés**
(vérifié `git diff` vide sur ces cibles).

## Carte des conflits (mise à jour)
**(A) Conflit AVEC `-1b-ii-b` (frère, même `probe-narabi.mjs`) — régions du relecteur, à re-fusionner :**
`mjs:50-72` bloc de constantes (STATE_MAX_BYTES/STATE_TIMEOUT_MS de -b) — **mon fold a modifié UNE ligne de commentaire
SMTP dans ce bloc (`mjs:66`, « conversation » → « connect + TLS handshake + conversation », C-G2-1)** ; -b ajoute
ses constantes STATE_* (côté GET, pas SMTP) ⇒ collision improbable, mais LISTÉE ; `mjs:259` boucle de réessai GET ;
`mjs:293-324` `evaluate` (insertion `state_unreachable`/`state_mismatch`) ; `mjs:300/368` défauts `state_checked` ;
`mjs:343-352` branche 2ᵉ GET ; `.d.mts:29-30` `ProbeReason` (**mes ajouts `.d.mts:119-131` `smtpDeadlineMs`/`SmtpClock`
sont HORS de cette région**) ; `service:25-31` (TimeoutStartSec + GET₂ — **ma NOTE `-b` `service:30` dit déjà : GET₂
+10 ⇒ 100 < 120, aucune rehausse**) ; `test:434` formule de pire cas (déjà x1, vraie post-C-G2-1). **Le commentaire
périmé `mjs:57` (« < TimeoutStartSec 90 s », faux : 120) est LAISSÉ INTACT** (région -b `:50-72`, hors mandat) — **item
formé, propriétaire orchestrateur, déclencheur = fusion -b (qui re-touche ce bloc de toute façon)**.

**(B) Conflit AVEC `-1b-i` (base empilée, via L-6a `e52dce5`) — MESURÉ first-hand (`git merge-tree --write-tree`, non
destructif via `git stash create`) :**
- `docs/RUNBOOK-sentinel.md` : **auto-merge PROPRE** (ma section « Déploiement de la sonde (Bell) » insérée `:175`,
  ≥ 8 lignes de tampon sous les régions L-6a `126-133` et `183-191`).
- `docs/adr/ADR-NARABI-OPS-1.md` : **CONFLIT TRIVIAL (exit 1)** — non pas parce que j'ai édité `:81` (je ne l'ai PAS
  touché ; il apparaît en CONTEXTE), mais par **adjacence** : L-6a réécrit la ligne `timeline → probe` (`:81`) et moi
  la ligne `probe → alerte` (`:82`), deux rangées de table CONSÉCUTIVES sans ligne vide ⇒ git groupe le hunk.
  **Résolution (prendre-les-deux, sans ambiguïté)** : garder la ligne `timeline → probe` de L-6a (theirs) **ET** ma
  ligne `probe → alerte` (ours) ; l'amendement daté que j'ajoute en fin de fichier auto-merge PROPRE.
  **Propriétaire = orchestrateur** (R-20 : je ne rebase/fusionne rien), **déclencheur = rebase/fusion sur `e52dce5`**.
  Non bloquant, résolution ~30 s. (Le résumé C-G2-8 espérait qu'éditer `:82` ≠ `:81` éviterait le conflit ; la mesure
  montre que l'adjacence le crée quand même — surfacé ici plutôt que subi.)

## Déviations (fold G2)
1. **L-6b réassigné au LOT (déviation manquante que le G2 signale, C-G2-7)** : la `PLI:37` (G1) réassignait
   « ADR/RUNBOOK = orchestrateur » **sans le lister sous « Déviations »**. Corrigé : L-6b (docs ADR/RUNBOOK) est
   fait ICI par le worker (l'addendum l'assigne au lot -1b-ii), et cette déviation est désormais DÉCLARÉE. `ADR:83`
   + amendement daté ; `RUNBOOK` section Bell. error_origin = orchestrateur (réassignation de plan).
2. **`mjs:66` (commentaire du bloc SMTP) édité** bien qu'il soit dans la région -b `:50-72` : changement d'UNE ligne
   (« conversation » → « connect + TLS handshake + conversation ») pour aligner sur C-G2-1 ; risque de collision -b
   minimal (bloc SMTP de -a, pas les STATE_* de -b) — listé en carte des conflits (A). Le `mjs:57` (autre commentaire
   de la même région) est au contraire LAISSÉ INTACT (item formé).
3. **C-G2-1 non falsifiable par timing loopback** (variant « 2 échéances par phase ») : gardé structurellement +
   arithmétiquement, déclaré ci-dessus (section « limite honnête »). Aucune dette : le mutant imposé « inactivité »
   (M-ii-16) et « 2ᵉ timer » (C-G2-1a) SONT rouges.
4. **`smtpDeadlineMs` exporté** (C-G2-5) : élargit la surface publique du `.mjs` (+ `.d.mts`) — assumé (le G2 l'exige
   pour épingler le plafond) ; testé `probe_smtp_deadline_ms_is_capped`.

## Reste dû (déclencheur + propriétaire — aucun « dû » nu, aucune dette nouvelle)
- **Conflit ADR `-1b-i`** (orchestrateur, déclencheur = rebase sur `e52dce5`) : résolution prendre-les-deux ci-dessus.
- **Commentaire `mjs:57` périmé** (orchestrateur, déclencheur = fusion -b) : à corriger « 90 s » → cohérent avec
  `TimeoutStartSec=120` quand -b re-touche `:50-72`.
- **Déploiement Bell + 1er mail réel** (orchestrateur, déclencheur = GO 72 après G7+checkpoint-2 des DEUX sous-lots) :
  handshake TLS réel, refus nom d'hôte, quotage `SMTP_PASS`, `upcoming → built` — procédure au RUNBOOK (section Bell).
- **Côté code : néant.** Les 8 corrections C-G2-* sont pliées ; aucune procuration de document formée (aucun chiffre
  de seconde main introduit).

## Bloc JOURNAL (verbatim, un modèle résolu PAR ÉTAPE — modèles DÉCLARÉS)
```
2026-09-21  NARABI-OPS-1b-ii-a  FOLD G2  worker=claude-opus-4-8[1m](effort max)  base=ffe4b9d(sur lot/narabi-ops-1b-i)
  R-1 déclaré : claude-opus-4-8[1m] (préfixe claude-opus-4-8 conforme). Opus 5 banni, non utilisé.
  Advisor intégré (claude-fable-5-1, harness) consulté AVANT écriture : design C-G2-1 (timer mural unique,
    onDeadline réassignable, connect-catch pour R-25, horloge injectable) validé ; ordre C-G2-2-d'abord ;
    limite honnête variant-2-échéances non falsifiable loopback confirmée (= N-1 du relecteur).
  Corrections pliées : C-G2-1 (échéance murale unique, mjs:554-556/561-575/582/635 ; horloge injectable),
    C-G2-2 (sock.on(error) sur tous les factices ; 20/20+5/5 stables ; mécanisme prouvé), C-G2-3 (CR/LF test:953),
    C-G2-4 (borne octets test:871 + factice flood), C-G2-5 (export smtpDeadlineMs mjs:529 + plafond), C-G2-6
    (deliver mjs:588 + factice fragment), C-G2-7 (ADR:83 + amendement + RUNBOOK section Bell — L-6b au lot),
    C-G2-8 (carte des conflits, merge-tree first-hand).
  Livrables (sha256 recalculés) : mjs a6db4358…, d.mts e4cbc9fa…, test 9197d866…, service a8bb73f8…,
    ADR b383fae2…, RUNBOOK 6bc92b30…  (table Livrables PLI G2).
  Oracles : npm test 509/509 ×3 (0 fail, 0 cancelled) ; tsc 0 ; eslint(test) 0 ; ratchet 69/69 ; vocab OK(178) ;
    export OK ; lang OK(0) ; no_secret_in_repo vert.  R-25=1077<=1150(cible)<=1205(plafond).
  Mutants : 11/11 ROUGES (M-ii-3/15/16/19/20 rejoués + C-G2-1a/3/4/5/6 + no-leak), restauration byte-exacte
    (sha mjs/test avant==après), jamais git checkout.
  Interdits NON touchés : DEADLINE_UTC, deploy/monark-probe.timer, oracles de deadline, vocab-banned.json.
  R-20 : aucun commit/rebase/fusion/workflow. error_origin : C-G2-1..6=worker G1, C-G2-7/8=orchestrateur (assigné
    au G7 par l'orchestrateur, non auto-déclaré).  Vérification adversariale + verdict G7 + acceptation
    validateur-humain restent chez l'orchestrateur.
```

## Provenance
Généré par l'IMPLÉMENTEUR G1 **`claude-opus-4-8[1m]`**, effort max, 2026-09-21, dans le worktree exclusif `F:\Monark-wt-narabi1b2a`. R-20 (aucun commit, aucun workflow déclenché, aucune action sortante — offline/loopback, `.invalid` non résolu, aucun mail réel ; scratch `F:\tmp\narabi1b2a\`, rien sur C:). R-21 (chaque affirmation porte son `fichier:ligne` first-hand ou sa mesure ; sha256 des livrables recalculés ; 18 mutants rejoués ROUGES). La vérification adversariale (G2 SMTP dédiée par relecteur Opus 4.8 séparé, C-NB-6), le verdict G7 et l'acceptation du validateur-humain restent chez l'orchestrateur.
