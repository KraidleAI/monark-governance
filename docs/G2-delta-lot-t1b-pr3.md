# G2-delta — pli C-V PR-3 T-1b (`bca7f5d`, relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2d-t1b-pr3/G2.md` (sha256 656e7066…). Verdict : PASS-AVEC-CORRECTIONS (C-D-1 masque D-P2 du garde RUNBOOK trop large, test-only) ; déclencheurs tirés : RUNBOOK-KEY-GLOB-1 (second chemin `signing-key-new.pem` non couvert, o04 ; `set -x` en ligne, o07), HTTP-TEST-CRASH-1 (2e occurrence 0xC0000409, `verify-harness-liq.test.ts`, rejeu vert) ; items O-D1 (statut inconnu ⇒ contrôle 5 rouge non testé), O-D3 (ordre C-V-7 sans test), O-D4 (FAITS-vps-bell-precheck absent des branches PR, résolu à la fusion) ; oracle PR-3 7 × 0, fusion PR-2+PR-3 = merge-tree `0055b7d` 0 écart, contrôle 5 ok sans SKIP, 64/64 + 12 propres ; R-25 998.

---

# G2-delta — lot T-1b-backend PR-3, pli C-V (`bca7f5d` sur `a31c8f3`, branche `lot/t1b-pr3`)

Relecteur G2 en contexte frais, instance séparée du rédacteur. Modèle résolu **`claude-opus-5-5[1m]`** (préfixe R-1 conforme), effort max,
2026-09-23, 19:51:40Z → 20:1xZ (§11). Lecture seule sur les dépôts : clone `--no-hardlinks` de `F:\Monark` dans `F:\tmp\g2d-t1b-pr3\clone`,
arbres de travail sous `F:\tmp\g2d-t1b-pr3\` seulement ; aucun commit, aucun workflow, aucun réseau hors loopback (`npm ci --offline`
depuis le cache local) ; ceinture A-7 `env -u` × 8 sur chaque commande et dans chaque harnais ; TEMP/TMP/TMPDIR = `F:/tmp/g2d-t1b-pr3/tmp` ;
aucune clé réelle (clés de test générées en mémoire par les tests et `check-r2-merged.mjs`).

Entrées : rendu `F:\tmp\t1b-pr3\RENDU-PLI-CV.md`, `PLI-CV.diff` (`91964a7f…`), `mutants\REPORT.jsonl` (`675c0ec1…`), harnais
`mutants.mjs` (`e40f4347…`) ; G2 PR-3 `F:\Monark\docs\G2-lot-t1b-pr3.md` (C-1..C-3, O-1..O-7) ; cp-2 PR-2
`F:\Monark\docs\CHECKPOINT2-lot-t1b-pr2.md` (C-V-6 l.76, C-V-7 l.77) ; sonde du relecteur G2 `F:\tmp\g2-t1b-pr3\probe\`.

## VERDICT : PASS-AVEC-CORRECTIONS — liste fermée : **C-D-1** (test-only, une seule)

Les corrections demandées au pli sont faites et prouvées par rejeu indépendant. C-V-6 : `--url` + statut exigé ; sur un arbre fusionné
prouvé égal à la vraie fusion, le contrôle 5 est `ok` sans SKIP et le mutant « forme positionnelle » est tué. C-V-7 : ordre et conséquence
écrits. C-1 : 13/13. C-2 et C-3 faites, mutants tués. Rejeu : 64/64 + 3/3, 0 écart avec le rapport du rédacteur ; oracle `bca7f5d` 7 × 0 ;
R-25 998.

Une régression du garde RUNBOOK est **introduite par le pli lui-même** (D-P2) et **mesurée avant/après** : c'est C-D-1. Le code livré
(CA, modèle Caddy, unité, RUNBOOK) n'est pas invalidé.

- **C-D-1 (test-only, `test/bell-deploy-config.test.ts`, `keyUses` / `bell_runbook_never_prints_private_key`)**
  - **Constat.** Le masque D-P2 remplace toute mention `` `/etc/monark/bell/signing-key.pem` `` (chemin seul entre accents graves)
    AVANT l'analyse. Une **instruction** en prose de lire la clé passe donc, par exemple
    ``Record sha256sum `/etc/monark/bell/signing-key.pem` in the JOURNAL.``
  - **Preuve avant/après, même phrase, même ancre « Never a manual snapshot. »** :
    - sur `a31c8f3` (garde d'avant le pli) : `not ok 1 - bell_runbook_never_prints_private_key`, avec
      « the key path is only generated, stat-ed, tested or shredded; found: '' » (`logs/o05-pre-pli.log`, `logs/o05-pre-mutant.tap`) ;
    - sur `bca7f5d` : SURVIVED (`mutants-own/o05-runbook-prose-hash-key-in-backticks.tap`) ;
    - témoin sans accents graves (o06) : KILLED.
  - **Ce que le rendu ne dit pas.** Il déclare le masque (« une mention en prose … est masquée (pas un usage) ») mais pas cette
    conséquence.
  - **Correction attendue** (≈ 1-3 lignes, test-only) :
    - ajouter à la liste `bad` l'échantillon négatif ``Record sha256sum `${KEY_PATH}` in the JOURNAL.`` ;
    - restreindre le masque pour que cet échantillon rougisse. Par exemple, refuser après masquage une commande qui lit des octets
      (`cat|head|tail|xxd|od|base64|sha\d*sum|md5sum|openssl|cp|scp|tar|dd|strings`) suivie du chemin masqué sur la même phrase.
      Autre voie : ne masquer que les mentions non précédées d'un verbe de commande.
  - **Critères de preuve** :
    - o05 KILLED ; o06, r01 et r03 toujours KILLED ;
    - les mentions en prose légitimes du RUNBOOK restent vertes (`ok` de `bell_runbook_never_prints_private_key` sur le RUNBOOK livré) ;
    - rejeu du harnais 64/64.
  - `error_origin` : **rédacteur du pli** (D-P2, masque plus large que nécessaire).

## 1. Périmètre (objets committés du clone ; `s1-scope.sh`, `logs/s1-scope.log` `8f0fa571…`)

- `git diff --name-status a31c8f3 bca7f5d` : **5 × M**, exactement `docs/RUNBOOK-bell.md`, `scripts/verify-bell.mjs`, `test/bell-caddy.ts`,
  `test/bell-deploy-config.test.ts`, `test/verify-bell.test.ts` (liste triée comparée : `diff` exit 0).
  - Parent de `bca7f5d` = `a31c8f3`.
  - `64dbbd6..bca7f5d` : les 11 chemins autorisés de la PR-3, rien d'autre.
- **9 gelés U-4b (prereg §2)**, sha LF (`git show <c>:<f> | tr -d '\r' | sha256sum`) : identiques aux trois commits `64dbbd6`, `a31c8f3`
  et `bca7f5d` (SAME3 × 9), et égaux octet pour octet aux valeurs de `docs/PLAN-u4b-prereg.md:116-124`. La liste :
  `u4b-scores 2f9a31f6…`, `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…`, `wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`,
  `rpc.ts 0e232519…`, `calib-digest 3603265d…`, `u3-realized cb020425…`.
- Blobs inchangés entre `a31c8f3` et `bca7f5d` : ADR-U4b, prereg, `bell-chain.mjs`, `bell-publish.mjs`, `ci.yml`, unité et Caddyfile.
- `DELIVERED-PLI-CV.sha256` : `sha256sum -c` 11 × OK sur le checkout de `bca7f5d`.
- `git diff a31c8f3 bca7f5d` (objets committés) est **identique octet pour octet** à `PLI-CV.diff` (`cmp` 0 ; sha `91964a7f…`, 328 l.) :
  l'orchestrateur a committé exactement les octets rendus.

## 2. C-V-6 (cp-2 PR-2) — `--url` + statut ; arbre fusionné ; mutant positionnel

**Lecture de la CLI de la PR-2** (`apps/bell/scripts/bell-verify.mjs` à `f40e0e6`) :
- l.119-124 : `(--url <base> | --dir <dir>) [--keyring <file>]`, sinon usage et exit 1 ;
- l.114 : statut `consistent_with_supplied_keyring` si `--keyring`, sinon `self_consistent_only` ;
- l.128 : une ligne JSON sur stdout.

**Côté CA (`scripts/verify-bell.mjs`)** :
- l.89 : `execFile(…, [script, "--url", url, "--keyring", keyring], …)` ;
- l.159-161 : `c05` exige `v.code === 0 && vStatus === "consistent_with_supplied_keyring"` ;
- l.202 : le prédicat « en-tête ligne 0 » est toujours présent, donc D-P3 n'affaiblit rien (mC tué par le cas « unit header not on
  line 1 »).
- Tests : argv asserté `["--url", url, "--keyring", <trousseau>]` (`test/verify-bell.test.ts:156`) ; RUNBOOK l.254 amendé.

**Arbre fusionné reconstruit par moi** (`setup.sh` `9b96be1e…`, `logs/setup.log`) :
- construction : `git archive f40e0e6` + `git archive bca7f5d -- <11 chemins PR-3>` → `F:\tmp\g2d-t1b-pr3\merged` ;
- **preuve d'égalité avec la vraie fusion à trois voies** : `git merge-tree --write-tree f40e0e6 bca7f5d` = arbre `0055b7da…`, exit 0,
  sans conflit ;
  - `diff` de cet arbre avec `bca7f5d` sur les 11 chemins PR-3 : 0 ligne ;
  - avec `f40e0e6` hors de ces 11 chemins : 0 ligne ;
  - répertoire comparé à l'arbre `0055b7d` par un index temporaire : **1 350 fichiers, 0 modifié, 0 non suivi** hors `node_modules`.
- PR-2 ∩ PR-3 = ∅ (11 + 11 chemins).
- Ce n'est PAS la pointe `lot/etude-suite` (D-P5 du rédacteur, ESC-G2-1).

**Résultats sur l'arbre fusionné** :
- `verify_bell_ca_check5_runs_real_bell_verify` **`ok 1129`, sans SKIP** (`oracle-merged-rejeu/test.tap` `8603d238…`) ; également
  `ok 4`, 4/4, skipped 0 dans la base de référence du harnais (`mutants-merged/baseline-verify-bell.test.ts.tap`).
- Sous-appel CLI de l'E2E PR-2 (colonne de vérification de C-V-6) :
  - `ok 45 - bell_publish_consumes_real_runmain_output_end_to_end` ; il appelle `--url … --keyring …` et asserte le statut
    `consistent_with_supplied_keyring` (`apps/bell/test/bell-served-e2e.test.ts:37-40`) ;
  - son sous-test `caddyfile_headers_applied` passe `ok`, non sauté (le Caddyfile de la PR-3 est présent).
- **Mutants sur l'arbre fusionné** (harnais du rédacteur, `MUT_WT`, `mutants-merged/REPORT.jsonl` `a402a7a6…`), bases 4/4 :
  - **x01 forme positionnelle contre le VRAI vérificateur : KILLED** par `verify_bell_ca_check5_runs_real_bell_verify`, détail
    `exit=1 status=undefined stdout_sha256=e3b0c442…` (stdout vide) ;
  - x02 et x03 KILLED par S-7.
- Mutants propres sur l'arbre fusionné (§7) : **o10** (le vérificateur ignore `--keyring`, donc exit 0 et `self_consistent_only`) KILLED,
  ce qui prouve D-P1 sur le vrai vérificateur ; **o11** (libellé de statut renommé côté PR-2) KILLED, ce qui prouve le liage du littéral
  (A-10).
- S-7 (`test/bell-deploy-config.test.ts:66-69`) : la regex couvre `privateKey: load("bell-signing-key")` à `bell-publish.mjs:384`
  (`f40e0e6`) ; `newKey: load("bell-signing-key-new")` (l.382) n'est pas capturé. Conforme.

## 3. C-V-7 — RUNBOOK « Key incidents » (l.297-319 à `bca7f5d`)

- **Commit + push du trousseau AVANT `--rotate`** :
  - « FIRST the new PUBLIC key is committed AND pushed … THEN the `key_rotation` line is signed » ;
  - R2 : « commit (R-20), full oracle (step 12), push (decision 136) ; (R3) starts only once that commit is pushed ». **Conforme.**
- **Conséquence de l'ordre inverse nommée** : « The reverse order leaves `rotation_key_not_in_keyring` for every verifier holding the
  committed keyring, and CA checks red, until the commit ». Le code existe : `bell-chain.mjs:133` à `f40e0e6`, liste des codes
  `bell-verify.mjs:17`. **Conforme.**
- **Fenêtre résiduelle nommée** (C-V-7 (ii)) : « between (R2) and (R5) check 3 … is red and check 5 is not ».
- R1-R5 lus contre la CLI PR-2 (`bell-publish.mjs:362-392`) :
  - `--rotate [--broken] --state` ;
  - `oldKey`/`newKey` = `bell-signing-key`/`bell-signing-key-new` (les deux credentials de R3 ; une seule en perte) ;
  - retour `"rotated"` (l.335) ;
  - `--generate-key` n'écrit que la partie publique, fichier en `wx` et `0600`.
- **R2 rejouée TELLE QU'ÉCRITE sur MON arbre fusionné**, donc avec le `bell-chain.mjs` de la PR-2 qu'utilisera l'opérateur
  (`check-r2-merged.mjs` `e7adebec…`, copie du script du rédacteur, 5 chemins changés) :
  - `R2 exit=0 keys=2 old_first=true new_second=true trustOf_ok=true canonical_line=true` ;
  - `key_id` faux ⇒ exit 1 « STOP: key_id mismatch » (`logs/check-r2-merged.log`).
- Hors périmètre du pli : la ligne ADR D9 de C-V-7 (i) et le compromis (iii) (« IMMEDIATELY » contre commit + oracle + push préalable)
  relèvent du G7 PR-2 (voir O-D3).

## 4. C-1 — RUNBOOK 13/13 ; sources de l'étape 1

- **Compte** (`c1-count.mjs` `4286024c…`, `logs/c1-count-bca7f5d.log`) : sur chaque section `## 1.`…`## 13.`, au moins un bloc
  ```` ```bash ````, un « Expected » et un « Rollback » : **13/13 à `bca7f5d`**, contre 11/13 à `a31c8f3` (12 et 13 incomplètes, constat
  du G2 reproduit). L'exit 1 du script vient de la section `## 0.` (tableau des portes), comptée à tort par sa regex ; les étapes 1-13 sont
  toutes OK.
- **Étape 12** : bloc d'une ligne, ceinture `env -u` × 8 enveloppant un `sh -c` avec 5 codes capturés, Expected, Rollback.
  **Étape 13** : « Rollback: none (read-only; the mirror file is kept) ». Textes exigés par C-1 (a).
- **Étape 1 (C-1 (b))**
  - « NTP `yes`: `CHANTIERS.md:123` (2026-09-20, "NTP synchronisé") » : **vérifié**. La ligne 123 porte « NTP synchronisé » dans l'entrée
    « VPS BELL PROVISIONNÉ ET CONFIGURÉ (2026-09-20 … » aux commits `bca7f5d`, `a31c8f3`, `64dbbd6`, `f40e0e6` et `54b9d73`. Ce dernier
    était la pointe de `lot/etude-suite` au début de cette revue ; il est ancêtre de `lot/etude-suite` (`342c45b`) et de `main`
    (`ec2d338`), relevés à 20:14Z, `is-ancestor` exit 0. La locution est unique dans le fichier.
  - `command -v node` / `command -v sudo` : « NOT measured before, measured HERE first ». Exact : 0 occurrence de `/usr/bin/node`, `sudo`,
    `NTP` et `timedatectl` dans le FAITS de précontrôle.
  - Autres valeurs, présentes dans le FAITS : `259.5-0ubuntu3.4`, `v24.21.0`, `11.19.0`, `v2.11.4`, ExecStart Caddy, ufw 22/80/443,
    `monark-probe.timer`, `run-p19072-i21642`, Caddyfile de 21 lignes. Utilisateur, répertoires et disque y sont écrits « ABSENT(S) » et
    « 94 G libres » ; le RUNBOOK en donne la forme shell attendue (équivalence, pas citation).

## 5. C-2 — P1..P5 ; g09, g10, g15, g16

- **Définitions des mutants g04, g09, g10, g14, g15, g16 : identiques octet pour octet** à celles du relecteur G2. `cmp-g2-defs.mjs`
  relu, log `find_equal=true replace_equal=true` × 6 ; ma copie du harnais ne diffère de l'original que par 3 lignes de chemins
  (`diff`, §7).
- **Cas P : constructions ÉQUIVALENTES aux définitions du G2, pas toutes identiques octet pour octet** :
  - P1 (`leak: { d: "A"×43 }` dans `provenance.json` servi ⇒ {c10}), P2 (`jwk.use = "sig"` dans le trousseau servi ET committé ⇒ {c10})
    et P3 (3ᵉ ligne `${sha("x")}  ./apps/bell/scripts/extra.mjs` ⇒ {c11}) reprennent le texte de `probe-isolations.test.mjs` ;
  - P4 (cas positif, 12/12 vert, `test/verify-bell.test.ts:158-159`) et P5 (deux lignes `import` ⇒ {c11}) utilisent un autre site
    `other.example { respond "other" }` et une ligne vide avant `import`, là où la sonde avait `example.org { respond "other site" }`.
    Même définition G2 (« autre site + UNE ligne `import` », dédié == blob).
- Assertion du test : ensemble rouge == {cible} pour chaque cas ; cas positif du mode import asserté vert.
- **g09, g10, g15, g16 : KILLED** au rejeu (§7, `mutants-replay/g09-…tap` … `g16-…tap`, par `verify_bell_ca_checks_named_and_fail_closed`).

## 6. C-3 — modèle Caddy fail-closed (`test/bell-caddy.ts:124-133`)

- `root` : refus si un `root` existe déjà, si le nombre de jetons ≠ 2 ou si le premier jeton ≠ `*`.
- `file_server` : refus si déjà vu, si plus d'un jeton ou si ce jeton ≠ `browse`.
- **g04 et g14 : KILLED** (rejeu).
- Les TAP montrent que c'est la branche des **jetons** qui lève sur g04/g14 (`file_server /states/* browse`, `root /bell/* /etc/monark`).
  J'ai donc isolé la branche des **doublons** :
  - **o12** (`root * /etc/monark` + `root * …/public`) : KILLED, levée sur la 2ᵉ ligne ;
  - **o13** (`file_server` + `file_server browse`) : KILLED, levée sur la 2ᵉ ligne.
  - o02 (un seul `file_server /states/* browse`) et o03 (un seul `root /bell/* …`) : KILLED.
- Exigence C-3 (« lève sur un second `root` ou `file_server`, et sur tout jeton autre que … ») tenue sur ses quatre branches.

## 7. Mutants — rejeu des 64 et mutants propres

**Rejeu des 64** :
- harnais `mutants-replay.mjs` (`9b60d8d3…`) = copie de `mutants.mjs` (`e40f4347…`), dont seules 3 lignes diffèrent (`diff`) :
  - `WT` par défaut = ma copie `pr3` de `bca7f5d` ;
  - `OUT` ;
  - `env` TEMP/TMP/TMPDIR, plus le libellé d'en-tête.
- Résultat : bases 4/4 ; **64/64 KILLED byIntended**, restaurés 64/64 (`mutants-replay/REPORT.jsonl` `6e644d4d…`).
- Comparaison au `REPORT.jsonl` du rédacteur (`675c0ec1…`) : **mêmes 64 identifiants dans le même ordre, 0 écart de sha golden, 0 écart
  de verdict, ensembles d'échecs identiques**. Les golden du rédacteur sont donc les octets committés de `bca7f5d`.
- Arbre fusionné : x01, x02 et x03 KILLED (§2).

**Mutants propres, verdict PRÉDIT avant exécution** (`mutants-own.mjs`) :
- v1 `fcdacbf5…` : o01..o11 ; v2 `8cd2cbf9…` : ajout de o12 et o13 seulement, après lecture des TAP de g04/g14.
- Rapports : `mutants-own/REPORT-own-o0.jsonl` `4ccff621…`, `-o1` `024a07f1…`, `-o12` `1dbad28d…`, `-o13` `38796a8b…`.
- **Prédictions tenues : 12/12.**

| id | arbre | mutation | prédit | verdict | test / motif |
|---|---|---|---|---|---|
| o01 | pr3 | c05 `vStatus === "consistent…"` → `vStatus !== "self_consistent_only"` (liste de refus) | SURVIVED | SURVIVED | aucun cas « exit 0 + statut autre/absent » → O-D1 |
| o02 | pr3 | Caddyfile : `file_server /states/* browse` (seul) | KILLED | KILLED | S-8, branche jetons |
| o03 | pr3 | Caddyfile : `root /bell/* …/public` (seul) | KILLED | KILLED | S-8, branche jetons |
| o04 | pr3 | R1 : `cat /etc/monark/bell/signing-key-new.pem;` | SURVIVED | SURVIVED | garde limité à `KEY_PATH` exact → O-D2 |
| o05 | pr3 | prose ``Record sha256sum `<clé>` in the JOURNAL.`` | SURVIVED | SURVIVED | **C-D-1** (tué à `a31c8f3`) |
| o06 | pr3 | même prose sans accents graves (témoin) | KILLED | KILLED | S-11 |
| o07 | pr3 | R3 : `set -x;` | SURVIVED | SURVIVED | déjà déclaré par le rédacteur → O-D2 |
| o08 | pr3 | retrait de « (R3) starts only once that commit is pushed; » | SURVIVED | SURVIVED | fichier entier : aucun test n'épingle l'ordre C-V-7 → O-D3 |
| o10 | fusionné | `bell-verify.mjs` : `kr = undefined` (ignore `--keyring`) | KILLED | KILLED | contrôle 5 réel (D-P1) |
| o11 | fusionné | statut `consistent_with_supplied_keyring` renommé | KILLED | KILLED | contrôle 5 réel (liage A-10) |
| o12 | pr3 | second `root * /etc/monark` | KILLED | KILLED | S-8, branche doublon |
| o13 | pr3 | second `file_server browse` | KILLED | KILLED | S-8, branche doublon |

Restauration à l'octet partout (`restored true` × 12). `git status --porcelain` des arbres `pr3` et `a31` : 0 ligne après les harnais.

## 8. Oracle 7 portes

**Sur `bca7f5d`** (copie `pr3`, `run-oracle.sh` `86f36b32…`, 19:56:02Z → 20:00:20Z) :
- `gate:vocab` 0, `typecheck` 0, test 0, `lint` 0, `lint:ratchet` 0 (69/69), `lang:gate` 0, `export:check` 0 ;
- TAP `oracle-pr3/test.tap` (`aed571fd…`) : **1 118 / 1 115 / 0 / 3 skipped** (win32 SIGTERM, artefact u4b absent, contrôle 5 sauté par
  son nom car la PR-2 est absente de cet arbre, ce qui est attendu). Ces chiffres sont ceux du rendu.
- Aucun test en ETIMEDOUT/EPERM ; le n° 42 de cet arbre est `ok`. T42-LOAD-1 n'est pas déclenché.

**Sur l'arbre fusionné** (preuve supplémentaire : le rendu n'y avait joué que 3 portes) :
- passe 1 (20:03:13Z → 20:06:14Z) : 6 portes à 0 (`gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`).
- Porte test à **1** : 1 139 / 1 136 / **1** / 2 (`oracle-merged/test.tap` `ead8e352…`).
  - Seul échec : le FICHIER `test\verify-harness-liq.test.ts`, `exitCode 3221226505` (0xC0000409, fast-fail Windows).
  - 2 de ses 3 tests avaient rendu `ok` ; le 3ᵉ n'a pas été rapporté.
  - Ce fichier n'appartient ni à la PR-2 ni à la PR-3.
- Rejeux :
  - fichier seul : 3/3 `ok`, exit 0 (`logs/liq-alone.tap` `c2ab3fdc…`) ;
  - **porte test complète** (20:06:35Z → 20:09:33Z) : **exit 0, 1 139 / 1 137 / 0 / 2**, comme le rendu (`oracle-merged-rejeu/test.tap`) ;
    `ok 1129` pour le contrôle 5 réel, `ok 42`.
- Voir O-D5 (déclencheur HTTP-TEST-CRASH-1) et D-R3 (ma charge concurrente pendant la passe 1). Sans effet sur le verdict du pli.

## 9. R-25, forme CI exacte (`r25.sh` `47669a5a…`, `logs/r25.log` `ca48efcb…`)

- Pathspec de `ci.yml` à `bca7f5d` + awk de la CI, sur objets committés : `git diff --shortstat 64dbbd6...bca7f5d` donne « 10 files
  changed, 994 insertions(+), 4 deletions(-) », soit **998 ≤ 1 150** (borne CI `VIBEGATES_PR_LIMIT` 1 205).
- Contrôle : `64dbbd6...a31c8f3` donne 939 (valeur du G2). Merge-base = `64dbbd6`.

## 10. Observations et items (aucun « dû » nu)

- **O-D1 (item formé BELL-CA-C5-STATUS-ALLOWLIST-1)** — o01 survit.
  - Aujourd'hui fonctionnellement équivalent : `bell-verify.mjs:114` n'émet que les deux statuts et l.128 une seule ligne. Ce n'est pas un
    défaut de C-V-6.
  - En revanche, la propriété fail-closed « statut absent, illisible ou inconnu ⇒ c05 rouge » n'est épinglée par aucun cas.
  - Remède : un bouchon `stub(0, "unknown")` (ou sans ligne JSON) ⇒ {c05}.
  - Propriétaire : orchestrateur. Déclencheur : prochain lot touchant `apps/bell/scripts/bell-verify.mjs` (sortie CLI) ou
    `scripts/verify-bell.mjs`. Preuve : o01 KILLED. `error_origin` : rédacteur du pli (D-P1 testé contre une seule alternative).
- **O-D2 (rattaché à l'item RUNBOOK-KEY-GLOB-1, G2 O-1)** — o04 survit.
  - Le pli introduit un **second chemin de clé privée**, `/etc/monark/bell/signing-key-new.pem` (R1, R3, R4, variante perte), que le garde
    (chemin exact `KEY_PATH`) ne couvre pas. o07 (`set -x` en ligne, déclaré par le rédacteur) est le deuxième motif.
  - Le déclencheur écrit de l'item (« le pli C-1, ou toute édition suivante du RUNBOOK ») est **TIRÉ par ce pli**. La consigne de
    l'orchestrateur l'en a exclu : l'item doit être **re-daté explicitement** par l'orchestrateur. Suggestion : avant la première
    rotation (R1 ne s'exécute qu'alors ; même porte que BELL-SYSTEMD-RUN-ROTATION-1) ou à la prochaine édition du RUNBOOK, au premier des
    deux.
  - `error_origin` : rédacteur G1 (garde à chemin exact), aggravé par le rédacteur du pli (nouveau chemin non couvert).
- **O-D3** — o08 survit : l'ordre C-V-7 n'est épinglé par aucun test.
  - C'est cohérent avec la colonne de vérification du cp-2 (« étapes RUNBOOK dans cet ordre ; garde toujours vert ») ; vérifié par lecture
    (§3).
  - La ligne ADR D9 (C-V-7 (i)) et le compromis (iii) restent dus au **G7 PR-2** : « IMMEDIATELY » coexiste désormais avec commit +
    oracle + push préalables ; le retard est voulu et fail-closed, et doit y être écrit.
  - Pas de défaut du pli.
- **O-D4** — `docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md`, cité par l'étape 1, est **absent des arbres `bca7f5d` et
  `f40e0e6`**. Il vient du commit `85837f5` (2026-09-23 16:38:07Z), ancêtre de `lot/etude-suite` et de `main` (`is-ancestor` exit 0
  pour chacun) mais pas de la base `64dbbd6` (16:13:27Z ; `is-ancestor` exit 1). Le FAITS a donc été committé sur la ligne principale
  après la découpe des branches PR.
  - L'écart se résout à la fusion réelle sur `lot/etude-suite`.
  - Contrôle G7 d'une ligne : le fichier existe à l'arbre fusionné du G7.
  - Aucun `error_origin` (conséquence de la base).
- **O-D5 (environnement)** — crash 0xC0000409 de `test\verify-harness-liq.test.ts` à la passe 1 fusionnée (§8) ; vert seul et au rejeu.
  - `CHANTIERS.md:1173` (item **HTTP-TEST-CRASH-1**) : « déclencheur : seconde occurrence → instruire ». C'est une occurrence de la même
    signature (autre fichier, même code ; G2-10 de `CHANTIERS.md:945` : `process.exit()` après `fetch` sous win32 ⇒ ce code).
  - **Je déclare le déclencheur tiré** ; à l'orchestrateur de rendre la décision.
  - Circonstance : ma propre charge concurrente (D-R3).
  - `error_origin` : **environnement** (+ relecteur pour la charge). Sans effet sur le verdict.
- **Non rejoués ici** (hors périmètre du delta, inchangés) : O-2, O-3 (BELL-VERIFY-CLI-MERGE-1), O-4, O-5 et O-7 du G2 ; ESC-G2-1 (test 42
  `EPERM` sur l'arbre de la POINTE, que je n'ai pas construit) ; BELL-SYSTEMD-RUN-ROTATION-1 (forme R3 `systemd-run -p LoadCredential=…`
  jamais exécutée ; non vérifiée ici, réseau interdit).

## 11. Déviations du relecteur

- **D-R1 (A-13)** : le heredoc de `mutants-own.mjs` a mangé les antislashs (`node --check` en échec **avant toute exécution**) ; le
  fichier a été réécrit par Write. Harnais en deux versions (§7), les deux sha consignés (`logs/mutants-own-sha-v1.txt`, `-v2.txt`).
- **D-R2** : arbre `a31` (`git worktree add` dans MON clone à `a31c8f3`) avec une jonction `node_modules` vers `F:\tmp\g2d-t1b-pr3\pr3\node_modules`
  (paquets identiques : ni `packages/` ni `apps/*/src` ne changent entre `a31c8f3` et `bca7f5d`), pour la contre-preuve o05.
  - Mutation puis `git checkout --` : 0 ligne de statut ensuite.
  - Rien sous `F:\Monark*`.
- **D-R3** : pendant la passe 1 de l'oracle fusionné, j'ai lancé en parallèle o12/o13 (sur `pr3`) et la contre-preuve o05 (sur `a31`) :
  charge concurrente. Le rejeu de la porte test s'est fait sans autre charge de ma part.
- **D-R4** : dans les TAP du rejeu, l'en-tête hérité du harnais du rédacteur porte encore « TEMP/TMP F:/tmp/t1b-pr3/os-tmp » et
  « HEAD= » vide sur l'arbre fusionné (sans `.git`). C'est cosmétique : l'environnement effectif est le mien (les TAP montrent
  `out=F:\\tmp\\g2d-t1b-pr3\\tmp\\…`).
- **D-R5** : `npm ci --offline` lit le cache `F:/tmp/npm-cache` (hors de mon répertoire), avec `--logs-dir` sous `F:/tmp/g2d-t1b-pr3/logs` et
  `--no-update-notifier` pour n'y rien écrire.
- **D-R6 (R-26)** : aucun appel advisor à l'orientation. Un appel vers 20:06Z, après les mesures et avant l'écriture de ce fichier.
  - Avis appliqués : C-D-1 retenue comme seule correction ; o01 en item ; o04 rattaché à RUNBOOK-KEY-GLOB-1 ; déclencheur
    HTTP-TEST-CRASH-1 signalé ; FAITS absent des branches ; « équivalents » pour P4/P5 ; contrôle de l'E2E PR-2 ajouté.
  - **Appel 2, de clôture**, après l'écriture de ce fichier (vers 20:13Z). Avis appliqués :
    - sha recalculé seul, en dernière commande (le premier sha avait été pris en parallèle d'une édition) ;
    - « main » remplacé par les relevés `is-ancestor` de `lot/etude-suite` et `main` (§4, O-D4) ;
    - horloge lue au lieu d'une estimation ;
    - renvoi de l'en-tête vers §11 ;
    - mention de ce second appel.
  - `error_origin` : relecteur.
- **Budget** : 30 min visées ; début 19:51:40Z ; première écriture de ce fichier 20:12:37Z (horloge lue) ; corrections de clôture après
  20:14:33Z (horloge lue). Environ 23 min jusqu'à la première écriture, soit dans le budget.

## 12. Provenance

- Relecteur `claude-opus-5-5[1m]` (effort max), 2026-09-23. `error_origin` par constat : C-D-1 et O-D1 → rédacteur du pli ; O-D2 →
  rédacteur G1 + rédacteur du pli ; O-D3 et O-D4 → aucun ; O-D5 → environnement (+ relecteur).
- **Écritures** : uniquement `F:\tmp\g2d-t1b-pr3\` (clone, arbres `pr3`, `merged` et `a31`, harnais, journaux, TAP, ce fichier). Aucun commit.
- **Journaux** (sha256) :
  - `logs/s1-scope.log` `8f0fa571…`, `logs/r25.log` `ca48efcb…`, `logs/c1-count-bca7f5d.log` `1ab424ec…` ;
  - `logs/o05-pre-pli.log` `6b293721…`, `logs/check-r2-merged.log` `9ad91183…` ;
  - `oracle-pr3/test.tap` `aed571fd…`, `oracle-merged/test.tap` `ead8e352…`, `oracle-merged-rejeu/test.tap` `8603d238…`.
- **Scripts** : `s1-scope.sh` `21790772…`, `c1-count.mjs` `4286024c…`, `o05-pre-pli.sh` `eb9930a7…`, `setup.sh` `9b96be1e…`.
- Le sha de ce fichier est donné par la dernière commande de la session (`sha256sum G2.md`).
