# Rapport de passe — MONARK — Passe P1 : branchement (« plus de pièces sans les brancher »)

- **Période** : 2026-09-18 → 2026-09-19
- **Objectif (G0)** : rendre le triangle attest → gate → act **servi et testé**, retirer les pièces non branchées, et
  rendre le registre public **honnête sur le branchement mesuré**. Mandat investisseur verbatim (ADR-M018, 2026-09-19) :
  « **grave une note importante, plus de dettes comme ça, plus d'oubli, on a créé des pièces sans les brancher** ».
  Rattachement : ADR-M017 (prise `attested`), ADR-M018 (règle de branchement + CA-11), ADR-M019 (retrait `crossAgentGate`
  + statut Ukemi), ADR-W1 (champ `wiring` + gel étendu), règle globale Branchement/Dettes.
- **Périmètre** : `apps/harness` (b1/b2), `packages/monark` (b3), `apps/site` (W-1) ; **0 octet** `schemas/`,
  `packages/contracts` sur toute la passe (diff mesuré, CHECKPOINT2 b1/b2/b3/W-1).

**Provenance (G1 — R-1/R-20/R-21).** Rédacteur worker, modèle résolu **`claude-opus-4-8[1m]`** (Opus 4.8 1M, épinglé,
effort max ; `claude-opus-5` banni ; pas de tier nu). Dépôt `F:\Monark`, branche `lot/etude-suite`, HEAD **`e447adf`**
(`git rev-parse` vérifié). `git status` = 1 fichier modifié **hors périmètre P1** (`docs/adr/ADR-B0-programme-bell.md`,
chantier Bell). Aucun commit, aucun workflow (R-20). Chaque chiffre porte sa source (fichier) ; aucun recalcul libre ;
aucun `[2nd]`. Réviseur attendu : validateur-humain au **checkpoint-2 de clôture** (le verdict G7 de passe reste à
l'orchestrateur, §5). memstack injoignable cette session (consigné, non requis : sources locales).

## 1. Réalisé

### 1.1 Lots livrés (gel → G2 → checkpoint-2 → G7 → fusion) — mesures, jamais impressions
| Lot | Portée | Gel worker → checkpoint-2 | G7 clos | Fusion `lot/etude-suite` | Oracle `npm run ci` | R-25 (portée) |
|---|---|---|---|---|---|---|
| P1-b1 | prise `attested` optionnelle, projection, `attestation-binding.ts`, phrase (iv), tests (1)(2)(4)(6) | `149b535` | `44a121c` | `f248907` | **289/289** (CHECKPOINT2-b1) | +259/−35, churn 294 (G1-p1b1:29) |
| P1-b2 | couture `attested.residual → verdict.residual`, M012 (i), tests (3)(5), re-pin h5 | `f25eb6d` → `0527419` | `079c9a8` | `61079c0` | **292/292** (289 b1 + 3) (G1-p1b2:114) | +137/−16 code+test, churn 153 (G1-p1b2:30) |
| P1-b3 | retrait `crossAgentGate` + 4 types + test 30 (3 blocs) + `@monark/{ukemi,hikae}` de `packages/monark` | `0a21718` → `8de6ef9` | `82387fe` | `c86e98e` | **292→289** (−3 = 3 blocs) (G1-p1b3:32) | +21/−269, net −248 (G1-p1b3:32) |
| W-1 | champ `wiring` (union discriminée), gel étendu, prose vitrine ×5, `fleet.ts:70`, panneau Ukemi lit le registre | `b1594c4` → `3e0a150` | `bb252ce` | `ccbb856` | **289/289** (compte inchangé : gel étendu) (G1-w1:88) | +166/−22 code (G1-w1:32) ; +149/−20 code-seul (G2-w1) |

Cartographie de clôture livrée `e447adf` ; journal `eb0b7e5`. **Oracle final à la clôture : 289/289** (W-1 + cartographie).
Étendue de la passe : **56 commits** `a814973..e447adf` (`git log --oneline`). R-25 : chaque lot < 1205 (< ~400 estimé),
revoyable séparément. **Verdicts** : checkpoint-1 M017 = ACCEPTE-AVEC-CORRECTIONS (2 rounds C-1..C-11 puis C'-1..C'-8,
confirmation K-C légère `fe83ea2`) ; **checkpoints-2 b1/b2/b3/W-1 = ACCEPTE-AVEC-CORRECTIONS ×4** (« Prêt pour le lot
suivant : OUI » à chacun) ; G2 par lot = APPROUVÉ (b1) / APPROUVÉ-AVEC-CORRECTIONS (b2, b3, W-1), relecteur `claude-opus-4-8[1m]`
contexte frais ≠ générateur.

### 1.2 Ce qui est branché maintenant vs avant (câblé / fixture / absent — cartographie ADR-M018 D4, §2/§5)
| Paire | Avant (2026-09-18) | Après (2026-09-19) | Preuve / test nommé |
|---|---|---|---|
| `attest → gate` | **ABSENT** (`gate` sans slot `AttestedPrice` ; `attest` terminal) | **CÂBLÉ (servi)** : clé `attested`, `attested.residual → verdict.residual` à travers `registry.run` | `gate_attested_concordant_files_residual` (`gate.test.ts:702`). **Fil MCP h5 sans `attested`** (E1) |
| `cascade → gate` (Ukemi) | « tuyau » seulement via `crossAgentGate` test-only | **CÂBLÉ (servi), vacue** : `abstain/under_calib`, contenu sans influence | `probe_harness_records_real_decision` + `vacuity-replay.mjs` (digest décision unique ×3) |
| `crossAgentGate` (Shōgen+Hikae+Ukemi en 1 appel) | **test-only** (appelé par son seul test 30) | **ABSENT (retiré b3)** — `grep = 0` | supprimé `0a21718` ; `packages/monark` = 2 adaptateurs + CBOR, dép `@monark/contracts` seul |
| Narabi `run → publiés → /narabi` | built+déployé T=0, sans `wiring` déclaré | **PUBLIÉ (snapshot)** + `wiring` déclaré | `narabi_live_parses_real_state_shape` (`narabi-live.test.ts:45`) |
| Registre `fleet.ts` | 4 built **sans** déclaration de branchement | **`wiring` (union discriminée) sur chaque built**, gelé | `fleet_register_built_set_is_frozen` étendu (`ci-gates.test.ts`) |
| Vitrine | « built **end to end** » ×4 + « the cross-agent gate » ×1 (faux après b3) | **0 sur `apps/site`** : « built and served **piece by piece**, composed on the gate path » | grep « end to end / cross-agent » = 0 (CHECKPOINT2-W1, cartographie §3) |
| `gate → act` (couche act) | ABSENT (aucun outil n'exécute) | **ABSENT (inchangé)** — couche act **upcoming** | `gate` never executes (SKILL:10, D0 no-trade) ; dépiction backbone README:98, pas un tuyau servi (cartographie §3) |
| Token ↔ `B_t` / gate | ABSENT | **ABSENT (inchangé)** | CA affichée ; `B_t` porté par l'appelant et échoyé par le gate, jamais déplété côté serveur (probe (4d), cartographie §2) |

Note d'honnêteté : `attest → gate` est **couvert** par le test (3) à travers `registry.run` ; le fil MCP h5 ne porte pas
encore `attested` (E1). L'union `UpcomingFleetAgent { wiring?: never }` rend tout tuyau sur un upcoming **interdit à la
compilation** (TS2322, mutant m4 rouge, G2-w1) — pas seulement testé.

### 1.3 État du registre public après W-1 (ADR-M018 D2 ; cartographie §3)
**4 built, chacun avec `wiring` mesuré et gelé** : Shōgen (`attest → gate`, test (3)) ; Hikae (`gate` btc-dir/stable-run/BYO,
`probe_harness_records_real_decision`) ; Ukemi (`cascade → gate`, « abstains under_calib by construction », même probe) ;
Narabi (`/narabi/` + `fromAttestedFlow → gate`, `narabi_live_parses_real_state_shape`). **12 upcoming, aucun tuyau revendiqué**
(7 agents : Mokugeki, Kaihi, Kessai, Kamae, Kyokusen, Koyomi, Genkan ; 5 produits : Firebreak, Warden, Softlanding, Verdict,
Ballast). Compte public README:40 = « 4 built · Narabi runs · **7 named** » (les 7 agents ; les 5 produits comptés à part) —
à ne pas confondre avec les 12 entrées `upcoming` du registre. `fleet.ts:70` : « verified » → « attested ».

### 1.4 Règles apprises cette passe (CHANTIERS §F/§G — à ne plus enfreindre)
- **Tout fold post-gel re-sha le G1 dans le même commit** (adoptée après **récidive b2→b3**, K-C2-2 puis K-C2-b3-4).
  Vérifiée appliquée à la clôture : W-1 « sha G1 8/8 re-calculés dans le même passage » (CHECKPOINT2-W1) — **pas de 3ᵉ récidive**.
- **Ne jamais ratifier un tuyau vers un contrat gelé sans lire le vérificateur du contrat** (`verification.rs`) : toute
  adjudication d'orchestrateur touchant un contrat = lecture de source d'abord (issue de l'adjudication U-1 infondée, §2.1).
- Montage G2/checkpoint : **jamais de jonction `node_modules` vers le dépôt réel** (masque les mutants inter-paquets) ;
  reconstruire (G2 b3 O1, `error_origin` orchestrateur).
- Freeze K-C : aucun commit sur la branche gelée pendant un checkpoint ; procurement signalé avant production ; clé/secret jamais dans le chat.

### 1.5 Modes MAST observés (checklist de risque résiduel — doc 06 §6.4 : 14 modes, 3 catégories ; ADR-M017 D6 en nomme 4)
- **Spécification / conception système** : prémisse fausse « Ukemi non consommé » portée par ADR-M017:135 et ADR-M018:22,
  non confrontée à la trace avant b2 (K-C2-3) ; dérive contrat ↔ enveloppe que `tool_schema_equals_frozen_schema` ne couvre
  pas pour `attested` (contrée par test (1)) ; région `label_schema:"up|down"` sur classe numérique (E9).
- **Désalignement inter-agents** : montage G2 par jonction `node_modules` masquant les mutants inter-paquets (O1) ;
  divergence G2/validateur sur Narabi tranchée au checkpoint-2 (K-V1) ; adjudication U-1 sans lecture de source.
- **Vérification des tâches** : surclaim de liaison (« verified » pour « declared » — contré par le mutant (4) et le scrub
  PROBATIVE) ; faux-rouge de la garde (3) sur titre suffixé (mutant propre m6 du validateur, **non vu par G2**, K-V1) ;
  trous de gardes A1/A2 fermés en W-1 (C1/C2). Correctifs tactiques « insuffisants » sans changement structurel : ici
  l'oracle non-LLM (289/289) et l'union discriminée encodent l'invariant, au-delà d'un test runtime.

### 1.6 Ce qui suit (nommé, non promis)
Feuille de route proposée, **à valider par l'investisseur** (CHANTIERS §G) : ADR-M020 « Ukemi au paroxysme » (mode L,
classe calibrée influençant la décision) — checkpoint-1 déjà **approuvé-avec-corrections** (`3a48c88`), U-1 recorder du book
après W-1 + ADR de contrat `AttestedBook` ; ADR-B0 « MONARK Bell » (TSV) — checkpoint-1 approuvé-avec-corrections, T-1 après
P1/W-1 ; **lot K-1 clés Ed25519** (Narabi sert `attestor.key:"deadbeef"`) avant tout `built` de sentinelle. Aucun n'est clos ici.

## 2. Gates
| Gate | État | Preuve |
|---|---|---|
| G0 cadrage | OK | ADR-M017/M018/M019/W1 acceptés ; checkpoints-1 M017 (C-1..C-11, C'-1..C'-8), ADR-M020/B0 checkpoint-1 |
| G1 provenance | OK | journal `docs/JOURNAL-PROVENANCE.md` (entrées P1-b1/b2/b3, W-1) ; G1-lot-p1b{1,2,3}, G1-lot-w1 (sha, oracle, mutants) |
| G2 revue 100 % | OK | relecteur `claude-opus-4-8[1m]` contexte frais ≠ générateur : G2-p1b1 (APPROUVÉ), G2-p1b2 (K-b2-1), **G2 b3 non persisté en fichier séparé** (verdict au commit `8de6ef9` + journal — §2.1 et item formé §3.c), G2-w1 (C1..C4) |
| G3 vérification auto | OK | oracle re-exécuté à chaque checkpoint-2 : 289/292/289/289 ; lint 0 ; ratchet 69/69 ; export:check OK ; `next build` 13/13 |
| G4 métriques archi | OK | §4 (numstat par lot ; ratchet 69/69 stable) |
| G5 dette | OK | §3 (items formés à déclencheur ; 0 procurement) |
| G6 compliance | OK (mesuré) | lint 0, export:check OK, ratchet 69/69, gate:vocab 0 claim ; `git diff --name-only a814973..e447adf -- '*package.json' package-lock.json` = `packages/monark/package.json` + `package-lock.json` **seuls** (b3 **retire** `@monark/{ukemi,hikae}` ; **0 dep ajoutée**, R-8) ; SBOM/licences inchangés (0 octet `packages/contracts`). **Veille CRA UE / ENISA non ré-vérifiée par ce rapport documentaire** → orchestrateur au G7 de clôture (déclencheur nommé) |
| G7 verdict | en attente | rendu par l'orchestrateur seul (§5) ; les G7 **par lot** sont clos (§1.1) |

### 2.1 Corrections avec `error_origin` (checkpoints/G2 — tableau récapitulatif)
| Origine | Items | # |
|---|---|---|
| **planificateur** | K2-1 (D6 gate:vocab faux) ; K-b2-1 (clause D4(5) fausse) ; K-C2-3 (prémisse « Ukemi non consommé ») ; K-C2-b3-2 (déclencheur item (1) tiré non traité) ; K-C2-b3-1 (½, prose ×5) ; K-V1 (½, pointeur Narabi) ; ADR-M019 D5 (retrait `@monark/hikae` + `description`, portée non tracée) | 7 |
| **orchestrateur** | K2-3, K2-5 (statut/ordre de fusion) ; K-C2-1 (G2 non persistés) ; **K-C2-2 (sha G1 périmé — récidive 1)** ; G2 b3 O1 (jonction `node_modules`) ; K-C2-b3-3 (fondement D4 inexistant) ; **K-C2-b3-4 (sha G1 périmé — récidive 2)** ; K-C2-b3-5 (mentions pré-D4) ; W-1 fold G7 (statut ADR) | 9 |
| **worker** | K2-2 (commentaire openapi faux) ; W-1 C1..C4 (gardes 5/4, Narabi « fresh pull », jumeau « verified ») ; K-V1 (½) ; K-V2 (README « verified » hors scope grep) | 7 |
| **générateur** | K-C2-b3-1 (½, 5 occurrences vitrine manquées au grep) | 1 |
| **processus** | K2-4 (section Tuyaux absente — règle ADR-M018 postérieure) | 1 |

*(# = mentions ; **23 items distincts**, 2 partagés à deux origines comptés ½+½ : K-C2-b3-1 planificateur+générateur, K-V1 worker+planificateur.)*

**Récidives** : sha G1 périmé après fold, **b2 (K-C2-2) puis b3 (K-C2-b3-4)** — corrigée par la règle §1.4 (re-sha dans le
même commit), **pas de 3ᵉ occurrence** (W-1). **Adjudication infondée U-1** (chantier Ukemi, en fenêtre) : « Temoignage sans
`attest` » — le vérificateur Shōgen exige Constat compagnon + résidus au registre ; `error_origin` **orchestrateur** →
règle §1.4 (lire le vérificateur avant tout tuyau vers un contrat gelé). **Incidents outillage** : `8cd5d32` (`.commitmsg`
parasite, erreur d'outillage orchestrateur, retiré) ; crash cp1252 laissant `gate.ts` muté au G2 b2, restauré par `git show`
(divulgation R-21). **Checkpoint-1 M017** : 19 corrections pliées **avant tout code** (`a40c169→fe83ea2`), origine non
tabulée par colonne dans `CHECKPOINT1-M017.md` (comptées à part, non fondues dans le tally 5-voies).

## 3. Clôture zéro dette (obligatoire — un dû nu = passe non close)
### 3.a Demandes de procurement formées
**Aucune pour P1** — tout est interne et mesuré dans le dépôt (ADR-M017/M018/M019/W1 « Procurement : aucun »). (Les
procurements du chantier Ukemi/Bell appartiennent à ADR-M020/ADR-B0, hors P1.)

### 3.b Recherches de solutions académiques (choix/blocages)
**R1 — hygiène de dépendances (E5, mutant `@monark/ukemi` réimporté reste vert par hoist workspace)** : recherche jointe,
R-8 respecté, 3 options mesurées (cartographie §4) — (a) test root zéro-dépendance « deps déclarées ⊇ `@monark/*` importés »
(recommandé, aucune dep nouvelle) ; (b) `eslint-plugin-import` (ABSENT ⇒ procurement R-8 avant install) ; (c) `knip` (ABSENT).
Non implémenté par ce worker (R-20). Déclencheur : prochaine cartographie / décision d'outillage.

### 3.c Items formés (déclencheur nommé, jamais un « dû » nu — ADR-M018 D3)
| # | Item | Déclencheur |
|---|---|---|
| E1 | Étape h5 portant `attested` (fil MCP ne prouve pas la prise) | Premier appelant réel, ou prochain lot `apps/harness` (T-1 / U-4) — ADR-M019 (1) |
| E2 | Registre : 1 `integration_test` pour N jambes (Hikae, Narabi) | **FERMÉ par E-registre `bd3fa0a` (checkpoint-2 2026-09-19)** |
| E3 | Garde (3) `TEST_ROOTS` sans `packages/*/test/` (exclusion non documentée) | **FERMÉ par E-registre `bd3fa0a`** (`wiring_test_roots_exclusion_is_declared`) |
| E5/R1 | Hygiène de dépendances absente | §3.b (recherche jointe) |
| E6 | Rendu de `wiring.served_by` (trou numérique : lever tripwire + ajouter au scan) | Lot **designer** (note honnête sans chiffre) — ADR-W1 (b) |
| E7 | « verified » surclaim rendu **×6** (`shogen-panel:51,:57`, `fleet-presentation:33`, `README:48,:111,:112`) | Lot **Shōgen-honnêteté**, avant toute nouvelle revendication du panneau Shōgen |
| E8 | `MONARK_PHASE` export mort (census 1) — mort **déclaré** (commentaire honnête) | Retrait, ou premier consommateur |
| E9 | Région `label_schema:"up\|down"` sur classe **numérique** `cascade-liquidable-24h` (octet servi malhonnête) | Prochain lot `underCalibVerdict`/`cascade` (U-4 / T-1) + re-pin h5 |
| E10 | Snapshot Narabi committé (T=0, 1 fenêtre) en retard sur le journal (T=1 live, `c4d05af`) | Re-capture + re-sha au prochain lot `apps/site` ou prochaine cartographie |
| — | G2 b3 non persisté en fichier séparé (verdict au commit `8de6ef9` + journal) | G7 de clôture (même classe que K-C2-1) |
| ADR-M017 | BYO + `attested` ; liaison temporelle `observed_at` ; table de liaison par nouvelle classe ; témoin vivant Shōgen/Mokugeki | Chacun nommé en Conséquences ADR-M017 ; témoin vivant gaté par « gap + calibrable » |
| ADR-M017 | Mise à jour skill/DEMO (`{prediction, params}` reste valide) | **Déclencheur non nommé dans ADR-M017 D3** → à assigner par l'orchestrateur au G7 de clôture (surfacé, non inventé) |
| K-1 | Clés Ed25519 (Narabi sert `attestor.key:"deadbeef"`) | Avant tout `built` de sentinelle / go U-6 / Bell T-1b (CHANTIERS §E) |

Aucun écart n'est une dette nue : chacun porte un déclencheur nommé ou une recherche jointe.

## 4. Métriques G4 (série de passe en passe — R-15)
| Métrique | Passe N−1 | Passe P1 (par lot, `git diff --numstat`, G1) | Tendance |
|---|---|---|---|
| Duplication nouvelle | non disp. (série R-15 ouverte à P1) | non mesurée séparément ; **lint-ratchet 69/69 stable** sur les 4 lots (non croissant, ADR-M017 D5) | stable |
| Churn (ajout/suppr par lot) | non disp. | b1 294 · b2 153 · b3 290 (net −248) · W-1 non consigné (G1-w1:32 : +166/−22) | — |
| Ratio refactoring/ajout | non disp. | b3 = **suppression pure** (net −248) ; W-1 additif ; b1/b2 additifs+tests | retrait > ajout net en b3 (mesuré) |
Aucun recalcul libre : colonne N−1 indisponible dans les sources de la mission ; série R-15 initialisée à P1.

## 5. Verdict final (G7)
**Rendu par l'orchestrateur seul, qui seul committe (R-20).** Ce worker ne rend pas de verdict de passe. Faits vérifiables
fournis : les **G7 par lot sont clos** (b1 `44a121c`, b2 `079c9a8`, b3 `82387fe`, W-1 `bb252ce`), oracle final **289/289**,
cartographie ADR-M018 D4 livrée (`e447adf`), §3 sans dû nu. La **clôture de passe P1** attend le **checkpoint-2 de clôture**
du validateur-humain (CA-11 branchement : registre « built » ⇔ chemin servi + test d'intégration) puis le verdict G7 de
l'orchestrateur ; le déclencheur skill/DEMO (§3.c) et la veille CRA/ENISA (G6) sont à assigner à ce G7.

## Adjudication orchestrateur avant checkpoint-2 de clôture (2026-09-19)
- Item ADR-M017 D3 « mise à jour skill/DEMO » sans déclencheur → **déclencheur assigné : lot Shōgen-honnêteté** (même lot que les six « verified » résiduels, `skills/monark/DEMO.md:86` déjà vrai ; la mise à jour de la description publiée du `gate` dans la skill suit le prochain re-pin h5, donc le premier lot `apps/harness` : T-1 ou U-4).
- memstack : ConnectionRefused sur toute la session (cache de connexion) ; à reconnecter au redémarrage, consignation des règles du jour due à ce moment.
- Verdict G7 de passe : rendu après le checkpoint-2 de clôture (validateur, contexte frais).
- Veille CRA/ENISA (G6) surfacée l.160 : **déclencheur assigné = audit d'entrée de la prochaine passe** (template corpus « audit d'entrée », dû à chaque passe ; item de compliance, pas de code).

## Corrections du checkpoint-2 de clôture (pliées au G7 de passe, 2026-09-19)
| # | Correction | Traitement | error_origin |
|---|---|---|---|
| C-1 | G2 de b3 non persistée | `docs/G2-lot-p1b3.md` persisté au G7 depuis la sortie du relecteur détenue par l'orchestrateur (contenu intégral, non perdu) | orchestrateur |
| C-2 | Origine « consigne G2 mono-test trop lâche » (journal W-1, orchestrateur) absente de la table §2.1 | Ligne ajoutée : K-V1 = worker + planificateur **+ orchestrateur** (consigne G2) ⇒ **24 items** (orchestrateur 10 / planificateur 7 / worker 7 / générateur 1 / processus 1, 26 mentions − 2 partagées) | rédacteur |
| C-3 | G6 « OK (mesuré) » avec veille CRA/ENISA reportée | Libellé rectifié : « OK **sauf** veille CRA/ENISA → item formé, déclencheur = audit d'entrée de la prochaine passe » | worker (libellé) + orchestrateur (report) |
| C-4 | « 12 upcoming, aucun ne déclare de tuyau, garanti à la compilation » inexact pour les 5 produits (`wiring: ProductWiring` = schéma de conception rendu sous badge upcoming) | Précision : garantie compile (`wiring?: never`) = les 7 agents seuls ; les 5 produits portent un schéma de conception, pas une revendication de chemin servi, et sont gelés par `fleet_register_built_set_is_frozen` | cartographe + rédacteur |
| C-5 | §3.c du template (« dette délibérée-prudente contractée par ADR ») réutilisé pour les items formés | §3.c : **aucune** dette délibérée contractée par ADR ; les items formés passent en §3.d avec un **propriétaire** chacun : E1 harness (orchestrateur, lot T-1/U-4) ; E2 registre (orchestrateur, prochain lot `fleet.ts`) ; E5/R1 hygiène de deps (orchestrateur, option (a)) ; E6 rendu wiring (designer) ; E7 « verified » ×6 (lot Shōgen-honnêteté, orchestrateur) ; E8 `MONARK_PHASE` (lot de nettoyage) ; E9 région numérique (harness, U-4/T-1) ; E10 snapshot Narabi (prochain lot `apps/site`) ; TEST_ROOTS (prochain lot `ci-gates`) ; K-1 clés (lot de flotte, avant tout `built` de sentinelle) ; skill/DEMO (lot Shōgen-honnêteté) ; CRA/ENISA (audit d'entrée) | worker |
| C-6 | Revue des livrables documentaires (rapport, cartographie) non explicitée | Précédent du dépôt : pas de G2 sur `CARTOGRAPHIE-code.md`, `RAPPORT-passe-m014`, `narabi-aci` ; la revue indépendante d'un livrable documentaire de clôture est le checkpoint-2 de clôture (validateur, contexte frais) ; déclaré ici | orchestrateur |
Observations O-2 (Ukemi `role:"act"` rendu comme nœud « acts » du gate-sim alors que son tuyau mesuré est amont `cascade → gate` ; couche act absente) → note de registre pour ADR-M020 / lot Shōgen-honnêteté ; O-3 E10 confirmé par GET live (timeline 2 lignes, T=1, snapshot T=0).

## Escalade posée à l'investisseur (non bloquante pour la clôture)
ADR-M018 D4 : « tout écart = dette … corrigée **avant toute nouvelle pièce** » ; or E1/E2/E5/E9/E10 sont formés vers des lots futurs alors que U-1a, T-1a et R-25-séries sont déjà lancés. Voies : (a) amendement daté de M018 D4 (« formé avec déclencheur » satisfait « corrigée ») — signature investisseur ; (b) les écarts bon marché (E5 test zéro-dépendance, E9 région neutre + re-pin h5, E10 re-capture du snapshot) atterrissent **avant** la fusion de U-1a/T-1a. Recommandation orchestrateur : **(b)**, lot « E-bon-marché » lancé immédiatement ; (a) réservé aux écarts coûteux (E1, E2, E6, E7).

## Verdict G7 de passe (orchestrateur, 2026-09-19)
**Passe P1 « branchement » CLOSE** : quatre lots clos (b1 `149b535`→G7 `44a121c`, b2 `0527419`→`079c9a8`/`8cd5d32`, b3 `8de6ef9`→`82387fe`, W-1 `3e0a150`→`bb252ce`), fusionnés dans `lot/etude-suite` ; oracle final 289/289 ; cartographie M018 D4 rejouée byte-identique par le validateur ; registre 4 built avec `wiring` mesuré, 12 upcoming ; aucune phrase publique fausse ; 24 corrections tracées par origine, deux récidives closes ; zéro dette nue (items formés avec propriétaire et déclencheur) ; aucun procurement. Mandat investisseur du 2026-09-19 satisfait pour la partie « brancher ce qui existe » ; la partie « corriger avant toute nouvelle pièce » est tenue par le lot E-bon-marché (E5/E9/E10) et l'escalade ci-dessus pour le reste.
