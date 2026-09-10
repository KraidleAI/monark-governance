# PLAN — Campagne F-site (implémentation du design MONARK.dc.html sur la fondation gouvernée)

- **Auteur (R-1)** : orchestrateur, modèle résolu **`claude-opus-4-8`** (siège committeur sous **exception investisseur Opus-seat**, 2026-09-07, précédent PR #1).
- **Objet** : porter le design Claude Design `MONARK.dc.html` (813 l.) en app Next.js **fidèle au rendu** sur `F:\Monark\apps\site`, **passant tous les gates d'honnêteté**. Base `main = 75b1e9e` (F-2c mergé). Worktree `F:\Monark-wt-fsite`, branche `lot-fsite`.
- **Carte détaillée (le contrat technique)** : `scratchpad/design-impl-inventory.md` (worker Opus, [lu] intégral du design + fondation + gates ; numéros de ligne sourcés). Ce PLAN en est la synthèse décisionnelle ; les workers d'implémentation lisent l'inventaire.
- **Décision investisseur (2026-09-09)** : « implémenter tel quel, puis je dirai quoi supprimer/enrichir ». Mods « au fur et à mesure » consignées dans `F:\Clawpumptech\DESIGN-MODS-MONARK.md` (Mod #1 = panneaux « What's inside »/« What it will use »), à folder dans les lots concernés.

## 1. Principe : fidèle au rendu, honnête sous le capot
Le rendu visuel = identique au mockup. Là où « tel quel » ferait rougir un gate, on passe par le **mécanisme honnête que le design lui-même revendique** (« values render from figures-sourced.json, never a literal »). **Le sim interactif est vert par construction** (état calculé, pas de littéral rendu). Réconciliations (inventaire §4) :
- **`abstain` = champ de contrat gelé** → enums `action`/`reason` chargés du schéma au build (`lib/gate-enums.ts`), jamais cités en littéral. `commit`/`defer`/13 raisons = OK.
- **Champs de contrat** (`fields:[...]`) → lus dynamiquement (`load-contract`, patron hikae-panel).
- **Ordinaux rendus** (`01–04`, `1.0.0`) → exemptions **fermées non-figures** (`honesty-lint.exempt.json`, avec porteur rendu R-E). `Phase 0/1/2` & `L1/L2/L3` → **reformulés sans chiffre** (reco) ou `ALLOWED_ID` (à trancher §4).
- **`confidence`** (6 occ.) → « no confidence field » (span exempt) / reformulation / rendu depuis `forbidden-keys.json`. **`score` n'est pas banni.**
- **Plateformes tierces** : le design est **déjà générique** (0 marque) → garder générique.
- **`live`** : absent (statuts built/upcoming seulement). **Français** : 1 seul (« at par » → « at face value »).
- **Comptes** en lettres (« one built · two upcoming », « one of thirteen »).

## 2. Register (résolu sur la décision investisseur 2026-09-09, memstack uid 28b02686)
- **Mapping produits : le DESIGN est erroné, `fleet.ts` fait foi** (Softlanding→Leverage, Firebreak→Vault LP) → corriger l'inversion du design au port.
- **Deux étages** : les 3 « Core » du design = famille **VISAGE** (Attestation/Hallmark/Threshold), rendus **hors `PRODUCTS`** (préserve `PRODUCTS.length===5` + « 13 upcoming »). Les 5 doigts = `PRODUCTS` de `fleet.ts`.
- **Copie** : rendre les lignes **sourcées** de `fleet.ts` (Fleet/Roadmap) ; la copie board du design (kanji, accents, teasers) = présentation seule (`lib/agents-presentation.ts`, hors registre gelé).
- Les 3 panneaux d'agents bâtis existants (`{shogen,hikae,ukemi}-panel.tsx`) = **réutilisés tels quels** (copie sourcée/gelée), pas re-portés du design.

## 3. Lots (< 1205 R-25, DAG inventaire §5)
1. **F-site-1 — Shell & tokens** : `globals.css` navy/gold → **papier/encre/Sora** (gel de marque 2026-09-07) + `layout.tsx` (next/font) + `theme-provider` + `site-header` (nav/thème/menu) + `site-footer`. *(fondateur)*
2. **F-site-2 — 8 marques SVG** (mokugeki…genkan). *(indépendant)*
3. **F-site-3 — Sim** : `lib/sim.ts` + `lib/gate-enums.ts` + `components/gate-sim/*` (hook, diagram SVG animé, meter, sliders, JSON view). *(dépend 1)*
4. **F-site-4 — Home** (hero + engine board + thesis + token teaser + profile picker). *(1/2/3)*
5. **F-site-5 — How it works** (explainer + pipeline + region + reasons(enum) + one-plug + limits). *(1/3)*
6. **F-site-6 — Products & Fleet** (+ VISAGE distinct ; panneaux profils/produits ; **Mod #1**). *(1/2, fleet)*
7. **F-site-7 — Roadmap & Token** (phase-cards + mini-sim B_t). *(1/3)*
8. **F-site-8 — Console, Writing, API** (3 pages server). *(1)*
Ordre : F-site-1 & 2 (fondateurs) → 3 → 4/5/7/8 (parallélisables) → 6. Chaque lot = son propre G2 → oracle R-21 → G7 → checkpoint-2 → PR + CI + merge.

## 4. Deltas / décisions à acter au checkpoint-1 (recommandations)
- **ADR — Addendum ADR-M004** : 7 nouvelles routes ; refonte `globals.css` papier/encre/Sora (**aligne le gel de marque existant**, pas un choix neuf) ; **sim déclaré illustratif** (COST/α/budget/AMBIENT = paramètres de simulation, pas des figures) ; thème **`.dark`** (reco, moindre churn) ; polices **`next/font/google`** (reco, pas de dép CDN runtime, R-8).
- **`honesty-lint.exempt.json`** : `01–04`, `1.0.0` (non-figures, porteur rendu prouvé).
- **`lib/gate-enums.ts`** : loader build-time des enums du schéma.
- **Résiduels cosmétiques** : `Phase`/`L` reformulés sans chiffre (reco) ; route **`/integrators`** (reco, évite la confusion `app/api`) ; picker 8 profils = dispositif UI mappant vers 5 doigts + 3 visage (`05/06` = to be announced) — **aucune modif du registre gelé**.
- **`figures-sourced.json`** : **aucune entrée requise** (0 chiffre de marché rendu).
- **LICENSE Apache-2.0** ajoutée au dépôt (débloque l'export ; décision investisseur 2026-09-10) — hors campagne, PR séparée.

## 5. Honnêteté / zéro dette
Chaque tension est **résolue et documentée** (reformulation, loader schéma, exemption fermée non-figure, rendu-depuis-données, ou correction d'erreur du design sur fait lu). Rendu fidèle, passe les gates. Aucune dette nue. La copy « vend le projet » (mods investisseur) sans régresser l'honnêteté (jamais `live`, 0 chiffre inventé, 0 p_correct, 0 plateforme).

## 6. Séquence
Checkpoint-1 (validateur) → F-site-1 → (F-site-2 ∥) → F-site-3 → F-site-4/5/7/8 (∥) → F-site-6 → chaque lot par la chaîne AgileGates → merges → export → déploiement (Hostinger VPS + Caddy, actions investisseur).

## 7. Amendements checkpoint-1 (validateur `claude-fable-5-1`, 2026-09-10) — ACCEPTE-AVEC-CORRECTIONS C-1..C-9 + E-1
Chaque lot **applique** ces corrections ; F-site-1 démarrable une fois l'**addendum ADR-M004 D15 commis** (fait, à porter dans la PR F-site-1).
- **C-1 (CA falsifiables)** : chaque lot déclare son **oracle exact** (`npm run ci` incl. test 44 / registre / vocab / lang `--scope site`, `npm run lint`/`lint:ratchet`, `next build`, `git diff main -- schemas/ packages/` vide, R-25) et son **critère de fidélité** (sections `data-screen-label` couvertes + breakpoints, comparé au design par le relecteur G2 en instance séparée).
- **C-2** : **Addendum ADR-M004 D15** écrit et commis avec F-site-1 (7 routes, globals papier/encre/Sora citant le gel 2026-09-07, sim illustratif, thème `.dark`, polices `next/font` **avec la réserve réseau-au-build écrite**, `gate-enums.ts`, exemptions `01-04`/`1.0.0`, registre VISAGE).
- **C-3 (topologie & MAST)** : un worker Opus 4.8 par lot ; relecteur G2 = **instance séparée, contexte frais** ; G1/G2/G7 par lot + `error_origin` au G7 ; fan-out 4/5/7/8 justifié par **isolation de fichiers** ; **contention déclarée** sur `honesty-lint.exempt.json` (chaque exemption dans la PR de son porteur rendu) ; **MAST nommés** : maquette-comme-réel (sim), générateur=vérificateur (séparation par instance seulement — Opus-seat), dérive de copie (teasers board vs `fleet.ts`).
- **C-4** : prose rendue = **texte JSX** ; tout nouveau module de données rendues (`agents-presentation`, `sim`, pipeline, steps, profils, VISAGE) **couvert par le scan numeric-hole** du test registre (étendu/frère) ; teasers board **dérivés de `fleet.ts` ou sourcés en G1** (pas de superlatif neuf, ex. « best venue »).
- **C-5** : caveat « illustrative simulation… not market activity » rendu aux **trois** montages (Home board, How explainer, Token) ; `alpha` du JSON view qualifié d'illustratif.
- **C-6** : garde d'**inertie des exemptions** test-44 (entrée sans porteur rendu ⇒ rouge) + mutant, ajoutée avec la 1ʳᵉ entrée ; **porteur R-E minuscule** intra-ligne « no confidence field » **préservé à chaque merge** (le test L264 est sensible à la casse ; « No confidence field » du footer n'en est pas un — le porteur vit dans `page.tsx` L103 puis la thèse F-site-4).
- **C-7 (Register/VISAGE)** : VISAGE = **tableau de registre + test** (3 upcoming, total 16, mutant) ; **jamais** de statut hors registre ; copie & moteur des 3 VISAGE **tirés de la décision uid 28b02686** (Attestation=The File ; Hallmark=The Seal ; Threshold=The Trigger + acheteurs), **pas** des blurbs `CORE` du design (qui en inversent le sens).
- **C-8 (Mod #1)** : réconcilie §2 — les **3 panneaux bâtis SONT modifiés** (bloc « Sourced bibliography » → « What's inside »), en **F-site-6** ; chaque point *Built* renvoie à une **ligne ADR** au G1 (Hikae : M002 D3 split-conformal ; Ukemi : M002 l.188-189 Eisenberg-Noe/fictitious default + M003 K α,β ; Shōgen : ancrage M001 **ou retrait du point**). Contenu Built validé investisseur (points déjà validés 2026-09-09).
- **C-9** : test racine épinglant `gate-decision.schema.json` `action = [commit, defer, abstain]` (ordre) ; type d'action dérivé du tableau chargé ; `schema_version`/`reason` du bloc profil chargés dynamiquement.
- **E-1 — ESCALADE INVESTISSEUR (gate F-site-6 + picker de F-site-4 uniquement)** : le picker « pick a profile » — garde-t-on les 8 profils du design (dont le mapping profil→produit **contredit** la décision 2026-09-09 : Threshold promis à « Agent runtime operator », Warden à un profil Kessai…), ou **réduit-on aux 5 segments D14** (`fleet.ts`) + les 3 VISAGE en section distincte **sans** mapping de profil (00/05/06 non rendus) ? **Reco validateur : la 2ᵉ option** (aucun contenu de valeur inventé par un agent). **À trancher par l'investisseur** avant F-site-6.
