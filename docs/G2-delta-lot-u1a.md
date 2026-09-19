# Revue G2 FRAÎCHE du delta `9f3af85 → 736179c` — lot U-1a (recorder book Aave v3, ADR-U1)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Préfixe `claude-opus-4-8` conforme (roster 2026-08-14 ; Opus 5 banni).

Relecteur : **instance séparée, contexte frais — je n'ai PAS écrit ce code**. Imposée par le checkpoint-2 (CA-9 : le pliage `9f3af85→dedfcd5` avait été écrit ET vérifié par la même instance ; V-1 y est née). Rendu 2026-09-19. Lecture par SHA (`git show 736179c:<chemin>`, `git diff 9f3af85 736179c`) ; vérification sur copie `git archive 736179c` dans `…\scratchpad\g2-delta-u1a\` puis `npm ci` (jamais de jonction `node_modules`). **Aucune écriture dans un dépôt sauf ce seul fichier** (`F:\Monark\docs\G2-delta-lot-u1a.md`, branche `lot/etude-suite`) ; aucun `git add`/commit/workflow (R-20). Runs `npm`/`node`/mutants confinés au scratchpad ; `F:\Monark` et `F:\Monark-wt-p1b1` non touchés.
Env : Windows, Node v24.15.0, npm 11.12.1. `C:` 5,4 Go libres (n'était plus à 224 Mo) ; `TEMP/TMP/TMPDIR` → `F:/tmp-monark-wt`.

## VERDICT : **APPROUVÉ** (avec observations O1-O7, non bloquantes, items formés avec déclencheur)

Le code est **fonctionnellement correct sur les 11 points**. Le fix V-1 rétablit bien la tolérance du revert concordant *à travers le pool réel* (les 6 mutants ADR-U1 D5 + les 3 mutants V-1 rougissent ; digest inchangé et re-dérivé indépendamment ; miss d'archive `-32000` classé transport). Provenance G1/G2/ADR exacte, R-25 sous borne, fusions additives, aucun registre touché.
Les seuls constats sont **trois mutants adverses survivants (M4, M5, M6)** que j'ai introduits : ce sont des **lacunes de couverture de test sur le code V-1 neuf**, pas des défauts de code (CA-6 satisfait). Classés **O** (précédent projet : la G2 sur `9f3af85` a classé « test manquant pour un comportement correct » en O3/O7 ; la mission item 8 anticipe « si aucun : survivant à consigner »). M6 est le plus tranchant. Aucune escalade-investisseur (aucune décision de valeur, aucun verdict faux).

---

## §1 — Oracle d'exécution ré-exécuté (item 1) — copie `git archive 736179c`

| Commande | Sortie MESURÉE | Attendu | ✓ |
|---|---|---|---|
| `npm ci` | **281 packages**, 0 vuln, exit 0 | — | ✓ |
| `npm run ci` (gate:vocab + tsc + test) | `gate:vocab OK — 149 file(s)` · tsc **0 erreur** · **tests 305 / pass 305 / fail 0** | 305/305 | ✓ |
| `node --test apps/sentinel/test/ukemi.test.ts` | **16 / pass 16 / fail 0** (liste nominative §7) | 16 | ✓ |
| `npm run lint` | exit 0, 0 sortie | 0 | ✓ |
| `npm run lint:ratchet` | **69/69** (plafond inchangé) | 69/69 | ✓ |
| `node scripts/lang-gate.mjs --scope root` | OK, 0 hit français | 0 | ✓ |
| `npm run export:check` | check OK — 0 forbidden path, 0 non-exempt French (scopes root/…/ukemi/…/skills) | OK | ✓ |
| `npm run gate:vocab` | OK — 149 file(s) | OK | ✓ |
| **R-25**, commande **exacte `ci.yml:52` de `lot/etude-suite`** (D9 sexies), `58fe309...736179c` | `11 files, 1094 ins, 4 del` ⇒ **CHANGED = 1098** | 1098 | ✓ |
| R-25, gate telle qu'à `736179c` (sans exclude fixture) — cross-check | `12 files, 1137 ins, 4 del` ⇒ **1141** | 1141 (G1) | ✓ |

Marge R-25 : 1205 − 1098 = **107** (gate etude-suite) / 1205 − 1141 = 64 (gate courante lot). Sous borne dans les deux cas.

**Piège d'environnement consigné (O7)** : mon premier `npm run ci` a rendu **300/305** — 5 échecs `ENOENT mkdtemp '…\g2-delta-u1a\F:tmp-monark-wt\…'` (tests `atelier_no_forbidden_vocab`, `commit_error_not_alpha_is_labelled`, `export_public_no_governance_no_french`, `detector (a) site-honesty`, `export_includes_skills`). Cause : `TEMP=F:\tmp-monark-wt` (backslash) s'effondre en chemin **relatif-au-lecteur `F:tmp-monark-wt`**. Corrigé avec **forward slashes** `F:/tmp-monark-wt` ⇒ `os.tmpdir()=F:\tmp-monark-wt` valide ⇒ **305/305**. Aucun de ces 5 tests n'est un test Ukemi ; aucun lien avec le code sous revue. À signaler au prochain relecteur (le correctif worker a utilisé la même redirection).

## §2 — Diff `9f3af85 736179c` par fichier (item 2) : dans le périmètre

`git diff --name-status 9f3af85 736179c` = **8 fichiers** : `book.ts` (M, C2+V-1), `record.ts` (M, V-1), `rpc2.ts` (M, V-1), `PROVENANCE-weth-book.md` (A, C1), `ukemi.test.ts` (M, C2+V-1), `G1-lot-u1a.md` (M, V-2/C3), `G2-lot-u1a.md` (A, pliage), `ADR-U1…md` (M, amendement V-1). **`vocab-banned.json` et `grep-forbidden.mjs` NE sont PAS dans le delta** (introduits en `1e7bb7e`, inchangés). Chaque ligne du diff code s'explique par C1/C2/C3/V-1/V-2 ; **aucun changement hors périmètre**.

## §3 — Sémantique du quorum `rpc2.ts` `quorum2` (item 3) — MESURÉ via `makeUkemiPool.ethCall`

| Cas | Résultat MESURÉ | Attendu | ✓ |
|---|---|---|---|
| ok/ok concordant | `OK(valeur)` | valeur | ✓ |
| ok/ok discordant | `QuorumDisagreementError` | QDE | ✓ |
| ok/revert | `QuorumDisagreementError` | QDE | ✓ |
| revert/revert concordant | `ConcordantRevertError` | CRE | ✓ |
| revert/revert discordant (msg ≠) | `QuorumDisagreementError` | QDE (abstention, sens sûr) | ✓ |
| revert/transport | `NoQuorumError` (`last: HTTP 429`) | NQE | ✓ |
| transport/transport | `NoQuorumError` (`last: HTTP 503`) | NQE | ✓ |
| un seul fournisseur (succès) | `NoQuorumError` | NQE (jamais un quorum d'un seul) | ✓ |
| revert même `data`, msg ≠ | `ConcordantRevertError` (clé = `data`) | CRE | ✓ |
| revert `data` ≠ | `QuorumDisagreementError` | QDE | ✓ |

Ordre `seen`/bench correct : un **revert compte pour `seen`** (`seen.add(providerOf(url))` dans la branche revert) ⇒ pas de second appel au même `providerOf` ; un revert **ne benche PAS** (pas de `cooldownUntil` — prouvé : read1 revert concordant puis read2 valeur ⇒ `OK`, les fournisseurs restent vivants) ; un transport benche (`cooldownUntil = +25 s`) et n'ajoute pas à `seen`. `lastErr` (dernier transport) présent dans le message `NoQuorumError`. `live()` avec tous benchés ⇒ repli sur la liste complète (`rpc2.ts:104`, lu). **Conforme.**

## §4 — `isRpcRevert` (item 4) — MESURÉ (appel direct)

Critère : `RpcError` typé ∧ (`code === 3` EIP-1474 | `code === -32000`) ∧ `/execution reverted|revert/i.test(message)`.

| Cas | `isRpcRevert` | Attendu | ✓ |
|---|---|---|---|
| code 3 « execution reverted » | **true** | revert | ✓ |
| -32000 « execution reverted: out of gas » | **true** | revert | ✓ |
| **-32000 « header not found » (miss archive)** | **false** | **TRANSPORT** | ✓ |
| **-32000 « missing trie node … » (miss archive)** | **false** | **TRANSPORT** | ✓ |
| code 3 « invalid opcode … » (sans « revert ») | **false** | benché (sens sûr) | ✓ |
| -32601 « method not found » | **false** | benché | ✓ |
| 429 « rate limited » | **false** | benché | ✓ |
| `Error` nu « HTTP 503 » | **false** | transport | ✓ |
| `RpcError` `data="0x"` code 3 revert | **true** (clé = message) | revert | ✓ |

Le point critique de l'item 4 (miss d'archive `-32000` ⇒ TRANSPORT, jamais revert) est **correctement traité par le code**. `revertKey` : `data` si présent et ≠ `"0x"`, sinon message normalisé (minuscules, espaces compactés) ⇒ deux fournisseurs « execution reverted » vs « execution reverted: … » ⇒ clés ≠ ⇒ **discordance ⇒ abstention** (confirmé, sens sûr). **Conforme.**

## §5 — `book.ts` : tolérance bornée + forme canonique (item 5) — MESURÉ

Le `try/catch` n'entoure **que** `description()` ; `catch (e) { if (!(e instanceof ConcordantRevertError)) throw e; description = ""; }`. **Toute autre lecture** (`getPriceOracle`, `blockAt`, `getReservesList`, `getReserveData`, `getSourceOfAsset`, `getAssetPrice`, `getUserConfiguration`, `balanceOf`, `getUserAccountData`, `getUserEMode`) est **hors `try`** ⇒ toute erreur (dont `ConcordantRevertError`) **propage ⇒ abstention**. **Conforme.** Forme canonique **inchangée** : `oracle_description: ""` sur revert concordant, **aucune clé nouvelle** (top-keys mesurés = `accounts, block, block_hash, chain_id, cluster, eligible_aggregate, enumeration, excluded, oracle, pool, reserves, schema` — 12 ; 3 réserves, 2 comptes).

**Recompute indépendant du digest** (canonicaliseur Python, pas `canonicalStringify`) : book produit par le reader fixture, dump en **ordre d'insertion** (non trié), puis `json.dumps(sort_keys=True, separators=(',',':'), ensure_ascii=False)` + sha256 :
`034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921` = **PIN test = digest du code**. **MATCH.** (PIN `034fbff9…` inchangé par le delta.)

## §6 — `record.ts` `defaultCall` (item 6) — lu + MESURÉ (via §3/§4)

`json.error` ⇒ `new RpcError(message, code ?? 0, data si string sinon undefined)` ✓ ; `!res.ok` ⇒ `Error("HTTP …")` (transport) ✓ ; timeout (AbortController 30 s) ⇒ `Error` (transport) ✓ ; corps porte `id:1`, `jsonrpc:"2.0"` ✓ ; **`json.error.code` absent ⇒ `code ?? 0 = 0` ⇒ `isRpcRevert` faux ⇒ transport (benché)** ✓ (sens sûr). **Conforme.**

## §7 — Tests à travers `makeUkemiPool` (item 7) — lu + MESURÉ

Les cas (a)(b)(c)(d) passent **par `makeUkemiPool`** avec **4 `providerOf` distincts** (`POOL_EPS = a/b/c/d.example`, `poolOver()` construit un vrai pool), **pas** par un reader mocké. Le `call` injecté (`poolCall(tamper)`) **imite exactement la forme d'erreur de `defaultCall`** : `RpcError("execution reverted", 3)` (instance, code, message) pour un revert EVM ; `Error("HTTP 429…")` pour un transport. Liste **fixe et nominative** (16 tests) :
`ukemi_description_concordant_revert_tolerated_through_pool`, `ukemi_description_disagreement_abstains_book`, `ukemi_description_no_quorum_abstains_book`, `ukemi_concordant_revert_on_price_field_abstains_book`, `ukemi_is_rpc_revert_criterion`, `sentinel2_book_identical_to_pull`, `ukemi_mutant_block_shift`, `ukemi_mutant_oracle_source`, `ukemi_mutant_account_and_transfer_omitted`, `ukemi_mutant_balance_zeroed`, `ukemi_mutant_hash_chain`, `ukemi_hf_invariant_findings_recorded`, `ukemi_wadray_matches_aave_formula`, `ukemi_quorum_two_fail_closed`, `ukemi_no_latest_literal`, `ukemi_vocab_sentinel_scope_bans_adr_motifs`. **Conforme.** Cas (a) : `descCalls == 6` (3 réserves × 2 ; un revert ne benche pas, le quorum s'arrête à 2) — vérifié.

## §8 — Mutants (item 8) — REJOUÉS moi-même : copie unique + backups pristine + restauration `cp` vérifiée sha (équivaut à des copies séparées)

Méthode : une copie `git archive`, sauvegardes pristine de `book.ts`/`rpc2.ts`, mutation par remplacement de chaîne unique (ancre asserée = 1), `node --test ukemi.test.ts`, restauration `cp` + **sha256 LF vérifié après CHAQUE mutant** (`book daa65f98…`, `rpc2 019786c8…`).

| # | Mutation | Attendu | MESURÉ | Restauration sha |
|---|---|---|---|---|
| M1 | retrait du rethrow `book.ts` (catch large) | (b) rouge | **(b) `…disagreement_abstains_book` ROUGE** (15/16) ; **(c) reste VERT** ⇒ (c) ne discrimine PAS M1 (confirme le worker) ; (b) le discrimine | book/rpc2 ✓ |
| M2 | tolérance `ConcordantRevertError` élargie à `getAssetPrice` | (d) rouge | **(d) `…on_price_field_abstains_book` ROUGE** (15/16) | book/rpc2 ✓ |
| M3 | revert classé transport (`isRpcRevert ⇒ false`) | (a) rouge | **(a) ROUGE + (b)+(d)+`ukemi_is_rpc_revert_criterion` ROUGE** (12/16) | book/rpc2 ✓ |
| M4 | un revert **benche** le fournisseur (cooldown) | quel test ? | **SURVIVANT (16/16)** — correction préservée (repli `live()`), régression débit/politesse seule | book/rpc2 ✓ |
| M5 | `revertKey` **ignore `data`** | quel test ? | **SURVIVANT (16/16)** — branche `data` non couverte | book/rpc2 ✓ |
| M6 | `isRpcRevert` accepte tout `RpcError` code 3/-32000 **sans le test de message** | quel test ? | **SURVIVANT (16/16)** — clause message non couverte | book/rpc2 ✓ |

**Tests tueurs proposés — PROUVÉS tuants** (rejeu de la sonde `probe-quorum.mjs` sous chaque mutant, restauré sha) :
- **M4** : pool 3 fournisseurs, read1 revert concordant sur 2 puis read2 valeur ⇒ pristine `OK`, **M4 `NoQuorumError`** (le bench affame le quorum, repli insuffisant à 3 fournisseurs).
- **M5** : deux fournisseurs même `data`/msg ≠ ⇒ pristine `ConcordantRevertError`, **M5 `QuorumDisagreementError`** ; `data` ≠ ⇒ pristine `QuorumDisagreementError`, **M5 `ConcordantRevertError`** (les deux basculent).
- **M6** : `isRpcRevert(new RpcError("header not found", -32000))` ⇒ pristine `false`, **M6 `true`** ; idem « missing trie node ».

Les 6 mutants ADR-U1 D5 (bloc±1, source, Transfer omis, balance nulle, chaîne, vocab) + keccak/percentMul restent rouges (G1 §2, re-mesuré vert-en-tant-que-tests via `npm run ci` 305/305). Les mutants D5-mandatés et les 3 mutants V-1 (M1-M3) rougissent tous.

## §9 — Docs (item 9) — MESURÉ

**sha256 (LF, `tr -d '\r' | sha256sum`) + lignes (`awk END{NR}`) @736179c = G1 §1, 11/11** :
`abi.ts 168/9edc596b`, `wadray.ts 55/7bee76fc`, `clusters.ts 52/d247703b`, `rpc2.ts 198/019786c8…b74b2`, `book.ts 199/daa65f98…e581c61`, `record.ts 75/a4b158a5…6c7bc3725`, `ukemi.test.ts 255/84ebf136…1d4be238`, `weth-book.fixture.json 43/f98827f9`, `PROVENANCE-weth-book.md 47/732842dc`, `vocab-banned.json 124/c9c1acb8`, `grep-forbidden.mjs 251/64577097`. **Tous ✓.**
**`ukemi_sha`** (recette `record.ts` `ukemiSha` : nom+`\0`+octets, `.ts` triés) sur `ukemi/` = `c94bd79ba17348a6999e6fbdc9ab28785e7fecb59e8f7d25e2d127c17ad1ef00` = **G1** ✓.
Compteurs : **16 tests, 305, R-25 1098/1141** = G1 ✓.
§5b/§7-3 **honnêtes** : « comportement `description()` corrigé (V-1) **PROUVÉ OFFLINE, PAS « validé LIVE »** » ; run live `d35df289…` **irreproductible** (wrapper non committé + code pré-C2). G2 **annotée** (ligne mutants « `description()` reverté unanime → toléré » = vrai pré-C2 / INVALIDÉ par C2 / RÉTABLI par V-1). **Amendement ADR-U1 cohérent avec le code** : concordant⇒CRE toléré description() seule (tests a,d), discordant⇒QDE⇒abstention (b), <2⇒NQE (c), critère isRpcRevert (criterion) — la plupart des phrases D3 ont un test ; **lacunes = M4 (« un revert ne benche PAS »), M5 (clé `data`), M6 (clause message)**. Vocabulaire : gate:vocab OK 149 ; test `ukemi_vocab…` : 0 motif dans les sources ukemi ; motifs dans les docs G1/G2/ADR **uniquement** comme documentation du gate / gouvernance de l'exemption `cascade` (hors scope gate, pas une revendication sur la surface recorder) — acceptable.

## §10 — Fusion (item 10) — `git merge-tree --write-tree`, git 2.55

- **`lot/etude-suite` × `lot/u-1a`** : **1 CONFLIT**, `docs/adr/ADR-U1-recorder-book-liquidation.md`. **NOUVEAU depuis le checkpoint-2** (`merge-tree` était **propre** à `dedfcd5`). Cause : deux éditions ultérieures sur la **queue de l'ADR** (merge-base = `58fe309`, base = 104 lignes) — `etude-suite` **modifie la ligne 104** (puce Q3 : « D9 quinquies » → « D9 sexies (règle générale ; D9 quinquies = exception ponctuelle PR #56) ») ; `u-1a` **ajoute 31 lignes après** la ligne 104 (le bloc « ## Amendement 2026-09-19 (checkpoint-2 V-1) »). **Additif, hunks sémantiquement disjoints** (formulation d'une puce vs nouvelle section datée). **Résolution exacte** : garder la ligne 104 de `etude-suite` (« D9 sexies … »), PUIS ajouter le bloc « ## Amendement 2026-09-19 … » de `u-1a`. Cohérent avec la terminologie « D9 sexies » du G1 ; le bloc amendement ne référence **que D1/D3** (aucun D9) ⇒ aucune contradiction.
- **`lot/u-1a` × `lot/t-1a`** : **1 CONFLIT**, `vocab-banned.json` ; `scripts/grep-forbidden.mjs` **auto-fusionné propre** (aucun CONFLICT). **Additif** : `u-1a` étend `scan.sentinel` (+4 motifs D8 + `$comment_exempt` + `exemptPhrases`), `t-1a` ajoute un **nouveau scope `scan.bell`** (7 motifs) ; `banned` global **intact des deux côtés**. **Résolution** : garder les deux ⇒ **JSON valide vérifié** (9 scopes : `sentinel` 6 motifs + exempt, `bell` 7 motifs). Ordre de fusion **U-1a puis T-1a**.

## §11 — CA-11 branchement (item 11) — MESURÉ

`git diff --stat 58fe309 736179c -- README.md apps/site skills deploy apps/harness apps/sentinel/src/run.ts '*fleet.ts'` = **vide** : **aucun registre touché** (`fleet.ts` = `apps/site/lib/fleet.ts`, inchangé ; README/site/skills/deploy/harness/run.ts inchangés). Le recorder Ukemi reste **`upcoming`** ; aucune revendication « built » pour lui. **Conforme.**

---

## Observations (O-n) — non bloquantes, items formés avec déclencheur

- **O1 (le plus tranchant — M6, `error_origin = générateur`)** : `rpc2.ts` `isRpcRevert` — le critère annoncé « explicite, testable » (amendement ADR-U1 D3) n'est **testé qu'à moitié**. `ukemi_is_rpc_revert_criterion` couvre les mauvais **codes** (-32601, 429) mais **aucun cas code 3 / -32000 avec message NON-revert** ; or c'est cette clause message qui **sépare un revert d'un miss d'archive** (`-32000 « header not found »/« missing trie node »`). M6 (retrait de la clause message) **survit 16/16**. Le code est correct ; la clause est **non gardée**. **Correction (tueuse prouvée)** : ajouter à `ukemi_is_rpc_revert_criterion` `assert.ok(!isRpcRevert(new RpcError("header not found", -32000)))` et `…("missing trie node 0x… (path …)", -32000)` (idéalement + un code 3 sans « revert »). **Déclencheur** : plier dans la G2 du durcissement `record.ts` (qui re-teste les formes live des fournisseurs) — avant go U-6.
- **O2 (M4, `error_origin = générateur`)** : l'invariant D3 « **un revert ne benche PAS** » n'est pas gardé. M4 (benching sur revert) **survit 16/16** — la correction est préservée (repli `live()` sur liste complète) ; seule la politesse/latence live régresse (un fournisseur qui reverte sur `description()` serait inutilement mis au frais 25 s). **Correction (tueuse prouvée)** : test à **≥3 fournisseurs**, read1 revert concordant sur 2, read2 valeur ⇒ doit rendre la valeur (M4 ⇒ `NoQuorumError`). **Déclencheur** : durcissement `record.ts`.
- **O3 (M5, `error_origin = générateur`)** : la clé de concordance par `data` (sélecteur d'erreur custom) est non couverte. M5 (ignore `data`) **survit 16/16**. **Correction (tueuse prouvée)** : deux fournisseurs même `data`/message ≠ ⇒ `ConcordantRevertError` ; `data` ≠ ⇒ `QuorumDisagreementError`. **Déclencheur** : durcissement `record.ts` / apparition de reverts à erreur custom.
- **O4 (robustesse message-key, sens sûr — déjà formé)** : `data` absent ⇒ `revertKey` = message ; deux fournisseurs honnêtes avec chaînes de revert légèrement différentes (« execution reverted » vs « execution reverted: reason ») ⇒ discordance ⇒ **abstention du book**. Sûr (jamais un digest faux) mais considération de robustesse live. **Déjà formé** (G1 §7-3 item 4 / correctif §8.2 : journaliser `code`/`message`/`data` réels par fournisseur au durcissement `record.ts`, élargir le critère par ADR sinon). Confirmé.
- **O5 (résidu V-2, `error_origin = générateur/orchestrateur`)** : `docs/G1-lot-u1a.md` ligne 123 (section finale « ## G2 fraîche », **gel `9f3af85`**) se termine encore par « R-25 : 957 (gate courante) / 914 (D9 sexies) » — cible V-2 **nommée par le validateur** (« ligne R-25 de la section G2 pliée ») **restée intacte**. Le chiffre est **historiquement correct** pour le gel `9f3af85` (= la G2 elle-même). **Annoter** (« = gel 9f3af85 ; lot corrigé = 1141 / 1098 »), ne pas remplacer. **Déclencheur** : prochaine touche G1 (ex. le commit du durcissement).
- **O6 (nom du livrable vs glob R-25)** : `docs/G2-delta-lot-u1a.md` **ne matche pas** `':(exclude)docs/G2-lot-*.md'` ⇒ compterait dans R-25 s'il était committé sur `lot/u-1a`. Il est écrit sur **`lot/etude-suite`** (précédent option (b), `4467728`) ⇒ n'affecte pas le 1098 de `u-1a`. **Item orchestrateur** (même classe que `docs/CORRECTIF-*.md`) : étendre l'exclusion à `docs/G2-*lot-*.md` OU garder l'option (b).
- **O7 (piège d'environnement)** : `TEMP` avec backslashes ⇒ 5 faux échecs `ENOENT mkdtemp` (§1). Utiliser des forward slashes. Pour le prochain relecteur.

## Note sur le fix V-1 (la régression du checkpoint-2)

Le défaut V-1 (revert concordant inatteignable à travers `makeUkemiPool` ⇒ book entier abstenu, `error_origin = orchestrateur`) est **corrigé** : `defaultCall` lève un `RpcError` typé ; `quorum2` traite le revert comme une **issue** (`ok`/`revert`, un revert ne benche pas) ; `ConcordantRevertError` toléré `""` **pour `description()` seule** dans `book.ts`. Prouvé **à travers le pool réel** (§3/§7 + mutants §8), digest inchangé (§5), miss d'archive correctement classé transport (§4). La correction est réelle et bien ciblée ; les O1-O3 durcissent l'**oracle** autour d'elle, pas le code.

<!-- G2 fraîche du delta (doc 02, revue 3 étapes). Instance séparée, contexte frais, claude-opus-4-8[1m], effort max. Vérif adversariale R-21 chez l'orchestrateur. Aucun commit (R-20). -->
