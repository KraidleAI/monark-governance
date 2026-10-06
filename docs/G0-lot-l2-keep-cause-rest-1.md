# G0 du lot L2-KEEP-CAUSE-REST-1 : le témoin `keepCause` dans les quatre derniers fichiers L2, leur travail de chargement dans un crochet

- **Demande** : item L2-KEEP-CAUSE-REST-1, proposé au G7 de L2-BOOK-KEEP-CAUSE-1 (#174, section « Items ») et confirmé exact par son G2 (section 1, « Item L2-KEEP-CAUSE-REST-1 du G7 : exact »).
- **Base** : `ec0e023d` (`origin/base/chantier-moteur-2026-10-03`), branche `recherches/l2-keep-cause-rest-1`. Auteur : RECHERCHES. Fusion prévue après T0.
- **Zone** : `test/l2-rest.test.ts`, `test/l2-rest-tls.test.ts`, `test/l2-fake-place.test.ts`, `test/l2-segments.test.ts` (en-tête seulement), `test/keep-cause.test.ts` (`runBook` devient `runFile` et prend un fichier, quatre tests ajoutés en fin) ; ce G0, le G7 et le G2 (`docs/G2-lot-l2-keep-cause-rest-1.md`). Aucun code de production, aucun changement de `test/helpers/keep-cause.ts`.

red-proof: test-only

## Règle

1. Les 12 fichiers `test/l2-*.test.ts` appellent `keepCause("test/<nom>.test.ts")` au chargement. À la base, 8 l ont (`book`, `canon`, `continuity`, `day`, `derive`, `links`, `loop`, `record`) ; ce lot l ajoute aux 4 autres.
2. Le travail de chargement de ces 4 fichiers passe dans un `before()` racine, comme dans `l2-book` et `l2-links` : s il lève, chaque test est rouge et nommé, avec la cause, sur stdout, puis vient la ligne `# keep-cause … exit code 1 during between tests, tests begun 0, ended N`.

| Fichier | Tests | À la base (chargement) | Au gel |
|---|---|---|---|
| `test/l2-rest.test.ts` | 13 | `trap()`, ligne 15 | ligne 14 : import du témoin ; ligne 15 : `keepCause(…); before(() => { trap(); });` |
| `test/l2-rest-tls.test.ts` | 3 | `REAL` ligne 20, `trap()` ligne 21 | ligne 19 : import ; ligne 20 : `keepCause(…)` ; ligne 21 : `REAL`, lu **avant** l enregistrement du crochet ; ligne 22 : `before(() => { trap(); })` en fin de la ligne de `outs` |
| `test/l2-fake-place.test.ts` | 8 | `trap()`, ligne 10 | ligne 9 : import ; ligne 10 : `keepCause(…); before(() => { trap(); });` |
| `test/l2-segments.test.ts` | 6 | `mkdtempSync` du `ROOT` ligne 17, `rmSync(…, maxRetries: 3)` ligne 18 | ligne 14 : import ; ligne 16 : `keepCause(…)` ; ligne 17 : `let ROOT = ""; before(() => { ROOT = mkdtempSync(…); });` ; ligne 18 : `after` gardé par `ROOT !== ""`, `maxRetries: 5, retryDelay: 100` comme les autres fichiers L2 |

3. **Un `before()` racine (au niveau du module, pas dans un `describe`) enregistré au chargement s exécute aussitôt** sous Node 24.21.0 (`Test.prototype.createHook` : `name === 'before' && this.startTime !== null`, « run the hook immediately » ; mesuré, G7). Un crochet asynchrone ne s exécute ainsi que jusqu à son premier `await` ; la suite vient au microtâche suivant. il ne retarde pas le travail, il le fait passer par la machinerie des crochets, qui rend une erreur en rouges nommés. Tout ce qui doit être lu avant le piège (le `REAL` de `l2-rest-tls`) est donc lu **avant** l appel de `before`.
4. **Aucune ligne déplacée après l en-tête** : chaque fichier garde son nombre de lignes (348, 140, 130, 207). Les lignes `// killer:` de ces fichiers gardent leur numéro ; leurs cibles (`scripts/l2/rest.mjs`, `scripts/l2/segments.mjs`, `test/l2-fake-place.ts`) ne changent pas. Les tests de ces fichiers sont inchangés.
5. **Tests d abord** : quatre tests de `test/keep-cause.test.ts` lancent chaque fichier comme le lanceur lance son enfant (`NODE_TEST_CONTEXT=child-v8`), une faute préchargée par `--import`, **stderr jeté**. La faute fait lever `trap()` (l affectation de `globalThis.fetch` lève `INJECTED at trap`) ou le `mkdtempSync` d un `l2-segments-` (`INJECTED at mkdtemp`). Ils sont rouges par assertion avant le changement des 4 fichiers : `[1, [], false]`, sortie 1, aucune ligne, la cause absente de stdout.

## Tueurs (listés pour `--test-only`)

Chaque tueur vise le support `test/helpers/keep-cause.ts`, importé par `test/keep-cause.test.ts` :

- `test/helpers/keep-cause.ts:31 CONST "ended = 0" -> "ended = 1"` (`keep_cause_l2_rest_a_throw_of_trap_is_named_on_stdout`)
- `test/helpers/keep-cause.ts:38 CONST "ended ${String(ended)}" -> "ended ${String(begun)}"` (`keep_cause_l2_rest_tls_a_throw_of_trap_is_named_on_stdout`)
- `test/helpers/keep-cause.ts:33 CONST "step = \"between tests\"" -> "void 0"` (`keep_cause_l2_fake_place_a_throw_of_trap_is_named_on_stdout`)
- `test/helpers/keep-cause.ts:38 CONST "${file}: exit code" -> "exit code"` (`keep_cause_l2_segments_a_throw_of_its_root_is_named_on_stdout`)

Les deux tests `l2_book` de L2-BOOK-KEEP-CAUSE-1 sont jugés aussi, puisque leur appel `runBook` devient `runFile` (repli de la G2, M-3) ; leurs tueurs, inchangés depuis #174 :

- `test/helpers/keep-cause.ts:33 CONST "ended += 1" -> "ended += 2"` (`keep_cause_l2_book_a_throw_of_trap_is_named_on_stdout`)
- `test/helpers/keep-cause.ts:32 CONST "step = " -> "void "` (`keep_cause_l2_book_an_exit_in_a_test_is_named_on_stdout`)

**Ce que prouvent ces tueurs (G2, N-1)** : ils visent le support commun `keep-cause.ts`, et chacun rougit les quatre nouveaux tests, plus deux à quatre anciens. Ils prouvent le support, pas le câblage de chaque fichier. Le câblage est prouvé par les contrôles manuels du G7 (11 sur 11) : `keepCause(…)` retiré (4 fichiers), le travail remis au chargement (4 fichiers), `before(() => {})` sans piège (`l2-rest`, `l2-rest-tls`, `l2-fake-place`). Un tueur par fichier exigerait un tueur dans un `*.test.ts`, que la convention de `scripts/red-proof.mjs` interdit.

Le mode `f2p` ne peut pas juger ces tests : `scripts/red-proof.mjs` copie les fichiers de test du gel dans la base. Le lot ne change que des tests, d où `--test-only`.

## Hors champ

- **Une erreur levée pendant l évaluation d un import statique** (par exemple `./l2-fake-place.ts`, `../scripts/l2/rest.mjs`, `../scripts/l2/segments.mjs`, `./helpers/loopback.ts`) précède `keepCause` et reste sur stderr seul (rappel du G2 de L2-BOOK-KEEP-CAUSE-1, N-3). Ce cas, un kill et un plantage natif relèvent d **ORACLE-CHILD-EXIT-TRACE-1** : hors de ce lot.
- Aucun changement de la porte, du lanceur ou de `keep-cause.ts`.

## Windows

- Les chemins sont faits par `fileURLToPath(new URL(…))`, `join` et `pathToFileURL` ; aucun nom réservé ; aucun saut win32 (aucun n est justifié).
