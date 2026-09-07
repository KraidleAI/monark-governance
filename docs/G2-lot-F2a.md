# G2 — Revue, Lot F-2a (Base UI init + gardes de code)

- **Réviseur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 vérifié), **instance séparée du générateur, contexte frais**. Ne committe pas (R-20) ; mutations restaurées par copie (sha256 avant==après). 2026-09-07.
- **Verdict** : **CLOS-AVEC-RÉSERVES** (R1, R2 ; aucune fonctionnelle) → réserves **levées** par l'orchestrateur avant G7 (voir `docs/G7-lot-F2a.md`). Aucun point REFUSE.

## Vérifié (empirique, rejouable — R-21 côté réviseur)
- **Oracle rejoué à frais** (arbre vierge, `npm ci`) : `npm run ci` **93/93**, `lint` 0, `lint:ratchet` 92/92, `lang-gate --scope site` 0, `gate:vocab` OK (45 fichiers), `next build` exit 0 (`/` static, frontière RSC compilée), `git diff main -- schemas/ packages/` vide, R-25 809. Les 8 chiffres du générateur reproduits ; `next build` n'a muté aucun fichier tracké.
- **Gardes a-f à VRAIES dents**, mutants **du réviseur** (≠ générateur), rouges puis restaurés : (a) `lib/x.tsx` `<p>7</p>`, `app/(gmut)/y.tsx` **route group** `<p>13</p>`, `mdx-components.tsx` **convention top-level** `<span>21</span>` ⇒ rouges ; (b) `metadata.description` réel `42` ⇒ rouge ; (c) `content/mut.mdx` `{"777 agents"}` ⇒ rouge ; (d) branche **JSX-expression** `<option value={"8"}>`/`<meta content={"5 agents"}>` ⇒ rouges ; (e) `content/vmut.mdx` « self-evolving » ⇒ vocab rouge (discriminant `predictor`/`prediction` non listés) ; (f) `@base-ui-components/react` dans `package.json` ⇒ collision rouge. Restauration : `git status` == snapshot, sha256 des 2 fichiers trackés avant==après.
- **Sondes de frontière** (limites déclarées vraies) : `generateMetadata(){…}` ⇒ vert (échappe §6b) ; `{`${5} agents`}` en mdx ⇒ vert (limite backtick déclarée) ; contrôles positifs rouges.
- **Contrats gelés** vides ; **R-8** toutes deps exactes, `shadcn`/`cn` absents du lock+node_modules ; **tokens** `globals.css` couleurs/typo seules, aucun contenu/chiffre-claim.

## Déviations adjugées ACCEPTABLES
- **D1** (`.md` retiré du parcours) : `.md` jamais rendu (3 preuves primaires : `pageExtensions`, loader `@next/mdx` `\.mdx$` seul, 0 import `.md`) ; renversement conscient de F-1 G2 R1, trou fermé structurellement par `pageExtensions`. → RÉSERVE R1 (commentaires périmés).
- **D2** (`*.d.ts` sauté) : déclarations, jamais rendues. **D3** (scope vocab `.ts/.tsx/.mdx`) : évite le faux positif d'auto-référence `COMPONENTS-PROVENANCE.md`. **D4** (`--dry-run` inexistant) : `error_origin` outillage ; équivalent fidèle.

## Pré-empts R-21
- **`Kraidle` dans `vocab-banned.json` exporté** : pas une fuite neuve (`lang-exempt.json` porte déjà « Kraidle », dépôt = `KraidleAI/monark`, mot dans la machinerie de ban, jamais rendu ; test 42 vert).
- **`\bconfidence\b`** : pendant **bien formé** (options concrètes à précédent interne) ; recommandation : promouvoir en PLAN §10.

## Réserves (levées avant G7 ; ne bloquent pas la clôture G2)
- **R1** (`error_origin` générateur) : 2 commentaires périmés affirmant faussement que `.md` est scanné (`honesty-lint.ts` docblock `scanAppsSite` ; `next.config.mjs:11`, texte F-1 rendu faux par D1). Correctif 2 fichiers, trivial.
- **R2** (`error_origin` conditionnel orchestrateur|générateur) : `docs/G1-lot-F2a.md` absent (référencé par commentaires de tests commités `test/site-honesty.test.ts:116,128,150`) ; aucun échec fonctionnel (prose) mais gate G1 exige le journal avant G7 ; **doit tracer « D1 renverse F-1 G2 R1 »**.

## Pendant réviseur-surfacé
- `generateMetadata()` non scanné (§6b vise la variable `metadata`) ; aucune page F-2a ne l'utilise ⇒ §6b-bis en F-2b ou documenter le non-usage.

**Restauration finale** : `git status --porcelain` == snapshot initial ; sha256 `layout.tsx` `c355338e…`, `package.json` `1c654f94…` (avant==après) ; tous mutants neufs supprimés ; aucun commit (R-20).
