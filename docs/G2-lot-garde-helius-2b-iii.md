Modèle résolu : claude-opus-4-8[1m]

# G2 — RELECTEUR (instance neuve, contexte frais, revue 3 étapes AgileCoder) — GARDE-HELIUS-2b-iii (migration des scripts de course U-4b `u4-oracle-path.mjs`/`u4-redraw.mjs` sous `@monark/rpc-guard`)

(préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé.)

**Verdict : PASS-AVEC-CORRECTIONS.** Le cœur est SAIN. Oracle re-exécuté VERT (7 gates : `gate:vocab`/`typecheck`/`test`/`lint`/`lint:ratchet`/`lang:gate`/`export:check`, deux passes de suite consécutives 767/766/0/1), R-25 = **581** (verbatim `ci.yml:65`), les 5 fichiers touchés sont EXACTEMENT {3 scripts + 1 test + 1 ADR}, `apps`/`packages`/gel D4 (7 sha)/fixtures byte-identiques à `e7f22b8`, `selectIndices` verbatim, les **5/5 mutants worker** ROUGES + **3/3 mutants tueurs de mon cru** ROUGES sur leur test nommé (restauration byte-exacte), les DEUX rejeux byte-identiques **RUN (ne SKIPPENT PAS)** chez moi (5,8 s / 2,6 s), aucun chemin payant hors garde dans les deux scripts migrés, et — vérifié de première main même avec une vraie clé en env — le ledger/raws sont **labels-seuls** (aucune clé). **5 corrections C-G-1..5, TOUTES NON BLOQUANTES**, chacune fichier:ligne + test/mutant + déclencheur : (1) unlock servi/récupération de verrou NON testés ; (2) concordance e-mode de la jambe payante non byte-vérifiée et, à cette base, bascule `ConcordantRevertError`→`QuorumDisagreementError` (faux désaccord C-4/"0x", réglé par R-A en 2b-ii, moot par l'ordre de fusion) ; (3) inertie du pont d'identité prouvable seulement par le RETRAIT au G7 (conditionnelle à l'identité de classe de 2b-ii) ; (4) résidu dir `.u4-before` vide ; (5) hygiène d'ENV du réviseur/G1 (vraies clés héritées du profil). Zéro dette nue : chaque C-G est un item formé à déclencheur. **Aucune correction appliquée par moi.**

Cible **`5b66c7f`** (branche `lot/garde-helius-2b-iii`, base `e7f22b8`). Arbre ISOLÉ à historique COMPLET `F:\tmp\g2-garde2biii\tree` : `require.resolve('@monark/rpc-guard')` = `…\tree\packages\rpc-guard\src\index.ts` (résolu vers CET arbre, `@monark/*` junctionnés vers le tree ; `tree/node_modules` est un **répertoire réel**, pas un point d'analyse — vérifié `fsutil reparsepoint`, donc le transitoire TOCTOU tombe DANS le tree, jamais dans `F:\Monark\node_modules`). Base `e7f22b8` = **commit présent** (`git cat-file -t` = commit) ⇒ les rejeux ne skippent PAS. `TEMP/TMP/TMPDIR=F:\tmp\g2-garde2biii\os-tmp` (rien sur `C:`). Aucun `git` d'écriture, aucun commit (R-20). Sources restaurées byte-exact après chaque mutant (5 fichiers == `DELIVERED.sha256` APRÈS tous les rejeux).

---

## 1. Table EXIGENCE → fichier:ligne → test nommé (vert) → mutant (ROUGE prouvé, rejoué)

| Exigence (G0 ANNEXE 2b-iii / C-9 α / CONSIGNE) | fichier:ligne (`5b66c7f`) | test nommé (vert) | mutant → ROUGE (rejoué chez moi) |
|---|---|---|---|
| Aucune lecture de clé / fetch payant hors garde (toutes formes) | `u4-oracle-path.mjs` (aucune) ; `u4-redraw.mjs` (aucune) ; `u4-guard.mjs:22-30` | `guard_scripts_u4_grep_fetch_and_key_only_through_guard` | worker « key read restored by brackets » / « direct fetch restored » ROUGES ; MINE-2 « probe retiré de l'allowlist » ROUGE |
| Dépense uniquement via le garde (write-ahead, attempted==calls) | `u4-guard.mjs:142-165` `makeGuardedPoolCall` | `u4_oracle_path_spends_only_through_guard` | (couvert ; MINE-4 unlock ci-dessous) |
| Jambe payante métrée dans SON ledger | `u4-guard.mjs:96-108` `openU4GuardedClient` | `u4_oracle_path_paid_leg_is_metered_in_its_own_ledger` | forcé `--with-chainstack`+drpc benché ⇒ `chainstack.jsonl` ≥ 1 `attempted` (mesuré : 19) |
| Args budget REQUIS sans défaut (6) | `u4-guard.mjs:65-80` `parseBudgetArgs` (`need`) | `u4_oracle_path_requires_all_guard_budget_args` | worker « --max-ru optional » ROUGE ; **MINE-3 « --floor optional » ROUGE** |
| Refus de budget canonique, JAMAIS réessayé | `u4-guard.mjs:154` (`throw b` avant tally) ; `:126-135` `isTransient` | `u4_budget_refusal_is_canonical_and_not_retried` | worker « budget refusal retried » ROUGE (exit 2, 1 seule ligne `refused`, 0 fetch sur le refus) |
| Pont d'identité (paquet→pool) load-bearing | `u4-guard.mjs:30,113-121` `bridge` | `u4_oracle_path_replay_is_byte_identical_to_base` (asserte `emode_raw["8"]==ConcordantRevertError`) | **MINE-1 « moitié RpcError du pont neutralisée » ROUGE** (bascule en `NoQuorumError`, octets D_e changés) |
| Byte-identité D_e (rejeu vs `e7f22b8`) | `guard-scripts-u4.test.ts:174-195` / `:200-230` | `u4_oracle_path_replay_is_byte_identical_to_base` ; `u4_redraw_replay_is_byte_identical_to_base` | worker « script removed from scope » ROUGE (portée grep) |
| Portée grep non vacante (par entrée + ≥5) | `guard-scripts-u4.test.ts:152-168` | `guard_scripts_u4_grep_…` | MINE-2 ROUGE (l'entrée probe est porteuse) |
| `selectIndices` préservé verbatim | `u4-redraw.mjs:34-43` | `apps/sentinel/test/ukemi-u4-scores.test.ts:14` (import protégé) | diff `e7f22b8`↔HEAD = **byte-identique** (10 lignes) |

---

## 2. Oracle RE-EXÉCUTÉ (codes capturés DIRECTEMENT, hors pipe : `npm run X > log 2>&1; echo exit=$?`)

| commande | code | dernière ligne utile | rendu worker |
|---|---|---|---|
| `npm run gate:vocab` | **0** | `gate:vocab OK — scanned 204 file(s), no forbidden claim.` | 0, 204 ✓ |
| `npm run typecheck` | **0** | `tsc --noEmit` (aucune sortie) | 0 ✓ |
| `npm run test` (run A) | **0** | `ℹ tests 767 · pass 766 · fail 0 · skipped 1` (skip = `fetch_only_inside_client # until 1b`, pré-existant) | 767/766/0/1 ✓ |
| `npm run test` (run B) | **0** | idem 767/766/0/1, `not ok` = 0 | 2 runs verts ✓ |
| `npm run lint` | **0** | `eslint .` (0 problème) | 0 ✓ |
| `npm run lint:ratchet` | **0** | `lint-ratchet: 69/69 (… measured_on 2026-09-16)` | 0, 69/69 ✓ |
| `npm run lang:gate` | **0** | `lang-gate OK — 0 non-exempt French hit(s)` | 0 ✓ |
| `npm run export:check` | **0** | `check OK — 0 forbidden path, 0 non-exempt French hit` | 0 ✓ |

**Flake TOCTOU CORRIGÉ — CONFIRMÉ.** `export_public_no_governance_no_french` (test 42) — la cible du flake — passe dans les DEUX runs pleins consécutifs (38,6 s run A ; 41,0 s run B) ; aucune ligne `not ok` dans aucun run. Le transitoire vit sous `node_modules/.u4-before/<tag>.mjs` (profondeur 2, dans les SKIP_DIRS de lang-gate ET de la marche d'export) ⇒ plus de course create/delete avec la marche du dépôt. Les DEUX rejeux byte-identiques **RUN** (5,8 s / 2,6 s, non SKIP) : la byte-identité est vérifiée chez moi (historique complet). Logs : `F:\tmp\g2-garde2biii\logs\`.

---

## 3. R-25 (pathspec `ci.yml:65` VERBATIM, base→HEAD 3-dot comme la CI)

`git merge-base e7f22b8 HEAD` = `e7f22b8` (base = ancêtre direct ⇒ 3-dot == 2-dot). Pathspec verbatim (docs `**/*.md`, lockfile, fixtures exclus) :
= **`4 files changed, 539 insertions(+), 42 deletions(-)`** ⇒ CHANGED = 539+42 = **581**. Par fichier (numstat) : `u4-guard.mjs` +180 ; `u4-oracle-path.mjs` +38/−27 ; `u4-redraw.mjs` +23/−15 ; `test/guard-scripts-u4.test.ts` +298. L'ADR `.md` est EXCLU. **Identique au rendu.** Seuil réel de la garde = **1205** (`ci.yml:41` `VIBEGATES_PR_LIMIT`) ; la mission/rendu citent 1150 ; **581 passe les deux** (note factuelle, pas une correction).

---

## 4. Mutants

### 4a. Les 5 mutants worker REJOUÉS dans l'arbre isolé (`mutants-adapted.mjs`, `WORKTREE→tree`)
```
key read restored by brackets   guard_scripts_u4_grep…              red:true restored:true green:true  PASS
direct fetch restored           guard_scripts_u4_grep…              red:true restored:true green:true  PASS
script removed from scope       guard_scripts_u4_grep…              red:true restored:true green:true  PASS
budget refusal retried          u4_budget_refusal_is_canonical…     red:true restored:true green:true  PASS
--max-ru optional               u4_oracle_path_requires_all…        red:true restored:true green:true  PASS
ALL MUTANTS CAUGHT.
```
Tree byte-clean après (git status vide). 5/5 confirmés.

### 4b. Mes mutants (contexte frais, `F:\tmp\g2-garde2biii\my-mutants.mjs`)
```
MINE-1 bridge RpcError half neutralised -> emode revert flips NoQuorumError  u4_oracle_path_replay…       RED  (killed)
MINE-2 u4-probe removed from allowlist -> grep RED                           guard_scripts_u4_grep…       RED  (killed)
MINE-3 --floor made optional -> requires-args RED                            u4_oracle_path_requires…     RED  (killed)
MINE-4 unlockAll neutralised (no operator released) -> EXPECT SURVIVE         u4_oracle_path_spends…       SURVIVE  => C-G-1
```
- **MINE-1** prouve le pont load-bearing SUR LE REJEU RÉEL : neutraliser la moitié `RpcError` fait passer `emode_raw["8"]` de `ConcordantRevertError` à `NoQuorumError` ⇒ octets D_e changés ⇒ la byte-identité rougit. (Point 2.)
- **MINE-2** prouve l'entrée d'allowlist porteuse : le probe fuit réellement (`process.env.CHAINSTACK_ETH_URL:67`) ; retiré de l'allowlist ⇒ scanné ⇒ hit ⇒ ROUGE. (Point 3.)
- **MINE-3** prouve `--floor` réellement requis (le worker n'avait muté que `--max-ru`). (Point 4.)
- **MINE-4 SURVIT** ⇒ **AUCUN test n'asserte l'unlock servi** (voir C-G-1). `unlockAll` est FONCTIONNEL (mesuré hors bande : 5/5 lignes `unlocked`, tous les `.lock` relâchés) mais non asserté.

Tree byte-clean après mes mutants (git status vide ; 5 fichiers == `DELIVERED.sha256`).

---

## 5. Invariants byte-identiques (blob `e7f22b8` ↔ HEAD `5b66c7f`)
- **Ensemble EXACT des fichiers changés** (`git diff --name-status`) : `M` ADR-GARDE-HELIUS…md ; `A` `u4-guard.mjs` ; `M` `u4-oracle-path.mjs` ; `M` `u4-redraw.mjs` ; `A` `test/guard-scripts-u4.test.ts`. **Rien d'autre.**
- **Invariant reproductible** `git diff --quiet e7f22b8 HEAD -- apps packages scripts/record-u4b-calib.mjs scripts/census/u4b scripts/census/u3-realized.mjs scripts/census/u4-reduce.mjs scripts/census/u4-scores.mjs …fixtures/ukemi` = **exit 0** (apps/packages/gel/fixtures byte-identiques).
- **Gel D4 (7 sha, `git show HEAD:<f> | tr -d '\r' | sha256sum`)** : `u4b-scores 9ad20666…`, `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…`, `wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`, `rpc.ts 0e232519…` — **tous concordants** ADR-U4b D4. Intact.
- **`selectIndices`** (`u4-redraw.mjs:34-43`) : diff `e7f22b8`↔HEAD du corps de fonction = **IDENTIQUE** (10 lignes) ⇒ l'import protégé `ukemi-u4-scores.test.ts:14` reste valide (la suite est verte).
- **Invariant LITTÉRAL de mission** (`git diff --quiet … scripts/census …`) : INSATISFIABLE par construction (la migration en place touche `scripts/census`, exigée par l'ANNEXE C-9 α ET forcée par l'import protégé). Le worker le déclare et fournit l'invariant reproductible ci-dessus. **Correct.**

---

## 6. Points à JUGER (verdict par point)

**(1) Byte-identité du rejeu — PASS (probant).** Les DEUX rejeux RUN (non SKIP) et VERTS. `u4_oracle_path_replay…` : raw JSON **hors `provenance`** byte-identique + `inputs.jsonl` byte-identique + `provenance.{calls,calls_by_operator,calls_by_method,endpoints}` égaux + `emode_raw["8"]==ConcordantRevertError` (catégorie e-mode qui REVERT, exercée). `u4_redraw_replay…` : rapport `--out` byte-identique + `all_match==true`. **`provenance` EXCLUE du corps byte-identique — motif CORRECT et load-bearing** : le label de la jambe payante change légitimement (`archive-env`→`chainstack`, décision 121) et différerait sous une fixture payante ; le D_e (ce qui nourrit `u4b-reduce`) est ce qui doit être — et est — byte-identique, et les 4 champs de tally keyless sont vérifiés pour prouver que le tally par LABEL reproduit l'ancien `byOperator`. Fixture bouchonnée réaliste (succès + revert e-mode cat 8 + getLogs). **Réserve (C-G-2)** : la fixture est keyless-seule — REPRÉSENTATIVE du chemin NOMINAL (mesuré : drpc up ⇒ 2 opérateurs keyless distincts concordent ⇒ `ConcordantRevertError`, `chainstack` dernier jamais atteint pour cat 8) ; la concordance e-mode de la JAMBE PAYANTE sous panne n'est pas byte-vérifiée (voir C-G-2, non bloquant).

**(2) Pont d'identité `u4-guard.mjs` (`:30,113-121`) — PASS aujourd'hui ; inertie post-2b-ii NON BLOQUANTE (C-G-3).** Correct à cette base : `bridge` convertit `PkgBudgetError`→`PoolBudgetError` (`:118`) et `PkgRpcError`→`PoolRpcError` (`:119`), chaque conversion gardée `!(e instanceof PoolClass)`. Load-bearing PROUVÉ (MINE-1 : neutraliser la moitié RpcError ⇒ `emode_raw["8"]` bascule `NoQuorumError`, `isRpcRevert` de `rpc2.ts:53-54` teste la classe LOCALE). **Inertie après 2b-ii = CONDITIONNELLE** à ce que 2b-ii donne l'IDENTITÉ de classe (`PoolRpcError===PkgRpcError` par ré-export) ; si 2b-ii enveloppe au lieu de ré-exporter, `!(e instanceof PoolRpcError)` reste vrai et le `new PoolRpcError(e.message,e.code,e.data)` d'ARITÉ-3 serait atteint contre la signature paquet 6-arg. **Le test qui le prouve au G7 = le RETRAIT lui-même** (u4-guard n'importe plus de classes d'erreur de `rpc2.ts`) + rejeu de la byte-identité/emode sur l'arbre fusionné — « inerte si laissé » est du code mort non testable. Item formé 1 du rendu, RENFORCÉ en C-G-3.

**(3) Aucun chemin payant hors garde dans les 2 scripts — PASS ; `u4-probe` allowlisté = item formé ACCEPTABLE, pas un résidu caché.** `u4-oracle-path.mjs`/`u4-redraw.mjs` : 0 lecture de clé, 0 `fetch` direct (grep VERT + lecture du diff : l'ancien `process.env.CHAINSTACK_ETH_URL` + `makeBudgetedCall` de `record.ts` sont SUPPRIMÉS ; tout passe par `openU4GuardedClient`). `u4-probe.mjs` : lit BIEN `process.env.CHAINSTACK_ETH_URL:67` ET dépense via `makeBudgetedCall:72` hors garde — MAIS (a) **jamais importé ni sous-processé** par les deux scripts migrés (grep : aucune ref, aucun `spawn`/`child_process`), CLI standalone ; (b) allowlisté avec entrée **non-vacante** (MINE-2 ROUGE) ; (c) **désarmé structurellement avant la course** — ses imports de `record.ts` (`makeDefaultCall`/`makeBudgetedCall`/`operatorLabel`) MEURENT à la fusion 2b-ii (le module ne chargera plus) ; (d) `--block != B0` throw. Le déclencheur « migrer-ou-supprimer avant toute re-exécution » + la mort d'import est ce qui empêche que ce soit le « second résiduel payant pour la course » qui exigerait ESCALADE (C-9). **Vérifié de première main** : même avec une (vraie puis fausse) `CHAINSTACK_ETH_URL` en env, le ledger/raws des scripts migrés sont **labels-seuls** (aucune URL/clé ; `grep`=0 ; ligne ledger = `chainstack|unlock`).

**(4) Refus jamais réessayé / args requis / N unlock / verrou — PASS avec C-G-1 (tests d'unlock manquants).** Refus : `throw b` (`:154`) AVANT tally et retry, + `isTransient` renvoie faux pour BudgetError (`:128`) — double garde ; test 5 : exit 2, 1 ligne `refused`, 0 fetch. Args : `need()` fail-closed sur les 6 (`:66-79`), test 4 les DROP un à un ; MINE-3 ajoute le mutant `--floor`. N unlock : `unlockAll:171-180` itère `client.operators()` — **fonctionnel** (mesuré : 5/5 `unlocked`, tous `.lock` relâchés) MAIS **non asserté** (MINE-4 survit). Verrou après exception : `finally` appelle `unlockAll` (oracle-path `:166-169`, redraw `:124-127`) — vérifié. Verrou après SIGTERM : laissé pour la reprise (déclaré ADR/RENDU, **non testé**). ⇒ **C-G-1**. Bonus vérifié : `--with-chainstack` sans clé ⇒ `FATAL rpc-guard: requested operator 'chainstack' is not resolved from env (fail-closed)`, exit 1 (le fail-close est réel).

**(5) Correctif TOCTOU — PASS (propre, une nit).** Le transitoire `node_modules/.u4-before/<tag>.mjs` (profondeur 2) résout ROOT et `../../apps/…` à l'identique de `scripts/census/`, vit dans les SKIP_DIRS de lang-gate + marche d'export, gitignore, hors R-25/invariant/grep. **N'écrit PAS dans `F:\Monark\node_modules`** : `tree/node_modules` est un répertoire RÉEL (vérifié `fsutil`), et `F:/Monark/node_modules/.u4-before` **n'existe pas** après mes runs. Deux runs pleins consécutifs verts (test 42). **Nit (C-G-4)** : le FICHIER est `rmSync` en `finally` mais le DIR `.u4-before` reste (vide) ; en dépôt réel il laisserait un dir vide gitignoré dans `F:\Monark\node_modules`. Non bloquant.

**(6) Rejeux SKIP en CI shallow (`ci.yml:103`) — PASS comme item formé.** Confirmé : job `test` (`:103`) SANS `fetch-depth` ⇒ shallow ⇒ `e7f22b8` absent ⇒ les 2 rejeux SKIP (message explicite, pas un faux vert) ; job `r25` (`:40`) a `fetch-depth: 0`. Les **5 tests critiques** (grep, spend, paid, requires, budget) tournent PARTOUT (ne dépendent pas du blob de base) ; seul le rejeu de régression byte-identique SKIP en CI, vérifié en historique complet (local + oracle d'arbre fusionné de l'orchestrateur). **Acceptable comme item formé 6** (propriétaire orchestrateur, déclencheur : ajouter `fetch-depth:0` au job `test` s'il veut le gater en CI). La propriété EST vérifiée au G7.

**(7) Tally « par tentative » — PASS (cohérent ledger + ADR-U4b D5).** `count()` (`:146,:156`) au niveau TENTATIVE (= la ligne ledger write-ahead) ; un refus de budget n'est PAS compté (`throw` avant `:156`) — calque `makeBudgetedCall`. ADR-U4b D5 : « Tout appel compté en TENTATIVES ». Vérifié : test 3 asserte `attempted ledger == calls == fetches` ; ma course hors bande : `attempted`=40 == `calls`=40. Glissement (vs « par appel ») déclaré, ne se manifeste que sous retry transitoire (absent de la fixture) ⇒ byte-identité préservée.

**(8) Invariants — PASS.** Voir §5 (5 fichiers exacts ; apps/packages/gel/fixtures byte-identiques ; 7 sha D4 intacts ; `selectIndices` verbatim).

**(9) ADR (amendement 2b-iii, `:334-394`) — PASS.** Tuyau déclaré (entrée argv+`process.env`→`openGuardedClient` / sortie `<ledger>/<cycle>/<op>.jsonl` / état branché-au-G7-2b-iii, upcoming public / test `guard-scripts-u4.test.ts`) ; état (ledger durable hors dépôt, N unlock, SIGTERM→reprise) ; contrat de migration ; pont d'identité ; byte-identité ; **résidus nommés à déclencheur** (probe, scripts câblés e2/prereg-1b, U-4b-0 0-2/0-3, unification grep G7, pont). **Aucun renvoi `F:\tmp`** (vérifié). Réserve C-G-2 : le résidu « bascule e-mode payante » n'est pas explicitement nommé.

**(10) MAST résiduel — voir §9.**

---

## 7. Corrections FORMÉES (aucune appliquée par moi ; un worker de pli applique)

- **C-G-1 (NON BLOQUANT) — unlock servi & récupération de verrou NON testés (CONSIGNE E-1 non tenue au niveau 2b-iii).**
  - *Mesuré* : **MINE-4 SURVIT** — `unlockAll` neutralisé (`for (const op of [])`) ne rougit aucun test. Aucune assertion de `unlocked`/`.lock` dans `guard-scripts-u4.test.ts`. `unlockAll` (`u4-guard.mjs:171-180`) est FONCTIONNEL (mesuré : 5 opérateurs → 5 lignes `unlocked`, tous `.lock` relâchés) mais non asserté ; le verrou-après-SIGTERM (laissé, repris par N `runCli unlock`) est déclaré, non testé.
  - *Correctif* : test `u4_oracle_path_unlocks_all_requested_operators` (une ligne `unlocked` par opérateur demandé, keyless compris, après course propre) + test « verrou laissé après kill dur, récupéré par N unlock » (E-1 « détectable et récupérable ») + mutants nommés. *Fichier* : `test/guard-scripts-u4.test.ts` (neufs) ; `u4-guard.mjs:171-180`.
  - *Déclencheur* : pli/G1 de 2b-iii OU G7 d'unification. *error_origin* : worker (couverture de test).

- **C-G-2 (NON BLOQUANT) — concordance e-mode de la JAMBE PAYANTE non byte-vérifiée ; le chemin payant sous panne diverge du keyless.**
  - *Mesuré (première main)* : sous `U4T_FAIL_DRPC` + `--with-chainstack` (drpc benché ⇒ chainstack entre dans le quorum e-mode cat 8), `emode_raw["8"] == QuorumDisagreementError` (vs `ConcordantRevertError` sur le chemin nominal). Cause : le message de revert `chainstack` (payant) est la forme PRÉAMBULE D6 ≠ « execution reverted » keyless, `data=="0x"` ⇒ `revertKey` (`rpc2.ts:60`) retombe sur le message ⇒ clés distinctes. C'est **exactement le faux désaccord C-4/"0x"** du checkpoint-1, RÉGLÉ par R-A (option 1, 2b-ii : `isRpcRevert` bench la jambe payante à data `"0x"`).
  - *Fait discriminant (mesuré) sur l'ordre de fusion* : `operatorOf` (`rpc2.ts:22`) collapse `nodies.app` ET `pocket.network` en UN opérateur `pocket`. Donc **sous drpc benché il ne reste qu'UN opérateur keyless** (`pocket`) pour `eth_call` ; post-R-A la jambe payante `"0x"` est benchée ⇒ `got.length===1` ⇒ **`NoQuorumError`** (pas `ConcordantRevertError`) — clause C-4 « `NoQuorumError` si aucun autre opérateur ». Le **chemin NOMINAL** (drpc UP, mesuré première main : `emode_raw["8"]==ConcordantRevertError`, `chainstack` **0 ligne `attempted` eth_call** — dernier, jamais atteint pour cat 8) est keyless-dérivé et INCHANGÉ par la jambe payante. La fixture keyless-seule est donc REPRÉSENTATIVE du D_e nominal ; la byte-identité tient.
  - *Correctif* : (a) NOMMER ce résidu dans l'ADR 2b-iii (« byte-identité keyless-seule ; la jambe payante `"0x"` sous panne bascule en faux désaccord jusqu'à R-A/2b-ii, puis `NoQuorumError` par le collapse d'opérateur — jamais servie sur le chemin nominal ») ; (b) au G7 d'unification (post-R-A), pin du CHEMIN NOMINAL dans `u4_oracle_path_paid_leg_is_metered…` (`test:250`, drpc UP) : `emode_raw["8"]==ConcordantRevertError` ET `chainstack.jsonl` **0 `attempted` eth_call** pour cat 8 (la jambe payante, dernière, n'est pas atteinte ⇒ le D_e e-mode nominal est keyless-dérivé). *Fichier* : `u4-oracle-path.mjs:114-125` ; `test/guard-scripts-u4.test.ts:250-261` ; ADR résidus.
  - *Déclencheur* : G7 d'unification / fusion R-A. *error_origin* : déclaré (worker sous-nomme le changement D_e de la jambe payante ; implicitement rulé par R-A/C-4).

- **C-G-3 (NON BLOQUANT) — inertie du pont conditionnelle à l'identité de classe de 2b-ii ; prouver par le RETRAIT, pas par « inerte si laissé ».**
  - *Mesuré* : `u4-guard.mjs:119` `new PoolRpcError(e.message, e.code, e.data)` est d'arité 3 ; si 2b-ii n'obtient PAS `PoolRpcError===PkgRpcError` (ré-export identité), le garde `!(e instanceof PoolRpcError)` reste vrai et cette construction est ATTEINTE contre la signature paquet 6-arg.
  - *Correctif* : au G7 d'unification, RETIRER le pont (u4-guard n'importe plus `BudgetExceededError`/`RpcError` de `rpc2.ts:30`) — acte VÉRIFIABLE — puis rejouer `u4_oracle_path_replay…` sur l'arbre fusionné (emode = `ConcordantRevertError` via les classes paquet re-exportées). *Fichier* : `u4-guard.mjs:30,113-121`.
  - *Déclencheur* : fusion 2b-ii+2b-iii (G7). (Item formé 1 du rendu, renforcé.) *error_origin* : worker/plan (déclaré).

- **C-G-4 (NON BLOQUANT, nit) — le dir transitoire `.u4-before` n'est pas nettoyé.**
  - *Mesuré* : le FICHIER `<tag>.mjs` est `rmSync` en `finally` mais le DIR `node_modules/.u4-before/` reste (vide). Inoffensif (gitignore, hors grep/R-25/invariant) ; en dépôt réel laisse un dir vide dans `F:\Monark\node_modules`.
  - *Correctif* (optionnel) : `rmSync(dir,{recursive,force})` en fin, OU l'accepter en résidu déclaré. *Fichier* : `test/guard-scripts-u4.test.ts:101-110,194,229`. *error_origin* : worker.

- **C-G-5 (NON BLOQUANT — hygiène d'ENV du réviseur/G1, PAS un défaut du code 2b-iii).**
  - *Mesuré* : le shell de revue (et, par le même profil utilisateur, vraisemblablement le worktree G1) hérite de **VRAIES clés de production** (`CHAINSTACK_ETH_URL`, `HELIUS_API_KEY`, `CHAINSTACK_{ROBINHOOD,SOLANA,BASE,BSC}_URL`). **Aucune fuite dans les artefacts du LOT** : tous les tests bouchonnent `globalThis.fetch` (aucun egress), et le ledger/raws sont **labels-seuls** (`grep`=0 sur la valeur, même avec clé vraie puis fausse en env). **MAIS (lapsus de ma part, à signaler honnêtement, R-21)** : lors du diagnostic j'ai imprimé UNE fois les valeurs `CHAINSTACK_ETH_URL` et `HELIUS_API_KEY` dans le transcript OUTIL (un `echo` de la variable) ⇒ ces valeurs sont **à considérer exposées à ce transcript** ; **rotation recommandée** si le transcript est conservé (décision orchestrateur). Je ne reproduis pas les valeurs ici.
  - *Correctif* : (i) lancer workers/réviseurs avec ces variables **unset** (le harnais scrube `CHAINSTACK_*`/`HELIUS_*` avant de spawn les tests) — la CONSIGNE A-4 « clés factices » implique un ENV sans vraie clé ; (ii) contrôle de présence uniquement (`[ -n "$X" ]`), jamais `echo` de la valeur. *error_origin* : orchestrateur/outillage (hygiène d'environnement) + réviseur (impression diagnostique).

---

## 8. CONSIGNE STANDARD G1 — point par point (fait / n-a avec motif)

- **A-1** Première ligne « Modèle résolu » — FAIT (rendu + cet avis). **A-2** `node_modules` résout `@monark/*` vers l'arbre — FAIT (require.resolve vérifié). **A-3** codes directs, oracle complet — FAIT (§2, + `export:check` que le rendu ajoute). **A-4** `DELIVERED.sha256` (5 fichiers) — FAIT ; rien sur `C:` — FAIT (TEMP redirigé) ; réseau bouchonné — FAIT ; **clés factices — voir C-G-5** (l'ENV portait de vraies clés, sans egress ni fuite). **A-5** R-25 verbatim `ci.yml:65` (581) — FAIT ; docs exclus — FAIT. **A-6** invariants byte-identiques + gel D4 intact — FAIT (§5).
- **B (secrets)** — **B-1/B-2/B-3** (expurgation/troncature/formes de clé) = n/a à 2b-iii (le corps d'erreur est expurgé DANS le paquet 2b-i ; les scripts ne construisent aucun message d'opérateur). **B-4** le code ne SONDE pas l'env (`env.X`/`env["X"]`/`in`/destructuration) hors garde — FAIT (grep 8 motifs, VERT ; MINE-2 porteur) ; opérateurs+cycle en args CLI requis — FAIT. **B-5** grep fail-closed, allowlist `Map<path,trigger>`, non-vacuité PAR ENTRÉE + mutant — FAIT (`test:135-168`). **B-6** hôte admis — n/a (le paquet résout label→URL ; les scripts ne voient que des labels).
- **C (identités)** — **C-1** une classe canonique / `instanceof` stable — n/a à la base `e7f22b8` (rpc2 déclare encore ses classes) ; le **pont** est le contournement DÉCLARÉ (item formé, retrait 2b-ii) — C-G-3. **C-2** refus jamais réessayé + test + mutant — FAIT. **C-3/C-4** une couche de retry / classifieurs de `classify.ts` — appelant-seul FAIT (`isTransient`) ; classifieurs = concern 2b-ii.
- **D (tests)** — **D-1** chaque test imposé a son mutant nommé rejoué par harnais byte-exact — FAIT (5 worker) ; **lacune** : unlock sans mutant tueur (C-G-1). **D-2** vecteur synthétique non vide, clés fermées, valeur recomputée — FAIT (fixture bouchonnée, `PREREG_SHA` calculé, non codé). **D-3** e2e non-LLM par tuyau, seul `globalThis.fetch` bouchonné — FAIT (rejeu réel `openGuardedClient`, pas de faux client). **D-4** aucune assertion affaiblie — FAIT (tests neufs ; `selectIndices` verbatim).
- **E (concurrence/état)** — **E-1** verrou `wx` détectable/récupérable + test + mutant — **PARTIEL** : le verrou est celui du PAQUET (testé 2a T13) ; l'unlock servi de 2b-iii **non testé** ⇒ C-G-1. **E-2** ledger durable hors dossier, parent pré-existant, jamais reset-on-missing — FAIT (`assertLedgerDir:82-90` exige hors-dépôt + pré-existence). **E-3** backoffs déclarés à l'ADR — **PARTIEL** : valeurs 500 ms/8000 ms/3-0 retries dans `u4-guard.mjs:142`/`oracle-path:70` ; l'ADR ne cite que les compteurs de retry (3/0), pas les ms — nit éditorial.
- **F (rédaction)** — **F-1** ADR ligne Tuyaux, aucun renvoi `F:\tmp`, résidus à déclencheur — FAIT (réserve C-G-2 : nommer le résidu e-mode payant). **F-2** `gate:vocab` / clés — FAIT (gate:vocab 0 ; clés factices/pas de littéral secret). **ASCII — PARTIEL (mesuré, R-21)** : `git diff e7f22b8 HEAD` des ajouts porte **2 caractères non-ASCII** — un em-dash `—` (U+2014) dans le message BUDGET STOP (`u4-oracle-path.mjs`) et un dans un commentaire (`u4-guard.mjs`), en prose anglaise (ni identifiant, ni français, ni vocabulaire interdit). ASCII-dans-les-sources est une **CONVENTION** (G0 §12, « pas un gate ») ; `gate:vocab`/`lang:gate` verts. Déviation triviale (style pré-existant `B₀`/`—`), NON BLOQUANTE. **F-3** déviations déclarées — FAIT (glissement tally, byte-identité keyless-seule).
- **G-1** (pièce publique → relire décisions investisseur) — n/a : 2b-iii ne touche NI registre `built`/`upcoming` public, NI liste d'outils, NI README/skill/site/export (le registre reste `upcoming` jusqu'à la 1ʳᵉ course ; `test/` racine jamais exporté).

---

## 9. Contrôle MAST (14 modes — résiduel)
- **FM-1.1/1.2** n/a — périmètre strict {2 scripts + helper + test + ADR} ; R-20 respecté (aucun commit).
- **FM-2.3 Task derailment** n/a — apps/packages/gel byte-identiques (§5).
- **FM-2.4 Information withholding** — mineur : résidu e-mode payant sous-nommé (C-G-2), unlock non asserté (C-G-1), backoff-ms hors ADR (E-3 nit).
- **FM-3.2 No/incomplete verification** — **LE mode résiduel** : unlock/verrou-SIGTERM non épinglés (C-G-1) ; byte-identité SKIP en CI shallow (item 6, vérifiée en historique complet) ; concordance e-mode payante non byte-vérifiée (C-G-2).
- **FM-3.3 Incorrect verification** — écarté : mesures re-exécutées sur arbre isolé à résolution `@monark/*` correcte, historique complet (rejeux non-skip), codes directs. **Finding hygiène** : ENV avec vraies clés (C-G-5), sans egress ni fuite (mesuré).
- Fuite de secret → **écartée de première main** : ledger/raws labels-seuls même avec clé (vraie puis fausse) en env ; grep 8 motifs VERT + fail-close `--with-chainstack` sans clé.
- Dépense hors ledger → écartée (`attempted==calls==fetches`, write-ahead).

## 10. error_origin PROPOSÉ (au G7)
Conception 2b-iii = **plan sain** (ANNEXE C-9 α, contrat de migration). Exécution : **worker** pour C-G-1 (couverture unlock), C-G-2 (déclaration du résidu e-mode payant), C-G-4 (nit dir), toutes NON BLOQUANTES à déclencheur G7/pli. C-G-3 = worker/plan (inertie conditionnelle, déjà item formé). C-G-5 = **orchestrateur/outillage** (hygiène d'ENV, hors code du lot). Aucune correction bloquante ⇒ pas de frontière d'escalade sur CE sous-lot.

---

## VERDICT
**PASS-AVEC-CORRECTIONS.** Cœur SAIN : oracle 7 gates VERT (deux passes de suite consécutives 767/766/0/1, flake TOCTOU corrigé), R-25 = 581, 5 fichiers exacts, apps/packages/gel D4/fixtures byte-identiques, `selectIndices` verbatim, **5/5 mutants worker + 3/3 mutants tueurs de mon cru ROUGES** (restauration byte-exacte), rejeux byte-identiques **non-skip** chez moi et **probants** (bridge load-bearing prouvé sur le rejeu réel), aucun chemin payant hors garde dans les 2 scripts migrés (ledger labels-seuls vérifié de première main), refus/args/tally/unlock corrects (unlock fonctionnel). **5 corrections C-G-1..5 TOUTES NON BLOQUANTES**, chacune fichier:ligne + test/mutant + déclencheur — **zéro dette formée**, jamais un « dû » nu. Le sous-lot est fusionnable ; les C-G-1/2/3 sont à plier **avant / au G7 d'unification 2b-ii+2b-iii** (unlock testé, résidu e-mode payant nommé + assertion post-R-A, pont RETIRÉ). Registre : la pièce reste `upcoming` (branchée au G7 2b-iii ; `built` à la 1ʳᵉ course rapprochée).

---
### Intégrité (fin de revue)
- `git -C F:/tmp/g2-garde2biii/tree status --short` = **vide** ; les 5 fichiers livrés == `DELIVERED.sha256` APRÈS tous les rejeux.
- `git -C F:/Monark status --short` = **vide** (aucune écriture de mon fait).
- `git -C F:/Monark-wt-garde2biii status --short` = **vide** (worktree gelé intact).
- `F:/Monark/node_modules/.u4-before` **n'existe pas** ; le seul résidu est un dir vide gitignoré dans `tree/node_modules` (C-G-4).
- Fichiers de travail (hors dépôt, `F:\tmp\g2-garde2biii\`) : `logs/`, `mutants-adapted.mjs`, `my-mutants.mjs`, `preload-probe.mjs`, `paid-preload.mjs`, `ledger-*/`, `raws-*/`, `os-tmp/`, et ce rapport. Rien sur `C:`. Aucun réseau (fetch bouchonné). Vraies clés d'ENV **unset** après diagnostic (C-G-5).

**R-20** : je ne committe pas, je ne déclenche aucun workflow. **R-1** : `claude-opus-4-8[1m]`.
