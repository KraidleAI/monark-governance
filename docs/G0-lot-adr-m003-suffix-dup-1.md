# G0 du lot ADR-M003-SUFFIX-DUP-1 : le doublon « D9 octies » d'ADR-M003 tenu par une note de registre et par un test, sans renommage

- **Demande** : item ADR-M003-SUFFIX-DUP-1, ouvert par l'erratum du journal du 2026-10-06 07:4x UTC (`docs/JOURNAL-PROVENANCE.md` l.448 :
  « Le doublon ancien « D9 octies » (l.116 et l.189) reste à lever : item ADR-M003-SUFFIX-DUP-1, porteur MONARK ») ; mission de MONARK
  du 2026-10-06 : une note de registre datée sous le second octies, un module qui lit les titres `**Addendum D9 <suffixe> — <date>`, un
  test `adr_m003_d9_suffixes_are_unique`. Avis de RECHERCHES (`recherches:coordination/pieces/2026-10-06-brouillons-D9-live-k/ADDENDUM-D9-registres.md`,
  commit `369306d`, sha256 `5abe9e81…`, section 0) : ne pas renommer un addendum déjà cité, ajouter une note de registre.
- **Base** : `a43b0126` (`lot/etude-suite`, fusion de #187), branche `monark/adr-m003-suffix-dup-1`, worktree `F:/Monark-wt-suffixdup`.
  Auteur : worker `claude-opus-5-5` (effort max) pour MONARK, le 2026-10-06 (horloge lue : 20:07 UTC au début du lot). Rien n'est
  commité (R-20).
- **Zone** : `docs/adr/ADR-M003-phase2-integration.md` (un paragraphe l.191 et une ligne vide), `scripts/adr-suffixes.mjs` et
  `scripts/adr-suffixes.d.mts` (neufs), `test/adr-m003-suffixes.test.ts` (neuf), ce G0. Aucun autre fichier ; `docs/ETAT.md` et le
  journal ne sont pas touchés.

## Constat (base `a43b0126`)

- 17 titres commencent en colonne 0 par `**Addendum D9` (l.97 à l.207) : aucun suffixe (2026-09-05), bis, ter, quater, quinquies,
  sexies, septies, octies (l.116, 2026-09-20), octies (l.189, 2026-09-24), nonies, decies, undecies, duodecies, terdecies,
  quaterdecies, quindecies, sexdecies (l.207, 2026-10-06). Un seul suffixe en double : octies. Le titre de bis n'a pas de date
  (`**Addendum D9 bis — flux de livraison**`) : la forme `<suffixe> — <date>` de la mission ne vaut pas pour lui, le module lit la date
  comme facultative.
- `git log -S` : le premier octies vient du commit `03e7b6c0` (2026-09-20 21:52 +0100, lot CI-site), le second du commit `0cfb2cb6`
  (2026-09-24 03:01 +0100, sujet « R-25 one-off exception for integration PR #89 (ADR-M003 D9 octies, investor decision 169) »).
- `git grep -c 'D9 octies' a43b0126` : 43 lignes dans 17 fichiers. Le premier octies est cité dans le code (`.github/workflows/ci.yml`
  l.4 et l.246, `scripts/assert-fleet-html.mjs` l.1, `scripts/export-public.mjs` l.73, `test/ci-gates.test.ts` l.66 et l.1818), dans
  ADR-M004 l.111 (amendement D7 ter) et dans les pièces du lot CI-site ; le second dans le journal (l.376, entrée du 2026-09-24 02:13
  UTC), dans D9 decies (l.193 : « D9 octies du 2026-09-24 (#89) »), dans `docs/G0-lot-r25-integration-rule-1.md` l.218,
  `docs/G7-lot-r25-integration-rule-1.md` l.366 et dans le message du commit `0cfb2cb6`. `docs/G0-lot-u4.md` (l.32, l.62) et
  `docs/CHECKPOINT1-lot-u4.md` nomment un troisième « D9 octies », proposé pour le lot U-4 puis déclaré sans objet, jamais écrit.
- Aucun code ne lisait ADR-M003 : `git grep 'ADR-M003-phase2' a43b0126 -- ':!docs'` rend 0 ligne.

## Construction

- **Pas de renommage** (avis de RECHERCHES, mission) : renommer l'un des deux octies casserait des renvois écrits, dont un message de
  commit. La note de registre (ADR-M003 l.191, entre le second octies et D9 nonies) le dit, cite chacun avec sa date (« D9 octies du
  2026-09-20 », « D9 octies du 2026-09-24 »), nomme le module et le test qui gardent la règle, et dit que le prochain suffixe libre suit
  celui du dernier addendum D9. Elle ne nomme pas ce suffixe : le lot R25-REGISTRY-ROOT-1 (`monark/r25-registry-root-1`, `433dca5f`)
  prend septdecies, un nom écrit ici vieillirait à sa fusion. Elle commence par `**Note de registre`, non par `**Addendum D9` : le
  module ne la lit pas comme un titre. Sans apostrophe, comme les addenda D9 du 2026-10-05 et du 2026-10-06 qui l'entourent.
- **`scripts/adr-suffixes.mjs`** (53 lignes, pur, sans dépendance, Node 24) : `d9Headings(text)` rend, pour chaque ligne qui commence
  en colonne 0 par `**Addendum D9`, son numéro, son suffixe (`""` pour aucun ; `null` si le titre ne suit pas la forme
  `**Addendum D9 [suffixe] — [date]`, tiret cadratin U+2014 écrit `\u{2014}`, drapeau `u`) et sa date (`null` s'il n'y en a pas).
  Forme à accolades parce que la forme à quatre chiffres (barre oblique inverse, `u`, `2014`), saisie dans l'outil d'écriture du
  harnais, arrive dans le fichier comme le caractère brut (sonde `F:/tmp/dojo/suffixdup/escape-probe.txt`, `od -c` : `342 200 224`).
  `d9SuffixProblems(headings)` refuse : un titre illisible ; un suffixe hors de `LATIN_ORDINALS` (liste fermée : aucun, bis, ter,
  quater, quinquies, sexies, septies, octies, nonies, decies, undecies, duodecies, terdecies, quaterdecies, quindecies, sexdecies,
  septdecies, octodecies) ; un suffixe qui, à son premier titre dans l'ordre du fichier, n'est pas le terme suivant de la liste (saut ou
  désordre) ; un suffixe porté deux fois ou plus, sauf la paire fermée `HISTORICAL_DUPLICATES` (octies, dates 2026-09-20 puis
  2026-09-24, dans cet ordre). Chaque refus commence par ses lignes. `scripts/adr-suffixes.d.mts` (11 lignes) porte les types.
- **Pourquoi `scripts/` et non `test/helpers/`** : `scripts/red-proof.mjs` copie dans le clone de la base tout fichier du diff situé
  sous `test/` ; un `test/helpers/adr-suffixes.ts` y serait chargé, le test y serait vert (mêmes titres, paire admise) et refusé
  (« green at base »). Sous `scripts/`, le module manque au clone de la base : le test y est `new-module`.
- **Test** `adr_m003_d9_suffixes_are_unique` (`test/adr-m003-suffixes.test.ts`, 45 lignes, un seul test) : (1) les 17 premiers titres
  de l'ADR réel sont épinglés (suffixe, date) : une lecture vide ne passe pas, d'autres titres peuvent suivre ; (2) aucun refus sur
  l'ADR réel ; (3) titres construits, un par ligne, depuis ces 17 : tels quels, avec septdecies ajouté, puis octodecies, aucun refus ;
  un second decies, octodecies sans septdecies, un troisième octies, la paire sous une autre date (2026-09-21), nonies sous les deux
  dates de la paire, `sedecies` à la place de sexdecies, un tiret demi-cadratin (U+2013) : chacun refusé, message exact.
- **Avec et sans septdecies** (mesuré dans `F:/tmp/dojo/suffixdup/tree`, module et test du gel) : le test passe sur l'ADR de la base
  (sha256 `152e4a48…`), du gel (`1a9f1fc6…`), de `433dca5f` (R25-REGISTRY-ROOT-1 : 18 titres, septdecies l.209) et sur la fusion à
  trois voies gel + `433dca5f` (`git merge-file -p`, sortie 0, sans conflit ; `8905ff90…` : 18 titres, septdecies l.211).
- **Tuyaux** : entrée, ADR-M003 tel que commité ; sortie, la liste des refus, lue par le test racine ; le test tourne en CI dans
  `g3-verification` (`npm run test:main`, glob `test/*.test.ts`). Rien n'est servi ni exporté : `scripts/adr-suffixes.mjs` n'est pas
  dans `WHITELIST_FILES` de `scripts/export-public.mjs`, et le dossier racine `test/` n'est jamais exporté.
- **Numéros de ligne** : la note et sa ligne vide décalent de 2 les lignes 191 à 207 de la base (nonies passe l.193, sexdecies l.209).
  Des pièces datées citent l'ADR par numéro de ligne : l'erratum du journal (l.448, « l.201 », « l.203 ») et
  `docs/G2-lot-r25-asset-png-harden-1.md` l.47 (« :205 ») pointent désormais 2 lignes trop haut. Elles ne sont pas réécrites (Q-4).
- **Windows** : chemin par `join(import.meta.dirname, …)` ; lignes coupées sur `\r?\n` (un clone en `core.autocrlf=true` lit les mêmes
  titres) ; aucune écriture.

## Preuve rouge

`node scripts/red-proof.mjs --base a43b0126 --gel F:/Monark-wt-suffixdup --draw 1 --seed 11 --out F:/tmp/dojo/redproof-adr-m003-suffix-dup-1`
(2026-10-06 20:34 UTC, Node v24.21.0, 23 s, sortie 0), dernières lignes :

```
new-module   test/adr-m003-suffixes.test.ts :: adr_m003_d9_suffixes_are_unique - each D9 suffix of ADR-M003 is carried once, but octies of 2026-09-20 and of 2026-09-24, and the suffixes run through the Latin ordinals with no gap
killer killed       scripts/adr-suffixes.mjs:50 CONST (adr_m003_d9_suffixes_are_unique - each D9 suffix of ADR-M003 is carried once, but octies of 2026-09-20 and of 2026-09-24, and the suffixes run through the Latin ordinals with no gap)
red-proof OK: 1 judged, 0 unchanged, 1 killer(s) drawn -> F:\tmp\dojo\redproof-adr-m003-suffix-dup-1\RED-PROOF.json
```

- `RED-PROOF.json` (sha256 `f4a536ce…`) : `mode` f2p ; base `import-fail` (`ERR_MODULE_NOT_FOUND`, module `scripts/adr-suffixes.mjs`,
  ajouté par le diff) ; gel `pass` ; digest du gel `fbe9508c…` ; tueur tiré (graine 11, population 1) `killed`, statut `assert-fail`,
  fichier rendu à l'octet (sha256 `6e814210…` avant et après). Le cas qui rougit sous le tueur : le second decies
  (`+ []`, attendu `'l.11, l.18: suffix "decies" repeats (2026-10-05, 2026-10-07), outside HISTORICAL_DUPLICATES'`).

## Tueurs

- Déclaré (ligne au-dessus du test) : `scripts/adr-suffixes.mjs:50 CONST "hs.length > 1" -> "hs.length > 2"` : un suffixe porté deux
  fois n'est plus jugé.
- Mutants à la main, mesurés dans `F:/tmp/dojo/suffixdup/tree` (pilote `F:/tmp/dojo/suffixdup/mutants.mjs`, liste `mutants.json`) :
  chacun appliqué seul comme le fait `red-proof` (texte présent une seule fois sur sa ligne), le test lancé, le fichier rendu (sha256
  contrôlé). **14 tués sur 14, tous par `ERR_ASSERTION`** : l.50 `> 1` → `> 2` ; l.50 `> 1` → `>= 1` ; l.18 `2026-09-24` → `2026-09-25` ;
  l.45 supprimée (ordre) ; l.42 supprimée (suffixe inconnu) ; l.40 supprimée (titre illisible) ; l.28 `OPENS` → `HEADING` (un titre
  illisible disparaîtrait) ; l.15 `"septies", ` retiré ; l.46 supprimée (`next` figé) ; l.30 date → `null` ; l.43 supprimée (une
  répétition reprise comme premier titre) ; l.21 `\u{2014}` → `.` (tout tiret admis) ; l.16 `, "octodecies"` retiré ; l.50
  `d.suffix === suffix && ` retiré (la paire admise sous ses seules dates). Ce dernier survivait avant le cas « nonies sous les deux
  dates de la paire », ajouté pour lui.

## R-25

- `git diff --shortstat a43b0126 -- . ':(exclude,glob)docs/**/*.md'` : vide (0 ligne) ; le seul fichier suivi modifié est l'ADR
  (`docs/`, exclu ; +2 lignes).
- Fichiers neufs comptés (`git diff --no-index --shortstat /dev/null <fichier>`) : `scripts/adr-suffixes.mjs` 53,
  `scripts/adr-suffixes.d.mts` 11, `test/adr-m003-suffixes.test.ts` 45. **Total compté : 109 lignes**, sous 1 150 (mission) et
  1 205 (borne de CI). Ce G0 n'est pas compté.

## Contrôles

- `node -r ./test/helpers/blocking-stdout.cjs --test --test-timeout=300000 --test-force-exit test/adr-m003-suffixes.test.ts` : 1 test,
  1 vert.
- `npx --no-install tsc --noEmit` : sortie 0. `npx --no-install eslint test/adr-m003-suffixes.test.ts` : sortie 0, et 0 aussi avec les
  six règles du cliquet (`lint-ratchet.json`) réactivées sur ce fichier. `node scripts/lint-ratchet.mjs` au gel : « 69/69 », sortie 0.
  ESLint ignore `*.mjs` et `*.d.mts`.
- `node scripts/lang-gate.mjs` : 0 occurrence française, toutes portées (le module et le test sont dans la portée `root`).

## Questions (avec mon défaut)

- **Q-1 (au-delà d'octodecies)** : la liste s'arrête à octodecies, dernier terme nommé par la mission ; l'ordre bis … septdecies vient
  du brouillon de RECHERCHES (section 0) et d'octodecies de la mission : aucune source primaire n'a été lue par ce lot (réseau interdit
  par la mission). **Défaut** : liste fermée ; un 19ᵉ addendum D9 rougit le test (« is not in LATIN_ORDINALS ») tant que la liste n'est
  pas allongée par un lot qui cite une source lue. Item formé **ADR-M003-SUFFIX-LIST-1**, déclencheur : avant l'écriture du 19ᵉ titre
  D9 (17 aujourd'hui, 18 avec R25-REGISTRY-ROOT-1). Demande de procurement formée : *Guide de légistique* (Secrétariat général du
  Gouvernement et Conseil d'État), édition en ligne sur legifrance.gouv.fr, fiche sur la numérotation des articles insérés (bis, ter,
  quater…) ; ISBN de l'édition imprimée et numéro de la fiche à relever ; tentative : aucune (réseau interdit au lot) ; usage : lire
  [lu] les termes 2 à 18 de `LATIN_ORDINALS` et leurs suivants.
- **Q-2 (ordre du fichier)** : le test exige que chaque nouveau suffixe paraisse dans l'ordre de la liste ; un addendum placé plus haut
  que le précédent, près de son sujet, rougit. **Défaut** : oui, l'ADR s'écrit à la suite, et « le prochain suit le dernier » ne vaut
  que dans cet ordre. Variante : ne contrôler que l'ensemble (aucun trou), pas l'ordre.
- **Q-3 (date)** : un titre sans date est admis (bis n'en a pas) ; un doublon sans date est refusé, la paire fermée comparant des
  dates. **Défaut** : ne pas exiger de date (hors mission). Variante : date exigée sauf pour bis (liste fermée).
- **Q-4 (renvois par numéro de ligne)** : décalage de 2 lignes (Construction). **Défaut** : les pièces datées gardent leurs numéros,
  comme après le complément à D9 quindecies (qui avait décalé le second quaterdecies de l.205 à l.207).
- **Q-5 (la note épinglée ?)** : le test ne lit pas la note de registre. **Défaut** : non, la paire est fermée dans le code, la note la
  documente. Variante : exiger la ligne `**Note de registre des suffixes de D9` juste après le second octies.
