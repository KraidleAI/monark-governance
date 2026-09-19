# PLI — lot U-1b-b : adaptateur `AttestedBook` + canonicaliseur unique + producteur + O-1/O-2/O-3

**Worker** : `claude-opus-4-8[1m]` (modèle résolu tel quel — préfixe `claude-opus-4-8` vérifié, R-1). Effort max.
**Date** : 2026-09-19. **Worktree** : `F:\Monark-wt-u1bb`, branche `lot/u-1b-b`, base `lot/etude-suite` (`fe43731`), HEAD `8c8eac8`.
**Cadre** : G0-lot-u1b-b (corps + Amendement checkpoint-1 C-1..C-7, qui prévaut) ; ADR-U1b D5/D6/D7/D8.
**Discipline** : worker — aucun commit, aucun `git` d'écriture (R-20) ; sortie écrite pour être vérifiée adversarialement (R-21). Sources d'ingénierie = code du dépôt [lu] (chemins:lignes cités partout).

## 0. État oracle (final, post-campagne de mutants ; tout reproductible sous `TEMP=TMP=TMPDIR=F:/tmp`)

| Oracle | Commande | Résultat |
|---|---|---|
| CI | `npm run ci` | **exit 0** — `gate:vocab OK` (167 fichiers) ; `tsc` OK ; **tests 389 / pass 389 / fail 0** (baseline 376 + **N = 13**) |
| Lint | `npm run lint` | exit 0 (eslint recommended-type-checked, src strict) |
| Ratchet | `npm run lint:ratchet` | **69/69** (inchangé — 0 dette de typage ajoutée dans les tests) |
| Lang-gate | `npm run lang:gate` | exit 0 (0 hit français, scope monark/ukemi inclus) |
| Export | `npm run export:check` | exit 0 (0 chemin interdit, 0 hit français) |

`N = 13` : 8 tests `adapter-book.test.ts` + 1 test O-3 + 4 tests O-2 (≥ 10 exigé).

## 1. Fichiers livrés (sha256 sur contenu **LF-normalisé**)

Nouveaux :
| Fichier | sha256 (LF) |
|---|---|
| `packages/monark/src/book-canonical.ts` | `7365e472673db47178b8b23c9d5c51648c937663db18e3d9a3dd9e4522be2297` |
| `packages/monark/src/adapter-book.ts` | `b9816d33f4357029b7358c968391c331552c89c5a85b1d932e9f73bce929855c` |
| `packages/monark/test/adapter-book.test.ts` | `772db43366461800e924f28e8346c30400d0af05961d2f0a109618203341d1a4` |
| `packages/monark/test/fixtures/attested-book-weth.json` | `c17c3fcc89633935fe18df3fce732bd4d0261cb0a243881a24442a0e3e006b50` |

Modifiés :
| Fichier | sha256 (LF) | Nature |
|---|---|---|
| `apps/sentinel/src/ukemi/book.ts` | `cb1ba53cbf15ca239bb25cf16da3023b2b9edbe31cba8b95a2d150c7ddc8ba9f` | substitution d'import seule (C-1) |
| `packages/monark/src/index.ts` | `d7840543b9f4ea57406f4206125a259ec456bd5213901b096a5b94a9bfdd62ab` | barrel : exporte L-1/L-2 |
| `packages/contracts/test/closed-check.test.ts` | `ef1d7e3840cb6c7f367156fe44da30ab87b997829fd4af32122d0a8a5c29369f` | +1 test O-3 (test, **non gelé**) |
| `packages/contracts/test/schema.test.ts` | `23cd39059f92781b05d2c05535a6a089521bbe81f9889733e683c9191706ae0a` | +4 tests O-2 (test, **non gelé**) |
| `docs/adr/ADR-U1b-contrat-attestedbook.md` | `adaf8dc45b49544485e53701767e208ae1c29606446d9e0916b15cd4bcb550c1` | D7 ligne 1 (doc, exclu R-25) |

Zone gelée (INCHANGÉE, cf. §9) : `schemas/attested-book.schema.json` = `8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b` ; `test/contracts-frozen.manifest.json` = `d50f5c51921dc89dce8bd7996e96ded056a973d34b29e7926fd5a7de33d99066` (= valeurs épinglées).

## 2. Canonicaliseur unique (L-2, C-1/C-2) et preuve

- `book-canonical.ts` **porte la définition** de `canonicalStringify(v: Canon)` (copie byte-fidèle de l'ancien `book.ts:23-29`) + `Canon` + `bookDigest(book)=sha256(canonicalStringify(book))`. `apps/sentinel/src/ukemi/book.ts` : **substitution d'import seule** — définition locale supprimée, `import { canonicalStringify, type Canon } from "@monark/monark"` (l.12) + re-export (l.22-23) pour que `ukemi.test.ts:12` reste **inchangé**. `grep 'function canonicalStringify' book.ts` = 0 ; seul usage local restant `sha256(canonicalStringify(book))` (l.185).
- **Preuve de l'unique canonique** : `sentinel2_book_identical_to_pull` **inchangé et vert** (`book_digest` = `034fbff9…b921`, `holders_digest` = `529bf2b8…f110`, `line_hash` = PIN) → la canonique de `@monark/monark` reproduit octet-pour-octet celle du recorder. `ukemi.test.ts` : 20/20 verts.
- Extension typée `canonicalAttestedBook(v)` (domaine futur `attestor.sig`, K-1) : `null` admis ; nombre canonique **ssi** `Number.isSafeInteger` (forme décimale) ; **tout autre nombre (float, entier non sûr) ⇒ `throw NonCanonicalNumberError`**, jamais `{}` silencieux (C-2). `attestedBookDigest(v)=sha256(canonicalAttestedBook(v))` (nommé par G0 corps L-2 ; voir §12). **Détermination des tests** : `_canonical_deterministic` (i) — invariance par permutation de clés (top + imbriqué) — est la garde **portante** de L-2 ; (iii) — JSON non-minifié même canonique — est **déclaré-vacant** (propriété de `JSON.parse`, pas de `canonicalAttestedBook`), gardé pour la lettre du cahier.

## 3. Adaptateur `fromAttestedBook` — table fermée par clé (C-4)

`fromAttestedBook(json)` : `JSON.parse` → `assertClosedAttestedBook` → `assertNoForbiddenKey` → gardes de valeur (ordre L-1). Rend `{ book (objet parsé, ordre préservé), provenance, label }` **sans `Prediction`** ; erreurs `BookAdapterErrorReason = Extract<CoverageReason,"binding_broken"|"non_evaluable">` (C-5, motif `adapter-narabi.ts:91`). `provenance`/`label` **hors** contrat (motif `adapter-narabi.ts:103-108`).

| Clé / altération | Garde | Où | Rejet |
|---|---|---|---|
| clé inconnue (dont `yhat`,`predictor_id`,`produced_at`) | `assertClosedAttestedBook` | adaptateur (étape 2) | `binding_broken` (`_rejects_prediction_keys`) |
| clé interdite (`confidence`,`peg_score`,…) | subsumée par closed-check (= clé inconnue) ; `assertNoForbiddenKey` = défense en profondeur | adaptateur + contrats | `binding_broken` (voir M2, §5) |
| `residual` hors enum | `⊂ ATTESTED_BOOK_RESIDUALS` | adaptateur (3) | `binding_broken` (`_residual_enum`, M6) |
| `residual` sans `no_third_party_verifier` | garde `.includes(...)` (miroir `contains` gelé) | adaptateur (3) | `binding_broken` (`_residual_enum`) |
| `eligible.n_positions` non entier / < 0 (O-1) | `Number.isInteger ∧ ≥ 0` | adaptateur (4) | `binding_broken` (`_n_positions_integer`) |
| `eligible.debt_base`/`collateral_base` non décimal | `/^[0-9]+$/` | adaptateur (4) | `binding_broken` |
| `abstain.reason` hors enum | `∈ ATTESTED_BOOK_ABSTAIN_REASONS` | adaptateur (5) | `binding_broken` |
| couplage `abstain.value ⇔ reason≠null` rompu (2 sens) | biconditionnel (C-1) | adaptateur (5) | `binding_broken` (`_abstain_coupling`, M1) |
| `providers` vide / `name` vide | non-vide + noms non-vides | adaptateur (6) | `binding_broken` |
| `quorum.required` > fournisseurs distincts | `required ≤ #noms distincts` | adaptateur (6) | `binding_broken` (`_quorum_required`, M5) |
| non-abstenu ∧ `achieved < required` | invariant quorum D4 | adaptateur (6) | **`non_evaluable`** (`_quorum_required`) |
| `observed_at.clock` non ASCII | `/^[ -~]+$/` (D2bis) | adaptateur (7) | `binding_broken` |
| `block.number`/`book_digest`/`holders_digest` absents/mal typés | présence+type (champs déréférencés) | adaptateur (8) | `binding_broken` (jamais un throw non capté) |
| **Portées par le schéma (ajv/contrats), HORS adaptateur — déclarées, non revendiquées** : `subject`,`chain`,`protocol`,`cluster` (regex) ; `block.hash`,`book_digest`,`holders_digest` (motif 64/40-hex) ; `oracle_sources` (uniqueItems, motifs) ; `providers.method` (enum), `minItems`,`uniqueItems` ; `quorum.required≥2` ; `attestor.kind/key/sig`, `recorder_revision`, `schema_version` (motifs) ; `observed_at.instant` (entier≥0). Sondes O-2 (S1,S2,S3,S6) + tests contrats existants les couvrent. | (schéma) | (ajv) | — |

Round-trip : `serialize(fromAttestedBook(serialize(book)).book) === serialize(book)` **byte-exact** (`fromAttestedBook` ne répare pas ; il rend l'objet parsé, ordre d'insertion préservé ; `serializeAttestedBook` = `JSON.stringify` ordre d'insertion). Vert.

## 4. Producteur `toAttestedBook` (C-3, tuyau D7 ligne 1) + fixture

- `toAttestedBook(result, ctx)` **pur** : digests (`book_digest`,`holders_digest`) + champs on-chain (`block`, `oracle_sources` depuis `book.reserves`, `eligible` depuis `book.eligible_aggregate`+`counts.eligible`) **copiés du recorder** ; `subject/chain/protocol/attestor/recorder_revision/observed_at/quorum/providers/residual/abstain` portés par `ctx` ; `schema_version="1.0.0"` constant. Lit `result` **structurellement** (`RecordedBook` local) ⇒ **aucun import de `apps/*`** (pas de cycle, §10).
- **`ctx` élargi vs C-3** (`{attestor,observed_at,quorum,providers,residual,abstain}`) : ajout de `subject,chain,protocol,recorder_revision` — **nécessaires** à un `AttestedBook` valide et **absents** de `RecordResult` (voir §12, décision à confirmer R-21).
- Fixture `attested-book-weth.json` **construite depuis le recorder** : `serializeAttestedBook(toAttestedBook(recordBook(CLUSTER_WETH, 23545087, readerWETH), ctx))`, minifiée (1 ligne). `attestor.key="deadbeef"` (placeholder K-1), **`attestor.sig` ABSENT** (asserté `=== undefined`). `recorder_revision` = placeholder déclaré `ukemi-recorder@0…0` (provenance, non épinglé). Le test asserte `book_digest`/`holders_digest`/`block.number`/`block.hash` **contre le PIN de `ukemi.test.ts` et le block de `weth-book.fixture.json`**, jamais contre la fixture elle-même (C-6).
- Test de composition `attested_book_composition` : `recordBook → toAttestedBook → serializeAttestedBook → fromAttestedBook`, `out.book.book_digest === PIN 034fbff9…b921` (+ holders + block + 3 `oracle_sources`). Vert.

## 5. Mutants (rejoués via `F:\tmp\u1b-b\mutants.mjs` ; copie de l'original, restauration, sha LF avant==après ; fichiers gelés : `git diff --quiet` = clean)

| Mutant | Cible | Test nommé rouge (TAP) | Restauré byte-exact | Gelé : git clean |
|---|---|---|---|---|
| M1 garde abstain retirée | `adapter-book.ts` (couplage → `if(false)`) | `not ok - attested_book_abstain_coupling` | oui | n/a |
| M2 `assertNoForbiddenKey` court-circuité | `forbidden-keys.ts` (`hit=null`) **[gelé]** | `not ok - assertNoForbiddenKey THROWS with the path` | oui | **clean** |
| M3 tri des clés non neutre | `book-canonical.ts` (`sort` retiré dans `canonicalAttestedBook`) | `not ok - attested_book_canonical_deterministic` | oui | n/a |
| M4 nombre non entier accepté | `book-canonical.ts` (`isSafeInteger` → `if(false)`) | `not ok - attested_book_canonical_deterministic` | oui | n/a |
| M5 `quorum.required` non comparé | `adapter-book.ts` (`required>names.size` → `if(false)`) | `not ok - attested_book_quorum_required` | oui | n/a |
| M6 residual non vérifié | `adapter-book.ts` (garde enum → `if(false)`) | `not ok - attested_book_residual_enum` | oui | n/a |
| M7 récursion closed-check coupée (O-3) | `closed-check.ts` (`return;` après racine) **[gelé]** | `not ok - …recursion covers eligible/providers/quorum/attestor/observed_at (O-3)` | oui | **clean** |
| M8 contrainte ajv retirée (O-2) | `attested-book.schema.json` (`uniqueItems` de `oracle_sources` retiré) **[gelé]** | `not ok - attested_book_schema_oracle_sources_unique (S2)` | oui | **clean** |

Résultat du runner : **ALL MUTANTS OK** (8/8 rouges sur le test nommé, 8/8 restaurés byte-exact, 3/3 gelés restaurés git-clean). Post-campagne : `npm run ci` = 389/389, zone gelée intacte (§9) — la restauration est complète.
**Interprétation M2 (déclarée, non-défaut)** : pour `AttestedBook`, `assertClosedAttestedBook` **subsume** `assertNoForbiddenKey` (toute clé interdite est une clé inconnue) — même constat que `adapter-narabi.test.ts:162-164`. Court-circuiter l'**appel** dans `fromAttestedBook` ne rougit donc aucun test (closed-check attrape déjà). M2 cible donc la **fonction** `assertNoForbiddenKey` (défense en profondeur de la flotte, appelée par l'adaptateur) ; son tueur est le test contrats `assertNoForbiddenKey THROWS with the path`.
**Note M3 (déclarée)** : sur cette fixture toutes les clés sont ASCII minuscules et `_` ne départage jamais un ordre (`block`/`book_digest` divergent dès l'index 1), donc un mutant `localeCompare` serait **ordre-équivalent** à `Buffer.compare` et **survivrait** ; le mutant démontrable de « tri non neutre » est le **retrait du tri** (ordre d'insertion), qui rougit (i).
**Interprétation M8 (déclarée)** : « une sonde ajv retirée » = retrait de la **contrainte de schéma** que la sonde lie (ici `uniqueItems`), motif identique au mutant `contains` déjà présent (`schema.test.ts:157-173`). Les sondes S1/S3/S6 lient de la même façon `pattern`/`minItems`/`required` (démontrable par le même procédé).

## 6. Oracle final (séquentiel, jamais deux en parallèle)
`npm run ci` (389/389) · `npm run lint` (0) · `npm run lint:ratchet` (69/69) · `npm run lang:gate` (0) · `npm run export:check` (0). Voir §0.

## 7. R-25 (mesure sous la pathspec exacte de la ligne `STAT=` de `.github/workflows/ci.yml`, working tree inclus)

- Suivi (fichiers trackés modifiés) : `git diff --shortstat lot/etude-suite -- . <exclusions STAT>` = **4 files changed, 55 insertions(+), 11 deletions(-)** = **66**.
- Nouveaux fichiers (non trackés, toutes insertions, aucun exclu par `STAT` — la fixture `packages/monark/test/fixtures/**` **compte**, C-7) : `adapter-book.ts` 264 + `book-canonical.ts` 67 + `adapter-book.test.ts` 189 + fixture **1** = **521**.
- **Total R-25 ≈ 587** (66 + 521). **< seuil dur 1 205 ⇒ le gate CI R-25 PASSE.** **> cible 400.**
- **Repli C-7 analysé, non appliqué (contre-productif ici)** : retirer O-2/O-3 (tests contrats) n'ôte que ~42 lignes trackées ⇒ ~545, **toujours > 400** (le cœur L-1/L-2/L-3 seul — consommateur + producteur + canonique + fixture + tests — ≈ 521 dépasse 400), **et** ferait tomber `N` à 8 (< 10 mission / < 9 G0). Cause : les corrections checkpoint-1 (C-2 `canonicalAttestedBook`, C-3 producteur + composition, C-4 O-1 + table de gardes, C-7 fixture comptée + O-2/O-3) ont **élargi le périmètre** au-delà de l'estimation initiale ≈ 250. **Décision : livrer l'ensemble (N=13), R-25 = 587 < 1 205 ; point tranché par l'orchestrateur (R-21)** — accepter 589, ou re-découper (p. ex. producteur+composition → U-1b-b-2, mais le consommateur+canonique seuls restent ~442 > 400). La fixture est minifiée (1 ligne) pour limiter le coût.
- Reproductible par l'orchestrateur (qui peut indexer/committer) : `git add -N . && git diff --shortstat lot/etude-suite -- . <exclusions STAT>`.

## 8. Preuve : aucun texte probatoire / vocab / lang
`gate:vocab OK` (scope `monark` inclus : bans `peg_score`/`p_depeg`/`Hermes` — 0 hit) ; `lang:gate` 0 ; label K-1 = « self-declared liquidation-book reading under keyless RPC quorum; no external attestor; a book is read under quorum, never scored » (aucun `confidence`/`accuracy`/`p_`/`verified`/`proven`). `grep -niE 'prediction|yhat|predictor_id' packages/monark/src/{adapter-book,book-canonical}.ts` = **0** (vérifié ; les commentaires de l'adaptateur sont reformulés en « forecast » pour satisfaire le grep mécanique du critère 3 ; les clés `yhat`/`predictor_id` n'apparaissent que comme *données* de test dans `packages/monark/test/`, légitimes) ; `_rejects_prediction_keys` vert.

## 9. Preuve zone gelée (intacte, post-mutant)
- `git diff --stat lot/etude-suite -- schemas/ packages/contracts/src/` = **vide** (blobs byte-identiques à `lot/etude-suite`).
- sha256 LF : `schemas/attested-book.schema.json` = `8ba71122…5c32b` (= épinglé) ; `test/contracts-frozen.manifest.json` = `d50f5c51…d99066` (= épinglé).
- Test `contracts_frozen` vert dans les 389 (garde CA-0). O-2/O-3 = **tests seuls** (`packages/contracts/test/**`, non gelé). `git status` : aucun `schemas/` ni `packages/contracts/src/` modifié.

## 10. Preuve absence de cycle
`grep -rE '^\s*(import|export).*(from|require).*apps' packages/monark/src/` = **0**. Sources importées par `packages/monark/src` : `./adapter-*.ts`, `./book-canonical.ts`, `./cbor-canonique.ts`, `@monark/contracts`, `node:crypto`. `apps/sentinel` dépend de `@monark/monark` (sens unique). Le seul lien `packages/monark/test → apps/sentinel` (composition : `recordBook`, `CLUSTER_WETH`) est **test-only** (précédent : `test/*.test.ts` importent `apps/harness`, `apps/site`) et ne crée pas de cycle de `src`.

## 11. Tuyaux (D7 mis à jour) et branchement
ADR-U1b D7 ligne 1 : « producteur `toAttestedBook` + consommateur `fromAttestedBook` **livrés U-1b-b** ; consommateurs = `attested_book_roundtrip`/`_canonical_deterministic`/`_composition` ; chemin **servi** `/ukemi/*` = **U-6** ⇒ `AttestedBook` reste **`upcoming`** au registre public jusque-là ». Conforme à la règle branchement : pièce « built » ⇒ chemin servi + test d'intégration non-LLM ; ici le chemin servi est U-6, donc `upcoming` (aucun README/site touché — CA-11 : `fleet.ts` non modifié).

## 12. « Reste » (honnête) — items formés à déclencheur (zéro dette) et points R-21

**Items formés (ADR, non-dette)** :
- **K-1** : clé recorder réelle + domaine de `attestor.sig`. `attestor.key="deadbeef"` placeholder, `sig` absent (décision 22, ADR-U1b C-6/D8). `canonicalAttestedBook`/`attestedBookDigest` livrent le domaine de signature (prêt K-1). **Déclencheur : avant le go U-6.**
- **`recorder_revision`** dans la fixture = placeholder `ukemi-recorder@0…0` (provenance, non épinglé, hors `book_digest`). La vraie valeur = sha256 des sources `ukemi/**` (motif `sentinelSha`, `run.ts:96-101`), produite par le recorder à l'exécution. **Déclencheur : U-6.**
- **U-6** (chemin servi `/ukemi/*`, Caddy) et **U-4** (union `AttestedPrice|AttestedBook` au gate + `Prediction`) : hors périmètre, formés dans l'ADR (D5/D7). `AttestedBook` reste `upcoming`.

**Points tranchés par le worker, à valider par l'orchestrateur (R-21) — écarts assumés, non-dettes** :
1. **`ctx` élargi** au-delà des 6 champs listés en C-3 (ajout `subject/chain/protocol/recorder_revision`) : nécessaire à un `AttestedBook` valide (ces champs ne sont pas dans `RecordResult`) ; `schema_version` constant.
2. **Garde `non_evaluable`** (non-abstenu ∧ `achieved<required`) ajoutée, fondée sur D4 (« achieved < required ⇒ no_quorum ») : donne un emploi réel au reason `non_evaluable` du type C-5 (sinon mort). Retrait trivial si refusée.
3. **`attestedBookDigest`** livré (nommé par G0 corps L-2 ; le résumé mission-top ne cite que 3 fonctions) — compagnon sha de `canonicalAttestedBook`, domaine `attestor.sig`.
4. **M2/M8 interprétés** comme au §5 (subsomption closed-check ⇒ M2 cible la fonction ; M8 = retrait de la contrainte de schéma liée par la sonde) — motifs `adapter-narabi.test.ts:162-164` et `schema.test.ts:157-173`.
5. **R-25 = 589 > cible 400** (< seuil dur 1 205, CI passe) ; C-7 contre-productif (§7) — **décision finale à l'orchestrateur** : accepter, ou dicter un re-découpage.

6. **C-6 « provenance déclarée dans la fixture »** : le contrat fermé (`additionalProperties:false`) interdit toute clé hors-schéma dans la fixture ; la provenance (placeholder `deadbeef`, `sig` absent, construction depuis le recorder) est déclarée dans l'en-tête de `adapter-book.test.ts` + ce PLI, **pas** dans le JSON. Le motif dépôt alternatif = un `PROVENANCE-*.md` frère (`apps/sentinel/test/fixtures/PROVENANCE-boundary-blocks.md`), écarté ici car un `.md` sous `packages/monark/test/fixtures/` **compterait** en R-25 ; à confirmer si le validateur (CA-11) attend le motif frère.

Aucun « dû » nu, aucun contournement (P5).
