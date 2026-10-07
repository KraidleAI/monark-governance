# G0 du lot 1f de VERIFIERS-LIST-F5A-1 : la liste versée des vérificateurs, son lecteur fermé, sa lecture épinglée paresseuse, la règle de la date et le journal de course jamais publié

RECHERCHES, 2026-10-07. Base `1cddd2e5` (`lot/etude-suite`, `1cddd2e5a4cb54791db16e704beae8e7af41152a`, lue par `git fetch
+refs/heads/lot/etude-suite:refs/remotes/origin/lot/etude-suite`). Chantier : `docs/G0-lot-verifiers-list-f5a-1.md` §3.2 et §5 partie 1.

- **Demande** : partage 80/20 de MONARK (`recherches:coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-partage-80-20.md`, item 1,
  l.21-35), décisions R3 (`…-outil-fige-r3.md` : Q-P3-1, Q-P3-7, phrase de la l.265, amendement de la l.298), et G0 de la partie 3 de
  RECHERCHES (`recherches:coordination/pieces/2026-10-07-G0-verifiers-partie-3/G0-verifiers-part3.md`, révision 4 lue à 09:12 UTC,
  §3.3 et §5.1 points 1 à 6).
- **Provenance** : worker `claude-opus-5-5`, effort bas (réglage de la session), horloge lue (`date -u`) à 09:02 UTC au début, 09:12
  pour ce G0. Worktree détaché neuf du scratchpad, branche `recherches/verifiers-list-1f` ; `node_modules` lié en dur depuis un autre
  worktree du scratchpad, retiré à la fin. Aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`. Node 24.21.0, Linux.
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
  `VERIFIERS_SHA256` réécrit, et le texte du tueur de `verifier_list_is_the_pinned_canonical_bytes` suivi. La résolution du conflit
  attendu sur `test/kata-recalc.test.ts` (l'outil figé y change la constante que ce lot retire) garde la lecture de la liste.

## 2. Construction

- **`apps/harness/data/verifiers.json`** : une ligne, canonique (`canonicalJson` de `scripts/spec-publish.mjs`), sans LF final, une
  entrée de liste `monark-kata-recalc` (§1).
- **`apps/harness/src/policy-verifiers.ts`** (111 lignes ; imports `node:crypto`, `node:fs`, `node:url`, rien d'autre) :
  - `VERIFIERS_SHA256` (l.18), `REPOSITORY`, `TOOL_ROOT` ;
  - les types `ListEntry`, `Revocation` et `Verifier` (l'élément rendu par `readVerifiers`, les deux formes ; nom attendu par la
    partie 3, §5.1 point 2) ;
  - `identityOf` (l.35), la règle de `policy-guard.ts` l.24 à l'octet près ;
  - `validDate` (l.38-42), même expression et même contrôle du calendrier que `scripts/spec-publish.mjs` l.46-50, sans import ;
  - `readVerifiers(bytes)`, lecteur fermé : deux formes d'entrée fermées (`{commit, identity, repository, tree, tree_sha256}` et
    `{commit, identity, revoked}`, ni clé de plus, ni clé absente, ni mélange) ; `identity` égale à `identityOf(identity)` et non vide ;
    `commit` 40 hex minuscules ; `repository` = `KraidleAI/monark-governance` ; `tree` = `tools/kata-recalc` ; `tree_sha256` 64 hex ;
    paire `(identity, commit)` unique parmi les entrées de liste, ordre d'ajout, sans tri ; une révocation nomme une entrée de liste
    **au-dessus** d'elle, une seule fois ; `revoked` passe `validDate` et ne commande rien. Chaque refus est nommé ;
  - `isListEntry`, `listEntries` : A-1 et la garde ne retiennent que les entrées de liste ;
  - `checkedVerifiers(bytes, pin)` : sha256 des octets égal à l'épingle, sinon refus fermé ;
  - `pinnedVerifiers()` (Q-P3-7) : **paresseuse et mémorisée**. Elle lit `../data/verifiers.json` depuis `import.meta.url` à son
    premier appel, jamais au chargement, vérifie `VERIFIERS_SHA256` et rend le même tableau ensuite. Une liste absente ou altérée lève
    à chaque appel (un échec n'est pas mémorisé). La porte, l'écrivain et la garde, qui l'appelleront en partie 3, s'arrêtent donc
    fermés sur une liste altérée ;
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
- **`.gitignore`** : `run-log.json`, à toute profondeur. Le journal de course de `report.py` (durées) ne peut pas être commité par
  mégarde, donc pas être versé dans un dossier daté depuis l'arbre de governance (G2 de #217 l.38 de RECHERCHES ; MONARK,
  `…-chantier-kata-partage.md` l.81). Le refus par la porte de tout `run-log.json` d'une release reste à 3a (`recompute_report_invalid`).
- **Amendements du chantier** (`docs/G0-lot-verifiers-list-f5a-1.md`, sur place, aucune ligne ajoutée ni retirée, pour ne pas décaler
  les citations de la partie 3) : l.263 (« clés exactes » vaut par forme) ; l.265 (la phrase « identités uniques et triées » sort,
  remplacée par la règle de Q-P3-1) ; l.298 (`node:fs` et `node:url` en plus de `node:crypto`, pour `pinnedVerifiers()` seule, rien de
  `scripts/`) ; l.471-472 (les refus du test du lecteur).

## 3. Tests rouges et tueurs

Tous dans `test/verifiers-list.test.ts`, sauf le dernier point. Rouges à la base : module neuf (le fichier de test ne charge pas).

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| `verifier_list_is_the_pinned_canonical_bytes` | sha256 du fichier = `VERIFIERS_SHA256` ; écriture canonique, sans LF final ; `pinnedVerifiers()` mémorisée, égale au lecteur | `apps/harness/src/policy-verifiers.ts:18 CONST "220e9025…" -> "0000…"` (64 caractères) |
| `verifier_list_reader_refuses_each_departure` | admis : ordre d'ajout, deux révisions d'une identité, révocation après son entrée ; refus nommés : clé de plus, clé absente, mélange, révocation à clé de liste, format, clé de tête, liste vide, non-JSON, majuscule, `a@b`, identité vide, majuscule dans une révocation, `commit` majuscule ou court, `tree_sha256` court, `tree` autre, `repository` autre, paire en double, révocation avant son entrée ou sans entrée, deux révocations, quatre dates fausses, date non chaîne | `apps/harness/src/policy-verifiers.ts:64 CONST "v.identity === identityOf(v.identity)" -> "true"` |
| `verifier_tool_tree_is_the_listed_tree` | `toolTreeSha256` de l'index sous `tools/kata-recalc/` = règle de `manifestText` = `tree_sha256` de l'entrée de l'outil ; un fichier de plus, un octet changé : écart ; modes `120000`, `160000`, `100755` et chemin voisin : refus nommés | `apps/harness/src/policy-verifiers.ts:108 CONST "p.slice(TOOL_ROOT.length + 1)" -> "p"` |
| `verifier_identity_rule_is_the_guard_rule_and_not_the_generator` | sur neuf noms (casse, « @ » multiples, chaîne vide, « @ » en tête, non-ASCII : É, ß, ǅ), `identityOf` donne l'identité attendue et égale `verifierIdentity` de `policy-guard.ts` ; l'outil listé n'est pas le générateur `kata/bench/write-p2.ts` | `apps/harness/src/policy-verifiers.ts:35 CONST "/[A-Z]/g" -> "/[A-Y]/g"` |
| `verifier_list_copy_passes_the_spec_gate` | `contentProblems("contract-1.1.0-tables-2026-10-20/verifiers.json", "json", …)` vide | `scripts/spec-publish.mjs:96 CONST "/^monark-governance$/i.test(v.word)" -> "false"` |
| `pinned_list_is_read_lazily_and_an_altered_list_stops_closed` | copie du module seule dans un dossier jetable, enfant Node : le chargement ne lit rien ; sans liste, deux appels lèvent `ENOENT` ; liste altérée, deux appels lèvent ; octets épinglés, deux appels rendent ; `checkedVerifiers` refuse une liste altérée ; `isPrefix` | `apps/harness/src/policy-verifiers.ts:85 CONST "sha256(bytes) !== pin" -> "false"` |
| `verifier_list_date_rule_is_the_spec_publish_rule` (test de la racine) | `validDate` du module = `validDate` de `scripts/spec-publish.mjs` sur chaque jour de 2023 à 2026, leurs voisins impossibles (jour 00, 29 à 32), et 18 valeurs (bissextiles 1900, 2000, 2024 ; mois 00 et 13 ; formes courtes ; espace ; LF ; chiffre pleine chasse ; non-chaînes) ; le module n'importe que `node:crypto`, `node:fs`, `node:url` | `apps/harness/src/policy-verifiers.ts:41 CONST "t.getUTCDate() === d" -> "true"` |
| `no_run_log_is_ever_published` | `git check-ignore --no-index` sur quatre chemins (racine, dossier du rapport, sortie de l'outil, dossier daté) ; aucun fichier suivi de ce nom, sans casse ; aucune entrée de release de `scripts/spec-publish-inputs.json` ne le lit ni ne l'écrit ; `report.py` l'écrit sous ce nom, à côté du rapport | `.gitignore:36 SDL "run-log.json" -> ""` |
| `verifier_list_commit_carries_the_listed_tree` | chaque entrée de liste nomme un commit de l'historique (pas le témoin) dont l'arbre sous `tools/kata-recalc/` a le `tree_sha256` listé (recette du §3.2) | `apps/harness/src/policy-verifiers.ts:110 CONST "(a.path < b.path ? -1 : 1)" -> "(a.path < b.path ? 1 : -1)"` |
| `kata_recalc_tree_is_the_pinned_manifest` (`test/kata-recalc.test.ts`, corps changé) | l'épingle est lue dans la liste | inchangé : `tools/kata-recalc/kata_lib.py:265 CONST "(_EWMA_W[nret - j] * r) * r" -> "_EWMA_W[nret - j] * (r * r)"` |

- **Écart déclaré** : le chantier (§5) voulait les refus de la règle d'arbre « sur un dépôt jetable ». Ils sont jugés sur l'entrée de
  `toolTreeSha256` (les blobs avec leur mode) ; la lecture git, de l'index comme d'un commit, est exercée par deux tests sur le dépôt.
- **Témoin et red-proof** : au témoin, `verifier_list_commit_carries_the_listed_tree` est rouge au gel. La preuve se joue donc sur un
  gel local, non poussé, qui remplace le témoin par `177b5755` (fusion de #217 : son arbre est `e9e11ccb…`), et réécrit l'épingle
  et le tueur de la l.18 en conséquence (§4).

## 4. Preuves

- (à remplir au gel)

## 5. Taille

- R-25, forme de la CI (`git diff --shortstat` contre la base, `docs/**/*.md` exclus) : 5 fichiers, 317 insertions, 5 suppressions,
  soit **322** (borne de lot 547).
