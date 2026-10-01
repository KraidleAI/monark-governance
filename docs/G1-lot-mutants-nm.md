claude-opus-5-5

# G1 — journal du lot MUTANTS-NM (outil de mutants : le `node_modules` de son clone, item MUTANTS-NM-WORKSPACES-1)

- **Modèle résolu (R-1)** : `claude-opus-5-5` (palier de la mission), effort max, instance fraîche, contexte frais.
- **Mission** : `F:/tmp/dojo/mission-mutnm.md` (59 l., 15 876 o.), sha256 `41cd0df54ec10df443a72ec6686e594a731a72dce807646fde783c6ed09e144f`,
  recalculé AVANT lecture (07:00:50Z) : égal au champ `sha` du reçu `F:/tmp/dojo/mission-mutnm.recu.json` (verdict vert, 12 codes à 0,
  base = head = `6c639f0c`). Règles `docs/methode/REGLES-MISSION.md` (20 l.) au sha256 de la mission, lues dans la mission (insérées).
- **Base** : worktree `F:/Monark-wt-mutants-nm`, branche `lot/mutants-nm`, HEAD `6c639f0c1115e8c467a1cc785bcae754be8f7e66` ;
  `git --no-optional-locks status --porcelain` à 07:01Z : 0 ligne.
- **Outils** (tronc `F:/Monark` et worktree, sha256 égaux entre eux et à la mission) : `scripts/mission/lint.mjs` `4d1383c8…f808`,
  `scripts/mission/launch.mjs` `fb6c277f…ae3d`, `scripts/oracle/run.mjs` `f22b9045…2a41b`, `scripts/oracle/r25.mjs` `4d0544df…7cf0`,
  `scripts/red-proof.mjs` `6579b550…ab36` ; hors liste : `scripts/mutants/run.mjs` `2606e7da…3b19` (base du lot), `scripts/oracle/lock.mjs`
  `501a76b5…33bb`. Node v24.15.0.
- **Verrou d'hôte** : `F:/tmp/oracle-lock` absent à 07:04:10Z.
- **Sorties** : `F:/tmp/dojo/insp1/mut3/`, `F:/tmp/dojo/mutnm/tmp/` et `F:/tmp/dojo/mutnm-deliver/` existaient déjà, vides (07:09:47Z).
- **Cible de la campagne** : `F:/Monark-wt-page-v1`, branche `lot/page-v1`, HEAD `2e84103eac76e6cd80e4df32a99773e3a7721154`, 0 fichier modifié,
  0 non suivi, 75 chemins changés depuis `8950ab1501e3de8be898f614461301e609e28282` (07:04Z) ; pas de `node_modules` dans ce worktree.

## 1. Lu (entrées de la mission dans son ordre, puis hors liste ; sha256 recalculés à 07:15:08Z)

| Entrée | Lignes | sha256 | Lecture |
|---|---|---|---|
| `docs/ETAT.md` | 104 | `4bc5d68abe999960c0d80ba329008c38e968c6e896953341a5e8b4c580b0a59a` | en entier |
| `F:/tmp/dojo/insp1/mech/RAPPORT.md` | 310 | `3007e888c852f7d45b770a366b3d725d3b8691277a97b54fcf9f23a5d57f80ec` | §1, §3 (mutants), §5 à §8 (demande §6) |
| `scripts/mutants/run.mjs` | 238 | `2606e7dae37f4d13764f3a7c5eca3a947885c871d9dc680632a912ad7e083b19` | en entier |
| `scripts/oracle/run.mjs` | 173 | `f22b90459b54cf0fd2eff1e9d556b4676b57a2e82d766cd9342aa3619cb2a41b` | en entier ; bloc `node_modules` l.105-115 |
| `test/mutants-run.test.ts` | 255 | `a178146b1ec4bd46ad86f38b40d2a1de68dcc60718bf2bcd299caa4a3debe37b` | en entier (20 lignes `// killer:`) |
| `F:/Monark/scripts/red-proof.mjs` | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | l.1-170 et l.199-267 en entier |

- **Hors liste, lus pour écrire et prouver** : `scripts/mutants/run.d.mts` (15 l., `e84f92d1…125e`, en entier) ; `scripts/oracle/r25.mjs`
  (28 l., en entier) ; `scripts/oracle/lock.mjs` (exports `alive`, `acquire`, `held`) ; `package.json` (33 l., `d7a429e1…9700`, scripts) ;
  `eslint.config.mjs` (96 l., `c1c9ac9d…a74b` : `.mjs` ignorés, `.ts` en lint typé) ; `tsconfig.json` (36 l., `e9f78b86…d72f`, `include`) ;
  `.github/workflows/ci.yml` (206 l., `0f401ae2…949a`, l.82-98 : `docs/G1-lot-*.md` exclu de R-25) ; `docs/G1-lot-dojo-pr1b4.md`
  (651 l., `5b7fbe77…aab5`, l.312-325 : texte de l'item, l.515-525) ; `docs/G1-lot-dojo-pr1b5a.md` (303 l., `d027c0db…e8d8`, l.1-60 : forme
  du journal) ; `F:/tmp/dojo/drand-1a/mk-nm.ps1` (25 l., `d70d8aea…fbe4`) et `rm-nm.ps1` (17 l., `b51b5d22…8749`), en entier.
- **Ce que l'existant dit** : l'outil clone `--repo` sans `node_modules` (l.164-172) ; l'oracle relie chaque entrée du `node_modules` du dépôt
  principal (parent du répertoire commun de git, l.105) et re-pointe les espaces `@monark/*` vers SON clone (l.111-114). La relance 2 du
  rapport mech (jonction vers un gel) a cassé l'identité de module : `@monark/rpc-guard` hors du clone, chemin relatif dans le clone.

## 2. Compte ascendant AVANT tout code (tâche 1, indicatif ; `date -u` 07:15:53Z ; métrique R-25 : insertions + suppressions)

| Fichier | Composants | Insertions | Suppressions |
|---|---|---|---|
| `scripts/mutants/run.mjs` | en-tête, import, bloc copié de l'oracle (détail A ci-dessous) | ≈ 16 | ≈ 2 |
| `test/mutants-run.test.ts` | tueurs réancrés, en-tête, test neuf (détail B ci-dessous) | ≈ 43 | ≈ 20 |
| `docs/G1-lot-mutants-nm.md` | ce journal : exclu de R-25 (`ci.yml` l.82, `:(exclude)docs/G1-lot-*.md`) | — | — |
| **Total R-25** | | ≈ 59 | ≈ 22 |

- Détail A : en-tête l.16 réécrite et une ligne ajoutée (étape `node_modules`) ; import `node:fs` l.27 scindé en deux lignes (avec
  `readdirSync` et `symlinkSync`, la ligne passerait à 171 caractères) ; bloc copié de l'oracle après l.172 : un commentaire et 11 lignes.
- Détail B : 20 tueurs réancrés (tous visent une ligne au-delà de l.27) ; une ligne d'en-tête (fixture `ws/`) ; test neuf, son tueur et
  sa fixture en ligne (≈ 22 lignes).
- Mise en forme seule à 07:16Z (rangs du tableau au plus 160 caractères) ; chiffres du compte inchangés.
- Prévu ≈ 81 lignes contre la borne de 1 150 (porte CI 1 205) : solde prévu ≈ 1 069 ; aucune coupe. Mesure par `r25()` du tronc au gel.
- Décalage des tueurs prévu : +2 pour les lignes l.28 à l.172 (en-tête et import), +14 au-delà de l.172 (bloc de 12 lignes en plus).

## 3. Code (tâche 2 ; écrit à 07:17:09Z)

- **`scripts/mutants/run.mjs`** (238 → 252 l., sha256 `41cdf83f9f52cdc8b95d592546ab567fbab68dd861823dffcc785adbb0261ac8`) : 16 insertions,
  2 suppressions, écrites par un script à ancres vérifiées (`F:/tmp/dojo/mutnm/tmp/edit-run.mjs` : quatre lignes relues avant l'écriture).
  - l.16-17 : l'en-tête nomme l'étape (ancienne l.16 réécrite, une ligne ajoutée). l.27-28 : import `node:fs` scindé, avec `readdirSync` et
    `symlinkSync` (sur une seule ligne : 171 caractères).
  - l.175-186 : le bloc. l.175 : commentaire qui cite `scripts/oracle/run.mjs` l.105-115, inchangé là-bas. l.176 = oracle l.105, avec
    `resolve(tree, gitS(tree, …))` lu `resolve(repo, git(repo, …).toString().trim())` (le `git` de l'outil rend les octets de stdout, l.52-56).
    l.177-186 = oracle l.106-115 à l'octet (`diff` à 07:17Z : identiques).
  - Place : après la copie des fichiers changés et non suivis (l.169-174), avant `mkdirSync(tmp)` (l.187), donc avant la ligne de base
    (l.206) ; même voisinage que dans l'oracle (bloc l.105-115, puis `mkdirSync(tmp)` l.116).
  - Source pour la campagne : `git rev-parse --git-common-dir` dans `F:/Monark-wt-page-v1` rend `F:/Monark/.git` (`--git-dir` rend
    `F:/Monark/.git/worktrees/Monark-wt-page-v1`), mesuré à 07:25Z : `nmSrc` = `F:/Monark/node_modules` (220 entrées, 11 sous `@monark`).
  - Rien d'autre : aucun champ neuf dans `RESULTS.json` (`tool_sha256` identifie les octets qui tournent) ; `run.d.mts` inchangé ; les
    jonctions restent dans `<out>/clone` après la campagne (section 9, Q-1 et Q-2).

## 4. Tests (tâche 3)

### 4.1 Vingt tueurs réancrés (07:17:46Z)

Tous visent une ligne de `run.mjs` au-delà de l.27 : +2 jusqu'à l.172, +14 au-delà. Preuve par `F:/tmp/dojo/mutnm/tmp/reanchor.mjs`
(`parseKiller` du tronc) : pour chacun, le texte de l'ancienne ligne à l'ancien numéro (`git show 6c639f0c:scripts/mutants/run.mjs`) est égal
au texte de la nouvelle ligne au nouveau numéro, et `<before>` y figure une seule fois ; 20 sur 20 à blanc, puis à l'écriture. Les numéros
de ligne du test ont pris +1 ensuite (ligne d'en-tête l.10).

| Test (base → gel) | `run.mjs` (base → gel) | Test (base → gel) | `run.mjs` (base → gel) |
|---|---|---|---|
| l.81 → l.82 | l.185 → l.199 | l.164 → l.165 | l.212 → l.226 |
| l.89 → l.90 | l.185 → l.199 | l.172 → l.173 | l.224 → l.238 |
| l.96 → l.97 | l.213 → l.227 | l.178 → l.179 | l.206 → l.220 |
| l.104 → l.105 | l.99 → l.101 | l.184 → l.185 | l.209 → l.223 |
| l.113 → l.114 | l.124 → l.126 | l.192 → l.193 | l.146 → l.148 |
| l.125 → l.126 | l.176 → l.190 | l.198 → l.199 | l.232 → l.246 |
| l.132 → l.133 | l.77 → l.79 | l.218 → l.219 | l.32 → l.34 |
| l.140 → l.141 | l.73 → l.75 | l.225 → l.226 | l.93 → l.95 |
| l.149 → l.150 | l.125 → l.127 | l.238 → l.239 | l.236 → l.250 |
| l.157 → l.158 | l.139 → l.141 | l.246 → l.247 | l.129 → l.131 |

### 4.2 Test neuf (l.259, tueur l.258)

- `mutants_clone_resolves_monark_workspaces_in_itself_and_other_modules_in_the_repo` ; tueur
  `scripts/mutants/run.mjs:184 CONST "symlinkSync(w, join(nm, n)" -> "symlinkSync(join(repo, relative(clone, w)), join(nm, n)"` :
  l'espace `@monark/*` re-pointé hors du clone, vers celui de `--repo` (Review Focus, premier point).
- Fixture, sous la racine partagée que `after` retire : `ws/`, dépôt principal ; base = `package.json` et `.gitignore` (`node_modules/`,
  sans quoi `ls-files --others --exclude-standard` ferait copier `node_modules` dans le clone) ; gel = espaces `packages/fx` (`@monark/fx`)
  et `apps/ax` (`@monark/ax`), `test/ws.test.ts`. `ws/node_modules`, non suivi : module tiers `third`, fichier `.package-lock.json`, et les
  liens npm `@monark/fx`, `@monark/ax` vers les espaces de `ws/`, que le clone ne doit jamais prendre. `--repo` = `wt/`, worktree lié de
  `ws/`, sans `node_modules` : l'outil doit prendre celui du dépôt principal (répertoire commun de git), comme l'oracle.
- Test interne `ws_resolution`, porté par une chaîne (aucune ligne source du test externe ne commence par `// killer:`, ni par `test(` en
  colonne 0) : `@monark/fx` et `@monark/ax` se résolvent (chemin réel) dans le clone, `third` dans `ws/node_modules`. Son tueur interne K1
  mute `packages/fx/index.mjs` DU CLONE : K1 n'est tué que si `@monark/fx` se résout dans le clone ; « survit » serait la panne de l'item.
- Assertions externes : `[sortie, ligne de base, K1.file, K1.status, K1.strict]` = `[0, "vert", "packages/fx/index.mjs", "tue", true]` ;
  liens du clone suivis : les deux espaces dans le clone, `third` dans `ws/` ; `.package-lock.json` copié, jamais relié (oracle l.109).
- Trois versions, chacune mesurée : v1 (07:20Z), dépôt simple. v2 (07:26Z), `--repo` en worktree lié : dans un dépôt simple,
  `--git-dir` et `--git-common-dir` rendent tous deux `.git` (mesuré sur le clone `gel`, 07:25Z), donc un mutant `--git-dir` ou
  `join(repo, "node_modules")` aurait survécu. v3 (07:28Z), fichier copié : rien n'épinglait la branche `e.isFile()` du bloc.

### 4.3 Mesures (clone `F:/tmp/dojo/mutnm/gel`, commits locaux gel 1 à 3 ; `red-proof.mjs` du tronc sur le worktree)

| Course | Version | Résultat | Preuve (sha256) |
|---|---|---|---|
| `q1` (07:22:40Z) | v1 | 21 tests, 21 verts, 16,5 s | `q1/test.tap` `426a5300…0743` |
| `rp` (07:23:21Z) | v1 | F2P ; tueur l.184 tué | `rp/RED-PROOF.json` `df55f788…db50` |
| `q2` (07:26:20Z) | v2 | 21 tests, 21 verts | `q2/test.tap` `e05dfe8c…68a0` |
| `rp2` (07:26:47Z) | v2 | F2P ; tueur tué | `rp2/RED-PROOF.json` `f6387346…1748` |
| `q3` (07:29:11Z) | v3, final | 21 tests, 21 verts, 15,0 s, stderr vide | `q3/test.tap` `5127ef37c6212ce31114676ccdc89a3496d4b78314cc8fc8d2677d5d96cdced4` |
| `rp3` (07:30:52Z) | v3, final | F2P ; tueur tué | `rp3/RED-PROOF.json` `5f31e76fb598de5d987f49bf9d4c67a0ad424b4c43c8fab743c6877ff6290880` |

- `rp3` en détail : 1 test jugé, 20 inchangés (seules leurs lignes de tueur ont changé : jamais comptées, `red-proof.mjs` l.9).
  `base.tap` (`7b70e10f…ee66`) : 21 tests, 20 verts, le test neuf rouge par `ERR_ASSERTION`, valeur lue `[1, "non conclu", …]` (l'outil
  de la base n'a pas de `node_modules` : la ligne de base interne ne se charge pas). `gel.tap` (`d5ac58ad…c8ef`) : 21 sur 21. Tueur tiré
  (graine 1, population 1) : `assert-fail`, `killed`, valeur lue `[1, "rouge", …]` (l'espace résolu hors du clone) ; `run.mjs` restauré,
  sha256 avant = après = `41cdf83f…1ac8` ; `killer-1.tap` `9add5e15…ce2d`. Empreinte du gel : `dab38b1f…e95c`.

## 5. Tueurs et mutants du lot lui-même (outil du TRONC, sur le clone figé)

- Commande (garde à 07:32:05Z : verrou libre, 9 `node.exe`, 12 480 Mo ; CIM 07:32:06Z : 31 524 Mo virtuels libres ; rien d'autre lancé
  pendant) : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/mutnm/gel --base 6c639f0c --out F:/tmp/dojo/mutnm/selfmut
  --table F:/tmp/dojo/mutnm/mutants-table-g1.mjs --killers --file scripts/mutants/run.mjs --targets test/mutants-run.test.ts
  --lock-root F:/tmp --min-free-mb 4096` (forme de REGLES, ligne 14:5x : `--repo` = un clone, jamais un worktree).
- Record `F:/tmp/dojo/mutnm/selfmut/RESULTS.json`, sha256 `5dafd89d22ab6f8f18fcee9fef4332364f8f7749c78a1edda30585d7a7f10903` (imprimé par
  l'outil, recalculé) ; `RESULTS.txt` `346435dd…add7`, lu en entier. Outil `2606e7da…3b19` (tronc), `tool_tree` `6c639f0c`, propre ; gel
  `adc798ea` (gel 3), propre ; table `F:/tmp/dojo/mutnm/mutants-table-g1.mjs` `6ad6aed8838681c990c69f9bedfee2ef708e6d1c1928965ce558a334adbf6532`
  (8 rangs prédits « tue », écrits AVANT le lancement, ancres relues une à une) ; de 07:32:31Z à 07:35:29Z.
- Ligne de base : verte, `test/mutants-run.test.ts` entier, 21 verts. **29 tués sur 29**, tous stricts (un seul code, `ERR_ASSERTION`),
  tous restaurés à l'octet ; 0 survivant, 0 non conclu, 0 ancre perdue ; sortie 0.
  - K1 à K20 (tueurs réancrés) : chacun tue son test, seul ; K21 (l.184, le neuf) tue le test neuf.
  - G1-M1 `--git-dir`, G1-M2 `join(repo, "node_modules")`, G1-M3 aucun `node_modules`, G1-M4 liens `@monark` du dépôt repris, G1-M5 fichier
    relié au lieu de copié, G1-M6 modules tiers non reliés, G1-M7 espaces `apps/*` oubliés, G1-M8 sans répertoire `node_modules` : tués,
    chacun par le seul test neuf (1 rouge, 20 verts, fichier entier).

## 6. Campagne d'inspection (tâche 4 ; outil corrigé de ce worktree, `41cdf83f…1ac8`)

- Commande de la mission, telle quelle : `node F:/Monark-wt-mutants-nm/scripts/mutants/run.mjs --repo F:/Monark-wt-page-v1 --base 8950ab15
  --out F:/tmp/dojo/insp1/mut3 --killers` (lancée depuis `F:/tmp/dojo/mutnm`, TEMP `F:/tmp/dojo/mutnm/tmp`, entrée vide,
  `GIT_TERMINAL_PROMPT=0`, `GIT_OPTIONAL_LOCKS=0`). Écart déclaré à REGLES (ligne 14:5x : outil du TRONC, `--repo` = un clone) : prescrit
  par les « Décisions » de la mission ; l'outil du tronc est celui que ce lot corrige, et l'outil clone lui-même `--repo` sans y écrire.
- Pré-vol (07:36:25Z-07:36:26Z) : `page-v1` HEAD `2e84103e`, 0 modifié, 0 non suivi ; `mut3/` vide ; verrou libre, 9 `node.exe`,
  12 080 Mo physiques ; CIM : 31 152 Mo virtuels libres ; listes de `F:/Monark/node_modules` sauvegardées, marqueur posé à 07:36:25Z.
- Lancement 07:36:36Z ; à 07:37:27Z, `mut3/clone/node_modules` : 220 entrées, 11 sous `@monark` ; `@monark/rpc-guard` et `@monark/dojo`
  résolus dans `mut3/clone/packages/rpc-guard` et `mut3/clone/apps/dojo`, `typescript` et `@next/mdx` dans `F:/Monark/node_modules`.
- Record `F:/tmp/dojo/insp1/mut3/RESULTS.json`, sha256 `a3100dfc746fac94b026362b5e69eaf8dc265c628ea71dcfb214a7a036092372` (imprimé par
  l'outil, recalculé), de 07:37:25Z à 07:40:09Z ; `RESULTS.txt` `8fcb1c2d15dd7c76dc75719c992a10db4127a2672547cfea25a25397ea1b3d8e`
  (177 l., lu en entier AVANT toute suite) ; `tool_sha256` `41cdf83f…1ac8`, `tool_tree` `6c639f0c`, `tool_dirty` `bbdd08f3…e29b` (ce lot,
  non commité) ; gel `2e84103e`, propre ; base `8950ab15`.
- **Ligne de base verte** : 48 fichiers, 487 verts, 0 rouge, 60,7 s (`tap/BASELINE.tap` `c40f4ef4…49d`). Lancement 2 du rapport mech :
  1 rouge, 486 verts, par l'identité de module cassée ; ce rouge a disparu.
- 147 tueurs K1 à K147, mêmes rangs que les deux lancements du rapport mech (fichier, ligne, opérateur : 0 écart, recompté par
  `F:/tmp/dojo/mutnm/tmp/pieces.mjs`). **145 tués**, tous stricts (un seul code, `ERR_ASSERTION`) ; **1 survivant, K31** ; **1 non conclu,
  K131** ; 0 ancre perdue ; sortie 1. Tous les fichiers restaurés à l'octet. Codes de sortie lus : 0 et 1, aucun signal : aucun enfant
  mort (0xC0000409, VERIFY-TEST-DEAD-CHILD-2), donc aucune relance ; un seul lancement dans ce clone.
- K92 et K141 : tueurs empilés (deux lignes `// killer:` au-dessus d'un même test) ; l'outil lance le fichier entier pour le premier,
  et c'est le test visé qui rougit (`dojo_live_calls_the_reread_without_bounds`, `dojo_table_rows_are_the_verifier_lines`).
- Après : `rm-nm.ps1 -Tree F:/tmp/dojo/insp1/mut3/clone` à 07:41:51Z, « removed » (229 jonctions, 1 fichier copié). `F:/Monark/node_modules`
  intact : listes identiques avant et après (220 entrées, 11 sous `@monark`), et `find -newer` du marqueur : 0 fichier (07:42:05Z-07:45:54Z).
  Restent : le clone de l'outil (`mut3/clone`, tête `2e84103e`, sans `node_modules`), `mut3/tmp` (50 entrées des tests, comme au mech).
  `F:/Monark-wt-page-v1` intact après la campagne (07:59:01Z) : HEAD `2e84103e`, `lot/page-v1`, 0 ligne de `status --porcelain`, pas de
  `node_modules`.

### 6.1 Tués, survivants et non conclus par pièce de la partie

Pièce = l'intégration de `lot/page-v1` (premier parent depuis `8950ab15`) qui a apporté la ligne de déclaration du test du tueur (`git blame`
au gel, lecture seule) ; un test déclaré avant la partie est rangé à part, avec la pièce qui a réancré sa ligne de tueur s'il y a lieu.
Script `F:/tmp/dojo/mutnm/tmp/pieces.mjs`, sortie `F:/tmp/dojo/mutnm/pieces.jsonl` (`c72842bc…c9cb`) ; forme rejouable sans barre inverse :
`F:/tmp/dojo/mutnm/pieces2.mjs` (`700fc184…0651`, sortie `pieces2.jsonl` identique à l'octet) puis `agg2.mjs` (`54f4475f…40db`) vers
`F:/tmp/dojo/mutnm/pieces-agg.txt` (`f6f6c245…d095`), d'où ce tableau.

| Pièce | Tueurs | Tués | Survivants | Non conclus |
|---|---|---|---|---|
| ENTRY-MAIN-LINK-1 | K77-K86 (10) | 10 | 0 | 0 |
| PR-3b-2a (unités, Caddy, RUNBOOK) | K122-K132 (11) | 10 | 0 | 1 (K131) |
| PR-3a-2 (historique) | K28-K30, K135 (4) | 4 | 0 | 0 |
| PR-4c-2a (tableau, recherche) | K140-K147 (8) | 8 | 0 | 0 |
| DOJO-PUBLISH-SINGLE-WRITER-1 | K136-K137 (2) | 2 | 0 | 0 |
| DRAND-1b | K3, K9, K76 (3) | 3 | 0 | 0 |
| RPC-GUARD-FIRST | K62-K64, K70-K74 (8) | 8 | 0 | 0 |
| VERIFY-NONFINITE | K55-K60, K113-K116 (10) | 10 | 0 | 0 |
| SMALL-CORR | K2 (1) | 1 | 0 | 0 |
| B1-CORR | K31-K32, K133, K138 (4) | 3 | 1 (K31) | 0 |
| B1-CORR suite | K33-K37, K139 (6) | 6 | 0 | 0 |
| DEPTH-BOUND | K1, K61, K117-K118 (4) | 4 | 0 | 0 |
| Tests antérieurs, tueur réancré par SINGLE-WRITER | K10-K12, K14-K19, K22-K27, K134 (16) | 16 | 0 | 0 |
| Tests antérieurs, tueur réancré par PR-4c-2a | K92-K93, K97, K107-K108, K110-K111, K121 (8) | 8 | 0 | 0 |
| Tests antérieurs, tueur réancré par DRAND-1b | K4-K8, K75 (6) | 6 | 0 | 0 |
| Tests antérieurs, tueur réancré par RPC-GUARD-FIRST | K65-K69 (5) | 5 | 0 | 0 |
| Tests antérieurs, tueur réancré par B1-CORR | K13, K20 (2) | 2 | 0 | 0 |
| Tests antérieurs à la partie | K21, K38-K54, K87-K91, K94-K96, K98-K106, K109, K112, K119-K120 (39) | 39 | 0 | 0 |
| **Total** | **147** | **145** | **1** | **1** |

- Tableau par fichier de test et fichier muté, au format du rapport mech (39 rangs) : `F:/tmp/dojo/mutnm/tmp/by-file.md` ; deux rangs
  seulement ne sont pas entièrement tués : `dojo-publish.test.ts` × `dojo-publish.mjs` (27 : 26 tués, K31 survit) et
  `dojo-publish-deploy.test.ts` × `dojo-deploy.mjs` (2 : K126 tué, K131 non conclu).

### 6.2 Survivant K31 (constat, pièce B1-CORR)

- Tueur `apps/dojo/test/dojo-publish.test.ts` l.711 : `// killer: apps/dojo/scripts/dojo-publish.mjs:508 CONST "t < (d + 1) * DAY_MS" ->
  "t < d * DAY_MS"` ; test `dojo_publish_history_waits_for_the_first_day_read` (l.712).
- Mesure : seul, 1 vert (557 ms, `tap/K31.tap` `6114f3f6…cb0d`) ; rejeu sur ses trois fichiers cibles (`apps/dojo/test/dojo-publish.test.ts`,
  `test/dojo-publish-deploy.test.ts`, `test/dojo-publish-e2e.test.ts`) : 45 verts, 0 rouge (`tap/K31.replay.tap` `54aab984…6379`).
- Lecture du code (cause probable, non mesurée à part) : l'étape l.718 (« d closed in the inbox, but not over at the clock ») attend le code
  `first_read_day_open`. Sous le mutant, la garde d'horloge l.508 laisse passer, mais `publishDay` à blanc (l.509) ne rend pas `checked`, et
  la l.510 lève le même code (détail `no first snapshot built`). `refusesA` (l.63-64) ne compare que `e.code` : le test ne distingue pas les
  deux gardes. Correction possible, hors de ce lot : comparer aussi le détail de la l.508. Item formé en section 9.

### 6.3 Non conclu K131 (pièce PR-3b-2a)

- Tueur `test/dojo-publish-deploy.test.ts` l.408 : `// killer: scripts/dojo-deploy.mjs:57 CONST "/etc/monark/dojo/signing-key.pem" ->
  "/etc/monark/bell/signing-key.pem"` ; test `dojo_keyring_shares_no_key_with_bell` (l.409), sauté par conception : « SKIP TU-K: skipped by
  name until act A-4p (DOJO-KEY-1) commits apps/dojo/keys/dojo-keyring.json » (`tap/K131.tap` `8d0543f9…6e29`). Sortie 0, aucune entrée
  non sautée : « non conclu » (outil l.198-199). Ce n'est pas un enfant mort : rapporté tel quel, sans relance. Déclencheur : l'acte A-4p.

## 7. Portes statiques et R-25 (tâche 5)

- Oracle du tronc, voie statique hors verrou (l.147) : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-mutants-nm
  --base 6c639f0c --static-only` (TEMP `F:/tmp/dojo/mutnm/tmp`, `GIT_OPTIONAL_LOCKS=0`, entrée vide ; garde à 07:52:11Z : verrou libre).
- **Passage final** (07:52:11Z-07:53:12Z) : record
  `F:/tmp/oracle-results/6c639f0c1115e8c467a1cc785bcae754be8f7e66-475d5ebb88b4e36e-G1-20261001T075211Z-312328.json`, sha256
  `27e9f5f11f8179dbdbc39ade8e4218e61d37aa6f0dc8c1746b105433a8237293` (imprimé, recalculé) ; `dirty` `475d5ebb…00a3`, objet d'arbre
  `63d82214…aadd`. Huit portes à 0 : `typecheck` (7,2 s), `lint` (19,6 s), `lint:ratchet` (21,1 s), `lang:gate` (1,9 s), `export:check`
  (1,4 s), `gate:vocab` (1,0 s), `lint-model-pinning` (0,1 s), `r25` (0,1 s) ; sortie 0. Après ce record, seul ce journal a changé
  (sections 7 et 10) : exclu de R-25 (`ci.yml` l.82), et `lang:gate` saute les répertoires `docs` (`lang-gate.mjs` l.113).
- Premier passage (07:29:42Z, mêmes octets de code et de test, journal partiel) : record
  `F:/tmp/oracle-results/6c639f0c1115e8c467a1cc785bcae754be8f7e66-b6a13bb29148c7c3-G1-20261001T072942Z-54900.json`, sha256
  `3cdbcba2b7a899ac660f0a9f7ebd129a98ff713850f0598ae2b3042cd54da3ba` ; huit portes à 0.
- **R-25 = 90** (68 insertions, 22 suppressions) dans le record final ; porte CI 1 205, borne de la mission 1 150, solde 1 060. Recoupé par
  la fonction exportée `r25()` de `F:/Monark/scripts/oracle/r25.mjs` sur le clone figé (gel 3, `adc798ea`) : 68 + 22 = 90
  (`F:/tmp/dojo/mutnm/tmp/r25-gel.mjs`, 07:53:30Z). Par fichier : `run.mjs` 16 + 2, test 52 + 20. Compte ascendant ≈ 81, mesure 90
  (× 1,11) : les versions 2 et 3 du test (+4 lignes) et un test neuf plus long que prévu. Au gel 1 (07:22:19Z), même calcul : 86.

## 8. Conduite

- **Git** : lecture seule dans ce worktree et dans `F:/Monark-wt-page-v1` (`rev-parse`, `diff`, `ls-files`, `show`, `log`, `rev-list`,
  `blame`, `status --porcelain` sous `--no-optional-locks`), avec `GIT_OPTIONAL_LOCKS=0`. Écritures git : seulement dans mon clone
  `--no-local` `F:/tmp/dojo/mutnm/gel` (checkout, commits locaux gel 1 à 3, identité passée par `-c`) et dans les clones des outils
  (`red-proof` sous TEMP, retirés ; oracle sous `F:/tmp/oracle-runs`, retiré ; mutants `selfmut/clone` et `mut3/clone`, gardés) ; les
  fixtures du test créent leurs dépôts sous TEMP (retirés par `after`). **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`,
  aucun `git write-tree`.** Aucun commit, aucun workflow (R-20).
- **Un seul outil lourd à la fois**, chacun attendu jusqu'à sa sortie : `q1` 07:22:40Z, `rp` 07:23:21Z, `q2` 07:26:20Z, `rp2` 07:26:47Z,
  `q3` 07:29:11Z, oracle statique 07:29:37Z, `rp3` 07:30:52Z, `selfmut` 07:32:31Z-07:35:29Z, `mut3` 07:36:36Z-07:40:09Z, `rm-nm.ps1`
  07:41:51Z, `find` 07:42:05Z-07:45:54Z. Garde `F:/tmp/dojo/mutnm/tmp/garde.mjs` avant chaque lancement (`held` du tronc, `tasklist`,
  `os.freemem`) : verrou libre, 9 `node.exe` à chaque lancement (12 au relevé de 07:38:36Z, pendant `mut3`), 11 803 à 12 626 Mo libres. Attente par
  scripts node (`wait.mjs`, `wait-line.mjs`, `progress.mjs`, un `setTimeout` de 45 s), jamais `sleep` ; aucun oracle arrêté, aucun processus tué.
- **PowerShell et C:** (CV4-POWERSHELL-C-WRITE-1, ouvert, aucune décision lue) : trois appels, le strict prescrit (CIM pour la seule
  mémoire virtuelle, deux fois ; `rm-nm.ps1`, une fois). Chacun a réécrit
  `C:/Users/KACIMI/AppData/Local/Microsoft/Windows/PowerShell/StartupProfileData-NonInteractive` : 07:32:06Z et 07:36:26Z (1 292 octets),
  07:41:54Z (1 292 → 1 192 octets). D'autres processus l'écrivent aussi (relevés avant mes appels : 07:21:40Z, 07:32:02Z, 07:36:17Z,
  07:41:44Z). Rien d'autre écrit sur C: de ma main ; `typeperf` non substitué à CIM (équivalence non établie).
- **Aucun réseau**, aucun outil de recherche distant, aucune clé. TEMP de mes lancements : `F:/tmp/dojo/mutnm/tmp` ou un `tmp/` neuf.
- **Advisor intégré** : une consultation après l'orientation, avant toute écriture (ordre des preuves, réancrage, conflit C:) ; avis
  suivis, chacun vérifié sur pièce ; une seconde avant la remise.
- **Garde d'octets** (`F:/tmp/dojo/mutnm/tmp/garde-octets.mjs`) : ce journal, `verif-g1.mjs`, `pieces2.mjs`, `agg2.mjs`, la table
  `mutants-table-g1.mjs` et les livrables : aucun TAB, CR ni contrôle, aucune barre inverse, lignes de 160 au plus. **Écarts déclarés** :
  (a) mes scripts de travail sous `F:/tmp/dojo/mutnm/tmp/` (éditions ponctuelles, gardes, attentes, `reanchor.mjs`, `pieces.mjs`) portent
  des barres inverses d'échappement (1 à 10 par fichier) et pour certains des lignes de plus de 160 ; aucun octet de contrôle (transport
  sain) ; gardés tels qu'ils ont tourné ; les preuves se rejouent par `verif-g1.mjs`, `pieces2.mjs` et `agg2.mjs`, propres ; (b) dans le
  test, le tueur réancré l.219 garde ses 190 caractères (seul son numéro passe de 32 à 34) et six tueurs réancrés gardent leurs guillemets échappés
  d'origine (convention des tueurs de `red-proof.mjs`) ; aucune ligne neuve n'en porte. Fichiers des outils (JSON, TAP, consoles) : octets
  des outils, barres inverses des chemins win32 comprises.
- **Sorties hors « À créer »** : deux records de l'oracle sous `F:/tmp/oracle-results/` (écrits par l'outil, section 7).

## 9. Items et questions (aucun point laissé sans forme)

- **MUTANTS-NM-WORKSPACES-1** : fait par ce lot (code l.175-186, test l.259, campagne de la section 6). Statut proposé : à fusionner ;
  après la fusion, « fusionné, à brancher » (REGLES, ligne 14:5x) jusqu'à la première campagne de l'outil du tronc (Q-3).
- **Q-1, MUTANTS-NM-UNLINK-1** (proposé, outillage) : l'outil garde son clone, donc ses jonctions vers le `node_modules` du dépôt principal
  (229 dans `mut3/clone`, retirées ici par `rm-nm.ps1`) ; `mk-nm.ps1` l.7 nomme le danger (un `Remove-Item -Recurse` traverserait les
  jonctions) ; l'oracle, lui, retire tout son répertoire de course à la sortie (l.92-94). Hors des décisions de cette mission (« exactement
  comme le bloc »). Recommandation : retirer `<clone>/node_modules` dans un `finally` de l'outil (même méthode que l'oracle l.92-93, qui délie
  sans traverser selon son commentaire), avec un test qui l'épingle. Déclencheur : avant la prochaine campagne par l'outil corrigé.
- **Q-2, MUTANTS-NM-RECORD-1** (proposé) : `RESULTS.json` ne dit pas si un `node_modules` a été construit, ni d'où ; `tool_sha256` ne
  l'implique que par les octets. Recommandation : un champ `node_modules` (source, entrées reliées, espaces re-pointés, ou `null`) dans
  `monark.mutants.v1`, `run.d.mts` et le test du record. Déclencheur : avec Q-1, même lot.
- **Q-3** : la campagne `mut3` a tourné avec l'outil de CE worktree (`41cdf83f…1ac8`, prescrit par la mission), non avec celui du tronc
  (REGLES, ligne 14:5x). Si `scripts/mutants/run.mjs` est fusionné à l'octet, son sha256 au tronc sera `41cdf83f…` : `mut3` vaut-il preuve
  de branchement ? Recommandation : oui si l'empreinte fusionnée est égale, sinon la prochaine campagne d'un autre lot par le tronc.
- **DOJO-FIRST-READ-CLOCK-DETAIL-1** (neuf, constat K31, pièce B1-CORR) : `dojo_publish_history_waits_for_the_first_day_read` ne distingue
  pas la garde d'horloge (`dojo-publish.mjs` l.508) du repli l.510, qui lève le même code ; objet : comparer aussi le détail
  `${day}: not closed in the inbox, or not over` à l'étape l.718, puis relancer K31 (`--only K31`). Déclencheur : avant le checkpoint de la
  partie 1 et sa fusion au tronc ; orchestrateur.
- **DOJO-KEYRING-KILLER-REMEASURE-1** (neuf, constat K131, pièce PR-3b-2a) : K131 reste « non conclu » tant que
  `dojo_keyring_shares_no_key_with_bell` est sauté ; objet : relancer K131 (`--only K131`). Déclencheur : l'acte A-4p (DOJO-KEY-1), qui
  committe `apps/dojo/keys/dojo-keyring.json` ; orchestrateur.
- **CV4-POWERSHELL-C-WRITE-1** (existant) : trois réécritures mesurées du fichier C: par mes appels (section 8) ; décision attendue.
- **VERIFY-TEST-DEAD-CHILD-2** (existant) : aucun enfant mort pendant `selfmut` ni `mut3` (codes lus : 0 et 1, aucun signal).

## 10. Fin (tâche 6)

- **Verdict proposé : LIVRE-AVEC-RESERVES.** Livré : l'outil construit le `node_modules` de son clone comme l'oracle (bloc copié, identité
  mesurée) ; le test neuf est vert, F2P, et rouge sous son tueur (`rp3`, et K21 de `selfmut`) ; tout `test/mutants-run.test.ts` est vert
  sur un clone (21 sur 21 : `q3`, `rp3/gel.tap`, ligne de base de `selfmut`) ; 29 mutants du lot tués sur 29 ; campagne d'inspection à
  ligne de base verte, 145 tués sur 147 ; portes à 0 ; R-25 = 90.
- **Réserves** : (1) PowerShell (CIM, `rm-nm.ps1`), prescrit, a réécrit trois fois un fichier de C: (CV4-POWERSHELL-C-WRITE-1) ;
  (2) mes scripts de travail portent des barres inverses (preuves rejouables propres fournies) ; (3) Q-1 : les jonctions restent dans les
  clones que l'outil garde, hors des décisions de la mission. Constats de la campagne, hors de ce lot : K31 survit
  (DOJO-FIRST-READ-CLOCK-DETAIL-1) ; K131 non conclu par saut voulu (DOJO-KEYRING-KILLER-REMEASURE-1).
- **Worktree** (non commité ; le gel est un acte de l'orchestrateur) : `scripts/mutants/run.mjs` (`41cdf83f…1ac8`),
  `test/mutants-run.test.ts` (`26cf694f5849a4f70689cfcbf129660c8417946c388718bf8a49ca7693a57e4c`), ce journal ; `scripts/oracle/run.mjs`
  inchangé (`f22b9045…2a41b`, relu à 07:52Z).
- **Hors dépôt** : `F:/tmp/dojo/insp1/mut3/` (`RESULTS.json`, `RESULTS.txt`, `tap/`, `console.txt`, clone de l'outil sans `node_modules`,
  `tmp/`) ; `F:/tmp/dojo/mutnm/` (clone `gel`, `q1` à `q3`, `rp` à `rp3`, `selfmut`, `oracle-s1`, `oracle-s2`, table, `verif-g1.mjs`,
  `pieces2.mjs`, `agg2.mjs`, listes et marqueur de `node_modules`, `tmp/`) ; `F:/tmp/dojo/mutnm-deliver/` (`REPONSE.md`, `DELIVERED.sha256`,
  qui porte le sha256 de ce journal au rendu et ceux des pièces citées).
- **Rejeu** : `node F:/tmp/dojo/mutnm/verif-g1.mjs` (attendu : 23 lignes `ok`, `verdict GREEN`) ; `node F:/tmp/dojo/mutnm/pieces2.mjs`
  (sortie égale à `F:/tmp/dojo/mutnm/pieces.jsonl`) puis `node F:/tmp/dojo/mutnm/agg2.mjs` (sortie égale à `pieces-agg.txt`).
