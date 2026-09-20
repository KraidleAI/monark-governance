# PLI — lot NARABI-OPS-1b-i (DÉTECTION) — worker `claude-opus-4-8[1m]`

Modèle résolu (R-1) : **`claude-opus-4-8[1m]`**, effort max. Worker implémenteur G1, 2026-09-20. R-20 (le worker ne
committe pas, ne déclenche aucun workflow, aucune action sortante — tout est loopback/offline, aucun secret, aucune
URL à clé). R-21 (écrit pour être re-vérifié adversarialement). Base : `298aa5c` (`lot/etude-suite` HEAD), branche
`lot/narabi-ops-1b-i`, worktree `F:\Monark-wt-narabi1b`. Plan qui fait foi : `docs/G0-lot-narabi-ops-1b.md` (corps +
Amendement checkpoint-1 + Adjudications au pli) et `docs/CHECKPOINT1-lot-narabi-ops-1b.md`. Sous-lot **-1b-i = DÉTECTION
seule** (C-15) : GET + fraîcheur/gril + chaîne recomputée complète + proxy chainstack + `narabi.json`, exit 1 ssi
`unhealthy`. **PAS de client SMTP, PAS de machine à états d'alerte** (c'est -1b-ii).

## Livrés (7 fichiers ; sha256 finaux post-restauration des mutants)
| Fichier | sha256 | Rôle |
|---|---|---|
| `scripts/probe-narabi.mjs` | `c872cccec7cec8b48ad98b54a2469efae6f45892e4642a8eb9f22bb545238ee8` (post-G2-pli ; G1 était `ed83ea4…`) | Sonde (built-ins Node seuls) : GET borné, gril d'échéance UTC, chaîne recomputée (31 champs dupliqués), proxy chainstack non positionnel, `narabi.json`, exit 1 ssi unhealthy |
| `scripts/probe-narabi.d.mts` | `2a183e98fdab24d7f1fb2e9f65f862856a251a68f15d09b87112de59bd078467` (post-G2-pli ; G1 était `846b9214…`) | Sidecar de types (TS7016) ; eslint ignore `**/*.d.mts` ; consommé par le test racine |
| `test/probe-narabi.test.ts` | `b830bb6c01698a174ab142adc1d719e25dca8d0cadbb1feeaa03ef561d5d2045` (post-G2-pli ; G1 était `4d77af74…`) | 14 tests non-LLM (9 G1 + 5 G2 ; racine, glob `test/*.test.ts`) |
| `deploy/monark-probe.service` | `35fba8755e456b2f641924229e1c17c576d744b0d270c43d3cb822bd3afdc22a` (post-G2-pli ; G1 était `a3d98858…`) | Unité systemd Bell SANS mail : `User=probe`, `EnvironmentFile=-` toléré (-1b-i, pas de secret), `TimeoutStartSec=90` (couvre le pire-cas env plafonné, C-G2-7), `ReadWritePaths=/var/lib/monark-probe` |
| `deploy/monark-probe.timer` | `39335a1e1621733fc9b67020029bf504c6857f2738d18989e5d761e42bece3ee` | 3 tirs UTC post-échéance (10:30/12:30/16:30), `Persistent=true` |
| `vocab-banned.json` | `134f5194e6a92fc084e8f00e587051875d81b1a5394fb754cc00496ee1b99277` | `scan.sentinel.files` **+4** chemins (probe .mjs/.test.ts + 2 unités) + note de provenance ADR-NARABI-OPS-1 |
| `apps/sentinel/test/sentinel-retry.test.ts` | `6ef96a48bc0e8be695f818f8f0faa87a6d4e57c1ef0e2f84ae2657ae17f09212` | **L-4** (item hérité ii) : `after()`+`rmSync` — la fuite `mkdtemp` est fermée |

**Note `scan.sentinel.files` = +4 fichiers** (pas +3 : la « `deploy/monark-probe.{service,timer}` » du plan est une
paire, brace-expandue). Vérifié : `vocab_sentinel_scope_scans_src_test_deploy` (ci-gates) teste l'appartenance de trois
fichiers nommés, PAS une égalité d'ensemble ⇒ mes ajouts sont sûrs.

## Tests (9 nommés, tous verts ; `test/probe-narabi.test.ts`)
**(Instantané G1 — le pli G2 porte le total à 14 tests ; voir §PLI G2, fait foi sur le compte.)**
Rejeu : `node --test --test-timeout=120000 --test-force-exit test/probe-narabi.test.ts` ⇒ **tests 9, pass 9, fail 0**
(TMP/TEMP redirigés sur `F:` — rien sur `C:`).
1. `probe_hashed_fields_order_equals_sentinel` (C-1) — ordre des 31 champs `==` `timeline.ts hashedFields` sur une **ligne synthétique à 31 valeurs deux à deux distinctes** (deepEqual + hash) ; **second oracle** = les 3 lignes committées recomputent leur `line_hash` publié (== `lineHashOf` du sentinel).
2. `probe_provider_of_matches_sentinel` (C-12 ; item hérité i) — `providerOf` dupliqué `==` `rpc.ts providerOf` sur `chainstack.com` **et** `p2pify.com` ; `chainstack_present` par **appartenance de provider** (chainstack à l'index 1, jamais `endpoints[8]`).
3. `probe_narabi_detects_lag` (C-4) — **8 sous-cas `--now`** en sous-processus (exit codes réels), fixture last=2026-09-19 : 10:35Z/09-20→healthy(0) ; 10:35Z/09-21→lag(1) ; 00:15Z/09-21→healthy (reboot, tue gril-retiré) ; 09:45Z→healthy (tue heure-locale + local-complet) ; 23:30Z→healthy (tue date-locale) ; 10:29Z→healthy & 10:30Z→lag (épingle DEADLINE) ; 05:00Z→healthy `lag_days=-1` (tue `lag!==0`).
4. `probe_timer_oncalendar_ge_deadline` (C-4) — chaque `OnCalendar` ≥ `DEADLINE_UTC_MINUTES` (630) et **explicitement UTC**.
5. `probe_recomputes_full_chain` (C-9) — ligne **du milieu** trafiquée en scratch ⇒ `chain_broken` (pas seulement la dernière).
6. `probe_chainstack_present_from_real_producer_line` (C-5 voie a, CA-11 durci) — le **producteur réel `run.ts`** tourne en sous-processus (calque `sentinel-retry.test.ts:112,231-244`) avec l'origine Chainstack **sans clé** ; ligne à 9 endpoints → `chainstack_present=true` ; sans la variable → 8 endpoints → `false`. `delete env.CHAINSTACK_ETH_URL` avant tout (aucune clé du shell n'entre dans l'enfant).
7. `probe_get_over_loopback_http_executes` (C-6) — serveur `node:http` loopback : GET `http://127.0.0.1` exécuté → healthy ; serveur non répondant + `PROBE_TIMEOUT_MS` bas ⇒ `unreachable` borné (ne pend jamais) ; `PROBE_MAX_BYTES` bas ⇒ `too_large` (réponse bornée).
8. `probe_refuses_http_off_loopback` (C-6) — garde **pure d'abord** (`urlTransportAllowed`) : `http` hors loopback refusé (`insecure_url`), `https`/`http`-loopback admis ; puis bout-en-bout sur hôte `.invalid` (ne résout jamais) ⇒ **zéro paquet** même sous le mutant.
9. `probe_timer_multiple_shots` (C-13) — ≥ 3 tirs, premier ≥ DEADLINE, `Persistent=true`, `Unit=monark-probe.service` ; service : `User=probe`, `EnvironmentFile=-`, `ProtectSystem=strict`, `TimeoutStartSec` ≥ worst-case code (`DEFAULT_TIMEOUT_MS × (DEFAULT_RETRIES+1)`).

## Mutants (14, chacun rouge puis restauré sha-exact — jamais `git checkout` ; harnais reproductible `F:\tmp\narabi1b\{mut.mjs,run-mutants.sh,run-mutants2.sh}`)
**(Instantané G1 ; le pli G2 ajoute 9 mutants RED + 1 contrôle négatif GREEN ; voir §PLI G2, fait foi.)**
Chaque mutation = un remplacement de chaîne à occurrence unique (asserté) ; restauration inverse ; `sha256(fichier) == baseline` re-vérifié.
| # | Mutation (dans `scripts/probe-narabi.mjs`) | Test tueur | Verdict |
|---|---|---|---|
| M1 | `s_raw`↔`s` dans l'ordre des 31 champs | `probe_hashed_fields_order_equals_sentinel` | RED, restore=OK |
| M2 | `c1_ok`↔`regime.floor` dans l'ordre des 31 champs | `probe_hashed_fields_order_equals_sentinel` | RED, restore=OK |
| M3 | gril d'échéance retiré (`expected = today−1` toujours) | `probe_narabi_detects_lag` (00:15Z) | RED, restore=OK |
| M4 | heure LOCALE (`getUTCHours/Minutes`→`getHours/Minutes`) | `probe_narabi_detects_lag` (09:45Z, machine UTC+1) | RED, restore=OK |
| M5 | `DEADLINE_UTC_MINUTES` 630→629 | `probe_narabi_detects_lag` (10:29Z) | RED, restore=OK |
| M6 | index positionnel `endpoints[8]` au lieu de `.some(providerOf ∈ …)` | `probe_provider_of_matches_sentinel` | RED, restore=OK |
| M7 | chaîne recomputée sur la **dernière** ligne seulement | `probe_recomputes_full_chain` | RED, restore=OK |
| M8 | `http://` hors loopback accepté (garde retirée) | `probe_refuses_http_off_loopback` | RED, restore=OK |
| M9 | timeout retiré (`ctl.abort()` neutralisé) | `probe_get_over_loopback_http_executes` (pend > borne, `--test-timeout` tue) | RED, restore=OK |
| M10 | date LOCALE (`toISOString` décalé de l'offset) — C-4 date-locale | `probe_narabi_detects_lag` (23:30Z, **seul** tueur) | RED, restore=OK |
| M11 | `lag_days <= 0`→`=== 0` — C-4 `lag!==0` | `probe_narabi_detects_lag` (05:00Z, `lag=-1`) | RED, restore=OK |
| M12 | réponse NON bornée (`maxBytes`→`Infinity`) — C-6 | `probe_get_over_loopback_http_executes` (sous-cas oversize) | RED, restore=OK |
| M13 | n'écrit `narabi.json` que si healthy — L-1 « écrit TOUJOURS » | `probe_refuses_http_off_loopback` (contrat `existsSync(out)` de `runProbe`) | RED, restore=OK |
| M14 | `OnCalendar` 10:30→09:45 (unité) — C-4/C-13 | `probe_timer_oncalendar_ge_deadline` | RED, restore=OK |

Les **14 mutants couvrent la liste « au minimum » de la mission ET les mutants nommés par le plan** (C-4 : heure-locale,
date-locale, `DEADLINE≠10:30`, `lag!==0` ; C-6 : timeout, réponse non bornée, `http` hors loopback ; L-1 : unreachable
n'écrit pas). `M4` est **démontrable ici** : offset machine **mesuré −60 min (UTC+1, GMT+0100 BST)** — la valeur « UTC+1 »
du plan (citée [2nd]) est confirmée first-hand ; à 09:45Z l'heure locale est 10:45 ≥ 10:30, le mutant bascule en lag.
`M10`/`M11` prouvent que les cas `--now` 23:30Z et 05:00Z sont **portants** (chacun est le seul tueur de son mutant), pas
du remplissage. Restaurations vérifiées : `scripts/probe-narabi.mjs` et `deploy/monark-probe.timer` re-hashés == baseline.

## R-25 (pathspec `STAT=` de `ci.yml:65`, mesuré `git diff --cached --shortstat 298aa5c` avec les excludes, puis unstaged)
**793 lignes changées** (789 insertions + 4 suppressions) — **sous le plafond 1205**, **dans la bande déclarée du
checkpoint (562–893)**, au-dessus de la cible ~700 « en haut de bande » (prévu : « poids des tests : serveur http réel +
sous-processus `run.ts` + ligne synthétique 31 champs »). Répartition (`--numstat`) :
`probe-narabi.test.ts` 338 · `probe-narabi.mjs` 307 · `probe-narabi.d.mts` 63 · `monark-probe.service` 40 ·
`monark-probe.timer` 26 · `sentinel-retry.test.ts` +13/−2 · `vocab-banned.json` +2/−2. `docs/PLI-*.md` exclu
(`docs/**/*.md`). Le seam est déjà FERME (C-15) : pas de nouveau split.

## Oracles ciblés passés (un à la fois ; PAS de `npm run ci` complet — réservé à l'orchestrateur, autres workers en vol)
- `typecheck` (`tsc --noEmit`) : **0** ; `eslint test/probe-narabi.test.ts apps/sentinel/test/sentinel-retry.test.ts` : **0**.
- `lint:ratchet` : **69/69** — plafond inchangé, **0 violation ajoutée** (test entièrement typé, chaque `JSON.parse` casté). Baseline mesuré 69/69 AVANT toute édition ⇒ zéro marge, respectée.
- `gate:vocab` : OK (178 fichiers, dont les 4 nouveaux du scope sentinel). `export:check` : OK (0 chemin interdit, 0 français). `lang-gate --scope root,contracts,sentinel,bell` : OK (0 hit).
- Suites affectées re-jouées vertes : `sentinel-retry` (L-4), `ci-gates` (scope vocab + wiring + timer), `no-secret-in-repo`, `narabi-live`, `export-public` ⇒ **39 tests, 39 pass, 0 fail**. Fuite L-4 fermée : **0** répertoire `narabi-retry-*` laissé après la suite (mesuré 1 avant le correctif).

## Déviations (avec `error_origin` proposé)
1. **`narabi.json` écrit-seulement en -1b-i** (le plan L-1(e) dit « lit/écrit »). La sonde n'ouvre AUCUN chemin de lecture de l'état antérieur ; le read (état précédent pour la machine à un bit) n'a de sens qu'avec la machine à états de -1b-ii et serait du **code mort** en -i (règle Branchement). Conforme à la Question-au-pli #4 / Doute-4 (schéma versionné, `alerted`/`alert_error` ajoutés en -ii). `error_origin` = **plan** (la moitié « lit » est un concern -1b-ii, pas -1b-i) — déviation bénigne, adjugée d'avance.
2. **Ensemble des `reason` élargi** : `{lag, chain_broken}` + `{unreachable, too_large, insecure_url, probe_error}`. Requis par C-6 (transport borné, garde loopback) et par l'enveloppe « ne crashe jamais » (advisor). **Précédence documentée** : ne-peut-évaluer (`insecure_url`/`unreachable`/`too_large`/`probe_error`) > `chain_broken` > `lag`. `error_origin` = **aucun** (dans le mandat C-6 ; le plan ne les interdit pas).
3. **`publish_latency` = formule littérale du plan (fait 5)** : `checked_at − (échéance 10:30 UTC du jour du check)`, en secondes, déterministe sous `--now`. **Clarification (advisor)** : c'est le **délai d'observation par rapport à l'échéance de fraîcheur**, PAS la latence du run publiant du sentinel (celle-ci exige une lecture de journal au déploiement — item ouvert ci-dessous). `error_origin` = **aucun** (formule littérale implémentée ; l'ancrage « échéance = 10:30 du jour du check » est explicité, non deviné).
4. **`DEADLINE` = une constante épinglée, NON surchargée par env** (advisor #9) ; seuls `PROBE_TIMEOUT_MS`/`PROBE_MAX_BYTES`/`PROBE_RETRIES` sont réglables (ils ne touchent pas la cohérence timer). « Paramétrée » (item durée du run) est satisfait par cette unique constante. `error_origin` = **aucun**.
5. **Harnais de test** (méthodologie, pas le livrable) : (a) le test loopback GET utilise un **spawn async** — un `spawnSync` gèlerait la boucle d'événements du parent et **inter-bloquerait** le serveur http in-process (mesuré) ; (b) l'hôte hors-loopback est `.invalid` (ne résout jamais) ⇒ zéro paquet vers un service réel, même sous le mutant. `error_origin` = **aucun** (contraintes offline/no-outbound).

## Tuyaux déclarés (Branchement ; état **`upcoming`**, libellé honnête C-10 ; `fleet.ts` INTACT — CA-11)
Aucun composant n'est déclaré « built » : la sonde est un outil d'exploitation, son unique consommateur aval (le mail sur
un lag réel/simulé) tombe en **-1b-ii** ; l'état de registre reste `upcoming` **jusqu'au premier mail** (décision 58). Le
test EXÉCUTE la composition depuis l'artefact réel (CA-11 durci) — axe distinct de l'état de registre (réconciliation
C-5↔C-10).
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| surface servie → fraîcheur | `timeline.jsonl` (`run.ts:190`) | `narabi.json` `{status,reason,lag_days}` | code + test non-LLM ; **wired at deploy** ; `upcoming` jusqu'au premier mail (déc. 58) | `probe_narabi_detects_lag` (`--file` = fixture réelle) + `probe_get_over_loopback_http_executes` (GET loopback réel) |
| ligne → chaîne recomputée (complète, C-9) | dernière + toutes les lignes | verdict `chain_broken` | idem ; `upcoming` | `probe_recomputes_full_chain` + `probe_hashed_fields_order_equals_sentinel` |
| endpoints publiés → proxy chainstack | origine expurgée (`.some(providerOf ∈ {chainstack.com,p2pify.com})`) | fait `chainstack_present`/`provider` | code + test non-LLM (**compo. `run.ts` RÉEL**, C-5) ; `upcoming` | `probe_chainstack_present_from_real_producer_line` + `probe_provider_of_matches_sentinel` |

## Items formés (déclencheurs ; zéro dette nue)
- **Durée d'un run Narabi PUBLIANT non mesurée** (marge 10:30) — l'orchestrateur lit le journal **après le créneau 00:30 UTC du 2026-09-21**, AVANT le gel de -1b-i ; `DEADLINE` reste une **hypothèse déclarée** d'ici là (une seule constante `DEADLINE_UTC_MINUTES=630`, timer commenté en ce sens). Propriétaire : orchestrateur.
- **`narabi.json` digest cross-check** (`digest == digest_T`, C-9 i) — **NON inclus** (2ᵉ GET de `state.json` ; Doute-2 l'a ratifié comme item, pas inclusion). Déclencheur : G1 -1b-i ; propriétaire worker/orchestrateur.
- **Mémoriser le dernier `line_hash`** (anti-réécriture, C-9 ii) — item, déclencheur -1b-ii. Propriétaire orchestrateur.
- **Factoriser `STUB_SRC`** (le stub `fetch` method-aware ~40 l. est **copié** de `sentinel-retry.test.ts` dans `test/probe-narabi.test.ts` — couplage déclaré, coût R-25 assumé C-5) en helper partagé. Déclencheur : toute évolution du stub. Propriétaire orchestrateur.
- **Couplage ordre-de-hash dupliqué** — re-vérifier `probe` vs `hashedFields` à toute évolution de `timeline.ts` (le test `probe_hashed_fields_order_equals_sentinel` rougira au prochain rejeu si l'ordre dérive). Propriétaire orchestrateur.
- **Limite déclarée (R-21) : la boucle de réessai borné n'est pas différenciée `retries=0` vs `retries=2`** — la borne S'EXÉCUTE (couverte par le timeout et la garde oversize), mais aucun test ne prouve qu'un échec-puis-succès rejoue exactement N fois (il faudrait un serveur « échoue une fois puis sert »). C-6 ne nomme pas de mutant de réessai ⇒ pas une lacune du plan ; item formé, déclencheur : **-1b-ii** (revue G2 dédiée du transport SMTP, où le réessai est re-conçu). Propriétaire orchestrateur.
- Portés par -1b-ii / déploiement (hors -1b-i) : machine à états + client SMTP (E-3 répondu : rappel quotidien) ; `health.json` (Q1) ; repli 587 (Q6) ; dead-man E-1 ; boîte/AUTH/tarif Hostinger E-2 ; `ALERT_TO` d'env.

## PLI G2 — corrections de la revue G2 (worker `claude-opus-4-8[1m]` effort max, 2026-09-20)
Modèle résolu (R-1) : **`claude-opus-4-8[1m]`**. R-20 (ne committe pas, aucun workflow, **aucune action sortante** — loopback/offline
seulement, aucun secret). R-21 (écrit pour re-vérification adversariale). Base au pli : HEAD `69eb943` (arbre propre), branche
`lot/narabi-ops-1b-i`, worktree `F:\Monark-wt-narabi1b`. Findings pliés : **C-G2-1..8** de `docs/G2-lot-narabi-ops-1b-i.md`
(**NON édité**), verdict G2 `ACCEPTE-AVEC-CORRECTIONS` — **toutes** pliées, y compris les observations C-G2-6/7/8 (objectif
investisseur : zéro dette au release). 4 fichiers touchés au pli G2 : `probe-narabi.mjs`, `probe-narabi.d.mts`, `test/probe-narabi.test.ts`,
`deploy/monark-probe.service`.

### sha256 post-pli (SUPERSÈDENT la table « Livrés » pour les fichiers changés)
| Fichier | sha256 post-G2-pli |
|---|---|
| `scripts/probe-narabi.mjs` | `c872cccec7cec8b48ad98b54a2469efae6f45892e4642a8eb9f22bb545238ee8` |
| `scripts/probe-narabi.d.mts` | `2a183e98fdab24d7f1fb2e9f65f862856a251a68f15d09b87112de59bd078467` |
| `test/probe-narabi.test.ts` | `b830bb6c01698a174ab142adc1d719e25dca8d0cadbb1feeaa03ef561d5d2045` |
| `deploy/monark-probe.service` | `35fba8755e456b2f641924229e1c17c576d744b0d270c43d3cb822bd3afdc22a` |
| `deploy/monark-probe.timer` | `39335a1e1621733fc9b67020029bf504c6857f2738d18989e5d761e42bece3ee` (inchangé) |

### Corrections (finding → correction `symbole` → test → mutant rouge démontré)
| Finding | error_origin | Correction (`probe-narabi.mjs` sauf mention) | Test | Mutant (RED démontré, restauré sha-exact) |
|---|---|---|---|---|
| **C-G2-1** (MAJEUR) garde loopback | **worker** | `isLoopbackHost` STRICT : `localhost`/`::1`/`[::1]` exact, ou littéral IPv4 127/8 canonique (4 octets décimaux ≤255, sans zéro en tête, 1er=127) ; nouveau `rawUrlHost` lit l'hôte **AVANT** normalisation WHATWG ; `urlTransportAllowed` : http ssi **sans userinfo** ET `isLoopbackHost(u.hostname)` ET `isLoopbackHost(rawUrlHost(url))` | `probe_refuses_http_off_loopback` (batterie pure des 8 refus + `127.00.0.1`/`0177.0.0.1` ; admis `127.0.0.53`/`[::1]` ; e2e `.invalid` seulement) | `M-G2-1` : `if(!m) return false` → `/^127\./.test(h)` (préfixe regex rétabli) ⇒ RED |
| **C-G2-2** fuseau CI-UTC | **worker** | `runProbe`/`runProbeAsync` figent `TZ` enfant (défaut `Etc/GMT-11`) ; `probe_narabi_detects_lag` rejoue les 8 cas sous `Etc/GMT-11` (UTC+11) ET `Etc/GMT+11` (UTC−11) — signes opposés, passage de jour ; verdicts UTC-invariants (mesuré) | `probe_narabi_detects_lag` (×2 fuseaux) | `M-G2-2/M4` (`getUTC*`→`get*`), `M-G2-2/M10` (date locale), **parent `TZ=UTC` offset=0 mesuré** ⇒ RED tous deux |
| **C-G2-3** `--now` invalide | **worker** | `probe()` : `--now` non parsable ⇒ repli horloge réelle + `probe_error`, exit 1, `narabi.json` **toujours** écrit, jamais FATAL | `probe_invalid_now_still_writes_narabi_json` (+ `doesNotMatch(stderr,/FATAL/)`) | `M-G2-3` : repli retiré (`nowIso=providedNow`) ⇒ catch re-throw ⇒ non écrit ⇒ RED |
| **C-G2-4** redirections | **worker** | `fetch(...,{redirect:"manual"})` + 3xx/opaqueredirect ⇒ `unreachable` (aucun suivi) | `probe_does_not_follow_redirects` (302 loopback→autre port, cible **jamais** contactée) | `M-G2-4` : `redirect:"manual"` retiré ⇒ suivi ⇒ cible contactée ⇒ RED |
| **C-G2-5** double constante DEADLINE | **worker** | `DEADLINE_UTC="10:30"` source unique ; `DEADLINE_UTC_MINUTES=hhmmToMinutes(DEADLINE_UTC)` **dérivée** ; oracle `publish_latency` | `probe_deadline_single_source_and_publish_latency_oracle` (0 à 10:30Z, +300, −3600 ; minutes==parse(string)) | `M-G2-5` : minutes désync `629` ⇒ RED |
| **C-G2-6** écriture non atomique | **plan (−1b-ii), plié par anticipation** | temp même répertoire + `renameSync` (écrase POSIX **et** Windows, mesuré) | `probe_writes_narabi_json_atomically` (2 runs sur le même `--out`, aucun résidu `.tmp`) | `M-G2-6` : `renameSync` retiré ⇒ `narabi.json` absent, résidu `.tmp` ⇒ RED |
| **C-G2-7** env transport non plafonné | **worker/plan, plié** | `transportBounds(env)` plafonne dur `PROBE_TIMEOUT_MS`(≤10000)/`PROBE_RETRIES`(≤4)/`PROBE_MAX_BYTES`(≤64 Mio) ; pire-cas 60 s < `TimeoutStartSec` 90 s | `probe_timer_multiple_shots` (lit l'unité ; `TimeoutStartSec > 60 s` strict ; clamps mesurés) | `M-G2-7` : `Math.min(n,max)`→`n` ⇒ non plafonné ⇒ RED |
| **C-G2-8** `--file` non borné | **worker** | `--file` borné (`statSync`) à la **même** borne que le GET ⇒ `too_large` | `probe_file_input_is_size_bounded` (fixture > 64 o ⇒ too_large) | `M-G2-8` : contrôle taille retiré ⇒ lu entier ⇒ healthy ⇒ RED |

Harnais mutants : `F:\tmp\narabi1b\run-mutants.mjs` (auto-contenu — remplacement à occurrence unique **assertée** inline, sans
dépendance) ; restauration depuis snapshot post-pli `F:\tmp\narabi1b\edited\probe-narabi.mjs`, **jamais `git checkout`** ; sha256 re-vérifié
== `c872ccc…` après CHAQUE mutant). **Contrôle négatif** `CTRL-noop` (commentaire seul) ⇒ **GREEN** (fail 0) : le harnais
discrimine. **9 mutants ⇒ 9 RED, 1 contrôle GREEN.** Arbre restauré sha-exact (`probe-narabi.mjs` == `c872ccc…`), `git status` = 4 fichiers.

### Déviation déclarée (R-21)
- **C-G2-1 `error_origin = worker`** : l'élargissement `/^127\./` (G1) était une **déviation NON déclarée** du plan (ensemble
  `{127.0.0.1, ::1, localhost}`, G0 L-2/C-6). Corrigée. L'assertion G1 `isLoopbackHost("127.0.0.53")===true` « 127/8 » qui
  validait l'élargissement est **remplacée** (non simplement retirée) par une assertion recadrée (« littéral 127/8 canonique,
  PAS un nom DNS ») **plus** la batterie des refus — pour ne pas ouvrir un trou de sur-restriction (`=== "127.0.0.1"`).
- **Point empirique mesuré (first-hand)** : le parseur WHATWG de Node **normalise** `127.1`/`0x7f.0.0.1`/`2130706433`/
  `0177.0.0.1`/`127.00.0.1` → `127.0.0.1` ; d'où la nécessité de `rawUrlHost` (hôte brut) — `u.hostname` seul les laisserait
  passer. `0.0.0.0` reste `0.0.0.0` (refusé, 1er octet ≠ 127) ; `127.0.0.1@evil.com` ⇒ `hostname=evil.com` + userinfo refusé ;
  `[::1]`→`[::1]`. TZ enfant : `Etc/GMT-11`=UTC+11, `Etc/GMT+11`=UTC−11 (signe POSIX inversé), honorés via l'env `spawn`
  (échec shell MSYS écarté) ; `toISOString` reste UTC. `renameSync` **écrase** un fichier existant sur ce Windows (mesuré).
- **Note méthode (R-20, aucune action sortante)** : tous les cas end-to-end `--url` restent sur `.invalid` (jamais un domaine
  enregistrable), pour que même le run du mutant C-G2-1 (garde désactivée) n'émette **aucun** paquet vers un service réel (au plus
  une requête DNS sur `.invalid`, réservé non-résolvant, RFC 6761). Les 8 refus (dont `127.0.0.1.evil.com`, `127.evil.com`, domaines
  réels) sont testés par `urlTransportAllowed` **pur** (décision de chaîne, zéro dial). Strictness déclarée : userinfo entièrement
  refusé sur http-loopback ; `http:127.0.0.1/x` (WHATWG tolère `//` manquant) refusé par `rawUrlHost` — fail-safe, pas un bug.
Formes IPv6 longues `http://[0:0:0:0:0:0:0:1]/` et `http://[::ffff:127.0.0.1]/` **refusées** aussi (hôte brut ≠ `::1` exact ;
mesuré) — conforme à « EXACTEMENT `::1`/`[::1]` », fail-safe (elles sont bien loopback mais non canoniques).

### R-25 (pathspec `STAT=` de `.github/workflows/ci.yml:65`, `git diff --shortstat 298aa5c` arbre de travail)
**970 lignes** (966 insertions + 4 suppressions) ⇒ **≤ 1205** (plafond), **sous** le seuil d'alerte 1100 (~130 de marge). Delta pli
G2 sur le G1 (793) ≈ **+177**. Répartition post-pli (`--numstat` vs `298aa5c`) : `probe-narabi.test.ts` 439 · `probe-narabi.mjs`
374 · `probe-narabi.d.mts` 70 · `monark-probe.service` 42 · `monark-probe.timer` 26 · `sentinel-retry.test.ts` +13/−2 ·
`vocab-banned.json` +2/−2 (ces 2 derniers = G1, non touchés au pli G2). `docs/**/*.md` exclus.

### Oracles rejoués post-pli (un à un ; PAS de `npm run ci`)
typecheck `tsc --noEmit` **0** · eslint `test/probe-narabi.test.ts` **0** · `lint:ratchet` **69/69** (0 violation ajoutée) ·
`gate:vocab` OK (178 fichiers) · `export:check` OK · `lang:gate` OK · `probe-narabi.test.ts` **14/14** (9 G1 + 5 G2) ·
`ci-gates` + `no-secret-in-repo` + `sentinel-retry` **32/32**.

### Items formés au pli G2 (déclencheurs ; zéro dette nue)
- **URL servie sans 3xx au déploiement** — `redirect:"manual"` traite TOUTE 3xx comme `unreachable` ; l'orchestrateur confirme au
  déploiement que `https://monarkgate.tech/narabi/timeline.jsonl` répond **200 directement** (aucune redirection Caddy
  trailing-slash / http→https), sinon fausse alerte. Propriétaire : orchestrateur ; déclencheur : go déploiement. (En pratique : GET
  https direct d'un fichier existant ⇒ 200 ; aucune redirection attendue.)
- **Atomicité sous crash** (R-21, limite déclarée) : le test prouve l'absence de résidu `.tmp` + JSON complet ; l'atomicité *sous
  crash* est **structurelle** (`rename` atomique même-FS), non couvrable par un mutant d'exécution normale — `M-G2-6` prouve que le
  `rename` est porteur (sans lui, pas de `narabi.json`). Propriétaire : orchestrateur.
- Items G1 inchangés (durée run publiant après 00:30 UTC 2026-09-21 ; `STUB_SRC` à factoriser ; couplage ordre-de-hash ; digest
  cross-check ; réessai différencié −1b-ii ; portés −1b-ii/déploiement) restent ouverts avec leurs déclencheurs.

## Reste dû : néant à ma charge en -1b-i
Aucune dette nue. Les 8 findings G2 (C-G2-1..8) sont **pliés** (correction + test + mutant RED + sha) ; les inconnus restants sont
soit des **items formés avec déclencheur** ci-dessus, soit des adjudications déjà rendues (Doutes 1-5, E-1/E-2/E-3). Contrat de
sortie tenu : `exit 1 ssi status==="unhealthy"`, `narabi.json` **toujours** écrit avant sortie (asserté par `runProbe` ; C-G2-3
étend l'invariant au `--now` invalide).

### Vérification orchestrateur (R-21), 2026-09-20 17:58 UTC (horloge)
claude-fable-5-1 : sha probe-narabi.mjs c872ccce… == rapport ; 
ode --test test/probe-narabi.test.ts rejoué : 14/14 ; garde de transport exercée à la main : 127.0.0.1.evil.com, 127.1, localhost.evil.com, 127.0.0.1@evil.com ⇒ insecure_url ; 127.0.0.1:8080, [::1], https://monarkgate.tech/… ⇒ admis. **Item « URL servie sans 3xx » CLOS** : HEAD https://monarkgate.tech/narabi/timeline.jsonl ⇒ HTTP/1.1 200 OK, aucune redirection (lecture seule ; à re-contrôler au déploiement par le premier run de la sonde). Reste avant gel : durée d'un run Narabi publiant (créneau 00:30 UTC du 2026-09-21).
