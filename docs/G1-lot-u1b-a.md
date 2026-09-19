# G1 — Lot U-1b-a : zone gelée du 6ᵉ contrat `AttestedBook`

- **Modèle résolu** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` — R-1), effort `max`. Worker ; ne committe pas (R-20).
- **Date** : 2026-09-19 · **Worktree** : `F:\Monark-wt-u1b` · **Branche** : `lot/u-1b-a` · **Base** : `lot/etude-suite@0e2ff1e` (merge-base vérifié).
- **Contexte** : ADR-U1b (checkpoint-1 APPROUVÉ-AVEC-CORRECTIONS C-1..C-12 ; A/B/C tranchés) ; ADR-U1 D10(b)/D1-amendé ; ADR-M001 D9 ; ADR-M008 D9 ; ADR-M013 (T0).
- **Réviseur** : orchestrateur `claude-fable-5-1` (relit adversarialement, verdict, commit — R-20/R-21).
- **Décision orchestrateur pliée (pré-gel)** : option (i) du point G7 « description d'oracle vide » — D2 amendé `^[ -~]+$`→`^[ -~]*$` **avant le gel** (§8). Dette résolue.
- **Périmètre strict** : zone gelée seule (schéma + binding + re-baseline + tests de gel + surface publique C-9). **NON fait (U-1b-b)** : `packages/monark/src/{adapter-book,book-canonical}.ts`, tests `attested_book_roundtrip` / `attested_book_canonical_deterministic`. `forbidden-keys.json` **inchangé** (D1). `fleet.ts` **non touché**.

## 1. Fichiers créés / modifiés (sha256 LF, lignes)

| Fichier | État | sha256 (LF) | Lignes |
|---|---|---|---|
| `schemas/attested-book.schema.json` | **créé** | `d5b1beeab23482322da59041b9e62874a74c4cd53f55d7b730a7c150975da3cd` | 159 |
| `packages/contracts/src/enums.ts` | mod | `28858323730c563cee088626e02897eb48aabe2be6d04f3c7f6df0fd5adb0b2c` | 78 |
| `packages/contracts/src/types.ts` | mod | `604fa1390036cd5201bf4691ccb6342f73792962aa8da8c237d67ea6a2f567bb` | 244 |
| `packages/contracts/src/closed-check.ts` | mod | `50954775204fa3d314d149a7aeb912f1c0e9e7d13b7d3e920a8757df5565f129` | 138 |
| `packages/contracts/src/serialize.ts` | mod | `508341eb741424e660b52ae45f4323791650612eef172060071715f25c91d253` | 53 |
| `packages/contracts/src/index.ts` | mod | `3065d73777f20f721b2a6440930b0cf13287356582ed085bcfbba8c541e4af86` | 60 |
| `packages/contracts/test/fixtures.ts` | mod | `085b8947c9fba474e2b0657bba7bc11ed285306c8813cbe20536c28d354147fc` | 128 |
| `packages/contracts/test/contracts.test.ts` | mod | `99133de9ddf87faa5a1e6f720c9f6f2b742ae51eb4db67380e64c46e0baa12f0` | 126 |
| `packages/contracts/test/schema.test.ts` | mod | `d48d505a6d5bf3a11cc113b287007bb700705b82757f7ca36ad4f266d5660261` | 195 |
| `packages/contracts/test/enums.test.ts` | mod | `b2f6e6dee44845a5f872036d5f5a08613dc28a61a5e30f0f56afa7fd8a86b385` | 56 |
| `packages/contracts/test/closed-check.test.ts` | mod | `6d1f856a3effa1b84633bf304b95475ab59920b4490f93073a3a1e062e16b665` | 70 |
| `packages/contracts/test/attested-book.test.ts` | **créé** | `a3862b3bee7e116ded2a5018336a6d1e436352f1b19e2e96ddd884924273b1a8` | 93 |
| `test/contracts-frozen.test.ts` | mod | `7e9cd16fc0497f90fb23f9adb717b8494b580adc9469acb499064a2fca3504b4` | 74 |
| `test/contracts-frozen.manifest.json` | mod (re-baseline) | `4d912d4160e0fa1eb137c54a58b24ab1f7dad61d9ef336ac55bf01c1d974f245` | 17 |
| `README.md` | mod (C-9) | `e852c91d714cf9761477af6c804e441851dd032421d33110f92d6a1c198732fd` | 206 |
| `apps/site/app/roadmap/page.tsx` | mod (C-9, T0) | `f1b33b72084254963758ce06569918700b8baf74436b4b91e73a32c4c2197096` | 221 |
| `apps/site/app/how/page.tsx` | mod (C-9, T0) | `872302861eb73889a8923d95e52834c77d87f7072b0a58950432dfa962ef81ff` | 305 |
| `docs/adr/ADR-U1b-contrat-attestedbook.md` | mod (amendement D2 pré-gel) | `0c3d305d434c57df7ef1b3b7e13b1f6938a6bd55739184d2864a22af409f3bf5` | 104 |
| `docs/adr/ADR-M008-narabi-attested-flow.md` | mod (renvoi 5→6) | `de9ecb176e1612207745f44a3149e61c1028e179851078654ef76dcd5b86bde7` | 138 |

Tous les fichiers en **LF pur** (vérifié `od -c` / `tr`). `git status` = **20** entrées : ces 19 fichiers (17 M + 2 ??) + `docs/G1-lot-u1b-a.md` (??). Aucun autre.

### Diff résumé (R-25, ci.yml:52 three-dot = merge-base `0e2ff1e`)
`19 files changed, 567 insertions(+), 22 deletions(-)` = **589 lignes changées** (bound 1205 ; sous le seuil).
Note : `lot/etude-suite` a **avancé** de `0e2ff1e` → `a24a9eb` pendant le lot (autres lots committés par l'orchestrateur). Le two-dot `git diff lot/etude-suite` sur-comptait la divergence ; le **merge-base = 0e2ff1e = ma base déclarée** = mesure fidèle au ci.yml (three-dot `lot/etude-suite...HEAD`) ⇒ 589.
Écart vs estimation ADR (« ≈ 350 l. ») assumé : schéma commenté (159 l.), `types.ts` documenté (+71), tests de gel exhaustifs. Bound 1205 respecté (l'estimation n'est pas un bound).

### Gel des 5 contrats existants — diff 0 octet (sha LF avant = après)
| Schéma | sha LF (inchangé) |
|---|---|
| `attested-flow.schema.json` | `393a155f4b717c9e0fdde2212bc0099df305bb8d78317b2d018255b4894960d1` |
| `attested-price.schema.json` | `d2c17c4dfd2b44b2b79041e2164628f75f67cb0d3fadefe804e3b43e2d873b8a` |
| `coverage-verdict.schema.json` | `203591de14994dfbc1076a5af888accd147cfb832a22feb2e284432b68c18d88` |
| `gate-decision.schema.json` | `ed725b73e346eda43c67376286d9a653cdbc1686ceb09d2e93d1bc3280a5fea9` |
| `prediction.schema.json` | `f304e0726f06aa5158a5c023c8236b3cad535ba3d7507d249667a856118fd3cc` |
| `forbidden-keys.json` (D1, inchangé) | `a4e93fd14c1dbd51d6bbffbdc289e8bcba08c1a94dd306c2729d0849d25e2990` |

## 2. Les 17 clés du schéma et leur origine (ADR-U1b D2)

`required` = ces 17 (seule `attestor.sig` optionnelle) ; `additionalProperties:false` racine + chaque sous-objet.

| # | Clé | Type / contrainte | Origine (D2 « Source [lu] ») |
|---|---|---|---|
| 1 | `schema_version` | string semver (=`"1.0.0"`, propriété d'instance) | M001 D9 |
| 2 | `subject` | string, regex D2bis (approx nommée) | subject.rs |
| 3 | `chain` | string CAIP-2 `^[-a-z0-9]+:[-a-zA-Z0-9]+$` | adapter-narabi.ts:61 |
| 4 | `protocol` | string `^[ -~]+$` minLength 1 | ADR-U1 D1 |
| 5 | `cluster` | string `^[a-z0-9-]+$` | ADR-U1 Q1 |
| 6 | `block` | `{number:int≥0, hash:^0x[0-9a-f]{64}$}` | ADR-U1 D1 |
| 7 | `book_digest` | string 64-hex (double domaine book/abstention) | ADR-U1 D2 |
| 8 | `holders_digest` | string 64-hex | ADR-U1 D6 |
| 9 | `oracle_sources` | array `{asset:0x…40, source:0x…40, description:`**`^[ -~]*$`**` vide admis}` `uniqueItems minItems:0` | ADR-U1 D1 (+ D1 amendé) |
| 10 | `eligible` | `{n_positions:int≥0, debt_base:^[0-9]+$, collateral_base:^[0-9]+$}` | ADR-U1 D1 |
| 11 | `providers` | array `{name, method:enum[getLogs,eth_call], ok:bool}` `minItems:1 uniqueItems` | ADR-U1 D3 |
| 12 | `quorum` | `{required:int≥2, achieved:int≥0}` | ADR-U1 D3 |
| 13 | `abstain` | `{value:bool, reason:enum[null,no_quorum,abi_mismatch,unfinalized_block]}` + `oneOf` couplage | ADR-U1 D3/D6 |
| 14 | `residual` | array enum FERMÉ (6) `minItems:1 uniqueItems` | M008 D3 (patron) |
| 15 | `attestor` | `{kind:const recorder, key:^([0-9a-f]{2})+$, sig?:même}` | ADR-U1 D10 |
| 16 | `recorder_revision` | string `^ukemi-recorder@` + 64-hex | ADR-M001 D3 (miroir) |
| 17 | `observed_at` | `{clock:string, instant:int≥0}` (réutilise `observedAt`) | ADR-U1 D6 |

**Entiers vs chaînes (D2, non « chaînes en bloc »)** : `block.number`, `eligible.n_positions`, `quorum.required/achieved`, `observed_at.instant` = **entiers JSON** ; seuls les montants uint256 `eligible.debt_base`/`collateral_base` (et les digests hex) sont des **chaînes** — précédent exact `attested-flow`. `residual` enum D2ter (6, `no_third_party_verifier` toujours émis). `book_digest`/`holders_digest` = hex **sans** `0x` ; `block.hash` = **avec** `0x`. **`oracle_sources[].description` = `^[ -~]*$`** (vide admis, cf. §8).

## 3. Binding TS (source runtime unique)
- `enums.ts` : `ATTESTED_BOOK_RESIDUALS` (6), `ATTESTED_BOOK_ABSTAIN_REASONS` (`[null, …]` — `null` inclus pour deepEqual direct).
- `types.ts` : interface `AttestedBook` (17 champs) + import/export des 2 types d'enum.
- `closed-check.ts` : `ALLOWED_KEYS.attestedBook` + sous-objets `attestedBookBlock/OracleSource/Eligible/Provider/Quorum/Abstain/Attestor` (+ réutilise `observedAt`) ; `assertClosedAttestedBook` récursif (motif fleet).
- `serialize.ts` : `serializeAttestedBook` (motif fleet `assertClosedAttestedBook`→`assertNoForbiddenKey`→`JSON.stringify`).
- `index.ts` : exports (types + enums + assert + serialize) ; **commentaire `index.ts:6` corrigé** — « Upstream: Shogen (AttestedPrice, a VERIFIED testimony) » (partiel) → 3 attestations, AttestedPrice/AttestedFlow VÉRIFIÉES, AttestedBook **AUTO-DÉCLARÉE, sans vérifieur** (ADR-U1b).

## 4. Tableau des tests (nom → ce qu'il prouve)

| Test (fichier) | Prouve |
|---|---|
| `contracts_frozen … match the current frozen manifest` (test/contracts-frozen) | zone gelée = manifeste re-baseliné ; en-tête « + ADR-U1b D1 » |
| `contracts_frozen … covers the 7 schemas` (test/contracts-frozen) | `schemas===7` ; message « 6 schemas (…, attested-book) » |
| `schema properties are IN SYNC …` (contracts.test) | drift ALLOWED_KEYS ⇔ schéma sur le 6ᵉ (racine + 7 sous-objets + observedAt) |
| `every contract schema declares additionalProperties:false …` (contracts.test) | `assertClosedNode` récursif inclut `attested-book` (racine + sous-objets + branches `oneOf`) |
| `valid contracts serialize without throwing` (contracts.test) | `serializeAttestedBook(validAttestedBook())` ne throw pas |
| `assertClosedAttestedBook passes a valid book … price/peg_score` (closed-check.test) | clé inconnue racine (`price`/`peg_score`) ⇒ throw |
| `assertClosedAttestedBook is recursive …` (closed-check.test) | clé inconnue nichée (`block`, `abstain`, `oracle_sources[0]`) ⇒ throw |
| `all six schemas compile …` (schema.test) | le 6ᵉ compile sous ajv strict:true ; `$ref` résolus |
| `valid fixtures pass their schema` (schema.test) | `validAttestedBook()` valide sous ajv (binding ⇔ schéma) |
| `attested-book rejects a residual OUTSIDE … empty … duplicate` (schema.test) | enum fermé D2ter, `minItems:1`, `uniqueItems` |
| `attested_book_abstain_coupling` (schema.test) | `value ⇔ reason≠null` — **les deux sens** rejetés (`oneOf`) |
| `attested-book rejects a non-decimal base … method … sub-quorum … unknown key` (schema.test) | uint256=chaîne, `method` enum, `required≥2`, `additionalProperties:false`, `block.hash` `0x` |
| `attested_book_description_may_be_empty` (schema.test) | `oracle_sources[].description` accepte `""` (amend. D2, revert concordant) ; non-ASCII refusé ; `"x"` accepté |
| `attested-book residual enum: schema matches TS single source` (enums.test) | `residual` = `ATTESTED_BOOK_RESIDUALS` |
| `attested-book abstain.reason enum … null included` (enums.test) | `abstain.reason.enum` = `ATTESTED_BOOK_ABSTAIN_REASONS` (null en tête) |
| `attested_book_description_no_probative_claim` (attested-book.test) | scrub PROBATIVE (attest.test.ts:109), négations masquées ⇒ aucun jeton probatif |
| `subject_pattern_subset_of_canonical` (attested-book.test) | canonique ⊂ schéma ; motif strict M017 rejette MAJ/`#`/`@`/`..`/IPv4 ; schéma **accepte** `..`/IPv4 (non-port D2bis) |

**Compteur** : `npm run ci` = **336 tests, 336 pass, 0 fail** (base 326 + **10** nouveaux : schema.test +4, enums.test +2, closed-check.test +2, attested-book.test +2 ; les extensions de tests existants n'ajoutent pas de `test()`).

## 5. Tableau des mutants (attendu / mesuré / restauration)

| # | Mutation | Test ciblé | Attendu | Mesuré | Restauration sha (= baseline) |
|---|---|---|---|---|---|
| a | `price:"1"` sur l'enveloppe (fixture) | `valid contracts serialize` | ROUGE (throw) | ✖ fail 1 | `fixtures.ts` `085b8947…` ✓ |
| b | `residual:[]` (fixture) | `valid fixtures pass their schema` | ROUGE (minItems) | ✖ fail | `fixtures.ts` `085b8947…` ✓ |
| c | `abstain{value:true,reason:null}` (fixture) | `valid fixtures pass their schema` | ROUGE (couplage) | ✖ fail 1 | `fixtures.ts` `085b8947…` ✓ |
| d | 1 octet du schéma (`archive block`→`archive  block`) | `contracts_frozen … manifest` | ROUGE | ✖ fail 1 | `attested-book.schema.json` `d5b1bee…` ✓ |
| e | `verified` inséré dans `description` | `attested_book_description_no_probative_claim` | ROUGE | ✖ fail 1 | `attested-book.schema.json` `d5b1bee…` ✓ |
| f | `schemas===6` laissé | `contracts_frozen … 7 schemas` | ROUGE | ✖ fail 1 | `contracts-frozen.test.ts` `7e9cd16f…` ✓ |
| g | pattern description `*`→`+` (vide re-rejeté) | `attested_book_description_may_be_empty` | ROUGE | ✖ fail 1 | `attested-book.schema.json` `d5b1bee…` ✓ |

Chaque mutation : backup `cp` → mutation `node` (split/join, **jamais** `String.replace` — le `$` des patterns y est interprété `$\``, corrigé après une 1ère corruption de l'ADR restaurée par `git checkout HEAD --`) → `node --test` ciblé → restauration `cp` → **sha vérifié = baseline** (les 7 restaurés bit-exact). Suite finale re-verte (336/336).

## 6. Sorties chiffrées des gates

| Gate | Commande | Résultat |
|---|---|---|
| CI | `npm run ci` | gate:vocab OK · tsc 0 · **336 tests / 336 pass / 0 fail** |
| lint | `npm run lint` (`eslint .`) | 0 erreur |
| ratchet | `npm run lint:ratchet` | **69/69** (0 nouvelle violation) |
| langue | `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | **0 hit**, exit 0 |
| export | `npm run export:check` | **0 chemin interdit, 0 hit FR**, exit 0 |
| gel | `node --test test/contracts-frozen.test.ts` | 2 / 0 |
| R-25 | ci.yml:52 (merge-base `0e2ff1e`) | **589** lignes < 1205 |

`npm ci` : 282 paquets (env `TEMP=TMP=TMPDIR=F:/tmp`, rien sur C:).

## 7. CA-11 — branchement (AttestedBook = **upcoming**)
- **Aucun registre « built » touché** : `fleet.ts` **intact** (hors de mon diff). AttestedBook n'apparaît hors lot que dans des docs de **planification** (CHANTIERS, BASCULEMENT, cartographie/AVIS etude-suite, G1/G2-lot-u1a, RAPPORT-PASSE) — aucun câblage runtime, aucun chemin servi.
- **Chemin servi = U-6** (Caddy `/ukemi/*`) ; **consommation gate = U-4** (union M017). AttestedBook reste **upcoming au registre public** : README §« Six frozen contracts » + carte roadmap « the sixth (AttestedBook) upcoming until served » ; 6ᵉ ligne de table README « **Upcoming until served** (schema frozen; wired at U-6) ». Schéma **gelé**, contrat **pas branché** : conforme à la règle Branchement.
- **Régime vitrine (ADR-M013)** : `roadmap:40` (prose rendue, mots, aucun chiffre, test 44 vert) + commentaire `how:53` (non rendu) = **T0**. Aucun composant nouveau. `site[T0]` à déclarer au commit par l'orchestrateur.

## 8. Point G7 « description d'oracle vide » — **RÉSOLU (option i, décision orchestrateur pré-gel)**
- **Problème** : D2 figeait `oracle_sources[].description` en `^[ -~]+$` (non vide) ; l'amendement ADR-U1 D1 (2026-09-19) tolère `""` au digest sur **revert concordant** (fait on-chain mesuré, oracle GHO `0xd110cac5…` sans `description()`) ⇒ un `AttestedBook` réel d'un cluster GHO aurait été schéma-invalide.
- **Décision orchestrateur** : **option (i)** — amender D2 `^[ -~]+$`→`^[ -~]*$` **AVANT le gel** (amende datée, pas de bump `schema_version`). Appliqué : (1) schéma `oracle_sources[].description` = `^[ -~]*$` (aucune autre clé ; 3 autres `^[ -~]+$` intacts, vérifié) ; (2) bloc **« Amendement D2 — 2026-09-19 (pré-gel, U-1b-a) »** ajouté dans ADR-U1b (sans réécrire D2 ; `error_origin` = rédacteur ADR-U1b) ; (3) sonde `attested_book_description_may_be_empty` + mutant (g) ; (4) manifest re-baseliné (schéma `d5b1bee…`), `contracts_frozen` vert ; (5) ce G1. Dette **fermée**.

## 9. Items formés (zéro dette, chacun avec déclencheur)
- **K-1** — clé recorder réelle + domaine de signature `sig`. `attestor.key` = placeholder (`"deadbeef"`), `sig` optionnelle non émise. **Déclencheur : avant le go U-6**.
- **M017** — union de la prise `attested` (`AttestedPrice` → `AttestedPrice | AttestedBook`) + motif de liaison committé. **Déclencheur : U-4** ; tests nommés qui casseront alors : `gate_attested_is_frozen_attested_price`, `tool_schema_equals_frozen_schema` (M017 D4(1)). Amendement M017 D2(i) = ratification investisseur.
- **U-1b-b** — `packages/monark/src/{adapter-book,book-canonical}.ts` + `attested_book_roundtrip` + `attested_book_canonical_deterministic` + mutants d'adaptateur. **Déclencheur : lot U-1b-b** (hors périmètre par la découpe R-25). Non créés ici.
- **Procurement papiers** : aucun nouveau (Perez PR-U1-1 déjà formé, ADR-U1).

## 10. Interprétations déclarées (vérifiables par l'orchestrateur, R-21)
1. **`schema_version` = propriété, pas annotation racine.** ajv strict:true refuse un mot-clé `schema_version` racine (mesuré : `COMPILE FAILED: unknown keyword`) ; aucun des 5 gelés n'en porte ; M001 D9 l.190 = **propriété d'instance** ; D9-bis : annotation inerte. ⇒ pas d'annotation racine.
2. **Description D3** : `cœur` + **un espace** + `complète` (joint non spécifié par l'ADR). Texte anglais exact, sans jeton probatif.
3. **Couplage `abstain`** dans le **schéma gelé** via `oneOf` (branche calquée sur `coverage-verdict` region, seule forme prouvée sous cette config ajv) ⇒ mutant (c) rougit en U-1b-a.
4. **`subject`** : regex schéma = **approximation nommée D2bis** (accepte C6 `..` et C3-IPv4 = **non-ports déclarés**, asserté explicitement). Motif strict M017 (hôte-pinné) committé **dans le test** comme oracle liste-fixe (fixture Shōgen absente ici — dit).
5. **Scrub PROBATIVE** : regex **réelle** `attest.test.ts:109` (avec `\b`). Les 2 masques nommés ne retirent aucun match aujourd'hui (« verification »/« verifier » ≠ `\bverified\b`) ; échafaudage prescrit + non-vacuité + preuve scope-locked ⇒ mutant (e) rouge.
6. **`attested_book_description_may_be_empty`** : le cas non-ASCII utilise `"\u00e9"` (échappement unicode), **pas** le littéral `é` — sinon lang-gate/test 42 (« export sans français ») rougissent sur le diacritique dans `packages/contracts/test` (scope contracts). Runtime = é, rejeté par `^[ -~]*$`. (Mesuré : littéral `é` ⇒ 1 hit FR + test 42 rouge ; `\u00e9` ⇒ 0 hit, 336/336.)
7. **`scripts/lang-gate.mjs:8`** (« the 5 frozen JSON-Schema descriptions ») : **non-changement délibéré** (commentaire *rationale* dans `scripts/`, hors surface publique C-9 ; descriptions anglaises). Signalé, pas un « dû » nu.
8. **R-25 merge-base** : `lot/etude-suite` a avancé `0e2ff1e`→`a24a9eb` pendant le lot ; mesure fidèle au ci.yml (three-dot) = merge-base `0e2ff1e` = base déclarée ⇒ 589 l.

## 11. Provenance
Généré par worker `claude-opus-4-8[1m]`, effort max, 2026-09-19, worktree `F:\Monark-wt-u1b`, sous ADR-U1b (checkpoint-1 approuvé) + décision orchestrateur option (i). Advisor Fable 5.1 consulté avant écriture, avant clôture, et sur le point G7. Vérification finale adversariale + verdict G7 + commit : orchestrateur `claude-fable-5-1` (R-20/R-21). Aucun commit, aucun workflow déclenché par le worker.
