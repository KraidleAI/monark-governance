# ADR-M001 — Phase 0 (G0) : dépôt MONARK, langage, et gel des contrats d'interface
- **Statut** : **ACCEPTÉ-AVEC-CORRECTIONS** par le validateur-humain (checkpoint 1, 2026-09-04) → **corrections
  C1-C14 intégrées** → **quick-verify validateur OK (14/14 PASS, 2026-09-04)** → **implémentation Phase 0
  réalisée** (`F:\Monark`, CI verte : vocab + typecheck + **41 tests**) et **commitée** (`357ef25`, main, 0 remote).
  **Rendus (2026-09-04)** : revue G2 = **approuvé-avec-réserves** (réserves fermées/ratifiées ;
  `docs/adr/G2-review-M001.md`) ; verdict G7 orchestrateur = **ACCEPTÉ** (`claude-fable-5-1`, R-21 reproduit) ;
  checkpoint 2 validateur-humain = **accepté-avec-corrections** (4 corrections documentaires, appliquées).
  **Premier commit posé** : `357ef25` (2026-09-04, orchestrateur `claude-fable-5-1` seul, R-19/R-20 ; advisor
  pré-commit consulté, `npm ci` à frais prouvé). **Phase 0 close — zéro dette nue** ; pendant investisseur :
  ratification d'ADR-CERT-MONARK avant la Phase 3.
- **Provenance / Gate-0** : modèle worker résolu **`claude-opus-4-8`** (confirmé `/model`), effort `max`.
  **Advisor consulté** (canal intégré) : **deux bloquants-gel** (#1 objet-frontière Shōgen ; #2 verdict
  polymorphe) + **cinq cautions de conception** (#3 listes de champs Grok = input non lifté ; #4 le prédicteur
  n'a pas de contrat ; #5 `FORBIDDEN_KEYS` invariant ; #6 langage = décision G0 ; #7 emplacement du dépôt).
  **Traçage des sept** (C1) : #1→D3 · #2→D4 · **#3→D4 (`scores` optionnel, décision consciente) + D5b (taxonomie
  `reason` étendue en citant Grok comme input)** · #4→D6 · #5→D7 · #6→D2 · #7→D1. Aucun point advisor non tracé.
- **Rattachement (G0)** : `ROADMAP-MONARK.md` ; `ADR-CERT-MONARK-reconciliation.md` ; `hikae/VERDICT-TASKCLASS-GROK.md` ;
  `agent/HERMES-FONDEMENTS.md` ; Shōgen `temoignage_canonique.rs` + `verification.rs` ; Grok `hac-cp.ts`
  (**input de conception, jamais lifté**).

## Contexte
Phase 0 pose le squelette et **gèle quatre objets d'interface** (`AttestedPrice`, `Prediction`, `CoverageVerdict`,
`GateDecision`) + l'invariant `FORBIDDEN_KEYS`, partagés au fork (Phase 1). Un contrat gelé de travers se propage
aux trois tracks — d'où revue advisor **puis** validateur-humain **avant** toute ligne de `packages/contracts`.
Le feu vert investisseur (2026-09-04) couvre **la structure de dépôt** ; il ne couvre **ni** le langage **ni** la
forme des contrats — décisions G0 de cette ADR (jugées **ingénierie**, pas valeur, par le validateur : CA-2).

---

## Décision 1 — Emplacement, structure & **portée du dépôt** (C14)
- **Nouveau dépôt sibling `F:\Monark`** (convention `F:\Shogen`, `F:\Kraidle`). **PAS** de `git init` sur
  `F:\Clawpumptech` (179 docs de recherche + `biblio/` PDF). Les docs Clawpumptech **restent** à leur source ;
  ADR/roadmap y sont **copiés**.
- **C14 — Phase 0 est LOCAL-ONLY** : `git init` local, **aucun remote**, **aucun push**. La CI de Phase 0 tourne
  **en local** (le workflow `.github/workflows` existe comme artefact mais n'a pas de remote qui l'exécute). Un
  remote éventuel, post-Phase-0, sera **PRIVÉ** ; **rien de public avant le HARD GATE de Phase 3** (S2 sur données
  réelles). → **Pas de publication externe en Phase 0, donc pas d'escalade** ; borne à re-confirmer si un remote
  est ajouté.
- **Shōgen reste son propre dépôt** (`F:\Shogen`, Rust, **inchangé**) et expose sa sortie attestée comme frontière.
- **Structure `F:\Monark`** :
  ```
  packages/{contracts,hikae,ukemi,monark}   schemas/   docs/adr/   .github/workflows/   (vitrine/ → Phase 3)
  ```
- **Le fork (Phase 1)** = worktrees git de `F:\Monark` (HIKAE, UKEMI) + la session Shōgen. Contrats = la frontière.

## Décision 2 — Langage & outillage (décision G0 ; C13)
- **Flotte polyglotte** (source primaire) : Shōgen = **Rust** ; runtime Hermes/`claw-agent` = **Python**
  (~4 518 `.py` vs 1 743 `.ts` — `HERMES-FONDEMENTS §1`) ; HAC-CP Grok = **TS** ; vitrine = **web TS**.
- **Contrats = schema-first, langage-neutre** : source de vérité = **JSON Schema** (`schemas/`) ; **premier binding
  TS** (`packages/contracts`) ; Rust (Shōgen) et Python (middleware Hermes) **bindent au schéma**.
- **Moteur HIKAE en TS** : beachhead `btc-dir-15m` rapide, HAC-CP numériquement léger. **Consciente**, Rust possible
  plus tard. **Code = le nôtre, jamais lifté de Grok.** (Argument de livraison sous contrainte investisseur, pas un
  argument de revue — CA-10.)
- **Outillage (recon 2026-09-04)** : **npm workspaces** (npm **11.12.1** présent ; **pnpm absent** → on évite de
  provisionner un gestionnaire) ; **`node:test` intégré** (Node **24.15.0**, zéro dépendance de test) ; `typescript`
  + `ajv`/`ajv-formats` (validation JSON Schema) — **R-8 : versions registre vérifiées avant tout `npm add`**.
- **C13 — roster** : l'orchestrateur/planificateur MONARK est **`claude-fable-5-1`** (Fable 5.1, id catalogue
  courant, **sélectionné par l'investisseur via `/model` cette session**) ; workers **`claude-opus-4-8`**. **Ce
  n'est pas un changement de classe de roster** (l'orchestrateur reste Fable), donc **pas d'escalade** ; c'est une
  **mise à jour de currency** Fable 5 → 5.1. **Flag investisseur** : le CLAUDE.md et les définitions d'agents
  (`validateur-humain`, `advisor`, …) épinglent encore **`claude-fable-5`** — la propagation de la currency à ces
  fichiers **maintainer-owned** est laissée à l'investisseur (non modifiée ici).
- **Désambiguïsation « Hermes »** : Shōgen ADR-0023 « Hermes » = **Pyth Hermes** (prix) ; Grok « Hermes » = **Nous
  Research Hermes** (runtime). **Deux Hermes**, toujours qualifier.

## Décision 3 — `AttestedPrice` (résout #1 ; C2, C3, C4)
- **Ancré dans les types réels** de Shōgen : `Temoignage` (03 §1) + `Verdict` (`verification.rs`).
- **C2 — sémantique déclarée** : `AttestedPrice` est **émis uniquement après vérification `Ok(Verdict)`** — c'est un
  **témoignage vérifié**, jamais un témoignage brut. `octets_recalcules` est **bool OBLIGATOIRE** (miroir de
  `Verdict`, non optionnel). `residual` = **`Verdict.residus`** (résidus du témoignage **dans l'ordre émis**, puis
  `RESIDU_DE_LA_DELEGATION`) — **jamais agrégés en un niveau** (03 §2) ; c'est ce champ qu'héritera
  `CoverageVerdict.residual` (traçabilité).
- **C3 — trois champs source, décision explicite (aucune omission silencieuse)** :
  - `revision_amont_deleguee` → **inclus** (`verifier_revision`) : dit quel binaire a établi le verdict (provenance).
  - `empreinte_du_sens_emis` → **inclus** (`sens_emis_digest`, optionnel) : **précisément la donnée qui permet à
    l'adaptateur byte→prix de HIKAE de lier son interprétation au sens émis** (le trou S4 devient un point d'ancrage).
  - `transport_proof` → **exclu, justifié** : artefact de preuve opaque **déjà consommé par le vérifieur Shōgen** ;
    HIKAE est en aval de la vérification, il ne re-vérifie pas le transport.
- **Correction vocabulaire (roadmap)** : « résidus de **diversité** » est **faux** — `residual` = **identifiants
  d'hypothèses résiduelles de transport** (registre des assumptions). Corrigé en Sortie G0 (C12).
- **Forme** :
  ```
  AttestedPrice {
    schema_version: string
    subject: string
    attestor: { identity: string, key: hex }[]     # minItems 1, pas de doublon exact (C4)
    residual: string[]                              # = Verdict.residus, ordonné, minItems 1, uniqueItems (C4)
    transport: string
    utterance: { hash: hex32, bytes?: hex }         # hash = 32 octets, TOUJOURS ; bytes selon politique (ADR-0005)
    observed_at: { clock: string, instant: uint64 } # horloge du transport
    octets_recalcules: boolean                      # OBLIGATOIRE (C2)
    verifier_revision: string                       # ex-revision_amont_deleguee (C3)
    sens_emis_digest?: hex32                         # empreinte du sens émis, ancrage adaptateur HIKAE (C3)
  }
  ```
- **C4 — contraintes de schéma** miroir des refus du décodeur Shōgen : `attestor` minItems 1 + pas de doublon
  exact ; `residual` minItems 1 + uniqueItems + ordre porté ; identifiants **ASCII imprimables** (refus des
  caractères de contrôle) ; `hash` = **32 octets**.
- **Discipline** : aucun champ vérité / confiance / « validated » (Shōgen 03 §0 — Décision 7).

## Décision 4 — `CoverageVerdict` **polymorphe** (résout #2, #3 ; C5)
- Région de prédiction = **union discriminée** (geler la forme classification de Grok verrouillerait UKEMI dehors) :
  ```
  CoverageVerdict {
    schema_version: string
    task_class: string
    method: "split" | "hac-cp"                      # chemin d'extension régression : Décision 9 (C9)
    alpha: number                                   # couverture VISÉE (pas une proba de correction)
    n_calib: number
    region:
      | { kind: "set",      labels: string[], label_schema: string }   # classif : btc-dir, pm-yesno
      | { kind: "interval", lo: number, hi: number }                    # régression : cascade-VaR UKEMI
    qhat: number | null
    abstain: boolean
    reason: <littéraux nus, Décision 5b — C7>
    residual: string[]                              # hérité d'AttestedPrice.residual (traçabilité)
    scores?: number[]                               # OPTIONNEL (#3, décision consciente : payload)
    calib_digest: string                            # OBLIGATOIRE — recalculabilité par référence (C5)
    produced_at: string
  }
  ```
- **C5 — `calib_digest` déterministe cross-langage** : `calib_digest = hex( SHA-256( concat over scores triés
  ascendant de float64_be(s) ) )`, où `float64_be(s)` = les **8 octets IEEE-754 double, big-endian** de `s`. **Le zéro négatif
  est normalisé en +0** avant encodage (−0 et +0 diffèrent au bit de signe ; même multiset → même digest ; les
  binders répliquent). Tri ascendant = celui du quantile split-conformal. **Tous les champs bytes du JSON sont en `hex` minuscule** (hash,
  key, bytes, digests) — un seul encodage, pas de variante base64 à désambiguïser.
- **`scores` optionnel + `calib_digest` obligatoire** = miroir de Shōgen ADR-0005 (« hash toujours, octets
  optionnels »). **Sans `p_correct`** ni clé interdite (Décision 7).
- **Source** : forme Grok `hac-cp.ts:22`, **input** étendu (union de région, `calib_digest`, taxonomie) — non lifté.

## Décision 5 — `GateDecision` + taxonomie `reason` (C6, C7)
- **5a — `GateDecision`** (l'union NE fuit PAS — C6) :
  ```
  GateDecision {
    schema_version: string
    action: "commit" | "defer" | "abstain"
    allow: boolean
    tool: string
    intent: string | number | null                 # miroir de Prediction.yhat (C6) — string=classif, number=régr.
    verdict: CoverageVerdict
    remaining_budget: number                        # B_t — note H5/MONARK
    reason: <Décision 5b>
  }
  ```
  **Prédicat de containment par variante** (C6) : région `set` → `intent ∈ labels` ; région `interval` →
  `lo ≤ intent ≤ hi`. Raison neutre **`intent_not_in_region`** (remplace `intent_not_in_set`, classification-only).
  **Note H5 / MONARK** : `remaining_budget` = **capacité d'autorisation conforme restante** (B_t), **attribut de
  MONARK** (`ADR-CERT-MONARK`), **depletable**, **jamais un rendement**.
- **5b — Taxonomie `reason`, littéraux WIRE NUS (C7)** (la liste de 9 de Grok est **sa** flotte ; étendue amont
  Shōgen + aval UKEMI ; les préfixes ci-dessous ne sont **que documentaires**, la valeur sérialisée est **nue**) :
  - couverture : `covered` · `set_too_large` · `interval_too_wide` · `intent_not_in_region`
  - calibration : `under_calib` · `no_label_schema`
  - budget : `budget_exhausted` *(H5/H3 : le report achète du silence, pas de la couverture)*
  - horloge : `clock_expired` · `upstream_timeout`
  - amont attesté : `attestation_absent` · `attestation_refused` · `binding_broken` *(mappe `ErreurVerification`
    de Shōgen)*
  - évaluation : `non_evaluable`

## Décision 6 — `Prediction` : le 4ᵉ contrat (résout #4)
- Le prédicteur amont que HIKAE conforme a désormais un contrat. Pipeline complet : **prédicteur → `Prediction`
  → HIKAE conforme → `CoverageVerdict` → `GateDecision`**.
  ```
  Prediction { schema_version: string, task_class: string, yhat: string | number,
               predictor_id: string, produced_at: string, features_digest?: hex32 }
  ```
- **Phase 1 / btc-dir** : le label réalisé vient des deltas d'`AttestedPrice` ; ŷ **interne et déclaré**
  (`predictor_id: "internal:…"`) — **aucun UsePod lifté** ; le pont UsePod reste une option externe **nommée**.

## Décision 7 — `FORBIDDEN_KEYS` + **schémas fermés** (résout #5 ; C8)
- **C8 — enforcement PRIMAIRE = schémas FERMÉS** (`additionalProperties: false` sur les 4 contrats + sous-objets),
  **miroir du refus `CleInconnue` de Shōgen**. La blacklist devient **défense en profondeur**, appliquée
  **récursivement** sur les payloads imbriqués (on reprend `hasForbiddenKey` de Grok qui **récurse** — L551, et
  **non** `serializeVerdict` L541 qui ne teste que la racine).
- **`FORBIDDEN_KEYS` = union citée** : Shōgen 03 §0 (« pas de champ vérité, pas de score de confiance, pas de
  “validated” ») + Grok `hac-cp.ts:77` (`p_correct, confidence, hallucination_score, hallucination`). **Liste** :
  `p_correct, confidence, hallucination, hallucination_score, truth, verite, validated, valide, certainty, trust,
  score_de_confiance, verdict_de_verite`. Test qui **échoue** si une clé interdite est sérialisée (à tout niveau).

## Décision 8 — CI / gates & DevOps
- **Jobs CI bloquants** (G3/G4/G6) — **tels qu'implémentés** : `typecheck` (`tsc --noEmit`, strict — **tient lieu
  de `build`** pour une lib `noEmit`), `test` (`node:test`), **grep du vocabulaire interdit** (les **tournures de
  garantie** du 09 Grok : « 95 % correct », « anti-hallucination », « everlasting… »). **Précision (réserve G2 R1,
  ratifiée)** : les **`FORBIDDEN_KEYS` sont enforcées STRUCTURELLEMENT en runtime** (schémas fermés + garde
  récursif — plus fort, sans faux positifs), **pas par grep** ; **`lint` (eslint) est différé** à la passe DEVOPS
  (`tsc --strict` + gate vocab en tiennent lieu). **Discipline enforcée en code.** Gate d'intégration = **stub**.
- **R-8** : vérif registre **avant** tout `npm add`. Commits signés, actions épinglées (DEVOPS.md Grok décortiqué
  après Phase 0).

## Décision 9 — Politique d'évolution des contrats gelés (C9)
- Chaque contrat porte **`schema_version`** (sémver ; départ `1.0.0`). **Un contrat gelé n'évolue que par ADR.**
- **Chemin d'extension nommé** : l'enum `method` s'ouvrira aux méthodes de **régression** quand la cascade-VaR
  d'UKEMI arrivera (2ᵉ classe HIKAE) — p. ex. `"jackknife+"`, `"cv+"` (CP par intervalle, lecture L6) — via ADR.

## Note MAST (C10) — modes d'échec de la topologie Phase 0 → Phase 1
- **Désalignement inter-agents au fork** → **contre-mesure** : les contrats-frontière gelés (cette ADR) sont la
  seule vérité partagée ; aucun track n'invente un schéma concurrent (schémas fermés = rejet à la frontière).
- **Terminaison prématurée** (worker qui stage sans clore) → **contre-mesure** : la clôture n'est pas
  auto-déclarée (G2 + G7 + checkpoint 2 dus ; le worker ne committe pas).
- **Vérification incorrecte** (revue complaisante) → **contre-mesure** : G2 = instance séparée, contexte frais ;
  oracle CI non-LLM ; validateur-humain distinct.

---

## Ce que Phase 0 NE fait PAS
Le **fork** (Phase 1) ; le **moteur HAC-CP complet** (L1/L2/L3 + 7 tests) ; le **pilote S2** ; la **vitrine**.
Phase 0 = **le squelette et le gel**.

## Sortie G0 (critères de passage)
1. `F:\Monark` initialisé (workspace npm, structure D1) — **local-only, sans remote** (C14).
2. **4 contrats gelés** : JSON Schema **fermé** (`schemas/`) + binding TS (`packages/contracts`) + `FORBIDDEN_KEYS`
   récursif **enforcé en code** + un test qui **échoue** si une clé interdite est sérialisée à un niveau quelconque.
3. **CI verte en local** (typecheck/test/build/grep-vocabulaire).
4. **quick-verify validateur-humain** du diff ADR (C1-C14) OK ; puis, à la clôture Phase 0 : **revue G2 (instance
   séparée, contexte frais)** + oracle CI + **verdict G7 orchestrateur** + **acceptation validateur-humain
   (checkpoint 2)**. (C11)
5. ADR-CERT-MONARK + cette ADR copiées dans `F:\Monark\docs\adr\`.
6. **Pendants formés (C12, zéro dette)** : (a) correction roadmap « résidus de **diversité** » → identifiants
   d'hypothèses résiduelles ; (b) correction roadmap §1 « **trois** objets d'interface » → **quatre** ;
   (c) **ratification investisseur d'ADR-CERT-MONARK** (statut « proposé, à ratifier ») — D5 s'y adosse.

## Clôture (discipline worker)
Le worker (Opus 4.8) **implémente et stage** (`git init` + `git add`) ; **ne committe pas** (R-20 : premier commit =
**orchestrateur**). Le worker **ne déclare pas la clôture** : **G2 (contexte frais) → G7 → checkpoint 2** dus
**après** implémentation. Journal de provenance : **Gate-0 — modèle `claude-opus-4-8` (confirmé `/model`), max**.

## Alternatives écartées
- `git init` sur `F:\Clawpumptech` (embarque 179 docs + PDF) ; **mono-repo TS unique** (ment sur Rust/Python) ;
  geler `CoverageVerdict` classification-only (verrouille UKEMI) ; `AttestedPrice` prix+confiance (contredit le
  trou « sens émis » et 03 §0) ; blacklist **sans** schéma fermé (structurellement incomplète — C8).

## Addendum D9-bis — Erratum d'annotation des 5 contrats gelés (2026-09-10)
**Constat (Lot H1, checkpoint-2 ; RR-2 « gelé ≠ honnête »)** : les descriptions (`description`/`title`) des 5 artefacts gelés (`schemas/{attested-price,coverage-verdict,gate-decision,prediction}.schema.json` + `schemas/forbidden-keys.json`) sont en **français** sur une surface externe *English-only* (M004 D8) et **déjà publiques** (liste blanche d'export). Deux fautes de contenu : (a) `coverage-verdict` inverse la garantie centrale — « alpha = couverture VISÉE » alors que α est la **mis-couverture** (couverture = 1 − α ; formule committée `l1-split.ts:37` `q̂ = ceil((n+1)(1−α))`) ; (b) `gate-decision` nomme « le middleware **Hermes** » (collision R-P1 Q4 : ce Hermes est Vernier/Coroner, pas un appelant MONARK) et `prediction` porte « résout la caution advisor #4 » (bavardage interne dans un contrat public).

**Décision (Option A, investisseur 2026-09-10, après consultation advisor Fable 5.1)** — extension nommée de la Décision 9 : un **erratum d'ANNOTATION SEULE**, une fois, des 5 artefacts. Portée **strictement** limitée aux clés `description`/`title` ; **aucune** modification de `required`, `properties`, `type`, `pattern`, `enum`, `additionalProperties`, `forbidden_keys`, ni d'aucune clé de forme de données. Conséquences :
- **`schema_version` INCHANGÉ (`1.0.0`)** : une annotation est **inerte aux données émises** — aucun `AttestedPrice`/`Prediction`/`CoverageVerdict`/`GateDecision` sérialisé ne change, aucune fixture (`fixtures/*.gate-decision.json`, `fixtures_root_valid`) ni digest recalculable (`calibDigest`, `utterance.hash`, `sens_emis_digest` — tous sur la DONNÉE, jamais sur le fichier de schéma) n'est touché. Un bump signalerait faussement un changement de contrat de données et casserait les fixtures : donc **pas de bump**.
- **Re-baseline du manifest dans le MÊME commit** : `test/contracts-frozen.manifest.json` est régénéré pour les 5 fichiers modifiés ; le test `contracts_frozen` reste **VERT** contre le nouveau manifest — ce n'est **PAS une dérogation de porte** (R-22 intact), c'est une évolution par ADR au sens de la Décision 9. L'en-tête du test (qui dit « + schema_version bump ») est corrigé pour nommer le sous-chemin annotation-seule (pas de bump).
- **Contenu réécrit** : anglais ; `coverage-verdict` corrigé (α = mis-couverture, couverture = 1 − α, jamais « coverage level α ») ; `gate-decision` sans « Hermes » (nommage R-P1) ; `prediction` sans « advisor #4 » ; `attested-price`/`forbidden-keys` traduits en conservant la substance (aucun champ vérité/confiance ; projection d'un témoignage Shōgen vérifié ; union des deux disciplines de source).
- **Trou de porte fermé (même lot) — mécanisme réel (mesuré, corrige le brouillon)** : le scope `root` (où `classifyScope` routait `schemas/*.json`) **ÉTAIT déjà gaté** par le test 42 ; les 5 descriptions FR passaient parce qu'elles étaient **EXEMPTÉES** (5 phrases entières dans `scripts/lang-exempt.json`, non des identifiants). La vraie fermeture = **suppression de ces 5 phrases d'exemption** (sinon recoller du FR gelé resterait masqué) ; les identifiants gelés (`octets_recalcules`, `sens_emis_digest`, `verifier_revision`, `residual`, `temoignage`…) restent exemptés en `terms`. **Durcissement ajouté** : un scope dédié **`schemas`** dans `classifyScope`, gaté explicitement en ci/export (test 42 passe de `root,contracts,site` à `root,contracts,schemas,site`). **Mutant nommé** : FR injecté dans une `description` de schéma ⇒ test 42 rouge (exit 1) ; restauré byte-exact sha256.
- **Vérification** : G2 fraîche avec un mutant nommé « changer un `pattern` À CÔTÉ d'une description ⇒ le garde annotation-seule rougit » (preuve que le gel n'est re-basé QUE sur des annotations, jamais sur la forme de données). Re-export du miroir public après merge.
- **Non-régression** : `contracts_frozen` couvre toujours 5 schémas + `packages/contracts/src/**` ; `assertClosed*` et les enums inchangés (le code ne lit jamais `description`).

## Addendum D9-ter — Contrat 1.1.0 : évolution de forme des trois contrats de verdict, deux ré-épinglages du manifeste (2026-10-04)

**Constat** : la décision du fondateur du 2026-10-03, verbatim « Tout passer en 1.1.0. Toutes les empreintes changent, et il faut prévenir les appelants et republier la spécification. » (relayé par RECHERCHES, `recherches:coordination/messages/2026-10-03-RECHERCHES-vers-MONARK-contrat-1-1-0.md` l.8), et son go du 2026-10-04 sur la liste B groupée, verbatim « oui aux deux », font évoluer la **forme des données** de `Prediction`, `CoverageVerdict` et `GateDecision`. La Décision 9 exige un ADR : c'est l'ADR-CM, amendement daté « 2026-10-04 (3) » (B-11 amendée, B-17), qui énumère le format et la liste fermée des retraits et renommages.

**Décision** — extension nommée de la Décision 9, sur le modèle de D9-bis :
- **`schema_version` → `"1.1.0"`** pour les trois contrats de verdict, ensemble ; le serveur n'en parle qu'une, et refuse 1.0.0. Les trois contrats d'attestation (`AttestedPrice`, `AttestedFlow`, `AttestedBook`) et `forbidden-keys.json` restent à l'octet.
- **Décision 4 et C5** : `calib_digest` (sha256 des float64 big-endian triés) cède la place à `scores_sha256` (sha256 de l'écriture canonique des scores dans l'ordre déclaré) ; `calibDigest` sort de `packages/contracts` vers un outil de provenance hors contrat. Le chemin d'extension nommé de `method` s'ouvre à `risk-control`.
- **Deux ré-épinglages de `test/contracts-frozen.manifest.json`, chacun dans le même commit que son changement** (ce n'est pas une dérogation de porte, R-22 intact) :
  1. **bloc A (lot CM-3c-1)** : fichiers neufs sous `packages/contracts/src/` (`canonical.ts`, codes d'erreur, unités de q̂, types de ligne et de classe de la table de politique). Aucun fichier de `schemas/` ne change ; le compte de 7 schémas reste.
  2. **bloc C (lots CM-3c-2 et CM-3c-3)** : les trois schémas de verdict en 1.1.0, plus deux schémas neufs, `schemas/policy-row.schema.json` et `schemas/tool-error.schema.json` ; le compte de `test/contracts-frozen.test.ts` (l.71-75) passe de 7 à 9.
- **Porteur** : RECHERCHES, sur ouverture de zone nommée par MONARK pour `test/contracts-frozen.manifest.json` et le compte de schémas de `test/contracts-frozen.test.ts`, du bloc A à la fusion du bloc C ; contrôle par diff de MONARK avant chaque fusion.
- **Vérification** : à chaque ré-épinglage, `contracts_frozen` reste **vert** contre le nouveau manifeste ; G2 neuve avec un mutant nommé « modifier un fichier de la zone gelée sans ré-épingler ⇒ rouge ».
- **Non-régression** : `assertClosed*` couvre les nouveaux champs ; le test du site `frozen_contracts_count_is_derived` (`test/site-build-fleet.test.ts:529-545`) suit le compte du disque, et le site l'affiche à T0 seulement (la spécification publique n'a qu'une version datée).

- **Provenance** : texte proposé par RECHERCHES (`recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/TEXTES-ACTES-MONARK.md` §1, sha256 de la pièce dans son `SHA256SUMS`), relu et appliqué par l'orchestrateur MONARK le 2026-10-04 08:0x UTC.
