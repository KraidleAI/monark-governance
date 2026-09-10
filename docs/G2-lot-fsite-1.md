# G2 — Lot F-site-1 (Shell & tokens de marque)

- **Relecteur** : worker `claude-opus-4-8[1m]` (Gate 0 conforme ; instance fraîche ≠ générateur). Ne committe pas (R-20).
- **Base** : `main 75b1e9e` ; worktree `F:\Monark-wt-fsite`, branche `lot-fsite`.

## Verdict : PASS-AVEC-RÉSERVES (0 bloquante)

## Oracle indépendant (relecteur) + R-21 (orchestrateur, après correctif R2)
`npm run ci` **100/100** · `lint` 0 · `ratchet` 92/92 · `next build` 0 (`/`, `/_not-found`, `/roadmap` ○ Static ; next/font fetch au build réussi → réserve D15 non déclenchée) · `lang-gate --scope site` 0 · `vocab` 63 fichiers 0 · `git diff main -- schemas/ packages/` **VIDE**. **R-25 589/7 < 1205** (PLAN+ADR comptent, G1/G2/lock exclus).

## Cibles conformes
1. **Non-régression tokens** : aucun token shadcn supprimé, tous re-valués par `var()` ; R-E box `page.tsx:101` visible (texte 13.9:1, bordure monark 40%) ; `--primary=ink` flippe en dark (CTA paper/ink 16:1) ; `--radius` inchangé ; toutes les paires rendues passent WCAG AA (mesuré). 2. **Honnêteté** : 0 chiffre rendu (test 44), anglais, 0 mot proscrit même en commentaire (grep .css inclus), porteur R-E `no confidence field` intact en `page.tsx:103`, footer « No confidence field » masqué par l'exemption insensible-casse sans être un faux porteur (check R-E sensible à la casse). 3. **next/font** (0 dép runtime). 4. **RSC** (client: theme-provider/site-header ; server: footer/layout ; anti-FOUC = constante statique, 0 XSS). 5. **Responsive par CSS**.

## Réserves (non-bloquantes, correction formée + propriétaire — zéro dette)
- **R1** — `--accent=var(--monark)` = piège de contraste latent (survol des primitives menu shadcn ; solide ink/monark 2.89:1 < AA). **0 consommateur en F-site-1** ; le 1er `shadcn add` d'un menu (F-site-3..8) le déclencherait. **Correction : F-site-4** (propriétaire de `page.tsx`) — rétablir `--accent: var(--soft)` (survol=soft, design L36) + restyler la R-E box en `bg-monark/10 border-monark/40`. **Pendant formé.**
- **R2** — mot français « refonte » (commentaire `globals.css:8`, exporté) → **CORRIGÉ** (« restyle »), oracle re-passé. `error_origin` = générateur (fr en commentaire), attrapé au G2.
- **R3 (observation)** — R-E box tint 10% ~1.1:1 (quasi-invisible), tient par la bordure 40% ; fidèle au design ; à confirmer en CA visuelle.

## CA visuelle (déclarée, pour next dev / G7) : rendu papier/encre light+dark, header sticky/blur + nav active + toggle thème + menu mobile.
## error_origin (G7) : R2 = générateur (corrigé) ; R1 = décision de design (accent monark visible), reportée F-site-4 ; aucun défaut vivant.
