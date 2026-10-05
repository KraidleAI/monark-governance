# G0 du lot L2-BOOK-KEEP-CAUSE-1 : le témoin `keepCause` dans `test/l2-book.test.ts`, `trap()` dans un crochet

- **Demande** : `2026-10-05-MONARK-vers-RECHERCHES-l2book-trace.md` (section 2, « Lot d instrumentation : oui »), en réponse à `2026-10-05-RECHERCHES-vers-MONARK-l2book-cause-non-prouvee.md` (section 5).
- **Base** : `753a23a9` (`origin/base/chantier-moteur-2026-10-03`), branche `recherches/l2-book-keep-cause-1`. Auteur : RECHERCHES.
- **Zone** : `test/l2-book.test.ts` (lignes 7 et 17 à 19), `test/keep-cause.test.ts` (ligne 12, deux tests ajoutés en fin) ; ce G0 et le G7. Aucun code de production, aucun changement de `test/helpers/keep-cause.ts`.

red-proof: test-only

## Règle

1. `test/l2-book.test.ts` appelle `keepCause("test/l2-book.test.ts")` au chargement, comme `test/l2-links.test.ts` depuis L2-LINKS-FILE-CRASH-1.
2. `trap()` passe du chargement dans `before()` : s il lève, les 6 tests sont rouges et nommés, avec la cause, sur stdout.
3. **Aucune ligne déplacée** : l import de `before` va sur la ligne 7, celui du témoin sur la ligne vide 17, l appel sur la ligne 18, et `before` rejoint la ligne 19. Les lignes `// killer:` de `l2-book` gardent leur numéro ; leurs cibles dans `scripts/l2/book.mjs` ne changent pas.
4. **Tests d abord** : deux tests de `test/keep-cause.test.ts` lancent `test/l2-book.test.ts` comme le lanceur lance son enfant (`NODE_TEST_CONTEXT=child-v8`), une faute préchargée par `--import`, **stderr jeté**. Ils sont rouges par assertion avant le changement de `l2-book`.

## Tueurs (listés pour `--test-only`)

Chaque tueur vise le support `test/helpers/keep-cause.ts`, importé par `test/keep-cause.test.ts` :

- `test/helpers/keep-cause.ts:33 CONST "ended += 1" -> "ended += 2"` (`keep_cause_l2_book_a_throw_of_trap_is_named_on_stdout`)
- `test/helpers/keep-cause.ts:32 CONST "step = " -> "void "` (`keep_cause_l2_book_an_exit_in_a_test_is_named_on_stdout`)

Le mode `f2p` ne peut pas juger ces tests : `scripts/red-proof.mjs` copie le `test/l2-book.test.ts` du gel dans la base. Le lot ne change que des tests, d où `--test-only`.
