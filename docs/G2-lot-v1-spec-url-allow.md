# G2 — lot V-1 : `URL_ALLOW` admet `https://github.com/KraidleAI/monark-kata-spec`

- Dépôt : KraidleAI/monark-governance, worktree `/home/user/monark-governance-v1`, branche `recherches/v1-spec-url-allow`, tête `e0ac3fc1`, base `ec0e023d`.
- Périmètre : `git diff ec0e023d..e0ac3fc1` (3 fichiers : G0, `scripts/public-text-deny.mjs` l.12 et l.117, `test/public-text-deny.test.ts` +12) et `docs/G0-lot-v1-spec-url-allow.md`.
- Worktree laissé intact : sha256 de `scripts/public-text-deny.mjs` = `286508af…8e544` avant et après les mutants ; `git status` ne montre que le lien `node_modules` non suivi.

## Verdict : **non bloquant**

L'alternative ajoutée est ancrée (`^`), à schéma `https` seul, à hôte exact `github.com`, à nom exact suivi d'une borne `(?:[/?#]|$)`. Aucun contournement propre à la nouvelle alternative : tout ce qui passe passe déjà, à l'identique, par l'alternative `KraidleAI/Monark` existante. Restent deux trous de couverture du test (mutants survivants) et une faiblesse préexistante de classe (chemins `..`, URL imbriquée en requête).

## Sondes (Node 24, `checkPublicText("Spec: <u> now", "notes")`)

| Entrée (suffixe de `https://github.com/KraidleAI/monark-kata-spec`) | Résultat |
|---|---|
| `@evil.com` | refusé (g, et p) |
| `.evil.com` | refusé (g) |
| `:443` | refusé (g) |
| `%2F..%2Frecherches` | refusé (g) |
| `\..\recherches` (barres inverses) | refusé (g) |
| `'evil` | refusé (g) |
| `https://x@github.com/…`, `https://github.com@evil.com/…` (userinfo) | refusés (g, p) |
| tirets look-alike U+2010 (`monark‐kata‐spec`) | refusé (g) — NFKC ne les replie pas |
| `ｈｔｔｐｓ://ｇｉｔｈｕｂ.ｃｏｍ/…` (pleine chasse) | admis — NFKC replie vers la même origine, cible identique : sans effet |
| `.` final, `/.` | admis — ponctuation de fin retirée / même dépôt : sans effet |
| `HTTPS://GITHUB.COM/kraidleai/monark-kata-spec` | admis — drapeau `i`, voir N-3 |
| `/../recherches`, `/%2e%2e/recherches`, `/../../evil/x` | **admis** — voir N-1 |
| `/../monark-governance` | refusé par la règle (c), pas par (g) |
| `?u=https://evil.com`, `#@evil.com` | **admis** — voir N-2 |
| `https://github.com/KraidleAI/Monark/../recherches` (base, avant le lot) | **admis** — même classe, préexistante |

## Mutants (`node --test test/public-text-deny.test.ts`, fichier restauré après chaque)

| Mutant sur l'alternative l.117 | Résultat |
|---|---|
| tueur déclaré : alternative -> `""` | **tué** (le cas admis rougit) |
| suppression de `(?:[/?#]|$)` | tué (`-x`, `s`) |
| `https?` | tué (`http://`) |
| préfixe `monark-kata(?:-spec)?` | tué (`monark-kata`) |
| suppression du drapeau `i` | tué (vecteur en casse mixte) |
| **suppression du `^`** | **survit** — M-1 |
| **`KraidleAI` -> `[^/]+`** (toute organisation) | **survit** — M-2 |
| `[/?#]` -> `[/?#.]` | survit — couvert par M-2/M-1 (correctif commun) |

## Lint et cliquet

- `npx eslint scripts/public-text-deny.mjs test/public-text-deny.test.ts` : rc 0, 0 erreur ; `scripts/public-text-deny.mjs` est **ignoré** par la configuration eslint (avertissement « File ignored »), donc aucun `max-len` ne s'applique à la l.117. Le test passe sans erreur.
- `npm run lint:ratchet` : `69/69`, rc 0.
- La l.117 (193 car.) n'est pas une exception : le fichier compte déjà des lignes de 165 à 200 car. (l.68, 70, 72, 73, 97, 114) ; le test, une ligne de 231 car. (l.127, ajoutée) et 208 (l.30). Aucun constat.

## Cohérence des autres surfaces

- Aucune autre liste d'origines autorisées dans `scripts/`, `apps/`, `packages/` (grep `URL_ALLOW`, `monarkgate\.tech`, `KraidleAI/Monark`) : les autres occurrences sont des constantes (`release-public.mjs:34` remote de push), des commentaires ou des assertions de test.
- `apps/harness/src/tools/gate.ts:902` sert déjà l'URL du dépôt de spec ; `scripts/spec-publish.mjs:89` passe le contenu du dépôt de spec par `checkPublicText` (kind `notes`) : ce lot rend cohérent ce contenu s'il nomme son propre dépôt. Pas d'incohérence nouvelle.
- `KEY_SHAPES` garde sa règle `://` brute pour les chaînes servies (hors périmètre de ce lot, inchangé).

## Constats

### N-1 — Chemins `..` vers un autre dépôt admis (préexistant, étendu à une seconde origine)
- Reproduction : `checkPublicText("Spec: https://github.com/KraidleAI/monark-kata-spec/../recherches now", "notes").ok === true` ; idem `/%2e%2e/recherches` et `/../../evil/x`. Même chose avant le lot avec `…/KraidleAI/Monark/../recherches`.
- Jugement : GitHub ne résout pas `..` côté serveur, mais **un navigateur normalise `/../` (et `%2e%2e`) avant d'envoyer la requête** (WHATWG URL) : un clic mène réellement à `github.com/KraidleAI/recherches`. L'effet est une fuite de nom de dépôt privé dans un texte public (le dépôt lui-même reste privé, 404 pour un tiers). Seul le nom textuel fuit, et seul l'orchestrateur écrit ces textes : non bloquant, mais la règle (g) prétend refuser « tout ce qui est hors des origines ».
- Correctif : refuser tout segment point dans le chemin, pour les trois origines : avant `URL_ALLOW.test`, ajouter `|| /(?:^|[/\\])(?:\.|%2e){1,2}(?:[/\\?#]|$)/i.test(new URL(url).pathname)` — ou plus simple, comparer `new URL(url).href` normalisé : `const n = new URL(url); if (!URL_ALLOW.test(n.href) || n.username || n.password) …` (le parseur WHATWG résout `..` et `%2e%2e`, donc `…/monark-kata-spec/../recherches` devient `…/KraidleAI/recherches` et est refusé). Vecteur de test : `${spec}/../recherches` refusé par (g).

### N-2 — URL imbriquée en requête ou fragment non vérifiée (préexistant)
- Reproduction : `"Spec: https://github.com/KraidleAI/monark-kata-spec?u=https://evil.com now"` passe : `URL_ANY` consomme le jeton entier et l'URL interne n'est jamais extraite séparément. Idem avant le lot avec `…/Monark?u=…`.
- Correctif : appliquer `URL_ANY` aussi sur le reste du jeton après l'origine admise (par exemple boucler `matchAll` sur `url.slice(1)` jusqu'à épuisement), ou refuser tout `://` après la première occurrence dans un jeton admis. Vecteur : `${spec}?u=https://example.org` refusé.

### N-3 — Drapeau `i` : acceptable
- Constat : le `i` admet `HTTPS://GITHUB.COM/kraidleai/MONARK-KATA-SPEC`. Le schéma et l'hôte sont insensibles à la casse par norme, et GitHub résout propriétaire et dépôt sans tenir compte de la casse : même ressource. Cohérent avec l'alternative `KraidleAI/Monark`. Aucun correctif requis ; si l'on veut un texte public canonique, ne mettre `i` que sur `https://github\.com` (impossible en JS sans modificateur en ligne `(?i:)` — disponible en Node 24 : `^(?i:https:\/\/github\.com)\/KraidleAI\/monark-kata-spec…`), à décider pour les trois origines ensemble, pas dans ce lot.

### M-1 — Mutant « suppression du `^` » survivant
- Reproduction : remplacer `|^https:\/\/github\.com\/KraidleAI\/monark-kata-spec` par `|https:\/\/github\.com\/KraidleAI\/monark-kata-spec` à la l.117 : les 5 tests restent verts. Avec ce mutant, `https://evil.example/https://github.com/KraidleAI/monark-kata-spec` passerait.
- Correctif : ajouter aux refus du test l.127 `https://example.org/https://github.com/KraidleAI/monark-kata-spec`.

### M-2 — Mutant « toute organisation » survivant
- Reproduction : remplacer `KraidleAI\/monark-kata-spec` par `[^/]+\/monark-kata-spec` : tests verts. Aucun vecteur d'une autre organisation ni d'un hôte prolongé (`monark-kata-spec.evil.com`) n'est présent.
- Correctif : ajouter aux refus `https://github.com/evil/monark-kata-spec` et `https://github.com/KraidleAI/monark-kata-spec.evil.com` (ce dernier tue aussi le mutant `[/?#.]`).

### M-3 — Commentaire du tueur et vecteurs : cosmétique
- Le tueur déclaré est correct et tue (vérifié à la main, sha256 restauré). Les vecteurs du G0 l.20 sont tous présents dans le test. Rien d'autre.

## Résumé
Non bloquant. Livrable en l'état pour la version du jour ; M-1 et M-2 (quatre vecteurs de refus) peuvent être ajoutés sans toucher au code. N-1 et N-2 sont des faiblesses préexistantes de la règle (g), à traiter dans un lot séparé pour les trois origines.
