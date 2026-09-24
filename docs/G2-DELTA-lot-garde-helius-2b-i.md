# G2-DELTA — GARDE-HELIUS-2b-i — pli des corrections G2 + checkpoint-2 (commits `798b4e9..f4ecf14` sur `lot/garde-helius-2b`)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Verdict : PASS.** Le pli résout **les 9 corrections** — mes C-G-1..5 (G2) et les C-R-1..4 du validateur — chacune **épinglée** par un test nommé + un mutant ROUGE (ou, pour les items DOCUMENTAIRES C-G-4/C-G-5, une assertion/déclaration adéquate). Le pli est **TEST-ONLY + ADR** : `transport.ts`/`classify.ts`/`errors.ts`/`index.ts` **byte-identiques** à `798b4e9` (GOLD intact) ⇒ la surface de risque est minimale (les tests ne peuvent que durcir la suite). **Aucune assertion affaiblie** (seule suppression = un commentaire), oracle vert re-mesuré, **R-25 = 439**, invariants byte-identiques. Les deux tensions déclarées (V11 ≡ MY2 ; item 2b-ii absent de la branche) sont **cohérentes et formées**, pas des « dûs » nus. Nouveau point de conception `data === "0x"` correctement FORMÉ pour 2b-ii. Le paquet reste `upcoming`.

Cible PINNÉE **`f4ecf14`** (base de lot `1a4fd55`, G1 `798b4e9` ancêtre vérifié). Arbre ISOLÉ `F:\tmp\g2-garde2bi\tree\` mis à jour par `git -C F:/Monark-wt-garde2b archive f4ecf14 packages/rpc-guard/test docs/adr | tar -x` (worktree GELÉ jamais touché ; `node_modules` reconstruit conservé). **22/22 fichiers `packages/rpc-guard/{src,test}` == blobs `f4ecf14`** (sha256, APRÈS tous mes rejeux). Les **4 fichiers source == GOLD** (transport `8fbb26b2…`, classify `a502c1d5…`, errors `4a07ba60…`, index `a6eecc8b…`). `TEMP/TMP/TMPDIR=F:\tmp\g2-garde2bi\os-tmp`. Aucun réseau (`fetch` bouchonné, hôtes `.invalid`, clés **factices**). Aucun `git` d'écriture, aucun commit (R-20). Périmètre `798b4e9..f4ecf14` = 5 fichiers : 3 modifiés (`error-hint.test.ts`, `multi-operator.test.ts`, ADR) + 2 docs persistés (mon G2, le checkpoint-2 — hors code). **Tip de branche = `280f9c8`** (VÉRIFIÉ, R-21 : `f4ecf14` ancêtre ; ajoute le SEUL fichier `docs/G1-lot-garde-helius-2b-i.md` = 165 l., la source EN DÉPÔT de C-R-2(a) ; **diff code `f4ecf14..280f9c8` sur `packages apps scripts test` = VIDE** ⇒ l'arbre de code fusionné = `f4ecf14`, ce que je relis ; exclu de R-25 par `:(exclude)docs/G1-lot-*.md`).

---

## 1. Les 9 corrections re-vérifiées une par une contre `798b4e9..f4ecf14` (première main)

| Correction (source) | État sur `f4ecf14` | Test nommé | Preuve reproduite (mutant ROUGE) |
|---|---|---|---|
| **C-R-1** (validateur, BLOQUANT) — D6 prouvé pour UN seul payant | **CORRIGÉ** | `paid_helius_http_error_reprises_only_the_closed_hint` (`error-hint.test.ts:170`) | **V1** (`paid = op==="chainstack"`) → RED, `failing=[paid_helius_…]` (FULL 63 tests) |
| **C-R-2** (validateur, BLOQUANT, ADR) — tuyau/pointeur/résidus | **CORRIGÉ** (§5) | `docs/adr/…md` (blob `60e37b4a…`) | greps : `garde2b`=0, `"0x"`=4, `base64`=4, tuyau `2b-i`=5, `A-3bis`=3 |
| **C-R-3** (validateur, non bloquant) — conformité incomplète | **CORRIGÉ** | `error_vocabulary_single_source_conformance_hint_equals_body` (enrichi) + `rpc_revert_requires_the_json_rpc_code_3_or_minus_32000` (`:208`) | **V12** (`isRevertText` réduit) → RED ; **V9** (garde de code retirée) → RED |
| **C-R-4** (validateur, non bloquant) — `redact` non épinglé | **CORRIGÉ** (voie (i)) | `keyless_host_after_truncation_is_redacted_on_the_raw_body` (`:186`) | **V2** (cibles retirées) + **V3** (tronquer avant expurger) → RED |
| **C-G-1** (G2) — C-4 drift regex↔tableau | **CORRIGÉ** | `error_vocabulary_regex_alternatives_are_all_hint_tokens` (`:218`, via `.toString()`) | **MY1** (`|block limit` ajouté à `isResultLimit`) : SURVIVE→**RED** |
| **C-G-2** (G2) — fail-closed `.data` non épinglé | **CORRIGÉ** | `revert_data_dropped_when_operator_url_unparseable` (`:199`) | **MY2** : SURVIVE→**RED** (= **V11**, byte-identique, §6) |
| **C-G-3** (G2) — garde de code `isRpcRevert` non épinglée | **CORRIGÉ** | `rpc_revert_requires_the_json_rpc_code_3_or_minus_32000` (`:208`) | **MY3** : SURVIVE→**RED** (= V9) |
| **C-G-4** (G2, hygiène) — vacuité DEV-5 non déclarée | **CORRIGÉ** | 4× `assert.equal(err.detail, "")` (`multi-operator.test.ts:~245,260,273,277,288`) | 3/4 load-bearing : **M2** et **V8** rougissent `_never_echoes_operator_key`/`_key_straddling_truncation`/`_never_echoes_operator_userinfo` ; la 4ᵉ (unparseable) = déclaration pure (détail `""` sous code correct ET sous M2/V8, fail-closed) |
| **C-G-5** (G2, zéro-dette) — résidu `.data` fractionné à nommer | **CORRIGÉ** | ADR résidu (3) | déclaration documentaire (clé partielle + hex(base64) + fragmentée, une seule déclaration) |

**Toutes les cibles ROUGES** (harnais validateur adapté à mon arbre, FULL 63 tests) : **V1, V2, V3, V9, V11, V12 → RED** ; V10 → SURVIVE (mutant ÉQUIVALENT, `rawData` undefined hors RpcError — déclaré) ; **M1-M7 → RED** (inchangés, GOLD intact) ; V4-V8 → RED (inchangés). **MY1, MY2, MY3 : SURVIVE→RED** (les 3 trous G2 fermés) ; **MY4 → RED** (contrôle). Tous restaurés byte-exact (FINAL sha transport/classify == GOLD).

## 2. Mutants — rejoués dans l'arbre isolé (harnais adaptés `WT/TREE→mon arbre`, originaux intacts)

- **Harnais worker** (`F:\tmp\g2-garde2bi\mutants.mjs`, test nommé) : M1-M7 `ALL_RED=true ALL_RESTORED=true`, GOLD `transport=8fbb26b2 classify=a502c1d5`.
- **Harnais validateur adapté** (`F:\tmp\g2-garde2bi\cp2-mutants.mjs`, copie de `F:\tmp\cp2-garde2bi\probes\mutants.mjs`, `TREE` → mon arbre, GOLD identique car source inchangée) :
```
V1_paid_is_chainstack_only            RED=true  failing=[paid_helius_http_error_reprises_only_the_closed_hint]
V2_X2_redact_targets_removed          RED=true  failing=[keyless_host_after_truncation_is_redacted_on_the_raw_body]
V3_Y1_keyless_truncate_before_redact  RED=true  failing=[keyless_host_after_truncation_is_redacted_on_the_raw_body]
V9_isRpcRevert_code_check_removed     RED=true  failing=[rpc_revert_requires_the_json_rpc_code_3_or_minus_32000]
V10_data_on_every_error_name          RED=false SURVIVE (équivalent — déclaré)
V11_secretTargets_fail_open           RED=true  failing=[revert_data_dropped_when_operator_url_unparseable]  (= MY2, §6)
V12_isRevertText_relaxed              RED=true  failing=[error_vocabulary_single_source_conformance_hint_equals_body]
M2 (FULL) fail=7 : rougit AUSSI les 3 vacuités payantes (C-G-4 load-bearing)
V8 (FULL) fail=8 : idem + paid_revert_without_data (unit non propagée)
```
- **Harnais G2** (`F:\tmp\g2-garde2bi\my-mutants.mjs`) : `MY1 fail=1 RED`, `MY2 fail=1 RED`, `MY3 fail=1 RED`, `MY4 fail=1 RED` — les 4 restaurés, src pristine après passe.

## 3. Les 7 points de l'orchestrateur

**(1) Chaque C-G-1..5 soldée par test nommé + mutant rouge.** OUI pour les GAPS de couverture : C-G-1 (`error_vocabulary_regex_alternatives_are_all_hint_tokens` / MY1), C-G-2 (`revert_data_dropped_when_operator_url_unparseable` / MY2 = V11), C-G-3 (`rpc_revert_requires_the_json_rpc_code_3_or_minus_32000` / MY3 = V9). Pour les items DOCUMENTAIRES : C-G-4 = 4 assertions `err.detail===""` (3 load-bearing par M2/V8, la 4ᵉ déclarative — correct, la vacuité est désormais AUDITABLE) ; C-G-5 = déclaration ADR (résidu). MY1/MY2/MY3 basculent bien SURVIVE→RED (mesuré §2). **Soldées.**

**(2) C-R-3/C-R-4 : V2/V3/V9/V12 rejoués.** Les 4 ROUGES (§2), chacun sur son test nommé neuf. C-R-4 est plié par la **voie (i)** (un test keyless réel, non une simple phrase d'ADR) — `redact` redevient épinglé (V2+V3 rouges). C-R-3 par la conformité enrichie (V12) + le test de code (V9).

**(3) Aucune assertion affaiblie, tests 2a intacts.** Diff des tests = `error-hint.test.ts` **+81/−1**, `multi-operator.test.ts` **+7/−0**. La SEULE suppression est un **commentaire** (`// C-4 / D6: the vocabulary is SINGLE-SOURCE…`, remplacé par un commentaire enrichi). `test(` : `multi-operator` **19→19** (les 4 `detail===""` sont AJOUTÉES dans des tests existants, aucun test retiré), `error-hint` **10→15** (+5 tests neufs). Le test 2a `transport_error_path_http_non_ok_keeps_body` reste tel que durci au lot 2b-i (non retouché par le pli). La conformité `error_vocabulary_single_source_…` n'a reçu que des AJOUTS (3 corps recorder + 1 revert nu + 2 assertions positives). **Aucun affaiblissement.**

**(4) Test structurel C-G-1 : robuste ou fragile ?** **ROBUSTE pour le vocabulaire courant, et fail-safe sur dérive.** `error_vocabulary_regex_alternatives_are_all_hint_tokens` extrait le corps de chaque prédicat par `.toString().match(/\/([^/]*)\/i/)`, `.split("|")`, et exige chaque alternative ∈ `ERROR_HINT_TOKENS` (avec un expanseur d'UN `?` optionnel : `ranges? over` → `range over`/`ranges over`, les deux au tableau). Il PASSE aujourd'hui (oracle vert) et rougit MY1. **Fragilités déclarées (worker, note §60-63)** — groupes `(a|b)`, un 2ᵉ `?`, une alternative portant `/` ou une regex sans drapeau `/i` — font toutes rougir le test **sur code correct** : c'est la **BONNE direction d'échec** (une dérive force l'auteur à étendre le tableau OU l'expanseur, jamais un passage silencieux d'une vraie dérive). Il épingle `regex ⊆ tokens` (la direction DANGEREUSE : un prédicat reconnaît un signal que l'indice fermé ne peut pas émettre) ; la direction inverse `tokens ⊆ regex` n'est pas épinglée mais est **inerte** (un jeton en trop est émis dans l'indice mais aucun prédicat n'agit dessus). **RÉSERVE mineure (non bloquante)** : l'extraction suppose UN littéral `/…/i` unique par prédicat (vrai aujourd'hui, one-liners) ; une future regex multi-littérale casserait l'extraction — mais en rougissant (fail-safe). **Verdict : propriété, pas faiblesse** — conforme à ce que le worker déclare.

**(5) ADR.** (a) Le pointeur `F:\tmp\garde2b\RENDU-G1.md` est RETIRÉ (`grep -c garde2b`=0), remplacé par les sources EN DÉPÔT (`G0-COMPLEMENT §3` + pli C-6, l'item `GARDE-HELIUS-2b-migration`, `CHANTIERS.md`) + l'assertion C-6(iv) `operatorOf("nodies.app")===operatorOf("pocket.network")==="pocket"` due au G1 de 2b-ii. (b) **Ligne de tuyau 2b-i** AJOUTÉE à la table « Tuyaux déclarés » : entrée = `raise` du transport, sortie = `rpc2.ts` (ré-export + prédicats, quorum `revertKey`) + journal `rpc_errors`, état = **upcoming** (mémoire 2b-i, disque 2b-ii), test = `error-hint.test.ts`. (c) **Résidus `.data` déclarés** en UNE déclaration (résidu (3) = C-G-5) : hex de clé **PARTIELLE** + hex de **base64(clé)** passent `validateRevertData` (ne rejette que l'hex CONTIGU de la cible ENTIÈRE) — classe C-GD-2 RELOCALISÉE dans le canal `.data`, bornée `≤4096`, journal LOCAL, jamais publiée, jamais la clé entière ; miroir de A-3bis Résidu 1. Point `data==="0x"` (résidu (4)) : conservée, `isRpcRevert` vrai, mais `revertKey` la traite comme absente → perte de concordance chainstack↔keyless SANS faux accord — **à trancher en 2b-ii**. (d) **A-3bis résidus 1 et 2 NOMMÉS** (levés pour les payants par D6, conservés keyless). **Claim factuel VÉRIFIÉ** (rpc2.ts byte-identique) : `revertKey` (`rpc2.ts:60`) = `e.data !== undefined && e.data !== "0x" ? e.data.toLowerCase() : …` — le traitement de `"0x"` comme absent est EXACT ; `isRpcRevert` de rpc2.ts (`:53-55`) = code `{3,-32000}` + texte revert (calque fidèle du paquet). **C-R-2 substantiellement clos.**

**(6) Tension V11 ≡ MY2 (mutation byte-identique) : PAS une contradiction.** V11 (validateur `mutants.mjs:35`) et MY2 (G2 `my-mutants.mjs:25`) ont le MÊME `find`/`repl` (`if (targets === undefined) return undefined;` → `return raw;`). Impossible de rougir MY2 sans rougir V11 : c'est le MÊME trou (fail-closed de `validateRevertData` sur URL non analysable), trouvé indépendamment par le validateur (V11) et la G2 (MY2), fermé par UN test (`revert_data_dropped_when_operator_url_unparseable`). Le validateur avait noté V11 « inatteignable via `openGuardedClient` » (le `fetch` échoue sur l'URL invalide AVANT le chemin RpcError) ; le test C-G-2 passe par `raiseVia` (fetch bouchonné) et ATTEINT `validateRevertData` — donc le trou EST réel et est désormais fermé. V11 passant de SURVIVE (au checkpoint) à RED (au pli) n'est pas une régression : c'est un trou COMBLÉ. **Réconciliation** : « les autres inchangés » lisait V11 SURVIVE ; C-G-2 exige de rougir MY2 ≡ V11 ⇒ V11 DOIT rougir. Cohérent, mesuré, pas de STOP.

**(7) Oracle re-exécuté (codes DIRECTS) + R-25.**
| commande | code | dernière ligne utile |
|---|---|---|
| `npm run gate:vocab` | **0** | `gate:vocab OK — scanned 204 file(s), no forbidden claim.` |
| `npm run typecheck` | **0** | `tsc --noEmit` (aucune sortie) |
| `npm run test` | **0** | `ℹ tests 759 ℹ pass 758 ℹ fail 0 ℹ skipped 1` (skip = `fetch_only_inside_client`, until 1b) |
| `npm run lint` | **0** | `eslint .` (0 problème) |
| `npm run lint:ratchet` | **0** | `lint-ratchet: 69/69` |
| `npm run lang:gate` | **0** | `lang-gate OK — 0 non-exempt French hit(s)` |

**R-25** (pathspec `ci.yml:65` verbatim, base `1a4fd55..f4ecf14`) = **7 fichiers, 404 ins + 35 del = 439** (exit 0) ≤ 1150 — **attendu 439 confirmé**. Le pli ajoute `error-hint.test.ts` +80, `multi-operator.test.ts` +7. Les 2 ADR `.md` (58/… lignes) EXCLUS par `docs/**/*.md`. **Invariants** : `git diff --stat 1a4fd55..f4ecf14 -- apps scripts` = VIDE ; les 9 fichiers gelés/invariants byte-identiques (rpc.ts `0e232519`, record.ts `e82f6067`, rpc2.ts `3635f9da`, gel U-4b intact) ; DELIVERED du pli (3 fichiers) = blob `f4ecf14` == in-tree (`8ba546cf`, `34ca56d6`, `60e37b4a`).

## 4. Findings de mon cru (contexte frais)
- **La 4ᵉ assertion de vacuité C-G-4** (`transport_error_drops_body_when_operator_url_unparseable`, `err.detail===""`) n'est rougie par AUCUN mutant existant (M2/V8 la laissent verte : fail-closed rend `detail=""` dans tous les régimes). Ce n'est **pas un défaut** — C-G-4 est un item de DÉCLARATION (rendre la vacuité auditable), pas un gap de couverture ; 3/4 sont additionnellement mutant-backed. Noté pour exactitude, non bloquant.
- **Aucun nouveau gap introduit** : le pli n'ajoute que des tests + de l'ADR (0 source touchée, GOLD intact) ⇒ la suite ne peut que devenir plus stricte. Toutes les propriétés du 2b-i (M1-M7) restent prouvées.
- **`data==="0x"`** est un point de conception NOUVEAU et RÉEL (vérifié sur rpc2.ts), correctement FORMÉ pour 2b-ii (résidu (4) ADR + sous-point item migration + verbatim CHANTIERS §7 du rendu). Zéro-dette respecté.

## 5. Contrôle d'assertion affaiblie / R-21 (pli = re-vérification due)
Un pli qui modifie des tests est **auto-non-certifiant** (R-21) : cette G2-DELTA EST sa passe. Vérifié de première main : (a) 0 source touchée (4 sha == GOLD) ; (b) 0 assertion supprimée (1 commentaire) ; (c) chaque test neuf rougit son mutant cible ; (d) oracle vert ; (e) R-25 439. Le risque résiduel d'un pli test-only (un test neuf FAUX-vert) est écarté : chaque test neuf a un mutant ROUGE associé (V1/V2/V3/V9/V12/MY1/MY2/MY3), donc il DISCRIMINE.

## 6. VERDICT
**PASS.** Le pli fait ce qu'il annonce : **C-R-1..4 + C-G-1..5 résolus ET épinglés** (V1/V2/V3/V9/V11/V12 ROUGES ; MY1/MY2/MY3 SURVIVE→ROUGES ; M1-M7 inchangés ROUGES ; sondes de première main), **TEST-ONLY + ADR** (GOLD intact, aucune source touchée), **aucune assertion affaiblie**, oracle vert (759/758/0/1), **R-25 439**, invariants byte-identiques. Les deux tensions (V11≡MY2 ; item 2b-ii hors branche) sont FORMÉES et cohérentes. Le point `data==="0x"` est un item 2b-ii correctement formé. **error_origin** (pli) : worker (exécution) — plan sain. Le paquet reste `upcoming`. **Fusionnable** ; C-G-1 et C-G-3 restent des exigences d'ENTRÉE du G0 de 2b-ii (elles gardent le vocabulaire et `isRpcRevert` que 2b-ii branche au livre) — désormais épinglées, donc leur régression serait attrapée.

---
### Intégrité (arbre = extrait `git archive`, sans `.git`)
- 22/22 fichiers `packages/rpc-guard/{src,test}` == blobs `f4ecf14`, **re-confirmé APRÈS ma dernière passe de mutants (M2/V8)** ; 4 sources == GOLD ; harnais restaurent byte-exact à chaque mutant (`FINAL golden=true`).
- `git -C F:/Monark status --short` = **vide** ; `git -C F:/Monark-wt-garde2b status --short` = **vide** (worktree GELÉ intact, lecture seule). Rien sur `C:`, aucun réseau, aucun commit (R-20).
- **Fichiers écrits** (tous sous `F:\tmp\g2-garde2bi\`, hors dépôt) : `G2-DELTA-lot-garde-helius-2b-i.md` (ce rapport), `cp2-mutants.mjs` (copie adaptée du harnais validateur), `d-{vocab,tc,test,lint,ratchet,lang}.log`. Réutilisés du 2b-i : `mutants.mjs`, `my-mutants.mjs`, `os-tmp/`.

**R-20 : je ne committe pas, je ne déclenche aucun workflow. R-1 : `claude-opus-4-8[1m]`.**
