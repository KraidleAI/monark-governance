# G2-DELTA — pli G2 du sous-lot NARABI-OPS-1b-ii-b (relecture adversariale du delta `3fbf2b0..0ab2a43`)

**Relecteur G2-DELTA : instance séparée à contexte frais (n'a écrit NI le code, NI le rapport G2, NI le pli).**
**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, effort max. L'orchestrateur
vérifie ce préfixe avant de consommer cette sortie comme preuve.
R-20 : aucun commit, aucun workflow, aucune action sortante. Mutants joués IN-PLACE puis restaurés BYTE-EXACT
depuis `F:\tmp\g2d-narabi1b2b\bak\`, sha256 re-vérifié == pristine après CHAQUE mutant ; **jamais `git checkout`/`stash`**.
R-21 : chaque affirmation porte son `fichier:ligne` first-hand ou sa mesure reproductible (rejeu, non recopie des chiffres du worker).
Worktree `F:\Monark-wt-narabi1b2b`, branche `lot/narabi-ops-1b-ii-b`, HEAD `0ab2a43` (inchangé), base R-25 `57e9cbc`.
Horloge `date -u` = `2026-09-21T03:53Z`. Scratch : `F:\tmp\g2d-narabi1b2b\` (bak pristines, mutate.mjs, *.log). Rien sur C:.
Node v24.15.0 ; `node_modules` déjà présent (jamais `npm ci`/`npm install`).

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le delta `3fbf2b0..0ab2a43` (pli G2 : 3 tests killers, RUNBOOK §6 réécrit, PLI §10) est **correct et branché**. Les **7
fichiers du lot (PLI §7)** sont byte-identiques (7 sha256 vérifiés) ; les **3 mutants prescrits N-G2-1/2/3 sont
ROUGES** (rejoués moi-même, chacun tuant EXACTEMENT son test nommé, les 7 autres verts, restaurés byte-exact) ; la
**suite complète est 512/512** (et `npm run ci` 512/512) ; **R-25 = 479 ≤ 1205** ; **flakiness 0/10** ; aucun test ne
peut toucher le réseau ni envoyer un mail. Les corrections C-G2-1..5 et N-G2-1..3 du rapport G2 sont **toutes pliées
comme prescrit** (code) ou **consignées en items formés** (fusion / avant-E-5), exactement dans la classification du G2
d'origine.

**Aucun défaut bloquant pour le G7 de -b en isolation.** Trois corrections NON bloquantes : deux imprécisions de doc
opérateur au RUNBOOK §6 (**C-G2D-1**, **C-G2D-2** — à plier avant E-5, le RUNBOOK étant la procédure de déploiement) et
un trou de couverture mineur borné-sûr (**C-G2D-3**). Détails et `error_origin` en §7.

---

## 1. Table correction → preuve (chaque C-G2-n / N-G2-n RÉELLEMENT plié ?)

| # | Prescription du G2 | Plié où (first-hand) | Preuve (rejeu / lecture) | État |
|---|---|---|---|---|
| **C-G2-1 (i)** | documenter le **livelock de rattrapage** (2ᵉ voie de kill) | `RUNBOOK-sentinel.md` §6 (172-297) : Mode A (catch-up livelock) + Mode B (torn line) + table de tri + réparations A.1/A.2/B | RUNBOOK lu ; seuil ≥12 j re-dérivé (§3) ; A.2 `LAST/NEXT` et B troncature RE-EXÉCUTÉS OK (§3) | **PLIÉ** (caveat C-G2D-1) |
| **C-G2-1 (ii)** | atténuation code `run.ts` (`MAX_CATCHUP_DAYS_PER_RUN`) | **NON faite** — item formé (§10.3/§10.7), motivée par l'invariant | invariant `lag>0 ⇔ stopped!==null ⇔ exit 1` vérifié sur `run.ts:75-93,175` ; corroboré `sentinel-retry.test.ts` (b):163-166 / (d):189-192 / (e):199-203 (lus) | **PLIÉ** (item formé, fondé) |
| **C-G2-2** | « self-heals » surdéclaré / permanence sous-déclarée | `RUNBOOK` §6 Mode B (262-268) : « self-heals on the next run **THAT WRITES A LINE** » + « **EVERY** subsequent run FATALs in `loadState` (:111) **UNTIL** removed » | conforme à `run.ts:182` (garde `report.lines.length>0`) et `:111` (`JSON.parse` sans try/catch) — lus | **PLIÉ correctement** |
| **C-G2-3** | pinner le pire-cas COMBINÉ 120 > 100 | PLI §5.2 reformulé (diff PLI:137-145) : « pas une rehausse ; étendre UNE assertion à GET₁+GET₂+SMTP+marge » ; item de 2ᵉ fusion (`MAX_SMTP_DEADLINE_MS` vit en -a) | diff PLI lu ; classification cohérente (constante absente de ce worktree) | **PLIÉ** (item formé, correct) |
| **C-G2-4** | `gate:vocab` ne couvre pas le test neuf | PLI §5.1 / §10.1 : item de fusion (ajouter le fichier à `sentinel.files[]` + preuve) | `npm run ci` : « gate:vocab OK — scanned **181** file(s) » ; le fichier neuf hors des 181 (item de fusion, comme déclaré) | **PLIÉ** (item formé, correct) |
| **C-G2-5** | provenance D ancrée par n° de ligne (fragile) | `probe-narabi-state.test.ts:30-39` : ancrage **CONTENU** (substring « mesure D = 25,481 s (run publiant 00:47:55→00:48:20 UTC ») ; n°/sha en SECONDAIRE | `grep -n` → ligne 310 ; sha256 de `split("\n")[309]` (LF-norm) = `2d3158b2…` == commentaire (rejoué) | **PLIÉ correctement** |
| **N-G2-1** | killer type-guard `digest` (string) | test `probe_state_digest_must_be_string` (:303-320) | **REJOUÉ** : mutant `d != null` (:304) ⇒ **RED 7/1**, `expected state_unreachable, actual state_mismatch` | **PLIÉ + PROBANT** |
| **N-G2-2** | killer override `PROBE_STATE_URL` honoré + gardé | test `probe_state_url_override_honored_and_guarded` (:330-350) | **REJOUÉ** : mutant `deriveStateUrl(url)` seul (:411) ⇒ **RED 7/1** (dérive l'URL canonique loopback ⇒ healthy) | **PLIÉ + PROBANT** |
| **N-G2-3** | killer liaison runtime `maxBytes: STATE_MAX_BYTES` | test `probe_state_get2_binds_state_max_bytes` (:277-298) | **REJOUÉ** : mutant sans `maxBytes` (:412) ⇒ **RED 7/1** (lit 65853 o entiers ⇒ healthy) ; **valeur** du cap pinée à 317 o près (voisin +1024 ATTRAPÉ) | **PLIÉ + PROBANT** |

**Provenance sha256 (état gelé du delta, first-hand)** — les 7 fichiers == PLI §7 EXACTEMENT :
`probe-narabi.mjs 1001c1cd…`, `probe-narabi.d.mts 09d6a641…`, `monark-sentinel.service d70f88cc…`,
`probe-narabi.test.ts 2d820136…`, `probe-narabi-state.test.ts 55e50222…`, `ADR-NARABI-OPS-1.md db21d698…`,
`RUNBOOK-sentinel.md 3a049053…`.

---

## 2. Rejeu adversarial des mutants (item 2) — je n'ai PAS lu les chiffres du worker

Protocole : `cp bak/pristine → fichier`, mutation par `mutate.mjs` (exact-replace, **assert exactement 1 occurrence**),
portée = `test/probe-narabi-state.test.ts` sous `env -u SMTP_* ALERT_* PROBE_STATE_URL` avec les flags package.json
(`--test-timeout=120000 --test-force-exit`), restauration byte-exact, sha256 re-vérifié. **Baseline pristine = 8/8.**

| Mutant | Mutation exacte (fichier:ligne) | Prédiction | Résultat REJOUÉ | Test qui rougit | Restauré |
|---|---|---|---|---|---|
| **N-G2-1** | `typeof d === "string"` → `d != null` (`probe-narabi.mjs:304`) | RED | **RED 7/1** (`actual: state_mismatch`) | `probe_state_digest_must_be_string` (seul) | sha == 1001c1cd… ✓ |
| **N-G2-2** | drop `process.env.PROBE_STATE_URL ??` (`:411`) | RED | **RED 7/1** | `probe_state_url_override_honored_and_guarded` (seul) | sha == pristine ✓ |
| **N-G2-3** | drop `maxBytes: STATE_MAX_BYTES,` (`:412`) | RED | **RED 7/1** | `probe_state_get2_binds_state_max_bytes` (seul) | sha == pristine ✓ |

**Mutants voisins (recherche d'un survivant, item 2) :**

| Voisin | Mutation | Résultat | Constat |
|---|---|---|---|
| **V** | `maxBytes: STATE_MAX_BYTES` → `+ 1024` (`:412`) | **ATTRAPÉ** (7/1) | La **valeur** du cap est pinée (corps oversize mesuré = 65853 o, soit **317 o** au-dessus du cap 65536 ; +1024 admet le corps ⇒ healthy ⇒ RED). Pas seulement « présence ». |
| **R** | drop `retries: STATE_RETRIES` (`:412`) | **SURVIT** (8/8) | **Trou de couverture** : la liaison runtime de `STATE_RETRIES` au GET₂ n'est pas pinée (aucun test ne compte les tentatives du GET₂). |
| **T** | drop `timeoutMs: STATE_TIMEOUT_MS` (`:412`) | **SURVIT** (8/8) | Idem : la liaison runtime de `STATE_TIMEOUT_MS` n'est pas pinée. |

⇒ **2 des 3 liaisons runtime STATE_* (retries, timeout) survivent** — même classe que le trou `maxBytes` que N-G2-3 vient
de fermer. **Non bloquant** : le code livré passe bien les 3 constantes (lu `:412`) et N-G2-3 attrape tout drop de `maxBytes`
(RSS/OOM). Portée exacte (pire cas, `monark-probe.service TimeoutStartSec=90` en -b ; l'assertion `probe_state_get_rss_and_worstcase_bounds`
modèlise GET₂ à partir des CONSTANTES ⇒ 70 s, aveugle au runtime) : **un seul** binding tombé reste sous 90 s même à env-max
(timeout seul ⇒ GET₂ 10×2=20 s ⇒ 50+20+10=80 s ; retries seul ⇒ 5×5=25 s ⇒ 85 s) ; **les DEUX** tombés + env aux plafonds durs
(`PROBE_TIMEOUT_MS=10000`, `PROBE_RETRIES=4`) ⇒ GET₂ 10×5=**50 s** ⇒ GET₁+GET₂+marge = **110 s > 90 s** = exactement le risque
d'env-widening que les STATE_* FIXES (`probe-narabi.mjs:65-70`) devaient prévenir. C-G2D-3 (couverture) : requiert un édit
régressif de DEUX bindings + un env mal réglé ⇒ non bloquant, mais réel.

---

## 3. RUNBOOK §6 — exact, exécutable, seuil, invariant (item 3)

**Seuil « ≥ ~12 jours » — dérivé CORRECTEMENT.** `⌈300 / 25,481⌉ = ⌈11,77⌉ = 12` (rejoué). Qualifié **borne inférieure** :
`run.ts:72` (`let lo = DEPLOY_BLOCK`, lu) réinitialise la recherche de bloc à chaque run et ne la resserre qu'AU SEIN d'un
run (`:91` `lo = facts.toBlock + 1`, lu) ⇒ le jour 1 porte la recherche la plus large ⇒ `N·D` surestime ⇒ seuil réel ≥ 12.
Ancre D = 25,481 s prise sur `JOURNAL-PROVENANCE.md:310` (localisée par CONTENU, sha vérifié). **Prémisse « D couvre 1
seul jour dû » = lecture du worker (RUNBOOK 176-177 : « T=3, ~4 lignes ») ; `JOURNAL:310` (lu) ne porte que le wall-clock,
PAS le décompte — NON re-vérifiée ici.** L'ordre de grandeur tient quand même : à 2 jours dus le seuil doublerait (~24 j),
donc « dizaine(s) de jours, ni jamais ni toujours » reste vrai. Le « 12 » exact dépend de la prémisse 1-jour.

**Invariant `lag>0 ⇔ stopped!==null ⇔ exit 1` — TIENT (lu `run.ts`).** `stopped` n'est posé qu'AU `break` dans la boucle
`runDue` (`:75-92`) ⇒ ≥1 jour non traité ⇒ `lag = dueList.length - processedDays.length ≥ 1` (`:93`) ; complétion normale ⇒
`lag=0, stopped=null` ; `:175` `exitCode = stopped!==null ? 1 : 0`. La décision de **ne PAS toucher `run.ts`** est fondée :
un `MAX_CATCHUP_DAYS_PER_RUN` force soit `lag=0/exit 0` avec backlog CACHÉ (ré-introduit le masquage supprimé le 2026-09-20),
soit un état NEUF `lag>0 && stopped===null && exit 0` que `sentinel-retry.test.ts` (b/d/e, lues) ne pinne jamais ⇒ changement
de sémantique RUN-REPORT. Item formé (G0/ADR) correct.

**Niveau de vérification (R-21) : les one-liners `node` sont EXÉCUTÉS ; la séquence `systemctl`/drop-in est VALIDÉE PAR
LECTURE contre les units (aucun systemd sur cet hôte Windows — jamais le VPS, aucune action sortante).**

**Procédure RE-EXÉCUTÉE (offline, sur fixtures) :**
- **A.2 `LAST=`/`NEXT=`** sur le vrai snapshot ⇒ `LAST=2026-09-18 NEXT=2026-09-19` (attendu). ✓
- **B step-1 (parse check)** : fichier sain ⇒ « PARSES — not torn » ; fixture tronquée (2 lignes + JSON partiel sans `\n`) ⇒ « TORN — remove it ». ✓
- **B step-2 (troncature au dernier `\n`)** : sur la tronquée ⇒ 2 lignes, `last-day=2026-09-18`, **byte-identique au fichier sain** ; sur un fichier complet ⇒ **no-op** (sha256 avant==après). ✓
- **B step-3 (`--dry-run`)** : subtil mais CORRECT — `loadState` (`:162`, network-free) s'exécute AVANT tout RPC (`:166`) ; le texte distingue justement FATAL-`SyntaxError` (ligne tronquée, reprendre) de `exit 1 fetch_error/quorum` (réseau, chaîne saine) — lu, conforme au flux `run.ts`.
- **Units** : `monark-sentinel.service Type=oneshot`, aucun `Restart=`, `TimeoutStartSec=300`, `ExecStart=/usr/bin/env node …/run.ts` (== forme A.2) ; timer 4 slots UTC + `RandomizedDelaySec=1800` + `Persistent=true` ; §4 utilise `override.conf` pour `MONARK_SENTINEL_J0` ⇒ garde-fou A.1 « never override.conf » + nom distinct `catchup.conf` **fondé**. Commandes systemd valides **(validées par lecture des units, non exécutées — pas de systemd ici)** : `systemctl daemon-reload`, `systemctl show -p TimeoutStartUSec`, drop-in `TimeoutStartSec=infinity` puis retrait + `daemon-reload` + re-`show` ⇒ retour à `5min`/300 s. ✓

**Deux imprécisions de doc opérateur (voir C-G2D-1, C-G2D-2)** — non bloquantes, mais le RUNBOOK est la procédure E-5.

---

## 4. Suite complète + CI (item 4) — aucun réseau, aucun mail

| Oracle | Commande | Résultat REJOUÉ |
|---|---|---|
| Suite complète | `env -u SMTP_HOST -u SMTP_USER -u SMTP_PASS -u ALERT_TO -u PROBE_STATE_URL npm run test` | **tests 512 / pass 512 / fail 0 / skipped 0 / todo 0 / cancelled 0** (exit 0, 36,9 s) |
| CI | `npm run ci` (gate:vocab + typecheck + test) | exit 0 ; gate:vocab **OK — 181 fichiers, 0 claim** ; typecheck **0 erreur** ; **512/512** |

**Aucun test ne peut toucher le réseau ni envoyer un mail (preuve structurelle, first-hand) :**
- **Aucun code d'envoi de mail** dans tout le worktree (grep `nodemailer|createTransport|sendMail|smtp` = 0) — sous-lot DÉTECTION seule.
- **Tous les serveurs de test** bindent `127.0.0.1` (`listen(0,"127.0.0.1")`) ; le harness idem (`127.0.0.1:<port>`).
- **Tous les sites d'appel** de `runProbe*`/`probe(` dans `probe-narabi*.test.ts` passent `--url http://127.0.0.1:…` ou `--file <path>` ; les seuls hôtes non-loopback sont les cas `insecure_url` **refusés AVANT tout dial** (`urlTransportAllowed`). `DEFAULT_URL` (`monarkgate.tech`) n'est jamais atteint : aucun appel n'omet `--url`/`--file`.
- Ambient env avant la suite : **aucun** `SMTP_*/ALERT_*/PROBE_*` ; `env -u` les purge en plus ; `purgedEnv` (test) filtre les enfants.

---

## 5. R-25 (item 5) — pathspec `STAT=` exact de `ci.yml`, base `57e9cbc`

`git diff --shortstat "57e9cbc...HEAD"` (opérateur trois-points de `ci.yml:65`) avec le pathspec EXACT (docs/**/*.md,
G1/G2-lot-*.md, package-lock.json, fixtures/**, apps/{sentinel,bell}/…/fixtures/** exclus) :
**`5 files changed, 466 insertions(+), 13 deletions(-)` = 479 ≤ 1205** — conforme au PLI (479). `--stat` : 5 fichiers CODE
(`monark-sentinel.service`, `probe-narabi.d.mts`, `probe-narabi.mjs`, `probe-narabi-state.test.ts`, `probe-narabi.test.ts`) ;
**RUNBOOK et PLI (docs/**/*.md) bien EXCLUS**. Chaque fichier revu ≤ 1205.

---

## 6. Flakiness (item 6) — `probe-narabi-state.test.ts` × 10

10/10 runs **8 pass / 0 fail** (exit 0), durées 1711-2100 ms (stables). **0 anomalie / 10.** Aucun flake, y compris sur les
deux points sensibles au timing (`hits===1` de N-G2-2 ; `socket.destroy()` de `probe_get_retries_exactly_n_plus_one`).

---

## 7. Corrections C-G2D-n (numérotées, fichier:ligne, `error_origin`) — TOUTES NON BLOQUANTES

- **C-G2D-1 — RUNBOOK §6, table de tri Mode A : signal « SAME `processedDays` never shrinking » INOBSERVABLE.**
  `docs/RUNBOOK-sentinel.md:187`. `processedDays` n'est imprimé QU'au end-JSON `run.ts:180`, APRÈS le retour de `runDue` ;
  or le Mode A est précisément un kill PENDANT `runDue` (`:168`) ⇒ `:180` n'est jamais atteint ⇒ aucun end-JSON, donc
  `processedDays` n'est jamais émis pour le run tué. Le tri A vs B reste correct sur les AUTRES signaux (systemd
  `start operation timed out` + `NO sentinel FATAL` + `tail -1` PARSES) ; seul ce proxy additionnel est faux.
  **Correction** : remplacer par un observable réel — « **aucun** nouvel end-JSON (le run n'atteint jamais `run.ts:180`) ;
  systemd `start operation timed out`/`failed` à chaque slot ; `tail -1 timeline.jsonl` `day` **n'avance jamais** ».
  `error_origin` : **docs = worker (implémenteur du pli)**. Non bloquant G7 -b ; **à plier avant E-5** (1ᵉʳ signal lu par l'opérateur).

- **C-G2D-2 — RUNBOOK §6, réparation A.1 : `journalctl -f` APRÈS un `systemctl start` bloquant (oneshot).**
  `docs/RUNBOOK-sentinel.md:220-221`. `monark-sentinel.service` est `Type=oneshot` SANS `RemainAfterExit`
  (`deploy/monark-sentinel.service:15`) ⇒ `systemctl start` **bloque** jusqu'à la fin du run (avec le drop-in
  `TimeoutStartSec=infinity`, potentiellement long) ; le `journalctl -u monark-sentinel -f` qui suit surveille alors un
  run **déjà terminé** (le « wrote N line(s) » a été émis pendant le start bloqué). La procédure recouvre bien le service,
  mais « supervise it ; do not walk away » + `-f` séquentiel n'offre pas de suivi live.
  **Correction** : soit `systemctl start --no-block` puis `journalctl -f` (suivi live), soit `journalctl -f` dans un
  SECOND terminal lancé AVANT le start, soit remplacer `-f` par `-n 20 --no-pager` après le start bloquant.
  `error_origin` : **docs = worker**. Non bloquant G7 -b ; **à plier avant E-5**.

- **C-G2D-3 — Couverture : liaisons runtime `STATE_RETRIES` et `STATE_TIMEOUT_MS` du GET₂ non pinées.**
  `test/probe-narabi-state.test.ts` (mutants voisins R et T, §2). N-G2-3 pinne `maxBytes` (le risque RSS/OOM, le plus utile) ;
  `retries` et `timeout` restent des survivants. Le code livré est CORRECT (`probe-narabi.mjs:412` passe bien les 3) ;
  c'est un trou de SUITE : un seul binding tombé reste < 90 s même à env-max, mais les DEUX tombés + env aux plafonds durs
  ⇒ GET₁+GET₂+marge = **110 s > 90 s** (calcul §2) — précisément le risque d'env-widening que les valeurs FIXES STATE_*
  (`probe-narabi.mjs:65-70`) devaient prévenir, et que l'assertion `probe_state_get_rss_and_worstcase_bounds` (modèle par
  CONSTANTES ⇒ 70 s) ne voit pas. **Correction (optionnelle, au durcissement)** : un killer comptant les hits/timing du GET₂,
  ou une assertion pire-cas dérivée du BINDING runtime. `error_origin` : **couverture = worker**. Non bloquant (requiert un
  édit régressif de deux bindings + un env mal réglé ; N-G2-3 couvre déjà le drop `maxBytes`/RSS).

**`error_origin` global proposé au G7 :** C-G2-1(i)/2/5 = **docs = worker** ; C-G2-1(ii) = item formé (G0/ADR, propriétaire
orchestrateur) ; C-G2-3 = **couverture = worker + -a** (2ᵉ fusion) ; C-G2-4 = **contrainte de scope G0** (item de fusion, pas
un défaut code) ; C-G2D-1/2 = **docs = worker** ; C-G2D-3 = **couverture = worker**.

---

## 8. Provenance de cette relecture-delta
Relecteur G2-DELTA **`claude-opus-4-8[1m]`**, effort max, contexte frais, 2026-09-21T03:53Z. R-20 (aucun commit/workflow/action
sortante ; 3 mutants prescrits + 3 voisins joués in-place puis restaurés BYTE-EXACT depuis `bak/`, sha256 re-vérifié ==
pristine, worktree final `git status` VIDE, HEAD `0ab2a43` inchangé, 7 sha256 == PLI §7). R-21 (chaque fait porte son
`fichier:ligne` first-hand ou sa mesure rejouée ; suite/CI/flakiness/R-25 re-exécutés ; RUNBOOK one-liners re-exécutés sur
fixtures). Advisor intégré (Fable 5.1) consulté AVANT le rejeu et le verdict (blind spots RUNBOOK Mode A / A.1 oneshot /
piège réseau `DEFAULT_URL` intégrés). Logs : `F:\tmp\g2d-narabi1b2b\{N-G2-1,N-G2-2,N-G2-3,NB-R,NB-T,NB-V,full-test,ci,flake-1..10}.log`.
