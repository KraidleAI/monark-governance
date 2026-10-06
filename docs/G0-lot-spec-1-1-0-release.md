# G0 du lot SPEC-1-1-0-RELEASE : la version `contract-1.1.0` du dépôt de la spécification

- **Demande** : MONARK, message `8e51063` (recherches), « Ta colonne » point 1. La décision de l'investisseur sur B-1 est « Tout ensemble, plus tard » : une seule release complète. Les actes sur l'hôte attendent ce lot.
- **Cadre** :
  - relecture de T0, B-1 (`recherches` `d6ac931`) ;
  - G0 et G7 de SPEC-PUBLISH-PIPELINE-1 (§3 « contract-1.1.0 », Q-SP-1 à Q-SP-6, et la scission qui renvoie ici la déclaration et I-2) ;
  - `docs/ETAT.md:852-860` ;
  - note de version `NOTICE-1-1-0.md` §5.
- **Base** : `597a986d` (`base/chantier-moteur-2026-10-03`). Branche : `recherches/spec-1-1-0-release`. Auteur : RECHERCHES.
- **Hors périmètre** : toute publication, tout envoi, toute poussée. `spec-publish` n'est lancé qu'en `plan` (lecture seule) ou vers un `--out` du répertoire de travail temporaire. Aucun octet servi par le harnais ne change. `schemas/` et `packages/contracts/src/` sont gelés et ne sont pas touchés.

## 0. Résultat du G0 : arrêt sur une question bloquante

**Aucun texte publiable de la spécification 1.1.0 n'existe.**
- La seule source est le brouillon `recherches` `coordination/pieces/2026-10-04-contrat-1-1-0-r3/SPEC-1-1-0-brouillon.md` (sha256 `975bb40c…7b9d`, figé par `SHA256SUMS`). Il est en-tête « DRAFT, not published (revision r3) ».
- Il porte encore 8 **TBD** : les empreintes des vecteurs du §2, les vecteurs de h\*, la liste des colonnes au §10, l'inversion des empreintes de courtes suites au §10, les vecteurs du §11, un vecteur du §12 bis, D et la date d'effet au §14.
- La liste r4 (`2026-10-04-contrat-1-1-0-r4-liste/LISTE-REVISION.md`) tient 17 corrections non portées. La n° 6 est marquée « avant F-5a ».
- Passé tel quel à la porte de `spec-publish` (`contentProblems`, sorte `text`), il est refusé, avec 16 problèmes :
  - 10 `private` (le nom du dépôt privé) ;
  - 4 `k` (« lot CM-2a », « lot CM-4a », 2 × « lot CM-4b ») ;
  - 2 `q3` (« budget »).
- Aucun texte 1.1.0 n'existe dans ce dépôt : il n'y a ni `spec/`, ni `GATE-CONTRACT.md`. Le `KATA-SPEC.md` de `recherches` est toujours la version 2026-10-02, déjà publiée à `ddfee9e` ; la clarification de ses §2 et §5, prévue au §3 du G0 du pipeline, n'est pas écrite. Les vecteurs `contract-1.1.0` n'existent pas non plus.

Or la note de version, §5, dit : « The specification of version 1.1.0 […] published at https://github.com/KraidleAI/monark-kata-spec ». Une version `contract-1.1.0` sans ce texte rendrait le §5 faux. Conformément à la consigne, aucune spécification n'est inventée : **le lot s'arrête au G0**. Le reste du dessin (§1 à §5) est prêt et ne dépend du texte que par son entrée dans la liste.

## 1. Périmètre fermé et fichiers publiés

La version `contract-1.1.0` de `scripts/spec-publish-inputs.json` a `previous_commit` `ddfee9e076d979081fa7b21ec27940e3556bacf7`, tête publiée mesurée au G7 du pipeline (à reconfirmer, Q-2). Ses entrées, toutes épinglées par sha256 :

| Sortie | Racine : chemin | Sorte | Format |
|---|---|---|---|
| `GATE-CONTRACT.md` | `governance:spec/contract-1.1.0/GATE-CONTRACT.md` | `text` | **absent (Q-1)** |
| `KATA-SPEC.md` | `previous:KATA-SPEC.md`, ou la clarification (Q-1) | `text` | Markdown, LF |
| `reports/README.md`, `reports/wave1-report.md`, `vectors.json` | `previous:` même chemin (règle « publié, jamais retiré » ; Q-SP-1 et Q-SP-2 du pipeline) | `text`, `json` | inchangés |
| `schemas/<nom>.schema.json` × 5 | `governance:spec/contract-1.1.0/schemas/<nom>.schema.json` | `schema` | copie publiée (§3) |
| `policy/<task_class>.json` × 35 | `governance:spec/contract-1.1.0/policy/<task_class>.json` | `policy-table` | écriture canonique, une ligne, sans LF final (§2) |

Plus `VERSION` (la date T0) et `MANIFEST.sha256`, écrits par l'outil.

- **35 tables, et non 34** : le bloc C a ajouté `cascade-liquidable-24h` (`policy-served.ts`), servie avec 0 ligne. Les 35 sont donc les 32 tables kata (0 ligne, B-9), `stable-run-velocity-24h` (1 ligne), `liquidation-eligible-coverage` (1 ligne, strate s0) et `cascade-liquidable-24h`.
- Les sources sont rangées sous `spec/contract-1.1.0/` selon l'arborescence publiée : chaque `path` vaut `spec/contract-1.1.0/<out>`. `spec/` n'est pas dans la liste blanche de l'export public (`export-public.mjs:56`) et n'est pas sur sa liste noire structurelle, que `spec-publish` refuse en entrée.
- Hors de `schemas/` à dessein : `contracts_frozen` parcourt tout `schemas/` (`test/contracts-frozen.test.ts`), et un fichier de plus y rougirait le gel.

**Ce que les tables contiennent** (mesuré à `597a986d`). Aucune série et aucun score brut. Les deux lignes marginales portent :
- `n`, `qhat`, `alpha` et `scores_sha256`, déjà servis dans le verdict (`n_calib`, `qhat`, `scores_sha256`) ;
- `p_served` et `marginal_alpha`, fonctions de `n` et `alpha` ;
- `source` : `fixtures/usde-calib-scores.json` et `scripts/record-usde-calib.mjs` d'une part, déjà dans l'export public mesuré par `collectFiles` ; d'autre part `sha256:fd6fab7e…` et `scripts/record-u4b-calib.mjs`, ce dernier hors export, nommé seulement ;
- `text`, la phrase servie.

Les 35 octets canoniques passent la porte (0 problème). Rien n'y est donc publié pour la première fois, hormis deux noms de scripts.

## 2. Les tables : un écrivain du dépôt, jamais à la main

- **Écrivain** : `scripts/spec-policy-tables.mjs`, Node 24, `--write` ou `--check`.
  - Il importe `SERVED_POLICY_TABLES` de `apps/harness/src/tools/gate.ts`, c'est-à-dire la valeur même que le service construit au chargement (`kataTablesHoldNoRow(servedPolicyTables(SERVED_TABLE_TEXTS))`). Il n'y a pas de seconde construction.
  - Il écrit `canonicalJson(table)` de `spec-publish.mjs` dans `spec/contract-1.1.0/policy/<task_class>.json`.
  - `--check` compare sans écrire et sort 1 au premier écart ou au premier fichier en trop ou manquant.
  - Il n'écrit que sous `spec/contract-1.1.0/policy/` et ne fait aucun appel réseau.
- **Preuve « table servie = table publiée »**, dans le test du lot. Pour chaque table servie :
  - les octets du fichier égalent `canonicalJson(table)` ;
  - `sha256(fichier)` égale le `policy_table_sha256` servi, qui vaut `sha256Canonical(table)` de `packages/contracts`, une écriture canonique indépendante de celle de l'outil (CANON-SINGLE-SOURCE-1) ;
  - l'ensemble des fichiers égale l'ensemble des classes servies.

  Toute table servie qui change sans régénération rougit : c'est aussi le fil de KATA-CLAUSE-COMMITTED-STATE-1 côté publication (la première ligne kata impose un nouveau fichier publié).
- Les 35 empreintes attendues, égales au `policy_table_sha256` servi (mesurées à `597a986d`), sont en annexe A.

## 3. Les schémas : copies publiées, transformation fermée, gel intact

**Décision : transformation déclarée, écrite par le même écrivain, et non un changement des sources gelées.**
- L'écrivain produit `spec/contract-1.1.0/schemas/<nom>.schema.json` depuis `schemas/<nom>.schema.json` par une liste fermée de remplacements exacts. Chaque remplacement doit trouver son texte une fois exactement, sinon refus.
- Tout le reste reste à l'octet près : disposition, `title`, mots-clés, données.
- Le test vérifie :
  - que la copie égale la transformation de la source gelée ;
  - qu'après retrait de `$id` et de `description` au niveau racine, la copie et la source sont égales en écriture canonique (aucun changement de forme de données) ;
  - que `contracts_frozen` reste vert.
- `spec-publish` copie octet pour octet : une sorte « transform » dans l'outil changerait la règle « chaque entrée épingle les octets publiés », et elle est donc écartée.

**Schéma public des `$id`** : `https://github.com/KraidleAI/monark-kata-spec/blob/main/schemas/<nom>.schema.json`.
- C'est l'une des trois origines que la porte admet (`URL_ALLOW`, `public-text-deny.mjs:117`). L'URL brute (`raw.githubusercontent.com`) est refusée en règle g, et une URL du site désignerait un chemin que le site ne sert pas.
- Le chemin est celui de la sortie dans le dépôt publié, et un fichier publié n'est jamais retiré : l'identifiant reste stable. La version est portée par `schema_version`, dans le schéma lui-même.
- Le `$ref` relatif de `gate-decision` (`coverage-verdict.schema.json`) se résout contre ce `$id` vers le `$id` publié de `coverage-verdict`. Aucun `$ref` ne change.

**Remplacements** (mesurés : chaque copie passe ensuite la porte, 0 problème) :

| Schéma | Avant | Après |
|---|---|---|
| les cinq | `"$id": "https://monark.local/schemas/<nom>.schema.json"` | `"$id": "https://github.com/KraidleAI/monark-kata-spec/blob/main/schemas/<nom>.schema.json"` |
| `prediction` | ` ADR-M001 Decision 6.` (fin de `description`) | rien |
| `coverage-verdict` | ` ADR-M001 Decision 4.` | rien |
| `gate-decision` | `, NEVER a yield (ADR-CERT-MONARK). ADR-M001 Decision 5.` | `, never a return paid to anyone.` |

Les sha256 attendus des copies sont en annexe A.

## 4. Tests, gel, contrôles

Les tests rouges vont dans leur propre commit, chacun précédé de son tueur en forme fermée. Le fichier est `test/spec-1-1-0-release.test.ts`, chargé à la demande comme `test/spec-publish.test.ts`.
- **R-1** : la liste déclare `contract-1.1.0` avec ses entrées (I-2 du pipeline) : le texte, les 5 schémas, les 35 tables et les reports de `previous`, chacun épinglé.
- **R-2** : table servie = fichier publié = `policy_table_sha256`, ensemble exact des 35 classes (§2).
- **R-3** : copies de schémas = transformation fermée de la source gelée ; données inchangées (§3).
- **R-4** : `plan` de `contract-1.1.0` sur la seule racine `governance`. Problèmes attendus : seulement `root_missing` (`recherches`, `previous`), aucun `input_*` ni `vocabulary`. Chaque entrée de gouvernance passe aussi `contentProblems`. Le test est hors ligne et ne lit que ce dépôt, il tourne donc en CI.
- **R-5** : `--check` de l'écrivain sort 0 sur l'arbre et 1 sur un octet altéré, dans une copie temporaire. Chemins par `join`, aucun nom réservé, octets LF épinglés.

Le rejeu complet avec les trois racines (`recherches` et un clone propre de `ddfee9e` en `previous`), en `plan` puis en `--out` temporaire avec `--verify`, est mesuré au G7, hors CI.

Contrôles :
- red-proof `--base 597a986d --seed 37` ;
- `verifie-ancres.mjs --touched 597a986d HEAD` ;
- R-25 ;
- `tsc`, eslint, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check` ;
- `contracts-frozen`, `spec-publish` et le test du lot ;
- `/openapi.json` en processus : `61c9df97…` inchangé ; aucun fichier servi touché.

## 5. Taille (R-25, borne 547)

Estimation, en lignes ajoutées :

| Élément | Lignes |
|---|---|
| copies des schémas, disposition gelée | 298 |
| 35 tables, une ligne chacune (`.json` qui se lit en JSON : hors refus `long-line`, `lot-size-integration.mjs:229`) | 35 |
| déclaration | ≈ 50 |
| écrivain | ≈ 45 |
| test | ≈ 110 |
| **total** | **≈ 540** |

La marge est mince. Repli, à choisir au gel sur la mesure :
- (a) copies des schémas écrites en une ligne (`JSON.stringify` sans indentation, l'ordre des clés gardé), soit environ 5 lignes au lieu de 298, mais illisibles sur le dépôt public ;
- (b) scission en deux PR : écrivain, tables et R-2, puis schémas, déclaration, R-1, R-3, R-4 et R-5.

Je recommande (b) si la mesure dépasse 547 : les schémas publiés restent lisibles.

## 6. Questions pour MONARK

- **Q-1 (bloquante)** : le texte de la spécification 1.1.0.
  - Qui l'écrit, et quand ? Il s'agit d'une r4 du brouillon : TBD fermés, 17 corrections portées, porte de `spec-publish` passée.
  - Où vit-il ? Je propose `spec/contract-1.1.0/GATE-CONTRACT.md` dans ce dépôt, ou une pièce de `recherches` épinglée.
  - `KATA-SPEC.md` est-il reporté tel quel depuis `previous`, ou clarifié (§2 et §5) ?
  - Faut-il des vecteurs `contract-1.1.0` dans cette version ?
  - Sans ce texte, deux voies : soit une version publiée sans spécification, ce qui rend le §5 de la note faux et devrait être réécrit ; soit l'attente du texte.
- **Q-2** : la tête publiée de `KraidleAI/monark-kata-spec` est-elle toujours `ddfee9e` ? Ce lot ne lit pas le réseau.
- **Q-3** : ta décision sur Q-SP-1 met les sources 1.1.0 neuves sous `spec/` « après le go F-5a ». « Tout ensemble, plus tard » vaut-il ce go pour poser les sources (non exportées, non publiées) ? Autre item ouvert avant F-5a : VERIFIERS-LIST-F5A-1 (`docs/ETAT.md:478`).
- **Q-4** : publier les deux noms de scripts de `source.generator` des tables marginales (§1) ; l'un est hors export. Ils sont dans les octets que l'empreinte servie couvre et ne peuvent donc pas être retirés sans changer le servi.
- **Q-5** : M-3 (la phrase « the scores digest » de `scripts/sync-ukemi-served.mjs:248`). Annoncé dans ce lot comme un commit à part ; il ne dépend pas de Q-1. Je peux le livrer seul, avant ta synchro ukemi.

## Annexe A : empreintes attendues (mesurées à `597a986d`)

Tables : `sha256(fichier)` = `policy_table_sha256` servi.

| Fichier | Lignes de la table | sha256 |
|---|---|---|
| `policy/bnb-dir-1h.json` | 0 | `91e4751e629d6d168251446577d23b00af208aefa39ae6b8bb590963b2f38057` |
| `policy/bnb-dir-4h.json` | 0 | `36996ea2394f84c55fdbfbfb8cbd5299507b2cd05ec96515b2a2e503959925c0` |
| `policy/bnb-mae-down-1h.json` | 0 | `22b452121e6842560a472912ddcf419100479f7aac4deca1e88068cb80be7a54` |
| `policy/bnb-mae-down-4h.json` | 0 | `baf3868c54925c9e96be11aa4513d3d729d7cf137d47fffd46c620d28b725da7` |
| `policy/bnb-mae-up-1h.json` | 0 | `96d31c282e38fc5d24a10b1b0ba72559d0275bec039c7e379bec5f5c5890f288` |
| `policy/bnb-mae-up-4h.json` | 0 | `aa881258c0386ced81541f0631ebd279efc3871422ac7b5676e8c0266bd8adf8` |
| `policy/bnb-range-1h.json` | 0 | `ad7ba4a5ab8d782be0c4c8ec30c1bbfed1c9a0e8b5a221098908e897faabbc1c` |
| `policy/bnb-range-4h.json` | 0 | `e03baaeb62afaca98206d2351adfea4f8c23dee1511cdb0f7d3c6ffaab38c8b3` |
| `policy/btc-dir-1h.json` | 0 | `c04ae2921430968857350fd2fa663d0931f92c1a9bfeb595a7d341d3a02cc6e1` |
| `policy/btc-dir-4h.json` | 0 | `2a06baeab97d92b37c631eb61e74817d7843688b11b95154581156c735e36ac7` |
| `policy/btc-mae-down-1h.json` | 0 | `db3aab7101196eea582c811bc76bacdd6bc7e21457ae895d5dd163a7a980e446` |
| `policy/btc-mae-down-4h.json` | 0 | `a7767101899d1f429d4fa8fd4b5110e5d883f9833c3dd801d2f02d923025ffc1` |
| `policy/btc-mae-up-1h.json` | 0 | `b43ca5d1df3929cc058928391c5e8b2c337e0b6fd91808e29fbeaf835096d8dd` |
| `policy/btc-mae-up-4h.json` | 0 | `0a0220a2b4b477a11f0974d382d8d97ec56f6b0a5f2748e58763660ce03435fc` |
| `policy/btc-range-1h.json` | 0 | `1296c3336a96e23098f13acaf849f35c8c35970bd33d37d47f18fd26a50f955f` |
| `policy/btc-range-4h.json` | 0 | `b545641599a2c107c46102abf20060a2f82675e333d99d28f1a9625c956b8f1d` |
| `policy/cascade-liquidable-24h.json` | 0 | `07bd085b4faafba67c03d2827bc690f5d082c7553b67491b86834345296b2465` |
| `policy/eth-dir-1h.json` | 0 | `f234e0fe34aa139cb8f12152e41035668942ef1f58163824d8842003955ea924` |
| `policy/eth-dir-4h.json` | 0 | `c0692930d80752faea21b92dc66368d87eda7a58ae722f2b3f8c2b18e48482bf` |
| `policy/eth-mae-down-1h.json` | 0 | `f0dad5aad506e2bebc318c2290d0b487c3df1118eeb274c973a4fa6a6ab0a764` |
| `policy/eth-mae-down-4h.json` | 0 | `a77b8432443f675d4889c8073ba16a328f87ac3d7eaa34bcc00ecaf005ad8077` |
| `policy/eth-mae-up-1h.json` | 0 | `41196494ab01ff283505839e895f82e14fcc894bd06bc1c74991bc6092fa9188` |
| `policy/eth-mae-up-4h.json` | 0 | `4f31295ebd7d5592affadddf1b7ddf3d60e1e6df13afb88de494a56a8ad8eba2` |
| `policy/eth-range-1h.json` | 0 | `b0aec0a3aaf0ca1398a9596d2974cf7c246681dbe56e8462601aefc5bfa26d8a` |
| `policy/eth-range-4h.json` | 0 | `3aa29103cd057dc88641a4533843f9ce11d27519d5f02113f21be5f9fb7bb8b1` |
| `policy/liquidation-eligible-coverage.json` | 1 | `3f957fd1b9d8061991637ae463dc95653f279c46bf490fa6c4ebde1c0a097bfd` |
| `policy/sol-dir-1h.json` | 0 | `a227a2773592229c60e26d14bd1d311efcfac5c279a69de31a5ffe86348e4243` |
| `policy/sol-dir-4h.json` | 0 | `29e8a39ef85da2ff0d2e6a80b29a5a560b62596938403eface772078eda249ba` |
| `policy/sol-mae-down-1h.json` | 0 | `a48e313a43bba24a36a33f4346a6d39cd3a7bd9b2b38eabe8542d50e8a1809af` |
| `policy/sol-mae-down-4h.json` | 0 | `62c18ade1cbf8c57936ab981cee9cdb5a73b63a048d9f81b6869a92c89616a8f` |
| `policy/sol-mae-up-1h.json` | 0 | `0d4ca5611186a5de21c345ee2201a5318416457d9cedc0cde9cd5fff6b414f5a` |
| `policy/sol-mae-up-4h.json` | 0 | `b795a53a362815bc10af524d35f0921da064a63387cdc45fec107774213b7885` |
| `policy/sol-range-1h.json` | 0 | `224a4ef876deb8cf4eff9c09c8c22997426fe8d4dee83038cb8732cd730c21c1` |
| `policy/sol-range-4h.json` | 0 | `2844b89b00ccd8e4586e91b64fe35845517cdf08bb87df34da31efb023528666` |
| `policy/stable-run-velocity-24h.json` | 1 | `c7572e084a6765c5a145b54e3a93e1a0ee81b2ad6ccb38630399173454fbf0a8` |

Schémas publiés, avec la transformation du §3 :

| Fichier | sha256 |
|---|---|
| `schemas/prediction.schema.json` | `2196be6d5aecbee2f16b8322e03e46274f1c6e8e52ac82f0f74807479732d2ff` |
| `schemas/coverage-verdict.schema.json` | `fe57668bec3e82820384157ac9bc7845cc43b1be6017320e8631c96f97e258af` |
| `schemas/gate-decision.schema.json` | `695faf5d2130c001ca2bf9d6b477897a7f55cb80ba10121512dee48069c969dc` |
| `schemas/policy-row.schema.json` | `0a8c22c228dc142879e487b427a7a410965a0fd754e72ebf21e4471f05e8fec0` |
| `schemas/tool-error.schema.json` | `c2b1983a037e185f57c79483fa3341409968c8f45cd55e9c5fc8d0127d1b1ab6` |

## 7. Bloc daté 2026-10-06 02:17 UTC : réponses de MONARK, reprise du lot (avant les tests rouges)

- **Q-1** : RECHERCHES écrit le texte 1.1.0 (`recherches` `kata/spec/CONTRACT-1.1.0.md`), publié à la racine sous `CONTRACT-1.1.0.md`, racine `recherches`. Son entrée est ajoutée en dernier, quand son chemin et son sha256 sont donnés. Elle remplace l'entrée `GATE-CONTRACT.md` du §1. Le lot se construit d'ici là sans elle. `KATA-SPEC.md` est reporté depuis `previous`. Un `vectors-1.1.0.json` pourra suivre de la même façon.
- **Q-2** : la tête publiée est toujours `ddfee9e076d979081fa7b21ec27940e3556bacf7` (lue par MONARK).
- **Q-3** : go pour les sources sous `spec/`. La cellule a la délégation du fondateur, et « Tout ensemble, plus tard » de l'investisseur vaut une seule release complète, spécification comprise.
  - VERIFIERS-LIST-F5A-1 n'est pas touché par cette version.
  - Mesuré : l'item porte la liste fermée des identités de vérificateur, que la garde lit dans `recompute.verifier` des lignes kata (`apps/harness/src/policy-guard.ts:16-24`, `docs/G0-lot-cm-4a-ii.md:134`).
  - Les 35 tables de cette version n'ont aucune ligne kata, et leurs deux lignes marginales ont `recompute: null` : aucun vérificateur n'est publié.
  - Nuance pour MONARK : l'item vaut pour toute ligne kata qui porte `recompute`, pas pour la seule vague 2. Il redevient bloquant avec la première ligne kata publiée.
- **Q-4** : les noms de `source.generator` et `source.registry_file` sont publiés tels quels.
- **Q-5** : M-3 sort du lot (lot T0-TOOLING-1). Ce lot ne touche ni `scripts/sync-ukemi-served.mjs`, ni `scripts/verify-harness.mjs`, ni `scripts/sync-harness-served.mjs`, ni `scripts/public-text-deny.mjs`, ni `docs/RUNBOOK-*`.
- **R-25** : au-delà de 547, la scission se fait en deux branches empilées :
  - `-a` : l'écrivain, les copies des schémas et leurs tests ;
  - `-b` : les tables et la déclaration.

  Les copies des schémas restent lisibles, jamais en une ligne.
