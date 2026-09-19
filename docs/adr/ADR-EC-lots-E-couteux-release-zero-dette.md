# ADR-EC — Lots « E-coûteux » : fermeture des écarts P1 avant release, cartographie générale, zéro dette
- **Statut** : **checkpoint-1 validateur `claude-fable-5-1` sur `6f0e8d9` : APPROUVÉ-AVEC-CORRECTIONS pour D1 (C-1..C-11 pliées ci-dessous) + ESCALADE-INVESTISSEUR sur D3/P3 (Q1-Q4, `docs/CHECKPOINT1-ADR-EC.md`)** ; plan approuvé par l'investisseur le 2026-09-19 (« ok plan »). Les quatre lots sont lançables après confirmation légère du validateur sur le SHA plié ; D3 attend l'investisseur.
- **Décision investisseur fondatrice (verbatim, 2026-09-19)** : « le prochain release doit sortir sans aucune dette, même pas un point virgule, cartographie générale avant release, on s'assure que tout fonctionne, tout est branché, aucune dette n'est laissée. » Complète la décision 19 (release gate zéro dette) et ADR-M018 D4 (cartographie à chaque clôture de phase).
- **Rattachement** : `docs/RAPPORT-PASSE-P1-2026-09-19.md` §3.c (items E1-E10 formés avec déclencheur), `docs/CARTOGRAPHIE-P1-2026-09-19.md`, ADR-M017 (D3 skill/DEMO, D4 tests nommés), ADR-M018 (D1 built ⇔ branché, D3 tuyaux, D4 cartographie), ADR-M019 (1) h5 `attested`, ADR-W1 (b) rendu `wiring`, ADR-M013 (régimes T0/T1/T2), ADR-M003 D9 (R-25), CHANTIERS §E.
- **Provenance** : rédigé par l'orchestrateur `claude-fable-5-1` le 2026-09-19 ; aucun code écrit ; mesures relues dans le code à HEAD `lot/etude-suite` `8c20ab4`. **Correction avant checkpoint-1 (même jour)** : la version `825a6bc` listait E5, E9, E10 comme ouverts — ils sont **fermés par E-bon-marché** (`4ffe553`) ; retirés ; `error_origin` orchestrateur (registre CHANTIERS §A relu trop vite).

## Contexte (mesuré à `8c20ab4`)
| Écart | Où (mesuré) | Nature |
|---|---|---|
| E7 « verified » surclaim ×6 | `README.md:48,111,112` ; `apps/site/components/shogen-panel.tsx:51,57` ; `apps/site/lib/fleet-presentation.ts:33` (`shogen-panel:63` = négation honnête, hors périmètre) | prose publique (Shōgen atteste l'origine et le hash, jamais la vérité — ADR-M017/M012 D4) |
| skill/DEMO (ADR-M017 D3) | `skills/monark/{SKILL,DEMO,INTEGRATION}.md` | description `{prediction, params}` + prise `attested` à décrire honnêtement |
| E8 `MONARK_PHASE` export mort | `packages/monark/src/index.ts:23` | constante sans consommateur (census 1) |
| E3 garde `TEST_ROOTS` sans `packages/*/test/` | `test/ci-gates.test.ts:637` | exclusion non documentée |
| ~~E5/R1 hygiène de dépendances~~ | **FERMÉ par E-bon-marché** (`test/deps-hygiene.test.ts`, oracle non-LLM, mutant m1, R-8 : plugin eslint absent = procurement, pas de dette) | — retiré de ce plan (erreur de l'orchestrateur à la rédaction, corrigée avant checkpoint-1) |
| CRA/ENISA (G6) | — | veille de compliance non faite (audit d'entrée, template corpus) |
| E2 registre : 1 `integration_test` pour N jambes | `apps/site/lib/fleet.ts` (Hikae, Narabi) | modèle `wiring.integration_test` scalaire |
| ~~E10 snapshot Narabi~~ | **FERMÉ par E-bon-marché** (`apps/site/lib/narabi-snapshot.ts`, fallback dev/test seul, live-match par GET) | — retiré |
| E6 rendu `wiring.served_by` (trou numérique) | `apps/site` (tripwire + scan) | note honnête sans chiffre, ADR-W1 (b) |
| E1 étape h5 portant `attested` | `apps/harness` (fil MCP `attest → gate`) | aucun appelant réel ne prouve la prise |
| ~~E9 région `up|down`~~ | **FERMÉ par E-bon-marché** (`gate.ts:313` : `NUMERIC_LABEL_SCHEMA`, « never `up|down` (E9) », re-pin h5, amendement ADR-M019 D2) | — retiré |
| K-1 clés Ed25519 | Narabi sert `attestor.key:"deadbeef"` (`apps/sentinel/src/flow.ts:52` ; aussi `scripts/record-usde-calib.mjs:58`) | placeholder public ; préalable U-6 / T-1b / tout `built` de sentinelle |

## Décision
**D1 — Quatre lots, chacun < 1 205 lignes R-25, un worktree chacun, worker `claude-opus-4-8` max, G2 fraîche + checkpoint-2 chacun, aucun registre `fleet.ts` modifié hors G7.**
| Lot | Contenu | Régime site (M013) | Ordre | Estimation |
|---|---|---|---|---|
| **E-honnêteté** (`lot/e-honnetete`) | **E7 ×6 exacts (C-2)** : `apps/site/components/shogen-panel.tsx:51,:57`, `apps/site/lib/fleet-presentation.ts:33`, `README.md:48,:111,:112` (`shogen-panel:63` est une négation honnête, **intouchée**) — formulation « attested testimony — origin and bytes, never truth », jamais « proven »/« certified » ; **oracle racine négation-aware (C-1)** `public_surfaces_make_no_probative_claim` (`test/`) : masque fermé des négations licites (`how/page.tsx:62`, `shogen-panel:63`, `DEMO.md:86` à adjuger) puis scrub `\bverified\b` sur README + `apps/site` + `skills/`, mutant « restaurer README:111 ⇒ rouge » ; skill/DEMO (M017 D3, scope `skills` = ADR-M006, `gate:vocab` + `lang:gate`) ; E8 retrait `MONARK_PHASE` (**partage `packages/monark/src/index.ts` avec U-1b-b déclaré : U-1b-b se rebase sur E-honnêteté**) ; **partage `README.md` avec U-1b-a (`:17,39,105,176`) déclaré : hunks disjoints, fusion auto attendue, vérifiée par merge-tree** ; (C-11 i) `scripts/lang-gate.mjs:114` SCOPES + `sentinel` et `bell` (apps exportés) + test 42 ; (C-11 iv) ADR-M009:124 « 47 % » → 49,1 % ; (C-11 vi) README:98 « acts (execute) » = couche upcoming nommée ; CRA/ENISA **(C-10)** : audit d'entrée = **lecteur Sonnet 5** (lecture réglementaire), question d'applicabilité du CRA formulée (échéance notification 11/09/2026 passée selon le template) → escalade compliance si applicable | **T0** (README/panel/présentation copie) | maintenant, ∥ U-1b-a | ≈ 220 l. |
| **E-registre** (`lot/e-registre`) | E2 : `wiring.integration_test: string[]` (min 1, chaque id `test("…")` grepé dans les racines de test ; `served_by` inchangé ; tripwire (4) inchangé) dans `fleet.ts` + garde (3) de `fleet_register_built_set_is_frozen` (`test/ci-gates.test.ts:637-660`) re-pinnée ; **E3 déplacé ici (C-5, même garde)** : test nommé `wiring_test_roots_exclusion_is_declared` (liste `TEST_ROOTS` ⇔ liste documentée ; mutant : ajouter `packages/*/test` sans doc ⇒ rouge) ; **E6 (C-3)** : champ rendu **distinct et digit-free** `wiring.note` (jamais `served_by`, qui porte des chiffres par construction), tripwire levé pour ce champ seul, mutant « un chiffre dans la note ⇒ rouge », rendu par le `designer` (W1 (b)) ; (C-11 vi) `apps/site/components/gate-sim/board.tsx:84` : Ukemi rendu sous « acts · execute » alors que son tuyau mesuré est amont `cascade → gate` — rendu corrigé | **T2** (`fleet.ts`) — commit `site[T2]` | maintenant, ∥ E-honnêteté (fichiers disjoints après C-5 : `fleet.ts`, `ci-gates.test.ts`, composant `wiring`, `board.tsx`) | ≈ 320 l. |
| **H-attested** (`lot/h-attested`) | E1 **(C-7)** : étape **7 `attested-gate`** de la trace h5 (`test/h5-trace-builder.ts:244`, consommant la sortie de l'étape 6 `attest`), fixture Shōgen committée ; assertion nommée `h5_carries_attested` : `verdict.residual` deep-equal `attested.residual`, décision sinon byte-identique à l'étape 5 ; re-pin `fixtures/h5-e2e-trace.json` (hors décompte D9 sexies) + `PROVENANCE-h5` same-dir ; `probe_harness_records_real_decision` rougit par construction si re-pin oublié | — (harness) | **après U-1b-a** (pas de croisement `packages/contracts`) ; sérialisé avec les autres lots harness (U-4 ensuite) | ≈ 350 l. |
| **K-1** (`lot/k-1-keys`) **(C-4)** | clé Ed25519 réelle du recorder Narabi : génération **sur le VPS** (jamais en transit ni dans le chat — P3, ESC-2 (a) à confirmer), clé publique committée + **fichier `/narabi/pubkey` produit par `apps/sentinel/src/run.ts` et servi par Caddy** (`handle_path /narabi/*`, RUNBOOK-sentinel:16 ; rewrite dev `next.config:19`) ; **`sig` HORS contrat gelé** (`AttestedFlow` est `additionalProperties:false` sans `sig`) : signature de `line_hash` portée par la ligne `timeline.jsonl` et/ou `state.json` — **0 octet sur `schemas/` et `packages/contracts`** ; `parseTimeline` (`apps/site/lib/narabi-live.ts`) accepte le champ + test (**T1**) ; oracle = signature vérifiée sur le **snapshot committé** (byte-exact), sonde live hors CI ; **re-capture du snapshot Narabi + re-sha dans ce lot** (le snapshot redevient périmé dès la première ligne signée) ; placeholder `deadbeef` : `apps/sentinel/src/flow.ts:52` (chemin corrigé) et `scripts/record-usde-calib.mjs:58` (à inclure ou déclarer historique) ; `no_secret_in_repo` étendu au motif de clé privée Ed25519 ; rotation `RUNBOOK-sentinel.md` ; Bell réutilise le motif (ADR-B0 D8, clé séparée) | **T1** (`narabi-live.ts` + test) | après E-registre (touche `apps/site`) | ≈ 350 l. |

**D2 — Cartographie générale pré-release (M018 D4)** : après atterrissage des quatre lots + U-1b-a sur `lot/etude-suite`, un worker en **contexte frais** produit `docs/CARTOGRAPHIE-PRE-RELEASE-<date>.md` : graphe réel (imports mesurés `madge`/grep + flux à l'exécution) de toutes les pièces, statut « câblé / fixture / absent » par paire, comparé au registre public (`fleet.ts`, README, site, skills) ; **tout écart = dette au sens de la règle Dettes, corrigée avant release** ; puis checkpoint validateur CA-11 sur la cartographie ; puis release (tag, miroir public via `release-public.mjs`). **(C-9)** La cartographie porte sur le **SHA candidat de release** ; **gel des fusions sur `lot/etude-suite`** entre cartographie, checkpoint CA-11 et tag ; toute fusion postérieure ⇒ nouvelle cartographie.

**D3 — Définition de « zéro dette » pour cette release** : CHANTIERS §E ne contient plus aucun item dont le déclencheur est antérieur ou égal à la release ; les items dont le déclencheur est postérieur (U-4, U-6, T-1b…) restent formés **et sont listés nommément dans les notes de release** comme « upcoming » avec leur déclencheur — jamais un « dû » nu. Items **hors de notre main** (ratifications D-ADJ / bFloor ; census Bell 839+395 + flux MWCB ; Helius ; VPS) : bloquants tant que non tranchés par l'investisseur ; la release ne sort pas sans.

**D4 — R-25 de la PR d'intégration** : hors de cet ADR (décision investisseur (a)/(b)/(c) due, BASCULEMENT §5.10) ; les quatre lots sont chacun sous 1 205.

## Tuyaux (ADR-M018 D3)
| Lot | Entrée | Sortie / consommateur servi | Test d'intégration non-LLM |
|---|---|---|---|
| E-honnêteté | prose | README, site, skill (surfaces publiques exportées) | `public_surfaces_make_no_probative_claim` (racine, négation-aware, README + `apps/site` + `skills/`), `export:check`, `gate:vocab`, `lang:gate` |
| E-registre | `fleet.ts` | site `/fleet` (registre servi), freeze test | `fleet_register_built_set_is_frozen` re-pinné (garde (3) liste + E3) ; `wiring_test_roots_exclusion_is_declared` |
| H-attested | fixture `AttestedPrice` (étape 6 `attest`) | étape 7 `attested-gate` → `gate` (prise `attested` consommée, `verdict.residual`) | `h5-e2e-probe.test.ts` : `h5_carries_attested` |
| K-1 | clé publique (fichier `run.ts`) | `/narabi/pubkey` servi par Caddy + `sig` de `line_hash` sur chaque ligne `timeline.jsonl` (état = sentinel, hors contrat gelé) | `narabi-live.test.ts` : signature vérifiée sur le snapshot committé re-capturé ; `contracts_frozen` 0 octet |

## Alternatives rejetées
- Tout fermer dans un seul lot : R-25 > 1 205 et deux régimes site mélangés. Rejeté.
- Reporter E1 à U-4 : laisserait un écart « avant release » ouvert ; U-4 est postérieur à la release. Rejeté (H-attested tiré en avant).
- Cartographie par l'orchestrateur : générateur = relecteur (règle §F). Rejeté : worker en contexte frais.

## Conséquences
- Positives : release avec CHANTIERS §E vide de tout item au déclencheur ≤ release ; registre public vrai (M018) ; clés réelles.
- Négatives (assumées) : 4 G2 + 4 checkpoints ; `fleet.ts` touché (T2) ; K-1 exige une action investisseur (clé privée sur le VPS, hors dépôt).
- Items formés : ratifications, census Bell, MWCB, Helius, VPS (investisseur) ; U-1b-b, U-2…U-7, T-1a-ii, T-1b…T-3 = upcoming, déclencheurs nommés dans CHANTIERS.

## Modes MAST et contre-mesures (C-6)
| Mode | Contre-mesure |
|---|---|
| Surclaim résiduel (« verified » réécrit en synonyme probatif « proven », « certified ») | oracle racine négation-aware (C-1), liste de jetons fermée, mutant |
| Dérive contrat ↔ sortie sentinelle (K-1 mettant `sig` dans l'enveloppe gelée) | `contracts_frozen` + 0 octet `schemas/`, `sig` hors contrat (C-4) |
| Faux-vert de garde (`integration_test: []` ou `[""]`) | min 1 + chaque id grepé dans les racines de test (E2) |
| Artefact mouvant h5 (re-pin oublié) | `probe_harness_records_real_decision` rougit par construction |
| Secret en dépôt (K-1) | `no_secret_in_repo` étendu au motif de clé privée Ed25519 ; génération sur le VPS |
| Terminaison prématurée (release avant cartographie du SHA candidat) | D2 (C-9) : gel des fusions cartographie → checkpoint → tag |
| Générateur = relecteur | un worker par lot, G2 fraîche par une autre instance, checkpoint-2 validateur |

## Items à déclencheur ≤ release non couverts par les quatre lots (C-11) — propriétaire, déclencheur
- (i) `scripts/lang-gate.mjs:114` SCOPES sans `sentinel`/`bell` alors que `apps/sentinel` est exporté — **E-honnêteté**.
- (ii) `SERIES_EXCLUDED_ROOTS` (`ci-gates.test.ts:995`) sans `apps/bell/test/fixtures` malgré `halts-reduced.csv` (déclencheur « checkpoint-2 T-1a » passé) + réconciliation same-dir ADR-B0 D7 (`docs/PROVENANCE-bell.md` absent) — **lot T-1a-ii** (3 pièces : pathspecs `ci.yml`, racine dans la source de vérité, PROVENANCE same-dir), avant release.
- (iii) Amendements ADR-B0 en notre main (conflation « Ondo 837,9 M$ » ; scission T-1a-i/ii datée ; sondes RPC en provenance) — **lot T-1a-ii** (ADR).
- (iv) ADR-M009:124 « 47 % » → 49,1 % — **E-honnêteté**.
- (v) Ratification **ADR-M018 D2** (texte proposé par ADR-M019 D3) — **investisseur** (Q3).
- (vi) `gate-sim/board.tsx:84` Ukemi sous « acts · execute » (tuyau réel amont) — **E-registre** ; README:98 — **E-honnêteté**.
- (vii) Décision R-25 (a)/(b)/(c) de la PR d'intégration — **investisseur** ; conditionne la release.

## Points à trancher (checkpoint-1) — escalade investisseur Q1-Q4 (`docs/CHECKPOINT1-ADR-EC.md` §3)
**Q1 (D3 vs décision 19)** : la décision 19 rend TOUT item §E bloquant ; D3 ne bloque que « déclencheur ≤ release » et nomme le reste comme upcoming. Items différés par D3 : durcissement `record.ts` (O1-O3, V-4) et run live sUSDe/USDe [avant go U-6] — alors que `apps/sentinel` est **exporté publiquement à la release** ; exemption vocab `cascade` [U-2] ; replay (l) T ≥ 7 (2026-09-26) ; lecture D3 J+30 (2026-10-18) ; M012 (g) T ≥ 30 ; K-0 Koyomi. Voies : (a) ratifier D3 par amendement daté de la décision 19 ; (b) dater la release après les déclencheurs calendaires et fermer les items de code (`record.ts`, `cascade`) avant ; (c) autre. Avis validateur : (a) cohérent avec la règle Dettes, mais « même pas un point virgule » + export public plaident pour fermer au moins `record.ts` avant release. **Q2 (P3)** : clé Ed25519 Narabi générée sur le VPS, publique committée + servie, orchestrateur déploie (motif ESC-2 (a) Bell) — à confirmer. **Q3** : ratifier ADR-M018 D2 (ADR-M019 D3). **Q4** : applicabilité du CRA à MONARK (échéance 11/09/2026 passée selon le template) — instruction par lecteur, décision investisseur si applicable.
- (P1) Formulation exacte de remplacement de « verified » (proposée : « attested (origin + bytes), never truth ») — validateur.
- (P2) E2 : liste `integration_test[]` vs un test unique agrégé par jambe — proposé : liste.
- (P3) K-1 : qui détient la clé privée (ESC-2 (a) : orchestrateur déploie, clé sur l'hôte) — déjà tranché pour Bell, à confirmer pour Narabi.
