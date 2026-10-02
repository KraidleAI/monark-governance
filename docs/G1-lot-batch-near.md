# claude-opus-5-5

# G1 : journal du lot BATCH-NEAR (DOJO-HISTORY-BATCH-NEAR-1 : la proximité de `readBody` testée à toute profondeur de l `info`)

- Mission : `F:/tmp/dojo/mission-batch.md` sha256 `8807c9f146826c22f6057ff8ee3fb98e4ca7c358fac31b922a0d1e5107c1e15b` (recalculé à 00:28Z, égal).
- Modèle résolu : `claude-opus-5-5`, effort `max` (R-1). Rôle G1, instance fraîche. Début 2026-10-02T00:28:19Z (`date -u`).
- Worktree `F:/Monark-wt-batch`, branche `lot/batch-near`, HEAD = base `dfd9f87349529bfd0595ecaf340379eb0f598905` (`git rev-parse HEAD`) ;
  statut vide à 00:28Z puis à 00:44:06Z (`git --no-optional-locks status --porcelain`). Mon PREMIER `git status` (00:28Z) a tourné sans
  `--no-optional-locks` : écart consigné en Q-1.
- Règles : `F:/Monark/docs/methode/REGLES-MISSION.md` `6470002592fe9c18…` (égal à la mission). Outils du tronc relus, sha256 égaux à la
  mission : `lint.mjs` `4d1383c8…`, `launch.mjs` `fb6c277f…`, `oracle/run.mjs` `f22b9045…`, `oracle/r25.mjs` `4d0544df…`, `red-proof.mjs`
  `6579b550…`. `F:/Monark-wt-page-v1` jamais lu ni touché ; `scan-ins2.mjs` lu, jamais lancé (il lit le mint de ce worktree-là).

## 1. Lecture (avant tout code)

Entrées lues en entier, dans l ordre de la mission ; sha256 à la base, relevés à 00:44:06Z :
- `apps/dojo/src/history-read.ts` `91eda47100e49677…` (282 l., égal au gel approuvé de HISTORY-INS-2) : proximité l.111 (`near` = le mint et
  les comptes de ses entrées `pre/postTokenBalances`), `visit` l.113-118 : une instruction analysée n entre dans `ins` que si une valeur
  DIRECTE de son `info` est proche (l.116) ; instruction non analysée l.117 (`accounts`, inchangée) ; offre l.120-123 (`info.mint === mint`) ;
  clé l.128-132 (types de `ins`) ; (vi) l.204-207 ; repli de propriétaire l.257 (`info.account === acc`) ; (iv) l.190 (`info.mint === mint`).
- `apps/dojo/test/dojo-history-ins2.test.ts` `71fabec5…` et `apps/dojo/test/dojo-history-ins.test.ts` `322888fa…` : modèles (aides `withIx`,
  `slipped`, `stopsWith`, typage sans violation du cliquet) ; tueurs l.74 et l.63 (`history-read.ts:31`), l.101 et l.86 (`:206`).
- `docs/G1-lot-history-ins-2.md` `838f4faa…` : Q-4 et son §12 bis (mécanisme, sonde `batch-blind`, construction candidate).
- Fin de `docs/adr/ADR-DOJO-PR-2B.md` `6487c54d…` (1 043 l.) : lignes datées HISTORY-INS l.1005-1022, HISTORY-INS-2 l.1023-1034, G2 ciblée de
  HISTORY-INS-2 l.1035-1043 (item DOJO-HISTORY-BATCH-NEAR-1, « avant la course finale (`--first-read`) ») ; 2b4/Q-G2-4 l.1001.
- `F:/tmp/dojo/hins2/` : `batch-blind.mjs` `dbaadeec…`, `batch-blind.out` `814d895e…` (un `batch` qui enveloppe un `burn` de BMAH ou
  `freezeAccount` : `batch` absent de `ins`, (vi) passe ; seul (i) arrête un solde glissé) ; `probe-ins2.mjs`, `probe-b.out`, `probe-c.out`.
- `F:/tmp/dojo/scan-ins2.mjs` `68c99f30…` : même règle directe (l.20).
- `F:/Monark/scripts/red-proof.mjs` `6579b550…` : `KILLER` l.33, `parseKiller` l.46-49, convention l.18-24 ; un test neuf est jugé en entier ;
  admis seulement rouge à la base par `ERR_ASSERTION` et vert au gel (vert à la base = « self-confirming », refusé).
- Tueurs qui visent `history-read.ts` (recherche dans le worktree) : `dojo-history-collect.test.ts` l.150 (`:206`), `dojo-history-ins.test.ts`
  l.63 (`:31`) et l.86 (`:206`), `dojo-history-ins2.test.ts` l.74 (`:31`) et l.101 (`:206`). Toute ligne nette ajoutée au-dessus de la l.206
  les rendrait faux.
- Forme `batch` [lu] dans `F:/tmp/dojo/hins/parse_token.rs` (`50370cf4…`) : l.737-742 (aiguillage), l.769-809 (`info = {"instructions":
  [...]}`, chaque élément `serde_json::to_value` d un `ParsedInstructionEnum`) ; test l.2249-2283 : `inner[0]["type"] == "transferChecked"`,
  `inner[1]["type"] == "burn"`. La clé `info` des éléments est INFÉRÉE (même struct que l objet `parsed` de tout corps réel ; la struct
  vit dans `parse_instruction.rs`, absent de la copie). Un `batch` imbriqué n est pas analysable (l.793-796).
- Mint : `F:/Monark-wt-batch/out/mint.txt` sha256 `9b4e275adfbb7054…decb` (égal à l épingle de D-1, ADR l.965), égal au mint de
  `apps/dojo/test/fixtures/history/sources.json` (`db73caf1…`). C1 (`c1.a.json` `f69331bb…`) : six instructions externes, aucune
  Token-2022 ; un groupe interne (index 5) avec une seule instruction Token-2022, `transferChecked` de MeQM vers BMAH, proche
  (`probe/c1-peek.mjs`).

## 2. Compte (mesuré avant code, lecture seule, aucun réseau)

- Sonde `F:/tmp/dojo/batch/probe/count-deep.mjs` (sha256 `e3ad670e1fe7d19a7401800f56234a760db3fefe46b415e8fc67ef75cae8eebd`) : copie
  indépendante de la règle de `readBody` (base, l.96-118 : `near`, clés statiques puis `meta.loadedAddresses` sauf source `lookupTable`) ;
  pour chaque instruction Token-2022 analysée, règle DIRECTE (une valeur de `info`) et règle PROFONDE (une valeur à toute profondeur,
  tableaux et objets) ; chaque fichier brut de `evidence/raw/` (gzip JSON) des deux courses. Contrôle non vide en tête : un `info` de `batch`
  proche à la profondeur quatre seulement donne directe `false`, profonde `true`, et son jumeau lointain `false`.
- Sortie `count-deep.out` sha256 `909753868b680483600fb5886c229827dec8967a3f66da0357225576fa675e97` (00:37:02Z-00:37:35Z, sortie 0,
  `count-deep.err` vide), identique au passage de 00:36:22Z :

| course | fichiers | transactions | instructions Token-2022 | non analysées | directes | profondes | profondes seules | `batch` |
|---|---|---|---|---|---|---|---|---|
| `provisional-2026-10-01-r2` | 28 058 | 47 983 | 85 757 | 0 | 57 607 | 57 607 | **0** | 0 |
| `provisional-2026-10-01-r3` | 28 085 | 48 066 | 86 015 | 0 | 57 740 | 57 740 | **0** | 0 |

  Détail par répertoire dans la sortie (phase A : 26 pages par opérateur, aucune transaction ; phases B et C : mêmes nombres d instructions
  directes et profondes chez les deux opérateurs en C). Profondeur maximale d un `info` observé : 2.
- **Aucune instruction des bruts r2 et r3 ne devient proche par la règle profonde sans l être par la règle directe** (décision, point 3).
- Recensement des conteneurs imbriqués (`probe/nested-keys.mjs` `03a8133d…`, sortie `nested-keys.out` `4cad0190…`, 00:38:01Z-00:38:29Z) :
  `transferChecked.tokenAmount` (objet, 33 505 en r2 / 33 609 en r3), `getAccountDataSize.extensionTypes` (tableau, 7 609 / 7 629),
  `harvestWithheldTokensToMint.sourceAccounts` (tableau, 196 / 196), `closeAccount.signers` (80 / 80), `transferChecked.signers` (52 / 52),
  `burnChecked.tokenAmount` (14 / 14), `transferCheckedWithFee.tokenAmount` et `.feeAmount` (2 / 2). Valeurs imbriquées qui portent le mint
  ou un compte du mint : **0** dans les deux courses.

## 3. Vérification au code (décisions de l orchestrateur)

- **Seule la rétention change** : `nearIn` n agit que sur la condition de la l.116 ; la l.117 (non analysée, `accounts`) est inchangée.
- **Offre** : une instruction n entre dans `supply` que si son type est dans `SUPPLY_TYPES` ET `info.mint === mint` (l.120) : une valeur
  DIRECTE proche. Une instruction retenue par la seule règle profonde n a aucune valeur directe proche : elle n entre jamais dans l offre.
  Les éléments internes d un `batch` ne sont pas des instructions de `ins` : leurs frappes et brûlages n entrent pas dans l offre.
- **Soldes** : lus dans `pre/postTokenBalances` seulement (l.101-109) ; inchangés.
- **Repli de propriétaire** (l.257 ; `history-build.ts` l.72) et **(iv)** (l.190) exigent `info.account === acc` ou `info.mint === mint` :
  valeur directe, donc même élément trouvé (le premier qui convient était déjà retenu par la règle directe).
- **Clé** (l.129) : les types triés de `ins` ; une instruction profonde seule y ajouterait son type. Sur les bruts r2 et r3 : 0 cas (§2) ;
  mesure directe après code au §7 (`readBody` et `readKey` de la base contre ceux du gel sur les mêmes bruts).
- **`batch`** : proche à toute profondeur, il est retenu UNE fois, sous le type `batch`, absent de la liste fermée : (vi) arrête
  `instruction_not_allowed` en le nommant (fermé par défaut ; aucun type ajouté). Un `batch` dont aucune valeur n est proche reste ignoré.

## 4. Plan (avant code)

1. `apps/dojo/src/history-read.ts`, sans ligne nette ajoutée (les cinq tueurs existants restent valides, l.31 et l.206 inchangées) :
   - l.112 : `const ins: Ins[] = [], nearIn = (v: unknown): boolean => near.has(v) || (list(v) ?? Object.values(obj(v) ?? {})).some(nearIn);`
   - l.116 : `Object.values(info).some((v) => near.has(v))` devient `Object.values(info).some(nearIn)` ;
   - l.84-85 (doc de `Body`) réécrites dans leurs deux lignes : « at any depth of their info ». Rien d autre.
2. Test neuf `apps/dojo/test/dojo-history-batch-near.test.ts`, trois tests, variantes SYNTHÉTIQUES de C1, attentes recodées, chacun rouge à
   la base par assertion :
   - (A) `dojo_history_batch_near_the_mint_stops_instruction_not_allowed` : des `batch` qui enveloppent une instruction proche (par le mint,
     par BMAH, à profondeur deux à l intérieur ; types admis, refusé, frappe), en instruction interne puis externe : lus une fois sous
     `batch`, (vi) arrête en nommant `batch`, offre et entrées du mint égales à celles de C1 ; les trois cas de `batch-blind` rejoués (un
     solde glissé arrête (i) ET (vi)). Tueur : tableaux non parcourus, `history-read.ts:112 CONST "list(v)" -> "null"`.
   - (B) `dojo_history_instruction_near_at_depth_two_is_kept_with_its_type` : proche seulement dans un objet imbriqué (profondeur deux), dans
     un tableau (profondeur deux), puis à trois et quatre : retenue une fois avec son type et son `info` ; offre inchangée ; (vi) passe pour un
     type admis, arrête en le nommant pour un type refusé. Tueur : objets imbriqués non parcourus,
     `history-read.ts:112 CONST "Object.values(obj(v) ?? {})" -> "[]"`.
   - (C) `dojo_history_instruction_with_no_near_value_stays_ignored` : JUMEAUX (même forme, une fois proche : retenue ; une fois sans valeur
     proche : ignorée, et (vi) passe même pour un type refusé) : `batch` lointain ; mint et BMAH en CLÉS seulement ; dans une chaîne plus
     longue ; à côté de l `info` (dans `parsed`, dans l instruction) ; feuilles non chaînes ; programme autre que Token-2022. Tueur : tout
     est proche, `history-read.ts:112 CONST "near.has(v)" -> "true"`.
3. Portes : clone `--no-local` de `F:/Monark` à `dfd9f873` sous `F:/tmp/dojo/batch/clone`, fichiers du lot copiés, `node_modules` par
   `mk-nm.ps1` ; tests de l historique ; `tsc`, `eslint`, `lint:ratchet` (69/69 sans marge : 0 violation ajoutée) ; `red-proof` `--draw 3
   --seed 2026` ; campagne de mutants supplémentaires par l outil du tronc (une seule, sur le clone) ; mesure base contre gel sur les bruts ;
   oracle du tronc `--role G1`, verrou libre seulement, `GIT_OPTIONAL_LOCKS=0` ; `rm-nm.ps1` à la fin.

Compte R-25 attendu : `history-read.ts` +4 / -4 (l.84, l.85, l.112, l.116), test neuf ≈ 120 à 150 lignes : ≈ 130 à 160 (ce journal exclu,
ci.yml l.82). Borne 1 150.

## 5. Code (fait après le §4)

- Le journal au stade du plan (§1-§4) est gardé tel qu écrit à 00:47:28Z : `F:/tmp/dojo/batch/journal-plan-0047.md` sha256
  `c6269c5e23c425831e225004fa86f21cffbcb0c540cc9f5c4cfba1bb446070df` ; base du module gardée en `F:/tmp/dojo/batch/history-read.base.ts`
  (`git --no-optional-locks show dfd9f873:…`, `91eda471…`).
- `apps/dojo/src/history-read.ts` (sha256 au gel `e038d7bf134f2021ac5847a8a0c58398734c3fcbd9c2fc7bbd118a11118d44ab`, 282 l. comme à la
  base) : `git diff --stat` **4 insertions, 4 suppressions** :
  - l.84-85 (137 et 151 caractères) : doc de `Body` réécrite dans ses deux lignes, « that name the mint or one of its accounts of this body
    at any depth of their info » ;
  - l.112 (128 caractères) : `const ins: Ins[] = [], nearIn = (v: unknown): boolean => near.has(v) || (list(v) ?? Object.values(obj(v) ??
    {})).some(nearIn);` (récursion sur les tableaux et les objets, feuilles comparées par `near.has`, les clés jamais lues) ;
  - l.116 (142 caractères) : `Object.values(info).some(nearIn)` au lieu de `Object.values(info).some((v) => near.has(v))`.
- Aucune ligne nette ajoutée : l.31 et l.206 inchangées ; les ancres des cinq tueurs existants (`withdrawExcessLamports`, `initializeAccount2`
  en l.31 ; `.includes(i.type)`, `for (const i of tx.ins)`, `string[])` en l.206) et des trois tueurs neufs (`list(v)`,
  `Object.values(obj(v) ?? {})`, `near.has(v)` en l.112) figurent chacune exactement une fois sur leur ligne (`grep -o -F`, 00:48Z).
- Garde d octets (`F:/tmp/dojo/batch/guard.mjs` `28db035f…`, copie de celle de HISTORY-INS-2) : 0 octet interdit ; les 14 lignes de plus de
  160 caractères qu elle signale dans ce fichier (l.49, 71, 81, 93, 99, 107, 139, 141, 179, 190, 209, 210, 214, 273) sont antérieures au lot
  et hors diff (mêmes 14 numéros qu au journal de HISTORY-INS-2, §5).

## 6. Tests (faits) et tueurs

- `apps/dojo/test/dojo-history-batch-near.test.ts` (neuf, 160 l., sha256 `41a51032c96435fdce53a4c0b6753ae7b9d916ded1f443dd06f0c77c36edc4c2`),
  variantes SYNTHÉTIQUES de C1 déclarées, attentes recodées (`C1_TYPES = ["transferChecked"]`, lu l.192 du test de lecture) :
  - l.69 (A) `dojo_history_batch_near_the_mint_stops_instruction_not_allowed` : six instructions enveloppées (l.59-66 : `burn` par BMAH et
    le mint, `transferChecked`, `freezeAccount`, `mintTo` du mint, `burn` par BMAH seul, `approve` proche par un signataire multisig
    seulement), chacune dans un `batch` interne puis externe : une seule entrée `{type: "batch", info}` (jamais dépaquetée), (vi) arrête en
    nommant `batch`, offre et entrées du mint égales à celles de C1, (i) tient ; les six dans un `batch` après un `approve` proche : l arrêt
    nomme `batch` ; les trois cas de `batch-blind` (plus une frappe cachée, +5) : (i) arrête `supply_mismatch` ET (vi) arrête
    `instruction_not_allowed` sur `batch`. Tueur l.68 : `history-read.ts:112 CONST "list(v)" -> "null"` (tableaux non parcourus).
  - l.110 (B) `dojo_history_instruction_near_at_depth_two_is_kept_with_its_type` : cinq instructions proches seulement sous leur premier
    niveau (l.101-107) : dans un objet (profondeur deux, type admis puis `freezeAccount`), dans un tableau de signataires (deux), à trois et
    quatre ; chacune retenue une fois avec son type et son `info`, offre et entrées inchangées (le `burn` nomme un autre mint au premier
    niveau : aucune offre), (i) tient, (vi) passe pour un type admis et arrête en nommant `freezeAccount`. Tueur l.109 :
    `history-read.ts:112 CONST "Object.values(obj(v) ?? {})" -> "[]"` (objets imbriqués non parcourus).
  - l.149 (C) `dojo_history_instruction_with_no_near_value_stays_ignored` : huit JUMEAUX (l.133-146), chacun d abord proche (retenu : non
    vide, rouge à la base) puis sans valeur proche (ignoré, (vi) passe même pour `freezeAccount` ou `batch`) : profondeur cinq parmi des
    feuilles `null`, `[]`, `{}`, `0`, `false` ; le mint à profondeur cinq ; un `batch` lointain ; le mint et BMAH en CLÉS ; des chaînes plus
    longues ou partielles ; une valeur à côté de l `info` (dans `parsed`, dans `accounts`) ; aucune feuille chaîne ; un `batch` du programme
    classique. Les huit ignorés ensemble, internes puis externes : seule l instruction de C1. Tueur l.148 :
    `history-read.ts:112 CONST "near.has(v)" -> "true"` (tout est proche).
- Contrôle précoce hors dépôt (mini-arbre `F:/tmp/dojo/batch/probe/tree/`, module de base en place) : les trois tests sont rouges à la base
  par `ERR_ASSERTION` au point attendu (« burn (inner): one entry », « approve: kept once… », « depth five: the near twin is kept… ») ;
  `base-check.tap` `da242b19…`.
- Contrôles statiques sur le clone (00:52:38Z-00:55:05Z) : `tsc --noEmit` 0 (l annotation `(v: unknown): boolean` suffit : aucune erreur
  d inférence circulaire ; `.some` sur `readonly unknown[] | unknown[]` accepté) ; `eslint` des deux fichiers 0 ; `lint:ratchet` **69/69** ;
  `lang:gate` 0 ; `gate:vocab` 0. Décompte direct des six règles du cliquet (formateur JSON ; `F:/tmp/dojo/batch/ratchet-count.mjs`
  `3595e795…`, rapport `ratchet-all.json` `af72b9d8…`, 00:54:34Z) : 203 fichiers de test, 69 violations dans cinq fichiers antérieurs, **0
  dans le test neuf** (présent au rapport, 0 message). Un premier décompte au formateur `unix` (00:53Z) était vide de sens (formateur retiré
  d ESLint 10 : la sortie était son message d erreur) ; il n est pas retenu.

## 7. Tests de l historique sur un clone ; mesures après code

- Clone `--no-local` de `F:/Monark` à `dfd9f873` en `F:/tmp/dojo/batch/clone` (00:50:48Z-00:50:55Z), les deux fichiers du lot copiés (sha256
  égaux), `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark`, 0 échec, 00:51:02Z) ; verrou d hôte absent (lu à 00:50:40Z et
  00:51:46Z) ; C-V-4 : 15 862 Mo physiques et 32 326 Mo virtuels libres, 4 `node.exe`.
- `node --test --test-reporter=spec --test-timeout=120000 --test-force-exit "--test-skip-pattern=[(]test 42[)]"` sur `dojo-history-batch-near`,
  `-ins2`, `-ins`, `-read`, `-build`, `-provisional`, `-collect` (00:51:46Z-00:52:27Z) : **40 tests, 40 verts, 0 échec**, sortie 0 ;
  `F:/tmp/dojo/batch/history-tests.txt` sha256 `3a4059a43d9331ee30d293969b2f8772dbf2df72fd99fd25aabc6e859d909616`.
- **`readBody` de la base contre celui du gel sur les bruts r2 et r3** (`probe/cmp-readbody.mjs` `243e5733…`, modules du mini-arbre
  `91eda471…` et `e038d7bf…`, 00:57:14Z-00:57:46Z, sortie `cmp-readbody.out` `ed6059df8ab665212926c9a8ee139cb90625e7adac42ccb62353caa9bd4b244b`) :
  contrôle non vide en tête (C1 + un `batch` proche : base `transferChecked`, gel `transferChecked,batch`, clés différentes) ; r2 : 47 983
  transactions, toutes lues des deux côtés, **mêmes `ins` (types et `info` à l identité), offre, entrées du mint, signature, slot, blockTime,
  rang, `err`, et même `readKey` avec et sans rang : 47 983 / 47 983** ; r3 : **48 066 / 48 066** ; 0 arrêt, 0 écart. La clé D-5 de chaque
  corps observé est inchangée par le lot.
- Couverture des bruts (`probe/journal-raws.mjs` `9e25cabe…`, 01:06Z, sortie `journal-raws.out` `ed6c5f82…`) : les chemins `raw` distincts
  cités par `evidence/journal.jsonl` sont exactement les fichiers lus sous `evidence/raw/` (r2 : 28 058 = 28 058 ; r3 : 28 085 = 28 085 ;
  0 cité absent, 0 présent non cité) ; hors de `evidence/raw/`, les deux courses ne portent que des métadonnées (`runs/*/{run,checks}.json`,
  `SHA256SUMS`, `status.json`, `ledger/`, `provisional/eve.json` en r3).
- Profondeur pathologique (`probe/depth-limit.mjs` `ddb5a704…`, 00:58:20Z-00:58:22Z, sortie `depth-limit.out` `c2befbd8…`), profondeur
  d imbrication d un `info` (tableaux autour d une chaîne LOINTAINE) au premier échec, bissection sur [1, 2^20], trois tours : `readBody`
  du gel 4 048, 3 808, 3 840 (`RangeError: Maximum call stack size exceeded`) ; `readBody` de la base : aucun échec jusqu à 2^20 ;
  `canonical` de `bell-chain.mjs` sur le corps entier (le collecteur l applique à toute réponse avant `readBody`, `history-collect.ts`
  l.255) : 3 676, 3 676, 4 097 ; `JSON.parse` : aucun échec jusqu à 2^20. `admit` du gel sur un corps trop profond relance le `RangeError`
  (ni `FAULT`, ni arrêt nommé) ; celui de la base ne lève rien. Profondeur maximale observée dans les bruts : 2 (§2). Voir Q-3.

## 8. F2P (`red-proof.mjs` du tronc, `6579b550…ab36`)

- `node F:/Monark/scripts/red-proof.mjs --base dfd9f87349529bfd0595ecaf340379eb0f598905 --gel F:/Monark-wt-batch --repo
  F:/tmp/dojo/batch/clone --out F:/tmp/dojo/batch/f2p --draw 3 --seed 2026`, `TEMP`, `TMP`, `TMPDIR` = `F:/tmp/dojo/batch/tmp`,
  `GIT_OPTIONAL_LOCKS=0` (00:55:20Z-00:55:36Z ; verrou absent, sortie neuve) : **sortie 0, « red-proof OK: 3 judged, 0 unchanged, 3
  killer(s) drawn »** ; `F:/tmp/dojo/batch/f2p/RED-PROOF.json` sha256 `cfd4d12ec0382d5ac301aa9665c8629705a6e50fa4db21c85d66e3ae52001bbd`
  (`ok: true`, digest `9a6bff0d605d64c2073a7a0b93022767fd166dfea28d7113d8d1c57ed5391d00`, population 3, graine 2026).
- Les trois tests (l.69, l.110, l.149) : `assert-fail` à la base, `pass` au gel, F2P, `killerProblem` nul ; `base.tap` `c288663c…`,
  `gel.tap` `44477338…`.
- Les trois tueurs tirés : **tués**, fichier restauré (sha256 avant = après) : `killer-1.tap` `bb475711…` (objets non parcourus : rouge sur
  « approve: kept once, with its own type and info ») ; `killer-2.tap` `82cf18c3…` (tableaux non parcourus : « burn (inner): one entry ») ;
  `killer-3.tap` `540cc72e…` (tout est proche : « depth five: no near value, ignored »).

## 8 bis. Campagne de mutants (outil du tronc ; au-delà de la mission, une seule, sur le clone)

- `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/batch/clone --base dfd9f873… --out F:/tmp/dojo/batch/mutants --table
  F:/tmp/dojo/batch/mutants-table.mjs --killers --file apps/dojo/src/history-read.ts --targets apps/dojo/test/dojo-history-batch-near.test.ts
  --lock-root F:/tmp --min-free-mb 4096` (01:00:19Z-01:01:27Z ; pré-contrôle : verrou absent, 14 537 Mo physiques et 30 654 Mo virtuels
  libres, 4 `node.exe` ; aucune autre course pendant) : **sortie 0, tués 11 / 11** ; `RESULTS.json` sha256
  `437bbd4b122b9e017bfde94ff414afff501911cf4f5db5957664af11edf6562a`, `RESULTS.txt` `2b6ead4d…` ; outil `41cdf83f…`, arbre de l outil
  `9bf0ce5f…` (propre) ; table `mutants-table.mjs` `5af193a3…`.
- Ligne de base verte : 11 fichiers cibles (les sept de l historique, `dojo-publish`, `test/dojo-publish-deploy`, `test/dojo-publish-e2e`,
  `test/dojo-history-e2e`), 87 tests verts.
- Chaque mutant de la table est tué par le test qu il nomme, seul : E1 clés parcourues (C) ; E2 inclusion au lieu d égalité (C) ; E3 l objet
  `parsed` parcouru au lieu de l `info` (C) ; E4 l instruction entière parcourue (C) ; E5 règle de la base restaurée (A) ; E6 profondeur deux
  au plus (B) ; E9 `every` au lieu de `some` en l.116 (B) ; E10 `every` au lieu de `some` en l.112, vrai par vacuité sur toute feuille (C).
  K1-K3 (les tueurs déclarés) tués par leur test.

## 9. Portes : oracle du tronc, rôle G1

- Verrou d hôte TENU de 01:02:32Z à 01:10:16Z par un oracle G7 d un autre lot (`owner.txt` : rôle G7, sha `d1120612…`, pid 130100, `node`
  vivant, lu à 01:05:18Z et 01:05:23Z) : attente, aucune course ni harnais lancés pendant (un guetteur ne faisait que lire l existence du
  verrou). Verrou libre à 01:10:16Z, pid 130100 terminé ; C-V-4 lu à 01:10:24Z : 15 350 Mo physiques et 32 629 Mo virtuels libres,
  5 `node.exe`.
- `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-batch --base dfd9f87349529bfd0595ecaf340379eb0f598905`, lancé à
  01:10:29Z, `GIT_OPTIONAL_LOCKS=0`, aucune autre course ni harnais pendant sa suite : **sortie 0** à 01:19:27Z ; enregistrement
  `F:/tmp/oracle-results/dfd9f87349529bfd0595ecaf340379eb0f598905-3cf7b2ddb9028eae-G1-20261002T011029Z-31304.json` sha256
  `69a58e4bea1d51ba9e0b50bb0d8ae487405c1c330cea821de122aea68a36c913` ; gel `3cf7b2dd…` (dirty), objet d arbre
  `56d3ab6542bffb453b11ed1f1271e22070394d41` (Q-2).
- Portes, toutes à 0 : `lint-model-pinning` 0 s, `r25` 0 s, `lang:gate` 2 s, `export:check` 1 s, `gate:vocab` 1 s, `typecheck` 8 s, `lint`
  21 s, `lint:ratchet` 22 s (statiques, hors verrou) ; `test` 464 s sous verrou (attente 0 s ; C-V-4 : 15 713 Mo libres, 5 `node.exe`) :
  **1 860 tests, 1 856 verts, 0 échec, 4 sautés** (HISTORY-INS-2 : 1 857 et 1 853 ; +3, les tests neufs) ; le test 42 une fois, dans la
  suite (l.2038 de `09-test.log`, `7762c5f1…` ; la l.2039 est le test 42(f'), distinct) ; les trois tests neufs verts l.457-459, les quatre
  tests d instructions l.487-490. Le répertoire de course a été retiré par l oracle (`F:/tmp/oracle-runs/run-QKuSz5` absent à 01:19Z) ;
  `residues.tmp_entries` 383 compte le `tmp` de ce répertoire-là (l.91, l.167 de l oracle), non mon `TEMP` (une entrée,
  `node-compile-cache`).

## 10. R-25

- Porte `r25` de l oracle (`02-r25.log` `7550da04…`, `r25.mjs` du tronc `4d0544df…`) : `STAT` **164 insertions, 4 suppressions, 168
  lignes** (borne CI `VIBEGATES_PR_LIMIT` = 1 205 ; borne de la mission 1 150) ; `CONTENT_STAT` 0. Détail : `history-read.ts` +4 / -4,
  `dojo-history-batch-near.test.ts` +160 ; ce journal exclu (ci.yml l.82).

## 11. Brouillon de la ligne datée de l ADR (à écrire par l orchestrateur dans `docs/adr/ADR-DOJO-PR-2B.md`, jamais par le G1)

> - **Ligne datée du 2026-10-02 (lot BATCH-NEAR ; item DOJO-HISTORY-BATCH-NEAR-1 ; D-5, D-8 (vi) l.370)** : dans `readBody`, une instruction
>   Token-2022 analysée entre dans `ins` quand le mint ou un compte de ses entrées figure à TOUTE profondeur de son `info` (tableaux et
>   objets parcourus, clés jamais lues), et non plus seulement parmi ses valeurs directes ; rien d autre ne change (instruction non analysée :
>   `accounts`, inchangée ; l offre, le repli de propriétaire de D-5 l.329 et (iv) exigent toujours une valeur directe ; les soldes viennent
>   de `pre/postTokenBalances`). Un `batch` analysé (`parse_token.rs` l.769-809, `info = {instructions: [...]}`) qui enveloppe une
>   instruction proche est donc retenu une fois, sous le type `batch`, absent de la liste fermée : (vi) arrête en `instruction_not_allowed`
>   (fermé par défaut ; aucun type ajouté). Bruts des courses `provisional-2026-10-01-r2` et `-r3` : 0 instruction proche par la seule règle
>   profonde sur 85 757 et 86 015 instructions Token-2022 (`count-deep.out` `90975386…`) ; `readBody` et `readKey` de la base et du gel
>   identiques sur 47 983 et 48 066 transactions (`cmp-readbody.out` `ed6059df…`). Tests :
>   `dojo_history_batch_near_the_mint_stops_instruction_not_allowed`, `dojo_history_instruction_near_at_depth_two_is_kept_with_its_type`,
>   `dojo_history_instruction_with_no_near_value_stays_ignored` ; F2P et trois tueurs tués (`RED-PROOF.json` `cfd4d12e…`) ; mutants 11 / 11
>   (`RESULTS.json` `437bbd4b…`). Au-delà d environ 3 800 niveaux d imbrication, la lecture lève une faute non nommée, fail-closed (item
>   DOJO-HISTORY-INFO-DEPTH-1).

## 12. Questions et écarts (Q-n)

- **Q-1 (écart ; `error_origin` G1)** : ma première commande sur le worktree (00:28Z, `git rev-parse HEAD && git branch --show-current &&
  git status --porcelain=v1`) a tourné SANS `--no-optional-locks` ni `GIT_OPTIONAL_LOCKS=0`. Le fichier
  `F:/Monark/.git/worktrees/Monark-wt-batch/index` porte la date 00:28:25Z (lu à 00:46:23Z et 00:46:32Z ; création du worktree : `HEAD`
  00:27:37Z) : rafraîchissement opportuniste de l index par ce `git status`, attribué à moi. Aucun contenu indexé (`git --no-optional-locks
  diff --cached --stat` vide à 00:46:32Z), HEAD inchangé (`dfd9f873`), date de l index inchangée ensuite. Toutes mes commandes git
  suivantes portent `--no-optional-locks` ou `GIT_OPTIONAL_LOCKS=0` (outils du tronc compris).
- **Q-2 (oracle et journal)** : l oracle a gelé l arbre à 01:10:29Z (dirty `3cf7b2dd…`, objet `56d3ab65…`), ce journal au sha256
  `b18a4512da3448e6afebaebf0a707d519ef02318984ce4bf50500071b644060d` (§1 à §8 bis, §11, §12 sans les résultats de l oracle) ; les deux
  fichiers de code et de test y ont les sha256 de la livraison (`e038d7bf…`, `41a51032…`) ; seul ce journal diffère (`docs/G1-lot-*.md`,
  hors R-25, lu par aucun test). Le gel de l orchestrateur portera le journal final ; G2 et cp-2 rejouent (CA-9).
- **Q-3 (profondeur pathologique ; item formé DOJO-HISTORY-INFO-DEPTH-1, règle Dettes, PAROXYSME)** : « à toute profondeur » vaut jusqu à la
  pile de Node : au-delà d environ 3 800 niveaux d imbrication dans un `info` (mesuré : 3 808 à 4 048, §7), `nearIn` lève `RangeError`,
  que `admit` relance et que le collecteur relève en faute non nommée (ligne datée C-G2-2) : la course s arrête, rien ne passe (fail-closed),
  mais l arrêt n est pas nommé. La même classe existe déjà, au même ordre de grandeur, pour `canonical` sur toute réponse
  (`history-collect.ts` l.255 : 3 676 à 4 097) ; `JSON.parse` lit 2^20 niveaux. Profondeur réelle maximale : 2 ; un `batch` imbriqué n est
  pas analysable (`parse_token.rs` l.793-796). Construction candidate (au choix de l orchestrateur, aucun code dans ce lot, hors décision) :
  (a) un parcours itératif à pile explicite (aucune récursion, aucune borne), ou (b) une borne de profondeur déclarée (par exemple 64) qui
  ARRÊTE `read_malformed` au-delà, jamais un plafond silencieux (qui laisserait passer une valeur proche plus profonde : fail-open) ; et le
  même traitement pour `canonical` (l.255). Prix : 1 à 3 lignes et un test (un `info` imbriqué à 10^5 arrête nommé) ; une ligne ajoutée
  entre la l.112 et la l.206 décale les trois tueurs de la l.206, au-dessus de la l.112 les six (Q-6). Déclencheur : un arrêt non nommé
  d une course qui pointe la lecture, ou une ligne datée qui veut nommer toute faute de lecture. Propriétaire : orchestrateur.
- **Q-4 (forme interne d un `batch` ; demande de lecture formée, item FAITS-TOKEN2022-PARSER-BATCH-SHAPE-1)** : la clé `type` des éléments
  de `info.instructions` est [lu] (`parse_token.rs` l.2281-2282) ; la clé `info` est INFÉRÉE (même `ParsedInstructionEnum` que l objet
  `parsed` de tout corps réel), déclarée telle dans l en-tête du test. Demande (orchestrateur, lecture sur place) : la définition de
  `ParsedInstructionEnum` et ses attributs `serde` dans `transaction-status/src/parse_instruction.rs` d agave (même source que FAITS L-10,
  `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` l.32), épinglée à un commit. Tentative faite : la copie locale importe la struct
  (`parse_token.rs` l.3) sans la définir ; aucun réseau dans ce lot. Usage : confirmer `{type, info}`. Non porteuse : la règle profonde
  trouve une valeur proche sous n importe quelle clé (les tests et les mutants E1-E10 n en dépendent pas). Déclencheur : avant tout texte
  public qui décrirait la forme d un `batch`.
- **Q-5 (sonde de l orchestrateur)** : `F:/tmp/dojo/scan-ins2.mjs` applique la règle DIRECTE (l.20) : elle ne verra pas un `batch` proche.
  Si elle sert de sonde à la course finale, la mettre à jour hors dépôt (règle profonde, comme `probe/count-deep.mjs` l.17).
- **Q-6 (références de ligne des tueurs, pour le lot suivant)** : la l.112 porte maintenant les trois tueurs de ce lot
  (`dojo-history-batch-near.test.ts:68`, `:109`, `:148`), la l.206 trois (`dojo-history-collect.test.ts:150`, `dojo-history-ins.test.ts:86`,
  `dojo-history-ins2.test.ts:101`), la l.31 deux. Toute ligne ajoutée au-dessus d elles les décale. Information, aucun code.
- **Q-7 (portée à la course finale, information)** : par la décision, une instruction d un type hors liste qui nommerait un compte du mint
  seulement dans un tableau (`signers`, `sourceAccounts`) ou un objet imbriqué arrête désormais la course (`instruction_not_allowed`) ;
  0 cas dans r2 et r3 (§2 : aucune valeur imbriquée ne porte le mint ni un compte du mint). Fail-closed et nommé.
- **Q-8 (cliquet au plafond, information)** : `lint-ratchet` 69/69, aucune marge (0 violation ajoutée, §6).
- **Q-9 (campagne de mutants au-delà de la mission)** : faite par l outil du tronc (REGLES-MISSION, ligne datée 2026-09-29 14:5x), une seule,
  sur le clone, garde externe respectée (verrou absent, aucune course pendant) ; à citer ou à ignorer par l orchestrateur.

## 13. Fin du G1 (§ de fin)

- **Verdict proposé : LIVRE-AVEC-RESERVES**, la réserve étant Q-1 seule (écart de conduite : un `git status` sans `--no-optional-locks` a
  rafraîchi l index du worktree à 00:28:25Z ; aucun contenu indexé, HEAD inchangé, aucun effet sur les fichiers livrés ; à juger par
  l orchestrateur). Q-3 et Q-4 sont des items formés (DOJO-HISTORY-INFO-DEPTH-1, FAITS-TOKEN2022-PARSER-BATCH-SHAPE-1), non bloquants pour
  la course finale ; Q-2, Q-5 à Q-9 sont consignés.
- **Code** : `readBody` retient une instruction Token-2022 analysée dont le mint ou un compte du mint figure à toute profondeur de son
  `info` (l.112 `nearIn`, l.116) ; doc l.84-85 ; 4 insertions, 4 suppressions, aucune ligne nette ; rien d autre ne change (§3). Un `batch`
  proche est retenu sous `batch` et arrête (vi) en `instruction_not_allowed` ; aucun type ajouté à la liste fermée.
- **Mesures sur les bruts réels** : 0 instruction proche par la seule règle profonde sur r2 (85 757 instructions Token-2022, 47 983
  transactions) et r3 (86 015, 48 066), `count-deep.out` `90975386…` (avant code) ; `readBody` et `readKey` de la base et du gel identiques
  sur toutes ces transactions, `cmp-readbody.out` `ed6059df…` (après code) ; couverture des bruts journalisés complète (`journal-raws.out`
  `ed6c5f82…`). La décision « ne conclus pas » n est pas déclenchée.
- **Tests et tueurs** : trois tests neufs, F2P, trois tueurs tirés et tués (`RED-PROOF.json` `cfd4d12e…`) ; campagne de mutants 11 / 11
  tués (`RESULTS.json` `437bbd4b…`) ; tests de l historique 40 / 40 sur un clone ; oracle G1 sortie 0, 9 portes à 0, 1 856 verts sur 1 860,
  0 échec, 4 sautés (`69a58e4b…`) ; cliquet 69/69, 0 violation ajoutée (décompte direct). R-25 : 168 lignes (164 + 4).
- **Sorties** : `docs/G1-lot-batch-near.md` (ce journal), `apps/dojo/src/history-read.ts`, `apps/dojo/test/dojo-history-batch-near.test.ts`
  (exactement les sorties déclarées) ; hors dépôt : `F:/tmp/dojo/batch/` (`clone/`, `mutants/`, `f2p/`, `probe/` et ses sorties,
  `guard.mjs`, `ratchet-count.mjs`, `mutants-table.mjs`, `history-tests.txt`, sorties statiques et de l oracle, `journal-plan-0047.md`,
  `history-read.base.ts`) et `F:/tmp/dojo/batch-deliver/` (`REPONSE.md`, `DELIVERED.sha256`).
- **Déclarations** : aucun `GIT_DIR` ni `GIT_WORK_TREE` posé ; aucun `--write-tree`, aucun `git write-tree` ; aucun git écrivant dans le
  worktree ni dans `F:/Monark` hors l écart Q-1 (sur le worktree ensuite : `rev-parse`, `status`, `diff`, `show` en `--no-optional-locks` ;
  `red-proof` et l oracle avec `GIT_OPTIONAL_LOCKS=0` ; index du worktree daté 00:28:25Z encore à 01:20:29Z) ; clones et checkouts
  seulement sous `F:/tmp/dojo/batch/` ; aucun réseau, aucune clé ; `F:/Monark-wt-page-v1` jamais lu ni touché, `scan-ins2.mjs` jamais lancé ;
  lecture seule de `F:/PRODUITS/dojo-history/` ; `TEMP`, `TMP` et `TMPDIR` = `F:/tmp/dojo/batch/tmp` pour chaque course (seul résidu :
  `node-compile-cache`) ; jonctions `node_modules` posées par `mk-nm.ps1` (clone, 00:51:02Z) et par l outil de mutants (son clone), retirées
  par `rm-nm.ps1` à 01:20:17Z (clone des mutants) et 01:20:21Z (clone) ; `F:/Monark/node_modules` lu seulement (220 entrées, 11 `@monark`
  à 01:20:21Z) ; aucun oracle arrêté (l oracle G7 d un autre lot attendu, §9) ; aucune adresse IP écrite ; aucune sortie, aucun `TEMP` ni
  cache npm sur C: (`npm config get cache` = `F:/cache/npm`, écrit ici en barres obliques ; les caches internes de `powershell.exe`, appelé
  pour `mk-nm.ps1`, `rm-nm.ps1` et C-V-4, ne sont pas mesurés) ; rien commis (R-20).
- Ligne datée de l ADR : brouillon au §11, à écrire par l orchestrateur.
