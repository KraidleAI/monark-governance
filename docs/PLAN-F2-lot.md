# PLAN v2 — Lot F-2 (vitrine publique : entrée par segment + panneaux produit, sur Base UI)

- **Statut** : **v2 — checkpoint 1 ACCEPTE-AVEC-CORRECTIONS (C1-C12) + 2 escalades investisseur tranchées ; corrections appliquées ci-dessous, tracées §11.** F-2a démarrable ; F-2b/F-2c débloqués (E-1 tranché). Avant tout code : Addendum D2-ter commis avec ce PLAN (G0).
- **Auteur du PLAN (R-1, C12)** : orchestrateur-planificateur ; **modèle résolu de la session = `claude-opus-4-8`** (siège planificateur/committeur tenu sous **exception investisseur Opus-seat**, datée 2026-09-07, précédent PR #1 ; le roster nomme Fable 5.1 mais la session tourne sous Opus 4.8). Aucun worker n'a écrit ce PLAN.
- **Rattachement** : ADR-M004 D1 (surface publique), D2 + Addendum D2 (Next.js + shadcn) ; **Addendum D2-ter = décision Base UI** (ce lot) ; Lot F-1 clos (PRs #7/#9) ; **décision onboarding investisseur 2026-09-06** (memstack `0d186517…`, ROADMAP §8.2 : entrée par 5 profils → **panneau latéral** par produit, 8 blocs) ; **réserve d'honnêteté** (checkpoint 1 F-public `516e351e…`).
- **Escalades tranchées (investisseur, 2026-09-07)** :
  - **E-1 (onboarding)** : **« 5 segments + panneau »** — entrée par les 5 profils de marché ouvrant un panneau latéral par produit ; l'investisseur **autorise explicitement** la carte segment→produit sur le public (elle **lève** la restriction « pas de carte » de `516e351e…` pour cette structure). **Les chiffres de marché restent interdits** (réserve D1 inchangée). F-2 reste **local** (aucune publication ce jour).
  - **E-2 (WCAG)** : **Base UI + ARIA APG, sans cible contractuelle** (reco advisor + validateur ; ne rouvre pas le choix de base).

## 1. Objet

F-1 a livré la **fondation** (`apps/site` : scaffold Next.js App Router, `cn()`, `load-committed`, `manifest.sha256`, `fixtures/figures-sourced.json`, détecteur test 44, placeholder). F-2 livre le **niveau public** : **entrée par 5 segments → panneau latéral par produit** (8 blocs, divulgation progressive), la vue compagnie/flotte, la roadmap (3 bâtis + 8 à venir), tokenomics « to be announced ». Niveaux **live** et **console** = lots séparés (F-live, F-console).

## 2. Périmètre

**Vocabulaire de statut gelé (C1, D1 « chaque page porte son vrai état »)** : rien ne tourne publiquement (F-live/VPS non livrés). Statuts admis : **`built`** (Shōgen, Hikae, Ukemi) / **`upcoming`** (les 8) — **jamais `live`** sur un agent (réservé au niveau live futur). Mutant G2 : le mot « live » appliqué à un agent ⇒ refus.

**DANS le périmètre** (honnête, sourcé, anglais D0.5) :
- **Base UI** init (`shadcn init -b base`) + système de design propre (charte navy/or, kanji secondaire), composants copiés (own-the-code, R-8 + provenance par composant).
- **Home** : compagnie + définition MONARK v2 (4 couches) + **entrée par 5 segments** (Vault LP · DAO/agent · levier · desk paris · trésorerie taux) + tokenomics « to be announced ».
- **Panneau latéral par produit** (garde le contexte du segment ; **pas** une page), 8 blocs priorisés, **buildables maintenant** en F-2 vs **`upcoming`** :
  1. schéma capteur→gate→acte (built) ; 2. comment bâti (schéma archi + extrait ADR déclassifié, built) ; 3. bibliographie sourcée [lu] depuis `procurements-lectures/` (built si sources committées ; sinon `upcoming` déclaré) ; 4. **limites honnêtes nommées** (C8, built) ; 5. preuve vivante = tests/couverture (F-live → **`upcoming`** en F-2) ; 6. contrat gelé JSON consommé/émis, lu depuis `schemas/` committé (built) ; 7. comment se brancher = appel API/MCP (B-api/B-mcp → **`upcoming`**, description spec seulement) ; 8. traçabilité → console (F-console → **`upcoming`**).
- **Limites honnêtes par agent (C8, nommées, pas « là où pertinent »)** : **Hikae** — L2 est un moniteur, pas de couverture conditionnelle ; **Ukemi** — unicité perdue quand α,β < 1 ; **Shōgen** — ce qu'un prix attesté ne garantit pas (source : `0d186517…` bloc 4).
- **/roadmap** : 3 `built` + **8 teasers `upcoming`** — **gabarit falsifiable (C2)** : nom (nomenclature gelée, Title case) + **une phrase sur ce que l'agent FAIT**, **jamais pour QUI** (pas de segment ⇒ pas de mini-carte dans le teaser), **aucune date**, statut `upcoming`, **zéro terme commercial**. Copy intégrale = **projection du corpus déclassifié, zéro affirmation nouvelle**, soumise au checkpoint 2.
- **Chiffres** : **uniquement** depuis `fixtures/figures-sourced.json` (rendus via `loadCommitted()`, jamais littéraux ; test 44). **Échantillon Shōgen (C7)** : aucune donnée Shōgen n'est committée dans `F:\Monark` aujourd'hui ⇒ soit importer un échantillon depuis `F:\Shogen` **avec provenance** (campagne, hash, date) + ajout à `apps/site/data/manifest.sha256.json` + rendu `loadCommitted()`, soit le bloc « living proof » Shōgen = **`to be announced`**. Décidé en F-2b, journalisé.
- **Durcissement détecteur test 44 (C4)** + **gate vocabulaire sur `apps/site` (C6)** + **test anti-collision de paquet (C11)** — §6.

**HORS périmètre** (déclaré) : données live / SSE / console d'audit (F-live, F-console) ; chiffres de marché du deck ; agents futurs présentés comme livrés ; mise en ligne (F-2 **local** ; fail-closed LICENSE/Q4) ; tokenomics tant que Q3 non tranché.

## 3. Décision de base — Addendum D2-ter (à commettre avec ce PLAN, G0)

**Base UI** (`npx shadcn@4.21.0 init -b base`). Défaut shadcn depuis 2026-07-02 ; GA 1.0.0 (2025-12-11), 1.8.0 (2026-09-04), MIT ; trace correctifs Next 16 + RSC datée. Radix écarté (a11y non sourcée ; bris RSC pile exacte) ; React Aria écarté F-2 (opt-in récent ; 7 deps Apache-2.0 ; issue Turbopack locales). **WCAG (E-2)** : comportement WCAG 2.2 revendiqué par Base UI + ARIA APG, **sans cible contractuelle ni matrice de lecteurs d'écran**. Épingler **exact** : `shadcn` 4.21.0, `@base-ui/react` 1.8.0. Preset de style (8 styles, défaut « nova ») = **item G0 distinct tracé en D2-ter** (C9 défaut silencieux).

## 4. Décomposition en sous-lots (R-25 — chaque PR < 1205, mesuré à la clôture)

| Sous-lot | Contenu | Gate clé |
|---|---|---|
| **F-2a** | `shadcn init -b base` (`--dry-run` journalisé) ; `components.json` ; `@base-ui/react` épinglé ; résolution paquet `cn` (garder `cn()` local **ou** adopter le paquet `cn`, tranché à l'init, journalisé) ; tokens de design ; 1er composant Base UI ; **durcissement détecteur (§6)** ; **gate vocab `site` (C6)** ; **test anti-collision (C11)** | **Oracle RSC honnête (C5, §7)** |
| **F-2b** | Home + entrée 5 segments + framework panneau latéral + panneaux des 3 agents `built` (blocs buildables) ; échantillon Shōgen tranché (C7) | test 44 vert ; lang-gate site 0 ; vocab site 0 |
| **F-2c** | `/roadmap` (3 `built` + 8 teasers `upcoming`) ; teasers des 8 (gabarit C2) | test 44 ; réserve d'honnêteté (teasers, 0 chiffre) |

F-2b/F-2c fusionnables **seulement si** la mesure tient sous 1205 (mesure avant fusion).

## 5. Critères d'acceptation (CA-F)

- **CA-F2a** (falsifiable) : `init -b base` reproductible (`--dry-run` journalisé) ; deps exactes (R-8) ; `next build` **exit 0** ; **oracle RSC (C5)** ; 4 trous détecteur fermés (mutants rouges) ; gate vocab `site` rouge sur mot proscrit ; test anti-collision rouge si `@base-ui-components/react` présent ; `npm run ci`/`lint`/`ratchet`/`lang-gate --scope site` verts.
- **CA-F2b** : Home + 5 segments + panneaux ; chaque bloc rend **uniquement** du contenu committé/sourcé (test 44) ; statuts `built`/`upcoming` exacts (jamais `live`) ; limites honnêtes nommées présentes ; échantillon Shōgen sourcé-committé **ou** `to be announced` ; anglais (lang-gate 0, vocab site 0).
- **CA-F2c** : 8 teasers au gabarit C2 (nom + ce que fait l'agent, sans « pour qui », sans date, `upcoming`, zéro terme commercial, zéro chiffre) ; copy = projection déclassifiée soumise au checkpoint 2.
- **Transverse** : `git diff main -- schemas/ packages/` **vide** ; R-25 par PR < 1205 (`package-lock.json` exclu de la mesure, `ci.yml:49`) ; provenance par sous-lot ; zéro dette nue.

## 6. Gardes de code (détecteur, vocab, collision) — chacune avec son mutant

- **(a) `SCAN_ROOTS` — fermer la CLASSE (C4)** : remplacer la liste blanche `["app","content"]` par « tout `apps/site` **sauf** `SKIP_DIRS` + `test/` + `data/` ». Mutants : `<p>999</p>` dans `apps/site/components/*.tsx` **et** `apps/site/hooks/*.tsx` ⇒ rouges.
- **(b) `metadata.description`** (`layout.tsx:7-8`) : scanner l'export `metadata`. Mutant `description: "42 decisions today"` ⇒ rouge.
- **(c) `mdxProse` efface `{…}`** (`honesty-lint.ts:179`) : ne plus stripper les expressions-chaînes littérales. Mutant `{"999 agents"}` en `.mdx` ⇒ rouge (parité TSX).
- **(d) `VISIBLE_ATTRS`** (`honesty-lint.ts:46`) : ajouter `value`, `content`. Mutants `<option value="5">` / `<meta content="5 agents">` ⇒ rouges.
- **(e) Gate vocabulaire `apps/site` (C6)** : `grep-forbidden.mjs` ne scanne pas `apps/site` ; ajouter un scope `site` portant au moins les 7 mots proscrits du README v2 (`autonomous`, `self-evolving`, `predicts`, `confidence`, `accuracy`, `hedge fund`, `Kraidle`) + mutant rouge. (À défaut, « tenu à la main » déclaré + chaque phrase au checkpoint 2 — **non retenu** : on outille.)
- **(f) Anti-collision de paquet (C11)** : assertion « `@base-ui-components/react` absent de `apps/site/package.json` **et** du `package-lock.json` » ; mutant ⇒ rouge.
- **(g) Exemptions test 44 pré-déclarées (C3)** : la Home rend des comptes vérifiables (« 3 » bâtis, « 8 » roadmap, « 4 » couches, « 4 » contrats gelés) ⇒ pré-déclarer dans `honesty-lint.exempt.json` (valeur, raison, contexte) ; **aucune ne doit égaler une valeur de `figures-sourced.json`** (le test l'interdit).

## 7. Oracle & gates

- **G0** : ce PLAN + **Addendum D2-ter commis AVANT le premier worker F-2a** (C3/CA-3).
- **G1** : journal par sous-lot.
- **G2** : revue 100 %, **réviseur ≠ générateur, instance séparée, contexte frais** (worker Opus 4.8), mutants nommés.
- **Oracle RSC honnête (C5)** : `next build` **ne détecte pas** les erreurs d'hydratation. Oracle F-2a = **`next build` exit 0 + frontière RSC compilée** (un composant Base UI — Dialog/Popover — rendu dans une **page serveur**) ; l'**hydratation runtime** = **CA manuelle `next dev`** (comme F-1), déclarée, **pas** revendiquée comme couverte par `next build`. Toute dép nouvelle vérifiée au registre + journalisée (R-8).
- **G3/G4/G6** : `npm run ci` (87/87 + nouveaux tests), `lint` 0, `ratchet` (plafond inchangé sinon relevé par ADR justifié), `next build` exit 0, `lang-gate --scope site` 0, **gate vocab `site` 0**, contrats gelés diff vide.
- **G7** : verdict orchestrateur (R-21 : oracle ré-exécuté + mutants indépendants). **Checkpoint 2** : acceptation validateur avant clôture. F-2 **local**.

## 8. Topologie (C10)

**Séquentiel mono-agent par sous-lot + oracle déterministe ; aucun fan-out** (le fan-out ne se justifie pas ici — pas d'indépendance de vérification à imposer au-delà du G2). **G2 = instance séparée à contexte frais.** Garde-fou de réduction respecté (tâche vérifiable + oracle).

## 9. MAST — modes d'échec résiduels (C9)

1. **Maquette-vs-réel** : un chiffre/panneau non committé passe pour réel → contre-mesure test 44 + `loadCommitted()` + statut `upcoming` explicite.
2. **Mort de worker (limite d'usage)** : mesurée quotidiennement → sous-lots courts, reprise par worktree, oracle rejouable.
3. **Pression de délai** : coupe = décision investisseur (Q1) ; R-22 (aucun gate suspendu) ; R-25.
4. **Dérive d'outillage `shadcn init`** (mesurée en F-1 : deps caret + CLI en dep runtime, revertées, journal l.186 C5) → contre-mesure : `--dry-run` journalisé + gate R-8 (deps exactes ; CLI **jamais** en dep runtime) + test anti-collision (§6f).
5. **Défaut silencieux du preset** (« nova » par défaut non tracé) → contre-mesure : preset = item G0 tracé en D2-ter.

## 10. Pendants formés (zéro dette nue)

- **Cible WCAG** : tranchée (E-2) = Base UI + ARIA APG, sans cible contractuelle ; réversibilité vers React Aria notée si l'investisseur exige un jour AA + lecteurs nommés.
- **Tokenomics (Q3)** : « to be announced ».
- **Bibliographie/preuve/console** : blocs 3(partiel)/5/8 du panneau = `upcoming` tant que les sources committées / F-live / F-console n'existent pas — déclarés, pas masqués.

## 11. Traçabilité des 12 corrections (checkpoint 1)

- **C1** statut `built`/`upcoming`, jamais `live` : §2 (vocabulaire gelé), §5 CA.
- **C2** gabarit teaser falsifiable (nom + ce que fait, jamais pour qui, sans date, `upcoming`, copy=projection déclassifiée au checkpoint 2) : §2 /roadmap, §5 CA-F2c.
- **C3** exemptions test 44 pré-déclarées, ≠ valeurs figures-sourced : §6(g).
- **C4** `SCAN_ROOTS` ferme la classe + mutants components/**hooks** : §6(a).
- **C5** oracle RSC honnête (`next build` + frontière RSC ; hydratation = CA manuelle) : §7.
- **C6** gate vocab `apps/site` (scope `site`, 7 mots + mutant) : §6(e).
- **C7** échantillon Shōgen nommé/sourcé-committé ou « to be announced » : §2.
- **C8** limites honnêtes nommées par agent (Hikae/Ukemi/Shōgen) : §2.
- **C9** section MAST (3 v2 + dérive outillage + défaut preset) : §9.
- **C10** topologie séquentielle mono-agent, aucun fan-out, G2 séparé : §8.
- **C11** test anti-collision `@base-ui-components/react` absent : §6(f).
- **C12** en-tête R-1 = modèle résolu réel (`claude-opus-4-8`, exception Opus-seat citée) + D2-ter commis avant 1er worker : en-tête + §3/§7.
- **E-1/E-2** escalades tranchées : en-tête (bloc escalades) ; §2 onboarding ; §3 WCAG.
