# G1 — journal de provenance, lot W-1 (champ `wiring` + gel étendu ; ADR-M018 D2, items formés ADR-M019 ; ADR-W1)

- **Modèle worker** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Opus 5 banni (roster 2026-08-14).
  Contrôle de résolution (R-1) rendu au premier tour de session : préfixe `claude-opus-4-8` conforme.
- **Date** : 2026-09-19. **Worktree** : `F:\Monark-wt-p1b1`, branche `lot/w-1` (HEAD de départ `79c4206`). **Aucun `F:\Monark` touché.**
- **Rattachement** : ADR-M018 D1/D2/D3 ; ADR-M019 items formés (2)(3)(5) + D4 ; ADR-M017 Tuyaux (attest→gate) + D2(iii) + D4(3) ;
  ADR-M012 M012-e (Narabi) ; ADR-M005 D6 (B_t porté-appelant) ; CHECKPOINT2-M017-b3 (Sprint Backlog W-1, G7). **ADR de lot : ADR-W1.**
- **Aucun commit** (R-20), aucune action `git` en écriture, aucun workflow : l'orchestrateur committe.
- **Portée W-1 (et rien d'autre)** : (1) `apps/site/lib/fleet.ts` — `FleetAgent` → union discriminée + `FleetWiring`, `wiring` sur les
  4 built (valeurs mesurées), `:70` « verified »→« attested » ; (2) `test/ci-gates.test.ts` — `fleet_register_built_set_is_frozen`
  **étendu** (gardes (3) existence de test, (4) fermeture trou numérique, (5) panneau lit le registre) ; (3) prose vitrine ×5
  (`fleet/page.tsx:25,:73`, `page.tsx:86`, `roadmap/page.tsx:99,:170`) + **C4** `shogen-panel.tsx:36,:42` (jumeaux rendus de `:70`) ; (4)
  `ukemi-panel.tsx` statut lu au registre. **Non touché (0
  octet)** : `schemas/`, `packages/*`, `apps/harness` (dont `src`), `apps/sentinel` (dont `src`) — vérifié §4. `apps/harness` intouché ⇒
  item (1) « étape h5 `attested` » reste déclencheur (ADR-W1).

## 1. Fichiers livrés + sha256 (LF-normalisé)

| Fichier | État | sha256 (LF) |
|---|---|---|
| `apps/site/lib/fleet.ts` | modifié (union `FleetWiring`+`Built`/`Upcoming` ; `wiring` ×4 ; `:70` attested ; **C3** commentaire Narabi « offline/sha-pinné ») | `8dd97f22009ff9cb7e153840d98d7c20108b8b9d4282b8ee5e5fb7a93c4813f3` |
| `test/ci-gates.test.ts` | modifié (gel étendu ; `existsSync` ; **C1** garde (5) anti-`{"built"}` ; **C2** garde (4) tripwire identifiant) | `82abcdd44fd60a8ace1b28bb6dc595b905b8740d8bca50b353145daf0175fb24` |
| `apps/site/components/ukemi-panel.tsx` | modifié (import `@/lib/fleet` ; `UKEMI`+`UKEMI_STATUS` fail-closed ; `status={…}`) | `0c717cc23417b074f84fb60c1b99ffafbc8a37490513431531227c0732af7efc` |
| `apps/site/components/shogen-panel.tsx` | modifié (**C4** `:36,:42` « verified »→« attested », jumeaux de `fleet.ts:70`) | `a76a3bd062a74b4412879456497e8b017277644e34293a17327f6765c7faf7dc` |
| `apps/site/app/fleet/page.tsx` | modifié (`:25` métadonnée, `:73` prose) | `e356f8efa35d32e88cbe11accc3923858955b3d864e74daf9d59635796bb45fd` |
| `apps/site/app/page.tsx` | modifié (`:86` prose) | `ec3aad44fd10dae22f718fcff6ad4de3069e8cb2d93edc3fd05566ef349ae03b` |
| `apps/site/app/roadmap/page.tsx` | modifié (`:99` carte Phase two, `:170` prose) | `cbde0775a3911d2a50adff6b4d0f939b84a06041e1937fd15eb71c33315223a5` |
| `docs/adr/ADR-W1-registre-wiring.md` | **créé** (ADR de lot ; C2/C3/C4 pliées) | `9dfc3a57a5e660e3be5bdfe6c1ae82759a72dea1c3166b0d7369f598b7381b2b` (au gel worker ; re-sha au G7 si fold) |
| `docs/G1-lot-w1.md` | **créé** (ce journal) | _(auto)_ |

`git diff --numstat 79c4206` (branche start), **hors ADR/G1** : fleet.ts 84/8, ci-gates.test.ts 61/3, ukemi-panel 11/1, shogen-panel 2/2,
fleet/page 3/3, page 2/2, roadmap/page 3/3 ⇒ **+166 / −22 (net +144)** — **R-25** bien < ~300. (Base courante `b1594c4`, commit orchestrateur
mi-lot après G2 ; corrections C1–C4 seules = shogen 2/2, fleet 2/1, ci-gates 28/14, ADR 23/15.) `?? docs/G2-lot-w1.md` = artefact G2 de
l'orchestrateur, **non touché** ; aucun autre fichier parasite ; **0 octet hors `apps/site`, `test/ci-gates.test.ts`, `docs/`** (vérifié §4).

### Correspondance décision → artefact (ADR-W1)
- **D1 (type)** : `FleetWiring` + `FleetAgentCommon` + `BuiltFleetAgent`(`wiring` requis) / `UpcomingFleetAgent`(`wiring?: never`) +
  `type FleetAgent = Built | Upcoming`. Les 5 consommateurs de `FleetAgent`/`FLEET_AGENTS` (fleet/page, roadmap/page, board.tsx,
  sas-model.ts, tests) ne lisent que name/role/line/status (base) ⇒ **union sûre** (mesuré : `grep` consommateurs, aucun ne construit ni
  ne lit `wiring` hors `status==="built"`).
- **D2 (valeurs mesurées)** : Shōgen `gate_attested_concordant_files_residual` (`apps/harness/test/gate.test.ts:702`) ; Hikae/Ukemi
  `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:83`) ; Narabi `sentinel_windows_identical_to_pull`
  (`apps/sentinel/test/sentinel.test.ts:114`). Les 3 noms existent (grep §3).
- **D3 (gel étendu)** : gardes (3)(4)(5) ajoutées au test existant — **compte de tests inchangé (289)**, l'extension n'ajoute aucun bloc
  `test()`. `existsSync` importé pour l'anti-faux-vert.
- **D4 (prose)** : libellé `README.md:102` repris mot à mot (accepté checkpoint-2 b3) ; chaîne fléchée « Shōgen → Hikae → Ukemi » retirée
  (revendiquait `gate → Ukemi`, inexistant) ; `roadmap:99` réécrit vrai des deux moitiés **sans deux surclaims** : (a) « **résidu** filé »
  (pas « price filed » — M017 D2(iii)/test (3)(c), M-2 : la couture ne touche que `verdict.residual`), (b) « echoed by the gate » (pas
  « never depleted » nu, qui contredirait la copie publique `page.tsx:65` « a depletable authorization budget ») ; `fleet.ts:70`
  « verified »→« attested ».

## 2. Mutants nommés (mesuré : mutation → cible → résultat → restauration byte-exacte)
Restauration prouvée : sha(LF) après restauration == sha du §1 pour `fleet.ts` (`8dd97f22…`, mutants m1/m2/m4), `ukemi-panel.tsx`
(`0c717cc2…`, m3/A1), `roadmap/page.tsx` (`cbde0775…`, A2/m5) — **re-vérifié, tous OK** ; les 4 autres fichiers du §1 non mutés, inchangés.
**A1/A2 = les deux trous G2 (C1/C2) désormais ROUGES** (étaient VERTS avant correction).

| # | Mutation | Cible attendue | Résultat MESURÉ |
|---|---|---|---|
| m1 | `wiring` retiré de Hikae (`built`) | `npm run typecheck` rouge | **rouge** — `fleet.ts(116,3) TS2322 : Property 'wiring' is missing … required in type 'BuiltFleetAgent'` |
| m2 | Ukemi `integration_test:"no_such_test"` | gel rouge | **rouge** — `built agent Ukemi: integration_test 'no_such_test' names no test under test/, apps/harness/test/, apps/sentinel/test/` |
| m3 | `status="built"` (attribut) sur l'`AgentCard` | gel garde (5) rouge | **rouge** — `ukemi-panel AgentCard status must not be a hard-coded literal (status="built" or status={"built"})` |
| m4 | `wiring` ajouté sur Mokugeki (`upcoming`) | `npm run typecheck` rouge | **rouge** — `fleet.ts(141,3) TS2322 : Types of property 'wiring' are incompatible` (`wiring?: never`) |
| m5 | rendu **accès** `a.wiring.served_by` dans une surface site | gel garde (4) rouge | **rouge** — `…references wiring identifiers served_by/integration_test… : apps/site/app/roadmap/page.tsx` |
| **A1** (C1) | `status={"built"}` **littéral JSX-wrappé** sur l'`AgentCard` | gel garde (5) rouge (était **VERT** : l'ancien `stMatch[1]==="{"` acceptait `{`) | **rouge** — même assertion que m3 ⇒ **trou C1 fermé** |
| **A2** (C2) | **destructuration** `const {served_by}=a.wiring` dans une surface site | gel garde (4) rouge (était **VERT** : l'ancien regex `wiring\.served_by` la manquait) | **rouge** — même assertion que m5 ; **prouvé** : `old /wiring\.served_by/`=false, `new /served_by/`=true ⇒ **trou C2 fermé** |

Note (type-stripping) : sous le runner node, m1/m4 rougissent aussi `npm test` en `TypeError` ; la **cible d'oracle** retenue est
`npm run typecheck` (erreur de type explicite, `fleet.ts` vu transitivement par le programme root via l'import de ci-gates). m2/m3/m5/A1/A2
sont des rouges d'**assertion** (runtime, non-LLM).

## 3. Grep résiduel (mesuré)
- **« end to end » / « cross-agent » faux sur `apps/site`** : **0** (`grep -rniE "end to end|end-to-end|cross-agent|cross agent" apps/site` = 0).
- **`README.md`** : **0** (déjà corrigé en b3). **`skills/`** : **1 résidu VRAI, conservé** — `skills/monark/DEMO.md:86` « verified end-to-end
  by `test/byo-demo-probe.test.ts` » : affirmation **exacte** (le test `probe_byo_demo_loop_closes`, `test/byo-demo-probe.test.ts:78`,
  re-pilote et vérifie la boucle démo) ⇒ **pas un faux résidu**, hors portée octet W-1.
- **Identifiants `served_by`/`integration_test` référencés sur `apps/site` (≠ `lib/fleet.ts`)** : **0** (garde (4) **tripwire identifiant**,
  C2 : attrape accès **et** destructuration ; assertion verte). **Limite déclarée** (G2 C2) : un regex de texte ne ferme pas les fuites
  réflexives `Object.values(a.wiring)`/`JSON.stringify(a.wiring)` — le fix garde (4) **(i)** lever le tripwire **et (ii)** ajouter les chaînes
  au scan numérique est le **prérequis** de l'item designer (b). A2/m5 le prouvent rouges.
- **« verified » nu (surclaim) sur `apps/site`** : W-1 corrige `fleet.ts:70` **et ses jumeaux rendus** `shogen-panel.tsx:36,:42` (C4,
  → « attested » ; aucun test ne pinne la phrase). **Restent 3** (phrases différentes) : `shogen-panel.tsx:51,:57` + `fleet-presentation.ts:33`
  ⇒ **item formé, un seul lot propriétaire (lot Shōgen-honnêteté)**, ADR-W1. `how/page.tsx:62` + `shogen-panel.tsx:63` = **négations honnêtes**
  (« what is not verified »), conservées. **Décision : NE PAS bannir `\bverified\b`** (rougirait les négations honnêtes).

## 4. Oracle brut (mesuré, worktree `F:\Monark-wt-p1b1`)
- `npm run ci` → `gate:vocab` 0 claim · `typecheck` (tsc --noEmit) clean · **tests 289 pass / 0 fail** (compte inchangé : gel étendu, pas
  de nouveau bloc `test()`).
- `npm run lint` (`eslint .`) → **0** (aucune sortie).
- `npm run lint:ratchet` → **69/69** (plafond `measured_on 2026-09-16` inchangé : `apps/site`/`test` ne touchent pas les 6 règles typées différées).
- `node scripts/lang-gate.mjs --scope root` → **OK, 0 hit** non-exempt. (Déclaré : `--scope root` **ne couvre pas** `apps/site` — scope `site`,
  gaté par le test 42 dans `npm run ci` ; et `docs/` est dans `SKIP_DIRS` de lang-gate ⇒ l'ADR/G1 en français ne sont pas scannés.)
- `npm run export:check` → **OK, 0 forbidden path** (scope `site` inclus ; `apps/site` est dans `WHITELIST_DIRS`). `fleet.ts` **absent** de
  `apps/site/data/manifest.sha256.json` ⇒ aucun hash de rendu à régénérer.
- `npm run build -w apps/site` (`next build`) → **Compiled successfully** + **13 pages statiques prérendues** (dont `/roadmap`, `/fleet`, `/`).
  Note : la 1ʳᵉ passe a rougi (`ukemi-panel.tsx TS18048 : 'UKEMI' is possibly 'undefined'` — le narrow d'un `const` module capturé en
  closure se re-élargit) ; corrigé sans `!` par extraction module-scope `const UKEMI_STATUS = UKEMI.status` (le narrow fail-closed tient
  au niveau module) ; 2ᵉ passe verte. `apps/site` est **hors** du programme root `tsc`, d'où l'intérêt du `next build` comme oracle de type site.

## 5. Invariants de clôture (zéro dû nu)
- **Branchement (investisseur 2026-09-19)** : chaque `built` déclare `served_by` + `integration_test` (test existant, non-LLM) ; le panneau
  Ukemi lit le registre ; le test de gel prouve registre↔test et registre↔panneau. Aucune pièce « built » sans tuyau déclaré au registre.
- **Dettes** : 3 items formés, **chacun avec un déclencheur unique** — (b) rendu `wiring` → **lot designer** (prérequis : fix garde (4) =
  lever le tripwire + ajouter les chaînes au scan numérique) ; résidu « verified » (3 restants) → **lot Shōgen-honnêteté** ; étape h5
  `attested` → **prochain lot `apps/harness`**. 0 procurement (interne, mesuré) ; 0 compte public modifié.
- **Sources** : toute valeur `wiring` est **[lu]** dans le code cité (§ ADR-W1 D2 + Tuyaux) ; aucun chiffre de seconde main ; aucun `[2nd]`.

## 6. Points à trancher (orchestrateur / G2 / checkpoint-2)
- **Narabi `integration_test` = une seule jambe** : `sentinel_windows_identical_to_pull` (jambe sentinelle publiée). La jambe
  `fromAttestedFlow → gate` est documentée (ADR-W1 Tuyaux) et couverte par `gate_stable_run_*`, mais le **champ** ne nomme qu'un test.
  Alternative si G2 préfère la jambe gate : y pointer et documenter la sentinelle. **À valider.**
- **`fleet.ts:70`/`shogen-panel.tsx:36,:42` « attested » vs répétition** : « Attested perception — an attested price testimony » (exemple de
  mission retenu ; « signed »/« notarized » **non** retenus — la sémantique de signature du récit du panneau Shōgen relève du **lot
  Shōgen-honnêteté** dédié, pas d'une substitution mot-à-mot ici, cadre b3). **À valider** (choix positif = item formé).
- **Item (b) rendu `wiring`** déclaré non fait (trou numérique) : confirmer le renvoi **designer** plutôt qu'un rendu partiel maintenant.

## 7. Corrections G2 (round `b1594c4`, APPROUVÉ-AVEC-CORRECTIONS) — pliées
- **C1** (`test/ci-gates.test.ts` garde (5)) : `status={"built"}` (littéral JSX-wrappé) passait (`stMatch[1]==="{"`). Ré-écrit : ancré au
  **premier `status` après `<AgentCard`** (les `status="built"` de `PanelBlock` restent hors champ), (a) refus littéral attribut **ou**
  `{"…"}` (forme de la garde (2), `^`-ancrée), (b) exige `status={IDENTIFIANT}`. **Mutant A1 désormais ROUGE.**
- **C2** (garde (4) + ADR-W1 D3(4) + G1 §3) : la destructuration `const {served_by}=a.wiring` échappait au regex `wiring\.served_by`. Élargi
  aux **identifiants nus** `\b(served_by|integration_test)\b` sur `.ts/.tsx` site ≠ `lib/fleet.ts`. **Limite déclarée** : ne ferme pas
  `Object.values`/`JSON.stringify` ; fix garde (4) = prérequis de l'item (b). **Mutant A2 désormais ROUGE** (prouvé : old=false, new=true).
- **C3** (`fleet.ts:157` + ADR-W1 l.75) : « against a fresh on-chain pull » était **FAUX** (le test tourne **offline**, RPC stubbé, série
  sha-pinnée). Reformulé « recompute … contre la série committée sha-pinnée via RPC stubbé (le pull enregistré) ; prouve fenêtrage ≡ pull
  committé ». Jambe de consommation `/narabi` nommée en sus : `narabi_live_parses_real_state_shape` (`test/narabi-live.test.ts:45`, vérifié).
- **C4** (`shogen-panel.tsx:36,:42`) : jumeaux exacts de `fleet.ts:70` alignés **maintenant** (« a verified price testimony » → « an attested
  price testimony » ; aucun test ne pinne la phrase, vérifié). `:51,:57` + `fleet-presentation.ts:33` (phrases différentes) → item formé avec
  **un seul lot propriétaire nommé** (lot Shōgen-honnêteté), motif recadré **b3** (passe d'honnêteté dédiée), plus « schéma non lu ».
- Oracle complet **re-vert** après C1–C4 : ci 289/289, lint 0, ratchet 69/69, lang-gate root OK, export:check OK, typecheck clean, build site OK.
  Battery m1–m5 + A1 + A2 rejouée (m1/m4 typecheck, m2/m3/m5/A1/A2 assertion) ; restauration byte-exacte re-vérifiée ; G1 re-sha dans ce passage.

<!-- Journal de provenance G1 (corpus doc 02). Aucune revendication non sourcée ; toute mesure reproductible dans le worktree cité. -->
