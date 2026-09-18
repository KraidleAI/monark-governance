# PLAN — Lot F-site-9a-ii « diagramme vivant » : portage du concept D dans la home (`board.tsx`)

> **G0 AgileGates (plan AVANT code).** Rattachement : `PLAN-Fsite-9-sas.md` (amendé 2026-09-18 : 3D abandonné), BRIEF addenda 6/6 bis,
> concept validé par l'investisseur le 2026-09-18 (« validé, on éditera au rendu ») : `C:\Users\KACIMI\Downloads\MONARK SUITE\site-redesign\concepts\D\index.html`
> (v3). Dépend de **9a-i** (modèle/machine/audit purs, worker en cours) et du **chercheur** (`data/AGENT-ECOSYSTEMS.md` + `assets/chains/`).
> Statut : checkpoint-1 ACCEPTE-AVEC-CORRECTIONS (§8, foldées). **AMENDEMENT 2026-09-18 (investisseur : « ou tout simplement blockchain agnostic WEB2/WEB3 agents »)** :
> la bande du bas ne liste **plus aucune blockchain ni marque** ; elle rend trois nœuds génériques « Web2 agents », « Web3 agents · any chain », « Your own agent »
> sous le titre « Blockchain-agnostic · Web2 / Web3 agents », reliés au gate. Conséquences : `lib/chains.ts`, `public/chains/`, C-3 (chaînes), C-6 (G2 de
> recherche), C-9 et **Q-2 sont sans objet** ; le rapport chercheur reste archivé (`data/AGENT-ECOSYSTEMS.md`) pour un usage ultérieur ; les providers
> (texte seul, 3 classes) et leur cadrage restent (C-2, C-7). Aucun déploiement sans go.

## 0. Décisions investisseur (verbatim, non re-litigées)
- « concentrons-nous sur le diagramme ; outils parfaits pour un diagramme interactif, bien contrasté ; couleurs du site actuel, améliorées ; avec les
  providers, les clients » ; « OK, je suis ta recommandation » (SVG + CSS écrit à la main, zéro dépendance) ; « au lieu de citer les agents […] les
  blockchains ; on supprime les coding agents ; “agent frameworks sur toutes les blockchains” ; icônes HD pour toutes » ; « validé, on éditera au rendu ».
- Invariants : `<aside>` panneau latéral ; 8 profils `PICKER_PROFILES` ; diagramme vivant ; providers à gauche / profils à droite ; clic ⇒ chemin accentué ;
  MONARK = conteneur des 11 pièces ; DefiDrama absent ; aucun chiffre/jauge/probabilité ; commit/defer/abstain en couleurs + mots seulement.

## 1. Point d'intégration (inchangé, checkpoint-1 C-1)
Le diagramme remplace, dans `apps/site/components/gate-sim/board.tsx`, l'intérieur de `data-screen-label="Engine board"` (colonnes `SENSORS`/backbone/
gate+Genkan/`ACTS`, `Lane`). Conservés : hero, picker, `{CAVEAT}` (gate `gate_sim_caveat_present_in_all_mounts`), `<aside>`, `GateMeter`/`budgetText`
sous le diagramme. `diagram.tsx`/`/how` intouchés. **Zéro dépendance nouvelle** (R-8 sans objet).

## 2. Livrable
- `apps/site/components/sas/living-diagram.tsx` (client, SVG React) : 3 colonnes + bande chaînes, géométrie calculée depuis les registres, aucun littéral
  de champ gelé (`frozen_contract_fields_stay_dynamic`), troisième action par index (`ACTION_ABSTAIN`), libellés depuis `required[]` ; flux animé CSS
  (`stroke-dashoffset`), pulsation de décision (couleurs `--ok/--defer/--abst`), `prefers-reduced-motion` ⇒ statique ; clavier (`tabindex`, Enter/Espace),
  `aria-label` sans chiffre ; thème dark/light par tokens existants (`globals.css`, aucune couleur nouvelle hors contraste mesuré).
- Données : `lib/fleet.ts` (11 pièces, statut), `lib/profiles.ts` (8 profils, `engineKeys`), **9a-i** (`sas-model.ts` chambres/pièces/spine/raisons,
  `sas-machine.ts` S0-S4, `sas-audit.ts` panneau), nouveaux registres **`lib/providers.ts`** (3 classes, cadrage « illustrative, provider-agnostic, no
  endorsement ») et **`lib/chains.ts`** (chaînes retenues par le chercheur avec preuve [lu] ; champ `icon` = chemin `public/chains/<k>.svg`, `license`,
  `source`) ; aucune chaîne sans preuve ni sans icône officielle (sinon retirée ou procurement formé).
- Icônes : `public/chains/*.svg|png` et `public/providers/*` = fichiers **officiels** téléchargés par le chercheur, licences consignées dans
  `apps/site/COMPONENTS-PROVENANCE.md` (section « Third-party marks ») ; jamais redessinées ; `vocab-banned` scope site : les noms de chaînes/providers
  sont admis **uniquement** dans ces registres + le diagramme, avec la phrase de cadrage rendue à côté (test).
- Panneau latéral : réutilise l'`<aside>` existant ; contenu = registre (nom, statut, ligne) + cadrage ; jamais de digest à l'allure réelle.

## 3. Tests (racine, modules purs, `node --test`)
`diagram_home_invariants` (board contient `<aside`, mappe `PICKER_PROFILES`, rend `{CAVEAT}`, monte `LivingDiagram`, n'importe pas `./diagram`) ;
`diagram_data_from_registers` (pièces = `FLEET_AGENTS`, profils = `PICKER_PROFILES`, chaînes = `CHAINS`, providers = `PROVIDERS` — aucune chaîne/provider
en dur dans le composant) ; `diagram_no_number_no_probability` (honesty-lint + grep `%|probab|confidence|accuracy` sur `components/sas/**`) ;
`diagram_framing_sentence_rendered` (cadrage providers + chaînes présent dans le rendu texte) ; `chains_have_official_icon_and_license` (chaque
entrée de `lib/chains.ts` a un fichier existant + licence non vide + source) ; `diagram_reduced_motion_static` (classe/attribut sans animation) ;
`sas_*` de 9a-i verts. Un mutant nommé par test. Revue **G2 image** : captures S0 + clic profil + clic pièce + clic chaîne, dark et light, mobile/desktop.

## 4. Gates et oracle
`npm run ci` ; `gate:vocab` ; `honesty-lint` ; `lang:gate` ; `lint` ; `lint:ratchet` 69 ; `export:check` ; tests site ; `next build` ; Lighthouse mobile
home **≥ 90 perf** (DevTools, JSON au G1 ; < 90 ⇒ ESCALADE-INVESTISSEUR) ; contraste texte AA mesuré (4,5:1) sur les tokens utilisés ; R-25 < 1205 mesuré
(scinder registres+icônes / composant si nécessaire). G2 fraîche ≠ générateur ; checkpoint-2 rejoue ; G7 ; commit local ; PR sous fenêtre publique ;
déploiement vitrine = go investisseur.

## 5. MAST et risques
FM-1.1 (aside/picker/`/how` touchés) ⇒ `diagram_home_invariants` ; FM-2.6 (registres recopiés) ⇒ `diagram_data_from_registers` ; FM-3.3 (« tests verts » sans
capture) ⇒ G2 image obligatoire ; overclaim (marque affichée = partenariat) ⇒ phrase de cadrage testée + licences ; performance (SVG 40 nœuds + CSS) ⇒
Lighthouse ; icônes manquantes ⇒ chaîne retirée, jamais un anneau vide en production.

## 6. Séquence
checkpoint-1 → (9a-i clos + chercheur rendu) → worker `claude-opus-4-8` max → G2 → checkpoint-2 → G7 → commit local → 9b DA (palette/typo/mouvement seuls)
→ 9c (icônes providers) → PR(s) → go déploiement.

## 7. Critères d'acceptation
AC-1 concept D reproduit (3 colonnes + bande chaînes, clic ⇒ chemin + panneau) ; AC-2 tests §3 verts + mutants ; AC-3 invariants ; AC-4 0 chiffre/jauge/
probabilité ; AC-5 registres = source unique, chaînes avec preuve + icône officielle + licence ; AC-6 cadrage rendu ; AC-7 gates §4 verts, Lighthouse ≥ 90,
AA ; AC-8 DefiDrama absent, MONARK = conteneur ; AC-9 R-25 par PR ; AC-10 G2 image dark/light/mobile.

## 8. Checkpoint-1 (2026-09-18) : ACCEPTE-AVEC-CORRECTIONS C-1..C-11 — foldées
- **C-1 (bloquante)** : ADR-M004 **D18 bis** (dans l'addendum 9a-i, avant son commit) : (b) `three` retiré ; (c) étendu aux **blockchains** avec la phrase
  de cadrage exacte ; providers = **noms en 9a-ii, icônes en 9c** ; (d) « diagramme vivant SVG (concept D v3) ». Transmis au worker 9a-i. §2/§6 : 9a-ii rend
  les providers en **texte seul** ; `public/providers/*` sort de 9a-ii.
- **C-2** : phrases de cadrage (texte pinné, **rectifiées après le rapport du chercheur** : le mot « partner » est interdit même nié par `DIAGRAM-SPEC.md` §4 ;
  « on every chain » est un absolu invérifiable) : chaînes « Agent frameworks run on these chains — and any agent a client builds — call the gate directly.
  Examples, no endorsement. » ; providers « Illustrative, provider-agnostic routing. No endorsement. » ; panneau « never a probability of being right ». Elles vivent dans **`lib/diagram-copy.ts`** (couvert par honesty-lint + vocab site), pas dans `components/sas/**` ; le test
  `diagram_no_number_no_probability` scanne `components/sas/**` avec motif **négation-aware** `(?<!\bnever a )probab` (précédent harness). Règle unique
  sur « partner » : le mot **n'apparaît jamais** (DIAGRAM-SPEC §4 fait foi ; test grep `partner` sur `apps/site` = 0).
- **C-3** : `lib/chains.ts`/`lib/providers.ts` — champs **rendus** = `name` + cadrage ; `license`/`source` **jamais rendus** ; scan numeric-hole miroir de
  `fleet_register_built_set_is_frozen` (1) sur `CHAINS[].name` et `PROVIDERS[].name`.
- **C-4** : sélection **profil** ⇒ aside **actuel conservé verbatim** (`productName`, badge, `finger.fn`, `<dl>` sensor/gate/act, `connects`, lien `/products`)
  + puces du chemin ; sélection **pièce/chaîne/provider** ⇒ registre (nom, statut, ligne) + cadrage. Clic pièce/chaîne/provider **n'altère pas** `sel`/`pinned`
  ni l'auto-avance 6,5 s (état de surbrillance séparé, réinitialisé au prochain tick) ; `diagram_home_invariants` asserte `<dl>` + lien Products rendus.
- **C-5** : consommation de 9a-i — `sas-model.ts` : pièces/chambres/spine/profils/raisons (source des 4 étapes et du chemin) ; `sas-machine.ts` : **S0 et S4
  seulement** montés en 9a-ii (S1-S3 = pulsation de décision différée, **item formé** « animation d'états » déclenché au rendu, jamais du code mort silencieux :
  l'export du réducteur reste testé en racine ; **écarts réducteur/storyboard §8 à fermer par cet item** (checkpoint-2 9a-i C-4) : (a) « le niveau remonte quand
  des labels arrivent ; la vanne rouvre » — seule `calm` rouvre aujourd'hui ; (b) `clockClose` sans brume rend S2 depuis tout état ; (c) l'état allumé
  (`litPieceKeys`/`litSpine`/`downstream.dimmed`) n'est pas remis à zéro sur `refuse`/`defer`/`clockClose`/`budgetLow` ; (d) `budgetLow` depuis S2 ne
  re-dépose pas la brume) ; `sas-audit.ts` : déclencheur = clic sur une pièce de l'étape gate (payload → aside).
- **C-6** : artefact chercheur **rendu le 2026-09-18** (`data/AGENT-ECOSYSTEMS.md` 532 l. : 11 chaînes avec preuve [lu] — Ethereum (ERC-8004 Draft), Base, BNB Chain,
  Solana, Arbitrum, Optimism, Polygon, Sui, Aptos, NEAR, TON ; **Avalanche exclue** ; 6 logos officiels `assets/chains/{ethereum,base,solana,sui,ton,optimism}.svg` ;
  **5 procurements formés** BNB/Arbitrum/Polygon/Aptos/NEAR ⇒ ces 5 chaînes ne sont **pas rendues** tant que le logo officiel manque) passe une **G2 de recherche** (instance fraîche) avant dispatch du worker ;
  chaîne avec preuve seulement [abs]/[2nd] ou licence non verbatim ⇒ **non rendue** + procurement formé.
- **C-7** : providers pinnés = les 7 de D v3 (UsePod, Venice, Surplus Intelligence ; OpenRouter ; OpenAI, Anthropic, xAI) ; Google/Mistral = item « édition au
  rendu » (investisseur), pas décidé par le worker.
- **C-8** : nœuds « Hikae · calib. » / « Hikae · gate » : source = la `line` du registre `fleet.ts` pour les deux + suffixe d'étape rendu (aucune prose nouvelle) ;
  `diagram_reduced_motion_static` = oracle « sous `reducedMotion` le composant n'émet aucune classe `flow`/`pulse` » (+ règle `globals.css` l.259 présente).
- **C-9 (Q-2 investisseur, défaut fail-closed)** : `apps/site/public/{chains,providers}` **exclus du miroir public** (`STRUCTURAL_BLACKLIST` + test, précédent
  « hollow in public ») tant que l'investisseur n'a pas tranché « inclure avec NOTICE » ; NOTICE des marques/titulaires tenue à jour ; kit interdisant l'affichage
  vitrine ⇒ chaîne retirée.
- **C-10** : `living-diagram-layout.ts` **pur** (géométrie depuis les registres) + test racine `diagram_layout_from_registers` (nœuds = pièces + 1 (Hikae ×2) +
  profils + chaînes + providers ; arêtes comptées ; mutant « chaîne en dur » ⇒ rouge).
- **C-11** : fan-out justifié (chercheur = isolation lecture seule ; G2 ≠ générateur = indépendance) ; MAST **FM-1.2** (worker télécharge/redessine une icône ⇒
  interdit, consomme les fichiers du chercheur ; `onerror ⇒ remove` du prototype **retiré** en production : icône absente ⇒ chaîne non rendue) ; risque
  [abs]→[lu] du sourcing ⇒ G2 de recherche C-6.
- **Checkpoint-2** : icônes HTTP 200 sur le VPS ; octets de `public/` au G1 ; Lighthouse JSON ; captures dark/light/mobile par état de sélection.
