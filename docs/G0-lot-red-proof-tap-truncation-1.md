# G0 du lot d'outil RED-PROOF-TAP-TRUNCATION-1 : un TAP tronqué de `scripts/red-proof.mjs` ne se lit jamais comme un verdict

- **Rattachement** : item RED-PROOF-TAP-TRUNCATION-1 (colonne RECHERCHES, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-bascule-de-charge.md`
  §3, point 3 ; zone MONARK ouverte : `scripts/red-proof.mjs`, `scripts/red-proof.d.mts`, `test/red-proof.test.ts`). Constat d'une G2 :
  un fichier de test de détecteur rend `1..26` au lieu de `1..33` une fois sur 10 à la base, `1..35` seulement 5 fois sur 8 au gel,
  exit 0 ; le rapporteur `spec` ne l'a pas montré. Effet : faux refus (`missing`, `other-fail`), jamais un faux succès.
- **Base** : `6dd2ecb7` (tête de la PR #113, `recherches/red-proof-junction-1`, gel `4cf8134`, sous contrôle de MONARK ; le lot s'y
  empile). Branche `recherches/red-proof-tap-truncation-1`. Auteur : RECHERCHES. Hôte : Linux, Node v22.22.2. Aucun réseau.

## Cause, mesurée

`runFile` lance `node --test --test-reporter=tap --test-force-exit <fichier>` sous `spawnSync`. Deux sauts de tuyau :

1. **Enfant → lanceur** (le saut du constat). Le lanceur `--test` lance un processus enfant par fichier (isolation `process`) et lui
   passe `--test-force-exit` (`internal/test_runner/runner.js`, `getRunArgs`). L'enfant écrit ses événements (v8-serializer) dans son
   stdout, un tuyau. Sous POSIX, libuv ouvre ce tuyau en non bloquant : une écriture que le tuyau (64 Kio) ne prend pas tout de suite
   reste en file dans le processus (mesuré : `write` d'1 Mio puis `process.exit()` vers un lecteur lent : 65 536 octets reçus). Avec
   `--test-force-exit`, l'enfant appelle `process.exit()` dès que le rapporteur se détache de stdout (`internal/test_runner/test.js`,
   branche `forceExit` : attend `unpipe`, puis `close` qui n'existe pas sur un socket) ; ce qui est encore en file est perdu. Le lanceur
   ne voit que les événements arrivés, compte un plan cohérent (`1..28` pour 33 tests, autant de lignes `ok`), sort 0. Le plan de
   l'enfant est écarté par le lanceur (`#skipReporting`), son résumé aussi (`#checkNestedComment`) : **le TAP final est cohérent en
   lui-même** ; un contrôle « plan = nombre d'entrées » seul ne voit pas ce saut.
   - Reproduction à fort taux : un module chargé dans le lanceur seul (`--import`, gardé par `NODE_TEST_CONTEXT`) bloque sa boucle par
     tranches de 400 ms pendant 3 s ; fichier de 33 tests dont 11 rouges (diagnostics de 5 Ko) : **5 tronqués sur 6** (`1..28`,
     `1..30`), exit 1 dû aux rouges, jamais 33 ; sans `--test-force-exit` ou avec le correctif ci-dessous : 33 sur 6/6.
   - Reproduction déterministe (le premier test fixe de ce lot) : une écriture d'1 Mio sur `process.stdout` dans l'enfant laisse
     `process.stdout.writableLength > 0` au retour ; c'est exactement l'état que `process.exit()` perd.
2. **Lanceur → `spawnSync`**. Le lanceur ne force pas sa sortie (il finit sa boucle), mais sous charge (8 boucles parallèles sur 4
   cœurs, fichier de 40 tests à 200 Ko de diagnostics) la **queue** du TAP manque 2 fois sur 200 : 40 entrées, ni `1..40` ni résumé,
   exit 1. Mécanisme exact non établi ; un TAP sans sa ligne de plan ni son résumé est en tout cas incomplet.

Le rapporteur `spec` n'est pas en cause par nature (même saut 1) ; sa « non-troncature » est un échantillon, non une preuve.

## Contenu

`scripts/red-proof.mjs`, `scripts/red-proof.d.mts`, `test/red-proof.test.ts`, ce G0 et le G7.

1. **Correctif** (saut 1) : `runFile` ajoute `--import=data:text/javascript,…` ; ce module, hérité par l'enfant (les `execArgv` du
   lanceur lui sont passés, hors drapeaux de test), rend stdout **bloquant** (`process.stdout._handle.setBlocking(true)`, ce que Node
   fait déjà pour stdout sous Windows) : toute écriture est faite au retour, `process.exit()` n'a plus rien à perdre.
2. **Garde** (deux sauts) : le même module écrit, à la sortie de l'enfant seul, une dernière ligne `red-proof child exit <code>` sur
   stdout, qui arrive dans le TAP en commentaire. `truncation(tap)` (exporté) rend un motif ou `null` : TAP non clos par
   `# duration_ms`, ligne de plan absente ou différente du nombre d'entrées de premier niveau, ligne de sortie de l'enfant absente (tout
   suffixe perdu l'emporte, la ligne étant la dernière écriture). Un passage dont le TAP est tronqué rend le statut nommé
   **`inconclusive_truncated`** (base, gel ou tueur tiré), sauf s'il est déjà `inconclusive` ; verdict `inconclusive`, motif nommé ; un
   tueur tiré sur un TAP tronqué est `inconclusive`, jamais tué. Si le module n'était pas chargé (Node futur), tout passage serait
   `inconclusive_truncated` : la garde échoue fermée.
3. TAP lu sur stdout comme avant (la destination fichier ne change pas le saut 1, la garde couvre le saut 2).

## Tests (rouges à la base par assertion), tueurs

- `red_proof_child_stdout_writes_are_synchronous_so_a_forced_exit_drops_nothing` : fichier fixe qui écrit 1 Mio sur stdout et
  affirme `writableLength === 0` ; attendu base `pass`, gel `pass`. Tueur : `setBlocking?.(true)` → `setBlocking?.(false)`.
- `red_proof_names_a_cut_child_stream_inconclusive_truncated_never_a_misread` : fichier fixe dont un test coupe stdout
  (`process.stdout.write = () => true`, la perte d'un suffixe) ; le TAP du lanceur garde un plan cohérent (`1..1`, une entrée) ;
  attendu : les deux lignes `inconclusive_truncated` des deux côtés, verdict `inconclusive`, preuve refusée. Tueur : le contrôle de la
  ligne de sortie de l'enfant retiré.
- `red_proof_names_a_tap_without_its_plan_or_summary_truncated` : `truncation` sur des TAP synthétiques (complet ; sans plan ; plan
  court ; sans résumé). Tueur : le contrôle du plan retiré.

## Taille

Attendu : script ≈ 10 lignes, types 2, tests ≈ 30 ; docs hors compte. Bien sous 547. Les adresses `// killer:` existantes qui glissent
sont réécrites et revérifiées par un petit contrôleur (ligne citée, `<before>` exactement une fois).

## Questions pour MONARK (aussi au G7)

- **Q-RPT-1** : sous Windows, Node rend déjà stdout bloquant pour un tuyau : le saut 1 n'y existe sans doute pas. Le constat de la G2
  vient-il de Linux ? Le correctif reste neutre sous Windows ; la garde y vaut aussi.
