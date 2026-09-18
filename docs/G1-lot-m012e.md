# G1 — Génération tracée, Lot M012-e (textes publics « adaptive », go 4 — ADR-M012 D8/D9)

- **Rattachement** : ADR-M012 D8 (phrase publique de 655 caractères, octet-identique en 3 copies + constante de test), D9 (en-tête `tracker.ts`),
  investisseur « on garde adaptatif. et on annonce narabi adaptatif » (2026-09-17) ; go 4 = push/export des textes, go 5 = annonce à T ≥ 7.
- **Générateur** : worker **`claude-opus-4-8[1m]`** (R-1), dispatché par l'orchestrateur `claude-fable-5-1`, 2026-09-18 ; aucun commit (R-20). Rulings
  orchestrateur 1-7 (tweet 12 rectifié ; bloc README obsolète remplacé ; « exchangeability declared » retiré README/SKILL ; négations honnêtes
  gardées ; pas de bump de version de la skill ; placeholders T/borne ; panneau Narabi déféré au lot designer — rendu via `PlaceholderPanel`).

## Livrable (13 fichiers + `JOURNAL-PROVENANCE.md`, +203/−91 ; R-25 ≈ 293 hors lockfile/G1/G2)
- `README.md` **`ee5714ee…`** : bloc Narabi « adaptive quantile tracker » — D8 verbatim (l.72), formule Thm 1 `(B + η₁)/(T·η_T)` (l.50) adossée à
  `apps/sentinel/src/timeline.ts:40-43`, faits live (J0 2026-09-17, sentinelle depuis le 18, `monarkgate.tech/narabi/`, gate statique jusqu'à
  `rolling90_calm_miss ≥ 0.40` + ADR, borne > 0,10 jusqu'à T = 1789 à ε = 0,1, « no coverage is measured ») ; « 4 built / 7 named » ; **ligne CA l.123
  intacte, hors diff** (`token_ca_pinned` vert).
- `apps/site/lib/fleet.ts` **`566914db…`** : Narabi `upcoming → built` (registre = source unique) ; en-tête aligné (C9 orchestrateur : 4 built, 12 upcoming).
- `apps/site/lib/fleet-presentation.ts` **`d8e35771…`** : bloc INSIDE Narabi — « An adaptive quantile tracker (Angelopoulos, Barber and Bates decaying
  step) » (**C1 G2** : « split-conformal » retiré — terme réservé à la calibration statique committée, ADR-M012 l.104).
- `apps/site/lib/agents-presentation.ts` `0322f48b…`, `apps/site/app/roadmap/page.tsx` `8868f3e9…`, `apps/site/app/fleet/page.tsx` **`51dc4190…`**
  (« Four built, seven on the roadmap » ; commentaire « seven » C4) ; `apps/site/components/placeholder-panel.tsx` **`e4ccdd13…`** (doc-commentaire :
  sert aussi le capteur built Narabi via `WhatInside`, C6).
- `skills/monark/{SKILL,INTEGRATION,DEMO}.md` `a44e0ac6…` / `a5472ce3…` / `f94577ce…` : Narabi built, D8, aucun `live`, pas de bump.
- `package.json` **`856fd9b9…`** : `description` « fleet: 4 agents built, 7 on the roadmap » (**C2 G2** : surface exportée au miroir par
  `WHITELIST_FILES`, manquée par le worker).
- `test/ci-gates.test.ts` **`9a2c5913…`** : `fleet_register_built_set_is_frozen` → built = {Shōgen, Hikae, Ukemi, Narabi}, 4/12 ; **nouveau garde (0)**
  (orchestrateur, sur observation G2) : `package.json.description` doit contenir `fleet: ${built} agents built, ${upcomingAgents} on the roadmap` —
  **mutant** « 3 agents built, 8 » ⇒ ✖ `package.json description must state "fleet: 4 agents built, 7 on the roadmap"` ; restauré, sha identique.
- `test/visage-register.test.ts` **`24728123…`** : 4 built / 12 upcoming / 15 global ; commentaire « seven » (C5).
- **Hors dépôt** : brouillon du fil go 5 `scratchpad/thread-narabi-T7.txt` **`dc0ecf14…`** — 13 tweets ≤ 280 (max 272), 0 tiret, placeholders
  `[T_TODAY]` (tweet 1) et `[BOUND_TODAY]` (tweet 6) à remplacer depuis `state.json` le jour J (C7/C8) ; tweet 4 « 613 calm calibration pairs » (C3) ;
  aucune mention token hors négation ; `checkReleaseText` ok.

## Oracle — worker (pré-G2) : `ci` 256/256, `gate:vocab` 129, `lang:gate` 0, `lint` 0, `lint:ratchet` 69/69, `export:check` 0, `typecheck` 0,
`diff --check` propre, `checkReleaseText(README|thread)` ok. **G2 fraîche** (`docs/G2-lot-m012e.md`) : APPROUVÉ-AVEC-CORRECTIONS C1-C8 — toutes foldées.
**Orchestrateur (post-fold)** : rejoué identique — `ci` **256/256** (dont ci-gates 22/22 avec le garde (0)), `lint` 0, `lint:ratchet` 69/69,
`export:check` 0, `lang:gate` 0, `diff --check` propre.

## Déviations déclarées
Le garde (0) et C9 sont des ajouts **orchestrateur** post-G2 (petits, prouvés par mutant) — soumis tels quels au checkpoint-2 qui rejoue. Aucune
capture d'écran `next build` (non requis par la mission ; le rendu /fleet est couvert par les tests site). Le fil reste hors dépôt jusqu'au go 5.
