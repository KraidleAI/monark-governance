# G0 - lot CODEQL-ALERTS-2 (alertes CodeQL #41, #43, #44, #45 du tronc, fichiers de test seulement)

- **Mission** : `coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-158-codeql.md` (dépôt de coordination, `583f859`), section 4.
- **Règle** : ADR-CODEQL-ALERTS-1, D4 (réécriture inline, plus forte, jamais affaiblie, avec la preuve de sémantique identique) et D6 (rejet justifié pour un faux positif seulement, exécuté par MONARK sur justification écrite ; aucune alerte réelle rejetée).
- **Branche** : `recherches/codeql-alerts-2`, depuis le tronc `lot/etude-suite` @ `023801ecf360275d776201217b9d056cec8b18e2`.
- **Zone ouverte** : `test/dojo-render.test.ts`, `test/red-proof.test.ts`, `test/public-surfaces-honesty.test.ts` ; plus ce G0, le G7 et la ligne datée sous l ADR (docs, hors pathspec R-25).
- **Modèle** : #159 (alerte #42, `test/ci-gates.test.ts:1752`), une ligne : tous les métacaractères échappés.

## 1. Existant mesuré

L API `code-scanning` répond 403 à cette session (« Resource not accessible by integration ») ; les annotations du check-run `CodeQL` du tronc (`111755019295`) ne portent que l alerte #42. Les expressions signalées sont donc lues sur le code, à la ligne donnée par MONARK :

| Alerte | Règle | Ligne | Expression |
|---|---|---|---|
| #41 | `js/incomplete-multi-character-sanitization` | `dojo-render.test.ts:73` | `textOf` : `html.replace(/<[^>]*>/g, "")` puis cinq `replaceAll` d entités |
| #43 | `js/incomplete-sanitization` | `red-proof.test.ts:545` | `section` : `file.replace(/\./g, "\\.")` avant `new RegExp` |
| #44 | `js/bad-code-sanitization` | `dojo-render.test.ts:378` | `headerAt` : `` `export function usePathname() { return ${JSON.stringify(pathname)}; }` `` écrit dans un module |
| #45 | `js/incomplete-url-substring-sanitization` | `public-surfaces-honesty.test.ts:184` | `rows.findIndex((l) => l.includes("https://bell.monarkgate.tech/"))` |

## 2. Nature et décision, par alerte

- **#43, réel (borné)**. Seul `.` est échappé : un nom de fichier avec `+`, `(`, `[`, `$` ou une barre oblique inverse fait une regex fausse, et `section` rend `""` en silence (un test qui lit la section d un tel fichier serait vide). Réécriture : tous les métacaractères échappés, comme #159 (`/[\\^$.*+?()[\]{}|]/g` -> `"\\$&"`). Test rouge au tronc par assertion : `section` d un TAP dont le fichier est `test/a+b(1).test.ts` rend le corps de sa section.
- **#41, réel (borné)**. Le retrait des balises par une regex en une passe ne contrôle rien : sur du balisage mal formé (`<td>a<b</td>`), il avale du texte en silence. Le balisage vient de `renderToStaticMarkup`, qui échappe `< > & " '` dans le texte et les attributs : un `<` ou un `>` hors balise, ou un `&` hors des cinq entités, n y apparaît jamais. Réécriture structurelle : un découpage en jetons (balise `<[^<>]*>`, texte `[^<>]+`) ; un `<` ou `>` isolé lève ; les entités sont décodées en une seule passe, et un `&` nu lève. Sur le balisage de React, la sortie est identique (les tests existants restent verts) ; sur le balisage mal formé, l ancien code rend un texte faux, le nouveau lève. Tests : (a) rouge au tronc par assertion : `textOf` lève sur trois entrées mal formées ; (b) identité : pour des textes hostiles (`a<b>&"'`, `&amp;lt;`, `</td>`), `textOf` du rendu React d une cellule rend le texte exact.
- **#44, faux positif sur le fond, réécrit quand même (D4, identité prouvée)**. `JSON.stringify` d une chaîne est un littéral JavaScript valide pour toute chaîne depuis ES2019 (U+2028, U+2029 compris ; substituts isolés échappés), et le module écrit n est jamais servi en HTML. Réécriture sans `JSON.stringify` ni génération fragile : `jsLiteral(s)` écrit chaque unité UTF-16 en `\uXXXX` ; le littéral ne porte aucun guillemet, barre oblique inverse, chevron ni fin de ligne de l entrée. Test (vert au tronc et au gel, preuve d identité, pas un test rouge) : pour des chemins hostiles, `JSON.parse(jsLiteral(s)) === s` et le module importé rend `s` ; le littéral matche `^"(\\u[0-9a-f]{4})*"$`. Si l analyse du PR signale encore la ligne, repli D6 (justification rédigée au G7).
- **#45, réel au sens du test (borné)**. Le test prend pour ligne de Bell la première ligne du tableau qui contient la sous-chaîne, dans n importe quelle cellule. Une ligne antérieure qui cite l URL de Bell dans ses lecteurs, ou une URL `https://autre.example/?https://bell.monarkgate.tech/`, serait prise pour celle de Bell. Réécriture : la ligne de Bell est celle dont le premier span de la cellule « surface » a `new URL(...).protocol === "https:"` et `host === "bell.monarkgate.tech"` (égalité stricte, aucun suffixe), et il y en a exactement une. Test : la fonction rejette ces lignes hostiles et trouve l unique ligne de Bell du README.

## 3. Tests rouges d abord, puis tueurs

Ordre des commits : G0 ; tests ; gel. Le commit de tests ajoute les tests contre les aides du tronc : #43 et #41 (a) sont rouges par assertion (F2P) ; #41 (b) est vert (identité) ; les tests de #44 et #45 visent des aides nouvelles et sont dans le commit du gel.

Tueurs (forme close ; ils mutent du code de test, l outil les refuse : appliqués à la main) :
- #43 : `// killer: test/red-proof.test.ts:<ligne de section> CONST "[\\\\^$.*+?()[\\]{}|]" -> "."` (retour à l échappement du seul point).
- #41 : la garde du `<`/`>` isolé retirée (SDL) ; l identité reste verte, le test (a) rougit.
- #45 : `host ===` remplacé par un test de sous-chaîne sur la ligne entière.
- #44 : l échappement réduit à la seule unité ASCII imprimable laissée telle quelle (le littéral perd sa forme close).

## 4. Vérifications prévues

Les trois fichiers ; `npm test` ; `tsc` ; `lint` ; `lint:ratchet` ; `gate:vocab` ; `lang:gate` ; `npm run test:export` (g3-export) ; `gate:vocab && typecheck && test:main` (g3-verification) ; red-proof `--base 023801ec --draw n --seed 37` ; ancres `--touched 023801ec HEAD`. CodeQL CLI absent de la machine : le juge est l analyse CodeQL de GitHub sur la PR.

## 5. R-25

Trois fichiers de test, estimé 60 à 120 lignes, sous 547.

## 6. Ligne datée

Sous D4 d ADR-CODEQL-ALERTS-1, texte au G7.
