Modèle résolu : claude-opus-4-8[1m]

# G2 — RELECTEUR (instance neuve, contexte frais, revue 3 étapes AgileCoder) — GARDE-HELIUS-2b-ii-a (couture pré-déclarée C-3 : `rpc2.ts` canonique + signatures + D-4 + R-A)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé). 2026-09-21.

**Verdict : PASS-AVEC-CORRECTIONS.** Le sous-lot -a est **VERT SEUL** — oracle COMPLET re-exécuté sur l'arbre isolé (`gate:vocab`/`typecheck`/`test` **763/762/0/1**/`lint`/`lint:ratchet` 69/69/`lang:gate`/`export:check` tous exit 0), **R-25 = 207** (pathspec `ci.yml:65` verbatim), invariants du gel D4 + `rpc.ts` byte-identiques, `book_digest 034fbff9…` reproduit, cible `b0f35e6` **byte-identique** au patch worker (`sha256sum -c A.sha256` 8/8 OK). **Identité de classe prouvée de première main** (`rpc2.RpcError === guard.RpcError` SAME-REF ; un `RpcError` levé par le transport EST `instanceof rpc2.RpcError`), **R-A exact** (table de vérité), **6 mutants ROUGES** sur leur test nommé (2 du harnais worker rejoués en équivalent + MY1-MY3 de mon cru), tous restaurés byte-exact. **2 corrections C-G-1..2 formées, TOUTES NON BLOQUANTES** (déclaration ADR du cooldown R-A qui chevauche -b ; entrée lock `apps/sentinel`→`@monark/rpc-guard` non rafraîchie — `npm ci` PASSE néanmoins, prouvé). Aucune correction appliquée par moi (R-20).

Arbre ISOLÉ `F:\tmp\g2-garde2biia\tree` = clone à historique complet de `lot/garde-helius-2b-ii-a` @ **`b0f35e6`** (base `e7f22b8`, **merge-base vérifié** = `e7f22b8`). `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-garde2biia\tree\packages\rpc-guard\src\index.ts` (jonction vers CET arbre). Scratch `F:\tmp\g2-garde2biia\`. `/tmp`, `os.tmpdir()`, `TMP`, `TEMP` **tous = `F:\tmp`** (profil shell) ⇒ **rien sur `C:`** pendant l'oracle/les mutants (vérifié `cygpath -w /tmp` + `node -e os.tmpdir()`). Aucun réseau (fetch bouchonné, hôtes `.invalid`, clés factices `FAKEKEY-*`). Aucun `git` d'écriture, aucun commit (R-20). Clone jetable : mutations transitoires appliquées puis restaurées byte-exact (`git status --porcelain` = 0 en fin ; HEAD toujours `b0f35e6`).

Périmètre jugé : `git diff e7f22b8..b0f35e6` = **8 fichiers** (`apps/bell/src/ethereum.ts`, `apps/sentinel/package.json`, `apps/sentinel/src/ukemi/record.ts`, `apps/sentinel/src/ukemi/rpc2.ts`, `apps/sentinel/test/pool-rpc-1a.test.ts`, `apps/sentinel/test/ukemi-guard-classify.test.ts` [neuf], `apps/sentinel/test/ukemi.test.ts`, `packages/rpc-guard/src/classify.ts`). Le sous-lot -b (record.ts migration, grep CI, e2e) n'est PAS jugé ici (relu séparément) ; je vérifie seulement que -a est vert SEUL.

---

## 1. Table EXIGENCE (G0 §10 seam C-3 / rulings R-A/R-D / D-4) → fichier:ligne → test nommé (vert) → mutant (ROUGE rejoué)

| Exigence | fichier:ligne (`b0f35e6`) | test nommé (vert) | mutant → ROUGE (rejoué, restauré) |
|---|---|---|---|
| **L-2-a** `rpc2.ts` ré-exporte `RpcError`/`BudgetExceededError` canoniques + importe les 3 classifieurs (0 classe / 0 regex locale) | `rpc2.ts:20-21` (import+export) ; classes/regex locales supprimées (base `e7f22b8:33-52,112-117`) | `ukemi_recorder_classifiers_are_single_source_conformant` (identité de fonction : `isResultLimit===guardIsResultLimit`) | **M3** regex locale restaurée dans `rpc2.ts` → identité de fonction cassée → ROUGE |
| **C-1(a)** identité `instanceof RpcError` à travers la frontière ; `ConcordantRevertError` sur 2 reverts concordants | canonique `errors.ts:48-53` (`RpcError extends TransportError`), `index.ts:8`, consommé par `rpc2.ts` + `makeUkemiPool` `rpc2.ts:171,181` | `ukemi_recorder_rpc_error_identity_holds_through_transport` (transport réel, C-5) | **M1** classe locale restaurée (rpc2 local + isRpcRevert local) → transport lève la classe PAQUET ≠ locale → bench → `NoQuorumError` → ROUGE |
| **R-A / D-"0x"** jambe PAYANTE `data==="0x"`/absente BENCHÉE ; `revertKey !== "0x"` conservé | `classify.ts:56` ; `revertKey` `rpc2.ts:44` conservé | `paid_revert_with_empty_0x_data_is_benched` (transport réel : `chainstack` sert `{code:3,…,data:"0x"}`) | **M2** `"0x"` traité présent pour un payant → le revert payant entre au quorum → `QuorumDisagreementError` → ROUGE |
| **R-D** ripple Bell : `ethereum.ts` signature 6-args (`op=providerOf(url)`, unit keyless) | `ethereum.ts:17`(import `providerOf`), `:70`(throw) | (typecheck fusionné) + `pool-rpc-1a-bell.test.ts` inchangé (vert) | **MY3** ancienne arité 3-args → `typecheck` TS2345 `ethereum.ts(70,75)` → ROUGE |
| signature ripple `record.ts` (une ligne, n'exige PAS la suppression de `makeBudgetedCall`) | `record.ts:127` (throw 6-args, `makeDefaultCall` intact) | `ukemi_default_call_classifies_rpc_errors` (reproduit `book_digest` PIN via le VRAI `defaultCall`) | (couvert : PIN 034fbff9 rougirait si la classe divergeait) |
| ripple signature tests (17 sites) via helper `rerr` keyless | `ukemi.test.ts:28` (`rerr`), 17 usages | `ukemi_revert_key_uses_data`, `ukemi_is_rpc_revert_criterion`, … (verts) | **MY2** `revertKey` traite `"0x"` comme donnée → sous-cas `mixed` GHO V-4 disagree → `ukemi_revert_key_uses_data` ROUGE |
| refus de budget jamais benché/réessayé au quorum | `rpc2.ts:170,192,232` (`instanceof BudgetExceededError` throw FIRST) | `u4_budget_fail_closed_not_swallowed` (`ukemi-u4a.test.ts:40`, base-identique, importe `BudgetExceededError` du ré-export) | (identité SAME-REF : transport lève la classe paquet, `instanceof` tient → non benché) |

## 2. Oracle RE-EXÉCUTÉ (codes capturés DIRECTEMENT, hors pipe : `npm run X > log 2>&1; echo exit=$?`)

| commande | code | dernière ligne utile | rendu worker (§2/§0) |
|---|---|---|---|
| `npm run gate:vocab` | **0** | `gate:vocab OK — scanned 205 file(s), no forbidden claim.` | 0 ✓ (205 vs 206 a+b : -a a un fichier de moins) |
| `npm run typecheck` | **0** | `tsc --noEmit` (aucune sortie) | 0 ✓ |
| `npm run test` | **0** | `ℹ tests 763  ℹ pass 762  ℹ fail 0  ℹ skipped 1` | **763/762/0/1** ✓ (identique au rendu -a) |
| `npm run lint` | **0** | `eslint .` (0 problème) | 0 ✓ |
| `npm run lint:ratchet` | **0** | `lint-ratchet: 69/69 (… measured_on 2026-09-16)` | 0, 69/69 ✓ |
| `npm run lang:gate` | **0** | `lang-gate OK — 0 non-exempt French hit(s)` | 0 ✓ |
| `npm run export:check` | **0** | `check OK — 0 forbidden path, 0 non-exempt French hit` | 0 ✓ |

**Concordance TOTALE avec le rendu -a.** Aucun `fail`, aucune ligne `not ok`. **Le seul skip = `fetch_only_inside_client`** (marqué `﹣ … # until 1b: apps/bell/src paid fetch/env.<key> migrate…`) — SKIP-until-1b pré-existant, apps/bell, inchangé par -a, **légitime et hors périmètre -a**. Logs : `F:\tmp\g2-garde2biia\oracle\{vocab,typecheck,test,lint,ratchet,lang,export}.log`.

## 3. R-25 (pathspec `.github/workflows/ci.yml:65` VERBATIM, base `e7f22b8...b0f35e6`, formule `ins+del`)

`git diff --shortstat "e7f22b8...b0f35e6" -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}'`
= **`8 files changed, 154 insertions(+), 53 deletions(-)`** ⇒ **R-25 = 154+53 = 207** ≤ 1150. **Identique au rendu.** (Notation `*.{json,jsonl,csv}` condensée ici ; la commande exécutée porte les 9 entrées `:(exclude,glob)` SÉPARÉES de `ci.yml:65` verbatim — `fixtures/**/*.json`, `…/*.jsonl`, `…/*.csv`, etc.) Le seam C-3 est correctement activé (worker a mesuré total a+b = 1322 > 1150 ; -a = 207, -b = 1125, les DEUX ≤ 1150 ⇒ couture propre, pas d'escalade). `docs/**/*.md` exclus (l'amendement ADR ne compte pas).

## 4. Mutants — 6/6 ROUGES sur test nommé, restauration byte-exacte

### 4a. Les 2 mutants du harnais worker RELEVANT de -a — rejoués en ÉQUIVALENT (contexte frais, mon propre pilote sur le clone)
J'ai lu `F:\tmp\garde2bii\mutants.mjs` (les deux entrées -a) et rejoué des mutations ÉQUIVALENTES sur mon clone isolé (jamais contre le worktree gelé) :

| mutant (worker) | ancre worker | mon rejeu | test nommé | résultat |
|---|---|---|---|---|
| `classe_locale_restauree (-a, via transport)` | `rpc2.ts` : import/re-export → classe locale 6-args + `isRpcRevert` local (`instanceof <local>`) | **M1** (classe locale 3-args + `isRpcRevert` local) — même effet : identité cassée | `ukemi_recorder_rpc_error_identity_holds_through_transport` | **exit 1, fail 1, RED, restauré** |
| `0x present pour un payant (-a, R-A, via transport)` | `classify.ts:56` : retire `\|\| e.data === "0x"` | **M2** (identique byte-pour-byte) | `paid_revert_with_empty_0x_data_is_benched` | **exit 1, fail 1, RED, restauré** |

Équivalence confirmée : les ancres et tests-cibles du worker correspondent à M1/M2 ; le worker mute `rpc2.ts` avec une classe locale 6-args (ignore `_op/_u`), moi avec la 3-args pré-migration — les DEUX cassent l'identité à travers la frontière du paquet. Rejoué DEPUIS le transport réel (`openGuardedClient` + `globalThis.fetch` bouchonné, C-5), jamais un `RpcError` construit à la main.
*Note (D-1)* : le harnais worker n'a PAS de mutant regex DÉDIÉ (G0 §9 conflate « classe/regex locale restaurée » en un seul item ; le worker n'a instrumenté que la classe). **M3** (de mon cru) le fournit et prouve que l'assertion d'identité de FONCTION de D-4 (`isResultLimit===guardIsResultLimit`) est PORTEUSE — NON BLOQUANT, le test D-4 le tue déjà.

### 4b. Mes mutants (de mon cru, ≥ 3 exigés) — pilote transitoire mono-ancre, restauration sha256
```
M3  regex locale restaurée dans rpc2.ts (isResultLimit/isPlanLimited)  -> ukemi_recorder_classifiers_are_single_source_conformant  RED restored
MY1 R-A inversé : jambe KEYLESS benchée au lieu de la PAYANTE          -> paid_revert_with_empty_0x_data_is_benched                RED restored
MY2 revertKey traite "0x" comme donnée (retire la garde !== "0x")      -> ukemi_revert_key_uses_data (sous-cas mixed GHO V-4)      RED restored
MY3 ethereum.ts ancienne arité 3-args (ré-export d'appel différent)    -> typecheck TS2345 ethereum.ts(70,75)                     RED restored
```
Les 4 : baseline VERT → mutation → test nommé ROUGE → `git checkout` → sha256 origine restauré (clone `git status` = 0 en fin). MY1/MY2 rejoués via le transport / makeUkemiPool réels. Le mutant du G0 « ré-export d'une classe DIFFÉRENTE » = M1 (classe locale ≠ paquet). « regex locale restaurée » = M3. « `"0x"` rejoué depuis le transport » = M2. « identité `instanceof` » = M1.

## 5. Invariants byte-identiques + identité de classe

**5a. Gel D4 + `rpc.ts` (oracle d'invariant élargi G0 §8) :** `git diff --quiet e7f22b8..b0f35e6 -- scripts apps/sentinel/test/fixtures/ukemi/u4 apps/sentinel/test/fixtures/ukemi/u4b apps/sentinel/src/rpc.ts` = **exit 0 (VIDE)**. `rpc.ts` sha256 = `0e232519a18aaa43…` = M-10. Les 3 fichiers src du gel (`wadray.ts`, `abi.ts`, `l1-split.ts`) ABSENTS du diff -a ⇒ byte-identiques. `book_digest 034fbff9…` (`ukemi.test.ts:34`, PIN inchangé) et `PINNED_DIGEST 267cd991…` (`ukemi-u4-scores.test.ts:20`) intacts ; le PIN `book_digest` est de plus REPRODUIT par le VRAI `defaultCall` (`ukemi_default_call_classifies_rpc_errors`, vert).

**5b. Cible == patch worker :** `sha256sum -c F:\tmp\garde2bii\A.sha256` = **8/8 OK** (ethereum.ts `86dd463a`, package.json `359b7f4f`, record.ts `c7085e15`, rpc2.ts `92577c5a`, pool-rpc-1a.test.ts `ce4833ae`, ukemi.test.ts `9e0916a1`, ukemi-guard-classify.test.ts `67983c10`, classify.ts `b4fb5c17`) ⇒ le commit orchestrateur `b0f35e6` applique fidèlement `A.patch`. Concorde RENDU §4 (rpc2 `92577c5a`, classify `b4fb5c17`, ethereum `86dd463a`).

**5c. Identité de classe (de première main, `import * as` sur le clone) :** `rpc2.RpcError === guard.RpcError` **SAME-REF** ; `rpc2.BudgetExceededError === guard.BudgetExceededError` **SAME-REF** ; `rpc2.{isRpcRevert,isResultLimit,isPlanLimited} === guard.{…}` **SAME-REF** ; `new guard.RpcError(...)` est **`instanceof rpc2.RpcError` = true** ET `instanceof guard.TransportError = true`. Table de vérité R-A `isRpcRevert` : paid data=`0xdead`→**true** (revert réel concorde), paid data=`0x`→**false** (benché), paid absent→**false** (benché), keyless {`0x`,absent,`0xdead`}→**true** (keyless intact).

## 6. Points à JUGER (mission 1–8)

**(1) Identité de classe / `ConcordantRevertError` — PASS.** `rpc2.RpcError === guard.RpcError` (SAME-REF, §5c). `ConcordantRevertError` se forme encore sur 2 reverts concordants : `rpc2.ts:181` `if (a.kind === "revert") throw new ConcordantRevertError` ; test `ukemi_recorder_rpc_error_identity_holds_through_transport` (2 opérateurs keyless distincts, même revert code-3 avec data, DEPUIS le transport) VERT ; **M1 ROUGE** (identité cassée → `NoQuorumError`). 0 classe locale, 0 regex locale dans `rpc2.ts` (vérifié : lignes 33-52 supprimées, seuls `NoQuorumError`/`ConcordantRevertError`/`revertKey`/`operatorOf` restent).

**(2) R-A — PASS (résidu ADR = C-G-1 NON BLOQUANT).**
- *Aucun revert réel benché à tort* : `classify.ts:56` `if (e.unit !== "keyless" && (e.data === undefined || e.data === "0x")) return false;` — un revert payant avec data RÉELLE (`0xdead…`) → `false && …` → non benché → concorde (table §5c). Seuls `"0x"`/absent payants sont benchés.
- *Plus de FAUX DÉSACCORD `"0x"` payant vs keyless* : sous R-A la jambe payante `"0x"` ne rejoint plus `got` (branche `else` `rpc2.ts:172`, pose `cooldownUntil` 25 s, PAS d'appel `onQuorum`) ⇒ elle ne pollue plus la paire `chainstack|<keyless>` de `--concordance-out` ; à l'état HEAD (base) elle entrait comme revert et déclenchait `onQuorum(...,false)` + `QuorumDisagreementError`. Distinction bench (`NoQuorumError`) vs entrée (`QuorumDisagreementError`) épinglée par `paid_revert_with_empty_0x_data_is_benched` ; **M2 et MY1 ROUGES** confirment.
- *Keyless intact* : `unit==="keyless"` court-circuite la garde (table §5c) ; sous-cas `mixed` GHO V-4 (`"0x"` vs absent, DEUX keyless) reste concordant (`ukemi_revert_key_uses_data` vert) ; **MY2 ROUGE** prouve que `revertKey`'s `!== "0x"` est porteur.
- *Chemin RÉEL du recorder en -a* : sur la jambe chainstack via `makeDefaultCall` (`unit="keyless"` codé en dur `record.ts:127`), le comportement pré-R-A persiste — **INCHANGÉ par rapport à la base** (le `isRpcRevert` LOCAL pré-migration de `rpc2.ts` n'avait AUCUNE garde d'unité), donc AUCUNE régression. R-A ne s'engage que sur le chemin `openGuardedClient` (transport, `unit` réel par opérateur), câblé au recorder en **-b** ; en -a il est prouvé par le seul test neuf (transport). Le PIN `book_digest 034fbff9…` reproduit via le VRAI `defaultCall` (`ukemi_default_call_classifies_rpc_errors`) confirme l'absence de régression.
- *Bord `"0X"` (majuscule)* : CLOS structurellement — `validateRevertData` (`transport.ts:124`) `/^0x[0-9a-fA-F]*$/` est CASSE-SENSIBLE sur le préfixe ⇒ `"0X…"` → `undefined` → benché par la clause `data === undefined`. Pas de résidu.
- *Cooldown déclaré à l'ADR* : le cooldown 25 s (mécanisme PRÉ-EXISTANT `rpc2.ts:172,232`, non introduit par -a ; R-A élargit seulement QUAND il se déclenche) est déclaré dans **l'amendement ADR de -b** (`adr-amendment.md`:35 / worktree `ADR-GARDE-HELIUS…md:361-367` : « pose `cooldownUntil` 25 s sur `chainstack` (`rpc2.ts` quorum2) »), **PAS dans le commit -a** (l'ADR n'est pas au diff -a). ⇒ **C-G-1 (NON BLOQUANT)**.

**(3) Refus de budget jamais réessayé par `withRetry`/quorum de `rpc2.ts` — PASS.** `quorum2`/`getLogsVia`/`finalized` re-jettent `BudgetExceededError` en PREMIER (`rpc2.ts:170,192,232`, `instanceof BudgetExceededError`) AVANT tout bench/split. Le ré-export est SAME-REF (§5c) ⇒ un `BudgetExceededError` levé par `openGuardedClient` (transport) est bien attrapé par ce `instanceof` à travers la frontière. Épinglé par l'EXISTANT `u4_budget_fail_closed_not_swallowed` (`ukemi-u4a.test.ts:40`, importe `BudgetExceededError` du ré-export, base-identique en -a, VERT). `withRetry` vit dans `record.ts:80-104` (base-identique en -a, ne réessaie que AbortError/429/≥500, JAMAIS `RpcError`/`BudgetExceededError`) ; le test dédié `ukemi_record_budget_refusal_is_not_retried` appartient à -b (hors périmètre).

**(4) R-D Bell intact hors la ligne d'appel — PASS.** `git diff … -- apps/bell` = **UNIQUEMENT `ethereum.ts`** (1 fichier, 5+/2−). Le diff = exactement la ligne d'import (`+ providerOf`) + la ligne throw 6-args (`new RpcError(providerOf(url), msg, code, "", "keyless", data)` + 3 lignes de commentaire) — aucune dérive de logique. `op = providerOf(url)` = hôte NU (`providerOf` exporté `rpc.ts:29` ; côté recorder `record.ts:127` utilise `prov = providerOf(url)` défini `record.ts:86`), JAMAIS l'URL (hygiène C-10 Bell) ; `unit="keyless"` (aucun banc payant introduit à Bell) ; `detail=""`. `pool-rpc-1a-bell.test.ts` NON modifié ; tests Bell VERTS (`bell_eth_v3_swap_decode_and_vwap`✔, suite 762 pass).

**(5) Gel D4 + `rpc.ts` byte-identiques ; `book_digest 034fbff9…` — PASS.** Voir §5a/5b. Oracle d'invariant exit 0 ; `rpc.ts 0e232519…` ; PIN reproduit via le VRAI `defaultCall`.

**(6) Aucune assertion affaiblie dans les tests adaptés — PASS.** Diff annoté (`ukemi.test.ts`, 17 sites) : chaque `new RpcError(msg, code, data)` → `rerr(msg, code, data)` où `rerr = new RpcError("test-op", message, code, "", "keyless", data)` — **message/code/data IDENTIQUES**, cibles d'assertion (`assert.rejects`/`assert.ok`/`assert.equal` + chaînes descriptives) **INCHANGÉES**. Le helper n'ajoute que `op="test-op"`/`detail=""`/`unit="keyless"` (inertes pour ces reverts keyless). Le sous-cas PORTEUR GHO V-4 `mixed` (`rerr("execution reverted",3,"0x")` vs `rerr("execution reverted",3)`) reste concordant — **MY2 ROUGE** le protège. `pool-rpc-1a.test.ts:121` : `new RpcError("pocket.network", "…narrow your filter: 5000", -32602)` ajoute `op`, garde message/code ⇒ le split getLogs (sur `isResultLimit(message)`) inchangé (`pool_rpc_1a_pocket_getlogs_split_holds_5000` vert). Aucune assertion supprimée. Couverture payante NON perdue — AJOUTÉE par le nouveau `paid_revert_with_empty_0x_data_is_benched`.

**(7) Skip « until 2b-iii » de `ukemi-u4-scores.test.ts` — PASS (dans -b, PAS -a).** `ukemi-u4-scores.test.ts` **N'EST PAS au diff -a** ; en -a il porte l'import STATIQUE `import { selectIndices } from "…/scripts/census/u4-redraw.mjs"` (`:14`), qui LINKE (car `record.ts` en -a garde `makeDefaultCall`/`makeBudgetedCall` — migration = -b) ⇒ le test **TOURNE et PASSE** (`u4_redraw_selects_by_book_digest_seed` ✔, observé). **Le skip est un artefact -b** (dé-linkage quand -b retire les exports de `record.ts` → import dynamique + skip-until-2b-iii, self-un-skip quand 2b-iii relie le script). En -a : légitime, ne masque AUCUN rouge (le test est vert). Indépendant de l'ordre de fusion 2b-iii : l'import statique linke des deux côtés ; seul -b casse le lien et porte le skip. Le seul skip de -a = `fetch_only_inside_client` (until-1b, apps/bell), sans rapport.

**(8) MAST — PASS.** Voir §9.

## 7. Corrections FORMÉES (aucune appliquée par moi — R-20)

- **C-G-1 (NON BLOQUANT) — la déclaration ADR du cooldown 25 s de R-A chevauche -b, absente du commit -a.**
  - *Mesuré* : `grep -iE "cooldown|25 ?s|R-A|0x" docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` sur l'arbre -a = **seule** la l.323 (ré-export), **AUCUNE** mention du cooldown 25 s ni de R-A. L'amendement qui le porte (`adr-amendment.md`:29-37 ; APPLIQUÉ dans le worktree a+b `ADR-…:307,361-367`) est un livrable -b (RENDU §8 : `docs/adr/…` modifié en a+b). La CONSIGNE-STANDARD **E-3** (« Cooldowns/backoffs déclarés à l'ADR avec leur valeur ») n'est donc pas satisfaite par -a SEUL.
  - *Pourquoi NON BLOQUANT* : (i) le seam C-3 approuvé (G0 §10) assigne l'amendement ADR à **L-5 général**, PAS à -a ; le worker a suivi le plan. (ii) Le banc R-A est **production-inatteignable en -a** : le recorder reste sur `makeDefaultCall` (`unit="keyless"` codé en dur `record.ts:127`) ⇒ R-A ne s'engage que sur le chemin `openGuardedClient` (transport), exercé UNIQUEMENT par le test neuf ; le paquet est `upcoming` (2b-i G2). Le cooldown 25 s est de plus PRÉ-EXISTANT (non introduit par -a).
  - *Correctif (item formé, zéro dette)* : **propriétaire = orchestrateur ; déclencheur = G7 2b-ii** — A et B closent au MÊME G7 (l'amendement `adr-…:361-367` accompagne alors -a), OU les lignes R-A/cooldown sont cherry-pickées dans -a. *error_origin* : plan (seam sépare l'ADR de -a — par design, pas un défaut worker).

- **C-G-2 (NON BLOQUANT, hygiène lock) — l'entrée lock `packages["apps/sentinel"].dependencies` ne liste pas `@monark/rpc-guard`.**
  - *Mesuré* : `apps/sentinel/package.json` -a AJOUTE `@monark/rpc-guard` (5ᵉ dép) ; `package-lock.json` (non touché en -a) garde l'entrée `apps/sentinel` à 4 dép (sans rpc-guard). **Mais `npm ci` PASSE** : preuve isolée (copie des seuls manifestes, sans réseau) — `npm ci --dry-run` sur les manifestes -a **exit 0** ; **contrôle négatif** : injecter une dép EXTERNE factice (`left-pad`) fait échouer `npm ci --dry-run` avec `EUSAGE … Missing: left-pad@1.3.0 from lock file` (exit 1) ⇒ la validation de sync EST active, et l'arête workspace `@monark/rpc-guard` (déjà `link:true` dans le lock, `node_modules/@monark/rpc-guard` present) est TOLÉRÉE. `npm install --package-lock-only --dry-run` = exit 0 silencieux (aucun changement de lock voulu). Le CI (`ci.yml:109,122` `npm ci`) ne rougit PAS.
  - *Pourquoi NON BLOQUANT* : `npm ci` PASSE (prouvé) ; l'oracle worker/le mien sur `node_modules` jonctionné (mk-nm.ps1) ne pouvait structurellement PAS voir cet écart — je l'ai clos par la vérification isolée ci-dessus. C'est une divergence de PRÉCÉDENT (T-1a `227f217` a, lui, rafraîchi l'entrée lock `apps/bell` pour une dép workspace), pas une casse CI.
  - *Correctif (optionnel, cohérence)* : rafraîchir l'entrée `packages["apps/sentinel"].dependencies` du lock (`npm install --package-lock-only`) au pli ou en -b. *error_origin* : worker (entrée par-workspace non rafraîchie) — tolérée par `npm ci`.

- **Observation (NON BLOQUANT, hygiène de rendu, pas une correction)** : le RENDU-G1 ne porte pas la section explicite « Consigne standard : point par point » exigée par `CONSIGNE-STANDARD-G1.md:3` ; le contenu A-F est présent mais mappé implicitement (§2=A-3, §3=A-5, §4=A-6, §5=D-1…). Signalé pour le G7.

## 8. Consigne standard (`CONSIGNE-STANDARD-G1.md`) — A-F point par point sur -a

- **A** (env/preuve) : A-1 ligne modèle ✓ (RENDU l.1) ; A-2 `node_modules` jonction ✓ (`require.resolve` = cet arbre) ; A-3 codes directs ✓ (§2) ; A-4 `DELIVERED.sha256` ✓ ; A-5 R-25=207 pathspec verbatim ✓ ; A-6 invariants byte-identiques ✓ (§5). **PASS.**
- **B** (secrets) : B-1/B-4 -a n'ajoute AUCUNE sonde d'env (`ethereum.ts`/`record.ts:127` throws n'utilisent que `providerOf`/`prov` = hôte nu, jamais l'URL) ; B-5 grep CI = -b ; B-2/B-3/B-6 = paquet (2b-i)/-b. **PASS (dans le périmètre -a).**
- **C** (identités/erreurs) : C-1 classe canonique unique + `instanceof` stable + mutant M1 ✓ ; C-2 refus de budget non réessayé au quorum ✓ (item 3) ; C-3 une couche de retry (record.ts, base-identique) ✓ ; C-4 classifieurs importés de `classify.ts` + garde de code {3,−32000} (paquet, `classify.ts:50`) + `ERROR_HINT_TOKENS` ✓. **PASS.**
- **D** (tests) : D-1 chaque test imposé a son mutant ROUGE (§4) ✓ ; D-2 vecteurs non vides (corps M-7/HTML/Reverted) ✓ ; D-3 e2e transport réel (les 3 tests neufs pilotent `openGuardedClient` réel + `fetch` bouchonné, C-5) ✓ ; D-4 aucune assertion affaiblie (§6.6) ✓. **PASS.**
- **E** (concurrence/état) : E-1/E-2 = -b (lock/ledger record.ts) ; **E-3 cooldown à l'ADR = C-G-1** (déclaré en -b). **PASS sous C-G-1.**
- **F** (rédaction) : F-1 tuyaux ADR = amendement -b ; F-2 ASCII sur lignes ajoutées ✓ (0 non-ASCII), `gate:vocab` 0 ✓, clés factices seulement ✓ ; F-3 déviations DEV-1..5 déclarées au RENDU ✓. **PASS.**

## 9. Contrôle MAST (14 modes — résiduel)
- **FM-1.1/1.2** : n/a — seam C-3 pré-déclaré, périmètre -a suivi ; R-20 respecté (worker ne committe pas ; moi non plus).
- **FM-1.3/1.4/2.1/2.6** : n/a.
- **FM-1.5 Termination** : OK — -b est un item formé (propriétaire+déclencheur), pas une clôture prématurée.
- **FM-2.2/2.3** : n/a — périmètre strict (8 fichiers ; `apps/bell` = 1 ligne).
- **FM-2.4 Information withholding** : mineur — C-G-1 (ADR -b) et C-G-2 (lock) déclarés ici, non cachés.
- **FM-2.5 Ignored other agent** : OK — pli checkpoint-1 C-1..C-9 intégré (D-4/R-A/identité via transport présents).
- **FM-3.1 Premature termination** : n/a — -a cohérent, vert, autonome (VERT SEUL prouvé).
- **FM-3.2 No/incomplete verification** : LE mode résiduel — l'oracle sur `node_modules` jonctionné ne voit pas la sync `npm ci` du lock ⇒ clos par la vérif isolée (§7 C-G-2) ; identité/`"0x"` rejoués via le TRANSPORT réel, pas des `RpcError` à la main.
- **FM-3.3 Incorrect verification** : GARDÉ — oracle re-exécuté, mutants rejoués indépendamment (équivalence worker confirmée), cible sha-vérifiée (`A.sha256` 8/8), angle mort lock clos par contrôle négatif validé.

## 10. error_origin PROPOSÉ (au G7)
Conception -a = **saine** (seam C-3 approuvé, R-A/R-D rulés). Exécution : **worker** pour C-G-2 (entrée lock par-workspace non rafraîchie, tolérée par `npm ci`) ; **plan** pour C-G-1 (le seam place l'amendement ADR en -b — par design, à clore au G7 2b-ii). Toutes NON BLOQUANTES.

## 11. VERDICT
**PASS-AVEC-CORRECTIONS.** -a est **VERT SEUL** : oracle complet re-mesuré (763/762/0/1, tous gates exit 0), R-25=207 (pathspec verbatim), invariants du gel D4 + `rpc.ts` byte-identiques, `book_digest` reproduit, cible byte-identique au patch worker (`A.sha256` 8/8), identité de classe SAME-REF prouvée de première main, R-A exact (table de vérité + bord `"0X"` clos), 6/6 mutants ROUGES restaurés byte-exact, refus de budget non benché, Bell intact hors une ligne, aucune assertion affaiblie, skip 2b-iii correctement en -b. **2 corrections C-G-1..2, TOUTES NON BLOQUANTES**, chacune fichier:ligne + preuve + propriétaire + déclencheur — **zéro dette formée**, pas un « dû » nu. Aucune frontière d'escalade sur CE sous-lot. `@monark/rpc-guard` reste `upcoming` (branchement = 2b-ii-b/course).

**Recommandation au G7** : -a est fusionnable en l'état ; C-G-1 se clôt au G7 2b-ii (A+B au même G7, l'amendement `adr-…:361-367` accompagne -a) ; C-G-2 est un rafraîchissement lock optionnel (cohérence T-1a), `npm ci` passant déjà.

---
### Intégrité (fin de passe)
- Clone `F:\tmp\g2-garde2biia\tree` : `git status --porcelain` = **0** ; HEAD = **`b0f35e6`** (tous les mutants restaurés byte-exact).
- `F:\Monark` (lecture seule) : `git status --porcelain` = **0**. Worktree gelé `F:\Monark-wt-garde2bii` : `git status --porcelain` = **0** (aucune écriture ; ADR lu en lecture seule).
- Rien sur `C:` (`/tmp`=`os.tmpdir()`=`TMP`=`TEMP`=`F:\tmp`). Aucun réseau (fetch bouchonné, `.invalid`, clés factices). Artefacts hors dépôt : `F:\tmp\g2-garde2biia\{oracle\*.log, lockcheck\*, G2-lot-garde-helius-2b-ii-a.md}`.

**R-20 : je ne committe pas, je ne déclenche aucun workflow.** **R-1 : `claude-opus-4-8[1m]`.** **R-21 : chaque affirmation porte sa preuve reproductible (oracle hors pipe, mutants rejoués+restaurés sha, identité `import * as`, `npm ci` isolé + contrôle négatif).**
