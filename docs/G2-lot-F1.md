# G2 — Revue, Lot F-1 (fondation vitrine MONARK)

- **Réviseur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 vérifié), **instance séparée du générateur, contexte frais**. Ne committe pas (R-20) ; mutations restaurées par copie. 2026-09-07.
- **Verdict initial** : **CLOS-AVEC-RÉSERVES** → 4 dispositions appliquées (fix-pass, worker Opus séparé) → **levées**. Verdict final consommé par l'orchestrateur : conforme.

## Vérifié (empirique, rejouable)
- **Test 44 a des DENTS réelles** : détecteur **AST** (TS compiler API, pas regex). Mutants du réviseur (différents du générateur) : `{42}` (enfant JSX), `alt="Fleet of 7 agents"` (attribut visible) ⇒ rouges ; faux-positif `grid-cols-3 gap-4 w-24` + `key={3}`/`key={4}` ⇒ vert ; dérive donnée sans manifest ⇒ garde (a) `sha256 mismatch` ; chaîne FR ⇒ lang-gate site rouge ; var inutilisée ⇒ `npm run lint` rouge (prouve que `apps/**` a des dents lint) ; M7 `.next` ⇒ test 42 rouge.
- **R-8** : deps `apps/site` toutes exactes ; `shadcn` pas dep runtime ; `COMPONENTS-PROVENANCE.md` présent.
- **Contrats gelés** : `git diff main -- schemas/ packages/` vide ; chaîne `package-lock` (eslint 10.10.0, typescript 6.0.3, typescript-eslint 8.69.0) inchangée.
- **eslint `apps/**`** : `disableTypeChecked`, cliquet **92/92 +0**, lint global 0.
- **next build** exit 0 (type-vérifie `page.tsx`/`layout.tsx`, ce que `npm run ci` ne fait pas). Oracle complet vert.
- **Fondation respectée** : `page.tsx` = placeholder (zéro chiffre, zéro affirmation neuve) ; 5 figures Qin **[lu]** qualifiées ; pendant shadcn bien formé.

## Réserves (dispositionnées ; `error_origin` = générateur, caught G2)
- **R1** — `.md` routable (`pageExtensions`) mais non scanné (`kindForExt`→null). **Levée** : `"md"` retiré + `.md` traité comme mdx. Mutant `.md` « 999 » ⇒ rouge.
- **R2** — expressions-enfant JSX non-littérales (`{cond ? … : "999"}`, `{live && "42 …"}`, `{"… " + 7}`) échappaient (sous-implémentation vs spec « chaîne visible »). **Levée** : descente dans `Conditional`/`Binary`(`RENDER_BINARY_OPS`)/`Template` ; 3 formes rouges, injection dynamique verte. Interprétation surfacée (comparaison/bitwise exclus ; `{index+1}`→exempt list) = choix documenté, réversible.
- **O1** — `honesty-lint.*` exportés mais runner non exporté ⇒ garde dormante dans le dépôt public. **Levée** : `apps/site/test/**` exclu de l'export + assertion test 42.
- **O2** — `next-env.d.ts` (généré, gitignoré) fuit dans l'export (`walkFiles` saute des noms de dossier, pas des fichiers). **Levée** : filtre des fichiers gitignorés d'`apps/site` via parse du `.gitignore` copié + assertion test 42.

## Transparence réviseur
Une 1ʳᵉ tentative de mutant O1 fut un **non-run** (chaîne `&&` coupée par un `diff`, `cp` non exécuté) — détecté et relancé, pas un faux-pass. Tous mutants finaux restaurés par copie (sha256 identiques).

## Orchestrateur (R-21)
Oracle ré-exécuté indépendamment (87/87, lint 0, ratchet 92/92, lang-gate site 0, next build 0, frozen vide) + mutant R2 indépendant (`{"Team of " + 7}` ⇒ token `7` rouge ; restauré 3/3 vert). Verdict G7 : CLOS (`docs/G7-lot-F1.md`).
