# G7 - lot CODEQL-ALERTS-2 (alertes CodeQL #41, #43, #44, #45 du tronc, fichiers de test seulement)

- **Mission** : `coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-158-codeql.md` (`583f859`), section 4. G0 : `docs/G0-lot-codeql-alerts-2.md`.
- **Branche** : `recherches/codeql-alerts-2`, depuis le tronc `023801ec` ; tronc fusionné après #156 et #159 (`32aba758`, commit de fusion `b15abb0f`, sans conflit). Pas de PR ouverte (consigne).
- **Commits** : G0 `ac35b6c6` ; tests rouges `9835e90e` ; gel `0a9e33f4` ; fusion du tronc `b15abb0f` ; ce G7 et la ligne datée d ADR.
- **Zone** : `test/dojo-render.test.ts`, `test/red-proof.test.ts`, `test/public-surfaces-honesty.test.ts` ; docs (G0, G7, ADR) hors pathspec.
- **Source des alertes** : l API `code-scanning` répond 403 à cette session ; les annotations du check-run `CodeQL` du tronc ne portent que #42. Les expressions sont lues sur le code, aux lignes de la mission (G0, section 1). CodeQL CLI absent de la machine : le juge est l analyse CodeQL de GitHub sur la PR.

## 1. Par alerte

| Alerte | Nature | Réécriture | Test | Tueur (à la main) |
|---|---|---|---|---|
| #43 `js/incomplete-sanitization`, `red-proof.test.ts:545` | **réel, borné** : seul `.` échappé ; `test/a+b(1).test.ts` rendait `"1"` (le groupe capturant de la regex), `test/[x].test.ts` rendait la section de `test/x.test.ts` | `file.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")`, comme #159 ; la ligne reste `:545` | `red_proof_tap_section_reads_a_file_name_with_regex_metacharacters_literally` : **rouge au tronc par assertion** (`9835e90e`), vert au gel | `// killer: test/red-proof.test.ts:545 CONST "/[\\\\^$.*+?()[\\]{}|]/g, \"\\\\$&\"" -> "/\\./g, \"\\\\.\""` : tué (assertion) |
| #41 `js/incomplete-multi-character-sanitization`, `dojo-render.test.ts:73` | **réel, borné** : le retrait des balises en une passe ne contrôle rien ; `<td>a<b</td>` rendait `a` en silence | découpage en jetons (`<[^<>]*>`, `[^<>]+`, `[<>]`) ; un `<` ou `>` isolé lève ; entités décodées en une passe (`&(?:#x27\|quot\|lt\|gt\|amp);\|&`), un `&` nu lève. `textOf` est désormais `:75` | (a) `dojo_render_text_of_refuses_markup_react_never_writes` : **rouge au tronc par assertion** (« Missing expected exception »), vert au gel ; (b) `dojo_render_text_of_reads_back_any_text_react_renders` : vert au tronc et au gel (identité : six textes hostiles rendus par React, relus exacts) ; tous les tests existants de `dojo-render` verts (sortie identique sur le balisage de React) | (a) `// killer: test/dojo-render.test.ts:76 SDL ": /^[<>]$/.test(t) ? assert.fail(" -> ""` : tué ; (b) `// killer: test/dojo-render.test.ts:74 CONST "\"&amp;\": \"&\"" -> "\"&amp;\": \"&amp;\""` : tué |
| #44 `js/bad-code-sanitization`, `dojo-render.test.ts:378` | **faux positif sur le fond** : `JSON.stringify` d une chaîne est un littéral JavaScript valide pour toute chaîne (ES2019 : U+2028 et U+2029 admis, substituts isolés échappés) ; le module est écrit dans un répertoire temporaire et importé par Node, jamais servi en HTML | réécrit quand même (D4, identité prouvée) : `jsLiteral(s)` écrit chaque unité UTF-16 en `\uXXXX`. Plus de `JSON.stringify` dans le code généré ; la ligne est désormais `:406` | `dojo_render_header_stub_writes_any_pathname_as_a_closed_literal` : huit chemins (`/dojo`, `/`, guillemet et `throw`, `</script><!--`, barre oblique inverse et gabarit, U+2028/U+2029/LF/CR, substitut isolé, non-ASCII) : forme `^"(\\u[0-9a-f]{4})*"$`, `JSON.parse` et import du module rendent la chaîne exacte. Pas un test rouge : l ancien code était correct | `// killer: test/dojo-render.test.ts:388 CONST "c.charCodeAt(0).toString(16).padStart(4, \"0\")" -> "c.charCodeAt(0).toString(16)"` : tué (`SyntaxError` du `JSON.parse`, à la main) |
| #45 `js/incomplete-url-substring-sanitization`, `public-surfaces-honesty.test.ts:184` | **réel au sens du test, borné** : la ligne de Bell était la première contenant la sous-chaîne, dans n importe quelle cellule | `bellRowOf(rows)` : la ligne dont la cellule « surface » commence par un span (`` /^\s*` ``…) écrit `https://bell.monarkgate.tech/…` (`startsWith`), URL `https:` avec `new URL(...).host === "bell.monarkgate.tech"`, sans partie utilisateur (pli G2 m2, m3) ; exactement une, sinon l assertion échoue. La ligne `:184` devient `:205`, `const bell = bellRowOf(rows);` | `readme_bell_row_is_read_by_exact_host_never_by_substring` : neuf leurres (URL de Bell citée dans une autre cellule, en requête, hôte suffixé, `http:`, partie utilisateur, span hors de la cellule surface ; au pli G2 : hôte préfixé `evilbell`, port `:443` écrit, texte avant le span) refusés ; deux lignes de Bell refusées ; la ligne vraie trouvée après les leurres. `readme_names_the_dojo_surface_and_its_verifier` vert sur le vrai README | `` // killer: test/public-surfaces-honesty.test.ts:169 CONST "first.startsWith(`https://${BELL_HOST}/`) && u.protocol === \"https:\" && u.host === BELL_HOST" -> "l.includes(BELL_HOST)" `` (retour à la sous-chaîne, réécrit au pli G2) : tué (« 7 found ») |

Écarts au G0 : aucun sur le fond. Le tueur de #44 est celui de la largeur de l échappement (la forme close perdue), pas un retour à `JSON.stringify` : ce retour garde l identité, il n est pas un mutant (l ancien code était correct).

## 2. Red-proof

`node scripts/red-proof.mjs --base 023801ec --gel 0a9e33f4 --repo <wt> --draw 5 --seed 37` : **REFUSED**, attendu. 6 tests jugés, 59 inchangés, 0 tueur tiré. Cinq refus « invalid killer: … is test code » : le code réécrit est dans les fichiers de test, l outil n admet que des tueurs de production. Un refus « green at base » : `readme_names_the_dojo_surface_and_its_verifier`, modifié d une ligne (appel de `bellRowOf`), vert au tronc et au gel, comme il se doit pour un contrôle durci sur un README juste. L outil prend aussi le fichier de test du gel pour la base : le rouge au tronc se lit donc sur le commit `9835e90e` (tests contre les aides du tronc) : 2 rouges par assertion, 1 vert (identité). `RED-PROOF.json` sha256 `32422dd41701e1bcd69b17cba26f361bd4fdf9c6db9e86cffc3508e94d89353a`. Les cinq tueurs sont appliqués à la main (tableau ci-dessus) : 5 sur 5 tués.

## 3. Vérifications (tête `b15abb0f`, la fusion du tronc ; ce commit n ajoute que des docs, Node 24.21.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| les trois fichiers (`dojo-render`, `red-proof`, `public-surfaces-honesty`) | 65/65 au gel ; 65/65 après la fusion du tronc |
| `npm test` complet | **2 401 tests, 2 379 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 |
| `npm run test:export` (job `g3-export`) | vert (1/1), exit 0 |
| `gate:vocab && typecheck && test:main` (job `g3-verification`) | vert : `gate:vocab` OK, `typecheck` 0, `test:main` 2 400 tests, 2 378 verts, 0 rouge, 22 sautés |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` | OK ; OK |
| ancres `--touched 32aba758 HEAD` | 75 tueurs, 75 ANCRE, 0 DERIVE, 0 PERDU (`--touched 023801ec HEAD`, qui inclut #156 : 152/152 ANCRE) |
| tueurs à la main | 5/5 tués |
| CodeQL CLI | absent de la machine ; juge : l analyse de GitHub sur la PR |

Aucune ligne pointée par un tueur d un autre fichier ne bouge : la seule référence externe à ces fichiers (`test/bell-legal.test.ts:33` -> `public-surfaces-honesty.test.ts:41`) reste juste, les ajouts de ce fichier sont après la ligne 160.

**R-25** (`r25()` de `scripts/oracle/r25.mjs`, sur le `ci.yml` de la tête) : contre le tronc `32aba758` : `STAT 62 insertions, 6 deletions, changed 68`, `CONTENT_STAT 0`, GREEN, sous 547. Même compte contre `023801ec` (le tronc n a pas touché ces fichiers).

## 4. D6 : aucun rejet demandé ; repli écrit pour #44 seul

Les quatre alertes sont fermées par réécriture. Aucun rejet n est demandé à MONARK. Si l analyse CodeQL de la PR signale encore la ligne de #44 (`test/dojo-render.test.ts:406`, ou `:388`), MONARK peut la rejeter en « false positive » avec cette justification :

> Faux positif. La ligne écrit le stub `next/navigation` d un test dans un répertoire temporaire ; Node l importe, aucun navigateur ne le reçoit, rien ne l évalue hors de ce test. Le chemin vient des littéraux du test. Le littéral est construit fermé : chaque unité UTF-16 est écrite en `\uXXXX`, il ne contient aucun guillemet, barre oblique inverse, chevron ni fin de ligne de l entrée. Le test `dojo_render_header_stub_writes_any_pathname_as_a_closed_literal` épingle la forme `^"(\\u[0-9a-f]{4})*"$` et l aller-retour exact (`JSON.parse` et import) sur huit chemins hostiles. Aucune injection de code n est possible. (ADR-CODEQL-ALERTS-1 D4, ligne datée du 2026-10-05.)

#41, #43 et #45 sont réels (bornés aux tests) : leur rejet est interdit (D6). Si l analyse les signale encore, c est un nouveau lot de réécriture, pas un rejet.

## 5. Ligne datée sous D4 d ADR-CODEQL-ALERTS-1 (versée dans `docs/adr/ADR-CODEQL-ALERTS-1.md`, entre D4 et D5)

> **Ligne datée D4 — 2026-10-05 (alertes #41, #43, #44, #45 du tronc `lot/etude-suite`, levées par la première analyse du tronc devenu branche par défaut ; lot CODEQL-ALERTS-2, mission de MONARK du 2026-10-05)** : quatre réécritures inline dans trois fichiers de test, aucune alerte rejetée. **#43** (`test/red-proof.test.ts`, `section`) : tous les métacaractères échappés avant `new RegExp`, comme #159 pour #42 ; réel : `test/a+b(1).test.ts` rendait `"1"` (le groupe capturant de la regex) et `test/[x].test.ts` lisait la section de `test/x.test.ts`. **#41** (`test/dojo-render.test.ts`, `textOf`) : découpage en jetons au lieu d un retrait des balises par une regex ; un `<` ou un `>` hors balise, ou un `&` hors des cinq entités que React écrit, lève ; entités décodées en une passe ; réel au sens du contrôle : `<td>a<b</td>` avalait du texte en silence. **#45** (`test/public-surfaces-honesty.test.ts`) : la ligne de Bell est celle dont la cellule « surface » s ouvre (regex ancrée au début de la cellule) sur une URL écrite `https://bell.monarkgate.tech/…` et d hôte exactement `bell.monarkgate.tech` (égalité de `new URL(...).host`, protocole `https:`, sans partie utilisateur), et il y en a une seule ; réel au sens du test : une ligne antérieure qui citait l URL de Bell aurait été prise pour la sienne. **#44** (`test/dojo-render.test.ts`, stub `usePathname`) : faux positif sur le fond (`JSON.stringify` d une chaîne est un littéral valide pour toute chaîne, et le module n est jamais servi en HTML), réécrit quand même : `jsLiteral` écrit chaque unité UTF-16 en `\uXXXX` ; identité prouvée par aller-retour (`JSON.parse` et import du module) sur huit chemins hostiles. Rouges au tronc par assertion : #41 et #43 ; tueurs, sur du code de test donc appliqués à la main, 5 sur 5 tués. Si l analyse CodeQL de la PR signale encore une de ces lignes, seul #44 peut passer en rejet D6, sur la justification écrite du G7 (section 4) ; aucune alerte réelle n est rejetée. **Livré par** : lot CODEQL-ALERTS-2 (G7 `docs/G7-lot-codeql-alerts-2.md`).

## 6. Pli de la G2 (`G2-codeql-alerts-2.md`, APPROUVE, quatre mineurs)

| Mineur | Devenu |
|---|---|
| **m1** leurre à hôte préfixé | ajouté : `https://evilbell.monarkgate.tech/`. Mutant `u.host === BELL_HOST` -> `u.host.endsWith(BELL_HOST)`, à la main : **tué** (« 3 found ») quand il remplace le contrôle d hôte et la graphie (m2) ensemble. Seul, avec la graphie gardée, il **survit, équivalent** : `startsWith("https://bell.monarkgate.tech/")` fixe déjà l hôte, les deux contrôles se doublent. Le tueur déclaré (l.169) est réécrit pour viser les trois conjoints : retour à `l.includes(BELL_HOST)`, tué (« 7 found ») |
| **m2** graphie exacte | ajoutée en conjonction, aucun contrôle retiré : `` first.startsWith(`https://${BELL_HOST}/`) ``. Le contrôle est désormais plus strict sur chaque axe que l ancien (`l.includes("https://bell.monarkgate.tech/")`). Mutant « graphie retirée », à la main : **tué** par le leurre `https://bell.monarkgate.tech:443/` (`new URL` retire le port par défaut : « 2 found ») |
| **m3** « s ouvre sur » | regex ancrée : `` /^\s*`([^`]+)`/ `` sur la cellule. Leurre ajouté : `` see `https://bell.monarkgate.tech/` ``. Mutant « ancre retirée », à la main : **tué** (« 2 found »). Le test du README reste vert |
| **m4** ligne d ADR, #43 | alignée sur la section 1 : `a+b(1)` rendait `"1"`, `[x]` lisait la section de `x` (ligne de la section 5 et de l ADR) |

### 6.1 Vérifications du pli (commit `5beedb5c`, puis fusion du tronc `171d6b2f` en `f614c518`, sans conflit)

Les trois fichiers 65/65 ; `npm run test:export` vert ; `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; ancres `--touched 171d6b2f HEAD` 75/75 ANCRE, 0 DERIVE, 0 PERDU ; tueur déclaré de #45 tué à la main ; mutants m1 (avec la graphie retirée), m2 et m3 tués à la main, m1 seul équivalent (ci-dessus). **R-25** contre le tronc `171d6b2f` : `STAT 63 insertions, 6 deletions, changed 69`, `CONTENT_STAT 0`, GREEN, sous 547.
