# claude-opus-5-5

# G1 : journal du lot HISTORY-INS (liste fermée D-8 (vi) étendue de cinq types sans effet sur un solde ni sur l offre)

- Mission : `F:/tmp/dojo/mission-hins.md` sha256 `37ae67c99447e2f98f7c143ec96dae70b8492e6773949b737ca6c3fdebb636b4` (recalculé à 17:28:04Z, égal).
- Modèle résolu : `claude-opus-5-5`, effort `max` (R-1). Rôle G1, instance fraîche. Début 2026-10-01T17:28:04Z (`date -u`).
- Worktree `F:/Monark-wt-hins`, branche `lot/history-ins`, HEAD = base `c0c60617f713c81c4b6a6a64b6ab0f8b9873428b` (lu par `git rev-parse HEAD`).
- Règles : `docs/methode/REGLES-MISSION.md` `6470002592fe9c18…` ; aucun git écrivant, aucun `GIT_DIR`, aucun `--write-tree`, aucun réseau.

## 1. Lecture (avant tout code)

Entrées lues en entier, dans l ordre de la mission ; sha256 à la base, relevés à 17:42Z :
- `apps/dojo/src/history-read.ts` `f9f1463ec404c9a7…` : liste l.25-27 (15 types), `SUPPLY_TYPES` l.28, `UNPARSED` l.30, règle « proche »
  l.107-114, offre l.116-119, (vi) l.201-203, repli de propriétaire l.253.
- `apps/dojo/src/history-build.ts` `c3f87f4146ca811f…` : `side` l.69-75 (même repli, l.72), `moves` l.84 (lit `t.supply` seul).
- `apps/dojo/test/dojo-history-read.test.ts` `659f9e942740911…` : `dojo_history_instruction_allowlist_stops` l.186-205 (`freezeAccount`,
  instruction non analysée, groupe orphelin) ; aides `inner` et `mk`.
- `apps/dojo/test/dojo-history-collect.test.ts` `168ff6619a6f0444…` : sonde de composition l.199, où `"approve"` sert d exemple de type
  REFUSÉ (Q-1).
- `docs/adr/ADR-DOJO-PR-2B.md` `222c13251a067412…` : D-5 l.310-329 (clé ; propriétaire absent l.329), D-8 l.361-371 ; (vi) l.370 : « tout
  autre type […] est consigné, et une ligne datée étend la liste ».
- `F:/tmp/dojo/scan-ins2.mjs` `d258747865b8e569…` : même règle « proche » que `readBody`, liste de 15 types recopiée.
- `F:/Monark/scripts/red-proof.mjs` `6579b55080ac0081…` : `KILLER` l.33, `parseKiller` l.46-49, convention l.18-24 ; F2P = échec
  `ERR_ASSERTION` à la base (l.102, l.170).
- `parse_token.rs` d agave, copie de FAITS L-10 (`docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` l.32, préfixe `50370cf477d4d526…` égal),
  recopiée en `F:/tmp/dojo/hins/parse_token.rs` (la copie d origine est dans le brouillon d une autre session).

Formes `jsonParsed` [lu] dans `F:/tmp/dojo/hins/parse_token.rs` (sha256 `50370cf477d4d526960a226a945f712426c059f220fd4c84f63f493da64d88c0`) :
- `initializeAccount` l.92-103 : `{account: accounts[0], mint: accounts[1], owner: accounts[2], rentSysvar: accounts[3]}`.
- `initializeAccount2` l.104-115 : `{account: accounts[0], mint: accounts[1], owner: <donnée de l instruction>, rentSysvar: accounts[2]}`.
- `initializeAccount3` l.116-127 (déjà admis) : `{account, mint, owner: <donnée>}`.
- `approve` l.180-200 : `{source, delegate, amount}` + signataire `owner` ou `multisigOwner`.
- `revoke` l.201-219 : `{source}` + signataire `owner` ou `multisigOwner`.
- `approveChecked` l.388-410 : `{source, mint, delegate, tokenAmount}` + signataire `owner` ou `multisigOwner`.

## 2. Compte (mesuré, lecture seule, aucun réseau)

- `node F:/tmp/dojo/scan-ins2.mjs F:/PRODUITS/dojo-history/provisional-2026-10-01/evidence/raw/B/helius/` (17:37:01Z-17:37:04Z) :
  `initializeAccount x3`, `approve x1` ; rien d autre hors liste. Égal au compte de la mission.
- Sonde `F:/tmp/dojo/hins/probe-shapes.mjs` (sha256 `60bf08116b002c47bdfbe9b6e1febdfef3fd44433866b2148b204e632689bee9`) : 25 409
  transactions ; les trois `initializeAccount` ont les clés `account,mint,owner,rentSysvar` (proches par `mint` et `account`), l `approve`
  les clés `amount,delegate,owner,source` (proche par `source`) ; aucune n est en échec. Sortie `probe-shapes.out` `ced9660d…`.
- Sonde `F:/tmp/dojo/hins/probe-owner.mjs` (sha256 `2c9a10e65bbc336a3cb4e756cc3e5ccda09f25164d778baf68494c5a0d324b76`) : dans les quatre
  transactions, toute entrée du mint porte un `owner` (le repli n est jamais atteint) ; pour chaque compte nommé, l entrée `post` existe et
  son `owner` égale `info.owner` ; un seul `initializeAccount*` par compte initialisé. Un des trois comptes a `owner === account` (compte
  qui se possède lui-même) : forme rare, sans effet sur la lecture (le propriétaire vient de l entrée). Sortie `probe-owner.out`
  `558405b3…`.
- Les deux sondes ont tourné d abord à 17:37Z ; une ligne de chacune dépassait 160 caractères : réécrites sans changer ce qu elles
  impriment, rejouées à 18:01:01Z-18:01:06Z, sorties identiques ligne à ligne ; les sha256 ci-dessus sont ceux des versions rejouées.

## 3. Vérification au code (décisions de l orchestrateur, point 2)

- **Offre** : `SUPPLY_TYPES` (l.28) = `mintTo`, `mintToChecked`, `burn`, `burnChecked` ; l offre d un corps (l.116-119) ne retient que ces
  types avec `info.mint === mint`. `checkSupply` (l.170-176) et `moves` (history-build l.84) ne lisent que `tx.supply`. `approveChecked`
  porte `mint` et `tokenAmount` mais n est pas dans `SUPPLY_TYPES` : aucun des cinq n entre dans l offre. `SUPPLY_TYPES` n est pas touché.
- **Soldes** : un solde lu ne vient que de `pre/postTokenBalances` (l.97-105) ; aucune instruction ne fournit un montant de solde. Un type
  n agit que par : la clé (l.125, types triés, inchangée par la liste), `supply` (ci-dessus), (vi) (l.202), le repli de propriétaire (l.253,
  history-build l.72) et (iv) (`initializeMint2`, l.186). Le contrôle (iii) et le (i) par transaction restent opposés à chaque admise.
- **Repli de `initializeAccount2`** : l.253 prend le premier `initializeAccount*` dont `info.account === acc` et lit `info.owner`. Pour
  `initializeAccount2`, `info.account` = compte initialisé, `info.owner` = propriétaire donné par l instruction (l.104-115) : correct, même
  sens que `initializeAccount3` déjà admis. Pour `initializeAccount`, `info.owner` = `accounts[2]`, le propriétaire : correct aussi.
  `approve`, `approveChecked` et `revoke` portent un `owner` (signataire) mais aucune clé `account` et ne commencent pas par
  `initializeAccount` : ils n alimentent jamais le repli. Les cinq types sont donc ajoutés.

## 4. Plan (avant code)

1. `history-read.ts` : les cinq types ajoutés EN FIN de `DOJO_HISTORY_INSTRUCTIONS`, sur une ligne neuve ; commentaire de la liste mis à
   jour (ligne datée HISTORY-INS, à écrire dans l ADR par l orchestrateur, brouillon au §8). Rien d autre ; `unparsed` et tout type inconnu
   restent refusés.
2. Test neuf `apps/dojo/test/dojo-history-ins.test.ts`, deux tests, variantes SYNTHÉTIQUES dérivées de C1 et de `mk` :
   - (A) `dojo_history_ins_added_types_pass_near_the_mint` : chaque type ajouté, proche du mint, est lu, passe (vi), ne change ni l offre ni
     les entrées du mint ; repli de propriétaire par `initializeAccount` et `initializeAccount2` ; le `owner` d un `approve` ne l alimente pas.
     Tueur : `.slice(0, 15)` sur la ligne de (vi) (rend la sémantique de la base).
   - (B) `dojo_history_ins_unknown_and_unparsed_still_stop` : épingle de la liste fermée (20 types recodés, sans `unparsed`, décision
     « aucun autre type ») ; un type ajouté placé AVANT un type inconnu ou une instruction non analysée : l arrêt nomme l inconnu. Tueur :
     SDL de la boucle de (vi).
3. `dojo-history-collect.test.ts` (Q-1) : la sonde l.199 passe de `"approve"` à `"freezeAccount"` (hors liste) par une petite aide ; une sonde
   positive : `approve` au même endroit laisse la phase B finir sans arrêt. Ligne tueur au-dessus du test.
4. Portes : oracle du tronc `--static-only` (hors verrou) ; tests de l historique sur un clone `--no-local`, `red-proof.mjs`, puis oracle
   complet `--role G1`, seulement quand le verrou d hôte est libre (tenu par un G7 depuis 17:31:40Z à la lecture de 17:36Z).

Compte R-25 attendu : de l ordre de 80 à 110 lignes (code et tests ; `docs/G1-lot-*.md` exclu par le job, ci.yml l.82). Borne 1 150.

## 5. Code (fait, 17:43Z)

- `apps/dojo/src/history-read.ts` (sha256 au gel `97ece3105e6305949f0489aaa6f2b6addb8f9242528cc148758a773cffdc71b7`) : commentaire de la
  liste l.24-27 ; l.30 perd `] as const);` ; l.31 neuve : `"initializeAccount", "initializeAccount2", "approve", "approveChecked", "revoke"`,
  en DERNIER (15 types de la base aux l.28-30, dans leur ordre). Aucune autre ligne ; la boucle de (vi) passe de l.202 à l.206.
- Aucun changement de `SUPPLY_TYPES`, de `readBody`, de `readKey`, du repli de propriétaire ni de `history-build.ts`.

## 6. Tests (faits) et tueurs

- `apps/dojo/test/dojo-history-ins.test.ts` (neuf, 101 l., sha256 `c8a98a54f7b25e0b8117bd7a1de7653daf552a2444b0b0c31928cc32cbc165e5`) :
  - l.63 `dojo_history_ins_added_types_pass_near_the_mint` : pour chacun des cinq types (formes de `parse_token.rs`, proches par `mint` ou
    par `source` = BMAH, compte du mint dans C1) : lu dans `ins` (cas non vide), (vi) passe, `supply` et entrées du mint égales à celles de
    C1, (i) de la transaction tient ; repli de propriétaire par `initializeAccount` et `initializeAccount2` (`C=4/O4`) ; le `owner` nommé
    par `approve`, `approveChecked` ou `revoke` ne l alimente pas (`owner_unknown`). Tueur l.62 :
    `apps/dojo/src/history-read.ts:31 CONST "initializeAccount2" -> "initializeAccount9"`.
  - l.86 `dojo_history_ins_unknown_and_unparsed_still_stop` : ÉPINGLE déclarée (décision « aucun autre type ») : la liste triée égale les
    15 types de D-8 (vi) et les cinq de HISTORY-INS, recodés, sans `unparsed` ; puis `thawAccount`, `freezeAccount`,
    `transferCheckedWithFee` (type qui déplace des soldes), `initializeAccount4`, `approveAll`, `revoked` (noms qui prolongent un type
    ajouté : égalité exacte, jamais un préfixe) et une instruction non analysée sur BMAH arrêtent `instruction_not_allowed`, seuls et
    placés APRÈS chacun des cinq types ajoutés (l arrêt nomme alors le refusé). Tueur l.85 :
    `apps/dojo/src/history-read.ts:206 SDL "for (const i of tx.ins)" -> ""`.
- `apps/dojo/test/dojo-history-collect.test.ts` (Q-1 ; sha256 au gel `17a55d7eab8b947722762ed67c7edfb3efb6d75308604a19b628bad1e9e55408`) :
  aide `retype` l.198-201 ; sonde l.204 `"approve"` remplacé par `"freezeAccount"` ; sonde positive l.218-220 : `approve` au même endroit,
  phases A et B sans arrêt (`[null, null]`), par le chemin servi (collecteur, `composeChecks`, `checkInstructions`). Tueur l.150 :
  `apps/dojo/src/history-read.ts:206 CONST "string[])" -> "string[]).slice(0, 15)"` (rend la liste de la base : les cinq sont les derniers).

## 7. Tests de l historique sur un clone

- Clone `--no-local` de `F:/Monark` à `c0c60617` en `F:/tmp/dojo/hins/clone` (17:46:51Z-17:46:59Z), les trois fichiers du lot copiés
  (sha256 égaux), `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark`, 0 échec), verrou d hôte libre (lu à 17:47:21Z).
- `node --test --test-reporter=spec --test-timeout=120000 --test-force-exit "--test-skip-pattern=[(]test 42[)]"` sur
  `dojo-history-ins`, `-read`, `-build`, `-provisional`, `-collect` (17:47:21Z-17:48:06Z) : **35 tests, 35 verts, 0 échec**, sortie 0 ;
  `F:/tmp/dojo/hins/history-tests.txt` sha256 `5e29089208d5c5e177b93abf7bac26939dd64a2007f4eb42f7fd12408adfed13`.

## 8. F2P (`red-proof.mjs` du tronc, `6579b550…ab36`)

- `node F:/Monark/scripts/red-proof.mjs --base c0c60617f713c81c4b6a6a64b6ab0f8b9873428b --gel F:/Monark-wt-hins --repo
  F:/tmp/dojo/hins/clone --out F:/tmp/dojo/hins/f2p --draw 3 --seed 2026` (17:48:13Z-17:49:55Z) : **sortie 0, « red-proof OK: 3 judged,
  14 unchanged, 3 killer(s) drawn »** ; `F:/tmp/dojo/hins/f2p/RED-PROOF.json` sha256
  `aee325f2cd0be5c103d0082a127bcd75696ad89642c5d2710a86a00efcb36efb` (`ok: true`, digest
  `ffbda635ca7c3ade310d1bf3069defd0f9484f9ec4633544c8f7dce250901330`, population 3, graine 2026).
- Les trois tests jugés : `assert-fail` à la base, `pass` au gel, F2P, `killerProblem` nul. Rouge à la base (`base.tap`
  `fcdc1966…`) : collecte « an added type (HISTORY-INS) passes the composed checks », `[null, 'instruction_not_allowed']` contre
  `[null, null]` (la sonde `freezeAccount` passait avant) ; test (A) « Got unwanted exception: initializeAccount passes (vi) » ; test (B)
  l épingle (« Expected values to be strictly deep-equal »). Tous `ERR_ASSERTION`.
- Les trois tueurs tirés : **tués** (`killer-1.tap` `5ffc3c04…` : « initializeAccount2 passes (vi) » ; `killer-2.tap` `99c6dac4…` ;
  `killer-3.tap` `62ce890c…` : « Missing expected exception. ») ; fichier restauré, sha256 avant = après pour chacun.

## 9. Portes : oracle du tronc, rôle G1

- `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-hins --base c0c60617f713c81c4b6a6a64b6ab0f8b9873428b`, lancé à
  17:50:21Z après la fin du `red-proof` (verrou libre, aucune autre course ni harnais pendant sa suite) : **sortie 0** à 17:58:35Z ;
  enregistrement `F:/tmp/oracle-results/c0c60617f713c81c4b6a6a64b6ab0f8b9873428b-1e940e865bb16673-G1-20261001T175021Z-94008.json`
  sha256 `aec007910ec1e0a5401bbbaf3ef638cf289d7232699588aae9855709b76a6e2f` ; gel `d852eba9`, objet d arbre
  `a9e003b671629ac28498b8bf4c6ea312cce64177`, dirty `1e940e865bb16673…` (journal au stade du plan, Q-2).
- Portes, toutes à 0 : `lint-model-pinning` 0 s, `r25` 0 s, `lang:gate` 2 s, `export:check` 2 s, `gate:vocab` 1 s, `typecheck` 8 s,
  `lint` 20 s, `lint:ratchet` 21 s (statiques, hors verrou) ; `test` 430 s sous verrou (attente 0 s) : **1 855 tests, 1 851 verts,
  0 échec, 4 sautés** ; le test 42 une fois, dans la suite (l.2033 du journal de la porte `09-test.log`). C-V-4 : 16 541 Mo libres,
  5 `node.exe`. Les trois tests du lot verts dans la suite (l.471, l.484, l.485 de `09-test.log`).

## 10. R-25

- Porte `r25` de l oracle (`02-r25.log`) : `STAT` **116 insertions, 3 suppressions, 119 lignes** (borne CI `VIBEGATES_PR_LIMIT` = 1 205 ;
  borne de la mission 1 150) ; `CONTENT_STAT` 0. Détail : `history-read.ts` +6 / -2, `dojo-history-collect.test.ts` +9 / -1,
  `dojo-history-ins.test.ts` +101 ; ce journal exclu (ci.yml l.82).

## 11. Brouillon de la ligne datée de l ADR (à écrire par l orchestrateur dans `docs/adr/ADR-DOJO-PR-2B.md`, jamais par le G1)

> - **Ligne datée du 2026-10-01 (lot HISTORY-INS ; D-8 (vi) l.370 ; ajout seul)** : la liste fermée de (vi) est étendue de cinq types et
>   de rien d autre : `initializeAccount` et `approve`, vus « proches » du mint en phase B de la course provisoire (3 et 1 fois sur 25 409
>   transactions des pages brutes `F:/PRODUITS/dojo-history/provisional-2026-10-01/evidence/raw/B/helius/` ; sondes `scan-ins2.mjs`
>   `d2587478…`, `probe-shapes.mjs` `60bf0811…`, `probe-owner.mjs` `2c9a10e6…`), et leurs voisins de même classe `initializeAccount2`,
>   `approveChecked` et `revoke`. Aucun n entre dans l offre (`SUPPLY_TYPES` inchangé : `mintTo`, `mintToChecked`, `burn`, `burnChecked`) ;
>   aucun ne fournit un solde (les soldes viennent de `pre/postTokenBalances`) ; le repli de propriétaire de D-5 l.329 lit `info.owner` des
>   seuls `initializeAccount*` (formes `jsonParsed` de `parse_token.rs` l.92-127, l.180-219, l.388-410, copie `50370cf4…`, FAITS L-10).
>   Une instruction non analysée et tout autre type restent refusés (`instruction_not_allowed`). Dans les quatre transactions observées,
>   chaque entrée du mint porte son propriétaire : le repli n y est pas atteint. Tests : `dojo_history_ins_added_types_pass_near_the_mint`,
>   `dojo_history_ins_unknown_and_unparsed_still_stop`, sonde positive de `dojo_history_budget_stops_fail_closed` ; F2P et trois tueurs
>   tués (`RED-PROOF.json` `aee325f2…`).

## 12. Questions et écarts (Q-n)

- **Q-1 (sortie non déclarée, forcée par la décision)** : `apps/dojo/test/dojo-history-collect.test.ts` n est pas dans « À créer ». Sa
  sonde de composition l.199 (base) prenait `"approve"` comme exemple de type REFUSÉ : au gel, sans ce changement, `approve` admis, la
  phase B ne s arrête plus et le test rougit. Changement minimal (+9 / -1) : `freezeAccount` à la place, sonde positive `approve`, ligne
  tueur. Le test est jugé par `red-proof` (F2P, tueur tué, §8). À accepter ou refaire par l orchestrateur.
- **Q-2 (oracle et journal)** : l oracle complet a gelé l arbre à 17:50Z (`d852eba9`, dirty `1e940e86…`), journal au stade du plan
  (§1-§4) ; les trois fichiers de code et de test y ont les sha256 de la livraison ; seul ce journal diffère (`docs/G1-lot-*.md`, hors
  R-25, lu par aucun test du lot). Le gel de l orchestrateur portera le journal final ; G2 et cp-2 rejouent (CA-9).
- **Q-3 (sémantique du programme, non lue, non porteuse)** : que `approve`, `approveChecked`, `revoke`, `initializeAccount` et
  `initializeAccount2` ne changent ni un solde ni l offre est une propriété du programme Token-2022, NON lue dans ce lot (aucun réseau).
  Elle ne porte pas la sûreté : un solde n est jamais lu d une instruction (pre/post seulement, chaînés par (iii)) ; une frappe ou un
  brûlage caché sous un type admis rendrait Σ(post - pre) différent des frappes moins brûlages : arrêt `supply_mismatch` du (i) par
  transaction. Item formé FAITS-TOKEN2022-PROCESSOR-1 (lecture sur place par l orchestrateur ; source candidate, non lue : dépôt
  `solana-program/token-2022`, `program/src/processor.rs`, fonctions de traitement de InitializeAccount, Approve, Revoke) ; déclencheur :
  avant la ligne datée du §11 si l orchestrateur veut cette sémantique au niveau [lu].
- **Q-4 (formes sans occurrence réelle)** : `initializeAccount2`, `approveChecked` et `revoke` n apparaissent pas en phase B ; leurs formes
  reposent sur `parse_token.rs` [lu] (branche `master` du 2026-09-26, non épinglée à la version des opérateurs : réserve de FAITS L-10).
  Une forme servie autrement (par exemple sans `owner`) passe (vi) sur son type, et le repli ne trouve pas de propriétaire chaîne : dernier
  propriétaire admis, sinon `owner_unknown` (fail-closed, jamais un propriétaire faux).
- **Q-5** : les sondes de l orchestrateur `F:/tmp/dojo/scan-ins.mjs` et `scan-ins2.mjs` portent une copie de la liste de 15 types : elles
  signaleront les cinq comme hors liste tant qu elles ne sont pas mises à jour (hors dépôt).
- **Q-6** : la prose de D-8 (vi) l.370 énumère les 15 types ; la ligne datée (§11) reste à écrire par l orchestrateur.
  `docs/G1-lot-dojo-pr2b1.md` l.39 (« readonly [15 types] ») est un journal historique, non touché.
- **Q-7 (information)** : un des trois `initializeAccount` observés initialise un compte qui se possède (`owner === account`) ; sans effet
  sur la lecture (le propriétaire vient de l entrée `post`, égal à `info.owner`).
- **Q-8 (écart d outillage, `error_origin` : G1)** : mon premier `git status --porcelain` dans le worktree (vers 17:28:2xZ) est parti sans
  `GIT_OPTIONAL_LOCKS=0` ; l index du worktree (`F:/Monark/.git/worktrees/Monark-wt-hins/index`) porte la date 17:28:24.84Z, inchangée
  depuis : un rafraîchissement opportuniste des stats par ce `status` est probable (ou la fin de la création du worktree, HEAD à
  17:27:37Z). Aucun changement de contenu, d objet ni de référence ; ni add, ni commit, ni stash.

## 13. Fin du G1 (§ de fin)

- **Verdict proposé : LIVRE-AVEC-RESERVES**, la réserve étant Q-1 seule (fichier de test modifié hors des sorties déclarées, forcé par la
  décision ; jugé F2P, tueur tué). Q-3 est un item formé, non bloquant ; Q-2 et Q-8 sont consignés.
- **Types ajoutés** (en fin de `DOJO_HISTORY_INSTRUCTIONS`, 20 types) : `initializeAccount`, `initializeAccount2`, `approve`,
  `approveChecked`, `revoke`. Aucun autre ; `unparsed` et tout type inconnu restent refusés (`instruction_not_allowed`).
- **Mesures** : R-25 119 lignes (116 + 3) ; tests de l historique 35 sur 35 sur un clone ; `red-proof` sortie 0, 3 F2P, 3 tueurs tirés et
  tués (`RED-PROOF.json` `aee325f2…`) ; oracle G1 sortie 0, 9 portes à 0, 1 851 verts sur 1 855, 0 échec, 4 sautés (`aec00791…`).
- **Sorties** : `docs/G1-lot-history-ins.md` (ce journal), `apps/dojo/src/history-read.ts`, `apps/dojo/test/dojo-history-ins.test.ts`,
  `apps/dojo/test/dojo-history-collect.test.ts` (Q-1) ; hors dépôt : `F:/tmp/dojo/hins/` (clone, `f2p/`, sondes, copie de
  `parse_token.rs`, `history-tests.txt`, `oracle-g1.txt`) et `F:/tmp/dojo/hins-deliver/` (`REPONSE.md`, `DELIVERED.sha256`).
- **Déclarations** : aucun `GIT_DIR` ni `GIT_WORK_TREE` posé ; aucun `--write-tree`, aucun `git write-tree` ; aucun git écrivant dans le
  worktree ni dans `F:/Monark` (clone et checkout seulement sous `F:/tmp/dojo/hins/clone` ; Q-8 pour l index) ; aucun réseau, aucune
  clé ; `TEMP`, `TMP` et `TMPDIR` = `F:/tmp/dojo/hins/tmp` pour chaque course (vide à 17:59Z) ; jonction `node_modules` du clone posée par
  `mk-nm.ps1` à 17:47Z et retirée par `rm-nm.ps1` à 17:59:13Z ; `F:/Monark/node_modules` lu seulement ; aucun oracle arrêté ; aucune
  adresse IP écrite ; rien commis (R-20).
- Ligne datée de l ADR : brouillon au §11, à écrire par l orchestrateur.
