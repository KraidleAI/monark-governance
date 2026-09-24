# Re-G2 (micro-pli 7cc6176) — lot HARNESS-DESC-1 — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

# RE-G2 — pli C-G2-1 du lot HARNESS-DESC-1 (`lot/harness-desc-1` @ `7cc6176`, parent `906064b`) — même relecteur G2, contexte intact

**Verdict : PASS** pour le pli `7cc6176`, sans correction du lot (§7). Trois conditions reviennent à G7 comme actes de
l'orchestrateur : **O-1b-G2-3**, un rouge `no_secret_in_repo` PRÉEXISTANT sur `lot/etude-suite` et étranger au lot ; O-4,
l'insertion de l'ADR ; la re-mesure si du code arrive entre-temps.

> Rendu écrit au fil de l'eau : ouverture à 2026-09-23T00:19:40Z, finalisé à 00:41Z (dernier `date -u` 00:40:57Z). Périmètre : `F:\course-bell\*` et
> `F:\course-ukemi\*` ne sont PAS ouverts.

## 0. En-tête A-12 et cadre

- Relecteur : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, décision 133), effort max. C'est le même relecteur
  que le G2 initial (`F:\tmp\g2-hdesc1\G2.md`, sha `80653475…`), contexte intact. Le générateur du pli est un worker distinct.
- Objet : `7cc6176e9aee936f29150c746d9af893267a204a` sur `lot/harness-desc-1`, parent `906064b`. Test seul :
  `test/verify-harness-liq.test.ts` (annoncé +100/−2).
- `F:\Monark` : je n'y écris jamais. À 00:19Z, sa porcelain compte 1 ligne, ` M docs/CHANTIERS.md` ; c'est l'orchestrateur
  qui édite, sur `lot/etude-suite`.
- Clone `F:\tmp\g2-hdesc1\tree` : porcelain 0 au départ, puis `git fetch origin` et `git checkout --detach 7cc6176`.
  HEAD vaut `7cc6176e9aee936f29150c746d9af893267a204a` et la porcelain reste 0. `origin/lot/etude-suite` =
  `b147db04673b123745d78fc93e48c020211975dd` à 00:19Z.
- A-7 : tout oracle, test, mutant et recorder tourne sous `env -u` des 8 variables payantes. TEMP/TMP(/TMPDIR) =
  `F:\tmp\g2-hdesc1\os-tmp`. Aucun réseau : `127.0.0.1` seulement.
- Pièces du pli vérifiées :
  - `DELIVERED.sha256` : sha `679fa156…`, conforme à l'annonce, et `sha256sum -c` sur `tree` @ `7cc6176` = **9/9 OK** ;
  - la seule ligne changée est celle de `test/verify-harness-liq.test.ts`, `b4c0b075…` → `5aca9f80…` ;
  - `ADR-DELTA-1b.md` `48c3b49a…` (conforme) ; `RENDU-MICROPLI-1b.md` `313c9ede…` ;
  - `work1b/mutants-1b.mjs` `5bdc15f2…` : diff lu contre le harnais G1, 25 entrées identiques + 6, extraction du `error:` du
    tueur, TMPDIR.

## 1. Diff lu ligne à ligne (D-4)

`git diff --numstat 906064b 7cc6176` : **1 fichier**, `test/verify-harness-liq.test.ts` **+100/−2**.
- Les **2 lignes retirées** sont deux imports, remplacés par des **sur-ensembles** :
  - `startServer` → `API_HOST_PREFIX, startServer` ;
  - `LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_H3_SENTENCE` → + `describeGate, GATE_TOOL_DESCRIPTION, LIQ_COMMITTED_SENTENCE,
    LIQ_CONDITIONAL_SENTENCE, TASK_BTC_DIR, TASK_CASCADE, TASK_LIQ_ELIGIBLE, TASK_STABLE_RUN`.
- Ajouts : `import { createServer, request as httpRequest } from "node:http"`, puis le commentaire (3), les types
  `Rewrite`/`Vector`/`Seen`, `overclaimingProxy`, `portOf`, `shut` et le test (3).
- **Aucune assertion des tests (1) et (2) n'est touchée** (D-4 conforme).
- Lecture du mandataire :
  - il relaie TOUTE requête vers le vrai harness (`startServer(0)`), avec `agent: false`, un timeout de 10 s et 502 en cas
    d'erreur ;
  - il ne réécrit que (i) la description de `gate` dans la réponse `tools/list`, sur la surface MCP. Le remplacement porte
    sur la chaîne JSON-échappée de `GATE_TOOL_DESCRIPTION` ; si elle apparaît un nombre de fois ≠ 1, il répond 500
    (fail-closed) ;
  - (ii) la réponse au `POST /gate` dont le corps porte `"task_class":"liquidation-eligible-coverage"`, sur la surface
    `api.`.
- Quatre vecteurs (α, β, γ, δ). Pour chacun, le test asserte l'ensemble des rouges **FERMÉ** (égalité), le `detail` exact
  des deux contrôles liq, les compteurs `{ rewrites: 2, liq: 1 }` et un exit ≠ 0.
- Formes réelles (A-8), vérifiées par moi :
  - le 400 d'α = `{ error: "tool_error", operation, message }`, identique à `apps/harness/src/http.ts:102` ;
  - le succès du miroir = `json({ structuredContent, content })` avec le statut par défaut 200 (`http.ts:38,98`) ;
  - le message d'α reprend le gabarit de `1447c05:apps/harness/src/tools/gate.ts:551` (`unknown task_class '…' (known: …; or
    supply params.calibration for BYO)`), noms de classes importés ;
  - β, γ et δ partent du corps RÉEL et n'y changent qu'un jeton.

## 2. Oracle sur `tree` @ `7cc6176` (logs `logs/re-g2/oracle-7cc6176/`, 00:21:40Z → 00:27:23Z)

| gate:vocab | typecheck | test (tests/pass/fail/skip) | lint | lint:ratchet | lang:gate | export:check |
|---|---|---|---|---|---|---|
| 0 | 0 | exit 0 : **928/927/0/1** | 0 | 0 (69/69) | 0 | 0 |

- Skip nommé : `u4b_labels_replay_via_main_real_artifact`, préexistant.
- 928 = 927 + 1 test neuf, `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`. Il est vert en 41 318 ms dans la
  suite complète.
- Le fichier seul passe 3/3 sur 2 runs, en 28 034 ms puis 8 008 ms pour le test (3) (`logs/re-g2/testfile-run{1,2}.log`).
  La durée varie avec la charge de la machine ; la marge reste large face au timeout enfant de 60 s (`runCa`) et au
  `--test-timeout` de 120 s. Voir O-1b-G2-2.
- **R-25** (pathspec VERBATIM de `ci.yml:65`) : `153582f...7cc6176` donne `7 files changed, 423 insertions(+), 25 deletions(-)`,
  soit **448**, conforme à l'annonce. C'est sous 1 205 (CI) et sous 1 150 (STOP A-5). La borne « < 450 » est celle que le
  rendu du pli attribue à sa mission, que je n'ai pas lue ; la borne « < 400 » de la mission G1 ne visait que le lot initial
  (350).
- Fusion : voir §4.

## 3. Mutants rejoués sur `tree` @ `7cc6176` (00:28Z → 00:31Z ; porcelain 0 et `DELIVERED` 9/9 après)

### 3.1 Les 31 du pli (`w1b-mutants-copy.mjs` = `mutants-1b.mjs` avec ma seule ligne TEMP/TMP/TMPDIR)
Log : `logs/re-g2/w1b-mutants-on-7cc6176.log`.
- **31/31 tués par le test attendu** (byIntended A-11), 31/31 restaurés, exit 0. Découpage : 28/28 exigés (25 G1 + G2-5a/b/c)
  et 3/3 auto-déclarés.
- Vecteur tueur lu dans le `error:` du TAP, identique à la table du pli :
  - G2-5a → (alpha) ; G2-5b → (beta) ; G2-5c → (alpha) ;
  - `ca-reason-dropped` → (beta) ; `ca-said-dropped` → (gamma) ; `ca-has-empty-dropped` → (delta).

### 3.2 Mes mutants (`g2-mutants-1b.mjs`, sha `3073c475…`)
C'est `g2-mutants.mjs` (`d012bbf6…`) avec G2-5a/b/c re-ciblés sur `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`,
plus 4 entrées. Log : `logs/re-g2/g2-mutants-1b-on-7cc6176.log`. La baseline dorée est verte.

| Mutant | Tueur visé | Observé (`error:` du tueur) |
|---|---|---|
| G2-1..G2-4, G2-6..G2-9 (inchangés) | inchangés | **8/8 tués** |
| **G2-5a** (`mcp_gate_description_liq` → statut seul) | test (3) | **tué**, (alpha) |
| **G2-5b** (`!hasH3` retiré) | test (3) | **tué**, (beta) |
| **G2-5c** (`gate_liq_call` → `ok: true`) | test (3) | **tué**, (alpha) |
| G2-11 (contrôles liq retirés de la liste `failed` : CA « VERIFY OK » exit 0 malgré le rouge) | test (3) | **tué**, (alpha) « the CA exits non-zero (stderr: VERIFY OK …) » |
| S1 (retrait isolé de `res.status === 200`, `gate_liq_call`) | test (3) | survit, comme déclaré par le pli |
| S2 (retrait isolé de `res.status === 200`, `mcp_gate_description_liq`) | test (3) | survit, comme déclaré par le pli |
| **G2-10 (SONDE)** : dans la branche d'échec, `process.exit(1)` → `process.exit(0)` | test (3) | **SURVIT sous win32** (voir §5) |

Résumé : 12/12 tués attendus, 2/2 survivants prédits, sonde G2-10 non tuée, 15/15 restaurés, état suivi identique.

### 3.3 Survivants déclarés (`w1b-survivors-copy.mjs`)
Log : `logs/re-g2/w1b-survivors-on-7cc6176.log`. Résultat : **3/3 conformes à la déclaration**.
- S1 (sha muté `0e957f4e…`) et S2 (`0823be4c…`) : `test/verify-harness-liq.test.ts` 3/3 verts.
- S3, UPPER ajouté à la branche vide (`9968e058…`) : il survit aux tests CA, mais il est tué en dépôt par
  `hdesc_served_gate_description_is_the_empty_registry_clause`, avec aussi `hdesc_describe_gate_two_states` rouge.

## 5. G2-10 : pourquoi il survit, et le remède mesuré (`probe-g210.mjs`, log `logs/re-g2/probe-g210.log`, 00:31Z)

Trois copies de `scripts/verify-harness.mjs` @ `7cc6176` ont été écrites hors dépôt (la CA est sans dépendance). Chacune a
tourné contre le vrai harness in-process, en mode « fail » (échec provoqué hors réseau) puis en mode « ok », 2 runs par mode :

| Variante (branche d'échec) | sha | fail : exit / assertion libuv | ok : exit |
|---|---|---|---|
| dorée : `process.exit(1)` | `a0f478e5…` | **3221226505** / oui (2/2) | 0 (2/2) |
| G2-10 : `process.exit(0)` | `66739d1e…` | **3221226505** / oui (2/2) | 0 (2/2) |
| remède candidat : `process.exitCode = 1; return;` | `7976f242…` | **1** / **non** (2/2) | 0 (2/2) |

- **Cause (mesurée).** Sous win32, tout `process.exit()` appelé après les `fetch` de la CA finit sur l'assertion libuv
  `src\win\async.c:76`. Le code de sortie vaut alors 3221226505 **quel que soit l'argument**. L'assertion `notEqual(r.code,
  0)` du test (3) ne peut donc pas distinguer `exit(0)` de `exit(1)` sur l'oracle local. C'est R-HD-2 : la classe
  `fetch` + `process.exit()`, documentée en dépôt (`docs/CHANTIERS.md:586`, `nodejs/node#56645`, lue sur place par
  l'orchestrateur ; [2nd] pour moi).
- **Sous ubuntu (CI, job `g3-verification`, `ci.yml:99,111`),** G2-10 donnerait exit 0 et serait tué par
  `notEqual(r.code, 0)`. **C'est inféré, pas mesuré** : l'issue amont dit « does not reproduce on Linux ».
- **Remède mesuré.** Sortir par `process.exitCode = 1` au lieu de `process.exit(1)` donne exit **1**, sans assertion, et exit
  0 en succès. R-HD-2 disparaît et le code devient observable sous win32.
- **Ce que l'assertion discrimine vraiment.** Elle n'est pas vide pour autant. Quand la CA « oublie d'échouer » et
  n'appelle pas `process.exit`, elle sort naturellement à 0, sans assertion libuv : c'est G2-11 (liq retirés de `failed`),
  tué en (alpha) par cette même assertion. L'assertion discrimine donc la classe « la CA n'échoue pas ». Elle ne
  discrimine PAS, sous win32, la classe « la CA échoue avec le mauvais code ».
- **Portée.** C'est une modification de la CA, donc hors du périmètre test seul du pli, de la même classe que R-1b-2 (O-6).
  Le pli s'est conformé à ma propre spécification C-G2-1 (« asserter ≠ 0 et non === 1 à cause de R-HD-2 »).
- **Risque opérationnel borné.** Le feu vert du déploiement exige exit 0 **ET** `VERIFY OK` sur stderr (RUNBOOK étape 6) ;
  sous G2-10, stderr porte `VERIFY FAILED`.
- ⇒ **item formé O-1b-G2-1** (§6), pas une correction du pli.

## 4. Fusion à blanc sur la cible du moment (`merge-es3`)

- **Arbre.** `merge-es3` = clone de `lot/etude-suite` @ **`3d1303f7c42ef29497d47651ee458c4f84d97391`** (HEAD à 00:32Z) +
  `git merge --no-commit --no-ff origin/lot/harness-desc-1` (`7cc6176`) : « Auto-merging apps/harness/src/tools/gate.ts …
  went well ».
  - A-9 (`eab911a`) et U-4b-1b-3 (`b9eb62b`) sont dans cette base.
  - `7cdfb7c..3d1303f` hors `docs/` = `u4b-select-episode.{mjs,d.mts}` et son test, sans intersection avec le lot.
- **Contenu fusionné.**
  - Le `gate.ts` fusionné a le sha `4cc340e2…`, identique à mes arbres A-9 du G2 : lot + commentaires A-9.
  - Les 8 autres fichiers sont **== blobs `7cc6176`** (dont le test `5aca9f80…`).
- **Recorder h5** (hors réseau) : 21 943 o, LF **`90a21adf…8252`** = index, `git diff` worktree↔index = 0. **Identique**,
  comme attendu.
- **Oracle sur `merge-es3`** (00:32:58Z → 00:35:34Z, logs `logs/re-g2/merge-es3/oracle/`) :

  | gate:vocab | typecheck | test (tests/pass/fail/skip) | lint | lint:ratchet | lang:gate | export:check |
  |---|---|---|---|---|---|---|
  | 0 | 0 | **exit 1 : 958/955/1/2** | 0 | 0 | 0 | 0 |

  - Skips nommés : `sentinel_run_releases_chainstack_lock_on_sigterm` et `u4b_labels_replay_via_main_real_artifact`.
  - Tous les tests du lot sont verts : les 4 `hdesc_*`, les 3 `verify_harness_*` (test (3) en 7 383 ms),
    `probe_harness_records_real_decision` et `harness_tool_descriptions_pass_vocab`.
  - **Le seul rouge, `no_secret_in_repo`, est ÉTRANGER au lot et PRÉEXISTANT sur la cible.**
    - Le motif `*_API_KEY= inline assignment` frappe `docs/G2-lot-u4b-1b-4-integral.md:78`. Ce fichier n'est pas dans le
      diff du lot (0 occurrence) : il a été introduit par **`b147db0`** (« G2 U-4b-1b-4 persisted », 00:14Z).
    - Reproduit **sans le lot** : `lot/etude-suite` @ `3d1303f` pur (clone `base` détaché) donne `no_secret_in_repo` ROUGE,
      même hit (`logs/re-g2/no-secret-on-etude-3d1303f.log`). Le parent de `b147db0`, `b7defaf`, est VERT
      (`…-b147db0-parent.log`).
    - Forme du jeton, **sans jamais l'imprimer** (A-7 ; `secret-shape-probe.mjs` `0a834fc8…`, log `secret-shape-probe.log`) :
      nom `HELIUS_API_KEY`, longueur 11, mot fictif de ma liste fermée présent, **non** UUID (forme d'une clé Helius réelle),
      dans une portée de code. Il s'agit selon toute vraisemblance d'une valeur fictive citée, mais c'est à l'orchestrateur
      de le confirmer.
    - ⇒ **item bloquant pour G7** (O-1b-G2-3), sans lien avec ce lot.
- **Mutants sur `merge-es3`** :
  - les 31 du pli : **31/31** tués par le test attendu (28/28 + 3/3), 31/31 restaurés, vecteurs identiques
    (`logs/re-g2/w1b-mutants-on-merge-es3.log`) ;
  - mes 15 : **12/12** tués attendus, S1/S2 survivants prédits, sonde G2-10 non tuée, 15/15 restaurés, état suivi identique
    (`logs/re-g2/g2-mutants-1b-on-merge-es3.log`) ;
  - après : `git diff --name-only` = 0, 9 entrées indexées.

## 6. Jugements, items et observations

- **C-G2-1 : TENUE.**
  - G2-5a, G2-5b et G2-5c, qui survivaient à `906064b` (mesure G2), sont désormais ROUGES par le test nommé
    `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`, en byIntended A-11. C'est le cas sur `7cc6176` comme sur la
    cible fusionnée, et dans les deux harnais (celui du pli et le mien). Les vecteurs tueurs sont (alpha), (beta), (alpha).
  - Le pli va au-delà de ma spécification. (gamma) couvre la « limite nommée » `said === true`, que j'avais laissée
    optionnelle. (delta) isole `hasEmpty`, que ni α ni β n'isolaient (D-1 du pli, mesuré : `ca-has-empty-dropped` passe α,
    β et γ). Chaque prédicat de chaque contrôle liq a désormais son vecteur et son mutant rouge. Seuls restent les
    prédicats de statut (S1/S2).
- **D-3 / « faux client » : conforme.** Le système sous test est la CA exécutée comme au déploiement. Le mandataire relaie
  le VRAI harness (formes réelles, A-8) et n'altère que deux points ; le motif est cité (`probe-narabi-state.test.ts:97-101`).
- **S1/S2 (R-1b-1) : équivalence ACCEPTÉE**, au sens « aucun producteur réel ne distingue ». Sources relues par moi :
  - `http.ts:38` (`json(body, status = 200)`) et `:98` : seul site qui émet `structuredContent`, sans statut ⇒ 200 ;
  - SDK `@modelcontextprotocol/server` 2.0.0 (version lue dans `package.json`), `dist/index.mjs` : `:367-379`
    `createJsonErrorResponse` ⇒ `{ jsonrpc, error, id: null }` sans `result` ; `:682` ⇒ 202 corps nul ; `:754-756` SSE et
    `:893-897` JSON ⇒ 200.
  - Mesuré : ils survivent (mes harnais et `survivors-1b`). Ce ne sont pas des équivalents stricts : un intermédiaire qui
    réécrirait le statut en gardant le corps les distinguerait. Mais un tel intermédiaire ferait aussi rougir
    `mcp_tools_list`/`gate_call`, qui exigent 200 sur les mêmes surfaces. Déclencheur de réexamen (changement du SDK ou du
    miroir) : correct.
- **O-6 / S3 (R-1b-2) : item ACCEPTÉ tel que formé.** Propriétaire : orchestrateur. Déclencheur : prochaine modification de
  la CA, au plus tard la bascule -2b. Lacune mesurée : S3 survit à la CA, mais il est tué en dépôt par
  `hdesc_served_gate_description_is_the_empty_registry_clause`. Aucun SHA servi connu n'est dans cet état.
- **ADR-DELTA-1b (§6-bis) : forme conforme.**
  - Provenance, constat, test nommé, table des 4 vecteurs (listes fermées), ligne Tuyaux (`ci.yml:99,111` =
    `g3-verification` / `npm test`, vérifié), table des 6 mutants de prédicats avec leur vecteur (reproduite à l'identique).
  - R-1b-1 et R-1b-2 ont un déclencheur. L'extension de §4 (c) (re-dériver les 4 vecteurs et rejouer les 6 mutants à -2b)
    est posée, et le test (3) sert de fil-piège contre une bascule vacante. Aucun renvoi `F:`.
  - Sources de l'observation D4 vérifiées : `docs/CHANTIERS.md:586` et `docs/CHECKPOINT2-lot-t1a-iii-a1-bis.md:63`.
  - Mes rejeux (≈ 24 exécutions du fichier CA) ne contiennent **aucun** `not ok` de niveau fichier non signé.
- **O-4 (insertion ADR) : RESTE l'acte G7.** Le pli ne touche ni `docs/RUNBOOK-harness.md` ni `docs/adr/` (diff = 1 fichier),
  et `ADR-amendement.md` est intact (`8786ad40…`). Au commit de fusion, G7 insère dans `ADR-U4b` l'amendement HARNESS-DESC-1
  (O-2 et O-3 appliqués) PUIS le §6-bis après son §6, **dans le même commit**. Sinon le renvoi du RUNBOOK « section 4 »
  reste pendant.
- **O-1 (G2) : CLOS.** `docs/G1-lot-harness-desc-1-integral.md` (`a495c96`) == `F:\tmp\hdesc1\G1.md` octet pour octet
  (sha `fb9d6318…`).

### Items formés par ce RE-G2 (aucun « dû » nu)
- **O-1b-G2-1 : le code de sortie de la CA est masqué sous win32 ; remède mesuré** (§5).
  - Constat : l'assertion `notEqual(r.code, 0)` du test (3) ne tue pas G2-10 (CA qui sort 0 en échec) sur l'oracle local
    win32, car `process.exit()` après `fetch` finit toujours sur l'assertion libuv (3221226505). Sous ubuntu (CI), c'est
    inféré tué, sans mesure.
  - Remède mesuré : `process.exitCode = 1` au lieu de `process.exit(1)` ⇒ exit 1, sans assertion libuv. Il faut l'appliquer
    aux deux sites de sortie de `scripts/verify-harness.mjs` (branche d'échec et `main().catch`), puis resserrer le test (3)
    à `r.code === 1`. Cela tue G2-10 sur toutes les plateformes et **retire R-HD-2**.
  - Propriétaire : orchestrateur. Déclencheur : la prochaine modification de la CA, même déclencheur que R-1b-2, donc au plus
    tard la bascule -2b.
  - Éditorial à l'insertion G7 : dans l'ADR-amendement §6, la ligne « R-HD-2 … aucun item » devient « R-HD-2 → item
    O-1b-G2-1 (remède mesuré) ». Le §6-bis peut porter une phrase : « exit ≠ 0 non discriminant sous win32 (R-HD-2) ».
- **O-1b-G2-2 : durée du test (3) (observation).**
  - Mesures : 41,3 s dans la suite complète sur `tree`, 28,0 s puis 8,0 s sur le fichier seul, 7,4 s sur `merge-es3`. La
    variation suit la charge de la machine, qui fait aussi passer le test (2) de 0,66 s à 3,7 s.
  - Marge : timeout enfant de 60 s par exécution de la CA, `--test-timeout` de 120 s.
  - Propriétaire : orchestrateur. Déclencheur : le premier dépassement ou timeout de ce test, en CI ou dans un oracle.
- **O-1b-G2-3 : BLOQUANT POUR G7, hors lot.** `lot/etude-suite` @ `3d1303f` est ROUGE sur `no_secret_in_repo`
  (`docs/G2-lot-u4b-1b-4-integral.md:78`, introduit par `b147db0`).
  - Aucune fusion G7 dans `lot/etude-suite`, celle-ci comprise, ne peut produire un oracle vert tant que ce n'est pas corrigé.
  - Action : l'orchestrateur confirme le caractère fictif de la valeur, sans l'imprimer, puis reformule la ligne. La forme
    `NAME=<valeur>` déclenche le motif `[^\s"'#]{6,}`, même avec des chevrons. Il re-persiste avant toute fusion et rejoue
    `no_secret_in_repo`.
  - Si la valeur était réelle : rotation, précédent A-7.
  - Propriétaire : orchestrateur. Déclencheur : immédiat, avant G7.

## 7. Verdict

**PASS** pour le pli `7cc6176` : aucune correction n'est demandée sur le commit du lot.
- C-G2-1 est tenue et mesurée. G2-5a/b/c sont ROUGES par le test nommé, avec 31/31 et 12/12 sur `7cc6176` comme sur la
  cible fusionnée.
- D-4 est conforme : imports remplacés par des sur-ensembles, aucune assertion touchée.
- L'oracle du lot est vert à 928/927/0/1. R-25 = 448. `DELIVERED` 9/9. Le pin h5 `90a21adf…` est identique sur la cible
  fusionnée.
- S1/S2 : équivalence acceptée. O-6/S3 : item accepté. ADR-DELTA-1b conforme.

Conditions posées à G7 (actes de l'orchestrateur, pas des corrections du pli) :
1. **O-1b-G2-3** : rendre `lot/etude-suite` vert sur `no_secret_in_repo` avant la fusion.
2. **O-4** : insérer l'ADR-amendement (avec O-2, O-3 et la ligne R-HD-2 → O-1b-G2-1) puis le §6-bis, dans le commit de
   fusion.
3. Re-mesurer l'oracle, le recorder h5 et les mutants sur l'arbre réellement fusionné si `lot/etude-suite` reçoit du CODE
   après `3d1303f`.

Items suivis : O-1b-G2-1 (remède R-HD-2 mesuré, à la prochaine modification de la CA), O-1b-G2-2 (durée), R-1b-1, R-1b-2,
extension de §4 (c).

## 8. Reproduction (toujours sous `env -u` des 8 variables ; TEMP/TMP/TMPDIR=`F:\tmp\g2-hdesc1\os-tmp`)

Scripts (sha256) : `g2-mutants-1b.mjs` `3073c475…`, `w1b-mutants-copy.mjs` `a8f8eed6…`, `w1b-survivors-copy.mjs` `a5d54a1e…`
(copies du pli où seule la ligne TEMP diffère, via `copy-1b-harness.mjs` `1426f388…`), `probe-g210.mjs` `415097b7…`,
`secret-shape-probe.mjs` `0a834fc8…`, `oracle.sh` `a0a7df2b…`, `merged-checks.sh` `d97ff761…`.
```
git -C F:/tmp/g2-hdesc1/tree fetch origin ; git -C F:/tmp/g2-hdesc1/tree checkout --detach 7cc6176
bash F:/tmp/g2-hdesc1/oracle.sh F:/tmp/g2-hdesc1/tree <logdir>
node F:/tmp/g2-hdesc1/w1b-mutants-copy.mjs <tree> ; node F:/tmp/g2-hdesc1/w1b-survivors-copy.mjs <tree>
node F:/tmp/g2-hdesc1/g2-mutants-1b.mjs <tree>
node F:/tmp/g2-hdesc1/probe-g210.mjs                                   # codes de sortie : dorée / exit(0) / exitCode
git clone --no-hardlinks --branch lot/etude-suite F:\Monark F:\tmp\g2-hdesc1\merge-es3 ; git merge --no-commit --no-ff origin/lot/harness-desc-1
bash F:/tmp/g2-hdesc1/merged-checks.sh F:/tmp/g2-hdesc1/merge-es3 <logdir>   # recorder h5 + oracle
node F:/tmp/g2-hdesc1/secret-shape-probe.mjs <tree> 78                  # forme seule, jamais la valeur
```
Logs (sha256, préfixe) sous `F:\tmp\g2-hdesc1\logs\re-g2\` :
- `oracle-7cc6176/test.log` `0e6a4f3f…`, `merge-es3/oracle/test.log` `107a062e…` ;
- `w1b-mutants-on-7cc6176.log` `2ff25263…`, `w1b-mutants-on-merge-es3.log` `c7b2e514…`, `w1b-survivors-on-7cc6176.log`
  `0af54c2c…` ;
- `g2-mutants-1b-on-7cc6176.log` `bb88024d…`, `g2-mutants-1b-on-merge-es3.log` `e4e7558b…` ;
- `probe-g210.log` `b6dd5829…`, `merge-es3-summary.log` `766f536e…`, `merge-es3.log` `b9653ee5…` ;
- `no-secret-on-etude-3d1303f.log` `d489ca6d…`, `no-secret-on-etude-b147db0-parent.log` `b1d34197…`,
  `secret-shape-probe.log` `7710e60d…` ;
- `testfile-run{1,2}.log` `a1a45673…` / `6ee08c81…`.

Clones (`tree` @ `7cc6176`, `base` détaché à `b7defaf` après le contrôle, `merge-es3`) : laissés en place pour R-21.
**Pour rejouer le G2 initial (`G2.md` §8), re-détacher d'abord `tree` à `906064b` et `base` à `153582f`** : ces deux clones
ont bougé pendant ce RE-G2, et les commandes de `G2.md` §8 (`served-diff.mjs base tree`, `oracle.sh tree`, harnais sur `tree`)
ne reproduisent ses chiffres qu'à ces deux SHA.
Nettoyage : `rm-nm.ps1` d'abord, jamais `Remove-Item -Recurse`. `F:\Monark` : porcelain vide à 00:37Z (le
`docs/CHANTIERS.md` de 00:19Z a été committé par l'orchestrateur). Aucune écriture de ma part ; `F:\course-bell\*` et
`F:\course-ukemi\*` n'ont pas été ouverts.

---
Fichier du rendu : `F:\tmp\g2-hdesc1\G2-1b.md` (sha256 `db1eda8dba65885accaab4f545023af089960d79a704a1698315b0f6433fd310`, 23 425 o). Le rendu du G2 initial reste `F:\tmp\g2-hdesc1\G2.md` (`80653475…`). Aucun commit ; porcelain de `F:\Monark` vide au rendu.
