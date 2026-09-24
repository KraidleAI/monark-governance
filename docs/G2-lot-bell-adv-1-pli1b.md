# re-G2-delta — lot BELL-ADV-1, micro-pli 1b (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-belladv1-1b/G2-1b.md` (sha256 426c562390bfb41205f27a78ae7664140492db668b0ef572663358b3e829898b). Verdict : PASS sans correction (delta `290548c..70bb716` = 2 fichiers, commentaire seul sur `collect.ts:106` prouvé sur les octets exécutables ; mutants G3/G13/G14 rejoués aux octets du G2 : survivent sur `290548c`, tués par le test visé seul sur `70bb716` ; G15 équivalent vérifié par le code et par 9 cas ; oracle lot 1067/1065/0/2, pointe `7499d79` 1074/1072/0/2, fusion 1083/1081/0/2 = N + 9 ; R-25 795 ; A-6 9/9 ; A-7 0). Observations O-1..O-3 : O-1 table A-2 fournie au §8 ; O-2 formulation exacte : règle anglais seul de `apps/bell`, le texte français rougit la porte ; O-3 traçabilité du tueur G13/G14 dans le harnais du G2 (texte C-1 fait foi).

---

Modèle résolu : claude-opus-5-5[1m]

# re-G2-DELTA — micro-pli 1b du lot BELL-ADV-1 (`lot/bell-adv-1` @ `70bb716`, delta `290548c..70bb716`)

**Verdict : PASS.** Liste fermée des corrections : **VIDE**. Observations O-1 à O-3 : aucune n'est bloquante et aucune ne touche un
octet du pli. Chaque point de la mission est rejoué ici ; aucun chiffre n'est repris du rendu du worker.
- C-1 du G2 est **FERMÉE**. Aux octets du G2, G3, G13 et G14 SURVIVENT sur `290548c` et sont TUÉS sur `70bb716` par le test visé
  (T2, T3, T3) **et lui seul**, sur les 19 fichiers `apps/bell/test` comme sur la suite complète de 1 067 tests. Les TAP sont conservés.
- G15 est **équivalent**, et l'équivalence est prouvée (argument + sonde).
- C-2 (c), côté code, est **FERMÉE**. Le seul changement hors tests est la ligne 106 de `collect.ts`, qui est un commentaire. Ce point
  est prouvé sur les octets exécutables. Le commentaire est exact contre le code.
- Oracles, 7 portes chacun :
  - lot : 7 × 0, 1067/1065/0/2 ;
  - pointe `7499d79` : 7 × 0, N = 1 074 ;
  - fusion à blanc : 0 conflit, 7 × 0, **1083 = N + 9**.
- R-25 = **795**. A-6 : 9/9 égaux. A-7 : propre. D-1 est justifiée, et la mesure est reproduite.

- Relecteur : `claude-opus-5-5[1m]`, en contexte frais et en instance séparée du worker du pli. Le préfixe `claude-opus-5-5` est
  conforme (décision 133). Effort max.
- Discipline d'écriture : aucun commit (R-20), aucun workflow. Rien n'a été écrit hors de `F:\tmp\g2-belladv1-1b\`, et
  TEMP/TMP/TMPDIR pointent sur `F:\tmp\g2-belladv1-1b\tmp`.
- Sur `F:\Monark` et `F:\Monark-wt-belladv1`, je n'ai fait que des lectures, avec `GIT_OPTIONAL_LOCKS=0` :
  - `rev-parse`, `log`, `diff` de commit à commit ;
  - lecture d'octets ;
  - un `require.resolve`.
- Arbres de travail :
  - clone isolé `F:\tmp\g2-belladv1-1b\clone`, obtenu par `git clone --no-hardlinks -b lot/bell-adv-1 F:/Monark`, HEAD `70bb716` ;
  - deux worktrees de ce clone : `before` (`290548c`) et `tip` (pointe `lot/etude-suite`, puis fusion à blanc) ;
  - dans les trois arbres, `npm ci --offline --no-audit --no-fund --ignore-scripts --cache F:/tmp/npm-cache` sort 0 (283 paquets) ;
  - `@monark/rpc-guard` résout dans l'arbre même (`npm-ci-{clone,before,tip}.log`).
- Ceinture A-7 : `env -u` retire les 8 variables payantes pour toute installation, tout oracle, test, sonde et mutant. Aucune variable
  n'est affichée et aucun appel réseau n'est fait.
- Rendu du worker : `F:\tmp\belladv1-pli\RENDU-PLI-1b.md`, sha256 `2119c6fc0325d1702ce80b68b2c288fed3249fdd135bbc7db50580555da54c4a`
  (recalculé). Je l'ai lu seulement pour savoir QUOI vérifier.

## 0. Journal (`date -u`)

- 13:07:07Z : HEAD lus par `git rev-parse`.
  - `F:\Monark` (`lot/etude-suite`) = `c74b53f2c80c123404657d61c8e5546f305a194f`.
  - Worktree `F:\Monark-wt-belladv1` (`lot/bell-adv-1`) = `70bb716c03627cb0b3a65a7ae75f40ee1ff73f34`, `status --short` vide.
- 13:07Z-13:11Z : orientation. Documents lus :
  - CONSIGNE-STANDARD-G1 ;
  - G2 du lot, `c74b53f:docs/G2-lot-bell-adv-1.md` ;
  - harnais G2 et `mutants-g2.out` ;
  - diff du pli ;
  - `volume.ts`, `collect.ts`, `rebase-trajectory.ts` ;
  - ci.yml:65 ;
  - table §2 de `PLAN-u4b-prereg.md` ;
  - rendu du worker.
- ~13:12Z : advisor n°1 (§10).
- 13:15:49Z : clone isolé, exit 0.
- 13:16:28Z : worktrees `before` et `tip` créés ; `tip` est sur `0b19e76`, parce que la pointe avait avancé pendant l'orientation (§10,
  D-G2D-1).
- 13:16:44Z-13:17:52Z : trois `npm ci --offline`, exit 0.
- 13:20:46Z-13:23:00Z : oracle de la pointe `0b19e76`.
- 13:22:16Z : contrôles du delta. 13:23:08Z : R-25. 13:23:09Z : A-6.
- 13:23:20Z-13:25:26Z : oracle du lot.
- 13:25:56Z-13:42:58Z : harnais de mutants (deux arbres).
- 13:27:38Z et 13:43:25Z : `git fetch` de la pointe dans le clone.
- 13:43:31Z-13:46:01Z : oracle de la pointe `7499d79`.
- 13:43:33Z : sonde de langue.
- 13:46:10Z : fusion à blanc. 13:46:22Z : A-6 sur l'index fusionné.
- 13:46:18Z-13:48:44Z : oracle de l'arbre fusionné.
- 13:48:55Z : état final et calcul des sha256.
- ~13:50Z-13:55Z : advisor n°2, sur ce fichier rendu durable (§10, addendum).
- 13:56:22Z : preuve `docs-readers.out`, qui resserre une affirmation du §3. 13:57:07Z : addendum écrit, puis sha256 de ce fichier
  calculé EN DERNIER.

## 1. Diff et périmètre (point 1) — CONFORME

Script `delta-checks.mjs` (écrit par Write, A-13, sha256 `b0740f87…`), sortie dans `delta-checks.out` : **RESULT ALL PASS**. Toutes les
lectures portent sur le clone.
- `70bb716` a un seul parent, `290548c`. Auteur `Kraidle`, 2026-09-23T14:05:58+01:00. Le message du commit décrit bien le contenu.
- `git diff --name-status 290548c..70bb716` donne exactement `M apps/bell/src/collect.ts` et `M apps/bell/test/bell-adv-1.test.ts`.
  `--numstat` donne `1 1` et `20 0`.
- Hunks `-U0` :
  - `collect.ts` : un seul hunk, `-106,1 +106,1` ;
  - test : 5 hunks, **0 ligne retirée**, 20 ajoutées (`+128,5`, `+138,1`, `+143,1`, `+146,1`, `+188,12`).
- Chemins protégés sur `290548c..70bb716` : `apps/sentinel`, `packages`, `scripts`, `docs`, `test`, `.github`, `package.json` et
  `package-lock.json` font **0 octet** chacun. Le diff du dépôt entier hors `apps/bell` est vide.
- **Commentaire seul, prouvé sur les octets exécutables** (avec le TypeScript 6.0.3 de l'arbre) :
  - le flux de jetons SANS trivia de `collect.ts` est identique entre les deux blobs (2 093 jetons de chaque côté) ;
  - `transpileModule` avec `removeComments` donne une sortie identique (sha256 `45b04989…caeca3` des deux côtés) ;
  - la ligne 106 est dans le même bloc `/** … */` (l.104-108) dans les deux blobs.
  - Recoupement au §5 : remettre l'ancienne ligne 106 redonne exactement le blob `290548c` (`df00bdd1…`).
- Blobs de `70bb716` :
  - `apps/bell/test/bell-adv-1.test.ts` = `4d4e39f6a6439e21c8f9dc86133e68a03ea915f0` ;
  - `apps/bell/src/collect.ts` = `65f4d57a01035a3b455f3f6d0c430c2980a43f3a`.
  - Ces identifiants sont ceux de la mission.
- Les sha256 des octets, `08415639…04f5b` et `130168aa…fd0e32`, sont les mêmes à quatre endroits :
  - fichiers du clone (LF, 0 CR) ;
  - fichiers de `F:\Monark-wt-belladv1` (lecture seule) ;
  - `DELIVERED-pli1b.sha256` du worker (recoupement, pas preuve) ;
  - blobs indexés de l'arbre fusionné (§3).
- `volume.ts` a le même blob `1c2904f7…` en `290548c` et en `70bb716` (sha256 `46fa184d…`).
- F-2 : les 21 lignes ajoutées sont en ASCII pur. Les caractères non ASCII des commentaires de `collect.ts` sont antérieurs au pli
  (59 en `d0535cb`, 56 en `290548c` et en `70bb716`) et hors delta.
- A-6 : script `a6.mjs` (sha256 `dc477007…`), sorties `a6.out` et `a6-merged.out`.
  - Les 9 lignes (chemin, sha) sont EXTRAITES à l'exécution de la table (2) de `70bb716:docs/PLAN-u4b-prereg.md`. Le blob de ce
    fichier a pour sha256 LF `1971d9b1…`, qui est le `--prereg-sha` v2 du SIDECAR.
  - Méthode du PLAN : retirer les CR, puis sha256.
  - Résultat : **9/9 égaux** en `d0535cb`, `290548c`, `70bb716`, sur les pointes `0b19e76` et `7499d79`, ET dans l'index de l'arbre
    fusionné (stage 0).
  - Valeurs : `2f9a31f6`, `a5e66cd3`, `5733daeb`, `7bee76fc`, `3376eb08`, `9206df91`, `0e232519`, `3603265d`, `cb020425`.

## 2. Mutants G3/G13/G14 aux octets du G2, et G15 (point 2) — CONFORME

Harnais `mutants-1b.mjs`, écrit par Write (A-13). Le recompte dans node donne 1 paire de barres obliques inverses, voulue, dans
`field()`. sha256 `73d571cc…fdd1`. Sortie dans `mutants-1b.out`. Le TAP de CHAQUE exécution est gardé sous `tap\` (001 à 022,
REVIEW-TAP-1).
- **Définitions des mutants.**
  - Elles sont EXTRAITES VERBATIM à l'exécution de `F:\tmp\g2-belladv1\mutants-g2.mjs`. Ce fichier a pour sha256 `43a887a2…d4ea`,
    valeur donnée au §10 du G2.
  - Bloc extrait : de la déclaration `const T1 = "bell_adv_period…";` (marqueur unique, vérifié) jusqu'à la fin de `const G = [...]`.
    Il est évalué en `node:vm`. sha256 du bloc : `ed49a345…2c5a7e` (30 lignes, 18 mutants).
- **Tueurs visés.**
  - G3 → T2 `bell_no_adv_is_named_counted_and_ratio_absent`, comme au G2.
  - **G13 et G14 → T3 `bell_no_multiplier_is_named_counted_never_one`.** C'est une SURCHARGE, imprimée dans la sortie : le harnais G2
    portait TK, alors que le texte C-1 du G2 dit « (T2, T3, T3) » (O-3).
  - G15 → T3, jamais compté.
- **Mécanique.**
  - La chaîne à remplacer doit apparaître une seule fois : `split(find).length - 1 === 1`.
  - L'écriture du mutant et la restauration sont durables : `openSync('w')`, boucle `writeSync`, `fsyncSync`, `closeSync`.
  - Après fermeture, le sha est RE-LU et doit égaler le golden ; sinon ABORT (D-1-bis). Une copie des goldens est gardée sous
    `golden\`.
  - Les 8 variables payantes sont RETIRÉES de chaque processus enfant (A-7).
  - Chaque mutant est exécuté DEUX fois avec `--test-reporter=tap` : sur les 19 fichiers `apps/bell/test`, puis sur la suite
    COMPLÈTE (même commande que `package.json` : mêmes drapeaux, mêmes 5 globs, `node_modules/.bin` en tête du PATH).
  - Les verdicts sont lus dans le TAP seulement (A-11). Un mutant est « tué par le test visé ET LUI SEUL » si et seulement si
    l'ensemble des noms en `not ok` vaut {visé} dans les DEUX exécutions.
  - Le message de l'assertion est lu dans le bloc YAML : la ligne qui SUIT `error: |-`, et le cadre de pile `*.test.ts:l:c`.
- **Préalables.**
  - `before` a pour HEAD `290548c`, `after` (le clone) a pour HEAD `70bb716`. Les deux `status` sont vides.
  - Goldens : `volume.ts` `46fa184d…` dans les deux arbres ; `collect.ts` `df00bdd1…` dans `before` et `130168aa…` dans `after`.
  - Lignes de base vertes des deux côtés (TAP 001-003 et 012-014) :
    - 3 fichiers du lot : **45/45/0/0** ;
    - 19 fichiers : **240/240/0/0** ;
    - suite complète : **1067/1065/0/2**.
  - Le pli n'ajoute aucun test.

| mutant | fichier muté (sha256) | `290548c` | `70bb716` | assertion tueuse (TAP conservé, YAML lu) |
|---|---|---|---|---|
| G3 : `&& days.every((d) => dates.has(d))` retiré (`volume.ts` l.103) | `e01c7d92…922a` = G2 | SURVIT : 19 f. 240/240/0/0 ; suite 1067/1065/0/2 (TAP 004, 005) | **TUÉ par T2 et lui seul** : 240/239/1/0 ; 1067/1064/1/2 (TAP 015, 016) | « a Saturday in place of a missing trading day » ; `deepStrictEqual` ; attendu `['no_adv']` ; obtenu `undefined` (entrée calculée) ; `bell-adv-1.test.ts:142:12` |
| G13 : `\|\| !(m > 0)` retiré (l.118) | `ed025034…0ad4` = G2 | SURVIT (TAP 006, 007) | **TUÉ par T3 et lui seul** (TAP 017, 018) | « trajectory m = 0 » ; attendu `['no_multiplier']` ; obtenu `undefined` ; `:196:12` |
| G14 : `!Number.isFinite(m) \|\|` retiré (l.118) | `a24d19f6…505e` = G2 | SURVIT (TAP 008, 009) | **TUÉ par T3 et lui seul** (TAP 019, 020) | « trajectory m = Infinity » ; `:196:12` |
| G15 : `&& mc > 0` retiré (`collect.ts` l.115) | `before` : `bec131a7…35a6` = G2 ; `after` : `b17e43d7…7705` (golden changé par l.106, attendu) | SURVIT (TAP 010, 011) | SURVIT (TAP 021, 022) | aucune (équivalent, voir ci-dessous) |

Ce sont bien les cas NOUVEAUX qui tuent, pas une assertion ancienne par coïncidence :
- les lignes 142 et 196 sont exécutées par les cas ajoutés ;
- le message est le libellé de la variante ajoutée au test 2, puis celui de la boucle m ∈ {0, +∞} du test 3.

En fin de harnais :
- `git status --porcelain` est VIDE sur les deux arbres, et les goldens relus sont égaux ;
- tally : sur `before`, survived {G3, G13, G14, G15} ; sur `after`, killedAlone {G3, G13, G14} et survived {G15}.

**G15 — équivalence VÉRIFIÉE, pas acceptée sur parole.**

Argument, sur le code de `70bb716` lu :
- `ratioMultiplierOf` n'est pas exporté. Son seul appel est `collect.ts` l.217, qui produit `mAt`.
- `mAt` n'est lu qu'en l.221 : `sh = mAt === null ? null : sessionShareVolume(g.fills, s.baseDec, mAt)`.
- Sous G15, pour un `mc` fini et ≤ 0 (0, −0, négatif, sous-dépassement), `mAt = () => mc`.
- Tout groupe a au moins 1 fill : l.139-146 ne créent un groupe qu'en y poussant un fill.
- Au premier fill, `volume.ts` l.118 teste `!(m > 0)` et rend `null`. Donc `sh = null`, exactement comme l'original (`mAt === null`).
- Pour un `mc` non fini, `Number.isFinite` filtre encore dans le mutant.
- Les lignes 222 à 233 ne dépendent que de `sh` et de `advR`. La sortie est donc identique pour TOUTE entrée.
- Conclusion : aucun test ne PEUT tuer G15. C'est un mutant équivalent de premier ordre, masqué par la garde aval, et non une dette.

Mesure : sonde `g15-probe.mjs` (sha256 `39880a84…2b2d`), qui appelle le vrai `collect()` sur 9 cas `constant` :
- valeurs testées : 0, −1, −0, 1e-400, −2.5 avec un mint lisible « 1 », 0 sur deux fills, −Infinity, NaN, et le contrôle 1.5 ;
- sous G15, la sortie est égale à la sortie golden OCTET POUR OCTET dans les deux arbres (sha256 `8db3ce89…4440`) ;
- sous le mutant COMPOSÉ G13+G15, la sortie diffère sur les 6 cas finis ≤ 0 (sha256 `444d72a6…4dff`) : des ratios sont PUBLIÉS
  (`0.0000000000`, `-0.0000020000`, `-0.0000050000`) avec `no_multiplier` à 0.

C'est donc bien la garde de positivité de l.118 qui masque G15. Cette garde est maintenant épinglée par T3, puisque G13 est tué : le
masquage est lui-même sous test. Les restaurations sont durables et les sha relus (fichiers `g15\*.jsonl`).

## 3. Oracles et fusion à blanc (point 3) — CONFORME

Script `oracle.sh` (sha256 `ba272a89…`), sur le modèle de `F:\tmp\g2-ukemirevert\oracle\run-oracle.sh` :
- A-3 : les codes de sortie sont capturés directement ;
- A-7 : ceinture `env -u` des 8 variables ;
- A-12 : chaque SUMMARY porte un en-tête (HEAD, MERGE_HEAD, `status`, versions node et npm) ;
- porte `test` : la commande EXACTE de `package.json`, avec deux reporters, spec puis tap, placés AVANT les globs ;
- les comptes sont lus dans le **TAP seul**, sur les lignes `# tests/# pass/# fail/# skipped` et `1..N`.

Résultats (node v24.15.0, npm 11.12.1) :

| arbre | 7 portes | TAP tests/pass/fail/skip | détail |
|---|---|---|---|
| lot `70bb716` (`oracle-lot\`) | **7 × exit 0** | **1067/1065/0/2** (`1..1067`) | skips : `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) et `u4b_labels_replay_via_main_real_artifact` (artefacts e2 absents) ; vocab « scanned 227 file(s), no forbidden claim » ; ratchet 69/69 ; lang:gate et export:check 0 hit ; tests 2 et 3 `ok` |
| pointe `0b19e76` (`oracle-tip\`) | 7 × 0 | **1074/1072/0/2** | mêmes skips ; vocab 228 fichiers |
| pointe `7499d79` (`oracle-tip2\`) = **N(pointe)** | 7 × 0 | **1074/1072/0/2** | mêmes skips |
| fusion `7499d79` + `70bb716` (`oracle-merged\`) | **7 × 0** | **1083/1081/0/2 = N + 9** | mêmes skips ; tests 2 et 3 `ok` ; vocab 228 fichiers ; ratchet 69/69 |

**Fusion à blanc** (`merge.sh`, sha256 `34c70aea…` ; journal `merge.log`) :
- À 13:46:10Z, `F:\Monark` `lot/etude-suite` valait `7499d79`, et c'est la pointe du worktree `tip` (status vide).
- merge-base = `d0535cb`. La pointe ne touche aucun octet sous `apps/bell`.
- `git merge --no-ff --no-commit 70bb716` répond « Automatic merge went well; stopped before committing as requested », exit 0.
- `git ls-files -u` : **0** entrée non fusionnée. Aucun marqueur de conflit dans les 9 fichiers `apps/bell`.
- 10 chemins indexés : les 9 du lot et `docs/G1-lot-bell-adv-1.md`. Shortstat : 1102 insertions, 87 suppressions.
- Les blobs indexés des 9 fichiers du lot sont ÉGAUX à ceux de `70bb716`, dont les deux du pli (`65f4d57a…`, `4d4e39f6…`).
- HEAD reste `7499d79` ; `MERGE_HEAD` = `70bb716` ; aucun commit n'a été créé.

**Validité pour la pointe nommée par la mission (`c74b53f`) et la pointe actuelle (`87b147a`, 13:48:55Z).**
- `c74b53f..87b147a` ne touche que 6 fichiers, tous sous `docs/` (5 modifiés, 1 ajouté : `docs/G2-lot-ukemi-revert-1.md`, dans
  `08109ed`), et 0 octet ailleurs.
- La seule partie non mesurée ici est `7499d79..87b147a` (`docs/CHANTIERS.md`, +5 lignes, aucun fichier ajouté). Elle ne peut rien
  changer aux oracles (`docs-readers.out`, sha256 `3a064437…37b8`) :
  - les tests lisent certains documents (PLAN-u4/u4b/u3-prereg, PRODUCT-BOUNDARY, PROCEDURE-CRA, ADR-M014, RUNBOOK…), mais aucun de
    ceux qui ont changé ;
  - les 6 documents modifiés ne sont nommés par aucune ligne de test hors commentaire : 7 mentions de « CHANTIERS », toutes en
    commentaire, et 0 pour les 5 autres ;
  - aucun test ne lit `docs/` par glob ou par `readdir` : les 2 occurrences de `:(exclude,glob)docs/**/*.md` sont des chaînes
    comparées au texte du workflow ;
  - lang:gate saute `docs/` (`SKIP_DIRS`) ;
  - gate:vocab ne lit que 3 documents listés (`vocab-banned.json` `narabi_docs`), dont aucun n'a changé.
- N = 1 074 est donc aussi le compte de `c74b53f`, conformément à la mission : les fichiers de test sont identiques.
- Si un commit hors `docs/` arrive avant le G7, la fusion à blanc est à refaire. Dans tous les cas, l'oracle du G7 sur le vrai commit
  reste la référence.

## 4. R-25 (point 4) — CONFORME

Script `r25.mjs` (écrit par Write, sur le modèle de `F:\tmp\g2-belladv1\r25.mjs`, sha256 `ddce70ad…`), sortie dans `r25.out`.
- Pathspec EXTRAIT à l'exécution de `70bb716:.github/workflows/ci.yml` l.65 : 15 arguments. Le sha256 de la ligne, `fdff3620…`, est
  celui du G2.
- Forme CI : `git diff --shortstat d0535cb...70bb716 -- <pathspec>`. C'est bien la forme `origin/<base>...HEAD` du CI, car les deux
  merge-bases valent `d0535cb` : (`d0535cb`, `70bb716`) et (pointe, `70bb716`).
- Comptage : programme awk EXTRAIT de `ci.yml` l.69 et exécuté tel quel, plus un recompte dans node.
- Shortstat : `9 files changed, 708 insertions(+), 87 deletions(-)`.
- **R-25 = 795**, awk et node d'accord. C'est ≤ 1 150 (A-5) et ≤ 1 205 (borne CI `VIBEGATES_PR_LIMIT`, `ci.yml` l.43).
- numstat :
  - test : `390 0`, soit 370 + 20 ;
  - `collect.ts` : `79 31`, inchangé. La ligne 106 remplacée avait été ajoutée par le lot : `ratioMultiplierOf` et « Gate ABSENT » ont
    0 occurrence en `d0535cb`.
- Pli seul (`r25-pli-only.out`, `290548c...70bb716`) : 21 + 1 = **22**.

## 5. D-1 (langue) et exactitude du commentaire l.106 (point 5) — CONFORME

**Règle** [lu], dans `scripts/lang-gate.mjs` :
- l.115-116 : « `bell` = the off-tool Bell collector apps/bell (English-only source … gated on the SOURCE tree by test 42 » ;
- l.117 : `SCOPES` contient `bell` ;
- l.141 : tout chemin sous `apps/bell/` est rangé dans la portée `bell` ;
- l.39 : « No --scope = global », c'est-à-dire sortie 1 sur tout hit non exempté, toutes portées confondues.

**Sonde propre** `lang-probe-1b.mjs` (écrite par Write, sha256 `40064aee…`), sortie dans `lang-probe-1b.out`.
- Elle tourne sur le CLONE, jamais sur le worktree de l'orchestrateur.
- La ligne 106 est remplacée tour à tour ; chaque cas suit la même séquence :
  - écriture durable ;
  - `node scripts/lang-gate.mjs` sous la ceinture A-7 ;
  - restauration durable, puis sha relu (`130168aa…`).
- `status` final vide.

Cas mesurés :
- (0) ligne livrée, en anglais : exit 0.
- (1) ligne française sondée par le worker (texte de mission) : **exit 1**, hit `apps/bell/src/collect.ts:106:49 [fr-word] sans`. Le
  fichier muté a pour sha256 `7532d64d…a3fe`, le même que dans la sonde du worker : ce sont les mêmes octets.
- (2) texte français du G2 C-2 (c) : **exit 1**, hit `…:106:69 [fr-word] sans`.
- (3) ancienne ligne anglaise de `290548c` : exit 0. Le fichier ainsi reconstitué a pour sha256 `df00bdd1…`, c'est-à-dire le blob de
  `290548c`.
- (4) reformulation française qui évite les mots de la liste : exit 0.
  - La porte est une liste de mots, alors que la règle « anglais seul » de la portée `bell` est une politique ; la porte n'en attrape
    qu'une partie (O-2).
  - La D-1 repose donc d'abord sur la politique (l.115-116).
  - La mesure « la version française rougit la porte » reste exacte pour les deux textes français réellement proposés.
  - Le choix de l'anglais est correct dans tous les cas.

**Exactitude contre le code** (`70bb716`, lu ; tous les numéros de ligne ont été relus par script).
- Ligne livrée : « Gate ABSENT (live ETH TSLAon leg: no gate, no mint => no_multiplier; or offline replay) => the mint readout's
  multiplier ». Elle est suivie des lignes 107-108, inchangées : « when the mint is present and it parses to a finite number > 0.
  Otherwise null => the session's ratio abstains no_multiplier ».
- **Jambe ETH en course : exact.**
  - l.828 : `built.push({ symbol: "TSLAon", chain: "ethereum", …, advDailyVolumes })`, sans `rebase` ni `mint`.
  - Donc le test de l.111 (`rb !== undefined`) est faux ; l.117 trouve `s.mint === undefined` et fait `return null`.
  - Résultat : `no_multiplier`.
- **Jambe Solana en course.**
  - `buildSolanaSymbol` pose TOUJOURS `rebase` :
    - l.600-604 : porte rejouée, `unverified` ou `rebaseForMint(mint)` ;
    - l.611 : `…, rebase }`.
  - `runMain` n'a que deux `built.push` : l.815 et l.828.
  - En course, la porte n'est donc absente QUE sur la jambe ETH. L'ancienne clause « the live wiring always sets it » était fausse
    (G2 C-2 c) ; la nouvelle est vraie.
- **Rejeu hors ligne : exact.**
  - Porte absente ⇒ l.117-119 : le multiplicateur du mint s'il est présent, fini et > 0 ; sinon `null`, donc `no_multiplier`.
  - Le « => no_multiplier » est DANS la parenthèse ETH : sans mint, l'issue est `null`.
  - « or offline replay » renvoie à la règle du mint énoncée juste après.
- Le sens du texte du G2 C-2 (c) (« Porte absente (rejeu hors ligne, et jambe ETH TSLAon en course, sans mint ⇒ `no_multiplier`) »)
  est rendu mot pour mot.
- Forme : ASCII, 124 caractères, aucun motif de `vocab-banned.json` (gate:vocab 0 hit, §3).

## 6. A-7 (point 6) — CONFORME

Section §6 de `delta-checks.mjs`.
- Sur les 21 lignes AJOUTÉES, chacun des 9 motifs a **0 occurrence** :
  - `api[-_]?key` ;
  - `(key|token)=|secret` ;
  - schéma d'URL `[a-z]+://` ;
  - `bearer|authorization` ;
  - suite hexadécimale de 32 caractères ou plus ;
  - suite base64 de 40 caractères ou plus ;
  - nom d'opérateur payant ou de fournisseur (`helius|chainstack|polygon|databento|massive`) ;
  - jeton d'hôte (`*.com|io|net|org|xyz|invalid`) ;
  - marqueurs de corps de réponse (`jsonrpc|"result"|resultsCount|next_url|request_id|queryCount`).
- Sur les fichiers entiers, en comparant base et tête : les comptes sont IDENTIQUES pour les 9 motifs, dans `collect.ts` comme dans le
  test. Les occurrences qui existaient déjà sont des bouchons `.invalid`, des noms d'opérateurs et le corps Massive synthétique du
  test 8 (voir G2 §5).
- Les valeurs ajoutées sont synthétiques : volumes ronds (1 000 000), dates d'août 2025, m ∈ {0, +∞}, mint « 1 ».
- Aucun corps de réponse, aucune URL, aucune clé.

## 7. Revue des 20 lignes de test (conformité à C-1, D-2, D-4)

- **Conformité au texte C-1 du G2 : exacte.**
  - Test 2 : la variante `[...full.filter((x) => x.dateET !== "2025-08-15"), { dateET: "2025-08-16", v: 1_000_000 }]`, avec `n_bars` 21
    et l'attendu `["no_adv"]`, est la forme proposée, mot pour mot.
  - Test 3 : deux portes `trajectory_known` dont l'`initialize` vaut m = 0 et m = +Infinity. Le helper `ev` du fichier donne
    `multiplierBitsHex = f64BitsHexLE(m)`. Attendu : `["no_multiplier"]`, sans `vol_ratio`.
  - Le pli n'ajoute rien d'autre, à part les assertions de renfort décrites plus bas.
- **Isolation de G3 (D-2).**
  - Août 2025 compte 21 jours de bourse : le 1ᵉʳ est un vendredi et il n'y a aucun férié NYSE.
  - Sans le 08-15 et avec le samedi 08-16, `nBars` = 21 = `days.length` et `dates.size` = 21. Seule `days.every` refuse le mois.
  - Les deux préconditions sont ASSERTÉES (c'est un samedi ; 21 dates distinctes). Une retouche de la fixture qui casserait
    l'isolation ferait donc rougir le test.
  - La variante voisine « a duplicated day in place of a missing one » (21 barres, 20 dates) est tuée par `dates.size === nBars`, pas
    par `days.every`. Les deux cas se complètent.
- **Isolation de G13 et G14.**
  - Les branches mint (l.119) et `constant` (l.115) filtrent `Number.isFinite(x) && x > 0` AVANT `sessionShareVolume`.
  - Seul le chemin trajectoire (l.113 `multiplierAtMs(...)?.value ?? null`, où `0 ?? null` vaut 0) peut livrer 0 ou +∞ à l.118.
  - L'`initialize` a `blockTimeSec` 0, donc avant le fill : `multiplierAtSec` rend `newBits`, c'est-à-dire les bits de m
    (`rebase-trajectory.ts` l.104 et l.116-120).
  - Le mint lisible « 1 » est présent mais IGNORÉ, puisque la porte est définie : le cas vérifie aussi qu'il ne remplace jamais la
    porte.
  - Il n'y a pas de `closeRefBySession`. La jambe g_t s'abstient donc en `no_close_ref` avant la branche de rebase, sans interférence.
- **Non-vacuité.**
  - Test 3 : `o.volume.length === 1` est asserté avant `every(!("vol_ratio" in e))`.
  - Boucle du test 2 : `abstain` est asserté avant `!("vol_ratio" in (o.volume[0] ?? {}))`.
- **D-4 : aucune assertion affaiblie.**
  - 0 ligne retirée.
  - Les deux assertions ajoutées DANS la boucle du test 2 (pas de clé `vol_ratio` ; `stateResiduals.no_adv === 1`) renforcent les CINQ
    variantes.
  - lint:ratchet reste à 69/69 : aucune dette de typage nouvelle.
  - Lignes en ASCII.
- **Choix des valeurs.** m = 0 et m = +∞ suffisent à tuer G13 et G14 séparément. NaN, arrêté par les deux gardes, ou m < 0,
  équivalent à 0 pour G13, n'ajouteraient aucun pouvoir de détection.

## 8. Consigne standard — contrôle point par point (côté relecteur)

| point | état pour le pli | preuve |
|---|---|---|
| A-1 | fait | 1ʳᵉ ligne du rendu du worker : « Modèle résolu : claude-opus-5-5[1m] » ; même chose ici |
| A-2 | fait (mesuré ici), non imprimé au rendu (O-1) | `F:\Monark-wt-belladv1` : `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-belladv1\packages\rpc-guard\src\index.ts` (lecture seule, ~13:28Z ; jonctions `node_modules/@monark/*` → le worktree) ; clones de revue : `npm-ci-*.log` |
| A-3 | fait | `oracle.sh` : codes directs, 7 portes (§3) |
| A-4 | fait | `DELIVERED-pli1b.sha256` = blobs de `70bb716` (§1) ; commit par l'orchestrateur (`Kraidle`), pas par le worker ; aucun réseau |
| A-5 | fait | R-25 = 795 (§4) |
| A-6 | fait | 9/9 sur 5 révisions (`d0535cb`, `290548c`, `70bb716`, `0b19e76`, `7499d79`) et sur l'index fusionné (§1) |
| A-7 | fait | ceinture partout ; 0 motif dans le pli (§6) |
| A-8, A-9, A-10 | n-a | aucun tuyau externe, aucune phrase servie, aucune liaison de sortie touchés ; gate:vocab 0 hit |
| A-11 | fait | `byIntended` avec ensemble exact, TAP (§2) |
| A-12 | fait | en-têtes des `.out` et des SUMMARY |
| A-13 | fait | scripts écrits par Write, `\\` recomptés dans node |
| B-1..B-6, C-1..C-4, E-1..E-3 | n-a | pli de tests seuls, plus un commentaire : aucun code de secret, d'erreur, de retry, de verrou ou d'état touché |
| D-1 | fait | G3, G13, G14 nommés et ROUGES par le test visé seul ; G15 équivalent prouvé (§2) |
| D-1-bis, REVIEW-TAP-1 | fait | restaurations durables et sha relus ; 22 TAP conservés (§2) |
| D-2, D-4 | fait | §7 |
| D-3 | n-a | aucun tuyau nouveau |
| F-1, G-1 | n-a | aucune pièce ni surface publique ; le texte ADR C-2 revient à l'orchestrateur à l'insertion |
| F-2 | fait | lignes ajoutées en ASCII ; gate:vocab 0 hit |
| F-3 | fait | D-1 (langue) et D-2 (`npm ci` hors ligne) déclarées au rendu |

## 9. Verdict, corrections, observations

**Verdict : PASS.**

**Liste FERMÉE des corrections : aucune.**

Observations (aucune action sur le code ; propriétaire et déclencheur indiqués) :
- **O-1 (forme du rendu du pli ; `error_origin` : worker du pli).**
  - L'en-tête de la CONSIGNE exige une section « Consigne standard : point par point » (fait, ou n-a avec motif). Le rendu du pli n'en
    a pas, et n'imprime pas non plus le `require.resolve` de l'A-2.
  - Sur le fond, les points applicables sont traités au fil du texte, et A-2 est satisfait (mesuré ici, §8).
  - Propriétaire : l'orchestrateur, lors de la persistance du rendu au G7. Remède : joindre la table du §8 ci-dessus ou la faire
    compléter.
- **O-2 (libellé de la D-1 du rendu, §2).**
  - Le rendu écrit : « D-1 est donc imposée par la porte elle-même, pas seulement par la politique ». C'est vrai pour le texte français
    de la mission (hit « sans »). Mais la porte n'attrape pas toute reformulation française (cas (4) du §5).
  - Formulation exacte : « D-1 : règle anglais-seul de la portée `bell` (`lang-gate.mjs` l.115-116) ; mesuré : le texte français
    proposé rougit la porte ».
  - Propriétaire : l'orchestrateur, lors de la persistance.
- **O-3 (traçabilité du G2 ; `error_origin` : relecteur G2, sans effet).**
  - Le harnais G2 (`mutants-g2.mjs`) nomme TK `bell_ratio_killer_adv_and_unit` comme tueur visé de G13 et G14, alors que son texte C-1
    demande les cas dans le test 3 (« (T2, T3, T3) »).
  - Le pli a suivi le texte. Le worker et ce G2-delta impriment la surcharge TK → T3.
  - Rien à faire, sinon citer la surcharge si le G2 est rejoué.

## 10. Déviations du relecteur, incidents, advisor

- **D-G2D-1 (pointe retenue).**
  - La mission nomme `c74b53f`. Pendant la revue, la pointe a avancé quatre fois avant la fusion (`08109ed`, `0b19e76`, `9d28549`,
    `7499d79`), puis une fois après (`87b147a`), uniquement par des commits sous `docs/`.
  - Pointe retenue : la plus récente au moment de la fusion à blanc, `7499d79`. C'est la pratique du G2 du lot (D-G2-3).
  - N a été mesuré deux fois (`0b19e76`, `7499d79`) : 1 074 les deux fois, soit le N de la mission.
  - La transférabilité à `c74b53f` et à `87b147a` est établie au §3.
- **D-G2D-2 (extension, pas un écart).** Chaque mutant est rejoué aussi sur la suite COMPLÈTE, en plus des 19 fichiers
  `apps/bell/test` du protocole G2. C'est ce qui permet d'affirmer « et lui seul » sur 1 067 tests.
- **D-G2D-3 (drapeaux `npm ci`).** J'ai gardé les deux drapeaux de la mission, `--offline --no-audit`. J'ai ajouté `--no-fund
  --ignore-scripts --cache F:/tmp/npm-cache`, les mêmes que le G2 et le worker : installation depuis le seul cache local, sans script
  de cycle de vie.
- **D-G2D-4 (porte `test` de l'oracle).**
  - La commande est lancée directement, sans passer par `npm run test`. Même forme que le G2 (D-G2-2).
  - Deux reporters sont placés avant les globs, et `node_modules/.bin` est mis en tête du PATH.
  - Les 6 autres portes passent par `npm run`.
- **Incidents** : aucun. Aucune suite n'a rougi hors des mutants, aucune restauration n'a divergé, aucun ABORT.
- **État laissé.**
  - `clone` (`70bb716`) et `before` (`290548c`) : `status` vide.
  - `tip` : `7499d79` avec la fusion NON committée (`MERGE_HEAD` `70bb716`), laissée en place pour inspection et à jeter. Aucun
    `git merge --abort` n'a été lancé.
  - Les `node_modules` des trois arbres contiennent des jonctions vers les `packages/` et `apps/` de leur propre arbre. Pour les
    retirer : `rm-nm.ps1`, jamais `Remove-Item -Recurse`.
  - `F:\Monark-wt-belladv1` : non modifié (HEAD `70bb716`, `status` vide à 13:48:55Z).
- **Advisor n°1** (~13:12Z, outil intégré, après l'orientation ; un avis, jamais un verdict). Les points suivants ont TOUS été suivis :
  - clone et worktrees, sans jamais muter le worktree de l'orchestrateur ;
  - contrôle de la merge-base ;
  - surcharge TK → T3 imprimée ;
  - golden LF vérifié avant la comparaison des sha ;
  - « lui seul » établi par ensemble exact ;
  - lecture de la ligne qui suit `error: |-` ;
  - sonde G15 sous mutant, étendue à 9 cas et au mutant composé ;
  - trois oracles ;
  - extractions R-25 et A-6 ;
  - sonde D-1 sur le clone ;
  - grep A-7 ;
  - fusion laissée en place.
- **Advisor n°2** (avant la clôture, sur ce fichier rendu durable) : voir l'addendum à la fin du §11.

## 11. Provenance et sha256

- Relecteur : `claude-opus-5-5[1m]`, effort max, le 2026-09-23 de 13:07:07Z à la clôture. Contexte : un clone isolé et deux worktrees
  sous `F:\tmp\g2-belladv1-1b\`. Réviseurs : l'orchestrateur (R-21), puis le checkpoint-2 ou le G7.
- Outils : node v24.15.0, npm 11.12.1, git 2.55.0.windows.5, TypeScript 6.0.3 (de l'arbre), Git Bash (MINGW64_NT-10.0-19045).
- sha256, mesurés à 13:48:55Z :
  - scripts : `delta-checks.mjs` `b0740f87…3bba2` ; `a6.mjs` `dc477007…4ddf` ; `r25.mjs` `ddce70ad…ae8a` ; `mutants-1b.mjs`
    `73d571cc…fdd1` ; `g15-probe.mjs` `39880a84…2b2d` ; `lang-probe-1b.mjs` `40064aee…faff3` ; `oracle.sh` `ba272a89…177b` ;
    `merge.sh` `34c70aea…7f41` ; `npm-ci-all.sh` `254e15b2…bc89` ;
  - sorties et journaux : `delta-checks.out` `e5b6e200…a215` ; `a6.out` `bb7580eb…b06c` ; `a6-merged.out` `4d0174ea…b169` ;
    `r25.out` `c5bf2b75…38da` ; `r25-pli-only.out` `2e3b9f52…4f80` ; `mutants-1b.out` `bbfdfa52…24f8c` ; `mutants-1b.run.log`
    `08c7daef…d769` ; `lang-probe-1b.out` `88ac1edf…ac16` ; `merge.log` `d57da514…9077` ; `clone.log` `60e19b75…cb13` ;
    `worktrees.log` `e8435735…b8b6` ; `fetch-tip.log` `b0c0e045…45c7` ; `fetch-tip2.log` `8b4ab319…2873` ; `npm-ci-clone.log`
    `246931f3…1654` ; `npm-ci-before.log` `d2710e75…723a` ; `npm-ci-tip.log` `35b9ba41…958b` ;
  - sondes G15 : `g15\{before,after}-{golden,G15}.jsonl` `8db3ce89…4440` ; `g15\{before,after}-G13+G15.jsonl` `444d72a6…4dff` ;
  - oracles : `oracle-lot\SUMMARY.txt` `db11f9bc…f7f2`, `test.tap` `697d42c5…b351` ; `oracle-tip\SUMMARY.txt` `23a322c7…0464`,
    `test.tap` `8b84c4f8…d1c1` ; `oracle-tip2\SUMMARY.txt` `5020b9fb…a32c`, `test.tap` `b4fa1773…3616` ; `oracle-merged\SUMMARY.txt`
    `3f17ed51…eb67`, `test.tap` `1eb128da…9de6` ;
  - `tap\` : 22 fichiers (001 à 022), sha de chacun dans `mutants-1b.out` ;
  - mesuré à 13:56:22Z : `docs-readers.out` `3a064437…37b8`.
- Ce fichier ne peut pas contenir son propre sha ; il est donné dans le message de clôture. Les sorties d'outils de cette revue sont
  restées sous 30 Ko, et aucune n'a été persistée sous `C:` à ma connaissance.

### Addendum — advisor n°2 (~13:50Z-13:55Z, outil intégré ; un avis, jamais un verdict ; addendum écrit à 13:57:07Z)

- **Ce que dit l'avis.**
  - Le PASS avec liste fermée VIDE est fondé : chaque point est rejoué avec sa preuve, les octets des mutants sont ceux du G2, « lui
    seul » est établi sur la suite complète, G15 est prouvé équivalent, le commentaire est prouvé commentaire, et la fusion donne N + 9.
  - O-1 est correctement routée.
  - Deux points de clôture sont demandés :
    - (1) combler les deux trous de forme (heure de l'advisor n°2 au journal, addendum annoncé au §10), puis calculer le sha256 de ce
      fichier EN DERNIER, sans aucune édition après ;
    - (2) le libellé « aucun test ne lit `CHANTIERS.md` » affirmait plus que la mesure, qui n'était qu'un grep de la chaîne littérale.
- **Ce qui a été suivi.**
  - (1) : fait. Journal et §10 complétés ; le sha est calculé après cet addendum.
  - (2) : fait par une mesure, pas seulement par une reformulation.
    - `docs-readers.out` liste toutes les lignes de test hors commentaire qui nomment un chemin `docs/` : 48 lignes. Elles portent sur
      les PLAN-prereg, PRODUCT-BOUNDARY, PROCEDURE-CRA, ADR-M014, RUNBOOK…, jamais sur l'un des 6 documents modifiés.
    - Toutes les mentions des 6 documents sont en commentaire : 7 lignes « CHANTIERS », 0 pour les 5 autres.
    - Aucune lecture par glob ni par `readdir`.
    - Le §3 est réécrit dans ces termes.
- **Ce qui a été écarté** : rien. Le verdict et le périmètre des observations sont inchangés.
