# G1 — Lot E-registre (ADR-EC D1, régime **T2**)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte, épinglé ; `claude-opus-5` banni ; pas de tier nu), **effort `max`**. Worker en contexte frais ; **aucun commit, aucun workflow déclenché** (R-20) — seul l'orchestrateur committe.

**Worktree** : `F:\Monark-wt-eregistre`, branche `lot/e-registre`. **Base** : `lot/etude-suite`. Au démarrage HEAD = `3f69ef6` = `lot/etude-suite`. `lot/etude-suite` a avancé pendant la session à **`ac04d41`** (10 commits, **tous docs** : CHANTIERS, ADR-T1aii, AUDIT-ENTREE-CRA, RESSOURCES-HELIUS, `a3f85f4` décisions investisseur 21-25 dont « R-25 D9 septies (docs excluded) »). Mesuré : ces 10 commits **ne touchent aucun de mes 8 fichiers** (`git diff --name-only HEAD..lot/etude-suite -- <mes 8 fichiers>` ⇒ vide) ⇒ **`git merge --ff-only lot/etude-suite` effectué** (fast-forward, exit 0, changements non-committés préservés). HEAD final = **`ac04d41`** ; mes 8 modifications sont non-committées par-dessus.

**Régime M013 : T2** (touche le registre `apps/site/lib/fleet.ts`). Message de commit attendu de l'orchestrateur : `site[T2]`. Freeze re-pinné (cf. §Freeze) ; `upcomingCount` **inchangé = 12** ; **aucun `upcoming` promu `built`** (CA-11).

---

## 1. Périmètre livré (ADR-EC E-registre + extension D9 septies)
- **E2** — `wiring.integration_test: string` → **`string[]`** (min 1), une entrée par **jambe servie** ; garde (3) de `fleet_register_built_set_is_frozen` étendue à la liste ; `served_by` et tripwire (4) **inchangés** ; freeze re-pinné.
- **E3** — nouveau test `wiring_test_roots_exclusion_is_declared` : `WIRING_TEST_ROOTS` (liste qui pilote la garde (3)) **⇔** `WIRING_TEST_ROOTS_RATIONALE` (liste documentée) + exclusion `packages/*/test` documentée avec motif.
- **E6** — nouveau champ **`wiring.note: string`** digit-free, **rendu sur `/fleet` pour les `built` seulement** ; tripwire (4) levé **pour ce champ seul** (`served_by`/`integration_test` restent métadonnées non rendues) ; `note` ajouté au scan numérique de `site-honesty` **et** à la garde (1) ; garde (6) de consommation (branchement).
- **C-11 vi** — `board.tsx` : la couche « acts · execute » nommée **`(upcoming)`** ; Ukemi (`role:"act"`, **inchangé** dans `fleet.ts`) porte une note « feeds the gate (cascade → gate), not execute » reflétant son tuyau mesuré amont.
- **D9 septies** (extension de périmètre, décision investisseur 25, `a3f85f4`) — `ci.yml:52` reçoit `':(exclude,glob)docs/**/*.md'` ; test 38 (4ter) l'asserte (jeton entre quotes) ; `series_pinned_are_declared_and_hashed` whiteliste ce pathspec (M11 intact) ; addendum ADR-M003 D9 septies ; oracle avant/après.

**Non touché** (respect périmètre interdit) : `README.md`, `packages/monark/src/index.ts`, `skills/`, `shogen-panel.tsx`, `fleet-presentation.ts`, `scripts/lang-gate.mjs`. Vérifié : absents de `git status`.

---

## 2. Fichiers modifiés (sha256 **LF-normalisé**, lignes, delta vs base)

| Fichier | sha256 (LF) | lignes | +/− |
|---|---|---|---|
| `apps/site/lib/fleet.ts` | `388b64e87e8d1fcc4eb7126ad892389acea10cdfbcc363a9c03889e074707579` | 294 | +51/−17 |
| `test/ci-gates.test.ts` | `0373ad45667df47c29f4f65fdc31dcb7f81d4bb8dbcacca50e56d0fd4c5cd8d5` | 1198 | +107/−20 |
| `test/site-honesty.test.ts` | `ffa6f5157fbbdf96d18513715c845355d760df302d3016ed375d556575e71679` | 219 | +33/−1 |
| `apps/site/app/fleet/page.tsx` | `de4b1aea652a94928a729a6319d1f7bd83059894e35de84b4795758a00d7ab71` | 174 | +18/−1 |
| `apps/site/components/gate-sim/board.tsx` | `d154c3c275c00c436a03954638d1211f2eafda65b366926a1277d0db0df790fb` | 444 | +17/−3 |
| `apps/site/test/honesty-lint.exempt.json` | `6442843d06157c641f0fc9eb32b0774ff84a0904e550f08ff0f94b71c83dfb77` | 9 | +1/−1 |
| `.github/workflows/ci.yml` | `11eda432e89db7fc36c30be6a15698f0242a731caf505f412db73458113dbf65` | 98 | +1/−1 |
| `docs/adr/ADR-M003-phase2-integration.md` (doc, **hors R-25**) | `37b4bd392dd33183ff8a61492ee75533841169e688dd02d3255a1fa666e34e0d` | 185 | +2/−0 |
| `docs/G1-lot-e-registre.md` (ce fichier, **hors R-25**) | — | — | — |

Sha rejouable : `python -c "import sys,hashlib;print(hashlib.sha256(open(sys.argv[1],'rb').read().replace(b'\r\n',b'\n')).hexdigest())" <fichier>`.

---

## 3. Jambes servies par agent (source : `CARTOGRAPHIE-P1-2026-09-19.md` §2/§3 + ADR-W1 D2/Tuyaux — **pas de mon cru**)

Chaque id vérifié présent comme `test("<id>"` sous un `WIRING_TEST_ROOTS` (`test/`, `apps/harness/test/`, `apps/sentinel/test/`) — grep mesuré :

| Agent (built) | `integration_test[]` (jambes) | Fichier:ligne du test | Ce que la jambe rejoue |
|---|---|---|---|
| **Shōgen** (1) | `gate_attested_concordant_files_residual` | `apps/harness/test/gate.test.ts:761` | attest → gate via `registry.run()`, prix réel `runAttest()` ; `attested.residual → verdict.residual` |
| **Hikae** (3) | `probe_harness_records_real_decision` | `test/h5-e2e-probe.test.ts:83` | fil MCP réel (btc-dir-15m → commit/covered ; cascade → abstain) |
| | `probe_byo_demo_loop_closes` | `test/byo-demo-probe.test.ts:78` | boucle BYO (calibrate puis gate in-process, `calib_digest === set_digest`) |
| | `gate_stable_run_honesty_text_is_keyed_A2_A7f` | `apps/harness/test/gate.test.ts:528` | classe stable-run via l'**outil gate servi** (`gateTool.run()`) |
| **Ukemi** (1) | `probe_harness_records_real_decision` | `test/h5-e2e-probe.test.ts:83` | cascade → gate (h5 étape 4) ; effet servi = abstention constante (vacuité, ADR-M019 D2/D4) |
| **Narabi** (2) | `narabi_live_parses_real_state_shape` | `test/narabi-live.test.ts:45` | octets publiés sha-pinnés → parseur du site, byte-exact |
| | `gate_stable_run_usde_committed_region_A7b` | `apps/harness/test/gate.test.ts:482` | fromAttestedFlow → gate (`adaptToPrediction`/`fromAttestedFlow` → `runGate` direct, région USDe covered) |

**Désambiguïsation A7f/A7b (rejouable)** : A7f (`gate.test.ts:528`) pilote via `gateTool.run(...)` = surface servie ⇒ **Hikae** (le gate lui-même) ; A7b (`gate.test.ts:482`) `adaptToPrediction(narabiFlow(...))` puis `runGate(...)` direct ⇒ **Narabi** (adaptateur → gate). `probe_harness_records_real_decision` partagé par Hikae et Ukemi = licite (ids partagés admis ; précédent : le même test nommait déjà les deux au registre scalaire).

---

## 4. Tests (tous verts ; `npm test` = **328 pass / 0 fail**)

| Test | Rôle dans ce lot |
|---|---|
| `fleet_register_built_set_is_frozen` | E2 garde (3) liste ; E6 garde (1) note scannée + garde (6) consommation `/fleet` ; freeze (built=4, upcoming=12) |
| `wiring_test_roots_exclusion_is_declared` (**nouveau**) | E3 : ⇔ roots↔rationale + exclusion `packages/*/test` documentée |
| `site_renders_only_committed_data — wiring.note is digit-free …` (**nouveau**) | E6 : `note` de chaque built scanné digit-free (`scanText` + `/[%\d]/`) |
| `ci_gates_blocking_no_continue_on_error` (test 38) | D9 septies (4ter) : présence littérale `':(exclude,glob)docs/**/*.md'` |
| `series_pinned_are_declared_and_hashed` | D9 septies : whitelist `NON_SERIES_GLOB` du pathspec docs (M11 intact) |

---

## 5. Mutants (attendu / mesuré / sha de restauration) — tous rejoués par backup/restore

| # | Mutant | Attendu | Mesuré | Restauration (sha LF) |
|---|---|---|---|---|
| E2-a | `integration_test: []` (Shōgen, `fleet.ts`) | rouge | ✖ `fleet_register…` (min 1) | `388b64e8…` ✔ |
| E2-b | `integration_test: [""]` | rouge | ✖ `fleet_register…` (regex id nu) | `388b64e8…` ✔ |
| E2-c | `integration_test: ["no_such_test_xyz"]` | rouge | ✖ `fleet_register…` (declRe) | `388b64e8…` ✔ |
| E6 | un chiffre dans `wiring.note` (Shōgen) | rouge | ✖ `site_renders…wiring.note` **et** ✖ `fleet_register…` (garde 1) | `388b64e8…` ✔ |
| E3 | `packages/hikae/test` ajouté à `WIRING_TEST_ROOTS` sans rationale | rouge | ✖ `wiring_test_roots_exclusion_is_declared` (⇔) | `0373ad45…` ✔ |
| C-11 vi / garde (6) | supprimer le rendu `{a.wiring.note}` sur `/fleet` | rouge | contrôle vert (rendu présent) ; ✖ `fleet_register…` (rendu retiré) | `de4b1aea…` ✔ |
| D9 septies | retirer `':(exclude,glob)docs/**/*.md'` de `ci.yml` | rouge | ✖ `ci_gates_blocking…` (test 38) | `11eda432…` ✔ |

Battery entièrement re-jouée sur l'arbre **final** (après correction du faux-vert garde (6) et de l'en-tête `fleet.ts`) ; chaque sha de restauration ci-dessus **égale** son sha du tableau §2.

**Faux-vert corrigé (auto-détecté par mutant)** : la garde (6) initiale matchait `/wiring\.note\b/` — le **commentaire** de `/fleet` contenait aussi « wiring.note » ⇒ retirer le rendu laissait le test VERT. Corrigé en `/wiring\.note\s*\}/` (ferme d'expression JSX, absente de la prose) ; re-mesuré : contrôle vert, mutant rouge. (D'où le sha `0373ad45…` de `ci-gates.test.ts` après correction.)

---

## 6. Sorties chiffrées des gates (mesurées sur la base fusionnée `ac04d41`)

| Gate | Commande | Résultat |
|---|---|---|
| CI | `npm run ci` (gate:vocab + typecheck + test) | **328 pass / 0 fail**, exit 0 ; `gate:vocab OK — 156 file(s)` ; `tsc --noEmit` 0 erreur |
| Lint | `npm run lint` | exit 0 |
| Ratchet | `npm run lint:ratchet` | **69/69** |
| Langue | `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | `0 non-exempt French hit` (`site [GATED]`) |
| Export | `npm run export:check` | `0 forbidden path, 0 non-exempt French hit` |
| Vocab | `npm run gate:vocab` | `no forbidden claim` |
| Build | `cd apps/site && npx next build` | `Compiled successfully` ; `Finished TypeScript` ; 13/13 pages (dont `/fleet`) ; exit 0 |

> `next build` **n'est pas** dans `ci.yml` (mesuré : g3 = `gate:vocab && typecheck && test`, g4 = `lint && lint:ratchet`). Il est néanmoins lancé ici car `board.tsx` et `fleet/page.tsx` (TSX) ne sont typecheckés par **aucun** autre gate (racine `tsconfig.json` n'inclut pas `apps/site/**`).

---

## 7. R-25

- **Mon lot** — commande exacte `ci.yml:52` (nouvel ensemble d'exclusions, incluant `docs/**/*.md`), working tree vs base `lot/etude-suite` :
  `git diff --shortstat lot/etude-suite -- . <exclusions>` ⇒ **7 fichiers, 228 insertions + 44 deletions = 272** lignes < 1 205. (7 fichiers code/tests/ci ; `docs/adr/ADR-M003` et ce G1 exclus par `docs/**/*.md`/`docs/G1-lot-*.md`.)
- **D9 septies — oracle before/after de la PR d'intégration** `main...lot/etude-suite` (rejouable, `git diff --shortstat`, ins+del sous la gate, mesuré au SHA `3f69ef6`) :
  - **avant** (S2 + G1/G2 + lockfile + séries fixtures) = 20 678 + 399 = **21 077**
  - **après** (+ `docs/**/*.md`) = 8 737 + 392 = **9 129**
  - **chute = 11 948 lignes**, l'essentiel en docs. (La PR d'intégration reste > 1 205 : R-25 est **par lot** ; la borne d'intégration relève de la décision investisseur (a)/(b)/(c), ADR-EC D4 — hors périmètre.)
  - Note d'honnêteté (doc 03) : je cite **ma** mesure reproductible **21 077** (SHA `3f69ef6`) ; le « ~20 902 » du message de mission est un chiffre de contexte non re-mesuré par moi — non repris comme mien.
- **Glob D9 septies (mesuré, rejouable)** : `git ls-files -- ':(glob)docs/**/*.md'` ⇒ **230** (sommet `docs/*.md` **et** imbriqués `docs/adr/*.md`) ; bare `docs/**/*.md` ⇒ **73** (piège) ; `':(glob)docs/**/*.mjs'` ⇒ **13** (**non exclus**, code compté). `:(glob)` obligatoire.

---

## 8. Freeze (T2) — re-pin

`fleet_register_built_set_is_frozen` **n'a pas de sha de fichier gelé séparé** (mécanisme mesuré) : le gel EST le test — built = {Shōgen, Hikae, Ukemi, Narabi}, `upcomingCount === 12`, `builtCount === 4`, `package.json.description` « fleet: 4 agents built, 7 on the roadmap », + gardes (1)…(6). Re-pin effectué = le test passe avec la nouvelle forme `integration_test: string[]` + `note` + garde (6) ; **`upcomingCount` inchangé = 12** (aucun agent promu). Union discriminée `BuiltFleetAgent`/`UpcomingFleetAgent` (`wiring?: never`) inchangée : tout `wiring` sur un `upcoming` reste une erreur TS.

---

## 9. CA-11 / branchement (règle investisseur 2026-09-19)
- **Aucun `upcoming` promu** : built reste exactement 4, upcoming 12.
- **`note` branché** (pas de pièce non-branchée) : produit par `fleet.ts` (registre = source de vérité), **consommé sur un chemin servi** (`/fleet`, page rendue par `next build`, prouvée 13/13), couvert par un **test d'intégration non-LLM** (garde (6) `fleet_register…` : rendu absent ⇒ rouge ; mutant mesuré). `served_by`/`integration_test` restent métadonnées non rendues (tripwire (4)).
- **Preuve au niveau SORTIE servie** (pas seulement le source) : le rendu prérendu contient les notes — `grep "How each built agent is served" apps/site/.next/server/app/fleet.html` ⇒ trouvé ; `grep "feeds the served gate through the cascade seam" …/fleet.html` ⇒ trouvé (la note d'Ukemi est dans le HTML servi).
- **Choix de surface `note`** : rendu sur `/fleet` (liste sobre « How each built agent is served », un `<li>` par built), **pas** dans les panneaux bespoke (Shōgen/Hikae/Ukemi) — `shogen-panel.tsx` est **interdit** (lot E-honnêteté) ; texte seul, aucun composant nouveau (designer non convoqué, conforme à la mission qui supersède « rendu par le designer » d'ADR-EC/ADR-W1 (b)).
- **C-11 vi corroboré par le registre lui-même** : `PRODUCTS` place Ukemi en **sensor** (Firebreak « Ukemi reads the deleveraging queue » ; Softlanding « Ukemi reads the position ») — un lecteur amont qui **alimente** le gate, jamais un exécuteur ; le rendu board le dit désormais.

---

## 10. Items formés (déclencheur, jamais un « dû » nu) — zéro dette
- **Rendu `wiring.served_by`/`integration_test` verbatim** : reste **non fait, délibéré** (trou numérique : `served_by` porte des chiffres). Déclencheur : lot designer qui lèverait le tripwire (4) **et** ajouterait ces chaînes au scan numérique (ADR-W1 item (b)). E6 (note digit-free) est la voie retenue ici, **sans** lever le tripwire pour ces deux champs.
- **Étape h5 portant `attested`** (E1) : hors périmètre (lot **H-attested**), inchangé.
- **Bell R-25** (D9 sexies item formé) : câblage des pathspecs `apps/bell/test/fixtures/**` au **checkpoint-2 T-1a**, inchangé (hors périmètre).

- **`error_origin` du D9 septies (à trancher au G7, non hérité)** : l'addendum ADR-M003 D9 septies porte `error_origin = orchestrateur`, mais D9 septies est une **décision de politique investisseur (décision 25)**, pas la correction d'un oubli (contrairement à D9 quater/sexies) — il n'y a **pas d'erreur** à imputer. L'assignation (ou le retrait) d'`error_origin` relève du **G7** (discipline AgileGates) ; signalé, non tranché par le worker.

**Aucune procurement de papier requise** : tout est interne, mesuré dans le code/dépôt. Aucun `[2nd]` nu. Aucun contournement.

---

## 11. Provenance
Généré le 2026-09-19 par worker `claude-opus-4-8[1m]` effort `max`, contexte frais, worktree `F:\Monark-wt-eregistre` (`lot/e-registre`). Base finale `ac04d41` (ff-merge `lot/etude-suite`). **Contrôle de non-dérive de spec** : `git diff 3f69ef6 ac04d41 -- docs/adr/ADR-EC*.md` montre que le merge a changé la **ligne K-1** (décision 22) et **D4** (« R-25 PR d'intégration TRANCHÉE, décision 25, voie (b) : ADR-M003 D9 septies… porté par le lot E-registre ») — ce qui **confirme** mon périmètre D9 septies — mais **n'a pas touché** la ligne E-registre (E2/E3/E6/C-11 vi) ni la section Tuyaux contre lesquelles j'ai travaillé. Lecture préalable : ADR-EC (D1 E-registre, Tuyaux, MAST, C-11 vi), CHECKPOINT1-ADR-EC (C-3/C-5/P2), ADR-M018 (D1/D2), ADR-W1 (D1-D4, Tuyaux, item (b)), ADR-M013 (T2), CARTOGRAPHIE-P1 §2/§3, RAPPORT-PASSE-P1 §3.c. Advisor intégré consulté avant écriture (E3 structurel, note `%`, consommation garde (6), leg-mapping reproductible, next build obligatoire, exempt.json, D9 septies whitelist) — avis suivi. **R-20 : aucun commit, aucun workflow ; la sortie est vérifiable (R-21) par les commandes citées.** Le ff-merge est une mise à niveau de base explicitement autorisée par la mission (« git merge --ff-only lot/etude-suite si en retard »), pas un commit de mon travail.
