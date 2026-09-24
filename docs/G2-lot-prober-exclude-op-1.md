# G2 — lot PROBER-EXCLUDE-OP-1 (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-prober/G2.md` (sha256 d4d7ef064f314d54602883aa74ca297ae36666ad4cf1e7805c8ebd290006103c). Verdict : PASS-AVEC-CORRECTIONS (C-G2-1 tests déclaratifs → item PROBER-EXCLUDE-OP-TESTS-1 ; C-G2-2 citation `u4b-reduce.mjs:64-77` + note forme `=` ; C-G2-3 sources du compte drpc) — aucune ne bloque la passe 4 ; 11/11 mutants G1 + 7/7 propres tués, 3 sondes survivantes déclaratives ; oracle lot et fusion 6 portes 0 + test 42 EPERM (item existant) ; R-25 147 ; A-6 aux 5 commits.

---

# G2 — lot PROBER-EXCLUDE-OP-1 — relecteur contexte frais

- Relecteur : worker G2, modèle résolu déclaré `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` — R-1), effort max.
- Périmètre : `lot/prober-exclude-op-1` @ `e487c2c` (base `a79a902`), 2 fichiers ; copie E3 `a722035` (lecture seule).
- Contraintes : aucun commit, aucun workflow, aucun réseau ; écritures sous `F:\tmp\g2-prober\` uniquement.
- **VERDICT : PASS-AVEC-CORRECTIONS** — liste fermée C-G2-1 (tests : 3 propriétés non prouvées, sondes N6/N7/N8 survivantes),
  C-G2-2 (citation `u4b-reduce.mjs:35` fausse + phrase « jamais la forme `=` » à ajouter au RUNBOOK passe 4), C-G2-3 (ventilation
  drpc à sourcer au ledger) ; aucune ne change le comportement de la ligne passe 4. **Aucune correction bloquante** pour la passe 4 ;
  C-G2-1 pliable après la passe avec item formé (PROBER-EXCLUDE-OP-TESTS-1) ; C-G2-2/C-G2-3 = textes à corriger avant insertion
  (et une phrase au RUNBOOK déjà inséré). Détail §V ; points (1)-(7) ; observations O-1..O-8 ; résultats d'oracle §R ; provenance
  en fin de fichier.

## Journal (date -u)
- 2026-09-23T17:28:47Z — ouverture ; R-1 déclaré ; orientation.
- 2026-09-23T17:35:01Z — clone isolé `F:\tmp\g2-prober\clone` (`git clone --no-hardlinks -b lot/prober-exclude-op-1 F:/Monark`, 9,5 s, exit 0) @ `e487c2c65a1d…`, propre ; pointe `origin/lot/etude-suite` = `d204d14` (⊇ `7a7bca2`, ⊇ `a79a902` ; 4 fichiers hors `docs/` depuis `a79a902`, aucun du lot) ; `package.json`/`package-lock.json` identiques `e487c2c`↔`d204d14`.
- 2026-09-23T17:35:22Z — `node_modules` du clone par `F:\tmp\g2-garde2bi\mk-nm.ps1` (A-2 ; entries 220, @monark 10, fail 0) ; `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-prober\clone\packages\rpc-guard\src\index.ts`.
- 2026-09-23T17:35:38Z — oracle 7 portes du lot lancé (`oracle/run-oracle.sh`, forme g2-ukemirevert, ceinture `env -u` × 8) → `oracle/lot/`.
- 2026-09-23T17:36Z — (1) diff exact (`logs/diff-exact.log`) : `a79a902..e487c2c` = 2 fichiers `M` (+24/−4, +119/−0) ; `e487c2c^`=`a79a902`, `a722035^`=`b9964ee` ; `git patch-id --stable` identique (`b782af85…`) pour `e487c2c` et `a722035` ; sha256 blobs : prober `03a80e22…` aux deux commits (= DELIVERED) ; test `dc61087e…` (lot, = DELIVERED) / `a74b77c0…` (E3) ; delta test E3↔lot = le seul hunk REVERT-1 (identique à `a79a902`↔`b9964ee`, numéros de ligne décalés de 3).
- 2026-09-23T17:37:34Z — A-6 (`a6.mjs`, `logs/a6.log`, exit 0) : 9/9 gelés (lignes l.116-124 PARSÉES du blob du prereg au commit du lot) CONCORDANCE aux 5 commits base/lot/E2/E3/pointe ; prereg `1971d9b1` SAME ; ADR-U4b SAME base↔lot et E2↔E3 ; `u4-guard.mjs` `e3f5c70d` SAME ; `rpc2.ts` SAME (`38210129` base/lot, `92577c5a` E2/E3) ; `packages/rpc-guard/**` ls-tree identique (32/32, 27/27) ; `diff --name-only` = les 2 fichiers seulement (lot et E3). bad=0.
- 2026-09-23T17:37:56Z — (5) R-25 forme CI (`r25.mjs` : pathspec lu VERBATIM de `ci.yml:65` au blob du commit, 15 éléments ; `logs/r25.log`) : `a79a902...e487c2c` ⇒ « 2 files changed, 143 insertions(+), 4 deletions(-) » = **147** ; même forme `b9964ee...a722035` = **147**.
- 2026-09-23T17:41:54Z — **Déviation D-G2-1 (outillage, consignée)** : en construisant `node_modules` de deux arbres de mutation par une boucle bash, l'échappement `\$t` a été réduit par le transport (piège A-13) ⇒ `mk-nm.ps1` a reçu `F:\tmp\g2-prober$t` et y a créé un `node_modules` de jonctions (dossier FRÈRE de `F:\tmp\g2-prober\`, hors périmètre d'écriture). Retiré à 17:42Z par `rm-nm.ps1` (retrait jonction par jonction, jamais récursif) puis `rmdir` du dossier vide ; `F:\Monark\node_modules` intact (218 entrées, `@monark` 10). Aucun fichier de dépôt touché. `error_origin` : relecteur (outillage).
- 2026-09-23T17:42:31Z — arbres de mutation `mut`, `mut2` = worktrees détachés de MON clone @ `e487c2c` ; `mk-nm.ps1` (appels unitaires à chemin littéral) : 220 / 10 / fail 0 ; `require.resolve` dans chacun.
- 2026-09-23T17:44:37Z — harnais `mutants/g2-mutants.mjs` (Write, A-13 recompté dans node : la regex de comptage TAP porte bien DEUX barres obliques inverses avant `d+`, 1 occurrence ; sha256 `df779683…`) : `--dry` 11/11 (g1) et 10/10 (g2) exact-once non no-op ; lancés en parallèle (g1 sur `mut`, g2 sur `mut2`).
- 2026-09-23T17:45:25Z — (4b) fusion à blanc : `git merge-tree --write-tree --name-only origin/lot/etude-suite(d204d14) e487c2c` ⇒ arbre `15791df9917c…`, **0 conflit** ; worktree détaché `merged` @ `d204d14` + `git merge --no-commit --no-ff e487c2c` (« Automatic merge went well ») ; `git write-tree` = `15791df9…` (identique) ; index = les 2 fichiers +24/−4, +119/−0. Oracle `merged` lancé 17:45:43Z (en parallèle de l'oracle du lot : charge déclarée).
- 2026-09-23T17:47:01Z — (hors liste, preuve HEAD_E3-TESTS-1 partielle) worktree détaché `e3` @ `a722035` (MON clone ; `rpc2.ts` `92577c5a`, test `a74b77c0`, prober `03a80e22`) : `node --test --test-reporter=tap test/guard-scripts-u4.test.ts` sous ceinture ⇒ **exit 0, 20/20** (`e3run/guard-scripts-u4.tap`, en-tête `e3run/header.txt`). L'oracle 7 portes à E3 n'est PAS fait par moi (item de l'orchestrateur).
- 2026-09-23T17:48-17:51Z — (6) sources des docs vérifiées une à une (détail §6 du verdict) ; ledger `pocket.network.jsonl` : 22 lignes, sha256 `868e1b31c26709852253…` = valeur citée, l.11-13/15-17/19-21 = `eth_getLogs` attempted, l.1-6 getBlockByNumber, l.9 getLogs, l.7/8/10/14/18/22 unlocked ; raw passe 1 `c3954476…` (2 copies) : b0 23414968, b_last 23422118 (= la plage des 2 FATAL), `calls_by_operator` {drpc.org 3, nodies.app 16, tenderly.co 3, pocket.network 3}, `errors_by_operator` {drpc.org 1}, `emode_raw["1"]` = `{error:"NoQuorumError"}` ; FATAL des logs = citations exactes.
- 2026-09-23T17:52Z — contrôles C-9-ter / C-6 : script `node -e` EXTRAIT du texte de `ADR-amendement.md` §B (jamais retapé ; sha256 `20179386…` / `602c8e01…`) et exécuté sous ceinture sur le raw passe 1 réel + 6 copies synthétiques G2 (`controls/controls.log`) : passe 1 ⇒ 3/3 ; bonne ⇒ 0/0 ; prix +1 ⇒ C-6 3 ; nodies retiré ⇒ C-9-ter 3 ; littéral d'exclusion ⇒ C-9-ter 3 ; catégorie `QuorumDisagreementError` ⇒ 3/3 ; chainstack 52 ⇒ C-6 3.
- 2026-09-23T17:51:36Z — oracle du lot (clone `e487c2c`) terminé : 6 portes exit 0 ; `test` **exit 1** = 1109 / 1106 / 1 fail / 2 skipped / 0 cancelled ; le rouge = `not ok 937 - export_public_no_governance_no_french` (test 42), `EPERM` au `rmSync` du `finally` (`test/export-public.test.ts:332`), `duration_ms` 730234 — même signature que le G1 (sous charge : 2 oracles + 2 harnais + E3 en parallèle, charge créée par moi, déclarée).
- 2026-09-23T17:5xZ — harnais de mutants terminés : g1 `ALL_AS_EXPECTED=true n=11 killed=11` ; g2 `ALL_AS_EXPECTED=true n=10 killed=7 survived=N6,N7,N8` (les 3 sondes ; attendu). Restauration byte-exacte vérifiée après chaque mutant, arbres propres.
- 2026-09-23T17:56:37Z — rejeu isolé `test/export-public.test.ts` (clone `e487c2c`, mêmes drapeaux que la porte, ceinture, TAP conservé `export-rerun/`) lancé.
- 2026-09-23T17:5xZ — ledger `drpc.org.jsonl` (même cycle ; 141 333 lignes) : les 3 passes du prober = l.141322-141324, 141326-141328, 141330-141332, chacune **2 `eth_call` + 1 `eth_getLogs`** puis `unlocked` (141325/141329/141333) ⇒ « drpc.org 3 = 2 eth_call + 1 getLogs » de l'ADR §4 est un FAIT mesuré au ledger (source à citer, C-G2-3).
- 2026-09-23T17:57Z — consultation advisor intégré (orientation faite, avant rédaction) : reçue ; points retenus : citation `u4b-reduce.mjs:35` fausse, sondes N6-N8 = propriétés non prouvées (correction formée, pas de blocage), chiffre drpc à sourcer, lecture des oracles (1109 inclut déjà les 5 tests), E3 = preuve partielle.
- 2026-09-23T17:59:48Z — sonde « forme `=` » (hors liste ; `probe-eqform/`) : un test TEMPORAIRE ajouté au fichier de test de MON arbre `mut2` (jamais un arbre de dépôt), exécuté seul, puis fichier restauré byte-exact (écriture durable + relecture : `dc61087e…`, `git status` vide). v1 : rouge par MA propre assertion mal posée (« pocket.network IS fetched » : sans banc drpc le quorum est atteint par drpc+nodies / drpc+tenderly, pocket jamais sollicité — c'est pourquoi le test (a) bouchonne `U4T_FAIL_DRPC`) ; **déviation D-G2-2** : le TAP v1 a été écrasé par v2 (même chemin) — extrait conservé ici : `not ok 1 - g2_probe_equals_form_is_silently_ignored`, `error: 'equals form: pocket.network IS fetched'`, `actual: false`, `probe-eqform/probe.tap:634:12`. v2 (assertion d'hôte retirée) : **`ok 1`** ⇒ mesuré : `--exclude-operator=pocket.network` ⇒ exit 0, `excluded_operators` = `["mevblocker.io"]`, `pocket.network` reste dans le pool getLogs (forme `=` ignorée EN SILENCE ; voir O-2).

---

## V. VERDICT G2 : **PASS-AVEC-CORRECTIONS** (liste fermée C-G2-1..C-G2-3 ; aucune ne change le comportement de la ligne passe 4)

Aucun défaut de COMPORTEMENT trouvé : diff exact, invariants, gardes, provenance, défaut byte-identique, 11/11 mutants du G1
rejoués et tués par leur test nommé, 7/7 mutants propres « à tuer » tués, fusion à blanc sans conflit. Les corrections sont des
trous de PREUVE (3 propriétés exigées par la mission, vraies à la lecture, qu'aucun test ne prouve) et deux défauts de citation
dans les textes à insérer. Le séquencement (pli avant G7 ou après la passe) revient à l'orchestrateur ; C-G2-1 ne touche que le
fichier de test, HORS liste 0.6 (`RUNBOOK…:93`, 21 fichiers, `guard-scripts-u4` absent : grep 0) ⇒ aucun sha de course ni
`<HEAD_E3>` à re-épingler du fait de cette correction.

### Liste fermée des corrections
- **C-G2-1 (tests ; trou de preuve ; `error_origin` : implémentation G1)** — Trois propriétés de la mission et de l'ADR §1 ne sont
  prouvées par AUCUN test : (i) `argAll` lit l'`argv` de `run()` et jamais `process.argv` ; (ii) la liste est dédupliquée ;
  (iii) l'ordre d'INSERTION (défaut d'abord) pour une étiquette qui trie AVANT `mevblocker.io` (`chainstack`, `drpc.org`) — le
  « défaut en tête » EST prouvé pour la paire de la passe 4 (M7, ordre inversé, tué par (a)) ; ce qui manque est plus étroit.
  Mesure : les sondes **N8** (`argAll` sur `process.argv`), **N7** (`Set` retiré) et
  **N6** (`.sort()`) SURVIVENT aux 5 tests du lot (5/5 ok chacune ; TAP `F:\tmp\g2-prober\mutants\g2\tap\mutant-N6.tap`,
  `-N7.tap`, `-N8.tap`). Motif : tous les tests passent par le CLI (où `argv` = `process.argv.slice(2)` : N8 indiscernable), aucun
  ne répète une étiquette ni n'exclut une étiquette antérieure à `mevblocker.io` dans l'ordre alphabétique (pour
  `["mevblocker.io","pocket.network"]`, `.sort()` est l'identité). Le code est correct à la lecture (`u4-oracle-path.mjs:145`,
  `:197`). Forme exigée (2 tests, chacun avec son mutant rejoué A-11) : **(a')** appel EN PROCESSUS
  `run([...args valides, "--exclude-operator", "pocket.network", "--exclude-operator", "tenderly.co"], { env: {}, now })` avec
  `globalThis.fetch` remplacé par un compteur qui lève ⇒ `assert.rejects(…, /EXCLUDE-OPERATOR QUORUM GUARD/)` et 0 appel (tue N8 ;
  motif en place `apps/sentinel/test/u4b-oracle-path.test.ts:174`) ; **(b')** CLI `--exclude-operator drpc.org --exclude-operator
  drpc.org --with-chainstack` (clé factice `.invalid` du harnais) ⇒ exit 0 et `excluded_operators` deep-equal
  `["mevblocker.io","drpc.org"]` (tue N6 ET N7 ; la garde passe : eth_call {pocket, chainstack}, getLogs {tenderly.co, pocket,
  chainstack}). Placement sans effet sur l'export public : `apps/sentinel/test/u4b-oracle-path.test.ts` (importe déjà `run`) est
  listé dans `scripts/export-exclude-tests.json`, et `test/guard-scripts-u4.test.ts` est absent de l'export (mesuré sur le
  répertoire resté `monark-export-3sVWk4`). Si l'orchestrateur place ce pli après la passe : déclarer les 3 propriétés « déclaratives » à l'ADR §7 (sondes
  survivantes citées) + item formé PROBER-EXCLUDE-OP-TESTS-1 (déclencheur : premier lot touchant le prober ou son test, au plus
  tard clôture de la course) — jamais un « dû » nu.
- **C-G2-2 (docs à insérer ; citation fausse ; `error_origin` : validation cp-1 M-3, recopiée par le G1)** — `ADR-amendement.md`
  §2 (ligne « provenance → lecteurs ») cite `u4b-reduce.mjs:35` pour « le réducteur ne lit ni `endpoints` ni
  `excluded_operators` ». La ligne 35 de ce fichier (gelé #2, `a5e66cd3…`, identique aux 5 commits) est `  }`. Les lectures du raw
  du prober sont `:64` (`emode_raw`), `:66` (`pre_b0_anchor`), `:70` (meta : agrégateur, p_min/p_max, n_updates,
  monotone_blocks, usdt_prices), `:71` (`updates`), `:77` (`usdt_prices`) ; la seule lecture de `provenance` (`:48`) est
  `bookRaw.provenance.book_digest` (raw du LIVRE). Le fond est vrai. Remplacer par `u4b-reduce.mjs:64-77` (et `:48` = livre).
  **Et (ex-O-2, règle Dettes : pas de no-op silencieux sur une ligne de course, esprit cp-1 C-11)** : ajouter UNE phrase à la section
  « Étape 5 — passe 4 » du RUNBOOK (déjà insérée à la pointe `7908bd5`, `RUNBOOK…:424`, via `dab6f91`) : « forme
  `--exclude-operator pocket.network` (espace) ; la forme `--exclude-operator=pocket.network` n'est PAS reconnue et serait ignorée en
  silence (mesuré G2) — seul C-9-ter la rattraperait, après dépense ». État à la pointe : grep `exclude-operator=` / « jamais `=` » = 0.
- **C-G2-3 (docs à insérer ; chiffre sans source ; `error_origin` : implémentation G1 (docs))** — ADR §4 « `calls_by_operator`
  drpc.org 3 = 2 eth_call + 1 getLogs refusé » : la provenance ne porte que le total par opérateur ; la ventilation est un FAIT du
  ledger `F:\monark-ledger\chainstack-2026-09-19\chainstack-2026-09-19\drpc.org.jsonl` (passe 1 : l.141322-141323 `eth_call`,
  l.141324 `eth_getLogs`, l.141325 `unlocked` ; passes 2-3 : l.141326-141328 et l.141330-141332, même motif) et « refusé » vient de
  `errors_by_operator {"drpc.org":1}` du raw passe 1 `c3954476…`. Citer ces deux sources (doc 03).

### Points (1)-(7) de la mission : résultat et preuve rejouable
- **(1) Diff exact / A-6 / interdits — CONFORME.** `git diff --numstat a79a902 e487c2c` = `24 4 scripts/census/u4-oracle-path.mjs`,
  `119 0 test/guard-scripts-u4.test.ts` (2 × `M`, rien d'autre) ; `e487c2c^` = `a79a902` ; E3 : `a722035^` = `b9964ee`, même numstat,
  `git patch-id --stable` identique `b782af85…` ; sha256 blobs = `DELIVERED.sha256` (prober `03a80e22…` aux deux commits ; test
  `dc61087e…` au lot, `a74b77c0…` à E3 : écart = le seul hunk REVERT-1, identique à `a79a902`↔`b9964ee`). A-6 (`a6.mjs`, les 9 lignes
  l.116-124 PARSÉES du prereg au commit du lot, sha256 LF recalculé par `git show`) : 9/9 CONCORDANCE aux 5 commits
  (base/lot/E2/E3/pointe) ; prereg `1971d9b1`, `u4-guard.mjs` `e3f5c70d`, `rpc2.ts` (`38210129` base=lot, `92577c5a` E2=E3), ADR-U4b,
  `packages/rpc-guard/**` (ls-tree 32=32, 27=27) inchangés. Journal `F:\tmp\g2-prober\logs\a6.log` (exit 0, bad=0).
- **(2) Lecture adversariale — CONFORME (preuve par test, sauf 3 propriétés : C-G2-1).**
  - `argAll` (`:145`) est une fermeture sur le paramètre `argv` de `run(argv, deps)` ; `process.argv` n'apparaît qu'au point d'entrée
    CLI (`:329-330`). Borne `argv.length` : un flag final rend `undefined`, refusé par la garde d'étiquette (M11 tué par (e)).
    Non prouvé par test : C-G2-1 (N8 survit).
  - Défaut : `excluded = [...new Set(["mevblocker.io", ...cliExcluded])]` (`:197`) ; sans flag = `["mevblocker.io"]` = l'ancien
    littéral ⇒ octets de provenance inchangés. **LA preuve** : aucun octet existant du test modifié (numstat +119/−0 ⇒ `REF.ORACLE_RAW`
    / `REF.ORACLE_INPUTS` intacts) ; test (c) et le test existant `u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data`
    `ok` dans l'oracle du lot ; le golden masqué est SENSIBLE à `excluded_operators` : N4 (provenance figée à la valeur passe 4) et M6
    (défaut perdu) tués par « default course: the raw golden is unchanged ». En tête et dédup : vrais à la lecture, non prouvés (C-G2-1).
  - Ensemble fermé (`:193-196`) = `buildLabelLists({ withChainstack: true })` aplati = {drpc.org, mevblocker.io, nodies.app,
    pocket.network, chainstack, tenderly.co} = étiquettes sans clé de `transport.ts:36-37` + `chainstack` (`u4-guard.mjs:62-69`).
    Refus nommé ; message = rang de l'occurrence + ensemble fermé, JAMAIS la valeur (N9 « écho de la valeur » tué par (e) ; N3
    « faute de frappe tolérée » et M10 tués par (e) ; M11 flag final).
  - Garde de quorum (`:202-203`) par `operatorOf` (`rpc2.ts:28-31` aux deux bases ; `providerOf` rend une étiquette nue telle quelle,
    `rpc.ts:29-35`) : nodies.app + pocket.network = 1 ⇒ `--exclude-operator drpc.org` refusé (test (d) ; M9 et N2 — comptage par
    étiquette sous deux formes — tués). Les deux gardes lèvent AVANT `openU4GuardedClient` (`:207` ; verrous puis ledgers :
    `guarded.ts:38-49`) et HORS du `try/finally` (aucun `unlockAll` sur un client indéfini) ⇒ 0 verrou / 0 ledger / 0 fetch : M2, M8,
    M9, N2 tués par « 0 fetch » (compteur de fetch non vacant) ; M5 et N10 (gardes déplacées après l'ouverture) tués par « no lock ».
  - Provenance `params.excluded_operators: excluded` (`:289`) = liste effective (M3, M7, N5 tués par (a) ; N4 par (c)). N1 (exclusion
    ignorée EN AVAL : gardes et provenance voient les pools filtrés, client gardé et pool reçoivent les pools par défaut ⇒ la
    provenance MENT) tué par (a) via le journal d'hôtes (« no pocket.network fetch once excluded »).
- **(3) Mutants — 11/11 du G1 + 7/7 propres « à tuer » tués par le test NOMMÉ ; 3 sondes survivantes = C-G2-1.** Harnais indépendant
  `F:\tmp\g2-prober\mutants\g2-mutants.mjs` (sha256 `df779683d896…`, écrit par Write, A-13 recompté) sur deux worktrees de MON clone
  (`mut`, `mut2` @ `e487c2c`) : en-tête A-12 ; enfant `node --test --test-reporter=tap --test-timeout=120000 --test-force-exit
  --test-name-pattern=^u4_oracle_path_(exclude_operator|default_excluded) test/guard-scripts-u4.test.ts` ; A-11 byIntended ;
  D-1-bis (écriture durable + relecture du sha après CHAQUE mutant : `restored=true`, `tree_clean=true` partout) ; REVIEW-TAP-1
  (`mutants/{g1,g2}/tap/mutant-*.tap`, BASELINE 5/5 dans chaque arbre). Résultats : `mutants/g1/mutants.log`
  `ALL_AS_EXPECTED=true n=11 killed=11` ; `mutants/g2/mutants.log` `ALL_AS_EXPECTED=true n=10 killed=7 survived=N6,N7,N8`.
  Propres demandés : exclusion ignorée en aval = N1 ; garde par étiquette = N2 (+ M9) ; étiquette inconnue tolérée = N3 ; provenance
  littérale = N4 (valeur passe 4) et N5 (liste CLI seule) ; ordre de la liste = N6 (sonde, survit) et M7 (tué) ; en plus N7 (dédup,
  sonde), N8 (`process.argv`, sonde), N9 (écho de la valeur), N10 (garde d'étiquette après l'ouverture).
  Première assertion rouge par mutant (lue dans les TAP) : M1 hôte pocket (a) + (b) + (d) ; M2 « 0 fetch » (b)(d) ; M3 provenance (a) ;
  M4 (b) « single getLogs witness » ; M5 « no lock » (b)(d) ; M6 témoin positif (a) + golden (c) ; M7 provenance (a) ; M8 « 0 fetch »
  (b) ; M9 « 0 fetch » (d) ; M10 typo (e) ; M11 flag final (e) ; N1 hôte pocket (a) ; N2 « 0 fetch » (d) ; N3 typo (e) ; N4 golden (c) ;
  N5 provenance (a) + golden (c) ; N9 « never echoes » (e) ; N10 « no ledger, no lock » (e).
- **(4) Oracle 7 portes** (forme `g2-ukemirevert`, `F:\tmp\g2-prober\oracle\run-oracle.sh`, ceinture `env -u` × 8 sur chaque porte,
  comptes LUS dans le TAP) :
  - clone du lot `e487c2c` (17:35:38Z → 17:51:36Z) : `gate:vocab` 0, `typecheck` 0, `lint` 0, `lint:ratchet` 0, `lang:gate` 0,
    `export:check` 0 ; `test` **exit 1** : **1109 / 1106 / 1 fail / 2 skipped / 0 cancelled**. Le rouge = `not ok 937 -
    export_public_no_governance_no_french` (test 42), `EPERM` au `rmSync` du `finally` (`test/export-public.test.ts:332`, répertoire
    `F:\tmp\g2-prober\tmp\monark-export-cDwLXF`), `duration_ms` 730234 — signature identique au G1, sous une charge que j'ai créée
    (2 oracles, 2 harnais, E3). Les 5 tests du lot, `u4_scripts_clean_and_import_sources_closed` et le rejeu golden sont `ok` ;
    `u4b_oracle_path_*` 10 ok, `u4_oracle_path_*` 14 ok ; 0 `not ok` hors test 42. Rejeu isolé : voir §R.
  - fusion à blanc dans la pointe `lot/etude-suite` = **`d204d14`** (⊇ `7a7bca2`, ⊇ `17bf122`) : `merge-tree` ⇒ `15791df9…`, 0 conflit ;
    worktree `merged` + `merge --no-commit` ⇒ `write-tree` identique. Oracle : voir §R. Attendu 1109 (le 1109 du G1 incluait déjà
    les 5 tests ; `a79a902..d204d14` hors `docs/` = 4 fichiers `apps/site/**`, aucun test). Le risque de re-fusion est nul tant que
    les 2 fichiers du lot ne sont pas touchés sur la pointe.
  - hors liste : fichier de test du lot à E3 (`a722035`, `rpc2.ts` `92577c5a`) **20/20, exit 0** ⇒ preuve PARTIELLE de HEAD_E3-TESTS-1
    (l'oracle 7 portes à E3 reste à l'orchestrateur).
- **(5) R-25 forme CI — 147.** Pathspec VERBATIM de `ci.yml:65` (lu au blob, 15 éléments), `git diff --shortstat a79a902...e487c2c` =
  « 2 files changed, 143 insertions(+), 4 deletions(-) » = **147** (≪ 1 150) ; même forme `b9964ee...a722035` = 147. `logs/r25.log`,
  `logs/r25-e3.log`.
- **(6) Docs (`ADR-amendement.md`, textes A-D) — CONFORME sauf C-G2-2 et C-G2-3.** Il dit : exclusion PAR ÉTIQUETTE (§1, §4, §B) ;
  `nodies.app` CONSERVÉ et NÉCESSAIRE, avec le motif (drpc refuse getLogs et est mis au banc 25 s toutes méthodes : `rpc2.ts:172` à
  `b9964ee`, `:216` à `a79a902`, vérifié ; 14 catégories e-mode vérifiées au raw passe 1) ; pools en clair (eth_call `[drpc.org,
  nodies.app, chainstack]`, getLogs `[drpc.org, tenderly.co, chainstack]`) ; motif mesuré (logs + ledger l.11-21, tout relu : journal
  17:48-17:51Z ; sha256 du ledger `868e1b31…` exact) ; tuyaux + test de composition (§2) ; R-U-2 DÉCLENCHÉ, borne 51 (D-n 148,
  `CHANTIERS:1204`) ; items C-7 (PROBER-EMODE-FAILCLOSED-1, BENCH-PER-METHOD-1, OBS-1, R-U-2) + HEAD_E3-TESTS-1 ; désambiguïsation
  `RUNBOOK:294` (vérifiée : « `--exclude-operator` n'existe plus (`:30-34`) », recorder) ; F-1 : aucune référence `F:\tmp` dans A-C
  (grep 0). Références vérifiées exactes : `u4-oracle-path.mjs:15-16,30,145,190-196,197,198,199-203,207,271-282,286,289,303` ;
  `rpc2.ts` asLogs `:54`/`:65`, asHex `:67`/`:78` (rejette `"0x"`, vérifié), operatorOf `:28` ; `u4-guard.mjs:62,136` ;
  `ADR-GARDE-HELIUS-client-budgete-unique.md:320` ; `CHANTIERS.md:918` (g), `:1203` (b), `:1213-1216` @ `958e08d` ; `transport.ts:36-37`.
  Contrôles C-9-ter et C-6 : texte EXTRAIT et exécuté (journal 17:52Z), conformes à ce qu'ils annoncent sur 7 entrées.
- **(7) A-7 — CONFORME.** Chaque oracle, harnais, sonde et contrôle sous `env -u` des 8 variables (le harnais refuse de démarrer si
  l'une est présente ; enfants purgés sans égard à la casse). Aucune variable ni environnement affiché ; `prober-cs.sh` contrôlé par
  PRÉSENCE seulement (`grep -c`, `grep -o` du seul `--max-calls N`) ; ledgers lus = champs `outcome` / `by_op_method` (aucune clé) ;
  aucun corps de réponse d'opérateur lu ; aucun réseau (fetch bouchonné du harnais, clé factice `.invalid`).

### Observations (aucune action requise sauf mention ; jamais un « flake déclaré »)
- **O-1 (test 42)** : rouge EPERM au nettoyage du test 42 dans l'oracle du lot (même signature qu'au G1) ; rejeu isolé en §R. Item
  existant EXPORT-TEST42-EPERM-1 (`17bf122`, « test-42 cleanup fix declared » `8e088f9`) : pas d'item nouveau.
- **O-2 (forme `=` du flag, mesurée)** : `argAll` compare le jeton EXACT ; `--exclude-operator=pocket.network` est ignoré EN
  SILENCE (sonde `F:\tmp\g2-prober\probe-eqform\` v2 : exit 0, `excluded_operators` = `["mevblocker.io"]`, `pocket.network` dans le
  pool getLogs). Même classe que la faute de frappe de C-11, hors de la garde d'étiquette (i), mais ATTRAPÉE par le contrôle docs (ii)
  C-9-ter (`pools_ok` + liste d'exclusion, exit 3 : mesuré sur mes copies synthétiques), après la course et donc après dépense
  (≤ 51 appels). La ligne passe 4 est recopiée du RUNBOOK (forme avec espace) : la phrase d'avertissement est désormais EXIGÉE,
  rangée dans **C-G2-2** (règle Dettes) ; le refus en code d'un jeton `--exclude-operator=…` serait un lot hors course (déclencheur :
  premier lot touchant le prober après la course ; à porter par l'item PROBER-EXCLUDE-OP-TESTS-1 si C-G2-1 est reporté).
- **O-3** : `mkdirSync(rawsAbs)` (`:184`) précède les gardes ⇒ un refus peut laisser un `--raws-dir` VIDE (aucun verrou, ledger,
  fetch ni raw) ; ordre préexistant, sans effet.
- **O-4** : `--exclude-operator chainstack --with-chainstack` est admissible et cohérent (`buildLabelLists` retire `chainstack` même
  avec l'interrupteur, `u4-guard.mjs:64` ; provenance honnête) ; `--exclude-operator mevblocker.io` = défaut (dédup).
- **O-5** : l'attendu « 1 109 + 5 ≈ 1 114 » de la mission : le 1 109 du G1 incluait déjà les 5 tests ; mesuré 1 109 au clone du lot.
- **O-6** : écart d'énoncé du G1 confirmé : le fichier de test diffère entre `b9964ee` et `a79a902` (hunk REVERT-1 seul, +5/−8).
- **O-7 (déviations du relecteur)** : D-G2-1 (dossier frère `F:\tmp\g2-prober$t` créé par un échappement réduit, retiré par
  `rm-nm.ps1` + `rmdir`, `F:\Monark\node_modules` intact) ; D-G2-2 (TAP v1 de la sonde écrasé, extrait conservé au journal).
  `error_origin` : relecteur (outillage).

### `error_origin` (proposé au G7)
C-G2-1 : implémentation (G1, conception des tests) ; C-G2-2 : validation (cp-1 M-3), recopiée par l'implémentation ; C-G2-3 :
implémentation (G1, docs) ; D-G2-1/D-G2-2 : relecteur. Aucun `error_origin` de spécification ou de plan nouveau.

### §R. Résultats d'oracle (comptes LUS dans les TAP conservés)
| Arbre | Portes (exit) | `test` : tests / pass / fail / skipped / cancelled | Rouge | TAP |
|---|---|---|---|---|
| clone du lot `e487c2c` (17:35:38Z → 17:51:36Z) | vocab 0, typecheck 0, lint 0, lint:ratchet 0, lang:gate 0, export:check 0, **test 1** | 1109 / 1106 / 1 / 2 / 0 | `not ok 937` test 42, EPERM `rmSync` `finally` (`export-public.test.ts:332`), 730 s | `F:\tmp\g2-prober\oracle\lot\test.tap` |
| fusion à blanc `d204d14` ⊕ `e487c2c` (index `15791df9…`, 17:45:43Z → 18:02:36Z) | vocab 0, typecheck 0, lint 0, lint:ratchet 0, lang:gate 0, export:check 0, **test 1** | 1109 / 1106 / 1 / 2 / 0 | `not ok 937` test 42, même signature, 793 s | `F:\tmp\g2-prober\oracle\merged\test.tap` |

Dans les deux TAP : les 5 tests du lot, `u4_scripts_clean_and_import_sources_closed` et
`u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data` sont `ok` (1 occurrence chacun) ; le seul `not ok` est le
test 42. Le `finally` qui lève MASQUE l'issue des assertions du test 42 dans ces deux exécutions (même constat qu'au G1) ; l'export
public exclut les fichiers du lot et `export:check` est vert aux deux arbres. Rejeux isolés du fichier `test/export-public.test.ts`
(mêmes drapeaux que la porte, ceinture, TAP conservé) :

### Provenance (journal de provenance, forme doc 02)
- **Générateur relu** : worker G1 `claude-opus-5-5[1m]` (rendu `F:\tmp\prober-lot\RENDU-G1.md`) ; commit `e487c2c` (auteur Kraidle,
  2026-09-23T18:28:04+01:00, orchestrateur, R-20) ; copie E3 `a722035` (même patch-id).
- **Relecteur G2** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` déclaré à la 1re prise de parole, R-1), effort max, instance
  séparée, contexte frais (artefacts seuls : rendu G1, PLAN, ADR-amendement, lot.patch, mutants.mjs, TAP, controls, CP1, CONSIGNE,
  CHANTIERS). Date : 2026-09-23, 17:28:47Z → fin en tête de la dernière ligne du journal ci-dessous. Advisor intégré consulté 1 fois
  après l'orientation (17:57Z, reçu, non « timed out ») ; consultation de clôture : voir dernière ligne.
- **Environnement** : node v24.15.0, win32/x64 (10.0.19045), git 2.55 ; TEMP/TMP/TMPDIR = `F:\tmp\g2-prober\tmp` ;
  `node_modules` par `F:\tmp\g2-garde2bi\mk-nm.ps1` (jonctions vers `F:\Monark\node_modules`, `@monark/*` vers l'arbre ;
  `package.json`/`package-lock.json` identiques entre `b9964ee`, `e487c2c` et `d204d14`).
- **Arbres (tous sous `F:\tmp\g2-prober\`, worktrees de MON clone `git clone --no-hardlinks`)** : `clone` (`e487c2c`), `mut`, `mut2`
  (`e487c2c`, mutation, restaurés byte-exact, `git status` vide), `e3` (`a722035`), `merged` (`d204d14` + `merge --no-commit e487c2c`,
  JAMAIS conclu, index `15791df9…`). Aucun commit, aucun workflow, aucun `git` d'écriture hors de mon clone.
- **Aucune écriture dans un dépôt** (mesuré 18:06Z) : `F:\Monark-wt-prober` HEAD `e487c2c` 0 ligne de statut ; `F:\Monark-wt-ukemie3`
  HEAD `a722035` 0 ligne ; `F:\Monark` HEAD `2482918` (avancé par l'orchestrateur) 0 ligne. Seule écriture hors périmètre : D-G2-1
  (dossier frère créé puis retiré, journal 17:41:54Z).
- **Artefacts (sha256)** : `oracle/run-oracle.sh` `1ab5b9b5…1222` ; `oracle/lot/codes.txt` `aefa205c…237d`, `oracle/lot/test.tap`
  `5437a1aa…bd3c` ; `oracle/merged/codes.txt` `8f335412…81c2`, `oracle/merged/test.tap` `4fba0ad2…b621` ; `mutants/g2-mutants.mjs`
  `df779683…bb50` ; `mutants/g1/mutants.log` `11c42eba…7cde`, `.json` `fa1fdc69…a0f` ; `mutants/g2/mutants.log` `f31e7433…80b6`,
  `.json` `ad881c2e…d548` ; `a6.mjs` `b32983a0…e219`, `logs/a6.log` `c72991f3…3e5c` ; `r25.mjs` `8386fd7c…764c`, `logs/r25.log`
  `dce14a52…3e74` ; `controls/run-controls.mjs` `13c035c2…a41a`, `controls/controls.log` `593392c6…5b08` ;
  `probe-eqform/probe-v2.mjs` `4109d2b0…bc0d`, `probe-eqform/probe.tap` (v2) `a2f05571…7de5` ; `e3run/guard-scripts-u4.tap`
  `c4e4cd0a…c26a`.
- **Laissés en place (déclarés)** : les 5 worktrees ci-dessus (retrait : `rm-nm.ps1` par arbre PUIS `git -C clone worktree remove`,
  jamais `Remove-Item -Recurse`) ; les répertoires d'export restés par l'EPERM dans `F:\tmp\g2-prober\tmp\` (`monark-export-*`,
  `monark-src-*` ; l'export ne copie pas `node_modules`, `export-public.test.ts:124`).

### Observation ajoutée (rappel de séquencement, pas un défaut du lot)
- **O-8** : à la pointe `d204d14`, le RUNBOOK (`RUNBOOK-course-ukemi-2026-09-22.md:93-95`) attend encore `4ed4c31e` pour
  `scripts/census/u4-oracle-path.mjs` et ne mentionne ni `<HEAD_E3>` ni `03a80e22` ni « passe 4 » (grep 0) : l'amendement 0.6 et la
  D-n passe 4 au SIDECAR (cp-1 C-1/C-3, bloquants avant lancement) ne sont pas encore insérés — actes de l'orchestrateur (R-20),
  préalables à la passe 4 ; à `<HEAD_E3>` = `a722035`, la 0.6 re-mesurée doit donner `03a80e22…` pour le prober et les 20 autres
  inchangés (mesuré ici : `diff --name-only b9964ee a722035` = les 2 fichiers du lot, le fichier de test hors liste).
  **Mise à jour 18:15:47Z** : à la nouvelle pointe `7908bd5`, ces actes SONT insérés (`dab6f91` : erratum 0.6 « prober 03a80e22 at
  HEAD_E3 » + section « Étape 5 — passe 4 » `RUNBOOK…:424` ; `89771ff` : D-n Sidecar 5 passe 4, « E3 oracle 7x0 » déclaré par
  l'orchestrateur — non rejoué par moi) ; l'amendement ADR-U4b n'y est pas encore (grep `PROBER-EXCLUDE-OP-1` = 0 dans l'ADR) ⇒
  C-G2-2 / C-G2-3 s'appliquent encore au texte à insérer. O-8 : soldé côté RUNBOOK/Sidecar.
- **clone du lot `e487c2c`**, 17:56:37Z → 18:10:46Z (`F:\tmp\g2-prober\export-rerun\`, en-tête `header.txt`, TAP
  `export-public.rerun.tap`) : **exit 1 — 2 tests / 1 pass / 1 fail** ; `not ok 1 - export_public_no_governance_no_french`, MÊME
  signature (EPERM `rmSync` du `finally`, `export-public.test.ts:332`, `duration_ms` 846570), `ok 2 - export_public_derived_jobs_…`.
  **Ce rejeu n'était PAS isolé de la charge** : ma propre porte `test` de l'arbre `merged` tournait jusqu'à 18:02:36Z et mon rejeu
  `merged` a démarré à 18:05:39Z dans le MÊME `TEMP` (déclaré, `error_origin` : relecteur, séquencement). Je ne reproduis donc PAS le
  vert isolé du G1 (17:12:54Z → 17:24:30Z, `ok 1`, `F:\tmp\prober-lot\tap\export-public.rerun.tap`, même contenu d'arbre que
  `e487c2c`) ; je ne le contredis pas non plus : dans mes 3 exécutions, le `finally` qui lève MASQUE l'issue des assertions du `try`.
  Fait mesuré qui borne l'enjeu : le test 42 exporte l'arbre puis lance `npm ci` et `npm run ci` DANS l'export (`:301-318`, `runNpm("npm ci")` puis `runNpm("npm run ci")`) ; les
  fichiers du lot n'y sont pas (répertoire resté `monark-export-3sVWk4` : `scripts/census/u4-oracle-path.mjs` et
  `test/guard-scripts-u4.test.ts` absents ; `scripts/export-exclude-tests.json` justifie l'exclusion des tests qui importent
  `scripts/census/u4-oracle-path.mjs`) et `export:check` est vert aux deux arbres ⇒ **aucun lien mesurable avec le lot**. Le rouge
  relève de l'item existant **EXPORT-TEST42-EPERM-1** (propriétaire orchestrateur ; `17bf122` ; retry borné du `rmSync` + TAP des
  assertions avant le `finally`) : occurrences G2 à y consigner, bilan au point suivant.
  Observation, jamais un flake déclaré. Transparence A-4 : ce test mandaté par la porte lance `npm ci` dans sa copie (accès registre
  ou cache npm possible) — trafic de paquets de la suite existante, aucun appel d'opérateur RPC, rien ajouté par le relecteur.
- **arbre `merged`** (`d204d14` ⊕ `e487c2c`, index `15791df9…`), 18:05:39Z → 18:17:34Z (`F:\tmp\g2-prober\export-rerun-merged\`,
  en-tête `header.txt`, TAP `export-public.rerun.tap` sha256 `e84ffb26…1eec`) : **exit 1 — 2 / 1 / 1** ; `not ok 1 -
  export_public_no_governance_no_french`, MÊME EPERM au `rmSync` du `finally` (`:332`, `monark-export-QRGazi`, `duration_ms`
  714135) ; `ok 2`. Chevauchement avec mon rejeu du lot de 18:05:39Z à 18:10:46Z, SEUL de mes exécutions ensuite (charge des autres
  agents de la machine non mesurée) : le EPERM est survenu au nettoyage final (~18:17Z), donc pendant la fenêtre où ce rejeu était
  seul de mon côté. Concorde avec la mesure de l'orchestrateur (`2482918` : « lock measured > 60 s under load ») et avec son correctif
  à la pointe `7908bd5` (nettoyage best-effort après retries bornés, assertions inchangées). **Bilan test 42** : 4 exécutions G2, 4
  rouges EPERM au nettoyage, issue des assertions MASQUÉE dans les 4 ; seule exécution lisible = le vert isolé du G1 sur un arbre au
  contenu identique au lot. Aucun lien mesurable avec le lot (fichiers du lot absents de l'export, `export:check` vert). Pour lever le
  masque : l'oracle de l'arbre fusionné au G7, à une pointe ⊇ `2482918` (nettoyage best-effort), rendra l'issue des assertions du
  test 42 — à lire dans son TAP (`ok`/`not ok` du test 42 + avertissement de nettoyage éventuel). Pas d'item nouveau :
  EXPORT-TEST42-EPERM-1 (occurrences G2 à y consigner : oracle lot 17:51Z, oracle `merged` 18:02Z, rejeu lot 18:10Z, rejeu `merged`
  18:17Z).

## Journal (suite)
- 2026-09-23T18:02:36Z — oracle `merged` terminé : 6 portes exit 0 ; `test` exit 1 = 1109 / 1106 / 1 / 2 / 0 ; seul rouge = test 42 EPERM (793 s) ; les 5 tests du lot + `u4_scripts_clean_and_import_sources_closed` + rejeu golden `ok`.
- 2026-09-23T18:05:39Z — rejeu isolé de `test/export-public.test.ts` lancé sur `merged` (en-tête `export-rerun-merged/header.txt`).
- 2026-09-23T18:10:46Z — rejeu du lot terminé : exit 1, 2/1/1, même EPERM (846 s) ; non isolé de ma propre charge (déclaré §R).
- 2026-09-23T18:12Z — O-8 ajouté (RUNBOOK 0.6 à la pointe attend encore `4ed4c31e`) ; verdict, points (1)-(7), observations, §R, provenance écrits (fichier durable) AVANT la consultation advisor de clôture.
- 2026-09-23T18:13Z — consultation advisor de clôture (fichier durable avant l'appel) : reçue ; appliqué : (1) pointe re-mesurée, (2) attente bornée du rejeu `merged`, (3) C-G2-1 (iii) resserré (M7 prouve l'ordre pour la paire passe 4), (4) O-2 rangé dans C-G2-2 (phrase EXIGÉE), (5) placement de (a')/(b') sans effet sur l'export, (6) horodatage 18:12Z corrigé ; ligne de verdict complétée.
- 2026-09-23T18:15:47Z — pointe re-mesurée (`git fetch` local depuis `F:/Monark`, aucun réseau) : `origin/lot/etude-suite` = **`7908bd5`** ; `d204d14..7908bd5` hors `docs/` = `test/export-public.test.ts` SEUL (correctif EXPORT-TEST42-EPERM-1 : nettoyage à retries bornés puis best-effort, « assertions unchanged » selon `2482918`/`8d25f7d`/`99c25cc`/`e7f072b`) ; aucun des 2 fichiers du lot touché ; `git merge-tree --write-tree --name-only 7908bd5 e487c2c` ⇒ `13a16d78318f…`, **0 conflit**. Mon oracle de fusion porte sur `d204d14` : NON rejoué à `7908bd5` (budget) ; le seul fichier non-docs nouveau est le test 42 corrigé, hors lot ; l'oracle de l'arbre fusionné au G7 le couvrira.
- 2026-09-23T18:17:34Z — rejeu `merged` terminé : exit 1, 2/1/1, même EPERM (714 s) ; seul de mes exécutions à partir de 18:10:46Z ; §R mis à jour (bilan test 42 : 4/4 rouges G2 au nettoyage, assertions masquées ; levée du masque au G7 à une pointe ⊇ `2482918`).
