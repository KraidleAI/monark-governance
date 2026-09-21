# G2 — RELECTEUR (contexte frais, revue 3 étapes AgileCoder) — GARDE-HELIUS-2b-i (`@monark/rpc-guard`, moitié PAQUET du lot 2b : surface d'erreur du transport)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Verdict : PASS-AVEC-CORRECTIONS.** Le cœur de la surface d'erreur est SAIN — 7/7 mutants worker ROUGES sur leur test nommé, oracle vert **re-mesuré** (identique au rendu), R-25 = 352, invariants byte-identiques, le pli **bloquant C-1** est structurellement satisfait, et le chemin PAYANT est **fermé structurellement** (aucun octet de clé ne peut atteindre le message : prouvé de première main). **5 corrections C-G-1..5 formées, TOUTES NON BLOQUANTES POUR LA FUSION de 2b-i** (drift/bords non épinglés + déclaration de vacuité DEV-5 + résidu `.data` à nommer), chacune avec fichier:ligne + test/mutant + déclencheur **2b-ii** ; **C-G-1 et C-G-3 deviennent BLOQUANTES pour le G1 de 2b-ii** (elles gardent le vocabulaire et `isRpcRevert` que 2b-ii branche au livre) — exigences d'entrée de son G0. Le paquet reste `upcoming` ; la migration (2b-ii) est un item formé, pas un oubli de branchement.

Cible **`798b4e9`** (`git archive` de `lot/garde-helius-2b`, base du lot `1a4fd55` sur `lot/etude-suite` = après fusion 2a `e98b54f`). Arbre ISOLÉ `F:\tmp\g2-garde2bi\tree\` : `node_modules/@monark/rpc-guard` → CET arbre (`require.resolve('@monark/rpc-guard')` = `…\tree\packages\rpc-guard\src\index.ts`, vérifié). **22/22 fichiers `packages/rpc-guard/{src,test}` == blobs `798b4e9`** (sha256, après TOUS mes rejeux de mutants). `TEMP/TMP/TMPDIR=F:\tmp\g2-garde2bi\os-tmp` (rien sur C:). Aucun réseau (`fetch` bouchonné, hôtes `.invalid`, clés **factices** `FAKEKEY-*`). Aucun `git` d'écriture, aucun commit (R-20). L'arbre étant un extrait `git archive` (pas de `.git`), l'intégrité est prouvée par restauration-sha (ci-dessous), pas par `git status`.

**Première mesure VRAIE de la suite avec 2b-i sous les consommateurs** : le worktree du worker avait un `node_modules` jonctionné vers `F:\Monark\node_modules` (liens `@monark/*` absolus vers l'arbre principal, SANS 2b-i) ⇒ les tests `apps/*` y mesuraient l'ANCIEN paquet. Ici la résolution pointe vers 2b-i. Mesuré : **`apps/**` n'importe PAS `@monark/rpc-guard`** (seule mention = un COMMENTAIRE `apps/bell/src/universe-cli.ts:128`, `grep` ci-dessous) ⇒ la couverture de 2b-i est ENTIÈREMENT dans `packages/rpc-guard/test` ; la « mesure vraie » confirme que **rien sous `apps/` ne casse** avec 2b-i résolu (753 pass), non que quoi que ce soit sous `apps/` l'exerce.

---

## 1. Table EXIGENCE (pli) → fichier:ligne → test nommé (vert) → mutant (ROUGE prouvé)

| Exigence (complément D6 / pli C-1..C-5) | fichier:ligne (`798b4e9`) | test nommé | mutant → ROUGE (rejoué) |
|---|---|---|---|
| **D6** payant = indice à vocabulaire FERMÉ, aucun octet du corps | `transport.ts:134-135` `detailOf` ; `:136-154` `raise` | `paid_operator_http_error_reprises_only_the_closed_hint` ; `transport_error_path_http_non_ok_keeps_body` | **M2** payant⇒`redact`(corps libre) ⇒ blob base64 fuit ⇒ RED |
| **C-4/C-5** vocabulaire source unique + indice trié/dédupliqué de jetons CANONIQUES | `classify.ts:23-28` `ERROR_HINT_TOKENS` ; `:36-40` `closedHint` | `closed_hint_is_sorted_deduplicated_canonical_tokens` ; `error_vocabulary_single_source_conformance_hint_equals_body` | **M1** jeton `10000` retiré ⇒ RED ; **MY4** (mien) no-sort ⇒ RED |
| **C-1(a)** classe `RpcError` canonique (`extends TransportError`, exportée) | `errors.ts:48-53` ; `index.ts:8` ; `transport.ts:152` | `paid_rpc_error_is_canonical_class_with_validated_data` (asserte `instanceof RpcError` ET `instanceof TransportError`) | **M7** chemin RpcError lève `TransportError` (identité cassée) ⇒ RED |
| **C-1(b)** `execution reverted`/`revert` au vocabulaire ; conformité `isRevertText` | `classify.ts:16,27` | `error_vocabulary_single_source_conformance_hint_equals_body` (ligne `isRevertText`) | couvert par M1/conformité |
| **C-1(c)** `TransportError.data?` validée hex bornée ; revert payant sans data ⇒ banc | `errors.ts:29` ; `classify.ts:48-54` (`isRpcRevert`, garde data `:52`) ; `transport.ts:123-130` `validateRevertData` ; `:141` | `revert_data_is_validated_hex_bounded_and_never_the_key` ; `paid_revert_without_data_is_benched_keyless_revert_is_not` | **M4** data non validée ⇒ RED ; **M6** revert payant non benché ⇒ RED |
| **C-1(c-bis)** data abandonnée si hex-UTF-8 d'un secret ; borne `MAX_REVERT_DATA_HEX=4096` | `transport.ts:29` ; `:123-130` (boucle `:128`, réutilise `secretTargets:99-111`) | `revert_data_is_validated_hex_bounded_and_never_the_key` | **M5** boucle c-bis neutralisée ⇒ data hex-de-clé conservée ⇒ RED |
| **C-1(c)** message keyless SANS préambule (concordance des reverts keyless) | `transport.ts:145-146` | `keyless_rpc_error_message_has_no_preamble` (`doesNotMatch /rpc-guard:\|operator/`) | couvert par assertion |
| **C-2** `NonJsonBody` ⇒ AUCUN indice (payant ET keyless) | `transport.ts:135` (`"NonJsonBody" ? ""`) ; `:176` | `non_json_body_emits_no_hint_paid_and_keyless` (2 opérateurs) | **M3** indice émis sur NonJsonBody ⇒ RED |
| **C-5** ceinture : préambule/code ne portent AUCUN jeton | `transport.ts:148-150` | `error_preamble_carries_no_vocabulary_token` (ops×noms×codes) | assertion `closedHint(preamble)===""` |
| keyless : corps redacté conservé (`redact` porteur, cibles c-bis) | `transport.ts:112-119` | `keyless_http_error_reprises_redacted_body` | M2 en négatif ; M5 (secretTargets) |
| exports fermés (rpc2 les importera en 2b-ii) | `index.ts:8,12` | `public_export_set_is_closed` (ajoute `RpcError`,`isResultLimit`,`isPlanLimited`,`isRevertText`,`isRpcRevert`,`closedHint`,`ERROR_HINT_TOKENS`) | drift ⇒ set fermé rouge |

## 2. Oracle RE-EXÉCUTÉ (codes capturés DIRECTEMENT, hors pipe : `npm run X > log 2>&1; echo exit=$?`)

| commande | code | dernière ligne utile | rendu worker |
|---|---|---|---|
| `npm run gate:vocab` | **0** | `gate:vocab OK — scanned 204 file(s), no forbidden claim.` | 0, 204 ✓ |
| `npm run typecheck` | **0** | `tsc --noEmit` (aucune sortie) | 0 ✓ |
| `npm run test` | **0** | `ℹ tests 754 ℹ pass 753 ℹ fail 0 ℹ skipped 1` (skip = `fetch_only_inside_client # until 1b`) | 754/753/0/1 ✓ |
| `npm run lint` | **0** | `eslint .` (0 problème) | 0 ✓ |
| `npm run lint:ratchet` | **0** | `lint-ratchet: 69/69 (… measured_on 2026-09-16)` | 0, 69/69 ✓ |
| `npm run lang:gate` | **0** | `lang-gate OK — 0 non-exempt French hit(s)` | 0 ✓ |

**Concordance TOTALE avec le rendu.** Aucun `fail`, aucune ligne `not ok`. Le flake DEV-3 (`apps/harness/test/server.test.ts`) **ne s'est PAS produit** : la suite complète est passée 753/0 en un seul run (durée 35,0 s). Logs : `F:\tmp\g2-garde2bi\g-{vocab,tc,test,lint,ratchet,lang}.log`.

## 3. R-25 (pathspec `ci.yml:65` VERBATIM, base `1a4fd55..798b4e9`)

`git diff --shortstat 1a4fd55..798b4e9 -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}'`
= **7 fichiers, 317 insertions + 35 deletions = 352** (exit 0) ≤ 1150. **Identique au rendu.** Détail (numstat) : classify 54/0, errors 29/1, index 5/1, transport 66/29, error-hint.test 152/0, exports.test 3/1, multi-operator.test 8/3. Les 2 ADR `.md` (41+0 et 2+2 = **45 lignes**) sont EXCLUS par `:(exclude,glob)docs/**/*.md` (confirmé).

## 4. Mutants

### 4a. Les 7 mutants worker REJOUÉS dans l'arbre isolé (`F:\tmp\g2-garde2bi\mutants.mjs`, copie adaptée `WT→tree`, original intact)
```
M1_token_removed            closed_hint_is_sorted_deduplicated_canonical_tokens        exit=1 fail=1 RED=true restored=true
M2_free_body_for_paid       paid_operator_http_error_reprises_only_the_closed_hint     exit=1 fail=1 RED=true restored=true
M3_hint_on_nonjson          non_json_body_emits_no_hint_paid_and_keyless               exit=1 fail=1 RED=true restored=true
M4_data_not_validated       revert_data_is_validated_hex_bounded_and_never_the_key     exit=1 fail=1 RED=true restored=true
M5_data_key_hex_kept        revert_data_is_validated_hex_bounded_and_never_the_key     exit=1 fail=1 RED=true restored=true
M6_paid_revert_not_benched  paid_revert_without_data_is_benched_keyless_revert_is_not  exit=1 fail=1 RED=true restored=true
M7_class_identity_broken    paid_rpc_error_is_canonical_class_with_validated_data      exit=1 fail=1 RED=true restored=true
ALL_RED=true ALL_RESTORED=true (golden transport=8fbb26b21347 classify=a502c1d5e719 == DELIVERED.sha256)
```
`transport.ts` et `classify.ts` restaurés byte-exact == blob `798b4e9` après le run.

### 4b. Écart 7 vs 13 (plan du lot ENTIER) — JUSTIFIÉ par la couture, mutant par mutant
Le plan (addendum L-2-1..4 + complément §2 + pli C-1..C-5) nomme ~13-15 mutants pour le lot 2b entier. **7 relèvent de la moitié PAQUET** (mutent `classify.ts`/`transport.ts`, livrés+RED ici) : M1(jeton), M2(corps libre payant), M3(NonJsonBody), M4/M5/M6(`.data`), M7(identité de classe). Les mutants restants relèvent de la **MIGRATION (2b-ii)** et mutent des fichiers **byte-identiques ou absents dans ce lot**, donc **non exerçables ici** — ce n'est pas une omission :

| Mutant migration (différé) | fichier cible | état dans ce lot (`1a4fd55..798b4e9`) |
|---|---|---|
| `makeBudgetedCall` local restauré | `apps/sentinel/src/ukemi/record.ts` | byte-IDENTIQUE `e82f6067` |
| arguments rendus optionnels | `record.ts` (parser) | byte-IDENTIQUE |
| retry avale le refus / retry sous le tick | `record.ts` (withRetry `:86`) | byte-IDENTIQUE |
| corps écrit dans `rpc_errors` | `record.ts` (journal) | byte-IDENTIQUE |
| `finally` ne relâche pas les keyless | `record.ts` (finally) | byte-IDENTIQUE |
| identité `rpc2` cassée | `apps/sentinel/src/ukemi/rpc2.ts` | byte-IDENTIQUE `3635f9da` |
| allowlist élargie sans déclencheur | `test/rpc-guard-fetch-only-inside-client.test.ts` | byte-INCHANGÉ (portée `ukemi/**` = 2b-ii) |

Cohérent avec la couture (`paquet : indice fermé + classe + data` / `migration + grep`) et avec §8 du rendu.

### 4c. Mes mutants (contexte frais, `F:\tmp\g2-garde2bi\my-mutants.mjs`, suite `packages/rpc-guard/test/{error-hint,exports,multi-operator}.test.ts`)
```
MY1_c4_regex_drift_block_limit          fail=0 => SURVIVE  (drift C-4 : ci-dessous C-G-1)
MY2_validate_data_failopen_on_unparseable fail=0 => SURVIVE (fail-closed .data non épinglé : C-G-2)
MY3_isRpcRevert_accepts_any_code        fail=0 => SURVIVE  (garde code {3,-32000} non épinglée : C-G-3)
MY4_closedHint_not_sorted               fail=1 => RED      (contrôle : le tri EST porteur, restored)
```
MY4 (contrôle) rougit `closed_hint_is_sorted_deduplicated_canonical_tokens` ⇒ la suite N'EST PAS vacante. MY1-MY3 SURVIVENT ⇒ trois bords de couverture non épinglés (le CODE est correct aujourd'hui ; ce sont des drift-hardening, pas des défauts). Fichiers restaurés byte-exact.

## 5. Invariants byte-identiques (sha256, DEUX sources : blob `1a4fd55` vs blob `798b4e9`, LF canonique)
`git diff --stat 1a4fd55..798b4e9 -- apps scripts` = **VIDE** (apps + scripts UNCHANGED). Par fichier (préfixe sha256, IDENTIQUE `1a4fd55`==`798b4e9`) :
| fichier | sha256 (16) | == rendu §5 |
|---|---|---|
| `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43` | ✓ (non touché) |
| `apps/sentinel/src/ukemi/record.ts` | `e82f60671c21124d` | consommateur non touché (migration) |
| `apps/sentinel/src/ukemi/rpc2.ts` | `3635f9dac888e67c` | non touché (aucune 2ᵉ regex ajoutée) |
| `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23` | ✓ |
| `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb2` | ✓ |
| `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6` | ✓ |
| `scripts/census/u4b/u4b-scores.mjs` | `9ad20666af878c63` | ✓ (gel U-4b) |
| `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f46` | ✓ (gel U-4b) |
| `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40a` | ✓ (gel U-4b) |

**DELIVERED.sha256 — confirmé par TROIS sources indépendantes** (manifeste worker == blob commité `798b4e9` == fichier in-tree), pour les 9 fichiers (4 src + 3 test + 2 ADR) :
| fichier | manifeste | blob `798b4e9` (`git show \| sha256sum`) | in-tree |
|---|---|---|---|
| errors.ts | `4a07ba60…` | `4a07ba6003701adf` | `4a07ba60…` |
| classify.ts | `a502c1d5…` | `a502c1d5e719c7e1` | `a502c1d5…` |
| transport.ts | `8fbb26b2…` | `8fbb26b213476b06` | `8fbb26b2…` |
| index.ts | `a6eecc8b…` | `a6eecc8bd864a909` | `a6eecc8b…` |
| error-hint.test.ts | `3f488568…` | `3f488568dde8a5e2` | `3f488568…` |
| exports.test.ts | `3624564a…` | `3624564a87cc0927` | `3624564a…` |
| multi-operator.test.ts | `ad48edee…` | `ad48edee7e4054ce` | `ad48edee…` |
| ADR-GARDE-HELIUS…md | `4816265f…` | `4816265fd1a057c3` | `4816265f…` |
| ADR-U4b…md | `2f502815…` | `2f5028152051f9fe` | `2f502815…` |
Les trois sources concordent ⇒ le `sha256sum -c` 9/9 de l'orchestrateur est confirmé par un chemin INDÉPENDANT (blob commité, LF canonique), pas seulement tree-vs-manifeste. `book_digest 034fbff9…`/`PINNED_DIGEST 267cd991…` inchangés (les tests qui les épinglent restent verts, 753 pass).

## 6. Points à JUGER (D.1–D.8)

**D.1 — DEV-5 : supersession INTENTIONNELLE des mutants 2a X1–X5/Y1/Y2 sur le chemin payant. VERDICT : PASS (supersession LÉGITIME).**
- La propriété « aucune clé ne fuit sur le chemin PAYANT » est **encore prouvée**, désormais par **M2 ROUGE** (si le payant reprend `redact`/corps libre, le blob **base64** — forme C-GD-2 non expurgeable par motif — fuit ⇒ `doesNotMatch(B64KEY)` échoue) et par la **fermeture structurelle** de `closedHint` (jetons CANONIQUES d'un ensemble fixe de phrases anglaises + `10000`, jamais une sous-chaîne du corps). **Preuve de première main** (sonde `dev5probe.mts`, opérateur `chainstack`) :
  - les 4 corps des tests anti-fuite 2a (`…echoes_operator_key`, `…straddling_truncation`, userinfo, `…url_unparseable_body`), tous **sans jeton du vocabulaire**, donnent `detail=""` et `keyLeak=false` (message = préambule seul) ;
  - un corps avec jeton+clé donne `detail="block range, too large"` et `keyLeak=false` (l'indice de découpe survit, la clé/host/base64 non).
- **Le chemin PAYANT est plus sûr (fermé), pas affaibli** : la supersession de X1–X5/Y1/Y2 est celle voulue par D6 (« fermé structurellement, pas borné »). Les 4 tests 2a restent VERTS mais **vacants sur le payant** (`detail=""`) ⇒ voir **C-G-4** (déclarer la vacuité).
- **Chemin keyless — expurgation-PUIS-troncature de 2a (C-R-3/C-GD-3) : conservée dans le CODE** (`transport.ts:135` : `redact(op, rawDetail).replace(/\s+/g," ").trim().slice(0,160)` = redact AVANT collapse/slice) **mais elle ne protège plus RIEN** : aucun opérateur n'est à la fois porteur de secret ET sur `redact` (payant⇒`closedHint` ; keyless⇒sans secret). Les mutants Y1/Y2 ne rougissent donc plus sur aucun test — **cohérent** (le seul secret possible, la clé payante, est fermé par D6). `secretTargets` **reste load-bearing** via `validateRevertData` (c-bis, **M5 ROUGE**). C'est une supersession **saine**.

**D.2 — C-1 (bloquant du checkpoint-1) : PASS.**
- `RpcError` canonique : une seule classe `errors.ts:48` `extends TransportError`, exportée `index.ts:8`, levée par le chemin JSON-RPC `transport.ts:152`. `instanceof RpcError` ET `instanceof TransportError` assertés (`paid_rpc_error_…:79-80`), M7 ROUGE. La ré-export par `rpc2.ts` est **2b-ii déclarée** (rpc2 byte-identique ici). ✓
- Vocabulaire de revert à source unique : `classify.ts` (isRevertText `:16`, `ERROR_HINT_TOKENS` `:23-28`), exporté ; rpc2 l'importera en 2b-ii (aucune 2ᵉ regex ajoutée ici). ✓
- `.data` validée : `validateRevertData:123-130`. **C-1(c-bis)** : `data` abandonnée si elle contient l'hex UTF-8 d'une forme secrète (`:128`, mêmes `secretTargets` que `redact`), bornée `MAX_REVERT_DATA_HEX=4096` (`:124`). Test `revert_data_is_validated_hex_bounded_and_never_the_key` : non-hex abandonné, sur-long abandonné (MAX+2), hex propre gardé, **hex-de-clé abandonné** ; **M5 ROUGE** (boucle neutralisée). **Recherche de contournement** :
  - casse : `raw.toLowerCase()` vs `…toString("hex").toLowerCase()` — les deux minusculés, pas de contournement par casse ✓ ;
  - `0x` absent : `/^0x[0-9a-fA-F]*$/` exige `0x` ⇒ une clé hex sans `0x` est **abandonnée comme non-hex** (ne peut pas se faufiler) ✓ ;
  - clé coupée en deux DANS la data : la c-bis teste l'hex **CONTIGU** de chaque cible (`includes`) ⇒ un hex-de-clé fractionné par du bruit N'est PAS attrapé (⇒ **C-G-5** : résidu miroir de A-3bis Résidu 1, borné 4096 + journal local + jamais publié) ;
  - encodage : la c-bis couvre l'hex-UTF-8 des cibles (dont formes %-encodée/JSON via `secretTargets:105-109`) ✓.

**D.3 — Conformité sur les TROIS classifieurs : PASS (avec réserve C-G-1).** Le test `error_vocabulary_single_source_conformance_hint_equals_body` couvre `isResultLimit`, `isPlanLimited`, `isRevertText` (le prédicat-texte de `isRpcRevert`, qui prend un OBJET erreur — couvrir `isRevertText` est l'analogue correct, dit explicitement) sur 6 corps, dont un HTML « result » et un revert. Un jeton HORS vocabulaire **ne peut pas** fuir dans un message payant : le payant = `closedHint` (littéraux canoniques seuls) + préambule sans jeton (`error_preamble_carries_no_vocabulary_token`, ops×noms×codes). **RÉSERVE (C-G-1)** : la conformité épingle 6 fixtures + `closedHint`⊆vocabulaire, mais PAS « chaque alternative des regex ∈ `ERROR_HINT_TOKENS` » — MY1 (ajout `|block limit` à `isResultLimit` sans toucher le tableau) **SURVIT** ⇒ drift possible (un signal de découpe reconnu par le prédicat que l'indice fermé ne peut pas émettre). Le pli C-4 exigeait « épingle le vocabulaire, pas seulement les fixtures d'hier » : **partiellement tenu**.

**D.4 — Aucun indice sur `NonJsonBody` (C-2), payant ET keyless : PASS.** `detailOf:135` `name === "NonJsonBody" ? ""`. Test `non_json_body_emits_no_hint_paid_and_keyless` pilote `chainstack` ET `drpc.org`, asserte `detail===""` et `isResultLimit(message)===false` sur une page HTML portant « result »/« ranges over 10000 ». **M3 ROUGE**. ✓

**D.5 — La suite 2a reste verte, aucune assertion affaiblie : PASS (une assertion ADAPTÉE + RENFORCÉE, SIGNALÉE).**
- Seul test 2a MODIFIÉ : `transport_error_path_http_non_ok_keeps_body` (`multi-operator.test.ts:210`). L'assertion `assert.match(err.message, /ranges over 10000/)` est **remplacée** par `isResultLimit(m)` + `err.detail==="10000, ranges over"` + `assert.doesNotMatch(m, /blocks are not supported/)`. Ce n'est **PAS un affaiblissement** : `isResultLimit(m)` est exactement ce que `getLogsVia` teste (le littéral n'était qu'un proxy), et la nouvelle assertion **PROUVE EN PLUS** que le corps brut est abandonné (D6). Adaptation légitime, signalée comme demandé.
- Les 4 tests anti-fuite 2a (`:231,:251,:260,:275`) et `transport_error_path_json_rpc_error_never_resolves_undefined` (`:285`) sont INCHANGÉS et verts — ce dernier OBSERVÉ dans `g-test.log` : `✔ transport_error_path_json_rpc_error_never_resolves_undefined (7.3655ms)` (il asserte `/execution reverted/`, satisfait car le message payant porte `execution reverted, revert`). Aucune assertion supprimée hors le remplacement ci-dessus. `exports.test.ts` : ajout de `RpcError` + 6 symboles de vocabulaire au set FERMÉ (renforcement).

**D.6 — Invariants byte-identiques : PASS.** Voir §5 (apps+scripts diff VIDE ; 9 sha == blob des deux côtés ; `rpc.ts` `0e232519` non touché ; gel U-4b intact ; DELIVERED.sha256 9/9).

**D.7 — Mots interdits / ASCII / clés : PASS.** `gate:vocab` 0 (204 fichiers) ; `grep -nwiE "score|accuracy|guarantee|verified|confidence"` sur les sources changées = **aucun** ; `grep -P '[^\x00-\x7F]'` sur les 7 fichiers de code = **vide** (ASCII pur, commentaires anglais) ; clés = **factices seulement** (`FAKEKEY-*`, `.example.invalid`, base64 factice `cGF0aC1zZWNyZXQ…`) ; **aucun littéral hex 32+** dans les tests changés (pas de secret réel).

**D.8 — Branchement / registre : PASS.**
- L'ADR (amendement 2b-i, `:275-315`) déclare le tuyau : **entrée** = `openGuardedClient(env,…)`/le corps d'erreur du transport ; **sortie/consommateur** = `GARDE-HELIUS-2b-migration` (rpc2 ré-exporte + importe, `getLogsVia`, journal `rpc_errors`) ; **état** = paquet `upcoming` ; **déclencheur** = la découpe R-25 ; **propriétaire** = orchestrateur ; **runbook** (N `unlock` avant `reconcile` après crash). Tuyau + déclencheur explicites. ✓
- Registres publics : `grep -niE rpc-guard apps/site README.md skills | grep built` = **aucun hit** ⇒ rien ne passe à « built ». `apps/**` n'IMPORTE PAS le paquet (seul `apps/bell/src/universe-cli.ts:128` = **commentaire** « universe MIGRATES to `@monark/rpc-guard` »). 2b-i est bien une **moitié déclarée**, pas un oubli de branchement. ✓

## 7. Corrections FORMÉES (aucune appliquée par moi — un worker de pli applique)

- **C-G-1 (NON BLOQUANT) — C-4 « source unique » non épinglée structurellement (drift regex↔tableau).**
  - *Mesuré* : MY1 SURVIT — ajouter `|block limit` à `isResultLimit` (`classify.ts:10`) SANS l'ajouter à `ERROR_HINT_TOKENS` (`:23-28`) ne rougit aucun test. Conséquence latente : un corps payant que le prédicat reconnaît mais que `closedHint` ne peut pas émettre ⇒ `getLogsVia` (2b-ii) ne découperait pas une plage qu'il devrait.
  - *Correctif* : DÉRIVER les regex du tableau (ex. `const RESULT_LIMIT = new RegExp(RESULT_LIMIT_TOKENS.map(esc).join("|"),"i")`) OU ajouter un test `error_vocabulary_regex_alternatives_are_all_hint_tokens` (chaque alternative de `isResultLimit`/`isPlanLimited`/`isRevertText` ∈ `ERROR_HINT_TOKENS`).
  - *Statut* : NON BLOQUANT pour la FUSION de 2b-i (regex↔tableau en phase aujourd'hui), mais **BLOQUANT pour le G1 de 2b-ii** — dès que `rpc2.ts` importe `isResultLimit` et que `getLogsVia` l'appelle sur l'indice fermé PAYANT, un drift est un trou fonctionnel réel (découpage de plage manqué ⇒ jusqu'à 2^20 appels sur un payant, chiffre C-2). L'orchestrateur doit l'inscrire en exigence d'ENTRÉE du G0 de 2b-ii. *error_origin* : worker (couverture) + plan (C-4 « épingle le vocabulaire »).

- **C-G-2 (NON BLOQUANT) — `validateRevertData` fail-closed sur URL non analysable non épinglé.**
  - *Mesuré* : MY2 SURVIT — `transport.ts:126` `if (targets === undefined) return undefined;` → `return raw;` ne rougit aucun test (les tests `.data` utilisent un `CS_ENV` analysable). C'est le SEUL fail-closed vivant du chemin payant `.data` (celui de `redact` est keyless-only).
  - *Correctif* : test `revert_data_dropped_when_operator_url_unparseable` (`CHAINSTACK_ETH_URL` non analysable + data hex valide ⇒ `data===undefined`) + mutant.
  - *Déclencheur* : 2b-ii (le journal `rpc_errors` consomme `.data`). *error_origin* : worker.

- **C-G-3 (NON BLOQUANT) — garde de code `{3,-32000}` de `isRpcRevert` non épinglée.**
  - *Mesuré* : MY3 SURVIT — `classify.ts:50` `if (!(e.code === 3 || e.code === -32000)) return false;` → `if (false)` ne rougit aucun test (aucun test ne pilote un `RpcError` de code hors {3,-32000} avec `isRpcRevert`). Un fault de code autre (ex. `-32602`) au texte revert serait mal classé revert.
  - *Correctif* : test asserttant `isRpcRevert(RpcError code=-32602, msg="…revert…") === false` + mutant.
  - *Statut* : NON BLOQUANT pour la fusion de 2b-i, **BLOQUANT pour le G1 de 2b-ii** (`isRpcRevert` alimente `revertKey`/`ConcordantRevertError`, donc le livre) — exigence d'entrée du G0 de 2b-ii. *error_origin* : worker.

- **C-G-4 (NON BLOQUANT, hygiène de test) — vacuité DEV-5 non déclarée DANS les tests.**
  - *Mesuré* : les 4 tests 2a `transport_error_never_echoes_operator_key`/`…_key_straddling_truncation_never_leaks`/`…_never_echoes_operator_userinfo`/`…_drops_body_when_operator_url_unparseable` (`multi-operator.test.ts:231,260,275,251`) pilotent `chainstack` avec des corps SANS jeton ⇒ `detail=""` (prouvé) ⇒ ils n'assèrent plus que la propreté du PRÉAMBULE. La supersession est déclarée dans le RENDU (DEV-5) mais pas visible en exécutant les tests.
  - *Correctif* : ajouter `assert.equal(err.detail, "")` à chacun (rend la vacuité AUDITABLE, non accidentelle) OU un commentaire renvoyant à M2/`closedHint`. *error_origin* : worker (documentation de test).

- **C-G-5 (NON BLOQUANT, zéro-dette) — résidu `.data` hex-de-clé FRACTIONNÉ non nommé.**
  - *Mesuré* : `validateRevertData` n'abandonne que l'hex-de-clé **CONTIGU** ; un hex-de-clé coupé par du bruit dans la `data` échappe (miroir exact de A-3bis **Résidu 1** « clé coupée par un blanc »). Borné : `MAX_REVERT_DATA_HEX=4096`, va au journal `rpc_errors` LOCAL (2b), **jamais publié**.
  - *Correctif* : le NOMMER explicitement (fold dans A-3bis Résidu 1 OU un résidu déclaré de l'amendement 2b-i), pour clôturer zéro-dette. *error_origin* : worker (déclaration).

## 8. Contrôle MAST (14 modes — résiduel)
- **FM-1.1 Disobey task spec** : n/a — la couture (paquet/migration) est PRÉ-DÉCLARÉE (complément C-2/addendum C-5), activée sur R-25>1150 MESURÉ.
- **FM-1.2 Disobey role spec** : n/a — R-20 respecté (aucun commit, aucun workflow ; le worker propose, ne clôt pas).
- **FM-1.3 Step repetition / FM-1.4 Loss of history / FM-2.1 Conversation reset** : n/a.
- **FM-1.5 Termination conditions** : OK — migration = item formé (propriétaire+déclencheur+runbook), pas une clôture prématurée du lot.
- **FM-2.2 Ask clarification** : OK — la question de valeur (migrer `rpc.ts` avant E-5) est renvoyée à l'investisseur, non tranchée par le worker.
- **FM-2.3 Task derailment** : n/a — périmètre strict `packages/rpc-guard/**` (apps/scripts byte-identiques).
- **FM-2.4 Information withholding** : mineur — vacuité DEV-5 (C-G-4) et résidu `.data` (C-G-5) déclarés au RENDU mais pas dans tests/ADR ⇒ corrections formées.
- **FM-2.5 Ignored other agent** : OK — le pli checkpoint-1 delta C-1..C-7 est intégralement plié (vérifié point par point).
- **FM-2.6 Action-reasoning mismatch** : n/a.
- **FM-3.1 Premature termination** : n/a — moitié paquet cohérente, verte, autonome (ne touche pas `apps/**`).
- **FM-3.2 No/incomplete verification** : **LE mode résiduel** — MY1/MY2/MY3 (drift C-4, fail-closed `.data`, garde de code) non épinglés ⇒ C-G-1/2/3.
- **FM-3.3 Incorrect verification** : SIGNALÉ — la mesure du worker s'est faite sur un `node_modules` JONCTIONNÉ vers l'arbre principal (les tests `apps/*` mesuraient l'ANCIEN paquet) ; méthode de mesure faussée, résultat correct **par chance** (`apps/*` n'importe pas le paquet). Ma mesure isolée est la mesure vraie (753 pass). Non bloquant (aucun régression réelle), mais la LEÇON tient : mesurer sous résolution `@monark/*` correcte.

## 9. error_origin PROPOSÉ (au G7)
Conception 2b-i = **plan sain** (complément D6 + pli C-1..C-7). Exécution : **worker** pour C-G-1..5 (couverture drift/bords + déclarations), toutes NON BLOQUANTES et à déclencheur 2b-ii. Contributif **plan** sur C-G-1 (clause C-4 « épingle le vocabulaire » partiellement opérationnalisée). Finding de mesure (jonction `node_modules`) : **orchestrateur/outillage** (déjà connu, corrigé dans MON arbre isolé).

## 10. VERDICT
**PASS-AVEC-CORRECTIONS.** Cœur SAIN : oracle vert re-mesuré (identique au rendu), R-25=352, invariants byte-identiques, 7/7 mutants worker ROUGES, pli **bloquant C-1 satisfait**, chemin payant **fermé structurellement** (prouvé de première main), branchement/registre corrects. **5 corrections C-G-1..5, NON BLOQUANTES POUR LA FUSION de 2b-i** (drift C-4, fail-closed `.data`, garde de code `isRpcRevert`, vacuité DEV-5 à déclarer, résidu `.data` à nommer), chacune fichier:ligne + test/mutant + déclencheur **2b-ii** — donc **zéro-dette formée**, pas un « dû » nu. **C-G-1 et C-G-3 deviennent BLOQUANTES pour le G1 de 2b-ii** (elles gardent le vocabulaire et `isRpcRevert` que 2b-ii branche au livre). **DEV-5 = supersession LÉGITIME** (payant plus sûr, non affaibli). Aucune correction bloquante pour 2b-i ⇒ pas de frontière d'escalade sur CE lot. Le paquet reste `upcoming`.

**Recommandation au G7** : 2b-i est fusionnable en l'état ; les 5 C-G sont à plier **avant le G1 de 2b-ii** (qui consomme `isRpcRevert`/`validateRevertData`/le vocabulaire), formés comme items à déclencheur 2b-ii — jamais des « à faire » nus. L'orchestrateur inscrit **C-G-1 et C-G-3 en exigences d'ENTRÉE du G0 de 2b-ii** (sinon divergence checklist/G0 ⇒ escalade à ce moment-là).

---
### Intégrité de l'arbre (pas de `.git` — extrait `git archive`)
- 22/22 fichiers `packages/rpc-guard/{src,test}` == blobs `798b4e9` (sha256) APRÈS tous les rejeux ; `transport.ts`/`classify.ts` restaurés byte-exact après chaque mutant.
- Aucun fichier écrit dans l'arbre. Mes fichiers de travail (hors arbre, sous `F:\tmp\g2-garde2bi\`) : `mutants.mjs`, `my-mutants.mjs`, `g2golden-{transport,classify}.ts`, `my-golden-{transport,classify}.ts`, logs `g-{vocab,tc,test,lint,ratchet,lang}.log`, `os-tmp/{t.ts,dev5probe.mts}`, et ce rapport `G2-lot-garde-helius-2b-i.md`.

`git status --short` (mon arbre `F:\tmp\g2-garde2bi\tree` est un extrait `git archive`, sans `.git` ⇒ intégrité par les 22/22 blobs ci-dessus). Les DEUX dépôts touchés en LECTURE SEULE sont PROPRES (`git status` en lecture ne viole pas le gel) :
```
$ git -C F:/Monark status --short            => (vide, 0 ligne)
$ git -C F:/Monark-wt-garde2b status --short => (vide, 0 ligne)   # worktree GELÉ intact, aucune écriture
```
Aucune écriture au dépôt `F:\Monark` ni au worktree gelé `F:\Monark-wt-garde2b` ; rien sur `C:` ; aucun réseau.

**R-20 : je ne committe pas, je ne déclenche aucun workflow.** **R-1 : `claude-opus-4-8[1m]`.**
