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
