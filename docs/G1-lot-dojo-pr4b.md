claude-opus-5-5[1m]

# G1 — lot Dōjō PR-4b (piste C, site) : page `/dojo`, registre, assertion du rendu

- **Modèle résolu** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1), worker, effort max (mission), contexte frais.
- **Mission** : `F:/tmp/dojo/mission-g1-pr4b.md` (17 l., sha256 `204f6a1461ec5c9f4c4d848b9fba93aeff342e37325494d6e33d3d5d51897a4b`, égal à l'annonce) ; lue à 13:29:06Z (`date -u`).
- **Base** : worktree `F:/Monark-wt-dojo-c`, branche `lot/dojo-site`, HEAD `809b9da5106ce9267cefbfd5aa86a7ec7f9f844a` ; `git status --short` à l'ouverture : **vide (arbre propre)** ; 30 `node.exe` relevés à 13:47:54Z (C-V-4) ; verrou d'hôte tenu par « G1 DRAND-1a » (13:44:27Z) à ce relevé.
- **Entrées (sha256 relevés à 13:51:03Z)** : ADR de lot `docs/adr/ADR-DOJO-PR-4.md` `9b31b516…dd9c` (242 l., lu en entier) ; mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` `45500ca0…1986` (1 361 l., 13ᵉ pli : D-11, §6 T-11/T-12, §8, §10.1 P-10/P-11/P-26, §11 l.664, amendement « Treizième pli ») ; plan `docs/PLAN-DOJO-PAGE-1.md` `87db0cd9…8154` ; `apps/site/lib/dojo-served-load.ts` `89b54b15…eed0` et `apps/site/lib/dojo-served.ts` `0ed8c631…4722` (à ne pas modifier) ; `test/dojo-served.test.ts` `e2f9bdd3…74eb` ; `scripts/assert-fleet-html.mjs` `f7a1d239…67d7a4` ; `.d.mts` `bdaa51a1…d9cc5a` ; `apps/site/app/token/page.tsx` `5072d54e…3e0b` ; `scripts/public-text-deny.mjs` `e1a41fab…bd0` ; `test/ci-gates.test.ts` `f29cdf42…407c` ; `apps/site/COMPONENTS-PROVENANCE.md` `5b7d27c1…f75d`.

## 0. Compte ascendant AVANT écriture (D-2, pli cp-1 C-V-2 : coupe pré-déclarée si > 547)

Relevé à 13:51Z, avant tout fichier livrable (seul ce journal existe) ; estimation par fichier et par bloc, sur la conception arrêtée après orientation (la mesure `ci.yml:82` viendra au §7, sans retouche de ce tableau) :

| Fichier | Contenu estimé | Asc. |
|---|---|---|
| `apps/site/lib/dojo-register.ts` | types, constante du programme et de la pièce `hold-snapshot` (`upcoming`), lecture du statut | 18 |
| `apps/site/lib/dojo-copy.ts` | route, nom, titre (TXT-1), constante des paliers, TXT-2 à TXT-13 (TXT-3A, TXT-4N, TXT-5 « sixty ») | 59 |
| `apps/site/components/dojo/dojo-figures.tsx` | seul chemin de rendu des chiffres (phrase, `{nom}` → chiffre par accès de propriété) | 27 |
| `apps/site/app/dojo/page.tsx` | métadonnées statiques, E0 ⇒ `notFound()`, états E1/E2/EA, pastille | 50 |
| `apps/site/app/token/page.tsx` | lien conditionnel (libellé TXT-1, absent en E0) | 10 |
| `scripts/assert-fleet-html.mjs` | en-tête de bloc, constantes, `assertDojoBody`, branche E0, `dojoExpected`, `main()` | 105 |
| `scripts/assert-fleet-html.d.mts` | types des ajouts | 22 |
| `apps/site/COMPONENTS-PROVENANCE.md` | entrée des fichiers écrits à la main | 6 |
| `scripts/public-text-deny.mjs` | forme du nom du partenaire dans la liste d'opérateurs (DOJO-PARTNER-NAME-GATE-1) | 2 |
| `test/ci-gates.test.ts` | `dojo_register_is_frozen` (+ imports) | 36 |
| `test/dojo-page.test.ts` | cinq tests nommés + aides (racine temporaire, états de la fixture, page synthétique) | 165 |
| **Total** | | **500** |

**500 ≤ 547 : pas de coupe ; PR-4b entière.** Ratio mesuré/ascendant de la piste : ×1,34 à ×1,58 (PR-4a-1 : 315 → 499) ; attendu ≈ 670 à 790, sous 1 134 et le STOP 1 150.

**Mesuré au §7 : 543** (×1,086 de l'ascendant), sous 1 134 et le STOP 1 150.

## 1. Horaires (`date -u`)

| Heure | Acte |
|---|---|
| 13:29:06Z | lecture de la mission |
| 13:29Z → 13:50Z | orientation : ADR de lot (en entier), mère (§8, D-11, §6, §10.1, 13ᵉ pli), plan, rapport cp-1 de PR-4, journal G1 et rapport G2 de PR-4a-1, code (`dojo-served-load.ts`, `dojo-served.ts`, `test/dojo-served.test.ts`, fixture, `assert-fleet-html.mjs` + `.d.mts`, page et copie Ukemi, `/token`, portes du site, `ci.yml`) ; 30 `node.exe` à 13:47:54Z ; advisor intégré consulté (§13) |
| 13:51:03Z | sha256 des entrées ; §0 écrit (seul fichier existant) |
| 13:5xZ | sonde hors dépôt (`F:/tmp/dojo/pr4b-probe/ea-probe.mts`) : E1, E1 à tête abstenue, E2, E2 à tête abstenue passent tous `buildDojoServed` avec le vrai `verifyDojoServed` ; textes extraits verbatim de la mère §8 et de l'ADR D-1 (`extract-texts.mjs` → `texts.json`) |
| 13:52Z → 13:54Z | `dojo-register.ts`, `dojo-copy.ts` écrits ; `texts-check.mts` : 15/15 égaux aux textes acceptés (deux écarts déclarés, §4) ; `dojo-figures.tsx`, `page.tsx`, lien de `/token` écrits |
| 13:54:51Z | clone `--no-local` `F:/tmp/dojo/pr4b-clone` (HEAD `809b9da`), fichiers du lot copiés (`cmp`) |
| 13:55:17Z | `next build` (Turbopack) sur jonctions `mk-nm.ps1` : **exit 1**, « Could not find the Next.js package » (Turbopack refuse un lien sortant de la racine ; précédent consigné au tronc) ; jonctions retirées (`rm-nm.ps1`) |
| 13:58:11Z → 13:59:20Z | `npm ci --offline --ignore-scripts --cache F:/tmp/npm-cache` dans le clone : 284 paquets, aucun accès réseau, lock inchangé |
| 13:59:28Z | build : exit 1, TS2322 dans `dojo-figures.tsx` (une interface n'a pas de signature d'index) ; corrigé (`Map` sur `Object.entries`) |
| 14:00:15Z → 14:00:31Z | build E0 : exit 0 ; **DOJO-NEXT-NOTFOUND-1 mesuré** (§6) ; `node scripts/assert-fleet-html.mjs` E0 : exit 0 |
| 14:04:01Z → 14:05:51Z | harnais de données (§6) : builds E1, E2, EA verts ; EA sous version refusé au build (choix fail-closed, Q-2) |
| 14:10:05Z → 14:12:55Z | tests écrits ; `tsc` 0, `eslint` 0, `gate:vocab` 0, `lang:gate` 0 (après réécriture d'une regex portant « le »), `export:check` 0 ; `lint:ratchet` **76/69**, mesuré préexistant (§10) |
| 14:15:32Z → 14:16:01Z | clone des mutants `F:/tmp/dojo/pr4b-mutants/tree` (`--no-local`, `809b9da`), `npm ci --offline` |
| 14:17:25Z → 14:24:10Z | série de trace (témoin + 13), un cas du test corrigé (pastille), mutants du registre rejoués (§5) |
| 14:24:24Z → 14:25:28Z | export-run (§9) |
| 14:26:30Z → 14:32:23Z | **série qui fait foi** sur les fichiers livrés : témoin vert, **13/13 tués** (12 de la liste fermée + M-P17b), 14 restaurations au sha256 |
| 14:33Z | six tests nommés, deux passages isolés : 6/6 et 6/6 ; R-25 = 543 ; oracle lancé sous verrou (en attente : « G2 DRAND-1a », 14:31:25Z) |
| 14:34Z → 15:37Z | journal écrit pendant l'attente ; voisins rejoués (`visage-register`, `site-docs`, `public-surfaces-honesty`, `token-ca-pinned` : verts) |
| 15:37:14Z → 15:55:46Z | verrou pris (3 840 s d'attente) : passage 1 (6/7 + rouges transitoires), passage 2 (6/7 : seul `lint:ratchet`, préexistant), test 42 à part ✔ ; verrou rendu |
| 15:56:00Z → 15:58:36Z | rejeu isolé des rouges du passage 1 : verts ; journal clos, livraison (§15) |

## 2. Livrables

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `apps/site/app/dojo/page.tsx` | créé | 60 | `46548f7b281100b8cbb6756620ec789ac0a44fc2f75420a9961d75f50f3ef6fe` |
| `apps/site/components/dojo/dojo-figures.tsx` | créé | 27 | `41ac0249c7b19029277d496d180617bdeed6aea33dea46ff4116bcbf83cf6def` |
| `apps/site/lib/dojo-copy.ts` | créé | 59 | `e7d35feedc6b137382279c7bb0a55d4d532a8a5df6605b3757cfee90063b2565` |
| `apps/site/lib/dojo-register.ts` | créé | 20 | `913f0ece502e887721abcd22345d78855cc864c9d350fb70a573e22cc4811bdb` |
| `apps/site/app/token/page.tsx` | modifié (+10) | 148 | `b2acc900e6d3772373f8b755fe3d7eb2ea2666bfccf8923e4f9600a61e238f49` |
| `scripts/assert-fleet-html.mjs` | modifié (+136) | 763 | `7dac3f263eae46e8f2b928f4ce8a90c03b36fcf37743a68e9250d974285d4f6b` |
| `scripts/assert-fleet-html.d.mts` | modifié (+24) | 112 | `5d8c8c2febc6e700d288afbe40b22310c9a6281c2556e9c87d4542ef03912f9b` |
| `apps/site/COMPONENTS-PROVENANCE.md` | modifié (+10) | 170 | `4bff9fa96ac03d6d5e140aa40b6b997a679aa473fd506bf93c0eb60424a458be` |
| `scripts/public-text-deny.mjs` | modifié (+2) | 183 | `4beada762af72c997c60f4c9291fd797bd60d0e0c5bccab2ecd654e9666bc269` |
| `test/ci-gates.test.ts` | modifié (+42) | 1 744 | `79c6bcec24e45a5c9e684832d14040436b7a08b95d0bcecbaf5c6a2832c2310a` |
| `test/dojo-page.test.ts` | créé | 153 | `5f8c15d23d6a9c52b83a132b59f908400ea3c50147414f66a991216e39852700` |
| `docs/G1-lot-dojo-pr4b.md` | créé (ce journal, hors R-25) | — | rendu hors du fichier |

Inchangés (`git diff --stat 809b9da` vide sur eux) : `apps/site/lib/dojo-served-load.ts` (`89b54b15…eed0`), `apps/site/lib/dojo-served.ts` (`0ed8c631…4722`), `apps/site/lib/fleet.ts`, `package.json`, `package-lock.json`, `apps/site/package.json`, `apps/site/data/**` (aucun `dojo-served.json`, aucune entrée de manifeste : **état public inchangé, E0, registre `upcoming`**). Deux fichiers hors de la liste du §2 de la mission sont touchés, chacun par une règle de la mission : `scripts/public-text-deny.mjs` (DOJO-PARTNER-NAME-GATE-1, §4 point 7) et `test/ci-gates.test.ts` (lieu imposé du test `dojo_register_is_frozen`, ADR D-3).

## 3. Interfaces

```ts
// apps/site/lib/dojo-copy.ts (données pures, aucun chiffre hors « SHA-256 » et « Ed25519 », même dans la source)
export const DOJO_ROUTE = "/dojo"; export const DOJO_NAME = "Dōjō"; export const DOJO_TITLE /* TXT-1 */;
export const DOJO_TIER_NAMES = ["Egg", "Caterpillar", "Chrysalis", "Monarch", "Migration"] as const;   // seule écriture des noms
export const DOJO_TEXT = { lead /*TXT-2*/, counted /*TXT-3*/, abstained /*TXT-3A*/, totals /*TXT-10*/, holders /*TXT-11*/, tiers /*TXT-4*/,
  noVersion /*TXT-4N*/, tier /*TXT-12*/, method /*TXT-5 « sixty »*/, exclusion /*TXT-6*/, bounds /*TXT-7*/, check /*TXT-8*/, tree /*TXT-9*/, beacon /*TXT-13*/ };
// apps/site/lib/dojo-register.ts
export type DojoPiece = { key: "hold-snapshot"; name; status: "upcoming" } | { key: "hold-snapshot"; name; status: "built"; served: { path; tests; note } };
export const DOJO_REGISTER: { program: "MONARK Dōjō"; pieces: [hold-snapshot, upcoming] }; export function holdSnapshotStatus(register?): "built" | "upcoming";
// apps/site/components/dojo/dojo-figures.tsx
export function DojoSentence({ text, figures }): JSX;   // chaque {nom} de la phrase ⇒ <span> du chiffre de ce nom ; nom absent de l'état ⇒ throw
// scripts/assert-fleet-html.mjs (exporté au miroir public, mesuré §9)
export const DOJO_HTML_REL, DOJO_META_REL, TOKEN_HTML_REL, DOJO_NAMED_IDS /* SHA-256, Ed25519 */, DOJO_TIER_NAMES /* liste fermée tenue à part */, DOJO_FORBIDDEN;
export function assertDojoBody({ html, expected }): { state, figures, corpusChars, status };             // E1, E2, EA
export function assertDojoAbsent({ dojoHtml, dojoMeta, tokenHtml }): { page };                         // E0
export async function dojoExpected(dataRoot = REPO_ROOT): { state: "E0" } | { state, figures, sentences, absent, tierNames, status };
```

- `main()` : après les blocs `/fleet`, `/ukemi` et Bell, inchangés ; E0 ⇒ `assertDojoAbsent` (`dojo.html`/`dojo.meta` lus s'ils existent, `token.html` exigé) ; sinon `assertDojoBody` sur `dojo.html`, `dojo.meta` non 404, et le `<main>` de `/token` porte `href="/dojo"` et le libellé TXT-1.

## 4. Décisions de ce G1 et écarts (chacun déclaré ; aucune phrase hors liste fermée, aucune valeur inventée)

1. **Textes = liste fermée, vérifiée octet pour octet** : TXT-1 à TXT-12 extraits de la mère §8 (l.516-527) et TXT-3A, TXT-4N, TXT-13 de l'ADR D-1 (l.83-87) par script (jamais retapés) ; `texts-check.mts` : **15/15 égaux**, avec exactement deux écarts déclarés : TXT-5 « thirty days in a row » → « sixty days in a row » (DOJO-TXT-60-1, accepté au cp-1) ; le paramètre de TXT-4 `{threshold_unit}` s'écrit `{threshold_unit_token_days}`, nom du chiffre composé (unité décalée par `decimals`, mère D-11 l.272 « `threshold_unit` en jetons-jours ») : la phrase rendue est la même. TXT-14 et suivantes absentes (aucune phrase de relecture : le test l'exige, M-L11 garde PR-4c-1).
2. **Un seul chemin des chiffres** : les phrases portent `{nom}` ; `DojoSentence` remplace chaque `{nom}` par le chiffre de ce nom, lu par accès de propriété dans les chiffres de `dojoPageFiguresOf` (module de PR-4a-1, inchangé), dans son propre élément ; un nom que l'état ne porte pas lève (le build rougit). La page et le composant ne rendent **aucun texte littéral** (test `dojo_copy_is_digit_free`, par `renderedTexts` du détecteur d'honnêteté).
3. **Paliers : une seule écriture** : les cinq noms n'existent qu'une fois dans le dépôt du site (`DOJO_TIER_NAMES`) ; TXT-4, TXT-4N et TXT-12 les lisent par interpolation ; la vérification tient sa propre copie de la liste fermée (décision 224) et refuse une constante mutée (M-P10), un nom hors de ses phrases, un ordre changé.
4. **`assertDojoBody` (patron `assertUkemiBody`, trois différences déclarées)** : (a) le compte des chiffres est **par valeur et par multiplicité** (deux chiffres de même valeur, par exemple un compte de lignes égal au nombre de détenteurs, doivent apparaître deux fois : la règle « un par chiffre » de Ukemi rougirait à tort) ; (b) les noms « SHA-256 » et « Ed25519 » sont retirés du texte **avant** le compte (un `lines_count` de 256 compterait sinon deux fois) ; (c) le balayage des nombres est **strict** : aucune exemption de date ISO ni d'identifiant (celles de `scanNumericTokens`), sans quoi un jour de `history` rendu passerait (M-P17b le prouve : tué par ce seul balayage). Présences : les phrases de l'état, entières ; absences : pour chaque phrase d'un autre état, sa plus longue partie fixe ; lexique interdit (mère §8, « thirty », « independent », mot borné) ; pastille « Dōjō <statut> ».
5. **`dojoExpected()` compose ses chiffres à part** : depuis le fichier committé lu par `loadDojoServed`, jamais par `dojoPageFiguresOf` (motif `site_ukemi_build_check_derives_figures_apart`) ; le décalage décimal y est recodé ; le test épingle l'égalité des deux compositions sur la fixture (E1, E2, EA).
6. **Registre** : `served` porte `path`, `tests`, `note`, et non `served_by`/`integration_test` : ces deux identifiants sont interdits sur toute surface du site hors `lib/fleet.ts` par le fil-piège (4) de `fleet_register_built_set_is_frozen` (mesuré : rouge au premier jet, 14:10Z) ; les noms de champs ne sont fixés ni par la mère ni par l'ADR. `dojo_register_is_frozen` lit la même constante `WIRING_TEST_ROOTS` et refuse `built` sans chemin servi (M-P4), sans les deux tests d'intégration de la condition de G7 sous les racines, sans enregistrement committé listé au manifeste (jambe committée non tournée, M-P18), sans `price_version` (M-P21), ou avec une note chiffrée ; chaque refus est prouvé vivant dans le test, un à la fois. Fil-piège déclaré : la dernière assertion épingle qu'aujourd'hui seul le test non écrit de la jambe committée (`dojo_served_data_matches_deploy_ca`, PR-4a-2) refuse un `built` par ailleurs complet ; elle rougira, voulu, le jour où ce test existera (item DOJO-REGISTER-LEG-TRIPWIRE-1).
7. **DOJO-PARTNER-NAME-GATE-1** : la mission ne porte pas le nom. Il est lu dans `docs/CHANTIERS.md` l.1561 (décision 225 : « via UsePod (nom interne, « inference budget » en public) »). La liste d'opérateurs de `test/site-build-fleet.test.ts` vit désormais dans `scripts/public-text-deny.mjs` (`OPERATOR_FORMS`, « moved here from test/site-build-fleet.test.ts », l.44-46 ; fichier de gouvernance, **non exporté**, mesuré §9) : une forme y est ajoutée, `/\buse[\s._-]*pod\b/i`, `why: "inference partner"` ; elle sert `site_names_no_rpc_operator` (tout fichier exporté de `apps/site`) et la porte des textes publics (règle (f)). Aucune occurrence dans `apps/**` (mesuré). Question Q-3.
8. **`/token`** : le lien (libellé TXT-1) n'est rendu que si `loadDojoServed` rend un enregistrement ; en E0, la vérification refuse tout `href="/dojo"` dans le **corps rendu entier** de `token.html` (plus strict que le seul `<main>` de D-4 : un lien de navigation vers une page 404 serait aussi un lien).
9. **Tête abstenue sous une version en vigueur (EA avec `price_version`)** : D-1 se contredit pour cet état (colonne des chiffres : « `day` seul » ; colonne des textes : « TXT-4 ou TXT-4N selon la version », or TXT-4 porte `{threshold_unit}`). Choix fail-closed, sans phrase inventée : la page **et** `dojoExpected` lèvent (« no sentence of its own yet ») ; épinglé par le test (`assert.rejects`) et mesuré au build (EAV : exit 1). EA sans version (tête du septième jour abstenue) est rendu et vérifié (TXT-3A, TXT-4N, aucun total). Rien n'est bloqué aujourd'hui (E0). Question Q-2.
10. **TXT-3 et `k_reads`** : rendu verbatim (liste fermée) ; la question C-G2-5 (« tranché au cp-1 bref de PR-4b ») n'est pas tranchée dans la mission : sur la fixture, la page dit « 4 readings » quand trois lectures ont été faites. Question Q-1.

## 5. Mutants (liste fermée de l'ADR §4 ; copie hors dépôt `F:/tmp/dojo/pr4b-mutants/tree`, clone `--no-local` à `809b9da` + fichiers livrés, `node_modules` réels par `npm ci --offline`)

Harnais `F:/tmp/dojo/pr4b-mutants/mutants.mjs` (sha256 `8c64b7a083ad757ed73dffbd6538e9357c8243b526cec36e8deb7632fe2fe5dd`) : motif présent exactement une fois, remplacé ; préparation éventuelle (enregistrement injecté par `F:/tmp/dojo/pr4b-harness/with-data.mjs`, test nommé comme la jambe committée pour isoler la condition visée) ; contrôles : les tests du lot, les portes de noms (`site_names_no_rpc_operator`, `site_names_no_kitchen`), `test/site-honesty.test.ts`, puis, pour les états listés, `next build` frais et `node scripts/assert-fleet-html.mjs` (`run-state.sh`) ; restauration de chaque fichier, sha256 de cinq fichiers comparé à l'avant. Série qui fait foi 14:26:30Z → 14:32:23Z, `RESULTS.txt` sha256 `9e38430c5b9caf3fb25db6cdc964ed6a890316571936664bc887e31cd1a15174` (la série de trace, avant la correction du cas « pastille », est gardée en `RESULTS-trace-1.txt`).

| Mutant | Mutation | Tué par | Refus |
|---|---|---|---|
| témoin B0 | aucune | — | tests 0/0/0/0 ; builds E0, E1, E2, EA : build 0, vérification 0 |
| M-P1 | « power of 2 » tapé dans TXT-9 | `dojo_copy_is_digit_free`, `dojo_page_renders_served_figures_only`, `dojo_page_lexicon_is_closed` ; build E1 | « 1 numeric token(s) … ["2"] » |
| M-P2 | la phrase comptée rend la racine de l'historique | build E1 et E2 | « a sentence of state E1 is absent » (racine d'un autre jour) |
| M-P3 | « and its agent » dans TXT-2 | `dojo_page_lexicon_is_closed`, `…renders…` ; build E1 | « a forbidden word … /\bagents?\b/i » |
| M-P4 | `built`, `path` vide (jambe et E2 présentes) | `dojo_register_is_frozen` | refus unique « no served path » |
| M-P8 | TXT-7 retirée de la page | build E1 | « a sentence of state E1 is absent … What a snapshot shows » |
| M-P10 | Chrysalis avant Caterpillar dans la constante | `dojo_page_tier_names_are_the_closed_list` (+ deux autres) ; build E2 | « the tier names are not the closed list » |
| M-P11 | nom du partenaire dans TXT-13 | `site_names_no_rpc_operator`, `dojo_page_lexicon_is_closed` | « inference partner » (le build seul ne le voit pas : attendu, la porte est au source) |
| M-P16 | TXT-4 rendue sans version | build E1 | « a sentence of state E1 is absent … Tiers: » (TXT-4N absente, partie fixe de TXT-4 présente) |
| M-P17 | lien de `/token` rendu sans enregistrement | `dojo_page_absent_before_data` ; build E0 | « /token links to /dojo before any served snapshot » |
| M-P17b | un jour de `history` rendu sans son texte | build E1 | « 3 numeric token(s) … ["2026","10","01"] » (balayage strict) |
| M-P18 | `built` complet, aucun enregistrement committé | `dojo_register_is_frozen` | refus unique « the committed leg has not run » |
| M-P19 | « thirty » rendu dans TXT-5 | `dojo_page_lexicon_is_closed`, `…renders…` ; build E1 | « a forbidden word … /\bthirty\b/i » |
| M-P21 | `built` complet sur un enregistrement E1 | `dojo_register_is_frozen` | refus unique « the committed record carries no unit version » |

**13/13 tués** (12/12 de la liste fermée) ; **14/14 restaurations au sha256**. Limite déclarée, non cachée : M-P2, M-P8, M-P16 et M-P17b (composition de la page) ne sont tués que par la vérification du **build réel avec données** (harnais) ; dans le dépôt en E0, ni `npm test` ni `g3-site` ne rendent la page : ils le feront dès l'enregistrement committé (item DOJO-PAGE-BUILD-DATA-1, §11).

## 6. Build de la page (DOJO-NEXT-NOTFOUND-1, harnais de données, tuyaux)

- **DOJO-NEXT-NOTFOUND-1, mesuré** (Next.js 16.3.4, Turbopack, 14:00:31Z, clone `pr4b-clone`) : la route est listée `○ /dojo` (statique) ; `notFound()` au prérendu produit `dojo.html` (9 778 o), **`dojo.meta` avec `"status": 404`** et `dojo.rsc` ; le corps rendu de `dojo.html` n'a **pas de `<main>`** (texte « MONARK » seul hors charges utiles), `<title>` = « MONARK » (celui de la mise en page) ; `token.meta` sans statut (200) ; `token.html` sans `href="/dojo"`. La branche E0 de `main()` repose sur cette mesure : `dojo.meta` absent ou 404, `dojo.html` absent ou sans `<main>`, aucun lien sur `/token` ; `node scripts/assert-fleet-html.mjs` : exit 0 (« /dojo is the not-found document (status 404) »), rejoué sur le build E0 du clone, sur le témoin et M-P17 des mutants, et sur le build de l'export (§9). Limite déclarée : une page `app/not-found.tsx` propre au site qui porterait un `<main>` ferait rougir la branche E0 (rouge sûr, jamais un vert faux) ; à relire si une telle page est ajoutée.
- **`next build` hors CI** : les jonctions de `mk-nm.ps1` sont refusées par Turbopack (« Filesystem root used for resolution ») ; `node_modules` réels par `npm ci --offline --ignore-scripts --cache F:/tmp/npm-cache` (méthode de la cartographie du 2026-09-24), aucun réseau ; le build tourne donc à l'identique de `g3-site`. La suite (`npm test`) n'exige pas de build ; la page, DOJO-NEXT-NOTFOUND-1 et les mutants de composition l'exigent : fait.
- **Harnais de données** `F:/tmp/dojo/pr4b-harness/` (`with-data.mjs` `4a1c679f…c664`, `restore.sh` `80b95f10…476a`, `run-state.sh` `9056a2c6…965c`, `manifest.orig.json` `61bcb6af…e77b` = le manifeste à `809b9da`) : écrit dans le **clone seul** l'enregistrement d'un état de la fixture (clés faites à l'exécution) et son entrée de manifeste, build frais, vérification, restauration (sha256 du manifeste recontrôlé, fichier retiré). Résultats (`F:/tmp/dojo/pr4b-builds/base/`) : E1 (8 chiffres), E2 (11 chiffres), EA (1 chiffre) : build 0, vérification 0, lien de `/token` présent sous TXT-1 ; EAV : build 1 (« dojo page: an abstained head under a unit version has no sentence yet »). Rendu E1 relu (corpus du `<main>`) : « Dōjō upcoming », TXT-1, TXT-2, TXT-3 chiffrée, TXT-10, TXT-4N, TXT-5 « sixty », TXT-6 à TXT-9, TXT-13 ; `dojo.meta` sans 404 ; `<title>` = TXT-1.
- **Tuyaux (ADR §3, règle Branchement)** : TU-8 (`dojo-served.json` → `loadDojoServed` → chiffres et phrases de `/dojo` au build) **composé** : dans les tests (enregistrements de la fixture en racine temporaire → `dojoExpected` → `assertDojoBody`) et sur le build réel par le harnais ; **servi** seulement à l'acte de synchro (TU-7, PR-4a-2) ; TU-9 (`dojo-register.ts` → pastille) composé et épinglé (`dojo_register_is_frozen`, pastille vérifiée au build) ; TU-11P (`loadDojoServed` non nul → lien de `/token`) composé (`dojo_page_absent_before_data` + branche E0 de `main()`, E0 mesuré au build réel). Aucun tuyau déclaré servi ; registre `upcoming`.

## 7. R-25 (`ci.yml:82` pathspec, métrique `ci.yml:90`)

- Script `F:/tmp/dojo/pr4b-r25-methodA.mjs` (copie octet pour octet de `pr2-1-r25-methodA.mjs`, sha256 `140be120…d3bf`) : `git diff --numstat <base>` pour les suivis, `git diff --no-index --numstat /dev/null <f>` pour les non suivis ; aucune écriture git.
- **Base `809b9da` (HEAD du G1, delta propre du lot) : 543** (suivis : 10 + 10 + 24 + 136 + 2 + 42 ; non suivis : 60 + 27 + 59 + 20 + 153) ; ascendant 500 (×1,086) ; sous 1 134 (×2,1 de 540) et le STOP 1 150. Journal hors compte.
- Contre le gel 2 `1aa1acb` (lu littéralement) : 4 711, parce que `809b9da` porte la fusion du tronc (`8c60f65`, du code d'autres lots) ; la mesure opérante est celle de `809b9da` (celle que verra `r25` sur la PR, base de fusion comprise). Question Q-5.

## 8. Oracle (7 gates sous verrou d'hôte + test 42 à part ; C-V-4)

- Scripts `F:/tmp/dojo/` dérivés de ceux de PR-4a-1 (diffs : dossier temporaire `pr4b-tmp`, propriétaire « G1 PR-4b », chemin du clone) : `pr4b-run-oracle.sh` (sept gates `npm run`, huit variables payantes retirées par `env -u`, TEMP/TMP/TMPDIR sur F:), `pr4b-locked.sh` (`mkdir F:/tmp/oracle-lock` atomique, attente 60 s jusqu'à 90 min, `rmdir` dans le piège EXIT), `pr4b-oracle-pass.sh` (compte des `node.exe` au lancement), `pr4b-t42.sh`, `pr4b-passes.sh` ; une seule prise de verrou pour les deux passages et le test 42. Clone `F:/tmp/dojo/pr4b-clone` (`--no-local`, HEAD `809b9da`, fichiers du lot copiés, `cmp` égaux au worktree avant et après ; `node_modules` réels par `npm ci --offline` ; `.next` et `next-env.d.ts` du build retirés avant l'oracle, comme sur un checkout de CI ; aucun `dojo-served.json`). Node v24.15.0.
- **Attente du verrou** : lancé à 14:33Z ; tenu tour à tour par « G2 DRAND-1a », « G2 PR-3b-1 », « G1 RG-RECONCILE-1c », « G1 RG-RECONCILE-1a », « corr PR-2b-3 » ; **pris à 15:37:14Z après 3 840 s** (`session.log` `c300f0ef…f3fe`), rendu à 15:55:46Z.
- **Passage 1** (15:37:15Z → 15:44:55Z ; 27 `node.exe` au lancement) : `gate:vocab` 0, `typecheck` 0, `lint` 0, `lang:gate` 0, `export:check` 0, `lint:ratchet` **1** (76/69, préexistant, §10), `test` **1** : 1 438 tests, 1 431 ✔, **4 ✖**, 3 ignorés ; les six tests nommés ✔ et le test 42 ✔ dans la suite. Les quatre rouges, hors lot : `apps/sentinel/test/ukemi-guard-record.test.ts` (fichier entier), `u4_oracle_path_requires_all_guard_budget_args` (processus enfant sorti en `2147483651` = `0x80000003`), `u4_budget_refusal_is_canonical_and_not_retried` (enfant sorti en 134, abandon), `release_public_flow` (sortie vide de l'enfant) : signatures de **processus enfants tués sous charge**, non reproduites (`test.log` `a61edf67…6e19`). Gardé, jamais cité comme vert.
- **Passage 2, fait foi** (15:44:55Z → 15:51:58Z ; 23 `node.exe` ; mêmes fichiers) : `gate:vocab` 0, `typecheck` 0, **`test` 0 : 1 447 tests, 1 444 ✔, 0 ✖**, 3 ignorés (préexistants ; 1 447 contre 1 438 : les sous-tests du fichier Sentinel avorté au passage 1), les six tests nommés ✔, test 42 ✔ ; `lint` 0 ; `lang:gate` 0 ; `export:check` 0 ; **`lint:ratchet` 1 (76/69), préexistant et hors lot** (mesuré identique sur l'archive propre de `809b9da`, apport du lot 0) ⇒ **6/7, le septième rouge avant ce lot** (`exits.txt` `27f24460…3067`, `test.log` `58c64d57…e018`, `lint-ratchet.log` `8a4553cc…fec3`).
- **Test 42 à part, même prise de verrou** (15:51:58Z → 15:55:46Z ; 25 `node.exe`) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, 2/2 ✔ (`test42.log` `8a0e5930…5cd9`).
- **Rejeu isolé des quatre rouges du passage 1** (15:56:00Z → 15:58:36Z, hors suite, 24 `node.exe`) : `test/guard-scripts-u4.test.ts` 20/20, `apps/sentinel/test/ukemi-guard-record.test.ts` 31/31, `test/release-public-flow.test.ts` 1/1 (`rerun-p1/exits.txt` `394677e2…e23f`). Item ORACLE-CHILD-ABORT-1 (§11).
- C-V-4 : aucune suite complète hors verrou ; hors verrou, seulement des fichiers de test isolés, `tsc`, `eslint`, des `next build` (clone, mutants, export) et le harnais des mutants, chacun avec son compte de `node.exe`.

## 9. Export-run (`apps/site` et `scripts/assert-fleet-html.mjs` sont exportés)

- `node scripts/export-public.mjs --out F:/tmp/dojo/pr4b-export` (14:24:24Z, exit 0) : les quatre fichiers neufs du site, `app/token/page.tsx`, `COMPONENTS-PROVENANCE.md`, `scripts/assert-fleet-html.mjs` et les deux modules de PR-4a-1 présents, `cmp` égaux au worktree ; **non exportés** (mesuré) : `scripts/assert-fleet-html.d.mts`, `scripts/public-text-deny.mjs` (la forme du partenaire ne quitte pas le dépôt source), `test/**`.
- `npm ci --offline` dans l'export (283 paquets), puis **`next build` de l'export** (Turbopack) : exit 0, `○ /dojo` ; **`node scripts/assert-fleet-html.mjs` de l'export** : exit 0, « /dojo: no served snapshot; /dojo is the not-found document (status 404) and /token renders no link to it » (le `g3-site` du miroir public passerait avec ce lot).
- Exécution des modules exportés (`F:/tmp/dojo/pr4b-exportrun/smoke.mjs` `d090c1f7…c4a1`) sur la racine de l'export : `loadDojoServed` ⇒ `null`, `dojoPageFiguresOf(null)` ⇒ E0, `dojoExpected` ⇒ E0, `holdSnapshotStatus` ⇒ `upcoming`, quatorze phrases, paliers dans l'ordre, `assertDojoAbsent` sur le build de l'export ⇒ « not-found document (status 404) » ; exit 0 (`smoke.log` `0deafecd…208d`).
- Typage dans l'export : `tsc -p tsconfig.lib.json` (les quatre modules `lib/dojo-*`, `typeRoots` de l'export) exit 0 ; la TSX est typée par le `next build` de l'export (exit 0). Portes dans l'export (`exits.txt` `ccb4502e…6173`) : `gate:vocab` 0, `lang:gate` 0, `typecheck` 0, `lint` 0, `eslint` des cinq fichiers du site 0 ; `export:check` **1** : `scripts/export-exclude-tests.json` n'est pas exporté, donc `--check` échoue dans **tout** arbre exporté (même mesure au G1 de PR-4a-1 §9 ; indépendant du lot ; la porte passe dans le worktree et le clone).

## 10. Tests

- `test/dojo-page.test.ts` (racine de câblage `test`, `WIRING_TEST_ROOTS` inchangé) : `dojo_page_renders_served_figures_only` (E1, E2, EA : chiffres de la vérification égaux à ceux de la page, aucune phrase de relecture, page fidèle acceptée ; chiffre tapé, chiffre en double, chiffre retiré, jour de `history`, TXT-7 et TXT-8 retirées, pastille inversée, chevron en entité refusés ; racine d'un autre jour (M-P2), TXT-4 sans version (M-P16), TXT-4N sous version, total en EA refusés ; EA sous version refusé par `dojoExpected`) ; `dojo_page_lexicon_is_closed` (16 textes sans mot interdit ni nom d'opérateur ou du partenaire ; 25 mots injectés refusés) ; `dojo_page_tier_names_are_the_closed_list` (constante et liste de la vérification = décision 224 ; séquences de TXT-4, TXT-4N, TXT-12 ; une seule écriture des noms ; ordre, nom étranger, nom hors phrase refusés) ; `dojo_page_absent_before_data` (E0 : `dojoExpected` ⇒ E0 ; absence acceptée pour « aucun artefact » et pour la forme mesurée du 404 ; lien, page 200, page sans métadonnées, `<main>` sous 404 refusés ; source : `notFound()` sans enregistrement, lien dans la branche d'un enregistrement chargé) ; `dojo_copy_is_digit_free` (valeurs et source de `dojo-copy.ts` sans chiffre hors « SHA-256 »/« Ed25519 », chacun dans sa phrase ; aucun texte littéral rendu par la page ni le composant).
- `test/ci-gates.test.ts` : `dojo_register_is_frozen` (§4 point 6).
- **Deux passages isolés** des six tests (14:33Z, `F:/tmp/dojo/pr4b-six/run-1.log` `4fa68dcb…6202`, `run-2.log` `3ef51242…3cb8`) : 6/6 et 6/6. Voisins rejoués après écriture : `fleet_register_built_set_is_frozen`, `wiring_test_roots_exclusion_is_declared`, `no_generate_metadata_in_apps_site`, `test/public-text-deny.test.ts` 4/4, `site_names_no_kitchen`, `site_names_no_rpc_operator`, `derived_workflow_run_paths_are_exported` et cinq autres de `site-build-fleet` : verts.
- `lint:ratchet` : **76/69 rouge, préexistant** : mesuré identique sur une archive propre de `809b9da` (`git archive`, `F:/tmp/dojo/pr4b-pristine`) ; les 7 violations en plus sont dans `test/lang-gate-routing.test.ts:65-66` (`JSON.parse(...).files` non typé), apport du commit `4ef2b15` (LANG-GATE-CLAUDE-1) ; **apport de ce lot : 0** (compte par fichier : `test/dojo-page.test.ts` 0 ; `test/ci-gates.test.ts` 9 avant et 9 après). Item LINT-RATCHET-LANG-GATE-1 (§11).

### 10.1 `error_origin` proposés (le G7 assigne)

| Rouge rencontré | Où | `error_origin` proposé |
|---|---|---|
| TS2322 (`Record` sur une interface) au premier `next build` | `dojo-figures.tsx` | worker (moi) |
| `lang:gate` : « le » dans la source d'une regex (le suffixe de « eligible » isolé par un groupe, réécrit en deux mots entiers) | `assert-fleet-html.mjs` | worker (moi) |
| fil-piège `served_by`/`integration_test` de `fleet_register_built_set_is_frozen` | `dojo-register.ts` (premier jet) | worker (moi : garde lue après l'écriture) |
| deux attentes du test mal visées (message de la phrase absente avant celui du chiffre) et le cas « pastille » qui ne s'inversait pas en `built` | `test/dojo-page.test.ts` | worker (moi) |
| `lint:ratchet` 76/69 | `test/lang-gate-routing.test.ts:65-66` | hors lot : commit `4ef2b15` (LANG-GATE-CLAUDE-1) |
| quatre rouges du passage 1 (enfants sortis en 134, `0x80000003`, sans sortie) | Sentinel, `guard-scripts-u4`, `release-public-flow` | environnement, non attribué (ORACLE-CHILD-ABORT-1) |
| `next build` refusé sur jonctions | clone | outillage (méthode `npm ci --offline` retenue, précédent du tronc) |

## 11. Items formés (aucun « dû » nu)

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| DOJO-PAGE-EA-VERSION-1 | décision de texte (Q-2) | tête abstenue sous une version en vigueur : (a) la liste fermée d'EA gagne l'unité en jetons-jours et TXT-4 est rendue (l'unité appartient à la version, non au jour) ; (b) TXT-4 et TXT-12 absentes en EA ; (c) une phrase nouvelle au cp-1 ; d'ici là, la page et la vérification refusent cet état (build rouge, jamais une phrase fausse) | avant la première synchro de `dojo-served.json` (DOJO-SYNC-AFTER-ANNOUNCE-1), au second cp-1 bref (PR4B-CP1-POST-ANNOUNCE-1) | orchestrateur, puis validateur |
| DOJO-PAGE-BUILD-DATA-1 | preuve | la composition de la page n'est prouvée que par le build réel avec données : en E0, `g3-site` ne rend pas `/dojo` ; le harnais de ce G1 (`F:/tmp/dojo/pr4b-harness/`) la prouve sur E1, E2, EA ; à rejouer au G2 et au cp-2 ; à la synchro (PR-4a-2), `g3-site` la prouvera sur les données réelles | G2 de PR-4b, puis acte de synchro | orchestrateur |
| LINT-RATCHET-LANG-GATE-1 | défaut hors lot | `lint:ratchet` 76/69 rouge à `809b9da` (et au tronc qui porte `4ef2b15`) : `test/lang-gate-routing.test.ts:65-66`, sept `no-unsafe-*` ; correction d'une ligne (typer le résultat de `JSON.parse` : `as { files: { rel: string }[] }`) dans un lot du tronc | avant le G7 de PR-4b et le prochain cp-2 du tronc | orchestrateur |
| DOJO-REGISTER-LEG-TRIPWIRE-1 | fil-piège déclaré | dans `dojo_register_is_frozen`, `refusals(built(served), withVersion)` vaut exactement `["no test dojo_served_data_matches_deploy_ca under the wiring roots"]` : quand PR-4a-2 écrit ce test, l'assertion devient `[]` (le garde accepte alors un `built` complet ; le statut réel reste épinglé `upcoming` par l'assertion (1)) | G1 de PR-4a-2 | worker de PR-4a-2, orchestrateur |
| ORACLE-CHILD-ABORT-1 | mesure | passage 1 : quatre tests dont un processus enfant sort en 134 ou `0x80000003`, ou sans sortie, à 27 `node.exe` sur l'hôte ; non reproduits (passage 2, rejeu isolé) ; à la prochaine occurrence, relancer le fichier sous `--report-on-fatalerror` (rapport de diagnostic de Node) et relever la mémoire de l'hôte, pour nommer la cause au lieu de la supposer | prochaine occurrence dans un oracle | orchestrateur |
| DOJO-HOST-ROOT-1, DOJO-NEXT-NOTFOUND-1 | existants | DOJO-NEXT-NOTFOUND-1 **mesuré et fermé** par ce G1 (§6) ; DOJO-HOST-ROOT-1 inchangé (G7 de PR-4b) | — | orchestrateur |

## 12. Questions formées (choix fail-closed explicites, jamais contournés)

- **Q-1 (cp-1 bref de PR-4b, C-G2-5)** : TXT-3 rendue verbatim ; « {k_reads} readings » dit le K de l'ancre (4 sur la fixture, trois lectures faites). Texte « of {k_reads} scheduled readings », ou clé nouvelle des lectures faites (amendement de D-11) ?
- **Q-2 (orchestrateur, D-1)** : EA sous version (DOJO-PAGE-EA-VERSION-1) : (a), (b) ou (c) ? Aujourd'hui refusé au build.
- **Q-3 (orchestrateur, DOJO-PARTNER-NAME-GATE-1)** : la mission ne portait pas le nom ; pris de la décision 225 (CHANTIERS l.1561) et placé dans `OPERATOR_FORMS` de `scripts/public-text-deny.mjs` (la liste que `site-build-fleet.test.ts` importe désormais). Formes à confirmer ou à compléter (la forme couvre casse, espace, point, tiret et soulignement entre les deux mots).
- **Q-4 (orchestrateur)** : la vérification refuse en E0 tout `href="/dojo"` dans le corps rendu entier de `/token`, non le seul `<main>` (D-4) : un lien de navigation ajouté par l'investisseur (P-11) rougirait tant qu'aucun `snapshot` n'est servi. Garder (recommandé : pas de lien vers une page 404) ?
- **Q-5 (orchestrateur)** : R-25 « contre le gel 2 » : mesuré contre `809b9da` (543, delta du lot) ; contre `1aa1acb` le compte inclut la fusion du tronc (4 711). Confirmer la base.
- **Observation pour la validation visuelle (P-10), sans décision de ce G1** : TXT-11 rendue sur la fixture E2 (un seul détenteur compté) se lit « 1 holders hold at least 3.589744 tokens » ; le texte accepté est gardé tel quel.

## 13. Advisor

- (Seconde consultation, avant la remise : §15.)
- Consulté par l'outil intégré après l'orientation, avant toute écriture : compte ascendant consigné avant tout livrable ; trois sondes décisives (E1 à tête abstenue par `buildDojoServed` avec le vrai vérificateur ; consommateurs structurels d'`assert-fleet-html.mjs` ; DOJO-NEXT-NOTFOUND-1 mesuré au build avant d'écrire la branche E0) ; TXT-3 verbatim et Q ; EA sous version fail-closed épinglé par un test et Q ; nom du partenaire dans `OPERATOR_FORMS` avec les vecteurs de `public-text-deny.test.ts` ; R-25 contre `809b9da` et le chiffre de `1aa1acb` expliqué ; TEMP sur F: pour tout `node` ; commandes courtes ; plafond du ratchet ; noms « SHA-256 »/« Ed25519 » retirés avant le compte ; mutants de page tués par le build avec données, limite déclarée. Chaque point vérifié sur pièce ; conseil, jamais verdict.

## 14. `git status --short` final (worktree)

Relevé à 15:59:38Z (HEAD `809b9da` inchangé ; `git status --short --ignored` : en plus, `node_modules/` seul, jonctions préexistantes) :

```
 M apps/site/COMPONENTS-PROVENANCE.md
 M apps/site/app/token/page.tsx
 M scripts/assert-fleet-html.d.mts
 M scripts/assert-fleet-html.mjs
 M scripts/public-text-deny.mjs
 M test/ci-gates.test.ts
?? apps/site/app/dojo/
?? apps/site/components/dojo/
?? apps/site/lib/dojo-copy.ts
?? apps/site/lib/dojo-register.ts
?? docs/G1-lot-dojo-pr4b.md
?? test/dojo-page.test.ts
```

Aucun `git add/commit/stash/checkout/branch` (R-20) ; `git` en lecture seule dans le worktree (`status`, `rev-parse`, `log`, `diff`, `archive` vers `F:/tmp/dojo/pr4b-pristine`) ; deux `git clone --no-local` hors dépôt (`F:/tmp/dojo/pr4b-clone`, `F:/tmp/dojo/pr4b-mutants/tree`), jetables. Aucun réseau (`npm ci --offline` sur le cache `F:/tmp/npm-cache`) ; rien sur C: (TEMP/TMP/TMPDIR sur `F:/tmp/dojo/pr4b-tmp` pour toute exécution) ; `dojo-served-load.ts`, `dojo-served.ts`, `package*.json` inchangés ; aucun `build` dans le worktree.

## 15. Remise

- Livrables et preuves copiés dans `F:/tmp/dojo/pr4b-deliver/` par `F:/tmp/dojo/pr4b-deliver.sh` ; `DELIVERED.sha256` auto-contrôlé (le journal y est la copie prise à la remise ; son sha256 est rendu hors du fichier).

## 16. Corrections après G2 (2026-09-27)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` ; correcteur, instance fraîche, distincte du générateur du G1 et des deux instances du relecteur G2 (correcteur ≠ relecteur) ; effort max (mission).
- **Mission** : `F:/tmp/dojo/mission-corr-pr4b.md` (10 l., sha256 `22152cc0db0b53e417ad0a43586b3fdee2830bbda2eacd985957acbb4f81bc7f`, texte calculé par le script de l'orchestrateur, lu comme tel) ; `date -u` à l'ouverture : 18:47:01Z. Relance après une limite de session (demande relayée : continuer là où le travail s'était arrêté) : aucune trace d'une passe antérieure de cette mission (aucun dossier `F:/tmp/dojo/pr4b-corr*`, les 12 fichiers égaux au §2), passe menée d'un bout à l'autre. Entrées : rapport G2 `F:/tmp/dojo/g2-pr4b/G2-report.md` (sha256 `abdd12ab5d415ab7e1dbe356c3b232ee8e20a584d7827a1c51d6e96c12ae4e41`, égal à l'annonce et à `G2-report.sha256`, lu en entier, instances 1 et 2, `i2/`), mission G2 (`0323c2fe…`), ce journal (§0 à §15), l'ADR de lot, la mère (D-3, D-11, §8), les prototypes du G2 (`proto/*.diff`), les harnais du G1 et du G2 ; décisions de l'orchestrateur : mission et CHANTIERS du tronc (`79bb4ec`, entrée 18:5x UTC : Q-G2-1 borne 700, Q-G2-2 oui, Q-G2-3 oui, Q-G2-4 lemme et « earned » reformulé, Q-G2-5 item, Q-G2-7 forme (b), Q-G2-6 question de l'investisseur).
- **État à l'ouverture** : 12 lignes de statut, HEAD `809b9da` ; sha256 des 11 livrables et de ce journal égaux au §2 ; copies d'avant correction (les 12, les trois fichiers de PR-4a-1 touchés, les deux ADR) : `F:/tmp/dojo/pr4b-corr/before/` (`before.sha256`).

### 16.1 Horaires (`date -u`)

| Heure | Acte |
|---|---|
| 18:47:01Z | lecture de la mission ; puis rapport G2 (sha contrôlé), mission G2, journal, ADR, mère, code, prototypes et harnais |
| 18:50:29Z | hôte : 55 `node.exe`, 15 077 Mo libres ; verrou tenu par « G2 RG-1b » |
| 18:5xZ | advisor intégré consulté (§16.10), avant toute écriture |
| 18:58:50Z | copies d'avant correction et sha256 |
| 18:59Z → 19:07Z | textes d'abord (TXT-3, TXT-11s, TXT-5r), sha256 de la liste fermée ; puis modules, vérification, tests ; lignes datées des deux ADR (19:07Z) |
| 19:03:15Z | **R-25 = 594**, mesuré avant tout test (§16.4) |
| 19:03Z → 19:06Z | tests du lot dans le worktree (un rouge d'outillage corrigé, §16.9) ; `tsc` 0 ; `eslint` 0 ; voisins ; `gate:vocab` 0 ; `lang:gate` 0 |
| 19:07:45Z → 19:11:25Z | deux clones `--no-local` : `probe` (HEAD `809b9da`) et `clone-m` (fusion du tronc `79bb4ec` dans `lot/dojo-site`, **sur le clone seulement**, `53dc0e8`) ; 16 fichiers copiés (`cmp`) ; `npm ci --offline` (284 paquets, lock inchangé) |
| 19:11:52Z → 19:15:22Z | builds réels avec données E0, E1, E2, EA, **EAV** : deux séries, toutes 0/0 (§16.5) |
| 19:16:46Z → 19:40:09Z | session d'oracle sous verrou « corr PR-4b » (pris à 19:17:47Z après 60 s, « cp-2 PR-3b-1 ») : passage 1, passage 2, test 42 à part (§16.7) |
| 19:17:15Z → 19:49:15Z | mutants : liste du G1 (première série en attente de 19:19Z à 19:40Z, garde du verrou propre), survivants requis du G2 et de l'instance 2, trois de plus (§16.6) |
| 19:40:18Z → 19:44:12Z | export-run (§16.8) |
| 19:42:16Z, 19:42:25Z | six tests nommés et quatre de `dojo-served`, deux passages isolés (§16.4) |
| 19:50:54Z → 19:5xZ | contrôle des clones (16/16 égaux au worktree, aucun enregistrement injecté restant), journal, livrables, seconde consultation de l'advisor |

### 16.2 Décisions appliquées (décisions de l'orchestrateur, mission)

1. **C-G2-1 (bloquante, Q-1)** : TXT-3 = « Latest snapshot: {day} UTC · {reads_done} of {k_reads} scheduled readings between slots {slot_min} and {slot_max} · {lines_count} lines · Merkle root {root} ». `dojo-served-load.ts` (PR-4a-1) : `reads_done` entre dans `DOJO_HEAD_KEYS` et `DojoServedHead` ; `buildDojoServed` l'écrit **recomputé** (`mins.length` : les lectures faites de la ligne signée de la tête, à créneau non nul, le même ensemble que `slot_min`/`slot_max`), jamais lu d'un champ libre ; `loadDojoServed` le lit (`int`) et refuse sauf `reads_done` = 0 exactement pour une tête `abstained` et `reads_done` ≤ `k_reads` ; `dojo-served.ts` et `dojoExpected` le rendent (`String`). Fixture : E1 et E2 « **3 of 4** scheduled readings », relu dans le HTML bâti (§16.5). Tests : oracle recodé de `dojo_snapshot_composes_served_lines_to_page_figures` (compte des `slot_min` numériques), deux formes refusées par le chargeur (`reads_done` = `k_reads` + 1 ; 0 sous `counted`), cas nommé « 3 of 4 » dans `dojo_page_renders_served_figures_only`. Effet voulu : en E1, `lines_count` = `reads_done` = 3, la multiplicité est exercée au build réel.
2. **C-G2-2 (bloquante, Q-2 = (a))** : le refus de la page (deux lignes) et celui de `dojoExpected` sont retirés ; EA sous une version en vigueur porte `day` et `threshold_unit_token_days` (décalé par `decimals`) dans `dojoPageFiguresOf` et dans `dojoExpected` (composés à part) ; la page rend TXT-3A et **TXT-4** ; TXT-12 (et TXT-11) sous `figures.state === "E2"`, non plus sous la seule version. Test : l'état EAV entre dans la boucle de `dojo_page_renders_served_figures_only` (page fidèle acceptée, chiffre tapé, en double, retiré, jour de l'historique, TXT-7 et TXT-8 retirées, pastille inversée, entité refusés) ; ses deux chiffres épinglés ; TXT-12, TXT-4N, TXT-10, TXT-11 et TXT-11s ajoutées à sa page refusées (« another state »). Build EAV : **0/0** (était 1/1).
3. **C-G2-3 (bloquante, Q-G2-2)** : `score_total` et `validated_total` rendus en jetons-jours, décalés par `decimals` (`shiftUnits` dans `dojo-served.ts`, `tokens` recodé dans `dojoExpected`, `tokens` de l'oracle du test de PR-4a-1) ; E1 « Total hold score: 152.000000 · validated: 0.000000 », E2 « 165.000000 · validated: 150.000000 » à côté de « One unit is 17.948718 validated token-days » : 150 / 17,948718 donne 8 unités, celles de la ligne servie. Lignes datées : mère D-11 (après l.272, ajout seul) et ADR D-1 (pli des corrections, ajout seul).
4. **C-G2-4 (Q-G2-3)** : **TXT-11s** « {holders_count} holder holds at least {dust_threshold_tokens} tokens, the dust threshold of the version in force; smaller lines are published and not counted. » (`DOJO_TEXT.holder`) ; la page choisit `figures.holders_count === "1"` (chaîne), `dojoExpected` `h.holders_count === 1` (nombre, à part) ; en E2 les deux variantes sortent de `absentSentences` (même plus longue partie fixe), la présence de la variante remplie fait la preuve ; test : le pluriel rendu avec un seul détenteur refusé (« is absent »). Aucun chiffre nouveau.
5. **C-G2-5 (bloquante)** : (a) assertion : la balise ouvrante de `<main>` (`/<main\b[^>]*>/i` sur le corps rendu) rejoint le corpus et le balayage des attributs (`mainCorpus` et `mainTextAndAttrs` de `open + mainHtml`) ; (b) quatre cas dans la boucle des états (E1, E2, EA, EAV) : `<p title="7">` refusé (G2-M1), `<main title="<jour de l'historique>">` refusé (G2-M16), un chiffre arabe-indien refusé (G2-M2 ; écrit en échappement dans la source du test), deux chiffres de même valeur tous deux rendus acceptés (G2-M3).
6. **C-G2-11 (Q-G2-7 = forme (b))** : `dojo_page_lexicon_is_closed` épingle le sha256 de la liste fermée, `930d245b37c2123496ca43d270d999c68828d3d6e8f4d47e923bd3f89fd19e56` = SHA-256 de `canonical({DOJO_TEXT, DOJO_TITLE, DOJO_TIER_NAMES})` (`canonical` de `bell-chain.mjs`, déjà importé), valeur écrite au pli daté de l'ADR (D-1) et à re-citer au pli du cp-2 ; plus les trois négations en `assert.match` (TXT-7 « What it does not show: », TXT-8 « The check does not read the chain. », TXT-13 « this page does not check that signature ») ; le décompte des textes passe à 17 (le nom, le titre, quinze phrases).
7. **C-G2-12 (bloquante, CA-11)** : trois gardes : (1) la constante, par `dojo_register_is_frozen` (inchangé) ; (2) la fonction, `assert.equal(holdSnapshotStatus(), "upcoming")` ajouté à ce test ; (3) la pastille rendue, `dojoExpected` lit le statut **de la constante** (`DOJO_REGISTER.pieces.find(...)?.status`, `undefined` ⇒ garde de vacuité), à part de la fonction que la page appelle.
8. **Non bloquantes** : **C-G2-6** (Q-G2-4) : règle par lemme gardée, `DOJO_FORBIDDEN` inchangé ; **TXT-5r** « the part that produced them » (« held for sixty days in a row » intact) ; **C-G2-7** : `assertDojoAbsent` refuse aussi `href="https://…/dojo"`, `href="//…/dojo"`, `href=/dojo` (`/href\s*=\s*["']?(?:https?:)?(?:\/\/[^/"'\s>]*)?\/dojo(?=["'\s/?#>]|$)/i`), trois cas au test ; sonde hors dépôt (`probes/href.out`) : onze formes refusées, `/dojo-served/…`, `/dojos`, `/token`, `/docs/dojo-notes`, `data-x` acceptés ; **C-G2-9** (+1 ligne) : note du registre, test strict « aucun chiffre ASCII » (et non plus le détecteur d'honnêteté, qui exempte dates et identifiants), trois notes du G2 refusées au test ; **C-G2-10** (0 ligne nette) : champ `absent` renommé `absentSentences` (D-4), code et `.d.mts` ; **C-G2-13** (+1 ligne) : `holdSnapshotStatus` sur un registre sans la pièce lève, épinglé ; **C-G2-14** (+3 lignes) : `dojo_page_lexicon_is_closed` lit aussi les portées globale et `site` de `vocab-banned.json` (résultat typé), **hors exemptions** (`exemptPhrases` de la portée `site` non appliquées : le test est plus strict que `gate:vocab` ; une phrase exemptée ajoutée un jour rougirait ce test, non la porte), son titre dit ce qu'il lit ; **C-G2-8** : item **NAME-EXPORT-PACKAGES-1** formé hors lot (ligne datée de l'ADR §7). Toutes appliquées sous la borne de +10 lignes : aucun item de repli.
9. **R-25 (Q-G2-1)** : borne des corrections 700 : **594** (§16.4), aucune coupe. **Q-G2-6** (DOJO-LEAN-KERNEL-1) : question de l'investisseur, aucun code.

### 16.3 Livrables après corrections

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `apps/site/app/dojo/page.tsx` | créé (non suivi), corrigé | 58 | `6731a41d0de8abf753deaf45879c721a29e46e0c89d9da244fb50481ec9dda36` |
| `apps/site/components/dojo/dojo-figures.tsx` | créé, inchangé | 27 | `41ac0249c7b19029277d496d180617bdeed6aea33dea46ff4116bcbf83cf6def` |
| `apps/site/lib/dojo-copy.ts` | créé, corrigé | 62 | `0699b27483650aadac0606529d3b90406a877ed7cb7e1cc76f331493ba0abe07` |
| `apps/site/lib/dojo-register.ts` | créé, inchangé | 20 | `913f0ece502e887721abcd22345d78855cc864c9d350fb70a573e22cc4811bdb` |
| `apps/site/app/token/page.tsx` | modifié, inchangé depuis le G1 | 148 | `b2acc900e6d3772373f8b755fe3d7eb2ea2666bfccf8923e4f9600a61e238f49` |
| `scripts/assert-fleet-html.mjs` | modifié, corrigé (+137 contre `809b9da`) | 764 | `31975dbdece2c548d74ab4f0111b3b6b74b299ffe6f8c4e3e591d66af46864e6` |
| `scripts/assert-fleet-html.d.mts` | modifié, corrigé (renommage) | 112 | `3a3c317e4e732167df81b035fe0ac5aa90a707d619afe2f01a610e294b397f87` |
| `apps/site/COMPONENTS-PROVENANCE.md` | modifié, inchangé depuis le G1 | 170 | `4bff9fa96ac03d6d5e140aa40b6b997a679aa473fd506bf93c0eb60424a458be` |
| `scripts/public-text-deny.mjs` | modifié, inchangé depuis le G1 | 183 | `4beada762af72c997c60f4c9291fd797bd60d0e0c5bccab2ecd654e9666bc269` |
| `test/ci-gates.test.ts` | modifié, corrigé (+45 contre `809b9da`) | 1 747 | `3279e589df4156783a74a347a78e2ef7e37f82bb333e95f6973ba323cea651ef` |
| `test/dojo-page.test.ts` | créé, corrigé | 167 | `7e0c61263227e9b14004163e26a62efd2a8d17bd56185c2e2d7b418f47f30569` |
| `apps/site/lib/dojo-served-load.ts` | **suivi (PR-4a-1), modifié** (+5 −4) | 248 | `a83faaed956f54225481373dbcbec1ca06e70c4e3ee152ac5d792f728fda5a88` |
| `apps/site/lib/dojo-served.ts` | **suivi (PR-4a-1), modifié** (+7 −7) | 41 | `0eeae2b3ceed980b4e8b78233ea5f863108a67406bca8727d2f07007658c8d00` |
| `test/dojo-served.test.ts` | **suivi (PR-4a-1), modifié** (+5 −4) | 212 | `cd76b4ff9afe410d5bf3d4b0f76819b2f289c5f60a152403e9ae8cf8c1ce9fbf` |
| `docs/adr/ADR-DOJO-PR-4.md` | modifié (deux lignes datées ajoutées après les l.97 et l.215 de l'état `9b31b516…` ; aucune retirée) | 244 | `2afb43ad4c31c3f30833b0a2f52d099de410d3a64de47b88473564472e674590` |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` | modifié (une ligne datée ajoutée après la l.272 de l'état `45500ca0…` ; aucune retirée) | 1 362 | `af601a198a692c86dd0f14fb8bf2694b6be7e9dacc632476e74b648b82cec226` |
| `docs/G1-lot-dojo-pr4b.md` | ce journal, §16 ajouté | — | rendu hors du fichier (`DELIVERED.sha256`) |

- Interfaces changées : `DojoServedHead.reads_done: number` et `"reads_done"` dans `DOJO_HEAD_KEYS` (clé fermée) ; `DojoCountedFigures.reads_done: string` ; l'état EA de `DojoPageFigures` porte `threshold_unit_token_days?: string` ; `DOJO_TEXT.holder` (TXT-11s) ; `DojoExpected.absentSentences` (au lieu d'`absent`) ; `dojoExpected` ne lève plus sur EA sous une version. Les trois fichiers de PR-4a-1 sont touchés par C-G2-1, C-G2-2 et C-G2-3 (forme minimale du G2, chemin des chiffres) ; `dojo-figures.tsx`, `dojo-register.ts`, `/token`, la provenance et `public-text-deny.mjs` inchangés.

### 16.4 Tests, R-25

- Worktree, deux passages isolés (19:42:16Z et 19:42:25Z, `F:/tmp/dojo/pr4b-corr/six/run-1.log` `42a99630…`, `run-2.log` `0ff74740…`) : les **six tests nommés** (`dojo_page_renders_served_figures_only`, `dojo_page_lexicon_is_closed`, `dojo_page_tier_names_are_the_closed_list`, `dojo_page_absent_before_data`, `dojo_copy_is_digit_free`, `dojo_register_is_frozen`) **6/6 et 6/6**, et les quatre de `test/dojo-served.test.ts` 4/4 et 4/4 ; `tsc --noEmit` 0 ; `eslint` des huit fichiers de code touchés 0 ; voisins : `site_names_no_rpc_operator` et `site_names_no_kitchen` 2/2, `test/site-honesty.test.ts` 8/8, `test/public-text-deny.test.ts` 4/4, `fleet_register_built_set_is_frozen`, `wiring_test_roots_exclusion_is_declared`, `no_generate_metadata_in_apps_site` 3/3 ; `gate:vocab` 0 ; `lang:gate` 0.
- **R-25 = 594** (`F:/tmp/dojo/pr4b-r25-methodA.mjs`, pathspec de `ci.yml:82`, 20 jetons, métrique `ci.yml:90`, base `809b9da`, aucune écriture git) : suivis 10 + 10 + 9 + 14 + 24 + 137 + 2 + 45 + 9 = 260 ; non suivis 58 + 27 + 62 + 20 + 167 = 334 ; les deux ADR et ce journal hors pathspec. Delta des corrections : **+51** sur 543 ; sous la borne des corrections 700 (Q-G2-1), sous 1 148,7 (ADR §5) et le STOP 1 150 : aucune coupe. Dans les trois fichiers de PR-4a-1, 15 lignes existantes sont modifiées ou déplacées (une suppression et une insertion chacune) et 2 ajoutées : 32 lignes comptées.

### 16.5 Build réel avec données (DOJO-PAGE-BUILD-DATA-1 ; harnais `F:/tmp/dojo/pr4b-harness/with-data.mjs`, sha256 `4a1c679f…`, inchangé)

- `run-state.sh` et `restore.sh` recopiés sous `F:/tmp/dojo/pr4b-corr/harness/` (TEMP, chemin de restauration, garde qui refuse tout arbre autre que le clone `probe` ; `run-state.sh` garde aussi une copie de `dojo.html`, `dojo.meta` et `token.html` de chaque état ; diff relu, `harness-diff.txt`) ; manifeste de restauration = celui de `809b9da` (`61bcb6af…`, égal au G1).
- Deux séries de builds frais (`npm run build -w @monark/site`, Next 16.3.4, Turbopack) puis `node scripts/assert-fleet-html.mjs` : `builds/base/` (19:11:52Z → 19:13:39Z) et `builds/base2/` (19:13:52Z → 19:15:22Z ; `summary.txt` `50c7dae6…`) : **E0 0/0, E1 0/0, E2 0/0, EA 0/0, EAV 0/0** dans les deux ; 29 à 41 `node.exe`.
- Relevés (`probes/corpus.out` `3b8cd6a8…`, texte du `<main>` par les fonctions mêmes de la vérification) : E0 `dojo.meta` 404, pas de `<main>`, `/token` sans lien ; **E1** « 9 figure(s) » : « Latest snapshot: 2026-10-08 UTC · **3 of 4 scheduled readings** between slots 400000000 and 400000004 · 3 lines · Merkle root f2d5ea7a… », « Total hold score: **152.000000** · validated: **0.000000** », TXT-4N ; **E2** « 12 figure(s) » : « … 165.000000 · validated: 150.000000 », « **1 holder holds** at least 3.589744 tokens … », « One unit is 17.948718 validated token-days … », TXT-12 ; **EA** « 1 figure(s) » : TXT-3A, TXT-4N ; **EAV** « 2 figure(s) » : TXT-3A, puis TXT-4 « One unit is 17.948718 validated token-days … » ; décompte par état : TXT-12 en E2 seul, TXT-11s en E2 seul, aucun « holders hold », totaux en E1 et E2 seuls, TXT-4N en E1 et EA, TXT-4 en E2 et EAV, « produced them » partout, « earned » nulle part ; aucun mot d'honnêteté (« confidence », « accuracy », « 95 % », « guarantee », « promise », probabilité, certitude) ni nom d'opérateur ou du partenaire dans les quatre corpus ; lien de `/token` présent en E1, E2, EA, EAV.

### 16.6 Mutants (clone `F:/tmp/dojo/pr4b-corr/probe` à `809b9da` + les 16 fichiers ; restauration et sha256 contrôlés après chaque mutant)

- Harnais re-pointés (§16.9) : `mutants/g1-mutants-corr.mjs` (`e6bbd664…`, depuis `pr4b-mutants/mutants.mjs` `8c64b7a0…`), `g2-mutants-corr.mjs` (`b6a0d659…`, depuis `g2-pr4b/i2/g2-mutants-i2.mjs`), `i2-mutants-corr.mjs` (`b7bdd11e…`, depuis `g2-pr4b/i2/i2-own-mutants.mjs`) ; contrôles inchangés : les tests du lot, le test du registre, les portes de noms, `site-honesty`, puis build frais et vérification pour les états listés (harnais du §16.5). Chaîne `chain.sh` (`06c8e331…`), un harnais à la fois ; la première série (B0, M-P1, M-P2) a attendu la fin de l'oracle propre (garde du verrou « corr PR-4b », 19:19Z → 19:40Z) ; 23 à 38 `node.exe`, 11 010 à 12 563 Mo libres.
- **Liste du G1** (`RESULTS-g1.txt` `39815488…`, 19:17:15Z → 19:45:32Z) : témoin **B0 vert** (tests 0/0/0/0 ; builds E0, E1, E2, EA 0/0) ; **13/13 tués** ; **14/14 restaurations au sha256** (cinq fichiers), 0 dérive. M-P2 (build E1 et E2, « a sentence of state E1 is absent … 3 of 4 scheduled readings »), M-P8 (build E1), M-P16 (build E1), M-P17b (build E1, « ["2026","10","01"] ») : tués **par le seul build réel**, comme au G1 ; M-P1, M-P3, M-P10, M-P11, M-P19 : tués aussi par le sha256 de la liste fermée (`dojo_page_lexicon_is_closed`) ; M-P4, M-P18, M-P21 : `dojo_register_is_frozen`, refus unique attendu ; M-P17 : `dojo_page_absent_before_data` et build E0.
- **Survivants du G2, requis** (`RESULTS-g2.txt` `00497afd…`, 19:45:33Z → 19:48:03Z ; 6/6 restaurations, six fichiers) : **G2-M1 tué** (`dojo_page_renders_served_figures_only` : `<p title="7">` et `<main title>` refusés ; build E1 0, attendu : la page n'a pas d'attribut chiffré) ; **G2-M2 tué** (même test, chiffre arabe-indien ; build E1 0, attendu) ; **G2-M3 tué** (tests de la page, dont le cas des deux chiffres égaux, **et build E1** : « the figure "3" (… lines_count) occurs 2 time(s) … (expected 1) », la multiplicité exercée au build réel par `lines_count` = `reads_done` = 3) ; **G2-M16 tué** (build E1 : « 3 numeric token(s) … ["2026","10","01"] », attribut de la balise `<main>` balayé).
- **Mutants propres de l'instance 2, requis** (`RESULTS-i2.txt` `6bed0d75…`, 19:48:04Z → 19:49:15Z ; 4/4 restaurations, huit fichiers) : **I2-M1 tué** et **I2-M7 tué** (`dojo_page_lexicon_is_closed` : sha256 de la liste fermée ; les négations en `assert.match` les refusent aussi) ; **I2-M2 tué deux fois** : `dojo_register_is_frozen` (garde (2), « actual: built ») et build E1 (garde (3), « the /dojo pill does not carry the register's status (expected "Dōjō upcoming") »).
- **En plus, liés aux corrections** : **G2-M12 tué** (« rewarded » dans TXT-7 : la règle par lemme laisse passer la forme fléchie, voulu par Q-G2-4, mais le sha256 de la liste fermée refuse tout texte changé) ; **S-iii tué** par les tests du lot (sha256 ; au G2, `gate:vocab` seul) ; la lecture de `vocab-banned.json` du test (C-G2-14) refuse aussi ce texte, mesurée à part (`probes/vocab.out` : 36 motifs, 0 coup sur les 17 textes, `/\bhelius\b/i` sur le texte de S-iii) ; **I2-M8 tué** (`dojo_register_is_frozen`, C-G2-13).
- **Bilan : 23/23 tués** (13 du G1, 7 requis du G2, 3 liés aux corrections), 24/24 restaurations au sha256, 0 dérive ; aucun survivant.

### 16.7 Oracle (sept portes sur le clone fusionné au tronc, sous verrou, une prise ; test 42 à part ; C-V-4)

- Scripts `F:/tmp/dojo/pr4b-corr/` dérivés de ceux du G2 (étiquette « corr PR-4b », TEMP, chemins ; `diff` relu) : `locked.sh` (`e81d8b51…` : `mkdir F:/tmp/oracle-lock` atomique, attente 60 s jusqu'à 90 min, `rmdir` dans le piège EXIT), `run-oracle.sh` (`c5963197…` : sept portes `npm run`, huit variables payantes retirées par `env -u`, compte des `node.exe` et mémoire libre au lancement et à la fin, **sha256 des 16 fichiers du lot avant et après chaque passage**), `session.sh` (`3a24b32f…` : passage 1, passage 2, test 42 à part), `sync.sh` (`a584137c…`).
- Arbre : `clone-m`, `git clone --no-local` puis fusion de `origin/lot/etude-suite` (`79bb4ec`, tronc au moment de la mesure ; `3416807` et `809b9da` ancêtres, vérifié) dans `lot/dojo-site`, **sur le clone seulement** (identité de commit locale au clone), HEAD `53dc0e8` ; le tronc n'a touché depuis `8c60f65` que `docs/**` et `test/lang-gate-routing.test.ts` (aucun fichier du lot, ni le manifeste du site, ni `vocab-banned.json`) ; 16 fichiers copiés (`cmp`) ; `node_modules` réels par `npm ci --offline` ; Node v24.15.0.
- **Verrou** : lancé 19:16:46Z, tenu par « cp-2 PR-3b-1 » ; **pris à 19:17:47Z après 60 s**, rendu à 19:40:09Z (`session.log` `d57addb3…`).
- **Passage 1** (`oracle/out-1`, 19:17:48Z → 19:26:50Z ; 32 `node.exe`, 9 569 Mo libres au lancement) : **7/7 exit 0** (`gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`) ; `test` : **1 447 tests, 1 444 réussis, 0 échec, 0 annulé**, 3 ignorés (préexistants), 472 s, aucune ligne `✖` (`test.log` `9e55c067…`) ; `lint:ratchet` **69/69** (`45ede4ce…`, égal au journal du clone fusionné du G2) ; sha256 du lot inchangés.
- **Passage 2, fait foi** (`oracle/out-2`, 19:26:52Z → 19:34:43Z ; 28 `node.exe`, 10 709 Mo) : **7/7 exit 0** ; `test` : **1 447, 1 444, 0 échec, 0 annulé**, 3 ignorés, 419 s, aucune ligne `✖` (`test.log` `4b0b2820…`) ; les six tests nommés, les quatre de `dojo-served`, `site_names_no_kitchen`, `site_names_no_rpc_operator` et le test 42 relevés `✔` dans la suite ; `lint:ratchet` 69/69 ; `gate:vocab` « scanned 326 file(s), no forbidden claim » ; `lang:gate` « 0 non-exempt French hit(s) » ; `exits.txt` identiques entre les passages (`3943c3b3…`) ; sha256 du lot inchangés.
- **Test 42 à part, même prise** (19:34:45Z → 19:40:08Z ; 26 `node.exe`) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ **exit 0, 2/2** (`export_public_no_governance_no_french` 323 s, `export_public_derived_jobs_are_byte_identical`) (`test42.log` `9b4a5325…`).
- ORACLE-CHILD-ABORT-1 : **non reproduit** (deux passages sans échec ni annulation, 25 à 32 `node.exe`). C-V-4 : aucune suite complète hors verrou ; les mutants attendent pendant que le verrou est tenu par « corr PR-4b » (garde du harnais, §16.6) ; hors verrou, seulement des fichiers de test isolés, `tsc`, `eslint`, les builds du harnais et l'export-run.

### 16.8 Export-run (`apps/site` et `scripts/assert-fleet-html.mjs` sont exportés)

- Script `F:/tmp/dojo/pr4b-corr/exportrun/run.sh` (`acc22255…`), 19:40:18Z → 19:44:12Z (30 à 38 `node.exe`) : `node scripts/export-public.mjs --out F:/tmp/dojo/pr4b-corr/export` depuis le clone fusionné (exit 0) ; **exportés et égaux au worktree** (`cmp`) : les quatre fichiers neufs du site, `/token`, la provenance, `scripts/assert-fleet-html.mjs` et les deux modules de PR-4a-1 corrigés ; **non exportés** (mesuré) : `.d.mts`, `public-text-deny.mjs`, les trois fichiers de test, l'ADR.
- Dans l'export : `npm ci --offline` 0 ; **`next build` 0** (`○ /dojo`) ; **`node scripts/assert-fleet-html.mjs` 0** (« /dojo: no served snapshot; /dojo is the not-found document (status 404) and /token renders no link to it ») ; exécution des modules **exportés** (`exportrun/smoke.mjs` `a6efaccc…` = celle du G1 re-pointée, quinze phrases au lieu de quatorze ; `smoke.log` `ddeb7644…`) : `loadDojoServed` ⇒ `null`, `dojoPageFiguresOf(null)` ⇒ E0, `dojoExpected` ⇒ E0, `holdSnapshotStatus` ⇒ `upcoming`, 15 phrases, paliers dans l'ordre, `assertDojoAbsent` sur le build de l'export ⇒ document introuvable (404), exit 0 ; `tsc -p exportrun/tsconfig.lib.json` (quatre modules `lib/dojo-*`) 0 ; portes : `gate:vocab` 0, `lang:gate` 0, `typecheck` 0, `lint` 0, `eslint` des cinq fichiers du site 0 ; **`export:check` 1** : `scripts/export-exclude-tests.json` absent de l'export (ENOENT), cause préexistante et indépendante du lot (EXPORT-CHECK-IN-EXPORT-1, même mesure au §9) ; **jamais cité vert** (`exits.txt` `e224a15c…`).

### 16.9 Incidents et écarts déclarés

- **Échappements transformés par la couche de commande (outillage, corrigé)** : deux barres obliques inverses de mes commandes n'ont pas atteint les fichiers telles qu'écrites : une barre doublée, écrite pour obtenir `\d` dans une chaîne JavaScript, est arrivée simple dans le fichier de spécification, et JavaScript l'a lue `d` (la garde de la note du registre est devenue `/d/`) ; l'échappement Unicode du chiffre arabe-indien trois (U+0663) est arrivé comme le caractère lui-même dans la source du test. **Détecté** par `dojo_register_is_frozen`, rouge au premier passage dans le worktree (« see ADR-M018 » accepté par `/d/`, 19:04Z), puis par la relecture octet par octet (`od -c`) de chaque ligne à barre oblique inverse écrite par mes commandes ; **corrigé** par un script qui construit la barre oblique inverse depuis son code, jamais tapée (`fixbs.mjs` `431309d5…`) : `/\d/` et l'échappement U+0663 rétablis ; relu : les expressions de l'assertion (`<main\b`, lien absolu), des tests (`chain\.`, `\/dojo`) et de ce journal portent leurs barres ; aucun autre fichier touché. Leçon appliquée ensuite : tout texte à barre oblique inverse passe par un document littéral, puis est relu en octets. **Source du rouge** : le journal de ce passage rouge (`wt/register.log`) a été écrasé par le passage vert qui l'a suivi (même nom de fichier, 19:05:25Z) ; il n'en reste que la transcription de la session (message « see ADR-M018 », `ci-gates.test.ts:1210`) : dit ici plutôt que cité comme pièce.
- **Harnais des mutants** : copies re-pointées (chemins, garde d'arbre, étiquette du verrou propre) ; la copie du G1 gagne l'attente sur le verrou propre du harnais du G2 (déclaré : elle attend, elle ne change aucun contrôle) ; diffs `mutants/diff-g1.txt`, `diff-g2.txt`, `diff-i2.txt`.
- **Mutants du G2 devenus inapplicables par construction** (motif absent ; le harnais s'arrête sur un motif absent) : G2-M7 (TXT-12 : la condition est désormais l'état E2, C-G2-2), G2-M11 (expression du lien en E0 remplacée, C-G2-7), I2-M4 (champ renommé, C-G2-10) ; hors de la liste de la mission ; non rejoués ; les refus qu'ils visaient restent épinglés (TXT-12 hors E2 : cas « another state » d'EAV ; lien en E0 : cinq formes au test ; phrases d'un autre état : cas existants).
- **Précision de lieu** : la garde (3) de C-G2-12 lit la constante du registre dans `dojoExpected` ; la page continue d'appeler `holdSnapshotStatus()` (inchangée) ; la garde (2) épingle cette fonction.

### 16.10 Advisor

- Consulté par l'outil intégré après l'orientation, avant toute écriture : compte R-25 d'abord (lignes ajoutées par le G1 modifiées en place : 0 ; lignes existantes de PR-4a-1 : 2 chacune ; mesure juste après l'écriture, coupe si > 700) ; textes d'abord, puis le sha256 (tout changement de texte ensuite oblige à refaire valeur, test et pli) ; piège du test de PR-4a-1 (son EA est sous version : l'oracle doit porter l'unité, `v` et `d` remontés) ; motifs des mutants requis à garder intacts, et les trois motifs qui cassent par construction à déclarer ; deux clones (mutants et builds à `809b9da` ; oracle sur la fusion du tronc, manifeste et `vocab-banned.json` vérifiés inchangés par le tronc) ; verrou « corr PR-4b », une prise, pas de mutants pendant l'oracle ; formes (balise ouvrante vers le corpus **et** les attributs ; statut de la constante ; deux variantes de TXT-11 hors des absences en E2 ; `JSON.parse` typé pour le cliquet ; `scanNumericText` encore importé ; `/dojo-served` hors de l'expression) ; lignes datées par ajout seul ; clôture (journal, `DELIVERED.sha256` régénéré après la dernière retouche). Conseil, jamais verdict ; chaque point vérifié sur pièce.
- Seconde consultation (19:5xZ), livrables écrits, oracle, mutants et export-run rendus : aucun changement de code ni de verdict ; retenus : consigner cette consultation ; dire que le journal du passage rouge du test du registre a été écrasé (§16.9) ; mesurer « rien sur C: » pour npm (§16.12) ; préciser que la lecture de `vocab-banned.json` ignore les exemptions (§16.2) ; régénérer `DELIVERED.sha256` après la dernière retouche et rendre les deux sha256 hors du fichier. Conseil, jamais verdict.

### 16.11 Items et questions

- Items : **NAME-EXPORT-PACKAGES-1** formé, hors lot (ligne datée de l'ADR §7) ; portés à l'ADR §7 depuis le G2 : DOJO-UNIT-SCALE-1, DOJO-NAME-GATE-RENDER-1, DOJO-ATTR-QUOTES-1, DOJO-LEAN-KERNEL-1 (question de l'investisseur, Q-G2-6) ; **fermés** : DOJO-PAGE-EA-VERSION-1 (C-G2-2), DOJO-REGISTER-NOTE-DIGITS-1 (C-G2-9), DOJO-LEXICON-INFLECTION-1 (Q-G2-4) ; inchangés : DOJO-PAGE-BUILD-DATA-1 (rejoué ici sur cinq états ; à rejouer au cp-2, puis prouvé par `g3-site` à la synchro), DOJO-REGISTER-LEG-TRIPWIRE-1 (dernière assertion du test du registre inchangée), ORACLE-CHILD-ABORT-1 (non reproduit), EXPORT-CHECK-IN-EXPORT-1 (mesuré de nouveau dans l'export), PR4B-CP1-POST-ANNOUNCE-1.
- **Q-C1 (orchestrateur, cp-2)** : la valeur de référence du sha256 de la liste fermée est écrite au pli daté des corrections (ADR D-1), faute de pli de cp-2 à cette heure ; le pli d'approbation du cp-2 la re-cite (et le test ne change que si un texte change) : confirmer.
- **Q-C2 (cp-2, P-10)** : trois textes à approuver : TXT-3 « {reads_done} of {k_reads} scheduled readings » (Q-1), TXT-11s (Q-G2-3), **TXT-5r** « the part that produced them » (mot choisi par le correcteur : ni lemme interdit, ni forme fléchie d'un lemme interdit ; « sixty days in a row » intact) ; autre forme possible, sans mot nouveau interdit : « the part they were computed on ».
- **Q-C3 (orchestrateur)** : C-G2-1 à C-G2-3 modifient trois fichiers de PR-4a-1, dont le G7 est acquis (`dojo-served-load.ts` +5 −4, `dojo-served.ts` +7 −7, `test/dojo-served.test.ts` +5 −4) : leur relecture relève-t-elle du cp-2 de PR-4b seul (recommandé : ce sont les formes minimales du G2, sous ses tests et ses mutants), ou d'une ligne datée au dossier de PR-4a-1 ?
- **Q-G2-6** (investisseur) : DOJO-LEAN-KERNEL-1, relayée telle quelle (aucun code).

### 16.12 `git status --short` final (worktree)

Relevé à 19:50:54Z (HEAD `809b9da` inchangé ; `git diff --stat 809b9da` sur les suivis : 11 fichiers) :

```
 M apps/site/COMPONENTS-PROVENANCE.md
 M apps/site/app/token/page.tsx
 M apps/site/lib/dojo-served-load.ts
 M apps/site/lib/dojo-served.ts
 M docs/adr/ADR-DOJO-PR-4.md
 M docs/adr/ADR-DOJO-SNAPSHOT-1.md
 M scripts/assert-fleet-html.d.mts
 M scripts/assert-fleet-html.mjs
 M scripts/public-text-deny.mjs
 M test/ci-gates.test.ts
 M test/dojo-served.test.ts
?? apps/site/app/dojo/
?? apps/site/components/dojo/
?? apps/site/lib/dojo-copy.ts
?? apps/site/lib/dojo-register.ts
?? docs/G1-lot-dojo-pr4b.md
?? test/dojo-page.test.ts
```

Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; `git` en lecture seule dans le worktree (`status`, `diff`, `rev-parse`, `log`, avec `--no-optional-locks`) ; deux `git clone --no-local` hors dépôt (`F:/tmp/dojo/pr4b-corr/probe`, `…/clone-m`) et, dans `clone-m` seulement, la fusion du tronc (commit local au clone jetable, identité locale à la commande) ; l'export `…/export` ; leurs `node_modules` sont réels (`npm ci --offline`, cache `F:/tmp/npm-cache`), à supprimer avec eux. Aucun réseau ; rien sur C: (TEMP/TMP/TMPDIR sur `F:/tmp/dojo/pr4b-corr/tmp` pour toute exécution ; cache et journaux de npm mesurés sur F: : `npm config get cache` = `F:\cache\npm`, `npm ci` sous `--cache F:/tmp/npm-cache`) ; aucun build dans le worktree ; aucun processus de fond laissé à la remise.

### 16.13 `error_origin` proposés par correction (le G7 assigne)

| Correction | `error_origin` proposé | Motif |
|---|---|---|
| C-G2-1 (TXT-3, lectures faites) | spécification | mère §8 TXT-3 et D-11 l.268 sans clé des lectures faites ; relevée au G2 de PR-4a-1, tranchée au cp-1 (Q-1) |
| C-G2-2 (EA sous version) | spécification | ADR D-1, ligne EA : « `day` seul » contre « TXT-4 ou TXT-4N selon la version » ; refus fail-closed du G1 conforme |
| C-G2-3 (échelle des totaux) | spécification | mère D-11 l.272 contre l.175 et l.178 ; `dojoPageFiguresOf` vient de PR-4a-1 |
| C-G2-4 (TXT-11 au singulier) | spécification | mère §8 TXT-11 au pluriel seul ; signalée par le G1 |
| C-G2-5 (attributs de `<main>`, preuves de D-4 (4)) | worker G1 | D-4 (4) codée sans test ; balayage hérité d'`extractMain` |
| C-G2-6 (« earned ») | spécification | lexique de la mère par lemme, TXT-5 de la mère porte la forme fléchie |
| C-G2-7 (liens absolus en E0) | worker G1 | expression du lien relatif seul |
| C-G2-8 (nom du partenaire exporté) | lots antérieurs | Hikae, contrats (hors lot) |
| C-G2-9 (note du registre) | worker G1 | détecteur d'honnêteté réemployé (dates et identifiants exemptés) |
| C-G2-10 (`absent`) | worker G1 | nom de champ différent de D-4 |
| C-G2-11 (formulation approuvée non tenue) | worker G1 et spécification | D-5 ne nomme aucun test de la formulation approuvée |
| C-G2-12 (pastille lue par la fonction de la page) | worker G1 | contrôle dérivé par la fonction même de la page |
| C-G2-13 (refus sans la pièce non prouvé) | worker G1 | test court |
| C-G2-14 (titre du test du lexique) | worker G1 | le titre promettait plus que la liste lue |
| Échappements transformés (§16.9) | worker correcteur (moi), outillage | barre oblique inverse tapée dans une commande ; détecté par le test du registre et relu en octets |

### 16.14 Remise

- Livrables et preuves copiés dans `F:/tmp/dojo/pr4b-corr-deliver/` par `F:/tmp/dojo/pr4b-corr/deliver.sh` ; `DELIVERED.sha256` auto-contrôlé (le journal y est la copie prise à la remise ; son sha256 est rendu hors du fichier).
