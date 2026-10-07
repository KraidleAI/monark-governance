# G0 du lot 1f de VERIFIERS-LIST-F5A-1 : la liste versée des vérificateurs, son lecteur fermé, sa lecture épinglée paresseuse, la règle de la date et le journal de course ignoré

RECHERCHES, 2026-10-07. Base `1cddd2e5` (`lot/etude-suite`, `1cddd2e5a4cb54791db16e704beae8e7af41152a`, lue par `git fetch
+refs/heads/lot/etude-suite:refs/remotes/origin/lot/etude-suite`). Chantier : `docs/G0-lot-verifiers-list-f5a-1.md` §3.2 et §5 partie 1.

- **Demande** : partage 80/20 de MONARK (`recherches:coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-partage-80-20.md`, item 1,
  l.21-35), décisions R3 (`…-outil-fige-r3.md` : Q-P3-1, Q-P3-7, phrase de la l.265, amendement de la l.298), et G0 de la partie 3 de
  RECHERCHES (`recherches:coordination/pieces/2026-10-07-G0-verifiers-partie-3/G0-verifiers-part3.md`, révision 4 lue à 09:12 UTC,
  §3.3 et §5.1 points 1 à 6). Pli : G2 de #231 par MONARK (`recherches:802c2a8`, `…-MONARK-vers-RECHERCHES-g2-231.md` et la pièce
  `pieces/2026-10-07-g2-231/g2-231.json` : onze m, aucun M), et N-6 (`recherches:8ac6bd6`, `registry.file` retiré du rapport) ; §8.
- **Provenance** : worker `claude-opus-5-5`, effort bas (réglage de la session), horloge lue (`date -u`) à 09:02 UTC au début, 09:12
  pour ce G0. Worktree détaché neuf du scratchpad, branche `recherches/verifiers-list-1f` ; `node_modules` lié en dur depuis un autre
  worktree du scratchpad, retiré à la fin. Aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`. Node 24.21.0, Linux.
  - **Pli de la G2** : worker `claude-opus-5-5`, **effort max, déclaré** (constat 11 : le G1 ci-dessus a tourné à effort bas, sans
    exception datée, alors que le tableau des modèles épingle un G1 multi-fichiers à l'effort max ; MONARK consigne l'écart au journal
    de provenance, avec la G2 à max). Début du pli vers 10:13 UTC (horodatage du scratchpad) ; horloge lue (`date -u`) à 10:29 UTC,
    puis 10:43 UTC à la fin. Même worktree, repris à `b894a587` ; mêmes règles (`node_modules` lié en dur puis retiré, ni `GIT_DIR`, ni
    `GIT_WORK_TREE`, ni `--write-tree`). Node 24.21.0, Linux.
- **Zone** : `apps/harness/data/verifiers.json` (neuf), `apps/harness/src/policy-verifiers.ts` (neuf), `test/verifiers-list.test.ts`
  (neuf), `test/kata-recalc.test.ts` (l'épingle du test d'arbre passe à la liste), `.gitignore` (deux lignes et un blanc),
  `docs/G0-lot-verifiers-list-f5a-1.md` (amendements sur place, nombre de lignes inchangé).

## 1. L'épingle d'arbre attendue n'existe pas encore : un témoin marqué

- La liste doit épingler le **commit de fusion du lot « outil figé »** sur le tronc et le `tree_sha256` de `tools/kata-recalc/` à ce
  commit (G0 de la partie 3, §5.1 point 1). Ce lot n'est pas fusionné : `monark/reason-order-1` = `09f49fc2` (lu par `git ls-remote`),
  dont l'arbre de l'outil donne `289756d3…` par la règle de ce lot (égal à l'épingle de `test/kata-recalc.test.ts` sur cette branche).
- **Le lot porte donc un témoin** : `commit` = 40 zéros ; `tree_sha256` = l'arbre du tronc, `e9e11ccb63a7f5c5…` (celui du lot 1e,
  remesuré par `toolTreeSha256` sur l'index et sur `177b5755` : égal à l'épingle de `test/kata-recalc.test.ts` à la base).
- **Il ne peut pas fusionner tel quel** : le test `verifier_list_commit_carries_the_listed_tree` rougit sur 40 zéros (assertion
  nommée « a placeholder »), et sur tout commit absent de l'historique ou dont l'arbre n'est pas le `tree_sha256` listé. La CI de la PR
  est donc rouge sur ce seul test, par construction, jusqu'au rebase.
- **Au rebase** (après la fusion de l'outil figé, épingle donnée par MONARK) : `commit` = la fusion, `tree_sha256` remesuré,
  `VERIFIERS_SHA256` réécrit, et le texte du tueur de `verifier_list_is_the_pinned_canonical_bytes` suivi. La fusion de
  `test/kata-recalc.test.ts` a **deux régions en conflit** contre l'arbre de travail de l'outil figé (une seule contre `09f49fc2`,
  mesure de MONARK, G2 de #231 constat 8) :
  1. **le bloc d'imports**, où les deux lots ajoutent des lignes : garder les deux lignes d'import ;
  2. **l'épingle**, dans le corps de `kata_recalc_tree_is_the_pinned_manifest` : garder la lecture de la liste, et retirer du
     commentaire de l'outil figé la phrase « In the body, so that each lot that moves the pin is judged by scripts/red-proof.mjs… »
     (l'épingle n'est plus dans le corps ; un déplacement d'épingle se prouve désormais comme le dit le §6).

## 2. Construction

- **`apps/harness/data/verifiers.json`** : une ligne, canonique (`canonicalJson` de `scripts/spec-publish.mjs`), sans LF final, une
  entrée de liste `monark-kata-recalc` (§1).
- **`apps/harness/src/policy-verifiers.ts`** (116 lignes ; imports `node:crypto`, `node:fs`, `node:url`, rien d'autre) :
  - `VERIFIERS_SHA256` (l.18), `REPOSITORY`, `TOOL_ROOT` ;
  - les types `ListEntry`, `Revocation` et `Verifier` (l'élément rendu par `readVerifiers`, les deux formes ; nom attendu par la
    partie 3, §5.1 point 2) ;
  - `identityOf` (l.35), la règle de `policy-guard.ts` l.24 à l'octet près ;
  - `validDate` (l.38-42), même expression et même contrôle du calendrier que `scripts/spec-publish.mjs` l.46-50, sans import ;
  - `readVerifiers(bytes)` (l.51-86), lecteur fermé : deux formes d'entrée fermées (`{commit, identity, repository, tree, tree_sha256}`
    et `{commit, identity, revoked}`, ni clé de plus, ni clé absente, ni mélange) ; `identity` égale à `identityOf(identity)` et non
    vide ; `commit` 40 hex minuscules ; `repository` = `KraidleAI/monark-governance` ; `tree` = `tools/kata-recalc` ; `tree_sha256`
    64 hex ; paire `(identity, commit)` unique parmi les entrées de liste, ordre d'ajout, sans tri ; une révocation nomme une entrée de
    liste **au-dessus** d'elle, une seule fois ; `revoked` passe `validDate` et ne commande rien. Chaque refus est nommé ;
  - **le lecteur ferme aussi les octets** (pli 5, décision de MONARK : en un seul lieu) : le décodage garde un BOM (`TextDecoder`,
    `ignoreBOM: true`, l.56) ; après les contrôles de forme, le texte doit être l'écriture canonique de ce qu'il rend,
    `JSON.stringify` de la forme fermée à clés triées, chaque chaîne bien formée (`isWellFormed`, l.84), sinon le refus nommé « not the
    canonical writing of the list ». Sont donc refusés : l'écriture « pretty », un LF final, un CRLF, une clé en double au sommet ou
    dans une entrée (« la dernière gagne » dans `JSON.parse`), des clés dans un autre ordre, un demi-substitut échappé. Un BOM en octets
    est refusé par `JSON.parse` (« not UTF-8 JSON »), puisque le décodeur le garde. **La clause de copie portée de 3a (T3-6) cite ce
    contrôle et ne le refait pas** ;
  - **il rend une liste gelée** (pli 3) : chaque élément dans sa forme fermée, clés triées, gelé (`Object.freeze`, l.62), puis le
    tableau (l.85). Un appelant en JavaScript non typé (la porte `.mjs` de 3a n'est ni typée ni lintée) ne peut donc changer la liste
    que `pinnedVerifiers()` mémorise pour tout le processus ;
  - `isListEntry`, `listEntries` : A-1 et la garde ne retiennent que les entrées de liste ;
  - `checkedVerifiers(bytes, pin)` : sha256 des octets égal à l'épingle, sinon refus fermé ;
  - `pinnedVerifiers()` (Q-P3-7) : **paresseuse et mémorisée**. Elle lit `../data/verifiers.json` depuis `import.meta.url` à son
    premier appel, jamais au chargement, vérifie `VERIFIERS_SHA256` et rend le même tableau ensuite. Une liste absente ou altérée lève
    à chaque appel, et un échec n'est pas mémorisé (pli 2 : prouvé par un troisième appel). La porte, l'écrivain et la garde, qui
    l'appelleront en partie 3, s'arrêtent donc fermés sur une liste altérée ;
  - `isPrefix(copy, list)` : jugement d'une copie portée par préfixe, entrée par entrée, dans l'ordre (Q-4, A-4) ;
  - `toolTreeSha256(blobs)` : la règle d'arbre du §3.2 (mode `100644` seul, chemin sous `tools/kata-recalc/`, `manifestText`, sha256).
- **`policy-guard.ts` n'est pas touché.** La forme de sa l.24 (alias d'une ligne de `identityOf`) et son import (l.137-138) restent au
  lot 3b, comme le dit le G0 de la partie 3 (révision 4, §3.3 ; MONARK, `…-g2-p3-v3.md` l.37-38, retire « la forme de la l.24 » de ce
  qu'il listait pour 1f). Ce lot fixe ce dont l'alias dépend : le module n'importe ni `scripts/` ni la garde (pas de cycle, l.24 hors de
  zone morte), et le test d'identité tient la règle sur des **sorties attendues**, pour ne pas devenir tautologique quand 3b fera de
  `verifierIdentity` un alias (§5.1 point 6 de la partie 3 : 1f l'écrit, 3b n'a plus à l'ajouter).
- **`test/kata-recalc.test.ts`** : l'épingle du test d'arbre n'est plus une constante ; c'est le `tree_sha256` de la dernière entrée de
  liste de `monark-kata-recalc` qu'aucune révocation ne nomme, lue par `pinnedVerifiers()` (chantier §5, « remplace l'épingle du test
  d'arbre »).
- **`.gitignore`** : `run-log.json`, à toute profondeur. Le journal de course de `report.py` (durées) est ignoré et ne peut donc pas
  être commité par mégarde (G2 de #217 l.38 de RECHERCHES ; MONARK, `…-chantier-kata-partage.md` l.81). Ce lot n'en prouve pas plus
  (pli 7) : sa non-publication est la clause de 3a, le refus de tout `run-log.json` d'une release (`recompute_report_invalid`, P3-R-5,
  T3-5).
- **Amendements du chantier** (`docs/G0-lot-verifiers-list-f5a-1.md`, sur place, aucune ligne ajoutée ni retirée, pour ne pas décaler
  les citations de la partie 3) : l.263 (« clés exactes » vaut par forme) ; l.265 (la phrase « identités uniques et triées » sort,
  remplacée par la règle de Q-P3-1) ; l.266 (le texte lu est l'écriture canonique de ce que le lecteur rend, pli 5) ; l.288-289 (le
  commit listé est la fusion du lot « outil figé », pli 6) ; l.298 (`node:fs` et `node:url` en plus de `node:crypto`, pour
  `pinnedVerifiers()` seule, rien de `scripts/`) ; l.319 (`registry` sans `file`, N-6) ; l.471-472 (les refus du test du lecteur).

## 3. Tests rouges et tueurs

Tous dans `test/verifiers-list.test.ts`, sauf le dernier point. Rouges à la base : module neuf (le fichier de test ne charge pas).
Rouges avant le pli, par assertion (tests de `dbcc65d7` sur le module de `b894a587`) : `verifier_list_is_the_pinned_canonical_bytes`
(« the array and each of its elements frozen ») et `verifier_list_reader_is_closed_on_the_bytes` (« pretty-printed ») ; les autres
ajouts du pli tiennent sur l'ancien module et tuent les survivants de la G2 (§8).

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| `verifier_list_is_the_pinned_canonical_bytes` | sha256 du fichier = `VERIFIERS_SHA256` ; écriture canonique, sans LF final ; `pinnedVerifiers()` mémorisée, égale au lecteur ; **tableau et éléments gelés** (`Object.isFrozen`), un `push` et une écriture dans un élément lèvent (mode strict) | `apps/harness/src/policy-verifiers.ts:18 CONST "220e9025…" -> "0000…"` (64 caractères) |
| `verifier_list_reader_refuses_each_departure` | admis : ordre d'ajout, deux révisions d'une identité, révocation après son entrée ; refus nommés : clé de plus, clé absente, mélange, révocation à clé de liste, format, clé de tête, liste vide, non-JSON, majuscule, `a@b`, identité vide, majuscule dans une révocation, **identité `1`**, `commit` majuscule, **non hex (`"g".repeat(40)`), tableau (`[C1]`)** ou court, `tree_sha256` court, **majuscule (`"A".repeat(64)`), non hex (`"g".repeat(64)`) ou tableau (`[T1]`)**, `tree` autre, `repository` autre, paire en double, révocation avant son entrée ou sans entrée, deux révocations, quatre dates fausses, date non chaîne | `apps/harness/src/policy-verifiers.ts:67 CONST "v.identity === identityOf(v.identity)" -> "true"` |
| `verifier_list_reader_is_closed_on_the_bytes` (neuf, pli 5) | l'écriture canonique est lue, en octets comme en chaîne ; refus « not the canonical writing of the list » : pretty, LF final, CRLF, `verifiers` deux fois au sommet, `commit` deux fois dans une entrée, clés d'une entrée dans un autre ordre, clés du sommet dans un autre ordre, demi-substitut échappé dans une identité ; BOM en octets : « not UTF-8 JSON » | `apps/harness/src/policy-verifiers.ts:84 SDL "fail(\"not the canonical writing of the list\")" -> ""` |
| `verifier_tool_tree_is_the_listed_tree` | `toolTreeSha256` de l'index sous `tools/kata-recalc/` = règle de `manifestText` = `tree_sha256` de l'entrée de l'outil ; un fichier de plus, un octet changé : écart ; modes `120000`, `160000`, `100755` et chemin voisin : refus nommés | `apps/harness/src/policy-verifiers.ts:113 CONST "p.slice(TOOL_ROOT.length + 1)" -> "p"` |
| `verifier_identity_rule_is_the_guard_rule_and_not_the_generator` | sur neuf noms (casse, « @ » multiples, chaîne vide, « @ » en tête, non-ASCII : É, ß, ǅ), `identityOf` donne l'identité attendue et égale `verifierIdentity` de `policy-guard.ts` ; **l'outil listé est l'identité que `report.py` écrit (`TEXTS.identity`), et n'est pas celle du générateur qu'il nomme (`TEXTS.generator_identity`)**, lues par la regex du bloc `TEXTS` de `kata-recalc.test.ts` (pli 7) | `apps/harness/src/policy-verifiers.ts:35 CONST "/[A-Z]/g" -> "/[A-Y]/g"` |
| `verifier_list_copy_passes_the_spec_gate` | `contentProblems("contract-1.1.0-tables-2026-10-20/verifiers.json", "json", …)` vide | `scripts/spec-publish.mjs:96 CONST "/^monark-governance$/i.test(v.word)" -> "false"` |
| `pinned_list_is_read_lazily_and_an_altered_list_stops_closed` | copie du module seule dans un dossier jetable, enfant Node : le chargement ne lit rien ; sans liste, deux appels lèvent `ENOENT`, puis l'enfant écrit les octets épinglés et **un troisième appel les lit** (`loaded\|ENOENT\|ENOENT\|1`) ; de même après la liste altérée ; octets épinglés : trois appels rendent ; `checkedVerifiers` refuse une liste altérée ; `isPrefix` | `apps/harness/src/policy-verifiers.ts:90 CONST "sha256(bytes) !== pin" -> "false"` |
| `verifier_list_date_rule_is_the_spec_publish_rule` (test de la racine) | `validDate` du module = `validDate` de `scripts/spec-publish.mjs` sur chaque jour de 2023 à 2026, leurs voisins impossibles (jour 00, 29 à 32), et 18 valeurs (bissextiles 1900, 2000, 2024 ; mois 00 et 13 ; formes courtes ; espace ; LF ; chiffre pleine chasse ; non-chaînes) ; **les spécificateurs du module, énumérés par `ts.preProcessFile(text, true, true).importedFiles`** (toute forme : sur plusieurs lignes, `export * from`, import nu, `import()`, `require`), sont exactement `node:crypto`, `node:fs`, `node:url` ; aucun ne nomme `scripts/` ni la garde, et la garde n'est nommée que dans les commentaires (pli 4) | `apps/harness/src/policy-verifiers.ts:39 CONST "/^\\d{4}-\\d{2}-\\d{2}$/" -> "/^\\d{4}-\\d{1,2}-\\d{2}$/"` |
| `run_log_is_ignored_untracked_and_named_by_no_spec_input` (ex-`no_run_log_is_ever_published`, pli 7) | `git check-ignore --no-index` sur quatre chemins (racine, dossier du rapport, sortie de l'outil, dossier daté) ; aucun fichier suivi de ce nom, sans casse ; aucune entrée de release de `scripts/spec-publish-inputs.json` ne le lit ni ne l'écrit ; `report.py` l'écrit sous ce nom, à côté du rapport. La publication relève de 3a | `.gitignore:36 SDL "run-log.json" -> ""` |
| `verifier_list_commit_carries_the_listed_tree` | chaque entrée de liste nomme un commit de l'historique (pas le témoin) dont l'arbre sous `tools/kata-recalc/` a le `tree_sha256` listé (recette du §3.2) | `apps/harness/src/policy-verifiers.ts:115 CONST "(a.path < b.path ? -1 : 1)" -> "(a.path < b.path ? 1 : -1)"` |
| `kata_recalc_tree_is_the_pinned_manifest` (`test/kata-recalc.test.ts`, corps changé) | l'épingle est lue dans la liste | inchangé : `tools/kata-recalc/kata_lib.py:265 CONST "(_EWMA_W[nret - j] * r) * r" -> "_EWMA_W[nret - j] * (r * r)"` |

- **Écart déclaré** : le chantier (§5) voulait les refus de la règle d'arbre « sur un dépôt jetable ». Ils sont jugés sur l'entrée de
  `toolTreeSha256` (les blobs avec leur mode) ; la lecture git, de l'index comme d'un commit, est exercée par deux tests sur le dépôt.
- **Mutants équivalents** (mesurés) : le premier tueur prévu du test de la date, `CONST "t.getUTCDate() === d" -> "true"`, est
  mort-né au red-proof, et à raison : pour un jour de deux chiffres, `Date.UTC` qui déborde change toujours de mois (ou d'année pour un
  mois 00 ou 13), si bien que deux des trois contrôles du calendrier suffisent ; chacun des trois, pris seul, est un mutant équivalent.
  Ils restent, pour que la règle soit l'expression même de `spec-publish.mjs`. Le tueur vise le contrôle de forme (`2026-1-01` admis).
  Au pli, aucun mutant des clauses neuves n'est équivalent : gel des éléments, gel du tableau, comparaison canonique, `isWellFormed`,
  `ignoreBOM`, tri des clés et clause entière sont chacun tués par une assertion (§8).
- **Témoin et red-proof** : au témoin, `verifier_list_commit_carries_the_listed_tree` est rouge au gel. La preuve se joue donc sur un
  gel local, non poussé, qui remplace le témoin par `177b5755` (fusion de #217 : son arbre est `e9e11ccb…`), et réécrit l'épingle
  et le tueur de la l.18 en conséquence (§4).

## 4. Preuves

- **red-proof du pli, gel de preuve** (local, non poussé : branche locale `proof-1f-fold-local`) :
  - tête du gel `f840705a9800adb6b3941254e53c419f6f157bd7` = la tête de code du pli, `b463cc1802d52f3e8476a21c0657768c7f91c8a8`, plus un
    commit qui remplace le témoin par `177b5755d373eda8bc2d0066ebddf86ee3fa3097` (même arbre de l'outil), réécrit `VERIFIERS_SHA256`
    en `ef92f9cd1fbd537d…` et le texte du tueur de la l.18 ; base `1cddd2e5a4cb54791db16e704beae8e7af41152a` ;
  - `node scripts/red-proof.mjs --base 1cddd2e5a4cb54791db16e704beae8e7af41152a --gel f840705a9800adb6b3941254e53c419f6f157bd7 --repo
    <worktree> --out <dossier> --draw 11 --seed 1007`, Node 24.21.0, Linux : sortie 0, « 11 judged, 3 unchanged, 11 killer(s)
    drawn » ; onze tests `new-module`, onze tueurs tirés et tués, chacun par une assertion (`assert-fail`) ;
  - digest du gel `be53bf9a2e34db6758276f6d80620e5e022c1483fea7f5500b8891d453628541` ; sha256 du `RED-PROOF.json`
    `57ea76334be4b1a6a596b5967b580fa219d8318ceccf6b20acbaf91cd57d0a2c`. Les commits suivants du pli ne changent que `docs/**/*.md`,
    hors du digest : le digest vaut pour la tête de la PR, témoin remplacé.
- **red-proof du G1, gel de preuve** (pour mémoire, pli 9 : le message qui ouvrait la G2 ne les portait pas) : tête du gel
  `44e2740fc0d2497814a5702ff3f60611f2fa7bcd` (`b894a587` plus le même remplacement, branche locale `proof-1f-local`), même commande
  avec `--draw 10` : sortie 0, « 10 judged, 3 unchanged, 10 killer(s) drawn » ; digest
  `3f896416cff1d7c0f77fc00bfc027434198b5995c01030be8f928c3e7dc42aa8` (le rejeu Windows de MONARK donne le même) ; sha256 du
  `RED-PROOF.json` `5e57553c9e129c8959c79ba0c6a9547863e33063e552634954f768681f053efa` (Linux ; celui du rejeu Windows est
  `eb44e257b4873f1c614556dd9cbad6c36530b07622326efee04626c181baa5b3`).
- **red-proof, tête de code du pli** (`b463cc18`, témoin en place), sans `--draw` : sortie 1, « 11 judged » ; dix `new-module`,
  `verifier_list_commit_carries_the_listed_tree` refusé (« not green at gel ») : c'est le témoin qui parle.
- **Mutants rejoués** (§8) : les neuf survivants de la G2 (A à I) survivent bien sur `b894a587` et sont tués à la tête ; douze autres
  mutants des clauses du pli, tous tués par assertion.
- **Voisins** (Node 24.21.0) : `byte-guard`, `spec-*`, `kata-recalc`, `verifiers-list`, `policy-guard`, `export-public` (hors test 42),
  `lang-gate*`, `short-digest-floor`, `ci-gates` : 168 tests, 167 verts, le seul rouge est le témoin.
- **Suite `test:main` complète** (Linux, une fois, à `b463cc18`) : 2 841 tests, 2 818 verts, 22 sautés, un rouge, le témoin
  (`verifier_list_commit_carries_the_listed_tree`).
- `tsc --noEmit` 0 ; `eslint .` 0 (tout le dépôt) ; `lang:gate` 0 ; `gate:vocab` 0 (349 fichiers) ; `lint:ratchet` 69/69 ;
  `export:check` 0 ; winlint (atelier de RECHERCHES) `--base 1cddd2e5` : 7 fichiers, aucun risque Windows. Le test du chargement
  paresseux importe la copie du module par `pathToFileURL` et passe ses chemins par `JSON.stringify`, pour l'oracle Windows.

## 5. Taille

- R-25, forme de la CI (`git diff --shortstat` contre la base, `docs/**/*.md` exclus) : 5 fichiers, 363 insertions, 5 suppressions,
  soit **368** (borne de lot 547). Un seul lot.

## 6. Ce qui n'est pas fait

- L'épingle d'arbre réelle (§1) : au rebase, après la fusion de l'outil figé.
- Aucun consommateur servi de `pinnedVerifiers()` n'est branché (porte, écrivain, garde) : c'est la partie 3 (3a, 3b) et E-2a (§7). Ce
  lot prouve que la lecture épinglée lève, fermée, sur une liste absente ou altérée, sans mémoriser l'échec, et ne lit rien au
  chargement.
- **Lots futurs qui déplacent l'outil** (décision de MONARK, G2 de #231 constat 8) : une fois l'épingle devenue une donnée, chacun
  prouve son entrée neuve par `red-proof --test-only` sur `verifier_list_commit_carries_the_listed_tree`, tueur tiré. Sous
  `--test-only` (`scripts/red-proof.mjs` l.14), le G0 du lot porte la ligne `red-proof: test-only` et liste le tueur du test ; le
  test, vert à la base et au gel, est « pinned » si son tueur, tiré au gel, le rougit par une assertion.
- Aucune course de l'outil ; aucune série lue.

## 7. Tuyaux (règle de branchement ; pli 10)

| Tuyau | Entrée | Sortie | État | Test de composition |
|---|---|---|---|---|
| liste → porte de 3a (P-1 de la partie 3) | `apps/harness/data/verifiers.json` (1f), vérifié par `VERIFIERS_SHA256` | `pinnedVerifiers()` → `recomputeHeld`, `recomputeProblems` de `spec-publish.mjs` (T3-5, T3-6) ; une copie portée est jugée par `readVerifiers` (octets canoniques compris) et `isPrefix` | « upcoming » | T3-10 `a_recompute_table_goes_from_the_writer_through_the_gate` (3b : entrée réelle de 1f, octets réels de la liste, `plan()` au lecteur par défaut) |
| liste → écrivain de 3b → dossier daté (P-2) | la même | `pinnedVerifiers()` → `datedFiles` → `D/verifiers.json`, octets épinglés (T3-7) | « upcoming » | T3-10, le même |
| liste → chargeur d'E-2a → garde de 3b (P-4) | la même | `pinnedVerifiers()` → chargeur d'E-2a → `GuardPins.verifiers` → `guardKataRow` l.101-104 (T3-8 ; VERIFIER-GUARD-PINS-E2A-1) | « upcoming » (item ouvert) | `served_guard_pins_carry_the_pinned_verifiers` (chantier l.595) |

- **Dans ce lot**, le seul consommateur est un test : `kata_recalc_tree_is_the_pinned_manifest` lit son épingle par
  `pinnedVerifiers()` (fichier → lecture épinglée → consommateur), avec `verifier_tool_tree_is_the_listed_tree`. Aucun chemin servi :
  la liste reste « upcoming » jusqu'au chargeur d'E-2a et à la première release datée réelle qui passe `plan()` avec la liste et le
  rapport réels (partie 3, §5.3).

## 8. Pli de la G2 de #231 (MONARK, `802c2a8` ; onze m)

| # | Constat | Pli | Où (tête du pli) |
|---|---|---|---|
| 1 | cinq mutants survivent au test du lecteur, dont un refus non nommé (identité `1`) et un `commit` tableau admis | six refus nommés de plus, chacun avec sa regex : `commit` `"g".repeat(40)` et `[C1]`, `tree_sha256` `"A".repeat(64)`, `"g".repeat(64)` et `[T1]`, `identity` `1` | `test/verifiers-list.test.ts:78-86` |
| 2 | « un échec n'est pas mémorisé » non prouvé (mutant F) | l'enfant écrit les octets épinglés après deux levées et appelle une troisième fois : `loaded\|ENOENT\|ENOENT\|1`, de même après la liste altérée | `test/verifiers-list.test.ts:169`, `:173-187` |
| 3 | liste mémorisée partagée et mutable | `Object.freeze` sur chaque élément puis sur le tableau ; affirmé (`Object.isFrozen`, `push` et écriture qui lèvent) | `policy-verifiers.ts:62`, `:85` ; `test/verifiers-list.test.ts:48-51` |
| 4 | garde des imports par une regex d'une ligne (mutants G, H, I) | `ts.preProcessFile(text, true, true).importedFiles` comparé aux trois ; interdit de `scripts/` et de la garde gardé | `test/verifiers-list.test.ts:204-207` |
| 5 | lecteur fermé sur la forme, pas sur les octets | écriture canonique exigée, refus nommé ; un cas par forme ; T3-6 cite ce contrôle (§2) | `policy-verifiers.ts:51-56`, `:84` ; `test/verifiers-list.test.ts:97-113` ; chantier l.266 |
| 6 | chantier l.288 : « le commit de fusion de 1e » | la fusion du lot « outil figé » (G0 de la partie 3 §5.1 point 1), sur place, lignes égales | chantier l.288-289 |
| 7 | deux noms de test promettent plus que leurs assertions | `run_log_is_ignored_untracked_and_named_by_no_spec_input` ; l'identité du générateur et celle de l'outil lues dans `TEXTS` de `report.py` ; corps de PR et note du `.gitignore` adoucis | `test/verifiers-list.test.ts:146-151`, `:213` ; `.gitignore:35` |
| 8 | rebase : deux régions ; déplacements futurs de l'épingle | §1 (imports, épingle, phrase « In the body… » retirée) ; §6 (`--test-only`, tueur tiré) | §1, §6 |
| 9 | têtes et sha256 du `RED-PROOF.json` absents | portés | §4 |
| 10 | pas de tableau de tuyaux | ajouté | §7 |
| 11 | provenance : G1 à effort bas | effort déclaré, max pour ce pli ; l'écart est consigné par MONARK | en-tête |
| N-6 | chantier l.319 : `registry` avec `file` | `{cells, generator_identity, sha256}`, le nom d'entrée dans `inputs.compare[].name` ; sur place, lignes égales | chantier l.319 |

- **Mutants rejoués** (bac `git archive` de la tête, chaque test lancé seul par `--test-name-pattern`, fichier restauré et sha256
  vérifié) :
  - les neuf survivants de la G2, recopiés de sa pièce : A (`COMMIT` `[0-9a-z]`), B (`HEX64` `[0-9a-fA-F]`), C (`HEX64` `[0-9a-z]`),
    D (type de l'identité retiré), E (type du `commit` retiré), F (premier échec mémorisé), G (`node:path` sur trois lignes),
    H (`./policy-projection.ts` sur trois lignes), I (`export * from "./policy-classes.ts"`) : **survivent** sur `b894a587`
    (pass=1 fail=0), **tués** à la tête, chacun par une assertion ;
  - même famille : E2 (type de `tree_sha256` retiré ; survivait aussi), G2 (import nu), G3 (`import()` de `scripts/`),
    G4 (`export { … } from`) : tués ;
  - clauses du pli : J (gel des éléments retiré), K (gel du tableau retiré), L (comparaison canonique retirée), M (`isWellFormed`
    retiré), N (`ignoreBOM: false`), O (tri des clés retiré), P (le tueur déclaré, clause entière), Q (`isWellFormed` sur le texte au
    lieu des valeurs) : tués.
