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
  (`fleet/page.tsx:25,:73`, `page.tsx:86`, `roadmap/page.tsx:99,:170`) ; (4) `ukemi-panel.tsx` statut lu au registre. **Non touché (0
  octet)** : `schemas/`, `packages/*`, `apps/harness` (dont `src`), `apps/sentinel` (dont `src`) — vérifié §4. `apps/harness` intouché ⇒
  item (1) « étape h5 `attested` » reste déclencheur (ADR-W1).

## 1. Fichiers livrés + sha256 (LF-normalisé)

| Fichier | État | sha256 (LF) |
|---|---|---|
| `apps/site/lib/fleet.ts` | modifié (union `FleetWiring`+`Built`/`Upcoming` ; `wiring` ×4 ; `:70` attested ; commentaires) | `a7c0b523c04a4a33afad8da1ba9a2e5ef3cd597bdb5be4ce76e0a4000f2d33cf` |
| `test/ci-gates.test.ts` | modifié (`fleet_register_built_set_is_frozen` étendu ; import `existsSync`) | `08c27c89ef2593cc2145752111b4fc856eac23210f0cc6e183bdc49a7f0a10d4` |
| `apps/site/components/ukemi-panel.tsx` | modifié (import `@/lib/fleet` ; `UKEMI`+`UKEMI_STATUS` fail-closed ; `status={…}`) | `0c717cc23417b074f84fb60c1b99ffafbc8a37490513431531227c0732af7efc` |
| `apps/site/app/fleet/page.tsx` | modifié (`:25` métadonnée, `:73` prose) | `e356f8efa35d32e88cbe11accc3923858955b3d864e74daf9d59635796bb45fd` |
| `apps/site/app/page.tsx` | modifié (`:86` prose) | `ec3aad44fd10dae22f718fcff6ad4de3069e8cb2d93edc3fd05566ef349ae03b` |
| `apps/site/app/roadmap/page.tsx` | modifié (`:99` carte Phase two, `:170` prose) | `cbde0775a3911d2a50adff6b4d0f939b84a06041e1937fd15eb71c33315223a5` |
| `docs/adr/ADR-W1-registre-wiring.md` | **créé** (ADR de lot) | `e2b4de94e38aa1031096481de7af12bb278403466c27eadd66473f8238bce6b8` (au gel worker ; re-sha au G7 si fold) |
| `docs/G1-lot-w1.md` | **créé** (ce journal) | _(auto)_ |

`git status --short` : `M` sur les 6 fichiers de code ci-dessus, `??` sur `docs/adr/ADR-W1-…md` et `docs/G1-lot-w1.md`. Aucun fichier parasite.
**R-25** (`git diff --numstat`, hors ADR/G1) : fleet.ts 83/8, ci-gates.test.ts 47/3, ukemi-panel 11/1, fleet/page 3/3, page 2/2,
roadmap/page 3/3 ⇒ **+149 / −20 (net +129)**. Bien < ~300.

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
Restauration prouvée : sha(LF) après restauration == sha du §1 pour `fleet.ts` (`a7c0b523…`), `ukemi-panel.tsx` (`0c717cc2…`),
`ci-gates.test.ts` (`08c27c89…`) — **re-vérifié**, 3/3 OK.

| # | Mutation | Cible attendue | Résultat MESURÉ |
|---|---|---|---|
| m1 | `wiring` retiré de Hikae (`built`) | `npm run typecheck` rouge | **rouge** — `fleet.ts(116,3) TS2322 : Property 'wiring' is missing … required in type 'BuiltFleetAgent'` |
| m2 | Ukemi `integration_test:"no_such_test"` | test de gel rouge | **rouge** — `AssertionError : built agent Ukemi: integration_test 'no_such_test' names no test under test/, apps/harness/test/, apps/sentinel/test/` |
| m3 | `status="built"` remis sur l'`AgentCard` Ukemi | test de gel (garde 5) rouge | **rouge** — `AssertionError : ukemi-panel AgentCard status must be read from the register (status={...}), not a hard-coded literal` |
| m4 | `wiring` ajouté sur Mokugeki (`upcoming`) | `npm run typecheck` rouge | **rouge** — `fleet.ts(141,3) TS2322 : Types of property 'wiring' are incompatible` (`wiring?: never`) |

Note (type-stripping) : sous le runner node, m1/m4 rougissent aussi `npm test` en `TypeError` d'exécution ; la **cible d'oracle** retenue
est `npm run typecheck` (erreur de type explicite, `fleet.ts` vu transitivement par le programme root via l'import de ci-gates). m2/m3
sont des rouges d'**assertion** (runtime, non-LLM).

## 3. Grep résiduel (mesuré)
- **« end to end » / « cross-agent » faux sur `apps/site`** : **0** (`grep -rniE "end to end|end-to-end|cross-agent|cross agent" apps/site` = 0).
- **`README.md`** : **0** (déjà corrigé en b3). **`skills/`** : **1 résidu VRAI, conservé** — `skills/monark/DEMO.md:86` « verified end-to-end
  by `test/byo-demo-probe.test.ts` » : affirmation **exacte** (le test `probe_byo_demo_loop_closes`, `test/byo-demo-probe.test.ts:78`,
  re-pilote et vérifie la boucle démo) ⇒ **pas un faux résidu**, hors portée octet W-1.
- **`wiring.served_by`/`wiring.integration_test` rendu sur `apps/site`** : **0** (garde (4), assertion verte) — le trou numérique est **fermé**.
- **« verified » nu (surclaim) sur `apps/site`** : mesuré `shogen-panel.tsx:36,42,51,57` + `fleet-presentation.ts:33` (5 assertions
  positives) ; `how/page.tsx:62` + `shogen-panel.tsx:63` sont des **négations honnêtes** (« what is not verified »). **Item formé** dans
  ADR-W1 (déclencheur + décision motivée de NE PAS bannir `\bverified\b`). `fleet.ts:70` corrigé (le seul du périmètre W-1).

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
- **Dettes** : 3 items formés (rendu `wiring` → designer ; résidu « verified » → prochain lot/vocab ; étape h5 `attested` → prochain lot
  harness), **chacun avec déclencheur** ; 0 procurement (interne, mesuré) ; 0 compte public modifié.
- **Sources** : toute valeur `wiring` est **[lu]** dans le code cité (§ ADR-W1 D2 + Tuyaux) ; aucun chiffre de seconde main ; aucun `[2nd]`.

## 6. Points à trancher (orchestrateur / G2 / checkpoint-2)
- **Narabi `integration_test` = une seule jambe** : `sentinel_windows_identical_to_pull` (jambe sentinelle publiée). La jambe
  `fromAttestedFlow → gate` est documentée (ADR-W1 Tuyaux) et couverte par `gate_stable_run_*`, mais le **champ** ne nomme qu'un test.
  Alternative si G2 préfère la jambe gate : y pointer et documenter la sentinelle. **À valider.**
- **`fleet.ts:70` « attested » vs répétition** : « Attested perception — an attested price testimony » (exemple de mission retenu ;
  « signed »/« notarized » **non** retenus faute d'avoir lu `schemas/attested-price.schema.json`). **À valider** (choix positif = item formé).
- **Item (b) rendu `wiring`** déclaré non fait (trou numérique) : confirmer le renvoi **designer** plutôt qu'un rendu partiel maintenant.

<!-- Journal de provenance G1 (corpus doc 02). Aucune revendication non sourcée ; toute mesure reproductible dans le worktree cité. -->
