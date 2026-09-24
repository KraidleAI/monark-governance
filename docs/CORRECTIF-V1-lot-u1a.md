# CORRECTIF checkpoint-2 — lot U-1a (recorder book Aave v3, ADR-U1) : V-1 (bloquante) + V-2

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Préfixe `claude-opus-4-8` conforme (roster 2026-08-14, Opus 5 banni).
**Contexte** : worktree `F:\Monark-wt-p1b1`, branche `lot/u-1a`, HEAD gelé `dedfcd5` (base `58fe309`). Correctif **non committé** (R-20 ; l'orchestrateur relit et committe). Date 2026-09-19.

## 1. Le défaut V-1 (confirmé sur pièces)
À `dedfcd5`, la tolérance « `description()` reverté ⇒ `""` » (pliage G2 C2) était **inatteignable à travers `makeUkemiPool`** : `rpc2.ts` `quorum2` classait **tout** rejet de fournisseur comme transport (bench 25 s `cooldownUntil`, `NoQuorumError` sous 2 succès), et `book.ts` relançait `NoQuorumError`. Un `description()` reverté **unanime** (fait on-chain : oracle GHO `0xd110cac5…` sans `description()`) abstenait donc le book entier. La tolérance ne survivait que pour un `Error` nu — que le pool ne produit jamais. `error_origin = orchestrateur` (pliage C2 écrit ET vérifié par la même instance, CA-9).

## 2. Diff résumé par fichier (arbre corrigé, lignes = `awk END{NR}`)
| Fichier | Delta | Lignes | sha256 (LF) |
|---|---|--:|---|
| `apps/sentinel/src/ukemi/rpc2.ts` | +`RpcError`/`ConcordantRevertError`/`isRpcRevert`/`revertKey` ; `quorum2` gère les issues `ok`/`revert` (un revert ne benche pas) ; en-tête | 198 (dedfcd5 : 165) | `019786c8836cb3f382682d9067fea23a390ff7f000cce89cb6e3c2b53e7b74b2` |
| `apps/sentinel/src/ukemi/book.ts` | catch de `description()` restreint à `ConcordantRevertError` ; import `../rpc.ts` retiré ; commentaire | 199 (dedfcd5 : 200) | `daa65f984a5845713ad27e97cfed4126a903a6662f40e3d5d58c62006e581c61` |
| `apps/sentinel/src/ukemi/record.ts` | `defaultCall` : `json.error` ⇒ `RpcError` typé (`code`+`data`) ; HTTP/timeout = transport | 75 (dedfcd5 : 73) | `a4b158a56631ca4fd8e68431dcbff86ba478dd9525a6d366cf3b4b57c6bc3725` |
| `apps/sentinel/test/ukemi.test.ts` | ancien test 0 remplacé par 5 tests d'oracle à travers `makeUkemiPool` (a/b/c/d + `isRpcRevert`) ; nom `ukemi_description_disagreement_abstains_book` **conservé** (traçabilité C2) mais **corps réécrit** (fixtureReader mocké → `makeUkemiPool`) ; commentaire du mutant `oracle_source` corrigé | 255 (dedfcd5 : 205) | `84ebf1361569505da0404b544b5ded79522a85b1e6613e14b3751dc94d1be238` |
| `docs/adr/ADR-U1-recorder-book-liquidation.md` | +bloc « Amendement 2026-09-19 (checkpoint-2 V-1) » (D1/D3), ligne D9 quinquies/sexies non touchée | +31 (135) | (gouvernance — hors table octet) |
| `docs/G1-lot-u1a.md` | V-2 : §1/§2/§4/§5b/§7-3 réécrits + section « Correctif checkpoint-2 » | (exclu R-25) | — |
| `docs/G2-lot-u1a.md` | ligne mutants « `description()` reverté unanime → toléré » annotée (invalidée par C2, rétablie par V-1) | (exclu R-25) | — |

Fichiers du lot **inchangés** (sha = dedfcd5) : `abi.ts` `9edc596b…` (168), `wadray.ts` `7bee76fc…` (55), `clusters.ts` `d247703b…` (52), `weth-book.fixture.json` `f98827f9…` (43), `PROVENANCE-weth-book.md` `732842dc…` (47), `vocab-banned.json` `c9c1acb8…` (124), `scripts/grep-forbidden.mjs` `64577097…` (251).

**`ukemi_sha`** (recette `record.ts` `ukemiSha` sur `ukemi/*.ts`, octets bruts LF) = `c94bd79ba17348a6999e6fbdc9ab28785e7fecb59e8f7d25e2d127c17ad1ef00` (avant : `c9cb9380…`).

## 3. Critère de classification revert (explicite, testable — `rpc2.ts` `isRpcRevert`)
Un rejet est un **revert EVM** (déterministe, identique entre fournisseurs honnêtes) ssi c'est un `RpcError` typé (issu de `defaultCall` sur `json.error`, portant `code`+`data`) dont **`code === 3`** (EIP-1474 « execution error », geth/erigon) **ou `code === -32000`** (erreur serveur usuelle des nœuds pour un revert) **ET** dont le message matche `/execution reverted|revert/i`. Tout le reste (HTTP non-ok, timeout, réseau ; JSON-RPC `-32601` method-not-found ; `429` rate-limit) est **transport** ⇒ benché. Clé de concordance d'un revert = `data` si présent et ≠ `"0x"` (sélecteur d'erreur custom / raison), sinon le message normalisé (minuscules, espaces compactés). **Choix documenté** : les formes réelles des 4 fournisseurs keyless sur le `description()` GHO ne sont pas vérifiées live (item formé §8).

## 4. Sémantique du quorum après correctif (`quorum2`)
- deux `ok` de clé égale ⇒ **valeur** ; deux `revert` de clé égale ⇒ **`ConcordantRevertError`** ;
- clés inégales (valeur/revert, ou deux valeurs/reverts différents) ⇒ **`QuorumDisagreementError`** ;
- moins de deux issues (transport benché) ⇒ **`NoQuorumError`** ; un revert **ne benche pas** le fournisseur.
- `book.ts` : `ConcordantRevertError` toléré `""` **uniquement** autour de `description()` ; ailleurs (getAssetPrice, getUserAccountData, getSourceOfAsset, balanceOf, getReserveData, getReservesList, getPriceOracle) toute erreur propage ⇒ abstention. `QuorumDisagreementError`/`NoQuorumError` propagent partout.
- **Forme canonique inchangée** : `oracle_description: ""` sur revert concordant, aucune clé nouvelle ⇒ `book_digest` `034fbff9…` et fixture inchangés (`sentinel2_book_identical_to_pull` vert).

## 5. Oracle à travers `makeUkemiPool` (4 fournisseurs distincts) + mutants
| Cas / mutant | Test | Attendu | Mesuré |
|---|---|---|---|
| (a) revert unanime sur tout `description()` | `ukemi_description_concordant_revert_tolerated_through_pool` | book, `description == ""`, digest = reader vide, `descCalls == 6` | **VERT** (idem) |
| (b) valeur 1 / revert autre | `ukemi_description_disagreement_abstains_book` | `QuorumDisagreementError`, jamais un book | **VERT** |
| (c) revert 1 / transport 3 | `ukemi_description_no_quorum_abstains_book` | `NoQuorumError`, jamais un book | **VERT** |
| (d) revert concordant sur `getAssetPrice` | `ukemi_concordant_revert_on_price_field_abstains_book` | `ConcordantRevertError` propagée, jamais un digest | **VERT** |
| critère | `ukemi_is_rpc_revert_criterion` | 3/-32000+revert ⇒ vrai ; -32601/429/transport ⇒ faux | **VERT** |
| mutant : retrait du rethrow `book.ts` (C2) | — | ROUGE | **ROUGE sur (b)** (revert ne benche plus ⇒ lecture aval réussit ⇒ book à tort). **(c) reste VERT sous ce mutant** : le bench collatéral du read `description` ⇒ `NoQuorumError` aval sur `getAssetPrice`, même type d'erreur ⇒ **(c) ne discrimine pas C2** ; (b) le discrimine |
| mutant : tolérance `ConcordantRevertError` élargie à `getAssetPrice` | — | ROUGE sur (d) | **ROUGE sur (d)** |
| mutant : revert classé transport (benché) | — | ROUGE sur (a) | **ROUGE sur (a)** [+ (b)/(d) collatéraux] |

Restauration bit-exacte post-mutants : `book.ts` = `daa65f98…c61`, `rpc2.ts` = `019786c8…4b2` (= pré-mutants).

## 6. Vérification (worktree ; jamais de jonction `node_modules`)
*Note d'environnement : `C:` saturé (224 Mo libres) ⇒ ENOSPC sur le `npm ci` imbriqué du test `export_public_no_governance_no_french`. `TEMP`/`TMP`/`TMPDIR` redirigés vers `F:\tmp-monark-wt` (724 Go) — contournement non destructif, aucun fichier du dépôt ni `node_modules` touché ; les gates s'exécutent en entier.*

| Commande | Sortie mesurée |
|---|---|
| `npm ci` | 281 packages, exit 0 |
| `npm run ci` (gate:vocab + tsc + test) | `gate:vocab OK — 149 file(s)` · tsc 0 erreur · **tests 305 / pass 305 / fail 0** |
| `node --test apps/sentinel/test/ukemi.test.ts` | **16/16** (liste nominative §5) |
| `npm run lint` | exit 0, 0 sortie |
| `npm run lint:ratchet` | **69/69** |
| `node scripts/lang-gate.mjs --scope root` | OK, 0 hit |
| `npm run export:check` | check OK — 0 forbidden path, 0 non-exempt French |

## 7. R-25 (mesuré `git diff --shortstat 58fe309 <arbre corrigé>`)
- **Gate courante** (`ci.yml:52` sur `dedfcd5` ; exclut S2/G1/G2/lockfile) : **12 fichiers, 1 137 ins, 4 del ⇒ 1 141** < 1 205 (marge 64). Inclut les 6 modules + tests + fixture + additifs vocab/grep + l'amendement `ADR-U1` (+31).
- **D9 sexies** (ajoute l'exclusion des séries sha-pinnées `fixtures/**`) : **11 fichiers, 1 094 ins, 4 del ⇒ 1 098** (écart 43 = la fixture, correctement exclue).
- Départ (dedfcd5) : 1 026 (courante) / 983 (D9 sexies). Delta correctif = +115 (courante) : code V-1 (+84) + amendement ADR (+31).
- `docs/CORRECTIF-V1-lot-u1a.md` et `docs/G1`/`docs/G2` **non comptés** ci-dessus (gouvernance) — voir item formé §8.1.

## 8. Points non résolus = items formés avec déclencheur (zéro dette)
1. **Exclusion R-25 du rapport de correction** — `docs/CORRECTIF-V1-lot-u1a.md` (ce fichier, **74 lignes**) n'est PAS exclu par la gate courante (`ci.yml:52` n'exclut que `docs/G1-lot-*.md`/`docs/G2-lot-*.md`). **Mesuré** : committé à `lot/u-1a`, il porte la gate courante à **1 141 + 74 = 1 215 > 1 205 ⇒ BLOQUÉ**. **Options : (a)** étendre l'exclusion ADR-M003 D9 à `docs/CORRECTIF-*.md` (même motif que G1/G2 : gouvernance, pas du code) ; **(b)** persister le rapport hors branche (comme `CHECKPOINT2-lot-u1a.md` dans `F:\Monark\docs`). Sans (a) ni (b), le correctif code seul (gate courante 1 141) passe. **Déclencheur : décision de commit de l'orchestrateur (seul committeur, R-20).**
2. **Vérification live du critère `isRpcRevert`** — les formes réelles (`code`/`message`/`data`) des 4 fournisseurs keyless sur le `description()` GHO ne sont pas mesurées (aucun run live du code corrigé). **Déclencheur : le durcissement `record.ts` (propriétaire orchestrateur, avant go U-6) — journaliser les formes par fournisseur, confirmer l'appariement à `isRpcRevert`, sinon élargir le critère par ADR.**
3. **G2 fraîche sur le delta `9f3af85 → correctif` (CA-9)** — imposée par le validateur (checkpoint-2 §4) : instance séparée `claude-opus-4-8`, avant G7. **Déclencheur : orchestrateur, après ce livrable.** (Hors périmètre worker : R-20/R-21.)
4. **Items V-3 (registre release-gate CHANTIERS §E)** — déjà formés par le validateur (durcissement `record.ts`, run sUSDe/USDe, book plein deploy→B, U-1c e-mode, PR-U1-1 Perez paginé, retrait exemption `cascade` U-2, test O7 « deux URL même `providerOf` »). **Propriétaire : orchestrateur.** Hors périmètre de ce correctif.

## 9. Livrable (git status attendu : seulement mes fichiers)
Modifiés (tracked) : `apps/sentinel/src/ukemi/{rpc2,book,record}.ts`, `apps/sentinel/test/ukemi.test.ts`, `docs/adr/ADR-U1-recorder-book-liquidation.md`, `docs/G1-lot-u1a.md`, `docs/G2-lot-u1a.md`. Nouveau (untracked) : `docs/CORRECTIF-V1-lot-u1a.md`. Aucun autre fichier, aucun commit, aucun workflow (R-20).
