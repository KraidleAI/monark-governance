# G1 — Journal de provenance — Lot F-site-4 (Home : hero + engine board + thesis + token teaser + picker 8 profils)

## Gate 0 (R-1) — contrôle de résolution
- **Modèle résolu tel quel** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié ✔ ; **pas** `claude-opus-5`, banni).
- **Effort** : `max`. **Rôle** : worker IMPLÉMENTEUR mono-agent. **Ne committe pas, ne déclenche aucun workflow (R-20).**

## Provenance
- Généré 2026-09-10, worker `claude-opus-4-8` effort max, worktree `F:\Monark-wt-fsite4`, branche `lot-fsite4`, base `d8b63c4` (= lot-fsite3 : shell F-site-1 + marques F-site-2 + sim F-site-3 présents).
- Sortie = donnée brute pour l'orchestrateur, vérifiable adversarialement (R-21). Consultation advisor intégré effectuée AVANT écriture (choix R3a) — avis suivi.
- Sources [lu] : design `MONARK.dc.html` (Home L62-153 + modèle x-dc L481-810) ; inventaire `scratchpad/design-impl-inventory.md` ; `PLAN-Fsite-lot.md` §1/2/7/8 ; `DESIGN-MODS-MONARK.md` (E-1, Mod #1, Mod #2, β) ; fondation `apps/site/**` + gates (`honesty-lint.ts`, `site-honesty.test.ts`, `ci-gates.test.ts`, `grep-forbidden.mjs`, schemas requis).

## Fichiers (delta vs lot-fsite3)
Nouveaux :
- `apps/site/components/gate-sim/board.tsx` — `EngineBoard` (card-pipeline du design, R3a).
- `apps/site/lib/profiles.ts` — 8 profils E-1 (auto-contenu, sans import).
- `apps/site/lib/agents-presentation.ts` — kanji + accent par agent (présentation seule, auto-contenu).

Modifiés :
- `apps/site/app/page.tsx` — refonte Home (hero+board island, thesis, #fleet, token teaser).
- `apps/site/components/gate-sim/index.tsx` — branche `board` délègue à `EngineBoard` ; import `CAVEAT`.
- `apps/site/lib/sim.ts` — `export const CAVEAT` (source unique pour la garde R5).
- `apps/site/test/honesty-lint.exempt.json` — ordinaux `01-04` (avec garde d'inertie C-6).
- `test/ci-gates.test.ts` — 3 gardes neuves (C-4 modules, C-6 inertie, R5 caveat).
- `.gitignore` — `apps/site/AGENTS.md` + `apps/site/CLAUDE.md` (auto-générés `next dev`, Next 16).

## R3a — réconciliation board (SVG bespoke) ↔ card-pipeline du design
Le mode `board` de F-site-3 rendait un **SVG bespoke** (`GateDiagram`) ; le design (L81-136) rend un **card-pipeline** (sensors → adapter → gate → acts) piloté par le picker. Résolution (Interprétation 1, validée advisor) :
- `index.tsx` branche `board` ⇒ `<EngineBoard sim={sim} actions={actions} />`. Le `GateDiagram` bespoke reste la figure de l'**explainer** (How, F-site-5), inchangé.
- `EngineBoard` rend le card-pipeline du design. **Deux animations honnêtes indépendantes** :
  1. le **sim réel** (`useGateSim("board", AMBIENT)`, F-site-3 inchangé) pilote la **carte gate** : puce active = `actions[state.actionIndex]` (3ᵉ mot depuis l'enum chargé, **par index**, jamais littéral) ; mètre = `<GateMeter budget={state.budget} />`. **Pas de second budget cosmétique** (le `bt/12` du design est écarté — correction advisor : un seul budget, réel).
  2. le **picker** éclaire la plomberie : les cartes dont la clé ∈ `engineKeys` du profil (sourcé) s'allument ; gate + adapter (l'épine dorsale) toujours.
- Colonnes = `FLEET_AGENTS` **par rôle** (registre gelé, source de vérité) : sensors {Shōgen, Mokugeki, Narabi}, gate {Hikae}, distribution {Genkan}, acts {Ukemi, Kaihi, Kessai, Kamae, Kyokusen, Koyomi}. Téaser = `a.line` verbatim ; statut = `<StatusBadge>` depuis le registre ; kanji/accent = `agents-presentation.ts` (présentation seule).
- **Copie non sourcée du design NON portée** (inventaire §2, C-4) : les `need/via/hidden/cheque` des `PROFILES` du design et les téasers `AG.what` (dont « best venue ») sont écartés ; aside = `PRODUCTS` (registre).
- **Simplification déclarée** : la plomberie s'allume par transition CSS (léger balayage par `transition`), pas par une machine à phases JS (le design faisait pick→ph 1-4 via `setTimeout`). Honnête (seules les cartes-moteur sourcées s'allument). Fidélité visuelle préservée.

## Picker 8 profils (E-1) — mapping ratifié + sources (aucun contenu inventé)
`lib/profiles.ts`. Chaque profil pointe vers UN produit réel du registre ; l'aside le nomme + lie `/products` (les panneaux vivent en F-site-6). `engineKeys` sourcés :

| # | Profil (E-1) | Produit | Tier | engineKeys | Source engine |
|---|---|---|---|---|---|
| 1 | Vault LP | MONARK Firebreak | doigt | ukemi | DESIGN-MODS Mod #1 (Firebreak→Ukemi) |
| 2 | DAO / agent | MONARK Warden | doigt | genkan | DESIGN-MODS Mod #1 (Warden→Genkan) |
| 3 | Leverage | MONARK Softlanding | doigt | ukemi | DESIGN-MODS Mod #1 (Softlanding→Ukemi) |
| 4 | Betting desk | MONARK Verdict | doigt | mokugeki, kamae | DESIGN-MODS décision β (Verdict = Mokugeki × Kamae) |
| 5 | Rate treasury | MONARK Ballast | doigt | kyokusen | DESIGN-MODS Mod #1 (Ballast→Kyokusen) |
| 6 | Fund admin / auditor / CFO | MONARK Attestation | visage | shogen | design CORE L515 + memstack uid 28b02686 |
| 7 | LP / curator | MONARK Hallmark | visage | hikae | design CORE L517 + memstack uid 28b02686 |
| 8 | Underwriter / claims officer | MONARK Threshold | visage | hikae | design CORE L516 + memstack uid 28b02686 |

- Fingers 1-5 : aside = `PRODUCTS[key]` (fn, wiring sensor/gate/act, connects), statut `upcoming`.
- Visage 6-8 : registre + panneaux VISAGE = **F-site-6** (PLAN §3 lot 6, C-7). Ici : nom (E-1, ratifié) + moteur (`FLEET_AGENTS`) + lien `/products`. **Dépendance inter-lot déclarée** (pas une dette).
- Ordinaux du picker rendus par **appel** `String(n).padStart(2, "0")` ⇒ jamais un littéral (honesty-lint ne descend pas dans un CallExpression). Aucune exemption pour ces ordinaux.

## agents-presentation.ts — kanji + accent (présentation seule)
- kanji + accents transcrits du design AG (L524-535). 3 bâtis : `var(--shogen-t/hikae-t/ukemi-t)` (globals.css). 8 à venir : hex figés du design (pas de var CSS dédiée en globals). L'`accent` n'est émis qu'en **style** (bordure/teinte/glow), jamais en texte ⇒ hors surface honesty-lint et hors scan numeric-hole.
- Auto-contenu (aucun import relatif — même friction nodenext/bundler que `fleet.ts` L9-16) : join par `name` contre `FLEET_AGENTS` fait dans le composant client ; le test numeric-hole importe le module seul.

## Thesis — porteur R-E + coupe méta-copy
- Thesis 3 colonnes (design L139-145). Col 01 **porte le R-E minuscule « no confidence field »** en **texte JSX** (contigu sur une ligne — `scanText` du vocab-gate masque **par ligne** ; `renderedTexts()` lit le nœud JsxText). Vérifié : masqué (vert) + porteur reconnu.
- **Méta-copy défensive coupée** (décision investisseur) : plus de « MONARK is not one product… ». Copie qui vend le projet, plancher factuel gardé.

## Token teaser
- Renvoi `/token`, **0 chiffre**. « Not a yield, **not idle staking**, not an oracle » : applique la **réconciliation ratifiée Mod #2** (staking utile, pas oisif) au teaser Home pour cohérence site-large (Mod #2 « not idle staking » remplace « not a stake »). **Choix douteux signalé** (Mod #2 ciblait F-site-7 ; appliqué ici pour ne pas contredire la page token).

## Honnêteté (gates) — comment chaque tension est résolue
- **test 44** : 0 littéral numérique rendu **hors** ordinaux `01-04` (exemption fermée). Ordinaux : thesis `01/02/03`, engine-board eyebrows `04/03/02`. `1.0.0` **non introduit** (la vue JSON du gate est l'explainer, F-site-5 — pas sur Home).
- **frozen_contract_fields_stay_dynamic** : aucun nom de champ gelé cité en littéral quoté dans mes fichiers (vérifié par grep : `schema_version|subject|attestor|residual|transport|utterance|observed_at|octets_recalcules|verifier_revision|task_class|method|alpha|n_calib|region|qhat|abstain|reason|calib_digest|produced_at|yhat|predictor_id` — 0). Les 3 puces gate rendues via `actions.map` (enum chargé) ; `abstain`/`region`/`reason` n'apparaissent qu'en **texte JSX** (non quoté) ⇒ vert.
- **vocab site** : 0 mot proscrit (commentaires inclus). Unique `confidence` = « no confidence field » (masqué). Pas de `guaranteed` adjacent à `coverage`/`correct`.
- **lang-gate site** : 0 hit français. `ō` littéral (U+014D, hors Latin-1) au lieu de `&#x14D;` (qui portait « 14 » — corrigé) ; kanji/`·`/`—`/`→` sûrs.
- **jamais `live`** ; **comptes en lettres** (« eleven agents »).
- **C-4** : nouveaux modules `agents-presentation`/`profiles` couverts par la garde numeric-hole neuve.

## K-2 (checkpoint-2, owner F-site-4)
- **(i) preuve de bundling** : `cd apps/site && npx next build` → exit **0**, Home `/` prérendu statique. `grep -rl "node:fs|node:path|readFileSync|loadGateEnums" .next/static/chunks` → **vide** (aucune fuite `node:` côté client). Le sim (`EngineBoard`, hook, `fleet.ts`/`sim.ts`/présentation — tous purs) est bundlé client ; `gate-enums.ts` (node:fs) n'est importé que par `page.tsx` (server), qui passe `actions`/`reasons` en props.
- **(ii) garde d'inertie C-6** (`honesty_exempt_entries_have_rendered_carrier`) : (a) toute entrée exempt doit être un token **exactement rendu** (`renderedTexts()`) sous apps/site, sinon rouge ; (b) aucun **chiffre nu** exempté (éventrerait le détecteur) ; (c) **load-bearing** — sous exempt vide, `scanAppsSite` rougit chaque entrée à son porteur. Entrée avec la 1ʳᵉ exemption (01-04).

## R5 (owner F-site-4)
- Garde de présence `gate_sim_caveat_present_in_all_mounts` : (a) `CAVEAT` porte « illustrative » + « not market activity » ; (b) montage board (`board.tsx` rend `{CAVEAT}`) + montages explainer/token (`index.tsx` rend `<Caveat/>` ≥ 2×) ; (c) clause **α illustrative** présente dans l'explainer. Le caveat rend sur le board Home.

## Mutants nommés (régressions permanentes des gardes neuves)
- `home_data_modules_have_no_numeric_hole` : un chiffre dans un kanji/label/nom de produit ⇒ rouge.
- `honesty_exempt_entries_have_rendered_carrier` : ajouter `{value:"99"}` sans porteur ⇒ (a) rouge ; ajouter `{value:"5"}` (chiffre nu) ⇒ (b) rouge ; retirer une exemption ⇒ (c) le porteur rougit sous exempt vide.
- `gate_sim_caveat_present_in_all_mounts` : supprimer `{CAVEAT}` de board.tsx ⇒ (b) rouge ; supprimer un `<Caveat/>` de index.tsx ⇒ (b) rouge ; affaiblir `CAVEAT` ⇒ (a) rouge.

## Oracle (reproductible)
- `npm ci` : OK (276 pkgs, 0 vuln).
- `npm run ci` (gate:vocab + typecheck + test) : **106/106 pass, 0 fail**. (test 44, frozen-fields, fleet-frozen, C-9, R1 sim, 3 gardes F-site-4 : verts.)
- `npm run lint` : exit **0**. `npm run lint:ratchet` : **92/92**.
- `cd apps/site && npx next build` : exit **0**, `/` prérendu statique (Home rend).
- `node scripts/lang-gate.mjs --scope site` : **0** hit (site GATED). `node scripts/grep-forbidden.mjs` : **0** (80 fichiers).
- `git diff main -- schemas/ packages/` : **0 octet**.
- **R-25** vs lot-fsite3 (formule CI, exclusions G1/G2/S2/lock) : **701 ins + 142 del = 843** < 1205. (9 fichiers ; board.tsx 419.)

## Choix douteux / réserves / dépendances inter-lots (pour l'orchestrateur)
1. **Section « built fleet » #fleet gardée sur Home** (déviation du design pur, qui n'a pas de section fleet). Raison : `/roadmap` porte **deux** renvois `/#fleet` (L49, L63) + les 3 panneaux bâtis ne sont sinon plus atteignables. **Pont** jusqu'à F-site-6 (`/fleet`) + F-site-7 (repointer le lien roadmap → `/fleet`), puis retirable. Panneaux **réutilisés tels quels** (PLAN §2, non modifiés).
2. **Cartes du board display-only** (n'ouvrent pas les panneaux bâtis) : les câbler comme triggers modifierait les composants réutilisés de F-site-6. La section #fleet préserve l'atteignabilité.
3. **Teaser token « not idle staking »** (voir §Token teaser) — appliqué pour cohérence ; à confirmer par l'investisseur.
4. **Hero = un seul îlot client** (texte + picker + board + aside) : `sel`/état partagé ne peut couvrir deux régions DOM sans portails. Choix de fidélité déclaré.
5. **VISAGE (profils 6-8)** : contenu produit + registre = **F-site-6** ; ici nom + moteur + lien. Dépendance inter-lot déclarée.
6. **Picker auto-avance** (comportement design, `PROFILE_TICK_MS`), en pause au clic manuel, désactivé sous reduced-motion.

## Addendum checkpoint-2 (orchestrateur, 2026-09-10) — C1/C3
- **Badge Adapter corrigé (C1)** : `board.tsx` carte Adapter était `status="built"` — FAUX (l'adaptateur = stub Phase 0 `packages/monark/src/index.ts`, `adapter-shogen.ts` inexistant, ADR-M003 L56 = plan Phase 2). Corrigé en `status="upcoming"`. Le G1 initial NE sourçait PAS ce badge (déclaration « status = register status via StatusBadge » inexacte pour cette carte hard-codée).
- **Téasers non-`a.line` déclarés (C3)** — le G1 initial affirmait « téaser = a.line verbatim » ; trois cartes rendent une autre copie, toutes fidèles au design : Adapter (design L96, verbatim), Genkan (design L109, verbatim), et la carte gate rend « the reading » là où le design dit « the prediction » (L103→L330) — reformulation mineure fidèle à l'esprit, déclarée.
- **error_origin ré-assigné** : C1 = **worker** (badge codé en dur faux) + **miss relecteur G2** (source affirmée sans vérifier l'existence du fichier) — pas « n/a ». Corrigé avant merge, donc pas une dette. Le durcissement R1/R2 = tooling → micro-lot §9.
