claude-opus-4-8[1m]  (modèle résolu — R-1 ; effort max ; relecteur G2 à contexte frais, instance SÉPARÉE de l'implémenteur)

# G2 — revue à contexte frais — sous-lot NARABI-OPS-1b-i (DÉTECTION)

R-20 (je ne committe pas, ne déclenche aucun workflow). R-21 (chaque affirmation porte sa preuve reproductible). Revue
PURE : aucune modification du worktree ; rejeux/mutants sur une COPIE `F:\tmp\g2-narabi1b\` (`git archive 7bc0535 | tar -x`,
`npm ci` exit 0, TMP/TEMP=F:\tmp). Aucune action sortante (loopback seulement). Commit jugé : `7bc0535` (branche
`lot/narabi-ops-1b-i`, base `298aa5c`). Plans qui font foi : `docs/G0-lot-narabi-ops-1b.md` (corps + Amendement
checkpoint-1 C-1..C-15 + Adjudications), `docs/CHECKPOINT1-lot-narabi-ops-1b.md`, pli `docs/PLI-lot-narabi-ops-1b-i.md`.
Périmètre -1b-i : C-1, C-4, C-5, C-6(GET), C-9, C-12, C-13, L-4, vocab ; PAS de SMTP.

## Verdict : **ACCEPTE-AVEC-CORRECTIONS**
Le cœur de détection est sain (logique UTC-stricte, chaîne complète recomputée, duplicat 31 champs byte-fidèle, proxy
chainstack non positionnel, entrée hostile jamais fatale) et TOUS les oracles rejoués passent (9/9 probe, 4/4
sentinel-retry, 27/27 ci-gates, no-secret 1/1, typecheck 0, eslint 0, vocab/export/lang/ratchet verts, R-25=793≤1205).
J'ai tué **16 mutants** (les 6 nommés par la mission + 3 permutations C-1 de mon cru + 3 mutants neufs + M5/M10/M12) et
validé le harnais par un contrôle négatif (no-op → SURVIVED). Reste **1 finding MAJEUR** (bypass de la garde loopback
sur `127.<x>.evil.com`, une déviation non déclarée du plan) + 5 mineurs/observations (dont le mutant de fuseau
équivalent sur le CI UTC, tracé). Aucun n'est un faux verdict de santé sur données réelles ; le majeur est une
correction ciblée (une ligne + un cas de test). Pas de REFUS : les critères d'acceptation -1b-i sont substantiellement tenus.

---

## FINDINGS

### C-G2-1 — Bypass de la garde loopback : `127.<x>.evil.com` accepté en `http://` clair — **MAJEUR**
**Déviation non déclarée du plan.** Le plan fixe l'ensemble loopback en **appartenance exacte** : `hôte ∈ {127.0.0.1,
::1, localhost}` (G0 L-2, `docs/G0-lot-narabi-ops-1b.md:25` ; C-6 : « même garde que le plaintext SMTP »). Le worker a
**élargi** `127.0.0.1` en une regex 127/8 `/^127\./` (`scripts/probe-narabi.mjs:153`) **et a asserté l'élargissement**
dans le test (`test/probe-narabi.test.ts:308` : `isLoopbackHost("127.0.0.53") === true`, « 127/8 is loopback »). Cette
regex matche **tout nom DNS** commençant par « 127. », pas seulement un littéral IPv4. Conséquence : `urlTransportAllowed`
admet un GET **http en clair** vers un hôte contrôlé par un tiers — la garde a pourtant pour but déclaré (`:148-149`)
« so a mis-set PROBE_URL never leaks a plaintext GET off-box ». Son propre modèle de menace (PROBE_URL mal réglé) est défait.

Preuve (import direct des fonctions exportées, `file://` sur la copie) :
```
isLoopbackHost("127.0.0.1.evil.com") = true      isLoopbackHost("127.evil.com") = true
urlTransportAllowed("http://127.0.0.1.evil.com/x") = {"ok":true}
urlTransportAllowed("http://127.evil.com/x")       = {"ok":true}
# contraste (corrects) : localhost.evil.com -> insecure_url ; 127.0.0.1@evil.com -> insecure_url (hostname=evil.com) ; [::1] -> ok
```
`127.0.0.1.evil.com` résout via DNS vers une IP arbitraire ; le probe irait la contacter en clair.
**Correction demandée** : revenir à l'ensemble du plan, ou restreindre à un littéral IPv4 127/8 réel (p.ex.
`/^127(\.\d{1,3}){3}$/` + validation des octets). **Test attendu** : ajouter à `probe_refuses_http_off_loopback`
`http://127.0.0.1.evil.com` et `http://127.evil.com` ⇒ `insecure_url` ; retirer/corriger l'assertion `127.0.0.53` ;
mutant (regex relâchée `/^127\./`) ⇒ rouge. **error_origin = worker** (code original du probe, élargissement non déclaré ;
`rpc.ts` n'a aucune garde équivalente — pas un héritage).

### C-G2-2 — Mutants de fuseau (heure-locale / date-locale) ÉQUIVALENTS sur le CI UTC — **MINEUR** (majorable ; orchestrateur adjuge)
Le code est UTC-strict (`getUTCHours/Minutes`, `toISOString`) — **CORRECT**. Mais le test C-4 ne fixe **aucun `TZ`** ; les
cas 09:45Z/23:30Z ne tuent les mutants heure/date-locale que si l'hôte n'est **pas** UTC. Cet hôte est UTC+1
(`getTimezoneOffset=-60`) → M4/M10 tués ici. Or le CI tourne sur **`ubuntu-latest`** (`.github/workflows/ci.yml:23,35,77,91,104`)
= **UTC** (offset 0), où `getHours===getUTCHours` et date-locale===date-UTC : les deux mutants deviennent **équivalents**
et le test reste **VERT**. Une régression future `getUTC*→get*` (le mode d'échec que C-4, correction BLOQUANTE, devait
couvrir) passerait le gate CI sans alerte.

Preuve — mesurée, pas inférée (mutant appliqué, rejoué sous `TZ=UTC`, restauré) :
```
this host: getTimezoneOffset=-60   |   TZ=UTC node -> getTimezoneOffset=0
M4 heure-locale  sous TZ=UTC : tests 1 pass 1 fail 0 exit 0  => SURVIVED   (tué seulement hors-UTC)
M10 date-locale  sous TZ=UTC : tests 1 pass 1 fail 0 exit 0  => SURVIVED   (tué seulement hors-UTC)
# les mêmes mutants, sur cet hôte UTC+1 : RED (fail=1) — cf. tableau des mutants
```
Nuance de sévérité (assumée) : le critère « mutant rouge » de C-4 ne nomme aucun environnement, et la mutation-testing
est une activité DEV dans ce repo — d'où **mineur**. Majorable si l'orchestrateur pondère la durabilité de la garantie
sur le seul environnement qui gate les fusions (le CI). **Correction demandée** : figer un fuseau non-UTC déterministe
pour les enfants spawnés du test C-4 (p.ex. `env: { ...process.env, TZ: "Etc/GMT-1", ...env }` dans `runProbe`/
`runProbeAsync`), pour que M4 **et** M10 rougissent sur N'IMPORTE quel hôte, CI compris. **error_origin = worker** (code
correct ; test non hermétique au fuseau — R-21 « écrit pour être re-vérifié » non tenu sur l'environnement de gate).

### C-G2-3 — `--now` non parsable ⇒ « probe FATAL » SANS écrire `narabi.json` (viole le contrat « toujours écrit ») — **MINEUR**
Contrat déclaré (`:9-10`, `:243-244`) : « the probe ALWAYS writes narabi.json before it exits ». Un `--now` invalide fait
lever `evaluate` (`:213`), et le **bloc catch** de `probe` (`:273-279`) re-dérive `checked_at`/`publish_latency` depuis le
**même** `nowIso` invalide → nouvelle `RangeError` **dans le catch** → elle échappe à `probe()`, `writeFileSync` (`:282`)
n'est jamais atteint → `narabi.json` **NON écrit**.

Preuve (CLI sur la copie) :
```
$ node scripts/probe-narabi.mjs --file <2 lignes> --now "not-a-date" --out X.json
exit=1 ; X.json NOT WRITTEN
stderr: probe FATAL RangeError: Invalid time value  at probe (…/probe-narabi.mjs:275:64)
```
Portée : `--now` n'est pas un chemin de production (le timer appelle sans `--now` → `new Date()` toujours valide) ; mais
l'invariant est énoncé **sans condition**, et la machine à états -1b-ii LIRA `narabi.json` — son absence est un état non
prévu. **Correction demandée** : valider/normaliser `nowIso` en tête de `probe` (rejet propre → `probe_error` écrit), OU
dériver le catch d'un `checked_at` sûr, OU écrire dans un `finally`. **Test attendu** : `--now` poubelle ⇒ `narabi.json`
écrit, `reason:"probe_error"`, exit 1, jamais « FATAL ». **error_origin = worker.**

### C-G2-4 — Redirections HTTP suivies inconditionnellement (garde appliquée seulement à l'URL initiale) — **MINEUR**
`fetchTimeline` (`:185`) appelle `fetch(url, {...})` **sans** `redirect:"manual"` ⇒ défaut `follow` (≤ 20 sauts).
`urlTransportAllowed` ne s'applique qu'à l'URL **initiale**, avant paquet ; une 3xx renvoyée par la surface est suivie
vers **n'importe quel hôte**, y compris `http://` hors loopback — la propriété « never leak plaintext off-box » tombe
sous compromission/mauvaise conf de l'amont.

Preuve (deux serveurs loopback, spawn ASYNC — un `spawnSync` gèle la boucle et fausse le test, cf. note de méthode) :
```
Serveur A (302 -> http://127.0.0.1:<portB>) ; probe pointé sur A :
A(302->B): status=healthy reachable=true reason=null exit=0 | serverB_was_hit=true
=> redirection vers un couple hôte:port DIFFÉRENT SUIVIE, garde non ré-appliquée
```
**Correction demandée** : `redirect:"manual"` (ou `"error"`) et traiter une 3xx comme `unreachable`, OU ré-valider l'URL
finale. **Test/mutant attendu** : A 302→hôte non-loopback ⇒ refus/`unreachable`, `serverB_was_hit=false` ; mutant
(redirect par défaut) ⇒ rouge. **error_origin = worker.**

### C-G2-5 — `DEADLINE` = DEUX constantes désynchronisables ; `publish_latency` sans aucun oracle — **MINEUR**
`DEADLINE_UTC = "10:30"` (`:36`, utilisée par `publishLatencySec`) et `DEADLINE_UTC_MINUTES = 630` (`:37`, utilisée par
`expectedLastDay`) sont **indépendantes**. Le PLI (déviation #4) et l'item « DEADLINE paramétrée » affirment « une
constante … une seule édition » — inexact. Aucun test ne lie les deux formes, et **`publish_latency` n'est asserté par
AUCUN test** (grep 0 hit sous `test/`).

Preuve (mutation chaîne-seule + suite complète) :
```
mutate DEADLINE_UTC "10:30"->"11:30" (minutes inchangées) ; full suite: tests 9 pass 9 fail 0  => SURVIVED
grep publish_latency test/ apps/sentinel/test/  => (aucune assertion)
```
Risque concret : la re-calibration de `DEADLINE` (l'item ouvert « durée d'un run publiant ») qui édite une forme mais pas
l'autre désynchronise silencieusement `expectedLastDay` (santé) de `publish_latency` (le fait qui sert à calibrer).
**Correction demandée** : source unique (dériver les minutes en parsant la chaîne, ou l'inverse) et/ou asserter
`publish_latency`. **Test attendu** : un cas `--now` pinne `publish_latency` ; mutant désync chaîne/minutes ⇒ rouge.
**error_origin = worker** (le plan L-1(b) demandait UNE constante DEADLINE).

### C-G2-6 — Écriture de `narabi.json` non atomique — **OBSERVATION** (déclencheur -1b-ii)
`writeFileSync(out, …)` (`:282`) n'est pas atomique ; un crash en cours d'écriture laisse un `narabi.json` partiel. Bénin
en -1b-i (écrit-seulement, aucun lecteur), mais la **machine à états -1b-ii LIRA** ce fichier → une écriture déchirée
corromprait l'état. **Recommandation** : écrire dans un temporaire + `rename` (atomique) avant que -1b-ii n'en fasse un
lecteur. **error_origin = plan** (concern -1b-ii) — item formé, déclencheur -1b-ii.

### C-G2-7 — Cohérence `TimeoutStartSec ≥ pire-cas` non tenue si l'env surcharge le transport — **OBSERVATION**
Le test `probe_timer_multiple_shots` vérifie `TimeoutStartSec (90) ≥ DEFAULT_TIMEOUT_MS×(DEFAULT_RETRIES+1)=24 s` — mais
seulement pour les **défauts**. `PROBE_TIMEOUT_MS`/`PROBE_RETRIES` sont surchargeables par env (`numEnv`, sans plafond
haut). Un `/etc/monark/probe.env` posant p.ex. `PROBE_TIMEOUT_MS=60000 PROBE_RETRIES=5` donne un pire-cas 360 s > 90 s :
systemd tue le job au milieu du GET → `narabi.json` non écrit. En -1b-i l'`EnvironmentFile` ne porte que `PROBE_URL`
(plan), donc surface faible. **Recommandation** : borner ces env dans le code, ou documenter que TimeoutStartSec doit
suivre toute surcharge. **error_origin = worker/plan** (observation, hors mandat strict -1b-i).

### C-G2-8 — Chemin `--file` non borné en taille — **OBSERVATION**
`PROBE_MAX_BYTES` ne borne que le GET ; `--file` fait un `readFileSync` complet (testé : 20 Mo lus puis parse échoue ⇒
`probe_error`, jamais de crash). `--file` est opérateur/test seulement (surface nulle). Optionnel : borner aussi `--file`.

---

## MUTANTS REJOUÉS (16 tués + 2 contrôles négatifs ; remplacement unique asserté, restauré sha-exact après CHACUN)
Harnais : `/f/tmp/mutate.mjs` (assert occurrence unique) ; rejeu `node --test --test-reporter=tap
--test-name-pattern=<killer>` ; restauration depuis `/f/tmp/g2-pristine/` ; sha256 re-vérifié == baseline PLI après
chaque mutant. Le contrôle no-op (SURVIVED) prouve que le harnais **discrimine** (il n'étiquette pas tout « RED »).

| # | Mutation | Fichier:cible | Test tueur | Verdict (harnais corrigé) |
|---|---|---|---|---|
| P1 | `day`↔`from_block` (perm. 31 champs) | probe.mjs:86 | probe_hashed_fields_order_equals_sentinel | RED (tests1 fail1) |
| P2 | `digest_T`↔`E_static` (perm.) | probe.mjs:89 | idem | RED (tests1 fail1) |
| P3 | `drift_flag`↔`prev_line_hash` (perm.) | probe.mjs:89 | idem | RED (tests1 fail1) |
| M4 | `getUTC{Hours,Minutes}`→`get{Hours,Minutes}` (heure-locale) | probe.mjs:117 | probe_narabi_detects_lag (09:45Z) | RED ici ; **SURVIVED sous TZ=UTC** (C-G2-2) |
| M5 | `DEADLINE_UTC_MINUTES` 630→629 | probe.mjs:37 | probe_narabi_detects_lag (10:29Z) | RED (tests1 fail1) |
| M6 | `.some(providerOf∈…)`→`endpoints[8]` positionnel | probe.mjs:68 | probe_provider_of_matches_sentinel | RED (tests1 fail1) |
| M7 | chaîne = dernière ligne seule | probe.mjs:140 | probe_recomputes_full_chain | RED (tests1 fail1) |
| M8 | `http://` hors loopback accepté | probe.mjs:163 | probe_refuses_http_off_loopback | RED (tests1 fail1) |
| M9 | timeout neutralisé (`ctl.abort` retiré) | probe.mjs:183 | probe_get_over_loopback_http_executes | RED (cancelled=1, exit1 — pendaison bornée par --test-timeout) |
| M10 | date-locale (`todayUTC` en heure locale) | probe.mjs:116 | probe_narabi_detects_lag (23:30Z) | RED ici ; **SURVIVED sous TZ=UTC** (C-G2-2) |
| M12 | corps non borné (`received>maxBytes`→`>Infinity`) | probe.mjs:195 | probe_get_over_loopback_http_executes (oversize) | RED (tests1 fail1) |
| M13 | n'écrit `narabi.json` que si healthy | probe.mjs:282 | probe_refuses_http_off_loopback (existsSync) | RED (tests1 fail1) |
| M14 | `OnCalendar` 10:30→09:45 (timer) | monark-probe.timer:17 | probe_timer_oncalendar_ge_deadline | RED (tests1 fail1) |
| N1 (neuf) | `lag_days<=0`→`<0` (borne lag=0) | probe.mjs:236 | probe_narabi_detects_lag (10:35Z/09-20) | RED (tests1 fail1) |
| N2 (neuf) | après-échéance `-1`→`-2` (jour attendu) | probe.mjs:118 | probe_narabi_detects_lag (10:35Z/09-21) | RED (tests1 fail1) |
| N3 (neuf) | `.some`→`.every` (chainstackPresent) | probe.mjs:68 | probe_provider_of_matches_sentinel | RED (tests1 fail1) |
| CTRL-1 | commentaire `// 630`→`// 630 (noop)` | probe.mjs:37 | probe_narabi_detects_lag | **SURVIVED** (fail0 — valide le harnais) |
| CTRL-2 | `DEADLINE_UTC "10:30"→"11:30"` (chaîne seule) | probe.mjs:36 | suite complète | **SURVIVED** (voir C-G2-5) |

Note de méthode (piège mesuré) : un `spawnSync` qui recontacte un serveur `node:http` **du même processus** gèle la
boucle d'événements et interbloque — la garde de l'implémenteur (`runProbeAsync`, test:53-62) est justifiée ; mon premier
test de redirection l'a reproduit avant que je bascule en `spawn` async.

## CE QUI EST VÉRIFIÉ SAIN (revue adversariale, pas complaisante)
- **C-1 (fidélité 31 champs)** : les littéraux `hashedFieldsOf` (probe:85-90) et `hashedFields` (timeline.ts:95-100) sont
  **textuellement identiques** (31 champs, comparaison normalisée) ; la ligne synthétique du test a 31 valeurs 2-à-2
  distinctes (`Set.size===31` asserté) + `deepEqual` ordonné ⇒ **toute** permutation de 2 champs rougit (P1/P2/P3
  confirmés, hors des 2 mutants nommés) ; 2ᵉ oracle = les 3 lignes committées recomputent leur `line_hash` publié
  (== `timeline.ts lineHashOf`) — byte-fidélité prouvée sur données réelles.
- **C-12/proxy chainstack** : `providerOf` dupliqué **textuellement identique** au cœur de `rpc.ts:28-36`
  (`host.split(".").slice(-2).join(".")`) ⇒ accord sur toute entrée par construction (sous-domaines, `p2pify.com`,
  IP, port, majuscules) ; non positionnel (M6 et N3 tués).
- **C-5 (CA-11 durci)** : le test fait bien tourner le **producteur réel `run.ts`** en sous-processus (stub `fetch`
  method-aware, keyless) et passe SA sortie au probe ⇒ `chainstack_present=true` (9 endpoints)/`false` (8) ; `no-secret` vert.
- **Entrée hostile** (empty / lignes vides / tronqué / BOM / 20 Mo / `null` / nombre / `regime` manquant / `endpoints`
  non-tableau) : `narabi.json` **toujours écrit**, `reason:"probe_error"` (ou healthy sain pour `endpoints` non-tableau —
  hors hash), exit cohérent, **zéro crash FATAL**.
- **Transport** : timeout borné (M9), corps borné (M12), réessai borné, `http` hors loopback refusé AVANT tout paquet
  (M8 ; hôte `.invalid` ⇒ zéro paquet) ; `localhost.evil.com` et le tour userinfo `127.0.0.1@evil.com` correctement refusés.
- **Gril d'échéance** : UTC-strict, arithmétique de bord correcte (2027-01-01→2026-12-31 ; 2026-03-01→2026-02-28) ;
  10:29/10:30 épinglés ; `lag_days<0` matinal = healthy ; reboot avant 10:30 = healthy (00:15Z).
- **systemd** : durci (`User=probe`, `NoNewPrivileges`, `ProtectSystem=strict`, `ReadWritePaths=/var/lib/monark-probe`,
  `PrivateTmp`, caps CPU/Mem/Tasks) ; `User=probe` provisionné au plan de déploiement (`useradd --system probe`) ;
  `TimeoutStartSec=90` ≥ pire-cas code (défauts, 24 s ; cf. C-G2-7) ; `OnCalendar` 10:30/12:30/16:30 ≥ DEADLINE (3 tirs,
  `Persistent=true` rendu sûr par le gril logique).
- **L-4** : `sentinel-retry` 4/4, `after()`+`rmSync` ⇒ **0 répertoire `narabi-retry-*` neuf** (delta 0) ; mon propre suite
  probe laisse 0 `narabi-probe-*`.
- **Hygiène vocab (point #7) — PROUVÉ, pas asserté** : le `.mjs` EST scanné. Plant `adaptive coverage` (SENTINEL_EXTRA)
  ⇒ `gate:vocab FAILED` à `scripts/probe-narabi.mjs:21`, exit 1 ; plant `would have alerted` (GLOBAL/ADR-U1) ⇒ FAILED à
  `scripts/probe-narabi.mjs:22`, exit 1 (mécanique `grep-forbidden.mjs:209-216`, `[...GLOBAL, ...SENTINEL_EXTRA]` sur
  `sentinel.files`). Restaurés sha-exact. Aucun secret/URL-à-clé ; `no-secret-in-repo` 1/1.
- **Branchement / registre** : rien déclaré « built », tuyaux `upcoming`, `fleet.ts` absent du diff, aucun registre
  public touché (diff = scripts/, test/, deploy/, vocab-banned.json, sentinel-retry.test.ts).

## R-25 (mesuré par moi, pathspec `STAT=` de `.github/workflows/ci.yml:65`, `298aa5c..7bc0535`)
`git diff --shortstat` avec les excludes = **7 fichiers, 789 insertions, 4 suppressions = 793 lignes** ⇒ **≤ 1205**
(plafond `ci.yml:43`), dans la bande checkpoint 562–893. Répartition : probe.test.ts 338 · probe.mjs 307 · probe.d.mts
63 · service 40 · timer 26 · sentinel-retry +13/−2 · vocab +2/−2. `docs/**/*.md` exclus. **Conforme.**

## ORACLES REJOUÉS (copie, un à un ; PAS de `npm run ci` complet)
typecheck `tsc --noEmit` **0** · eslint (`test/probe-narabi.test.ts` + `sentinel-retry.test.ts`) **0** · `gate:vocab` OK
(178 fichiers) · `export:check` OK · `lang:gate` OK · `lint:ratchet` **69/69** · `no-secret-in-repo` **1/1** · `ci-gates`
**27/27** (dont `vocab_sentinel_scope_scans_src_test_deploy`) · `probe-narabi.test.ts` **9/9** · `sentinel-retry.test.ts` **4/4**.

## MODES MAST OBSERVÉS (checklist de risque résiduel)
- **FM-3.2 / FM-3.3 (vérification incomplète / incorrecte)** — mode DOMINANT : des oracles verts alors qu'une propriété
  qu'ils prétendent garder est **contournable** (C-G2-1, `127.*`), **non vérifiée sur l'environnement de gate** (C-G2-2,
  fuseau sur CI UTC — tracé), ou **sans oracle** (C-G2-5, `publish_latency`).
- **FM-1.1 (écart à la spécification)** — secondaire : ensemble loopback élargi hors du `{127.0.0.1,::1,localhost}` du
  plan (C-G2-1) ; « une constante DEADLINE / une édition » non tenu (C-G2-5) ; contrat « toujours écrit » violé sur
  `--now` invalide (C-G2-3).

## error_origin (récapitulatif)
C-G2-1 worker · C-G2-2 worker · C-G2-3 worker · C-G2-4 worker · C-G2-5 worker · C-G2-6 plan (concern -1b-ii) ·
C-G2-7 worker/plan · C-G2-8 worker.

## PROVENANCE
Réviseur `claude-opus-4-8[1m]` effort max, 2026-09-20. Copie `F:\tmp\g2-narabi1b\` (archive `7bc0535`, `npm ci` exit 0).
Baselines sha256 confirmées == PLI et re-vérifiées après restauration de TOUS les mutants : probe.mjs
`ed83ea4ed625ccba819b8d8b22c85cf47cd2fe19485c3dd5ecc768109ae98a29`, timer
`39335a1e1621733fc9b67020029bf504c6857f2738d18989e5d761e42bece3ee`, service
`a3d9885836fe986dfb1b5905df7a902b612b969c711607eb11a56f49bcb5b295`. Aucune action sortante ; loopback seulement ;
worktree non modifié (rejeux sur copie).
