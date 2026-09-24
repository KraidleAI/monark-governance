# PLAN — Lot F-site-9 « diagramme vivant » (ex-« le sas ») + mise à niveau DA « Console » (B)

> **AMENDEMENT 2026-09-18 (investisseur, BRIEF addendum 6)** : l'illustration 3D est **abandonnée** ; le lot livre le **diagramme vivant SVG + CSS**
> du concept D (`site-redesign/concepts/D/index.html`) : providers (3 classes) → moteur MONARK (4 étapes, 11 pièces) → 8 profils, **bande agents**
> reliée au gate, clic ⇒ chemin + panneau latéral. Tout ce qui suit concernant `three`, `@types/three`, GLB, `GLTFLoader`, 3D Jutsu, `sas_glb_nodes_match_model`,
> `sas_no_text_no_number` (denylist three) et Lighthouse-three est **caduc** ; 9a-i (modèle/machine/audit purs) reste valide et alimente le diagramme ;
> 9a-ii = portage de D dans `board.tsx` (React SVG, données `fleet.ts`/`profiles.ts` + registre `lib/agents-ecosystems.ts` sourcé par le chercheur) ;
> Q-1 est résolue par D (pièces cliquables ⇒ panneau). Un plan 9a-ii réécrit sera soumis au checkpoint-1 avant code.

> **G0 AgileGates (plan AVANT code).** Rattachement : campagne F-site (`PLAN-Fsite-lot.md`, lots 1-8 livrés) ; modèle validé par
> l'investisseur le 2026-09-18 : `F:\MONARK SUITE\site-redesign\MODELE-ILLUSTRATION.md` (§1-§8 ; §3 rectifié C-2, §7 C-7).
> **Checkpoint-1 validateur (2026-09-18) : ACCEPTE-AVEC-CORRECTIONS C-1..C-14 — toutes foldées ci-dessous ; question Q-1 routée à
> l'investisseur (bloque 9a-ii, pas 9a-i).** Aucun déploiement sans go.

## 0. Décisions investisseur (verbatim, non re-litigées)
- « notre site actuel est bon, mais il lui faut une mise à niveau » ⇒ **base = `apps/site` tel quel** ; DA B = palette/typo/mouvement, pas de refonte.
- **Invariants intouchables** : panneau latéral (`<aside>`) ; profils clients (`lib/profiles.ts`, 8) ; diagramme **vivant** ; providers d'un côté, profils de
  l'autre ; clic profil ⇒ chemin accentué ; **MONARK = le moteur (le sas entier), jamais une pièce** ; DefiDrama **hors périmètre** (jamais mentionné).
- Illustration : fluide → sas **diagonal** à **4 chambres** (attest, calibrate, gate, agir) ; sédiment (abstain) **et** filet clair (commit) visibles, deux
  couleurs ; **brume** (defer) sortant par une bouche distincte ; clic d'audit ⇒ **panneau latéral** ; aucun texte/chiffre sur l'illustration.
- **Higgsfield = outil de design** (investisseur 2026-09-18, carte blanche ; BRIEF addendum 5) : lookdev, GLB du sas (3D Jutsu), icônes/mockups ;
  hébergement inchangé (`apps/site`, VPS). Dépenses de crédits consignées au BRIEF.
- Providers en **3 classes** (décentralisés/open-weight ; agrégateurs ; majors), cadrage « illustrative, provider-agnostic, no endorsement », icônes
  locales (procurement formé P-1..P-3 dans `PROCUREMENT-icons.md`, jamais inventées).
- **Q-1 (ouverte, investisseur)** : après remplacement des cartes par le sas, la home ne nomme plus aucune pièce ni statut. Les 11 filtres sont-ils
  cliquables/survolables pour nommer la pièce (nom + statut registre + ligne) dans le panneau latéral ? Sinon ces informations ne vivent que sur
  `/fleet`. Joint : P-4 (DeepSeek en classe open-weight ?). **9a-ii n'est pas dispatché avant la réponse.**

## 1. Point d'intégration (C-1) et faits mesurés
- La home = `GateSim mode="board"` → `components/gate-sim/board.tsx` : hero + picker `PICKER_PROFILES` + colonnes de cartes `SENSORS` / backbone /
  gate+Genkan / `ACTS` (`Lane`) + `{CAVEAT}` + `<aside>` (l.388). `diagram.tsx` n'est monté que dans le mode `explainer` (`/how`).
- **Le sas remplace, dans `board.tsx`, l'intérieur de `data-screen-label="Engine board"`** (les colonnes et `Lane`). **Conservés** : hero, picker, `{CAVEAT}`
  (gate `gate_sim_caveat_present_in_all_mounts`), `<aside>`. **`diagram.tsx` et `/how` intouchés.**
- `GateMeter` (12 segments) et `budgetText` (C-8) : **sortis de la scène**, rendus **sous le sas** dans le DOM existant (même composant, même caveat) —
  la scène ne porte aucune jauge ; le niveau d'eau de la chambre Gate est la seule lecture visuelle de B_t.
- Enum `reason` gelé (13 littéraux, `lib/gate-enums.ts`) : mapping chambre → codes (C-2) : Attest `non_evaluable, attestation_absent,
  attestation_refused, binding_broken` ; Calibrate `under_calib, no_label_schema` ; Gate `intent_not_in_region, budget_exhausted, set_too_large,
  interval_too_wide` ; Agir `clock_expired, upstream_timeout` ; `covered` = commit. **Chaque code ≠ `covered` a exactement une chambre.**
- **Piège `frozen_contract_fields_stay_dynamic`** (C-3) : tout littéral quoté d'un champ gelé (`abstain`, `region`, `reason`, `residual`, `calib_digest`,
  `produced_at`, `alpha`, `qhat`, `n_calib`, `method`, `task_class`, `schema_version`, `allow`, `tool`, `intent`, `verdict`, `remaining_budget`) dans
  `apps/site/**/*.ts(x)` rougit. Donc : troisième action **par index** (`ACTION_ABSTAIN`, précédent `lib/sim.ts`) ; libellés du panneau d'audit rendus depuis
  `required[]` chargé (précédent `load-contract`/`hikae-panel`) ; **zéro nom de champ gelé quoté dans `components/sas/**`** ; valeurs du payload = sim
  illustrative sous caveat, jamais un digest à l'allure réelle sans qualification.
- **Spine** (C-7) : définition unique dans `sas-model.ts` = la diagonale des 4 chambres sans pièce ; les 3 profils VISAGE (`engineKeys: []`) l'allument seule.

## 2. Découpage (C-10 ; R-25 < 1205 mesuré par PR ; 9c jamais fusionné)
- **F-site-9a-i — modèle, machine, audit (purs, zéro `three`)** : `apps/site/components/sas/sas-model.ts` (4 chambres × 11 pièces × 8 profils depuis
  `lib/fleet.ts` + `lib/profiles.ts` **sans recopier** le registre ; spine ; mapping raisons), `sas-machine.ts` (réducteur pur S0-S4, transitions du
  storyboard §8), `sas-audit.ts` (payload du panneau latéral, raisons par index d'enum, libellés depuis `required[]`), `use-sas-state.ts` (hook **mince**,
  non testé en racine). Tests racine `test/sas-*.test.ts` (`node --test`, modules purs, **ni `@/`-alias ni JSX**) :
  `sas_model_matches_registers` (11 pièces = `FLEET_AGENTS` ; **Hikae dans exactement 2 chambres** ; MONARK absent des pièces ; 8 profils = `PICKER_PROFILES` ;
  chemins = `engineKeys`), `sas_monark_is_container_not_piece`, `sas_defidrama_absent` (grep `apps/site`), `sas_audit_reasons_from_frozen_enum`
  (**couverture + unicité** des 12 codes ≠ `covered`), `sas_states_closed` (S0-S4 seulement + invariants §8 : S1 refus ⇒ aval inchangé ; S2 horloge fermée
  ⇒ brume→sédiment en Gate ; S3 niveau ≤ plancher ⇒ vanne fermée, tout dépôt = `budget_exhausted` par index ; S4 pièces allumées == `engineKeys`
  exactement, VISAGE = spine seule ; retour S0), `sas_spine_single_definition`. **Un mutant nommé par invariant.** + **ADR-M004 D18** (C-11).
- **F-site-9a-ii — scène + intégration** (après Q-1) : `sas-scene.tsx` (three.js cœur + **`GLTFLoader` seul** depuis `three/addons`, `next/dynamic` `ssr:false`) chargeant le **GLB vendoré `public/sas/sas.glb`** produit par Higgsfield 3D Jutsu (projet `f16c521b…`, BRIEF addendum 5 ; nœuds nommés `chamber_{1..4}_{Attest|Calibrate|Gate|Agir}`, `{Chambre}_filter_{k}`, `{Chambre}_sediment`, `thread_commit`, `mist_defer_plume` — la machine pilote par nom ; test `sas_glb_nodes_match_model` : 11 lames = 11 pièces, 4 chambres, 0 nœud texte), remplacement dans `board.tsx`
  (§1), `prefers-reduced-motion` **ou WebGL absent** ⇒ aucune boucle rAF, machine figée S0, première frame comme image fixe (pas d'asset PNG) ; disposal du
  renderer au démontage et à la bascule de thème ; pause rAF onglet caché ; **équivalent DOM clavier** de l'audit (liste visuellement masquée « ouvrir l'audit
  du dernier dépôt en chambre X »). Tests statiques : `sas_no_text_no_number` (denylist sur `components/sas/**` :
  `TextGeometry|FontLoader|CSS2DObject|CSS3DObject|CanvasTexture|fillText|strokeText|TextureLoader|troika|Sprite` ; imports limités au cœur `three` + `three/addons/loaders/GLTFLoader.js` **nommément** (amendement Higgsfield 2026-09-18), tout autre addon interdit ; `aria-label` sans chiffre ; mutant `CanvasTexture` ⇒ rouge), `sas_reduced_motion_static`, `sas_home_invariants` (C-5 : `board.tsx`
  contient `<aside`, mappe `PICKER_PROFILES`, rend `{CAVEAT}`, monte la scène, **n'importe pas** `./diagram` ; `page.tsx` monte `GateSim mode="board"`).
  **Déclaré** : jauge-comme-géométrie et graduations ne sont pas oraclables ⇒ revue G2 image + capture par état S0-S4. R-8 (C-9) : `three@0.186.0` **et**
  `@types/three@0.186.0`, versions exactes sans caret ; `npm view <pkg>@<ver> name version time dist.integrity dist.tarball maintainers repository.url
  dependencies` AVANT install ; après install `integrity` du lockfile == `dist.integrity` ; `dependencies` de three = {} ; consigné dans
  `apps/site/COMPONENTS-PROVENANCE.md` + G1 ; preuve K-2 (aucun `node:` côté client) rejouée au `next build`. Le `three.min.js` UMD 2023 du concept B
  n'est **jamais** repris.
- **F-site-9b — DA « Console »** : tokens `globals.css` (OLED, encre, accents), typo monospace (police OFL vendorée via `next/font/local`), mouvement ;
  **zéro** changement de structure, de copie ou de registre. Captures (C-14) : toutes les sections `data-screen-label` × breakpoints, avant/après,
  comparées par G2 en instance séparée ; tests existants verts.
- **F-site-9c — providers** : couche amont du sas (3 classes, icônes `public/providers/` CC0/officielles + licences, `surplus-logo.png` ~380 Ko
  redimensionné avant intégration), texte de cadrage, `PROCUREMENT-icons.md` porté au dépôt. **Jamais fusionné avec 9a.**

## 3. ADR (C-11) — addendum **ADR-M004 D18**, commis avec 9a-i, sourcé au verbatim investisseur 2026-09-18
(a) la DA « Console » supersède le gel de marque 2026-09-07 cité en D15 (palette/typo/mouvement seuls, structure conservée) ; (b) dépendances `three` +
`@types/three` (R-8) ; (c) marques d'inférence sur la vitrine : doctrine D14 scopée aux venues câblées par les produits ; providers admis sous « illustrative,
provider-agnostic, no endorsement », icônes avec licences vendorées ; (d) remplacement du pipeline de cartes de la home par le sas ; (e) polices OFL
`next/font/local` (lève la réserve réseau-au-build de D15).

## 4. Gates et oracle
`npm run ci` ; `gate:vocab` (scope `site`) ; `honesty-lint` ; `lang:gate` ; `lint` ; `lint:ratchet` 69 ; `export:check` ; tests site ; `next build` local ;
**Lighthouse mobile perf ≥ 90 sur la home, bloquant** (C-12 ; moyen : DevTools manuel avec JSON sauvé au G1, ou `npx lighthouse@<ver épinglée>` = R-8 ;
**sous 90 ⇒ ESCALADE-INVESTISSEUR**, jamais de dégradation silencieuse) ; `prefers-reduced-motion` vérifié. G2 fraîche ≠ générateur ; checkpoint-2 rejoue ; G7.

## 5. Modes MAST (C-13) et risques produit
- **FM-1.1** worker touche `/how` ou supprime l'aside ⇒ C-1 + `sas_home_invariants`. **FM-3.1** « done » sans `next build`/Lighthouse ⇒ checkpoint-2 rejoue.
  **FM-3.3** G2 accepte « tests verts » sans capture par état ⇒ périmètre image déclaré §2. **FM-2.6** « sans dupliquer » écrit, registre recopié ⇒
  `sas_model_matches_registers` (Hikae ×2, MONARK absent).
- Produit : overclaim visuel (jauge/pourcentage) ⇒ denylist + G2 image ; WebGL indisponible ⇒ chemin reduced-motion ; SSR de `three` ⇒ `ssr:false` ;
  disposal renderer ; pause rAF ; accessibilité clavier des clics d'audit ; dépendance empoisonnée ⇒ R-8 ; performance mobile ⇒ Lighthouse bloquant.

## 6. Séquence
checkpoint-1 ✔ → **9a-i** worker `claude-opus-4-8` max → G2 → checkpoint-2 → G7 → commit local → (Q-1 répondue) 9a-ii idem → 9b → 9c → PR(s) sous la
fenêtre publique de l'investisseur → **déploiement vitrine = go investisseur** (runbook vitrine, `systemctl restart monark` après build).

## 7. Critères d'acceptation
AC-1 storyboard S0-S4 reproduit (checklist par état, capture par état) ; AC-2 tests nommés §2 verts, un mutant par invariant ; AC-3 invariants intacts sous
oracle (`sas_home_invariants`) ; AC-4 0 texte/chiffre/jauge sur l'illustration (denylist + G2 image) ; AC-5 audit ⇒ panneau latéral, raison par index d'enum,
libellés depuis `required[]` ; AC-6 R-8 `three` + `@types/three` documenté ; AC-7 gates §4 verts, **Lighthouse ≥ 90** ; AC-8 DefiDrama absent, MONARK =
conteneur ; AC-9 R-25 mesuré par PR ; AC-10 ADR-M004 D18 commis avec 9a-i.
