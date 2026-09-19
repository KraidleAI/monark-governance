# CHECKPOINT-2 (LIVRABLE) — lot U-1b-b (+ pli U-1b-b-2), gel candidat `a049cd3` (`lot/u-1b-b`, livraison `04d45d4`, base `8c8eac8`)
Validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 ; rejeux sous `F:\tmp\cp2-u1bb\` (AM-2 ter : `src/` = `git archive`, `clone/` sans hardlinks, runners `mut*.mjs`, sondes `probe-c2.mts`/`probe-producer.mts`) ; persisté par l'orchestrateur. **Décision : ACCEPTE-AVEC-CORRECTIONS — C-V1 (test, +1 ligne) et C-V2 (doc) ; G2 delta bornée du pli U-1b-b-2 absorbée.**

## G2 delta bornée (pli U-1b-b-2, `04d45d4→a049cd3`)
2 fichiers : `adapter-book.test.ts` (+3, bloc `attested_book_quorum_required`, 8 tests inchangés) et le PLI. Mutant **MA** (`names.size → providers.length`) rouge à `a049cd3` et vert avec le test de `04d45d4` substitué : le pli est porteur, rien d'autre ne le tue.

## Rejoué (CA-9)
1. **Zone gelée** : diff `8c8eac8..a049cd3` sur `schemas/` + `packages/contracts/src/` vide ; sha LF schéma `8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b`, manifest `d50f5c51921dc89dce8bd7996e96ded056a973d34b29e7926fd5a7de33d99066` = objet signé U-1b-a. **Aucun objet à signer.**
2. **Oracle** copie : **389/389**, gate:vocab 167, `contracts_frozen` 7 schémas, lint 0, ratchet 69/69, lang-gate 0, export:check 0.
3. **C-1 canonique unique** : `book.ts` import l.12 + re-export l.22 + usage l.185, aucune définition ; corps `Canon`/`canonicalStringify` identique à `8c8eac8:book.ts` (diff = 10 lignes identiques) ; `packages/monark/src` sans import `apps/*` ; `ukemi.test.ts` inchangé, `sentinel2_book_identical_to_pull` vert.
4. **C-2** : `canonicalAttestedBook` — `1.5` et `2**53` ⇒ `NonCanonicalNumberError` ; `null` ⇒ `"null"` ; `-1` ⇒ `"-1"` ; imbriqué trié.
5. **C-3** : `attested_book_composition` vert ; sonde propre `serializeAttestedBook(toAttestedBook(recordBook(WETH, 23545087), ctx)) === FIXTURE` **byte-exact** ; fixture sans `sig`, `attestor.key = deadbeef` ; PIN littéraux identiques à `ukemi.test.ts:29-30`.
6. **Mutants** : MA, M1, M5, M7 (copie seule) rouges, restaurés sha LF = `git show a049cd3`. **Producteur** : MV3 (`n_positions + 1`), MV4 (`cluster` majuscules), MV5 (`debt_base "1"`) **survivants** à `a049cd3` — le test de composition n'asserte que digests, `block`, `oracle_sources.length` ⇒ C-V1.
7. **R-25** (clone, pathspec `STAT=`) : `lot/etude-suite...lot/u-1b-b` = 579 + 11 = **590** < 1 205 ; `merge-tree` contre `9a2efca` (H-attested fusionné) : exit 0, aucun conflit.
8. **CA-11** : `fleet.ts`, README, `apps/site` sans diff ; « AttestedBook, upcoming until served » aux quatre endroits ; ADR D7 ligne 1 honnête ; rien de test-only déclaré built.

## Checklist
CA-1..CA-5 conformes · **CA-6 : « tests passés ≠ correction » attrapé sur le producteur ⇒ C-V1** · CA-7 conforme (+ I-1) · CA-8 conforme · CA-9 conforme · CA-10 conforme (« lot unique » de G2 arithmétique : 587 − 42 = 545 > 400) · CA-11 conforme.

## Corrections (liste fermée)
- **C-V1 (test, +1 ligne)** : avant `const out = expectBook(...)` dans `attested_book_composition`, `assert.equal(serializeAttestedBook(book), FIXTURE.trim(), "C-V1: the producer output IS the fixture byte-exact (locks every copied field)")` — prouvé dans la copie : MV3/MV4/MV5 rouges, 8/8 sinon. `error_origin` primaire **checkpoint-1** (C-3 n'exigeait que « digest = PIN »), secondaire worker. Voie : pli worker U-1b-b-3 + G2 delta bornée (le validateur a proposé la ligne, il ne la relit pas) ; checkpoint-2 bis = sha du test + rejeu MV3. R-25 attendu 591.
- **C-V2 (doc)** : PLI §7 « accepter 589 » → « 587 (590 au candidat, 591 après C-V1) ». `error_origin` worker du pli 2.

## Arbitrages §12 (tranchés)
1. `ctx` élargi : conforme (`AttestedBookContext` porte subject/chain/protocol/recorder_revision, absents de `RecordedBook`). 2. Garde `non_evaluable` : conforme (D4, testée). 3. `attestedBookDigest` : conforme (G0 L-2). 4. M2/M8 : conformes sur la mesure G2. 5. **R-25 590, lot unique : accepté** — la cible 400 précède C-2/C-3/C-4, pliées au checkpoint-1 sans ré-estimation ; `error_origin` checkpoint-1 ; aucune dérogation à un gate. 6. Provenance fixture : l'en-tête du test suffit ; avec C-V1 le test de composition devient la **provenance exécutable** ; aucun `PROVENANCE-*.md` exigé (l'argument R-25 écarté comme motif, CA-10).

## Item formé
**I-1** : la correspondance `eligible` du producteur n'est pas falsifiable sur la fixture WETH (`eligible = 0`) — MV1/MV2 équivalents ici. Déclencheur : première fixture recorder avec `eligible > 0` (U-6 ou seconde fixture) ⇒ rejouer, attendus rouges par C-V1. Propriétaire orchestrateur.

## Preuve d'innocuité / AM-1
`git status` 0 → 0 sur `F:\Monark` (`9a2efca`) et `F:\Monark-wt-u1bb` (`a049cd3`) ; sha LF post-campagne = `git show a049cd3`. Attrapé : verrou producteur absent (3 survivants invisibles aux 11 mutants worker + G2) ; résidu « 589 » ; équivalence MV1/MV2. Manqué : à renseigner par l'orchestrateur a posteriori.
