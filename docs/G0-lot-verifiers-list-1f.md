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
  Puis la décision de MONARK sur le point ouvert du §6 (`recherches:29f8ea9`, `…-MONARK-vers-RECHERCHES-1f-pliee-238.md`, section
  « 1f, le point ouvert du §6 ») ; §6. Puis la seconde G2 de la chaîne (`recherches:dd734ea`,
  `…-MONARK-vers-RECHERCHES-g2-chaine-r2.md`, section « 1f (#231) » et décision de doctrine commune ; pièce
  `pieces/2026-10-07-g2-chaine-r2/g2f2-231.json` : un M, deux m) ; §6 et §10. Puis la G2 ciblée du second tour, par une instance
  neuve de RECHERCHES (`recherches:e1c7752`, pièce `pieces/2026-10-07-g2-recherches/G2-231-234-r2.json` : deux m, F1 et F2, aucun M ;
  verdict CORRECTIONS) ; §11. Puis la fusion de l'outil figé au tronc (#241, `6536057c`) : le tronc fusionné dans la branche et la
  première entrée de liste (consigne du coordinateur, 2026-10-07 ; consigne de MONARK sur le rebase, `…-231-234-239-recus.md`
  l.16-18) ; §12.
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
  - **Réécriture du §6** (décision `29f8ea9`) : worker `claude-opus-5-5`, **effort: max**, déclaré ; horloge lue (`date -u`) à 13:19 UTC
    au début du travail, 13:58 UTC pour ce G0. Seul ce G0 change. La voie est rejouée dans un worktree détaché neuf du scratchpad (mêmes
    règles ; Node 24.21.0, Linux). Le worktree de ce lot était propre à `12588884` : l'agent arrêté par le redémarrage du conteneur vers
    13:16 UTC n'y avait rien laissé.
  - **Pli du second tour** (`dd734ea`) : worker `claude-opus-5-5`, **effort: max**, déclaré ; horloge lue (`date -u`) à 14:03 UTC à la
    réception, 14:32 UTC pour ce G0. Même worktree, repris à `c601290b` ; gel de preuve dans un worktree détaché neuf ; sondes de
    remplacement dans un clone `--shared` jetable (refs de remplacement retirées, 0 restante ; aucune dans le dépôt) ; mêmes règles.
    Node 24.21.0, Linux.
  - **Pli de la G2 ciblée** (`e1c7752`) : worker `claude-opus-5-5`, **effort: max**, déclaré ; horloge lue (`date -u`) à 17:52 UTC au
    début de l'écriture, 18:20 UTC pour ce G0. Worktree détaché neuf du scratchpad (`wt-231f2`) à `e6d13075` ; le gel de preuve dans un
    second (`wt-231f2-gel`), la garde des tueurs du tronc dans un troisième, jetable ; `node_modules` fait de liens vers celui du clone
    principal, `@monark/*` repointés dans chaque worktree, retirés à la fin ; ni `GIT_DIR`, ni `GIT_WORK_TREE`, ni `--write-tree`.
    Node 24.21.0, Linux.
  - **Fusion du tronc et première entrée** (§12) : worker `claude-opus-5-5`, **effort: max**, déclaré ; même session, même worktree
    (`wt-231f2`), repris propre à `92b0fdab` ; fusion `669ad472` à 18:20 UTC, commit de liste `fa874ac4` à 18:24 UTC, 18:40 UTC pour ce
    G0 ; la fusion seule mesurée dans le worktree du gel (`wt-231f2-gel`, remis à `669ad472`) ; mêmes règles. Node 24.21.0, Linux.
- **Zone** : `apps/harness/data/verifiers.json` (neuf), `apps/harness/src/policy-verifiers.ts` (neuf), `test/verifiers-list.test.ts`
  (neuf), `test/kata-recalc.test.ts` (l'épingle du test d'arbre passe à la liste), `.gitignore` (deux lignes et un blanc),
  `docs/G0-lot-verifiers-list-f5a-1.md` (amendements sur place, nombre de lignes inchangé) ; au second tour,
  `apps/harness/test/helpers/import-specifiers.ts` (neuf : l'aide partagée des chargements, §10) ; au pli de la G2 ciblée, l'aide et
  `test/verifiers-list.test.ts` seuls (§11) ; à la première entrée (§12), la fusion du tronc (un conflit, `test/kata-recalc.test.ts`),
  puis `apps/harness/data/verifiers.json`, `policy-verifiers.ts` l.18 et `test/verifiers-list.test.ts`, rien sous `tools/kata-recalc/`.

## 1. L'épingle d'arbre attendue n'existe pas encore : un témoin marqué

- **Fait le 2026-10-07 (§12)** : l'outil figé a fusionné au tronc (#241, `6536057c`). Le tronc est **fusionné** dans la branche
  (`669ad472`, « Merge the trunk », sans rebase, consigne de MONARK), les deux régions en conflit résolues comme ci-dessous, et le
  commit `fa874ac4` écrit l'entrée réelle (`6536057c`, `d6c80e9d…`), l'épingle, le tueur de la l.38 et le littéral. Le témoin n'est
  plus ; ce qui suit garde le plan d'avant, où « au rebase » se lit « à la fusion du tronc ».
- La liste doit épingler le **commit de fusion du lot « outil figé »** sur le tronc et le `tree_sha256` de `tools/kata-recalc/` à ce
  commit (G0 de la partie 3, §5.1 point 1). Ce lot n'est pas fusionné : `monark/reason-order-1` = `09f49fc2` (lu par `git ls-remote`),
  dont l'arbre de l'outil donne `289756d3…` par la règle de ce lot (égal à l'épingle de `test/kata-recalc.test.ts` sur cette branche).
- **Le lot porte donc un témoin** : `commit` = 40 zéros ; `tree_sha256` = l'arbre du tronc, `e9e11ccb63a7f5c5…` (celui du lot 1e,
  remesuré par `toolTreeSha256` sur l'index et sur `177b5755` : égal à l'épingle de `test/kata-recalc.test.ts` à la base).
- **Il ne peut pas fusionner tel quel** : le test `verifier_list_commit_carries_the_listed_tree` rougit sur 40 zéros (assertion
  nommée « a placeholder »), et sur tout commit hors de l'historique de `HEAD` (`git merge-base --is-ancestor`, second pli : un objet
  du dépôt ne suffit plus) ou dont l'arbre n'est pas le `tree_sha256` listé. La CI de la PR est donc rouge sur ce seul test, par
  construction, jusqu'au rebase.
- **Au rebase** (après la fusion de l'outil figé, épingle donnée par MONARK ; ce rebase écrit la première entrée ; un lot qui déplace ensuite l'outil se liste lui-même, §6) : `commit`
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
chaque ajout est vert à la tête et rougit, par une assertion, un mutant qui survivait à `6c53e0a1` (§9). Second tour : le test neuf
`import_helper_reads_literal_specifiers_and_refuses_computed_loads` rougit au commit `80585c3c`, sur le contrôle sur le texte déplacé
tel quel dans l'aide, et passe au commit `1d6a7014`, qui le remplace par le parcours de l'AST (§10).

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| `verifier_list_is_the_pinned_canonical_bytes` | sha256 du fichier = `VERIFIERS_SHA256` ; écriture canonique, sans LF final ; `pinnedVerifiers()` mémorisée, égale au lecteur ; **tableau et éléments gelés** (`Object.isFrozen`), un `push` et une écriture dans un élément lèvent (mode strict) | `apps/harness/src/policy-verifiers.ts:18 CONST "3a6f304f…" -> "0000…"` (64 caractères ; `"220e9025…"` au témoin, avant le §12) |
| `verifier_list_reader_refuses_each_departure` | admis : ordre d'ajout, deux révisions d'une identité, révocation après son entrée ; refus nommés : clé de plus, clé absente, mélange, révocation à clé de liste, format, clé de tête, liste vide, non-JSON, majuscule, `a@b`, identité vide, majuscule dans une révocation, **identité `1`**, `commit` majuscule, **non hex (`"g".repeat(40)`), tableau (`[C1]`)** ou court, `tree_sha256` court, **majuscule (`"A".repeat(64)`), non hex (`"g".repeat(64)`) ou tableau (`[T1]`)**, `tree` autre, `repository` autre, paire en double, révocation avant son entrée ou sans entrée, deux révocations, quatre dates fausses, date non chaîne | `apps/harness/src/policy-verifiers.ts:67 CONST "v.identity === identityOf(v.identity)" -> "true"` |
| `verifier_list_reader_is_closed_on_the_bytes` (neuf, pli 5) | l'écriture canonique est lue, en octets comme en chaîne ; refus « not the canonical writing of the list » : pretty, LF final, CRLF, `verifiers` deux fois au sommet, `commit` deux fois dans une entrée, clés d'une entrée dans un autre ordre, clés du sommet dans un autre ordre, demi-substitut échappé dans une identité ; BOM en octets : « not UTF-8 JSON » ; **second pli** : octet UTF-8 invalide (`0xFF` dans l'identité) et BOM passé en chaîne : « not UTF-8 JSON » ; LF final passé en chaîne, demi-substitut échappé dans une **seconde** entrée, clés d'une **révocation** dans un autre ordre : « not the canonical writing » ; une liste qui porte une révocation est rendue gelée élément par élément | `apps/harness/src/policy-verifiers.ts:84 SDL "fail(\"not the canonical writing of the list\")" -> ""` |
| `verifier_tool_tree_is_the_listed_tree` | `toolTreeSha256` de l'index sous `tools/kata-recalc/` = règle de `manifestText` = `tree_sha256` de l'entrée de l'outil ; un fichier de plus, un octet changé : écart ; modes `120000`, `160000`, `100755` et chemin voisin : refus nommés | `apps/harness/src/policy-verifiers.ts:113 CONST "p.slice(TOOL_ROOT.length + 1)" -> "p"` |
| `verifier_identity_rule_is_the_guard_rule_and_not_the_generator` | sur neuf noms (casse, « @ » multiples, chaîne vide, « @ » en tête, non-ASCII : É, ß, ǅ), `identityOf` donne l'identité attendue et égale `verifierIdentity` de `policy-guard.ts` ; **l'outil listé est l'identité que `report.py` écrit (`TEXTS.identity`), et n'est pas celle du générateur qu'il nomme (`TEXTS.generator_identity`)**, lues par la regex du bloc `TEXTS` de `kata-recalc.test.ts` (pli 7) | `apps/harness/src/policy-verifiers.ts:35 CONST "/[A-Z]/g" -> "/[A-Y]/g"` |
| `verifier_list_copy_passes_the_spec_gate` | `contentProblems("contract-1.1.0-tables-2026-10-20/verifiers.json", "json", …)` vide | `scripts/spec-publish.mjs:96 CONST "/^monark-governance$/i.test(v.word)" -> "false"` |
| `pinned_list_is_read_lazily_and_an_altered_list_stops_closed` | copie du module seule dans un dossier jetable, enfant Node : le chargement ne lit rien ; sans liste, deux appels lèvent `ENOENT`, puis l'enfant écrit les octets épinglés et **un troisième appel les lit** (`loaded\|ENOENT\|ENOENT\|1`) ; de même après la liste altérée ; octets épinglés : trois appels rendent ; `checkedVerifiers` refuse une liste altérée ; `isPrefix` | `apps/harness/src/policy-verifiers.ts:90 CONST "sha256(bytes) !== pin" -> "false"` |
| `verifier_list_date_rule_is_the_spec_publish_rule` (test de la racine) | `validDate` du module = `validDate` de `scripts/spec-publish.mjs` sur chaque jour de 2023 à 2026, leurs voisins impossibles (jour 00, 29 à 32), et 18 valeurs (bissextiles 1900, 2000, 2024 ; mois 00 et 13 ; formes courtes ; espace ; LF ; chiffre pleine chasse ; non-chaînes) ; **les spécificateurs du module, tels que les liste `importSpecifiers` de l'aide** (`ts.preProcessFile(text, true, true)` : import, import nu, import de type, sur plusieurs lignes, ré-export, `export * from`, `import x = require()`, et `import()` ou `require()` d'un littéral ou d'un gabarit sans substitution ; un commentaire après le mot-clé est sauté), sont exactement `node:crypto`, `node:fs`, `node:url` ; aucun ne nomme `scripts/` ni la garde, et la garde n'est nommée que dans les commentaires (pli 4) ; **second tour** (le contrôle sur le texte du second pli, déplacé puis remplacé) : `forbiddenLoads` de l'aide rend `[]` sur le module, par un parcours de l'AST : aucun `import()` d'un non-littéral, et aucun des noms `require`, `getBuiltinModule`, `createRequire`, `eval`, `Function`, `constructor`, `dlopen`, **`binding`** (pli de `e1c7752`, §11), ni en identifiant ni en chaîne constante (§10) | `apps/harness/src/policy-verifiers.ts:39 CONST "/^\\d{4}-\\d{2}-\\d{2}$/" -> "/^\\d{4}-\\d{1,2}-\\d{2}$/"` |
| `import_helper_reads_literal_specifiers_and_refuses_computed_loads` (neuf, second tour, en fin de fichier) | `importSpecifiers` lit les neuf formes littérales (import ; guillemets simples ; sur plusieurs lignes ; ré-export et import nu, chacun avec un commentaire avant le spécificateur ; `export * from` ; `import()` d'un gabarit sans substitution ; `import /* lazy */ (…)` ; `require`), dans l'ordre du texte, et ni la prose d'un commentaire de doc ou de ligne ni une chaîne ; `forbiddenLoads` nomme, ligne et forme, quinze cas : G7, G11, E1 à E5, E3 par un gabarit et des parenthèses (avec `eval` par une clé entre parenthèses), G9, `createRequire`, `require`, `eval` et `Function`, R1, `dlopen`, **`process.binding('fs')`** (pli de `e1c7752`, §11) ; et ne nomme rien sur un commentaire de ligne, un commentaire de doc indenté, un commentaire bloc, une chaîne et deux `import()` littéraux | `apps/harness/test/helpers/import-specifiers.ts:51 CONST "ts.isStringLiteralLike(n.arguments[0])" -> "true"` (l.43 avant le pli de `e1c7752`) |
| `run_log_is_ignored_untracked_and_named_by_no_spec_input` (ex-`no_run_log_is_ever_published`, pli 7) | `git check-ignore --no-index` sur quatre chemins (racine, dossier du rapport, sortie de l'outil, dossier daté) ; aucun fichier suivi de ce nom, sans casse ; aucune entrée de release de `scripts/spec-publish-inputs.json` ne le lit ni ne l'écrit ; `report.py` l'écrit sous ce nom, à côté du rapport. La publication relève de 3a | `.gitignore:36 SDL "run-log.json" -> ""` |
| `verifier_list_commit_carries_the_listed_tree` | **à la première entrée** (§12), le corps s'ouvre sur le littéral `[commit, tree_sha256]` de l'entrée de l'outil, `6536057c` et `d6c80e9d…` (l.242) ; chaque entrée de liste nomme un commit **de l'historique de `HEAD`** (`git merge-base --is-ancestor`, second pli ; pas le témoin) dont l'arbre sous `tools/kata-recalc/` a le `tree_sha256` listé (recette du §3.2) ; **second tour** : chaque lecture git d'un commit listé passe `--no-replace-objects` (`merge-base` l.242, `ls-tree` l.243, comme `cat-file` l.245 ; l.245, l.246 et l.248 depuis le §12) : une ref locale `refs/replace` ne greffe plus un commit dans l'historique ni ne change l'arbre d'un commit listé (phrase au commentaire, l.237 ; §10) | `apps/harness/src/policy-verifiers.ts:115 CONST "(a.path < b.path ? -1 : 1)" -> "(a.path < b.path ? 1 : -1)"` |
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
- Au second tour, même forme (les 21 pathspecs de `ci.yml` l.100, `origin/lot/etude-suite...HEAD`, tronc à `102b44d3`, merge-base
  `1cddd2e5`) : 6 fichiers, 458 insertions, 5 suppressions, soit **463** (borne 547) ; `apps/harness/test/helpers/import-specifiers.ts`
  50/0, `test/verifiers-list.test.ts` 282/0 ; le même compte sous l'environnement épinglé de `pin`, dans un clone `--shared` jetable.
- Au pli de la G2 ciblée (§11), même forme (les 21 pathspecs de `ci.yml` l.100, lus dans le fichier, `1cddd2e5...HEAD`) : 6 fichiers,
  467 insertions, 5 suppressions, soit **472** (borne 547 ; borne de la CI 1 205), contre 463 avant (la CI de `e6d13075` lisait 463) ;
  l'aide 58/0 (+8, l'en-tête), `test/verifiers-list.test.ts` 283/0 (+1, le cas neuf).
- À la première entrée (§12), même forme, contre le tronc (`6536057c...HEAD`, merge-base `6536057c`, la CI lisant
  `origin/lot/etude-suite...HEAD`) : 6 fichiers, 470 insertions, 1 suppression, soit **471** (borne 547 ; borne de la CI 1 205) ;
  `test/kata-recalc.test.ts` 6/1 (la fusion du tronc le rapproche : 6/5 contre `1cddd2e5`), `test/verifiers-list.test.ts` 286/0 (le
  littéral et le commentaire du test d'historique).

## 6. Ce qui n'est pas fait

- L'épingle d'arbre réelle (§1) : au rebase, après la fusion de l'outil figé. **Faite** le 2026-10-07 (§12), par une fusion du tronc
  et non un rebase (consigne de MONARK).
- Aucun consommateur servi de `pinnedVerifiers()` n'est branché (porte, écrivain, garde) : c'est la partie 3 (3a, 3b) et E-2a (§7). Ce
  lot prouve que la lecture épinglée lève, fermée, sur une liste absente ou altérée, sans mémoriser l'échec, et ne lit rien au
  chargement.
- **Lots futurs qui déplacent l'outil : le lot se liste lui-même** (décision de MONARK `29f8ea9`, précisée par la seconde G2 de la
  chaîne, `dd734ea` constat 1 ; elle remplace la séquence à deux lots du second pli, entre les fusions de laquelle la CI du premier lot
  était rouge ; `--test-only`, la décision 8 de la première G2, ne peut toujours pas tourner : ce mode refuse sans test tout changement de
  production, `scripts/red-proof.mjs` l.14). Le lot change `tools/kata-recalc/**`, puis **un commit final, qui ne touche rien sous
  `tools/kata-recalc/`**, ajoute l'entrée de liste qui nomme **son dernier commit d'outil** (le dernier qui touche `tools/kata-recalc/`)
  et le `tree_sha256` de l'outil à ce commit. Ce commit final porte aussi `VERIFIERS_SHA256`, le texte du tueur de la l.38 du test (sa
  cible est la l.18 du module) et le littéral `[commit, tree_sha256]` en tête du corps de `verifier_list_commit_carries_the_listed_tree`,
  `assert.deepEqual([toolEntry(pinnedVerifiers())?.commit, toolEntry(pinnedVerifiers())?.tree_sha256], ["<40 hex>", "<64 hex>"], …)`,
  que 1f écrit à son rebase (§1). Le fichier de liste n'est pas sous l'outil : l'ajouter ne change pas l'arbre de l'outil, et l'entrée
  nomme un commit qui ne la contient pas (chantier l.286). red-proof, **en mode par défaut**, juge alors ce test F2P (rouge à la base par
  le littéral, la liste de la base n'ayant pas l'entrée neuve ; vert au gel), son tueur tiré (l.115). D'où la phrase gardée au rebase
  (§1, point 2) : « In the body, so that each lot that moves the pin is judged by scripts/red-proof.mjs ». **Les cinq conditions** :
  - (a) red-proof avec `--gel <sha de la tête du lot>`, jamais un dossier : en mode dossier, red-proof clone la base et y recopie les
    fichiers, si bien que le commit nommé n'est pas ancêtre de `HEAD` au gel (refus « not green at gel ») ;
  - (b) fusion `--no-ff` seulement, jamais squash ni rebase-merge : les fusions du tronc sont faites par MONARK en local, `--no-ff`, et le
    G7 rejoue la suite sur le commit de fusion avant tout push. C'est la garde, puisqu'aucune CI ne court sur le tronc
    (`.github/workflows/` ne porte que `ci.yml`, `on: pull_request`, l.18-19 ; l.251 : « the local --no-ff merges open no PR ») ;
    les réglages du dépôt ne changent pas ;
  - (c) aucun rebase après l'épinglage, sinon on réépingle ;
  - (d) un pli qui touche l'outil après l'épinglage ajoute un commit de liste neuf, où l'entrée du lot nomme le nouveau dernier commit
    d'outil (épingle, tueur l.38 et littéral suivis) ;
  - (e) les commits du lot sont poussés ensemble : seul, le commit d'outil rougit les deux tests d'arbre (règle du chantier l.291-292).
- **La première entrée** (l'outil figé) ne change pas : il fusionne avant 1f, et 1f, rebasée, nomme son commit de fusion (§1).
  **Écrite** le 2026-10-07 (§12) : `6536057c`, la branche ayant fusionné le tronc au lieu d'être rebasée.
- **Mesure d'un lot qui se liste lui-même** (rejouée ici, locale, jamais poussée ; worktree détaché neuf du scratchpad, branches
  jetables `proof-1f-selflist-local` et `proof-1f-selflist-fold-local` ; sur le test de `12588884`, dont le corps du test d'historique
  n'a changé depuis que par `--no-replace-objects`, sans effet hors d'une ref de remplacement, §10) :
  - base `dd0b8db9` : la tête de 1f dans l'état de son rebase, simulé comme aux gels de preuve (témoin remplacé par `177b5755`, arbre
    `e9e11ccb…`, épingle et tueur l.38 suivis, littéral en tête du corps) ; le lot : `d7989e32`, une ligne ajoutée à
    `tools/kata-recalc/report_check.py` (arbre `56b5be8f…`), puis le commit final `1f711a6c`, qui ne touche que la liste, le module
    (épingle `359abd32…`) et le test (tueur l.38, littéral) : entrée nommant `d7989e32`. À `1f711a6c`, `verifiers-list` et `kata-recalc` :
    14 tests, 14 verts ;
  - (a) `red-proof --base dd0b8db9 --gel 1f711a6c --draw 1 --seed 1007` (Node 24.21.0, Linux) : sortie 0, « 1 judged, 9 unchanged,
    1 killer(s) drawn » ; `verifier_list_commit_carries_the_listed_tree` F2P, tueur l.115 tué par assertion ; digest du gel `4ddfab69…`,
    `RED-PROOF.json` `6c3a93ca…`. Le même lot avec `--gel <worktree>` : sortie 1, refusé « not green at gel (assert-fail) », le gel
    portant « d7989e32… is in the history of HEAD » (`RED-PROOF.json` `471e4c29…`) ;
  - (b) fusion `--no-ff` sur un tronc qui a avancé hors de l'outil (`319f6a01`, une ligne de doc) : `ebd654fe`, dont `d7989e32` est
    ancêtre (`merge-base --is-ancestor`, sortie 0) ; 14 sur 14. Le même lot en squash sur `319f6a01` : `1ab33ec9`, un seul parent ;
    `d7989e32` sort de l'historique (sortie 1) et `verifier_list_commit_carries_the_listed_tree` rougit par assertion (13 sur 14) ;
  - (c) un rebase après l'épinglage (`d7989e32..1f711a6c` sur `319f6a01` : `a1455a74`, `2cbe3966`) : `d7989e32` reste un objet du dépôt
    (`cat-file -e`) mais sort de l'historique, et le même test rougit (« d7989e32… is in the history of HEAD » ; 13 sur 14) ;
  - (d) un pli qui touche l'outil après l'épinglage (`822f1962`, sur `1f711a6c`) : 12 sur 14, les deux tests d'arbre rouges ; puis un
    commit de liste neuf (`0d404da0` : l'entrée du lot nomme `822f1962`, arbre `dd629db1…`, épingle `830c3eb3…`, tueur et littéral
    suivis) : 14 sur 14 ; `red-proof --base dd0b8db9 --gel 0d404da0 --draw 1 --seed 1007` sort 0, F2P, tueur l.115 tué
    (`RED-PROOF.json` `69be6107…`) ;
  - (e) `d7989e32` seul : 12 sur 14, `kata_recalc_tree_is_the_pinned_manifest` et `verifier_tool_tree_is_the_listed_tree` rouges par
    assertion.
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
| 2 (m) | la garde des imports ne voit pas un spécificateur calculé : G7 (`import(n)`), G9 (`process.getBuiltinModule`), G11 (`import()` d'un gabarit à substitution) | décision de MONARK : le contrôle sur le texte de la pièce `import-fix-check-231.mjs` (commentaires de doc retirés par ses deux regex ; aucun `/\bimport\s*\(/`, `/\brequire\s*\(/`, `/getBuiltinModule/`) ; « in any form » (commentaire et message du test, §3) devient vrai. **Remplacé au second tour** (`dd734ea`, constat 2 : E1 à E5 passaient, et quatre faux positifs fermaient) : la lecture passe à l'AST dans l'aide partagée, et le libellé à la liste exacte de ce qui est lu (§10) | `:217-218` ; commentaire `:204-205` |
| 3 (M) | la méthode du §6 ne peut pas tourner (`--test-only` refuse tout changement de production ; en mode par défaut, aucune ligne de corps ne bouge) | décision de MONARK, qui remplace sa décision 8 : §6 réécrit (le lot qui déplace l'outil fusionne d'abord, un lot court nomme sa fusion et change une ligne littérale du corps, F2P en mode par défaut) ; phrase « In the body… » gardée au rebase ; voie rejouée ici ; fenêtre rouge entre les deux fusions mesurée et nommée. **Remplacé** par la décision de MONARK `29f8ea9` : le lot se liste lui-même, sans fenêtre rouge, sous les cinq conditions de `dd734ea` (§6, §10) | §1, §6 |
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

## 10. Pli du second tour de la chaîne (MONARK, `dd734ea` ; pièce `g2f2-231.json` : un M, deux m)

Lignes lues à la tête `c601290b` avant le pli : celles de la pièce (relue à `12588884`) tiennent pour le test, qui n'avait pas bougé
(l.38 le tueur de l'épingle, l.204-205 et l.216-218 le contrôle des imports, l.242, l.243 et l.245 les lectures git) ; dans ce G0, §1
l.41 et §9 l.288 de la pièce étaient à la l.47 et à la l.303, déjà repris par `c601290b` ; le point ouvert l.231-237 était retiré.

| # | Constat | Pli | Où (tête `1a4e0718`) |
|---|---|---|---|
| 1 (M) | le §6 décrit encore la séquence à deux lots, sans les conditions de la voie neuve | §6 réécrit : le commit final ne touche rien sous l'outil et porte l'entrée, `VERIFIERS_SHA256`, le tueur l.38 et le littéral en tête du corps ; les cinq conditions (a) à (e) ; la mesure d'un lot qui se liste lui-même, rejouée pour chaque condition ; §1 et §9 mis à jour | §1 (« Au rebase »), §6, §9 ligne 3 |
| 2 (m) | le contrôle sur le texte laisse passer E1 à E5, et ferme sur quatre faux positifs | décision de doctrine : `apps/harness/test/helpers/import-specifiers.ts`, une seule aide (le chemin d'a1, qui prendra cette version) ; `importSpecifiers` par `ts.preProcessFile` ; `forbiddenLoads` par un parcours de l'AST ; un cas par forme ; les libellés « in any form » et « toute forme » deviennent la liste lue | aide l.1-50 (règle `import()` l.43) ; `test/verifiers-list.test.ts:202-218`, `:251-282` |
| 3 (m) | `merge-base` (l.242) et `ls-tree` (l.243) suivent `refs/replace` | `--no-replace-objects` sur les deux, comme sur `cat-file` (l.245), avec une phrase au commentaire | `test/verifiers-list.test.ts:237`, `:242`, `:243` |

- **Ce que lit l'aide** (en-tête de l'aide, l.1-15) : `importSpecifiers` rend ce que `ts.preProcessFile(text, true, true)` liste (mesuré
  sur 30 formes avec TypeScript 6.0.3 : il lit le gabarit sans substitution, le commentaire après le mot-clé et entre `import` et sa
  parenthèse, et ne lit ni un gabarit à substitution, ni un nom, ni un commentaire, ni une chaîne, ni `@import` de JSDoc).
  `forbiddenLoads` parcourt l'AST de `ts.createSourceFile` et nomme : tout `import()` dont l'argument n'est pas un littéral ou un gabarit
  sans substitution (les deux que `ts.preProcessFile` lit) ; les noms de la liste décidée, `require`, `getBuiltinModule`,
  `createRequire`, `eval`, `Function`, et deux de plus, `constructor` (le `Function` de toute fonction, R1) et `dlopen` (un module
  natif), en identifiant où qu'il soit, nom de propriété compris, ou en chaîne constante (littéraux et gabarits sans variable, joints par
  `+`, entre parenthèses ou non), comme la clé calculée d'E3. Les commentaires et les chaînes de prose ne sont pas des nœuds de code.
- **Limite nommée, item IMPORT-AST-RUNTIME-NAME-1** (à ouvrir à l'ETAT) : un nom bâti à l'exécution à partir d'autre chose que des
  littéraux (une variable, `join`, un code de caractère) n'est pas lu ; le lire voudrait exécuter le code. Mesuré :
  `Reflect.get(Object.getPrototypeOf(async () => {}), ["constr", "uctor"].join(""))` passe.
- **Les cas** (test `import_helper_reads_literal_specifiers_and_refuses_computed_loads`, l.251-282, reconstruits d'après la pièce pour
  E1 à E5) et ce que rend chaque lecture, cas par cas, sur le contrôle sur le texte déplacé (`80585c3c`) puis sur l'AST (`1d6a7014`) :
  G7, G11, G9 et `require` sont vus par les deux ; E1 (commentaire de doc sur la ligne), E2 (commentaire entre `import` et `(`), E3
  (clé calculée), E3 par un gabarit et des parenthèses, E4 (ligne qui commence par `*`), E5 (G11 derrière un commentaire de doc),
  `createRequire`, `eval` et `Function`, R1 et `dlopen` rendent `[]` sur le texte et sont nommés par l'AST ; les six lignes de prose (un
  commentaire de ligne, un commentaire de doc indenté, un commentaire bloc, une chaîne, deux `import()` littéraux) étaient des faux
  positifs du texte et rendent `[]` sur l'AST.
- **Mutants du module** (insérés après la l.15 de `policy-verifiers.ts`, chacun seul, `test/verifiers-list.test.ts` rejoué, module
  restauré et sha256 revérifié) :

| Mutant | Tests de `c601290b` (contrôle sur le texte) | Tests de `1a4e0718` (AST) |
|---|---|---|
| G7, G9, G11, `createRequire` par `getBuiltinModule` | tués | tués par `verifier_list_date_rule_is_the_spec_publish_rule` (« nor a load that no specifier shows ») |
| E1, E2, E3, E4, E5, R1 | **survivent** | tués, le même |
| FP1 à FP4 (commentaire de ligne, commentaire de doc indenté, commentaire bloc, chaîne, portant les jetons) | rougissent (faux positifs) | verts |

- **Mutants de l'aide** (chacun seul sur `import-specifiers.ts`, les tests qui l'importent rejoués) : 17, tous tués par assertion. Règle
  `import()` (le tueur déclaré, l.43) ; chacun des sept noms retiré ; le `+` des constantes ; le gabarit ; les parenthèses ; le drapeau qui
  évite le double compte ; la règle des identifiants ; deux options de `ts.preProcessFile` ; le littéral des constantes ; le parcours des
  enfants.
- **Le constat 3, mesuré** (clone `--shared` jetable au gel de preuve) : (a) liste nommant `09f49fc2` (arbre `289756d3…`), puis
  `git replace --graft HEAD HEAD^ 09f49fc2` : `merge-base --is-ancestor` sort 0 avec les remplacements et 1 sans ; le test rougit avec
  les deux drapeaux (« 09f49fc2… is in the history of HEAD ») et passe sans eux ; (b) liste nommant `177b5755` avec l'arbre faux
  `289756d3…`, puis `git replace 177b5755 09f49fc2` : le test rougit avec les drapeaux (« the tree of tools/kata-recalc at 177b5755… ») et
  passe sans eux. Refs de remplacement retirées après chaque sonde (0) ; aucun test ne peut tenir ce cas sans écrire une ref dans le
  dépôt : le mutant qui retire un drapeau y reste vert.
- **red-proof du second tour** (gel de preuve local `cc5cdeca` : la tête `1a4e0718` plus le même remplacement du témoin, `c0e22af8`
  repris par `cherry-pick`) : `node scripts/red-proof.mjs --base 1cddd2e5a4cb54791db16e704beae8e7af41152a --gel cc5cdeca --repo
  <worktree> --out <dossier> --draw 12 --seed 1007`, Node 24.21.0, Linux : sortie 0, « 12 judged, 3 unchanged, 12 killer(s) drawn » ;
  douze `new-module` ; douze tueurs tirés et tués, chacun par une assertion, dont celui de l'aide (l.43) ; digest du gel
  `9039431135673ae3fe77d3e8e3bf47b2bb373a1d30e9b633be4d982026943645` ; `RED-PROOF.json`
  `50a39191b838a9322950ed536a92cdbb843bc3932c69924326bd5a1c418f826c`. Un premier essai, le test de l'aide dans un fichier à lui
  (`apps/harness/test/import-specifiers.test.ts`), était refusé « green at base: a self-confirming test » : red-proof recopie l'aide,
  fichier d'appui sous `test/`, dans la base. Le test est donc en fin de `test/verifiers-list.test.ts`, qui ne charge pas à la base.
- **Voisins** (mêmes fichiers qu'au §4, Node 24.21.0, `(test 42)` filtré) : 169 tests, 168 verts, seul rouge le témoin. `test:main`
  (Linux, à `1a4e0718`) : 2 842 tests, 2 819 verts, 22 sautés ; seul rouge, le témoin. Portes : `tsc --noEmit` 0 ; `eslint .` 0 ; `lang:gate` 0 ; `gate:vocab` 0 (349 fichiers) ;
  `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base 1cddd2e5` : 8 fichiers, aucun risque Windows ; `verifie-ancres.mjs`
  (`--ref c601290b`) : 1 530 tueurs, aucun PERDU ni DERIVE ; les 11 des fichiers touchés, ancrés.

## 11. Pli de la G2 ciblée de RECHERCHES (`recherches:e1c7752` ; pièce `G2-231-234-r2.json` : deux m)

Note datée du 2026-10-07, 18:20 UTC. La pièce (instance neuve de RECHERCHES, `claude-opus-5-5`, effort max ; têtes lues `e6d13075` et
`560d5f59`) tient les plis du second tour pour fidèles et la borne de 64 niveaux de #234 pour saine, et rend CORRECTIONS sur deux m,
additifs et non bloquants. Ses lignes, lues à `e6d13075` : l'aide l.20 (`NAMES`) et l.43 (la règle `import()`), le test l.251-282.

| # | Constat | Pli | Où (tête `c933d658`) |
|---|---|---|---|
| F1 (m) | `process.binding('fs')` atteint un module interne de Node sans import, de la classe de `getBuiltinModule` (nommé), et `forbiddenLoads` rend `[]` (ni `binding` ni `process` dans `NAMES`) ; IMPORT-AST-RUNTIME-NAME-1 ne le couvre pas (un appel littéral) | `binding` ajouté à `NAMES` ; un cas au test de l'aide, `process.binding('fs');` → `["l.1: binding"]` ; l'en-tête le nomme, et les commentaires des deux tests qui listent les noms aussi | aide l.11-12, l.28 ; `test/verifiers-list.test.ts:277`, `:204-205`, `:254-255` |
| F2 (m) | `forbiddenLoads` ne nomme ni `new Worker(url)`, ni `vm.runInThisContext(code)`, ni un enfant de `node:child_process` lancé avec `--import`, qui chargent vraiment (mesure de la pièce) ; fermés pour `policy-verifiers.ts` par la liste de ses spécificateurs | écrit dans l'en-tête : non nommés ; fermés aujourd'hui par la seule liste des spécificateurs que le test de chaque module balayé affirme (`node:worker_threads`, `node:vm` et `node:child_process` n'y sont pas) et par le `tsc` strict (une clé bâtie à l'exécution sur `process` ne compile pas sans conversion) ; un module qui en importe un à bon droit voudra une règle visée. L'en-tête porte aussi la route restante d'IMPORT-AST-RUNTIME-NAME-1 et le coût mesuré par la pièce pour la fermer (règle étroite : 0 faux positif, mais défaite par un alias ; règle large : 52 faux positifs) : l'item reste ouvert (MONARK le note pour l'ETAT, `…-MONARK-vers-RECHERCHES-231-234-239-recus.md` l.12-14) | aide l.14-17, l.18-22 |

- **Rouge d'abord** : le test de `fd63b6f2` (le cas neuf ; les commentaires) sur l'aide de `e6d13075` : 15 tests, 13 verts ;
  `import_helper_reads_literal_specifiers_and_refuses_computed_loads` rougit par assertion (`ERR_ASSERTION`, « binding: an internal
  module of Node with no import, as getBuiltinModule », rendu `[]` au lieu de `["l.1: binding"]`), l'autre rouge est le témoin. À
  `c933d658` (l'aide) : 15 tests, 14 verts ; seul rouge, le témoin.
- **Pas de tueur neuf** : la méthode du fichier en donne un par test, la ligne au-dessus de sa déclaration (convention close,
  `scripts/red-proof.mjs` l.18-19), et non un par refus (le second tour n'en a ajouté ni pour `constructor` ni pour `dlopen`). Le
  mutant de l'entrée neuve (`"binding"` retiré de `NAMES`, l.28 ; fichier restauré, sha256 `2ed89b38…` revérifié) rougit le test de
  l'aide par l'assertion du cas neuf : c'est l'état d'avant le pli. L'en-tête prend huit lignes, et le tueur déclaré du test de l'aide
  suit sa ligne, `import-specifiers.ts:43` → `:51`, même texte (`test/verifiers-list.test.ts:256`).
- **Faux positifs : 0** sur l'arbre balayé. `forbiddenLoads`, de l'aide d'avant puis de la neuve, sur `policy-verifiers.ts` à `e6d13075`
  et à `560d5f59` (#234), sur les 22 modules du graphe servi (la marche de `servedModules`, `apps/harness/test/kata-path.test.ts:319-328`,
  par sa regex et par `importSpecifiers` : les mêmes 22) et sur les deux modules d'a1 (#233 à `096373ab` : `policy-committed.ts`,
  `policy-committed-pins.ts`) : 26 fichiers, 0 constat avant, 0 après. Le mot `binding` n'y paraît qu'en commentaire ou dans une chaîne
  plus longue (`attestation-binding.ts`, `tools/gate.ts`).
- **`tsc`** (relu ici sur un fichier jetable non suivi, retiré) : `process.binding("fs")` donne TS2339, `process[k]` (clé bâtie par
  `join`) TS7053 ; la même clé sous conversion (`as unknown as Record<…>`) compile.
- **red-proof, gel de preuve** (local, jamais poussé) : `d62ca98c0ea32b81ef4f7fd3902e87aa12a5e1bc` = `c933d658` plus le remplacement du
  témoin (`c0e22af8` repris par `cherry-pick -x`) ; `node scripts/red-proof.mjs --base 1cddd2e5a4cb54791db16e704beae8e7af41152a --gel
  d62ca98c0ea32b81ef4f7fd3902e87aa12a5e1bc --repo <worktree du gel> --out <dossier> --draw 12 --seed 1007`, Node 24.21.0, Linux : sortie
  0, « red-proof OK: 12 judged, 3 unchanged, 12 killer(s) drawn » ; douze `new-module` ; douze tueurs tirés et tués, chacun par une
  assertion (`assert-fail`), dont celui de l'aide à sa ligne neuve ; digest du gel
  `b3775435ce6430b1ce083db1a073a8e03990427c093daf731f7f33439c80e444` ; `RED-PROOF.json`
  `30eaa1d8f0f55236bef617025b988caf2b603f7d58b0cb55e49d011deebf55b9`. Au gel, les deux fichiers de 1f : 15 tests, 15 verts. Le commit
  suivant ne change que ce G0, hors du digest.
- **Ancres** : `verifie-ancres.mjs` (`--touched 1cddd2e5 HEAD --ref e6d13075`) : 15 tueurs des fichiers touchés, tous ANCRE ; l'arbre
  entier : 1 530, aucun PERDU ni DERIVE.
- **La garde des tueurs du tronc** (`every_killer_line_is_readable`, absente de cette pile) : rejouée dans un worktree jetable à
  `c933d658`, `test/killer-lines.test.ts`, `scripts/red-proof.mjs` et `test/helpers/git-tracked.ts` pris au tronc (`6536057c`) : aucune
  ligne des fichiers de ce lot n'est signalée ; elle signale 27 lignes de cinq fichiers de la base `1cddd2e5` que le tronc a réécrits
  depuis (`test/mission-lint.test.ts` 15, `test/oracle-run.test.ts` 7, `test/dojo-render.test.ts` 3,
  `test/public-surfaces-honesty.test.ts` 1, `test/red-proof.test.ts` 1).
- **Voisins** (mêmes fichiers qu'au §4, Node 24.21.0, `(test 42)` filtré) : 169 tests, 168 verts ; seul rouge, le témoin. Portes :
  `tsc --noEmit` 0 ; `eslint` de l'aide et du test 0 ; `gate:vocab` 0 (349 fichiers) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ;
  `export:check` 0 ; winlint `--base 1cddd2e5` : 8 fichiers, aucun risque Windows. Taille : §5 (472).
- **La règle du lot qui se liste lui-même** (§6, cinq conditions) : l'aide n'est pas sous `tools/kata-recalc/**`, donc aucun commit de
  liste ; aucun rebase ; les trois commits (`fd63b6f2` le test, `c933d658` l'aide, puis ce G0) sont poussés ensemble. Le témoin reste
  le seul rouge permis.
- **Non vérifié ici** : le rejeu Windows (MONARK, à la fusion).

## 12. L'outil figé fusionné : le tronc fusionné dans la branche, et la première entrée de liste

Note datée du 2026-10-07, 18:40 UTC. Consigne du coordinateur (reçue vers 18:00 UTC, après le pli du §11) : #241, l'outil figé, est
fusionné au tronc `lot/etude-suite` par `6536057c9c1f7577ffe5b9bc31960e1e60c9b8a4` (« Merge #241: … », parents `87b821b0` et
`2a5d0405`, la tête de #241 ; lu par `git fetch +refs/heads/lot/etude-suite:refs/remotes/origin/lot/etude-suite`) ; 1f écrit donc sa
première entrée (§6, « La première entrée » : l'outil figé fusionne avant 1f, et 1f nomme son commit de fusion). Selon la consigne de
MONARK (`…-MONARK-vers-RECHERCHES-231-234-239-recus.md` l.16-18 : ne pas rebaser une branche épinglée), le tronc est **fusionné** dans la
branche, titre « Merge the trunk », au lieu du rebase que prévoyait le §1.

| Étape | Commit | Ce qui change |
|---|---|---|
| fusion du tronc, `--no-ff` | `669ad47215f2867cd84999282578b5ebb30bd4ee` (parents `92b0fdab`, `6536057c`) | le tronc (70 fichiers) ; un seul conflit, `test/kata-recalc.test.ts`, en deux régions, résolues comme le §1 le prévoit : (1) la ligne d'import de `policy-verifiers.ts` (1f), puis les trois de l'outil figé, sa ligne de `scripts/spec-publish.mjs` (avec `tableRowProblems`) remplaçant celle de 1f (l.26-29) ; (2) dans le corps de `kata_recalc_tree_is_the_pinned_manifest`, le commentaire de l'outil figé avec sa phrase « In the body, so that each lot that moves the pin is judged by scripts/red-proof.mjs », puis le commentaire « Lot 1f: … », puis la lecture de la liste ; la constante `PIN = "d6c80e9d…"` de l'outil figé sort (l.51-65). Aucun fichier engendré à refaire |
| commit de liste | `fa874ac48d8f1da32f4876ba09267baa607282b2` | rien sous `tools/kata-recalc/` : `apps/harness/data/verifiers.json` (l'entrée nomme `6536057c` et son arbre ; écrite par `canonicalJson` de `scripts/spec-publish.mjs`, sans LF final) ; `VERIFIERS_SHA256` (`policy-verifiers.ts:18`) ; le texte du tueur de `test/verifiers-list.test.ts:38` ; le littéral en tête du corps de `verifier_list_commit_carries_the_listed_tree` (l.242) et le commentaire du test (l.234-239 : le témoin n'est plus présent ; le littéral nommé) |
| ce G0 | le commit suivant | `docs/` seul |

- **L'arbre listé, par la règle du test** : `git --no-replace-objects ls-tree -r -z --full-tree 6536057c -- tools/kata-recalc`, chaque
  blob par `cat-file`, puis `toolTreeSha256` (les lectures de `verifier_list_commit_carries_the_listed_tree`, l.245-250) : 12 fichiers,
  tous `100644` (arbre git `10e6f04d7c81099ab6271d4521e367471c2ee22c`) ;
  **`d6c80e9db438fe2fb9ea3ca7fab03dc4cc6902eed23a08ca6863417da2a1b451`**. C'est l'épingle que l'outil figé écrivait dans
  `kata_recalc_tree_is_the_pinned_manifest` : même règle (`sha256(manifestText(…))` des blobs `100644` sous l'outil, chemins relatifs à
  `tools/kata-recalc/` ; la recette du §3.2), même valeur ; l'index de la tête, par la règle du test d'arbre, donne la même. L'outil est
  le même à `6536057c` et à la tête (`git diff --quiet`), et le même qu'à `29c53bd5`, que la G2 ciblée a lu (`e1c7752`).
- **L'entrée** (seule entrée de la liste) :
  `{"commit":"6536057c9c1f7577ffe5b9bc31960e1e60c9b8a4","identity":"monark-kata-recalc","repository":"KraidleAI/monark-governance","tree":"tools/kata-recalc","tree_sha256":"d6c80e9db438fe2fb9ea3ca7fab03dc4cc6902eed23a08ca6863417da2a1b451"}` ;
  sha256 des octets de la liste `3a6f304f3eb592c51c73fb8d13c6a3f752bf0168563f57fc5b8ab966a6975d0d`. Le littéral (l.242) :
  `assert.deepEqual([toolEntry(pinnedVerifiers())?.commit, toolEntry(pinnedVerifiers())?.tree_sha256], ["6536057c9c1f7577ffe5b9bc31960e1e60c9b8a4", "d6c80e9db438fe2fb9ea3ca7fab03dc4cc6902eed23a08ca6863417da2a1b451"], "the tool's entry: the listed commit and its tree")`.
- **Le témoin tombe** : à `fa874ac4`, `verifiers-list` et `kata-recalc` : 17 tests, 17 verts (`6536057c` est dans l'historique de
  `HEAD`, son arbre a le digest listé). À la fusion seule (`669ad472`, la liste encore au témoin, l'outil neuf) : 17 tests, 14 verts,
  trois rouges, le témoin et les deux tests d'arbre (`kata_recalc_tree_is_the_pinned_manifest`, `verifier_tool_tree_is_the_listed_tree` :
  la liste nomme encore `e9e11ccb…`) ; d'où la condition (e).
- **red-proof, `--gel <sha>`** (condition (a)), Node 24.21.0, Linux :
  - le commit de liste seul : `node scripts/red-proof.mjs --base 669ad47215f2867cd84999282578b5ebb30bd4ee --gel
    fa874ac48d8f1da32f4876ba09267baa607282b2 --repo <worktree> --out <dossier> --draw 1 --seed 1007` : sortie 0, « red-proof OK: 1
    judged, 10 unchanged, 1 killer(s) drawn » ; `verifier_list_commit_carries_the_listed_tree` F2P (rouge à la fusion par une assertion,
    le littéral contre la liste du témoin ; vert au gel) ; son tueur, `policy-verifiers.ts:115`, tiré et tué par assertion ; digest du
    gel `9643f5039dc5feb31f0ee486218dd499f4516923521f79a469b69144aabe67d2` ; `RED-PROOF.json`
    `404f47d61aeda9c1ae624915c95391d875cc34deea5976b01b6f981cd028be3a`. Le tueur de la l.38, changé, ne juge aucun test (une ligne de
    tueur changée ne compte jamais) ;
  - tout le lot contre le tronc : `--base 6536057c9c1f7577ffe5b9bc31960e1e60c9b8a4 --gel fa874ac48d8f1da32f4876ba09267baa607282b2
    --draw 12 --seed 1007` : sortie 0, « red-proof OK: 12 judged, 5 unchanged, 12 killer(s) drawn » ; douze `new-module` ; douze tueurs
    tirés et tués, chacun par une assertion (`assert-fail`), dont l.115, l.18 (épingle neuve) et l'aide l.51 ; digest du gel
    `c1cc50b426711de12f007efc22aed37574965eef339f06e521a6126f4117f297` ; `RED-PROOF.json`
    `d51b5722a95110c56c0622c517d373f7050f5aa951f4c9aa495b39d02ea31aa4`. Plus de gel de preuve : la tête porte l'entrée réelle. Le commit
    suivant ne change que ce G0, hors du digest.
- **Ancres** : `verifie-ancres.mjs` (`--touched 6536057c HEAD --ref 92b0fdab --ref 6536057c`) : 17 tueurs des fichiers touchés, tous
  ANCRE ; l'arbre entier : 1 623, aucun PERDU ni DERIVE. **La garde des tueurs du tronc** (`every_killer_line_is_readable`,
  `test/killer-lines.test.ts`) est maintenant dans la branche : elle passe (dans `test:main`).
- **`test:main`** (Linux, Node 24.21.0, à `fa874ac4`) : 2 913 tests, 2 891 verts, 22 sautés, aucun rouge ; `every_killer_line_is_readable` y passe ; `test:export` 1 sur 1. Portes : `tsc --noEmit` 0 ; `eslint` du module, de l'aide et des
  deux fichiers de test 0 ; `eslint .` 0 ; `gate:vocab` 0 (349 fichiers) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint
  `--base 6536057c` : 8 fichiers, aucun risque Windows.
- **Taille** : §5 (471, contre le tronc).
- **Les cinq conditions du §6**, pour cette première entrée : (a) red-proof avec `--gel <sha>` (ci-dessus), jamais un dossier ; (b) la
  fusion du tronc dans la branche est un commit de fusion (`--no-ff`) ; la fusion de #231 au tronc reste `--no-ff` seulement, jamais
  squash ni rebase-merge ; (c) aucun rebase depuis l'épinglage, et aucun ne doit suivre (la consigne de MONARK le dit aussi) ; (d) aucun
  pli n'a touché l'outil depuis l'épinglage ; (e) la fusion, le commit de liste et ce G0 sont poussés ensemble (mesuré ci-dessus : la
  fusion seule rougit les deux tests d'arbre).
- **Non vérifié ici** : le rejeu Windows (MONARK, à la fusion).
