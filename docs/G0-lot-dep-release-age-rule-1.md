# G0 du lot DEP-RELEASE-AGE-RULE-1 : une version neuve de dépendance attend 7 jours au registre, sauf correctif de sécurité nommé

- **Demande** : item DEP-RELEASE-AGE-RULE-1 (`docs/ETAT.md` l.618-621), résidu du G7 de DEP-SOURCE-MAP-JS-1
  (`docs/G7-lot-dep-source-map-js-1.md` l.23-29, options (a) et (b)). Option (a) décidée par la cellule le 2026-10-06 : proposition de
  MONARK (`docs/G0-lot-dep-sharp-1.md` l.58-62), vote de RECHERCHES (message `e9de455`, Q-3), consignée au G7 de DEP-SHARP-1
  (`docs/G7-lot-dep-sharp-1.md` l.28-33). Une version neuve d'une dépendance n'est adoptée que 7 jours ou plus après sa publication au
  registre, avec une dérogation nommée pour un correctif de sécurité dont l'avis et le diff sont lus à la G2. Porteur : MONARK, un lot de
  documentation.
- **Base** : `lot/etude-suite` = `a43b0126`, branche `monark/dep-release-age-rule-1`, worktree `F:/Monark-wt-agerule`. Auteur : MONARK ;
  rédaction par un worker `claude-opus-5-5` (effort max) le 2026-10-06 vers 20:2x UTC ; aucun commit du worker (R-20).
- **Zone** : `docs/methode/REGLES-MISSION.md` (une ligne datée et ses cinq sous-points ajoutés en fin de fichier, l.24-29 : la règle),
  `docs/methode/CHECKLIST-G7.md` (case 11 ajoutée en fin, l.15, sans renumérotation) et ce G0. Aucun code, aucun test, aucun fichier
  hors de `docs/**/*.md`. `docs/ETAT.md` n'est pas touché : l'orchestrateur y écrit au G7.

## Constat, à la base `a43b0126`

1. **Aucune règle de délai.** `git grep -n -i -E "min-release-age|minimumReleaseAge|release[- ]age|âge minimal|délai minimal" a43b0126`
   ne trouve que l'item lui-même (ETAT l.618, G0 et G7 de DEP-SHARP-1, G2 et G7 de DEP-SOURCE-MAP-JS-1) et quatre lignes sans rapport
   (`docs/adr/ADR-DOJO-SNAPSHOT-1.md` l.119, l.166, l.177, l.185 : l'âge minimal des lots du Dōjō). Aucun `.npmrc` à la racine
   (`git ls-tree a43b0126 --name-only`).
2. **Les deux précédents.** `source-map-js` 1.2.2 avait 6 jours à la G2 (`docs/G2-lot-dep-source-map-js-1.md` l.26) ; `sharp` 0.35.5 en
   avait 9 (`docs/G0-lot-dep-sharp-1.md` l.26 et l.34). Le lot `sharp` change 27 entrées du verrou : `sharp` (lui-même tiré par
   `next`, l.18) et 26 de ses dépendances (16 `@img/sharp-<plateforme>` 0.35.5, 10 `@img/sharp-libvips-<plateforme>` 1.3.4 ; l.16).
   Son tableau du registre ne date pourtant que `sharp` (l.24-34). Chaque version a sa propre date au registre : la règle en demande une
   par entrée.
3. **R-8 du corpus** (`02-referentiel-gates-et-regles.md` l.89) vise une dépendance nouvelle (existence, ancienneté, mainteneurs,
   téléchargements, avant installation). Elle ne vise pas la version neuve d'une dépendance déjà là et ne chiffre aucun âge.
4. **Le verrou ne porte aucune date.** `package-lock.json` de la base (sha256 `d17b7e7a78380f82…`) : `lockfileVersion` 3, 348 entrées
   sous `packages`, dont 325 tirées de `https://registry.npmjs.org/`, 11 liens d'espace de travail (`@monark/*`) et 12 sans `resolved`
   (la racine et les 11 dossiers d'espace de travail). Ses entrées emploient 22 clés : `version`, `resolved`, `integrity`, `license`,
   `funding`, `dependencies`, `engines`, `dev`, `optional`, `cpu`, `os`, `peerDependencies`, `libc`, `optionalDependencies`, `name`,
   `peerDependenciesMeta`, `link`, `bin`, `workspaces`, `devDependencies`, `devOptional`, `bundleDependencies`. Aucune n'est une date
   (compte des clés par un script `node -e` qui lit le verrou ; rejouable sans réseau).

## Construction

### Où vit la règle

| Lieu | Ce qui est mesuré | Verdict |
|---|---|---|
| Checklist G2 du corpus (`templates/checklist-revue-G2.md`, sur C:) | Section « Dépendances (anti-slopsquatting, R-8) », l.19-21 ; MONARK l'a déjà amendée (l.45-50, 2026-09-28) | Lieu naturel par le sujet, mais hors du worktree, sur C:, et commun à tous les projets ; les 7 jours sont une décision de la cellule MONARK. Hors de ce lot : Q-1. |
| ADR-M003 D9 (« DEVOPS : chiffres fixés par cet ADR (R-23) », `docs/adr/ADR-M003-phase2-integration.md` l.88) | Porte les chiffres de R-25 et l'épinglage de TypeScript sous R-8 (l.97) ; R25-INTEGRATION-RULE-1 y est une ligne datée (ETAT l.622-627) ; ses addenda postérieurs à la remise à zéro (nonies à sexdecies, 2026-10-05 et 2026-10-06, l.191-207) portent tous sur R-25 | Écarté. Selon ETAT l.10, « les ADR restent comme documentation du code », or cette règle n'a pas de code. Un contrôle mécanique futur (item b) y prendra sa ligne. |
| `docs/methode/CHECKLIST-G7.md` | Checklist du G7, acte de l'orchestrateur (l.3) ; encore citée après la remise à zéro d'ETAT (`docs/G0-lot-spec-publish-pipeline-1.md` l.61, 2026-10-04) | Reçoit la case de contrôle (case 11), pas la règle. |
| **`docs/methode/REGLES-MISSION.md`** | Règles de méthode. Ses octets sont insérés, avec leur sha256, dans chaque mission générée (`scripts/mission/gen.mjs` l.13, l.51, l.91 ; rôles G1, G2, cp-2, G7 et corrections, l.29). Amendée après la remise à zéro d'ETAT (2026-09-30 23:5x UTC) : précision de la décision 300 (2026-10-02), ligne C-V-4 (2026-10-03). | **Retenu.** |
| Fichier neuf sous `docs/methode/` | Aucun code ne le lirait ; il ne serait lu que par renvoi | Écarté. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Checklist d'auteur en anglais (l.17-21), comptée par R-25 ; six documents la citent (`git grep -c PULL_REQUEST_TEMPLATE a43b0126 -- docs`), comme fichier créé, exclu de l'export ou lu, jamais comme checklist de revue | Écarté : ce n'est pas la checklist d'un G2 ni d'un G7. |

Motif du choix : `REGLES-MISSION.md` est le seul fichier de méthode que du code consomme. Toute mission générée en porte les octets.
Un agent qui touche le verrou, ou qui relit un lot de dépendance, reçoit donc la règle sans que personne ait à la recopier. Le fichier
vit dans `docs/methode/`, à côté de la checklist du G7. ETAT l.10 dit aussi que les amendements de méthode « ne s'imposent plus » :
aucun lieu de ce tableau n'oblige par lui-même. La force de la règle viendra de la ligne que l'orchestrateur écrira à ETAT au G7, et
cette ligne renverra ici. Ses contraintes sont tenues :
- aucun chemin relatif au dépôt (l.1 ; `test/mission-gen.test.ts` l.251-255) ;
- aucune apostrophe, comme le reste du fichier ;
- aucune forme R-VAGUE (`scripts/mission/lint.mjs` l.74-75) ;
- la l.1 n'est pas touchée (le tueur de `test/mission-gen.test.ts` l.251 y est ancré) ;
- ajout en fin de fichier.

### La règle (`docs/methode/REGLES-MISSION.md` l.24-29)

- **Portée** : chaque entrée du verrou tirée du registre dont la `version` est ajoutée ou change entre la base et le gel, directe ou
  transitive (constat 2). Une dépendance nouvelle y entre avec toutes ses entrées. Le lien avec R-8 est écrit.
- **Mesure** : `time.<version>` lu par `npm view <paquet> time --json` (le champ `time` donne l'heure de publication de chaque version :
  `docs/content/commands/npm-view.md` de npm 11.19.0, l.78-81, sha256 `c4c6b784316c3430…`, racine npm donnée plus bas). L'heure de
  lecture est prise par `date -u` ; l'âge, de la lecture à `time.<version>`, doit atteindre 168 h. La lecture précède le gel : la
  mesure est prudente et ne laisse aucune ambiguïté de jour.
- **Ce que porte le G0** (dans une partie, son plan) : une ligne par entrée adoptée (paquet, version avant et après, `time.<version>`,
  heure de lecture, âge en heures). Sous 168 h sans dérogation, le lot attend et relit le registre.
- **Dérogation** : réservée à un correctif de sécurité et nommée au G0 (avis, plage touchée, version corrigée, entrées couvertes). La
  G2 du lot (instance distincte de l'auteur, contexte frais) lit l'avis et le diff du paquet corrigé, recalcule contre le registre
  l'intégrité de chaque entrée couverte et cite ces lectures. C'est ce qu'ont fait les deux précédents :
  `docs/G2-lot-dep-source-map-js-1.md` constats 1 à 7, et `docs/G7-lot-dep-sharp-1.md` l.4-6 pour les 27 `integrity`.
- **Ce que la règle ne dit pas** : aucun seuil de gravité, aucune restriction à la première version corrigée. La cellule n'a voté ni
  l'un ni l'autre (Q-2).

### La case de contrôle (`docs/methode/CHECKLIST-G7.md` l.15, case 11)

Le dépôt n'a qu'une checklist : `docs/methode/CHECKLIST-G7.md` (aucun autre fichier `*CHECKLIST*` ; la checklist G2 est celle du
corpus, hors zone). La case 11 est ajoutée en fin, sans renumérotation, parce que des documents citent déjà ses cases : « CHECKLIST-G7
§4 » (`docs/G0-lot-spec-publish-pipeline-1.md` l.61) et « CHECKLIST-G7 l.8 » (`docs/G0-lot-single-writer.md` l.116). Le G7 y fait deux
contrôles :
- **hors ligne** : la liste des entrées dont la `version` change dans `git diff <base>..<gel> -- package-lock.json` est celle du G0 ;
- **cité** : chaque entrée a 168 h ou plus, ou bien elle est couverte par la dérogation et le rapport de la G2 cite ses lectures.

### Pourquoi aucun contrôle mécanique hors ligne

- Le verrou ne porte aucune date (constat 4) : aucun test et aucune porte du dépôt n'a de quoi calculer un âge.
- La date n'existe que dans le document du registre : le champ `time` du document complet du paquet.
- npm lit à l'installation un document abrégé, qui n'a pas ce champ. Le commentaire de pacote le dit : l'heure de publication « is not
  included in the corgi/compressed packument » (`node_modules/pacote/lib/registry.js` l.121-123, sha256 `6c3a6632f03bba61…`). Le
  document complet n'est demandé que si `before` est posé (`node_modules/pacote/lib/fetcher.js` l.79, sha256 `2ccfb7ff753e5cf5…`).
  Lecture [lu], seule, dans l'installation locale de npm 11.19.0 livrée avec Node 24.21.0 : `C:/Program Files/nodejs/node_modules/npm/`.
  Les chemins npm de ce G0 sont relatifs à cette racine.
- Un contrôle a donc besoin du registre au moment du contrôle (réseau), ou d'une date notée avec le lot ; une date notée reste une
  déclaration, que la G2 relit en ligne.

### Ce qu'il faudrait pour un contrôle futur (items proposés, à écrire à ETAT par l'orchestrateur au G7)

- **(a) DEP-RELEASE-AGE-NPMRC-1, le filtre de npm.** npm 11.19.0 porte `min-release-age` (en jours), `before` et
  `min-release-age-exclude` (`docs/content/using-npm/config.md` l.331-357, l.1222-1248, l.1250-1276, sha256 `a9247377e52c3f67…` ;
  exemple `min-release-age=7` à l.1263). `min-release-age` devient `before = maintenant − 86 400 000 ms × jours`
  (`node_modules/@npmcli/config/lib/definitions/definitions.js` l.1503, sha256 `6b5b2a453284d60a…`). `install` et `update` le déclarent (`lib/commands/install.js` l.41-42, sha256
  `a436e25f57a5aded…` ; `lib/commands/update.js` l.29-30, sha256 `31d7319053c5a6f0…`) ; `ci` ne le déclare pas (`lib/commands/ci.js`
  l.17-38, sha256 `7bfa03db762f1c0f…`) mais appelle `buildIdealTree` (l.78).
  - **Mesuré ici** : `npm ci --dry-run --offline --ignore-scripts --no-audit --no-fund --no-update-notifier` sur le verrou de la base
    (copie `git archive` sous `F:/tmp/dojo/agerule-npmci/tree`, cache vide, registre `http://127.0.0.1:9/`) ajoute 282 paquets, sortie
    0. Avec `--min-release-age=36500` (100 ans), il ajoute les mêmes 282 paquets, sortie 0 ; l'option est bien lue
    (`npm config get min-release-age` rend 36500). Aucune requête dans les deux journaux. En `--dry-run`, le filtre ne juge donc pas
    un verrou à jour ; la réification réelle n'est pas mesurée. Selon la documentation, il agit quand npm choisit une version
    (`npm install`, `npm update`), en ligne : c'est une garde à l'écriture du verrou, pas un contrôle du verrou.
  - **Forme** : un `.npmrc` à la racine (`min-release-age=7`). La dérogation passe en ligne de commande
    (`--min-release-age-exclude=<paquet>`, la ligne de commande primant sur le projet, `config.md` l.346-350). La documentation prévient
    que `npm audit fix` sort en erreur quand la fenêtre bloque un correctif (l.352-354, l.1239-1243).
  - **Inconnues** : la version de npm du runner de la CI (`node-version: "24"`, `.github/workflows/ci.yml` l.225, non mesurée) et
    celle des hôtes ; la première version de npm qui connaît `min-release-age` (l'installation locale n'a pas de CHANGELOG).
- **(b) DEP-RELEASE-AGE-CI-1, un contrôle en ligne dans `g6-compliance`.** Ce job a déjà le réseau (`npm ci` l.227, `npm audit` l.242).
  Le contrôle comparerait les `version` du verrou entre la base et la tête, lirait `npm view <paquet>@<version> time --json` pour chaque
  entrée, et refuserait sous 168 h sauf dérogation déclarée sous une forme fermée et lisible par machine. Le seuil devient alors un seuil
  de CI : ligne datée d'ADR-M003 D9 et justification sourcée (R-23, `02-referentiel-gates-et-regles.md` l.112). Prix (script, tests,
  étape de CI) chiffré à son G0.
- **(c) DEP-RELEASE-AGE-SOURCE-1, la source du seuil.** Les 7 jours sont une décision de la cellule, citée comme telle ; aucune
  efficacité n'est revendiquée ici. La valeur `7` de la documentation de npm n'est qu'un exemple (l.1263). Une justification sourcée
  demande une lecture sur place d'une source primaire (réseau, hors de ce lot) : par exemple une mesure publiée du délai entre la
  publication d'une version malveillante et son retrait du registre, si elle existe. Elle précède (b).

Porteur proposé des trois items : la cellule. Déclencheur : la prochaine montée de dépendance (elle appliquera la règle à la main).
Avant le G7 de ce lot, ils sont formés ici et non écrits à ETAT (zone).

## Preuve rouge

Sans objet : le lot ne change ni code ni test (`docs/**/*.md` seulement). Lancé comme demandé avec zéro tueur,
`node scripts/red-proof.mjs --base a43b0126 --gel F:/Monark-wt-agerule --draw 0 --seed 11 --out F:/tmp/dojo/redproof-dep-release-age-rule-1`
rend « red-proof REFUSED: 0 judged, 0 unchanged, 0 killer(s) drawn », sortie 1. Dans `RED-PROOF.json` (2026-10-06T20:30:04Z) :
`files.tests`, `files.support` et `files.production` sont vides, le seul fichier listé est ce G0 (`files.added`), et `ok` est faux.
L'outil n'a rien à juger, faute de test : c'est attendu pour un lot de documentation.

## Tueurs

Sans objet : aucun test jugé, donc aucun tueur.

## Contrôles rejoués par le worker

- `node -r ./test/helpers/blocking-stdout.cjs --test --test-timeout=300000 --test-force-exit test/mission-gen.test.ts` : 29 tests,
  29 réussis, 0 échec. Parmi eux, « the REAL rules of the generator checkout » linte le `docs/methode/REGLES-MISSION.md` du worktree :
  aucun signalement, hors chemins d'hôte absents.
- `node -r ./test/helpers/blocking-stdout.cjs --test --test-timeout=300000 --test-force-exit test/byte-guard.test.ts` : 16 tests,
  16 réussis, 0 échec (fichiers suivis, donc les deux fichiers de méthode ; ce G0, non suivi, est contrôlé à part ci-dessous).
- Octets des deux fichiers de méthode et de ce G0 : aucun TAB, CR ni octet de contrôle, aucun U+2028 ni U+2029, LF final ; aucune
  apostrophe dans les deux fichiers de méthode.
- `tsc` et `eslint` : sans objet, aucun fichier `.ts` changé.

## R-25

`git diff --shortstat a43b0126 -- . ':(exclude,glob)docs/**/*.md'` : vide, 0 ligne comptée. Aucun fichier non suivi n'est compté (le
seul est ce G0, sous `docs/**/*.md`).

## Questions (défaut entre parenthèses)

- **Q-1** (demande formée à l'orchestrateur, acte hors zone sur C:) : ajouter à la checklist G2 du corpus, section « Dépendances
  (anti-slopsquatting, R-8) », la ligne : « - [ ] (MONARK, DEP-RELEASE-AGE-RULE-1) Toute version neuve tirée du registre (entrée du
  verrou ajoutée ou changée) a 168 h ou plus entre `time.<version>` et sa lecture au G0, ou la dérogation de sécurité est nommée au G0
  et ce rapport cite la lecture de l'avis, du diff et des intégrités. » (Défaut : la proposer comme amendement daté de MONARK, comme
  celui du 2026-09-28. Sans elle, la G2 reçoit la règle par sa mission générée et par le G0 du lot.)
- **Q-2** : la dérogation se limite-t-elle à la première version hors de la plage touchée de l'avis ? (Défaut : non. La cellule ne l'a
  pas voté ; la G2 lit le diff quelle que soit la version.)
- **Q-3** : fin de la mesure à la lecture du G0 (retenue, prudente), au gel ou à la fusion ? (Défaut : la lecture du G0.)
- **Q-4** : les entrées hors registre (liens d'espace de travail, et à l'avenir `git:` ou une archive par URL) n'ont pas de `time`.
  (Défaut : hors de la règle ; R-8 et la G2 en jugent ; aucune n'existe à la base hors des 11 liens `@monark/*`.)
- **Q-5** : porteur et déclencheur des items (a), (b) et (c). (Défaut : la cellule, à la prochaine montée de dépendance.)
- **Q-6** : version de npm sur le runner et sur les hôtes, et première version de npm qui connaît `min-release-age`. (Défaut : mesurées
  au G0 de l'item (a), par lecture sur place.)
