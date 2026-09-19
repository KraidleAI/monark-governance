# CHECKPOINT-2 (LIVRABLE) — lot U-1a, gel `dedfcd5` (base `58fe309`)
Rapport du validateur-humain (instance séparée, contexte frais), reçu et persisté par l'orchestrateur le 2026-09-19. Texte du validateur ci-dessous, sans modification (entités HTML décodées).

**Modèle résolu (R-1)** : `claude-fable-5-1` (Fable 5.1), effort `high`. Instance séparée, contexte frais : je n'ai lu aucun fil de travail — uniquement les artefacts par SHA (`git show dedfcd5:<chemin>`) et les copies `git archive` dans mon scratchpad `C:\Users\KACIMI\AppData\Local\Temp\claude\F--Monark\0b28054b-ca58-4cf1-820c-991d31d99595\scratchpad\cp2-u1a\`.

## 0. Preuve AM-2 bis (aucune écriture dans un dépôt)
- `F:\Monark` : HEAD `16767cd` au départ → `fea08d2` à la fin (**deux commits de l'orchestrateur pendant ma session**, `8dd9c67` et `fea08d2`, docs seuls : CHANTIERS/INVENTAIRE/BASCULEMENT) ; `git status --short` = 0 ligne avant et après.
- `F:\Monark-wt-p1b1` : HEAD `dedfcd5`, status 0 ligne. `F:\Monark-wt-bell` : HEAD `a3f5393`, status 0 ligne.
- Les 11 fichiers du lot dans `F:\Monark-wt-p1b1` = octet-identiques (sha256 LF) à `git show dedfcd5:` : `abi.ts 9edc596b…`, `book.ts 948b311a…`, `clusters.ts d247703b…`, `record.ts 1fcc84ac…`, `rpc2.ts 8e8920a2…`, `wadray.ts 7bee76fc…`, `ukemi.test.ts 71b2307c…`, `weth-book.fixture.json f98827f9…`, `PROVENANCE-weth-book.md 732842dc…`, `vocab-banned.json c9c1acb8…`, `grep-forbidden.mjs 64577097…`.
- Aucun `git` modifiant, aucune jonction `node_modules` ; `npm ci` fait dans deux copies scratchpad (`tree` = `dedfcd5`, `merged` = `d43fba22`).

## 1. Commandes exécutées et sorties chiffrées (copie `git archive dedfcd5`, Node v24.15.0, npm 11.12.1)
| Commande | Sortie mesurée |
|---|---|
| `npm ci` | 281 packages, exit 0 |
| `npm run ci` (gate:vocab + tsc + test) | `gate:vocab OK — 149 file(s)` · tsc 0 erreur · **tests 301 / pass 301 / fail 0** |
| `node --test apps/sentinel/test/ukemi.test.ts` | **12/12** (liste nominative vérifiée) |
| `npm run lint` | 0 sortie, exit 0 |
| `npm run lint:ratchet` | **69/69** |
| `node scripts/lang-gate.mjs --scope root` | OK, 0 hit |
| `npm run export:check` | check OK — 0 forbidden path, 0 non-exempt French |
| R-25, commande exacte `ci.yml:52` (D9 sexies, arbre `16767cd`) sur `58fe309...dedfcd5` | `10 files, 979 ins, 4 del` ⇒ **CHANGED = 983** < 1205 |
| R-25, commande de la gate telle qu'elle est sur `dedfcd5` (sans excludes sexies) | `11 files, 1022 ins, 4 del` ⇒ **1026** < 1205 |
| `git diff --shortstat 58fe309...dedfcd5` brut | 13 files, 1159 ins, 4 del |

Les chiffres annoncés « 957 / 914 » sont ceux du gel `9f3af85` (avant pliage C1-C3), pas du gel `dedfcd5` (V-2).

**Recomputes indépendants (item 3)** — sonde `probe-digest.mjs` (dump du book en ordre de clés **inversé**, puis canonicaliseur Python `json.dumps(sort_keys=True, separators=(',',':'), ensure_ascii=False)` ; `jq` absent de la machine) :
- `book_digest` Python = **`034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921`** = code = PIN test.
- `holders_digest` par la recette PROVENANCE §3 en Python pur (topics[2] → 20 octets, minuscules, `0x0…0` retiré, tri octets, `join("\n")` sans LF final) sur 4 adresses (`0x52d2996c…`, `0x552c4ad0…`, `0x7b9f97e4…`, `0xe0c20053…`) = **`529bf2b8ba33201d1735193729ddbccac5e0ac20032073e77a03767de31bf110`** ✓.
- `line_hash` Python (11 champs, ordre `lineHashedFields`) = **`eead4f5357a07d3d3c026c4fe1e2ac7c48a35a2485f6777ccdef4251ceb73e15`** ✓.
- HF findings rejoués : `0x552c4ad0…` delta **+274302** (`1053019895079129408 − 1053019895078855106`), `0xe0c20053…` **−458155** ✓.
- `ukemi_sha` (recette `record.ts` : nom+`\0`+octets, trié) sur l'arbre `dedfcd5` = **`c9cb9380e491f3d855d5a78de1105560ee8d38f111f41c3d8c3323a22a9213a1`** ; sur `9f3af85` = `8aae7bbe…` (celui du G1). Le G1 porte donc le sha d'avant pliage.

**Mutants rejoués (item 2)** — copies séparées `m-c2`, `m-rho`, `m-pmul`, `m-vocab`, `merged` :
| Mutant | Résultat MESURÉ |
|---|---|
| C2 : ligne `if (e instanceof QuorumDisagreementError \|\| e instanceof NoQuorumError) throw e;` retirée (`book.ts:92`) | **ROUGE** `ukemi_description_disagreement_abstains_book` (11/12) |
| keccak `RHO[1]` 1→2 (`abi.ts:11`) | **ROUGE au chargement** : `ukemi/abi: keccak self-test failed (empty vector)` (0/1) |
| `percentMul` demi-bas (`wadray.ts:22`, `+HALF`→`−HALF`) | **ROUGE** `ukemi_hf_invariant_findings_recorded` : actual `-429035` ≠ expected `274302` |
| `cascade` inséré en commentaire `book.ts:1` | **ROUGE** `gate:vocab FAILED — 1 forbidden claim` (`book.ts:1`, why ADR-U1 D8) **ET** test 11 `ukemi/book.ts carries no banned motif` |
| fixture +1 octet (`block_ts` 1760072195→…96) sur l'arbre fusionné `git merge-tree lot/etude-suite lot/u-1a` = `d43fba22` | baseline **VERT** ; muté **ROUGE** `series_pinned_are_declared_and_hashed` (sha LF `6b8bc123…` ≠ déclaré) |
| quorum divergent (sonde `probe-disagree.mjs`, pool réel `makeUkemiPool`, 1 octet altéré chez le 2ᵉ fournisseur) sur `getAssetPrice`, `getUserAccountData`, `balanceOf`, `getSourceOfAsset`, `description`, et 1 log manquant sur `eth_getLogs` | **6/6 `QuorumDisagreementError`, aucun digest** ; baseline concordant ⇒ `034fbff9…` |

## 2. Checklist CA-1..CA-11 + AM-1
- **CA-1** (critères falsifiables) : conforme — oracle `sentinel2_book_identical_to_pull` + 6 mutants nommés D5, chacun rejoué ci-dessus.
- **CA-2** (décision de valeur) : conforme — Q1/Q2/Q3 tranchées par l'investisseur (décisions 15-17) ; aucune décision nouvelle prise par le lot. La tolérance `description = ""` sur revert unanime est un choix **structurant du digest** documenté seulement au G1 §7-3 (voir CA-3).
- **CA-3** (ADR de rattachement) : **correction** — ADR-U1 D1 dit « `getSourceOfAsset`+`description()` » sans prévoir la valeur `""` sur revert ; D3 ne définit pas la sémantique d'un revert au quorum. Le pliage C2 a changé le comportement live (V-1) sans amendement daté.
- **CA-4** (fan-out) : conforme — U-1 ∥ U-3 justifié par isolation (ADR-M020 D4) ; un seul worker d'implémentation.
- **CA-5** (MAST) : conforme — tableaux MAST dans ADR-U1 et ADR-M020 ; mode « fixture auto-enregistrée » couvert par le recompute indépendant ci-dessus.
- **CA-6** (tests passés ≠ correction fonctionnelle) : **correction bloquante V-1** — le chemin « `description()` reverté unanime ⇒ `""` » est **inatteignable à travers le pool réel** (preuve §3), donc le test vert (cas a) ne prouve pas ce qu'il affirme, et la revendication G1 « validé LIVE (GHO) » est fausse pour le code gelé.
- **CA-7** (zéro dette) : **correction V-3** — items formés avec déclencheur au G1 §7, mais absents du registre release-gate CHANTIERS §E (décision 19).
- **CA-8** (provenance) : **correction V-2** — G1 §1/§2/§4 périmés post-pliage (sha, `ukemi_sha`, compteurs, R-25). `error_origin` renseigné pour C1-C3 (générateur) ✓ ; modèle épinglé résolu ✓ ; mais le **pliage `9f3af85→dedfcd5` a été écrit ET vérifié par la même instance** (orchestrateur, « sans relance d'agent ») : générateur = relecteur sur ce delta.
- **CA-9** (vérification imposée par le système) : conforme pour le lot à `9f3af85` (G2 fraîche Opus 4.8) ; **non conforme pour le delta de pliage** (aucune instance séparée ne l'a revu) — c'est précisément là que V-1 est née.
- **CA-10** (anti-vitesse) : conforme — aucun argument de vitesse ; lot < 1205.
- **CA-11** (branchement) : conforme — consommateurs de `ukemi/book.ts` sur l'arbre gelé = `ukemi.test.ts` et `record.ts` (CLI off-tool, non importé) ; **aucun registre touché** (`git diff 58fe309 dedfcd5 -- README.md apps/site skills deploy apps/harness` = vide) ; `fleet.ts:131-142` Ukemi = `built` par décision investisseur ADR-M020 D5 avec `served_by: "MCP cascade → gate …"` et rien ne nomme le recorder ; le tuyau (c) reste déclaré servi seulement en U-6. Le recorder est bien `upcoming` de fait ; aucune revendication « built » pour lui.
- **Item 4 (D3)** : conforme — plus aucun chemin où un désaccord produit un digest (6/6 sondes + test 9 + mutant C2).
- **Item 5/6 (exemption vocab)** : conforme et bornée — mécanisme `exemptPhrases` = masquage de chaîne exacte, équi-longueur, scope-local (`grep-forbidden.mjs:32-57,200`) ; **une seule** occurrence de `\bcascade\b` dans tout le scope sentinel (dirs `apps/sentinel/src`, `apps/sentinel/test` + 5 fichiers deploy) : `deploy/monark-harness.service:15` `(attest, gate, cascade, calibrate)` ; un `cascade` nu ailleurs rougit (mutant rejoué). Déclencheur de retrait = U-2 (écrit dans `$comment_exempt`).
- **Item 8 (fusions)** : `merge-tree lot/etude-suite lot/u-1a` = **propre** (`d43fba22`), série test verte dessus. `merge-tree lot/t-1a lot/u-1a` = **1 seul conflit, `vocab-banned.json`**, `grep-forbidden.mjs` auto-fusionné (vérifié par `git merge-file` 3 blobs, exit 0, `node --check` OK ; t-1a ajoute un bloc `bell` indépendant). Conflit vocab **qualifié additif** : t-1a n'ajoute que le scope `scan.bell` (7 motifs) et ne touche ni `banned` global ni `scan.sentinel` ; u-1a n'ajoute que 4 motifs + `exemptPhrases` dans `scan.sentinel`. Résolution = garder les deux hunks ; validée en JSON (`resolved.json` : sentinel 6 motifs + exempt, bell 7 motifs). Ordre de fusion U-1a puis T-1a.

## 3. Preuve de V-1 (le point qui bloque)
Sonde `probe-desc-revert.mjs` : `recordBook(CLUSTER_WETH, 23545087, makeUkemiPool({4 fournisseurs distincts}))` avec un `call` qui sert la fixture partout et **rejette `execution reverted` sur tout `description()` (unanime, exactement ce que `defaultCall` remonte, `record.ts:24`)** :
```
RESULT: recordBook THREW NoQuorumError - eth_call: quorum needs 2 providers (last: execution reverted) | calls {"n":14,"desc":4}
```
Chaîne causale sur pièces : `rpc2.ts` `quorum2` attrape **tout** rejet du fournisseur, le benche 25 s, et lève `NoQuorumError` si < 2 succès (`rpc2.ts:76-84`) ; `book.ts:92` (C2) rethrow `NoQuorumError` ⇒ **le book entier abstient**. Le cas « revert unanime toléré comme `""` » n'existe plus que pour un `Error` nu — que le pool ne produit jamais. Conséquences : (a) G1 §5b « a traversé des emprunteurs GHO sans `description()` » et §7-3 « LIVRÉ … validé LIVE » sont vrais du code pré-C2 (`1e7bb7e`), **faux pour `dedfcd5`** : un book WETH live contenant un emprunteur GHO abstient désormais ; (b) `d35df289…` est irreproductible avec le code gelé pour cette raison en plus du wrapper non committé ; (c) le test `ukemi_description_disagreement_abstains_book` cas (a) est vert-à-vide.

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée ; V-1 bloque fusion et G7)
- **V-1 (bloquante)** — `apps/sentinel/src/ukemi/rpc2.ts:60-84` (`quorum2`) + `book.ts:86-93`. Preuve : sonde §3. Correction attendue (à faire par un worker, pas par moi) : rendre un **revert concordant** (≥ 2 fournisseurs distincts renvoyant le même revert) distinguable d'un no-quorum jusqu'à `book.ts`, ou retirer la tolérance et le déclarer ; **oracle réécrit à travers `makeUkemiPool`** (ma sonde est le gabarit : revert unanime ⇒ book avec `""`, revert sur 1 fournisseur/valeur sur l'autre ⇒ abstention) ; **amendement daté ADR-U1** (D1 : `oracle_description = ""` sur revert unanime est un champ du digest ; D3 : sémantique du revert au quorum) ; G1 §5b/§7-3 réécrits en conséquence ; `error_origin = orchestrateur` (pliage C2 non revu). **Et** (CA-9) une **G2 fraîche sur le delta `9f3af85 → correctif`** (pliage + fix), instance séparée `claude-opus-4-8`, avant G7.
- **V-2** — `docs/G1-lot-u1a.md` §1, §2, §4 + ligne R-25 de la section G2 pliée : `book.ts` `008d3933…`→`948b311a753c35e2b670bd9bdbadb76b36a081c5cc50e8f63f9bb7955afa22ee` (200 l.), `ukemi.test.ts` `16940c87…`→`71b2307c0c01f92d1b5181a41c38ce9a0087c492576751628d73fb06d79b9dfd` (205 l.), `PROVENANCE-weth-book.md` `732842dc1835988b43cf31496690996895f412f496e01c3b73cf63c5852ffc05` (47 l.) à ajouter, `ukemi_sha` → `c9cb9380e491f3d855d5a78de1105560ee8d38f111f41c3d8c3323a22a9213a1`, « 11 tests »→12, « 300 »→301, R-25 → **1026 (gate courante sur `dedfcd5`) / 983 (gate D9 sexies)**. `docs/G2-lot-u1a.md` : ligne mutants « `description()` reverté unanime → toléré » à annoter comme invalidée par le pliage C2 (V-1).
- **V-3** — `docs/CHANTIERS.md` §E (release gate, décision 19) : aucun item U-1a n'y figure. Enregistrer avec propriétaire + déclencheur : durcissement `record.ts` (retry 429/5xx, split 400, wrapper committé ; orchestrateur ; avant go U-6) ; run sUSDe/USDe (avant go U-6) ; book plein deploy→B (après durcissement) ; U-1c e-mode (après U-3) ; PR-U1-1 Perez paginé (U-7) ; retrait de l'exemption `cascade` (U-2) ; test O7 « deux URL même `providerOf` » (U-6).

Pas d'ESCALADE-INVESTISSEUR : aucune décision de valeur nouvelle, aucune dérogation demandée, G7 non rendu (pas de divergence). Pas de REFUS : D3 est honoré dans le sens sûr (abstention, jamais un digest faux), oracle offline bit-identique par canonicaliseur indépendant, 5 mutants + 6 sondes de désaccord rouges, registres intacts.

## 5. Ligne AM-1
Attrapé : une régression fonctionnelle du chemin live (revert unanime ⇒ abstention) introduite par un pliage G2 fait et vérifié par la même instance sans relecture fraîche ; provenance G1 périmée post-pliage ; items décision 19 hors registre. Manqué : à me signaler a posteriori par l'orchestrateur.

Artefacts de preuve rejouables (scratchpad) : `cp2-u1a/probe-digest.mjs`, `probe-desc-revert.mjs`, `probe-disagree.mjs`, `vocab/resolved.json`, `gf/merged.mjs`, copies `m-c2/`, `m-rho/`, `m-pmul/`, `m-vocab/`, `merged/`.

---
## Suite donnée par l'orchestrateur (2026-09-19)
- V-1 : vérification adversariale sur pièces (`rpc2.ts`, `book.ts` à `dedfcd5`) puis dispatch worker `claude-opus-4-8` max sur `lot/u-1a` ; `error_origin = orchestrateur` (pliage C2 écrit et vérifié par la même instance — règle apprise : **tout pliage post-G2 touchant du code est relu par une instance séparée avant checkpoint-2**).
- V-2 : dans le même lot de correction (re-sha G1 dans le même commit, règle CHANTIERS §F).
- V-3 : propriétaire orchestrateur, CHANTIERS §E.
- Puis G2 fraîche sur le delta `9f3af85 → correctif` (CA-9), G7, fusion U-1a puis T-1a.
