Modèle résolu : claude-opus-4-8[1m]

# G1 — lot SITE-RELEASE-1, SOUS-LOT B (page `/ukemi` + favicon ukemi + assertion body) — persisté (C-2)

> Ce document est la version **persistée au dépôt** du G1 sous-lot B (checkpoint-2 C-2 : plus aucun renvoi
> vers un chemin hors dépôt comme source ; la ligne Tuyaux B est écrite verbatim ci-dessous, sources = fichiers du dépôt).
> Il plie aussi **C-1** (pilule assertée sur l'artefact) et **C-3** (écarts maquette non déclarés du cp-2 §4).
> Provenance : worker `claude-opus-4-8` (effort max), worktree `lot/site-release-1-B`, base `7c34bef`, sous-lot B
> committé `2de11fb` ; corrections cp-2 en cours d'arbre (non committées, R-20). Aucun commit ni workflow (R-20).

## 1. Fichiers du sous-lot B (7 ; disjoints de A — G0 §19)
| Fichier | Rôle |
|---|---|
| `apps/site/app/ukemi/page.tsx` | Route `/ukemi` : server component **STATIQUE** ; `metadata` title/description **digit-free** ; **`metadata.icons` = `/icons/ukemi.svg`** (asset statique, jamais icône de route `/ukemi/` — ruling D-2). |
| `apps/site/public/icons/ukemi.svg` | Favicon Ukemi adaptatif (`@media prefers-color-scheme`), **octets v4 byte-exact** (`90eea553…`), **0 URL** distante. Servi à `/icons/ukemi.svg`. |
| `apps/site/components/ukemi/ukemi-page.tsx` | Corps dans un `<main>` : hero + **pilule `built` lue du registre** (eyebrow « Ukemi » + `{status}` adjacents ⇒ « Ukemi built » dans le corpus) ; is/is-not ; « what is served » = `LIQ_EMPTY_REGISTRY_SENTENCE` en **un seul `{X}`** + barre borne-haute schématique (`aria-hidden`, sans graduation) + `LIQ_CONDITIONAL_SENTENCE` ; méthode digit-free (ordinaux `01…04` **digit-free**) ; limites. Lit **`status` SEUL** (C-6). |
| `apps/site/lib/ukemi-copy.ts` | **Données pures** (aucun import React/Next) : les **4** constantes `LIQ_*` **byte-identiques** à `gate.ts` ; prose méthode/limites/is-is-not digit-free ASCII ; `UKEMI_ROUTE`. |
| `scripts/assert-fleet-html.mjs` | **Étendu (voie i)** : `assertUkemiBody({html, expected})`, `UKEMI_HTML_REL`, scan numérique parité `honesty-lint`, `extractMain`, `mainCorpus` ; `main()` lit AUSSI `ukemi.html` et **dérive `expected.status` de `FLEET_AGENTS` réel** (C-1). Ligne `run:` CI **inchangée** (C-4). `renderedBody`/`assertFleetBody` PARTAGÉES inchangées. |
| `scripts/assert-fleet-html.d.mts` | Jumeau de types (nouvelles exportations, dont `assertUkemiBody` avec `expected.status`). Governance-only, non whitelisté. |
| `test/site-ukemi.test.ts` | 5 tests racine nommés + fixtures pilotant `assertUkemiBody` **composées des vrais exports** (A-8) ; la pilule est lue du **registre réel** `FLEET_AGENTS`, jamais codée en dur. |

**Écart de forme vs G0 §19 (ruling D-2)** : `app/ukemi/icon.svg` → `apps/site/public/icons/ukemi.svg` (asset statique, disjoint de `public/icons/narabi.svg` de A ; fusion sans conflit).

## 2. Tuyaux B — VERBATIM (F-1 ; sources = dépôt seulement ; aucun renvoi hors dépôt) [C-2]
- **Entrée (qui produit)** : `apps/harness/src/tools/gate.ts` (4 constantes servies `LIQ_UPPER_BOUND_SENTENCE`, `LIQ_H3_SENTENCE`, `LIQ_CONDITIONAL_SENTENCE`, `LIQ_EMPTY_REGISTRY_SENTENCE` — source de vérité du texte servi) → `apps/site/lib/ukemi-copy.ts` (**byte-identique**, prouvé par `test/site-ukemi.test.ts::site_ukemi_copy_equals_served_liq_text` qui importe les DEUX modules) ; `apps/site/lib/fleet.ts` → **`status` SEUL** de l'agent Ukemi (jamais `line`/`wiring.note`, qui portent « cascade ») ; `apps/site/app/globals.css` (tokens storefront).
- **Sortie (qui consomme)** : `apps/site/app/ukemi/page.tsx` — **route `/ukemi`, server component STATIQUE, rendue par `next build` et servie** (Caddy `file_server`), lue par un visiteur = **NOUVELLE surface servie branchée**. Le `<main>` (dans `apps/site/components/ukemi/ukemi-page.tsx`) rend `LIQ_EMPTY_REGISTRY_SENTENCE` (un seul `{X}`), la clause `LIQ_CONDITIONAL_SENTENCE` (« which the gate does not check »), la prose méthode/limites digit-free, la barre schématique (`aria-hidden`, sans chiffre), et la **pilule `built`** lue du registre (« Ukemi <status> » dans le `<main>`) ; `apps/site/public/icons/ukemi.svg` sert le favicon via `metadata.icons`.
- **État (où il vit)** : `apps/site/lib/fleet.ts` (source unique built/upcoming, Ukemi = `built` gelé) ; registre de la classe liq **vide** au temps 1 ⇒ état honnête `under_calib`.
- **Test d'intégration non-LLM (autorise « branché », D-3)** : job CI **`g3-site`** = `npm run build -w @monark/site` (typecheck TSX + rendu `apps/site/.next/server/app/ukemi.html`) → `node scripts/assert-fleet-html.mjs` (assertion sur l'artefact RÉEL : `<main>` digit-free scan=0, `LIQ_EMPTY_REGISTRY_SENTENCE` + clause présentes byte-identiques, **pilule = statut du registre**, `interval`/`\bcascade\b`/`\bBell\b`/`\bAave\b` = 0) **+** `test/site-ukemi.test.ts` (égalité 4 constantes vs `gate.ts`, A-9 never-interval, `assertUkemiBody` sur fixtures, parité scanner, carriers, statut réel) **+** oracle LOCAL `<link rel="icon">` du `<head>` bâti de `/ukemi`. La composition depuis l'artefact RÉEL satisfait CA-11.
- **Branchement** : `/ukemi` est une NOUVELLE surface servie branchée par `g3-site` ; elle **ne flippe aucun statut** (Ukemi déjà `built` via le seam ; la borne-haute flippe `built` en U-4b-2b).
- **Résiduel branchement NOMMÉ** : aucun lien vers `/ukemi` depuis `SiteHeader`/`/fleet` (fichiers ∉ B) ; route servie par URL. **Déclencheur** : lot site de suivi (nav) ou U-4b-2b.

## 3. C-1 (bloquante, CA-11 durci) — la pilule est assertée sur l'ARTEFACT
Le mutant **X5** (`const status = ukemiAgent.status === "built" ? "upcoming" : ukemiAgent.status`) lit toujours `.status` mais **inverse la valeur affichée** : il survivait au contrôle source `site_ukemi_reads_status_only` (regex `.status`). Correction (3 fichiers du lot, `fleet.ts` intact) :
- `assertUkemiBody({html, expected})` reçoit **`expected.status`** (vacuity-gardé) ; après les contrôles digit-free/présence/absence, il exige le **porteur « Ukemi <status> »** dans le corpus du `<main>` bâti (l'eyebrow « Ukemi » et la pilule `{status}` rendent adjacents ⇒ « Ukemi built »).
- `main()` de `scripts/assert-fleet-html.mjs` dérive `status` du **`FLEET_AGENTS` réel** (déjà importé) : `FLEET_AGENTS.find(a => a.name === "Ukemi").status` ; fail-closed si Ukemi absent.
- `scripts/assert-fleet-html.d.mts` : signature mise à jour (`expected.status`, retour `.status`).
- `test/site-ukemi.test.ts` : `greenMain()` lit le **registre réel** (`FLEET_AGENTS`, A-8) au lieu de `<span>built</span>` codé en dur ; cas rouges ajoutés : **pilule flippée** (« Ukemi <flipped> » ⇒ `pill does not carry`), **pilule absente**, **`expected.status` vide** (vacuity).
- **Mesuré (chemin RÉEL build → assert)** : X5 ⇒ tests racine VERTS (survivent au source) **mais assertion artefact ROUGE** (« the /ukemi `<main>` pill does not carry the registry status (expected carrier "Ukemi built") — mutant X5 » ; le `<main>` bâti dit « upcoming », plus « Ukemi built »). C-1 clos.

## 4. Oracle (env des 8 clés payantes RETIRÉES, A-7 ; codes capturés directement, A-3)
`npm run ci` **0** (815 tests, **814 pass, 0 fail**, 1 skip pré-existant) · `gate:vocab` 0 · `typecheck` racine 0 · `tsc -p apps/site/tsconfig.json` **0** (typecheck TSX site) · `lint` 0 · `lint:ratchet` 0 · `lang:gate` global+site 0 · `export:check` 0 · **`npm run build -w @monark/site -- --webpack` 0** (worktree ; ruling D-1 ; `next.config.mjs` intact ; ligne `run:` CI `next build` inchangée) · **`node scripts/assert-fleet-html.mjs` 0** sur l'artefact frais (`/fleet` 4 notes ; `/ukemi` `<main>` digit-free **0 token**, état+clause présents, **pilule = statut registre "built"**, 0 interval/cascade/Bell/Aave). Favicon head bâti : `href="/icons/ukemi.svg"` ×1, `href="/ukemi/icon…"` ×0.

**R-25 B** (pathspec verbatim `ci.yml:65`, `.md` exclus, SVG comptés) vs `7c34bef` = **853** lignes (850+/3−) < 1150.

**Mutants (D-1)** : 14 nommés (test racine, tous ROUGES, restauration byte-exacte) **+ X5** (pilule flippée, ROUGE sur le chemin build→assert) **+ X1/X2/X6b** du validateur re-pointés sur le worktree (chemin RÉEL, tous ROUGES sur l'artefact). Harnais rejouables sous le répertoire de rendu du lot (hors dépôt, A-4) ; le test d'intégration DÉPÔT qui autorise « branché » est `g3-site` + `test/site-ukemi.test.ts` (ci-dessus, §2).

## 5. Registre des écarts à la maquette v4 — INFORMATION due à l'investisseur (pas escalade)
Étend G0 §16.1. Chaque écart porte son **déclencheur** (jamais une dette nue).

### 5.1 Écarts déjà déclarés au G0 §16.1 (rappel)
1. « shipped » → « built » (Q-8b, le mot suit le registre gelé).
2. « day N » → « step N of 7 » (C-3, côté sous-lot A).
3. Ordinaux « 01·book »…« 04·region » et strates « S1 »…« S4 » **rendus digit-free** (C-1/C-10 : scan `<main>` = 0).
4. Régions SAMPLE et figures design-set **non rendues** au temps 1 (Q-5a, digit-free) — **déclencheur U-4b-2b**.

### 5.2 Écarts NON déclarés attrapés au checkpoint-2 §4 (i)–(v) — désormais déclarés [C-3]
| # | Écart mesuré sur `v4\ukemi.html` | Traitement temps 1 | Déclencheur |
|---|---|---|---|
| (i) | Section « **design episode** » **entière** absente (prose + énoncés des 4 hypothèses U4-H*, pas seulement les figures) | Non portée : la section entière porte des chiffres design-set (185 of 189, 162/189 85.7 %, 69/107, 790/797) et raconte l'épisode de conception ; incompatible avec le temps 1 digit-free (Q-5a) | **U-4b-2b** (record design-set committé + manifesté) |
| (ii) | Bloc « **Provenance** » (reads « 2 of 2 », prereg_sha/ukemi_sha, « signature attests origin, not truth ») absent | Non porté : « 2 of 2 » et les sha sont des chiffres/valeurs SAMPLE en position rendue ; l'état servi au temps 1 est `under_calib` (registre vide), pas un enregistrement provenancé | **U-4b-2b** (avec le record servi) |
| (iii) | Section « **replay it** » (commandes `sha256sum -c`, `node --test`, digests SAMPLE) absente | Non portée : les digests/commandes sont des placeholders SAMPLE de la maquette ; le release imprimera les vrais | **U-4b-2b** (record réel à rejouer) |
| (iv) | **Dérives de texte is/is-not** : « no loan-to-value » retiré ; « separate from the design episode, which is never served » retiré ; « in the stratum » → « for a population » | (a) « no loan-to-value » : porté en équivalent honnête générique « it sets no threshold and no cap » (le point « pas un paramètre de risque » est préservé) ; (b) « separate from the design episode… » : lié à l'omission design-set (temps 1) ; (c) « in the stratum » → « for a population » : **consistance inter-pages** — l'abstention under_calib reprend la définition UNIQUE du glossaire du lot (livré par A, G0 §6.4 : « Too few calibration points **for a population**… ») pour que les deux pages définissent under_calib à l'identique ; la page garde « per stratum » partout ailleurs (hero, is/is-not, méthode, COVERAGE_NOTE) | (a)+(b) **lot de suivi** (restauration verbatim quand le design-set/venue est porté) ou justification retenue ; (c) **lot de suivi** si l'investisseur préfère le verbatim maquette « in the stratum » — NB : « in the stratum » est du vocabulaire Ukemi natif ; le C-11 visait son retrait de la page **Narabi**, il ne justifie pas de le retirer de `/ukemi` (citation corrigée au pli) |
| (v) | Lignes du bloc servi **`class` / `price path` / `unit` / `nominal coverage`** non portées | Non portées : `nominal coverage` porte « 1 − α, α = 0.01, 100 » (chiffres) ; `class`/`price path`/`unit` décrivent le record servi (SAMPLE au temps 1). La méthode digit-free en donne l'équivalent en prose (« one venue, one collateral class », « the oracle updates the venue consulted », « account · single-collateral WETH ») | **U-4b-2b** (bloc servi chiffré au record réel) ou lot de suivi pour la prose descriptive |

## 6. Jeu FERMÉ de 4 constantes + omission (C-2 du cp-1)
Les 4 `LIQ_*` sont **byte-identiques** à `gate.ts` (longueurs 169/149/160/110 ; test d'égalité). **Rendues** (digit-free) : `LIQ_EMPTY_REGISTRY_SENTENCE` (état servi honnête), `LIQ_CONDITIONAL_SENTENCE` (clause). **Portées mais NON rendues** : `LIQ_UPPER_BOUND_SENTENCE` (« …is **0** by construction ») et `LIQ_H3_SENTENCE` (« **H-3** ») — un chiffre rendu rougirait le scan `<main>` ; carrier négatif AST (ni `{IDENT}` ni import dans le composant) ; ride à **U-4b-2b**. `LIQ_REQUIREMENTS_SENTENCE` (« alpha = 0.01, nMin = 100 » — chiffres) **OMISE** du jeu (Q-5a) — vérifié sur les exports (AST).

## 7. Zéro dette à la clôture (P5)
Aucun « dû » nu. Items formés avec déclencheur : nav `/ukemi` (lot de suivi / U-4b-2b) ; figures design-set + sections (i)-(iii) + bloc servi (v) (U-4b-2b) ; `LIQ_UPPER_BOUND`/`LIQ_H3` non rendues (U-4b-2b) ; dérives (iv) (lot de suivi ou justification retenue ; (c) conforme C-11). Sources = fichiers du dépôt [lu] (lot d'ingénierie interne) ; aucun procurement de papier requis.
