Modèle résolu : claude-opus-4-8[1m]

# G2-DELTA (reprise, décision 116) — RELECTEUR (instance neuve, contexte frais) — GARDE-HELIUS-2b-iii, PLI rebasé sur 2b-ii

(préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé.)

**Verdict : PASS.** Le pli SOLDE mécaniquement TOUTES les corrections bloquantes du checkpoint-2 (C-R-1..4) et de ma G2 initiale (C-G-1..5), vérifié de première main sur l'arbre REBASÉ. Aucune correction formée ne reste : les deux seuls résidus (refs `u4-probe` en docs de provenance U-4a ; manifeste `DELIVERED.sha256` antérieur au rebase) sont respectivement un **résidu DÉCLARÉ déjà rulé** (C-R-4 c-bis, prémisse factuelle re-vérifiée) et un **artefact de rebase bénin** — ni l'un ni l'autre n'est une correction. Le sous-lot est fusionnable au G7 de la seconde fusion.

Cible **`d311809`** (branche `lot/garde-helius-2b-iii-r` = 2b-ii fusionné `5394dfe` → 2b-iii rebasé `0a4a333` → rapports `7f1a52e` → pli `d311809`). Arbre ISOLÉ à historique COMPLET `F:\tmp\g2-garde2biii\tree` : depuis cwd=tree, `require.resolve('@monark/rpc-guard')` = `…\tree\packages\rpc-guard\src\index.ts` (jonctions `@monark/*` → CET arbre) ; `e7f22b8`, `5394dfe`, `e00f965`, `0a4a333`, `d311809` tous présents. `TEMP/TMP/TMPDIR=…\os-tmp` (rien sur `C:`). Aucun `git` d'écriture, aucun commit (R-20). Sources restaurées byte-exact après chaque mutant.

**A-7 (déclaré, mécanique).** Après l'incident de mon rapport initial (deux valeurs de clé imprimées), CETTE passe : `unset HELIUS_API_KEY CHAINSTACK_ETH_URL CHAINSTACK_{SOLANA,BASE,BSC,ROBINHOOD}_URL POLYGON_API_KEY DATABENTO_API_KEY BELL_SOLANA_RPC` en tête de CHAQUE bloc bash + `env -u <les 9>` sur chaque invocation `node`/`npm`/oracle + le harnais de mutants scrube lui-même l'env du process enfant. **Aucune variable d'env jamais imprimée** : contrôles de PRÉSENCE seulement (`[ -n "$X" ]`) ; la seule sortie env-adjacente fut `CHAINSTACK_ETH_URL=[]` APRÈS unset. `grep` de chaînes en forme de clé dans mes fichiers de rapport = 0.

---

## 1. Les 8 points de la mission — verdict par point

### (1) C-G-1..4 soldées — OUI, les quatre, avec mutant tueur
- **C-G-1 (unlock servi + récupération de verrou)** : `u4_oracle_path_unlocks_all_requested_operators` (`test:402`, 0 `.lock`, exactement 1 ligne `unlocked` par opérateur) + `u4_lock_left_after_hard_kill_is_recoverable_by_served_unlock` (`:415`, verrou laissé NON volé, récupéré par `runCli unlock`) + `u4_ledger_dir_must_be_outside_repo_and_preexist` (`:433`). Tueurs **V6 / MINE4 ROUGES** (sur unlock + composition). SOLDÉE.
- **C-G-2 (régime payant = NoQuorumError post-R-A)** : `u4_oracle_path_paid_leg_is_metered…` (`:311-313`) asserte `emode_raw["8"] == NoQuorumError` ET `!= QuorumDisagreementError` ; ADR 2b-iii (`:137-139`) le DÉCLARE. **Concorde exactement avec ma mesure indépendante de première main** (drpc benché ⇒ `operatorOf` collapse nodies/pocket en UN opérateur + R-A benche le `"0x"` payant ⇒ un seul opérateur restant ⇒ `NoQuorumError`, jamais le faux désaccord). Le pli a corrigé mon erreur initiale (j'avais proposé `ConcordantRevertError`) vers la bonne issue. SOLDÉE.
- **C-G-3 (pont d'identité RETIRÉ + test `===`)** : `u4-guard.mjs` n'importe plus `rpc2.ts` (l.26-30 = `@monark/rpc-guard` seul ; `bridge` supprimé ; `isTransient`/`makeGuardedPoolCall` consomment `PkgBudgetError`/`PkgRpcError` directement). `u4_guard_error_classes_are_the_package_classes` (`:496`) : `rpc2.RpcError === pkg.RpcError` (identité STRICTE) + u4-guard n'importe plus les classes d'erreur. Tueur **IDENT ROUGE** (rpc2 SOUS-CLASSE au lieu de ré-exporter). Rejeu byte-identité INCHANGÉ après retrait. SOLDÉE.
- **C-G-4 (`.u4-before` disparu)** : `grep -cE "u4-before|extractBefore|execFileSync\(git|\.skip\("` sur le test = **0** ; remplacé par sha de référence committés (C-R-1). SOLDÉE. *(Un dossier VIDE `node_modules/.u4-before/` subsiste dans MON clone — c'est MON résidu de session-1 pré-pli (créé le 21/09 22:50 par l'ancien test), PAS un artefact du pli : le test du pli n'y fait aucune référence.)*

### (2) C-R-1 — sha de référence PROUVÉS égaux depuis `git archive e7f22b8` ET le script migré (refait moi-même)
Rejeu byte-identique remplacé par 3 sha COMMITTÉS (`test:57-61`). Preuve d'égalité **de première main** (base extraite par `git archive e7f22b8`, jonction `@monark`→packages e7f22b8, clock gelée, fetch bouchonné keyless ; migré depuis l'arbre) :

| Sortie | base (`git archive e7f22b8`) | migré (arbre) | REF committé |
|---|---|---|---|
| `U4-oracle-path-e2.raw.json` | `76beb089…` | `76beb089…` | `76beb089…` ✓ |
| `U4-oracle-inputs.jsonl` | `5f3dcf2c…` | `5f3dcf2c…` | `5f3dcf2c…` ✓ |
| redraw `--out` | `ed2eaf59…` | `ed2eaf59…` | `ed2eaf59…` ✓ |

`base == migré == REF` pour les TROIS (`acctIdx=[3443,12793,15952]`, = pli §4). **Rejeu depuis une copie SANS `.git`** (`git archive d311809` → dir, `.git` ABSENT confirmé, node_modules jonctionné) : `node --test test/guard-scripts-u4.test.ts` = **16 tests, 16 pass, 0 fail, 0 SKIP** ⇒ la propriété est indépendante de la profondeur du clone (un `--depth 1` ne peut plus SKIP). SOLDÉE.

### (3) C-R-2 / C-R-3 / C-R-4
- **C-R-2 (dépense par le garde, indépendante de la clé ambiante)** : `u4_oracle_path_spends_only_through_guard` (`:271`, clé FACTICE `.invalid` posée, SANS `--with-chainstack` ⇒ 0 fetch hôte-payant, pas d'opérateur chainstack) + `u4_oracle_path_paid_leg…` (`:291`) + **`u4_redraw_spends_only_through_guard` (`:317`, le test ANNEXE qui MANQUAIT — sur `u4-redraw.mjs` byte-INCHANGÉ, sha `44e470c1`, prouvé par un TEST, pas par une édition du script)**. Tueurs **V2 / V3 ROUGES** avec env NETTOYÉ. SOLDÉE.
- **C-R-3 (`--max-ru`/`--floor` câblés)** : `u4_oracle_path_max_ru_is_the_paid_run_cap` (`:340`, `--max-ru 3` ⇒ exit 2, `chainstack.ru ≤ 3`, `refused:run_credits`) + `u4_oracle_path_floor_reaches_the_cycle_cap` (`:353`, `--floor 15999999` ⇒ exit 2, `refused:cycle_cap`, 0 fetch payant). Tueurs **V12 / V13 ROUGES**. SOLDÉE.
- **C-R-4** : (a) régime payant DÉCLARÉ + assertion nommée (voir C-G-2). (b) « consommé par le test » RETIRÉ ; consommateurs = course U-4b-1b + `runCli reconcile` ; **composition** `u4_oracle_path_ledger_reconciles_through_served_runcli` (`:469`, script réel → ledger → `runCli reconcile` : GO à Δ==RU, NO-GO `hard:total` à +1 sur copie) ; tueur **V14 ROUGE** (mauvais cycle ⇒ 7 tests rougissent, e2e non déclaratif). (c) `u4-probe.mjs` SUPPRIMÉ (voir résidu confirmé §2 ci-dessous). (d) **21 exports** re-mesurés (`Object.keys(import("@monark/rpc-guard")).length` = 21 ; le rendu G1 disait 22 — corrigé). SOLDÉE.

### (4) C-R-6 (grep durci) — SOLDÉE
`test:189,199` motif « nom LITTÉRAL de clé en mot entier » (`CHAINSTACK_(ETH|SOLANA|BASE|BSC|ROBINHOOD)_URL|HELIUS_API_KEY|BELL_SOLANA_RPC|POLYGON_API_KEY|DATABENTO_API_KEY`, épargne `CHAINSTACK_LABEL`) ⇒ tueur **V4 ROUGE** (alias `e_.CHAINSTACK_ETH_URL`). `test:225-234` **liste FERMÉE des imports** des 3 fichiers de course (`ALLOWED_IMPORTS`) ⇒ tueur **V5 ROUGE** (import direct `apps/sentinel/src/rpc.ts`). `apps/sentinel/src/rpc.ts` (résiduel-118, joignable seulement transitivement) DÉCLARÉ hors de l'ensemble autorisé (ADR + commentaire du test `:222-224`).

### (5) Survivants déclarés inertes V9 / V10 / V8b — D'ACCORD (mesuré + raisonné)
Les trois **SURVIVENT comme déclaré** (harnais : `SURVIVE(expected,inert)`, échouerait si l'un rougissait) :
- **V9** (retrait du `throw` RpcError avant le test transitoire) : INERTE — sans cette ligne, un `RpcError` tombe sur `isTransient(raw)` qui rend **false** pour un `PkgRpcError` (`u4-guard.mjs:117`) ⇒ `throw raw` de toute façon, jamais réessayé. Comportement observable identique.
- **V10** (`isTransient` unknown-shape `false`→`true`) : INERTE — la branche « unknown shape » est INATTEIGNABLE : le client gardé lève toujours une classe TYPÉE (`PkgBudgetError`/`PkgRpcError`/`PkgTransportError`), tuée en amont ; aucun chemin de test ne l'atteint.
- **V8b** (garde pre-exist `--ledger-dir` de u4-guard retirée) : INERTE — défense EN PROFONDEUR : le PAQUET `openGuardedClient` porte sa PROPRE garde C-8 identique (`rpc-guard: … does not pre-exist`), qui satisfait l'assertion `/does not pre-exist/` du test même si la couche u4-guard saute ; le cas UNIQUE à u4-guard (« sous-dépôt ») EST tué par **V8**. Honnête, non tu.

### (6) Aucune assertion affaiblie — CONFIRMÉ
Original 2b-iii (`0a4a333`) : 7 tests / 27 asserts → pli (`d311809`) : 16 tests / 67 asserts. La byte-identité est **RENFORCÉE** : `stripProv` (raw MOINS provenance) + 4 sous-champs → **sha256 du fichier ENTIER == REF** (provenance INCLUSE ; keyless, où j'ai prouvé base==migré==REF). `emode==ConcordantRevertError` keyless CONSERVÉ (`:252`) + `NoQuorumError` payant AJOUTÉ (`:312`). **Aucun nom de test original supprimé** (`comm -23` = vide). `selectIndices` verbatim.

### (7) Rebase sur 2b-ii — union des amendements ADR COHÉRENTE
**0 marqueur de conflit** dans les 5 fichiers du lot. ADR : amendements `2a` / `2b` / `2b-ii` (334) / **pli `2b-ii-c` (416)** / `2b-iii` (467) — chacun **UNE seule fois** (aucun doublon). Pas de contradiction : le 2b-ii ne réclame ni les scripts u4 ni le pont ; le 2b-iii déclare son grep SÉPARÉ (`scripts/census/u4-*.mjs`, fichier `guard-scripts-u4.test.ts`) distinct du grep 2b-ii (`ukemi/**`), l'unification restant un item G7. Les 4 fichiers code/test == manifeste worker (le rebase ne les a pas touchés) ; **l'ADR diffère du manifeste (attendu : le rebase l'a fusionné en union — voir note orchestrateur §Résidus).**

### (8) Oracle complet ×2 + R-25 — VERTS
| Gate | Code | Chiffres (env payant retiré) |
|---|---|---|
| `gate:vocab` | **0** | scanned 206 file(s), no forbidden claim |
| `typecheck` | **0** | tsc --noEmit silencieux |
| `test` run A | **0** | **tests 779, pass 778, fail 0, skipped 1** ; 0 `not ok` ; seul SKIP = `fetch_only_inside_client # until 1b` (pré-existant 2b-ii) |
| `test` run B | **0** | identique **779/778/0/1** (deux passes consécutives) |
| `lint` | **0** | eslint 0 problème |
| `lint:ratchet` | **0** | 69/69 |
| `lang:gate` | **0** | 0 non-exempt French hit |
| `export:check` | **0** | 0 forbidden path, 0 French hit |

Concorde EXACTEMENT avec la clôture de l'orchestrateur (779/778/0/1). **R-25** (pathspec VERBATIM `ci.yml:65`, `docs/**/*.md` exclus) :
- **Empreinte 2b-iii = 927** (vs `5394dfe`, base 2b-ii fusionné) : 5 fichiers, 733 ins + 194 del. Par fichier : `u4-guard.mjs` 167/0 (le retrait du pont a réduit de 180→167) ; `u4-oracle-path.mjs` 38/27 ; `u4-probe.mjs` 0/152 (supprimé) ; `u4-redraw.mjs` 23/15 ; `test/guard-scripts-u4.test.ts` 505/0.
- **Réconciliation du « 927 attendu vs e00f965 »** : sur la base pré-rebase du worker (`974ca3d` directement sur `e00f965`) l'empreinte était 927 ; sur `d311809` (rebasé sur `5394dfe`), `e00f965..d311809` = **1294 = 927 (2b-iii) + 367 (pli 2b-ii-c)** — mesuré : `e00f965..5394dfe` = 343+24 = **367** (concorde avec « R-25 367 » du log 2b-ii-c) ; 927 + 367 = 1294, **aucune ligne inexpliquée**. Sous le plafond (1150/1205).

**Invariants** : `git diff --quiet e00f965 -- apps packages fixtures scripts/census/u4b scripts/census/u3-realized.mjs scripts/census/u4-reduce.mjs scripts/census/u4-scores.mjs scripts/record-u4b-calib.mjs` = exit 0. Gel D4 (7 sha LF) INTACTS. `selectIndices` verbatim (dé-skip `u4_redraw_selects_by_book_digest_seed` vert).

---

## Mutants — 21/21 conformes (harnais pli adapté `WORKTREE→tree`, env payant scrubé, `harness exit=0`)
- **18 TUEURS ROUGES** sur leur test nommé, restauration byte-exacte : W1/W2/W3 (grep), W4 (budget), W5 (requires) ; **V2/V3** (fetch payant hors garde oracle/redraw) ; **V4/V5** (alias clé / import direct `rpc.ts`) ; **V6/MINE4** (unlock) ; **V7** (sonde d'env) ; **V8** (ledger-dir sous-dépôt) ; **V11** (redraw retries) ; **V12/V13** (floor/max-ru) ; **IDENT** (rpc2 sous-classe) ; **V14** (mauvais cycle, compose).
- **3 SURVIVANTS déclarés INERTES** conformes : V8b, V9, V10 (voir point 5).
- BASELINE après restauration : exit=0, failing=[], skipped=[] ; les 4 fichiers (dont `rpc2.ts` muté transitoirement pour IDENT) `sha == gold`. 0 `restored=false`, 0 `UNEXPECTED`/`FIND-NOT-PRESENT`.

---

## Résidus CONFIRMÉS (pas des corrections — ni bloquant, ni item nouveau)
- **`u4-probe.mjs` supprimé — refs en docs de provenance U-4a = résidu DÉCLARÉ, déjà rulé (C-R-4 c-bis).** J'ai re-vérifié la PRÉMISSE FACTUELLE du ruling du validateur : `git grep u4-probe` ⇒ cité UNIQUEMENT par `apps/sentinel/test/fixtures/ukemi/u4/PROVENANCE-u4.md:40` et `docs/adr/ADR-U4-book-et-calibration.md:13,182` (docs de PROVENANCE U-4a, historique de la production des bruts U-4a), **jamais** par un runbook/workflow/`package.json` (0). La suppression + la note dans l'ADR GARDE-HELIUS (2b-iii `:96`) est la disposition rulée ; les docs U-4a restent un enregistrement historique traçable. **Confirmé cohérent ; aucune action requise.** *(Facultatif, hygiène zéro-dette : une ligne « u4-probe.mjs retiré en GARDE-HELIUS-2b-iii » dans ces 2 docs U-4a fermerait le renvoi — NON bloquant, laissé à l'orchestrateur.)*
- **Note orchestrateur — `DELIVERED.sha256` antérieur au rebase.** Le manifeste du worker (pli sur `974ca3d`/`e00f965`) donne l'ADR `431a0de2…` ; à `d311809` l'ADR est l'UNION (+ amendement 2b-ii-c), sha différent (bénin). Les **4 fichiers code/test correspondent** au manifeste (rebase non touché). Re-manifester l'ADR au commit, ou noter que le manifeste précède le rebase.

## MAST résiduel
FM-3.2 (no/incomplete verification) — le mode qui portait mes C-G-1..4 et les C-R-1..6 — est **CLOS** : chaque propriété (spend/host, floor/max-ru, unlock/lock, composition, identité, grep littéral/imports fermés, byte-identité par sha committé) porte désormais un test nommé + un mutant tueur ROUGE, ré-exécutés ici. Aucun résidu bloquant.

---

## VERDICT
**PASS.** Le pli SOLDE mécaniquement C-R-1..4 (bloquants checkpoint-2) et C-G-1..5 (ma G2), chacun ré-vérifié de première main sur l'arbre rebasé : oracle 6 gates + suite ×2 (779/778/0/1), R-25 = 927 (décomposition 1294 = 927 + 367 prouvée), **C-R-1 base==migré==REF pour les 3 sha + no-`.git` 16/16/0-skip**, **21/21 mutants conformes** (18 tueurs ROUGES + 3 inertes SURVIVE, restauration gold byte-exacte), invariants + gel D4 intacts, union ADR sans conflit ni doublon, aucune assertion affaiblie. Les deux résidus (refs `u4-probe` en docs U-4a ; manifeste pré-rebase) sont un résidu déclaré rulé et un artefact de rebase bénin — **zéro correction formée**. Fusionnable au G7 de la seconde fusion ; la pièce reste `upcoming` (règle Branchement : un test n'est pas un consommateur ; `built` à la 1ʳᵉ course rapprochée).

---
### Intégrité (fin de revue)
- `git -C F:/tmp/g2-garde2biii/tree status --short` = **vide** ; 4 fichiers code/test == `DELIVERED.sha256` APRÈS tous les rejeux ; `rpc2.ts` restauré == gold.
- `git -C F:/Monark status --short` = **vide** ; `git -C F:/Monark-wt-garde2biii status --short` = **vide** (worktree gelé, aucune écriture de mon fait).
- Rien sur `C:` ; aucun réseau (fetch bouchonné, clés factices `.invalid`). **A-7** : env payant retiré (unset + `env -u` + scrub du harnais), aucune valeur imprimée.
- Travail hors dépôt (`F:\tmp\g2-garde2biii\`) : `logs/`, `crv1/` (preuve C-R-1 : base git-archive jonctionnée, no-git copie), `mutants-adapted.mjs`, ce rapport.

**R-20** : je ne committe pas, je ne déclenche aucun workflow. **R-1** : `claude-opus-4-8[1m]`.
