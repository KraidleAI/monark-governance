# claude-opus-5-5

# G1 : journal du lot HISTORY-INS-2 (liste fermée D-8 (vi) étendue de trois types sans effet sur un solde ni sur l offre)

- Mission : `F:/tmp/dojo/mission-hins2.md` sha256 `3874de321cf75e9a2efaca233ecf25df47335a1708a72bc1cf64158c15ed6ffd` (recalculé à 20:00Z, égal).
- Modèle résolu : `claude-opus-5-5`, effort `max` (R-1). Rôle G1, instance fraîche. Début 2026-10-01T20:00:04Z (`date -u`).
- Worktree `F:/Monark-wt-hins2`, branche `lot/history-ins-2`, HEAD = base `4a4ceb7ca7f42cf2b7f044119a62d6c56a1f050c` (lu par `git rev-parse HEAD`) ;
  `git --no-optional-locks status --porcelain` vide à 20:00Z.
- Règles : `F:/Monark/docs/methode/REGLES-MISSION.md` `6470002592fe9c18…` (égal à la mission) ; aucun git écrivant, aucun `GIT_DIR`, aucun
  `--write-tree`, aucun réseau ; `F:/Monark-wt-page-v1` jamais lu ni touché (la sonde du §2 lit le mint du worktree du lot).

## 1. Lecture (avant tout code)

Entrées lues en entier, dans l ordre de la mission ; sha256 à la base, relevés à 20:15:46Z :
- `apps/dojo/src/history-read.ts` `97ece3105e630594…` : liste l.24-31 (20 types : les 15 de D-8 (vi) l.28-30, les cinq de HISTORY-INS l.31),
  `SUPPLY_TYPES` l.32, `UNPARSED` l.34, règle « proche » l.111-118, offre l.120-123, clé l.128-132, (vi) l.205-207, repli de propriétaire l.257.
- `apps/dojo/src/history-build.ts` `c3f87f4146ca811f…` : `side` l.69-75 (même repli, l.72), `moves` l.84 (lit `t.supply` seul).
- `apps/dojo/test/dojo-history-ins.test.ts` `c8a98a54f7b25e0b…` : épingle l.88 (exactement 20 types) ; tueurs l.62 (`history-read.ts:31`) et
  l.85 (`history-read.ts:206`).
- `docs/G1-lot-history-ins.md` `0c86b0a172caed54…` : modèle de ce journal ; sa Q-1 (test existant modifié, forcé par la décision).
- `docs/adr/ADR-DOJO-PR-2B.md` `7971937ce9c24938…` (1 022 l.) : D-5 l.310-329 (propriétaire absent l.329) ; D-8 l.361-371, (vi) l.370 (« tout
  autre type […] est consigné, et une ligne datée étend la liste ») ; ligne datée HISTORY-INS l.1005-1015 ; G2 ciblée de HISTORY-INS l.1016-1022.
- `F:/tmp/dojo/hins/parse_token.rs` `50370cf477d4d526…88c0` (2 294 l., égal à la mission).
- `F:/tmp/dojo/scan-ins2.mjs` `68c99f305ffb7e30…` : liste de 20 types (mise à jour depuis la Q-5 de HISTORY-INS), même règle « proche ».
- `F:/Monark/scripts/red-proof.mjs` `6579b55080ac0081…` : `KILLER` l.33, `parseKiller` l.46-49, convention l.18-24 ; un test modifié n est admis
  que rouge à la base par `ERR_ASSERTION` (l.170, l.173 : vert à la base = « self-confirming », refusé).
- Tueurs qui visent `history-read.ts` (recherche dans le worktree) : `dojo-history-collect.test.ts` l.150 (`:206`), `dojo-history-ins.test.ts`
  l.62 (`:31`) et l.85 (`:206`). Toute ligne ajoutée au-dessus de l.206 les rendrait faux.

Formes `jsonParsed` [lu] dans `parse_token.rs` :
- `withdrawExcessLamports` l.636-655 : `{source: accounts[0], destination: accounts[1]}` + signataire `authority`, ou `multisigAuthority` et
  `signers` (`parse_signers` l.937-961). Ni `mint`, ni `account`, ni `owner`, ni montant.
- `amountToUiAmount` l.495-504 : `{mint: accounts[0], amount: <chaîne décimale>}` ; test l.1820-1837 (`"4242"`).
- `uiAmountToAmount` l.505-514 : `{mint: accounts[0], uiAmount: <chaîne>}` ; test l.1839-1857 (`"42.42"`, une chaîne).
- `reallocate` l.546-548 : rendu par `parse_reallocate_instruction`, importé du module `extension` (l.9 `reallocate::*`, l.28 `mod extension;`)
  et jamais défini dans cette copie (recherche : trois occurrences seulement, l.9, l.546, l.547) : sa forme ne s y lit pas.
- Lus, hors décision : `unwrapLamports` l.709-731 (`{source, destination, amount?}` + signataire) ; `batch` l.737-742 et l.769-809
  (`info = {instructions: [...]}`).

## 2. Compte (mesuré, lecture seule, aucun réseau)

- Sonde `F:/tmp/dojo/hins2/probe-ins2.mjs` (sha256 `9bde20e5ae20582d6220b389ea899d3bff329f8f640de5dca86e1f069ab3fece`) : la règle « proche » de
  `readBody` et de `scan-ins2.mjs`, la liste de 20 recopiée, le mint lu dans `F:/Monark-wt-hins2/out/mint.txt` (`9b4e275a…decb`, égal à l épingle
  de D-1) ; pour les types surveillés (`withdrawExcessLamports`, `amountToUiAmount`, `uiAmountToAmount`, `reallocate`, `unwrapLamports`, `batch`),
  chaque occurrence, proche ou non : clés, clés qui la rendent proche, `err`, soldes du compte nommé, propriétaires présents.
- Phase C (`F:/PRODUITS/dojo-history/provisional-2026-10-01-r2/evidence/raw/C/{helius,chainstack}/`, 4 060 fichiers et 1 464 transactions chez
  chacun ; 20:11:07Z-20:11:08Z) : **`withdrawExcessLamports` x5 hors liste, rien d autre** ; mêmes cinq signatures chez les deux opérateurs
  (`5LAPTWchZXW2tfjL`, `4ZLH38MBj13rCyRk`, `5HegJY6q1P5L7TTT`, `52usG4w8qNrC1SHJ`, `5vZmsqy9thsAmr3V`). Égal au compte de la mission.
  - Chacune est proche par `source` = un compte de jetons du mint (jamais le mint lui-même), une seule fois par transaction ; `err` nul ; le
    solde du compte nommé est inchangé (32 762 723 253, 6 091 824 878 581 et trois fois 0, avant = après) ; toute entrée du mint porte un `owner`.
  - Par opérateur, 109 `withdrawExcessLamports` dans 22 transactions, dont 104 loin du mint ; aucun `amountToUiAmount`, `uiAmountToAmount`,
    `reallocate` ni `unwrapLamports` ; `batch` compté partout, proche ou non : 0. Sortie `probe-c.out` `d3cf03b838727a6c…`.
- Phase B (`raw/B/helius/` 255 pages, 25 424 transactions ; `raw/B/chainstack/` 19 631 corps ; 20:11:26Z-20:11:33Z) : **aucun type hors
  liste** ; `withdrawExcessLamports` x3 dans deux transactions, jamais proche ; `batch` 0. Sortie `probe-b.out` `81dbd63266ab4498…`.

## 3. Vérification au code (décisions de l orchestrateur, point 2)

- **Offre** : `SUPPLY_TYPES` (l.32) = `mintTo`, `mintToChecked`, `burn`, `burnChecked` ; l offre d un corps (l.120-123) ne retient que ces types
  avec `info.mint === mint` ; `checkSupply` (l.174-180), `admit` (l.163) et `moves` (history-build l.84) ne lisent que `tx.supply`.
  `amountToUiAmount` porte `mint` et `amount` comme `mintTo` mais n est pas dans `SUPPLY_TYPES` : aucun des trois n entre dans l offre.
- **Soldes** : un solde lu ne vient que de `pre/postTokenBalances` (l.101-109) ; `amountOf` (l.141) et `side` (l.254-260 ; history-build
  l.69-75) ne lisent que `b.mint`. Un type n agit que par la clé (l.129, types triés de `ins`, indépendants de la liste), l offre (ci-dessus),
  (vi) (l.206), le repli de propriétaire (l.257 ; history-build l.72) et (iv) (`initializeMint2`, l.190) ; `history-collect.ts` ne fait
  qu appeler `checkSupply` et `checkInstructions` (l.371).
- **Repli de propriétaire** : l.257 prend le premier élément de `ins` dont le type commence par `initializeAccount` **et** dont `info.account`
  est le compte, puis lit `info.owner` (même règle en history-build l.72). Aucun des trois types ne commence par `initializeAccount`, et aucune
  de leurs formes ne porte `account` ni `owner` : ils n alimentent jamais le repli.
- **Conclusion** : `withdrawExcessLamports`, `amountToUiAmount` et `uiAmountToAmount` sont ajoutés ; **`reallocate` ne l est pas** (sa forme
  ne se lit pas dans la copie : condition de la décision non remplie). Aucun autre type ; `unparsed` et tout type inconnu restent refusés.
- **Sémantique du programme Token-2022 (non lue, non porteuse)** : comme pour HISTORY-INS (FAITS-TOKEN2022-PROCESSOR-1, clos par la mesure,
  ADR l.1016-1022), la sûreté n en dépend pas : une frappe ou un brûlage cachés sous un type admis rendent Σ(post - pre) différent des
  frappes moins les brûlages, arrêt `supply_mismatch` du (i) par transaction ; le test neuf le rejoue sous `withdrawExcessLamports`.

## 4. Plan (avant code)

1. `history-read.ts` : les trois types EN FIN de la l.31, après les cinq de HISTORY-INS. La ligne mesure alors 160 caractères exactement (mesuré,
   `awk`, brouillon `F:/tmp/dojo/hins2/draft-l31.txt`) : aucune ligne ajoutée. Le commentaire de la liste (l.24-27) est réécrit dans ses quatre
   lignes. La boucle de (vi) reste en l.206 et `initializeAccount2` en l.31 : les trois tueurs existants restent valides sans retouche, et
   `dojo-history-collect.test.ts` n est pas touché. Rien d autre (`SUPPLY_TYPES`, `readBody`, `readKey`, repli, `history-build.ts` inchangés).
2. Test neuf `apps/dojo/test/dojo-history-ins2.test.ts`, deux tests, variantes SYNTHÉTIQUES de C1 et de `mk` (modèle : le test de HISTORY-INS) :
   - (A) `dojo_history_ins2_added_types_pass_near_the_mint` : chaque type ajouté, aux formes de `parse_token.rs`, proche du mint de C1
     (`withdrawExcessLamports` par `source` = BMAH, compte du mint dans C1, comme les cinq observés, puis par `source` = le mint ;
     `amountToUiAmount` avec un `amount` non nul ; `uiAmountToAmount` en chaîne), est lu dans `ins` (cas non vide), passe (vi), laisse
     `supply` et les entrées du mint égales à celles de C1, et (i) tient. Le repli ne prend jamais leur propriétaire : variante SYNTHÉTIQUE
     déclarée `{...info, account: "C", owner: "O4"}` ⇒ `owner_unknown` (le repli est gardé par le type, non par les clés). Un solde glissé
     sous `withdrawExcessLamports` ⇒ `supply_mismatch`. Tueur : `history-read.ts:31 CONST "withdrawExcessLamports" -> "withdrawExcessLamportz"`.
   - (B) `dojo_history_ins2_unknown_freeze_and_unparsed_still_stop` : épingle de la liste fermée (23 types recodés ; ni `unparsed`, ni
     `reallocate`) ; seuls, puis APRÈS chacun des trois types ajoutés : un type inconnu, `freezeAccount` (la sonde refusée), une instruction
     non analysée sur BMAH, `reallocate` (non retenu), `unwrapLamports` (voisin de la classe des lamports, non décidé) et des noms qui
     prolongent un type ajouté (égalité exacte, jamais un préfixe) arrêtent `instruction_not_allowed` en nommant le refusé. Tueur : l égalité
     de la liste remplacée par un préfixe, `history-read.ts:206 ROR ".includes(i.type)" -> ".some((t) => i.type.startsWith(t))"`.
3. `dojo-history-ins.test.ts` (Q-1, forcé par la décision) : l épingle l.88 (exactement 20 types) rougit dès l ajout. Changement minimal :
   l épingle étendue aux 23 types (les trois noms recodés), commentaire l.87 mis à jour ; le test reste rouge à la base par `ERR_ASSERTION`
   (exigence de `red-proof` pour un test modifié) ; son tueur l.85 (`:206`) reste valide.
4. Portes : clone `--no-local` de `F:/Monark` à `4a4ceb7c` sous `F:/tmp/dojo/hins2/clone`, fichiers du lot copiés, `node_modules` par
   `mk-nm.ps1` ; tests de l historique (`ins2`, `ins`, `read`, `build`, `provisional`, `collect`) ; `red-proof` `--draw 3 --seed 2026`
   (`TEMP`, `TMP`, `TMPDIR` = `F:/tmp/dojo/hins2/tmp`) ; puis oracle du tronc `--role G1` complet (statiques hors verrou, suite sous verrou),
   `GIT_OPTIONAL_LOCKS=0`, verrou libre seulement ; `rm-nm.ps1` à la fin.

Compte R-25 attendu : `history-read.ts` +5 / -5, test neuf ≈ 110 à 130, `dojo-history-ins.test.ts` ≈ +3 / -2 : ≈ 130 à 150 lignes (ce journal
exclu, ci.yml l.82). Borne 1 150.

## 5. Code (fait après le §4 et avant 20:22:55Z, heure du `git diff` relevé)

- `apps/dojo/src/history-read.ts` (sha256 au gel `91eda47100e4967731c05c3bc68f999a6109f4e6cea2f341af5328da625a45e2`, 282 l. comme à la base) :
  commentaire de la liste l.24-27 réécrit dans ses quatre lignes (149, 143, 149 et 160 caractères) ; l.31 : `"withdrawExcessLamports",
  "amountToUiAmount", "uiAmountToAmount"` ajoutés après `"revoke"`, en DERNIER (160 caractères). `git diff --stat` : 5 insertions, 5
  suppressions. La boucle de (vi) reste en l.206, `SUPPLY_TYPES` en l.32 ; rien d autre ne change (ni `readBody`, ni `readKey`, ni le repli,
  ni `history-build.ts`).
- Les 14 lignes de plus de 160 caractères que la garde signale dans ce fichier (l.49, 71, 81, …, 273) sont antérieures au lot : aucune n est
  dans le diff, et la version de base (`git show`, `97ece310…`) porte les mêmes 14 lignes aux mêmes longueurs (garde relue vers 20:34Z).
  Garde d octets : 0 octet interdit.

## 6. Tests (faits) et tueurs

- `apps/dojo/test/dojo-history-ins2.test.ts` (neuf, 118 l., sha256 `71fabec5194ec57d4061f806e20a8ce1a16439d0bc72d75e4daa1d8c6200ac4d`) :
  - l.75 `dojo_history_ins2_added_types_pass_near_the_mint` : cinq formes (l.61-67) : `withdrawExcessLamports` proche par `source` = BMAH
    (comme les cinq observés), par `source` = le mint, et avec `multisigAuthority` et `signers` ; `amountToUiAmount` `{mint, amount: "4242"}` ;
    `uiAmountToAmount` `{mint, uiAmount: "42.42"}`. Chacune : lue dans `ins` (cas non vide), (vi) passe, `supply` et entrées du mint égales à
    celles de C1 (avec un `amount` non nul, `amountToUiAmount` prouve la garde par `SUPPLY_TYPES`), (i) tient ; les cinq ensemble passent (vi).
    Un solde de BMAH glissé de -5 ou de +5 sous chaque forme (aide `slipped`, l.34-40) : `supply_mismatch`. Repli : `initializeAccount3`
    l alimente (`C=9/O4`, cas non vide) ; la variante SYNTHÉTIQUE `{...info, account: "C", owner: "O4"}` de chaque forme ne l alimente jamais
    (`owner_unknown`). Tueur l.74 : `apps/dojo/src/history-read.ts:31 CONST "withdrawExcessLamports" -> "withdrawExcessLamportz"`.
  - l.102 `dojo_history_ins2_unknown_freeze_and_unparsed_still_stop` : ÉPINGLE (décision « aucun autre type ») : la liste triée égale les 15
    types de D-8 (vi), les cinq de HISTORY-INS et les trois de HISTORY-INS-2, recodés ; ni `unparsed` ni `reallocate`. Puis `someUnknownType`,
    `freezeAccount`, `reallocate`, `unwrapLamports`, `withdrawExcessLamports2`, `amountToUiAmountAll`, `uiAmountToAmounts` et une instruction
    non analysée sur BMAH arrêtent `instruction_not_allowed`, seuls et placés APRÈS chacune des cinq formes ajoutées (l arrêt nomme alors le
    refusé). Tueur l.101 : `apps/dojo/src/history-read.ts:206 ROR ".includes(i.type)" -> ".some((t) => i.type.startsWith(t))"` (égalité de la
    liste remplacée par un préfixe : seuls les noms qui prolongent un type ajouté le tuent).
- `apps/dojo/test/dojo-history-ins.test.ts` (Q-1 ; sha256 au gel `322888fad0b2fc09f75f7a947a68fa90034e2b6cc41bbd158e6d58a587e05a7e`, +3 / -2) :
  constante `INS2` l.61 (les trois noms, recodés) ; épingle l.89 étendue (`...INS2`) et son commentaire l.88. Ses tueurs, déplacés d une ligne
  (l.63 et l.86), visent toujours `history-read.ts:31` et `:206`, dont le texte n a pas bougé.
- Les onze tueurs des trois fichiers d historique se lisent par `parseKiller` du tronc et leur texte « avant » figure exactement une fois sur la
  ligne visée, au gel (contrôle à 20:21Z, refait sur les fichiers finaux à 20:36:57Z ; dont `dojo-history-collect.test.ts:150`,
  `history-read.ts:206`, fichier non touché).
- Contrôles statiques sur le clone (20:24:40Z-20:25:13Z) : `tsc --noEmit` 0 ; `eslint` des trois fichiers 0 ; `lint-ratchet` **69/69**, et
  69/69 aussi à la base (même clone, versions de base restituées par `git show`, test neuf écarté, puis tout remis et vérifié par sha256,
  20:25:3xZ-20:26:03Z) : le lot n ajoute aucune violation ; le plafond n a aucune marge (Q-8).

## 7. Tests de l historique sur un clone

- Clone `--no-local` de `F:/Monark` à `4a4ceb7c` en `F:/tmp/dojo/hins2/clone` (20:23:15Z-20:23:30Z), les trois fichiers du lot copiés (sha256
  égaux), `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark`, 0 échec, 20:23:35Z), verrou d hôte absent (lu à 20:23:10Z et 20:23:43Z) ;
  C-V-4 : 16 512 Mo physiques et 33 364 Mo virtuels libres, 5 `node.exe`.
- `node --test --test-reporter=spec --test-timeout=120000 --test-force-exit "--test-skip-pattern=[(]test 42[)]"` sur `dojo-history-ins2`,
  `-ins`, `-read`, `-build`, `-provisional`, `-collect` (20:23:43Z-20:24:25Z) : **37 tests, 37 verts, 0 échec**, sortie 0 ;
  `F:/tmp/dojo/hins2/history-tests.txt` sha256 `873373eada91cc5d11f924101b0adb6e83db9108a2e2c3890dc9f50f246096de` ; `tmp` vide après.

## 8. F2P (`red-proof.mjs` du tronc, `6579b550…ab36`)

- `node F:/Monark/scripts/red-proof.mjs --base 4a4ceb7ca7f42cf2b7f044119a62d6c56a1f050c --gel F:/Monark-wt-hins2 --repo
  F:/tmp/dojo/hins2/clone --out F:/tmp/dojo/hins2/f2p --draw 3 --seed 2026`, `TEMP`, `TMP`, `TMPDIR` = `F:/tmp/dojo/hins2/tmp`
  (20:26:24Z-20:26:42Z) : **sortie 0, « red-proof OK: 3 judged, 1 unchanged, 3 killer(s) drawn »** ; `F:/tmp/dojo/hins2/f2p/RED-PROOF.json`
  sha256 `c5484a158cd65fbd92053dd7f6145359b606f3062f966b06cce7c15d2190b5db` (`ok: true`, digest
  `7b2b5ed8a54e54375d2e930f9b9c05649bc0ff40c2d6eb77a70c22758ea06a2f`, population 3, graine 2026).
- Les trois tests jugés : `assert-fail` à la base, `pass` au gel, F2P, `killerProblem` nul ; le test (A) de HISTORY-INS, inchangé, n est pas
  jugé. Rouge à la base (`base.tap` `2f30c0086ada466e…`), tous `ERR_ASSERTION` : l épingle de HISTORY-INS (20 contre 23) ; le test (A) neuf,
  « Got unwanted exception » sur `instruction_not_allowed: …: withdrawExcessLamports` ; l épingle du test (B) neuf.
- Les trois tueurs tirés : **tués**, fichier restauré (sha256 avant = après) : `killer-1.tap` `f3550fc38e3c1706…` (CONST l.31 :
  `withdrawExcessLamports` refusé) ; `killer-2.tap` `482fad362656bb60…` (SDL l.206 : « Missing expected exception. ») ; `killer-3.tap`
  `aa05ee78c56a1b6c…` (ROR l.206 : « Missing expected exception. »).

## 9. Portes : oracle du tronc, rôle G1

- `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-hins2 --base 4a4ceb7ca7f42cf2b7f044119a62d6c56a1f050c`, lancé à
  20:27:23Z après la fin de `red-proof` (verrou absent, C-V-4 lu : 16 540 Mo physiques, 33 519 Mo virtuels libres, 4 `node.exe`),
  `GIT_OPTIONAL_LOCKS=0`, aucune autre course ni harnais pendant sa suite : **sortie 0** à 20:35:57Z ; enregistrement
  `F:/tmp/oracle-results/4a4ceb7ca7f42cf2b7f044119a62d6c56a1f050c-5518ebe3ffa5fb00-G1-20261001T202728Z-16640.json` sha256
  `62370fbaa0592b86e0ea106bef98eb3491fa966a37d0526cc8e9982e4ad17af1` ; gel `5518ebe3…` (dirty), objet d arbre
  `0db71a7fe0afc9b3509de96646923571c7abe410` (journal au stade du plan, Q-2).
- Portes, toutes à 0 : `lint-model-pinning` 0 s, `r25` 0 s, `lang:gate` 2 s (« 0 non-exempt French hit »), `export:check` 1 s,
  `gate:vocab` 1 s (« scanned 330 file(s), no forbidden claim »), `typecheck` 8 s, `lint` 19 s, `lint:ratchet` 22 s (69/69) (statiques,
  hors verrou) ; `test` 433 s sous verrou (attente 0 s ; C-V-4 : 16 263 Mo libres, 6 `node.exe`) : **1 857 tests, 1 853 verts, 0 échec,
  4 sautés** ; le test 42 une fois, dans la suite (l.2035 de `09-test.log`) ; les quatre tests d instructions verts (l.484-487). Le
  répertoire de course a été retiré par l oracle (`F:/tmp/oracle-runs/run-AtcGzu` absent à 20:36:38Z), verrou rendu.

## 10. R-25

- Porte `r25` de l oracle (`02-r25.log`, `r25.mjs` du tronc `4d0544df…`) : `STAT` **126 insertions, 7 suppressions, 133 lignes** (borne CI
  `VIBEGATES_PR_LIMIT` = 1 205 ; borne de la mission 1 150) ; `CONTENT_STAT` 0. Détail : `history-read.ts` +5 / -5,
  `dojo-history-ins.test.ts` +3 / -2, `dojo-history-ins2.test.ts` +118 ; ce journal exclu (ci.yml l.82).

## 11. Brouillon de la ligne datée de l ADR (à écrire par l orchestrateur dans `docs/adr/ADR-DOJO-PR-2B.md`, jamais par le G1)

> - **Ligne datée du 2026-10-01 (lot HISTORY-INS-2 ; D-8 (vi) l.370 ; ajout seul)** : la liste fermée de (vi) est étendue de trois types et
>   de rien d autre : `withdrawExcessLamports`, vu « proche » du mint en phase C de la course provisoire `provisional-2026-10-01-r2` (5
>   transactions sur les 1 464 des bruts de la phase C, les mêmes chez les deux opérateurs, chaque fois par `source` = un compte de jetons du
>   mint, dont le solde ne bouge pas ; phase B : aucun type hors liste ; sonde `probe-ins2.mjs` `9bde20e5…`, sorties `probe-c.out`
>   `d3cf03b8…` et `probe-b.out` `81dbd632…`), et ses voisins de même classe `amountToUiAmount` et `uiAmountToAmount` (formes `jsonParsed`
>   de `parse_token.rs` l.495-514 et l.636-655, copie `50370cf4…`, FAITS L-10). Aucun n entre dans l offre (`SUPPLY_TYPES` inchangé :
>   `mintTo`, `mintToChecked`, `burn`, `burnChecked`) ; aucun ne fournit un solde (les soldes viennent de `pre/postTokenBalances`) ; aucun
>   n alimente le repli de propriétaire de D-5 l.329 (seuls les `initializeAccount*`). `reallocate` n est pas ajouté : sa forme
>   (`parse_reallocate_instruction`, module `extension`) ne se lit pas dans la copie (item FAITS-TOKEN2022-PARSER-REALLOCATE-1). Une
>   instruction non analysée, `freezeAccount` et tout autre type restent refusés (`instruction_not_allowed`). Tests :
>   `dojo_history_ins2_added_types_pass_near_the_mint`, `dojo_history_ins2_unknown_freeze_and_unparsed_still_stop`, épingle de
>   `dojo_history_ins_unknown_and_unparsed_still_stop` étendue à 23 types ; F2P et trois tueurs tués (`RED-PROOF.json` `c5484a15…`).

## 12. Questions et écarts (Q-n)

- **Q-1 (sortie non déclarée, forcée par la décision)** : `apps/dojo/test/dojo-history-ins.test.ts` n est pas dans « À créer ». Son épingle
  (l.88 à la base) fixait exactement les 20 types : avec 23, elle rougit au gel. Changement minimal (+3 / -2) : constante `INS2`, épingle
  étendue, commentaire. Jugé F2P par `red-proof`, tueur SDL l.206 tué (§8). À accepter ou refaire par l orchestrateur.
- **Q-2 (oracle et journal)** : l oracle a gelé l arbre à 20:27:28Z (dirty `5518ebe3…`), journal au stade du plan (§1-§4) ; les trois
  fichiers de code et de test y ont les sha256 de la livraison ; seul ce journal diffère (`docs/G1-lot-*.md`, hors R-25, lu par aucun test).
  Le gel de l orchestrateur portera le journal final ; G2 et cp-2 rejouent (CA-9).
- **Q-3 (`reallocate` non ajouté ; item formé FAITS-TOKEN2022-PARSER-REALLOCATE-1)** : la condition de la décision n est pas remplie (§1,
  §3). Demande de lecture (orchestrateur, lecture sur place) : la définition de `parse_reallocate_instruction`, dans le module `extension`
  de `https://raw.githubusercontent.com/anza-xyz/agave/master/transaction-status/src/parse_token.rs` (source de la copie, FAITS
  `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` l.32, L-10, lue le 2026-09-26 à 15:55, branche `master` non épinglée) ; par la règle des
  modules Rust (l.28 `mod extension;`, l.9 `reallocate::*`), un fichier sous `transaction-status/src/parse_token/extension/` : chemin
  déduit, non lu. Tentative faite : recherche dans la copie locale, trois occurrences, aucune définition. Usage : fixer la forme
  `jsonParsed` de `reallocate` avant toute ligne datée qui l ajouterait. Déclencheur : un arrêt `instruction_not_allowed` nommant
  `reallocate`, ou une ligne datée qui le voudrait avant. Mesure : 0 `reallocate` dans les bruts des phases B et C (§2).
- **Q-4 (`batch` invisible pour (vi), défaut antérieur au lot, hors périmètre ; item formé DOJO-HISTORY-BATCH-NEAR-1)** : voir §12 bis.
- **Q-5 (sonde de l orchestrateur)** : `F:/tmp/dojo/scan-ins2.mjs` porte une copie de la liste de 20 types : elle signalera les trois ajoutés
  tant qu elle n est pas mise à jour (hors dépôt).
- **Q-6 (références de ligne des tueurs, pour le lot suivant)** : la l.31 est à 160 caractères. Le prochain type ajouté demandera une ligne
  neuve, qui décalera la l.206 : les tueurs `dojo-history-collect.test.ts:150`, `dojo-history-ins.test.ts:86` et `dojo-history-ins2.test.ts:101`
  (cible `:206`) devront suivre, comme `dojo-history-ins.test.ts:63` et `dojo-history-ins2.test.ts:74` (cible `:31`) si leur texte quitte
  la l.31. Information, aucun code.
- **Q-7 (sémantique du programme, non lue, non porteuse)** : que `withdrawExcessLamports` ne déplace que des lamports et que
  `amountToUiAmount` et `uiAmountToAmount` n écrivent aucun compte est une propriété du programme Token-2022, non lue dans ce lot (aucun
  réseau). La sûreté n en dépend pas (§3 ; sonde du solde glissé du test (A)). Comme FAITS-TOKEN2022-PROCESSOR-1 (ADR l.1016-1022), tout
  texte public qui affirmerait cette sémantique rouvrirait la question.
- **Q-8 (cliquet au plafond, information)** : `lint-ratchet` 69/69 à la base comme au gel (§6) : aucune marge ; tout test futur qui ajoute
  une violation `no-unsafe-*` rougira la porte.
- **Q-9 (portée du compte, information)** : la sonde ne voit que les corps lus jusqu à l arrêt de r2 (phase C arrêtée sur le premier type
  hors liste) ; la course reprise peut en rencontrer d autres : l arrêt reste fail-closed et nommé.
- **Q-10 (index du worktree réécrit, origine non établie, `error_origin` à assigner)** : `F:/Monark/.git/worktrees/Monark-wt-hins2/index`
  porte la date 20:27:52.17Z (lu à 20:29:43Z), pendant les portes statiques de l oracle, qui tournaient dans son propre clone. Aucune de
  mes commandes ne tournait à cet instant ; toutes mes commandes git sur le worktree ont porté `--no-optional-locks` ou
  `GIT_OPTIONAL_LOCKS=0` (`red-proof` le pose lui-même, l oracle l a reçu de mon environnement), et les appels du worktree par l oracle et
  par `red-proof` sont finis avant 20:27:39Z. Aucun contenu indexé (`git diff --cached` vide à 20:30Z), HEAD inchangé (`4a4ceb7c`, fichier
  `HEAD` daté de 19:58:35Z, création du worktree), statut limité aux quatre chemins du lot. Hypothèse non vérifiée : un processus hors de
  ma session (rafraîchissement opportuniste d un `git status`). À rapprocher, par l orchestrateur, de ses propres commandes de 20:27Z-20:28Z.

## 12 bis. Q-4 : `batch` invisible pour (vi) (défaut antérieur au lot, mesuré après l oracle)

- Mécanisme [lu] : `history-read.ts` l.116 n ajoute à `ins` une instruction analysée que si une valeur DIRECTE de `info` est proche ;
  `batch` (`parse_token.rs` l.737-742, l.769-809) porte `info = {instructions: [...]}`, dont la seule valeur est un tableau : il n entre
  jamais dans `ins`. (vi) ne le voit pas, ses frappes et brûlages internes n entrent pas dans `supply`, la clé ne porte pas son type. La
  l.116 est hors du diff du lot : le défaut est le même à la base.
- Mesure (script `F:/tmp/dojo/hins2/batch-blind.mjs` `dbaadeec61ac7aec…`, sur le clone au gel, 20:36:38Z ; sortie `batch-blind.out`
  `814d895e0363d790…`) : C1 + un `batch` contenant un `burn` de 5 sur BMAH, solde de BMAH baissé de 5 : `batch` absent de `ins`,
  `supply` vide, (vi) passe, (i) arrête `supply_mismatch` ; même `batch` sans mouvement de solde : (vi) et (i) passent ; un `batch` contenant
  `freezeAccount` (la sonde refusée) : (vi) passe.
- Portée : les soldes restent sûrs (lus dans `pre/postTokenBalances`, chaînés par (iii)), et une frappe ou un brûlage cachés arrêtent (i) ;
  mais la phrase de (vi) l.204 (« every Token-2022 type on the mint or its accounts is in the closed list ») ne vaut pas pour une
  instruction enveloppée dans un `batch`. Compte : 0 `batch` dans les bruts des phases B et C, proche ou non (§2).
- Item formé **DOJO-HISTORY-BATCH-NEAR-1** (règle Dettes, PAROXYSME) : construction candidate : dans `readBody`, une instruction analysée
  dont `info` porte une valeur proche à toute profondeur (tableaux et objets parcourus) entre dans `ins` sous son propre type ; `batch`,
  hors liste, arrête alors (vi) ; prix estimé : 2 à 3 lignes et un test (un `batch` qui touche BMAH arrête `instruction_not_allowed` en le
  nommant). Déclencheur : avant le go de l acte 1 (le journal du collecteur épingle le sha de `history-read.ts`, ligne datée 2b4/Q-G2-4,
  ADR l.1001), ou dès qu un `batch` est observé par une course. Propriétaire : orchestrateur. Aucun code dans ce lot (hors décision).

## 13. Fin du G1 (§ de fin)

- **Verdict proposé : LIVRE-AVEC-RESERVES**, la réserve étant Q-1 seule (fichier de test existant modifié hors des sorties déclarées, forcé
  par la décision ; jugé F2P, tueur tué). Q-3 et Q-4 sont des items formés, non bloquants pour la reprise de la course ; Q-2 et Q-10 sont
  consignés.
- **Types ajoutés** (en fin de `DOJO_HISTORY_INSTRUCTIONS`, 23 types) : `withdrawExcessLamports`, `amountToUiAmount`, `uiAmountToAmount`.
  `reallocate` non ajouté (forme non lisible dans la copie). Aucun autre ; `unparsed`, `freezeAccount` et tout type inconnu restent refusés.
- **Mesures** : compte de la mission rejoué (phase C x5, phase B 0) ; R-25 133 lignes (126 + 7) ; tests de l historique 37 sur 37 sur un
  clone ; `red-proof` sortie 0, 3 F2P, 3 tueurs tirés et tués (`RED-PROOF.json` `c5484a15…`) ; oracle G1 sortie 0, 9 portes à 0, 1 853
  verts sur 1 857, 0 échec, 4 sautés (`62370fba…`) ; cliquet 69/69 à la base comme au gel.
- **Sorties** : `docs/G1-lot-history-ins-2.md` (ce journal), `apps/dojo/src/history-read.ts`, `apps/dojo/test/dojo-history-ins2.test.ts`,
  `apps/dojo/test/dojo-history-ins.test.ts` (Q-1) ; hors dépôt : `F:/tmp/dojo/hins2/` (clone, `f2p/`, sondes et sorties, scripts de
  contrôle, `history-tests.txt`, sorties de l oracle) et `F:/tmp/dojo/hins2-deliver/` (`REPONSE.md`, `DELIVERED.sha256`).
- **Déclarations** : aucun `GIT_DIR` ni `GIT_WORK_TREE` posé ; aucun `--write-tree`, aucun `git write-tree` ; aucun git écrivant dans le
  worktree ni dans `F:/Monark` (sur le worktree : `rev-parse`, `branch --show-current`, `status`, `diff` en `--no-optional-locks` ; clone,
  checkout et `show` seulement sous `F:/tmp/dojo/hins2/clone` ; Q-10 pour l index) ; aucun réseau, aucune clé ; `F:/Monark-wt-page-v1`
  jamais lu ni touché ; `TEMP`, `TMP` et `TMPDIR` = `F:/tmp/dojo/hins2/tmp` pour chaque course (seul résidu : `node-compile-cache`, cache de
  compilation de Node créé par `npx tsc` à 20:24:40Z, laissé en place) ; jonction `node_modules` du clone posée par `mk-nm.ps1` à 20:23:35Z
  et retirée par `rm-nm.ps1` à 20:37:00Z ; `F:/Monark/node_modules` lu seulement (220 entrées, 11 `@monark` à 20:37:13Z) ; aucun oracle
  arrêté ; aucune adresse IP écrite ; aucune sortie, aucun `TEMP` ni cache npm sur C: (`npm config get cache` = `F:/cache/npm`, écrit
  ici en barres obliques ; les caches internes de `powershell.exe`, appelé pour `mk-nm.ps1`, `rm-nm.ps1` et C-V-4, ne sont pas mesurés) ;
  rien commis (R-20).
- Ligne datée de l ADR : brouillon au §11, à écrire par l orchestrateur.
