Modèle résolu (R-1) : claude-opus-5-5 (Claude Opus 5.5), effort max, G1 du lot M-7, instance fraîche (aucun agent de M-6, M-5b, M-8b).

# G1 — lot M-7 « relance sur limite de compte » : `scripts/mission/relance.mjs` (ADR-METHODE-2 D8b, ligne M-7 l.52)

- Mission générée par `F:/Monark/scripts/mission/gen.mjs` (`aca75444`, sha256 `9eecb371…`, 2026-09-29T08:30:23Z), palier `claude-opus-5-5`, effort `max` (décisions 262, 267 ; D12 (h)) ; base tronc `aca75444f04a8881721cb6c6789e759448b5fc7e`, branche `lot/methode-m7`, worktree `F:/Monark-wt-m7` (HEAD `aca75444`, modifié EN PLACE, aucun git écrivant : le gel est un acte de l orchestrateur) ; ancre `docs/adr/ADR-METHODE-2.md:52` (G0 daté 07:5x UTC + pli cp-1 daté 08:3x UTC).
- Outils du tronc vérifiés par sha256 à 2026-09-29T09:02:42Z, égaux à l en-tête : `red-proof.mjs` `6869fa3d…`, `oracle/run.mjs` `baad946c…`, `oracle/r25.mjs` `4d0544df…`, `mission/launch.mjs` `fb6c277f…`, `mission/lint.mjs` `4d1383c8…`. Node v24.15.0.
- Cadre tenu : `F:/claude-config` lu seulement (aucun `--out` dessous) ; aucun réseau ; rien sur C: ; TEMP `F:/tmp/methode/m7/g1/tmp` ; clones `--no-local` sous `F:/tmp/methode/m7/g1/` ; jonctions `node_modules` par `mk-nm.ps1` (09:00Z) retirées par `rm-nm.ps1` avant le rendu ; R-20 (aucun commit, aucun workflow).

## 0. Étapes (`date -u`)

| UTC | étape |
|---|---|
| 08:32:42 | lecture du worktree (propre, `aca75444`), de l ADR (l.23, l.28, l.52, D12, « Ce qui ne change pas »), du cp-1 (`fb265b22…`), des en-têtes d outils, des tests d hygiène, de CHANTIERS 08:00 et 08:26 |
| 08:42:54 | recensement en lecture seule des runs réels (§ 1) ; découverte des deux queues NUL (§ 1.3) |
| 08:55:54 | fixture réelle copiée verbatim (§ 4.3) |
| 09:00:32 | premier passage des tests (23/24 : identifiants d agent de test hors forme mesurée, corrigés) |
| 09:00:55 - 09:01:44 | typecheck vert ; lint vert ; `lint:ratchet` 69/69 (plafond inchangé) |
| 09:02:26 | hygiène sur clone gelé (45/45) |
| 09:03:01 - 09:03:50 | F2P tour 1 (3/3 puis 24/24 tués) |
| 09:06:35 - 09:07:43 | mutants tour 1 : 23 tués, M23 `red-other` (RangeError, pas ERR_ASSERTION) |
| 09:08:59 - 09:10:59 | test 24 renforcé (cas CLI), F2P tour 2, mutants tour 2 : M23 encore `red-other` (l appel direct lève avant le cas CLI) |
| 09:11:26 - 09:13:46 | test 24 réordonné (cas CLI d abord), F2P tour 3 (FINAL), mutants tour 3 (FINAL) : 24/24 tués |
| 09:14:05 - 09:14:24 | rejeu d histoire réelle (§ 6) |
| 09:15:13 | R-25 = 440 (§ 7) |
| 09:16:09 | hygiène finale sur clone gelé (45/45) |
| 09:16:41 - 09:24:19 | oracle G1 : exit 0, 1 649 tests (§ 8) |
| 09:24:32 - 09:27:57 | journal complété, jonctions retirées (09:25Z), hygiène avec journal suivi (09:25:53Z), livrables scellés (§ 15) ; fin de rédaction 2026-09-29T09:27:57Z (`date -u`) |

## 1. Lecture et relevé des runs réels (tâche 1 ; lecture seule)

Méthode : scripts de lecture sous `F:/tmp/methode/m7/g1/tmp/` (`jsum.mjs` résume un journal sans imprimer les `result` ; `tsum.mjs` imprime compte, premier et dernier `timestamp` et les champs de premier niveau de la dernière ligne synthétique ; `resumes.mjs` liste les `tool_use` `Workflow` portant `resumeFromRunId` dans `e03dd7cc-….jsonl`). Aucune écriture sous `F:/claude-config`. La transcription de 2,5 Mo de `wf_e7b17809-969` : seule sa dernière ligne est imprimée (ligne 719/719 = la ligne synthétique).

### 1.1 Les quatre runs repris

| run | lignes (état courant) | `journal_lines` avant reprise | `failed` à la borne | `stored` à la borne | morte sans `failed` | reprise (`tool_use`, ligne de `e03dd7cc-….jsonl`) |
|---|---|---|---|---|---|---|
| `wf_682419e6-d20` | 37 | **19** | 8 : KS-P01, P02, P03, P04a, P04c, P05, P16, `synthese-lectures` | 1 : KS-P04b (`aefb2d2dc4730e372`, 03:46:23Z → 03:57:18Z) | 0 | 2026-09-27T05:21:52.802Z (l.10797) |
| `wf_2dd4ebc4-88a` | 4 | **3** | 1 : `g1-pr2-1` (`a1ee12694a5c1a3fd`) | 0 | 0 | 2026-09-27T05:21:51.174Z (l.10795) |
| `wf_a3fedd81-47e` | 4 | **2** | 0 | 0 | 1 : `etude:retro-price` (`aac703d46f6926c83`, dernière écriture 14:52:49.238Z) | 2026-09-27T14:53:12.285Z (l.18741, 23045, 25863 : trois `tool_use` à la même milliseconde) |
| `wf_c90635a2-8a8` | 4 | **2** | 0 | 0 | 1 : `cp1ter:adr-methode-2` (`a51501054bb9c3375`, dernière écriture 04:32:16.941Z, dernière ligne `assistant` `claude-fable-5-1`) | 2026-09-28T04:32:50.991Z (l.30503) |

`journal_lines` = rang du dernier enregistrement antérieur au premier `started` de reprise (premier `started` d une clé déjà démarrée : l.20, l.4, l.3, l.3). Après la borne : `wf_682419e6-d20` : 8 `started` des lectures (les 7 `failed` et KS-P04b), 8 `result` non nuls, puis une clé de synthèse NEUVE (`v2:1a26cabb…`, `a7f34bcaed99a7994`, même `label` et `phase`) démarrée et servie ; `wf_2dd4ebc4-88a` : 1 `started` (`afe8f7db4c81c7b65`, transcription 05:21:51.240Z → 05:22:07.856Z, 32 lignes, dernière ligne `user`, aucune ligne synthétique), ni `result` ni `failed` ; `wf_a3fedd81-47e` et `wf_c90635a2-8a8` : 1 `started` + 1 `result` non nul. Scripts persistés présents : `lecture-procurements-kaizen-wf_682419e6-d20.js`, `g1-pr2-1-dojo-wf_2dd4ebc4-88a.js`, `etude-retro-price-wf_a3fedd81-47e.js`, `cp1-ter-adr-methode-2-wf_c90635a2-8a8.js` (sous `<session>/workflows/scripts/`).

Dernière ligne des 8 transcriptions `failed` de `wf_682419e6-d20` et de `a1ee12694a5c1a3fd` (9 au total) : `model:"<synthetic>"`, `error:"rate_limit"`, `apiErrorStatus:429`, `quotaLimits.resetsAt:1790486400` (= 2026-09-27T05:20:00Z), `rateLimitType:"five_hour"`, texte « … resets 6:20am (Europe/London) » ; horodatages 03:59:21Z à 04:02:41Z (synthèse `a9a2198e3a9fcf81a` : 04:02:41.659Z, 12 lignes).

**Comparaison au cp-1 § 3 : aucun écart.** 4/4 reprises prolongent le même journal (un seul `launched`) ; 7 clés `failed` rejouées à clé identique, 1 remplacée (synthèse, clé neuve), 1 clé `stored` rejouée (KS-P04b : `a55cf74838261cc9a` 05:21:53.801Z → 05:36:24.265Z, 870,464 s) ; `wf_2dd4ebc4-88a` : rejouée puis morte sans `failed` en 16,6 s ; deux reprises de clés mortes sans `failed`. Borne 19 = cp-1 § 14 (iii).

### 1.2 Les deux runs non repris cités

- `wf_7a7438e9-085` : 3 lignes (`launched`, `started` `g2:m8:rr3` / « Re-revue 3 G2 M-8 » `aa4bde63bbfa710ca`, `failed`) ; dernière ligne de la transcription (224/224, 2026-09-28T17:38:25.555Z) : synthétique, « You've hit your weekly limit · resets Oct 1, 11am (Europe/London) », `resetsAt:1790848800` (= 2026-10-01T10:00:00Z), `rateLimitType:"seven_day"` ; c est la fixture réelle (§ 4.3).
- `wf_e7b17809-969` : 3 lignes (`failed` `corr:RG-1a`, `a9cdd3d8d46173eb1`) ; dernière ligne (719/719, 2026-09-27T21:40:42.536Z) : synthétique « … resets 12:40am (Europe/London) », `resetsAt:1790552400` (= 2026-09-27T23:40:00Z), `five_hour`.

### 1.3 Recensement complet (08:42:54Z, lecture seule, `census*.mjs`)

155 journaux à cet instant (154 du cp-1 + le run de ce G1 ; un 156e, `wf_44ad00eb-257` « corr1 M-6 », est apparu depuis) : `launched` 155 (exactement un par journal, toujours en tête : 155/155), `started` 295, `result` 257, `failed` 21 ; tous les journaux finissent par LF, aucune ligne vide, aucune ligne illisible ; `label` et `phase` chaînes sur 295/295 `started` ; `agentId` de forme `a` + 16 hexadécimaux sur tous les enregistrements. 295 transcriptions : aucune ligne vide ; toute ligne complète porte un `timestamp` de premier niveau ; **2 transcriptions finissent par une queue de NUL non terminée** (fichier étendu non écrit, signature d une coupure de courant) : `wf_481286eb-fab/agent-a1413b445b3c72a15.jsonl` (ligne 551/551, 10 951 octets, mtime 2026-09-28T13:52:10Z) et `wf_c34778f4-c98/agent-a4a0459ba8d9cf609.jsonl` (ligne 623/623, 6 775 octets, mtime 2026-09-28T09:14:09Z) : les deux coupures d hôte du 28/09 (METHODE-POWER-1), clés `started` sans issue. Fait porté dans l outil (§ 3, règle de la ligne non terminée) et dans les tests (test 9).

Hors entrées du lot (non lus au-delà de leur forme) : `<session>/workflows/wf_<runId>.json` (129 dans `e03dd7cc`) porte `runId`, `status`, `args`, `result`, `phases`, `workflowProgress` : source possible de RELANCE-TWO-DIRS-1 et des `args` (hors lot).

## 2. Décisions portées (275-d, citées, non rediscutées) et lectures déclarées

Décisions de la mission appliquées telles qu écrites : un outil `scripts/mission/relance.mjs` ≤ 80 l., Node 24, zéro dépendance, imports `node:` seuls, import-safe (garde `main` sur `process.argv[1]`, motif `red-proof.mjs`) ; `--run` et `--verify` avec `--now` (obligatoire dans les tests), `--stale` (30) ; classement à quatre états par le DERNIER enregistrement de la clé ; epoch d abord (`quotaLimits.resetsAt`, `rateLimitType`), texte en repli (formes `h:mmam|pm` et `Mon D, h[:mm]am|pm`, fuseau IANA par `Intl.DateTimeFormat`, forme sans date = premier instant ≥ `--now`), `divergence` nommée au-delà de 60 s, epoch retenu ; sortie `monark.relance.v1` écrite dans `--out` ET imprimée, dernière ligne `relance-result {"exit","record","sha256"}` ; exit 0/1/2 ; `--verify` sur le même journal (`relaunched`, `replaced` par `label` + `phase`, `served-from-cache` ⇒ 1, `null-served` ⇒ 1, `replayed` rapporté ⇒ 0, `--from` au-delà ⇒ 2) ; jamais de relance, d édition ni d écriture dans le run ; fixtures synthétiques ≤ 40 lignes + fixture réelle verbatim ; hors lot : deux dossiers (RELANCE-TWO-DIRS-1), relance des `dead` (Q-V-2, METHODE-POWER-1), notification, quota.

Lectures d interprétation déclarées (chacune testée, chacune reprise en Q-M7-n si un arbitrage est utile) :
- `cause` inconnue s écrit `"unknown"` (code anglais, porte `lang:gate`) = « inconnue » de la mission (Q-M7-2).
- Une ligne non terminée en fin de transcription est écartée (règle JSONL ; la queue NUL de § 1.3) ; toute autre ligne non JSON ⇒ exit 2. Côté journal, une dernière ligne non terminée ⇒ exit 2 (155/155 journaux finissent par LF) (Q-M7-7).
- Forme fermée mesurée, en refus nommé (FM-3.2) : premier enregistrement `launched` et seul `launched` (155/155), type hors des quatre, champ mesuré absent, `agentId` hors `^a[0-9a-f]+$` (garde aussi le chemin `agent-<agentId>.jsonl`), journal vide (Q-M7-6).
- Forme datée : l année dont l instant est le plus proche de `--now` (« Oct 1, 11am » lu après le 1er octobre reste 2026).
- `--verify` : une clé `failed` redémarrée après la borne sans `result` non nul prend l état courant de la clé qui répond (`failed` de nouveau, `dead`, `running`), exit 1 ; aucun enregistrement après la borne ⇒ `failed` conservé, exit 1 (jamais `served-from-cache`) ; les clés `dead`/`running` d origine sont rapportées telles quelles, hors des compteurs ; `verify.replayed` = `{keys, seconds}` (le coût : nombre et durée premier → dernier `timestamp` des transcriptions rejouées, `null` si un horodatage manque) ; l entrée d une clé vérifiée garde la clé d origine et prend l état courant de la clé qui répond (Q-M7-3, Q-M7-4).
- `--stale` accepté par `--verify` aussi (l état d origine `dead`/`running` en dépend) ; `resume` et `resume_at` valent `null` sans clé `failed` (Q-M7-4, Q-M7-5).
- `--now` exige la forme ISO avec décalage explicite (`Z` ou `±hh:mm`) : jamais l heure locale de l hôte.

## 3. L outil

`scripts/mission/relance.mjs` : **80 lignes** (en-tête 4 lignes ; les règles de chaque export sont écrites en JSDoc dans `scripts/mission/relance.d.mts`, 59 lignes, surface de types exigée par `typecheck` : l import d un `.mjs` sans déclaration est TS7016 sous `strict`) ; sha256 `570189ea209a90b9b05a74021c8d875e911f8ab71086db9acbb93c2bf9b70c0c`. Exports purs : `parseResets(text, now)`, `resetsOf(line, now)`, `classify(records, transcripts, now, staleMin = 30)`, `verify(records, from, transcripts = {}, now, staleMin = 30)` ; `main(argv)` ; garde `main`. Seule écriture : `--out` (refusé à l intérieur du dossier du run, `path.relative`). Aucun `spawn`, aucun réseau, aucune édition de script.

Densité : la borne de 80 lignes, en-tête compris, est tenue au prix de lignes longues (17 lignes > 200 caractères, maximum 330 ; précédent de style : `red-proof.mjs`) ; risque de lisibilité signalé au G2 (Q-M7-9).

Vérifications locales (worktree, jonctions) : `tsc --noEmit` exit 0 (09:00:55Z, puis après chaque retouche des tests) ; `eslint test/mission-relance.test.ts` exit 0 (le `.mjs` et le `.d.mts` sont hors programme ESLint par configuration) ; `node scripts/lint-ratchet.mjs` : 69/69 (l apport de ce test = 0 : `JSON.parse` toujours typé à la source) ; `lang-gate`, `gate:vocab`, `export:check` : exit 0.

## 4. Tests (`test/mission-relance.test.ts`, 276 lignes, sha256 `74f707b5…`) et preuve F2P

### 4.1 Les 24 tests et leur tueur (`// killer:` au-dessus de chaque `test(`, forme de `parseKiller`)

| # | test | tueur (`scripts/mission/relance.mjs`) | tirage « tous » |
|---|---|---|---|
| 1 | `run_real_weekly_limit_fixture_takes_the_epoch_and_the_type` (fixture réelle : 1 `failed`, `seven_day`, 2026-10-01T10:00:00.000Z, `divergence` null, `script` null, `journal_lines` 3, `resume`, dernière ligne `relance-result` et sha256 du fichier) | l.26 CONST `q.rateLimitType ?? "unknown"` → `"unknown"` | tué |
| 2 | `run_session_and_weekly_texts_agree_with_their_epoch` | l.17 CONST `% 12` → `% 24` | tué |
| 3 | `run_divergent_text_is_named_and_the_epoch_kept` (texte 11:40pm contre epoch 23:40Z : `divergence` {22:40Z, 3600 s}) | l.26 CONST `epoch ?? (` → `(` | tué |
| 4 | `run_failed_key_without_a_synthetic_line_is_unknown_at_now` (+ détection par 429 seul, par `rate_limit` seul, refus d une ligne non synthétique) | l.23 CONST `cause: "unknown"` → `cause: "rate_limit"` | tué |
| 5 | `run_null_result_is_failed_v4` | l.33 COR ` && last.result !== null` → `` | tué |
| 6 | `run_non_null_result_is_stored` (+ `verdict` exact) | l.33 CONST `? "stored" :` → `? "failed" :` | tué |
| 7 | `run_started_key_with_a_recent_transcript_is_running_under_the_default_stale` (+ transcription absente ⇒ `dead` ; `--stale 10` ⇒ `dead`) | l.68 CONST `stale = Number(o.stale ?? 30)` → `?? 0` | tué |
| 8 | `classify_dead_running_boundary_is_exactly_stale_minutes` (dernier `timestamp` = now − 30 min exactement ⇒ `running` ; 1 ms de plus ⇒ `dead` ; absente, vide ⇒ `dead` ; même frontière à 5 min ; une ligne synthétique ne rend jamais une clé `failed` : FM-2.4) | l.33 ROR `stamp >= t0` → `stamp > t0` | tué |
| 9 | `run_transcript_with_an_unterminated_nul_tail_reads_its_last_complete_line` (queue de 300 NUL, forme de § 1.3) | l.61 CONST `.slice(0, -1)` → `.slice(0, Infinity)` | tué |
| 10 | `parse_dateless_form_takes_the_first_instant_at_or_after_now` (12:40am avant minuit ⇒ 2026-09-27T23:40Z, après ⇒ 2026-09-28T23:40Z, à l instant même ⇒ lui ; les trois textes de session mesurés contre leur epoch) | l.19 ROR `t >= t0` → `t <= t0` | tué |
| 11 | `parse_dated_form_takes_the_year_closest_to_now` (« Oct 1, 11am » = epoch 1790848800 ; lu après le 1er octobre ⇒ 2026 ; « Jan 2, 11:30am » fin décembre ⇒ 2027 ; mois inconnu ⇒ null) | l.17 CONST `Number(m[2])` → `2` | tué |
| 12 | `parse_dateless_form_on_the_dst_fold_takes_the_first_of_two_instants_at_or_after_now` (1:30am le 2026-10-25, Europe/London : now 00:00Z ⇒ 00:30Z (BST) ; now 01:00Z ⇒ 01:30Z (GMT) ; fuseau inconnu ⇒ null) | l.18 CONST `L + 432e5` → `L + -432e5` | tué |
| 13 | `run_script_is_the_persisted_script_of_the_run_or_null` (trouvé ; script au nom du run absent ⇒ null ; pas de disposition de session ⇒ null ; exit inchangé) | l.71 CONST `=== "subagents"` → `=== "workflows"` | tué |
| 14 | `verify_failed_key_restarted_to_a_result_is_relaunched` | l.48 CONST `? "relaunched" :` → `? "replaced" :` | tué |
| 15 | `verify_failed_key_answered_by_a_new_key_of_its_label_and_phase_is_replaced` (+ même `label` autre `phase` ⇒ `served-from-cache` ; une clé neuve ne répond que pour une clé `failed`) | l.45 ROR `r.phase === k.phase` → `!==` | tué |
| 16 | `verify_failed_key_neither_restarted_nor_replaced_is_served_from_cache_exit_1` (+ rien après la borne ⇒ `failed`, exit 1) | l.52 CONST `? 1 : 0` → `? 0 : 0` | tué |
| 17 | `verify_null_result_after_the_bound_is_null_served_exit_1` (redémarrée vers `null` ; `null` servi sans `started`) | l.48 ROR `tail.result === null` → `!==` | tué |
| 18 | `verify_stored_key_restarted_is_replayed_and_reported_with_its_cost_exit_0` (horodatages réels de KS-P04b : 870,464 s ; sans horodatage : `null`) | l.43 CONST `status: "replayed"` → `status: "served-from-cache"` | tué |
| 19 | `verify_from_beyond_the_journal_exits_2` (`RangeError` ; CLI `--from 16` sur 15 lignes ⇒ 2 nommé ; `--from 15` ⇒ 1) | l.38 COR ` \|\| from > records.length` → `` | tué |
| 20 | `run_unreadable_run_exits_2_never_a_partial_class` (journal absent, vide, ligne non JSON, dernière ligne non terminée, type inconnu, second `launched`, premier enregistrement non `launched`, `agentId` hors forme, ligne de transcription non JSON : exit 2, aucun fichier écrit) | l.80 CONST `process.exitCode = 2` → `= 1` | tué |
| 21 | `run_never_writes_inside_the_run_directory` (`--out` dans le run ⇒ 2 nommé ; lecture normale ⇒ 1 ; dossier identique à l octet) | l.69 SDL | tué |
| 22 | `verify_cli_reads_the_same_journal_after_the_bound` (CLI : `relaunched`, `replaced`, `null-served`, 2 `served-from-cache`, `replayed`, `running`, `dead` ; compteurs ; `journal_lines` 22 ; verdict) | l.39 CONST `records.slice(from)` → `records.slice(0)` | tué |
| 23 | `cli_usage_errors_exit_2_and_write_nothing` (`--run` et `--verify` ensemble, `--from` avec `--run`, `--verify` sans `--from`, `--now` sans décalage, `--stale -1`, option inconnue) | l.67 SDL | tué |
| 24 | `resets_of_falls_back_to_the_text_when_the_epoch_is_absent` (CLI d abord : ligne synthétique sans `quotaLimits` ⇒ `resets_at` du texte 2026-09-28T05:20Z ; puis `resetsOf` pur : texte, sans heure ⇒ now, sans ligne ⇒ now) | l.26 CONST `: Date.parse(said)))` → `: Date.parse(now)))` | tué |

Compte : **24 tests neufs** (N = 24) ; fichier seul : 24/24 verts (spec, 2,3 s).

### 4.2 Preuve F2P (tour 3, FINAL, sur l état livré)

- `node F:/Monark/scripts/red-proof.mjs --base aca75444 --gel F:/Monark-wt-m7 --repo F:/tmp/methode/m7/g1/clone --out F:/tmp/methode/m7/g1/f2p-r3 --draw 3 --seed 2026` : **exit 0**, 24 jugés, 0 inchangé, 24 `new-module` (module `scripts/mission/relance.mjs` ajouté par le diff), 3 tirés, **3/3 tués** (tests 11, 9, 17 ; `killer-1.tap` `067fb56d…`, `killer-2.tap` `1c53de09…`, `killer-3.tap` `2d65a696…`) ; `RED-PROOF.json` sha256 `698f2c96a6b5044e4ef1fcafc4f3909abca6182a1589365b1ae6111d12a2ff4b` ; `gel.digest` `ca4570a37ec663d9831825ba21eaca26c9b79fd79be6f23c9a1850cbf251bb89` ; `base.tap` `ede42433…`, `gel.tap` `02239c04…`.
- Même commande `--draw 24` → `F:/tmp/methode/m7/g1/f2p-r3-all` : **exit 0**, **24/24 tués** ; `RED-PROOF.json` sha256 `f6f149dcf0eb630533b200dc9ee34cd31c46d52d613ba72a8bbba475c053f30d` (même `gel.digest`).
- Tours 1 et 2 (états antérieurs des tests, conservés comme historique) : `f2p` `f908b687…`, `f2p-all` `06c035d8…` (digest `840edce0…`) ; `f2p-r2` `4841adc1…`, `f2p-r2-all` `e351e268…` ; tous exit 0, tous tués. Le `gel.digest` exclut `docs/**/*.md` : ce journal ne le change pas.

### 4.3 Fixtures (`test/fixtures/relance/`, 25 lignes)

- Synthétiques, **21 lignes** (≤ 40), champs mesurés seuls : `sess/subagents/workflows/wf_fx-a/journal.jsonl` (15 lignes, 8 clés : deux `failed` aux deux formes de texte avec epoch concordant, une `failed` à texte divergent, une `failed` sans ligne synthétique, un `result` nul, un `stored`, une `started` à transcription de 20 min, une `started` sans transcription), 5 transcriptions d une ligne, `sess/workflows/scripts/fx-wf_fx-a.js` (1 ligne, script persisté factice, jamais exécuté).
- **Réelle, verbatim (C-V-4)**, 4 lignes : `real-wf_7a7438e9-085/journal.jsonl` = copie de `wf_7a7438e9-085/journal.jsonl` (sha256 `8955d6ee385bfa1cb83cf39699f3c1330e4d349b7146b4a913f7278784083601`, identique à la source) et `real-wf_7a7438e9-085/agent-aa4bde63bbfa710ca.jsonl` = la DERNIÈRE ligne de la transcription (`tail -n 1`, sha256 `3d3e7db2a1bcbc056fd442e1888527c5d7754cbe2a5a195343cbd1a41ea08702`, identique à celui de `tail -n 1` de la source ; la source entière `3783ac9d…`, 224 lignes, n est pas copiée). Vérifié : enregistrement du harnais (`model:"<synthetic>"`, `usage` à zéro, texte « You've hit your weekly limit · resets Oct 1, 11am (Europe/London) », `quotaLimits`, `requestId`, `sessionId`, `cwd`, `gitBranch`, `version`, `slug`) : **aucun contenu d agent**.
- Octets (09:00Z, `node` sur les fichiers) : 0 CR, 0 TAB, 0 NUL, 0 octet de contrôle, 0 point de code C1, fin par LF, sur les 11 fichiers livrés sous `scripts/mission/relance.*` et `test/fixtures/relance/`.

### 4.4 Hygiène sur les octets réels (tests du tronc, clone gelé où les fixtures sont SUIVIES)

Clone `F:/tmp/methode/m7/g1/r25/clone-a` (freeze `ac367073`, arbre `a9c4dddb…`, clone seul) : `node --test test/byte-guard.test.ts test/no-secret-in-repo.test.ts test/public-text-deny.test.ts test/mission-relance.test.ts` : **45/45** (09:16:09Z), TAP `F:/tmp/methode/m7/g1/hygiene/hygiene-final.tap` sha256 `234a4bd63a6008546416b6016e7c927e889b7db311c87a64e17568a68e5589db` ; dont `byte_guard_tracked_tree_is_clean` et `no_secret_in_repo` verts avec la fixture réelle suivie. `public-text-deny` ne lit que `docs/public-notes/**` : il passe sans lire ces octets (fait déclaré, pas une vérification de la fixture).

## 5. Mutants de l outil (tâche 6)

Table `F:/tmp/methode/m7/g1/mutants/mutants.mjs` (24 mutants, forme `{id, line, op, before, after, why}`, sha256 `2942a34c…`) ; harnais 54 lignes `run.mjs` (clone `--no-local` du worktree + non suivis copiés, sha vérifiés ; un lancement par clone ; refus sous verrou d oracle ; un mutant à la fois ; ancre unique sinon `anchor-lost` ; fichier de test entier en TAP ; restauration à l octet vérifiée ; `freemem` ≥ 4 096 Mo avant chaque mutant ; statut décidé au niveau TAP par `classify` de `red-proof.mjs` : tué = un test de tête `not ok` par ERR_ASSERTION ; survivant = tous `ok` ; non conclu = entrée `inconclusive`/manquante ; `red-other` = rouge sans ERR_ASSERTION, jamais compté tué).

Tour 3 (FINAL, `F:/tmp/methode/m7/g1/mutants-r3/`, 09:12:29Z → 09:13:46Z) : `sha0` `570189ea…` (= l outil livré), ligne de base 24/24 verts ; **24 tués, 0 survivant, 0 non conclu, 0 anchor-lost, 0 red-other** ; `RESULTS.json` `4e2f87e188648e3393313e4dae26a435b322a549026b5db22df85394ce2e0a3b`, `RESULTS.txt` `06c25eeabe97d929c50c90ede5938799da34d36d4b24c2292905c99cbeab10a1`, `run.mjs` `73460a99…`.

| id | l. | op | pourquoi (les dix premiers = la liste de la mission) | statut | tests rouges |
|---|---|---|---|---|---|
| M01 | 33 | CONST | `dead` classée `running` | tué | 5 |
| M02 | 26 | CONST | epoch ignoré au profit du texte | tué | 1 |
| M03 | 26 | CONST | divergence non nommée | tué | 1 |
| M04 | 43 | CONST | `replayed` compté `served-from-cache` | tué | 2 |
| M05 | 48 | CONST | `replaced` compté `served-from-cache` | tué | 2 |
| M06 | 39 | CONST | `--from` ignoré (origine lue sur tout le journal) | tué | 4 |
| M07 | 33 | COR | `result` nul compté `stored` | tué | 3 |
| M08 | 69 | SDL | écriture dans le dossier du run (garde retirée) | tué | 1 |
| M09 | 68 | CONST | `stale` à 0 (défaut CLI) | tué | 3 |
| M10 | 80 | CONST | exit 2 ⇒ 1 sur journal absent | tué | 4 |
| M11 | 28 | CONST | `stale` à 0 (défaut de `classify`) | tué | 1 |
| M12 | 10 | ROR | détection synthétique inversée | tué | 5 |
| M13 | 19 | ROR | « au moins now » devient « après now » | tué | 1 |
| M14 | 47 | SDL | une clé neuve répond pour deux clés `failed` | tué | 1 |
| M15 | 60 | CONST | `launched` unique en tête non vérifié | tué | 1 |
| M16 | 60 | CONST | forme d `agentId` non vérifiée | tué | 1 |
| M17 | 18 | CONST | pli d heure d été : l instant BST perdu | tué | 1 |
| M18 | 19 | ROR | forme datée : l année la plus lointaine | tué | 3 |
| M19 | 52 | COR | une clé `replaced` fait échouer `--verify` | tué | 1 |
| M20 | 74 | CONST | `resume_at` = la plus tôt | tué | 1 |
| M21 | 32 | CONST | vivant/mort sur le premier `timestamp` | tué | 1 |
| M22 | 41 | CONST | coût du rejeu négatif | tué | 1 |
| M23 | 25 | CONST | epoch absent pris pour la réinitialisation | tué | 1 |
| M24 | 61 | CONST | la queue non terminée lue comme une ligne | tué | 13 |

Historique (un lancement par clone, `RESULTS.txt` lu avant chaque tour suivant) : tour 1 (`mutants/`) et tour 2 (`mutants-r2/`) : 23 tués + M23 `red-other` (le test 24 levait `RangeError` avant toute assertion) ; correction : cas CLI ajouté puis placé en tête du test 24 (exit 2 de l outil muté ⇒ ERR_ASSERTION).

## 6. Rejeu d histoire réelle (tâche 7 ; CA-11 ; lecture seule)

`--out` sous `F:/tmp/methode/m7/g1/relance/` ; « tronqué » = copie sous `F:/tmp/methode/m7/g1/relance/copies/e03dd7cc-…/subagents/workflows/<run>/` du journal coupé à `journal_lines` (`head -n`), des transcriptions des agents de ces lignes et du script persisté (`<session>/workflows/scripts/`), l état d avant reprise ; « en place » = le dossier réel, journal prolongé, état courant. `--now` du `--run` = reprise réelle − 60 s ; `--now` du `--verify` = 2026-09-29T09:14:21Z (`date -u`).

| run | `--run` tronqué (avant reprise) | `--run` en place (état courant) | `--verify --from` (en place) |
|---|---|---|---|
| `wf_682419e6-d20` | exit 1 : **8 `failed`** (`five_hour`, `resets_at` 2026-09-27T05:20:00.000Z), **1 `stored`** ; `resume_at` 05:20:00Z ; script `lecture-procurements-kaizen-wf_682419e6-d20.js` ; `divergence` 86 400 s nommée sur les 8 (Q-M7-1) | exit 1 : 9 `stored`, 1 `failed` (l ancienne clé de synthèse, remplacée : Q-M7-8) | `--from 19` : exit 0 : **7 `relaunched`, 1 `replaced`, 1 `replayed` (870,464 s), 0 `served-from-cache`, 0 `null-served`** |
| `wf_2dd4ebc4-88a` | exit 1 : 1 `failed` (`five_hour`, 05:20:00Z) ; divergence 86 400 s | exit 0 : 1 `running` (la relance, horodatée après `--now`) | `--from 3` : exit 1 « not verified » : la clé relancée est **`dead`** (relance morte en 16,6 s sans `failed`) |
| `wf_a3fedd81-47e` | exit 0 : 1 **`running`** à reprise − 60 s (dernière écriture 14:52:49Z postérieure à `--now` : la borne `--stale` ne la couvre pas) ; `--now` 15:23:00Z : **`dead`** | exit 0 : 1 `stored` | `--from 2` : exit 0 : la clé rapportée **`dead`** hors des `failed`, compteurs à 0 |
| `wf_c90635a2-8a8` | exit 0 : 1 **`running`** à reprise − 60 s ; `--now` 2026-09-28T05:03:00Z : **`dead`** (= cp-1 § 6) | exit 0 : 1 `stored` | `--from 2` : exit 0 : la clé rapportée **`dead`** hors des `failed` |

Sorties (sha256 du fichier, dernière ligne `relance-result`) : `wf_682419e6-d20-run-truncated.json` `6290c94a…`, `-run-inplace.json` `b447298c…`, `-verify.json` `c167ebc3…` ; `wf_2dd4ebc4-88a-run-truncated.json` `48a8291f…`, `-run-inplace.json` `16258e90…`, `-verify.json` `5fe270e4…` ; `wf_a3fedd81-47e-run-truncated.json` `3c637e48…`, `-run-truncated-late.json` `334babef…`, `-run-inplace.json` `19885cf5…`, `-verify.json` `eacd0347…` ; `wf_c90635a2-8a8-run-truncated.json` `d2e63125…`, `-run-truncated-late.json` `a01a2ef0…`, `-run-inplace.json` `5ae94c94…`, `-verify.json` `04db5d6b…`.

Supplément (en place) : `wf_7a7438e9-085` (`--now` 2026-09-28T17:39:25Z) : exit 1, 1 `failed` `seven_day` 2026-10-01T10:00:00.000Z, aucune divergence (`ece63667…`) ; `wf_e7b17809-969` (`--now` 2026-09-27T21:41:42Z) : exit 1, 1 `failed` `five_hour` 2026-09-27T23:40:00.000Z, aucune divergence (`b8e24187…`) ; **les deux runs de coupure de courant** `wf_481286eb-fab` et `wf_c34778f4-c98` (`--now` 09:14:21Z) : exit 0, 1 **`dead`** chacun, lu sur la dernière ligne complète malgré la queue NUL (`0d02af8f…`, `1e9ab2b9…`) : l état `dead` de C-V-2 est atteint sur les artefacts réels de METHODE-POWER-1.

Écart avec le cp-1 § 3 et § 6 : **aucun** sur les états. Le cp-1 § 6 attendait « `--verify` sort 1 nommé rejeu sur KS-P04b » sous l ancienne règle (5) ; la décision Q-V-1 (`replayed` rapporté, exit 0) s applique : exit 0, `replayed` {1, 870,464 s}.

## 7. R-25

`r25()` de `F:/Monark/scripts/oracle/r25.mjs` (méthode de l oracle : clone `--no-local` du worktree, non suivis copiés et gelés dans un commit du clone, `aca75444...HEAD`, pathspec de `ci.yml` l.82) : sonde `F:/tmp/methode/m7/g1/r25/r25-probe.mjs`, sortie `R25-a.json` sha256 `0db191691427fc1065893a3797e6840cc5e327907189e93f6e458dd1e025cb8b` (09:15:13Z) : **STAT 440 insertions, 0 suppression, 440** ; CONTENT 0 ; GREEN ; **440 ≤ 547 (borne du lot) : pas de scission M-7b**. Ventilation (numstat, même pathspec) : outil 80, `.d.mts` 59, test 276, fixtures synthétiques 21, fixture réelle 4 ; cumul par étape : outil 80 → + `.d.mts` 139 → + fixtures 164 → + test 440. Ce journal (`docs/G1-lot-*.md`) est exclu par la pathspec. Écart à l estimation de la mission (≈ 80 + 150-200 + ≤ 50) : + 110 environ (test 276 lignes, `.d.mts` 59 lignes portant les règles sorties de l outil).

## 8. Oracle

`node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-m7 --base aca75444 --key M-7` (lancé 09:16:41Z après contrôle C-V-4 par `Get-CimInstance Win32_OperatingSystem` : 21 875 Mo libres, 10 `node.exe`, verrou libre ; relevé par l oracle sous verrou : 23 075 Mo, 9 `node.exe` ; attente de verrou 0 s ; aucune course ni harnais de ma part pendant sa suite) :
- enregistrement `F:/tmp/oracle-results/aca75444f04a8881721cb6c6789e759448b5fc7e-fa8b1c3c996b1beb-G1-20260929T091641Z-62692.json`, sha256 `dd1b70d15a3d47d1a505477afba55f98ddbdc3743d9ff2b205bc944a61a35dc0` (dernière ligne `oracle-result`, identique au sha recalculé) ;
- `tree.head` `aca75444f04a8881721cb6c6789e759448b5fc7e`, `tree.dirty` `fa8b1c3c996b1bebbbb54619ff7978ac356eba6e1e430b6826368c1b990fa330`, `tree.object` `a9c4dddb83f4badfbba8dd8e11b9b8b2deda8f8a` (= l arbre du clone gelé de R-25, § 7 : même contenu), `label` `M-7`, `static_only:false`, `served_from:null` (arbre non propre : jamais servi, D4), **exit 0** ; début 09:16:41Z, fin 09:24:19Z ;
- 9 portes vertes : `lint-model-pinning`, `r25` (STAT 440/0 ; CONTENT 0), `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet` (hors verrou), `test` (sous verrou, 398 s) ;
- **tests 1 649 = 1 625 + 24** (pass 1 645, fail 0, skip 4) ; les 24 tests neufs verts dans `09-test.log` (sha256 `2bfff7a1d087f9dcfa961ebbeb8c98ae045847dd41a8da69f813f8ddb4175ee1`) ;
- `residues.tmp_entries` 379 : même valeur dans les huit enregistrements G2, cp-2 et corr précédents du magasin (résidu de la suite ; le test de ce lot retire ses dossiers par `after`).
- Instantané de l oracle = état livré moins ce journal (écrit après la copie des non suivis par l oracle) : seul `docs/G1-lot-methode-m7.md` diffère, exclu de R-25 et lu par la garde d octets : vérifié par `F:/tmp/methode/m7/g1/tmp/bytecheck.mjs` (0 touche) et par les tests du tronc sur un clone gelé qui SUIT le journal (`F:/tmp/methode/m7/g1/r25/clone-b`, 09:25:53Z : `byte_guard_tracked_tree_is_clean` et `no_secret_in_repo` verts, 21/21, TAP `hygiene-with-journal.tap` sha256 `7889779e026967569a2775d9784f3b2016a836aa0822781a9113b874585e3931` ; R-25 inchangé 440, `R25-b.json` sha256 `b5684ef3b450a1be8112ca9a7796c622c6536debac6728f31924e0113a15676a`) ; le G2 rejoue l oracle sur le gel (CA-9).

## 9. CA-11 (branchement)

- Entrée : `journal.jsonl` et `agent-<agentId>.jsonl` du harnais (hors dépôt) ; sortie : `monark.relance.v1` (fichier `--out` + stdout, sha256 dans `relance-result`) ; consommateur : l orchestrateur, par la ligne datée de `docs/methode/REGLES-MISSION.md` prévue par l.52 (7) (« toute relance d un run de lot passe par `--run` puis `--verify`, sortie citée dans CHANTIERS ; jamais à la main ») : acte de l orchestrateur à la fusion, non écrit ici ; tuyau journal de lot : `--note relance:<sha256 de relance-result>` (JOURNAL-RELANCE-1).
- Test d intégration non LLM : `test/mission-relance.test.ts` rejoue la composition CLI de bout en bout (fixture réelle comprise) ; rejeu d histoire réelle en lecture seule sur 4 runs repris + 4 runs cités (§ 6), prescrit aussi au G2 et au cp-2.
- État : la pièce reste « à brancher » au sens strict jusqu à la première préparation d une reprise réelle par elle (déclencheur de l.52 : premier run échoué après la fusion, jamais un échec forcé).

## 10. MAST

- FM-1.2 : l outil ne lance rien (aucun `spawn`, aucun appel `Workflow`) ; seule écriture `--out`, refusée dans le dossier du run (test 21, mutant M08) ; exit ≠ 0 n est pas une commande.
- FM-2.4 : l état vient des seuls enregistrements du journal et du `timestamp` de premier niveau ; la détection synthétique lit `error`, `apiErrorStatus`, `message.model` ; le texte ne sert qu au repli de l heure et à la concordance (test 8, dernière assertion ; tests 3, 24) ; une clé `started` sans issue est toujours rapportée (`running` ou `dead`), jamais omise.
- FM-2.6 : `resume_at` est un instant lu, pas un quota rétabli ; le verdict dit « the orchestrator relaunches the failed keys after resume_at » ; la ligne R-1 du premier agent repris fait foi ; `--verify` lancé pendant une reprise en cours peut lire une phase non encore redémarrée comme `served-from-cache` (Q-M7-11).
- FM-3.2 : run illisible, `--from` au-delà, usage : exit 2 nommé sur stderr, aucun fichier écrit, jamais un classement partiel (tests 19, 20, 23 ; mutants M10, M15, M16, M24).

## 11. `error_origin` proposés (assignés au G7)

- `G0` : la règle « forme sans date = premier instant ≥ `--now` » (l.52, reprise par le cp-1) produit une divergence de 86 400 s chaque fois que l outil tourne après la réinitialisation, cas courant en direct (Q-M7-1) ; la table de `--verify` ne nommait pas la clé redémarrée sans réponse (mesurée : `wf_2dd4ebc4-88a`) (Q-M7-3).
- `NA` : défauts propres au G1 attrapés et corrigés avant le gel (identifiants d agent de test hors forme ; M23 `red-other` aux tours 1-2).

## 12. Review Focus couverts

- Frontière `dead`/`running` à exactement `--stale` : test 8 (= now − 30 min ⇒ `running`, − 1 ms de plus ⇒ `dead`), test 7 (`--stale 10`), mutants M01, M09, M11, M21.
- Epoch et texte divergents ; pli d heure d été : tests 3 et 12, mutants M02, M03, M13, M17 ; règle « premier instant ≥ `--now` » écrite dans `relance.d.mts` et testée à l instant même (test 10).
- Clé de synthèse remplacée, clé stockée rejouée : tests 15, 18, 22 et rejeu réel (§ 6 : 1 `replaced`, 1 `replayed` 870,464 s, 0 `served-from-cache`), mutants M04, M05, M14, M19, M22.
- Run sans `workflows/scripts/` ou sans script au nom du run : test 13 (`null`, exit inchangé).
- Journal tronqué, JSON invalide, `--from` au-delà : tests 19 et 20 (exit 2 nommé, aucun fichier), mutants M10, M15, M16, M24.

## 13. Questions Q-M7-n

- **Q-M7-1 (orchestrateur ; G0)** : ancre de la forme sans date. Appliquée telle que décidée (`--now`). Mesuré au rejeu : `--now` postérieur à la réinitialisation ⇒ l instant du texte tombe le lendemain ⇒ `divergence` 86 400 s nommée sur 8/8 clés de `wf_682419e6-d20` et 1/1 de `wf_2dd4ebc4-88a` (epoch retenu : `resets_at` juste). En direct, l orchestrateur tourne souvent APRÈS la réinitialisation (il est arrêté par la même limite) : fausse alerte récurrente, et en repli pur (epoch absent) une attente d un jour de trop. Proposition (non appliquée) : ancrer la forme sans date au `timestamp` de la ligne synthétique (premier instant ≥ l instant où le harnais a écrit le message) ; ligne datée requise.
- **Q-M7-2 (orchestrateur)** : `cause` = `"unknown"` pour « inconnue » (code anglais) : à confirmer.
- **Q-M7-3 (orchestrateur ; G0)** : `--verify` hors des six noms : clé redémarrée sans `result` non nul ⇒ état courant de la clé qui répond (`failed`, `dead`, `running`), exit 1 ; rien après la borne ⇒ `failed`, exit 1 ; compteurs limités aux six noms. À confirmer (mesuré : `wf_2dd4ebc4-88a`). Libellé à noter : sur `wf_a3fedd81-47e` et `wf_c90635a2-8a8` (aucune clé `failed` à la borne), `--verify` imprime « dead 1; verified: each failed key relaunched or replaced » : vrai par vacuité ; la clé `dead` n est pas vérifiée, elle est rapportée (Q-V-2 ouverte).
- **Q-M7-4** : `--stale` accepté par `--verify` (absent de la ligne d usage de la mission) ; `verify.replayed` est un objet `{keys, seconds}` quand les autres compteurs sont des nombres.
- **Q-M7-5** : `resume`/`resume_at` = `null` sans clé `failed` (les `dead` n ont pas de texte de reprise tant que Q-V-2 est ouverte).
- **Q-M7-6** : forme fermée en refus (FM-3.2) : un changement de format du harnais (nouveau type, second `launched`, `agentId` autre) rougit l outil (exit 2 nommé) : voulu, à noter pour la maintenance.
- **Q-M7-7** : ligne non terminée : écartée en fin de transcription (queue NUL des coupures, 2/295), refusée en fin de journal (0/155 mesurée). À confirmer comme règle.
- **Q-M7-8** : `--run` sur un journal prolongé décrit l état courant : après une reprise à clé remplacée, l ancienne clé reste `failed` pour toujours (`wf_682419e6-d20` en place : 1 `failed`, exit 1 « relaunch ») ; `--verify` le dit `replaced`. Protocole à écrire dans la ligne REGLES : `--run` avant la reprise, `--verify` après ; option `--lines <n>` pour rejouer l histoire sans copie : hors lot.
- **Q-M7-9 (G2)** : densité de l outil (80 lignes, lignes jusqu à 330 caractères) ; règles en JSDoc dans `relance.d.mts`.
- **Q-M7-10** : `public-text-deny` ne lit pas les fixtures (il ne lit que `docs/public-notes/**`) : vert par vacuité sur ces octets ; `byte-guard` et `no-secret-in-repo` les lisent (45/45).
- **Q-M7-11 (orchestrateur)** : lancer `--verify` après la fin du run repris (notification reçue), jamais pendant : une phase non encore redémarrée se lit `served-from-cache` (exit 1). À porter dans la ligne REGLES.

## 14. Déviations déclarées (REGLES-MISSION)

- entre 08:43Z et 08:55Z : une première écriture de l outil par heredoc contenant des barres inverses a échoué à l analyse du shell (rien écrit) ; tous les fichiers à barres inverses ont ensuite été écrits par l outil d écriture de fichiers, jamais par heredoc.
- entre 08:56Z et 09:00Z : une commande a utilisé l échappement `$'...'` (barre inverse) pour compter des CR : le transport l a altéré (compte faux, « crlf=1 » sur chaque fichier) ; mesure écartée et refaite sans barre inverse (`node`, `String.fromCharCode(13)`) : 0 CR partout (§ 4.3).
- 09:14:24Z : `rm -f` sur deux fichiers de travail (`last.out`, `last.err`) désignés par une variable de chemin (`$O`) dans la commande de rejeu qui venait de les créer : cible variable, contraire à la règle ; aucun autre fichier touché.
- 09:21:46Z : une copie trop large (`test/fixtures` entier) dans `F:/tmp/methode/m7-deliver/evidence/code/test/fixtures-tmp` (11 copies faites par cette même commande) a été retirée par `rm -r` sur son chemin littéral, après listage ; les 12 copies livrées ont été revérifiées par sha256 contre le worktree.

## 15. Livrables

- Dépôt (worktree, non commis) : `scripts/mission/relance.mjs`, `scripts/mission/relance.d.mts`, `test/mission-relance.test.ts`, `test/fixtures/relance/` (9 fichiers : 7 synthétiques, 2 réels), ce journal.
- Hors dépôt : `F:/tmp/methode/m7/g1/` (`f2p*`, `mutants*`, `relance/`, `r25/`, `hygiene/`, `tmp/`, clones) ; `F:/tmp/methode/m7-deliver/REPONSE.md` et `DELIVERED.sha256`. Aucune scission (`F:/tmp/methode/m7/split/` non créé).

## 16. Tour 1 de corrections (correcteur `corr`, D12 (d)), 2026-09-29

Modèle résolu (R-1) : claude-opus-5-5 (Claude Opus 5.5), effort max, correcteur du tour 1, instance fraîche (ni le G1 `wf_9f4e0bfe-d66` ni le G2 `wf_90590f7b-a23` de M-7, aucun agent de M-6 ni de M-5c).

- Mission `F:/tmp/methode/mission-corr1-m7.md`, sha256 `cceb71785b87a1161900c04a1156953b4c1893a462343e800c464b74da0d7633` = champ `sha` du reçu `F:/tmp/methode/mission-corr1-m7.recu.json` (vert, 12 codes à 0, base `aca75444f04a8881721cb6c6789e759448b5fc7e`, head `0ed778dbe0e09451584a003b19975670be7ff4e9`) ; générée par `gen.mjs` `52b9a171` le 2026-09-29T10:16:14Z. Décisions 275-d de la mission citées telles quelles, non rediscutées : C-G2-1 (Q-M7-1, Q-G2-1), C-G2-2 (Q-M7-8), C-G2-3 (Q-M7-3), C-G2-4 (Q-G2-3 : forme fermée sur les champs REQUIS, tolérante aux champs additionnels ; remplace la clause « tout changement du harnais ⇒ exit 2 »), C-G2-5 (Q-M7-4), C-G2-6, C-G2-7 (Q-G2-2 : tranchée en correction), C-G2-8 (Q-M7-9 : lignes touchées ou créées ≤ 160 caractères, item RELANCE-LINE-LENGTH-1), Q-G2-4 (fixture réelle verbatim, non touchée).
- Entrées lues en entier : ADR l.52 (G0 + pli du cp-1), l.28 (D8), l.33 (D12 (d)(e)) ; rapport G2 `F:/tmp/methode/m7/g2/G2-lot-methode-m7.md` (sha256 `719ad068c2e063635278da6b410a16fbfe81304e479cf1639b81d8fd45229e69`, recalculé) ; `PROBE.json` (sha `c03d6b82…`) et la table `mutants-g2.mjs` ; missions G1 et G2 ; l outil, le `.d.mts`, le test, les 9 fixtures, ce journal (sections 0 à 15) au gel 1 (copies de lecture par `git show HEAD:` sous `F:/tmp/methode/m7/corr1/work/gel/`, sha256 = en-tête de la mission) ; CHANTIERS 2026-09-29 09:36 et 10:19 UTC ; runs réels en lecture seule.
- Cadre tenu : worktree modifié EN PLACE, aucun git écrivant dans le worktree ni dans `F:/Monark` (seuls `git show`, `git status`, `git diff`, `git ls-files`, et des clones `--no-local` sous `F:/tmp/methode/m7/corr1/`) ; `F:/claude-config` lu seulement (aucun `--out` dessous) ; aucun réseau ; rien sur C: ; TEMP `F:/tmp/methode/m7/corr1/tmp` ; jonction `node_modules` du worktree par `mk-nm.ps1` (10:32Z : 220 entrées, 10 `@monark`, 0 échec) retirée par `rm-nm.ps1` avant le rendu ; R-20 (aucun commit, aucun workflow).

### 16.1 Étapes (`date -u`)

| UTC | étape |
|---|---|
| 10:18 - 10:31 | lecture (ADR, rapport G2, `PROBE.json`, missions, code, test, fixtures, journal G1, CHANTIERS) ; consultation de l outil advisor intégré (plan) |
| 10:31 - 10:33 | C-V-4 (21 607 Mo libres, 14 `node.exe`, verrou libre), jonction ; sonde des fuseaux (§ 16.3) |
| 10:37 - 10:39 | code dans l ordre de la mission (C-G2-1, C-G2-2, C-G2-3, C-G2-4, C-G2-5, C-G2-7) puis `.d.mts` ; 24 tests : 21 verts, 3 rendus faux par les décisions (§ 16.4) |
| 10:40 - 10:46 | 3 tests adaptés (24/24) ; 24 tueurs ré-ancrés ; 13 tests neufs (37/37) ; R-25 compté 560 > 547, compaction à 543 (§ 16.5) |
| 10:46 - 10:47 | `tsc --noEmit` exit 0 ; `eslint test/mission-relance.test.ts` exit 0 ; `lint-ratchet` 69/69 (apport 0) |
| 10:47 - 10:50 | table des 35 mutants réadressés (0 ancre perdue), harnais, script de rejeu ; sonde R-25 : 543 (10:50:10Z) |
| 10:50 - 11:04 | attente du verrou d oracle (G2 M-6 : 10:43:00Z → 10:57:27Z ; G1 M-5c : 10:57:32Z → 11:03:59Z) |
| 11:04:04 - 11:07:43 | F2P tirage 3 (3/3 tués) ; mutants (35/35 tués, 11:04:43Z → 11:06:56Z) ; F2P tirage 37 (37/37) |
| 11:07:46 | rejeu d histoire réelle R1-R10 (lecture seule) |
| 11:08:40 | C-V-4 (21 901 Mo, 14 `node.exe`, verrou libre), oracle `--role corr --key M-7` lancé (§ 16.13) |
| 11:10 - 11:14 | section 16 écrite (un heredoc échoué, § 16.12) puis ajoutée au journal (11:13:56Z) |
| 11:16:27 | oracle : exit 0, 1 662 tests |
| 11:17:39 - 11:18:39 | hygiène sur clone qui suit le journal : 58/58, deux fois (`hygiene/`, `hygiene2/`) ; `REPONSE.md` écrit |
| 11:19 - 11:21 | seconde consultation de l outil advisor intégré (avant rendu) ; jonction retirée par `rm-nm.ps1` (11:21:12Z : `F:/Monark-wt-m7/node_modules` absent, `F:/Monark/node_modules` intact, 220 entrées) |
| 11:21 - 11:2x | contrôles finaux (worktree : 4 fichiers modifiés, 0 non suivi, HEAD `0ed778db` ; `F:/Monark` : `git status` vide ; écritures sous `F:/claude-config`, § 16.12) ; Q-C1-9 ; `DELIVERED.sha256` et `sha256sum -c` |

### 16.2 Corrections : C-G2-n → ligne → test → mutant

Lignes de `scripts/mission/relance.mjs` au tour 1 (98 l., sha256 `c9af87cc3701d692ce75cd196a696fda8322a72fab06bf305301a5e07cf02bb2`) ; `relance.d.mts` 66 l. (sha256 `150e7ce4feb5e25f19e1e8e0760f8ef8ce3d47cfb35bea3321d5c03a3f897ace`) ; `test/mission-relance.test.ts` 354 l. (sha256 `f39c3d56a97fc6621fd1d2132f53283f6dc24fb509b6eb622b80b077191bc041`) ; fixtures inchangées.

| C-G2 | décision | code (l.) | `.d.mts` | test(s) neuf(s) | mutant tué |
|---|---|---|---|---|---|
| C-G2-1 (bloquante) | Q-M7-1, Q-G2-1 | l.20-23 : candidats du jour (ou de l année) et du suivant, premier instant ≥ l ancre, pour les DEUX formes ; l.28-29 : texte ancré sur le `timestamp` de la ligne synthétique, jamais sur `--now` ; l.31 : ligne sans `timestamp` valide ⇒ texte non lu, `cause` `unknown`, `resets_at` = epoch sinon `null`, `divergence` nulle ; l.32 : frontière `> 60` s inchangée | `parseResets(text, anchor)`, `resetsOf` (`resets_at: string | null`) | `resets_of_anchors_the_text_on_the_stamp_of_its_line_never_on_now`, `resets_of_names_a_divergence_beyond_60_seconds_only` (60 s : rien ; 61 s : nommée), `parse_dated_form_across_the_new_year_takes_the_next_year` | N01, N09, N10 |
| C-G2-2 (bloquante) | Q-M7-8 | l.34-35 `answer` (partagé) : la première clé dont le PREMIER enregistrement est un `started` au rang ≥ `lo`, non prise, de même `label` + `phase` ; l.43-46 : dans `classify`, une clé `failed` répondue par une clé neuve démarrée après son dernier enregistrement et `stored` est `replaced`, avec `by: {key, agentId}` ; `--run` (l.89) appelle `classify` : aucun autre changement ; l.92 : `resume_at` nul si une clé `failed` a un `resets_at` nul (explicite, Q-C1-3) | `Status` += `replaced`, `KeyEntry.by`, doc de `classify` | `run_failed_key_answered_by_a_new_key_stored_after_it_is_replaced_with_its_identity` (fixture réelle prolongée d une reprise : exit 0, `replaced` avec `by`, `resume` et `resume_at` nuls) | son tueur l.46 (tirage 37) ; N07 (garde partagée) |
| C-G2-3 | Q-M7-3 | l.63-65 : `vacuous` = aucune clé `failed` à la borne ; les compteurs ne portent que sur les clés `failed` d origine (Q-C1-4) | `VerifyCounts.vacuous` | faux : test de N06 ; vrai : test de C-G2-7 ; test 22 adapté (`vacuous: false`) | N06 (même test) |
| C-G2-4 | Q-G2-3 | l.12 `TYPED` (`key`, `label`, `phase` chaînes, `agentId` `a` + hexadécimal, `result` présent) ; l.75-77 : `Object.hasOwn(SHAPE, type)`, champ fautif nommé : `journal.jsonl:<n>: <type> record: field <champ> missing or mistyped` ; champs additionnels tolérés ; en-tête l.3-6 réécrit | doc de `JournalRecord` | `run_record_with_a_mistyped_field_exits_2_naming_file_line_type_and_field`, `run_record_missing_a_required_field_exits_2_never_a_class`, `run_key_of_another_type_exits_2_and_an_additional_field_is_tolerated` | N03, N04, N08 |
| C-G2-5 | Q-M7-4 | en-tête l.3 (`--stale`, défaut 30 min, à `--run` ET à `--verify`) | doc de `verify` (« staleMin as --stale ») et de `main` (options des deux formes) | `verify_cli_applies_stale_to_the_origin_states` | N02 |
| C-G2-6 | classes décidées | (tests seuls) | aucune | `verify_stored_origin_key_not_restarted_stays_stored_never_replayed`, `verify_failed_key_restarted_without_a_result_takes_its_current_state_exit_1`, `verify_origin_key_restarted_after_the_bound_never_answers_for_another`, `verify_new_key_answering_with_a_null_result_is_null_served_exit_1` (+ N09, N10 ci-dessus) | N05, N06, N07, N11 (+ N09, N10) |
| C-G2-7 | Q-G2-2 | l.55 : clé `dead`, `running` ou `replaced` d origine ⇒ son état COURANT (journal entier) ; l.57 : `answer(records, k, from, …)` ne regarde que les clés NEUVES après la borne ; l.61 : une clé neuve qui répond laisse à l entrée la clé et l agent d origine et se nomme dans `by` ; l.67 : `verify.unmatched` (clé, label, phase, état courant) des clés neuves appariées à aucune ; exit inchangé | `VerifyCounts.unmatched`, doc de `verify` | `verify_reports_unmatched_new_keys_origin_keys_in_their_current_state_and_the_answering_key` (clé `dead` redémarrée ⇒ `stored`, `vacuous` vrai, `unmatched` d une clé, `by` et `agentId` d origine) | son tueur l.55 (tirage 37) |
| C-G2-8 | Q-M7-9 | 36 lignes touchées ou créées dans l outil, 28 dans le `.d.mts`, 97 dans le test : **0 au-delà de 160 caractères** (`linecheck.mjs`) ; lignes longues NON touchées restantes : outil l.11, 13, 18, 19, 22, 32, 38, 41, 42, 50, 51, 52, 71, 78, 83, 84, 85, 87, 88, 89, 90, 93, 98 (23) ; `.d.mts` l.63 (1, signature de `verify` rendue à l octet) ; test 17 ⇒ item RELANCE-LINE-LENGTH-1 | aucune | aucun | aucun |

### 16.3 Forme datée sous « premier instant ≥ ancre » : le candidat de la veille retiré, N10 réadressé

Sous la règle décidée (C-G2-1, Q-G2-1 : premier instant ≥ le `timestamp`, pour les deux formes), un candidat de la veille (ou de l année précédente) ne peut être retenu que si l horloge murale du fuseau recule en franchissant une date après l ancre. Sonde `F:/tmp/methode/m7/corr1/work/fold-probe.mjs` (sha256 `64f8d1e89acc12c0868f73dd0be979c96f59d6e714b3c8ba68063d39fafb96d6`, 10:32:01Z → 10:33:05Z, Node v24.15.0) : les 418 fuseaux IANA de `Intl.supportedValuesOf`, heure par heure du 2026-01-01 au 2029-01-01 : 390 heures à recul, **0 recul franchissant une date** (`fold-probe.out` sha256 `8e1a1ef3d25d66e1bffe9f165fafd1eab431636f14e21aa279ad7a6062746fc3`). Le candidat `-1` est donc mort sous la règle : retiré (l.21 `[0, 1]`). Conséquences : le N10 du G2 (`[-1, 0, 1]` → `[0, 1]`) deviendrait équivalent ; il est réadressé sur le candidat du lendemain (`[0, 1]` → `[0]`), même classe (forme datée à cheval sur l année) ; la règle « l année la plus proche » (`reduce`) disparaît : M18 est réadressé sur le tri des candidats (l.22 `a - b` → `b - a` : l année la plus lointaine ≥ l ancre). L entrée de sonde du G2 pour N10 (« Dec 31, 11pm » lu le 1er janvier) donne désormais 2027-12-31T23:00Z (jamais une année avant l ancre) : assertion du test neuf.

### 16.4 Tests : 37 = 24 du G1 + 13 neufs

- **Rendus faux par les décisions, adaptés (dit)** : test 4 (`run_failed_key_without_a_synthetic_line_is_unknown_at_now`) : ses trois lignes de détection n avaient pas de `timestamp` ; sous Q-G2-1 (ligne sans `timestamp` ⇒ `cause` `unknown`) elles ne discriminaient plus la détection ; l aide les horodate (`{ timestamp: NOW_A, ...line }`). Test 11 : renommé `parse_dated_form_takes_the_first_year_at_or_after_the_stamp` ; l assertion « lu après la réinitialisation : cette année » devient « horodaté après l instant : l année suivante, jamais avant l ancre » (C-G2-1, Q-G2-1). Test 22 : `verify` porte `vacuous: false` et `unmatched: []` (C-G2-3, C-G2-7). Aucun autre test du G1 touché hors ses lignes `// killer:` ; l aide `W` (texte hebdomadaire) remonte parmi les aides.
- **Tueurs ré-ancrés** : les 24 lignes `// killer:` du G1 gardent leur texte, seul le numéro de ligne change (`rekill.mjs` puis `reanchor.mjs` : la ligne unique où `<before>` figure une fois ; trois textes présents sur deux lignes : la plus proche du numéro courant, relevée) ; contrôle `killcheck.mjs` (forme de `parseKiller` de `red-proof.mjs`, opérateur, portée, `<before>` exactement une fois) : **37/37 valides**.
- **13 tests neufs** (chacun sous son `// killer:`, `--now` toujours donné) : N01 à N11 (un par survivant, § 16.2), `--run` sur journal prolongé (C-G2-2), `--verify` : `unmatched`, `dead` redémarrée, `by` (C-G2-7). Aides neuves : `syn` (ligne synthétique, horodatée si donné), `spoiled` (`--run` sur une copie de `wf_fx-a` à une ligne de journal de plus).
- Fichier seul : 37/37 verts ; typecheck, eslint, `lint-ratchet` 69/69.

### 16.5 R-25 par étape

| étape | outil | `.d.mts` | test | fixtures | total |
|---|---|---|---|---|---|
| gel 1 | 80 | 59 | 276 | 25 | 440 |
| outil corrigé (C-G2-1 à C-G2-7, en-tête) | 99 | 59 | 276 | 25 | 459 |
| `.d.mts` | 99 | 68 | 276 | 25 | 468 |
| 3 tests adaptés | 99 | 68 | 277 | 25 | 469 |
| 13 tests neufs et aides | 99 | 68 | 368 | 25 | **560 > 547** |
| compaction (ci-dessous) | 98 | 66 | 354 | 25 | **543** |

Compaction, sans changement de comportement ni ligne > 160 : dans `classify`, l ouverture du `map` et le calcul de `by` sur une ligne ; au `.d.mts`, la signature de `verify` rendue à l octet (ligne non touchée) et la règle de forme ramenée à la doc de `JournalRecord` (l en-tête de l outil la porte en entier) ; au test, **les 13 tests neufs ne sont pas séparés par une ligne vide** (12 lignes), le test de N01 regroupe ses quatre cas en un tableau, le test de N08 porte le champ additionnel en une assertion. La scission M-7b pré-déclarée n aurait pas suffi seule : sans C-G2-7 et avec la mise en page ordinaire, le compte restait ≈ 550. Mesure : `r25()` de `F:/Monark/scripts/oracle/r25.mjs` (méthode A : clone `--no-local` du worktree, changements copiés et gelés dans un commit du clone, `aca75444...HEAD`, pathspec de `ci.yml` l.82) par `F:/tmp/methode/m7/corr1/r25/r25-probe.mjs` (sha256 `b59ee8f0d0e7a57f90ac9b23563efb1d91057d39c30b1e0557554e467dbe2206`) à 10:50:10Z : **STAT 543 insertions, 0 suppression, 543** (borne CI 1 205), CONTENT_STAT 0, GREEN ; `R25-a.json` sha256 `b610b70709eb890bacf83c7a898cea9844612a41ce907930fb588c4347889b57` ; **543 ≤ 547 : pas de scission M-7b** (solde 4 lignes). Ce journal est exclu par la pathspec.

### 16.6 F2P

- `node F:/Monark/scripts/red-proof.mjs --base aca75444 --gel F:/Monark-wt-m7 --repo F:/tmp/methode/m7/corr1/base --out F:/tmp/methode/m7/corr1/f2p --draw 3 --seed 2026` (base : clone `--no-local` détaché à `aca75444`, sans `scripts/mission/relance.*` ; 11:04:04Z → 11:04:38Z) : **exit 0**, « red-proof OK: 37 judged, 0 unchanged, 3 killer(s) drawn » ; 37 `new-module` ; tirés : `verify_null_result_after_the_bound_is_null_served_exit_1` (l.58 ROR), `run_script_is_the_persisted_script_of_the_run_or_null` (l.88 CONST), `verify_cli_applies_stale_to_the_origin_states` (l.89 CONST, N02) : **3/3 tués** ; `RED-PROOF.json` sha256 `d1169d9a1274567383949f3ec8f94ef11c74902d79b48ee1c5b088c9094e1bc2` ; `gel.digest` `4c96a26f976aaf6b…` ; `killer-1.tap` `65aa53fa…`, `killer-2.tap` `5893a049…`, `killer-3.tap` `01236993…` ; `base.tap` `0dacedf9…`, `gel.tap` `6457d959…`.
- Même commande `--draw 37 --out F:/tmp/methode/m7/corr1/f2p-all` (11:07:09Z → 11:07:43Z) : **exit 0, 37/37 tués** (dont les tueurs des tests de C-G2-2, l.46, et de C-G2-7, l.55, hors table de mutants) ; `RED-PROOF.json` sha256 `5d78befc388c73edc5b9b63fd7c757785f40191c9b16713dd6c5e46e6243b03e` (même `gel.digest`).

### 16.7 Mutants : 35/35 tués

Table `F:/tmp/methode/m7/corr1/mutants-def/mutants.mjs` (sha256 `5197e0f0ceeb33a65bffdbf485c3bef44cce80c30f585e3276d1ce6c71498208`) : les 24 du G1 et les 11 du G2 RÉADRESSÉS sur l outil corrigé (champ `was` = ligne du gel ; 0 ancre perdue au contrôle `check.mjs`). Harnais `F:/tmp/methode/m7/corr1/mutants-def/run.mjs` (53 l., sha256 `2d6e680bd746882909d8eebbab23baf1533ba54552aecfdf39fac9b689860c0b`, précédent : le harnais du G2) : un clone `--no-local` du worktree au gel 1, les 3 fichiers changés copiés et vérifiés par sha256, un seul lancement ; attente du verrou d oracle avant la ligne de base et avant chaque mutant (0 attente) ; C-V-4 avant chaque mutant ; ancre unique sinon `anchor-lost` ; fichier de test entier en TAP ; restauration à l octet vérifiée ; statut par `classify` de `red-proof.mjs` (enfant mort = non conclu ; `red-other` jamais tué). Lancement unique 11:04:43Z → 11:06:56Z : ligne de base **37/37 verts** (`baseline.tap` sha256 `5814d321…`, 14 `node.exe`, 21 834 Mo), `sha0` `c9af87cc…` (= l outil livré) ; **35 tués, 0 survivant, 0 non conclu, 0 `anchor-lost`, 0 `red-other`** ; `RESULTS.json` sha256 `5f8f5796740bc478711f5132058c95af5bdc7aeca6185898c7e3d7018dcf9cfa`, `RESULTS.txt` sha256 `7849f693c4deeb081f10204e03966e03f045f1833631264dd47237425277678e`.

| id | l. gel → tour 1 | réadressage | tests rouges |
|---|---|---|---|
| M01 | 33 → 41 | même texte | 7 |
| M02, M03 | 26 → 32 | même texte | 1, 2 |
| M04 | 43 → 54 | même texte | 3 |
| M05 | 48 → 59 | même texte (ligne du statut) | 3 |
| M06 | 39 → 50 | même texte | 8 |
| M07 | 33 → 41 | même texte | 3 |
| M08 | 69 → 86 | même texte (SDL) | 1 |
| M09 | 68 → 85 | même texte | 4 |
| M10 | 80 → 98 | même texte | 7 |
| M11 | 28 → 36 | même texte | 1 |
| M12 | 10 → 13 | même texte | 5 |
| M13 | 19 → 23 | même texte (règle commune aux deux formes) | 1 |
| M14 | 47 → 60 | `taken.add(by);` de `verify` (SDL) | 2 |
| M15 | 60 → 76 | même texte | 1 |
| M16 | 60 → 12 | même texte (`TYPED.agentId`) | 1 |
| M17 | 18 → 22 | même texte | 1 |
| M18 | 19 → 22 | réadressé : tri des candidats inversé (l année la plus lointaine ≥ l ancre ; la règle « la plus proche » n existe plus) | 9 |
| M19 | 52 → 68 | même texte | 1 |
| M20 | 74 → 92 | même texte | 1 |
| M21 | 32 → 40 | même texte | 1 |
| M22 | 41 → 52 | même texte | 1 |
| M23 | 25 → 30 | même texte | 2 |
| M24 | 61 → 78 | même texte | 18 |
| N01 | 24 → 29 | `parseResets(text, line.timestamp)` → `parseResets(text, now)` | 1 (son test) |
| N02 | 72 → 89 | même texte (`stale` retiré de `verify`) | 1 (son test) |
| N03 | 60 → 77 | le message perd type et champ | 3 (dont son test) |
| N04 | 60 → 76 | `!(f in r) || ` retiré | 1 (son test) |
| N05 | 41 → 52 | même texte | 1 (son test) |
| N06 | 48 → 59 | même texte | 1 (son test) |
| N07 | 45 → 35 | la garde des clés neuves est la condition « premier enregistrement au rang `i` » de `answer` : retirée | 1 (son test) |
| N08 | 60 → 12 | `key: str` → `key: () => true` | 1 (son test) |
| N09 | 26 → 32 | même texte | 1 (son test) |
| N10 | 17 → 21 | réadressé : `[0, 1]` → `[0]` (§ 16.3) | 5 (dont son test) |
| N11 | 46 → 57 | même texte | 1 (son test) |

### 16.8 Rejeu d histoire réelle (lecture seule)

`F:/tmp/methode/m7/corr1/relance/replay.mjs` (sha256 `fb9a60644e340921232c4938fe3689b7c7a0822693cca04278d1c246d58c6514`, 11:07:46Z ; outil du worktree ; copies tronquées NEUVES sous `F:/tmp/methode/m7/corr1/relance/copies/` : journal par ses n premières lignes, transcriptions de ses agents copiées à l octet, script persisté ; `--out` sous `F:/tmp/methode/m7/corr1/relance/` ; synthèse `REPLAY.json` sha256 `369ea06bae624071ec8ac08c38aaf194e5e9636830e46f063398852fb9fea279`). Lignes R1-R10 = celles du G2.

| # | exécution | sortie (sha256) | résultat |
|---|---|---|---|
| R1 | `--run` copie 19 l. `wf_682419e6-d20`, `--now 2026-09-27T04:03:00Z` | `813ad2f1…` | exit 1 ; 8 `failed` `five_hour` 2026-09-27T05:20:00.000Z, 0 divergence ; 1 `stored` |
| R2 | idem, `--now 2026-09-27T06:00:00Z` (après la réinitialisation) | `3750a1e1…` | exit 1 ; mêmes états ; **0 divergence** (G2 : 8 × 86 400 s) : C-G2-1 tenue |
| R3 | `--run` en place, journal entier (37 l.) | `814a06a4…` | **exit 0** ; 9 `stored` + **1 `replaced`** (l ancienne synthèse `v2:6d467d47…`, `a9a2198e3a9fcf81a`, `by` = `v2:1a26cabb…` / `a7f34bcaed99a7994`) ; aucune `failed` ; `resume` et `resume_at` nuls ; verdict « stored 9, replaced 1; nothing to relaunch » : C-G2-2 tenue |
| R4 | `--verify --from 19` en place | `438e9606…` | exit 0 ; 7 `relaunched`, 1 `replaced` (avec `by`), 1 `replayed` (870,464 s), 0 `served-from-cache`, 0 `null-served` ; `vacuous: false`, `unmatched: []` |
| R5, R6 | `--run` copie 2 l. `wf_c90635a2-8a8`, `--now` 05:03Z puis 04:32:50Z | `ee9f0a77…`, `5b27b3c5…` | `dead` puis `running` (= G2) |
| R7 | `--verify --from 2` en place `wf_c90635a2-8a8` | `22f60248…` | exit 0 ; **`vacuous: true`** ; la clé `dead` d origine rapportée dans son état COURANT **`stored`** (`ae851373ba7c2b7a9`) : C-G2-3, C-G2-7 tenues |
| R8 | `--run` en place `wf_c90635a2-8a8` | `65fc211f…` | exit 0 ; 1 `stored` |
| R9 | `--verify --from 3` en place `wf_2dd4ebc4-88a` | `973ee7ed…` | exit 1 ; la clé relancée `dead` (= G2) |
| R10 | `--run` en place `wf_7a7438e9-085`, `--now 2026-10-02T12:00:00Z` (après la réinitialisation hebdomadaire) | `271df26e…` | exit 1 ; 1 `failed` `seven_day` 2026-10-01T10:00:00.000Z, **0 divergence** (texte ancré sur 2026-09-28T17:38:25.555Z) ; sortie identique à l octet à celle du G2 |

### 16.9 Questions Q-C1-n (à l orchestrateur)

- **Q-C1-1 (Q-G2-1, application littérale)** : ligne synthétique sans `timestamp` valide : `cause` `unknown` même quand `quotaLimits.rateLimitType` est présent (le texte de la décision dit « `cause` `unknown` » là où le G2 proposait « cause inchangée ») ; un `timestamp` présent mais illisible est traité comme absent (sinon `formatToParts` lèverait une `RangeError` non nommée). 0 cas sur 299 mesurés. Garder, ou `cause` = `rateLimitType` ?
- **Q-C1-2 (forme datée)** : sous « premier instant ≥ ancre », le candidat de la veille est mort (§ 16.3, 0 cas sur 418 fuseaux, 2026-2028) : retiré ; N10 et M18 réadressés ; le test 11 dit « jamais une année avant l ancre ». À confirmer.
- **Q-C1-3 (`resume_at`)** : `resets_at` peut désormais être `null` (Q-G2-1) ; `resume_at` = `null` dès qu une clé `failed` a une réinitialisation inconnue (l.92, explicite ; au gel, le tri de chaînes plaçait déjà `"null"` en dernier, par accident). Alternative : le maximum des seules valeurs connues.
- **Q-C1-4 (compteurs de `--verify`)** : restreints aux clés `failed` d origine (sinon `replaced` compterait les clés déjà remplacées avant la borne, désormais classées `replaced` par `classify`, ou les clés `dead` devenues `replaced`).
- **Q-C1-5 (`by`)** : à `--verify`, toute réponse d une clé neuve (pas seulement `replaced` : aussi `null-served` ou l état de la clé neuve) porte `by` ; à `--run`, seul `replaced` le porte.
- **Q-C1-6 (chaîne de remplacements, 0 cas mesuré)** : `k1` `failed` → `k2` neuve `failed` → `k3` neuve `stored` : `--run` rapporte `k1` `failed` (la première clé neuve répond, une réponse par clé) et `k2` `replaced`. Item ou acceptation ?
- **Q-C1-7 (R-25)** : 543 / 547 ; les 13 tests neufs sans ligne vide de séparation (§ 16.5) ; tout ajout ultérieur dans M-7 n a plus que 4 lignes ; la réécriture RELANCE-LINE-LENGTH-1 (+ 35 à + 45) ne tient que dans un lot suivant.
- **Q-C1-8 (message d exit 2)** : les refus de type (type inconnu, `launched` hors tête) nomment le champ `type` (« `<type> record: field type missing or mistyped` »).
- **Q-C1-9 (C-G2-7 (b), sur-ensemble)** : la décision vise une clé `dead` ou `running` d origine REDÉMARRÉE après la borne ; l.55 donne l état courant à TOUTE clé d origine ni `failed` ni `stored` (redémarrée ou non) : une clé `running` à la borne qui a fini après sans redémarrer se lit `stored`, une clé déjà `replaced` avant la borne est relue sur le journal entier ; une clé non redémarrée et sans enregistrement après la borne garde son état (recalculé à `--now`, comme au gel). Garder le sur-ensemble, ou restreindre aux clés redémarrées (une condition `restarts(k.key).length > 0`) ?

### 16.10 MAST

- FM-1.2 : l outil ne relance toujours rien (aucun `spawn`, aucun `Workflow`) ; `--run` ne prépare plus la relance d une clé déjà remplacée (R3 : exit 0, `resume` nul ; au gel : exit 1, `resume` non nul).
- FM-2.4 : l appariement ne lit que des champs du journal (`label`, `phase`, rang) ; aucun texte de transcription ne classe une clé ; `--verify` rapporte désormais toutes les clés : les clés neuves non appariées (`unmatched`) et l état courant des clés `dead`/`running` d origine (R7) : la revendication du § 10 vaut aussi pour `--verify`.
- FM-2.6 : `resume_at` reste un instant lu, jamais un quota rétabli ; l ancrage sur le `timestamp` retire les fausses divergences (R2 : 0 au lieu de 8 × 86 400 s) ; une réinitialisation inconnue rend `resume_at` nul (Q-C1-3).
- FM-3.2 : champ requis manquant ou mal typé ⇒ exit 2 nommant fichier, ligne, type et champ, jamais un classement partiel ; champ additionnel toléré (Q-G2-3).

### 16.11 `error_origin` proposés (assignés au G7)

- `G0` : C-G2-1, C-G2-2, C-G2-3, C-G2-8 (= G2) ; les 3 tests adaptés (tests 4 et 11 : règle changée par Q-G2-1 ; test 22 : forme changée par C-G2-3 et C-G2-7).
- `G1` : C-G2-4 à C-G2-7 (= G2).
- `corr` : les déviations du § 16.12.
- `OUT` : l écriture du harnais d agent sous `F:/claude-config` (§ 16.12, même classe que le § 9 du G2).

### 16.12 Déviations déclarées (REGLES-MISSION)

- Entre 10:43:00Z (prise du verrou par l oracle du G2 de M-6) et 10:46:11Z : deux exécutions ciblées du fichier de test (37 tests, environ 3 s chacune) pendant que le verrou d oracle était tenu par un autre processus, constaté à 10:46:38Z ; depuis, chaque course attend la libération du verrou (le harnais l attend lui-même).
- 10:48:37Z : une commande de contrôle `grep` avec une barre inverse produite par `printf` (hors heredoc) a échoué (« Trailing backslash ») ; rien écrit ; contrôle refait par `node` (0 octet 0x5C).
- 10:49:35Z : la première écriture de `r25-probe.mjs` par heredoc contenait des séquences à barre inverse (5 octets 0x5C, dans deux expressions régulières) ; octets vérifiés intacts (0 octet de contrôle) ; fichier réécrit sans barre inverse à 10:49:58Z, avant tout usage.
- 11:1xZ : une écriture de cette section par heredoc Bash a échoué à l analyse du shell (« unexpected EOF ») ; rien écrit (sha256 du journal inchangé, `504ab968…`) ; section écrite par l outil d écriture de fichiers dans `F:/tmp/methode/m7/corr1/work/journal-tour1.md` puis ajoutée par `cat`, octets contrôlés.
- `F:/claude-config` : `find` des fichiers du dossier de session réel `e03dd7cc-4452-4c79-9aa6-58827dad4d19` plus récents que 2026-09-29T10:18:00Z (repère `F:/tmp/methode/m7/corr1/work/start-marker`) = **0** (les runs rejoués en place n ont reçu aucune écriture) ; une écriture du HARNAIS d agent dans ma propre session : `F:/claude-config/projects/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/tool-results/bv3hwgvbs.txt` (10:18:27Z, 33 313 octets : sortie d outil de 32,5 Ko persistée, lecture de l ADR) : acte du harnais, pas de l agent ; sorties tenues sous 30 Ko ensuite (`error_origin` OUT).
- Sorties (MISSION-LINT-OUTPUTS-1) : toutes sous la racine déclarée `F:/tmp/methode/m7/corr1/` ; hors de la liste « À créer », dans cette racine : `work/`, `f2p-all/`, `mutants-def/`, `r25/`, `hygiene/`, `hygiene2/`, `base/` et les journaux `f2p.log`, `f2p-all.log`, `mutants-run.log`, `oracle.log`, `oracle-start.txt` ; hors de cette racine, seulement l enregistrement d oracle et son dossier (`F:/tmp/oracle-results/`, `F:/tmp/oracle-runs/`, sorties normales de l outil) et `F:/tmp/methode/m7-corr1-deliver/` (déclaré).

### 16.13 Oracle

`node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-m7 --base aca75444 --key M-7` (lancé 11:08:40Z après C-V-4 par `Get-CimInstance Win32_OperatingSystem` : 21 901 Mo libres, 14 `node.exe`, verrou libre ; aucune course ni harnais de ma part pendant sa suite ; fin 11:16:27Z) :
- enregistrement `F:/tmp/oracle-results/0ed778dbe0e09451584a003b19975670be7ff4e9-307a983cde73e93b-corr-20260929T110844Z-118256.json`, sha256 **`353de63a85d17ed805be00badc93a1f487bef18b2f0c65da7e5b81cd5abe38d3`** (= champ `sha256` de la ligne `oracle-result`, recalculé) ;
- `schema` `monark.oracle.v1`, `role` corr, `tree.head` `0ed778dbe0e09451584a003b19975670be7ff4e9`, `tree.dirty` `307a983cde73e93bba456028bce49e4949d8135303324c4b32a57216a3d25e92`, `tree.object` `3bf1639217b2a335be8bb70c60ad44e4d39042c9`, `base` `aca75444…`, **exit 0**, `static_only:false`, `served_from:null` (arbre non propre : rejoué, jamais servi, D4 ; décision 282 : `--key` passé), C-V-4 sous verrou 21 821 Mo / 15 `node.exe` ;
- 9 portes vertes : `lint-model-pinning`, `r25` (STAT 543/0, CONTENT 0), `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet` (hors verrou), `test` (sous verrou, 391 s ; test 42 une fois, dans la suite) ;
- **tests 1 662 = 1 649 + 13** (= 1 625 + 37 ; pass 1 659, fail 0, skip 3) ; les 37 tests du lot verts dans `09-test.log` (sha256 `c60a2330b9d83b858c8b6f7a5bdcc3d08f9fe258e476f55fd366bd66087d0dc3`), ainsi que `byte_guard_tracked_tree_is_clean` et `no_secret_in_repo` ; skip 3 au lieu de 4 au G2 : le test de corpus `F:/tmp/dojo/mission-g2-rg1b.md` a tourné ici (dépend d un fichier de l hôte), sans lien avec le lot ; `residues.tmp_entries` 379 (= G1, G2).
- Instantané de l oracle = état livré moins la présente section 16 de ce journal (ajoutée après le lancement ; seul `docs/G1-lot-methode-m7.md` diffère, exclu de R-25) : octets du journal final contrôlés (0 CR, 0 TAB, 0 octet de contrôle, 0 point de code C1, fin par LF) et tests d hygiène du tronc sur un clone qui SUIT le journal final (§ 16.14).

### 16.14 Hygiène finale et livrables

- Dépôt (worktree, non commis) : `scripts/mission/relance.mjs`, `scripts/mission/relance.d.mts`, `test/mission-relance.test.ts`, ce journal (section 16) ; fixtures inchangées (9 fichiers, sha256 du gel) ; aucun fichier non suivi.
- Hors dépôt : `F:/tmp/methode/m7/corr1/` (`work/`, `f2p/`, `f2p-all/`, `mutants-def/`, `mutants/`, `relance/`, `r25/`, `base/`, `hygiene/`, `tmp/`) ; aucune scission (`F:/tmp/methode/m7/split/` non créé) ; livrables `F:/tmp/methode/m7-corr1-deliver/REPONSE.md` et `DELIVERED.sha256`.
- Hygiène sur le journal final : `F:/tmp/methode/m7/corr1/hygiene/hygiene.mjs` (clone `--no-local` du worktree, les 4 fichiers changés copiés et commis dans le clone seul, donc SUIVIS ; verrou libre) : `byte-guard`, `no-secret-in-repo`, `public-text-deny` et le test du lot : 58/58 verts (11:17:39Z → 11:17:56Z, TAP sha256 `a6bdaa86f765b7ca12cf417d582f458d1c46c1d8b60915adf0d3a77975c7f7b8`) ; rejoué après l ajout de ces dernières lignes (`hygiene2/`, § 16.15).
- Jonction `node_modules` du worktree retirée par `rm-nm.ps1` avant le rendu ; worktree : 4 fichiers modifiés, 0 non suivi ; `F:/Monark` : aucun changement de ma part.

### 16.15 Verdict du tour 1

**CORRIGÉ** : C-G2-1 à C-G2-7 tenues (C-G2-8 : 0 ligne touchée ou créée au-delà de 160 caractères, le reste en item) ; 37/37 tests ; R-25 543 ≤ 547 sans scission ; F2P 3/3 (et 37/37) ; 35/35 mutants tués ; rejeu réel R2 0 divergence, R3 `replaced` exit 0 `resume` nul, R7 `vacuous` vrai et `stored`, R10 `seven_day` sans divergence ; oracle corr exit 0, 1 662 = 1 649 + 13. Questions Q-C1-1 à Q-C1-9 (§ 16.9). Fin de rédaction du journal : 2026-09-29T11:25Z (`date -u`) ; l hygiène du journal final et le manifeste sont cités dans `F:/tmp/methode/m7-corr1-deliver/REPONSE.md`.
