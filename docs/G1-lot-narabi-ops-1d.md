# G1 NARABI-OPS-1d (worker Opus 4.8) — staged, rebase post-clôture -1b avant G2

The mission is complete. All gates green (ci/lint/ratchet/lang-gate/export:check exit 0 with paid keys removed; 877 tests, 875 pass, 0 fail, 2 declared-non-vacuous skips), 10 mutants killed + restored byte-exact, R-25 = 697 < 1150, the 9 U-4b-frozen files byte-identical (`rpc.ts` = `0e232519…`), and the deliverables are durable at `F:\tmp\nops1d\{G1.md,DELIVERED.sha256,mutants.mjs}`. Full rendu below.

---

Modèle résolu : claude-opus-4-8[1m]

# G1 — lot NARABI-OPS-1d (migration du chemin payant Chainstack de `apps/sentinel` sous `@monark/rpc-guard`)

> **Provenance (CA-8).** Worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22 15:45 UTC. Worktree `F:\Monark-wt-nops1d` (branche `lot/narabi-ops-1d`, base = `lot/etude-suite` @ `1f4b746`). Orchestrateur `claude-fable-5-1`. R-20 : aucun commit, aucun workflow. R-21 : chaque affirmation porte sa preuve reproductible. Aucune variable payante affichée (A-7). node v24.15.0.

## 0. Décision d'interprétation (le point dur de la mission) — STAGED, pas de contournement

La CONTRAINTE DURE de la mission (« `apps/sentinel/src/rpc.ts` GELÉ … INTERDIT de le modifier ; si le lot l'exige, STOP et demande formée ; les 9 sha gelés byte-identiques avant/après ») est en tension DIRECTE avec l'objet du lot (L-1 : « `env.CHAINSTACK_ETH_URL` n'est plus lu dans `rpc.ts` » ; L-3 : « `rpc.ts` = 0 hit »). **Mesuré** : les DEUX hits du grep vivent dans `rpc.ts` (`:54` lecture `env.CHAINSTACK_ETH_URL` via `chainstackUrl` ; `:125` `fetch(` de `defaultCall`) ; le test grep au HEAD allowliste DÉJÀ `rpc.ts` avec non-vacuité PAR ENTRÉE — nettoyer `rpc.ts` rend l'entrée vacante (rouge), retirer l'entrée sans nettoyer `rpc.ts` produit un hit (rouge). **Les deux exigent de modifier `rpc.ts`.**

**Résolution (staged, non contournante).** La distinction load-bearing : le checkpoint-1 §2-(1) a REFUSÉ la variante « 1d sans toucher `rpc.ts` » comme état **FINAL** (du code mort compte au grep ; 118 n'autorise qu'un second redéploiement). Il n'a PAS interdit un G1 **par étapes** où (a) la migration FONCTIONNELLE (la jambe payante passe par le garde, ledgérée + plafonnée ; la clé n'est plus lue par le sentinel à l'exécution) est faite MAINTENANT dans `run.ts` + un module neuf, `rpc.ts` restant **byte-identique** avec ses exports devenus MORTS mais **allowlistés** ; et (b) la SUPPRESSION de ces exports morts + la RÉTRACTION de l'entrée d'allowlist `rpc.ts` sont un **item formé** (propriétaire orchestrateur, déclencheur = clôture de la course U-4b-1b, appliqué au rebase avant G2). L'état FINAL (après rebase + suppression) touche bien `rpc.ts` — cohérent avec le refus du checkpoint de la variante « jamais toucher `rpc.ts` ».

Ce n'est PAS un contournement : à l'exécution, la clé n'est plus lue que par le transport du garde (les appelants de `chainstackUrl` — `poolEndpoints`/`publishedEndpoints`/`hasChainstack` — ne sont plus invoqués ; `defaultCall` n'est plus injecté) ; le code mort résiduel dans `rpc.ts` est un résidu TEXTUEL que le grep attrape, d'où l'entrée d'allowlist conservée et la suppression déférée. Les 9 sha gelés sont byte-identiques (§9). `rpc.ts` NON touché.

## 1. Ce qui est livré (route α, corrections C-1..C-10 + rulings pliés)

| # | Fichier | Statut | Contenu |
|---|---|---|---|
| L-1a | `apps/sentinel/src/keyless-transport.ts` | **NEUF** | Le `fetch` keyless (calque de `defaultCall`), sorti de `rpc.ts` vers un module TOP-LEVEL allowlisté (route α). Timeout 20 s (M-10). |
| L-1b | `apps/sentinel/src/run.ts` | modifié | `main()` ouvre la jambe gardée (`openChainstackLeg`), injecte un dispatcher (`makeDispatchCall`) dans `makeRpcPool` (label `chainstack` → `client.call` ; URL → keyless), D-degrade (try/catch + `chainstack_guard` fermé), D-lock (`finally` + handler SIGTERM), C-6 (origine publiée SSI garde ouvert), items -1c (C-G2-1/-3). |
| L-2 | `apps/sentinel/test/sentinel-catchup-budget.test.ts` | modifié | Items -1c : C-G2-1 (zéros de tête refusés), C-G2-2 (jour fautif = le plus lent) ; + `chainstack_guard` dans l'end-JSON pinné, + surface d'env à 6 clés. |
| L-3 | `test/rpc-guard-fetch-only-inside-client.test.ts` | modifié | Portée élargie `apps/sentinel/src/ukemi(+rpc.ts)` → `apps/sentinel/src/**` ; `SENTINEL_ALLOW` = `Map<path,trigger>` à 2 entrées (`rpc.ts` — suppression déférée ; `keyless-transport.ts` — route β), non-vacuité par entrée. |
| L-4 | `apps/sentinel/test/sentinel-chainstack-guard.test.ts` | **NEUF** | 10 tests (9 verts + 1 skip win32 déclaré) : write-ahead, A-8 corps réels, caps mesurés, D-caps, timeout 20 s, classifieur fermé, e2e branchement, D-degrade, D-lock (re-acquisition + SIGTERM). |
| L-4' | `apps/sentinel/test/sentinel-retry.test.ts`, `test/probe-narabi.test.ts` | modifiés | Tests HEAD dépendant de l'ancien comportement « URL seule → chainstack », mis à jour au comportement migré (D-4 annoté). |
| L-5 | `deploy/monark-sentinel.service` | modifié | Documente les 3 clés de cycle non secrètes + le ledger `/var/lib/monark-sentinel/ledger` (sous `ReadWritePaths` existant ⇒ aucun nouveau `ReadWritePaths`) + correction de la dérive « 8 public/ninth ». |

**NON livrés dans le worktree (R-20 ; proposés §11-§12)** : les amendements ADR (NARABI-OPS-1, GARDE-HELIUS A-1/A-4, U-4b D4) et les ajouts RUNBOOK — DOCS, insérés par l'orchestrateur ; l'APRÈS-sha `rpc.ts` de l'amendement U-4b est recomputé au rebase (la suppression est déférée). `apps/sentinel/package.json` : **inchangé** — `@monark/rpc-guard` y est DÉJÀ (dépendance de workspace ; R-8 propre, aucun ajout).

## 2. Rulings orchestrateur (04:3x UTC) — point par point

- **Option 1 (décision 121 inter-machines)** : ledger LOCAL au VPS `join(<stateDir>, "ledger")` = `/var/lib/monark-sentinel/ledger` (sous `ReadWritePaths`, hors `public/`) ; `opts.network:"ethereum-mainnet"` passé à `openGuardedClient` ; **même chaîne `cycle_id`** que la course Ukemi via la clé non secrète `CHAINSTACK_CYCLE_ID` ; floor/caps en clés non secrètes (`CHAINSTACK_CYCLE_FLOOR` + constantes `CHAINSTACK_MAX_CALLS`/`RUN_CAP_RU`/`METHOD_CAPS`). Preuve : test `sentinel_chainstack_leg_writes_ledger_line_before_fetch` (lignes `network:"ethereum-mainnet"`).
- **Q3 (i)+(iii)** : (i) `finally` + handler SIGTERM relâchent le verrou (`runCli(["unlock",…])`, seul chemin public) ; (iii) réparation RUNBOOK sur SIGKILL. (ii) reclaim = item formé NON pris (§11). Preuve : `sentinel_run_re_acquires_lock_after_clean_exit`, `sentinel_run_releases_chainstack_lock_on_sigterm`.
- **C-9 route α** : payant seul sous le garde ; keyless en `fetch` brut dans `keyless-transport.ts` allowlisté (entrée à déclencheur réel « route β »). Preuve : le grep vert, `SENTINEL_ALLOW` à 2 entrées load-bearing.
- **C-7** : test SIGTERM RÉEL sur Linux (`spawn` + poll du `.lock` + SIGTERM + assert relâche) ; skip win32 déclaré NON vacueux (corps réel, exécuté hors win32). Les 3 [abs] LUS (§10).
- **C-6** : origine Chainstack publiée dans `endpoints` UNIQUEMENT si `leg.status==="ok"` ; test (`_ok_ledgers_publishes_origin_…` ⇒ providerOf = chainstack.com) + test degrade (7 endpoints, 0 origine) + mutant `origin_published_without_open` ROUGE.

## 3. Corrections C-1..C-10 (checkpoint-1) — point par point

- **C-1 (ordre/base)** : déviation orchestrateur assumée — le sha de clôture -1b n'existe pas ; le G1 démarre de `lot/etude-suite` @ `1f4b746` ; le worker **rebasera sur le sha de clôture avant G2** (annoncé par l'orchestrateur ; M-n re-mesurées alors). §12 item 1 (après 2b-ii) : satisfait au HEAD (l'entrée d'allowlist `rpc.ts` existe déjà).
- **C-2 (ADR-U4b)** : amendement proposé §12 (AVANT `0e232519…` / APRÈS recompute-au-rebase + jeu de suppression exact).
- **C-3 (composition CA-11 durci + D-3 + A-8)** : `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` `spawnSync` le `run.ts` RÉEL, seul `globalThis.fetch` bouchonné (pas de faux client), corps de forme réelle, garde RÉEL (ledgerDir temporaire, vrai `.lock`), un jour complet ; asserte ledger sur disque, `line_hash` inchangé, `.lock` absent à la sortie, exit 0.
- **C-4 (option 1)** : voir §2.
- **C-5 (déploiement pré-enregistré)** : liste RUNBOOK proposée §13 (SHA, hachés, rollback, `install -d` parent AVANT dry-run, champs du 1er run réel dont `chainstack_guard ok` + absence de `.lock`, STOP/rollback).
- **C-6 / C-7 / C-9** : voir §2.
- **C-8 (MAST)** : FM-2.4 (test fabriquant son entrée) contré par A-8 (corps de forme réelle) ; FM-3.3 (mesure sous clé ambiante) contré par A-7 (`env -u` sur tout l'oracle + mutants). §14.
- **C-10 (housekeeping)** : seuil R-25 = 1 150 (mesuré 697 < 1 150) ; le prompt disait `sentinel.ts` → c'est `run.ts`.

## 4. Tuyaux (règle Branchement) — la pièce est BRANCHÉE (chemin servi + test d'intégration non-LLM)

| Pièce | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| jambe Chainstack gardée (`run.ts`+`keyless-transport.ts`) | `process.env` (clé lue par le transport du garde, jamais par `run.ts`) + clés de cycle non secrètes → `openGuardedClient` | `<ledgerDir>/<cycle>/chainstack.jsonl` (+`.head`/`.lock`) ; ligne publiée + `state.json` INCHANGÉS (`line_hash` identique) | **`upcoming`** jusqu'au 2ᵈ redéploiement ; **`built`** à la 1ʳᵉ ligne JOURNAL post-déploiement (`chainstack:true`, `chainstack_guard:ok`, origine `chainstack.com`, ledger écrit) | `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` (run.ts réel → garde → ledger → publication) + `sentinel_chainstack_leg_writes_ledger_line_before_fetch` (write-ahead) |
| ledger VPS → rapprochement A-4 | `client.call` write-ahead | orchestrateur lit (SSH RO) le COMPTE d'essais par méthode ⇒ minorant = essais × 1 RU (jamais `credits_derived`) | jsonl chaîné, `/var/lib/monark-sentinel/ledger` | acte manuel orchestrateur (hors lot, déclaré) |
| 2ᵈ redéploiement | SHA de fusion -1d | `monark-sentinel.service` sur le VPS site | après clôture temps 1 + course U-4b-1b | RUNBOOK §6 (proposé §13) |

Le composant a un consommateur SERVI réel (le job systemd → `timeline.jsonl`/`state.json` → `/narabi/` + le ledger lu par le rapprochement) ET un test d'intégration non-LLM qui rejoue la composition de bout en bout via le `run.ts` réel.

## 5. Tests imposés (noms) — 9 verts + 1 skip win32 déclaré (nouveau fichier) + tests -1c/existants mis à jour

Nouveau `apps/sentinel/test/sentinel-chainstack-guard.test.ts` : `sentinel_chainstack_leg_writes_ledger_line_before_fetch` ; `sentinel_chainstack_leg_consumes_real_form_bodies` (A-8 + C-3 liste COMPLÈTE : enveloppe succès, objet `error` JSON-RPC à 200, HTTP 429 + `Retry-After` ⇒ `retryAfterMs`, HTTP 403 ⇒ pas de `retryAfterMs`) ; `sentinel_chainstack_caps_cover_the_g0_m7_stress_bound` (borne de stress G0 M-7) ; `chainstack_refusal_degrades_to_keyless_quorum_not_stopped_day` (D-caps) ; `sentinel_chainstack_leg_uses_20s_timeout` (M-10) ; `sentinel_chainstack_guard_open_error_classifier_is_a_closed_set` ; `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` (branchement e2e + C-6 + line_hash + D-lock) ; `sentinel_guard_open_failure_degrades_to_keyless_and_publishes` (D-degrade, ledger_error) ; `sentinel_run_re_acquires_lock_after_clean_exit` (D-lock finally) ; `sentinel_run_releases_chainstack_lock_on_sigterm` (D-lock SIGTERM, **skip win32 déclaré non vacueux**, RUNS sur CI Linux). Grep : `sentinel_src_clean_and_allowlist_load_bearing` (portée `apps/sentinel/src/**`, 2 entrées). Items -1c : `sentinel_budget_env_is_validated` (+ « 0180 »/« 030 »), `sentinel_max_day_ms_covers_the_slowest_faulting_day`. Existants mis à jour : `sentinel_no_clock_env_is_read` (6 clés), `sentinel_normal_day_unchanged` (+`chainstack_guard`), `sentinel_chainstack_url_alone_degrades_to_keyless` (ex-`_publishes_redacted_and_flags`), `probe_chainstack_present_from_real_producer_line`.

## 6. Mutants (mutants.mjs) — 10 nommés, TOUS TUÉS + restaurés byte-exact (sha256)

`node F:\tmp\nops1d\mutants.mjs` ⇒ `ALL MUTANTS KILLED + RESTORED BYTE-EXACT (10 mutants)`, exit 0. Chacun : mutation transitoire (find unique), test rejoué sous `env -u` (A-7), assert ROUGE, restauration + sha256 == origine.

| Mutant | Fichier | Test tueur |
|---|---|---|
| `paid_leg_raw_fetch` | run.ts | `…writes_ledger_line_before_fetch` |
| `env_key_read_in_run_ts` | run.ts | `sentinel_src_clean_and_allowlist_load_bearing` |
| `origin_published_without_open` | run.ts | `…guard_open_failure_degrades…` |
| `no_lock_release_in_finally` | run.ts | `sentinel_run_re_acquires_lock_after_clean_exit` |
| `no_degrade_try_catch` | run.ts | `…guard_open_failure_degrades…` |
| `timeout_30s` | keyless-transport.ts | `sentinel_chainstack_leg_uses_20s_timeout` |
| `budget_leading_zero_accepted` | run.ts | `sentinel_budget_env_is_validated` |
| `max_day_success_only` | run.ts | `sentinel_max_day_ms_covers_the_slowest_faulting_day` |
| `keyless_transport_delisted` | (grep test) | `sentinel_src_clean_and_allowlist_load_bearing` |
| `chainstack_guard_hardcoded_ok` | run.ts | `…guard_open_failure_degrades…` |

## 7. Oracle (A-3 codes hors pipe ; A-7 `env -u`, A-2 `node_modules` isolé `mk-nm`)

`mk-nm.ps1 -Tree F:\Monark-wt-nops1d` ⇒ `entries: 220 monark: 10 fail: 0` ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-nops1d\packages\rpc-guard\src\index.ts` (A-2, résout vers le worktree).

`env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY npm run ci` ⇒ **exit 0** (`gate:vocab` + `typecheck` + `test`). **877 tests / 875 pass / 0 fail / 2 skipped.** `npm run lint` exit 0 ; `npm run lint:ratchet` exit 0 ; `node scripts/lang-gate.mjs` exit 0 ; **`npm run export:check` exit 0** (A-3). Base (arbre non touché) : 867 / 866 / 0 fail / 1 skip.

**Caps MESURÉS au G1 (D-caps : « le G1 MESURE … jamais devinés »)** — e2e `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock`, UN jour à pool dégradé (chainstack forcé dans chaque quorum) : `eth_getBlockByNumber` **19**, `eth_getLogs` **1**, `eth_call` **2** = **22 essais / 44 RU** ; 7 jours ⇒ ~154 essais / ~308 RU. Caps pinnés (2 000 / 20 000 RU / 2 000 par méthode) >> mesuré, >> borne de stress G0 M-7 (~322 / ~644 RU), << 16 M RU (le vrai plafond compte, option 1). Le test asserte chaque compte mesuré `> 0` et `<= cap`.

**Les 2 skips (0 fail ; « 0 skip » inatteignable, justifié) :**
1. `sentinel_run_releases_chainstack_lock_on_sigterm` — skip **win32 déclaré** (C-7) : « SIGTERM is not supported on Windows, it can be listened on » ([lu] §10) ⇒ le handler ne se déclenche pas sur win32 ; le corps est réel et S'EXÉCUTE sur CI (`ci.yml runs-on: ubuntu-latest`). Non vacueux : le mécanisme de relâche (unlock + unlink + re-acquisition) est prouvé CROSS-plateforme par `sentinel_run_re_acquires_lock_after_clean_exit` (vert sur win32) ; seule la livraison du signal au handler est Linux.
2. `u4b_labels_replay_via_main_real_artifact` — skip **pré-existant** (artefacts e2 gitignorés hors dépôt), PAS de ce lot.

## 8. R-25 (A-5, pathspec VERBATIM `ci.yml:65`)

`git diff --shortstat HEAD -- .` avec les exclusions `:(exclude,glob)docs/**/*.md` … `apps/bell/test/fixtures/series/**` (nouveaux fichiers inclus via `git add -N` puis `git reset`) ⇒ **8 fichiers, 604 insertions(+), 93 deletions(-) = 697 lignes < 1 150** (seuil A-5/mission ; < 1 205 CI). Aucune couture nécessaire. Ventilation ≈ : run.ts 214 ; chainstack-guard.test 307 ; grep test 58 ; catchup-budget.test 34 ; retry.test 21 ; probe-narabi.test 18 ; keyless-transport 35 ; deploy 10. Docs (ADR/RUNBOOK) EXCLUS.

## 9. Invariants byte-identiques AVANT/APRÈS (A-6) — 9 fichiers gelés U-4b INTACTS

`git diff --stat HEAD` sur les 9 gelés + `docs/adr/ADR-U4b-…md` = **VIDE**. LF sha256 (préfixes, == ADR-U4b D4 §3) : `u4b-scores.mjs 2f9a31f6` ; `u4b-reduce.mjs a5e66cd3` ; `record-u4b-calib.mjs 5733daeb` ; `wadray.ts 7bee76fc` ; `abi.ts 3376eb08` ; `l1-split.ts 9206df91` ; **`rpc.ts 0e232519` (== valeur de gel D4)** ; `calib-digest.ts 3603265d` ; `u3-realized.mjs cb020425`. Autres invariants : `line_hash`/`prev_line_hash`/`book_digest` INCHANGÉS (test `…_ok_ledgers_publishes_origin_…` : `written.line_hash === l3.line_hash`) ; `sentinel_sha` DÉRIVE (déclarée, hors hash — nouveau module top-level + `run.ts` ; M-11) ⇒ `timeline.jsonl` n'est PAS byte-identique (le `line_hash` l'est) — la comparaison porte sur `line_hash`, jamais sur les octets bruts de la ligne (dérive `endpoints`/`sentinel_sha` assumée).

## 10. Sources [abs] → [lu] (C-7, doc 03) — les 3 lues cette session

- **Node.js « Signal events »** (nodejs.org/api/process.html, [lu] 2026-09-22 via WebFetch) : « If one of these signals has a listener installed, its default behavior will be removed. » et « `'SIGTERM'` is not supported on Windows, it can be listened on. » ⇒ le handler DOIT `process.exit` (fait) ; win32 ne délivre pas le signal (fonde le skip C-7).
- **systemd.service(5)** (man7.org, [lu] ; freedesktop.org a renvoyé **HTTP 403 — non contourné**, man7.org = mirror normatif) : « If a daemon service does not signal start-up completion within the configured time, the service will be considered failed and will be shut down again. » ; « the service gets the SIGTERM immediately » ; `TimeoutStartFailureMode` défaut « terminate ».
- **systemd.kill(5)** (man7.org, [lu]) : `KillSignal=` « Defaults to SIGTERM. » ; « the delay configured via the `TimeoutStopSec=` has passed … the termination request is repeated with the SIGKILL signal » ; `KillMode` « Defaults to control-group. » ⇒ TimeoutStartSec → SIGTERM (handler `run.ts` sur Linux → unlock) puis SIGKILL après TimeoutStopSec (rare → RUNBOOK unlock, D-lock iii).

## 11. Items formés (zéro dette nue — propriétaire + déclencheur)

1. **SUPPRESSION du code mort de `rpc.ts` + RÉTRACTION de l'allowlist + CO-ÉDITS de tests** (le cœur déféré du gel). Dans `rpc.ts` : supprimer `chainstackUrl` (`:50-56`), `poolEndpoints` (`:58-64`), `publishedEndpoints` (`:66-72`), `hasChainstack` (`:74-78`), `defaultCall` (`:121-133`) ET retirer le défaut `?? defaultCall` de `makeRpcPool` (⇒ `call` INJECTÉ requis — **vérifié** : `sentinel-retry`, `sentinel-catchup-budget`, `sentinel-chainstack-guard` et `run.ts` injectent TOUJOURS `call`). Dans `test/rpc-guard-fetch-only-inside-client.test.ts` : retirer l'entrée `apps/sentinel/src/rpc.ts` de `SENTINEL_ALLOW`. **CO-ÉDITS OBLIGATOIRES au rebase** (sinon import/assert cassés) : `apps/sentinel/test/sentinel-retry.test.ts` importe (`:17`) `publishedEndpoints, poolEndpoints` et asserte dessus (test 1 `:214/:219`, test 3 `:265-266`) — retirer ces deux imports + ces assertions unitaires, garder `redactEndpoint`/`providerOf`/`PUBLIC_ENDPOINTS`/`makeRpcPool`. **Propriétaire** : orchestrateur. **Déclencheur** : clôture de la course U-4b-1b (gel levé), au REBASE annoncé, AVANT G2 — la non-vacuité par entrée fait alors rougir l'entrée `rpc.ts` restée (retrait dû, auto-forcé).
2. **Amendement ADR-U4b D4** (C-2) : AVANT/APRÈS sha `rpc.ts` (§12). **Déclencheur** : le même rebase.
3. **Amendements ADR-NARABI-OPS-1 + ADR-GARDE-HELIUS A-1/A-4 « par compte »** (§12). Propriétaire orchestrateur.
4. **D-lock (ii) reclaim** au démarrage (tension C-9 déclarée) : NON pris (ruling Q3 = (i)+(iii)). Déclencheur : ruling motivé.
5. **Surface servie consommant le ledger VPS** (au-delà de l'acte manuel A-4) : hors lot. Déclencheur : besoin d'automatiser.
6. **Relâche de la contrainte no-overlap de 118** au rapprochement (Narabi ledgéré) : coordination prereg. Déclencheur : prereg.
7. **Dérive origine D-published(b)** : `CHAINSTACK_ETH_ORIGIN` doit == `providerOf` réel de `CHAINSTACK_ETH_URL` (posé au redéploiement) — résiduel DÉCLARÉ (pas de couture inter-module dans ce lot ; la sonde lit l'origine). Déclencheur : redéploiement.
8. **`chainstack_present:false` non alerté par la sonde** (Q9) : un défaut de garde est visible (`chainstack_guard`) mais silencieux par mail. Item, co-modif sonde Bell hors lot. Déclencheur : décision d'alerte.

## 12. Amendements ADR proposés (R-20 : insérés par l'orchestrateur ; texte pour vérification)

- **ADR-U4b D4 (C-2)** : « `apps/sentinel/src/rpc.ts` — AVANT `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` (gel actif jusqu'à la clôture de U-4b-1b ; byte-identique au G1 de -1d) ; APRÈS = **recomputé au commit du rebase -1d** après la suppression du jeu mort (item §11-1) — ÉCART = STOP si le prereg le re-gèle entre-temps. » Le gel de la course -1b clos ; re-gel dû à la calibration suivante = item.
- **ADR-NARABI-OPS-1 (amendement daté)** : chemin payant sous garde (route α) ; `keyless-transport.ts` = 2ᵉ site fetch allowlisté ; `chainstack_guard ∈ {ok,unconfigured,lock_held,ledger_error,config_error}` ; D-degrade (jamais FATAL) ; D-lock (finally + SIGTERM + RUNBOOK) ; timeout 20 s ; **correction de la dérive D3 « 8 free endpoints »/« ninth operator » → 7 publics + 1 garde = 8ᵉ** ; le texte `ensureCycleDir` mentionne `HELIUS_LEDGER_DIR` (impropre en contexte Narabi) — item de libellé paquet.
- **ADR-GARDE-HELIUS A-1/A-4 « par compte » (décision 121, inter-machines)** : Option 1 = ledgers locaux par machine + floor importé (mécanisme 121) ; le ledger Chainstack VPS devient source du minorant A-4 (essais × 1 RU plancher, jamais `credits_derived`).

## 13. RUNBOOK §6 — ajouts proposés (2ᵈ redéploiement pré-enregistré, C-5)

`install -d -o sentinel -g sentinel -m 0750 /var/lib/monark-sentinel/ledger` **AVANT** le dry-run (le dry-run prend désormais le verrou et écrit de VRAIES lignes write-ahead) ; poser `CHAINSTACK_CYCLE_ID` (== cycle Ukemi), `CHAINSTACK_ETH_ORIGIN` (== origine de `CHAINSTACK_ETH_URL`), `CHAINSTACK_CYCLE_FLOOR` dans `sentinel.env` ; contrôle de résolution `sudo -u sentinel node -e "import('@monark/rpc-guard')"` ; 1er run réel : `exit_code 0`, `stopped null`, `chainstack true`, **`chainstack_guard ok`**, 8 `endpoints` dont l'origine `chainstack.com`, ≥ 1 ligne ledger portant `network`, **aucun `.lock` après `Deactivated`** ; STOP/rollback si `chainstack_guard != ok` ou `.lock` résiduel ; réparation SIGKILL : `runCli unlock --op chainstack --reason <fixe> --cycle <id>` (D-lock iii).

## 14. MAST (C-8) — résiduel

FM-2.4 (test fabriquant son entrée) → contré A-8 (corps de forme réelle : enveloppe succès + objet `error` JSON-RPC). FM-3.3 (mesure sous clé ambiante) → contré A-7 (`env -u` sur oracle + mutants). Fuite de clé → la clé n'est lue que par le transport du garde ; `run.ts` = 0 hit KEY/KEY_BARE (grep vert, portée `apps/sentinel/src/**`). Panne de publication par défaut de garde → D-degrade (try/catch ⇒ keyless publié). Mensonge de provenance (origine ≠ URL) → item §11-7. Aucun gate suspendu (R-22).

## 15. Consigne standard G1 — point par point

- **A-1** fait (1ʳᵉ ligne `claude-opus-4-8[1m]`). **A-2** fait (`mk-nm`, `require.resolve` → worktree). **A-3** fait (codes hors pipe ; oracle complet : `gate:vocab`+`typecheck`+`test`+`lint`+`lint:ratchet`+`lang:gate`+`export:check`, tous exit 0). **A-4** fait (`DELIVERED.sha256`, rendus sous `F:\tmp\nops1d`, aucun commit, rien sur `C:`, aucun réseau — fetch bouchonné, clés factices `.test`/`.example`/`.invalid`). **A-5** fait (697 < 1 150). **A-6** fait (§9). **A-7** fait (`env -u` partout). **A-8** fait (`_consumes_real_form_bodies` + e2e corps réels). **A-9** n-a. **A-10** fait (liage de sortie servie : `chainstack_guard`/origine assertés sur la ligne réelle + mutants type-valides `chainstack_guard_hardcoded_ok`/`origin_published_without_open`). **A-G-1** fait (décisions 118/121 relues et citées).
- **B-1..B-6** : B-4 **DÉVIATION MOTIVÉE** (pas « fait » à la lettre) : B-4 exige opérateurs/cycle en args CLI REQUIS ; ici `run.ts` lit le cycle/floor/origine de l'ENV (clés NON secrètes) avec absent ⇒ D-degrade — imposé par l'invariant BLOQUANT D-degrade ET par l'option 1 (décision 121) ; la CLÉ payante n'est jamais lue par `run.ts` (transport du garde seul) ni sondée (`run.ts` = 0 hit KEY/KEY_BARE). B-5 fait (`Map<path,trigger>` non-vacuité par entrée + mutant `keyless_transport_delisted`). B-1/B-2/B-3/B-6 : dans le transport du garde (paquet, hors lot ; inchangé).
- **C-1..C-4** : n-a (identités d'erreur/retry vivent dans le paquet ; `run.ts` consomme `client.call` 1 tentative, retry au pool ; `BudgetExceededError` importée, `instanceof` stable pour `classifyGuardOpenError`).
- **D-1** fait (chaque test imposé a son mutant ROUGE rejoué par `mutants.mjs`, restauration sha). **D-2** fait. **D-3** fait (IT non-LLM seul `globalThis.fetch` bouchonné). **D-4** fait (tests HEAD adaptés, diff annoté + / − ; aucune assertion affaiblie — l'ancien « URL seule → chainstack » est SUPERSÉDÉ, pas affaibli).
- **E-1** fait (verrou `wx` du garde ; SIGTERM/finally récupèrent ; `unlock` re-acquérable — test). **E-2** fait (ledger durable hors dossier de travail, parent pré-existant C-8, jamais reset-on-missing). **E-3** : cooldowns du pool inchangés.
- **F-1** fait (Tuyaux §4 ; aucun renvoi vers `F:\tmp` dans les sources ; résidus §11). **F-2** fait (ASCII, `gate:vocab`/`lang-gate` verts). **F-3** fait (déviations §16).

## 16. Déviations déclarées (F-3 ; jamais un contournement)

- **DEV-1** : la migration est STAGED (§0) — `rpc.ts` byte-identique, code mort allowlisté, suppression = item §11-1 au rebase. Motif : gel U-4b actif ; non contournant (migration fonctionnelle complète, clé non lue à l'exécution).
- **DEV-2** : tests HEAD `sentinel-retry`/`probe-narabi`/`catchup-budget` mis à jour (comportement migré) — D-4 annoté ; `error_origin` = plan (le G0 ne les avait pas listés comme dépendants du comportement « URL seule → chainstack »).
- **DEV-3** : `sentinel_sha`/`endpoints` dérivent ⇒ `timeline.jsonl` non byte-identique ; l'invariant tenu est `line_hash` (M-11). Non une régression : provenance hors hash.
- **DEV-4** : freedesktop.org 403 (non contourné) ⇒ systemd via man7.org (mirror normatif). §10.
- **DEV-5** : « 0 skip » inatteignable (skip pré-existant + skip win32 C-7 mandaté) ⇒ 0 fail, 2 skips justifiés (§7).

---
**R-1** `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié). **R-20** aucun commit, aucun workflow, aucune insertion ADR (proposées). **R-21** chaque affirmation → preuve reproductible (commandes, tests, sha, mutants). **R-22** aucun gate suspendu.

Rendus durables : `F:\tmp\nops1d\G1.md`, `F:\tmp\nops1d\DELIVERED.sha256`, `F:\tmp\nops1d\mutants.mjs`. Worktree : `F:\Monark-wt-nops1d` (branche `lot/narabi-ops-1d`, base `1f4b746`) — 2 fichiers neufs + 6 modifiés, 9 gelés byte-identiques. **STOP formé §11-1** : la suppression du code mort de `rpc.ts` + rétraction d'allowlist + co-édits sont déférées au rebase post-clôture U-4b-1b (gel actif interdit de toucher `rpc.ts` maintenant ; non contourné).
