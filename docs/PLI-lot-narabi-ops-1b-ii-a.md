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

## Provenance
Généré par l'IMPLÉMENTEUR G1 **`claude-opus-4-8[1m]`**, effort max, 2026-09-21, dans le worktree exclusif `F:\Monark-wt-narabi1b2a`. R-20 (aucun commit, aucun workflow déclenché, aucune action sortante — offline/loopback, `.invalid` non résolu, aucun mail réel ; scratch `F:\tmp\narabi1b2a\`, rien sur C:). R-21 (chaque affirmation porte son `fichier:ligne` first-hand ou sa mesure ; sha256 des livrables recalculés ; 18 mutants rejoués ROUGES). La vérification adversariale (G2 SMTP dédiée par relecteur Opus 4.8 séparé, C-NB-6), le verdict G7 et l'acceptation du validateur-humain restent chez l'orchestrateur.
