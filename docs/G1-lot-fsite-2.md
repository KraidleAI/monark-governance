# G1 — Journal de génération, lot F-site-2 (8 marques SVG des agents roadmap)

> **Exclu R-25** (`docs/G1-lot-*.md`, exclusion CI `.github/workflows/ci.yml` job `r25-taille-de-lot`) et
> **exclu de l'export public** (ADR-M004 D7, liste noire `docs/G1-*`). Doc de gouvernance FR — non scanné
> par `lang-gate` (SKIP_DIRS = docs) ni par le gate vocab (scopes : packages src / atelier / monark /
> apps-site — **jamais docs/**). Il peut donc citer le chemin source et les couleurs verbatim.

## 0. Générateur, Gate 0, contexte

- **Générateur (worker d'implémentation)** : `claude-opus-4-8` — **modèle résolu déclaré `claude-opus-4-8[1m]`**
  (contexte 1M), effort `max`. **Gate 0 (R-1) conforme** : préfixe `claude-opus-4-8` vérifiable, ce n'est pas
  `claude-opus-5` (banni, décision mainteneur 2026-08-14).
- **Date** : 2026-09-10. **Worktree** : `F:\Monark-wt-fsite2`, branche `lot-fsite2`, **base `main = 75b1e9e`**
  (`git rev-parse HEAD main lot-fsite2` = tous `75b1e9e2885746e70a97ba29e138d678d98c5f80`). **Mono-agent**.
- **Objet** : créer les 8 composants de marque des agents roadmap (Mokugeki, Narabi, Kaihi, Kessai, Kamae,
  Kyokusen, Koyomi, Genkan) dans `apps/site/components/marks/`, fidèles au design, sur le patron des 4
  marques déjà committées (`monark`/`shogen`/`hikae`/`ukemi`-mark.tsx).
- **Réviseur ≠ générateur** : la revue G2 est due à une instance séparée à contexte frais (non écrite par ce
  worker). **R-20** : ce worker **ne committe pas** et ne déclenche aucun workflow ; l'orchestrateur committe.
- **`error_origin`** : **aucune erreur ni correction post-lecture** sur ce lot (transcription mécanique d'une
  source unique et lisible ; aucune ambiguïté géométrique → aucune demande de procurement/consultation formée
  ouverte). Le champ `error_origin` reste **N/A pour ce lot** ; son assignation formelle demeure chez
  l'orchestrateur au G7 (framework AgileGates).

## 1. Fichiers créés

Tous **créés** (aucun modifié), tous purement additifs (`git status` = 8 `??`, rien d'autre).

| Fichier | Composant exporté | Lignes (numstat vs main) |
|---|---|---|
| `apps/site/components/marks/mokugeki-mark.tsx` | `MokugekiMark` | +24 / 0 |
| `apps/site/components/marks/narabi-mark.tsx` | `NarabiMark` | +28 / 0 |
| `apps/site/components/marks/kaihi-mark.tsx` | `KaihiMark` | +24 / 0 |
| `apps/site/components/marks/kessai-mark.tsx` | `KessaiMark` | +24 / 0 |
| `apps/site/components/marks/kamae-mark.tsx` | `KamaeMark` | +23 / 0 |
| `apps/site/components/marks/kyokusen-mark.tsx` | `KyokusenMark` | +24 / 0 |
| `apps/site/components/marks/koyomi-mark.tsx` | `KoyomiMark` | +30 / 0 |
| `apps/site/components/marks/genkan-mark.tsx` | `GenkanMark` | +24 / 0 |
| `docs/G1-lot-fsite-2.md` | ce fichier (exclu R-25 + export) | — |

**Non touchés** : `schemas/`, `packages/` — `git diff main -- schemas/ packages/` = **vide** (0 octet, §5).
Aucun `schemas/`/`packages/` importé ou modifié. **Non importés** : les 8 fichiers ne sont câblés dans aucune
route (mission : « pas encore importés → doivent au moins compiler/lint proprement ») ; `next build` les
type-checke et ils compilent (§5), les routes restent `/`, `/_not-found`, `/roadmap`.

Contrat présentationnel (patron cible respecté, identique aux 4 marques committées) : `import type { SVGProps }
from "react"` ; `export function XxxMark({ className, ...props }: SVGProps<SVGSVGElement>)` ; `<svg viewBox="0 0
64 64" fill="none" className={className} aria-hidden="true" focusable="false" {...props}>`. **Server-safe** :
pas de `"use client"`, pas d'état, pas de hook. **Ink = `currentColor`**, **accent codé en dur**, décoratif
(`aria-hidden`).

## 2. Source des géométries (vérité) + sha256

- **Fichier source** (chemin avec espaces, cité verbatim) :
  `C:\Users\KACIMI\Downloads\Project scoping form-handoff\project-scoping-form\project\MONARK.dc.html`
- **sha256** (`sha256sum`, 2026-09-10) : `6f50238adaead328819227b5d23e7a16eb16a2d18efecfdbb01b46a00b58b2ff`
- **Fonction** : `mark(k, size)` du `<script type="text/x-dc">`, **lignes 606-621**. Constante partagée
  `const L = {strokeLinecap:'round',strokeLinejoin:'round'}` en **ligne 611** (transcrite `strokeLinecap="round"
  strokeLinejoin="round"` partout où le design écrit `...L`).
- **Branches transcrites** : `mokugeki` l.612, `narabi` l.613, `kaihi` l.614, `kessai` l.615, `kamae` l.616,
  `kyokusen` l.617, `koyomi` l.618, `genkan` l.619.
- **Preuve de lignée (source = même que les 4 marques committées)** : les branches `monark` (l.607), `shogen`
  (l.608), `hikae` (l.609), `ukemi` (l.610) de ce même `mark()` sont **géométrie-pour-géométrie identiques** aux
  4 fichiers déjà committés (`monark-mark.tsx` : path `M11,20 L32,32 …`, 6 cercles r=4, cercle central r=7.5
  `#A6453E` ; `shogen` : `M14 18 L32 48 …`, cercles r=6/r=8 `#FF6B4A` ; `hikae` : rails `#12857A` + ligne
  brisée `M12,37 L20,26 …` ; `ukemi` : baseline op .4 + 3 barres + barre `#5661C9`). `MONARK.dc.html` est donc
  bien la source de design d'où les marques existantes ont été transcrites — même provenance, même patron.
- **Statut de la source** : fichier de handoff **externe, non committé** dans ce miroir public (même statut
  que les `*-mark.svg` externes cités par les 4 marques committées ; own-the-code, R-8). Source **identifiée,
  lue, sha256-enregistrée** ci-dessus → **pas une dette** ; noté pour la traçabilité.

## 3. Fidélité de la transcription, par agent (accent confirmé depuis le design)

Chaque marque est une transcription **caractère-pour-caractère** des attributs `path`/`circle`/`rect` de sa
branche. `.map(...)` du design (tableaux de nœuds) **déplié en éléments statiques explicites, sans `key`**
(précédent `monark-mark.tsx` : ses 6 cercles sont générés par `.map` dans le design, écrits explicitement dans
le fichier committé). `.4/.45/.5` → `"0.4"/"0.45"/"0.5"` (précédent `ukemi-mark.tsx`). Présence/absence de
`fill` recopiée telle quelle (précédent `hikae-mark.tsx` : le 1ᵉʳ path sans `fill` hérite `fill="none"` du
`<svg>`, le 2ᵉ porte `fill="none"` explicite).

| Agent | Ligne | Accent (codé en dur) | Confirmé design | Élément(s) accent | Élément(s) ink (`currentColor`) |
|---|---|---|---|---|---|
| Mokugeki | 612 | `#4E6E8E` | l.498/526 + `stroke:'#4E6E8E'` | 2 crochets (`[`, `]`) | croix d'œil (1 path) + pupille (circle r=3) |
| Narabi | 613 | `#B8922E` | l.499/527 + `stroke:'#B8922E'` | barre debout + chapeau (2 paths) | baseline (op 0.4) + 4 barres de file |
| Kaihi | 614 | `#E06B2E` | l.500/528 + `stroke:'#E06B2E'` | arc d'évitement + pointe (2 paths) | losange (path fermé `Z`) |
| Kessai | 615 | `#2E8B57` | l.501/529 + `fill:'#2E8B57'` | nœud de règlement (circle r=6) | 2 flèches (2 paths) |
| Kamae | 616 | `#7A5AC2` | l.502/531 + `fill:'#7A5AC2'` | nœud de garde (circle r=5) | 4 jambes (1 path multi-M) |
| Kyokusen | 617 | `#C0478F` | l.503/533 + `stroke:'#C0478F'` | courbe (Q) + point (circle r=3.4) | axes (op 0.45, 1 path) |
| Koyomi | 618 | `#1E9AA6` | l.504/532 + `stroke:'#1E9AA6'` | 2 cellules week-end (2 rects `fill="none"`) | en-tête + 4 cellules + 2 demi-cellules (op 0.5) |
| Genkan | 619 | `#B06A4A` | l.505/534 + `stroke:'#B06A4A'` | seuil (barre, path w=4.6) | arche (path Q) + flèche entrante (1 path) |

Les 8 accents correspondent **exactement** aux couleurs de mission (Mokugeki #4E6E8E, Narabi #B8922E, Kaihi
#E06B2E, Kessai #2E8B57, Kamae #7A5AC2, Kyokusen #C0478F, Koyomi #1E9AA6, Genkan #B06A4A) et aux deux tables du
design (tableau `UPCOMING` l.498-505, tableau `AGENTS` l.526-534) **et** à la valeur codée en dur dans la
branche `mark()`.

**Preuve reproductible (R-21)** — `scratchpad/fidelity.mjs` extrait chaque `d:'…'` de la ligne source et
chaque `d="…"` du `.tsx`, vérifie l'égalité (les 4 barres `.map` de Narabi contrôlées comme `M{x},47 L{x},{y}`
pour `[15,41]/[24,37]/[33,32]/[42,26]`), puis spot-check des coordonnées `circle`/`rect`, hexs d'accent et
`strokeWidth`. Sortie (le script est éphémère ; sortie reportée ici pour auto-suffisance) :

```
mokugeki  d-literals design=3 tsx=3 match=OK
narabi    d-literals design=3 tsx=7 match=OK +4 map-bars OK
kaihi     d-literals design=3 tsx=3 match=OK
kessai    d-literals design=2 tsx=2 match=OK
kamae     d-literals design=1 tsx=1 match=OK
kyokusen  d-literals design=2 tsx=2 match=OK
koyomi    d-literals design=0 tsx=0 match=OK
genkan    d-literals design=3 tsx=3 match=OK
(circle/rect/hex/strokeWidth spot-check : 33 tokens, tous design=y tsx=y)
ALL FIDELITY CHECKS: OK
```

**Koyomi n'a aucun `path`** (`d`-check à 0 = vacux) : ses **9 `rect`** sont énumérés et vérifiés à la main
contre la **ligne 618**, dans l'ordre du design :
1. en-tête `x=11 y=15 width=47 height=5 rx=1.5 fill="currentColor"` (ink) ;
2-5. 4 cellules jours (`.map [11,20,29,38]`) `x=11/20/29/38 y=26 width=5 height=11 rx=1.5 fill="currentColor"` (ink) ;
6. `x=47.5 y=26 width=5 height=11 rx=1.5 fill="none" stroke="#1E9AA6" strokeWidth="2"` (accent) ;
7. `x=47.5 y=41 width=5 height=7 rx=1.5 fill="none" stroke="#1E9AA6" strokeWidth="2"` (accent) ;
8-9. 2 demi-cellules `x=11/29 y=41 width=14 height=7 rx=1.5 fill="currentColor" opacity="0.5"` (ink).

Les 9 `rect` du fichier correspondent un-pour-un ; l'advisor a par ailleurs re-vérifié les attributs non-`d`
(chaque `strokeWidth`, `opacity`, présence/absence de `fill`, `strokeLinecap`/`strokeLinejoin`) des 8 marques.

## 4. Honnêteté (test 44, langue, vocab, plateformes)

- **0 chiffre en position rendue** : tous les nombres des marques sont des **attributs SVG** (`d`, `cx`, `cy`,
  `r`, `x`, `y`, `width`, `height`, `rx`, `strokeWidth`, `opacity`, `viewBox`). Le détecteur `apps/site/test/
  honesty-lint.ts` (test 44b) ne signale un littéral numérique que dans une **position rendue** : texte JSX,
  expression enfant JSX, attribut **visible** (`alt/title/aria-label/placeholder/label/value/content`),
  metadata Next exportée, prose MDX. Mes attributs SVG **n'y sont pas** (`VISIBLE_ATTRS`) ; aucun nœud texte,
  aucune expression enfant, aucun `metadata`. Test 44 **vert** empiriquement (§5).
- **Langue** : anglais, `lang-gate --scope site` = **0 hit non-exempt** (§5). Aucun mot proscrit même en
  commentaire (vérifié par `grep-forbidden`, §5).
- **0 plateforme tierce** : les commentaires ne décrivent que la **géométrie** (« the two brackets », « the
  threshold bar », …), jamais un câblage produit — aucun nom de plateforme (gate vocab site vert).

## 5. Oracle (exit codes réels observés, sans pipe masquant l'exit)

| Commande | Résultat | Exit |
|---|---|---|
| `npm ci` | added 276 packages, audited 283, **0 vulnerabilities**, 14 s | **0** |
| `npm run ci` (`gate:vocab` + `typecheck` + `test`) | **tests 100 / pass 100 / fail 0** (dont test 44a/b honnêteté, test 42 export = 30,9 s, `frozen_contract_fields_stay_dynamic`, gardes F-2a/b/c) | **0** |
| `npm run lint` (`eslint .`) | aucun diagnostic | **0** |
| `npm run lint:ratchet` | **92/92** (plafond inchangé, +0 dette de typage) | **0** |
| `(cd apps/site && npx next build)` | Compiled successfully in 4.2 s ; TypeScript OK ; routes `/`, `/_not-found`, `/roadmap` (static) | **0** |
| `node scripts/lang-gate.mjs --scope site` | 0 hit non-exempt (site GATED) | **0** |
| `node scripts/grep-forbidden.mjs` | OK — scanned 68 file(s), no forbidden claim | **0** |
| `git diff 75b1e9e -- schemas/ packages/` | **vide** (0 octet) | **0** |

> **Base épinglée au SHA `75b1e9e`, pas au ref `main` (important pour l'orchestrateur).** Pendant la session,
> `main` a **avancé** de `75b1e9e` → `5db169f` (commits hors ce lot : `site-header`/`site-footer`/
> `theme-provider`, `globals.css`/`layout.tsx` étendus, `docs/PLAN-Fsite-lot.md`…). Mon worktree HEAD reste
> `75b1e9e` et `git merge-base main HEAD = 75b1e9e` (= la base three-dot que calcule la CI `r25-taille-de-lot`
> via `origin/base...HEAD`). Un `git diff main` **deux-points** injecterait ~590 fausses « suppressions » qui ne
> sont **pas** miennes ; tous mes diffs sont donc épinglés au **commit** `75b1e9e`. `grep-forbidden` scanne 68
> fichiers (67 + `apps/site/next-env.d.ts` généré par `next build`, gitignoré, non committé).

- **Compilation des fichiers non importés** : `next build` exécute l'étape TypeScript sur le projet
  `apps/site` (qui inclut `components/**`) — les 8 fichiers, bien que non référencés par une route, sont donc
  **type-checkés et compilent proprement** (build vert). C'est la preuve demandée par la mission (« doivent au
  moins compiler/lint proprement »).
- **test 42 (export public)** exécute un `npm ci` + `npm run ci` imbriqués dans une copie temporaire : il
  ramasse mes 8 fichiers via le glob de répertoire `apps/site` (pas d'énumération par fichier ni de whitelist
  à éditer) et reste **vert** (anglais + TSX valide + 0 vocab). Aucune édition de `export-public.mjs` requise.

## 6. R-25 (mesuré, sous le plafond)

Deux méthodes concordantes (les 8 fichiers sont purement additifs). **Base épinglée au commit `75b1e9e`**
(= `merge-base(main, HEAD)`, cf. §5 : `main` a avancé pendant la session ; differ contre le ref `main` fausse
le compte) :

- **Σ `wc -l`** des 8 `.tsx` = **201** lignes (0 suppression).
- **Formule CI reproduite** (intent-to-add, puis `git reset` — **aucun commit**, R-20 intact) :
  ```
  git add -N apps/site/components/marks/{les 8}.tsx
  git diff --shortstat 75b1e9e -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' \
      ':(exclude)docs/G2-lot-*.md' ':(exclude)package-lock.json'
  git reset -q
  ```
  → **`8 files changed, 201 insertions(+)`** ⇒ **CHANGED = 201** (détail : genkan 24, kaihi 24, kamae 23,
  kessai 24, koyomi 30, kyokusen 24, mokugeki 24, narabi 28).

**201 < 1205** (`VIBEGATES_PR_LIMIT`, ADR-M003 D9) ⇒ **pas de scission**. `docs/G1-lot-fsite-2.md` est exclu du
compte par `:(exclude)docs/G1-lot-*.md` (donc n'entre pas dans les 201). Après `git reset`, `git status` =
8 `??` + `docs/G1-lot-fsite-2.md` (état non suivi restauré ; HEAD toujours `75b1e9e`). La CI `r25-taille-de-lot`
calcule `origin/base...HEAD` (three-dot = merge-base) → même 201, robuste au rebase de `lot-fsite2` sur `main`.

## 7. Choix (pour la revue G2) — aucun n'est une devinette

1. **Enveloppe `<svg>` = patron committé, pas le `p` du design.** Le `p` du design porte
   `width:'100%',height:'100%',style:{display:'block'}` ; les 4 marques déjà committées **les omettent** et
   dimensionnent via `className`. J'ai suivi le patron committé (mission : « imiter »), donc `viewBox` + `fill`
   + `className` + `aria-hidden` + `focusable` + `{...props}`, **sans** width/height/style. Divergence
   délibérée et homogène avec l'existant.
2. **`.map()` déplié en éléments explicites sans `key`** — précédent `monark-mark.tsx` (6 cercles générés par
   `.map` dans le design, écrits explicitement dans le fichier). Aucune sémantique de rendu changée.
3. **`.4/.45/.5` → `"0.4"/"0.45"/"0.5"`** — précédent `ukemi-mark.tsx` (`opacity="0.4"`). Valeur identique,
   forme normalisée du patron.
4. **`fill` recopié tel quel** (présent/absent selon la branche) — précédent `hikae-mark.tsx`. Les paths sans
   `fill` héritent `fill="none"` du `<svg>` (fidèle au design, qui compte dessus).
5. **Descripteurs de géométrie dans les commentaires** (« the two brackets », etc.) — géométrie pure, jamais
   de câblage produit ni de nom de plateforme (gate vocab vert).
6. **Aucune ambiguïté géométrique** dans les 8 branches (source lisible, valeurs explicites) → **aucune
   demande de consultation/procurement formée** ouverte pour ce lot.

## 8. Dettes

**Aucune.** Zéro `[2nd]` ; source unique identifiée, lue, sha256-enregistrée ; aucun point non résolu. Le seul
élément de traçabilité reporté (source de design externe non committée) est **documenté** (§2), au même statut
que les 4 marques committées — pas une dette, pas un « dû » nu.
