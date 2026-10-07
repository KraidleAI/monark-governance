# G0 du lot 1f de VERIFIERS-LIST-F5A-1 : la liste versée des vérificateurs, son lecteur fermé, sa lecture épinglée paresseuse, la règle de la date et le journal de course ignoré

RECHERCHES, 2026-10-07. Base `1cddd2e5` (`lot/etude-suite`, `1cddd2e5a4cb54791db16e704beae8e7af41152a`, lue par `git fetch
+refs/heads/lot/etude-suite:refs/remotes/origin/lot/etude-suite`). Chantier : `docs/G0-lot-verifiers-list-f5a-1.md` §3.2 et §5 partie 1.

- **Demande** : partage 80/20 de MONARK (`recherches:coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-partage-80-20.md`, item 1,
  l.21-35), décisions R3 (`…-outil-fige-r3.md` : Q-P3-1, Q-P3-7, phrase de la l.265, amendement de la l.298), et G0 de la partie 3 de
  RECHERCHES (`recherches:coordination/pieces/2026-10-07-G0-verifiers-partie-3/G0-verifiers-part3.md`, révision 4 lue à 09:12 UTC,
  §3.3 et §5.1 points 1 à 6). Pli : G2 de #231 par MONARK (`recherches:802c2a8`, `…-MONARK-vers-RECHERCHES-g2-231.md` et la pièce
  `pieces/2026-10-07-g2-231/g2-231.json` : onze m, aucun M), et N-6 (`recherches:8ac6bd6`, `registry.file` retiré du rapport) ; §8.
  Second pli : seconde G2 de #231 par MONARK (`recherches:6fb4653`, `…-MONARK-vers-RECHERCHES-g2-chaine.md`, section « #231 » ;
  `recherches:1e47923`, `…-g2-chaine-pieces.md` et ses pièces `pieces/2026-10-07-g2-chaine-textes/fix-snippet-231.ts.txt` et
  `import-fix-check-231.mjs` ; `pieces/2026-10-07-g2-chaine/g2f-231.json` : quatre m, un M) ; §9.
- **Provenance** : worker `claude-opus-5-5`, effort bas (réglage de la session), horloge lue (`date -u`) à 09:02 UTC au début, 09:12
  pour ce G0. Worktree détaché neuf du scratchpad, branche `recherches/verifiers-list-1f` ; `node_modules` lié en dur depuis un autre
  worktree du scratchpad, retiré à la fin. Aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`. Node 24.21.0, Linux.
  - **Pli de la G2** : worker `claude-opus-5-5`, **effort max, déclaré** (constat 11 : le G1 ci-dessus a tourné à effort bas, sans
    exception datée, alors que le tableau des modèles épingle un G1 multi-fichiers à l'effort max ; MONARK consigne l'écart au journal
    de provenance, avec la G2 à max). Début du pli vers 10:13 UTC (horodatage du scratchpad) ; horloge lue (`date -u`) à 10:29 UTC,
    puis 10:43 UTC à la fin. Même worktree, repris à `b894a587` ; mêmes règles (`node_modules` lié en dur puis retiré, ni `GIT_DIR`, ni
    `GIT_WORK_TREE`, ni `--write-tree`). Node 24.21.0, Linux.
  - **Pli de la seconde G2** : worker `claude-opus-5-5`, **effort: max**, déclaré. Horloge lue (`date -u`) à 12:10 UTC au début,
    12:29 UTC pour ce G0. Même worktree, repris à `6c53e0a1` ; gel de preuve et simulation du §6 dans deux worktrees détachés neufs du
    scratchpad ; mêmes règles (`node_modules` lié en dur puis retiré, ni `GIT_DIR`, ni `GIT_WORK_TREE`, ni `--write-tree`). Node
    24.21.0, Linux.
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
  nommée « a placeholder »), et sur tout commit hors de l'historique de `HEAD` (`git merge-base --is-ancestor`, second pli : un objet
  du dépôt ne suffit plus) ou dont l'arbre n'est pas le `tree_sha256` listé. La CI de la PR est donc rouge sur ce seul test, par
  construction, jusqu'au rebase.
- **Au rebase** (après la fusion de l'outil figé, épingle donnée par MONARK ; ce rebase est le premier « lot court » du §6) : `commit`
  = la fusion, ancêtre de `HEAD` ; `tree_sha256` remesuré ; `VERIFIERS_SHA256` réécrit, et le texte du tueur de
  `verifier_list_is_the_pinned_canonical_bytes` suivi ; dans le corps de `verifier_list_commit_carries_the_listed_tree`, la ligne
  littérale `[commit, tree_sha256]` de l'entrée (§6). La fusion de `test/kata-recalc.test.ts` a **deux régions en conflit** contre
  l'arbre de travail de l'outil figé (une seule contre `09f49fc2`, mesure de MONARK, G2 de #231 constat 8) :
  1. **le bloc d'imports** : garder la ligne d'import de `policy-verifiers.ts` (1f) et les trois lignes de l'outil figé ; sa ligne de
     `scripts/spec-publish.mjs`, qui ajoute `tableRowProblems`, **remplace** celle de 1f (garder les deux importerait `canonicalJson`,
     `contentProblems` et `manifestText` deux fois : `SyntaxError`, mesure de MONARK, seconde G2 constat 4) ;
  2. **l'épingle**, dans le corps de `kata_recalc_tree_is_the_pinned_manifest` : garder le commentaire de l'outil figé **avec** sa
     phrase « In the body, so that each lot that moves the pin is judged by scripts/red-proof.mjs » (la raison d'être de la voie du
     §6, décision de MONARK), puis le commentaire « Lot 1f: … », le seul qui dise d'où vient `PIN`, puis la lecture de la liste.

  Non relu ici : l'arbre de travail de l'outil figé n'est pas poussé (`monark/reason-order-1` = `09f49fc2`, `git ls-remote` à 12:28
  UTC) ; les deux points suivent la lecture juste que MONARK a mesurée (seconde G2 constat 4 : tsc 0, eslint 0, 50 tests verts sur 51,
  le seul rouge le témoin), aux commentaires près.

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
ajouts du pli tiennent sur l'ancien module et tuent les survivants de la G2 (§8). Second pli : aucune ligne de production ne change ;
chaque ajout est vert à la tête et rougit, par une assertion, un mutant qui survivait à `6c53e0a1` (§9).

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| `verifier_list_is_the_pinned_canonical_bytes` | sha256 du fichier = `VERIFIERS_SHA256` ; écriture canonique, sans LF final ; `pinnedVerifiers()` mémorisée, égale au lecteur ; **tableau et éléments gelés** (`Object.isFrozen`), un `push` et une écriture dans un élément lèvent (mode strict) | `apps/harness/src/policy-verifiers.ts:18 CONST "220e9025…" -> "0000…"` (64 caractères) |
| `verifier_list_reader_refuses_each_departure` | admis : ordre d'ajout, deux révisions d'une identité, révocation après son entrée ; refus nommés : clé de plus, clé absente, mélange, révocation à clé de liste, format, clé de tête, liste vide, non-JSON, majuscule, `a@b`, identité vide, majuscule dans une révocation, **identité `1`**, `commit` majuscule, **non hex (`"g".repeat(40)`), tableau (`[C1]`)** ou court, `tree_sha256` court, **majuscule (`"A".repeat(64)`), non hex (`"g".repeat(64)`) ou tableau (`[T1]`)**, `tree` autre, `repository` autre, paire en double, révocation avant son entrée ou sans entrée, deux révocations, quatre dates fausses, date non chaîne | `apps/harness/src/policy-verifiers.ts:67 CONST "v.identity === identityOf(v.identity)" -> "true"` |
| `verifier_list_reader_is_closed_on_the_bytes` (neuf, pli 5) | l'écriture canonique est lue, en octets comme en chaîne ; refus « not the canonical writing of the list » : pretty, LF final, CRLF, `verifiers` deux fois au sommet, `commit` deux fois dans une entrée, clés d'une entrée dans un autre ordre, clés du sommet dans un autre ordre, demi-substitut échappé dans une identité ; BOM en octets : « not UTF-8 JSON » ; **second pli** : octet UTF-8 invalide (`0xFF` dans l'identité) et BOM passé en chaîne : « not UTF-8 JSON » ; LF final passé en chaîne, demi-substitut échappé dans une **seconde** entrée, clés d'une **révocation** dans un autre ordre : « not the canonical writing » ; une liste qui porte une révocation est rendue gelée élément par élément | `apps/harness/src/policy-verifiers.ts:84 SDL "fail(\"not the canonical writing of the list\")" -> ""` |
| `verifier_tool_tree_is_the_listed_tree` | `toolTreeSha256` de l'index sous `tools/kata-recalc/` = règle de `manifestText` = `tree_sha256` de l'entrée de l'outil ; un fichier de plus, un octet changé : écart ; modes `120000`, `160000`, `100755` et chemin voisin : refus nommés | `apps/harness/src/policy-verifiers.ts:113 CONST "p.slice(TOOL_ROOT.length + 1)" -> "p"` |
| `verifier_identity_rule_is_the_guard_rule_and_not_the_generator` | sur neuf noms (casse, « @ » multiples, chaîne vide, « @ » en tête, non-ASCII : É, ß, ǅ), `identityOf` donne l'identité attendue et égale `verifierIdentity` de `policy-guard.ts` ; **l'outil listé est l'identité que `report.py` écrit (`TEXTS.identity`), et n'est pas celle du générateur qu'il nomme (`TEXTS.generator_identity`)**, lues par la regex du bloc `TEXTS` de `kata-recalc.test.ts` (pli 7) | `apps/harness/src/policy-verifiers.ts:35 CONST "/[A-Z]/g" -> "/[A-Y]/g"` |
| `verifier_list_copy_passes_the_spec_gate` | `contentProblems("contract-1.1.0-tables-2026-10-20/verifiers.json", "json", …)` vide | `scripts/spec-publish.mjs:96 CONST "/^monark-governance$/i.test(v.word)" -> "false"` |
| `pinned_list_is_read_lazily_and_an_altered_list_stops_closed` | copie du module seule dans un dossier jetable, enfant Node : le chargement ne lit rien ; sans liste, deux appels lèvent `ENOENT`, puis l'enfant écrit les octets épinglés et **un troisième appel les lit** (`loaded\|ENOENT\|ENOENT\|1`) ; de même après la liste altérée ; octets épinglés : trois appels rendent ; `checkedVerifiers` refuse une liste altérée ; `isPrefix` | `apps/harness/src/policy-verifiers.ts:90 CONST "sha256(bytes) !== pin" -> "false"` |
| `verifier_list_date_rule_is_the_spec_publish_rule` (test de la racine) | `validDate` du module = `validDate` de `scripts/spec-publish.mjs` sur chaque jour de 2023 à 2026, leurs voisins impossibles (jour 00, 29 à 32), et 18 valeurs (bissextiles 1900, 2000, 2024 ; mois 00 et 13 ; formes courtes ; espace ; LF ; chiffre pleine chasse ; non-chaînes) ; **les spécificateurs du module, énumérés par `ts.preProcessFile(text, true, true).importedFiles`** (toute forme littérale : sur plusieurs lignes, `export * from`, import nu, `import()`, `require`), sont exactement `node:crypto`, `node:fs`, `node:url` ; aucun ne nomme `scripts/` ni la garde, et la garde n'est nommée que dans les commentaires (pli 4) ; **second pli** : sur le texte du code, commentaires de doc retirés, aucun appel `import(` ni `require(`, aucun `getBuiltinModule` : un spécificateur calculé, que `ts.preProcessFile` ne liste pas, est refusé aussi, et « toute forme » est vrai | `apps/harness/src/policy-verifiers.ts:39 CONST "/^\\d{4}-\\d{2}-\\d{2}$/" -> "/^\\d{4}-\\d{1,2}-\\d{2}$/"` |
| `run_log_is_ignored_untracked_and_named_by_no_spec_input` (ex-`no_run_log_is_ever_published`, pli 7) | `git check-ignore --no-index` sur quatre chemins (racine, dossier du rapport, sortie de l'outil, dossier daté) ; aucun fichier suivi de ce nom, sans casse ; aucune entrée de release de `scripts/spec-publish-inputs.json` ne le lit ni ne l'écrit ; `report.py` l'écrit sous ce nom, à côté du rapport. La publication relève de 3a | `.gitignore:36 SDL "run-log.json" -> ""` |
| `verifier_list_commit_carries_the_listed_tree` | chaque entrée de liste nomme un commit **de l'historique de `HEAD`** (`git merge-base --is-ancestor`, second pli ; pas le témoin) dont l'arbre sous `tools/kata-recalc/` a le `tree_sha256` listé (recette du §3.2) | `apps/harness/src/policy-verifiers.ts:115 CONST "(a.path < b.path ? -1 : 1)" -> "(a.path < b.path ? 1 : -1)"` |
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

- **red-proof du second pli, gel de preuve** (local, non poussé : branche locale `proof-1f-fold2-local`) :
  - tête du gel `c0e22af85572ea10d430967e5afe95d659ac8699` = la tête des tests du second pli,
    `2a0a5f342cbea2389f0f9f0046050dfa9f0fc535`, plus le même remplacement du témoin que le premier pli (`f840705a` repris par
    `cherry-pick`, trois lignes) ; base `1cddd2e5a4cb54791db16e704beae8e7af41152a` ;
  - même commande, `--gel c0e22af85572ea10d430967e5afe95d659ac8699 --draw 11 --seed 1007`, Node 24.21.0, Linux : sortie 0, « 11
    judged, 3 unchanged, 11 killer(s) drawn » ; onze tests `new-module`, onze tueurs tirés et tués, chacun par une assertion
    (`assert-fail`) ;
  - digest du gel `0fca14126ea40e568c5c670a51a6017cfe89cd557cfaf9a41bd6664b3f5ed767` ; sha256 du `RED-PROOF.json`
    `d05bece16ebd541ef4bd4c5b97bf053f2454dcc9db9a017a418dcd8035d09ec4`. Le commit suivant ne change que ce G0, hors du digest.
- **red-proof, tête des tests du second pli** (`2a0a5f34`, témoin en place), sans `--draw` : sortie 1, « 11 judged » ; dix
  `new-module`, `verifier_list_commit_carries_the_listed_tree` refusé (« not green at gel ») : c'est le témoin qui parle
  (`RED-PROOF.json` `b673f3e11fb200c964772eba1948430222c7dffd8d97b54117728f535b61c235`).
- **Mutants du second pli** (§9) : neuf, chacun seul sur `policy-verifiers.ts`, tout le fichier de test rejoué, module restauré et
  sha256 `c6b515c8…` revérifié ; les huit de la seconde G2 et S1f (révocation triée mais non gelée) **survivent** sur les tests de
  `6c53e0a1` (pass=9 fail=1, le seul rouge le témoin) et sont **tués** à `2a0a5f34`, chacun par une assertion à sa ligne neuve.
- **Commit hors de l'historique** (constat 5, sur le gel, fichiers restaurés) : liste nommant `09f49fc2` et son arbre `289756d3…`,
  épingle suivie ; `cat-file -e` sort 0 et `merge-base --is-ancestor 09f49fc2 HEAD` sort 1. Le test de `6c53e0a1` est vert ; celui de
  `2a0a5f34` rougit par assertion (« 09f49fc2… is in the history of HEAD »).
- **Voisins du second pli** (Node 24.21.0, `2a0a5f34`), mêmes fichiers que ci-dessous : 168 tests, 167 verts, le seul rouge est le
  témoin. `test:main` n'est pas relancée en local (un seul fichier de test change) : la CI de la PR la court.
- Portes du second pli : `tsc --noEmit` 0 ; `eslint .` 0 (tout le dépôt) ; `lang:gate` 0 ; `gate:vocab` 0 (349 fichiers) ;
  `lint:ratchet` 69/69 ; `export:check` 0 ; winlint (atelier de RECHERCHES) `--base 1cddd2e5` : 7 fichiers, aucun risque Windows ;
  `verifie-ancres.mjs` (recherches, CM-2) `--ref 6c53e0a1` : 14 tueurs des fichiers touchés, 1 529 dans l'arbre, aucun PERDU ni DERIVE.
- **red-proof du premier pli, gel de preuve** (local, non poussé : branche locale `proof-1f-fold-local`) :
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
- **red-proof, tête de code du premier pli** (`b463cc18`, témoin en place), sans `--draw` : sortie 1, « 11 judged » ; dix `new-module`,
  `verifier_list_commit_carries_the_listed_tree` refusé (« not green at gel ») : c'est le témoin qui parle.
- **Mutants rejoués du premier pli** (§8) : les neuf survivants de la G2 (A à I) survivent bien sur `b894a587` et sont tués à la tête ; douze autres
  mutants des clauses du pli, tous tués par assertion.
- **Voisins du premier pli** (Node 24.21.0) : `byte-guard`, `spec-*`, `kata-recalc`, `verifiers-list`, `policy-guard`, `export-public` (hors test 42),
  `lang-gate*`, `short-digest-floor`, `ci-gates` : 168 tests, 167 verts, le seul rouge est le témoin.
- **Suite `test:main` complète** (Linux, une fois, à `b463cc18`) : 2 841 tests, 2 818 verts, 22 sautés, un rouge, le témoin
  (`verifier_list_commit_carries_the_listed_tree`).
- Portes du premier pli : `tsc --noEmit` 0 ; `eslint .` 0 (tout le dépôt) ; `lang:gate` 0 ; `gate:vocab` 0 (349 fichiers) ;
  `lint:ratchet` 69/69 ; `export:check` 0 ; winlint (atelier de RECHERCHES) `--base 1cddd2e5` : 7 fichiers, aucun risque Windows. Le test du chargement
  paresseux importe la copie du module par `pathToFileURL` et passe ses chemins par `JSON.stringify`, pour l'oracle Windows.

## 5. Taille

- R-25, forme de la CI (`git diff --shortstat` contre la base, `docs/**/*.md` exclus) : 5 fichiers, 363 insertions, 5 suppressions,
  soit **368** (borne de lot 547). Un seul lot.
- Au second pli, même forme (les 21 pathspecs de `.github/workflows/ci.yml` lus dans le fichier, sous l'environnement épinglé de
  `scripts/lot-size-integration.mjs pin`, `origin/lot/etude-suite...HEAD`, merge-base `1cddd2e5`) : 5 fichiers, 375 insertions,
  5 suppressions, soit **380** (`test/verifiers-list.test.ts` 249/0 : 19 lignes ajoutées, 7 réécrites).

## 6. Ce qui n'est pas fait

- L'épingle d'arbre réelle (§1) : au rebase, après la fusion de l'outil figé.
- Aucun consommateur servi de `pinnedVerifiers()` n'est branché (porte, écrivain, garde) : c'est la partie 3 (3a, 3b) et E-2a (§7). Ce
  lot prouve que la lecture épinglée lève, fermée, sur une liste absente ou altérée, sans mémoriser l'échec, et ne lit rien au
  chargement.
- **Lots futurs qui déplacent l'outil** (décision de MONARK, seconde G2 de #231 constat 3 ; elle remplace la décision 8 de la
  première, `--test-only`, qui ne peut pas tourner : ce mode refuse sans test tout changement de production, `scripts/red-proof.mjs`
  l.14, alors qu'un tel lot change par construction `tools/kata-recalc/**`, la liste et `VERIFIERS_SHA256` ; et en mode par défaut,
  une épingle devenue donnée ne change aucune ligne de corps, donc rien n'est jugé, l.7-8) :
  1. **le lot qui déplace l'outil fusionne d'abord** ; il ne touche pas la liste ;
  2. **un lot court suit**, qui ajoute l'entrée de liste nommant le **commit de fusion** du premier (ancêtre de `HEAD`, §1) et le
     `tree_sha256` de l'outil à ce commit, réécrit `VERIFIERS_SHA256` et suit le texte du tueur de la l.18. C'est la séquence même de
     1f : la liste ne peut pas épingler le commit qui la contient (chantier l.286) ;
  3. ce lot court change, **dans le corps** de `verifier_list_commit_carries_the_listed_tree`, la ligne littérale `[commit,
     tree_sha256]` de l'entrée neuve : `assert.deepEqual([toolEntry(pinnedVerifiers())?.commit,
     toolEntry(pinnedVerifiers())?.tree_sha256], ["<40 hex>", "<64 hex>"], …)`. 1f l'écrit à son rebase (§1) ; chaque lot court suivant
     la change. red-proof, **en mode par défaut**, juge alors ce test F2P (rouge à la base par cette assertion, la liste de la base
     n'ayant pas l'entrée neuve ; vert au gel), son tueur tiré (l.115) ;
  4. d'où la phrase gardée au rebase (§1, point 2) : « In the body, so that each lot that moves the pin is judged by
     scripts/red-proof.mjs ».
- **Mesures de la voie** : MONARK, seconde G2, `future3` (sortie 0, F2P, tueur l.115 tué). Rejouée ici sur le gel de preuve, local, non
  poussé : un commit qui déplace l'outil (`0c363587`, une ligne ajoutée à `report_check.py`, pour sa fusion), puis le lot court
  (`a25c3b45`, branche locale `proof-1f-future-local` : entrée nommant `0c363587`, arbre `32366317…`, épingle et tueur l.18 suivis, la
  ligne littérale en tête du corps). `red-proof --base 0c363587 --gel a25c3b45 --draw 1 --seed 1007` : sortie 0, « 1 judged,
  9 unchanged, 1 killer(s) drawn » ; F2P (`assert-fail` à la base, vert au gel), tueur l.115 tué par assertion ; `RED-PROOF.json`
  `58203479c60d17be7d86c1e42c77ffd4ae7174ede1adf3a453fedd7a4b611a18`. **Sans la ligne littérale** (`c5451fe8`, le même lot) : sortie 1,
  « 0 judged, 10 unchanged » (la ligne du tueur changée ne compte pas).
- **Entre les deux fusions** (conséquence de la séquence, mesurée, non tranchée ici) : l'index porte un arbre de l'outil que la liste ne
  liste pas, si bien que `kata_recalc_tree_is_the_pinned_manifest` et `verifier_tool_tree_is_the_listed_tree` rougissent par assertion,
  `verifier_list_commit_carries_the_listed_tree` restant vert (sur le gel, une ligne ajoutée à `report_check.py` dans l'index et l'arbre
  de travail, puis restaurée : 3 tests, 1 vert, 2 rouges). C'est la règle du chantier l.291-292 (« Toute modification ultérieure de l'outil rougit
  le test d'arbre (§5) tant qu'un lot, avec sa G2, n'a pas changé la liste ») : la CI du premier lot est donc rouge sur ces deux tests,
  par construction, jusqu'au lot court. Comment ce lot fusionne alors (rouge accepté et daté, ou lot court empilé et fusionné aussitôt
  après) reste à MONARK.
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

| # | Constat | Pli | Où (tête du premier pli, `6c53e0a1`) |
|---|---|---|---|
| 1 | cinq mutants survivent au test du lecteur, dont un refus non nommé (identité `1`) et un `commit` tableau admis | six refus nommés de plus, chacun avec sa regex : `commit` `"g".repeat(40)` et `[C1]`, `tree_sha256` `"A".repeat(64)`, `"g".repeat(64)` et `[T1]`, `identity` `1` | `test/verifiers-list.test.ts:78-86` |
| 2 | « un échec n'est pas mémorisé » non prouvé (mutant F) | l'enfant écrit les octets épinglés après deux levées et appelle une troisième fois : `loaded\|ENOENT\|ENOENT\|1`, de même après la liste altérée | `test/verifiers-list.test.ts:169`, `:173-187` |
| 3 | liste mémorisée partagée et mutable | `Object.freeze` sur chaque élément puis sur le tableau ; affirmé (`Object.isFrozen`, `push` et écriture qui lèvent) | `policy-verifiers.ts:62`, `:85` ; `test/verifiers-list.test.ts:48-51` |
| 4 | garde des imports par une regex d'une ligne (mutants G, H, I) | `ts.preProcessFile(text, true, true).importedFiles` comparé aux trois ; interdit de `scripts/` et de la garde gardé | `test/verifiers-list.test.ts:204-207` |
| 5 | lecteur fermé sur la forme, pas sur les octets | écriture canonique exigée, refus nommé ; un cas par forme ; T3-6 cite ce contrôle (§2) | `policy-verifiers.ts:51-56`, `:84` ; `test/verifiers-list.test.ts:97-113` ; chantier l.266 |
| 6 | chantier l.288 : « le commit de fusion de 1e » | la fusion du lot « outil figé » (G0 de la partie 3 §5.1 point 1), sur place, lignes égales | chantier l.288-289 |
| 7 | deux noms de test promettent plus que leurs assertions | `run_log_is_ignored_untracked_and_named_by_no_spec_input` ; l'identité du générateur et celle de l'outil lues dans `TEXTS` de `report.py` ; corps de PR et note du `.gitignore` adoucis | `test/verifiers-list.test.ts:146-151`, `:213` ; `.gitignore:35` |
| 8 | rebase : deux régions ; déplacements futurs de l'épingle | §1 (imports, épingle, phrase « In the body… » retirée) ; §6 (`--test-only`, tueur tiré). **Remplacé au second pli** (§9, constats 3 et 4) : phrase gardée, imports précisés, §6 réécrit | §1, §6 |
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

## 9. Pli de la seconde G2 de #231 (MONARK, `6fb4653` et `1e47923` ; quatre m, un M)

| # | Constat | Pli | Où (`2a0a5f34` pour le test) |
|---|---|---|---|
| 1 (m) | le test des octets ne tient pas cinq clauses : N1 (`fatal` retiré, l.56), N3a et N3b (branche chaîne de la l.56 normalisée : `trimEnd`, BOM retiré), P3 (`out.every` → `out.some`, l.84), S1 (révocation rendue sans `closed`, l.75) | les sept lignes de la pièce `fix-snippet-231.ts.txt`, après l'ancienne l.112, à l'octet près sauf la première : `const [pre = "", post = ""]` au lieu de `const [pre, post]`, car `tsc` refuse `Buffer.from(post)` sur `string \| undefined` (`noUncheckedIndexedAccess`) ; même texte lu, même effet | `test/verifiers-list.test.ts:114-120` ; commentaire `:97-99` |
| 2 (m) | la garde des imports ne voit pas un spécificateur calculé : G7 (`import(n)`), G9 (`process.getBuiltinModule`), G11 (`import()` d'un gabarit à substitution) | décision de MONARK : le contrôle sur le texte de la pièce `import-fix-check-231.mjs` (commentaires de doc retirés par ses deux regex ; aucun `/\bimport\s*\(/`, `/\brequire\s*\(/`, `/getBuiltinModule/`) ; « in any form » (commentaire et message du test, §3) devient vrai | `:217-218` ; commentaire `:204-205` |
| 3 (M) | la méthode du §6 ne peut pas tourner (`--test-only` refuse tout changement de production ; en mode par défaut, aucune ligne de corps ne bouge) | décision de MONARK, qui remplace sa décision 8 : §6 réécrit (le lot qui déplace l'outil fusionne d'abord, un lot court nomme sa fusion et change une ligne littérale du corps, F2P en mode par défaut) ; phrase « In the body… » gardée au rebase ; voie rejouée ici ; fenêtre rouge entre les deux fusions mesurée et nommée | §1, §6 |
| 4 (m) | le plan de rebase lu à la lettre importe trois noms deux fois | point 1 : la ligne de `policy-verifiers.ts` (1f) et les trois lignes de l'outil figé, sa ligne de `spec-publish.mjs` (avec `tableRowProblems`) remplaçant celle de 1f ; point 2 : commentaire « Lot 1f: … » gardé | §1 |
| 5 (m) | `git cat-file -e` admet un commit hors de l'historique | `git merge-base --is-ancestor <commit> HEAD`, message « <commit> is in the history of HEAD », titre du test aligné ; mesuré sur `09f49fc2` (§4) | `:242` ; commentaire `:235-237` ; titre `:239` |

- **Mutants du second pli** (chaque mutant seul sur `policy-verifiers.ts` de la tête, tout `test/verifiers-list.test.ts` rejoué,
  module restauré et sha256 `c6b515c8…` revérifié ; « tué » : un test autre que le témoin rougit) :

| Mutant | Ligne du module | Tests de `6c53e0a1` | Tests de `2a0a5f34` : tué par |
|---|---|---|---|
| N1 | l.56 : `fatal: true, ` retiré | survit (pass=9 fail=1) | « an invalid UTF-8 byte » |
| N3a | l.56 : `bytes` → `bytes.trimEnd()` | survit | « a final LF, as a string » |
| N3b | l.56 : `bytes` → `bytes.replace(/^﻿/, "")` | survit | « a BOM, as a string » |
| P3 | l.84 : `!out.every(` → `!out.some(` | survit | « an escaped lone surrogate in a second entry » |
| S1 | l.75 : `return closed(v);` → `return v as Verifier;` | survit | « the keys of a revocation in another order » |
| S1f | l.75 : la révocation triée, non gelée | survit | « a revocation is rendered frozen too » |
| G7 | après la l.15 : `export const lazy7 = (n: string) => import(n);` | survit | « nor a computed specifier… » |
| G9 | après la l.15 : `process.getBuiltinModule("node:path")` | survit | le même |
| G11 | après la l.15 : `import()` d'un gabarit à substitution vers `scripts/` | survit | le même |

- Chaque tuant est une `ERR_ASSERTION` (« Missing expected exception » pour un refus attendu). S1f montre que la septième ligne (le gel)
  tient seule ce que la sixième (l'ordre des clés) ne voit pas. Les tueurs déclarés ne bougent pas : aucune ligne de `policy-verifiers.ts`
  ne change. Les mutants tués au premier pli le restent : le second pli n'ôte aucune assertion, et `merge-base --is-ancestor` est plus
  strict que `cat-file -e`.
