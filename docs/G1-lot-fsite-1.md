# G1 — Journal de provenance — Lot F-site-1 (Shell & tokens de marque)

- **Campagne** : F-site MONARK (port du design `MONARK.dc.html` sur la fondation gouvernée).
- **Worktree** : `F:\Monark-wt-fsite` — branche `lot-fsite`, base `main = 75b1e9e`.
- **Date** : 2026-09-10.
- **Contrat** : `docs/PLAN-Fsite-lot.md` §7 (amendements checkpoint-1 C-1..C-9) + `docs/adr/ADR-M004-infrastructure-plateforme.md` addendum **D15**.
- **Rôle** : worker mono-agent. **R-20** : ne committe pas, ne déclenche aucun workflow. La revue G2 (instance séparée, contexte frais) et le verdict G7 restent à l'orchestrateur.

## Gate 0 (R-1) — contrôle de résolution du modèle
- **Modèle résolu tel quel** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` attendu — conforme ; **pas** `claude-opus-5` banni).
- **Effort** : `max`.

## Fichiers créés / modifiés (code de ce lot)
| Fichier | Statut | +/- vs main |
|---|---|---|
| `apps/site/app/globals.css` | modifié (refonte navy/gold → papier/encre/Sora) | +179 / -78 |
| `apps/site/app/layout.tsx` | modifié (next/font, ThemeProvider, header/footer, metadata statique) | +53 / -2 |
| `apps/site/components/theme-provider.tsx` | créé (`"use client"`) | +86 |
| `apps/site/components/site-header.tsx` | créé (`"use client"`) | +126 |
| `apps/site/components/site-footer.tsx` | créé (server) | +72 |

Réutilisé tel quel (non modifié) : `apps/site/components/marks/monark-mark.tsx` (géométrie identique au `mark('monark')` du design L607, accent `#A6453E`, `currentColor`, `aria-hidden`).

**Non touchés** (impérativement) : `apps/site/app/page.tsx` (le porteur R-E minuscule « no confidence field » L103 y reste intact), `roadmap/page.tsx`, panneaux `{panel-shell,hikae,ukemi,shogen,upcoming}-panel`, `agent-card`, `status-badge`, `ui/{button,dialog}`, `next.config.mjs`, `components.json`, `apps/site/package.json`. `schemas/` et `packages/` : `git diff main` **vide** (0 octet).

## Décisions — mapping des tokens shadcn → marque (globals.css)
Principe (reco advisor, moindre churn) : **le contrat de tokens shadcn garde ses noms** et se re-value **par chaînes `var()`** sur les tokens de marque ; `.dark` n'override que le set de marque (design L15) et les tokens de contrat suivent automatiquement.

| Token shadcn | Valeur (light) | Rationale |
|---|---|---|
| `--background` | `var(--paper)` #FAF7F2 | fond papier |
| `--foreground` | `var(--ink)` #1F1B16 | encre |
| `--card` / `--card-foreground` | #FFFDF9 / `var(--ink)` | carte du design |
| `--popover(-foreground)` | `var(--card)` / `var(--ink)` | idem carte |
| `--primary` / `--primary-foreground` | `var(--ink)` / `var(--paper)` | CTA du design `bg:ink;color:paper` ; **flip auto en dark** (ink devient clair) |
| `--secondary(-foreground)` / `--muted` | `var(--soft)` / `var(--ink)` ; `var(--soft)` | surfaces douces |
| `--muted-foreground` | `var(--ink2)` #665D52 | texte secondaire |
| `--accent` / `--accent-foreground` | `var(--monark)` / `var(--ink)` | **accent de marque monark** : garde visible la boîte porteuse R-E de `page.tsx` L101 (`bg-accent/10 border-accent/40`) ; `text-accent-foreground` L92 reste lisible (encre) |
| `--destructive` | `var(--abst)` #A6453E | rouge d'abstention |
| `--border` / `--input` | `var(--line)` | filet du design |
| `--ring` | `var(--focus)` #12857A | anneau focus teal (hikae) |
| `--chart-1..5` | hikae / ukemi / shogen / monark / defer | teintes agents (cosmétique ; aucun consommateur actuel) |
| `--sidebar*` | chaînes vers paper/ink/soft/line/focus | contrat préservé (aucun consommateur actuel) |
| `--radius` | `0.5rem` (inchangé) | non-régression Button/Dialog (`--radius-md` etc.) |

**Tokens de marque ajoutés** (design L14 light / L15 dark), exposés aussi en utilitaires Tailwind via `@theme inline` (`--color-paper/ink/ink2/line/soft/monark(-t)/shogen(-t)/hikae(-t)/ukemi(-t)/ok/defer/abst/focus`) → `bg-soft`, `text-hikae`, `text-monark-t` disponibles pour le shell et les lots suivants. Additif : aucun utilitaire existant ne change.

Conservés verbatim : `@custom-variant dark (&:is(.dark *))`, `@custom-variant data-open`, `@custom-variant data-closed` (référencés par Button/Dialog), tout le mapping `@theme inline` des `--color-*`, le bloc `@layer base`.

## Décisions — polices (next/font)
- `next/font/google` : **Sora** (logotypes/UI, 300–700), **IBM Plex Mono** (données, 400/500), **Newsreader** (serif texte long, 300–500 + italique), auto-hébergées au build, exposées en variables CSS (`--font-sora`, `--font-ibm-plex-mono`, `--font-newsreader`) sur `<html>`.
- Câblage `globals.css` : `--font-sans` et `--font-heading` → Sora ; ajout `--font-mono` → IBM Plex Mono ; `--font-serif` → Newsreader ; `--font-kanji` → Newsreader + repli mincho CJK (« Yu Mincho »/« Noto Serif JP ») pour les glyphes kanji du design. **Aucune dépendance nouvelle** (`next/font` fait partie de `next` 16.3.4 déjà épinglé — R-8 respecté ; `package-lock.json` inchangé).
- **Réserve D15 (C-2)** : `next/font/google` récupère les fontes chez Google **au build** (non épinglées par hash) → build rouge hors-ligne. **RÉSULTAT MESURÉ** : le fetch en ligne a **réussi**, `next build` = exit 0. La réserve n'a **pas** été déclenchée ; bascule `@fontsource` non nécessaire et **non effectuée** (laissée à l'orchestrateur, conformément au contrat).

## Décisions — thème & shell
- **Thème `.dark` (classe)** + `ThemeProvider` client (D15). `localStorage 'monark-theme'` (try/catch), bascule de la classe `.dark` sur `documentElement`, `prefers-reduced-motion` lu via `matchMedia` et **exposé au contexte** pour le sim (lot F-site-3).
- **Script anti-FOUC** minimal en tête de `<body>` (`dangerouslySetInnerHTML`) : applique la classe `.dark` avant le premier paint si `monark-theme==='dark'`. Le glyphe ☼/☾ démarre en clair au SSR (accord SSR/1er rendu client) puis se cale au montage via un effet — **aucun mismatch d'hydratation** (`suppressHydrationWarning` sur `<html>`). Le contenu du script est une **constante d'auteur statique** (aucune interpolation de donnée externe) → pas de surface XSS malgré l'avertissement outillage.
- **Header** (`site-header.tsx`) : sticky (blur, filet), nav 6 liens (Products/Fleet/How it works/Roadmap/Token/Integrators) avec lien **actif via `usePathname()`**, bouton thème (☼/☾), **menu mobile** (toggle d'état, pas d'état de largeur JS), CTA « For integrators » → `/integrators`. Responsive **par classes Tailwind** (`hidden lg:flex`, `lg:hidden`, `sm:inline-flex`).
- **Footer** (`site-footer.tsx`, server) : fidèle L444-452 (voir copy verbatim ci-dessous).
- **Layout** : `<html lang="en">`, enveloppe `flex min-h-screen flex-col` (header + `<div class="flex-1">{children}</div>` + footer) — **pas de `<main>`** dans le layout (les pages portent le leur : aucun `<main>` imbriqué). `metadata` **statique sans chiffre** (title « MONARK », description reprise de l'existant), **pas de `generateMetadata`**.
- **Styles de base** portés du design (L18/L20) dans `@layer base` : `a`/`a:hover`(monark-t)/`button`/`:focus-visible` — règles d'élément nu seulement, les utilitaires Tailwind (couche postérieure) l'emportent, donc les liens existants (`underline hover:text-foreground`) gardent leur rendu (non-régression).
- **Keyframes** : les **quatre** du design (`rise`, `flow`, `lane`, `glow`) + `@media (prefers-reduced-motion:reduce)` portées (pas seulement les trois nommées par la mission — `lane` sera consommée par l'engine board F-site-4, évite un ré-édit de `globals.css`).
- **Route** : `/integrators` (D15, renommage de `#/api` du design).

## Copy du footer — rendue verbatim (vérification honnêteté)
- Bloc marque : « It abstains, so it can act. » / « Every label on this site is Built or Upcoming. »
- Colonne **Company** : « Fleet » (`/fleet`) · « Roadmap » (`/roadmap`) · « Token » (`/token`)
- Colonne **Build** : « Products » (`/products`) · « How it works » (`/how`) · « For integrators » (`/integrators`)
- Colonne **Proof** : « Console » + span texte « UPCOMING » (`/console`) · « Writing » (`/writing`)
- Bas de ligne : « MONARK — a company of agent-products for DeFi and inference. » / « No confidence field, anywhere. »

Honnêteté vérifiée : 0 chiffre en position rendue ; anglais ; 0 mot proscrit (« No confidence field » passe par l'exemption insensible-casse `no confidence field`, span masqué — ce n'est **pas** le porteur R-E minuscule, qui vit en `page.tsx` L103, non touché) ; 0 plateforme tierce ; statuts textuels « Built »/« Upcoming »/« UPCOMING » (jamais `live`, jamais un statut typé hors registre).

## Oracle — exit codes réels (pas de pipe masquant)
| Étape | Résultat |
|---|---|
| `npm ci` | **exit 0** |
| `npm run ci` (gate:vocab + tsc --noEmit + node --test) | **exit 0** — vocab OK (62 fichiers) ; tsc OK ; **100/100 tests** dont test 44 (a) manifest/5 figures, (b) 0 littéral numérique rendu sous apps/site, (b) détecteur + gardes (a)-(d) |
| `npm run lint` (`eslint .`) | **exit 0** |
| `npm run lint:ratchet` | **exit 0** — `92/92` (plafond inchangé ; apps/** n'entrent pas dans le décompte des tests) |
| `cd apps/site && npx next build` | **exit 0** — compile + **TypeScript OK** (seule vérif de type d'apps/site) ; routes prérendues `/`, `/roadmap`, `/_not-found` (re-thémées) |
| `node scripts/lang-gate.mjs --scope site` | **exit 0** — 0 hit français en scope `site` |
| `node scripts/grep-forbidden.mjs` | **exit 0** — 0 revendication proscrite |
| `git diff main -- schemas/ packages/` | **vide (0 octet)** |

**CA visuelle manuelle déclarée** (non couverte par `next build`, à confirmer en `next dev` par la G2) : rendu papier/encre light+dark ; header sticky/blur + nav active + bouton thème ; menu mobile (toggle) ; footer 4 colonnes + bas de ligne ; boîte porteuse R-E de `page.tsx` (accent monark) toujours visible.

## Non-régression (confirmée au build)
- `/` (`page.tsx`) et `/roadmap` **compilent et se prérendent** re-thémées (papier/encre) — mêmes noms de tokens shadcn, `@theme inline` + `@custom-variant` + `@layer base` conservés ; `button.tsx` (`var(--secondary)`/`var(--foreground)`/`var(--radius-md)`) résout par les chaînes `var()`.
- `page.tsx` non modifié (porteur R-E L103 intact) ; `schemas/`/`packages/` intacts ; aucune dépendance ajoutée.

## Mutants
**Aucun** — ce lot ajoute du shell (tokens, layout, header/footer, provider) et **aucun test**. Les gardes qui protègent ces surfaces (honesty-lint/test 44, vocab site + exemption `no confidence field`, lang-gate site, `no_generate_metadata_in_apps_site`, `frozen_contract_fields_stay_dynamic`) portent déjà leurs mutants nommés dans `docs/G1-lot-F2a/F2b/F2c.md` et restent verts ici.

## R-25 (recompte à la clôture)
Changeset vs `main`, **exclusions** `docs/G1-*`, `docs/G2-*`, `package-lock.json` (inchangé) :
- Code de ce lot : **596** lignes (516 ajoutées / 80 supprimées — globals.css, layout.tsx, theme-provider, site-header, site-footer).
- Docs de contrat portées dans la PR (PLAN §7 +60, ADR D15 +13) : **+73**.
- **Total = 669 < 1205** (plafond `VIBEGATES_PR_LIMIT`). PR petite et unitaire (R-25 respecté).

## error_origin
**n/a** — implémentation conforme au contrat D15 ; aucun défaut détecté à cette passe. L'assignation formelle d'`error_origin` reste au G7 (orchestrateur), par le framework AgileGates.

## Choix douteux soumis à la G2
1. **Footer « For integrators »** (colonne Build) — rendu fidèle au design L448 (le critère de fidélité C-1 compare au design) ; la mission listait la forme courte « Integrators » (= le libellé nav). Les deux pointent vers `/integrators`. Divergence de copy assumée et déclarée.
2. **Script anti-FOUC `dangerouslySetInnerHTML`** — constante statique d'auteur, sans interpolation ; motif standard (équivalent next-themes). Alternative sans script = flash de thème clair pour les visiteurs en dark. Justifié ; avertissement outillage XSS levé (pas de surface).
3. **`--accent: var(--monark)`** (au lieu de `--soft`) — pour que la boîte porteuse R-E de `page.tsx` reste visible ; à valider visuellement (dark : accent = #A6453E sur fond sombre).
4. **`--chart-1..5` re-mappés** sur les teintes agents (hikae/ukemi/shogen/monark/defer) — cosmétique, aucun consommateur actuel ; contrat de noms préservé.
5. **Fond translucide du header en `style` inline** (`color-mix(in oklab, var(--paper) 88%, transparent)`) plutôt qu'en classe Tailwind arbitraire — lisibilité ; la contrainte « responsive par classes Tailwind » vise les breakpoints (respectée), pas chaque propriété.
