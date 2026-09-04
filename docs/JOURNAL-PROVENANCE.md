# Journal de provenance — MONARK

Exigence : P4/R-9 (référentiel doc 02) ; assise NIST SSDF 800-218/218A, AI Act, CRA. **Une entrée par lot de
code généré.** Un artefact sans entrée ne s'intègre pas.

| Date | PR/commit | Modèle (identifiant épinglé exact) | Effort | Contexte fourni | Générateur (agent) | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-04 | Phase 0 — commit **`357ef25`** (main, local-only ; commité par l'orchestrateur `claude-fable-5-1`, R-20) | `claude-opus-4-8` | max | ADR-M001 + ROADMAP-MONARK + ADR-CERT-MONARK + VERDICT-TASKCLASS-GROK + HERMES-FONDEMENTS + sources Shōgen/Grok | worker (session, Opus 4.8) | G2 (worker Opus 4.8 distinct, contexte frais) | **approuvé-avec-réserves** |

## Lot Phase 0 — squelette & gel des contrats (`F:\Monark`)

### Gate-0 (R-1) — contrôle du modèle résolu
- **Worker** : modèle résolu **`claude-opus-4-8`** (sélection investisseur via `/model` cette session, confirmée
  par la sortie `/model`), effort **`max`**. Préfixe conforme au roster (Opus 5 **banni**).
- **Divergence de roster nommée (C13, NON résolue — flag investisseur)** : l'orchestrateur/planificateur de
  session est **`claude-fable-5-1`** (Fable 5.1, id catalogue courant listé par l'environnement, sélectionné par
  l'investisseur via `/model`) ; le `CLAUDE.md` et les définitions d'agents (`validateur-humain`, `advisor`)
  épinglent encore **`claude-fable-5`**. **Roster scindé sur deux versions Fable.** Les deux passes validateur ont
  résolu `claude-fable-5` (leur épinglage). Propagation de la currency aux fichiers **maintainer-owned** = décision
  investisseur, **en attente**. Question formée à porter au prochain contact investisseur.

### Consultations
- **Advisor (canal intégré, Fable 5)** — **pré-gel** : 2 **bloquants-gel** (#1 objet-frontière Shōgen ; #2 verdict
  polymorphe) + 5 **cautions** (#3 champs Grok = input ; #4 le prédicteur n'a pas de contrat ; #5 `FORBIDDEN_KEYS`
  invariant ; #6 langage = décision G0 ; #7 emplacement dépôt). Tracés dans ADR-M001 (en-tête). **Post-build** :
  7 points (schémas jamais exécutés → `ajv` dev-dep + test ; journal de provenance ; R-13 TODO ; `-0` dans
  `calibDigest` ; ligne ADR stale ; G2 worker-pinned ; ligne de handoff) — **tous adressés**.
- **Validateur-humain (Fable 5, `claude-fable-5`) — checkpoint 1** : **ACCEPTE-AVEC-CORRECTIONS**, liste fermée de
  14 items (C1-C14) → intégrés → **quick-verify OK (14/14 PASS)**. C13/C14 = non-escalade (C13 « sous réserve » :
  question investisseur formée, ci-dessus).

### Grok comme INPUT DE CONCEPTION (jamais lifté — licence/marque Grok)
Le code MONARK est **le nôtre**, réimplémenté. Fonctions dont la **forme** a inspiré (ancrage
`Downloads/grok 1/src/lib/hac-cp.ts`, **non copié**) :
- `CoverageVerdict`/`GateDecision` (formes L22/L46) → nos types, **étendus** : région polymorphe `set|interval`,
  `calib_digest`, taxonomie `reason` amont/aval, `schema_version`.
- `FORBIDDEN_KEYS` (L77) + `hasForbiddenKey` **récursif** (L551) → notre `findForbiddenKey`/`assertNoForbiddenKey`,
  **avec suivi de chemin ajouté** ; on reprend la **récursion** (pas le `serializeVerdict` racine-seule L541).
- `serializeVerdict` (L541) → nos `serialize*` **par contrat**, couplés au closed-check.
- discipline « pas de `p_correct` » / `calibDigest` → réimplémentés ; l'encodage float64-BE + normalisation `-0`
  est **notre** spec.

### Réductions & compléments documentés (vs ADR-M001 D2/D8)
- **`ajv`/`ajv-formats` = dev-dependencies (test-only)** — conforme à D2 (qui les nomme) : exécutent les 4 schémas
  gelés (compile + `$ref` + rejets C4). **Runtime = zéro dépendance** (closed-check hand-rolled = clé-fermeture ;
  contraintes de valeur dans le schéma, exercées par ajv en test). R-8 : `typescript@7.0.2`, `@types/node@24.13.3`,
  `ajv@8.20.0`, `ajv-formats@3.0.1` — versions registre vérifiées **avant** installation ; lockfile committé.
- **Différés à la passe DEVOPS** (D8) : `eslint` (`tsc --strict` + gate vocab tiennent lieu) ; SHA-pinning des
  actions CI + commits signés (avant tout remote).

### Oracle d'exécution (G3/G4/G6) — CI locale verte
`npm run ci` = **gate:vocab** (11 fichiers, 0 claim interdit) → **typecheck** (`tsc --noEmit`, strict) → **41 tests**
(`node:test`) **pass, 0 fail**. Inclut : rejet récursif des clés interdites ; refus des clés inconnues à chaque rang
(`CleInconnue`) ; **exécution des 4 schémas gelés** par ajv (rejets C4 : minItems, uniqueItems, hash 63c, caractère
de contrôle, résidu vide/dupliqué, `oneOf` région) ; déterminisme `calib_digest` + oracle cross-langage `[0,1]`.

### `error_origin` — assigné au G7 (2026-09-04, orchestrateur `claude-fable-5-1`)
**Origine de toutes les erreurs relevées en Phase 0 = le GÉNÉRATEUR (worker Opus 4.8)** — aucune n'a échappé au
livrable gelé ; toutes attrapées par les gates **avant** clôture :
- (i) **Planification** (checkpoint 1, corrections C1-C14) : 3 champs Shōgen omis silencieusement ; fuite de l'union
  set|interval dans `GateDecision.intent` ; `calib_digest` sans algorithme ; G2/MAST non nommés ; id de roster
  incohérent ; pas de `schema_version`.
- (ii) **Implémentation** (advisor post-build) : schémas jamais exécutés ; journal de provenance absent ; TODO nu
  (R-13) ; trou de canonicité `-0` ; ligne ADR périmée.
- (iii) **Outillage** (oracle) : interop CJS vs `verbatimModuleSyntax` ; `allowUnionTypes` ajv ; littéral de test
  caractère-de-contrôle ; runner dir-vs-glob.
**Aucune erreur d'origine source** (Shōgen/Grok) **ni réviseur.** Détection : validateur (i), advisor (ii), oracle
non-LLM (iii), G2 (M1-M8). Le système de gates a fait son travail : premiers jets défectueux, défauts attrapés.

### Verdict G7 (2026-09-04, orchestrateur `claude-fable-5-1`) — **ACCEPTÉ**, conditionnel au checkpoint 2
**R-21 reproduit, pas cru** : oracle re-exécuté à frais (vocab OK · `tsc --strict` · 41/41 · exit 0) ; réserves G2
prouvées sur artefact (M3 `enums.ts` + test de dérive ; M4 test end-to-end ; R1 ratifiée, source ≡ copie dépôt
par md5 ; R-13 = 0 TODO) ; R-20/C14 (38 staged à la R-21, **39** après persistance de la revue G2 · 0 commit · 0 remote). **Bornes de portée tranchées** : (a) roadmap
« résidus de diversité » corrigée ✅ ; (b) « trois → quatre » objets ✅ ; (c) **ratification investisseur
d'ADR-CERT-MONARK = pendant formé, adressé à l'investisseur, à ratifier AVANT la Phase 3** (ne bloque pas la
Phase 0 : `remaining_budget: number` est agnostique du token) ; **intervalle non borné** (JSON sans ±∞) = **choix
de conception**, cohérent avec le refus Hikae des ensembles infinis (`under_calib` plutôt que +∞) — UKEMI émet un
intervalle borné ou s'abstient, à nommer au contrat d'intégration Phase 1 ; **C13 résolu** (flip global).
**Pendants formés** (zéro dette nue) : (c) ci-dessus ; M5 `lo≤hi` (invariant producteur, Phase 1) ;
orchestrateurs projet en tier nu `fable` → `claude-fable-5-1` (par projet).

### État des gates
| Gate | État |
|---|---|
| G0 (cadrage/ADR) | ✅ ADR-M001 accepté-avec-corrections + quick-verify OK |
| G1 (provenance) | ✅ ce journal |
| G2 (revue 100 %, réviseur ≠ générateur, **contexte frais**) | ✅ **approuvé-avec-réserves** (Opus 4.8 distinct ; oracle reproduit + `calib_digest` re-dérivé en Python + non-lift confirmé ; R1 ratifiée dans l'ADR, M3+M4 fermés, M5→Phase 1) |
| G3/G4/G6 (oracle) | ✅ CI verte locale (vocab + typecheck + 41 tests + schémas ajv) |
| G7 (verdict orchestrateur) | ✅ **ACCEPTÉ** (2026-09-04, `claude-fable-5-1`, R-21 reproduit) — conditionnel au checkpoint 2 |
| Acceptation validateur-humain (checkpoint 2, livrable) | ✅ **accepté-avec-corrections** (2026-09-04, `claude-fable-5-1` ; 4 corrections documentaires, appliquées : revue G2 persistée `docs/adr/G2-review-M001.md`, en-têtes ADR-M001/ADR-CERT, README « coverage-controlled ») — **premier commit autorisé** |
| Commit | ✅ **`357ef25`** (2026-09-04, orchestrateur `claude-fable-5-1`, R-19/R-20) — après advisor pré-commit (lockfile prouvé par `npm ci` à frais : 14 paquets, CI 41/41) ; hook `gate-commit` passé ; **0 remote** (C14). Ancrage de provenance = commit suivant (R-25). |

### Résolution C13 (2026-09-04) — roster currency
Décision investisseur **« Global — flip Kraidle too »** : `claude-fable-5-1` propagé aux fichiers **globaux**
(`~/.claude/CLAUDE.md` + les 4 agents globaux advisor/advisor-marché/lecture-advisor/validateur ; `advisorModel`
settings.json était déjà 5.1). **Carve-out Kraidle levé** (ADR-ROSTER 2026-09-01 amendé). Prise d'effet des
définitions d'agent = **redémarrage de session**. La divergence notée au Gate-0 ci-dessus est donc **résolue**
(plus de split : tous les projets = Fable 5.1 ; workers Opus 4.8 et lecteurs Sonnet 5 inchangés).
