# G2 delta — lot U-1b-a-bis — delta `4a15e5b → 8fa12ea` (branche `lot/u-1b-a`)

## Verdict : **CONFORME**
Aucun C-n bloquant. Le delta implémente exactement V-6 voie (b) (décision investisseur 33, cf. §26/33) :
`residual` porte `"contains": {"const": "no_third_party_verifier"}`, invariant désormais imposé par le
schéma gelé, re-baseline byte-exact, sans bump `schema_version` (Option A). Observations non bloquantes :
**I-2** (en-tête de commentaire du garde de gel, item worker à corriger — hors zone gelée) et **O-1**
(nouvelle : divergence ci.yml D9 septies, hors delta, merge unilatéral propre) ; **I-1** non-défaut (record
G1 daté), **I-3** déjà fermé par `18992f9`.

## RAPPORT worker (`docs/RAPPORT-lot-u1b-a-bis.md`) — re-mesuré : **0 affirmation fausse**
Toutes les affirmations vérifiables du rapport ont été re-jouées indépendamment et **concordent** :
- shas nouveaux `8ba71122…`/`d50f5c51…` et anciens `d5b1bee…`/`4d912d41…` (canonicaliseur Python) ✓
- schéma 5812→5870 octets (+58), manifest 1615→1615, LF pur (crlf=0) ✓
- diff = 1 ligne `contains` entre `uniqueItems` et `items` ; 17 required, D3 871, enum 6, addProps:false ✓
- oracle 337/337 (= 336 + 1), lint 0, ratchet 69/69, lang-gate 0, export:check 0 ✓
- mutant M1 : (b) rouge + `contracts_frozen` rouge, revert byte-exact `d5b1bee…` (messages verbatim) ✓
- sondes ajv (a)/(b)/abstention/`description:""` + refus par mot-clé `contains` ✓
- `ALLOWED_KEYS`/census inchangés, `src/**` intact, `schema_version` non bumpée ✓
- R-25 : 604 (D9 septies) et 721 (worktree) — les deux ≤ 1205 ✓ (le rapport donnait aussi 604/721)
- items I-1/I-2/I-3 formés avec déclencheur ; §26/33 double-citation légitime ✓
Nuance : le rapport worktree parlait de scénarios 589/594/615/721 (état arbre-de-travail avec RAPPORT
non suivi) ; à `8fa12ea` les 5 fichiers sont committés, le décompte trois-points est **721** (pathspec
worktree) / **604** (D9 septies) — cohérent avec les bornes du rapport, aucune contradiction.

## Provenance
- **Relecteur G2** : Opus 4.8, instance séparée, contexte frais. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`**
  (préfixe `claude-opus-4-8` conforme ; roster mainteneur 2026-08-14, Opus 5 banni). Effort `max`.
- **Date** : 2026-09-19. **Ni commit ni `git` d'écriture (R-20).** Écritures sous `F:\tmp\g2-u1bbis\` seulement.
- **Extraction vérif** : `git -C F:\Monark-wt-u1b archive 8fa12ea | tar -x -C F:/tmp/g2-u1bbis/tree` ;
  `npm ci --cache F:/tmp/npm-cache` (exit 0, 0 vuln). Node v24.15.0. `TEMP/TMP=F:/tmp`.
- **Canonicaliseur sha indépendant** (Python, distinct du Node projet) : `F:/tmp/g2-u1bbis/canon.py` —
  bytes bruts → `replace(b"\r\n",b"\n")` → `sha256` hex (équivalent byte-exact à `contracts-frozen.test.ts:40-44`).
- **Split générateur/committer (traçabilité)** : code généré par le worker Opus 4.8 (`claude-opus-4-8[1m]`,
  RAPPORT §Provenance) ; commit `8fa12ea` co-signé **Fable 5.1** = l'orchestrateur committe (R-20 respecté,
  le worker ne committe jamais).

## (1) Périmètre du delta — exactement 5 fichiers
`git diff --numstat 4a15e5b 8fa12ea` :
| Fichier | + | - | Attendu | OK |
|---|---|---|---|---|
| `docs/RAPPORT-lot-u1b-a-bis.md` (A) | 106 | 0 | nouveau | ✓ |
| `docs/adr/ADR-U1b-contrat-attestedbook.md` (M) | 2 | 2 | ADR 2 lignes | ✓ |
| `packages/contracts/test/schema.test.ts` (M) | 18 | 0 | test +18 | ✓ |
| `schemas/attested-book.schema.json` (M) | 1 | 0 | schéma +1 | ✓ |
| `test/contracts-frozen.manifest.json` (M) | 1 | 1 | manifest 1 valeur | ✓ |

`4a15e5b..8fa12ea` = **un seul commit** (8fa12ea). Le fichier de test modifié (+18) est
`packages/contracts/test/schema.test.ts` (sonde ajv), **pas** `test/contracts-frozen.test.ts` (garde de
gel, non modifié → O-2).

**Schéma — changement unique.** `git diff` = insertion d'UNE ligne entre `"uniqueItems": true,` et
`"items": {` : `      "contains": { "const": "no_third_party_verifier" },`. Comparaison structurelle
`8fa12ea` (via `json.load`) :
- 8 clés racine (`$schema,$id,title,description,type,additionalProperties,required,properties`) — inchangé
- **17 `required`** (comptés) — inchangé
- **description D3 = 871 code points** (873 octets utf-8 ; 1 non-ASCII = em-dash U+2014) — inchangé
- `additionalProperties: false` (racine) — inchangé
- `residual.items.enum` = **6 valeurs** (`no_third_party_verifier, oracle_price_as_read,
  oracle_source_as_read, rpc_quorum_2_keyless, block_timestamp_not_submission, emode_recompute_skipped`) — inchangé
- `residual.contains = {"const":"no_third_party_verifier"}` — **ajouté** (la seule modification)
- Taille 5812 → 5870 octets (+58 = longueur de la ligne insérée), LF pur (crlf=0)

## (2) SHA LF recomputés (canonicaliseur Python indépendant)
| Artefact | Recomputé | Attendu | OK |
|---|---|---|---|
| `schemas/attested-book.schema.json` @8fa12ea | `8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b` | `8ba71122…` | ✓ |
| `test/contracts-frozen.manifest.json` @8fa12ea | `d50f5c51921dc89dce8bd7996e96ded056a973d34b29e7926fd5a7de33d99066` | `d50f5c51…` | ✓ |
| `schemas/attested-book.schema.json` @4a15e5b | `d5b1beeab23482322da59041b9e62874a74c4cd53f55d7b730a7c150975da3cd` | `d5b1bee…` (ancien) | ✓ |
| `manifest` @4a15e5b | `4d912d4160e0fa1eb137c54a58b24ab1f7dad61d9ef336ac55bf01c1d974f245` | `4d912d41…` | ✓ |

**Lien lignée** : schéma+manifest @`b64ca1b` (candidat gelé checkpoint-2) recomputés = `d5b1bee…` /
`4d912d41…` — **identiques à `4a15e5b`** ⇒ la zone gelée est byte-inchangée entre `b64ca1b` et `4a15e5b`
(le commit intermédiaire `b64ca1b..4a15e5b` = doc ADR-U1b checkpoint-2 seul) ; le 336/336 du checkpoint-2
se reporte. Le nouveau sha manifest inscrit `d50f5c51…` correspond bien au nouveau sha schéma `8ba71122…`.

## (3) Mutants (le test ET le gel ont des dents) — restauration sha-exacte entre chaque
| Mutant | Effet schéma | Test sonde | Garde de gel `contracts_frozen` |
|---|---|---|---|
| **M1** : retirer la ligne `contains` | sha → `d5b1bee…` (**revert byte-exact à 4a15e5b/b64ca1b**, 1 occurrence) | `attested_book_residual_always_names_no_third_party_verifier` **ROUGE** — `AssertionError: residual omitting no_third_party_verifier must be refused` | **ROUGE** — `content modified in the frozen zone: schemas/attested-book.schema.json (ADR required)` |
| **M2** : `const` → `oracle_price_as_read` | sha → `0b51913…` (5867 o) | (a) `["no_third_party_verifier"]` **ROUGE** ; + `valid fixtures pass their schema`, `attested_book_abstain_coupling`, `attested_book_description_may_be_empty` ROUGES (fixture ne contient pas `oracle_price_as_read`) | — |
| **Restauration** | sha → `8ba71122…` (5870 o) ✓ | oracle complet **337/337** re-vert | vert |

M1 prouve le double-verrou : la sonde ajv attrape l'omission de l'invariant, et le garde de gel attrape
la dérive d'octets. M2 prouve que la valeur `no_third_party_verifier` du `const` est load-bearing (pas
n'importe quel résidu de l'enum).

## (4) Sondes ajv indépendantes (`F:/tmp/g2-u1bbis/tree/g2probe.mjs`, ajv-2020 + ajv-formats du tree)
9/9 PASS :
- base fixture **valide** ; `abstain {value:true, reason:"no_quorum"}` **valide** (D4 couplé) ;
  `abstain {true,null}` et `{false,reason}` **rejetés** (D4 découplé, `oneOf`)
- `oracle_sources[].description = ""` **valide** (amendement D2, `^[ -~]*$`)
- `residual: ["oracle_price_as_read"]` (dans l'enum, unique, non vide) **rejeté** avec
  `errors.some(e => e.keyword === "contains")` = vrai (erreur verbatim :
  `schemaPath "#/properties/residual/contains", "must contain at least 1 valid item(s)"`)
- `residual: ["no_third_party_verifier"]` seul **valide** ; `residual: []` rejeté (minItems) ;
  `residual: ["price_as_read"]` rejeté (enum)

## (5) Census de clés / zone gelée `src` / `schema_version`
- `ALLOWED_KEYS.attestedBook` (`closed-check.ts:28-31`) est une liste de **clés de données** (property
  names) ; `residual` y figure déjà (pré-existant) ; `contains` est un **mot-clé JSON-Schema**, pas une
  clé de données ⇒ **aucune clé de données nouvelle**, `ALLOWED_KEYS`/census **inchangés**.
- **`packages/contracts/src/**` intact** : le delta ne touche aucun fichier `src/` (5 fichiers, aucun sous
  `src/`) ; le diff manifest ne change QUE la ligne du schéma — tous les sha `packages/contracts/src/*.ts`
  sont inchangés (preuve directe d'intégrité byte).
- **`schema_version` NON bumpée** : le schéma n'a pas de `const` de version (pattern `^\d+\.\d+\.\d+$`
  seul) ; fixture `"1.0.0"` inchangée ; ADR D2ter déclare explicitement « **sans** bump `schema_version`,
  Option A / M001 Déc. 9 ». Le re-baseline du manifest est le mécanisme Option A. Conforme.

## (6) Oracle complet + gates (dans le tree extrait, node_modules propre)
| Gate | Commande | Résultat |
|---|---|---|
| ci | `npm run ci` | **337/337**, fail 0 ; gate:vocab 156 fichiers OK ; tsc 0 |
| lint | `npm run lint` (eslint .) | exit 0 |
| ratchet | `npm run lint:ratchet` | **69/69** (plafond 2026-09-16), exit 0 |
| lang-gate | `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | 0 hit non-exempt, exit 0 |
| export:check | `npm run export:check` | 0 chemin interdit, 0 hit FR hors exemption, exit 0 |

Tests nommés verts : `attested_book_residual_always_names_no_third_party_verifier`,
`attested_book_abstain_coupling`, `attested_book_description_may_be_empty`,
`attested_book_description_no_probative_claim` (honnêteté). 337 = 336 baseline + 1 nouveau test.
Aucun faux-rouge « git ls-files » (les scripts n'exigent pas de `.git`).

## (7) R-25 + merge-tree
- **Borne** : `VIBEGATES_PR_LIMIT="1205"` (ci.yml, ADR-M003 D9) — vérifiée, non supposée.
- **R-25 avec le pathspec `lot/etude-suite:ci.yml:52` (D9 septies, `docs/**/*.md` exclus — autoritaire pour
  la cible de fusion)** : `git diff --shortstat lot/etude-suite...8fa12ea -- <pathspec>` = **604** ≤ 1205. ✓
- R-25 avec le pathspec propre au worktree (8fa12ea, **sans** D9 septies) : **721** ≤ 1205. ✓
  (Le worktree a divergé avant l'ajout de D9 septies sur `lot/etude-suite` ; le delta ne touche pas ci.yml.)
- Trois-points **HEAD-indépendant** : merge-base = `0e2ff1e` pour tous les tips `lot/etude-suite`.
- **merge-tree `--write-tree` propre (exit 0, aucun conflit)** contre les trois tips successifs de
  `lot/etude-suite` observés pendant la revue : `5e247ac`, `18992f9`, `6515a3a`. La divergence ci.yml est
  **unilatérale** (lignée du lot `0e2ff1e..8fa12ea` ne touche jamais ci.yml ; seul le côté etude-suite l'a
  modifié pour D9 septies) ⇒ pas de conflit ; après fusion, le ci.yml d'etude-suite (D9 septies) prévaut.
  (Différent du cas `c2199f0` lot-t1a-ii-a où les DEUX côtés touchaient ci.yml.)

## (8) Items I-1/I-2/I-3 du worker — qualification
- **I-1** `docs/G1-lot-u1b-a.md` cite l'ancien sha `d5b1bee…` (l.14,115,116,118,143) et l'ancien manifest
  `4d912d41…` (l.27) : **record daté du G1 d'origine** (état `b64ca1b`), **absent du manifest gelé**,
  **exclu de R-25** deux fois (`docs/G1-lot-*.md` + D9 septies). Correct au moment du G1 (les mutants d/e/g
  qu'il documente référençaient `d5b1bee…` alors juste). **Non-défaut** ; annotation « superseded by
  U-1b-a-bis » = décision documentaire de l'orchestrateur. `error_origin` : néant (record historique juste).
- **I-2 (item worker, G2-qualifié)** `test/contracts-frozen.test.ts` (en-tête l.5, titre l.59) énumère les re-baselines
  jusqu'à ADR-U1b D1 **sans** U-1b-a-bis : commentaire **incomplet, pas faux** ; fichier **hors zone gelée**
  (sous `test/`, pas dans le manifest) ⇒ mise à jour = 0 sha changé, 0 comportement changé. **Non bloquant,
  à corriger.** `error_origin` : périmètre de la liste fermée (items 1-5 ne l'incluaient pas) ; le worker
  l'a correctement formé avec déclencheur (« cette G2 fraîche »). Recommandation (avis, non verdict) :
  l'orchestrateur peut plier la mise à jour de l'en-tête ; non bloquant pour la conformité du delta.
- **I-3** `docs/CHECKPOINT2-lot-u1b-a.md:20-21` (anciens sha) : **déjà résolu** par le commit `18992f9`
  d'etude-suite (« signature object updated to U-1b-a-bis (8fa12ea) shas; old d5b1bee caduc (I-3) »), qui
  ajoute le nouvel objet de signature `8ba71122…`/`d50f5c51…` (recomputés indépendamment ci-dessus =
  concordants). Fermé.

## §26/33 — citation de décision (résolue contre le registre primaire)
ADR D2bis/D2ter + RAPPORT citent « décision investisseur **26/33** » ; le commit `8fa12ea` et le
CHECKPOINT2 (`18992f9`) citent « décision **33** ». Registre `F:\PRODUITS\etude-2026-09-19\` +
`docs/CHANTIERS.md:89` : **décision 26** = « U-1b-a V-6 : avis d'expert orchestrateur rendu (reco (b)),
signature en attente » ; **décision 33** = « U-1b-a V-6 = (b) `contains const` avant gel — lot U-1b-a-bis
lancé ». « 26/33 » est donc une **double-citation légitime** (26 = avis rendu, 33 = confirmation/lancement),
pas une contradiction ; la citation du worker est plus complète. **Non-défaut.**

## O-1 (nouvelle observation G2, non bloquant) — divergence ci.yml D9 septies
Le ci.yml à `8fa12ea` (hérité pré-bis) n'a pas encore l'exclusion D9 septies présente sur `lot/etude-suite`.
Hors delta (le delta ne touche pas ci.yml), merge unilatéral propre (cf. §7). Sans effet sur la conformité ;
signalé pour la fusion (etude-suite prévaut). `error_origin` : lignée de branche (pas le worker du delta).

## Preuve de non-écriture (R-20)
- `git -C F:\Monark status --porcelain` : **vide** (propre). `git -C F:\Monark-wt-u1b status --porcelain` :
  **vide** (propre). HEAD worktree = `8fa12ea` (inchangé). `lot/etude-suite` a avancé
  `18992f9 → 6515a3a` **par l'orchestrateur** pendant la revue (commits docs CENSUS/CHECKPOINT2), jamais
  par moi. Aucune écriture sur C: par le relecteur (les logs de tâches en arrière-plan sont écrits par le
  harness, propriété harness). Toutes mes écritures sont sous `F:\tmp\g2-u1bbis\`.
- Aucun commit, aucun workflow déclenché.

## Reproduction (commandes clés)
```
git -C F:\Monark-wt-u1b archive 8fa12ea | tar -x -C F:/tmp/g2-u1bbis/tree
cd F:/tmp/g2-u1bbis/tree && npm ci --cache F:/tmp/npm-cache
python F:/tmp/g2-u1bbis/canon.py tree/schemas/attested-book.schema.json tree/test/contracts-frozen.manifest.json
npm run ci ; npm run lint ; npm run lint:ratchet ; node scripts/lang-gate.mjs --scope root,contracts,schemas,site ; npm run export:check
node tree/g2probe.mjs
git -C F:/Monark diff --shortstat "lot/etude-suite...8fa12ea" -- . ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.json' ... (pathspec ci.yml:52)
git -C F:/Monark merge-tree --write-tree lot/etude-suite 8fa12ea ; echo $?
```
