# G2 — Revue fraîche du lot U-1b-a (6ᵉ contrat gelé `AttestedBook`, zone gelée)

- **Modèle résolu** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme — R-1), effort `max`. Relecteur, **instance séparée / contexte frais** (n'a PAS écrit ce code). Ne committe pas (R-20). Sortie vérifiable adversarialement (R-21).
- **Gel revu** : `b64ca1b` sur `lot/u-1b-a` (`git rev-parse lot/u-1b-a` = `b64ca1b9c471f326996b7b5648c5cc2507c3832a`). Base `0e2ff1e` (= merge-base avec `lot/etude-suite`, vérifié). Sujet du commit : « u-1b-a: AttestedBook, 6th frozen contract … ».
- **Méthode** : lecture par SHA (`git show b64ca1b:<chemin>`, `git diff 0e2ff1e b64ca1b`) + copie `git archive b64ca1b | tar -x -C F:\tmp\g2-u1b-a` puis `npm ci` (jamais de jonction), env `TEMP=TMP=TMPDIR=F:/tmp`. Toutes les commandes rejouées par le relecteur.
- **Date** : 2026-09-19. **Réviseur aval** : orchestrateur `claude-fable-5-1` (verdict G7 + commit, R-20/R-21).

## Verdict : **APPROUVÉ** (zéro correction bloquante ; 5 observations formées avec déclencheur, zéro dette)

Tout ce que le G1 affirme est **indépendamment reproduit et vrai**. La zone gelée est octet-correcte, la garde de gel (`contracts_frozen`) est prouvée hermétique, les 10 tests et 7 mutants (dont les 2 sens de c) sont réels, la surface publique est honnête, CA-11 et la cohérence inter-ADR tiennent, la fusion est propre. Les observations O-1..O-5 sont des renforcements/précisions **hors artefact gelé** (fichiers de test non gelés, prose d'ADR), chacune avec déclencheur ; aucune ne touche la correction du schéma/binding gelé.

---

## 1. Gates rejouées (chiffres mesurés)

| Gate | Commande (dans `F:\tmp\g2-u1b-a` sur `git archive b64ca1b`) | Résultat mesuré | Attendu | Verdict |
|---|---|---|---|---|
| `npm ci` | `npm ci` | 282 paquets ajoutés, 0 vuln, exit 0 (rien sur C:) | — | OK |
| CI | `npm run ci` (`gate:vocab`+`tsc`+`test`) | `tests 336 · pass 336 · fail 0`, exit 0 | 336/336 | OK |
| lint | `npm run lint` (`eslint .`) | 0 erreur, exit 0 | 0 | OK |
| ratchet | `npm run lint:ratchet` | `69/69` (0 nouvelle violation), exit 0 | 69/69 | OK |
| langue | `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | 0 hit (ukemi/atelier/monark/site/harness/skills = 0), exit 0 | 0 | OK |
| export | `npm run export:check` | 0 chemin interdit, 0 hit FR, exit 0 | 0 | OK |
| vocab | `npm run gate:vocab` | 156 fichiers scannés, no forbidden claim, exit 0 | 0 | OK |
| gel | `test/contracts-frozen.test.ts` (dans la suite) | 2/2 vert (`manifest match` + `covers the 7 schemas`) | 2/2 | OK |
| **auto-contrôle de CE G2** | ce livrable copié dans `docs/`, `npm run gate:vocab` + `node scripts/lang-gate.mjs --scope root` | `gate:vocab` = **156 fichiers inchangés** (docs/ hors du scan), exit 0 ; `lang-gate --scope root` = 0 hit FR, exit 0 ; grep manuel des **10** motifs bannis GLOBAUX (vocab-banned.json) sur ce fichier = **0** | 0 | OK |

### R-25 (ci.yml:52, three-dot, exclusions verbatim de D9 sexies)
- `git diff --shortstat "0e2ff1e...b64ca1b" -- . :(exclude)…` ⇒ **19 files, 567 ins, 22 del = 589** (borne 1205). **Attendu 589 : confirmé.**
- `git diff --shortstat "lot/etude-suite...b64ca1b" -- …` ⇒ **589** (identique : `git merge-base lot/etude-suite b64ca1b` = `0e2ff1e`, three-dot robuste à l'avancée de la base).
- Contrôle : two-dot `lot/etude-suite..b64ca1b` = 967 (sur-compte car etude-suite a avancé `0e2ff1e`→`ac8e1be`) — **ci.yml:52 utilise `...` (three-dot)**, donc 589 est la mesure fidèle. Le G1 §diff l'explique correctement.

## 2. Schéma vs ADR-U1b D2 (`schemas/attested-book.schema.json`, sha LF `d5b1bee…`)

**17 clés racine, toutes `required` ; seule `attestor.sig` optionnelle ; `additionalProperties:false` racine + chaque sous-objet.** Un-par-un (nom/type/pattern/required) :

| # | Clé | Type / contrainte (schéma mesuré) | Conforme D2 ? |
|---|---|---|---|
| 1 | `schema_version` | string `^\d+\.\d+\.\d+$` (pas de `const`) | Oui — motif fleet identique à attested-price/flow ; valeur `"1.0.0"` = propriété d'instance (M001 D9, non figée) |
| 2 | `subject` | string `^https://[a-z0-9-]+(\.[a-z0-9-]+)+(/[a-z0-9._~-]+)+$` | Oui (D2bis, cf. §4) |
| 3 | `chain` | string `^[-a-z0-9]+:[-a-zA-Z0-9]+$` (CAIP-2) | Oui |
| 4 | `protocol` | string `^[ -~]+$`, `minLength:1` | Oui |
| 5 | `cluster` | string `^[a-z0-9-]+$` | Oui |
| 6 | `block` | `{number:int≥0, hash:^0x[0-9a-f]{64}$}`, closed | Oui |
| 7 | `book_digest` | string `^[0-9a-f]{64}$` (double domaine, cf. description) | Oui |
| 8 | `holders_digest` | string `^[0-9a-f]{64}$` | Oui |
| 9 | `oracle_sources` | array `{asset:^0x…40, source:^0x…40, description:^[ -~]*$}`, `uniqueItems`, `minItems:0` | Oui (amendement D2) |
| 10 | `eligible` | `{n_positions:int≥0, debt_base:^[0-9]+$, collateral_base:^[0-9]+$}` | Oui |
| 11 | `providers` | array `{name:^[ -~]+$ minLen1, method:enum[getLogs,eth_call], ok:bool}`, `minItems:1`, `uniqueItems` | Oui |
| 12 | `quorum` | `{required:int≥2, achieved:int≥0}` | Oui |
| 13 | `abstain` | `{value:bool, reason:type[string,null] enum[null,no_quorum,abi_mismatch,unfinalized_block]}` + `oneOf` couplage | Oui (cf. §3) |
| 14 | `residual` | array enum FERMÉ (6), `minItems:1`, `uniqueItems` | Oui (D2ter) |
| 15 | `attestor` | `{kind:const "recorder", key:^([0-9a-f]{2})+$, sig?:^([0-9a-f]{2})+$}` | Oui (`sig` seule optionnelle) |
| 16 | `recorder_revision` | string `^ukemi-recorder@[0-9a-f]{64}$` | Oui |
| 17 | `observed_at` | `{clock:^[ -~]+$ minLen1, instant:int≥0}` | Oui (lignée) |

- `$schema` = draft 2020-12 ; `$id` = `https://monark.local/schemas/attested-book.schema.json` ; `title` = `AttestedBook`. **Conformes D1.**
- **`residual` enum D2ter FERMÉ, 6 valeurs exactes** : `no_third_party_verifier, oracle_price_as_read, oracle_source_as_read, rpc_quorum_2_keyless, block_timestamp_not_submission, emode_recompute_skipped`. `minItems:1`, `uniqueItems:true`. **Conforme.**
- **Description D3 verbatim** : extraction node du champ `description` (871 car.) vs `core + " " + complète` de l'ADR-U1b D3 (guillemets, `**` retirés) ⇒ **identiques caractère-par-caractère** (aucun index de divergence). **Conforme.**
- **Amendement D2** : `oracle_sources[].description` = `^[ -~]*$` (1 occurrence) ; les **3** autres `^[ -~]+$` (protocol, providers.name, observed_at.clock) intacts (grep : `*`=1, `+`=3). **Aucun `"type": "number"`** (grep = 0) ; 5 `"type": "integer"` (block.number, n_positions, quorum.required/achieved, observed_at.instant) ; uint256 en chaînes décimales (`debt_base`/`collateral_base` `^[0-9]+$`). **Conforme.**
- **Compile ajv strict** (`strict:true, allErrors:true, allowUnionTypes:true`, +ajv-formats) : `COMPILE: OK`.

### Sondes ajv (jeu du relecteur, indépendant des fixtures)

| Sonde | Instance | Attendu | Mesuré |
|---|---|---|---|
| A — valide minimal | 1 provider, `oracle_sources:[]`, `abstain{false,null}`, `residual:["no_third_party_verifier"]` | valide | **true** |
| B — abstention D4 | `abstain{true,"no_quorum"}`, `eligible{n_positions:0,"0","0"}`, `oracle_sources:[]`, `quorum{2,1}`, `holders_digest`=sha256("") | valide | **true** |
| B2 — shorthand ADR literal | `eligible.n_positions:"0"` (chaîne) | rejet (n_positions est `integer`) | **false** (→ O-1) |
| C — `abstain` oneOf (4 combos) | (false,null)✓ (true,no_quorum)✓ (true,null)✗ (false,no_quorum)✗ | 2 valides / 2 rejetées | **exactement** (le `oneOf` couvre les 4) |

- **Empty-set `holders_digest` dérivable** : `apps/sentinel/src/ukemi/book.ts` calcule `holders_digest = sha256(holders.join("\n"))` ; ensemble vide ⇒ `sha256("")` = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (recomputé `printf "" | sha256sum` = identique). Instance B valide avec cette valeur.

## 3. Binding TS (`packages/contracts/src/**`)

- **Drift ALLOWED_KEYS ⇔ schéma, deux sens** : `contracts.test.ts` « schema properties are IN SYNC » fait `deepEqual(propKeys(schéma), ALLOWED_KEYS)` (bidirectionnel) sur la **racine + les 7 sous-objets** (`attestedBookBlock/OracleSource/Eligible/Provider/Quorum/Abstain/Attestor`) **+ `observedAt`** réutilisé. Mesuré vert ; survivant S5 (cf. §5) confirme que la garde `additionalProperties` récursive rougit sur dé-synchro.
- **`assertClosedAttestedBook` récursif** : sonde du relecteur — clé `sneak` injectée à **chaque** niveau ⇒ **THROW aux 9 niveaux** (root + block, oracle_sources[0], eligible, providers[0], quorum, abstain, attestor, observed_at). Le code est **complet** (le test unitaire n'en exerce que 4/8 — O-3).
- **Enums runtime = schéma** : `enums.test.ts` `deepEqual(schéma.residual.enum, ATTESTED_BOOK_RESIDUALS)` et `deepEqual(schéma.abstain.reason.enum, ATTESTED_BOOK_ABSTAIN_REASONS)` (null en tête). Vert.
- **`serializeAttestedBook`** suit le motif fleet : `assertClosedAttestedBook(v)` → `assertNoForbiddenKey(v)` → `JSON.stringify(v)` (ordre d'insertion). La forme **canonique** (clés triées) est reléguée à `book-canonical.ts` (U-1b-b, D8). Conforme.
- **`forbidden-keys.json` inchangé** : sha LF `a4e93fd…` identique `0e2ff1e` vs `b64ca1b` (0 octet). Conforme D1.
- **`index.ts`** exporte types (`AttestedBook`, `AttestedBookResidual`, `AttestedBookAbstainReason`), enums, `assertClosedAttestedBook`, `serializeAttestedBook`. **Commentaire `index.ts:6` corrigé et vrai** : base `0e2ff1e` = « Upstream:  Shogen (AttestedPrice, a VERIFIED testimony). » (partiel — ignorait AttestedFlow) → gel `b64ca1b` nomme les 3 attestations (AttestedPrice/AttestedFlow VÉRIFIÉES ; AttestedBook AUTO-DÉCLARÉE, NO verifier, ADR-U1b). Item « commentaire » de l'ADR **résolu dans ce lot**.

## 4. `subject` (D2bis — approximation nommée, non-port de C1-C10)

Regex `^https://[a-z0-9-]+(\.[a-z0-9-]+)+(/[a-z0-9._~-]+)+$` testée sur 8 sujets :

| Sujet | Mesuré | Attendu D2bis |
|---|---|---|
| `https://monarkgate.tech/ukemi/book/weth/23545087.json` | accepté | oui |
| hôte MAJ `https://Monarkgate.tech/…` | rejeté | oui (C2/C3) |
| fragment `…/1.json#f` | rejeté | oui (C9) |
| userinfo `https://u@…` | rejeté | oui (C4) |
| dot-segment `…/book/../1.json` | **accepté** | oui — **non-port déclaré** (C6) |
| IPv4 `https://127.0.0.1/…` | **accepté** | oui — **non-port déclaré** (C3-IPv4) |
| port `…tech:8080/…` | rejeté | oui (C5) |
| `%20` | rejeté | oui (C7) |

Conforme : le schéma ne prétend pas « C1-C10 enforced » ; le motif strict (hôte pinné) vit dans `subject_pattern_subset_of_canonical` (M017 D5, non gelé). Le test asserte les deux faces (accept `..`/IPv4 explicitement).

## 5. Tests (10 nouveaux) + mutants

**10 nouveaux `test()`** (base 326 → 336) : schema.test +4 (residual enum/empty/dup ; `attested_book_abstain_coupling` ; non-decimal/method/sub-quorum/unknown ; `attested_book_description_may_be_empty`), enums.test +2 (residual enum ; abstain.reason enum null-inclus), closed-check.test +2 (price/peg_score ; récursif), attested-book.test +2 (`…_no_probative_claim` ; `subject_pattern_subset_of_canonical`). Scrub PROBATIVE = **byte-identique** à `attest.test.ts:109` (`/\blive\b|\bverified\b|\bprobative\b|\bp_correct\b|\bconfidence\b/i`) — vérifié.

### 7 mutants replay (chacun : mutation en copie → test ciblé → restauration → sha=baseline)

| # | Mutation | Test ciblé | Attendu | **Mesuré** | Restauration sha |
|---|---|---|---|---|---|
| a | `+price` sur l'enveloppe (fixture) | contracts.test | ROUGE (serialize throw) | **RED** | fixtures `085b894…` OK |
| b | `residual:[]` (fixture) | schema.test | ROUGE (minItems:1) | **RED** | fixtures `085b894…` OK |
| c | `abstain{value:true,reason:null}` **ET** `{value:false,reason:"no_quorum"}` (fixture) | schema.test | ROUGE ×2 (oneOf, les 2 sens) | **RED / RED** | fixtures `085b894…` OK |
| d | 1 octet schéma (double espace `archive  block`) | contracts_frozen | ROUGE (manifest sha) | **RED** | schéma `d5b1bee…` OK |
| e | `verified` inséré dans `description` | attested-book.test | ROUGE (jeton probatif) | **RED** | schéma `d5b1bee…` OK |
| f | `schemas===6` (revert du 7) | contracts_frozen | ROUGE (compte) | **RED** | test `7e9cd16…` OK |
| g | pattern `*`→`+` (vide re-rejeté) | schema.test | ROUGE (`""` rejeté) | **RED** | schéma `d5b1bee…` OK |

Restauration finale globale : **sha=baseline OK** pour les 3 fichiers mutés. « proven » : la regex probative ne couvre que `live/verified/probative/p_correct/confidence` — « proven » ne rougit **pas** le test d'honnêteté (non nommé) ; c'est intentionnel (D3 ne police que les jetons listés). *Non-défaut* : la description ne contient aucun de ces jetons hors négations masquées.

### Chasse aux survivants (tests sémantiques S=schema E=enums C=contracts A=attested-book ; F=gel)

La garde `contracts_frozen` (F) rougit sur **tout** octet modifié dans `schemas/` ou `packages/contracts/src/` (prouvé par mutant d : 1 octet ⇒ RED). Elle attrape donc **tous** les survivants ci-dessous. La question de la revue = **quel test SÉMANTIQUE** attrape (défense en profondeur, utile si un futur re-baseline change ET le schéma ET le manifest) :

| Survivant (mutation structurelle) | S | E | C | A | Attrapé par un test sémantique ? |
|---|---|---|---|---|---|
| S1 `subject` groupe chemin `+`→`*` (URL sans chemin acceptée) | vert | vert | vert | vert | **NON — survit** (freeze seul) |
| S2 `oracle_sources.uniqueItems` retiré | vert | vert | vert | vert | **NON — survit** (freeze seul) |
| S3 `providers.minItems` retiré (providers vide accepté) | vert | vert | vert | vert | **NON — survit** (freeze seul) |
| S4 `no_third_party_verifier` retiré de l'enum | **RED** | **RED** | vert | vert | Oui (schema+enums) |
| S5 `block.additionalProperties`→`true` | vert | vert | **RED** | vert | Oui (contracts, récursif) |
| S6 clé `required` retirée (`book_digest`) | vert | vert | vert | vert | **NON — survit** (freeze seul) |

→ **O-2** : S1/S2/S3/S6 ne sont attrapés QUE par la garde de gel (hermétique pour la zone gelée : le schéma est octet-figé, aucune mutation ne peut atterrir sans re-baseline ADR). `residual`.uniqueItems/minItems SONT testés (mutant b) ; `additionalProperties` et l'enum SONT gardés sémantiquement. **Aucun défaut vivant** (les contraintes S1/S2/S3/S6 sont PRÉSENTES et correctes dans le schéma gelé ; `subject` est une approximation déclarée dont la frontière réelle est le gabarit recorder + motif M017).

## 6. Surface publique (C-9)

| Emplacement (mesuré) | Contenu | Verdict |
|---|---|---|
| `README.md:17` | « the **six frozen interface contracts** (the sixth, AttestedBook, upcoming… » | OK |
| `README.md:40` | Backbone **Built** — « six frozen contracts (the sixth, AttestedBook, upcoming until served)… » | OK (compte de schémas gelés ; le 6ᵉ qualifié upcoming) |
| `README.md:106` | « ## Six frozen contracts » | OK |
| `README.md:117` | ligne AttestedBook : « **Upcoming until served** (schema frozen; the served path is wired at U-6) » | OK |
| `README.md:178` | « it compiles the **six frozen JSON Schemas** » | OK (6 schémas compilés par ajv) |
| `README.md:58` | AttestedFlow « the **fifth** frozen typed contract » | **reste vrai** (tâche disait `:57`) |
| `apps/site/lib/narabi-copy.ts:14` | « AttestedFlow is the **fifth** frozen typed contract. » | **reste vrai** |
| `apps/site/app/roadmap/page.tsx:40` | prose rendue « six frozen contracts (the sixth, AttestedBook, upcoming until served) » | OK (mots, **aucun chiffre** rendu ; test 44 vert) |
| `apps/site/app/how/page.tsx:53,55` | commentaires `//` (non rendus) : AttestedFlow=5ᵉ, AttestedBook=6ᵉ parallèle | OK |

« Six » / « sixth » = mots (pas de littéral numérique rendu) ; `site_renders_only_committed_data (b)` vert (aucun digit rendu). Régime **T0** (ADR-M013) : roadmap prose + how commentaire, aucun composant nouveau. vocab/lang-gate/export **verts** (§1).

## 7. CA-11 (branchement)

- `apps/site/lib/fleet.ts` **intact** (sha LF `ad26f8d…` identique `0e2ff1e`↔`b64ca1b`) ; absent du diff.
- **Aucun registre ne déclare `AttestedBook` built** (grep `apps/site/**` + « built » = NONE). Le README dit partout « **upcoming until served** ».
- Chemin servi = **U-6** (`/ukemi/*`, Caddy) ; consommateur = **aucun** en U-1b-a (adaptateur `fromAttestedBook` = U-1b-b ; consommation gate = U-4).
- **ADR-U1b D7** déclare les tuyaux (entrée recorder U-1a, sortie fichiers `/ukemi/` en U-6, résidu→verdict en U-4) + « non branché, formé avec déclencheur ». Conforme à la règle Branchement.

## 8. Cohérence inter-ADR

- **Amendement D2 (description vide) ↔ ADR-U1 D1/D3** : le revert **CONCORDANT** de `description()` ⇒ `""` = valeur du champ au digest (fait on-chain, oracle GHO `0xd110cac5…` sans `description()`) — ADR-U1 « Amendement 2026-09-19 (checkpoint-2 V-1) » D1/D3 amendés ; `book.ts` code cohérent (`catch ConcordantRevertError ⇒ description=""`). Le schéma `^[ -~]*$` admet exactement cette valeur. **Cohérent.**
- **`book_digest` double domaine (D3/D4)** : la description gelée le dit — « SHA-256 of the canonical book when recorded, or of the canonical abstention record when the whole read abstained ». **Cohérent.**
- **M008 D9 renvoi daté « 5 → 6 »** : présent (« Renvoi 2026-09-19 (ADR-U1b D1) — doctrine « 5 gelés » → SIX », `forbidden-keys.json` inchangé, `schemas===7`). **Cohérent.** M001 D9 : `schema_version` = propriété d'instance départ `1.0.0` (le schéma n'y met pas de `const`, comme les 5 aînés).
- **O-4** : ADR-U1 D10(b) esquissait AttestedBook avec `utterance.hash=book_digest` et `residual=[rpc_quorum_2,…]` ; l'ADR-U1b **raffine** (champ `book_digest` direct sans enveloppe `utterance` ; `rpc_quorum_2_keyless`). ADR-U1b fait foi pour le contrat (D2 « AttestedBook a SES champs ») ; divergence assumée et documentée.

## 9. Gel (zone gelée)

- **Manifest = sha LF réels** : recompute indépendant (méthode identique au test : `readFileSync().toString('utf8').replace(/\r\n/g,'\n')` puis sha256) des **15** entrées (8 `packages/contracts/src/` + 7 `schemas/`) ⇒ **toutes concordent**. `attested-book.schema.json` = `d5b1bee…`.
- **`contracts_frozen` compte 7** (`schemas/` = 7 : 6 schémas + `forbidden-keys.json`) ; message « expected: **6 schemas** (…) + forbidden-keys.json » ; en-tête re-baseline « ADR-U1b D1 … the **6th** ». Conforme.
- **Les 5 schémas gelés + `forbidden-keys.json` = 0 octet de diff** : sha LF `0e2ff1e` == `b64ca1b` pour attested-flow/attested-price/coverage-verdict/gate-decision/prediction/forbidden-keys (tous SAME). Conforme.
- **G1 §sha vérifié** : les 12 sha LF du G1 §1 (fixtures, 6 tests, manifest, README, roadmap, how, schéma) recomputés = **tous concordent**.

## 10. Fusion

`git merge-tree --write-tree lot/etude-suite lot/u-1b-a` ⇒ exit 0, arbre `15837f0…`, **aucun marqueur de conflit**. Mesuré : `lot/etude-suite` (tip `ac8e1be`) **n'a pas touché** `README.md` ni `apps/site` depuis `0e2ff1e` (diff vide) ⇒ pas de recouvrement avec E-honnêteté ; **fusion propre**. *Qualification* : si E-honnêteté modifie ensuite les mêmes lignes README, un conflit pourrait naître alors — non présent à ce tip.

---

## Observations (items formés, déclencheur, zéro dette) — non bloquantes

- **O-1 — prose D4 `eligible={"0","0","0"}`.** Raccourci d'ADR : `n_positions` est un **integer** au schéma ; l'instance d'abstention correcte porte `n_positions:0` (int), pas la chaîne `"0"` (sonde B2 : rejet correct). `error_origin` = rédacteur ADR-U1b (prose). **Déclencheur : U-1b-b** — l'adaptateur émet `n_positions` en entier (types.ts le type déjà `number`). Aucun changement de l'artefact gelé.
- **O-2 — couverture de mutation sémantique.** S1 (`subject` quantificateur de groupe `+`→`*`), S2 (`oracle_sources.uniqueItems`), S3 (`providers.minItems`), S6 (clé `required` retirée) ne sont attrapés que par la garde de gel (hermétique ici : mutant d prouve qu'1 octet rougit `contracts_frozen`, qui compare le sha de chaque fichier au manifest). **Fait porteur (pourquoi O et non C)** : `contracts_frozen` ne parcourt QUE `schemas/` et `packages/contracts/src/` (`walk()` sur ces deux dossiers) — les fichiers de test (`packages/contracts/test/**`, `test/*.test.ts`) **ne sont PAS gelés** ; les renforcer **n'exige ni ADR ni re-baseline**, et l'artefact gelé reste octet-correct (contraintes S1/S2/S3/S6 présentes et justes). `error_origin` = rédacteur des tests. **Déclencheur : tout futur re-baseline de `attested-book.schema.json` (bump `schema_version`/ADR) OU avant le service U-6** — ajouter aux tests non gelés : cardinalité `oracle_sources.uniqueItems`/`providers.minItems`, rejet d'une clé `required` manquante, non-vacuité chemin/hôte `subject`.
- **O-3 — récursion closed-check sous-testée.** `assertClosedAttestedBook` throw aux 9 niveaux (prouvé) mais `closed-check.test.ts` n'exerce que root+block+abstain+oracle_sources (4/8 imbriqués). `error_origin` = rédacteur des tests. **Déclencheur : même lot que O-2** — ajouter eligible/providers/quorum/attestor/observed_at. Code correct.
- **O-4 — esquisse ADR-U1 D10(b) vs contrat final.** Divergence assumée (`utterance.hash`→`book_digest` direct ; `rpc_quorum_2`→`rpc_quorum_2_keyless`) ; ADR-U1b fait foi. **Déclencheur : néant** (documenté). Signalé pour la traçabilité du réviseur.
- **O-5 — « proven » hors du scrub PROBATIVE.** Le scrub `attested_book_description_no_probative_claim` réutilise la regex byte-identique à `attest.test.ts:109` (`/\blive\b|\bverified\b|\bprobative\b|\bp_correct\b|\bconfidence\b/i`) : elle ne police **pas** « proven » (mesuré). Non-défaut : la `description` gelée ne contient aucun « proven » (ni aucun jeton probatif hors négations masquées) ; le mutant e (« verified » inséré) rougit bien. `error_origin` = doctrine flotte. **Déclencheur : extension éventuelle de la regex PROBATIVE à l'échelle de la flotte** (jamais dans ce lot). Traçabilité seule.

## Modes MAST couverts
Dérive contrat↔binding : gardée (drift both-ways S5, gel). Sur-revendication : contrée (description verbatim + scrub probatif mutant e + D3). Fixture auto-enregistrée : sondes ajv **indépendantes** du relecteur (§2). Terminaison prématurée : CA-11 « upcoming » + registre intact.

---
*Revue G2 fraîche — relecteur `claude-opus-4-8[1m]`, effort max, contexte frais, 2026-09-19. Copie `git archive b64ca1b` dans `F:\tmp\g2-u1b-a` + `npm ci` (jamais de jonction). Ne committe pas (R-20). Verdict adversarial final + commit = orchestrateur `claude-fable-5-1` (R-21).*
