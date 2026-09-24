# G2 — sous-lot NARABI-OPS-1b-ii-b (durcissement DÉTECTION + borne de démarrage du sentinel)

**Relecteur G2 : instance séparée à contexte frais (n'a PAS écrit ce code).**
**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, effort max. L'orchestrateur
vérifie ce préfixe avant de consommer cette sortie comme preuve.
R-20 : aucun commit, aucun workflow, aucune action sortante (tout loopback / `.invalid` ; tests sous
`env -u SMTP_HOST -u SMTP_PORT -u SMTP_USER -u SMTP_PASS -u SMTP_TLS -u ALERT_TO -u ALERT_FROM -u PROBE_STATE_URL`).
R-21 : chaque affirmation porte sa preuve `fichier:ligne` (ouverte first-hand) ou sa mesure reproductible.
Worktree `F:\Monark-wt-narabi1b2b`, branche `lot/narabi-ops-1b-ii-b`, base `57e9cbc`, HEAD `b83809d`. Horloge
`date -u` = `2026-09-21T02:11Z` (début de session).

Scratch : `F:\tmp\narabi1b2b\g2\` (backups pristines + `mergetree.txt` + `test-full.log`). Rien sur C:.

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le code de -b est **correct et branché à un test d'intégration non-LLM** qui rejoue la vraie sonde en
sous-processus depuis la capture réelle (`NARABI_SNAPSHOT`) servie en loopback. Les 8 oracles passent, les 8
mutants du worker sont ROUGES, R-25 = 392 ≤ 1205, les 7 sha256 correspondent au PLI §7. **Aucun défaut bloquant
pour le G7 de -b en isolation.** Les corrections ci-dessous sont soit des items de **fusion** (à faire par
l'orchestrateur à la 2ᵉ fusion — déjà formés, sauf l'assertion pire-cas), soit une **complétion de doc requise
avant le déploiement E-5** (le mode de panne du rattrapage), soit des précisions non bloquantes.

**Le point le plus important (item 4 de la mission) est traité pour UNE des deux voies de kill, PAS pour
l'autre** — voir C-G2-1.

---

## Défauts C-G2-n

### C-G2-1 — RUNBOOK : le **livelock de rattrapage** n'est pas documenté (le 2ᵉ mode « run lent → panne permanente »)
- **Fichier:ligne** : `docs/RUNBOOK-sentinel.md` §6, sous-section « Start backstop `TimeoutStartSec` » (le bloc
  ajouté couvre UNIQUEMENT le kill mid-append / ligne tronquée) ; mécanisme dans `apps/sentinel/src/run.ts:166-168`
  puis `:182-188`.
- **Scénario (mesuré sur le code + offline)** : `run.ts:168` `runDue(...)` traite **TOUS** les jours dus (`:167`
  `dueDays`) dans la phase RPC lourde ET n'écrit qu'**APRÈS** la boucle, en UN bloc (`:182` `if
  (report.lines.length > 0)` puis `:188` append — **aucun checkpoint incrémental par jour**). Un kill
  `TimeoutStartSec=300` **pendant `runDue`** (backlog multi-jours) n'écrit RIEN (pas de ligne tronquée — mode
  DISTINCT du torn-line documenté), laisse `timeline.jsonl` intact ⇒ **la liste due est IDENTIQUE au run suivant**
  ⇒ re-killée au même point ⇒ **aucune publication tant que le rattrapage dépasse T_s=300 s** (les 4 créneaux +
  `Persistent` au boot ré-essaient tous le même rattrapage voué à l'échec ; pas de `Restart=`). **Ce mode est
  plus probable que le torn-line** (il ne requiert pas un kill au ~ms de l'append, juste un run entier > 300 s).
  Détectée (surface gelée ⇒ `lag` ⇒ mail avec -a), mais **aucune procédure de réparation** au RUNBOOK.
- **Coût par run = `loadState(N_total)` + `runDue(N_due)` — MESURÉ où mon 1ᵉʳ jet devinait.** `loadState`
  (`:104-120`) rejoue chaque ligne (`attest`+`step`, où `step` appelle `trackerDigest` sur TOUS les scores ⇒ a
  priori O(N²)). **Mesuré offline** : `trackerDigest` ≈ 0,02–0,06 ms/appel (quasi plat) ⇒ le repli O(N²) de
  `loadState` = **2,9 ms à N=365 lignes** ⇒ **NÉGLIGEABLE** ; `loadState` **n'est PAS** le goulot et il n'y a
  **pas** d'horizon-de-vie dû à la croissance du timeline (l'inquiétude O(N²) ne se matérialise pas). Le coût est
  donc **borné par le RPC** de `runDue` : ~ `N_due` jours × coût-RPC/jour. **D = 25,481 s** (JOURNAL:310) est le
  wall-clock d'un run à **~4 lignes** de timeline (T=3 à la mesure ; snapshot = 2 lignes/T=1) traitant **1** jour
  dû ⇒ D ≈ démarrage-fixe + 1 jour-RPC. **Ordre de grandeur** : un rattrapage d'**~12 jours** (12 × ~25 s ≈ 300 s,
  modèle LINÉAIRE ; le coût-RPC/jour exact n'est pas mesurable offline — pas de réseau) risque de dépasser T_s. Le
  seuil est donc de l'**ordre de la dizaine de jours d'indisponibilité**, pas « jamais ».
- **Correction minimale** : ajouter au RUNBOOK §6 la reprise d'un `sentinel FATAL`/timeout **persistant qui n'est
  PAS une ligne tronquée** : soit un drop-in temporaire relevant `TimeoutStartSec` (`systemctl edit
  monark-sentinel.service`) le temps du rattrapage, soit un rattrapage **un jour à la fois** par `--day
  <prevDay+1>` (permis par `run.ts:165` : un `--day` non-`--dry-run` doit être le jour suivant exact). Déclarer
  que la formule `T_s = max(300, ⌈3D/60⌉·60)` a été **pré-enregistrée sur un D à 1 jour dû**, pas sur le
  rattrapage. (Item ADR optionnel : re-mesurer D si un long backlog est prévu ; borne par RPC, pas par CPU.)
- **error_origin (proposé au G7)** : couverture/docs = **worker** (mode de panne omis dans la documentation du
  risque de la borne qu'il introduit).
- **Bloquant ?** : **NON pour le G7 code de -b** (`run.ts` inchangé, correct ; la borne est le livrable). **OUI
  avant le déploiement E-5** (le RUNBOOK est la procédure de déploiement acceptée par l'investisseur, décision
  92) — la mission exige qu'« une borne qui peut transformer un run lent en panne permanente [soit] documentée
  et alertée » : elle est alertée (via `lag`) mais **pas documentée pour ce mode**. À corriger dans -b (fichier
  `.md` de -b) de préférence, pas à reporter.

### C-G2-2 — RUNBOOK : « self-heals on the next successful run » surdéclaré ; « the next run » sous-déclare la permanence
- **Fichier:ligne** : `docs/RUNBOOK-sentinel.md` §6, sous-section « Start backstop » (paragraphe « A torn last
  line fails CLOSED »).
- **Scénario** : (a) « state.json … self-heals on the next successful run » — `run.ts:182` garde les copies par
  `if (report.lines.length > 0)`, donc `public/state.json` ne se rafraîchit QUE sur un run qui **ÉCRIT une
  ligne**, pas un run exit-0 « nothing due ». (b) « the next run appends NOTHING after a torn line » sous-déclare
  la **permanence** : `loadState` (`run.ts:104-120`) relit TOUT `timeline.jsonl` et `JSON.parse` chaque ligne
  (`:111`) sans try/catch ⇒ la ligne tronquée fait lever `JSON.parse` ⇒ FATAL (`:201`) à **CHAQUE** run suivant
  jusqu'à retrait manuel, pas seulement « the next run ».
- **Correction minimale** : « self-heals on the next run **that writes a line** » ; « **every subsequent run**
  FATALs in `loadState` (`run.ts:111`) on the torn line **until it is removed** ».
- **error_origin** : docs = worker. **Bloquant ?** : **NON** (précision).

### C-G2-3 — Assertion pire-cas post-fusion : ni -a ni -b ne pinne le vrai pire-cas GET₁+GET₂+SMTP+marge
- **Fichier:ligne** : `test/probe-narabi-state.test.ts:252-263` (`probe_state_get_rss_and_worstcase_bounds`,
  worst = GET₁+GET₂+marge = **70 s**, SANS SMTP) ; côté -a, `test/probe-narabi.test.ts` `probe_timer_multiple_shots`
  (`9fd3736:...:432`, worst = GET₁+SMTP+marge = **90 s**, SANS GET₂).
- **Recalcul (mesuré sur `9fd3736`)** : -a fixe `monark-probe.service TimeoutStartSec=120` ;
  `MAX_SMTP_DEADLINE_MS=30_000`. Vrai pire-cas COMBINÉ = GET₁ (10 s × 5 = 50) + GET₂ (5 s × 2 = 10) + SMTP (30) +
  marge (10) = **100 s**. **120 > 100 ⇒ l'unité à 120 (choisie par -a) couvre DÉJÀ le cas combiné : AUCUNE
  rehausse n'est nécessaire à la 2ᵉ fusion.** (Le PLI item 5.2 « rehausse SMTP » est donc **sans objet pour le
  budget** — le GET₂ tient sous les 20 s de marge de -a.) **Mais** post-fusion, `probe_timer_multiple_shots`
  vérifie 120 > 90 (sans GET₂) et `probe_state_get_rss_and_worstcase_bounds` vérifie 120 > 70 (sans SMTP) : **NUL
  test ne pinne 120 > 100**. Une future hausse de `MAX_SMTP_DEADLINE_MS` (p.ex. 50 s ⇒ vrai pire-cas 120 s, à la
  limite) passerait les DEUX tests sans détecter la brèche.
- **Correction minimale** : à la 2ᵉ fusion, **étendre UNE** des deux assertions à
  `TimeoutStartSec > GET₁+GET₂+SMTP+marge` (= `MAX_TIMEOUT_MS·(MAX_RETRIES+1) + STATE_TIMEOUT_MS·(STATE_RETRIES+1)
  + MAX_SMTP_DEADLINE_MS + START_MARGIN_MS`). **Reformuler l'item formé 5.2** : ce n'est pas « rehausser T_s »
  (inutile, 120 > 100) mais « étendre l'assertion pire-cas ».
- **error_origin** : couverture = worker + -a (aucun test n'enjambe les deux transports). **Bloquant ?** : **NON
  pour -b en isolation** (SMTP inexistant en -b) ; **REQUIS à la 2ᵉ fusion** (item formé, à corriger).

### C-G2-4 — Trou de scope `gate:vocab` : le fichier de test NEUF n'est scanné par aucun scope (CONFIRMÉ)
- **Fichier:ligne** : `test/probe-narabi-state.test.ts` (neuf) ; `vocab-banned.json:107-121` (scope `sentinel`) ;
  `scripts/grep-forbidden.mjs`.
- **Scénario (CONFIRMÉ par analyse statique, sans éditer le worktree)** : `grep-forbidden.mjs` ne walk que
  `packages/*/src`, `apps/site`, `apps/harness/src`, `skills/`, `apps/bell/src`, et les scopes par listes
  explicites ; le scope `sentinel` walk `apps/sentinel/{src,test}` (PAS le `test/` racine) et son `files[]` liste
  `test/probe-narabi.test.ts` mais **PAS `test/probe-narabi-state.test.ts`** (vérifié :
  `sentinel.files.includes("test/probe-narabi-state.test.ts") === false`). ⇒ Le fichier neuf n'est dans **aucune
  cible** ; une phrase interdite y resterait verte (le worker l'a mesuré empiriquement avec `everlasting`).
- **Correction minimale** : à la fusion, l'orchestrateur **ajoute `test/probe-narabi-state.test.ts` à
  `sentinel.files[]`** et rejoue `gate:vocab` avec une phrase interdite injectée (preuve de couverture) — même
  mécanique que le sidecar et l'union ci-site↔-1b-i.
- **error_origin** : contrainte de scope acceptée (G0 interdit à -b d'éditer `vocab-banned.json`, zone de conflit
  ci-site) — **item formé** (PLI §5.1, propriétaire orchestrateur, déclencheur = fusion de -b), pas un défaut du
  code. **Bloquant ?** : **NON pour le G7 isolé de -b** ; **le G7 du LOT COMBINÉ ne doit pas clore sans cet
  ajout + la preuve de couverture.**

### C-G2-5 — Provenance `RUN_DURATION_D_SEC` ancrée par NUMÉRO de ligne (fragile au dérive du JOURNAL)
- **Fichier:ligne** : `test/probe-narabi-state.test.ts:30-37`.
- **Scénario** : `RUN_DURATION_D_SEC = 26` est **codé en dur** ; la provenance est un **COMMENTAIRE** (sha256 de
  `JOURNAL-PROVENANCE.md:310` = `2d3158b2…`, avec commande node de reproduction). Le test **ne lit PAS** le JOURNAL
  au runtime ⇒ **l'ajout de lignes au JOURNAL ne casse PAS le test** (robuste — j'ai relancé la suite, verte). La
  seule fragilité est que le **commentaire** de provenance pointe une ligne par son **numéro** (index 309) : une
  insertion AVANT la ligne 310 ferait pointer le sha vers la mauvaise ligne (dérive silencieuse du commentaire,
  pas du test). **VÉRIFIÉ reproductible ce jour** : `sha256(split("\n")[309]) = 2d3158b2865e640c…` == le
  commentaire ; ligne 310 = « G7 lot NARABI-OPS-1b-i ACCEPTÉ, fusion `9b178f3` … mesure D = 25,481 s ».
- **Correction minimale (forme la moins fragile)** : ancrer la provenance sur le **CONTENU** (citer une
  sous-chaîne stable, p.ex. « mesure D = 25,481 s (run publiant 00:47:55→00:48:20 UTC) », JOURNAL:310) plutôt
  que sur un numéro de ligne. Non bloquant.
- **error_origin** : docs/couverture = worker. **Bloquant ?** : **NON**.

### Résiduels et comportements ACCEPTÉS (non-défauts, consignés pour l'orchestrateur, R-21)
- **C-NB-4 (course GET₁/GET₂) — résiduel ACCEPTABLE.** Fenêtre servie d'incohérence : (i) côté serveur, entre
  `run.ts:190` (copie timeline publique fraîche) et `:191` (copie state publique encore périmée) = deux
  `copyFileSync` consécutifs (~ms) ; (ii) côté sonde, si une publication atterrit entre GET₁ (timeline) et GET₂
  (state) = latence réseau Bell→SITE (dizaines de ms). Un faux `state_mismatch` transitoire ⇒ `unhealthy` ⇒ **UN
  mail** (décision 88 : oui) qui **s'auto-guérit au tir suivant**. **Argument quantitatif** : les runs sentinel
  finissent au plus tard à **10:05 UTC** (09:30 + 1800 s jitter + 300 s T_s) ; la sonde tire à **10:30 / 12:30 /
  16:30 UTC** ⇒ **zéro chevauchement programmé** ; seuls un run manuel ou un rattrapage `Persistent` peuvent
  courir. Résiduel dans l'enveloppe adjugée (validateur : « résiduel déclaré OU relecture unique » — le worker a
  choisi le résiduel) et borné par l'anti-tempête (≤ 1 mail/tir). **Relecture unique NON exigée** ; item de
  durcissement formé (PLI §5.3, déclencheur = premier faux `state_mismatch` observé).
- **`deriveStateUrl` — tous les cas limites fail-safe (MESURÉ).** `?query` et `#fragment` **conservés** (envoyés
  au GET state ; anodin) ; slash final ⇒ `…/narabi/state.json` ; sous-dossier ⇒ `…/sub/state.json` (siblings) ;
  `%2e%2e` ⇒ **WHATWG normalise le dot-segment ⇒ `/state.json` à la RACINE** (pas `/narabi/state.json`) — mais
  l'URL vient de `PROBE_URL` (opérateur), un mauvais chemin ⇒ 404 ⇒ `state_unreachable` ⇒ unhealthy ⇒ alerte
  (fail-safe, aucune fuite hors-hôte : même host/schéma). La garde de transport de -1b-i s'applique BIEN au 2ᵉ GET
  (`fetchTimeline` `:250` `urlTransportAllowed` + `:261` `redirect:"manual"` + bornes octets/timeout).
- **`digest:""` ⇒ `state_mismatch` (pas `state_unreachable`) — nuance ACCEPTÉE (MESURÉ).** Une chaîne vide passe
  le `typeof d === "string"` de `stateDigestOf` (`:304`) ⇒ `{ok:true, digest:""}` ⇒ comparé ⇒ diffère ⇒
  `state_mismatch`. Un digest **absent/non-chaîne** ⇒ `{ok:false}` ⇒ `state_unreachable`. Les deux sont unhealthy
  ⇒ les deux alertent ; la distinction (mismatch vs unreachable) est cosmétique. Acceptable.
- **`STATE_MAX_BYTES/STATE_TIMEOUT_MS/STATE_RETRIES` NON surchargeables (VÉRIFIÉ).** Passés en **constantes
  littérales** à `fetchTimeline` (`:412`), jamais lus depuis l'env pour le GET₂ ; `STATE_RETRIES=1` FIXE. Dans
  les plafonds : 64 KiB < `MAX_MAX_BYTES` 8 MiB ; 5 s < `MAX_TIMEOUT_MS` 10 s ; 1 < `MAX_RETRIES` 4.
- **`--state-file` borné et réservé à `--file` (VÉRIFIÉ).** `:406` `statSync().size > STATE_MAX_BYTES` ⇒
  `{ok:false}` ; consulté SEULEMENT sous `if (opts.file !== undefined)` (`:404`). En mode `--url`, `opts.stateFile`
  est ignoré silencieusement (dérivation URL utilisée) — mineur, non-défaut (test-only).
- **Tueur de réessai GET — tue les DEUX sens (VÉRIFIÉ).** `probe_get_retries_exactly_n_plus_one`
  (`test/probe-narabi-state.test.ts:186-221`) asserte le **nombre exact de hits** à `PROBE_RETRIES=0` (⇒ 1) ET
  `=2` (⇒ 3) : `attempt <= retries + 1` ⇒ un hit de trop ⇒ RED (mesuré M-ii-10) ; `attempt < retries` ⇒ un hit
  de moins (0 à retries=0, 2 à retries=2) ⇒ RED par l'assertion `hits() === retries + 1`. Port fermé ⇒
  `unreachable`, `reachable:false`, `hits===0`. **Tueur N4 de -1b-i INTACT après l'édition forcée** de
  `probe_get_over_loopback_http_executes` (`test/probe-narabi.test.ts:310-337`) : le `state.json` du GET₂ n'est
  PAS compté dans `okHits`, donc `okHits - beforeHits === 1` (`:337`) pinne toujours « exactement UN GET timeline
  à retries=0 » ; en prime, si `deriveStateUrl` casse, le GET₂ retombe dans la branche `okHits++` ⇒ compte à 2 ⇒
  rougit (couverture ajoutée).
- **CA-11 durci — SATISFAIT.** `probe_state_digest_cross_check` et `probe_state_unreachable_precedence` lancent
  la **VRAIE sonde en sous-processus** (`runProbeAsync`, `spawn(process.execPath, [PROBE_MJS, …])`) depuis la
  capture RÉELLE `NARABI_SNAPSHOT` (timeline + state) servie par **UN serveur loopback** sur les deux chemins,
  **dérivation par défaut** (aucun `PROBE_STATE_URL`), `env` EXPLICITE purgé des `SMTP_*`/`ALERT_*`/`PROBE_*`
  (`purgedEnv`, C-B-6). Rien « built » : l'ADR marque les tuyaux `state.json→cross-check` et
  `monark-sentinel TimeoutStartSec` en `upcoming`/`code + test ; wired at deploy` (E-5) ; le RUNBOOK §6 porte
  l'étape VPS site par **SHA de fusion nommé** + `systemctl show -p TimeoutStartUSec`.
- **Précédence FERMÉE — implémentée correctement (VÉRIFIÉ par appel direct `evaluate`)** :
  `cannot-evaluate > chain_broken > state_unreachable > state_mismatch > lag`. Paires **pinées par les tests** :
  `state_unreachable > lag`, `state_mismatch > lag`, `chain_broken > state_unreachable` (`:168`), et
  `undefined ⇒ lag` (l'échelle est state>lag, pas state-toujours). Paires **NON pinées par les tests mais
  vérifiées par mon appel direct** (rapport §Mesures) : `!reachable > state`, `probe_error > state`,
  `chain_broken > state_MISMATCH` (le test ne pinne que la variante `{ok:false}`).

---

## Carte des conflits avec -1b-ii-a (`lot/narabi-ops-1b-ii-a`, HEAD `9fd3736`)

**Essai de fusion en LECTURE** : `git merge-tree <base> 9fd3736 b83809d`, **SANS `--write-tree`** (sortie dans
`F:\tmp\narabi1b2b\g2\mergetree.txt`). **Merge-base réelle de -a et -b = `331c169`** (le HEAD -1b-i ; `57e9cbc`
n'est PAS ancêtre de -a). Les 5 fichiers narabi sont **identiques** à `331c169` et `57e9cbc`, donc la simulation
est fidèle. -a change **60+ fichiers** (bell, ci-site, t1a-*, docs) ; **intersection réelle avec -b = 5 fichiers**.

| Fichier | Conflit git ? | Résolution attendue |
|---|---|---|
| `scripts/probe-narabi.mjs` | **OUI (4 blocs)** | (1) **en-tête** : garder la note schema-2 de -a + la mention `state_mismatch`/`state_unreachable` de -b ; (2) **constantes** : UNION des blocs SMTP (-a) et STATE (-b) ; (3) **`base` d'`evaluate`** : garder le `base` de -a (champs alerte + `state_checked:false`) et **SUPPRIMER le `state_checked:false` en double de -b** (dédup) ; **signature** = celle de -b (`+ stateCheck`) ; corps = bloc cross-check de -b + `state_checked: sx.state_checked` dans les retours ; (4) **`parseArgs`** : `else if (t === "--state-file")` **AVANT** `else { throw }` (-a) — sinon `--state-file` lève « unknown flag » |
| `scripts/probe-narabi.d.mts` | **OUI (2 blocs)** | UNION des déclarations : `NarabiState` += `state_checked` (les DEUX l'ajoutent ⇒ dédup) + `alerted`/`alert_error`/`last_alert_day` (-a) ; `ProbeReason` += `state_mismatch`/`state_unreachable` (-b) ; `EvaluateInput.stateCheck?`, `StateCheck`, `ProbeOpts.stateFile`, `deriveStateUrl`, `STATE_*` (-b) ; surface SMTP (-a) |
| `test/probe-narabi.test.ts` | **NON (auto-merge propre)** | -b n'édite que `:310-318` (routage `okServer`), non contigu aux tests SMTP de -a ; git fusionne des hunks non contigus. **Vérifier** que le tueur N4 (`okHits-beforeHits===1`) reste vert après fusion (l'`okServer` sert désormais aussi `state.json`) |
| `docs/adr/ADR-NARABI-OPS-1.md` | **NON (auto-merge propre)** | -a édite la ligne `probe → alerte` (canal mail) + schema 2 ; -b ajoute 2 lignes de tuyau (`state.json→cross-check`, `monark-sentinel TimeoutStartSec`) + amendement daté ⇒ positions disjointes. **Revue sémantique** : pas de doublon de ligne de tuyau |
| `docs/RUNBOOK-sentinel.md` | **NON (auto-merge propre)** | -a ajoute des étapes de déploiement mail ; -b ajoute l'étape (8) + la sous-section « Start backstop ». **Revue sémantique requise** : vérifier qu'il n'y a pas deux étapes numérotées « (8) » ni de section dupliquée |

**Autre point de fusion (hors 5 fichiers)** : `vocab-banned.json` — -a l'édite (ci-site + bell) mais **pas -b** ;
l'ajout de `test/probe-narabi-state.test.ts` à `sentinel.files[]` (C-G2-4) est un item de fusion.

**Ordre de fusion conseillé** : **-a d'abord** (pose `SCHEMA=2`, `parseArgs` strict, la machine SMTP), **puis -b**
(le cross-check d'état par-dessus). Correct car la **déviation SCHEMA de -b** (laisse `SCHEMA=1`) est résolue par
l'atterrissage de `SCHEMA=2` de -a AVANT le `state_checked` de -b ⇒ forme schema-2 cohérente. À la fusion, vérifier
que la forme `narabi.json` déployée est bien `schema:2` (de -a) avec `state_checked` (de -b) proprement posé.

---

## Tableau des mutants

**Protocole** : chaque mutation appliquée sur une pristine restaurée, test joué, restauration **BYTE-EXACT** depuis
le backup (`F:\tmp\narabi1b2b\g2\bak\`), sha256 re-vérifié == pristine, **jamais `git checkout`**. Worktree final
**propre** (`git status` vide ; `probe-narabi.mjs 1001c1cd…`, `monark-sentinel.service d70f88cc…` == pristine ;
HEAD `b83809d` inchangé). Chiffres = `# pass`/`# fail` de la portée jouée.

### Les 8 mutants du worker — REJOUÉS, tous ROUGES (portée = `test/probe-narabi-state.test.ts`)

| Mutant | Mutation exacte | Fichier | Test qui rougit | Résultat |
|---|---|---|---|---|
| **M-ii-9** | branche `if (stateCheck.digest !== expectedDigestT) return state_mismatch` supprimée | `probe-narabi.mjs` | `probe_state_digest_cross_check` + `probe_state_unreachable_precedence` | **RED** (3/2) ✓ restauré |
| **M-ii-10** | `attempt <= retries` → `attempt <= retries + 1` (`fetchTimeline`) | `probe-narabi.mjs` | `probe_get_retries_exactly_n_plus_one` | **RED** (4/1) ✓ |
| **M-ii-13** | `TimeoutStartSec=300` → `3600` (> borne HAUTE) | `monark-sentinel.service` | `probe_sentinel_timeoutstartsec_inter_unit_coherence` | **RED** (4/1) ✓ |
| **M-ii-14** | `TimeoutStartSec=300` → `60` (< 3D, borne BASSE) | `monark-sentinel.service` | `probe_sentinel_timeoutstartsec_inter_unit_coherence` | **RED** (4/1) ✓ |
| **M-ii-22** | `if (sx.reason !== null)` → `… && dayDiff(last.day, expectedLastDay(nowIso)) <= 0` (lag masque l'état) | `probe-narabi.mjs` | `probe_state_unreachable_precedence` | **RED** (4/1) ✓ |
| **Mien#1** | `deriveStateUrl` basename `"state.json"` → `"timeline.jsonl"` | `probe-narabi.mjs` | `probe_state_digest_cross_check` | **RED** (4/1) ✓ |
| **Mien#2** | `STATE_MAX_BYTES = 64*1024` → `8*1024*1024` | `probe-narabi.mjs` | `probe_state_get_rss_and_worstcase_bounds` | **RED** (4/1) ✓ |
| **Mien#3** | borne `--state-file` (`statSync > STATE_MAX_BYTES`) retirée | `probe-narabi.mjs` | `probe_state_digest_cross_check` (e) | **RED** (4/1) ✓ |

### 4 mutants NOUVEAUX (adversariaux, ajoutés par le relecteur G2)

| Mutant | Mutation | Portée | Prédiction | Résultat | Constat |
|---|---|---|---|---|---|
| **N-G2-4** | `crossCheckVerdict` : `if (!stateCheck.ok)` → `if (stateCheck.ok)` (inversion) | state | CAUGHT | **RED** (3/2) ✓ | **Confirme les dents** de la suite sur le verdict d'état (le test distingue bien ok/pas-ok) |
| **N-G2-1** | `stateDigestOf` : `typeof d === "string"` → `d != null` (accepte un digest numérique) | **COMPLÈTE** | SURVIVE ? | **GREEN 509/0** — **SURVIT** | **Trou de couverture** : le type-guard n'est pas piné. Impact FAIBLE (digest numérique ⇒ même issue « alerte », juste `state_mismatch` au lieu de `state_unreachable`). *Killer minimal* : servir un `state.json` `{digest: 123}` ⇒ attendre `state_unreachable` |
| **N-G2-2** | `probe()` : `process.env.PROBE_STATE_URL ?? deriveStateUrl(url)` → `deriveStateUrl(url)` (override ignoré) | **COMPLÈTE** | SURVIVE ? | **GREEN 509/0** — **SURVIT** | **Trou de couverture** : le chemin d'override `PROBE_STATE_URL` est NON testé (C-B-12 n'exigeait QUE la dérivation par défaut, elle EST testée). C'est le **SEUL** endroit où le GET₂ pourrait viser un hôte que GET₁ n'a jamais validé (la dérivation par défaut hérite du host de GET₁) — mais l'URL vient de l'env **opérateur** et `fetchTimeline` re-passe par `urlTransportAllowed` (`:250`), donc **code correct**, pas un défaut. *Killer minimal* : `PROBE_STATE_URL` pointant un 2ᵉ serveur loopback distinct ⇒ asserter qu'il est honoré |
| **N-G2-3** | `probe()` : GET₂ appelé SANS `maxBytes: STATE_MAX_BYTES` (retombe sur l'octet-cap env, jusqu'à `MAX_MAX_BYTES` 8 MiB) | **COMPLÈTE** | SURVIVE ? | **GREEN 509/0** — **SURVIT** | **Trou de robustesse (le plus utile)** : `probe_state_get_rss_and_worstcase_bounds` pinne la **CONSTANTE** `STATE_MAX_BYTES` (via Mien#2) mais **PAS le LIAISON runtime** (que l'appel GET₂ passe bien cette constante). Un édit futur retirant `maxBytes` ⇒ GET₂ lit jusqu'à 8 MiB ⇒ RSS deux-corps ~13×(8 MiB+8 MiB)=208 MiB > `MemoryMax=128M` (risque OOM) — non attrapé. *Killer minimal* : serveur URL-mode renvoyant un `state.json` de `STATE_MAX_BYTES + 1` octets ⇒ attendre `state_unreachable` (via `too_large` ⇒ `{ok:false}`) |

**Synthèse mutants** : 8/8 du worker ROUGES ; 1/4 nouveau ROUGE (teeth) ; 3/4 nouveaux SURVIVENT (2 trous de
couverture à impact faible + 1 trou de robustesse `maxBytes`). Les 3 survivants ne sont **pas des défauts du
code** (le code est correct : il passe bien `STATE_MAX_BYTES`, le type-guard est correct, l'override marche) mais
des **lacunes de la suite de tests** : un édit futur régressif y échapperait. **Non bloquant** (le comportement
livré est correct) ; **N-G2-3 recommandé** comme test ajouté (killer minimal ci-dessus) car il garde une
propriété de sûreté RSS/OOM.

---

## Oracles (suite COMPLÈTE, sous `env -u SMTP_* ALERT_* PROBE_STATE_URL`)

| Oracle | Commande | Résultat |
|---|---|---|
| `npm test` COMPLET | `node --test "test/*.test.ts" "packages/*/test/*.test.ts" "apps/*/test/*.test.ts"` | **509 tests, 509 pass, 0 fail** (durée 38,6 s) — conforme au PLI |
| `typecheck` | `tsc --noEmit` | **0 erreur**, exit 0 |
| `eslint` (fichiers touchés) | `eslint test/probe-narabi.test.ts test/probe-narabi-state.test.ts` | **0**, exit 0 (le `.mjs`/`.d.mts` ignorés par eslint) |
| `lint:ratchet` | `node scripts/lint-ratchet.mjs` | **69/69**, exit 0 (plafond inchangé) |
| `gate:vocab` | `node scripts/grep-forbidden.mjs` | **OK — 181 fichiers, 0 claim interdit** (le fichier neuf N'EST PAS dans les 181 : cf. C-G2-4) |
| `export:check` | `node scripts/export-public.mjs --check` | **OK — 0 chemin interdit, 0 hit français** |
| `lang:gate` | `node scripts/lang-gate.mjs` | **OK — 0 hit français non exempté** |
| `no-secret-in-repo` | dans la suite (509/509) | aucun secret (loopback/`.invalid`/snapshot public) |
| `g1` model-pinning | `bash enforcement/lint-model-pinning.sh .` | OK (vert par absence — pas d'agent `.claude` dans ce worktree) |

**Provenance/sha256** — les 7 fichiers correspondent EXACTEMENT au PLI §7 :
`probe-narabi.mjs 1001c1cd…`, `probe-narabi.d.mts 09d6a641…`, `monark-sentinel.service d70f88cc…`,
`probe-narabi.test.ts 2d820136…`, `probe-narabi-state.test.ts 4cd3e238…`, `ADR-NARABI-OPS-1.md db21d698…`,
`RUNBOOK-sentinel.md 1bd93f8f…`.
**Provenance D** — `JOURNAL-PROVENANCE.md:310` sha256 = `2d3158b2865e640cebe05ffb8a220cd7194f315809235bcbb9051eca925f9388`
(== commentaire du test) ; ligne = « G7 lot NARABI-OPS-1b-i … mesure D = 25,481 s » ; `CHANTIERS.md:286` confirme
`RUN_DURATION_D_SEC=26`, `T_s = max(300, ⌈3D/60⌉·60) = 300 s`.

---

## R-25

`git diff --shortstat "57e9cbc...HEAD" -- .` avec le pathspec EXACT de `ci.yml:65` (`docs/**/*.md`, `fixtures/**`,
`apps/{sentinel,bell}/test/fixtures/**`, `package-lock.json` exclus) sous `env -u …` :
**`5 files changed, 379 insertions(+), 13 deletions(-)` = 392 ≤ 1205** — **conforme au PLI (392) et au plafond.**

---

## Provenance de cette revue
Relecteur G2 **`claude-opus-4-8[1m]`**, effort max, contexte frais, 2026-09-21. R-20 (aucun commit/workflow/action
sortante ; mutants joués in-place puis restaurés BYTE-EXACT, jamais `git checkout`, sha256 re-vérifié == pristine).
R-21 (chaque fait porte son `fichier:ligne` first-hand ou sa mesure ; oracles rejoués ; merge-tree en lecture).
Advisor intégré (Fable 5.1) consulté AVANT les mutants et le verdict (mode livelock de rattrapage intégré ;
constantes -a lues réellement ; précédence mesurée par appel direct ; N-G2-3 retenu).
