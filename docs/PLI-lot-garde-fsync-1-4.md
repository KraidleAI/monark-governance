Modèle résolu : claude-opus-5-5[1m]

# RENDU PLI-4 (test-only + RUNBOOK) — GARDE-FSYNC-1 — C-G2c-1 forme (A'')(i)+(ii) + texte (B'') exact, C-G2c-3

> Écrit AU FIL DE L'EAU. Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1, décision 133), effort max,
> contexte frais. Worktree `F:\Monark-wt-gfsync1`, branche `lot/garde-fsync-1` @ `9d85fb1` ; AUCUN commit (R-20) ;
> aucune écriture dans `F:\Monark` (lectures `git` seulement) ; TEMP/TMP/TMPDIR = `F:\tmp\gfsync1-pli4\os-tmp` ; npm
> cache `F:/tmp/npm-cache` ; ceinture A-7 (`env -u` des 8 clés) sur tout oracle, test, mutant et sonde ; aucune variable
> d'environnement affichée ; processus de course : jamais touchés. État : **CLOS le 2026-09-23 à 10:40:38Z** (`date -u`).

## 0. Entrées lues
- re-G2-delta du pli 3 `F:\tmp\g2-gfsync1-3\G2-3.md` (230 lignes, lu intégralement) : C-G2c-1 formes (A'')/(B''),
  C-G2c-2 (orchestrateur), C-G2c-3, O-1..O-7 ; harnais `mutants-g2-3.mjs` (sha `dcb9591e…` = cité par le G2).
- `packages/rpc-guard/test/durable.test.ts` @ `9d85fb1` (253 lignes ; partie (2) l. 205-252 lue intégralement) ;
  `docs/RUNBOOK-rpc-guard.md` l. 60-157 ; `ADR-GARDE-HELIUS-client-budgete-unique.md:60-64` (C-7 : « deux cycles ne se
  soustraient pas ») ; delta ADR du pli 3 `F:\tmp\gfsync1-pli3\ADR-D-FS-5-6-delta.md` ; harnais `mutants-new.mjs`
  (`917a7387…`), `mutants-pli3.mjs` (`8d4e3830…`) — sha = ceux cités par le G2 ; scripts `oracle.sh`, `r25.sh`,
  `a6.sh` du pli 3 ; `scan-standalone.mjs` du G2 ; bin servi, `ledger.ts:45-59` (`DURABLE_FS`), `index.ts`,
  `package.json` du paquet et racine, `exports.test.ts:66-69`, `eslint.config.mjs`.

## 1. Orientation mesurée
- Début 2026-09-23T09:07:47Z (`date -u`, `start.txt`). Worktree : HEAD `9d85fb19dffe4ea7744e7afc42d9bf7f7e197366`,
  `status --porcelain` = 0. Pointe `lot/etude-suite` = **`3147249`** (≥ `defb0a7`). node v24.15.0 win32-x64.
  `core.symlinks` = false (worktree et `F:\Monark`). `node_modules/@monark/*` = 10 liens vers les espaces de travail.
- `eslint --print-config packages/rpc-guard/test/durable.test.ts` : 73 règles, `no-control-regex` **absente**
  (`scratch/eslint-print-config-durable.json`) ⇒ la regex `[\x00-\x20]` de la mission n'est pas visée par le lint.
- **Sonde d'orientation** `scratch/probe-orient.mjs` (sha `6dc6b8ea…`) → `probe-orient-1.log` (sha `74e1ccd5…`,
  09:08:16Z) : processus neuf par forme (cwd = worktree, rien écrit dans le worktree), vrai `fsyncSync` de `node:fs`
  compté sur 2 appels mesurés, 5 = intact, 0 = flush ÉTEINT :

| Forme (valeur passée à Node) | flushes |
|---|---|
| R0 référence | 5 |
| F1a `file:///…/packages/rpc-guard/x/../src/ledger.ts` (segment `..` dans une URL absolue) | **0** |
| F1b `file:///…/packages/rpc-guard/./src/ledger.ts` (segment `.`) | **0** |
| F1c `/Monark-wt-gfsync1/packages/rpc-guard/x/../src/ledger.ts` (chemin enraciné `/`) | **0** |
| F2 `new URL("./src/ledger.ts", new URL("./packages/rpc-guard/", import.meta.url))` (base explicite) | **0** |
| L1 valeur contenant un LF dans un segment (`s` + LF + `rc`) | **0** |
| D1 `data:` sans blanc avant l'apostrophe interne | **0** |

  Lecture sur le code (`durable.test.ts:232-235`) : un spécificateur qui ne commence pas par `.` n'est pas normalisé
  (`target` = texte brut) et la regex `internal` exige `packages/rpc-guard/(src|test)/` CONTIGU ⇒ F1a-F1c, F2 échappent
  aux règles (A'')(i)+(ii) telles que prescrites (à confirmer par mutants, §4) ; la capture `[^"'`\n]+` ne contient
  jamais LF ⇒ un LF brut (gabarit) ou une continuation de ligne rend le littéral NON LU (classe (b)) et le `\n` de la
  regex (i) est inerte pour cette grammaire ; D1 confirme que H12 n'est attrapé par (i) que par artefact (blanc final
  de la capture tronquée).

## 2. Advisor intégré APRÈS l'orientation (~09:1x UTC) — conseil, jamais verdict
Retenu : (1) F1/F2 échappent à (i)+(ii) : mutants littéraux (scripts + bin) ; mesurer AVANT d'éditer une règle étroite
« segment `.`/`..` dans un spécificateur qui ne commence pas par `.` » sur worktree ET arbre fusionné ; si 0 faux
positif, l'ajouter comme règle SÉPARÉE étiquetée (retirable par l'orchestrateur) et la consigner en déviation formée ;
F2 : déclarer sauf règle trivialement à 0 faux positif ; (2) `\n` inerte : LF brut en (b), jamais « couvert » ; (4)
règle (ii) = `posix.extname(base) === "" && isFile()` (un `.gitkeep` est sans extension pour le chargeur de Node),
mesurée avec CETTE définition ; (5) ne changer que la parenthèse du message `:242` (`mentions createRequire` est la
sous-chaîne `HIT_CREQ` du harnais pli 3) ; (6) copies « chemins seuls » avec les chemins absolus internes des textes
H6/H8/H12/K2 ; (7) RUNBOOK : phrase fail-closed de la mission ; S5-1 dans le delta ADR ; (8) fusion : G1 AA → `--ours`,
vérifier la région Ukemi unique avant de réutiliser la résolution ; (9) ordre de travail. Écarté par la mesure : (3)
`no-control-regex` (règle absente de la configuration effective, §1). Écart de compte : l'advisor attendait « as
predicted: 9 » au rejeu g2-3 ; mon compte sur le code est 7 (H1-H17 = 17 basculements dont H12 par artefact) — tranché
par la mesure (§4).

## 2bis. Mesures AVANT édition (orientation, suite)
- **Sonde 2** `scratch/probe-orient2.mjs` (sha `7d7a6cb1…`) → `probe-orient2-1.log` (sha `f6429f39…`, 09:28:17Z ; fichiers
  et jonction sous `scratch/p2` seulement, retirés ; `ledger.ts` sha `625c759f…` avant = après) : R0 5 ; **0** (flush
  éteint) pour G1 URL `file:` à double barre `packages//rpc-guard`, G2 schéma `FILE:` en capitales + `..`, G3 chemin
  enraciné à double barre, G4 `require` d'un chemin à lettre de lecteur + `..`, G5 idem à double barre, G6 schéma `DATA:`
  en capitales, **G7 `require` d'un `.txt` (exécuté comme JavaScript)**, **G9 import À TRAVERS une jonction vers `src/`**
  (Node identifie un module par son realpath) ; références non effectives : G8 `import` d'un `.txt` ⇒
  `ERR_UNKNOWN_FILE_EXTENSION`, G10 fragment `#x` ⇒ 5 (seconde instance), G11 `require` sans extension ⇒ introuvable
  (`Module._extensions` = `.js .json .node`, mesuré). 8.3 : `dir /x` sans nom court sur `F:` (non applicable).
- **Sonde 3** `scratch/probe-orient3.mjs` → `probe-orient3-1.log` (09:31:41Z) : un crochet `module.registerHooks` qui
  réécrit la source de `src/ledger.ts` au chargement ⇒ `js=0` (flush éteint, AUCUN spécificateur vers `src/`) ; un patch
  de la liaison native `process.binding("fs").fsync` ⇒ **`js=5 bind=5`** : le compteur de la partie (1) voit 5 appels,
  tous partis vers le no-op — la partie (1) compte le `fsyncSync` JS, pas la liaison (résidu (e) à dire exactement).
- **Faux positifs des règles candidates, AVANT édition** — `scratch/scan-fp.mjs` (sha final `2a9c7ff4…` ; bloc EXTRAIT
  VERBATIM du test de l'arbre, sha du bloc `45ea2c51…` = celui du G2 ; une ligne d'instrumentation après
  `targets.add(target);` ; candidates évaluées HORS du bloc) — `scan-fp-pre2-wt.log` (sha `9883b822…`, worktree
  `9d85fb1`, 154 fichiers, 613 lectures) et `scan-fp-pre2-merge.log` (sha `00023b22…`, arbre fusionné HEAD `3147249` /
  MERGE_HEAD `9d85fb1`, 158 fichiers, 626 lectures) :

| Candidate | worktree | fusion |
|---|---|---|
| C1 canon (mission (A'')(i)) | 0 | 0 |
| C2 segment `.`/`..` dans un spécificateur qui ne commence pas par `.` (règle suggérée par l'advisor) | 0 | 0 |
| C3 `new URL` dont le jeton suivant n'est ni `)` ni `, import.meta.url)` | 0 (18 `new URL` lus) | 0 (18) |
| C4 FICHIER sans extension sous les racines (`posix.extname === ""`, `statSync().isFile()`) | 0 | 0 |
| C5 spécificateur absolu : `/`, lettre de lecteur, `file:`, `data:` (toute casse) | 0 | 0 |
| C6 spécificateur `#…` (imports de package.json) | 0 | 0 |
| C7 tout `@monark/rpc-guard/<sous-chemin>` | **1** (commentaire de `src/index.ts`) — écartée | 1 |
| C8 un `package.json` sous les racines | 0 | 0 |

  Fichiers non lus sous les racines : 3 `.json` (`scripts/export-exclude-data.json`, `export-exclude-tests.json`,
  `lang-exempt.json`) ; 5 entrées non-fichier (dossiers).
- **Décision (déviation formée D-P4-1, §9)** : C2 est INSUFFISANTE (G1/G3/G5 : la double barre contourne une règle de
  segments) ; C5 la remplace (même famille, plus simple, ferme aussi `data:`) ; C3 ferme F2, forme PORTABLE sur le bin.
  Ajoutées comme règles SÉPARÉES, étiquetées, retirables ; C6/C8 : mesurées, NON appliquées (formées §10) ; le
  reste est déclaré en (a)/(b)/(e)/(f), chaque forme prouvée par mutant survivant ou sonde (§4).
- **Témoins de résidu (a)/(b)/(e)/(f), ids stables W1-W9** — `scratch/probe-residue.mjs` (sha `21213ceb…`) →
  `probe-residue-1.log` (sha `68cd720b…`, 10:19:58Z ; scratch sous `scratch/res`, jonction retirée par `rmdirSync`,
  `ledger.ts` `625c759f…` avant = après). CHAQUE `pli-4 Wn` cité dans le commentaire du test est CET id, dans CE log :

  | id | forme | classe | mesure |
  |---|---|---|---|
  | W1 | LF brut dans un gabarit | (b) grammaire ne lit pas | js=0 (atteint la couture) |
  | W2 | continuation de ligne `\`+LF dans une chaîne | (b) | js=0 |
  | W3 | `require` d'un `.txt` (exécuté comme JS) sous les racines | (a) autre extension | js=0 |
  | W4 | `package.json` `imports` `#seam` | (f) champ non lu | js=0 (le vecteur existe) |
  | W5 | `main` d'un dossier via `require("./dir")` | (f) champ non lu | js=0 |
  | W6 | jonction vers `src/` par un spécificateur relatif | (f) realpath | js=0 |
  | W7 | sous-chemin `exports` profond | NON-vecteur | `ERR_PACKAGE_PATH_NOT_EXPORTED` (T3) |
  | W8 | crochet `module.registerHooks` | (e) chargeur | js=0 (aucun spécificateur vers `src/`) |
  | W9 | patch de la liaison native `process.binding("fs").fsync` | (e) | js=5 bind=5 (la partie (1) compte quand même 5) |

## 3. Livré (worktree, NON committé)
- `packages/rpc-guard/test/durable.test.ts` (+43/−19, 278 lignes, sha `3cb79616…`) : (A'')(i) après `targets.add(target);`
  `/[\\%\t\n\r]|^[\x00-\x20]|[\x00-\x20]$/.test(spec)` = hit (graphie non canonique) ; (A'')(ii) une boucle
  `readdirSync(...).filter(x => posix.extname === "" && statSync().isFile())` avant la boucle de scan = hit (fichier sans
  extension sous les racines) ; DEUX règles ajoutées, ÉTIQUETÉES, retirables (déviation D-P4-1, §11) : spécificateur
  absolu/`data:` (`/^(?:\/|[a-z]:|file:|data:)/i`) et `new URL` à base autre que `import.meta.url` ; texte (B'')
  réécrit : résolution LEXICALE sur le texte brut vs valeur décodée puis URL de Node ; classes (a)-(f) exactes ; phrase
  `:208-209` corrigée ; parenthèse `:242` → « (the token, under any import alias) ». `statSync` ajouté à l'import
  `node:fs`. 0 assertion retirée ; les 4 assertions de non-vacuité inchangées.
- `docs/RUNBOOK-rpc-guard.md` (+11/−7, 162 lignes, sha `8bb3f526…`) : §3 étape 6 et §5, cas rollover fail-closed C-G2c-3
  (« aucun calcul à la main ; deux cycles ne se soustraient pas (D4, C-7) ; la fenêtre réparée est fermée par la ligne
  `reconciled(rollover)`, le `NO-GO rollover` tient, le calcul reprend au cycle courant ») ; O-1 « ONCE for the repaired
  window ». Non-ASCII 44 → 45 (une puce). RUNBOOK et test = les 2 SEULS fichiers modifiés ; `src/`, `bin/` intacts
  (A-6 9/9 ; `reconcile.ts` `6e62cd6a…` figé, vérifié §6).

## 4. Mutants (A-11 byIntended, A-12 en-têtes, A-7, restauration octet pour octet) — worktree `9d85fb1`
> Rejoués DEUX fois : run1 avec le test intermédiaire `b4bf972d…`, run2 avec le test FINAL `3cb79616…` (correction du
> commentaire (f), ids W1-W9 ; code exécuté identique — bloc du scan `ccff343d…` inchangé). Les valeurs ci-dessous sont
> de **run2** (sha final). Résultats identiques run1/run2.
### 4.1 `mutants-g2-3-replay.mjs` (copie chemins seuls de `dcb9591e…`, sha `bfe52c1e…`) — `g23-run2.log` (sha `030d94b8…`)
En-tête `tree_HEAD=9d85fb19… dirty_files=2 … durable_test_sha=3cb79616…` ; `--check` 24/24 ; 21/21 sondes AS-EXPECTED,
0 UNEXPECTED ; bin post == pré ; 21 fichiers nouveaux absents après ; fixtures supprimées ; **RUN DONE (24 mutants ; find
errors 0 ; as predicted 7 ; byte-identical true)** — les 17 basculements voulus sont H1-H17 (prédictions « survit »
écrites contre le pli 3, NON retouchées) ; H12 et H13 explicitement TUÉS (17 `KILLED H*`, 3 `KILLED K*`, 4 B survivants).

| Mutant | Résultat | Règle qui tire (lue dans le TAP) | Sonde d'exécution |
|---|---|---|---|
| H1-H11, H14-H17 | **TUÉS** | (A'')(i) canon (`canon=2`) ; H6/H8 aussi absolu (`abs=2`) | `import-then-meter` 5→0 ; H10/H11/H15/H17 `unlock` 0:2→0:0 |
| **H12** | **TUÉ** | canon (espace finale de la capture tronquée, artefact) ET **absolu/`data:`** (`abs=2` : le spécificateur externe EST une URL `data:`, lu) | 5→0 |
| **H13** | **TUÉ** | (A'')(ii) fichier sans extension (`noext=2`) | `import-then-meter` 5→0 |
| B6, B7, B8, B9 | SURVIVANTS | — (aucune règle) | 5→0 : classe (b), déclarés |
| K1, K2, K3 | **TUÉS** | règles pli-3 (cible résolue ; `abs=2` pour K2) | témoins |

  **Divergence mesurée D-P4-2 (§11)** : la mission attendait « H12 survit, déclaré (b) » ; avec le jeu de règles LIVRÉ,
  H12 est un hit — par la règle absolu/`data:` (raison SAINE : un module `data:` porteur de code est un vrai vecteur,
  son spécificateur externe est lu par la grammaire) ET par l'artefact d'espace finale de la règle canon (même sous
  (A'')(i) seule, comme le notait le re-G2-delta §2.5). H12 n'est donc PAS listé en (b) dans l'ADR (B6-B9 le sont) ;
  c'est plus fort que l'attente. La règle absolu/`data:` est SÉPARÉE et retirable ; si l'orchestrateur la retire, H12
  reste tué par l'artefact canon (le re-G2 déconseillait de s'y fier) — un H12 clean-(b) exigerait de ne pas capturer
  du tout, ce que la grammaire (héritée, non touchée) fait quand même.
### 4.2 `mutants-new-replay.mjs` (re-G2 pli 2, copie de `917a7387…`, sha `a4a7f04e…`) — `new-run2.log`
`--check` 16/16 ; **RUN DONE (16 ; as predicted 11 ; byte-identical true)** = les 5 basculements voulus S3, S4, S5, S6,
S9 (survivant au pli 2 → **TUÉS** par le durcissement du pli 3/pli 4) ; S1/S1b/S2, P1-P5 TUÉS ; S7 (hors racines), S8
(calculé) SURVIVANTS déclarés (a)/(b). Identique au constat du re-G2-delta §2.1.
### 4.3 `mutants-pli3-replay.mjs` (copie de `8d4e3830…`, sha `77bab4e0…`) — `pli3-run2.log`
`--check` 24/24 ; **RUN DONE (24 ; as predicted 24 ; byte-identical true)** : Ai×3, Aii, Aiii×4, Aiv, RX1, RX2, D1 TUÉS ;
RX3/RX4 (index ré-exporte, `exports.test.ts` rouge), **RX5, D3** (ré-export `src/`→bin, suite entière verte, bin `0:0`),
D2, B1-B5, O1, E1 SURVIVANTS — inchangés : les règles du pli 4 (canon, sans extension, absolu, base) ne tirent sur aucune
de ces formes (canoniques et relatives). Le durcissement du pli 4 est donc strictement additif (ne casse aucun constat
du pli 3).

## 5. Faux positifs — CONFORME (mesuré AVANT et APRÈS édition, deux arbres)
- Scan VERBATIM du bloc du test livré (`scratch/scan-fp.mjs`, sha `2a9c7ff4…`, bloc extrait sha `ccff343d…`) sur l'arbre
  fusionné après copie des 2 fichiers (`scan-fp-post-merge.log`, sha `8c99d036…`, HEAD `3147249` / MERGE_HEAD `9d85fb1`,
  158 fichiers, 626 lectures) : **hits du bloc tel quel = 0** ; C1 canon 0, C3 base 0, C4 sans extension 0, C5 absolu 0,
  C6 `#…` 0, C8 `package.json` 0 ; C7 (`@monark/rpc-guard/<sous-chemin>`) = 1, un COMMENTAIRE de `index.ts` (écartée,
  non livrée). Idem worktree et lot (§2bis). Les trois règles LIVRÉES (canon, absolu/`data:`, base) et (A'')(ii) sont à
  **0 faux positif** sur les trois arbres.
- Contrôle POSITIF des règles neuves sur un arbre SYNTHÉTIQUE jetable (`scratch/synth`, hors dépôt ; `synth-controls-1.log`
  sha `c7681c92…`) : un spécificateur enraciné → règle absolu (1) ; un `new URL` à base explicite → règle base (1) ; un
  fichier sans extension → règle (A'')(ii) (1) ; un `new URL` contre `import.meta.url` et un import canonique → 0 (pas de
  faux positif). Les règles TIRENT bien quand il faut.
- `durable.test.ts` seul sur le worktree (`durable-alone-1.tap`, en-tête `HEAD=9d85fb1 dirty=1 durable_sha=b4bf972d…`) :
  **7/7 ok**, exit 0.

## 6. Oracle, R-25, A-6, fusion réelle, périmètre — CONFORME
- **Oracle 7 gates du worktree** (`oracle.sh w2`, copie de `oracle.sh` pli 3 à chemins seuls, sha `54212bb8…` ; en-tête
  `HEAD=9d85fb1 MERGE_HEAD=none dirty_files=2 platform=win32-x64 date_u=10:28:00Z` — `oracle.sh` ne porte pas de champ
  `durable_sha` ; le test FINAL `3cb79616…` est épinglé par l'en-tête de `g23-run2.log` (`durable_test_sha=3cb79616…`)
  qui a tourné sur le MÊME worktree juste avant, `dirty_files=2` avant et après, porcelain = les 2 fichiers) : **7 × exit 0** ; gate:vocab 223
  fichiers ; typecheck 0 ; **test 951 / pass 949 / fail 0 / skipped 2** (skips nommés :
  `sentinel_run_releases_chainstack_lock_on_sigterm`, `u4b_labels_replay_via_main_real_artifact`) ;
  `durable_production_path_…` ✔ ; lint 0 ; lint:ratchet 69/69 ; lang:gate 0 ; export:check 0. sha `w2-test.log`
  `27ace7ff…`. (Un premier oracle `w1` avec le test intermédiaire `b4bf972d…` donnait le même 951/949/0/2.)
- **R-25** (`r25.sh`, pathspec extrait VERBATIM de `ci.yml:65`, ligne sha LF `20f7aab9…` ; `r25-2.log`) : (1) forme CI
  trois-points `66f75c2...HEAD` (committé seul) = **834** (= attendu) ; (2) cumulatif arbre de travail vs base = **858**
  (834 + net du pli 4 : +43/−19 sur `durable.test.ts`, RUNBOOK exclu par `docs/**/*.md`) ; (3) pli 4 seul = **43/19** sur
  `durable.test.ts`. < 1 150 (STOP A-5) et < 1 205.
- **A-6** (`a6.sh`, sha `ef6cf49b…`, `a6-2.log`) : **9/9 SAME** (`2f9a31f6 a5e66cd3 5733daeb 7bee76fc 3376eb08 9206df91
  0e232519 3603265d cb020425`) — les 9 fichiers figés inchangés.
- **`src/` et `bin/` INTACTS** : `git diff --stat 9d85fb1 -- packages/rpc-guard/src packages/rpc-guard/bin` = **VIDE** ;
  `reconcile.ts` = **`6e62cd6a67400197e126cca499d85fac78dc985d1dbb008b59a03b4ee7b0a5aa`** (figé, C-V-4). `DELIVERED-pli4.sha256`
  (`durable.test.ts` `b4bf972d…`, `RUNBOOK` `8bb3f526…`) : `sha256sum -c` **2/2 OK**. `git status --porcelain` du worktree
  = exactement ` M docs/RUNBOOK-rpc-guard.md`, ` M packages/rpc-guard/test/durable.test.ts` ; aucun `zz-*`, aucun fichier
  non suivi hors `node_modules`.
- **Arbre FUSIONNÉ RÉEL** contre la pointe `lot/etude-suite` = **`3147249`** (≥ `defb0a7`) : clone jetable
  `F:\tmp\gfsync1-pli4\merge-clone` (lecture seule de `F:\Monark`) ; `merge-base` = `66f75c2` ;
  `git merge --no-commit --no-ff origin/lot/garde-fsync-1` ⇒ **exactement les 2 conflits attendus** : `AA
  docs/G1-lot-garde-fsync-1.md`, `UU apps/sentinel/test/ukemi-guard-record.test.ts`. Résolution : G1 **`--ours`** (côté
  pointe, sha `fe61156d…` = blob pointe — I-P3-1/C-V-5 révisée) ; Ukemi = deux blocs, celui de la pointe d'abord, celui du
  lot EN DERNIER, UNE seule région (`scratch/resolve-ukemi-p4.mjs`, sha `7122d13d…` = celui du re-G2-delta pli 3 ; résolu
  sha `c05791b2…`, dernier `test(` = `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`). Les 2 fichiers du pli
  copiés (sha = worktree, durable `3cb79616…`). **Oracle `m3`** (en-tête `HEAD=3147249 MERGE_HEAD=9d85fb1 dirty=16 10:30:41Z`,
  rejoué SEUL) : **7 × exit 0**, gate:vocab 225, 69/69, **tests 1060 / 1058 / 0 / 2**, sha `m3-test.log` `c634fbef…` ;
  `merged-3files-2.tap` (`durable_sha=3cb79616…`) : `durable` + `repair-tail` + `ukemi-guard-record` = **47/47 ok**,
  `durable_production_path_…` ✔, `ukemi…nonvacuous` ✔. **Pointe SEULE** (`tip-alone-test.log`, HEAD `3147249`) :
  **1042 / 1040 / 0 / 2** ⇒ **1060 = 1042 + 18** : la résolution ne perd aucun test ; le pli 4 n'en ajoute aucun. État
  fusionné RÉTABLI (re-merge + résolution identique, sha Ukemi `c05791b2…`, G1 `fe61156d…`, 15 indexés, 0 non fusionné,
  AUCUN commit) — laissé pour re-vérification.
  **NOTE (flake de concurrence, non défaut)** : un oracle `m2` lancé EN MÊME TEMPS que les harnais du worktree (même
  `os-tmp`, même disque) a vu `export_public_no_governance_no_french` (test 42, build du miroir public) TIMER à ~100 s
  (1 échec sur 1060) ; rejoué SEUL (`m3`), 1060 / 1058 / 0 / 2, 0 échec. Le bloc de code du test est byte-identique
  (`ccff343d…`) ; l'échec `m2` est une famine d'E/S concurrente, pas un effet du pli 4. Enseignement : ne pas lancer deux
  suites lourdes sur le même `os-tmp` simultanément.

## 7. `ADR-D-FS-6-delta-pli4.md` — les 15 marqueurs `<<PLI-4: …>>` du fold
- Écrit `F:\tmp\gfsync1-pli4\ADR-D-FS-6-delta-pli4.md` (sha `a7cf1a58…`) : par marqueur, « Ancien » (texte COMPLET du
  marqueur) + « Nouveau ». Contrôle indépendant (`node`) : les **15** marqueurs de la cible `9f45e0fb…` sont couverts,
  chacun `split(Ancien).length − 1 === 1`, 0 doublon ; 0 renvoi `F:/tmp` ni URL dans les blocs « Nouveau » ; 2 clés G7
  neuves introduites (`<<SHA_PLI4>>`, `<<R25_PLI4>>`, faits du G7, listés par `insert.py`, jamais refusés). `CV1_PHRASES`
  d'`insert.py` (« Résidu DÉCLARÉ… », « (a) un module hors de ces racines », « (e) un patch de `node:fs` ») restent toutes
  présentes (les marqueurs n'ajoutent qu'APRÈS (a) et (e)).
- **S6-1 « (un `require` sous tout alias) » (S6-1 du delta pli 3) — CORRIGÉ** dans le test (`:242` → « (the token, under
  any import alias) ») et dans le delta pli 4 (marqueur 11 : B8 relève de (b), le jeton `createRequire` seul est un hit) :
  la réfutation de B8 (C-G2c-2) est portée.
- Deux divergences (D-P4-1, D-P4-2) énoncées en tête du delta et §11 ; le marqueur 12 donne les DEUX options (f = résidu
  profond, retenue / f = graphies fermées) pour que l'orchestrateur tranche (R-21).

## 8. Consigne (A-1..A-13) et sécurité
- A-1 1ʳᵉ ligne `claude-opus-5-5[1m]` ; A-3 exits capturés directement (oracle) ; A-5 R-25 834/858 < 1 150 ; A-6 9/9 ;
  A-7 `env -u` des 8 clés sur tout oracle/test/mutant/sonde ; A-11 byIntended (tueur nommé) ; A-12 en-têtes par exécution ;
  A-13 fichiers par Write/Edit, recompte des barres obliques inverses par `node` (`String.fromCharCode(92)`,
  `scratch/a13-recount.mjs`), copies de harnais = octet pour octet + Edit des seules lignes de chemins (diffs §4).
- Diff du pli (`git diff 9d85fb1`) : 0 URL ajoutée ; 0 `api-key=`/`token=`/`bearer` ; 0 `TODO/FIXME/XXX` ; 1 ligne ajoutée
  mentionnant `process.env` = un COMMENTAIRE du test (règle (a), inchangée) ; les seuls hex ≥ 40 sont des sha dans les
  commentaires ; 0 assertion retirée (`grep -cE '^[-+].*assert'` = 0 sur le diff du test) ; les 4 non-vacuités inchangées.
- Sondes : ledgers et fixtures sous `os-tmp`/`mutants/fixtures`, supprimés ; jonction de `probe-orient2` sous `scratch/p2`
  retirée (`rmdirSync`, jamais la cible ; `ledger.ts` sha `625c759f…` avant = après) ; enfants sous ceinture A-7 ; `fetch`
  bouchonné, hôte `.invalid`, clé factice ; aucune variable d'environnement affichée ; processus de course jamais touchés.

## 9. Divergences déclarées (F-3, zéro dette nue)
- **D-P4-1 — règles livrées au-delà de (A'')(i)+(ii)** : la mission demande (A'')(i) [graphie non canonique] et (ii)
  [fichier sans extension]. La sonde d'orientation (§1) a mesuré que des formes ABSOLUES (`file:`/`data:`/`/`-enraciné/
  lettre de lecteur, avec segment `.`/`..` ou double barre) et un `new URL` à BASE EXPLICITE éteignent réellement le
  flush (5→0) et échappent à (i)+(ii). Les laisser en résidu déclaré recréerait le défaut C-G2c-1. Ajout de DEUX règles
  ÉTIQUETÉES et RETIRABLES (spécificateur absolu/`data:` ; `new URL` à base ≠ `import.meta.url`), **0 faux positif** sur
  le lot, le worktree et l'arbre fusionné, contrôle positif sur l'arbre synthétique (§5). **Porteur** : orchestrateur
  (choix de garder/retirer). **Déclencheur** : le G7 de GARDE-FSYNC-1. Non bloquant : sans elles, F1/F2/G-formes seraient
  du résidu à déclarer en (a)/(b) (option ouverte). `error_origin` proposé : n-a (durcissement additif, mesuré).
- **D-P4-2 — H12 tué et sens de la classe (f)** : conséquences de D-P4-1 (§4.1, delta marqueurs 11/12/13). H12 est un HIT
  (règle absolu/`data:` : le spécificateur externe `data:` est LU), non un survivant (b) ; c'est plus fort que l'attente
  de la mission, signalé. La classe (f) livrée = le résidu PROFOND qui subsiste (champ `package.json` non lu, lien
  symbolique/jonction : Node résout par realpath), 0 instance mesurée ; les graphies non canoniques sont FERMÉES (dans le
  paragraphe des règles de hit), pas résiduelles. Le delta donne les deux options du marqueur 12. **Porteur** :
  orchestrateur (R-21). Non bloquant.
- **D-P4-3 — classe (e) étendue** : le test livré étend (e) « patch de `node:fs` » à la LIAISON native
  (`process.binding("fs").fsync` : la partie (1) compte quand même 5, sonde W9) et au crochet de chargeur
  (`module.registerHooks` : sonde W8, flush 0 sans aucun spécificateur vers `src/`). Mesuré (`probe-residue-1.log`) ; l'ADR
  (marqueur non prévu pour (e)) garde (e) = `node:fs` ; l'extension vit dans le commentaire du test. `error_origin` : n-a.
  Non bloquant.

## 10. Items formés (zéro dette nue) et `error_origin`
- **GARDE-FSYNC-BIN-1** (existant, ruling I-P3-2) reste ouvert : la preuve comportementale du bin servi (O-2) fermerait
  H10/H11/H15/H17 par exécution, et la mesure d'O-1 (tuerait H10/H11/H15, pas H17). Le pli 4 ferme H10/H11/H15/H17 par le
  scan (règle (A'')(i)), MAINTENANT, sans attendre le déclencheur — l'item reste utile pour la preuve d'exécution du bin.
- **Résidu (f) 0-instance** : à surveiller si un `package.json` `imports`/`exports`, un dossier à `main`, ou une jonction
  apparaît sous les racines — options C6 (`#…` = hit) / C8 (`package.json` sous les racines) mesurées à 0 faux positif,
  NON livrées (relèvent de GARDE-FSYNC-BIN-1 ou d'un pli ultérieur). Formées, non nues.
- `error_origin` proposés (assignés au G7) : C-G2c-1 (fermeture) → **worker pli 3** (racine : résolveur lexical pli 2) ;
  C-G2c-2 (jeton `createRequire`) → **n-a** (texte) ; C-G2c-3 (RUNBOOK rollover) → **re-G2 du pli 2 + worker pli 3** ;
  D-P4-1/2/3 → **n-a** (durcissement mesuré au pli 4, additif).

## 11. Verdict du worker
Livré, non committé : `packages/rpc-guard/test/durable.test.ts` (`3cb79616…`) et `docs/RUNBOOK-rpc-guard.md`
(`8bb3f526…`) ; rien d'autre (`src/`/`bin/` byte-identiques, `reconcile.ts` `6e62cd6a…` figé). C-G2c-1 forme (A'')(i)+(ii)
+ texte (B'') classes (a)-(f) exact, chaque classe mesurée (W1-W9) ; C-G2c-3 RUNBOOK fail-closed. Mutants : H1-H17 TUÉS
(dont H13 par (A'')(ii), H12 par la règle absolu/`data:`), K1-K3 TUÉS, B6-B9 survivants (b) ; `mutants-new`/`mutants-pli3`
conformes. 0 faux positif (3 arbres). Oracle 951/949/0/2 ; R-25 834/858 ; A-6 9/9 ; fusion réelle 1060/1058/0/2 = 1042 + 18.
Delta ADR : 15 marqueurs couverts. Trois divergences mesurées (D-P4-1, D-P4-2, D-P4-3) formées et soumises à
l'orchestrateur (R-21).

## Provenance
- Worker : `claude-opus-5-5[1m]` (R-1), effort max, 2026-09-23 ; contexte : mission orchestrateur (Fable 5.1) « PLI 4
  GARDE-FSYNC-1 » ; réviseur de ce rendu : l'orchestrateur (R-21).
- Sources primaires du critère d'arrêt (héritées du re-G2-delta, non re-lues ici ; le test les cite) : ECMA-262
  §12.9.4/§12.9.6.2, WHATWG URL §4.4, WHATWG Infra §4.6.
- Preuves (sha256, préfixes ; sous `F:\tmp\gfsync1-pli4\`) — test FINAL `durable.test.ts` `3cb79616…`,
  RUNBOOK `8bb3f526…` : sondes `probe-orient-1.log` `74e1ccd5`, `probe-orient2-1.log` `f6429f39`, `probe-orient3-1.log`
  `3bf07751`, `probe-residue-1.log` `68cd720b` (témoins W1-W9), `probe-residue.mjs` `21213ceb` ; `scan-fp.mjs` `2a9c7ff4`,
  `scan-fp-pre2-wt.log` `9883b822`, `scan-fp-pre2-merge.log` `00023b22`, `scan-fp-post2-merge.log` (bloc `ccff343d`),
  `synth-controls-1.log` `c7681c92` ; `durable-alone-2.tap` (7/7, sha final) ; harnais `mutants-g2-3-replay.mjs`
  `bfe52c1e`, `mutants-new-replay.mjs` `a4a7f04e`, `mutants-pli3-replay.mjs` `77bab4e0` ; journaux (sha final)
  `g23-run2.log` `030d94b8`, `new-run2.log`, `pli3-run2.log` ; oracle `w2-test.log` `27ace7ff` ; `m3-test.log` `c634fbef`,
  `m3-exits.log` `a853be90` (m2 = flake de concurrence, §6) ; `tip-alone-test.log` (1042) ; `merged-3files-2.tap` (47/47) ;
  `r25-2.log`, `a6-2.log` ; `DELIVERED-pli4.sha256` (2/2 OK) ; `ADR-D-FS-6-delta-pli4.md` `a7cf1a58` ;
  `scratch/a13-recount.mjs`, `scratch/resolve-ukemi-p4.mjs` `7122d13d`.
- sha256 du présent rendu : calculé APRÈS sa dernière écriture, donné dans le message de clôture (un fichier ne porte pas
  son propre sha).

## Journal d'avancement (UTC, `date -u`)
- 09:07:47 début ; lecture des entrées ; 09:08:16 sonde d'orientation ; ~09:1x advisor (après orientation) ; rendu créé.
- 09:22 clone de fusion (pointe `3147249`) + `npm ci` ; conflits AA G1 + UU Ukemi ; résolution G1 `--ours`, Ukemi deux
  blocs (`c05791b2…`). 09:24 mesures FP avant édition (scan-fp) : C1-C8 0 sur worktree ET fusion (C7 écartée).
- 09:28-09:31 sondes 2 et 3 (formes absolues, jonction, liaison native, crochet de chargeur). 09:35 édition
  `durable.test.ts` (règles + texte (B'')) ; 7/7 ; typecheck 0. 09:36 édition RUNBOOK (C-G2c-3).
- 09:42-09:57 rejeux `mutants-g2-3` (H1-H17 tués, B6-B9 (b), K1-K3 tués), `mutants-new` (S3-S6/S9 basculent), `mutants-pli3`
  24/24. 09:46 scan post-édition sur fusion 0 hit ; 47/47 sur 3 fichiers. 09:48 contrôles positifs synthétiques.
- 09:58-10:01 oracle worktree `w1` 7×0, 951/949/0/2 ; 10:01 R-25 834/857 (test intermédiaire `b4bf972d…`) ; A-6 9/9. 10:02-10:05 oracle fusion `m1` 7×0, 1060/1058/0/2 ;
  10:06 pointe seule 1042 ; état fusionné rétabli. Delta ADR écrit (15 marqueurs) ; DELIVERED 2/2.
- ~10:1x advisor de clôture (1er appel) : signale (f) aux ids non mesurés (défaut C-G2c-1). 10:19 `probe-residue` W1-W9
  (W4/W5/W6 atteignent la couture, W7 refusé) ; 10:21 réécriture du commentaire (f) + ids stables, durable `3cb79616…` ;
  7/7 ; DELIVERED mis à jour. 10:22-10:33 chaîne rejouée (sha final) : `g23-run2` (H1-H17/K1-K3 tués, B6-B9 (b)),
  `new-run2` (11), `pli3-run2` (24/24), scan-fp fusion 0, oracle `w2` 951/949/0/2, `merged-3files-2` 47/47 ; `m2`
  (concurrent) : 1 timeout de `export_public…` (flake d'E/S) ; `m3` (seul) 1060/1058/0/2 ; R-25 834/858 ; A-6 9/9.
- ~10:3x advisor de clôture (2ᵉ appel) : delta encore stale (exports/W7, +42→+43, en-tête `w2` fabriqué) ; corrigé —
  delta `a7cf1a58…`, 15 marqueurs re-vérifiés, §6 citation d'en-tête rectifiée. État CLOS 10:40:38Z ; sha256 du rendu ensuite.
