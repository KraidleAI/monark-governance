# RENDU-G1 — GARDE-HELIUS-2b (moitié PAQUET : indice fermé + classe canonique + `.data`)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni). Worker G1, 2026-09-21,
worktree `F:\Monark-wt-garde2b`, branche `lot/garde-helius-2b`, base `1a4fd55`. **Aucun commit (R-20)**, aucun workflow, aucun appel réseau
(transports bouchonnés, clés FACTICES `FAKEKEY-…`, hôtes `.invalid`), aucune valeur d'env de clé lue. Jonction `node_modules → /f/Monark/node_modules`
intacte (jamais `npm ci/install`, jamais `rm -rf`). Réviseur = orchestrateur (R-21).

## 0. DÉCISION DE DÉCOUPE (R-25 > 1150 mesuré/estimé) — couture de repli pré-déclarée activée
Le 2b complet dépasse le plafond R-25 de 1150. La couture pré-déclarée (complément C-2 §46 / addendum C-5 : `paquet : indice fermé + classe
canonique + data` / `migration du recorder + grep`) est activée. **Cette G1 livre la moitié PAQUET** (dépendance en amont : `rpc2.ts` ne peut
importer `RpcError`/`isResultLimit`/… qu'une fois exportés par le paquet). **La moitié MIGRATION est un item formé à déclencheur (§8).**

- **Paquet (MESURÉ)** : 317 ins + 35 del = **352** (pathspec `ci.yml:65` verbatim, `docs/**/*.md` exclus).
- **Migration (estimé, FOURCHETTE ancrée sur des tailles de fichier mesurées)** : `record.ts` réécrit (467 l., suppression `makeDefaultCall`/
  `makeBudgetedCall`/`defaultCall`/`fetch` + câblage garde ≈ 260) + `rpc2.ts` ré-exports (30-50) + **ripple mesurée dans 3 fichiers de test** qui
  importent les symboles supprimés — `ukemi-record.test.ts` (327 l., 13 usages `makeDefaultCall`/`backoffDelay`), `ukemi-u4a.test.ts` (230 l.,
  **17 usages** de `makeBudgetedCall`/`operatorLabel`/`scrubUrls`/`ARCHIVE_ENV_LABEL`/`applyExcludeOperators`), `ukemi.test.ts` (importe `defaultCall`)
  + les ~15 tests imposés + end-to-end + conformité inter-paquets + grep.
  - **Borne BASSE (~800)** : retirer les 9 tests `makeDefaultCall` (citer la couverture transport du paquet, non réécrire) ; seuls les tests
    `makeBudgetedCall`-dépendants de `ukemi-u4a.test.ts` cassent (pas les 11) ; `rpc2` ≈ 30. ⇒ **total ≈ 1150, à la LIGNE**.
  - **Borne CENTRALE (~945)** : réécrire (non retirer) une partie des tests, ripple `ukemi-u4a` plus large. ⇒ **total ≈ 1297 > 1150**.
- **Le seuil est franchi ou frôlé dans les deux cas**, et > la projection 550-900 de l'orchestrateur (qui n'a pas chiffré la ripple
  `ukemi-u4a.test.ts`). Le mutant imposé « `makeBudgetedCall` local restauré ⇒ ROUGE » exige la SUPPRESSION de `makeBudgetedCall`, ce qui casse
  structurellement `ukemi-u4a.test.ts` — la ripple n'est pas compressible sans retirer des tests imposés (interdit : « sans livrer à moitié »).
- **CHOIX DE L'ORCHESTRATEUR (proposé, non tranché par le worker)** : (a) accepter cette moitié PAQUET (vert, autonome) et lancer
  `GARDE-HELIUS-2b-migration` en lot suivant à R-25 MESURÉE ; ou (b) diriger une construction « lean » de la migration pour MESURER (au lieu d'estimer)
  et décider à la ligne. La borne basse ~1150 est le point faible de l'estimation — un lean build lèverait l'incertitude au prix d'une passe.

**Contrôle STOP transitif (fait avant tout code)** : les 3 fichiers gelés U-4b et leur fermeture transitive = {`u4b-scores.mjs`, `u4b-reduce.mjs`,
`record-u4b-calib.mjs`, `abi.ts`, `wadray.ts`, `rpc.ts`, `l1-split.ts`, `@monark/contracts`}. AUCUN n'importe `rpc2.ts` ni `record.ts` (ceux-ci sont
EN AVAL, consommateurs de `rpc.ts`/`abi.ts`). ⇒ **pas de STOP** ; `record.ts`/`rpc2.ts` sont migrables (moitié migration). Cette moitié PAQUET ne
touche NI `apps/**` NI `scripts/**` ⇒ le gel U-4b et `rpc.ts` sont byte-identiques par construction.

## 1. Exigence → fichier:ligne → test → mutant (moitié PAQUET livrée)
| Exigence (pli) | fichier:ligne | test nommé | mutant → ROUGE |
|---|---|---|---|
| **D6** indice à vocabulaire FERMÉ pour un payant (aucun octet du corps) | `transport.ts:134` `detailOf` ; `:136-154` `raise` | `paid_operator_http_error_reprises_only_the_closed_hint` ; `transport_error_path_http_non_ok_keeps_body` | **M2** paid ⇒ `redact` (corps libre) → clé base64 fuit ⇒ ROUGE |
| **C-4/C-5** vocabulaire source unique + indice trié/dédupliqué de jetons CANONIQUES | `classify.ts:23` `ERROR_HINT_TOKENS` ; `:36` `closedHint` | `closed_hint_is_sorted_deduplicated_canonical_tokens` ; `error_vocabulary_single_source_conformance_hint_equals_body` | **M1** jeton retiré (`10000`) ⇒ ROUGE |
| **C-1(a)** classe `RpcError` canonique (`extends TransportError`), levée par le chemin JSON-RPC | `errors.ts:48` ; `transport.ts:152,178` | `paid_rpc_error_is_canonical_class_with_validated_data` | **M7** chemin RpcError lève `TransportError` (identité cassée) ⇒ `instanceof RpcError` faux ⇒ ROUGE |
| **C-1(b)** `execution reverted`/`revert` dans le vocabulaire ; conformité `isRevertText` | `classify.ts:16,26` | `error_vocabulary_single_source_conformance_hint_equals_body` | (couvert par M1/conformité) |
| **C-1(c)** `TransportError.data?` validée hex, revert payant sans data ⇒ banc | `errors.ts:29` ; `classify.ts:52` `isRpcRevert` ; `transport.ts:123` `validateRevertData` | `revert_data_is_validated_hex_bounded_and_never_the_key` ; `paid_revert_without_data_is_benched_keyless_revert_is_not` | **M4** data non validée ⇒ ROUGE ; **M6** revert payant non benché ⇒ ROUGE |
| **C-1(c-bis)** (exigence orchestrateur) `data` abandonnée si contient l'hex UTF-8 d'une forme secrète ; borne `MAX_REVERT_DATA_HEX=4096` | `transport.ts:29,123-131` (réutilise `secretTargets:99`) | `revert_data_is_validated_hex_bounded_and_never_the_key` (assertions borne + hex-de-clé) | **M5** boucle c-bis neutralisée ⇒ data hex-de-clé conservée ⇒ ROUGE |
| **C-1(c)** message keyless SANS préambule (concordance des reverts keyless) | `transport.ts:146-151` | `keyless_rpc_error_message_has_no_preamble` | (couvert par assertion `doesNotMatch /rpc-guard:|operator/`) |
| **C-2** `NonJsonBody` ⇒ AUCUN indice (payant ET keyless) | `transport.ts:135` (`"NonJsonBody" ? ""`) ; `:176` | `non_json_body_emits_no_hint_paid_and_keyless` | **M3** indice émis sur NonJsonBody ⇒ ROUGE |
| **C-5** ceinture : préambule/code ne contiennent AUCUN jeton | `transport.ts:148-151` | `error_preamble_carries_no_vocabulary_token` (8 op × 6 noms × 7 codes) | (assertion `closedHint(preamble)===""`) |
| keyless : corps redacté conservé (`redact` reste porteur) | `transport.ts:112` `redact` | `keyless_http_error_reprises_redacted_body` | (M2 le couvre en négatif) |
| exports fermés (rpc2 importera ces symboles) | `index.ts:8,12` | `public_export_set_is_closed` | (assertion set fermé) |

**Note C-3 (journal `rpc_errors` sur disque)** : la surface est PRÊTE côté paquet — l'erreur porte `detail` (indice fermé, `errors.ts:27`) et `data`
validée, jamais le corps. La CONSTRUCTION de l'enregistrement sur disque est dans l'enveloppeur du recorder (il a la méthode ; le hook
`onTransportError` ne la porte pas) ⇒ **livrée en moitié migration** (test `un corps clé-base64 n'apparaît ni dans rpc_errors ni sur stderr`, mutant
« corps écrit dans rpc_errors »).

## 2. Oracle (codes de retour capturés DIRECTEMENT, hors pipe)
| commande | code | dernière ligne utile |
|---|---|---|
| `npm run gate:vocab` | **0** | `gate:vocab OK — scanned 204 file(s), no forbidden claim.` |
| `npm run typecheck` | **0** | (tsc --noEmit, aucune sortie) |
| `npm run test` | **0** | `ℹ tests 754  ℹ pass 753  ℹ fail 0  ℹ skipped 1` (skip = `fetch_only_inside_client`, SKIP-until-1b) |
| `npm run lint` | **0** | (eslint ., 0 problème) |
| `npm run lint:ratchet` | **0** | `lint-ratchet: 69/69 (… ceiling, measured_on 2026-09-16)` — 0 violation ajoutée |
| `npm run lang:gate` | **0** | `lang-gate OK — 0 non-exempt French hit(s) …` |
- rpc-guard seul : **58 tests / 58 pass / 0 fail** (avant : 49 ; +9 dans `error-hint.test.ts`).
- Mots interdits (`partner/autonomous/guarantee/verified/score/accuracy/confidence`) : aucun ajouté (gate:vocab vert). Lignes de code ajoutées :
  **pur ASCII** vérifié (`grep -P '[^\x00-\x7F]'` = 0 sur les 7 `.ts`) ; commentaires en anglais.

## 3. R-25 (pathspec `ci.yml:65` verbatim, `docs/**/*.md` exclus, base `1a4fd55`)
`git diff --shortstat 1a4fd55 -- . ':(exclude,glob)docs/**/*.md' …` (new files via `git add -N`, index reset après) = **7 fichiers, 317 ins + 35 del =
352** ≤ 1150. (ADR `.md` : +45 lignes, EXCLUES.)

## 4. Mutants (7/7 ROUGES sur test nommé, restauration byte-exacte sha256 ; harnais rejouable `F:\tmp\garde2b\mutants.mjs`)
```
M1_token_removed            closed_hint_is_sorted_deduplicated_canonical_tokens         exit=1 fail=1 RED=true restored=true
M2_free_body_for_paid       paid_operator_http_error_reprises_only_the_closed_hint      exit=1 fail=1 RED=true restored=true
M3_hint_on_nonjson          non_json_body_emits_no_hint_paid_and_keyless                exit=1 fail=1 RED=true restored=true
M4_data_not_validated       revert_data_is_validated_hex_bounded_and_never_the_key      exit=1 fail=1 RED=true restored=true
M5_data_key_hex_kept        revert_data_is_validated_hex_bounded_and_never_the_key      exit=1 fail=1 RED=true restored=true
M6_paid_revert_not_benched  paid_revert_without_data_is_benched_keyless_revert_is_not   exit=1 fail=1 RED=true restored=true
M7_class_identity_broken    paid_rpc_error_is_canonical_class_with_validated_data       exit=1 fail=1 RED=true restored=true
ALL_RED=true ALL_RESTORED=true  (golden transport=8fbb26b213.., classify=a502c1d5e7..)
```
Les mutants de MIGRATION (`makeBudgetedCall` restauré ; arguments optionnels ; retry avale le refus ; retry sous le tick ; allowlist élargie sans
déclencheur ; identité rpc2 cassée ; corps dans `rpc_errors` ; `finally` ne relâche pas les keyless) sont différés avec la moitié migration (§8).

## 5. Invariants — sha256 AVANT == APRÈS (byte-identiques)
`git diff --quiet 1a4fd55 -- apps scripts` ⇒ **apps + scripts UNCHANGED** (couvre `rpc.ts`, le gel U-4b, `wadray.ts`/`abi.ts`, `record.ts`/`rpc2.ts`
non touchés, ordre des fournisseurs `rpc2.ts` épinglé, `--concordance-out`, fixtures `u4/`/`u4b/`). `book_digest 034fbff9…` / `PINNED_DIGEST
267cd991…` inchangés (les tests qui les épinglent restent verts, suite 753 pass).
| fichier | sha256 AVANT | sha256 APRÈS |
|---|---|---|
| `scripts/census/u4b/u4b-scores.mjs` | `9ad20666af878c63…` | `9ad20666af878c63…` |
| `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f46…` | `a5e66cd387279f46…` |
| `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40a…` | `5733daeb7c8ee40a…` |
| `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43…` | `0e232519a18aaa43…` |
| `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23…` | `7bee76fc96a9bc23…` |
| `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb2…` | `3376eb084f522cb2…` |
| `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6…` | `9206df9189d3eba6…` |

## 6. DELIVERED.sha256 (`F:\tmp\garde2b\DELIVERED.sha256`, vérifiable `sha256sum -c`, chemins relatifs au worktree)
```
4a07ba60… packages/rpc-guard/src/errors.ts
a502c1d5… packages/rpc-guard/src/classify.ts
8fbb26b2… packages/rpc-guard/src/transport.ts
a6eecc8b… packages/rpc-guard/src/index.ts
3f488568… packages/rpc-guard/test/error-hint.test.ts
3624564a… packages/rpc-guard/test/exports.test.ts
ad48edee… packages/rpc-guard/test/multi-operator.test.ts
4816265f… docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md
2f502815… docs/adr/ADR-U4b-calibration-episode-frais.md
```
`sha256sum -c` ⇒ 9/9 OK.

## 7. git status (fin de passe)
HEAD `1a4fd55` (aucun commit par moi, R-20). ` M` : 5 `packages/rpc-guard/**` + 2 ADR ; `??` : `classify.ts`, `error-hint.test.ts`. Aucun fichier
parasite dans le dépôt (harnais + logs dans `F:\tmp\garde2b\`, hors dépôt).

## 8. Item formé à déclencheur (zéro dette nue) — `GARDE-HELIUS-2b-migration`
**Propriétaire** : orchestrateur (Fable 5.1). **Déclencheur** : cette découpe R-25 (§0). **Périmètre** (consomme la moitié PAQUET livrée) :
- `record.ts` : `makeDefaultCall`/`makeBudgetedCall`/`defaultCall`/`fetch` SUPPRIMÉS ; `runRecorder` construit `openGuardedClient(env, limits,
  ledgerDir, cycles, opts)` ; pool reconstruit sur des **labels** (`ETH_CALL_KEYLESS_LABELS`/`GET_LOGS_KEYLESS_LABELS` + `chainstack` appended last) ;
  arguments REQUIS `--ledger-dir`/`--cycle`/`--floor`/`--max-ru`/`--method-caps` (parser fail-closed, les 3 méthodes du recorder listées),
  `--max-calls`/`--concordance-out` conservés.
- Shim `call: RpcCall` = tally NON-gatant (calls/byOperator/byMethod pour la provenance — `spent().byOperator` est de la DÉPENSE en unité, pas un
  compte d'appels) + retry UNIQUEMENT chez l'appelant (`AbortError`/réseau, 429, ≥ 500 ; JAMAIS `RpcError`/`NonJsonBody`/autres 4xx/`BudgetExceededError`)
  + journal `rpc_errors` construit dans le catch (a la méthode) = `e.detail` (indice fermé) + `e.data` validée, jamais le corps ; `onTransportError` →
  `errByOp` (moniteur 5 %). R retries d'appelant ⇒ R+1 lignes ledger sur disque.
- `finally` : relâche **N** verrous demandés (keyless compris, y compris sur `BudgetExceededError`) par N `runCli unlock`. Runbook (ajouté à l'ADR
  §Amendement 2b) : un crash laisse N verrous ; la reprise fait N `unlock` AVANT `reconcile`.
- `rpc2.ts` : ré-exporte `RpcError`/`BudgetExceededError` du paquet (identité unique) et IMPORTE `isResultLimit`/`isPlanLimited`/`isRpcRevert` (aucune
  seconde regex) ; conserve `ConcordantRevertError` (consommé par `book.ts:11`), `NoQuorumError`, `operatorOf`, `revertKey`, `makeUkemiPool` ; assertion
  `operatorOf("nodies.app")==operatorOf("pocket.network")=="pocket"` (C-6(iv)).
- Grep CI (`test/rpc-guard-fetch-only-inside-client.test.ts`) : portée `apps/sentinel/src/ukemi/**` ACTIVE (0 hit hors allowlist) ; allowlist à DEUX
  entrées dont `apps/sentinel/src/rpc.ts` avec déclencheur **NARABI-OPS-1d** ; non-vacuité (scan `rpc.ts` seul, allowlist vide ⇒ ≥ 1 hit) ; skip
  résiduel = Bell (1b).
- Tests imposés : `ukemi_record_spends_only_through_guard`, `ukemi_record_requires_ledger_dir_cycle_and_method_caps`,
  `ukemi_record_budget_refusal_is_not_retried` (refus LEDGERÉ sur disque), `ukemi_record_resume_hits_cost_zero_ru`, `ukemi_budget_counts_http_attempts`,
  `ukemi_record_then_unlock_then_reconcile_end_to_end` (mode `aggregate-calibration`), conformité inter-paquets `isResultLimit/isPlanLimited/isRpcRevert`
  hint↔corps (fixtures + HTML), C-3, C-6(iii)(iv), grep. Mutants de migration (§4). **Ripple à absorber** : `ukemi-record.test.ts` (retirer les tests
  `makeDefaultCall`, citer la couverture transport du paquet), `ukemi-u4a.test.ts` (réécrire/retirer les tests des symboles supprimés), `ukemi.test.ts`
  (remplacer `defaultCall` par un appel brut local au test — digest `034fbff9` à reproduire).
- **Question de valeur ouverte (rappel C-4 addendum, à l'investisseur, NON tranchée par le worker)** : migrer `rpc.ts` (job quotidien Narabi) AVANT
  E-5 (lot `NARABI-OPS-1d`) ou accepter le résiduel « un chemin Chainstack payant tourne hors garde en production » pour le temps 1.

## 9. Déviations déclarées (items formés, jamais un contournement)
- **DEV-1 — moitié livrée par découpe R-25** (§0) : NON « livrer à moitié » — la moitié PAQUET est un livrable cohérent, vert, autonome (elle ne touche
  pas `apps/**`), et l'ordre de dépendance IMPOSE le paquet d'abord. La moitié migration est formée (§8), pas un « dû » nu.
- **DEV-2 — `RunLimits.runCaps.chainstack` requis même pour une course keyless-only** (le recorder passera `--max-ru` toujours requis) : mineur,
  `assertLimits` n'exige un run cap que pour un opérateur PAYANT demandé ; à confirmer en migration.
- **DEV-3 — `apps/harness/test/server.test.ts` flake sous la suite complète** (concurrence win32, ports) : passe 6/6 EN ISOLATION, byte-identique à
  `1a4fd55`, n'importe PAS rpc-guard ⇒ non causé par ce lot ; 2ᵉ run de la suite = vert (753 pass). Pré-existant/environnemental.
- **DEV-4 — `git add -N` transitoire** pour mesurer R-25 des fichiers non suivis, suivi de `git reset` (index restauré ; worktree intact ; aucun
  commit). Non-invasif.
- **DEV-5 — supersession INTENTIONNELLE de la couverture de mutants 2a sur le chemin PAYANT (déclarée, non une régression de preuve).** D6 retire
  `redact` du chemin PAYANT (le détail payant = `closedHint`, jamais le corps). Conséquence : les 4 tests anti-fuite 2a qui pilotent `chainstack`
  (`transport_error_never_echoes_operator_key`, `_drops_body_when_operator_url_unparseable`, `_key_straddling_truncation_never_leaks`,
  `_never_echoes_operator_userinfo`) passent désormais **par fermeture STRUCTURELLE** (un corps sans jeton du vocabulaire ⇒ `closedHint`=`""`, aucune
  clé possible quel que soit l'ordre de redaction) — ils restent VERTS mais ne DISCRIMINENT plus sur le payant. Donc les mutants 2a **X1–X5, Y1, Y2**
  (ordre expurger/tronquer) ne rougissent plus sur le chemin payant : c'est la **supersession voulue par D6** (« fermé structurellement, pas borné »,
  complément D6), pas un affaiblissement de la preuve 2a. **Ce qui reste porteur** : `secretTargets` (l'énumération des cibles) est réutilisée par le
  contrôle c-bis et RESTE load-bearing — mutant **M5** ROUGE le prouve ; `redact` (regex-replacement) est conservé pour les KEYLESS (sans secret) en
  défense en profondeur ET comme source des cibles c-bis. Aucune propriété de non-fuite 2a n'est perdue : le payant est plus sûr (fermé), le keyless
  reste redacté. Ces tests 2a sont conservés (belts de fermeture structurelle) — non retirés.

**Aucune demande de consultation ADVISOR ouverte** ; aucun blocage non résolu. La découpe est le seul point « non fait » et il est FORMÉ (§8) avec
déclencheur + propriétaire.
