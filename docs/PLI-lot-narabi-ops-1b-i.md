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
| `scripts/probe-narabi.mjs` | `ed83ea4ed625ccba819b8d8b22c85cf47cd2fe19485c3dd5ecc768109ae98a29` | Sonde (built-ins Node seuls) : GET borné, gril d'échéance UTC, chaîne recomputée (31 champs dupliqués), proxy chainstack non positionnel, `narabi.json`, exit 1 ssi unhealthy |
| `scripts/probe-narabi.d.mts` | `846b9214cdf9a80f62391f5409fb8c4846726d56e61301ba0e41eac4b2cdad8b` | Sidecar de types (TS7016) ; eslint ignore `**/*.d.mts` ; consommé par le test racine |
| `test/probe-narabi.test.ts` | `4d77af7489c5756088acdca491607a6190c89ec272e06a7867a7b1cb2ff3936c` | 9 tests non-LLM (racine, glob `test/*.test.ts`) |
| `deploy/monark-probe.service` | `a3d9885836fe986dfb1b5905df7a902b612b969c711607eb11a56f49bcb5b295` | Unité systemd Bell SANS mail : `User=probe`, `EnvironmentFile=-` toléré (-1b-i, pas de secret), `TimeoutStartSec=90`, `ReadWritePaths=/var/lib/monark-probe` |
| `deploy/monark-probe.timer` | `39335a1e1621733fc9b67020029bf504c6857f2738d18989e5d761e42bece3ee` | 3 tirs UTC post-échéance (10:30/12:30/16:30), `Persistent=true` |
| `vocab-banned.json` | `134f5194e6a92fc084e8f00e587051875d81b1a5394fb754cc00496ee1b99277` | `scan.sentinel.files` **+4** chemins (probe .mjs/.test.ts + 2 unités) + note de provenance ADR-NARABI-OPS-1 |
| `apps/sentinel/test/sentinel-retry.test.ts` | `6ef96a48bc0e8be695f818f8f0faa87a6d4e57c1ef0e2f84ae2657ae17f09212` | **L-4** (item hérité ii) : `after()`+`rmSync` — la fuite `mkdtemp` est fermée |

**Note `scan.sentinel.files` = +4 fichiers** (pas +3 : la « `deploy/monark-probe.{service,timer}` » du plan est une
paire, brace-expandue). Vérifié : `vocab_sentinel_scope_scans_src_test_deploy` (ci-gates) teste l'appartenance de trois
fichiers nommés, PAS une égalité d'ensemble ⇒ mes ajouts sont sûrs.

## Tests (9 nommés, tous verts ; `test/probe-narabi.test.ts`)
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

## Reste dû : néant à ma charge en -1b-i
Aucune dette nue. Tous les inconnus sont soit des **items formés avec déclencheur** ci-dessus, soit des adjudications déjà
rendues (Doutes 1-5, E-1/E-2/E-3). Contrat de sortie tenu : `exit 1 ssi status==="unhealthy"`, `narabi.json` **toujours**
écrit avant sortie (asserté par `runProbe`).
