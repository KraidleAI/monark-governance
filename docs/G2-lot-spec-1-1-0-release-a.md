# G2 de SPEC-1-1-0-RELEASE, partie a (`recherches/spec-1-1-0-release-a`)

- **Objet** : `git diff 597a986d..c85f352e`. Les mesures ont été prises sur un arbre de travail jetable au commit `e8fb1a8a` (fusion du tronc `8aea2299`), qui ne modifie pas ces fichiers. Node v24.21.0.
- **Lus** : le G0 (§0 à §7 et l'annexe A), `scripts/spec-policy-tables.mjs` et son `.d.mts`, `test/spec-1-1-0-release.test.ts`, les cinq copies, `public-text-deny.mjs`, `spec-publish.mjs` (`contentProblems`, `vocabularyHits`), `gate.ts`, `kata-path.ts`, `policy-guard.ts`, `ETAT.md` et `.gitattributes`.
- **Arbre d'origine** : le worktree du lot n'a pas bougé. Il est toujours sur `recherches/spec-1-1-0-release-b` à `9d19e842`, et `git status` est vide. L'arbre jetable a été retiré par `git worktree remove`.

## Verdict : **non bloquant**

Je n'ai trouvé aucun bloquant.
- Les copies ne diffèrent des sources gelées que par la liste fermée de remplacements.
- Les octets canoniques sont exactement ce que le service hache. Je l'ai prouvé sur le fil de `runGate` pour 3 tables, et pour les 35 tables contre `SERVED_POLICY_TABLES`.
- La porte de `spec-publish` lève 0 problème.
- Aucune fuite nouvelle.

Quatre points sont à traiter avant la publication (N-1 à N-4). Le plus important est N-1 : le `$id` en `blob/main` est récupérable sous forme de page HTML, pas de JSON. Viennent ensuite six remarques mineures (M-1 à M-6).

---

## 1. Copies des schémas

### Octets changés (diff copie / source gelée, sur les 5 fichiers)

| Schéma | Ligne | Changement |
|---|---|---|
| les 5 | 3 | `$id` : `https://monark.local/schemas/<n>.schema.json` → `https://github.com/KraidleAI/monark-kata-spec/blob/main/schemas/<n>.schema.json` |
| `prediction` | 5 | fin de `description` : ` ADR-M001 Decision 6.` retiré |
| `coverage-verdict` | 5 | fin de `description` : ` ADR-M001 Decision 4.` retiré |
| `gate-decision` | 5 | `, NEVER a yield (ADR-CERT-MONARK). ADR-M001 Decision 5.` → `, never a return paid to anyone.` |
| `policy-row`, `tool-error` | — | rien d'autre que le `$id` |

Le diff ne touche aucune autre ligne. Le nombre de lignes est identique (17, 92, 51, 103 et 35). Les sha256 des copies égalent ceux de l'annexe A du G0 (`2196be6d…`, `fe57668b…`, `695faf5d…`, `0a8c22c2…`, `c2b1983a…`).

### Données inchangées

- Le test compare l'écriture canonique de la copie et de la source après neutralisation du `$id` et de la `description` racine. Les descriptions imbriquées sont donc couvertes.
- Contrôle en processus avec Ajv 2020 :
  - les 5 copies sont chargées par `addSchema` ;
  - une `GateDecision` servie (`stable-run-velocity-24h`, sortie de `runGate`) est valide ;
  - un `verdict.alpha` altéré est refusé à travers le `$ref` ;
  - les 35 tables servies sont valides sous la copie de `policy-row`.

### `$ref`

- Le seul `$ref` relatif est `gate-decision` → `coverage-verdict.schema.json`. Il se résout contre le `$id` de base vers le `$id` publié de `coverage-verdict`. La résolution fonctionne quand les cinq schémas sont préchargés.
- Si l'on charge `gate-decision` seul, Ajv lève `MissingRefError … from id https://github.com/…/blob/main/schemas/gate-decision.schema.json`. Voir N-1.
- Tous les autres `$ref` sont internes (`#/$defs/…`).

### Sens des textes remplacés : voir N-4. Les références résiduelles sont traitées en M-4.

## 2. L'écrivain

### Octets canoniques = `policy_table_sha256` servi (preuve en processus)

J'ai écrit les fichiers par `--write --root <tmp>`, puis j'ai demandé les verdicts réels à `runGate`.

| Table | sha256(fichier) | `verdict.policy_table_sha256` reçu de `runGate` |
|---|---|---|
| `stable-run-velocity-24h` | `c7572e08…f0a8` | `c7572e08…f0a8` (égal) |
| `liquidation-eligible-coverage` (s0) | `3f957fd1…7bfd` | `3f957fd1…7bfd` (égal) |
| `btc-dir-1h` (kata, `nowMs` fixé) | `c04ae292…c6e1` | `c04ae292…c6e1` (égal) |

Sur les 35 tables, quatre égalités tiennent toutes : `sha256(fichier)`, `t.policy_table_sha256`, `sha256Canonical(t.table)` de `@monark/contracts` (écriture indépendante) et l'annexe A. Aucun LF final, aucun CR.

### `--check`

| Cas | Résultat |
|---|---|
| dérive (LF ajouté à `btc-dir-1h.json`) | `differ`, sortie 1 |
| fichier manquant | `missing`, sortie 1 |
| fichier en trop sous `policy/` | `extra`, sortie 1 |
| sous-répertoire sous `policy/` | `extra`, sortie 1 |
| fichier en trop hors de `schemas/` et `policy/` | non vu (M-2) |
| racine sans `schemas/` | exception, sortie 1 |
| arguments | `--bogus` et `--root` sans valeur donnent 2 |

### `--write` en cas d'échec d'écriture

J'ai rendu l'écriture impossible : un fichier `policy` à la place du répertoire. `mkdirSync` lève une exception, la sortie vaut 1 et une trace de pile est affichée. L'écrivain est donc fermé en cas d'échec, mais il n'est pas atomique : les fichiers déjà écrits restent (M-3).

### Windows

- Chemins : `join` partout. Les chemins logiques sont en `/` des deux côtés de la comparaison (`listed` et `want`), donc ils restent cohérents.
- Fins de ligne : `.gitattributes` porte `* text=auto eol=lf`, donc les sources gelées sont extraites en LF. `writeFileSync` ne traduit rien, et les tables n'ont aucun LF.
- **Défaut** : la garde `resolve(process.argv[1]) === fileURLToPath(import.meta.url)` échoue en silence. Voir N-2.

## 3. Tests et tueurs (tirés à la main, puis restaurés)

Le sha256 de l'écrivain est `46c8c44f761ec414…` avant les tirs et identique après. La base est verte : 2 tests sur 2.

| Tueur | Résultat |
|---|---|
| K1, celui déclaré : l.23 `Decision 6` → `Decision 7` | 2 tests rouges |
| K2, celui déclaré : l.55, boucle `extra` supprimée | 1 test rouge |
| K4 : contrôle « exactement une fois » neutralisé | 1 test rouge |
| K5 : `main` renvoie toujours 0 | 1 test rouge |
| K6 : `--write` ne fait rien | 1 test rouge |
| K3 : texte de remplacement → `", a yield."`, copie régénérée | **survit** dans la partie a (M-1) |

Les assertions sont fortes sur la forme et sur la dérive. Elles sont faibles sur le contenu de la description racine dans la partie a seule. La partie b couvre ce point par `contentProblems` (R-4) et par le sha256 épinglé dans la déclaration.

## 4. Porte de contenu

| Contrôle | Hits par copie | Détail |
|---|---|---|
| `checkPublicText(…, "notes")` brut | 1 | règle g sur `https://json-schema.org/draft/2020-12/schema`, c'est-à-dire le `$schema` |
| `contentProblems(out, "schema", bytes)` de `spec-publish` | **0** | l'URL du méta-schéma fait partie de l'exception déclarée `EXCEPTED` (`spec-publish.mjs:94`) |

Comme témoin, les sources gelées passées à la même porte lèvent les hits attendus : `ADR-M`, `Decision N`, `yield` (règle a), `ADR-C` et l'URL `monark.local`. La transformation retire bien tout ce que la porte voit.

## 5. Fuites

- Les copies ne contiennent :
  - aucune adresse e-mail, IP, hôte privé ou chemin personnel ;
  - aucun nom de dépôt privé ;
  - aucune forme de cuisine.
- Les seules URL sont l'origine admise (`github.com/KraidleAI/monark-kata-spec`) et le méta-schéma.
- Les noms résiduels HIKAE, UKEMI, MONARK, `L3`, `C6` et `btc-dir/pm-yesno` sont déjà publics : `schemas/` est dans `WHITELIST_DIRS` de `export-public.mjs`, et les sources gelées sont donc déjà sur le miroir public, sous une forme plus bavarde encore.
- Rien n'est publié pour la première fois.

## 6. VERIFIERS-LIST-F5A-1 (bloc daté §7, Q-3)

- **Sur le fond, le raisonnement est juste.** J'ai vérifié trois points :
  - la liste fermée n'est lue que par la garde des lignes kata (`GuardPins.verifiers`, `policy-guard.ts:16-17`, `guardKataRow`) ;
  - les 32 tables kata ont 0 ligne, et `kataTablesHoldNoRow` le garantit au chargement ;
  - les deux lignes marginales portent `"recompute":null`.

  Aucune identité de vérificateur n'est donc publiée. Le schéma `policy-row` publie seulement le champ `recompute.verifier: string`, pas la liste.
- La nuance du G0 est correcte : l'item vaut pour toute ligne kata qui porte `recompute`.
- **Deux défauts de forme :**
  - l'item de `ETAT.md` dit littéralement « due par MONARK avant F-5a ». Cette release est liée à T0 et au go F-5a. La réponse de MONARK reformule le déclencheur sans que l'item soit amendé ;
  - aucun fil n'empêche de publier la première ligne avec un `recompute` non nul avant la liste. Le `--check` (b) et `kataTablesHoldNoRow` ne tiennent que si le texte de clause change, et ce changement ne mentionne pas la liste.

  Voir N-3.
- La référence `docs/ETAT.md:478` est juste à `597a986d`, mais l'item est à la ligne 509 à `e8fb1a8a`.

---

## Constats

### N-1 : le `$id` en `blob/main` sert du HTML ; l'alternative `/raw/` passe la porte et sert du JSON

- **Preuves** :
  - `curl -I https://github.com/KraidleAI/monark-kata-spec/blob/main/KATA-SPEC.md` répond 200 en `text/html`.
  - `curl -I https://github.com/KraidleAI/monark-kata-spec/raw/main/KATA-SPEC.md` répond **302**, avec `Location: https://raw.githubusercontent.com/KraidleAI/monark-kata-spec/main/KATA-SPEC.md`. C'est le même comportement pour une révision épinglée (`/raw/ddfee9e…/vectors.json`).
  - JSON Schema 2020-12 n'exige pas qu'un `$id` soit récupérable : le `$id` actuel est **valide** comme identifiant. Mais un validateur qui charge les `$ref` manquants par réseau télécharge du HTML pour `coverage-verdict.schema.json` et échoue sur une erreur d'analyse. C'est le cas d'Ajv avec `loadSchema`, et de `referencing` avec un `retrieve` HTTP. Mesuré : `gate-decision` chargé seul lève `MissingRefError`.
- **Le G0 §3 omet une option.** Il écarte l'URL brute (règle g) et une URL du site, mais pas la forme `https://github.com/KraidleAI/monark-kata-spec/raw/<ref>/schemas/<n>.schema.json`. Cette forme est sur l'origine admise : `URL_ALLOW` accepte tout chemin sous `github.com/KraidleAI/monark-kata-spec`, et elle n'a qu'un seul `://`.
- **Second défaut, commun à `blob/main` et à `raw/main`** : le chemin publié est stable d'une version à l'autre. Une 1.2.0 qui change un schéma réutiliserait le même `$id` pour un contenu différent, et deux versions chargées dans un même Ajv entrent en collision (« schema with key or id already exists »).
- **Correctif recommandé** :
  - passer `publicId` à `https://github.com/KraidleAI/monark-kata-spec/raw/main/schemas/${name}.schema.json`. Le `$id` devient ainsi récupérable en JSON après redirection et reste sur l'origine admise. Si la release pose une référence immuable (tag `contract-1.1.0`), utiliser plutôt `/raw/contract-1.1.0/…` ;
  - régénérer les 5 copies, puis mettre à jour l'annexe A, le littéral du test (l.43) et les 5 sha256 de la déclaration (b) ;
  - repasser `contentProblems`. Je m'attends à 0 hit, à confirmer au gel.
- **Repli acceptable** si l'on garde `blob/main` : une phrase dans le README publié, « the `$id` values are identifiers, not download locations: preload the five schemas ». Il faut aussi corriger le G0 §3.

### N-2 : un `--check` lancé par un lien symbolique, une jonction ou une casse de lecteur différente sort 0 sans rien faire

- **Preuve** : j'ai lancé `node <lien vers scripts>/spec-policy-tables.mjs --check --root <racine cassée>`. La sortie vaut **0**, sans aucune ligne affichée. Le même appel par le chemin réel sort 1.
- **Cause** : `resolve(process.argv[1])` garde le chemin du lien, alors que `import.meta.url` est le chemin réel. Sous Windows, il en va de même pour une jonction, un `subst` ou `c:` contre `C:`. Un `--check` d'oracle ou de CI peut donc passer en vert sans avoir rien vérifié.
- **Précédents** : `spec-publish.mjs:243` partage le même motif (hors lot, à signaler). Le dépôt a déjà la bonne forme : `compare-coinbase-passes.mjs:168` (`realpathSync` des deux côtés) et `detect-ee7-history.mjs:291` (F-4, « junction or link »).
- **Correctif** :
  - comparer `realpathSync(process.argv[1])` à `realpathSync(fileURLToPath(import.meta.url))`, sous `existsSync` ;
  - ajouter un test qui lance l'écrivain par un lien symbolique dans `TMP` et attend la sortie 1 sur une racine vide ;
  - tueur : revenir à `resolve`.

### N-3 : VERIFIERS-LIST-F5A-1, déclencheur non amendé et sans fil

- **Preuve** : `ETAT.md:509` (à `e8fb1a8a`) porte « est due par MONARK avant F-5a », état « ouvert ». Le bloc daté du G0 dit « pas touché par cette version ». Aucun test ne lie `recompute ≠ null` dans une table publiée à l'existence de la liste.
- **Correctif** :
  - une ligne datée de MONARK dans `ETAT.md` qui change le déclencheur de l'item : « avant la première table publiée dont une ligne porte `recompute` non nul », au lieu de « avant F-5a » ;
  - dans R-2 (partie b), asserter que toute ligne de toute table servie a `recompute === null`, avec un message qui cite l'item ;
  - tueur : une ligne de fixture avec un `recompute` non nul ;
  - corriger aussi la référence de ligne (478 → 509).

### N-4 : « never a return paid to anyone » peut se lire « jamais remboursé »

- **Preuve** : dans `gate-decision.description`, la phrase « remaining_budget = B_t (…), a MONARK attribute, depletable, never a return paid to anyone » est normative pour l'intégrateur. « A return paid » peut se lire comme une restitution, au sens d'un remboursement du budget, alors que l'original nie un **rendement** (« NEVER a yield »). Le mot « never » perd aussi l'emphase de la source gelée, ce qui reste mineur.
- **Correctif** : remplacer par un texte sans ambiguïté et sans mot refusé, par exemple `, never an investment return or income paid to anyone.`. Il faut repasser `checkPublicText` et `contentProblems` dessus, car je ne connais pas toute la liste de la règle a. Il faut aussi mettre à jour `EDITS`, la copie, l'annexe A et le sha256 de la déclaration.

### M-1 : dans la partie a, le texte de remplacement n'est contraint par rien

- **Preuve** : le tueur K3 (`", a yield."`, copie régénérée) laisse les 2 tests verts sur la partie a. La partie b le rattrape par R-4 (`contentProblems`), mais un changement de sens qui passe la porte (« never » → « always ») ne serait attrapé que par le diff des sha256 épinglés.
- **Correctif** : dans le test de la partie a, épingler les 5 sha256 de l'annexe A, ou au moins faire tourner `contentProblems(…, "schema", copie)` sur les 5 copies.

### M-2 : `differences` ne voit pas un fichier en trop hors de `schemas/` et `policy/`

- **Preuve** : `spec/contract-1.1.0/stray.json` n'est pas signalé, alors qu'un `policy/sub/` l'est.
- **Impact** : faible, car `spec-publish` ne publie que des entrées déclarées. Mais l'en-tête de l'écrivain promet « any … extra file ».
- **Correctif** : lister récursivement `OUT_DIR`, ou réduire la promesse de l'en-tête à `schemas/` et `policy/`.

### M-3 : `--write` n'est pas atomique

- **Preuve** : sur un échec de `mkdirSync`, la sortie vaut 1 avec une trace de pile. C'est fermé, mais les fichiers déjà écrits restent. L'ordre est trié, donc `policy/` est écrit avant `schemas/`.
- **Correctif** : soit écrire dans un répertoire temporaire frère puis faire un `renameSync` ; soit documenter « relancer `--write`, puis `--check` », et capter l'exception pour afficher une seule ligne et sortir 1.

### M-4 : références opaques dans des descriptions normatives

- **Constat** : la copie garde « (spec section 5) », « C6 », « L3 » et « btc-dir/pm-yesno ». Dans le dépôt publié, « spec » désigne deux textes possibles, `KATA-SPEC.md` et le futur `CONTRACT-1.1.0.md`.
- **Correctif** : quand le texte 1.1.0 existera, vérifier que son §5 porte bien les couplages. Ajouter alors un remplacement fermé `(spec section 5)` → `(CONTRACT-1.1.0.md section 5)`, ou l'écrire dans la note de version.

### M-5 : l'oracle « 0 hit » dépend de l'exception de `spec-publish`

- **Constat** : `checkPublicText` brut donne 1 hit (règle g, méta-schéma) par copie. Le compte est de 0 après `EXCEPTED`.
- **Correctif** : préciser au G7 « 0 problème au sens de `contentProblems` », sans plus.

### M-6 : `--check` sur l'arbre de la partie a sort 1, et R-5 n'épingle pas LF dans la partie a

- **Preuve** : sur `e8fb1a8a`, le `--check` sans `--root` signale 35 `missing policy/…` et sort 1. L'écrivain n'est câblé ni à `package.json` ni à la CI, donc cela n'a aucun effet tant que a et b fusionnent ensemble.
- R-5 (« octets LF épinglés ») n'a aucune assertion de CR dans la partie a. Ce sont `.gitattributes` et le contrôle `crlf` de `contentProblems` (b) qui couvrent ce point.
- **Correctif** : ne pas fusionner a sans b, ou l'écrire dans le G7. En option, ajouter `assert.ok(!copy.includes("\r"))` au premier test.
